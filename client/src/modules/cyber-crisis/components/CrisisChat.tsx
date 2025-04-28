import React, { useState, useRef, useEffect } from 'react';
import { useCyberCrisisContext } from '../CyberCrisisContext';
import MessageItem from './MessageItem';
import { AlertCircle } from 'lucide-react';

const CrisisChat: React.FC = () => {
  const { state, sendMessage } = useCyberCrisisContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPersonality, setTypingPersonality] = useState<string | null>(null);
  
  // Effectuer un défilement automatique lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);
  
  // Simuler l'effet de "X est en train d'écrire" après l'envoi d'un message utilisateur
  useEffect(() => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    if (lastMessage && lastMessage.type === 'user') {
      const randomPersonality = state.activePersonalities.length > 0
        ? state.activePersonalities[Math.floor(Math.random() * state.activePersonalities.length)]
        : null;
      
      if (randomPersonality) {
        setTypingPersonality(randomPersonality.name);
        setIsTyping(true);
        
        // Désactiver après un délai aléatoire (entre 1 et 3 secondes)
        const typingTimeout = setTimeout(() => {
          setIsTyping(false);
          setTypingPersonality(null);
        }, 1000 + Math.random() * 2000);
        
        return () => clearTimeout(typingTimeout);
      }
    }
  }, [state.messages, state.activePersonalities]);
  
  // Gestion de l'envoi de message
  const handleSend = async () => {
    if (inputValue.trim() === '' || !state.isSimulationActive) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };
  
  // Gestion de la touche Entrée pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Rendu de l'indicateur de frappe
  const renderTypingIndicator = () => {
    if (!isTyping || !typingPersonality) return null;
    
    return (
      <div className="flex items-center text-gray-500 italic text-sm mb-2">
        <div className="mr-2">{typingPersonality} est en train d'écrire</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    );
  };
  
  // Alerte si la simulation n'est pas active
  const renderSimulationInactiveAlert = () => {
    if (state.isSimulationActive) return null;
    
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>
            {state.simulationEndTime 
              ? "La simulation est terminée. Vous pouvez consulter les résultats et recommencer si vous le souhaitez."
              : "La simulation n'a pas encore commencé. Configurez les paramètres et démarrez la simulation pour commencer."}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Alerte si la simulation n'est pas active */}
      {renderSimulationInactiveAlert()}
      
      {/* Zone de messages avec défilement */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
        {state.messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {/* Indicateur de frappe */}
        {renderTypingIndicator()}
        
        {/* Élément invisible pour le défilement automatique */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de saisie */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg mt-4">
        <div className="flex items-center">
          <textarea
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none"
            placeholder={state.isSimulationActive 
              ? "Saisissez votre décision ou réponse..." 
              : "La simulation n'est pas active..."}
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!state.isSimulationActive}
          />
          <button
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!state.isSimulationActive || inputValue.trim() === ''}
          >
            Envoyer
          </button>
        </div>
        
        {/* Conseils pour l'utilisateur */}
        <div className="mt-2 text-xs text-gray-500">
          Appuyez sur <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Entrée</kbd> pour envoyer, <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Maj+Entrée</kbd> pour ajouter une nouvelle ligne
        </div>
      </div>
    </div>
  );
};

export default CrisisChat;