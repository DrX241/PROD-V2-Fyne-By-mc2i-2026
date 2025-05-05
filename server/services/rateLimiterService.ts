/**
 * Service de limitation de débit (rate limiting)
 * Ce service permet de limiter le nombre de requêtes par utilisateur/clé et par période
 * Il offre également des fonctionnalités de file d'attente et de déblocage
 */
import { Request } from 'express';

interface RateLimitOptions {
  // Nombre maximum de requêtes par période
  maxRequests: number;
  // Période en secondes
  windowSizeInSeconds: number;
  // Capacité de la file d'attente (0 = pas de file d'attente)
  queueCapacity: number;
  // Durée de blocage en secondes (0 = pas de blocage)
  blockDurationInSeconds: number;
}

interface RateLimitState {
  // Horodatages des requêtes dans la fenêtre courante
  timestamps: number[];
  // État de blocage
  blocked: boolean;
  // Horodatage de fin de blocage
  blockExpiresAt: number;
  // File d'attente des requêtes
  queue: Array<{
    resolve: (value: void) => void;
    reject: (reason: Error) => void;
    createdAt: number;
  }>;
}

// Configuration par défaut
const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 50,
  windowSizeInSeconds: 60,
  queueCapacity: 20,
  blockDurationInSeconds: 300, // 5 minutes
};

// Configuration spécifique par domaine
const DOMAIN_SPECIFIC_OPTIONS: Record<string, Partial<RateLimitOptions>> = {
  'general': {
    maxRequests: 60,
    windowSizeInSeconds: 60,
  },
  'cybersecurite': {
    maxRequests: 40,
    windowSizeInSeconds: 60,
  },
  'amoa': {
    maxRequests: 50,
    windowSizeInSeconds: 60,
  },
  'data_ia': {
    maxRequests: 30,
    windowSizeInSeconds: 60,
  },
  'developement': {
    maxRequests: 45,
    windowSizeInSeconds: 60,
  },
};

class RateLimiterService {
  private state: Map<string, RateLimitState> = new Map();
  private options: RateLimitOptions;
  private domainOptions: Record<string, RateLimitOptions> = {};
  private logQueue: Array<{
    timestamp: number,
    key: string,
    action: 'limit' | 'queue' | 'block' | 'reset',
    domain?: string
  }> = [];
  private maxLogQueueSize = 1000;

  constructor(options: Partial<RateLimitOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialiser les options par domaine
    for (const [domain, opts] of Object.entries(DOMAIN_SPECIFIC_OPTIONS)) {
      this.domainOptions[domain] = { ...this.options, ...opts };
    }
  }

  /**
   * Vérifie si une clé (utilisateur, IP, etc.) a dépassé sa limite de débit
   * @param key Identifiant unique (user:id, ip:address, etc.)
   * @param domain Domaine optionnel pour appliquer des limites spécifiques
   * @returns True si la requête est autorisée, False sinon
   */
  public async check(key: string, domain?: string): Promise<boolean> {
    const options = domain && this.domainOptions[domain] 
      ? this.domainOptions[domain] 
      : this.options;
    
    // Initialiser l'état si nécessaire
    if (!this.state.has(key)) {
      this.state.set(key, {
        timestamps: [],
        blocked: false,
        blockExpiresAt: 0,
        queue: [],
      });
    }
    
    const state = this.state.get(key)!;
    const now = Date.now();
    
    // Vérifier si l'utilisateur est bloqué
    if (state.blocked) {
      if (now >= state.blockExpiresAt) {
        // Le blocage a expiré
        state.blocked = false;
        state.timestamps = [];
        this.addLog(key, 'reset', domain);
      } else {
        return false;
      }
    }
    
    // Supprimer les horodatages en dehors de la fenêtre courante
    const windowStart = now - (options.windowSizeInSeconds * 1000);
    state.timestamps = state.timestamps.filter(ts => ts >= windowStart);
    
    // Vérifier si l'utilisateur a dépassé sa limite
    if (state.timestamps.length < options.maxRequests) {
      // Autorisé : ajouter l'horodatage et continuer
      state.timestamps.push(now);
      return true;
    }
    
    // Limite dépassée
    this.addLog(key, 'limit', domain);
    
    // Si la file d'attente est désactivée ou pleine, bloquer l'utilisateur
    if (options.queueCapacity === 0 || state.queue.length >= options.queueCapacity) {
      if (options.blockDurationInSeconds > 0) {
        state.blocked = true;
        state.blockExpiresAt = now + (options.blockDurationInSeconds * 1000);
        this.addLog(key, 'block', domain);
      }
      return false;
    }
    
    // Ajouter la requête à la file d'attente
    try {
      await new Promise<void>((resolve, reject) => {
        state.queue.push({ resolve, reject, createdAt: now });
        this.addLog(key, 'queue', domain);
        
        // Vérifier périodiquement si la requête peut être traitée
        this.processQueue(key, domain);
      });
      
      // La requête a été traitée depuis la file d'attente
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Traite la file d'attente pour une clé donnée
   * @param key Identifiant unique
   * @param domain Domaine optionnel
   */
  private processQueue(key: string, domain?: string): void {
    const state = this.state.get(key);
    if (!state || state.queue.length === 0) return;
    
    const options = domain && this.domainOptions[domain] 
      ? this.domainOptions[domain] 
      : this.options;
    
    const now = Date.now();
    const windowStart = now - (options.windowSizeInSeconds * 1000);
    
    // Supprimer les horodatages en dehors de la fenêtre courante
    state.timestamps = state.timestamps.filter(ts => ts >= windowStart);
    
    // Si l'utilisateur est maintenant sous sa limite, traiter la première requête de la file
    if (state.timestamps.length < options.maxRequests) {
      const nextRequest = state.queue.shift();
      if (nextRequest) {
        state.timestamps.push(now);
        nextRequest.resolve();
      }
    } else {
      // Réessayer après un délai
      setTimeout(() => this.processQueue(key, domain), 1000);
    }
  }

  /**
   * Réinitialise les limites pour une clé donnée
   * @param key Identifiant unique
   */
  public reset(key: string): void {
    const state = this.state.get(key);
    if (state) {
      state.timestamps = [];
      state.blocked = false;
      state.blockExpiresAt = 0;
      
      // Rejeter toutes les requêtes en attente
      state.queue.forEach(request => {
        request.reject(new Error('Rate limit reset'));
      });
      state.queue = [];
      
      this.addLog(key, 'reset');
    }
  }

  /**
   * Réinitialise toutes les limites
   */
  public resetAll(): void {
    for (const key of this.state.keys()) {
      this.reset(key);
    }
  }

  /**
   * Configure les options du rate limiter
   * @param options Nouvelles options
   */
  public configure(options: Partial<RateLimitOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Configure les options pour un domaine spécifique
   * @param domain Nom du domaine
   * @param options Options spécifiques
   */
  public configureDomain(domain: string, options: Partial<RateLimitOptions>): void {
    this.domainOptions[domain] = { 
      ...(this.domainOptions[domain] || this.options), 
      ...options 
    };
  }

  /**
   * Ajoute une entrée de log
   * @param key Identifiant unique
   * @param action Type d'action
   * @param domain Domaine optionnel
   */
  private addLog(key: string, action: 'limit' | 'queue' | 'block' | 'reset', domain?: string): void {
    this.logQueue.push({
      timestamp: Date.now(),
      key,
      action,
      domain
    });
    
    // Limiter la taille de la file de logs
    if (this.logQueue.length > this.maxLogQueueSize) {
      this.logQueue.shift();
    }
  }

  /**
   * Récupère les statistiques du rate limiter
   */
  public getStats() {
    const now = Date.now();
    const blockedUsers = Array.from(this.state.entries())
      .filter(([_, state]) => state.blocked && state.blockExpiresAt > now);
    
    const queuedRequests = Array.from(this.state.entries())
      .reduce((total, [_, state]) => total + state.queue.length, 0);
    
    const topUsers = Array.from(this.state.entries())
      .map(([key, state]) => ({
        key,
        count: state.timestamps.length,
        blocked: state.blocked && state.blockExpiresAt > now
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalUsers: this.state.size,
      blockedUsers: blockedUsers.length,
      queuedRequests,
      topUsers,
      logs: this.logQueue.slice(-100).reverse()
    };
  }
}

// Instance singleton du service
export const rateLimiterService = new RateLimiterService();