// Définition des salles du jeu CYBER ESCAPE v2.0
import { GameStage } from '../types/game-enums';

// Types pour les données des salles
export interface NPC {
  id: string;
  name: string;
  avatar: string;
  role: string;
  position: { x: number; y: number };
  dialogues: {
    initial: string;
    hint?: string;
    success?: string;
    failure?: string;
  };
}

export interface InteractiveObject {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  description: string;
  state: 'default' | 'active' | 'disabled';
  interactionResult?: string;
  requiredItem?: string;
}

export interface Exit {
  direction: 'north' | 'south' | 'east' | 'west';
  status: 'open' | 'locked' | 'hidden';
  destinationRoomId?: string;
  unlockedBy?: string;
}

export interface Challenge {
  type: 'qcm' | 'code' | 'puzzle' | 'phishing';
  description: string;
  data: any; // Données spécifiques au défi
  completionItem: string; // Item obtenu après avoir réussi le défi
  timeReward: number; // Temps gagné en secondes
  timePenalty: number; // Temps perdu en cas d'erreur
  hints: string[];
}

export interface Room {
  id: string;
  name: string;
  stageId: GameStage;
  description: string;
  detailedDescription: string;
  npcs: NPC[];
  objects: InteractiveObject[];
  exits: Exit[];
  challenge?: Challenge;
  isCompleted: boolean;
}

// Définition de la première salle: Vestibule Phish-Alert
const vestibulePhishAlert: Room = {
  id: 'vestibule-phish-alert',
  name: 'Vestibule Phish-Alert',
  stageId: GameStage.VESTIBULE,
  description: 'Salle d\'accueil et centre de détection de phishing',
  detailedDescription: 'Une salle moderne équipée d\'écrans affichant divers emails. La lumière bleue des moniteurs éclaire doucement l\'espace. Un terminal central est disponible pour l\'analyse de phishing, et un agent holographique semble attendre vos instructions.',
  
  npcs: [
    {
      id: 'agent-echo',
      name: 'Agent Echo',
      avatar: 'security-officer',
      role: 'Officier de sécurité virtuel',
      position: { x: 70, y: 30 },
      dialogues: {
        initial: "Bienvenue au Vestibule Phish-Alert, agent. Je suis Echo, votre guide virtuel. Votre mission dans cette salle est d'identifier les emails malveillants parmi les échantillons affichés sur ces écrans. Utilisez la commande 'flag <numéro>' pour marquer un email comme malveillant. Chaque bonne identification renforce notre système et vous rapproche de votre objectif.",
        hint: "Recherchez des indices typiques de phishing : urgence excessive, fautes d'orthographe, domaines suspects, demandes inhabituelles de données personnelles. Les emails 2, 5 et 7 méritent particulièrement votre attention.",
        success: "Excellente analyse ! Vous avez correctement identifié les menaces. Un Jeton-Clé a été ajouté à votre inventaire, vous permettant d'accéder à la salle suivante par la porte Est.",
        failure: "Votre analyse contient des erreurs. Les emails légitimes marqués comme malveillants ou les menaces manquées pourraient compromettre la sécurité. Réessayez avec plus d'attention aux détails."
      }
    }
  ],
  
  objects: [
    {
      id: 'terminal-central',
      name: 'Terminal Central',
      icon: 'terminal',
      position: { x: 50, y: 50 },
      description: 'Terminal principal pour l\'analyse des emails',
      state: 'default',
      interactionResult: "Terminal d'analyse activé. Utilisez les commandes 'flag <numéro>' pour marquer les emails suspects. Les échantillons sont numérotés de 1 à 8."
    },
    {
      id: 'ecran-emails',
      name: 'Écrans d\'Emails',
      icon: 'server',
      position: { x: 30, y: 70 },
      description: 'Affiche les échantillons d\'emails à analyser',
      state: 'default',
      interactionResult: "Les écrans affichent 8 emails différents. Certains sont légitimes, d'autres sont des tentatives de phishing soigneusement conçues. Votre mission est d'identifier les dangereux."
    },
    {
      id: 'jeton-cle-vestibule',
      name: 'Jeton-Clé: Vigilance',
      icon: 'key',
      position: { x: 80, y: 75 },
      description: 'Un jeton numérique brillant avec le symbole de la vigilance',
      state: 'disabled', // Sera activé après avoir réussi le défi
      interactionResult: "Ce Jeton-Clé symbolise votre maîtrise de la vigilance face aux menaces de phishing. Il a été ajouté à votre inventaire et peut déverrouiller la porte Est."
    }
  ],
  
  exits: [
    {
      direction: 'east',
      status: 'locked',
      destinationRoomId: 'mur-revelations',
      unlockedBy: 'jeton-cle-vestibule'
    }
  ],
  
  challenge: {
    type: 'phishing',
    description: 'Identifiez les emails malveillants parmi les 8 échantillons affichés.',
    data: {
      emails: [
        {
          id: 1,
          subject: 'Mise à jour de votre abonnement',
          sender: 'services@netflix-billing.com',
          content: 'Cher client, votre abonnement Netflix expire demain. Pour éviter l\'interruption de service, mettez à jour vos informations de paiement en cliquant sur ce lien: http://netflix-account-update.co/login',
          isPhishing: true
        },
        {
          id: 2,
          subject: 'Livraison de votre colis',
          sender: 'livraison@correos.es',
          content: 'Votre colis #4572 est prêt à être livré. Des frais de douane de 2,99€ doivent être payés avant la livraison. Cliquez ici: http://correos-delivery.info/pay',
          isPhishing: true
        },
        {
          id: 3,
          subject: 'Confirmation de rendez-vous',
          sender: 'no-reply@doctissimo.fr',
          content: 'Votre rendez-vous médical est confirmé pour le 14/05/2025 à 14h30. Pour annuler ou reporter, connectez-vous à votre espace patient sur www.doctissimo.fr.',
          isPhishing: false
        },
        {
          id: 4,
          subject: 'Alerte de sécurité: Connexion inhabituelle',
          sender: 'security@google.com',
          content: 'Une connexion inhabituelle à votre compte a été détectée depuis Berlin, Allemagne. Si ce n\'était pas vous, sécurisez votre compte sur https://myaccount.google.com/security',
          isPhishing: false
        },
        {
          id: 5,
          subject: 'URGENT: Votre compte bancaire est suspendu',
          sender: 'secure@societe-generale-banking.net',
          content: 'Votre compte a été temporairement suspendu suite à des activités suspectes. Restaurez votre accès immédiatement: http://secure-societegenerale.banking-portal.net/restore',
          isPhishing: true
        },
        {
          id: 6,
          subject: 'Votre facture électricité',
          sender: 'factures@edf.fr',
          content: 'Votre facture d\'électricité du mois d\'avril est disponible dans votre espace client. Montant: 78,50€. Date limite de paiement: 15/05/2025.',
          isPhishing: false
        },
        {
          id: 7,
          subject: 'Action requise: Problème avec votre déclaration fiscale',
          sender: 'refund@impots-gouv.com',
          content: 'Nous avons détecté un trop-perçu de 843,75€ sur votre dernière déclaration fiscale. Pour recevoir votre remboursement, complétez le formulaire: http://impots-remboursement.com/form',
          isPhishing: true
        },
        {
          id: 8,
          subject: 'Votre réservation SNCF est confirmée',
          sender: 'voyages@sncf.fr',
          content: 'Votre billet Paris-Lyon du 20/05/2025 à 08h12 est confirmé. Référence: XFTR7892. Votre billet est disponible dans l\'application SNCF Connect ou sur sncf.fr/mes-voyages.',
          isPhishing: false
        }
      ],
      correctPhishingIds: [1, 2, 5, 7]
    },
    completionItem: 'jeton-cle-vestibule',
    timeReward: 60, // +1 minute
    timePenalty: 30, // -30 secondes
    hints: [
      "Vérifiez l'URL dans les liens - les domaines légèrement modifiés sont suspects",
      "Les emails créant un sentiment d'urgence sont souvent des tentatives de phishing",
      "Méfiez-vous des demandes inattendues d'informations personnelles ou de paiement"
    ]
  },
  
  isCompleted: false
};

// Définition de la deuxième salle: Mur des Révélations
const murRevelations: Room = {
  id: 'mur-revelations',
  name: 'Mur des Révélations',
  stageId: GameStage.MUR_REVELATIONS,
  description: 'Centre d\'analyse OSINT et de renseignement',
  detailedDescription: 'Une vaste salle dominée par un mur d\'écrans affichant des flux de données provenant de sources ouvertes. Des visualisations complexes montrent des connexions entre différentes entités et informations. Un spécialiste OSINT travaille sur une console centrale.',
  
  npcs: [
    {
      id: 'analyste-nova',
      name: 'Analyste Nova',
      avatar: 'data-analyst',
      role: 'Spécialiste OSINT',
      position: { x: 60, y: 40 },
      dialogues: {
        initial: "Bienvenue au Mur des Révélations. Je suis Nova, spécialiste en OSINT - renseignement en sources ouvertes. Dans cette salle, vous allez apprendre à rassembler des informations publiquement accessibles pour créer un profil de menace. Votre mission est de collecter suffisamment d'informations sur une organisation suspecte nommée 'CyberNex'.",
        hint: "Pour réussir cette analyse OSINT, recherchez des informations sur différentes plateformes: réseaux sociaux, forums, registres de domaines, et articles de presse. Utilisez les outils disponibles sur la console centrale et n'oubliez pas de croiser vos sources.",
        success: "Excellente collecte d'informations! Votre profil OSINT de CyberNex est complet et révèle clairement leurs intentions malveillantes. Le Jeton-Clé 'Perspicacité' est maintenant dans votre inventaire.",
        failure: "Votre analyse OSINT contient des lacunes importantes. Sans un profil complet, nous ne pouvons pas évaluer correctement la menace que représente CyberNex. Continuez vos recherches."
      }
    }
  ],
  
  objects: [
    {
      id: 'console-osint',
      name: 'Console OSINT',
      icon: 'terminal',
      position: { x: 40, y: 50 },
      description: 'Station de travail spécialisée pour la recherche OSINT',
      state: 'default',
      interactionResult: "Console OSINT activée. Utilisez les commandes 'search <plateforme> <mot-clé>' pour effectuer des recherches. Plateformes disponibles: social, news, domains, forums, leaks."
    },
    {
      id: 'mur-donnees',
      name: 'Mur de Données',
      icon: 'database',
      position: { x: 20, y: 30 },
      description: 'Visualisation des connexions entre les informations collectées',
      state: 'default',
      interactionResult: "Le mur de données s'illumine, montrant les connexions entre différentes entités. Pour ajouter des informations au mur, utilisez la commande 'connect <information1> <information2>'."
    },
    {
      id: 'jeton-cle-mur',
      name: 'Jeton-Clé: Perspicacité',
      icon: 'key',
      position: { x: 80, y: 20 },
      description: 'Un jeton numérique avec le symbole de la perspicacité',
      state: 'disabled',
      interactionResult: "Ce Jeton-Clé symbolise votre maîtrise des techniques OSINT. Il a été ajouté à votre inventaire et peut déverrouiller la porte Sud."
    }
  ],
  
  exits: [
    {
      direction: 'west',
      status: 'open',
      destinationRoomId: 'vestibule-phish-alert'
    },
    {
      direction: 'south',
      status: 'locked',
      destinationRoomId: 'couloir-badges',
      unlockedBy: 'jeton-cle-mur'
    }
  ],
  
  // Le défi OSINT sera implémenté plus tard
  
  isCompleted: false
};

// Exporter toutes les salles dans un objet pour faciliter l'accès
export const rooms: Record<string, Room> = {
  'vestibule-phish-alert': vestibulePhishAlert,
  'mur-revelations': murRevelations,
};

// Fonction pour obtenir une salle par son ID
export const getRoomById = (id: string): Room | undefined => {
  return rooms[id];
};

// Fonction pour obtenir une salle par son numéro d'étape
export const getRoomByStage = (stage: GameStage): Room | undefined => {
  return Object.values(rooms).find(room => room.stageId === stage);
};

export default rooms;