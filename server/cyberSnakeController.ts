import { Request, Response } from 'express';
import { getOpenAIClient } from './services/openai';

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

    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    // Extraction et nettoyage des données
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Réponse d'Azure OpenAI vide");
    }

    // Parse le JSON 
    const jsonData = JSON.parse(content);
    
    if (!jsonData.practices || !Array.isArray(jsonData.practices)) {
      throw new Error("Format de réponse incorrect");
    }

    // Retour des pratiques
    res.json({ 
      success: true, 
      practices: jsonData.practices 
    });
  } catch (error) {
    console.error("Erreur lors de la génération des pratiques de cybersécurité:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erreur lors de la génération des pratiques" 
    });
  }
}