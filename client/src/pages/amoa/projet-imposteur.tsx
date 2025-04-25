import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  SearchCheck, 
  Clock, 
  FileText, 
  User, 
  Mail, 
  MessageSquare, 
  Check, 
  X,
  ChevronRight,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { toast } from '@/hooks/use-toast';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isGuilty?: boolean;
  clues: string[];
  alibi?: string;
}

interface Evidence {
  id: string;
  type: 'email' | 'chat' | 'document';
  title: string;
  content: string;
  from?: string;
  to?: string;
  date?: string;
  relatedTo: string[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  failureSummary: string;
  team: TeamMember[];
  evidence: Evidence[];
  expectedOutcome: string;
  lessons: string[];
}

// Composants
const CountdownTimer = ({ seconds, onComplete }: { seconds: number, onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  
  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;
  
  return (
    <div className="flex items-center space-x-2">
      <Clock className="h-5 w-5 text-red-500" />
      <div className="text-xl font-mono font-bold">
        {minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
      </div>
      <Progress value={(timeLeft / seconds) * 100} className="w-40 h-2" />
    </div>
  );
};

const MemberCard = ({ 
  member, 
  onClick, 
  isSelected 
}: { 
  member: TeamMember, 
  onClick: () => void, 
  isSelected: boolean 
}) => {
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg bg-purple-100' : 'hover:shadow-md hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/avatars/${member.avatar}`} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-700">{member.role}</p>
        </div>
      </div>
    </Card>
  );
};

const EvidenceCard = ({ evidence, onClick }: { evidence: Evidence, onClick: () => void }) => {
  const IconMap = {
    email: Mail,
    chat: MessageSquare,
    document: FileText
  };
  
  const Icon = IconMap[evidence.type];
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-900">{evidence.title}</h3>
          <p className="text-xs text-gray-700">{evidence.type === 'email' ? `De: ${evidence.from}` : evidence.type}</p>
        </div>
      </div>
    </Card>
  );
};

const EvidenceViewer = ({ evidence }: { evidence: Evidence | null }) => {
  if (!evidence) return null;
  
  return (
    <Card className="p-6 h-[400px] overflow-y-auto bg-white">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{evidence.title}</h2>
          <Badge variant={
            evidence.type === 'email' ? 'default' : 
            evidence.type === 'chat' ? 'outline' : 'secondary'
          }>
            {evidence.type === 'email' ? 'Email' : 
             evidence.type === 'chat' ? 'Conversation' : 'Document'}
          </Badge>
        </div>
        
        {evidence.type === 'email' && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm text-gray-800"><strong>De:</strong> {evidence.from}</p>
            <p className="text-sm text-gray-800"><strong>À:</strong> {evidence.to}</p>
            <p className="text-sm text-gray-800"><strong>Date:</strong> {evidence.date}</p>
          </div>
        )}
        
        <div className="mt-6 text-gray-800 whitespace-pre-line bg-white p-3 rounded-md border border-gray-100">
          {evidence.content}
        </div>
      </div>
    </Card>
  );
};

const ResultDialog = ({ 
  open, 
  setOpen, 
  isCorrect, 
  scenario, 
  selectedMember 
}: { 
  open: boolean, 
  setOpen: (open: boolean) => void, 
  isCorrect: boolean, 
  scenario: Scenario,
  selectedMember: TeamMember | null
}) => {
  const guiltyMember = scenario.team.find(m => m.isGuilty);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            {isCorrect ? (
              <><Check className="h-6 w-6 text-green-500 mr-2" /> Félicitations !</>
            ) : (
              <><X className="h-6 w-6 text-red-500 mr-2" /> Ce n'est pas la bonne personne</>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-6">
          {!isCorrect && selectedMember && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-bold text-lg mb-2">Pourquoi ce n'est pas {selectedMember.name} ?</h3>
              <p>{selectedMember.alibi}</p>
            </Card>
          )}
          
          {guiltyMember && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/${guiltyMember.avatar}`} alt={guiltyMember.name} />
                  <AvatarFallback>{guiltyMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{guiltyMember.name} était responsable</h3>
                  <p className="text-sm text-gray-600">{guiltyMember.role}</p>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2">Indices clés :</h4>
              <ul className="list-disc list-inside space-y-1">
                {guiltyMember.clues.map((clue, i) => (
                  <li key={i} className="text-sm">{clue}</li>
                ))}
              </ul>
            </Card>
          )}
          
          <div>
            <h3 className="text-xl font-bold mb-4">Leçons à retenir :</h3>
            <div className="grid gap-4">
              {scenario.lessons.map((lesson, i) => (
                <div key={i} className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Retour au jeu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Données de scénario
const projectFailureScenario: Scenario = {
  id: 'projet1',
  title: 'Le Déploiement Catastrophique',
  description: "Après 8 mois de développement, le système de gestion client Nexus a été déployé. Mais dès le premier jour, le système a connu de graves problèmes : perte de données, interfaces inutilisables, et performances désastreuses. Le projet a dû être annulé après seulement 2 jours en production, entraînant une perte financière estimée à 1,2 million d'euros. Votre mission est de découvrir qui, dans l'équipe, est principalement responsable de cet échec.",
  difficulty: "moyen",
  failureSummary: "Déploiement précipité sans tests suffisants, ignorance des alertes de l'équipe QA, et mauvaise communication entre équipes.",
  expectedOutcome: "Identifier le responsable principal de l'échec du projet Nexus.",
  team: [
    {
      id: 'tm1',
      name: 'Marc Durand',
      role: 'Chef de Projet',
      avatar: 'avatar1.svg',
      isGuilty: true,
      clues: [
        "A ignoré les rapports de test signalant des problèmes critiques",
        "A accéléré le déploiement malgré les avertissements de l'équipe technique",
        "A délibérément dissimulé des problèmes lors des réunions d'avancement",
        "A priorisé la date de livraison au détriment de la qualité"
      ],
      alibi: "En tant que chef de projet, Marc est effectivement responsable de l'échec du déploiement. Il a systématiquement ignoré les alertes de l'équipe technique, minimisé les problèmes dans ses rapports à la direction, et forcé le déploiement malgré les risques identifiés."
    },
    {
      id: 'tm2',
      name: 'Sophie Martin',
      role: 'Développeuse Senior',
      avatar: 'avatar2.svg',
      clues: [],
      alibi: 'Sophie avait signalé de nombreux problèmes techniques à la direction et documenté ses préoccupations. Elle avait même proposé un plan de remédiation qui n\'a pas été approuvé par la direction.'
    },
    {
      id: 'tm3',
      name: 'Thomas Lefebvre',
      role: 'Architecte Logiciel',
      avatar: 'avatar3.svg',
      clues: [],
      alibi: 'L\'architecture proposée par Thomas était solide et suivait les bonnes pratiques. Les problèmes sont survenus dans l\'implémentation et le déploiement, pas dans la conception initiale. Il avait documenté tous les risques potentiels.'
    },
    {
      id: 'tm4',
      name: 'Julie Dubois',
      role: 'Responsable QA',
      avatar: 'avatar4.svg',
      clues: [],
      alibi: 'Julie et son équipe avaient produit des rapports de test détaillés identifiant les problèmes critiques. Ces rapports ont été envoyés à la direction mais ont été ignorés. Elle a même escaladé le problème à la haute direction.'
    },
    {
      id: 'tm5',
      name: 'Antoine Moreau',
      role: 'Analyste Métier',
      avatar: 'avatar5.svg',
      clues: [],
      alibi: 'Les spécifications fonctionnelles d\'Antoine étaient précises et validées par les utilisateurs finaux. Les problèmes étaient d\'ordre technique et de gestion, pas d\'analyse des besoins.'
    }
  ],
  evidence: [
    {
      id: 'ev1',
      type: 'email',
      title: 'URGENT : Problèmes détectés lors des tests',
      from: 'Julie Dubois',
      to: 'Marc Durand, Équipe de direction',
      date: '15/03/2025',
      content: 'Bonjour Marc,\n\nNotre équipe QA a identifié plusieurs problèmes critiques lors des derniers tests :\n\n1. Perte de données lors de transactions simultanées\n2. Temps de réponse inacceptable sur le module client (> 10 secondes)\n3. Failles de sécurité sur l\'API externe\n\nJe recommande fortement de reporter le déploiement prévu pour la semaine prochaine. Nous avons besoin d\'au moins 3 semaines pour résoudre ces problèmes.\n\nBien cordialement,\nJulie',
      relatedTo: ['tm1', 'tm4']
    },
    {
      id: 'ev2',
      type: 'email',
      title: 'Re: URGENT : Problèmes détectés lors des tests',
      from: 'Marc Durand',
      to: 'Julie Dubois',
      date: '15/03/2025',
      content: 'Julie,\n\nNous ne pouvons pas nous permettre de reporter ce déploiement. Nos clients attendent cette version depuis des mois.\n\nTravaillez avec l\'équipe pour trouver des solutions temporaires, mais nous devons respecter la date prévue. Si nécessaire, nous publierons un correctif après le déploiement.\n\nLa direction a été claire : aucun report n\'est envisageable.\n\nMarc',
      relatedTo: ['tm1', 'tm4']
    },
    {
      id: 'ev3',
      type: 'document',
      title: 'Rapport de test final - Projet Nexus',
      content: 'RAPPORT DE TEST FINAL - PROJET NEXUS\n\nDate : 20/03/2025\nResponsable : Julie Dubois\n\nSTATUT GLOBAL : ÉCHEC\n\nTests fonctionnels : 76% de réussite\nTests de performance : 35% de réussite\nTests de sécurité : 42% de réussite\nTests d\'intégration : 51% de réussite\n\nPROBLÈMES CRITIQUES NON RÉSOLUS :\n- 7 bugs bloquants\n- 12 bugs critiques\n- Performance insuffisante sous charge\n\nRECOMMANDATION :\nL\'équipe QA ne peut PAS valider ce déploiement. Un report minimum de 3 semaines est nécessaire.\n\nSignatures :\nJulie Dubois, Responsable QA\nThomas Lefebvre, Architecte Logiciel\nSophie Martin, Développeuse Senior',
      relatedTo: ['tm1', 'tm2', 'tm3', 'tm4']
    },
    {
      id: 'ev4',
      type: 'chat',
      title: 'Conversation Slack - Équipe Technique',
      content: '[Sophie] @Thomas @Julie Avez-vous vu que Marc a validé le déploiement pour lundi malgré notre rapport ?\n\n[Thomas] Oui, c\'est de la folie. J\'ai essayé de lui parler hier, mais il m\'a dit que c\'était "un risque calculé".\n\n[Julie] C\'est irresponsable. Mon équipe a documenté plus de 20 problèmes critiques.\n\n[Sophie] J\'ai même proposé de travailler le week-end avec mon équipe, mais il a dit que ce n\'était pas nécessaire, que nous exagérions les problèmes.\n\n[Thomas] Je vais escalader à la direction. Nous ne pouvons pas déployer dans cet état.\n\n[Sophie] Garde une trace écrite de ton escalade. J\'ai l\'impression que Marc minimise délibérément les problèmes dans ses rapports d\'avancement.\n\n[Julie] Confirmé. J\'ai assisté à la dernière réunion avec la direction, et il a présenté notre système comme "prêt à 95%" alors que c\'est plutôt 60% dans le meilleur des cas.',
      relatedTo: ['tm1', 'tm2', 'tm3', 'tm4']
    },
    {
      id: 'ev5',
      type: 'document',
      title: 'Compte-rendu - Réunion d\'avancement du 18/03/2025',
      content: 'COMPTE-RENDU DE RÉUNION\n\nProjet : Nexus\nDate : 18/03/2025\nParticipants : Marc Durand, Antoine Moreau, Direction\n\nPOINTS ABORDÉS :\n\n1. Avancement global : Marc a présenté un avancement de 95% avec tous les modules principaux fonctionnels.\n\n2. Planning : Confirmation du déploiement pour le 25/03/2025.\n\n3. Risques : Quelques ajustements mineurs à effectuer, mais aucun risque majeur identifié.\n\n4. Budget : Respect du budget alloué.\n\nDÉCISIONS :\n- Validation du déploiement le 25/03 comme prévu\n- Session de formation utilisateurs programmée le 24/03\n\nRédacteur : Antoine Moreau',
      relatedTo: ['tm1', 'tm5']
    },
    {
      id: 'ev6',
      type: 'email',
      title: 'Escalade - Graves préoccupations concernant le déploiement',
      from: 'Thomas Lefebvre',
      to: 'Direction Générale, Marc Durand',
      date: '19/03/2025',
      content: 'Bonjour,\n\nJe me permets d\'escalader une situation préoccupante concernant le projet Nexus.\n\nContrairement à ce qui a été présenté lors de la dernière réunion d\'avancement, le système présente de nombreux problèmes critiques qui n\'ont pas été résolus. L\'équipe QA a formellement déconseillé le déploiement dans son dernier rapport.\n\nJe suis particulièrement inquiet car :\n\n1. Les problèmes de performance rendent le système inutilisable sous charge réelle\n2. Les problèmes de perte de données pourraient avoir des conséquences graves\n3. Les failles de sécurité identifiées exposent des données sensibles\n\nJe recommande formellement un report du déploiement d\'au moins 3 semaines.\n\nCordialement,\nThomas Lefebvre\nArchitecte Logiciel',
      relatedTo: ['tm1', 'tm3']
    },
    {
      id: 'ev7',
      type: 'email',
      title: 'Re: Escalade - Graves préoccupations concernant le déploiement',
      from: 'Marc Durand',
      to: 'Direction Générale, Thomas Lefebvre',
      date: '20/03/2025',
      content: 'Chers tous,\n\nJe tiens à rassurer tout le monde concernant les préoccupations soulevées par Thomas.\n\nL\'équipe technique a tendance à être trop prudente, ce qui est compréhensible. Cependant, j\'ai personnellement examiné les problèmes signalés et je les considère comme mineurs et gérables.\n\nNous avons investi des ressources considérables dans ce projet, et un retard supplémentaire aurait un impact financier significatif. Les quelques problèmes restants peuvent être résolus rapidement après le déploiement.\n\nJe maintiens donc le déploiement pour le 25/03 comme prévu.\n\nBien cordialement,\nMarc Durand\nChef de Projet',
      relatedTo: ['tm1', 'tm3']
    },
    {
      id: 'ev8',
      type: 'document',
      title: 'Rapport post-incident - Échec du déploiement Nexus',
      content: 'RAPPORT POST-INCIDENT\n\nProjet : Nexus\nDate : 27/03/2025\n\nRÉSUMÉ DE L\'INCIDENT :\nLe système Nexus a été déployé le 25/03 comme prévu. Dès les premières heures, de graves problèmes sont apparus :\n- Perte de données clients (estimée à 15% des transactions)\n- Temps de réponse inacceptables (30+ secondes)\n- Plantages fréquents des serveurs sous charge\n- Corruption de base de données sur le module financier\n\nAprès 2 jours de tentatives de correction en urgence, la décision a été prise de revenir à l\'ancien système. Impact financier estimé : 1,2M€.\n\nCAUSES IDENTIFIÉES :\n1. Déploiement effectué malgré les alertes formelles de l\'équipe QA\n2. Problèmes critiques connus mais non communiqués à la direction\n3. Absence de plan de contingence\n4. Tests insuffisants en environnement de pré-production\n\nRECOMMANDATIONS :\n1. Revoir la gouvernance du projet et les processus de validation de déploiement\n2. Mettre en place une escalade indépendante pour les alertes qualité\n3. Renforcer les tests en conditions réelles avant déploiement',
      relatedTo: ['tm1', 'tm2', 'tm3', 'tm4', 'tm5']
    }
  ],
  lessons: [
    "Ne jamais ignorer les alertes de l'équipe qualité, même sous pression commerciale ou de délai.",
    "Mettre en place un processus de go/no-go formel avec des critères objectifs pour autoriser un déploiement.",
    "Privilégier la transparence dans la communication, même lorsque les nouvelles sont mauvaises.",
    "Établir des canaux d'escalade indépendants pour permettre aux équipes techniques de signaler les risques.",
    "La qualité et la fiabilité doivent toujours primer sur le respect des délais pour les systèmes critiques."
  ]
};

// Composant Principal
export default function ProjetImposteur() {
  const [scenario, setScenario] = useState<Scenario>(projectFailureScenario);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState("dossier");
  const [accusationMade, setAccusationMade] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  
  const handleAccuse = () => {
    if (!selectedMember) {
      toast({
        title: "Erreur",
        description: "Vous devez sélectionner un membre de l'équipe avant de l'accuser.",
        variant: "destructive"
      });
      return;
    }
    
    setAccusationMade(true);
    setShowResult(true);
  };
  
  const startGame = () => {
    setGameStarted(true);
    setTimeOver(false);
    setAccusationMade(false);
    setSelectedMember(null);
    setSelectedEvidence(null);
  };
  
  const resetGame = () => {
    setGameStarted(false);
    setTimeOver(false);
    setAccusationMade(false);
    setShowResult(false);
    setSelectedMember(null);
    setSelectedEvidence(null);
  };
  
  const handleTimeOver = () => {
    setTimeOver(true);
    setShowResult(true);
  };

  // Fonction pour générer un nouveau scénario
  const generateNewScenario = async () => {
    try {
      setIsGeneratingScenario(true);
      
      const response = await axios.post('/api/amoa/generate-scenario', {
        difficultyLevel: 'moyen' // On peut permettre à l'utilisateur de choisir la difficulté plus tard
      });
      
      if (response.data) {
        setScenario(response.data);
        toast({
          title: "Nouveau scénario généré",
          description: "Un nouveau scénario a été généré avec succès !",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du scénario:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer un nouveau scénario. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };
  
  const isCorrectAccusation = selectedMember?.isGuilty === true;
  
  return (
    <HomeLayout>
      <PageTitle title="Qui est l'imposteur ?" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {!gameStarted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 shadow-lg">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <SearchCheck className="h-10 w-10 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold">Qui est l'imposteur ?</h1>
                <p className="text-lg text-gray-700 max-w-2xl">
                  Un projet important a échoué, et vous devez découvrir qui est le principal responsable. 
                  Analysez les documents, les emails et les conversations pour identifier le coupable.
                  Vous avez seulement <span className="font-bold text-red-500">3 minutes</span> pour résoudre l'enquête !
                </p>
                
                <div className="border-t border-gray-200 w-full pt-6 mt-6">
                  <h2 className="text-xl font-bold mb-4">Scénario : {scenario.title}</h2>
                  <p className="text-gray-700 mb-6">{scenario.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <Badge className="px-3 py-1 text-sm">
                      Difficulté : {scenario.difficulty}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      Temps : 3 minutes
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={startGame}
                    className="min-w-[180px]"
                  >
                    Commencer l'enquête
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={generateNewScenario}
                    disabled={isGeneratingScenario}
                    className="min-w-[180px]"
                  >
                    {isGeneratingScenario ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></span>
                        Génération...
                      </span>
                    ) : (
                      'Nouveau scénario'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <CountdownTimer seconds={180} onComplete={handleTimeOver} />
                
                <Button 
                  onClick={handleAccuse} 
                  variant="destructive"
                  disabled={accusationMade || timeOver}
                >
                  Accuser
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-1">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Équipe Projet
                </h2>
                <div className="space-y-3">
                  {scenario.team.map(member => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      onClick={() => setSelectedMember(member)}
                      isSelected={selectedMember?.id === member.id}
                    />
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <Tabs 
                  defaultValue="dossier" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="dossier">Dossier</TabsTrigger>
                    <TabsTrigger value="preuves">Preuves</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dossier" className="space-y-4">
                    <h2 className="text-xl font-bold">Résumé de l'incident</h2>
                    <p className="text-gray-700">{scenario.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="p-4">
                        <h3 className="font-bold text-lg mb-2">Objectif</h3>
                        <p>{scenario.expectedOutcome}</p>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-bold text-lg mb-2">Impact de l'échec</h3>
                        <p>{scenario.failureSummary}</p>
                      </Card>
                    </div>
                    
                    {selectedMember && (
                      <Card className="p-4 mt-4 bg-purple-50">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${selectedMember.avatar}`} alt={selectedMember.name} />
                            <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{selectedMember.name}</h3>
                            <p className="text-sm text-gray-600">{selectedMember.role}</p>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleAccuse} 
                          variant="destructive"
                          disabled={accusationMade || timeOver}
                          className="w-full"
                        >
                          Accuser {selectedMember.name}
                        </Button>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="preuves" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h2 className="text-lg font-bold">Documents disponibles</h2>
                        {scenario.evidence.map(ev => (
                          <EvidenceCard 
                            key={ev.id} 
                            evidence={ev} 
                            onClick={() => setSelectedEvidence(ev)}
                          />
                        ))}
                      </div>
                      
                      <div className="lg:col-span-2">
                        {selectedEvidence ? (
                          <EvidenceViewer evidence={selectedEvidence} />
                        ) : (
                          <Card className="p-6 h-[400px] flex items-center justify-center text-gray-400">
                            Sélectionnez un document pour le consulter
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ResultDialog 
        open={showResult} 
        setOpen={(open) => {
          setShowResult(open);
          if (!open) resetGame();
        }}
        isCorrect={isCorrectAccusation}
        scenario={scenario}
        selectedMember={selectedMember}
      />
    </HomeLayout>
  );
}