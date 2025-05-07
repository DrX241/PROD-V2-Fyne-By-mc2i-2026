import { RoomData, InventoryItem } from '../types/game';
import { ObjectState, ExitStatus, ChallengeType, ObjectType } from '../types/game-enums';

// Données initiales du jeu
export const initialGameData = {
  currentStage: 1,
  currentRoomId: 'server_room',
  inventory: {} as Record<string, InventoryItem>,
  messages: [
    'Bienvenue dans Cyber Escape: Le Pare-feu est tombé!',
    'Vous êtes le nouveau Responsable Cybersécurité de l\'entreprise.',
    'Le système de sécurité a été compromis. Votre mission est de rétablir les défenses en traversant 10 niveaux de défis.',
    'Commencez par explorer la salle des serveurs...'
  ],
  timeRemaining: 900 // 15 minutes en secondes
};

// Définition des salles du jeu
export const rooms: Record<string, RoomData> = {
  // Niveau 1: Salle des serveurs
  'server_room': {
    id: 'server_room',
    name: 'Salle des Serveurs',
    description: 'La salle des serveurs principale de l\'entreprise. Les équipements clignotent frénétiquement, signe d\'une activité anormale.',
    backgroundPath: '/assets/rooms/server_room.jpg',
    objects: [
      {
        id: 'server_rack_1',
        name: 'Rack Serveur Principal',
        description: 'Le rack principal contenant les serveurs critiques. Un voyant rouge clignote, indiquant une intrusion possible.',
        type: ObjectType.COMPUTER,
        interactable: true,
        collectible: false,
        position: { x: 30, y: 50, width: 20, height: 40 },
        state: ObjectState.NORMAL,
        imagePath: '/assets/objects/server_rack.png'
      },
      {
        id: 'terminal_phishing',
        name: 'Terminal de Sécurité',
        description: 'Un terminal de sécurité affichant une alerte concernant des emails de phishing détectés.',
        type: ObjectType.COMPUTER,
        interactable: true,
        collectible: false,
        position: { x: 60, y: 45, width: 15, height: 20 },
        state: ObjectState.INTERACTIVE,
        imagePath: '/assets/objects/security_terminal.png'
      },
      {
        id: 'security_badge',
        name: 'Badge de Sécurité',
        description: 'Un badge d\'accès appartenant à un administrateur système. Il peut être utilisé pour accéder à des zones sécurisées.',
        type: 'key',
        interactable: true,
        collectible: true,
        position: { x: 80, y: 70, width: 5, height: 5 },
        state: ObjectState.NORMAL,
        imagePath: '/assets/objects/security_badge.png'
      }
    ],
    npcs: [
      {
        id: 'technician',
        name: 'Alex',
        role: 'Technicien Système',
        description: 'Un technicien système expérimenté qui peut vous aider à comprendre l\'infrastructure.',
        dialogues: [
          'Bonjour, je suis Alex, le technicien système. Bienvenue dans notre salle des serveurs.',
          'Nous avons remarqué une activité suspecte provenant de l\'extérieur. Je pense que quelqu\'un a envoyé des emails de phishing à notre personnel.',
          'Vous devriez vérifier le terminal de sécurité pour analyser ces menaces. Utilisez vos compétences de détection de phishing.',
          'Une fois que vous aurez identifié la menace, vous pourrez accéder à la salle de contrôle réseau pour restaurer le pare-feu.'
        ],
        position: { x: 15, y: 60, width: 10, height: 25 },
        imagePath: '/assets/npcs/technician.png'
      }
    ],
    exits: {
      'to_network_control': {
        roomId: 'network_control_room',
        name: 'Salle de Contrôle Réseau',
        description: 'La porte menant à la salle de contrôle réseau. Elle nécessite une authentification.',
        status: ExitStatus.LOCKED,
        requiresItem: 'security_badge',
        position: { x: 90, y: 50, width: 10, height: 30 }
      }
    },
    challenge: {
      id: 'phishing_detection_lvl1',
      type: ChallengeType.PHISHING,
      title: 'Détection de Phishing',
      description: 'Analysez les emails reçus et identifiez ceux qui sont des tentatives de phishing.',
      difficulty: 'beginner',
      timeLimit: 120,
      data: {
        emails: [
          {
            id: 'email1',
            sender: 'service-client@bankofamerica.com',
            subject: 'Action urgente requise sur votre compte',
            content: 'Cher client, Nous avons détecté une activité inhabituelle sur votre compte. Veuillez cliquer sur le lien ci-dessous pour vérifier votre identité et sécuriser votre compte: https://bank0famerica-secure.com/verify',
            isPhishing: true,
            hints: ['Vérifiez l\'URL attentivement', 'Les banques légitimes n\'utilisent pas de domaines avec des chiffres au lieu de lettres']
          },
          {
            id: 'email2',
            sender: 'rh@entreprise-interne.com',
            subject: 'Mise à jour de la politique de sécurité',
            content: 'Chers collègues, Veuillez prendre connaissance de la nouvelle politique de sécurité de l\'entreprise en pièce jointe. Merci de confirmer que vous l\'avez lue avant vendredi. Cordialement, Le service RH',
            isPhishing: false,
            hints: ['L\'adresse email de l\'expéditeur correspond au domaine de l\'entreprise', 'Le message ne demande pas d\'informations sensibles']
          },
          {
            id: 'email3',
            sender: 'amazon-orders@amazonshopping.net',
            subject: 'Confirmation de commande #A38259B',
            content: 'Votre commande d\'un téléphone Samsung Galaxy S23 Ultra (1899€) a été traitée. Si vous n\'avez pas passé cette commande, veuillez cliquer ici pour l\'annuler et vérifier votre compte: https://amaz0n-verify.net/cancel',
            isPhishing: true,
            hints: ['Amazon utilise uniquement ses domaines officiels', 'Les liens suspects avec des domaines similaires sont souvent des signes de phishing']
          },
          {
            id: 'email4',
            sender: 'contact@microsoft.com',
            subject: 'Renouvellement de votre licence Microsoft 365',
            content: 'Votre abonnement Microsoft 365 sera bientôt renouvelé. Consultez les détails sur votre compte Microsoft en vous connectant sur https://account.microsoft.com',
            isPhishing: false,
            hints: ['L\'URL pointe vers le domaine officiel de Microsoft', 'Pas d\'urgence ou de menace dans le message']
          }
        ]
      }
    }
  },
  
  // Niveau 2: Salle de contrôle réseau (débloquée après le niveau 1)
  'network_control_room': {
    id: 'network_control_room',
    name: 'Salle de Contrôle Réseau',
    description: 'Centre névralgique du réseau de l\'entreprise. Les écrans de surveillance montrent plusieurs brèches de sécurité actives.',
    backgroundPath: '/assets/rooms/network_control_room.jpg',
    objects: [
      {
        id: 'firewall_terminal',
        name: 'Terminal Pare-feu',
        description: 'Le terminal principal pour gérer le pare-feu de l\'entreprise. Il est actuellement désactivé.',
        type: ObjectType.COMPUTER,
        interactable: true,
        collectible: false,
        position: { x: 50, y: 40, width: 20, height: 25 },
        state: ObjectState.INTERACTIVE,
        imagePath: '/assets/objects/firewall_terminal.png'
      }
    ],
    npcs: [],
    exits: {
      'back_to_server': {
        roomId: 'server_room',
        name: 'Retour à la Salle des Serveurs',
        description: 'La porte menant à la salle des serveurs.',
        status: ExitStatus.OPEN,
        position: { x: 10, y: 50, width: 10, height: 30 }
      }
    },
    challenge: {
      id: 'firewall_config_lvl2',
      type: ChallengeType.FIREWALL,
      title: 'Configuration du Pare-feu',
      description: 'Configurez les règles du pare-feu pour bloquer les adresses IP malveillantes tout en maintenant les services essentiels.',
      difficulty: 'beginner',
      timeLimit: 150,
      data: {
        // Les données du défi de niveau 2 seront ajoutées plus tard
      }
    }
  }
};