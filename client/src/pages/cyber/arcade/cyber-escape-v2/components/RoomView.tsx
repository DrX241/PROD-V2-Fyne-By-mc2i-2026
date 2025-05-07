import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, LogIn, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RoomData, RoomObject, RoomNPC, RoomExit } from '../types/game';
import { ObjectState, ExitStatus } from '../types/game-enums';

interface RoomViewProps {
  room: RoomData;
  onInteract: (type: string, targetId: string) => void;
}

/**
 * Composant qui affiche la vue de la salle avec ses objets, PNJs et sorties
 */
const RoomView: React.FC<RoomViewProps> = ({ room, onInteract }) => {
  const [hoverInfo, setHoverInfo] = useState<{id: string, name: string, type: string} | null>(null);

  // Gérer l'interaction avec un élément de la salle
  const handleInteraction = (type: string, id: string) => {
    onInteract(type, id);
  };

  // Déterminer la classe CSS basée sur l'état de l'objet
  const getObjectStateClass = (state: ObjectState) => {
    switch (state) {
      case ObjectState.INTERACTIVE:
        return 'border-green-500 shadow-md shadow-green-500/20 animate-pulse';
      case ObjectState.HIGHLIGHTED:
        return 'border-yellow-500 shadow-md shadow-yellow-500/20';
      case ObjectState.DISABLED:
        return 'border-gray-700 opacity-50';
      case ObjectState.NORMAL:
      default:
        return 'border-gray-600';
    }
  };

  // Déterminer la classe CSS basée sur l'état de la sortie
  const getExitStateClass = (status: ExitStatus) => {
    switch (status) {
      case ExitStatus.OPEN:
        return 'border-green-500';
      case ExitStatus.LOCKED:
        return 'border-red-500';
      case ExitStatus.HIDDEN:
        return 'border-gray-700 opacity-30';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <Card className="w-full overflow-hidden border-gray-800 bg-black/40">
      <CardContent className="p-0 relative">
        {/* Fond de la salle */}
        <div 
          className="w-full h-[500px] relative bg-center bg-cover flex"
          style={{ 
            backgroundImage: room.backgroundPath 
              ? `url(${room.backgroundPath})` 
              : 'linear-gradient(to bottom, #1a2e3d, #0a1823)'
          }}
        >
          {/* Overlay pour meilleure lisibilité */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Conteneur principal de la vue */}
          <div className="relative w-full h-full p-4">
            {/* Titre de la salle */}
            <div className="absolute top-4 left-4 z-30">
              <h2 className="text-xl font-bold text-white backdrop-blur-sm bg-black/40 p-2 rounded-md">
                {room.name}
              </h2>
            </div>

            {/* Objets dans la salle */}
            {room.objects.map((object: RoomObject) => (
              <motion.div
                key={object.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`absolute cursor-pointer border-2 rounded-md overflow-hidden ${getObjectStateClass(object.state)}`}
                style={{
                  left: `${object.position.x}%`,
                  top: `${object.position.y}%`,
                  width: object.position.width ? `${object.position.width}%` : '10%',
                  height: object.position.height ? `${object.position.height}%` : '15%',
                }}
                onClick={() => handleInteraction('object', object.id)}
                onMouseEnter={() => setHoverInfo({id: object.id, name: object.name, type: 'object'})}
                onMouseLeave={() => setHoverInfo(null)}
              >
                {object.imagePath ? (
                  <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${object.imagePath})` }}></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900/70">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                {object.interactable && (
                  <Badge className="absolute bottom-1 right-1 bg-green-900/70 text-green-300 text-xs">
                    {object.collectible ? 'Collecter' : 'Examiner'}
                  </Badge>
                )}
              </motion.div>
            ))}

            {/* PNJs dans la salle */}
            {room.npcs.map((npc: RoomNPC) => (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute cursor-pointer border-2 border-blue-600 rounded-md overflow-hidden"
                style={{
                  left: `${npc.position.x}%`,
                  top: `${npc.position.y}%`,
                  width: npc.position.width ? `${npc.position.width}%` : '15%',
                  height: npc.position.height ? `${npc.position.height}%` : '25%',
                }}
                onClick={() => handleInteraction('npc', npc.id)}
                onMouseEnter={() => setHoverInfo({id: npc.id, name: npc.name, type: 'npc'})}
                onMouseLeave={() => setHoverInfo(null)}
              >
                {npc.imagePath ? (
                  <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${npc.imagePath})` }}></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-900/40">
                    <MessageSquare className="w-8 h-8 text-blue-400" />
                  </div>
                )}

                <Badge className="absolute bottom-1 right-1 bg-blue-900/70 text-blue-300 text-xs">
                  Parler
                </Badge>
              </motion.div>
            ))}

            {/* Sorties de la salle */}
            {Object.entries(room.exits).map(([exitId, exit]) => (
              <motion.div
                key={exitId}
                initial={{ opacity: 0 }}
                animate={{ opacity: exit.status === ExitStatus.HIDDEN ? 0.3 : 1 }}
                className={`absolute cursor-pointer border-2 rounded-md overflow-hidden ${getExitStateClass(exit.status)}`}
                style={{
                  left: exit.position ? `${exit.position.x}%` : '85%',
                  top: exit.position ? `${exit.position.y}%` : '50%',
                  width: exit.position?.width ? `${exit.position.width}%` : '10%',
                  height: exit.position?.height ? `${exit.position.height}%` : '30%',
                }}
                onClick={() => handleInteraction('exit', exitId)}
                onMouseEnter={() => setHoverInfo({id: exitId, name: exit.name, type: 'exit'})}
                onMouseLeave={() => setHoverInfo(null)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/30">
                  <LogIn className="w-8 h-8 text-white mb-2" />
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                    {exit.status === ExitStatus.LOCKED ? 'Verrouillé' : 'Sortie'}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Infobulle au survol */}
            {hoverInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-1/2 bottom-4 transform -translate-x-1/2 z-40 pointer-events-none"
              >
                <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
                  <div className="font-medium">{hoverInfo.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {hoverInfo.type === 'object' ? 'Objet à examiner' : 
                     hoverInfo.type === 'npc' ? 'Personnage à qui parler' : 
                     'Sortie vers une autre salle'}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomView;