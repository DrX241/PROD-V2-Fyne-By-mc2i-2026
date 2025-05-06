import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { 
  Briefcase, 
  Clock, 
  Award, 
  Shield, 
  Star, 
  AlertTriangle, 
  Target, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';

import { Mission } from '@shared/schema/cyber-quest';

const MissionsList: React.FC = () => {
  const { availableMissions, startMission, player } = useCyberQuest();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Filtrer les missions par type
  const filterMissions = (missions: Mission[], type: string) => {
    if (type === 'all') return missions;
    return missions.filter(mission => mission.type === type);
  };
  
  // Récupérer le niveau de difficulté pour l'affichage
  const getDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'trainee':
        return <Badge className="bg-green-600">Débutant</Badge>;
      case 'junior':
        return <Badge className="bg-blue-600">Junior</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-600">Intermédiaire</Badge>;
      case 'senior':
        return <Badge className="bg-orange-600">Senior</Badge>;
      case 'expert':
        return <Badge className="bg-red-600">Expert</Badge>;
      case 'master':
        return <Badge className="bg-purple-600">Maître</Badge>;
      default:
        return <Badge className="bg-gray-600">Inconnu</Badge>;
    }
  };
  
  // Gérer le clic sur une mission pour afficher les détails
  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission);
  };
  
  // Fermer les détails de la mission
  const handleCloseDetails = () => {
    setSelectedMission(null);
  };
  
  // Démarrer une mission
  const handleStartMission = (missionId: number) => {
    startMission(missionId);
    setSelectedMission(null);
  };
  
  // Vérifier si une mission est disponible pour le joueur
  const isMissionAvailable = (mission: Mission) => {
    if (!player) return false;
    return player.level >= mission.requiredLevel;
  };
  
  // Si aucune mission n'est disponible
  if (availableMissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mb-4 text-gray-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Aucune mission disponible</h3>
            <p>Revenez plus tard ou augmentez votre niveau pour débloquer de nouvelles missions.</p>
          </div>
          <Button className="mt-4" variant="outline">Actualiser</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Si on affiche les détails d'une mission
  if (selectedMission) {
    const isAvailable = isMissionAvailable(selectedMission);
    
    return (
      <Card className="border-blue-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{selectedMission.title}</CardTitle>
              <CardDescription>
                {getDifficultyBadge(selectedMission.difficulty)} 
                <span className="ml-2">
                  {selectedMission.type === 'main_story' && 'Mission principale'}
                  {selectedMission.type === 'side_quest' && 'Quête secondaire'}
                  {selectedMission.type === 'daily' && 'Défi quotidien'}
                  {selectedMission.type === 'investigation' && 'Investigation spéciale'}
                  {selectedMission.type === 'emergency' && 'Incident urgent'}
                  {selectedMission.type === 'training' && 'Mission d\'entraînement'}
                </span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
              Retour
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="prose prose-sm dark:prose-invert">
            <p>{selectedMission.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Objectifs
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                {(selectedMission.objectives as any[]).map((objective, index) => (
                  <li key={index}>{objective.description}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <Award className="h-4 w-4 mr-2 text-yellow-500" />
                  Récompenses
                </h4>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
                    <div className="text-sm text-gray-500">XP</div>
                    <div className="font-bold">{selectedMission.experienceReward}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
                    <div className="text-sm text-gray-500">Crédits</div>
                    <div className="font-bold">{selectedMission.creditReward}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
                    <div className="text-sm text-gray-500">Réputation</div>
                    <div className="font-bold">{selectedMission.reputationReward}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Prérequis
                </h4>
                <div className="text-sm mt-1">
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 mr-1 text-blue-500" />
                    Niveau {selectedMission.requiredLevel} ou supérieur
                  </div>
                  {selectedMission.timeLimit && (
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1 text-red-500" />
                      Limite de temps: {selectedMission.timeLimit} minutes
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            Disponible maintenant
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            disabled={!isAvailable}
            onClick={() => handleStartMission(selectedMission.id)}
          >
            {isAvailable ? (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Démarrer
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Niveau requis: {selectedMission.requiredLevel}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Afficher la liste des missions
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">Toutes</TabsTrigger>
          <TabsTrigger value="main_story" className="flex-1">Principales</TabsTrigger>
          <TabsTrigger value="side_quest" className="flex-1">Secondaires</TabsTrigger>
          <TabsTrigger value="daily" className="flex-1">Quotidiennes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 pt-4">
          {filterMissions(availableMissions, 'all').map((mission) => (
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              onClick={() => handleMissionClick(mission)}
              isAvailable={isMissionAvailable(mission)}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="main_story" className="space-y-4 pt-4">
          {filterMissions(availableMissions, 'main_story').length > 0 ? (
            filterMissions(availableMissions, 'main_story').map((mission) => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                onClick={() => handleMissionClick(mission)}
                isAvailable={isMissionAvailable(mission)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">Aucune mission principale disponible actuellement.</p>
          )}
        </TabsContent>
        
        <TabsContent value="side_quest" className="space-y-4 pt-4">
          {filterMissions(availableMissions, 'side_quest').length > 0 ? (
            filterMissions(availableMissions, 'side_quest').map((mission) => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                onClick={() => handleMissionClick(mission)}
                isAvailable={isMissionAvailable(mission)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">Aucune quête secondaire disponible actuellement.</p>
          )}
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-4 pt-4">
          {filterMissions(availableMissions, 'daily').length > 0 ? (
            filterMissions(availableMissions, 'daily').map((mission) => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                onClick={() => handleMissionClick(mission)}
                isAvailable={isMissionAvailable(mission)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">Aucune mission quotidienne disponible actuellement.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composant pour afficher une carte de mission
interface MissionCardProps {
  mission: Mission;
  onClick: () => void;
  isAvailable: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick, isAvailable }) => {
  // Afficher le type de mission
  const getMissionTypeIcon = (type: string) => {
    switch(type) {
      case 'main_story':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'side_quest':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'daily':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'investigation':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'training':
        return <Briefcase className="h-4 w-4 text-gray-500" />;
      default:
        return <Briefcase className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Récupérer le niveau de difficulté pour l'affichage
  const getDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'trainee':
        return <Badge className="bg-green-600">Débutant</Badge>;
      case 'junior':
        return <Badge className="bg-blue-600">Junior</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-600">Intermédiaire</Badge>;
      case 'senior':
        return <Badge className="bg-orange-600">Senior</Badge>;
      case 'expert':
        return <Badge className="bg-red-600">Expert</Badge>;
      case 'master':
        return <Badge className="bg-purple-600">Maître</Badge>;
      default:
        return <Badge className="bg-gray-600">Inconnu</Badge>;
    }
  };
  
  // Limite de texte pour la description
  const truncateDescription = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };
  
  return (
    <Card 
      className={`hover:border-blue-500 transition-colors cursor-pointer ${!isAvailable ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {getMissionTypeIcon(mission.type)}
              <span className="ml-2">{mission.title}</span>
            </CardTitle>
            <CardDescription>
              {getDifficultyBadge(mission.difficulty)}
            </CardDescription>
          </div>
          <div className="text-xs flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {mission.timeLimit ? `${mission.timeLimit} min` : 'Sans limite'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm">{truncateDescription(mission.description, 100)}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-2">
          <Badge variant="outline" className="flex items-center">
            <Award className="h-3 w-3 mr-1 text-yellow-500" />
            {mission.creditReward}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-blue-500" />
            {mission.experienceReward} XP
          </Badge>
        </div>
        
        {!isAvailable && (
          <Badge variant="secondary" className="bg-gray-700 text-white">
            Niveau {mission.requiredLevel} requis
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default MissionsList;