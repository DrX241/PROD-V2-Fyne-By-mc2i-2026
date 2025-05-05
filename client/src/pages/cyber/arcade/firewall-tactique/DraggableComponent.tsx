import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Network, Grid2X2, EyeIcon } from 'lucide-react';

// Types pour les composants de sécurité
export interface SecurityComponent {
  id: string;
  name: string;
  category: 'firewall' | 'authentication' | 'segmentation' | 'monitoring' | 'other';
  power: number;
  cost: number;
  description?: string;
}

interface DraggableComponentProps {
  component: SecurityComponent;
  isInventory?: boolean;
  position?: { x: number, y: number };
  onRemove?: () => void;
}

const ITEM_TYPE = 'SECURITY_COMPONENT';

const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  isInventory = true,
  position,
  onRemove
}) => {
  
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { ...component, fromInventory: isInventory },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop && !isInventory) {
        // Si on a lâché le composant hors de la zone et qu'il vient du plateau
        onRemove && onRemove();
      }
    },
  });

  // Sélection de l'icône selon la catégorie
  const getComponentIcon = () => {
    switch (component.category) {
      case 'firewall':
        return <Shield size={24} className="text-blue-500" />;
      case 'authentication':
        return <Lock size={24} className="text-purple-500" />;
      case 'segmentation':
        return <Grid2X2 size={24} className="text-orange-500" />;
      case 'monitoring':
        return <EyeIcon size={24} className="text-green-500" />;
      default:
        return <Database size={24} className="text-gray-500" />;
    }
  };

  // Sélection de la couleur de fond selon la catégorie
  const getBgColor = () => {
    switch (component.category) {
      case 'firewall':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'authentication':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'segmentation':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'monitoring':
        return 'bg-green-100 dark:bg-green-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getBorderColor = () => {
    switch (component.category) {
      case 'firewall':
        return 'border-blue-400 dark:border-blue-600';
      case 'authentication':
        return 'border-purple-400 dark:border-purple-600';
      case 'segmentation':
        return 'border-orange-400 dark:border-orange-600';
      case 'monitoring':
        return 'border-green-400 dark:border-green-600';
      default:
        return 'border-gray-400 dark:border-gray-600';
    }
  };

  // Style pour l'élément
  const componentClasses = `
    ${getBgColor()}
    ${getBorderColor()}
    border-2
    rounded-lg
    flex
    flex-col
    items-center
    justify-center
    p-2
    shadow-md
    transition-all
    duration-200
    ${isDragging ? 'opacity-50' : 'opacity-100'}
    ${isInventory ? 'w-32 h-32 m-2 cursor-grab' : 'w-full h-full cursor-move'}
  `;

  return (
    <motion.div
      ref={dragRef}
      className={componentClasses}
      whileHover={{ scale: isInventory ? 1.05 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={position ? { 
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      } : {}}
    >
      <div className="mb-2">
        {getComponentIcon()}
      </div>
      <div className="text-center">
        <p className="font-medium text-sm truncate max-w-full">{component.name}</p>
        {isInventory && (
          <>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Puissance: {component.power}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Coût: {component.cost}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DraggableComponent;