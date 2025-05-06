import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Info, AlertTriangle, HelpCircle } from 'lucide-react';
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
import TutorialOverlay from './components/TutorialOverlay';
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
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHowToPlayDialog, setShowHowToPlayDialog] = useState(false);
  
  // Vérifier si c'est la première visite pour montrer le tutoriel automatiquement
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('cyberEscape_hasSeenTutorial');
    if (!hasSeenTutorial) {
      // Petit délai pour laisser la page se charger
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Marquer le tutoriel comme vu
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cyberEscape_hasSeenTutorial', 'true');
  };

  // Générer le résumé et l'afficher si le score est négatif
  useEffect(() => {
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
          
          {/* Bouton d'aide flottant */}
          <div className="fixed bottom-6 right-6 z-10">
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowHowToPlayDialog(true)}
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </div>
          
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
          
          {/* Dialogue Comment jouer */}
          <Dialog open={showHowToPlayDialog} onOpenChange={setShowHowToPlayDialog}>
            <DialogContent className="max-w-3xl bg-blue-950 border-blue-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Comment jouer à CyberEscape</DialogTitle>
                <DialogDescription className="text-blue-300">
                  Guide pas à pas pour comprendre le fonctionnement du jeu
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                  <h3 className="text-lg font-semibold mb-2">1. Navigation dans les salles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-2">
                        Cliquez sur les différentes salles dans la section "Réseau virtuel de l'entreprise" pour vous déplacer. 
                        Certaines salles sont verrouillées et nécessitent un certain nombre de points pour être accessibles.
                      </p>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded border border-blue-700 text-center">
                      <div className="text-xs mb-1 text-blue-300">Exemple de sélection de salle</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-blue-800/80 text-white text-xs">Lobby</div>
                        <div className="p-2 rounded bg-blue-800/50 text-blue-200 text-xs">Bureau IT</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                  <h3 className="text-lg font-semibold mb-2">2. Interaction avec les personnages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-2">
                        Dans chaque salle, vous rencontrerez différents personnages. Cliquez sur un personnage 
                        pour commencer une conversation avec lui. Chaque personnage a des vulnérabilités 
                        de sécurité que vous devez identifier.
                      </p>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded border border-blue-700">
                      <div className="text-xs mb-2 text-blue-300">Exemple de personnage</div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                          <span className="text-lg">👨‍💼</span>
                        </div>
                        <div>
                          <div className="font-medium">Employé</div>
                          <div className="text-xs text-blue-300">Service IT</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                  <h3 className="text-lg font-semibold mb-2">3. Conversations et choix</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-2">
                        Pendant les conversations, vous devrez faire des choix qui auront un impact sur votre score de sécurité.
                        Choisissez les réponses qui correspondent aux meilleures pratiques de cybersécurité.
                      </p>
                      <p className="text-sm">
                        Vous pouvez également explorer différents sujets de conversation en cliquant sur l'onglet "Sujets" dans le panneau de conversation.
                      </p>
                    </div>
                    <div className="bg-blue-900/50 p-3 rounded border border-blue-700">
                      <div className="text-xs mb-2 text-blue-300">Exemple de choix</div>
                      <div className="space-y-2">
                        <div className="p-2 text-xs rounded bg-green-700/30 border border-green-600/30">
                          ✓ Recommander l'utilisation d'un gestionnaire de mots de passe
                        </div>
                        <div className="p-2 text-xs rounded bg-red-700/30 border border-red-600/30">
                          ✗ Suggérer d'utiliser le même mot de passe pour tous les comptes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                  <h3 className="text-lg font-semibold mb-2">4. Progression et score</h3>
                  <p className="text-sm mb-4">
                    Votre progression est suivie par votre score de sécurité affiché dans la barre latérale. 
                    Les bonnes décisions augmentent votre score, tandis que les mauvaises le diminuent. 
                    Si votre score devient négatif, la partie est perdue.
                  </p>
                  <div className="text-xs p-2 bg-blue-800/50 rounded">
                    💡 <strong>Astuce :</strong> Pour réussir, identifiez les vulnérabilités et proposez les meilleures solutions en vous basant sur les bonnes pratiques de cybersécurité.
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowHowToPlayDialog(false);
                    setShowTutorial(true);
                  }}
                >
                  Démarrer le tutoriel
                </Button>
                <DialogClose asChild>
                  <Button>Fermer</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Tutoriel interactif */}
          {showTutorial && <TutorialOverlay onClose={handleCloseTutorial} />}
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