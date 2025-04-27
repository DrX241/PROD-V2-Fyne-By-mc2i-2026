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
    const systemMessage = `Tu participes à une simulation de gestion de crise en cybersécurité impliquant ${scenarioContext}.
Contexte: L'entreprise est en situation de crise. Tu joueras le rôle de différents intervenants (directeurs, employés, attaquants).
Règles: 
1. Tes réponses doivent être brèves (2-3 phrases max)
2. Ne mentionne JAMAIS que tu es une IA
3. Garde une cohérence avec l'historique des messages
4. Adapte ton langage au type d'intervenant que tu joues
5. Respecte le scénario de crise établi: ${scenario.name}`;
    
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
        
        responsePrompt = `
Tu dois simuler avec réalisme la réponse d'un ${stakeholder} pendant ${scenarioContext}. 
Contexte: Le ${stakeholder} est préoccupé par les impacts business, financiers et réputationnels de cette crise.

Instructions précises:
1. Ta réponse ne doit JAMAIS mentionner que tu es une IA
2. Réponds directement comme si tu étais le ${stakeholder} sans formules d'introduction
3. Utilise un ton autoritaire mais inquiet, avec un langage approprié à un cadre dirigeant
4. Exprime une préoccupation précise, pose une question directe ou demande une action claire
5. Limite-toi à 2-3 phrases courtes maximum
6. Concentre-toi sur un seul sujet (business, finance, réputation ou légal)
7. Fais-toi passer pour un humain, pas une IA

Réponse directe comme le ${stakeholder}:`;
        break;
        
      case 'hacker':
        stakeholder = 'Attaquant';
        responsePrompt = `
Tu dois simuler avec réalisme la réponse d'un attaquant informatique dans le contexte de ${scenarioContext}.
Contexte: L'attaquant cherche à augmenter la pression pour obtenir une rançon ou créer plus de dégâts.

Instructions précises:
1. Ta réponse ne doit JAMAIS mentionner que tu es une IA
2. Réponds directement comme si tu étais l'attaquant sans formules d'introduction
3. Utilise un ton menaçant, intimidant mais professionnel, comme un cybercriminel organisé
4. Formule une menace précise, une demande claire ou un ultimatum
5. Limite-toi à 2-3 phrases courtes maximum
6. Ne te contredis pas: si une demande financière a été faite avant, maintiens le même montant ou augmente-le
7. Fais-toi passer pour un humain, pas une IA

Réponse directe comme l'attaquant:`;
        break;
        
      case 'employee':
        // Choisir un employé pertinent selon le contexte
        const employeeCandidates = scenario.stakeholders.filter(s => 
          s.includes('Employé') || s.includes('Service') || s.includes('Technique')
        );
        stakeholder = employeeCandidates.length > 0 
            ? employeeCandidates[Math.floor(Math.random() * Math.min(employeeCandidates.length, 2))]
            : 'Service Informatique';
            
        responsePrompt = `
Tu dois simuler avec réalisme la réponse d'un membre du ${stakeholder} pendant ${scenarioContext}.
Contexte: Le ${stakeholder} est en première ligne pour gérer les aspects techniques ou organisationnels de la crise.

Instructions précises:
1. Ta réponse ne doit JAMAIS mentionner que tu es une IA
2. Réponds directement comme si tu étais du ${stakeholder} sans formules d'introduction
3. Utilise un ton technique et pragmatique, avec un langage approprié à ton rôle
4. Communique une information technique précise, un problème concret ou une question opérationnelle
5. Limite-toi à 2-3 phrases courtes maximum
6. Sois spécifique et précis dans ta réponse, évite les généralités
7. Fais-toi passer pour un humain, pas une IA

Réponse directe comme ${stakeholder}:`;
        break;
        
      default:
        stakeholder = 'Système';
        responsePrompt = `
Tu dois simuler un message système automatique dans le contexte de ${scenarioContext}.
Contexte: Notification automatique concernant l'évolution de la situation de crise.

Instructions précises:
1. Ta réponse ne doit PAS inclure d'introduction ni mentionner que tu es une IA
2. Formulée comme une notification système automatique
3. Utilise un ton neutre et factuel comme le ferait un système de monitoring
4. Communique une évolution précise de la situation ou une alerte
5. Limite-toi à 2-3 phrases courtes maximum
6. Inclus une information temporelle (délai ou timestamp) pour plus de réalisme
7. Évite tout langage suggérant que tu es une IA

Réponse directe comme notification système:`;
    }
    
    try {
      // Créer un historique concis pour l'IA 
      // Limiter à 5 derniers messages pour éviter une histoire trop longue
      const recentMessages = session.messages.slice(-5);
      
      // Ajouter un message système pour donner du contexte
      const systemPrompt = `Tu participes à une simulation de crise cybersécurité avec ${scenarioContext}. 
Ta mission est de générer des réponses réalistes aux messages des utilisateurs. Chaque réponse doit correspondre
au type d'interlocuteur indiqué dans la requête.`;
      
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