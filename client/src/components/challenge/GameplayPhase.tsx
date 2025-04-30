import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GameEvent as GameEventType, EventType } from '@shared/types/challenge';
import { Send, AlertTriangle, DollarSign, Info, Mail, MessageSquare, User } from 'lucide-react';

interface GameplayPhaseProps {
  onComplete: () => void;
}

export default function GameplayPhase({ onComplete }: GameplayPhaseProps) {
  const { state, submitPlayerAction, endGame, getActivePlayer, isLoading, error } = useGame();
  const [action, setAction] = useState('');
  
  const activePlayer = getActivePlayer();
  
  // Fonction pour soumettre une action
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!action.trim() || isLoading || !activePlayer) return;
    
    await submitPlayerAction(action);
    setAction('');
  };
  
  // Fonction pour formater un montant
  const formatBudget = (budget: number) => {
    return budget.toLocaleString('fr-FR') + ' €';
  };
  
  // Fonction pour vérifier si le jeu devrait se terminer
  const shouldEndGame = () => {
    return (
      state.scenario.currentStage >= state.scenario.maxStages ||
      state.scenario.remainingBudget <= 0 ||
      state.gameEvents.length > 30
    );
  };
  
  // Fonction pour terminer le jeu
  const handleEndGame = async () => {
    await endGame();
    onComplete();
  };
  
  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* En-tête avec informations de jeu */}
      <div className="bg-slate-900 border-b border-blue-900/40 p-4 flex flex-wrap justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-900/30 px-3 py-1 rounded-lg flex items-center">
            <DollarSign className="h-4 w-4 text-blue-400 mr-1" />
            <span className="text-sm font-medium">
              Budget: <span className={state.scenario.remainingBudget < 100000 ? 'text-orange-400' : 'text-blue-300'}>
                {formatBudget(state.scenario.remainingBudget)}
              </span>
              <span className="text-slate-400 text-xs"> / {formatBudget(state.scenario.initialBudget)}</span>
            </span>
          </div>
          
          <div className="bg-slate-800/80 px-3 py-1 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm">
              Étape: <span className="font-medium">{state.scenario.currentStage + 1}</span>/<span>{state.scenario.maxStages}</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800/80 px-3 py-1 rounded-lg flex items-center">
            <Info className="h-4 w-4 text-blue-400 mr-1" />
            <span className="text-sm">
              {state.scenario.companyName}
            </span>
          </div>
          
          {shouldEndGame() && (
            <button
              onClick={handleEndGame}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Terminer la crise
            </button>
          )}
        </div>
      </div>
      
      {/* Liste des messages/événements */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
        {state.gameEvents.map(event => (
          <GameEvent key={event.id} event={event} />
        ))}
      </div>
      
      {/* Zone de saisie */}
      <div className="bg-slate-900 border-t border-blue-900/40 p-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-2 rounded-md mb-3 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-2 text-sm">
          <span className="text-slate-400">Tour de:</span>{' '}
          <span className="font-semibold text-blue-300">{activePlayer?.name || 'Chargement...'}</span>{' '}
          <span className="text-slate-400">({activePlayer?.role || ''})</span>
        </div>
        
        <form onSubmit={handleSubmitAction} className="flex gap-2">
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            disabled={isLoading || !activePlayer}
            placeholder={
              isLoading ? "Traitement en cours..." : 
              !activePlayer ? "Attendez votre tour..." :
              "Décrivez votre action ou décision..."
            }
            className="flex-1 p-3 rounded-md bg-slate-800 border border-blue-700/50
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                     disabled:opacity-70 disabled:cursor-not-allowed"
            rows={3}
          />
          
          <button
            type="submit"
            disabled={!action.trim() || isLoading || !activePlayer}
            className="self-end p-3 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Composant pour afficher un événement de jeu
function GameEvent({ event }: { event: GameEventType }) {
  // Calculer les styles selon le type d'événement
  let className = "p-4 rounded-lg ";
  let icon = <Info className="h-5 w-5" />;
  
  switch (event.type) {
    case EventType.PLAYER_ACTION:
      className += "bg-blue-900/30 border border-blue-700/40";
      icon = <User className="h-5 w-5 text-blue-400" />;
      break;
    case EventType.NPC_RESPONSE:
      className += "bg-slate-800/60 border border-slate-700/40";
      icon = <MessageSquare className="h-5 w-5 text-purple-400" />;
      break;
    case EventType.EMAIL:
      className += "bg-slate-800/60 border border-yellow-700/20";
      icon = <Mail className="h-5 w-5 text-yellow-400" />;
      break;
    case EventType.BUDGET_UPDATE:
      className += "bg-slate-800/60 border-l-4 border-orange-500/50";
      icon = <DollarSign className="h-5 w-5 text-orange-400" />;
      break;
    case EventType.SYSTEM_EVENT:
    default:
      className += "bg-slate-800/40 border border-slate-700/30";
      icon = <Info className="h-5 w-5 text-blue-400" />;
      break;
  }
  
  // Formater le contenu d'un email
  const renderContent = () => {
    if (event.type === EventType.EMAIL) {
      try {
        const emailData = JSON.parse(event.content);
        return (
          <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 mt-2">
            <div className="mb-2">
              <span className="text-slate-400">De:</span> {emailData.sender.name} ({emailData.sender.email})
              <br />
              <span className="text-slate-400">Objet:</span> <span className="font-medium">{emailData.subject}</span>
              {emailData.isUrgent && (
                <span className="bg-red-900/30 text-red-300 text-xs px-2 py-0.5 rounded ml-2">
                  URGENT
                </span>
              )}
            </div>
            <div className="whitespace-pre-wrap text-slate-200">{emailData.content}</div>
          </div>
        );
      } catch (e) {
        return <div>{event.content}</div>;
      }
    } else if (event.type === EventType.BUDGET_UPDATE && event.metadata) {
      return (
        <div>
          <div className="font-medium">{event.content}</div>
          <div className="text-sm text-slate-400">
            Budget restant: {(event.metadata.remainingBudget as number).toLocaleString('fr-FR')} €
          </div>
        </div>
      );
    } else {
      return <div className="whitespace-pre-wrap">{event.content}</div>;
    }
  };
  
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <div className="bg-slate-900/50 p-2 rounded-full">
          {icon}
        </div>
        <div className="flex-1">
          {renderContent()}
        </div>
        <div className="text-xs text-slate-500">
          {new Date(event.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}