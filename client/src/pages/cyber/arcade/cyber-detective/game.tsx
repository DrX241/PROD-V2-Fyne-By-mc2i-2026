import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { FileText, Laptop, Mail, Lock, Key, Terminal, FileCode, Database, ShieldAlert, Server } from 'lucide-react';

// Types pour notre jeu
interface GameProps {
  currentScene: string;
  addToInventory: (item: {id: string, name: string, description: string, icon: React.ReactNode}) => void;
  changeScene: (scene: string) => void;
  inventory: Array<{id: string, name: string, description: string, icon: React.ReactNode}>;
}

export const CyberDetectiveGame: React.FC<GameProps> = ({
  currentScene,
  addToInventory,
  changeScene,
  inventory
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  // Définition des scènes et des éléments interactifs
  const scenes = {
    office: {
      name: 'Bureau Principal',
      background: 'office-bg',
      hotspots: [
        { 
          id: 'laptop', 
          name: 'Ordinateur Portable', 
          x: 300, 
          y: 250, 
          width: 100, 
          height: 80,
          description: "Un ordinateur portable appartenant à l'administrateur système. Il semble avoir été récemment utilisé.",
          icon: <Laptop className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'note', 
          name: 'Post-it avec mot de passe', 
          x: 450, 
          y: 220, 
          width: 50, 
          height: 50,
          description: "Un post-it avec le mot de passe 'Admin123!' écrit dessus. Une grave violation des bonnes pratiques de sécurité.",
          icon: <FileText className="h-4 w-4" />,
          type: 'item'
        },
        {
          id: 'to-server',
          name: 'Aller à la salle serveur',
          x: 600,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'server'
        },
        {
          id: 'to-security',
          name: 'Aller au département sécurité',
          x: 100,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'security'
        }
      ]
    },
    server: {
      name: 'Salle Serveur',
      background: 'server-bg',
      hotspots: [
        { 
          id: 'logs', 
          name: 'Journaux d\'accès', 
          x: 250, 
          y: 200, 
          width: 80, 
          height: 60,
          description: "Les journaux montrent des connexions inhabituelles à 3h du matin depuis une adresse IP non reconnue. Une indication claire d'accès non autorisé.",
          icon: <Terminal className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'server-rack', 
          name: 'Serveur principal', 
          x: 400, 
          y: 250, 
          width: 120, 
          height: 200,
          description: "Le serveur principal contenant les bases de données clients et les documents sensibles. Des traces d'accès non autorisé sont visibles dans les logs système.",
          icon: <Server className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'security-breach', 
          name: 'Faille de sécurité', 
          x: 550, 
          y: 230, 
          width: 70, 
          height: 60,
          description: "Une vulnérabilité zero-day dans le système d'authentification a été exploitée pour contourner les contrôles d'accès. Cette faille n'avait pas encore été patchée.",
          icon: <ShieldAlert className="h-4 w-4" />,
          type: 'item'
        },
        {
          id: 'to-office',
          name: 'Retourner au bureau',
          x: 100,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'office'
        }
      ]
    },
    security: {
      name: 'Département Sécurité',
      background: 'security-bg',
      hotspots: [
        { 
          id: 'email', 
          name: 'Email de phishing', 
          x: 300, 
          y: 180, 
          width: 90, 
          height: 70,
          description: "Un email de phishing sophistiqué envoyé à plusieurs employés, prétendant provenir du service informatique et demandant de réinitialiser les mots de passe. Point d'entrée probable de l'attaque.",
          icon: <Mail className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'access-key', 
          name: 'Clé d\'accès compromise', 
          x: 450, 
          y: 250, 
          width: 60, 
          height: 40,
          description: "Une clé d'API privilégiée qui a été compromise. L'attaquant l'a utilisée pour accéder à des ressources sensibles et exfiltrer des données.",
          icon: <Key className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'security-report', 
          name: 'Rapport de sécurité', 
          x: 550, 
          y: 220, 
          width: 80, 
          height: 100,
          description: "Un rapport de sécurité récent mettant en évidence plusieurs vulnérabilités critiques, dont certaines n'ont pas été corrigées à temps. La négligence est évidente.",
          icon: <FileText className="h-4 w-4" />,
          type: 'item'
        },
        {
          id: 'to-office',
          name: 'Retourner au bureau',
          x: 100,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'office'
        },
        {
          id: 'to-forensic',
          name: 'Aller au laboratoire forensique',
          x: 600,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'forensic'
        }
      ]
    },
    forensic: {
      name: 'Laboratoire Forensique',
      background: 'forensic-bg',
      hotspots: [
        { 
          id: 'malware', 
          name: 'Malware découvert', 
          x: 250, 
          y: 220, 
          width: 80, 
          height: 60,
          description: "Un malware sophistiqué conçu pour collecter des données sensibles et les exfiltrer vers un serveur externe. Il s'activait seulement pendant les heures non-ouvrées pour éviter la détection.",
          icon: <FileCode className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'database-dump', 
          name: 'Copie de base de données', 
          x: 400, 
          y: 250, 
          width: 90, 
          height: 70,
          description: "Une copie non autorisée de la base de données clients. Les logs indiquent qu'elle a été exfiltrée vers une adresse IP en Russie. Contient des informations personnelles et financières.",
          icon: <Database className="h-4 w-4" />,
          type: 'item'
        },
        { 
          id: 'access-control', 
          name: 'Système de contrôle d\'accès', 
          x: 550, 
          y: 230, 
          width: 70, 
          height: 50,
          description: "Le système de contrôle d'accès montre des signes de manipulation. L'attaquant a réussi à créer un compte administrateur fantôme qui a persisté même après la détection initiale de l'intrusion.",
          icon: <Lock className="h-4 w-4" />,
          type: 'item'
        },
        {
          id: 'to-security',
          name: 'Retourner au département sécurité',
          x: 100,
          y: 300,
          width: 80,
          height: 150,
          type: 'transition',
          target: 'security'
        }
      ]
    }
  };

  // Fonctions pour les actions dans le jeu
  const handleHotspotClick = (hotspot: any) => {
    if (hotspot.type === 'transition') {
      changeScene(hotspot.target);
    } else if (hotspot.type === 'item') {
      addToInventory({
        id: hotspot.id,
        name: hotspot.name,
        description: hotspot.description,
        icon: hotspot.icon
      });
    }
  };

  useEffect(() => {
    if (!gameRef.current) return;

    // Destruction de l'instance précédente si elle existe
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }

    // Configuration du jeu Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: 500,
      backgroundColor: '#1a1a1a',
      scene: {
        create: function(this: Phaser.Scene) {
          // Fond temporaire
          const graphics = this.add.graphics();
          graphics.fillStyle(0x1a1a1a, 1);
          graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
          
          // Titre de la scène
          const currentSceneData = scenes[currentScene as keyof typeof scenes];
          const sceneTitle = this.add.text(
            20, 
            20, 
            currentSceneData.name, 
            { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' }
          );
          
          // Instruction
          const instruction = this.add.text(
            20, 
            this.cameras.main.height - 40, 
            'Cliquez sur les éléments pour interagir', 
            { fontFamily: 'Arial', fontSize: '16px', color: '#aaaaaa' }
          );
          
          // Ajout des hotspots
          currentSceneData.hotspots.forEach((hotspot) => {
            const isCollected = inventory.some(item => item.id === hotspot.id);
            
            // Rectangle pour visualiser le hotspot
            const rect = this.add.rectangle(
              hotspot.x, 
              hotspot.y, 
              hotspot.width, 
              hotspot.height, 
              hotspot.type === 'transition' ? 0x4a7c59 : 0x5d8aa8,
              isCollected ? 0.2 : 0.8
            );
            
            // Texte du hotspot
            const text = this.add.text(
              hotspot.x, 
              hotspot.y, 
              hotspot.type === 'transition' ? '➔ ' + hotspot.name : isCollected ? '✓ ' + hotspot.name : hotspot.name, 
              { 
                fontFamily: 'Arial', 
                fontSize: '14px', 
                color: '#ffffff',
                align: 'center'
              }
            );
            text.setOrigin(0.5);
            
            // Rendre le hotspot interactif
            rect.setInteractive();
            
            // Ne pas permettre de recollectionner un élément déjà dans l'inventaire
            if (!(isCollected && hotspot.type === 'item')) {
              rect.on('pointerdown', () => {
                handleHotspotClick(hotspot);
              });
              
              // Effets au survol
              rect.on('pointerover', () => {
                rect.setAlpha(1);
                document.body.style.cursor = 'pointer';
              });
              
              rect.on('pointerout', () => {
                rect.setAlpha(isCollected ? 0.2 : 0.8);
                document.body.style.cursor = 'default';
              });
            }
          });
        }
      }
    };

    // Création de l'instance du jeu
    gameInstanceRef.current = new Phaser.Game(config);
    
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [currentScene, inventory, changeScene, addToInventory]);

  return (
    <div className="w-full h-full">
      <div ref={gameRef} className="w-full h-full" />
    </div>
  );
};