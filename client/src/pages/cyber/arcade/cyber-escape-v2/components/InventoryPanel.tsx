import React from 'react';
import { motion } from 'framer-motion';
import { Package, Info, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InventoryItem } from '../types/game';

interface InventoryPanelProps {
  items: Record<string, InventoryItem>;
  onUseItem: (itemId: string) => void;
  onInspectItem: (itemId: string) => void;
}

/**
 * Panneau d'inventaire pour gérer les objets collectés
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({ 
  items, 
  onUseItem, 
  onInspectItem 
}) => {
  const itemsArray = Object.values(items);
  
  // Animation pour les éléments de l'inventaire
  const itemVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };
  
  // Retourner un icône en fonction du type d'objet
  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'key':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'document':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <Card className="bg-black/70 border-blue-900 shadow-lg shadow-blue-900/10">
      <CardHeader className="border-b border-blue-900/50 bg-blue-950/30 py-2 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-400">Inventaire</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {itemsArray.length} / 10
        </Badge>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {itemsArray.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Votre inventaire est vide.</p>
              <p className="text-gray-600 text-xs mt-2">
                Explorez pour collecter des objets utiles.
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {itemsArray.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-blue-900/20 border border-blue-800 rounded-md overflow-hidden"
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getItemIcon(item.type)}
                      <span className="font-medium text-blue-300">
                        {item.name}
                      </span>
                      <Badge 
                        className="ml-auto text-xs" 
                        variant="outline"
                      >
                        {item.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-3">
                      {item.description}
                    </p>
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => onInspectItem(item.id)}
                      >
                        <Info className="h-3.5 w-3.5 mr-1" />
                        Inspecter
                      </Button>
                      
                      {item.usable && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-700 text-blue-300 hover:bg-blue-900/50"
                          onClick={() => onUseItem(item.id)}
                        >
                          Utiliser
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryPanel;