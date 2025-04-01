import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Info } from 'lucide-react';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatContext } from '@/contexts/ChatContext';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  avatar?: string;
  name?: string;
  role?: string;
}

interface ChatInterfaceProps {
  contactName: string;
  contactRole: string;
  contactAvatar?: string;
  userAvatar: string;
  userName: string;
  userRole: string;
  onClose?: () => void;
  initialMessage?: string;
  scenario?: any;
  height?: string;
}

export default function ChatInterface({
  contactName,
  contactRole,
  contactAvatar = 'avatar1',
  userAvatar,
  userName,
  userRole,
  onClose,
  initialMessage,
  scenario,
  height = 'h-[600px]'
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'primary' | 'secondary'>('primary');
  const [modelName, setModelName] = useState('GPT-4o');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userName: contextUserName } = useChatContext();

  useEffect(() => {
    // Ajouter le message initial s'il existe
    if (initialMessage) {
      setMessages([
        {
          id: '0',
          content: initialMessage,
          sender: 'assistant',
          timestamp: new Date(),
          avatar: contactAvatar,
          name: contactName,
          role: contactRole
        }
      ]);
    }
  }, [initialMessage, contactAvatar, contactName, contactRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      avatar: userAvatar,
      name: userName,
      role: userRole
    };

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Préparer l'historique des messages pour l'API
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Appeler l'API pour obtenir la réponse
      const response = await axios.post('/api/cyber/chat', {
        message: inputValue,
        userName: userName || contextUserName,
        scenarioId: scenario?.id || 'default-scenario',
        contactName: contactName,
        contactRole: contactRole,
        chatHistory,
        apiKeyType: model // Spécifier le modèle à utiliser
      });

      // Ajouter la réponse du PNJ
      if (response.data && response.data.reply) {
        const botMessage: Message = {
          id: (Date.now() + 100).toString(),
          content: response.data.reply,
          sender: 'assistant',
          timestamp: new Date(),
          avatar: contactAvatar,
          name: contactName,
          role: contactRole
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Message d'erreur en cas d'échec
      const errorMessage: Message = {
        id: (Date.now() + 100).toString(),
        content: "Désolé, une erreur est survenue lors de la communication. Veuillez réessayer dans un instant.",
        sender: 'assistant',
        timestamp: new Date(),
        avatar: contactAvatar,
        name: contactName,
        role: contactRole
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (value: string) => {
    if (value === 'primary' || value === 'secondary') {
      setModel(value);
      setModelName(value === 'primary' ? 'GPT-4o' : 'GPT-4o-mini');
    }
  };

  const handleRefreshApiStatus = async () => {
    try {
      const response = await axios.get('/api/cyber/status');
      console.log('API Status:', response.data);
      // Éventuellement afficher un toast ou une notification
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  const handleSwitchApiKey = async () => {
    try {
      const newType = model === 'primary' ? 'secondary' : 'primary';
      await axios.post('/api/cyber/switch-api-key', { type: newType });
      setModel(newType);
      setModelName(newType === 'primary' ? 'GPT-4o' : 'GPT-4o-mini');
      // Éventuellement afficher un toast ou une notification
    } catch (error) {
      console.error('Error switching API key:', error);
    }
  };

  return (
    <div className={`flex flex-col rounded-lg border bg-card shadow-sm ${height} max-h-screen`}>
      {/* En-tête du chat */}
      <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <AvatarDisplay avatarId={contactAvatar} size="sm" />
          <div>
            <div className="font-semibold">{contactName}</div>
            <div className="text-xs text-muted-foreground">{contactRole}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleRefreshApiStatus}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Rafraîchir le statut</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vérifier le statut de l'API</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select defaultValue={model} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Modèle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">GPT-4o</SelectItem>
              <SelectItem value="secondary">GPT-4o-mini</SelectItem>
            </SelectContent>
          </Select>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              } max-w-[80%] gap-2`}
            >
              <div className="mt-1">
                <AvatarDisplay 
                  avatarId={message.avatar || (message.sender === 'user' ? userAvatar : contactAvatar)} 
                  size="sm" 
                />
              </div>
              <div>
                <div 
                  className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {message.name || (message.sender === 'user' ? userName : contactName)}
                    {message.role && (
                      <span className="font-normal text-xs opacity-75"> ({message.role})</span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[80%] gap-2">
              <div className="mt-1">
                <AvatarDisplay avatarId={contactAvatar} size="sm" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="text-xs font-semibold mb-1">
                  {contactName}
                  <span className="font-normal text-xs opacity-75"> ({contactRole})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder={`Écrivez à ${contactName}...`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="min-h-10 flex-1 resize-none"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <Info className="h-3 w-3" />
                    <span>Modèle utilisé: {modelName}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GPT-4o: Haute qualité, plus précis</p>
                  <p>GPT-4o-mini: Plus rapide, moins coûteux</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs" 
            onClick={handleSwitchApiKey}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Changer de clé API
          </Button>
        </div>
      </div>
    </div>
  );
}