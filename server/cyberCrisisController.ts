import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Interfaces pour le Centre de Crise
interface Incident {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'resolved';
  location: string;
  startTime: string;
  threatType: string;
  affectedSystems: string[];
  threatLevel: number;
  coordinates: [number, number]; // longitude, latitude
  timeline: TimelineEvent[];
  metrics: IncidentMetrics;
}

interface IncidentMetrics {
  reputation: number;
  financial: number;
  operational: number;
  security: number;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actionTaken?: string;
  impact?: string;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarInitials: string;
  avatarColor: string;
  expertise: number;
  availableForUrgency: ('low' | 'medium' | 'high' | 'critical')[];
  description: string;
}

// Données d'exemple pour les incidents
const sampleIncidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Attaque par phishing ciblé',
    description: 'Campagne de phishing sophistiquée visant des cadres supérieurs avec accès aux systèmes critiques. Plusieurs emails contenant des documents malveillants ont été identifiés.',
    urgency: 'high',
    status: 'active',
    location: 'Siège social Paris',
    startTime: '2025-05-10T08:43:21',
    threatType: 'Spear Phishing',
    affectedSystems: ['Email', 'Endpoint'],
    threatLevel: 75,
    coordinates: [2.352222, 48.856613], // Paris
    timeline: [
      {
        id: 'evt-001-1',
        timestamp: '2025-05-10T08:43:21',
        title: 'Détection initiale',
        description: 'Alerte du système EDR sur un comportement suspect après ouverture d\'un document Office.'
      },
      {
        id: 'evt-001-2',
        timestamp: '2025-05-10T08:55:12',
        title: 'Validation de l\'alerte',
        description: 'L\'équipe SOC confirme la présence d\'un script PowerShell malveillant tentant d\'établir une connexion C2.',
        actionTaken: 'Blocage immédiat de la connexion sortante.'
      },
      {
        id: 'evt-001-3',
        timestamp: '2025-05-10T09:12:45',
        title: 'Identification des cibles',
        description: '5 autres emails similaires identifiés dans les boîtes de réception de l\'équipe de direction.',
        impact: 'Risque élevé de compromission d\'identifiants VPN et d\'accès aux données financières.'
      }
    ],
    metrics: {
      reputation: 45,
      financial: 30,
      operational: 25,
      security: 60
    }
  },
  {
    id: 'inc-002',
    title: 'Tentative d\'exfiltration de données',
    description: 'Trafic réseau suspect détecté vers un serveur externe non reconnu. Volume important de données en transit depuis le serveur de R&D.',
    urgency: 'critical',
    status: 'active',
    location: 'Centre R&D Lyon',
    startTime: '2025-05-10T10:17:05',
    threatType: 'Data Breach',
    affectedSystems: ['Serveurs R&D', 'Base de données'],
    threatLevel: 90,
    coordinates: [4.835659, 45.764043], // Lyon
    timeline: [
      {
        id: 'evt-002-1',
        timestamp: '2025-05-10T10:17:05',
        title: 'Détection d\'anomalie réseau',
        description: 'Le SIEM a signalé un volume anormal de données sortantes vers une adresse IP non catégorisée.'
      },
      {
        id: 'evt-002-2',
        timestamp: '2025-05-10T10:23:18',
        title: 'Analyse préliminaire',
        description: 'Confirmation d\'un transfert non autorisé de fichiers propriétaires depuis le serveur principal de R&D.',
        actionTaken: 'Blocage d\'urgence de l\'adresse IP de destination.'
      }
    ],
    metrics: {
      reputation: 80,
      financial: 85,
      operational: 50,
      security: 85
    }
  },
  {
    id: 'inc-003',
    title: 'Vulnérabilité critique détectée',
    description: 'Une nouvelle vulnérabilité zero-day a été découverte affectant notre infrastructure cloud. Des exploits sont activement utilisés dans la nature.',
    urgency: 'medium',
    status: 'active',
    location: 'Infrastructure Cloud',
    startTime: '2025-05-10T07:30:00',
    threatType: 'Zero-Day Vulnerability',
    affectedSystems: ['Kubernetes', 'API Gateway'],
    threatLevel: 65,
    coordinates: [-0.1278, 51.5074], // Londres (localisation du cloud provider)
    timeline: [
      {
        id: 'evt-003-1',
        timestamp: '2025-05-10T07:30:00',
        title: 'Alerte de sécurité du fournisseur',
        description: 'Notification de vulnérabilité critique (CVE-2025-12345) dans le service managé que nous utilisons.'
      }
    ],
    metrics: {
      reputation: 35,
      financial: 20,
      operational: 55,
      security: 70
    }
  },
  {
    id: 'inc-004',
    title: 'Activité suspecte sur compte privilégié',
    description: 'Connexion anormale détectée sur un compte administrateur depuis une localisation inhabituelle pendant les heures non ouvrées.',
    urgency: 'low',
    status: 'contained',
    location: 'Strasbourg',
    startTime: '2025-05-10T02:14:37',
    threatType: 'Credential Theft',
    affectedSystems: ['Active Directory', 'VPN'],
    threatLevel: 40,
    coordinates: [7.7521, 48.5734], // Strasbourg
    timeline: [
      {
        id: 'evt-004-1',
        timestamp: '2025-05-10T02:14:37',
        title: 'Alerte d\'authentification',
        description: 'Connexion à un compte admin depuis une adresse IP non reconnue à 2h14 du matin.'
      },
      {
        id: 'evt-004-2',
        timestamp: '2025-05-10T02:17:52',
        title: 'Actions post-authentification',
        description: 'Tentative de modification des règles du pare-feu sur plusieurs segments réseau.',
        actionTaken: 'Déconnexion forcée de la session et verrouillage temporaire du compte.'
      }
    ],
    metrics: {
      reputation: 15,
      financial: 5,
      operational: 20,
      security: 35
    }
  }
];

// Données d'exemple pour les experts
const sampleExperts: Expert[] = [
  {
    id: 'exp-001',
    name: 'Émilie Dupont',
    role: 'RSSI',
    specialty: 'Stratégie de défense',
    avatarInitials: 'ED',
    avatarColor: 'bg-red-700',
    expertise: 95,
    availableForUrgency: ['low', 'medium', 'high', 'critical'],
    description: 'Responsable de la sécurité des systèmes d\'information avec 15 ans d\'expérience. Spécialiste en gestion de crise.'
  },
  {
    id: 'exp-002',
    name: 'Alexandre Martin',
    role: 'Analyste SOC',
    specialty: 'Détection & Réponse',
    avatarInitials: 'AM',
    avatarColor: 'bg-blue-700',
    expertise: 85,
    availableForUrgency: ['low', 'medium', 'high', 'critical'],
    description: 'Expert en détection d\'intrusion et analyse de malware. Certifié GIAC.'
  },
  {
    id: 'exp-003',
    name: 'Sophie Legrand',
    role: 'Experte Forensics',
    specialty: 'Investigation numérique',
    avatarInitials: 'SL',
    avatarColor: 'bg-purple-700',
    expertise: 90,
    availableForUrgency: ['medium', 'high', 'critical'],
    description: 'Spécialiste en analyse post-incident et reconstruction d\'événements. Expérience judiciaire.'
  },
  {
    id: 'exp-004',
    name: 'Thomas Moreau',
    role: 'Resp. Communication',
    specialty: 'Communication de crise',
    avatarInitials: 'TM',
    avatarColor: 'bg-green-700',
    expertise: 80,
    availableForUrgency: ['high', 'critical'],
    description: 'Gère la communication externe lors d\'incidents majeurs. Expert en relations publiques.'
  },
  {
    id: 'exp-005',
    name: 'Laurent Klein',
    role: 'Architecte Sécurité',
    specialty: 'Infrastructure & Cloud',
    avatarInitials: 'LK',
    avatarColor: 'bg-orange-700',
    expertise: 88,
    availableForUrgency: ['low', 'medium', 'high'],
    description: 'Conçoit des architectures sécurisées et coordonne la remédiation technique des vulnérabilités.'
  }
];

// Stockage en mémoire pour les incidents et les sessions utilisateur
interface CrisisSession {
  userId: string;
  incidentId: string;
  messages: Array<{
    role: 'user' | 'expert' | 'system';
    expertId?: string;
    content: string;
    timestamp: string;
  }>;
  actions: Array<{
    type: string;
    timestamp: string;
    details: any;
    impact: any;
  }>;
  lastUpdated: string;
}

// Map pour stocker les sessions
const crisisSessions = new Map<string, CrisisSession>();

/**
 * Récupère tous les incidents actifs
 */
export async function getActiveIncidents(req: Request, res: Response) {
  try {
    // Filtrer les incidents actifs (non résolus)
    const activeIncidents = sampleIncidents.filter(
      incident => incident.status !== 'resolved'
    );
    
    return res.status(200).json({
      success: true,
      incidents: activeIncidents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents actifs:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des incidents'
    });
  }
}

/**
 * Récupère les détails d'un incident spécifique
 */
export async function getIncidentDetails(req: Request, res: Response) {
  try {
    const { incidentId } = req.params;
    
    const incident = sampleIncidents.find(inc => inc.id === incidentId);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }
    
    return res.status(200).json({
      success: true,
      incident
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'incident:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des détails de l\'incident'
    });
  }
}

/**
 * Récupère les experts disponibles pour un incident spécifique
 */
export async function getExpertsForIncident(req: Request, res: Response) {
  try {
    const { incidentId } = req.params;
    
    const incident = sampleIncidents.find(inc => inc.id === incidentId);
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }
    
    // Filtrer les experts disponibles en fonction de l'urgence de l'incident
    const availableExperts = sampleExperts.filter(
      expert => expert.availableForUrgency.includes(incident.urgency)
    );
    
    return res.status(200).json({
      success: true,
      experts: availableExperts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des experts:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des experts'
    });
  }
}

/**
 * Traite un message envoyé à un expert et génère une réponse
 */
export async function handleExpertMessage(req: Request, res: Response) {
  try {
    const { incidentId, expertId, message, userId = 'user-default' } = req.body;
    
    if (!incidentId || !expertId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: incidentId, expertId et message sont requis'
      });
    }
    
    // Vérifier si l'incident existe
    const incident = sampleIncidents.find(inc => inc.id === incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }
    
    // Vérifier si l'expert existe
    const expert = sampleExperts.find(exp => exp.id === expertId);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert non trouvé'
      });
    }
    
    // Créer ou récupérer la session de l'utilisateur
    const sessionId = `${userId}-${incidentId}`;
    if (!crisisSessions.has(sessionId)) {
      crisisSessions.set(sessionId, {
        userId,
        incidentId,
        messages: [],
        actions: [],
        lastUpdated: new Date().toISOString()
      });
    }
    
    const session = crisisSessions.get(sessionId)!;
    
    // Ajouter le message de l'utilisateur à l'historique
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Construire le contexte pour l'IA
    const context = `Vous êtes ${expert.name}, ${expert.role} spécialisé(e) en ${expert.specialty} avec un niveau d'expertise de ${expert.expertise}/100. ${expert.description}
    
Vous êtes actuellement en train de gérer un incident de cybersécurité avec les caractéristiques suivantes:
- Titre: ${incident.title}
- Description: ${incident.description}
- Type de menace: ${incident.threatType}
- Niveau d'urgence: ${incident.urgency}
- Systèmes affectés: ${incident.affectedSystems.join(', ')}
- Lieu: ${incident.location}

Votre rôle est de fournir des conseils experts, des actions concrètes et des recommandations selon votre spécialité pour aider à résoudre cet incident. Restez factuel et dans votre domaine d'expertise.

Historique de la conversation:
${session.messages.map(msg => `${msg.role === 'user' ? 'Utilisateur' : msg.role === 'expert' ? `${expert.name}` : 'Système'}: ${msg.content}`).join('\n')}`;

    // Générer une réponse avec Azure OpenAI
    const openAIResponse = await enhancedOpenAIService.getChatCompletion([
      { role: 'system', content: context },
      { role: 'user', content: message }
    ], {
      temperature: 0.7,
      max_tokens: 500
    });
    
    const expertResponse = openAIResponse.content;
    
    // Ajouter la réponse de l'expert à l'historique
    session.messages.push({
      role: 'expert',
      expertId: expert.id,
      content: expertResponse,
      timestamp: new Date().toISOString()
    });
    
    // Mettre à jour la session
    session.lastUpdated = new Date().toISOString();
    crisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      expertResponse,
      expert,
      sessionId
    });
  } catch (error) {
    console.error('Erreur lors du traitement du message expert:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du traitement du message'
    });
  }
}

/**
 * Exécute une action dans le cadre de la gestion d'incident
 */
export async function executeAction(req: Request, res: Response) {
  try {
    const { incidentId, actionType, actionParams, userId = 'user-default' } = req.body;
    
    if (!incidentId || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: incidentId et actionType sont requis'
      });
    }
    
    // Vérifier si l'incident existe
    const incidentIndex = sampleIncidents.findIndex(inc => inc.id === incidentId);
    if (incidentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }
    
    const incident = { ...sampleIncidents[incidentIndex] };
    
    // Créer ou récupérer la session de l'utilisateur
    const sessionId = `${userId}-${incidentId}`;
    if (!crisisSessions.has(sessionId)) {
      crisisSessions.set(sessionId, {
        userId,
        incidentId,
        messages: [],
        actions: [],
        lastUpdated: new Date().toISOString()
      });
    }
    
    const session = crisisSessions.get(sessionId)!;
    
    // Traiter l'action selon son type
    let actionResult;
    let actionImpact;
    
    switch (actionType) {
      case 'isolate-systems':
        // Simuler l'isolation des systèmes
        actionResult = {
          success: true,
          systemsIsolated: actionParams.systems || incident.affectedSystems,
          timeStamp: new Date().toISOString()
        };
        
        // Impact de l'action
        actionImpact = {
          operational: -15, // Baisse de l'impact opérationnel
          security: +10,    // Amélioration de la sécurité
          message: 'Systèmes isolés avec succès, propagation de la menace arrêtée.'
        };
        
        // Ajouter un événement à la timeline de l'incident
        incident.timeline.push({
          id: `evt-${incident.id}-${incident.timeline.length + 1}`,
          timestamp: new Date().toISOString(),
          title: 'Isolation des systèmes',
          description: `Les systèmes suivants ont été isolés du réseau: ${actionParams.systems?.join(', ') || incident.affectedSystems.join(', ')}`,
          actionTaken: 'Isolation réseau pour empêcher la propagation de la menace',
        });
        
        // Mettre à jour les métriques de l'incident
        incident.metrics.operational = Math.max(0, Math.min(100, incident.metrics.operational - 15));
        incident.metrics.security = Math.max(0, Math.min(100, incident.metrics.security + 10));
        
        break;
        
      case 'forensic-analysis':
        // Simuler une analyse forensique
        actionResult = {
          success: true,
          analysisType: actionParams.analysisType || 'full',
          findings: [
            'Traces de PowerShell obfusqué détectées',
            'Tentative de connexion à un serveur C2 identifié',
            'Présence de fichiers suspects dans /tmp/cache'
          ],
          timeStamp: new Date().toISOString()
        };
        
        // Impact de l'action
        actionImpact = {
          security: +15,     // Amélioration de la sécurité
          message: 'Analyse forensique complétée, nouvelles informations sur l\'attaque obtenues.'
        };
        
        // Ajouter un événement à la timeline de l'incident
        incident.timeline.push({
          id: `evt-${incident.id}-${incident.timeline.length + 1}`,
          timestamp: new Date().toISOString(),
          title: 'Analyse forensique',
          description: 'Analyse approfondie des systèmes compromis pour identifier les indicateurs de compromission et les vecteurs d\'attaque.',
          actionTaken: `Analyse de type ${actionParams.analysisType || 'complète'} réalisée sur les systèmes affectés`,
        });
        
        // Mettre à jour les métriques de l'incident
        incident.metrics.security = Math.max(0, Math.min(100, incident.metrics.security + 15));
        
        break;
        
      case 'reset-credentials':
        // Simuler une réinitialisation des identifiants
        actionResult = {
          success: true,
          accountsReset: actionParams.accounts || ['admin', 'service-accounts'],
          timeStamp: new Date().toISOString()
        };
        
        // Impact de l'action
        actionImpact = {
          operational: +10,  // Augmentation temporaire de l'impact opérationnel
          security: +20,     // Amélioration significative de la sécurité
          message: 'Identifiants réinitialisés, accès compromis révoqués.'
        };
        
        // Ajouter un événement à la timeline de l'incident
        incident.timeline.push({
          id: `evt-${incident.id}-${incident.timeline.length + 1}`,
          timestamp: new Date().toISOString(),
          title: 'Réinitialisation des identifiants',
          description: `Les identifiants suivants ont été réinitialisés: ${actionParams.accounts?.join(', ') || 'tous les comptes potentiellement compromis'}`,
          actionTaken: 'Réinitialisation forcée des mots de passe et révocation des jetons d\'accès',
        });
        
        // Mettre à jour les métriques de l'incident
        incident.metrics.operational = Math.max(0, Math.min(100, incident.metrics.operational + 10));
        incident.metrics.security = Math.max(0, Math.min(100, incident.metrics.security + 20));
        
        break;
        
      case 'notify-users':
        // Simuler une notification aux utilisateurs
        actionResult = {
          success: true,
          notificationType: actionParams.notificationType || 'email',
          usersNotified: actionParams.userGroups || ['all-employees'],
          timeStamp: new Date().toISOString()
        };
        
        // Impact de l'action
        actionImpact = {
          reputation: -10,   // Amélioration de la réputation par la transparence
          message: 'Utilisateurs notifiés, sensibilisation accrue aux menaces.'
        };
        
        // Ajouter un événement à la timeline de l'incident
        incident.timeline.push({
          id: `evt-${incident.id}-${incident.timeline.length + 1}`,
          timestamp: new Date().toISOString(),
          title: 'Notification des utilisateurs',
          description: `Notification envoyée aux groupes suivants: ${actionParams.userGroups?.join(', ') || 'tous les employés'}`,
          actionTaken: `Envoi d'une alerte de sécurité via ${actionParams.notificationType || 'email'}`,
        });
        
        // Mettre à jour les métriques de l'incident
        incident.metrics.reputation = Math.max(0, Math.min(100, incident.metrics.reputation - 10));
        
        break;
        
      case 'prepare-statement':
        // Simuler la préparation d'un communiqué
        actionResult = {
          success: true,
          statementType: actionParams.statementType || 'internal',
          audiences: actionParams.audiences || ['employees', 'partners'],
          timeStamp: new Date().toISOString()
        };
        
        // Impact de l'action
        actionImpact = {
          reputation: -15,   // Amélioration significative de la réputation
          message: 'Communication préparée, transparence assurée envers les parties prenantes.'
        };
        
        // Ajouter un événement à la timeline de l'incident
        incident.timeline.push({
          id: `evt-${incident.id}-${incident.timeline.length + 1}`,
          timestamp: new Date().toISOString(),
          title: 'Préparation d\'un communiqué',
          description: `Communiqué ${actionParams.statementType || 'interne'} préparé pour les audiences suivantes: ${actionParams.audiences?.join(', ') || 'employés et partenaires'}`,
          actionTaken: 'Rédaction et validation d\'un communiqué officiel sur l\'incident',
        });
        
        // Mettre à jour les métriques de l'incident
        incident.metrics.reputation = Math.max(0, Math.min(100, incident.metrics.reputation - 15));
        
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: `Type d'action non reconnu: ${actionType}`
        });
    }
    
    // Enregistrer l'action dans la session
    session.actions.push({
      type: actionType,
      timestamp: new Date().toISOString(),
      details: actionResult,
      impact: actionImpact
    });
    
    // Mettre à jour la session
    session.lastUpdated = new Date().toISOString();
    crisisSessions.set(sessionId, session);
    
    // Mettre à jour l'incident dans la liste
    sampleIncidents[incidentIndex] = incident;
    
    // Vérifier si l'incident peut être contenu ou résolu
    const securityScore = incident.metrics.security;
    if (securityScore >= 90 && incident.status === 'active') {
      incident.status = 'contained';
      incident.timeline.push({
        id: `evt-${incident.id}-${incident.timeline.length + 1}`,
        timestamp: new Date().toISOString(),
        title: 'Incident contenu',
        description: 'Les mesures prises ont permis de contenir l\'incident. La situation est sous contrôle mais nécessite toujours une surveillance.',
      });
    } else if (securityScore >= 95 && incident.status === 'contained') {
      incident.status = 'resolved';
      incident.timeline.push({
        id: `evt-${incident.id}-${incident.timeline.length + 1}`,
        timestamp: new Date().toISOString(),
        title: 'Incident résolu',
        description: 'L\'incident a été complètement résolu. Les opérations sont revenues à la normale et des mesures préventives ont été mises en place.',
      });
    }
    
    return res.status(200).json({
      success: true,
      actionResult,
      actionImpact,
      updatedIncident: incident,
      sessionId
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'exécution de l\'action'
    });
  }
}

/**
 * Récupère la session de crise d'un utilisateur pour un incident
 */
export async function getCrisisSession(req: Request, res: Response) {
  try {
    const { userId = 'user-default', incidentId } = req.params;
    
    const sessionId = `${userId}-${incidentId}`;
    
    if (!crisisSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    const session = crisisSessions.get(sessionId);
    
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session de crise:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de la session'
    });
  }
}