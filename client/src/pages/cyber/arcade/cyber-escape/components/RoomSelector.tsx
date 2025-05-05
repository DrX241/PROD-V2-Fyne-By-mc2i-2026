import React from 'react';
import { useGame } from '../context/GameContext';
import { VirtualRoom } from '../data/rooms';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LockIcon, ServerIcon, BuildingIcon, DatabaseIcon, UsersIcon, FlaskIcon, BanknoteIcon } from 'lucide-react';

// Map des icônes pour les salles
const roomIcons: { [key: string]: React.ReactNode } = {
  'building': <BuildingIcon className="h-6 w-6" />,
  'server': <ServerIcon className="h-6 w-6" />,
  'database': <DatabaseIcon className="h-6 w-6" />,
  'users': <UsersIcon className="h-6 w-6" />,
  'flask': <FlaskIcon className="h-6 w-6" />,
  'banknote': <BanknoteIcon className="h-6 w-6" />,
};

const RoomSelector: React.FC = () => {
  const { changeRoom, currentRoom, securityPoints, isRoomAccessible } = useGame();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      {virtualRooms.map((room) => (
        <Card 
          key={room.id}
          className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 cursor-pointer border ${
            currentRoom.id === room.id 
              ? 'border-white shadow-lg' 
              : 'border-gray-600 hover:border-gray-400'
          }`}
          style={{ backgroundColor: room.backgroundColor || '#1f2937' }}
          onClick={() => isRoomAccessible(room) && changeRoom(room.id)}
        >
          {room.isLocked && !isRoomAccessible(room) && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <LockIcon className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm text-gray-300">Niveau de sécurité requis: {room.requiredPoints}</span>
              <span className="text-xs text-gray-400 mt-1">
                ({securityPoints}/{room.requiredPoints} points)
              </span>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="p-2 rounded-full bg-white/10 mr-3">
                {roomIcons[room.icon] || <BuildingIcon className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <CardDescription className="text-xs text-gray-300">
                  {room.characters.length} {room.characters.length > 1 ? 'personnages' : 'personnage'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="text-sm pb-2">
            <p className="line-clamp-2 text-gray-300">{room.description}</p>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-0">
            <div className="flex space-x-1">
              {room.characters.map((character) => (
                <Badge 
                  key={character.id} 
                  variant="outline" 
                  className={`w-2 h-2 rounded-full p-0 ${
                    character.status === 'online' 
                      ? 'bg-green-500' 
                      : character.status === 'away' 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
            
            {currentRoom.id === room.id ? (
              <Badge className="bg-white/20">Actif</Badge>
            ) : (
              <Button 
                size="sm" 
                variant="link" 
                className="text-xs p-0 h-auto text-gray-300 hover:text-white"
                disabled={room.isLocked && !isRoomAccessible(room)}
              >
                Accéder
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default RoomSelector;