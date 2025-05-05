import Phaser from 'phaser';

export class Hacker {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  targetVulnerability: Phaser.Physics.Arcade.Sprite | null = null;
  speed: number = 80;
  hackingProgress: number = 0;
  hackingRate: number = 0.1; // Taux de piratage par seconde
  isActive: boolean = false;
  moveTimer: Phaser.Time.TimerEvent | null = null;
  alertCircle: Phaser.GameObjects.Ellipse | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Créer le sprite du pirate
    this.sprite = scene.physics.add.sprite(x, y, 'hacker');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    
    // Ajout d'une hitbox plus petite que le sprite
    if (this.sprite.body) {
      this.sprite.body.setSize(24, 24);
      this.sprite.body.offset.x = 4;
      this.sprite.body.offset.y = 4;
    }
    
    // Ajouter un cercle d'alerte autour du pirate (invisible par défaut)
    this.alertCircle = scene.add.ellipse(x, y, 60, 60, 0xff0000, 0.2);
    this.alertCircle.setDepth(9);
    this.alertCircle.setVisible(false);
  }

  // Démarrer l'activité de piratage
  startHacking(vulnerabilities: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup) {
    this.isActive = true;
    
    // Choisir une vulnérabilité cible
    this.chooseNewTarget(vulnerabilities);
    
    // Démarrer le timer pour changer de cible périodiquement
    this.moveTimer = this.scene.time.addEvent({
      delay: 10000, // 10 secondes
      callback: () => this.chooseNewTarget(vulnerabilities),
      callbackScope: this,
      loop: true
    });
    
    // Rendre le cercle d'alerte visible
    if (this.alertCircle) {
      this.alertCircle.setVisible(true);
    }
  }

  // Arrêter l'activité de piratage
  stop() {
    this.isActive = false;
    
    // Arrêter les mouvements
    this.sprite.setVelocity(0, 0);
    
    // Arrêter le timer
    if (this.moveTimer) {
      this.moveTimer.remove();
      this.moveTimer = null;
    }
    
    // Cacher le cercle d'alerte
    if (this.alertCircle) {
      this.alertCircle.setVisible(false);
    }
  }

  // Mise à jour à chaque frame
  update(vulnerabilities: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup, deltaTime: number) {
    if (!this.isActive) return;
    
    // Mettre à jour la position du cercle d'alerte
    if (this.alertCircle) {
      this.alertCircle.setPosition(this.sprite.x, this.sprite.y);
    }
    
    // Si on a une cible, se déplacer vers elle
    if (this.targetVulnerability && !this.targetVulnerability.getData('fixed') && !this.targetVulnerability.getData('hackerExploited')) {
      this.moveTowardsTarget();
      
      // Vérifier si on est assez proche pour pirater
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        this.targetVulnerability.x,
        this.targetVulnerability.y
      );
      
      if (distance < 50) {
        // Pirater la vulnérabilité
        this.hackingProgress += this.hackingRate * deltaTime;
        
        // Si le piratage est complet, créer une alerte pour l'interface
        if (this.hackingProgress >= 1) {
          // Réinitialiser la progression
          this.hackingProgress = 0;
          
          // Simuler l'exploitation de la vulnérabilité
          this.simulateExploit(this.targetVulnerability);
          
          // Trouver une nouvelle cible
          this.chooseNewTarget(vulnerabilities);
        }
      }
    } else {
      // Si on n'a pas de cible valide, en chercher une nouvelle
      this.chooseNewTarget(vulnerabilities);
    }
  }

  // Choisir une nouvelle vulnérabilité à cibler
  private chooseNewTarget(vulnerabilities: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup) {
    // Réinitialiser la progression du piratage
    this.hackingProgress = 0;
    
    // Récupérer toutes les vulnérabilités non corrigées
    const availableVulns = vulnerabilities.getChildren().filter((vuln: any) => {
      return !vuln.getData('fixed') && !vuln.getData('hackerExploited');
    });
    
    if (availableVulns.length === 0) {
      // Plus de vulnérabilités à exploiter
      this.targetVulnerability = null;
      this.sprite.setVelocity(0, 0);
      return;
    }
    
    // Choisir une vulnérabilité aléatoire
    const randomIndex = Math.floor(Math.random() * availableVulns.length);
    this.targetVulnerability = availableVulns[randomIndex] as Phaser.Physics.Arcade.Sprite;
    
    // Animation de déplacement vers la cible
    this.scene.tweens.add({
      targets: this.alertCircle,
      alpha: 0.4,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }

  // Se déplacer vers la vulnérabilité cible
  private moveTowardsTarget() {
    if (!this.targetVulnerability) return;
    
    // Calculer la direction vers la cible
    const direction = new Phaser.Math.Vector2(
      this.targetVulnerability.x - this.sprite.x,
      this.targetVulnerability.y - this.sprite.y
    );
    
    // Normaliser la direction et appliquer la vitesse
    if (direction.length() > 0) {
      direction.normalize();
      this.sprite.setVelocity(
        direction.x * this.speed,
        direction.y * this.speed
      );
    } else {
      this.sprite.setVelocity(0, 0);
    }
  }

  // Simuler l'exploitation d'une vulnérabilité
  private simulateExploit(vulnerability: Phaser.Physics.Arcade.Sprite) {
    // Marquer la vulnérabilité comme exploitée pour éviter de la cibler à nouveau
    vulnerability.setData('hackerExploited', true);
    
    // Récupérer l'objet Vulnerability pour appeler la méthode d'exploitation
    const vulnObject = vulnerability.getData('object');
    if (vulnObject && typeof vulnObject.markAsExploited === 'function') {
      vulnObject.markAsExploited();
    }
    
    // Animation pour montrer que le pirate a réussi
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.3,
      duration: 200,
      yoyo: true,
      repeat: 1
    });
    
    // Créer un effet visuel d'exploitation
    const exploitEffect = this.scene.add.circle(
      vulnerability.x,
      vulnerability.y,
      20,
      0xff0000,
      0.7
    );
    
    exploitEffect.setDepth(15);
    
    this.scene.tweens.add({
      targets: exploitEffect,
      radius: 40,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        exploitEffect.destroy();
      }
    });
  }
}