import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import QuizEvaluation from '@/components/cyber/QuizEvaluation';
import RoleSelection from '@/components/cyber/RoleSelection';
import GameModeSelection from '@/components/cyber/GameModeSelection';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { type CyberSkillLevel, type CyberUserRole, type CyberGameMode } from '@shared/schema';

enum SetupStep {
  QUIZ_EVALUATION = 'quiz',
  ROLE_SELECTION = 'role',
  GAME_MODE_SELECTION = 'mode',
  COMPLETED = 'completed'
}

export default function CyberModeSelection() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<SetupStep>(SetupStep.QUIZ_EVALUATION);
  const [domain, setDomain] = useState<string>('gestion-crise');
  const [userSkillLevel, setUserSkillLevel] = useState<CyberSkillLevel>('Intermédiaire');
  const [userRole, setUserRole] = useState<CyberUserRole | null>(null);
  const [gameMode, setGameMode] = useState<CyberGameMode | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Extraire le domaine de l'URL si présent
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const domainParam = searchParams.get('domain');
    if (domainParam) {
      setDomain(domainParam);
    }
  }, []);

  const handleQuizComplete = (score: number, level: CyberSkillLevel) => {
    setQuizScore(score);
    setUserSkillLevel(level);
    setCurrentStep(SetupStep.ROLE_SELECTION);
  };

  const handleRoleSelect = (roleId: CyberUserRole) => {
    setUserRole(roleId);
    setCurrentStep(SetupStep.GAME_MODE_SELECTION);
  };

  const handleModeSelect = (mode: CyberGameMode) => {
    setGameMode(mode);
    setCurrentStep(SetupStep.COMPLETED);
    
    // Attendre un moment pour montrer la confirmation avant de rediriger
    setIsLoading(true);
    setTimeout(() => {
      // Rediriger vers la page de l'agent conversationnel avec les paramètres
      const params = new URLSearchParams({
        domain: domain,
        level: userSkillLevel,
        role: userRole as string,
        mode: mode
      });
      setLocation(`/cyber/agent?${params.toString()}`);
    }, 1500);
  };

  const handleBack = () => {
    if (currentStep === SetupStep.ROLE_SELECTION) {
      setCurrentStep(SetupStep.QUIZ_EVALUATION);
    } else if (currentStep === SetupStep.GAME_MODE_SELECTION) {
      setCurrentStep(SetupStep.ROLE_SELECTION);
    }
  };

  const handleCancel = () => {
    // Retour à la page d'accueil
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={handleCancel}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div className="text-center text-lg font-medium">
              Préparation de la session Cyber Agent
            </div>
            <div className="w-24"></div> {/* Espace pour équilibrer */}
          </div>
          
          <div className="relative">
            <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-gray-700">
              <div 
                className="flex flex-col justify-center shadow-none whitespace-nowrap text-white transition-all bg-gradient-to-r from-blue-500 to-indigo-500" 
                style={{ 
                  width: currentStep === SetupStep.QUIZ_EVALUATION ? '33%' : 
                         currentStep === SetupStep.ROLE_SELECTION ? '66%' : 
                         currentStep === SetupStep.GAME_MODE_SELECTION ? '99%' : '100%' 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <div className={`${currentStep === SetupStep.QUIZ_EVALUATION ? 'text-blue-400 font-medium' : (currentStep > SetupStep.QUIZ_EVALUATION ? 'text-green-500' : '')}`}>
                Évaluation
              </div>
              <div className={`${currentStep === SetupStep.ROLE_SELECTION ? 'text-blue-400 font-medium' : (currentStep > SetupStep.ROLE_SELECTION ? 'text-green-500' : '')}`}>
                Rôle
              </div>
              <div className={`${currentStep === SetupStep.GAME_MODE_SELECTION ? 'text-blue-400 font-medium' : (currentStep > SetupStep.GAME_MODE_SELECTION ? 'text-green-500' : '')}`}>
                Mode de jeu
              </div>
            </div>
          </div>
        </div>

        {/* Conteneur principal */}
        <div className="animate-fadeIn">
          {currentStep === SetupStep.QUIZ_EVALUATION && (
            <QuizEvaluation 
              domain={domain}
              onComplete={handleQuizComplete}
              onCancel={handleCancel}
            />
          )}
          
          {currentStep === SetupStep.ROLE_SELECTION && (
            <RoleSelection 
              onSelectRole={handleRoleSelect}
            />
          )}
          
          {currentStep === SetupStep.GAME_MODE_SELECTION && (
            <GameModeSelection 
              onSelectMode={handleModeSelect}
            />
          )}
          
          {currentStep === SetupStep.COMPLETED && (
            <Card className="bg-gradient-to-br from-green-950 to-emerald-900 text-white border-green-800 max-w-md mx-auto shadow-lg">
              <CardContent className="pt-6 pb-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-600/20 p-3">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold">Configuration terminée</h2>
                <div className="space-y-1 text-green-300">
                  <p>Votre niveau : <span className="font-medium text-white">{userSkillLevel}</span></p>
                  <p>Votre rôle : <span className="font-medium text-white">{userRole}</span></p>
                  <p>Mode de jeu : <span className="font-medium text-white">{gameMode === 'classic' ? 'Classique' : 'Tunnel'}</span></p>
                </div>
                
                <p className="text-sm text-green-200">
                  {isLoading ? 'Préparation de votre expérience...' : 'Vous allez être redirigé vers la simulation.'}
                </p>
                
                {isLoading && (
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Bouton Retour (visible uniquement pour les étapes intermédiaires) */}
        {(currentStep === SetupStep.ROLE_SELECTION || currentStep === SetupStep.GAME_MODE_SELECTION) && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'étape précédente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}