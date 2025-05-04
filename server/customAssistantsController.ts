import { Request, Response } from 'express';
import { db } from './db';
import {
  customAssistants,
  assistantTemplates,
  userProfiles,
  assistantConversations,
  users,
  InsertCustomAssistant,
  insertCustomAssistantSchema
} from '@shared/schema';
import { eq, desc, asc, and, sql, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { openAIService } from './services/openai';

// Structure pour stocker les sessions de conversation temporaires (non-authentifiées)
interface TempAssistantSession {
  userId: string;
  assistantId: number;
  messages: Array<{
    role: 'system' | 'assistant' | 'user';
    content: string;
  }>;
  createdAt: Date;
  systemPrompt: string;
  settings: Record<string, any>;
}

// Map pour stocker les sessions temporaires
const tempSessions = new Map<string, TempAssistantSession>();

/**
 * Récupère tous les modèles d'assistants disponibles
 */
export async function getAssistantTemplates(req: Request, res: Response) {
  try {
    const templates = await db.select().from(assistantTemplates).orderBy(asc(assistantTemplates.displayOrder));
    
    return res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles d\'assistants:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des modèles d\'assistants'
    });
  }
}

/**
 * Récupère un modèle d'assistant spécifique
 */
export async function getAssistantTemplate(req: Request, res: Response) {
  try {
    const { templateId } = req.params;
    
    if (!templateId || isNaN(Number(templateId))) {
      return res.status(400).json({
        success: false,
        error: 'ID de modèle invalide'
      });
    }
    
    const template = await db.select().from(assistantTemplates).where(eq(assistantTemplates.id, Number(templateId))).limit(1);
    
    if (!template.length) {
      return res.status(404).json({
        success: false,
        error: 'Modèle d\'assistant non trouvé'
      });
    }
    
    return res.json({
      success: true,
      template: template[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du modèle d\'assistant:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du modèle d\'assistant'
    });
  }
}

/**
 * Récupère les assistants personnalisés de l'utilisateur
 */
export async function getUserAssistants(req: Request, res: Response) {
  try {
    // Pour l'instant, nous utilisons un ID utilisateur temporaire (session)
    // À terme, cela devrait être l'ID de l'utilisateur connecté
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    // Vérifier si l'utilisateur existe
    const userExists = await db.select({ id: users.id }).from(users).where(eq(users.username, userId)).limit(1);
    
    // Si l'utilisateur n'existe pas, créons-en un temporaire pour la démo
    let userId1 = 0;
    if (!userExists.length) {
      const [newUser] = await db.insert(users).values({
        username: userId,
        password: 'password123' // Ne jamais faire ça en production!
      }).returning({ id: users.id });
      
      userId1 = newUser.id;
    } else {
      userId1 = userExists[0].id;
    }
    
    // Récupérer les assistants personnalisés de l'utilisateur
    const assistants = await db.select().from(customAssistants)
      .where(eq(customAssistants.userId, userId1))
      .orderBy(desc(customAssistants.updatedAt));
    
    return res.json({
      success: true,
      assistants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des assistants:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des assistants'
    });
  }
}

/**
 * Crée un nouvel assistant personnalisé
 */
export async function createAssistant(req: Request, res: Response) {
  try {
    const validationResult = insertCustomAssistantSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Données d\'assistant invalides',
        details: validationResult.error.format()
      });
    }
    
    const assistantData = validationResult.data;
    
    // Vérifier si l'utilisateur existe
    const userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, assistantData.userId)).limit(1);
    
    if (!userExists.length) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Insérer le nouvel assistant
    const [newAssistant] = await db.insert(customAssistants).values(assistantData).returning();
    
    return res.status(201).json({
      success: true,
      assistant: newAssistant
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'assistant:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'assistant'
    });
  }
}

/**
 * Met à jour un assistant personnalisé
 */
export async function updateAssistant(req: Request, res: Response) {
  try {
    const { assistantId } = req.params;
    
    if (!assistantId || isNaN(Number(assistantId))) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'assistant invalide'
      });
    }
    
    // Vérifier si l'assistant existe et appartient à l'utilisateur
    const existingAssistant = await db.select().from(customAssistants)
      .where(eq(customAssistants.id, Number(assistantId)))
      .limit(1);
    
    if (!existingAssistant.length) {
      return res.status(404).json({
        success: false,
        error: 'Assistant non trouvé'
      });
    }
    
    // Valider les données de mise à jour
    const updateSchema = insertCustomAssistantSchema.partial();
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Données de mise à jour invalides',
        details: validationResult.error.format()
      });
    }
    
    const updateData = validationResult.data;
    
    // Mettre à jour l'assistant
    const [updatedAssistant] = await db.update(customAssistants)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(customAssistants.id, Number(assistantId)))
      .returning();
    
    return res.json({
      success: true,
      assistant: updatedAssistant
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'assistant:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'assistant'
    });
  }
}

/**
 * Supprime un assistant personnalisé
 */
export async function deleteAssistant(req: Request, res: Response) {
  try {
    const { assistantId } = req.params;
    
    if (!assistantId || isNaN(Number(assistantId))) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'assistant invalide'
      });
    }
    
    // Vérifier si l'assistant existe
    const existingAssistant = await db.select().from(customAssistants)
      .where(eq(customAssistants.id, Number(assistantId)))
      .limit(1);
    
    if (!existingAssistant.length) {
      return res.status(404).json({
        success: false,
        error: 'Assistant non trouvé'
      });
    }
    
    // Supprimer d'abord les conversations liées
    await db.delete(assistantConversations)
      .where(eq(assistantConversations.assistantId, Number(assistantId)));
    
    // Puis supprimer l'assistant
    await db.delete(customAssistants)
      .where(eq(customAssistants.id, Number(assistantId)));
    
    return res.json({
      success: true,
      message: 'Assistant supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'assistant:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'assistant'
    });
  }
}

/**
 * Initialise une session de conversation avec un assistant personnalisé
 */
export async function initConversation(req: Request, res: Response) {
  try {
    const { assistantId, userId } = req.body;
    
    if (!assistantId || isNaN(Number(assistantId))) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'assistant invalide'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    // Récupérer l'assistant
    const assistant = await db.select().from(customAssistants)
      .where(eq(customAssistants.id, Number(assistantId)))
      .limit(1);
    
    if (!assistant.length) {
      return res.status(404).json({
        success: false,
        error: 'Assistant non trouvé'
      });
    }
    
    // Vérifier si l'utilisateur existe dans la base de données
    const userExists = await db.select({ id: users.id }).from(users).where(eq(users.username, userId)).limit(1);
    
    // Si l'utilisateur est authentifié, créer une conversation persistante
    if (userExists.length) {
      const [conversation] = await db.insert(assistantConversations).values({
        assistantId: Number(assistantId),
        userId: userExists[0].id,
        title: 'Nouvelle conversation',
        messages: []
      }).returning();
      
      return res.json({
        success: true,
        conversationId: conversation.id,
        assistant: assistant[0],
        isPersistent: true
      });
    } 
    // Sinon, créer une session temporaire
    else {
      const sessionId = uuidv4();
      
      // Créer une session temporaire
      tempSessions.set(sessionId, {
        userId,
        assistantId: Number(assistantId),
        messages: [
          {
            role: 'system',
            content: assistant[0].systemPrompt
          }
        ],
        createdAt: new Date(),
        systemPrompt: assistant[0].systemPrompt,
        settings: {}
      });
      
      return res.json({
        success: true,
        sessionId,
        assistant: assistant[0],
        isPersistent: false
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'initialisation de la conversation'
    });
  }
}

/**
 * Envoie un message à l'assistant personnalisé
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const { message, sessionId, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message requis'
      });
    }
    
    if (!sessionId && !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'ID de session ou ID de conversation requis'
      });
    }
    
    let messages = [];
    let systemPrompt = '';
    let isPersistent = false;
    
    // Gestion de session persistante
    if (conversationId) {
      isPersistent = true;
      
      // Récupérer la conversation
      const conversation = await db.select().from(assistantConversations)
        .where(eq(assistantConversations.id, Number(conversationId)))
        .limit(1);
      
      if (!conversation.length) {
        return res.status(404).json({
          success: false,
          error: 'Conversation non trouvée'
        });
      }
      
      // Récupérer l'assistant pour obtenir le prompt système
      const assistant = await db.select().from(customAssistants)
        .where(eq(customAssistants.id, conversation[0].assistantId))
        .limit(1);
      
      if (!assistant.length) {
        return res.status(404).json({
          success: false,
          error: 'Assistant non trouvé'
        });
      }
      
      systemPrompt = assistant[0].systemPrompt;
      // Récupérer les messages existants
      messages = conversation[0].messages as any[] || [];
      
      // Ajouter le prompt système s'il n'est pas déjà présent
      if (!messages.some(msg => msg.role === 'system')) {
        messages = [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ];
      }
    } 
    // Gestion de session temporaire
    else if (sessionId) {
      const session = tempSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session non trouvée'
        });
      }
      
      messages = session.messages;
      systemPrompt = session.systemPrompt;
    }
    
    // Ajouter le message de l'utilisateur
    messages.push({
      role: 'user',
      content: message
    });
    
    // Générer la réponse de l'assistant avec Azure OpenAI
    try {
      const openaiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await openai.getChatCompletionAzure(openaiMessages);
      
      // Ajouter la réponse de l'assistant aux messages
      const assistantResponse = response.choices[0].message.content;
      messages.push({
        role: 'assistant',
        content: assistantResponse
      });
      
      // Mettre à jour la conversation/session
      if (isPersistent && conversationId) {
        await db.update(assistantConversations)
          .set({
            messages,
            updatedAt: new Date(),
            lastMessageAt: new Date()
          })
          .where(eq(assistantConversations.id, Number(conversationId)));
      } else if (sessionId) {
        const session = tempSessions.get(sessionId);
        if (session) {
          session.messages = messages;
          tempSessions.set(sessionId, session);
        }
      }
      
      return res.json({
        success: true,
        response: assistantResponse,
        isPersistent
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de la réponse'
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message'
    });
  }
}

/**
 * Récupère l'historique d'une conversation
 */
export async function getConversationHistory(req: Request, res: Response) {
  try {
    const { conversationId, sessionId } = req.params;
    
    // Gestion de session persistante
    if (conversationId && !isNaN(Number(conversationId))) {
      const conversation = await db.select().from(assistantConversations)
        .where(eq(assistantConversations.id, Number(conversationId)))
        .limit(1);
      
      if (!conversation.length) {
        return res.status(404).json({
          success: false,
          error: 'Conversation non trouvée'
        });
      }
      
      return res.json({
        success: true,
        history: conversation[0].messages,
        isPersistent: true
      });
    } 
    // Gestion de session temporaire
    else if (sessionId) {
      const session = tempSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session non trouvée'
        });
      }
      
      return res.json({
        success: true,
        history: session.messages,
        isPersistent: false
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'ID de conversation ou ID de session requis'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
}

/**
 * Récupère les assistants personnalisés les plus populaires (publics)
 */
export async function getPopularAssistants(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    
    const assistants = await db.select().from(customAssistants)
      .where(and(
        eq(customAssistants.isPublic, true),
        eq(customAssistants.isVerified, true)
      ))
      .orderBy(desc(customAssistants.usageCount))
      .limit(limit);
    
    return res.json({
      success: true,
      assistants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des assistants populaires:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des assistants populaires'
    });
  }
}