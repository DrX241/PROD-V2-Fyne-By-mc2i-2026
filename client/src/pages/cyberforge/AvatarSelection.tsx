import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  Badge,
  Button
} from '@/components/ui';

interface Avatar {
  id: string;
  name: string;
  imagePath: string;
  type: 'hacker' | 'analyst' | 'security_manager' | 'network_specialist';
  abilities: string[];
  description: string;
  strengthsAndWeaknesses: string[];
  primarySkills: string[];
}

interface AvatarSelectionProps {
  avatars: Avatar[];
  selectedAvatar: Avatar | null;
  onSelectAvatar: (avatar: Avatar) => void;
  onContinue: () => void;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ 
  avatars, 
  selectedAvatar, 
  onSelectAvatar,
  onContinue
}) => {
  return (
    <motion.div
      key="avatar-selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
        <CardHeader>
          <CardTitle className="text-xl text-blue-100">Choisissez votre spécialisation</CardTitle>
          <CardDescription className="text-blue-300">
            Sélectionnez un profil pour personnaliser votre parcours d'apprentissage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <div 
                key={avatar.id}
                onClick={() => onSelectAvatar(avatar)}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer
                  ${selectedAvatar?.id === avatar.id 
                    ? 'bg-blue-900/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]' 
                    : 'bg-black/40 border-blue-800/30 hover:bg-blue-900/20 hover:border-blue-700/40'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-950 flex items-center justify-center text-3xl mb-3">
                    {avatar.id === 'shadow' ? '👤' : 
                     avatar.id === 'sentinel' ? '🔍' :
                     avatar.id === 'guardian' ? '🛡️' : 
                     '📡'}
                  </div>
                  <h3 className="font-medium text-blue-100">{avatar.name}</h3>
                  <p className="text-xs text-blue-300 text-center mt-1">
                    {avatar.type === 'hacker' ? 'Hacker Éthique' : 
                     avatar.type === 'analyst' ? 'Analyste Sécurité' :
                     avatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                     'Spécialiste Réseau'}
                  </p>
                  
                  {selectedAvatar?.id === avatar.id && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg overflow-hidden">
                      <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-pulse-slow w-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedAvatar && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={onContinue}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all"
              >
                Continuer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AvatarSelection;