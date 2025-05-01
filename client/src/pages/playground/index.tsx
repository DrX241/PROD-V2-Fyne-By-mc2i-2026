import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Shield, Code, Terminal, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

// Types pour les modules
interface ModuleData {
  id: string;
  title: string;
  description: string;
  level: number;
  progress: number;
  totalCards: number;
  completedCards: number;
  unlocked: boolean;
  completed: boolean;
  icon: string;
  xp: number;
}

// Données factices des modules
const modules: ModuleData[] = [
  {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Les bases de la sécurité informatique',
    level: 1,
    progress: 20,
    totalCards: 8,
    completedCards: 2,
    unlocked: true,
    completed: false,
    icon: '🔐',
    xp: 100
  },
  {
    id: 'threat-landscape',
    title: 'Panorama des menaces',
    description: 'Découverte des cybermenaces actuelles',
    level: 2,
    progress: 0,
    totalCards: 4,
    completedCards: 0,
    unlocked: true,
    completed: false,
    icon: '🔍',
    xp: 150
  },
  {
    id: 'network-security',
    title: 'Sécurité des réseaux',
    description: 'Protection des infrastructures réseau',
    level: 3,
    progress: 0,
    totalCards: 6,
    completedCards: 0,
    unlocked: false,
    completed: false,
    icon: '🌐',
    xp: 200
  }
];

// Composant pour un module individuel
const ModuleCard = ({ module }: { module: ModuleData }) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic';
  const [, setLocation] = useLocation();
  
  // Déterminer le bon icône selon le niveau
  const getLevelIcon = () => {
    if (module.level === 1) return <Book className="h-4 w-4" />;
    if (module.level === 2) return <Shield className="h-4 w-4" />;
    return <Code className="h-4 w-4" />;
  };
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer ${
        module.unlocked 
          ? isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
          : isDark ? 'bg-gray-900 opacity-60' : 'bg-gray-100 opacity-70'
      } transition-all`}
      onClick={() => module.unlocked && setLocation(`/playground/module?id=${module.id}`)}
    >
      {/* Bannière supérieure */}
      <div className="h-2 bg-blue-500" />
      
      {/* Contenu du module */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{module.icon}</span>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {module.title}
              </h3>
              <div className="flex items-center">
                <Badge variant="outline" className={`flex items-center gap-1 text-xs ${
                  isDark ? 'border-gray-700 text-gray-300' : 'text-gray-600'
                }`}>
                  {getLevelIcon()}
                  Niveau {module.level}
                </Badge>
                <span className={`ml-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {module.xp} XP
                </span>
              </div>
            </div>
          </div>
          
          {!module.unlocked && (
            <div className={`text-xs px-2 py-1 rounded ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              Verrouillé
            </div>
          )}
        </div>
        
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {module.description}
        </p>
        
        {/* Progression */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Progression
            </span>
            <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
              {module.completedCards}/{module.totalCards}
            </span>
          </div>
          <Progress value={module.progress} className={`h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
        
        {/* Bouton d'action */}
        <Button 
          className="w-full"
          disabled={!module.unlocked}
          variant={!module.unlocked ? "outline" : "default"}
        >
          {module.progress > 0 ? 'Continuer' : 'Commencer'}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Page principale du Playground
export default function PlaygroundPage() {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic';
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* En-tête */}
      <header className={`px-4 py-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Cyber Playground</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6">
        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          Modules d'apprentissage
        </h2>
        <p className={`mb-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Choisissez un module pour commencer ou continuer votre apprentissage de la cybersécurité.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
        
        {/* Prochaine mise à jour (fictive) */}
        <div className={`mt-10 p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Prochainement
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Nouveaux modules en préparation : Sécurité des applications web, Cryptographie, 
            et Réponse aux incidents...
          </p>
        </div>
      </main>
    </div>
  );
}