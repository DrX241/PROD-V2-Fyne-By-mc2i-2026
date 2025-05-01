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
  
  // Structure de base
  const postValidationInfo = {
    title: `Bienvenue ${userName} dans le projet`,
    responsabilites: [] as string[],
    budget: "",
    hierarchie: "",
    equipe: [] as { name: string, role: string, skills: string }[],
  };
  
  // Responsabilités selon le rôle
  switch (normalizedRole) {
    case 'rssi':
      postValidationInfo.responsabilites = [
        "Définir et mettre en œuvre la stratégie de sécurité globale",
        "Gérer le budget de cybersécurité et prioriser les investissements",
        "Assurer la conformité réglementaire (RGPD, NIS2, etc.)",
        "Superviser les audits de sécurité"
      ];
      postValidationInfo.budget = "350 000 € pour l'année fiscale";
      postValidationInfo.hierarchie = "Rapport direct au DSI et au Comité Exécutif";
      postValidationInfo.equipe = [
        { name: "Thomas Renard", role: "Responsable Conformité", skills: "Audit, RGPD, ISO27001" },
        { name: "Julie Masson", role: "Analyste SOC", skills: "Détection, SIEM, Forensics" },
        { name: "Karim Bencherif", role: "Ingénieur Sécurité", skills: "IAM, Firewall, Réseau" }
      ];
      break;
      
    case 'hacker':
      postValidationInfo.responsabilites = [
        "Réaliser des tests d'intrusion sur nos systèmes et applications",
        "Identifier et exploiter les vulnérabilités avant les attaquants",
        "Documenter les failles découvertes et proposer des correctifs",
        "Former les équipes aux techniques d'attaque"
      ];
      postValidationInfo.budget = "120 000 € pour les opérations de test et les outils";
      postValidationInfo.hierarchie = "Rapport au RSSI";
      postValidationInfo.equipe = [
        { name: "Alex Dupont", role: "Pentester Junior", skills: "Web, Mobile, API" },
        { name: "Sophia Chen", role: "Spécialiste Red Team", skills: "Social Engineering, Hardware" }
      ];
      break;
      
    case 'dev':
      postValidationInfo.responsabilites = [
        "Intégrer la sécurité dans le cycle de développement (DevSecOps)",
        "Corriger les vulnérabilités dans le code des applications",
        "Implémenter des contrôles de sécurité (authentification, chiffrement)",
        "Collaborer aux revues de code sécurisé"
      ];
      postValidationInfo.budget = "Part du budget R&D allouée à la sécurité: 180 000 €";
      postValidationInfo.hierarchie = "Rapport au Lead Developer et coordination avec le RSSI";
      postValidationInfo.equipe = [
        { name: "Marc Lefort", role: "Développeur Senior", skills: "Java, Spring Security, OAuth" },
        { name: "Amina Hadad", role: "DevOps Engineer", skills: "Docker, K8s, CI/CD" },
        { name: "Lukas Weber", role: "QA Security", skills: "SAST, DAST, Fuzzing" }
      ];
      break;
      
    case 'admin':
      postValidationInfo.responsabilites = [
        "Sécuriser l'infrastructure IT (serveurs, réseau, cloud)",
        "Gérer les droits d'accès et les identités",
        "Maintenir les systèmes à jour et appliquer les correctifs",
        "Configurer et monitorer les systèmes de défense"
      ];
      postValidationInfo.budget = "220 000 € pour l'infrastructure sécurisée";
      postValidationInfo.hierarchie = "Rapport au Directeur Infrastructure et au RSSI";
      postValidationInfo.equipe = [
        { name: "Pierre Moreau", role: "Admin Réseau", skills: "Firewalls, VPN, Segmentation" },
        { name: "Nadia Benchekroun", role: "Cloud Security Engineer", skills: "AWS, Azure, GCP" },
        { name: "Vincent Petit", role: "Admin Système", skills: "Linux, Windows, Patch Management" }
      ];
      break;
      
    case 'consultant':
      postValidationInfo.responsabilites = [
        "Auditer les processus et systèmes de cybersécurité",
        "Proposer des recommandations stratégiques d'amélioration",
        "Accompagner la transformation sécuritaire de l'organisation",
        "Analyser les risques et définir des plans d'action"
      ];
      postValidationInfo.budget = "Contrat de 80 000 € pour cette mission";
      postValidationInfo.hierarchie = "Rapport au Comité de Pilotage et au RSSI";
      postValidationInfo.equipe = [
        { name: "Emma Rodriguez", role: "Consultante Senior", skills: "Gouvernance, Risques, Conformité" },
        { name: "David Kim", role: "Expert Technique", skills: "Architecture, Sécurité Cloud" }
      ];
      break;
      
    default:
      postValidationInfo.responsabilites = [
        "Assurer la sécurité des systèmes d'information",
        "Participer aux projets de cybersécurité",
        "Collaborer avec les équipes techniques et métier",
        "Contribuer à la sensibilisation des utilisateurs"
      ];
      postValidationInfo.budget = "Budget alloué selon les projets";
      postValidationInfo.hierarchie = "À définir selon l'organigramme";
      postValidationInfo.equipe = [
        { name: "Équipe Cybersécurité", role: "Support technique", skills: "Diverses compétences techniques" }
      ];
  }
  
  // Ajouter des informations spécifiques à l'entreprise
  postValidationInfo.title += ` chez ${company}`;
  
  return postValidationInfo;
}