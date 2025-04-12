import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  character?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ character }) => {
  return (
    <div className="flex mb-4">
      {character && (
        <div className="mr-3 flex-shrink-0">
          {character.avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={character.avatar} 
                alt={character.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amoa-blue flex items-center justify-center text-white font-medium">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-3 rounded-lg shadow-sm border inline-flex items-center">
        <motion.div 
          className="flex space-x-1.5"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="w-2 h-2 rounded-full bg-amoa-blue/60" />
          <div className="w-2 h-2 rounded-full bg-amoa-blue/70" />
          <div className="w-2 h-2 rounded-full bg-amoa-blue/80" />
        </motion.div>
        <span className="ml-2 text-sm text-gray-600">
          En train d'écrire...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;