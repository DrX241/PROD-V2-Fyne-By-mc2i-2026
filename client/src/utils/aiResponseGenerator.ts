import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Types importés
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isPrivate?: boolean;
  reactionType?: "positive" | "negative" | "neutral";
  isTyping?: boolean;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: "calm" | "anxious" | "authoritative" | "technical" | "diplomatic";
  department: "IT" | "Executive" | "Communication" | "Legal" | "Operations" | "External";
  expertise: number;
  stress: number;
  trust: number;
  isAvailable: boolean;
}

export interface AiResponseResult {
  responseMessage: Message;
  stressChange: number;
  trustChange: number;
}

/**
 * Génère une réponse IA pour un stakeholder à partir d'une conversation
 */
export async function generateStakeholderResponse(
  stakeholder: Stakeholder,
  messages: Message[],
  userMessage: string
): Promise<AiResponseResult> {
  try {
    // Limiter à un maximum de 10 derniers messages pour le contexte
    const recentMessages = messages
      .filter(msg => !msg.isTyping) // Exclure les messages "typing"
      .slice(-10)
      .map(msg => ({
        role: msg.senderId === "player" ? "user" : "assistant",
        content: msg.content
      }));
    
    // Créer le prompt système pour Azure OpenAI
    const systemPrompt = `Tu incarnes ${stakeholder.name}, ${stakeholder.role} chez mc2i, une entreprise de conseil en transformation numérique. 
Tu fais face à une attaque par ransomware critique qui a touché les systèmes informatiques de l'entreprise.
Ta personnalité est "${stakeholder.personality === "technical" ? "technique et analytique" : 
                     stakeholder.personality === "anxious" ? "stressée et inquiète" :
                     stakeholder.personality === "authoritative" ? "autoritaire et exigeante" :
                     stakeholder.personality === "diplomatic" ? "diplomatique et mesurée" : "calme et réfléchie"}".
Ton niveau de stress actuel est ${stakeholder.stress < 30 ? "faible" : stakeholder.stress < 70 ? "modéré" : "très élevé"}.
Ta confiance envers le RSSI (l'utilisateur) est ${stakeholder.trust < 50 ? "limitée" : stakeholder.trust < 80 ? "moyenne" : "élevée"}.
Tu t'occupes de ${stakeholder.department === "IT" ? "l'informatique et la technologie" :
               stakeholder.department === "Executive" ? "la direction stratégique" :
               stakeholder.department === "Communication" ? "la communication et les relations publiques" :
               stakeholder.department === "Legal" ? "les aspects juridiques et réglementaires" : "les opérations"}.
Réponds de façon brève (maximum 2-3 phrases), avec la personnalité indiquée, en tenant compte de la crise actuelle. Ne dépasse pas 150 mots.`;

    // Appel à l'API Azure OpenAI
    const response = await axios.post('/api/openai/generate-response', {
      model: "gpt-4o-mini",
      systemPrompt,
      messages: recentMessages,
      temperature: 0.7,
      max_tokens: 150
    });
    
    const aiResponse = response.data?.response || 
      "Je dois réfléchir à la situation avant de vous donner une réponse complète.";
    
    // Déterminer le ton émotionnel de la réponse
    let reactionType: "positive" | "negative" | "neutral" = "neutral";
    
    if (aiResponse.toLowerCase().includes("inqui") || 
        aiResponse.toLowerCase().includes("préoccup") || 
        aiResponse.toLowerCase().includes("stress") || 
        aiResponse.toLowerCase().includes("urgent") || 
        aiResponse.toLowerCase().includes("crise")) {
      reactionType = "negative";
    } else if (aiResponse.toLowerCase().includes("satisf") || 
              aiResponse.toLowerCase().includes("confian") || 
              aiResponse.toLowerCase().includes("bien") || 
              aiResponse.toLowerCase().includes("solution") || 
              aiResponse.toLowerCase().includes("d'accord")) {
      reactionType = "positive";
    }
    
    // Créer la réponse finale
    const responseMessage: Message = {
      id: uuidv4(),
      senderId: stakeholder.id,
      content: aiResponse,
      timestamp: new Date(),
      reactionType: reactionType
    };
    
    // Calculer les changements en fonction du contenu du message utilisateur
    let stressChange = 0;
    let trustChange = 0;
    
    if (userMessage.toLowerCase().includes("plan") || 
        userMessage.toLowerCase().includes("solution") || 
        userMessage.toLowerCase().includes("sécuris")) {
      stressChange = -5;
      trustChange = +3;
    } else if (userMessage.toLowerCase().includes("problème") || 
              userMessage.toLowerCase().includes("risque") || 
              userMessage.toLowerCase().includes("urgent")) {
      stressChange = +3;
      trustChange = -2;
    }
    
    // Ajuster en fonction de la réaction de l'IA
    if (reactionType === "positive") {
      stressChange -= 2;
      trustChange += 2;
    } else if (reactionType === "negative") {
      stressChange += 2;
      trustChange -= 1;
    }
    
    return {
      responseMessage,
      stressChange,
      trustChange
    };
    
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse AI:", error);
    
    // Réponse par défaut en cas d'erreur
    const fallbackMessage: Message = {
      id: uuidv4(),
      senderId: stakeholder.id,
      content: "Je suis désolé, je suis actuellement indisponible. Je vous répondrai dès que possible.",
      timestamp: new Date(),
      reactionType: "neutral"
    };
    
    return {
      responseMessage: fallbackMessage,
      stressChange: 0,
      trustChange: -3 // Une légère baisse de confiance due à l'échec de la communication
    };
  }
}