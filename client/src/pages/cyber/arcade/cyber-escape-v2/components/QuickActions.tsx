import React from 'react';
import { motion } from 'framer-motion';
import { Eye, LogOut, MessageSquare, HelpCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomData } from '../types/game';

interface QuickActionProps {
  onAction: (action: string, target?: string) => void;
  currentRoom: RoomData;
}

/**
 * Composant qui affiche des boutons d'action rapide pour les interactions courantes
 */
const QuickActions: React.FC<QuickActionProps> = ({ onAction, currentRoom }) => {
  // Actions disponibles en fonction de l'état actuel de la salle
  const hasNpcs = currentRoom.npcs && currentRoom.npcs.length > 0;
  const hasExits = currentRoom.exits && Object.keys(currentRoom.exits).length > 0;
  const hasObjects = currentRoom.objects && currentRoom.objects.length > 0;

  // Animation pour les boutons
  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <div className="border border-gray-800 rounded-lg bg-black/40 backdrop-blur-sm p-3">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Actions rapides</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {/* Action: Examiner la salle */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 0.1 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-gray-700 bg-gray-900/50 hover:bg-gray-800/70"
            onClick={() => onAction('regarder')}
          >
            <Eye className="mr-2 h-4 w-4 text-gray-400" />
            <span className="text-gray-300">Regarder</span>
          </Button>
        </motion.div>
        
        {/* Action: Parler (disponible seulement s'il y a des PNJs) */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="outline" 
            className={`w-full border-blue-800 ${hasNpcs ? 'bg-blue-900/30 hover:bg-blue-800/40' : 'bg-gray-900/30 opacity-50 cursor-not-allowed'}`}
            onClick={() => hasNpcs && onAction('parler')}
            disabled={!hasNpcs}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-blue-400" />
            <span className={hasNpcs ? 'text-blue-300' : 'text-gray-500'}>Parler</span>
          </Button>
        </motion.div>
        
        {/* Action: Se déplacer (disponible seulement s'il y a des sorties) */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 0.3 }}
        >
          <Button 
            variant="outline" 
            className={`w-full border-green-800 ${hasExits ? 'bg-green-900/30 hover:bg-green-800/40' : 'bg-gray-900/30 opacity-50 cursor-not-allowed'}`}
            onClick={() => hasExits && onAction('aller')}
            disabled={!hasExits}
          >
            <LogOut className="mr-2 h-4 w-4 text-green-400" />
            <span className={hasExits ? 'text-green-300' : 'text-gray-500'}>Aller</span>
          </Button>
        </motion.div>
        
        {/* Action: Examiner un objet (disponible seulement s'il y a des objets) */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            className={`w-full border-yellow-800 ${hasObjects ? 'bg-yellow-900/30 hover:bg-yellow-800/40' : 'bg-gray-900/30 opacity-50 cursor-not-allowed'}`}
            onClick={() => hasObjects && onAction('examiner')}
            disabled={!hasObjects}
          >
            <Eye className="mr-2 h-4 w-4 text-yellow-400" />
            <span className={hasObjects ? 'text-yellow-300' : 'text-gray-500'}>Examiner</span>
          </Button>
        </motion.div>
        
        {/* Action: Aide */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-purple-800 bg-purple-900/30 hover:bg-purple-800/40"
            onClick={() => onAction('aide')}
          >
            <HelpCircle className="mr-2 h-4 w-4 text-purple-400" />
            <span className="text-purple-300">Aide</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickActions;