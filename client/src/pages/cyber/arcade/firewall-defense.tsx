import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Shield,
  Lock,
  Database,
  Server,
  Wifi,
  MoveHorizontal,
  Bug,
  TimerReset,
  Circle,
  CirclePlus,
  Play, 
  Pause
} from 'lucide-react';

// Types
type ThreatType = 'virus' | 'trojan' | 'ransomware' | 'spyware';
type DefenseType = 'firewall' | 'antivirus' | 'encryption';
type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

interface Defense {
  id: string;
  type: DefenseType;
  position: { x: number; y: number };
  level: number;
  cost: number;
  range: number;
  power: number;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface Threat {
  id: string;
  type: ThreatType;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  value: number; // Points/resources when defeated
  label: string;
}

interface GameStats {
  resources: number;
  score: number;
  networkHealth: number;
  level: number;
  wave: number;
  elapsedTime: number;
}

export default function FirewallDefense() {
  // Game State
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [defenses, setDefenses] = useState<Defense[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedDefenseType, setSelectedDefenseType] = useState<DefenseType | null>(null);
  const [stats, setStats] = useState<GameStats>({
    resources: 500,
    score: 0,
    networkHealth: 100,
    level: 1,
    wave: 1,
    elapsedTime: 0
  });
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [waveTimer, setWaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Available defense options
  const defenseOptions: Omit<Defense, 'id' | 'position'>[] = [
    {
      type: 'firewall',
      level: 1,
      cost: 100,
      range: 3,
      power: 10,
      label: 'Firewall',
      icon: <Shield className="h-5 w-5" />,
      description: 'Bloque les menaces basiques, efficace contre les virus et les attaques par force brute.'
    },
    {
      type: 'antivirus',
      level: 1,
      cost: 150,
      range: 4,
      power: 15,
      label: 'Antivirus',
      icon: <Bug className="h-5 w-5" />,
      description: 'Détecte et élimine les malwares avancés, efficace contre les trojans et spywares.'
    },
    {
      type: 'encryption',
      level: 1,
      cost: 200,
      range: 2,
      power: 25,
      label: 'Encryption',
      icon: <Lock className="h-5 w-5" />,
      description: 'Protège les données sensibles, très efficace contre les ransomwares.'
    }
  ];

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Start game
  const startGame = () => {
    if (gameStatus === 'idle' || gameStatus === 'paused') {
      setGameStatus('playing');
      setShowInstructions(false);
      
      // Start game timer
      const timer = setInterval(() => {
        setStats(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
      
      setGameTimer(timer);
      
      // Start wave spawner
      startWave();
    }
  };

  // Pause game
  const pauseGame = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      
      // Clear timers
      if (gameTimer) clearInterval(gameTimer);
      if (waveTimer) clearInterval(waveTimer);
    }
  };

  // Reset game
  const resetGame = () => {
    // Clear timers
    if (gameTimer) clearInterval(gameTimer);
    if (waveTimer) clearInterval(waveTimer);
    
    // Reset state
    setDefenses([]);
    setThreats([]);
    setSelectedDefenseType(null);
    setStats({
      resources: 500,
      score: 0,
      networkHealth: 100,
      level: 1,
      wave: 1,
      elapsedTime: 0
    });
    setGameStatus('idle');
    setShowInstructions(true);
  };

  // Start a new wave of threats
  const startWave = () => {
    // Clear existing wave timer
    if (waveTimer) clearInterval(waveTimer);
    
    // Spawn threats at regular intervals
    const timer = setInterval(() => {
      // Get current wave info for spawning threats
      const waveInfo = getWaveInfo(stats.wave);
      
      // Only spawn if we haven't reached the max for this wave
      const currentThreatsOfThisWave = threats.filter(t => t.id.startsWith(`wave-${stats.wave}`)).length;
      
      if (currentThreatsOfThisWave < waveInfo.totalThreats) {
        // Spawn a new threat
        const newThreat = generateThreat(stats.wave);
        setThreats(prev => [...prev, newThreat]);
      } else if (threats.length === 0) {
        // All threats of this wave have been defeated, start next wave
        setStats(prev => ({
          ...prev,
          wave: prev.wave + 1,
          resources: prev.resources + 100 * prev.wave // Bonus resources for completing wave
        }));
        
        // Allow a breather between waves
        pauseGame();
        setTimeout(() => {
          if (gameStatus !== 'lost' && gameStatus !== 'won') {
            startGame();
          }
        }, 3000);
      }
    }, 2000); // Spawn a threat every 2 seconds
    
    setWaveTimer(timer);
  };

  // Get information about a specific wave
  const getWaveInfo = (wave: number) => {
    return {
      totalThreats: 5 + Math.min(15, wave * 2), // More threats per wave, max 25
      threatTypes: wave < 3 ? ['virus', 'trojan'] :
                  wave < 5 ? ['virus', 'trojan', 'spyware'] :
                  ['virus', 'trojan', 'spyware', 'ransomware'],
      threatLevel: Math.min(10, 1 + Math.floor(wave / 2)) // Threat level increases every 2 waves, max 10
    };
  };

  // Generate a new threat based on the current wave
  const generateThreat = (wave: number): Threat => {
    const waveInfo = getWaveInfo(wave);
    const threatType = waveInfo.threatTypes[Math.floor(Math.random() * waveInfo.threatTypes.length)] as ThreatType;
    const threatLevel = waveInfo.threatLevel;
    
    // Base stats for different threat types
    const baseStats = {
      virus: { health: 30, speed: 1, damage: 5, value: 10 },
      trojan: { health: 50, speed: 0.7, damage: 10, value: 20 },
      spyware: { health: 40, speed: 1.2, damage: 7, value: 15 },
      ransomware: { health: 70, speed: 0.5, damage: 15, value: 30 }
    };
    
    // Scale stats based on threat level
    const stats = baseStats[threatType];
    const healthMultiplier = 1 + (threatLevel - 1) * 0.2;
    const damageMultiplier = 1 + (threatLevel - 1) * 0.1;
    const valueMultiplier = 1 + (threatLevel - 1) * 0.5;
    
    const health = Math.floor(stats.health * healthMultiplier);
    
    // Generate threat with a position at the top of the screen
    return {
      id: `wave-${wave}-${generateId()}`,
      type: threatType,
      position: {
        x: 50 + Math.random() * 700, // Random x position
        y: 0 // Start at the top
      },
      health: health,
      maxHealth: health,
      speed: stats.speed,
      damage: Math.floor(stats.damage * damageMultiplier),
      value: Math.floor(stats.value * valueMultiplier),
      label: threatType.charAt(0).toUpperCase() + threatType.slice(1) // Capitalize first letter
    };
  };

  // Place a defense on the board
  const placeDefense = (x: number, y: number) => {
    if (!selectedDefenseType) return;
    
    const defenseOption = defenseOptions.find(d => d.type === selectedDefenseType);
    if (!defenseOption) return;
    
    // Check if we have enough resources
    if (stats.resources < defenseOption.cost) return;
    
    // Create the defense
    const newDefense: Defense = {
      ...defenseOption,
      id: generateId(),
      position: { x, y }
    };
    
    // Add it to the board and deduct resources
    setDefenses(prev => [...prev, newDefense]);
    setStats(prev => ({
      ...prev,
      resources: prev.resources - defenseOption.cost
    }));
    
    // Clear selection
    setSelectedDefenseType(null);
  };

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simplified game board - in a real implementation this would be a full game with canvas/WebGL
  return (
    <HomeLayout>
      <PageTitle title="FIREWALL DEFENSE" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center mb-6">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'Arcade
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Firewall Defense</h1>
          </div>
          
          {/* Game Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game controls and stats */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 h-full flex flex-col">
                <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                  <Server className="mr-2 h-5 w-5 text-blue-400" />
                  Tableau de bord
                </h2>
                
                {/* Game stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Ressources</div>
                    <div className="text-lg font-semibold text-white">{stats.resources}</div>
                  </div>
                  <div className="bg-slate-700/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Score</div>
                    <div className="text-lg font-semibold text-white">{stats.score}</div>
                  </div>
                  <div className="bg-slate-700/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Santé réseau</div>
                    <div className="text-lg font-semibold text-white">{stats.networkHealth}%</div>
                  </div>
                  <div className="bg-slate-700/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Vague</div>
                    <div className="text-lg font-semibold text-white">{stats.wave}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="bg-slate-700/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Temps écoulé</div>
                    <div className="text-lg font-semibold text-white">{formatTime(stats.elapsedTime)}</div>
                  </div>
                </div>
                
                {/* Game controls */}
                <div className="space-y-4 mb-6">
                  {gameStatus === 'idle' ? (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-700 hover:bg-green-600 text-white flex items-center justify-center"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Commencer le jeu
                    </Button>
                  ) : gameStatus === 'playing' ? (
                    <Button
                      onClick={pauseGame}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-white flex items-center justify-center"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-700 hover:bg-green-600 text-white flex items-center justify-center"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Reprendre
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetGame}
                    className="w-full bg-red-800 hover:bg-red-700 text-white flex items-center justify-center"
                  >
                    <TimerReset className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
                
                {/* Defense selection */}
                <h3 className="text-white font-medium mb-3">Sélectionnez une défense</h3>
                <div className="space-y-3 mb-auto">
                  {defenseOptions.map((defense) => (
                    <div 
                      key={defense.type}
                      onClick={() => stats.resources >= defense.cost && setSelectedDefenseType(defense.type)}
                      className={`p-3 rounded-lg border flex items-center cursor-pointer transition-colors ${
                        selectedDefenseType === defense.type 
                          ? 'bg-blue-800 border-blue-500' 
                          : stats.resources >= defense.cost
                          ? 'bg-slate-700/40 border-slate-600 hover:bg-slate-700'
                          : 'bg-slate-800/40 border-slate-700 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="bg-slate-800 p-2 rounded-md mr-3">
                        {defense.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="text-white font-medium">{defense.label}</div>
                        <div className="text-slate-400 text-xs">Coût: {defense.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selected defense info */}
                {selectedDefenseType && (
                  <div className="mt-4 bg-slate-700/40 rounded-lg p-3">
                    <h3 className="text-white font-medium mb-1">
                      {defenseOptions.find(d => d.type === selectedDefenseType)?.label}
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">
                      {defenseOptions.find(d => d.type === selectedDefenseType)?.description}
                    </p>
                    <div className="text-xs text-slate-400">
                      Cliquez sur la zone de jeu pour placer cette défense
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Game board */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 h-full">
                {/* Network to protect */}
                <div className="bg-slate-900 rounded-xl h-[600px] relative overflow-hidden">
                  {/* Database to protect */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <Database className="h-20 w-20 text-blue-500" />
                    <div className="text-white font-medium mt-2">Serveur protégé</div>
                    <div className="w-32 h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${stats.networkHealth}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Game elements would be rendered here in a real implementation */}
                  {/* For this demo, we'll show placeholders */}
                  
                  {/* Defense placeholders */}
                  {defenses.map(defense => (
                    <div 
                      key={defense.id}
                      className="absolute flex flex-col items-center"
                      style={{ 
                        left: `${defense.position.x}px`, 
                        top: `${defense.position.y}px`,
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        defense.type === 'firewall' ? 'bg-red-800' :
                        defense.type === 'antivirus' ? 'bg-green-800' :
                        'bg-blue-800'
                      }`}>
                        {defense.icon}
                      </div>
                      <div className="text-xs text-white mt-1">{defense.label}</div>
                    </div>
                  ))}
                  
                  {/* Threat placeholders */}
                  {threats.map(threat => (
                    <div 
                      key={threat.id}
                      className="absolute flex flex-col items-center"
                      style={{ 
                        left: `${threat.position.x}px`, 
                        top: `${threat.position.y}px`,
                      }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        threat.type === 'virus' ? 'bg-yellow-800' :
                        threat.type === 'trojan' ? 'bg-purple-800' :
                        threat.type === 'ransomware' ? 'bg-red-800' :
                        'bg-slate-800'
                      }`}>
                        <Bug className="h-6 w-6" />
                      </div>
                      <div className="text-xs text-white mt-1">{threat.label}</div>
                      <div className="w-16 h-1.5 mt-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(threat.health / threat.maxHealth) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Game instructions */}
                  {showInstructions && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="max-w-md p-6 bg-slate-800 rounded-lg text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Firewall Defense</h2>
                        <p className="text-slate-300 mb-4">
                          Défendez votre réseau contre les cybermenaces ! Placez des défenses stratégiquement pour protéger votre serveur des attaques.
                        </p>
                        <p className="text-slate-300 mb-6">
                          Chaque type de défense est efficace contre différentes menaces. Gérez vos ressources judicieusement pour survivre aux vagues d'attaques.
                        </p>
                        <Button 
                          onClick={startGame}
                          className="bg-green-700 hover:bg-green-600 text-white"
                        >
                          Commencer le jeu
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Click handler for game board - simplified for the prototype */}
                  {selectedDefenseType && (
                    <div 
                      className="absolute inset-0 cursor-pointer" 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        placeDefense(x, y);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Info */}
          <div className="mt-6 bg-slate-800/70 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl text-white font-semibold mb-4">Guide du jeu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg text-white font-medium mb-2">Défenses</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-red-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Firewall</div>
                      <p className="text-slate-300 text-sm">
                        Bloque les menaces basiques, efficace contre les virus et les attaques par force brute.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Bug className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Antivirus</div>
                      <p className="text-slate-300 text-sm">
                        Détecte et élimine les malwares avancés, efficace contre les trojans et spywares.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Encryption</div>
                      <p className="text-slate-300 text-sm">
                        Protège les données sensibles, très efficace contre les ransomwares.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg text-white font-medium mb-2">Menaces</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-yellow-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Bug className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Virus</div>
                      <p className="text-slate-300 text-sm">
                        Menace basique, mais rapide. Contrecarrée efficacement par les firewalls.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Bug className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Trojan</div>
                      <p className="text-slate-300 text-sm">
                        Se déguise en logiciel légitime, difficile à détecter sans antivirus.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-red-800 p-1.5 rounded-md mr-3 mt-0.5">
                      <Bug className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Ransomware</div>
                      <p className="text-slate-300 text-sm">
                        Chiffre vos données et demande une rançon. L'encryption est votre meilleure défense.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}