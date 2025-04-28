import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useCyberCrisisContext } from './CyberCrisisContext';
import UserNameInput from './components/UserNameInput';
import RoleSelector from './components/RoleSelector';
import ScenarioSelector from './components/ScenarioSelector';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

const CrisisSetupPage: React.FC = () => {
  const { state } = useCyberCrisisContext();
  const [, setLocation] = useLocation();
  const [match] = useRoute('/cyber-crisis/setup');
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!match) return null;
  
  // Étapes de configuration
  const steps = [
    { 
      id: 'name', 
      title: 'Identité',
      component: <UserNameInput />,
      isComplete: !!state.userName
    },
    { 
      id: 'role', 
      title: 'Rôle professionnel',
      component: <RoleSelector />,
      isComplete: !!state.userRole
    },
    { 
      id: 'scenario', 
      title: 'Scénario de crise',
      component: <ScenarioSelector />,
      isComplete: !!state.scenario
    }
  ];
  
  // Vérifier si toutes les étapes sont complètes
  const allStepsComplete = steps.every(step => step.isComplete);
  
  // Navigation entre les étapes
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (allStepsComplete) {
      setLocation('/cyber-crisis/chat');
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation('/'); // Retour à l'accueil
    }
  };
  
  // Vérifier si le bouton Suivant doit être activé
  const isNextButtonEnabled = () => {
    if (currentStep === 0) return !!state.userName;
    if (currentStep === 1) return !!state.userRole;
    if (currentStep === 2) return !!state.scenario;
    return false;
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header avec navigation */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button
            onClick={goToPreviousStep}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {currentStep === 0 ? (
              <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Configuration du CyberCrisisChallenge
          </h1>
        </div>
      </div>
      
      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Connecteur */}
              {index > 0 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                ></div>
              )}
              
              {/* Indicateur d'étape */}
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-blue-500 text-white' 
                    : index === currentStep 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                } ${step.isComplete && index > currentStep ? 'bg-green-500 text-white' : ''}`}
                onClick={() => index <= Math.max(currentStep, 
                  steps.findIndex(s => !s.isComplete)) && setCurrentStep(index)}
              >
                {step.isComplete ? '✓' : index + 1}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        {/* Titres des étapes */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={`title-${step.id}`} 
              className={`text-sm font-medium ${
                index === currentStep 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              style={{ width: `${100 / steps.length}%`, textAlign: index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'center' }}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>
      
      {/* Contenu de l'étape actuelle */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
        {steps[currentStep].component}
      </div>
      
      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Retour à l\'accueil' : 'Précédent'}
        </button>
        
        <button
          onClick={goToNextStep}
          disabled={!isNextButtonEnabled()}
          className={`rounded-lg px-4 py-2 flex items-center ${
            isNextButtonEnabled() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {currentStep === steps.length - 1 && allStepsComplete ? 'Démarrer la simulation' : 'Suivant'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CrisisSetupPage;