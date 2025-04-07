import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Defense } from './types';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: defense.id,
    disabled
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: `0 0 15px ${defense.color}30`,
    transition: transform ? undefined : 'all 0.2s ease',
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`bg-gray-800 rounded-xl p-4 relative overflow-hidden border-2 ${
        disabled ? 'border-gray-700 opacity-60 cursor-not-allowed' : 'border-gray-600 cursor-grab'
      } touch-none`}
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