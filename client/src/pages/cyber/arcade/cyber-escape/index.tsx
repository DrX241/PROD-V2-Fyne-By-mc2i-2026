import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PageTitle from '@/components/utils/PageTitle';
import { GameProvider } from './context/GameContext';
import RoomSelector from './components/RoomSelector';
import CharacterList from './components/CharacterList';
import ConversationPanel from './components/ConversationPanel';
import GameHeader from './components/GameHeader';
import GameNavigation from './components/GameNavigation';
import GameSummary from './components/GameSummary';
import { useGame } from './context/GameContext';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Composant principal avec toute la structure
const CyberEscapeGame: React.FC = () => {
  const { 
    currentCharacter, 
    isGameOver, 
    securityPoints,
    generateGameSummary,
    setShowSummary
  } = useGame();
  const [showAboutDialog, setShowAboutDialog] = React.useState(false);

  // Générer le résumé et l'afficher si le score est négatif
  React.useEffect(() => {
    if (isGameOver && securityPoints < 0) {
      generateGameSummary();
      setShowSummary(true);
    }
  }, [isGameOver, securityPoints, generateGameSummary, setShowSummary]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation latérale */}
      <GameNavigation />
      
      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-900">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-blue-700/20">
                <ArrowLeft className="mr-2 h-4 w-4" /> Arcade
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowAboutDialog(true)}
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">À propos du jeu</span>
            </Button>
          </div>
          
          <GameHeader />
          
          {isGameOver && securityPoints < 0 && (
            <Alert className="bg-red-900/30 border-red-800 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle>Mission échouée</AlertTitle>
              <AlertDescription>
                La sécurité de l'entreprise a été compromise suite à une série de mauvaises décisions.
                Consultez le résumé de votre mission pour voir où vous avez fait des erreurs.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Réseau virtuel de l'entreprise</h2>
            <p className="text-blue-300 mb-4">
              Naviguez entre les différentes salles et interagissez avec le personnel pour identifier et corriger les vulnérabilités de sécurité.
            </p>
            
            <RoomSelector />
          </div>
          
          {currentCharacter ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
          
          {/* Composant GameSummary pour afficher le résumé de fin de partie */}
          <GameSummary />
          
          {/* Dialogue À propos */}
          <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
            <DialogContent className="max-w-3xl bg-blue-950 border-blue-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">À propos de CyberEscape</DialogTitle>
                <DialogDescription className="text-blue-300">
                  L'infiltration inverse : Détecter et contrer les menaces de l'intérieur
                </DialogDescription>
              </DialogHeader>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  CyberEscape est une simulation interactive qui vous place dans le rôle d'un responsable 
                  cybersécurité devant protéger une entreprise contre des cyberattaques. Dans cette version "infiltration inverse",
                  c'est à vous de détecter et de contrer les menaces avant qu'un attaquant ne les exploite.
                </p>
                
                <h3 className="text-xl font-bold mt-4 mb-2">Contexte</h3>
                
                <p>
                  Dans l'environnement professionnel actuel, les vulnérabilités de sécurité peuvent prendre de nombreuses formes : 
                  mauvaises pratiques, configurations erronées, procédures non respectées, ou encore sensibilisation insuffisante des collaborateurs.
                </p>
                
                <p>
                  Votre mission est d'explorer le réseau virtuel de l'entreprise, de discuter avec les différents collaborateurs 
                  pour identifier leurs comportements à risque et leur proposer des solutions conformes aux bonnes pratiques de cybersécurité.
                </p>
                
                <h3 className="text-xl font-bold mt-4 mb-2">Règles du jeu</h3>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous commencez avec <strong>20 points de sécurité</strong></li>
                  <li>Chaque bonne décision vous fera gagner des points</li>
                  <li>Chaque mauvaise décision vous fera perdre des points</li>
                  <li>Si votre score devient négatif, la mission échoue</li>
                  <li>Découvrez des bonnes pratiques en interagissant avec les personnages</li>
                  <li>Certaines salles sont verrouillées et nécessitent un minimum de points pour être accessibles</li>
                </ul>
                
                <h3 className="text-xl font-bold mt-4 mb-2">Compétences développées</h3>
                
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Identification des vulnérabilités et des comportements à risque</li>
                  <li>Communication efficace sur les enjeux de sécurité</li>
                  <li>Analyse des pratiques et proposition de solutions adaptées</li>
                  <li>Compréhension des vecteurs d'attaque courants</li>
                  <li>Application des bonnes pratiques de cybersécurité</li>
                </ul>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Fermer</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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