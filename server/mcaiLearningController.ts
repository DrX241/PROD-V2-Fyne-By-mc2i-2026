import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de chatbot
interface ChatSession {
  messages: Array<ChatCompletionRequestMessage>;
}

// Map pour stocker les sessions par ID utilisateur
const chatSessions = new Map<string, ChatSession>();

/**
 * Initialise une session de chatbot mc2i AI Learning
 */
export async function initMcaiLearningSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }

    // Créer une nouvelle session ou réinitialiser une existante
    const session: ChatSession = {
      messages: []
    };

    // Ajouter le message système initial
    session.messages.push({
      role: "system",
      content: getChatSystemPrompt()
    } as ChatCompletionRequestMessage);

    // Stocker la session
    chatSessions.set(userId, session);

    // Générer le message d'accueil
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour ! Je suis le chatbot mc2i AI Learning. Je peux répondre à toutes vos questions sur les technologies, la formation, ou n'importe quel autre sujet. Comment puis-je vous aider aujourd'hui ?"
    };

    session.messages.push(welcomeMessage);

    return res.status(200).json({ 
      success: true,
      message: welcomeMessage.content
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation de la session" });
  }
}

/**
 * Traite un message envoyé au chatbot
 */
export async function processMcaiLearningMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "ID utilisateur ou message manquant" });
    }

    // Récupérer la session existante
    let session = chatSessions.get(userId);
    
    // Créer une nouvelle session si elle n'existe pas
    if (!session) {
      session = {
        messages: [{
          role: "system",
          content: getChatSystemPrompt()
        } as ChatCompletionRequestMessage]
      };
      chatSessions.set(userId, session);
    }

    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: "user",
      content: message
    } as ChatCompletionRequestMessage);

    // Obtenir une réponse de l'IA
    const aiResponse = await generateResponse(session);

    // Ajouter la réponse de l'IA à l'historique
    session.messages.push({
      role: "assistant",
      content: aiResponse
    } as ChatCompletionRequestMessage);

    // Gérer la taille de l'historique (limiter à 20 messages pour économiser des tokens)
    if (session.messages.length > 21) {
      // Garder le message système et les 20 derniers messages
      session.messages = [
        session.messages[0],
        ...session.messages.slice(-20)
      ];
    }

    return res.status(200).json({ 
      success: true,
      message: aiResponse
    });
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Génère le prompt système pour le chatbot
 */
function getChatSystemPrompt(): string {
  return `Tu es mc2i AI Learning, un chatbot conçu pour répondre à toutes les questions des utilisateurs. 
Tu es cordial, précis et serviable. 
Tu as des connaissances dans les domaines suivants :
- Technologie et informatique
- Conseil et méthodologies
- Gestion de projet
- Formation et développement personnel
- Actualités et tendances professionnelles

Sois concis et précis dans tes réponses. Si tu ne connais pas la réponse à une question, indique-le clairement.

Évite de :
- Fournir des informations incorrectes
- Adopter un ton condescendant
- Faire de la promotion non sollicitée

Adapte ton niveau de langage à celui de l'utilisateur. S'il pose des questions techniques, tu peux utiliser un vocabulaire technique. Si ses questions sont basiques, garde un langage simple et accessible.`;
}

/**
 * Génère une réponse basée sur l'historique des messages
 */
async function generateResponse(session: ChatSession): Promise<string> {
  try {
    // Limiter le nombre de messages envoyés pour économiser des tokens
    const contextMessages = 
      session.messages.length <= 10 
        ? session.messages 
        : [session.messages[0], ...session.messages.slice(-9)];
    
    return await openAIService.getChatCompletionWithCache(contextMessages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération d'une réponse:", error);
    return "Désolé, j'ai rencontré une difficulté pour générer une réponse. Pouvez-vous reformuler votre question ?";
  }
}