import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageCircle, Map, Box, Key, Crosshair, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface pour les propriétés du composant
interface QuickActionsProps {
  onActionClick: (action: string, target?: string) => void;
  availableActions: string[];
  className?: string;
}

// Définition des actions rapides avec leurs icônes et descriptions
const actionDefinitions = [
  {
    id: 'look',
    icon: <Eye className="h-4 w-4 mr-2" />,
    label: 'Observer',
    description: 'Examiner la salle',
    command: 'regarder'
  },
  {
    id: 'talk',
    icon: <MessageCircle className="h-4 w-4 mr-2" />,
    label: 'Parler',
    description: 'Parler avec un PNJ',
    command: 'parler'
  },
  {
    id: 'inventory',
    icon: <Box className="h-4 w-4 mr-2" />,
    label: 'Inventaire',
    description: 'Voir mon inventaire',
    command: 'inventaire'
  },
  {
    id: 'unlock',
    icon: <Key className="h-4 w-4 mr-2" />,
    label: 'Déverrouiller',
    description: 'Déverrouiller une porte',
    command: 'déverrouiller'
  },
  {
    id: 'scan',
    icon: <Crosshair className="h-4 w-4 mr-2" />,
    label: 'Scanner',
    description: 'Scanner un élément',
    command: 'scanner'
  },
  {
    id: 'map',
    icon: <Map className="h-4 w-4 mr-2" />,
    label: 'Carte',
    description: 'Consulter la carte',
    command: 'carte'
  },
  {
    id: 'analyze',
    icon: <Zap className="h-4 w-4 mr-2" />,
    label: 'Analyser',
    description: 'Analyser un système',
    command: 'analyser'
  },
  {
    id: 'refresh',
    icon: <RefreshCw className="h-4 w-4 mr-2" />,
    label: 'Actualiser',
    description: 'Actualiser l\'état',
    command: 'refresh'
  }
];

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onActionClick, 
  availableActions,
  className = ''
}) => {
  // Filtrer les actions disponibles
  const filteredActions = actionDefinitions.filter(action => 
    availableActions.includes(action.id)
  );

  return (
    <Card className={`${className} border-blue-500 bg-black/80`}>
      <CardHeader className="py-3 px-4 border-b border-blue-800">
        <CardTitle className="text-sm font-medium text-blue-400">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredActions.map(action => (
            <motion.div key={action.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-blue-900/50"
                onClick={() => onActionClick(action.command)}
                title={action.description}
              >
                {action.icon}
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;