import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerIcon, Laptop, Globe, Shield, Loader2 } from 'lucide-react';
import DraggableComponent, { SecurityComponent } from './DraggableComponent';

// Types pour les positions
export interface NetworkNode {
  type: 'server' | 'client' | 'internet';
  position: {
    x: number;
    y: number;
  };
}

export interface PlacedComponent {
  id: string;
  componentId: string;
  position: {
    x: number;
    y: number;
  };
}

interface DefenseBoardProps {
  gridSize: number;
  networkNodes: NetworkNode[];
  availableComponents: SecurityComponent[];
  budget: number;
  onAnalyzeDefense: (placedComponents: PlacedComponent[]) => void;
  onRequestTip: (placedComponents: PlacedComponent[]) => void;
  isAnalyzing: boolean;
}

const ITEM_TYPE = 'SECURITY_COMPONENT';
const CELL_SIZE = 60; // Taille de chaque cellule en pixels

const DefenseBoard: React.FC<DefenseBoardProps> = ({
  gridSize,
  networkNodes,
  availableComponents,
  budget,
  onAnalyzeDefense,
  onRequestTip,
  isAnalyzing
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [remainingBudget, setRemainingBudget] = useState<number>(budget);
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  // Recalculer les dimensions du plateau quand la taille de la grille change
  useEffect(() => {
    if (boardRef.current) {
      const boardWidth = gridSize * CELL_SIZE;
      const boardHeight = gridSize * CELL_SIZE;
      setBoardDimensions({ width: boardWidth, height: boardHeight });
    }
  }, [gridSize, boardRef]);

  // Recalculer le budget restant quand les composants placés changent
  useEffect(() => {
    const usedBudget = placedComponents.reduce((total, placed) => {
      const component = availableComponents.find(c => c.id === placed.componentId);
      return total + (component?.cost || 0);
    }, 0);
    
    setRemainingBudget(budget - usedBudget);
  }, [placedComponents, availableComponents, budget]);

  // Logique pour le drop des composants
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: SecurityComponent & { fromInventory: boolean }, monitor) => {
      const boardRect = boardRef.current?.getBoundingClientRect();
      if (!boardRect) return;

      const componentCost = item.cost;
      // Vérifier si le budget est suffisant pour les nouveaux composants
      if (!item.fromInventory || remainingBudget >= componentCost) {
        const dropPosition = monitor.getClientOffset();
        if (dropPosition) {
          // Calculer la position relative au board
          const x = dropPosition.x - boardRect.left;
          const y = dropPosition.y - boardRect.top;
          
          // Si c'est un nouveau composant, l'ajouter
          if (item.fromInventory) {
            const newComponent: PlacedComponent = {
              id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              componentId: item.id,
              position: { x, y },
            };
            setPlacedComponents([...placedComponents, newComponent]);
          } 
          // Sinon, mettre à jour la position d'un composant existant
          else {
            const componentId = placedComponents.find(
              comp => comp.componentId === item.id
            )?.id;
            
            if (componentId) {
              setPlacedComponents(
                placedComponents.map(comp => 
                  comp.id === componentId 
                    ? { ...comp, position: { x, y } } 
                    : comp
                )
              );
            }
          }
        }
      } else {
        // Afficher un avertissement de budget insuffisant
        setShowBudgetWarning(true);
        setTimeout(() => setShowBudgetWarning(false), 3000);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Supprimer un composant du plateau
  const handleRemoveComponent = (componentId: string) => {
    setPlacedComponents(placedComponents.filter(comp => comp.id !== componentId));
  };

  // Afficher le type de nœud réseau
  const renderNetworkNode = (node: NetworkNode) => {
    let icon;
    let bgColor;
    
    switch (node.type) {
      case 'server':
        icon = <ServerIcon size={24} className="text-white" />;
        bgColor = 'bg-red-500';
        break;
      case 'client':
        icon = <Laptop size={24} className="text-white" />;
        bgColor = 'bg-yellow-500';
        break;
      case 'internet':
        icon = <Globe size={24} className="text-white" />;
        bgColor = 'bg-blue-500';
        break;
    }
    
    return (
      <div 
        key={`${node.type}-${node.position.x}-${node.position.y}`}
        className={`absolute ${bgColor} rounded-full p-2 shadow-md z-10`}
        style={{
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {icon}
      </div>
    );
  };

  // Génération des lignes de la grille
  const renderGridLines = () => {
    const lines = [];
    
    // Lignes horizontales
    for (let i = 0; i <= gridSize; i++) {
      lines.push(
        <div 
          key={`h-${i}`}
          className="absolute bg-gray-300 dark:bg-gray-700"
          style={{
            left: 0,
            top: `${i * CELL_SIZE}px`,
            width: '100%',
            height: '1px'
          }}
        />
      );
    }
    
    // Lignes verticales
    for (let i = 0; i <= gridSize; i++) {
      lines.push(
        <div 
          key={`v-${i}`}
          className="absolute bg-gray-300 dark:bg-gray-700"
          style={{
            left: `${i * CELL_SIZE}px`,
            top: 0,
            width: '1px',
            height: '100%'
          }}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-4">
        <div className="text-lg font-semibold">
          Budget: <span className={remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}>
            {remainingBudget}
          </span> / {budget}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onRequestTip(placedComponents)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Demander un conseil
          </button>
          
          <button
            onClick={() => onAnalyzeDefense(placedComponents)}
            disabled={isAnalyzing}
            className={`px-4 py-2 ${
              isAnalyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-md transition flex items-center`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : 'Analyser ma défense'}
          </button>
        </div>
      </div>

      {/* Plateau de jeu */}
      <div 
        ref={dropRef}
        className={`relative border-2 border-gray-400 dark:border-gray-600 rounded-lg ${
          isOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
        } overflow-hidden`}
        style={{ 
          width: `${boardDimensions.width}px`, 
          height: `${boardDimensions.height}px` 
        }}
      >
        {/* Grille */}
        {renderGridLines()}
        
        {/* Nœuds réseau (serveurs, clients, internet) */}
        {networkNodes.map(renderNetworkNode)}
        
        {/* Composants placés */}
        {placedComponents.map((placed) => {
          const component = availableComponents.find(c => c.id === placed.componentId);
          if (!component) return null;
          
          return (
            <DraggableComponent
              key={placed.id}
              component={component}
              isInventory={false}
              position={placed.position}
              onRemove={() => handleRemoveComponent(placed.id)}
            />
          );
        })}
      </div>

      {/* Avertissement de budget */}
      <AnimatePresence>
        {showBudgetWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-2 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded"
          >
            Budget insuffisant pour placer ce composant !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DefenseBoard;