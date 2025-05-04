/**
 * Service amélioré pour Azure OpenAI intégrant le cache et le rate limiter
 */

import { openAIService } from '../services/openai';
import { cacheService } from './cacheService';
import { rateLimiter } from './rateLimiterService';

import { ChatCompletionRequestMessage } from "@shared/schema";

interface ChatMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface EnhancedOpenAIOptions {
  userId?: string;
  domain?: string;
  useCache?: boolean;
  useRateLimiter?: boolean;
  maxTokens?: number;
  temperature?: number;
  context?: any;
}

/**
 * Service qui enrichit les appels à OpenAI avec cache et rate limiting
 */
class EnhancedOpenAIService {
  /**
   * Obtient une réponse OpenAI avec cache et rate limiting
   * 
   * @param messages Messages de la conversation
   * @param options Options supplémentaires
   * @returns La réponse d'OpenAI
   */
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    options: EnhancedOpenAIOptions = {}
  ): Promise<string> {
    const {
      userId = 'anonymous',
      domain = 'general',
      useCache = true,
      useRateLimiter = true,
      maxTokens,
      temperature,
      context
    } = options;
    
    try {
      // Extraire la dernière question de l'utilisateur pour le cache
      const userMessages = messages.filter(msg => msg.role === 'user');
      const lastUserMessage = userMessages.length > 0 
        ? userMessages[userMessages.length - 1].content 
        : '';
      
      // Vérifier le cache si activé
      if (useCache && lastUserMessage) {
        const cachedResponse = cacheService.get(lastUserMessage, domain, context);
        if (cachedResponse) {
          console.log(`Cache hit pour utilisateur ${userId} dans le domaine ${domain}`);
          return cachedResponse;
        }
      }
      
      // Vérifier le rate limiter si activé
      if (useRateLimiter) {
        const key = `user:${userId}`;
        const canProceed = await rateLimiter.checkRateLimit(key, domain);
        
        if (!canProceed) {
          throw new Error('Limite de débit atteinte. Veuillez réessayer plus tard.');
        }
      }
      
      // Obtenir la réponse d'OpenAI
      const response = await openAIService.getChatCompletion(
        messages,
        maxTokens,
        temperature
      );
      
      // Mettre en cache si activé
      if (useCache && lastUserMessage && response) {
        cacheService.set(lastUserMessage, response, domain, context);
      }
      
      return response;
    } catch (error) {
      // En cas d'erreur, libérer le rate limiter pour ne pas pénaliser l'utilisateur
      if (useRateLimiter && userId) {
        rateLimiter.releaseLimit(`user:${userId}`);
      }
      
      // Relancer l'erreur pour qu'elle soit gérée en amont
      throw error;
    }
  }
  
  /**
   * Réinitialise les limites de débit pour un utilisateur
   */
  resetRateLimits(userId: string): void {
    rateLimiter.resetLimits(`user:${userId}`);
  }
  
  /**
   * Invalide le cache pour un domaine spécifique
   */
  invalidateCache(domain: string): number {
    return cacheService.invalidateForDomain(domain);
  }
  
  /**
   * Obtient les statistiques d'utilisation
   */
  getStats(): {
    cache: ReturnType<typeof cacheService.getStats>,
    rateLimiter: ReturnType<typeof rateLimiter.getStats>
  } {
    return {
      cache: cacheService.getStats(),
      rateLimiter: rateLimiter.getStats()
    };
  }
}

// Exporter une instance singleton
export const enhancedOpenAIService = new EnhancedOpenAIService();