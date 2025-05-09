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
    const systemPrompt = `Tu es un expert en cybersécurité chargé de créer des fiches éducatives concises et précises.
    Génère une fiche synthétique sur le sujet demandé en respectant cette structure :
    1. Un titre concis et clair (maximum 60 caractères)
    2. Une description courte du sujet (1-2 phrases, maximum 150 caractères)
    3. Un contenu au format Markdown structuré avec des sections (niveau 2 avec ##) et sous-sections (niveau 3 avec ###)
    4. 3-5 points clés à retenir (sous forme de liste simple avec puces)
    5. 2-3 références pertinentes à consulter
    6. Une catégorie pertinente parmi : menaces, vulnérabilités, architecture, identité, détection, gouvernance, personnalisé
    7. Un niveau de complexité : débutant, intermédiaire, avancé, tous niveaux
    
    IMPORTANT: Réponds uniquement avec un objet JSON valide (sans formatage de code Markdown), avec les clés suivantes:
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

    const result = await openAIService.getChatCompletion(messages, 0.7, 2000);
    
    let ficheData;
    try {
      // Nettoyage de la réponse pour éliminer les backticks et identifiants "json" que l'IA pourrait ajouter
      let cleanedResult = result;
      
      // Vérifier si le résultat commence par des backticks (```json) et se termine par des backticks (```)
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
      const match = result.match(jsonRegex);
      
      if (match && match[1]) {
        cleanedResult = match[1].trim();
      }
      
      console.log("Tentative de parsing JSON:", cleanedResult);
      ficheData = JSON.parse(cleanedResult);
      
      // Vérification supplémentaire des champs obligatoires
      if (!ficheData.title || !ficheData.content) {
        throw new Error("Format de JSON incomplet");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Impossible de parser la réponse JSON de l'IA:", error);
      console.error("Réponse brute:", result);
      
      // Si le format JSON n'est pas respecté, tenter d'extraire manuellement
      ficheData = {
        title: topic,
        description: "Fiche générée sur le sujet demandé",
        content: result.includes("##") ? result : `## ${topic}\n\n${result}`,
        keyPoints: ["Concept important lié au sujet", "Implémentations recommandées", "Bonnes pratiques à suivre"],
        references: ["Documentation officielle", "Publications de recherche récentes"],
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