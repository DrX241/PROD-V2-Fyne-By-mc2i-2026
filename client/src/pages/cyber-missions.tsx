import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ChatInterface from '@/components/cyber/ChatInterface';
import { useChatContext } from '@/contexts/ChatContext';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import { 
  CheckCircle2, 
  LockIcon, 
  Shield, 
  Brain, 
  MessageSquare, 
  Puzzle, 
  Terminal,
  ArrowLeftCircle
} from 'lucide-react';

// Types de missions disponibles
const MISSION_TYPES = {
  TECHNICAL: 'technical',
  ARCADE: 'arcade',
  CONVERSATION: 'conversation',
  EDUCATIONAL: 'educational'
};

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  domain: string;
  badgeId?: string;
}

export default function CyberMissions() {
  const [, setLocation] = useLocation();
  const { 
    userName, 
    avatarId, 
    playerRole,
    difficultyLevel,
    setCurrentMission
  } = useChatContext();
  
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Missions préchargées pour la démonstration
  const [missions, setMissions] = useState<Mission[]>([
    // Missions techniques
    {
      id: 'tech-logs-analysis',
      title: 'Analyse de logs suspects',
      description: 'Identifiez les indicateurs de compromission dans des logs de serveur web après une tentative d\'intrusion.',
      type: MISSION_TYPES.TECHNICAL,
      difficulty: 'Débutant',
      contactName: 'Yousra SAIDANI',
      contactRole: 'Experte Cybersécurité & CFO',
      contactAvatar: 'avatar2',
      status: 'available',
      domain: 'Gestion des incidents de sécurité'
    },
    {
      id: 'tech-firewall-config',
      title: 'Configuration de pare-feu',
      description: 'Établissez une stratégie de configuration de pare-feu pour protéger un nouveau déploiement cloud.',
      type: MISSION_TYPES.TECHNICAL,
      difficulty: 'Intermédiaire',
      contactName: 'Neil LEVIN',
      contactRole: 'Expert cybersécurité & CFO',
      contactAvatar: 'avatar3',
      status: 'locked',
      domain: 'Stratégie et gouvernance cybersécurité'
    },
    
    // Missions arcade
    {
      id: 'arcade-password-puzzle',
      title: 'L\'énigme du mot de passe',
      description: 'Déchiffrez un système de mots de passe complexe pour accéder à un système critique.',
      type: MISSION_TYPES.ARCADE,
      difficulty: 'Débutant',
      contactName: 'Eddy MISSONI IDEMBI',
      contactRole: 'Expert Data / IA & CTO',
      contactAvatar: 'avatar5',
      status: 'available',
      domain: 'Protection des données personnelles / RGPD',
      badgeId: 'decoder'
    },
    {
      id: 'arcade-crypto-challenge',
      title: 'Le défi cryptographique',
      description: 'Résolvez une série d\'énigmes pour comprendre les principes fondamentaux de la cryptographie.',
      type: MISSION_TYPES.ARCADE,
      difficulty: 'Intermédiaire',
      contactName: 'Lorenzo Bertola',
      contactRole: 'Directeur Général Adjoint et Directeur du pôle BFA',
      contactAvatar: 'avatar6',
      status: 'locked',
      domain: 'Stratégie et gouvernance cybersécurité',
      badgeId: 'crypto-expert'
    },
    
    // Missions conversationnelles
    {
      id: 'conv-phishing-awareness',
      title: 'Sensibilisation au phishing',
      description: 'Élaborez un plan de sensibilisation des employés pour contrer les attaques de phishing croissantes.',
      type: MISSION_TYPES.CONVERSATION,
      difficulty: 'Débutant',
      contactName: 'Marion Lopez',
      contactRole: 'Senior Partner et Directrice Marketing, Communication et RSE',
      contactAvatar: 'avatar7',
      status: 'available',
      domain: 'Ingénierie sociale et phishing'
    },
    {
      id: 'conv-incident-response',
      title: 'Gestion de crise cyber',
      description: 'Participez à une cellule de crise simulée suite à une attaque ransomware majeure.',
      type: MISSION_TYPES.CONVERSATION,
      difficulty: 'Expert',
      contactName: 'Arnaud Gauthier',
      contactRole: 'Président',
      contactAvatar: 'avatar8',
      status: 'locked',
      domain: 'Gestion de crise cyber'
    },
    
    // Missions éducatives
    {
      id: 'edu-rgpd-basics',
      title: 'Fondamentaux du RGPD',
      description: 'Apprenez les principes essentiels du RGPD à travers un parcours pédagogique interactif.',
      type: MISSION_TYPES.EDUCATIONAL,
      difficulty: 'Débutant',
      contactName: 'Isabelle Dubacq',
      contactRole: 'Senior Partner, Directrice des Ressources Humaines',
      contactAvatar: 'avatar1',
      status: 'available',
      domain: 'Protection des données personnelles / RGPD',
      badgeId: 'rgpd-certified'
    },
    {
      id: 'edu-threat-landscape',
      title: 'Panorama des menaces cyber',
      description: 'Découvrez les principales menaces actuelles et les tendances émergentes en cybersécurité.',
      type: MISSION_TYPES.EDUCATIONAL,
      difficulty: 'Intermédiaire',
      contactName: 'Julien Grimault',
      contactRole: 'Senior Partner - Directeur d\'unité, Sponsor du centre d\'expertise Cybersécurité',
      contactAvatar: 'avatar4',
      status: 'locked',
      domain: 'Stratégie et gouvernance cybersécurité',
      badgeId: 'threat-expert'
    }
  ]);

  // Filtrer les missions selon l'onglet sélectionné
  const filteredMissions = selectedTab === 'all' 
    ? missions 
    : missions.filter(mission => mission.type === selectedTab);

  // Sélectionner une mission active
  const handleSelectMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    
    if (mission && mission.status !== 'locked') {
      setActiveMissionId(missionId);
      setCurrentMission(mission);
    }
  };

  // Fermer la mission active
  const handleCloseMission = () => {
    setActiveMissionId(null);
  };

  // Obtenir l'icône selon le type de mission
  const getMissionIcon = (type: string) => {
    switch(type) {
      case MISSION_TYPES.TECHNICAL: 
        return <Terminal className="h-5 w-5" />;
      case MISSION_TYPES.ARCADE: 
        return <Puzzle className="h-5 w-5" />;
      case MISSION_TYPES.CONVERSATION: 
        return <MessageSquare className="h-5 w-5" />;
      case MISSION_TYPES.EDUCATIONAL: 
        return <Brain className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Obtenir la couleur de l'étiquette selon le type de mission
  const getMissionBadgeVariant = (type: string) => {
    switch(type) {
      case MISSION_TYPES.TECHNICAL: 
        return 'destructive';
      case MISSION_TYPES.ARCADE: 
        return 'secondary';
      case MISSION_TYPES.CONVERSATION: 
        return 'outline';
      case MISSION_TYPES.EDUCATIONAL: 
        return 'default';
      default:
        return 'default';
    }
  };

  // Obtenir l'étiquette de statut
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge variant="default" className="ml-2 bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Terminé</Badge>;
      case 'locked':
        return <Badge variant="outline" className="ml-2"><LockIcon className="h-3 w-3 mr-1" /> Verrouillé</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="ml-2">En cours</Badge>;
      default:
        return null;
    }
  };

  // Obtenir la mission active
  const activeMission = activeMissionId ? missions.find(m => m.id === activeMissionId) : null;

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {!activeMissionId ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Centre de missions</h1>
              <p className="text-muted-foreground">
                Choisissez parmi les différentes missions disponibles pour développer vos compétences en cybersécurité
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold">{userName}</div>
                <div className="text-sm text-muted-foreground">{playerRole}</div>
              </div>
              <AvatarDisplay avatarId={avatarId} size="lg" />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value={MISSION_TYPES.TECHNICAL}>Techniques</TabsTrigger>
              <TabsTrigger value={MISSION_TYPES.ARCADE}>Arcade</TabsTrigger>
              <TabsTrigger value={MISSION_TYPES.CONVERSATION}>Conversation</TabsTrigger>
              <TabsTrigger value={MISSION_TYPES.EDUCATIONAL}>Éducatives</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <Card key={mission.id} className={mission.status === 'locked' ? 'opacity-70' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant={getMissionBadgeVariant(mission.type)} className="mb-2">
                          {getMissionIcon(mission.type)}
                          <span className="ml-1">
                            {mission.type === MISSION_TYPES.TECHNICAL && 'Technique'}
                            {mission.type === MISSION_TYPES.ARCADE && 'Arcade'}
                            {mission.type === MISSION_TYPES.CONVERSATION && 'Conversation'}
                            {mission.type === MISSION_TYPES.EDUCATIONAL && 'Éducative'}
                          </span>
                        </Badge>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                      <CardDescription>{mission.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{mission.description}</p>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AvatarDisplay avatarId={mission.contactAvatar} size="sm" />
                          <div className="ml-2">
                            <div className="font-semibold text-xs">{mission.contactName}</div>
                            <div className="text-xs opacity-70">{mission.contactRole}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline">{mission.difficulty}</Badge>
                      <Button 
                        onClick={() => handleSelectMission(mission.id)}
                        disabled={mission.status === 'locked'}
                      >
                        {mission.status === 'locked' ? 'Verrouillé' : 'Démarrer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value={MISSION_TYPES.TECHNICAL} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <Card key={mission.id} className={mission.status === 'locked' ? 'opacity-70' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="destructive" className="mb-2">
                          <Terminal className="h-3 w-3 mr-1" />
                          Technique
                        </Badge>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                      <CardDescription>{mission.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{mission.description}</p>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AvatarDisplay avatarId={mission.contactAvatar} size="sm" />
                          <div className="ml-2">
                            <div className="font-semibold text-xs">{mission.contactName}</div>
                            <div className="text-xs opacity-70">{mission.contactRole}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline">{mission.difficulty}</Badge>
                      <Button 
                        onClick={() => handleSelectMission(mission.id)}
                        disabled={mission.status === 'locked'}
                      >
                        {mission.status === 'locked' ? 'Verrouillé' : 'Démarrer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value={MISSION_TYPES.ARCADE} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <Card key={mission.id} className={mission.status === 'locked' ? 'opacity-70' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">
                          <Puzzle className="h-3 w-3 mr-1" />
                          Arcade
                        </Badge>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                      <CardDescription>{mission.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{mission.description}</p>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AvatarDisplay avatarId={mission.contactAvatar} size="sm" />
                          <div className="ml-2">
                            <div className="font-semibold text-xs">{mission.contactName}</div>
                            <div className="text-xs opacity-70">{mission.contactRole}</div>
                          </div>
                        </div>
                      </div>
                      {mission.badgeId && (
                        <div className="mt-2 text-xs">
                          <Badge variant="outline" className="bg-muted/50">Badge: {mission.badgeId}</Badge>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline">{mission.difficulty}</Badge>
                      <Button 
                        onClick={() => handleSelectMission(mission.id)}
                        disabled={mission.status === 'locked'}
                      >
                        {mission.status === 'locked' ? 'Verrouillé' : 'Démarrer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value={MISSION_TYPES.CONVERSATION} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <Card key={mission.id} className={mission.status === 'locked' ? 'opacity-70' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Conversation
                        </Badge>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                      <CardDescription>{mission.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{mission.description}</p>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AvatarDisplay avatarId={mission.contactAvatar} size="sm" />
                          <div className="ml-2">
                            <div className="font-semibold text-xs">{mission.contactName}</div>
                            <div className="text-xs opacity-70">{mission.contactRole}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline">{mission.difficulty}</Badge>
                      <Button 
                        onClick={() => handleSelectMission(mission.id)}
                        disabled={mission.status === 'locked'}
                      >
                        {mission.status === 'locked' ? 'Verrouillé' : 'Démarrer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value={MISSION_TYPES.EDUCATIONAL} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <Card key={mission.id} className={mission.status === 'locked' ? 'opacity-70' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="default" className="mb-2">
                          <Brain className="h-3 w-3 mr-1" />
                          Éducative
                        </Badge>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                      <CardDescription>{mission.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{mission.description}</p>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <AvatarDisplay avatarId={mission.contactAvatar} size="sm" />
                          <div className="ml-2">
                            <div className="font-semibold text-xs">{mission.contactName}</div>
                            <div className="text-xs opacity-70">{mission.contactRole}</div>
                          </div>
                        </div>
                      </div>
                      {mission.badgeId && (
                        <div className="mt-2 text-xs">
                          <Badge variant="outline" className="bg-muted/50">Badge: {mission.badgeId}</Badge>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Badge variant="outline">{mission.difficulty}</Badge>
                      <Button 
                        onClick={() => handleSelectMission(mission.id)}
                        disabled={mission.status === 'locked'}
                      >
                        {mission.status === 'locked' ? 'Verrouillé' : 'Démarrer'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <Button variant="outline" onClick={() => setLocation('/')}>
              <ArrowLeftCircle className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </>
      ) : (
        // Affichage de la mission active
        activeMission && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <Button variant="ghost" onClick={handleCloseMission} className="mb-2">
                  <ArrowLeftCircle className="h-4 w-4 mr-2" />
                  Retour aux missions
                </Button>
                <h1 className="text-2xl font-bold">{activeMission.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getMissionBadgeVariant(activeMission.type)}>
                    {getMissionIcon(activeMission.type)}
                    <span className="ml-1">
                      {activeMission.type === MISSION_TYPES.TECHNICAL && 'Technique'}
                      {activeMission.type === MISSION_TYPES.ARCADE && 'Arcade'}
                      {activeMission.type === MISSION_TYPES.CONVERSATION && 'Conversation'}
                      {activeMission.type === MISSION_TYPES.EDUCATIONAL && 'Éducative'}
                    </span>
                  </Badge>
                  <Badge variant="outline">{activeMission.difficulty}</Badge>
                  <span className="text-sm text-muted-foreground">{activeMission.domain}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold">{userName}</div>
                  <div className="text-sm text-muted-foreground">{playerRole}</div>
                </div>
                <AvatarDisplay avatarId={avatarId} size="lg" />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de la mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{activeMission.description}</p>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-2">Contact principal :</h3>
                      <div className="flex items-center">
                        <AvatarDisplay avatarId={activeMission.contactAvatar} size="md" />
                        <div className="ml-3">
                          <div className="font-semibold">{activeMission.contactName}</div>
                          <div className="text-sm text-muted-foreground">{activeMission.contactRole}</div>
                        </div>
                      </div>
                    </div>
                    {activeMission.badgeId && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-2">Badge à gagner :</h3>
                        <Badge variant="outline" className="bg-muted/50 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {activeMission.badgeId}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <ChatInterface
                  contactName={activeMission.contactName}
                  contactRole={activeMission.contactRole}
                  contactAvatar={activeMission.contactAvatar}
                  userAvatar={avatarId}
                  userName={userName}
                  userRole={playerRole}
                  initialMessage={`Bonjour ${userName}, bienvenue à cette mission "${activeMission.title}". Je suis ${activeMission.contactName}, ${activeMission.contactRole}. Je vais te guider tout au long de cette mission dans le domaine de "${activeMission.domain}". N'hésite pas à me poser des questions si tu as besoin d'éclaircissements ou d'aide à tout moment.`}
                  scenario={{
                    id: activeMission.id,
                    domain: activeMission.domain,
                    difficulty: activeMission.difficulty
                  }}
                  height="h-[600px]"
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}