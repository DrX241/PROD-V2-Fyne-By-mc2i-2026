import { Request, Response } from 'express';
import { openai } from './services/openai';

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
    1. Un titre concis et clair
    2. Une description courte du sujet (1-2 phrases)
    3. Un contenu au format Markdown structuré avec des sections et sous-sections
    4. 3-5 points clés à retenir (sous forme de liste)
    5. 2-3 références pertinentes à consulter
    6. Une catégorie pertinente parmi : sécurité-réseau, sécurité-applicative, identité, conformité, pentest, threat-hunting, gouvernance
    7. Un niveau de complexité : débutant, intermédiaire, avancé
    
    Retourne le résultat au format JSON avec les clés suivantes : 
    {title, description, content, keyPoints: [], references: [], category, level}`;

    // Message utilisateur avec le sujet
    const userPrompt = `Créer une fiche de cybersécurité sur le sujet : ${topic}`;

    // Appel à l'API Azure OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await openai.getChatCompletion(messages, 0.7, 2000);
    
    let ficheData;
    try {
      ficheData = JSON.parse(result);
    } catch (error) {
      console.error("Impossible de parser la réponse JSON de l'IA:", error);
      // Si le format JSON n'est pas respecté, tenter d'extraire manuellement
      ficheData = {
        title: topic,
        description: "Fiche générée sur le sujet demandé",
        content: result,
        keyPoints: ["Point extrait du contenu généré"],
        references: ["Documentation de référence sur le sujet"],
        category: "divers",
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
  } catch (error) {
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
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris',
      error: error.message,
    });
  }
}