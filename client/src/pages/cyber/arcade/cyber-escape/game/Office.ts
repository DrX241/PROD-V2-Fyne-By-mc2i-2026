import Phaser from 'phaser';

export class Office {
  scene: Phaser.Scene;
  walls!: Phaser.Physics.Arcade.StaticGroup;
  furniture!: Phaser.Physics.Arcade.StaticGroup;
  floors!: Phaser.GameObjects.TileSprite;
  officeWidth: number = 1600;
  officeHeight: number = 1200;
  tileSize: number = 20;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Créer l'environnement de bureau
  create() {
    // Définir les limites du monde
    this.scene.physics.world.setBounds(0, 0, this.officeWidth, this.officeHeight);
    
    // Créer le sol
    this.createFloor();
    
    // Créer les murs
    this.createWalls();
    
    // Créer les meubles
    this.createFurniture();
  }

  // Créer le sol
  private createFloor() {
    this.floors = this.scene.add.tileSprite(
      0, 
      0, 
      this.officeWidth, 
      this.officeHeight, 
      'floor'
    );
    this.floors.setOrigin(0, 0);
    this.floors.setDepth(0);
  }

  // Créer les murs
  private createWalls() {
    this.walls = this.scene.physics.add.staticGroup();
    
    // Murs extérieurs
    // Haut
    for (let x = 0; x < this.officeWidth; x += this.tileSize) {
      this.addWall(x, 0);
    }
    
    // Bas
    for (let x = 0; x < this.officeWidth; x += this.tileSize) {
      this.addWall(x, this.officeHeight - this.tileSize);
    }
    
    // Gauche
    for (let y = 0; y < this.officeHeight; y += this.tileSize) {
      this.addWall(0, y);
    }
    
    // Droite
    for (let y = 0; y < this.officeHeight; y += this.tileSize) {
      this.addWall(this.officeWidth - this.tileSize, y);
    }
    
    // Murs intérieurs pour créer des pièces
    this.createRoom(200, 200, 400, 300);
    this.createRoom(700, 200, 400, 300);
    this.createRoom(200, 600, 400, 300);
    this.createRoom(700, 600, 400, 300);
    
    // Couloirs
    this.createHorizontalWall(400, 400, 200);
  }

  // Ajouter un mur individuel
  private addWall(x: number, y: number) {
    const wall = this.walls.create(x, y, 'wall');
    wall.setOrigin(0, 0);
    
    // S'assurer que le mur est considéré comme un obstacle solide
    wall.body.immovable = true;
    
    return wall;
  }

  // Créer une pièce rectangulaire
  private createRoom(x: number, y: number, width: number, height: number) {
    // Position de la porte (aléatoire sur l'un des côtés)
    const doorSide = Math.floor(Math.random() * 4); // 0: haut, 1: droite, 2: bas, 3: gauche
    const doorPosition = Math.random();
    
    // Haut de la pièce
    for (let i = 0; i < width; i += this.tileSize) {
      if (doorSide === 0 && doorPosition > i / width && doorPosition < (i + this.tileSize * 2) / width) {
        // Laisser un espace pour la porte
        continue;
      }
      this.addWall(x + i, y);
    }
    
    // Bas de la pièce
    for (let i = 0; i < width; i += this.tileSize) {
      if (doorSide === 2 && doorPosition > i / width && doorPosition < (i + this.tileSize * 2) / width) {
        // Laisser un espace pour la porte
        continue;
      }
      this.addWall(x + i, y + height - this.tileSize);
    }
    
    // Gauche de la pièce
    for (let i = 0; i < height; i += this.tileSize) {
      if (doorSide === 3 && doorPosition > i / height && doorPosition < (i + this.tileSize * 2) / height) {
        // Laisser un espace pour la porte
        continue;
      }
      this.addWall(x, y + i);
    }
    
    // Droite de la pièce
    for (let i = 0; i < height; i += this.tileSize) {
      if (doorSide === 1 && doorPosition > i / height && doorPosition < (i + this.tileSize * 2) / height) {
        // Laisser un espace pour la porte
        continue;
      }
      this.addWall(x + width - this.tileSize, y + i);
    }
  }

  // Créer un mur horizontal
  private createHorizontalWall(x: number, y: number, length: number) {
    for (let i = 0; i < length; i += this.tileSize) {
      this.addWall(x + i, y);
    }
  }

  // Créer un mur vertical
  private createVerticalWall(x: number, y: number, length: number) {
    for (let i = 0; i < length; i += this.tileSize) {
      this.addWall(x, y + i);
    }
  }

  // Créer les meubles de bureau
  private createFurniture() {
    this.furniture = this.scene.physics.add.staticGroup();
    
    // Bureau dans la première pièce
    this.addDesk(300, 250);
    this.addDesk(300, 350);
    
    // Bureau dans la deuxième pièce
    this.addDesk(800, 250);
    this.addDesk(800, 350);
    
    // Bureau dans la troisième pièce
    this.addDesk(300, 650);
    this.addDesk(300, 750);
    
    // Bureau dans la quatrième pièce
    this.addDesk(800, 650);
    this.addDesk(800, 750);
  }

  // Ajouter un bureau
  private addDesk(x: number, y: number) {
    const desk = this.furniture.create(x, y, 'desk');
    desk.setOrigin(0.5);
    desk.setDepth(5);
    
    // Ajuster la hitbox du bureau
    desk.body.setSize(70, 30);
    
    return desk;
  }

  // Obtenir des positions aléatoires dans l'environnement
  getRandomPositions(count: number): { x: number, y: number }[] {
    const positions: { x: number, y: number }[] = [];
    const minDistance = 50; // Distance minimale entre les positions
    
    // Essayer un nombre maximum de fois
    let maxTries = count * 10;
    
    while (positions.length < count && maxTries > 0) {
      // Générer une position aléatoire
      const x = Phaser.Math.Between(100, this.officeWidth - 100);
      const y = Phaser.Math.Between(100, this.officeHeight - 100);
      
      // Vérifier si la position est valide (pas dans un mur ou un meuble)
      const isClear = !this.isPositionBlocked(x, y);
      
      // Vérifier si la position est suffisamment éloignée des autres positions
      const isDistant = positions.every(pos => 
        Phaser.Math.Distance.Between(x, y, pos.x, pos.y) >= minDistance
      );
      
      if (isClear && isDistant) {
        positions.push({ x, y });
      }
      
      maxTries--;
    }
    
    return positions;
  }

  // Vérifier si une position est bloquée par un mur ou un meuble
  private isPositionBlocked(x: number, y: number): boolean {
    // Vérifier la collision avec les murs
    const wallCollision = this.walls.getChildren().some((wall: any) => {
      return this.checkCollision(x, y, wall.x, wall.y, wall.width, wall.height);
    });
    
    if (wallCollision) return true;
    
    // Vérifier la collision avec les meubles
    const furnitureCollision = this.furniture.getChildren().some((furniture: any) => {
      return this.checkCollision(
        x, y, 
        furniture.x - furniture.width / 2, 
        furniture.y - furniture.height / 2, 
        furniture.width, 
        furniture.height
      );
    });
    
    return furnitureCollision;
  }

  // Vérifier la collision entre un point et un rectangle
  private checkCollision(
    pointX: number, 
    pointY: number, 
    rectX: number, 
    rectY: number, 
    rectWidth: number, 
    rectHeight: number
  ): boolean {
    return (
      pointX >= rectX && 
      pointX <= rectX + rectWidth && 
      pointY >= rectY && 
      pointY <= rectY + rectHeight
    );
  }
}