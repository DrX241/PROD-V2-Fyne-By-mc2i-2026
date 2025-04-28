import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

// Interface pour la configuration du modèle
interface ModelConfig {
  temperature: number;
  maxTokens: number;
}

// Fonction principale pour gérer le chat de simulation de crise
export async function handleCrisisChat(req: Request, res: Response) {
  try {
    const { 
      message,
      userName,
      userRole,
      scenario,
      currentEvent,
      activePersonalities,
      messages,
      budget,
      score,
      reputation
    } = req.body;
    
    if (!message || !userRole || !scenario) {
      return res.status(400).json({ 
        error: 'Données incomplètes pour la simulation de crise',
        missingFields: !message ? 'message' : !userRole ? 'userRole' : 'scenario'
      });
    }
    
    // Récupérer les personnalités actives et l'événement en cours
    const currentPersonality = activePersonalities.find((p: any) => p.id === scenario.mainPersonality);
    const currentEventData = scenario.events[currentEvent] || null;
    
    // Construire le prompt pour le système
    const systemPrompt = buildSystemPrompt(
      scenario, 
      userRole, 
      currentPersonality, 
      budget, 
      score,
      reputation
    );
    
    // Construire les messages pour l'IA
    const chatMessages = buildChatHistory(
      messages, 
      userName, 
      userRole, 
      scenario,
      activePersonalities
    );
    
    // Déterminer la configuration appropriée
    const configKey = determineConfigKey(budget, score, reputation);
    
    // Appeler l'API OpenAI via le service existant
    const temperature = configKey === 'critical' ? 0.8 : configKey === 'technical' ? 0.5 : 0.7;
    const maxTokens = configKey === 'critical' ? 1500 : configKey === 'technical' ? 1000 : 1200;
    
    // Convertir nos messages pour le format attendu par OpenAI
    const formattedMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      ...chatMessages
    ];
    
    // Appel à l'API via la méthode existante
    const responseContent = await openAIService.getChatCompletion(
      formattedMessages, 
      temperature,
      maxTokens
    );
    
    // Analyser la réponse pour extraire les métadonnées
    const parsedResponse = parseAIResponse(responseContent);
    
    // Déterminer si la simulation doit se terminer
    const shouldEndSimulation = 
      (budget + (parsedResponse.budgetImpact || 0) <= 0) || // Plus de budget
      (reputation + (parsedResponse.reputationImpact || 0) <= 0) || // Plus de réputation
      parsedResponse.endSimulation; // L'IA recommande de terminer
    
    return res.json({
      message: parsedResponse.message,
      messageType: parsedResponse.messageType || 'personality',
      sender: parsedResponse.sender || currentPersonality?.id,
      budgetImpact: parsedResponse.budgetImpact || 0,
      scoreImpact: parsedResponse.scoreImpact || 0,
      reputationImpact: parsedResponse.reputationImpact || 0,
      alertLevel: parsedResponse.alertLevel || 'normal',
      eventTriggered: parsedResponse.eventTriggered || null,
      endSimulation: shouldEndSimulation
    });
    
  } catch (error: any) {
    console.error('Erreur lors du traitement du chat de crise:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du traitement de la simulation',
      details: error.message
    });
  }
}

// Construire le prompt système
function buildSystemPrompt(
  scenario: any, 
  userRole: any, 
  currentPersonality: any, 
  budget: number,
  score: number,
  reputation: number
): string {
  return `Tu es un simulateur de gestion de crise cyber en entreprise.
Ton rôle est de simuler une situation d'attaque critique en cybersécurité.

CONTEXTE ACTUEL:
- Scénario: ${scenario.title}
- Description: ${scenario.description}
- Rôle de l'utilisateur: ${userRole.title}
- Budget restant: ${budget.toLocaleString('fr-FR')}€
- Score actuel: ${score} points
- Réputation: ${reputation}/100

PERSONNALITÉ PRINCIPALE:
- Nom: ${currentPersonality?.name || 'Système'}
- Rôle: ${currentPersonality?.role || 'Système'}
- Ton de communication: ${currentPersonality?.tone || 'neutre'}

Instructions:
- Crée des dialogues réalistes avec différents interlocuteurs (DG, DPO, Hacker, Employés...).
- Chaque action de l'utilisateur doit entraîner une réaction logique de la situation.
- Fais ressentir la pression : stress, budget qui fond, critiques du DG, provocations du Hacker.
- À chaque message, propose un nouveau dilemme ou événement inattendu si l'utilisateur gère mal.
- Réponds toujours en français.
- Sois réaliste : certaines décisions doivent avoir des conséquences négatives immédiates.
- Utilise un style court, clair, professionnel.
- Si l'utilisateur dépasse le budget ou prend trop de mauvaises décisions, aggrave la situation.
- À la fin du scénario, prépare un bilan chiffré (coût total, réputation, satisfaction DG).
- N'utilise jamais de ton neutre : sois vivant, émotionnel, humain.

FORMAT DE RÉPONSE:
Ta réponse doit être structurée comme suit:
1. Le message principal que tu souhaites communiquer
2. À la fin de ta réponse, inclus OBLIGATOIREMENT une section JSON délimitée par ===JSON=== et ===END=== avec ces informations:
{
  "messageType": "personality", // Type: personality, system, event, alert, email, sms
  "sender": "id_personnalite", // ID de la personnalité qui parle (ou "system")
  "budgetImpact": 0, // Impact sur le budget (positif ou négatif)
  "scoreImpact": 0, // Impact sur le score (positif ou négatif)
  "reputationImpact": 0, // Impact sur la réputation (entre -20 et +10)
  "alertLevel": "normal", // normal, elevated, high, critical
  "eventTriggered": null, // ID d'un événement déclenché (ou null)
  "endSimulation": false // true si la simulation doit se terminer
}`;
}

// Construire l'historique du chat pour l'IA
function buildChatHistory(
  messages: any[], 
  userName: string, 
  userRole: any,
  scenario: any,
  activePersonalities: any[]
): ChatCompletionRequestMessage[] {
  // Limiter l'historique aux 8 derniers messages pour éviter la limite de tokens
  const recentMessages = messages.slice(-8);
  
  return recentMessages.map(msg => {
    if (msg.type === 'user') {
      return {
        role: "user",
        content: `${userName} (${userRole.title}): ${msg.content}`
      };
    } else {
      // Pour les messages système et autres
      let sender = 'Système';
      
      if (msg.sender && msg.sender !== 'system') {
        const personality = activePersonalities.find((p: any) => p.id === msg.sender);
        if (personality) {
          sender = `${personality.name} (${personality.role})`;
        }
      }
      
      return {
        role: "assistant",
        content: `${sender}: ${msg.content}`
      };
    }
  });
}

// Déterminer la configuration à utiliser en fonction de l'état
function determineConfigKey(budget: number, score: number, reputation: number): string {
  if (budget < 100000 || reputation < 30) {
    return 'critical';
  }
  
  if (score > 50) {
    return 'technical';
  }
  
  return 'default';
}

// Analyser la réponse de l'IA pour extraire les métadonnées
function parseAIResponse(response: string): any {
  // Extraire la partie JSON si elle existe
  const jsonMatch = response.match(/===JSON===\s*(\{[\s\S]*?\})\s*===END===/);
  
  // Message sans les métadonnées
  const message = response.replace(/===JSON===\s*\{[\s\S]*?\}\s*===END===/, '').trim();
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      const metadata = JSON.parse(jsonMatch[1]);
      return {
        message,
        ...metadata
      };
    } catch (error) {
      console.error('Erreur lors du parsing du JSON dans la réponse:', error);
    }
  }
  
  // Si pas de JSON ou erreur de parsing, retourner uniquement le message
  return {
    message,
    messageType: 'personality',
    budgetImpact: 0,
    scoreImpact: 0,
    reputationImpact: 0,
    alertLevel: 'normal'
  };
}