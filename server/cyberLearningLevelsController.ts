import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Interface pour les niveaux d'apprentissage
interface LearningLevel {
  id: string;
  name: string;
  description: string;
  complexity: string;
}

interface UserLearningPreferences {
  userId: string;
  currentLevel: 'debutant' | 'intermediaire' | 'avance';
  moduleId: string;
  lastUpdated: Date;
}

// Stockage en mémoire des préférences utilisateur (en production, utiliser une base de données)
const userPreferences = new Map<string, UserLearningPreferences>();

// Définition des niveaux d'apprentissage
const learningLevels: Record<string, LearningLevel> = {
  debutant: {
    id: 'debutant',
    name: 'Débutant',
    description: 'Concepts de base, terminologie essentielle, exemples simples',
    complexity: 'Facile à comprendre'
  },
  intermediaire: {
    id: 'intermediaire',
    name: 'Intermédiaire',
    description: 'Techniques avancées, cas pratiques, analyses détaillées',
    complexity: 'Niveau entreprise'
  },
  avance: {
    id: 'avance',
    name: 'Avancé',
    description: 'Expertise technique, défis complexes, recherche de pointe',
    complexity: 'Expertise technique'
  }
};

/**
 * Obtenir les niveaux d'apprentissage disponibles
 */
export const getLearningLevels = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      levels: Object.values(learningLevels)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des niveaux d\'apprentissage'
    });
  }
};

/**
 * Obtenir les préférences d'apprentissage d'un utilisateur
 */
export const getUserLearningPreferences = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const key = `${userId}-${moduleId}`;
    
    const preferences = userPreferences.get(key) || {
      userId,
      currentLevel: 'debutant' as const,
      moduleId,
      lastUpdated: new Date()
    };

    res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des préférences utilisateur'
    });
  }
};

/**
 * Mettre à jour les préférences d'apprentissage d'un utilisateur
 */
export const updateUserLearningPreferences = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const { currentLevel } = req.body;
    
    if (!['debutant', 'intermediaire', 'avance'].includes(currentLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Niveau d\'apprentissage invalide'
      });
    }

    const key = `${userId}-${moduleId}`;
    const preferences: UserLearningPreferences = {
      userId,
      currentLevel,
      moduleId,
      lastUpdated: new Date()
    };

    userPreferences.set(key, preferences);

    res.status(200).json({
      success: true,
      preferences,
      message: `Niveau ${learningLevels[currentLevel].name} sélectionné avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des préférences'
    });
  }
};

/**
 * Générer du contenu adapté au niveau d'apprentissage
 */
export const generateAdaptedContent = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const { topic, contentType, currentLevel } = req.body;
    
    if (!topic || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'Topic et contentType sont requis'
      });
    }

    const level = currentLevel || 'debutant';
    const levelInfo = learningLevels[level];

    // Prompt adapté selon le niveau
    const levelPrompts = {
      debutant: `Expliquez ${topic} de manière très simple et accessible, comme si vous parliez à quelqu'un qui découvre la cybersécurité. Utilisez des analogies de la vie quotidienne, évitez le jargon technique, et donnez des exemples concrets et familiers.`,
      
      intermediaire: `Expliquez ${topic} avec un niveau technique intermédiaire, en supposant que l'utilisateur a des bases en informatique. Incluez des concepts techniques appropriés, des exemples d'entreprise, et des bonnes pratiques professionnelles.`,
      
      avance: `Fournissez une explication experte de ${topic}, incluant les aspects techniques avancés, les dernières recherches, les défis d'implémentation en environnement complexe, et les considérations d'architecture d'entreprise.`
    };

    const prompt = `${levelPrompts[level as keyof typeof levelPrompts]}

Type de contenu demandé: ${contentType}
Niveau ciblé: ${levelInfo.name} (${levelInfo.description})

Structurez votre réponse de manière claire et adaptée au niveau spécifié.`;

    // Générer le contenu avec Azure OpenAI
    const response = await openAIService.generateCompletion([
      {
        role: "system",
        content: "Vous êtes un expert en cybersécurité spécialisé dans la pédagogie adaptative. Votre rôle est de créer du contenu éducatif parfaitement adapté au niveau de l'apprenant."
      },
      {
        role: "user",
        content: prompt
      }
    ]);

    res.status(200).json({
      success: true,
      content: response,
      level: levelInfo,
      topic,
      contentType
    });

  } catch (error) {
    console.error('Erreur lors de la génération de contenu adapté:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de contenu'
    });
  }
};

/**
 * Actualiser le contenu d'un module selon le niveau
 */
export const refreshModuleContent = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const { currentLevel } = req.body;
    
    const level = currentLevel || 'debutant';
    const levelInfo = learningLevels[level];
    
    // Mettre à jour les préférences utilisateur
    const key = `${userId}-${moduleId}`;
    const preferences: UserLearningPreferences = {
      userId,
      currentLevel: level,
      moduleId,
      lastUpdated: new Date()
    };
    
    userPreferences.set(key, preferences);

    // Simuler l'actualisation du contenu
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: `Contenu actualisé pour le niveau ${levelInfo.name}`,
      preferences,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'actualisation du module:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'actualisation du contenu'
    });
  }
};

/**
 * Obtenir des recommandations personnalisées selon le niveau
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const key = `${userId}-${moduleId}`;
    const preferences = userPreferences.get(key);
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'Préférences utilisateur non trouvées'
      });
    }

    const level = preferences.currentLevel;
    const levelInfo = learningLevels[level];

    // Recommandations adaptées selon le niveau
    const recommendations = {
      debutant: [
        { title: "Commencez par les bases", description: "Découvrez les concepts fondamentaux", difficulty: "Facile" },
        { title: "Quiz de révision", description: "Testez vos connaissances de base", difficulty: "Facile" },
        { title: "Exercices pratiques simples", description: "Mettez en pratique avec des exemples guidés", difficulty: "Facile" }
      ],
      intermediaire: [
        { title: "Cas d'études réels", description: "Analysez des incidents de sécurité concrets", difficulty: "Modéré" },
        { title: "Simulation d'attaques", description: "Participez à des exercices de réponse aux incidents", difficulty: "Modéré" },
        { title: "Bonnes pratiques entreprise", description: "Apprenez les standards industriels", difficulty: "Modéré" }
      ],
      avance: [
        { title: "Recherche de pointe", description: "Explorez les dernières innovations en cybersécurité", difficulty: "Expert" },
        { title: "Architecture complexe", description: "Concevez des solutions de sécurité d'entreprise", difficulty: "Expert" },
        { title: "Défis techniques", description: "Résolvez des problèmes de sécurité avancés", difficulty: "Expert" }
      ]
    };

    res.status(200).json({
      success: true,
      recommendations: recommendations[level],
      currentLevel: levelInfo,
      personalizedMessage: `Recommandations personnalisées pour votre niveau ${levelInfo.name}`
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des recommandations'
    });
  }
};