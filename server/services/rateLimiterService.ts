/**
 * Service de limitation de débit (rate limiting) pour protéger l'API Azure OpenAI
 * contre les abus et les surcharges de requêtes.
 */

// Structure pour stocker les informations de limite par utilisateur/IP
interface RateLimitEntry {
  count: number;        // Nombre de requêtes effectuées
  lastReset: number;    // Timestamp du dernier reset
  blocked: boolean;     // Si l'utilisateur est actuellement bloqué
  blockExpires?: number; // Quand le blocage expire (si applicable)
  queue: Array<{        // File d'attente des requêtes en attente
    resolve: Function;
    timestamp: number;
  }>;
}

class RateLimiterService {
  // Stockage des données de limite par clé (userId ou IP)
  private limits: Map<string, RateLimitEntry> = new Map();
  
  // Configuration par défaut
  private defaultConfig = {
    windowMs: 60 * 1000,        // Fenêtre de 1 minute
    maxRequests: 20,            // 20 requêtes maximum par fenêtre
    blockDuration: 2 * 60 * 1000, // Blocage de 2 minutes si dépassement
    queueTimeout: 30 * 1000,    // Timeout de la file d'attente après 30 secondes
    queueMaxSize: 10            // Taille maximale de la file d'attente
  };
  
  // Configuration personnalisée par type d'assistant
  private assistantTypeConfigs: Record<string, Partial<typeof this.defaultConfig>> = {
    // Les assistants de cybersécurité peuvent être plus intensifs en requêtes
    cybersecurite: {
      maxRequests: 30
    },
    // Les assistants d'AMOA utilisent des tokens plus longs
    amoa: {
      maxRequests: 15
    }
  };
  
  /**
   * Vérifie si une demande peut être traitée ou doit être limitée/mise en file d'attente
   * @param key Identifiant unique (userId ou IP)
   * @param assistantType Type d'assistant (pour appliquer des limites spécifiques)
   * @returns Promise qui se résout quand la requête peut être traitée
   */
  async checkRateLimit(key: string, assistantType?: string): Promise<boolean> {
    // Si aucune entrée n'existe pour cette clé, en créer une
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        count: 0,
        lastReset: Date.now(),
        blocked: false,
        queue: []
      });
    }
    
    const entry = this.limits.get(key)!;
    const now = Date.now();
    
    // Obtenir la configuration applicable
    const config = this.getConfig(assistantType);
    
    // Vérifier si l'utilisateur est bloqué
    if (entry.blocked) {
      if (entry.blockExpires && now > entry.blockExpires) {
        // Le blocage a expiré, on le réinitialise
        entry.blocked = false;
        entry.blockExpires = undefined;
        entry.count = 0;
        entry.lastReset = now;
      } else {
        // L'utilisateur est encore bloqué
        console.log(`Rate limit - Utilisateur ${key} bloqué`);
        return false;
      }
    }
    
    // Réinitialiser le compteur si la fenêtre est passée
    if (now - entry.lastReset > config.windowMs) {
      entry.count = 0;
      entry.lastReset = now;
    }
    
    // Vérifier si la limite est atteinte
    if (entry.count >= config.maxRequests) {
      // Si la file d'attente est pleine, bloquer l'utilisateur
      if (entry.queue.length >= config.queueMaxSize) {
        entry.blocked = true;
        entry.blockExpires = now + config.blockDuration;
        console.log(`Rate limit - Utilisateur ${key} bloqué pour ${config.blockDuration/1000}s`);
        return false;
      }
      
      // Sinon, mettre la requête en file d'attente
      console.log(`Rate limit - Mise en file d'attente pour ${key}`);
      return new Promise((resolve, reject) => {
        const queueItem = { resolve: resolve as Function, timestamp: now };
        entry.queue.push(queueItem);
        
        // Timeout après un certain temps
        setTimeout(() => {
          const index = entry.queue.indexOf(queueItem);
          if (index !== -1) {
            entry.queue.splice(index, 1);
            reject(new Error('Timeout de la file d'attente'));
          }
        }, config.queueTimeout);
      }) as Promise<boolean>;
    }
    
    // Incrémenter le compteur
    entry.count++;
    
    // Traiter la file d'attente si possible
    this.processQueue(key);
    
    return true;
  }
  
  /**
   * Traite les requêtes en file d'attente si des créneaux se libèrent
   */
  private processQueue(key: string): void {
    const entry = this.limits.get(key);
    if (!entry || entry.queue.length === 0) return;
    
    const config = this.getConfig();
    const now = Date.now();
    
    // Réinitialiser le compteur si la fenêtre est passée
    if (now - entry.lastReset > config.windowMs) {
      entry.count = 0;
      entry.lastReset = now;
    }
    
    // Traiter les éléments de la file d'attente tant qu'il y a de la place
    while (entry.count < config.maxRequests && entry.queue.length > 0) {
      const queueItem = entry.queue.shift()!;
      entry.count++;
      
      // Résoudre la promesse pour permettre à la requête de continuer
      queueItem.resolve(true);
    }
  }
  
  /**
   * Obtient la configuration applicable en fonction du type d'assistant
   */
  private getConfig(assistantType?: string): typeof this.defaultConfig {
    if (!assistantType || !this.assistantTypeConfigs[assistantType]) {
      return this.defaultConfig;
    }
    
    return {
      ...this.defaultConfig,
      ...this.assistantTypeConfigs[assistantType]
    };
  }
  
  /**
   * Libère manuellement des créneaux pour un utilisateur (utile après des erreurs)
   */
  releaseLimit(key: string, count: number = 1): void {
    const entry = this.limits.get(key);
    if (!entry) return;
    
    entry.count = Math.max(0, entry.count - count);
    this.processQueue(key);
  }
  
  /**
   * Réinitialise complètement les limites pour un utilisateur
   */
  resetLimits(key: string): void {
    const entry = this.limits.get(key);
    if (!entry) return;
    
    entry.count = 0;
    entry.blocked = false;
    entry.blockExpires = undefined;
    
    // Traiter toutes les requêtes en attente
    while (entry.queue.length > 0) {
      const queueItem = entry.queue.shift()!;
      queueItem.resolve(true);
    }
  }
  
  /**
   * Obtient les statistiques d'utilisation du rate limiter
   */
  getStats(): {
    totalUsers: number,
    blockedUsers: number,
    queuedRequests: number,
    topUsers: Array<{key: string, count: number, blocked: boolean}>
  } {
    let blockedUsers = 0;
    let queuedRequests = 0;
    
    const topUsers = Array.from(this.limits.entries())
      .map(([key, entry]) => {
        if (entry.blocked) blockedUsers++;
        queuedRequests += entry.queue.length;
        
        return {
          key,
          count: entry.count,
          blocked: entry.blocked
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    return {
      totalUsers: this.limits.size,
      blockedUsers,
      queuedRequests,
      topUsers
    };
  }
}

// Exporter une instance singleton
export const rateLimiter = new RateLimiterService();