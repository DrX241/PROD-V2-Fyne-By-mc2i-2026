import { Request, Response } from 'express';
import { geminiService as openAIService } from './services/gemini';
import { getCached, setCached } from './services/dbCacheService';
import { db } from './db';
import { customModules, type InsertCustomModule } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Augmenter l'interface Request pour inclure la session
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
  includeTestModule: boolean;
  includeTrainerModule: boolean;
  includeOpsModule: boolean;
  includeAscensionModule: boolean;
  gamificationLevel: 'low' | 'medium' | 'high';
  learningStyle: 'interactive' | 'reading' | 'mixed';
  additionalContext: string;
  iamName: string; // Format "I AM XXX"
}

/**
 * Génère un module complet avec ses sous-modules en utilisant l'IA
 */
export async function generateModule(req: Request, res: Response) {
  try {
    const moduleConfig: ModuleConfig = req.body;
    
    // Validation des données
    if (!moduleConfig.name || !moduleConfig.domain || !moduleConfig.description || !moduleConfig.topics.length) {
      return res.status(400).json({
        success: false,
        message: 'Données de configuration incomplètes. Veuillez fournir au moins le nom, le domaine, la description et les sujets.',
      });
    }

    // Construction du prompt système pour l'IA
    const systemPrompt = constructSystemPrompt(moduleConfig);

    // Construction du prompt utilisateur
    const userPrompt = constructUserPrompt(moduleConfig);

    // Vérification du cache DB
    const cacheKey = `${moduleConfig.domain}|${moduleConfig.difficulty}|${moduleConfig.gamificationLevel}|${moduleConfig.learningStyle}|${moduleConfig.topics.sort().join(',')}`;
    const cached = await getCached(cacheKey, 'module-generator');
    if (cached) {
      return res.status(200).json({ success: true, modules: JSON.parse(cached), fromCache: true });
    }

    // Appel au LLM
    const moduleResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      false, // useSecondaryKey - utiliser le modèle principal
      0.7, // temperature
      8000, // max_tokens
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

    // Sauvegarde en cache DB (30 jours)
    await setCached(cacheKey, 'module-generator', JSON.stringify(modules), 30);

    // Retour de la réponse au client
    return res.status(200).json({
      success: true,
      modules: modules,
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
  return `Vous êtes un expert en conception de modules de formation interactifs.
Vous allez créer une structure complète pour un module de formation nommé "I AM ${config.domain.toUpperCase()}" dans le domaine ${config.domain}.

## VOTRE TÂCHE

Générez une structure de module complet avec quatre sections principales: se former, s'entraîner, s'évaluer et automatiser.
Chaque section doit être riche en contenu et immédiatement utilisable. 
La réponse doit être formatée en JSON selon le schéma spécifié, sans aucun texte avant ou après.

## STRUCTURE DE LA RÉPONSE (JSON) :

{
  "iamName": "I AM ${config.domain.toUpperCase()}",
  "description": "Description générale du module et de son objectif",
  
  "seFormer": {
    "description": "Description détaillée de la section Se Former",
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
    "description": "Description détaillée de la section S'Entraîner",
    "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
    "exercices": [
    "contentOutline": ["Section 1", "Section 2", ...],
    "sections": [
      {
        "title": "Titre de la section 1",
        "type": "scenario | challenge | interactive",
        "content": "Description détaillée du scénario pratique ou du défi, avec contexte, objectifs et instructions.",
        "steps": ["Étape 1 détaillée", "Étape 2 détaillée", ...],
        "outcomes": ["Résultat attendu 1", "Résultat attendu 2", ...],
        "tools": ["Outil ou technique 1", "Outil ou technique 2", ...]
      },
      // Plus de sections pour ce module...
    ]
  },
  
  // Si inclus dans la configuration
  "testModule": {
    "name": "${config.domain}TEST",
    "description": "Description détaillée du module de test/évaluation",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...],
    "evaluations": [
      {
        "title": "Titre de l'évaluation 1",
        "type": "questionnaire | cas pratique | mini-projet",
        "description": "Description détaillée de cette évaluation",
        "questions": [
          {
            "question": "Question d'évaluation",
            "type": "multiple_choice | open_ended | practical",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "Option correcte",
            "explanation": "Explication de la réponse correcte",
            "difficulty": "débutant | intermédiaire | avancé"
          },
          // Plus de questions...
        ],
        "rubric": ["Critère d'évaluation 1", "Critère d'évaluation 2", ...]
      },
      // Plus d'évaluations...
    ]
  },
  
  // Si inclus dans la configuration
  "ascensionModule": {
    "name": "${config.domain}ASCENSION",
    "description": "Description détaillée du module de progression avancée",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...],
    "challenges": [
      {
        "title": "Titre du défi avancé 1",
        "level": "expert | maître | élite",
        "description": "Description détaillée du défi de niveau expert",
        "scenario": "Scénario complet et contextualisé du défi",
        "objectives": ["Objectif 1", "Objectif 2", ...],
        "requirements": ["Prérequis 1", "Prérequis 2", ...],
        "success_criteria": ["Critère de réussite 1", "Critère de réussite 2", ...]
      },
      // Plus de défis...
    ]
  },
  
  "contentStructure": "Description détaillée de la structure globale et progression pédagogique entre les modules",
  
  "routes": {
    "trainer": "/module/${config.domain.toLowerCase()}/trainer",
    "ops": "/module/${config.domain.toLowerCase()}/ops",
    "test": "/module/${config.domain.toLowerCase()}/test",
    "ascension": "/module/${config.domain.toLowerCase()}/ascension"
  }
}

## DIRECTIVES SPÉCIFIQUES :

1. Créez un contenu substantiel et immédiatement utilisable, pas seulement des descriptions génériques.
2. Écrivez en style conversationnel et engageant, évitez le format académique ou trop structuré.
3. Adaptez le contenu au niveau de difficulté "${config.difficulty}" avec une progression logique.
4. Intégrez un niveau de gamification "${config.gamificationLevel}" avec des mécaniques ludiques pertinentes.
5. Concevez selon le style d'apprentissage "${config.learningStyle}".
6. Couvrez tous les sujets spécifiés de manière équilibrée et approfondie.
7. Créez une cohérence solide entre les modules pour une expérience d'apprentissage fluide.
8. Chaque module doit avoir entre 5 et 8 caractéristiques clés et au moins 3 sections complètes.

### DESCRIPTION DES MODULES STANDARDS :

- XXXXTrainer : Module théorique fournissant connaissances fondamentales et concepts clés, avec approche pédagogique interactive.
- XXXXOPS : Module pratique d'application des compétences dans des scénarios réalistes et des exercices concrets.
- XXXXTest : Module d'évaluation pour valider les acquis avec feedback personnalisé et recommandations d'amélioration.
- XXXXAscension : Module avancé proposant des défis complexes et du contenu expert pour maîtrise complète du domaine.

Le contenu généré doit être suffisamment riche et structuré pour être directement utilisable dans une application web interactive.`;
}

/**
 * Construit le prompt utilisateur basé sur la configuration spécifique du module
 */
function constructUserPrompt(config: ModuleConfig): string {
  // Construction de la liste des modules à inclure
  const modulesToInclude = [];
  if (config.includeTrainerModule) modulesToInclude.push(`${config.domain}TRAINER (Se former)`);
  if (config.includeOpsModule) modulesToInclude.push(`${config.domain}OPS (S'exercer)`);
  if (config.includeTestModule) modulesToInclude.push(`${config.domain}TEST (S'évaluer)`);
  if (config.includeAscensionModule) modulesToInclude.push(`${config.domain}ASCENSION (Se perfectionner)`);

  return `Créez un module d'apprentissage complet de type "I AM XXX" nommé "${config.iamName}" avec toutes ces caractéristiques :

## INFORMATIONS DE BASE
- Nom: "${config.name}"
- Domaine principal: ${config.domain}
- Description: "${config.description}"
- Niveau de difficulté: ${config.difficulty}
- Sujets à couvrir: ${config.topics.map(topic => `"${topic}"`).join(', ')}
- Modules à inclure: ${modulesToInclude.join(', ')}
- Niveau de gamification: ${config.gamificationLevel}
- Style d'apprentissage préféré: ${config.learningStyle}

${config.additionalContext ? `## CONTEXTE SUPPLÉMENTAIRE\n${config.additionalContext}` : ''}

## INSTRUCTIONS SPÉCIFIQUES
1. Créez un module complet formaté exactement comme les modules "I AM CYBER" ou "I AM AMOA" existants
2. Chaque section doit contenir au minimum 3 composants complets avec contenu détaillé et interactif
3. Le contenu doit être en français, engageant et conversationnel (PAS de style académique ou avec formatage markdown excessif)
4. Incluez des scénarios réalistes, études de cas et exercices pratiques adaptés au monde professionnel
5. Assurez-vous que le contenu soit immédiatement utilisable, sans placeholders ou éléments génériques
6. Pour chaque module, fournissez un parcours d'apprentissage structuré avec progression claire
7. Intégrez des éléments de gamification adaptés au niveau spécifié (${config.gamificationLevel})
8. Les sections doivent être cohérentes entre elles et former un parcours d'apprentissage complet

## STRUCTURE SOUHAITÉE
- Trainer (Apprentissage théorique): Concepts fondamentaux, explications, exemples concrets et quiz interactifs
- Ops (Application pratique): Scénarios professionnels, exercices étape par étape, outils et méthodes
- Test (Évaluation): Questionnaires variés, cas pratiques, critères d'évaluation clairs et feedback personnalisé
- Ascension (Défis experts): Challenges complexes, projets avancés, missions spécialisées de niveau professionnel

Générez un contenu riche, détaillé et prêt à l'emploi dans le format JSON spécifié, qui puisse être immédiatement intégré à la plateforme.`;
}

/**
 * Sauvegarde un module personnalisé dans la base de données
 */
export async function saveCustomModule(req: Request, res: Response) {
  try {
    console.log("Requête reçue:", JSON.stringify(req.body, null, 2));
    
    // Récupération des données du module et de la configuration
    const { moduleData, moduleConfig } = req.body;
    
    if (!moduleData) {
      return res.status(400).json({
        success: false,
        message: 'Données moduleData manquantes.'
      });
    }
    
    if (!moduleConfig) {
      return res.status(400).json({
        success: false,
        message: 'Données moduleConfig manquantes.'
      });
    }

    // Conversion du niveau de gamification au format compatible avec la base de données
    const gamificationLevelMap: Record<string, string> = {
      'low': 'leger',
      'medium': 'modere',
      'high': 'eleve'
    };

    // Préparation d'un objet conforme au schéma
    const inputData = {
      userId: moduleConfig.userId || 'anonymous',
      userName: moduleConfig.userName || 'Utilisateur anonyme',
      name: moduleConfig.name || 'Module sans nom',
      domain: moduleConfig.domain || 'general',
      description: moduleConfig.description || 'Aucune description fournie',
      iamName: `I AM ${moduleConfig.domain ? moduleConfig.domain.toUpperCase() : 'MODULE'}`,
      difficulty: (moduleConfig.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
      topics: Array.isArray(moduleConfig.topics) ? moduleConfig.topics : ['général'],
      gamificationLevel: gamificationLevelMap[moduleConfig.gamificationLevel || 'medium'] || 'modere',
      learningStyle: (moduleConfig.learningStyle || 'mixed') as 'reading' | 'interactive' | 'mixed',
      includeTrainerModule: moduleConfig.includeTrainerModule !== undefined ? moduleConfig.includeTrainerModule : true,
      includeOpsModule: moduleConfig.includeOpsModule !== undefined ? moduleConfig.includeOpsModule : true,
      includeTestModule: moduleConfig.includeTestModule !== undefined ? moduleConfig.includeTestModule : true,
      includeAscensionModule: moduleConfig.includeAscensionModule !== undefined ? moduleConfig.includeAscensionModule : true,
      moduleData: moduleData,
      iconPath: getIconPath(moduleConfig.domain || 'general')
    };
    
    // Création d'un objet InsertCustomModule à partir des données validées
    const moduleToSave: InsertCustomModule = {
      userId: inputData.userId,
      userName: inputData.userName,
      name: inputData.name,
      domain: inputData.domain,
      description: inputData.description,
      iamName: inputData.iamName,
      difficulty: inputData.difficulty,
      topics: inputData.topics,
      gamificationLevel: inputData.gamificationLevel as any,
      learningStyle: inputData.learningStyle,
      includeTrainerModule: inputData.includeTrainerModule,
      includeOpsModule: inputData.includeOpsModule,
      includeTestModule: inputData.includeTestModule,
      includeAscensionModule: inputData.includeAscensionModule,
      moduleData: inputData.moduleData,
      iconPath: inputData.iconPath
    };

    // Insertion dans la base de données
    const [savedModule] = await db.insert(customModules).values(moduleToSave).returning();

    // Retour du module sauvegardé
    return res.status(201).json({
      success: true,
      message: 'Module sauvegardé avec succès',
      module: savedModule
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du module'
    });
  }
}

/**
 * Récupère tous les modules personnalisés pour affichage
 */
export async function getCustomModules(req: Request, res: Response) {
  try {
    // Récupération de tous les modules actifs, triés par ordre d'affichage
    const modules = await db.select().from(customModules)
      .where(eq(customModules.isActive, true))
      .orderBy(customModules.displayOrder);

    console.log("Modules récupérés:", modules);

    return res.status(200).json({
      success: true,
      modules: modules || []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des modules'
    });
  }
}

/**
 * Récupère un module personnalisé par son ID
 */
export async function getCustomModuleById(req: Request, res: Response) {
  try {
    const moduleId = parseInt(req.params.id);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de module invalide'
      });
    }

    const [module] = await db.select().from(customModules).where(eq(customModules.id, moduleId));

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module non trouvé'
      });
    }

    return res.status(200).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération du module'
    });
  }
}

/**
 * Détermine le chemin de l'icône en fonction du domaine
 */
function getIconPath(domain: string): string {
  // Nettoyage et conversion du domaine en minuscules
  const normalizedDomain = domain.toLowerCase().trim();
  
  // Correspondance des domaines avec des icônes spécifiques
  const iconMap: Record<string, string> = {
    'cyber': '/assets/icons/module-cyber.svg',
    'data': '/assets/icons/module-data.svg',
    'dev': '/assets/icons/module-dev.svg',
    'cloud': '/assets/icons/module-cloud.svg',
    'amoa': '/assets/icons/module-amoa.svg',
    'ia': '/assets/icons/module-ia.svg',
    'consulting': '/assets/icons/module-consulting.svg'
  };

  // Recherche d'une correspondance partielle dans le domaine
  for (const [key, iconPath] of Object.entries(iconMap)) {
    if (normalizedDomain.includes(key)) {
      return iconPath;
    }
  }

  // Icône par défaut si aucune correspondance n'est trouvée
  return '/assets/icons/default-module.svg';
}

/**
 * Supprime un module personnalisé par son ID
 */
export async function deleteCustomModule(req: Request, res: Response) {
  try {
    const moduleId = parseInt(req.params.id);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de module invalide',
      });
    }
    
    // Vérifier si le module existe
    const [module] = await db.select().from(customModules).where(eq(customModules.id, moduleId));
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module non trouvé',
      });
    }
    
    // Protection pour ne pas supprimer les modules du système (IDs 1-6 sont réservés)
    if (moduleId <= 6) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un module système. Seuls les modules personnalisés peuvent être supprimés.',
      });
    }
    
    // Supprimer le module
    await db.delete(customModules).where(eq(customModules.id, moduleId));
    
    return res.json({
      success: true,
      message: 'Module supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du module',
    });
  }
}