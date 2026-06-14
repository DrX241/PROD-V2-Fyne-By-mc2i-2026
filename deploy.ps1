#!/usr/bin/env pwsh
# Script de deploiement automatique FYNE -> AWS
# Usage: .\deploy.ps1 [-SkipBuild] [-SkipPush] [-SkipGit] [-Tag "v1.2.3"]

param(
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$SkipGit,
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

# CONFIG
$AWS_PROFILE    = "mc2i-fyne"
$AWS_REGION     = "eu-west-3"
$AWS_ACCOUNT_ID = "845145401592"
$ECR_REPO       = "fyne-app"
$EC2_INSTANCE   = "i-0e9e693a42f252889"
$APP_DIR        = "/var/www/fyne"
$PM2_APP        = "fyne-app"
$ECR_IMAGE      = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:${Tag}"

function Write-Step([string]$msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Write-OK([string]$msg) {
    Write-Host "    OK: $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "    ERREUR: $msg" -ForegroundColor Red
    exit 1
}

function Wait-SSMCommand([string]$cmdId) {
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 3
        $prevEAP = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $status = aws ssm get-command-invocation `
            --profile $AWS_PROFILE --region $AWS_REGION `
            --command-id $cmdId --instance-id $EC2_INSTANCE `
            --query "Status" --output text 2>&1
        $ErrorActionPreference = $prevEAP
        if ($status -eq "Success") { return $true }
        if ($status -eq "Failed" -or $status -eq "Cancelled") { return $false }
    }
    return $false
}

function Invoke-SSMCommand([string[]]$commands) {
    $jsonFile = [System.IO.Path]::GetTempFileName() + ".json"
    $cmdsJson = ($commands | ForEach-Object { "`"$($_ -replace '"','\"')`"" }) -join ","
    $jsonContent = "{`n  `"InstanceIds`": [`"$EC2_INSTANCE`"],`n  `"DocumentName`": `"AWS-RunShellScript`",`n  `"Parameters`": { `"commands`": [$cmdsJson] }`n}"
    [System.IO.File]::WriteAllText($jsonFile, $jsonContent, (New-Object System.Text.UTF8Encoding $false))

    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $cmdId = aws ssm send-command `
        --profile $AWS_PROFILE --region $AWS_REGION `
        --cli-input-json "file://$($jsonFile.Replace('\','/'))" `
        --query "Command.CommandId" --output text 2>&1
    $ssmExit = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP
    if ($ssmExit -ne 0) { Write-Fail "aws ssm send-command a echoue (exit $ssmExit)" }

    Remove-Item $jsonFile -ErrorAction SilentlyContinue

    if (-not (Wait-SSMCommand $cmdId)) {
        $env:PYTHONUTF8 = "1"
        $out = aws ssm get-command-invocation `
            --profile $AWS_PROFILE --region $AWS_REGION `
            --command-id $cmdId --instance-id $EC2_INSTANCE `
            --query "StandardErrorContent" --output text 2>&1
        Write-Fail "Commande SSM echouee ($cmdId): $out"
    }
    return $cmdId
}

# 0. GIT PUSH -> GITHUB
if (-not $SkipGit) {
    Write-Step "Push sources vers GitHub (DrX241/PROD-V2-Fyne-By-mc2i-2026)"
    $gitDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ErrorActionPreference = "Continue"
    git -C $gitDir add -A
    $commitMsg = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm') - tag $Tag"
    git -C $gitDir commit -m $commitMsg 2>&1 | Out-Null
    git -C $gitDir push origin main 2>&1 | Out-Null
    $gitExit = $LASTEXITCODE
    $ErrorActionPreference = "Stop"
    if ($gitExit -ne 0) {
        Write-Host "    WARN: git push GitHub a echoue (exit $gitExit) - poursuite du deploiement" -ForegroundColor Yellow
    } else {
        Write-OK "Sources pushees sur github.com/DrX241/PROD-V2-Fyne-By-mc2i-2026"
    }
}

# 1. BUILD DOCKER
if (-not $SkipBuild) {
    Write-Step "Build Docker image (tag: $Tag)"
    $buildArgs = @("build", "--no-cache", "-t", "${ECR_REPO}:${Tag}")
    if ($Tag -ne "latest") { $buildArgs += @("-t", "${ECR_REPO}:latest") }
    $buildArgs += "."
    $ErrorActionPreference = "Continue"
    & docker @buildArgs
    $buildExit = $LASTEXITCODE
    $ErrorActionPreference = "Stop"
    if ($buildExit -ne 0) { Write-Fail "docker build a echoue" }
    Write-OK "Image construite : ${ECR_REPO}:${Tag}"
}

# 2. LOGIN ECR + PUSH
if (-not $SkipPush) {
    Write-Step "Push vers ECR"

    $ecrPassword = aws ecr get-login-password --profile $AWS_PROFILE --region $AWS_REGION
    if ($LASTEXITCODE -ne 0) { Write-Fail "Impossible de recuperer le token ECR" }
    $ecrRegistry = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    $loginOut = $ecrPassword | docker login --username AWS --password-stdin $ecrRegistry 2>&1
    $loginExit = $LASTEXITCODE
    if ($loginExit -ne 0) { Write-Fail "ECR login echoue: $loginOut" }
    Write-OK "Connecte a ECR"

    $ErrorActionPreference = "Continue"
    docker tag "${ECR_REPO}:${Tag}" $ECR_IMAGE
    docker push $ECR_IMAGE
    $pushExit = $LASTEXITCODE
    $ErrorActionPreference = "Stop"
    if ($pushExit -ne 0) { Write-Fail "docker push a echoue" }
    if ($Tag -ne "latest") {
        $ErrorActionPreference = "Continue"
        docker tag "${ECR_REPO}:${Tag}" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:latest"
        docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:latest"
        $ErrorActionPreference = "Stop"
    }
    Write-OK "Image pushee : $ECR_IMAGE"
}

# 3. DEPLOIEMENT SUR EC2
Write-Step "Deploiement sur EC2 ($EC2_INSTANCE)"

Write-Host "    Login ECR depuis EC2..."
Invoke-SSMCommand @(
    "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com 2>&1"
) | Out-Null

Write-Host "    Pull image $ECR_IMAGE..."
Invoke-SSMCommand @("docker pull $ECR_IMAGE 2>&1") | Out-Null
Write-OK "Image pullee sur EC2"

Write-Host "    Extraction du build + redemarrage PM2..."
$deployScript = @(
    "set -e",
    "TMPDIR=`$(mktemp -d)",
    "docker create --name fyne-extract $ECR_IMAGE",
    "docker cp fyne-extract:/app/dist `$TMPDIR/dist",
    "docker rm fyne-extract",
    "cp -r $APP_DIR/node_modules `$TMPDIR/node_modules 2>/dev/null || true",
    "rsync -a --delete `$TMPDIR/dist/ $APP_DIR/dist/",
    "rm -rf `$TMPDIR",
    "pm2 restart $PM2_APP --update-env",
    "echo DEPLOY_OK"
)
Invoke-SSMCommand $deployScript | Out-Null
Write-OK "PM2 redemarre"

# 4. VERIFICATION
Write-Step "Verification sante de l'application"
Start-Sleep -Seconds 5
$checkId = Invoke-SSMCommand @("pm2 show $PM2_APP 2>&1 | grep -E 'status|uptime|restarts' | head -5")
$env:PYTHONUTF8 = "1"
$statusOut = aws ssm get-command-invocation `
    --profile $AWS_PROFILE --region $AWS_REGION `
    --command-id $checkId --instance-id $EC2_INSTANCE `
    --query "StandardOutputContent" --output text 2>&1
Write-Host $statusOut -ForegroundColor White

Write-Host "`n==> Deploiement termine avec succes! Image: $ECR_IMAGE" -ForegroundColor Green
