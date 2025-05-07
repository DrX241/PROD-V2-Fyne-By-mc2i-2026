import { useState, useEffect, useCallback } from 'react';

// État temporaire très simplifié pour rendre l'interface fonctionnelle
// Sera remplacé par un état plus complexe basé sur game-state.tsx plus tard

export const useGameState = () => {
  const [gameStatus, setGameStatus] = useState('initial');
  const [time, setTime] = useState(900); // 15 minutes en secondes
  const [stage, setStage] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [inventory, setInventory] = useState<Record<string, any>>({});

  // Simule le démarrage du jeu
  const startGame = useCallback(() => {
    setGameStatus('running');
    setTime(900);
    setStage(1);
    setMessages([
      "[[SYSTÈME]]: Initialisation du terminal sécurisé...",
      "[[SYSTÈME]]: Connexion établie. Bienvenue agent.",
      "[[SYSTÈME]]: Vous avez **15 minutes** pour compléter cette mission.",
      "",
      "Vous entrez dans le {{Vestibule Phish-Alert}}. La première étape de votre mission commence ici.",
      "Utilisez la commande `regarder` pour observer la salle et `inventaire` pour vérifier votre équipement initial."
    ]);
    setInventory({
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
    });
  }, []);

  // Simule une commande exécutée
  const executeCommand = useCallback((command: string) => {
    setMessages(prev => [...prev, `$ ${command}`]);
    
    if (command === 'regarder') {
      setMessages(prev => [...prev, "Vous observez la salle. Des écrans affichent différents emails, certains semblent légitimes, d'autres sont clairement des tentatives de phishing. Un terminal central attend vos commandes."]);
    } else if (command === 'inventaire') {
      setMessages(prev => [...prev, "[[INVENTAIRE]]: \n- {{Décrypteur portable}} - Un appareil capable de déchiffrer des codes. \n- {{Lecteur RFID}} - Un scanner pour badges et systèmes d'accès."]);
    } else if (command.startsWith('flag')) {
      // Simule le flagging d'un email
      setMessages(prev => [...prev, "Email analysé. Bonne identification ! (+10 secondes)"]);
      setTime(prev => prev + 10);
    } else if (command.startsWith('utiliser')) {
      const item = command.split(' ')[1];
      setMessages(prev => [...prev, `Vous utilisez ${item}. L'objet semble fonctionner correctement.`]);
    } else if (command.startsWith('parler')) {
      setMessages(prev => [...prev, "((Echo)): \"Bienvenue agent. Pour réussir cette mission, vous devrez faire preuve de vigilance et d'expertise en cybersécurité.\""]);
    } else if (command.startsWith('aller')) {
      const direction = command.split(' ')[1];
      if (direction === 'est' && stage === 1) {
        setStage(2);
        setMessages(prev => [...prev, "Vous avancez vers l'est et entrez dans le {{Mur des Révélations}}. Des écrans montrent des flux de données OSINT sur diverses cibles."]);
      } else {
        setMessages(prev => [...prev, "Vous ne pouvez pas aller dans cette direction pour le moment."]);
      }
    } else {
      setMessages(prev => [...prev, "Commande non reconnue. Utilisez 'regarder', 'inventaire', 'utiliser <objet>', 'parler <pnj>', 'aller <direction>'."]);
    }
  }, [stage]);

  // Formatage de messages pour le terminal
  const formatMessage = useCallback((message: string): string => {
    return message
      .replace(/\[\[(.*?)\]\]/g, '<span class="text-yellow-300 font-bold">$1</span>')
      .replace(/\{\{(.*?)\}\}/g, '<span class="text-green-500">$1</span>')
      .replace(/!!(.*?)!!/g, '<span class="text-red-500 font-bold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400">$1</span>')
      .replace(/\(\((.*?)\)\)/g, '<span class="text-purple-400">$1</span>')
      .replace(/\`(.*?)\`/g, '<code class="bg-gray-800 px-1 rounded text-white">$1</code>');
  }, []);

  // Effet pour simuler le décompte du temps
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameStatus === 'running') {
      timer = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setGameStatus('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStatus]);

  // Création d'un état factice qui ressemble à ce qui est attendu par les composants
  const gameState = {
    status: gameStatus,
    messages,
    currentStage: stage,
    timeRemaining: time,
    currentRoom: stage === 1 
      ? { name: "Vestibule Phish-Alert", description: "Salle d'analyse de phishing" }
      : stage === 2
      ? { name: "Mur des Révélations", description: "Centre d'analyse OSINT" }
      : null,
    inventory: inventory,
    success: false,
    medal: 'aucune',
    quizScore: 0,
    failReason: ''
  };

  return {
    gameState,
    timeRemaining: time,
    currentStage: stage,
    inventory,
    startGame,
    executeCommand,
    formatMessage
  };
};

export default useGameState;