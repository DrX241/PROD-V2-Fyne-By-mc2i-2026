import { Request, Response } from "express";
import { ChatCompletionRequestMessage } from "../shared/schema";
import { openAIService } from "../I_AM_CYBER/services/openai";

// Controller pour les fonctionnalités AMOA Quest
export async function handleQuestInitialization(req: Request, res: Response) {
  try {
    // Dans une version future, nous ferons appel à Azure OpenAI pour générer 
    // dynamiquement le contenu du scénario, mais pour le moment nous utilisons des données statiques

    // Structure des phases et étapes de l'aventure
    const questPhases = [
      {
        id: "phase1",
        title: "Cadrage et expression des besoins",
        description: "Première rencontre avec le client et identification des besoins du projet",
        steps: [
          {
            id: "intro1",
            type: "narrative",
            character: {
              id: "director",
              name: "Claire Leroy",
              role: "Directrice de Projet",
              avatar: "",
              mood: "neutral"
            },
            content: "Bonjour et bienvenue dans l'équipe ! Je suis Claire Leroy, la directrice de ce projet stratégique pour notre client PharmaHealth. Nous avons besoin de vos compétences d'AMOA pour mener à bien ce projet de transformation digitale."
          },
          {
            id: "intro2",
            type: "narrative",
            character: {
              id: "director",
              name: "Claire Leroy",
              role: "Directrice de Projet",
              avatar: "",
              mood: "serious"
            },
            content: "PharmaHealth est un groupe pharmaceutique qui souhaite moderniser sa plateforme de gestion des essais cliniques. Le système actuel est obsolète et ne répond plus aux exigences réglementaires et aux besoins des utilisateurs."
          },
          {
            id: "choice1",
            type: "decision",
            content: "Comment souhaitez-vous aborder ce projet en tant qu'AMOA ?",
            options: [
              {
                id: "option1",
                text: "Je voudrais d'abord comprendre les besoins des utilisateurs finaux avant toute chose.",
                impact: {
                  stakeholder: 10,
                  technical: 5,
                  budget: 0,
                  timeline: -5
                }
              },
              {
                id: "option2",
                text: "Pouvons-nous examiner la documentation technique du système actuel pour identifier les contraintes ?",
                impact: {
                  stakeholder: 0,
                  technical: 10,
                  budget: 5,
                  timeline: 0
                }
              },
              {
                id: "option3",
                text: "Je propose de définir rapidement un planning et un budget pour cadrer le projet dès le départ.",
                impact: {
                  stakeholder: -5,
                  technical: 0,
                  budget: 10,
                  timeline: 10
                }
              }
            ]
          },
          {
            id: "response1",
            type: "narrative",
            character: {
              id: "director",
              name: "Claire Leroy",
              role: "Directrice de Projet",
              avatar: "",
              mood: "happy"
            },
            content: "Excellente approche ! Je vais vous organiser des entretiens avec les principaux utilisateurs. Entre-temps, voici le document préliminaire qui résume les objectifs stratégiques du projet."
          },
          {
            id: "document1",
            type: "document",
            content: "Voici le document préliminaire du projet :",
            documents: [
              {
                title: "Objectifs Stratégiques - Projet eClinical",
                content: "Le projet de modernisation de la plateforme d'essais cliniques (eClinical) vise à :\n\n1. Réduire de 40% le temps de configuration des essais cliniques\n2. Améliorer la conformité réglementaire (FDA, EMA)\n3. Permettre une collaboration en temps réel entre les équipes mondiales\n4. Assurer l'intégrité et la traçabilité des données\n5. Intégrer des capacités d'analyse avancées\n\nLe système devra être opérationnel d'ici 12 mois pour correspondre au lancement de trois essais cliniques majeurs.",
                type: "requirement"
              }
            ]
          },
          {
            id: "meeting1",
            type: "narrative",
            character: {
              id: "user",
              name: "Dr. Martin Bernard",
              role: "Responsable des Essais Cliniques",
              avatar: "",
              mood: "concerned"
            },
            content: "Bonjour, je suis le Dr. Bernard, responsable des essais cliniques. Notre principal problème est la lenteur du système actuel et son manque de flexibilité. Nous perdons un temps précieux à configurer manuellement chaque essai, et les erreurs sont fréquentes. De plus, la conformité réglementaire devient un cauchemar avec les nouvelles directives."
          },
          {
            id: "choice2",
            type: "decision",
            content: "Quelle approche privilégiez-vous pour recueillir les besoins ?",
            options: [
              {
                id: "option1",
                text: "Organiser des ateliers d'expression des besoins avec tous les utilisateurs en même temps pour favoriser la co-création.",
                impact: {
                  stakeholder: 5,
                  technical: 5,
                  budget: -5,
                  timeline: -5
                }
              },
              {
                id: "option2",
                text: "Mener des entretiens individuels avec chaque partie prenante pour approfondir leurs besoins spécifiques.",
                impact: {
                  stakeholder: 10,
                  technical: 0,
                  budget: -5,
                  timeline: -10
                }
              },
              {
                id: "option3",
                text: "Utiliser un questionnaire en ligne pour collecter rapidement un maximum d'informations auprès de tous les utilisateurs.",
                impact: {
                  stakeholder: -5,
                  technical: 5,
                  budget: 10,
                  timeline: 10
                }
              }
            ]
          }
        ]
      },
      {
        id: "phase2",
        title: "Spécifications fonctionnelles",
        description: "Formalisation des besoins et élaboration des spécifications",
        steps: [
          // Étapes pour la phase 2 (à développer ultérieurement)
        ]
      }
    ];

    // Envoyer la réponse avec les phases et étapes
    res.json({
      phases: questPhases
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la quête AMOA:", error);
    res.status(500).json({ message: "Erreur lors de l'initialisation de la quête" });
  }
}

// Pour une version future - traitement des choix avec Azure OpenAI
export async function handleQuestChoice(req: Request, res: Response) {
  try {
    const { phaseId, stepId, optionId, playerMetrics, playerChoices } = req.body;

    if (!phaseId || !stepId || !optionId) {
      return res.status(400).json({ message: "Paramètres manquants" });
    }

    // Créer le prompt pour Azure OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un assistant spécialisé dans la gestion de projet et l'AMOA (assistance à maîtrise d'ouvrage). 
        Tu génères des réponses narratives pour un jeu interactif où l'utilisateur incarne un AMOA sur un projet.
        L'utilisateur a fait le choix suivant : ${optionId} à l'étape ${stepId} de la phase ${phaseId}.
        Ses métriques actuelles sont : Satisfaction des parties prenantes: ${playerMetrics.stakeholderSatisfaction}%, 
        Qualité technique: ${playerMetrics.technicalQuality}%, Respect du budget: ${playerMetrics.budgetAdherence}%, 
        Respect des délais: ${playerMetrics.timelineAdherence}%.
        Génère une réponse réaliste et éducative qui reflète ce choix, d'un maximum de 3 paragraphes.`
      },
      {
        role: "user",
        content: `Je viens de faire le choix "${optionId}" dans la phase "${phaseId}" à l'étape "${stepId}". 
        Génère une réponse narrative appropriée.`
      }
    ];

    // Faire appel à Azure OpenAI
    const responseContent = await openAIService.getChatCompletion(messages, 0.7, 1000);

    // Envoyer la réponse
    res.json({
      response: responseContent,
      nextStepId: "", // À définir selon la logique du jeu
      impactFeedback: {
        // Feedback sur l'impact des choix (à développer)
      }
    });
  } catch (error) {
    console.error("Erreur lors du traitement du choix AMOA:", error);
    res.status(500).json({ message: "Erreur lors du traitement du choix" });
  }
}