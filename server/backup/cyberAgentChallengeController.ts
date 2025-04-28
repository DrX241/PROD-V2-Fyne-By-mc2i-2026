import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { v4 as uuidv4 } from 'uuid';
import { 
  ChatCompletionRequestMessage, 
  CyberAgentSession, 
  ChatConversationMessage, 
  CyberContact,
  ExpertiseLevel,
  CyberAgentEvaluation,
  EmailMessage
} from "@shared/schema";

// Map pour stocker les sessions actives
const activeSessions = new Map<string, CyberAgentSession>();

// Liste des contacts autorisés (conforme à la section E.2 du document)
const AUTHORIZED_CONTACTS: Record<string, CyberContact> = {
  // Direction générale
  "arnaud.gauthier": {
    name: "Arnaud Gauthier",
    role: "Président"
  },
  "olivier.hervo": {
    name: "Olivier Hervo",
    role: "Directeur Général"
  },
  "isabelle.dubacq": {
    name: "Isabelle Dubacq",
    role: "Senior Partner / DRH"
  },
  // Bancaire / Financier (BFA)
  "lorenzo.bertola": {
    name: "Lorenzo Bertola",
    role: "DGA, Directeur BFA"
  },
  "vincent.terrier": {
    name: "Vincent Terrier",
    role: "Senior Partner, Directeur Financier"
  },
  // Industriel / Santé / Public (IMPULSE)
  "guillaume.lechevallier": {
    name: "Guillaume Lechevallier",
    role: "DGA, Directeur IMPULSE"
  },
  "fares.sayadi": {
    name: "Fares Sayadi",
    role: "Expert Data / IA"
  },
  // Retail & Luxe
  "nicolas.paolantonacci": {
    name: "Nicolas Paolantonacci",
    role: "Senior Partner, Directeur RETAIL & LUXE"
  },
  "marion.lopez": {
    name: "Marion Lopez",
    role: "Senior Partner, Directrice Marketing & RSE"
  },
  // Énergie & Utilities
  "anthony.frescal": {
    name: "Anthony Frescal",
    role: "DGA"
  },
  // Experts techniques
  "neil.levin": {
    name: "Neil Levin",
    role: "Expert cybersécurité & CFO"
  },
  "yousra.saidani": {
    name: "Yousra Saidani",
    role: "Experte cybersécurité & CFO"
  },
  "eddy.missoni": {
    name: "Eddy Missoni Idembi",
    role: "Expert Data / IA & CTO"
  },
  "vincent.pascal": {
    name: "Vincent Pascal",
    role: "DGA, Directeur du Développement Commercial"
  },
  "nosing.doeuk": {
    name: "Nosing Doeuk",
    role: "Senior Partner, Directeur du pôle DIXIT"
  }
};

/**
 * Liste des rôles métiers disponibles pour CYBER AGENT
 */
export async function getAvailableRoles(req: Request, res: Response) {
  try {
    // Liste des rôles métiers selon la section C.0 du document
    const roles = [
      {
        id: 'rssi',
        title: 'Responsable IT',
        description: 'Dirigez et sécurisez l\'infrastructure technologique de l\'entreprise',
        isActive: true
      },
      {
        id: 'ciso',
        title: 'RSSI',
        description: 'Élaborez et mettez en œuvre la stratégie de sécurité de l\'information',
        isActive: true
      },
      {
        id: 'consultant',
        title: 'Consultant',
        description: 'Auditez et conseillez sur les meilleures pratiques de cybersécurité',
        isActive: true
      },
      {
        id: 'juriste',
        title: 'Juriste',
        description: 'Gérez les aspects légaux et réglementaires de la cybersécurité',
        isActive: true
      },
      {
        id: 'communication',
        title: 'Chargé de communication',
        description: 'Élaborez des stratégies de communication en cas d\'incident',
        isActive: true
      },
      {
        id: 'analyste',
        title: 'Analyste SOC',
        description: 'Surveillez et analysez les événements de sécurité en temps réel',
        isActive: true
      }
    ];
    
    // Mélanger et retourner 6 rôles aléatoirement comme indiqué dans la section C.0
    const shuffledRoles = [...roles].sort(() => 0.5 - Math.random());
    
    return res.status(200).json({
      roles: shuffledRoles,
      total: roles.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des rôles' });
  }
}

/**
 * Démarre une nouvelle session CYBER AGENT
 * Initialisation uniquement avec niveau et rôle (section C.0)
 */
export async function startCyberAgentSession(req: Request, res: Response) {
  try {
    const { userName, userRole, expertiseLevel } = req.body;
    
    if (!userName || !userRole || !expertiseLevel) {
      return res.status(400).json({ message: 'Paramètres manquants (nom, rôle et niveau requis)' });
    }
    
    // Validation du niveau d'expertise
    if (!['Débutant', 'Intermédiaire', 'Expert'].includes(expertiseLevel)) {
      return res.status(400).json({ message: 'Niveau d\'expertise invalide' });
    }
    
    const sessionId = uuidv4();
    
    // Créer une nouvelle session
    const session: CyberAgentSession = {
      sessionId,
      userId: uuidv4(), // Dans une implémentation réelle, ce serait l'ID de l'utilisateur connecté
      userName,
      userRole,
      expertiseLevel,
      messages: [],
      currentPhase: 'initial',
      startTime: Date.now()
    };
    
    // Stocker la session
    activeSessions.set(sessionId, session);
    
    // Générer l'email d'accueil d'Isabelle Dubacq (DRH) comme spécifié dans la section C.1
    const initialEmail: EmailMessage = {
      id: uuidv4(),
      from: AUTHORIZED_CONTACTS["isabelle.dubacq"],
      to: userName,
      subject: "Bienvenue dans votre nouvelle mission",
      date: new Date().toISOString(),
      body: `Bonjour ${userName},

Je suis ravie de vous accueillir au sein de notre entreprise. Nous avons besoin de votre expertise en tant que ${userRole}.

Pour pouvoir adapter au mieux votre mission à votre profil, j'aurais besoin que vous me communiquiez :
- Une brève description de votre expérience professionnelle
- Une auto-évaluation de votre niveau en cybersécurité

Ces informations nous permettront de vous proposer des défis adaptés à vos compétences.

Cordialement,
Isabelle Dubacq
Directrice des Ressources Humaines`
    };
    
    // Convertir l'email en message pour l'historique
    const emailMessage: ChatConversationMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: JSON.stringify(initialEmail),
      contact: AUTHORIZED_CONTACTS["isabelle.dubacq"],
      timestamp: new Date()
    };
    
    // Ajouter ce message à l'historique de la session
    session.messages.push(emailMessage);
    session.currentContact = AUTHORIZED_CONTACTS["isabelle.dubacq"];
    session.currentPhase = 'introduction';
    
    return res.status(200).json({
      sessionId,
      email: initialEmail,
      message: "Session démarrée avec succès. Veuillez répondre à l'email d'Isabelle Dubacq."
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la session:', error);
    return res.status(500).json({ message: 'Erreur lors du démarrage de la session' });
  }
}

/**
 * Traite la réponse de l'utilisateur à l'email d'accueil d'Isabelle Dubacq
 * Analyse la présentation (section C.2)
 */
export async function processUserPresentation(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Vérifier que l'utilisateur est dans la bonne phase
    if (session.currentPhase !== 'introduction' || !session.currentContact || session.currentContact.name !== "Isabelle Dubacq") {
      return res.status(400).json({ message: 'Action invalide dans cette phase' });
    }
    
    // Ajouter le message utilisateur à la session
    const userMessage: ChatConversationMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    session.messages.push(userMessage);
    
    // Analyser si la réponse est complète selon les critères spécifiés (section C.2)
    // 1. Recherche des mots-clés pour l'expérience professionnelle
    const experienceKeywords = ['poste', 'entreprise', 'mission', 'travail', 'expérience', 'carrière', 'emploi', 'société'];
    const hasExperience = experienceKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    
    // 2. Recherche des mots-clés pour le niveau en cybersécurité
    const skillKeywords = ['connaissances', 'compétences', 'maîtrise', 'sécurité', 'cybersécurité', 'niveau', 'formation'];
    const hasSkills = skillKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    
    // 3. Vérifier la longueur minimale (50 caractères)
    const isLongEnough = message.length >= 50;
    
    // Vérifier si la réponse est complète
    const isComplete = isLongEnough && (hasExperience || hasSkills);
    
    let responseMessage: ChatConversationMessage;
    
    if (!isComplete) {
      // Réponse incomplète - Isabelle demande plus de détails
      let responseContent = `Bonjour ${session.userName},\n\nMerci pour votre message. `;
      
      if (!isLongEnough) {
        responseContent += "Pourriez-vous me donner un peu plus de détails ? ";
      }
      
      if (!hasExperience && !hasSkills) {
        responseContent += "J'aurais besoin de connaître à la fois votre expérience professionnelle et votre niveau en cybersécurité. ";
      } else if (!hasExperience) {
        responseContent += "Pourriez-vous me préciser votre expérience professionnelle ? ";
      } else if (!hasSkills) {
        responseContent += "Pourriez-vous me préciser votre niveau en cybersécurité ? ";
      }
      
      responseContent += "\n\nCes informations sont importantes pour adapter au mieux votre mission. Merci d'avance.\n\nIsabelle Dubacq\nDirectrice des Ressources Humaines";
      
      responseMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        contact: AUTHORIZED_CONTACTS["isabelle.dubacq"],
        timestamp: new Date()
      };
      
      session.messages.push(responseMessage);
      
      return res.status(200).json({
        response: responseContent,
        contact: AUTHORIZED_CONTACTS["isabelle.dubacq"],
        isComplete: false,
        nextStep: "Veuillez compléter votre présentation"
      });
    } else {
      // Réponse complète - Isabelle remercie et passe au scénario
      session.userPresentation = message;
      
      const thankYouMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Merci ${session.userName} pour ces informations complètes.\n\nJ'ai transmis votre profil à l'expert qui s'occupera de votre scénario. Il vous contactera très prochainement.\n\nCordialement,\nIsabelle Dubacq\nDirectrice des Ressources Humaines`,
        contact: AUTHORIZED_CONTACTS["isabelle.dubacq"],
        timestamp: new Date()
      };
      
      session.messages.push(thankYouMessage);
      session.currentPhase = 'scenario';
      
      // Sélectionner un expert en fonction du rôle et du niveau d'expertise
      // Pour la démonstration, nous utilisons Neil Levin (expert cyber)
      const expertContact = AUTHORIZED_CONTACTS["neil.levin"];
      session.currentContact = expertContact;
      
      // Générer l'introduction de l'expert (section C.3)
      // Utiliser l'IA pour générer une intro personnalisée
      let expertPrompt = `Tu es Neil Levin, un expert en cybersécurité. Tu t'adresses à ${session.userName}, qui a le profil suivant:
      
Rôle: ${session.userRole}
Niveau: ${session.expertiseLevel}
Présentation: ${session.userPresentation}

Rédige un message de bienvenue qui:
1. Te présente comme expert en cybersécurité (3-4 lignes maximum)
2. Expose une situation problématique de cybersécurité adaptée au niveau du participant (débutant, intermédiaire ou expert)
3. Structure ta mission en 2-3 paragraphes courts et clairs
4. Inclut 2-3 points clés formatés en liste à puces
5. Précise ce que tu attends comme réponse (analyse + recommandations + plan d'action)

Ton style doit être professionnel mais accessible, en utilisant le tutoiement.
Adapte ton vocabulaire au niveau de l'utilisateur et reste cohérent avec son rôle.
Limite ta réponse à 250 mots maximum.`;

      try {
        const expertResponse = await openAIService.getChatCompletionSecondary({
          messages: [{ role: 'system', content: expertPrompt }],
          temperature: 0.7,
          max_tokens: 500
        });
        
        const expertIntroContent = expertResponse.choices[0].message.content;
        
        const expertIntroMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: expertIntroContent,
          contact: expertContact,
          timestamp: new Date()
        };
        
        session.messages.push(expertIntroMessage);
        
        return res.status(200).json({
          response: thankYouMessage.content,
          contact: AUTHORIZED_CONTACTS["isabelle.dubacq"],
          isComplete: true,
          nextStep: "expert-introduction",
          expertMessage: {
            content: expertIntroContent,
            contact: expertContact
          }
        });
      } catch (error) {
        console.error("Erreur OpenAI lors de la génération de l'introduction de l'expert:", error);
        return res.status(500).json({ message: "Erreur lors de la génération de l'introduction de l'expert" });
      }
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la présentation:', error);
    return res.status(500).json({ message: 'Erreur lors du traitement de la présentation' });
  }
}

/**
 * Traite les messages utilisateur lors de l'interaction avec un expert
 * Correspond aux phases 'scenario' et 'interaction' (sections C.3 et C.4)
 */
export async function processExpertInteraction(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    
    // Vérifier que nous sommes dans la phase d'interaction avec l'expert
    if (session.currentPhase !== 'scenario' && session.currentPhase !== 'interaction') {
      return res.status(400).json({ message: 'Action invalide dans cette phase' });
    }
    
    // Si nous étions en phase de scénario, passer en interaction
    if (session.currentPhase === 'scenario') {
      session.currentPhase = 'interaction';
    }
    
    // Ajouter le message utilisateur
    const userMessage: ChatConversationMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    session.messages.push(userMessage);
    session.lastInteractionTime = Date.now();
    
    // Déterminer si nous devons passer à une pause pédagogique
    // Compter combien de fois l'utilisateur et l'expert ont échangé
    const userMessages = session.messages.filter(msg => msg.role === 'user').length;
    const expertMessages = session.messages.filter(msg => 
      msg.role === 'assistant' && msg.contact && 
      msg.contact.name !== "Isabelle Dubacq" && 
      msg.contact.name !== "I AM CYBER"
    ).length;
    
    // Après 3 échanges (selon section C.5), I AM CYBER intervient pour une pause pédagogique
    const shouldTriggerBreak = userMessages >= 3 && expertMessages >= 3;
    
    if (shouldTriggerBreak) {
      // Préparer un prompt pour la pause pédagogique
      const lastMessages = session.messages.slice(-6); // Prendre les 6 derniers messages
      const conversationSummary = lastMessages
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : msg.contact?.name || 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      const breakPrompt = `Tu es I AM CYBER, l'assistant pédagogique qui intervient entre les phases d'un scénario de cybersécurité.
      
Voici un résumé de la conversation récente entre l'utilisateur (${session.userName}) et l'expert:

${conversationSummary}

En tant qu'I AM CYBER, tu dois maintenant:
1. Vulgariser les notions complexes abordées dans cette conversation
2. Fournir des définitions clés et des analogies pour les concepts difficiles
3. Expliquer les implications des choix faits par l'utilisateur
4. Préparer l'utilisateur pour la suite du scénario

Ton style doit être didactique, clair et accessible, adapté au niveau ${session.expertiseLevel} de l'utilisateur.
Limite ta réponse à 200 mots maximum.`;

      try {
        const breakResponse = await openAIService.getChatCompletionSecondary({
          messages: [{ role: 'system', content: breakPrompt }],
          temperature: 0.7,
          max_tokens: 400
        });
        
        const breakContent = breakResponse.choices[0].message.content;
        
        // Créer un contact fictif pour I AM CYBER
        const iamCyberContact: CyberContact = {
          name: "I AM CYBER",
          role: "Assistant Pédagogique",
          description: "Assistant virtuel spécialisé en cybersécurité"
        };
        
        const breakMessage: ChatConversationMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: breakContent,
          contact: iamCyberContact,
          timestamp: new Date()
        };
        
        // Ajouter la pause à l'historique
        session.messages.push(breakMessage);
        
        // Changer temporairement à la phase 'pause'
        const previousPhase = session.currentPhase;
        session.currentPhase = 'pause';
        
        return res.status(200).json({
          isPause: true,
          pauseMessage: {
            content: breakContent,
            contact: iamCyberContact
          },
          nextStep: "Continuer après la pause pédagogique"
        });
      } catch (error) {
        console.error("Erreur lors de la génération de la pause pédagogique:", error);
        // En cas d'erreur, continuer normalement avec la réponse de l'expert
      }
    }
    
    // Générer une réponse de l'expert en fonction du message de l'utilisateur
    const expertContact = session.currentContact;
    if (!expertContact) {
      return res.status(500).json({ message: 'Erreur: pas d\'expert assigné à cette session' });
    }
    
    // Construire le contexte pour l'IA
    // Récupérer les 10 derniers messages ou moins pour le contexte
    const recentMessages = session.messages
      .filter(msg => msg.role !== 'system')
      .slice(-10)
      .map(msg => ({
        role: msg.role,
        content: msg.role === 'assistant' 
          ? `[${msg.contact?.name || 'Assistant'}] ${msg.content}`
          : msg.content
      }));
      
    const expertPrompt = `Tu es ${expertContact.name}, ${expertContact.role}. Tu interagis avec ${session.userName}, un ${session.userRole} de niveau ${session.expertiseLevel}.

Dans cette phase de la conversation, tu dois:
1. Répondre à ses questions ou réagir à ses propositions
2. Donner un retour constructif sur ses idées (points forts + axes d'amélioration)
3. Challenger sa réflexion avec de nouvelles questions ou contraintes
4. Rester cohérent avec ton rôle d'expert et adapter le niveau technique à son expertise

Tes réponses doivent être:
- Personnalisées en fonction de son message
- Riches en contexte et exemples concrets
- Structurées et claires
- Professionnelles mais accessibles (utiliser le tutoiement)

Limite ta réponse à 250 mots maximum.`;

    try {
      const expertResponse = await openAIService.getChatCompletionSecondary({
        messages: [
          { role: 'system', content: expertPrompt },
          ...recentMessages
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const expertContent = expertResponse.choices[0].message.content;
      
      const expertMessage: ChatConversationMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: expertContent,
        contact: expertContact,
        timestamp: new Date()
      };
      
      // Ajouter la réponse de l'expert à l'historique
      session.messages.push(expertMessage);
      
      return res.status(200).json({
        response: expertContent,
        contact: expertContact,
        isPause: false
      });
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse de l'expert:", error);
      return res.status(500).json({ message: "Erreur lors de la génération de la réponse" });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'interaction:', error);
    return res.status(500).json({ message: 'Erreur lors du traitement de l\'interaction' });
  }
}
    
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