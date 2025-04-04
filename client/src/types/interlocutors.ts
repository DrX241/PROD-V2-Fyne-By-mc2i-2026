// Types pour les interlocuteurs des modules de conversation

export interface Interlocutor {
  id: string;           // Identifiant unique
  name: string;         // Nom affiché
  role: string;         // Rôle ou fonction
  avatarUrl?: string;   // URL de l'avatar personnalisé (facultatif)
  description: string;  // Description ou biographie
  backgroundColor: string; // Couleur d'arrière-plan pour l'avatar (classe Tailwind)
  textColor: string;    // Couleur du texte (classe Tailwind)
}

// Liste des executives 
export const EXECUTIVES: Interlocutor[] = [
  {
    id: "arnaud-gauthier",
    name: "Arnaud Gauthier",
    role: "Directeur Cybersécurité",
    description: "Directeur de la cybersécurité avec plus de 15 ans d'expérience, spécialisé dans la gouvernance et la stratégie de sécurité.",
    backgroundColor: "bg-blue-900",
    textColor: "text-blue-100"
  },
  {
    id: "olivier-hervo",
    name: "Olivier Hervo",
    role: "RSSI",
    description: "Responsable de la Sécurité des Systèmes d'Information, expert en gestion des risques et conformité réglementaire.",
    backgroundColor: "bg-purple-900",
    textColor: "text-purple-100"
  },
  {
    id: "lorenzo-bertola",
    name: "Lorenzo Bertola",
    role: "Chef des Opérations de Sécurité",
    description: "Responsable des opérations de sécurité, supervision des SOC et gestion des incidents.",
    backgroundColor: "bg-red-900",
    textColor: "text-red-100"
  },
  {
    id: "anthony-frescal",
    name: "Anthony Frescal",
    role: "Expert Cybersécurité",
    description: "Expert en sécurité des infrastructures IT et OT, spécialisé dans les technologies de défense avancées.",
    backgroundColor: "bg-green-900",
    textColor: "text-green-100"
  },
  {
    id: "vincent-pascal",
    name: "Vincent Pascal",
    role: "Directeur Général",
    description: "Directeur Général, responsable des décisions stratégiques et de la vision globale de l'entreprise.",
    backgroundColor: "bg-gray-900",
    textColor: "text-gray-100"
  },
  {
    id: "guillaume-lechevallier",
    name: "Guillaume Lechevallier",
    role: "Architecte Sécurité",
    description: "Architecte en sécurité des systèmes d'information, conception de solutions de sécurité robustes.",
    backgroundColor: "bg-amber-900",
    textColor: "text-amber-100"
  },
  {
    id: "julien-grimault",
    name: "Julien Grimault",
    role: "Analyste SOC",
    description: "Analyste au centre des opérations de sécurité, détection et analyse des menaces en temps réel.",
    backgroundColor: "bg-indigo-900",
    textColor: "text-indigo-100"
  },
  {
    id: "nosing-doeuk",
    name: "Nosing Doeuk",
    role: "Responsable Tests d'Intrusion",
    description: "Expert en tests d'intrusion et Red Team, évaluation de la sécurité par des approches offensives.",
    backgroundColor: "bg-pink-900",
    textColor: "text-pink-100"
  }
];

// Interlocuteur par défaut pour I AM CYBER
export const DEFAULT_INTERLOCUTOR: Interlocutor = {
  id: "i-am-cyber",
  name: "I AM CYBER",
  role: "Assistant virtuel",
  description: "Votre assistant virtuel spécialisé en cybersécurité, conçu pour vous guider et vous former.",
  backgroundColor: "bg-blue-900",
  textColor: "text-blue-100"
};