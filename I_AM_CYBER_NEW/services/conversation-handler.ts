import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Conversation, Mission, NPC, UserProfile, MessageType } from '../types';
import { getNPCById } from '../data';

/**
 * Service de gestion des conversations
 */
class ConversationHandler {
  private conversations: Map<string, Conversation> = new Map();

  /**
   * Crée une nouvelle conversation
   * @param npcId ID du PNJ principal
   * @param userProfile Profil de l'utilisateur
   * @param activeMission Mission active (optionnel)
   * @returns ID de la conversation créée
   */
  createConversation(
    npcId: string,
    userProfile: UserProfile,
    activeMission?: Mission
  ): string {
    // Récupérer le PNJ
    const npc = getNPCById(npcId);
    if (!npc) {
      throw new Error(`NPC with ID ${npcId} not found`);
    }

    // Créer une nouvelle conversation
    const conversationId = uuidv4();
    const conversation: Conversation = {
      id: conversationId,
      messages: [],
      currentNPC: npc,
      contextualData: {
        activeMission,
        userLevel: userProfile.level.toString(),
        previousInteractions: []
      }
    };

    // Ajouter un message de bienvenue
    const welcomeMessage = this.createMessage(
      'bot',
      `Bonjour ${userProfile.name}, je suis ${npc.name}, ${npc.role}. Comment puis-je vous aider aujourd'hui ?`,
      npc.name,
      npc.role
    );
    conversation.messages.push(welcomeMessage);

    // Enregistrer la conversation
    this.conversations.set(conversationId, conversation);

    return conversationId;
  }

  /**
   * Ajoute un message à une conversation
   * @param conversationId ID de la conversation
   * @param type Type de message
   * @param content Contenu du message
   * @param contactName Nom du contact (pour les messages de type 'bot')
   * @param contactRole Rôle du contact (pour les messages de type 'bot')
   * @returns Message créé
   */
  addMessageToConversation(
    conversationId: string,
    type: MessageType,
    content: string,
    contactName?: string,
    contactRole?: string
  ): ChatMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    const message = this.createMessage(type, content, contactName, contactRole);
    conversation.messages.push(message);

    // Si c'est un message utilisateur, on l'ajoute aux interactions précédentes
    if (type === 'user') {
      conversation.contextualData.previousInteractions.push(content);
    }

    return message;
  }

  /**
   * Crée un nouveau message
   * @param type Type de message
   * @param content Contenu du message
   * @param contactName Nom du contact (pour les messages de type 'bot')
   * @param contactRole Rôle du contact (pour les messages de type 'bot')
   * @returns Message créé
   */
  private createMessage(
    type: MessageType,
    content: string,
    contactName?: string,
    contactRole?: string
  ): ChatMessage {
    return {
      id: uuidv4(),
      type,
      content,
      timestamp: Date.now(),
      contactName,
      contactRole
    };
  }

  /**
   * Récupère une conversation
   * @param conversationId ID de la conversation
   * @returns Conversation
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Récupère tous les messages d'une conversation
   * @param conversationId ID de la conversation
   * @returns Liste des messages
   */
  getConversationMessages(conversationId: string): ChatMessage[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return conversation.messages;
  }

  /**
   * Met à jour la mission active d'une conversation
   * @param conversationId ID de la conversation
   * @param mission Nouvelle mission active
   */
  updateActiveMission(conversationId: string, mission: Mission): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    conversation.contextualData.activeMission = mission;
  }

  /**
   * Change le PNJ actuel d'une conversation
   * @param conversationId ID de la conversation
   * @param npcId ID du nouveau PNJ
   */
  changeNPC(conversationId: string, npcId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    const npc = getNPCById(npcId);
    if (!npc) {
      throw new Error(`NPC with ID ${npcId} not found`);
    }

    conversation.currentNPC = npc;

    // Ajouter un message d'introduction du nouveau PNJ
    const introMessage = this.createMessage(
      'bot',
      `Bonjour, je suis ${npc.name}, ${npc.role}. Je prends le relais dans cette conversation.`,
      npc.name,
      npc.role
    );
    conversation.messages.push(introMessage);
  }

  /**
   * Prépare le contexte prompt pour l'IA
   * @param conversationId ID de la conversation
   * @returns Prompt formaté pour l'IA
   */
  prepareAIPrompt(conversationId: string): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    const { currentNPC, contextualData } = conversation;
    const lastMessages = conversation.messages
      .slice(-5) // Prendre les 5 derniers messages
      .map(msg => {
        const role = msg.type === 'user' ? 'Utilisateur' : msg.contactName;
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    // Récupérer le template du PNJ et remplacer les variables
    let prompt = currentNPC.promptTemplate
      .replace('{lastMessages}', lastMessages)
      .replace('{userLevel}', contextualData.userLevel);

    // Ajouter les informations de mission si disponible
    if (contextualData.activeMission) {
      const mission = contextualData.activeMission;
      prompt = prompt
        .replace('{mission.title}', mission.title)
        .replace(
          '{mission.objectives.filter(o => !o.completed).map(o => o.description).join(\', \')}',
          mission.objectives
            .filter(o => !o.completed)
            .map(o => o.description)
            .join(', ')
        );
    } else {
      prompt = prompt
        .replace('{mission.title}', 'Aucune mission active')
        .replace('{mission.objectives.filter(o => !o.completed).map(o => o.description).join(\', \')}', 'Aucun objectif actif');
    }

    return prompt;
  }
}

export const conversationHandler = new ConversationHandler();