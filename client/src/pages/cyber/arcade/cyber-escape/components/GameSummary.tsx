import React from 'react';
import { 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  ChevronUp, 
  Lightbulb, 
  RotateCcw, 
  Shield, 
  ThumbsDown, 
  ThumbsUp, 
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame, GameAction, BestPractice } from '../context/GameContext';

const GameSummary: React.FC = () => {
  const { 
    showSummary, 
    setShowSummary, 
    gameSummary, 
    resetGame,
    securityPoints
  } = useGame();

  if (!gameSummary) return null;

  // Fonction pour obtenir une couleur en fonction de l'importance
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-700 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-amber-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Fonction pour afficher l'icône appropriée pour une action
  const getActionIcon = (action: GameAction) => {
    if (action.points > 0) {
      return <ThumbsUp className="h-5 w-5 text-green-500" />;
    } else {
      return <ThumbsDown className="h-5 w-5 text-red-500" />;
    }
  };

  // Calcul du taux de réussite
  const successRate = Math.round(gameSummary.successRate);

  // Fonction pour obtenir un message de conclusion en fonction du score
  const getConclusionMessage = () => {
    if (securityPoints < 0) {
      return "Vous avez fait trop d'erreurs critiques et la sécurité de l'entreprise a été compromise. Réessayez en prenant de meilleures décisions.";
    } else if (successRate < 30) {
      return "Votre approche de la cybersécurité nécessite d'être améliorée. Essayez de mieux comprendre les menaces et les bonnes pratiques.";
    } else if (successRate < 60) {
      return "Vous avez les bases de la cybersécurité, mais il reste encore des vulnérabilités à adresser. Continuez vos efforts !";
    } else if (successRate < 90) {
      return "Bonne performance! Vous avez démontré de solides compétences en cybersécurité, avec quelques points à améliorer.";
    } else {
      return "Excellent travail! Vous êtes un expert en cybersécurité et avez efficacement protégé l'entreprise contre les menaces.";
    }
  };

  // Score global en texte
  const getScoreText = () => {
    if (successRate < 30) return "Échec";
    if (successRate < 60) return "Passable";
    if (successRate < 80) return "Bon";
    if (successRate < 95) return "Très bon";
    return "Excellent";
  };

  return (
    <Dialog open={showSummary} onOpenChange={setShowSummary}>
      <DialogContent className="max-w-4xl bg-blue-950 border-blue-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            Résumé de votre mission de cybersécurité
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {securityPoints < 0 
              ? "La sécurité de l'entreprise a été compromise suite à une série de mauvaises décisions."
              : "Voici une analyse de vos décisions et des bonnes pratiques que vous avez appliquées."}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Résultat global */}
            <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    {securityPoints < 0 ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Award className="h-5 w-5 text-yellow-400" />
                    )}
                    <span>
                      {securityPoints < 0 ? "Mission échouée" : `Score: ${getScoreText()}`}
                    </span>
                  </h3>
                  <p className="text-blue-300">
                    {getConclusionMessage()}
                  </p>
                </div>
                <div className="bg-blue-800/60 p-3 rounded-lg text-center min-w-24">
                  <div className="text-3xl font-bold">
                    {securityPoints < 0 ? (
                      <span className="text-red-500">{securityPoints}</span>
                    ) : (
                      <span className="text-green-400">+{securityPoints}</span>
                    )}
                  </div>
                  <div className="text-sm text-blue-300">Points de sécurité</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux de réussite: {successRate}%</span>
                </div>
                <Progress value={successRate} className="h-2" 
                  indicatorClassName={`${
                    successRate < 30 ? 'bg-red-600' :
                    successRate < 60 ? 'bg-orange-500' :
                    successRate < 80 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <div className="bg-blue-900/60 p-2 rounded border border-blue-800 text-center">
                  <div className="text-xl font-semibold">{gameSummary.challengesCompleted}</div>
                  <div className="text-xs text-blue-300">Défis complétés</div>
                </div>
                <div className="bg-blue-900/60 p-2 rounded border border-blue-800 text-center">
                  <div className="text-xl font-semibold">{gameSummary.bestPractices.length}</div>
                  <div className="text-xs text-blue-300">Bonnes pratiques</div>
                </div>
                <div className="bg-blue-900/60 p-2 rounded border border-blue-800 text-center">
                  <div className="text-xl font-semibold">{gameSummary.keyDecisions.length}</div>
                  <div className="text-xs text-blue-300">Décisions clés</div>
                </div>
                <div className="bg-blue-900/60 p-2 rounded border border-blue-800 text-center">
                  <div className="text-xl font-semibold">{gameSummary.securityLevel}/5</div>
                  <div className="text-xs text-blue-300">Niveau final</div>
                </div>
              </div>
            </div>
            
            {/* Onglets pour les détails */}
            <Tabs defaultValue="decisions" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="decisions">Décisions Clés</TabsTrigger>
                <TabsTrigger value="bestPractices">Bonnes Pratiques</TabsTrigger>
              </TabsList>
              
              <TabsContent value="decisions" className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Vos décisions importantes</h3>
                
                {gameSummary.keyDecisions.length > 0 ? (
                  <div className="space-y-3">
                    {gameSummary.keyDecisions.map((action) => (
                      <div 
                        key={action.id}
                        className={`p-3 rounded-lg border ${
                          action.points >= 0 
                            ? 'bg-blue-900/30 border-blue-700' 
                            : 'bg-red-900/20 border-red-900/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getActionIcon(action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <div className="text-sm font-medium">
                                {action.type === 'choice' ? 'Choix effectué' : 
                                 action.type === 'advice' ? 'Conseil donné' : 
                                 'Défi résolu'}
                              </div>
                              <Badge variant={action.points >= 0 ? "default" : "destructive"} className="ml-2">
                                {action.points >= 0 ? `+${action.points}` : action.points} points
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-200">{action.description}</p>
                            <div className="text-xs text-blue-400 mt-1">
                              {format(new Date(action.timestamp), 'HH:mm:ss')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-blue-400">
                    Aucune décision enregistrée
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="bestPractices">
                <h3 className="text-lg font-semibold mb-2">Bonnes pratiques découvertes</h3>
                
                {gameSummary.bestPractices.length > 0 ? (
                  <Accordion type="multiple" className="space-y-2">
                    {gameSummary.bestPractices.map((practice) => (
                      <AccordionItem 
                        key={practice.id} 
                        value={practice.id}
                        className="bg-blue-900/30 border border-blue-800 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-blue-800/30">
                          <div className="flex items-center gap-2 text-left">
                            <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="font-medium">{practice.title}</span>
                            <Badge className={`ml-2 ${getImportanceColor(practice.importance)}`}>
                              {practice.importance}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1 bg-blue-900/20">
                          <p className="text-blue-200 text-sm">{practice.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {practice.category}
                          </Badge>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-6 text-blue-400 border border-blue-800 rounded-lg bg-blue-900/20">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune bonne pratique découverte durant cette session</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        
        <DialogFooter className="gap-2 flex-col sm:flex-row sm:justify-between">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => {
              resetGame();
              setShowSummary(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Redémarrer la mission
          </Button>
          
          <Button 
            onClick={() => setShowSummary(false)}
            className="gap-2"
          >
            Fermer le résumé
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSummary;