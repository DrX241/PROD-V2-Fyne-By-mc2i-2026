import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ShieldAlert, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import GameComponent from './components/GameComponent';
import PageTitle from '@/components/utils/PageTitle';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

export default function CyberEscape() {
  const [gameStarted, setGameStarted] = useState(false);
  const [vulnerabilitiesFixed, setVulnerabilitiesFixed] = useState(0);
  const [vulnerabilitiesTotal, setVulnerabilitiesTotal] = useState(10);
  const [vulnerabilitiesExploited, setVulnerabilitiesExploited] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes en secondes
  const [gameInstance, setGameInstance] = useState<CyberEscapeGame | null>(null);
  const [gamePaused, setGamePaused] = useState(false);

  // Fonction pour démarrer le jeu
  const startGame = () => {
    setGameStarted(true);
    setVulnerabilitiesFixed(0);
    setVulnerabilitiesExploited(0);
    
    // Définir le nombre total de vulnérabilités en fonction du niveau
    const totalVulnerabilities = 5 + (level * 2);
    setVulnerabilitiesTotal(totalVulnerabilities);
    
    // Réinitialiser le temps
    setTimeRemaining(300);
  };

  // Fonction pour mettre le jeu en pause
  const togglePause = () => {
    setGamePaused(!gamePaused);
    if (gameInstance) {
      gameInstance.setPaused(!gamePaused);
    }
  };

  // Formatage du temps restant (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Configuration des événements du jeu
  useEffect(() => {
    if (!window.PhaserEvents) {
      window.PhaserEvents = {
        onVulnerabilityFixed: () => {},
        onVulnerabilityExploited: () => {},
        showToast: () => {},
      };
    }

    window.PhaserEvents.onVulnerabilityFixed = () => {
      setVulnerabilitiesFixed(prev => prev + 1);
      toast({
        title: "Vulnérabilité corrigée !",
        description: "Vous avez sécurisé une vulnérabilité.",
        variant: "default",
      });
    };

    window.PhaserEvents.onVulnerabilityExploited = () => {
      setVulnerabilitiesExploited(prev => prev + 1);
      toast({
        title: "Vulnérabilité exploitée !",
        description: "Un attaquant a exploité une vulnérabilité.",
        variant: "destructive",
      });
    };

    window.PhaserEvents.showToast = (message: string, type: string) => {
      toast({
        title: type === 'error' ? "Alerte" : "Information",
        description: message,
        variant: type === 'error' ? "destructive" : "default",
      });
    };

    // Décompte du temps
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gamePaused) {
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            // Fin du jeu quand le temps est écoulé
            if (timerInterval) clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameStarted, gamePaused]);

  // Détecter la fin du jeu
  useEffect(() => {
    // Conditions de victoire/défaite
    if (gameStarted) {
      // Victoire : toutes les vulnérabilités sont corrigées
      if (vulnerabilitiesFixed >= vulnerabilitiesTotal) {
        toast({
          title: "Mission réussie !",
          description: "Vous avez sécurisé toutes les vulnérabilités. L'entreprise est désormais protégée !",
          variant: "default",
        });
        setGameStarted(false);
      }
      
      // Défaite : trop de vulnérabilités exploitées ou temps écoulé
      if (vulnerabilitiesExploited >= Math.ceil(vulnerabilitiesTotal / 2) || timeRemaining <= 0) {
        toast({
          title: "Mission échouée !",
          description: "Trop de vulnérabilités ont été exploitées ou le temps est écoulé. L'entreprise est compromise.",
          variant: "destructive",
        });
        setGameStarted(false);
      }
    }
  }, [vulnerabilitiesFixed, vulnerabilitiesExploited, vulnerabilitiesTotal, timeRemaining, gameStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-900 text-white">
      <div className="container mx-auto py-6 px-4">
        <PageTitle title="CYBER ESCAPE - L'INFILTRATION INVERSE" />
        
        <div className="flex items-center mb-6">
          <Link href="/cyber/arcade">
            <Button variant="ghost" className="text-white hover:bg-blue-700/20 mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </Link>
          
          {gameStarted && (
            <Button variant="outline" className="ml-auto" onClick={togglePause}>
              {gamePaused ? "Reprendre" : "Pause"}
            </Button>
          )}
        </div>
        
        {!gameStarted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-blue-800/50 border-blue-700 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">CYBER ESCAPE</CardTitle>
                <CardDescription className="text-blue-200">
                  L'infiltration inverse : Déjouez les attaques avant qu'il ne soit trop tard
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="mb-6">
                  Dans ce jeu, vous incarnez un responsable cybersécurité chargé de protéger 
                  l'entreprise contre les attaques. Vous devez identifier et corriger les vulnérabilités 
                  avant qu'un attaquant ne puisse les exploiter.
                </p>
                
                <div className="rounded-lg bg-blue-900/50 p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-2">Niveau {level} : Bureau en danger</h3>
                  <p className="text-sm text-blue-200 mb-4">
                    Des vulnérabilités ont été détectées dans l'environnement de bureau. 
                    Localisez et corrigez-les avant qu'un attaquant ne les exploite.
                  </p>
                  
                  <div className="flex items-center text-sm mb-1">
                    <Shield className="h-4 w-4 mr-2 text-blue-200" />
                    <span>Objectif: Sécuriser toutes les vulnérabilités ({vulnerabilitiesTotal})</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <ShieldAlert className="h-4 w-4 mr-2 text-blue-200" />
                    <span>Limite: Maximum {Math.floor(vulnerabilitiesTotal / 2)} vulnérabilités peuvent être exploitées</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Niveau:</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((lvl) => (
                        <Button 
                          key={lvl} 
                          size="sm" 
                          variant={level === lvl ? "default" : "outline"}
                          onClick={() => setLevel(lvl)}
                          className={level === lvl ? "" : "text-white"}
                        >
                          {lvl}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" onClick={startGame}>
                  Commencer la mission
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-blue-800/50 border-blue-700 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Instructions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                    Déplacez-vous
                  </h3>
                  <p className="text-sm text-blue-200 pl-8">
                    Utilisez les touches <Badge variant="outline">▲</Badge> <Badge variant="outline">▼</Badge> <Badge variant="outline">◄</Badge> <Badge variant="outline">►</Badge> ou 
                    <Badge variant="outline">W</Badge> <Badge variant="outline">A</Badge> <Badge variant="outline">S</Badge> <Badge variant="outline">D</Badge> pour vous déplacer dans le bureau.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                    Recherchez les vulnérabilités
                  </h3>
                  <p className="text-sm text-blue-200 pl-8">
                    Appuyez sur <Badge variant="outline">ESPACE</Badge> pour scanner votre environnement à la recherche de vulnérabilités.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                    Corrigez les vulnérabilités
                  </h3>
                  <p className="text-sm text-blue-200 pl-8">
                    Approchez-vous d'une vulnérabilité et cliquez dessus pour la corriger. Soyez rapide !
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                    Attention au pirate
                  </h3>
                  <p className="text-sm text-blue-200 pl-8">
                    Un pirate parcourt également l'environnement et cherche à exploiter les vulnérabilités avant vous.
                  </p>
                </div>
                
                <Alert className="bg-blue-700/50 border-blue-600">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Attention</AlertTitle>
                  <AlertDescription>
                    Le temps est limité ! Vous devez terminer avant que le chronomètre n'atteigne zéro.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="bg-blue-800/30 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <h3 className="text-sm text-blue-200 mb-1">Temps restant</h3>
                  <div className="text-2xl font-mono">{formatTime(timeRemaining)}</div>
                </div>
                
                <div>
                  <h3 className="text-sm text-blue-200 mb-1">Niveau</h3>
                  <div className="text-2xl font-bold">{level}</div>
                </div>
                
                <div>
                  <h3 className="text-sm text-blue-200 mb-1">Statut</h3>
                  <div className="text-2xl">
                    {gamePaused ? (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">En pause</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-400 border-green-400">En cours</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-blue-200">Vulnérabilités corrigées</span>
                    <span className="text-sm font-bold">{vulnerabilitiesFixed} / {vulnerabilitiesTotal}</span>
                  </div>
                  <Progress 
                    value={(vulnerabilitiesFixed / vulnerabilitiesTotal) * 100} 
                    className="h-2 bg-blue-900" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-blue-200">Vulnérabilités exploitées</span>
                    <span className="text-sm font-bold">{vulnerabilitiesExploited} / {Math.ceil(vulnerabilitiesTotal / 2)}</span>
                  </div>
                  <Progress 
                    value={(vulnerabilitiesExploited / Math.ceil(vulnerabilitiesTotal / 2)) * 100} 
                    className="h-2 bg-blue-900" 
                    indicatorClassName="bg-red-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-black p-1 rounded-lg shadow-lg" style={{ aspectRatio: "16/9" }}>
              <div id="game-container" className="w-full h-full rounded overflow-hidden">
                {/* Le jeu Phaser sera monté ici */}
                <CyberEscapeGame 
                  level={level} 
                  onGameInit={(gameInstance: any) => setGameInstance(gameInstance)}
                />
              </div>
            </div>
          </>
        )}
        
        <Separator className="my-8 bg-blue-700/50" />
        
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">À propos de CyberEscape</h2>
          
          <p>
            CyberEscape est une simulation interactive qui vous place dans le rôle d'un responsable 
            cybersécurité devant protéger une entreprise contre des cyberattaques en temps réel.
          </p>
          
          <h3 className="text-xl font-bold mt-6 mb-3">Contexte</h3>
          
          <p>
            Dans l'environnement professionnel actuel, les vulnérabilités de sécurité peuvent se trouver 
            partout : un mot de passe sur un post-it, un écran déverrouillé, un document confidentiel 
            laissé à la vue de tous, ou encore des périphériques non sécurisés.
          </p>
          
          <p>
            Votre mission est de parcourir l'environnement de bureau, d'identifier ces vulnérabilités et 
            de les corriger avant qu'un attaquant ne puisse les exploiter pour compromettre le système.
          </p>
          
          <h3 className="text-xl font-bold mt-6 mb-3">Compétences développées</h3>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Identification des vulnérabilités physiques et numériques</li>
            <li>Priorisation des risques de sécurité</li>
            <li>Gestion du temps et prise de décision sous pression</li>
            <li>Compréhension des vecteurs d'attaque courants</li>
            <li>Mise en place de bonnes pratiques de sécurité</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Déclaration globale pour les événements Phaser
declare global {
  interface Window {
    PhaserEvents?: {
      onVulnerabilityFixed: () => void;
      onVulnerabilityExploited: () => void;
      showToast: (message: string, type: string) => void;
    };
  }
}