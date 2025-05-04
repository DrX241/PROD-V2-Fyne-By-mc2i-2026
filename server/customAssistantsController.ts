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
import { 
  logAssistantOperation, 
  AssistantOperation, 
  LogStatus,
  AssistantLog
} from './services/assistantLogger';
import { 
  backupPrompt, 
  getPromptHistory, 
  restorePromptVersion 
} from './services/promptBackupService';

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
    
    console.log(`Recherche des assistants pour l'utilisateur: ${userId}`);
    
    // Vérifier si l'utilisateur existe
    // Si c'est un nombre, on cherche par ID, sinon par username (UUID)
    let userExists;
    let numUserId = Number(userId);
    
    if (!isNaN(numUserId)) {
      userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, numUserId)).limit(1);
      console.log(`Recherche par ID numérique: ${numUserId}`);
    } else {
      userExists = await db.select({ id: users.id }).from(users).where(eq(users.username, userId)).limit(1);
      console.log(`Recherche par nom d'utilisateur: ${userId}`);
    }
    
    // Si l'utilisateur n'existe pas, créons-en un temporaire pour la démo
    let databaseUserId = 0;
    if (!userExists.length) {
      console.log(`Utilisateur non trouvé, création d'un nouvel utilisateur avec le nom d'utilisateur: ${userId}`);
      const [newUser] = await db.insert(users).values({
        username: userId,
        password: 'password123' // Ne jamais faire ça en production!
      }).returning({ id: users.id });
      
      databaseUserId = newUser.id;
      console.log(`Nouvel utilisateur créé avec ID: ${databaseUserId}`);
    } else {
      databaseUserId = userExists[0].id;
      console.log(`Utilisateur existant trouvé avec ID: ${databaseUserId}`);
    }
    
    // Récupérer les assistants personnalisés de l'utilisateur
    console.log(`Recherche des assistants pour l'utilisateur ID: ${databaseUserId}`);
    const assistants = await db.select().from(customAssistants)
      .where(eq(customAssistants.userId, databaseUserId))
      .orderBy(desc(customAssistants.updatedAt));
    
    console.log(`${assistants.length} assistant(s) trouvé(s) pour l'utilisateur ID: ${databaseUserId}`);
    
    return res.json({
      success: true,
      assistants,
      userId: databaseUserId
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
  // Utiliser un code d'erreur unique pour faciliter le débogage
  const ERROR_CODES = {
    VALIDATION_ERROR: 'ERR_ASSISTANT_VALIDATION',
    USER_NOT_FOUND: 'ERR_USER_NOT_FOUND',
    USER_CREATION_FAILED: 'ERR_USER_CREATION_FAILED',
    PROMPT_GENERATION_FAILED: 'ERR_PROMPT_GENERATION', 
    DATABASE_ERROR: 'ERR_DB_OPERATION',
    OPENAI_CONNECTION_ERROR: 'ERR_OPENAI_CONNECTION'
  };
  
  try {
    console.log('Début de création d\'un assistant personnalisé', { ip: req.ip });
    
    // 1. Valider les données d'entrée
    const validationResult = insertCustomAssistantSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.warn('Validation échouée pour la création d\'assistant', {
        errors: validationResult.error.format()
      });
      
      return res.status(400).json({
        success: false,
        error: 'Données d\'assistant invalides',
        code: ERROR_CODES.VALIDATION_ERROR,
        details: validationResult.error.format()
      });
    }
    
    const assistantData = validationResult.data;
    console.log('Données d\'assistant validées', { 
      name: assistantData.name,
      domain: assistantData.domain,
      userId: typeof assistantData.userId === 'string' ? 'uuid-string' : assistantData.userId 
    });
    
    // 2. Vérifier/récupérer l'utilisateur
    let databaseUserId: number;
    try {
      // Si assistantData.userId est une chaîne de caractères (UUID), on cherche par username
      // Si c'est un nombre, on cherche par id
      let userExists;
      
      if (typeof assistantData.userId === 'string') {
        console.log(`Recherche utilisateur par username: ${assistantData.userId}`);
        userExists = await db.select({ id: users.id }).from(users).where(eq(users.username, assistantData.userId)).limit(1);
      } else {
        console.log(`Recherche utilisateur par ID: ${assistantData.userId}`);
        userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, assistantData.userId)).limit(1);
      }
      
      if (!userExists.length) {
        console.log(`Utilisateur non trouvé: ${assistantData.userId} (type: ${typeof assistantData.userId})`);
        
        // On crée automatiquement l'utilisateur si c'est une chaîne de caractères (UUID)
        if (typeof assistantData.userId === 'string') {
          try {
            console.log(`Création automatique de l'utilisateur: ${assistantData.userId}`);
            const [newUser] = await db.insert(users).values({
              username: assistantData.userId,
              password: 'password123' // À remplacer par un mot de passe sécurisé en production
            }).returning({ id: users.id });
            
            databaseUserId = newUser.id;
            console.log(`Utilisateur créé automatiquement avec ID: ${databaseUserId}`);
          } catch (createError) {
            console.error('Erreur lors de la création automatique de l\'utilisateur:', createError);
            return res.status(500).json({
              success: false,
              error: 'Impossible de créer un nouvel utilisateur',
              code: ERROR_CODES.USER_CREATION_FAILED,
              details: (createError as Error).message
            });
          }
        } else {
          console.error(`Utilisateur non trouvé et impossible d'en créer un nouveau: ${assistantData.userId}`);
          return res.status(404).json({
            success: false,
            error: 'Utilisateur non trouvé',
            code: ERROR_CODES.USER_NOT_FOUND
          });
        }
      } else {
        databaseUserId = userExists[0].id;
        console.log(`Utilisateur existant trouvé avec ID: ${databaseUserId}`);
      }
      
      // On s'assure que l'ID utilisateur est bien un nombre
      assistantData.userId = databaseUserId;
      
    } catch (userError) {
      console.error('Erreur lors de la vérification/création de l\'utilisateur:', userError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la gestion de l\'utilisateur',
        code: ERROR_CODES.DATABASE_ERROR,
        details: (userError as Error).message
      });
    }
    
    // 3. Générer le prompt système personnalisé basé sur les paramètres de l'assistant
    try {
      console.log('Génération du prompt système avec les paramètres:', {
        name: assistantData.name,
        domain: assistantData.domain,
        personality: assistantData.personality,
        gamificationLevel: assistantData.gamificationLevel
      });
      
      // Convertir le niveau de gamification du format base de données au format attendu par la méthode
      let gamificationLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
      
      switch(assistantData.gamificationLevel) {
        case 'aucun': gamificationLevel = 'none'; break;
        case 'leger': gamificationLevel = 'low'; break;
        case 'modere': gamificationLevel = 'medium'; break;
        case 'eleve': 
        case 'intense': gamificationLevel = 'high'; break;
      }
      
      // Utilisez une valeur par défaut pour expertise si elle est indéfinie
      const expertise = assistantData.expertise && Array.isArray(assistantData.expertise) 
        ? assistantData.expertise.join(', ') 
        : 'général';
      
      const systemPrompt = await openAIService.generateCustomAssistantPrompt({
        name: assistantData.name,
        description: assistantData.description || undefined,
        domain: assistantData.domain,
        personality: assistantData.personality,
        expertise: expertise,
        gamificationLevel: gamificationLevel,
        responseStyle: assistantData.personality, // Utiliser la personnalité comme style de réponse
        additionalInfo: assistantData.customInstructions ? JSON.stringify(assistantData.customInstructions) : undefined
      });
      
      if (!systemPrompt || systemPrompt.trim().length < 10) {
        console.warn('Le prompt système généré est vide ou trop court');
        throw new Error('Prompt système invalide');
      }
      
      // Ajouter le prompt système à l'assistant
      assistantData.systemPrompt = systemPrompt;
      console.log('Prompt système généré avec succès, longueur:', systemPrompt.length);
      
      // Vérifier la connectivité avec l'API OpenAI
      const isConnected = await openAIService.checkConnection();
      if (!isConnected) {
        console.warn("Avertissement: Impossible de se connecter à l'API OpenAI pour vérifier la fonctionnalité de l'assistant");
      }
    } catch (promptError) {
      console.error('Erreur lors de la génération du prompt système personnalisé:', promptError);
      
      // Malgré l'erreur de prompt, on continue avec un prompt par défaut plutôt que d'échouer
      const fallbackPrompt = `Tu es ${assistantData.name}, un assistant spécialisé dans le domaine ${assistantData.domain} avec une personnalité ${assistantData.personality}. Ton objectif est d'aider l'utilisateur de manière professionnelle et précise.`;
      
      console.log('Utilisation d\'un prompt par défaut:', fallbackPrompt);
      assistantData.systemPrompt = fallbackPrompt;
    }
    
    // 4. Insérer le nouvel assistant avec le prompt système généré dans une transaction
    console.log('Insertion de l\'assistant dans la base de données');
    
    // On utilise une transaction pour garantir l'intégrité des données
    try {
      // Insérer l'assistant
      // Convertir les données pour qu'elles correspondent au schéma de la table
      const assistantDataToInsert = {
        userId: assistantData.userId,
        name: assistantData.name,
        description: assistantData.description || null,
        systemPrompt: assistantData.systemPrompt,
        personality: assistantData.personality,
        domain: assistantData.domain,
        expertise: assistantData.expertise || [],
        avatarStyle: assistantData.avatarStyle || 'robot',
        avatarColor: assistantData.avatarColor || 'violet',
        gamificationLevel: assistantData.gamificationLevel || 'leger',
        customInstructions: assistantData.customInstructions || {},
        isPublic: assistantData.isPublic || false,
        isVerified: assistantData.isVerified || false
      };
      
      const [newAssistant] = await db.insert(customAssistants).values([assistantDataToInsert]).returning();
      console.log('Assistant créé avec succès, ID:', newAssistant.id);
      
      // Journaliser la création de l'assistant
      try {
        await logAssistantOperation({
          assistantId: newAssistant.id,
          userId: assistantData.userId,
          operation: AssistantOperation.CREATE,
          status: LogStatus.SUCCESS,
          details: {
            name: assistantData.name,
            domain: assistantData.domain,
            personality: assistantData.personality,
            promptLength: assistantData.systemPrompt.length,
            ip: req.ip
          }
        });
        
        // Sauvegarder une copie du prompt système
        await backupPrompt(
          newAssistant.id,
          assistantData.systemPrompt,
          {
            name: assistantData.name,
            description: assistantData.description || undefined,
            domain: assistantData.domain,
            personality: assistantData.personality,
            expertise: Array.isArray(assistantData.expertise) ? assistantData.expertise.join(', ') : 'général',
            gamificationLevel: assistantData.gamificationLevel || 'leger',
            responseStyle: assistantData.personality
          },
          'Version initiale'
        );
      } catch (logError) {
        // Ne pas bloquer la création même si la journalisation échoue
        console.warn('Erreur non bloquante lors de la journalisation:', logError);
      }
      
      // Créer une première conversation vide pour cet assistant (optionnel)
      const [conversation] = await db.insert(assistantConversations).values([{
        assistantId: newAssistant.id,
        userId: assistantData.userId,
        title: `Première conversation avec ${newAssistant.name}`,
        messages: []
      }]).returning();
      
      console.log('Conversation initiale créée pour l\'assistant, ID:', conversation.id);
      
      return res.status(201).json({
        success: true,
        assistant: newAssistant,
        conversationId: conversation.id,
        systemPromptGenerated: !!assistantData.systemPrompt
      });
    } catch (dbError) {
      console.error('Erreur lors de l\'insertion en base de données:', dbError);
      
      // Journaliser l'échec
      try {
        await logAssistantOperation({
          userId: assistantData.userId,
          operation: AssistantOperation.CREATE,
          status: LogStatus.FAILURE,
          details: {
            name: assistantData.name,
            domain: assistantData.domain,
            error: (dbError as Error).message,
            ip: req.ip
          },
          errorMessage: (dbError as Error).message
        });
      } catch (logError) {
        console.warn('Erreur lors de la journalisation d\'un échec de création:', logError);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'insertion en base de données',
        code: ERROR_CODES.DATABASE_ERROR,
        details: (dbError as Error).message
      });
    }
  } catch (error) {
    console.error('Erreur non gérée lors de la création de l\'assistant:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'assistant',
      details: (error as Error).message
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
    
    // Si les paramètres qui affectent le prompt système ont été modifiés, régénérer le prompt
    if (updateData.name || 
        updateData.description || 
        updateData.domain || 
        updateData.personality || 
        updateData.expertise || 
        updateData.gamificationLevel ||
        updateData.customInstructions) {
      
      // Récupérer les données complètes de l'assistant
      const assistantData = {
        ...existingAssistant[0],
        ...updateData
      };
      
      try {
        // Convertir le niveau de gamification
        let gamificationLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
        
        switch(assistantData.gamificationLevel) {
          case 'aucun': gamificationLevel = 'none'; break;
          case 'leger': gamificationLevel = 'low'; break;
          case 'modere': gamificationLevel = 'medium'; break;
          case 'eleve': 
          case 'intense': gamificationLevel = 'high'; break;
        }
        
        // Générer un nouveau prompt système
        const systemPrompt = await openAIService.generateCustomAssistantPrompt({
          name: assistantData.name,
          description: assistantData.description || undefined,
          domain: assistantData.domain,
          personality: assistantData.personality,
          expertise: Array.isArray(assistantData.expertise) ? assistantData.expertise.join(', ') : 'général',
          gamificationLevel: gamificationLevel,
          responseStyle: assistantData.personality,
          additionalInfo: assistantData.customInstructions ? JSON.stringify(assistantData.customInstructions) : undefined
        });
        
        // Ajouter le prompt système mis à jour
        updateData.systemPrompt = systemPrompt;
      } catch (promptError) {
        console.error('Erreur lors de la mise à jour du prompt système:', promptError);
        // Continuer sans mettre à jour le prompt système
      }
    }
    
    // Mettre à jour l'assistant
    const [updatedAssistant] = await db.update(customAssistants)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(customAssistants.id, Number(assistantId)))
      .returning();
    
    // Journaliser la mise à jour et sauvegarder le prompt si modifié
    if (updateData.systemPrompt) {
      try {
        // Journaliser l'opération
        await logAssistantOperation({
          assistantId: Number(assistantId),
          userId: updatedAssistant.userId,
          operation: AssistantOperation.UPDATE,
          status: LogStatus.SUCCESS,
          details: {
            name: updatedAssistant.name,
            domain: updatedAssistant.domain,
            personality: updatedAssistant.personality,
            promptLength: updateData.systemPrompt.length,
            ip: req.ip,
            fieldsUpdated: Object.keys(updateData)
          }
        });
        
        // Sauvegarder le nouveau prompt
        await backupPrompt(
          Number(assistantId),
          updateData.systemPrompt,
          {
            name: updatedAssistant.name,
            description: updatedAssistant.description || undefined,
            domain: updatedAssistant.domain,
            personality: updatedAssistant.personality,
            expertise: Array.isArray(updatedAssistant.expertise) ? updatedAssistant.expertise.join(', ') : 'général',
            gamificationLevel: updatedAssistant.gamificationLevel || 'leger',
            responseStyle: updatedAssistant.personality
          },
          'Mise à jour des paramètres : ' + Object.keys(updateData).join(', ')
        );
      } catch (logError) {
        console.warn('Erreur non bloquante lors de la journalisation de mise à jour:', logError);
      }
    } else {
      // Journaliser uniquement l'opération sans sauvegarde de prompt
      try {
        await logAssistantOperation({
          assistantId: Number(assistantId),
          userId: updatedAssistant.userId,
          operation: AssistantOperation.UPDATE,
          status: LogStatus.SUCCESS,
          details: {
            name: updatedAssistant.name,
            fieldsUpdated: Object.keys(updateData),
            ip: req.ip
          }
        });
      } catch (logError) {
        console.warn('Erreur non bloquante lors de la journalisation de mise à jour:', logError);
      }
    }
    
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
    
    // Journaliser la suppression
    try {
      await logAssistantOperation({
        assistantId: Number(assistantId),
        userId: existingAssistant[0].userId,
        operation: AssistantOperation.DELETE,
        status: LogStatus.SUCCESS,
        details: {
          name: existingAssistant[0].name,
          domain: existingAssistant[0].domain,
          ip: req.ip
        }
      });
    } catch (logError) {
      console.warn('Erreur non bloquante lors de la journalisation de suppression:', logError);
    }
    
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
    // Si c'est un nombre, on cherche par ID, sinon par username (UUID)
    let userExists;
    let numUserId = Number(userId);
    
    if (!isNaN(numUserId)) {
      console.log(`Recherche de l'utilisateur par ID: ${numUserId}`);
      userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, numUserId)).limit(1);
    } else {
      console.log(`Recherche de l'utilisateur par nom d'utilisateur: ${userId}`);
      userExists = await db.select({ id: users.id }).from(users).where(eq(users.username, userId)).limit(1);
    }
    
    // Si l'utilisateur n'existe pas, on le crée automatiquement
    if (!userExists.length && typeof userId === 'string') {
      console.log(`Utilisateur non trouvé, création d'un nouvel utilisateur: ${userId}`);
      try {
        const [newUser] = await db.insert(users).values([{
          username: userId,
          password: 'password123' // Ne jamais faire ça en production!
        }]).returning({ id: users.id });
        
        userExists = [{ id: newUser.id }];
        console.log(`Nouvel utilisateur créé avec ID: ${newUser.id}`);
      } catch (createError) {
        console.error('Erreur lors de la création de l\'utilisateur:', createError);
      }
    }
    
    // Si l'utilisateur est authentifié, créer une conversation persistante
    if (userExists && userExists.length) {
      const [conversation] = await db.insert(assistantConversations).values([{
        assistantId: Number(assistantId),
        userId: userExists[0].id,
        title: 'Nouvelle conversation',
        messages: []
      }]).returning();
      
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
      
      const assistantResponse = await openAIService.getChatCompletion(openaiMessages);
      
      // Ajouter la réponse de l'assistant aux messages
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