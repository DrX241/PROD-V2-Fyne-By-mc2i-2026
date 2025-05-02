import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de chatbot
interface LearningBotSession {
  mode: 'classique' | 'immersion' | null;
  formation: 'interne' | 'externe' | null;
  formationChoisie: string | null;
  stageActuel: 'choix_mode' | 'choix_formation' | 'formation' | 'scenario' | null;
  scenarioActuel: number;
  reponses: Array<{question: string, reponse: string}>;
  messages: Array<ChatCompletionRequestMessage>;
}

// Map pour stocker les sessions par ID utilisateur
const botSessions = new Map<string, LearningBotSession>();

/**
 * Initialise une session de chatbot mc2i AI Learning
 */
export async function initMcaiLearningSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }

    // Créer une nouvelle session ou réinitialiser une existante
    const session: LearningBotSession = {
      mode: null,
      formation: null,
      formationChoisie: null,
      stageActuel: 'choix_mode',
      scenarioActuel: 0,
      reponses: [],
      messages: []
    };

    // Ajouter le message système initial
    session.messages.push({
      role: "system",
      content: getMcaiLearningSystemPrompt()
    } as ChatCompletionRequestMessage);

    // Stocker la session
    botSessions.set(userId, session);

    // Générer le message d'accueil
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour et bienvenue sur AI Learning, votre Chatbot spécialisé dans l'évaluation en temps réel. Veuillez choisir entre deux modes d'apprentissage :\n1. Un apprentissage classique avec 4 scénarios différents sans lien direct entre eux\n2. Un effet immersion avec 6 scénarios reliés entre eux où chaque décision a un impact immédiat sur la suite"
    };

    session.messages.push(welcomeMessage);

    return res.status(200).json({ 
      success: true,
      message: welcomeMessage.content,
      sessionStatus: getSessionStatus(session)
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation de la session" });
  }
}

/**
 * Traite un message envoyé au chatbot mc2i AI Learning
 */
export async function processMcaiLearningMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "ID utilisateur ou message manquant" });
    }

    // Récupérer la session existante
    const session = botSessions.get(userId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }

    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: "user",
      content: message
    } as ChatCompletionRequestMessage);

    // Traiter le message en fonction de l'état actuel de la session
    const processedResponse = await processMessageBasedOnStage(session, message);

    // Ajouter la réponse du système
    session.messages.push({
      role: "assistant",
      content: processedResponse
    } as ChatCompletionRequestMessage);

    return res.status(200).json({ 
      success: true,
      message: processedResponse,
      sessionStatus: getSessionStatus(session)
    });
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Traite le message en fonction de l'étape actuelle de la session
 */
async function processMessageBasedOnStage(session: LearningBotSession, message: string): Promise<string> {
  // Étape de choix du mode (classique ou immersion)
  if (session.stageActuel === 'choix_mode') {
    if (message.toLowerCase().includes('classique') || message.toLowerCase().includes('1')) {
      session.mode = 'classique';
      session.stageActuel = 'choix_formation';
      return "Excellent choix ! Vous avez choisi le mode classique avec 4 scénarios.\n\nSouhaitez-vous :\n1. Me fournir une formation de votre choix (format PDF ou Word)\n2. Choisir parmi nos 10 formations généralistes en lien avec les différentes expertises";
    } 
    else if (message.toLowerCase().includes('immersion') || message.toLowerCase().includes('2')) {
      session.mode = 'immersion';
      session.stageActuel = 'choix_formation';
      return "Excellent choix ! Vous avez choisi le mode immersion avec 6 scénarios reliés.\n\nSouhaitez-vous :\n1. Me fournir une formation de votre choix (format PDF ou Word)\n2. Choisir parmi nos 10 formations généralistes en lien avec les différentes expertises";
    } 
    else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez choisir entre :\n1. Apprentissage classique\n2. Effet immersion";
    }
  }
  // Étape de choix de formation
  else if (session.stageActuel === 'choix_formation') {
    if (message.toLowerCase().includes('fournir') || message.toLowerCase().includes('pdf') || message.toLowerCase().includes('word') || message.toLowerCase().includes('1')) {
      session.formation = 'externe';
      return "J'attends maintenant que vous me fournissiez votre document de formation au format PDF ou Word.";
    } 
    else if (message.toLowerCase().includes('choisir') || message.toLowerCase().includes('généraliste') || message.toLowerCase().includes('2')) {
      session.formation = 'interne';
      session.stageActuel = 'formation';
      return "Voici les 10 formations disponibles. Veuillez choisir celle qui vous intéresse :\n\n1. Pilotage de projet et AMOA\n2. Conduite du changement\n3. Agilité\n4. Stratégie\n5. Cybersécurité\n6. Data & IA\n7. Accompagnement au déploiement\n8. Innovation et Technologies\n9. Cloud\n10. UX et Design Thinking";
    } 
    else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez choisir entre :\n1. Fournir votre propre formation\n2. Choisir parmi nos formations généralistes";
    }
  }
  // Étape de sélection d'une formation interne
  else if (session.stageActuel === 'formation' && session.formation === 'interne') {
    const formations = [
      'Pilotage de projet et AMOA', 
      'Conduite du changement', 
      'Agilité', 
      'Stratégie', 
      'Cybersécurité', 
      'Data & IA', 
      'Accompagnement au déploiement', 
      'Innovation et Technologies', 
      'Cloud', 
      'UX et Design Thinking'
    ];

    let formationChoisie = null;
    if (/^[1-9]|10$/.test(message.trim())) {
      const index = parseInt(message.trim()) - 1;
      if (index >= 0 && index < formations.length) {
        formationChoisie = formations[index];
      }
    } else {
      formationChoisie = formations.find(f => message.toLowerCase().includes(f.toLowerCase()));
    }

    if (formationChoisie) {
      session.formationChoisie = formationChoisie;
      session.stageActuel = 'scenario';
      return await generateScenario(session);
    } else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez choisir une formation valide de la liste, soit en indiquant son numéro (1-10), soit en indiquant son nom.";
    }
  }
  // Étape de scénario
  else if (session.stageActuel === 'scenario') {
    if (message.length < 30) {
      return "⚠️ Erreur de Commande ⚠️\n\nVotre réponse est trop courte. Elle doit faire au moins 30 caractères.";
    }

    session.reponses.push({
      question: session.messages[session.messages.length - 2].content,
      reponse: message
    });

    session.scenarioActuel++;

    if ((session.mode === 'classique' && session.scenarioActuel >= 4) || 
        (session.mode === 'immersion' && session.scenarioActuel >= 6)) {
      return await generateFeedbackGlobal(session);
    }

    return await generateScenario(session, message);
  }

  return await generateGenericResponse(session, message);
}

/**
 * Récupère le statut actuel de la session
 */
function getSessionStatus(session: LearningBotSession) {
  return {
    mode: session.mode,
    formation: session.formation,
    formationChoisie: session.formationChoisie,
    stageActuel: session.stageActuel,
    scenarioActuel: session.scenarioActuel
  };
}

/**
 * Génère un prompt système pour le chatbot mc2i AI Learning
 */
function getMcaiLearningSystemPrompt(): string {
  return `Tu es un assistant d'apprentissage spécialisé qui évalue les compétences des apprenants en temps réel. Tu crées des scénarios professionnels réalistes adaptés à la formation choisie.`;
}

/**
 * Génère un scénario basé sur le mode et la formation choisie
 */
async function generateScenario(session: LearningBotSession, lastResponse: string = ""): Promise<string> {
  try {
    const currentDate = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    };
    const formattedDate = currentDate.toLocaleDateString('fr-FR', dateOptions);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const promptScenario = `
Génère un scénario professionnel ${session.scenarioActuel + 1}/${session.mode === 'classique' ? '4' : '6'} 
pour la formation "${session.formationChoisie}" en mode ${session.mode}.
${session.mode === 'immersion' ? `\nDernière réponse : "${lastResponse}"` : ''}
Date actuelle : ${capitalizedDate}

FORMAT EMAIL REQUIS :
De : [Prénom Nom] <prenom.nom@mc2i.fr>
À : [Destinataire] <destinataire@mc2i.fr>
Cc : [Autres personnes] <autre.personne@mc2i.fr>
Objet : [Objet spécifique]
Date : ${capitalizedDate}

[Corps du message]

Cordialement,
[Signature]`;

    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: promptScenario }
    ];

    return await openAIService.getChatCompletionWithCache(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération du scénario:", error);
    return "Une erreur est survenue lors de la génération du scénario. Veuillez réessayer.";
  }
}

/**
 * Génère un feedback global à la fin de tous les scénarios
 */
async function generateFeedbackGlobal(session: LearningBotSession): Promise<string> {
  try {
    const currentDate = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    };
    const formattedDate = currentDate.toLocaleDateString('fr-FR', dateOptions);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const promptFeedback = `
Génère un feedback global constructif pour l'évaluation de la formation "${session.formationChoisie}".
Historique des réponses :
${session.reponses.map((r, i) => `Scénario ${i+1}:\nQuestion: ${r.question}\nRéponse: ${r.reponse}`).join('\n\n')}

FORMAT EMAIL REQUIS :
De : Formation <formation@mc2i.fr>
À : Apprenant <apprenant@mc2i.fr>
Objet : Évaluation Formation : ${session.formationChoisie}
Date : ${capitalizedDate}

[Feedback détaillé incluant points forts, axes d'amélioration et conseils]

Cordialement,
L'équipe Formation`;

    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: promptFeedback }
    ];

    const response = await openAIService.getChatCompletionWithCache(messages, 0.7);

    session.stageActuel = 'choix_mode';
    session.scenarioActuel = 0;
    session.reponses = [];

    return response;
  } catch (error) {
    console.error("Erreur lors de la génération du feedback global:", error);
    return "Une erreur est survenue lors de la génération du feedback. Veuillez réessayer.";
  }
}

/**
 * Génère une réponse générique
 */
async function generateGenericResponse(session: LearningBotSession, message: string): Promise<string> {
  try {
    const contextMessages = session.messages.slice(-10);
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      ...contextMessages
    ];

    return await openAIService.getChatCompletionWithCache(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération d'une réponse générique:", error);
    return "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?";
  }
}