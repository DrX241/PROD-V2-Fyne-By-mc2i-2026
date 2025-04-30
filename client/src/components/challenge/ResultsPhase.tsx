import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventType } from '@shared/types/challenge';
import { Award, Clock, BarChart, ArrowDown, ArrowUp, Euro, MessageCircle, AlertTriangle, Check, X, FileText } from 'lucide-react';

interface ResultsPhaseProps {
  onComplete: () => void;
}

export default function ResultsPhase({ onComplete }: ResultsPhaseProps) {
  const { state } = useGame();
  
  const activePlayer = state.players.find(p => p.isActive);
  const totalEvents = state.gameEvents.length;
  const playerActions = state.gameEvents.filter(e => e.type === EventType.PLAYER_ACTION);
  const npcResponses = state.gameEvents.filter(e => e.type === EventType.NPC_RESPONSE);
  const systemEvents = state.gameEvents.filter(e => e.type === EventType.SYSTEM_EVENT);
  const decisionPoints = state.gameEvents.filter(e => e.type === EventType.DECISION_POINT);
  
  // Calculer le temps total de la simulation en minutes
  const totalTimeMinutes = state.endedAt && state.startedAt 
    ? Math.floor((state.endedAt - state.startedAt) / (1000 * 60)) 
    : 0;
  
  // Calculer le pourcentage du budget utilisé
  const budgetPercentageUsed = state.scenario.initialBudget 
    ? 100 - ((state.scenario.remainingBudget / state.scenario.initialBudget) * 100)
    : 0;
    
  // Obtenir les événements avec des points (positifs et négatifs)
  const positiveScoreEvents = state.gameEvents.filter(e => e.metadata?.points && e.metadata.points > 0);
  const negativeScoreEvents = state.gameEvents.filter(e => e.metadata?.points && e.metadata.points < 0);
  
  // Calculer le score maximal possible (basé sur le nombre de décisions)
  const maxPossibleScore = decisionPoints.length * 10;
  const scorePercentage = maxPossibleScore > 0 ? (activePlayer?.score || 0) / maxPossibleScore * 100 : 0;
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (startTime: number, endTime: number) => {
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const determinePerformanceLevel = (scorePercentage: number) => {
    if (scorePercentage >= 80) return "Expert";
    if (scorePercentage >= 60) return "Avancé";
    if (scorePercentage >= 40) return "Intermédiaire";
    return "Débutant";
  };
  
  const generateFeedback = (scorePercentage: number, budgetPercentageUsed: number) => {
    if (scorePercentage >= 80) {
      return "Excellente performance! Vous avez démontré une expertise en matière de gestion de crise cybersécurité. Vos décisions étaient stratégiques et bien équilibrées.";
    } else if (scorePercentage >= 60) {
      return "Bonne performance! Vous avez fait preuve de solides compétences en gestion de crise, mais il y a encore place à l'amélioration, particulièrement dans l'optimisation des ressources.";
    } else if (scorePercentage >= 40) {
      return "Performance moyenne. Vous avez réussi à gérer certains aspects de la crise, mais plusieurs décisions clés auraient pu être améliorées pour un meilleur résultat global.";
    } else {
      return "Des améliorations sont nécessaires. Il est recommandé de réviser les bonnes pratiques en gestion de crise cybersécurité et de vous concentrer sur la priorisation des actions.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Résultats de la simulation</h2>
        <p className="text-muted-foreground mt-2">
          Analyse de votre performance dans la gestion de crise
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Score final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center">
              {activePlayer?.score || 0}
              <span className="text-sm font-normal text-muted-foreground"> / {maxPossibleScore}</span>
            </div>
            <Progress value={scorePercentage} className="h-2 mt-2" />
            <div className="text-center text-sm text-muted-foreground mt-1">
              Niveau: {determinePerformanceLevel(scorePercentage)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Temps total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center">
              {totalTimeMinutes} <span className="text-sm font-normal text-muted-foreground">min</span>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-1">
              {formatTimestamp(state.startedAt)} - {formatTimestamp(state.endedAt || Date.now())}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Euro className="h-5 w-5 mr-2 text-primary" />
              Budget utilisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center">
              {Math.round(budgetPercentageUsed)}%
            </div>
            <Progress value={budgetPercentageUsed} className="h-2 mt-2" />
            <div className="text-center text-sm text-muted-foreground mt-1">
              Restant: {state.scenario.remainingBudget?.toLocaleString() || 0} €
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Évaluation de la performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {generateFeedback(scorePercentage, budgetPercentageUsed)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <div className="font-medium">Points forts:</div>
              <ul className="space-y-1">
                {positiveScoreEvents.slice(0, 3).map((event, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>{event.content.length > 60 ? `${event.content.substring(0, 60)}...` : event.content}</span>
                  </li>
                ))}
                {positiveScoreEvents.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Aucun point fort particulier identifié
                  </li>
                )}
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Points à améliorer:</div>
              <ul className="space-y-1">
                {negativeScoreEvents.slice(0, 3).map((event, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <X className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                    <span>{event.content.length > 60 ? `${event.content.substring(0, 60)}...` : event.content}</span>
                  </li>
                ))}
                {negativeScoreEvents.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Aucun point d'amélioration majeur identifié
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="stats" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de la simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Actions joueur</div>
                  <div className="text-2xl font-bold">{playerActions.length}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Réponses NPC</div>
                  <div className="text-2xl font-bold">{npcResponses.length}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Points de décision</div>
                  <div className="text-2xl font-bold">{decisionPoints.length}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Interactions totales</div>
                  <div className="text-2xl font-bold">{totalEvents}</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Bonnes décisions</span>
                    <span className="text-sm font-medium">{positiveScoreEvents.length}</span>
                  </div>
                  <Progress value={(positiveScoreEvents.length / (positiveScoreEvents.length + negativeScoreEvents.length || 1)) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Efficacité budgétaire</span>
                    <span className="text-sm font-medium">{Math.round(100 - budgetPercentageUsed)}%</span>
                  </div>
                  <Progress value={100 - budgetPercentageUsed} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Objectifs atteints</span>
                    <span className="text-sm font-medium">{Math.round(scorePercentage)}%</span>
                  </div>
                  <Progress value={scorePercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Chronologie des événements clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-muted ml-4 mt-3"></div>
                <div className="space-y-8">
                  {state.gameEvents
                    .filter(e => e.type === EventType.DECISION_POINT || e.metadata?.points)
                    .map((event, index) => (
                      <div key={index} className="flex relative">
                        <div className="mr-4">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10 relative">
                            {event.type === EventType.DECISION_POINT ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : event.metadata?.points && event.metadata.points > 0 ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {event.type === EventType.DECISION_POINT ? 'Point de décision' : 'Résultat d\'action'}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {formatTimestamp(event.timestamp)}
                            {event.metadata?.points && (
                              <Badge 
                                variant={event.metadata.points > 0 ? 'default' : 'destructive'}
                                className="ml-2"
                              >
                                {event.metadata.points > 0 ? '+' : ''}{event.metadata.points} pts
                              </Badge>
                            )}
                            {event.metadata?.budgetChange && (
                              <Badge 
                                variant="outline"
                                className="ml-2"
                              >
                                {event.metadata.budgetChange > 0 ? '+' : ''}{event.metadata.budgetChange} €
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm border p-3 rounded-md bg-muted/50">
                            {event.content}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center">
        <Button onClick={onComplete} className="px-8">
          Nouvelle simulation
        </Button>
      </div>
    </div>
  );
}