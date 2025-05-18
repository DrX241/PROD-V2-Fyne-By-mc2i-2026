import { Request, Response } from 'express';
import { azureOpenAIConfig } from './config';
import axios from 'axios';

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
    const { messages, clientProfile, isInitial } = req.body;

    if (!messages || !clientProfile) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Formatage du prompt système pour Azure OpenAI
    const systemContent = `Tu es un client qui contacte un Senior Manager de cabinet de conseil. 
Tu as le profil suivant :
- Type: ${clientProfile.type}
- Personnalité: ${clientProfile.personality}
- Contexte: ${clientProfile.context}

${isInitial 
  ? "Commence la conversation en demandant de l'aide pour une problématique. Sois bref (max 2 phrases)." 
  : "Continue la conversation en fonction des réponses du consultant. Ne donne pas trop d'informations d'un coup, sois réaliste."
}

Ton objectif est de tester sa réactivité, sa capacité à poser les bonnes questions et à convaincre.
Si le consultant fait une proposition pertinente qui correspond à tes besoins, montre de l'intérêt.
Si ses réponses sont vagues ou inappropriées, montre ton insatisfaction.
`;

    // Message formaté pour l'API d'Azure OpenAI
    const formattedMessages = [
      { role: "system", content: systemContent },
      ...messages
    ];

    // Configuration de la requête vers Azure OpenAI
    const payload = {
      messages: formattedMessages,
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    };

    // Vérification de la disponibilité du service OpenAI
    if (!azureOpenAIConfig.isFunctional()) {
      console.error('Azure OpenAI service is not functional');
      return res.status(503).json({ 
        error: "Le service Azure OpenAI n'est pas disponible actuellement",
        message: isInitial ? clientProfile.initialMessage : "Je dois prendre un autre appel. Je vous recontacterai plus tard."
      });
    }

    // Configuration spécifique pour l'API Azure OpenAI
    const endpoint = `${azureOpenAIConfig.secondaryAzureEndpoint}/openai/deployments/${azureOpenAIConfig.secondaryAzureDeploymentName}/chat/completions?api-version=${azureOpenAIConfig.secondaryAzureApiVersion}`;
    const headers = {
      'Content-Type': 'application/json',
      'api-key': azureOpenAIConfig.secondaryApiKey
    };

    // Appel à l'API Azure OpenAI
    const response = await axios.post(endpoint, payload, { headers });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Réponse invalide de l'API Azure OpenAI");
    }

    const clientResponse = response.data.choices[0].message.content;

    // Réponse au client
    return res.status(200).json({ message: clientResponse });

  } catch (error) {
    console.error("Erreur lors de la génération du message client:", error);
    
    // En cas d'erreur, renvoyer un message par défaut
    const defaultMessage = req.body.isInitial
      ? req.body.clientProfile.initialMessage
      : "Excusez-moi, je dois prendre un autre appel urgent. Je vous recontacterai ultérieurement.";
    
    return res.status(500).json({ 
      error: "Erreur lors de la génération du message", 
      message: defaultMessage 
    });
  }
}

/**
 * Évalue une session de simulation
 */
export async function evaluateSession(req: Request, res: Response) {
  try {
    const { session, isTimeout } = req.body;

    if (!session) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Formatage du prompt pour l'évaluation
    const conversationHistory = session.messages.map(msg => 
      `${msg.sender === 'user' ? 'Consultant' : 'Client'}: ${msg.content}`
    ).join('\n\n');

    const systemContent = `Tu es un coach expert en prospection commerciale chargé d'évaluer la performance d'un Senior Manager lors d'une session de simulation.

Voici le profil du client dans cette simulation :
- Type: ${session.clientProfile.type}
- Personnalité: ${session.clientProfile.personality}
- Contexte: ${session.clientProfile.context}

Tu dois évaluer la performance du consultant sur 4 critères (note de 0 à 100) :
1. Réactivité : capacité à répondre rapidement et efficacement aux demandes du client
2. Clarté : qualité et précision des explications, absence de jargon inutile
3. Impact commercial : capacité à valoriser l'offre et à créer de l'intérêt
4. Conclusion : capacité à proposer des actions concrètes et à faire avancer l'opportunité

${isTimeout ? "Note : cette session s'est terminée prématurément car le temps imparti était écoulé." : ""}

Réponds UNIQUEMENT au format JSON suivant :
{
  "score": {
    "reactivité": [score de 0 à 100],
    "clarté": [score de 0 à 100],
    "impact": [score de 0 à 100],
    "conclusion": [score de 0 à 100],
    "total": [moyenne des 4 scores précédents]
  },
  "feedback": "[Feedback détaillé avec conseils d'amélioration, 3-4 paragraphes maximum]"
}`;

    // Message formaté pour l'API d'Azure OpenAI
    const formattedMessages = [
      { role: "system", content: systemContent },
      { 
        role: "user", 
        content: `Voici la conversation complète à évaluer:\n\n${conversationHistory}\n\nMerci de fournir ton évaluation au format JSON comme demandé.` 
      }
    ];

    // Configuration de la requête vers Azure OpenAI
    const payload = {
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.3,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "json_object" }
    };

    // Vérification de la disponibilité du service OpenAI
    if (!azureOpenAIConfig.isFunctional()) {
      console.error('Azure OpenAI service is not functional');
      
      // Générer une évaluation par défaut
      const defaultEvaluation = generateDefaultEvaluation(session, isTimeout);
      return res.status(200).json(defaultEvaluation);
    }

    // Configuration spécifique pour l'API Azure OpenAI
    const endpoint = `${azureOpenAIConfig.secondaryAzureEndpoint}/openai/deployments/${azureOpenAIConfig.secondaryAzureDeploymentName}/chat/completions?api-version=${azureOpenAIConfig.secondaryAzureApiVersion}`;
    const headers = {
      'Content-Type': 'application/json',
      'api-key': azureOpenAIConfig.secondaryApiKey
    };

    // Appel à l'API Azure OpenAI
    const response = await axios.post(endpoint, payload, { headers });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Réponse invalide de l'API Azure OpenAI");
    }

    const evaluationContent = response.data.choices[0].message.content;
    const evaluation = JSON.parse(evaluationContent);

    // Réponse au client
    return res.status(200).json(evaluation);

  } catch (error) {
    console.error("Erreur lors de l'évaluation de la session:", error);
    
    // En cas d'erreur, générer une évaluation par défaut
    const defaultEvaluation = generateDefaultEvaluation(req.body.session, req.body.isTimeout);
    return res.status(200).json(defaultEvaluation);
  }
}

/**
 * Génère une évaluation par défaut en cas d'erreur
 */
function generateDefaultEvaluation(session: SimulationSession, isTimeout: boolean): any {
  // Générer des scores de base en fonction du type de client
  let baseScore = 70; // Score de base moyen
  
  // Ajuster le score en fonction du profil client (plus difficile pour hostile/technique)
  if (session.clientProfile.type === 'hostile') {
    baseScore -= 10;
  } else if (session.clientProfile.type === 'pressé') {
    baseScore -= 5;
  } else if (session.clientProfile.type === 'technique') {
    baseScore -= 8;
  }
  
  // Pénalité si la session a expiré
  if (isTimeout) {
    baseScore -= 15;
  }
  
  // Ajuster en fonction du nombre de messages échangés (plus d'échanges = meilleur engagement)
  const messageCount = session.messages.length;
  const messageBonus = Math.min(10, Math.floor(messageCount / 2));
  baseScore += messageBonus;
  
  // Générer des variations aléatoires pour chaque critère
  const reactiviteScore = Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10));
  const clarteScore = Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10));
  const impactScore = Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10));
  const conclusionScore = Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10));
  
  // Calculer le score total
  const totalScore = Math.floor((reactiviteScore + clarteScore + impactScore + conclusionScore) / 4);
  
  // Générer un feedback par défaut
  let feedback = "";
  
  if (isTimeout) {
    feedback = "Vous n'avez pas pu terminer la session dans le temps imparti, ce qui peut arriver dans une situation réelle. Essayez d'être plus concis dans vos réponses et d'aller directement à l'essentiel. Vous avez démontré des compétences dans l'identification des besoins, mais la gestion du temps reste un point d'amélioration.\n\nPour les prochaines sessions, planifiez mentalement les points clés à aborder et soyez plus proactif pour guider la conversation vers une conclusion.";
  } else if (totalScore < 60) {
    feedback = "Cette session a révélé plusieurs points d'amélioration. Votre approche manquait parfois de structure, et les réponses n'étaient pas toujours adaptées au profil du client. Essayez d'être plus attentif aux signaux envoyés par le client et d'adapter votre communication en conséquence.\n\nPour progresser, travaillez sur votre capacité à poser des questions ouvertes et à reformuler les besoins du client. N'hésitez pas à prendre des notes pour mieux structurer votre proposition.";
  } else if (totalScore < 75) {
    feedback = "Vous avez démontré une bonne compréhension des besoins du client et fait preuve d'écoute active. Cependant, il y a encore de la marge pour améliorer l'impact de vos propositions et la clarté de vos explications.\n\nContinuez à travailler sur la formulation de vos arguments commerciaux et sur votre capacité à conclure efficacement. Pensez à proposer systématiquement une prochaine étape concrète en fin d'entretien.";
  } else {
    feedback = "Excellente performance dans l'ensemble ! Vous avez su adapter votre communication au profil du client et démontré une bonne maîtrise des techniques de prospection. Vos questions étaient pertinentes et vous avez su rebondir efficacement sur les réponses du client.\n\nPour atteindre l'excellence, continuez à affiner votre capacité à détecter rapidement les signaux d'achat et à transformer l'intérêt en engagement concret. Votre approche est déjà très professionnelle.";
  }
  
  return {
    score: {
      reactivité: reactiviteScore,
      clarté: clarteScore,
      impact: impactScore,
      conclusion: conclusionScore,
      total: totalScore
    },
    feedback: feedback
  };
}