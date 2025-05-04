/**
 * Service OpenAI amélioré avec cache et rate limiting
 * Ce service optimise l'utilisation de l'API OpenAI en mettant en cache les réponses fréquentes
 * et en limitant le débit des requêtes pour éviter les abus
 */

import { openAIService } from './openai';
import { cacheService } from './cacheService';
import { rateLimiterService } from './rateLimiterService';
import { ChatCompletionRequestMessage } from './openAiTypes';

// Type pour les options de requête
interface RequestOptions {
  // Domaine de la requête (cybersecurite, amoa, data_ia, etc.)
  domain?: string;
  // ID utilisateur (pour le rate limiting et les logs)
  userId?: string;
  // Température (0.0 - 2.0)
  temperature?: number;
  // Max tokens
  maxTokens?: number;
  // Désactiver le cache
  disableCache?: boolean;
  // Désactiver le rate limiting
  disableRateLimiting?: boolean;
}

class EnhancedOpenAIService {
  /**
   * Effectue une requête de complétion de chat avec gestion de cache et rate limiting
   * @param messages Messages de la requête
   * @param options Options de la requête
   * @returns Contenu de la réponse
   */
  public async getChatCompletionWithCache(
    messages: ChatCompletionRequestMessage[],
    options: RequestOptions = {}
  ): Promise<string> {
    const {
      domain = 'general',
      userId,
      temperature = 0.7,
      maxTokens,
      disableCache = false,
      disableRateLimiting = false
    } = options;
    
    // Vérifier le cache si activé
    if (!disableCache) {
      const cachedResponse = cacheService.get(messages, domain);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Vérifier les limites de débit si activées
    if (!disableRateLimiting) {
      const userKey = userId ? `user:${userId}` : 'anonymous';
      const isAllowed = await rateLimiterService.check(userKey, domain);
      
      if (!isAllowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }
    
    try {
      // Effectuer la requête à l'API
      const response = await openAIService.getChatCompletion(
        messages,
        temperature,
        maxTokens
      );
      
      // Mettre en cache la réponse si le cache est activé
      if (!disableCache && response) {
        cacheService.set(messages, response, domain, userId);
      }
      
      return response;
    } catch (error) {
      // Gérer les erreurs
      console.error('Enhanced OpenAI Service error:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques combinées du cache et du rate limiter
   */
  public getStats() {
    return {
      cache: cacheService.getStats(),
      rateLimiter: rateLimiterService.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Invalide le cache pour un domaine spécifique
   * @param domain Domaine à invalider
   * @returns Nombre d'entrées supprimées
   */
  public invalidateCache(domain: string): number {
    return cacheService.invalidateDomain(domain);
  }

  /**
   * Vide complètement le cache
   */
  public clearCache(): void {
    cacheService.clear();
  }

  /**
   * Réinitialise les limites de débit pour une clé spécifique
   * @param key Clé à réinitialiser
   */
  public resetRateLimits(key: string): void {
    rateLimiterService.reset(key);
  }

  /**
   * Réinitialise toutes les limites de débit
   */
  public resetAllRateLimits(): void {
    rateLimiterService.resetAll();
  }
}

// Instance singleton du service
export const enhancedOpenAIService = new EnhancedOpenAIService();