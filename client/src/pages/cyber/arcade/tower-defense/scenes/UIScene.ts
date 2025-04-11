import Phaser from 'phaser';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  // Référence à la scène de jeu principale
  private gameScene!: GameScene;
  
  // Éléments d'interface
  private moneyText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private nextWaveButton!: Phaser.GameObjects.Container;
  
  // Données du jeu
  private money: number = 500;
  private wave: number = 0;
  private health: number = 100;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: any) {
    // Récupérer les données initiales
    this.money = data.money || 500;
    this.wave = data.wave || 0;
    this.health = data.health || 100;
    this.gameScene = data.gameScene;
  }

  create() {
    // UI Panel supérieur
    this.createTopPanel();
    
    // UI Panel latéral (optionnel, pour les détails des tours)
    //this.createSidePanel();
    
    // Bouton de prochaine vague (optionnel, car nous démarrons automatiquement les vagues)
    //this.createNextWaveButton();
    
    // Mise à jour initiale de l'interface
    this.updateMoneyDisplay();
    this.updateWaveDisplay();
    this.updateHealthDisplay();
    
    // Écouter les événements de mise à jour
    this.setupEventListeners();
  }

  // Créer le panneau supérieur avec les informations du jeu
  private createTopPanel() {
    // Fond du panneau
    const panelHeight = 50;
    const panel = this.add.rectangle(0, 0, this.cameras.main.width, panelHeight, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setDepth(100);
    
    // Effet de bordure
    this.add.rectangle(0, panelHeight, this.cameras.main.width, 2, 0x00ffff, 0.8)
      .setOrigin(0, 0)
      .setDepth(100);
    
    // Affichage de l'argent
    this.moneyText = this.add.text(20, panelHeight / 2, `$${this.money}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '24px',
      color: '#ffff00'
    })
    .setOrigin(0, 0.5)
    .setDepth(100);
    
    // Icône d'argent
    this.add.text(10, panelHeight / 2, '$', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '28px',
      color: '#ffff00',
      fontStyle: 'bold'
    })
    .setOrigin(0, 0.5)
    .setDepth(100);
    
    // Affichage de la vague
    this.waveText = this.add.text(this.cameras.main.width / 2, panelHeight / 2, `Vague: ${this.wave}/15`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    })
    .setOrigin(0.5, 0.5)
    .setDepth(100);
    
    // Affichage de la santé textuelle
    this.healthText = this.add.text(this.cameras.main.width - 120, panelHeight / 2, `${this.health}%`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '24px',
      color: '#00ff00'
    })
    .setOrigin(0, 0.5)
    .setDepth(100);
    
    // Icône de santé
    this.add.text(this.cameras.main.width - 150, panelHeight / 2, '❤', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ff0000'
    })
    .setOrigin(0, 0.5)
    .setDepth(100);
    
    // Barre de santé
    this.healthBar = this.add.graphics()
      .setDepth(100);
    this.updateHealthBar();
  }
  
  // Mettre à jour la barre de santé
  private updateHealthBar() {
    this.healthBar.clear();
    
    const barWidth = 100;
    const barHeight = 10;
    const x = this.cameras.main.width - 150;
    const y = 35;
    
    // Fond de la barre
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Contenu de la barre selon la santé
    let color = 0x00ff00; // vert
    if (this.health < 30) {
      color = 0xff0000; // rouge
    } else if (this.health < 60) {
      color = 0xffff00; // jaune
    }
    
    // Remplir la barre en fonction du pourcentage de santé
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(x, y, barWidth * (this.health / 100), barHeight);
    
    // Bordure
    this.healthBar.lineStyle(1, 0xffffff, 0.5);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
  }
  
  // Créer un bouton pour démarrer la prochaine vague (optionnel)
  private createNextWaveButton() {
    // Conteneur pour le bouton
    this.nextWaveButton = this.add.container(this.cameras.main.width - 120, this.cameras.main.height - 40);
    
    // Fond du bouton
    const buttonBg = this.add.rectangle(0, 0, 100, 30, 0x00aaff, 1)
      .setInteractive({ useHandCursor: true });
    
    // Texte du bouton
    const buttonText = this.add.text(0, 0, 'Vague >', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Ajouter les éléments au conteneur
    this.nextWaveButton.add([buttonBg, buttonText]);
    
    // Effet de survol
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x00ccff);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x00aaff);
    });
    
    // Action du bouton
    buttonBg.on('pointerdown', () => {
      // Appeler la méthode pour démarrer la vague dans la scène de jeu
      // this.scene.get('GameScene').events.emit('startNextWave');
    });
  }
  
  // Configurer les écouteurs d'événements
  private setupEventListeners() {
    // Mettre à jour les informations en écoutant les événements
    this.events.on('updateMoney', (money: number) => {
      this.money = money;
      this.updateMoneyDisplay();
    });
    
    this.events.on('updateWave', (wave: number) => {
      this.wave = wave;
      this.updateWaveDisplay();
    });
    
    this.events.on('updateHealth', (health: number) => {
      this.health = health;
      this.updateHealthDisplay();
    });
  }
  
  // Mettre à jour l'affichage de l'argent
  private updateMoneyDisplay() {
    this.moneyText.setText(`$${this.money}`);
    
    // Animation pour les changements d'argent
    this.tweens.add({
      targets: this.moneyText,
      scale: { from: 1.2, to: 1 },
      duration: 200
    });
  }
  
  // Mettre à jour l'affichage de la vague
  private updateWaveDisplay() {
    // Obtenir le nombre maximum de vagues en fonction de la difficulté
    let maxWaves = 15;
    if (window.towerDefense && window.towerDefense.getDifficulty) {
      const difficulty = window.towerDefense.getDifficulty();
      if (difficulty === 'easy') maxWaves = 10;
      else if (difficulty === 'medium') maxWaves = 15;
      else if (difficulty === 'hard') maxWaves = 20;
    }
    
    this.waveText.setText(`Vague: ${this.wave}/${maxWaves}`);
    
    // Animation pour les changements de vague
    this.tweens.add({
      targets: this.waveText,
      scale: { from: 1.2, to: 1 },
      duration: 200
    });
  }
  
  // Mettre à jour l'affichage de la santé
  private updateHealthDisplay() {
    this.healthText.setText(`${this.health}%`);
    
    // Changer la couleur en fonction de la santé
    if (this.health < 30) {
      this.healthText.setColor('#ff0000');
    } else if (this.health < 60) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#00ff00');
    }
    
    // Mettre à jour la barre de santé
    this.updateHealthBar();
    
    // Animation pour les changements de santé
    if (this.health < 50) {
      this.tweens.add({
        targets: this.healthText,
        scale: { from: 1.2, to: 1 },
        duration: 200,
        repeat: 1,
        yoyo: true
      });
    }
  }
}