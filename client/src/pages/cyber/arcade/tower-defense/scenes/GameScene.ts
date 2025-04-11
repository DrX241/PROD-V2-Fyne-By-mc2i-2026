import Phaser from 'phaser';

// Types des entités de jeu
interface Tower {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: string;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  rangeGraphics?: Phaser.GameObjects.Graphics;
  target?: Enemy | null;
  cost: number;
}

interface Enemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: string;
  health: number;
  maxHealth: number;
  speed: number;
  value: number; // Récompense en crédits
  healthBar?: Phaser.GameObjects.Graphics;
  isDead?: boolean;
  waypoint?: number;
  pathIndex?: number;
}

interface Path {
  x: number;
  y: number;
}

export class GameScene extends Phaser.Scene {
  // Propriétés du jeu
  private map!: Phaser.Tilemaps.Tilemap;
  private tiles!: Phaser.Tilemaps.Tileset;
  private backgroundLayer!: Phaser.Tilemaps.TilemapLayer;
  private pathLayer!: Phaser.Tilemaps.TilemapLayer;
  private buildLayer!: Phaser.Tilemaps.TilemapLayer;
  
  // Entités du jeu
  private base!: Phaser.Physics.Arcade.Sprite;
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private bullets!: Phaser.Physics.Arcade.Group;
  private path: Path[] = [];
  
  // État du jeu
  private money: number = 500;
  private wave: number = 0;
  private enemiesLeft: number = 0;
  private baseHealth: number = 100;
  private gameStarted: boolean = false;
  private waveInProgress: boolean = false;
  private difficulty: string = 'medium';
  private score: number = 0;
  
  // Timer et événements
  private waveTimer!: Phaser.Time.TimerEvent;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  
  // Placement de tour
  private placingTower: boolean = false;
  private towerPreview?: Phaser.GameObjects.Sprite;
  private rangePreview?: Phaser.GameObjects.Graphics;
  private selectedTowerType: string = '';
  private validPlacement: boolean = false;
  
  // Effets et animations
  private explosions!: Phaser.GameObjects.Group;
  
  // Sons
  // Effet sonore désactivé
  // private shootSound!: Phaser.Sound.BaseSound;
  private explosionSound!: Phaser.Sound.BaseSound;
  private buildSound!: Phaser.Sound.BaseSound;
  private waveStartSound!: Phaser.Sound.BaseSound;
  private gameOverSound!: Phaser.Sound.BaseSound;
  private backgroundMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // Réinitialiser les variables du jeu
    this.towers = [];
    this.enemies = [];
    this.path = [];
    this.money = 500;
    this.wave = 0;
    this.enemiesLeft = 0;
    this.baseHealth = 100;
    this.gameStarted = false;
    this.waveInProgress = false;
    this.score = 0;
    
    // Récupérer la difficulté depuis l'interface React
    if (window.towerDefense && window.towerDefense.getDifficulty) {
      this.difficulty = window.towerDefense.getDifficulty();
    }
  }

  create() {
    // Récupérer les paramètres de l'interface React
    if (window.towerDefense) {
      if (window.towerDefense.updateMoney) {
        window.towerDefense.updateMoney(this.money);
      }
      if (window.towerDefense.updateWave) {
        window.towerDefense.updateWave(this.wave);
      }
      if (window.towerDefense.updateHealth) {
        window.towerDefense.updateHealth(this.baseHealth);
      }
    }
    
    // Charger les sons (avec gestion d'erreur)
    try {
      // Les sons sont désactivés pour éviter les erreurs avec les ressources
      // this.shootSound = this.sound.add('shoot', { volume: 0.3 });
      // this.explosionSound = this.sound.add('explosion', { volume: 0.3 });
      // this.buildSound = this.sound.add('build', { volume: 0.5 });
      // this.waveStartSound = this.sound.add('wave_start', { volume: 0.5 });
      // this.gameOverSound = this.sound.add('game_over', { volume: 0.6 });
    } catch (error) {
      console.log('Sons non disponibles');
    }
    
    // Désactiver la musique de fond pour éviter les erreurs
    // this.backgroundMusic = this.sound.get('background_music');
    // if (!this.backgroundMusic?.isPlaying) {
    //   this.backgroundMusic = this.sound.add('background_music', { volume: 0.3, loop: true });
    //   this.backgroundMusic.play();
    // }
    
    // Créer un fond cybernétique
    this.createBackground();
    
    // Créer la carte à partir des données JSON
    this.createMap();
    
    // Calculer le chemin pour les ennemis
    this.calculatePath();
    
    // Ajouter la base/serveur
    this.createBase();
    
    // Créer le groupe de balles/projectiles
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true
    });
    
    // Créer le groupe d'explosions
    this.explosions = this.add.group();
    
    // Activer les interactions
    this.setupInputEvents();
    
    // Démarrer l'interface utilisateur
    this.scene.launch('UIScene', { 
      money: this.money,
      wave: this.wave,
      health: this.baseHealth,
      gameScene: this
    });
    
    // Animation d'entrée
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Lancer la première vague automatiquement après un délai
    this.time.delayedCall(3000, () => {
      this.startNextWave();
    });
  }

  update(time: number, delta: number) {
    // Mise à jour des tours (recherche de cibles, tir)
    this.updateTowers(time);
    
    // Mise à jour des ennemis (mouvement sur le chemin)
    this.updateEnemies(delta);
    
    // Mise à jour du placement de tour
    this.updateTowerPlacement();
    
    // Vérifier l'état de la vague en cours
    this.checkWaveStatus();
  }
  
  // Création du fond et de la grille cybernétique
  private createBackground() {
    // Utiliser le fond cybernétique procédural généré dans PreloadScene
    if (this.textures.exists('cyber_background')) {
      // Utiliser le fond généré
      this.add.image(0, 0, 'cyber_background')
        .setOrigin(0, 0)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    } else {
      // Fallback - Ajouter un fond noir avec une grille simple
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
        .setOrigin(0, 0);
      
      // Créer une grille cybernétique
      const grid = this.add.grid(
        0, 0,
        this.cameras.main.width * 2, this.cameras.main.height * 2,
        64, 64,
        0, 0,
        0x0066ff, 0.1
      ).setOrigin(0, 0);
      
      // Ajouter une légère animation à la grille
      this.tweens.add({
        targets: grid,
        alpha: 0.05,
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Ajouter le logo du jeu
    const gameTitle = this.add.text(
      this.cameras.main.width / 2,
      60,
      'CYBERSEC TOWER DEFENSE',
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '32px',
        color: '#00ffff',
        stroke: '#0000aa',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Animation du titre
    this.tweens.add({
      targets: gameTitle,
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
    
    // Ajouter un sous-titre
    this.add.text(
      this.cameras.main.width / 2,
      100,
      'Protégez votre réseau contre les cyberattaques',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '18px',
        color: '#88ccff'
      }
    ).setOrigin(0.5);
    
    // Ajouter des circuits imprimés et autres éléments visuels cyber
    this.addCyberElements();
  }
  
  // Ajouter des éléments visuels cybernétiques en arrière-plan
  private addCyberElements() {
    // Particules simplifiées sans utiliser l'API des émetteurs (qui a changé dans Phaser 3.88)
    // Créer des particules statiques à la place
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      
      const particle = this.add.image(x, y, 'bullet')
        .setScale(0.1)
        .setAlpha(0.4)
        .setTint(
          Phaser.Utils.Array.GetRandom([0x00ffff, 0x0088ff, 0x00ff88])
        )
        .setBlendMode(Phaser.BlendModes.ADD);
      
      // Animation simple
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-100, 100),
        y: y + Phaser.Math.Between(-100, 100),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(2000, 4000),
        onComplete: () => {
          particle.destroy();
          // Recréer la particule pour un effet continu
          this.time.delayedCall(Phaser.Math.Between(500, 2000), () => {
            this.addSingleParticle();
          });
        }
      });
    }
  }
  
  // Ajouter une seule particule (pour le remplacement continu)
  private addSingleParticle() {
    const x = Phaser.Math.Between(0, this.cameras.main.width);
    const y = Phaser.Math.Between(0, this.cameras.main.height);
    
    const particle = this.add.image(x, y, 'bullet')
      .setScale(0.1)
      .setAlpha(0.4)
      .setTint(
        Phaser.Utils.Array.GetRandom([0x00ffff, 0x0088ff, 0x00ff88])
      )
      .setBlendMode(Phaser.BlendModes.ADD);
    
    // Animation simple
    this.tweens.add({
      targets: particle,
      x: x + Phaser.Math.Between(-100, 100),
      y: y + Phaser.Math.Between(-100, 100),
      alpha: 0,
      scale: 0,
      duration: Phaser.Math.Between(2000, 4000),
      onComplete: () => {
        particle.destroy();
        // Recréer la particule pour un effet continu
        this.time.delayedCall(Phaser.Math.Between(500, 2000), () => {
          this.addSingleParticle();
        });
      }
    });
  }
  
  // Création de la carte de jeu
  private createMap() {
    // Comme nous n'avons pas une carte Tiled réelle, nous allons créer une carte procédurale
    
    // Créer une grille de base pour représenter la carte
    const gridSize = 64;
    const width = Math.floor(this.cameras.main.width / gridSize);
    const height = Math.floor(this.cameras.main.height / gridSize);
    
    // Définir manuellement un chemin de base (à personnaliser selon les besoins)
    this.path = [
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 6 },
      { x: 11, y: 6 },
      { x: 11, y: 4 },
      { x: 14, y: 4 }
    ];
    
    // Convertir les coordonnées de grille en coordonnées de pixel
    this.path = this.path.map(p => ({
      x: p.x * gridSize + gridSize / 2,
      y: p.y * gridSize + gridSize / 2
    }));
    
    // Visualiser le chemin (pour debug ou effet visuel)
    this.visualizePath();
  }
  
  // Visualiser le chemin pour les ennemis
  private visualizePath() {
    const graphics = this.add.graphics();
    
    // Dessiner le chemin
    graphics.lineStyle(6, 0x00ffff, 0.3);
    graphics.beginPath();
    
    // Dessiner du premier point au dernier
    graphics.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      graphics.lineTo(this.path[i].x, this.path[i].y);
    }
    
    graphics.strokePath();
    
    // Ajouter des marqueurs aux points du chemin
    this.path.forEach((point, i) => {
      if (i !== 0 && i !== this.path.length - 1) {
        this.add.circle(point.x, point.y, 3, 0x00ffff, 0.6);
      }
    });
  }
  
  // Calculer le chemin complet pour les ennemis
  private calculatePath() {
    // Dans un cas réel, nous calculerions le chemin à partir de points clés ou d'une carte
    // Mais ici, nous utilisons le chemin prédéfini
  }
  
  // Créer la base/serveur (point à défendre)
  private createBase() {
    // Placement à la fin du chemin
    const endPoint = this.path[this.path.length - 1];
    
    // Créer le sprite de la base
    this.base = this.physics.add.sprite(endPoint.x + 64, endPoint.y, 'base')
      .setScale(0.8);
    
    // Animation de pulsation pour la base
    this.tweens.add({
      targets: this.base,
      scale: 0.85,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    
    // Ajouter un effet de lumière autour de la base
    const baseGlow = this.add.circle(this.base.x, this.base.y, 50, 0x0088ff, 0.3);
    
    // Animation de pulsation pour le halo
    this.tweens.add({
      targets: baseGlow,
      alpha: 0.5,
      radius: 55,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }
  
  // Configuration des événements d'entrée (clic, touches)
  private setupInputEvents() {
    // Clic pour placer une tour
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.placingTower) {
        this.placeTower(pointer.x, pointer.y);
      }
    });
    
    // Annuler le placement avec le clic droit
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && this.placingTower) {
        this.cancelTowerPlacement();
      }
    });
    
    // Mouvement de la souris pour prévisualiser le placement
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.placingTower && this.towerPreview) {
        this.towerPreview.setPosition(pointer.x, pointer.y);
        this.updateRangePreview(pointer.x, pointer.y);
        this.checkPlacementValidity(pointer.x, pointer.y);
      }
    });
  }
  
  // Vérifier si l'emplacement est valide pour une tour
  private checkPlacementValidity(x: number, y: number): boolean {
    // Vérifier la proximité du chemin (pas trop près)
    let tooCloseToPath = false;
    const minDistanceToPath = 40; // Distance minimale du chemin
    
    for (const point of this.path) {
      const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
      if (distance < minDistanceToPath) {
        tooCloseToPath = true;
        break;
      }
    }
    
    // Vérifier la proximité d'autres tours (pas de chevauchement)
    let tooCloseToTower = false;
    const minDistanceToTower = 50; // Distance minimale entre tours
    
    for (const tower of this.towers) {
      const distance = Phaser.Math.Distance.Between(x, y, tower.sprite.x, tower.sprite.y);
      if (distance < minDistanceToTower) {
        tooCloseToTower = true;
        break;
      }
    }
    
    // Vérifier la proximité de la base
    const distanceToBase = Phaser.Math.Distance.Between(x, y, this.base.x, this.base.y);
    const tooCloseToBase = distanceToBase < 70;
    
    // Limites de la carte
    const outOfBounds = 
      x < 32 || 
      x > this.cameras.main.width - 32 || 
      y < 32 || 
      y > this.cameras.main.height - 32;
    
    // Mise à jour de la validité
    this.validPlacement = !(tooCloseToPath || tooCloseToTower || tooCloseToBase || outOfBounds);
    
    // Mise à jour visuelle
    if (this.towerPreview) {
      if (this.validPlacement) {
        this.towerPreview.setTint(0x00ff00);
        if (this.rangePreview) {
          this.rangePreview.clear();
          this.rangePreview.lineStyle(2, 0x00ff00, 0.4);
          this.rangePreview.strokeCircle(x, y, 150);
        }
      } else {
        this.towerPreview.setTint(0xff0000);
        if (this.rangePreview) {
          this.rangePreview.clear();
          this.rangePreview.lineStyle(2, 0xff0000, 0.4);
          this.rangePreview.strokeCircle(x, y, 150);
        }
      }
    }
    
    return this.validPlacement;
  }
  
  // Démarrer le processus de placement d'une tour
  public startTowerPlacement(towerType: string, cost: number, range: number) {
    // Annuler tout placement en cours
    this.cancelTowerPlacement();
    
    // Vérifier si on a assez d'argent
    if (this.money < cost) {
      // Afficher un message d'erreur ou un effet
      return;
    }
    
    // Créer une prévisualisation de la tour
    this.selectedTowerType = towerType;
    this.towerPreview = this.add.sprite(0, 0, `tower_${towerType}`)
      .setScale(0.5)
      .setAlpha(0.8);
    
    // Créer une prévisualisation de la portée
    this.rangePreview = this.add.graphics();
    this.rangePreview.lineStyle(2, 0x00ff00, 0.4);
    this.rangePreview.strokeCircle(0, 0, range);
    
    // Activer le mode de placement
    this.placingTower = true;
    
    // Mettre à jour la position initiale
    const pointer = this.input.activePointer;
    this.towerPreview.setPosition(pointer.x, pointer.y);
    this.updateRangePreview(pointer.x, pointer.y);
    this.checkPlacementValidity(pointer.x, pointer.y);
  }
  
  // Mettre à jour la prévisualisation de la portée
  private updateRangePreview(x: number, y: number) {
    if (this.rangePreview) {
      this.rangePreview.clear();
      
      // Obtenir la portée de la tour sélectionnée
      let range = 150; // Valeur par défaut
      
      // Récupérer la portée de la tour sélectionnée via l'interface React
      if (window.towerDefense && window.towerDefense.getSelectedTower) {
        const selectedTower = window.towerDefense.getSelectedTower();
        if (selectedTower) {
          range = selectedTower.range;
        }
      }
      
      // Dessiner le cercle de portée
      if (this.validPlacement) {
        this.rangePreview.lineStyle(2, 0x00ff00, 0.4);
      } else {
        this.rangePreview.lineStyle(2, 0xff0000, 0.4);
      }
      this.rangePreview.strokeCircle(x, y, range);
    }
  }
  
  // Annuler le placement d'une tour
  private cancelTowerPlacement() {
    if (this.towerPreview) {
      this.towerPreview.destroy();
      this.towerPreview = undefined;
    }
    
    if (this.rangePreview) {
      this.rangePreview.destroy();
      this.rangePreview = undefined;
    }
    
    this.placingTower = false;
    this.selectedTowerType = '';
  }
  
  // Placer une tour à la position spécifiée
  private placeTower(x: number, y: number) {
    // Vérifier la validité de l'emplacement
    if (!this.validPlacement || !this.selectedTowerType) {
      return;
    }
    
    // Récupérer les informations de la tour depuis l'interface React
    let towerData = {
      type: this.selectedTowerType,
      cost: 100,
      damage: 10,
      range: 150,
      fireRate: 300
    };
    
    if (window.towerDefense && window.towerDefense.getSelectedTower) {
      const selectedTower = window.towerDefense.getSelectedTower();
      if (selectedTower) {
        towerData = {
          type: selectedTower.id,
          cost: selectedTower.cost,
          damage: selectedTower.damage,
          range: selectedTower.range,
          fireRate: selectedTower.fireRate
        };
      }
    }
    
    // Vérifier si on a assez d'argent
    if (this.money < towerData.cost) {
      return;
    }
    
    // Soustraire le coût
    this.money -= towerData.cost;
    
    // Mettre à jour l'argent dans l'interface React
    if (window.towerDefense && window.towerDefense.updateMoney) {
      window.towerDefense.updateMoney(this.money);
    }
    
    // Créer la tour
    const tower: Tower = {
      sprite: this.physics.add.sprite(x, y, `tower_${towerData.type}`).setScale(0.5),
      type: towerData.type,
      level: 1,
      damage: towerData.damage,
      range: towerData.range,
      fireRate: towerData.fireRate,
      lastFired: 0,
      cost: towerData.cost,
      target: null
    };
    
    // Ajouter un effet de placement
    this.add.circle(x, y, tower.range, 0x00ffff, 0.2)
      .setDepth(-1)
      .setAlpha(0.7)
      .setScale(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    
    // Animation de placement
    this.tweens.add({
      targets: tower.sprite,
      scale: { from: 0, to: 0.5 },
      angle: { from: -30, to: 0 },
      duration: 400,
      ease: 'Back.out'
    });
    
    // Son de construction
    this.buildSound.play();
    
    // Ajouter à la liste des tours
    this.towers.push(tower);
    
    // Terminer le placement
    this.cancelTowerPlacement();
  }
  
  // Mise à jour de toutes les tours (recherche de cibles, tir)
  private updateTowers(time: number) {
    for (const tower of this.towers) {
      // Si la tour n'a pas de cible ou si la cible est morte/supprimée
      if (!tower.target || tower.target.isDead || !tower.target.sprite.active) {
        // Chercher une nouvelle cible
        tower.target = this.findTarget(tower);
      }
      
      // Si la tour a une cible et peut tirer
      if (tower.target && time > tower.lastFired + tower.fireRate) {
        this.shootAt(tower, tower.target, time);
      }
    }
  }
  
  // Trouver une cible pour une tour
  private findTarget(tower: Tower): Enemy | null {
    // Rechercher l'ennemi le plus proche dans la portée
    let closestEnemy: Enemy | null = null;
    let closestDistance = tower.range;
    
    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.sprite.active) continue;
      
      const distance = Phaser.Math.Distance.Between(
        tower.sprite.x, tower.sprite.y,
        enemy.sprite.x, enemy.sprite.y
      );
      
      if (distance <= tower.range && (!closestEnemy || distance < closestDistance)) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    }
    
    return closestEnemy;
  }
  
  // Tirer sur une cible
  private shootAt(tower: Tower, enemy: Enemy, time: number) {
    // Mettre à jour le temps du dernier tir
    tower.lastFired = time;
    
    // Créer un projectile
    const bullet = this.bullets.create(tower.sprite.x, tower.sprite.y, 'bullet')
      .setScale(0.5);
    
    // Couleur du projectile selon le type de tour
    switch (tower.type) {
      case 'firewall':
        bullet.setTint(0xff5500);
        break;
      case 'antivirus':
        bullet.setTint(0x00ff00);
        break;
      case 'ids':
        bullet.setTint(0x0088ff);
        break;
      case 'backup':
        bullet.setTint(0xffff00);
        break;
      case 'encryption':
        bullet.setTint(0xff00ff);
        break;
      case 'honeypot':
        bullet.setTint(0x00ffff);
        break;
    }
    
    // Ajouter un effet de lumière
    bullet.setBlendMode(Phaser.BlendModes.ADD);
    
    // Direction vers la cible
    const angle = Phaser.Math.Angle.Between(
      tower.sprite.x, tower.sprite.y,
      enemy.sprite.x, enemy.sprite.y
    );
    
    // Vitesse du projectile
    const speed = 500;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    // Appliquer la vélocité
    bullet.setVelocity(velocityX, velocityY);
    
    // Effet sonore (désactivé)
    // this.shootSound.play();
    
    // Définir la cible du projectile pour la collision
    bullet.setData('targetEnemy', enemy);
    bullet.setData('damage', tower.damage);
    bullet.setData('towerType', tower.type);
    
    // Rotation de la tour vers la cible
    tower.sprite.setRotation(angle + Math.PI / 2);
    
    // Collision entre les projectiles et les ennemis
    this.physics.add.overlap(bullet, enemy.sprite, (bulletObj, enemySprite) => {
      // Convertir explicitement en sprites Phaser
      const bulletSprite = bulletObj as Phaser.Physics.Arcade.Sprite;
      
      const targetEnemy = bulletSprite.getData('targetEnemy');
      const damage = bulletSprite.getData('damage');
      const towerType = bulletSprite.getData('towerType');
      
      if (targetEnemy === enemy) {
        this.damageEnemy(enemy, damage, towerType);
        this.createBulletImpact(bulletSprite.x, bulletSprite.y, towerType);
        bulletSprite.destroy();
      }
    });
    
    // Détruire le projectile s'il sort de l'écran
    bullet.setData('lifespan', 0);
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (bullet.active) {
          bullet.destroy();
        }
      }
    });
  }
  
  // Créer un effet d'impact pour les projectiles
  private createBulletImpact(x: number, y: number, towerType: string) {
    // Couleur de l'impact selon le type de tour
    let color = 0xff5500;
    switch (towerType) {
      case 'firewall':
        color = 0xff5500;
        break;
      case 'antivirus':
        color = 0x00ff00;
        break;
      case 'ids':
        color = 0x0088ff;
        break;
      case 'backup':
        color = 0xffff00;
        break;
      case 'encryption':
        color = 0xff00ff;
        break;
      case 'honeypot':
        color = 0x00ffff;
        break;
    }
    
    // Créer une explosion
    const explosion = this.add.sprite(x, y, 'explosion')
      .setScale(0.3)
      .setTint(color)
      .setBlendMode(Phaser.BlendModes.ADD);
    
    // Animation d'explosion
    this.tweens.add({
      targets: explosion,
      scale: 0.1,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }
  
  // Infliger des dégâts à un ennemi
  private damageEnemy(enemy: Enemy, damage: number, towerType: string) {
    // Appliquer les dégâts
    enemy.health -= damage;
    
    // Mettre à jour la barre de vie
    this.updateEnemyHealthBar(enemy);
    
    // Vérifier si l'ennemi est mort
    if (enemy.health <= 0 && !enemy.isDead) {
      this.killEnemy(enemy, towerType);
    }
  }
  
  // Mettre à jour la barre de vie d'un ennemi
  private updateEnemyHealthBar(enemy: Enemy) {
    if (enemy.healthBar) {
      enemy.healthBar.clear();
      
      // Fond de la barre de vie
      enemy.healthBar.fillStyle(0x000000, 0.7);
      enemy.healthBar.fillRect(-20, -25, 40, 6);
      
      // Barre de vie selon le pourcentage de santé
      const healthPercent = Phaser.Math.Clamp(enemy.health / enemy.maxHealth, 0, 1);
      
      // Couleur selon la santé
      let color = 0x00ff00;
      if (healthPercent < 0.3) {
        color = 0xff0000;
      } else if (healthPercent < 0.6) {
        color = 0xffff00;
      }
      
      enemy.healthBar.fillStyle(color, 1);
      enemy.healthBar.fillRect(-20, -25, 40 * healthPercent, 6);
    }
  }
  
  // Tuer un ennemi
  private killEnemy(enemy: Enemy, towerType: string) {
    // Marquer comme mort
    enemy.isDead = true;
    
    // Animation de mort
    this.tweens.add({
      targets: enemy.sprite,
      scale: 0.1,
      alpha: 0,
      angle: 180,
      duration: 500,
      onComplete: () => {
        // Supprimer la barre de vie
        if (enemy.healthBar) {
          enemy.healthBar.destroy();
        }
        
        // Supprimer l'ennemi
        this.enemies = this.enemies.filter(e => e !== enemy);
        enemy.sprite.destroy();
        
        // Son d'explosion
        this.explosionSound.play();
        
        // Effet d'explosion
        this.createEnemyDeathEffect(enemy.sprite.x, enemy.sprite.y, towerType);
        
        // Gagner de l'argent
        this.money += enemy.value;
        
        // Mettre à jour l'argent dans l'interface React
        if (window.towerDefense && window.towerDefense.updateMoney) {
          window.towerDefense.updateMoney(this.money);
        }
        
        // Mettre à jour le score
        this.score += enemy.value * 2;
      }
    });
  }
  
  // Créer un effet de mort pour les ennemis
  private createEnemyDeathEffect(x: number, y: number, towerType: string) {
    // Animation d'explosion simple (sans utiliser l'animation spritesheet)
    const explosion = this.add.sprite(x, y, 'explosion')
      .setScale(1)
      .setBlendMode(Phaser.BlendModes.ADD);
      
    // Animation simple
    this.tweens.add({
      targets: explosion,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 500,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // Couleur selon le type de tour qui a tué
    let particleColor = 0xff5500;
    switch (towerType) {
      case 'firewall':
        particleColor = 0xff5500;
        break;
      case 'antivirus':
        particleColor = 0x00ff00;
        break;
      case 'ids':
        particleColor = 0x0088ff;
        break;
      case 'backup':
        particleColor = 0xffff00;
        break;
      case 'encryption':
        particleColor = 0xff00ff;
        break;
      case 'honeypot':
        particleColor = 0x00ffff;
        break;
    }
    
    // Créer des particules manuellement au lieu d'utiliser un émetteur
    for (let i = 0; i < 20; i++) {
      const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
      const speed = Phaser.Math.Between(50, 200);
      const particleX = x;
      const particleY = y;
      
      const particle = this.add.image(particleX, particleY, 'bullet')
        .setScale(0.4)
        .setTint(particleColor)
        .setBlendMode(Phaser.BlendModes.ADD);
      
      // Animation manuelle de la particule
      this.tweens.add({
        targets: particle,
        x: particleX + Math.cos(angle) * speed,
        y: particleY + Math.sin(angle) * speed,
        scale: 0,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  // Mise à jour des ennemis (mouvement sur le chemin)
  private updateEnemies(delta: number) {
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      
      // Obtenir le point cible actuel
      const targetWaypoint = enemy.waypoint !== undefined ? enemy.waypoint : 0;
      
      if (targetWaypoint < this.path.length) {
        const target = this.path[targetWaypoint];
        
        // Calculer la direction vers le waypoint
        const distance = Phaser.Math.Distance.Between(
          enemy.sprite.x, enemy.sprite.y,
          target.x, target.y
        );
        
        // Si l'ennemi est proche du point, passer au suivant
        if (distance < 5) {
          enemy.waypoint = (enemy.waypoint ?? 0) + 1;
          
          // Si c'est le dernier point, attaquer la base
          if (enemy.waypoint >= this.path.length) {
            this.attackBase(enemy);
          }
        } else {
          // Déplacer l'ennemi vers le point
          const angle = Phaser.Math.Angle.Between(
            enemy.sprite.x, enemy.sprite.y,
            target.x, target.y
          );
          
          // Calculer la vélocité basée sur la vitesse
          const velocityX = Math.cos(angle) * enemy.speed * (delta / 1000);
          const velocityY = Math.sin(angle) * enemy.speed * (delta / 1000);
          
          // Appliquer le mouvement
          enemy.sprite.x += velocityX;
          enemy.sprite.y += velocityY;
          
          // Rotation de l'ennemi dans la direction du mouvement
          enemy.sprite.rotation = angle + Math.PI / 2;
          
          // Mettre à jour la position de la barre de vie
          if (enemy.healthBar) {
            enemy.healthBar.x = enemy.sprite.x;
            enemy.healthBar.y = enemy.sprite.y;
          }
        }
      }
    }
  }
  
  // Attaquer la base (quand un ennemi atteint la fin du chemin)
  private attackBase(enemy: Enemy) {
    // Animation d'attaque
    this.tweens.add({
      targets: enemy.sprite,
      x: this.base.x,
      y: this.base.y,
      scale: 0.1,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        // Infliger des dégâts à la base
        this.damageBase(enemy);
        
        // Supprimer la barre de vie
        if (enemy.healthBar) {
          enemy.healthBar.destroy();
        }
        
        // Supprimer l'ennemi
        this.enemies = this.enemies.filter(e => e !== enemy);
        enemy.sprite.destroy();
      }
    });
  }
  
  // Infliger des dégâts à la base
  private damageBase(enemy: Enemy) {
    // Dégâts selon le type d'ennemi
    let damage = 5;
    switch (enemy.type) {
      case 'virus':
        damage = 5;
        break;
      case 'malware':
        damage = 10;
        break;
      case 'ransomware':
        damage = 15;
        break;
      case 'hacker':
        damage = 20;
        break;
      case 'ddos':
        damage = 30;
        break;
    }
    
    // Appliquer les dégâts
    this.baseHealth -= damage;
    this.baseHealth = Math.max(0, this.baseHealth); // Éviter les valeurs négatives
    
    // Effet visuel de dégâts
    this.cameras.main.shake(200, 0.005);
    
    // Effet sonore
    this.explosionSound.play();
    
    // Effet d'explosion sur la base
    this.createBaseHitEffect();
    
    // Mettre à jour la santé dans l'interface React
    if (window.towerDefense && window.towerDefense.updateHealth) {
      window.towerDefense.updateHealth(this.baseHealth);
    }
    
    // Vérifier la condition de défaite
    if (this.baseHealth <= 0) {
      this.gameOver();
    }
  }
  
  // Créer un effet d'impact sur la base
  private createBaseHitEffect() {
    // Animation d'explosion
    const explosion = this.add.sprite(this.base.x, this.base.y, 'explosion_anim')
      .setScale(1.5)
      .play('explode');
    
    // Supprimer après l'animation
    explosion.once('animationcomplete', () => {
      explosion.destroy();
    });
    
    // Flash rouge sur la base
    this.base.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.base.clearTint();
    });
    
    // Animation de dégâts
    this.tweens.add({
      targets: this.base,
      scale: 0.7,
      duration: 100,
      yoyo: true
    });
  }
  
  // Mettre à jour le placement de tour (prévisualisation)
  private updateTowerPlacement() {
    if (this.placingTower && this.towerPreview) {
      const pointer = this.input.activePointer;
      this.towerPreview.setPosition(pointer.x, pointer.y);
      this.updateRangePreview(pointer.x, pointer.y);
      this.checkPlacementValidity(pointer.x, pointer.y);
    }
  }
  
  // Vérifier l'état de la vague en cours
  private checkWaveStatus() {
    // Si la vague est en cours mais qu'il n'y a plus d'ennemis à faire apparaître ni d'ennemis actifs
    if (this.waveInProgress && this.enemiesLeft <= 0 && this.enemies.length === 0) {
      // Vague terminée
      this.waveInProgress = false;
      
      // Récompense de fin de vague
      const waveBonus = 50 + (this.wave * 10);
      this.money += waveBonus;
      
      // Mettre à jour l'argent dans l'interface React
      if (window.towerDefense && window.towerDefense.updateMoney) {
        window.towerDefense.updateMoney(this.money);
      }
      
      // Afficher un message de succès
      this.showWaveCompleteMessage(waveBonus);
      
      // Délai avant la prochaine vague
      this.time.delayedCall(5000, () => {
        // Vérifier si c'était la dernière vague
        const maxWaves = this.getMaxWaves();
        if (this.wave >= maxWaves) {
          this.victory();
        } else {
          // Lancer la prochaine vague
          this.startNextWave();
        }
      });
    }
  }
  
  // Afficher un message de fin de vague
  private showWaveCompleteMessage(bonus: number) {
    // Texte de complétion de vague
    const waveText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      `Vague ${this.wave} terminée!`,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '32px',
        color: '#00ffff',
        stroke: '#0000aa',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Animation du texte
    this.tweens.add({
      targets: waveText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.out'
    });
    
    // Texte de bonus
    const bonusText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `Bonus: $${bonus}`,
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '24px',
        color: '#ffff00'
      }
    ).setOrigin(0.5);
    
    // Animation du texte de bonus
    this.tweens.add({
      targets: bonusText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      delay: 300,
      ease: 'Back.out'
    });
    
    // Masquer les textes après un certain temps
    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: [waveText, bonusText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          waveText.destroy();
          bonusText.destroy();
        }
      });
    });
  }
  
  // Lancer la vague suivante
  private startNextWave() {
    // Incrémenter le numéro de vague
    this.wave++;
    
    // Mettre à jour l'interface React
    if (window.towerDefense && window.towerDefense.updateWave) {
      window.towerDefense.updateWave(this.wave);
    }
    
    // Définir le nombre et le type d'ennemis en fonction de la vague
    const waveConfig = this.generateWaveConfig();
    this.enemiesLeft = waveConfig.total;
    
    // Afficher un message de début de vague
    this.showWaveStartMessage();
    
    // Son de début de vague
    this.waveStartSound.play();
    
    // Démarrer l'apparition des ennemis
    this.waveInProgress = true;
    this.startEnemySpawner(waveConfig);
  }
  
  // Afficher un message de début de vague
  private showWaveStartMessage() {
    // Texte d'alerte de vague
    const alertText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `ALERTE!\nVague ${this.wave} en approche`,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '36px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Animation d'alerte
    this.tweens.add({
      targets: alertText,
      scale: { from: 2, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.out',
      onComplete: () => {
        // Faire clignoter le texte
        this.tweens.add({
          targets: alertText,
          alpha: 0.5,
          duration: 300,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            // Faire disparaître le texte
            this.tweens.add({
              targets: alertText,
              alpha: 0,
              scale: 0.5,
              duration: 500,
              onComplete: () => {
                alertText.destroy();
              }
            });
          }
        });
      }
    });
    
    // Ajouter un effet de tremblement
    this.cameras.main.shake(500, 0.01);
  }
  
  // Générer la configuration d'une vague en fonction du numéro
  private generateWaveConfig() {
    // Configuration de base
    const config = {
      virus: 0,
      malware: 0,
      ransomware: 0,
      hacker: 0,
      ddos: 0,
      spawnDelay: 1000, // Délai entre les ennemis (ms)
      total: 0 // Sera calculé en fonction des types
    };
    
    // Ajuster la configuration en fonction de la vague
    // Plus la vague avance, plus les ennemis sont nombreux et difficiles
    
    // Virus (ennemis de base)
    config.virus = Math.min(20, Math.floor(5 + this.wave * 1.5));
    
    // Malwares (à partir de la vague 2)
    if (this.wave >= 2) {
      config.malware = Math.min(15, Math.floor((this.wave - 1) * 1.2));
    }
    
    // Ransomwares (à partir de la vague 4)
    if (this.wave >= 4) {
      config.ransomware = Math.min(10, Math.floor((this.wave - 3) * 0.8));
    }
    
    // Hackers (à partir de la vague 6)
    if (this.wave >= 6) {
      config.hacker = Math.min(8, Math.floor((this.wave - 5) * 0.6));
    }
    
    // DDoS (boss, à partir de la vague 5 et tous les 5 niveaux)
    if (this.wave >= 5 && this.wave % 5 === 0) {
      config.ddos = Math.floor(this.wave / 5);
    }
    
    // Calculer le total
    config.total = config.virus + config.malware + config.ransomware + config.hacker + config.ddos;
    
    // Ajuster le délai en fonction de la vague (plus court pour les vagues avancées)
    config.spawnDelay = Math.max(500, 1500 - (this.wave * 50));
    
    return config;
  }
  
  // Démarrer l'apparition des ennemis selon la configuration de vague
  private startEnemySpawner(waveConfig: any) {
    // Créer un tableau avec tous les ennemis à faire apparaître
    const enemyTypes: string[] = [];
    
    // Ajouter les types d'ennemis selon leur nombre
    for (let i = 0; i < waveConfig.virus; i++) enemyTypes.push('virus');
    for (let i = 0; i < waveConfig.malware; i++) enemyTypes.push('malware');
    for (let i = 0; i < waveConfig.ransomware; i++) enemyTypes.push('ransomware');
    for (let i = 0; i < waveConfig.hacker; i++) enemyTypes.push('hacker');
    for (let i = 0; i < waveConfig.ddos; i++) enemyTypes.push('ddos');
    
    // Mélanger le tableau pour que les ennemis apparaissent dans un ordre aléatoire
    Phaser.Utils.Array.Shuffle(enemyTypes);
    
    // Timer pour faire apparaître les ennemis
    let spawnIndex = 0;
    this.enemySpawnTimer = this.time.addEvent({
      delay: waveConfig.spawnDelay,
      callback: () => {
        if (spawnIndex < enemyTypes.length) {
          this.spawnEnemy(enemyTypes[spawnIndex]);
          spawnIndex++;
          this.enemiesLeft--;
        } else {
          // Arrêter le timer quand tous les ennemis sont apparus
          this.enemySpawnTimer.destroy();
        }
      },
      callbackScope: this,
      repeat: enemyTypes.length - 1
    });
  }
  
  // Faire apparaître un ennemi spécifique
  private spawnEnemy(type: string) {
    // Position de départ (premier point du chemin)
    const startPoint = this.path[0];
    
    // Caractéristiques de l'ennemi selon son type
    let health = 100;
    let speed = 100;
    let value = 10;
    let scale = 0.5;
    
    // Ajuster les statistiques en fonction du type et de la difficulté
    const difficultyMultiplier = this.getDifficultyMultiplier();
    
    switch (type) {
      case 'virus':
        health = 40 * difficultyMultiplier.health;
        speed = 120 * difficultyMultiplier.speed;
        value = 10;
        scale = 0.4;
        break;
      case 'malware':
        health = 80 * difficultyMultiplier.health;
        speed = 100 * difficultyMultiplier.speed;
        value = 15;
        scale = 0.45;
        break;
      case 'ransomware':
        health = 150 * difficultyMultiplier.health;
        speed = 70 * difficultyMultiplier.speed;
        value = 25;
        scale = 0.5;
        break;
      case 'hacker':
        health = 100 * difficultyMultiplier.health;
        speed = 150 * difficultyMultiplier.speed;
        value = 30;
        scale = 0.4;
        break;
      case 'ddos':
        health = 500 * difficultyMultiplier.health;
        speed = 60 * difficultyMultiplier.speed;
        value = 100;
        scale = 0.7;
        break;
    }
    
    // Créer le sprite de l'ennemi
    const sprite = this.physics.add.sprite(startPoint.x, startPoint.y, `enemy_${type}`)
      .setScale(0)
      .setDepth(5);
    
    // Créer l'objet ennemi
    const enemy: Enemy = {
      sprite,
      type,
      health,
      maxHealth: health,
      speed,
      value,
      waypoint: 0
    };
    
    // Créer une barre de vie pour l'ennemi
    enemy.healthBar = this.add.graphics()
      .setDepth(5);
    this.updateEnemyHealthBar(enemy);
    
    // Animation d'apparition
    this.tweens.add({
      targets: sprite,
      scale: scale,
      duration: 300,
      ease: 'Back.out'
    });
    
    // Ajouter à la liste des ennemis
    this.enemies.push(enemy);
  }
  
  // Obtenir le multiplicateur de difficulté
  private getDifficultyMultiplier() {
    // Valeurs par défaut (moyen)
    let healthMultiplier = 1;
    let speedMultiplier = 1;
    
    // Ajuster selon la difficulté
    switch (this.difficulty) {
      case 'easy':
        healthMultiplier = 0.8;
        speedMultiplier = 0.8;
        break;
      case 'medium':
        healthMultiplier = 1;
        speedMultiplier = 1;
        break;
      case 'hard':
        healthMultiplier = 1.2;
        speedMultiplier = 1.2;
        break;
    }
    
    return {
      health: healthMultiplier,
      speed: speedMultiplier
    };
  }
  
  // Obtenir le nombre maximum de vagues selon la difficulté
  private getMaxWaves() {
    switch (this.difficulty) {
      case 'easy':
        return 10;
      case 'medium':
        return 15;
      case 'hard':
        return 20;
      default:
        return 15;
    }
  }
  
  // Gérer la victoire (toutes les vagues terminées)
  private victory() {
    // Arrêter le jeu
    this.gameStarted = false;
    
    // Calculer le score final (basé sur l'argent, la santé de la base et le niveau)
    const finalScore = this.score + (this.money * 0.5) + (this.baseHealth * 10);
    
    // Effet de victoire
    this.cameras.main.flash(1000, 0, 255, 255);
    
    // Texte de victoire
    const victoryText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'MISSION RÉUSSIE!',
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '48px',
        color: '#00ffff',
        stroke: '#000088',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Animation du texte
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      y: this.cameras.main.height / 2 - 80,
      duration: 1000,
      ease: 'Back.out'
    });
    
    // Texte de score
    const scoreText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 30,
      `Score final: ${Math.floor(finalScore)}`,
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Animation du texte de score
    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      y: this.cameras.main.height / 2,
      duration: 1000,
      delay: 500,
      ease: 'Back.out'
    });
    
    // Passer à l'écran de game over avec victoire
    this.time.delayedCall(5000, () => {
      // Transition de sortie
      this.cameras.main.fade(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Communiquer le score final à l'interface React
        if (window.towerDefense && window.towerDefense.gameOver) {
          window.towerDefense.gameOver(Math.floor(finalScore));
        }
        
        // Arrêter cette scène
        this.scene.stop('UIScene');
        this.scene.stop();
      });
    });
  }
  
  // Gérer la défaite (base détruite)
  private gameOver() {
    // Arrêter le jeu
    this.gameStarted = false;
    
    // Son de game over
    this.gameOverSound.play();
    
    // Arrêter les timers
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }
    
    // Effet de défaite
    this.cameras.main.shake(1000, 0.03);
    this.cameras.main.flash(1000, 255, 0, 0);
    
    // Animation de destruction de la base
    this.tweens.add({
      targets: this.base,
      alpha: 0,
      scale: 2,
      angle: 180,
      duration: 1000,
      onComplete: () => {
        // Explosion finale
        this.add.sprite(this.base.x, this.base.y, 'explosion_anim')
          .setScale(3)
          .play('explode');
      }
    });
    
    // Texte de game over
    const gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'RÉSEAU COMPROMIS',
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '48px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Animation du texte
    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      y: this.cameras.main.height / 2 - 80,
      duration: 1000,
      delay: 1000,
      ease: 'Back.out'
    });
    
    // Calculer le score final
    const finalScore = this.score + (this.money * 0.2) + (this.wave * 100);
    
    // Texte de score
    const scoreText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 30,
      `Score final: ${Math.floor(finalScore)}`,
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Animation du texte de score
    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      y: this.cameras.main.height / 2,
      duration: 1000,
      delay: 1500,
      ease: 'Back.out'
    });
    
    // Passer à l'écran de game over
    this.time.delayedCall(5000, () => {
      // Transition de sortie
      this.cameras.main.fade(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Communiquer le score final à l'interface React
        if (window.towerDefense && window.towerDefense.gameOver) {
          window.towerDefense.gameOver(Math.floor(finalScore));
        }
        
        // Arrêter cette scène
        this.scene.stop('UIScene');
        this.scene.stop();
      });
    });
  }
}