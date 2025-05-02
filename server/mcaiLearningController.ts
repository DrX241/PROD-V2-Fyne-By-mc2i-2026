import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de chatbot
interface LearningBotSession {
  trigramme: string | null;
  metier: string | null;
  mode: 'classique' | 'immersion' | null;
  formation: 'interne' | 'externe' | null;
  formationChoisie: string | null;
  stageActuel: 'introduction' | 'choix_mode' | 'choix_formation' | 'formation' | 'scenario' | null;
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
      trigramme: null,
      metier: null,
      mode: null,
      formation: null,
      formationChoisie: null,
      stageActuel: 'introduction',
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
      content: "Bonjour et bienvenue sur mc2i AI Learning, votre Chatbot spécialisé dans l'évaluation en temps réel. Veuillez me communiquer votre Trigramme (3 lettres maximum) et votre métier chez mc2i (consultant, consultant confirmé, sénior, Manager, Sénior Manager, Chef de projet, Directeur)."
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
    });

    // Traiter le message en fonction de l'état actuel de la session
    const processedResponse = await processMessageBasedOnStage(session, message);
    
    // Ajouter la réponse du système
    session.messages.push({
      role: "assistant",
      content: processedResponse
    });

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
  // Si nous sommes au stade d'introduction, vérifier le trigramme et le métier
  if (session.stageActuel === 'introduction') {
    // Vérifier si le message contient à la fois un trigramme et un métier
    const trigrammeMatch = message.match(/\b[A-Za-z]{3}\b/); // Trouve un mot de 3 lettres exactement
    
    const metiersPossibles = ['consultant', 'consultant confirmé', 'sénior', 'manager', 'sénior manager', 'chef de projet', 'directeur'];
    const metierMatch = metiersPossibles.find(metier => 
      message.toLowerCase().includes(metier.toLowerCase())
    );

    if (trigrammeMatch && metierMatch) {
      session.trigramme = trigrammeMatch[0].toUpperCase();
      session.metier = metierMatch;
      session.stageActuel = 'choix_mode';
      
      return `Merci ${session.trigramme} ! J'ai bien noté que vous êtes ${session.metier} chez mc2i. \n\nVeuillez maintenant choisir entre deux modes d'apprentissage :\n1. Un apprentissage classique avec 4 scénarios différents sans lien direct entre eux\n2. Un effet immersion avec 6 scénarios reliés entre eux où chaque décision a un impact immédiat sur la suite`;
    } else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez me communiquer à la fois votre Trigramme (3 lettres exactement) et votre métier chez mc2i (consultant, consultant confirmé, sénior, Manager, Sénior Manager, Chef de projet, Directeur).";
    }
  } 
  // Étape de choix du mode (classique ou immersion)
  else if (session.stageActuel === 'choix_mode') {
    if (message.toLowerCase().includes('classique') || message.toLowerCase().includes('1')) {
      session.mode = 'classique';
      session.stageActuel = 'choix_formation';
      return `Excellent choix ${session.trigramme} ! Vous avez choisi le mode classique avec 4 scénarios.\n\nSouhaitez-vous :\n1. Me fournir une formation de votre choix (format PDF ou Word)\n2. Choisir parmi nos 10 formations généralistes en lien avec les différentes expertises mc2i`;
    } 
    else if (message.toLowerCase().includes('immersion') || message.toLowerCase().includes('2')) {
      session.mode = 'immersion';
      session.stageActuel = 'choix_formation';
      return `Excellent choix ${session.trigramme} ! Vous avez choisi le mode immersion avec 6 scénarios reliés.\n\nSouhaitez-vous :\n1. Me fournir une formation de votre choix (format PDF ou Word)\n2. Choisir parmi nos 10 formations généralistes en lien avec les différentes expertises mc2i`;
    } 
    else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez choisir entre :\n1. Apprentissage classique\n2. Effet immersion";
    }
  }
  // Étape de choix de formation
  else if (session.stageActuel === 'choix_formation') {
    if (message.toLowerCase().includes('fournir') || message.toLowerCase().includes('pdf') || message.toLowerCase().includes('word') || message.toLowerCase().includes('1')) {
      session.formation = 'externe';
      return `J'attends maintenant que vous me fournissiez votre document de formation au format PDF ou Word.`;
    } 
    else if (message.toLowerCase().includes('choisir') || message.toLowerCase().includes('généraliste') || message.toLowerCase().includes('2')) {
      session.formation = 'interne';
      session.stageActuel = 'formation';
      return `Voici les 10 formations disponibles en lien avec les expertises mc2i. Veuillez choisir celle qui vous intéresse :\n\n1. Pilotage de projet et AMOA\n2. Conduite du changement\n3. Agilité\n4. Stratégie\n5. Cybersécurité\n6. Data & IA\n7. Accompagnement au déploiement\n8. Innovation et Technologies\n9. Cloud\n10. UX et Design Thinking`;
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
    
    // Chercher la formation par numéro ou par texte
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
      
      // Générer le premier scénario en utilisant l'API GPT-4o
      return await generateScenario(session);
    } else {
      return "⚠️ Erreur de Commande ⚠️\n\nVeuillez choisir une formation valide de la liste, soit en indiquant son numéro (1-10), soit en indiquant son nom.";
    }
  }
  // Étape de scénario - traiter les réponses et avancer
  else if (session.stageActuel === 'scenario') {
    // Vérifier que la réponse fait au moins 30 caractères
    if (message.length < 30) {
      return "⚠️ Erreur de Commande ⚠️\n\nVotre réponse est trop courte. Elle doit faire au moins 30 caractères.";
    }
    
    // Enregistrer la réponse
    if (session.mode === 'classique') {
      // En mode classique, on gère 4 scénarios indépendants
      // Enregistrer la réponse au scénario actuel
      session.reponses.push({
        question: session.messages[session.messages.length - 2].content,
        reponse: message
      });
      
      session.scenarioActuel++;
      
      // Si tous les scénarios sont terminés, donner un feedback global
      if (session.scenarioActuel >= 4) {
        return await generateFeedbackGlobal(session);
      }
      
      // Sinon, générer le scénario suivant
      return await generateScenario(session);
    } 
    else if (session.mode === 'immersion') {
      // En mode immersion, les 6 scénarios sont liés et les décisions ont un impact
      // Enregistrer la réponse au scénario actuel
      session.reponses.push({
        question: session.messages[session.messages.length - 2].content,
        reponse: message
      });
      
      session.scenarioActuel++;
      
      // Si tous les scénarios sont terminés, donner un feedback global
      if (session.scenarioActuel >= 6) {
        return await generateFeedbackGlobal(session);
      }
      
      // Sinon, générer le scénario suivant qui est influencé par la réponse précédente
      return await generateScenario(session, message);
    }
  }
  
  // Si le stade n'est pas reconnu, utiliser l'API GPT pour générer une réponse
  return await generateGenericResponse(session, message);
}

/**
 * Récupère le statut actuel de la session
 */
function getSessionStatus(session: LearningBotSession) {
  return {
    trigramme: session.trigramme,
    metier: session.metier,
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
  return `
Prends en compte les instructions ci-dessous : 
Tu es *mc2i AI Learning* un Chatbot spécialisé dans l'évaluation en temps réel de la capacité des apprenants à appliquer les compétences acquises lors des modules via une interface structurée avec une esthétique épurée et élégante. Ton rôle est de créer des scénarios de travail réalistes et adaptés aux formations suivies par les apprenants. Le texte doit être justifié, mis en forme en fonction des catégories avec un vrai effet immersif. 

Format et présentation
Esthétique :
*Simule TOUJOURS une interface avec des bordures à gauche et à droite, des icônes, des formes, des couleurs, des mots en gras.
*Utiliser des formes de mails , cahiers de charges, SMS avec interfaces très réalistes et immersives , et autres formats de communication réels.
*Mise en forme excellente , avec des icônes , des blocs de texte structuré et des instructions visuellement séparées , logiques, élégantes et épurées.
Interactions : Évite les QCM excessifs. Donne la possibilité aux utilisateurs d'avoir un choix libre et d'écrire leurs réponses.

1. Catégorie Classique
Évaluation des Formations : Sous forme de scénarios, tu évalues les compétences des apprenants basées sur les formations internes ou les documents fournis en fonction du choix de l'utilisateur.

Un scénario comporte 4 questions qui sont posées une à une à l'apprenant.
La réponse doit faire au moins 30 caractères sinon tu renvoies une erreur en disant que la réponse est trop courte. 

Approche scénarisée : Les apprenants sont placés dans des situations professionnelles où ils doivent appliquer leurs connaissances chez les clients. Cela peu etre un besoin client reçu par mail, un message de son supérieur en interne, une demande d'aide d'un collègue, etc. 
Propose 4 scénarios différents, 1 par 1 avec des feedbacks entre chacun et un feedback global à la fin. 

2. Catégorie Effet "Immersion" : 
L'apprenant est plongé dans 6 scénarios pratiques basés sur les formations internes ou les documents fournis. où chaque décision a un impact sur la suite avec une montée en intensité.
La réponse doit faire au moins 30 caractères sinon tu renvoies une erreur en disant que la réponse est trop courte. 

Approche scénarisée : Les apprenants sont placés dans des situations professionnelles où ils doivent appliquer leurs connaissances chez les clients. Cela peut etre un besoin client reçu par mail, un message de son supérieur en interne, une demande d'aide d'un collègue, etc. 
Propose 6 scénarios reliés ou chaque décision de l'utilisateur aura un impact sur la suite. Il doit simuler un échange avec un client ou le client répond par mail, ou par l'intermédiaire d'un autre responsable. Je veux des clients assez durs pour pousser le consultant dans ses limites. Et des clients qui n'hésitent pas à contacter mc2i pour se plaindre d'une prestation et donc d'arrêter la mission. 

Règles et Bonnes Pratiques :
Les documents fournis sont utilisés uniquement pour créer le scénario et ne sont pas partagés.
Formats Acceptés : Seuls les documents en PDF ou Word sont acceptés.
Respect et Bienveillance : Toujours encourager l'apprenant et fournir des feedbacks constructifs.
Neutralité : Évaluer les décisions sans jugement personnel.
Règles de grammaires : toujours commencer par une lettre majuscule et finir par un point. Une seule lettre majuscule dans un titre, et une seule lettre majuscule dans une phrase. Une phrase commence par une lettre majuscule et termine par un point.`;
}

/**
 * Génère un scénario basé sur le mode et la formation choisie
 */
async function generateScenario(session: LearningBotSession, lastResponse: string = ""): Promise<string> {
  try {
    const promptScenario = `
En tant que mc2i AI Learning, tu dois générer un scénario pour évaluer les compétences de l'apprenant.

Détails de l'apprenant:
- Trigramme: ${session.trigramme}
- Métier: ${session.metier}
- Mode d'apprentissage: ${session.mode} (${session.mode === 'classique' ? '4 scénarios indépendants' : '6 scénarios reliés avec impact'})
- Formation choisie: ${session.formationChoisie}
- Numéro du scénario actuel: ${session.scenarioActuel + 1}${session.mode === 'immersion' && session.scenarioActuel > 0 ? `
- Dernière réponse de l'apprenant pour le scénario précédent: "${lastResponse}"` : ''}

${session.mode === 'classique' 
  ? `Génère un scénario professionnel réaliste ${session.scenarioActuel + 1}/4 sans lien avec les précédents. Ce scénario doit évaluer les compétences liées à la formation "${session.formationChoisie}".` 
  : `Génère le scénario professionnel réaliste ${session.scenarioActuel + 1}/6 en tenant compte des réponses précédentes de l'apprenant. Ce scénario fait partie d'une immersion progressive où les décisions de l'apprenant ont un impact. La situation doit devenir de plus en plus complexe et tendue.`}

Le scénario doit être présenté sous forme de mail, SMS, message interne, ou autre moyen de communication réaliste avec une mise en forme soignée. Utilise des icônes, des bordures, et une présentation visuelle structurée. N'hésite pas à mettre des éléments en gras pour l'emphase.

Assure-toi que la situation exige une réponse d'au moins 30 caractères de la part de l'apprenant.
`;

    // Utiliser l'API GPT-4o pour générer le scénario
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: promptScenario }
    ];

    const response = await openAIService.getChatCompletionWithCache(messages, 0.7);
    return response;
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
    // Construire le prompt pour le feedback global
    const promptFeedback = `
En tant que mc2i AI Learning, tu dois générer un feedback global pour l'apprenant qui a terminé tous les scénarios.

Détails de l'apprenant:
- Trigramme: ${session.trigramme}
- Métier: ${session.metier}
- Mode d'apprentissage: ${session.mode}
- Formation choisie: ${session.formationChoisie}

Historique des réponses:
${session.reponses.map((r, i) => `Scénario ${i+1}:\nQuestion/Situation: ${r.question}\nRéponse: ${r.reponse}`).join('\n\n')}

Génère un feedback global constructif au format mail qui comprend en toute objectivité:
- Les points forts de l'apprenant
- Les limites, insuffisances et points à améliorer
- Des conseils pratiques pour progresser
- Une évaluation globale de sa performance

Sois assez strict dans ton approche tout en restant encourageant. Le retour doit être formaté comme un mail professionnel et tu dois signer de ton nom à la fin.
`;

    // Utiliser l'API GPT-4o pour générer le feedback
    const messages = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: promptFeedback }
    ];

    const response = await openAIService.getChatCompletionWithCache(messages, 0.7);
    
    // Réinitialiser les scénarios pour permettre à l'utilisateur de recommencer
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
 * Génère une réponse générique pour les messages qui ne correspondent à aucun stade spécifique
 */
async function generateGenericResponse(session: LearningBotSession, message: string): Promise<string> {
  try {
    // Créer un contexte avec l'historique des messages pour l'API GPT-4o
    const contextMessages = session.messages.slice(-10); // Limiter à 10 derniers messages pour le contexte
    
    // Ajouter une instruction système spécifique
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt() + "\nRéponds à l'utilisateur en fonction du contexte de la conversation et de son stade actuel dans le processus d'apprentissage."
    };
    
    const apiMessages: ChatCompletionRequestMessage[] = [systemMessage, ...contextMessages];
    
    // Utiliser l'API GPT-4o pour générer une réponse
    const response = await openAIService.getChatCompletionWithCache(apiMessages, 0.7);
    return response;
  } catch (error) {
    console.error("Erreur lors de la génération d'une réponse générique:", error);
    return "Je n'ai pas compris votre demande. Pouvez-vous reformuler ou suivre les instructions précédentes ?";
  }
}