import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FileText, Laptop, Mail, Lock, Key, Terminal, FileCode, Database, ShieldAlert, Server, Shield } from 'lucide-react';

// Importation des assets
import officeBgSvg from '@/assets/cyber-detective/office-bg.svg';
import serverRoomSvg from '@/assets/cyber-detective/server-room.svg';
import securityRoomSvg from '@/assets/cyber-detective/security-room.svg';
import forensicLabSvg from '@/assets/cyber-detective/forensic-lab.svg';
import postItSvg from '@/assets/cyber-detective/post-it.svg';
import securityBadgeSvg from '@/assets/cyber-detective/security-badge.svg';
import masterKeySvg from '@/assets/cyber-detective/master-key.svg';
import doorSvg from '@/assets/cyber-detective/door.svg';
import computerSvg from '@/assets/cyber-detective/computer.svg';
import terminalSvg from '@/assets/cyber-detective/terminal.svg';

// Types pour notre jeu
interface GameProps {
  currentScene: string;
  addToInventory: (item: {id: string, name: string, description: string, icon: React.ReactNode}) => void;
  changeScene: (scene: string) => void;
  inventory: Array<{id: string, name: string, description: string, icon: React.ReactNode}>;
  openPasswordDialog: (puzzle: PuzzleData) => void;
  openTerminalDialog: (puzzle: PuzzleData) => void;
}

export interface PuzzleData {
  id: string;
  title: string;
  type: 'password' | 'terminal' | 'code' | 'firewall';
  description: string;
  solution: string;
  hint: string;
  unlocks?: string; // ID de la scène ou de l'élément débloqué
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CyberDetectiveGame: React.FC<GameProps> = ({
  currentScene,
  addToInventory,
  changeScene,
  inventory,
  openPasswordDialog,
  openTerminalDialog
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  
  // Vérifier si certains éléments sont déverrouillés
  const isUnlocked = (itemId: string) => {
    // Logique pour vérifier si un élément est déverrouillé
    switch(itemId) {
      case 'ceo-computer':
        return inventory.some(item => item.id === 'access-key');
      case 'server-room-door':
        return inventory.some(item => item.id === 'security-badge');
      case 'secure-vault':
        return inventory.some(item => item.id === 'master-key');
      case 'forensic-lab':
        return inventory.some(item => item.id === 'security-clearance');
      default:
        return true;
    }
  };

  // Liste des puzzles disponibles
  const puzzles: Record<string, PuzzleData> = {
    'admin-login': {
      id: 'admin-login',
      title: 'Connexion Administrateur',
      type: 'password',
      description: "Terminal de connexion administrateur pour accéder au système principal. Vous avez trouvé un post-it avec le mot de passe 'Admin123!'.",
      solution: 'Admin123!',
      hint: "Vérifiez les post-it sur le bureau, les administrateurs écrivent souvent leurs mots de passe.",
      unlocks: 'security-badge',
      difficulty: 'easy'
    },
    'router-config': {
      id: 'router-config',
      title: 'Configuration du Routeur',
      type: 'terminal',
      description: "Interface de configuration du routeur réseau. Vous devez désactiver le port 22 qui a été exploité par l'attaquant.",
      solution: 'service ssh stop && iptables -A INPUT -p tcp --dport 22 -j DROP',
      hint: "Utilisez les commandes 'service' et 'iptables' pour arrêter le service SSH et bloquer le port 22.",
      unlocks: 'network-logs',
      difficulty: 'medium'
    },
    'secure-vault-access': {
      id: 'secure-vault-access',
      title: 'Accès au Coffre-Fort Numérique',
      type: 'password',
      description: "Coffre-fort numérique contenant les données critiques de l'entreprise. Protégé par un mot de passe complexe.",
      solution: 'TechS3cure2025!',
      hint: "Recherchez dans les emails ou documents. Le format semble être le nom de l'entreprise + année en cours avec des caractères spéciaux.",
      unlocks: 'encrypted-files',
      difficulty: 'hard'
    },
    'firewall-override': {
      id: 'firewall-override',
      title: 'Déverrouillage du Pare-feu',
      type: 'terminal',
      description: "Le pare-feu a été verrouillé par l'attaquant. Vous devez regagner le contrôle en entrant la commande de réinitialisation d'urgence.",
      solution: 'sudo firewall-cmd --permanent --zone=public --add-service=https && sudo firewall-cmd --reload',
      hint: "Utilisez 'firewall-cmd' avec les options appropriées pour permettre le trafic HTTPS et recharger les règles.",
      unlocks: 'master-key',
      difficulty: 'hard'
    }
  };

  // Définition des scènes et des éléments interactifs
  const scenes = {
    office: {
      name: 'Bureau Principal',
      background: 'office-bg',
      locked: false,
      hotspots: [
        { 
          id: 'laptop', 
          name: 'Ordinateur Portable', 
          x: 300, 
          y: 250, 
          width: 100, 
          height: 80,
          description: "Un ordinateur portable appartenant à l'administrateur système. Il vous demande un mot de passe pour déverrouiller la session.",
          icon: <Laptop className="h-4 w-4" />,
          type: 'puzzle',
          puzzleId: 'admin-login'
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
          id: 'security-badge', 
          name: 'Badge de sécurité', 
          x: 200, 
          y: 180, 
          width: 40, 
          height: 40,
          description: "Un badge de sécurité donnant accès aux zones réglementées du bâtiment. Il est nécessaire pour entrer dans la salle des serveurs.",
          icon: <Key className="h-4 w-4" />,
          type: 'locked-item',
          unlockedBy: 'admin-login'
        },
        {
          id: 'to-server',
          name: 'Aller à la salle serveur',
          x: 600,
          y: 300,
          width: 80,
          height: 150,
          type: 'locked-transition',
          target: 'server',
          requiredItem: 'security-badge',
          lockedMessage: "La porte de la salle serveur nécessite un badge de sécurité pour être ouverte."
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
      locked: true,
      requiredItem: 'security-badge',
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
          description: "Le terminal du serveur principal est verrouillé. Vous devez exécuter une commande pour vérifier les connexions récentes.",
          icon: <Server className="h-4 w-4" />,
          type: 'puzzle',
          puzzleId: 'router-config'
        },
        { 
          id: 'network-logs', 
          name: 'Logs réseau', 
          x: 550, 
          y: 230, 
          width: 70, 
          height: 60,
          description: "Logs des communications réseau montrant un tunnel chiffré vers un serveur externe. L'attaquant a utilisé ce canal pour extraire des données pendant plusieurs semaines.",
          icon: <FileCode className="h-4 w-4" />,
          type: 'locked-item',
          unlockedBy: 'router-config'
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
      locked: false,
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
          id: 'firewall-terminal', 
          name: 'Terminal du pare-feu', 
          x: 450, 
          y: 250, 
          width: 80, 
          height: 60,
          description: "Le terminal de configuration du pare-feu a été verrouillé par l'attaquant. Vous devez entrer la commande de réinitialisation d'urgence pour reprendre le contrôle.",
          icon: <Shield className="h-4 w-4" />,
          type: 'puzzle',
          puzzleId: 'firewall-override'
        },
        { 
          id: 'master-key', 
          name: 'Clé maîtresse', 
          x: 550, 
          y: 220, 
          width: 50, 
          height: 40,
          description: "Une clé maîtresse numérique qui peut déverrouiller les systèmes hautement sécurisés, y compris le coffre-fort numérique du laboratoire forensique.",
          icon: <Key className="h-4 w-4" />,
          type: 'locked-item',
          unlockedBy: 'firewall-override'
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
          type: 'locked-transition',
          target: 'forensic',
          requiredItem: 'master-key',
          lockedMessage: "La porte du laboratoire forensique est sécurisée et nécessite une clé maîtresse spéciale."
        }
      ]
    },
    forensic: {
      name: 'Laboratoire Forensique',
      background: 'forensic-bg',
      locked: true,
      requiredItem: 'master-key',
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
          id: 'vault-terminal', 
          name: 'Coffre-fort numérique', 
          x: 400, 
          y: 250, 
          width: 90, 
          height: 70,
          description: "Un coffre-fort numérique contenant les données les plus sensibles de l'entreprise. Il demande un mot de passe complexe.",
          icon: <Lock className="h-4 w-4" />,
          type: 'puzzle',
          puzzleId: 'secure-vault-access'
        },
        { 
          id: 'encrypted-files', 
          name: 'Fichiers chiffrés récupérés', 
          x: 550, 
          y: 230, 
          width: 70, 
          height: 50,
          description: "Les fichiers chiffrés que l'attaquant a tenté d'exfiltrer. Ils contiennent des informations sensibles sur les clients et les projets confidentiels de l'entreprise.",
          icon: <Database className="h-4 w-4" />,
          type: 'locked-item',
          unlockedBy: 'secure-vault-access'
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

  // État local pour les éléments déverrouillés
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  
  // Fonction pour débloquer un élément
  const unlockItem = (itemId: string) => {
    setUnlockedItems(prev => [...prev, itemId]);
  };

  // Fonctions pour les actions dans le jeu
  const handleHotspotClick = (hotspot: any) => {
    // Vérifier d'abord si le hotspot est verrouillé
    if (hotspot.type === 'locked-transition') {
      if (inventory.some(item => item.id === hotspot.requiredItem)) {
        changeScene(hotspot.target);
      } else {
        // Afficher un message d'erreur indiquant que l'élément requis est nécessaire
        alert(hotspot.lockedMessage);
      }
      return;
    }

    if (hotspot.type === 'locked-item') {
      if (unlockedItems.includes(hotspot.unlockedBy)) {
        addToInventory({
          id: hotspot.id,
          name: hotspot.name,
          description: hotspot.description,
          icon: hotspot.icon
        });
      } else {
        alert("Cet élément est verrouillé. Vous devez d'abord résoudre l'énigme associée.");
      }
      return;
    }

    if (hotspot.type === 'puzzle') {
      const puzzle = puzzles[hotspot.puzzleId];
      if (puzzle.type === 'password') {
        openPasswordDialog(puzzle);
      } else if (puzzle.type === 'terminal') {
        openTerminalDialog(puzzle);
      }
      return;
    }

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

  // Vérifie si une scène est accessible
  const canAccessScene = (sceneName: string) => {
    const scene = scenes[sceneName as keyof typeof scenes];
    if (!scene.locked) return true;
    
    // Vérifier si la scène a un élément requis et si l'inventaire contient cet élément
    const requiredItem = (scene as any).requiredItem;
    if (requiredItem) {
      return inventory.some(item => item.id === requiredItem);
    }
    
    return true;
  };

  useEffect(() => {
    if (!gameRef.current) return;

    // Destruction de l'instance précédente si elle existe
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }

    // Vérification d'accès à la scène
    if (!canAccessScene(currentScene)) {
      // Rediriger vers une scène accessible si la scène actuelle ne l'est pas
      changeScene('office');
      return;
    }

    // Configuration du jeu Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: 500,
      backgroundColor: '#1a1a1a',
      scene: {
        preload: function(this: Phaser.Scene) {
          // Chargement des images de fond
          this.load.image('office-bg', officeBgSvg);
          this.load.image('server-bg', serverRoomSvg);
          this.load.image('security-bg', securityRoomSvg);
          this.load.image('forensic-bg', forensicLabSvg);
          
          // Chargement des items interactifs
          this.load.image('post-it', postItSvg);
          this.load.image('security-badge', securityBadgeSvg);
          this.load.image('master-key', masterKeySvg);
          
          // Chargement des objets d'interaction
          this.load.image('door', doorSvg);
          this.load.image('computer', computerSvg);
          this.load.image('terminal', terminalSvg);
        },
        create: function(this: Phaser.Scene) {
          // Récupérer les données de la scène actuelle
          const currentSceneData = scenes[currentScene as keyof typeof scenes];
          
          // Ajouter le fond correspondant à la scène actuelle
          const bgKey = currentSceneData.background;
          this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, bgKey)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setOrigin(0.5);
          
          // Titre de la scène
          const sceneTitle = this.add.text(
            20, 
            20, 
            currentSceneData.name, 
            { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }
          );
          
          // Instruction
          const instruction = this.add.text(
            20, 
            this.cameras.main.height - 40, 
            'Cliquez sur les éléments pour interagir', 
            { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 2 }
          );
          
          // Ajout des hotspots
          currentSceneData.hotspots.forEach((hotspot) => {
            const isCollected = inventory.some(item => item.id === hotspot.id);
            
            // Utiliser le typage approprié pour vérifier les propriétés requiredItem et unlockedBy
            const isLocked = 
              (hotspot.type === 'locked-item' && 
                !unlockedItems.includes((hotspot as any).unlockedBy || '')) ||
              (hotspot.type === 'locked-transition' && 
                !inventory.some(item => item.id === (hotspot as any).requiredItem));
            
            // Créer un visuel pour le hotspot
            let visual;
            
            // Choisir une image en fonction du type d'objet ou du type de hotspot
            if (hotspot.id === 'note') {
              visual = this.add.image(hotspot.x, hotspot.y, 'post-it')
                .setDisplaySize(hotspot.width, hotspot.height);
            } else if (hotspot.id === 'security-badge') {
              visual = this.add.image(hotspot.x, hotspot.y, 'security-badge')
                .setDisplaySize(hotspot.width, hotspot.height * 1.5);
            } else if (hotspot.id === 'master-key') {
              visual = this.add.image(hotspot.x, hotspot.y, 'master-key')
                .setDisplaySize(hotspot.width, hotspot.height);
            } else if (hotspot.id === 'laptop' || hotspot.id === 'server-rack' || hotspot.id === 'vault-terminal') {
              // Utiliser l'image de l'ordinateur pour les interactions d'ordinateur
              visual = this.add.image(hotspot.x, hotspot.y, 'computer')
                .setDisplaySize(hotspot.width * 1.2, hotspot.height);
            } else if (hotspot.id === 'firewall-terminal' || hotspot.id === 'logs') {
              // Utiliser l'image du terminal pour les interactions de terminal
              visual = this.add.image(hotspot.x, hotspot.y, 'terminal')
                .setDisplaySize(hotspot.width * 1.2, hotspot.height);
            } else if (hotspot.type === 'transition' || hotspot.type === 'locked-transition') {
              // Utiliser l'image de porte pour les transitions
              visual = this.add.image(hotspot.x, hotspot.y + 20, 'door')
                .setDisplaySize(hotspot.width, hotspot.height * 1.2);
            } else {
              // Rectangle pour visualiser les hotspots sans image spécifique
              visual = this.add.rectangle(
                hotspot.x, 
                hotspot.y, 
                hotspot.width, 
                hotspot.height, 
                isLocked ? 0xaa3333 : hotspot.type === 'puzzle' ? 0xaa8800 : 0x5d8aa8,
                isCollected ? 0.2 : isLocked ? 0.6 : 0.8
              );
            }
            
            // Ajouter un effet de surbrillance pour indiquer l'interactivité
            const hitArea = this.add.rectangle(
              hotspot.x, 
              hotspot.y, 
              hotspot.width + 10, 
              hotspot.height + 10, 
              0xffffff, 
              0
            );
            
            // Texte du hotspot avec icône appropriée
            let prefix = '';
            if (isLocked) prefix = '🔒 ';
            else if (hotspot.type === 'transition' || hotspot.type === 'locked-transition') prefix = '➔ ';
            else if (hotspot.type === 'puzzle') prefix = '🔍 ';
            else if (isCollected) prefix = '✓ ';
            
            // Ajouter un décalage au texte en fonction du type d'élément pour qu'il apparaisse sous l'image
            let textY = hotspot.y + 20;
            
            if (hotspot.id === 'security-badge') {
              textY = hotspot.y + 30;
            } else if (hotspot.type === 'transition' || hotspot.type === 'locked-transition') {
              textY = hotspot.y + 80; // Pour les portes, placer le texte plus bas
            } else if (hotspot.id === 'laptop' || hotspot.id === 'server-rack' || hotspot.id === 'vault-terminal' || 
                      hotspot.id === 'firewall-terminal' || hotspot.id === 'logs') {
              textY = hotspot.y + 40; // Pour les ordinateurs et terminaux
            }
            
            const text = this.add.text(
              hotspot.x, 
              textY, 
              prefix + hotspot.name, 
              { 
                fontFamily: 'Arial', 
                fontSize: '14px', 
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
              }
            );
            text.setOrigin(0.5);
            
            // Rendre le hitArea interactif pour avoir une zone de clic plus grande
            hitArea.setInteractive();
            
            // Ne pas permettre de recollectionner un élément déjà dans l'inventaire
            if (!(isCollected && (hotspot.type === 'item' || hotspot.type === 'locked-item'))) {
              hitArea.on('pointerdown', () => {
                handleHotspotClick(hotspot);
              });
              
              // Effets au survol
              hitArea.on('pointerover', () => {
                if (visual.setAlpha) visual.setAlpha(1);
                text.setScale(1.1);
                document.body.style.cursor = 'pointer';
              });
              
              hitArea.on('pointerout', () => {
                if (visual.setAlpha) {
                  visual.setAlpha(isCollected ? 0.6 : isLocked ? 0.7 : 0.9);
                }
                text.setScale(1);
                document.body.style.cursor = 'default';
              });
              
              // Définir l'opacité initiale
              if (visual.setAlpha) {
                visual.setAlpha(isCollected ? 0.6 : isLocked ? 0.7 : 0.9);
              }
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
  }, [currentScene, inventory, changeScene, addToInventory, unlockedItems]);

  // Exposer la fonction pour déverrouiller les éléments
  React.useEffect(() => {
    // Ajouter la fonction au contexte global via window
    (window as any).unlockGameItem = unlockItem;
    
    return () => {
      // Nettoyer la référence à la fonction lors du démontage
      delete (window as any).unlockGameItem;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={gameRef} className="w-full h-full" />
    </div>
  );
};