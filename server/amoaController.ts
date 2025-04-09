import { Request, Response } from "express";
import { ChatCompletionRequestMessage } from "../shared/schema";
import { openAIService } from "../I_AM_CYBER/services/openai";

// Structure de base des phases de l'aventure AMOA
const baseQuestPhases = [
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
      }
    ]
  },
  {
    id: "phase2",
    title: "Spécifications fonctionnelles",
    description: "Formalisation des besoins et élaboration des spécifications",
    steps: []
  },
  {
    id: "phase3",
    title: "Conception de la solution",
    description: "Élaboration de la solution technique et fonctionnelle",
    steps: []
  },
  {
    id: "phase4",
    title: "Réalisation et tests",
    description: "Supervision du développement et des tests",
    steps: []
  },
  {
    id: "phase5",
    title: "Déploiement et formation",
    description: "Préparation au déploiement et formation des utilisateurs",
    steps: []
  }
];

// Controller pour les fonctionnalités AMOA Quest
export async function handleQuestInitialization(req: Request, res: Response) {
  try {
    // Générer le scénario initial à l'aide d'Azure OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en gestion de projet et en assistance à maîtrise d'ouvrage (AMOA) dans le secteur de l'informatique.
        
        Ta mission est de créer un scénario d'apprentissage interactif pour former les utilisateurs aux compétences d'AMOA.
        Le scénario se déroule dans une entreprise fictive qui développe une nouvelle solution logicielle pour un client du secteur pharmaceutique.
        
        Pour chaque phase du projet, génère des étapes narratives et des décisions clés que l'apprenant devra prendre.
        Chaque décision doit avoir un impact sur la satisfaction des parties prenantes, la qualité technique, le respect du budget et des délais.
        
        Assure-toi que le scénario soit réaliste, éducatif et qu'il couvre les bonnes pratiques de l'AMOA.`
      },
      {
        role: "user",
        content: `Génère le début d'un scénario d'AMOA pour un projet de transformation digitale dans le secteur pharmaceutique.
        
        Je veux que tu me donnes :
        1. Une courte introduction au projet avec un personnage (le directeur de projet)
        2. Une première décision à prendre avec 3 options possibles et leurs impacts
        3. Un format JSON qui puisse s'intégrer facilement dans la phase 1 de mon application
        
        Génère uniquement la réponse au format demandé sans explications supplémentaires.`
      }
    ];

    try {
      // Générer le contenu
      const generatedContent = await openAIService.getChatCompletion(messages, 0.7, 2000);
      
      // Essayer de parser le contenu JSON si présent
      let dynamicSteps = [];
      try {
        // Extraire le JSON si l'IA a formaté sa réponse avec des backticks ou balises
        const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
          dynamicSteps = JSON.parse(jsonContent);
        }
      } catch (parseError) {
        console.warn("Impossible de parser le JSON généré:", parseError);
        // En cas d'échec, continuer avec les étapes statiques
      }

      // Créer une copie des phases de base
      const questPhases = JSON.parse(JSON.stringify(baseQuestPhases));
      
      // Ajouter les étapes dynamiques si elles ont été parsées correctement
      if (Array.isArray(dynamicSteps) && dynamicSteps.length > 0) {
        questPhases[0].steps = [...questPhases[0].steps, ...dynamicSteps];
      }
      
      // Sinon, utiliser les étapes préexistantes
      if (questPhases[0].steps.length <= 3) {
        // Ajouter des étapes statiques si le contenu généré est insuffisant
        questPhases[0].steps.push(
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
          }
        );
      }

      // Envoyer la réponse avec les phases et étapes
      res.json({
        phases: questPhases
      });
    } catch (aiError) {
      console.error("Erreur lors de l'appel à Azure OpenAI:", aiError);
      // Fallback - utiliser les phases statiques
      res.json({
        phases: baseQuestPhases
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la quête AMOA:", error);
    res.status(500).json({ message: "Erreur lors de l'initialisation de la quête" });
  }
}

// Traitement des choix avec Azure OpenAI
export async function handleQuestChoice(req: Request, res: Response) {
  try {
    const { 
      phaseId, 
      stepId, 
      optionId, 
      optionText,
      phaseTitle,
      stepContent,
      playerMetrics, 
      playerChoices,
      currentCharacter
    } = req.body;

    if (!phaseId || !stepId || !optionId) {
      return res.status(400).json({ message: "Paramètres manquants" });
    }

    // Créer le prompt pour Azure OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un assistant de jeu de rôle spécialisé dans la simulation d'un projet informatique. 
        
        Tu incarnes un expert en gestion de projet et en AMOA (Assistance à Maîtrise d'Ouvrage) qui guide un apprenant dans un scénario éducatif interactif.
        
        L'apprenant joue le rôle d'un AMOA sur un projet de transformation digitale dans le secteur pharmaceutique.
        
        Contexte du projet : Une entreprise pharmaceutique souhaite moderniser sa plateforme de gestion des essais cliniques. Le système actuel est obsolète et ne répond plus aux exigences réglementaires.
        
        Métriques actuelles du projet :
        - Satisfaction des parties prenantes: ${playerMetrics.stakeholderSatisfaction}%
        - Qualité technique: ${playerMetrics.technicalQuality}%
        - Respect du budget: ${playerMetrics.budgetAdherence}%
        - Respect des délais: ${playerMetrics.timelineAdherence}%
        
        Phase actuelle : ${phaseTitle} (${phaseId})
        Dernière question posée : "${stepContent}"
        Choix de l'apprenant : "${optionText}"
        
        Tu dois générer une réponse réaliste sous forme de JSON contenant :
        1. Une réaction narrative d'un personnage (directeur de projet, client, développeur, etc.)
        2. Une étape suivante avec une nouvelle question ou décision à prendre
        3. Des options de réponse pour cette nouvelle étape
        
        Format attendu :
        {
          "narrativeResponse": {
            "character": {
              "id": "string",
              "name": "string",
              "role": "string",
              "mood": "neutral|happy|concerned|serious|excited"
            },
            "content": "string"
          },
          "nextStep": {
            "type": "narrative|decision|document",
            "content": "string",
            "options": [
              {
                "text": "string",
                "impact": {
                  "stakeholder": number,
                  "technical": number,
                  "budget": number,
                  "timeline": number
                }
              }
            ]
          }
        }`
      },
      {
        role: "user",
        content: `Je viens de faire le choix "${optionText}" dans la phase "${phaseTitle}".
        
        Génère une réponse narrative appropriée et la prochaine étape du scénario au format JSON demandé.
        Assure-toi que la réponse soit réaliste, éducative, et qu'elle s'inscrive dans la continuité d'un projet informatique.
        La réponse doit absolument être uniquement au format JSON demandé, sans aucun texte supplémentaire.`
      }
    ];

    // Faire appel à Azure OpenAI
    const responseContent = await openAIService.getChatCompletion(messages, 0.7, 2000);
    
    // Extraire le JSON de la réponse
    let parsedResponse;
    try {
      // Rechercher d'abord les délimiteurs de code JSON
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
        parsedResponse = JSON.parse(jsonContent);
      } else {
        // Si pas de délimiteurs, essayer de parser directement
        parsedResponse = JSON.parse(responseContent);
      }
    } catch (jsonError) {
      console.error("Erreur lors du parsing du JSON:", jsonError);
      // Créer une réponse par défaut
      parsedResponse = {
        narrativeResponse: {
          character: {
            id: "director",
            name: "Claire Leroy",
            role: "Directrice de Projet",
            mood: "neutral"
          },
          content: "Je comprends votre approche. Continuons avec la suite du projet."
        },
        nextStep: {
          type: "decision",
          content: "Quelle serait la prochaine étape selon vous ?",
          options: [
            {
              text: "Organiser une réunion de suivi avec l'équipe",
              impact: {
                stakeholder: 5,
                technical: 0,
                budget: 0,
                timeline: -5
              }
            },
            {
              text: "Préparer un rapport d'avancement pour le client",
              impact: {
                stakeholder: 10,
                technical: 0,
                budget: -5,
                timeline: -5
              }
            },
            {
              text: "Se concentrer sur la résolution des problèmes techniques identifiés",
              impact: {
                stakeholder: -5,
                technical: 10,
                budget: -5,
                timeline: 0
              }
            }
          ]
        }
      };
    }

    // Générer des IDs pour les nouvelles étapes
    const narrativeId = `narrative_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const nextStepId = `step_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Construire la réponse
    const response = {
      narrativeStep: {
        id: narrativeId,
        type: "narrative",
        character: parsedResponse.narrativeResponse.character,
        content: parsedResponse.narrativeResponse.content
      },
      nextStep: {
        id: nextStepId,
        type: parsedResponse.nextStep.type,
        content: parsedResponse.nextStep.content,
        options: parsedResponse.nextStep.options
      }
    };

    // Envoyer la réponse
    res.json(response);
  } catch (error) {
    console.error("Erreur lors du traitement du choix AMOA:", error);
    res.status(500).json({ message: "Erreur lors du traitement du choix" });
  }
}