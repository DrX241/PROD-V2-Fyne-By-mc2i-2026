import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  SearchCheck, 
  Clock, 
  FileText, 
  User, 
  Mail, 
  MessagesSquare, 
  Check, 
  X,
  ChevronRight,
  Users,
  PlusCircle,
  Flame as FlameIcon
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
      <Clock className="h-5 w-5 text-red-400" />
      <div className="text-xl font-mono font-bold text-white">
        {minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
      </div>
      <Progress value={(timeLeft / seconds) * 100} className="w-40 h-2 bg-gray-800" />
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
        isSelected 
          ? 'ring-2 ring-purple-500 shadow-lg bg-gray-900' 
          : 'hover:shadow-md hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/avatars/${member.avatar}`} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-white">{member.name}</h3>
          <p className="text-sm text-gray-300">{member.role}</p>
        </div>
      </div>
    </Card>
  );
};

const EvidenceCard = ({ evidence, onClick }: { evidence: Evidence, onClick: () => void }) => {
  const IconMap = {
    email: Mail,
    chat: MessagesSquare,
    document: FileText,
    // Fallback pour tous les autres types de documents
    rapport: FileText,
    "compte-rendu": FileText,
    note: FileText,
    "feuille-calcul": FileText,
    presentation: FileText,
    screenshot: FileText // Changé de Image à FileText car Image n'est pas importé
  };
  
  // Utiliser FileText par défaut si le type n'est pas trouvé dans la map
  const Icon = IconMap[evidence.type] || FileText;
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md hover:bg-gray-800 transition-all bg-gray-900"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-purple-900 p-2 rounded-lg">
          <Icon className="h-5 w-5 text-purple-200" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-white">{evidence.title}</h3>
          <p className="text-xs text-gray-300">{evidence.type === 'email' ? `De: ${evidence.from}` : evidence.type}</p>
        </div>
      </div>
    </Card>
  );
};

const EvidenceViewer = ({ evidence }: { evidence: Evidence | null }) => {
  if (!evidence) return null;
  
  return (
    <Card className="p-6 h-[400px] overflow-y-auto bg-gray-900 border border-gray-800">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{evidence.title}</h2>
          <Badge variant={
            evidence.type === 'email' ? 'default' : 
            evidence.type === 'chat' ? 'outline' : 'secondary'
          } className="bg-blue-800 text-white border-none">
            {evidence.type === 'email' ? 'Email' : 
             evidence.type === 'chat' ? 'Conversation' : 'Document'}
          </Badge>
        </div>
        
        {evidence.type === 'email' && (
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <p className="text-sm text-gray-200"><strong>De:</strong> {evidence.from}</p>
            <p className="text-sm text-gray-200"><strong>À:</strong> {evidence.to}</p>
            <p className="text-sm text-gray-200"><strong>Date:</strong> {evidence.date}</p>
          </div>
        )}
        
        <div className="mt-6 text-gray-200 bg-gray-800 p-4 rounded-md border border-gray-700">
          <div className="evidence-content" style={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6', 
            letterSpacing: '0.01em',
            fontSize: '0.95rem'
          }}>
            {/* Remplacer les sauts de ligne uniques par des sauts de paragraphe pour une meilleure lisibilité */}
            {evidence.content
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx} className={idx < evidence.content.split('\n\n').length - 1 ? "mb-4" : "mb-0"}>
                  {paragraph.split('\n').map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {line}
                      {lineIdx < paragraph.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              ))
            }
          </div>
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
      <DialogContent className="max-w-2xl bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center text-white">
            {isCorrect ? (
              <><Check className="h-6 w-6 text-green-400 mr-2" /> Félicitations !</>
            ) : (
              <><X className="h-6 w-6 text-red-400 mr-2" /> Ce n'est pas la bonne personne</>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-6">
          {!isCorrect && selectedMember && (
            <Card className="p-4 bg-red-900 border border-red-800 text-white">
              <h3 className="font-bold text-lg mb-2">Pourquoi ce n'est pas {selectedMember.name} ?</h3>
              <p className="text-gray-200">{selectedMember.alibi}</p>
            </Card>
          )}
          
          {guiltyMember && (
            <Card className="p-4 bg-green-900 border border-green-800 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/${guiltyMember.avatar}`} alt={guiltyMember.name} />
                  <AvatarFallback>{guiltyMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-white">{guiltyMember.name} était responsable</h3>
                  <p className="text-sm text-gray-300">{guiltyMember.role}</p>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-white">Indices clés :</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {guiltyMember.clues.map((clue, i) => (
                  <li key={i} className="text-sm">{clue}</li>
                ))}
              </ul>
            </Card>
          )}
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Leçons à retenir :</h3>
            <div className="grid gap-4">
              {scenario.lessons.map((lesson, i) => (
                <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-gray-200">{lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={() => setOpen(false)} className="bg-blue-700 hover:bg-blue-800">Retour au jeu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dialogue d'échec lorsque le temps est écoulé
const FailureDialog = ({ 
  open, 
  setOpen, 
  scenario,
  onRetry,
  onNew
}: { 
  open: boolean, 
  setOpen: (open: boolean) => void, 
  scenario: Scenario,
  onRetry: () => void,
  onNew: () => void
}) => {
  const guiltyMember = scenario.team.find(m => m.isGuilty);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center text-white">
            <X className="h-6 w-6 text-red-400 mr-2" /> Temps écoulé !
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-6">
          <Card className="p-4 bg-red-900 border border-red-800 text-white">
            <h3 className="font-bold text-lg mb-2">Mission échouée</h3>
            <p className="text-gray-200">{scenario.failureSummary}</p>
          </Card>
          
          {guiltyMember && (
            <Card className="p-4 bg-gray-800 border border-gray-700 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/${guiltyMember.avatar}`} alt={guiltyMember.name} />
                  <AvatarFallback>{guiltyMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-white">{guiltyMember.name} était responsable</h3>
                  <p className="text-sm text-gray-300">{guiltyMember.role}</p>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-white">Indices que vous avez manqués :</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {guiltyMember.clues.map((clue, i) => (
                  <li key={i} className="text-sm">{clue}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={onRetry} className="bg-blue-700 hover:bg-blue-800 flex-1">
            Recommencer ce scénario
          </Button>
          <Button onClick={onNew} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 flex-1">
            Essayer un nouveau scénario
          </Button>
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
// Carte de scénario pour la sélection
const ScenarioSelectionCard = ({ 
  scenario,
  onClick,
  isSelected
}: { 
  scenario: Scenario;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const { themeMode } = { themeMode: 'classic' }; // Mock pour compatibilité avec le reste de l'application
  const isFuturistic = themeMode === 'futuristic';
  const [isHover, setIsHover] = useState(false);
  
  // Extraire les membres de l'équipe
  const teamCount = scenario.team?.length || 0;
  
  // Trouver le membre coupable (pour l'admin uniquement)
  const guiltyMember = scenario.team?.find(member => member.isGuilty);
  
  return (
    <motion.div
      className={`rounded-xl p-5 shadow-md h-full relative overflow-hidden cursor-pointer ${
        isSelected 
          ? 'bg-white border-2 border-purple-500' 
          : 'bg-white border border-gray-200 hover:bg-gray-50'
      }`}
      whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(124, 58, 237, 0.15)' }}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge de difficulté */}
      <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
        scenario.difficulty === 'facile' 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : scenario.difficulty === 'moyen'
            ? 'bg-blue-100 text-blue-800 border border-blue-300'
            : 'bg-red-100 text-red-800 border border-red-300'
      } font-medium`}>
        {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
      </div>
      
      {/* Titre */}
      <h3 className="text-lg font-semibold mb-2 mt-1 pr-20 text-gray-900">
        {scenario.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-700 text-sm line-clamp-3 mb-3">
        {scenario.description}
      </p>
      
      {/* Information sur l'équipe */}
      <div className="mt-3 mb-2">
        <div className="flex items-center text-xs uppercase tracking-wide font-semibold mb-2 text-purple-700">
          <Users className="h-3.5 w-3.5 mr-1" />
          Équipe: {teamCount} membres
        </div>
      </div>
      
      {/* Ligne décorative en bas */}
      <div className="absolute bottom-0 left-0 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      
      {/* Effet sur survol */}
      {isHover && (
        <div className="absolute inset-0 bg-purple-100/70 z-0"></div>
      )}
    </motion.div>
  );
};

export default function ProjetImposteur() {
  const [scenario, setScenario] = useState<Scenario>(projectFailureScenario);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState("dossier");
  const [accusationMade, setAccusationMade] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(true); // Démarrer avec génération en cours
  // Suppression de la variable selectedDifficulty qui n'est plus nécessaire
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [scenarioLoaded, setScenarioLoaded] = useState(false); // Pour suivre si un scénario a été chargé
  
  // Nouveaux états pour la sélection de scénarios
  const [showScenarioSelection, setShowScenarioSelection] = useState(true); // Commencer par la sélection
  const [availableScenarios, setAvailableScenarios] = useState<Scenario[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [nextUpdateTime, setNextUpdateTime] = useState<string | null>(null); // Heure de la prochaine mise à jour
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null); // Temps restant formaté
  
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
    
    // Vérifier si l'accusation est correcte ou non
    const isCorrect = selectedMember.isGuilty === true;
    
    if (isCorrect) {
      // Si l'accusation est correcte, afficher le dialogue de réussite
      setShowResult(true);
    } else {
      // Si l'accusation est incorrecte, afficher le dialogue d'échec
      setShowFailureDialog(true);
    }
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
    setShowFailureDialog(false);
    setSelectedMember(null);
    setSelectedEvidence(null);
  };
  
  const handleTimeOver = () => {
    setTimeOver(true);
    setShowFailureDialog(true);
  };

  // Fonction pour générer un nouveau scénario avec timeout et retry
  const generateNewScenario = async (retryCount = 0, forceDifficult = false) => {
    try {
      setIsGeneratingScenario(true);
      
      // Ajouter un timeout pour éviter d'attendre trop longtemps
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout dépassé")), 15000);
      });
      
      // Utiliser une répartition équilibrée de difficulté
      const difficulties = ['facile', 'moyen', 'difficile'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      // Si forceDifficult est true, on force un scénario difficile
      const difficultyToUse = forceDifficult ? 'difficile' : randomDifficulty;
      
      const fetchPromise = axios.post('/api/amoa/generate-scenario', {
        difficultyLevel: difficultyToUse
      });
      
      // Race entre le timeout et la requête
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (response && response.data) {
        setScenario(response.data);
        
        toast({
          title: "Nouveau scénario généré",
          description: `Un nouveau scénario de difficulté ${response.data.difficulty} a été généré avec succès !`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du scénario:", (error as any)?.response?.data || error);
      
      // Retry une fois en cas d'erreur
      if (retryCount < 1) {
        toast({
          title: "Nouvelle tentative",
          description: "La première tentative a échoué, essai avec des paramètres simplifiés...",
          variant: "default"
        });
        
        // Attendre une seconde avant de réessayer en gardant le même forceDifficult
        setTimeout(() => generateNewScenario(retryCount + 1, forceDifficult), 1000);
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de générer un nouveau scénario. Veuillez réessayer.",
        variant: "destructive"
      });
      setIsGeneratingScenario(false);
    } finally {
      if (retryCount > 0) setIsGeneratingScenario(false);
    }
  };
  
  // Fonction pour charger les scénarios disponibles
  const loadAvailableScenarios = async () => {
    try {
      setIsLoadingScenarios(true);
      const response = await axios.get('/api/amoa/scenarios', {
        params: { count: 10 }
      });
      
      if (response.data && response.data.scenarios) {
        setAvailableScenarios(response.data.scenarios);
        
        // Récupérer l'heure de prochaine mise à jour
        if (response.data.nextUpdate) {
          setNextUpdateTime(response.data.nextUpdate);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des scénarios:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les scénarios disponibles. Un scénario par défaut sera utilisé.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingScenarios(false);
    }
  };

  // Fonction pour sélectionner un scénario et commencer le jeu
  const selectScenarioAndPlay = (selectedScenario: Scenario) => {
    setScenario(selectedScenario);
    setShowScenarioSelection(false);
    setSelectedScenarioId(selectedScenario.id);
    setScenarioLoaded(true);
  };

  // Fonction pour formater le temps restant
  const formatTimeRemaining = (nextUpdateISO: string) => {
    const now = new Date();
    const nextUpdate = new Date(nextUpdateISO);
    const diffMs = nextUpdate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return "En cours d'actualisation...";
    }
    
    // Convertir en minutes et secondes
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMinutes} min ${diffSeconds} sec`;
  };
  
  // Mettre à jour le temps restant toutes les secondes et recharger quand nécessaire
  useEffect(() => {
    if (nextUpdateTime) {
      // Fonction pour vérifier et mettre à jour le temps restant
      const checkAndUpdateTime = () => {
        const now = new Date();
        const nextUpdate = new Date(nextUpdateTime);
        const diffMs = nextUpdate.getTime() - now.getTime();
        
        // Si le temps est écoulé, recharger les scénarios
        if (diffMs <= 0) {
          loadAvailableScenarios();
          return "En cours d'actualisation...";
        }
        
        return formatTimeRemaining(nextUpdateTime);
      };
      
      // Initialiser le temps restant
      setTimeRemaining(checkAndUpdateTime());
      
      // Mettre à jour toutes les secondes
      const interval = setInterval(() => {
        setTimeRemaining(checkAndUpdateTime());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [nextUpdateTime]);
  
  // Charger les scénarios au chargement de la page
  useEffect(() => {
    // Si on est en mode sélection, charger les scénarios disponibles
    if (showScenarioSelection) {
      loadAvailableScenarios();
    }
    // Sinon, générer un scénario unique si nécessaire
    else if (!scenarioLoaded) {
      generateNewScenario(0);
      setScenarioLoaded(true);
    }
  }, [showScenarioSelection, scenarioLoaded]);

  const isCorrectAccusation = selectedMember?.isGuilty === true;
  
  return (
    <HomeLayout>
      <PageTitle title="Qui est l'imposteur ?" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {!gameStarted ? (
          showScenarioSelection ? (
            // Page de sélection des scénarios
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-950 p-6 rounded-xl border border-gray-800"
            >
              <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-purple-900 rounded-full mb-4">
                  <SearchCheck className="h-10 w-10 text-purple-300" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Qui est l'imposteur ?</h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Un projet important a échoué, et vous devez découvrir qui est le principal responsable. 
                  Analysez les documents, les emails et les conversations pour identifier le coupable.
                  Vous avez seulement <span className="font-bold text-red-400">3 minutes</span> pour résoudre l'enquête !
                </p>
              </div>
  
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Choisissez un scénario</h2>
                <p className="text-center text-gray-300 mb-6">Les scénarios sont classés par niveau de difficulté croissant (facile, moyen, difficile)</p>
                
                {isLoadingScenarios ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-b-4 border-purple-600"></div>
                      <p className="text-purple-300 font-medium">Chargement des scénarios...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {availableScenarios.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableScenarios
                          .sort((a, b) => {
                            // Trier les scénarios par difficulté: facile, moyen, difficile
                            const difficultyOrder = { 'facile': 0, 'moyen': 1, 'difficile': 2 };
                            return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
                          })
                          .map(availableScenario => (
                            <ScenarioSelectionCard
                              key={availableScenario.id}
                              scenario={availableScenario}
                              onClick={() => selectScenarioAndPlay(availableScenario)}
                              isSelected={selectedScenarioId === availableScenario.id}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-400 mb-4">Aucun scénario disponible. Essayez de générer un nouveau scénario.</p>
                        <Button 
                          onClick={() => generateNewScenario(0)}
                          disabled={isGeneratingScenario}
                        >
                          {isGeneratingScenario ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></span>
                              Génération...
                            </span>
                          ) : (
                            'Générer un scénario'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col items-center mt-8 space-y-4">
                  {timeRemaining && (
                    <div className="text-center mb-2 rounded-lg p-3 inline-flex items-center text-gray-900 bg-gray-100">
                      <Clock className="h-4 w-4 mr-2 text-purple-700" />
                      <span className="text-sm font-medium">
                        Actualisation dans : {timeRemaining}
                      </span>
                    </div>
                  )}
                
                  <Button 
                    variant="outline" 
                    onClick={() => generateNewScenario(0)}
                    disabled={isGeneratingScenario}
                    className="text-white border-gray-600 hover:bg-gray-800"
                  >
                    {isGeneratingScenario ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></span>
                        Génération...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Générer un nouveau scénario
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Page de détail du scénario sélectionné
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-8 shadow-lg bg-gray-950 border border-gray-800">
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="p-3 bg-purple-900 rounded-full">
                    <SearchCheck className="h-10 w-10 text-purple-300" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Qui est l'imposteur ?</h1>
                  
                  <div className="border-t border-gray-700 w-full pt-6 mt-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Scénario : {scenario.title}</h2>
                    <p className="text-gray-300 mb-6">{scenario.description}</p>
                    
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      <Badge className={`px-3 py-1 text-sm text-white ${
                        scenario.difficulty === 'facile' 
                          ? 'bg-green-700' 
                          : scenario.difficulty === 'moyen'
                            ? 'bg-blue-700'
                            : 'bg-red-700'
                      }`}>
                        Difficulté : {scenario.difficulty}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1 text-sm border-gray-600 text-gray-300">
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
                      onClick={() => setShowScenarioSelection(true)}
                      className="min-w-[180px] text-white border-gray-600 hover:bg-gray-800"
                    >
                      Revenir à la sélection
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-950 p-4 rounded-lg shadow-sm border border-gray-800">
              <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
              
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
              <div className="bg-gray-950 rounded-lg shadow-sm p-4 lg:col-span-1 border border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                  <Users className="h-5 w-5 mr-2 text-purple-400" />
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
                  className="bg-gray-950 rounded-lg shadow-sm p-4 border border-gray-800"
                >
                  <TabsList className="mb-4 bg-gray-800">
                    <TabsTrigger value="dossier" className="data-[state=active]:bg-blue-600 data-[state=inactive]:text-gray-300 data-[state=active]:text-white">Dossier</TabsTrigger>
                    <TabsTrigger value="preuves" className="data-[state=active]:bg-blue-600 data-[state=inactive]:text-gray-300 data-[state=active]:text-white">Preuves</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dossier" className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Résumé de l'incident</h2>
                    <p className="text-gray-300">{scenario.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="p-4 bg-gray-900 border border-gray-800">
                        <h3 className="font-bold text-lg mb-2 text-white">Objectif</h3>
                        <p className="text-gray-300">{scenario.expectedOutcome}</p>
                      </Card>
                      <Card className="p-4 bg-gray-900 border border-gray-800">
                        <h3 className="font-bold text-lg mb-2 text-white">Impact de l'échec</h3>
                        <p className="text-gray-300">{scenario.failureSummary}</p>
                      </Card>
                    </div>
                    
                    {selectedMember && (
                      <Card className="p-4 mt-4 bg-gray-900 border border-purple-800">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${selectedMember.avatar}`} alt={selectedMember.name} />
                            <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg text-white">{selectedMember.name}</h3>
                            <p className="text-sm text-gray-300">{selectedMember.role}</p>
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
                      <div className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
                        <h2 className="text-lg font-bold text-white">Documents disponibles</h2>
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
                          <Card className="p-6 h-[400px] flex items-center justify-center text-gray-300 bg-gray-900 border border-gray-800">
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
      
      <FailureDialog
        open={showFailureDialog}
        setOpen={(open) => {
          setShowFailureDialog(open);
          if (!open) resetGame();
        }}
        scenario={scenario}
        onRetry={() => {
          setShowFailureDialog(false);
          startGame();
        }}
        onNew={() => {
          setShowFailureDialog(false);
          generateNewScenario(0).then(() => resetGame());
        }}
      />
    </HomeLayout>
  );
}