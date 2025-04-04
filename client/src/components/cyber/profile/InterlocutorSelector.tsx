import React from 'react';
import { useInterlocutors } from '@/contexts/InterlocutorContext';
import Avatar from './AvatarGenerator';
import type { Interlocutor } from '@/types/interlocutors';

interface InterlocutorSelectorProps {
  onSelect?: (interlocutor: Interlocutor) => void;
  showDescription?: boolean;
  className?: string;
}

const InterlocutorSelector: React.FC<InterlocutorSelectorProps> = ({
  onSelect,
  showDescription = false,
  className = '',
}) => {
  const { interlocutors, currentInterlocutor, setCurrentInterlocutor } = useInterlocutors();

  const handleSelect = (interlocutor: Interlocutor) => {
    setCurrentInterlocutor(interlocutor);
    if (onSelect) {
      onSelect(interlocutor);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-blue-100">Interlocuteurs disponibles</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {interlocutors.map((interlocutor) => (
          <div 
            key={interlocutor.id}
            className={`
              p-3 rounded-lg transition-all duration-300 cursor-pointer 
              ${currentInterlocutor.id === interlocutor.id 
                ? 'bg-blue-900/50 border border-blue-500/50 shadow-lg' 
                : 'bg-gray-900/30 border border-gray-700/30 hover:bg-gray-800/40'
              }
            `}
            onClick={() => handleSelect(interlocutor)}
          >
            <div className="flex flex-col items-center text-center">
              <Avatar
                interlocutor={interlocutor}
                size="md"
                showStatus={interlocutor.id === currentInterlocutor.id}
                statusType="online"
                className="mb-2"
              />
              <div className="font-medium text-white text-sm">{interlocutor.name}</div>
              <div className="text-xs text-blue-200/70">{interlocutor.role}</div>
              
              {showDescription && currentInterlocutor.id === interlocutor.id && (
                <p className="mt-2 text-xs text-gray-300 line-clamp-3">
                  {interlocutor.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterlocutorSelector;