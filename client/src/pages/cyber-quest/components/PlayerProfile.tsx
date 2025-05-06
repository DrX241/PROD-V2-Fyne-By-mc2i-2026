import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Eye,
  MessageCircle,
  Code,
  Award,
  Zap,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CyberQuestPlayer } from '@shared/schema/cyber-quest';
import { useCyberQuest } from '@/contexts/CyberQuestContext';

interface PlayerProfileProps {
  player: CyberQuestPlayer;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player }) => {
  const { levelUpAttribute } = useCyberQuest();
  const [attributeInProgress, setAttributeInProgress] = useState<string | null>(null);
  
  // Calculer l'expérience nécessaire pour le prochain niveau
  const nextLevelXp = player.level * 1000;
  const xpProgress = (player.experience / nextLevelXp) * 100;
  
  // Gérer l'amélioration d'un attribut
  const handleAttributeUpgrade = async (attribute: 'intelligence' | 'perception' | 'charisma' | 'technicalKnowledge') => {
    if (player.attributePoints <= 0) {
      toast({
        title: "Points d'attributs insuffisants",
        description: "Vous n'avez pas assez de points d'attributs disponibles.",
        variant: "destructive",
      });
      return;
    }
    
    setAttributeInProgress(attribute);
    
    try {
      await levelUpAttribute(attribute);
      
      toast({
        title: "Attribut amélioré",
        description: `Votre ${getAttributeName(attribute)} a été amélioré avec succès.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'améliorer cet attribut.",
        variant: "destructive",
      });
    } finally {
      setAttributeInProgress(null);
    }
  };
  
  // Obtenir le nom français d'un attribut
  const getAttributeName = (attribute: string): string => {
    switch (attribute) {
      case 'intelligence': return 'Intelligence';
      case 'perception': return 'Perception';
      case 'charisma': return 'Charisme';
      case 'technicalKnowledge': return 'Connaissance Technique';
      default: return attribute;
    }
  };
  
  // Calculer le temps de jeu formaté
  const formatPlayTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    
    return `${remainingMinutes}min`;
  };
  
  return (
    <div className="space-y-6">
      {/* Carte de profil principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{player.characterName || 'Agent'}</CardTitle>
              <CardDescription>Niveau {player.level} • {player.experience} XP</CardDescription>
            </div>
            
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {player.credits} crédits
              </Badge>
              
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                {player.reputation} réputation
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progression vers niveau {player.level + 1}</span>
                <span className="font-medium">{player.experience}/{nextLevelXp} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Missions complétées</p>
                <p className="text-lg font-medium">{player.missionsCompleted}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs text-gray-500">Challenges</p>
                <p className="text-lg font-medium">{player.challengesCompleted}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500">Points d'attributs</p>
                <p className="text-lg font-medium">{player.attributePoints}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500">Temps de jeu</p>
                <p className="text-lg font-medium">{formatPlayTime(player.playTime)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Onglets pour attributs et statistiques */}
      <Tabs defaultValue="attributes">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attributes">Attributs</TabsTrigger>
          <TabsTrigger value="stats">Statistiques détaillées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attributes" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attributs de personnage</CardTitle>
              <CardDescription>
                Ces attributs déterminent vos capacités de base dans différentes situations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Intelligence */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900 mr-2">
                      <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Intelligence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="tabular-nums font-medium">{player.intelligence}/10</span>
                    {player.attributePoints > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={attributeInProgress !== null}
                        onClick={() => handleAttributeUpgrade('intelligence')}
                      >
                        +
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={player.intelligence * 10} className="h-2" />
                <p className="text-xs text-gray-500">
                  Capacité à résoudre des problèmes complexes, analyser des informations et apprendre de nouvelles compétences.
                </p>
              </div>
              
              {/* Perception */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900 mr-2">
                      <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Perception</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="tabular-nums font-medium">{player.perception}/10</span>
                    {player.attributePoints > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={attributeInProgress !== null}
                        onClick={() => handleAttributeUpgrade('perception')}
                      >
                        +
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={player.perception * 10} className="h-2 bg-purple-500" />
                <p className="text-xs text-gray-500">
                  Aptitude à remarquer des détails, détecter des anomalies et anticiper les menaces potentielles.
                </p>
              </div>
              
              {/* Charisme */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900 mr-2">
                      <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>Charisme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="tabular-nums font-medium">{player.charisma}/10</span>
                    {player.attributePoints > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={attributeInProgress !== null}
                        onClick={() => handleAttributeUpgrade('charisma')}
                      >
                        +
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={player.charisma * 10} className="h-2 bg-green-500" />
                <p className="text-xs text-gray-500">
                  Capacité à influencer les autres, négocier efficacement et établir des relations.
                </p>
              </div>
              
              {/* Connaissance Technique */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900 mr-2">
                      <Code className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>Connaissance Technique</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="tabular-nums font-medium">{player.technicalKnowledge}/10</span>
                    {player.attributePoints > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={attributeInProgress !== null}
                        onClick={() => handleAttributeUpgrade('technicalKnowledge')}
                      >
                        +
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={player.technicalKnowledge * 10} className="h-2 bg-amber-500" />
                <p className="text-xs text-gray-500">
                  Maîtrise des systèmes informatiques, réseaux, et outils techniques.
                </p>
              </div>
            </CardContent>
            {player.attributePoints > 0 && (
              <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <p>
                    <span className="font-medium">{player.attributePoints}</span> point{player.attributePoints > 1 ? 's' : ''} d'attribut{player.attributePoints > 1 ? 's' : ''} disponible{player.attributePoints > 1 ? 's' : ''}
                  </p>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Statistiques de progression</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statistique</TableHead>
                    <TableHead className="text-right">Valeur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Niveau actuel</TableCell>
                    <TableCell className="text-right">{player.level}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Expérience totale</TableCell>
                    <TableCell className="text-right">{player.experience} XP</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Crédits</TableCell>
                    <TableCell className="text-right">{player.credits}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Réputation</TableCell>
                    <TableCell className="text-right">{player.reputation}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Missions complétées</TableCell>
                    <TableCell className="text-right">{player.missionsCompleted}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Défis relevés</TableCell>
                    <TableCell className="text-right">{player.challengesCompleted}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Temps de jeu</TableCell>
                    <TableCell className="text-right">{formatPlayTime(player.playTime)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerProfile;