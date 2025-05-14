import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";
import { cyberPulseSessions } from "./cyberPulseGameController";

/**
 * Termine une session CyberPULSE et génère un résumé d'apprentissage
 * Cette fonction est appelée lorsque l'utilisateur clique sur "Terminer la session"
 * ou quand l'inactivité dépasse le seuil de 3 minutes
 */
export async function terminateCyberPulseSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session manquant" });
    }
    
    // La Map des sessions est déjà importée depuis le contrôleur principal
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Vérifier s'il y a eu des échanges réels dans la conversation
    // Compter uniquement les messages de l'utilisateur (role: "user")
    const userMessageCount = session.messages.filter((msg: ChatCompletionRequestMessage) => msg.role === "user").length;
    
    // Par défaut, indiquer qu'aucun échange significatif n'a eu lieu
    let summary = "Aucun échange significatif n'a eu lieu lors de cette session.";
    
    // S'il y a eu au moins 2 messages de l'utilisateur, générer un résumé
    const hasRealConversation = userMessageCount > 2;
    
    if (hasRealConversation) {
      try {
        // Construire le prompt pour générer le résumé
        const promptSummary = `
          Résume cette session CyberPULSE de manière concise et éducative.
          
          Ton résumé doit:
          - Identifier 2-3 concepts clés de cybersécurité abordés
          - Souligner les points d'apprentissage importants
          - Être concis (max 100 mots)
          - Avoir un ton pédagogique et encourageant
          - Valoriser les progrès et connaissances acquises
          
          Si l'utilisateur a participé à des quiz ou jeux, mentionne son score: ${session.gameState.score} points.
          
          Format: paragraphe clair et structuré, facile à lire.
        `;
        
        // Générer le résumé via l'IA avec paramètres optimisés
        const aiSummary = await openAIService.getChatCompletion(
          [
            { role: "system", content: "Tu es CyberPULSE, un assistant pédagogique spécialisé en cybersécurité. Ton objectif est de créer des résumés éducatifs et encourageants." },
            ...session.messages.slice(0, -1), // Exclure le dernier message qui serait la demande de fin
            { role: "user", content: promptSummary }
          ],
          true, // Utiliser le modèle GPT-4o-mini pour économiser des ressources
          0.7, // Température réduite pour plus de cohérence
          600 // Longueur max du résumé
        );
        
        summary = aiSummary || summary; // Si l'IA échoue, utiliser le message par défaut
        
      } catch (error) {
        console.error("Erreur lors de la génération du résumé:", error);
        // En cas d'erreur, garder le message par défaut
      }
    }
    
    // Nettoyer la session
    cyberPulseSessions.delete(sessionId);
    
    // Renvoyer le résumé avec les statistiques de jeu
    return res.status(200).json({
      success: true,
      summary,
      stats: {
        score: session.gameState.score,
        playerLevel: session.playerLevel,
        challengesCompleted: session.gameState.challengesCompleted,
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de la terminaison de la session CyberPULSE:", error);
    return res.status(500).json({ error: "Erreur lors de la terminaison de la session" });
  }
}