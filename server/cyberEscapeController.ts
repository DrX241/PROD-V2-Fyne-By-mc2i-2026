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
    // Base de données des salles pour une cohérence narrative
    const roomDatabase: Record<string, {
      fullName: string;
      description: string;
      environmentalState: string;
      securityLevel: string;
      ambiance: string;
      characters: Array<{id: string, presence: number}>;  // 0-10 chance de présence
      objects: Array<{id: string, isHidden: boolean}>;
      secretDetails?: string;
      dangerLevel: number; // 1-5
      roomSpecificEvents?: string[];
    }> = {
      'hub': {
        fullName: "Centre de commandement",
        description: "Le hub central de l'entreprise, convertit en centre de gestion de crise depuis l'incident. Plusieurs écrans affichent des alertes de sécurité, tandis que des techniciens s'activent sur leurs postes.",
        environmentalState: "L'atmosphère est tendue, renforcée par le bruit des ventilateurs des serveurs d'urgence installés à la hâte. Le système d'éclairage de secours donne une teinte orangée à la pièce.",
        securityLevel: "Niveau de sécurité modéré - badges requis mais plusieurs portes sont maintenues ouvertes pour faciliter les déplacements pendant la crise.",
        ambiance: "Urgence contrôlée, mais la tension monte à mesure que de nouvelles alertes apparaissent sur les écrans.",
        characters: [
          {id: 'eddy', presence: 8},
          {id: 'fares', presence: 5}
        ],
        objects: [
          {id: 'schema-reseau', isHidden: false},
          {id: 'post-it-mdp', isHidden: true}
        ],
        dangerLevel: 2,
        roomSpecificEvents: [
          "Un technicien s'exclame soudain que plusieurs systèmes redémarrent sans autorisation.",
          "Les écrans de surveillance affichent momentanément un message cryptique puis reviennent à la normale."
        ]
      },
      'rh': {
        fullName: "Département des Ressources Humaines",
        description: "Un espace ouvert avec plusieurs bureaux de travail bien organisés. Les dossiers du personnel sont rangés dans des armoires sécurisées, mais certains sont sortis et éparpillés.",
        environmentalState: "La pièce est calme, contrastant avec l'agitation du reste du bâtiment. Plusieurs ordinateurs sont encore allumés, certains même déverrouillés.",
        securityLevel: "Niveau de sécurité faible - des documents confidentiels sont visibles sur les bureaux.",
        ambiance: "Abandon précipité, comme si l'équipe était partie en urgence au milieu d'une tâche.",
        characters: [
          {id: 'eddy', presence: 6}
        ],
        objects: [
          {id: 'emails-phishing', isHidden: false},
          {id: 'badge-acces', isHidden: true}
        ],
        dangerLevel: 1,
        secretDetails: "Un ordinateur déverrouillé montre une liste de nouveaux employés dont les vérifications d'antécédents ont été accélérées, incluant Farès."
      },
      'it': {
        fullName: "Département Informatique",
        description: "La salle serveur principale avec plusieurs racks d'équipements clignotants. Des câbles courent dans tous les sens et plusieurs écrans de diagnostic affichent des graphiques d'activité réseau.",
        environmentalState: "La température est anormalement élevée à cause des ventilateurs défaillants. L'éclairage bleuté des équipements crée une atmosphère technique et froide.",
        securityLevel: "Niveau de sécurité élevé - normalement accessible uniquement avec badge d'accès de niveau 3.",
        ambiance: "Activité frénétique des machines, bourdonnement des ventilateurs, clignotement inquiétant des voyants d'alerte.",
        characters: [
          {id: 'neil', presence: 7},
          {id: 'yousra', presence: 4},
          {id: 'fares', presence: 3}
        ],
        objects: [
          {id: 'laptop-neil', isHidden: false},
          {id: 'serveur-logs', isHidden: false}
        ],
        dangerLevel: 3,
        secretDetails: "Un moniteur isolé affiche une connexion VPN active vers un serveur externe non identifié."
      },
      'support': {
        fullName: "Centre de Support Technique",
        description: "Un open space avec plusieurs postes de travail équipés de casques et de grands écrans. Des tickets d'incident s'accumulent dans la file d'attente affichée sur un grand écran mural.",
        environmentalState: "La pièce est en désordre, avec des gobelets de café renversés et des notes griffonnées à la hâte. Les téléphones sonnent constamment, mais plusieurs restent sans réponse.",
        securityLevel: "Niveau de sécurité moyen - accès contrôlé mais plusieurs écrans montrent des informations système sensibles.",
        ambiance: "Chaos organisé, stress palpable, personnel débordé par les demandes incessantes.",
        characters: [
          {id: 'yousra', presence: 8}
        ],
        objects: [
          {id: 'rapport-threat', isHidden: true}
        ],
        dangerLevel: 2,
        roomSpecificEvents: [
          "Le système téléphonique tombe en panne pendant quelques secondes puis redémarre tout seul.",
          "Un technicien signale que des comptes utilisateurs se connectent et se déconnectent automatiquement."
        ]
      },
      'direction': {
        fullName: "Bureau de la Direction",
        description: "Un bureau spacieux et élégant avec vue panoramique sur la ville. Une grande table de conférence occupe le centre, entourée de chaises en cuir. Un écran tactile de contrôle est intégré au mur.",
        environmentalState: "La pièce est impeccablement rangée à l'exception d'une tasse de café encore chaude et de documents éparpillés sur le bureau principal. Les stores automatiques sont à moitié fermés.",
        securityLevel: "Niveau de sécurité très élevé - normalement accessible uniquement avec autorisation explicite et authentification biométrique.",
        ambiance: "Calme inquiétant, pouvoir et contrôle, sentiment d'être observé.",
        characters: [
          {id: 'guillaume', presence: 6}
        ],
        objects: [
          {id: 'disque-externe', isHidden: true}
        ],
        dangerLevel: 4,
        secretDetails: "Un document partiellement visible sur l'écran du bureau mentionne une fusion confidentielle avec acquisition de propriété intellectuelle sensible."
      },
      'salle-chiffree': {
        fullName: "Centre de Sécurité Renforcée",
        description: "Une petite salle bunkerisée contenant l'infrastructure critique et les systèmes de sauvegarde de l'entreprise. Les murs sont couverts d'écrans de surveillance et de contrôle.",
        environmentalState: "L'air est froid et sec, contrôlé par un système de climatisation dédié. Un bourdonnement grave et constant émane des serveurs sécurisés. L'éclairage est tamisé avec des indicateurs rouges clignotants.",
        securityLevel: "Niveau de sécurité maximal - normalement accessible uniquement en cas d'urgence critique avec validation multi-facteurs.",
        ambiance: "Technologie avancée, puissance contenue, dernier bastion de défense.",
        characters: [
          {id: 'fares', presence: 2}
        ],
        objects: [],
        dangerLevel: 5,
        secretDetails: "Un terminal spécifique affiche un processus d'extraction de données en cours, temporairement suspendu. Une barre de progression indique 87% de complétion."
      }
    };

    // Récupérer les informations de la salle ou générer dynamiquement
    const roomData = roomDatabase[data.room.id] || {
      fullName: data.room.name,
      description: "Une salle fonctionnelle de l'entreprise avec divers équipements informatiques.",
      environmentalState: "L'atmosphère reflète la crise en cours avec une tension palpable.",
      securityLevel: "Niveau de sécurité standard.",
      ambiance: "Mélange d'urgence et de détermination professionnelle.",
      characters: [],
      objects: [],
      dangerLevel: 2
    };

    // Déterminer dynamiquement quels PNJ sont présents selon la probabilité
    const charactersPresent: Array<{id: string, name: string, role: string, shortDescription: string}> = [];
    
    // Base de données des personnages (simplifiée ici, en synchronisation avec npcData plus haut)
    const characterInfo: Record<string, {name: string, role: string, description: string}> = {
      'eddy': {
        name: 'Eddy', 
        role: 'Responsable RH',
        description: 'Visiblement nerveux, il consulte frénétiquement ses emails tout en jetant des regards inquiets vers la porte.'
      },
      'neil': {
        name: 'Neil', 
        role: 'DSI',
        description: 'Concentré sur plusieurs écrans simultanément, il tape rapidement des commandes en ignorant les interruptions.'
      },
      'yousra': {
        name: 'Yousra', 
        role: 'Technicienne Support',
        description: "Alterne entre plusieurs tâches avec efficacité tout en prenant des notes détaillées sur un carnet qu'elle garde près d'elle."
      },
      'guillaume': {
        name: 'Guillaume', 
        role: 'Directeur Général',
        description: 'Tendu et autoritaire, il parle au téléphone à voix basse tout en consultant des documents confidentiels.'
      },
      'fares': {
        name: 'Farès', 
        role: 'Nouvel ingénieur système',
        description: "S'affaire sur un ordinateur portable personnel tout en proposant son aide à quiconque en a besoin."
      }
    };

    // Déterminer quels personnages sont présents selon les probabilités
    roomData.characters.forEach(charData => {
      // Vérifier la probabilité de présence (0-10)
      const roll = Math.floor(Math.random() * 10) + 1;
      if (roll <= charData.presence) {
        const info = characterInfo[charData.id];
        if (info) {
          charactersPresent.push({
            id: charData.id,
            name: info.name,
            role: info.role,
            shortDescription: info.description
          });
        }
      }
    });

    // Déterminer quels objets sont présents
    const objectsPresent: Array<{id: string, name: string, type: string, description: string}> = [];
    
    // Base de données simplifiée des objets (référence à itemDatabase défini plus haut)
    const itemDatabase: any = {
      'laptop-neil': {
        detailedName: "Ordinateur portable de Neil (DSI)",
        detailedDescription: "Un Dell XPS 15 haut de gamme avec plusieurs mesures de sécurité. L'écran est verrouillé mais un terminal de diagnostic reste accessible."
      },
      'serveur-logs': {
        detailedName: "Serveur de journalisation centralisée",
        detailedDescription: "Un rack serveur dédié à la collecte des logs de sécurité de l'ensemble du réseau."
      },
      'badge-acces': {
        detailedName: "Badge d'accès de Farès",
        detailedDescription: "Un badge d'accès magnétique au nom de Farès, récemment activé."
      },
      'emails-phishing': {
        detailedName: "Collection d'emails suspects",
        detailedDescription: "Un dossier dans la messagerie d'Eddy contenant plusieurs emails suspects."
      },
      'schema-reseau': {
        detailedName: "Schéma d'architecture réseau",
        detailedDescription: "Un document technique détaillant l'architecture réseau complète de l'entreprise."
      },
      'rapport-threat': {
        detailedName: "Rapport de Threat Intelligence",
        detailedDescription: "Un rapport confidentiel récent détaillant les techniques, tactiques et procédures de groupes APT actifs."
      },
      'disque-externe': {
        detailedName: "Disque dur externe crypté",
        detailedDescription: "Un disque dur externe Kingston trouvé dans le tiroir du bureau de Farès."
      },
      'post-it-mdp': {
        detailedName: "Post-it avec fragments de mot de passe",
        detailedDescription: "Plusieurs post-it trouvés dans différents bureaux contenant des fragments de mot de passe."
      }
    };
    
    roomData.objects.forEach(objData => {
      // Si l'objet est caché, il n'apparaît que dans certaines conditions
      if (!objData.isHidden || Math.random() > 0.7) { // 30% de chance de voir un objet caché
        // Définir les types d'objets
        let objectType: string;
        let shortDesc: string;
        
        if (objData.id.includes('laptop') || objData.id.includes('serveur')) {
          objectType = 'tool';
          shortDesc = "Un équipement informatique qui pourrait contenir des informations utiles.";
        } else if (objData.id.includes('schema') || objData.id.includes('emails') || objData.id.includes('rapport')) {
          objectType = 'document';
          shortDesc = "Un document qui semble contenir des informations importantes.";
        } else if (objData.id.includes('badge') || objData.id.includes('post-it')) {
          objectType = 'password';
          shortDesc = "Pourrait donner accès à des zones ou systèmes sécurisés.";
        } else {
          objectType = 'clue';
          shortDesc = "Un élément qui pourrait aider à comprendre ce qui s'est passé.";
        }
        
        // Retrouver le nom complet depuis itemDatabase si disponible
        let objName = objData.id;
        if (itemDatabase[objData.id]) {
          objName = itemDatabase[objData.id].detailedName;
          shortDesc = itemDatabase[objData.id].detailedDescription.split('.')[0] + '.';
        }
        
        objectsPresent.push({
          id: objData.id,
          name: objName,
          type: objectType,
          description: shortDesc
        });
      }
    });

    // Ajouter un événement aléatoire spécifique à la salle (20% de chance)
    let eventDescription = "";
    if (roomData.roomSpecificEvents && roomData.roomSpecificEvents.length > 0 && Math.random() < 0.2) {
      const randomIndex = Math.floor(Math.random() * roomData.roomSpecificEvents.length);
      eventDescription = roomData.roomSpecificEvents[randomIndex];
      
      // Ajouter l'événement dans l'historique du jeu
      updatedGameState.events.push(`[${data.room.id}] ${eventDescription}`);
    }

    let systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité appelé "Cyber Escape - Le Pare-feu est tombé".
Le joueur vient d'entrer dans la salle: ${roomData.fullName} (${data.room.id}).

DÉTAILS DE LA SALLE:
- Description fondamentale: ${roomData.description}
- État environnemental: ${roomData.environmentalState}
- Niveau de sécurité: ${roomData.securityLevel}
- Ambiance: ${roomData.ambiance}
- Niveau de danger: ${roomData.dangerLevel}/5
${roomData.secretDetails ? `- Détail secret (à révéler subtilement): ${roomData.secretDetails}` : ''}
${eventDescription ? `- Événement particulier qui vient de se produire: ${eventDescription}` : ''}

Voici le contexte du jeu:
- Difficulté actuelle: ${data.gameState.difficulty}
- Budget restant: ${updatedGameState.budget} crédits
- Temps restant: ${updatedGameState.timeRemaining} minutes
- Salles déjà visitées: ${updatedGameState.visitedRooms.join(', ')}
- Énigmes résolues: ${updatedGameState.puzzlesSolved.join(', ') || 'Aucune'}
- Objets dans l'inventaire: ${updatedGameState.inventory.map((i: any) => i.name).join(', ') || 'Aucun'}

PERSONNAGES PRÉSENTS:
${charactersPresent.length > 0 ? charactersPresent.map(char => `- ${char.name}, ${char.role}: ${char.shortDescription}`).join('\n') : "Aucun personnage n'est présent dans cette salle actuellement."}

OBJETS VISIBLES:
${objectsPresent.length > 0 ? objectsPresent.map(obj => `- ${obj.name}: ${obj.description}`).join('\n') : "Aucun objet d'intérêt n'est immédiatement visible."}

INSTRUCTIONS:
1. Génère une description immersive et évocatrice de cette salle (3-4 phrases)
2. Inclus des éléments narratifs qui renforcent la tension de la situation de crise
3. Intègre subtilement les détails secrets si présents, sans les révéler explicitement
4. Crée une atmosphère cohérente avec le niveau de danger et le contexte

Réponds uniquement avec un JSON au format:
{
  "roomDescription": "Description détaillée et atmosphérique de la salle",
  "characters": ${JSON.stringify(charactersPresent)},
  "objects": ${JSON.stringify(objectsPresent)}
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

Ton histoire personnelle: ${npc.backstory}

Tes secrets (que tu ne révèles pas facilement): ${npc.secrets}

Connaissances particulières que tu possèdes: ${npc.knowledge.join(', ')}

Contexte général: Un malware sophistiqué a compromis le système de l'entreprise, contourné le pare-feu et commence à exfiltrer des données sensibles. Le joueur est le Responsable Sécurité qui doit identifier la source de l'intrusion, stopper l'attaque et restaurer les systèmes.

Règles de comportement:
1. Exprime-toi de manière cohérente avec ta personnalité et ton histoire
2. Ne révèle pas d'emblée toutes tes informations - le joueur doit les mériter par ses questions et son approche
3. Montre des signes subtils de ton implication (ou non) dans l'incident
4. Tes réponses varient selon la façon dont le joueur t'aborde - être agressif te fera te refermer, être empathique t'ouvrira davantage
5. N'hésite pas à mentir ou déformer la vérité si cela correspond à tes motivations personnelles 
6. Utilise parfois des termes techniques spécifiques à ton domaine d'expertise

Voici l'historique de votre conversation:
${conversationHistoryText}

Le joueur vient de dire: "${data.userInput}"

Réponds de manière nuancée et réaliste. Si le joueur pose de bonnes questions ou établit une relation de confiance, révèle progressivement des informations utiles. Si le joueur est maladroit ou suspicieux, montre de la réticence ou détourne subtilement la conversation.

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

    // Base de données d'objets prédéfinis pour une cohérence narrative
    const itemDatabase: Record<string, {
      detailedName: string;
      detailedDescription: string;
      technicalInfo?: string;
      visualInfo: string;
      useHint: string;
      relatedPuzzleId?: string;
      secretInfo?: string;
      requiresItem?: string;
    }> = {
      'laptop-neil': {
        detailedName: "Ordinateur portable de Neil (DSI)",
        detailedDescription: "Un Dell XPS 15 haut de gamme avec plusieurs mesures de sécurité. L'écran est verrouillé mais un terminal de diagnostic reste accessible.",
        technicalInfo: "Modèle sécurisé avec chiffrement disque complet et authentification biométrique. Le système montre des traces de connexions récentes inhabituelles.",
        visualInfo: "Des post-it avec des fragments de mots de passe sont collés sur le bord de l'écran. Un fichier log.txt est visible sur le bureau.",
        useHint: "Les traces de connexion dans le terminal peuvent révéler des adresses IP suspectes. Recherchez particulièrement les connexions établies en dehors des heures de bureau.",
        relatedPuzzleId: "ip-suspecte"
      },
      'serveur-logs': {
        detailedName: "Serveur de journalisation centralisée",
        detailedDescription: "Un rack serveur dédié à la collecte des logs de sécurité de l'ensemble du réseau. L'interface de recherche est accessible mais limitée sans droits administrateur.",
        technicalInfo: "Système ELK (Elasticsearch, Logstash, Kibana) configuré pour capturer et indexer les événements de sécurité. Certains fichiers semblent avoir été récemment modifiés.",
        visualInfo: "L'écran affiche des graphiques d'activité réseau avec un pic inhabituel il y a 48 heures. Une alerte de sécurité a été désactivée il y a 3 jours.",
        useHint: "En analysant les logs autour du pic d'activité, vous pourriez identifier l'origine de l'attaque et les systèmes compromis.",
        relatedPuzzleId: "script-powershell"
      },
      'badge-acces': {
        detailedName: "Badge d'accès de Farès",
        detailedDescription: "Un badge d'accès magnétique au nom de Farès, récemment activé. Des autorisations inhabituelles pour un nouvel employé y sont configurées.",
        visualInfo: "Le badge présente un hologramme de sécurité de niveau 3, normalement réservé aux cadres supérieurs et administrateurs système.",
        useHint: "L'historique des accès physiques pourrait révéler des visites inhabituelles dans des zones sensibles en dehors des heures normales de travail.",
        secretInfo: "En scannant le QR code au dos du badge, vous pouvez accéder à l'historique des portes ouvertes par ce badge."
      },
      'disque-externe': {
        detailedName: "Disque dur externe crypté",
        detailedDescription: "Un disque dur externe Kingston trouvé dans le tiroir du bureau de Farès. Il est protégé par un chiffrement matériel et logiciel.",
        technicalInfo: "Le disque utilise un algorithme de chiffrement AES-256. Un fichier README non crypté contient un indice sur la méthode de déchiffrement.",
        visualInfo: "Une étiquette manuscrite avec le code 'IM2025' est collée sur le côté. Des traces d'utilisation récente sont visibles.",
        useHint: "Le mot de passe de déchiffrement pourrait être dérivé d'informations trouvées dans les différentes salles. Recherchez des indices liés à 'IM2025'.",
        relatedPuzzleId: "decode-usb"
      },
      'schema-reseau': {
        detailedName: "Schéma d'architecture réseau",
        detailedDescription: "Un document technique détaillant l'architecture réseau complète de l'entreprise, y compris les pare-feu, les zones démilitarisées (DMZ) et les systèmes critiques.",
        technicalInfo: "Le schéma montre les interdépendances entre les différents systèmes et les règles de pare-feu appliquées. Des annotations manuscrites indiquent des modifications récentes.",
        visualInfo: "Sur le schéma, une note manuscrite indique une séquence précise pour la procédure de récupération d'urgence.",
        useHint: "En étudiant les dépendances entre systèmes, vous pouvez déterminer la séquence correcte pour un redémarrage sécurisé après compromission.",
        relatedPuzzleId: "ordre-redemarrage"
      },
      'emails-phishing': {
        detailedName: "Collection d'emails suspects",
        detailedDescription: "Un dossier dans la messagerie d'Eddy contenant plusieurs emails suspects reçus ces dernières semaines. Certains contiennent des pièces jointes ou des liens.",
        technicalInfo: "L'analyse des en-têtes email révèle des tentatives de masquer l'origine réelle des messages. Une pièce jointe Excel contient des macros suspectes.",
        visualInfo: "Plusieurs emails semblent provenir de services IT légitimes mais contiennent des fautes d'orthographe subtiles ou des domaines légèrement modifiés.",
        useHint: "Examinez attentivement les pièces jointes et les domaines d'expédition pour identifier le vecteur d'infection initial.",
        relatedPuzzleId: "analyse-malware"
      },
      'rapport-threat': {
        detailedName: "Rapport de Threat Intelligence",
        detailedDescription: "Un rapport confidentiel récent détaillant les techniques, tactiques et procédures (TTP) de plusieurs groupes APT actifs dans votre secteur d'activité.",
        technicalInfo: "Le document contient des IOCs (Indicators of Compromise) spécifiques, incluant des hachages de fichiers malveillants, des domaines C2 et des signatures comportementales.",
        visualInfo: "Plusieurs passages sont surlignés en jaune, avec une attention particulière sur un groupe nommé 'Cozy Bear' et ses méthodes d'attaque récentes.",
        useHint: "En comparant les TTP observées dans votre incident avec celles documentées, vous pouvez identifier le groupe probablement responsable de l'attaque.",
        relatedPuzzleId: "empreinte-numerique"
      },
      'post-it-mdp': {
        detailedName: "Post-it avec fragments de mot de passe",
        detailedDescription: "Plusieurs post-it trouvés dans différents bureaux contenant des fragments de ce qui semble être un mot de passe administrateur complexe.",
        visualInfo: "Les fragments incluent 'Cy', 'r3F3u', et '2025!' écrits sur différentes couleurs de post-it.",
        useHint: "En combinant ces fragments dans le bon ordre et en déduisant les parties manquantes, vous pourriez reconstruire le mot de passe principal.",
        relatedPuzzleId: "mot-passe-final",
        secretInfo: "Une convention de nommage semble apparaître: un mélange de nom de système, caractères spéciaux et année en cours."
      }
    };

    // Rechercher l'objet dans la base de données ou générer dynamiquement
    const itemInfo = itemDatabase[data.item.id] || {
      detailedName: data.item.name,
      detailedDescription: `Un élément qui semble important pour résoudre la crise de cybersécurité en cours.`,
      visualInfo: "L'objet présente des caractéristiques intéressantes qui pourraient être utiles.",
      useHint: "Examinez-le attentivement et considérez comment il pourrait être lié aux systèmes compromis."
    };

    // Construction du prompt selon l'objet
    let systemPrompt = `Tu es le narrateur d'un jeu d'escape room cybersécurité. Le joueur interagit avec un objet important:

DÉTAILS DE L'OBJET:
- Type: ${data.item.type}
- Nom: ${itemInfo.detailedName}
- Description: ${itemInfo.detailedDescription}
- Aspect visuel: ${itemInfo.visualInfo}
${itemInfo.technicalInfo ? `- Information technique: ${itemInfo.technicalInfo}` : ''}
${itemInfo.secretInfo ? `- Information secrète (à ne révéler que si le joueur pose des questions précises): ${itemInfo.secretInfo}` : ''}

Voici le contexte du jeu:
- Salles visitées par le joueur: ${data.gameState.visitedRooms.join(', ')}
- Objets déjà dans l'inventaire: ${data.gameState.inventory.map((i: any) => i.name).join(', ') || 'Aucun'}
- Énigmes résolues: ${data.gameState.puzzlesSolved.join(', ') || 'Aucune'}

INSTRUCTIONS:
1. Génère une description immersive et détaillée de l'objet, comme si le joueur l'examinait attentivement
2. Inclus des détails à la fois visuels et fonctionnels qui peuvent aider le joueur
3. Suggère subtilement comment l'objet pourrait être utilisé sans donner la solution directement
4. Si l'objet est lié à une énigme, inclus des indices subtils

Réponds uniquement avec un JSON au format:
{
  "description": "Description évocatrice et détaillée de l'objet (3-4 phrases)",
  "useHint": "Indice sur la façon d'utiliser cet objet dans le jeu (1-2 phrases)",
  "relatedPuzzle": "Énigme à laquelle cet objet pourrait être lié (si applicable)",
  "requiresItem": "Objet complémentaire nécessaire pour exploiter pleinement celui-ci (si applicable)"
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