import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart } from 'lucide-react';
import { Defense } from './types';
import { Badge } from '@/components/ui/badge';

interface DraggableDefenseProps {
  defense: Defense;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const DraggableDefense = forwardRef<HTMLDivElement, DraggableDefenseProps>(
  ({ defense, onDragStart, onDragEnd }, ref) => {
    return (
      <motion.div
        ref={ref}
        drag
        dragElastic={0.2}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.05, zIndex: 100 }}
        className="bg-gray-800 rounded-lg p-4 relative overflow-hidden border-2 border-gray-700 cursor-grab"
        style={{ boxShadow: `0 0 15px ${defense.color}30` }}
      >
        <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: defense.color }} />
        
        <div className="flex items-start">
          <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${defense.color}30` }}>
            {defense.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-white">{defense.name}</h3>
            <p className="text-gray-300 text-sm mb-2">{defense.description}</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
              <div className="flex items-center text-amber-400">
                <BarChart className="w-4 h-4 mr-1" />
                Coût: {defense.cost}€
              </div>
              <div className="flex items-center text-blue-400">
                <Users className="w-4 h-4 mr-1" />
                Personnel: {defense.manpower}
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Efficacité:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(defense.effectiveness).map(([attackType, value]) => (
                  <Badge key={attackType} variant="outline" className="bg-gray-900 text-xs">
                    {attackType}: {value}/10
                  </Badge>
                ))}
              </div>
            </div>
            
            {defense.usesLeft !== undefined && (
              <div className="mt-2 text-right">
                <Badge variant="secondary" className="text-xs">
                  Utilisations: {defense.usesLeft}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

DraggableDefense.displayName = 'DraggableDefense';

export default DraggableDefense;