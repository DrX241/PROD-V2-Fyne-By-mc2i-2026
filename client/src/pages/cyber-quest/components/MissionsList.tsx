import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  Award,
  Hourglass,
  LucideIcon,
  Skull,
  Shield,
  Zap,
  Briefcase as BriefcaseFilled
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { Mission } from '@shared/schema/cyber-quest';

// Type pour la mission active dans le dialog
type ActiveMission = Mission | null;

// Badges pour les types de mission
const getMissionTypeInfo = (type: string): { label: string, icon: React.ReactElement, className: string } => {
  switch (type) {
    case 'main_story':
      return { 
        label: 'Histoire principale', 
        icon: <Briefcase className="h-4 w-4" />, 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
      };
    case 'side_quest':
      return { 
        label: 'Quête secondaire', 
        icon: <FileText className="h-4 w-4" />, 
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' 
      };
    case 'daily':
      return { 
        label: 'Défi quotidien', 
        icon: <Calendar className="h-4 w-4" />, 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
      };
    case 'investigation':
      return { 
        label: 'Investigation', 
        icon: <Hourglass className="h-4 w-4" />, 
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' 
      };
    case 'emergency':
      return { 
        label: 'Urgence', 
        icon: <AlertTriangle className="h-4 w-4" />, 
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
      };
    case 'training':
      return { 
        label: 'Entraînement', 
        icon: <Shield className="h-4 w-4" />, 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' 
      };
    default:
      return { 
        label: 'Mission', 
        icon: <Briefcase className="h-4 w-4" />, 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' 
      };
  }
};

// Fonction pour obtenir le badge de difficulté
const getDifficultyBadge = (difficulty: string) => {
  const colorClass = {
    'trainee': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'junior': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    'senior': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'expert': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    'master': 'bg-black text-white dark:bg-white dark:text-black',
  }[difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';

  const label = {
    'trainee': 'Stagiaire',
    'junior': 'Junior',
    'intermediate': 'Intermédiaire',
    'senior': 'Senior',
    'expert': 'Expert',
    'master': 'Maître',
  }[difficulty] || 'Inconnu';

  const stars = {
    'trainee': 1,
    'junior': 2,
    'intermediate': 3,
    'senior': 4,
    'expert': 5,
    'master': 6,
  }[difficulty] || 0;

  return (
    <Badge variant="outline" className={`${colorClass} flex items-center gap-1`}>
      {Array(stars).fill(0).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
      <span className="ml-1">{label}</span>
    </Badge>
  );
};

// Fonction pour obtenir l'état d'une mission
const getMissionStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
      return { 
        label: 'En cours', 
        icon: <Clock className="h-4 w-4" />, 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
      };
    case 'completed':
      return { 
        label: 'Terminée', 
        icon: <CheckCircle2 className="h-4 w-4" />, 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
      };
    case 'failed':
      return { 
        label: 'Échouée', 
        icon: <XCircle className="h-4 w-4" />, 
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
      };
    case 'abandoned':
      return { 
        label: 'Abandonnée', 
        icon: <XCircle className="h-4 w-4" />, 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' 
      };
    default:
      return { 
        label: 'Disponible', 
        icon: <FileText className="h-4 w-4" />, 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' 
      };
  }
};

const MissionsList: React.FC = () => {
  const { availableMissions, playerMissions, acceptMission } = useCyberQuest();
  const [activeMission, setActiveMission] = useState<ActiveMission>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  
  // Regrouper les missions par statut
  const activeMissions = playerMissions.filter(mission => mission.status === 'active');
  const completedMissions = playerMissions.filter(mission => mission.status === 'completed');
  
  // Gérer l'acceptation d'une mission
  const handleAcceptMission = async (mission: Mission) => {
    if (!mission) return;
    
    setIsAccepting(true);
    
    try {
      await acceptMission(mission.id);
      
      toast({
        title: "Mission acceptée",
        description: "La mission a été ajoutée à votre liste de missions actives.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter cette mission.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>
        
        {/* Missions disponibles */}
        <TabsContent value="available" className="mt-4">
          {availableMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMissions.map((mission) => {
                const typeInfo = getMissionTypeInfo(mission.type);
                
                return (
                  <Card key={mission.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={typeInfo.className}>
                          <span className="flex items-center">
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.label}</span>
                          </span>
                        </Badge>
                        {getDifficultyBadge(mission.difficulty)}
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {mission.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{mission.experienceReward} XP</span>
                      </div>
                      <Dialog open={isDialogOpen && activeMission?.id === mission.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setActiveMission(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setActiveMission(mission);
                              setIsDialogOpen(true);
                            }}
                          >
                            Détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          {activeMission && (
                            <>
                              <DialogHeader>
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant="outline" className={getMissionTypeInfo(activeMission.type).className}>
                                    <span className="flex items-center">
                                      {getMissionTypeInfo(activeMission.type).icon}
                                      <span className="ml-1">{getMissionTypeInfo(activeMission.type).label}</span>
                                    </span>
                                  </Badge>
                                  {getDifficultyBadge(activeMission.difficulty)}
                                </div>
                                <DialogTitle>{activeMission.title}</DialogTitle>
                                <DialogDescription>
                                  Mission de niveau {activeMission.requiredLevel || 1} minimum
                                </DialogDescription>
                              </DialogHeader>
                              
                              <ScrollArea className="mt-4 max-h-[400px] pr-4">
                                <div className="space-y-6">
                                  {/* Description */}
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Briefing</h4>
                                    <p className="text-sm text-gray-500">{activeMission.description}</p>
                                  </div>
                                  
                                  {/* Objectifs */}
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Objectifs</h4>
                                    <ul className="space-y-2">
                                      {activeMission.objectives && typeof activeMission.objectives === 'object' && (activeMission.objectives as any).map((objective: any, index: number) => (
                                        <li key={index} className="flex items-start">
                                          <span className="flex h-5 w-5 mr-2 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                                          </span>
                                          <span className="text-sm">{objective.description}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  {/* Récompenses */}
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Récompenses</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <Award className="h-5 w-5 text-amber-500 mb-1" />
                                        <span className="text-xs text-gray-500">Expérience</span>
                                        <span className="font-medium">{activeMission.experienceReward} XP</span>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <Briefcase className="h-5 w-5 text-blue-500 mb-1" />
                                        <span className="text-xs text-gray-500">Crédits</span>
                                        <span className="font-medium">{activeMission.creditReward}</span>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <Star className="h-5 w-5 text-purple-500 mb-1" />
                                        <span className="text-xs text-gray-500">Réputation</span>
                                        <span className="font-medium">{activeMission.reputationReward}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Items en récompense */}
                                    {activeMission.itemRewards && typeof activeMission.itemRewards === 'object' && Object.keys(activeMission.itemRewards).length > 0 && (
                                      <div className="mt-2">
                                        <h5 className="text-xs font-medium mb-1">Objets</h5>
                                        <div className="grid grid-cols-2 gap-2">
                                          {Object.entries(activeMission.itemRewards as any).map(([item, index]) => (
                                            <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                              {item}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Limite de temps */}
                                  {activeMission.timeLimit && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Limite de temps</h4>
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>{Math.floor(activeMission.timeLimit / 60)} heures {activeMission.timeLimit % 60} minutes</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                              
                              <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                                <div className="flex items-center">
                                  {activeMission.requiredLevel && activeMission.requiredLevel > 1 && (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 mr-2">
                                      <span className="flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Niveau {activeMission.requiredLevel} requis
                                      </span>
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleAcceptMission(activeMission)}
                                  disabled={isAccepting}
                                >
                                  {isAccepting ? 'Acceptation...' : 'Accepter la mission'}
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500">Aucune mission disponible pour le moment.</p>
                <p className="text-sm text-gray-400 mt-1">Revenez plus tard ou progressez dans le jeu pour débloquer de nouvelles missions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Missions actives */}
        <TabsContent value="active" className="mt-4">
          {activeMissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeMissions.map((playerMission) => {
                // Trouver la mission correspondante dans la liste des missions disponibles
                const mission = availableMissions.find(m => m.id === playerMission.missionId) || null;
                if (!mission) return null;
                
                const typeInfo = getMissionTypeInfo(mission.type);
                const statusInfo = getMissionStatusInfo(playerMission.status);
                
                return (
                  <Card key={playerMission.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={typeInfo.className}>
                          <span className="flex items-center">
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.label}</span>
                          </span>
                        </Badge>
                        <Badge variant="outline" className={statusInfo.className}>
                          <span className="flex items-center">
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {mission.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Progression</h4>
                          <div className="space-y-2">
                            {/* Objectifs */}
                            {playerMission.completedObjectives && Array.isArray(playerMission.completedObjectives) && playerMission.completedObjectives.length > 0 ? (
                              <ul className="space-y-1">
                                {playerMission.completedObjectives.map((objectiveId, index) => {
                                  // Trouver l'objectif correspondant dans la mission
                                  const objective = mission.objectives && (mission.objectives as any).find((o: any) => o.id === objectiveId);
                                  return (
                                    <li key={index} className="flex items-start">
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm line-through opacity-70">
                                        {objective ? objective.description : `Objectif ${index + 1}`}
                                      </span>
                                    </li>
                                  );
                                })}
                                
                                {/* Objectifs restants */}
                                {mission.objectives && Array.isArray(mission.objectives) && (mission.objectives as any).filter((o: any) => 
                                  !playerMission.completedObjectives.includes(o.id)
                                ).map((objective: any, index: number) => (
                                  <li key={`remaining-${index}`} className="flex items-start">
                                    <span className="h-4 w-4 border border-gray-300 rounded-full mr-2 flex-shrink-0 mt-0.5"></span>
                                    <span className="text-sm">{objective.description}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">Aucun objectif complété pour le moment.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 flex justify-between items-center border-t bg-gray-50 dark:bg-gray-800 px-6 py-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Débuté il y a {Math.floor((Date.now() - new Date(playerMission.startedAt).getTime()) / (1000 * 60))} min</span>
                      </div>
                      <Button size="sm">
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500">Vous n'avez aucune mission active pour le moment.</p>
                <p className="text-sm text-gray-400 mt-1">Consultez les missions disponibles et acceptez-en une pour commencer.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Missions terminées */}
        <TabsContent value="completed" className="mt-4">
          {completedMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMissions.map((playerMission) => {
                // Trouver la mission correspondante dans la liste des missions disponibles
                const mission = availableMissions.find(m => m.id === playerMission.missionId) || null;
                if (!mission) return null;
                
                const typeInfo = getMissionTypeInfo(mission.type);
                const statusInfo = getMissionStatusInfo(playerMission.status);
                
                return (
                  <Card key={playerMission.id} className="overflow-hidden opacity-80">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={typeInfo.className}>
                          <span className="flex items-center">
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.label}</span>
                          </span>
                        </Badge>
                        <Badge variant="outline" className={statusInfo.className}>
                          <span className="flex items-center">
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </span>
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {mission.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex justify-between items-center border-t bg-gray-50 dark:bg-gray-800 px-6 py-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{mission.experienceReward} XP gagnés</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Historique
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500">Vous n'avez aucune mission terminée pour le moment.</p>
                <p className="text-sm text-gray-400 mt-1">Complétez des missions pour les voir apparaître ici.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionsList;