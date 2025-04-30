import React, { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { EventType, UrgencyLevel } from '@shared/types/challenge';
import { AlertTriangle, Calendar, Clock, DollarSign } from 'lucide-react';

interface ScenarioPhaseProps {
  onComplete: () => void;
}

export default function ScenarioPhase({ onComplete }: ScenarioPhaseProps) {
  const { generateScenario, state, error, isLoading } = useGame();
  const [emailExpanded, setEmailExpanded] = useState(false);
  
  // Tentative de génération du scénario au montage du composant
  useEffect(() => {
    if (state.players.length > 0 && !state.scenario.id) {
      generateScenario().catch(err => 
        console.error('Failed to generate scenario:', err)
      );
    }
  }, [state.players]);
  
  // Récupérer l'email initial
  const emailEvent = state.gameEvents.find(
    event => event.type === EventType.EMAIL
  );
  
  let emailData = null;
  if (emailEvent) {
    try {
      emailData = JSON.parse(emailEvent.content);
    } catch (e) {
      console.error('Failed to parse email content:', e);
    }
  }
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Fonction pour obtenir la couleur selon le niveau d'urgence
  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.CRITICAL:
        return 'text-red-500';
      case UrgencyLevel.HIGH:
        return 'text-orange-500';
      case UrgencyLevel.MEDIUM:
        return 'text-yellow-500';
      case UrgencyLevel.LOW:
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">🚨 Situation de Crise 🚨</h2>
        <p className="text-blue-300">Un email urgent vient d'arriver...</p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-blue-300">Génération du scénario en cours...</p>
        </div>
      ) : !emailData ? (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-blue-600/30 text-center">
          <p>Aucun scénario n'a été généré. Veuillez réessayer.</p>
          <button
            onClick={() => generateScenario()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Informations du scénario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
              <div className="bg-blue-900/50 rounded-full p-2 mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm text-slate-400">Date de l'incident</h3>
                <p className="font-medium">{formatDate(state.scenario.simulatedDate)}</p>
              </div>
            </div>
            
            <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
              <div className="bg-blue-900/50 rounded-full p-2 mr-3">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm text-slate-400">Budget disponible</h3>
                <p className="font-medium">{state.scenario.initialBudget.toLocaleString('fr-FR')} €</p>
              </div>
            </div>
            
            <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
              <div className="bg-blue-900/50 rounded-full p-2 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm text-slate-400">Niveau d'urgence</h3>
                <p className={`font-medium ${getUrgencyColor(state.scenario.urgencyLevel)}`}>
                  {state.scenario.urgencyLevel === UrgencyLevel.CRITICAL ? 'CRITIQUE' :
                    state.scenario.urgencyLevel === UrgencyLevel.HIGH ? 'ÉLEVÉ' :
                    state.scenario.urgencyLevel === UrgencyLevel.MEDIUM ? 'MOYEN' : 'FAIBLE'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/60 p-4 rounded-lg border border-blue-700/30 flex items-center">
              <div className="bg-blue-900/50 rounded-full p-2 mr-3">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm text-slate-400">Entreprise concernée</h3>
                <p className="font-medium">{state.scenario.companyName}</p>
              </div>
            </div>
          </div>
          
          {/* Email */}
          <div className={`bg-white text-slate-900 rounded-lg shadow-lg overflow-hidden transition-all ${emailExpanded ? 'max-h-none' : 'max-h-96'}`}>
            <div className="border-b border-slate-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-lg">{emailData.subject}</div>
                {emailData.isUrgent && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                    URGENT
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-start text-sm">
                <div>
                  <div>
                    <span className="text-slate-500">De:</span> {emailData.sender.name} &lt;{emailData.sender.email}&gt;
                  </div>
                  {emailData.sender.role && (
                    <div className="text-slate-500 text-xs">
                      {emailData.sender.role}
                    </div>
                  )}
                </div>
                <div className="text-slate-500 text-xs">
                  {new Date(emailData.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="p-4 whitespace-pre-wrap">
              {emailData.content}
            </div>
            
            {!emailExpanded && (
              <div className="p-2 text-center border-t border-slate-200">
                <button 
                  onClick={() => setEmailExpanded(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Voir plus...
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={onComplete}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-md font-medium transition-colors"
            >
              Commencer à gérer la crise
            </button>
          </div>
        </>
      )}
    </div>
  );
}