/**
 * Service de cache intelligent pour les réponses de l'API OpenAI
 * Ce service permet de mettre en cache les réponses fréquentes et d'optimiser les coûts d'API
 */

import { ChatCompletionRequestMessage } from './openAiTypes';

/**
 * Entrée dans le cache
 */
interface CacheEntry {
  // Clé de cache
  key: string;
  // Domaine du contenu mis en cache (cybersecurite, amoa, etc.)
  domain: string;
  // Requête d'origine (prompt utilisateur)
  query: string;
  // Réponse mise en cache
  response: string;
  // Date d'expiration
  expiresAt: number;
  // Nombre de hits
  hits: number;
  // Dernier accès
  lastAccessed: number;
  // Indicateur de réponse exacte ou approximative (similarité)
  exact: boolean;
}

/**
 * Configuration du cache
 */
interface CacheConfig {
  // Durée de vie par défaut (en minutes)
  defaultTTL: number; 
  // Taille maximale du cache
  maxSize: number;
  // Seuil de similarité pour considérer une requête comme similaire (0.0 - 1.0)
  similarityThreshold: number;
  // Configuration par domaine
  domainConfig: Record<string, {
    // Durée de vie spécifique au domaine (en minutes)
    ttl: number;
  }>;
}

/**
 * Log d'une opération de cache
 */
interface CacheLog {
  // Horodatage de l'opération
  timestamp: number;
  // Type d'opération (hit, miss, set, invalidate, clear)
  action: 'hit' | 'miss' | 'set' | 'invalidate' | 'clear';
  // Domaine concerné
  domain: string;
  // ID utilisateur (optionnel)
  userId?: string;
  // Requête d'origine (prompt utilisateur)
  query?: string;
  // Clé de cache
  cacheKey?: string;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private logQueue: CacheLog[] = [];
  private maxLogQueueSize = 1000;
  private domainHitCounts: Record<string, number> = {};
  private domainEntryCounts: Record<string, number> = {};

  constructor() {
    // Configuration par défaut
    this.config = {
      defaultTTL: 60, // 60 minutes (1 heure)
      maxSize: 1000,  // 1000 entrées
      similarityThreshold: 0.85, // 85% de similarité
      domainConfig: {
        'general': { ttl: 60 }, // 1 heure
        'cybersecurite': { ttl: 1440 }, // 24 heures
        'amoa': { ttl: 720 }, // 12 heures
        'data_ia': { ttl: 360 }, // 6 heures
        'developpement': { ttl: 1440 }, // 24 heures
        'cloud': { ttl: 720 }, // 12 heures
        'agile': { ttl: 720 }, // 12 heures
      }
    };
  }

  /**
   * Crée une clé de cache à partir des messages
   * @param messages Messages de la requête
   * @param domain Domaine de la requête
   * @returns Clé de cache
   */
  private createCacheKey(messages: ChatCompletionRequestMessage[], domain?: string): string {
    // Simplifier les messages pour créer une clé plus stable
    const simplifiedMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    }));
    
    // Créer une clé à partir des messages simplifiés
    const key = JSON.stringify(simplifiedMessages);
    
    // Préfixer avec le domaine si fourni
    return domain ? `${domain}:${key}` : key;
  }

  /**
   * Extrait le texte de la requête pour l'analyse
   * @param messages Messages de la requête
   * @returns Texte de la requête
   */
  private extractQueryText(messages: ChatCompletionRequestMessage[]): string {
    // Récupérer le dernier message utilisateur
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return '';
    
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // Extraire le contenu textuel
    if (typeof lastUserMessage.content === 'string') {
      return lastUserMessage.content;
    } else if (Array.isArray(lastUserMessage.content)) {
      // Pour les messages multimodaux, extraire le texte
      return lastUserMessage.content
        .filter(part => typeof part === 'object' && part.type === 'text')
        .map(part => (part as { text: string }).text)
        .join(' ');
    }
    
    return '';
  }

  /**
   * Calcule la similarité entre deux textes
   * Utilise une implémentation simple de similarité basée sur les mots communs
   * @param text1 Premier texte
   * @param text2 Deuxième texte
   * @returns Score de similarité entre 0 et 1
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    // Normaliser les textes
    const normalize = (text: string): string[] => {
      return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
    };
    
    const words1 = normalize(text1);
    const words2 = normalize(text2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Calculer l'intersection des mots
    const intersection = words1.filter(word => words2.includes(word));
    
    // Calculer la similarité de Jaccard
    return intersection.length / (words1.length + words2.length - intersection.length);
  }

  /**
   * Recherche une entrée de cache par similarité
   * @param query Texte de la requête
   * @param domain Domaine de la requête
   * @param threshold Seuil de similarité
   * @returns Entrée trouvée ou null
   */
  private findSimilarEntry(query: string, domain: string, threshold = this.config.similarityThreshold): CacheEntry | null {
    if (!query) return null;
    
    let bestMatch: CacheEntry | null = null;
    let bestSimilarity = threshold;
    
    // Parcourir les entrées du cache pour le domaine spécifié
    for (const entry of this.cache.values()) {
      if (entry.domain !== domain) continue;
      
      const similarity = this.calculateSimilarity(query, entry.query);
      
      if (similarity > bestSimilarity) {
        bestMatch = entry;
        bestSimilarity = similarity;
      }
    }
    
    return bestMatch;
  }

  /**
   * Récupère une réponse du cache
   * @param messages Messages de la requête
   * @param domain Domaine de la requête
   * @returns Réponse mise en cache ou null
   */
  public get(messages: ChatCompletionRequestMessage[], domain = 'general'): string | null {
    const now = Date.now();
    const cacheKey = this.createCacheKey(messages, domain);
    const queryText = this.extractQueryText(messages);
    
    // Vérifier si la requête exacte est en cache
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      
      // Vérifier si l'entrée n'est pas expirée
      if (entry.expiresAt > now) {
        // Mettre à jour les statistiques
        entry.hits++;
        entry.lastAccessed = now;
        this.domainHitCounts[domain] = (this.domainHitCounts[domain] || 0) + 1;
        
        // Ajouter un log
        this.addLog('hit', domain, undefined, queryText, cacheKey);
        
        return entry.response;
      } else {
        // Entrée expirée, la supprimer
        this.cache.delete(cacheKey);
        
        // Mettre à jour les statistiques du domaine
        if (this.domainEntryCounts[domain]) {
          this.domainEntryCounts[domain]--;
        }
      }
    }
    
    // Rechercher une entrée similaire
    const similarEntry = this.findSimilarEntry(queryText, domain);
    if (similarEntry) {
      // Mettre à jour les statistiques
      similarEntry.hits++;
      similarEntry.lastAccessed = now;
      this.domainHitCounts[domain] = (this.domainHitCounts[domain] || 0) + 1;
      
      // Ajouter un log
      this.addLog('hit', domain, undefined, queryText, similarEntry.key);
      
      return similarEntry.response;
    }
    
    // Aucune entrée trouvée
    this.addLog('miss', domain, undefined, queryText);
    return null;
  }

  /**
   * Met en cache une réponse
   * @param messages Messages de la requête
   * @param response Réponse à mettre en cache
   * @param domain Domaine de la requête
   * @param userId ID utilisateur optionnel
   */
  public set(messages: ChatCompletionRequestMessage[], response: string, domain = 'general', userId?: string): void {
    const now = Date.now();
    const cacheKey = this.createCacheKey(messages, domain);
    const queryText = this.extractQueryText(messages);
    
    // Calculer la durée de vie
    const ttlMinutes = this.config.domainConfig[domain]?.ttl || this.config.defaultTTL;
    const expiresAt = now + (ttlMinutes * 60 * 1000);
    
    // Créer l'entrée
    const entry: CacheEntry = {
      key: cacheKey,
      domain,
      query: queryText,
      response,
      expiresAt,
      hits: 0,
      lastAccessed: now,
      exact: true
    };
    
    // Vérifier si le cache est plein
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }
    
    // Ajouter l'entrée au cache
    this.cache.set(cacheKey, entry);
    
    // Mettre à jour les statistiques du domaine
    this.domainEntryCounts[domain] = (this.domainEntryCounts[domain] || 0) + 1;
    
    // Ajouter un log
    this.addLog('set', domain, userId, queryText, cacheKey);
  }

  /**
   * Supprime les entrées les moins utilisées du cache
   */
  private evictLeastUsed(): void {
    // Trier les entrées par date de dernier accès
    const entries = Array.from(this.cache.entries())
      .sort(([_, a], [__, b]) => a.lastAccessed - b.lastAccessed);
    
    // Supprimer 10% des entrées les moins utilisées
    const toRemove = Math.max(1, Math.floor(this.cache.size * 0.1));
    
    for (let i = 0; i < toRemove; i++) {
      if (entries.length > i) {
        const [key, entry] = entries[i];
        this.cache.delete(key);
        
        // Mettre à jour les statistiques du domaine
        if (this.domainEntryCounts[entry.domain]) {
          this.domainEntryCounts[entry.domain]--;
        }
      }
    }
  }

  /**
   * Invalide toutes les entrées d'un domaine spécifique
   * @param domain Domaine à invalider
   * @returns Nombre d'entrées supprimées
   */
  public invalidateDomain(domain: string): number {
    let count = 0;
    
    // Parcourir toutes les entrées et supprimer celles du domaine spécifié
    for (const [key, entry] of this.cache.entries()) {
      if (entry.domain === domain) {
        this.cache.delete(key);
        count++;
      }
    }
    
    // Réinitialiser les statistiques du domaine
    this.domainEntryCounts[domain] = 0;
    this.domainHitCounts[domain] = 0;
    
    // Ajouter un log
    this.addLog('invalidate', domain);
    
    return count;
  }

  /**
   * Vide le cache entièrement
   */
  public clear(): void {
    this.cache.clear();
    this.domainEntryCounts = {};
    this.domainHitCounts = {};
    
    // Ajouter un log
    this.addLog('clear', 'all');
  }

  /**
   * Configure le service de cache
   * @param config Nouvelle configuration
   */
  public configure(config: Partial<CacheConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      domainConfig: {
        ...this.config.domainConfig,
        ...(config.domainConfig || {})
      }
    };
  }

  /**
   * Ajoute une entrée de log
   * @param action Type d'action
   * @param domain Domaine concerné
   * @param userId ID utilisateur optionnel
   * @param query Requête optionnelle
   * @param cacheKey Clé de cache optionnelle
   */
  private addLog(
    action: 'hit' | 'miss' | 'set' | 'invalidate' | 'clear',
    domain: string,
    userId?: string,
    query?: string,
    cacheKey?: string
  ): void {
    this.logQueue.push({
      timestamp: Date.now(),
      action,
      domain,
      userId,
      query,
      cacheKey
    });
    
    // Limiter la taille de la file de logs
    if (this.logQueue.length > this.maxLogQueueSize) {
      this.logQueue.shift();
    }
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
        query: entry.query,
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
export const cacheService = new CacheService();