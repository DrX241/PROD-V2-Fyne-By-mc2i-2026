import { Request, Response } from 'express';
import { storage } from './storage';

// Types pour Bug Hunter
type VulnerabilityCategory = 
  | 'XSS' 
  | 'CSRF' 
  | 'SQLi' 
  | 'AuthZ' 
  | 'AuthN' 
  | 'BusinessLogic' 
  | 'SSRF'
  | 'FileUpload'
  | 'IDOR';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: VulnerabilityCategory;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  points: number;
  environment: {
    type: 'web' | 'api' | 'mobile';
    details: string;
    url?: string;
  };
  hints: string[];
  objectives: string[];
  timeLimit?: number;
  tutorial?: string;
}

interface BugReport {
  id: string;
  challengeId: string;
  userId: string;
  title: string;
  vulnerability: VulnerabilityCategory;
  severity: 'faible' | 'moyen' | 'élevé' | 'critique';
  description: string;
  stepsToReproduce: string[];
  impactDescription: string;
  proofOfConcept: string;
  submittedAt: Date;
  status: 'en attente' | 'validé' | 'rejeté' | 'en cours de revue';
  score?: number;
  feedback?: string;
}

interface UserStats {
  userId: string;
  totalPoints: number;
  rank: string;
  completedChallenges: number;
  validatedReports: number;
  rejectedReports: number;
  averageScore: number;
  badgesEarned: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  dateEarned: Date;
}

// Données de défis prédéfinies (dans une implémentation réelle, ces données seraient stockées en base de données)
const challenges: Challenge[] = [
  {
    id: 'web-store-1',
    title: 'E-commerce vulnérable - Niveau 1',
    description: 'Dans ce défi, vous explorez une boutique en ligne présentant une vulnérabilité XSS stockée dans son système de commentaires produits. Cette vulnérabilité peut permettre à un attaquant d\'injecter et d\'exécuter du code JavaScript malveillant affectant tous les visiteurs de la page.',
    category: 'XSS',
    difficulty: 'débutant',
    points: 100,
    environment: {
      type: 'web',
      details: 'Application web e-commerce avec système de commentaires',
      url: 'https://vulnerable-store-xss-1.bugbountysandbox.com/'
    },
    hints: [
      'Examinez le formulaire de commentaires sur les pages produits',
      'Essayez d\'injecter du code JavaScript simple comme une alerte',
      'Les filtres basiques sont peut-être présents, essayez de les contourner avec des variantes de balises ou d\'attributs',
      'Vérifiez comment les commentaires sont rendus dans la page, y a-t-il un échappement inapproprié?'
    ],
    objectives: [
      'Identifier la vulnérabilité XSS dans le système de commentaires',
      'Démontrer l\'exécution de code JavaScript via cette vulnérabilité',
      'Documenter le vecteur d\'attaque et les étapes pour reproduire',
      'Proposer une méthode de correction pour cette vulnérabilité'
    ],
    tutorial: "Pour ce défi, vous allez explorer comment les attaques Cross-Site Scripting (XSS) fonctionnent. Une vulnérabilité XSS se produit lorsqu'une application intègre des entrées utilisateur non filtrées dans ses pages web. Cela permet à un attaquant d'injecter des scripts qui s'exécuteront dans le navigateur des autres utilisateurs.\n\nPour commencer, naviguez dans la boutique en ligne simulée et recherchez les zones où vous pouvez soumettre du contenu, comme les formulaires de commentaires sur les produits. Essayez d'injecter du code HTML simple avec des balises script pour voir si le site est vulnérable."
  },
  {
    id: 'api-bank-1',
    title: 'API Bancaire - Niveau 1',
    description: 'Découvrez et exploitez les failles IDOR (Insecure Direct Object Reference) dans cette API bancaire simulée qui permet d\'accéder aux comptes d\'autres utilisateurs en manipulant les identifiants dans les requêtes.',
    category: 'IDOR',
    difficulty: 'intermédiaire',
    points: 200,
    environment: {
      type: 'api',
      details: 'API REST avec endpoints pour gérer des comptes bancaires',
      url: 'https://api-bank-idor-1.bugbountysandbox.com/'
    },
    hints: [
      'Analysez les identifiants dans les requêtes lors de l\'accès à votre propre compte',
      'Que se passe-t-il si vous modifiez l\'ID utilisateur dans la requête?',
      'Vérifiez si l\'API effectue une validation appropriée des autorisations',
      'Essayez d\'accéder aux transactions d\'autres utilisateurs en modifiant les paramètres de la requête'
    ],
    objectives: [
      'Identifier la vulnérabilité IDOR dans l\'API bancaire',
      'Accéder aux informations de compte d\'un autre utilisateur',
      'Démontrer comment l\'API ne vérifie pas correctement les autorisations',
      'Documenter les étapes pour reproduire et proposer une correction'
    ],
    tutorial: "Les vulnérabilités IDOR (Insecure Direct Object Reference) permettent aux attaquants d'accéder à des données en manipulant des identifiants d'objets accessibles par l'utilisateur. Dans ce défi, vous allez explorer une API bancaire qui présente potentiellement ce type de faille.\n\nCommencez par étudier les requêtes lorsque vous accédez à votre propre compte. Observez comment les ressources sont référencées dans l'URL ou les paramètres de requête. Essayez ensuite de manipuler ces identifiants pour voir si vous pouvez accéder aux données d'autres utilisateurs sans proper autorisation."
  },
  {
    id: 'admin-portal-1',
    title: 'Portail d\'administration - Niveau 1',
    description: 'Tentez de contourner l\'authentification de ce portail administratif par injection SQL. Ce portail présente une vulnérabilité dans son processus de connexion qui permet, si exploitée correctement, d\'accéder au panneau d\'administration sans identifiants valides.',
    category: 'SQLi',
    difficulty: 'avancé',
    points: 300,
    environment: {
      type: 'web',
      details: 'Interface d\'administration avec connexion et gestion des utilisateurs',
      url: 'https://admin-portal-sqli-1.bugbountysandbox.com/'
    },
    hints: [
      'Le formulaire de connexion est vulnérable aux injections SQL classiques',
      'Analysez comment la requête SQL est construite lors de la tentative de connexion',
      'Essayez d\'utiliser des caractères spéciaux comme les guillemets simples pour provoquer des erreurs',
      'Recherchez des moyens de court-circuiter la clause WHERE avec des commentaires SQL ou des opérateurs logiques'
    ],
    objectives: [
      'Identifier la vulnérabilité d\'injection SQL dans le formulaire de connexion',
      'Exploiter la vulnérabilité pour contourner l\'authentification',
      'Accéder au panneau d\'administration sans identifiants valides',
      'Documenter la vulnérabilité et proposer une solution de sécurisation'
    ],
    timeLimit: 45,
    tutorial: "L'injection SQL est une technique d'attaque permettant d'injecter du code SQL malveillant dans les requêtes exécutées par une application. Dans ce défi, vous allez explorer comment exploiter une vulnérabilité d'injection SQL pour contourner un mécanisme d'authentification.\n\nLes applications vulnérables construisent souvent des requêtes SQL en concaténant directement les entrées utilisateur. Par exemple, une requête vulnérable pourrait ressembler à ceci :\n\n```sql\nSELECT * FROM users WHERE username = 'SAISIE_UTILISATEUR' AND password = 'SAISIE_UTILISATEUR';\n```\n\nSi le système n'échappe pas correctement les entrées, vous pouvez injecter du code comme `' OR '1'='1' --` qui transformera la requête en :\n\n```sql\nSELECT * FROM users WHERE username = '' OR '1'='1' -- ' AND password = '...';\n```\n\nLa clause `OR '1'='1'` est toujours vraie, et `--` commente le reste de la requête, ce qui permet de contourner la vérification du mot de passe."
  }
];

// Données utilisateur simplifiées (dans une implémentation complète, ces données seraient stockées en base de données)
const userStats: Record<string, UserStats> = {};
const bugReports: BugReport[] = [];

/**
 * Récupère la liste des défis disponibles
 */
export async function getChallenges(req: Request, res: Response) {
  try {
    // Dans une vraie implémentation, les défis seraient filtrés par niveau ou par progression utilisateur
    let filteredChallenges = challenges;
    
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
      
    // Initialiser les statistiques utilisateur si elles n'existent pas
    if (!userStats[userId]) {
      userStats[userId] = {
        userId,
        totalPoints: 0,
        rank: 'Débutant',
        completedChallenges: 0,
        validatedReports: 0,
        rejectedReports: 0,
        averageScore: 0,
        badgesEarned: []
      };
    }
      
    // Compléter les défis avec des informations personnalisées
    filteredChallenges = challenges.map(challenge => {
      // Vérifier si l'utilisateur a déjà complété ce défi
      const userReports = bugReports.filter(
        report => report.userId === userId && report.challengeId === challenge.id && report.status === 'validé'
      );
      
      const completed = userReports.length > 0;
      
      // Logique simple pour déterminer si un défi est verrouillé
      const locked = challenge.difficulty === 'avancé' && userStats[userId].completedChallenges < 2;
      
      return {
        ...challenge,
        completed,
        locked
      };
    });
    
    res.json({ success: true, challenges: filteredChallenges });
  } catch (error) {
    console.error('Erreur lors de la récupération des défis:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Récupère les détails d'un défi spécifique
 */
export async function getChallengeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Défi non trouvé' });
    }
    
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
      
    // Vérifier si l'utilisateur a déjà complété ce défi
    const userReports = bugReports.filter(
      report => report.userId === userId && report.challengeId === challenge.id && report.status === 'validé'
    );
    
    const completed = userReports.length > 0;
    
    // Logique simple pour déterminer si un défi est verrouillé
    const locked = challenge.difficulty === 'avancé' && userStats[userId]?.completedChallenges < 2;
    
    return res.json({ 
      success: true, 
      challenge: {
        ...challenge,
        completed,
        locked
      } 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du défi:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Récupère les statistiques de l'utilisateur
 */
export async function getUserStats(req: Request, res: Response) {
  try {
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
    
    // Initialiser les statistiques utilisateur si elles n'existent pas
    if (!userStats[userId]) {
      userStats[userId] = {
        userId,
        totalPoints: 0,
        rank: 'Débutant',
        completedChallenges: 0,
        validatedReports: 0,
        rejectedReports: 0,
        averageScore: 0,
        badgesEarned: []
      };
    }
    
    res.json({ success: true, stats: userStats[userId] });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Récupère les rapports de bug de l'utilisateur
 */
export async function getUserReports(req: Request, res: Response) {
  try {
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
    
    // Filtrer les rapports de l'utilisateur et les trier par date
    const userReports = bugReports
      .filter(report => report.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    
    res.json({ success: true, reports: userReports });
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Soumet un nouveau rapport de bug
 */
export async function submitBugReport(req: Request, res: Response) {
  try {
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
    const {
      challengeId,
      title,
      vulnerability,
      severity,
      description,
      stepsToReproduce,
      impactDescription,
      proofOfConcept
    } = req.body;
    
    // Validation simple
    if (!challengeId || !title || !vulnerability || !severity || !description || !stepsToReproduce || !impactDescription) {
      return res.status(400).json({ success: false, error: 'Tous les champs obligatoires doivent être remplis' });
    }
    
    // Vérifier que le challenge existe
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Défi non trouvé' });
    }
    
    // Générer un ID pour le rapport
    const reportId = `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Créer le rapport
    const newReport: BugReport = {
      id: reportId,
      challengeId,
      userId,
      title,
      vulnerability,
      severity,
      description,
      stepsToReproduce: Array.isArray(stepsToReproduce) ? stepsToReproduce : [stepsToReproduce],
      impactDescription,
      proofOfConcept,
      submittedAt: new Date(),
      status: 'en attente'
    };
    
    // Dans une implémentation complète, le rapport serait évalué par un système automatisé
    // ou par un administrateur. Ici, nous simulons une évaluation automatique.
    setTimeout(() => {
      evaluateReport(newReport);
    }, 5000);
    
    // Ajouter le rapport à la liste
    bugReports.push(newReport);
    
    res.json({ success: true, report: newReport });
  } catch (error) {
    console.error('Erreur lors de la soumission du rapport:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Récupère les détails d'un rapport spécifique
 */
export async function getReportById(req: Request, res: Response) {
  try {
    // Pour la démonstration, on utilise un ID utilisateur fixe
    // Dans une vraie implémentation, cet ID viendrait de l'authentification
    const userId = "user123";
    const { id } = req.params;
    
    const report = bugReports.find(r => r.id === id);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Rapport non trouvé' });
    }
    
    // Vérifier que l'utilisateur est autorisé à voir ce rapport
    if (report.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * Fonction d'aide pour évaluer un rapport de bug
 * Dans une implémentation complète, cette évaluation serait plus sophistiquée
 */
async function evaluateReport(report: BugReport) {
  try {
    // Récupérer le challenge correspondant
    const challenge = challenges.find(c => c.id === report.challengeId);
    if (!challenge) return;

    // Simuler un délai pour l'évaluation
    const evaluationResult = await simulateReportEvaluation(report, challenge);
    
    // Mettre à jour le statut et le score du rapport
    const reportIndex = bugReports.findIndex(r => r.id === report.id);
    if (reportIndex !== -1) {
      bugReports[reportIndex] = {
        ...report,
        ...evaluationResult
      };
      
      // Mettre à jour les statistiques de l'utilisateur
      updateUserStats(report.userId, evaluationResult.status, challenge.points, evaluationResult.score || 0);
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation du rapport:', error);
  }
}

/**
 * Fonction d'aide pour simuler l'évaluation d'un rapport
 * Dans une vraie implémentation, cette évaluation serait basée sur une IA ou une revue humaine
 */
async function simulateReportEvaluation(report: BugReport, challenge: Challenge) {
  // Simuler une évaluation réussie dans la plupart des cas
  const passEvaluation = Math.random() > 0.2;
  
  if (passEvaluation) {
    // Score aléatoire entre 6 et 10
    const score = Math.floor(Math.random() * 5) + 6;
    
    return {
      status: 'validé' as const,
      score,
      feedback: `Bon travail! Votre rapport est précis et bien documenté. Vous avez correctement identifié la vulnérabilité ${report.vulnerability} et démontré son impact potentiel. (Score: ${score}/10)`
    };
  } else {
    return {
      status: 'rejeté' as const,
      score: 0,
      feedback: 'Malheureusement, votre rapport ne démontre pas correctement l\'exploitation de la vulnérabilité. Vérifiez que vous avez bien suivi les objectifs du défi et réessayez.'
    };
  }
}

/**
 * Fonction d'aide pour mettre à jour les statistiques de l'utilisateur
 */
function updateUserStats(userId: string, reportStatus: string, challengePoints: number, reportScore: number) {
  // Initialiser les statistiques utilisateur si elles n'existent pas
  if (!userStats[userId]) {
    userStats[userId] = {
      userId,
      totalPoints: 0,
      rank: 'Débutant',
      completedChallenges: 0,
      validatedReports: 0,
      rejectedReports: 0,
      averageScore: 0,
      badgesEarned: []
    };
  }
  
  const stats = userStats[userId];
  
  if (reportStatus === 'validé') {
    // Augmenter le nombre de défis complétés
    stats.completedChallenges += 1;
    
    // Ajouter les points du défi modulés par le score
    const pointsEarned = Math.floor(challengePoints * (reportScore / 10));
    stats.totalPoints += pointsEarned;
    
    // Augmenter le nombre de rapports validés
    stats.validatedReports += 1;
    
    // Mettre à jour le score moyen
    const totalScore = stats.averageScore * (stats.validatedReports - 1) + reportScore;
    stats.averageScore = Math.round((totalScore / stats.validatedReports) * 10) / 10;
    
    // Mettre à jour le rang en fonction des points
    if (stats.totalPoints >= 1000) {
      stats.rank = 'Expert';
    } else if (stats.totalPoints >= 500) {
      stats.rank = 'Confirmé';
    } else if (stats.totalPoints >= 200) {
      stats.rank = 'Investigateur';
    }
    
    // Potentiellement attribuer un badge pour cette réussite
    maybeAwardBadge(userId, reportScore, stats.completedChallenges);
  } else if (reportStatus === 'rejeté') {
    // Augmenter le nombre de rapports rejetés
    stats.rejectedReports += 1;
  }
}

/**
 * Fonction d'aide pour attribuer potentiellement un badge à l'utilisateur
 */
function maybeAwardBadge(userId: string, reportScore: number, completedChallenges: number) {
  const stats = userStats[userId];
  
  // Badge pour premier défi réussi
  if (completedChallenges === 1 && !stats.badgesEarned.some(b => b.id === 'first-find')) {
    stats.badgesEarned.push({
      id: 'first-find',
      name: 'Première Découverte',
      description: 'Premier rapport de vulnérabilité validé',
      iconName: 'search',
      dateEarned: new Date()
    });
  }
  
  // Badge pour un score parfait
  if (reportScore === 10 && !stats.badgesEarned.some(b => b.id === 'perfect-report')) {
    stats.badgesEarned.push({
      id: 'perfect-report',
      name: 'Rapport Parfait',
      description: 'Obtenir un score parfait de 10/10 sur un rapport',
      iconName: 'star',
      dateEarned: new Date()
    });
  }
  
  // Badge pour 5 défis réussis
  if (completedChallenges === 5 && !stats.badgesEarned.some(b => b.id === 'determined-hunter')) {
    stats.badgesEarned.push({
      id: 'determined-hunter',
      name: 'Chasseur Déterminé',
      description: 'Réussir 5 défis de bug bounty',
      iconName: 'bug',
      dateEarned: new Date()
    });
  }
}