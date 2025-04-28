import React from 'react';
import { Link, useRoute } from 'wouter';
import { useCyberCrisisContext } from './CyberCrisisContext';
import { Shield, Play, ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';

const CrisisHomePage: React.FC = () => {
  const { state, resetSimulation } = useCyberCrisisContext();
  const [match] = useRoute('/cyber-crisis');
  
  if (!match) return null;
  
  // Vérifier si une simulation a déjà été configurée
  const hasConfiguredSimulation = state.userRole && state.scenario;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* En-tête avec navigation de retour */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link to="/">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            CyberCrisisChallenge
          </h1>
        </div>
      </div>
      
      {/* Bannière principale */}
      <div className="mb-10 bg-blue-600 dark:bg-blue-800 text-white rounded-lg overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row">
          <div className="p-8 md:w-2/3">
            <h2 className="text-3xl font-bold mb-4">Testez vos compétences en gestion de crise cyber</h2>
            <p className="mb-6 text-blue-100">
              Plongez dans des scénarios réalistes de cyberattaques où chaque décision compte. 
              Gérez votre budget, préservez votre réputation et faites face à des interlocuteurs 
              aux personnalités diverses dans un environnement sous haute pression.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/cyber-crisis/setup">
                <button className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-6 rounded-full flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  {hasConfiguredSimulation ? 'Continuer la configuration' : 'Commencer'}
                </button>
              </Link>
              
              {hasConfiguredSimulation && (
                <Link to="/cyber-crisis/chat">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Accéder à la simulation
                  </button>
                </Link>
              )}
              
              {hasConfiguredSimulation && (
                <button 
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser votre simulation ? Tous vos progrès seront perdus.')) {
                      resetSimulation();
                    }
                  }}
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-700 font-bold py-2 px-6 rounded-full flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
          <div className="hidden md:flex md:w-1/3 bg-blue-700 dark:bg-blue-900 justify-center items-center">
            <Shield className="h-32 w-32 text-blue-200" />
          </div>
        </div>
      </div>
      
      {/* Caractéristiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Scénarios réalistes</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Incidents basés sur des cas réels : ransomware, fuite de données, piratage de messagerie. Chaque scénario propose des défis uniques.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Gestion stratégique</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez un budget de crise limité, prenez des décisions qui affectent votre score et votre réputation, et faites face aux conséquences.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-purple-600 dark:text-purple-400"
            >
              <path d="M17 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.1.9-2 2-2z" />
              <path d="M17 14v4" />
              <path d="M7 6a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2z" />
              <path d="M7 10v4a2 2 0 0 0 2 2h4" />
              <path d="M15 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-3" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Personnalités multiples</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Interagissez avec des personnages aux profils variés : DG impatient, DSI technique, hacker provocateur, employés paniqués...
          </p>
        </div>
      </div>
      
      {/* Comment ça marche */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Comment ça marche</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center mr-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Choisissez votre identité</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12 mb-6">
              Configurez votre profil et sélectionnez le rôle professionnel que vous souhaitez incarner dans la simulation.
            </p>
            
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center mr-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Sélectionnez un scénario</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12 mb-6">
              Choisissez parmi différents incidents cyber avec leurs propres défis et niveaux de difficulté.
            </p>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center mr-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Vivez la crise</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12 mb-6">
              Répondez aux interlocuteurs, prenez des décisions stratégiques et observez leur impact en temps réel.
            </p>
            
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center mr-4">
                <span className="font-bold">4</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Recevez votre évaluation</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12">
              À la fin de la simulation, obtenez une analyse détaillée de vos décisions et performances.
            </p>
          </div>
        </div>
      </div>
      
      {/* Appel à l'action final */}
      <div className="text-center">
        <Link to="/cyber-crisis/setup">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg">
            Démarrer la simulation
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CrisisHomePage;