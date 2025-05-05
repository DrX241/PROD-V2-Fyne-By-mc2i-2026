import { BestPractice } from '../context/GameContext';

// Définition des bonnes pratiques de cybersécurité
export const bestPractices: BestPractice[] = [
  {
    id: 'bp-password-complexity',
    title: 'Politique de mots de passe complexes',
    description: 'Utilisez des mots de passe d\'au moins 12 caractères contenant des majuscules, des minuscules, des chiffres et des caractères spéciaux. Mettez en place une politique de mot de passe exigeant le changement périodique.',
    category: 'passwords',
    importance: 'critical'
  },
  {
    id: 'bp-mfa',
    title: 'Authentification à deux facteurs (A2F)',
    description: 'Activez l\'authentification à deux facteurs pour tous les comptes sensibles, en particulier pour les accès VPN, admin et cloud. Cela ajoute une couche de sécurité supplémentaire même en cas de compromission du mot de passe.',
    category: 'passwords',
    importance: 'critical'
  },
  {
    id: 'bp-phishing-awareness',
    title: 'Formation contre le phishing',
    description: 'Formez régulièrement les employés à reconnaître les tentatives de phishing. Apprenez-leur à vérifier les adresses email, à ne pas cliquer sur des liens suspects et à signaler les emails suspects.',
    category: 'phishing',
    importance: 'high'
  },
  {
    id: 'bp-email-filtering',
    title: 'Filtrage des emails malveillants',
    description: 'Mettez en place des solutions de filtrage d\'emails pour bloquer automatiquement les tentatives de phishing et les pièces jointes malveillantes avant qu\'elles n\'atteignent les boîtes de réception des employés.',
    category: 'phishing',
    importance: 'high'
  },
  {
    id: 'bp-data-encryption',
    title: 'Chiffrement des données sensibles',
    description: 'Chiffrez toutes les données sensibles, que ce soit au repos ou en transit. Utilisez des protocoles comme TLS pour les communications et le chiffrement au niveau des disques pour le stockage.',
    category: 'data',
    importance: 'critical'
  },
  {
    id: 'bp-data-classification',
    title: 'Classification des données',
    description: 'Établissez un système de classification des données (public, interne, confidentiel, restreint) et appliquez des contrôles de sécurité appropriés selon le niveau de sensibilité.',
    category: 'data',
    importance: 'medium'
  },
  {
    id: 'bp-device-updates',
    title: 'Mise à jour régulière des systèmes',
    description: 'Maintenez tous les systèmes d\'exploitation, applications et firmwares à jour. Appliquez rapidement les correctifs de sécurité et mettez en place un processus de gestion des mises à jour.',
    category: 'devices',
    importance: 'high'
  },
  {
    id: 'bp-endpoint-protection',
    title: 'Protection des terminaux',
    description: 'Installez des solutions de protection des terminaux (antivirus, EDR) sur tous les appareils de l\'entreprise. Configurez ces outils pour effectuer des analyses régulières et bloquer les logiciels malveillants.',
    category: 'devices',
    importance: 'high'
  },
  {
    id: 'bp-network-segmentation',
    title: 'Segmentation du réseau',
    description: 'Divisez votre réseau en zones distinctes avec différents niveaux d\'accès et de contrôle. Cela limite la propagation latérale en cas de compromission d\'une partie du réseau.',
    category: 'network',
    importance: 'high'
  },
  {
    id: 'bp-firewall-configuration',
    title: 'Configuration des pare-feu',
    description: 'Configurez correctement les pare-feu réseau en appliquant le principe du moindre privilège. Bloquez tout le trafic par défaut et n\'autorisez que les communications nécessaires.',
    category: 'network',
    importance: 'critical'
  },
  {
    id: 'bp-access-control',
    title: 'Contrôle d\'accès basé sur les rôles',
    description: 'Implémentez un contrôle d\'accès basé sur les rôles (RBAC) pour limiter l\'accès aux systèmes et aux données uniquement aux personnes qui en ont besoin pour leur travail.',
    category: 'general',
    importance: 'high'
  },
  {
    id: 'bp-security-awareness',
    title: 'Sensibilisation à la sécurité',
    description: 'Organisez régulièrement des formations de sensibilisation à la sécurité pour tous les employés. Couvrez les menaces actuelles, les bonnes pratiques et les procédures de signalement des incidents.',
    category: 'general',
    importance: 'medium'
  },
  {
    id: 'bp-incident-response',
    title: 'Plan de réponse aux incidents',
    description: 'Développez et testez un plan de réponse aux incidents de sécurité. Définissez clairement les rôles, les responsabilités et les procédures à suivre en cas de violation de données ou d\'attaque.',
    category: 'general',
    importance: 'high'
  },
  {
    id: 'bp-backup-strategy',
    title: 'Stratégie de sauvegarde 3-2-1',
    description: 'Implémentez une stratégie de sauvegarde 3-2-1 : conservez au moins 3 copies de vos données, sur 2 types de supports différents, avec 1 copie hors site. Testez régulièrement la restauration.',
    category: 'data',
    importance: 'critical'
  },
  {
    id: 'bp-usb-restriction',
    title: 'Restriction des périphériques USB',
    description: 'Limitez ou bloquez l\'utilisation de périphériques USB non autorisés. Mettez en place des politiques de contrôle des périphériques pour prévenir les fuites de données et l\'introduction de malwares.',
    category: 'devices',
    importance: 'medium'
  },
];

// Fonction pour récupérer une bonne pratique par ID
export const getBestPracticeById = (id: string): BestPractice | undefined => {
  return bestPractices.find(practice => practice.id === id);
};

// Fonction pour récupérer des bonnes pratiques par catégorie
export const getBestPracticesByCategory = (category: string): BestPractice[] => {
  return bestPractices.filter(practice => practice.category === category);
};

// Fonction pour récupérer des bonnes pratiques par niveau d'importance
export const getBestPracticesByImportance = (importance: string): BestPractice[] => {
  return bestPractices.filter(practice => practice.importance === importance);
};