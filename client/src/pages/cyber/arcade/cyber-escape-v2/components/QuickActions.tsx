import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Map, LogIn, Shield, HelpCircle, Flashlight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsProps {
  onAction: (action: string, target?: string) => void;
}

/**
 * Barre d'actions rapides pour les interactions de base
 */
const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    { id: 'regarder', icon: <Eye className="h-4 w-4" />, label: 'Observer', tooltip: 'Observer la pièce' },
    { id: 'map', icon: <Map className="h-4 w-4" />, label: 'Plan', tooltip: 'Consulter le plan du bâtiment' },
    { id: 'examiner', icon: <Flashlight className="h-4 w-4" />, label: 'Examiner', tooltip: 'Examiner de plus près' },
    { id: 'securite', icon: <Shield className="h-4 w-4" />, label: 'Sécurité', tooltip: 'Vérifier les failles de sécurité' },
    { id: 'aide', icon: <HelpCircle className="h-4 w-4" />, label: 'Aide', tooltip: 'Demander de l\'aide' }
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 border border-gray-800 p-2 rounded-lg"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {actions.map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-gray-900/70 hover:bg-gray-800 gap-2"
                  onClick={() => onAction(action.id)}
                >
                  {action.icon}
                  <span className="text-xs hidden sm:inline">{action.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{action.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;