import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Interface pour les messages échangés avec l'assistant
 */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Gère une conversation avec un assistant personnalisé
 */
export async function chatWithCustomAssistant(req: Request, res: Response) {
  try {
    const { 
      message, 
      systemPrompt, 
      assistantName, 
      assistantPersonality, 
      assistantDomain,
      history = [] 
    } = req.body;

    if (!message || !systemPrompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le message et les instructions système sont requis' 
      });
    }

    // Construire le contexte de la conversation
    const conversationContext: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt } as ChatCompletionRequestMessage
    ];
    
    // Ajouter l'historique des messages
    if (history && history.length > 0) {
      // Convertir l'historique au format ChatCompletionRequestMessage
      history.forEach((msg: ChatMessage) => {
        conversationContext.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        } as ChatCompletionRequestMessage);
      });
    }

    // Ajouter le nouveau message de l'utilisateur
    conversationContext.push({ 
      role: 'user', 
      content: message 
    } as ChatCompletionRequestMessage);

    // Obtenir la réponse d'OpenAI
    const response = await openAIService.getChatCompletion(
      conversationContext,
      0.7,
      1500
    );

    // Extraire le contenu de la réponse (getChatCompletion retourne directement le contenu)
    const assistantResponse = response || 
      "Je suis désolé, mais je n'ai pas pu générer une réponse. Veuillez réessayer.";

    return res.status(200).json({
      success: true,
      response: assistantResponse
    });

  } catch (error) {
    console.error('Erreur lors de la génération de réponse :', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la génération de la réponse' 
    });
  }
}