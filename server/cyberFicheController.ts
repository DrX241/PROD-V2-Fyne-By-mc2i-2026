import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Génère une fiche de cybersécurité en utilisant Azure OpenAI
 */
export async function generateCyberFiche(req: Request, res: Response) {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Un sujet de fiche est requis',
      });
    }

    // Système prompt pour guider la génération
    const systemPrompt = `Tu es un expert en cybersécurité chargé de créer des fiches éducatives concises et structurées.
    Génère une fiche synthétique sur le sujet demandé en respectant STRICTEMENT cette structure :
    1. Un titre concis et clair (maximum 50 caractères)
    2. Une description courte du sujet (1-2 phrases, maximum 120 caractères)
    3. Un contenu au format Markdown avec EXACTEMENT ce format:
       - 2-3 sections principales maximum (niveau 2 avec ##)
       - Maximum 2 sous-sections par section (niveau 3 avec ###)
       - Paragraphes courts (3-4 lignes maximum)
       - Inclure uniquement des informations essentielles et pratiques
       - Mentionner 2-3 outils ou logiciels spécifiques pertinents
       - Éviter toute statistique sauf si vraiment critique
       - Structure simple: définition, explications, applications pratiques
    4. 3-5 points clés à retenir (courts, une ligne par point)
    5. 2-3 références pertinentes à consulter (noms précis)
    6. Une catégorie parmi: menaces, vulnérabilités, architecture, identité, détection, gouvernance, personnalisé
    7. Un niveau de complexité: débutant, intermédiaire, avancé, tous niveaux
    
    RÈGLES IMPORTANTES:
    - Respecte EXACTEMENT ce format, sans variations
    - Sois concis et clair, évite tout contenu superflu
    - Présente uniquement les informations les plus essentielles
    - Inclus seulement des outils/solutions largement utilisés
    - Limite le contenu à ce qui est strictement nécessaire
    - Organise clairement l'information en sections et sous-sections
    
    Réponds uniquement avec un objet JSON valide (sans formatage de code Markdown), avec les clés suivantes:
    {
      "title": "Titre de la fiche",
      "description": "Description brève",
      "content": "Contenu au format Markdown",
      "keyPoints": ["Point clé 1", "Point clé 2", "Point clé 3"],
      "references": ["Référence 1", "Référence 2"],
      "category": "catégorie",
      "level": "niveau"
    }`;

    // Message utilisateur avec le sujet
    const userPrompt = `Créer une fiche de cybersécurité sur le sujet : ${topic}`;

    // Appel à l'API Azure OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Utilisation du modèle principal (gpt-4o) pour obtenir des réponses plus détaillées et complètes
    const result = await openAIService.getChatCompletionWithModel(messages, 0.7, 3000, true);
    
    // Étape 1: Nettoyer la réponse en cas de backticks
    let cleanedResult = result;
    const backtickRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const backtickMatch = result.match(backtickRegex);
    
    if (backtickMatch && backtickMatch[1]) {
      cleanedResult = backtickMatch[1].trim();
      console.log("Nettoyage des backticks effectué");
    }
    
    // Étape 2: Tenter le parsing JSON
    let ficheData;
    try {
      console.log("Tentative de parsing JSON:", cleanedResult);
      
      ficheData = JSON.parse(cleanedResult);
      console.log("Parsing JSON réussi");
    } 
    catch (error) {
      console.error("Impossible de parser la réponse JSON de l'IA:", error);
      console.error("Réponse brute:", result);
      
      // Si le parsing échoue, créer un objet par défaut avec le contenu brut
      ficheData = {
        title: topic,
        description: "Fiche synthétique sur " + topic,
        content: result.includes("##") ? result : `## ${topic}\n\n${result}`,
        keyPoints: ["Points importants sur ce sujet", "Outils et pratiques recommandés", "Considérations de sécurité"],
        references: ["Documentation technique", "Guides pratiques"],
        category: "personnalisé",
        level: "intermédiaire"
      };
    }

    // Générer un identifiant unique
    const id = `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return res.status(200).json({
      success: true,
      fiche: {
        id,
        title: ficheData.title,
        description: ficheData.description,
        content: ficheData.content,
        keyPoints: ficheData.keyPoints || [],
        references: ficheData.references || [],
        category: ficheData.category || "divers",
        level: ficheData.level || "intermédiaire",
        icon: 'BrainCircuit',
        isFavorite: false,
        hasBeenRead: false
      }
    });
  } catch (err) {
    const error = err as Error;
    console.error('Erreur lors de la génération de la fiche:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la fiche',
      error: error.message,
    });
  }
}

/**
 * Récupère les favoris d'un utilisateur
 */
export async function getUserFavorites(req: Request, res: Response) {
  try {
    // Dans une vraie implémentation, on récupérerait les favoris depuis la base de données
    // Pour l'instant, on renvoie une liste vide car on va les stocker en localStorage
    return res.status(200).json({
      success: true,
      favorites: []
    });
  } catch (err) {
    const error = err as Error;
    console.error('Erreur lors de la récupération des favoris:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris',
      error: error.message,
    });
  }
}