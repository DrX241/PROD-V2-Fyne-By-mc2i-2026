import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Computer, 
  DoorOpen, 
  FileText, 
  Info, 
  Laptop, 
  Lock, 
  UserRound, 
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoomObject {
  id: string;
  name: string;
  description: string;
  state: 'default' | 'active' | 'disabled';
  usable?: boolean;
  interactive?: boolean;
  type?: string;
}

interface RoomNPC {
  id: string;
  name: string;
  role: string;
  description: string;
}

interface RoomExit {
  direction: string;
  roomId: string;
  name: string;
  status: 'open' | 'locked' | 'hidden';
}

interface Room {
  id: string;
  name: string;
  description: string;
  backgroundImage?: string;
  objects: RoomObject[];
  npcs: RoomNPC[];
  exits: Record<string, RoomExit>;
}

interface RoomViewProps {
  room: Room;
  onInteract: (type: string, targetId: string) => void;
  message?: string;
}

/**
 * Composant pour afficher une salle avec ses objets et personnages
 */
const RoomView: React.FC<RoomViewProps> = ({ room, onInteract, message }) => {
  // Animation variants pour les éléments de la salle
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Déterminer l'icône appropriée pour un objet
  const getObjectIcon = (object: RoomObject) => {
    const { type = "" } = object;
    
    if (type.includes('terminal') || type.includes('computer')) return Computer;
    if (type.includes('document') || type.includes('note')) return FileText;
    if (type.includes('laptop')) return Laptop;
    if (type.includes('device') || type.includes('electronic')) return Zap;
    return Info;
  };
  
  // Obtenir les classes CSS pour un objet en fonction de son état
  const getObjectClasses = (object: RoomObject) => {
    const base = "border rounded-lg p-3 cursor-pointer";
    if (object.state === 'active') {
      return `${base} border-green-500 bg-green-900/20`;
    } else if (object.state === 'disabled') {
      return `${base} border-gray-700 bg-gray-900/20 opacity-50 cursor-not-allowed`;
    }
    return `${base} border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 transition-colors`;
  };
  
  // Rendu du message de feedback dans la salle si présent
  const renderMessage = () => {
    if (!message) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-2 left-0 right-0 flex justify-center"
      >
        <Alert className="w-auto mx-auto bg-black/70 backdrop-blur-sm border-green-600">
          <AlertCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm text-green-300">
            {message}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  };
  
  // Style pour l'image de fond de la salle
  const roomStyle = {
    backgroundImage: room.backgroundImage 
      ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${room.backgroundImage})` 
      : 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95))',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  
  return (
    <Card className="border-green-500 relative overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="relative h-[400px] md:h-[500px] flex flex-col p-4"
          style={roomStyle}
        >
          {/* Message de feedback */}
          {renderMessage()}
          
          {/* Entête de la salle */}
          <div className="mb-4 flex justify-between items-start">
            <div>
              <motion.h2 
                className="text-xl font-bold text-green-300 mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {room.name}
              </motion.h2>
              <motion.p 
                className="text-gray-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {room.description}
              </motion.p>
            </div>
            
            <Badge 
              variant="outline" 
              className="bg-black/50 border-green-700 text-green-400"
            >
              Salle {room.id}
            </Badge>
          </div>
          
          {/* Contenu principal de la salle: objets, PNJ, sorties */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Objets dans la salle */}
            <div className="space-y-3 mb-4">
              <h3 className="text-green-400 text-sm font-medium">Objets et éléments</h3>
              
              {room.objects.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Aucun objet remarquable dans cette salle</p>
              ) : (
                <motion.div 
                  className="grid grid-cols-2 gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {room.objects.map(object => {
                    const ObjectIcon = getObjectIcon(object);
                    
                    return (
                      <motion.div
                        key={object.id}
                        variants={itemVariants}
                        onClick={() => object.state !== 'disabled' && onInteract('object', object.id)}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={getObjectClasses(object)}>
                                <div className="flex items-center gap-2">
                                  <ObjectIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium">
                                    {object.name}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-gray-900 border-gray-700">
                              <p className="font-medium mb-1">{object.name}</p>
                              <p className="text-xs text-gray-300">{object.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
            
            {/* PNJ dans la salle */}
            <div className="space-y-3 mb-4">
              <h3 className="text-blue-400 text-sm font-medium">Personnages</h3>
              
              {room.npcs.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Personne d'autre dans cette salle</p>
              ) : (
                <motion.div 
                  className="grid grid-cols-2 gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {room.npcs.map(npc => (
                    <motion.div
                      key={npc.id}
                      variants={itemVariants}
                      onClick={() => onInteract('npc', npc.id)}
                      className="border border-blue-700 rounded-lg p-3 cursor-pointer bg-blue-900/20 hover:bg-blue-900/30 transition-colors"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-blue-400" />
                              <div>
                                <div className="text-sm font-medium text-blue-300">
                                  {npc.name}
                                </div>
                                <div className="text-xs text-blue-200 opacity-80">
                                  {npc.role}
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-gray-900 border-blue-700">
                            <p className="font-medium text-blue-300 mb-1">{npc.name}</p>
                            <p className="text-xs italic text-blue-200 mb-2">{npc.role}</p>
                            <p className="text-xs text-gray-300">{npc.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            
            {/* Sorties de la salle */}
            <div className="mt-auto">
              <h3 className="text-yellow-400 text-sm font-medium mb-2">Sorties</h3>
              
              {Object.keys(room.exits).length === 0 ? (
                <p className="text-gray-500 text-sm italic">Aucune sortie visible</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(room.exits).map(([direction, exit]) => {
                    // Déterminer les icônes et classes en fonction du statut de la sortie
                    let ExitIcon = DoorOpen;
                    let exitClass = "border border-yellow-700 rounded-lg p-2 cursor-pointer flex items-center gap-2 ";
                    let directionIcon;
                    
                    if (exit.status === 'locked') {
                      ExitIcon = Lock;
                      exitClass += "bg-yellow-900/20 opacity-70";
                    } else if (exit.status === 'hidden') {
                      exitClass += "bg-gray-900/30 opacity-50";
                    } else {
                      exitClass += "bg-yellow-900/20 hover:bg-yellow-900/40 transition-colors";
                    }
                    
                    // Icônes de direction
                    if (direction === 'north') directionIcon = <ArrowLeft className="h-3 w-3 rotate-90" />;
                    else if (direction === 'south') directionIcon = <ArrowLeft className="h-3 w-3 -rotate-90" />;
                    else if (direction === 'east') directionIcon = <ArrowRight className="h-3 w-3" />;
                    else if (direction === 'west') directionIcon = <ArrowLeft className="h-3 w-3" />;
                    
                    return (
                      <div
                        key={direction}
                        className={exitClass}
                        onClick={() => exit.status !== 'locked' && onInteract('exit', direction)}
                      >
                        <ExitIcon className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-300 text-sm capitalize">
                              {direction}
                            </span>
                            {directionIcon && (
                              <span className="text-yellow-500">
                                {directionIcon}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-300">
                            {exit.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomView;