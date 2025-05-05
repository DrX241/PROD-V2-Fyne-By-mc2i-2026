/**
 * Service de cache simplifié pour les fonctionnalités qui n'utilisent pas les messages OpenAI
 * Ce service permet de mettre en cache des données avec une clé de type chaîne de caractères
 */

interface SimpleCacheEntry {
  key: string;
  value: string;
  domain: string;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
  hits: number;
  query?: string;
}

interface SimpleCacheConfig {
  // Durée de vie par défaut des entrées en secondes
  defaultTTL: number;
  // Capacité maximale du cache
  maxEntries: number;
  // Taille maximale de la file de logs
  maxLogEntries: number;
  // Configuration spécifique par domaine
  domainConfig: Record<string, { ttl: number }>;
}

type CacheLogAction = 'set' | 'get' | 'hit' | 'miss' | 'expire' | 'delete' | 'clear';

interface SimpleCacheLog {
  timestamp: number;
  action: CacheLogAction;
  domain: string;
  userId?: number;
  query?: string;
  key?: string;
}

export class SimpleCacheService {
  private cache: Map<string, SimpleCacheEntry> = new Map();
  private config: SimpleCacheConfig;
  private logQueue: SimpleCacheLog[] = [];
  private domainEntryCounts: Record<string, number> = {};
  private domainHitCounts: Record<string, number> = {};

  constructor(config?: Partial<SimpleCacheConfig>) {
    // Configuration par défaut
    this.config = {
      defaultTTL: 60 * 60, // 1 heure
      maxEntries: 1000,
      maxLogEntries: 1000,
      domainConfig: {
        // Configurations spécifiques par domaine
        'general': { ttl: 60 * 60 }, // 1 heure
        'prompt_examples': { ttl: 24 * 60 * 60 }, // 24 heures pour les exemples de prompts
        'code_generator': { ttl: 60 * 60 }, // 1 heure pour le générateur de code
      },
      ...config
    };
  }

  /**
   * Récupère une valeur du cache
   * @param key Clé de cache
   * @param domain Domaine optionnel pour les statistiques
   * @returns Valeur mise en cache ou null
   */
  public get(key: string, domain = 'general'): string | null {
    const now = Date.now();
    
    // Vérifier si la clé est en cache
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      
      // Vérifier si l'entrée n'est pas expirée
      if (entry.expiresAt > now) {
        // Mettre à jour les statistiques
        entry.hits++;
        entry.lastAccessed = now;
        this.domainHitCounts[domain] = (this.domainHitCounts[domain] || 0) + 1;
        
        // Ajouter un log
        this.addLog('hit', domain, undefined, entry.query, key);
        
        return entry.value;
      }
      
      // L'entrée est expirée, la supprimer
      this.cache.delete(key);
      
      // Ajouter un log
      this.addLog('expire', domain, undefined, entry.query, key);
    }
    
    // Ajouter un log
    this.addLog('miss', domain, undefined, `Key not found: ${key}`);
    
    return null;
  }

  /**
   * Met une valeur en cache
   * @param key Clé de cache
   * @param value Valeur à mettre en cache
   * @param ttl Durée de vie en secondes (optionnelle)
   * @param domain Domaine pour les statistiques (optionnel)
   * @param query Description de la requête (optionnelle)
   */
  public set(key: string, value: string, ttl?: number, domain = 'general', query?: string): void {
    // Vérifier si le cache est plein
    if (this.cache.size >= this.config.maxEntries) {
      // Stratégie d'éviction : supprimer l'entrée la plus ancienne
      let oldestKey: string | undefined;
      let oldestTimestamp = Infinity;
      
      for (const [k, entry] of this.cache.entries()) {
        if (entry.lastAccessed < oldestTimestamp) {
          oldestTimestamp = entry.lastAccessed;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Déterminer la durée de vie
    const effectiveTTL = ttl || 
      (this.config.domainConfig[domain]?.ttl || this.config.defaultTTL);
    
    const now = Date.now();
    
    // Créer l'entrée
    const entry: SimpleCacheEntry = {
      key,
      value,
      domain,
      expiresAt: now + (effectiveTTL * 1000),
      createdAt: now,
      lastAccessed: now,
      hits: 0,
      query
    };
    
    // Mettre en cache
    this.cache.set(key, entry);
    
    // Mettre à jour les statistiques
    this.domainEntryCounts[domain] = (this.domainEntryCounts[domain] || 0) + 1;
    
    // Ajouter un log
    this.addLog('set', domain, undefined, query, key);
  }

  /**
   * Supprime une entrée du cache
   * @param key Clé de cache
   */
  public delete(key: string): void {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      this.cache.delete(key);
      
      // Mettre à jour les statistiques
      if (this.domainEntryCounts[entry.domain] > 0) {
        this.domainEntryCounts[entry.domain]--;
      }
      
      // Ajouter un log
      this.addLog('delete', entry.domain, undefined, entry.query, key);
    }
  }

  /**
   * Vide le cache
   */
  public clear(): void {
    this.cache.clear();
    this.domainEntryCounts = {};
    this.domainHitCounts = {};
    
    // Ajouter un log
    this.addLog('clear', 'all');
  }

  /**
   * Ajoute une entrée de log
   * @param action Type d'action
   * @param domain Domaine concerné
   * @param userId ID utilisateur optionnel
   * @param query Requête optionnelle
   * @param key Clé de cache optionnelle
   */
  private addLog(
    action: CacheLogAction,
    domain: string,
    userId?: number,
    query?: string,
    key?: string
  ): void {
    this.logQueue.push({
      timestamp: Date.now(),
      action,
      domain,
      userId,
      query,
      key
    });
    
    // Limiter la taille de la file de logs
    if (this.logQueue.length > this.config.maxLogEntries) {
      this.logQueue.shift();
    }
  }

  /**
   * Enregistre un hit de cache pour les statistiques
   * @param domain Domaine concerné
   * @param description Description optionnelle
   */
  public logCacheHit(domain: string, description = 'Cache hit'): void {
    this.addLog('hit', domain, undefined, description);
  }

  /**
   * Enregistre un miss de cache pour les statistiques
   * @param domain Domaine concerné
   * @param description Description optionnelle
   */
  public logCacheMiss(domain: string, description = 'Cache miss'): void {
    this.addLog('miss', domain, undefined, description);
  }

  /**
   * Récupère les statistiques du cache
   */
  public getStats() {
    // Calculer le nombre total d'entrées et de hits
    const totalEntries = this.cache.size;
    const totalHits = Object.values(this.domainHitCounts).reduce((sum, count) => sum + count, 0);
    
    // Trouver les requêtes les plus fréquentes
    const topQueries = Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10)
      .map(entry => ({
        query: entry.query || entry.key,
        domain: entry.domain,
        hits: entry.hits
      }));
    
    return {
      totalEntries,
      totalHits,
      entriesByDomain: { ...this.domainEntryCounts },
      hitsByDomain: { ...this.domainHitCounts },
      topQueries,
      logs: this.logQueue.slice(-100).reverse()
    };
  }
}

// Instance singleton du service
export const simpleCacheService = new SimpleCacheService();