import React from 'react';
import { 
  BookOpen, 
  Eye, 
  Key, 
  LogIn, 
  MessageCircle, 
  Search, 
  Tool, 
  User 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsProps {
  onAction: (action: string, target?: string) => void;
  currentRoom: any;
  className?: string;
}

/**
 * Composant de boutons d'action rapide pour les interactions communes
 */
const QuickActions: React.FC<QuickActionsProps> = ({ onAction, currentRoom, className = '' }) => {
  // Définir les actions disponibles en fonction de la pièce actuelle
  const hasExits = currentRoom?.exits && Object.keys(currentRoom.exits).length > 0;
  const hasNpcs = currentRoom?.npcs && currentRoom.npcs.length > 0;
  const hasObjects = currentRoom?.objects && currentRoom.objects.length > 0;
  
  // Animations pour les boutons
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };
  
  // Styles pour les boutons d'action
  const baseButtonClass = "border border-green-700 bg-black/60 backdrop-blur-sm";
  const activeButtonClass = "hover:bg-green-900/30 hover:text-green-400";
  
  return (
    <div className={`p-2 rounded-lg bg-black/30 backdrop-blur-sm ${className}`}>
      <motion.div 
        className="grid grid-cols-4 gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Action: Regarder autour */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${activeButtonClass}`}
                  onClick={() => onAction('regarder')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">Regarder autour</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Se déplacer */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${hasExits ? activeButtonClass : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => hasExits && onAction('aller')}
                  disabled={!hasExits}
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">{hasExits ? 'Se déplacer' : 'Aucune sortie disponible'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Parler */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${hasNpcs ? activeButtonClass : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => hasNpcs && onAction('parler')}
                  disabled={!hasNpcs}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">{hasNpcs ? 'Parler' : 'Personne à qui parler'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Examiner */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${hasObjects ? activeButtonClass : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => hasObjects && onAction('examiner')}
                  disabled={!hasObjects}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">{hasObjects ? 'Examiner objets' : 'Rien à examiner'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Déverrouiller */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${activeButtonClass}`}
                  onClick={() => onAction('déverrouiller')}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">Déverrouiller</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Utiliser */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${activeButtonClass}`}
                  onClick={() => onAction('utiliser')}
                >
                  <Tool className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">Utiliser un objet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Qui suis-je */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${activeButtonClass}`}
                  onClick={() => onAction('qui_suis_je')}
                >
                  <User className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">Qui suis-je ?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Action: Aide */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${baseButtonClass} ${activeButtonClass}`}
                  onClick={() => onAction('aide')}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 border-green-600">
              <p className="text-xs">Aide et instructions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

export default QuickActions;