import { Request, Response } from 'express';
import OpenAI from 'openai';
import { rateLimiterService } from './services/rateLimiterService';
import { cacheService } from './services/cacheService';

// Initialisation du client OpenAI
// Le newest OpenAI model est "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types pour la requête
interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  includeComments: boolean;
  includeTests: boolean;
  additionalContext?: string;
}

// Types pour la réponse
interface CodeGenerationResponse {
  code: string;
  explanation: string;
  language: string;
  framework?: string;
  fileExtension: string;
  suggestedFileStructure?: Array<{
    name: string;
    type: 'file' | 'directory';
    content?: string;
  }>;
  references?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Traite une demande de génération de code
 */
export async function generateCode(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    
    // Vérification du rate limiting
    const rateLimitResult = await rateLimiterService.checkRateLimit({
      userId: userId || 0,
      endpoint: '/api/code-generator/generate',
      actionType: 'generate_code',
      req
    });

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Limite de requêtes atteinte',
        retryAfter: rateLimitResult.retryAfter,
        message: 'Vous avez atteint la limite de génération de code. Veuillez réessayer plus tard.'
      });
    }

    const requestData: CodeGenerationRequest = req.body;
    
    // Vérification des données requises
    if (!requestData.prompt || !requestData.language || !requestData.level) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Vérification du cache
    const cacheKey = `code_gen_${requestData.language}_${requestData.framework || 'none'}_${requestData.level}_${requestData.includeComments}_${requestData.includeTests}_${requestData.prompt}`;
    const cachedResponse = await cacheService.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache hit for code generation: ${cacheKey.substring(0, 50)}...`);
      await cacheService.logCacheHit('code_generator', 'Génération de code');
      return res.json(JSON.parse(cachedResponse));
    }

    // Construction du système prompt
    const systemPrompt = constructSystemPrompt(requestData);
    
    // Construction du prompt utilisateur
    const userPrompt = constructUserPrompt(requestData);

    // Appel à l'API OpenAI pour la génération de code
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 4000
    });

    // Parsing de la réponse
    const content = response.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'Échec de la génération de code' });
    }

    try {
      const parsedResponse: CodeGenerationResponse = JSON.parse(content);
      
      // Mise en cache de la réponse
      await cacheService.set(cacheKey, JSON.stringify(parsedResponse), 24 * 60 * 60); // Cache pour 24 heures
      await cacheService.logCacheMiss('code_generator', 'Génération de code');
      
      return res.json(parsedResponse);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ 
        error: 'Erreur lors du parsing de la réponse', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Error in code generation:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération de code', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Construit le prompt système pour la génération de code
 */
function constructSystemPrompt(requestData: CodeGenerationRequest): string {
  return `Tu es un expert en développement logiciel spécialisé dans la génération de code. Tu vas générer du code ${requestData.language}${requestData.framework && requestData.framework !== 'none' ? ` avec le framework ${requestData.framework}` : ''} en fonction des spécifications de l'utilisateur.

Niveau de complexité demandé: ${requestData.level} (${getLevelDescription(requestData.level)})
${requestData.includeComments ? 'Inclure des commentaires détaillés dans le code.' : 'Limiter les commentaires au minimum.'}
${requestData.includeTests ? 'Inclure des tests unitaires ou d\'intégration appropriés.' : 'Ne pas inclure de tests.'}

Ta réponse doit être un objet JSON avec la structure suivante:
{
  "code": "Le code source complet",
  "explanation": "Une explication détaillée du code",
  "language": "Le langage de programmation utilisé",
  "framework": "Le framework utilisé (si applicable)",
  "fileExtension": "L'extension de fichier appropriée (ex: .py, .js, etc.)",
  "suggestedFileStructure": [
    {
      "name": "Nom du fichier ou dossier",
      "type": "file ou directory",
      "content": "Contenu du fichier (si type=file)"
    }
  ],
  "references": [
    {
      "title": "Titre de la référence",
      "url": "URL vers la documentation ou ressource"
    }
  ]
}

Le code doit être fonctionnel, maintenable et suivre les bonnes pratiques. Assure-toi que le code est correct syntaxiquement et logiquement.`;
}

/**
 * Construit le prompt utilisateur pour la génération de code
 */
function constructUserPrompt(requestData: CodeGenerationRequest): string {
  let prompt = `Je souhaite générer du code ${requestData.language}`;
  
  if (requestData.framework && requestData.framework !== 'none') {
    prompt += ` avec le framework ${requestData.framework}`;
  }
  
  prompt += ` pour: ${requestData.prompt}`;
  
  if (requestData.additionalContext) {
    prompt += `\n\nContexte supplémentaire: ${requestData.additionalContext}`;
  }
  
  return prompt;
}

/**
 * Retourne une description textuelle du niveau de complexité
 */
function getLevelDescription(level: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (level) {
    case 'beginner':
      return 'Code simple avec des commentaires explicatifs, évitant les concepts avancés';
    case 'intermediate':
      return 'Code modérément complexe avec bonnes pratiques et structures appropriées';
    case 'advanced':
      return 'Code optimisé et sophistiqué pouvant inclure des patterns avancés et des optimisations';
    default:
      return '';
  }
}

/**
 * Récupère l'historique de génération de code d'un utilisateur
 */
export async function getCodeGenerationHistory(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    // Dans un environnement de production, cette fonction récupérerait
    // l'historique des générations de code depuis une base de données
    // Pour l'instant, nous renvoyons un tableau vide
    
    return res.json({ history: [] });
  } catch (error) {
    console.error('Error fetching code generation history:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'historique', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Sauvegarde un code généré dans la bibliothèque personnelle de l'utilisateur
 */
export async function saveGeneratedCode(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const { code, language, title, description } = req.body;
    
    if (!code || !language || !title) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    // Dans un environnement de production, cette fonction sauvegarderait
    // le code généré dans une base de données
    // Pour l'instant, nous simulons une réponse réussie
    
    return res.json({ 
      success: true, 
      message: 'Code sauvegardé avec succès',
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving generated code:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la sauvegarde du code', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}