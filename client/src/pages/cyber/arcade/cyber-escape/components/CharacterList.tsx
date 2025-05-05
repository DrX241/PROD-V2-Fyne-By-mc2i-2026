import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CharacterList: React.FC = () => {
  const { currentRoom, currentCharacter, selectCharacter } = useGame();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Personnages dans cette salle</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRoom.characters.map((character) => (
          <Card
            key={character.id}
            className={`cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
              currentCharacter?.id === character.id
                ? 'bg-blue-900/50 border-blue-500'
                : 'bg-blue-950/30 border-blue-800 hover:border-blue-700'
            }`}
            onClick={() => selectCharacter(character.id === currentCharacter?.id ? null : character.id)}
          >
            <CardHeader className="flex flex-row items-start space-x-4 pb-2">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-blue-700">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback>
                    {character.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-blue-900 ${
                    character.status === 'online' 
                      ? 'bg-green-500' 
                      : character.status === 'away' 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-500'
                  }`}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{character.name}</CardTitle>
                <CardDescription className="text-sm text-blue-300">
                  {character.role}
                </CardDescription>
                <div className="flex items-center mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 h-5 bg-blue-800/50 text-blue-200"
                  >
                    {character.department}
                  </Badge>
                  <div className="ml-2 flex">
                    {Array.from({ length: character.securityLevel }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-0.5"
                      />
                    ))}
                    {Array.from({ length: 5 - character.securityLevel }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-800 mr-0.5"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant={currentCharacter?.id === character.id ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {currentCharacter?.id === character.id ? "Fermer" : "Discuter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CharacterList;