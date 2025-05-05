import Phaser from 'phaser';

export class Player {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  speed: number = 150;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasdKeys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  scanKey: Phaser.Input.Keyboard.Key;
  scanRadius: number = 100;
  scanCooldown: number = 0;
  controlsEnabled: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Créer le sprite du joueur
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    
    // Ajout d'une hitbox plus petite que le sprite
    this.sprite.body.setSize(24, 24);
    this.sprite.body.offset.x = 4;
    this.sprite.body.offset.y = 4;
    
    // Configuration des contrôles
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      up: scene.input.keyboard.addKey('W'),
      down: scene.input.keyboard.addKey('S'),
      left: scene.input.keyboard.addKey('A'),
      right: scene.input.keyboard.addKey('D')
    };
    
    // Touche pour scanner les vulnérabilités
    this.scanKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // Activation des contrôles
  enableControls() {
    this.controlsEnabled = true;
  }

  // Désactivation des contrôles
  disableControls() {
    this.controlsEnabled = false;
    this.sprite.setVelocity(0, 0);
  }

  // Mise à jour à chaque frame
  update() {
    if (!this.controlsEnabled) return;
    
    // Gestion du déplacement
    this.handleMovement();
    
    // Gestion du scan (touche espace)
    this.handleScan();
  }

  // Gestion du déplacement du joueur
  private handleMovement() {
    // Réinitialiser la vélocité
    this.sprite.setVelocity(0);
    
    // Déplacement horizontal
    if (this.cursors.left.isDown || this.wasdKeys.left.isDown) {
      this.sprite.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) {
      this.sprite.setVelocityX(this.speed);
    }
    
    // Déplacement vertical
    if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
      this.sprite.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
      this.sprite.setVelocityY(this.speed);
    }
    
    // Normaliser la diagonale
    if (this.sprite.body.velocity.x !== 0 && this.sprite.body.velocity.y !== 0) {
      this.sprite.body.velocity.normalize().scale(this.speed);
    }
  }

  // Fonction pour scanner les vulnérabilités à proximité
  private handleScan() {
    if (this.scanCooldown > 0) {
      this.scanCooldown--;
      return;
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.scanKey)) {
      // Créer une animation de scan
      this.createScanEffect();
      
      // Vérifier les vulnérabilités à proximité
      this.scanNearbyVulnerabilities();
      
      // Appliquer un temps de recharge
      this.scanCooldown = 60; // ~1 seconde à 60 FPS
    }
  }

  // Créer une animation d'effet de scan
  private createScanEffect() {
    const circle = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      10,
      0x3498db,
      0.7
    );
    
    circle.setDepth(5);
    
    // Animation d'expansion
    this.scene.tweens.add({
      targets: circle,
      radius: this.scanRadius,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        circle.destroy();
      }
    });
  }

  // Scanner les vulnérabilités à proximité
  private scanNearbyVulnerabilities() {
    // Récupérer toutes les vulnérabilités de la scène
    const vulnerabilities = this.scene.physics.add.group().getChildren();
    
    // Vérifier si des vulnérabilités sont à proximité
    let foundVuln = false;
    
    vulnerabilities.forEach((vuln: any) => {
      if (vuln.getData && !vuln.getData('fixed')) {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          vuln.x,
          vuln.y
        );
        
        if (distance <= this.scanRadius) {
          // Vulnérabilité trouvée, la mettre en évidence
          this.highlightVulnerability(vuln);
          foundVuln = true;
        }
      }
    });
    
    // Notification pour le joueur
    if (window.PhaserEvents) {
      if (foundVuln) {
        window.PhaserEvents.showToast('Vulnérabilité détectée à proximité !', 'info');
      } else {
        window.PhaserEvents.showToast('Aucune vulnérabilité détectée dans cette zone.', 'info');
      }
    }
  }

  // Mettre en évidence une vulnérabilité
  private highlightVulnerability(vulnerability: Phaser.GameObjects.GameObject) {
    const vuln = vulnerability as Phaser.Physics.Arcade.Sprite;
    
    // Faire briller brièvement la vulnérabilité
    this.scene.tweens.add({
      targets: vuln,
      alpha: 0.2,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }
}