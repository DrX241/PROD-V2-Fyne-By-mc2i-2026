/**
 * Service de cache pour réduire les appels à l'API OpenAI
 */

interface CacheEntry {
  response: any;            // Réponse mise en cache
  timestamp: number;        // Timestamp de création
  hits: number;             // Nombre de fois où cette entrée a été utilisée
  lastUsed: number;         // Dernier moment où l'entrée a été utilisée
}

class CacheService {
  // Map pour stocker les entrées de cache par domaine et clé
  private cache: Map<string, CacheEntry> = new Map();
  
  // Configuration par défaut du cache
  private defaultConfig = {
    ttl: 3600 * 1000,           // Time to live: 1 heure par défaut
    maxEntries: 1000,           // Nombre maximum d'entrées dans le cache
    similarityThreshold: 0.85,  // Seuil de similarité pour la recherche floue
    cleanupInterval: 300 * 1000 // Intervalle de nettoyage: 5 minutes
  };
  
  // Configurations spécifiques par domaine
  private domainConfigs: Record<string, Partial<typeof this.defaultConfig>> = {
    'cybersecurite': {
      ttl: 24 * 3600 * 1000,     // 24 heures pour la cybersécurité (informations plus stables)
      similarityThreshold: 0.9   // Seuil plus élevé pour plus de précision
    },
    'amoa': {
      ttl: 12 * 3600 * 1000,     // 12 heures pour l'AMOA
      maxEntries: 500            // Moins d'entrées car domaine plus spécifique
    }
  };

  constructor() {
    // Configurer le nettoyage périodique du cache
    setInterval(() => this.cleanupCache(), this.defaultConfig.cleanupInterval);
  }
  
  /**
   * Génère une clé de cache basée sur le contenu de la requête
   */
  private generateCacheKey(query: string, domain: string, context?: any): string {
    // Normaliser le texte de la requête (minuscules, espaces supprimés)
    const normalizedQuery = query.toLowerCase().trim();
    
    // Ajouter un préfixe de domaine pour séparer les caches par domaine
    let key = `${domain}:${normalizedQuery}`;
    
    // Si un contexte est fourni, l'ajouter à la clé
    if (context) {
      try {
        // Si le contexte est un objet, le convertir en chaîne JSON
        const contextStr = typeof context === 'object' 
          ? JSON.stringify(context)
          : String(context);
        
        key += `:${contextStr}`;
      } catch (error) {
        console.warn('Erreur lors de la génération de la clé de cache avec contexte', error);
      }
    }
    
    return key;
  }
  
  /**
   * Calcule un score de similarité entre deux chaînes de texte
   * Basé sur une version simplifiée de la distance de Jaccard
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Convertir les chaînes en ensembles de mots
    const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    // Si l'une des chaînes est vide, retourner 0
    if (words1.size === 0 || words2.size === 0) return 0;
    
    // Calculer l'intersection
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    
    // Calculer l'union
    const union = new Set([...words1, ...words2]);
    
    // Retourner la similarité de Jaccard
    return intersection.size / union.size;
  }
  
  /**
   * Recherche une entrée dans le cache qui correspond à la requête
   */
  get(query: string, domain: string, context?: any): any | null {
    // Récupérer la configuration pour ce domaine
    const config = this.getConfig(domain);
    
    // Générer la clé de cache
    const exactKey = this.generateCacheKey(query, domain, context);
    
    // Vérifier si une correspondance exacte existe
    if (this.cache.has(exactKey)) {
      const entry = this.cache.get(exactKey)!;
      
      // Vérifier si l'entrée est toujours valide
      if (Date.now() - entry.timestamp < config.ttl) {
        // Mettre à jour les statistiques d'utilisation
        entry.hits++;
        entry.lastUsed = Date.now();
        this.cache.set(exactKey, entry);
        
        return entry.response;
      } else {
        // Supprimer l'entrée expirée
        this.cache.delete(exactKey);
      }
    }
    
    // Si la recherche floue est activée, chercher des entrées similaires
    // (seulement si le seuil est < 1.0, sinon on requiert une correspondance exacte)
    if (config.similarityThreshold < 1.0) {
      const keys = Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${domain}:`));
      
      // Trouver la clé la plus similaire
      let bestMatch = null;
      let bestSimilarity = 0;
      
      for (const key of keys) {
        const entry = this.cache.get(key)!;
        
        // Vérifier si l'entrée est toujours valide
        if (Date.now() - entry.timestamp >= config.ttl) continue;
        
        // Extraire la partie requête de la clé
        const keyParts = key.split(':');
        keyParts.shift(); // Enlever le domaine
        const keyQuery = keyParts.join(':');
        
        // Calculer la similarité
        const similarity = this.calculateSimilarity(query, keyQuery);
        
        // Si la similarité est suffisante et meilleure que les précédentes
        if (similarity > config.similarityThreshold && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }
      
      // Si une correspondance a été trouvée
      if (bestMatch) {
        bestMatch.hits++;
        bestMatch.lastUsed = Date.now();
        
        return bestMatch.response;
      }
    }
    
    // Aucune correspondance trouvée
    return null;
  }
  
  /**
   * Ajoute une entrée au cache
   */
  set(query: string, response: any, domain: string, context?: any): void {
    // Générer la clé de cache
    const key = this.generateCacheKey(query, domain, context);
    
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      hits: 1,
      lastUsed: Date.now()
    };
    
    // Ajouter l'entrée au cache
    this.cache.set(key, entry);
    
    // Si le cache dépasse sa taille maximale, supprimer les entrées les moins utilisées
    const config = this.getConfig(domain);
    if (this.cache.size > config.maxEntries) {
      this.trimCache();
    }
  }
  
  /**
   * Obtient la configuration applicable pour un domaine
   */
  private getConfig(domain: string): typeof this.defaultConfig {
    const domainConfig = this.domainConfigs[domain] || {};
    return { ...this.defaultConfig, ...domainConfig };
  }
  
  /**
   * Nettoie le cache en supprimant les entrées expirées
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      // Extraire le domaine de la clé
      const domain = key.split(':')[0];
      const config = this.getConfig(domain);
      
      // Supprimer les entrées expirées
      if (now - entry.timestamp > config.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Réduit la taille du cache en supprimant les entrées les moins utilisées
   */
  private trimCache(): void {
    // Trier les entrées par nombre d'utilisations et date de dernière utilisation
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        // D'abord par hits
        if (a.hits !== b.hits) {
          return a.hits - b.hits;
        }
        // Puis par dernier accès (les plus anciens d'abord)
        return a.lastUsed - b.lastUsed;
      });
    
    // Supprimer les 20% d'entrées les moins utilisées
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
  
  /**
   * Invalide les entrées du cache pour un domaine spécifique
   */
  invalidateForDomain(domain: string): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${domain}:`)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Obtient des statistiques sur l'utilisation du cache
   */
  getStats(): {
    totalEntries: number,
    totalHits: number,
    entriesByDomain: Record<string, number>,
    hitsByDomain: Record<string, number>,
    topQueries: Array<{query: string, domain: string, hits: number}>
  } {
    let totalHits = 0;
    const entriesByDomain: Record<string, number> = {};
    const hitsByDomain: Record<string, number> = {};
    
    // Collecter les statistiques
    for (const [key, entry] of this.cache.entries()) {
      const domain = key.split(':')[0];
      
      totalHits += entry.hits;
      
      // Compteur d'entrées par domaine
      entriesByDomain[domain] = (entriesByDomain[domain] || 0) + 1;
      
      // Compteur de hits par domaine
      hitsByDomain[domain] = (hitsByDomain[domain] || 0) + entry.hits;
    }
    
    // Collecter les requêtes les plus populaires
    const topQueries = Array.from(this.cache.entries())
      .map(([key, entry]) => {
        const parts = key.split(':');
        const domain = parts[0];
        const query = parts.slice(1).join(':');
        
        return {
          query,
          domain,
          hits: entry.hits
        };
      })
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);
    
    return {
      totalEntries: this.cache.size,
      totalHits,
      entriesByDomain,
      hitsByDomain,
      topQueries
    };
  }
  
  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Exporter une instance singleton
export const cacheService = new CacheService();