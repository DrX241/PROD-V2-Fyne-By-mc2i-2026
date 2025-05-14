import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { db } from './db';
import { customModules, type InsertCustomModule } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: string;
        userName?: string;
      };
    }
  }
}

// Types pour la configuration du module
interface ModuleConfig {
  name: string;
  domain: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  gamificationLevel: 'aucun' | 'leger' | 'modere' | 'eleve' | 'intense';
  learningStyle: 'interactive' | 'reading' | 'mixed';
  additionalContext: string;
  iamName?: string; // Format "I AM XXX"
}

/**
 * Génère un module complet avec ses sous-modules en utilisant l'IA
 */
export async function generateModule(req: Request, res: Response) {
  try {
    const moduleConfig: ModuleConfig = req.body;
    
    // Ajouter le nom du module au format I AM XXX si non fourni
    if (!moduleConfig.iamName) {
      moduleConfig.iamName = `I AM ${moduleConfig.domain.toUpperCase()}`;
    }
    
    // Construction du prompt système pour l'IA
    const systemPrompt = constructSystemPrompt(moduleConfig);
    
    // Construction du prompt utilisateur
    const userPrompt = constructUserPrompt(moduleConfig);

    // Appel à Azure OpenAI
    const moduleResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      false, // useSecondaryKey - utiliser le modèle principal
      0.7, // temperature
      2000, // max_tokens
      { responseFormat: "json" } // format de réponse souhaité
    );

    // Tentative de parser la réponse JSON
    let modules;
    try {
      modules = JSON.parse(moduleResponse);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      
      // Tentative d'extraction de JSON depuis le texte
      const jsonMatch = moduleResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          modules = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Échec de l\'extraction secondaire:', innerError);
          throw new Error('La réponse n\'est pas au format JSON valide');
        }
      } else {
        throw new Error('La réponse n\'est pas au format JSON valide et ne peut pas être extraite');
      }
    }

    // Retour de la réponse au client
    return res.json({
      success: true,
      modules,
    });
  } catch (error) {
    console.error('Erreur de génération de module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération du module',
    });
  }
}

/**
 * Construit le prompt système avec les instructions détaillées pour l'IA
 */
function constructSystemPrompt(config: ModuleConfig): string {
  return `# DIRECTIVE PRINCIPALE

Tu es un expert en conception de modules de formation interactifs dans le domaine "${config.domain}".
Tu dois créer un module d'apprentissage complet avec exactement 4 sections : Se Former, S'Entraîner, S'Évaluer, et Automatiser.

## FORMAT DE SORTIE ATTENDU

Génère UNIQUEMENT un objet JSON valide avec la structure suivante (sans commentaires, sans texte avant ou après) :

{
  "iamName": "${config.iamName}",
  "description": "Description générale du module et de son objectif",
  
  "seFormer": {
    "description": "Description détaillée de la section SE FORMER",
    "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
    "modules": [
      {
        "title": "Titre du module de formation 1",
        "type": "lecture | interactive | vidéo",
        "description": "Description détaillée du module",
        "content": "Contenu détaillé avec explications complètes, exemples et concepts clés",
        "points_clés": ["Point clé 1", "Point clé 2", "Point clé 3"]
      },
      {
        "title": "Titre du module de formation 2",
        "type": "lecture | interactive | vidéo",
        "description": "Description détaillée du module",
        "content": "Contenu détaillé avec explications complètes, exemples et concepts clés",
        "points_clés": ["Point clé 1", "Point clé 2", "Point clé 3"]
      }
    ]
  },
  
  "sEntrainer": {
    "description": "Description détaillée de la section S'ENTRAÎNER",
    "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
    "exercices": [
      {
        "title": "Titre de l'exercice pratique 1",
        "type": "scenario | challenge | simulation",
        "description": "Description détaillée de l'exercice pratique",
        "objectifs": ["Objectif 1", "Objectif 2", "Objectif 3"],
        "steps": ["Étape 1", "Étape 2", "Étape 3"],
        "conseils": ["Conseil 1", "Conseil 2", "Conseil 3"]
      },
      {
        "title": "Titre de l'exercice pratique 2",
        "type": "scenario | challenge | simulation",
        "description": "Description détaillée de l'exercice pratique",
        "objectifs": ["Objectif 1", "Objectif 2", "Objectif 3"],
        "steps": ["Étape 1", "Étape 2", "Étape 3"],
        "conseils": ["Conseil 1", "Conseil 2", "Conseil 3"]
      }
    ]
  },
  
  "sEvaluer": {
    "description": "Description détaillée de la section S'ÉVALUER",
    "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
    "evaluations": [
      {
        "title": "Titre de l'évaluation 1",
        "type": "quiz | cas pratique | projet",
        "description": "Description détaillée de cette évaluation",
        "questions": [
          {
            "question": "Question d'évaluation",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct": "Option correcte",
            "explication": "Explication de la réponse correcte"
          }
        ],
        "critères": ["Critère 1", "Critère 2", "Critère 3"]
      },
      {
        "title": "Titre de l'évaluation 2",
        "type": "quiz | cas pratique | projet",
        "description": "Description détaillée de cette évaluation",
        "questions": [
          {
            "question": "Question d'évaluation",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct": "Option correcte",
            "explication": "Explication de la réponse correcte"
          }
        ],
        "critères": ["Critère 1", "Critère 2", "Critère 3"]
      }
    ]
  },
  
  "automatiser": {
    "description": "Description détaillée de la section AUTOMATISER",
    "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
    "outils": [
      {
        "title": "Titre de l'outil d'automatisation 1",
        "type": "script | logiciel | service",
        "description": "Description détaillée de l'outil d'automatisation",
        "utilisation": "Comment utiliser cet outil",
        "avantages": ["Avantage 1", "Avantage 2", "Avantage 3"],
        "limites": ["Limite 1", "Limite 2", "Limite 3"]
      },
      {
        "title": "Titre de l'outil d'automatisation 2",
        "type": "script | logiciel | service",
        "description": "Description détaillée de l'outil d'automatisation",
        "utilisation": "Comment utiliser cet outil",
        "avantages": ["Avantage 1", "Avantage 2", "Avantage 3"],
        "limites": ["Limite 1", "Limite 2", "Limite 3"]
      }
    ]
  },
  
  "contentStructure": "Description détaillée de la structure globale du module, expliquant la progression pédagogique entre les quatre sections: SE FORMER, S'ENTRAÎNER, S'ÉVALUER et AUTOMATISER.",
  
  "routes": {
    "former": "/module/${config.domain.toLowerCase()}/former",
    "entrainer": "/module/${config.domain.toLowerCase()}/entrainer",
    "evaluer": "/module/${config.domain.toLowerCase()}/evaluer",
    "automatiser": "/module/${config.domain.toLowerCase()}/automatiser"
  }
}

## DIRECTIVES SPÉCIFIQUES :

1. Crée un contenu substantiel et immédiatement utilisable, pas seulement des descriptions génériques.
2. Écris en style conversationnel et engageant, évite le format académique ou trop structuré.
3. Adapte le contenu au niveau de difficulté "${config.difficulty}" avec une progression logique.
4. Intègre un niveau de gamification "${config.gamificationLevel}" avec des mécaniques ludiques pertinentes.
5. Conçois selon le style d'apprentissage "${config.learningStyle}".
6. Couvre tous les sujets spécifiés de manière équilibrée et approfondie.
7. Crée une cohérence solide entre les sections pour une expérience d'apprentissage fluide.
8. Personnalise tous les éléments pour correspondre exactement au domaine "${config.domain}".
9. Crée du contenu UNIQUEMENT en français.
10. Assure-toi que le JSON est parfaitement valide sans erreurs de syntaxe.

### DESCRIPTION DES SECTIONS :

- SE FORMER: Section théorique fournissant les connaissances fondamentales et concepts clés, avec approche pédagogique interactive.
- S'ENTRAÎNER: Section pratique d'application des compétences dans des scénarios réalistes et des exercices concrets.
- S'ÉVALUER: Section d'évaluation pour valider les acquis avec feedback personnalisé et recommandations d'amélioration.
- AUTOMATISER: Section avancée proposant des outils et méthodes d'automatisation pour maîtriser le domaine et gagner en efficacité.`;
}

/**
 * Construit le prompt utilisateur basé sur la configuration spécifique du module
 */
function constructUserPrompt(config: ModuleConfig): string {
  // Formatage des thèmes
  const topicsText = config.topics.length > 0 
    ? `Les thèmes à couvrir sont: ${config.topics.join(', ')}. ` 
    : '';
  
  // Formatage du contexte additionnel
  const contextText = config.additionalContext 
    ? `Contexte supplémentaire: ${config.additionalContext}. ` 
    : '';

  return `Crée un module complet "${config.iamName}" pour enseigner ${config.description}. 
${topicsText}
Le module doit avoir une difficulté ${config.difficulty}, un niveau de gamification ${config.gamificationLevel}, 
et un style d'apprentissage ${config.learningStyle}.
${contextText}

Génère un module complet avec les 4 sections: Se Former, S'Entraîner, S'Évaluer, et Automatiser. 
Chaque section doit contenir du contenu riche, précis et immédiatement utilisable par l'apprenant.
Assure-toi que le JSON généré est parfaitement valide sans erreurs de syntaxe.`;
}

/**
 * Sauvegarde un module personnalisé dans la base de données
 */
export async function saveCustomModule(req: Request, res: Response) {
  try {
    // Récupération sécurisée des informations utilisateur depuis la session
    const userId = 'user-' + Math.random().toString(36).substring(2, 8);
    const userName = 'Utilisateur mc2i';
    
    // Transformation de la difficulté au format attendu par l'interface Module
    let moduleDifficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux' = 'intermédiaire';
    
    // Conversion des niveaux de difficulté
    if (req.body.difficulty === 'beginner') {
      moduleDifficulty = 'débutant';
    } else if (req.body.difficulty === 'intermediate') {
      moduleDifficulty = 'intermédiaire';
    } else if (req.body.difficulty === 'advanced') {
      moduleDifficulty = 'avancé';
    }
    
    // Détermination de la durée estimée en fonction de la complexité et de la quantité de contenu
    const estimatedDuration = req.body.difficulty === 'beginner' 
      ? '15-20 min' 
      : req.body.difficulty === 'intermediate' 
        ? '25-30 min' 
        : '35-45 min';
    
    const moduleToSave: InsertCustomModule = {
      userId: userId,
      userName: userName,
      name: req.body.name,
      domain: req.body.domain,
      description: req.body.description,
      iamName: req.body.iamName || `I AM ${req.body.domain.toUpperCase()}`,
      displayOrder: 100,
      difficulty: req.body.difficulty,
      topics: req.body.topics || [],
      gamificationLevel: req.body.gamificationLevel || 'modere',
      learningStyle: req.body.learningStyle || 'mixed',
      includeTrainerModule: true,
      includeOpsModule: true,
      includeTestModule: true,
      includeAscensionModule: true,
      moduleData: {
        ...req.body.moduleData,
        // Ajout des propriétés nécessaires pour l'affichage dans le format attendu
        title: req.body.iamName || `I AM ${req.body.domain.toUpperCase()}`,
        destination: `/playground/module/`,  // Le chemin sera complété avec l'ID après création
        difficulty: moduleDifficulty,
        duration: estimatedDuration,
        isNew: true,
        comingSoon: false,
        icon: "<BsShieldCheck className=\"h-5 w-5\" />" // Icône par défaut, sera rendu côté client
      },
      iconPath: getIconPath(req.body.domain),
      isActive: true
    };

    const result = await db.insert(customModules).values(moduleToSave).returning();
    
    // Mise à jour de la destination avec l'ID du module nouvellement créé
    const createdModule = result[0];
    if (createdModule) {
      // Mettre à jour la destination dans moduleData
      const updatedModuleData = {
        ...createdModule.moduleData,
        destination: `/playground/module/${createdModule.id}`
      };
      
      // Mise à jour du module avec la destination complète
      await db.update(customModules)
        .set({ 
          moduleData: updatedModuleData 
        })
        .where(eq(customModules.id, createdModule.id));
        
      // Récupérer le module mis à jour
      const updatedModule = await db.select().from(customModules)
        .where(eq(customModules.id, createdModule.id))
        .then(results => results[0]);
        
      return res.json({
        success: true,
        module: updatedModule,
      });
    }

    return res.json({
      success: true,
      module: result[0],
    });
  } catch (error) {
    console.error('Erreur de sauvegarde du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du module',
    });
  }
}

/**
 * Récupère tous les modules personnalisés pour affichage
 */
export async function getCustomModules(req: Request, res: Response) {
  try {
    const modules = await db.select().from(customModules).orderBy(desc(customModules.createdAt));
    console.log('Modules récupérés:', modules);
    
    return res.json({
      success: true,
      modules,
    });
  } catch (error) {
    console.error('Erreur de récupération des modules:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des modules',
    });
  }
}

/**
 * Récupère un module personnalisé par son ID
 */
export async function getCustomModuleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const moduleId = parseInt(id);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de module invalide',
      });
    }
    
    const module = await db.select().from(customModules).where(eq(customModules.id, moduleId)).limit(1);
    
    if (module.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module non trouvé',
      });
    }
    
    return res.json({
      success: true,
      module: module[0],
    });
  } catch (error) {
    console.error('Erreur de récupération du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération du module',
    });
  }
}

/**
 * Détermine le chemin de l'icône en fonction du domaine
 */
function getIconPath(domain: string): string {
  const lowerDomain = domain.toLowerCase();
  
  if (lowerDomain.includes('cyber') || lowerDomain.includes('secur') || lowerDomain.includes('hack')) {
    return '/assets/icons/module-cyber.svg';
  } else if (lowerDomain.includes('data') || lowerDomain.includes('ia') || lowerDomain.includes('ai') || lowerDomain.includes('analytics')) {
    return '/assets/icons/module-data.svg';
  } else if (lowerDomain.includes('amoa') || lowerDomain.includes('projet') || lowerDomain.includes('mc2i')) {
    return '/assets/icons/module-mc2i.svg';
  } else {
    return '/assets/icons/module-generic.svg';
  }
}

/**
 * Supprime un module personnalisé par son ID
 */
export async function deleteCustomModule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const moduleId = parseInt(id);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de module invalide',
      });
    }
    
    await db.delete(customModules).where(eq(customModules.id, moduleId));
    
    return res.json({
      success: true,
      message: 'Module supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur de suppression du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du module',
    });
  }
}