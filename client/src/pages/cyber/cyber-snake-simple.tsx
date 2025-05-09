import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Types
interface Practice {
  text: string;
  isGood: boolean;
  explanation: string;
}

interface Food {
  x: number;
  y: number;
  practice: Practice;
  id: number; // Identifiant unique
}

interface SnakePart {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const CyberSnakeSimple: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [snake, setSnake] = useState<SnakePart[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [foodItems, setFoodItems] = useState<Food[]>([]); // Plusieurs pratiques à la fois
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [lastEaten, setLastEaten] = useState<Practice | null>(null);
  const [gameSpeed, setGameSpeed] = useState<number>(150); // ms par frame
  const [level, setLevel] = useState<number>(1);
  const [levelThreshold, setLevelThreshold] = useState<number>(5); // Score pour monter de niveau
  const [practicesToShow, setPracticesToShow] = useState<number>(3); // Nombre de pratiques affichées simultanément
  const [collectedPractices, setCollectedPractices] = useState<Practice[]>([]); // Pratiques collectées
  const [showSummary, setShowSummary] = useState<boolean>(false); // Afficher le résumé final
  
  const gameLoopRef = useRef<number | null>(null);
  
  // Taille des cellules du jeu
  const cellSize = 20;
  const gridWidth = 30;
  const gridHeight = 20;
  
  // Charger les pratiques
  const loadPractices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/cyber/snake/practices', {
        params: { count: 20 } // Demander 20 pratiques aléatoires
      });
      
      if (response.data.success && Array.isArray(response.data.practices)) {
        setPractices(response.data.practices);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pratiques:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les pratiques de cybersécurité',
        variant: 'destructive'
      });
      // En cas d'erreur, utiliser des pratiques par défaut
      setPractices([
        { text: "Mots de passe complexes", isGood: true, explanation: "Renforce la sécurité des comptes" },
        { text: "Même mot partout", isGood: false, explanation: "Risque de compromission multiple" },
        { text: "Mises à jour régulières", isGood: true, explanation: "Corrige les vulnérabilités connues" },
        { text: "Cliquer tous les liens", isGood: false, explanation: "Risque de phishing élevé" },
        { text: "Authentification à deux facteurs", isGood: true, explanation: "Ajoute une couche de protection" }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Créer un ID unique pour chaque pratique
  const generateFoodId = () => {
    return Date.now() + Math.floor(Math.random() * 10000);
  };
  
  // Placer plusieurs pratiques aléatoirement
  const placeFood = useCallback(() => {
    if (practices.length === 0) return;
    
    // Si nous avons déjà assez de pratiques, ne rien faire
    if (foodItems.length >= practicesToShow) return;
    
    // Nombre de nouvelles pratiques à ajouter
    const numToAdd = practicesToShow - foodItems.length;
    const newFoodItems: Food[] = [...foodItems];
    
    for (let i = 0; i < numToAdd; i++) {
      // Éviter de placer de la nourriture sur le serpent ou d'autres nourritures
      let newX: number = 0;
      let newY: number = 0;
      let isOccupied = true;
      let attempts = 0;
      
      while (isOccupied && attempts < 50) {
        newX = Math.floor(Math.random() * gridWidth);
        newY = Math.floor(Math.random() * gridHeight);
        
        // Vérifier collision avec le serpent
        const isOnSnake = snake.some(part => part.x === newX && part.y === newY);
        
        // Vérifier collision avec d'autres nourritures
        const isOnFood = newFoodItems.some(item => item.x === newX && item.y === newY);
        
        isOccupied = isOnSnake || isOnFood;
        attempts++;
      }
      
      // Si nous n'avons pas pu trouver un emplacement après 50 tentatives, ne pas ajouter plus de nourriture
      if (attempts >= 50) break;
      
      // Sélectionner une pratique aléatoire
      const randomIndex = Math.floor(Math.random() * practices.length);
      const randomPractice = practices[randomIndex];
      
      if (randomPractice) {
        const newFood: Food = {
          x: newX,
          y: newY,
          practice: randomPractice,
          id: generateFoodId(), // Identifiant unique
        };
        
        newFoodItems.push(newFood);
      }
    }
    
    setFoodItems(newFoodItems);
  }, [practices, snake, foodItems, practicesToShow]);
  
  // Initialiser le jeu
  const initGame = useCallback(() => {
    // Réinitialiser l'état du jeu
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setScore(0);
    setLevel(1);
    setGameSpeed(150);
    setLevelThreshold(5);
    setGameOver(false);
    setLastEaten(null);
    setFoodItems([]);
    setCollectedPractices([]);
    setShowSummary(false);
    
    // Charger les pratiques si besoin
    if (practices.length === 0) {
      loadPractices();
    }
    
    // Placer les premières nourritures
    placeFood();
  }, [loadPractices, placeFood, practices.length]);
  
  // Gérer le mouvement du serpent
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;
    
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      // Déplacer la tête dans la direction actuelle
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + gridHeight) % gridHeight;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % gridHeight;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + gridWidth) % gridWidth;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % gridWidth;
          break;
      }
      
      // Vérifier la collision avec soi-même
      const isSelfCollision = prevSnake.slice(1).some(part => part.x === head.x && part.y === head.y);
      
      if (isSelfCollision) {
        setGameOver(true);
        setShowSummary(true); // Afficher le récapitulatif des pratiques collectées
        if (score > highScore) {
          setHighScore(score);
          toast({
            title: 'Nouveau record !',
            description: `Vous avez établi un nouveau record de ${score} points !`,
            variant: 'default'
          });
        }
        return prevSnake;
      }
      
      // Vérifier si le serpent mange une des nourritures
      const eatenFoodIndex = foodItems.findIndex(item => head.x === item.x && head.y === item.y);
      
      if (eatenFoodIndex !== -1) {
        const eatenFood = foodItems[eatenFoodIndex];
        
        // Informer l'utilisateur sur la pratique qu'il vient de manger
        setLastEaten(eatenFood.practice);
        
        // Ajouter la pratique collectée à l'historique
        setCollectedPractices(prev => [...prev, eatenFood.practice]);
        
        // Mettre à jour le score en fonction du type de pratique
        if (eatenFood.practice.isGood) {
          setScore(s => s + 2); // Bonus pour les bonnes pratiques
          toast({
            title: 'Bonne pratique !',
            description: eatenFood.practice.text,
            variant: 'default',
            action: <Check className="h-5 w-5 text-green-500" />
          });
        } else {
          setScore(s => s - 1); // Pénalité pour les mauvaises pratiques
          toast({
            title: 'Mauvaise pratique !',
            description: eatenFood.practice.text,
            variant: 'destructive',
            action: <X className="h-5 w-5 text-red-500" />
          });
        }
        
        // Supprimer la nourriture mangée et en placer de nouvelles
        setFoodItems(prev => prev.filter((_, index) => index !== eatenFoodIndex));
        
        // Ajouter de nouvelles nourritures pour maintenir le nombre souhaité
        setTimeout(() => placeFood(), 100);
        
        // Créer un nouveau serpent avec un segment supplémentaire
        const newSnake = [head, ...prevSnake];
        
        // Vérifier si le joueur a atteint le seuil pour le niveau suivant
        if (score > 0 && score % levelThreshold === 0) {
          setLevel(l => l + 1);
          setGameSpeed(s => Math.max(70, s - 10)); // Accélérer le jeu (min 70ms)
          toast({
            title: 'Niveau suivant !',
            description: `Vous atteignez le niveau ${level + 1}`,
            variant: 'default'
          });
        }
        
        return newSnake;
      }
      
      // Déplacer le serpent (supprimer la queue, ajouter la tête)
      const newSnake = [head, ...prevSnake.slice(0, -1)];
      return newSnake;
    });
  }, [direction, foodItems, gameOver, isPaused, level, placeFood, score, highScore, toast, levelThreshold, gridHeight, gridWidth]);
  
  // Fonction pour dessiner un hexagone
  const drawHexagon = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, color: string, strokeColor: string) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);
  
  // Fonction pour dessiner une bulle de texte
  const drawSpeechBubble = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, text: string) => {
    // Dessiner la bulle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    
    // Dessin du rectangle arrondi manuellement
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fill();
    
    // Ajouter un petit pointeur vers le bas
    ctx.beginPath();
    ctx.moveTo(x + width / 2 - 5, y + height);
    ctx.lineTo(x + width / 2, y + height + 5);
    ctx.lineTo(x + width / 2 + 5, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Dessiner le texte dans la bulle
    ctx.fillStyle = 'white';
    ctx.fillText(text, x + width / 2, y + height / 2);
  }, []);
  
  // Dessiner le jeu
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner un arrière-plan
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner une grille de fond plus élégante
    ctx.strokeStyle = '#1a2e3a';
    ctx.lineWidth = 0.5;
    
    // Lignes verticales et horizontales
    for (let x = 0; x <= canvas.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Dessiner toutes les nourritures (pratiques)
    foodItems.forEach(food => {
      const centerX = food.x * cellSize + cellSize / 2;
      const centerY = food.y * cellSize + cellSize / 2;
      const size = cellSize / 2 * 0.9;
      
      // Dessiner l'hexagone 
      const hexColor = 'rgba(155, 89, 182, 1)';
      const strokeColor = 'rgba(142, 68, 173, 1)';
      drawHexagon(ctx, centerX, centerY, size, hexColor, strokeColor);
      
      // Afficher le texte de la pratique
      const fontSize = Math.max(10, Math.min(14, cellSize / 3));
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Afficher le texte de la pratique
      const maxTextWidth = cellSize * 3;
      const text = food.practice.text;
      const textMetrics = ctx.measureText(text);
      
      // Si le texte est trop long, le couper
      if (textMetrics.width > maxTextWidth) {
        // Afficher le texte en plusieurs lignes dans une bulle
        const bubbleWidth = maxTextWidth + 10;
        const bubbleHeight = fontSize * 1.5;
        const bubbleX = centerX - bubbleWidth / 2;
        const bubbleY = centerY - size - bubbleHeight - 5;
        
        drawSpeechBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 5, text);
      } else {
        // Afficher le texte directement au-dessus
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText(text, centerX, centerY - size - 10);
      }
    });
    
    // Dessiner le serpent
    snake.forEach((part, index) => {
      // Tête du serpent (avec gradiant)
      if (index === 0) {
        const gradient = ctx.createRadialGradient(
          part.x * cellSize + cellSize / 2,
          part.y * cellSize + cellSize / 2,
          0,
          part.x * cellSize + cellSize / 2,
          part.y * cellSize + cellSize / 2,
          cellSize / 2
        );
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = gradient;
      } 
      // Corps du serpent avec dégradé
      else {
        const blueValue = Math.max(30, 180 - (index * 5));
        ctx.fillStyle = `rgb(52, ${blueValue}, 219)`;
      }
      
      // Dessiner un segment arrondi
      const x = part.x * cellSize;
      const y = part.y * cellSize;
      const radius = cellSize / 4;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + cellSize - radius, y);
      ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
      ctx.lineTo(x + cellSize, y + cellSize - radius);
      ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
      ctx.lineTo(x + radius, y + cellSize);
      ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      ctx.fill();
    });
    
    // Afficher le message de fin de jeu (mais pas s'il y a un résumé)
    if (gameOver && !showSummary) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
      
      ctx.font = '16px Arial';
      ctx.fillText(`Score final: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText('Appuyez sur "Jouer" pour recommencer', canvas.width / 2, canvas.height / 2 + 30);
    }
    
    // Afficher le message de pause
    if (isPaused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
    }
  }, [snake, foodItems, gameOver, isPaused, score, cellSize, showSummary, drawHexagon, drawSpeechBubble]);
  
  // Gérer l'appui sur les touches
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignorer les entrées pendant le chargement
    if (isLoading) return;
    
    // Gérer les touches de direction (éviter les retours en arrière)
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
      case ' ':
        if (gameOver) {
          initGame();
        } else {
          togglePause();
        }
        break;
    }
  }, [direction, gameOver, initGame, isLoading]);
  
  // Mettre en pause ou reprendre le jeu
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Gérer le clic sur les boutons de direction (pour mobile)
  const handleDirectionButton = (newDirection: Direction) => {
    // Éviter les retours en arrière
    if (newDirection === 'UP' && direction === 'DOWN') return;
    if (newDirection === 'DOWN' && direction === 'UP') return;
    if (newDirection === 'LEFT' && direction === 'RIGHT') return;
    if (newDirection === 'RIGHT' && direction === 'LEFT') return;
    
    setDirection(newDirection);
  };
  
  // Charger les pratiques et le meilleur score au chargement initial
  useEffect(() => {
    const savedHighScore = localStorage.getItem('cyberSnakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    loadPractices();
    
    // Vérifier si le tutoriel a été vu
    const tutorialShown = localStorage.getItem('cyberSnakeTutorialShown');
    if (tutorialShown) {
      setShowTutorial(false);
    }
  }, [loadPractices]);
  
  // Boucle de jeu principale
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    // Dessiner le jeu
    drawGame();
    
    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime >= gameSpeed) {
        moveSnake();
        lastTime = timestamp;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Démarrer la boucle de jeu
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    // Nettoyer la boucle de jeu à la fin
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [drawGame, gameOver, isPaused, moveSnake, gameSpeed]);
  
  // Écouteur d'événements pour les touches
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Sauvegarder le meilleur score
  useEffect(() => {
    if (score > highScore) {
      localStorage.setItem('cyberSnakeHighScore', score.toString());
    }
  }, [score, highScore]);
  
  // Fermer le tutoriel et enregistrer la préférence
  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cyberSnakeTutorialShown', 'true');
  };
  
  return (
    <div className="flex flex-col items-center py-4 px-4 w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center text-blue-600">Cyber Snake</h1>
      <p className="text-gray-600 mb-6 text-center">
        Collectez des pratiques de cybersécurité et testez votre jugement ! Saurez-vous distinguer les bonnes des mauvaises ?
      </p>
      
      {/* Récapitulatif de fin de partie */}
      {showSummary && (
        <Card className="w-full max-w-4xl mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-blue-600">Récapitulatif de votre partie</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowSummary(false);
                  setGameOver(false);
                  initGame();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription>
              Voici un aperçu de votre performance et les pratiques de cybersécurité que vous avez collectées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Statistiques */}
              <div>
                <h3 className="text-lg font-bold mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Score final</span>
                    <span className="text-xl font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Niveau atteint</span>
                    <span className="text-xl font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pratiques collectées</span>
                    <span className="text-xl font-bold">{collectedPractices.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Bonnes pratiques</span>
                    <span className="text-green-600 font-bold">
                      {collectedPractices.filter(p => p.isGood).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mauvaises pratiques</span>
                    <span className="text-red-600 font-bold">
                      {collectedPractices.filter(p => !p.isGood).length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Liste des pratiques collectées */}
              <div>
                <h3 className="text-lg font-bold mb-4">Pratiques collectées</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {collectedPractices.length > 0 ? (
                    collectedPractices.map((practice, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg flex items-start gap-3 
                          ${practice.isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {practice.isGood ? (
                          <Check className="h-5 w-5 mt-1 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{practice.text}</p>
                          <p className="text-sm opacity-75">{practice.explanation}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune pratique collectée</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-3 border-t border-gray-200 flex justify-end">
              <Button 
                onClick={() => {
                  setShowSummary(false);
                  setGameOver(false);
                  initGame();
                }}
              >
                Rejouer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1">
          {/* Zone de jeu */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <canvas 
              ref={canvasRef}
              width={gridWidth * cellSize}
              height={gridHeight * cellSize}
              className="block w-full object-contain"
            />
            
            {/* Contrôles tactiles (pour mobile) */}
            <div className="md:hidden grid grid-cols-3 gap-2 p-2 mt-2">
              <div></div>
              <Button 
                variant="outline" 
                onClick={() => handleDirectionButton('UP')}
                className="aspect-square"
              >
                ↑
              </Button>
              <div></div>
              
              <Button 
                variant="outline" 
                onClick={() => handleDirectionButton('LEFT')}
                className="aspect-square"
              >
                ←
              </Button>
              <Button 
                variant="outline" 
                onClick={togglePause}
                className="aspect-square"
              >
                {isPaused ? '▶' : '⏸'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDirectionButton('RIGHT')}
                className="aspect-square"
              >
                →
              </Button>
              
              <div></div>
              <Button 
                variant="outline" 
                onClick={() => handleDirectionButton('DOWN')}
                className="aspect-square"
              >
                ↓
              </Button>
              <div></div>
            </div>
          </div>
          
          {/* Contrôles et score */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Score:</span>
                <span className="text-xl font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Record:</span>
                <span>{highScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Niveau:</span>
                <span>{level}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={initGame}
                disabled={isLoading || showSummary}
                className="w-24"
              >
                {gameOver ? 'Jouer' : 'Recommencer'}
              </Button>
              
              <Button 
                onClick={togglePause}
                disabled={gameOver || isLoading || showSummary}
                variant="outline"
                className="w-24"
              >
                {isPaused ? 'Reprendre' : 'Pause'}
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowTutorial(true)}
                      variant="ghost"
                      size="icon"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Afficher les règles du jeu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-80">
          {/* Panneau d'information */}
          <Card className="p-4">
            <h3 className="text-lg font-bold mb-2">Dernière Pratique</h3>
            
            {lastEaten ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    {lastEaten.isGood ? (
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {lastEaten.text}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lastEaten.explanation}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${lastEaten.isGood ? 'text-green-600' : 'text-red-600'}`}>
                  {lastEaten.isGood ? '+2 points (Bonne pratique)' : '-1 point (Mauvaise pratique)'}
                </div>
              </motion.div>
            ) : (
              <p className="text-gray-500 mb-4">
                Collectez des pratiques pour voir leur explication ici.
              </p>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium">Progression du niveau</h4>
              <Progress 
                value={(score % levelThreshold) * (100 / levelThreshold)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-500">
                {levelThreshold - (score % levelThreshold)} points avant le niveau {level + 1}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Comment jouer</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>▶ Utilisez les flèches du clavier</li>
                <li>▶ Espace pour pause/reprise</li>
                <li>▶ Lisez le texte de chaque pratique</li>
                <li>▶ Collectez les bonnes pratiques</li>
                <li>▶ Évitez les mauvaises pratiques</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Tutoriel */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comment jouer à Cyber Snake</DialogTitle>
            <DialogDescription>
              Découvrez comment jouer et les règles du jeu
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Objectif du jeu</h4>
              <p className="text-sm text-gray-500">
                Déplacez le serpent pour collecter des pratiques de cybersécurité. Distinguez les bonnes des mauvaises pratiques pour maximiser votre score.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Contrôles</h4>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Flèches directionnelles : déplacer le serpent</li>
                <li>• Espace : Pause / Reprendre le jeu</li>
                <li>• Sur mobile : utilisez les boutons tactiles</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Règles du jeu</h4>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Bonnes pratiques : <span className="text-green-600">+2 points</span></li>
                <li>• Mauvaises pratiques : <span className="text-red-600">-1 point</span></li>
                <li>• Le serpent grandit à chaque pratique collectée</li>
                <li>• Évitez que le serpent ne se morde la queue</li>
                <li>• Le jeu accélère à chaque niveau</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={closeTutorial}>Commencer à jouer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CyberSnakeSimple;