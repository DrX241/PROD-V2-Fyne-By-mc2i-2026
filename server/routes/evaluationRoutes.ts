import { Router } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import pg from 'pg';
const { Pool } = pg;

const router = Router();
const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

// ── DB pool (AWS RDS PostgreSQL) ─────────────────────────────────────────────
let pool: InstanceType<typeof Pool> | null = null;
function getPool(): InstanceType<typeof Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (err) => console.error('[evaluation-pool]', err.message));
  }
  return pool;
}

async function dbQuery(sql: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

// ── Password utils ─────────────────────────────────────────────────────────────
async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const buf = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  if (buf.length !== storedBuf.length) return false;
  return timingSafeEqual(buf, storedBuf);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normType(v: any): string {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'python') return 'python';
  if (s === 'qcm') return 'qcm';
  if (s === 'english') return 'english';
  return 'sql';
}

function normTests(v: any, fallback?: any): string[] {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  const mapped = raw.map(normType).filter((i: string, idx: number, arr: string[]) => arr.indexOf(i) === idx);
  if (mapped.length > 0) return mapped;
  if (fallback != null) return [normType(fallback)];
  return ['sql'];
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUTEUR
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/evaluation/recruiter/me — auto-login pour les utilisateurs avec role=evaluateur
router.get('/recruiter/me', async (req, res) => {
  try {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Non connecté.' });
    if (sessionUser.role !== 'evaluateur' && sessionUser.role !== 'admin' && sessionUser.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Rôle insuffisant.' });

    const recruiterId = `fyne_${sessionUser.username}`;
    const displayName = [sessionUser.firstName, sessionUser.lastName].filter(Boolean).join(' ') || sessionUser.username;

    // Crée le compte évaluateur s'il n'existe pas encore
    const { rows } = await dbQuery(
      `INSERT INTO sql_challenge_recruiters (id, name, password)
       VALUES ($1, $2, '')
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name`,
      [recruiterId, displayName],
    );
    res.json({ success: true, recruiter: { id: rows[0].id, name: rows[0].name } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/evaluation/recruiter/register
router.post('/recruiter/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name?.trim() || !password?.trim())
      return res.status(400).json({ success: false, message: 'Nom et mot de passe requis.' });
    const id = 'rec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const hashed = await hashPassword(password.trim());
    const { rows } = await dbQuery(
      `INSERT INTO sql_challenge_recruiters (id, name, password) VALUES ($1, $2, $3) RETURNING id, name`,
      [id, name.trim(), hashed],
    );
    res.status(201).json({ success: true, recruiter: rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/evaluation/recruiter/login
router.post('/recruiter/login', async (req, res) => {
  try {
    const { recruiterId } = req.body;
    if (!recruiterId?.trim())
      return res.status(400).json({ success: false, message: 'Identifiant requis.' });
    const { rows } = await dbQuery(
      `SELECT id, name FROM sql_challenge_recruiters WHERE id = $1`,
      [recruiterId.trim()],
    );
    if (!rows[0]) return res.status(403).json({ success: false, message: 'Identifiant inconnu.' });
    res.json({ success: true, recruiter: { id: rows[0].id, name: rows[0].name } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/evaluation/recruiter/candidates?recruiterId=xxx
router.get('/recruiter/candidates', async (req, res) => {
  try {
    const recruiterId = String(req.query.recruiterId || '').trim();
    if (!recruiterId) return res.status(400).json({ success: false, message: 'recruiterId requis.' });
    const { rows: rec } = await dbQuery(`SELECT id FROM sql_challenge_recruiters WHERE id = $1`, [recruiterId]);
    if (!rec[0]) return res.status(403).json({ success: false, message: 'Recruteur inconnu.' });
    const { rows } = await dbQuery(
      `SELECT * FROM sql_challenge_candidates WHERE recruiter_id = $1 ORDER BY created_at DESC`,
      [recruiterId],
    );
    res.json({
      success: true,
      candidates: rows.map(c => ({
        id: c.id, name: c.name,
        assigned_tests: normTests(c.assigned_tests, c.challenge_type),
        challenge_type: normTests(c.assigned_tests, c.challenge_type)[0],
        access_granted: c.access_granted, created_at: c.created_at,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/evaluation/recruiter/candidates
router.post('/recruiter/candidates', async (req, res) => {
  try {
    const { recruiterId, id, name, password, assignedTests, challengeType } = req.body;
    const at = normTests(assignedTests, challengeType);
    const ct = at[0];
    if (!recruiterId || !id || !name || !password)
      return res.status(400).json({ success: false, message: 'recruiterId, id, name et password requis.' });
    const { rows: rec } = await dbQuery(`SELECT id FROM sql_challenge_recruiters WHERE id = $1`, [recruiterId]);
    if (!rec[0]) return res.status(403).json({ success: false, message: 'Recruteur inconnu.' });
    const { rows: existing } = await dbQuery(`SELECT id FROM sql_challenge_candidates WHERE id = $1`, [id.toLowerCase()]);
    if (existing[0]) return res.status(409).json({ success: false, message: `L'identifiant "${id}" est déjà utilisé.` });
    const hashed = await hashPassword(password);
    const { rows } = await dbQuery(
      `INSERT INTO sql_challenge_candidates (id, name, password, recruiter_id, challenge_type, assigned_tests, access_granted)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,false) RETURNING *`,
      [id.toLowerCase(), name, hashed, recruiterId, ct, JSON.stringify(at)],
    );
    const c = rows[0];
    res.status(201).json({
      success: true,
      candidate: { id: c.id, name: c.name, challenge_type: ct, assigned_tests: at, access_granted: c.access_granted, created_at: c.created_at },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/evaluation/recruiter/candidates/:id/access
router.patch('/recruiter/candidates/:id/access', async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { recruiterId, accessGranted } = req.body;
    const { rows } = await dbQuery(
      `UPDATE sql_challenge_candidates SET access_granted = $1 WHERE id = $2 AND recruiter_id = $3 RETURNING *`,
      [!!accessGranted, candidateId, recruiterId],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Candidat introuvable.' });
    res.json({ success: true, candidate: rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/evaluation/recruiter/candidates/:id/environment
router.patch('/recruiter/candidates/:id/environment', async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { recruiterId, assignedTests } = req.body;
    if (!recruiterId) return res.status(400).json({ success: false, message: 'recruiterId requis.' });
    const at = normTests(assignedTests);
    const { rows } = await dbQuery(
      `UPDATE sql_challenge_candidates SET assigned_tests = $1::jsonb, challenge_type = $2 WHERE id = $3 AND recruiter_id = $4 RETURNING *`,
      [JSON.stringify(at), at[0], candidateId, recruiterId],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Candidat introuvable.' });
    res.json({ success: true, candidate: rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/evaluation/recruiter/candidates/:id
router.delete('/recruiter/candidates/:id', async (req, res) => {
  try {
    const { recruiterId } = req.body;
    await dbQuery(`DELETE FROM sql_challenge_candidates WHERE id = $1 AND recruiter_id = $2`, [req.params.id, recruiterId]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/evaluation/recruiter/results?recruiterId=xxx
router.get('/recruiter/results', async (req, res) => {
  try {
    const recruiterId = String(req.query.recruiterId || '').trim();
    if (!recruiterId) return res.status(400).json({ success: false, message: 'recruiterId requis.' });
    const { rows } = await dbQuery(
      `SELECT r.* FROM sql_challenge_results r
       INNER JOIN sql_challenge_candidates c ON c.id = r.candidate_id
       WHERE r.recruiter_id = $1 ORDER BY r.submitted_at DESC, r.id DESC`,
      [recruiterId],
    );
    res.json({ success: true, results: rows });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDAT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/evaluation/candidate/login
router.post('/candidate/login', async (req, res) => {
  try {
    const { candidateId, password } = req.body;
    if (!candidateId?.trim() || !password?.trim())
      return res.status(400).json({ success: false, message: 'Identifiant et mot de passe requis.' });
    const { rows } = await dbQuery(`SELECT * FROM sql_challenge_candidates WHERE id = $1`, [candidateId.trim().toLowerCase()]);
    const cand = rows[0];
    const ok = cand && await verifyPassword(password.trim(), cand.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    if (!cand.access_granted)
      return res.status(403).json({ success: false, message: "Accès non autorisé. Votre recruteur ne vous a pas encore donné accès à ce test." });
    res.json({
      success: true,
      candidate: {
        id: cand.id, name: cand.name, recruiterId: cand.recruiter_id,
        challengeType: normType(cand.challenge_type),
        assignedTests: normTests(cand.assigned_tests, cand.challenge_type),
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX SQL (tables temporaires en mémoire)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/sql-sandbox', async (req, res) => {
  const startedAt = Date.now();
  const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  if (!rawQuery) return res.status(400).json({ success: false, message: 'Requête SQL requise.' });

  const normalized = rawQuery.replace(/^\s*(--[^\n]*\n\s*)+/, '').trim().toLowerCase();
  if (!normalized.startsWith('select') && !normalized.startsWith('with'))
    return res.status(400).json({ success: false, message: 'Seules les requêtes SELECT / WITH sont autorisées.' });

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE users (id INT PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, is_active BOOLEAN NOT NULL) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE failed_logins (id INT PRIMARY KEY, user_id INT NULL, ip TEXT NOT NULL, attempted_at TIMESTAMP NOT NULL) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE firewall_events (id INT PRIMARY KEY, src_ip TEXT NOT NULL, action TEXT NOT NULL, happened_at TIMESTAMP NOT NULL) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE vulnerabilities (id INT PRIMARY KEY, cve_id TEXT NOT NULL, host TEXT NOT NULL, severity TEXT NOT NULL, status TEXT NOT NULL, discovered_at TIMESTAMP NOT NULL) ON COMMIT DROP`);
    await client.query(`INSERT INTO users VALUES (1,'admin.root','root@mc2i.local','admin',true),(2,'admin.soc','soc@mc2i.local','admin',true),(3,'analyst.jade','jade@mc2i.local','analyst',true),(4,'ops.ken','ken@mc2i.local','operator',false),(5,'dev.ana','ana@mc2i.local','developer',true)`);
    await client.query(`INSERT INTO failed_logins VALUES (1,1,'192.168.10.7',NOW()-INTERVAL '30 hours'),(2,1,'10.0.0.12',NOW()-INTERVAL '5 hours'),(3,2,'10.0.0.12',NOW()-INTERVAL '4 hours'),(4,2,'10.0.0.12',NOW()-INTERVAL '3 hours'),(5,3,'172.16.1.20',NOW()-INTERVAL '2 hours'),(6,3,'172.16.1.20',NOW()-INTERVAL '90 minutes'),(7,3,'172.16.1.20',NOW()-INTERVAL '75 minutes'),(8,NULL,'203.0.113.8',NOW()-INTERVAL '40 minutes'),(9,1,'203.0.113.8',NOW()-INTERVAL '20 minutes'),(10,5,'198.51.100.4',NOW()-INTERVAL '10 minutes')`);
    await client.query(`INSERT INTO firewall_events VALUES (1,'10.0.0.12','BLOCK',NOW()-INTERVAL '3 hours'),(2,'10.0.0.12','DROP',NOW()-INTERVAL '2 hours'),(3,'172.16.1.20','ALLOW',NOW()-INTERVAL '2 hours'),(4,'203.0.113.8','BLOCK',NOW()-INTERVAL '30 minutes'),(5,'198.51.100.4','ALLOW',NOW()-INTERVAL '10 minutes')`);
    await client.query(`INSERT INTO vulnerabilities VALUES (1,'CVE-2024-0001','srv-app-01','critical','open',NOW()-INTERVAL '10 days'),(2,'CVE-2024-0002','srv-app-01','high','open',NOW()-INTERVAL '8 days'),(3,'CVE-2024-0003','srv-app-02','critical','open',NOW()-INTERVAL '6 days'),(4,'CVE-2024-0004','srv-app-02','medium','open',NOW()-INTERVAL '5 days'),(5,'CVE-2024-0005','srv-db-01','critical','patched',NOW()-INTERVAL '12 days'),(6,'CVE-2024-0006','srv-db-01','high','open',NOW()-INTERVAL '4 days'),(7,'CVE-2024-0007','srv-web-01','critical','open',NOW()-INTERVAL '2 days'),(8,'CVE-2024-0008','srv-web-01','high','open',NOW()-INTERVAL '36 hours')`);
    const result = await client.query(rawQuery);
    await client.query('ROLLBACK');
    const columns = result.fields?.map((f: any) => f.name) ?? [];
    res.json({ success: true, columns, rows: result.rows ?? [], rowCount: result.rowCount ?? 0, durationMs: Date.now() - startedAt });
  } catch (error: any) {
    try { await client.query('ROLLBACK'); } catch {}
    res.status(400).json({ success: false, message: error?.message || 'Erreur SQL.', durationMs: Date.now() - startedAt });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RÉSULTATS
// ─────────────────────────────────────────────────────────────────────────────

router.post('/results', async (req, res) => {
  try {
    const { candidateId, recruiterId, score, totalExercises, timeSeconds, exercisesDetail, earlyQuit, challengeType } = req.body;
    if (!candidateId || !recruiterId)
      return res.status(400).json({ success: false, message: 'candidateId et recruiterId requis.' });
    const normCandId = String(candidateId).trim().toLowerCase();
    const normRecId = String(recruiterId).trim();
    const { rows: cands } = await dbQuery(
      `SELECT * FROM sql_challenge_candidates WHERE id = $1 AND recruiter_id = $2`,
      [normCandId, normRecId],
    );
    if (!cands[0]) return res.status(404).json({ success: false, message: 'Candidat introuvable.' });
    const assignedTests = normTests(cands[0].assigned_tests, cands[0].challenge_type);
    const requestedType = normType(challengeType);
    const ct = assignedTests.includes(requestedType) ? requestedType : assignedTests[0];
    await dbQuery(
      `INSERT INTO sql_challenge_results (candidate_id, candidate_name, recruiter_id, challenge_type, score, total_exercises, time_seconds, exercises_detail, early_quit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [normCandId, cands[0].name, normRecId, ct, score ?? 0, totalExercises ?? 15, timeSeconds ?? 0, JSON.stringify(exercisesDetail ?? []), !!earlyQuit],
    );
    const remainingTests = assignedTests.filter((t: string) => t !== ct);
    await dbQuery(
      `UPDATE sql_challenge_candidates SET assigned_tests = $1::jsonb, access_granted = CASE WHEN $2 = 0 THEN false ELSE access_granted END WHERE id = $3 AND recruiter_id = $4`,
      [JSON.stringify(remainingTests), remainingTests.length, normCandId, normRecId],
    );
    res.json({ success: true, message: 'Résultats enregistrés.', remainingTests });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX PYTHON (via code execution)
// ─────────────────────────────────────────────────────────────────────────────
import { exec } from 'child_process';
import { promisify as promisifyUtil } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
const execAsync = promisifyUtil(exec);

router.post('/python-sandbox', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code vide.' });
  const tmpFile = path.join(os.tmpdir(), `eval_py_${Date.now()}.py`);
  fs.writeFileSync(tmpFile, code);
  const start = Date.now();
  try {
    const { stdout, stderr } = await execAsync(`python3 "${tmpFile}"`, { timeout: 10000 });
    res.json({ success: true, output: stdout.trim(), stderr: stderr.trim(), durationMs: Date.now() - start });
  } catch (e: any) {
    res.json({ success: false, output: '', stderr: e.stderr || e.message, durationMs: Date.now() - start });
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
});

export default router;
