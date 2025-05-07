import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStage } from '../types/game-enums';
import { Room, getRoomByStage, getRoomById, Exit, NPC, InteractiveObject } from '../data/rooms';

export interface GameStateType {
  status: 'initial' | 'running' | 'completed' | 'failed';
  currentStage: GameStage;
  timeRemaining: number;
  messages: string[];
  currentRoom: Room | null;
  inventory: Record<string, any>;
  success: boolean;
  medal: 'or' | 'argent' | 'bronze' | 'aucune';
  quizScore: number;
  failReason: string;
  challengeActive: boolean;
  activeChallenge: string | null;
}

// Hook personnalisé pour gérer l'état du jeu
export const useGameStateV2 = () => {
  // État du jeu
  const [gameState, setGameState] = useState<GameStateType>({
    status: 'initial',
    currentStage: 0 as GameStage,
    timeRemaining: 900, // 15 minutes en secondes
    messages: [],
    currentRoom: null,
    inventory: {},
    success: false,
    medal: 'aucune',
    quizScore: 0,
    failReason: '',
    challengeActive: false,
    activeChallenge: null
  });

  // Timer pour le décompte
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mémoriser la dernière commande pour éviter les duplications
  const lastCommandRef = useRef<string>('');

  // Démarrer une nouvelle partie
  const startGame = useCallback(() => {
    // Récupérer la première salle (Vestibule)
    const firstRoom = getRoomByStage(GameStage.VESTIBULE);
    
    if (!firstRoom) {
      console.error("Erreur: Première salle non trouvée");
      return;
    }
    
    setGameState({
      status: 'running',
      currentStage: GameStage.VESTIBULE,
      timeRemaining: 900,
      messages: [
        "[[SYSTÈME]]: Initialisation du terminal sécurisé...",
        "[[SYSTÈME]]: Connexion établie. Bienvenue agent.",
        "[[SYSTÈME]]: Vous avez **15 minutes** pour compléter cette mission.",
        "",
        `Vous entrez dans le {{${firstRoom.name}}}. La première étape de votre mission commence ici.`,
        "Utilisez la commande `regarder` pour observer la salle et `inventaire` pour vérifier votre équipement initial."
      ],
      currentRoom: firstRoom,
      inventory: {
        "decrypt_device": {
          id: "decrypt_device",
          name: "Décrypteur portable",
          description: "Un petit appareil high-tech capable de déchiffrer différents types de chiffrements.",
          usable: true
        },
        "rfid_reader": {
          id: "rfid_reader",
          name: "Lecteur RFID",
          description: "Un scanner de badges RFID permettant d'analyser les jetons d'accès numériques.",
          usable: true
        }
      },
      success: false,
      medal: 'aucune',
      quizScore: 0,
      failReason: '',
      challengeActive: false,
      activeChallenge: null
    });
  }, []);

  // Effet pour gérer le timer
  useEffect(() => {
    if (gameState.status === 'running') {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            // Gérer la fin du temps
            return {
              ...prev,
              status: 'failed',
              timeRemaining: 0,
              failReason: 'Temps écoulé'
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.status]);

  // Ajouter ou soustraire du temps (pour les récompenses/pénalités)
  const modifyTime = useCallback((seconds: number) => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds)
    }));
  }, []);

  // Ajouter un message au terminal
  const addMessage = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  // Ajouter un item à l'inventaire
  const addInventoryItem = useCallback((itemId: string, itemData: any) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: itemData
      }
    }));
  }, []);

  // Changer de salle
  const changeRoom = useCallback((roomId: string) => {
    const newRoom = getRoomById(roomId);
    
    if (!newRoom) {
      addMessage("[[ERREUR]]: Impossible de trouver cette salle.");
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      currentRoom: newRoom,
      currentStage: newRoom.stageId,
      messages: [...prev.messages, `Vous êtes entré dans le {{${newRoom.name}}}.`, newRoom.detailedDescription]
    }));
  }, [addMessage]);

  // Traiter un dialogue avec un PNJ
  const talkToNPC = useCallback((npcId: string) => {
    if (!gameState.currentRoom) return;
    
    const npc = gameState.currentRoom.npcs.find(n => n.id === npcId);
    
    if (!npc) {
      addMessage("Ce personnage n'est pas présent dans cette salle.");
      return;
    }
    
    addMessage(`((${npc.name})): "${npc.dialogues.initial}"`);
  }, [gameState.currentRoom, addMessage]);

  // Interagir avec un objet
  const interactWithObject = useCallback((objectId: string) => {
    if (!gameState.currentRoom) return;
    
    const object = gameState.currentRoom.objects.find(o => o.id === objectId);
    
    if (!object) {
      addMessage("Cet objet n'est pas présent dans cette salle.");
      return;
    }
    
    if (object.state === 'disabled') {
      addMessage(`L'objet ${object.name} n'est pas disponible pour le moment.`);
      return;
    }
    
    if (object.requiredItem && !gameState.inventory[object.requiredItem]) {
      addMessage(`Vous avez besoin de ${object.requiredItem} pour interagir avec cet objet.`);
      return;
    }
    
    if (object.interactionResult) {
      addMessage(object.interactionResult);
    }
    
    // Activer un défi si c'est un terminal ou un objet spécial
    if (object.id === 'terminal-central' && gameState.currentRoom.challenge?.type === 'phishing') {
      setGameState(prev => ({
        ...prev,
        challengeActive: true,
        activeChallenge: 'phishing'
      }));
      return;
    }
    
    // Autres logiques spécifiques aux objets
  }, [gameState.currentRoom, gameState.inventory, addMessage]);

  // Essayer de passer par une sortie
  const useExit = useCallback((direction: 'north' | 'south' | 'east' | 'west') => {
    if (!gameState.currentRoom) return;
    
    const exit = gameState.currentRoom.exits.find(e => e.direction === direction);
    
    if (!exit) {
      addMessage(`Il n'y a pas de sortie dans cette direction.`);
      return;
    }
    
    if (exit.status === 'locked') {
      if (!exit.unlockedBy) {
        addMessage(`Cette sortie est verrouillée.`);
        return;
      }
      
      if (!gameState.inventory[exit.unlockedBy]) {
        addMessage(`Cette sortie est verrouillée. Vous avez besoin de ${exit.unlockedBy} pour la déverrouiller.`);
        return;
      }
      
      addMessage(`Vous utilisez ${gameState.inventory[exit.unlockedBy].name} pour déverrouiller la sortie.`);
    }
    
    if (exit.destinationRoomId) {
      changeRoom(exit.destinationRoomId);
    }
  }, [gameState.currentRoom, gameState.inventory, addMessage, changeRoom]);

  // Finaliser un défi
  const completeChallenge = useCallback((success: boolean, challengeType: string) => {
    setGameState(prev => ({
      ...prev,
      challengeActive: false,
      activeChallenge: null
    }));
    
    if (!gameState.currentRoom || !gameState.currentRoom.challenge) return;
    
    if (success) {
      // Activer l'objet de récompense (jeton-clé, etc.)
      const completionItemId = gameState.currentRoom.challenge.completionItem;
      const completionItem = gameState.currentRoom.objects.find(o => o.id === completionItemId);
      
      if (completionItem) {
        // Ajouter l'item à l'inventaire
        addInventoryItem(completionItem.id, {
          id: completionItem.id,
          name: completionItem.name,
          description: completionItem.description,
          usable: true
        });
        
        // Dialogue de succès avec le PNJ si présent
        if (gameState.currentRoom.npcs.length > 0) {
          const mainNPC = gameState.currentRoom.npcs[0];
          if (mainNPC.dialogues.success) {
            addMessage(`((${mainNPC.name})): "${mainNPC.dialogues.success}"`);
          }
        }
        
        // Marquer la salle comme complétée
        // Cette partie nécessite une mise à jour plus complexe de l'état
      }
    } else {
      // Dialogue d'échec avec le PNJ si présent
      if (gameState.currentRoom.npcs.length > 0) {
        const mainNPC = gameState.currentRoom.npcs[0];
        if (mainNPC.dialogues.failure) {
          addMessage(`((${mainNPC.name})): "${mainNPC.dialogues.failure}"`);
        }
      }
    }
  }, [gameState.currentRoom, addMessage, addInventoryItem]);

  // Exécuter une commande
  const executeCommand = useCallback((command: string) => {
    // Éviter les duplications si la même commande est entrée deux fois de suite
    if (command === lastCommandRef.current) {
      return;
    }
    lastCommandRef.current = command;
    
    // Ajouter la commande au terminal
    addMessage(`$ ${command}`);
    
    // Analyser la commande
    const commandLower = command.toLowerCase().trim();
    const args = commandLower.split(' ');
    const action = args[0];
    
    // Traiter différentes commandes
    switch (action) {
      case 'regarder':
        if (!gameState.currentRoom) return;
        addMessage(gameState.currentRoom.detailedDescription);
        
        // Lister les objets et PNJ visibles
        if (gameState.currentRoom.npcs.length > 0) {
          const npcsText = gameState.currentRoom.npcs
            .map(npc => `- {{${npc.name}}} (${npc.role})`)
            .join('\n');
          addMessage(`\nPersonnages présents:\n${npcsText}`);
        }
        
        if (gameState.currentRoom.objects.length > 0) {
          const objectsText = gameState.currentRoom.objects
            .filter(obj => obj.state !== 'disabled')
            .map(obj => `- {{${obj.name}}}: ${obj.description}`)
            .join('\n');
          addMessage(`\nObjets visibles:\n${objectsText}`);
        }
        
        // Décrire les sorties
        const exitsText = gameState.currentRoom.exits
          .filter(exit => exit.status !== 'hidden')
          .map(exit => {
            const status = exit.status === 'locked' ? ' (verrouillée)' : '';
            return `- ${exit.direction.charAt(0).toUpperCase() + exit.direction.slice(1)}${status}`;
          })
          .join('\n');
        addMessage(`\nSorties:\n${exitsText}`);
        break;
        
      case 'inventaire':
        if (Object.keys(gameState.inventory).length === 0) {
          addMessage("Votre inventaire est vide.");
        } else {
          const inventoryText = Object.values(gameState.inventory)
            .map((item: any) => `- {{${item.name}}}: ${item.description}`)
            .join('\n');
          addMessage(`[[INVENTAIRE]]:\n${inventoryText}`);
        }
        break;
        
      case 'utiliser':
        if (args.length < 2) {
          addMessage("Utiliser quoi? Spécifiez un objet de votre inventaire.");
          return;
        }
        
        const itemId = args[1];
        if (gameState.inventory[itemId]) {
          addMessage(`Vous utilisez ${gameState.inventory[itemId].name}.`);
          // Logique spécifique pour utiliser différents items
        } else {
          addMessage("Vous n'avez pas cet objet dans votre inventaire.");
        }
        break;
        
      case 'parler':
        if (args.length < 2) {
          addMessage("Parler à qui? Spécifiez un personnage présent dans la salle.");
          return;
        }
        
        const npcId = args[1];
        talkToNPC(npcId);
        break;
        
      case 'aller':
        if (args.length < 2) {
          addMessage("Aller où? Spécifiez une direction (nord, sud, est, ouest).");
          return;
        }
        
        const direction = args[1] as 'north' | 'south' | 'east' | 'west';
        useExit(direction);
        break;
        
      case 'examiner':
        if (args.length < 2) {
          addMessage("Examiner quoi? Spécifiez un objet présent dans la salle.");
          return;
        }
        
        interactWithObject(args[1]);
        break;
        
      case 'flag':
        if (args.length < 2 || isNaN(parseInt(args[1]))) {
          addMessage("Veuillez spécifier un numéro d'email à marquer, par exemple 'flag 3'.");
          return;
        }
        
        const emailId = parseInt(args[1]);
        addMessage(`Email ${emailId} marqué comme suspect.`);
        // La logique complète sera gérée par le composant PhishingChallenge
        break;
        
      default:
        addMessage("Commande non reconnue. Essayez 'regarder', 'inventaire', 'utiliser <objet>', 'parler <personnage>', 'aller <direction>', ou 'examiner <objet>'.");
    }
  }, [gameState.currentRoom, gameState.inventory, addMessage, talkToNPC, interactWithObject, useExit]);

  // Formatage des messages pour le terminal
  const formatMessage = useCallback((message: string): string => {
    return message
      .replace(/\[\[(.*?)\]\]/g, '<span class="text-yellow-300 font-bold">$1</span>')
      .replace(/\{\{(.*?)\}\}/g, '<span class="text-green-500">$1</span>')
      .replace(/!!(.*?)!!/g, '<span class="text-red-500 font-bold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400">$1</span>')
      .replace(/\(\((.*?)\)\)/g, '<span class="text-purple-400">$1</span>')
      .replace(/\`(.*?)\`/g, '<code class="bg-gray-800 px-1 rounded text-white">$1</code>');
  }, []);

  return {
    gameState,
    startGame,
    executeCommand,
    formatMessage,
    modifyTime,
    completeChallenge
  };
};

export default useGameStateV2;