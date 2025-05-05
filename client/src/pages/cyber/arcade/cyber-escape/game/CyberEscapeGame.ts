import Phaser from 'phaser';
import { Player } from './Player';
import { Office } from './Office';
import { Vulnerability } from './Vulnerability';
import { Hacker } from './Hacker';

// Configuration des types de vulnérabilités
const VULN_TYPES = ['password', 'usb', 'screen', 'document', 'device'];

export class CyberEscapeGame {
  game: Phaser.Game;
  isGameActive: boolean = false;
  isPaused: boolean = false;
  level: number = 1;
  vulnerabilities: Phaser.Physics.Arcade.Group | null = null;
  player: Player | null = null;
  hacker: Hacker | null = null;
  office: Office | null = null;
  vulnerabilityCount: number = 0;
  successCallback: Function | null = null;
  failureCallback: Function | null = null;
  preloadComplete: boolean = false;
  gameConfig: any = {
    1: { // Niveau 1
      vulnerabilityCount: 5,
      hackerSpeed: 80,
      hackerDelay: 10000, // 10 secondes avant que le pirate ne se réveille
      hackingRate: 0.05
    },
    2: { // Niveau 2
      vulnerabilityCount: 7,
      hackerSpeed: 100,
      hackerDelay: 7000, // 7 secondes avant que le pirate ne se réveille
      hackingRate: 0.075
    },
    3: { // Niveau 3
      vulnerabilityCount: 10,
      hackerSpeed: 120,
      hackerDelay: 5000, // 5 secondes avant que le pirate ne se réveille
      hackingRate: 0.1
    }
  };

  constructor(level: number = 1, onGameInit: (gameInstance: CyberEscapeGame) => void = () => {}) {
    this.level = level;
    
    // Configuration du jeu Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      backgroundColor: '#132c41',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      }
    };
    
    // Créer l'instance du jeu
    this.game = new Phaser.Game(config);
    
    // Informer le composant parent que le jeu est initialisé
    onGameInit(this);
  }

  // Préchargement des assets
  preload() {
    const scene = this.game.scene.scenes[0];
    
    // Images pour les personnages et les objets
    scene.load.image('player', 'https://i.imgur.com/RpQQxq5.png');
    scene.load.image('hacker', 'https://i.imgur.com/8EqGaof.png');
    scene.load.image('wall', 'https://i.imgur.com/ZfLhfZi.png');
    scene.load.image('floor', 'https://i.imgur.com/QcCBJCT.png');
    scene.load.image('desk', 'https://i.imgur.com/sUvdg6L.png');
    
    // Images pour les vulnérabilités
    scene.load.image('password', 'https://i.imgur.com/t8DmdGj.png');
    scene.load.image('usb', 'https://i.imgur.com/XgDRBXR.png');
    scene.load.image('screen', 'https://i.imgur.com/y7BEHEh.png');
    scene.load.image('document', 'https://i.imgur.com/mVIhEBV.png');
    scene.load.image('device', 'https://i.imgur.com/o9eekZS.png');
    
    // Précharger la barre de progression
    scene.load.on('progress', (value: number) => {
      console.log(`Chargement: ${Math.round(value * 100)}%`);
    });
    
    // Quand tout est chargé
    scene.load.on('complete', () => {
      this.preloadComplete = true;
    });
  }

  // Création du jeu
  create() {
    const scene = this.game.scene.scenes[0];
    
    // Créer l'environnement de bureau
    this.office = new Office(scene);
    this.office.create();
    
    // Créer le joueur au centre
    this.player = new Player(scene, 800, 600);
    
    // Créer le pirate informatique dans un coin caché
    this.hacker = new Hacker(scene, 100, 100);
    
    // Créer les vulnérabilités
    this.createVulnerabilities();
    
    // Configurer les collisions
    if (this.office && this.player) {
      scene.physics.add.collider(this.player.sprite, this.office.walls);
      scene.physics.add.collider(this.player.sprite, this.office.furniture);
    }
    
    if (this.office && this.hacker) {
      scene.physics.add.collider(this.hacker.sprite, this.office.walls);
      scene.physics.add.collider(this.hacker.sprite, this.office.furniture);
    }
    
    // Configuration de la caméra
    if (this.player) {
      scene.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
      scene.cameras.main.setZoom(0.8);
    }
    
    // Configurer les interactions avec les vulnérabilités
    if (this.vulnerabilities && this.player) {
      scene.physics.add.overlap(
        this.player.sprite,
        this.vulnerabilities,
        (playerSprite, vulnSprite: any) => {
          // Vérifier si on est assez proche et si on clique sur la vulnérabilité
          if (Phaser.Input.Keyboard.JustDown(scene.input.keyboard.addKey('E')) || 
              (vulnSprite.input && vulnSprite.input.justDown)) {
            // Récupérer l'objet vulnérabilité
            const vulnObject = vulnSprite.getData('object');
            
            // Si la vulnérabilité n'est pas déjà corrigée ou exploitée
            if (vulnObject && !vulnObject.isFixed && !vulnObject.isExploited) {
              // Corriger la vulnérabilité
              vulnObject.markAsFixed();
              
              // Mettre à jour le statut via l'événement
              if (window.PhaserEvents && window.PhaserEvents.onVulnerabilityFixed) {
                window.PhaserEvents.onVulnerabilityFixed();
              }
              
              // Désactiver l'interactivité
              vulnSprite.disableInteractive();
              
              // Marquer pour que le hacker ne la cible plus
              vulnSprite.setData('fixed', true);
            }
          }
        }
      );
    }
    
    // Afficher un message de bienvenue
    const textStyle = { fontSize: '18px', fontStyle: 'bold', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const instructionText = scene.add.text(
      scene.cameras.main.width / 2,
      scene.cameras.main.height - 50,
      'Utilisez les flèches ou WASD pour vous déplacer | ESPACE pour scanner | E ou clic pour réparer',
      textStyle
    );
    instructionText.setOrigin(0.5);
    instructionText.setScrollFactor(0); // Pour que le texte reste fixe avec la caméra
    
    // Activer les contrôles du joueur
    if (this.player) {
      this.player.enableControls();
    }
    
    // Démarrer la partie après un délai
    this.isGameActive = true;
    
    // Activer le pirate après un délai (dépend du niveau)
    const hackerDelay = this.gameConfig[this.level]?.hackerDelay || 10000;
    scene.time.delayedCall(hackerDelay, () => {
      if (this.hacker && this.vulnerabilities) {
        this.hacker.startHacking(this.vulnerabilities);
        
        if (window.PhaserEvents) {
          window.PhaserEvents.showToast('Alerte ! Un attaquant a été détecté dans le réseau !', 'error');
        }
      }
    });
  }

  // Mise à jour à chaque frame
  update(time: number, delta: number) {
    if (!this.isGameActive || this.isPaused) return;
    
    // Mettre à jour le joueur
    if (this.player) {
      this.player.update();
    }
    
    // Mettre à jour le pirate
    if (this.hacker && this.vulnerabilities) {
      this.hacker.update(this.vulnerabilities, delta / 1000); // Convertir en secondes
    }
    
    // Mettre à jour les vulnérabilités
    if (this.vulnerabilities) {
      this.vulnerabilities.getChildren().forEach((vuln: any) => {
        const vulnObject = vuln.getData('object');
        if (vulnObject && typeof vulnObject.update === 'function') {
          vulnObject.update();
        }
      });
    }
  }

  // Créer les vulnérabilités
  private createVulnerabilities() {
    const scene = this.game.scene.scenes[0];
    
    // Créer le groupe de vulnérabilités
    this.vulnerabilities = scene.physics.add.group();
    
    // Définir le nombre de vulnérabilités en fonction du niveau
    this.vulnerabilityCount = this.gameConfig[this.level]?.vulnerabilityCount || 5;
    
    // Obtenir des positions aléatoires dans l'environnement
    const positions = this.office ? this.office.getRandomPositions(this.vulnerabilityCount) : [];
    
    // Créer chaque vulnérabilité
    positions.forEach((pos: { x: number, y: number }, index: number) => {
      // Sélectionner un type de vulnérabilité aléatoire
      const vulnType = VULN_TYPES[Math.floor(Math.random() * VULN_TYPES.length)];
      
      // Créer l'objet Vulnerability
      const vulnerability = new Vulnerability(scene, pos.x, pos.y, vulnType);
      
      // Ajouter au groupe physics
      if (this.vulnerabilities) {
        this.vulnerabilities.add(vulnerability.sprite);
        
        // Stocker une référence à l'objet Vulnerability dans le sprite
        vulnerability.sprite.setData('object', vulnerability);
        vulnerability.sprite.setData('fixed', false);
        vulnerability.sprite.setData('hackerExploited', false);
        
        // Rendre la vulnérabilité interactive pour le clic
        vulnerability.sprite.setInteractive();
        vulnerability.sprite.on('pointerdown', () => {
          // Si le joueur est assez proche
          if (this.player) {
            const distance = Phaser.Math.Distance.Between(
              this.player.sprite.x,
              this.player.sprite.y,
              vulnerability.sprite.x,
              vulnerability.sprite.y
            );
            
            if (distance < 100 && !vulnerability.isFixed && !vulnerability.isExploited) {
              // Corriger la vulnérabilité
              vulnerability.markAsFixed();
              
              // Mettre à jour le statut via l'événement
              if (window.PhaserEvents && window.PhaserEvents.onVulnerabilityFixed) {
                window.PhaserEvents.onVulnerabilityFixed();
              }
              
              // Marquer comme corrigée pour le pirate
              vulnerability.sprite.setData('fixed', true);
              
              // Désactiver l'interactivité
              vulnerability.sprite.disableInteractive();
            } else if (distance >= 100) {
              if (window.PhaserEvents) {
                window.PhaserEvents.showToast('Rapprochez-vous pour corriger cette vulnérabilité', 'info');
              }
            }
          }
        });
      }
    });
  }

  // Mettre le jeu en pause
  setPaused(paused: boolean) {
    this.isPaused = paused;
    
    // Mettre en pause la physique
    const scene = this.game.scene.scenes[0];
    if (paused) {
      scene.physics.pause();
      if (this.player) {
        this.player.disableControls();
      }
    } else {
      scene.physics.resume();
      if (this.player) {
        this.player.enableControls();
      }
    }
  }

  // Méthode pour détruire le jeu lors du démontage du composant
  destroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}