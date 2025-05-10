import { Request, Response } from 'express';

// Importer le service Azure OpenAI
import { openAIService } from './services/openai';

/**
 * Interface pour la requête de génération d'outil
 */
interface ToolGenerationRequest {
  toolType: string;    // Type d'outil à générer (politique, script, checklist, etc.)
  format: string;      // Format de sortie (texte, code, checklist, etc.)
  description: string; // Description détaillée des besoins
}

/**
 * Génère un outil de cybersécurité personnalisé basé sur les préférences de l'utilisateur
 */
export async function generateCustomTool(req: Request, res: Response) {
  try {
    const { toolType, format, description }: ToolGenerationRequest = req.body;

    // Validation des entrées
    if (!toolType || !format || !description) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis: toolType, format, description"
      });
    }
    
    if (description.length < 30) {
      return res.status(400).json({
        success: false,
        message: "La description doit contenir au moins 30 caractères"
      });
    }

    // Construction du prompt pour Azure OpenAI
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la création d'outils et de documentation. Ta mission est de générer un contenu professionnel, précis et bien structuré en fonction des spécifications demandées.

Formats disponibles:
- Document Texte: document structuré avec titres, sous-titres et paragraphes
- Checklist Interactive: liste de vérification avec sections et éléments à cocher
- Script Exécutable: code commenté avec instructions d'utilisation
- Diagramme/Schéma: représentation visuelle en code ASCII ou description structurée

Voici les éléments à prendre en compte dans ta réponse:
1. Respecte scrupuleusement le format demandé
2. Adapte le contenu au contexte spécifique de l'utilisateur
3. Inclus des références aux réglementations pertinentes si applicable
4. Utilise une structure claire et professionnelle
5. Fournis des détails techniques précis et actuels

Le contenu doit être directement utilisable sans nécessiter de modifications majeures.`;

    // Traduction des types d'outils et formats pour le prompt
    const toolTypeMap: {[key: string]: string} = {
      'policy': 'Politique de Sécurité',
      'script': 'Script de Défense',
      'checklist': 'Checklist d\'Audit',
      'dashboard': 'Dashboard de Sécurité',
      'training': 'Module de Formation'
    };

    const formatMap: {[key: string]: string} = {
      'text': 'Document Texte',
      'checklist': 'Checklist Interactive',
      'code': 'Script Exécutable',
      'diagram': 'Diagramme/Schéma'
    };

    const toolTypeName = toolTypeMap[toolType] || toolType;
    const formatName = formatMap[format] || format;

    const userPrompt = `Je souhaite créer un(e) ${toolTypeName} au format ${formatName}. Voici ma demande détaillée:

${description}`;

    console.log("Génération d'outil en cours...");
    console.log(`Type: ${toolTypeName}, Format: ${formatName}`);

    // Appel à Azure OpenAI
    const result = await azureOpenAI.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'Eddy-deploy-20-02-2025-gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Analyse préliminaire pour donner un contexte supplémentaire
    const analysisResult = await azureOpenAIMini.chat.completions.create({
      model: process.env.AZURE_OPENAI_MINI_DEPLOYMENT_NAME || 'Eddy-02-2025-gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `Crée une analyse concise (2-3 phrases) expliquant ce que tu comprends de la demande suivante pour un outil de cybersécurité. Explique brièvement le type d'outil demandé, son format et son utilité. Ne génère PAS l'outil lui-même, fais seulement l'analyse.`
        },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    // Récupération des résultats
    const generatedTool = result.choices[0].message.content || "Erreur de génération du contenu";
    const toolAnalysis = analysisResult.choices[0].message.content || "Analyse non disponible";

    // Envoyer la réponse
    return res.status(200).json({
      success: true,
      data: {
        tool: generatedTool,
        analysis: toolAnalysis,
        metadata: {
          toolType: toolTypeName,
          format: formatName,
          description: description.substring(0, 100) + (description.length > 100 ? '...' : '')
        }
      }
    });

  } catch (error) {
    console.error("Erreur lors de la génération de l'outil:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de l'outil",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}