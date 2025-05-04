/**
 * Service de limitation de débit pour protéger l'API Azure OpenAI
 */

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
  // Map pour stocker les limites par utilisateur/IP
  private limits: Map<string, RateLimitEntry> = new Map();
  
  // Configuration par défaut
  private defaultConfig = {
    windowMs: 60 * 1000,       // Fenêtre de 1 minute
    maxRequests: 20,           // 20 requêtes par minute
    blockDuration: 5 * 60 * 1000, // Blocage de 5 minutes après trop de tentatives
    maxConsecutiveFailures: 10, // Nombre d'échecs consécutifs avant blocage
    queueTimeout: 30 * 1000,   // Timeout de 30 secondes pour la file d'attente
    maxQueueSize: 10           // Taille maximale de la file d'attente
  };
  
  // Configurations spécifiques par type d'assistant
  private assistantTypeConfigs: Record<string, Partial<typeof this.defaultConfig>> = {
    'cybersecurite': {
      maxRequests: 30,           // Plus de requêtes pour la cybersécurité (cas d'urgence)
      blockDuration: 2 * 60 * 1000 // Blocage plus court
    },
    'amoa': {
      maxRequests: 15,           // Moins de requêtes pour l'AMOA (plus de texte, moins d'interactions)
      queueTimeout: 45 * 1000    // Timeout plus long car requêtes plus complexes
    }
  };
  
  /**
   * Vérifie si une demande peut être traitée ou doit être limitée/mise en file d'attente
   * @param key Identifiant unique (userId ou IP)
   * @param assistantType Type d'assistant (pour appliquer des limites spécifiques)
   * @returns Promise qui se résout quand la requête peut être traitée
   */
  async checkRateLimit(key: string, assistantType?: string): Promise<boolean> {
    // Récupérer la configuration applicable
    const config = this.getConfig(assistantType);
    
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
    
    // Vérifier si l'utilisateur est bloqué
    if (entry.blocked) {
      // Vérifier si le blocage a expiré
      if (entry.blockExpires && now > entry.blockExpires) {
        entry.blocked = false;
        entry.blockExpires = undefined;
        entry.count = 0;
      } else {
        return false;
      }
    }
    
    // Réinitialiser le compteur si la fenêtre est passée
    if (now - entry.lastReset > config.windowMs) {
      entry.count = 0;
      entry.lastReset = now;
    }
    
    // Vérifier si la limite a été atteinte
    if (entry.count >= config.maxRequests) {
      // Si la file d'attente est pleine, rejeter la demande
      if (entry.queue.length >= config.maxQueueSize) {
        return false;
      }
      
      // Mettre la demande en file d'attente
      return new Promise((resolve, reject) => {
        const queueItem = { resolve: resolve as Function, timestamp: now };
        entry.queue.push(queueItem);
        
        // Timeout après un certain temps
        setTimeout(() => {
          const index = entry.queue.indexOf(queueItem);
          if (index !== -1) {
            entry.queue.splice(index, 1);
            reject(new Error('Timeout de la file d\'attente'));
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