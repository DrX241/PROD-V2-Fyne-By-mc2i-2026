# FYNE — CLAUDE.md

## Project
Full-stack TypeScript application: Express + React + Drizzle ORM + PostgreSQL.
Deployed on AWS EC2 (PM2), static dist served from `/var/www/fyne/dist/`.

## Stack
- **Backend**: Node.js / Express / TypeScript / Drizzle ORM / PostgreSQL (AWS RDS)
- **Frontend**: React / Vite / Tailwind CSS / shadcn-ui / Wouter / Framer Motion
- **Auth**: Express sessions + bcryptjs + OIDC/PKCE (SSO)
- **Infra**: EC2 `i-0e9e693a42f252889` · ECR `845145401592.dkr.ecr.eu-west-3.amazonaws.com/fyne-app` · S3 `fyne-deploy-845145401592` · Region `eu-west-3`
- **Deploy**: `.\deploy.ps1` — builds Docker, pushes to ECR, deploys via SSM

## Design direction
Industrial / enterprise SaaS — think AWS Console, Azure Portal, Datadog.
Dark background (`#0f1117`), monospace (`DM Mono`) for data/labels, sans-serif (`DM Sans`) for prose.
Sharp edges, no border-radius softness, no purple gradients, no Inter.
Color palette: deep navy bg · `#0057ff` accent · `#00c781` green · `#f6ab2f` amber · `#ff3b4e` red.

## Skills
Skills are installed globally in `~/.claude/skills/` (disponibles dans tous les projets).
frontend-design · theme-factory · web-artifacts-builder · brand-guidelines · pdf · xlsx · pptx · docx · claude-api · mcp-builder · webapp-testing · canvas-design · algorithmic-art · doc-coauthoring · internal-comms · skill-creator · slack-gif-creator
