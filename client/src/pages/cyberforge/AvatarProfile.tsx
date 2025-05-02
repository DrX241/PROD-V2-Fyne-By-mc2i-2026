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

interface AvatarProfileProps {
  avatar: Avatar;
  onContinue: () => void;
}

const AvatarProfile: React.FC<AvatarProfileProps> = ({ avatar, onContinue }) => {
  return (
    <motion.div
      key="avatar-profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl"
    >
      <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
        <CardHeader>
          <CardTitle className="text-xl text-blue-100">
            Spécialisation: {avatar.name}
          </CardTitle>
          <CardDescription className="text-blue-300">
            {avatar.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-blue-200 mb-2">Compétences principales</h3>
            <div className="flex flex-wrap gap-2">
              {avatar.primarySkills.map((skill, i) => (
                <Badge key={i} className="bg-blue-900/60 text-blue-200 border border-blue-700/60">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-200 mb-2">Capacités spéciales</h3>
            <ul className="text-sm text-blue-300 space-y-1">
              {avatar.abilities.map((ability, i) => (
                <li key={i} className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  {ability}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-200 mb-2">Forces et faiblesses</h3>
            <ul className="text-sm text-blue-300 space-y-1">
              {avatar.strengthsAndWeaknesses.map((item, i) => (
                <li key={i} className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all"
          >
            Commencer l'entraînement
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AvatarProfile;