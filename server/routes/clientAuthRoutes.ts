import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';

const router = Router();

// POST /api/client/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const result = await pool.query(
      `SELECT cu.*, cc.name as company_name, cc.slug as company_slug
       FROM client_users cu
       JOIN client_companies cc ON cc.id = cu.company_id
       WHERE cu.email = $1 AND cu.is_active = true AND cc.is_active = true`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    await pool.query('UPDATE client_users SET last_login = NOW() WHERE id = $1', [user.id]);

    (req.session as any).clientUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company_name,
      companySlug: user.company_slug,
    };

    await new Promise<void>((resolve, reject) =>
      req.session.save(err => err ? reject(err) : resolve())
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyName: user.company_name,
      },
    });
  } catch (err) {
    console.error('[client-auth] login error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/client/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) console.error('[client-auth] logout error:', err);
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/client/auth/check
router.get('/check', async (req: Request, res: Response) => {
  const clientUser = (req.session as any).clientUser;
  if (!clientUser) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  try {
    const result = await pool.query(
      `SELECT cu.id, cu.first_name, cu.last_name, cu.email, cu.role, cu.is_active,
              cu.score, cu.exercices_realises, cu.taux_reussite, cu.niveau, cu.badges,
              cu.modules_enabled AS modules_enabled_user,
              cc.name as company_name, cc.slug as company_slug, cc.modules_enabled AS modules_enabled_company
       FROM client_users cu
       JOIN client_companies cc ON cc.id = cu.company_id
       WHERE cu.id = $1`,
      [clientUser.id]
    );
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, authenticated: false });
    }
    const u = result.rows[0];
    const rankResult = await pool.query(
      'SELECT COUNT(*) as cnt FROM client_users WHERE score > $1',
      [u.score ?? 0]
    );
    const classement = parseInt(rankResult.rows[0].cnt) + 1;
    // modules effectifs = intersection(user.modules_enabled ?? company.modules_enabled, company.modules_enabled)
    const companyModules: string[] = u.modules_enabled_company ?? [];
    const userModules: string[] = u.modules_enabled_user ?? companyModules;
    const effectiveModules = userModules.filter((m: string) => companyModules.includes(m));
    const freshUser = {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      companyId: clientUser.companyId,
      companyName: u.company_name,
      companySlug: u.company_slug,
      score: u.score ?? 0,
      exercicesRealises: u.exercices_realises ?? 0,
      tauxReussite: u.taux_reussite ?? 0,
      niveau: u.niveau ?? 'Novice',
      badges: u.badges ?? 0,
      classement,
      modulesEnabled: effectiveModules,
    };
    res.json({ success: true, authenticated: true, user: freshUser });
  } catch (err) {
    console.error('[client-auth] check error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Middleware export: protège les routes API client
export function requireClientAuth(req: Request, res: Response, next: any) {
  if (!(req.session as any).clientUser) {
    return res.status(401).json({ success: false, message: 'Authentification client requise' });
  }
  next();
}

export default router;

// ─── Routes KPI client (séparées pour clarté) ────────────────────────────────
export const clientKpiRouter = Router();

clientKpiRouter.patch('/me', requireClientAuth, async (req: Request, res: Response) => {
  const clientUser = (req.session as any).clientUser;
  req.params.id = String(clientUser.id);
  return kpiPatchHandler(req, res);
});

async function kpiPatchHandler(req: Request, res: Response) {
  const ALLOWED = ['exercices_realises', 'score', 'taux_reussite', 'niveau', 'badges'];
  const updates: Record<string, any> = {};
  for (const key of ALLOWED) {
    if (key in req.body) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Aucune mise à jour' });
  }

  try {
    const userId = parseInt(req.params.id);
    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [userId, ...Object.values(updates)];
    await pool.query(`UPDATE client_users SET ${setClauses} WHERE id = $1`, values);

    const rank = await pool.query(
      'SELECT COUNT(*) as cnt FROM client_users WHERE score > $1',
      [updates.score ?? 0]
    );
    const classement = parseInt(rank.rows[0].cnt) + 1;

    res.json({ success: true, classement });
  } catch (err) {
    console.error('[client-kpi] patch error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

clientKpiRouter.patch('/:id', requireClientAuth, async (req: Request, res: Response) => {
  const clientUser = (req.session as any).clientUser;
  if (clientUser.id !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, message: 'Interdit' });
  }
  return kpiPatchHandler(req, res);
});
