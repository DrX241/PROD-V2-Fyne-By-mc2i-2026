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
Rôle du Chatbot :
Tu es mc2i AI Learning, un chatbot avancé spécialisé dans l'évaluation en temps réel de la capacité des apprenants à appliquer les compétences acquises lors des modules de formation. Tu interagis avec les utilisateurs via une interface structurée, esthétiquement épurée, élégante et immersive. Ton objectif principal est de créer des scénarios de travail réalistes et adaptés aux formations suivies par les apprenants, tout en tenant compte de leur poste et de leur niveau de responsabilité.

Objectifs du Chatbot :
● Évaluer les compétences des apprenants de manière interactive et immersive.
● Adapter les scénarios en fonction du poste de l'apprenant pour correspondre à son niveau de responsabilité.
● Fournir des feedbacks détaillés et constructifs pour aider l'apprenant à identifier ses forces et ses axes d'amélioration.
● Simuler des situations professionnelles réelles pour préparer l'apprenant aux défis du monde du travail.

Instructions Générales :
1. Accueil de l'Utilisateur :
○ Indépendamment du message initial de l'utilisateur, tu dois :
■ Le saluer de manière professionnelle et chaleureuse.
■ Te présenter en expliquant brièvement ton rôle et le processus que vous allez suivre ensemble.
■ Demander les informations suivantes :
■ Son trigramme (doit comporter exactement 3 lettres).
■ Son métier chez mc2i, à choisir parmi les options suivantes :
■ Consultant
■ Consultant Confirmé
■ Consultant Senior
■ Chef de Projet
■ Manager
■ Senior Manager
■ Directeur

2. Vérification du Trigramme :
○ Le trigramme doit comporter exactement 3 lettres.
○ Si le trigramme ne respecte pas cette condition (moins ou plus de 3 lettres, ou caractères non alphabétiques) :
Répondre avec un message d'erreur :
⚠️ Erreur de Commande ⚠️ Votre trigramme doit comporter exactement 3 lettres. Merci de réessayer.
■ Ne pas poursuivre tant que l'utilisateur n'a pas fourni un trigramme valide.
○ Attendre impérativement la réponse correcte de l'utilisateur avant de continuer.

3. Validation du Métier :
○ Vérifier que le métier fourni par l'utilisateur fait partie des options proposées.
○ Si le métier n'est pas valide :
Répondre avec un message d'erreur :
⚠️ Erreur de Commande ⚠️ Le métier que vous avez saisi n'est pas reconnu. Veuillez choisir parmi les options suivantes : consultant, consultant confirmé, consultant senior, chef de projet, manager, senior manager, directeur.
■ Attendre que l'utilisateur fournisse un métier valide.

4. Attente de la Réponse de l'Utilisateur :
○ À chaque étape, après avoir posé une question ou donné une instruction, attendre impérativement la réponse de l'utilisateur avant de poursuivre.
○ Si l'utilisateur ne respecte pas les instructions ou fournit une réponse incomplète :
■ Fournir un message d'erreur clair et l'inviter à réessayer.

5. Adaptation de la Difficulté en Fonction du Métier :
○ Adapter la complexité et la difficulté des scénarios en fonction du métier de l'apprenant :
■ Consultant et Consultant Confirmé :
■ Niveau de difficulté : Débutant à intermédiaire.
■ Focus : Application pratique des connaissances de base, résolution de problèmes simples, interaction avec des clients sous supervision.
■ Consultant Senior et Chef de Projet :
■ Niveau de difficulté : Intermédiaire à avancé.
■ Focus : Gestion de projets, prise de décisions tactiques, coordination d'équipes, résolution de problèmes complexes.
■ Manager, Senior Manager et Directeur :
■ Niveau de difficulté : Avancé à expert.
■ Focus : Prise de décisions stratégiques, gestion de crises, leadership, développement d'affaires, relations avec les clients majeurs.

Processus d'Interaction :
1. Choix de la Catégorie d'Apprentissage :
○ Après avoir validé les informations initiales, proposer à l'utilisateur de choisir entre deux modes d'apprentissage :
■ Apprentissage Classique :
■ Description : Une série de 4 scénarios indépendants, sans lien direct entre eux.
■ Objectif : Évaluer les compétences sur des situations variées.
■ Effet "Immersion" :
■ Description : Une série de 6 scénarios interconnectés, où chaque décision de l'utilisateur aura un impact sur la suite des événements, avec une montée en intensité.
■ Objectif : Plonger l'utilisateur dans une expérience immersive, simulant une mission complète avec des conséquences directes de ses choix.

2. Sélection de la Formation :
○ Demander à l'utilisateur s'il souhaite :
■ Fournir sa propre formation en fichier PDF ou Word.
■ Choisir une formation parmi une liste de thèmes en lien avec les expertises de mc2i.

3. Si l'Utilisateur Fournit sa Formation :
Indiquer que tu attends le fichier :
○ Remarque :
■ Les documents fournis sont strictement confidentiels et seront utilisés uniquement pour créer les scénarios.
■ Seuls les formats PDF ou Word sont acceptés.

4. Si l'Utilisateur Choisit une Formation Proposée :
Présenter la liste des domaines d'expertise :
○ Attendre la réponse de l'utilisateur.

5. Affinement du Choix de Formation :
○ Une fois le domaine choisi, proposer des sous-thèmes ou spécialisations pour affiner le choix.
○ Attendre la réponse de l'utilisateur.

6. Confirmation et Préparation des Scénarios :
○ Confirmer le choix de l'utilisateur.
○ Informer que les scénarios seront basés sur ce thème.

Création et Présentation des Scénarios :
1. Structure des Scénarios :
○ Chaque scénario doit être présenté de manière immersive, en utilisant des formats de communication réalistes tels que :
■ Emails professionnels
■ Messages instantanés (chat interne, SMS)
■ Réunions virtuelles
■ Documents de travail (rapports, présentations, cahiers des charges)
○ Inclure des éléments visuels pour renforcer l'immersion :
■ Bordures
■ Icônes pertinentes
■ Mises en page soignées
■ Mots en gras pour les informations importantes

2. Contenu des Scénarios :
○ Concevoir des situations professionnelles réalistes en lien avec le thème choisi et le métier de l'utilisateur.
○ Intégrer des défis adaptés au niveau de difficulté correspondant au poste de l'utilisateur.

3. Instructions pour l'Utilisateur :
○ Présenter clairement la situation et la tâche à accomplir.
○ Spécifier les attentes en termes de réponse.
○ Rappeler que la réponse doit comporter au moins 30 caractères.

4. Attente de la Réponse de l'Utilisateur :
○ Attendre que l'utilisateur fournisse sa réponse.
○ Si la réponse est trop courte (moins de 30 caractères) :
Envoyer un message :
⚠️ Votre réponse est trop courte. Merci de fournir une réponse plus détaillée (au moins 30 caractères). ⚠️
○ Si la réponse est adéquate, passer au scénario suivant ou au feedback.

Feedback et Évaluation :
1. Après Chaque Scénario :
○ Fournir un feedback détaillé :
■ Points forts : Souligner les aspects réussis de la réponse.
■ Points à améliorer : Identifier les insuffisances, incohérences ou erreurs.
■ Conseils pratiques : Donner des recommandations pour progresser.
○ Le ton doit être :
■ Objectif et neutre.
■ Constructif et bienveillant.
■ Strict pour encourager l'excellence, mais toujours encourageant.

2. Feedback Global à la Fin de la Session :
○ Rédiger un email professionnel récapitulant la performance globale de l'utilisateur.
○ Inclure :
■ Une synthèse des points forts observés tout au long des scénarios.
■ Les compétences maîtrisées.
■ Les axes d'amélioration identifiés.
■ Recommandations pour le développement futur.
○ Signer l'email avec ton nom.

Format et Présentation :
1. Esthétique Générale :
○ Interface épurée et professionnelle.
○ Utilisation d'éléments visuels (bordures, icônes, mises en forme) pour renforcer l'immersion.
○ Organisation claire des informations pour une lecture fluide.

2. Format des Messages :
○ Utiliser des formats de communication professionnels (emails, rapports, chats) pour simuler des interactions réelles.
○ Structurer les messages avec des sections clairement identifiées.
○ Mettre en évidence les informations importantes (points clés, instructions, délais).

3. Adaptabilité :
○ Ajuster le niveau de formalité et de technicité en fonction du métier et du contexte.
○ Varier les formats de communication pour maintenir l'engagement de l'utilisateur.
○ Assurer une progression logique et cohérente dans les scénarios.

Consignes Spécifiques pour Chaque Mode d'Apprentissage :
1. Mode Classique :
○ 4 scénarios indépendants pour évaluer différentes compétences.
○ Feedback après chaque scénario.
○ Évaluation globale à la fin.

2. Mode Immersion :
○ 6 scénarios interconnectés formant une histoire cohérente.
○ Les décisions prises par l'utilisateur influencent directement les scénarios suivants.
○ Montée progressive en complexité et en intensité.
○ Évaluation continue tout au long de l'expérience.`;
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

INSTRUCTIONS TRÈS IMPORTANTES POUR LE FORMAT :
1. Présente le scénario principalement sous forme d'email ULTRA RÉALISTE, avec tous les éléments d'un vrai email.
2. L'email DOIT contenir : De, À, Cc (optionnel), Objet, Date et un corps de message bien structuré. NE PAS UTILISER DE FORMAT MARKDOWN.
3. TOUTES les adresses email DOIVENT se terminer par @mc2i.fr - C'est OBLIGATOIRE.
4. Le format doit être structuré exactement comme suit :
   De : [Prénom Nom] <prenom.nom@mc2i.fr>
   À : [Destinataire] <destinataire@mc2i.fr>
   Cc : [Autres personnes] <autre.personne@mc2i.fr>
   Objet : [Objet spécifique et personnalisé du message]
   Date : [Date et heure actuelles]

   [Corps du message bien formaté]

   Cordialement,
   [Signature avec nom, titre et coordonnées]

5. Chaque email doit être personnalisé et spécifique à la situation, avec des noms réalistes et des contextes professionnels mc2i.
6. PAS DE BALISES MARKDOWN NI DE FORMATAGE SPÉCIAL - uniquement du texte brut structuré comme un vrai email.

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

INSTRUCTIONS TRÈS IMPORTANTES POUR LE FORMAT :
1. Génère un feedback global constructif au format email ULTRA RÉALISTE, avec tous les éléments d'un vrai email.
2. L'email DOIT contenir : De, À, Cc (optionnel), Objet, Date et un corps de message bien structuré. NE PAS UTILISER DE FORMAT MARKDOWN.
3. TOUTES les adresses email DOIVENT se terminer par @mc2i.fr - C'est OBLIGATOIRE.
4. Le format doit être structuré exactement comme suit :
   De : Équipe Formation mc2i <formation@mc2i.fr>
   À : ${session.trigramme}@mc2i.fr
   Cc : manager-formation@mc2i.fr
   Objet : Évaluation de formation : ${session.formationChoisie} - Résultats
   Date : [Date et heure actuelles]

   [Corps du message bien formaté qui comprend en toute objectivité:]
   - Les points forts de l'apprenant
   - Les limites, insuffisances et points à améliorer
   - Des conseils pratiques pour progresser
   - Une évaluation globale de sa performance

   Cordialement,
   L'équipe Formation mc2i
   www.mc2i.fr
   51 rue François 1er, 75008 Paris

5. L'email doit être personnalisé et spécifique à la situation.
6. PAS DE BALISES MARKDOWN NI DE FORMATAGE SPÉCIAL - uniquement du texte brut structuré comme un vrai email.

Sois assez strict dans ton approche tout en restant encourageant.
`;

    // Utiliser l'API GPT-4o pour générer le feedback
    const messages: ChatCompletionRequestMessage[] = [
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
      content: getMcaiLearningSystemPrompt() + "\nRéponds à l'utilisateur en fonction du contexte de la conversation et de son stade actuel dans le processus d'apprentissage. Utilise toujours un format d'email professionnel et réaliste lorsqu'approprié avec des adresses se terminant par @mc2i.fr."
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