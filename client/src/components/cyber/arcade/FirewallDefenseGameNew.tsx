import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Zap, Wifi, Database, Server, Bug, Divide, Skull, 
  HardDrive, Network, Cloud, AlertTriangle, Lock, BarChart, 
  Users, MonitorSmartphone, ArrowRight, RefreshCw, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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
  ANTIVIRUS = 'Antivirus',
  WAF = 'Web Application Firewall',
  ENCRYPTION = 'Chiffrement',
  SECURITY_TEAM = 'Équipe de sécurité'
}

// Types de zones à protéger
enum ZoneType {
  INTERNET_GATEWAY = 'Passerelle Internet',
  DMZ = 'DMZ',
  INTERNAL_NETWORK = 'Réseau Interne',
  DATABASE_ZONE = 'Zone Base de Données',
  CLOUD_SERVICES = 'Services Cloud'
}

// Interface pour une défense
interface Defense {
  id: string;
  type: DefenseType;
  name: string;
  description: string;
  cost: number; // Coût financier
  manpower: number; // Ressources humaines nécessaires
  icon: React.ReactNode;
  color: string;
  effectiveness: {
    [key in AttackType]?: number; // Efficacité contre chaque type d'attaque (0-10)
  };
}

// Interface pour une zone du réseau
interface Zone {
  id: string;
  type: ZoneType;
  name: string;
  description: string;
  importance: number; // 1-10, impact sur le score si compromis
  icon: React.ReactNode;
  color: string;
  position: { row: number; col: number };
  defenses: string[]; // IDs des défenses placées dans cette zone
}

// Interface pour une attaque
interface Attack {
  id: string;
  type: AttackType;
  name: string;
  description: string;
  targetZone: string;
  severity: number; // 1-10
  probability: number; // 1-10
  icon: React.ReactNode;
  color: string;
}

// Interface pour une simulation d'attaque
interface AttackSimulation {
  wave: number;
  attacks: {
    type: AttackType;
    targetZone: string;
    blocked: boolean;
    blockingDefense?: string;
    progress?: number; // Progression de l'attaque (0-100)
    position?: { x: number, y: number }; // Position actuelle de l'attaque
    isActive?: boolean; // Indique si l'attaque est en cours
  }[];
  results: {
    successfulAttacks: number;
    blockedAttacks: number;
    compromisedZones: string[];
    score: number;
  };
  feedback: string;
  level: number; // Niveau actuel
  maxLevel: number; // Nombre total de niveaux
}

// Interface pour les ressources du joueur
interface PlayerResources {
  budget: number; // Ressources financières
  manpower: number; // Personnel disponible
}

// Propriétés du composant
interface FirewallDefenseGameProps {
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  onGameEnd?: (score: number) => void;
}

const FirewallDefenseGameNew: React.FC<FirewallDefenseGameProps> = ({ difficulty, onGameEnd }) => {
  // Références
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  
  // États du jeu
  const [gamePhase, setGamePhase] = useState<'setup' | 'simulation' | 'results'>('setup');
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [simulationTimeLeft, setSimulationTimeLeft] = useState<number>(10); // 10 secondes de simulation
  const [defenseInventory, setDefenseInventory] = useState<Defense[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [resources, setResources] = useState<PlayerResources>({
    budget: difficulty === 'Facile' ? 1000 : (difficulty === 'Moyen' ? 800 : 600),
    manpower: difficulty === 'Facile' ? 30 : (difficulty === 'Moyen' ? 25 : 20)
  });
  const [attackTypes, setAttackTypes] = useState<Attack[]>([]);
  const [simulationResults, setSimulationResults] = useState<AttackSimulation | null>(null);
  const [score, setScore] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(difficulty === 'Facile' ? 3 : (difficulty === 'Moyen' ? 5 : 7));
  const [activeAttacks, setActiveAttacks] = useState<{
    type: AttackType;
    targetZone: string;
    progress: number;
    blocked: boolean;
    blockingDefense?: string;
    position: { x: number, y: number };
    isActive: boolean;
    icon: React.ReactNode;
    color: string;
  }[]>([]);

  // Initialisation du jeu
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Initialisation du compte à rebours pour la simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gamePhase === 'simulation' && simulationTimeLeft > 0) {
      timer = setTimeout(() => {
        setSimulationTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gamePhase === 'simulation' && simulationTimeLeft === 0) {
      // Fin de la simulation, passage aux résultats
      runSimulation();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gamePhase, simulationTimeLeft]);

  // Initialisation du jeu
  const initializeGame = () => {
    // Initialiser les types de défenses disponibles
    const defenses: Defense[] = [
      {
        id: 'defense-firewall',
        type: DefenseType.FIREWALL,
        name: 'Firewall de nouvelle génération',
        description: 'Protège contre les attaques réseau et filtre le trafic.',
        cost: 200,
        manpower: 5,
        icon: <ShieldCheck className="h-8 w-8" />,
        color: '#2196f3',
        effectiveness: {
          [AttackType.DDOS]: 7,
          [AttackType.MITM]: 6,
          [AttackType.PHISHING]: 2,
          [AttackType.XSS]: 3
        }
      },
      {
        id: 'defense-ids',
        type: DefenseType.IDS,
        name: 'Système de détection d\'intrusion',
        description: 'Détecte les comportements suspects et les tentatives d\'intrusion.',
        cost: 250,
        manpower: 8,
        icon: <Wifi className="h-8 w-8" />,
        color: '#9c27b0',
        effectiveness: {
          [AttackType.MALWARE]: 8,
          [AttackType.MITM]: 7,
          [AttackType.SQL_INJECTION]: 5,
          [AttackType.XSS]: 5
        }
      },
      {
        id: 'defense-antivirus',
        type: DefenseType.ANTIVIRUS,
        name: 'Solution antivirus avancée',
        description: 'Protège contre les logiciels malveillants et les virus.',
        cost: 150,
        manpower: 3,
        icon: <Bug className="h-8 w-8" />,
        color: '#4caf50',
        effectiveness: {
          [AttackType.MALWARE]: 9,
          [AttackType.RANSOMWARE]: 7,
          [AttackType.PHISHING]: 4
        }
      },
      {
        id: 'defense-waf',
        type: DefenseType.WAF,
        name: 'Pare-feu d\'application Web',
        description: 'Filtre et surveille le trafic HTTP/HTTPS.',
        cost: 300,
        manpower: 6,
        icon: <Server className="h-8 w-8" />,
        color: '#f44336',
        effectiveness: {
          [AttackType.SQL_INJECTION]: 8,
          [AttackType.XSS]: 9,
          [AttackType.DDOS]: 5
        }
      },
      {
        id: 'defense-encryption',
        type: DefenseType.ENCRYPTION,
        name: 'Chiffrement de données',
        description: 'Sécurise les données sensibles en les rendant illisibles.',
        cost: 180,
        manpower: 4,
        icon: <Lock className="h-8 w-8" />,
        color: '#3f51b5',
        effectiveness: {
          [AttackType.MITM]: 8,
          [AttackType.RANSOMWARE]: 6,
          [AttackType.SQL_INJECTION]: 3
        }
      },
      {
        id: 'defense-team',
        type: DefenseType.SECURITY_TEAM,
        name: 'Équipe de réponse aux incidents',
        description: 'Équipe dédiée à la surveillance et la réponse aux incidents de sécurité.',
        cost: 350,
        manpower: 10,
        icon: <Users className="h-8 w-8" />,
        color: '#ff9800',
        effectiveness: {
          [AttackType.PHISHING]: 7,
          [AttackType.RANSOMWARE]: 8,
          [AttackType.MALWARE]: 6,
          [AttackType.DDOS]: 4,
          [AttackType.SQL_INJECTION]: 4,
          [AttackType.XSS]: 4,
          [AttackType.MITM]: 5
        }
      }
    ];
    
    setDefenseInventory(defenses);
    
    // Initialiser les zones du réseau
    const networkZones: Zone[] = [
      {
        id: 'zone-internet',
        type: ZoneType.INTERNET_GATEWAY,
        name: 'Passerelle Internet',
        description: 'Point d\'entrée depuis l\'Internet public.',
        importance: 7,
        icon: <Network className="h-8 w-8" />,
        color: '#ff9800',
        position: { row: 0, col: 1 },
        defenses: []
      },
      {
        id: 'zone-dmz',
        type: ZoneType.DMZ,
        name: 'DMZ',
        description: 'Zone démilitarisée pour les services exposés.',
        importance: 8,
        icon: <Server className="h-8 w-8" />,
        color: '#2196f3',
        position: { row: 1, col: 0 },
        defenses: []
      },
      {
        id: 'zone-internal',
        type: ZoneType.INTERNAL_NETWORK,
        name: 'Réseau Interne',
        description: 'Réseau d\'entreprise pour les employés.',
        importance: 9,
        icon: <MonitorSmartphone className="h-8 w-8" />,
        color: '#4caf50',
        position: { row: 1, col: 2 },
        defenses: []
      },
      {
        id: 'zone-database',
        type: ZoneType.DATABASE_ZONE,
        name: 'Zone Base de Données',
        description: 'Stockage des données critiques de l\'entreprise.',
        importance: 10,
        icon: <Database className="h-8 w-8" />,
        color: '#e91e63',
        position: { row: 2, col: 1 },
        defenses: []
      }
    ];
    
    // Ajouter une zone cloud pour les difficultés moyennes et difficiles
    if (difficulty !== 'Facile') {
      networkZones.push({
        id: 'zone-cloud',
        type: ZoneType.CLOUD_SERVICES,
        name: 'Services Cloud',
        description: 'Services hébergés dans le cloud.',
        importance: 8,
        icon: <Cloud className="h-8 w-8" />,
        color: '#9c27b0',
        position: { row: 0, col: 3 },
        defenses: []
      });
    }
    
    setZones(networkZones);
    
    // Initialiser les types d'attaques
    const attacks: Attack[] = [
      {
        id: 'attack-ddos',
        type: AttackType.DDOS,
        name: 'Attaque DDoS',
        description: 'Attaque par déni de service distribué visant à saturer les ressources réseau.',
        targetZone: 'zone-internet',
        severity: 7,
        probability: difficulty === 'Facile' ? 5 : (difficulty === 'Moyen' ? 7 : 9),
        icon: <Zap className="h-6 w-6" />,
        color: '#ff5252'
      },
      {
        id: 'attack-sql',
        type: AttackType.SQL_INJECTION,
        name: 'Injection SQL',
        description: 'Tentative d\'exploitation des vulnérabilités de base de données.',
        targetZone: 'zone-database',
        severity: 8,
        probability: difficulty === 'Facile' ? 4 : (difficulty === 'Moyen' ? 6 : 8),
        icon: <Database className="h-6 w-6" />,
        color: '#2196f3'
      },
      {
        id: 'attack-malware',
        type: AttackType.MALWARE,
        name: 'Malware',
        description: 'Logiciel malveillant visant à compromettre les systèmes.',
        targetZone: 'zone-internal',
        severity: 6,
        probability: difficulty === 'Facile' ? 6 : (difficulty === 'Moyen' ? 7 : 8),
        icon: <Bug className="h-6 w-6" />,
        color: '#7c4dff'
      },
      {
        id: 'attack-phishing',
        type: AttackType.PHISHING,
        name: 'Phishing',
        description: 'Tentative d\'obtention d\'informations sensibles par usurpation d\'identité.',
        targetZone: 'zone-internal',
        severity: 5,
        probability: difficulty === 'Facile' ? 7 : (difficulty === 'Moyen' ? 8 : 9),
        icon: <MonitorSmartphone className="h-6 w-6" />,
        color: '#4caf50'
      }
    ];
    
    // Ajouter des attaques plus complexes pour les difficultés moyennes et difficiles
    if (difficulty !== 'Facile') {
      attacks.push(
        {
          id: 'attack-xss',
          type: AttackType.XSS,
          name: 'Cross-Site Scripting',
          description: 'Injection de scripts malveillants dans les applications web.',
          targetZone: 'zone-dmz',
          severity: 6,
          probability: difficulty === 'Moyen' ? 6 : 8,
          icon: <Divide className="h-6 w-6" />,
          color: '#ff9800'
        },
        {
          id: 'attack-mitm',
          type: AttackType.MITM,
          name: 'Man-in-the-Middle',
          description: 'Interception de communications entre deux parties.',
          targetZone: 'zone-internet',
          severity: 7,
          probability: difficulty === 'Moyen' ? 5 : 7,
          icon: <Network className="h-6 w-6" />,
          color: '#ffeb3b'
        }
      );
    }
    
    // Ajouter ransomware pour la difficulté difficile
    if (difficulty === 'Difficile') {
      attacks.push({
        id: 'attack-ransomware',
        type: AttackType.RANSOMWARE,
        name: 'Ransomware',
        description: 'Logiciel malveillant qui chiffre les données et exige une rançon.',
        targetZone: 'zone-database',
        severity: 9,
        probability: 8,
        icon: <Skull className="h-6 w-6" />,
        color: '#d50000'
      });
      
      // En difficulté difficile, ajout d'une attaque cloud si la zone existe
      if (networkZones.some(zone => zone.id === 'zone-cloud')) {
        attacks.push({
          id: 'attack-cloud',
          type: AttackType.MALWARE,
          name: 'Compromission Cloud',
          description: 'Attaque ciblant spécifiquement les infrastructures cloud.',
          targetZone: 'zone-cloud',
          severity: 8,
          probability: 7,
          icon: <Cloud className="h-6 w-6" />,
          color: '#9c27b0'
        });
      }
    }
    
    setAttackTypes(attacks);
  };

  // Gestion du début du drag
  const handleDragStart = (defenseId: string) => {
    setDragging(defenseId);
  };

  // Gestion du drop
  const handleDrop = (zoneId: string) => {
    if (!dragging) return;
    
    const defense = defenseInventory.find(d => d.id === dragging);
    if (!defense) return;
    
    // Vérifier si assez de ressources
    if (resources.budget < defense.cost || resources.manpower < defense.manpower) {
      setDragging(null);
      return;
    }
    
    // Ajouter la défense à la zone
    setZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          defenses: [...zone.defenses, dragging]
        };
      }
      return zone;
    }));
    
    // Réduire les ressources disponibles
    setResources(prev => ({
      budget: prev.budget - defense.cost,
      manpower: prev.manpower - defense.manpower
    }));
    
    setDragging(null);
  };

  // Retirer une défense d'une zone
  const removeDefense = (zoneId: string, defenseId: string) => {
    const defense = defenseInventory.find(d => d.id === defenseId);
    if (!defense) return;
    
    // Enlever la défense de la zone
    setZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          defenses: zone.defenses.filter(id => id !== defenseId)
        };
      }
      return zone;
    }));
    
    // Rendre les ressources utilisées
    setResources(prev => ({
      budget: prev.budget + defense.cost,
      manpower: prev.manpower + defense.manpower
    }));
  };

  // Animation des attaques en temps réel
  useEffect(() => {
    let animationFrame: number | null = null;
    
    if (gamePhase === 'simulation' && activeAttacks.length > 0) {
      const animate = () => {
        setActiveAttacks(prevAttacks => 
          prevAttacks.map(attack => {
            if (!attack.isActive) return attack;
            
            // Trouver la zone cible pour calculer la position finale
            const targetZone = zones.find(z => z.id === attack.targetZone);
            if (!targetZone) return { ...attack, isActive: false };
            
            // Calculer la nouvelle position et progression
            const newProgress = attack.progress + (attack.blocked ? 0 : 1);
            
            // Si l'attaque est bloquée, on arrête sa progression
            if (attack.blocked) {
              return { ...attack, progress: attack.progress };
            }
            
            // Si l'attaque est terminée (atteint 100% ou a été bloquée)
            if (newProgress >= 100) {
              return { ...attack, progress: 100, isActive: false };
            }
            
            // Positions initiale et finale de l'attaque
            const startPos = { x: 0, y: 50 }; // Départ du bord gauche
            const endPos = { 
              x: 20 + targetZone.position.col * 25, 
              y: 20 + targetZone.position.row * 25 
            };
            
            // Calculer la nouvelle position avec une interpolation linéaire
            const newPos = {
              x: startPos.x + (endPos.x - startPos.x) * (newProgress / 100),
              y: startPos.y + (endPos.y - startPos.y) * (newProgress / 100)
            };
            
            return {
              ...attack,
              progress: newProgress,
              position: newPos
            };
          })
        );
        
        // Continuer l'animation si toutes les attaques ne sont pas terminées
        if (activeAttacks.some(a => a.isActive)) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [gamePhase, activeAttacks, zones]);

  // Lancer la simulation avec des attaques
  const startSimulation = () => {
    setGamePhase('simulation');
    setSimulationTimeLeft(10);
    
    // Générer les attaques actives
    const newActiveAttacks = [];
    
    // Facteur de difficulté selon le niveau actuel
    const levelDifficulty = Math.min(1 + (currentLevel - 1) * 0.2, 2.5);
    
    // Nombre d'attaques basé sur la difficulté du jeu et le niveau actuel
    const baseAttackCount = difficulty === 'Facile' ? 3 : (difficulty === 'Moyen' ? 5 : 7);
    const attackCount = Math.floor(baseAttackCount * levelDifficulty);
    
    // Sélectionner aléatoirement des attaques parmi les types disponibles
    for (let i = 0; i < attackCount; i++) {
      // Délai aléatoire pour chaque attaque (0 à 8 secondes)
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * attackTypes.length);
        const attack = attackTypes[randomIndex];
        
        // Vérifier si la zone cible existe
        const targetZone = zones.find(zone => zone.id === attack.targetZone);
        if (!targetZone) return;
        
        // Vérifier les défenses dans la zone
        let isBlocked = false;
        let blockingDefenseId = '';
        
        for (const defenseId of targetZone.defenses) {
          const defense = defenseInventory.find(d => d.id === defenseId);
          if (!defense) continue;
          
          // Calculer l'efficacité de la défense contre ce type d'attaque
          const effectiveness = defense.effectiveness[attack.type] || 0;
          
          // Plus l'efficacité est élevée, plus la chance de bloquer est grande
          // Au niveau supérieur, les attaques sont plus difficiles à bloquer
          if (Math.random() * 10 < effectiveness / Math.sqrt(levelDifficulty)) {
            isBlocked = true;
            blockingDefenseId = defenseId;
            break;
          }
        }
        
        const newAttack = {
          type: attack.type,
          targetZone: attack.targetZone,
          progress: 0,
          blocked: isBlocked,
          blockingDefense: isBlocked ? blockingDefenseId : undefined,
          position: { x: 0, y: 50 + Math.random() * 20 - 10 }, // Légère variation de la position de départ
          isActive: true,
          icon: attack.icon,
          color: attack.color
        };
        
        setActiveAttacks(prev => [...prev, newAttack]);
      }, Math.random() * 8000); // Les attaques arrivent à intervalles aléatoires sur les 8 premières secondes
    }
  };

  // Exécuter la simulation et calculer les résultats
  const runSimulation = () => {
    // Convertir les attaques actives en résultats
    const attackResults = activeAttacks.map(attack => ({
      type: attack.type,
      targetZone: attack.targetZone,
      blocked: attack.blocked,
      blockingDefense: attack.blockingDefense,
      progress: attack.progress
    }));
    
    // Calculer les résultats
    const successfulAttacks = attackResults.filter(ar => !ar.blocked && ar.progress >= 100).length;
    const blockedAttacks = attackResults.filter(ar => ar.blocked).length;
    
    // Déterminer les zones compromises
    const compromisedZoneIds = attackResults
      .filter(ar => !ar.blocked && ar.progress >= 100)
      .map(ar => ar.targetZone);
    
    // Calculer le score en fonction des zones compromises et de leur importance
    let totalScore = 0;
    let levelCompleted = false;
    
    // Points de base pour les attaques bloquées
    totalScore += blockedAttacks * 100;
    
    // Pénalité pour les zones compromises (basée sur l'importance)
    compromisedZoneIds.forEach(zoneId => {
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        totalScore -= zone.importance * 50;
      }
    });
    
    // Bonus pour l'optimisation des ressources (ressources non dépensées)
    totalScore += Math.floor(resources.budget / 50);
    totalScore += resources.manpower * 10;
    
    // Éviter les scores négatifs
    totalScore = Math.max(0, totalScore);
    
    // Générer un feedback basé sur les résultats
    let feedback = '';
    
    // Vérifier si le niveau est réussi (moins de 30% de zones compromises)
    const compromisedRatio = zones.length > 0 ? compromisedZoneIds.length / zones.length : 0;
    levelCompleted = compromisedRatio < 0.3;
    
    if (successfulAttacks === 0) {
      feedback = `Niveau ${currentLevel} - Excellent travail ! Votre stratégie de défense a bloqué toutes les attaques. Votre infrastructure est bien protégée.`;
    } else if (successfulAttacks < attackResults.length / 3) {
      feedback = `Niveau ${currentLevel} - Bonne défense globale, mais quelques attaques ont réussi à passer. Renforcez les zones vulnérables.`;
    } else if (successfulAttacks < attackResults.length / 2) {
      feedback = `Niveau ${currentLevel} - Défense moyenne. Un nombre significatif d'attaques ont réussi. Reconsidérez votre stratégie de placement des défenses.`;
    } else {
      feedback = `Niveau ${currentLevel} - Défense insuffisante. La majorité des attaques ont réussi. Votre infrastructure est gravement compromise.`;
    }
    
    // Créer l'objet de résultats de simulation
    const simulation: AttackSimulation = {
      wave: 1,
      attacks: attackResults,
      results: {
        successfulAttacks,
        blockedAttacks,
        compromisedZones: compromisedZoneIds,
        score: totalScore
      },
      feedback,
      level: currentLevel,
      maxLevel: maxLevel
    };
    
    setSimulationResults(simulation);
    setScore(totalScore);
    setGamePhase('results');
    
    // Réinitialiser les attaques actives
    setActiveAttacks([]);
    
    // Appeler le callback de fin de jeu si c'est le dernier niveau
    if (currentLevel >= maxLevel && !levelCompleted) {
      if (onGameEnd) {
        onGameEnd(totalScore);
      }
    }
  };

  // Recommencer le jeu
  const restartGame = () => {
    setGamePhase('setup');
    setShowTutorial(false);
    setSimulationResults(null);
    setScore(0);
    
    // Réinitialiser les zones (enlever toutes les défenses)
    setZones(prev => prev.map(zone => ({
      ...zone,
      defenses: []
    })));
    
    // Réinitialiser les ressources
    setResources({
      budget: difficulty === 'Facile' ? 1000 : (difficulty === 'Moyen' ? 800 : 600),
      manpower: difficulty === 'Facile' ? 30 : (difficulty === 'Moyen' ? 25 : 20)
    });
  };

  // Composant pour le tutoriel
  const renderTutorial = () => {
    // Contenu des étapes du tutoriel
    const tutorialSteps = [
      {
        title: "Bienvenue dans Firewall Defense !",
        content: "Dans ce jeu, vous devez protéger votre infrastructure réseau contre diverses cyberattaques en plaçant stratégiquement des défenses."
      },
      {
        title: "Zones de réseau",
        content: "Votre réseau est composé de plusieurs zones, chacune avec une importance différente. Les zones plus critiques comme les bases de données doivent être particulièrement bien protégées."
      },
      {
        title: "Défenses disponibles",
        content: "Glissez-déposez les défenses dans les zones du réseau. Chaque défense a un coût financier et en personnel, et est plus ou moins efficace contre certains types d'attaques."
      },
      {
        title: "Simulation d'attaque",
        content: "Après avoir placé vos défenses, lancez la simulation pour voir comment votre infrastructure résiste aux cyberattaques."
      },
      {
        title: "Évaluation et score",
        content: "Votre stratégie sera évaluée en fonction du nombre d'attaques bloquées, des zones compromises et de l'optimisation des ressources."
      }
    ];
    
    const currentStep = tutorialSteps[tutorialStep];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => tutorialStep === tutorialSteps.length - 1 ? setShowTutorial(false) : setTutorialStep(prev => prev + 1)}
      >
        <div className="bg-gray-900 p-6 rounded-lg max-w-md mx-auto shadow-lg border border-amber-500/30" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-amber-400 mb-2">{currentStep.title}</h3>
          <p className="text-gray-200 mb-4">{currentStep.content}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === tutorialStep ? 'bg-amber-500' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
              onClick={() => tutorialStep === tutorialSteps.length - 1 ? setShowTutorial(false) : setTutorialStep(prev => prev + 1)}
            >
              {tutorialStep === tutorialSteps.length - 1 ? "Commencer" : "Suivant"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Rendu du jeu en phase de configuration
  const renderSetupPhase = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Liste des défenses disponibles */}
      <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 order-2 lg:order-1">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <ShieldCheck className="w-6 h-6 mr-2 text-blue-400" />
          Défenses disponibles
        </h2>
        
        <div className="space-y-4 mb-6">
          {defenseInventory.map((defense) => (
            <motion.div
              key={defense.id}
              className={`bg-gray-700 rounded-lg p-3 cursor-grab relative overflow-hidden ${dragging === defense.id ? 'border-2 border-white/50' : 'border border-gray-600'}`}
              whileHover={{ scale: 1.02 }}
              style={{ boxShadow: `0 0 15px ${defense.color}30` }}
              draggable
              onDragStart={() => handleDragStart(defense.id)}
            >
              <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: defense.color }} />
              
              <div className="flex items-start">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${defense.color}20` }}>
                  {defense.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white">{defense.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{defense.description}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center text-amber-400">
                      <BarChart className="w-4 h-4 mr-1" />
                      Coût: {defense.cost}€
                    </div>
                    <div className="flex items-center text-blue-400">
                      <Users className="w-4 h-4 mr-1" />
                      Personnel: {defense.manpower}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Efficacité:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(defense.effectiveness).map(([attackType, value]) => (
                        <Badge key={attackType} variant="outline" className="bg-gray-800 text-xs">
                          {attackType}: {value}/10
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Carte du réseau */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 order-1 lg:order-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Network className="w-6 h-6 mr-2 text-purple-400" />
            Infrastructure réseau
          </h2>
          
          <div className="flex space-x-2">
            <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
              <BarChart className="w-4 h-4 mr-1 text-amber-400" />
              <span className="text-amber-400 font-bold">{resources.budget}€</span>
            </div>
            <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
              <Users className="w-4 h-4 mr-1 text-blue-400" />
              <span className="text-blue-400 font-bold">{resources.manpower}</span>
            </div>
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded-lg p-4 mb-4">
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative grid grid-cols-4 gap-4 min-h-[400px]">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`col-start-${zone.position.col + 1} row-start-${zone.position.row + 1} bg-gray-800 rounded-lg p-3 flex flex-col border border-gray-700 relative overflow-hidden`}
                style={{ boxShadow: `0 0 20px ${zone.color}20` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(zone.id)}
              >
                <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: zone.color }} />
                
                <div className="flex items-center mb-2">
                  <div className="p-1.5 rounded mr-2" style={{ backgroundColor: `${zone.color}30` }}>
                    {zone.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{zone.name}</h3>
                    <p className="text-xs text-gray-400">Importance: {zone.importance}/10</p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-300 mb-3">{zone.description}</p>
                
                <div className="mt-auto">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Défenses installées:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {zone.defenses.length === 0 ? (
                      <p className="text-xs text-gray-500 col-span-2">Aucune défense installée</p>
                    ) : (
                      zone.defenses.map(defenseId => {
                        const defense = defenseInventory.find(d => d.id === defenseId);
                        if (!defense) return null;
                        
                        return (
                          <div 
                            key={defenseId} 
                            className="flex items-center bg-gray-700 rounded px-2 py-1 text-xs"
                            title={`Supprimer ${defense.name}`}
                            onClick={() => removeDefense(zone.id, defenseId)}
                          >
                            <div className="w-3 h-3 mr-1" style={{ color: defense.color }}>
                              {defense.icon}
                            </div>
                            <span className="truncate">{defense.name.substring(0, 15)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <h3 className="text-md font-semibold text-white mb-2">Menaces potentielles:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attackTypes.map((attack) => {
              const targetZone = zones.find(z => z.id === attack.targetZone);
              return (
                <div 
                  key={attack.id} 
                  className="flex items-start bg-gray-800 rounded-lg p-2 border border-gray-700"
                  style={{ boxShadow: `0 0 10px ${attack.color}20` }}
                >
                  <div className="p-1.5 rounded mr-2 flex-shrink-0" style={{ backgroundColor: `${attack.color}20` }}>
                    {attack.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-white text-sm">{attack.name}</h4>
                      <Badge className="ml-1 bg-gray-700 text-gray-300 text-xs">
                        {attack.severity}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Cible: {targetZone?.name}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ width: `${attack.probability * 10}%`, backgroundColor: attack.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Probabilité: {attack.probability}/10</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={startSimulation}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Lancer la simulation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Instructions pour le glisser-déposer */}
      <div className="lg:col-span-3 bg-gray-800/50 rounded-lg p-3 text-center order-3">
        <p className="text-gray-300 text-sm">
          <span className="font-semibold">Comment jouer:</span> Glissez-déposez les défenses dans les zones de l'infrastructure pour les protéger. Chaque défense a un coût et une efficacité variable selon les types d'attaques. Une fois prêt, lancez la simulation.
        </p>
      </div>
    </div>
  );

  // Passer au niveau suivant
  const nextLevel = () => {
    if (currentLevel < maxLevel) {
      // Augmenter le niveau
      setCurrentLevel(prev => prev + 1);
      
      // Réinitialiser l'état du jeu pour le nouveau niveau
      setGamePhase('setup');
      setSimulationResults(null);
      
      // Réinitialiser les zones (enlever toutes les défenses)
      setZones(prev => prev.map(zone => ({
        ...zone,
        defenses: []
      })));
      
      // Donner des ressources pour le niveau suivant (avec bonus pour progression)
      const levelBonus = currentLevel * 50;
      setResources({
        budget: (difficulty === 'Facile' ? 1000 : (difficulty === 'Moyen' ? 800 : 600)) + levelBonus,
        manpower: (difficulty === 'Facile' ? 30 : (difficulty === 'Moyen' ? 25 : 20)) + Math.floor(levelBonus/50)
      });
    } else {
      // Fin du jeu
      if (onGameEnd) {
        onGameEnd(score);
      }
    }
  };

  // Rendu du jeu en phase de simulation
  const renderSimulationPhase = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 max-w-5xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Niveau {currentLevel} - Simulation en cours...</h2>
          <div className="flex items-center bg-gray-700 px-4 py-2 rounded-full">
            <span className="text-2xl font-bold text-amber-400 mr-2">{simulationTimeLeft}</span>
            <span className="text-sm text-gray-400">secondes restantes</span>
          </div>
        </div>
        
        <Progress value={(10 - simulationTimeLeft) * 10} className="h-2 mb-6" />
        
        <div className="relative bg-gray-900 p-6 rounded-lg min-h-[400px] mb-6">
          {/* Grille de fond */}
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Zones du réseau */}
          <div className="relative grid grid-cols-4 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`col-start-${zone.position.col + 1} row-start-${zone.position.row + 1} bg-gray-800/80 rounded-lg p-3 border border-gray-700`}
                style={{ 
                  boxShadow: `0 0 20px ${zone.color}20`,
                  gridColumn: `${zone.position.col + 1}`,
                  gridRow: `${zone.position.row + 1}`,
                  height: '120px',
                  position: 'relative'
                }}
              >
                <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: zone.color }} />
                
                <div className="flex items-center">
                  <div className="p-1 rounded mr-2" style={{ backgroundColor: `${zone.color}30` }}>
                    {zone.icon}
                  </div>
                  <h3 className="font-bold text-sm text-white">{zone.name}</h3>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {zone.defenses.map(defenseId => {
                    const defense = defenseInventory.find(d => d.id === defenseId);
                    if (!defense) return null;
                    return (
                      <div 
                        key={defenseId}
                        className="bg-gray-700 rounded px-1 py-0.5 text-xs flex items-center"
                        style={{ color: defense.color }}
                      >
                        {defense.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Attaques en cours */}
            {activeAttacks.map((attack, index) => (
              <motion.div
                key={`attack-${index}`}
                className="absolute"
                style={{ 
                  left: `${attack.position.x}%`, 
                  top: `${attack.position.y}%`,
                  zIndex: 20
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: attack.blocked ? [1, 1.2, 0] : 1, 
                  opacity: attack.blocked ? [1, 0.8, 0] : 1,
                }}
                transition={{ duration: attack.blocked ? 0.5 : 0.3 }}
              >
                <div 
                  className={`rounded-full p-1 ${attack.blocked ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                  style={{ 
                    boxShadow: `0 0 10px ${attack.blocked ? '#4ade80' : attack.color}`,
                  }}
                >
                  {attack.icon}
                </div>
                
                {/* Barre de progression de l'attaque */}
                {!attack.blocked && (
                  <div className="w-10 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${attack.progress}%`,
                        backgroundColor: attack.color
                      }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            Les attaques sont en cours. Vos défenses sont mises à l'épreuve pour protéger votre infrastructure réseau.
          </p>
          
          {/* Légende des attaques */}
          <div className="flex justify-center space-x-4 mt-3">
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full bg-red-500/30 mr-1" />
              <span>Attaque en cours</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full bg-green-500/30 mr-1" />
              <span>Attaque bloquée</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Rendu du jeu en phase de résultats
  const renderResultsPhase = () => {
    if (!simulationResults) return null;
    
    const { attacks, results, feedback } = simulationResults;
    const { successfulAttacks, blockedAttacks, compromisedZones, score } = results;
    
    // Calculer un message basé sur le score
    let scoreMessage = '';
    if (score > 800) {
      scoreMessage = "Excellent travail ! Votre stratégie de défense est exemplaire.";
    } else if (score > 500) {
      scoreMessage = "Bonne performance ! Votre défense est solide mais peut être améliorée.";
    } else if (score > 300) {
      scoreMessage = "Résultat moyen. Des améliorations significatives sont nécessaires.";
    } else {
      scoreMessage = "Résultat insuffisant. Votre infrastructure est très vulnérable.";
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Résultats de la simulation</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Score final</p>
              <p className="text-3xl font-bold text-amber-400">{score}</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Efficacité de défense</p>
              <p className="text-3xl font-bold" style={{ color: blockedAttacks === 0 && successfulAttacks === 0 ? '#a0aec0' : blockedAttacks / (blockedAttacks + successfulAttacks) > 0.7 ? '#68d391' : blockedAttacks / (blockedAttacks + successfulAttacks) > 0.4 ? '#f6ad55' : '#f56565' }}>
                {attacks.length === 0 ? '-' : `${Math.round(blockedAttacks / attacks.length * 100)}%`}
              </p>
            </div>
          </div>
          
          <Card className="mb-4 bg-gray-700 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Analyse de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Attaques bloquées vs réussies</h3>
                  <div className="relative pt-1">
                    <div className="flex h-4 overflow-hidden rounded text-xs">
                      <div 
                        className="flex flex-col justify-center bg-green-500 text-white text-center" 
                        style={{ width: `${attacks.length === 0 ? 0 : blockedAttacks / attacks.length * 100}%` }}
                      >
                        <span className="text-xs px-1">{blockedAttacks}</span>
                      </div>
                      <div 
                        className="flex flex-col justify-center bg-red-500 text-white text-center" 
                        style={{ width: `${attacks.length === 0 ? 0 : successfulAttacks / attacks.length * 100}%` }}
                      >
                        <span className="text-xs px-1">{successfulAttacks}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Bloquées</span>
                      <span>Réussies</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Zones compromises</h3>
                  {compromisedZones.length === 0 ? (
                    <p className="text-sm text-green-400">Aucune zone compromise</p>
                  ) : (
                    <div className="space-y-1">
                      {compromisedZones.map(zoneId => {
                        const zone = zones.find(z => z.id === zoneId);
                        return zone ? (
                          <p key={zoneId} className="text-sm text-red-400 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {zone.name} (Importance: {zone.importance}/10)
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert className={
            score > 800 ? "bg-green-900/20 border-green-600/30" :
            score > 500 ? "bg-amber-900/20 border-amber-600/30" :
            score > 300 ? "bg-orange-900/20 border-orange-600/30" :
            "bg-red-900/20 border-red-600/30"
          }>
            <AlertTitle className={
              score > 800 ? "text-green-400" :
              score > 500 ? "text-amber-400" :
              score > 300 ? "text-orange-400" :
              "text-red-400"
            }>
              Évaluation globale
            </AlertTitle>
            <AlertDescription className="text-gray-300">
              {scoreMessage}
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Analyse d'attaques</h2>
          
          <div className="space-y-4 mb-6">
            {attacks.map((attack, index) => {
              const attackType = attackTypes.find(at => at.type === attack.type);
              const targetZone = zones.find(z => z.id === attack.targetZone);
              const blockingDefense = attack.blockingDefense ? 
                defenseInventory.find(d => d.id === attack.blockingDefense) : undefined;
              
              return (
                <div 
                  key={index}
                  className={`bg-gray-700 rounded-lg p-3 border ${attack.blocked ? 'border-green-500/30' : 'border-red-500/30'}`}
                >
                  <div className="flex items-start">
                    <div 
                      className="p-2 rounded mr-3" 
                      style={{ backgroundColor: attackType ? `${attackType.color}20` : 'gray' }}
                    >
                      {attackType?.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-white">{attackType?.name || attack.type}</h3>
                        <Badge className={attack.blocked ? 'bg-green-700' : 'bg-red-700'}>
                          {attack.blocked ? 'Bloquée' : 'Réussie'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-1">
                        Cible: <span className="text-gray-300">{targetZone?.name}</span>
                      </p>
                      
                      {attack.blocked && blockingDefense ? (
                        <p className="text-sm text-green-400 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Bloquée par {blockingDefense.name}
                        </p>
                      ) : (
                        <p className="text-sm text-red-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Zone compromise
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {attacks.length === 0 && (
              <p className="text-gray-400 text-center p-4">
                Aucune attaque n'a été détectée pendant cette simulation.
              </p>
            )}
          </div>
          
          <Separator className="my-4 bg-gray-700" />
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Feedback IA</h3>
            <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">
              {feedback}
            </p>
          </div>
          
          <div className="flex justify-between">
            {/* Bouton pour recommencer le niveau actuel */}
            <Button
              onClick={restartGame}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recommencer ce niveau
            </Button>
            
            {/* Deux boutons conditionnels dépendant du niveau */}
            {currentLevel < maxLevel ? (
              <Button
                onClick={nextLevel}
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                Niveau suivant ({currentLevel + 1}/{maxLevel})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (onGameEnd) onGameEnd(score);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Terminer le jeu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête avec informations sur la difficulté */}
      <div className="bg-gray-800 p-3 flex justify-between items-center shadow-md mb-4">
        <div className="flex items-center">
          <ShieldCheck className="w-6 h-6 text-amber-500 mr-2" />
          <h1 className="text-xl font-bold">Firewall Defense</h1>
          <Badge className="bg-gray-700 text-gray-300 ml-3">
            Niveau {currentLevel}/{maxLevel}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className={
            difficulty === 'Facile' ? 'bg-blue-600' :
            difficulty === 'Moyen' ? 'bg-amber-600' :
            'bg-red-600'
          }>
            Difficulté: {difficulty}
          </Badge>
          
          {gamePhase === 'setup' && (
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-700">
                <BarChart className="w-3 h-3 mr-1" />
                {resources.budget}€
              </Badge>
              <Badge className="bg-blue-700">
                <Users className="w-3 h-3 mr-1" />
                {resources.manpower}
              </Badge>
            </div>
          )}
          
          {gamePhase === 'results' && (
            <Badge className="bg-purple-600">
              Score: {score}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Corps principal du jeu */}
      <div ref={dragRef} className="container mx-auto">
        {gamePhase === 'setup' && renderSetupPhase()}
        {gamePhase === 'simulation' && renderSimulationPhase()}
        {gamePhase === 'results' && renderResultsPhase()}
      </div>
      
      {/* Tutoriel */}
      {showTutorial && renderTutorial()}
    </div>
  );
};

export default FirewallDefenseGameNew;