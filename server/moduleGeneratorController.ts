import { Request, Response } from 'express';
import { openAIService } from './services/openai';

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