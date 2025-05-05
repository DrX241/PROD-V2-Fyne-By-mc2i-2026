import React from 'react';
import { 
  Home, 
  Shield, 
  Award, 
  HelpCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const GameNavigation: React.FC = () => {
  const { 
    securityPoints, 
    completedChallenges, 
    resetGame,
    currentRoom
  } = useGame();

  const [showResetDialog, setShowResetDialog] = React.useState(false);
  
  // Calcul du niveau de sécurité actuel (1-5)
  const securityLevel = Math.min(5, Math.floor(securityPoints / 25) + 1);
  
  // Pourcentage de progression vers le niveau suivant
  const progressToNextLevel = securityPoints % 25 / 25 * 100;
  
  // Progression globale estimée (pourcentage de défis complétés)
  const estimatedTotalChallenges = 20; // Estimation basée sur le nombre total de défis dans le jeu
  const overallProgress = (completedChallenges.length / estimatedTotalChallenges) * 100;
  
  return (
    <div className="h-screen flex flex-col bg-blue-950 border-r border-blue-900 w-20">
      {/* Logo et titre */}
      <div className="p-3 flex flex-col items-center justify-center">
        <div className="bg-blue-700 h-12 w-12 rounded-full flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs text-center text-blue-300 font-semibold">CYBER ESCAPE</span>
      </div>
      
      <Separator className="my-2 bg-blue-800" />
      
      {/* Information de niveau */}
      <div className="p-3 flex flex-col items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-blue-900/50 rounded-full h-14 w-14 flex items-center justify-center mb-1 relative">
                <span className="text-xl font-bold text-white">{securityLevel}</span>
                <div className="absolute inset-0 rounded-full">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="rgba(37, 99, 235, 0.3)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="4"
                      strokeDasharray={`${progressToNextLevel * 1.5} 150`}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-semibold">Niveau de sécurité: {securityLevel}</p>
                <p className="text-xs">{securityPoints} points accumulés</p>
                <p className="text-xs mt-1">Prochain niveau: {securityPoints % 25}/25 points</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Badge variant="outline" className="px-2 py-0.5 text-xs bg-blue-900/30">
          {securityPoints} pts
        </Badge>
      </div>
      
      {/* Progression globale */}
      <div className="px-3 py-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-1.5 bg-blue-900/50 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Progression: {Math.round(overallProgress)}%</p>
              <p className="text-xs mt-1">{completedChallenges.length}/{estimatedTotalChallenges} défis complétés</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Separator className="my-2 bg-blue-800" />
      
      {/* Navigation principale */}
      <div className="flex-1 flex flex-col items-center py-4 space-y-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-full ${
                  currentRoom.id === 'lobby' ? 'bg-blue-800 text-white' : 'text-blue-300 hover:text-white hover:bg-blue-900/50'
                }`}
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Accueil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-blue-300 hover:text-white hover:bg-blue-900/50"
              >
                <Award className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Récompenses ({completedChallenges.length})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-blue-300 hover:text-white hover:bg-blue-900/50"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Aide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Separator className="my-2 bg-blue-800" />
      
      {/* Options inférieures */}
      <div className="p-3 flex flex-col items-center space-y-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-blue-300 hover:text-white hover:bg-blue-900/50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Paramètres</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-blue-300 hover:text-white hover:bg-red-900/20"
                onClick={() => setShowResetDialog(true)}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Réinitialiser</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser la progression ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera toute votre progression et vous ramènera au début du jeu.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                resetGame();
                setShowResetDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameNavigation;