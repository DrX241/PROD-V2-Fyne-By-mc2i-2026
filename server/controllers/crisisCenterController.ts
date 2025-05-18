import { Request, Response } from 'express';
import { openAIService } from '../services/openai';
import { 
  CrisisScenario, 
  CrisisPhase, 
  Alert, 
  Message, 
  Decision, 
  DecisionOption 
} from '../../shared/types/cyber';
import { ChatCompletionRequestMessage } from "../services/openAiTypes";
import { extractJsonFromOpenAiResponse, createFallbackJson } from "../openAiResponseHelper";

// Récupérer tous les scénarios de crise disponibles
export const getScenarios = async (req: Request, res: Response) => {
  try {
    // Dans une version future, les scénarios pourraient être stockés dans une base de données
    // Pour le moment, nous les définissons en dur ici
    const scenarios: CrisisScenario[] = [
      {
        id: 'ransomware-critical',
        title: 'Attaque Ransomware Critique',
        description: 'Une attaque ransomware sophistiquée a infecté les systèmes critiques de l\'entreprise, chiffrant des données sensibles et menaçant les opérations.',
        duration: '90-120 min',
        complexity: 'Avancé',
        phases: 4,
        participants: 8,
        category: 'Incident Response',
        tags: ['Ransomware', 'Exfiltration', 'Gestion de crise', 'Communication'],
        objectives: [
          'Contenir la propagation du ransomware',
          'Évaluer l\'impact sur les données et systèmes',
          'Communiquer avec les parties prenantes',
          'Élaborer une stratégie de récupération'
        ],
        stats: {
          completions: 124,
          avgScore: 76,
          bestTime: '62 min'
        },
        available: true,
        featured: false,
        new: false
      },
      {
        id: 'data-breach',
        title: 'Violation de Données Massive',
        description: 'Une brèche de sécurité a entraîné la fuite de millions de données personnelles clients. Vous devez gérer les conséquences techniques, légales et réputationnelles.',
        duration: '60-90 min',
        complexity: 'Intermédiaire',
        phases: 3,
        participants: 6,
        category: 'Data Protection',
        tags: ['RGPD', 'Forensique', 'Notification', 'Remédiation'],
        objectives: [
          'Identifier l\'étendue de la violation',
          'Respecter les obligations légales de notification',
          'Gérer la communication de crise',
          'Mettre en place des mesures correctives'
        ],
        stats: {
          completions: 87,
          avgScore: 82,
          bestTime: '54 min'
        },
        available: true,
        featured: false,
        new: true
      },
      {
        id: 'supply-chain-attack',
        title: 'Attaque de la Chaîne d\'Approvisionnement',
        description: 'Un fournisseur critique a été compromis, permettant à des attaquants d\'accéder à votre réseau par une mise à jour logicielle légitime mais infectée.',
        duration: '120-150 min',
        complexity: 'Expert',
        phases: 5,
        participants: 10,
        category: 'Threat Hunting',
        tags: ['APT', 'Compromission', 'Détection', 'Fournisseurs'],
        objectives: [
          'Détecter les indicateurs de compromission',
          'Isoler les systèmes affectés',
          'Conduire une analyse d\'impact',
          'Coordonner avec les fournisseurs externes'
        ],
        available: true,
        featured: false,
        new: false
      }
    ];
    
    res.status(200).json({ scenarios });
  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des scénarios' });
  }
};

// Récupérer les détails d'un scénario de crise spécifique
export const getScenarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Dans une version future, récupérer depuis une base de données
    // Pour le moment, nous simulons la récupération
    
    // Exemple de scénario Ransomware détaillé avec ses phases
    if (id === 'ransomware-critical') {
      const phases: CrisisPhase[] = [
        {
          id: 'phase-1',
          name: 'Détection et confinement initial',
          description: 'Détecter l\'étendue de l\'infection et prendre les premières mesures de confinement',
          alerts: [
            {
              id: 'alert-1',
              title: 'Multiples serveurs inaccessibles',
              severity: 'critical',
              timestamp: new Date().toISOString(),
              source: 'Monitoring système',
              description: 'Plusieurs serveurs de production ne répondent plus. Les journaux montrent de nombreuses tentatives d\'accès avant la perte de connexion.',
              status: 'new'
            },
            {
              id: 'alert-2',
              title: 'Ransomware détecté',
              severity: 'critical',
              timestamp: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
              source: 'EDR',
              description: 'L\'EDR a identifié des signatures connues du ransomware BlackCat/ALPHV sur plusieurs postes. Plusieurs fichiers ont été chiffrés.',
              status: 'new'
            }
          ],
          messages: [
            {
              id: 'msg-1',
              sender: 'Daniel Martin',
              senderId: 'team-1',
              content: 'Nos systèmes de détection ont identifié une activité suspecte massive. Plusieurs serveurs de production ne répondent plus et nous avons des rapports d\'utilisateurs voyant des messages de rançon. J\'ai besoin de vos directives immédiates.',
              timestamp: new Date().toISOString(),
              read: false,
              urgent: true
            },
            {
              id: 'msg-2',
              sender: 'Julie Leblanc',
              senderId: 'team-2',
              content: 'L\'équipe d\'assistance reçoit de nombreux appels d\'utilisateurs. Leurs fichiers sont inaccessibles et un message exige une rançon de 2 millions d\'euros en cryptomonnaie. Que devons-nous leur dire ?',
              timestamp: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
              read: false,
              urgent: true
            }
          ],
          decisions: [
            {
              id: 'decision-1',
              text: 'Comment réagir immédiatement à cette crise ?',
              options: [
                {
                  id: 'option-1-1',
                  text: 'Isoler immédiatement le réseau de l\'entreprise d\'Internet',
                  impact: {
                    security: 80,
                    time: -20,
                    reputation: -10,
                    cost: -20
                  },
                  consequences: [
                    'L\'isolation limite la propagation du ransomware',
                    'Les communications externes sont coupées',
                    'Les services cloud deviennent inaccessibles'
                  ]
                },
                {
                  id: 'option-1-2',
                  text: 'Analyser d\'abord l\'étendue de l\'infection avant d\'agir',
                  impact: {
                    security: -30,
                    time: 20,
                    reputation: 0,
                    cost: 10
                  },
                  consequences: [
                    'L\'infection continue de se propager pendant l\'analyse',
                    'Vous obtenez une meilleure visibilité sur l\'étendue des dégâts',
                    'Les opérations continuent partiellement'
                  ]
                },
                {
                  id: 'option-1-3',
                  text: 'Arrêter tous les systèmes immédiatement',
                  impact: {
                    security: 50,
                    time: -50,
                    reputation: -40,
                    cost: -60
                  },
                  consequences: [
                    'L\'arrêt complet stoppe la propagation mais paralyse l\'entreprise',
                    'Impact financier immédiat très important',
                    'Perturbation majeure des opérations client'
                  ]
                }
              ]
            }
          ],
          timeTriggers: [
            {
              time: 120, // 2 minutes
              action: 'alert',
              target: 'alert-2'
            },
            {
              time: 180, // 3 minutes
              action: 'message',
              target: 'msg-2'
            }
          ]
        },
        {
          id: 'phase-2',
          name: 'Investigation et identification',
          description: 'Enquêter sur l\'origine de l\'attaque et identifier l\'étendue des dommages',
          alerts: [
            {
              id: 'alert-3',
              title: 'Exfiltration de données détectée',
              severity: 'high',
              timestamp: new Date().toISOString(),
              source: 'Sonde réseau',
              description: 'Transferts massifs de données vers des adresses IP inconnues détectés durant les 72 dernières heures.',
              status: 'new'
            }
          ],
          messages: [
            {
              id: 'msg-3',
              sender: 'Thomas Girard',
              senderId: 'team-3',
              content: 'Mon équipe a identifié l\'origine de l\'infection : un email de phishing ciblant la direction financière il y a 5 jours. Les attaquants ont eu plusieurs jours d\'accès avant d\'activer le ransomware. Nous avons trouvé des preuves d\'exfiltration de données sensibles.',
              timestamp: new Date().toISOString(),
              read: false,
              urgent: true
            }
          ],
          decisions: [],
          timeTriggers: []
        }
      ];
      
      const scenario: CrisisScenario & { detailedPhases: CrisisPhase[] } = {
        id: 'ransomware-critical',
        title: 'Attaque Ransomware Critique',
        description: 'Une attaque ransomware sophistiquée a infecté les systèmes critiques de l\'entreprise, chiffrant des données sensibles et menaçant les opérations.',
        duration: '90-120 min',
        complexity: 'Avancé',
        phases: phases.length,
        participants: 8,
        category: 'Incident Response',
        tags: ['Ransomware', 'Exfiltration', 'Gestion de crise', 'Communication'],
        objectives: [
          'Contenir la propagation du ransomware',
          'Évaluer l\'impact sur les données et systèmes',
          'Communiquer avec les parties prenantes',
          'Élaborer une stratégie de récupération'
        ],
        stats: {
          completions: 124,
          avgScore: 76,
          bestTime: '62 min'
        },
        available: true,
        featured: false,
        new: false,
        detailedPhases: phases,
        threat: 'Groupe de cybercriminels sophistiqué utilisant un ransomware de type double extorsion',
        initialMessage: 'ALERTE CRITIQUE: Les serveurs de production sont inaccessibles. Plusieurs utilisateurs signalent des messages de rançon sur leurs écrans.',
        timeLimit: 120 // 2 heures en minutes
      };
      
      res.status(200).json({ scenario });
      return;
    }
    
    res.status(404).json({ message: 'Scénario non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la récupération du scénario:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du scénario' });
  }
};

// Obtenir l'évaluation d'une décision prise dans un scénario
export const evaluateDecision = async (req: Request, res: Response) => {
  try {
    const { scenarioId, phaseId, decisionId, optionId } = req.body;
    
    if (!scenarioId || !phaseId || !decisionId || !optionId) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    // Dans une version future, récupérer les données depuis une base de données
    // Pour le moment, nous simulons l'évaluation avec l'IA
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu es un expert en cybersécurité spécialisé dans la gestion de crise. 
      Tu vas évaluer une décision prise par un utilisateur dans un scénario de simulation de crise.
      Fournis une analyse détaillée de la décision, explique ses impacts potentiels et donne des recommandations.
      Sois précis et factuel dans ton évaluation. Format de la réponse : JSON avec les propriétés suivantes:
      1. "analysis": une analyse détaillée de la décision (200-300 mots)
      2. "impacts": un tableau d'objets contenant les impacts sur: {"domain": "sécurité"|"temps"|"réputation"|"coût", "impact": -100 à +100, "description": "explication courte"}
      3. "recommendations": tableau de 2-3 recommandations pour la suite
      4. "score": note globale de 0 à 100 pour cette décision`
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: `Évalue la décision suivante dans le scénario "Attaque Ransomware Critique":
      Phase: "Détection et confinement initial"
      Question: "Comment réagir immédiatement à cette crise ?"
      Option choisie: "Isoler immédiatement le réseau de l'entreprise d'Internet"
      
      Contexte: Une attaque ransomware est en cours, plusieurs serveurs sont inaccessibles et des messages de rançon apparaissent sur les écrans des utilisateurs.`
    };
    
    try {
      // Utiliser la méthode getChatCompletion avec le modèle secondaire
      const responseText = await openAIService.getChatCompletion(
        [systemMessage, userMessage],
        true, // useSecondaryKey: true pour utiliser le modèle secondaire (gpt-4o-mini)
        0.7,  // temperature
        2048  // maxTokens
      );
      
      let evaluationResult;
      try {
        evaluationResult = extractJsonFromOpenAiResponse(responseText);
      } catch (error) {
        evaluationResult = createFallbackJson({
          analysis: "Cette décision d'isoler immédiatement le réseau de l'entreprise d'Internet est généralement une bonne pratique lors d'une attaque ransomware active. Elle permet de limiter la propagation du malware et empêche la communication avec les serveurs de commande et contrôle des attaquants. Cependant, cette action isole également l'entreprise des ressources cloud, des partenaires et des clients, ce qui peut compliquer la communication de crise et la coordination avec les parties prenantes externes comme les experts en sécurité ou les autorités.",
          impacts: [
            {
              domain: "sécurité",
              impact: 75,
              description: "Limite efficacement la propagation du ransomware et bloque les communications malveillantes"
            },
            {
              domain: "temps",
              impact: -20,
              description: "Retarde la résolution complète en raison des difficultés d'accès aux ressources externes"
            },
            {
              domain: "réputation",
              impact: -15,
              description: "Impact négatif à court terme en raison de l'indisponibilité des services clients"
            },
            {
              domain: "coût",
              impact: -30,
              description: "Perte financière due à l'interruption des opérations en ligne"
            }
          ],
          recommendations: [
            "Établir des canaux de communication alternatifs pour coordonner avec les parties prenantes externes",
            "Mettre en place un accès Internet isolé et sécurisé pour les communications essentielles",
            "Préparer un plan de reconnexion progressive après l'analyse de l'étendue de l'infection"
          ],
          score: 78
        });
      }
      
      res.status(200).json({ evaluation: evaluationResult });
    } catch (error) {
      console.error("Erreur lors de l'appel OpenAI:", error);
      res.status(500).json({ message: "Erreur lors de l'évaluation" });
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la décision:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'évaluation de la décision' });
  }
};

// Simuler une réponse à un message envoyé à un membre de l'équipe de crise
export const simulateTeamMemberResponse = async (req: Request, res: Response) => {
  try {
    const { scenarioId, phaseId, memberId, message } = req.body;
    
    if (!scenarioId || !phaseId || !memberId || !message) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    // Obtenir les informations sur le membre d'équipe (serait récupéré d'une DB dans une version future)
    const teamMember = getTeamMemberById(memberId);
    
    if (!teamMember) {
      return res.status(404).json({ message: 'Membre d\'équipe non trouvé' });
    }
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: `Tu joues le rôle de ${teamMember.name}, ${teamMember.role} dans une simulation de crise cybersécurité.
      Ton expertise: ${teamMember.expertise.join(', ')}.
      Ton département: ${teamMember.department}.
      
      Réponds comme si tu étais ce personnage, avec son niveau d'expertise et ses connaissances spécifiques.
      Ta réponse doit être réaliste, professionnelle mais montrer de l'empathie face à la situation de crise.
      N'utilise pas plus de 2-3 phrases et reste factuel. Ne mens pas si tu n'as pas l'information.`
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: `Dans le contexte du scénario "${scenarioId}", phase "${phaseId}", je t'envoie ce message:
      
      "${message}"
      
      Réponds de manière concise et professionnelle, comme le ferait ${teamMember.name} dans cette situation de crise.`
    };
    
    try {
      // Utiliser la méthode getChatCompletion avec le modèle secondaire
      const responseText = await openAIService.getChatCompletion(
        [systemMessage, userMessage],
        true, // useSecondaryKey: true pour utiliser le modèle secondaire (gpt-4o-mini)
        0.7,  // temperature
        2000  // maxTokens
      );
      
      // Simuler un délai de réponse basé sur la disponibilité et le temps de réponse du membre
      const responseDelay = teamMember.availability === 'busy' ? 
        teamMember.responseTime * 1.5 : 
        teamMember.responseTime;
      
      // Créer une réponse simulée
      const simulatedResponse = {
        id: `${memberId}-${Date.now()}`,
        sender: teamMember.name,
        senderId: memberId,
        content: responseText,
        timestamp: new Date().toISOString(),
        read: false,
        urgent: false
      };
      
      // Mettre à jour l'état du membre (serait stocké dans une DB dans une version future)
      const updatedMember = {
        ...teamMember,
        availability: 'busy',
        lastContact: new Date().toLocaleTimeString(),
        stress: Math.min(100, teamMember.stress + 5)
      };
      
      res.status(200).json({ 
        response: simulatedResponse,
        responseDelay,
        updatedMember
      });
    } catch (error) {
      console.error("Erreur lors de l'appel OpenAI:", error);
      
      // Réponse de secours en cas d'erreur
      const fallbackResponse = {
        id: `${memberId}-${Date.now()}`,
        sender: teamMember.name,
        senderId: memberId,
        content: `Je vais analyser votre message concernant "${message.substring(0, 30)}..." et revenir vers vous au plus vite. Notre équipe est mobilisée pour répondre à cette situation.`,
        timestamp: new Date().toISOString(),
        read: false,
        urgent: false
      };
      
      res.status(200).json({
        response: fallbackResponse,
        responseDelay: teamMember.responseTime,
        updatedMember: teamMember
      });
    }
  } catch (error) {
    console.error('Erreur lors de la simulation de réponse:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la simulation de réponse' });
  }
};

// Générer un nouveau message ou alerte basé sur les actions de l'utilisateur
export const generateCrisisEvent = async (req: Request, res: Response) => {
  try {
    const { scenarioId, phaseId, currentState, elapsedTime } = req.body;
    
    if (!scenarioId || !phaseId || !currentState) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    // Décider si on génère un nouvel événement basé sur le temps écoulé et les actions précédentes
    const shouldGenerateEvent = Math.random() > 0.7; // 30% de chance
    
    if (!shouldGenerateEvent) {
      return res.status(200).json({ event: null });
    }
    
    // Déterminer le type d'événement (message, alerte, ou décision)
    const eventTypes = ['message', 'alert'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    if (eventType === 'message') {
      // Sélectionner un membre d'équipe aléatoire
      const teamMembers = getTeamMembers();
      const availableMembers = teamMembers.filter(m => m.availability !== 'unavailable');
      const randomMember = availableMembers[Math.floor(Math.random() * availableMembers.length)];
      
      const systemMessage: ChatCompletionRequestMessage = {
        role: 'system',
        content: `Tu joues le rôle de ${randomMember.name}, ${randomMember.role} dans une simulation de crise cybersécurité.
        Ton expertise: ${randomMember.expertise.join(', ')}.
        Génère un message urgent et réaliste que ce personnage enverrait dans une situation de crise ransomware.
        Le message doit être court (max 2-3 phrases) et pertinent pour la phase actuelle.`
      };
      
      const userMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: `Génère un message pour la phase "${phaseId}" du scénario "Attaque Ransomware".
        Le temps écoulé est de ${elapsedTime} secondes depuis le début de la crise.
        Le message doit être urgent et demander une décision ou une action.`
      };
      
      try {
        // Utiliser la méthode getChatCompletion avec le modèle secondaire
        const messageContent = await openAIService.getChatCompletion(
          [systemMessage, userMessage],
          true, // useSecondaryKey: true
          0.7,  // temperature
          2048  // maxTokens
        );
        
        const event = {
          type: 'message',
          data: {
            id: `msg-${Date.now()}`,
            sender: randomMember.name,
            senderId: randomMember.id,
            content: messageContent,
            timestamp: new Date().toISOString(),
            read: false,
            urgent: true
          }
        };
        
        res.status(200).json({ event });
      } catch (error) {
        console.error("Erreur lors de l'appel OpenAI pour générer un message:", error);
        res.status(500).json({ message: "Erreur lors de la génération d'événement" });
      }
    } else if (eventType === 'alert') {
      const alertSeverities = ['high', 'medium', 'critical'];
      const severity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
      
      const alertSources = ['Monitoring système', 'EDR', 'SIEM', 'Sonde réseau', 'Firewall', 'IDS/IPS'];
      const source = alertSources[Math.floor(Math.random() * alertSources.length)];
      
      const systemMessage: ChatCompletionRequestMessage = {
        role: 'system',
        content: `Tu es un système de détection de cybersécurité générant une alerte pour une simulation de crise ransomware.
        Génère une alerte réaliste avec un titre court et une description technique mais compréhensible.
        L'alerte doit être de sévérité "${severity}" et provenir de "${source}".
        Format de réponse attendu: JSON avec les champs "title" et "description".`
      };
      
      const userMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: `Génère une alerte pour la phase "${phaseId}" du scénario "Attaque Ransomware".
        Le temps écoulé est de ${elapsedTime} secondes depuis le début de la crise.
        Réponds uniquement avec un objet JSON contenant:
        { 
          "title": "Titre court et technique",
          "description": "Description détaillée de l'alerte"
        }`
      };
      
      try {
        // Utiliser la méthode getChatCompletion avec le modèle secondaire
        const responseText = await openAIService.getChatCompletion(
          [systemMessage, userMessage],
          true, // useSecondaryKey: true
          0.7,  // temperature
          2048, // maxTokens
          { responseFormat: 'json_object' } // Demander une réponse en format JSON
        );
        
        // Extraire le JSON de la réponse
        let alertContent;
        try {
          alertContent = extractJsonFromOpenAiResponse(responseText);
        } catch (error) {
          alertContent = {
            title: "Activité de chiffrement détectée",
            description: "Multiples opérations de chiffrement détectées sur les serveurs de fichiers. Schéma correspondant aux signatures connues du ransomware BlackCat/ALPHV."
          };
        }
        
        const event = {
          type: 'alert',
          data: {
            id: `alert-${Date.now()}`,
            title: alertContent.title,
            severity,
            timestamp: new Date().toISOString(),
            source,
            description: alertContent.description,
            status: 'new'
          }
        };
        
        res.status(200).json({ event });
      } catch (error) {
        console.error("Erreur lors de l'appel OpenAI pour générer une alerte:", error);
        res.status(500).json({ message: "Erreur lors de la génération d'événement" });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la génération d\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la génération d\'événement' });
  }
};

// Fonctions utilitaires (à remplacer par des accès base de données dans une version future)

function getTeamMemberById(memberId: string) {
  const teamMembers = getTeamMembers();
  return teamMembers.find(member => member.id === memberId);
}

function getTeamMembers() {
  return [
    {
      id: 'team-1',
      name: 'Daniel Martin',
      role: 'Responsable SOC',
      department: 'Sécurité',
      avatar: '',
      avatarFallback: 'DM',
      expertise: ['Détection', 'Analyse malware', 'SIEM', 'Forensics'],
      availability: 'available',
      confidence: 85,
      stress: 50,
      responseTime: 5
    },
    {
      id: 'team-2',
      name: 'Julie Leblanc',
      role: 'Responsable Support',
      department: 'IT',
      avatar: '',
      avatarFallback: 'JL',
      expertise: ['Support utilisateur', 'Communication', 'Gestion incidents'],
      availability: 'busy',
      confidence: 70,
      stress: 75,
      responseTime: 15,
      lastContact: '10:45'
    },
    {
      id: 'team-3',
      name: 'Thomas Girard',
      role: 'Analyste Sécurité Sr.',
      department: 'Sécurité',
      avatar: '',
      avatarFallback: 'TG',
      expertise: ['Analyse forensique', 'Malware', 'Threat hunting'],
      availability: 'available',
      confidence: 90,
      stress: 40,
      responseTime: 10
    },
    {
      id: 'team-4',
      name: 'Vincent Rossi',
      role: 'Ingénieur Système',
      department: 'IT',
      avatar: '',
      avatarFallback: 'VR',
      expertise: ['Infrastructure', 'Backups', 'Virtualisation'],
      availability: 'available',
      confidence: 80,
      stress: 60,
      responseTime: 8
    },
    {
      id: 'team-5',
      name: 'Marie Dupont',
      role: 'Directrice Communication',
      department: 'Communication',
      avatar: '',
      avatarFallback: 'MD',
      expertise: ['Relations presse', 'Comm. de crise', 'Médias'],
      availability: 'busy',
      confidence: 75,
      stress: 80,
      responseTime: 20,
      lastContact: '10:30'
    },
    {
      id: 'team-6',
      name: 'Alexandre Fournier',
      role: 'Juriste',
      department: 'Juridique',
      avatar: '',
      avatarFallback: 'AF',
      expertise: ['RGPD', 'Notification incidents', 'Conformité'],
      availability: 'unavailable',
      confidence: 65,
      stress: 70,
      responseTime: 30,
      lastContact: '09:15'
    }
  ];
}