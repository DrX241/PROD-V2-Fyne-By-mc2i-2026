import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Brain,
  BrainCircuit,
  Calendar,
  Clock,
  LineChart,
  Lock,
  MessageSquare,
  Monitor,
  Play,
  Server,
  Shield,
  Terminal,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Types
interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  complexity: 'Basique' | 'Intermédiaire' | 'Avancé' | 'Expert';
  phases: number;
  participants: number;
  category: string;
  tags: string[];
  objectives: string[];
  stats?: {
    completions: number;
    avgScore: number;
    bestTime: string;
  };
  image?: string;
  available: boolean;
  featured: boolean;
  new: boolean;
}

// Liste des scénarios de crise disponibles
const crisisScenarios: CrisisScenario[] = [
  {
    id: 'ciso-challenge',
    title: 'CISO Challenge: Simulation de Crise',
    description: 'Une nouvelle simulation immersive où vous prenez les commandes en tant que RSSI face à une crise majeure. Gérez les aspects techniques, humains et financiers en temps réel.',
    duration: '30-60 min',
    complexity: 'Intermédiaire',
    phases: 5,
    participants: 6,
    category: 'Crisis Management',
    tags: ['Temps réel', 'Prise de décision', 'Gestion d\'équipe', 'Budgétisation'],
    objectives: [
      'Réduire le niveau de menace',
      'Gérer les ressources limitées efficacement',
      'Maintenir la réputation de l\'organisation',
      'Communiquer avec les parties prenantes',
      'Résoudre l\'incident avant la fin du temps imparti'
    ],
    stats: {
      completions: 76,
      avgScore: 82,
      bestTime: '28 min'
    },
    available: false, // Scénario temporairement indisponible
    featured: false,
    new: false
  },
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
  },
  {
    id: 'insider-threat',
    title: 'Menace Interne',
    description: 'Un employé privilégié vole des données sensibles et sabote des systèmes avant de quitter l\'entreprise. Vous devez limiter les dégâts et reconstruire les défenses.',
    duration: '60-90 min',
    complexity: 'Intermédiaire',
    phases: 3,
    participants: 5,
    category: 'Security Operations',
    tags: ['Privilèges', 'Exfiltration', 'RH', 'Surveillance'],
    objectives: [
      'Identifier l\'étendue de la compromission',
      'Sécuriser les accès compromis',
      'Récupérer les systèmes affectés',
      'Améliorer la surveillance des utilisateurs privilégiés'
    ],
    available: true,
    featured: false,
    new: false
  },
  {
    id: 'ddos-infrastructure',
    title: 'Attaque DDoS Massive',
    description: 'Une attaque DDoS sophistiquée et distribuée cible l\'infrastructure critique de l\'entreprise, rendant les services inaccessibles aux clients et partenaires.',
    duration: '45-60 min',
    complexity: 'Basique',
    phases: 2,
    participants: 4,
    category: 'Network Security',
    tags: ['DDoS', 'Disponibilité', 'Mitigation', 'Continuité'],
    objectives: [
      'Activer les mesures de mitigation DDoS',
      'Coordonner avec les fournisseurs de transit',
      'Maintenir les services critiques',
      'Communiquer avec les clients affectés'
    ],
    available: true,
    featured: false,
    new: false
  },
  {
    id: 'zero-day-exploitation',
    title: 'Exploitation de Vulnérabilité Zero-Day',
    description: 'Une vulnérabilité critique sans correctif est exploitée activement contre vos systèmes. Vous devez développer et déployer des mitigations d\'urgence.',
    duration: '90-120 min',
    complexity: 'Expert',
    phases: 4,
    participants: 7,
    category: 'Vulnerability Management',
    tags: ['Zero-day', 'Exploitation', 'Patch d\'urgence', 'CVE'],
    objectives: [
      'Identifier les systèmes vulnérables',
      'Développer des mitigations temporaires',
      'Déployer les correctifs d\'urgence',
      'Surveiller les tentatives d\'exploitation'
    ],
    available: false,
    featured: false,
    new: true
  }
];

// Stats simulées pour la page d'accueil
const crisisStats = {
  completedScenarios: 42,
  averageScore: 78,
  bestTime: '54 min',
  topScorers: [
    { name: 'Thomas D.', score: 92, avatar: '' },
    { name: 'Marie L.', score: 89, avatar: '' },
    { name: 'Alexandre F.', score: 85, avatar: '' }
  ]
};

// Page principale du centre de crise
export default function CrisisCenter() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenario | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Animation des cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };
  
  // Ouvrir la page de détail d'un scénario
  const openScenarioDetail = (scenario: CrisisScenario) => {
    setSelectedScenario(scenario);
    setShowDetail(true);
  };
  
  // Lancer un scénario
  const startScenario = (scenario: CrisisScenario) => {
    // Le module CISO Challenge a été supprimé, tous les scénarios utilisent crisis-simulation
    setLocation(`/cyber/crisis-center/crisis-simulation`);
  };
  
  // Rendu du panneau de statistiques
  const renderStatsPanel = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/70 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              Vos statistiques
            </CardTitle>
            <CardDescription>
              Performance dans les simulations de crise
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl font-bold">{crisisStats.completedScenarios}</span>
              <span className="text-xs text-muted-foreground">Scénarios complétés</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl font-bold">{crisisStats.averageScore}<span className="text-base text-muted-foreground">/100</span></span>
              <span className="text-xs text-muted-foreground">Score moyen</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl font-bold">{crisisStats.bestTime}</span>
              <span className="text-xs text-muted-foreground">Meilleur temps</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/70 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
              Progression
            </CardTitle>
            <CardDescription>
              Votre évolution en gestion de crise
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Compétence technique</span>
                  <span>82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Communication de crise</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Prise de décision sous pression</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/70 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Classement
            </CardTitle>
            <CardDescription>
              Les meilleurs gestionnaires de crise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crisisStats.topScorers.map((scorer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-semibold text-muted-foreground">#{index + 1}</span>
                    <Avatar>
                      <AvatarFallback className="bg-primary/20">
                        {scorer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{scorer.name}</span>
                  </div>
                  <Badge variant="secondary">{scorer.score}/100</Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              Voir le classement complet
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Rendu des scénarios disponibles
  const renderScenarios = () => {
    const availableScenarios = crisisScenarios.filter(s => s.available);
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {availableScenarios.map((scenario) => (
          <motion.div 
            key={scenario.id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card 
              className={`bg-card/70 backdrop-blur-sm border-border/40 h-full flex flex-col hover:shadow-lg transition-all cursor-pointer ${
                scenario.featured ? 'border-amber-500/30' : ''
              }`}
              onClick={() => openScenarioDetail(scenario)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    {scenario.new && (
                      <Badge className="bg-blue-600">Nouveau</Badge>
                    )}
                    {scenario.featured && (
                      <Badge className="bg-amber-600">Recommandé</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">{scenario.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-sm">
                    {scenario.complexity}
                  </Badge>
                  <Badge variant="outline" className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {scenario.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <p className="text-muted-foreground mb-4">
                  {scenario.description}
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.phases} phases</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.objectives.length} objectifs</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {scenario.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-background/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {scenario.tags.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-background/50"
                    >
                      +{scenario.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {scenario.stats && (
                  <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
                    <span>Complété {scenario.stats.completions} fois</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <LineChart className="h-3 w-3" />
                            <span>Score moyen: {scenario.stats.avgScore}/100</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Meilleur temps: {scenario.stats.bestTime}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  // Rendu du détail d'un scénario
  const renderScenarioDetail = () => {
    if (!selectedScenario) return null;
    
    return (
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              {selectedScenario.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{selectedScenario.complexity}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedScenario.duration}
              </Badge>
              <Badge variant="outline">{selectedScenario.category}</Badge>
            </div>
            <DialogDescription className="mt-4">
              {selectedScenario.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  Déroulement de la simulation
                </h3>
                <div className="bg-card/50 border border-border/40 rounded-lg p-4 relative">
                  <div className="absolute top-0 left-6 bottom-0 w-0.5 bg-border/60"></div>
                  
                  <div className="pl-10 pb-6 relative">
                    <div className="w-4 h-4 rounded-full bg-primary absolute -left-2 top-0 z-10"></div>
                    <h4 className="font-medium">Phase 1: Détection et confinement initial</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Détecter l'étendue de l'infection et prendre les premières mesures de confinement.
                    </p>
                  </div>
                  
                  <div className="pl-10 pb-6 relative">
                    <div className="w-4 h-4 rounded-full bg-primary/60 absolute -left-2 top-0 z-10"></div>
                    <h4 className="font-medium">Phase 2: Investigation et identification</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enquêter sur l'origine de l'attaque et identifier l'étendue des dommages.
                    </p>
                  </div>
                  
                  <div className="pl-10 pb-6 relative">
                    <div className="w-4 h-4 rounded-full bg-primary/40 absolute -left-2 top-0 z-10"></div>
                    <h4 className="font-medium">Phase 3: Communication et notification</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gérer la communication avec les parties prenantes et les obligations légales.
                    </p>
                  </div>
                  
                  <div className="pl-10 relative">
                    <div className="w-4 h-4 rounded-full bg-primary/20 absolute -left-2 top-0 z-10"></div>
                    <h4 className="font-medium">Phase 4: Reprise d'activité et leçons apprises</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rétablir les opérations et capitaliser sur l'expérience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  Compétences évaluées
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card/50 border border-border/40 rounded-lg p-3">
                    <h4 className="font-medium flex items-center gap-1.5 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Techniques
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Analyse de malware</li>
                      <li>Forensique numérique</li>
                      <li>Confinement d'incident</li>
                      <li>Restauration de systèmes</li>
                    </ul>
                  </div>
                  <div className="bg-card/50 border border-border/40 rounded-lg p-3">
                    <h4 className="font-medium flex items-center gap-1.5 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Communication
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Notification RGPD</li>
                      <li>Communication de crise</li>
                      <li>Coordination d'équipe</li>
                      <li>Reporting aux dirigeants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Équipe de crise
                </h3>
                <div className="bg-card/50 border border-border/40 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/20">DM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Daniel Martin</p>
                        <p className="text-xs text-muted-foreground">Responsable SOC</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/20">JL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Julie Leblanc</p>
                        <p className="text-xs text-muted-foreground">Responsable Support IT</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/20">TG</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Thomas Girard</p>
                        <p className="text-xs text-muted-foreground">Expert Forensique</p>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-center text-muted-foreground">
                      + 5 autres membres d'équipe
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Objectifs
                </h3>
                <div className="bg-card/50 border border-border/40 rounded-lg p-3">
                  <ul className="space-y-2 text-sm">
                    {selectedScenario.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {selectedScenario.stats && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Statistiques
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-card/50 border border-border/40 rounded-lg p-2">
                      <div className="text-xl font-bold">{selectedScenario.stats.completions}</div>
                      <div className="text-xs text-muted-foreground">Participations</div>
                    </div>
                    <div className="bg-card/50 border border-border/40 rounded-lg p-2">
                      <div className="text-xl font-bold">{selectedScenario.stats.avgScore}<span className="text-sm text-muted-foreground">/100</span></div>
                      <div className="text-xs text-muted-foreground">Score moyen</div>
                    </div>
                    <div className="bg-card/50 border border-border/40 rounded-lg p-2">
                      <div className="text-xl font-bold">{selectedScenario.stats.bestTime}</div>
                      <div className="text-xs text-muted-foreground">Record</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Cette simulation utilise l'IA pour s'adapter à vos décisions en temps réel</span>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                Annuler
              </Button>
              <Button 
                onClick={() => {
                  setShowDetail(false);
                  startScenario(selectedScenario);
                }}
                className="bg-primary/90 hover:bg-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                Démarrer la simulation
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <HomeLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center mb-6">
          <Link href="/cyber">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Centre de Crise</h1>
            <p className="text-muted-foreground">
              Simulations immersives de gestion de crise cybersécurité
            </p>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">Simulez des crises cyber réalistes</h2>
              <p className="text-muted-foreground">
                Le Centre de Crise propose des simulations immersives où vous incarnez un RSSI gérant des incidents critiques. 
                Vous interagirez avec une équipe virtuelle générée par IA, prendrez des décisions sous pression et verrez leurs conséquences en temps réel.
              </p>
            </div>
            <Button className="md:self-center bg-primary/90 hover:bg-primary" size="lg">
              <Play className="mr-2 h-5 w-5" />
              Démarrer une simulation
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-background/30 border border-border/30">
            <TabsTrigger value="scenarios">
              Scénarios
            </TabsTrigger>
            <TabsTrigger value="stats">
              Performances
            </TabsTrigger>
            <TabsTrigger value="custom">
              Scénarios personnalisés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios" className="space-y-8">
            {renderStatsPanel()}
            
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                Scénarios disponibles
              </h2>
              
              {renderScenarios()}
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="text-center py-20">
              <Monitor className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Tableau de bord en développement</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Les statistiques détaillées et l'analyse de performance seront disponibles prochainement.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="text-center py-20">
              <Lock className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Fonctionnalité à venir</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                La création de scénarios personnalisés sera disponible dans une prochaine mise à jour.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {renderScenarioDetail()}
    </HomeLayout>
  );
}