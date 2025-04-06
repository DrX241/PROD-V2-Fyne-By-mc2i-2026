import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Wifi, Database, Server, Bug, Divide, Skull, HardDrive, Network, Cloud, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Types d'attaques
enum AttackType {
  DDOS = 'DDoS',
  MALWARE = 'Malware',
  RANSOMWARE = 'Ransomware',
  SQL_INJECTION = 'SQL Injection',
  XSS = 'Cross-Site Scripting',
  PHISHING = 'Phishing',
  MITM = 'Man-in-the-Middle'
}

// Types de défenses
enum DefenseType {
  FIREWALL = 'Firewall',
  IDS = 'Intrusion Detection',
  PROXY = 'Proxy',
  ANTIVIRUS = 'Antivirus',
  WAF = 'Web Application Firewall',
  ENCRYPTION = 'Encryption'
}

// Types d'infrastructures à protéger
enum InfraType {
  SERVER = 'Serveur',
  DATABASE = 'Base de données',
  WORKSTATION = 'Poste client',
  CLOUD = 'Cloud'
}

// Statut d'un node
enum NodeStatus {
  NORMAL = 'normal',
  UNDER_ATTACK = 'under-attack',
  COMPROMISED = 'compromised',
  PROTECTED = 'protected'
}

// Interface pour une attaque
interface Attack {
  id: string;
  type: AttackType;
  strength: number;
  speed: number;
  position: { x: number; y: number };
  targetNodeId: string;
  pathToTarget: string[];
  blocked: boolean;
  icon: React.ReactNode;
  color: string;
}

// Interface pour une défense
interface Defense {
  id: string;
  type: DefenseType;
  strength: number;
  radius: number;
  position: { x: number; y: number };
  level: number;
  cost: number;
  activeAttacks: string[];
  icon: React.ReactNode;
  color: string;
  effectiveAgainst: AttackType[];
}

// Interface pour un noeud du réseau
interface NetworkNode {
  id: string;
  type: InfraType;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  status: NodeStatus;
  connectedTo: string[];
  importance: number; // 1-10, pour déterminer la priorité de défense
  icon: React.ReactNode;
}

// Interface pour une vague d'attaques
interface AttackWave {
  id: number;
  name: string;
  description: string;
  attackTypes: AttackType[];
  count: number;
  strength: number;
  speed: number;
  completed: boolean;
}

// État du joueur
interface PlayerState {
  score: number;
  resources: number;
  reputation: number; // 0-100, impact sur le score final
  level: number;
}

// Récupération des icônes pour les différents types d'attaques
const getAttackIcon = (type: AttackType) => {
  switch (type) {
    case AttackType.DDOS:
      return <Zap className="w-4 h-4" />;
    case AttackType.MALWARE:
      return <Bug className="w-4 h-4" />;
    case AttackType.RANSOMWARE:
      return <Skull className="w-4 h-4" />;
    case AttackType.SQL_INJECTION:
      return <Database className="w-4 h-4" />;
    case AttackType.XSS:
      return <Divide className="w-4 h-4" />;
    case AttackType.PHISHING:
      return <Bug className="w-4 h-4" />;
    case AttackType.MITM:
      return <Network className="w-4 h-4" />;
    default:
      return <Bug className="w-4 h-4" />;
  }
};

// Récupération des icônes pour les différents types de défenses
const getDefenseIcon = (type: DefenseType) => {
  switch (type) {
    case DefenseType.FIREWALL:
      return <ShieldCheck className="w-5 h-5" />;
    case DefenseType.IDS:
      return <Wifi className="w-5 h-5" />;
    case DefenseType.PROXY:
      return <Network className="w-5 h-5" />;
    case DefenseType.ANTIVIRUS:
      return <ShieldCheck className="w-5 h-5" />;
    case DefenseType.WAF:
      return <ShieldCheck className="w-5 h-5" />;
    case DefenseType.ENCRYPTION:
      return <Database className="w-5 h-5" />;
    default:
      return <ShieldCheck className="w-5 h-5" />;
  }
};

// Récupération des icônes pour les différents types d'infrastructures
const getInfraIcon = (type: InfraType) => {
  switch (type) {
    case InfraType.SERVER:
      return <Server className="w-6 h-6" />;
    case InfraType.DATABASE:
      return <Database className="w-6 h-6" />;
    case InfraType.WORKSTATION:
      return <HardDrive className="w-6 h-6" />;
    case InfraType.CLOUD:
      return <Cloud className="w-6 h-6" />;
    default:
      return <Server className="w-6 h-6" />;
  }
};

// Propriétés du composant
interface FirewallDefenseGameProps {
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  onGameEnd?: (score: number) => void;
}

const FirewallDefenseGame: React.FC<FirewallDefenseGameProps> = ({ difficulty = 'Moyen', onGameEnd }) => {
  // Références
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  // États
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [currentWave, setCurrentWave] = useState<number>(0);
  const [waveProgress, setWaveProgress] = useState<number>(0);
  const [timeUntilNextWave, setTimeUntilNextWave] = useState<number>(30);
  const [showNextWaveWarning, setShowNextWaveWarning] = useState<boolean>(false);
  const [selectedDefense, setSelectedDefense] = useState<DefenseType | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  
  // États principaux du jeu
  const [player, setPlayer] = useState<PlayerState>({
    score: 0,
    resources: difficulty === 'Facile' ? 1000 : difficulty === 'Moyen' ? 800 : 600,
    reputation: 100,
    level: 1
  });
  
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [defenses, setDefenses] = useState<Defense[]>([]);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [waves, setWaves] = useState<AttackWave[]>([]);
  
  // Initialisation du jeu en fonction de la difficulté
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Fonction d'initialisation du jeu
  const initializeGame = () => {
    // Initialisation des nœuds du réseau en fonction de la difficulté
    const initialNodes: NetworkNode[] = [
      {
        id: 'server1',
        type: InfraType.SERVER,
        position: { x: 70, y: 50 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['database1', 'workstation1', 'workstation2'],
        importance: 8,
        icon: getInfraIcon(InfraType.SERVER)
      },
      {
        id: 'database1',
        type: InfraType.DATABASE,
        position: { x: 30, y: 30 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['server1'],
        importance: 10,
        icon: getInfraIcon(InfraType.DATABASE)
      },
      {
        id: 'workstation1',
        type: InfraType.WORKSTATION,
        position: { x: 40, y: 70 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['server1'],
        importance: 5,
        icon: getInfraIcon(InfraType.WORKSTATION)
      },
      {
        id: 'workstation2',
        type: InfraType.WORKSTATION,
        position: { x: 80, y: 80 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['server1'],
        importance: 5,
        icon: getInfraIcon(InfraType.WORKSTATION)
      }
    ];

    // Ajout de nœuds supplémentaires pour les difficultés supérieures
    if (difficulty === 'Moyen' || difficulty === 'Difficile') {
      initialNodes.push({
        id: 'cloud1',
        type: InfraType.CLOUD,
        position: { x: 80, y: 20 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['server1'],
        importance: 7,
        icon: getInfraIcon(InfraType.CLOUD)
      });
    }

    if (difficulty === 'Difficile') {
      initialNodes.push({
        id: 'database2',
        type: InfraType.DATABASE,
        position: { x: 20, y: 80 },
        health: 100,
        maxHealth: 100,
        status: NodeStatus.NORMAL,
        connectedTo: ['server1', 'workstation1'],
        importance: 9,
        icon: getInfraIcon(InfraType.DATABASE)
      });
    }

    setNodes(initialNodes);

    // Initialisation des vagues d'attaques en fonction de la difficulté
    const initialWaves: AttackWave[] = getWavesForDifficulty(difficulty);
    setWaves(initialWaves);
    
    // Configuration initiale du joueur
    setPlayer({
      score: 0,
      resources: difficulty === 'Facile' ? 1000 : difficulty === 'Moyen' ? 800 : 600,
      reputation: 100,
      level: 1
    });
    
    // Réinitialisation des attaques et défenses
    setAttacks([]);
    setDefenses([]);
  };
  
  // Fonction pour générer des vagues d'attaques en fonction de la difficulté
  const getWavesForDifficulty = (difficulty: 'Facile' | 'Moyen' | 'Difficile'): AttackWave[] => {
    const waves: AttackWave[] = [];
    
    // Vagues de base pour toutes les difficultés
    waves.push({
      id: 1,
      name: "Première attaque",
      description: "Une simple tentative de reconnaissance de votre réseau.",
      attackTypes: [AttackType.PHISHING],
      count: 5,
      strength: 1,
      speed: 1,
      completed: false
    });
    
    waves.push({
      id: 2,
      name: "Attaques multiples",
      description: "Plusieurs types d'attaques coordonnées.",
      attackTypes: [AttackType.PHISHING, AttackType.DDOS],
      count: 8,
      strength: 2,
      speed: 1.2,
      completed: false
    });
    
    waves.push({
      id: 3,
      name: "Intrusion ciblée",
      description: "Tentatives d'injection ciblant vos bases de données.",
      attackTypes: [AttackType.SQL_INJECTION, AttackType.XSS],
      count: 10,
      strength: 3,
      speed: 1.5,
      completed: false
    });
    
    // Ajout de vagues pour les difficultés supérieures
    if (difficulty === 'Moyen' || difficulty === 'Difficile') {
      waves.push({
        id: 4,
        name: "Attaque distribuée",
        description: "Attaque DDoS de grande envergure avec tentatives d'intrusion.",
        attackTypes: [AttackType.DDOS, AttackType.MALWARE, AttackType.SQL_INJECTION],
        count: 15,
        strength: 4,
        speed: 1.8,
        completed: false
      });
      
      waves.push({
        id: 5,
        name: "Malware avancé",
        description: "Logiciels malveillants sophistiqués cherchant à s'établir dans votre réseau.",
        attackTypes: [AttackType.MALWARE, AttackType.MITM],
        count: 12,
        strength: 5,
        speed: 2,
        completed: false
      });
    }
    
    // Ajout de vagues supplémentaires pour la difficulté "Difficile"
    if (difficulty === 'Difficile') {
      waves.push({
        id: 6,
        name: "Attaque coordonnée",
        description: "Multiple vecteurs d'attaque ciblant tous vos points faibles.",
        attackTypes: [AttackType.DDOS, AttackType.SQL_INJECTION, AttackType.XSS, AttackType.MITM],
        count: 20,
        strength: 6,
        speed: 2.3,
        completed: false
      });
      
      waves.push({
        id: 7,
        name: "Ransomware critique",
        description: "Attaque par ransomware visant votre infrastructure critique.",
        attackTypes: [AttackType.RANSOMWARE, AttackType.PHISHING],
        count: 10,
        strength: 8,
        speed: 1.5,
        completed: false
      });
      
      waves.push({
        id: 8,
        name: "Menace persistante avancée",
        description: "APT sophistiquée orchestrée par un acteur malveillant déterminé.",
        attackTypes: Object.values(AttackType),
        count: 25,
        strength: 10,
        speed: 2.5,
        completed: false
      });
    }
    
    return waves;
  };
  
  // Démarrage du jeu
  const startGame = () => {
    setGameStarted(true);
    setShowTutorial(false);
    // Lancement de la première vague
    startWave(0);
  };
  
  // Démarrage d'une vague d'attaques
  const startWave = (waveIndex: number) => {
    if (waveIndex >= waves.length) {
      // Toutes les vagues ont été complétées, le jeu est gagné
      endGame(true);
      return;
    }
    
    setCurrentWave(waveIndex);
    setWaveProgress(0);
    
    const wave = waves[waveIndex];
    const newAttacks: Attack[] = [];
    
    // Génération des attaques pour cette vague
    for (let i = 0; i < wave.count; i++) {
      // Délai aléatoire pour chaque attaque
      setTimeout(() => {
        const attackType = wave.attackTypes[Math.floor(Math.random() * wave.attackTypes.length)];
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
        
        // Création d'une nouvelle attaque avec un ID unique utilisant timestamp
        const newAttack: Attack = {
          id: `attack-${waveIndex}-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: attackType,
          strength: wave.strength,
          speed: wave.speed,
          position: { x: 0, y: Math.random() * 100 }, // Départ du bord gauche à une hauteur aléatoire
          targetNodeId: targetNode.id,
          pathToTarget: calculatePathToTarget({ x: 0, y: Math.random() * 100 }, targetNode.position),
          blocked: false,
          icon: getAttackIcon(attackType),
          color: getAttackColor(attackType)
        };
        
        // Ajout de la nouvelle attaque au tableau des attaques
        setAttacks(prevAttacks => [...prevAttacks, newAttack]);
      }, i * (2000 / wave.speed)); // Répartition des attaques dans le temps
    }
    
    // Démarrage de la boucle de jeu si ce n'est pas déjà fait
    if (!animationFrameRef.current) {
      gameLoop();
    }
  };
  
  // Calcul d'un chemin simple vers la cible
  const calculatePathToTarget = (start: {x: number, y: number}, target: {x: number, y: number}) => {
    // Ici, on pourrait implémenter un algorithme de pathfinding plus complexe
    // Pour simplifier, on crée juste un chemin direct
    return [`${start.x},${start.y}`, `${target.x},${target.y}`];
  };
  
  // Obtention d'une couleur en fonction du type d'attaque
  const getAttackColor = (type: AttackType): string => {
    switch (type) {
      case AttackType.DDOS:
        return '#ff5252'; // Rouge
      case AttackType.MALWARE:
        return '#7c4dff'; // Violet
      case AttackType.RANSOMWARE:
        return '#d50000'; // Rouge foncé
      case AttackType.SQL_INJECTION:
        return '#2196f3'; // Bleu
      case AttackType.XSS:
        return '#ff9800'; // Orange
      case AttackType.PHISHING:
        return '#4caf50'; // Vert
      case AttackType.MITM:
        return '#ffeb3b'; // Jaune
      default:
        return '#9e9e9e'; // Gris
    }
  };
  
  // Obtention d'une couleur en fonction du type de défense
  const getDefenseColor = (type: DefenseType): string => {
    switch (type) {
      case DefenseType.FIREWALL:
        return '#2196f3'; // Bleu
      case DefenseType.IDS:
        return '#9c27b0'; // Violet
      case DefenseType.PROXY:
        return '#ff9800'; // Orange
      case DefenseType.ANTIVIRUS:
        return '#4caf50'; // Vert
      case DefenseType.WAF:
        return '#f44336'; // Rouge
      case DefenseType.ENCRYPTION:
        return '#3f51b5'; // Indigo
      default:
        return '#9e9e9e'; // Gris
    }
  };
  
  // Achat d'une défense
  const purchaseDefense = (type: DefenseType) => {
    // Vérifier si le joueur a assez de ressources
    const defenseCost = getDefenseCost(type);
    if (player.resources < defenseCost) {
      // Pas assez de ressources
      return;
    }
    
    // Sélectionner cette défense pour placement
    setSelectedDefense(type);
  };
  
  // Obtention du coût d'une défense
  const getDefenseCost = (type: DefenseType): number => {
    switch (type) {
      case DefenseType.FIREWALL:
        return 200;
      case DefenseType.IDS:
        return 300;
      case DefenseType.PROXY:
        return 250;
      case DefenseType.ANTIVIRUS:
        return 200;
      case DefenseType.WAF:
        return 350;
      case DefenseType.ENCRYPTION:
        return 400;
      default:
        return 200;
    }
  };
  
  // Placement d'une défense sur le terrain de jeu
  const placeDefense = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedDefense || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Vérifier s'il y a déjà une défense à cet endroit
    const existingDefense = defenses.find(d => 
      Math.abs(d.position.x - x) < 5 && Math.abs(d.position.y - y) < 5
    );
    
    if (existingDefense) {
      // On ne peut pas placer deux défenses au même endroit
      return;
    }
    
    // Créer la nouvelle défense
    const newDefense: Defense = {
      id: `defense-${Date.now()}`,
      type: selectedDefense,
      strength: getDefenseStrength(selectedDefense),
      radius: getDefenseRadius(selectedDefense),
      position: { x, y },
      level: 1,
      cost: getDefenseCost(selectedDefense),
      activeAttacks: [],
      icon: getDefenseIcon(selectedDefense),
      color: getDefenseColor(selectedDefense),
      effectiveAgainst: getDefenseEffectiveness(selectedDefense)
    };
    
    // Ajouter la défense et déduire le coût
    setDefenses(prev => [...prev, newDefense]);
    setPlayer(prev => ({
      ...prev,
      resources: prev.resources - newDefense.cost
    }));
    
    // Réinitialiser la sélection
    setSelectedDefense(null);
  };
  
  // Obtention de la force d'une défense
  const getDefenseStrength = (type: DefenseType): number => {
    switch (type) {
      case DefenseType.FIREWALL:
        return 5;
      case DefenseType.IDS:
        return 4;
      case DefenseType.PROXY:
        return 3;
      case DefenseType.ANTIVIRUS:
        return 6;
      case DefenseType.WAF:
        return 7;
      case DefenseType.ENCRYPTION:
        return 8;
      default:
        return 5;
    }
  };
  
  // Obtention du rayon d'action d'une défense
  const getDefenseRadius = (type: DefenseType): number => {
    switch (type) {
      case DefenseType.FIREWALL:
        return 20;
      case DefenseType.IDS:
        return 30;
      case DefenseType.PROXY:
        return 15;
      case DefenseType.ANTIVIRUS:
        return 18;
      case DefenseType.WAF:
        return 22;
      case DefenseType.ENCRYPTION:
        return 12;
      default:
        return 20;
    }
  };
  
  // Obtention des types d'attaques contre lesquels une défense est efficace
  const getDefenseEffectiveness = (type: DefenseType): AttackType[] => {
    switch (type) {
      case DefenseType.FIREWALL:
        return [AttackType.DDOS, AttackType.MITM];
      case DefenseType.IDS:
        return [AttackType.MALWARE, AttackType.MITM, AttackType.PHISHING];
      case DefenseType.PROXY:
        return [AttackType.PHISHING, AttackType.XSS];
      case DefenseType.ANTIVIRUS:
        return [AttackType.MALWARE, AttackType.RANSOMWARE];
      case DefenseType.WAF:
        return [AttackType.SQL_INJECTION, AttackType.XSS];
      case DefenseType.ENCRYPTION:
        return [AttackType.MITM, AttackType.SQL_INJECTION];
      default:
        return [AttackType.PHISHING];
    }
  };
  
  // Amélioration d'une défense existante
  const upgradeDefense = (defenseId: string) => {
    const defense = defenses.find(d => d.id === defenseId);
    if (!defense) return;
    
    // Coût de l'amélioration = coût initial * niveau actuel
    const upgradeCost = defense.cost * defense.level;
    
    if (player.resources < upgradeCost) {
      // Pas assez de ressources
      return;
    }
    
    // Mise à jour de la défense
    setDefenses(prev => prev.map(d => {
      if (d.id === defenseId) {
        return {
          ...d,
          level: d.level + 1,
          strength: d.strength * 1.5, // Augmentation de la force
          radius: d.radius * 1.2 // Augmentation du rayon d'action
        };
      }
      return d;
    }));
    
    // Déduction du coût
    setPlayer(prev => ({
      ...prev,
      resources: prev.resources - upgradeCost
    }));
  };
  
  // Vendre une défense
  const sellDefense = (defenseId: string) => {
    const defense = defenses.find(d => d.id === defenseId);
    if (!defense) return;
    
    // Remboursement de 75% du coût total investi
    const refundAmount = Math.floor(defense.cost * defense.level * 0.75);
    
    // Suppression de la défense
    setDefenses(prev => prev.filter(d => d.id !== defenseId));
    
    // Ajout des ressources
    setPlayer(prev => ({
      ...prev,
      resources: prev.resources + refundAmount
    }));
  };
  
  // Boucle principale du jeu
  const gameLoop = () => {
    if (gamePaused || gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Mise à jour des positions des attaques
    updateAttacks();
    
    // Mise à jour des défenses (détection et blocage des attaques)
    updateDefenses();
    
    // Mise à jour des nœuds (santé, statut)
    updateNodes();
    
    // Vérifier si la vague actuelle est terminée
    checkWaveCompletion();
    
    // Continuer la boucle
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Mise à jour des attaques
  const updateAttacks = () => {
    setAttacks(prevAttacks => {
      // Copie des attaques pour mise à jour
      const updatedAttacks = [...prevAttacks];
      
      // Mise à jour de chaque attaque
      for (let i = updatedAttacks.length - 1; i >= 0; i--) {
        const attack = updatedAttacks[i];
        
        // Si l'attaque est bloquée, on passe
        if (attack.blocked) continue;
        
        // Trouver le nœud cible
        const targetNode = nodes.find(n => n.id === attack.targetNodeId);
        if (!targetNode) {
          // La cible n'existe plus, suppression de l'attaque
          updatedAttacks.splice(i, 1);
          continue;
        }
        
        // Déplacement de l'attaque vers sa cible
        const dx = targetNode.position.x - attack.position.x;
        const dy = targetNode.position.y - attack.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          // L'attaque a atteint sa cible
          // Mise à jour du nœud (réduction de la santé)
          setNodes(prevNodes => prevNodes.map(n => {
            if (n.id === targetNode.id) {
              const newHealth = Math.max(0, n.health - attack.strength);
              return {
                ...n,
                health: newHealth,
                status: newHealth <= 0 ? NodeStatus.COMPROMISED : NodeStatus.UNDER_ATTACK
              };
            }
            return n;
          }));
          
          // Réduction de la réputation du joueur
          setPlayer(prev => ({
            ...prev,
            reputation: Math.max(0, prev.reputation - 1)
          }));
          
          // Suppression de l'attaque
          updatedAttacks.splice(i, 1);
        } else {
          // Mise à jour de la position de l'attaque
          const speedFactor = 0.5 * attack.speed;
          const newX = attack.position.x + (dx / distance) * speedFactor;
          const newY = attack.position.y + (dy / distance) * speedFactor;
          
          updatedAttacks[i] = {
            ...attack,
            position: { x: newX, y: newY }
          };
        }
      }
      
      return updatedAttacks;
    });
  };
  
  // Mise à jour des défenses
  const updateDefenses = () => {
    setDefenses(prevDefenses => {
      // Copie des défenses pour mise à jour
      const updatedDefenses = [...prevDefenses];
      
      // Pour chaque défense, vérifier les attaques à portée
      for (let i = 0; i < updatedDefenses.length; i++) {
        const defense = updatedDefenses[i];
        defense.activeAttacks = [];
        
        // Vérifier chaque attaque
        for (const attack of attacks) {
          if (attack.blocked) continue;
          
          // Calculer la distance entre la défense et l'attaque
          const dx = defense.position.x - attack.position.x;
          const dy = defense.position.y - attack.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Si l'attaque est à portée et que la défense est efficace contre ce type d'attaque
          if (distance <= defense.radius && defense.effectiveAgainst.includes(attack.type)) {
            // Bloquer l'attaque
            setAttacks(prevAttacks => prevAttacks.map(a => {
              if (a.id === attack.id) {
                return {
                  ...a,
                  blocked: true
                };
              }
              return a;
            }));
            
            // Ajouter cette attaque à la liste des attaques actives de la défense
            defense.activeAttacks.push(attack.id);
            
            // Ajouter des points au joueur
            setPlayer(prev => ({
              ...prev,
              score: prev.score + attack.strength * 10
            }));
          }
        }
        
        updatedDefenses[i] = defense;
      }
      
      return updatedDefenses;
    });
  };
  
  // Mise à jour des nœuds
  const updateNodes = () => {
    // Vérifier si tous les nœuds sont compromis
    const allCompromised = nodes.every(n => n.status === NodeStatus.COMPROMISED);
    if (allCompromised) {
      // Fin du jeu (perdu)
      endGame(false);
      return;
    }
    
    // Régénération lente de la santé des nœuds non compromis
    setNodes(prevNodes => prevNodes.map(n => {
      if (n.status !== NodeStatus.COMPROMISED && n.health < n.maxHealth) {
        return {
          ...n,
          health: Math.min(n.maxHealth, n.health + 0.05),
          status: n.health + 0.05 >= n.maxHealth ? NodeStatus.NORMAL : n.status
        };
      }
      return n;
    }));
  };
  
  // Vérification de la complétion d'une vague
  const checkWaveCompletion = () => {
    const currentWaveObj = waves[currentWave];
    if (!currentWaveObj || currentWaveObj.completed) return;
    
    // Vérifier si toutes les attaques ont été traitées
    const waveAttacks = attacks.filter(a => a.id.startsWith(`attack-${currentWave}`));
    
    if (waveAttacks.length === 0) {
      // Toutes les attaques ont été traitées
      // Marquer la vague comme complétée
      setWaves(prevWaves => prevWaves.map((w, i) => {
        if (i === currentWave) {
          return {
            ...w,
            completed: true
          };
        }
        return w;
      }));
      
      // Ajouter des ressources au joueur
      const waveBonus = 200 + currentWave * 100;
      setPlayer(prev => ({
        ...prev,
        resources: prev.resources + waveBonus,
        score: prev.score + waveBonus
      }));
      
      // Préparer la prochaine vague
      if (currentWave < waves.length - 1) {
        setTimeUntilNextWave(30);
        const timer = setInterval(() => {
          setTimeUntilNextWave(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              startWave(currentWave + 1);
              return 0;
            }
            return prev - 1;
          });
          
          // Afficher un avertissement lorsqu'il reste 10 secondes
          if (timeUntilNextWave === 10) {
            setShowNextWaveWarning(true);
            setTimeout(() => setShowNextWaveWarning(false), 3000);
          }
        }, 1000);
      } else {
        // Toutes les vagues sont complétées
        endGame(true);
      }
    } else {
      // Calculer la progression de la vague
      const totalAttacks = currentWaveObj.count;
      const completedAttacks = totalAttacks - waveAttacks.length;
      const progress = (completedAttacks / totalAttacks) * 100;
      setWaveProgress(progress);
    }
  };
  
  // Fin du jeu
  const endGame = (victory: boolean) => {
    setGameOver(true);
    setGameWon(victory);
    
    // Calcul du score final
    const finalScore = player.score * (player.reputation / 100);
    
    if (onGameEnd) {
      onGameEnd(finalScore);
    }
    
    // Nettoyage de la boucle d'animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  };
  
  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Détecter si un élément est dans le cônde de vision d'une défense
  const isInDefenseRange = (defense: Defense, pos: {x: number, y: number}): boolean => {
    const dx = defense.position.x - pos.x;
    const dy = defense.position.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= defense.radius;
  };
  
  // Mise en pause du jeu
  const togglePause = () => {
    setGamePaused(!gamePaused);
  };
  
  // Tutoriel du jeu
  const tutorialContent = [
    {
      title: 'Bienvenue dans Firewall Defense !',
      content: 'Votre mission est de protéger le réseau contre diverses cyberattaques. Placez des défenses stratégiquement pour bloquer les attaques avant qu\'elles n\'atteignent vos systèmes critiques.'
    },
    {
      title: 'Comprendre le terrain',
      content: 'Les nœuds (serveurs, bases de données, etc.) doivent être protégés. Si tous vos nœuds sont compromis, vous perdez la partie. Les attaques arriveront par vagues depuis le bord gauche du terrain.'
    },
    {
      title: 'Placer des défenses',
      content: 'Sélectionnez une défense dans le panneau de droite, puis cliquez sur le terrain pour la placer. Chaque type de défense est efficace contre certains types d\'attaques et a un rayon d\'action spécifique.'
    },
    {
      title: 'Gérer vos ressources',
      content: 'Chaque défense a un coût. Vous gagnez des ressources en bloquant des attaques et en terminant des vagues. Utilisez-les judicieusement pour améliorer vos défenses existantes ou en acheter de nouvelles.'
    },
    {
      title: 'Stratégie de défense',
      content: 'Certains nœuds sont plus importants que d\'autres. Les bases de données sont généralement les cibles les plus critiques. Adaptez votre stratégie en fonction des types d\'attaques de chaque vague.'
    },
    {
      title: 'Commencer la partie',
      content: 'Vous êtes maintenant prêt ! Cliquez sur "Commencer" pour lancer la première vague d\'attaques et bonne chance !'
    }
  ];
  
  // Affichage du composant
  return (
    <div className="w-full h-full flex flex-col">
      {/* Tutoriel */}
      {showTutorial && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="w-full max-w-xl bg-gray-900 text-white border-[#006a9e]">
            <CardHeader>
              <CardTitle className="text-[#006a9e]">{tutorialContent[tutorialStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{tutorialContent[tutorialStep].content}</p>
              {tutorialStep === 2 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.values(DefenseType).slice(0, 4).map(type => (
                    <div key={type} className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getDefenseColor(type) }}>
                        {getDefenseIcon(type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{type}</p>
                        <p className="text-xs text-gray-400">Coût: {getDefenseCost(type)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                disabled={tutorialStep === 0}
              >
                Précédent
              </Button>
              {tutorialStep < tutorialContent.length - 1 ? (
                <Button onClick={() => setTutorialStep(tutorialStep + 1)}>
                  Suivant
                </Button>
              ) : (
                <Button className="bg-[#006a9e] hover:bg-[#005a8e]" onClick={startGame}>
                  Commencer
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}
      
      {/* Interface principale */}
      <div className="flex-1 flex flex-col">
        {/* Barre d'information */}
        <div className="bg-gray-900 text-white p-2 flex items-center justify-between">
          <div className="flex space-x-4">
            <div>
              <span className="text-sm text-gray-400">Score:</span> 
              <span className="font-bold">{player.score}</span>
            </div>
            <div>
              <span className="text-sm text-gray-400">Ressources:</span> 
              <span className="font-bold text-green-400">{player.resources}</span>
            </div>
            <div>
              <span className="text-sm text-gray-400">Réputation:</span> 
              <Progress 
                value={player.reputation} 
                className="w-24 h-2 inline-block ml-2"
                indicatorClassName={player.reputation > 70 ? "bg-green-500" : 
                                  player.reputation > 40 ? "bg-yellow-500" : 
                                  "bg-red-500"}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-500">
              Vague {currentWave + 1}/{waves.length}
            </Badge>
            
            {!gameStarted ? (
              <Button 
                size="sm"
                onClick={startGame}
                className="bg-[#006a9e] hover:bg-[#005a8e]"
              >
                Commencer
              </Button>
            ) : !gameOver ? (
              <Button 
                size="sm"
                onClick={togglePause}
                variant="outline"
              >
                {gamePaused ? 'Reprendre' : 'Pause'}
              </Button>
            ) : null}
          </div>
        </div>
        
        {/* Indicateur de vague en cours */}
        {gameStarted && !gameOver && currentWave < waves.length && (
          <div className="bg-gray-800 p-2">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>{waves[currentWave].name}</span>
              <span>{Math.floor(waveProgress)}%</span>
            </div>
            <Progress value={waveProgress} className="h-1" indicatorClassName="bg-[#006a9e]" />
            {timeUntilNextWave > 0 && waves[currentWave].completed && (
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Prochaine vague dans:</span>
                <span>{timeUntilNextWave}s</span>
              </div>
            )}
          </div>
        )}
        
        {/* Zone de jeu principale */}
        <div className="flex flex-1">
          {/* Terrain de jeu */}
          <div 
            ref={gameAreaRef}
            className="flex-1 relative bg-gray-900 overflow-hidden cursor-pointer"
            onClick={placeDefense}
          >
            {/* Grille de fond */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-gray-800" />
              ))}
            </div>
            
            {/* Connexions entre les nœuds */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map(node => 
                node.connectedTo.map(targetId => {
                  const targetNode = nodes.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  
                  return (
                    <line 
                      key={`${node.id}-${targetId}`}
                      x1={`${node.position.x}%`}
                      y1={`${node.position.y}%`}
                      x2={`${targetNode.position.x}%`}
                      y2={`${targetNode.position.y}%`}
                      stroke={
                        node.status === NodeStatus.COMPROMISED || targetNode.status === NodeStatus.COMPROMISED
                          ? '#f44336'
                          : node.status === NodeStatus.UNDER_ATTACK || targetNode.status === NodeStatus.UNDER_ATTACK
                          ? '#ff9800'
                          : '#4caf50'
                      }
                      strokeWidth="1"
                      strokeDasharray={
                        node.status === NodeStatus.COMPROMISED || targetNode.status === NodeStatus.COMPROMISED
                          ? '5,5'
                          : undefined
                      }
                    />
                  );
                })
              )}
            </svg>
            
            {/* Zones de couverture des défenses */}
            {defenses.map(defense => (
              <div
                key={`range-${defense.id}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `calc(${defense.position.x}% - ${defense.radius}px)`,
                  top: `calc(${defense.position.y}% - ${defense.radius}px)`,
                  width: `${defense.radius * 2}px`,
                  height: `${defense.radius * 2}px`,
                  backgroundColor: `${defense.color}20`,
                  border: `1px solid ${defense.color}`,
                  opacity: defense.activeAttacks.length > 0 ? 0.7 : 0.3,
                }}
              />
            ))}
            
            {/* Nœuds du réseau */}
            {nodes.map(node => (
              <div
                key={node.id}
                className={`absolute rounded-lg flex items-center justify-center cursor-pointer
                  ${node.status === NodeStatus.COMPROMISED ? 'bg-red-900' : 
                    node.status === NodeStatus.UNDER_ATTACK ? 'bg-orange-700' : 
                    'bg-[#006a9e]'}`}
                style={{
                  left: `calc(${node.position.x}% - 20px)`,
                  top: `calc(${node.position.y}% - 20px)`,
                  width: '40px',
                  height: '40px',
                  transition: 'background-color 0.3s',
                  boxShadow: node.status === NodeStatus.UNDER_ATTACK ? '0 0 15px #ff9800' : 
                             node.status === NodeStatus.COMPROMISED ? '0 0 15px #f44336' : 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }}
              >
                {node.icon}
                <div 
                  className="absolute -bottom-6 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden"
                >
                  <div 
                    className={`h-full ${
                      node.health > 70 ? 'bg-green-500' : 
                      node.health > 30 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${node.health}%` }}
                  />
                </div>
              </div>
            ))}
            
            {/* Défenses placées */}
            {defenses.map(defense => (
              <div
                key={defense.id}
                className={`absolute rounded-full flex items-center justify-center cursor-pointer
                  ${defense.activeAttacks.length > 0 ? 'animate-pulse' : ''}`}
                style={{
                  left: `calc(${defense.position.x}% - 15px)`,
                  top: `calc(${defense.position.y}% - 15px)`,
                  width: '30px',
                  height: '30px',
                  backgroundColor: defense.color,
                  boxShadow: defense.activeAttacks.length > 0 ? `0 0 10px ${defense.color}` : 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(defense.id === selectedNode ? null : defense.id);
                }}
              >
                {defense.icon}
                <div className="absolute -top-5 text-xs bg-gray-900 text-white px-1 rounded">
                  Nv.{defense.level}
                </div>
              </div>
            ))}
            
            {/* Attaques en mouvement */}
            {attacks.map(attack => !attack.blocked && (
              <motion.div
                key={attack.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `calc(${attack.position.x}% - 10px)`,
                  top: `calc(${attack.position.y}% - 10px)`,
                  width: '20px',
                  height: '20px',
                  backgroundColor: attack.color,
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${attack.color}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {attack.icon}
              </motion.div>
            ))}
            
            {/* Panneau d'information sur la cible sélectionnée */}
            {selectedNode && (
              <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 text-white p-4 rounded-lg z-10 max-w-xs">
                {defenses.find(d => d.id === selectedNode) ? (
                  // Info sur la défense sélectionnée
                  (() => {
                    const defense = defenses.find(d => d.id === selectedNode)!;
                    return (
                      <>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: defense.color }}>
                            {defense.icon}
                          </div>
                          <div>
                            <h3 className="font-bold">{defense.type}</h3>
                            <Badge variant="outline" className="text-xs">Niveau {defense.level}</Badge>
                          </div>
                        </div>
                        <div className="text-sm space-y-1 mb-4">
                          <p><span className="text-gray-400">Force:</span> {defense.strength.toFixed(1)}</p>
                          <p><span className="text-gray-400">Portée:</span> {defense.radius.toFixed(1)}</p>
                          <p><span className="text-gray-400">Efficace contre:</span></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {defense.effectiveAgainst.map(type => (
                              <Badge key={type} variant="outline" className="text-xs bg-gray-800">{type}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => upgradeDefense(defense.id)}
                            className="bg-[#006a9e] hover:bg-[#005a8e] text-xs w-full"
                            disabled={player.resources < defense.cost * defense.level}
                          >
                            Améliorer ({defense.cost * defense.level})
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => sellDefense(defense.id)}
                            className="text-xs w-full"
                          >
                            Vendre ({Math.floor(defense.cost * defense.level * 0.75)})
                          </Button>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  // Info sur le nœud sélectionné
                  (() => {
                    const node = nodes.find(n => n.id === selectedNode)!;
                    return (
                      <>
                        <div className="flex items-center mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3
                            ${node.status === NodeStatus.COMPROMISED ? 'bg-red-900' : 
                              node.status === NodeStatus.UNDER_ATTACK ? 'bg-orange-700' : 
                              'bg-[#006a9e]'}`}
                          >
                            {node.icon}
                          </div>
                          <div>
                            <h3 className="font-bold">{node.type}</h3>
                            <Badge variant="outline" className={`text-xs
                              ${node.status === NodeStatus.COMPROMISED ? 'bg-red-900/50 text-red-300' : 
                                node.status === NodeStatus.UNDER_ATTACK ? 'bg-orange-900/50 text-orange-300' : 
                                'bg-[#006a9e]/50 text-[#80c3e2]'}`}
                            >
                              {node.status === NodeStatus.COMPROMISED ? 'Compromis' : 
                                node.status === NodeStatus.UNDER_ATTACK ? 'Sous attaque' : 
                                'Normal'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm space-y-1 mb-2">
                          <p><span className="text-gray-400">Importance:</span> {node.importance}/10</p>
                          <p><span className="text-gray-400">Santé:</span> {node.health.toFixed(0)}/{node.maxHealth}</p>
                          <Progress 
                            value={node.health} 
                            max={node.maxHealth}
                            className="h-1 mt-1"
                            indicatorClassName={node.health > 70 ? "bg-green-500" : 
                                              node.health > 30 ? "bg-yellow-500" : 
                                              "bg-red-500"}
                          />
                        </div>
                        {node.status === NodeStatus.COMPROMISED && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              // Restaurer le nœud compromis à un coût élevé
                              const cost = 500;
                              if (player.resources >= cost) {
                                setNodes(prevNodes => prevNodes.map(n => {
                                  if (n.id === node.id) {
                                    return {
                                      ...n,
                                      health: n.maxHealth / 2,
                                      status: NodeStatus.NORMAL
                                    };
                                  }
                                  return n;
                                }));
                                
                                setPlayer(prev => ({
                                  ...prev,
                                  resources: prev.resources - cost
                                }));
                              }
                            }}
                            className="bg-[#006a9e] hover:bg-[#005a8e] w-full mt-2"
                            disabled={player.resources < 500}
                          >
                            Restaurer (500)
                          </Button>
                        )}
                      </>
                    );
                  })()
                )}
              </div>
            )}
            
            {/* Avertissement de prochaine vague */}
            {showNextWaveWarning && (
              <motion.div
                className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900 bg-opacity-90 text-white px-6 py-4 rounded-lg shadow-lg border border-red-600"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <AlertTriangle className="mr-2 text-red-400" />
                  Attention !
                </h3>
                <p>Prochaine vague d'attaques imminente !</p>
                <p className="text-sm text-red-300">Préparez vos défenses...</p>
              </motion.div>
            )}
            
            {/* Écran de fin de jeu */}
            {gameOver && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="w-96 bg-gray-900 text-white border-[#006a9e]">
                  <CardHeader>
                    <CardTitle className={gameWon ? "text-green-400" : "text-red-400"}>
                      {gameWon ? "Mission Accomplie !" : "Mission Échouée"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {gameWon 
                        ? "Vous avez correctement protégé votre réseau contre toutes les vagues d'attaques."
                        : "Votre réseau a été entièrement compromis."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="font-medium">Score final:</span>
                      <span className="font-bold text-xl">{Math.floor(player.score * (player.reputation / 100))}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 block">Score brut</span>
                        <span>{player.score}</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 block">Réputation</span>
                        <span>{player.reputation}%</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 block">Ressources</span>
                        <span>{player.resources}</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-400 block">Vagues complétées</span>
                        <span>{waves.filter(w => w.completed).length}/{waves.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Réinitialiser le jeu
                        setGameOver(false);
                        setGameWon(false);
                        setGameStarted(false);
                        setShowTutorial(true);
                        setTutorialStep(0);
                        initializeGame();
                      }}
                    >
                      Nouvelle partie
                    </Button>
                    <Button
                      className="bg-[#006a9e] hover:bg-[#005a8e]"
                      onClick={() => {
                        // Retour au menu
                        if (onGameEnd) {
                          onGameEnd(Math.floor(player.score * (player.reputation / 100)));
                        }
                      }}
                    >
                      Retour au menu
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
          
          {/* Panneau latéral */}
          {gameStarted && !gameOver && (
            <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
              <Tabs defaultValue="defense" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="defense">Défenses</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="defense" className="space-y-4 mt-4">
                  <h3 className="text-lg font-bold mb-2">Défenses disponibles</h3>
                  
                  <div className="space-y-2">
                    {Object.values(DefenseType).map(type => (
                      <div 
                        key={type}
                        className={`p-2 rounded-lg flex items-center cursor-pointer transition-colors
                          ${selectedDefense === type ? 'bg-[#006a9e]/30 border border-[#006a9e]' : 'bg-gray-700 hover:bg-gray-600'}
                          ${player.resources < getDefenseCost(type) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={() => player.resources >= getDefenseCost(type) && purchaseDefense(type)}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: getDefenseColor(type) }}
                        >
                          {getDefenseIcon(type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{type}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Coût: {getDefenseCost(type)}</span>
                            <Badge variant="outline" className="text-xs">
                              {type === DefenseType.FIREWALL || type === DefenseType.WAF ? 'Barrière' :
                               type === DefenseType.IDS || type === DefenseType.ANTIVIRUS ? 'Détection' :
                               'Protection'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedDefense && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm">Sélectionnez un emplacement sur la carte pour placer le {selectedDefense}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedDefense(null)}
                        className="w-full mt-2"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Vague actuelle</h3>
                    {currentWave < waves.length ? (
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <h4 className="font-medium">{waves[currentWave].name}</h4>
                        <p className="text-sm text-gray-300 mt-1">{waves[currentWave].description}</p>
                        
                        <div className="mt-3">
                          <span className="text-xs text-gray-400">Types d'attaques:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {waves[currentWave].attackTypes.map(type => (
                              <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mt-3">
                          <span>Force: {waves[currentWave].strength}/10</span>
                          <span>Vitesse: {waves[currentWave].speed.toFixed(1)}x</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Aucune vague en cours</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2">Types d'attaques</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          DDoS
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Attaques par déni de service distribuées. Défense recommandée: Firewall</p>
                      </div>
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                          SQL Injection
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Injections SQL ciblant les bases de données. Défense recommandée: WAF</p>
                      </div>
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                          Malware
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Logiciels malveillants. Défense recommandée: Antivirus</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirewallDefenseGame;