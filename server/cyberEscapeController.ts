import { Request, Response } from 'express';
import axios from 'axios';

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

interface PuzzleRequest {
  puzzleId: string;
  proposedSolution: string;
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

Fournir une brève introduction de 3-5 phrases pour la salle dans laquelle le joueur vient d'entrer. Décris l'ambiance, l'environnement et ce que le joueur voit en premier.

Réponds uniquement avec un JSON au format:
{
  "roomDescription": "Description de la salle (3-5 phrases)",
  "availableActions": ["action1", "action2", "action3"],
  "visibleItems": ["item1", "item2"]
}`;

    try {
      // Appel à l'API Azure OpenAI
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const assistantResponse = response.data.choices[0].message.content;
      
      try {
        // Nettoyage de la réponse pour supprimer les délimiteurs markdown
        let cleanedResponse = assistantResponse;
        
        // Supprimer les délimitateurs de code Markdown (```json et ```)
        cleanedResponse = cleanedResponse.replace(/```json\s?/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s?/g, '');
        
        const parsedResponse = JSON.parse(cleanedResponse);
        
        return res.status(200).json({
          response: parsedResponse,
          gameState: updatedGameState
        });
      } catch (parseError: any) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        return res.status(500).json({ 
          error: "Format de réponse invalide",
          details: parseError?.message || "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération de la description de la salle",
        details: error.message
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

    // Mettre à jour le gameState si nécessaire
    const updatedGameState = {
      ...data.gameState
    };

    // Construction du prompt pour GPT - Caractéristiques et backstory plus détaillés pour chaque PNJ
    const npcData = {
      'eddy': {
        name: 'Eddy',
        role: 'Responsable RH',
        traits: ['Stressé', 'Peu technique', 'Craintif'],
        backstory: "Eddy a été embauché il y a 8 ans et n'a jamais été à l'aise avec l'informatique. Récemment, il a reçu une série d'emails de phishing sophistiqués qui semblaient provenir de la DSI. Sa demande récente de formation en cybersécurité a été refusée par manque de budget.",
        secrets: "A récemment cliqué sur une pièce jointe suspecte et l'a signalé au support, mais n'a pas osé en parler à son supérieur.",
        knowledge: ["Processus d'onboarding des nouveaux employés", "Accès aux dossiers du personnel", "Connaissance des conflits interpersonnels"]
      },
      'neil': {
        name: 'Neil',
        role: 'DSI',
        traits: ['Technique', 'Factuel', 'Exigeant', 'Secret'],
        backstory: "Neil dirige le département IT depuis 5 ans. Brillant mais introverti, il a récemment mis en place une nouvelle architecture réseau contre l'avis de l'équipe sécurité. Travaille souvent tard le soir sur des projets personnels non documentés.",
        secrets: "Utilise un VPN non autorisé pour contourner certaines restrictions de sécurité afin d'accélérer les déploiements.",
        knowledge: ["Architecture réseau complète", "Identifiants administrateur", "Historique des incidents de sécurité précédents"]
      },
      'yousra': {
        name: 'Yousra',
        role: 'Technicienne Support',
        traits: ['Compétente', 'Observatrice', 'Calculatrice', 'Ambitieuse'],
        backstory: "Ingénieure brillante mais sous-estimée, Yousra connaît les systèmes mieux que quiconque. Elle a postulé trois fois à des promotions qui ont été attribuées à des collègues moins qualifiés. Elle est la première à remarquer les anomalies système.",
        secrets: "A découvert des accès non autorisés aux serveurs depuis plusieurs semaines mais n'a pas été écoutée quand elle l'a signalé.",
        knowledge: ["Accès aux logs système", "Connaissance des vulnérabilités non documentées", "Communication directe avec les utilisateurs"]
      },
      'guillaume': {
        name: 'Guillaume',
        role: 'Directeur Général',
        traits: ['Autoritaire', 'Impatient', 'Orienté business', 'Politique'],
        backstory: "Ancien consultant en stratégie, Guillaume dirige l'entreprise depuis 3 ans. Sous pression des investisseurs pour réduire les coûts, il a récemment coupé le budget cybersécurité de 30%. Il refuse systématiquement les recommandations de sécurité qui ralentissent l'activité.",
        secrets: "A récemment négocié une fusion confidentielle avec un concurrent, créant une tension sur les systèmes d'information pour l'intégration accélérée des données.",
        knowledge: ["Stratégie globale de l'entreprise", "Contacts influents", "Pouvoir décisionnel sur les budgets d'urgence"]
      },
      'fares': {
        name: 'Farès',
        role: 'Nouvel ingénieur système',
        traits: ['Serviable', 'Évasif', 'Mystérieux', 'Compétent'],
        backstory: "Embauché il y a seulement 3 mois, Farès s'est rapidement fait apprécier en résolvant des problèmes complexes. Son CV mentionne une expérience chez des concurrents, mais les vérifications d'antécédents ont été bâclées dans l'urgence de son recrutement.",
        secrets: "A obtenu des accès privilégiés bien au-delà de son poste en se liant d'amitié avec des administrateurs clés.",
        knowledge: ["Connaissances techniques avancées", "Accès à plusieurs systèmes critiques", "Informations sur les dernières modifications d'infrastructure"]
      }
    };

    const npc = npcData[data.npcId as keyof typeof npcData];
    
    if (!npc) {
      return res.status(400).json({ error: "PNJ non trouvé" });
    }

    // Formater l'historique des conversations
    const conversationHistoryText = data.conversationHistory.map(msg => 
      `${msg.sender === 'player' ? 'Joueur' : msg.sender === 'npc' ? npc.name : 'Système'}: ${msg.content}`
    ).join('\n');

    let systemPrompt = `Tu es ${npc.name}, ${npc.role} dans un jeu d'escape room cybersécurité appelé "Cyber Escape - Le Pare-feu est tombé".
Tu as les traits de personnalité suivants: ${npc.traits.join(', ')}.

Contexte: Un malware a compromis le système de l'entreprise et contourné le pare-feu. Le joueur est le Responsable Sécurité qui doit résoudre cette crise.

Voici l'historique de votre conversation:
${conversationHistoryText}

Le joueur vient de dire: "${data.userInput}"

Réponds de manière cohérente avec ta personnalité. Fournir des indices ou des informations qui aideront le joueur à progresser dans sa mission, mais ne révèle pas tout d'un coup.

Réponds uniquement avec un JSON au format:
{
  "dialogue": "Ta réponse en tant que personnage (1-3 phrases)",
  "newInfo": true/false,
  "revealedClue": "Indice révélé au joueur (s'il y a lieu)"
}`;

    try {
      // Appel à l'API Azure OpenAI
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const assistantResponse = response.data.choices[0].message.content;
      
      try {
        // Nettoyage de la réponse pour supprimer les délimiteurs markdown
        let cleanedResponse = assistantResponse;
        
        // Supprimer les délimitateurs de code Markdown (```json et ```)
        cleanedResponse = cleanedResponse.replace(/```json\s?/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s?/g, '');
        
        const parsedResponse = JSON.parse(cleanedResponse);
        
        // Si un nouvel indice est révélé, ajouter à l'inventaire
        if (parsedResponse.newInfo && parsedResponse.revealedClue) {
          const newItem = {
            id: `clue-${Date.now()}`,
            name: parsedResponse.revealedClue,
            type: 'clue',
            discovered: true
          };
          
          updatedGameState.inventory.push(newItem);
          updatedGameState.events.push(`Indice obtenu: ${parsedResponse.revealedClue}`);
        }
        
        return res.status(200).json({
          response: parsedResponse,
          gameState: updatedGameState
        });
      } catch (parseError: any) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        return res.status(500).json({ 
          error: "Format de réponse invalide",
          details: parseError?.message || "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération de la réponse du PNJ",
        details: error.message
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
Type: ${data.item.type}
Nom: ${data.item.name}

Génère une description détaillée de cet objet et comment il pourrait aider dans la résolution du jeu d'escape room.

Réponds uniquement avec un JSON au format:
{
  "description": "Description détaillée de l'objet",
  "useHint": "Indice sur la façon d'utiliser l'objet",
  "relatedPuzzle": "Puzzle auquel cet objet pourrait être lié (si applicable)"
}`;

    try {
      // Appel à l'API Azure OpenAI
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const assistantResponse = response.data.choices[0].message.content;
      
      try {
        // Nettoyage de la réponse pour supprimer les délimiteurs markdown
        let cleanedResponse = assistantResponse;
        
        // Supprimer les délimitateurs de code Markdown (```json et ```)
        cleanedResponse = cleanedResponse.replace(/```json\s?/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s?/g, '');
        
        const parsedResponse = JSON.parse(cleanedResponse);
        
        return res.status(200).json({
          response: parsedResponse,
          gameState: data.gameState
        });
      } catch (parseError: any) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        return res.status(500).json({ 
          error: "Format de réponse invalide",
          details: parseError?.message || "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération de la description de l'objet",
        details: error.message
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
    const data: PuzzleRequest = req.body;

    if (!data.puzzleId || !data.proposedSolution || !data.gameState) {
      return res.status(400).json({ 
        error: "Données manquantes pour la résolution du puzzle" 
      });
    }

    // Définir les puzzles et leurs solutions dynamiques
    // Les puzzles sont plus contextuels et utilisent des indices distribués dans le jeu
    // Certaines solutions ont plusieurs réponses valides pour plus de réalisme
    const puzzles: Record<string, {
      title: string;
      description: string;
      solution: string[];  // Plusieurs solutions possibles pour certains puzzles
      requiredClues: string[]; // Indices nécessaires pour débloquer la solution complète
      difficulty: number; // 1-5
      hint?: string; // Indice contextuel qui peut aider à la résolution
    }> = {
      'ip-suspecte': {
        title: "Analyse des traces d'intrusion",
        description: "Identifiez le sous-réseau suspect d'où proviennent les connexions non autorisées en analysant les logs",
        solution: ["185.191.127", "185.191", "185.191.127.0/24"], // Accepte plusieurs formats de réponse
        requiredClues: ["Logs de connexion", "Rapports d'accès"],
        difficulty: 3,
        hint: "Cherchez des motifs récurrents dans les adresses IP qui ont tenté d'accéder aux sections sensibles en dehors des heures de bureau"
      },
      'script-powershell': {
        title: "Détection de code malveillant",
        description: "Analysez le script d'automatisation modifié récemment pour identifier le fragment qui établit une connexion externe",
        solution: ["Invoke-WebRequest", "http://updateme.ru", "updateme.ru", "agent.exe"],
        requiredClues: ["Script modifié", "Logs d'activité nocturne"],
        difficulty: 4,
        hint: "Recherchez les commandes qui tentent d'établir des communications externes non autorisées"
      },
      'decode-usb': {
        title: "Déchiffrement de données exfiltrées",
        description: "Décodez les fragments de données encodés en base64 trouvés dans les communications sortantes",
        solution: ["InstanceManager2025", "instance", "InstanceManager"],
        requiredClues: ["Fichier USB crypté", "Clé de déchiffrement"],
        difficulty: 5,
        hint: "La clé de déchiffrement se compose d'éléments trouvés dans différentes salles"
      },
      'ordre-redemarrage': {
        title: "Séquence de restauration sécurisée",
        description: "Établissez la séquence correcte pour redémarrer les systèmes compromis sans risquer de nouvelles intrusions",
        solution: ["firewall,authentication,database,application", "pare-feu,authentification,base de données,application"],
        requiredClues: ["Procédure de récupération", "Rapports d'incidents précédents"],
        difficulty: 4,
        hint: "Considérez les dépendances entre les systèmes et assurez-vous que chaque couche de sécurité est opérationnelle avant d'exposer la suivante"
      },
      'analyse-malware': {
        title: "Isolation du vecteur d'attaque",
        description: "Identifiez la méthode d'infection initiale en analysant les communications réseau suspectes",
        solution: ["phishing", "spear-phishing", "email", "pièce jointe malveillante", "macro excel"],
        requiredClues: ["Emails suspects", "Témoignage personnel"],
        difficulty: 4,
        hint: "Examinez les communications qui ont précédé la première détection de l'intrusion"
      },
      'empreinte-numerique': {
        title: "Identification de la signature de l'attaquant",
        description: "Déterminez le groupe APT (Advanced Persistent Threat) responsable de l'attaque en analysant les IOCs (Indicators of Compromise)",
        solution: ["APT29", "Cozy Bear", "Midnight Blizzard"],
        requiredClues: ["Rapports de renseignement", "Analyse des techniques"],
        difficulty: 5,
        hint: "Les techniques utilisées et le timing de l'attaque correspondent à un acteur étatique connu"
      },
      'mot-passe-final': {
        title: "Authentification à la console principale",
        description: "Reconstruisez le mot de passe administrateur pour accéder au terminal de sécurité principal",
        solution: ["CyB3rP4r3F3u2025!", "CyberPareFeu2025!", "Cyber-Pare-Feu-2025!"],
        requiredClues: ["Fragment de mot de passe 1", "Fragment de mot de passe 2", "Indice de format"],
        difficulty: 5,
        hint: "Le mot de passe combine des éléments de sécurité, une référence au système et l'année en cours"
      }
    };

    const puzzle = puzzles[data.puzzleId];
    
    if (!puzzle) {
      return res.status(400).json({ error: "Puzzle non trouvé" });
    }

    // Vérifier si la solution est correcte en comparant avec toutes les solutions possibles
    const normalizedSolution = data.proposedSolution.trim().toLowerCase();
    
    // La solution est correcte si elle contient l'une des solutions possibles
    // ou si l'une des solutions possibles contient la proposition du joueur
    const isCorrect = puzzle.solution.some(correctSolution => {
      const normalizedCorrectSolution = correctSolution.trim().toLowerCase();
      return normalizedSolution.includes(normalizedCorrectSolution) || 
             normalizedCorrectSolution.includes(normalizedSolution);
    });

    // Mettre à jour le gameState
    const updatedGameState = {
      ...data.gameState
    };

    if (isCorrect && !updatedGameState.puzzlesSolved.includes(data.puzzleId)) {
      // Ajouter le puzzle aux puzzles résolus
      updatedGameState.puzzlesSolved.push(data.puzzleId);
      
      // Attribuer une récompense en fonction de la difficulté
      const reward = puzzle.difficulty * 50; // 50 à 250 crédits selon la difficulté
      updatedGameState.budget += reward;
      
      // Ajouter à l'historique des événements
      updatedGameState.events.push(`Puzzle "${puzzle.title}" résolu! +${reward} crédits`);
      
      // Déverrouiller des salles selon le puzzle résolu
      if (data.puzzleId === 'ip-suspecte' && !updatedGameState.unlockedRooms.includes('support')) {
        updatedGameState.unlockedRooms.push('support');
        updatedGameState.events.push('Nouvelle salle déverrouillée: Support technique');
      }
      
      if (data.puzzleId === 'script-powershell' && !updatedGameState.unlockedRooms.includes('direction')) {
        updatedGameState.unlockedRooms.push('direction');
        updatedGameState.events.push('Nouvelle salle déverrouillée: Bureau Direction');
      }
      
      if (data.puzzleId === 'decode-usb' && !updatedGameState.unlockedRooms.includes('salle-chiffree')) {
        updatedGameState.unlockedRooms.push('salle-chiffree');
        updatedGameState.events.push('Nouvelle salle déverrouillée: Salle sécurisée');
      }
    }

    // Construire le message de feedback basé sur le résultat
    const feedbackPrompt = `
Tu es le narrateur d'un jeu d'escape room cybersécurité. Le joueur a tenté de résoudre le puzzle "${puzzle.title}".
Sa proposition: "${data.proposedSolution}"
Solutions correctes: "${puzzle.solution.join('", "')}"
Résultat: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Génère un message de feedback encourageant qui:
${isCorrect ? 
  "- Félicite le joueur pour sa solution correcte\n- Explique pourquoi c'était la bonne solution\n- Donne un indice pour la suite du jeu" : 
  "- Encourage le joueur à réessayer\n- Donne un indice subtil sans révéler la solution\n- Suggère une approche alternative"}

Le feedback doit être concis (2-3 phrases).`;

    try {
      // Appel à l'API Azure OpenAI pour le feedback
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: feedbackPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const feedback = response.data.choices[0].message.content.trim();
      
      return res.status(200).json({
        isCorrect,
        feedback,
        gameState: updatedGameState
      });
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI pour le feedback:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération du feedback",
        details: error.message,
        isCorrect,
        feedback: isCorrect ? 
          "Félicitations! Votre solution est correcte." : 
          "Votre solution n'est pas correcte. Essayez une approche différente.",
        gameState: updatedGameState
      });
    }
  } catch (error: any) {
    console.error("Erreur dans solvePuzzle:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la résolution du puzzle",
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

    // Construction du prompt pour l'analyse du profil
    const systemPrompt = `Tu es un analyste en cybersécurité qui évalue les performances du joueur dans un escape room cybersécurité.

Voici les données de la session de jeu:
- Temps restant: ${gameState.timeRemaining} minutes
- Budget restant: ${gameState.budget} crédits
- Salles visitées: ${gameState.visitedRooms.join(', ')}
- Énigmes résolues: ${gameState.puzzlesSolved.join(', ')}
- Événements déclenchés: ${gameState.events.join(', ')}

En fonction de ces données, génère une analyse du profil du joueur qui comprend:
1. Un résumé global de sa performance
2. 3-4 points forts identifiés
3. 2-3 axes d'amélioration
4. Un badge de compétence obtenu

Réponds uniquement avec un JSON au format:
{
  "profileTitle": "Titre pour le profil du joueur",
  "profileSummary": "Résumé global de la performance (3-4 phrases)",
  "strengths": ["Force 1", "Force 2", "Force 3", "Force 4"],
  "improvementAreas": ["Axe d'amélioration 1", "Axe d'amélioration 2", "Axe d'amélioration 3"],
  "badge": {
    "title": "Nom du badge obtenu",
    "description": "Description du badge"
  }
}`;

    try {
      // Appel à l'API Azure OpenAI
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const assistantResponse = response.data.choices[0].message.content;
      
      try {
        // Nettoyage de la réponse pour supprimer les délimiteurs markdown
        let cleanedResponse = assistantResponse;
        
        // Supprimer les délimitateurs de code Markdown (```json et ```)
        cleanedResponse = cleanedResponse.replace(/```json\s?/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s?/g, '');
        
        const parsedProfile = JSON.parse(cleanedResponse);
        
        return res.status(200).json(parsedProfile);
      } catch (parseError: any) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        return res.status(500).json({ 
          error: "Format de réponse invalide",
          details: parseError?.message || "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération du profil",
        details: error.message
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
    
    // Configurer les paramètres de jeu en fonction de la difficulté
    let budget, timeRemaining;
    
    switch (difficulty) {
      case 'easy':
        budget = 1200;
        timeRemaining = 60;
        break;
      case 'hard':
        budget = 800;
        timeRemaining = 30;
        break;
      case 'normal':
      default:
        budget = 1000;
        timeRemaining = 45;
        break;
    }
    
    // État initial du jeu
    const gameState = {
      currentRoom: 'hub',
      visitedRooms: ['hub'],
      inventory: [],
      unlockedRooms: ['hub', 'rh', 'it'], // Salles initialement débloquées
      budget,
      timeRemaining,
      events: ['Mission commencée'],
      puzzlesSolved: [],
      difficulty
    };
    
    // Générer le briefing de mission
    const systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité appelé "Cyber Escape - Le Pare-feu est tombé". 
Tu dois générer un briefing de mission pour le joueur qui est un Responsable Sécurité qui doit faire face à une crise: un malware a infiltré le système et contourné le pare-feu.

La difficulté du jeu est: ${difficulty.toUpperCase()}

Génère un briefing de mission engageant qui comprend:
1. Un titre accrocheur
2. Un texte d'introduction de 3-4 phrases qui explique la situation
3. 3-4 objectifs initiaux pour le joueur
4. 2-3 conseils pour réussir la mission

Réponds uniquement avec un JSON au format:
{
  "title": "Titre de la mission",
  "briefing": "Texte d'introduction",
  "initialObjectives": ["Objectif 1", "Objectif 2", "Objectif 3", "Objectif 4"],
  "tips": ["Conseil 1", "Conseil 2", "Conseil 3"]
}`;

    try {
      // Appel à l'API Azure OpenAI
      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
        {
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_KEY
          }
        }
      );

      const assistantResponse = response.data.choices[0].message.content;
      
      try {
        // Nettoyage de la réponse pour supprimer les délimiteurs markdown
        let cleanedResponse = assistantResponse;
        
        // Supprimer les délimitateurs de code Markdown (```json et ```)
        cleanedResponse = cleanedResponse.replace(/```json\s?/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s?/g, '');
        
        const missionBriefing = JSON.parse(cleanedResponse);
        
        return res.status(200).json({
          gameState,
          mission: missionBriefing
        });
      } catch (parseError: any) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        return res.status(500).json({ 
          error: "Format de réponse invalide",
          details: parseError?.message || "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération du briefing de mission",
        details: error.message
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