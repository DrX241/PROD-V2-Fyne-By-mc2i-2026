import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CyberQuestPlayer } from '@shared/schema/cyber-quest';
import { 
  User, 
  Brain, 
  Eye, 
  Users, 
  Terminal, 
  Shield, 
  Clock, 
  Award, 
  Target, 
  Briefcase, 
  Zap
} from 'lucide-react';

interface PlayerProfileProps {
  player: CyberQuestPlayer;
}

// Fonction pour calculer l'expérience requise pour le prochain niveau
const calculateRequiredExp = (level: number): number => {
  // Formule : 100 * (niveau actuel * 1.5)
  return Math.floor(100 * (level * 1.5));
};

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player }) => {
  // Calcul de l'expérience requise pour le niveau suivant
  const nextLevelExp = calculateRequiredExp(player.level);
  const expPercentage = (player.experience / nextLevelExp) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Carte principale du profil */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <User className="mr-2 h-6 w-6 text-blue-500" />
              Agent {player.characterName}
            </CardTitle>
            <Badge variant="outline" className="bg-blue-900 text-white">
              Niveau {player.level}
            </Badge>
          </div>
          <CardDescription>
            Spécialiste en cybersécurité • ID: #{player.id}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progression d'expérience */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Expérience</span>
              <span>{player.experience} / {nextLevelExp} XP</span>
            </div>
            <Progress value={expPercentage} className="h-2" />
          </div>
          
          <Separator />
          
          {/* Attributs du personnage */}
          <div>
            <h3 className="text-lg font-medium mb-4">Attributs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Intelligence</span>
                  </div>
                  <span className="font-bold">{player.intelligence}</span>
                </div>
                <Progress value={(player.intelligence / 10) * 100} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Perception</span>
                  </div>
                  <span className="font-bold">{player.perception}</span>
                </div>
                <Progress value={(player.perception / 10) * 100} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Charisme</span>
                  </div>
                  <span className="font-bold">{player.charisma}</span>
                </div>
                <Progress value={(player.charisma / 10) * 100} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Terminal className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Conn. Technique</span>
                  </div>
                  <span className="font-bold">{player.technicalKnowledge}</span>
                </div>
                <Progress value={(player.technicalKnowledge / 10) * 100} className="h-1" />
              </div>
            </div>
            
            {player.attributePoints > 0 && (
              <div className="mt-4">
                <Button size="sm" className="w-full">
                  Attribuer {player.attributePoints} point{player.attributePoints > 1 ? 's' : ''} disponible{player.attributePoints > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Points de compétence */}
          {player.skillPoints > 0 && (
            <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded-md">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                <div>
                  <h4 className="font-medium">Points de compétence disponibles</h4>
                  <p className="text-sm text-gray-400">À dépenser dans l'arbre de compétences</p>
                </div>
              </div>
              <Badge className="bg-yellow-600">
                {player.skillPoints} point{player.skillPoints > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cartes secondaires */}
      <div className="space-y-6">
        {/* Carte de ressources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ressources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-400" />
                <span>Crédits</span>
              </div>
              <span className="font-bold">{player.credits}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                <span>Réputation</span>
              </div>
              <span className="font-bold">{player.reputation}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                <span>Rang</span>
              </div>
              <Badge variant="outline">{player.rank || 'Recrue'}</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Carte de statistiques */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>Temps de jeu</span>
              </div>
              <span className="font-medium">
                {Math.floor(player.playTime / 60)}h {player.playTime % 60}m
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-orange-400" />
                <span>Missions terminées</span>
              </div>
              <span className="font-medium">{player.missionsCompleted}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-400" />
                <span>Défis complétés</span>
              </div>
              <span className="font-medium">{player.challengesCompleted}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerProfile;