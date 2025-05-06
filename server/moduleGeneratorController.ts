import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { db } from './db';
import { customModules, type InsertCustomModule } from '@shared/schema';

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

    // Appel à Azure OpenAI
    const moduleResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.7, // temperature
      2000 // max_tokens
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
Vous allez créer une structure complète pour un module de formation nommé "${config.iamName}" dans le domaine ${config.domain}.

## VOTRE TÂCHE

Générez une structure de module complet avec des sous-modules cohérents et détaillés basés sur les spécifications fournies.
La réponse doit être formatée en JSON selon le schéma ci-dessous, sans aucun texte avant ou après.

## STRUCTURE DE LA RÉPONSE (JSON) :

{
  "iamName": "Nom du module principal (I AM XXX)",
  "description": "Description générale du module et de son objectif",
  
  // Si inclus dans la configuration
  "trainerModule": {
    "name": "${config.domain}TRAINER",
    "description": "Description détaillée du module d'apprentissage",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...]
  },
  
  // Si inclus dans la configuration
  "opsModule": {
    "name": "${config.domain}OPS",
    "description": "Description détaillée du module opérationnel",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...]
  },
  
  // Si inclus dans la configuration
  "testModule": {
    "name": "${config.domain}TEST",
    "description": "Description détaillée du module de test/évaluation",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...]
  },
  
  // Si inclus dans la configuration
  "ascensionModule": {
    "name": "${config.domain}ASCENSION",
    "description": "Description détaillée du module de progression avancée",
    "features": ["Caractéristique 1", "Caractéristique 2", ...],
    "contentOutline": ["Section 1", "Section 2", ...]
  },
  
  "contentStructure": "Structure globale et progression pédagogique suggérée entre les modules"
}

## DIRECTIVES SPÉCIFIQUES :

1. Adaptez le contenu au niveau de difficulté "${config.difficulty}" en créant une progression pédagogique appropriée.
2. Intégrez un niveau de gamification "${config.gamificationLevel}" avec des éléments ludiques pertinents.
3. Adoptez un style d'apprentissage "${config.learningStyle}" dans la conception des activités.
4. Chaque module doit couvrir tous les sujets spécifiés de manière équilibrée.
5. Créez une cohérence entre les modules pour une expérience d'apprentissage fluide.
6. Chaque module doit avoir entre 5 et 8 caractéristiques clés.
7. Chaque module doit avoir au moins 5 sections de contenu principales.

### DESCRIPTION DES MODULES STANDARDS :

- XXXXTrainer : Module théorique qui fournit des connaissances de base et des explications pédagogiques.
- XXXXOPS : Module pratique où l'apprenant met en œuvre des compétences dans des scénarios opérationnels.
- XXXXTest : Module d'évaluation pour tester les connaissances et compétences acquises.
- XXXXAscension : Module avancé avec des défis complexes et du contenu de niveau expert.

Votre réponse doit être directement utilisable pour développer un module d'apprentissage complet et cohérent.`;
}

/**
 * Construit le prompt utilisateur basé sur la configuration spécifique du module
 */
function constructUserPrompt(config: ModuleConfig): string {
  // Construction de la liste des modules à inclure
  const modulesToInclude = [];
  if (config.includeTrainerModule) modulesToInclude.push(`${config.domain}TRAINER`);
  if (config.includeOpsModule) modulesToInclude.push(`${config.domain}OPS`);
  if (config.includeTestModule) modulesToInclude.push(`${config.domain}TEST`);
  if (config.includeAscensionModule) modulesToInclude.push(`${config.domain}ASCENSION`);

  return `Je souhaite créer un module complet nommé "${config.iamName}" avec les caractéristiques suivantes :

- Nom: "${config.name}"
- Domaine principal: ${config.domain}
- Description: "${config.description}"
- Niveau de difficulté: ${config.difficulty}
- Sujets à couvrir: ${config.topics.map(topic => `"${topic}"`).join(', ')}
- Modules à inclure: ${modulesToInclude.join(', ')}
- Niveau de gamification: ${config.gamificationLevel}
- Style d'apprentissage préféré: ${config.learningStyle}

${config.additionalContext ? `Informations additionnelles: ${config.additionalContext}` : ''}

Veuillez créer une structure complète pour ce module d'apprentissage incluant tous les sous-modules spécifiés. 
Chaque sous-module devrait avoir une approche pédagogique cohérente, adaptée au domaine ${config.domain} et aux sujets mentionnés.

Générez la réponse au format JSON comme spécifié, avec des descriptions riches et une progression pédagogique logique.`;
}

/**
 * Sauvegarde un module personnalisé dans la base de données
 */
export async function saveCustomModule(req: Request, res: Response) {
  try {
    // Récupération des données du module et de la configuration
    const { moduleData, moduleConfig } = req.body;
    
    if (!moduleData || !moduleConfig) {
      return res.status(400).json({
        success: false,
        message: 'Données requises manquantes. Veuillez fournir moduleData et moduleConfig.'
      });
    }

    // Conversion du niveau de gamification au format compatible avec la base de données
    const gamificationLevelMap: Record<string, string> = {
      'low': 'leger',
      'medium': 'modere',
      'high': 'eleve'
    };

    // Préparation des données pour l'insertion
    const moduleToSave: InsertCustomModule = {
      userId: req.session.userId || 'anonymous', // Utilisation de l'ID utilisateur de la session ou 'anonymous' si non connecté
      userName: req.session.userName || 'Utilisateur anonyme',
      name: moduleConfig.name,
      domain: moduleConfig.domain,
      description: moduleConfig.description,
      iamName: moduleData.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`,
      difficulty: moduleConfig.difficulty,
      topics: moduleConfig.topics,
      gamificationLevel: gamificationLevelMap[moduleConfig.gamificationLevel] as any,
      learningStyle: moduleConfig.learningStyle,
      includeTrainerModule: moduleConfig.includeTrainerModule,
      includeOpsModule: moduleConfig.includeOpsModule,
      includeTestModule: moduleConfig.includeTestModule,
      includeAscensionModule: moduleConfig.includeAscensionModule,
      moduleData: moduleData,
      // Icône par défaut basée sur le domaine
      iconPath: getIconPath(moduleConfig.domain)
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
      .where({ isActive: true })
      .orderBy('displayOrder', 'asc');

    return res.status(200).json({
      success: true,
      modules
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

    const [module] = await db.select().from(customModules).where({ id: moduleId });

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