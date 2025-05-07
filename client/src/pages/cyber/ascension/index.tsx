import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Server, Database, Search, FileText, Users, Globe, AlertTriangle, Clock, Layers, Terminal, CheckCircle, Star, Gift, InfoCircle, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import CyberLayout from '@/components/layout/CyberLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour CYBERASCENSION
interface Level {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: string;
  difficulty: 'Facile' | 'Intermédiaire' | 'Avancé' | 'Expert';
  durationMinutes: number;
  unlocked: boolean;
  completed: boolean;
  description: string;
  objectives: string[];
  rewards: string[];
  skills: {
    name: string;
    value: number;
  }[];
  challenge: {
    title: string;
    description: string;
    steps: string[];
  };
  backgroundGradient: string;
  badgeIcon: React.ReactNode;
  badgeTitle: string;
}

const CyberAscension: React.FC = () => {
  const [location, navigate] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [tab, setTab] = useState('aperçu'); // aperçu, objectifs, défi
  const [userProgress, setUserProgress] = useState({
    currentLevel: 0, // Niveau actuel débloqué
    totalXP: 0,
    badgesEarned: 0,
    skillPoints: {
      sensibilisation: 0,
      osint: 0, 
      conformité: 0,
      stratégie: 0,
      gestionCrise: 0,
      supplyChain: 0,
      iam: 0,
      cloud: 0,
      données: 0,
      pentestForensic: 0
    }
  });

  // Définition des 10 niveaux du parcours CYBERASCENSION
  const ascensionLevels: Level[] = [
    {
      id: 1,
      title: "PREMIERS PAS",
      subtitle: "Sensibilisation à la cybersécurité",
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      theme: "Formation et sensibilisation",
      difficulty: "Facile",
      durationMinutes: 30,
      unlocked: true,
      completed: false,
      description: "En tant que nouveau responsable sécurité chez CyberShield, votre première mission est d'élever le niveau de conscience cyber des employés. Identifiez les menaces majeures et construisez un programme efficace de sensibilisation aux bonnes pratiques de sécurité.",
      objectives: [
        "Identifier les 5 principales menaces pour l'entreprise",
        "Créer un programme complet de sensibilisation",
        "Former virtuellement 3 profils types d'employés",
        "Évaluer l'efficacité de votre programme par simulation"
      ],
      rewards: [
        "Badge 'Éveilleur de Conscience Cyber'",
        "+500 points d'expérience",
        "Déblocage de l'outil 'Simulateur de phishing avancé'"
      ],
      skills: [
        { name: "Communication de sécurité", value: 75 },
        { name: "Analyse de risques", value: 60 },
        { name: "Pédagogie cyber", value: 80 }
      ],
      challenge: {
        title: "Opération Vigilance",
        description: "Un programme de sensibilisation doit être mis en place en urgence après une tentative de phishing qui a presque réussi. Vous disposez d'une semaine virtuelle pour créer et déployer votre stratégie.",
        steps: [
          "Analyser les tendances actuelles de cybermenaces avec l'aide de l'IA",
          "Concevoir un programme adapté à 3 niveaux de connaissances",
          "Créer des simulations de phishing personnalisées pour tester les employés",
          "Évaluer et ajuster votre programme selon les résultats obtenus"
        ]
      },
      backgroundGradient: "from-blue-900 via-blue-800 to-blue-700",
      badgeIcon: <Shield className="h-6 w-6" />,
      badgeTitle: "Éveilleur de Conscience Cyber"
    },
    {
      id: 2,
      title: "L'ŒIL NUMÉRIQUE",
      subtitle: "Maîtrise de l'OSINT",
      icon: <Search className="h-8 w-8 text-purple-400" />,
      theme: "L'OSINT",
      difficulty: "Intermédiaire",
      durationMinutes: 45,
      unlocked: false,
      completed: false,
      description: "Une fuite d'information a été détectée chez CyberShield. En tant que responsable sécurité, vous devez utiliser les techniques OSINT pour déterminer quelles données ont été exposées et évaluer l'impact potentiel sur l'entreprise.",
      objectives: [
        "Cartographier l'empreinte numérique de CyberShield",
        "Identifier les informations sensibles exposées publiquement",
        "Découvrir les sources de fuites potentielles",
        "Établir un rapport d'exposition avec recommandations"
      ],
      rewards: [
        "Badge 'Maître de l'Information'",
        "+750 points d'expérience",
        "Outil virtuel 'Scanner de métadonnées'"
      ],
      skills: [
        { name: "Techniques OSINT", value: 85 },
        { name: "Analyse forensique", value: 65 },
        { name: "Évaluation des risques", value: 70 }
      ],
      challenge: {
        title: "Détective Numérique",
        description: "En utilisant uniquement des sources ouvertes, retracez le parcours d'informations critiques qui ont été divulguées et déterminez l'étendue de l'exposition.",
        steps: [
          "Utiliser des moteurs de recherche spécialisés pour trouver des informations sur CyberShield",
          "Analyser la présence sur les réseaux sociaux et forums professionnels",
          "Examiner les métadonnées des documents publics",
          "Cartographier les relations et connexions entre les informations découvertes"
        ]
      },
      backgroundGradient: "from-purple-900 via-purple-800 to-purple-700",
      badgeIcon: <Search className="h-6 w-6" />,
      badgeTitle: "Maître de l'Information"
    },
    {
      id: 3,
      title: "RÈGLES DU JEU",
      subtitle: "Conformité cyber en entreprise",
      icon: <FileText className="h-8 w-8 text-indigo-400" />,
      theme: "La conformité cyber en entreprise",
      difficulty: "Intermédiaire",
      durationMinutes: 60,
      unlocked: false,
      completed: false,
      description: "Un audit réglementaire est imminent chez CyberShield. En tant que responsable de la sécurité, vous devez rapidement évaluer la conformité actuelle de l'entreprise aux différentes réglementations (RGPD, NIS2, etc.) et mettre en place un plan d'action pour combler les lacunes identifiées.",
      objectives: [
        "Réaliser un audit interne de conformité",
        "Identifier les écarts réglementaires",
        "Élaborer un plan de mise en conformité",
        "Préparer les éléments pour l'audit externe"
      ],
      rewards: [
        "Badge 'Gardien des Normes'",
        "+1000 points d'expérience",
        "Accès à la 'Base de connaissances réglementaires'"
      ],
      skills: [
        { name: "Maîtrise réglementaire", value: 90 },
        { name: "Documentation de conformité", value: 75 },
        { name: "Gestion des risques", value: 80 }
      ],
      challenge: {
        title: "Course à la Conformité",
        description: "Avec seulement deux semaines avant un audit externe, vous devez mettre l'entreprise en conformité avec les principales réglementations applicables.",
        steps: [
          "Analyser le cadre réglementaire applicable à CyberShield",
          "Réaliser un audit flash des processus et systèmes",
          "Prioriser les actions correctives selon leur impact",
          "Préparer la documentation pour les auditeurs"
        ]
      },
      backgroundGradient: "from-indigo-900 via-indigo-800 to-indigo-700",
      badgeIcon: <FileText className="h-6 w-6" />,
      badgeTitle: "Gardien des Normes"
    },
    {
      id: 4,
      title: "VISION STRATÉGIQUE",
      subtitle: "Stratégie cybersécurité",
      icon: <Layers className="h-8 w-8 text-cyan-400" />,
      theme: "Définir une stratégie cyber et sa feuille de route",
      difficulty: "Avancé",
      durationMinutes: 75,
      unlocked: false,
      completed: false,
      description: "Le comité exécutif de CyberShield vous demande de présenter une stratégie de cybersécurité pour les trois prochaines années. Vous devez élaborer une vision cohérente, définir des objectifs mesurables, et construire une feuille de route détaillée avec allocation budgétaire.",
      objectives: [
        "Analyser la maturité cyber actuelle de l'organisation",
        "Définir une vision et des objectifs stratégiques",
        "Élaborer une feuille de route sur 3 ans",
        "Présenter et défendre votre stratégie devant le comité exécutif"
      ],
      rewards: [
        "Badge 'Stratège Cyber'",
        "+1250 points d'expérience",
        "Bonus de budget virtuel pour les niveaux suivants"
      ],
      skills: [
        { name: "Planification stratégique", value: 90 },
        { name: "Communication exécutive", value: 85 },
        { name: "Gestion budgétaire", value: 80 }
      ],
      challenge: {
        title: "Vision 2028",
        description: "Développez une stratégie de cybersécurité visionnaire mais réaliste, incluant les innovations technologiques futures tout en tenant compte des contraintes budgétaires.",
        steps: [
          "Analyser l'environnement de menaces actuel et prévoir son évolution",
          "Établir un plan d'investissement et de développement des capacités",
          "Créer des KPIs pertinents pour mesurer le succès",
          "Présenter une stratégie convaincante aux dirigeants générés par IA"
        ]
      },
      backgroundGradient: "from-cyan-900 via-cyan-800 to-cyan-700",
      badgeIcon: <Layers className="h-6 w-6" />,
      badgeTitle: "Stratège Cyber"
    },
    {
      id: 5,
      title: "ALERTE ROUGE",
      subtitle: "Gestion de crise cyber",
      icon: <AlertTriangle className="h-8 w-8 text-red-400" />,
      theme: "Gestion de crise cyber",
      difficulty: "Expert",
      durationMinutes: 90,
      unlocked: false,
      completed: false,
      description: "Vendredi, 17h00 : une attaque par ransomware frappe CyberShield. Les systèmes critiques sont touchés, la production est à l'arrêt, et la pression monte à chaque minute. En tant que responsable sécurité, vous devez gérer cette crise majeure et limiter les dégâts.",
      objectives: [
        "Mettre en œuvre la cellule de crise",
        "Contenir l'attaque et isoler les systèmes critiques",
        "Gérer la communication interne et externe",
        "Orchestrer la reprise d'activité"
      ],
      rewards: [
        "Badge 'Gestionnaire de Crise'",
        "+1500 points d'expérience",
        "Outil virtuel 'Kit de réponse aux incidents'"
      ],
      skills: [
        { name: "Réponse aux incidents", value: 95 },
        { name: "Gestion de crise", value: 90 },
        { name: "Communication de crise", value: 85 }
      ],
      challenge: {
        title: "Incident 14:00",
        description: "Face à une attaque sophistiquée en cours, vous disposez de ressources limitées et devez prendre des décisions cruciales sous pression, avec une horloge qui défile inexorablement.",
        steps: [
          "Identifier la nature et l'étendue de l'attaque",
          "Établir une cellule de crise et définir les rôles",
          "Mettre en œuvre les mesures de confinement et d'éradication",
          "Gérer la communication et la reprise d'activité"
        ]
      },
      backgroundGradient: "from-red-900 via-red-800 to-red-700",
      badgeIcon: <AlertTriangle className="h-6 w-6" />,
      badgeTitle: "Gestionnaire de Crise"
    },
    {
      id: 6,
      title: "CHAÎNE DE CONFIANCE",
      subtitle: "Sécurité de la supply chain",
      icon: <Layers className="h-8 w-8 text-amber-400" />,
      theme: "La sécurité de la supply chain",
      difficulty: "Avancé",
      durationMinutes: 60,
      unlocked: false,
      completed: false,
      description: "Un fournisseur critique de CyberShield a été compromis, mettant potentiellement en danger votre infrastructure et vos données. Vous devez évaluer l'impact de cette compromission et sécuriser l'écosystème des partenaires et fournisseurs.",
      objectives: [
        "Cartographier les risques liés aux tiers",
        "Évaluer l'impact de la compromission du fournisseur",
        "Mettre en place un programme d'évaluation des fournisseurs",
        "Définir des exigences de sécurité contractuelles"
      ],
      rewards: [
        "Badge 'Maillon Fort'",
        "+1350 points d'expérience",
        "Outil virtuel 'Scanner de risques tiers'"
      ],
      skills: [
        { name: "Gestion des risques tiers", value: 85 },
        { name: "Due diligence fournisseurs", value: 80 },
        { name: "Sécurité contractuelle", value: 75 }
      ],
      challenge: {
        title: "Chaîne Vulnérable",
        description: "Une vulnérabilité a été exploitée chez un fournisseur stratégique. Évaluez rapidement l'impact sur votre organisation et mettez en place des mesures pour protéger votre chaîne d'approvisionnement.",
        steps: [
          "Analyser les interconnexions avec le fournisseur compromis",
          "Réaliser un audit de sécurité du fournisseur",
          "Mettre en place des mesures de segmentation et de contrôle",
          "Établir un programme d'évaluation continue des fournisseurs"
        ]
      },
      backgroundGradient: "from-amber-900 via-amber-800 to-amber-700",
      badgeIcon: <Layers className="h-6 w-6" />,
      badgeTitle: "Maillon Fort"
    },
    {
      id: 7,
      title: "PORTIERS NUMÉRIQUES",
      subtitle: "Identity & Access Management",
      icon: <Lock className="h-8 w-8 text-green-400" />,
      theme: "L'IAM",
      difficulty: "Avancé",
      durationMinutes: 75,
      unlocked: false,
      completed: false,
      description: "CyberShield détecte régulièrement des accès non autorisés dans son système d'information. En tant que responsable sécurité, vous devez repenser complètement l'architecture IAM pour renforcer le contrôle des identités et des accès.",
      objectives: [
        "Auditer le système IAM existant",
        "Concevoir une nouvelle architecture selon le principe du moindre privilège",
        "Implémenter l'authentification multifacteur",
        "Mettre en place un processus de revue des droits"
      ],
      rewards: [
        "Badge 'Gardien des Accès'",
        "+1400 points d'expérience",
        "Fonctionnalité 'Détecteur d'anomalies IAM'"
      ],
      skills: [
        { name: "Architecture IAM", value: 90 },
        { name: "Gestion des privilèges", value: 85 },
        { name: "Authentification sécurisée", value: 90 }
      ],
      challenge: {
        title: "Forteresse Identitaire",
        description: "Face à des tentatives d'usurpation d'identité et d'élévation de privilèges, restructurez entièrement le système IAM pour garantir que seules les bonnes personnes ont accès aux bonnes ressources.",
        steps: [
          "Réaliser un inventaire complet des comptes et des droits",
          "Concevoir une matrice de contrôle d'accès basée sur les rôles",
          "Déployer une solution d'authentification multifacteur",
          "Mettre en place une surveillance continue des activités suspectes"
        ]
      },
      backgroundGradient: "from-green-900 via-green-800 to-green-700",
      badgeIcon: <Lock className="h-6 w-6" />,
      badgeTitle: "Gardien des Accès"
    },
    {
      id: 8,
      title: "TÊTES DANS LES NUAGES",
      subtitle: "Cybersécurité dans le cloud",
      icon: <Cloud className="h-8 w-8 text-blue-400" />,
      theme: "La cybersécurité dans le cloud",
      difficulty: "Expert",
      durationMinutes: 90,
      unlocked: false,
      completed: false,
      description: "CyberShield entreprend une migration majeure vers le cloud. Vous êtes chargé d'assurer que cette transition se fasse de manière sécurisée, en tenant compte des spécificités des environnements cloud modernes.",
      objectives: [
        "Définir une architecture cloud sécurisée",
        "Établir des politiques de sécurité cloud",
        "Configurer les contrôles de sécurité appropriés",
        "Mettre en place une surveillance continue"
      ],
      rewards: [
        "Badge 'Architecte des Nuages'",
        "+1600 points d'expérience",
        "Outil virtuel 'Scanner de configuration cloud'"
      ],
      skills: [
        { name: "Architecture cloud sécurisée", value: 95 },
        { name: "Configuration sécurisée", value: 85 },
        { name: "Surveillance cloud", value: 90 }
      ],
      challenge: {
        title: "Migration Sécurisée",
        description: "Concevez et implémentez une architecture cloud sécurisée pour la migration des applications critiques de l'entreprise, en évitant les erreurs de configuration courantes.",
        steps: [
          "Concevoir une architecture multi-cloud sécurisée",
          "Implémenter le principe de défense en profondeur",
          "Configurer correctement les services cloud pour éviter les fuites de données",
          "Mettre en place une surveillance des comportements anormaux"
        ]
      },
      backgroundGradient: "from-blue-900 via-blue-800 to-blue-700",
      badgeIcon: <Cloud className="h-6 w-6" />,
      badgeTitle: "Architecte des Nuages"
    },
    {
      id: 9,
      title: "FORTERESSE DE DONNÉES",
      subtitle: "Protection des données personnelles",
      icon: <Database className="h-8 w-8 text-violet-400" />,
      theme: "Sécurisation des données personnelles",
      difficulty: "Expert",
      durationMinutes: 75,
      unlocked: false,
      completed: false,
      description: "CyberShield lance un nouveau projet impliquant le traitement de données personnelles sensibles de millions de clients. Vous devez concevoir un système complet de protection des données respectant le RGPD et autres réglementations.",
      objectives: [
        "Réaliser une analyse d'impact relative à la protection des données",
        "Mettre en œuvre des mesures techniques de protection",
        "Établir des processus de gouvernance des données",
        "Préparer un plan de réponse en cas de violation de données"
      ],
      rewards: [
        "Badge 'Protecteur des Données'",
        "+1750 points d'expérience",
        "Bibliothèque de modèles de conformité"
      ],
      skills: [
        { name: "Protection des données", value: 95 },
        { name: "Gouvernance RGPD", value: 90 },
        { name: "Sécurité des bases de données", value: 85 }
      ],
      challenge: {
        title: "Sanctuaire des Données",
        description: "Concevez un système complet de protection des données pour un projet sensible, en équilibrant obligations légales, besoins métier et mesures de sécurité.",
        steps: [
          "Cartographier les flux de données personnelles",
          "Mettre en œuvre des techniques de pseudonymisation et de chiffrement",
          "Établir des politiques de gouvernance des données",
          "Concevoir un plan de réponse aux violations de données"
        ]
      },
      backgroundGradient: "from-violet-900 via-violet-800 to-violet-700",
      badgeIcon: <Database className="h-6 w-6" />,
      badgeTitle: "Protecteur des Données"
    },
    {
      id: 10,
      title: "CHASSE AUX FAILLES",
      subtitle: "Tests de pénétration et forensic",
      icon: <Terminal className="h-8 w-8 text-rose-400" />,
      theme: "Analyse des vulnérabilités et tests de pénétration",
      difficulty: "Expert",
      durationMinutes: 120,
      unlocked: false,
      completed: false,
      description: "Pour valider la résilience de CyberShield face aux attaques sophistiquées, vous devez mener un test d'intrusion complet sur vos systèmes puis analyser les traces d'une compromission simulée pour développer vos compétences en investigation numérique.",
      objectives: [
        "Identifier les vulnérabilités des systèmes",
        "Conduire un test d'intrusion éthique",
        "Réaliser une analyse forensique après incident",
        "Établir un plan de remédiation des vulnérabilités"
      ],
      rewards: [
        "Badge 'Maître Cyber'",
        "+2000 points d'expérience",
        "Certification virtuelle 'Expert en Cyberdéfense'"
      ],
      skills: [
        { name: "Test d'intrusion", value: 95 },
        { name: "Analyse de vulnérabilités", value: 90 },
        { name: "Investigation numérique", value: 95 }
      ],
      challenge: {
        title: "Chasseur de Failles",
        description: "Face à un réseau fortement défendu, trouvez des vulnérabilités exploitables, puis analysez en profondeur les traces laissées par une intrusion pour comprendre les techniques utilisées.",
        steps: [
          "Effectuer une reconnaissance approfondie des systèmes cibles",
          "Identifier et exploiter des vulnérabilités",
          "Analyser les journaux et artefacts après incident",
          "Reconstituer la chaîne d'attaque complète"
        ]
      },
      backgroundGradient: "from-rose-900 via-rose-800 to-rose-700",
      badgeIcon: <Terminal className="h-6 w-6" />,
      badgeTitle: "Maître Cyber"
    }
  ];

  // Effet pour mettre à jour le niveau sélectionné initial
  useEffect(() => {
    // Par défaut, sélectionner le premier niveau débloqué
    const firstUnlockedLevel = ascensionLevels.find(level => level.unlocked);
    if (firstUnlockedLevel) {
      setSelectedLevel(firstUnlockedLevel);
    }
  }, []);

  // Fonction pour commencer un niveau
  const startLevel = (level: Level) => {
    if (!level.unlocked) {
      toast({
        title: "Niveau verrouillé",
        description: "Vous devez compléter les niveaux précédents pour débloquer ce niveau.",
        variant: "destructive",
      });
      return;
    }
    
    // Naviguer vers la page du niveau spécifique
    navigate(`/cyber/ascension/level/${level.id}`);
  };

  return (
    <CyberLayout>
      <PageTitle title="CYBERASCENSION" />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Navigation supérieure */}
        <div className="container mx-auto px-4 pt-6">
          <Button 
            variant="outline" 
            className="mb-6 bg-black/20 border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate('/cyber-mode-selection')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-3/4">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400"
              >
                CYBERASCENSION: La Montée des Gardiens
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-gray-300 mb-4"
              >
                Gravissez les échelons de la cyberdéfense en relevant 10 défis progressifs, chacun représentant une compétence clé en cybersécurité.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-1/4 bg-black/30 rounded-lg p-4 border border-gray-800"
            >
              <h3 className="text-lg font-semibold mb-2">Votre progression</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Niveau:</span>
                  <span className="ml-2 text-blue-400 font-medium">{userProgress.currentLevel}/10</span>
                </div>
                <div>
                  <span className="text-gray-400">XP:</span>
                  <span className="ml-2 text-violet-400 font-medium">{userProgress.totalXP}</span>
                </div>
                <div>
                  <span className="text-gray-400">Badges:</span>
                  <span className="ml-2 text-amber-400 font-medium">{userProgress.badgesEarned}/10</span>
                </div>
              </div>
              <Progress value={userProgress.currentLevel * 10} className="h-2 bg-gray-700" />
            </motion.div>
          </div>
        </div>
        
        {/* Carte interactive des niveaux */}
        <div className="container mx-auto px-4 mb-12">
          <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Parcours d'ascension</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {ascensionLevels.slice(0, 5).map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 border ${level.unlocked ? 'border-gray-700 hover:border-blue-500' : 'border-gray-800 opacity-70'} ${selectedLevel?.id === level.id ? 'ring-2 ring-blue-500 bg-gradient-to-br ' + level.backgroundGradient : 'bg-gray-900'}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  <div className="flex items-center mb-2">
                    {level.icon}
                    <span className="ml-2 font-semibold text-lg">{level.title}</span>
                    {!level.unlocked && <Lock className="ml-auto h-4 w-4 text-gray-500" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{level.subtitle}</p>
                  <div className="flex justify-between text-xs mt-2">
                    <Badge variant={level.difficulty === 'Facile' ? 'outline' : level.difficulty === 'Intermédiaire' ? 'secondary' : level.difficulty === 'Avancé' ? 'default' : 'destructive'}>
                      {level.difficulty}
                    </Badge>
                    <span className="text-gray-400">{level.durationMinutes} min</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {ascensionLevels.slice(5, 10).map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 border ${level.unlocked ? 'border-gray-700 hover:border-blue-500' : 'border-gray-800 opacity-70'} ${selectedLevel?.id === level.id ? 'ring-2 ring-blue-500 bg-gradient-to-br ' + level.backgroundGradient : 'bg-gray-900'}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  <div className="flex items-center mb-2">
                    {level.icon}
                    <span className="ml-2 font-semibold text-lg">{level.title}</span>
                    {!level.unlocked && <Lock className="ml-auto h-4 w-4 text-gray-500" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{level.subtitle}</p>
                  <div className="flex justify-between text-xs mt-2">
                    <Badge variant={level.difficulty === 'Facile' ? 'outline' : level.difficulty === 'Intermédiaire' ? 'secondary' : level.difficulty === 'Avancé' ? 'default' : 'destructive'}>
                      {level.difficulty}
                    </Badge>
                    <span className="text-gray-400">{level.durationMinutes} min</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Détails du niveau sélectionné */}
        {selectedLevel && (
          <div className="container mx-auto px-4 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black/40 border border-gray-800 rounded-lg overflow-hidden"
            >
              <div className={`py-6 px-6 bg-gradient-to-r ${selectedLevel.backgroundGradient}`}>
                <div className="flex items-center">
                  {selectedLevel.icon}
                  <div className="ml-4">
                    <h2 className="text-3xl font-bold">{selectedLevel.title}</h2>
                    <p className="text-white/90">{selectedLevel.subtitle}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge className="mb-2" variant={selectedLevel.difficulty === 'Facile' ? 'outline' : selectedLevel.difficulty === 'Intermédiaire' ? 'secondary' : selectedLevel.difficulty === 'Avancé' ? 'default' : 'destructive'}>
                      {selectedLevel.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{selectedLevel.durationMinutes} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="aperçu" className="p-6" onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="aperçu">Aperçu</TabsTrigger>
                  <TabsTrigger value="objectifs">Objectifs & Récompenses</TabsTrigger>
                  <TabsTrigger value="défi">Défi</TabsTrigger>
                </TabsList>
                
                <TabsContent value="aperçu">
                  <div className="space-y-6">
                    <p className="text-gray-300 leading-relaxed">{selectedLevel.description}</p>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Compétences développées</h3>
                      <div className="space-y-3">
                        {selectedLevel.skills.map((skill, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{skill.name}</span>
                              <span className="text-sm text-blue-400">{skill.value}%</span>
                            </div>
                            <Progress value={skill.value} className="h-2 bg-gray-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-900/50 p-2 rounded-full mr-3">
                          {selectedLevel.badgeIcon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Badge à gagner</p>
                          <p className="font-medium">{selectedLevel.badgeTitle}</p>
                        </div>
                      </div>
                      
                      <Button 
                        className={`px-6 ${selectedLevel.unlocked ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700' : 'bg-gray-700'}`}
                        onClick={() => startLevel(selectedLevel)}
                        disabled={!selectedLevel.unlocked}
                      >
                        {selectedLevel.unlocked ? "Commencer le niveau" : "Niveau verrouillé"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="objectifs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Objectifs du niveau
                      </h3>
                      <ul className="space-y-3">
                        {selectedLevel.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                            <span className="text-gray-300">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Gift className="h-5 w-5 mr-2 text-amber-500" />
                        Récompenses
                      </h3>
                      <ul className="space-y-3">
                        {selectedLevel.rewards.map((reward, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="h-5 w-5 mr-2 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{reward}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-6 bg-gray-800" />
                  
                  <div className="flex justify-center">
                    <Button 
                      className={`px-6 ${selectedLevel.unlocked ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700' : 'bg-gray-700'}`}
                      onClick={() => startLevel(selectedLevel)}
                      disabled={!selectedLevel.unlocked}
                    >
                      {selectedLevel.unlocked ? "Commencer le niveau" : "Niveau verrouillé"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="défi">
                  <div className="space-y-6">
                    <div className="bg-black/30 border border-gray-800 rounded-lg p-5">
                      <h3 className="text-xl font-bold mb-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">{selectedLevel.challenge.title}</h3>
                      <p className="text-gray-300 mb-5">{selectedLevel.challenge.description}</p>
                      
                      <h4 className="text-lg font-semibold mb-3">Étapes du défi</h4>
                      <div className="space-y-4">
                        {selectedLevel.challenge.steps.map((step, index) => (
                          <div key={index} className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                              <span className="font-medium">{index + 1}</span>
                            </div>
                            <div className="pt-1">
                              <p className="text-gray-300">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                      <div className="flex items-start">
                        <InfoCircle className="h-5 w-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                        <p className="text-sm text-blue-300">
                          Ce défi utilise Azure OpenAI pour générer des scénarios dynamiques, créer des adversaires IA adaptatifs et fournir un retour personnalisé sur vos décisions. Chaque tentative sera différente et adaptée à votre style de résolution de problèmes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        className={`px-6 ${selectedLevel.unlocked ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700' : 'bg-gray-700'}`}
                        onClick={() => startLevel(selectedLevel)}
                        disabled={!selectedLevel.unlocked}
                      >
                        {selectedLevel.unlocked ? "Relever le défi" : "Niveau verrouillé"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        )}
        
        {/* Tableau de bord des compétences */}
        <div className="container mx-auto px-4 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/30 border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Tableau de bord de vos compétences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Sensibilisation</h3>
                  <Progress value={userProgress.skillPoints.sensibilisation} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.sensibilisation / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">OSINT</h3>
                  <Progress value={userProgress.skillPoints.osint} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.osint / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Conformité</h3>
                  <Progress value={userProgress.skillPoints.conformité} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.conformité / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Stratégie</h3>
                  <Progress value={userProgress.skillPoints.stratégie} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.stratégie / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Gestion de crise</h3>
                  <Progress value={userProgress.skillPoints.gestionCrise} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.gestionCrise / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Supply Chain</h3>
                  <Progress value={userProgress.skillPoints.supplyChain} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.supplyChain / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">IAM</h3>
                  <Progress value={userProgress.skillPoints.iam} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.iam / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Cloud</h3>
                  <Progress value={userProgress.skillPoints.cloud} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.cloud / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Protection des données</h3>
                  <Progress value={userProgress.skillPoints.données} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.données / 20) + 1}/5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Pentest & Forensic</h3>
                  <Progress value={userProgress.skillPoints.pentestForensic} className="h-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-2">Niveau {Math.floor(userProgress.skillPoints.pentestForensic / 20) + 1}/5</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </CyberLayout>
  );
};

export default CyberAscension;