import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { InventoryItem } from '../types/game';

interface InventoryPanelProps {
  items: Record<string, InventoryItem>;
  onUseItem?: (itemId: string) => void;
  className?: string;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ 
  items, 
  onUseItem, 
  className = "" 
}) => {
  // Animation pour les nouveaux items
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
  };
  
  // Classes pour les items basées sur leur type/rareté
  const getItemClasses = (item: InventoryItem) => {
    // Items de base (décrypteur, lecteur RFID)
    if (item.id === 'decrypt_device' || item.id === 'rfid_reader') {
      return 'bg-blue-900/30 border-blue-600';
    }
    
    // Objets spéciaux (cristal temporel, etc.)
    if (item.id === 'time_crystal' || item.id === 'debug_tool' || item.id === 'crypto_analyzer') {
      return 'bg-purple-900/30 border-purple-600';
    }
    
    // Jetons-clés (récompenses d'étape)
    return 'bg-green-900/30 border-green-600';
  };
  
  return (
    <Card className={`border-green-500 bg-black/50 backdrop-blur-sm ${className}`}>
      <div className="p-3 border-b border-green-800 flex items-center">
        <Briefcase className="h-4 w-4 mr-2 text-green-400" />
        <h3 className="text-sm font-medium text-green-400">Inventaire</h3>
        <Badge variant="outline" className="ml-auto text-xs border-green-500 text-green-400">
          {Object.keys(items).length} / 12
        </Badge>
      </div>
      <div className="p-3">
        {Object.keys(items).length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(items).map(([id, item]) => (
              <TooltipProvider key={id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      className={`relative p-2 rounded border ${getItemClasses(item)} cursor-pointer transition-all hover:brightness-125 hover:border-opacity-100 group`}
                      onClick={() => onUseItem && onUseItem(id)}
                    >
                      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-400 group-hover:opacity-20 transition-opacity"></div>
                      </div>
                      
                      {/* Icône stylisée basée sur le type d'item */}
                      <div className="mb-1 flex justify-center">
                        {item.id.includes('key') || item.id.includes('token') || item.id.includes('badge') ? (
                          <div className="w-6 h-6 rounded-full bg-green-800/50 flex items-center justify-center">
                            <span className="text-green-400 text-xs font-bold">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        ) : item.id === 'decrypt_device' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-800/50 flex items-center justify-center">
                            <span className="text-blue-400 text-xs font-bold">DC</span>
                          </div>
                        ) : item.id === 'rfid_reader' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-800/50 flex items-center justify-center">
                            <span className="text-blue-400 text-xs font-bold">RF</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-800/50 flex items-center justify-center">
                            <span className="text-purple-400 text-xs font-bold">SP</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Nom de l'item avec troncature */}
                      <p className="text-center text-xs font-medium text-green-300 truncate">
                        {item.name.length > 15 ? `${item.name.substring(0, 13)}...` : item.name}
                      </p>
                      
                      {/* Badge pour les objets consommables */}
                      {item.consumed && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></span>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 border-green-600 p-3 max-w-[250px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-green-400">{item.name}</p>
                        {item.consumed && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                            Consommable
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-300">{item.description}</p>
                      
                      {item.useTarget && item.useTarget.length > 0 && (
                        <div className="pt-1 mt-1 border-t border-gray-700">
                          <div className="flex items-center">
                            <Info className="h-3 w-3 mr-1 text-blue-400" />
                            <p className="text-xs text-blue-400">Utilisable sur: {item.useTarget.join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Inventaire vide</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryPanel;