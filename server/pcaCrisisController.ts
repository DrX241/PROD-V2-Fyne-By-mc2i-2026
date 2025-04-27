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
    
    // Déterminer le contexte spécifique du scénario
    const scenarioContext = scenario.id === 'ransomware' 
        ? "une attaque de ransomware qui a chiffré tous les serveurs de production" 
        : scenario.id === 'email-hack' 
            ? "une compromission des comptes de messagerie de plusieurs directeurs permettant l'envoi d'emails frauduleux" 
            : "une fuite de données confidentielles publiées sur un forum public";
    
    // Créer un message système plus détaillé pour mieux cadrer l'IA
    const systemMessage = `Tu simules une crise cyber. SOIS BREF (max 2 phrases). NE DIS JAMAIS QUE TU ES UNE IA.`;
    
    // Initialiser une nouvelle session avec un message initial plus détaillé
    const session: CrisisSession = {
      id: sessionId,
      scenarioId,
      messages: [
        { role: 'system', content: systemMessage },
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
    
    // Récupérer le scénario
    const scenario = scenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scénario non trouvé' });
    }
    
    // Déterminer le contexte du scénario
    const scenarioContext = scenario.id === 'ransomware' 
        ? "une attaque de ransomware qui a chiffré tous les serveurs de production" 
        : scenario.id === 'email-hack' 
            ? "une compromission des comptes de messagerie de plusieurs directeurs permettant l'envoi d'emails frauduleux" 
            : "une fuite de données confidentielles publiées sur un forum public";
    
    // Déterminer la partie prenante de manière plus intelligente en fonction du contexte
    // Examiner le message utilisateur pour voir s'il est pertinent de choisir un type spécifique
    const userMessage = message.toLowerCase();
    
    let stakeholderTypes = ['director', 'hacker', 'employee'];
    let randomType = '';
    
    // Si l'utilisateur parle de rançon, négociation, ou paiement, privilégier le hacker
    if (userMessage.includes('rançon') || userMessage.includes('paiement') || 
        userMessage.includes('négoci') || userMessage.includes('demande') || 
        userMessage.includes('attaquant') || userMessage.includes('hacker')) {
      randomType = 'hacker';
    } 
    // Si l'utilisateur parle de budget, coûts, stratégie, décisions, privilégier un directeur
    else if (userMessage.includes('budget') || userMessage.includes('coût') || 
             userMessage.includes('stratégie') || userMessage.includes('décision') ||
             userMessage.includes('direction') || userMessage.includes('conseil')) {
      randomType = 'director';
    }
    // Si l'utilisateur parle de technique, opérations, équipes, état, privilégier un employé
    else if (userMessage.includes('équipe') || userMessage.includes('opération') || 
             userMessage.includes('technique') || userMessage.includes('systèmes') ||
             userMessage.includes('informatique') || userMessage.includes('état')) {
      randomType = 'employee';
    }
    // Sinon choisir aléatoirement, mais avec une distribution plus réaliste
    else {
      const rand = Math.random();
      // 40% chance d'avoir un directeur, 30% un employé, 30% un hacker
      if (rand < 0.4) {
        randomType = 'director';
      } else if (rand < 0.7) {
        randomType = 'employee';
      } else {
        randomType = 'hacker';
      }
    }
    
    let stakeholder;
    let responsePrompt;
    
    switch (randomType) {
      case 'director':
        // Choisir un directeur pertinent selon le contexte
        const directorCandidates = scenario.stakeholders.filter(s => 
          ['PDG', 'Directeur', 'DSI', 'RSSI', 'DRH'].some(role => s.includes(role))
        );
        stakeholder = directorCandidates.length > 0 
            ? directorCandidates[Math.floor(Math.random() * Math.min(directorCandidates.length, 3))]
            : 'PDG';
        
        responsePrompt = `Simule exactement la réponse d'un ${stakeholder} préoccupé par l'impact business d'une crise cyber. Sois bref (max 2 phrases), direct, sans introduction. Ton inquiet d'un dirigeant. NE MENTIONNE JAMAIS QUE TU ES UNE IA`;
        break;
        
      case 'hacker':
        stakeholder = 'Attaquant';
        responsePrompt = `Simule exactement un message d'attaquant informatique qui demande une rançon ou menace. Max 2 phrases, ton menaçant mais professionnel. Phrases courtes, directes, sans dire que tu es une IA.`;
        break;
        
      case 'employee':
        // Choisir un employé pertinent selon le contexte
        const employeeCandidates = scenario.stakeholders.filter(s => 
          s.includes('Employé') || s.includes('Service') || s.includes('Technique')
        );
        stakeholder = employeeCandidates.length > 0 
            ? employeeCandidates[Math.floor(Math.random() * Math.min(employeeCandidates.length, 2))]
            : 'Service Informatique';
            
        responsePrompt = `Simule exactement la réponse d'un technicien informatique pendant une crise cyber. 2 phrases maximum, ton technique et factuel, langage spécifique. NE DIS JAMAIS QUE TU ES UNE IA.`;
        break;
        
      default:
        stakeholder = 'Système';
        responsePrompt = `Crée une notification système informatique automatique et factuelle. Max 2 phrases, inclus un horodatage, ton neutre et impersonnel. NE DIS PAS QUE TU ES UNE IA.`;
    }
    
    try {
      // Créer un historique concis pour l'IA 
      // Limiter à 5 derniers messages pour éviter une histoire trop longue
      const recentMessages = session.messages.slice(-5);
      
      // Ajouter un message système très simple
      const systemPrompt = `Réponds exactement dans le rôle indiqué. IMPORTANT: sois extrêmement bref (max 2 phrases) et ne mentionne jamais que tu es une IA.`;
      
      // Appeler l'IA pour générer une réponse
      const response = await openAIService.getChatCompletionSecondary({
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
          { role: 'user', content: responsePrompt }
        ],
        temperature: 0.8,  // Légèrement plus élevé pour plus de créativité
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