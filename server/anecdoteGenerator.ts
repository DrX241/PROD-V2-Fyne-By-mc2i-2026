/**
 * Générateur d'anecdotes pour le module AGENT CONVERSATIONNEL
 * Ce module sélectionne aléatoirement des anecdotes pertinentes en fonction du domaine de cybersécurité
 */

// Définir la structure de la base de données d'anecdotes
interface AnecdoteDatabase {
  [key: string]: string[]
}

// Base de données d'anecdotes organisées par domaine de cybersécurité
const anecdotesByCyberDomain: AnecdoteDatabase = {
  "Stratégie et gouvernance": [
    "En 2022, une étude du CESIN a révélé que 43% des entreprises du CAC 40 ont un RSSI qui reporte directement au COMEX, montrant l'importance croissante de la cybersécurité dans la gouvernance d'entreprise.",
    "Après l'attaque NotPetya en 2017, Maersk a dû reconstruire son infrastructure IT complète. Cet incident a conduit le groupe à revoir entièrement sa stratégie de cybersécurité et à quadrupler ses investissements en sécurité.",
    "La méthodologie EBIOS Risk Manager, développée par l'ANSSI, est devenue une référence pour l'analyse des risques cyber. Elle permet d'aligner la stratégie de sécurité avec les objectifs métiers de l'organisation.",
    "Une enquête menée en 2023 a révélé que les entreprises avec un comité cybersécurité au niveau du conseil d'administration ont 43% moins de chances de subir une violation de données majeure.",
    "En 2021, le coût moyen d'une violation de données en France était de 4,24 millions d'euros selon IBM, démontrant l'impact financier crucial d'une bonne stratégie de cybersécurité."
  ],
  "Gestion des incidents": [
    "Lors de l'attaque SolarWinds en 2020, certaines organisations ont mis plus de 9 mois à détecter la compromission, illustrant l'importance d'une détection précoce dans la gestion des incidents.",
    "Le Centre Hospitalier de Versailles a dû fermer ses urgences en décembre 2022 suite à une cyberattaque. Leur plan de gestion de crise leur a permis de maintenir les soins critiques tout en isolant leurs systèmes.",
    "En 2021, Colonial Pipeline a payé une rançon de 4,4 millions de dollars suite à une attaque ransomware. Le FBI a réussi à récupérer 2,3 millions, montrant l'importance de la collaboration avec les autorités.",
    "L'entreprise Norsk Hydro a refusé de payer une rançon suite à l'attaque LockerGoga en 2019. Sa transparence et sa gestion efficace de l'incident ont été saluées comme un modèle de réponse aux cyberattaques.",
    "Après l'incident Equifax de 2017, la FTC a imposé un programme de tests de pénétration et d'audit bisannuel pour 20 ans, démontrant les conséquences réglementaires d'une mauvaise gestion d'incident."
  ],
  "RGPD": [
    "En 2023, la CNIL a infligé une amende de 60 millions d'euros à une grande entreprise française pour des violations du RGPD liées à la gestion des cookies et au consentement des utilisateurs.",
    "Une étude menée en 2022 a montré que 65% des entreprises européennes utilisent encore des clauses standards pour les transferts de données vers les États-Unis, malgré l'invalidation du Privacy Shield.",
    "Le délai moyen de notification d'une violation de données aux autorités de contrôle est passé de 72 jours en 2018 à 26 jours en 2022, montrant une meilleure conformité à l'obligation de notification de 72 heures.",
    "Un sondage de 2023 révèle que seulement 47% des PME françaises ont mis en place un registre des traitements conforme au RGPD, bien que cela soit obligatoire depuis 2018.",
    "La Cour de justice de l'UE a rendu en juillet 2022 l'arrêt Schrems II, remettant en question les transferts de données vers les pays tiers et imposant des évaluations d'impact supplémentaires."
  ],
  "Ingénierie sociale/phishing": [
    "En 2020, Twitter a subi une attaque majeure après qu'un employé ait été victime d'une attaque de vishing (phishing vocal). Les pirates ont obtenu l'accès aux outils d'administration et compromis les comptes de personnalités.",
    "Une étude de ProofPoint a révélé que plus de 96% des attaques de phishing observées en 2022 désactivaient le contenu malveillant après la première visite, rendant leur détection plus difficile.",
    "En 2021, 47% des entreprises françaises ont signalé avoir été victimes d'attaques d'ingénierie sociale visant à effectuer des virements frauduleux (Business Email Compromise).",
    "Les tests de phishing simulés montrent que le taux de clics diminue de 50% après seulement un an de formation régulière des employés aux techniques d'ingénierie sociale.",
    "En 2023, une nouvelle technique de phishing utilisant des deepfakes audio pour imiter la voix des dirigeants a été utilisée pour autoriser un transfert de 23 millions d'euros dans une entreprise européenne."
  ],
  "Sécurité de la chaîne d'approvisionnement": [
    "L'attaque SolarWinds de 2020 a compromis plus de 18 000 organisations via une mise à jour logicielle infectée, démontrant la vulnérabilité des chaînes d'approvisionnement logicielles.",
    "En 2021, l'attaque contre Kaseya a affecté entre 800 et 1 500 entreprises via leurs fournisseurs de services managés, illustrant l'effet domino dans la chaîne d'approvisionnement IT.",
    "Une étude de 2022 a révélé que seulement 34% des entreprises vérifient rigoureusement la sécurité de leurs fournisseurs de logiciels open source, malgré les risques croissants.",
    "La norme ISO 28001 fournit un cadre pour identifier les risques dans la chaîne d'approvisionnement et mettre en place des mesures de sécurité appropriées.",
    "En 2023, une vulnérabilité dans une bibliothèque JavaScript utilisée par plus de 8 millions de sites web a conduit à une compromission massive, montrant l'importance de la gestion des dépendances."
  ]
};

// Secteurs d'activité pour la génération de contexte
const secteursDActivite = [
  "Banque et Assurance",
  "Santé et Pharmaceutique",
  "Énergie et Utilities",
  "Transport et Logistique",
  "Industrie Manufacturière",
  "Commerce et Distribution",
  "Services Publics",
  "Télécommunications",
  "Aéronautique et Défense",
  "Automobile"
];

// Noms d'entreprises fictifs par secteur
const entreprisesParSecteur: {[key: string]: string[]} = {
  "Banque et Assurance": [
    "CrédiSecure", "BanqueProtect", "AssurCyber", "FinanceShield", "SécuriBank"
  ],
  "Santé et Pharmaceutique": [
    "MédiData", "PharmaSecure", "SantéProtect", "BioSécurité", "HealthGuard"
  ],
  "Énergie et Utilities": [
    "ÉnergieSecure", "ElectraProtect", "GasSafe", "HydroShield", "PowerSecurity"
  ],
  "Transport et Logistique": [
    "TransSecure", "LogiProtect", "MobileSafe", "FreightGuard", "ShipSecure"
  ],
  "Industrie Manufacturière": [
    "IndustrieSafe", "ProduSecure", "ManufactShield", "FabriProtect", "InduGuard"
  ],
  "Commerce et Distribution": [
    "CommerceSecure", "DistribSafe", "RetailProtect", "ShopGuard", "MarketSecurity"
  ],
  "Services Publics": [
    "PubliSecure", "AdminSafe", "GovProtect", "CitySecurity", "StateSafe"
  ],
  "Télécommunications": [
    "TelecomSecure", "CommSafe", "NetProtect", "DataShield", "InfoSecure"
  ],
  "Aéronautique et Défense": [
    "AéroSecurity", "DéfenseProtect", "AirSafe", "SpaceGuard", "MilSecure"
  ],
  "Automobile": [
    "AutoSecure", "MobileSecurity", "CarShield", "DriveProtect", "VéhiSafe"
  ]
};

// Interlocuteurs additionnels par expertise
const interlocuteursParExpertise: {[key: string]: Array<{name: string, role: string}>} = {
  "technique": [
    { name: "Nicolas Martin", role: "Responsable Infrastructure IT" },
    { name: "Emma Dubois", role: "Architecte Sécurité" },
    { name: "Thomas Richard", role: "Administrateur Systèmes" },
    { name: "Julie Lambert", role: "Chef de Projet IT" },
    { name: "Alexandre Petit", role: "DevSecOps Engineer" }
  ],
  "réglementaire": [
    { name: "Claire Moreau", role: "Juriste Spécialisée RGPD" },
    { name: "Philippe Bernard", role: "Responsable Conformité" },
    { name: "Marie Lefèvre", role: "DPO (Délégué à la Protection des Données)" },
    { name: "Éric Durand", role: "Auditeur Interne" },
    { name: "Sophie Rousseau", role: "Responsable Qualité et Risques" }
  ],
  "métier": [
    { name: "Laurent Girard", role: "Directeur Général" },
    { name: "Céline Robert", role: "Directrice des Opérations" },
    { name: "Stéphane Simon", role: "Chief Financial Officer" },
    { name: "Isabelle Fournier", role: "Directrice Marketing" },
    { name: "David Mercier", role: "Responsable Service Client" }
  ]
};

// Mapping des domaines vers les types d'expertise pertinents
const expertiseParDomaine: {[key: string]: string[]} = {
  "Stratégie et gouvernance": ["métier", "réglementaire", "technique"],
  "Gestion des incidents": ["technique", "métier"],
  "RGPD": ["réglementaire", "technique"],
  "Ingénierie sociale/phishing": ["technique", "métier"],
  "Sécurité de la chaîne d'approvisionnement": ["technique", "métier", "réglementaire"]
};

// Fonction pour sélectionner une anecdote aléatoire pertinente pour un domaine donné
/**
 * Sélectionne une anecdote aléatoire pertinente pour un domaine donné
 * @param domain Le domaine de cybersécurité
 * @returns Une anecdote aléatoire liée au domaine
 */
export function getRandomAnecdote(domain: string): string {
  // Trouver le domaine le plus proche si le domaine exact n'existe pas
  let targetDomain = domain;
  if (!anecdotesByCyberDomain[domain]) {
    // Chercher un domaine similaire
    const domains = Object.keys(anecdotesByCyberDomain);
    for (const d of domains) {
      if (d.toLowerCase().includes(domain.toLowerCase()) || domain.toLowerCase().includes(d.toLowerCase())) {
        targetDomain = d;
        break;
      }
    }
    
    // Si toujours pas trouvé, prendre un domaine au hasard
    if (!anecdotesByCyberDomain[targetDomain]) {
      const randomDomain = Object.keys(anecdotesByCyberDomain)[Math.floor(Math.random() * Object.keys(anecdotesByCyberDomain).length)];
      targetDomain = randomDomain;
    }
  }
  
  // Sélectionner une anecdote aléatoire pour le domaine cible
  const anecdotes = anecdotesByCyberDomain[targetDomain];
  const randomIndex = Math.floor(Math.random() * anecdotes.length);
  return anecdotes[randomIndex];
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
}> {
  // Déterminer les types d'expertise pertinents pour ce domaine
  let expertiseTypes = expertiseParDomaine[domain] || ["technique", "métier"];
  
  // Si le domaine n'est pas reconnu, utiliser tous les types d'expertise
  if (!expertiseTypes) {
    expertiseTypes = ["technique", "métier", "réglementaire"];
  }
  
  // Sélectionner 2-3 contacts pertinents (un par type d'expertise si possible)
  const selectedContacts: Array<{name: string, role: string}> = [];
  const contactCount = Math.floor(Math.random() * 2) + 2; // 2 ou 3 contacts
  
  for (const expertiseType of expertiseTypes) {
    if (selectedContacts.length >= contactCount) break;
    
    const contactsForExpertise = interlocuteursParExpertise[expertiseType];
    if (contactsForExpertise) {
      // Choisir un contact aléatoire de ce type d'expertise
      const randomIndex = Math.floor(Math.random() * contactsForExpertise.length);
      const contact = contactsForExpertise[randomIndex];
      
      // Ajouter uniquement si ce n'est pas le contact principal et s'il n'est pas déjà sélectionné
      if (contact.name !== primaryContact.name && !selectedContacts.some(c => c.name === contact.name)) {
        selectedContacts.push(contact);
      }
    }
  }
  
  // Si nous n'avons pas assez de contacts, ajouter des contacts aléatoires
  while (selectedContacts.length < contactCount) {
    // Choisir un type d'expertise au hasard
    const randomExpertiseType = ["technique", "métier", "réglementaire"][Math.floor(Math.random() * 3)];
    const contactsForExpertise = interlocuteursParExpertise[randomExpertiseType];
    
    // Choisir un contact aléatoire
    const randomIndex = Math.floor(Math.random() * contactsForExpertise.length);
    const contact = contactsForExpertise[randomIndex];
    
    // Ajouter uniquement si ce n'est pas le contact principal et s'il n'est pas déjà sélectionné
    if (contact.name !== primaryContact.name && !selectedContacts.some(c => c.name === contact.name)) {
      selectedContacts.push(contact);
    }
  }
  
  return selectedContacts;
}

/**
 * Détermine le niveau de difficulté en texte lisible
 * @param difficulty Le niveau de difficulté (Débutant, Intermédiaire, Expert)
 * @returns Une description textuelle du niveau de difficulté
 */
export function getDifficultyText(difficulty: string): string {
  switch(difficulty.toLowerCase()) {
    case 'débutant':
      return "Ce scénario introduit les concepts fondamentaux et convient aux personnes débutant dans le domaine.";
    case 'intermédiaire':
      return "Ce scénario nécessite une connaissance pratique du domaine et aborde des situations réalistes de complexité moyenne.";
    case 'expert':
      return "Ce scénario présente des défis avancés qui nécessitent une expertise approfondie et une pensée critique.";
    default:
      return "Scénario adapté à différents niveaux d'expertise en fonction de votre approche.";
  }
}

/**
 * Détermine le secteur d'activité en fonction du contact
 * @param contactName Le nom du contact principal
 * @returns Le secteur d'activité
 */
export function getSecteurActivite(contactName: string): string {
  // Utiliser les initiales du nom pour déterminer un secteur de manière déterministe
  const initials = contactName.trim().charAt(0).toUpperCase();
  const asciiValue = initials.charCodeAt(0);
  const index = asciiValue % secteursDActivite.length;
  return secteursDActivite[index];
}

/**
 * Génère un nom d'entreprise fictif en fonction du secteur d'activité
 * @param secteurActivite Le secteur d'activité
 * @returns Un nom d'entreprise fictif
 */
export function getCompanyName(secteurActivite: string): string {
  // Récupérer la liste des entreprises pour ce secteur
  const entreprises = entreprisesParSecteur[secteurActivite] || 
                     ["CyberCorp", "SecuriTech", "DataProtect", "InfoSécurité", "TechShield"];
  
  // Sélectionner une entreprise aléatoire
  const randomIndex = Math.floor(Math.random() * entreprises.length);
  return entreprises[randomIndex];
}