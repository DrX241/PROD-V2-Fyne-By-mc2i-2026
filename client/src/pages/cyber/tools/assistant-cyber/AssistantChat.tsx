import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowDown, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  timestamp: Date;
}

interface AssistantChatProps {
  assistantName: string;
  assistantDomain: string;
  assistantPersonality: string;
  systemPrompt: string;
}

export default function AssistantChat({
  assistantName,
  assistantDomain,
  assistantPersonality,
  systemPrompt
}: AssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Message de bienvenue de l'assistant
    setMessages([
      {
        id: '1',
        content: `Bonjour, je suis ${assistantName}, votre assistant spécialisé en ${assistantDomain}. Comment puis-je vous aider aujourd'hui ?`,
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, [assistantName, assistantDomain]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // Appel à l'API pour générer la réponse de l'assistant
      const response = await fetch('/api/custom-assistants/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          systemPrompt: systemPrompt,
          assistantName: assistantName,
          assistantPersonality: assistantPersonality,
          assistantDomain: assistantDomain,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant.');
      }
      
      const data = await response.json();
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la communication avec l\'assistant.',
        variant: 'destructive'
      });
      
      // Message d'erreur de l'assistant
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Je suis désolé, mais j'ai rencontré un problème de communication. Pourriez-vous réessayer votre question ?",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-blue-950/30 border border-blue-800 rounded-md overflow-hidden">
      <div className="flex items-center p-3 bg-blue-900/50 border-b border-blue-800">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src="" />
          <AvatarFallback className="bg-blue-700 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-white">{assistantName}</h3>
          <p className="text-xs text-blue-300">Spécialiste en {assistantDomain}</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-[85%] ${message.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-700 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`p-3 rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-blue-900/40 text-blue-100' 
                    : 'bg-blue-700 text-white'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <span className="text-xs opacity-70 block mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start">
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-700 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-blue-900/40 text-blue-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-blue-800 bg-blue-950/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Écrivez votre message ici..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[60px] flex-1 bg-blue-950/30 border-blue-700 text-white resize-none"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 h-[60px] w-[60px] p-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}