import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { Defense, PlacedDefense } from './types';
import clsx from 'clsx';

interface DefenseSlotProps {
  position: number;
  placedDefense?: PlacedDefense;
  defenses: Defense[];
  isActive: boolean;
  isCorrect?: boolean;
  onDrop: (position: number) => void;
}

const DefenseSlot: React.FC<DefenseSlotProps> = ({
  position,
  placedDefense,
  defenses,
  isActive,
  isCorrect,
  onDrop
}) => {
  // Configure droppable
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
    data: { position }
  });

  // Trouver la défense si un ID est placé
  const defense = placedDefense 
    ? defenses.find(d => d.id === placedDefense.defenseId) 
    : undefined;

  // Déterminer les classes CSS en fonction de l'état
  const slotClasses = clsx(
    "relative border-2 rounded-xl p-2 h-24 transition-all flex items-center justify-center",
    {
      "border-dashed border-gray-600 bg-gray-800/50": !defense,
      "border-solid": defense,
      "border-green-500 bg-green-900/30": defense && isCorrect === true,
      "border-red-500 bg-red-900/30": defense && isCorrect === false,
      "border-gray-500 bg-gray-800/80": defense && isCorrect === undefined,
      "ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900": isActive || isOver,
      "border-cyan-500": isOver && !defense
    }
  );

  return (
    <motion.div
      ref={setNodeRef}
      className={slotClasses}
      animate={{
        scale: isActive || isOver ? 1.05 : 1,
      }}
    >
      {defense ? (
        <div className="flex items-center w-full">
          <div 
            className="p-2 rounded-lg mr-3" 
            style={{ backgroundColor: `${defense.color}30` }}
          >
            {defense.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">{defense.name}</h3>
            <p className="text-xs text-gray-300">{defense.type}</p>
          </div>
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center ml-2 font-bold"
            style={{ 
              backgroundColor: `${defense.color}40`,
              color: defense.color
            }}
          >
            {position}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div 
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2 font-bold text-gray-400"
          >
            {position}
          </div>
          <p className="text-gray-500 text-xs">Déposez ici</p>
        </div>
      )}
    </motion.div>
  );
};

export default DefenseSlot;