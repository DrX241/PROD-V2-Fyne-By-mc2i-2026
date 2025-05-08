import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Clock, Check, Info, 
  Terminal, File, Database, Server, 
  Shield, HelpCircle, Award, User
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip, TooltipContent, TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Interfaces
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
        discovered: false,
        relevantFor: ['rssi', 'responsable_infrastructure']
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
        discovered: false,
        relevantFor: ['rssi']
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
        discovered: false,
        relevantFor: ['expert_forensique', 'rssi']
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
mc2i Group`,
        discovered: false,
        relevantFor: ['expert_forensique']
      },
      {
        id: 'network_traffic',
        type: 'network',
        name: 'Capture de trafic réseau',
        content: `# Analyse de trafic réseau (extrait)
Timestamp: 10/05/2025 01:45:22
Source IP: 192.168.1.87 (poste-tlegrand)
Destination: 45.77.65.211:443
Protocol: HTTPS
Volume: 17.8 GB (sortant)
Duration: 28 minutes

Timestamp: 10/05/2025 02:58:12
Source IP: 45.77.65.211
Destination: 192.168.1.87 (poste-tlegrand)
Protocol: HTTPS
Payload: Encrypted (TLS)

Timestamp: 10/05/2025 03:12:47
Source IP: 192.168.1.87 (poste-tlegrand)
Multiple destinations: Internal network (192.168.1.0/24)
Protocol: SMB
High volume of file access across shared drives`,
        discovered: false,
        relevantFor: ['expert_forensique', 'responsable_infrastructure']
      },
      {
        id: 'affected_servers',
        type: 'server',
        name: 'Liste des serveurs affectés',
        content: `# Rapport automatique - Systèmes affectés
Généré le: 10/05/2025 05:30:12

SERVEURS CRITIQUES HORS LIGNE:
- srv-app-01 (Portail client) - 100% des fichiers chiffrés
- srv-app-02 (API interne) - 100% des fichiers chiffrés
- srv-db-01 (Base de données principale) - Base de données corrompue
- srv-file-01 (Partage de fichiers) - 95% des fichiers chiffrés
- srv-backup-01 (Serveur de sauvegarde primaire) - Sauvegardes des 7 derniers jours chiffrées

SERVEURS PARTIELLEMENT AFFECTÉS:
- srv-mail-01 (Serveur mail) - Fonctionnel mais certaines archives chiffrées
- srv-db-02 (Base données analytique) - En ligne, mais certaines tables corrompues

ESTIMATION DES DONNÉES PERDUES: ~4.2 TB
ESTIMATION DES DONNÉES EXFILTRÉES: ~17.8 GB (selon les logs de trafic)`,
        discovered: false,
        relevantFor: ['responsable_infrastructure', 'rssi']
      },
      {
        id: 'ransom_note',
        type: 'file',
        name: 'Note de rançon',
        content: `======= CYBERLOCKENTERPRISE RANSOMWARE =======

VOS FICHIERS ONT ÉTÉ CHIFFRÉS

N'essayez pas de restaurer vos données, c'est impossible sans notre clé de déchiffrement.

Pour récupérer vos données, vous devez:
1. Payer 20 BTC à l'adresse: bc1q8z7g6etf5jqv7cmrfdz9p8qz08hkxq4c42tnk3
2. Contacter recovery@cyberlockenterprise.io avec votre ID unique: MC2I-892345
3. Attendre 24h pour la validation du paiement et la réception des outils de déchiffrement

VOUS AVEZ 72 HEURES. APRÈS CE DÉLAI, LA CLÉ SERA SUPPRIMÉE ET VOS DONNÉES SERONT PERDUES.

Note: Si vous contactez les autorités, nous publierons toutes les données exfiltrées (17.8 GB) sur notre site de fuite.`,
        discovered: false,
        relevantFor: ['rssi']
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
    'Veeam Backup',
    'SQL Backup'
  ];
  
  backupServices.forEach(service => {
    try {
      stopService(service);
      setServiceStartupType(service, 'disabled');
      logSuccess(\`Successfully disabled \${service}\`);
    } catch (e) {
      logError(\`Failed to disable \${service}: \${e}\`);
    }
  });
}`,
        discovered: false,
        relevantFor: ['expert_forensique']
      }
    ];
    
    setEvidences(initialEvidences);
    setStages(initialStages);
    
    // Message initial quand le scénario commence
    setTimeout(() => {
      const initialMessages = [
        {
          id: Date.now().toString(),
          sender: 'rssi' as const,
          content: "Bonjour, je suis Alexandre Moreau, RSSI de MC2i Group. Nous sommes face à une situation critique. Nos serveurs ont été compromis par une attaque de ransomware. Nous avons besoin de votre expertise pour comprendre ce qui s'est passé et déterminer comment nous avons été infectés.",
          timestamp: formatTime(new Date())
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'system' as const,
          content: "Utilisez les onglets pour examiner les preuves et interagir avec l'équipe d'intervention. Chaque spécialiste a des connaissances et des objectifs différents.",
          timestamp: formatTime(new Date())
        }
      ];
      
      setMessages(initialMessages);
    }, 1000);
    
    setScenarioStarted(true);
    
  }, [isTimerRunning]);
  
  // Fonctions utilitaires
  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  function formatTimeRemaining(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Fonction pour interagir avec l'IA via Azure OpenAI
  const interactWithNPC = async (npcId: string, message: string, evidenceId?: string) => {
    // Ajouter un état de chargement
    const loadingMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      sender: npcId as 'rssi' | 'expert_forensique' | 'responsable_infrastructure' | 'system',
      content: '...',
      timestamp: formatTime(new Date())
    }]);
    
    try {
      // Construire le contexte basé sur le NPC
      const npc = npcs.find(n => n.id === npcId);
      if (!npc) throw new Error("NPC non trouvé");
      
      // Déterminer quelles preuves sont pertinentes pour ce NPC
      let relevantEvidences = evidences.filter(e => e.discovered);
      
      // Si une preuve spécifique est partagée, l'inclure dans le contexte
      let sharedEvidence = null;
      if (evidenceId) {
        sharedEvidence = evidences.find(e => e.id === evidenceId);
        if (sharedEvidence) {
          relevantEvidences = [sharedEvidence];
        }
      }
      
      // Construire le prompt pour l'IA
      const prompt = `Agis comme ${npc.name}, ${npc.role} dans une simulation d'incident de cybersécurité. 
Voici tes objectifs: ${npc.objectives.join(", ")}. 
${sharedEvidence ? `L'utilisateur te partage cette preuve: 
TITRE: ${sharedEvidence.name}
CONTENU: ${sharedEvidence.content}

` : ''}
Réponds à ce message de l'utilisateur de manière réaliste et dans ton rôle: "${message}"

Si l'utilisateur te partage des informations très pertinentes pour ton rôle, tu peux partager ton mot-clé: ${npc.keyword}.
Ne partage ton mot-clé que si l'information est vraiment pertinente et correspond aux objectifs de ton rôle.`;

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          model: 'gpt-4o-mini'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la communication avec l'IA");
      }
      
      const aiContent = data.choices[0].message.content.trim();
      
      // Vérifier si le mot-clé est mentionné dans la réponse
      if (aiContent.includes(npc.keyword) && !npc.keywordRevealed) {
        // Mettre à jour le NPC pour révéler son mot-clé
        setNpcs(prev => prev.map(n => 
          n.id === npcId ? { ...n, keywordRevealed: true } : n
        ));
        
        const updatedKeywords = { ...finalKeywords };
        updatedKeywords[npcId] = npc.keyword;
        setFinalKeywords(updatedKeywords);
        
        // Ajouter un message système pour indiquer que le mot-clé a été découvert
        addSystemMessage(`🔑 Vous avez obtenu un mot-clé de ${npc.name}: ${npc.keyword}`);
      }
      
      // Remplacer le message de chargement par la réponse
      setMessages(prev => 
        prev.map(m => m.id === loadingMessageId 
          ? { ...m, content: aiContent } 
          : m
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'interaction avec l'IA:", error);
      
      // Remplacer le message de chargement par un message d'erreur
      setMessages(prev => 
        prev.map(m => m.id === loadingMessageId 
          ? { ...m, content: "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer." } 
          : m
        )
      );
      
      // Afficher l'erreur à l'utilisateur
      addSystemMessage("Une erreur s'est produite lors de la communication avec l'assistant. Veuillez réessayer.");
    }
  };
  
  // Traitement des messages utilisateur
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: userInput,
      timestamp: formatTime(new Date())
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = userInput;
    setUserInput('');
    
    // Si un NPC est sélectionné, lui envoyer le message
    if (selectedNpc) {
      interactWithNPC(selectedNpc.id, currentInput, selectedEvidence?.id);
    } else {
      // Logique par défaut si aucun NPC n'est sélectionné - utiliser le RSSI
      interactWithNPC('rssi', currentInput, selectedEvidence?.id);
    }
  };
  
  // Partager explicitement une preuve avec un NPC
  const shareEvidenceWithNPC = (evidenceId: string, npcId: string) => {
    if (!evidences.find(e => e.id === evidenceId)?.discovered) {
      // Découvrir d'abord la preuve
      handleDiscoverEvidence(evidenceId);
    }
    
    const evidence = evidences.find(e => e.id === evidenceId);
    const npc = npcs.find(n => n.id === npcId);
    
    if (!evidence || !npc) return;
    
    // Message utilisateur indiquant le partage
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: `J'ai trouvé cette preuve qui pourrait vous intéresser: ${evidence.name}`,
      timestamp: formatTime(new Date())
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Envoyer la preuve au NPC
    interactWithNPC(npcId, `Voici une preuve que j'ai trouvée: ${evidence.name}`, evidenceId);
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
        
        // Passer à l'étape suivante
        if (currentStage < stages.length - 1) {
          setCurrentStage(prev => prev + 1);
          addSystemMessage(`Étape ${currentStage + 1} complétée! Passez à l'étape suivante.`);
        } else {
          addSystemMessage("Toutes les étapes ont été complétées! Vous avez reconstitué l'attaque. Collectez maintenant les mots-clés de chaque expert pour résoudre le défi final.");
        }
      }
    }
  };
  
  const handleSelectEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
  };
  
  // Composants pour afficher et interagir avec les PNJ
  const NPCPanel = () => {
    return (
      <div className="mb-6 bg-gray-900/80 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
        <div className="p-3 bg-gray-800/90 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            Équipe d'intervention
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {npcs.map((npc) => (
            <div 
              key={npc.id}
              onClick={() => setSelectedNpc(npc)}
              className={`p-4 rounded-lg border transition-colors duration-200 cursor-pointer relative overflow-hidden ${
                selectedNpc?.id === npc.id 
                  ? 'bg-blue-900/30 border-blue-800 shadow-lg shadow-blue-900/20' 
                  : 'bg-gray-800/80 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start space-x-3 relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-2xl">
                  {npc.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{npc.name}</h3>
                  <p className="text-sm text-blue-400">{npc.role.split(' ')[0]}</p>
                  {npc.keywordRevealed && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-800">
                      <span className="mr-1">•</span> Mot-clé obtenu
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedNpc && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <h3 className="text-md font-semibold mb-2">Objectifs de {selectedNpc.name}:</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              {selectedNpc.objectives.map((obj, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-4 h-4 mr-2 pt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-gray-400 italic">
              {selectedNpc.description}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Affichage du défi final (quand tous les mots-clés sont collectés)
  const FinalChallenge = () => {
    const totalKeywords = npcs.length;
    const collectedKeywords = npcs.filter(npc => npc.keywordRevealed).length;
    
    return (
      <Card className="bg-gray-900/80 border-gray-700 shadow-xl mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-500" />
            Défi final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm text-gray-400 mb-1">Progression</h3>
            <div className="flex items-center space-x-3">
              <Progress value={(collectedKeywords / totalKeywords) * 100} className="h-2" />
              <span className="text-sm font-medium">{collectedKeywords}/{totalKeywords}</span>
            </div>
          </div>
          
          {collectedKeywords === totalKeywords ? (
            <div className="space-y-4">
              <Alert className="bg-green-900/20 border-green-800 text-gray-200">
                <AlertTitle className="text-green-400">Tous les mots-clés collectés !</AlertTitle>
                <AlertDescription>
                  Combinez les mots-clés pour trouver la solution finale.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {npcs.map(npc => (
                  <div key={npc.id} className="bg-gray-800 rounded p-2 text-center border border-gray-700">
                    <div className="text-xs text-gray-400">{npc.name.split(' ')[0]}</div>
                    <div className="font-mono text-green-400 mt-1">{npc.keyword}</div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Entrez la solution finale:</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={finalSolution}
                    onChange={e => setFinalSolution(e.target.value)}
                    placeholder="FIREWALL-DEFENDER-PERIMETER" 
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    className={isSolving ? 'opacity-70' : ''}
                    onClick={() => {
                      setIsSolving(true);
                      // Simuler la vérification
                      setTimeout(() => {
                        const correctSolution = "FIREWALL-DEFENDER-PERIMETER";
                        if (finalSolution.toUpperCase().replace(/\s+/g, '-') === correctSolution) {
                          addSystemMessage("🎉 FÉLICITATIONS! Vous avez réussi à résoudre le défi et sécuriser le système!");
                        } else {
                          addSystemMessage("❌ Solution incorrecte. Vérifiez l'ordre et le format des mots-clés.");
                        }
                        setIsSolving(false);
                      }, 1500);
                    }}
                    disabled={isSolving}
                  >
                    {isSolving ? 'Vérification...' : 'Valider'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Alert className="bg-blue-900/20 border-blue-800">
              <AlertTitle className="text-blue-400">Collectez tous les mots-clés</AlertTitle>
              <AlertDescription>
                Pour débloquer le défi final, vous devez obtenir un mot-clé de chaque membre de l'équipe en leur fournissant les bonnes informations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
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
  
  // Rendu des composants
  
  const renderMessageBubble = (message: Message) => {
    const isRSSI = message.sender === 'rssi';
    const isSystem = message.sender === 'system';
    const isUser = message.sender === 'user';
    const isExpertForensique = message.sender === 'expert_forensique';
    const isResponsableInfra = message.sender === 'responsable_infrastructure';
    
    let avatarText = '';
    let avatarColor = '';
    let bgClass = '';
    let senderName = '';
    
    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <div className="bg-gray-800 border border-gray-600 text-gray-300 rounded-lg py-2 px-4 max-w-[90%] text-sm">
            <Info className="inline-block h-4 w-4 mr-2 text-blue-400" />
            {message.content}
          </div>
        </div>
      );
    } else if (isUser) {
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
    } else {
      // Configurer pour chaque type de PNJ
      if (isRSSI) {
        avatarText = 'AM';
        avatarColor = 'bg-indigo-700';
        bgClass = 'bg-indigo-900/40 border border-indigo-700';
        senderName = 'Alexandre Moreau (RSSI)';
      } else if (isExpertForensique) {
        avatarText = 'SL';
        avatarColor = 'bg-purple-700';
        bgClass = 'bg-purple-900/40 border border-purple-700';
        senderName = 'Sophie Laurent (Forensique)';
      } else if (isResponsableInfra) {
        avatarText = 'TG';
        avatarColor = 'bg-cyan-700';
        bgClass = 'bg-cyan-900/40 border border-cyan-700';
        senderName = 'Thomas Garcia (Infrastructure)';
      }
      
      return (
        <div key={message.id} className="flex mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className={`${avatarColor} text-white`}>{avatarText}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-xs text-gray-400 mb-1">{senderName}</p>
            <div className={`${bgClass} text-white rounded-lg py-2 px-4 max-w-[80%]`}>
              {message.content}
            </div>
            <span className="text-xs text-gray-400 mt-1">{message.timestamp}</span>
          </div>
        </div>
      );
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
  
  const renderEvidenceDetails = () => {
    if (!selectedEvidence) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Sélectionnez une preuve pour l'examiner</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">{selectedEvidence.name}</h3>
            <p className="text-sm text-gray-400">Type: {selectedEvidence.type}</p>
          </div>
          
          {selectedEvidence.relevantFor && (
            <div className="flex space-x-1">
              {npcs.filter(npc => selectedEvidence.relevantFor?.includes(npc.id)).map(npc => (
                <TooltipProvider key={npc.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => shareEvidenceWithNPC(selectedEvidence.id, npc.id)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        {npc.name.split(' ')[0]}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Partager avec {npc.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 border border-gray-700 rounded-lg p-3 bg-gray-950/50 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{selectedEvidence.content}</pre>
        </ScrollArea>
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
        
        <NPCPanel />
        
        {npcs.filter(npc => npc.keywordRevealed).length > 0 && (
          <FinalChallenge />
        )}
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
              
              <div className="text-sm text-blue-400 bg-blue-900/30 p-3 border border-blue-800 rounded-lg mt-2">
                <p className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Nouveauté : Interagissez avec les membres de l'équipe d'intervention et partagez vos découvertes. Obtenez des mots-clés auprès de chaque spécialiste pour résoudre le défi final.</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setIsTimerRunning(true)}>
                Commencer l'investigation
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link to="/cyber-mode-selection">
                <Button variant="ghost" className="gap-1" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-2xl font-bold ml-4">Escape the Breach</h1>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className={`${selectedNpc ? 
                        selectedNpc.id === 'rssi' ? 'bg-indigo-700' : 
                        selectedNpc.id === 'expert_forensique' ? 'bg-purple-700' :
                        'bg-cyan-700'
                        : 'bg-indigo-700'} text-white`}>
                        {selectedNpc ? 
                          selectedNpc.id === 'rssi' ? 'AM' : 
                          selectedNpc.id === 'expert_forensique' ? 'SL' : 
                          'TG' 
                          : 'AM'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {selectedNpc ? selectedNpc.name : 'Alexandre Moreau'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {selectedNpc ? selectedNpc.role.split(' ')[0] : 'RSSI MC2i Group'}
                      </p>
                    </div>
                  </div>
                  {selectedNpc && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedNpc(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Retour
                    </Button>
                  )}
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
                <div className="space-y-2">
                  {messages.filter(m => 
                    !selectedNpc || 
                    m.sender === 'user' || 
                    m.sender === 'system' || 
                    m.sender === selectedNpc.id
                  ).map(message => renderMessageBubble(message))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t border-gray-700">
                <div className="flex">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${selectedNpc ? selectedNpc.name.split(' ')[0] : 'Alexandre'}...`}
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
                </TabsContent>
                
                <TabsContent value="evidence" className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="h-full overflow-y-auto">
                    <h3 className="text-lg font-medium mb-3">Preuves disponibles</h3>
                    <div className="space-y-2">
                      {evidences.map(evidence => renderEvidenceItem(evidence))}
                    </div>
                  </div>
                  
                  <div className="h-full bg-gray-900/50 rounded-lg border border-gray-700">
                    {renderEvidenceDetails()}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Détails du scénario</h3>
                      <Card className="bg-gray-900/50 border-gray-700">
                        <CardContent className="pt-6">
                          <p className="mb-4">Vous êtes un analyste en cybersécurité travaillant pour MC2i Group. À 5h du matin, vous recevez un appel urgent vous informant que plusieurs serveurs de l'entreprise ont été compromise et que des messages de rançon sont apparus sur les écrans des employés.</p>
                          <p className="mb-4">Votre mission est de mener l'investigation numérique pour comprendre comment l'attaque s'est produite, quels systèmes ont été compromis, et quelles données ont potentiellement été volées.</p>
                          <p>En collaboration avec l'équipe d'intervention (RSSI, expert forensique et responsable infrastructure), vous devez analyser les preuves et reconstituer la chronologie de l'attaque pour éclairer la prise de décision.</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Comment jouer</h3>
                      <ol className="space-y-2 list-decimal list-inside text-gray-300">
                        <li>Examinez les preuves dans l'onglet <strong>Preuves</strong></li>
                        <li>Interagissez avec les membres de l'équipe d'intervention dans l'onglet <strong>Progression</strong></li>
                        <li>Partagez les preuves pertinentes avec chaque spécialiste pour obtenir leur mot-clé</li>
                        <li>Collectez les trois mots-clés pour résoudre le défi final</li>
                        <li>Complétez l'investigation avant la fin du temps imparti</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
                    
          {/* Modales */}
          <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Aide - Escape the Breach</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Conseils pour réussir l'investigation de l'incident
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Par où commencer ?</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                    <li>Examinez les logs système et les alertes pour comprendre quand l'attaque a eu lieu</li>
                    <li>Recherchez des signes d'accès non autorisés dans les journaux d'authentification</li>
                    <li>Analysez les communications suspectes dans les captures réseau</li>
                    <li>Vérifiez les emails suspects qui pourraient avoir servi de vecteur initial</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Interagir avec l'équipe</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                    <li>Chaque membre de l'équipe a des connaissances spécifiques dans son domaine</li>
                    <li>Sélectionnez un expert pour discuter directement avec lui</li>
                    <li>Partagez les preuves pertinentes avec le bon expert pour obtenir son mot-clé</li>
                    <li>Combinaison des mots-clés : ils forment une phrase qui permet de résoudre le défi final</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowHelp(false)}>Fermer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
