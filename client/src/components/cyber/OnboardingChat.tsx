import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, User, Cpu, Shield, Brain, AlertCircle, Network, Lock, Building } from "lucide-react";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

// Types des messages
type MessageType = 'ai' | 'user' | 'options' | 'avatars' | 'modules' | 'roles' | 'question';

interface Message {
  id: string;
  type: MessageType;
  content: string | React.ReactNode;
  sender?: string;
  avatar?: string;
}

// Étapes du processus d'onboarding
type OnboardingStep = 
  | 'welcome' 
  | 'name' 
  | 'avatar' 
  | 'role' 
  | 'module' 
  | 'difficulty' 
  | 'testing' 
  | 'completed';

// Avatars disponibles
const avatars = [
  { id: 'avatar1', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Felix', fallback: 'A1' },
  { id: 'avatar2', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Sophie', fallback: 'A2' },
  { id: 'avatar3', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex', fallback: 'A3' },
  { id: 'avatar4', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Emma', fallback: 'A4' },
  { id: 'avatar5', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Lucas', fallback: 'A5' },
  { id: 'avatar6', src: 'https://api.dicebear.com/7.x/personas/svg?seed=Olivia', fallback: 'A6' },
];

// Rôles que le joueur peut choisir
const roles = [
  { id: 'analyst', name: 'Analyste Sécurité', description: 'Expert en détection et analyse des menaces', icon: <AlertCircle className="h-6 w-6" /> },
  { id: 'pentester', name: 'Pentesteur', description: 'Spécialiste des tests d\'intrusion et vulnérabilités', icon: <Shield className="h-6 w-6" /> },
  { id: 'ciso', name: 'RSSI / CISO', description: 'Responsable de la stratégie de sécurité', icon: <User className="h-6 w-6" /> },
  { id: 'engineer', name: 'Ingénieur Sécurité', description: 'Conception et implémentation de solutions', icon: <Cpu className="h-6 w-6" /> },
];

// Modules de cybersécurité
const modules = [
  { 
    id: 'crisis', 
    name: 'Gestion de crise cyber', 
    description: 'Apprendre à gérer des incidents majeurs',
    icon: <AlertCircle className="h-8 w-8 text-red-500" />,
  },
  { 
    id: 'gdpr', 
    name: 'Protection des données / RGPD', 
    description: 'Comprendre les obligations légales et les bonnes pratiques',
    icon: <Lock className="h-8 w-8 text-blue-500" />,
  },
  { 
    id: 'phishing', 
    name: 'Ingénierie sociale et phishing', 
    description: 'Détecter et contrer les attaques ciblant l\'humain',
    icon: <User className="h-8 w-8 text-yellow-500" />,
  },
  { 
    id: 'incidents', 
    name: 'Gestion des incidents de sécurité', 
    description: 'Détecter, analyser et répondre aux menaces',
    icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
  },
  { 
    id: 'supply', 
    name: 'Sécurité de la chaîne d\'approvisionnement', 
    description: 'Sécuriser les relations avec les fournisseurs et partenaires',
    icon: <Network className="h-8 w-8 text-green-500" />,
  },
  { 
    id: 'governance', 
    name: 'Stratégie et gouvernance cybersécurité', 
    description: 'Élaborer et piloter une stratégie de sécurité',
    icon: <Building className="h-8 w-8 text-purple-500" />,
  }
];

// Niveaux de difficulté
const difficultyLevels = [
  { id: 'beginner', name: 'Débutant', description: 'Pour les nouveaux dans le domaine de la cybersécurité' },
  { id: 'intermediate', name: 'Intermédiaire', description: 'Pour ceux ayant déjà une expérience en cybersécurité' },
  { id: 'expert', name: 'Expert', description: 'Pour les professionnels expérimentés de la cybersécurité' }
];

// Questions par module et niveau (simplifié pour l'exemple)
const questions = {
  'crisis': {
    'beginner': [
      {
        question: "Quelle est la première étape lors d'un incident de sécurité ?",
        options: [
          "Formater tous les systèmes infectés",
          "Isoler les systèmes affectés",
          "Contacter immédiatement la presse",
          "Payer la rançon rapidement"
        ],
        correct: 1
      },
      {
        question: "Qu'est-ce qu'un plan de réponse aux incidents (IRP) ?",
        options: [
          "Un document définissant les procédures à suivre lors d'incidents",
          "Un logiciel anti-virus avancé",
          "Une police d'assurance contre les cyber-attaques",
          "Un programme de formation des employés"
        ],
        correct: 0
      }
    ],
    'intermediate': [
      {
        question: "Quelle information n'est généralement PAS incluse dans un rapport d'incident initial ?",
        options: [
          "L'heure de détection de l'incident",
          "L'analyse complète des rootkits utilisés",
          "Les systèmes potentiellement affectés",
          "Les actions de confinement immédiates"
        ],
        correct: 1
      },
      {
        question: "Dans un contexte de gestion de crise, qu'est-ce que la 'containment strategy' ?",
        options: [
          "Une stratégie marketing pour limiter l'impact médiatique",
          "L'ensemble des mesures pour isoler et limiter l'étendue de l'incident",
          "Un plan pour centraliser les données sensibles",
          "Une méthode pour containeriser les applications vulnérables"
        ],
        correct: 1
      }
    ],
    'expert': [
      {
        question: "Dans le cadre d'un incident impliquant une APT (Advanced Persistent Threat), quelle approche est généralement recommandée ?",
        options: [
          "Éradiquer immédiatement toutes les traces de l'attaquant",
          "Maintenir un monitoring continu tout en documentant l'activité de l'attaquant",
          "Désactiver tous les systèmes et réinstaller depuis zéro",
          "Migrer immédiatement toutes les données vers un cloud public"
        ],
        correct: 1
      },
      {
        question: "Quelle méthodologie d'investigation numérique privilégie l'ordre de volatilité pour la collecte de preuves ?",
        options: [
          "MITRE ATT&CK",
          "NIST SP 800-61",
          "RFC 3227",
          "ISO 27035"
        ],
        correct: 2
      }
    ]
  },
  // Simplification: pour les autres modules, nous utilisons les mêmes questions
  'gdpr': {
    'beginner': [
      {
        question: "Que signifie l'acronyme RGPD ?",
        options: [
          "Référentiel Général de Protection des Documents",
          "Règlement Général sur la Protection des Données",
          "Registre de Gestion des Procédures Digitales",
          "Réseau Global de Prévention des Dangers"
        ],
        correct: 1
      },
      {
        question: "Qu'est-ce qu'une donnée à caractère personnel selon le RGPD ?",
        options: [
          "Uniquement les noms et adresses des personnes",
          "Toute information se rapportant à une personne identifiée ou identifiable",
          "Seulement les informations sensibles comme les données de santé",
          "Les données chiffrées par l'entreprise"
        ],
        correct: 1
      }
    ],
    'intermediate': [
      {
        question: "Quel est le délai maximum pour notifier une violation de données à l'autorité de contrôle ?",
        options: [
          "24 heures",
          "72 heures",
          "7 jours",
          "30 jours"
        ],
        correct: 1
      },
      {
        question: "Qu'est-ce que le 'Privacy by Design' ?",
        options: [
          "Un label de certification européen",
          "Une fonctionnalité des navigateurs web",
          "L'intégration de la protection des données dès la conception des systèmes",
          "Un mode de confidentialité pour les applications mobiles"
        ],
        correct: 2
      }
    ],
    'expert': [
      {
        question: "Dans le cadre d'un transfert international de données hors UE, quelle mesure n'est PAS considérée comme une garantie appropriée ?",
        options: [
          "Les clauses contractuelles types adoptées par la Commission",
          "Un code de conduite approuvé assorti d'engagements contraignants",
          "Une certification générale de conformité ISO 27001",
          "Les règles d'entreprise contraignantes (BCR)"
        ],
        correct: 2
      },
      {
        question: "Concernant l'analyse d'impact relative à la protection des données (AIPD/DPIA), laquelle de ces affirmations est correcte ?",
        options: [
          "Elle est obligatoire pour tout traitement impliquant des données personnelles",
          "Elle doit être réalisée uniquement quand le traitement est susceptible d'engendrer un risque élevé",
          "Elle doit être renouvelée tous les 6 mois",
          "Elle remplace l'obligation de tenir un registre des traitements"
        ],
        correct: 1
      }
    ]
  },
  'phishing': {
    'beginner': [
      {
        question: "Qu'est-ce que le phishing ?",
        options: [
          "Une technique de piratage des mots de passe par force brute",
          "Une technique d'usurpation d'identité pour obtenir des informations",
          "Un virus informatique qui chiffre les données",
          "Une méthode de sécurisation des emails"
        ],
        correct: 1
      },
      {
        question: "Lequel de ces éléments est un signe d'alerte typique d'un email de phishing ?",
        options: [
          "L'email est envoyé durant les heures de bureau",
          "L'email contient le logo officiel de l'entreprise",
          "L'email crée un sentiment d'urgence inhabituel",
          "L'email est signé par un responsable de l'entreprise"
        ],
        correct: 2
      }
    ],
    'intermediate': [
      {
        question: "Qu'est-ce que le spear phishing ?",
        options: [
          "Une attaque de phishing ciblant une organisation spécifique",
          "Une attaque de phishing personnalisée visant un individu spécifique",
          "Une technique de phishing utilisant exclusivement des SMS",
          "Un phishing réalisé via des applications de messagerie instantanée"
        ],
        correct: 1
      },
      {
        question: "Quelle technique d'ingénierie sociale consiste à fouiller les poubelles pour obtenir des informations ?",
        options: [
          "Dumpster diving",
          "Tailgating",
          "Baiting",
          "Pretexting"
        ],
        correct: 0
      }
    ],
    'expert': [
      {
        question: "Dans une campagne d'attaque BEC (Business Email Compromise), quelle technique est souvent utilisée ?",
        options: [
          "L'envoi massif d'emails avec des pièces jointes infectées",
          "L'usurpation d'identité d'un cadre supérieur pour demander un transfert financier",
          "Le déni de service des serveurs de messagerie",
          "L'injection SQL dans les formulaires web"
        ],
        correct: 1
      },
      {
        question: "Quelle méthode d'authentification est la plus efficace contre les attaques de phishing visant à voler des identifiants ?",
        options: [
          "Les mots de passe complexes et régulièrement changés",
          "L'authentification basée sur les SMS",
          "L'authentification par email secondaire",
          "L'authentification avec clé physique FIDO2/WebAuthn"
        ],
        correct: 3
      }
    ]
  },
  'incidents': {
    'beginner': [
      {
        question: "Qu'est-ce qu'un SOC dans le contexte de la cybersécurité ?",
        options: [
          "Système d'Organisation Cryptographique",
          "Centre Opérationnel de Sécurité",
          "Service Opérationnel de Crise",
          "Système d'Observation des Cyberattaques"
        ],
        correct: 1
      },
      {
        question: "Quelle est l'utilité principale d'un SIEM ?",
        options: [
          "Protéger le réseau contre les intrusions",
          "Chiffrer les communications sensibles",
          "Collecter et analyser les logs de sécurité",
          "Sécuriser les bases de données"
        ],
        correct: 2
      }
    ],
    'intermediate': [
      {
        question: "Qu'est-ce que le 'dwell time' dans le contexte des incidents de sécurité ?",
        options: [
          "Le temps nécessaire pour restaurer les systèmes après un incident",
          "Le temps pendant lequel un attaquant reste non détecté dans un réseau",
          "La durée d'une attaque par déni de service",
          "Le délai entre la détection et la résolution d'un incident"
        ],
        correct: 1
      },
      {
        question: "Quelle technique est souvent utilisée pour la priorisation des incidents de sécurité ?",
        options: [
          "FIFO (First In, First Out)",
          "Scoring basé sur la criticité des actifs et la sévérité de la menace",
          "Traitement aléatoire pour éviter les biais",
          "Analyse manuelle de chaque alerte"
        ],
        correct: 1
      }
    ],
    'expert': [
      {
        question: "Dans le contexte de la traque des menaces (Threat Hunting), quelle approche est considérée comme la plus proactive ?",
        options: [
          "L'analyse des alertes du SIEM",
          "La recherche basée sur des hypothèses (hypothesis-based hunting)",
          "L'attente de signalements des utilisateurs",
          "L'analyse post-incident"
        ],
        correct: 1
      },
      {
        question: "Quelle technique permet de regrouper des alertes apparemment disparates en un incident cohérent ?",
        options: [
          "La corrélation d'événements",
          "La déduplication d'alertes",
          "Le filtrage par seuil",
          "La normalisation des logs"
        ],
        correct: 0
      }
    ]
  },
  'supply': {
    'beginner': [
      {
        question: "Qu'est-ce que la sécurité de la chaîne d'approvisionnement en cybersécurité ?",
        options: [
          "La protection physique des entrepôts et centres de distribution",
          "La sécurisation des processus et relations impliquant des fournisseurs et partenaires technologiques",
          "L'évaluation des risques financiers liés aux fournisseurs",
          "La gestion des stocks de matériel informatique"
        ],
        correct: 1
      },
      {
        question: "Pourquoi les attaques contre la chaîne d'approvisionnement sont-elles particulièrement dangereuses ?",
        options: [
          "Elles sont faciles à détecter",
          "Elles n'affectent que les petites entreprises",
          "Elles peuvent compromettre de nombreuses organisations à travers un seul point d'entrée",
          "Elles sont moins sophistiquées que les autres types d'attaques"
        ],
        correct: 2
      }
    ],
    'intermediate': [
      {
        question: "Quelle célèbre attaque de 2020 illustre parfaitement les risques liés à la chaîne d'approvisionnement ?",
        options: [
          "L'attaque WannaCry",
          "La fuite de données Equifax",
          "La compromission SolarWinds",
          "L'attaque NotPetya"
        ],
        correct: 2
      },
      {
        question: "Quelle pratique aide à atténuer les risques liés à la chaîne d'approvisionnement logicielle ?",
        options: [
          "Utiliser uniquement des logiciels développés en interne",
          "Installer toutes les mises à jour immédiatement sans tests",
          "Vérifier l'intégrité des packages et l'authenticité des sources",
          "Désactiver les contrôles d'accès pour faciliter les intégrations"
        ],
        correct: 2
      }
    ],
    'expert': [
      {
        question: "Quelle approche est recommandée pour la gestion des vulnérabilités dans les composants tiers ?",
        options: [
          "Maintenir un inventaire à jour et suivre les vulnérabilités avec un SBOM (Software Bill of Materials)",
          "Faire confiance aux fournisseurs pour signaler les vulnérabilités",
          "Tester uniquement les composants principaux pour gagner du temps",
          "Attendre les rapports publics de vulnérabilités avant d'agir"
        ],
        correct: 0
      },
      {
        question: "Dans le contexte des évaluations de sécurité des fournisseurs, qu'est-ce que le 'right to audit' ?",
        options: [
          "Le droit du fournisseur à auditer vos systèmes",
          "Une clause contractuelle permettant d'évaluer la sécurité du fournisseur",
          "Un framework d'audit spécifique aux chaînes d'approvisionnement",
          "Une certification délivrée par un organisme tiers"
        ],
        correct: 1
      }
    ]
  },
  'governance': {
    'beginner': [
      {
        question: "Quelle est la principale responsabilité d'un RSSI (CISO) ?",
        options: [
          "Développer des logiciels sécurisés",
          "Définir et superviser la stratégie de sécurité de l'information",
          "Réparer les ordinateurs infectés par des virus",
          "Gérer les infrastructures cloud"
        ],
        correct: 1
      },
      {
        question: "Qu'est-ce qu'une politique de sécurité de l'information ?",
        options: [
          "Un logiciel anti-virus",
          "Un ensemble de règles définissant la protection des informations",
          "Une loi gouvernementale sur la cybersécurité",
          "Un firewall avancé"
        ],
        correct: 1
      }
    ],
    'intermediate': [
      {
        question: "Selon la norme ISO 27001, quel est l'élément central du système de management de la sécurité de l'information ?",
        options: [
          "Les contrôles techniques",
          "L'approche basée sur les risques",
          "La certification obligatoire",
          "Les audits externes"
        ],
        correct: 1
      },
      {
        question: "Qu'est-ce que le 'risk appetite' (appétence au risque) dans le contexte de la gouvernance cybersécurité ?",
        options: [
          "La tendance des employés à prendre des risques",
          "Le niveau de risque qu'une organisation est prête à accepter",
          "La fréquence des audits de sécurité",
          "Le budget alloué à la cybersécurité"
        ],
        correct: 1
      }
    ],
    'expert': [
      {
        question: "Quelle est la différence fondamentale entre la gouvernance et la gestion en matière de cybersécurité ?",
        options: [
          "La gouvernance définit la direction et les objectifs, la gestion les met en œuvre",
          "La gouvernance concerne les aspects techniques, la gestion les aspects humains",
          "La gouvernance est réservée aux grandes entreprises, la gestion aux PME",
          "La gouvernance est obligatoire, la gestion est facultative"
        ],
        correct: 0
      },
      {
        question: "Dans le cadre d'une gouvernance Zero Trust, quel principe est fondamental ?",
        options: [
          "Faire confiance à tous les utilisateurs internes par défaut",
          "Vérifier uniquement les connexions externes",
          "Vérifier systématiquement chaque accès, quelle que soit la source",
          "Imposer l'authentification uniquement pour les applications critiques"
        ],
        correct: 2
      }
    ]
  }
};

const OnboardingChat: React.FC = () => {
  const [_, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [playerData, setPlayerData] = useState({
    name: '',
    avatar: '',
    role: '',
    module: '',
    difficulty: '',
    testAnswers: [] as { questionIndex: number; answer: number; correct: boolean }[],
    currentQuestionIndex: 0,
    testCompleted: false
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Vérifier si l'utilisateur souhaite réinitialiser ou effectuer à nouveau l'onboarding
  useEffect(() => {
    // Récupérer le paramètre URL 'reset' s'il existe
    const params = new URLSearchParams(window.location.search);
    const resetParam = params.get('reset');
    
    // Si le paramètre reset est présent, supprimer les données d'onboarding
    if (resetParam === 'true') {
      localStorage.removeItem('cyberPlayerData');
      return;
    }
    
    // Vérifier si l'utilisateur a déjà complété l'onboarding
    const savedData = localStorage.getItem('cyberPlayerData');
    
    // Si l'utilisateur a déjà complété l'onboarding, passer directement à la page principale
    if (savedData) {
      const playerData = JSON.parse(savedData);
      if (playerData.onboardingComplete) {
        // Rediriger directement vers la page principale
        navigate('/cyber');
        return;
      }
    }
    
    // Sinon, afficher le message d'accueil
    if (messages.length === 0) {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Bonjour et bienvenue dans I AM CYBER ! Je suis votre assistant d'intégration, et je vais vous guider à travers la configuration de votre profil. Commençons par le plus important.

Comment puis-je vous appeler ?`,
        sender: 'I AM CYBER',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IAMCYBER'
      });
      setCurrentStep('name');
    }
  }, [messages.length, navigate]);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Générer un ID unique pour chaque message
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Ajouter un nouveau message à la conversation
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Gérer la soumission de l'entrée utilisateur
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    addMessage({
      id: generateId(),
      type: 'user',
      content: input,
    });

    // Traiter la réponse en fonction de l'étape actuelle
    processUserInput(input);
    
    // Réinitialiser l'entrée
    setInput('');
  };

  // Traiter l'entrée de l'utilisateur en fonction de l'étape actuelle
  const processUserInput = (userInput: string) => {
    switch (currentStep) {
      case 'name':
        handleNameInput(userInput);
        break;
      case 'avatar':
        // Ne se produira pas car nous utilisons des boutons pour l'avatar
        break;
      case 'role':
        // Ne se produira pas car nous utilisons des boutons pour le rôle
        break;
      case 'module':
        // Ne se produira pas car nous utilisons des boutons pour le module
        break;
      case 'difficulty':
        // Ne se produira pas car nous utilisons des boutons pour la difficulté
        break;
      case 'testing':
        // Ne se produira pas car nous utilisons des boutons pour les réponses aux questions
        break;
      default:
        // Message générique pour toute autre entrée
        setTimeout(() => {
          addMessage({
            id: generateId(),
            type: 'ai',
            content: "Je ne suis pas sûr de comprendre. Merci de suivre les instructions à l'écran.",
            sender: 'I AM CYBER',
            avatar: '/avatars/ai-assistant.png'
          });
        }, 500);
        break;
    }
  };

  // Gérer l'entrée du nom
  const handleNameInput = (name: string) => {
    setPlayerData({ ...playerData, name });
    
    setTimeout(() => {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Ravi de faire votre connaissance, ${name}! Maintenant, choisissez un avatar qui vous représentera pendant votre formation.`,
        sender: 'I AM CYBER',
        avatar: '/avatars/ai-assistant.png'
      });

      // Afficher les options d'avatar
      addMessage({
        id: generateId(),
        type: 'avatars',
        content: 'Choisissez votre avatar',
      });

      setCurrentStep('avatar');
    }, 800);
  };

  // Gérer la sélection d'avatar
  const handleAvatarSelection = (avatarId: string) => {
    setPlayerData({ ...playerData, avatar: avatarId });
    
    setTimeout(() => {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Excellent choix ! Maintenant, quel rôle aimeriez-vous incarner durant votre formation en cybersécurité ?`,
        sender: 'I AM CYBER',
        avatar: '/avatars/ai-assistant.png'
      });

      // Afficher les options de rôle
      addMessage({
        id: generateId(),
        type: 'roles',
        content: 'Choisissez votre rôle',
      });

      setCurrentStep('role');
    }, 800);
  };

  // Gérer la sélection de rôle
  const handleRoleSelection = (roleId: string) => {
    const selectedRole = roles.find(r => r.id === roleId);
    setPlayerData({ ...playerData, role: roleId });
    
    setTimeout(() => {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Vous avez choisi de devenir un ${selectedRole?.name}. Une excellente décision ! Maintenant, quel module de formation souhaitez-vous explorer ?`,
        sender: 'I AM CYBER',
        avatar: '/avatars/ai-assistant.png'
      });

      // Afficher les options de module
      addMessage({
        id: generateId(),
        type: 'modules',
        content: 'Choisissez votre module',
      });

      setCurrentStep('module');
    }, 800);
  };

  // Gérer la sélection de module
  const handleModuleSelection = (moduleId: string) => {
    const selectedModule = modules.find(m => m.id === moduleId);
    setPlayerData({ ...playerData, module: moduleId });
    
    setTimeout(() => {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Vous avez choisi le module "${selectedModule?.name}". Parfait ! Maintenant, quel niveau de difficulté souhaitez-vous ?`,
        sender: 'I AM CYBER',
        avatar: '/avatars/ai-assistant.png'
      });

      // Afficher les options de difficulté
      addMessage({
        id: generateId(),
        type: 'options',
        content: 'Choisissez la difficulté',
      });

      setCurrentStep('difficulty');
    }, 800);
  };

  // Gérer la sélection de difficulté
  const handleDifficultySelection = (difficultyId: string) => {
    setPlayerData({ ...playerData, difficulty: difficultyId });
    
    setTimeout(() => {
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `Excellent ! Avant de commencer votre formation, nous allons évaluer votre niveau actuel en ${modules.find(m => m.id === playerData.module)?.name} avec quelques questions.

Êtes-vous prêt(e) à commencer l'évaluation ?`,
        sender: 'I AM CYBER',
        avatar: '/avatars/ai-assistant.png'
      });

      // Boutons Oui/Non pour commencer l'évaluation
      addMessage({
        id: generateId(),
        type: 'options',
        content: 'start_test',
      });

      setCurrentStep('testing');
    }, 800);
  };

  // Commencer le test
  const startTest = () => {
    // Difficulté pour le test basée sur la sélection de l'utilisateur
    const difficultyMap: {[key: string]: string} = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'expert': 'expert'
    };
    
    const difficultyKey = difficultyMap[playerData.difficulty];
    const moduleId = playerData.module;
    
    // Préparer la première question
    const moduleQuestions = questions[moduleId as keyof typeof questions][difficultyKey as keyof typeof questions[keyof typeof questions]];
    
    if (moduleQuestions && moduleQuestions.length > 0) {
      const firstQuestion = moduleQuestions[0];
      
      setTimeout(() => {
        addMessage({
          id: generateId(),
          type: 'ai',
          content: `Question 1/${moduleQuestions.length}: ${firstQuestion.question}`,
          sender: 'I AM CYBER',
          avatar: '/avatars/ai-assistant.png'
        });

        // Afficher les options de réponse
        addMessage({
          id: generateId(),
          type: 'question',
          content: JSON.stringify({
            questionIndex: 0,
            options: firstQuestion.options
          }),
        });
      }, 800);
    }
  };

  // Gérer la réponse à une question
  const handleAnswerQuestion = (questionIndex: number, answerIndex: number) => {
    // Difficulté pour le test basée sur la sélection de l'utilisateur
    const difficultyMap: {[key: string]: string} = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'expert': 'expert'
    };
    
    const difficultyKey = difficultyMap[playerData.difficulty];
    const moduleId = playerData.module;
    
    // Obtenir la question actuelle
    const moduleQuestions = questions[moduleId as keyof typeof questions][difficultyKey as keyof typeof questions[keyof typeof questions]];
    const currentQuestion = moduleQuestions[questionIndex];
    
    // Vérifier si la réponse est correcte
    const isCorrect = answerIndex === currentQuestion.correct;
    
    // Ajouter la réponse au tableau des réponses
    const updatedAnswers = [
      ...playerData.testAnswers,
      { questionIndex, answer: answerIndex, correct: isCorrect }
    ];
    
    // Mettre à jour les données du joueur
    setPlayerData({
      ...playerData,
      testAnswers: updatedAnswers,
      currentQuestionIndex: questionIndex + 1
    });
    
    // Réponse de l'assistant avec explications détaillées selon la question
    setTimeout(() => {
      // Préparation des explications pédagogiques
      let explanation = "";
      
      // Explications personnalisées selon le module et la question
      if (moduleId === 'crisis') {
        if (questionIndex === 0) { // Première question sur la gestion de crise
          if (isCorrect) {
            explanation = `Excellente réponse ! L'isolation des systèmes affectés est cruciale pour contenir la propagation d'une menace. 

🔍 En détail:
• C'est une approche de confinement qui limite la portée de l'incident
• Ce principe est recommandé par l'ANSSI et le NIST SP 800-61
• En isolant rapidement, vous préservez les preuves numériques pour l'analyse ultérieure

📚 Pour approfondir: Consultez le "Guide d'hygiène informatique" de l'ANSSI ou le cadre de réponse aux incidents NIST.`;
          } else {
            explanation = `La bonne réponse était : "Isoler les systèmes affectés".

🔍 Pourquoi c'est important:
• Formater les systèmes détruirait des preuves essentielles
• Contacter la presse prématurément peut nuire à la réputation
• Payer une rançon est généralement déconseillé par les autorités

📚 Pour approfondir: Consultez le guide "Computer Security Incident Handling Guide" (NIST SP 800-61) qui détaille ces principes.`;
          }
        } else { // Autres questions du module crise
          if (isCorrect) {
            explanation = `Très bonne réponse !

Ressources complémentaires:
• ANSSI: "Organisation de la réponse aux incidents de sécurité"
• ISO/IEC 27035: Norme de gestion des incidents de sécurité
• CERT-FR: Bulletins et recommandations sur les incidents majeurs`;
          } else {
            explanation = `La bonne réponse était : "${currentQuestion.options[currentQuestion.correct]}".

Ressources utiles pour mieux comprendre ce concept:
• "Computer Security Incident Handling Guide" du NIST
• Framework de réponse aux incidents du SANS Institute
• Les webinaires de CyberPeace Institute sur la gestion de crise`;
          }
        }
      } else if (moduleId === 'gdpr') {
        if (isCorrect) {
          explanation = `Excellente connaissance du RGPD !

Pour approfondir:
• Site de la CNIL: guides pratiques et recommandations
• EUR-Lex: texte intégral du RGPD (Règlement 2016/679)
• EDPB (European Data Protection Board): lignes directrices actualisées`;
        } else {
          explanation = `La bonne réponse était : "${currentQuestion.options[currentQuestion.correct]}".

Pour mieux comprendre:
• Le site de la CNIL propose des explications accessibles sur ce point
• L'article concerné du RGPD aborde cette question en détail
• Le MOOC de la CNIL sur le RGPD couvre ce sujet dans le module 3`;
        }
      } else {
        // Explications génériques pour les autres modules
        if (isCorrect) {
          explanation = `Excellente réponse ! Vous maîtrisez bien ce concept.

Pour approfondir vos connaissances sur ce sujet:
• Les publications de l'ANSSI fournissent des guides détaillés
• La plateforme OpenClassrooms propose des modules complémentaires 
• Les forums comme r/cybersecurity offrent des discussions de cas réels`;
        } else {
          explanation = `La bonne réponse était : "${currentQuestion.options[currentQuestion.correct]}".

Pour mieux comprendre:
• Cette notion est expliquée en détail dans plusieurs ressources comme CyberEDU
• Le MOOC SecNumAcadémie de l'ANSSI couvre ce concept dans son module 2
• Le livre "Cybersecurity Blue Team Toolkit" de Nadean Tanner traite ce sujet en profondeur`;
        }
      }
      
      // Envoi du message avec l'explication
      addMessage({
        id: generateId(),
        type: 'ai',
        content: explanation,
        sender: 'I AM CYBER',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IAMCYBER'
      });
      
      // Vérifier s'il reste des questions (maximum 4 questions)
      const maxQuestions = Math.min(moduleQuestions.length, 4);
      if (questionIndex + 1 < maxQuestions) {
        // Prochaine question
        const nextQuestion = moduleQuestions[questionIndex + 1];
        
        setTimeout(() => {
          addMessage({
            id: generateId(),
            type: 'ai',
            content: `Question ${questionIndex + 2}/${maxQuestions}: ${nextQuestion.question}`,
            sender: 'I AM CYBER',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IAMCYBER'
          });
  
          // Afficher les options de réponse
          addMessage({
            id: generateId(),
            type: 'question',
            content: JSON.stringify({
              questionIndex: questionIndex + 1,
              options: nextQuestion.options
            }),
          });
        }, 2000);
      } else {
        // Test terminé - ajouter un message de transition
        setTimeout(() => {
          addMessage({
            id: generateId(),
            type: 'ai',
            content: "Félicitations ! Vous avez terminé l'évaluation. Je vais maintenant analyser vos réponses pour déterminer votre niveau et vous fournir des ressources personnalisées...",
            sender: 'I AM CYBER',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IAMCYBER'
          });
          
          // Démarrer l'animation de "chargement"
          setTimeout(() => {
            completeTest();
          }, 1500);
        }, 1500);
      }
    }, 800);
  };

  // Terminer le test et passer à l'étape suivante
  const completeTest = async () => {
    // Calculer le score
    const correctAnswers = playerData.testAnswers.filter(answer => answer.correct).length;
    const totalQuestions = playerData.testAnswers.length;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    
    // Déterminer le niveau final
    let level;
    if (playerData.difficulty === 'expert') {
      level = scorePercentage >= 50 ? "Expert" : "Intermédiaire";
    } else if (playerData.difficulty === 'intermediate') {
      if (scorePercentage >= 75) level = "Expert";
      else if (scorePercentage >= 40) level = "Intermédiaire";
      else level = "Débutant";
    } else {
      level = scorePercentage >= 75 ? "Intermédiaire" : "Débutant";
    }
    
    // Mettre à jour l'état du niveau final
    setFinalLevel(level);
    
    setTimeout(() => {
      // Message de fin d'évaluation avec conseils personnalisés selon le niveau
      let feedbackMessage = '';
      
      if (level === "Expert") {
        feedbackMessage = `Félicitations ! Vous avez démontré une excellente compréhension de la ${modules.find(m => m.id === playerData.module)?.name}.

Votre score de ${Math.round(scorePercentage)}% révèle un niveau de connaissances avancé. Pour les experts comme vous, je recommande :
• Approfondir vos connaissances en consultant les dernières publications de l'ANSSI et du NIST
• Explorer des certifications comme CISSP ou OSCP si ce n'est pas déjà fait
• Participer à des war games et CTF pour affiner vos compétences pratiques

En fonction de votre expertise, vous serez confronté à des scénarios complexes qui mettront vraiment au défi vos compétences.`;
      } else if (level === "Intermédiaire") {
        feedbackMessage = `Bravo ! Vous avez démontré une bonne maîtrise des concepts de la ${modules.find(m => m.id === playerData.module)?.name}.

Votre score de ${Math.round(scorePercentage)}% révèle un niveau de connaissances solide. Voici quelques recommandations pour progresser :
• Consultez les ressources de base de l'ANSSI et du NIST pour renforcer vos connaissances
• Considérez des certifications comme Security+ ou SSCP pour structurer votre apprentissage
• Pratiquez régulièrement sur des plateformes comme TryHackMe ou HackTheBox

À votre niveau, vous recevrez des missions avec un bon équilibre entre challenge et accompagnement.`;
      } else {
        feedbackMessage = `Bienvenue dans le monde de la cybersécurité ! Vous faites vos premiers pas dans la ${modules.find(m => m.id === playerData.module)?.name}.

Votre score de ${Math.round(scorePercentage)}% reflète un niveau débutant, mais ne vous inquiétez pas ! Voici des ressources pour progresser :
• Commencez par les guides de l'ANSSI pour le grand public
• Explorez les fondamentaux sur des sites comme CyberIni ou OpenClassrooms
• Familiarisez-vous avec les concepts de base en consultant des chaînes YouTube comme Micode ou Underscore_

Vous recevrez des missions adaptées qui vous permettront d'apprendre progressivement tout en restant motivé.`;
      }
      
      addMessage({
        id: generateId(),
        type: 'ai',
        content: `${feedbackMessage}

Je vais maintenant vous connecter à Isabelle Dubacq, la Directrice des Ressources Humaines, qui vous présentera votre premier défi. Elle a déjà été informée de votre profil, de vos compétences en ${roles.find(r => r.id === playerData.role)?.name} et de votre niveau d'expertise.`,
        sender: 'I AM CYBER',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IAMCYBER'
      });
      
      // Mettre à jour l'état pour indiquer que le test est terminé
      setPlayerData({
        ...playerData,
        testCompleted: true
      });
      
      setCurrentStep('completed');
      
      // Bouton pour commencer la mission
      setTimeout(() => {
        addMessage({
          id: generateId(),
          type: 'options',
          content: 'start_mission',
        });
      }, 2000);
    }, 1000);
    
    try {
      setLoading(true);
      
      // Enregistrer la configuration du joueur
      const playerConfig = {
        name: playerData.name,
        avatar: playerData.avatar,
        role: playerData.role,
        module: playerData.module,
        selectedDifficulty: playerData.difficulty === 'beginner' 
          ? "Débutant" 
          : playerData.difficulty === 'intermediate' 
            ? "Intermédiaire" 
            : "Expert",
        finalLevel,
        testResults: {
          score: correctAnswers,
          total: totalQuestions,
          percentage: scorePercentage
        },
        onboardingComplete: true,
        timestamp: Date.now() // Ajouter un timestamp pour suivre la date de création du profil
      };
      
      // Sauvegarder dans localStorage pour persistance côté client
      localStorage.setItem('cyberPlayerData', JSON.stringify(playerConfig));
      
      // Envoyer au serveur
      await axios.post('/api/cyber/setup-player', playerConfig);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du profil:', error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement de votre profil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Commencer la mission après l'onboarding
  const startMission = async () => {
    try {
      // Utiliser les données déjà stockées dans localStorage lors de l'étape précédente
      // Pas besoin de sauvegarder à nouveau car nous l'avons déjà fait
      
      // Rediriger vers la page principale de cyber
      navigate('/cyber');
    } catch (error) {
      console.error('Erreur lors de la transition vers la mission:', error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la préparation de votre mission.",
        variant: "destructive"
      });
    }
  };
  
  // État pour stocker le niveau final déterminé
  const [finalLevel, setFinalLevel] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-grow flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">I AM CYBER</h1>
          <p className="text-gray-600">Votre parcours de formation en cybersécurité commence ici</p>
        </div>
        
        <Card className="flex-grow flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-grow flex flex-col">
            {/* Zone de chat */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-4 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 250px)' }}
            >
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src={message.avatar || "/avatars/ai-assistant.png"} alt="AI" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none">
                              <p className="text-sm font-medium text-blue-700 mb-1">{message.sender || 'Assistant'}</p>
                              <div className="text-gray-700 whitespace-pre-line">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {message.type === 'user' && (
                        <div className="flex items-start space-x-3 justify-end">
                          <div>
                            <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none">
                              <div>
                                {message.content}
                              </div>
                            </div>
                          </div>
                          <Avatar>
                            <AvatarImage 
                              src={playerData.avatar ? `/avatars/${playerData.avatar}.png` : undefined} 
                              alt="User" 
                            />
                            <AvatarFallback>{playerData.name.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      {message.type === 'avatars' && (
                        <div className="my-4">
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {avatars.map((avatar) => (
                              <div 
                                key={avatar.id}
                                onClick={() => handleAvatarSelection(avatar.id)}
                                className="cursor-pointer flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition"
                              >
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={avatar.src} alt="Avatar" />
                                  <AvatarFallback>{avatar.fallback}</AvatarFallback>
                                </Avatar>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.type === 'roles' && (
                        <div className="my-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roles.map((role) => (
                              <div 
                                key={role.id}
                                onClick={() => handleRoleSelection(role.id)}
                                className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">{role.icon}</div>
                                  <div>
                                    <h3 className="font-medium">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.type === 'modules' && (
                        <div className="my-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((module) => (
                              <div 
                                key={module.id}
                                onClick={() => handleModuleSelection(module.id)}
                                className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">{module.icon}</div>
                                  <div>
                                    <h3 className="font-medium">{module.name}</h3>
                                    <p className="text-sm text-gray-500">{module.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.type === 'options' && (
                        <div className="my-4">
                          {message.content === 'Choisissez la difficulté' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {difficultyLevels.map((level) => (
                                <div 
                                  key={level.id}
                                  onClick={() => handleDifficultySelection(level.id)}
                                  className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition text-center"
                                >
                                  <h3 className="font-medium">{level.name}</h3>
                                  <p className="text-sm text-gray-500">{level.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {message.content === 'start_test' && (
                            <div className="flex space-x-4 justify-center">
                              <Button 
                                onClick={startTest}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Commencer l'évaluation
                              </Button>
                            </div>
                          )}

                          {message.content === 'start_mission' && (
                            <div className="flex space-x-4 justify-center">
                              <Button 
                                onClick={startMission}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={loading}
                              >
                                {loading ? "Préparation..." : "Commencer ma mission"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {message.type === 'question' && (
                        <div className="my-4">
                          {(() => {
                            try {
                              const questionData = JSON.parse(message.content as string);
                              return (
                                <div className="space-y-3">
                                  {questionData.options.map((option: string, index: number) => (
                                    <div 
                                      key={index}
                                      onClick={() => handleAnswerQuestion(questionData.questionIndex, index)}
                                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                                    >
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              );
                            } catch (e) {
                              return <div>Erreur d'affichage des options</div>;
                            }
                          })()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Zone de saisie */}
            {currentStep === 'name' && (
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Entrez votre nom..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow"
                  />
                  <Button onClick={handleSendMessage} disabled={!input.trim()}>
                    Envoyer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingChat;