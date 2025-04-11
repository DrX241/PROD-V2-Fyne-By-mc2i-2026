import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Image;
  private titleText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Image;
  private music!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fond d'écran avec design futuriste cyber
    this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setAlpha(0.2);
    
    // Effet de grille pour le style cyberpunk
    this.createCyberGrid();
    
    // Ajouter de la musique en arrière-plan (commenté pour le moment)
    // Vérification pour éviter les erreurs de chargement des ressources audio
    try {
      if (this.sound.get('background_music')) {
        this.music = this.sound.add('background_music', {
          volume: 0.5,
          loop: true
        });
        
        // Jouer la musique si elle n'est pas déjà en cours
        if (!this.sound.get('background_music')?.isPlaying) {
          this.music.play();
        }
      }
    } catch (error) {
      console.log('Musique de fond non disponible, jeu en mode silencieux');
    }
    
    // Titre du jeu avec style cybersécurité
    this.titleText = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 3,
      'CYBERSEC TOWER DEFENSE', 
      { 
        fontFamily: 'Orbitron, sans-serif', 
        fontSize: '48px',
        color: '#00ffff',
        stroke: '#003366',
        strokeThickness: 6,
        shadow: { color: '#0088ff', fill: true, offsetX: 2, offsetY: 2, blur: 8 }
      }
    ).setOrigin(0.5);
    
    // Animer le titre
    this.tweens.add({
      targets: this.titleText,
      y: this.titleText.y - 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Ajouter un sous-titre
    const subtitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 3 + 70,
      'Protégez votre réseau contre les cyberattaques',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '24px',
        color: '#88ccff'
      }
    ).setOrigin(0.5);
    
    // Bouton de démarrage
    this.startButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'button'
    ).setScale(2).setInteractive({ useHandCursor: true });
    
    // Texte du bouton
    const startText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'COMMENCER',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '28px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Effet de survol
    this.startButton.on('pointerover', () => {
      this.startButton.setTint(0x88ff88);
      startText.setColor('#88ff88');
    });
    
    this.startButton.on('pointerout', () => {
      this.startButton.clearTint();
      startText.setColor('#ffffff');
    });
    
    // Démarrer le jeu au clic
    this.startButton.on('pointerdown', () => {
      // Effet sonore (avec gestion d'erreur)
      try {
        if (this.sound.get('build')) {
          this.sound.play('build');
        }
      } catch (error) {
        console.log('Son de construction non disponible');
      }
      
      // Animation de clic
      this.tweens.add({
        targets: [this.startButton, startText],
        scale: '*=0.9',
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Animation de transition
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            // Lancer la scène de jeu
            this.scene.start('GameScene');
          });
        }
      });
    });
    
    // Animation d'entrée
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Ajouter des particules pour effet futuriste
    this.createDigitalParticles();
  }
  
  // Création d'une grille cyberpunk
  private createCyberGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00aaff, 0.3);
    
    // Lignes horizontales
    for (let y = 0; y < this.cameras.main.height; y += 30) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.cameras.main.width, y);
    }
    
    // Lignes verticales
    for (let x = 0; x < this.cameras.main.width; x += 30) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.cameras.main.height);
    }
    
    graphics.strokePath();
  }
  
  // Particules bits/bytes pour effet digital
  private createDigitalParticles() {
    try {
      // Désactivé pour le moment en raison d'incompatibilité avec Phaser 3.60+
      // Dans une version future, nous implémenterons les particules avec la nouvelle API
      
      // Note: dans Phaser 3.60+, la syntaxe pour les particules a changé 
      // et particles.createEmitter a été supprimé
    } catch (error) {
      console.log('Particules non disponibles dans cette version');
    }
  }
}