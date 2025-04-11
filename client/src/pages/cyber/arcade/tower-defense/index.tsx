import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

// Scène de préchargement pour charger les ressources
class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Afficher une barre de chargement
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Chargement...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Événements de progression
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x0080ff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      this.scene.start('MainScene');
    });

    // Charger les ressources ici
    // Temporairement utiliser des formes géométriques, puis ajouter des images plus tard
    
    // Créer texture pour la base
    this.textures.generate('base', { data: ['2222'], pixelWidth: 64 });
    
    // Créer texture pour les tours
    this.textures.generate('firewall', { data: ['0000'], pixelWidth: 32 });
    this.textures.generate('antivirus', { data: ['0000'], pixelWidth: 32 });
    this.textures.generate('ids', { data: ['0000'], pixelWidth: 32 });
    
    // Créer texture pour les ennemis
    this.textures.generate('malware', { data: ['1111'], pixelWidth: 24 });
    this.textures.generate('phishing', { data: ['1111'], pixelWidth: 24 });
    this.textures.generate('ddos', { data: ['1111'], pixelWidth: 24 });
    
    // Simuler le chargement de ressources
    for (let i = 0; i < 30; i++) {
      this.load.image('placeholder' + i, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    }
  }
}

// Scène principale du jeu
class MainScene extends Phaser.Scene {
  private path: Phaser.Curves.Path | undefined;
  private enemies: Phaser.GameObjects.Group | undefined;
  private towers: Phaser.GameObjects.Group | undefined;
  private base: Phaser.GameObjects.Sprite | undefined;
  private placementMode: string | null = null;
  private gold = 100;
  private lives = 10;
  private score = 0;
  private waveNumber = 0;
  private goldText: Phaser.GameObjects.Text | undefined;
  private livesText: Phaser.GameObjects.Text | undefined;
  private scoreText: Phaser.GameObjects.Text | undefined;
  private waveText: Phaser.GameObjects.Text | undefined;
  private nextWaveButton: Phaser.GameObjects.Text | undefined;
  private towerButtons: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Définir l'arrière-plan
    this.add.rectangle(0, 0, 800, 600, 0x102030).setOrigin(0, 0);
    
    // Créer le chemin que les ennemis vont suivre
    this.createPath();
    
    // Afficher le chemin
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xffffff, 0.3);
    this.path?.draw(graphics);
    
    // Créer la base (objectif à défendre)
    this.base = this.add.sprite(650, 300, 'base').setTint(0x3050ff);
    
    // Groupes pour les tours et les ennemis
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    // Interface utilisateur
    this.createUI();
    
    // Gestion des entrées
    this.input.on('pointerdown', this.handleClick, this);
    
    // Initialiser le jeu
    this.updateUI();
  }

  createPath() {
    this.path = new Phaser.Curves.Path(0, 300);
    this.path.lineTo(100, 300);
    this.path.lineTo(100, 150);
    this.path.lineTo(300, 150);
    this.path.lineTo(300, 450);
    this.path.lineTo(500, 450);
    this.path.lineTo(500, 300);
    this.path.lineTo(650, 300);
  }

  createUI() {
    // Zone d'UI en haut
    this.add.rectangle(0, 0, 800, 60, 0x000000, 0.7).setOrigin(0, 0);
    
    // Informations de jeu
    this.goldText = this.add.text(20, 15, 'Or: 100', { fontSize: '20px', color: '#ffdd00' });
    this.livesText = this.add.text(150, 15, 'Vies: 10', { fontSize: '20px', color: '#ff5555' });
    this.scoreText = this.add.text(270, 15, 'Score: 0', { fontSize: '20px', color: '#ffffff' });
    this.waveText = this.add.text(410, 15, 'Vague: 0', { fontSize: '20px', color: '#00ffff' });
    
    // Boutons pour les tours
    this.towerButtons.firewall = this.add.text(20, 540, 'Firewall (50)', { fontSize: '16px', color: '#ffffff', backgroundColor: '#444444' })
      .setInteractive()
      .setPadding(10)
      .on('pointerdown', () => this.selectTower('firewall'));
    
    this.towerButtons.antivirus = this.add.text(170, 540, 'Antivirus (100)', { fontSize: '16px', color: '#ffffff', backgroundColor: '#444444' })
      .setInteractive()
      .setPadding(10)
      .on('pointerdown', () => this.selectTower('antivirus'));
    
    this.towerButtons.ids = this.add.text(320, 540, 'IDS/IPS (150)', { fontSize: '16px', color: '#ffffff', backgroundColor: '#444444' })
      .setInteractive()
      .setPadding(10)
      .on('pointerdown', () => this.selectTower('ids'));
    
    // Bouton pour la prochaine vague
    this.nextWaveButton = this.add.text(600, 540, 'Lancer Vague', { fontSize: '16px', color: '#ffffff', backgroundColor: '#007700' })
      .setInteractive()
      .setPadding(10)
      .on('pointerdown', () => this.startWave());
  }

  selectTower(type: string) {
    // Vérifier si on a assez d'or
    const cost = this.getTowerCost(type);
    if (this.gold < cost) {
      return; // Pas assez d'or
    }
    
    this.placementMode = type;
    
    // Mettre à jour les boutons
    Object.values(this.towerButtons).forEach(btn => {
      btn.setBackgroundColor('#444444');
    });
    this.towerButtons[type].setBackgroundColor('#0088ff');
  }

  getTowerCost(type: string): number {
    switch (type) {
      case 'firewall': return 50;
      case 'antivirus': return 100;
      case 'ids': return 150;
      default: return 0;
    }
  }

  getTowerColor(type: string): number {
    switch (type) {
      case 'firewall': return 0xff5500;
      case 'antivirus': return 0x00ff00;
      case 'ids': return 0xff00ff;
      default: return 0xffffff;
    }
  }

  getTowerRange(type: string): number {
    switch (type) {
      case 'firewall': return 100;
      case 'antivirus': return 150;
      case 'ids': return 200;
      default: return 100;
    }
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    // Si on est en mode placement de tour
    if (this.placementMode) {
      // Ne pas placer trop près du chemin ou d'autres tours
      if (this.canPlaceTower(pointer.x, pointer.y)) {
        this.placeTower(pointer.x, pointer.y, this.placementMode);
        this.gold -= this.getTowerCost(this.placementMode);
        this.updateUI();
      }
      
      // Sortir du mode placement
      this.placementMode = null;
      Object.values(this.towerButtons).forEach(btn => {
        btn.setBackgroundColor('#444444');
      });
    }
  }

  canPlaceTower(x: number, y: number): boolean {
    // Vérifier si c'est trop près du chemin
    const pathPoints = this.path?.getPoints();
    const minDistanceToPath = 40; // Distance minimale au chemin
    
    if (pathPoints) {
      for (let i = 0; i < pathPoints.length; i++) {
        const distance = Phaser.Math.Distance.Between(x, y, pathPoints[i].x, pathPoints[i].y);
        if (distance < minDistanceToPath) {
          return false;
        }
      }
    }
    
    // Vérifier si c'est trop près d'une autre tour
    const minDistanceToTower = 60; // Distance minimale à une autre tour
    let canPlace = true;
    
    this.towers?.getChildren().forEach((tower) => {
      const towerSprite = tower as Phaser.GameObjects.Sprite;
      const distance = Phaser.Math.Distance.Between(x, y, towerSprite.x, towerSprite.y);
      if (distance < minDistanceToTower) {
        canPlace = false;
      }
    });
    
    // Pas trop près du bord supérieur (UI)
    if (y < 70) {
      return false;
    }
    
    // Pas trop près du bord inférieur (UI)
    if (y > 530) {
      return false;
    }
    
    return canPlace;
  }

  placeTower(x: number, y: number, type: string) {
    const tower = this.add.sprite(x, y, type).setTint(this.getTowerColor(type));
    
    // Ajouter une représentation visuelle de la portée
    const range = this.getTowerRange(type);
    const rangeCircle = this.add.circle(x, y, range, 0xffffff, 0.1);
    
    // Stocker des informations sur la tour
    tower.setData('type', type);
    tower.setData('range', range);
    tower.setData('rangeCircle', rangeCircle);
    tower.setData('cooldown', 0);
    tower.setData('target', null);
    
    this.towers?.add(tower);
  }

  startWave() {
    this.waveNumber++;
    this.waveText?.setText(`Vague: ${this.waveNumber}`);
    
    // Nombre d'ennemis basé sur le numéro de vague
    const enemyCount = 5 + this.waveNumber * 2;
    
    // Programmer l'apparition des ennemis
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 1000, () => this.spawnEnemy());
    }
    
    // Désactiver le bouton pendant la vague
    if (this.nextWaveButton) {
      this.nextWaveButton.setBackgroundColor('#555555');
      this.nextWaveButton.disableInteractive();
      
      // Réactiver le bouton après un délai
      this.time.delayedCall(enemyCount * 1000 + 5000, () => {
        if (this.nextWaveButton) {
          this.nextWaveButton.setBackgroundColor('#007700');
          this.nextWaveButton.setInteractive();
        }
      });
    }
  }

  spawnEnemy() {
    if (!this.path) return;
    
    // Types d'ennemis selon la vague
    let type = 'malware';
    const roll = Math.random();
    
    if (this.waveNumber >= 3 && roll > 0.7) {
      type = 'phishing';
    } else if (this.waveNumber >= 5 && roll > 0.9) {
      type = 'ddos';
    }
    
    // Créer l'ennemi
    const enemy = this.add.follower(this.path, 0, 300, type);
    
    // Configurer l'ennemi
    let speed = 1/10000; // Vitesse de base
    let health = 100;    // Santé de base
    let reward = 10;     // Récompense de base
    
    switch (type) {
      case 'phishing':
        enemy.setTint(0xffaa00);
        speed = 1/12000;
        health = 200;
        reward = 20;
        break;
      case 'ddos':
        enemy.setTint(0xff0000);
        speed = 1/8000;
        health = 300;
        reward = 30;
        break;
      default: // malware
        enemy.setTint(0x00ffff);
        break;
    }
    
    // Ajouter un modificateur de difficulté basé sur la vague
    health += this.waveNumber * 20;
    
    // Stocker les données de l'ennemi
    enemy.setData('type', type);
    enemy.setData('health', health);
    enemy.setData('maxHealth', health);
    enemy.setData('reward', reward);
    
    // Ajouter l'ennemi au groupe
    this.enemies?.add(enemy);
    
    // Faire suivre le chemin à l'ennemi
    enemy.startFollow({
      duration: 10000 / speed,
      rotateToPath: true,
      onComplete: () => this.enemyReachedEnd(enemy)
    });
    
    // Ajouter une barre de vie
    const healthBar = this.add.rectangle(enemy.x, enemy.y - 20, 24, 3, 0x00ff00);
    enemy.setData('healthBar', healthBar);
  }

  enemyReachedEnd(enemy: Phaser.GameObjects.PathFollower) {
    // Réduire les vies du joueur
    this.lives--;
    this.updateUI();
    
    // Supprimer l'ennemi
    this.removeEnemy(enemy);
    
    // Vérifier la fin de partie
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  removeEnemy(enemy: Phaser.GameObjects.PathFollower) {
    // Supprimer la barre de vie
    const healthBar = enemy.getData('healthBar');
    if (healthBar) {
      healthBar.destroy();
    }
    
    // Supprimer l'ennemi
    enemy.destroy();
  }

  gameOver() {
    // Afficher le message de fin
    const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8).setOrigin(0, 0);
    const gameOverText = this.add.text(400, 250, 'PARTIE TERMINÉE', { fontSize: '40px', color: '#ff0000' }).setOrigin(0.5);
    const scoreText = this.add.text(400, 300, `Score final: ${this.score}`, { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5);
    const restartText = this.add.text(400, 350, 'Cliquez pour recommencer', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    
    // Désactiver les interactions du jeu
    this.input.off('pointerdown', this.handleClick, this);
    
    // Permettre de recommencer
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  damageEnemy(enemy: Phaser.GameObjects.Sprite, damage: number) {
    const currentHealth = enemy.getData('health');
    const newHealth = currentHealth - damage;
    enemy.setData('health', newHealth);
    
    // Mettre à jour la barre de vie
    const healthBar = enemy.getData('healthBar');
    if (healthBar) {
      const healthPercent = newHealth / enemy.getData('maxHealth');
      healthBar.width = 24 * healthPercent;
      healthBar.fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    }
    
    // Vérifier si l'ennemi est mort
    if (newHealth <= 0) {
      // Ajouter de l'or et des points
      this.gold += enemy.getData('reward');
      this.score += enemy.getData('reward');
      this.updateUI();
      
      // Effet visuel
      this.add.circle(enemy.x, enemy.y, 30, 0xffffff, 0.7).setDepth(1);
      this.tweens.add({
        targets: enemy,
        alpha: 0,
        scale: 1.5,
        duration: 100,
        onComplete: () => this.removeEnemy(enemy as Phaser.GameObjects.PathFollower)
      });
    }
  }

  updateUI() {
    this.goldText?.setText(`Or: ${this.gold}`);
    this.livesText?.setText(`Vies: ${this.lives}`);
    this.scoreText?.setText(`Score: ${this.score}`);
  }

  update(time: number, delta: number) {
    // Mettre à jour les barres de vie des ennemis
    this.enemies?.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.GameObjects.Sprite;
      const healthBar = enemySprite.getData('healthBar');
      if (healthBar) {
        healthBar.x = enemySprite.x;
        healthBar.y = enemySprite.y - 20;
      }
    });
    
    // Les tours attaquent les ennemis
    this.towers?.getChildren().forEach((tower) => {
      const towerSprite = tower as Phaser.GameObjects.Sprite;
      const cooldown = towerSprite.getData('cooldown') - delta;
      
      if (cooldown <= 0) {
        // Trouver un ennemi à portée
        const range = towerSprite.getData('range');
        let closestEnemy: Phaser.GameObjects.Sprite | null = null;
        let closestDistance = range;
        
        this.enemies?.getChildren().forEach((enemy) => {
          const enemySprite = enemy as Phaser.GameObjects.Sprite;
          const distance = Phaser.Math.Distance.Between(
            towerSprite.x, towerSprite.y,
            enemySprite.x, enemySprite.y
          );
          
          if (distance < closestDistance) {
            closestEnemy = enemySprite;
            closestDistance = distance;
          }
        });
        
        // Attaquer l'ennemi le plus proche
        if (closestEnemy) {
          // Effet visuel de l'attaque (ligne de la tour à l'ennemi)
          const line = this.add.line(
            0, 0,
            towerSprite.x, towerSprite.y,
            closestEnemy.x, closestEnemy.y,
            this.getTowerColor(towerSprite.getData('type'))
          ).setOrigin(0, 0).setAlpha(0.6);
          
          // Faire disparaître la ligne après un délai
          this.tweens.add({
            targets: line,
            alpha: 0,
            duration: 200,
            onComplete: () => line.destroy()
          });
          
          // Infliger des dégâts selon le type de tour
          let damage = 20; // Dégâts de base
          switch (towerSprite.getData('type')) {
            case 'firewall':
              damage = 20;
              towerSprite.setData('cooldown', 500); // Temps de recharge en ms
              break;
            case 'antivirus':
              damage = 50;
              towerSprite.setData('cooldown', 1000);
              break;
            case 'ids':
              damage = 30;
              towerSprite.setData('cooldown', 300);
              break;
          }
          
          this.damageEnemy(closestEnemy as Phaser.GameObjects.Sprite, damage);
        } else {
          // Pas d'ennemi à portée, réinitialiser le temps de recharge
          towerSprite.setData('cooldown', 100);
        }
      } else {
        // Mettre à jour le temps de recharge
        towerSprite.setData('cooldown', cooldown);
      }
    });
  }
}

// Configuration du jeu Phaser
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, MainScene]
};

// Composant React
export default function CyberDefenseTower() {
  const gameRef = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !game.current) {
      // Initialiser le jeu
      game.current = new Phaser.Game({
        ...config,
        parent: gameRef.current
      });
    }

    // Nettoyer le jeu quand le composant est démonté
    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, []);

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
              <h1 className="text-2xl font-bold">Cyber Defense Tower</h1>
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
          
          <div className="overflow-auto">
            <div ref={gameRef} id="game-container" className="bg-black rounded-lg overflow-hidden mx-auto" style={{ width: '800px', height: '600px' }} />
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Ce jeu illustre les concepts de défense en profondeur en cybersécurité. Chaque type de tour représente une couche de protection différente.</p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}