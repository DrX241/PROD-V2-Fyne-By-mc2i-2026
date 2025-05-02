import { Request, Response } from 'express';
import { db } from './db';
import { mcaiSessions, mcaiMessages } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration OpenAI
import { openAIService } from './services/openai';

// Structure pour le statut d'une session
interface SessionStatus {
  trigramme: string | null;
  metier: string | null;
  mode: 'classique' | 'immersion' | null;
  formation: 'interne' | 'externe' | null;
  formationChoisie: string | null;
  stageActuel: 'introduction' | 'choix_mode' | 'choix_formation' | 'formation' | 'scenario' | null;
  scenarioActuel: number;
}

/**
 * Initialise une session de chat mc2i AI Learning
 */
export async function initMcaiLearningSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'L\'identifiant utilisateur est requis'
      });
    }

    // Vérifier si une session existe déjà pour cet utilisateur
    const existingSession = await db.select()
      .from(mcaiSessions)
      .where(eq(mcaiSessions.userId, userId));

    let sessionId: number;
    let sessionStatus: SessionStatus;
    let conversationContext: any[] = [];

    if (existingSession.length > 0) {
      // Session existante, mettre à jour lastInteraction
      const session = existingSession[0];
      sessionId = session.id;
      sessionStatus = {
        trigramme: session.trigramme,
        metier: session.metier,
        mode: session.mode as any,
        formation: session.formation as any,
        formationChoisie: session.formationChoisie,
        stageActuel: session.stageActuel as any,
        scenarioActuel: session.scenarioActuel
      };
      conversationContext = session.conversationContext as any[];

      // Mise à jour de lastInteraction
      await db.update(mcaiSessions)
        .set({ lastInteraction: new Date() })
        .where(eq(mcaiSessions.id, sessionId));
    } else {
      // Créer une nouvelle session
      const newSession = await db.insert(mcaiSessions)
        .values({
          userId,
          trigramme: null,
          metier: null,
          mode: null,
          formation: null,
          formationChoisie: null,
          stageActuel: 'introduction',
          scenarioActuel: 0,
          conversationContext: []
        })
        .returning();

      sessionId = newSession[0].id;
      sessionStatus = {
        trigramme: null,
        metier: null,
        mode: null,
        formation: null,
        formationChoisie: null,
        stageActuel: 'introduction',
        scenarioActuel: 0
      };
    }

    // Message de bienvenue
    let welcomeMessage = '';
    
    if (sessionStatus.stageActuel === 'introduction') {
      welcomeMessage = 'Bonjour et bienvenue dans mc2i AI Learning ! Je suis votre assistant virtuel dédié à la formation et à l\'évaluation. Pour commencer, pourriez-vous me donner votre trigramme ?';
      
      // Ajouter le message au historique
      await db.insert(mcaiMessages)
        .values({
          sessionId,
          role: 'assistant',
          content: welcomeMessage
        });
    } else {
      // Récupérer les messages précédents (limite aux 5 derniers)
      const lastMessages = await db.select()
        .from(mcaiMessages)
        .where(eq(mcaiMessages.sessionId, sessionId))
        .limit(5);
      
      welcomeMessage = 'Bon retour dans mc2i AI Learning ! Nous reprenons là où nous nous étions arrêtés.';
      
      // Ajouter le message au historique
      await db.insert(mcaiMessages)
        .values({
          sessionId,
          role: 'assistant',
          content: welcomeMessage
        });
    }

    return res.json({
      success: true,
      message: welcomeMessage,
      sessionStatus
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'initialisation de la session'
    });
  }
}

/**
 * Traite un message envoyé par l'utilisateur
 */
export async function processMcaiLearningMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'L\'identifiant utilisateur et le message sont requis'
      });
    }

    // Vérifier si une session existe pour cet utilisateur
    const existingSession = await db.select()
      .from(mcaiSessions)
      .where(eq(mcaiSessions.userId, userId));

    if (existingSession.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }

    const session = existingSession[0];
    const sessionId = session.id;
    
    // Récupérer l'historique des messages
    const messageHistory = await db.select()
      .from(mcaiMessages)
      .where(eq(mcaiMessages.sessionId, sessionId));

    // Ajouter le message utilisateur à la base de données
    await db.insert(mcaiMessages)
      .values({
        sessionId,
        role: 'user',
        content: message
      });

    // Mise à jour de lastInteraction
    await db.update(mcaiSessions)
      .set({ lastInteraction: new Date() })
      .where(eq(mcaiSessions.id, sessionId));

    // Préparer les messages pour l'API OpenAI
    let conversationContext = session.conversationContext || [];
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'EEEE d MMMM yyyy à HH:mm', { locale: fr });

    // Construction du système prompt
    let systemPrompt = `Vous êtes mc2i AI Learning, un chatbot de formation développé par le cabinet de conseil mc2i. Nous sommes le ${formattedDate}.

Vous êtes spécialisé dans l'évaluation et la formation personnalisée en fonction des métiers de mc2i.
Gardez toujours en mémoire le trigramme et le métier de l'utilisateur, et adaptez vos réponses en conséquence.

Étapes de la conversation:
1. Introduction - Demandez le trigramme de l'utilisateur
2. Métier - Demandez le métier de l'utilisateur (Consultant cybersécurité, Consultant AMOA, etc.)
3. Choix du mode - Proposez deux modes: Classique (4 scénarios) ou Immersion (6 scénarios)
4. Choix de la formation - Proposez deux types: Formation interne (nouveaux consultants) ou Formation externe (préparation d'audit client)
5. Formation - Générez des scénarios pertinents en fonction des choix précédents

Utilisez toujours le vouvoiement et une communication professionnelle, à l'image de mc2i.
Pour les scénarios, créez des jeux de rôle réalistes et détaillés dans le domaine choisi.
Si vous devez envoyer un email, formatez-le correctement avec les en-têtes (De, À, Objet) et utilisez toujours des domaines @mc2i.fr.

État actuel de la session:
- Trigramme: ${session.trigramme || 'Non défini'}
- Métier: ${session.metier || 'Non défini'}
- Mode: ${session.mode || 'Non défini'}
- Type de formation: ${session.formation || 'Non défini'}
- Formation choisie: ${session.formationChoisie || 'Non défini'}
- Étape actuelle: ${session.stageActuel || 'introduction'}
- Scénario actuel: ${session.scenarioActuel || 0}`;

    // Conversion de l'historique pour OpenAI
    const apiMessages = messageHistory.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content
    }));

    // Ajouter les messages de contextualisation s'ils existent
    const fullApiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationContext,
      ...apiMessages
    ];

    // Appel à l'API OpenAI avec le service existant
    const responseContent = await openAIService.getChatCompletion(
      fullApiMessages,
      0.7,
      2000
    );

    // Ajouter la réponse de l'assistant à la base de données
    await db.insert(mcaiMessages)
      .values({
        sessionId,
        role: 'assistant',
        content: responseContent
      });

    // Analyser la réponse pour mettre à jour le statut de la session
    let sessionStatus: SessionStatus = {
      trigramme: session.trigramme,
      metier: session.metier,
      mode: session.mode as any,
      formation: session.formation as any,
      formationChoisie: session.formationChoisie,
      stageActuel: session.stageActuel as any,
      scenarioActuel: session.scenarioActuel
    };

    // Logique pour déterminer les changements d'état basés sur les messages
    // Détection du trigramme (format de 3 lettres majuscules)
    if (!sessionStatus.trigramme && message.match(/[A-Z]{3}/)) {
      const trigrammeMatch = message.match(/[A-Z]{3}/);
      if (trigrammeMatch) {
        sessionStatus.trigramme = trigrammeMatch[0];
        await db.update(mcaiSessions)
          .set({ trigramme: sessionStatus.trigramme })
          .where(eq(mcaiSessions.id, sessionId));
      }
    }

    // Détection du métier
    if (sessionStatus.trigramme && !sessionStatus.metier) {
      const metierKeywords = ['cyber', 'amoa', 'consultant', 'développeur', 'chef de projet'];
      const messageLC = message.toLowerCase();
      
      for (const keyword of metierKeywords) {
        if (messageLC.includes(keyword)) {
          sessionStatus.metier = message;
          sessionStatus.stageActuel = 'choix_mode';
          
          await db.update(mcaiSessions)
            .set({ 
              metier: sessionStatus.metier,
              stageActuel: 'choix_mode'
            })
            .where(eq(mcaiSessions.id, sessionId));
          
          break;
        }
      }
    }

    // Détection du mode
    if (sessionStatus.stageActuel === 'choix_mode') {
      const messageLC = message.toLowerCase();
      
      if (messageLC.includes('classique')) {
        sessionStatus.mode = 'classique';
        sessionStatus.stageActuel = 'choix_formation';
        
        await db.update(mcaiSessions)
          .set({ 
            mode: 'classique',
            stageActuel: 'choix_formation'
          })
          .where(eq(mcaiSessions.id, sessionId));
      } else if (messageLC.includes('immersion')) {
        sessionStatus.mode = 'immersion';
        sessionStatus.stageActuel = 'choix_formation';
        
        await db.update(mcaiSessions)
          .set({ 
            mode: 'immersion',
            stageActuel: 'choix_formation'
          })
          .where(eq(mcaiSessions.id, sessionId));
      }
    }

    // Détection du type de formation
    if (sessionStatus.stageActuel === 'choix_formation') {
      const messageLC = message.toLowerCase();
      
      if (messageLC.includes('interne')) {
        sessionStatus.formation = 'interne';
        sessionStatus.stageActuel = 'formation';
        
        await db.update(mcaiSessions)
          .set({ 
            formation: 'interne',
            stageActuel: 'formation'
          })
          .where(eq(mcaiSessions.id, sessionId));
      } else if (messageLC.includes('externe')) {
        sessionStatus.formation = 'externe';
        sessionStatus.stageActuel = 'formation';
        
        await db.update(mcaiSessions)
          .set({ 
            formation: 'externe',
            stageActuel: 'formation'
          })
          .where(eq(mcaiSessions.id, sessionId));
      }
    }

    // Dans le cas d'une formation, on peut détecter certains choix spécifiques
    if (sessionStatus.stageActuel === 'formation') {
      // Logique pour détecter le passage à un scénario
      if (responseContent.toLowerCase().includes('scénario') && !sessionStatus.formationChoisie) {
        await db.update(mcaiSessions)
          .set({ 
            stageActuel: 'scenario',
            formationChoisie: sessionStatus.metier
          })
          .where(eq(mcaiSessions.id, sessionId));
        
        sessionStatus.stageActuel = 'scenario';
        sessionStatus.formationChoisie = sessionStatus.metier;
      }
    }

    // Pour les scénarios, on peut suivre la progression
    if (sessionStatus.stageActuel === 'scenario') {
      // Logique pour détecter le passage au scénario suivant
      const scenarioCompletionKeywords = ['scenario suivant', 'scénario suivant', 'continuer'];
      const messageLC = message.toLowerCase();
      
      for (const keyword of scenarioCompletionKeywords) {
        if (messageLC.includes(keyword)) {
          const newScenarioNumber = sessionStatus.scenarioActuel + 1;
          const maxScenarios = sessionStatus.mode === 'classique' ? 4 : 6;
          
          if (newScenarioNumber < maxScenarios) {
            await db.update(mcaiSessions)
              .set({ scenarioActuel: newScenarioNumber })
              .where(eq(mcaiSessions.id, sessionId));
            
            sessionStatus.scenarioActuel = newScenarioNumber;
          }
          
          break;
        }
      }
    }

    return res.json({
      success: true,
      message: responseContent,
      sessionStatus
    });
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement du message'
    });
  }
}