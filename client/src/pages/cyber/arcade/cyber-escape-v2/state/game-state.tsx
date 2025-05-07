import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  GameState, 
  GameStatus, 
  CommandType, 
  CommandResult, 
  Room, 
  GameStage,
  InventoryItem,
  Medal
} from '../types/game';
import { initialRooms } from './rooms-data';
import { initialItems } from './items-data';

// État initial du jeu
const initialGameState: GameState = {
  status: 'initial',
  timeRemaining: 900, // 15 minutes
  currentStage: 0,
  currentRoomId: null,
  currentRoom: null,
  inventory: {},
  rooms: {},
  messages: [],
  success: false,
  medal: 'aucune',
  quizScore: 0
};

// Hook personnalisé pour gérer l'état du jeu
export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({...initialGameState});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Référence pour garder la dernière version de l'état du jeu
  // Utile pour les callbacks dans les setInterval
  const gameStateRef = useRef<GameState>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialiser l'inventaire de base
  useEffect(() => {
    if (gameState.status === 'running' && Object.keys(gameState.inventory).length === 0) {
      const startingInventory: Record<string, InventoryItem> = {};
      
      // Ajouter les items de départ
      startingInventory['decrypt_device'] = initialItems['decrypt_device'];
      startingInventory['rfid_reader'] = initialItems['rfid_reader'];
      
      setGameState(prev => ({
        ...prev,
        inventory: startingInventory
      }));
    }
  }, [gameState.status]);

  // Fonction pour formater les messages avec des couleurs et styles
  const formatMessage = useCallback((message: string): string => {
    // Remplacer les patterns de texte pour ajouter des couleurs et des styles
    return message
      // Remplacer les titres entre [[ ]] par du texte mis en évidence
      .replace(/\[\[(.*?)\]\]/g, '<span class="text-yellow-300 font-bold">$1</span>')
      // Remplacer les items entre {{ }} par du texte en vert
      .replace(/\{\{(.*?)\}\}/g, '<span class="text-green-500">$1</span>')
      // Remplacer les alertes entre !! !! par du texte en rouge
      .replace(/!!(.*?)!!/g, '<span class="text-red-500 font-bold">$1</span>')
      // Remplacer les instructions entre ** ** par du texte en cyan
      .replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400">$1</span>')
      // Remplacer les PNJs entre (( )) par du texte en violet
      .replace(/\(\((.*?)\)\)/g, '<span class="text-purple-400">$1</span>')
      // Remplacer les commandes entre ` ` par du texte stylisé comme code
      .replace(/\`(.*?)\`/g, '<code class="bg-gray-800 px-1 rounded text-white">$1</code>');
  }, []);

  // Fonction pour ajouter un message au terminal
  const addMessage = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  // Démarrer une nouvelle partie
  const startGame = useCallback(() => {
    // Réinitialiser l'état complet du jeu
    setGameState({
      ...initialGameState,
      status: 'running',
      timeRemaining: 900,
      rooms: JSON.parse(JSON.stringify(initialRooms)), // Copie profonde
      currentRoomId: 'vestibule',
      currentRoom: initialRooms['vestibule'],
      currentStage: 1,
      messages: [
        "[[SYSTÈME]]: Initialisation du terminal sécurisé...",
        "[[SYSTÈME]]: Connexion établie. Bienvenue agent.",
        "[[SYSTÈME]]: Vous avez **15 minutes** pour compléter cette mission.",
        "",
        "Vous entrez dans le {{Vestibule Phish-Alert}}. La première étape de votre mission commence ici.",
        "Utilisez la commande `regarder` pour observer la salle et `inventaire` pour vérifier votre équipement initial."
      ]
    });

    // Démarrer le timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        // Si le temps est écoulé, terminer le jeu
        if (prev.timeRemaining <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return {
            ...prev,
            status: 'completed',
            timeRemaining: 0,
            success: false,
            failReason: "Temps écoulé"
          };
        }
        
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Déplacer le joueur vers une autre salle
  const moveToRoom = useCallback((roomId: string) => {
    setGameState(prev => {
      const targetRoom = prev.rooms[roomId];
      if (!targetRoom) return prev;

      // Marquer la salle comme visitée
      const updatedRooms = {
        ...prev.rooms,
        [roomId]: {
          ...targetRoom,
          visited: true
        }
      };

      // Si c'est une nouvelle étape, mettre à jour la progression
      const newStage = targetRoom.stage > prev.currentStage ? targetRoom.stage : prev.currentStage;

      return {
        ...prev,
        currentRoomId: roomId,
        currentRoom: targetRoom,
        currentStage: newStage,
        rooms: updatedRooms
      };
    });

    // Ajouter un message indiquant l'arrivée dans la nouvelle salle
    const room = gameStateRef.current.rooms[roomId];
    addMessage(`Vous entrez dans {{${room.name}}}. ${room.description}`);
  }, [addMessage]);

  // Fonction pour obtenir un item
  const addItemToInventory = useCallback((itemId: string) => {
    const item = initialItems[itemId];
    if (!item) return;

    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: item
      }
    }));

    addMessage(`Vous obtenez un nouvel objet: {{${item.name}}}`);
    toast({
      title: "Nouvel objet obtenu",
      description: item.name,
    });
  }, [addMessage, toast]);

  // Fonction pour supprimer un item de l'inventaire
  const removeItemFromInventory = useCallback((itemId: string) => {
    setGameState(prev => {
      const updatedInventory = {...prev.inventory};
      delete updatedInventory[itemId];
      
      return {
        ...prev,
        inventory: updatedInventory
      };
    });
  }, []);

  // Fonction pour ajuster le temps restant
  const updateTimer = useCallback((seconds: number) => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds)
    }));

    // Afficher un toast selon si c'est un bonus ou une pénalité
    if (seconds > 0) {
      toast({
        title: "Bonus de temps",
        description: `+${seconds} secondes`,
        variant: "default",
      });
      addMessage(`!!TEMPS!! : Vous gagnez **${seconds} secondes**`);
    } else if (seconds < 0) {
      toast({
        title: "Pénalité de temps",
        description: `${seconds} secondes`,
        variant: "destructive",
      });
      addMessage(`!!TEMPS!! : Vous perdez **${Math.abs(seconds)} secondes**`);
    }
  }, [addMessage, toast]);

  // Terminer le jeu
  const endGame = useCallback((success: boolean, quizScore: number = 0) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Déterminer la médaille obtenue
    let medal: Medal = 'aucune';
    
    if (success) {
      if (gameStateRef.current.timeRemaining >= 120 && quizScore >= 7) {
        medal = 'or';
      } else if (gameStateRef.current.timeRemaining >= 30 && quizScore >= 6) {
        medal = 'argent';
      } else if (gameStateRef.current.timeRemaining >= 1 && quizScore >= 5) {
        medal = 'bronze';
      }
    }

    setGameState(prev => ({
      ...prev,
      status: 'completed',
      success,
      medal,
      quizScore
    }));
  }, []);

  // Fonction pour exécuter un défi de la salle actuelle
  const executeChallenge = useCallback((command: string, args: string[]) => {
    const currentRoom = gameStateRef.current.currentRoom;
    if (!currentRoom || !currentRoom.challenge) return;

    const challenge = currentRoom.challenge;
    
    // Pour le moment, implementation basique des défis
    // À compléter selon les types spécifiques
    if (challenge.type === 'email' && command === 'flag') {
      if (args.length === 2) {
        const emailId = args[0];
        const flag = args[1]; // 'spam' ou 'safe'
        
        // Logique pour le défi de phishing
        if (challenge.emails) {
          const email = challenge.emails.find(e => e.id === emailId);
          if (email) {
            const isCorrect = (flag === 'spam' && email.isPhishing) || 
                             (flag === 'safe' && !email.isPhishing);
            
            if (isCorrect) {
              updateTimer(challenge.timeBonus / challenge.emails.length);
              return {
                success: true,
                message: `Email correctement identifié comme ${flag}!`,
              };
            } else {
              updateTimer(-challenge.timePenalty / challenge.emails.length);
              return {
                success: false,
                message: `!!ERREUR!! : Email mal identifié!`,
              };
            }
          }
        }
      }
    }
    
    // Implémentation générique à enrichir
    return {
      success: false,
      message: "Cette action n'est pas disponible pour ce défi."
    };
  }, [updateTimer]);

  // Fonction principale pour exécuter une commande
  const executeCommand = useCallback((commandInput: string) => {
    // Découpage de la commande en parties
    const parts = commandInput.trim().toLowerCase().split(' ');
    const command = parts[0] as CommandType;
    const args = parts.slice(1);

    // Ajouter la commande aux messages (préfixée)
    addMessage(`$ ${commandInput}`);

    // Traiter chaque type de commande
    let result: CommandResult | undefined;

    switch (command) {
      case 'regarder':
        // Afficher la description de la salle actuelle
        if (gameState.currentRoom) {
          const room = gameState.currentRoom;
          let description = `Vous êtes dans {{${room.name}}}.\n${room.description}\n`;
          
          // Ajouter les sorties disponibles
          if (room.exits.length > 0) {
            description += "\nSorties:";
            room.exits.forEach(exit => {
              description += `\n- ${exit.direction.toUpperCase()}${exit.locked ? " (verrouillée)" : ""}`;
            });
          }
          
          // Ajouter les PNJ présents
          if (room.npcs.length > 0) {
            description += "\n\nPersonnages présents:";
            room.npcs.forEach(npc => {
              description += `\n- ((${npc.name})) - ${npc.description}`;
            });
          }
          
          // Ajouter les objets visibles
          if (room.items && room.items.length > 0) {
            description += "\n\nObjets visibles:";
            room.items.forEach(item => {
              description += `\n- {{${item.name}}}`;
            });
          }
          
          result = {
            success: true,
            message: description
          };
        } else {
          result = {
            success: false,
            message: "Vous ne pouvez pas observer votre environnement actuellement."
          };
        }
        break;
        
      case 'aller':
        // Vérifier si une direction est spécifiée
        if (args.length === 0) {
          result = {
            success: false,
            message: "Vous devez spécifier une direction (nord, sud, est, ouest)."
          };
          break;
        }
        
        const direction = args[0];
        
        // Vérifier si la direction est valide
        if (!['nord', 'sud', 'est', 'ouest'].includes(direction)) {
          result = {
            success: false,
            message: "Direction invalide. Utilisez nord, sud, est ou ouest."
          };
          break;
        }
        
        // Vérifier si la sortie existe
        if (gameState.currentRoom) {
          const exit = gameState.currentRoom.exits.find(e => e.direction === direction);
          
          if (!exit) {
            result = {
              success: false,
              message: `Il n'y a pas de sortie dans cette direction.`
            };
          } else if (exit.locked) {
            result = {
              success: false,
              message: `Cette porte est verrouillée. ${exit.description || "Vous avez besoin d'une clé."}`
            };
          } else {
            moveToRoom(exit.targetRoomId);
            result = {
              success: true,
              message: `Vous vous déplacez vers ${direction}.`
            };
          }
        } else {
          result = {
            success: false,
            message: "Vous ne pouvez pas vous déplacer actuellement."
          };
        }
        break;
        
      case 'inventaire':
        // Afficher le contenu de l'inventaire
        const items = Object.values(gameState.inventory);
        if (items.length > 0) {
          let inventoryText = "[[INVENTAIRE]]:";
          items.forEach(item => {
            inventoryText += `\n- {{${item.name}}} - ${item.description}`;
          });
          result = {
            success: true,
            message: inventoryText
          };
        } else {
          result = {
            success: true,
            message: "Votre inventaire est vide."
          };
        }
        break;
        
      case 'utiliser':
        // Vérifier si un objet est spécifié
        if (args.length === 0) {
          result = {
            success: false,
            message: "Vous devez spécifier un objet à utiliser."
          };
          break;
        }
        
        const itemId = args[0];
        const target = args.length > 1 ? args.slice(1).join(' ') : null;
        
        // Vérifier si l'objet est dans l'inventaire
        if (!gameState.inventory[itemId]) {
          result = {
            success: false,
            message: "Vous n'avez pas cet objet dans votre inventaire."
          };
          break;
        }
        
        const item = gameState.inventory[itemId];
        
        // Vérifier si l'objet est utilisable
        if (!item.usable) {
          result = {
            success: false,
            message: `Vous ne pouvez pas utiliser ${item.name} de cette façon.`
          };
          break;
        }
        
        // Logique spécifique selon l'objet
        if (itemId === 'decrypt_device') {
          // Logique pour le décrypteur
          result = {
            success: true,
            message: `Vous utilisez le {{${item.name}}}. Il est prêt à déchiffrer des données.`
          };
        } else if (itemId === 'rfid_reader') {
          // Logique pour le lecteur RFID
          result = {
            success: true,
            message: `Vous activez le {{${item.name}}}. Il est prêt à scanner des badges.`
          };
        } else {
          // Logique générique pour les autres objets
          result = {
            success: true,
            message: `Vous utilisez {{${item.name}}}.`
          };
        }
        
        // Si l'objet est consommé lors de l'utilisation
        if (item.consumed) {
          removeItemFromInventory(itemId);
          result.message += " L'objet a été consommé.";
        }
        break;
        
      case 'parler':
        // Vérifier si un PNJ est spécifié
        if (args.length === 0) {
          result = {
            success: false,
            message: "Vous devez spécifier à qui vous souhaitez parler."
          };
          break;
        }
        
        const npcId = args[0];
        
        // Vérifier si le PNJ est présent dans la salle
        if (gameState.currentRoom) {
          const npc = gameState.currentRoom.npcs.find(n => n.id === npcId);
          
          if (!npc) {
            result = {
              success: false,
              message: "Cette personne n'est pas présente ici."
            };
          } else {
            // Afficher le dialogue initial du PNJ
            result = {
              success: true,
              message: `((${npc.name})): "${npc.dialogue.greeting}"\n\nOptions de réponse:`
            };
            
            // Afficher les options de dialogue
            npc.dialogue.options.forEach((option, index) => {
              result!.message += `\n${index + 1}. ${option.text}`;
            });
            
            // Instruction pour répondre
            result.message += "\n\nUtilisez `parler ${npcId} <numéro>` pour répondre.";
          }
        } else {
          result = {
            success: false,
            message: "Vous ne pouvez pas parler à quelqu'un actuellement."
          };
        }
        break;
        
      // Commandes spéciales pour les défis
      case 'flag':
      case 'scanner':
      case 'patch':
      case 'rechercher':
      case 'report':
        result = executeChallenge(command, args);
        break;
        
      case 'answer':
        // Logique pour répondre aux QCM
        if (args.length === 0) {
          result = {
            success: false,
            message: "Vous devez spécifier une réponse (A, B, C ou D)."
          };
          break;
        }
        
        const answer = args[0].toUpperCase();
        
        // Vérifier si la réponse est valide
        if (!['A', 'B', 'C', 'D'].includes(answer)) {
          result = {
            success: false,
            message: "Réponse invalide. Utilisez A, B, C ou D."
          };
          break;
        }
        
        // Vérifier si on est sur un défi de type quiz
        if (gameState.currentRoom?.challenge?.type === 'quiz') {
          // Implémenter la logique de réponse au quiz ici
          result = {
            success: true,
            message: `Vous avez répondu ${answer}. Traitant...`
          };
        } else {
          result = {
            success: false,
            message: "Il n'y a pas de question à laquelle répondre actuellement."
          };
        }
        break;
        
      case 'déverrouiller':
        // Vérifier si une porte est spécifiée
        if (args.length === 0) {
          result = {
            success: false,
            message: "Vous devez spécifier une direction (nord, sud, est, ouest)."
          };
          break;
        }
        
        const doorDirection = args[0];
        let keyItemId: string | undefined = undefined;
        
        // Vérifier si une clé est spécifiée
        if (args.length > 2 && args[1] === 'avec') {
          keyItemId = args[2];
        }
        
        // Vérifier si la direction est valide
        if (!['nord', 'sud', 'est', 'ouest'].includes(doorDirection)) {
          result = {
            success: false,
            message: "Direction invalide. Utilisez nord, sud, est ou ouest."
          };
          break;
        }
        
        // Vérifier si la porte existe et est verrouillée
        if (gameState.currentRoom) {
          const door = gameState.currentRoom.exits.find(e => e.direction === doorDirection);
          
          if (!door) {
            result = {
              success: false,
              message: "Il n'y a pas de porte dans cette direction."
            };
          } else if (!door.locked) {
            result = {
              success: false,
              message: "Cette porte n'est pas verrouillée."
            };
          } else if (door.keyId && (!keyItemId || !gameState.inventory[keyItemId])) {
            result = {
              success: false,
              message: `Vous avez besoin d'une clé spécifique pour déverrouiller cette porte.`
            };
          } else if (door.keyId && keyItemId && door.keyId !== keyItemId) {
            result = {
              success: false,
              message: `Cette clé ne fonctionne pas pour cette porte.`
            };
          } else {
            // Déverrouiller la porte
            setGameState(prev => {
              const updatedRooms = {...prev.rooms};
              const updatedRoom = {...prev.currentRoom!};
              const updatedExits = [...updatedRoom.exits];
              
              const exitIndex = updatedExits.findIndex(e => e.direction === doorDirection);
              updatedExits[exitIndex] = {...updatedExits[exitIndex], locked: false};
              
              updatedRoom.exits = updatedExits;
              updatedRooms[prev.currentRoomId!] = updatedRoom;
              
              return {
                ...prev,
                rooms: updatedRooms,
                currentRoom: updatedRoom
              };
            });
            
            result = {
              success: true,
              message: `Vous avez déverrouillé la porte ${doorDirection}.`
            };
          }
        } else {
          result = {
            success: false,
            message: "Vous ne pouvez pas déverrouiller de porte actuellement."
          };
        }
        break;
        
      default:
        result = {
          success: false,
          message: `Commande '${command}' non reconnue. Utilisez 'aller', 'regarder', 'parler', 'utiliser', 'déverrouiller', 'answer' ou 'inventaire'.`
        };
    }

    // Si la commande a généré un résultat, l'afficher
    if (result) {
      addMessage(result.message);
      
      // Appliquer les effets de la commande
      if (result.timeBonus) {
        updateTimer(result.timeBonus);
      }
      
      if (result.timePenalty) {
        updateTimer(-result.timePenalty);
      }
      
      if (result.giveItem) {
        addItemToInventory(result.giveItem);
      }
      
      if (result.removeItem) {
        removeItemFromInventory(result.removeItem);
      }
      
      if (result.unlockRoom) {
        moveToRoom(result.unlockRoom);
      }
    }
  }, [
    gameState.currentRoom, 
    gameState.inventory, 
    addMessage, 
    moveToRoom, 
    updateTimer, 
    addItemToInventory, 
    removeItemFromInventory,
    executeChallenge
  ]);

  // Nettoyer les timers lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    timeRemaining: gameState.timeRemaining,
    currentStage: gameState.currentStage,
    inventory: gameState.inventory,
    startGame,
    executeCommand,
    formatMessage
  };
};

// Pour le moment, les données de salles et d'items sont exportées à partir de fichiers séparés
// Ces exports seront remplacés quand les fichiers seront créés