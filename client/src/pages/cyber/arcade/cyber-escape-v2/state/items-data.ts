import { InventoryItem } from '../types/game';

// Définition des objets du jeu
export const initialItems: Record<string, InventoryItem> = {
  // Équipement de départ
  "decrypt_device": {
    id: "decrypt_device",
    name: "Décrypteur portable",
    description: "Un petit appareil high-tech capable de déchiffrer différents types de chiffrements comme SHA-1 et AES.",
    usable: true,
    useTarget: ["hash", "encrypted_data"]
  },
  "rfid_reader": {
    id: "rfid_reader",
    name: "Lecteur RFID",
    description: "Un scanner de badges RFID permettant d'analyser et d'identifier les jetons d'accès numériques.",
    usable: true,
    useTarget: ["badge"]
  },

  // Jetons-clés obtenus à chaque étape
  "key_phish": {
    id: "key_phish",
    name: "Jeton Anti-Phishing",
    description: "Un jeton numérique prouvant votre capacité à identifier les tentatives de phishing.",
    usable: true,
    useTarget: ["vestibule_door"]
  },
  "intel_fragment": {
    id: "intel_fragment",
    name: "Fragment d'Intelligence",
    description: "Un ensemble de données OSINT confirmées sur la cible. Donne accès au Couloir des Badges.",
    usable: true,
    useTarget: ["revelations_door"]
  },
  "badge_admin": {
    id: "badge_admin",
    name: "Badge Administrateur",
    description: "Un badge de haut niveau donnant accès aux zones sécurisées. Correctement associé aux services appropriés.",
    usable: true,
    useTarget: ["badges_door"]
  },
  "plan_chip": {
    id: "plan_chip",
    name: "Puce Stratégique",
    description: "Contient un plan de sécurité complet avec priorisations correctes des investissements.",
    usable: true,
    useTarget: ["stratex_door"]
  },
  "crisis_pass": {
    id: "crisis_pass",
    name: "Laissez-passer Crise",
    description: "Certification de gestion de crise obtenue après avoir fait les bons choix face à l'incident.",
    usable: true,
    useTarget: ["crisis_door"]
  },
  "supply_stamp": {
    id: "supply_stamp",
    name: "Tampon de Conformité",
    description: "Atteste que vous savez identifier et neutraliser les risques de la chaîne d'approvisionnement.",
    usable: true,
    useTarget: ["supply_door"]
  },
  "cloud_token": {
    id: "cloud_token",
    name: "Jeton Cloud Sécurisé",
    description: "Preuve de votre capacité à sécuriser des environnements cloud et conteneurisés.",
    usable: true,
    useTarget: ["cloud_door"]
  },
  "exploit_cert": {
    id: "exploit_cert",
    name: "Certification Exploit",
    description: "Attestation prouvant votre compréhension des vulnérabilités et exploits.",
    usable: true,
    useTarget: ["exploit_door"]
  },
  "forensic_key": {
    id: "forensic_key",
    name: "Clé Forensique",
    description: "Une clé numérique obtenue après avoir correctement analysé des preuves numériques.",
    usable: true,
    useTarget: ["forensic_door"]
  },

  // Objets spéciaux
  "time_crystal": {
    id: "time_crystal",
    name: "Cristal Temporel",
    description: "Un artefact rare qui peut être échangé contre du temps supplémentaire auprès de certains personnages.",
    usable: true,
    useTarget: ["time_merchant"],
    consumed: true
  },
  "debug_tool": {
    id: "debug_tool",
    name: "Outil de Débogage",
    description: "Un outil spécial permettant d'analyser et de corriger des systèmes compromis.",
    usable: true,
    useTarget: ["corrupted_system", "malware"]
  },
  "crypto_analyzer": {
    id: "crypto_analyzer",
    name: "Analyseur Cryptographique",
    description: "Un appareil sophistiqué capable d'identifier les faiblesses dans les implémentations cryptographiques.",
    usable: true,
    useTarget: ["encrypted_system", "secure_channel"]
  }
};

export default initialItems;