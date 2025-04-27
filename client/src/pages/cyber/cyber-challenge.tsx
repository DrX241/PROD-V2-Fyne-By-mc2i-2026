import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield, Users, BrainCircuit, ChevronLeft, Clock, Trophy } from 'lucide-react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ThemeSwitch from '@/components/ThemeSwitch';

// Types pour les données de la session
interface Player {
  name: string;
  role: string;
  points: number;
}

interface SessionContext {
  currentStage: number;
  currentLevel: number;
  maxLevel: number;
  currentPlayer: string;
  players: Player[];
  remainingBudget?: number;
  discoveredIndices: number;
}

interface Message {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: number;
  sender?: string;
}

const CyberChallenge: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [debriefing, setDebriefing] = useState<string | null>(null);
  const [countdownTime, setCountdownTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);

  // Initialiser la session au chargement de la page
  useEffect(() => {
    initializeSession();
  }, []);

  // Faire défiler les messages vers le bas quand ils sont mis à jour
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fonction pour initialiser une nouvelle session
  const initializeSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/cyber/challenge/initialize');
      
      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setMessages([response.data.initialMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!sessionId || !message.trim() || loading) return;

    try {
      setLoading(true);
      
      // Ajouter le message de l'utilisateur à la liste locale
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
        sender: playerName || 'Vous'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Envoyer le message au serveur
      const response = await axios.post('/api/cyber/challenge/message', {
        sessionId,
        message: userMessage.content,
        playerName: userMessage.sender
      });
      
      if (response.data.success) {
        // Ajouter la réponse du système
        setMessages(prev => [...prev, response.data.message]);
        
        // Mettre à jour le contexte de la session
        if (response.data.sessionContext) {
          setSessionContext(response.data.sessionContext);
          
          // Si un nom de joueur actuel est fourni, le définir comme nom de joueur par défaut
          if (response.data.sessionContext.currentPlayer && !playerName) {
            setPlayerName(response.data.sessionContext.currentPlayer);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour terminer la session et générer un débriefing
  const completeSession = async () => {
    if (!sessionId || loading) return;

    try {
      setLoading(true);
      
      const response = await axios.post('/api/cyber/challenge/complete', {
        sessionId
      });
      
      if (response.data.success) {
        setDebriefing(response.data.debriefingHtml);
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation de la session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Formater le timestamp en heure lisible
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };

  // Rendu des messages
  const renderMessage = (msg: Message) => {
    const isSystem = msg.role === 'system';
    
    return (
      <div 
        key={msg.id}
        className={`mb-4 ${isSystem ? 'ml-0 mr-12' : 'ml-12 mr-0'}`}
      >
        <div className={`flex items-start ${isSystem ? 'justify-start' : 'justify-end'}`}>
          {isSystem && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/cyber-logo.png" alt="CyberChallenge" />
              <AvatarFallback><Shield size={16} /></AvatarFallback>
            </Avatar>
          )}
          
          <div 
            className={`px-4 py-3 rounded-lg ${
              isSystem 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {msg.sender && <div className="font-bold mb-1">{msg.sender}</div>}
            <div className="prose prose-sm dark:prose-invert">
              <Markdown>{msg.content}</Markdown>
            </div>
            <div className="text-xs mt-1 opacity-70 text-right">
              {formatTime(msg.timestamp)}
            </div>
          </div>
          
          {!isSystem && (
            <Avatar className="h-8 w-8 ml-2">
              <AvatarImage src={`/avatars/user-${(msg.sender?.charCodeAt(0) || 65) % 10}.png`} alt={msg.sender} />
              <AvatarFallback>{(msg.sender?.[0] || 'U').toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  // Afficher le débriefing final
  if (debriefing) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/cyber-mode-selection">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ChevronLeft size={16} />
              Retour
            </Button>
          </Link>
          <ThemeSwitch />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Débriefing CyberChallenge</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy size={14} />
                Défi terminé
              </Badge>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Markdown>{debriefing}</Markdown>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={initializeSession} className="mr-2">
                Nouveau défi
              </Button>
              <Link href="/cyber-mode-selection">
                <Button variant="outline">
                  Retour au menu
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface principale
  return (
    <div className="container mx-auto h-screen flex flex-col max-w-4xl">
      <div className="flex justify-between items-center p-4">
        <Link href="/cyber-mode-selection">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ChevronLeft size={16} />
            Retour
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield size={14} />
            CyberChallenge
          </Badge>
          <ThemeSwitch />
        </div>
      </div>
      
      {/* Panneau d'information sur la session */}
      {sessionContext && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 mb-2">
          {/* Joueurs */}
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span className="text-sm font-medium">Joueurs</span>
                </div>
                <span className="text-xs">{sessionContext.players.length}</span>
              </div>
              
              <div className="mt-1">
                {sessionContext.players.map((player, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span>{player.name} ({player.role})</span>
                    <Badge variant="secondary" className="ml-1">
                      {player.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Progression */}
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center">
                <BrainCircuit size={16} className="mr-1" />
                <span className="text-sm font-medium">Progression</span>
              </div>
              
              <div className="mt-1 text-xs">
                {sessionContext.currentStage !== undefined && sessionContext.currentStage >= 4 && (
                  <>
                    {sessionContext.currentLevel && sessionContext.maxLevel && (
                      <div className="flex justify-between">
                        <span>Niveau</span>
                        <span>{sessionContext.currentLevel}/{sessionContext.maxLevel}</span>
                      </div>
                    )}
                    
                    {sessionContext.discoveredIndices !== undefined && (
                      <div className="flex justify-between">
                        <span>Indices</span>
                        <span>{sessionContext.discoveredIndices}/10</span>
                      </div>
                    )}
                    
                    {sessionContext.remainingBudget !== undefined && (
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span>{sessionContext.remainingBudget.toLocaleString('fr-FR')}€</span>
                      </div>
                    )}
                  </>
                )}
                
                {sessionContext.currentStage !== undefined && sessionContext.currentStage < 4 && (
                  <div className="flex justify-between">
                    <span>Configuration</span>
                    <span>Étape {sessionContext.currentStage}/4</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tour de jeu */}
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span className="text-sm font-medium">Tour actuel</span>
                </div>
                
                {sessionContext.currentStage !== undefined && sessionContext.currentStage >= 4 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={completeSession}
                  >
                    Terminer
                  </Button>
                )}
              </div>
              
              {sessionContext.currentStage !== undefined && sessionContext.currentStage >= 4 && sessionContext.currentPlayer && (
                <div className="flex justify-between items-center mt-1">
                  <Badge>
                    {sessionContext.currentPlayer}
                  </Badge>
                  
                  <span className="text-xs opacity-75">
                    {playerName === sessionContext.currentPlayer ? 'À toi de jouer!' : 'En attente...'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-2">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            className="flex-1"
            placeholder={loading ? "Chargement..." : "Tapez votre message..."}
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={loading || !sessionId}
          />
          
          {loading ? (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" disabled={!message.trim() || !sessionId}>
              Envoyer
            </Button>
          )}
        </form>
        
        {sessionContext?.currentStage !== undefined && sessionContext?.currentStage >= 4 && (
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <span>Votre nom: </span>
              <Input
                className="h-6 w-32 ml-1 text-xs"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberChallenge;