import Phaser from 'phaser';
import { Player } from './Player';
import { Office } from './Office';
import { Vulnerability } from './Vulnerability';
import { Hacker } from './Hacker';

export class CyberEscapeGame extends Phaser.Scene {
  // Propriétés du jeu
  private player!: Player;
  private office!: Office;
  private vulnerabilities!: Phaser.Physics.Arcade.StaticGroup;
  private hacker!: Hacker;
  private gameTime: number = 300; // 5 minutes en secondes
  private timerEvent!: Phaser.Time.TimerEvent;
  private totalVulnerabilities: number = 10;
  private fixedVulnerabilities: number = 0;
  private gameStarted: boolean = false;
  private hackerScore: number = 0;
  private gameLevel: number = 1;
  private isGameOver: boolean = false;
  
  // Interface utilisateur dans le jeu
  private debugText!: Phaser.GameObjects.Text;
  private vulnerabilityTypes = [
    'password', // Post-it avec mot de passe visible
    'usb',      // Port USB non sécurisé
    'screen',   // Écran déverrouillé
    'document', // Document confidentiel
    'device'    // Appareil non autorisé
  ];

  // Préchargement des ressources
  constructor() {
    super({ key: 'CyberEscapeGame' });
  }

  preload() {
    // Image temporaire pour le joueur
    this.load.svg('player', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzNCODJGNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+', { width: 32, height: 32 });
    
    // Image temporaire pour le pirate informatique
    this.load.svg('hacker', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0VGNDg4RSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+', { width: 32, height: 32 });
    
    // Image temporaire pour les vulnérabilités
    this.load.svg('vulnerability', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPiE8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    
    // Images pour les différents types de vulnérabilités
    this.load.svg('password', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPlA8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    this.load.svg('usb', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPlU8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    this.load.svg('screen', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPlM8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    this.load.svg('document', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPkQ8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    this.load.svg('device', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTYiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPkU8L3RleHQ+PC9zdmc+', { width: 32, height: 32 });
    
    // Image temporaire pour les meubles de bureau
    this.load.svg('desk', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDgwIDQwIj48cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iNzAiIGhlaWdodD0iMzAiIGZpbGw9IiNBNjdDMDAiIHN0cm9rZT0iIzRCMkYwOSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iMyIgcnk9IjMiLz48L3N2Zz4=', { width: 80, height: 40 });
    this.load.svg('wall', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8yMDAwL3N2ZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgZmlsbD0iIzY0NzQ4QiIgc3Ryb2tlPSIjNEI1NTYzIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=', { width: 20, height: 20 });
    this.load.svg('floor', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8yMDAwL3N2ZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI0YyRjJGMiIgc3Ryb2tlPSIjRTVFNUU1IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=', { width: 20, height: 20 });
  }

  // Création du niveau et des objets du jeu
  create() {
    // Référence à la taille du canvas
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Créer l'environnement du bureau (sol, murs, meubles)
    this.office = new Office(this);
    this.office.create();
    
    // Créer le joueur
    this.player = new Player(this, width / 2, height / 2);
    
    // Créer le pirate informatique
    this.hacker = new Hacker(this, 100, 100);
    
    // Créer les vulnérabilités
    this.createVulnerabilities();
    
    // Configuration de la caméra
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);
    
    // Collisions
    this.physics.add.collider(this.player.sprite, this.office.walls);
    this.physics.add.collider(this.player.sprite, this.office.furniture);
    this.physics.add.collider(this.hacker.sprite, this.office.walls);
    this.physics.add.collider(this.hacker.sprite, this.office.furniture);
    
    // Interactions avec les vulnérabilités
    this.physics.add.overlap(
      this.player.sprite,
      this.vulnerabilities,
      this.handleVulnerabilityOverlap,
      undefined,
      this
    );
    
    // Texte de débogage et information
    this.debugText = this.add.text(10, 10, '', { 
      font: '16px Arial', 
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(100);
    
    // Interface utilisateur de démarrage
    this.createStartUI();
    
    // Mise à jour des statistiques
    this.updateStats();
  }

  // Cette méthode est appelée par le composant React pour démarrer le jeu
  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    
    // Démarrer le compte à rebours
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
    
    // Mettre à jour l'interface
    this.updateStats();
    
    // Notifier l'interface React
    if (window.PhaserEvents) {
      window.PhaserEvents.setGameStatus('playing');
    }
    
    // Activer les entrées pour le joueur
    this.player.enableControls();
    
    // Activer l'IA du pirate informatique
    this.hacker.startHacking(this.vulnerabilities);
    
    // Message de début de jeu
    if (window.PhaserEvents) {
      window.PhaserEvents.showToast('Mission commencée ! Trouvez et corrigez les failles de sécurité avant le pirate informatique.', 'info');
    }
  }

  // Mise à jour du jeu à chaque frame
  update(time: number, delta: number) {
    if (!this.gameStarted || this.isGameOver) return;
    
    // Mettre à jour le joueur et le pirate
    this.player.update();
    this.hacker.update(this.vulnerabilities, delta / 1000);
    
    // Vérifier la condition de victoire/défaite
    this.checkGameStatus();
    
    // Mettre à jour le texte de débogage
    this.updateDebugText();
  }

  // Création des vulnérabilités dans le bureau
  private createVulnerabilities() {
    this.vulnerabilities = this.physics.add.staticGroup();
    
    // Déterminer le nombre de vulnérabilités en fonction du niveau
    this.totalVulnerabilities = 5 + (this.gameLevel * 2);
    
    // Placer les vulnérabilités aléatoirement dans la pièce
    const positions = this.office.getRandomPositions(this.totalVulnerabilities);
    
    positions.forEach((pos, index) => {
      // Sélectionner un type de vulnérabilité aléatoire
      const vulnType = this.vulnerabilityTypes[Math.floor(Math.random() * this.vulnerabilityTypes.length)];
      const vulnerability = new Vulnerability(this, pos.x, pos.y, vulnType);
      this.vulnerabilities.add(vulnerability.sprite);
      
      // Stocker des informations supplémentaires sur la vulnérabilité
      vulnerability.sprite.setData('type', vulnType);
      vulnerability.sprite.setData('index', index);
      vulnerability.sprite.setData('fixed', false);
      vulnerability.sprite.setData('object', vulnerability);
    });
    
    // Mettre à jour les statistiques
    this.updateStats();
  }

  // Gestion de la collision entre le joueur et une vulnérabilité
  private handleVulnerabilityOverlap(playerSprite: Phaser.GameObjects.GameObject, vulnSprite: Phaser.GameObjects.GameObject) {
    // Ignorer si la vulnérabilité est déjà corrigée
    if (vulnSprite.getData('fixed')) return;
    
    // Vérifier si le joueur appuie sur la touche d'interaction (E)
    const keyE = this.input.keyboard.addKey('E');
    if (Phaser.Input.Keyboard.JustDown(keyE) || this.input.activePointer.isDown) {
      // Obtenir les informations sur la vulnérabilité
      const vulnType = vulnSprite.getData('type');
      const vulnerability = vulnSprite.getData('object') as Vulnerability;
      
      // Marquer comme corrigée
      vulnSprite.setData('fixed', true);
      vulnerability.markAsFixed();
      
      // Mettre à jour le compteur
      this.fixedVulnerabilities++;
      
      // Afficher un message
      const messages = {
        'password': 'Mot de passe sécurisé ! Les Post-it ne sont pas un bon moyen de stocker des mots de passe.',
        'usb': 'Port USB sécurisé ! Les ports USB non surveillés sont une menace pour la sécurité.',
        'screen': 'Écran verrouillé ! Ne jamais laisser un ordinateur déverrouillé sans surveillance.',
        'document': 'Document confidentiel rangé ! Les informations sensibles doivent être protégées.',
        'device': 'Appareil non autorisé retiré ! Les appareils personnels peuvent compromettre le réseau.'
      };
      
      if (window.PhaserEvents) {
        window.PhaserEvents.showToast(messages[vulnType as keyof typeof messages], 'success');
      }
      
      // Mettre à jour les statistiques
      this.updateStats();
    }
  }

  // Mise à jour du minuteur
  private updateTimer() {
    if (this.gameTime > 0) {
      this.gameTime--;
      this.updateStats();
      
      // Le pirate informatique progresse avec le temps
      if (this.gameTime % 15 === 0 && Math.random() > 0.5) {
        this.hackerProgress();
      }
      
      if (this.gameTime <= 30 && this.gameTime % 10 === 0) {
        if (window.PhaserEvents) {
          window.PhaserEvents.showToast(`Attention ! Plus que ${this.gameTime} secondes !`, 'warning');
        }
      }
    } else {
      // Temps écoulé, le joueur perd
      this.endGame(false);
    }
  }

  // Mise à jour des statistiques affichées dans l'interface React
  private updateStats() {
    if (window.PhaserEvents) {
      window.PhaserEvents.updateStats({
        timeRemaining: this.gameTime,
        fixes: this.fixedVulnerabilities,
        totalVulnerabilities: this.totalVulnerabilities,
        level: this.gameLevel
      });
    }
  }

  // Le pirate informatique trouve une vulnérabilité
  private hackerProgress() {
    if (this.isGameOver) return;
    
    // Rechercher les vulnérabilités non corrigées
    const unfixedVulnerabilities = Array.from(this.vulnerabilities.getChildren())
      .filter(vuln => !vuln.getData('fixed'));
    
    if (unfixedVulnerabilities.length > 0) {
      // Le pirate exploite une vulnérabilité aléatoire
      const randomIndex = Math.floor(Math.random() * unfixedVulnerabilities.length);
      const vulnSprite = unfixedVulnerabilities[randomIndex] as Phaser.Physics.Arcade.Sprite;
      const vulnType = vulnSprite.getData('type');
      const vulnerability = vulnSprite.getData('object') as Vulnerability;
      
      // Marquer comme exploitée par le pirate
      vulnSprite.setData('fixed', true);
      vulnSprite.setData('hackerExploited', true);
      vulnerability.markAsExploited();
      
      // Augmenter le score du pirate
      this.hackerScore++;
      
      // Message d'alerte
      const messages = {
        'password': 'Alerte ! Le pirate a trouvé un mot de passe sur un Post-it !',
        'usb': 'Alerte ! Le pirate a utilisé un port USB non sécurisé !',
        'screen': 'Alerte ! Le pirate a accédé à un écran déverrouillé !',
        'document': 'Alerte ! Le pirate a volé un document confidentiel !',
        'device': 'Alerte ! Le pirate a connecté un appareil non autorisé !'
      };
      
      if (window.PhaserEvents) {
        window.PhaserEvents.showToast(messages[vulnType as keyof typeof messages], 'error');
      }
      
      // Vérifier si le pirate a gagné
      if (this.hackerScore >= Math.ceil(this.totalVulnerabilities / 2)) {
        this.endGame(false);
      }
    }
  }

  // Vérifier si le joueur a gagné ou perdu
  private checkGameStatus() {
    if (this.isGameOver) return;
    
    // Victoire si toutes les vulnérabilités sont corrigées
    if (this.fixedVulnerabilities >= this.totalVulnerabilities) {
      this.endGame(true);
    }
    
    // Défaite si le pirate a exploité trop de vulnérabilités
    if (this.hackerScore >= Math.ceil(this.totalVulnerabilities / 2)) {
      this.endGame(false);
    }
  }

  // Terminer la partie
  private endGame(victory: boolean) {
    this.isGameOver = true;
    
    // Arrêter le minuteur
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    
    // Désactiver les contrôles du joueur
    this.player.disableControls();
    
    // Arrêter le pirate
    this.hacker.stop();
    
    // Mettre à jour l'interface React
    if (window.PhaserEvents) {
      window.PhaserEvents.setGameStatus(victory ? 'victory' : 'gameOver');
    }
  }

  // Créer l'interface de démarrage
  private createStartUI() {
    // Cette partie est gérée par React dans le composant parent
  }

  // Mise à jour du texte de débogage
  private updateDebugText() {
    this.debugText.setText(`Niveau: ${this.gameLevel} | Failles corrigées: ${this.fixedVulnerabilities}/${this.totalVulnerabilities} | Temps: ${this.gameTime}s | Pirate: ${this.hackerScore}`);
  }
}