import { Request, Response } from 'express';
import { db } from './db';
import { ssoConfig, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as openidClient from 'openid-client';

// Cache de la config SSO en mémoire (TTL 5 min)
let configCache: { data: any; expiresAt: number } | null = null;

async function getSsoConfig() {
  if (configCache && configCache.expiresAt > Date.now()) return configCache.data;
  const [cfg] = await db.select().from(ssoConfig).limit(1);
  configCache = { data: cfg ?? null, expiresAt: Date.now() + 5 * 60_000 };
  return configCache.data;
}

function clearConfigCache() {
  configCache = null;
}

// ─── ADMIN: CRUD CONFIG ───────────────────────────────────────────────────────

export class SsoAdminController {
  static async getConfig(req: Request, res: Response) {
    try {
      const cfg = await getSsoConfig();
      if (!cfg) return res.json({ success: true, config: null });
      // On ne retourne jamais le secret en clair
      const { clientSecret: _, ...safe } = cfg;
      res.json({ success: true, config: { ...safe, clientSecret: cfg.clientSecret ? '••••••••' : '' } });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async saveConfig(req: Request, res: Response) {
    try {
      const {
        provider, clientId, clientSecret, tenantId,
        discoveryUrl, callbackUrl, isEnabled,
        allowedDomains, autoCreateUsers, defaultRole,
      } = req.body;

      if (!clientId || !callbackUrl) {
        return res.status(400).json({ success: false, message: 'clientId et callbackUrl requis' });
      }

      const existing = await db.select({ id: ssoConfig.id }).from(ssoConfig).limit(1);
      const secret = clientSecret === '••••••••' ? undefined : clientSecret;

      if (existing.length > 0) {
        const update: any = {
          provider: provider || 'azure',
          clientId,
          tenantId: tenantId || null,
          discoveryUrl: discoveryUrl || null,
          callbackUrl,
          isEnabled: !!isEnabled,
          allowedDomains: Array.isArray(allowedDomains) ? allowedDomains : [],
          autoCreateUsers: autoCreateUsers !== false,
          defaultRole: defaultRole || 'user',
          updatedAt: new Date(),
        };
        if (secret) update.clientSecret = secret;
        await db.update(ssoConfig).set(update).where(eq(ssoConfig.id, existing[0].id));
      } else {
        await db.insert(ssoConfig).values({
          provider: provider || 'azure',
          clientId,
          clientSecret: secret || '',
          tenantId: tenantId || null,
          discoveryUrl: discoveryUrl || null,
          callbackUrl,
          isEnabled: !!isEnabled,
          allowedDomains: Array.isArray(allowedDomains) ? allowedDomains : [],
          autoCreateUsers: autoCreateUsers !== false,
          defaultRole: defaultRole || 'user',
        });
      }

      clearConfigCache();
      res.json({ success: true, message: 'Configuration SSO enregistrée' });
    } catch (e) {
      console.error('Erreur saveConfig SSO:', e);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async testConfig(req: Request, res: Response) {
    try {
      const cfg = await getSsoConfig();
      if (!cfg) return res.status(400).json({ success: false, message: 'Aucune configuration SSO' });

      let discoveryUrl = cfg.discoveryUrl;
      if (!discoveryUrl && cfg.provider === 'azure' && cfg.tenantId) {
        discoveryUrl = `https://login.microsoftonline.com/${cfg.tenantId}/v2.0/.well-known/openid-configuration`;
      }
      if (!discoveryUrl) return res.status(400).json({ success: false, message: 'URL de découverte manquante' });

      const serverConfig = await openidClient.discovery(new URL(discoveryUrl), cfg.clientId, cfg.clientSecret);
      res.json({ success: true, message: 'Connexion au fournisseur OIDC réussie', issuer: serverConfig.serverMetadata().issuer });
    } catch (e: any) {
      res.status(400).json({ success: false, message: `Erreur test SSO: ${e.message}` });
    }
  }
}

// ─── AUTH SSO (OIDC FLOW) ─────────────────────────────────────────────────────

// Store temporaire des states PKCE (en prod: Redis)
const pendingStates = new Map<string, { codeVerifier: string; expiresAt: number }>();

export class SsoAuthController {
  static async initiateLogin(req: Request, res: Response) {
    try {
      const cfg = await getSsoConfig();
      if (!cfg?.isEnabled) return res.status(503).json({ success: false, message: 'SSO non activé' });

      let discoveryUrl = cfg.discoveryUrl;
      if (!discoveryUrl && cfg.provider === 'azure' && cfg.tenantId) {
        discoveryUrl = `https://login.microsoftonline.com/${cfg.tenantId}/v2.0/.well-known/openid-configuration`;
      }

      const serverConfig = await openidClient.discovery(new URL(discoveryUrl!), cfg.clientId, cfg.clientSecret);
      const codeVerifier = openidClient.randomPKCECodeVerifier();
      const codeChallenge = await openidClient.calculatePKCECodeChallenge(codeVerifier);
      const state = openidClient.randomState();

      pendingStates.set(state, { codeVerifier, expiresAt: Date.now() + 10 * 60_000 });

      const authUrl = openidClient.buildAuthorizationUrl(serverConfig, {
        redirect_uri: cfg.callbackUrl,
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      });

      res.redirect(authUrl.href);
    } catch (e: any) {
      console.error('Erreur SSO initiate:', e);
      res.redirect('/?error=sso_error');
    }
  }

  static async handleCallback(req: Request, res: Response) {
    try {
      const cfg = await getSsoConfig();
      if (!cfg?.isEnabled) return res.redirect('/?error=sso_disabled');

      let discoveryUrl = cfg.discoveryUrl;
      if (!discoveryUrl && cfg.provider === 'azure' && cfg.tenantId) {
        discoveryUrl = `https://login.microsoftonline.com/${cfg.tenantId}/v2.0/.well-known/openid-configuration`;
      }

      const state = req.query.state as string;
      const pending = pendingStates.get(state);
      if (!pending || pending.expiresAt < Date.now()) return res.redirect('/?error=sso_state_invalid');
      pendingStates.delete(state);

      const serverConfig = await openidClient.discovery(new URL(discoveryUrl!), cfg.clientId, cfg.clientSecret);
      const tokens = await openidClient.authorizationCodeGrant(serverConfig, new URL(req.url, `${req.protocol}://${req.hostname}`), {
        pkceCodeVerifier: pending.codeVerifier,
        expectedState: state,
      });

      const claims = tokens.claims();
      const email = (claims?.email || claims?.preferred_username || '') as string;
      const name = (claims?.name || '') as string;

      if (!email) return res.redirect('/?error=sso_no_email');

      // Vérification domaine autorisé
      if (cfg.allowedDomains.length > 0) {
        const domain = email.split('@')[1];
        if (!cfg.allowedDomains.includes(domain)) return res.redirect('/?error=sso_domain_not_allowed');
      }

      // Trouver ou créer l'utilisateur
      let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];

      if (!user) {
        if (!cfg.autoCreateUsers) return res.redirect('/?error=sso_user_not_found');
        const parts = name.split(' ');
        const randomPwd = await bcrypt.hash(Math.random().toString(36), 10);
        user = (await db.insert(users).values({
          username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_'),
          email,
          firstName: parts[0] || null,
          lastName: parts.slice(1).join(' ') || null,
          password: randomPwd,
          role: cfg.defaultRole,
          isActive: true,
        }).returning())[0];
      }

      if (!user.isActive) return res.redirect('/?error=sso_account_disabled');

      // Créer la session
      (req.session as any).user = { id: user.id, username: user.username, role: user.role, email: user.email };
      await new Promise<void>((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));

      // Mise à jour lastLogin
      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

      res.redirect('/');
    } catch (e: any) {
      console.error('Erreur SSO callback:', e);
      res.redirect('/?error=sso_callback_error');
    }
  }
}
