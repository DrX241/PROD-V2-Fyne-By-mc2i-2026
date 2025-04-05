
import { v4 as uuidv4 } from 'uuid';

export const amoaMissions = [
  {
    id: uuidv4(),
    title: "Cadrage de projet digital",
    description: "Accompagner le cadrage d'un projet de transformation digitale",
    domain: "cadrage_projet",
    difficulty: "Intermédiaire",
    contact: {
      name: "Sophie Martin",
      role: "AMOA Senior",
      expertise: "Cadrage et pilotage de projets digitaux",
      concern: "Assurer l'alignement entre les besoins métier et la solution technique"
    },
    scenarioContacts: [
      {
        name: "Marc Durant",
        role: "Product Owner",
        expertise: "Gestion de produits digitaux",
        concern: "Maximiser la valeur business du produit"
      },
      {
        name: "Julie Lefebvre",
        role: "Responsable Métier",
        expertise: "Processus métier et organisation",
        concern: "Optimiser les processus de l'entreprise"
      }
    ],
    skills: [
      {
        id: "requirements_analysis",
        name: "Analyse des besoins",
        description: "Capacité à identifier et formaliser les besoins métier",
        category: "analyse",
        level: 0
      },
      {
        id: "stakeholder_management",
        name: "Gestion des parties prenantes",
        description: "Capacité à coordonner les différents acteurs du projet",
        category: "communication",
        level: 0
      },
      {
        id: "process_modeling",
        name: "Modélisation des processus",
        description: "Capacité à cartographier et optimiser les processus",
        category: "technique",
        level: 0
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Spécifications fonctionnelles",
    description: "Rédiger les spécifications fonctionnelles d'une nouvelle fonctionnalité",
    domain: "specifications",
    difficulty: "Expert",
    // ... Structure similaire pour les autres missions
  }
];
