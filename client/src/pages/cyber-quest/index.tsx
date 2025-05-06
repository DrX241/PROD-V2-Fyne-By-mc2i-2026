import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Terminal, 
  Code, 
  User, 
  Map, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  BarChart, 
  Award, 
  LogOut 
} from "lucide-react";
import PlayerProfile from './components/PlayerProfile';
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import CharacterCreation from './components/CharacterCreation';
import MissionsList from './components/MissionsList';
import Headquarters from './environments/Headquarters';

const CyberQuestPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { player, isLoading, error, gamePhase, currentEnvironment } = useCyberQuest();
  const [selectedTab, setSelectedTab] = useState<string>('command-center');
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Effet pour démarrer l'introduction
  useEffect(() => {
    // Si c'est la première visite, montrer l'introduction
    const hasSeenIntro = localStorage.getItem('cyberquest_seen_intro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  // Gérer la fin de l'introduction
  const handleIntroComplete = () => {
    localStorage.setItem('cyberquest_seen_intro', 'true');
    setShowIntro(false);
  };

  // Si le joueur n'existe pas, afficher la création de personnage
  if (!player && !isLoading && !showIntro) {
    return <CharacterCreation />;
  }

  // Afficher l'introduction si nécessaire
  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold mb-6 text-blue-500">BIENVENUE DANS CYBERQUEST</h1>
          <p className="text-xl mb-6">
            Un monde où la cybersécurité prend vie. Incarnez un agent spécialisé et évoluez à travers des missions, 
            des défis et des environnements immersifs.
          </p>
          <div className="my-10 space-y-4">
            <h2 className="text-2xl font-bold text-blue-400">Votre Mission</h2>
            <p className="text-lg">
              En tant que nouvel agent, vous devrez faire vos preuves en résolvant des incidents de sécurité, 
              en déjouant des menaces et en améliorant vos compétences. Chaque décision compte, chaque mission vous fait évoluer.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
              <Card className="bg-gray-900 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-400">Compétences Évolutives</CardTitle>
                </CardHeader>
                <CardContent>
                  Développez vos talents en investigation, analyse technique, et ingénierie sociale.
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-400">Environnements Multiples</CardTitle>
                </CardHeader>
                <CardContent>
                  Explorez différents lieux, du quartier général aux infrastructures critiques.
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-400">Économie In-Game</CardTitle>
                </CardHeader>
                <CardContent>
                  Gagnez et dépensez des crédits pour améliorer votre équipement et accéder à de nouvelles zones.
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="mt-8 bg-blue-600 hover:bg-blue-700"
            onClick={handleIntroComplete}
          >
            COMMENCER L'AVENTURE
          </Button>
        </div>
      </div>
    );
  }

  // Afficher l'interface principale du jeu
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barre supérieure avec informations joueur */}
      <header className="bg-gray-800 text-white p-3 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Shield className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">CyberQuest</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {player && (
            <>
              <Badge variant="outline" className="bg-blue-900 text-white">
                <User className="h-4 w-4 mr-1" /> {player.characterName || 'Agent'}
              </Badge>
              <Badge variant="outline" className="bg-gray-700">
                Niveau {player.level}
              </Badge>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span>{player.credits} crédits</span>
              </div>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/')}
          >
            <LogOut className="h-4 w-4 mr-1" /> Quitter
          </Button>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Barre latérale */}
        <aside className="w-56 bg-gray-800 text-white p-4 flex flex-col">
          <nav className="space-y-2 flex-grow">
            <Button 
              variant={selectedTab === 'command-center' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('command-center')}
            >
              <Terminal className="h-4 w-4 mr-2" /> Centre de commande
            </Button>
            <Button 
              variant={selectedTab === 'missions' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('missions')}
            >
              <Briefcase className="h-4 w-4 mr-2" /> Missions
            </Button>
            <Button 
              variant={selectedTab === 'profile' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('profile')}
            >
              <User className="h-4 w-4 mr-2" /> Profil
            </Button>
            <Button 
              variant={selectedTab === 'skills' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('skills')}
            >
              <Code className="h-4 w-4 mr-2" /> Compétences
            </Button>
            <Button 
              variant={selectedTab === 'map' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('map')}
            >
              <Map className="h-4 w-4 mr-2" /> Carte
            </Button>
            <Button 
              variant={selectedTab === 'codex' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('codex')}
            >
              <BookOpen className="h-4 w-4 mr-2" /> Codex
            </Button>
            <Button 
              variant={selectedTab === 'communications' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('communications')}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Communications
            </Button>
            <Button 
              variant={selectedTab === 'stats' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('stats')}
            >
              <BarChart className="h-4 w-4 mr-2" /> Statistiques
            </Button>
          </nav>
          
          <div className="mt-auto">
            <Separator className="my-4" />
            <Button 
              variant={selectedTab === 'settings' ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab('settings')}
            >
              <Settings className="h-4 w-4 mr-2" /> Paramètres
            </Button>
          </div>
        </aside>
        
        {/* Contenu principal */}
        <main className="flex-grow p-6 bg-gray-100 dark:bg-gray-900 overflow-auto">
          {/* Afficher le contenu en fonction de l'onglet sélectionné */}
          {selectedTab === 'command-center' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Centre de Commande</h2>
              {currentEnvironment ? (
                <Headquarters />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chargement du quartier général...</p>
                </div>
              )}
            </div>
          )}
          
          {selectedTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Profil d'Agent</h2>
              {player ? (
                <PlayerProfile player={player} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chargement du profil...</p>
                </div>
              )}
            </div>
          )}
          
          {selectedTab === 'missions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Centre de Missions</h2>
              <MissionsList />
            </div>
          )}
          
          {selectedTab === 'skills' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Arbre de Compétences</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === 'map' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Carte des Environnements</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === 'codex' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Codex de Cybersécurité</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === 'communications' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Centre de Communications</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Statistiques d'Agent</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CyberQuestPage;