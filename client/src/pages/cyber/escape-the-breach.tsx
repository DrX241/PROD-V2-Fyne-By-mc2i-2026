import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal, File, Database, Server, Shield, Clock, Info, HelpCircle, Award, Check } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types pour l'application
interface Message {
  id: string;
  sender: 'user' | 'rssi' | 'expert_forensique' | 'responsable_infrastructure' | 'system';
  content: string;
  timestamp: string;
}

interface Evidence {
  id: string;
  type: 'log' | 'file' | 'network' | 'code' | 'server';
  name: string;
  content: string;
  discovered: boolean;
  highlighted?: boolean;
  relevantFor?: ('rssi' | 'expert_forensique' | 'responsable_infrastructure')[];
}

interface NPC {
  id: 'rssi' | 'expert_forensique' | 'responsable_infrastructure';
  name: string;
  role: string;
  description: string;
  avatar: string;
  objectives: string[];
  keyword?: string;
  keywordRevealed: boolean;
}

interface ScenarioStage {
  id: string;
  title: string;
  description: string;
  objective: string;
  evidenceRequired: string[];
  completed: boolean;
}

// Composant principal
export default function EscapeTheBreach() {
  // États
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [stages, setStages] = useState<ScenarioStage[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes en secondes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [scenarioStarted, setScenarioStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorialHighlight, setShowTutorialHighlight] = useState<string | null>("evidence-tab"); // Pour guider l'utilisateur
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [showFinalChallenge, setShowFinalChallenge] = useState(false);
  const [finalKeywords, setFinalKeywords] = useState<{[key: string]: string}>({});
  const [finalSolution, setFinalSolution] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Effets
  
  // Auto-scroll pour les messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerRunning, timeRemaining]);
  
  // Initialisation du scénario
  useEffect(() => {
    if (scenarioStarted) return; // N'initialise qu'une seule fois
    
    // Initialisation des PNJ
    const initialNpcs: NPC[] = [
      {
        id: 'rssi',
        name: 'Alexandre Moreau',
        role: 'Responsable Sécurité des Systèmes d\'Information',
        description: 'Expert en gouvernance de la sécurité et en gestion des incidents. Vise à minimiser l\'impact business et établir une stratégie de remédiation.',
        avatar: '👨‍💼',
        objectives: [
          'Identifier la nature et l\'étendue de l\'attaque',
          'Évaluer l\'impact sur les activités de l\'entreprise',
          'Déterminer les vulnérabilités exploitées',
          'Établir un plan de remédiation'
        ],
        keywordRevealed: false,
        keyword: 'FIREWALL'
      },
      {
        id: 'expert_forensique',
        name: 'Sophie Laurent',
        role: 'Analyste Forensique',
        description: 'Spécialiste de l\'analyse post-incident, elle recherche des indices techniques et reconstruit la chronologie de l\'attaque.',
        avatar: '👩‍💻',
        objectives: [
          'Reconstruire la chronologie complète de l\'incident',
          'Identifier les techniques d\'attaque utilisées',
          'Trouver des IOCs (Indicateurs de Compromission)',
          'Analyser les artefacts malveillants'
        ],
        keywordRevealed: false,
        keyword: 'DEFENDER'
      },
      {
        id: 'responsable_infrastructure',
        name: 'Thomas Garcia',
        role: 'Responsable Infrastructure',
        description: 'En charge de l\'infrastructure IT, il travaille sur la restauration des systèmes et la reprise d\'activité.',
        avatar: '👨‍🔧',
        objectives: [
          'Identifier tous les systèmes compromis',
          'Évaluer les dommages techniques',
          'Isoler les systèmes infectés',
          'Préparer un plan de restauration'
        ],
        keywordRevealed: false,
        keyword: 'PERIMETER'
      }
    ];
    
    setNpcs(initialNpcs);
    
    // Données simplifiées pour le scénario ransomware
    const initialStages: ScenarioStage[] = [
      {
        id: 'stage1',
        title: 'Première étape: Comprendre l\'attaque',
        description: 'Examinez les journaux système et l\'email d\'alerte pour comprendre ce qui s\'est passé',
        objective: 'OBJECTIF: Découvrir quels serveurs ont été touchés par l\'attaque et quand',
        evidenceRequired: ['systemlogs', 'alert_email'],
        completed: false
      },
      {
        id: 'stage2',
        title: 'Deuxième étape: Trouver comment l\'attaquant est entré',
        description: 'Cherchez des indices dans les logs d\'authentification et les emails',
        objective: 'OBJECTIF: Identifier comment l\'attaquant a obtenu un accès initial',
        evidenceRequired: ['auth_logs', 'phishing_email'],
        completed: false
      },
      {
        id: 'stage3',
        title: 'Troisième étape: Évaluer les dégâts',
        description: 'Vérifiez quels systèmes et données ont été compromis',
        objective: 'OBJECTIF: Faire la liste de tous les systèmes affectés',
        evidenceRequired: ['network_traffic', 'affected_servers'],
        completed: false
      }
    ];
    
    const initialEvidences: Evidence[] = [
      {
        id: 'systemlogs',
        type: 'log',
        name: 'Journaux système (10/05/2025)',
        content: `[10/05/2025 03:14:22] ERROR: Multiple database connections failed
[10/05/2025 03:14:45] WARNING: Unusual file system activity detected on srv-app-01
[10/05/2025 03:15:10] ERROR: Critical services shutdown on srv-app-01, srv-db-01
[10/05/2025 03:16:30] ALERT: Multiple files encrypted with unknown extension .lock_mc2i
[10/05/2025 03:17:02] ERROR: Backup service connection failed`,
        discovered: false
      },
      {
        id: 'alert_email',
        type: 'file',
        name: 'Email d\'alerte automatique',
        content: `De: monitoring@mc2i.fr
À: security-team@mc2i.fr
Sujet: [URGENT] Alerte automatique de sécurité

L'équipe de surveillance a détecté une activité anormale sur plusieurs serveurs de l'environnement de production à 03:14. L'accès aux applications client est actuellement interrompu et plusieurs utilisateurs signalent des messages de demande de rançon sur leurs écrans.

Niveau de gravité: CRITIQUE

Services affectés:
- Portail client
- Base de données centrale
- Serveurs de fichiers

Merci de répondre selon le protocole d'incident.`,
        discovered: false
      },
      {
        id: 'auth_logs',
        type: 'log',
        name: 'Journaux d\'authentification',
        content: `[09/05/2025 23:42:15] SUCCESS: User martin.dubois logged in from 192.168.1.45
[10/05/2025 00:15:32] FAILED: User admin failed login from 45.77.65.211 (attempt 1/3)
[10/05/2025 00:15:45] FAILED: User admin failed login from 45.77.65.211 (attempt 2/3)
[10/05/2025 00:15:58] FAILED: User admin failed login from 45.77.65.211 (attempt 3/3)
[10/05/2025 00:16:10] FAILED: User sysadmin failed login from 45.77.65.211 (attempt 1/3)
[10/05/2025 01:42:33] SUCCESS: User thomas.legrand logged in from 45.77.65.211
[10/05/2025 01:43:15] SUCCESS: User thomas.legrand elevated to admin privileges
[10/05/2025 02:15:44] SUCCESS: User thomas.legrand logged in from 45.77.65.211`,
        discovered: false
      },
      {
        id: 'phishing_email',
        type: 'file',
        name: 'Email suspect retrouvé',
        content: `De: rh-noreply@mc2i-careers.net
À: thomas.legrand@mc2i.fr
Sujet: Urgent: Mise à jour de vos informations personnelles

Cher Thomas Legrand,

Suite à la mise à jour de notre système RH, nous vous demandons de vérifier et mettre à jour vos informations personnelles avant le 10/05/2025.

Veuillez cliquer sur le lien ci-dessous et vous connecter avec vos identifiants habituels :
https://portail-rh.mc2i-careers.net/update [LIEN MALVEILLANT]

Service des Ressources Humaines
MC2I Group`,
        discovered: false
      },
      {
        id: 'network_traffic',
        type: 'network',
        name: 'Analyse du trafic réseau',
        content: `Rapport d'analyse du trafic réseau (10/05/2025 00:00 - 04:00)

Points d'intérêt:
- Connexion suspecte depuis 45.77.65.211 (localisée en Europe de l'Est)
- Volume inhabituel de communications entre srv-app-01 et des adresses IP externes non reconnues
- Trafic chiffré non standard sur le port 1035
- Tentatives de connexion multiples aux serveurs de base de données
- Communications avec l'IP 91.243.85.126 connue comme hébergeant des serveurs C2`,
        discovered: false
      },
      {
        id: 'affected_servers',
        type: 'server',
        name: 'Liste des serveurs affectés',
        content: `Serveurs confirmés comme compromis:

1. srv-app-01 (Serveur d'application principal)
   - Status: Critique
   - Services compromis: Tous
   - Données: Chiffrées

2. srv-db-01 (Base de données client)
   - Status: Critique
   - Services compromis: SQL Server
   - Données: Partiellement chiffrées

3. srv-file-02 (Serveur de fichiers secondaire)
   - Status: Moyen
   - Services compromis: Partage de fichiers
   - Données: Chiffrées

4. srv-backup-01 (Serveur de sauvegarde)
   - Status: Critique
   - Services compromis: Rotation des sauvegardes interrompue
   - Données: Sauvegardes récentes chiffrées`,
        discovered: false
      },
      {
        id: 'ransom_note',
        type: 'file',
        name: 'Note de rançon (RANSOM.txt)',
        content: `=== CYBER LOCK ENTERPRISE ===

VOS FICHIERS ONT ÉTÉ CHIFFRÉS

N'essayez pas de restaurer vos données, c'est impossible sans notre clé de déchiffrement.

Pour récupérer vos données, vous devez:
1. Payer 20 BTC à l'adresse: bc1q8z7g6etf5jqv7cmrfdz9p8qz08hkxq4c42tnk3
2. Contacter recovery@cyberlockenterprise.io avec votre ID unique: MC2I-892345
3. Attendre 24h pour la validation du paiement et la réception des outils de déchiffrement

VOUS AVEZ 72 HEURES. APRÈS CE DÉLAI, LA CLÉ SERA SUPPRIMÉE ET VOS DONNÉES SERONT PERDUES.

Note: Si vous contactez les autorités, nous publierons toutes les données exfiltrées (17.8 GB) sur notre site de fuite.`,
        discovered: false
      },
      {
        id: 'malware_sample',
        type: 'code',
        name: 'Échantillon de code malveillant',
        content: `// Fragment extrait du malware (analysé par l'équipe sécurité)

function encryptFiles(path) {
  const files = listFilesInDirectory(path);
  const encryptionKey = generateRandomKey();
  
  // Envoyer la clé au serveur C2
  sendToC2(encryptionKey, victim_id);
  
  files.forEach(file => {
    if (!isExcluded(file) && !isAlreadyEncrypted(file)) {
      try {
        const data = readFile(file);
        const encrypted = encryptData(data, encryptionKey);
        writeFile(file + '.lock_mc2i', encrypted);
        secureDelete(file);
        incrementCounter();
      } catch (e) {
        logError(e);
      }
    }
  });
  
  if (filesEncrypted > 1000) {
    deployRansomNote();
  }
}

// Fonction pour désactiver les sauvegardes
function disableBackups() {
  const backupServices = [
    'Windows Backup',
    'SQL Backup Agent',
    'Veeam Backup',
    'Shadow Copy'
  ];
  
  backupServices.forEach(service => {
    stopService(service);
  });
}`,
        discovered: false
      },
      {
        id: 'timeline',
        type: 'file',
        name: 'Chronologie de l\'incident',
        content: `CHRONOLOGIE DE L'INCIDENT (Brouillon)

09/05/2025:
- Email de phishing reçu par Thomas Legrand de l'équipe système
- ?

10/05/2025:
- 00:15 - Tentatives d'authentification échouées depuis IP externe
- 01:42 - Authentification réussie avec les identifiants volés
- 01:43 - Élévation de privilèges
- 02:15 - Nouvel accès depuis la même IP
- 02:20-03:00 - ? (À déterminer)
- 03:14 - Début du chiffrement des données
- 03:17 - Désactivation des sauvegardes
- 03:30 - Déploiement des notes de rançon
- 04:15 - Détection de l'incident par l'équipe de surveillance

LACUNES À COMBLER:
- Comment l'attaquant a-t-il élevé ses privilèges?
- Quelles actions ont été effectuées entre 02:20 et 03:00?
- L'exfiltration des données est-elle confirmée?`,
        discovered: false
      },
      {
        id: 'vulnerabilities',
        type: 'file',
        name: 'Vulnérabilités identifiées',
        content: `RAPPORT PRÉLIMINAIRE DES VULNÉRABILITÉS

Vulnérabilités exploitées:
1. [CRITIQUE] Ingénierie sociale / Phishing - Utilisateur compromis via email frauduleux
2. [ÉLEVÉE] Identifiants réutilisés - Les mêmes identifiants utilisés pour plusieurs systèmes
3. [CRITIQUE] Absence d'authentification multifacteur sur les comptes administrateurs
4. [ÉLEVÉE] Sauvegarde non isolée du réseau principal
5. [MOYENNE] Détection d'intrusion défaillante - L'activité anormale n'a pas généré d'alerte

Recommandations immédiates:
- Mettre en place l'authentification multifacteur
- Isoler les sauvegardes du réseau principal
- Améliorer la formation contre le phishing
- Renforcer la segmentation réseau
- Déployer une solution EDR sur tous les points terminaux`,
        discovered: false
      }
    ];
    
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'system',
        content: '📋 BIENVENUE DANS "ESCAPE THE BREACH" - SIMULATION D\'INVESTIGATION CYBERSÉCURITÉ',
        timestamp: formatTime(new Date())
      },
      {
        id: '2',
        sender: 'system',
        content: '⚠️ COMMENT JOUER :\n1. Examinez les preuves dans l\'onglet "Preuves" à droite\n2. Cliquez sur chaque preuve pour la découvrir\n3. Posez des questions au RSSI par le chat\n4. Complétez l\'objectif actuel avant de passer à l\'étape suivante',
        timestamp: formatTime(new Date())
      },
      {
        id: '3',
        sender: 'rssi',
        content: 'Bonjour, je suis Marie Lemaire, RSSI de MC2i Group. Nous avons été victimes d\'une cyberattaque cette nuit. Nos serveurs ont été chiffrés par un ransomware et nous ne pouvons plus accéder à nos données.',
        timestamp: formatTime(new Date())
      },
      {
        id: '4',
        sender: 'rssi',
        content: 'VOTRE MISSION : m\'aider à comprendre comment l\'attaque s\'est produite en analysant les preuves disponibles. Commencez par les journaux système et l\'email d\'alerte que vous trouverez dans l\'onglet "Preuves" à droite.',
        timestamp: formatTime(new Date())
      },
      {
        id: '5',
        sender: 'system',
        content: '🔍 CONSEIL : Consultez l\'onglet "Étapes" pour voir votre progression et l\'objectif actuel. Bonne chance !',
        timestamp: formatTime(new Date())
      }
    ];
    
    setStages(initialStages);
    setEvidences(initialEvidences);
    setMessages(initialMessages);
    setScenarioStarted(true);
  }, [scenarioStarted]);
  
  // Fonctions utilitaires
  
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  function formatTimeRemaining(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Gestionnaires d'événements
  
  const handleStartScenario = () => {
    setIsTimerRunning(true);
    addSystemMessage('L\'investigation a commencé. Vous avez 60 minutes pour découvrir ce qui s\'est passé.');
  };
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: userInput,
      timestamp: formatTime(new Date())
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Simuler une réponse du RSSI
    setTimeout(() => {
      processUserMessage(userInput);
    }, 1000);
  };
  
  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Logique simple pour des réponses simulées
    if (lowerMessage.includes('ransomware') || lowerMessage.includes('ransom')) {
      addRSSIMessage('Oui, il s\'agit bien d\'une attaque par ransomware. Selon les premiers éléments, nos fichiers ont été chiffrés avec l\'extension ".lock_mc2i".');
    } else if (lowerMessage.includes('phishing') || lowerMessage.includes('hameçonnage')) {
      addRSSIMessage('Le phishing est effectivement une hypothèse à considérer. Plusieurs de nos employés ont signalé avoir reçu des emails suspects récemment.');
      
      // Révéler l'indice du phishing s'il n'est pas déjà découvert
      if (!evidences.find(e => e.id === 'phishing_email')?.discovered) {
        addSystemMessage('Indice: Vérifiez les emails suspects dans les preuves disponibles.');
      }
    } else if (lowerMessage.includes('sauvegarde') || lowerMessage.includes('backup')) {
      addRSSIMessage('Malheureusement, nos sauvegardes récentes semblent également avoir été compromises. Le serveur de backup a été affecté par l\'attaque.');
    } else if (lowerMessage.includes('help') || lowerMessage.includes('aide')) {
      setShowHelp(true);
    } else {
      addRSSIMessage('Concentrez-vous sur l\'analyse des preuves disponibles. Chaque élément peut contenir des indices importants pour comprendre le déroulement de l\'attaque.');
    }
  };
  
  const addRSSIMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'rssi',
      content,
      timestamp: formatTime(new Date())
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  const addSystemMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'system',
      content,
      timestamp: formatTime(new Date())
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleDiscoverEvidence = (id: string) => {
    setEvidences(prev => prev.map(ev => 
      ev.id === id ? { ...ev, discovered: true } : ev
    ));
    
    addSystemMessage(`Nouvelle preuve découverte: ${evidences.find(e => e.id === id)?.name}`);
    
    // Vérifier si l'étape actuelle est complétée
    const currentStageObj = stages[currentStage];
    if (currentStageObj) {
      const requiredEvidence = currentStageObj.evidenceRequired;
      const allDiscovered = requiredEvidence.every(evId => 
        evidences.find(e => e.id === evId)?.discovered
      );
      
      if (allDiscovered && !currentStageObj.completed) {
        // Marquer l'étape comme complétée
        setStages(prev => prev.map((stage, idx) => 
          idx === currentStage ? { ...stage, completed: true } : stage
        ));
        
        addSystemMessage(`Objectif complété: ${currentStageObj.objective}`);
        
        // Passer à l'étape suivante si ce n'est pas la dernière
        if (currentStage < stages.length - 1) {
          setTimeout(() => {
            setCurrentStage(prev => prev + 1);
            addRSSIMessage(`Excellent travail! Passons maintenant à la prochaine étape: ${stages[currentStage + 1].title}`);
          }, 2000);
        } else {
          // Compléter le scénario
          setIsTimerRunning(false);
          addSystemMessage('Félicitations! Vous avez complété toutes les étapes de l\'investigation.');
          addRSSIMessage('Excellent travail! Vous avez réussi à reconstituer le déroulement complet de cette attaque par ransomware. Ces informations seront cruciales pour notre remédiation et pour renforcer nos défenses.');
        }
      }
    }
  };
  
  const handleSelectEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
  };
  
  // Rendu des composants
  
  const renderMessageBubble = (message: Message) => {
    switch (message.sender) {
      case 'user':
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className="flex flex-col items-end">
              <div className="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
                {message.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">{message.timestamp}</span>
            </div>
          </div>
        );
      case 'rssi':
        return (
          <div key={message.id} className="flex mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-indigo-700 text-white">ML</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="bg-gray-700 text-white rounded-lg py-2 px-4 max-w-[80%]">
                {message.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">{message.timestamp}</span>
            </div>
          </div>
        );
      case 'system':
        return (
          <div key={message.id} className="flex justify-center mb-4">
            <div className="bg-gray-800 border border-gray-600 text-gray-300 rounded-lg py-2 px-4 max-w-[90%] text-sm">
              <Info className="inline-block h-4 w-4 mr-2 text-blue-400" />
              {message.content}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderEvidenceItem = (evidence: Evidence) => {
    let icon;
    switch (evidence.type) {
      case 'log':
        icon = <Terminal className="h-5 w-5 text-yellow-400" />;
        break;
      case 'file':
        icon = <File className="h-5 w-5 text-blue-400" />;
        break;
      case 'network':
        icon = <Server className="h-5 w-5 text-green-400" />;
        break;
      case 'code':
        icon = <Database className="h-5 w-5 text-purple-400" />;
        break;
      case 'server':
        icon = <Server className="h-5 w-5 text-red-400" />;
        break;
      default:
        icon = <File className="h-5 w-5 text-gray-400" />;
    }
    
    return (
      <div 
        key={evidence.id}
        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
          evidence.discovered 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-gray-800 hover:bg-gray-700'
        } ${selectedEvidence?.id === evidence.id ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => evidence.discovered ? handleSelectEvidence(evidence) : handleDiscoverEvidence(evidence.id)}
      >
        <div className="mr-3">{icon}</div>
        <div className="flex-1">
          <div className="font-medium">{evidence.name}</div>
          <div className="text-xs text-gray-400">
            {evidence.discovered ? 'Preuve examinée' : 'Preuve à découvrir'}
          </div>
        </div>
        {evidence.discovered ? (
          <Badge variant="outline" className="bg-green-900 text-green-100">Découvert</Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-700 text-gray-300">Non découvert</Badge>
        )}
      </div>
    );
  };
  
  const renderStageProgress = () => {
    const completedStages = stages.filter(stage => stage.completed).length;
    const progressPercentage = (completedStages / stages.length) * 100;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Progression de l'enquête</h3>
          <span className="text-sm text-gray-400">{completedStages}/{stages.length} étapes</span>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-4" />
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div 
              key={stage.id} 
              className={`p-3 rounded-lg border text-sm ${
                index === currentStage 
                  ? 'bg-blue-900/30 border-blue-700'
                  : stage.completed
                    ? 'bg-green-900/20 border-green-800'
                    : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{index + 1}. {stage.title}</div>
                {stage.completed && <Check className="h-4 w-4 text-green-400" />}
              </div>
              {(index === currentStage || stage.completed) && (
                <div className="mt-1 text-sm text-gray-300">{stage.objective}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Rendu principal
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!isTimerRunning ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center">
                <Shield className="mr-2 h-6 w-6 text-red-500" />
                Escape the Breach: Ransomware Investigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-900/30 border-blue-800">
                <AlertTitle className="text-blue-400">Scénario d'incident</AlertTitle>
                <AlertDescription>
                  En tant qu'analyste de sécurité, vous êtes appelé d'urgence à 5h du matin. Les serveurs de MC2i Group ont été compromis par une attaque de ransomware. Vous devez déterminer l'origine de la brèche, l'étendue des dégâts et identifier les vulnérabilités exploitées.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h3 className="font-medium">Objectifs:</h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">
                  <li>Analyser les preuves numériques disponibles</li>
                  <li>Déterminer le vecteur d'attaque initial</li>
                  <li>Reconstituer la chronologie de l'incident</li>
                  <li>Identifier les vulnérabilités exploitées</li>
                  <li>Documenter l'étendue de la compromission</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Compétences pratiquées:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-900">Analyse forensique</Badge>
                  <Badge className="bg-indigo-900">Réponse aux incidents</Badge>
                  <Badge className="bg-purple-900">Investigation numérique</Badge>
                  <Badge className="bg-green-900">Analyse de logs</Badge>
                  <Badge className="bg-yellow-900">Threat hunting</Badge>
                </div>
              </div>
              
              <div className="pt-2 text-sm text-gray-400">
                <p>Ce scénario est limité à 60 minutes. Votre performance sera évaluée sur la qualité de votre investigation et la rapidité à laquelle vous identifiez les éléments clés de l'attaque.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartScenario}>
                Démarrer l'investigation
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <header className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Link href="/cyber-mode-selection-fixed">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Escape the Breach: Investigation Ransomware</h1>
            </div>
            
            <div className="flex items-center">
              <div className={`flex items-center mr-4 p-2 rounded-lg ${
                timeRemaining > 600 
                  ? 'bg-green-900/30 text-green-300' 
                  : timeRemaining > 300 
                    ? 'bg-yellow-900/30 text-yellow-300' 
                    : 'bg-red-900/30 text-red-300'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setShowHelp(true)}>
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Besoin d'aide ?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Panneau de chat */}
            <div className="lg:col-span-1 h-[calc(100vh-120px)] flex flex-col bg-gray-800 rounded-lg border border-gray-700">
              <div className="bg-gray-700 p-3 border-b border-gray-600 rounded-t-lg">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-indigo-700 text-white">ML</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Marie Lemaire</h3>
                    <p className="text-xs text-gray-400">RSSI MC2i Group</p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
                <div className="space-y-2">
                  {messages.map(message => renderMessageBubble(message))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-gray-700">
                <div className="flex">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Posez une question ou faites une observation..." 
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    className="rounded-l-none"
                    onClick={handleSendMessage}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Panneau central */}
            <div className="lg:col-span-2 h-[calc(100vh-120px)] flex flex-col">
              <Tabs defaultValue="progress" className="w-full h-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="progress">Progression</TabsTrigger>
                  <TabsTrigger value="evidence">Preuves</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>
                
                <TabsContent value="progress" className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                  {renderStageProgress()}
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Étape actuelle: {stages[currentStage]?.title}</h3>
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{stages[currentStage]?.objective}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{stages[currentStage]?.description}</p>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Preuves nécessaires:</h4>
                          <div className="space-y-2">
                            {stages[currentStage]?.evidenceRequired.map(evId => {
                              const ev = evidences.find(e => e.id === evId);
                              return (
                                <div 
                                  key={evId}
                                  className={`p-2 border rounded-lg flex items-center ${
                                    ev?.discovered 
                                      ? 'bg-green-900/20 border-green-800' 
                                      : 'bg-gray-800 border-gray-700'
                                  }`}
                                >
                                  {ev?.discovered ? (
                                    <Check className="h-4 w-4 text-green-400 mr-2" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-gray-500 mr-2" />
                                  )}
                                  <span className="text-sm">
                                    {ev?.discovered ? ev.name : 'Preuve à découvrir'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="evidence" className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                    <h3 className="text-lg font-medium mb-3">Preuves disponibles</h3>
                    <div className="space-y-2">
                      {evidences.map(evidence => renderEvidenceItem(evidence))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                    <h3 className="text-lg font-medium mb-3">
                      {selectedEvidence ? selectedEvidence.name : 'Détails de la preuve'}
                    </h3>
                    
                    {selectedEvidence ? (
                      <div>
                        <Badge className="mb-3" variant="outline">
                          {selectedEvidence.type === 'log' && 'Journal système'}
                          {selectedEvidence.type === 'file' && 'Fichier'}
                          {selectedEvidence.type === 'network' && 'Trafic réseau'}
                          {selectedEvidence.type === 'code' && 'Code source'}
                          {selectedEvidence.type === 'server' && 'Serveur'}
                        </Badge>
                        
                        <Card className="bg-gray-900 border-gray-700">
                          <CardContent className="p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                              {selectedEvidence.content}
                            </pre>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-400">
                        <File className="h-12 w-12 mb-4 opacity-30" />
                        <p>Sélectionnez une preuve pour voir les détails</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Résumé de l'incident</h3>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-gray-300">
                            Un incident de sécurité a été détecté à 03:14 le 10/05/2025. Plusieurs serveurs critiques de MC2i Group ont été compromis par un ransomware, entraînant le chiffrement de données importantes. L'investigation vise à déterminer le vecteur d'attaque, l'étendue de la compromission et à identifier les vulnérabilités exploitées.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Informations connues</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <span className="bg-blue-900 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                          <span>L'incident a été détecté dans la nuit du 10 mai 2025.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-900 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                          <span>Les fichiers ont été chiffrés avec l'extension ".lock_mc2i".</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-900 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                          <span>Une demande de rançon a été laissée sur les systèmes affectés.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-900 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                          <span>Plusieurs serveurs critiques sont inaccessibles, affectant les opérations de l'entreprise.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Votre rôle</h3>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-gray-300">
                            En tant qu'analyste de sécurité, votre mission est de mener l'investigation numérique pour déterminer:
                          </p>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                            <li>Comment les attaquants ont obtenu un accès initial</li>
                            <li>Comment ils se sont déplacés dans le réseau</li>
                            <li>Quelles vulnérabilités ont été exploitées</li>
                            <li>Quels systèmes et données ont été compromis</li>
                            <li>L'identité potentielle des attaquants</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
      
      {/* Fenêtre d'aide */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-blue-400" />
                Aide et conseils
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Comment jouer</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Explorez les preuves disponibles dans l'onglet "Preuves"</li>
                  <li>Discutez avec le RSSI pour obtenir plus d'informations</li>
                  <li>Consultez régulièrement l'onglet "Progression" pour suivre vos objectifs</li>
                  <li>Analysez les preuves découvertes pour comprendre le déroulement de l'attaque</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Conseils pour l'investigation</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Commencez par les logs système et alertes initiales</li>
                  <li>Cherchez des indices sur le vecteur d'entrée (phishing, vulnérabilité...)</li>
                  <li>Établissez une chronologie des événements</li>
                  <li>Identifiez tous les systèmes compromis</li>
                  <li>Reconstituez les actions de l'attaquant étape par étape</li>
                </ul>
              </div>
              
              <div className="pt-2 text-xs text-gray-400">
                <p>Note: Ce scénario est conçu pour être résolu en moins d'une heure. Concentrez-vous sur les éléments les plus pertinents.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => setShowHelp(false)}>
                Fermer
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}