import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { v4 as uuidv4 } from 'uuid';
import { ChatCompletionRequestMessage } from "@shared/schema";
import { extractJsonFromOpenAiResponse, createFallbackJson } from "./openAiResponseHelper";

interface ChallengeSession {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: string;
  gameMode: string;
  skillLevel: string;
  scenarioId: string;
  messages: Array<ChatCompletionRequestMessage>;
  context: {
    currentStep: number;
    decisions: string[];
    score: number;
    achievements: string[];
    isFailed: boolean;
  };
  startTime: number;
}

// Map pour stocker les sessions actives
const activeSessions = new Map<string, ChallengeSession>();

/**
 * Évalue le niveau de compétence de l'utilisateur à partir de ses réponses au QCM
 */
export async function evaluateQCM(req: Request, res: Response) {
  try {
    const { answers, userRole } = req.body;
    
    if (!answers || !userRole) {
      return res.status(400).json({ message: 'Réponses et rôle utilisateur requis' });
    }
    
    // Dans une implémentation réelle, on comparerait les réponses aux correctes
    // Ici, on simule avec une évaluation basée sur le nombre de bonnes réponses
    
    const correctAnswers = Object.values(answers).filter(answer => 
      typeof answer === 'string' && answer.includes('correct')
    ).length;
    
    const totalQuestions = Object.keys(answers).length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    let skillLevel;
    if (percentage < 40) {
      skillLevel = 'Débutant';
    } else if (percentage < 75) {
      skillLevel = 'Intermédiaire';
    } else {
      skillLevel = 'Expert';
    }
    
    return res.status(200).json({
      skillLevel,
      score: percentage.toFixed(2),
      feedback: `Votre niveau d'expertise en tant que ${userRole} a été évalué à ${skillLevel}.`
    });
  } catch (error) {
    console.error('Erreur lors de l\'évaluation du QCM:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'évaluation du QCM' });
  }
}

/**
 * Récupère les scénarios disponibles en fonction du rôle, du niveau de compétence et du mode de jeu
 */
export async function getAvailableScenarios(req: Request, res: Response) {
  try {
    const { userRole, skillLevel, gameMode } = req.query;
    
    if (!userRole || !skillLevel || !gameMode) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    // Dans une implémentation réelle, on récupérerait ces données depuis une base de données
    // Ici, on les génère dynamiquement
    
    const scenarios = [];
    
    if (gameMode === 'classic') {
      // Scénarios pour le mode classique
      if (userRole === 'rssi') {
        scenarios.push(
          {
            id: 'rssi-breach',
            title: 'Gestion d\'une fuite de données',
            description: 'Vous devez gérer une situation critique suite à une fuite de données confidentielles',
            difficulty: skillLevel,
            category: 'Gestion de crise',
            objectives: [
              'Identifier la source de la fuite',
              'Contenir la compromission',
              'Établir une communication de crise',
              'Mettre en place des mesures correctives'
            ]
          },
          {
            id: 'rssi-policy',
            title: 'Politique de sécurité',
            description: 'Élaborez une politique de sécurité adaptée aux besoins de l\'entreprise',
            difficulty: skillLevel,
            category: 'Gouvernance',
            objectives: [
              'Analyser les besoins de sécurité',
              'Prioriser les risques',
              'Définir des règles de sécurité',
              'Établir un plan de contrôle'
            ]
          }
        );
      } else if (userRole === 'hacker') {
        scenarios.push(
          {
            id: 'hacker-web',
            title: 'Test d\'intrusion web',
            description: 'Réalisez un test d\'intrusion sur une application web vulnérable',
            difficulty: skillLevel,
            category: 'Pentest',
            objectives: [
              'Identifier les vulnérabilités',
              'Exploiter les failles de sécurité',
              'Documenter les vecteurs d\'attaque',
              'Proposer des correctifs'
            ]
          },
          {
            id: 'hacker-network',
            title: 'Analyse de vulnérabilités réseau',
            description: 'Identifiez et exploitez des vulnérabilités dans une infrastructure réseau',
            difficulty: skillLevel,
            category: 'Network Security',
            objectives: [
              'Scanner le réseau cible',
              'Identifier les services vulnérables',
              'Démontrer des exploits potentiels',
              'Recommander des mesures de sécurisation'
            ]
          }
        );
      } else if (userRole === 'developer') {
        scenarios.push(
          {
            id: 'dev-code-review',
            title: 'Revue de code sécurisé',
            description: 'Analysez et corrigez le code d\'une application pour éliminer les vulnérabilités',
            difficulty: skillLevel,
            category: 'Secure Coding',
            objectives: [
              'Identifier les failles de sécurité dans le code',
              'Corriger les vulnérabilités trouvées',
              'Mettre en place des tests de sécurité',
              'Documenter les bonnes pratiques'
            ]
          },
          {
            id: 'dev-secure-api',
            title: 'Sécurisation d\'une API',
            description: 'Implémentez des mécanismes de sécurité pour une API existante',
            difficulty: skillLevel,
            category: 'API Security',
            objectives: [
              'Analyser les risques de l\'API',
              'Mettre en place une authentification robuste',
              'Implémenter la gestion des autorisations',
              'Protéger contre les attaques courantes'
            ]
          }
        );
      }
      // Ajout de scénarios pour les autres rôles...
    } else if (gameMode === 'tunnel') {
      // Scénarios pour le mode tunnel (avec des liens entre les étapes)
      if (userRole === 'rssi') {
        scenarios.push({
          id: 'tunnel-rssi',
          title: 'Crise majeure de cybersécurité',
          description: 'Gérez une crise de cybersécurité évolutive avec des conséquences sur l\'ensemble de l\'entreprise',
          difficulty: skillLevel,
          category: 'Tunnel',
          objectives: [
            'Détecter les incidents initiaux',
            'Contenir la propagation de l\'attaque',
            'Gérer la communication de crise',
            'Élaborer un plan de reprise',
            'Prévenir les futures attaques',
            'Coordonner avec les autorités'
          ]
        });
      } else if (userRole === 'hacker') {
        scenarios.push({
          id: 'tunnel-hacker',
          title: 'Mission d\'infiltration éthique',
          description: 'Menez une mission complète d\'infiltration éthique dans un système avec des défenses progressives',
          difficulty: skillLevel,
          category: 'Tunnel',
          objectives: [
            'Reconnaissance initiale',
            'Exploitation des vulnérabilités externes',
            'Établissement d\'une présence persistante',
            'Élévation de privilèges',
            'Mouvement latéral dans le réseau',
            'Exfiltration des données cibles'
          ]
        });
      }
      // Ajout de scénarios pour les autres rôles...
    }
    
    return res.status(200).json({ scenarios });
  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des scénarios' });
  }
}

/**
 * Démarre une nouvelle session de défi Cyber Agent
 */
export async function startChallengeSession(req: Request, res: Response) {
  try {
    const { userName, userRole, gameMode, skillLevel, scenarioId } = req.body;
    
    if (!userName || !userRole || !gameMode || !skillLevel || !scenarioId) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const sessionId = uuidv4();
    
    // Configuration du prompt système initial en fonction du scénario et du rôle
    let systemPrompt = `Vous êtes CyberChallenge, un assistant d'entraînement à la cybersécurité. Vous devez guider l'utilisateur à travers un scénario interactif de cybersécurité.

Informations utilisateur:
- Rôle: ${userRole}
- Niveau: ${skillLevel}
- Mode de jeu: ${gameMode}

`;

    // Ajouter des instructions spécifiques au rôle
    if (userRole === 'rssi') {
      systemPrompt += `En tant que RSSI (Responsable de la Sécurité des Systèmes d'Information), l'utilisateur est chargé de la stratégie globale de sécurité, de la gestion des incidents et de la conformité. Vos défis doivent se concentrer sur la prise de décision, l'élaboration de politiques et la gestion de crise.`;
    } else if (userRole === 'hacker') {
      systemPrompt += `En tant que Hacker éthique, l'utilisateur doit identifier et exploiter des vulnérabilités dans un cadre autorisé. Vos défis doivent inclure des analyses de vulnérabilités, des tests d'intrusion et l'identification de failles de sécurité.`;
    } else if (userRole === 'developer') {
      systemPrompt += `En tant que Développeur, l'utilisateur doit comprendre et appliquer les principes de développement sécurisé. Vos défis doivent inclure des revues de code, la correction de vulnérabilités et l'implémentation de fonctionnalités de sécurité.`;
    }
    // Ajouter des instructions pour les autres rôles...

    // Ajouter des instructions spécifiques au mode de jeu
    if (gameMode === 'classic') {
      systemPrompt += `\n\nMode Classique: Présentez 4 scénarios indépendants. Chaque défi doit être complet en lui-même et ne pas dépendre des décisions prises dans les défis précédents.`;
    } else if (gameMode === 'tunnel') {
      systemPrompt += `\n\nMode Effet Tunnel: Présentez 6 situations liées entre elles. Les décisions prises par l'utilisateur doivent avoir un impact sur l'évolution du scénario. Chaque action doit avoir des conséquences visibles dans les étapes suivantes.`;
    }

    // Ajouter des instructions sur le niveau de difficulté
    if (skillLevel === 'Débutant') {
      systemPrompt += `\n\nNiveau Débutant: Expliquez les concepts de base, proposez des indices clairs et des défis accessibles. Concentrez-vous sur les fondamentaux et les menaces courantes.`;
    } else if (skillLevel === 'Intermédiaire') {
      systemPrompt += `\n\nNiveau Intermédiaire: Proposez des défis qui nécessitent une réflexion approfondie et des connaissances techniques substantielles. Limitez les indices et attendez des analyses détaillées.`;
    } else if (skillLevel === 'Expert') {
      systemPrompt += `\n\nNiveau Expert: Présentez des scénarios complexes avec des défis techniques avancés. N'offrez des indices qu'en dernier recours et attendez des solutions sophistiquées et créatives.`;
    }

    // Instructions pour intégrer le prompt système fourni par l'utilisateur
    systemPrompt += `\n\nFormat et présentation:
- Simule une interface d'application avec des mise en forme soignée
- Utilise des formats réalistes pour les communications (emails, SMS, etc.)
- Évite les QCM excessifs, préfère les réponses ouvertes
- Inclue des éléments visuels pour représenter les interfaces, documents, etc.

Lorsqu'un défi implique du code, présente-le clairement avec sa syntaxe mise en évidence. Pour les mails ou documents, utilise une mise en forme adaptée. Les indices doivent être cachés et nécessiter une recherche active.`;

    // Finalisation du prompt avec les instructions sur le scoring
    systemPrompt += `\n\nSuivi de progression:
- Attribue 10 points pour chaque étape réussie
- Enlève 5 points pour chaque erreur significative
- À la fin du scénario, fournis un rapport détaillé des compétences démontrées, des points d'amélioration et un score final

Commence par présenter le scénario initial de manière immersive et attend la première action de l'utilisateur.`;

    // Créer une session
    const sessionData: ChallengeSession = {
      sessionId,
      userId: uuidv4(), // Dans une implémentation réelle, ce serait l'ID de l'utilisateur connecté
      userName,
      userRole,
      gameMode,
      skillLevel,
      scenarioId,
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      context: {
        currentStep: 1,
        decisions: [],
        score: 0,
        achievements: [],
        isFailed: false
      },
      startTime: Date.now()
    };
    
    activeSessions.set(sessionId, sessionData);
    
    // Générer le premier message du scénario
    const initialPrompt = `Présente le scénario initial pour un ${userRole} de niveau ${skillLevel} dans le mode ${gameMode}. Sois immersif et donne suffisamment de contexte pour permettre à l'utilisateur de comprendre la situation et de commencer à interagir.

Si c'est le mode tunnel, indique clairement qu'il s'agit de la première étape d'une série de défis interconnectés.
Si c'est le mode classique, présente-le comme un défi indépendant.

Intègre des éléments visuels pertinents (comme un email, une alerte de sécurité ou un rapport) pour rendre la situation plus réaliste. Termine par une question ouverte ou un appel à l'action clair.`;

    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: initialPrompt }
    ];
    
    let response;
    try {
      response = await openAIService.getChatCompletionSecondary({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      });
    } catch (error) {
      console.error("Erreur OpenAI lors de la génération du message initial:", error);
      response = {
        choices: [
          {
            message: {
              content: "Désolé, une erreur est survenue lors de la génération du scénario initial. Veuillez réessayer."
            }
          }
        ]
      };
    }
    
    const initialMessage = response.choices[0].message.content;
    
    // Ajouter le message à la session
    sessionData.messages.push(
      { role: 'user', content: initialPrompt },
      { role: 'assistant', content: initialMessage }
    );
    
    return res.status(200).json({
      sessionId,
      initialMessage,
      context: sessionData.context
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la session:', error);
    return res.status(500).json({ message: 'Erreur lors du démarrage de la session' });
  }
}

/**
 * Traite un message dans une session de défi Cyber Agent en cours
 */
export async function processChallengeMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Ajouter le message utilisateur à la session
    session.messages.push({ role: 'user', content: message });
    
    // Construire le prompt pour l'IA en fonction du contexte actuel
    let prompt = '';
    
    if (session.gameMode === 'tunnel') {
      prompt = `L'utilisateur a envoyé: "${message}"
      
En tant que ${session.userRole} dans l'étape ${session.context.currentStep} du scénario, analyse sa réponse et:
1. Évalue si la décision est pertinente pour la situation actuelle
2. Fais progresser le scénario en fonction de cette décision (conséquences directes)
3. Introduis de nouveaux éléments ou complications en fonction des actions précédentes
4. Présente clairement les conséquences des choix précédents

Si la décision est particulièrement bonne, attribue des points bonus.
Si la décision est risquée ou incorrecte, expose les conséquences négatives.

Maintiens la cohérence avec les étapes précédentes et les décisions déjà prises.`;
    } else {
      prompt = `L'utilisateur a envoyé: "${message}"
      
En tant que ${session.userRole} face à ce défi, analyse sa réponse et:
1. Évalue si la solution proposée est adaptée au problème
2. Fournit un feedback détaillé sur l'approche choisie
3. Introduis la prochaine étape du défi ou la conclusion si approprié

Ajuste le niveau de détail technique en fonction du niveau ${session.skillLevel} de l'utilisateur.
Si la réponse est particulièrement bonne, attribue des points bonus.
Si la réponse est incorrecte, fournis des indices adaptés sans donner directement la solution.`;
    }
    
    // Envoyer la requête à l'API OpenAI
    let response;
    try {
      response = await openAIService.getChatCompletionSecondary({
        messages: [...session.messages, { role: 'user', content: prompt }].map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      });
    } catch (error) {
      console.error("Erreur OpenAI lors du traitement du message:", error);
      response = {
        choices: [
          {
            message: {
              content: "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer."
            }
          }
        ]
      };
    }
    
    const assistantMessage = response.choices[0].message.content;
    
    // Ajouter les messages à la session
    session.messages.push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: assistantMessage }
    );
    
    // Mettre à jour le contexte (ceci est simplifié, dans une implémentation réelle, 
    // on analyserait la réponse pour mettre à jour précisément le score, les étapes, etc.)
    session.context.decisions.push(message);
    
    // Dans une implémentation réelle, on analyserait la réponse de l'IA pour déterminer 
    // le score, les réussites, etc. Ici, on simule une progression simple
    if (session.gameMode === 'tunnel' && session.context.decisions.length % 2 === 0) {
      session.context.currentStep++;
    }
    
    return res.status(200).json({
      response: assistantMessage,
      context: session.context
    });
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    return res.status(500).json({ message: 'Erreur lors du traitement du message' });
  }
}

/**
 * Termine une session de défi Cyber Agent et génère un rapport de performance
 */
export async function completeChallengeSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'ID de session manquant' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Calculer la durée de la session
    const duration = Date.now() - session.startTime;
    const durationMinutes = Math.round(duration / 60000);
    
    // Construire le prompt pour générer le rapport final
    const summaryPrompt = `Génère un rapport final détaillé pour cette session de cybersécurité.

Informations sur la session:
- Rôle: ${session.userRole}
- Niveau: ${session.skillLevel}
- Mode: ${session.gameMode}
- Durée: ${durationMinutes} minutes
- Score actuel: ${session.context.score} points

Analyse:
1. Évalue les compétences démontrées et les domaines d'expertise
2. Identifie les points forts et les axes d'amélioration
3. Fournis des recommandations personnalisées pour progresser
4. Attribue un score final en ajoutant des points pour la performance globale

Organise le rapport en sections clairement définies avec des titres.
Utilise une mise en forme soignée pour améliorer la lisibilité.
Inclus un certificat de réussite attestant de l'achèvement du défi.`;

    // Envoyer la requête à l'API OpenAI
    let response;
    try {
      response = await openAIService.getChatCompletionSecondary({
        messages: [...session.messages, { role: 'user', content: summaryPrompt }].map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      });
    } catch (error) {
      console.error("Erreur OpenAI lors de la génération du rapport:", error);
      response = {
        choices: [
          {
            message: {
              content: "Désolé, une erreur est survenue lors de la génération de votre rapport final. Veuillez réessayer."
            }
          }
        ]
      };
    }
    
    const summaryMessage = response.choices[0].message.content;
    
    // Dans une implémentation réelle, on stockerait ce rapport en base de données
    // et on enverrait éventuellement un email à l'utilisateur avec le rapport
    
    // Supprimer la session
    activeSessions.delete(sessionId);
    
    return res.status(200).json({
      summary: summaryMessage,
      duration: durationMinutes,
      finalScore: session.context.score
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la session:', error);
    return res.status(500).json({ message: 'Erreur lors de la finalisation de la session' });
  }
}

/**
 * Récupère les questions du QCM pour un rôle spécifique
 */
export async function getQuestionsForRole(req: Request, res: Response) {
  try {
    const { userRole } = req.query;
    
    if (!userRole) {
      return res.status(400).json({ message: 'Rôle utilisateur manquant' });
    }
    
    // Dans une implémentation réelle, ces questions seraient stockées en base de données
    // et seraient récupérées dynamiquement en fonction du rôle
    
    // Questions communes à tous les rôles
    const commonQuestions = [
      {
        id: 1,
        text: 'Qu\'est-ce qu\'une attaque par déni de service (DoS)?',
        options: [
          { id: 'a', text: 'Une attaque visant à rendre un service indisponible', correct: true },
          { id: 'b', text: 'Un malware qui vole des données confidentielles', correct: false },
          { id: 'c', text: 'Une technique pour forcer des mots de passe', correct: false },
          { id: 'd', text: 'Un logiciel qui surveille les activités des utilisateurs', correct: false }
        ]
      },
      {
        id: 2,
        text: 'Qu\'est-ce que le phishing?',
        options: [
          { id: 'a', text: 'Un protocole de sécurité réseau', correct: false },
          { id: 'b', text: 'Une technique d\'ingénierie sociale visant à obtenir des informations confidentielles', correct: true },
          { id: 'c', text: 'Un logiciel antivirus', correct: false },
          { id: 'd', text: 'Une méthode de chiffrement', correct: false }
        ]
      }
    ];
    
    // Questions spécifiques au rôle
    interface QuestionOption {
      id: string;
      text: string;
      correct: boolean;
    }
    
    interface Question {
      id: number;
      text: string;
      options: QuestionOption[];
    }
    
    let roleSpecificQuestions: Question[] = [];
    
    if (userRole === 'rssi') {
      roleSpecificQuestions = [
        {
          id: 3,
          text: 'Quelle est la principale responsabilité d\'un RSSI?',
          options: [
            { id: 'a', text: 'Développer des applications sécurisées', correct: false },
            { id: 'b', text: 'Définir et mettre en œuvre la stratégie de sécurité de l\'information', correct: true },
            { id: 'c', text: 'Gérer les serveurs et l\'infrastructure réseau', correct: false },
            { id: 'd', text: 'Former les utilisateurs à l\'utilisation des logiciels', correct: false }
          ]
        },
        {
          id: 4,
          text: 'Qu\'est-ce qu\'une analyse de risques?',
          options: [
            { id: 'a', text: 'Un test de pénétration', correct: false },
            { id: 'b', text: 'Un audit des vulnérabilités techniques', correct: false },
            { id: 'c', text: 'L\'identification et l\'évaluation des menaces et vulnérabilités', correct: true },
            { id: 'd', text: 'Une vérification de la conformité légale', correct: false }
          ]
        }
      ];
    } else if (userRole === 'hacker') {
      roleSpecificQuestions = [
        {
          id: 3,
          text: 'Qu\'est-ce qu\'une vulnérabilité de type XSS?',
          options: [
            { id: 'a', text: 'Une faille permettant d\'exécuter du code JavaScript malveillant dans le navigateur d\'un utilisateur', correct: true },
            { id: 'b', text: 'Une attaque visant les serveurs DNS', correct: false },
            { id: 'c', text: 'Un type de malware qui affecte les systèmes Linux', correct: false },
            { id: 'd', text: 'Une technique de cryptage des données', correct: false }
          ]
        },
        {
          id: 4,
          text: 'Qu\'est-ce que le principe d\'un test d\'intrusion?',
          options: [
            { id: 'a', text: 'Bloquer toutes les tentatives d\'accès non autorisées', correct: false },
            { id: 'b', text: 'Simuler une attaque réelle pour identifier les vulnérabilités', correct: true },
            { id: 'c', text: 'Analyser le code source pour détecter les bugs', correct: false },
            { id: 'd', text: 'Surveiller le trafic réseau pour détecter des anomalies', correct: false }
          ]
        }
      ];
    } else if (userRole === 'developer') {
      roleSpecificQuestions = [
        {
          id: 3,
          text: 'Quelle pratique permet de se prémunir contre les injections SQL?',
          options: [
            { id: 'a', text: 'Utiliser des requêtes préparées avec des paramètres', correct: true },
            { id: 'b', text: 'Désactiver la base de données en production', correct: false },
            { id: 'c', text: 'Limiter le nombre de connexions à la base de données', correct: false },
            { id: 'd', text: 'Chiffrer toutes les données stockées', correct: false }
          ]
        },
        {
          id: 4,
          text: 'Qu\'est-ce que le OWASP Top 10?',
          options: [
            { id: 'a', text: 'Une liste des 10 meilleurs outils de développement', correct: false },
            { id: 'b', text: 'Les 10 langages de programmation les plus sécurisés', correct: false },
            { id: 'c', text: 'Les 10 risques de sécurité les plus critiques pour les applications web', correct: true },
            { id: 'd', text: 'Un ensemble de 10 principes pour une architecture logicielle robuste', correct: false }
          ]
        }
      ];
    }
    // Ajouter des questions pour les autres rôles...
    
    const questions = [...commonQuestions, ...roleSpecificQuestions];
    
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des questions' });
  }
}