import { Request, Response } from 'express';
import openaiContentGenerator, { 
  GeneratedModuleContent, 
  GeneratedQuizQuestion, 
  GeneratedExercise 
} from '../services/openaiContentGenerator';

/**
 * Catégories disponibles pour les modules
 */
export type ModuleCategory = 'fondamentaux' | 'intelligence_artificielle' | 'sql' | 'python' | 'data_engineering';

/**
 * Niveaux de difficulté
 */
export type DifficultyLevel = 'débutant' | 'intermédiaire' | 'avancé';

/**
 * Structure pour un module
 */
export interface Module {
  id: string;
  title: string;
  description: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  duration: string;
  thumbnail?: string;
  content?: GeneratedModuleContent;
  createdAt: Date;
  updatedAt: Date;
}

// Cache temporaire pour les modules (en production, à stocker en base de données)
let cachedModules: Record<string, Module> = {};

/**
 * Génère ou récupère un module d'apprentissage
 */
export async function getOrGenerateModule(req: Request, res: Response) {
  try {
    const { id, regenerate } = req.params;
    
    // Si le module existe en cache et qu'on ne demande pas de le régénérer
    if (cachedModules[id] && !regenerate) {
      return res.json({ success: true, module: cachedModules[id] });
    }
    
    // Sinon, on génère le contenu
    const { topic, category, difficulty } = req.body;

    if (!topic || !category || !difficulty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres topic, category et difficulty sont requis' 
      });
    }

    // Configuration pour la génération de contenu
    const withCode = category === 'python' || category === 'sql' || category === 'data_engineering';
    const numSections = difficulty === 'débutant' ? 3 : difficulty === 'intermédiaire' ? 4 : 5;
    const numQuizQuestions = difficulty === 'débutant' ? 3 : difficulty === 'intermédiaire' ? 4 : 5;
    const numExercises = withCode ? (difficulty === 'débutant' ? 1 : 2) : 0;
    
    // Générer le contenu
    const content = await openaiContentGenerator.generateModuleContent(
      topic,
      difficulty,
      numSections,
      numQuizQuestions,
      numExercises,
      withCode
    );
    
    // Créer le module
    const newModule: Module = {
      id: id || `module-${Date.now()}`,
      title: content.title,
      description: content.introduction.substring(0, 150) + '...',
      category: category as ModuleCategory,
      difficulty: difficulty as DifficultyLevel,
      duration: `${Math.max(15, numSections * 5 + numQuizQuestions * 2 + numExercises * 5)} min`,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mettre en cache
    cachedModules[newModule.id] = newModule;
    
    return res.json({ success: true, module: newModule });
  } catch (error) {
    console.error('Erreur lors de la génération du module:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du module',
      error: (error as Error).message
    });
  }
}

/**
 * Récupère tous les modules disponibles
 */
export async function getModules(req: Request, res: Response) {
  try {
    const { category } = req.query;
    
    let modules = Object.values(cachedModules);
    
    if (category) {
      modules = modules.filter(module => module.category === category);
    }
    
    return res.json({ success: true, modules });
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des modules',
      error: (error as Error).message
    });
  }
}

/**
 * Génère un feedback personnalisé pour une réponse à un quiz
 */
export async function generateQuizFeedback(req: Request, res: Response) {
  try {
    const { question, correctAnswer, userAnswer, isCorrect } = req.body;
    
    if (!question || correctAnswer === undefined || !userAnswer || isCorrect === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres question, correctAnswer, userAnswer et isCorrect sont requis' 
      });
    }
    
    const feedback = await openaiContentGenerator.generateQuizFeedback(
      question,
      correctAnswer,
      userAnswer,
      isCorrect
    );
    
    return res.json({ success: true, feedback });
  } catch (error) {
    console.error('Erreur lors de la génération du feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du feedback',
      error: (error as Error).message
    });
  }
}

/**
 * Évalue un code soumis pour un exercice
 */
export async function evaluateCodeSubmission(req: Request, res: Response) {
  try {
    const { instructions, expectedSolution, userCode } = req.body;
    
    if (!instructions || !expectedSolution || !userCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres instructions, expectedSolution et userCode sont requis' 
      });
    }
    
    const evaluation = await openaiContentGenerator.evaluateCodeSubmission(
      instructions,
      expectedSolution,
      userCode
    );
    
    return res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Erreur lors de l\'évaluation du code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'évaluation du code',
      error: (error as Error).message
    });
  }
}

/**
 * Génère un nouveau module selon des critères spécifiques
 */
export async function generateNewModule(req: Request, res: Response) {
  try {
    const { topic, category, difficulty } = req.body;
    
    if (!topic || !category || !difficulty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres topic, category et difficulty sont requis' 
      });
    }
    
    // Configuration pour la génération de contenu
    const withCode = category === 'python' || category === 'sql' || category === 'data_engineering';
    const numSections = difficulty === 'débutant' ? 3 : difficulty === 'intermédiaire' ? 4 : 5;
    const numQuizQuestions = difficulty === 'débutant' ? 3 : difficulty === 'intermédiaire' ? 4 : 5;
    const numExercises = withCode ? (difficulty === 'débutant' ? 1 : 2) : 0;
    
    // Générer le contenu
    const content = await openaiContentGenerator.generateModuleContent(
      topic,
      difficulty as DifficultyLevel,
      numSections,
      numQuizQuestions,
      numExercises,
      withCode
    );
    
    // Créer le module
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: content.title,
      description: content.introduction.substring(0, 150) + '...',
      category: category as ModuleCategory,
      difficulty: difficulty as DifficultyLevel,
      duration: `${Math.max(15, numSections * 5 + numQuizQuestions * 2 + numExercises * 5)} min`,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mettre en cache
    cachedModules[newModule.id] = newModule;
    
    return res.json({ success: true, module: newModule });
  } catch (error) {
    console.error('Erreur lors de la génération du module:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du module',
      error: (error as Error).message
    });
  }
}

export default {
  getOrGenerateModule,
  getModules,
  generateQuizFeedback,
  evaluateCodeSubmission,
  generateNewModule
};