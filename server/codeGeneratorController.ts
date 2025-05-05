import { Request, Response } from 'express';
import OpenAI from 'openai';
import { rateLimiterService } from './services/rateLimiterService';
import { simpleCacheService } from './services/simpleCacheService';
import { codeSandboxService } from './services/codeSandboxService';

// Initialisation du client OpenAI avec Azure
// Le newest OpenAI model est "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': '2023-12-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
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
  autoDetectLanguage?: boolean;
}

interface LanguageFrameworkSuggestion {
  language: string;
  framework: string;
  confidence: number;
  reasoning: string;
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
 * Suggère le langage et le framework appropriés en fonction du prompt utilisateur
 */
export async function suggestLanguageAndFramework(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    
    // Vérification du rate limiting
    const rateLimitResult = await rateLimiterService.checkRateLimit({
      userId: userId || 0,
      endpoint: '/api/code-generator/suggest-language-framework',
      actionType: 'suggest_language',
      req
    });

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Limite de requêtes atteinte',
        retryAfter: rateLimitResult.retryAfter,
        message: 'Vous avez atteint la limite de requêtes. Veuillez réessayer plus tard.'
      });
    }

    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requis pour la suggestion' });
    }

    // Vérification du cache
    const cacheKey = `suggest_lang_${prompt.substring(0, 100)}`;
    const cachedResponse = await simpleCacheService.get(cacheKey, 'code_generator');
    
    if (cachedResponse) {
      console.log(`Cache hit for language suggestion: ${cacheKey.substring(0, 50)}...`);
      await simpleCacheService.logCacheHit('code_generator', 'Suggestion de langage');
      return res.json(JSON.parse(cachedResponse));
    }

    // Construction du prompt pour l'IA
    const systemPrompt = `Tu es un expert en développement logiciel qui analyse les demandes des utilisateurs pour suggérer le langage de programmation et le framework les plus appropriés pour résoudre leur problème.

Analyse la demande suivante et suggère le langage de programmation et le framework les plus adaptés. 
Considère les facteurs suivants :
1. La nature du problème à résoudre
2. Les technologies mentionnées explicitement ou implicitement
3. Les besoins en termes de performance, facilité d'implémentation ou maintenabilité
4. Les cas d'usage typiques pour différents langages et frameworks

Ta réponse doit être un objet JSON avec la structure suivante:
{
  "language": "le langage suggéré",
  "framework": "le framework suggéré ou 'none' si aucun framework n'est nécessaire",
  "confidence": un nombre entre 0 et 1 représentant ton niveau de confiance,
  "reasoning": "une brève explication de ton choix"
}`;

    const userPrompt = `Voici la demande de l'utilisateur: "${prompt}"

Analyse cette demande et suggère le langage et le framework les plus appropriés à utiliser.`;

    // Appel à l'API Azure OpenAI
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800
    } as any);

    // Parsing de la réponse
    const content = response.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'Échec de la suggestion' });
    }

    try {
      const suggestion: LanguageFrameworkSuggestion = JSON.parse(content);
      
      // Mise en cache de la réponse
      await simpleCacheService.set(cacheKey, JSON.stringify(suggestion), 24 * 60 * 60, 'code_generator', 'Suggestion de langage');
      await simpleCacheService.logCacheMiss('code_generator', 'Suggestion de langage');
      
      return res.json(suggestion);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ 
        error: 'Erreur lors du parsing de la réponse', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Error in language suggestion:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la suggestion', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
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
    if (!requestData.prompt || (!requestData.language && !requestData.autoDetectLanguage) || !requestData.level) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    // Si autoDetectLanguage est activé, on détecte automatiquement le langage et le framework
    if (requestData.autoDetectLanguage) {
      const cacheKey = `suggest_lang_${requestData.prompt.substring(0, 100)}`;
      let suggestion = null;
      
      // Vérifier si la suggestion est en cache
      const cachedSuggestion = await simpleCacheService.get(cacheKey, 'code_generator');
      if (cachedSuggestion) {
        suggestion = JSON.parse(cachedSuggestion);
      } else {
        // Appel à l'API pour obtenir une suggestion
        const systemPrompt = `Tu es un expert en développement logiciel qui analyse les demandes des utilisateurs pour suggérer le langage de programmation et le framework les plus appropriés pour résoudre leur problème.

Analyse la demande suivante et suggère le langage de programmation et le framework les plus adaptés. 
Considère les facteurs suivants :
1. La nature du problème à résoudre
2. Les technologies mentionnées explicitement ou implicitement
3. Les besoins en termes de performance, facilité d'implémentation ou maintenabilité
4. Les cas d'usage typiques pour différents langages et frameworks

Ta réponse doit être un objet JSON avec la structure suivante:
{
  "language": "le langage suggéré",
  "framework": "le framework suggéré ou 'none' si aucun framework n'est nécessaire",
  "confidence": un nombre entre 0 et 1 représentant ton niveau de confiance,
  "reasoning": "une brève explication de ton choix"
}`;

        const userPrompt = `Voici la demande de l'utilisateur: "${requestData.prompt}"

Analyse cette demande et suggère le langage et le framework les plus appropriés à utiliser.`;

        // Appel à l'API Azure OpenAI
        const response = await openai.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 800
        } as any);

        const content = response.choices[0].message.content;
        if (content) {
          try {
            suggestion = JSON.parse(content);
            // Mise en cache de la suggestion
            await simpleCacheService.set(cacheKey, JSON.stringify(suggestion), 24 * 60 * 60, 'code_generator', 'Suggestion de langage');
          } catch (error) {
            console.error('Error parsing language suggestion:', error);
          }
        }
      }
      
      // Utiliser la suggestion si disponible
      if (suggestion && suggestion.language) {
        requestData.language = suggestion.language;
        if (suggestion.framework && suggestion.framework !== 'none') {
          requestData.framework = suggestion.framework;
        }
        console.log(`Auto-detected language: ${requestData.language}, framework: ${requestData.framework || 'none'}`);
      } else {
        // Si la détection a échoué, utiliser Python comme fallback
        requestData.language = 'python';
        requestData.framework = undefined;
        console.log('Failed to auto-detect language, using Python as fallback');
      }
    }

    // Vérification du cache
    const cacheKey = `code_gen_${requestData.language}_${requestData.framework || 'none'}_${requestData.level}_${requestData.includeComments}_${requestData.includeTests}_${requestData.prompt}`;
    const cachedResponse = await simpleCacheService.get(cacheKey, 'code_generator');
    
    if (cachedResponse) {
      console.log(`Cache hit for code generation: ${cacheKey.substring(0, 50)}...`);
      await simpleCacheService.logCacheHit('code_generator', 'Génération de code');
      return res.json(JSON.parse(cachedResponse));
    }

    // Construction du système prompt
    const systemPrompt = constructSystemPrompt(requestData);
    
    // Construction du prompt utilisateur
    const userPrompt = constructUserPrompt(requestData);

    // Appel à l'API Azure OpenAI pour la génération de code
    // Avec Azure OpenAI, nous n'avons pas besoin de spécifier 'model' car il est déjà dans le baseURL
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 4000
    } as any);

    // Parsing de la réponse
    const content = response.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'Échec de la génération de code' });
    }

    try {
      const parsedResponse: CodeGenerationResponse = JSON.parse(content);
      
      // Mise en cache de la réponse
      await simpleCacheService.set(cacheKey, JSON.stringify(parsedResponse), 24 * 60 * 60, 'code_generator', 'Génération de code');
      await simpleCacheService.logCacheMiss('code_generator', 'Génération de code');
      
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
 * Génère dynamiquement des exemples de prompts pour le générateur de code
 */
export async function generatePromptExamples(req: Request, res: Response) {
  try {
    const { language = 'general', count = 8 } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    
    // Vérification du rate limiting
    const key = `user:${userId || 'anonymous'}`;
    const allowed = await rateLimiterService.check(key, 'developement');
    
    if (!allowed) {
      return res.status(429).json({
        error: 'Limite de requêtes atteinte',
        retryAfter: 60 // Attendre 60 secondes par défaut
      });
    }
    
    // Clé de cache basée sur la langue et le nombre d'exemples
    const cacheKey = `prompt_examples_${language}_${count}`;
    
    // Vérifier si nous avons déjà des exemples en cache
    const cachedExamples = await simpleCacheService.get(cacheKey, 'prompt_examples');
    if (cachedExamples) {
      await simpleCacheService.logCacheHit('prompt_examples', 'Exemples de prompts');
      return res.json({ examples: JSON.parse(cachedExamples) });
    }
    
    // Construire le prompt pour l'IA
    const systemPrompt = `Tu es un expert en programmation et en génération de code. Génère ${count} idées de projets ou de fonctionnalités de code que quelqu'un pourrait vouloir implémenter.`;
    
    let userPrompt = "Génère des idées créatives, variées et réalistes pour des projets de programmation.";
    
    if (language && language !== 'general') {
      userPrompt += ` Concentre-toi sur des projets qui seraient bien adaptés au langage ${language}.`;
    }
    
    userPrompt += ` Les idées doivent être formulées comme des instructions concises pour un générateur de code, chacune ne dépassant pas 100 caractères.
    
Réponds uniquement avec un tableau JSON d'idées, sans explications supplémentaires. Format: {"ideas": ["idée 1", "idée 2", ...]}`;
    
    try {
      // Pour Azure OpenAI, avec Azure on n'a pas besoin de spécifier le modèle car il est dans le baseURL
      const response = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 1000
      } as any);
      
      let examples: string[] = [];
      
      try {
        const content = response.choices[0]?.message?.content || "{}";
        const parsedContent = JSON.parse(content);
        
        if (Array.isArray(parsedContent.ideas)) {
          examples = parsedContent.ideas;
        } else if (Array.isArray(parsedContent)) {
          examples = parsedContent;
        } else {
          // Fallback si la structure n'est pas celle attendue
          throw new Error("Invalid response structure");
        }
      } catch (parseError) {
        console.error('Error parsing examples:', parseError);
        // Utiliser des exemples par défaut en cas d'erreur
        examples = [
          "Créer une API REST pour gérer un inventaire de produits avec authentification",
          "Développer un jeu simple de devinette de nombre en interface console",
          "Concevoir une classe pour gérer une file d'attente prioritaire",
          "Créer un script qui convertit des images PNG en JPG avec redimensionnement",
          "Implémenter un algorithme de tri fusion (merge sort)",
          "Créer un formulaire d'inscription avec validation des champs",
          "Développer un crawler web simple qui extrait les titres d'articles",
          "Créer un système de cache en mémoire avec expiration des données"
        ];
      }
      
      // Mettre en cache les exemples pour une utilisation future (1 heure)
      await simpleCacheService.set(cacheKey, JSON.stringify(examples), 60 * 60, 'prompt_examples', 'Génération d\'exemples');
      await simpleCacheService.logCacheMiss('prompt_examples', 'Exemples de prompts');
      
      res.json({ examples });
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      res.status(500).json({ 
        error: 'Error generating examples', 
        examples: [
          "Créer une API REST pour gérer un inventaire de produits avec authentification",
          "Développer un jeu simple de devinette de nombre en interface console",
          "Concevoir une classe pour gérer une file d'attente prioritaire",
          "Créer un script qui convertit des images PNG en JPG avec redimensionnement",
          "Implémenter un algorithme de tri fusion (merge sort)",
          "Créer un formulaire d'inscription avec validation des champs",
          "Développer un crawler web simple qui extrait les titres d'articles",
          "Créer un système de cache en mémoire avec expiration des données"
        ]
      });
    }
  } catch (error) {
    console.error('Error generating prompt examples:', error);
    res.status(500).json({ 
      error: 'An error occurred while generating prompt examples',
      examples: [
        "Créer une API REST pour gérer un inventaire de produits avec authentification",
        "Développer un jeu simple de devinette de nombre en interface console",
        "Concevoir une classe pour gérer une file d'attente prioritaire",
        "Créer un script qui convertit des images PNG en JPG avec redimensionnement",
        "Implémenter un algorithme de tri fusion (merge sort)",
        "Créer un formulaire d'inscription avec validation des champs",
        "Développer un crawler web simple qui extrait les titres d'articles",
        "Créer un système de cache en mémoire avec expiration des données"
      ]
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

/**
 * Exécute un code généré dans un environnement sandbox sécurisé
 */
export async function executeGeneratedCode(req: Request, res: Response) {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code ou langage manquant' });
    }
    
    // Vérification du rate limiting pour éviter les abus
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    const rateLimitResult = await rateLimiterService.checkRateLimit({
      userId: userId || 0,
      endpoint: '/api/code-generator/execute',
      actionType: 'execute_code',
      req
    });

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Limite de requêtes atteinte',
        retryAfter: rateLimitResult.retryAfter,
        message: 'Vous avez atteint la limite d\'exécution de code. Veuillez réessayer plus tard.'
      });
    }
    
    // Vérification de la sécurité - interdire certains patterns dangereux
    const dangerousPatterns = [
      /process\.exit/i,
      /require\s*\(\s*['"]child_process['"]\s*\)/i,
      /exec\s*\(/i,
      /spawn\s*\(/i,
      /fork\s*\(/i,
      /fs\.(write|append|unlink|rmdir|rm|mkdir)/i,
      /process\.env/i,
      /rm\s+-rf/i,
      /http[s]?:\/\/evil\./i,
      /new\s+Function\s*\(/i,
      /eval\s*\(/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return res.status(403).json({
          error: 'Code potentiellement dangereux détecté',
          message: 'Le code contient des instructions qui ne sont pas autorisées pour des raisons de sécurité.'
        });
      }
    }

    // Exécuter le code dans l'environnement sandbox
    console.log(`Executing ${language} code in sandbox...`);
    const executionResult = await codeSandboxService.executeCode(code, language);
    
    // Enregistrer l'exécution
    console.log(`Code execution result: ${executionResult.success ? 'success' : 'error'}`);
    
    return res.json(executionResult);
  } catch (error) {
    console.error('Error executing generated code:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'exécution du code', 
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      executionTimeMs: 0
    });
  }
}

/**
 * Améliore le code généré en corrigeant les erreurs ou en optimisant les performances
 */
export async function improveGeneratedCode(req: Request, res: Response) {
  try {
    const { code, language, executionError, improvement } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code ou langage manquant' });
    }
    
    // Vérification du rate limiting
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : undefined;
    const rateLimitResult = await rateLimiterService.checkRateLimit({
      userId: userId || 0,
      endpoint: '/api/code-generator/improve',
      actionType: 'improve_code',
      req
    });

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Limite de requêtes atteinte',
        retryAfter: rateLimitResult.retryAfter
      });
    }
    
    // Déterminer le type d'amélioration demandée
    let improvementType = improvement || 'optimize';
    let systemPrompt = `Tu es un expert en développement logiciel spécialisé dans l'amélioration de code ${language}.`;
    
    if (executionError) {
      // Si une erreur d'exécution est fournie, on demande de la corriger
      improvementType = 'fix';
      systemPrompt += `\n\nLe code fourni produit l'erreur suivante lors de l'exécution:\n${executionError}\n\nCorrige le code pour résoudre cette erreur.`;
    } else {
      // Sinon on demande une optimisation générale ou selon le type d'amélioration demandé
      switch (improvementType) {
        case 'optimize':
          systemPrompt += `\n\nOptimise le code fourni pour améliorer ses performances et sa lisibilité.`;
          break;
        case 'simplify':
          systemPrompt += `\n\nSimplifie le code fourni pour le rendre plus lisible et plus facile à maintenir.`;
          break;
        case 'document':
          systemPrompt += `\n\nAjoute une documentation détaillée au code fourni, incluant des commentaires, des docstrings, et des exemples d'utilisation.`;
          break;
        case 'test':
          systemPrompt += `\n\nAjoute des tests unitaires ou d'intégration complets pour le code fourni.`;
          break;
        default:
          systemPrompt += `\n\nAméliore le code fourni en termes de qualité, lisibilité et performances.`;
      }
    }
    
    systemPrompt += `\n\nTa réponse doit être un objet JSON avec la structure suivante:
    {
      "improvedCode": "Le code amélioré",
      "explanation": "Une explication des améliorations apportées",
      "changesMade": ["Liste des modifications effectuées"]
    }`;
    
    // Appel à l'API Azure OpenAI pour l'amélioration du code
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Voici le code ${language} à améliorer:\n\n${code}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    } as any);
    
    // Parsing de la réponse
    const content = response.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'Échec de l\'amélioration du code' });
    }
    
    try {
      const parsedResponse = JSON.parse(content);
      return res.json({
        ...parsedResponse,
        language,
        improvementType
      });
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ 
        error: 'Erreur lors du parsing de la réponse', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Error improving generated code:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'amélioration du code', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}