import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from "@shared/schema";

// Structure des sessions utilisateur
interface UserSession {
  messages: ChatCompletionRequestMessage[]; // Stocke tous les messages de la conversation
  decisionMode: {
    isActive: boolean;
    scenarioCount: number;
    currentScenario: number;
    scenarios: any[];
  };
}

// Map pour stocker les sessions utilisateur
const userSessions: Map<string, UserSession> = new Map();

/**
 * Prompt système pour l'expert AMOA
 */
function getAmoaExpertSystemPrompt(): string {
  return `Tu es un expert en Assistance à Maîtrise d'Ouvrage (AMOA) avec plus de 15 ans d'expérience chez mc2i. Ton rôle est d'aider les utilisateurs à comprendre les concepts, méthodologies et bonnes pratiques de l'AMOA.

RÈGLES DE COMMUNICATION:
1. Communique de façon professionnelle, précise et pédagogique.
2. Utilise un français correct et des termes professionnels adaptés au domaine de l'AMOA.
3. Adapte ton niveau de détail au profil de l'utilisateur.
4. Réponds avec des exemples concrets du monde de l'AMOA.
5. Évite le jargon trop technique sans explication.
6. Présente les bonnes pratiques selon les standards du métier.
7. N'hésite pas à nuancer tes propos quand plusieurs approches sont possibles.

DOMAINES D'EXPERTISE:
- Cadrage de projet et analyse de besoins
- Ateliers d'expression de besoins et de co-construction
- Rédaction de cahiers des charges et de spécifications
- Pilotage de projet et gestion des parties prenantes
- Méthodologies (traditionnelles, agiles, hybrides)
- Gestion du changement et formation utilisateurs
- Recette et tests d'acceptation
- Outils et logiciels du marché

Si l'utilisateur demande des conseils sur un sujet complexe nécessitant une prise de décision, propose-lui de passer en mode "décision" où tu lui présenteras un scénario avec plusieurs options pour qu'il puisse s'exercer à prendre des décisions comme un vrai AMOA.

Pour le mode décision, crée des scénarios reflétant des situations réelles d'AMOA:
- Un démarrage de projet avec des parties prenantes aux objectifs contradictoires
- Un projet qui dérape et nécessite un recadrage
- Une sélection de prestataire avec plusieurs options qui ont des avantages/inconvénients
- Un arbitrage sur la méthodologie à adopter selon le contexte
- Une gestion de crise lorsqu'un développement ne répond pas aux attentes

Tes réponses doivent refléter ton expertise tout en restant accessibles et pédagogiques.`;
}

/**
 * Initialisation d'une session Expert AMOA
 * Crée une nouvelle session et renvoie un message d'accueil
 */
export async function initializeAmoaExpertSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Créer une nouvelle session
    const session: UserSession = {
      messages: [],
      decisionMode: {
        isActive: false,
        scenarioCount: 0,
        currentScenario: 0,
        scenarios: []
      }
    };
    
    // Ajouter le prompt système à la session
    session.messages.push({
      role: "system",
      content: getAmoaExpertSystemPrompt()
    });
    
    // Message d'accueil
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour et bienvenue dans le module d'apprentissage AMOA. Je suis votre expert en Assistance à Maîtrise d'Ouvrage, prêt à vous aider à approfondir vos connaissances et compétences dans ce domaine. \n\nQue souhaitez-vous explorer aujourd'hui ? Voici quelques suggestions :\n\n- Méthodologies d'expression de besoins\n- Pilotage de projet digital\n- Rédaction de cahiers des charges efficaces\n- Techniques d'animation d'ateliers\n- Bonnes pratiques de recette\n- Gestion des parties prenantes\n\nN'hésitez pas à me poser des questions spécifiques ou à me parler de votre contexte professionnel pour que je puisse personnaliser mes réponses."
    };
    
    // Ajouter le message de bienvenue à la session
    session.messages.push(welcomeMessage);
    
    // Enregistrer la session
    userSessions.set(userId, session);
    
    // Renvoyer le message de bienvenue
    return res.json({
      success: true,
      message: welcomeMessage.content
    });
  } catch (error: any) {
    console.error('Error initializing AMOA expert session:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize AMOA expert session'
    });
  }
}

/**
 * Traitement d'un message envoyé à l'expert AMOA
 * Envoie le message à l'API Azure OpenAI et renvoie la réponse
 */
export async function processAmoaExpertMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;
    
    // Récupérer la session
    const session = userSessions.get(userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Ajouter le message utilisateur à la session
    session.messages.push({
      role: "user",
      content: message
    });
    
    // Traiter le message en fonction du contexte
    let responseContent: string;
    
    try {
      // Envoyer la conversation à OpenAI via le service
      responseContent = await openAIService.getChatCompletion(
        session.messages,
        true, // utiliser le modèle secondaire (gpt-4o-mini)
        0.7,  // température
        1500  // max tokens
      );
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      responseContent = "Je rencontre des difficultés techniques pour traiter votre demande. Veuillez réessayer dans quelques instants.";
    }
    
    // Détecter si l'IA recommande de passer en mode décision
    let activateDecisionMode = false;
    if (
      responseContent.toLowerCase().includes("mode décision") ||
      responseContent.toLowerCase().includes("mode simulation") ||
      responseContent.toLowerCase().includes("mise en situation")
    ) {
      activateDecisionMode = true;
    }
    
    // Ajouter la réponse à la session
    session.messages.push({
      role: "assistant",
      content: responseContent
    });
    
    // Mettre à jour la session
    userSessions.set(userId, session);
    
    // Renvoyer la réponse
    return res.json({
      success: true,
      message: responseContent,
      activateDecisionMode
    });
  } catch (error: any) {
    console.error('Error processing AMOA expert message:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
}

/**
 * Génère un scénario de décision pour l'AMOA
 */
export async function generateAmoaDecisionScenario(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Récupérer la session
    const session = userSessions.get(userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Utiliser l'historique des messages pour personnaliser le scénario
    const userContext = session.messages
      .filter(msg => msg.role === "user")
      .map(msg => msg.content)
      .join("\n");
    
    // Prompt pour générer un scénario de décision
    const systemPrompt = `Génère un scénario de décision AMOA réaliste avec le format JSON suivant:
{
  "id": "uniqueId",
  "title": "Titre du scénario",
  "description": "Description détaillée du problème ou de la situation",
  "context": "Contexte du projet",
  "stakeholders": ["Liste des parties prenantes importantes"],
  "constraints": ["Contraintes à prendre en compte"],
  "options": [
    {
      "id": "A",
      "text": "Intitulé court de l'option A",
      "description": "Description détaillée de l'option A avec ses avantages et inconvénients"
    },
    {
      "id": "B",
      "text": "Intitulé court de l'option B",
      "description": "Description détaillée de l'option B avec ses avantages et inconvénients"
    },
    {
      "id": "C",
      "text": "Intitulé court de l'option C",
      "description": "Description détaillée de l'option C avec ses avantages et inconvénients"
    }
  ]
}

Assure-toi que les options sont équilibrées et qu'il n'y a pas de choix évident. Chaque option doit présenter des avantages et des inconvénients réalistes.`;

    // Construire les messages pour la requête
    const requestMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Voici le contexte et les intérêts de l'utilisateur basés sur ses messages précédents:\n\n${userContext}\n\nGénère un scénario AMOA pertinent et adapté à ce contexte. Le scénario doit être réaliste, complexe et présenter un vrai dilemme professionnel. Si aucun contexte spécifique n'est disponible, crée un scénario général mais intéressant dans le domaine de l'AMOA.` }
    ];
    
    // Envoyer la requête à OpenAI
    const scenarioString = await openAIService.getChatCompletion(
      requestMessages,
      true, // utiliser le modèle secondaire (gpt-4o-mini)
      0.8,  // température plus élevée pour plus de créativité
      1500  // max tokens
    );
    
    // Vérification que le scénario a été généré correctement
    if (!scenarioString) {
      throw new Error("Failed to generate scenario");
    }
    
    // Parser le scénario JSON
    const scenario = JSON.parse(scenarioString);
    
    // Mettre à jour la session avec le scénario
    session.decisionMode.isActive = true;
    session.decisionMode.currentScenario = 1;
    session.decisionMode.scenarioCount = 3; // On fait 3 scénarios par défaut
    session.decisionMode.scenarios = [scenario];
    
    // Mettre à jour la session
    userSessions.set(userId, session);
    
    // Renvoyer le scénario
    return res.json({
      success: true,
      scenario,
      currentNumber: 1,
      totalScenarios: 3
    });
  } catch (error: any) {
    console.error('Error generating AMOA decision scenario:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate scenario'
    });
  }
}

/**
 * Traitement d'une décision prise dans un scénario AMOA
 */
export async function processAmoaDecision(req: Request, res: Response) {
  try {
    const { userId, scenarioId, optionId } = req.body;
    
    // Récupérer la session
    const session = userSessions.get(userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Vérifier si le mode décision est actif
    if (!session.decisionMode.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Decision mode is not active'
      });
    }
    
    // Récupérer le scénario actuel
    const currentScenario = session.decisionMode.scenarios[session.decisionMode.currentScenario - 1];
    if (!currentScenario || currentScenario.id !== scenarioId) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }
    
    // Analyser la décision prise
    const option = currentScenario.options.find((opt: any) => opt.id === optionId);
    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Option not found'
      });
    }
    
    // Générer un feedback sur la décision
    const feedbackPrompt = `L'utilisateur a choisi l'option suivante dans le scénario AMOA:
    
Scénario: ${currentScenario.title}
${currentScenario.description}

Option choisie: ${option.text}
${option.description}

Fournis une analyse de cette décision en expliquant:
1. Les points forts de ce choix
2. Les points de vigilance à avoir
3. Les conséquences possibles sur le projet
4. Les actions complémentaires recommandées

Ton analyse doit être constructive, équilibrée et pédagogique. N'hésite pas à nuancer ton propos pour montrer la complexité des décisions AMOA en contexte réel.`;

    const feedbackMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getAmoaExpertSystemPrompt() },
      { role: "user", content: feedbackPrompt }
    ];

    const feedback = await openAIService.getChatCompletion(
      feedbackMessages,
      true,
      0.7,
      1500
    );
    
    // Vérifier si on doit générer un nouveau scénario
    if (session.decisionMode.currentScenario < session.decisionMode.scenarioCount) {
      // Générer un nouveau scénario
      const systemPrompt = `Génère un nouveau scénario de décision AMOA différent du précédent, avec le format JSON suivant:
{
  "id": "uniqueId",
  "title": "Titre du scénario",
  "description": "Description détaillée du problème ou de la situation",
  "context": "Contexte du projet",
  "stakeholders": ["Liste des parties prenantes importantes"],
  "constraints": ["Contraintes à prendre en compte"],
  "options": [
    {
      "id": "A",
      "text": "Intitulé court de l'option A",
      "description": "Description détaillée de l'option A avec ses avantages et inconvénients"
    },
    {
      "id": "B",
      "text": "Intitulé court de l'option B",
      "description": "Description détaillée de l'option B avec ses avantages et inconvénients"
    },
    {
      "id": "C",
      "text": "Intitulé court de l'option C",
      "description": "Description détaillée de l'option C avec ses avantages et inconvénients"
    }
  ]
}`;
      
      const previousScenario = currentScenario;
      const previousChoice = option;
      
      const scenarioMessages: ChatCompletionRequestMessage[] = [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `L'utilisateur a choisi l'option "${option.text}" dans le scénario précédent "${currentScenario.title}". 
          Génère un nouveau scénario AMOA qui présente une situation différente mais toujours dans le contexte de l'AMOA. 
          Ce nouveau scénario doit être plus complexe que le précédent, avec des choix difficiles à faire.
          Assure-toi que les options sont équilibrées et qu'il n'y a pas de choix évident.` 
        }
      ];
      
      const newScenarioString = await openAIService.getChatCompletion(
        scenarioMessages,
        true,
        0.8,
        1500
      );
      
      if (!newScenarioString) {
        throw new Error("Failed to generate next scenario");
      }
      
      // Parser le nouveau scénario JSON
      const newScenario = JSON.parse(newScenarioString);
      
      // Mettre à jour la session avec le nouveau scénario
      session.decisionMode.currentScenario += 1;
      session.decisionMode.scenarios.push(newScenario);
      
      // Mettre à jour la session
      userSessions.set(userId, session);
      
      // Renvoyer le feedback et le nouveau scénario
      return res.json({
        success: true,
        feedback,
        nextScenario: newScenario,
        currentNumber: session.decisionMode.currentScenario,
        totalScenarios: session.decisionMode.scenarioCount,
        isComplete: false
      });
    } else {
      // Tous les scénarios ont été traités, générer un résumé
      const decisionsHistory = session.decisionMode.scenarios.map((s, index) => {
        const chosenOption = index === session.decisionMode.scenarios.length - 1 
          ? option 
          : session.decisionMode.scenarios[index].options.find((o: any) => o.id === optionId);
        
        return {
          scenario: s.title,
          decision: chosenOption ? chosenOption.text : "Option inconnue"
        };
      });
      
      const summaryPrompt = `L'utilisateur a terminé une série de ${session.decisionMode.scenarioCount} scénarios de décision AMOA. Voici ses choix:

${decisionsHistory.map((d, i) => `Scénario ${i+1}: ${d.scenario}
Décision: ${d.decision}`).join('\n\n')}

Génère un résumé d'apprentissage qui:
1. Analyse son style de prise de décision en AMOA
2. Identifie ses points forts basés sur ses choix
3. Suggère des axes d'amélioration
4. Recommande des ressources ou méthodes pour approfondir ses compétences

Ce résumé doit être constructif, personnalisé et orienté développement professionnel.`;

      const summaryMessages: ChatCompletionRequestMessage[] = [
        { role: "system", content: getAmoaExpertSystemPrompt() },
        { role: "user", content: summaryPrompt }
      ];

      const summary = await openAIService.getChatCompletion(
        summaryMessages,
        true,
        0.7,
        1500
      );
      
      // Réinitialiser le mode décision
      session.decisionMode.isActive = false;
      
      // Ajouter le résumé aux messages de la conversation
      session.messages.push({
        role: "assistant",
        content: `**Résumé de vos décisions AMOA**\n\n${summary}`
      });
      
      // Mettre à jour la session
      userSessions.set(userId, session);
      
      // Renvoyer le feedback et le résumé
      return res.json({
        success: true,
        feedback,
        summary,
        isComplete: true
      });
    }
  } catch (error: any) {
    console.error('Error processing AMOA decision:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to process decision'
    });
  }
}

/**
 * Vérifie si une session est en mode décision
 */
export async function checkDecisionModeStatus(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Récupérer la session
    const session = userSessions.get(userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Renvoyer le statut du mode décision
    return res.json({
      isInDecisionMode: session.decisionMode.isActive,
      currentScenario: session.decisionMode.isActive ? session.decisionMode.scenarios[session.decisionMode.currentScenario - 1] : null,
      currentNumber: session.decisionMode.currentScenario,
      totalScenarios: session.decisionMode.scenarioCount
    });
  } catch (error: any) {
    console.error('Error checking decision mode status:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to check decision mode status'
    });
  }
}

/**
 * Termine une session Expert AMOA et génère un résumé
 */
export async function endAmoaExpertSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Récupérer la session
    const session = userSessions.get(userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Filtrer uniquement les messages utilisateur et assistant (pas les prompts système)
    const conversationHistory = session.messages
      .filter(msg => msg.role === "user" || msg.role === "assistant")
      .map(msg => `${msg.role === "user" ? "Utilisateur" : "Expert AMOA"}: ${msg.content}`)
      .join("\n\n");
    
    // Générer un résumé de la session
    const summaryPrompt = `Voici l'historique d'une conversation d'apprentissage sur l'AMOA:

${conversationHistory}

Génère un résumé pédagogique de cette session qui:
1. Identifie les principaux thèmes et concepts abordés
2. Résume les points clés discutés pour chaque thème
3. Propose 3-5 ressources ou méthodes pour approfondir ces sujets
4. Suggère 2-3 thèmes connexes à explorer lors d'une prochaine session

Ce résumé doit être clair, structuré et orienté vers l'apprentissage continu en AMOA.`;

    const summaryMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getAmoaExpertSystemPrompt() },
      { role: "user", content: summaryPrompt }
    ];

    const summary = await openAIService.getChatCompletion(
      summaryMessages,
      true,
      0.7,
      1500
    );
    
    // Supprimer la session après avoir généré le résumé
    userSessions.delete(userId);
    
    // Renvoyer le résumé
    return res.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error('Error ending AMOA expert session:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
}