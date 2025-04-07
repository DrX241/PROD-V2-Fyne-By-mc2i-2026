import React from 'react';
import { motion } from 'framer-motion';
import { Defense } from './types';
import { Badge } from '@/components/ui/badge';

interface DraggableDefenseProps {
  defense: Defense;
  onDragStart: () => void;
  onDragEnd: () => void;
  disabled?: boolean;
}

const DraggableDefense: React.FC<DraggableDefenseProps> = ({
  defense,
  onDragStart,
  onDragEnd,
  disabled = false
}) => {
  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin={true}
      dragElastic={0.2}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`bg-gray-800 rounded-xl p-4 relative overflow-hidden border-2 ${
        disabled ? 'border-gray-700 opacity-60 cursor-not-allowed' : 'border-gray-600 cursor-grab'
      }`}
      style={{ 
        boxShadow: `0 0 15px ${defense.color}30`,
        transition: 'all 0.2s ease'
      }}
    >
      <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: defense.color }} />
      
      <div className="flex items-start">
        <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${defense.color}30` }}>
          {defense.icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-white">{defense.name}</h3>
          <p className="text-gray-300 text-sm mb-2">{defense.description}</p>
          
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" style={{ color: defense.color, borderColor: `${defense.color}50` }}>
              {defense.type}
            </Badge>
            <Badge variant="secondary" className="bg-gray-700">
              Niveau {defense.level}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DraggableDefense;