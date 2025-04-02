import { Express, Request, Response } from 'express';
import { conversationHandler } from './conversation-handler';
import { userProfileHandler } from './user-profile-handler';
import { missionHandler } from './mission-handler';
import { getMissionById, getAvailableMissions, getNPCById } from '../data';

/**
 * Enregistre les routes API pour le module I AM CYBER NEW
 * @param app Application Express
 */
export function registerIAmCyberRoutes(app: Express): void {
  // API pour créer un profil utilisateur
  app.post('/api/cyber/new/profile', (req: Request, res: Response) => {
    try {
      const { name, avatarId, roleId } = req.body;
      
      if (!name || !avatarId || !roleId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const profile = userProfileHandler.createUserProfile(name, avatarId, roleId);
      
      return res.status(201).json(profile);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour récupérer un profil utilisateur
  app.get('/api/cyber/new/profile/:profileId', (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      
      const profile = userProfileHandler.getUserProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour récupérer les missions disponibles
  app.get('/api/cyber/new/missions/available', (req: Request, res: Response) => {
    try {
      const missions = getAvailableMissions();
      
      return res.status(200).json(missions);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour commencer une mission et initialiser la conversation en une seule requête
  app.post('/api/cyber/new/missions/start', (req: Request, res: Response) => {
    try {
      const { profileId, missionId } = req.body;
      
      if (!profileId || !missionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Récupérer la mission et le profil
      const mission = missionHandler.startMission(profileId, missionId);
      const profile = userProfileHandler.getUserProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Créer une conversation directement
      const defaultNpcId = mission.primaryNPC;
      
      if (!defaultNpcId) {
        return res.status(400).json({ error: 'No primary NPC defined for this mission' });
      }
      
      // Créer la conversation avec le PNJ principal
      const conversationId = conversationHandler.createConversation(
        defaultNpcId,
        profile,
        mission
      );
      
      // Récupérer la conversation et ses messages
      const conversation = conversationHandler.getConversation(conversationId);
      if (!conversation) {
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
      
      const messages = conversationHandler.getConversationMessages(conversationId);
      
      // Récupérer les PNJs disponibles
      let availableNPCs = [conversation.currentNPC];
      if (mission.supportNPCs && mission.supportNPCs.length > 0) {
        const supportNPCs = mission.supportNPCs
          .map(npcId => getNPCById(npcId))
          .filter(npc => npc !== undefined);
        
        if (supportNPCs.length > 0) {
          availableNPCs = [conversation.currentNPC, ...supportNPCs];
        }
      }
      
      // Renvoyer toutes les données en une seule réponse pour éviter les allers-retours
      return res.status(200).json({
        mission,
        conversationId,
        messages,
        currentNPC: conversation.currentNPC,
        availableNPCs
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour récupérer la mission active
  app.get('/api/cyber/new/missions/active/:profileId', (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      
      const mission = missionHandler.getActiveMission(profileId);
      
      if (!mission) {
        return res.status(404).json({ error: 'No active mission found' });
      }
      
      return res.status(200).json(mission);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour valider un objectif de mission par quiz
  app.post('/api/cyber/new/missions/validate-quiz', (req: Request, res: Response) => {
    try {
      const { profileId, objectiveId, answers } = req.body;
      
      if (!profileId || !objectiveId || !answers) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = missionHandler.validateQuizObjective(profileId, objectiveId, answers);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour créer une conversation
  app.post('/api/cyber/new/conversations', (req: Request, res: Response) => {
    try {
      const { profileId, npcId, missionId } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ error: 'Profile ID is required' });
      }
      
      const profile = userProfileHandler.getUserProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      let mission;
      let effectiveNpcId = npcId;
      
      // Récupérer la mission
      if (missionId) {
        mission = getMissionById(missionId);
        if (!mission) {
          return res.status(404).json({ error: 'Mission not found' });
        }
        
        // Si npcId n'est pas fourni, utiliser le PNJ principal de la mission
        if (!effectiveNpcId && mission.primaryNPC) {
          effectiveNpcId = mission.primaryNPC;
        }
      } else {
        mission = missionHandler.getActiveMission(profileId);
        if (mission && !effectiveNpcId && mission.primaryNPC) {
          effectiveNpcId = mission.primaryNPC;
        }
      }
      
      // Vérifier qu'on a un NPC à ce stade
      if (!effectiveNpcId) {
        return res.status(400).json({ error: 'NPC ID is required' });
      }
      
      // Créer la conversation
      const conversationId = conversationHandler.createConversation(effectiveNpcId, profile, mission);
      
      return res.status(201).json({ conversationId });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour envoyer un message dans une conversation
  app.post('/api/cyber/new/conversations/:conversationId/messages', (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { message, type } = req.body;
      
      if (!message || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Ajouter le message à la conversation
      const sentMessage = conversationHandler.addMessageToConversation(
        conversationId,
        type,
        message
      );
      
      // Si c'est un message utilisateur, générer une réponse du PNJ
      if (type === 'user') {
        // Dans une implémentation réelle, ici on devrait :
        // 1. Préparer le prompt pour l'IA avec conversationHandler.prepareAIPrompt(conversationId)
        // 2. Envoyer le prompt à l'API OpenAI pour obtenir une réponse
        // 3. Ajouter la réponse du PNJ à la conversation
        
        // Pour l'instant, on simule une réponse
        const conversation = conversationHandler.getConversation(conversationId);
        
        if (conversation) {
          const npc = conversation.currentNPC;
          
          // Simuler un délai de traitement (non implémenté ici)
          
          // Ajouter une réponse simulée
          const responseMessage = conversationHandler.addMessageToConversation(
            conversationId,
            'bot',
            `Je suis ${npc.name}, ${npc.role}. Voici ma réponse simulée à votre message : "${message}"`,
            npc.name,
            npc.role
          );
          
          // Renvoyer tous les messages de la conversation
          const messages = conversationHandler.getConversationMessages(conversationId);
          
          return res.status(200).json({ messages });
        }
      }
      
      const messages = conversationHandler.getConversationMessages(conversationId);
      
      return res.status(200).json({ messages });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour récupérer les messages d'une conversation
  app.get('/api/cyber/new/conversations/:conversationId/messages', (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      
      // Récupérer la conversation complète pour avoir accès aux données comme le NPC actuel et la mission
      const conversation = conversationHandler.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Récupérer les messages
      const messages = conversationHandler.getConversationMessages(conversationId);
      
      // Récupérer les NPCs disponibles pour la mission si elle existe
      let availableNPCs = [conversation.currentNPC];
      if (conversation.contextualData.activeMission) {
        const mission = conversation.contextualData.activeMission;
        if (mission.supportNPCs && mission.supportNPCs.length > 0) {
          // Ajouter les NPCs de support à la liste
          const supportNPCs = mission.supportNPCs
            .map(npcId => getNPCById(npcId))
            .filter(npc => npc !== undefined);
          
          availableNPCs = [conversation.currentNPC, ...supportNPCs];
        }
      }
      
      // Retourner l'ensemble des données nécessaires au client
      return res.status(200).json({ 
        messages, 
        mission: conversation.contextualData.activeMission,
        currentNPC: conversation.currentNPC,
        availableNPCs
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // API pour changer le PNJ d'une conversation
  app.post('/api/cyber/new/conversations/:conversationId/change-npc', (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { npcId } = req.body;
      
      if (!npcId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      conversationHandler.changeNPC(conversationId, npcId);
      
      const messages = conversationHandler.getConversationMessages(conversationId);
      
      return res.status(200).json({ messages });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });
}