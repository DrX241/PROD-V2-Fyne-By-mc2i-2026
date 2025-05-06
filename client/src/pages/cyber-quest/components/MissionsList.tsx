import React, { useState, useEffect } from 'react';
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { Mission } from '@shared/schema/cyber-quest';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Briefcase, 
  Clock, 
  AlertCircle, 
  Shield, 
  Star, 
  Award, 
  Check, 
  ChevronRight, 
  Target,
  AlertTriangle
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";

const MissionsList: React.FC = () => {
  const { availableMissions, currentMission, activeMissions, startMission, completeMission, abandonMission } = useCyberQuest();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>('available');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Quand currentMission change, mettre à jour selectedMission
  useEffect(() => {
    if (currentMission && (selectedTab === 'active' || selectedTab === 'details')) {
      setSelectedMission(currentMission);
      setSelectedTab('details');
    }
  }, [currentMission]);
  
  // Fonction pour démarrer une mission
  const handleStartMission = async (missionId: number) => {
    setLoading(true);
    try {
      await startMission(missionId);
      toast({
        title: "Mission acceptée",
        description: "Vous pouvez maintenant commencer cette mission.",
      });
      setSelectedTab('details');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer cette mission pour le moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour abandonner une mission
  const handleAbandonMission = async (missionId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir abandonner cette mission ? Tout progrès sera perdu.")) {
      return;
    }
    
    setLoading(true);
    try {
      await abandonMission(missionId);
      toast({
        title: "Mission abandonnée",
        description: "Vous avez abandonné cette mission.",
      });
      setSelectedTab('available');
      setSelectedMission(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'abandonner cette mission pour le moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Afficher le niveau de difficulté d'une mission
  const renderDifficultyBadge = (difficulty: string) => {
    let color = "";
    switch (difficulty) {
      case 'trainee':
        color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        break;
      case 'junior':
        color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        break;
      case 'intermediate':
        color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
        break;
      case 'senior':
        color = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
        break;
      case 'expert':
        color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
        break;
      case 'master':
        color = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
        break;
      default:
        color = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
    
    return (
      <Badge variant="outline" className={color}>
        {difficulty === 'trainee' && "Stagiaire"}
        {difficulty === 'junior' && "Junior"}
        {difficulty === 'intermediate' && "Intermédiaire"}
        {difficulty === 'senior' && "Senior"}
        {difficulty === 'expert' && "Expert"}
        {difficulty === 'master' && "Maître"}
        {!['trainee', 'junior', 'intermediate', 'senior', 'expert', 'master'].includes(difficulty) && "Standard"}
      </Badge>
    );
  };
  
  // Afficher le type de mission
  const renderMissionTypeBadge = (type: string) => {
    let icon = null;
    let color = "";
    
    switch (type) {
      case 'main_story':
        icon = <Shield className="h-3 w-3 mr-1" />;
        color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        break;
      case 'side_quest':
        icon = <Briefcase className="h-3 w-3 mr-1" />;
        color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        break;
      case 'daily':
        icon = <Clock className="h-3 w-3 mr-1" />;
        color = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
        break;
      case 'investigation':
        icon = <Target className="h-3 w-3 mr-1" />;
        color = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
        break;
      case 'emergency':
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
        break;
      case 'training':
        icon = <Target className="h-3 w-3 mr-1" />;
        color = "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100";
        break;
      default:
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        color = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
    
    return (
      <Badge variant="outline" className={`flex items-center ${color}`}>
        {icon}
        {type === 'main_story' && "Histoire principale"}
        {type === 'side_quest' && "Quête secondaire"}
        {type === 'daily' && "Mission quotidienne"}
        {type === 'investigation' && "Investigation"}
        {type === 'emergency' && "Urgence"}
        {type === 'training' && "Entraînement"}
        {!['main_story', 'side_quest', 'daily', 'investigation', 'emergency', 'training'].includes(type) && "Standard"}
      </Badge>
    );
  };
  
  // Afficher le niveau requis pour une mission
  const renderRequiredLevel = (requiredLevel: number | null) => {
    if (!requiredLevel || requiredLevel <= 1) return null;
    
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        Niveau {requiredLevel}+
      </Badge>
    );
  };
  
  // Rendu des détails d'une mission
  const renderMissionDetails = (mission: Mission) => {
    if (!mission) return null;
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{mission.title}</CardTitle>
              <CardDescription>{mission.description}</CardDescription>
            </div>
            <div className="flex space-x-2">
              {renderMissionTypeBadge(mission.type)}
              {renderDifficultyBadge(mission.difficulty)}
              {renderRequiredLevel(mission.requiredLevel)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Détails de la mission</h3>
              <p className="text-sm">{mission.briefing}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Objectifs</h3>
              <ul className="space-y-2">
                {mission.objectives?.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    {objective.completed ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <span className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{objective.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Récompenses</h3>
              <div className="flex flex-wrap gap-3">
                {mission.xpReward > 0 && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 flex items-center">
                    <Star className="h-3 w-3 mr-1" /> {mission.xpReward} XP
                  </Badge>
                )}
                
                {mission.creditReward > 0 && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 flex items-center">
                    <Award className="h-3 w-3 mr-1" /> {mission.creditReward} crédits
                  </Badge>
                )}
                
                {mission.itemRewards?.map((item, index) => (
                  <Badge key={index} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    1× {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTab('available')}
          >
            Retour
          </Button>
          
          {mission.status === 'in_progress' ? (
            <div className="space-x-2">
              <Button 
                variant="destructive" 
                disabled={loading}
                onClick={() => handleAbandonMission(mission.id)}
              >
                Abandonner
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => handleStartMission(mission.id)}
              disabled={loading}
            >
              Accepter la mission
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  // Carte compacte pour une mission
  const MissionCard = ({ mission, onClick }: { mission: Mission, onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between">
          <span>{mission.title}</span>
          {mission.type === 'main_story' && <Shield className="h-4 w-4 text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{mission.description}</p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex space-x-2">
          {renderDifficultyBadge(mission.difficulty)}
          {mission.requiredLevel > 1 && (
            <Badge variant="outline">Niv. {mission.requiredLevel}+</Badge>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </CardFooter>
    </Card>
  );
  
  return (
    <div>
      {selectedTab === 'details' && selectedMission ? (
        renderMissionDetails(selectedMission)
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Disponibles</TabsTrigger>
            <TabsTrigger value="active">En cours</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4 mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {availableMissions && availableMissions.length > 0 ? (
                  availableMissions.map((mission) => (
                    <MissionCard 
                      key={mission.id} 
                      mission={mission} 
                      onClick={() => {
                        setSelectedMission(mission);
                        setSelectedTab('details');
                      }} 
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-6 text-center">
                      <p className="text-gray-500">Aucune mission disponible pour le moment.</p>
                      <p className="text-gray-400 text-sm mt-2">Revenez plus tard ou explorez d'autres zones pour découvrir de nouvelles missions.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4 mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {activeMissions && activeMissions.length > 0 ? (
                  activeMissions.map((mission) => (
                    <MissionCard 
                      key={mission.id} 
                      mission={mission} 
                      onClick={() => {
                        setSelectedMission(mission);
                        setSelectedTab('details');
                      }} 
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-6 text-center">
                      <p className="text-gray-500">Vous n'avez aucune mission en cours.</p>
                      <p className="text-gray-400 text-sm mt-2">Acceptez une mission pour la voir apparaître ici.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MissionsList;