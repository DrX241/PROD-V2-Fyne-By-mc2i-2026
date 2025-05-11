/**
 * Contrôleur pour la simulation d'audition mc2i
 * Génère des scénarios d'audition client et gère les simulations d'entretien
 */

import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { type ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Interface pour un scénario de mission client
 */
export interface MissionScenario {
  title: string;
  clientName: string;
  clientCompany: string;
  clientPosition: string;
  sector: string;
  projectContext: string;
  projectObjectives: string[];
  expectedSkills: string[];
  challengesAndConstraints: string[];
  teamSize: number;
  duration: string;
}

/**
 * Méthode pour générer un scénario d'audition basé sur un secteur
 */
export async function generateMissionScenario(req: Request, res: Response) {
  try {
    const { sector = 'Banque & Assurance' } = req.body;
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu es un assistant spécialisé dans la génération de scénarios d'audition réalistes pour consultants mc2i.
      Tu vas créer un scénario détaillé d'audition client avec un contexte de projet crédible pour le secteur ${sector}.
      Le scénario doit inclure des objectifs projet clairs, des attentes clients réalistes et des défis potentiels.
      Réponds UNIQUEMENT avec un objet JSON valide structuré selon le format suivant (sans markdown ni texte additionnel):
      {
        "title": "Titre du projet (concis et professionnel)",
        "clientName": "Prénom et Nom du client fictif",
        "clientCompany": "Entreprise cliente représentative du secteur",
        "clientPosition": "Poste du client (directeur, chef de projet, etc.)",
        "sector": "${sector}",
        "projectContext": "Contexte business du projet en 2-3 phrases",
        "projectObjectives": ["Objectif 1", "Objectif 2", "Objectif 3"],
        "expectedSkills": ["Compétence 1", "Compétence 2", "Compétence 3", "Compétence 4"],
        "challengesAndConstraints": ["Défi 1", "Défi 2", "Défi 3"],
        "teamSize": Taille de l'équipe (un nombre entre 3 et 15),
        "duration": "Durée estimée du projet (ex: '6 mois', '1 an')"
      }`
    };

    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: `Génère un scénario d'audition client réaliste pour le secteur ${sector} qui pourrait être utilisé lors d'une préparation d'audition pour un consultant mc2i.`
    };

    // Utilisation de l'API avec gestion de cache et modèle secondaire (plus économique)
    // Ajoutons un format JSON explicite pour s'assurer de la validité de la réponse
    const systemMessageWithFormat = {
      ...systemMessage,
      content: systemMessage.content + "\n\nRÈGLE IMPORTANTE: Ta réponse DOIT absolument être au format JSON valide, sans texte additionnel avant ou après le JSON."
    };
    
    const response = await openAIService.getChatCompletionWithCache(
      [systemMessageWithFormat, userMessage], 
      0.7, // temperature
      1000, // maxTokens
      true // useSecondaryKey: true pour utiliser GPT-4o-mini qui est plus économique
    );

    try {
      const scenario: MissionScenario = JSON.parse(response);
      return res.status(200).json({
        success: true,
        scenario
      });
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      return res.status(500).json({
        success: false, 
        error: "Le format de réponse est invalide",
        rawResponse: response
      });
    }
  } catch (error) {
    console.error("Erreur lors de la génération du scénario:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la génération du scénario"
    });
  }
}

/**
 * Méthode pour simuler un entretien d'audition
 */
export async function simulateInterview(req: Request, res: Response) {
  try {
    const { userMessage, scenario, messageHistory } = req.body;
    
    if (!scenario) {
      return res.status(400).json({
        success: false,
        error: "Scénario manquant pour la simulation"
      });
    }

    // Construire le contexte pour l'IA basé sur le scénario
    const context = `
Contexte de l'audition:
- Client: ${scenario.clientName}, ${scenario.clientPosition} chez ${scenario.clientCompany}
- Projet: ${scenario.title}
- Secteur: ${scenario.sector}
- Contexte: ${scenario.projectContext}
- Objectifs principaux: ${scenario.projectObjectives.join(', ')}
`;

    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu es ${scenario.clientName}, ${scenario.clientPosition} chez ${scenario.clientCompany}, et tu mènes un entretien d'audition avec un consultant mc2i pour le projet "${scenario.title}".

${context}

Voici tes directives:
1. Reste strictement dans ton rôle de client tout au long de la conversation.
2. Pose des questions pertinentes sur les compétences, l'expérience et l'approche du consultant.
3. Réagis de manière réaliste aux réponses du consultant.
4. N'hésite pas à poser des questions pièges ou à approfondir certains sujets techniques.
5. Assure-toi d'évaluer les compétences essentielles suivantes: ${scenario.expectedSkills.join(', ')}.
6. Sois prêt à aborder les défis potentiels du projet: ${scenario.challengesAndConstraints.join(', ')}.

Important: Ne révèle jamais que tu es une IA. Comporte-toi comme un véritable directeur de projet ou décideur qui évalue un consultant.`
    };

    // Ajouter l'historique des messages pour maintenir le contexte
    const conversationHistory: ChatCompletionRequestMessage[] = [systemMessage];
    
    if (messageHistory && messageHistory.length > 0) {
      messageHistory.forEach((msg: any) => {
        conversationHistory.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }

    // Ajouter le nouveau message de l'utilisateur
    if (userMessage) {
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
    } else {
      // Si c'est le début de la conversation, générer un message d'accueil du client
      conversationHistory.push({
        role: 'user',
        content: "Bonjour, merci d'être venu pour cet entretien aujourd'hui."
      });
    }

    // Utilisation du modèle principal (GPT-4o) pour une meilleure qualité de réponse
    // Pas besoin de force JSON ici car nous voulons un texte normal pour le dialogue
    
    // Ajoutons un système de contexte pour améliorer la simulation
    if (conversationHistory.length > 0 && conversationHistory[0].role === 'system') {
      // Si nous avons déjà un message système, améliorons-le
      conversationHistory[0].content += "\n\nRappel du contexte: Tu joues le rôle d'un client réaliste lors d'une audition. Reste naturel et pose des questions pertinentes.";
    } else {
      // Sinon, ajoutons un message système
      conversationHistory.unshift({
        role: 'system',
        content: `Tu joues le rôle d'un client lors d'une audition avec un consultant mc2i. 
        Agis de manière réaliste, pose des questions pertinentes sur le projet et les compétences du consultant.
        Sois cordial mais exigeant, comme un vrai client lors d'un entretien d'audition.`
      });
    }
    
    const response = await openAIService.getChatCompletionWithCache(
      conversationHistory,
      0.8, // temperature
      800, // maxTokens
      false // useSecondaryKey: false pour utiliser GPT-4o qui est plus performant
    );

    return res.status(200).json({
      success: true,
      message: response
    });
  } catch (error) {
    console.error("Erreur lors de la simulation d'entretien:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la simulation d'entretien"
    });
  }
}

/**
 * Méthode pour évaluer la performance du candidat à la fin de l'entretien
 */
export async function evaluatePerformance(req: Request, res: Response) {
  try {
    const { messageHistory, scenario, candidateInfo } = req.body;
    
    if (!messageHistory || messageHistory.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Historique de messages insuffisant pour l'évaluation"
      });
    }

    // Construire le contexte pour l'évaluation
    const messagesText = messageHistory
      .map((msg: any) => `${msg.role === 'user' ? 'Consultant' : 'Client'}: ${msg.content}`)
      .join('\n\n');

    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu es un expert en évaluation d'entretiens d'audition pour le cabinet de conseil mc2i.
      Tu dois analyser la performance d'un consultant lors d'un entretien simulé et fournir une évaluation détaillée.
      
      Contexte de l'audition:
      - Client: ${scenario.clientName}, ${scenario.clientPosition} chez ${scenario.clientCompany}
      - Projet: ${scenario.title}
      - Secteur: ${scenario.sector}
      - Compétences attendues: ${scenario.expectedSkills.join(', ')}
      
      Réponds UNIQUEMENT avec un objet JSON valide structuré comme suit (sans markdown ni texte additionnel):
      {
        "score": Note globale de 0 à 100,
        "overall_feedback": "Feedback général sur la performance",
        "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
        "weaknesses": ["Point faible 1", "Point faible 2", "Point faible 3"],
        "communication_rating": Note de 0 à 10 sur la communication,
        "technical_rating": Note de 0 à 10 sur les compétences techniques,
        "business_understanding": Note de 0 à 10 sur la compréhension du domaine métier,
        "vocabulary_quality": Note de 0 à 10 sur la qualité du vocabulaire,
        "preparation_level": Note de 0 à 10 sur le niveau de préparation,
        "improvement_suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
        "badge": {
          "title": "Titre du badge obtenu (ex: 'Communicateur Prometteur', 'Expert Technique', etc.)",
          "description": "Description brève du badge"
        },
        "next_steps": "Recommandations pour la suite"
      }`
    };

    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: `Voici la transcription de l'entretien d'audition à évaluer:\n\n${messagesText}\n\nProfil du consultant: ${candidateInfo?.profileType || 'Non spécifié'}, Expérience: ${candidateInfo?.experienceLevel || 'Non spécifiée'}`
    };

    // Utilisation du modèle principal (GPT-4o) pour une évaluation précise
    // Ajoutons un force_json: true pour s'assurer que la réponse est formatée en JSON
    const systemMessageWithFormat = {
      ...systemMessage,
      content: systemMessage.content + "\n\nRÈGLE IMPORTANTE: Ta réponse DOIT absolument être au format JSON valide, sans texte additionnel avant ou après le JSON."
    };
    
    const response = await openAIService.getChatCompletionWithCache(
      [systemMessageWithFormat, userMessage],
      0.7, // temperature
      1200, // maxTokens
      false // useSecondaryKey: false pour utiliser GPT-4o pour une évaluation de qualité
    );

    try {
      const evaluation = JSON.parse(response);
      return res.status(200).json({
        success: true,
        evaluation
      });
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      return res.status(500).json({
        success: false,
        error: "Le format de réponse est invalide",
        rawResponse: response
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'évaluation de performance:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'évaluation de performance"
    });
  }
}