/**
 * Générateur d'anecdotes pour le module AGENT CONVERSATIONNEL
 * Ce module sélectionne aléatoirement des anecdotes pertinentes en fonction du domaine de cybersécurité
 */

interface AnecdoteDatabase {
  [key: string]: string[]
}

// Banque d'anecdotes par domaine de cybersécurité
const anecdotesByCyberDomain: AnecdoteDatabase = {
  "Gestion de crise cyber": [
    "En 2017, la cyberattaque NotPetya a coûté plus de 10 milliards d'euros de dommages au niveau mondial en seulement quelques heures.",
    "Lors d'une récente simulation de crise, une entreprise du CAC 40 a découvert qu'elle aurait mis 72 heures à identifier une intrusion sophistiquée sur son réseau.",
    "Les entreprises disposant d'un plan de réponse aux incidents bien testé réduisent en moyenne de 28% le coût d'une violation de données."
  ],
  "Protection des données personnelles / RGPD": [
    "La première amende RGPD en France a concerné une entreprise qui n'avait pas suffisamment sécurisé les données de ses clients sur son site web.",
    "Savais-tu que 60% des entreprises européennes ne sont toujours pas entièrement conformes au RGPD depuis son entrée en vigueur en 2018?",
    "En 2022, les autorités européennes ont infligé plus de 1,6 milliard d'euros d'amendes pour des violations du RGPD."
  ],
  "Ingénierie sociale et phishing": [
    "Une étude récente a montré que 32% des violations de données commencent par une attaque de phishing réussie.",
    "Lors d'un test d'hameçonnage dans une multinationale française, 43% des employés ont cliqué sur un lien suspect malgré les formations de sensibilisation.",
    "Les attaques de phishing ont augmenté de 350% pendant la pandémie de COVID-19 lorsque les entreprises sont passées au télétravail."
  ],
  "Gestion des incidents de sécurité": [
    "Le temps moyen de détection d'une intrusion dans les systèmes d'information est de 207 jours selon le rapport de Ponemon Institute.",
    "Une étude de l'ANSSI montre que 60% des entreprises victimes d'incidents majeurs n'avaient pas de procédure de gestion de crise cyber formalisée.",
    "Les entreprises qui disposent d'une équipe dédiée à la réponse aux incidents réduisent le coût moyen d'une violation de 80%."
  ],
  "Sécurité de la chaîne d'approvisionnement": [
    "L'attaque SolarWinds de 2020 a compromis plus de 18 000 organisations via une simple mise à jour logicielle.",
    "Près de 60% des violations de données sont liées à des vulnérabilités introduites par des tiers ou des fournisseurs.",
    "Une étude du CESIN révèle que seulement 23% des entreprises françaises auditent régulièrement la sécurité de leurs fournisseurs critiques."
  ],
  "Stratégie et gouvernance": [
    "Les entreprises avec un RSSI qui rapporte directement au CEO réduisent de 35% le coût moyen des incidents de sécurité.",
    "Selon le World Economic Forum, les cyber-risques figurent parmi les 5 principales préoccupations des dirigeants depuis 2018.",
    "Une étude Gartner montre que 40% des budgets de cybersécurité sont alloués à des projets sans alignement stratégique clair."
  ]
};

/**
 * Sélectionne une anecdote aléatoire pertinente pour un domaine donné
 * @param domain Le domaine de cybersécurité
 * @returns Une anecdote aléatoire liée au domaine
 */
export function getRandomAnecdote(domain: string): string {
  // Domaine par défaut si aucune correspondance n'est trouvée
  let domainKey = "Stratégie et gouvernance";
  
  // Rechercher une correspondance partielle dans les clés du dictionnaire
  for (const key of Object.keys(anecdotesByCyberDomain)) {
    if (domain.toLowerCase().includes(key.toLowerCase())) {
      domainKey = key;
      break;
    }
  }
  
  // Récupérer les anecdotes pour ce domaine
  const anecdotes = anecdotesByCyberDomain[domainKey];
  
  // Sélectionner aléatoirement une anecdote
  return anecdotes[Math.floor(Math.random() * anecdotes.length)];
}

/**
 * Sélectionne des interlocuteurs pertinents pour un domaine et un contact principal
 * @param domain Le domaine de cybersécurité
 * @param primaryContact Le contact principal (à exclure de la sélection)
 * @returns Un tableau d'interlocuteurs additionnels
 */
export function getRelevantContacts(domain: string, primaryContact: { name: string, role: string }): Array<{
  name: string;
  role: string;
  expertise: string;
}> {
  // Liste complète d'experts disponibles
  const allExperts = [
    {
      name: "Lorenzo Bertola",
      role: "Directeur Général Adjoint et Directeur du pôle BFA",
      expertise: "Cybersécurité dans le secteur bancaire et financier"
    },
    {
      name: "Vincent Terrier",
      role: "Senior Partner, Directeur Financier",
      expertise: "Gestion des risques financiers liés aux cyber-attaques"
    },
    {
      name: "Guillaume Lechevallier",
      role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
      expertise: "Transformation numérique sécurisée dans les secteurs industriels"
    },
    {
      name: "Fares SAYADI",
      role: "Spécialiste Data / IA",
      expertise: "Sécurisation des données dans le secteur public et la santé"
    },
    {
      name: "Nicolas Paolantonacci",
      role: "Senior Partner et Directeur du pôle RETAIL & LUXE",
      expertise: "Protection des actifs digitaux dans le secteur du luxe"
    },
    {
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Marketing, Communication et RSE",
      expertise: "Communication de crise et gestion de la réputation"
    },
    {
      name: "Anthony Frescal",
      role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
      expertise: "Sécurité des infrastructures critiques énergétiques"
    },
    {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO",
      expertise: "Stratégies de défense et solutions techniques de cybersécurité"
    },
    {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO",
      expertise: "Analyse forensique et réponse aux incidents"
    },
    {
      name: "Eddy MISSONI IDEMBI",
      role: "Expert Data / IA & CTO",
      expertise: "Sécurisation des modèles d'IA et protection des données"
    },
    {
      name: "Vincent Pascal",
      role: "Directeur Général Adjoint et Directeur du Développement",
      expertise: "Conformité réglementaire en matière de cybersécurité"
    },
    {
      name: "Arnaud Gauthier",
      role: "Président",
      expertise: "Vision stratégique et gouvernance de la cybersécurité"
    },
    {
      name: "Olivier Hervo",
      role: "Directeur Général",
      expertise: "Arbitrage risques/opportunités en matière de sécurité"
    },
    {
      name: "Isabelle Dubacq",
      role: "Senior Partner, Directrice des Ressources Humaines",
      expertise: "Formation et sensibilisation des collaborateurs"
    }
  ];
  
  // Filtrer pour exclure le contact principal
  const filteredExperts = allExperts.filter(expert => 
    expert.name !== primaryContact.name
  );
  
  // Mélanger aléatoirement les experts
  const shuffledExperts = [...filteredExperts].sort(() => Math.random() - 0.5);
  
  // Sélectionner 2 experts maximum
  return shuffledExperts.slice(0, 2);
}

/**
 * Détermine le niveau de difficulté en texte lisible
 * @param difficulty Le niveau de difficulté (Débutant, Intermédiaire, Expert)
 * @returns Une description textuelle du niveau de difficulté
 */
export function getDifficultyText(difficulty: string): string {
  const difficultyMap: {[key: string]: string} = {
    "Débutant": "une introduction accessible aux principes fondamentaux",
    "Intermédiaire": "un problème concret nécessitant une certaine maîtrise technique",
    "Expert": "un défi complexe requérant une expertise approfondie"
  };
  
  return difficultyMap[difficulty] || "un cas pratique adapté à ton niveau";
}

/**
 * Détermine le secteur d'activité en fonction du contact
 * @param contactName Le nom du contact principal
 * @returns Le secteur d'activité
 */
export function getSecteurActivite(contactName: string): string {
  if (contactName === "Lorenzo Bertola" || contactName === "Vincent Terrier") {
    return 'BANCAIRE/FINANCIER (BFA)';
  }
  else if (contactName === "Guillaume Lechevallier" || contactName === "Fares SAYADI") {
    return 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
  }
  else if (contactName === "Nicolas Paolantonacci" || contactName === "Marion Lopez") {
    return 'RETAIL & LUXE';
  }
  else if (contactName === "Anthony Frescal") {
    return 'ÉNERGIE & UTILITIES';
  }
  else {
    // Si pas de correspondance, choisir aléatoirement
    const secteurs = ['BANCAIRE/FINANCIER (BFA)', 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)', 'RETAIL & LUXE', 'ÉNERGIE & UTILITIES'];
    return secteurs[Math.floor(Math.random() * secteurs.length)];
  }
}

/**
 * Génère un nom d'entreprise fictif en fonction du secteur d'activité
 * @param secteurActivite Le secteur d'activité
 * @returns Un nom d'entreprise fictif
 */
export function getCompanyName(secteurActivite: string): string {
  if (secteurActivite === 'BANCAIRE/FINANCIER (BFA)') {
    return "SECURE FINANCE SOLUTIONS";
  } else if (secteurActivite === 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)') {
    return "HEALTH & INDUSTRY SHIELD";
  } else if (secteurActivite === 'RETAIL & LUXE') {
    return "ELITE RETAIL SECURITY";
  } else if (secteurActivite === 'ÉNERGIE & UTILITIES') {
    return "ENERGY SHIELD SYSTEMS";
  } else {
    return "CYBER SECURE SOLUTIONS";
  }
}