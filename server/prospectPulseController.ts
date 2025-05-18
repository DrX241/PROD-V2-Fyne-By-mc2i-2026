import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openai';

/**
 * Types pour le module ProspectPulse
 */
interface ClientProfile {
  id: string;
  type: 'pressé' | 'hostile' | 'indécis' | 'technique' | 'débutant';
  personality: string;
  context: string;
  initialMessage: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'client';
  timestamp: Date;
}

interface SimulationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  clientProfile: ClientProfile;
  timeLimit: number;
  responseTimeLimit: number;
  completed: boolean;
  score?: {
    reactivité: number;
    clarté: number;
    impact: number;
    conclusion: number;
    total: number;
  };
  feedback?: string;
}

/**
 * Génère un message client en utilisant Azure OpenAI
 */
export async function generateClientMessage(req: Request, res: Response) {
  try {
    const { userMessage, clientProfile, sessionHistory, isTimeout } = req.body;

    if (!userMessage && !isTimeout) {
      return res.status(400).json({ error: 'Message utilisateur requis' });
    }

    if (!clientProfile) {
      return res.status(400).json({ error: 'Profil client requis' });
    }

    // Construction du contexte pour l'IA
    let prompt = `Tu es un client du profil suivant: ${clientProfile.personality}. 
Contexte: ${clientProfile.context}.
${isTimeout ? "L'utilisateur n'a pas répondu dans le temps imparti. Tu es impatient et tu insistes pour avoir une réponse." : ""}

Voici l'historique de la conversation:
`;

    // Ajouter l'historique de la conversation
    if (sessionHistory && sessionHistory.length > 0) {
      for (const msg of sessionHistory) {
        const role = msg.sender === 'user' ? 'Consultant' : 'Client';
        prompt += `${role}: ${msg.content}\n`;
      }
    }

    // Ajouter le message de l'utilisateur si présent
    if (userMessage && !isTimeout) {
      prompt += `Consultant: ${userMessage}\n`;
    }

    prompt += `
Maintenant, en tant que client, réponds de manière réaliste en fonction de ton profil.
${clientProfile.type === 'pressé' ? 'Sois bref et direct, tu as peu de temps.' : ''}
${clientProfile.type === 'hostile' ? 'Montre une certaine méfiance ou agacement dans ta réponse.' : ''}
${clientProfile.type === 'indécis' ? 'Hésite et pose des questions supplémentaires.' : ''}
${clientProfile.type === 'technique' ? 'Utilise un vocabulaire technique et demande des précisions techniques.' : ''}
${clientProfile.type === 'débutant' ? 'Montre que tu ne maîtrises pas bien le sujet, pose des questions basiques.' : ''}`;

    // Appel à l'API OpenAI
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: 'Tu es un client dans une simulation de prospection commerciale.' },
        { role: 'user', content: prompt }
      ],
      0.7, // temperature pour plus de créativité
      500  // max_tokens
    );

    // Formatage de la réponse
    const clientMessage = {
      id: uuidv4(),
      content: response.content,
      sender: 'client',
      timestamp: new Date()
    };

    return res.status(200).json({ message: clientMessage });
  } catch (error) {
    console.error('Erreur lors de la génération du message client:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du message client' });
  }
}

/**
 * Évalue une session de simulation
 */
export async function evaluateSession(req: Request, res: Response) {
  try {
    const { session, isTimeout } = req.body;

    if (!session) {
      return res.status(400).json({ error: 'Session requise' });
    }

    if (session.messages.length < 2) {
      return res.status(400).json({ 
        score: { reactivité: 0, clarté: 0, impact: 0, conclusion: 0, total: 0 },
        feedback: "Session trop courte pour être évaluée. Continuez la conversation pour obtenir une évaluation."
      });
    }

    // Construire le texte complet de la conversation
    let conversationText = `Type de client: ${session.clientProfile.type}
Personnalité: ${session.clientProfile.personality}
Contexte: ${session.clientProfile.context}

Historique de la conversation:
`;

    session.messages.forEach(msg => {
      const role = msg.sender === 'user' ? 'Consultant' : 'Client';
      conversationText += `${role}: ${msg.content}\n`;
    });

    // Créer le prompt pour l'évaluation
    const evaluationPrompt = `
En tant qu'expert en techniques de vente et de prospection, évalue cette conversation entre un consultant et un client potentiel.
${isTimeout ? "Note que la session s'est terminée car le consultant n'a pas répondu dans le temps imparti." : ""}

${conversationText}

Évalue la performance du consultant selon les critères suivants (note de 0 à 10):
1. Réactivité: Rapidité et pertinence des réponses
2. Clarté: Capacité à expliquer clairement les concepts et à répondre aux questions
3. Impact: Capacité à convaincre, argumenter et susciter l'intérêt
4. Conclusion: Capacité à conclure positivement l'échange (obtenir un rendez-vous, une suite, etc.)

Donne une note globale sur 10.

Fournis également un feedback constructif sur les points forts et les axes d'amélioration en 3-5 phrases.

Format de réponse (JSON):
{
  "score": {
    "reactivité": [0-10],
    "clarté": [0-10],
    "impact": [0-10],
    "conclusion": [0-10],
    "total": [0-10]
  },
  "feedback": "Feedback détaillé..."
}`;

    try {
      // Appel à l'API OpenAI pour l'évaluation
      const evaluationResponse = await openAIService.getChatCompletion(
        [
          { role: 'system', content: 'Tu es un expert en techniques de vente et de prospection.' },
          { role: 'user', content: evaluationPrompt }
        ],
        0.3, // temperature basse pour la cohérence
        1000 // max_tokens
      );

      // Analyse de la réponse JSON
      try {
        const evaluation = JSON.parse(evaluationResponse.content);
        return res.status(200).json(evaluation);
      } catch (jsonError) {
        console.error('Erreur lors du parsing du JSON de l\'évaluation:', jsonError);
        // En cas d'erreur de parsing, générer une évaluation par défaut
        return res.status(200).json(generateDefaultEvaluation(session, isTimeout));
      }
    } catch (aiError) {
      console.error('Erreur lors de l\'appel à OpenAI pour l\'évaluation:', aiError);
      // En cas d'erreur d'API, générer une évaluation par défaut
      return res.status(200).json(generateDefaultEvaluation(session, isTimeout));
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la session:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'évaluation de la session' });
  }
}

/**
 * Génère une évaluation par défaut en cas d'erreur
 */
function generateDefaultEvaluation(session: SimulationSession, isTimeout: boolean): any {
  // Calcul basique basé sur la longueur de la conversation
  const messageCount = session.messages.length;
  const userMessages = session.messages.filter(msg => msg.sender === 'user').length;
  
  // Score de base en fonction du nombre de messages
  let baseScore = Math.min(7, Math.floor(messageCount / 2));
  
  // Pénalité pour timeout
  if (isTimeout) {
    baseScore = Math.max(0, baseScore - 3);
  }
  
  // Variation aléatoire légère pour éviter des scores identiques
  const randomVariation = () => Math.floor(Math.random() * 3) - 1;
  
  return {
    score: {
      reactivité: Math.max(0, Math.min(10, baseScore + randomVariation())),
      clarté: Math.max(0, Math.min(10, baseScore + randomVariation())),
      impact: Math.max(0, Math.min(10, baseScore + randomVariation())),
      conclusion: Math.max(0, Math.min(10, userMessages > 3 ? baseScore : baseScore - 2)),
      total: baseScore
    },
    feedback: isTimeout 
      ? "La session s'est terminée car vous n'avez pas répondu à temps. Essayez de maintenir un rythme de conversation constant et de répondre rapidement aux questions du client."
      : "Évaluation générée automatiquement en raison d'une erreur technique. Continuez à pratiquer vos compétences de prospection pour vous améliorer."
  };
}