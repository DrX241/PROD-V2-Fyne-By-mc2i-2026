import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Send, BookOpen, RefreshCw, ArrowLeft, Shield, Target, Mail, Trophy, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '@/components/utils/PageTitle';
import Layout from '@/components/layout/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Link } from 'wouter';
import robotWithLightbulbPath from "../../assets/robot-with-lightbulb.jpg";
import userProfessionalPath from "../../assets/user-professional.svg";
import { Badge } from '@/components/ui/badge';

// Interface pour les messages du chat
interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export default function Mc2iLearningOutils() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  // États du chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  // États pour le système gamifié
  const [userProfile, setUserProfile] = useState<{
    trigramme: string | null;
    niveau: string | null;
    parcours: 'classique' | 'immersion' | null;
    progression: number;
    badges: string[];
  }>({
    trigramme: null,
    niveau: null,
    parcours: null,
    progression: 0,
    badges: []
  });
  
  // Références pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialisation de la session
  useEffect(() => {
    // Générer un ID utilisateur unique pour la session
    const generatedUserId = localStorage.getItem('mcai_user_id') || uuidv4();
    localStorage.setItem('mcai_user_id', generatedUserId);
    setUserId(generatedUserId);

    // Initialiser la session avec le backend seulement si ce n'est pas déjà fait
    if (!initializationAttempted) {
      initializeSession(generatedUserId);
      setInitializationAttempted(true);
    }
  }, [initializationAttempted]);

  // Fonction pour initialiser la session avec le backend
  const initializeSession = async (userId: string) => {
    // Empêcher les initialisations multiples
    if (isInitialized) return;
    
    try {
      // Ne pas modifier l'état des messages directement ici pour éviter les doublons
      const response = await axios.post('/api/mcai-learning/init', { userId });
      
      if (response.data.success) {
        // Ajouter le message de bienvenue uniquement si la liste est vide
        // et si c'est la première initialisation
        if (messages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: response.data.message,
            timestamp: new Date()
          };
          
          // Mettre à jour l'état une seule fois
          setMessages([welcomeMessage]);
        }
        setIsInitialized(true);
      } else {
        console.error('Erreur lors de l\'initialisation:', response.data.error);
        if (messages.length === 0) {
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: 'Désolé, une erreur est survenue lors de l\'initialisation de la session. Veuillez réessayer.',
            timestamp: new Date()
          };
          setMessages([errorMessage]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      if (messages.length === 0) {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Désolé, une erreur est survenue lors de l\'initialisation de la session. Veuillez réessayer.',
          timestamp: new Date()
        };
        setMessages([errorMessage]);
      }
    }
  };

  // Ajouter un message au chat et mettre à jour le profil utilisateur
  const addMessage = (role: 'assistant' | 'user', content: string) => {
    const newMsg: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Mettre à jour le profil utilisateur en fonction du contenu des messages
    if (role === 'assistant') {
      // Extraire le trigramme potentiel
      const trigrammeMatch = content.match(/[A-Z]{3}/);
      if (trigrammeMatch && !userProfile.trigramme) {
        setUserProfile(prev => ({ ...prev, trigramme: trigrammeMatch[0] }));
      }
      
      // Détecter le niveau
      const niveauPatterns = [
        'Consultant', 'Consultant Confirmé', 'Consultant Senior', 
        'Chef de Projet', 'Manager', 'Senior Manager', 'Directeur'
      ];
      
      for (const niveau of niveauPatterns) {
        if (content.includes(niveau) && !userProfile.niveau) {
          setUserProfile(prev => ({ ...prev, niveau }));
          break;
        }
      }
      
      // Détecter le parcours
      if (content.includes("Apprentissage Classique")) {
        setUserProfile(prev => ({ ...prev, parcours: 'classique', progression: Math.max(prev.progression, 25) }));
      } else if (content.includes("Immersion Totale")) {
        setUserProfile(prev => ({ ...prev, parcours: 'immersion', progression: Math.max(prev.progression, 16) }));
      }
      
      // Mettre à jour la progression
      if (content.includes("Voici votre premier scénario")) {
        setUserProfile(prev => ({ ...prev, progression: Math.max(prev.progression, 40) }));
      } else if (content.includes("Voici votre deuxième scénario")) {
        setUserProfile(prev => ({ ...prev, progression: Math.max(prev.progression, 60) }));
      } else if (content.includes("dernier scénario")) {
        setUserProfile(prev => ({ ...prev, progression: Math.max(prev.progression, 80) }));
      } else if (content.includes("Synthèse de votre performance")) {
        setUserProfile(prev => ({ 
          ...prev, 
          progression: 100,
          badges: [...prev.badges.filter(b => b !== "Parcours Terminé"), "Parcours Terminé"]
        }));
      }
      
      // Attribuer des badges selon les performances
      if (content.includes("Points forts") && content.includes("excellente analyse")) {
        setUserProfile(prev => ({ 
          ...prev, 
          badges: [...prev.badges.filter(b => b !== "Expert en Analyse"), "Expert en Analyse"] 
        }));
      }
      
      if (content.includes("Points forts") && content.includes("communication claire")) {
        setUserProfile(prev => ({ 
          ...prev, 
          badges: [...prev.badges.filter(b => b !== "Communicateur Efficace"), "Communicateur Efficace"] 
        }));
      }
    }
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
    // Réinitialiser le profil utilisateur
    setUserProfile({
      trigramme: null,
      niveau: null,
      parcours: null,
      progression: 0,
      badges: []
    });
    // Réinitialiser l'ID utilisateur pour forcer une nouvelle session
    const newUserId = uuidv4();
    localStorage.setItem('mcai_user_id', newUserId);
    setUserId(newUserId);
    setIsInitialized(false);
    // Initialiser une nouvelle session
    initializeSession(newUserId);
  };

  return (
    <Layout>
      <PageTitle title="mc2i AI Learning" />
      
      <div className="container mx-auto py-6 h-full flex flex-col">
        {/* Chemin de navigation */}
        <div className="mb-6">
          <Link href="/amoa/new" className="flex items-center text-violet-600 hover:text-violet-700 w-fit transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            <span>Retour à I AM AMOA</span>
          </Link>
        </div>
        
        {/* Entête */}
        <div className={`flex items-center justify-between mb-6 ${isFuturistic ? 'border-b border-violet-500/50 pb-4' : 'border-b border-violet-500/20 pb-4'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isFuturistic ? 'bg-gradient-to-br from-violet-600 to-indigo-800 border border-violet-500/30' : 'bg-violet-100'}`}>
              <GraduationCap className={`${isFuturistic ? 'text-white' : 'text-violet-600'}`} size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isFuturistic ? 'text-white' : 'text-violet-800'}`}>
                mc2i AI Learning
              </h1>
              <p className={`text-sm ${isFuturistic ? 'text-indigo-200' : 'text-gray-600'}`}>
                Simulation professionnelle immersive et personnalisée
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isInitialized && (
              <Button 
                variant={isFuturistic ? "outline" : "ghost"} 
                size="sm"
                onClick={handleResetSession}
                className={isFuturistic ? 'border-violet-500 hover:bg-violet-500/20 text-white' : 'text-violet-600 hover:bg-violet-100 hover:text-violet-700'}
              >
                <RefreshCw size={16} className="mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
        
        {/* Barre de progression */}
        {userProfile.niveau && userProfile.parcours && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Target size={16} className="mr-2 text-violet-600" />
                <span className="text-sm font-medium">Votre progression</span>
              </div>
              <Badge variant="outline" className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                {userProfile.parcours === 'classique' ? 'Apprentissage Classique' : 'Immersion Totale'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${userProfile.progression}%` }}>
              </div>
            </div>
          </div>
        )}
        
        {/* Zone de messages */}
        <div 
          className={`flex-grow overflow-y-auto mb-4 p-4 rounded-lg ${
            isFuturistic 
              ? 'bg-gradient-to-b from-violet-500/10 to-indigo-500/10 border border-violet-500/20' 
              : 'bg-gray-50/80 border border-violet-200'
          }`}
          style={{ height: 'calc(100vh - 350px)' }}
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
                    <Avatar className={`w-12 h-12 border-2 ${msg.role === 'user' ? 'border-violet-300/20' : 'border-violet-300/20'}`}>
                      {msg.role === 'assistant' ? (
                        <img src={robotWithLightbulbPath} alt="AI Robot" className="object-cover scale-110" />
                      ) : (
                        <img src={userProfessionalPath} alt="User" className="object-cover" />
                      )}
                    </Avatar>
                  </div>
                  
                  {/* Message content */}
                  <div 
                    className={`px-4 py-3 rounded-lg ${
                      msg.role === 'user' 
                        ? isFuturistic 
                          ? 'bg-violet-600/90 text-white border border-violet-500/40' 
                          : 'bg-violet-600 text-white' 
                        : isFuturistic 
                          ? 'bg-white/90 border border-indigo-300/30 text-gray-800' 
                          : 'bg-white border border-violet-200 text-gray-800'
                    }`}
                  >
                    <div 
                      className="whitespace-pre-wrap email-content" 
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content.replace(/\n/g, '<br/>') 
                      }} 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Indicateur de chargement - s'affiche uniquement si isLoading est true */}
            {isLoading && (
              <motion.div
                key="loading-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="w-12 h-12 border-2 border-violet-300/20">
                      <img src={robotWithLightbulbPath} alt="AI Robot" className="object-cover scale-110" />
                    </Avatar>
                  </div>
                  <div 
                    className={`px-4 py-3 rounded-lg ${
                      isFuturistic 
                        ? 'bg-white/90 border border-indigo-300/30 text-gray-800' 
                        : 'bg-white border border-violet-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>
        
        {/* Affichage badges */}
        {userProfile.badges.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {userProfile.badges.map((badge, index) => (
              <Badge key={index} className="py-1.5 px-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700">
                <Trophy size={14} className="mr-1" /> {badge}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Formulaire de saisie */}
        <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
          <div className="relative flex-grow">
            <Textarea
              placeholder="Entrez votre message pour la simulation professionnelle..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className={`min-h-[100px] resize-none p-4 pr-12 ${
                isFuturistic 
                  ? 'bg-violet-950/10 border-violet-500/30 text-white placeholder:text-violet-300/60 focus-visible:ring-violet-500/50' 
                  : 'bg-white border-violet-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-violet-500/30'
              }`}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className={`absolute bottom-3 right-3 ${
                isFuturistic 
                  ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              } rounded-full h-9 w-9`}
              disabled={!newMessage.trim() || isLoading}
            >
              <Send size={16} className={isLoading ? 'opacity-50' : ''} />
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}