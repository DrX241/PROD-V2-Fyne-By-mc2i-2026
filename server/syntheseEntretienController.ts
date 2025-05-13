import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

/**
 * Contrôleur pour la génération de synthèse d'entretien
 */
export async function generateSyntheseEntretien(req: Request, res: Response) {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Les notes d\'entretien sont requises'
      });
    }

    // Construction du prompt pour le modèle d'IA
    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu es un assistant spécialisé dans l'analyse et la structuration de notes d'entretien de recrutement. 
      
Ta tâche est d'analyser les notes fournies par un recruteur et de les transformer en une synthèse structurée selon un format spécifique.

Pour chaque section, extrais les informations pertinentes des notes, formule des phrases complètes et professionnelles, et assure-toi que le contenu est cohérent.

Si tu ne trouves pas d'information pour une section particulière, indique "Information non disponible dans les notes fournies."

Voici les sections à remplir (retourne un objet JSON avec ces champs) :
- presentation: Présentation générale du profil (formation, expériences, trous éventuels)
- impression: Premières impressions, posture
- motivation: Motivation pour le conseil, les SI, et mc2i
- comprehension: Compréhension de nos métiers et renseignement sur le cabinet
- projet: Projet professionnel (court / moyen / long terme)
- potentiel: Potentiel vs ambition
- processus: Processus en cours et calendrier de décision
- criteres: Critères de choix du candidat
- forces: Forces et faiblesses de la candidature
- anglais: Niveau d'anglais
- specificites: Spécificités si stagiaire ou alternant (synthèse écrite, départ à l'étranger, rythme, etc.)
- decision: Raison de la décision finale
- synthese: Synthèse globale

Pour le format de réponse, tu dois fournir uniquement un objet JSON sans texte supplémentaire.`
    };

    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: `Voici mes notes d'entretien. Analyse-les et génère une synthèse structurée selon le format demandé :\n\n${notes}`
    };

    // Appel à l'API OpenAI via notre service - en demandant un format JSON
    const responseText = await openAIService.getChatCompletionWithCache({
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      maxTokens: 2000,
      useSecondaryKey: true, // Utiliser le modèle secondaire (plus rapide)
      responseFormat: 'json_object' // Demander explicitement un format JSON
    });

    // Nettoyage et parsing de la réponse
    let synthese;
    let cleanedResponse = responseText;

    // Extraction du JSON si réponse entourée de backticks ou commentaires
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/gm;
    const match = jsonRegex.exec(responseText);
    if (match) {
      cleanedResponse = match[1] || match[2] || match[0];
    }

    console.log('Réponse reçue de l\'API:', responseText);
    console.log('Réponse nettoyée:', cleanedResponse);

    try {
      synthese = JSON.parse(cleanedResponse);
      console.log('Objet JSON parsé avec succès');
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      console.error('Texte brut reçu:', responseText);
      
      // Fallback: créer un objet synthèse basique avec le texte brut
      synthese = {
        synthese: "Impossible de générer une synthèse structurée. Veuillez réessayer avec des notes plus détaillées.",
        error: "Erreur de format dans la réponse"
      };
      
      // Informer le client de l'erreur mais ne pas bloquer complètement la réponse
      return res.status(200).json({
        success: false,
        message: 'La réponse n\'a pas pu être structurée correctement',
        synthese
      });
    }

    // Réponse au client
    return res.status(200).json({
      success: true,
      synthese
    });
  } catch (error) {
    console.error('Erreur lors de la génération de synthèse:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
}