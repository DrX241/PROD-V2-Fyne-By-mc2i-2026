import React from 'react';
import { useCyberCrisisContext } from '../CyberCrisisContext';

const CrisisDashboard: React.FC = () => {
  const { state } = useCyberCrisisContext();
  const { budget, score, reputation, scenario, alertLevel } = state;
  
  // Calculer le pourcentage de budget restant
  const budgetPercentage = scenario ? (budget / scenario.initialBudget) * 100 : 0;
  
  // Déterminer les couleurs en fonction des valeurs
  const getBudgetColor = () => {
    if (budgetPercentage > 60) return 'text-green-600';
    if (budgetPercentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getReputationColor = () => {
    if (reputation > 70) return 'text-green-600';
    if (reputation > 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreColor = () => {
    if (score > 75) return 'text-green-600';
    if (score > 35) return 'text-yellow-600';
    return 'text-gray-600';
  };
  
  const getAlertBgColor = () => {
    switch (alertLevel) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'elevated': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Formater le budget pour l'affichage
  const formattedBudget = budget.toLocaleString('fr-FR');
  const formattedInitialBudget = scenario ? scenario.initialBudget.toLocaleString('fr-FR') : '0';
  
  // Afficher le temps écoulé si la simulation est active
  const renderElapsedTime = () => {
    if (!state.simulationStartTime) return null;
    
    const elapsedTimeInSeconds = Math.floor((Date.now() - state.simulationStartTime) / 1000);
    const minutes = Math.floor(elapsedTimeInSeconds / 60);
    const seconds = elapsedTimeInSeconds % 60;
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">TEMPS ÉCOULÉ</div>
        <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{formattedTime}</div>
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
        Tableau de bord de crise
      </h2>
      
      {/* Niveau d'alerte */}
      <div className={`mb-4 p-2 rounded-md text-center font-bold ${getAlertBgColor()}`}>
        NIVEAU D'ALERTE: {alertLevel.toUpperCase()}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Budget */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">BUDGET</div>
          <div className={`text-xl font-bold ${getBudgetColor()}`}>{formattedBudget}€</div>
          <div className="text-xs text-gray-500">{scenario ? `sur ${formattedInitialBudget}€` : ""}</div>
          
          {/* Barre de progression du budget */}
          <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full ${getBudgetColor().replace('text-', 'bg-')}`}
              style={{ width: `${Math.max(0, Math.min(100, budgetPercentage))}%` }}
            ></div>
          </div>
        </div>
        
        {/* Score */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">SCORE</div>
          <div className={`text-xl font-bold ${getScoreColor()}`}>{score}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
        
        {/* Réputation */}
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">RÉPUTATION</div>
          <div className={`text-xl font-bold ${getReputationColor()}`}>{reputation}</div>
          <div className="text-xs text-gray-500">/ 100</div>
          
          {/* Barre de progression de la réputation */}
          <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full ${getReputationColor().replace('text-', 'bg-')}`}
              style={{ width: `${Math.max(0, Math.min(100, reputation))}%` }}
            ></div>
          </div>
        </div>
        
        {/* Temps écoulé */}
        {renderElapsedTime()}
      </div>
    </div>
  );
};

export default CrisisDashboard;