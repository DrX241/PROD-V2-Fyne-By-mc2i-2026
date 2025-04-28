import React from 'react';
import { CrisisMessage } from '../types';
import { personalityProfiles } from '../PersonalityProfiles';

// Styles spécifiques pour chaque type de message
const messageStyles = {
  user: 'bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-gray-200',
  personality: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-l-4 border-indigo-500',
  system: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 italic',
  event: 'bg-yellow-100 dark:bg-yellow-900 text-gray-800 dark:text-gray-200 border border-yellow-400',
  alert: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-400',
  email: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 font-mono',
  sms: 'bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 font-mono'
};

interface MessageItemProps {
  message: CrisisMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Obtenir le style correspondant au type de message
  const style = messageStyles[message.type] || messageStyles.system;
  
  // Formater le timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Trouver l'avatar et les informations de l'expéditeur pour les messages de personnalité
  const getSenderInfo = () => {
    if (message.type === 'personality' && message.sender && message.sender !== 'user') {
      const personality = personalityProfiles[message.sender];
      if (personality) {
        return {
          name: personality.name,
          role: personality.role,
          avatar: personality.avatar || '/assets/avatars/default.jpg'
        };
      }
    }
    
    if (message.type === 'user') {
      return {
        name: 'Vous',
        role: '',
        avatar: '/assets/avatars/user.jpg'
      };
    }
    
    return {
      name: message.sender || 'Système',
      role: '',
      avatar: '/assets/avatars/system.jpg'
    };
  };
  
  const senderInfo = getSenderInfo();
  
  // Afficher les impacts si disponibles (budget, score)
  const renderImpacts = () => {
    if (!message.metadata) return null;
    
    const impacts = [];
    
    if (message.metadata.budgetImpact) {
      const formattedBudget = message.metadata.budgetImpact.toLocaleString('fr-FR');
      impacts.push(
        <span 
          key="budget" 
          className={`inline-block px-2 py-1 rounded text-sm mr-2 ${
            message.metadata.budgetImpact > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          Budget: {message.metadata.budgetImpact > 0 ? '+' : ''}{formattedBudget}€
        </span>
      );
    }
    
    if (message.metadata.scoreImpact) {
      impacts.push(
        <span 
          key="score" 
          className={`inline-block px-2 py-1 rounded text-sm ${
            message.metadata.scoreImpact > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          Score: {message.metadata.scoreImpact > 0 ? '+' : ''}{message.metadata.scoreImpact}
        </span>
      );
    }
    
    if (impacts.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {impacts}
      </div>
    );
  };
  
  // Formatage spécial pour les emails
  const renderEmailContent = () => {
    if (message.type !== 'email') return message.content;
    
    return (
      <div className="email-format">
        <div className="email-header border-b p-2 mb-2">
          <div><strong>De:</strong> {message.metadata?.from || senderInfo.name}</div>
          <div><strong>À:</strong> {message.metadata?.to || 'Équipe de crise'}</div>
          <div><strong>Objet:</strong> {message.metadata?.subject || 'Alerte de sécurité'}</div>
        </div>
        <div className="email-body p-2 whitespace-pre-line">
          {message.content}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`rounded-lg p-3 mb-4 max-w-[95%] ${style} ${
      message.type === 'user' ? 'ml-auto' : 'mr-auto'
    }`}>
      {/* En-tête du message avec avatar et informations de l'expéditeur */}
      {(message.type === 'personality' || message.type === 'user') && (
        <div className="flex items-center mb-2">
          <img 
            src={senderInfo.avatar} 
            alt={senderInfo.name} 
            className="w-8 h-8 rounded-full mr-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/avatars/default.jpg';
            }}
          />
          <div>
            <div className="font-bold">{senderInfo.name}</div>
            {senderInfo.role && <div className="text-xs text-gray-600 dark:text-gray-400">{senderInfo.role}</div>}
          </div>
          <div className="ml-auto text-xs text-gray-500">{formattedTime}</div>
        </div>
      )}
      
      {/* En-tête pour les autres types de messages */}
      {message.type !== 'personality' && message.type !== 'user' && (
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold uppercase text-xs">
            {message.type === 'alert' ? '🚨 ALERTE' : 
             message.type === 'event' ? '📣 ÉVÉNEMENT' : 
             message.type === 'email' ? '📧 EMAIL' : 
             message.type === 'sms' ? '📱 SMS' : 'SYSTÈME'}
          </div>
          <div className="text-xs text-gray-500">{formattedTime}</div>
        </div>
      )}
      
      {/* Contenu du message */}
      <div className="whitespace-pre-line">
        {message.type === 'email' ? renderEmailContent() : message.content}
      </div>
      
      {/* Impacts (budget, score) */}
      {renderImpacts()}
    </div>
  );
};

export default MessageItem;