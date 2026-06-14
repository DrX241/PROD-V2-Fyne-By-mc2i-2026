import { Request, Response } from 'express';
import { db } from './db';
import { users, llmUsage } from '@shared/schema';
import { eq, desc, sql, gte } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const ALL_MODULES = [
  { id: 'cyber',         label: 'I AM CYBER' },
  { id: 'data',          label: 'I AM DATA & IA' },
  { id: 'amoa',          label: 'I AM mc2i (AMOA)' },
  { id: 'formation-data',label: 'FORMATION DATA' },
  { id: 'evaluation',    label: 'MODE ÉVALUATION' },
  { id: 'playground',    label: 'PLAYGROUND / GÉNÉRATEUR' },
];

function requireSuperAdmin(req: Request, res: Response): boolean {
  const session = req.session as any;
  if (session?.user?.role !== 'superadmin') {
    res.status(403).json({ success: false, message: 'Accès réservé au super administrateur.' });
    return false;
  }
  return true;
}

export class SuperAdminController {

  // GET /api/superadmin/users — liste complète avec abonnements
  static async listUsers(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        modulesEnabled: users.modulesEnabled,
        permissions: users.permissions,
        tokenQuota: users.tokenQuota,
        tokenUsedMonth: users.tokenUsedMonth,
        tokenResetAt: users.tokenResetAt,
        subscriptionLabel: users.subscriptionLabel,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
      }).from(users).orderBy(desc(users.createdAt));

      res.json({ success: true, users: allUsers, allModules: ALL_MODULES });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // PATCH /api/superadmin/users/:id/role — changer le rôle
  static async updateRole(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      if (userId === session.user.id)
        return res.status(400).json({ success: false, message: 'Impossible de modifier votre propre rôle.' });

      const { role, permissions } = req.body;
      const patch: Record<string, any> = { updatedAt: new Date() };

      if (role !== undefined) {
        if (!['user', 'admin', 'superadmin'].includes(role))
          return res.status(400).json({ success: false, message: 'Rôle invalide.' });
        patch.role = role;
      }
      if (Array.isArray(permissions)) patch.permissions = permissions;

      await db.update(users).set(patch).where(eq(users.id, userId));
      res.json({ success: true, message: 'Utilisateur mis à jour.' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // PATCH /api/superadmin/users/:id/subscription — modules, quota, abonnement
  static async updateSubscription(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const userId = parseInt(req.params.id);
      const { modulesEnabled, tokenQuota, subscriptionLabel, subscriptionExpiresAt } = req.body;

      const patch: Record<string, any> = { updatedAt: new Date() };
      if (Array.isArray(modulesEnabled)) patch.modulesEnabled = modulesEnabled;
      if (typeof tokenQuota === 'number')  patch.tokenQuota = tokenQuota;
      if (subscriptionLabel != null)       patch.subscriptionLabel = subscriptionLabel;
      if (subscriptionExpiresAt != null)   patch.subscriptionExpiresAt = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;

      await db.update(users).set(patch).where(eq(users.id, userId));
      res.json({ success: true, message: 'Abonnement mis à jour.' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // POST /api/superadmin/users/:id/reset-tokens — remet le compteur à 0
  static async resetTokens(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const userId = parseInt(req.params.id);
      await db.update(users).set({
        tokenUsedMonth: 0,
        tokenResetAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      res.json({ success: true, message: 'Compteur de tokens réinitialisé.' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // PATCH /api/superadmin/users/:id/toggle — activer/désactiver
  static async toggleUser(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      if (userId === session.user.id)
        return res.status(400).json({ success: false, message: 'Impossible de modifier votre propre compte.' });

      const [user] = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });

      await db.update(users).set({ isActive: !user.isActive, updatedAt: new Date() }).where(eq(users.id, userId));
      res.json({ success: true, isActive: !user.isActive });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // DELETE /api/superadmin/users/:id
  static async deleteUser(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      if (userId === session.user.id)
        return res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte.' });

      await db.delete(users).where(eq(users.id, userId));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // POST /api/superadmin/users — créer un utilisateur
  static async createUser(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const { username, password, email, firstName, lastName, role, modulesEnabled, tokenQuota, subscriptionLabel } = req.body;
      if (!username || !password)
        return res.status(400).json({ success: false, message: 'Username et mot de passe requis.' });

      const hashed = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({
        username,
        password: hashed,
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: ['user','admin','superadmin'].includes(role) ? role : 'user',
        isActive: true,
        modulesEnabled: Array.isArray(modulesEnabled) ? modulesEnabled : ALL_MODULES.map(m => m.id),
        tokenQuota: typeof tokenQuota === 'number' ? tokenQuota : 100000,
        tokenUsedMonth: 0,
        subscriptionLabel: subscriptionLabel || 'Gratuit',
      }).returning();

      res.status(201).json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (e: any) {
      if (e.code === '23505') return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur existe déjà.' });
      res.status(500).json({ success: false, message: e.message });
    }
  }

  // GET /api/superadmin/token-stats — consommation tokens par user ce mois
  static async tokenStats(req: Request, res: Response) {
    if (!requireSuperAdmin(req, res)) return;
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const stats = await db.execute(sql`
        SELECT
          u.id, u.username, u.email,
          u.token_quota, u.token_used_month, u.subscription_label,
          COALESCE(SUM(l.total_tokens), 0) AS tokens_this_month
        FROM users u
        LEFT JOIN llm_usage l ON l.user_id = u.id AND l.created_at >= ${startOfMonth}
        GROUP BY u.id, u.username, u.email, u.token_quota, u.token_used_month, u.subscription_label
        ORDER BY tokens_this_month DESC
      `);

      res.json({ success: true, stats: stats.rows });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}
