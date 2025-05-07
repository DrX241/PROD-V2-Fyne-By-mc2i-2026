import React from 'react';
import { motion } from 'framer-motion';
import { Backpack, Info, Shield, ZapOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '../types/game';

interface InventoryPanelProps {
  items: InventoryItem[];
  onUseItem: (itemId: string) => void;
}

/**
 * Composant pour afficher l'inventaire du joueur
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({ items, onUseItem }) => {
  // Animation variants pour les éléments de l'inventaire
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Obtenir un icône en fonction du type d'objet
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'key':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'device':
        return <ZapOff className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <Card className="border-blue-600 bg-black/60 h-[500px] flex flex-col">
      <CardHeader className="px-4 py-2 flex-shrink-0 border-b border-blue-800 bg-blue-900/20">
        <div className="flex items-center gap-2">
          <Backpack className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Inventaire</span>
          <Badge variant="outline" className="ml-auto bg-blue-950/30 border-blue-700 text-blue-300">
            {items.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full w-full">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Backpack className="h-10 w-10 text-gray-600 mb-2" />
              <p className="text-gray-400 text-sm">Votre inventaire est vide</p>
              <p className="text-gray-500 text-xs mt-1">
                Explorez les salles pour trouver des objets utiles
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 gap-2 p-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="border border-blue-800 bg-blue-900/10 hover:bg-blue-900/20 rounded-lg p-3 cursor-pointer transition-colors"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {getItemIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-blue-300">{item.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                          </div>
                          {item.usable && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 h-auto"
                              onClick={() => onUseItem(item.id)}
                            >
                              Utiliser
                            </Button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-gray-900 border-blue-700">
                        <div className="space-y-1">
                          <p className="font-medium text-blue-300">{item.name}</p>
                          <p className="text-xs text-gray-300">{item.description}</p>
                          <div className="flex items-center mt-1 pt-1 border-t border-gray-800">
                            <Badge variant="outline" className="text-xs bg-blue-950/20 border-blue-700">
                              {item.type}
                            </Badge>
                            {item.usable ? (
                              <Badge variant="outline" className="text-xs ml-2 bg-green-950/20 border-green-700 text-green-400">
                                Utilisable
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs ml-2 bg-gray-950/20 border-gray-700 text-gray-400">
                                Non utilisable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryPanel;