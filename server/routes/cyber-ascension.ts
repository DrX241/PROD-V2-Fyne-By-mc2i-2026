import { Request, Response, Router } from 'express';
import { openAIService } from '../../I_AM_CYBER/services/openai';
import { AscensionThemeDetails, LevelChallenge, LevelAttempt, UserAscensionProgress } from '../../client/src/types/cyber-ascension';

const router = Router();

// Données temporaires des thèmes (à remplacer par une base de données)
const availableThemes: AscensionThemeDetails[] = [
  {
    id: 'securite-reseau',
    name: 'Sécurité Réseau',
    description: 'Maîtrisez les principes de défense du réseau de l\'entreprise contre les attaques internes et externes',
    icon: 'network-wired',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Description générée par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: [],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#3B82F6' // blue-500
  },
  {
    id: 'cyber-defense',
    name: 'Cyber Défense',
    description: 'Développez des stratégies de protection contre les attaques avancées et persistantes',
    icon: 'shield-check',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Description générée par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: [],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#10B981' // emerald-500
  },
  {
    id: 'securite-cloud',
    name: 'Sécurité Cloud',
    description: 'Apprenez à sécuriser efficacement les infrastructures et applications cloud',
    icon: 'cloud',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Description générée par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: [],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#6366F1' // indigo-500
  },
  {
    id: 'osint',
    name: 'OSINT',
    description: 'Découvrez les techniques d\'investigation en sources ouvertes et leur application en cybersécurité',
    icon: 'search',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Description générée par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: [],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#F59E0B' // amber-500
  },
  {
    id: 'gouvernance-cyber',
    name: 'Gouvernance Cyber',
    description: 'Développez les compétences nécessaires pour établir un cadre de gouvernance efficace en cybersécurité',
    icon: 'clipboard-list',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Description générée par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: [],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#8B5CF6' // violet-500
  }
];

// Récupérer tous les thèmes disponibles
router.get('/themes', async (req: Request, res: Response) => {
  try {
    // Simuler la récupération des thèmes depuis la base de données
    res.json({
      success: true,
      themes: availableThemes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des thèmes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des thèmes'
    });
  }
});

// Récupérer les détails d'un thème spécifique
router.get('/themes/:themeId', async (req: Request, res: Response) => {
  try {
    const { themeId } = req.params;
    
    // Trouver le thème demandé
    const theme = availableThemes.find(theme => theme.id === themeId);
    
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Thème non trouvé'
      });
    }
    
    res.json({
      success: true,
      theme
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du thème'
    });
  }
});

// Récupérer les détails d'un niveau spécifique d'un thème
router.get('/themes/:themeId/levels/:levelId', async (req: Request, res: Response) => {
  try {
    const { themeId, levelId } = req.params;
    
    // Trouver le thème demandé
    const theme = availableThemes.find(theme => theme.id === themeId);
    
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Thème non trouvé'
      });
    }
    
    // Trouver le niveau demandé
    const level = theme.levels.find(level => level.id === parseInt(levelId));
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé'
      });
    }
    
    // Enrichissement des objectifs s'ils sont vides
    if (!level.objectives || level.objectives.length === 0) {
      level.objectives = [
        "Comprendre les concepts clés du module",
        "Appliquer les connaissances à des scénarios réels",
        "Évaluer correctement les risques associés"
      ];
    }
    
    // Utiliser l'IA pour générer dynamiquement le contenu du niveau
    // Note: Dans une implémentation réelle, vous pourriez avoir une cache pour éviter
    // de régénérer le contenu à chaque fois
    const challenge = await generateLevelChallenge(theme, level);
    
    res.json({
      success: true,
      level,
      challenge
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du niveau:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du niveau'
    });
  }
});

// Soumettre une tentative de niveau
router.post('/attempts', async (req: Request, res: Response) => {
  try {
    const attemptData: LevelAttempt = req.body;
    
    // Vérifier que les données nécessaires sont présentes
    if (!attemptData.levelId || !attemptData.themeId) {
      return res.status(400).json({
        success: false,
        message: 'Données de tentative incomplètes'
      });
    }
    
    // Simuler la vérification des réponses et le calcul du score
    // Dans une implémentation réelle, vous vérifieriez les réponses par rapport aux défis générés
    const success = Math.random() > 0.3; // Simulation de réussite/échec
    const score = success ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30) + 20;
    
    // Mise à jour des données utilisateur (simulation)
    // Dans une vraie implémentation, vous mettriez à jour la base de données
    
    // Créer un objet de progression mis à jour
    const updatedProgress: Partial<UserAscensionProgress> = {
      totalXp: 1000 + score, // XP simulée
      completedLevels: [{
        themeId: attemptData.themeId,
        levelId: attemptData.levelId,
        score,
        completedAt: Date.now()
      }]
    };
    
    // Vérifier si un niveau suivant doit être débloqué
    // Si le niveau est réussi, on devrait débloquer le niveau suivant dans une vraie implémentation
    
    res.json({
      success: true,
      attempt: {
        ...attemptData,
        endTime: Date.now(),
        score,
        success
      },
      updatedProgress
    });
  } catch (error) {
    console.error('Erreur lors de la soumission de la tentative:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission de la tentative'
    });
  }
});

// Récupérer la progression de l'utilisateur
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Simuler la récupération des données de progression
    // Dans une vraie implémentation, vous les récupéreriez depuis la base de données
    const progress: UserAscensionProgress = {
      userId,
      totalXp: 1200,
      rank: 'Novice',
      badges: ['first-level-completed', 'quick-learner'],
      completedLevels: [],
      currentTheme: 'securite-reseau',
      currentLevel: 1
    };
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression'
    });
  }
});

// Endpoint simplifié pour la progression (sans userId)
router.get('/progress', async (req: Request, res: Response) => {
  try {
    // Simulation d'un utilisateur connecté
    const progress: UserAscensionProgress = {
      userId: 'user123',
      totalXp: 1200,
      rank: 'Novice',
      badges: ['first-level-completed', 'quick-learner'],
      completedLevels: [],
      currentTheme: 'securite-reseau', 
      currentLevel: 1
    };
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression'
    });
  }
});

// Générer un nouveau thème personnalisé
router.post('/themes/custom', async (req: Request, res: Response) => {
  try {
    const { title, description, keywords } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Titre et description requis pour générer un thème personnalisé'
      });
    }
    
    // Utiliser l'IA pour générer un nouveau thème basé sur les entrées utilisateur
    const customTheme = await generateCustomTheme(title, description, keywords);
    
    res.json({
      success: true,
      theme: customTheme
    });
  } catch (error) {
    console.error('Erreur lors de la génération du thème personnalisé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du thème personnalisé'
    });
  }
});

// Fonction pour générer dynamiquement le contenu d'un niveau avec l'IA
async function generateLevelChallenge(theme: AscensionThemeDetails, level: any): Promise<LevelChallenge> {
  // Construire le prompt pour l'IA
  const prompt = `Génère un niveau de formation en cybersécurité sur le thème "${theme.name}" pour un niveau de difficulté ${level.difficulty}/5 (niveau ${level.id} sur 15).
Le contenu doit inclure:
1. Une introduction au concept principal
2. Un scénario réaliste
3. 3-5 questions de quiz avec leurs réponses
4. 2-3 étapes de simulation avec différentes options et feedback
5. Des ressources complémentaires

Format: JSON structuré selon le type LevelChallenge défini dans notre application.`;

  try {
    // Appeler Azure OpenAI pour générer le contenu
    const response = await openAIService.getChatCompletion([
      { role: "system", content: "Tu es un expert en cybersécurité qui crée du contenu éducatif interactif." },
      { role: "user", content: prompt }
    ]);

    let challenge: LevelChallenge;
    
    try {
      // Traiter la réponse comme du texte et tenter d'extraire un JSON
      if (typeof response === 'string') {
        const content = response;
        // Extraire le JSON de la réponse (au cas où l'IA inclurait du texte explicatif)
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          challenge = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback si le format n'est pas correct
          challenge = createFallbackChallenge(theme, level);
        }
      } else {
        console.error('Réponse API inattendue:', response);
        challenge = createFallbackChallenge(theme, level);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du challenge généré:', error);
      challenge = createFallbackChallenge(theme, level);
    }
    
    return challenge;
  } catch (error) {
    console.error('Erreur lors de la génération du challenge:', error);
    return createFallbackChallenge(theme, level);
  }
}

// Fonction pour générer un challenge de secours si l'IA échoue
function createFallbackChallenge(theme: AscensionThemeDetails, level: any): LevelChallenge {
  return {
    id: `${theme.id}-${level.id}`,
    title: `${theme.name} - Niveau ${level.id}`,
    description: `Ce niveau vous permet de développer vos compétences en ${theme.name}`,
    type: 'quiz',
    content: {
      introduction: `Bienvenue au niveau ${level.id} du thème ${theme.name}. Ce module a été conçu pour renforcer vos compétences en cybersécurité.`,
      scenario: "Un scénario sera généré dynamiquement par l'IA lors de votre prochaine tentative.",
      questions: [
        {
          id: "q1",
          question: "Question exemple qui sera remplacée par l'IA",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: 0,
          explanation: "Explication de la réponse."
        }
      ],
      resources: [
        {
          title: "Guide de cybersécurité",
          type: "article",
          content: "Des ressources seront générées par l'IA lors de votre prochaine tentative."
        }
      ]
    }
  };
}

// Fonction pour générer un thème personnalisé avec l'IA
async function generateCustomTheme(title: string, description: string, keywords?: string[]): Promise<AscensionThemeDetails> {
  // Construire le prompt pour l'IA
  const keywordsText = keywords && keywords.length > 0 
    ? `avec les concepts clés suivants: ${keywords.join(', ')}` 
    : '';

  const prompt = `Crée un thème de formation en cybersécurité intitulé "${title}" avec la description suivante: "${description}" ${keywordsText}.
Génère:
1. Un identifiant unique basé sur le titre (slug)
2. Un nom court pour le thème
3. Une description détaillée
4. Une icône appropriée (nom d'une icône simple)
5. Titre et description pour 15 niveaux de difficulté progressive
6. Une couleur thématique (code hexadécimal)

Format: JSON structuré selon le type AscensionThemeDetails défini dans notre application.`;

  try {
    // Appeler Azure OpenAI pour générer le contenu
    const response = await openAIService.getChatCompletion([
      { role: "system", content: "Tu es un expert en cybersécurité qui crée du contenu éducatif interactif." },
      { role: "user", content: prompt }
    ]);

    let customTheme: AscensionThemeDetails;
    
    try {
      // Traiter la réponse comme du texte et tenter d'extraire un JSON
      if (typeof response === 'string') {
        const content = response;
        // Extraire le JSON de la réponse (au cas où l'IA inclurait du texte explicatif)
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          customTheme = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback si le format n'est pas correct
          customTheme = createFallbackTheme(title, description);
        }
      } else {
        console.error('Réponse API inattendue:', response);
        customTheme = createFallbackTheme(title, description);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du thème généré:', error);
      customTheme = createFallbackTheme(title, description);
    }
    
    return customTheme;
  } catch (error) {
    console.error('Erreur lors de la génération du thème:', error);
    return createFallbackTheme(title, description);
  }
}

// Fonction pour générer un thème de secours si l'IA échoue
function createFallbackTheme(title: string, description: string): AscensionThemeDetails {
  const id = title.toLowerCase().replace(/[^\w]+/g, '-');
  
  return {
    id,
    name: title,
    description,
    icon: 'shield',
    levels: Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Niveau ${i + 1}`,
      description: 'Ce niveau sera généré par l\'IA',
      difficulty: Math.min(5, Math.ceil((i + 1) / 3)) as 1 | 2 | 3 | 4 | 5,
      unlocked: i === 0,
      completed: false,
      objectives: ['Objectif à générer'],
      timeEstimate: '15-20 min',
      xpReward: 100 + (i * 20)
    })),
    progress: 0,
    unlockedLevels: 1,
    totalLevels: 15,
    themeColor: '#3B82F6' // blue-500 par défaut
  };
}

export default router;