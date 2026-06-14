import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';

const router = Router();

function requireSuperAdmin(req: Request, res: Response, next: any) {
  const user = (req.session as any).user;
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Accès réservé au super administrateur' });
  }
  next();
}

router.use(requireSuperAdmin);

// ─── COMPANIES ────────────────────────────────────────────────────────────────

// GET /api/admin/client-companies
router.get('/client-companies', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT cc.*,
        COUNT(cu.id) FILTER (WHERE cu.is_active) AS active_users,
        COUNT(cu.id) AS total_users
      FROM client_companies cc
      LEFT JOIN client_users cu ON cu.company_id = cc.id
      GROUP BY cc.id
      ORDER BY cc.created_at DESC
    `);
    res.json({ success: true, companies: result.rows });
  } catch (err) {
    console.error('[mgmt] list companies error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/admin/client-companies
router.post('/client-companies', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Nom requis' });
  }
  const slug = name.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const createdBy = (req.session as any).user?.id ?? null;
  try {
    const result = await pool.query(
      `INSERT INTO client_companies (name, slug, is_active, created_by)
       VALUES ($1, $2, true, $3) RETURNING *`,
      [name.trim(), slug, createdBy]
    );
    res.json({ success: true, company: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ce nom (ou slug) existe déjà' });
    }
    console.error('[mgmt] create company error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/admin/client-companies/:id/toggle
router.patch('/client-companies/:id/toggle', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE client_companies SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 RETURNING is_active`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, isActive: result.rows[0].is_active });
  } catch (err) {
    console.error('[mgmt] toggle company error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/client-companies/:id
router.delete('/client-companies/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM client_users WHERE company_id = $1', [req.params.id]);
    await pool.query('DELETE FROM client_companies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[mgmt] delete company error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─── USERS ────────────────────────────────────────────────────────────────────

// GET /api/admin/client-users?companyId=X
router.get('/client-users', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ success: false, message: 'companyId requis' });
  try {
    const result = await pool.query(
      `SELECT id, company_id, email, first_name, last_name, role, is_active,
              score, exercices_realises, taux_reussite, niveau, badges, last_login, created_at,
              token_quota, token_used_month, modules_enabled
       FROM client_users WHERE company_id = $1 ORDER BY created_at DESC`,
      [companyId]
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('[mgmt] list users error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/admin/client-users
router.post('/client-users', async (req: Request, res: Response) => {
  const { companyId, email, password, firstName, lastName, role } = req.body;
  if (!companyId || !email || !password) {
    return res.status(400).json({ success: false, message: 'companyId, email et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6 caractères)' });
  }
  const createdBy = (req.session as any).user?.id ?? null;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO client_users (company_id, email, password, first_name, last_name, role, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING id, company_id, email, first_name, last_name, role, is_active, created_at`,
      [companyId, email.toLowerCase().trim(), hash, firstName?.trim() || null, lastName?.trim() || null, role || 'user', createdBy]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Cet email existe déjà' });
    }
    console.error('[mgmt] create user error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/admin/client-users/:id/toggle
router.patch('/client-users/:id/toggle', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE client_users SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 RETURNING is_active`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, isActive: result.rows[0].is_active });
  } catch (err) {
    console.error('[mgmt] toggle user error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/admin/client-users/:id/reset-password
router.post('/client-users/:id/reset-password', async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Mot de passe trop court' });
  }
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE client_users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [hash, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true });
  } catch (err) {
    console.error('[mgmt] reset password error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/client-users/:id
router.delete('/client-users/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM client_users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[mgmt] delete user error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/admin/client-companies/:id/config — modules + quota superadmin
router.patch('/client-companies/:id/config', async (req: Request, res: Response) => {
  const { modules_enabled, token_quota } = req.body;
  try {
    const result = await pool.query(
      `UPDATE client_companies SET modules_enabled = $1, token_quota = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [modules_enabled, token_quota, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, company: result.rows[0] });
  } catch (err) {
    console.error('[mgmt] config company error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
