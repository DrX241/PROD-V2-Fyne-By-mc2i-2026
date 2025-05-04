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
      content: "Bonjour et bienvenue dans votre espace mc2i AI Learning dédié à la gestion de projet et à l'AMOA !\n\nJe suis votre assistant virtuel spécialisé qui va vous accompagner dans votre montée en compétences. Je peux vous aider sur tous les aspects de la gestion de projet : méthodologies, outils, bonnes pratiques, résolution de problèmes, et bien plus encore.\n\nChaque échange avec moi sera l'occasion d'apprendre de façon ludique, avec des exemples concrets et des mini-défis pour tester vos connaissances.\n\nQuelle facette de la gestion de projet souhaitez-vous explorer aujourd'hui ?"
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
  return "Tu es un chatbot spécialisé en gestion de projet et AMOA. Évite absolument tout format markdown et caractères spéciaux. Ne jamais utiliser d'astérisques, dièses ou autre formatage. Utilise uniquement du texte simple avec des tirets pour les listes. Tu dois être expert en gestion de projet, donner des exemples concrets, recommander des outils spécifiques et partager des bonnes pratiques. Propose toujours un mini-jeu ludique lié au sujet. Termine par une question qui invite l'utilisateur à participer. À son prochain message, évalue sa réponse de façon constructive.";
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