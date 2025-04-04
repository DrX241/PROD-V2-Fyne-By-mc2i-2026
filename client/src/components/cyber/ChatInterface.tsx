import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, ChevronDown, Loader2, Clock, BotIcon } from 'lucide-react';
import { MessageCircle, MessageCircleOff } from 'lucide-react';
import axios from 'axios';
import { useSkills } from '@/contexts/SkillsContext';
import { useInterlocutors } from '@/contexts/InterlocutorContext';

type MessageType = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentInterlocutor } = useInterlocutors();
  const { updateSkill } = useSkills();
  
  // Message de bienvenue par défaut
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: "Bonjour, je suis I AM CYBER, votre assistant virtuel dans le monde passionnant de la cybersécurité ! Je suis là pour vous aider à développer vos compétences et à naviguer dans les scénarios de crise. Comment puis-je vous assister aujourd'hui ?",
          role: 'assistant',
          timestamp: Date.now()
        }
      ]);
    }
  }, []);
  
  // Vérifier le statut de connexion
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('/api/cyber/status');
        setConnectionStatus(response.data.status);
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Soumettre un message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simuler un délai de frappe
      setIsTyping(true);
      
      // Appel API
      const response = await axios.post('/api/cyber/simple-chat', {
        message: input,
        interlocutor: currentInterlocutor?.name || 'I AM CYBER'
      });
      
      // Ajouter un délai pour simuler la frappe
      setTimeout(() => {
        setIsTyping(false);
        
        const assistantMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          role: 'assistant',
          timestamp: Date.now()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        setIsLoading(false);
        
        // Simuler l'amélioration des compétences
        if (Math.random() > 0.7) {
          const skillIds = ['skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'skill6'];
          const randomSkill = skillIds[Math.floor(Math.random() * skillIds.length)];
          const improvement = Math.floor(Math.random() * 5) + 1;
          
          updateSkill(randomSkill, improvement);
        }
      }, 1000);
      
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);
      
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, une erreur s'est produite lors de la communication avec l'assistant. Veuillez réessayer.",
        role: 'system',
        timestamp: Date.now()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900/50 border-r border-blue-900/30">
      {/* Statut de connexion */}
      <div className={`px-4 py-2 flex justify-between items-center ${connectionStatus === 'connected' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-blue-200">
            {connectionStatus === 'connected' ? 'Connecté à Azure OpenAI' : 'Déconnecté'}
          </span>
        </div>
        <div className="text-sm text-blue-300">
          {currentInterlocutor ? `Interlocuteur: ${currentInterlocutor.name}` : 'I AM CYBER'}
        </div>
      </div>
      
      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.role === 'system'
                    ? 'bg-red-900/50 text-red-100 border border-red-800/50'
                    : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.content}
              <div className="text-xs mt-1 opacity-70 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulaire de saisie */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-blue-900/30 bg-gray-900/70">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Saisissez votre message..."
              className="w-full px-4 py-2 bg-gray-800 border border-blue-900/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              disabled={isLoading}
            />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-blue-400">
          <div className="flex items-center">
            <BotIcon className="w-4 h-4 mr-1" />
            <span>GPT-4o</span>
          </div>
          <div>
            {connectionStatus === 'connected' ? (
              <div className="flex items-center text-green-400">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>Assistant disponible</span>
              </div>
            ) : (
              <div className="flex items-center text-red-400">
                <MessageCircleOff className="w-4 h-4 mr-1" />
                <span>Assistant indisponible</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;