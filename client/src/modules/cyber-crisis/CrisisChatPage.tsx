import React, { useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useCyberCrisisContext } from './CyberCrisisContext';
import CrisisChat from './components/CrisisChat';
import CrisisDashboard from './components/CrisisDashboard';
import { ArrowLeft, Play, RotateCcw, AlertTriangle } from 'lucide-react';

const CrisisChatPage: React.FC = () => {
  const { state, startSimulation, endSimulation, resetSimulation } = useCyberCrisisContext();
  const [, setLocation] = useLocation();
  const [match] = useRoute('/cyber-crisis/chat');
  
  // Vérifier si l'utilisateur peut accéder à cette page
  useEffect(() => {
    if (!state.userRole || !state.scenario) {
      setLocation('/cyber-crisis/setup');
    }
  }, [state.userRole, state.scenario, setLocation]);
  
  // Handler pour démarrer la simulation
  const handleStartSimulation = () => {
    startSimulation();
  };
  
  // Handler pour réinitialiser la simulation
  const handleResetSimulation = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la simulation ? Tous les progrès seront perdus.')) {
      resetSimulation();
      setLocation('/cyber-crisis/setup');
    }
  };
  
  // Handler pour terminer la simulation
  const handleEndSimulation = () => {
    if (window.confirm('Êtes-vous sûr de vouloir terminer la simulation maintenant ?')) {
      endSimulation();
    }
  };
  
  if (!match) return null;
  
  // Si l'utilisateur n'a pas de rôle ou de scénario, rediriger vers la configuration
  if (!state.userRole || !state.scenario) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Configuration incomplète
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vous devez d'abord choisir un rôle et un scénario avant d'accéder à la simulation.
        </p>
        <Link to="/cyber-crisis/setup">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
            Aller à la configuration
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/cyber-crisis/setup">
            <button className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {state.scenario?.title}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {!state.isSimulationActive && !state.simulationEndTime && (
            <button
              onClick={handleStartSimulation}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </button>
          )}
          
          {state.isSimulationActive && (
            <button
              onClick={handleEndSimulation}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2"
            >
              Terminer
            </button>
          )}
          
          <button
            onClick={handleResetSimulation}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>
      
      {/* Informations sur le rôle */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Votre rôle</span>
            <h2 className="font-bold text-gray-800 dark:text-gray-200">{state.userRole.title}</h2>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">Difficulté</span>
            <div className={`inline-block ml-2 px-2 py-1 rounded text-xs ${
              state.userRole.difficulty === 'débutant' ? 'bg-green-100 text-green-800' :
              state.userRole.difficulty === 'intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {state.userRole.difficulty}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard de crise */}
      <CrisisDashboard />
      
      {/* Interface de chat */}
      <div className="h-[600px] flex flex-col">
        <CrisisChat />
      </div>
    </div>
  );
};

export default CrisisChatPage;