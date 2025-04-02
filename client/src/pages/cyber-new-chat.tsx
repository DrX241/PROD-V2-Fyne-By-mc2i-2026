import React from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Settings,
  ShieldCheck,
  Bot,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function CyberNewChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Configuration chargée depuis localStorage
  const getChatConfig = () => {
    try {
      const savedConfig = localStorage.getItem('cyberChatConfig');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
    return {
      difficultyLevel: 'Intermédiaire',
      responseStyle: 'Détaillé et pédagogique',
      temperature: 0.7,
      maxTokens: 800
    };
  };
  
  const chatConfig = getChatConfig();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <h1 className="text-xl font-bold">I AM CYBER</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={() => setLocation('/cyber-chat-config')}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
                Votre module I AM CYBER
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Interface de chat IA supprimée</h3>
                    <p className="text-blue-600">Selon votre demande, l'interface de conversation a été désactivée.</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-blue-200">
                  <h4 className="font-medium mb-2 text-gray-900">Configuration actuelle</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Niveau de difficulté:</span>
                      <span className="font-medium">{chatConfig.difficultyLevel}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Style de réponse:</span>
                      <span className="font-medium">{chatConfig.responseStyle}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Température:</span>
                      <span className="font-medium">{chatConfig.temperature.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Longueur maximale:</span>
                      <span className="font-medium">{chatConfig.maxTokens} tokens</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start">
                <Info className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Vous pouvez modifier la configuration de votre expérience IA en cliquant sur le bouton "Paramètres" en haut de la page.
                </p>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setLocation('/cyber-chat-config')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Configurer l'IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}