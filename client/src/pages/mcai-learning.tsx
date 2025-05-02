import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Send, BookOpen, Users, Database, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '@/components/utils/PageTitle';
import Layout from '@/components/layout/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import mcLogoPath from "@assets/mc2i.png";

// Interface pour les messages du chat
interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Interface pour le statut de la session
interface SessionStatus {
  trigramme: string | null;
  metier: string | null;
  mode: 'classique' | 'immersion' | null;
  formation: 'interne' | 'externe' | null;
  formationChoisie: string | null;
  stageActuel: 'introduction' | 'choix_mode' | 'choix_formation' | 'formation' | 'scenario' | null;
  scenarioActuel: number;
}

export default function McaiLearning() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  // Messages du chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Références pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialisation de la session
  useEffect(() => {
    // Générer un ID utilisateur unique pour la session
    const generatedUserId = localStorage.getItem('mcai_user_id') || uuidv4();
    localStorage.setItem('mcai_user_id', generatedUserId);
    setUserId(generatedUserId);

    // Initialiser la session avec le backend
    initializeSession(generatedUserId);
  }, []);

  // Fonction pour initialiser la session avec le backend
  const initializeSession = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/mcai-learning/init', { userId });
      
      if (response.data.success) {
        // Ajouter le message de bienvenue
        addMessage('assistant', response.data.message);
        setSessionStatus(response.data.sessionStatus);
        setIsInitialized(true);
      } else {
        console.error('Erreur lors de l\'initialisation:', response.data.error);
        addMessage('assistant', 'Désolé, une erreur est survenue lors de l\'initialisation de la session. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      addMessage('assistant', 'Désolé, une erreur est survenue lors de l\'initialisation de la session. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un message au chat
  const addMessage = (role: 'assistant' | 'user', content: string) => {
    const newMsg: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Défilement automatique vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Envoi d'un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading || !userId) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = newMessage.trim();
    addMessage('user', userMessage);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/mcai-learning/message', {
        userId,
        message: userMessage
      });
      
      if (response.data.success) {
        // Ajouter la réponse de l'assistant
        addMessage('assistant', response.data.message);
        // Mettre à jour le statut de la session
        setSessionStatus(response.data.sessionStatus);
      } else {
        console.error('Erreur lors de l\'envoi du message:', response.data.error);
        addMessage('assistant', 'Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      addMessage('assistant', 'Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la saisie de l'utilisateur
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  // Gérer la soumission via la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Réinitialiser la session
  const handleResetSession = () => {
    // Effacer les messages
    setMessages([]);
    // Réinitialiser l'ID utilisateur pour forcer une nouvelle session
    const newUserId = uuidv4();
    localStorage.setItem('mcai_user_id', newUserId);
    setUserId(newUserId);
    setSessionStatus(null);
    setIsInitialized(false);
    // Initialiser une nouvelle session
    initializeSession(newUserId);
  };

  // Gérer l'affichage des informations d'étape
  const renderStageInfo = () => {
    if (!sessionStatus) return null;
    
    const { stageActuel, scenarioActuel, mode } = sessionStatus;
    
    let totalScenarios = mode === 'classique' ? 4 : 6;
    
    return (
      <div className={`flex items-center gap-2 ${isFuturistic ? 'text-blue-300' : 'text-blue-600'}`}>
        <div className="flex items-center gap-1">
          {stageActuel === 'scenario' ? (
            <>
              <Database size={16} />
              <span className="text-sm">Scénario {scenarioActuel + 1}/{totalScenarios}</span>
            </>
          ) : (
            <>
              <BookOpen size={16} />
              <span className="text-sm capitalize">{stageActuel}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <PageTitle title="mc2i AI Learning" />
      
      <div className="container mx-auto py-8 h-full flex flex-col">
        {/* Entête */}
        <div className={`flex items-center justify-between mb-6 ${isFuturistic ? 'border-b border-[#1e75a3]/50 pb-4' : 'border-b border-[#1e75a3]/20 pb-4'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isFuturistic ? 'bg-gradient-to-br from-[#1e75a3] to-[#0d3b5a] border border-[#1e75a3]/30' : 'bg-[#1e75a3]/10'}`}>
              <GraduationCap className={`${isFuturistic ? 'text-white' : 'text-[#1e75a3]'}`} size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isFuturistic ? 'text-white' : 'text-[#1e75a3]'}`}>
                m<span className="text-[#e6007e]">c2</span>i AI Learning
              </h1>
              <p className={`text-sm ${isFuturistic ? 'text-blue-200' : 'text-gray-600'}`}>
                Votre assistant virtuel d'évaluation et de formation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isInitialized && (
              <Button 
                variant={isFuturistic ? "outline" : "ghost"} 
                size="sm"
                onClick={handleResetSession}
                className={isFuturistic ? 'border-[#1e75a3] hover:bg-[#1e75a3]/20 text-white' : 'text-[#1e75a3] hover:bg-[#1e75a3]/10 hover:text-[#1e75a3]'}
              >
                <RefreshCw size={16} className="mr-2" />
                Réinitialiser
              </Button>
            )}
            {sessionStatus && renderStageInfo()}
          </div>
        </div>
        
        {/* Zone de messages */}
        <div 
          className={`flex-grow overflow-y-auto mb-4 p-4 rounded-lg ${
            isFuturistic 
              ? 'bg-gradient-to-b from-[#1e75a3]/10 to-[#0d3b5a]/30 border border-[#1e75a3]/20' 
              : 'bg-gray-50/80 border border-[#1e75a3]/10'
          }`}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div 
                  className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <Avatar className="w-10 h-10">
                      {msg.role === 'assistant' ? (
                        <img src={mcLogoPath} alt="mc2i" className="object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isFuturistic ? 'bg-[#1e75a3]' : 'bg-[#1e75a3]'}`}>
                          <Users size={20} className="text-white" />
                        </div>
                      )}
                    </Avatar>
                  </div>
                  
                  {/* Message content */}
                  <div 
                    className={`px-4 py-3 rounded-lg ${
                      msg.role === 'user' 
                        ? isFuturistic 
                          ? 'bg-[#1e75a3]/90 text-white border border-[#1e75a3]/40' 
                          : 'bg-[#1e75a3] text-white' 
                        : isFuturistic 
                          ? 'bg-white/90 border border-[#e6007e]/20 text-gray-800' 
                          : 'bg-white border border-[#e6007e]/10 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="w-10 h-10">
                      <img src={mcLogoPath} alt="mc2i" className="object-cover" />
                    </Avatar>
                  </div>
                  <div 
                    className={`px-4 py-3 rounded-lg ${
                      isFuturistic 
                        ? 'bg-white/90 border border-[#e6007e]/20 text-gray-800' 
                        : 'bg-white border border-[#e6007e]/10 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#e6007e] animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-[#e6007e] animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-[#e6007e] animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Formulaire d'envoi */}
        <form onSubmit={handleSendMessage} className="relative">
          <Textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Tapez votre message ici..."
            className={`w-full p-3 pr-12 resize-none ${
              isFuturistic 
                ? 'bg-[#1e75a3]/10 border-[#1e75a3]/30 text-gray-800 focus:border-[#1e75a3]/70 focus:ring-[#1e75a3]/30' 
                : 'bg-white border-[#1e75a3]/20 text-gray-800 focus:border-[#1e75a3] focus:ring-[#1e75a3]/20'
            }`}
            disabled={isLoading}
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isLoading}
            className={`absolute right-3 bottom-3 ${
              isFuturistic
                ? 'bg-gradient-to-r from-[#1e75a3] to-[#0d3b5a] hover:from-[#1e75a3]/90 hover:to-[#0d3b5a]/90 border border-[#1e75a3]/30' 
                : 'bg-[#e6007e] hover:bg-[#e6007e]/90'
            }`}
            size="icon"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </Layout>
  );
}