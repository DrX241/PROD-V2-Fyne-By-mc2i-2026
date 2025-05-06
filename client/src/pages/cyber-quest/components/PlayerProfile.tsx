import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CyberQuestPlayer } from '@shared/schema/cyber-quest';
import { Shield, Award, ArrowUp, Brain, Eye, MessageCircle, Cpu } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useCyberQuest } from '@/contexts/CyberQuestContext';

interface PlayerProfileProps {
  player: CyberQuestPlayer;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player }) => {
  const { toast } = useToast();
  const { levelUpAttribute } = useCyberQuest();

  // Calculer le progrès d'XP vers le niveau suivant
  const calculateRequiredExp = (level: number): number => {
    return Math.floor(100 * (level * 1.5));
  };

  const requiredExp = calculateRequiredExp(player.level);
  const expProgress = (player.experience / requiredExp) * 100;

  // Définition des rangs en fonction du niveau
  const getRank = (level: number): string => {
    if (level < 5) return "Recrue";
    if (level < 10) return "Agent";
    if (level < 15) return "Agent Senior";
    if (level < 20) return "Spécialiste";
    if (level < 25) return "Expert";
    if (level < 30) return "Vétéran";
    return "Maître Cyber";
  };

  // Fonction pour améliorer un attribut
  const handleAttributeUpgrade = async (attribute: 'intelligence' | 'perception' | 'charisma' | 'technicalKnowledge') => {
    if (player.attributePoints <= 0) {
      toast({
        title: "Impossible d'améliorer l'attribut",
        description: "Vous n'avez pas suffisamment de points d'attribut disponibles.",
        variant: "destructive"
      });
      return;
    }

    try {
      await levelUpAttribute(attribute);
      toast({
        title: "Attribut amélioré",
        description: `Vous avez augmenté votre ${getAttributeName(attribute)}.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'améliorer l'attribut pour le moment.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour obtenir le nom français d'un attribut
  const getAttributeName = (attribute: string): string => {
    switch (attribute) {
      case 'intelligence': return "Intelligence";
      case 'perception': return "Perception";
      case 'charisma': return "Charisme";
      case 'technicalKnowledge': return "Connaissance Technique";
      default: return attribute;
    }
  };

  // Fonction pour obtenir l'icône d'un attribut
  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'intelligence': return <Brain className="h-5 w-5 text-purple-500" />;
      case 'perception': return <Eye className="h-5 w-5 text-blue-500" />;
      case 'charisma': return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'technicalKnowledge': return <Cpu className="h-5 w-5 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Carte d'identité du joueur */}
      <Card className="col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Identité d'Agent</span>
            <Badge variant="outline" className="bg-blue-900 text-white">
              {getRank(player.level)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <Badge className="absolute -bottom-2 right-0 bg-blue-500">
                  Nv. {player.level}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom de code</p>
                <p className="font-medium">{player.characterName || 'Agent'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Identification</p>
                <p className="font-medium">#{player.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crédits</p>
                <p className="font-medium flex items-center">
                  <Award className="h-4 w-4 text-yellow-400 mr-1" />
                  {player.credits}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Réputation</p>
                <p className="font-medium">{player.reputation}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Missions complétées</p>
                <p className="font-medium">{player.missionsCompleted}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Défis relevés</p>
                <p className="font-medium">{player.challengesCompleted}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recrutement</p>
                <p className="font-medium">{
                  player.createdAt ? 
                  `Il y a ${formatDistanceToNow(new Date(player.createdAt), { locale: fr })}` : 
                  'Date inconnue'
                }</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression et statistiques */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Niveau {player.level}</span>
                <span>Niveau {player.level + 1}</span>
              </div>
              <Progress value={expProgress} className="h-2" />
              <div className="text-sm text-gray-500 text-center">
                {player.experience} / {requiredExp} XP
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Attributs</h3>
                {player.attributePoints > 0 && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {player.attributePoints} point{player.attributePoints > 1 ? 's' : ''} disponible{player.attributePoints > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribut</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <Brain className="h-5 w-5 text-purple-500 mr-2" /> Intelligence
                    </TableCell>
                    <TableCell>{player.intelligence}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={player.attributePoints <= 0}
                        onClick={() => handleAttributeUpgrade('intelligence')}
                      >
                        <ArrowUp className="h-4 w-4 mr-1" /> Améliorer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <Eye className="h-5 w-5 text-blue-500 mr-2" /> Perception
                    </TableCell>
                    <TableCell>{player.perception}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={player.attributePoints <= 0}
                        onClick={() => handleAttributeUpgrade('perception')}
                      >
                        <ArrowUp className="h-4 w-4 mr-1" /> Améliorer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-green-500 mr-2" /> Charisme
                    </TableCell>
                    <TableCell>{player.charisma}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={player.attributePoints <= 0}
                        onClick={() => handleAttributeUpgrade('charisma')}
                      >
                        <ArrowUp className="h-4 w-4 mr-1" /> Améliorer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center">
                      <Cpu className="h-5 w-5 text-amber-500 mr-2" /> Connaissance Technique
                    </TableCell>
                    <TableCell>{player.technicalKnowledge}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={player.attributePoints <= 0}
                        onClick={() => handleAttributeUpgrade('technicalKnowledge')}
                      >
                        <ArrowUp className="h-4 w-4 mr-1" /> Améliorer
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerProfile;