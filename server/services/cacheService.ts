/**
 * Service de cache intelligent pour les réponses d'OpenAI
 * Permet de réduire le nombre d'appels à l'API en mémorisant les paires question/réponse
 */

// Type pour stocker les entrées du cache
interface CacheEntry {
  response: any;            // Réponse mise en cache
  timestamp: number;        // Timestamp de création
  hits: number;             // Nombre de fois où cette entrée a été utilisée
  lastUsed: number;         // Dernier moment où l'entrée a été utilisée
}

class CacheService {
  // Stockage principal du cache
  private cache: Map<string, CacheEntry> = new Map();
  
  // Configuration par défaut
  private defaultConfig = {
    ttl: 30 * 60 * 1000,      // Time-to-live: 30 minutes par défaut
    maxSize: 1000,            // Nombre maximum d'entrées dans le cache
    minSimilarity: 0.92,      // Seuil de similarité pour considérer des questions comme identiques
    cleanupInterval: 5 * 60 * 1000, // Intervalle de nettoyage: 5 minutes
  };
  
  // Configuration personnalisée par domaine d'assistant
  private domainConfigs: Record<string, Partial<typeof this.defaultConfig>> = {
    cybersecurite: {
      // Les réponses de cybersécurité peuvent changer plus fréquemment
      ttl: 15 * 60 * 1000, // 15 minutes
    },
    data_ia: {
      // Les réponses de data science peuvent être plus stables
      ttl: 60 * 60 * 1000, // 1 heure
    },
    amoa: {
      // Les réponses AMOA sont souvent plus longues et complexes
      minSimilarity: 0.95, // Plus stricte pour éviter des réponses inappropriées
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
    // Normaliser la requête (minuscules, suppression des espaces excessifs)
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Ajouter le domaine pour éviter des correspondances entre domaines différents
    const baseKey = `${domain}:${normalizedQuery}`;
    
    // Si un contexte est fourni, l'inclure dans la clé
    if (context) {
      try {
        // Simplifier le contexte pour ne garder que l'essentiel
        const simplifiedContext = JSON.stringify(context)
          .replace(/["{},]/g, '') // Supprimer la syntaxe JSON
          .replace(/\s+/g, ' ')   // Normaliser les espaces
          .slice(0, 100);         // Limiter la taille
          
        return `${baseKey}:${simplifiedContext}`;
      } catch (e) {
        console.warn('Erreur lors de la génération de la clé de cache avec contexte:', e);
        return baseKey;
      }
    }
    
    return baseKey;
  }
  
  /**
   * Calcule un score de similarité entre deux chaînes de texte
   * Basé sur une version simplifiée de la distance de Jaccard
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Convertir en ensembles de mots
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    // Calculer l'intersection
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    
    // Calculer l'union
    const union = new Set([...words1, ...words2]);
    
    // Retourner le rapport intersection/union (coefficient de Jaccard)
    return intersection.size / union.size;
  }
  
  /**
   * Recherche une entrée dans le cache qui correspond à la requête
   */
  get(query: string, domain: string, context?: any): any | null {
    // Obtenir la configuration applicable
    const config = this.getConfig(domain);
    
    // Générer la clé exacte pour vérifier une correspondance parfaite
    const exactKey = this.generateCacheKey(query, domain, context);
    
    // Si une correspondance exacte existe, la retourner
    if (this.cache.has(exactKey)) {
      const entry = this.cache.get(exactKey)!;
      const now = Date.now();
      
      // Vérifier si l'entrée est toujours valide
      if (now - entry.timestamp <= config.ttl) {
        // Mettre à jour les statistiques
        entry.hits++;
        entry.lastUsed = now;
        return entry.response;
      } else {
        // Entrée expirée, la supprimer
        this.cache.delete(exactKey);
      }
    }
    
    // Si aucune correspondance exacte, chercher une entrée similaire
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
    
    for (const [key, entry] of this.cache.entries()) {
      // Extraire la requête de la clé (format: domaine:requête:contexte)
      const keyParts = key.split(':');
      const keyDomain = keyParts[0];
      const keyQuery = keyParts.length > 1 ? keyParts[1] : '';
      
      // Vérifier si c'est le même domaine
      if (keyDomain !== domain) continue;
      
      // Calculer la similarité
      const similarity = this.calculateSimilarity(normalizedQuery, keyQuery);
      
      // Vérifier si la similarité est suffisante et si l'entrée est valide
      const now = Date.now();
      if (similarity >= config.minSimilarity && (now - entry.timestamp <= config.ttl)) {
        // Mettre à jour les statistiques
        entry.hits++;
        entry.lastUsed = now;
        return entry.response;
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
    
    // Créer l'entrée
    const now = Date.now();
    const entry: CacheEntry = {
      response,
      timestamp: now,
      hits: 1,
      lastUsed: now
    };
    
    // Ajouter au cache
    this.cache.set(key, entry);
    
    // Vérifier si le cache a dépassé sa taille maximale
    if (this.cache.size > this.defaultConfig.maxSize) {
      this.trimCache();
    }
  }
  
  /**
   * Obtient la configuration applicable pour un domaine
   */
  private getConfig(domain: string): typeof this.defaultConfig {
    if (!domain || !this.domainConfigs[domain]) {
      return this.defaultConfig;
    }
    
    return {
      ...this.defaultConfig,
      ...this.domainConfigs[domain]
    };
  }
  
  /**
   * Nettoie le cache en supprimant les entrées expirées
   */
  private cleanupCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Extraire le domaine pour appliquer la configuration spécifique
      const domain = key.split(':')[0];
      const config = this.getConfig(domain);
      
      // Supprimer si expiré
      if (now - entry.timestamp > config.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Cache nettoyé: ${expiredCount} entrées expirées supprimées`);
    }
  }
  
  /**
   * Réduit la taille du cache en supprimant les entrées les moins utilisées
   */
  private trimCache(): void {
    // Trier les entrées par nombre d'utilisations et dernière utilisation
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // D'abord par nombre d'hits
        const hitsDiff = a[1].hits - b[1].hits;
        if (hitsDiff !== 0) return hitsDiff;
        
        // En cas d'égalité, par dernier usage (le plus ancien en premier)
        return a[1].lastUsed - b[1].lastUsed;
      });
    
    // Supprimer 20% des entrées les moins utilisées
    const toRemove = Math.ceil(this.defaultConfig.maxSize * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`Cache réduit: ${toRemove} entrées supprimées`);
  }
  
  /**
   * Invalide les entrées du cache pour un domaine spécifique
   */
  invalidateForDomain(domain: string): number {
    let count = 0;
    
    for (const [key, _] of this.cache.entries()) {
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
    totalEntries: number;
    entriesByDomain: Record<string, number>;
    hitRate: number;
    totalHits: number;
    cacheSize: number;
  } {
    const entriesByDomain: Record<string, number> = {};
    let totalHits = 0;
    
    // Calculer les statistiques
    for (const [key, entry] of this.cache.entries()) {
      const domain = key.split(':')[0];
      entriesByDomain[domain] = (entriesByDomain[domain] || 0) + 1;
      totalHits += entry.hits;
    }
    
    // Estimation de la taille mémoire (approximative)
    const cacheSize = JSON.stringify(Array.from(this.cache.entries())).length;
    
    return {
      totalEntries: this.cache.size,
      entriesByDomain,
      hitRate: totalHits > 0 ? (totalHits - this.cache.size) / totalHits : 0,
      totalHits,
      cacheSize
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