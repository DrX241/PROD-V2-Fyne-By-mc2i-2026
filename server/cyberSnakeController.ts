import { Request, Response } from 'express';
import { openAIService } from './services/openai';
// Définir nos propres types pour éviter les problèmes de compatibilité
type Role = "system" | "user" | "assistant";
interface MessageType {
  role: Role;
  content: string;
}

interface CyberPractice {
  text: string;
  isGood: boolean;
  explanation: string;
}

/**
 * Génère des pratiques de cybersécurité aléatoires (bonnes et mauvaises) via Azure OpenAI
 */
export async function generateCyberPractices(req: Request, res: Response) {
  try {
    const count = parseInt(req.query.count as string) || 10;
    
    // Configuration du prompt
    const systemPrompt = `Tu es un expert en cybersécurité. Génère un ensemble de pratiques de cybersécurité, 
    comprenant à la fois de bonnes et de mauvaises pratiques. 
    Pour chaque élément, fournis le texte (court, max 6 mots), indique s'il s'agit d'une bonne pratique (true) 
    ou d'une mauvaise pratique (false), et une brève explication (maximum 20 mots) sur pourquoi c'est une bonne ou 
    mauvaise pratique. Le format de sortie doit être un tableau JSON strict.`;

    const userPrompt = `Génère ${count} pratiques de cybersécurité aléatoires, avec environ 50% de bonnes pratiques 
    et 50% de mauvaises pratiques. Assure-toi que chaque pratique est clairement identifiable comme bonne ou mauvaise. 
    Évite les nuances ou les ambiguïtés.`;

    // Utiliser le service OpenAI avec la méthode correcte
    const messages: MessageType[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    // Obtenir la réponse formatée en JSON
    // Convertir nos messages au format attendu par le service
    const formattedMessages = messages.map(m => {
      return {
        role: m.role,
        content: m.content
      };
    });
    
    const responseContent = await openAIService.getChatCompletion(
      formattedMessages as any, // Convertir le type pour éviter les erreurs
      0.7,  // temperature
      1000  // maxTokens
    );

    // Extraction et nettoyage des données
    if (!responseContent) {
      throw new Error("Réponse d'Azure OpenAI vide");
    }

    // Parse le JSON 
    const jsonData = JSON.parse(responseContent);
    
    if (!jsonData.practices || !Array.isArray(jsonData.practices)) {
      throw new Error("Format de réponse incorrect");
    }

    // Retour des pratiques
    res.json({ 
      success: true, 
      practices: jsonData.practices 
    });
  } catch (error: any) {
    console.error("Erreur lors de la génération des pratiques de cybersécurité:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erreur lors de la génération des pratiques" 
    });
  }
}