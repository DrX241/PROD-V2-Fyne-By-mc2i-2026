import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Interface pour la requête du jeu BrainHacker
 */
interface BrainHackerRequest {
  message: string;
  target: {
    id: string;
    name: string;
    role: string;
    department: string;
    traits: string[];
    vulnerabilities: string[];
    description: string;
    expertise: number;
  };
  intentions: {
    urgency: number;
    credibility: number;
    emotionalAppeal: number;
    informationRequest: number;
    confidentiality: number;
  };
  attackVector: {
    id: string;
    name: string;
    description: string;
    effectiveness: number;
  };
  scenario: {
    title: string;
    description: string;
    objectives: string[];
  };
  conversationHistory: Array<{
    sender: 'player' | 'target' | 'system';
    content: string;
  }>;
}

/**
 * Gère la simulation de réponse d'une cible dans le jeu BrainHacker avec Azure OpenAI
 */
export async function simulateTargetResponse(req: Request, res: Response) {
  try {
    const data: BrainHackerRequest = req.body;

    if (!data.message || !data.target || !data.intentions) {
      return res.status(400).json({ 
        error: "Données manquantes pour la simulation" 
      });
    }

    // Construction du prompt pour GPT
    const systemPrompt = `Tu es un cybersécurité expert simulant les réactions psychologiques d'une cible d'ingénierie sociale nommée ${data.target.name} (${data.target.role}), dans un jeu éducatif. 
    
Traits de personnalité de la cible: ${data.target.traits.join(', ')}.
Vulnérabilités de la cible: ${data.target.vulnerabilities.join(', ')}.
Description: ${data.target.description}
Niveau d'expertise en cybersécurité (1-10): ${data.target.expertise}

L'attaquant utilise un vecteur d'attaque: ${data.attackVector.name}
Description du vecteur: ${data.attackVector.description}

Le joueur a les intentions suivantes (sur 100):
- Urgence: ${data.intentions.urgency}/100
- Crédibilité: ${data.intentions.credibility}/100
- Appel émotionnel: ${data.intentions.emotionalAppeal}/100
- Demande d'information: ${data.intentions.informationRequest}/100
- Confidentialité: ${data.intentions.confidentiality}/100

Les objectifs du scénario sont:
${data.scenario.objectives.map(obj => `- ${obj}`).join('\n')}

IMPORTANT: Tu dois uniquement analyser le message et réagir comme la cible réagirait (en fournissant une réponse réaliste), puis évaluer si la tentative a réussi, échoué définitivement, ou si l'échange continue.

Réponds UNIQUEMENT au format JSON suivant sans aucun autre texte autour:
{
  "message": "La réponse réaliste de la cible au message du joueur",
  "analysis": {
    "suspicionLevel": 0-10,
    "vulnerabilityExploited": "Nom de la vulnérabilité exploitée ou null",
    "psychologicalFactors": ["Liste des facteurs psychologiques exploités"],
    "success": true/false,
    "criticalFailure": true/false,
    "score": 0-100,
    "feedback": "Analyse de la technique utilisée"
  }
}`;

    // Conversion de l'historique des messages
    const conversationContext: ChatCompletionRequestMessage[] = data.conversationHistory?.map(msg => {
      const role = msg.sender === 'player' ? 'user' as const : 
                  (msg.sender === 'target' ? 'assistant' as const : 'system' as const);
      return {
        role,
        content: msg.content
      };
    }) || [];

    // Création du tableau de messages pour l'API
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationContext,
      { role: 'user', content: data.message }
    ];
    
    // Appel à Azure OpenAI
    const response = await openAIService.getChatCompletion(messages);
    
    // Analyse de la réponse
    try {
      const parsedResponse = JSON.parse(response);
      return res.json(parsedResponse);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return res.status(500).json({ 
        error: "Format de réponse invalide",
        details: parseError.message,
        fallback: {
          message: "Je ne comprends pas bien votre demande. Pourriez-vous être plus clair ?",
          analysis: {
            suspicionLevel: 5,
            vulnerabilityExploited: null,
            psychologicalFactors: [],
            success: false,
            criticalFailure: false,
            score: 30,
            feedback: "La tentative n'a pas été assez convaincante."
          }
        }
      });
    }
  } catch (error: any) {
    console.error("Erreur dans simulateTargetResponse:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la simulation de la réponse de la cible",
      details: error.message,
      fallback: {
        message: "Je ne comprends pas bien votre demande. Pourriez-vous être plus clair ?",
        analysis: {
          suspicionLevel: 5,
          vulnerabilityExploited: null,
          psychologicalFactors: [],
          success: false,
          criticalFailure: false,
          score: 30,
          feedback: "La tentative n'a pas été assez convaincante."
        }
      }
    });
  }
}

/**
 * Génère une analyse avancée des techniques d'ingénierie sociale utilisées
 */
export async function analyzePerformance(req: Request, res: Response) {
  try {
    const { conversationHistory, target, scenario } = req.body;

    if (!conversationHistory || !target || !scenario) {
      return res.status(400).json({ error: "Données manquantes pour l'analyse" });
    }

    const systemPrompt = `Tu es un expert en sécurité informatique spécialisé dans l'ingénierie sociale. Analyse cette conversation où un joueur essaie de manipuler une cible dans un jeu éducatif.

Cible: ${target.name} (${target.role})
Traits: ${target.traits.join(', ')}
Vulnérabilités: ${target.vulnerabilities.join(', ')}

Objectifs du scénario:
${scenario.objectives.map(obj => `- ${obj}`).join('\n')}

Fournis une analyse détaillée au format JSON avec:
1. Une évaluation globale
2. Les techniques d'ingénierie sociale identifiées
3. Points forts et faibles de l'approche
4. Recommandations d'amélioration
5. Un score sur 100`;

    // Convertir l'historique de conversation en format adapté pour le modèle
    const formattedHistory = conversationHistory.map(msg => {
      return {
        role: msg.sender === 'player' ? 'user' : (msg.sender === 'target' ? 'assistant' : 'system'),
        content: msg.content
      };
    });

    const response = await openAIService.getChatCompletion([
      { role: 'system', content: systemPrompt },
      ...formattedHistory
    ], "json_object");

    const content = response.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(content);

    return res.json(analysis);
  } catch (error) {
    console.error("Erreur dans analyzePerformance:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'analyse de la performance",
      details: error.message 
    });
  }
}