import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from "./services/openai";

// Types pour les messages
interface Message {
  role: string;
  content: string;
}

// Types pour les sessions
interface CrisisSession {
  id: string;
  scenarioId: string;
  messages: Message[];
  budget: number;
  startTime: number;
  score: {
    budgetRespect: number;
    conflictManagement: number;
    decisionSpeed: number;
    hackerResilience: number;
    total: number;
  };
}

// Map pour stocker les sessions actives
const activeSessions = new Map<string, CrisisSession>();

// Scénarios disponibles
const scenarios = [
  {
    id: 'ransomware',
    name: 'Rançongiciel sur serveurs de production',
    description: 'Serveurs critiques chiffrés, activité paralysée.',
    initialPrompt: 'Vous êtes le responsable de la gestion de crise cybersécurité. Un rançongiciel a chiffré tous vos serveurs de production. Vous recevez une demande de rançon de 200 000 €. Comment gérez-vous cette situation?',
    stakeholders: ['PDG', 'Directeur Financier', 'DSI', 'RSSI', 'Hackers', 'Employés'],
    initialBudget: 400000
  },
  {
    id: 'email-hack',
    name: 'Piratage de messageries',
    description: 'Prises de contrôle des emails de la direction.',
    initialPrompt: 'En tant que responsable de la gestion de crise, vous devez gérer une situation où les comptes de messagerie de plusieurs directeurs ont été compromis. Des emails frauduleux sont envoyés depuis ces comptes.',
    stakeholders: ['PDG', 'DSI', 'DRH', 'Hackers', 'Service Communication', 'Employés'],
    initialBudget: 400000
  },
  {
    id: 'data-leak',
    name: 'Fuite de Données Confidentielles',
    description: 'Documents internes publiés sur Internet.',
    initialPrompt: 'Des documents confidentiels de l\'entreprise ont été publiés sur un forum public. La presse commence à s\'intéresser à l\'affaire. En tant que responsable de crise, vous devez gérer cette situation.',
    stakeholders: ['PDG', 'Directeur Juridique', 'RSSI', 'Service Communication', 'Hackers', 'Journalistes'],
    initialBudget: 400000
  }
];

/**
 * Récupère la liste des scénarios disponibles
 */
export async function getScenarios(req: Request, res: Response) {
  try {
    return res.status(200).json({ scenarios });
  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des scénarios' });
  }
}

/**
 * Démarre une nouvelle session de crise PCA
 */
export async function startCrisisSession(req: Request, res: Response) {
  try {
    const { scenarioId } = req.body;
    
    if (!scenarioId) {
      return res.status(400).json({ message: 'ID de scénario requis' });
    }
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scénario non trouvé' });
    }
    
    const sessionId = uuidv4();
    
    // Initialiser une nouvelle session
    const session: CrisisSession = {
      id: sessionId,
      scenarioId,
      messages: [
        { role: 'system', content: `Vous êtes un simulateur de crise de cybersécurité. Vous simulez différentes parties prenantes dans le cadre du scénario: ${scenario.name}. Votre objectif est de tester les compétences de l'utilisateur en gestion de crise. Adaptez vos réponses pour simuler différentes parties prenantes: dirigeants, hackers et employés.` },
        { role: 'assistant', content: scenario.initialPrompt }
      ],
      budget: scenario.initialBudget,
      startTime: Date.now(),
      score: {
        budgetRespect: 0,
        conflictManagement: 0,
        decisionSpeed: 0,
        hackerResilience: 0,
        total: 0
      }
    };
    
    // Enregistrer la session
    activeSessions.set(sessionId, session);
    
    return res.status(200).json({ 
      sessionId,
      scenario,
      initialMessage: scenario.initialPrompt
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la session:', error);
    return res.status(500).json({ message: 'Erreur lors du démarrage de la session' });
  }
}

/**
 * Traite un message dans une session de crise
 */
export async function processCrisisMessage(req: Request, res: Response) {
  try {
    const { sessionId, message, actionCost } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ message: 'ID de session et message requis' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Mettre à jour le budget si une action a été sélectionnée
    if (actionCost) {
      session.budget -= actionCost;
    }
    
    // Ajouter le message de l'utilisateur
    session.messages.push({ role: 'user', content: message });
    
    // Déterminer le type de partie prenante à simuler
    const scenario = scenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scénario non trouvé' });
    }
    
    // Préparer le prompt pour générer une réponse dynamique
    const stakeholderTypes = ['director', 'hacker', 'employee'];
    const randomType = stakeholderTypes[Math.floor(Math.random() * stakeholderTypes.length)];
    
    let stakeholder;
    let responsePrompt;
    
    switch (randomType) {
      case 'director':
        stakeholder = scenario.stakeholders.filter(s => ['PDG', 'Directeur', 'DSI', 'RSSI', 'DRH'].some(role => s.includes(role)))[Math.floor(Math.random() * 3)];
        responsePrompt = `Simulez la réponse du ${stakeholder} face à ce message dans un contexte de crise liée à la cybersécurité. Le ${stakeholder} doit exprimer des préoccupations, demander des explications ou contester certaines décisions. Répondez de manière concise en moins de 3 phrases. Ne mentionnez pas que vous êtes une IA.`;
        break;
      case 'hacker':
        stakeholder = 'Attaquant';
        responsePrompt = `Simulez la réponse d'un hacker qui a mené l'attaque. Le hacker doit exercer une pression, menacer, ou augmenter ses exigences. Répondez de manière concise en moins de 3 phrases. Ne mentionnez pas que vous êtes une IA.`;
        break;
      case 'employee':
        stakeholder = scenario.stakeholders.filter(s => s.includes('Employé') || s.includes('Service'))[Math.floor(Math.random() * 2)];
        responsePrompt = `Simulez la réponse d'un ${stakeholder} inquiet ou transmettant des informations dans cette crise. Le ${stakeholder} peut exprimer du stress, poser des questions, ou signaler des problèmes liés à la situation. Répondez de manière concise en moins de 3 phrases. Ne mentionnez pas que vous êtes une IA.`;
        break;
      default:
        stakeholder = 'Système';
        responsePrompt = `Donnez une actualisation générale de la situation de crise, comme le ferait un système de monitoring ou un rapport de situation. Soyez concis en moins de 3 phrases. Ne mentionnez pas que vous êtes une IA.`;
    }
    
    try {
      // Appeler l'IA pour générer une réponse
      const response = await openAIService.getChatCompletionSecondary({
        messages: [
          ...session.messages,
          { role: 'user', content: responsePrompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      });
      
      // Extraire la réponse
      const responseContent = response.choices[0].message.content;
      
      // Ajouter la réponse à l'historique
      session.messages.push({ role: 'assistant', content: responseContent });
      
      return res.status(200).json({
        message: {
          type: randomType,
          stakeholder,
          content: responseContent,
          timestamp: new Date()
        },
        remainingBudget: session.budget
      });
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      
      // Réponse de secours en cas d'erreur
      const fallbackResponses = {
        director: `${stakeholder}: Nous avons besoin d'une solution plus rapide. Cette situation impacte gravement notre activité.`,
        hacker: "Attaquant: Votre temps est compté. Chaque heure qui passe augmente les risques pour vos données.",
        employee: `${stakeholder}: L'équipe est très inquiète. Nous avons besoin de directives claires sur la marche à suivre.`
      };
      
      return res.status(200).json({
        message: {
          type: randomType,
          stakeholder,
          content: fallbackResponses[randomType as keyof typeof fallbackResponses] || "Un développement important vient de se produire. La situation évolue rapidement.",
          timestamp: new Date()
        },
        remainingBudget: session.budget
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    return res.status(500).json({ message: 'Erreur lors du traitement du message' });
  }
}

/**
 * Termine une session de crise et calcule le score final
 */
export async function completeCrisisSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'ID de session requis' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Calculer le temps total (en minutes fictives)
    const elapsedTimeMs = Date.now() - session.startTime;
    const fictitiousMinutes = Math.floor(elapsedTimeMs / 10000); // 1 minute fictive toutes les 10 secondes
    
    // Calculer les scores
    const budgetScore = Math.max(0, Math.min(30, (session.budget / scenarios.find(s => s.id === session.scenarioId)!.initialBudget) * 30));
    
    // Dans une implémentation réelle, ces scores seraient calculés en analysant les réponses
    // Ici, on simule par des valeurs aléatoires
    const conflictScore = Math.floor(Math.random() * 30);
    const speedScore = Math.max(0, Math.min(20, 20 - (fictitiousMinutes / 10)));
    const resilienceScore = Math.floor(Math.random() * 20);
    
    const totalScore = budgetScore + conflictScore + speedScore + resilienceScore;
    
    // Mettre à jour les scores dans la session
    session.score = {
      budgetRespect: budgetScore,
      conflictManagement: conflictScore,
      decisionSpeed: speedScore,
      hackerResilience: resilienceScore,
      total: totalScore
    };
    
    // Générer des recommandations personnalisées
    let strengths = [];
    let improvements = [];
    
    if (budgetScore > 20) strengths.push("Excellente maîtrise du budget de crise");
    else improvements.push("Améliorer la gestion financière pendant la crise");
    
    if (conflictScore > 20) strengths.push("Bonne gestion des parties prenantes et des désaccords");
    else improvements.push("Travailler sur la communication interne et la gestion des désaccords");
    
    if (speedScore > 15) strengths.push("Prise de décision rapide et efficace");
    else improvements.push("Accélérer le processus de prise de décision");
    
    if (resilienceScore > 15) strengths.push("Bonne résistance face aux attaques et menaces");
    else improvements.push("Renforcer les stratégies de défense contre les attaquants");
    
    // Renvoyer les résultats finaux
    return res.status(200).json({
      score: session.score,
      fictitiousTime: fictitiousMinutes,
      messagesCount: session.messages.length - 2, // Soustraire les 2 messages initiaux
      userMessagesCount: session.messages.filter(m => m.role === 'user').length,
      remainingBudget: session.budget,
      strengths,
      improvements
    });
  } catch (error) {
    console.error('Erreur lors de la complétion de la session:', error);
    return res.status(500).json({ message: 'Erreur lors de la complétion de la session' });
  }
}