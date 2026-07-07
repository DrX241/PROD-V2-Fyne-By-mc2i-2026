import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { storage } from './storage';
import { db } from './db';
import { users, userLearningProgress, investigationProgress, llmCache, llmUsage } from '@shared/schema';
import { desc, count, sql, gte, eq } from 'drizzle-orm';
import { generateUserReport } from './services/userReportService';

export class AdminController {
  // Liste tous les utilisateurs — les superadmins sont masqués pour les admins
  static async listUsers(req: Request, res: Response) {
    try {
      const session = req.session as any;
      const callerRole = session.user?.role;

      const { ne } = await import('drizzle-orm');
      const query = db
        .select({
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
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      const allUsers = callerRole === 'superadmin'
        ? await query
        : await query.where(ne(users.role, 'superadmin'));

      res.json({ success: true, users: allUsers });
    } catch (error) {
      console.error('Erreur listUsers:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Crée un nouvel utilisateur
  static async createUser(req: Request, res: Response) {
    try {
      const { username, password, email, firstName, lastName, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username et mot de passe requis' });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur existe déjà' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role === 'admin' ? 'admin' : 'user',
        isActive: true,
      });

      res.json({
        success: true,
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Erreur createUser:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Active ou désactive un compte
  static async toggleUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      const callerRole = session.user?.role;

      if (userId === session.user.id) {
        return res.status(400).json({ success: false, message: 'Impossible de modifier votre propre compte' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      if (user.role === 'superadmin') {
        return res.status(403).json({ success: false, message: 'Action non autorisée' });
      }
      if (callerRole === 'admin' && user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Un administrateur ne peut pas modifier un autre administrateur' });
      }

      const { eq } = await import('drizzle-orm');
      await db
        .update(users)
        .set({ isActive: !user.isActive, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ success: true, isActive: !user.isActive });
    } catch (error) {
      console.error('Erreur toggleUser:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Réinitialise le mot de passe d'un utilisateur
  static async resetPassword(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      const callerRole = session.user?.role;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mot de passe trop court (6 caractères min)' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      if (user.role === 'superadmin') {
        return res.status(403).json({ success: false, message: 'Action non autorisée' });
      }
      if (callerRole === 'admin' && user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Un administrateur ne peut pas réinitialiser le mot de passe d\'un autre administrateur' });
      }

      const { eq } = await import('drizzle-orm');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ success: true, message: 'Mot de passe réinitialisé' });
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Supprime un utilisateur
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const session = req.session as any;
      const callerRole = session.user?.role;

      if (userId === session.user.id) {
        return res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte' });
      }

      const target = await storage.getUser(userId);
      if (!target) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      if (target.role === 'superadmin') {
        return res.status(403).json({ success: false, message: 'Action non autorisée' });
      }
      if (callerRole === 'admin' && target.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Un administrateur ne peut pas supprimer un autre administrateur' });
      }

      const { eq } = await import('drizzle-orm');
      await db.delete(users).where(eq(users.id, userId));

      res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
      console.error('Erreur deleteUser:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Génère un rapport PDF pour un utilisateur
  static async exportUserPDF(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      await generateUserReport(userId, res);
    } catch (error: any) {
      console.error('Erreur exportUserPDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
      }
    }
  }

  // Consommation LLM par utilisateur
  static async getLlmUsage(req: Request, res: Response) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);

      const usageByUser = await db.execute(sql`
        SELECT
          user_id,
          username,
          COUNT(*) AS requests,
          SUM(total_tokens) AS total_tokens,
          SUM(prompt_tokens) AS prompt_tokens,
          SUM(completion_tokens) AS completion_tokens,
          MAX(created_at) AS last_used,
          STRING_AGG(DISTINCT model, ', ') AS models_used
        FROM llm_usage
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY user_id, username
        ORDER BY total_tokens DESC
        LIMIT 50
      `);

      const usageByFeature = await db.execute(sql`
        SELECT
          feature,
          COUNT(*) AS requests,
          SUM(total_tokens) AS total_tokens,
          SUM(prompt_tokens) AS prompt_tokens,
          SUM(completion_tokens) AS completion_tokens,
          STRING_AGG(DISTINCT model, ', ') AS models_used
        FROM llm_usage
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY feature
        ORDER BY total_tokens DESC
        LIMIT 20
      `);

      const usageByModel = await db.execute(sql`
        SELECT
          model,
          COUNT(*) AS requests,
          SUM(total_tokens) AS total_tokens,
          SUM(prompt_tokens) AS prompt_tokens,
          SUM(completion_tokens) AS completion_tokens,
          COUNT(DISTINCT user_id) AS unique_users
        FROM llm_usage
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY model
        ORDER BY total_tokens DESC
      `);

      const totalTokens30d = await db.execute(sql`
        SELECT COALESCE(SUM(total_tokens), 0) AS total FROM llm_usage WHERE created_at >= ${thirtyDaysAgo}
      `);

      res.json({
        success: true,
        usageByUser: usageByUser.rows ?? [],
        usageByFeature: usageByFeature.rows ?? [],
        usageByModel: usageByModel.rows ?? [],
        totalTokens30d: Number((totalTokens30d.rows ?? [])[0]?.total ?? 0),
      });
    } catch (error) {
      console.error('Erreur getLlmUsage:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // Statistiques d'utilisation pour le dashboard admin
  static async getStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000);

      const [
        totalUsersRes,
        activeUsersRes,
        adminUsersRes,
        recentLoginsRes,
        newUsersRes,
        learningProgressRes,
        investigationRes,
        cacheHitsRes,
        recentUsersRes,
      ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(sql`${users.isActive} = true`),
        db.select({ count: count() }).from(users).where(sql`${users.role} = 'admin'`),
        db.select({ count: count() }).from(users).where(gte(users.lastLogin, thirtyDaysAgo)),
        db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
        db.select({ count: count() }).from(userLearningProgress),
        db.select({ count: count() }).from(investigationProgress),
        db.select({ total: sql<number>`COALESCE(SUM(${llmCache.hits}), 0)` }).from(llmCache),
        db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
        }).from(users).orderBy(desc(users.lastLogin)).limit(5),
      ]);

      // Inscriptions par mois (6 derniers mois)
      const signupsByMonth = await db.execute(sql`
        SELECT
          TO_CHAR(created_at, 'Mon YYYY') AS month,
          DATE_TRUNC('month', created_at) AS month_date,
          COUNT(*) AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month, month_date
        ORDER BY month_date ASC
      `);

      res.json({
        success: true,
        stats: {
          totalUsers: Number(totalUsersRes[0].count),
          activeUsers: Number(activeUsersRes[0].count),
          adminUsers: Number(adminUsersRes[0].count),
          recentLogins30d: Number(recentLoginsRes[0].count),
          newUsers30d: Number(newUsersRes[0].count),
          newUsers7d: 0,
          learningProgressRecords: Number(learningProgressRes[0].count),
          investigationRecords: Number(investigationRes[0].count),
          cacheHitsTotal: Number(cacheHitsRes[0].total),
          recentUsers: recentUsersRes,
          signupsByMonth: signupsByMonth.rows ?? [],
        },
      });
    } catch (error) {
      console.error('Erreur getStats:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}
