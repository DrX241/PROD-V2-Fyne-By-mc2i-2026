/**
 * Service pour la génération et validation des mots de passe cachés
 * Ce service gère la création de mots de passe spécifiques au rôle de l'utilisateur
 * et la vérification de ces mots de passe lors de l'interaction
 */

import crypto from 'crypto';

// Interface pour les indices par rôle
interface RoleHints {
  [key: string]: {
    hint: string;
    password: string;
    location: string;
  }
}

/**
 * Génère un mot de passe et des indices spécifiques à un rôle
 * Les indices et mots de passe sont adaptés au rôle professionnel de l'utilisateur
 */
export function generatePasswordForRole(role: string, domain: string): RoleHints {
  // Normaliser le rôle pour correspondre à nos catégories
  const normalizedRole = normalizeRole(role);
  
  // Date du jour formatée comme MMJJ pour rendre les mots de passe dynamiques
  const currentDate = new Date();
  const dateCode = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  
  // Génération d'un hash court basé sur le rôle et le domaine
  const hash = crypto.createHash('md5').update(`${normalizedRole}-${domain}-${dateCode}`).digest('hex').substring(0, 4);
  
  // Structure pour stocker les indices par rôle
  const roleHints: RoleHints = {
    // Indices pour les RSSI
    'rssi': {
      hint: "Cherchez dans les métadonnées du document la référence à la politique ISO27001.",
      password: `SEC-${hash.toUpperCase()}`,
      location: "En-tête du document, section 'Politique de sécurité'"
    },
    
    // Indices pour les hackers éthiques
    'hacker': {
      hint: "Inspectez le code source à la recherche d'un commentaire caché.",
      password: `H4CK-${hash.toUpperCase()}`,
      location: "Commentaire HTML caché ou texte en blanc sur fond blanc"
    },
    
    // Indices pour les développeurs
    'dev': {
      hint: "Analysez le fragment de code pour trouver la variable non utilisée.",
      password: `DEV-${hash.toUpperCase()}`,
      location: "Dans une variable ou commentaire du code source"
    },
    
    // Indices pour les administrateurs système
    'admin': {
      hint: "Vérifiez les paramètres de configuration du serveur mentionnés dans le document.",
      password: `ADM-${hash.toUpperCase()}`,
      location: "Dans une ligne de commande ou un fichier de configuration"
    },
    
    // Indices pour les consultants
    'consultant': {
      hint: "Repérez l'information masquée dans le tableau d'analyse.",
      password: `CST-${hash.toUpperCase()}`,
      location: "Dans un tableau ou une matrice d'évaluation"
    },
    
    // Indices par défaut pour les autres rôles
    'default': {
      hint: "Trouvez l'information cachée dans le document pour accéder au projet.",
      password: `CYB-${hash.toUpperCase()}`,
      location: "Dans le corps du document ou en pièce jointe"
    }
  };
  
  return roleHints;
}

/**
 * Vérifie si le mot de passe fourni correspond à celui attendu pour le rôle
 */
export function validatePassword(password: string, role: string, domain: string): boolean {
  const normalizedRole = normalizeRole(role);
  const roleHints = generatePasswordForRole(role, domain);
  const expectedPassword = roleHints[normalizedRole]?.password || roleHints['default'].password;
  
  return password.trim().toUpperCase() === expectedPassword.trim().toUpperCase();
}

/**
 * Récupère l'indice approprié pour un rôle spécifique
 */
export function getHintForRole(role: string, domain: string): string {
  const normalizedRole = normalizeRole(role);
  const roleHints = generatePasswordForRole(role, domain);
  return roleHints[normalizedRole]?.hint || roleHints['default'].hint;
}

/**
 * Génère le contenu d'une pièce jointe avec un mot de passe caché, adapté au rôle
 */
export function generateAttachmentWithPassword(role: string, domain: string, scenarioTitle: string): string {
  const normalizedRole = normalizeRole(role);
  const roleHints = generatePasswordForRole(role, domain);
  const roleInfo = roleHints[normalizedRole] || roleHints['default'];
  const { password, location } = roleInfo;
  
  // Génération de contenus de pièces jointes spécifiques à chaque rôle
  // Augmentés à 200+ caractères pour plus de contexte
  switch (normalizedRole) {
    case 'rssi':
      return `CONFIDENTIEL - Politique de sécurité ISO27001 ref:${password} (version draft)
Priorité: Actions de mise en conformité requises immédiatement sur les systèmes critiques.
Mesures à prendre: Audit complet des accès privilégiés, revue des contrôles cryptographiques et mise à jour du PRA.
Validation CISO requise pour toute dérogation à cette politique. Classification: RESTREINT-ENTREPRISE.`;
      
    case 'hacker':
      return `Rapport de scan de vulnérabilités - CONFIDENTIEL
<!-- Code secret: ${password} -->
3 vulnérabilités critiques détectées, accès non-autorisé possible via injection SQL.
Vecteurs d'attaque identifiés: Authentification contournée via tokens JWT expirés, XSS stocké dans le backoffice, et vulnérabilité zero-day (CVE non attribué).
Contacter l'équipe Red Team pour détails. Criticité: ÉLEVÉE.`;
      
    case 'dev':
      return `// Code review pour déploiement urgent - CRITIQUE
// TODO: supprimer avant prod - token:${password}
function checkSecurityPolicy() { 
  // Cette fonction implémente la vérification des autorisations
  // Attention: Ne pas modifier sans revue de sécurité complète
  // Potentiel bypass détecté dans la validation des jetons
  // Version correcte disponible dans la branche 'fix-auth-bypass'
}`;
      
    case 'admin':
      return `Config serveur prod - À appliquer immédiatement - URGENT
# Clé d'authentification temporaire: ${password}
systemctl restart firewall; chmod 600 /etc/secrets/
# Les services critiques nécessitent un redémarrage après ces changements
# Vérifier les journaux syslog après application pour confirmer l'absence d'erreurs
# Validé par: Équipe Infrastructure & RSSI - Ne pas modifier ces paramètres sans autorisation`;
      
    case 'consultant':
      return `Matrice d'analyse risques/impacts - Projet ${scenarioTitle} - CONFIDENTIEL
Criticité: ÉLEVÉE | Confidentialité: C3 | ClefAccès=${password}
Actions recommandées: voir débrief complet.
Vulnérabilités identifiées dans la chaîne d'approvisionnement et les services tiers. Impact potentiel sur la continuité d'activité.
Préparer un plan de remédiation sous 5 jours ouvrés. Référence mission: ${scenarioTitle}/SEC-AUDIT-2025.`;
      
    default:
      return `Document confidentiel - Projet ${scenarioTitle} - URGENT
Information critique: ${password}
À discuter lors de notre prochaine réunion. Contactez-moi dès réception.
Ce document contient des informations privilégiées concernant le projet en cours. Toute divulgation non autorisée exposerait l'organisation à des risques significatifs.
Classification: RESTREINT - Diffusion limitée aux membres autorisés de l'équipe projet uniquement.`;
  }
}

/**
 * Normalise les différentes variantes de rôles vers nos catégories standards
 */
function normalizeRole(role: string): string {
  const roleLower = role?.toLowerCase() || '';
  
  if (!role) return 'default';
  
  if (roleLower.includes('rssi') || roleLower.includes('ciso') || roleLower.includes('responsable')) {
    return 'rssi';
  }
  
  if (roleLower.includes('hack') || roleLower.includes('pentester') || roleLower.includes('test') || roleLower.includes('audit')) {
    return 'hacker';
  }
  
  if (roleLower.includes('dev') || roleLower.includes('code') || roleLower.includes('program')) {
    return 'dev';
  }
  
  if (roleLower.includes('admin') || roleLower.includes('système') || roleLower.includes('system') || roleLower.includes('infra')) {
    return 'admin';
  }
  
  if (roleLower.includes('consult') || roleLower.includes('advisory') || roleLower.includes('conseil')) {
    return 'consultant';
  }
  
  return 'default';
}

/**
 * Génère des informations post-validation pour l'utilisateur
 * Ces informations sont fournies après que l'utilisateur a trouvé le bon mot de passe
 */
export function generatePostValidationInfo(userName: string, role: string, domain: string, company: string): any {
  const normalizedRole = normalizeRole(role);
  const normalizedDomain = domain?.toLowerCase() || '';
  
  // Budget dynamique basé sur le rôle, le domaine et un élément aléatoire pour simulation
  const budgetBase = getBudgetBase(normalizedRole, normalizedDomain);
  const budgetVariance = Math.floor(Math.random() * 15000); // Variance pour rendre les budgets moins prévisibles
  const totalBudget = budgetBase + budgetVariance;
  const formattedBudget = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalBudget);
  
  // Structure de base
  const postValidationInfo = {
    title: `Bienvenue ${userName} dans le projet`,
    responsabilites: [] as string[],
    budget: "",
    hierarchie: "",
    equipe: [] as { name: string, role: string, skills?: string }[],
  };
  
  // Personnalisation du titre en fonction du domaine
  if (normalizedDomain.includes('violation') || normalizedDomain.includes('breach')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet de gestion de violation de données`;
  } else if (normalizedDomain.includes('audit')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet d'audit de sécurité`;
  } else if (normalizedDomain.includes('ransomware') || normalizedDomain.includes('malware')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet de protection anti-rançongiciel`;
  } else if (normalizedDomain.includes('conformité') || normalizedDomain.includes('compliance')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet de mise en conformité réglementaire`;
  } else if (normalizedDomain.includes('forensic') || normalizedDomain.includes('analyse')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet d'analyse forensique`;
  } else if (normalizedDomain.includes('sensibilisation') || normalizedDomain.includes('awareness')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le programme de sensibilisation à la cybersécurité`;
  } else if (normalizedDomain.includes('risque') || normalizedDomain.includes('risk')) {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet d'évaluation des risques cyber`;
  } else {
    postValidationInfo.title = `Bienvenue ${userName} dans le projet de cybersécurité`;
  }
  
  // Responsabilités spécifiques selon le rôle et le domaine
  postValidationInfo.responsabilites = getResponsabilities(normalizedRole, normalizedDomain);
  
  // Budget adapté selon le rôle et le domaine
  postValidationInfo.budget = formattedBudget + getBudgetDescription(normalizedRole, normalizedDomain);
  
  // Hiérarchie spécifique selon le rôle
  postValidationInfo.hierarchie = getHierarchy(normalizedRole, company);
  
  // Équipe spécifique selon le rôle et le domaine
  postValidationInfo.equipe = getTeam(normalizedRole, normalizedDomain);
  
  // Ajouter des informations spécifiques à l'entreprise
  postValidationInfo.title += ` chez ${company}`;
  
  return postValidationInfo;
}

/**
 * Retourne un budget de base selon le rôle et le domaine
 */
function getBudgetBase(role: string, domain: string): number {
  // Budget de base par rôle
  const roleBudgets: Record<string, number> = {
    'rssi': 350000,
    'hacker': 120000,
    'dev': 180000,
    'admin': 220000,
    'consultant': 80000,
    'default': 150000
  };
  
  // Modificateurs de budget selon le domaine
  let domainMultiplier = 1.0;
  
  if (domain.includes('urgent') || domain.includes('critique')) {
    domainMultiplier = 1.3; // +30% pour l'urgence
  } else if (domain.includes('ransomware') || domain.includes('incident')) {
    domainMultiplier = 1.5; // +50% pour les incidents critiques
  } else if (domain.includes('audit') || domain.includes('évaluation')) {
    domainMultiplier = 0.8; // -20% pour les audits
  } else if (domain.includes('formation') || domain.includes('sensibilisation')) {
    domainMultiplier = 0.7; // -30% pour la formation
  } else if (domain.includes('conformité') || domain.includes('rgpd')) {
    domainMultiplier = 1.2; // +20% pour la conformité
  }
  
  return Math.floor(roleBudgets[role] * domainMultiplier) || roleBudgets['default'];
}

/**
 * Retourne une description du budget selon le rôle et le domaine
 */
function getBudgetDescription(role: string, domain: string): string {
  if (role === 'rssi') {
    if (domain.includes('conformité') || domain.includes('rgpd')) {
      return " pour la mise en conformité réglementaire";
    } else if (domain.includes('incident') || domain.includes('crise')) {
      return " pour la gestion de crise";
    } else {
      return " pour l'année fiscale en cours";
    }
  } else if (role === 'hacker') {
    return " pour les opérations de test d'intrusion et les outils spécialisés";
  } else if (role === 'dev') {
    return " pour l'implémentation des mécanismes de sécurité dans le code";
  } else if (role === 'admin') {
    if (domain.includes('cloud')) {
      return " pour la sécurisation des environnements cloud";
    } else {
      return " pour la sécurisation et la mise à jour de l'infrastructure";
    }
  } else if (role === 'consultant') {
    return " pour cette mission de conseil et d'accompagnement";
  } else {
    return " pour ce projet";
  }
}

/**
 * Retourne des responsabilités spécifiques selon le rôle et le domaine
 */
function getResponsabilities(role: string, domain: string): string[] {
  // Responsabilités de base par rôle
  const baseResponsibilities: Record<string, string[]> = {
    'rssi': [
      "Définir et mettre en œuvre la stratégie de sécurité globale",
      "Gérer le budget de cybersécurité et prioriser les investissements",
      "Assurer la conformité réglementaire (RGPD, NIS2, etc.)",
      "Superviser les audits de sécurité et rapporter au comité de direction"
    ],
    'hacker': [
      "Réaliser des tests d'intrusion sur les systèmes et applications",
      "Identifier et exploiter les vulnérabilités avant les attaquants",
      "Documenter les failles découvertes et proposer des correctifs",
      "Former les équipes aux techniques d'attaque et de défense"
    ],
    'dev': [
      "Intégrer la sécurité dans le cycle de développement (DevSecOps)",
      "Corriger les vulnérabilités dans le code des applications",
      "Implémenter des contrôles de sécurité (authentification, chiffrement)",
      "Collaborer aux revues de code sécurisé et effectuer des tests"
    ],
    'admin': [
      "Sécuriser l'infrastructure IT (serveurs, réseau, cloud)",
      "Gérer les droits d'accès et les identités des utilisateurs",
      "Maintenir les systèmes à jour et appliquer les correctifs",
      "Configurer et monitorer les systèmes de défense en temps réel"
    ],
    'consultant': [
      "Auditer les processus et systèmes de cybersécurité",
      "Proposer des recommandations stratégiques d'amélioration",
      "Accompagner la transformation sécuritaire de l'organisation",
      "Analyser les risques et définir des plans d'action précis"
    ],
    'default': [
      "Assurer la sécurité des systèmes d'information",
      "Participer aux projets de cybersécurité",
      "Collaborer avec les équipes techniques et métier",
      "Contribuer à la sensibilisation des utilisateurs"
    ]
  };
  
  // Responsabilités de base pour ce rôle
  let responsibilities = [...baseResponsibilities[role] || baseResponsibilities['default']];
  
  // Ajout de responsabilités spécifiques au domaine
  if (domain.includes('incident') || domain.includes('crise')) {
    responsibilities.push("Coordonner la réponse aux incidents de sécurité");
    responsibilities.push("Mettre en place des procédures de gestion de crise");
  } else if (domain.includes('conformité') || domain.includes('rgpd')) {
    responsibilities.push("Assurer la conformité aux exigences légales et réglementaires");
    responsibilities.push("Préparer la documentation pour les audits de conformité");
  } else if (domain.includes('ransomware') || domain.includes('malware')) {
    responsibilities.push("Élaborer des stratégies de protection contre les rançongiciels");
    responsibilities.push("Mettre en place des sauvegardes sécurisées et testées régulièrement");
  } else if (domain.includes('cloud')) {
    responsibilities.push("Sécuriser les environnements multi-cloud (AWS, Azure, GCP)");
    responsibilities.push("Implémenter le principe de moindre privilège pour les ressources cloud");
  } else if (domain.includes('iot') || domain.includes('industriel')) {
    responsibilities.push("Sécuriser les dispositifs IoT et systèmes industriels");
    responsibilities.push("Segmenter les réseaux pour isoler les équipements critiques");
  } else if (domain.includes('formation') || domain.includes('sensibilisation')) {
    responsibilities.push("Développer des programmes de sensibilisation adaptés aux différents métiers");
    responsibilities.push("Mesurer l'efficacité des formations par des tests pratiques");
  } else if (domain.includes('menace') || domain.includes('threat')) {
    responsibilities.push("Effectuer une veille sur les menaces émergentes et les techniques d'attaque");
    responsibilities.push("Adapter les défenses en fonction de l'évolution des menaces");
  }
  
  // Limiter à 6 responsabilités maximum
  return responsibilities.slice(0, 6);
}

/**
 * Retourne la hiérarchie spécifique selon le rôle
 */
function getHierarchy(role: string, company: string): string {
  switch (role) {
    case 'rssi':
      return `Vous rapportez directement au DSI, ${getRandomName()}, et au Comité Exécutif de ${company}. Vous avez un accès direct au PDG pour les situations de crise.`;
    case 'hacker':
      return `Vous rapportez au RSSI, ${getRandomName()}, et collaborez étroitement avec l'équipe de réponse aux incidents de ${company}.`;
    case 'dev':
      return `Vous rapportez au Lead Developer, ${getRandomName()}, avec une ligne fonctionnelle vers le RSSI. Vous êtes le référent sécurité de l'équipe de développement de ${company}.`;
    case 'admin':
      return `Vous rapportez au Directeur Infrastructure, ${getRandomName()}, et travaillez en coordination avec le RSSI de ${company}. Vous supervisez les administrateurs systèmes juniors.`;
    case 'consultant':
      return `En tant que consultant externe, vous rapportez au Comité de Pilotage du projet et au RSSI, ${getRandomName()}, de ${company}. Vous êtes le point de contact principal entre votre cabinet et le client.`;
    default:
      return `Votre position dans l'organigramme sera précisée lors de la réunion de lancement du projet avec ${getRandomName()} de ${company}.`;
  }
}

/**
 * Retourne une équipe spécifique selon le rôle et le domaine
 */
function getTeam(role: string, domain: string): Array<{ name: string, role: string, skills?: string }> {
  // Équipes de base par rôle
  const baseTeams: Record<string, Array<{ name: string, role: string, skills?: string }>> = {
    'rssi': [
      { name: "Thomas Renard", role: "Responsable Conformité", skills: "Audit, RGPD, ISO27001" },
      { name: "Julie Masson", role: "Analyste SOC", skills: "Détection, SIEM, Forensics" },
      { name: "Karim Bencherif", role: "Ingénieur Sécurité", skills: "IAM, Firewall, Réseau" }
    ],
    'hacker': [
      { name: "Alex Dupont", role: "Pentester Junior", skills: "Web, Mobile, API" },
      { name: "Sophia Chen", role: "Spécialiste Red Team", skills: "Social Engineering, Hardware" }
    ],
    'dev': [
      { name: "Marc Lefort", role: "Développeur Senior", skills: "Java, Spring Security, OAuth" },
      { name: "Amina Hadad", role: "DevOps Engineer", skills: "Docker, K8s, CI/CD" },
      { name: "Lukas Weber", role: "QA Security", skills: "SAST, DAST, Fuzzing" }
    ],
    'admin': [
      { name: "Pierre Moreau", role: "Admin Réseau", skills: "Firewalls, VPN, Segmentation" },
      { name: "Nadia Benchekroun", role: "Cloud Security Engineer", skills: "AWS, Azure, GCP" },
      { name: "Vincent Petit", role: "Admin Système", skills: "Linux, Windows, Patch Management" }
    ],
    'consultant': [
      { name: "Emma Rodriguez", role: "Consultante Senior", skills: "Gouvernance, Risques, Conformité" },
      { name: "David Kim", role: "Expert Technique", skills: "Architecture, Sécurité Cloud" }
    ],
    'default': [
      { name: "Équipe Cybersécurité", role: "Support technique", skills: "Diverses compétences techniques" }
    ]
  };
  
  // Équipe de base pour ce rôle
  let team = [...baseTeams[role] || baseTeams['default']];
  
  // Ajout de membres spécifiques selon le domaine
  if (domain.includes('incident') || domain.includes('crise')) {
    team.push({ name: "Léa Martin", role: "Coordinatrice de crise", skills: "Communication, CERT, BCP/DRP" });
  } else if (domain.includes('conformité') || domain.includes('rgpd')) {
    team.push({ name: "Antoine Vasseur", role: "Juriste spécialisé", skills: "RGPD, NIS2, Contentieux" });
  } else if (domain.includes('ransomware') || domain.includes('malware')) {
    team.push({ name: "Élodie Nguyen", role: "Experte Anti-malware", skills: "Rançongiciels, Forensique, Restauration" });
  } else if (domain.includes('cloud')) {
    team.push({ name: "Hugo Ferreira", role: "Architecte Cloud", skills: "Sécurité multi-cloud, IAM, Chiffrement" });
  } else if (domain.includes('iot') || domain.includes('industriel')) {
    team.push({ name: "Isabelle Roux", role: "Spécialiste OT/IoT", skills: "ICS, SCADA, Protocoles industriels" });
  } else if (domain.includes('formation') || domain.includes('sensibilisation')) {
    team.push({ name: "Romain Blanc", role: "Formateur sécurité", skills: "Phishing, Social engineering, Gamification" });
  } else if (domain.includes('threat') || domain.includes('menace')) {
    team.push({ name: "Sarah Dubois", role: "Analyste Threat Intel", skills: "CTI, OSINT, Dark Web" });
  }
  
  // Randomiser l'ordre de l'équipe pour plus de variété
  return shuffleArray(team);
}

/**
 * Mélange aléatoirement un tableau
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Génère un nom aléatoire pour les supérieurs hiérarchiques
 */
function getRandomName(): string {
  const firstNames = ["Michel", "Sophie", "Jean", "Marie", "Philippe", "Claire", "François", "Laure", "Alexandre", "Céline"];
  const lastNames = ["Dupont", "Martin", "Bernard", "Dubois", "Lambert", "Rousseau", "Petit", "Leroy", "Moreau", "Simon"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}