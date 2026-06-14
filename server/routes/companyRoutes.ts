import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

function requireSuperAdmin(req: Request, res: Response, next: any) {
  const user = (req.session as any).user;
  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Réservé au superadmin' });
  }
  next();
}

function requireAdminOrAbove(req: Request, res: Response, next: any) {
  const user = (req.session as any).user;
  if (!user || !['superadmin', 'admin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Réservé aux admins' });
  }
  next();
}

// GET /api/companies — liste toutes les companies (superadmin) ou la sienne (admin)
router.get('/', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  try {
    let result;
    if (user.role === 'superadmin') {
      result = await pool.query(`
        SELECT c.*, COUNT(u.id) AS user_count
        FROM companies c
        LEFT JOIN users u ON u.company_id = c.id
        GROUP BY c.id ORDER BY c.created_at DESC
      `);
    } else {
      result = await pool.query(
        `SELECT c.*, COUNT(u.id) AS user_count
         FROM companies c
         LEFT JOIN users u ON u.company_id = c.id
         WHERE c.id = $1 GROUP BY c.id`,
        [user.companyId]
      );
    }
    res.json({ success: true, companies: result.rows });
  } catch (err) {
    console.error('[Companies] list:', err);
    res.status(500).json({ success: false });
  }
});

// POST /api/companies — créer une company (superadmin)
router.post('/', requireSuperAdmin, async (req: Request, res: Response) => {
  const { name, slug, logoUrl, primaryColor, secondaryColor, modulesEnabled } = req.body;
  if (!name || !slug) return res.status(400).json({ success: false, message: 'name et slug requis' });
  try {
    const result = await pool.query(
      `INSERT INTO companies (name, slug, logo_url, primary_color, secondary_color, modules_enabled)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, slug, logoUrl || null, primaryColor || '#0057ff', secondaryColor || '#10b981', JSON.stringify(modulesEnabled || [])]
    );
    res.json({ success: true, company: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Ce slug existe déjà' });
    console.error('[Companies] create:', err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/companies/:id — modifier une company
router.patch('/:id', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const id = parseInt(req.params.id);
  if (user.role !== 'superadmin' && user.companyId !== id) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }
  const { name, logoUrl, primaryColor, secondaryColor, modulesEnabled, isActive } = req.body;
  try {
    const result = await pool.query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        logo_url = COALESCE($2, logo_url),
        primary_color = COALESCE($3, primary_color),
        secondary_color = COALESCE($4, secondary_color),
        modules_enabled = COALESCE($5, modules_enabled),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [name, logoUrl, primaryColor, secondaryColor, modulesEnabled ? JSON.stringify(modulesEnabled) : null, isActive, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, company: result.rows[0] });
  } catch (err) {
    console.error('[Companies] update:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE /api/companies/:id — supprimer une company (superadmin)
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('UPDATE users SET company_id = NULL WHERE company_id = $1', [id]);
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[Companies] delete:', err);
    res.status(500).json({ success: false });
  }
});

// GET /api/companies/:id/users — liste les users d'une company
router.get('/:id/users', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const id = parseInt(req.params.id);
  if (user.role !== 'superadmin' && user.companyId !== id) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, role, is_active,
              score, exercices_realises, taux_reussite, niveau, badges, last_login, created_at
       FROM users WHERE company_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('[Companies] list users:', err);
    res.status(500).json({ success: false });
  }
});

// POST /api/companies/:id/users — créer un user dans une company
router.post('/:id/users', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const companyId = parseInt(req.params.id);
  if (user.role !== 'superadmin' && user.companyId !== companyId) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }
  const { username, email, password, firstName, lastName, role } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'username et password requis' });
  const allowedRoles = user.role === 'superadmin' ? ['superadmin', 'admin', 'maker', 'user'] : ['maker', 'user'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, message: 'Rôle non autorisé' });
  }
  try {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role, company_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id, username, email, first_name, last_name, role, is_active, created_at`,
      [username, email || null, hashed, firstName || null, lastName || null, role || 'user', companyId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Username ou email déjà utilisé' });
    console.error('[Companies] create user:', err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/companies/:id/users/:userId — modifier un user
router.patch('/:id/users/:userId', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const companyId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  if (user.role !== 'superadmin' && user.companyId !== companyId) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }
  const { role, isActive, firstName, lastName } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
        role = COALESCE($1, role),
        is_active = COALESCE($2, is_active),
        first_name = COALESCE($3, first_name),
        last_name = COALESCE($4, last_name),
        updated_at = now()
       WHERE id = $5 AND company_id = $6 RETURNING id, username, email, role, is_active`,
      [role, isActive, firstName, lastName, userId, companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('[Companies] update user:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE /api/companies/:id/users/:userId — supprimer un user
router.delete('/:id/users/:userId', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const companyId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  if (user.role !== 'superadmin' && user.companyId !== companyId) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }
  if (user.id === userId) return res.status(400).json({ success: false, message: 'Impossible de se supprimer soi-même' });
  try {
    await pool.query('DELETE FROM users WHERE id = $1 AND company_id = $2', [userId, companyId]);
    res.json({ success: true });
  } catch (err) {
    console.error('[Companies] delete user:', err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/companies/kpi/me — mettre à jour ses propres KPI
router.patch('/kpi/me', async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  if (!user) return res.status(401).json({ success: false });
  const { score, exercicesRealises, tauxReussite, niveau, badges } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
        score = COALESCE($1, score),
        exercices_realises = COALESCE($2, exercices_realises),
        taux_reussite = COALESCE($3, taux_reussite),
        niveau = COALESCE($4, niveau),
        badges = COALESCE($5, badges),
        updated_at = now()
       WHERE id = $6 RETURNING score, exercices_realises, taux_reussite, niveau, badges`,
      [score, exercicesRealises, tauxReussite, niveau, badges, user.id]
    );
    res.json({ success: true, kpi: result.rows[0] });
  } catch (err) {
    console.error('[KPI] update:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
