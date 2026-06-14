import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { storage } from './storage';

export class AuthController {
  // Connexion utilisateur
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nom d\'utilisateur et mot de passe requis' 
        });
      }

      // Rechercher l'utilisateur
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Identifiants invalides' 
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = user.password ? 
        await bcrypt.compare(password, user.password) : false;

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Identifiants invalides' 
        });
      }

      // Mettre à jour la date de dernière connexion
      await storage.updateUserLastLogin(user.id);

      // Stocker les informations utilisateur dans la session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        modulesEnabled: (user as any).modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'],
        tokenQuota: (user as any).tokenQuota ?? 100000,
        tokenUsedMonth: (user as any).tokenUsedMonth ?? 0,
        subscriptionLabel: (user as any).subscriptionLabel ?? 'Gratuit',
      };

      res.json({
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          modulesEnabled: (user as any).modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'],
          tokenQuota: (user as any).tokenQuota ?? 100000,
          subscriptionLabel: (user as any).subscriptionLabel ?? 'Gratuit',
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
      });
    }
  }

  // Déconnexion utilisateur
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Erreur lors de la déconnexion:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la déconnexion' 
          });
        }
        
        res.clearCookie('connect.sid'); // Nom par défaut du cookie de session
        res.json({ 
          success: true, 
          message: 'Déconnexion réussie' 
        });
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
      });
    }
  }

  // Vérifier le statut d'authentification
  static async checkAuth(req: Request, res: Response) {
    try {
      const session = req.session as any;
      
      if (!session.user) {
        return res.status(401).json({ 
          success: false, 
          authenticated: false,
          message: 'Non authentifié' 
        });
      }

      // Vérifier que l'utilisateur existe toujours et est actif
      const user = await storage.getUser(session.user.id);
      
      if (!user || !user.isActive) {
        // Nettoyer la session si l'utilisateur n'existe plus ou est inactif
        req.session.destroy(() => {});
        return res.status(401).json({ 
          success: false, 
          authenticated: false,
          message: 'Session invalide' 
        });
      }

      // Rafraîchir la session avec les dernières valeurs DB
      (req.session as any).user = {
        ...(req.session as any).user,
        role: user.role,
        modulesEnabled: (user as any).modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'],
        tokenQuota: (user as any).tokenQuota ?? 100000,
        tokenUsedMonth: (user as any).tokenUsedMonth ?? 0,
        subscriptionLabel: (user as any).subscriptionLabel ?? 'Gratuit',
      };

      res.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          modulesEnabled: (user as any).modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'],
          tokenQuota: (user as any).tokenQuota ?? 100000,
          tokenUsedMonth: (user as any).tokenUsedMonth ?? 0,
          subscriptionLabel: (user as any).subscriptionLabel ?? 'Gratuit',
        }
      });

    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
      });
    }
  }

  // Middleware pour protéger les routes
  static requireAuth(req: Request, res: Response, next: any) {
    const session = req.session as any;
    
    if (!session.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }
    
    next();
  }

  // Middleware pour vérifier le rôle admin (admin et superadmin autorisés)
  static requireAdmin(req: Request, res: Response, next: any) {
    const session = req.session as any;
    const role = session.user?.role;

    if (!session.user || (role !== 'admin' && role !== 'superadmin')) {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis'
      });
    }

    next();
  }

  // Factory: middleware qui vérifie que l'utilisateur a accès au module demandé
  static requireModule(moduleId: string) {
    return (req: Request, res: Response, next: any) => {
      const session = req.session as any;
      if (!session.user) {
        return res.status(401).json({ success: false, message: 'Authentification requise' });
      }
      // superadmin et admin ont accès à tout
      if (session.user.role === 'superadmin' || session.user.role === 'admin') {
        return next();
      }
      const enabled: string[] = session.user.modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'];
      if (!enabled.includes(moduleId)) {
        return res.status(403).json({ success: false, message: `Accès au module "${moduleId}" non autorisé. Vérifiez votre abonnement.` });
      }
      next();
    };
  }
}