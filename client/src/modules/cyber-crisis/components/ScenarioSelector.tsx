import React from 'react';
import { useCyberCrisisContext } from '../CyberCrisisContext';
import crisisScenarios from '../ScenarioList';
import { CheckCircle, Lock, AlertTriangle, Shield, Database, Euro } from 'lucide-react';

const difficultyColors = {
  'débutant': 'bg-green-100 text-green-800',
  'intermédiaire': 'bg-yellow-100 text-yellow-800',
  'expert': 'bg-red-100 text-red-800'
};

// Icônes correspondant aux scénarios
const scenarioIcons = {
  'ransomware': <Lock className="h-10 w-10" />,
  'email_breach': <AlertTriangle className="h-10 w-10" />,
  'data_leak': <Database className="h-10 w-10" />
};

const ScenarioSelector: React.FC = () => {
  const { state, selectScenario } = useCyberCrisisContext();
  
  const handleScenarioSelect = (scenarioId: string) => {
    selectScenario(scenarioId);
  };
  
  // Vérifier si un scénario est disponible en fonction du niveau de difficulté du rôle
  const isScenarioAvailable = (scenarioDifficulty: string) => {
    if (!state.userRole) return false;
    
    const difficultyLevels = ['débutant', 'intermédiaire', 'expert'];
    const userRoleDifficultyIndex = difficultyLevels.indexOf(state.userRole.difficulty);
    const scenarioDifficultyIndex = difficultyLevels.indexOf(scenarioDifficulty);
    
    // Un utilisateur peut accéder aux scénarios de niveau inférieur ou égal à son rôle
    return scenarioDifficultyIndex <= userRoleDifficultyIndex;
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Choisissez un scénario de crise
      </h2>
      
      {!state.userRole && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Veuillez d'abord sélectionner un rôle professionnel pour voir les scénarios disponibles.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(crisisScenarios).map(scenario => {
          const isAvailable = isScenarioAvailable(scenario.difficulty);
          
          return (
            <div
              key={scenario.id}
              className={`
                p-5 rounded-lg border-2 relative overflow-hidden
                ${state.scenario?.id === scenario.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                  : isAvailable 
                    ? 'border-gray-200 bg-white dark:bg-gray-800 hover:border-blue-300 cursor-pointer hover:shadow-md' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed'}
              `}
              onClick={() => isAvailable && handleScenarioSelect(scenario.id)}
            >
              {/* Badge de difficulté */}
              <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${difficultyColors[scenario.difficulty]}`}>
                {scenario.difficulty}
              </div>
              
              {/* Badge de sélection */}
              {state.scenario?.id === scenario.id && (
                <div className="absolute top-3 left-3 bg-blue-500 text-white rounded-full p-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              
              {/* Icône */}
              <div className="flex justify-center items-center mb-4 text-gray-500 dark:text-gray-400">
                {scenarioIcons[scenario.id as keyof typeof scenarioIcons] || <Shield className="h-10 w-10" />}
              </div>
              
              {/* Titre et description */}
              <h3 className="font-bold text-lg text-center text-gray-800 dark:text-gray-200 mb-2">
                {scenario.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {scenario.description}
              </p>
              
              {/* Budget initial */}
              <div className="flex items-center justify-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                <Euro className="h-4 w-4 mr-1" />
                <span>Budget initial: {scenario.initialBudget.toLocaleString('fr-FR')}€</span>
              </div>
              
              {/* Message si non disponible */}
              {!isAvailable && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
                    <Lock className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-center font-bold">
                      Nécessite un rôle de niveau {scenario.difficulty} ou supérieur
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;