import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle, RefreshCw, HelpCircle, MessageSquare, ArrowRight, Check, X, Network } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  NetworkPuzzleGameProps, 
  NetworkLevel,
  NetworkNode,
  NetworkConnection,
  GameState,
  FirewallConfig
} from './types';
import { getLevels } from './data';

// Composant pour les nœuds du réseau
const NetworkNodeComponent: React.FC<{
  node: NetworkNode;
  isSelected: boolean;
  onClick: () => void;
  onConfigClick?: () => void;
}> = ({ node, isSelected, onClick, onConfigClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`absolute p-2 rounded-lg cursor-pointer transition-all ${
              isSelected 
                ? 'bg-blue-600 text-white shadow-lg scale-110' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            style={{ 
              left: `${node.position.x}px`, 
              top: `${node.position.y}px`,
              transform: 'translate(-50%, -50%)',
              width: '70px',
              height: '70px',
              zIndex: isSelected ? 20 : 10
            }}
            onClick={onClick}
          >
            <div className="flex flex-col items-center justify-center h-full">
              {node.icon}
              <span className="text-xs mt-1 line-clamp-1">{node.name}</span>
              {node.firewall && (
                <button 
                  className={`absolute -top-1 -right-1 p-1 rounded-full ${
                    node.firewall.isConfigured ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onConfigClick) onConfigClick();
                  }}
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 max-w-xs">
            <p className="font-bold">{node.name}</p>
            <p className="text-xs">{node.description}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs mr-2">Niveau de sécurité:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full mx-0.5 ${
                      i < node.securityLevel ? 'bg-green-500' : 'bg-gray-400'
                    }`} 
                  />
                ))}
              </div>
            </div>
            {node.firewall && (
              <div className="text-xs mt-1">
                <div className="font-semibold">Configuration du pare-feu:</div>
                <div className="flex flex-col mt-1">
                  <span className="text-green-400">Autorisé: {node.firewall.allowedTraffic.join(', ')}</span>
                  <span className="text-red-400">Bloqué: {node.firewall.blockedTraffic.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Composant pour les connexions entre nœuds
const ConnectionLine: React.FC<{
  sourceNode: NetworkNode;
  targetNode: NetworkNode;
  isRequired: boolean;
  isSecure: boolean;
  type: string;
  label?: string;
}> = ({ sourceNode, targetNode, isRequired, isSecure, type, label }) => {
  const sourceX = sourceNode.position.x;
  const sourceY = sourceNode.position.y;
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y;
  
  // Calculer le point milieu pour le label
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Calculer l'angle pour déterminer l'offset du label
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const labelOffsetX = Math.sin(angle) * 10;
  const labelOffsetY = -Math.cos(angle) * 10;

  return (
    <>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={isRequired ? (isSecure ? '#22c55e' : '#f87171') : '#94a3b8'}
        strokeWidth={isRequired ? 2 : 1}
        strokeDasharray={isRequired ? 'none' : '4,4'}
        className="transition-all duration-300"
      />
      {label && (
        <text
          x={midX + labelOffsetX}
          y={midY + labelOffsetY}
          fill="#e2e8f0"
          fontSize="10"
          textAnchor="middle"
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      )}
      {/* Indicateur de type de connexion */}
      <circle
        cx={midX}
        cy={midY}
        r={4}
        fill={
          type === 'data' 
            ? '#3b82f6' // Bleu pour les données
            : type === 'control' 
              ? '#a855f7' // Violet pour le contrôle
              : '#f59e0b' // Orange pour internet
        }
      />
    </>
  );
};

// Composant pour configurer un pare-feu
const FirewallConfigDialog: React.FC<{
  firewall: FirewallConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: FirewallConfig) => void;
}> = ({ firewall, isOpen, onClose, onSave }) => {
  const [allowedTraffic, setAllowedTraffic] = useState<string[]>(firewall.allowedTraffic);
  const [blockedTraffic, setBlockedTraffic] = useState<string[]>(firewall.blockedTraffic);
  
  const trafficTypes = ['HTTP', 'HTTPS', 'FTP', 'TELNET', 'SSH', 'SQL', 'VPN', 'ADMIN', 'API', 'BACKUP'];
  
  const toggleTraffic = (type: string) => {
    if (allowedTraffic.includes(type)) {
      setAllowedTraffic(allowedTraffic.filter(t => t !== type));
      setBlockedTraffic([...blockedTraffic, type]);
    } else if (blockedTraffic.includes(type)) {
      setBlockedTraffic(blockedTraffic.filter(t => t !== type));
    } else {
      setAllowedTraffic([...allowedTraffic, type]);
    }
  };
  
  const handleSave = () => {
    onSave({
      allowedTraffic,
      blockedTraffic,
      isConfigured: true
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Configuration du pare-feu</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configurez les règles de trafic pour ce pare-feu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium mb-2">Règles de trafic</h3>
            <div className="grid grid-cols-2 gap-2">
              {trafficTypes.map(type => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className={`flex justify-between items-center ${
                    allowedTraffic.includes(type)
                      ? 'bg-green-900/30 text-green-400 border-green-700'
                      : blockedTraffic.includes(type)
                        ? 'bg-red-900/30 text-red-400 border-red-700'
                        : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}
                  onClick={() => toggleTraffic(type)}
                >
                  <span>{type}</span>
                  {allowedTraffic.includes(type) && <Check className="h-4 w-4 ml-2 text-green-400" />}
                  {blockedTraffic.includes(type) && <X className="h-4 w-4 ml-2 text-red-400" />}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <div className="bg-gray-700 p-2 rounded flex-1">
              <h4 className="text-xs font-medium text-green-400 mb-1">Trafic autorisé</h4>
              <div className="flex flex-wrap gap-1">
                {allowedTraffic.length > 0 ? (
                  allowedTraffic.map(type => (
                    <Badge key={type} className="bg-green-900/50 text-green-400">{type}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Tout est bloqué</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-700 p-2 rounded flex-1">
              <h4 className="text-xs font-medium text-red-400 mb-1">Trafic bloqué</h4>
              <div className="flex flex-wrap gap-1">
                {blockedTraffic.length > 0 ? (
                  blockedTraffic.map(type => (
                    <Badge key={type} className="bg-red-900/50 text-red-400">{type}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Tout est autorisé</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>Appliquer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Composant principal du jeu
const NetworkPuzzleGame: React.FC<NetworkPuzzleGameProps> = ({ difficulty = 'easy', onGameEnd }) => {
  // État du jeu
  const [gameState, setGameState] = useState<GameState>({
    currentLevelIndex: 0,
    levels: [],
    currentConnections: [],
    score: 0,
    selectedNode: null,
    isComplete: false,
    feedbackVisible: false,
    feedbackMessage: '',
    showAIHelp: false,
    aiMessage: '',
    aiInputValue: ''
  });
  
  // État des pare-feu
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedFirewall, setSelectedFirewall] = useState<{ node: NetworkNode; index: number } | null>(null);
  
  // Charger les niveaux
  useEffect(() => {
    const levels = getLevels();
    let startLevel = 0;
    
    // Déterminer le niveau de départ en fonction de la difficulté
    if (difficulty === 'medium') startLevel = 1;
    else if (difficulty === 'hard') startLevel = 2;
    
    setGameState(prev => ({
      ...prev,
      levels,
      currentLevelIndex: startLevel
    }));
  }, [difficulty]);
  
  // Obtenir le niveau actuel
  const currentLevel = gameState.levels[gameState.currentLevelIndex];
  
  // Gestionnaire de clic sur un nœud
  const handleNodeClick = useCallback((nodeId: string) => {
    if (gameState.selectedNode === null) {
      // Premier nœud sélectionné
      setGameState(prev => ({
        ...prev,
        selectedNode: nodeId
      }));
    } else if (gameState.selectedNode === nodeId) {
      // Désélectionner le même nœud
      setGameState(prev => ({
        ...prev,
        selectedNode: null
      }));
    } else {
      // Deuxième nœud sélectionné - créer une connexion
      const sourceNode = currentLevel.nodes.find(n => n.id === gameState.selectedNode);
      const targetNode = currentLevel.nodes.find(n => n.id === nodeId);
      
      if (sourceNode && targetNode) {
        // Vérifier si la connexion existe déjà
        const existingConnection = gameState.currentConnections.find(
          conn => (conn.source === sourceNode.id && conn.target === targetNode.id) ||
                 (conn.source === targetNode.id && conn.target === sourceNode.id)
        );
        
        if (existingConnection) {
          // Supprimer la connexion existante
          setGameState(prev => ({
            ...prev,
            selectedNode: null,
            currentConnections: prev.currentConnections.filter(conn => conn.id !== existingConnection.id)
          }));
        } else {
          // Ajouter une nouvelle connexion
          const newConnection: NetworkConnection = {
            id: `${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            isRequired: false, // Sera évalué lors de la vérification
            isSecure: true, // Sera évalué lors de la vérification
            type: 'data', // Type par défaut
            label: ''
          };
          
          setGameState(prev => ({
            ...prev,
            selectedNode: null,
            currentConnections: [...prev.currentConnections, newConnection]
          }));
        }
      }
    }
  }, [gameState.selectedNode, gameState.currentConnections, currentLevel]);
  
  // Gestionnaire pour ouvrir le dialogue de configuration du pare-feu
  const handleConfigClick = useCallback((node: NetworkNode, index: number) => {
    setSelectedFirewall({ node, index });
    setConfigDialogOpen(true);
  }, []);
  
  // Gestionnaire pour sauvegarder la configuration du pare-feu
  const handleSaveFirewallConfig = useCallback((config: FirewallConfig) => {
    if (!selectedFirewall) return;
    
    // Mettre à jour la configuration du pare-feu
    const updatedNodes = [...currentLevel.nodes];
    const nodeIndex = updatedNodes.findIndex(n => n.id === selectedFirewall.node.id);
    
    if (nodeIndex >= 0 && updatedNodes[nodeIndex].firewall) {
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        firewall: config
      };
      
      // Mettre à jour les niveaux dans l'état du jeu
      const updatedLevels = [...gameState.levels];
      updatedLevels[gameState.currentLevelIndex] = {
        ...updatedLevels[gameState.currentLevelIndex],
        nodes: updatedNodes
      };
      
      setGameState(prev => ({
        ...prev,
        levels: updatedLevels
      }));
    }
  }, [selectedFirewall, currentLevel, gameState.levels, gameState.currentLevelIndex]);
  
  // Vérifier la solution du niveau
  const checkSolution = useCallback(() => {
    if (!currentLevel) return;
    
    let isCorrect = true;
    let feedbackItems: string[] = [];
    let score = 0;
    
    // Vérifier les connexions requises
    for (const [source, target] of currentLevel.requiredConnections) {
      const hasConnection = gameState.currentConnections.some(
        conn => (conn.source === source && conn.target === target) ||
               (conn.source === target && conn.target === source)
      );
      
      if (!hasConnection) {
        isCorrect = false;
        const sourceNode = currentLevel.nodes.find(n => n.id === source);
        const targetNode = currentLevel.nodes.find(n => n.id === target);
        
        if (sourceNode && targetNode) {
          feedbackItems.push(`❌ Connexion manquante entre ${sourceNode.name} et ${targetNode.name}`);
        }
      }
    }
    
    // Vérifier les connexions interdites
    for (const [source, target] of currentLevel.forbiddenConnections) {
      const hasConnection = gameState.currentConnections.some(
        conn => (conn.source === source && conn.target === target) ||
               (conn.source === target && conn.target === source)
      );
      
      if (hasConnection) {
        isCorrect = false;
        const sourceNode = currentLevel.nodes.find(n => n.id === source);
        const targetNode = currentLevel.nodes.find(n => n.id === target);
        
        if (sourceNode && targetNode) {
          feedbackItems.push(`❌ Connexion interdite entre ${sourceNode.name} et ${targetNode.name}`);
        }
      }
    }
    
    // Vérifier la configuration des pare-feu
    const firewallNodes = currentLevel.nodes.filter(node => node.firewall);
    for (const node of firewallNodes) {
      if (node.firewall && !node.firewall.isConfigured) {
        isCorrect = false;
        feedbackItems.push(`❌ Le pare-feu "${node.name}" n'est pas configuré`);
      }
    }
    
    // Calculer le score
    if (isCorrect) {
      score = currentLevel.maxScore;
      feedbackItems.unshift(`✅ Félicitations ! Vous avez correctement construit l'infrastructure réseau.`);
      
      // Feedback positif
      for (const rule of currentLevel.securityRules) {
        feedbackItems.push(`✅ ${rule}`);
      }
    } else {
      // Score partiel basé sur les connexions correctes
      const requiredConnectionsCount = currentLevel.requiredConnections.length;
      const correctConnectionsCount = currentLevel.requiredConnections.filter(([source, target]) => {
        return gameState.currentConnections.some(
          conn => (conn.source === source && conn.target === target) ||
                 (conn.source === target && conn.target === source)
        );
      }).length;
      
      score = Math.floor((correctConnectionsCount / requiredConnectionsCount) * currentLevel.maxScore);
      
      // Ajouter des indices
      if (feedbackItems.length < 3 && currentLevel.hints.length > 0) {
        feedbackItems.push('💡 Indices :');
        for (const hint of currentLevel.hints.slice(0, 2)) {
          feedbackItems.push(`- ${hint}`);
        }
      }
    }
    
    // Mettre à jour l'état du jeu
    setGameState(prev => ({
      ...prev,
      score: prev.score + score,
      isComplete: isCorrect,
      feedbackVisible: true,
      feedbackMessage: feedbackItems.join('\n\n')
    }));
  }, [currentLevel, gameState.currentConnections]);
  
  // Passer au niveau suivant
  const goToNextLevel = useCallback(() => {
    if (gameState.currentLevelIndex < gameState.levels.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex + 1,
        currentConnections: [],
        selectedNode: null,
        isComplete: false,
        feedbackVisible: false,
        feedbackMessage: ''
      }));
    } else {
      // Jeu terminé
      if (onGameEnd) {
        onGameEnd(gameState.score);
      }
    }
  }, [gameState.currentLevelIndex, gameState.levels.length, gameState.score, onGameEnd]);
  
  // Réinitialiser le niveau actuel
  const resetLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentConnections: [],
      selectedNode: null,
      isComplete: false,
      feedbackVisible: false,
      feedbackMessage: ''
    }));
  }, []);
  
  // Obtenir de l'aide de l'IA via Azure OpenAI
  const getAIHelp = useCallback(async () => {
    try {
      setGameState(prev => ({
        ...prev,
        showAIHelp: true,
        aiMessage: "Analyse de votre infrastructure en cours..."
      }));
      
      // Préparer les données de la configuration réseau actuelle
      const configuredFirewalls = {};
      currentLevel.nodes.forEach(node => {
        if (node.firewall) {
          configuredFirewalls[node.id] = node.firewall;
        }
      });
      
      // Créer la requête vers l'API
      const response = await fetch('/api/cyber/network-puzzle/ai-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Analyse mon réseau actuel et donne-moi des conseils pour l'améliorer.",
          networkConfig: {
            nodes: currentLevel.nodes,
            connections: currentLevel.connections,
          },
          currentLevel,
          placedConnections: gameState.currentConnections,
          configuredFirewalls
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour le message de l'IA avec la réponse de l'API
      setGameState(prev => ({
        ...prev,
        aiMessage: data.content || "Voici mon analyse de votre réseau actuel..."
      }));
    } catch (error) {
      console.error("Erreur lors de la demande d'aide IA:", error);
      
      // En cas d'erreur, générer une réponse locale de secours
      const connectedNodeIds = new Set<string>();
      gameState.currentConnections.forEach(conn => {
        connectedNodeIds.add(conn.source);
        connectedNodeIds.add(conn.target);
      });
      
      let helpMessage = "Je ne peux pas me connecter au service d'analyse avancée, mais voici quelques observations sur votre réseau :\n\n";
      
      // Identifier les nœuds non connectés
      const unconnectedNodes = currentLevel.nodes.filter(node => !connectedNodeIds.has(node.id));
      if (unconnectedNodes.length > 0) {
        helpMessage += `J'ai remarqué que ${unconnectedNodes.length} éléments ne sont pas connectés au réseau.\n`;
      }
      
      // Vérifier les pare-feu non configurés
      const unconfiguredFirewalls = currentLevel.nodes.filter(
        node => node.firewall && !node.firewall.isConfigured
      );
      
      if (unconfiguredFirewalls.length > 0) {
        helpMessage += `\nN'oubliez pas de configurer tous les pare-feu pour renforcer la sécurité.\n`;
      }
      
      // Ajouter un conseil de sécurité général
      helpMessage += `\nConseil : ${currentLevel.hints[Math.floor(Math.random() * currentLevel.hints.length)]}`;
      
      setGameState(prev => ({
        ...prev,
        aiMessage: helpMessage
      }));
    }
  }, [currentLevel, gameState.currentConnections]);
  
  // Soumettre une question à l'IA via Azure OpenAI
  const submitAIQuestion = useCallback(async () => {
    if (!gameState.aiInputValue.trim()) return;
    
    try {
      const userQuestion = gameState.aiInputValue;
      
      setGameState(prev => ({
        ...prev,
        aiMessage: `Analyse de votre question : "${userQuestion}"...`,
        aiInputValue: ''
      }));
      
      // Préparer les données de la configuration réseau actuelle
      const configuredFirewalls = {};
      currentLevel.nodes.forEach(node => {
        if (node.firewall) {
          configuredFirewalls[node.id] = node.firewall;
        }
      });
      
      // Créer la requête vers l'API
      const response = await fetch('/api/cyber/network-puzzle/ai-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuestion,
          networkConfig: {
            nodes: currentLevel.nodes,
            connections: currentLevel.connections,
          },
          currentLevel,
          placedConnections: gameState.currentConnections,
          configuredFirewalls
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour le message de l'IA avec la réponse de l'API
      setGameState(prev => ({
        ...prev,
        aiMessage: data.content || `Je n'ai pas pu générer une réponse à votre question: "${userQuestion}"`
      }));
    } catch (error) {
      console.error("Erreur lors de la demande à l'IA:", error);
      
      // En cas d'erreur, générer une réponse locale de secours
      let fallbackResponse = "";
      const userQuestion = gameState.aiInputValue.toLowerCase();
      
      if (userQuestion.includes("pare-feu") || userQuestion.includes("firewall")) {
        fallbackResponse = `Les pare-feu sont essentiels pour contrôler le trafic réseau. Assurez-vous qu'ils soient correctement configurés pour votre infrastructure.`;
      } 
      else if (userQuestion.includes("connexion") || userQuestion.includes("relier")) {
        fallbackResponse = `Pour connecter des éléments, cliquez sur le premier nœud puis sur le second. Pour supprimer une connexion, répétez l'opération sur une connexion existante.`;
      }
      else if (userQuestion.includes("niveau") || userQuestion.includes("réussir")) {
        fallbackResponse = `Pour réussir ce niveau, respectez les contraintes indiquées et assurez-vous que toutes les connexions requises sont établies.`;
      }
      else {
        fallbackResponse = `Je ne peux pas me connecter au service pour répondre précisément. Essayez des questions sur les pare-feu, les connexions ou les objectifs du niveau.`;
      }
      
      setGameState(prev => ({
        ...prev,
        aiMessage: fallbackResponse
      }));
    }
  }, [gameState.aiInputValue, currentLevel, gameState.currentConnections]);
  
  // Si aucun niveau n'est chargé, afficher un loader
  if (!currentLevel) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <Network className="w-12 h-12 text-blue-400 mb-4" />
          <p className="text-gray-400">Chargement du niveau...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* En-tête du niveau */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{currentLevel.name}</h2>
            <p className="text-sm text-gray-300">
              Niveau {gameState.currentLevelIndex + 1}/{gameState.levels.length}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gray-700 gap-1.5 px-3 py-1">
              <span className="text-white font-semibold">{gameState.score} pts</span>
            </Badge>
            
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={resetLevel}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={() => setGameState(prev => ({ ...prev, showAIHelp: true }))}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Aide IA
            </Button>
          </div>
        </div>
      </div>
      
      {/* Description du niveau */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <h3 className="font-semibold text-white mb-2">Objectif</h3>
        <p className="text-gray-300 mb-3">{currentLevel.description}</p>
        
        <div className="mt-4">
          <Tabs defaultValue="constraints">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="constraints">Contraintes</TabsTrigger>
              <TabsTrigger value="rules">Règles de sécurité</TabsTrigger>
            </TabsList>
            <TabsContent value="constraints" className="mt-2 bg-gray-700/50 rounded p-3">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {currentLevel.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="rules" className="mt-2 bg-gray-700/50 rounded p-3">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {currentLevel.securityRules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Zone de jeu */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Zone de placement du réseau (gauche) */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800 border-gray-700 shadow-lg p-4">
            <h3 className="font-semibold text-white mb-4">Zone de construction du réseau</h3>
            
            {/* Canvas pour le réseau */}
            <div 
              className="relative bg-gray-900 rounded-lg mb-4" 
              style={{ 
                height: '600px',
                backgroundImage: 'radial-gradient(circle, rgba(66, 71, 91, 0.5) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            >
              {/* Nœuds du réseau */}
              {currentLevel.nodes.map((node, index) => (
                <NetworkNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={gameState.selectedNode === node.id}
                  onClick={() => handleNodeClick(node.id)}
                  onConfigClick={node.firewall ? () => handleConfigClick(node, index) : undefined}
                />
              ))}
              
              {/* Connexions */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
                {gameState.currentConnections.map(connection => {
                  const sourceNode = currentLevel.nodes.find(n => n.id === connection.source);
                  const targetNode = currentLevel.nodes.find(n => n.id === connection.target);
                  
                  if (sourceNode && targetNode) {
                    // Vérifier si la connexion est requise
                    const isRequired = currentLevel.requiredConnections.some(
                      ([src, tgt]) => (src === sourceNode.id && tgt === targetNode.id) ||
                                     (src === targetNode.id && tgt === sourceNode.id)
                    );
                    
                    // Vérifier si la connexion est interdite
                    const isForbidden = currentLevel.forbiddenConnections.some(
                      ([src, tgt]) => (src === sourceNode.id && tgt === targetNode.id) ||
                                     (src === targetNode.id && tgt === sourceNode.id)
                    );
                    
                    return (
                      <ConnectionLine
                        key={connection.id}
                        sourceNode={sourceNode}
                        targetNode={targetNode}
                        isRequired={isRequired}
                        isSecure={!isForbidden}
                        type={connection.type}
                        label={connection.label}
                      />
                    );
                  }
                  
                  return null;
                })}
              </svg>
              
              {/* Instruction si aucune connexion */}
              {gameState.currentConnections.length === 0 && !gameState.selectedNode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-center p-6 rounded-lg bg-gray-800/30 border border-dashed border-gray-700 max-w-sm">
                    <Network className="w-12 h-12 mx-auto mb-2 text-blue-400/50" />
                    <p>Cliquez sur un élément puis sur un autre pour créer une connexion.</p>
                  </div>
                </div>
              )}
              
              {/* Indication de sélection */}
              {gameState.selectedNode && (
                <div className="absolute bottom-4 left-4 bg-blue-600/80 px-3 py-1.5 rounded text-white text-sm">
                  <span>Cliquez sur un autre élément pour établir une connexion</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {gameState.selectedNode ? (
                  `Élément sélectionné: ${currentLevel.nodes.find(n => n.id === gameState.selectedNode)?.name}`
                ) : (
                  `${gameState.currentConnections.length} connexions établies`
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  onClick={resetLevel}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                
                <Button
                  onClick={checkSolution}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={gameState.isComplete}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Vérifier
                </Button>
                
                {gameState.isComplete && (
                  <Button
                    onClick={goToNextLevel}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {gameState.currentLevelIndex < gameState.levels.length - 1 ? 
                      'Niveau suivant' : 
                      'Terminer'
                    }
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Zone d'informations et d'aide (droite) */}
        <div className="lg:col-span-2">
          {gameState.feedbackVisible ? (
            <Card className="bg-gray-800 border-gray-700 shadow-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Analyse de votre réseau</h3>
                <Badge className={`${gameState.isComplete ? 'bg-green-700' : 'bg-amber-700'} text-white`}>
                  {gameState.isComplete ? 'Réussi !' : 'À améliorer'}
                </Badge>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm whitespace-pre-line">
                {gameState.feedbackMessage}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  onClick={() => setGameState(prev => ({ ...prev, feedbackVisible: false }))}
                >
                  Fermer
                </Button>
                
                {gameState.isComplete && (
                  <Button
                    onClick={goToNextLevel}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {gameState.currentLevelIndex < gameState.levels.length - 1 ? 
                      'Niveau suivant' : 
                      'Terminer'
                    }
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700 shadow-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Éléments du réseau</h3>
                <Badge className="bg-gray-700 text-white">
                  {currentLevel.nodes.length} composants
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {currentLevel.nodes.map(node => (
                  <div 
                    key={node.id}
                    className="bg-gray-700 rounded p-2 flex items-center cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      node.type === 'firewall' ? 'bg-red-900/30' :
                      node.type === 'server' ? 'bg-blue-900/30' :
                      node.type === 'database' ? 'bg-purple-900/30' :
                      node.type === 'client' ? 'bg-green-900/30' :
                      node.type === 'router' ? 'bg-amber-900/30' :
                      node.type === 'cloud' ? 'bg-cyan-900/30' :
                      'bg-gray-600'
                    }`}>
                      {node.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">{node.name}</h4>
                      <p className="text-gray-400 text-xs">{node.description}</p>
                    </div>
                    {node.firewall && (
                      <div className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        node.firewall.isConfigured ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
                      }`}>
                        {node.firewall.isConfigured ? 'Configuré' : 'Non configuré'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700 mt-4 pt-4">
                <h4 className="text-sm font-medium text-white mb-2">Légende</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-gray-300">Connexion requise</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-gray-300">Connexion interdite</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-gray-300">Connexion données</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                    <span className="text-gray-300">Connexion internet</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Aide IA */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                Assistant réseau IA
              </h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={getAIHelp}
                className="text-blue-400 hover:text-blue-300"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm text-gray-300 whitespace-pre-line min-h-[100px] max-h-[200px] overflow-y-auto">
              {gameState.aiMessage || "Bonjour ! Je suis votre assistant IA pour concevoir une infrastructure réseau sécurisée. Demandez-moi de l'aide ou analysez votre réseau actuel."}
            </div>
            
            <div className="flex space-x-2">
              <Textarea
                placeholder="Posez une question sur les réseaux ou la sécurité..."
                className="bg-gray-700 border-gray-600 text-white resize-none"
                value={gameState.aiInputValue}
                onChange={(e) => setGameState(prev => ({ ...prev, aiInputValue: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitAIQuestion();
                  }
                }}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={submitAIQuestion}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Dialog de configuration du pare-feu */}
      {selectedFirewall && (
        <FirewallConfigDialog
          firewall={selectedFirewall.node.firewall!}
          isOpen={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          onSave={handleSaveFirewallConfig}
        />
      )}
      
      {/* Dialogue de feedback */}
      <Dialog 
        open={gameState.feedbackVisible} 
        onOpenChange={(open) => setGameState(prev => ({ ...prev, feedbackVisible: open }))}
      >
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {gameState.isComplete ? 'Excellent travail !' : 'Analyse de votre réseau'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {gameState.isComplete 
                ? `Vous avez terminé ce niveau et gagné ${gameState.score} points !` 
                : 'Voici les points à améliorer dans votre architecture réseau'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 bg-gray-700/50 rounded-lg p-4 text-sm whitespace-pre-line max-h-96 overflow-y-auto">
            {gameState.feedbackMessage}
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setGameState(prev => ({ ...prev, feedbackVisible: false }))}
            >
              Fermer
            </Button>
            
            {gameState.isComplete && (
              <Button
                onClick={goToNextLevel}
                className="bg-green-600 hover:bg-green-700"
              >
                {gameState.currentLevelIndex < gameState.levels.length - 1 ? 
                  'Niveau suivant' : 
                  'Terminer'
                }
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkPuzzleGame;