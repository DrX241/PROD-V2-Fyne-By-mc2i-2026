import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private victory: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any) {
    this.score = data.score || 0;
    this.victory = data.victory || false;
  }

  create() {
    // Fond d'écran cybernétique
    this.createBackground();
    
    // Titre basé sur le résultat
    const title = this.victory ? 'MISSION RÉUSSIE!' : 'RÉSEAU COMPROMIS';
    const titleColor = this.victory ? '#00ffff' : '#ff0000';
    
    // Texte principal
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 3,
      title,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '48px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Animation du titre
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Message de résultat
    const message = this.victory 
      ? 'Votre réseau est sécurisé! Vous avez repoussé toutes les attaques avec succès.'
      : 'Votre réseau a été compromis par les cyberattaques. Réessayez avec une meilleure stratégie.';
    
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message,
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: this.cameras.main.width * 0.7 }
      }
    ).setOrigin(0.5);
    
    // Affichage du score
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 80,
      `Score final: ${this.score}`,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '36px',
        color: '#ffff00',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Bouton pour rejouer
    const restartButton = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 160,
      200, 60,
      0x0066ff, 1
    ).setInteractive({ useHandCursor: true });
    
    // Texte du bouton
    const restartText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 160,
      'REJOUER',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Effets du bouton
    restartButton.on('pointerover', () => {
      restartButton.fillColor = 0x00aaff;
      restartText.setScale(1.1);
    });
    
    restartButton.on('pointerout', () => {
      restartButton.fillColor = 0x0066ff;
      restartText.setScale(1);
    });
    
    // Action du bouton
    restartButton.on('pointerdown', () => {
      // Animation de pression
      this.tweens.add({
        targets: [restartButton, restartText],
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Transition de sortie
          this.cameras.main.fade(500, 0, 0, 0, false, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress === 1) {
              // Redémarrer le jeu
              this.scene.start('MenuScene');
            }
          });
        }
      });
    });
    
    // Bouton pour retourner au menu principal
    const menuButton = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 240,
      200, 60,
      0x333333, 1
    ).setInteractive({ useHandCursor: true });
    
    // Texte du bouton
    const menuText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 240,
      'MENU',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Effets du bouton
    menuButton.on('pointerover', () => {
      menuButton.fillColor = 0x555555;
      menuText.setScale(1.1);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.fillColor = 0x333333;
      menuText.setScale(1);
    });
    
    // Action du bouton
    menuButton.on('pointerdown', () => {
      // Animation de pression
      this.tweens.add({
        targets: [menuButton, menuText],
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Communiquer avec l'interface React
          // Pour cet exemple, on va simplement détruire le jeu, ce qui déclenchera le nettoyage dans le composant React
          this.game.destroy(true);
        }
      });
    });
    
    // Animation d'entrée de la scène
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
  
  // Créer un fond cybernétique
  private createBackground() {
    // Fond noir
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
      .setOrigin(0, 0);
    
    // Grille
    const gridSize = 50;
    const gridColor = this.victory ? 0x0088ff : 0xff0000;
    const gridAlpha = 0.2;
    
    const grid = this.add.grid(
      0, 0,
      this.cameras.main.width * 2, this.cameras.main.height * 2,
      gridSize, gridSize,
      0, 0,
      gridColor, gridAlpha
    ).setOrigin(0, 0);
    
    // Animation subtile de la grille
    this.tweens.add({
      targets: grid,
      alpha: gridAlpha * 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    
    // Ajouter des particules
    this.createParticles();
  }
  
  // Créer des particules pour l'arrière-plan (version simplifiée sans émetteur)
  private createParticles() {
    try {
      // Au lieu d'utiliser un émetteur de particules qui peut causer des erreurs,
      // créons des images statiques avec des animations simples
      for (let i = 0; i < 20; i++) {
        // Coordonnées aléatoires
        const x = Math.random() * this.cameras.main.width;
        const y = Math.random() * this.cameras.main.height;
        
        // Couleurs selon l'état de victoire/défaite
        const color = this.victory ? 
          (Math.random() > 0.5 ? 0x00ffff : 0x0088ff) : 
          (Math.random() > 0.5 ? 0xff0000 : 0xff8800);
        
        // Créer une particule simple
        if (this.textures.exists('bullet')) {
          const particle = this.add.image(x, y, 'bullet')
            .setScale(0.1 * Math.random() + 0.05)
            .setAlpha(0.7)
            .setTint(color)
            .setBlendMode(Phaser.BlendModes.ADD);
          
          // Animation simple
          this.tweens.add({
            targets: particle,
            x: x + (Math.random() - 0.5) * 100,
            y: y + (Math.random() - 0.5) * 100,
            alpha: 0,
            scale: 0,
            duration: 2000 + Math.random() * 2000,
            onComplete: () => {
              particle.destroy();
              
              // Recréer une particule pour maintenir l'effet
              if (this.scene.isActive('GameOverScene')) {
                this.createSingleParticle();
              }
            }
          });
        }
      }
    } catch (error) {
      console.log('Effet de particules désactivé');
    }
  }
  
  // Créer une seule particule (pour le remplacement continu)
  private createSingleParticle() {
    try {
      if (!this.textures.exists('bullet')) return;
      
      // Coordonnées aléatoires
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      
      // Couleurs selon l'état de victoire/défaite
      const color = this.victory ? 
        (Math.random() > 0.5 ? 0x00ffff : 0x0088ff) : 
        (Math.random() > 0.5 ? 0xff0000 : 0xff8800);
      
      // Créer une particule simple
      const particle = this.add.image(x, y, 'bullet')
        .setScale(0.1 * Math.random() + 0.05)
        .setAlpha(0.7)
        .setTint(color)
        .setBlendMode(Phaser.BlendModes.ADD);
      
      // Animation simple
      this.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        alpha: 0,
        scale: 0,
        duration: 2000 + Math.random() * 2000,
        onComplete: () => {
          particle.destroy();
          
          // Recréer une particule pour maintenir l'effet
          if (this.scene.isActive('GameOverScene')) {
            this.createSingleParticle();
          }
        }
      });
    } catch (error) {
      console.log('Erreur lors de la création de particule');
    }
  }
}