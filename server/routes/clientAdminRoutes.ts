import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireClientAuth } from './clientAuthRoutes';

const router = Router();

function requireClientAdmin(req: Request, res: Response, next: any) {
  const cu = (req.session as any).clientUser;
  if (!cu || cu.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Réservé à l'admin client" });
  }
  next();
}

// GET /api/client/admin/users — liste les users de son entreprise
router.get('/users', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active,
              score, niveau, token_quota, token_used_month, last_login, modules_enabled
       FROM client_users WHERE company_id = $1 ORDER BY created_at DESC`,
      [cu.companyId]
    );
    // quota total entreprise
    const comp = await pool.query(
      'SELECT token_quota, token_used_month, modules_enabled FROM client_companies WHERE id = $1',
      [cu.companyId]
    );
    res.json({ success: true, users: result.rows, company: comp.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/client/admin/users/:id/quota
router.patch('/users/:id/quota', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { token_quota } = req.body;
  try {
    // vérifier que l'user appartient à la même entreprise
    const check = await pool.query('SELECT company_id FROM client_users WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0 || check.rows[0].company_id !== cu.companyId) {
      return res.status(403).json({ success: false, message: 'Interdit' });
    }
    await pool.query('UPDATE client_users SET token_quota = $1 WHERE id = $2', [token_quota, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/client/admin/users/:id/modules
router.patch('/users/:id/modules', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { modules_enabled } = req.body; // array ou null
  try {
    // vérifier même entreprise
    const check = await pool.query('SELECT company_id FROM client_users WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0 || check.rows[0].company_id !== cu.companyId) {
      return res.status(403).json({ success: false, message: 'Interdit' });
    }
    // vérifier que les modules sont dans company.modules_enabled
    const comp = await pool.query('SELECT modules_enabled FROM client_companies WHERE id = $1', [cu.companyId]);
    const allowed: string[] = comp.rows[0]?.modules_enabled ?? [];
    const filtered = modules_enabled === null ? null : (modules_enabled as string[]).filter((m: string) => allowed.includes(m));
    await pool.query('UPDATE client_users SET modules_enabled = $1 WHERE id = $2', [filtered, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/client/admin/users/:id/toggle
router.patch('/users/:id/toggle', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const check = await pool.query('SELECT company_id FROM client_users WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0 || check.rows[0].company_id !== cu.companyId) {
      return res.status(403).json({ success: false, message: 'Interdit' });
    }
    const result = await pool.query(
      'UPDATE client_users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
      [req.params.id]
    );
    res.json({ success: true, isActive: result.rows[0].is_active });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
