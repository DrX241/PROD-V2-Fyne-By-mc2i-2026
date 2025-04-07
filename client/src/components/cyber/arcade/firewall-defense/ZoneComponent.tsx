import React from 'react';
import { motion } from 'framer-motion';
import { Zone, Defense } from './types';
import { Badge } from '@/components/ui/badge';

interface ZoneComponentProps {
  zone: Zone;
  defenses: Defense[];
  onDrop: (zoneId: string) => void;
  isDraggingOver: boolean;
}

const ZoneComponent: React.FC<ZoneComponentProps> = ({ 
  zone, 
  defenses, 
  onDrop,
  isDraggingOver
}) => {
  // Trouver les défenses installées dans cette zone
  const installedDefenses = defenses.filter(d => 
    zone.defenses.includes(d.id)
  );

  return (
    <motion.div
      className={`absolute rounded-lg p-4 flex flex-col border-2 transition-colors ${
        isDraggingOver 
          ? 'border-yellow-400 bg-gray-800/90' 
          : 'border-gray-700 bg-gray-800/80'
      }`}
      style={{ 
        top: zone.position.y, 
        left: zone.position.x,
        width: zone.width,
        height: zone.height,
        boxShadow: `0 0 20px ${isDraggingOver ? zone.color : zone.color + '40'}`
      }}
      animate={{ 
        borderColor: isDraggingOver ? '#facc15' : 'rgba(55, 65, 81, 0.7)',
        scale: isDraggingOver ? 1.02 : 1 
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={() => onDrop(zone.id)}
    >
      <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: zone.color }} />
      
      <div className="flex items-center mb-2">
        <div className="p-1.5 rounded mr-2" style={{ backgroundColor: `${zone.color}30` }}>
          {zone.icon}
        </div>
        <div>
          <h3 className="font-bold text-white">{zone.name}</h3>
          <p className="text-xs text-gray-400">Importance: {zone.importance}/10</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-300 mb-3">{zone.description}</p>
      
      {installedDefenses.length > 0 ? (
        <div className="mt-auto">
          <h4 className="text-sm font-semibold text-gray-300 mb-1">Défenses installées:</h4>
          <div className="flex flex-wrap gap-1">
            {installedDefenses.map(defense => (
              <Badge 
                key={defense.id} 
                className="bg-opacity-20"
                style={{ backgroundColor: `${defense.color}30`, color: defense.color }}
              >
                {defense.name} {defense.usesLeft !== undefined && `(${defense.usesLeft})`}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-auto text-center">
          <p className="text-xs text-gray-500">Glissez-déposez une défense ici</p>
        </div>
      )}
    </motion.div>
  );
};

export default ZoneComponent;