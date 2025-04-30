import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { EventType, UrgencyLevel } from '@shared/types/challenge';
import { MessageCircle, Send, AlertTriangle, Clock, FileText, Euro } from 'lucide-react';

interface GameplayPhaseProps {
  onComplete: () => void;
}

export default function GameplayPhase({ onComplete }: GameplayPhaseProps) {
  const { state, submitAction, endGame, isLoading, error } = useGame();
  const [action, setAction] = useState('');
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const isGameOver = state.isGameOver;
  const activePlayer = state.players.find(p => p.isActive);
  
  useEffect(() => {
    if (state.scenario.currentStage && state.scenario.maxStages) {
      setProgressPercentage((state.scenario.currentStage / state.scenario.maxStages) * 100);
    }
  }, [state.scenario.currentStage, state.scenario.maxStages]);

  const handleSubmitAction = async () => {
    if (!action.trim()) {
      setErrorMessage('Veuillez entrer une action.');
      return;
    }
    
    setErrorMessage(null);
    
    try {
      await submitAction(action, selectedNpcId || undefined);
      setAction('');
    } catch (error) {
      setErrorMessage('Erreur lors de la soumission de l\'action. Veuillez réessayer.');
      console.error(error);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame("Terminated by player");
      onComplete();
    } catch (error) {
      setErrorMessage('Erreur lors de la fin du jeu. Veuillez réessayer.');
      console.error(error);
    }
  };

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case UrgencyLevel.LOW:
        return 'text-green-500';
      case UrgencyLevel.MEDIUM:
        return 'text-yellow-500';
      case UrgencyLevel.HIGH:
        return 'text-orange-500';
      case UrgencyLevel.CRITICAL:
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{state.scenario.title || 'Simulation en cours'}</h2>
          <p className="text-muted-foreground mt-1">
            {state.scenario.description || 'Gérez la crise cybersécurité'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center ${getUrgencyColor(state.scenario.urgencyLevel)}`}>
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              {state.scenario.urgencyLevel || UrgencyLevel.MEDIUM}
            </span>
          </div>
          
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Étape {state.scenario.currentStage || 1}/{state.scenario.maxStages || 5}</span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center">
            <Euro className="h-4 w-4 mr-1" />
            <span>{state.scenario.remainingBudget?.toLocaleString() || 0} €</span>
          </Badge>
        </div>
      </div>
      
      <Progress value={progressPercentage} className="w-full h-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Objectifs</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2 list-disc list-inside">
                {state.scenario.objectives?.map((objective, index) => (
                  <li key={index} className="text-sm">{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Équipe</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {state.npcs.map((npc) => (
                <div 
                  key={npc.id}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-muted transition-colors ${selectedNpcId === npc.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedNpcId(prev => prev === npc.id ? null : npc.id)}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{npc.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{npc.name}</div>
                    <div className="text-xs text-muted-foreground">{npc.role}</div>
                  </div>
                </div>
              ))}
              
              {state.players.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center p-2 rounded"
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm flex items-center">
                      {player.name}
                      {player.isActive && (
                        <Badge className="ml-2 text-xs" variant="outline">Vous</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{player.role}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Score</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-center">
                {activePlayer?.score || 0}
              </div>
              <div className="text-sm text-center text-muted-foreground">
                points
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleEndGame}
                disabled={isLoading}
              >
                Terminer la simulation
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-3 space-y-4">
          <Card className="flex flex-col h-full max-h-[600px]">
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Fil de communication
                </CardTitle>
                {selectedNpcId && (
                  <Badge variant="outline">
                    Parler à: {state.npcs.find(n => n.id === selectedNpcId)?.name || 'Équipe'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 flex-grow overflow-y-auto">
              <div className="space-y-4">
                {state.gameEvents.map((event) => {
                  const isPlayerEvent = event.type === EventType.PLAYER_ACTION;
                  const isNpcEvent = event.type === EventType.NPC_RESPONSE;
                  const isSystemEvent = event.type === EventType.SYSTEM_EVENT;
                  const isDecisionPoint = event.type === EventType.DECISION_POINT;
                  
                  const sender = isPlayerEvent 
                    ? state.players.find(p => p.id === event.playerId)?.name 
                    : isNpcEvent 
                      ? state.npcs.find(n => n.id === event.npcId)?.name 
                      : 'Système';
                  
                  return (
                    <div 
                      key={event.id}
                      className={`flex ${isPlayerEvent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isPlayerEvent 
                            ? 'bg-primary text-primary-foreground' 
                            : isSystemEvent || isDecisionPoint
                              ? 'bg-muted text-muted-foreground border' 
                              : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{sender}</span>
                          <span className="text-xs opacity-70">{formatTimestamp(event.timestamp)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{event.content}</p>
                        
                        {event.metadata?.budgetChange && (
                          <div className={`text-xs mt-1 ${event.metadata.budgetChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {event.metadata.budgetChange > 0 ? '+' : ''}{event.metadata.budgetChange.toLocaleString()} € | Budget restant: {event.metadata.remainingBudget?.toLocaleString() || 0} €
                          </div>
                        )}
                        
                        {event.metadata?.points && (
                          <div className={`text-xs mt-1 ${event.metadata.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {event.metadata.points > 0 ? '+' : ''}{event.metadata.points} points
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            
            <Separator />
            
            <CardFooter className="p-4">
              {isGameOver ? (
                <div className="w-full text-center">
                  <p className="text-muted-foreground mb-2">La simulation est terminée</p>
                  <Button onClick={onComplete}>Voir les résultats</Button>
                </div>
              ) : (
                <div className="flex w-full space-x-2">
                  <Input
                    placeholder={`${selectedNpcId 
                      ? `Message à ${state.npcs.find(n => n.id === selectedNpcId)?.name}` 
                      : "Décrivez votre action..."}`}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    disabled={isLoading || isGameOver}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitAction();
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    onClick={handleSubmitAction}
                    disabled={isLoading || isGameOver || !action.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
          
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}