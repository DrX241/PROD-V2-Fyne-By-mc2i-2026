import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Chargement de tous les assets pour le jeu
    
    // Tuiles et carte - utiliser des ressources plus fiables
    this.load.image('tileset_terrain', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    this.load.image('background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    // Création d'une texture de fond procédurale dans la méthode create
    
    // Tours
    this.load.image('tower_firewall', 'https://cdn4.iconfinder.com/data/icons/cyber-security-51/65/Firewall-security-protection-cyber-512.png');
    this.load.image('tower_antivirus', 'https://cdn1.iconfinder.com/data/icons/cyber-security-65/512/antivirus-safety-protection-security-shield-512.png');
    this.load.image('tower_ids', 'https://cdn1.iconfinder.com/data/icons/cyber-security-19/64/ids_intrusion_detection_system-security-protection-512.png');
    this.load.image('tower_backup', 'https://cdn0.iconfinder.com/data/icons/cloud-technology-and-service/512/data_backup-storage-server-document-database-512.png');
    this.load.image('tower_encryption', 'https://cdn0.iconfinder.com/data/icons/digital-marketing-2-12/66/77-512.png');
    this.load.image('tower_honeypot', 'https://cdn3.iconfinder.com/data/icons/server-and-networking-3/512/Server_Network_Technology-14-512.png');
    
    // Base/serveur
    this.load.image('base', 'https://cdn2.iconfinder.com/data/icons/computer-hardware-88/64/Server-computing-data-storage-512.png');
    
    // Ennemis
    this.load.image('enemy_virus', 'https://cdn3.iconfinder.com/data/icons/virus-37/512/virus-bug-bacteria-micro-organism-512.png');
    this.load.image('enemy_malware', 'https://cdn3.iconfinder.com/data/icons/cyber-security-23/512/bug-malware-virus-security-512.png');
    this.load.image('enemy_ransomware', 'https://cdn2.iconfinder.com/data/icons/cyber-security-105/64/threat-ransomware-virus-malware-encryption-512.png');
    this.load.image('enemy_hacker', 'https://cdn3.iconfinder.com/data/icons/cyber-security-19/64/hacker_dark_side-criminal-anonymous-512.png');
    this.load.image('enemy_ddos', 'https://cdn3.iconfinder.com/data/icons/network-attacks-and-threats-1/512/ddos_attack-security-flood-network-ddos_attack-512.png');
    
    // UI et effets
    this.load.image('range_indicator', 'https://i.imgur.com/zYuPtOJ.png');
    this.load.image('button', 'https://i.imgur.com/eRmkhQM.png');
    this.load.image('panel', 'https://i.imgur.com/f9auswE.png');
    
    // Projectiles et effets
    this.load.image('bullet', 'https://i.imgur.com/D5PbEEl.png');
    this.load.image('explosion', 'https://i.imgur.com/LY5ZTIr.png');
    
    // Effets visuels et particules
    this.load.spritesheet('explosion_anim', 'https://i.imgur.com/X39Oxfn.png', { frameWidth: 64, frameHeight: 64 });
    
    // Charger les sons
    this.load.audio('shoot', ['https://assets.codepen.io/21542/Tower_Defense_Laser.mp3']);
    this.load.audio('explosion', ['https://assets.codepen.io/21542/Tower_Defense_Explosion.mp3']);
    this.load.audio('build', ['https://assets.codepen.io/21542/Tower_Defense_Build.mp3']);
    this.load.audio('game_over', ['https://assets.codepen.io/21542/Tower_Defense_Game_Over.mp3']);
    this.load.audio('background_music', ['https://assets.codepen.io/21542/Tower_Defense_Theme.mp3']);
    this.load.audio('wave_start', ['https://assets.codepen.io/21542/Tower_Defense_Wave.mp3']);
    
    // Police personnalisée (optionnel)
    this.load.bitmapFont('cyber_font', 'https://i.imgur.com/fmqsuU9.png', 'https://i.imgur.com/zD9B6RD.xml');
    
    // Définir le chemin pour le jeu
    this.load.json('map_data', 'https://assets.codepen.io/21542/tower_defense_map.json');
  }

  create() {
    // Animations pour les effets visuels (désactivé pour éviter les erreurs)
    try {
      if (this.textures.exists('explosion_anim')) {
        this.anims.create({
          key: 'explode',
          frames: this.anims.generateFrameNumbers('explosion_anim', { start: 0, end: 15 }),
          frameRate: 20,
          repeat: 0
        });
      }
    } catch (error) {
      console.log('Animation explosion non disponible');
    }
    
    // Créer un fond cybernétique procédural
    this.createCyberspaceBackground();

    // Passer à la scène du menu principal
    this.scene.start('MenuScene');
  }
  
  // Méthode pour créer un fond cybernétique sans dépendance externe
  private createCyberspaceBackground() {
    // Créer une texture procédurale pour le fond
    const graphics = this.make.graphics({ });
    
    // Fond noir
    graphics.fillStyle(0x000000);
    graphics.fillRect(0, 0, 800, 600);
    
    // Grille bleue
    graphics.lineStyle(1, 0x0088ff, 0.3);
    
    // Lignes horizontales
    for (let y = 0; y < 600; y += 40) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    
    // Lignes verticales
    for (let x = 0; x < 800; x += 40) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    
    // Points d'intersection lumineux
    graphics.fillStyle(0x00ffff, 0.5);
    for (let x = 0; x < 800; x += 40) {
      for (let y = 0; y < 600; y += 40) {
        if (Math.random() > 0.85) {
          graphics.fillCircle(x, y, 2);
        }
      }
    }
    
    // Quelques lignes de "circuit" aléatoires
    graphics.lineStyle(2, 0x00ff88, 0.4);
    for (let i = 0; i < 5; i++) {
      const startX = Math.random() * 800;
      const startY = Math.random() * 600;
      graphics.moveTo(startX, startY);
      
      let currentX = startX;
      let currentY = startY;
      
      for (let j = 0; j < 5; j++) {
        const nextX = currentX + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 200;
        const nextY = currentY + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 200;
        graphics.lineTo(nextX, nextY);
        currentX = nextX;
        currentY = nextY;
      }
    }
    
    // Générer la texture à partir des graphiques
    graphics.generateTexture('cyber_background', 800, 600);
    graphics.destroy();
  }
}