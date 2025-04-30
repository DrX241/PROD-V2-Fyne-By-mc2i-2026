import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { EventType } from '@shared/types/challenge';
import { Award, DollarSign, Clock, ArrowLeft, User, BarChart } from 'lucide-react';

interface ResultsPhaseProps {
  onRestart: () => void;
}

export default function ResultsPhase({ onRestart }: ResultsPhaseProps) {
  const { state } = useGame();
  
  // Trouver le résumé de fin de jeu (dernier événement système)
  const summaryEvent = [...state.gameEvents]
    .reverse()
    .find(event => event.type === EventType.SYSTEM_EVENT);
  
  // Calculer le temps total de jeu
  const gameDuration = state.endedAt 
    ? Math.floor((state.endedAt - state.startedAt) / 1000 / 60) 
    : 0;
  
  // Calculer le budget utilisé
  const budgetUsed = state.scenario.initialBudget - state.scenario.remainingBudget;
  const budgetPercentage = Math.round((budgetUsed / state.scenario.initialBudget) * 100);
  
  // Trier les joueurs par score
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Résultats de la Gestion de Crise</h2>
        <p className="text-blue-300">
          Synthèse des actions et évaluation de la gestion de crise
        </p>
      </div>
      
      {/* Statistiques du jeu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
          <div className="bg-blue-900/50 rounded-full p-2 mr-3">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400">Durée de la crise</h3>
            <p className="font-medium">{gameDuration} minutes</p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
          <div className="bg-blue-900/50 rounded-full p-2 mr-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400">Budget utilisé</h3>
            <div>
              <span className="font-medium">{budgetUsed.toLocaleString('fr-FR')} € </span>
              <span className="text-xs text-slate-400">({budgetPercentage}%)</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
          <div className="bg-blue-900/50 rounded-full p-2 mr-3">
            <BarChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm text-slate-400">Actions totales</h3>
            <p className="font-medium">
              {state.gameEvents.filter(e => e.type === EventType.PLAYER_ACTION).length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tableau des scores */}
      <div className="bg-slate-800/40 rounded-lg border border-blue-800/30 overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b border-blue-800/30 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Tableau des scores
        </h3>
        
        <div className="p-4">
          <div className="grid grid-cols-12 text-sm text-slate-400 mb-2 px-2">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Joueur</div>
            <div className="col-span-4">Rôle</div>
            <div className="col-span-3 text-right">Score</div>
          </div>
          
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`grid grid-cols-12 p-2 rounded-md items-center ${index === 0 ? 'bg-yellow-900/20' : 'hover:bg-slate-700/30'}`}
            >
              <div className="col-span-1 font-bold">
                {index === 0 ? '🏆' : index + 1}
              </div>
              <div className="col-span-4 font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-400" />
                {player.name}
              </div>
              <div className="col-span-4 text-slate-300">
                {player.role}
              </div>
              <div className="col-span-3 text-right font-bold">
                {player.score} pts
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Résumé de fin de jeu */}
      {summaryEvent && (
        <div className="bg-slate-800/40 rounded-lg border border-blue-800/30 p-4">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-blue-800/20">
            Synthèse de la gestion de crise
          </h3>
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
            {summaryEvent.content}
          </div>
        </div>
      )}
      
      {/* Bouton pour recommencer */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-md font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Commencer une nouvelle simulation
        </button>
      </div>
    </div>
  );
}