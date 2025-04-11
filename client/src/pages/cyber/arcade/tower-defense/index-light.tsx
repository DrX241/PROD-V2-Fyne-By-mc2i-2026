import React, { useState, useEffect, useRef } from 'react';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

// Interfaces pour les types d'objets du jeu
interface Tower {
  id: number;
  type: string;
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  type: string;
  position: number;
  health: number;
}

// Version simplifiée de Cyber Defense Tower sans Phaser
export default function CyberDefenseTowerLight() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(15);
  const [waveNumber, setWaveNumber] = useState(0);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [nextEnemyId, setNextEnemyId] = useState(1);
  const [nextTowerId, setNextTowerId] = useState(1);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Prix des tours
  const towerCosts: {[key: string]: number} = {
    firewall: 50,
    antivirus: 100,
    ids: 150
  };

  // Couleurs des tours
  const towerColors: {[key: string]: string} = {
    firewall: '#ff5500',
    antivirus: '#00ff00',
    ids: '#ff00ff'
  };

  // Caractéristiques des tours
  const towerStats: {[key: string]: {damage: number, range: number, cooldown: number}} = {
    firewall: { damage: 20, range: 100, cooldown: 500 },
    antivirus: { damage: 50, range: 150, cooldown: 1000 },
    ids: { damage: 30, range: 200, cooldown: 300 }
  };

  // Caractéristiques des ennemis
  const enemyTypes: {[key: string]: {health: number, speed: number, reward: number, color: string}} = {
    malware: { health: 100, speed: 1, reward: 10, color: '#00ffff' },
    phishing: { health: 200, speed: 0.8, reward: 20, color: '#ffaa00' },
    ddos: { health: 300, speed: 1.2, reward: 30, color: '#ff0000' }
  };

  // Démarrer le jeu
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setGold(200);
    setLives(15);
    setWaveNumber(0);
    setTowers([]);
    setEnemies([]);
    setGameOver(false);
    setNextEnemyId(1);
    setNextTowerId(1);
  };

  // Sélectionner une tour à placer
  const selectTower = (type: string) => {
    if (gold >= towerCosts[type as keyof typeof towerCosts]) {
      setSelectedTower(type);
    } else {
      alert("Pas assez d'or pour cette tour!");
    }
  };

  // Placer une tour sur le terrain
  const placeTower = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTower || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Vérifier qu'on ne place pas trop près du chemin
    const pathY = rect.height / 2;
    if (Math.abs(y - pathY) < 40) {
      return; // Trop près du chemin
    }

    // Vérifier qu'on ne place pas trop près d'une autre tour
    for (const tower of towers) {
      const distance = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
      if (distance < 60) {
        return; // Trop près d'une autre tour
      }
    }

    // Placer la tour
    const cost = towerCosts[selectedTower as keyof typeof towerCosts];
    setGold(gold - cost);
    setTowers([...towers, { id: nextTowerId, type: selectedTower, x, y }]);
    setNextTowerId(nextTowerId + 1);
    setSelectedTower(null);
  };

  // Démarrer une vague d'ennemis
  const startWave = () => {
    if (waveInProgress) return;
    
    setWaveNumber(waveNumber + 1);
    setWaveInProgress(true);
    
    // Nombre d'ennemis basé sur le numéro de vague (max 10)
    const enemyCount = Math.min(5 + waveNumber, 10);
    
    // Générer des ennemis à intervalles réguliers
    let enemiesSpawned = 0;
    const spawnInterval = setInterval(() => {
      if (enemiesSpawned >= enemyCount) {
        clearInterval(spawnInterval);
        return;
      }
      
      // Type d'ennemi basé sur le numéro de vague
      let enemyType = 'malware';
      const roll = Math.random();
      if (waveNumber >= 3 && roll > 0.7) {
        enemyType = 'phishing';
      } else if (waveNumber >= 5 && roll > 0.9) {
        enemyType = 'ddos';
      }
      
      // Ajouter l'ennemi
      setEnemies(prev => [...prev, {
        id: nextEnemyId + enemiesSpawned,
        type: enemyType,
        position: 0, // 0% à 100% du chemin
        health: enemyTypes[enemyType as keyof typeof enemyTypes].health + waveNumber * 20
      }]);
      
      enemiesSpawned++;
    }, 1500);
    
    setNextEnemyId(nextEnemyId + enemyCount);
    
    // Ré-activer le bouton après un délai
    setTimeout(() => {
      setWaveInProgress(false);
    }, enemyCount * 1500 + 3000);
  };

  // Mettre à jour l'état du jeu (boucle de jeu)
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const gameLoop = setInterval(() => {
      setEnemies(prevEnemies => {
        // Faire avancer les ennemis et vérifier s'ils ont atteint la fin
        const updatedEnemies = prevEnemies.map(enemy => {
          const speed = enemyTypes[enemy.type as keyof typeof enemyTypes].speed * 0.5;
          const newPosition = enemy.position + speed;
          
          // Ennemi arrivé à la fin
          if (newPosition >= 100) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameOver(true);
              }
              return newLives;
            });
            return null; // Ennemi à supprimer
          }
          
          return { ...enemy, position: newPosition };
        }).filter(Boolean) as typeof prevEnemies;
        
        // Faire attaquer les tours
        for (const tower of towers) {
          const stats = towerStats[tower.type as keyof typeof towerStats];
          
          // Trouver l'ennemi le plus proche à portée
          let targetEnemy = null;
          let closestDistance = stats.range;
          
          for (const enemy of updatedEnemies) {
            // Calculer la position de l'ennemi sur le chemin
            if (!gameAreaRef.current) continue;
            const pathY = gameAreaRef.current.offsetHeight / 2;
            const pathX = (enemy.position / 100) * gameAreaRef.current.offsetWidth;
            
            // Calculer la distance entre la tour et l'ennemi
            const distance = Math.sqrt(Math.pow(tower.x - pathX, 2) + Math.pow(tower.y - pathY, 2));
            
            if (distance < closestDistance) {
              targetEnemy = enemy;
              closestDistance = distance;
            }
          }
          
          // Attaquer l'ennemi ciblé
          if (targetEnemy) {
            // Mise à jour de la santé de l'ennemi
            const targetIndex = updatedEnemies.findIndex(e => e.id === targetEnemy?.id);
            if (targetIndex !== -1) {
              const enemy = updatedEnemies[targetIndex];
              const newHealth = enemy.health - stats.damage;
              
              if (newHealth <= 0) {
                // Ennemi éliminé
                const reward = enemyTypes[enemy.type as keyof typeof enemyTypes].reward;
                setGold(prev => prev + reward);
                setScore(prev => prev + reward);
                updatedEnemies.splice(targetIndex, 1);
              } else {
                // Ennemi blessé
                updatedEnemies[targetIndex] = { ...enemy, health: newHealth };
              }
            }
          }
        }
        
        return updatedEnemies;
      });
    }, 100);
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, towers]);

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/cyber/arcade">
                <Button variant="outline" size="sm" className="mr-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à CYBER ARCADE
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Cyber Defense Tower (Version Légère)</h1>
            </div>
          </div>
          
          <div className="bg-black/50 p-4 mb-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Instructions:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Construisez des tours de défense pour protéger votre infrastructure</li>
              <li>Les tours <span className="font-bold text-orange-400">Firewall</span> attaquent rapidement avec des dégâts modérés</li>
              <li>Les tours <span className="font-bold text-green-400">Antivirus</span> infligent des dégâts élevés mais sont plus lentes</li>
              <li>Les tours <span className="font-bold text-fuchsia-400">IDS/IPS</span> ont une portée élevée et une cadence rapide</li>
              <li>Empêchez les attaques d'atteindre votre serveur pour garder vos points de vie</li>
              <li>Cliquez sur le bouton "Lancer Vague" pour commencer une nouvelle vague d'attaques</li>
            </ul>
          </div>
          
          {!gameStarted ? (
            <div className="text-center my-8">
              <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                Commencer le jeu
              </Button>
            </div>
          ) : (
            <div className="bg-black rounded-lg overflow-hidden mx-auto mb-4 p-4" style={{ width: '800px', height: '600px' }}>
              {/* Interface du jeu */}
              <div className="flex justify-between items-center bg-gray-800 p-2 mb-4 rounded-md">
                <div className="text-yellow-400 font-bold">Or: {gold}</div>
                <div className="text-red-400 font-bold">Vies: {lives}</div>
                <div className="text-white font-bold">Score: {score}</div>
                <div className="text-cyan-400 font-bold">Vague: {waveNumber}</div>
              </div>
              
              {/* Zone de jeu */}
              <div 
                ref={gameAreaRef}
                className="relative bg-gray-900 rounded-md"
                style={{ height: '480px', cursor: selectedTower ? 'pointer' : 'default' }}
                onClick={placeTower}
              >
                {/* Le chemin */}
                <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-800 transform -translate-y-1/2"></div>
                
                {/* Base à défendre */}
                <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-md flex items-center justify-center">
                  <Shield className="text-white w-8 h-8" />
                </div>
                
                {/* Tours placées */}
                {towers.map(tower => (
                  <div 
                    key={tower.id}
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      left: tower.x - 20, 
                      top: tower.y - 20,
                      backgroundColor: towerColors[tower.type as keyof typeof towerColors],
                      boxShadow: `0 0 15px ${towerColors[tower.type as keyof typeof towerColors]}`
                    }}
                  >
                    <div className="w-6 h-6 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                      {tower.type === 'firewall' && 'F'}
                      {tower.type === 'antivirus' && 'A'}
                      {tower.type === 'ids' && 'I'}
                    </div>
                  </div>
                ))}
                
                {/* Ennemis */}
                {enemies.map(enemy => {
                  const pathY = '50%';
                  const pathX = `${enemy.position}%`;
                  const enemyColor = enemyTypes[enemy.type as keyof typeof enemyTypes].color;
                  
                  // Calculer le pourcentage de santé
                  const maxHealth = enemyTypes[enemy.type as keyof typeof enemyTypes].health + waveNumber * 20;
                  const healthPercent = (enemy.health / maxHealth) * 100;
                  const healthColor = healthPercent > 50 ? '#00ff00' : healthPercent > 25 ? '#ffff00' : '#ff0000';
                  
                  return (
                    <div 
                      key={enemy.id}
                      className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center"
                      style={{ 
                        left: pathX, 
                        top: pathY,
                        backgroundColor: enemyColor
                      }}
                    >
                      <div className="w-4 h-4 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-xs text-white">
                        {enemy.type === 'malware' && 'M'}
                        {enemy.type === 'phishing' && 'P'}
                        {enemy.type === 'ddos' && 'D'}
                      </div>
                      {/* Barre de vie */}
                      <div className="absolute -top-2 w-10 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{ width: `${healthPercent}%`, backgroundColor: healthColor }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Écran de fin de partie */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center">
                    <div className="text-red-500 text-4xl mb-4 font-bold">PARTIE TERMINÉE</div>
                    <div className="text-white text-2xl mb-6">Score final: {score}</div>
                    <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                      Recommencer
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Interface de contrôle */}
              <div className="flex justify-between mt-2">
                <div className="space-x-2">
                  <Button 
                    onClick={() => selectTower('firewall')}
                    className={`bg-orange-600 hover:bg-orange-700 ${selectedTower === 'firewall' ? 'ring-2 ring-white' : ''}`}
                    disabled={gold < towerCosts.firewall}
                  >
                    Firewall ({towerCosts.firewall})
                  </Button>
                  
                  <Button 
                    onClick={() => selectTower('antivirus')}
                    className={`bg-green-600 hover:bg-green-700 ${selectedTower === 'antivirus' ? 'ring-2 ring-white' : ''}`}
                    disabled={gold < towerCosts.antivirus}
                  >
                    Antivirus ({towerCosts.antivirus})
                  </Button>
                  
                  <Button 
                    onClick={() => selectTower('ids')}
                    className={`bg-fuchsia-600 hover:bg-fuchsia-700 ${selectedTower === 'ids' ? 'ring-2 ring-white' : ''}`}
                    disabled={gold < towerCosts.ids}
                  >
                    IDS/IPS ({towerCosts.ids})
                  </Button>
                </div>
                
                <Button 
                  onClick={startWave}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={waveInProgress}
                >
                  {waveInProgress ? "Vague en cours..." : "Lancer Vague"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Ce jeu illustre les concepts de défense en profondeur en cybersécurité. Chaque type de tour représente une couche de protection différente.</p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}