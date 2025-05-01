import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, CheckCircle, Check, X, AlertCircle, Send, RefreshCw, ChevronRight, ChevronLeft, Terminal, ShieldAlert, Play, Lock, Code, BookOpen, Fingerprint, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Types pour le module d'apprentissage et ses étapes
interface LearningStep {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'challenge' | 'quiz' | 'scenario' | 'terminal';
  content: string;
  codeExample?: string;
  solution?: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  terminalCommands?: {
    command: string;
    response: string;
    isCorrect: boolean;
  }[];
  scenarioSteps?: {
    type: 'message' | 'action' | 'decision';
    content: string;
    sender?: 'system' | 'user' | 'attacker';
    options?: {
      text: string;
      correct: boolean;
      feedback: string;
    }[];
  }[];
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'defense' | 'offense' | 'analysis' | 'fundamentals' | 'compliance';
  steps: LearningStep[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
  xp: number;
  icon: string;
  color: string;
  tags: string[];
  estimatedTime: string;
}

// Données des modules
const mockModules: { [key: string]: LearningModule } = {
  'cybersecurity-intro': {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Maîtrisez les fondamentaux de la cybersécurité en pratiquant sur des cas réels',
    difficulty: 'beginner',
    category: 'fundamentals',
    tags: ['Débutant', 'Fondamentaux', 'CIA Triad'],
    estimatedTime: '25 min',
    steps: [
      {
        id: 'what-is-cybersecurity',
        title: 'La sécurité numérique',
        type: 'theory',
        content: "# Bienvenue dans le monde de la cybersécurité\n\nLa cybersécurité consiste à protéger les systèmes, réseaux et données contre les attaques numériques. Dans un monde hyper-connecté, cette discipline est devenue cruciale pour tous.\n\n## La triade CIA\n\nLes trois piliers fondamentaux de la cybersécurité sont :\n\n- **Confidentialité** : Seules les personnes autorisées peuvent accéder aux informations\n- **Intégrité** : Les données ne sont pas altérées de façon non autorisée\n- **Disponibilité** : Les systèmes et informations sont accessibles quand nécessaire"
      },
      {
        id: 'password-challenge',
        title: 'Créer un mot de passe fort',
        type: 'practice',
        content: "# Les mots de passe, première ligne de défense\n\nUn mot de passe robuste est essentiel pour protéger vos comptes. Mais comment créer un mot de passe à la fois sécurisé et mémorisable ?\n\n## Exercice pratique\n\nÉcrivez une fonction JavaScript qui vérifie si un mot de passe est suffisamment fort en respectant ces critères :\n- Au moins 8 caractères\n- Au moins une lettre majuscule\n- Au moins un chiffre\n- Au moins un caractère spécial",
        codeExample: `function isStrongPassword(password) {
  // Complétez la fonction pour vérifier si le mot de passe est fort
  // Retournez true si le mot de passe est fort, false sinon
  
  // Votre code ici
  
}

// Testez votre fonction
console.log(isStrongPassword("abc123")); // Devrait afficher: false
console.log(isStrongPassword("Secur1ty!")); // Devrait afficher: true`,
        solution: `function isStrongPassword(password) {
  // Vérifier la longueur minimale de 8 caractères
  if (password.length < 8) {
    return false;
  }
  
  // Vérifier la présence d'au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Vérifier la présence d'au moins un chiffre
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  // Vérifier la présence d'au moins un caractère spécial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }
  
  // Si toutes les conditions sont satisfaites, le mot de passe est fort
  return true;
}

// Tests
console.log(isStrongPassword("abc123")); // false
console.log(isStrongPassword("Secur1ty!")); // true`,
        hint: "N'oubliez pas d'utiliser les expressions régulières pour vérifier les types de caractères."
      },
      {
        id: 'security-scenario',
        title: 'Scénario : Incident de phishing',
        type: 'scenario',
        content: "# Incident de sécurité en entreprise\n\nVous êtes le responsable sécurité d'une entreprise. Un employé vient de recevoir un email suspect qui pourrait être une tentative de phishing. Comment allez-vous gérer cette situation?",
        scenarioSteps: [
          {
            type: 'message',
            sender: 'user',
            content: "Bonjour, je viens de recevoir cet email qui me demande de cliquer sur un lien pour 'mettre à jour mes identifiants'. C'est normal?"
          },
          {
            type: 'message',
            sender: 'system',
            content: "Vous examinez l'email et remarquez plusieurs indices suspects: l'adresse d'expédition ne correspond pas au domaine officiel, il y a des fautes d'orthographe, et le message crée un sentiment d'urgence."
          },
          {
            type: 'decision',
            content: "Quelle devrait être votre première action?",
            options: [
              {
                text: "Demander à l'employé de cliquer sur le lien pour vérifier où il mène",
                correct: false,
                feedback: "Ne jamais cliquer sur un lien suspect! Cela pourrait déclencher un malware ou mener à une page de phishing."
              },
              {
                text: "Isoler l'email et informer tous les employés de cette tentative de phishing",
                correct: true,
                feedback: "Bonne décision! Il est crucial d'empêcher d'autres employés de tomber dans le même piège."
              },
              {
                text: "Ignorer le message, c'est probablement juste du spam",
                correct: false,
                feedback: "Les attaques de phishing doivent toujours être prises au sérieux et documentées."
              }
            ]
          },
          {
            type: 'message',
            sender: 'system',
            content: "Vous alertez l'équipe IT et envoyez un message d'avertissement à tous les employés. Plus tard dans la journée, vous découvrez que trois autres employés ont reçu le même email."
          },
          {
            type: 'decision',
            content: "Quelle mesure à long terme devriez-vous mettre en place?",
            options: [
              {
                text: "Organiser une formation de sensibilisation au phishing pour tous les employés",
                correct: true,
                feedback: "Excellente décision! La formation est l'une des meilleures défenses contre le phishing."
              },
              {
                text: "Bloquer tous les emails externes pour éviter les menaces",
                correct: false,
                feedback: "Cette solution est trop extrême et entraverait les opérations normales de l'entreprise."
              },
              {
                text: "Faire uniquement un rappel par email des bonnes pratiques",
                correct: false,
                feedback: "Un simple email est insuffisant. Une formation interactive sera beaucoup plus efficace."
              }
            ]
          }
        ]
      },
      {
        id: 'terminal-exercise',
        title: 'Commandes de sécurité Linux',
        type: 'terminal',
        content: "# La sécurité via le terminal\n\nLes professionnels de la cybersécurité utilisent souvent les commandes terminal pour des tâches de sécurité. Familiarisez-vous avec quelques commandes essentielles.\n\n## Exercice\n\nUtilisez les commandes Linux appropriées pour résoudre ces défis de sécurité:",
        terminalCommands: [
          {
            command: "ls -la",
            response: "total 32\ndrwxr-xr-x  5 user  staff   160 May  1 10:00 .\ndrwxr-xr-x  3 user  staff    96 May  1 09:58 ..\n-rw-r--r--  1 user  staff     0 May  1 09:59 .hidden_file\n-rw-r--r--  1 user  staff  1024 May  1 09:59 secure_data.txt\n-rw-------  1 root  staff  2048 May  1 09:59 system_config.conf",
            isCorrect: true
          },
          {
            command: "chmod 600 secure_data.txt",
            response: "Permissions modifiées pour secure_data.txt: -rw------- 1 user staff 1024 May 1 09:59 secure_data.txt",
            isCorrect: true
          },
          {
            command: "grep -i password secure_data.txt",
            response: "WARNING: The file may contain sensitive information.\nINFO: No plaintext passwords found.",
            isCorrect: true
          }
        ]
      },
      {
        id: 'cia-quiz',
        title: 'Quiz: Triade CIA',
        type: 'quiz',
        content: "# Testez vos connaissances\n\nVérifions votre compréhension des concepts fondamentaux de la cybersécurité:",
        options: [
          "La triade CIA met l'accent sur la cryptographie, l'infrastructure et l'authentification",
          "La lettre 'A' dans la triade CIA signifie 'Authentification'",
          "La confidentialité et l'intégrité sont deux piliers de la triade CIA",
          "La triade CIA est moins importante pour les petites entreprises"
        ],
        correctAnswer: "La confidentialité et l'intégrité sont deux piliers de la triade CIA"
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    xp: 100,
    icon: '🔐',
    color: 'blue',
  },
  'threat-landscape': {
    id: 'threat-landscape',
    title: 'Panorama des menaces actuelles',
    description: 'Découvrez les principales cybermenaces en analysant des cas d\'attaques réelles',
    difficulty: 'beginner',
    category: 'analysis',
    tags: ['Menaces', 'Veille', 'Attaques'],
    estimatedTime: '35 min',
    steps: [
      {
        id: 'common-threats',
        title: 'Principales menaces cybernétiques',
        type: 'theory',
        content: "# Le paysage actuel des cybermenaces\n\nLe monde de la cybersécurité est en constante évolution, avec de nouvelles menaces qui émergent régulièrement. Comprendre ces menaces est essentiel pour s'en protéger.\n\n## Types d'attaques courants\n\n### Malwares\n- **Ransomware**: Chiffre vos données et demande une rançon\n- **Spyware**: Collecte secrètement vos informations\n- **Trojans**: Se présentent comme des logiciels légitimes\n\n### Attaques réseau\n- **DDoS**: Surcharge les serveurs pour les rendre indisponibles\n- **Man-in-the-Middle**: Intercepte les communications\n\n### Ingénierie sociale\n- **Phishing**: Usurpe l'identité d'entités légitimes\n- **Pretexting**: Crée un scénario pour obtenir des informations"
      },
      {
        id: 'ransomware-scenario',
        title: 'Simulation: Attaque de ransomware',
        type: 'scenario',
        content: "# Répondre à une attaque de ransomware\n\nVotre organisation vient d'être touchée par un ransomware. Des fichiers sont chiffrés et une demande de rançon s'affiche sur les écrans. En tant que responsable sécurité, comment allez-vous gérer cette crise?",
        scenarioSteps: [
          {
            type: 'message',
            sender: 'system',
            content: "ALERTE CRITIQUE: Plusieurs utilisateurs signalent que leurs fichiers sont inaccessibles et qu'un message demandant un paiement en Bitcoin s'affiche sur leur écran."
          },
          {
            type: 'message',
            sender: 'attacker',
            content: "Vos fichiers ont été chiffrés. Envoyez 10 BTC à l'adresse suivante sous 48h pour obtenir la clé de déchiffrement. Passé ce délai, le prix doublera ou vos données seront publiées."
          },
          {
            type: 'decision',
            content: "Quelle devrait être votre première action?",
            options: [
              {
                text: "Payer immédiatement la rançon pour récupérer les données rapidement",
                correct: false,
                feedback: "Le paiement ne garantit pas la récupération des données et encourage les criminels."
              },
              {
                text: "Isoler les systèmes infectés du réseau pour contenir l'infection",
                correct: true,
                feedback: "Excellente décision! Limiter la propagation est la première priorité."
              },
              {
                text: "Redémarrer tous les systèmes pour tenter d'éliminer le malware",
                correct: false,
                feedback: "Le redémarrage ne résoudra pas le problème et pourrait causer la perte d'indices forensiques importants."
              }
            ]
          },
          {
            type: 'message',
            sender: 'system',
            content: "L'analyse préliminaire montre que le ransomware s'est propagé via un email de phishing contenant une pièce jointe malveillante."
          },
          {
            type: 'decision',
            content: "Quelle action recommandez-vous maintenant?",
            options: [
              {
                text: "Restaurer les systèmes à partir des sauvegardes après avoir éradiqué le malware",
                correct: true,
                feedback: "C'est la meilleure approche! Si les sauvegardes sont à jour et non infectées, c'est le moyen le plus sûr de récupérer."
              },
              {
                text: "Tenter de casser le chiffrement vous-même",
                correct: false,
                feedback: "Les algorithmes de chiffrement modernes sont pratiquement impossibles à casser sans la clé."
              },
              {
                text: "Négocier avec les attaquants pour réduire le montant de la rançon",
                correct: false,
                feedback: "Négocier avec des cybercriminels est risqué et ne garantit pas la récupération des données."
              }
            ]
          }
        ]
      },
      {
        id: 'threat-detection',
        title: 'Détection des menaces',
        type: 'practice',
        content: "# Analyser les logs pour détecter les intrusions\n\nLa détection précoce des menaces est cruciale pour minimiser les dommages. Les logs systèmes sont une source précieuse d'informations pour identifier les activités suspectes.\n\n## Exercice pratique\n\nÉcrivez une fonction qui analyse un fichier de logs pour détecter des tentatives de connexion échouées multiples, ce qui pourrait indiquer une attaque par force brute.",
        codeExample: `function detectBruteForce(logs, threshold) {
  // logs: tableau d'entrées de logs au format "date IP action statut"
  // threshold: nombre de tentatives échouées qui déclenche une alerte
  // Retourne un tableau des adresses IP suspectes
  
  // Votre code ici
  
}

// Exemple de logs
const sampleLogs = [
  "2025-04-01 12:30:45 192.168.1.1 LOGIN SUCCESS",
  "2025-04-01 12:31:22 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:31:27 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:31:35 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:32:05 192.168.1.3 LOGIN SUCCESS",
  "2025-04-01 12:33:10 192.168.1.2 LOGIN FAILURE"
];

console.log(detectBruteForce(sampleLogs, 3)); // Devrait afficher: ["192.168.1.2"]`,
        solution: `function detectBruteForce(logs, threshold) {
  // Compteur de tentatives échouées par IP
  const failedAttempts = {};
  
  // Parcourir chaque entrée de log
  for (const log of logs) {
    // Diviser l'entrée de log en éléments
    const [date, time, ip, action, status] = log.split(' ');
    
    // Vérifier si c'est une tentative de connexion échouée
    if (action === 'LOGIN' && status === 'FAILURE') {
      // Incrémenter le compteur pour cette IP
      failedAttempts[ip] = (failedAttempts[ip] || 0) + 1;
    }
  }
  
  // Identifier les IP ayant dépassé le seuil
  const suspiciousIPs = [];
  for (const ip in failedAttempts) {
    if (failedAttempts[ip] >= threshold) {
      suspiciousIPs.push(ip);
    }
  }
  
  return suspiciousIPs;
}

// Exemple de logs
const sampleLogs = [
  "2025-04-01 12:30:45 192.168.1.1 LOGIN SUCCESS",
  "2025-04-01 12:31:22 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:31:27 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:31:35 192.168.1.2 LOGIN FAILURE",
  "2025-04-01 12:32:05 192.168.1.3 LOGIN SUCCESS",
  "2025-04-01 12:33:10 192.168.1.2 LOGIN FAILURE"
];

console.log(detectBruteForce(sampleLogs, 3)); // ["192.168.1.2"]`,
        hint: "Utilisez un objet pour compter les tentatives échouées par adresse IP."
      },
      {
        id: 'threats-quiz',
        title: 'Quiz sur les cybermenaces',
        type: 'quiz',
        content: "# Testez vos connaissances sur les cybermenaces\n\nVoyons si vous pouvez identifier le type d'attaque à partir de sa description:",
        options: [
          "Une attaque qui exploite une vulnérabilité encore inconnue du fabricant est appelée une attaque de canal auxiliaire.",
          "L'hameçonnage ciblé spécifiquement contre des cadres ou personnalités importantes est connu sous le nom de 'whaling'.",
          "Un déni de service distribué (DDoS) implique généralement un seul ordinateur envoyant un grand nombre de requêtes.",
          "Une attaque 'watering hole' consiste à compromettre le système d'approvisionnement en eau d'une organisation."
        ],
        correctAnswer: "L'hameçonnage ciblé spécifiquement contre des cadres ou personnalités importantes est connu sous le nom de 'whaling'."
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    xp: 150,
    icon: '🔍',
    color: 'red',
  },
  'network-security': {
    id: 'network-security',
    title: 'Sécurité des réseaux',
    description: 'Implémentez des défenses réseau efficaces contre les intrusions et les attaques',
    difficulty: 'intermediate',
    category: 'defense',
    tags: ['Firewall', 'IDS/IPS', 'VPN'],
    estimatedTime: '45 min',
    steps: [
      {
        id: 'network-fundamentals',
        title: 'Fondamentaux des réseaux',
        type: 'theory',
        content: "# Bases de la sécurité réseau\n\nLa sécurité des réseaux est essentielle pour protéger les communications et systèmes connectés. Sans mesures de sécurité appropriées, les réseaux sont vulnérables aux intrusions et aux vols de données.\n\n## Concepts clés\n\n- **Segmentation réseau**: Division du réseau en zones isolées\n- **Défense en profondeur**: Multiples couches de sécurité\n- **Principe du moindre privilège**: Limitation des accès au minimum nécessaire\n\n## Technologies essentielles\n\n- **Firewalls**: Filtrent le trafic entrant et sortant\n- **IDS/IPS**: Détectent et préviennent les intrusions\n- **VPN**: Créent des tunnels sécurisés sur les réseaux publics"
      }
    ],
    unlocked: false,
    completed: false,
    progress: 0,
    xp: 200,
    icon: '🌐',
    color: 'green',
  }
};

// Composant pour les avatars de l'interface de scénario
const ScenarioAvatar = ({ sender }: { sender: string }) => {
  if (sender === 'user') {
    return (
      <Avatar className="h-8 w-8 bg-blue-500">
        <Laptop className="h-4 w-4 text-white" />
      </Avatar>
    );
  } else if (sender === 'attacker') {
    return (
      <Avatar className="h-8 w-8 bg-red-600">
        <ShieldAlert className="h-4 w-4 text-white" />
      </Avatar>
    );
  } else {
    return (
      <Avatar className="h-8 w-8 bg-gray-600">
        <Fingerprint className="h-4 w-4 text-white" />
      </Avatar>
    );
  }
};

// Composant pour l'interface de scénario
const ScenarioInterface = ({ 
  steps, 
  onComplete,
  isFuturistic
}: { 
  steps: any[],
  onComplete: (isCorrect: boolean) => void,
  isFuturistic: boolean
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [currentStep, showFeedback]);
  
  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    const correct = steps[currentStep].options[index].correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Si c'est la dernière étape, informer le parent
    if (currentStep === steps.filter(step => step.type === 'decision').length - 1) {
      setTimeout(() => {
        onComplete(correct);
      }, 1500);
    }
  };
  
  const handleNextStep = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setIsCorrect(null);
    
    // Trouver la prochaine étape de décision
    const decisionsOnly = steps.filter(step => step.type === 'decision');
    const currentDecisionIndex = decisionsOnly.findIndex(step => step === steps[currentStep]);
    
    if (currentDecisionIndex < decisionsOnly.length - 1) {
      // Passer à la prochaine décision
      const nextDecisionIndex = steps.findIndex(step => step === decisionsOnly[currentDecisionIndex + 1]);
      setCurrentStep(nextDecisionIndex);
    }
  };
  
  // Filtrer pour n'afficher que les étapes jusqu'à la position actuelle
  const visibleSteps = steps.slice(0, currentStep + 1);
  
  // Mapping des types de messages pour un style approprié
  const getMessageStyle = (type: string, sender: string) => {
    if (type === 'message') {
      if (sender === 'user') {
        return isFuturistic 
          ? 'bg-blue-800/70 border border-blue-600/50 text-white' 
          : 'bg-blue-100 text-blue-900';
      } else if (sender === 'attacker') {
        return isFuturistic 
          ? 'bg-red-900/70 border border-red-600/50 text-white' 
          : 'bg-red-100 text-red-900';
      } else {
        return isFuturistic 
          ? 'bg-gray-800/70 border border-gray-600/50 text-white' 
          : 'bg-gray-100 text-gray-900';
      }
    }
    return isFuturistic 
      ? 'bg-indigo-900/70 border border-indigo-600/50 text-white' 
      : 'bg-indigo-100 text-indigo-900';
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className={`p-4 ${isFuturistic ? 'bg-gray-950/70 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg h-96 overflow-y-auto flex flex-col space-y-3`}>
        {visibleSteps.map((step, index) => (
          <div key={index} className={step.type === 'decision' ? 'space-y-3' : ''}>
            {step.type === 'message' && (
              <div className={`flex items-start space-x-2 ${step.sender === 'user' ? 'justify-end' : ''}`}>
                {step.sender !== 'user' && <ScenarioAvatar sender={step.sender} />}
                <div className={`p-3 rounded-lg ${getMessageStyle(step.type, step.sender)} max-w-[80%]`}>
                  <p className="text-sm">{step.content}</p>
                </div>
                {step.sender === 'user' && <ScenarioAvatar sender={step.sender} />}
              </div>
            )}
            
            {step.type === 'decision' && (
              <div className={`p-4 rounded-lg ${getMessageStyle('decision', 'system')}`}>
                <p className="font-medium mb-3">{step.content}</p>
                <div className="space-y-2">
                  {step.options.map((option: any, optIndex: number) => (
                    <button
                      key={optIndex}
                      className={`w-full text-left p-3 rounded-md text-sm transition-all 
                        ${index === currentStep && (
                          selectedOption === optIndex 
                            ? isCorrect 
                              ? isFuturistic ? 'bg-green-800/70 border border-green-500' : 'bg-green-100 border border-green-500' 
                              : isFuturistic ? 'bg-red-800/70 border border-red-500' : 'bg-red-100 border border-red-500'
                            : isFuturistic ? 'bg-gray-800/80 border border-gray-700 hover:bg-gray-700/80' : 'bg-white border border-gray-300 hover:bg-gray-50'
                        )}
                        ${index !== currentStep && 'opacity-60'}
                      `}
                      onClick={() => index === currentStep && handleOptionSelect(optIndex)}
                      disabled={index !== currentStep || selectedOption !== null}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                
                {showFeedback && index === currentStep && (
                  <div className={`mt-3 p-3 rounded-lg text-sm 
                    ${isCorrect 
                      ? isFuturistic ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800' 
                      : isFuturistic ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                    <div className="flex items-center space-x-2">
                      {isCorrect 
                        ? <Check className="h-4 w-4" /> 
                        : <X className="h-4 w-4" />
                      }
                      <span>{steps[currentStep].options[selectedOption as number].feedback}</span>
                    </div>
                    
                    {isCorrect && currentStep < steps.filter(s => s.type === 'decision').length - 1 && (
                      <Button 
                        onClick={handleNextStep}
                        className={`mt-2 ${isFuturistic ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        size="sm"
                      >
                        Continuer
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Interface de terminal pour les commandes
const TerminalInterface = ({
  commands,
  onComplete,
  isFuturistic
}: {
  commands: any[],
  onComplete: (isCorrect: boolean) => void,
  isFuturistic: boolean
}) => {
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<{command: string, response: string, isCorrect?: boolean}[]>([]);
  const [completedCommands, setCompletedCommands] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Chercher si la commande est reconnue
    const matchedCommand = commands.find(cmd => cmd.command === inputValue.trim());
    
    if (matchedCommand) {
      // Ajouter la commande à l'historique avec sa réponse
      setHistory([...history, { 
        command: inputValue, 
        response: matchedCommand.response,
        isCorrect: matchedCommand.isCorrect
      }]);
      
      // Marquer la commande comme complétée
      if (matchedCommand.isCorrect && !completedCommands.includes(matchedCommand.command)) {
        const newCompleted = [...completedCommands, matchedCommand.command];
        setCompletedCommands(newCompleted);
        
        // Vérifier si toutes les commandes sont complétées
        if (newCompleted.length === commands.filter(cmd => cmd.isCorrect).length) {
          setTimeout(() => {
            onComplete(true);
          }, 1000);
        }
      }
    } else {
      // Commande non reconnue
      setHistory([...history, { 
        command: inputValue, 
        response: "Commande non reconnue. Essayez une autre commande de sécurité Linux.",
      }]);
    }
    
    // Réinitialiser l'input
    setInputValue('');
  };

  return (
    <div className="flex flex-col">
      <div 
        ref={terminalRef}
        className={`p-4 ${isFuturistic ? 'bg-black text-green-400 font-mono' : 'bg-gray-900 text-gray-300 font-mono'} 
          rounded-t-lg h-80 overflow-y-auto`}
      >
        <div className="mb-2 border-b border-gray-700 pb-1">
          {isFuturistic ? '# Terminal sécurisé v3.5.2 #' : '$ Terminal Linux'} 
        </div>
        
        {history.length === 0 && (
          <div className="text-gray-500 mb-2">Entrez des commandes de sécurité Linux pour résoudre les défis...</div>
        )}
        
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            <div className={`${isFuturistic ? 'text-blue-400' : 'text-yellow-300'}`}>
              $ {item.command}
            </div>
            <div className={`whitespace-pre-wrap ${item.isCorrect === false ? 'text-red-400' : ''}`}>
              {item.response}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommand} className="flex items-center">
        <span className={`px-2 py-3 ${isFuturistic ? 'bg-gray-900 text-green-400' : 'bg-gray-800 text-gray-300'}`}>$</span>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`font-mono flex-1 border-0 rounded-none rounded-br-lg ${
            isFuturistic ? 'bg-gray-900 text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0' 
                         : 'bg-gray-800 text-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0'
          }`}
          placeholder="Entrez une commande Linux..."
        />
        <Button 
          type="submit"
          className={`rounded-none rounded-br-lg ${
            isFuturistic ? 'bg-green-700 hover:bg-green-600 text-black' : 'bg-blue-600'
          }`}
        >
          <Terminal className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className={`font-medium ${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}>Progression:</h3>
          <div className="flex space-x-1">
            {commands.filter(cmd => cmd.isCorrect).map((cmd, index) => (
              <div 
                key={index}
                className={`w-3 h-3 rounded-full ${
                  completedCommands.includes(cmd.command) 
                    ? isFuturistic ? 'bg-green-600' : 'bg-green-500'
                    : isFuturistic ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <p className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-600'}`}>
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Utilisez des commandes Linux pour examiner les fichiers, modifier les permissions et rechercher des informations sensibles.
        </p>
      </div>
    </div>
  );
};

// Composant principal pour afficher un module
export default function ModuleDetailPage() {
  const { id } = useParams();
  const params = new URLSearchParams(location.search);
  const moduleId = id || params.get('id') || 'cybersecurity-intro';
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';

  // État pour le module et l'étape actuelle
  const [module, setModule] = useState<LearningModule | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userCode, setUserCode] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Charger les données du module
  useEffect(() => {
    if (mockModules[moduleId]) {
      setModule(mockModules[moduleId]);
      
      // Initialiser le code utilisateur si c'est une étape de pratique
      const firstStep = mockModules[moduleId].steps[0];
      if (firstStep && firstStep.type === 'practice' && firstStep.codeExample) {
        setUserCode(firstStep.codeExample);
      }
    }
  }, [moduleId]);
  
  // Obtenir l'étape actuelle
  const currentStep = module?.steps[currentStepIndex] || null;
  
  // Gérer la complétion d'une étape
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      
      // Mettre à jour la progression du module
      if (module) {
        const progress = Math.round((completedSteps.length + 1) / module.steps.length * 100);
        setModule({
          ...module,
          progress
        });
      }
    }
  };
  
  // Gérer la navigation entre les étapes
  const goToNextStep = () => {
    if (module && currentStepIndex < module.steps.length - 1) {
      // Si c'est une étape de théorie, la marquer comme complétée automatiquement
      if (currentStep?.type === 'theory' && !completedSteps.includes(currentStep.id)) {
        markStepCompleted(currentStep.id);
      }
      
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Initialiser l'étape suivante
      const nextStep = module.steps[currentStepIndex + 1];
      if (nextStep.type === 'practice' && nextStep.codeExample) {
        setUserCode(nextStep.codeExample);
      }
      
      setHasSubmitted(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
    } else {
      // Dernière étape, marquer le module comme terminé
      toast({
        title: "Module terminé!",
        description: `Félicitations! Vous avez gagné ${module.xp} XP en terminant ce module.`,
      });
      
      // Mettre à jour le module comme complété
      setModule({
        ...module,
        completed: true,
        progress: 100
      });
      
      // Rediriger vers la page du playground
      setTimeout(() => {
        setLocation("/playground");
      }, 2000);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      
      // Réinitialiser les états de l'étape précédente
      const prevStep = module?.steps[currentStepIndex - 1];
      if (prevStep?.type === 'practice' && prevStep.codeExample) {
        setUserCode(prevStep.codeExample);
      }
      
      setHasSubmitted(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
    }
  };
  
  // Vérifier le code de pratique
  const checkPracticeCode = () => {
    if (!currentStep || !currentStep.solution) return;
    
    // Dans un cas réel, il faudrait une vérification plus sophistiquée
    // Pour cette démonstration, nous vérifions simplement si certains patterns clés sont présents
    let correct = false;
    
    if (currentStep.id === 'password-challenge') {
      correct = userCode.includes('/[A-Z]/.test') && 
                userCode.includes('/[0-9]/.test') && 
                userCode.includes('password.length') &&
                userCode.includes('/[!@#$%^&*(),.?":{}|<>]/.test');
    } else if (currentStep.id === 'threat-detection') {
      correct = userCode.includes('failedAttempts') && 
                userCode.includes('FAILURE') && 
                userCode.includes('threshold') &&
                userCode.includes('suspiciousIPs');
    }
    
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (correct) {
      // Marquer l'étape comme terminée
      markStepCompleted(currentStep.id);
      
      toast({
        title: "Excellent!",
        description: "Votre solution fonctionne correctement.",
      });
    } else {
      toast({
        title: "Pas tout à fait correct",
        description: "Votre solution ne remplit pas tous les critères. Essayez encore!",
        variant: "destructive"
      });
    }
  };
  
  // Vérifier la réponse du quiz
  const checkQuizAnswer = () => {
    if (!currentStep || !selectedAnswer) return;
    
    const correct = selectedAnswer === currentStep.correctAnswer;
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (correct) {
      // Marquer l'étape comme terminée
      markStepCompleted(currentStep.id);
      
      toast({
        title: "Bonne réponse!",
        description: "Votre réponse est correcte. Bien joué!",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: "Ce n'est pas la bonne réponse. Consultez la théorie et réessayez.",
        variant: "destructive"
      });
    }
  };
  
  // Gérer la complétion d'un scénario
  const handleScenarioComplete = (correct: boolean) => {
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (correct && currentStep) {
      markStepCompleted(currentStep.id);
      
      toast({
        title: "Scénario réussi!",
        description: "Vous avez pris les bonnes décisions et géré la situation avec succès.",
      });
    }
  };
  
  // Gérer la complétion d'un exercice terminal
  const handleTerminalComplete = (correct: boolean) => {
    if (correct && currentStep) {
      markStepCompleted(currentStep.id);
      
      toast({
        title: "Exercice terminal réussi!",
        description: "Vous avez maîtrisé les commandes de sécurité Linux essentielles.",
      });
    }
  };
  
  // Afficher la solution
  const showSolution = () => {
    if (!currentStep || !currentStep.solution) return;
    
    setUserCode(currentStep.solution);
    
    toast({
      title: "Solution affichée",
      description: "Prendre le temps de comprendre cette solution vous aidera à progresser.",
    });
  };
  
  // Afficher un indice
  const showHint = () => {
    if (!currentStep || !currentStep.hint) return;
    
    toast({
      title: "Indice",
      description: currentStep.hint,
    });
  };
  
  // Si le module n'est pas trouvé
  if (!module) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isFuturistic ? 'bg-gradient-to-b from-gray-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Module non trouvé</h1>
          <p className="mb-6">Le module que vous recherchez n'existe pas ou n'est pas disponible.</p>
          <Link href="/playground">
            <Button>Retour au Playground</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Déterminer si le bouton suivant devrait être activé
  const isNextButtonEnabled = () => {
    if (currentStep?.type === 'theory') return true;
    if (hasSubmitted && isCorrect) return true;
    return false;
  };
  
  // Interface principale
  return (
    <div className={`min-h-screen ${isFuturistic ? 'bg-gradient-to-b from-gray-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* En-tête */}
      <header className={`${isFuturistic ? 'bg-gray-900/80 backdrop-blur-md border-b border-blue-900/50' : 'bg-white shadow-sm'} sticky top-0 z-30`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/playground">
              <Button variant="ghost" size="icon">
                <ArrowLeft className={isFuturistic ? 'text-white' : 'text-gray-700'} />
              </Button>
            </Link>
            <div>
              <h1 className={`text-lg font-bold flex items-center ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
                <span className="mr-2">{module.icon}</span>
                {module.title}
                <Badge className={`ml-2 ${
                  module.difficulty === 'beginner' 
                    ? isFuturistic ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800' 
                    : module.difficulty === 'intermediate' 
                      ? isFuturistic ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                      : isFuturistic ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                }`}>
                  {module.difficulty === 'beginner' ? 'Débutant' : 
                   module.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                </Badge>
              </h1>
              <div className="flex items-center text-sm">
                <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'} mr-2`}>
                  Progression: {Math.round((completedSteps.length / module.steps.length) * 100)}%
                </span>
                <Progress value={(completedSteps.length / module.steps.length) * 100} className={`w-32 h-1.5 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-2 py-1 rounded-full flex items-center text-sm ${isFuturistic ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              {module.estimatedTime}
            </div>
            <div className={`px-2 py-1 rounded-full flex items-center text-sm ${isFuturistic ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
              <span className="font-bold mr-1">XP</span> {module.xp}
            </div>
          </div>
        </div>
      </header>
      
      {/* Corps principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Progression des étapes */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-2 hide-scrollbar">
            {module.steps.map((step, index) => (
              <button
                key={step.id}
                className={`flex flex-col items-center justify-center ${
                  completedSteps.includes(step.id)
                    ? isFuturistic ? 'text-green-400' : 'text-green-600' 
                    : index === currentStepIndex
                      ? isFuturistic ? 'text-blue-400' : 'text-blue-600'
                      : isFuturistic ? 'text-gray-500' : 'text-gray-400'
                } transition-colors duration-200`}
                onClick={() => setCurrentStepIndex(index)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  completedSteps.includes(step.id)
                    ? isFuturistic ? 'bg-green-900/60 border border-green-700' : 'bg-green-100 border border-green-200'
                    : index === currentStepIndex
                      ? isFuturistic ? 'bg-blue-900/60 border border-blue-700' : 'bg-blue-100 border border-blue-200'
                      : isFuturistic ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <>
                      {step.type === 'theory' && <BookOpen className="w-5 h-5" />}
                      {step.type === 'practice' && <Code className="w-5 h-5" />}
                      {step.type === 'quiz' && <AlertCircle className="w-5 h-5" />}
                      {step.type === 'scenario' && <Play className="w-5 h-5" />}
                      {step.type === 'terminal' && <Terminal className="w-5 h-5" />}
                    </>
                  )}
                </div>
                <span className="text-xs whitespace-nowrap max-w-[70px] truncate">
                  {step.title.length > 15 ? step.title.substring(0, 15) + '...' : step.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenu de l'étape actuelle */}
        {currentStep && (
          <div className="mb-8">
            <div className={`${isFuturistic ? 'bg-gray-900/80 backdrop-blur-md border border-blue-900/50' : 'bg-white border border-gray-200'} rounded-xl p-6 mb-4`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                  {currentStep.title}
                </h2>
                <Badge className={`${
                  currentStep.type === 'theory' 
                    ? isFuturistic ? 'bg-blue-900/60 text-blue-200' : 'bg-blue-100 text-blue-800'
                    : currentStep.type === 'practice'
                      ? isFuturistic ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-800'
                      : currentStep.type === 'quiz'
                        ? isFuturistic ? 'bg-yellow-900/60 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                        : currentStep.type === 'scenario'
                          ? isFuturistic ? 'bg-green-900/60 text-green-200' : 'bg-green-100 text-green-800'
                          : isFuturistic ? 'bg-red-900/60 text-red-200' : 'bg-red-100 text-red-800'
                }`}>
                  {currentStep.type === 'theory' ? 'Théorie' : 
                   currentStep.type === 'practice' ? 'Pratique' : 
                   currentStep.type === 'quiz' ? 'Quiz' : 
                   currentStep.type === 'scenario' ? 'Scénario' : 'Terminal'}
                </Badge>
              </div>
              
              {/* Contenu en fonction du type d'étape */}
              
              {/* Étape de théorie */}
              {currentStep.type === 'theory' && (
                <div className={`prose max-w-none ${isFuturistic ? 'prose-invert' : ''}`}>
                  <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                </div>
              )}
              
              {/* Étape de pratique (code) */}
              {currentStep.type === 'practice' && (
                <div>
                  <div className={`prose max-w-none mb-6 ${isFuturistic ? 'prose-invert' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList className={`${isFuturistic ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="preview">Résultat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="code">
                      <div className={`relative ${isFuturistic ? 'bg-gray-950 text-gray-300' : 'bg-gray-50 text-gray-800'} p-4 rounded-md font-mono text-sm mb-4 h-64 overflow-y-auto`}>
                        <div className="absolute top-2 right-2 flex space-x-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <textarea
                          className={`w-full h-full bg-transparent resize-none focus:outline-none`}
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className={`${isFuturistic ? 'bg-gray-950 text-gray-300' : 'bg-gray-50 text-gray-800'} p-4 rounded-md font-mono text-sm mb-4 h-64 overflow-y-auto`}>
                        {/* Ici, dans une implémentation plus complète, un interpréteur JS pourrait exécuter le code */}
                        <pre>{userCode}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button 
                      onClick={checkPracticeCode} 
                      disabled={hasSubmitted && isCorrect}
                      className={`${isFuturistic ? 'bg-blue-600 hover:bg-blue-700' : ''} flex-1`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Valider le code
                    </Button>
                    
                    <div className="flex flex-1 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={showHint}
                        className={isFuturistic ? 'border-blue-700 text-blue-300 flex-1' : 'flex-1'}
                        disabled={!currentStep.hint}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Indice
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={showSolution}
                        className={isFuturistic ? 'border-blue-700 text-blue-300 flex-1' : 'flex-1'}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Solution
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quiz */}
              {currentStep.type === 'quiz' && (
                <div>
                  <div className={`prose max-w-none mb-6 ${isFuturistic ? 'prose-invert' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {currentStep.options?.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-4 rounded-md border transition-colors ${
                          selectedAnswer === option
                            ? hasSubmitted
                              ? isCorrect
                                ? isFuturistic ? 'bg-green-900/50 border-green-500 text-green-100' : 'bg-green-100 border-green-500 text-green-800'
                                : isFuturistic ? 'bg-red-900/50 border-red-500 text-red-100' : 'bg-red-100 border-red-500 text-red-800'
                              : isFuturistic ? 'bg-blue-900/30 border-blue-500 text-blue-100' : 'bg-blue-100 border-blue-500 text-blue-800'
                            : isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                        }`}
                        onClick={() => !hasSubmitted && setSelectedAnswer(option)}
                        disabled={hasSubmitted}
                      >
                        <div className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            selectedAnswer === option
                              ? hasSubmitted
                                ? isCorrect
                                  ? isFuturistic ? 'bg-green-700 text-white' : 'bg-green-600 text-white'
                                  : isFuturistic ? 'bg-red-700 text-white' : 'bg-red-600 text-white'
                                : isFuturistic ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                              : isFuturistic ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={checkQuizAnswer} 
                    disabled={!selectedAnswer || (hasSubmitted && isCorrect)}
                    className={isFuturistic ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Vérifier ma réponse
                  </Button>
                </div>
              )}
              
              {/* Scénario interactif */}
              {currentStep.type === 'scenario' && (
                <div>
                  <div className={`prose max-w-none mb-6 ${isFuturistic ? 'prose-invert' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <ScenarioInterface 
                    steps={currentStep.scenarioSteps || []} 
                    onComplete={handleScenarioComplete}
                    isFuturistic={isFuturistic}
                  />
                </div>
              )}
              
              {/* Terminal interactif */}
              {currentStep.type === 'terminal' && (
                <div>
                  <div className={`prose max-w-none mb-6 ${isFuturistic ? 'prose-invert' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <TerminalInterface 
                    commands={currentStep.terminalCommands || []} 
                    onComplete={handleTerminalComplete}
                    isFuturistic={isFuturistic}
                  />
                </div>
              )}
            </div>
            
            {/* Navigation entre les étapes */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep} 
                disabled={currentStepIndex === 0}
                className={`${isFuturistic ? 'border-blue-700 text-blue-300' : ''} flex items-center`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              
              <AnimatePresence>
                {isNextButtonEnabled() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button 
                      onClick={goToNextStep}
                      className={`${isFuturistic ? 'bg-blue-600 hover:bg-blue-700' : ''} flex items-center`}
                    >
                      {currentStepIndex < module.steps.length - 1 ? (
                        <>
                          Suivant
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Terminer le module
                          <CheckCircle className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}