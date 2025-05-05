import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Award, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const GameSummary: React.FC = () => {
  const { 
    gameSummary, 
    securityPoints, 
    resetGame, 
    setShowSummary, 
    isGameOver 
  } = useGame();
  
  if (!gameSummary) return null;
  
  const getSecurityLevelLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Critique';
      case 2: return 'Vulnérable';
      case 3: return 'Moyen';
      case 4: return 'Bon';
      case 5: return 'Excellent';
      default: return 'Inconnu';
    }
  };
  
  const getSecurityLevelColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-red-600';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-emerald-600';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-3xl bg-blue-950/90 border-blue-800 shadow-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Shield className="mr-2 h-6 w-6 text-blue-400" />
                {isGameOver && securityPoints < 0 
                  ? 'Mission échouée !' 
                  : 'Bilan de sécurité'}
              </CardTitle>
              <CardDescription className="text-blue-300">
                {isGameOver && securityPoints < 0 
                  ? 'Votre score de sécurité est trop bas, la simulation s\'est terminée.'
                  : 'Voici le résumé de vos décisions et leur impact sur la sécurité de l\'entreprise.'}
              </CardDescription>
            </div>
            <Badge className={`text-lg px-3 py-1 ${getSecurityLevelColor(gameSummary.securityLevel)}`}>
              Niveau {gameSummary.securityLevel}: {getSecurityLevelLabel(gameSummary.securityLevel)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-900/50 border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Score de sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {gameSummary.totalPoints}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/50 border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  Taux de réussite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {Math.round(gameSummary.successRate)}%
                  </div>
                  <Progress value={gameSummary.successRate} className="h-2 bg-blue-800" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/50 border-blue-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-4 w-4 mr-2 text-blue-400" />
                  Défis complétés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {gameSummary.challengesCompleted}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-6 bg-blue-800" />
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Décisions clés
            </h3>
            
            <div className="space-y-3">
              {gameSummary.keyDecisions.map(decision => (
                <div 
                  key={decision.id} 
                  className={`p-3 rounded-md ${
                    decision.points > 0 
                      ? 'bg-green-900/30 border border-green-800' 
                      : 'bg-red-900/30 border border-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm flex-1">
                      {decision.description}
                    </div>
                    <Badge className={`${
                      decision.points > 0 ? 'bg-green-700' : 'bg-red-700'
                    } ml-2`}>
                      {decision.points > 0 ? `+${decision.points}` : decision.points}
                    </Badge>
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    {new Date(decision.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="my-6 bg-blue-800" />
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Bonnes pratiques découvertes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameSummary.bestPractices.map(practice => (
                <Card 
                  key={practice.id} 
                  className="bg-blue-900/30 border-blue-700 hover:bg-blue-900/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{practice.title}</CardTitle>
                      <Badge className={`
                        ${practice.importance === 'critical' ? 'bg-red-600' : 
                          practice.importance === 'high' ? 'bg-orange-500' :
                          practice.importance === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'}
                      `}>
                        {practice.importance === 'critical' ? 'Critique' : 
                          practice.importance === 'high' ? 'Haute' :
                          practice.importance === 'medium' ? 'Moyenne' :
                          'Basse'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>{practice.description}</p>
                  </CardContent>
                </Card>
              ))}
              
              {gameSummary.bestPractices.length === 0 && (
                <div className="col-span-2 text-center p-6 bg-blue-900/20 rounded-lg border border-dashed border-blue-700">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>Vous n'avez pas encore découvert de bonnes pratiques de sécurité.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-blue-800 p-4 bg-blue-900/50">
          {!isGameOver ? (
            <Button 
              variant="outline" 
              onClick={() => setShowSummary(false)}
            >
              Continuer la mission
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button 
            onClick={resetGame}
            variant={isGameOver ? "default" : "secondary"}
          >
            {isGameOver ? 'Réessayer' : 'Recommencer la mission'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameSummary;