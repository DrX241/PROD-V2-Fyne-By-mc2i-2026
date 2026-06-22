import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

function requireAdminOrAbove(req: Request, res: Response, next: any) {
  const user = (req.session as any).user;
  if (!user || !['superadmin', 'admin', 'maker'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Réservé aux admins' });
  }
  next();
}

// POST /api/modules/:id/publish
// body: { companyIds: number[] }
router.post('/:id/publish', requireAdminOrAbove, async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  const moduleId = parseInt(req.params.id);
  const { companyIds } = req.body as { companyIds: number[] };
  if (!Array.isArray(companyIds) || companyIds.length === 0) {
    return res.status(400).json({ success: false, message: 'companyIds requis' });
  }
  try {
    await pool.query('UPDATE custom_modules SET is_published = true WHERE id = $1', [moduleId]);
    for (const companyId of companyIds) {
      await pool.query(
        `INSERT INTO module_company_assignments (module_id, company_id, assigned_by)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [moduleId, companyId, user.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[ModulePublish] publish:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE /api/modules/:id/companies/:companyId
router.delete('/:id/companies/:companyId', requireAdminOrAbove, async (req: Request, res: Response) => {
  const moduleId = parseInt(req.params.id);
  const companyId = parseInt(req.params.companyId);
  try {
    await pool.query(
      'DELETE FROM module_company_assignments WHERE module_id = $1 AND company_id = $2',
      [moduleId, companyId]
    );
    // Si plus aucune assignation, dépublier
    const remaining = await pool.query(
      'SELECT COUNT(*) FROM module_company_assignments WHERE module_id = $1',
      [moduleId]
    );
    if (parseInt(remaining.rows[0].count, 10) === 0) {
      await pool.query('UPDATE custom_modules SET is_published = false WHERE id = $1', [moduleId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[ModulePublish] unassign:', err);
    res.status(500).json({ success: false });
  }
});

// GET /api/modules/assigned
// Note: this route must be declared BEFORE /:id routes to avoid being shadowed
router.get('/assigned', async (req: Request, res: Response) => {
  const user = (req.session as any).user;
  if (!user) return res.status(401).json({ success: false });
  if (!user.companyId) return res.json({ success: true, modules: [] });
  try {
    const result = await pool.query(
      `SELECT cm.id, cm.name, cm.domain, cm.description, cm.icon_path, cm.difficulty,
              cm.gamification_level, cm.learning_style, cm.created_at
       FROM custom_modules cm
       JOIN module_company_assignments mca ON mca.module_id = cm.id
       WHERE mca.company_id = $1 AND cm.is_published = true AND cm.is_active = true
       ORDER BY mca.assigned_at DESC`,
      [user.companyId]
    );
    res.json({ success: true, modules: result.rows });
  } catch (err) {
    console.error('[ModulePublish] assigned:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
