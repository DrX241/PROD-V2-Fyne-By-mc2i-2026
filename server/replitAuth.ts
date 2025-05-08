import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Configuration de connexion à l'OIDC de Replit
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 semaine
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // En secondes pour PostgreSQL
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "replace-this-with-a-secure-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

// Met à jour les informations de session utilisateur
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Enregistre ou met à jour un utilisateur dans la base de données
async function upsertUser(claims: any) {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, claims["sub"]));

  if (existingUser) {
    await db
      .update(users)
      .set({
        username: claims["username"],
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        bio: claims["bio"],
        profileImageUrl: claims["profile_image_url"],
        updatedAt: new Date(),
      })
      .where(eq(users.id, claims["sub"]));
    
    return existingUser;
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        id: claims["sub"],
        username: claims["username"],
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        bio: claims["bio"],
        profileImageUrl: claims["profile_image_url"],
      })
      .returning();
    
    return newUser;
  }
}

// Configuration de l'authentification avec Replit
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Configurer la stratégie d'authentification pour chaque domaine
  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }
  
  // Ajouter une stratégie pour localhost (développement local)
  if (process.env.NODE_ENV !== 'production') {
    const localStrategy = new Strategy(
      {
        name: `replitauth:localhost`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `http://localhost:5000/api/callback`,
      },
      verify,
    );
    passport.use(localStrategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Routes d'authentification
  app.get("/api/login", (req, res, next) => {
    // Déterminer la stratégie à utiliser en fonction de l'hôte
    const strategy = `replitauth:${req.hostname}`;
    passport.authenticate(strategy, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Utiliser la même stratégie que pour le login
    const strategy = `replitauth:${req.hostname}`;
    passport.authenticate(strategy, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      // Déterminer l'URL de redirection en fonction de l'environnement
      const isLocal = req.hostname === 'localhost';
      const port = isLocal ? ':5000' : '';
      const protocol = isLocal ? 'http' : 'https';
      
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${protocol}://${req.hostname}${port}`,
        }).href
      );
    });
  });

  // Route pour récupérer les informations de l'utilisateur connecté
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({ message: "Échec de la récupération de l'utilisateur" });
    }
  });
}

// Middleware pour vérifier si l'utilisateur est authentifié
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Si le token est expiré, essayons de le rafraîchir
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};

// Middleware pour les routes d'administration
export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  
  if (adminUserIds.includes(user?.claims?.sub)) {
    return next();
  }
  
  return res.status(403).json({ message: "Accès non autorisé" });
};

// Déclaration pour TypeScript
declare global {
  namespace Express {
    interface User {
      claims?: {
        sub: string;
        email?: string;
        username?: string;
        first_name?: string;
        last_name?: string;
        bio?: string;
        profile_image_url?: string;
        iat: number;
        exp: number;
      };
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}