import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PageTitle from '@/components/utils/PageTitle';
import { GameProvider } from './context/GameContext';
import RoomSelector from './components/RoomSelector';
import CharacterList from './components/CharacterList';
import ConversationPanel from './components/ConversationPanel';
import GameHeader from './components/GameHeader';
import { useGame } from './context/GameContext';

// Composant principal avec toute la structure
const CyberEscapeGame: React.FC = () => {
  const { currentCharacter } = useGame();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Link href="/cyber/arcade">
          <Button variant="ghost" className="text-white hover:bg-blue-700/20 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </Link>
      </div>
      
      <GameHeader />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Réseau virtuel de l'entreprise</h2>
        <p className="text-blue-300 mb-4">
          Naviguez entre les différentes salles et interagissez avec le personnel pour identifier et corriger les vulnérabilités de sécurité.
        </p>
        
        <RoomSelector />
      </div>
      
      {currentCharacter ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ConversationPanel />
          </div>
          <div>
            <CharacterList />
          </div>
        </div>
      ) : (
        <CharacterList />
      )}
      
      <Separator className="my-8 bg-blue-700/50" />
      
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4">À propos de CyberEscape</h2>
        
        <p>
          CyberEscape est une simulation interactive qui vous place dans le rôle d'un responsable 
          cybersécurité devant protéger une entreprise contre des cyberattaques. Dans cette version "infiltration inverse",
          c'est à vous de détecter et de contrer les menaces avant qu'un attaquant ne les exploite.
        </p>
        
        <h3 className="text-xl font-bold mt-6 mb-3">Contexte</h3>
        
        <p>
          Dans l'environnement professionnel actuel, les vulnérabilités de sécurité peuvent prendre de nombreuses formes : 
          mauvaises pratiques, configurations erronées, procédures non respectées, ou encore sensibilisation insuffisante des collaborateurs.
        </p>
        
        <p>
          Votre mission est d'explorer le réseau virtuel de l'entreprise, de discuter avec les différents collaborateurs 
          pour identifier leurs comportements à risque et leur proposer des solutions conformes aux bonnes pratiques de cybersécurité.
        </p>
        
        <h3 className="text-xl font-bold mt-6 mb-3">Compétences développées</h3>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Identification des vulnérabilités et des comportements à risque</li>
          <li>Communication efficace sur les enjeux de sécurité</li>
          <li>Analyse des pratiques et proposition de solutions adaptées</li>
          <li>Compréhension des vecteurs d'attaque courants</li>
          <li>Application des bonnes pratiques de cybersécurité</li>
        </ul>
      </div>
    </div>
  );
};

// Wrapper pour fournir le contexte du jeu
export default function CyberEscape() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-900 text-white">
      <PageTitle title="CYBER ESCAPE - L'INFILTRATION INVERSE" />
      
      <GameProvider>
        <CyberEscapeGame />
      </GameProvider>
    </div>
  );
}