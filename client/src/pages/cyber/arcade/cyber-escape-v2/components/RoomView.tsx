import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Users, AlertTriangle, Database, Lock, Fingerprint, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type pour un PNJ
interface NPC {
  id: string;
  name: string;
  avatar: string;
  role: string;
  position: { x: number; y: number };
}

// Type pour un objet interactif
interface InteractiveObject {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  description: string;
}

// Type pour une sortie (porte, passage, etc)
interface Exit {
  direction: 'north' | 'south' | 'east' | 'west';
  status: 'open' | 'locked' | 'hidden';
  roomId?: string;
}

// Type pour les propriétés du composant
interface RoomViewProps {
  roomId: string;
  roomName: string;
  description: string;
  npcs?: NPC[];
  objects?: InteractiveObject[];
  exits: Exit[];
  onExitClick: (direction: string) => void;
  onNpcClick: (npcId: string) => void;
  onObjectClick: (objectId: string) => void;
}

// Mapping des icônes pour les objets interactifs
const iconMapping: Record<string, React.ReactNode> = {
  terminal: <Terminal className="h-6 w-6 text-blue-400" />,
  server: <Server className="h-6 w-6 text-blue-400" />,
  fingerprint: <Fingerprint className="h-6 w-6 text-purple-400" />,
  lock: <Lock className="h-6 w-6 text-yellow-400" />,
  database: <Database className="h-6 w-6 text-green-400" />,
  alert: <AlertTriangle className="h-6 w-6 text-red-400" />,
  users: <Users className="h-6 w-6 text-indigo-400" />,
  shield: <Shield className="h-6 w-6 text-green-400" />,
};

const RoomView: React.FC<RoomViewProps> = ({
  roomId,
  roomName,
  description,
  npcs = [],
  objects = [],
  exits,
  onExitClick,
  onNpcClick,
  onObjectClick,
}) => {
  // Boutons de direction avec statut visuel
  const renderExitButtons = () => {
    const directions = [
      { key: 'north', label: 'Nord', position: 'top', icon: '↑' },
      { key: 'east', label: 'Est', position: 'right', icon: '→' },
      { key: 'south', label: 'Sud', position: 'bottom', icon: '↓' },
      { key: 'west', label: 'Ouest', position: 'left', icon: '←' },
    ];

    return (
      <div className="absolute inset-0 pointer-events-none">
        {directions.map(({ key, label, position, icon }) => {
          const exit = exits.find((e) => e.direction === key);
          
          if (!exit) return null;
          
          const isLocked = exit.status === 'locked';
          const isHidden = exit.status === 'hidden';
          
          if (isHidden) return null;
          
          let positionClass = '';
          switch (position) {
            case 'top':
              positionClass = 'top-0 left-1/2 transform -translate-x-1/2';
              break;
            case 'right':
              positionClass = 'right-0 top-1/2 transform -translate-y-1/2';
              break;
            case 'bottom':
              positionClass = 'bottom-0 left-1/2 transform -translate-x-1/2';
              break;
            case 'left':
              positionClass = 'left-0 top-1/2 transform -translate-y-1/2';
              break;
          }
          
          return (
            <div key={key} className={`absolute ${positionClass} pointer-events-auto`}>
              <Button
                variant={isLocked ? "outline" : "default"}
                size="sm"
                className={`font-mono ${isLocked ? 'bg-gray-800 border-yellow-500 text-yellow-500' : 'bg-blue-600 text-white'}`}
                onClick={() => onExitClick(key)}
                disabled={isLocked}
              >
                {icon} {label} {isLocked && <Lock className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="relative border-green-500 bg-black/80 text-white overflow-hidden">
      <CardHeader className="border-b border-green-800">
        <CardTitle className="text-xl flex items-center text-green-400">
          <Shield className="mr-2 h-5 w-5" />
          {roomName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative p-6 min-h-[300px]">
        {/* Description de la salle */}
        <p className="text-gray-300 mb-6">{description}</p>
        
        {/* Représentation visuelle de la salle */}
        <div className="relative border border-green-800 rounded-md bg-black/40 h-64 mt-4">
          {/* Grille cyberpunk */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          
          {/* Boutons de direction pour les sorties */}
          {renderExitButtons()}
          
          {/* PNJs présents dans la salle */}
          <TooltipProvider>
            {npcs.map((npc) => (
              <Tooltip key={npc.id}>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="absolute cursor-pointer"
                    style={{
                      left: `${npc.position.x}%`,
                      top: `${npc.position.y}%`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onNpcClick(npc.id)}
                  >
                    <div className="bg-blue-900/70 p-2 rounded-full border border-blue-400">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-semibold">{npc.name}</p>
                  <p className="text-xs opacity-80">{npc.role}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          
          {/* Objets interactifs */}
          <TooltipProvider>
            {objects.map((obj) => (
              <Tooltip key={obj.id}>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="absolute cursor-pointer"
                    style={{
                      left: `${obj.position.x}%`,
                      top: `${obj.position.y}%`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onObjectClick(obj.id)}
                  >
                    <div className="bg-gray-900/70 p-2 rounded-full border border-green-400">
                      {iconMapping[obj.icon] || <Database className="h-6 w-6 text-green-400" />}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-semibold">{obj.name}</p>
                  <p className="text-xs opacity-80">{obj.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomView;