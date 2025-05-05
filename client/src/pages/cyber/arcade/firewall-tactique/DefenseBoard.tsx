import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Play, RefreshCw, Trophy, Terminal, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';

// Types d'attaque
enum AttackType {
  BRUTEFORCE = 'bruteforce',
  MALWARE = 'malware',
  DOS = 'dos',
  LATERAL_MOVEMENT = 'lateral-movement',
  EXPLOIT = 'exploit',
  APT = 'apt',
}

// Interface pour les composants de sécurité
interface SecurityComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'firewall' | 'authentication' | 'segmentation' | 'monitoring' | 'other';
  power: number; // 1-10
  cost: number; // 1-10
  compatibility: string[];
}

// Interface pour les éléments placés sur la grille
interface PlacedComponent {
  id: string;
  componentId: string;
  position: {
    x: number;
    y: number;
  };
}

// Interface pour les données du niveau
interface LevelData {
  gridSize: number;
  budget: number;
  attackTypes: AttackType[];
  requiredDefenseScore: number;
  serverPositions: Array<{x: number, y: number}>;
  clientPositions: Array<{x: number, y: number}>;
  internetPosition: {x: number, y: number};
}

// Propriétés du composant DefenseBoard
interface DefenseBoardProps {
  levelId: string;
  availableComponents: SecurityComponent[];
}

// Données des niveaux
const levelDataMap: Record<string, LevelData> = {
  'level1': {
    gridSize: 6,
    budget: 10,
    attackTypes: [AttackType.BRUTEFORCE, AttackType.MALWARE],
    requiredDefenseScore: 15,
    serverPositions: [{x: 5, y: 5}],
    clientPositions: [{x: 1, y: 1}, {x: 2, y: 1}],
    internetPosition: {x: 0, y: 0}
  },
  'level2': {
    gridSize: 8,
    budget: 15,
    attackTypes: [AttackType.LATERAL_MOVEMENT, AttackType.MALWARE],
    requiredDefenseScore: 25,
    serverPositions: [{x: 6, y: 6}, {x: 7, y: 6}],
    clientPositions: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
    internetPosition: {x: 0, y: 0}
  },
  'level3': {
    gridSize: 8,
    budget: 20,
    attackTypes: [AttackType.EXPLOIT, AttackType.DOS, AttackType.MALWARE],
    requiredDefenseScore: 35,
    serverPositions: [{x: 6, y: 6}, {x: 7, y: 6}, {x: 6, y: 7}],
    clientPositions: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 1, y: 2}],
    internetPosition: {x: 0, y: 0}
  },
  'level4': {
    gridSize: 10,
    budget: 25,
    attackTypes: [AttackType.LATERAL_MOVEMENT, AttackType.EXPLOIT, AttackType.BRUTEFORCE],
    requiredDefenseScore: 45,
    serverPositions: [{x: 8, y: 8}, {x: 9, y: 8}, {x: 8, y: 9}],
    clientPositions: [{x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 2, y: 3}],
    internetPosition: {x: 0, y: 0}
  },
  'level5': {
    gridSize: 10,
    budget: 35,
    attackTypes: [AttackType.APT, AttackType.LATERAL_MOVEMENT, AttackType.EXPLOIT],
    requiredDefenseScore: 60,
    serverPositions: [{x: 8, y: 8}, {x: 9, y: 8}, {x: 8, y: 9}, {x: 9, y: 9}],
    clientPositions: [{x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 2, y: 3}, {x: 3, y: 3}],
    internetPosition: {x: 0, y: 0}
  }
};

// Fonction pour obtenir la description d'une attaque
const getAttackDescription = (attackType: AttackType): string => {
  switch (attackType) {
    case AttackType.BRUTEFORCE:
      return "Attaque par force brute tentant de deviner les identifiants";
    case AttackType.MALWARE:
      return "Logiciel malveillant tentant de s'infiltrer via des pièces jointes d'emails";
    case AttackType.DOS:
      return "Attaque par déni de service visant à saturer vos ressources";
    case AttackType.LATERAL_MOVEMENT:
      return "Mouvement latéral d'un attaquant à l'intérieur du réseau";
    case AttackType.EXPLOIT:
      return "Exploitation d'une vulnérabilité dans les systèmes";
    case AttackType.APT:
      return "Menace persistante avancée avec techniques sophistiquées d'intrusion";
    default:
      return "Attaque inconnue";
  }
};

// Fonction pour obtenir la couleur d'une attaque
const getAttackColor = (attackType: AttackType): string => {
  switch (attackType) {
    case AttackType.BRUTEFORCE:
      return "bg-amber-700/20 text-amber-500";
    case AttackType.MALWARE:
      return "bg-red-700/20 text-red-500";
    case AttackType.DOS:
      return "bg-purple-700/20 text-purple-500";
    case AttackType.LATERAL_MOVEMENT:
      return "bg-blue-700/20 text-blue-500";
    case AttackType.EXPLOIT:
      return "bg-green-700/20 text-green-500";
    case AttackType.APT:
      return "bg-fuchsia-700/20 text-fuchsia-500";
    default:
      return "bg-gray-700/20 text-gray-500";
  }
};

const DefenseBoard: React.FC<DefenseBoardProps> = ({ levelId, availableComponents }) => {
  const levelData = levelDataMap[levelId] || levelDataMap.level1;
  
  // États du jeu
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [spentBudget, setSpentBudget] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<'build' | 'simulation' | 'result'>('build');
  const [defenseScore, setDefenseScore] = useState<number>(0);
  const [simulationLog, setSimulationLog] = useState<Array<{message: string, type: 'info' | 'success' | 'error' | 'warning'}>>([]);
  const [result, setResult] = useState<{success: boolean, score: number, message: string} | null>(null);
  
  // Réinitialiser le jeu lorsque le niveau change
  useEffect(() => {
    resetGame();
  }, [levelId]);
  
  // Calculer le budget dépensé et le score de défense
  useEffect(() => {
    calculateBudgetAndScore();
  }, [placedComponents]);
  
  // Calcule le budget dépensé et le score de défense
  const calculateBudgetAndScore = () => {
    let budget = 0;
    let score = 0;
    
    // Calculer les coûts et scores de base
    placedComponents.forEach(placed => {
      const component = availableComponents.find(c => c.id === placed.componentId);
      if (component) {
        budget += component.cost;
        score += component.power;
      }
    });
    
    // Calculer les bonus de compatibilité
    // Un composant compatible avec un autre placé à proximité donne un bonus de +2 points
    placedComponents.forEach(placed => {
      const component = availableComponents.find(c => c.id === placed.componentId);
      if (component) {
        placedComponents.forEach(other => {
          if (placed.id !== other.id) {
            const otherComponent = availableComponents.find(c => c.id === other.componentId);
            if (otherComponent && component.compatibility.includes(otherComponent.id)) {
              // Vérifier si les composants sont adjacents ou à distance de 1 case
              const distance = Math.abs(placed.position.x - other.position.x) + Math.abs(placed.position.y - other.position.y);
              if (distance <= 2) {
                score += 2; // Bonus pour composants compatibles proches
              }
            }
          }
        });
      }
    });
    
    setSpentBudget(budget);
    setDefenseScore(score);
  };
  
  // Sélectionne un composant à placer
  const handleSelectComponent = (componentId: string) => {
    setSelectedComponent(componentId);
  };
  
  // Place un composant sur la grille
  const handleCellClick = (x: number, y: number) => {
    // Si nous sommes en phase de simulation, on ne peut pas modifier
    if (gamePhase !== 'build') return;
    
    // Si aucun composant n'est sélectionné, ne rien faire
    if (!selectedComponent) return;
    
    // Vérifier si la cellule contient déjà un composant
    const existingComponent = placedComponents.find(
      comp => comp.position.x === x && comp.position.y === y
    );
    
    // Vérifier si c'est une cellule avec un serveur ou un client (non modifiable)
    const isServer = levelData.serverPositions.some(pos => pos.x === x && pos.y === y);
    const isClient = levelData.clientPositions.some(pos => pos.x === x && pos.y === y);
    const isInternet = levelData.internetPosition.x === x && levelData.internetPosition.y === y;
    
    if (isServer || isClient || isInternet) return;
    
    if (existingComponent) {
      // Supprimer le composant existant
      setPlacedComponents(placedComponents.filter(
        comp => !(comp.position.x === x && comp.position.y === y)
      ));
    } else {
      // Ajouter le nouveau composant
      const component = availableComponents.find(c => c.id === selectedComponent);
      if (component) {
        // Vérifier si le budget est suffisant
        const newBudget = spentBudget + component.cost;
        if (newBudget > levelData.budget) {
          // Afficher un message d'erreur (budget insuffisant)
          setSimulationLog(prev => [
            ...prev,
            {
              message: "Budget insuffisant pour placer ce composant",
              type: 'error'
            }
          ]);
          return;
        }
        
        setPlacedComponents([
          ...placedComponents,
          {
            id: `placed-${Date.now()}`,
            componentId: selectedComponent,
            position: { x, y }
          }
        ]);
      }
    }
  };
  
  // Lance la simulation d'attaque
  const runSimulation = () => {
    setGamePhase('simulation');
    setSimulationLog([
      { message: "Démarrage de la simulation...", type: 'info' }
    ]);
    
    // Simulation d'attaque (à intervalles réguliers pour une animation)
    // Cette fonction serait idéalement remplacée par une véritable simulation
    // Pour l'instant, on simule simplement des logs de simulation
    setTimeout(() => {
      setSimulationLog(prev => [...prev, { message: "Analyse de l'architecture réseau...", type: 'info' }]);
    }, 1000);
    
    setTimeout(() => {
      setSimulationLog(prev => [...prev, { message: "Détection des points d'entrée potentiels...", type: 'info' }]);
    }, 2000);
    
    setTimeout(() => {
      // Analyser si les composants nécessaires sont en place selon les types d'attaques
      // Pour simplifier, on vérifie si chaque type d'attaque a au moins un composant qui peut la contrer
      
      const hasFirewall = placedComponents.some(placed => 
        availableComponents.find(c => c.id === placed.componentId)?.category === 'firewall'
      );
      
      const hasAuthentication = placedComponents.some(placed => 
        availableComponents.find(c => c.id === placed.componentId)?.category === 'authentication'
      );
      
      const hasSegmentation = placedComponents.some(placed => 
        availableComponents.find(c => c.id === placed.componentId)?.category === 'segmentation'
      );
      
      const hasMonitoring = placedComponents.some(placed => 
        availableComponents.find(c => c.id === placed.componentId)?.category === 'monitoring'
      );
      
      // Ajouter des messages spécifiques selon les attaques et défenses
      if (levelData.attackTypes.includes(AttackType.BRUTEFORCE)) {
        if (hasAuthentication) {
          setSimulationLog(prev => [...prev, { 
            message: "Tentative d'attaque par force brute détectée et bloquée par l'authentification forte.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "Attaque par force brute réussie ! Aucun système d'authentification robuste détecté.", 
            type: 'error' 
          }]);
        }
      }
      
      if (levelData.attackTypes.includes(AttackType.MALWARE)) {
        if (hasFirewall) {
          setSimulationLog(prev => [...prev, { 
            message: "Tentative d'infiltration de malware détectée et bloquée par le pare-feu.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "Malware infiltré avec succès ! Aucun pare-feu n'a pu bloquer l'attaque.", 
            type: 'error' 
          }]);
        }
      }
      
      if (levelData.attackTypes.includes(AttackType.LATERAL_MOVEMENT)) {
        if (hasSegmentation) {
          setSimulationLog(prev => [...prev, { 
            message: "Tentative de mouvement latéral détectée et limitée par la segmentation réseau.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "Mouvement latéral réussi ! L'attaquant a pu se déplacer librement dans le réseau non segmenté.", 
            type: 'error' 
          }]);
        }
      }
      
      if (levelData.attackTypes.includes(AttackType.DOS)) {
        if (hasFirewall && hasMonitoring) {
          setSimulationLog(prev => [...prev, { 
            message: "Attaque DDoS détectée et atténuée par la combinaison pare-feu et surveillance.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "Attaque DDoS réussie ! Les services sont indisponibles.", 
            type: 'warning' 
          }]);
        }
      }
      
      if (levelData.attackTypes.includes(AttackType.EXPLOIT)) {
        if (hasMonitoring && hasFirewall) {
          setSimulationLog(prev => [...prev, { 
            message: "Tentative d'exploitation de vulnérabilité détectée et bloquée.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "Exploitation de vulnérabilité réussie ! Accès non autorisé obtenu.", 
            type: 'error' 
          }]);
        }
      }
      
      if (levelData.attackTypes.includes(AttackType.APT)) {
        if (hasFirewall && hasAuthentication && hasSegmentation && hasMonitoring) {
          setSimulationLog(prev => [...prev, { 
            message: "Attaque APT détectée et bloquée par la défense en profondeur.", 
            type: 'success' 
          }]);
        } else {
          setSimulationLog(prev => [...prev, { 
            message: "APT installée avec succès ! L'attaquant a maintenant un accès persistant au réseau.", 
            type: 'error' 
          }]);
        }
      }
      
    }, 3000);
    
    // Évaluation finale
    setTimeout(() => {
      setSimulationLog(prev => [...prev, { message: "Analyse des résultats...", type: 'info' }]);
      
      // Vérifier si le score de défense est suffisant
      const success = defenseScore >= levelData.requiredDefenseScore;
      
      // Calculer le pourcentage de réussite
      const scorePercentage = Math.round((defenseScore / levelData.requiredDefenseScore) * 100);
      
      setResult({
        success,
        score: defenseScore,
        message: success 
          ? `Félicitations ! Votre architecture défensive a résisté aux attaques avec un score de ${defenseScore} points (${scorePercentage}% de l'objectif).` 
          : `Échec de la défense. Votre score de ${defenseScore} points (${scorePercentage}% de l'objectif) est insuffisant pour contrer toutes les attaques.`
      });
      
      setGamePhase('result');
    }, 5000);
  };
  
  // Réinitialise le jeu
  const resetGame = () => {
    setSelectedComponent(null);
    setPlacedComponents([]);
    setSpentBudget(0);
    setDefenseScore(0);
    setGamePhase('build');
    setSimulationLog([]);
    setResult(null);
  };
  
  // Rendu du composant pour une cellule de la grille
  const renderGridCell = (x: number, y: number) => {
    // Vérifier si cette cellule contient un composant
    const placedComponent = placedComponents.find(
      comp => comp.position.x === x && comp.position.y === y
    );
    
    // Vérifier si c'est une cellule avec un serveur
    const isServer = levelData.serverPositions.some(pos => pos.x === x && pos.y === y);
    
    // Vérifier si c'est une cellule avec un client
    const isClient = levelData.clientPositions.some(pos => pos.x === x && pos.y === y);
    
    // Vérifier si c'est la cellule "Internet"
    const isInternet = levelData.internetPosition.x === x && levelData.internetPosition.y === y;
    
    // Déterminer la classe CSS en fonction du contenu de la cellule
    let cellClass = "w-12 h-12 flex items-center justify-center border border-indigo-500/20 transition-all";
    
    if (isServer) {
      cellClass += " bg-green-900/40 cursor-not-allowed";
    } else if (isClient) {
      cellClass += " bg-blue-900/40 cursor-not-allowed";
    } else if (isInternet) {
      cellClass += " bg-purple-900/40 cursor-not-allowed";
    } else if (placedComponent) {
      cellClass += " bg-indigo-900/40";
    } else {
      cellClass += " bg-slate-900/60 hover:bg-indigo-900/20 cursor-pointer";
    }
    
    return (
      <div 
        key={`cell-${x}-${y}`} 
        className={cellClass}
        onClick={() => handleCellClick(x, y)}
      >
        {isServer && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Server className="h-7 w-7 text-green-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Serveur - À protéger</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {isClient && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Terminal className="h-6 w-6 text-blue-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Poste client</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {isInternet && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Network className="h-8 w-8 text-purple-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Internet - Source des attaques</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {placedComponent && !isServer && !isClient && !isInternet && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {availableComponents.find(c => c.id === placedComponent.componentId)?.icon || null}
              </TooltipTrigger>
              <TooltipContent>
                <p>{availableComponents.find(c => c.id === placedComponent.componentId)?.name || "Composant"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-slate-900/60 p-4 rounded-lg border border-indigo-500/20">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl text-white font-medium">Architecture défensive</h3>
          <p className="text-indigo-200 text-sm">Placez vos composants de sécurité sur la grille</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-900/20 px-3 py-1 rounded-lg">
            <span className="text-indigo-300 text-sm font-medium">Budget: </span>
            <span className={`text-white ${spentBudget > levelData.budget ? 'text-red-400' : ''}`}>
              {spentBudget}/{levelData.budget}
            </span>
          </div>
          
          <div className="bg-indigo-900/20 px-3 py-1 rounded-lg">
            <span className="text-indigo-300 text-sm font-medium">Score de défense: </span>
            <span className="text-white">{defenseScore}/{levelData.requiredDefenseScore}</span>
          </div>
          
          {gamePhase === 'build' && (
            <Button 
              onClick={runSimulation} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={spentBudget > levelData.budget}
            >
              <Play className="h-4 w-4 mr-2" />
              Lancer l'attaque
            </Button>
          )}
          
          {gamePhase !== 'build' && (
            <Button 
              onClick={resetGame} 
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
          )}
        </div>
      </div>
      
      {/* Alertes sur les menaces */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">Menaces détectées:</h4>
        <div className="flex flex-wrap gap-2">
          {levelData.attackTypes.map((attackType) => (
            <Badge key={attackType} className={getAttackColor(attackType)}>
              {getAttackDescription(attackType)}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Grille de jeu */}
        <div className="flex-1">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-indigo-500/20">
            <div 
              className="grid gap-1" 
              style={{ 
                gridTemplateColumns: `repeat(${levelData.gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${levelData.gridSize}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: levelData.gridSize * levelData.gridSize }).map((_, index) => {
                const x = index % levelData.gridSize;
                const y = Math.floor(index / levelData.gridSize);
                return renderGridCell(x, y);
              })}
            </div>
          </div>
          
          {/* Résultat de la simulation */}
          {gamePhase === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <Trophy className="h-6 w-6 text-green-400 mr-2" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-400 mr-2" />
                  )}
                  <h3 className="text-lg font-medium text-white">
                    {result.success ? 'Niveau réussi !' : 'Niveau échoué'}
                  </h3>
                </div>
                <p className="text-indigo-100">{result.message}</p>
                
                {!result.success && (
                  <div className="mt-3 text-indigo-200">
                    <h4 className="font-medium mb-1">Améliorations suggérées:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {!placedComponents.some(placed => 
                        availableComponents.find(c => c.id === placed.componentId)?.category === 'firewall'
                      ) && (
                        <li>Ajoutez un pare-feu pour filtrer le trafic malveillant</li>
                      )}
                      {!placedComponents.some(placed => 
                        availableComponents.find(c => c.id === placed.componentId)?.category === 'authentication'
                      ) && (
                        <li>Ajoutez un système d'authentification pour bloquer les accès non autorisés</li>
                      )}
                      {!placedComponents.some(placed => 
                        availableComponents.find(c => c.id === placed.componentId)?.category === 'segmentation'
                      ) && (
                        <li>Ajoutez de la segmentation réseau pour limiter la propagation des attaques</li>
                      )}
                      {!placedComponents.some(placed => 
                        availableComponents.find(c => c.id === placed.componentId)?.category === 'monitoring'
                      ) && (
                        <li>Ajoutez des solutions de surveillance pour détecter les attaques</li>
                      )}
                      {defenseScore < levelData.requiredDefenseScore && (
                        <li>Utilisez des composants plus puissants ou créez des synergies entre composants compatibles</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Panneau latéral */}
        <div className="w-full md:w-80 shrink-0">
          {/* Composants disponibles */}
          {gamePhase === 'build' && (
            <Card className="bg-slate-900/60 border-indigo-500/20">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">Composants disponibles</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {availableComponents.map((component) => (
                    <div
                      key={component.id}
                      className={`p-2 rounded-lg border transition-all cursor-pointer
                        ${selectedComponent === component.id 
                          ? 'bg-indigo-700/30 border-indigo-400' 
                          : 'bg-slate-800/60 border-indigo-500/20 hover:bg-indigo-900/30'
                        }`}
                      onClick={() => handleSelectComponent(component.id)}
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-indigo-950 mr-3">
                          {component.icon}
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">{component.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-indigo-300">Coût: {component.cost}</span>
                            <span className="text-xs text-indigo-300">Puissance: {component.power}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Journal de simulation */}
          {(gamePhase === 'simulation' || gamePhase === 'result') && (
            <Card className="bg-slate-900/60 border-indigo-500/20">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Journal de simulation
                </h3>
                <ScrollArea className="h-[400px] mt-3">
                  {simulationLog.map((log, index) => (
                    <div key={index} className="mb-2">
                      {log.type === 'info' && (
                        <div className="flex items-start">
                          <div className="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                          </div>
                          <p className="text-blue-200 text-sm">{log.message}</p>
                        </div>
                      )}
                      {log.type === 'success' && (
                        <div className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                          <p className="text-green-200 text-sm">{log.message}</p>
                        </div>
                      )}
                      {log.type === 'warning' && (
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5" />
                          <p className="text-yellow-200 text-sm">{log.message}</p>
                        </div>
                      )}
                      {log.type === 'error' && (
                        <div className="flex items-start">
                          <XCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5" />
                          <p className="text-red-200 text-sm">{log.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefenseBoard;