import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Ne pas charger de logo pour éviter les erreurs
    // this.load.image('logo', '/cyber-logo.png');
    
    // Créer un écran de chargement simple
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Afficher un texte de chargement
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Initialisation...',
      style: {
        font: '24px Rajdhani',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Progression graphique
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);
    
    // Mise à jour de la barre de progression
    this.load.on('progress', function (value: number) {
      progressBar.clear();
      progressBar.fillStyle(0x0077ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 5, 300 * value, 20);
    });
    
    // Nettoyage quand tout est chargé
    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    this.scene.start('PreloadScene');
  }
}