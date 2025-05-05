import React from 'react';
import { motion } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SecurityComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'firewall' | 'authentication' | 'segmentation' | 'monitoring' | 'other';
  power: number;
  cost: number;
  compatibility: string[];
}

interface DraggableComponentProps {
  component: SecurityComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  isSelected, 
  onSelect,
  disabled
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'security-component',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !disabled,
  }));

  // Classes pour les catégories
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'firewall': return 'bg-orange-700/20 text-orange-500';
      case 'authentication': return 'bg-green-700/20 text-green-500';
      case 'segmentation': return 'bg-purple-700/20 text-purple-500';
      case 'monitoring': return 'bg-blue-700/20 text-blue-500';
      default: return 'bg-gray-700/20 text-gray-500';
    }
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-lg overflow-hidden border ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-900/40' 
          : 'border-indigo-500/20 bg-slate-900/60 hover:bg-indigo-900/20'
      } ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'
      } transition-all`}
      style={{ 
        userSelect: 'none',
        touchAction: 'none',
      }}
      onClick={() => !disabled && onSelect(component.id)}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-3 space-y-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-indigo-900/60 flex items-center justify-center mr-2">
                  {component.icon}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{component.name}</div>
                  <Badge className={`text-xs ${getCategoryColor(component.category)} mt-1`}>
                    {component.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex text-xs space-x-2">
                <div className="text-green-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                    <path d="M10.339 2.237a.532.532 0 00-.678 0 11.947 11.947 0 01-7.078 2.75.5.5 0 00-.479.425A12.11 12.11 0 002 7c0 5.163 3.26 9.564 7.834 11.257a.48.48 0 00.332 0C14.74 16.564 18 12.163 18 7.001c0-.54-.035-1.07-.104-1.59a.5.5 0 00-.48-.425 11.947 11.947 0 01-7.077-2.75zM10 6a4 4 0 100 8 4 4 0 000-8zm0 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                  </svg>
                  Puissance: {component.power}
                </div>
                <div className="text-amber-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.232a2.5 2.5 0 013.536 0 .75.75 0 101.06-1.06A4 4 0 006.5 8v.165c0 .364.034.728.1 1.085h-.35a.75.75 0 000 1.5h.737a5.25 5.25 0 01-.367.67 4 4 0 01-.9 1.05.75.75 0 101.06 1.06 5.5 5.5 0 00.9-7.778V6.232z" clipRule="evenodd" />
                  </svg>
                  Coût: {component.cost}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="max-w-xs">
            <div className="space-y-2">
              <p>{component.description}</p>
              {component.compatibility.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-400">Compatible avec:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {component.compatibility.map(id => (
                      <span key={id} className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded text-xs">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

export default DraggableComponent;