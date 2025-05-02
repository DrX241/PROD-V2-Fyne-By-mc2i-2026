import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de chatbot
interface LearningBotSession {
  prenom: string | null;
  domaineExpertise: string | null;
  sousTheme: string | null;
  stageActuel: 'introduction' | 'choix_domaine' | 'choix_sous_theme' | 'scenario' | null;
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
      prenom: null,
      domaineExpertise: null,
      sousTheme: null,
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
      content: "Bonjour et bienvenue sur mc2i AI Learning 👋\nJe suis votre assistant dédié pour évaluer vos compétences à travers des scénarios immersifs et personnalisés.\n\nAvant de commencer, pouvez-vous me donner votre prénom ? :)"
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
  // Étape 1: Introduction - Demande du prénom
  if (session.stageActuel === 'introduction') {
    // Vérifier si l'utilisateur a fourni un prénom
    if (message.trim().length > 0) {
      // Extraire le premier mot comme prénom (simple mais efficace pour la plupart des cas)
      const prenom = message.trim().split(/\s+/)[0];
      session.prenom = prenom;
      session.stageActuel = 'choix_domaine';
      
      return `Très bien 👌 Voici les domaines d'expertise disponibles :\n\n` +
        `1. Pilotage de Projet et AMOA\n` +
        `2. Conduite du Changement\n` +
        `3. Cybersécurité\n` +
        `4. Data & IA\n` +
        `5. UX et Design Thinking\n\n` +
        `Quel domaine vous intéresse aujourd'hui, ${session.prenom} ?`;
    } else {
      return "Je n'ai pas bien compris votre prénom. Pourriez-vous me l'indiquer à nouveau s'il vous plaît ?";
    }
  } 
  // Étape 2: Choix du domaine d'expertise
  else if (session.stageActuel === 'choix_domaine') {
    const domaines = [
      'Pilotage de Projet et AMOA',
      'Conduite du Changement',
      'Cybersécurité',
      'Data & IA',
      'UX et Design Thinking'
    ];
    
    // Recherche par numéro ou texte
    let domaineChoisi = null;
    if (/^[1-5]$/.test(message.trim())) {
      const index = parseInt(message.trim()) - 1;
      if (index >= 0 && index < domaines.length) {
        domaineChoisi = domaines[index];
      }
    } else {
      domaineChoisi = domaines.find(d => 
        message.toLowerCase().includes(d.toLowerCase()) ||
        (d === 'Pilotage de Projet et AMOA' && message.toLowerCase().includes('amoa')) ||
        (d === 'Data & IA' && (message.toLowerCase().includes('data') || message.toLowerCase().includes('ia')))
      );
    }
    
    if (domaineChoisi) {
      session.domaineExpertise = domaineChoisi;
      session.stageActuel = 'choix_sous_theme';
      
      // Générer dynamiquement les sous-thèmes en fonction du domaine choisi
      const sousThemes = getSousThemesPourDomaine(domaineChoisi);
      
      return `Vous avez choisi le domaine "${session.domaineExpertise}".\n\n` +
        `Voici les sous-thèmes disponibles :\n\n` +
        sousThemes.map((theme, index) => `${index + 1}. ${theme}`).join('\n') +
        `\n\nQuel sous-thème souhaitez-vous explorer ?`;
    } else {
      return "Je n'ai pas reconnu votre choix. Veuillez sélectionner un domaine d'expertise par son numéro (1-5) ou en indiquant son nom.";
    }
  }
  // Étape 3: Choix du sous-thème
  else if (session.stageActuel === 'choix_sous_theme') {
    const sousThemes = getSousThemesPourDomaine(session.domaineExpertise || '');
    
    // Rechercher par numéro ou texte
    let sousThemeChoisi = null;
    if (/^[1-5]$/.test(message.trim())) {
      const index = parseInt(message.trim()) - 1;
      if (index >= 0 && index < sousThemes.length) {
        sousThemeChoisi = sousThemes[index];
      }
    } else {
      sousThemeChoisi = sousThemes.find(theme => 
        message.toLowerCase().includes(theme.toLowerCase())
      );
    }
    
    if (sousThemeChoisi) {
      session.sousTheme = sousThemeChoisi;
      session.stageActuel = 'scenario';
      
      // Lancer le premier scénario
      return await demarrerScenarioImmersif(session);
    } else {
      return "Je n'ai pas reconnu votre choix. Veuillez sélectionner un sous-thème par son numéro (1-5) ou en indiquant son nom.";
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
      return "⚠️ Attention ⚠️\n\nVotre réponse est trop courte. Elle doit faire au moins 30 caractères pour être considérée comme suffisamment détaillée.";
    }
    
    // Enregistrer la réponse au scénario actuel
    session.reponses.push({
      question: session.messages[session.messages.length - 2].content,
      reponse: message
    });
    
    session.scenarioActuel++;
    
    // Si tous les scénarios sont terminés, donner un feedback global
    if (session.scenarioActuel >= 6) {
      return await genererFeedbackGlobal(session);
    }
    
    // Sinon, générer le scénario suivant qui est influencé par la réponse précédente
    return await genererScenarioSuivant(session, message);
  }
  
  // Si le stade n'est pas reconnu, utiliser l'API GPT pour générer une réponse
  return await generateGenericResponse(session, message);
}

/**
 * Récupère le statut actuel de la session
 */
function getSessionStatus(session: LearningBotSession) {
  return {
    prenom: session.prenom,
    domaineExpertise: session.domaineExpertise,
    sousTheme: session.sousTheme,
    stageActuel: session.stageActuel,
    scenarioActuel: session.scenarioActuel
  };
}

/**
 * Génère les sous-thèmes en fonction du domaine d'expertise sélectionné
 */
function getSousThemesPourDomaine(domaine: string): string[] {
  const sousThemes: { [key: string]: string[] } = {
    'Pilotage de Projet et AMOA': [
      'Cadrage et lancement de projet',
      'Gestion des exigences et des parties prenantes',
      'Planification et suivi de projet',
      'Gestion des risques et des problèmes',
      'Clôture et capitalisation de projet'
    ],
    'Conduite du Changement': [
      'Diagnostic et stratégie de transformation',
      'Communication et gestion de la résistance au changement',
      'Formation et accompagnement',
      'Ancrage et pérennisation du changement',
      'Mesure de l\'efficacité des actions de conduite du changement'
    ],
    'Cybersécurité': [
      'Audit et évaluation des risques',
      'Gouvernance et conformité',
      'Protection des données et cryptographie',
      'Réponse aux incidents et gestion de crise',
      'Sensibilisation et formation à la sécurité'
    ],
    'Data & IA': [
      'Collecte et préparation des données',
      'Analyse descriptive et visualisation',
      'Modélisation prédictive et machine learning',
      'Éthique et gouvernance des données',
      'Intégration de l\'IA dans les processus métier'
    ],
    'UX et Design Thinking': [
      'Recherche utilisateur et personas',
      'Prototypage et tests utilisateurs',
      'Design d\'interface et d\'interaction',
      'Accessibilité et design inclusif',
      'Animation d\'ateliers de co-conception'
    ]
  };
  
  return sousThemes[domaine] || [
    'Principes fondamentaux',
    'Méthodologies avancées',
    'Outils et technologies',
    'Études de cas',
    'Tendances futures'
  ];
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
 * Démarre le premier scénario immersif basé sur le domaine et le sous-thème choisis
 */
async function demarrerScenarioImmersif(session: LearningBotSession): Promise<string> {
  try {
    // Obtenir la date et l'heure actuelles au format français
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
    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Construire le message d'introduction au scénario
    const introScenario = `Vous avez choisi le sous-thème "${session.sousTheme}".

🎬 Je vais maintenant lancer votre immersion professionnelle dans une mission réaliste liée à ${session.sousTheme}.

📂 Contexte global de la mission :

Vous êtes Chef de Projet chez mc2i, affecté à un client du secteur ${getClientSector(session.domaineExpertise || '')}.
Votre rôle : ${getRolePourDomaine(session.domaineExpertise || '', session.sousTheme || '')}.

🔐 Objectif : ${getObjectifPourDomaine(session.domaineExpertise || '', session.sousTheme || '')}.

---------
📘 Scénario 1 sur 6 – ${getTitreScenario(session.domaineExpertise || '', session.sousTheme || '', 1)}
🖥️ [Icône de mail]

${generateEmail(session, 1)}

📝 Votre tâche :
${getInstructionScenario(session.domaineExpertise || '', session.sousTheme || '', 1)}

👉 Votre réponse doit comporter au moins 30 caractères.`;

    return introScenario;
  } catch (error) {
    console.error("Erreur lors de la génération du scénario immersif:", error);
    return "Une erreur est survenue lors de la génération du scénario. Veuillez réessayer.";
  }
}

/**
 * Génère le scénario suivant dans la séquence immersive
 */
async function genererScenarioSuivant(session: LearningBotSession, dernierMessage: string): Promise<string> {
  try {
    // Obtenir la date et l'heure actuelles au format français
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
    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Générer la suite du scénario en fonction du numéro actuel
    const scenarioNum = session.scenarioActuel;
    
    if (scenarioNum >= 6) {
      return await genererFeedbackGlobal(session);
    }
    
    // Construire le message pour le scénario suivant
    const scenarioSuivant = `📘 Scénario ${scenarioNum + 1} sur 6 – ${getTitreScenario(session.domaineExpertise || '', session.sousTheme || '', scenarioNum + 1)}
🖥️ [Icône de mail]

${generateEmail(session, scenarioNum + 1, dernierMessage)}

📝 Votre tâche :
${getInstructionScenario(session.domaineExpertise || '', session.sousTheme || '', scenarioNum + 1)}

👉 Votre réponse doit comporter au moins 30 caractères.`;

    return scenarioSuivant;
  } catch (error) {
    console.error("Erreur lors de la génération du scénario suivant:", error);
    return "Une erreur est survenue lors de la génération du scénario suivant. Veuillez réessayer.";
  }
}

/**
 * Génère un feedback global à la fin des scénarios
 */
async function genererFeedbackGlobal(session: LearningBotSession): Promise<string> {
  try {
    // Générer un message de félicitations
    return `🎉 Félicitations ${session.prenom} ! Vous avez complété l'ensemble des 6 scénarios du parcours immersif.

🔍 Voici une synthèse de votre parcours dans le domaine "${session.domaineExpertise}" sur le thème "${session.sousTheme}" :

✅ Forces démontrées :
- Excellente compréhension des enjeux professionnels liés à ${session.sousTheme}
- Bonne capacité d'analyse et de prise de décision
- Approche structurée et méthodique des problèmes rencontrés

🔄 Axes d'amélioration potentiels :
- Continuer à développer la vision stratégique à long terme
- Approfondir certains aspects techniques spécifiques au domaine
- Renforcer la dimension collaborative dans la gestion de projet

📈 Recommandations pour continuer votre progression :
1. Explorer les ressources complémentaires disponibles sur l'intranet mc2i
2. Participer aux communautés de pratique internes sur ce domaine
3. Envisager une certification professionnelle pour valider vos compétences

Merci d'avoir participé à cette expérience d'apprentissage immersive !
Souhaitez-vous explorer un autre domaine d'expertise ou sous-thème ?`;
  } catch (error) {
    console.error("Erreur lors de la génération du feedback global:", error);
    return "Une erreur est survenue lors de la génération du feedback. Votre parcours est néanmoins terminé avec succès. Merci pour votre participation !";
  }
}

/**
 * Renvoie un secteur client approprié selon le domaine d'expertise
 */
function getClientSector(domaine: string): string {
  const secteurs: {[key: string]: string} = {
    'Pilotage de Projet et AMOA': 'banque-assurance',
    'Conduite du Changement': 'énergie',
    'Cybersécurité': 'secteur public',
    'Data & IA': 'santé',
    'UX et Design Thinking': 'retail et e-commerce'
  };
  
  return secteurs[domaine] || 'grande distribution';
}

/**
 * Renvoie un rôle adapté au domaine et sous-thème
 */
function getRolePourDomaine(domaine: string, sousTheme: string): string {
  const roles: {[key: string]: {[key: string]: string}} = {
    'Pilotage de Projet et AMOA': {
      'Cadrage et lancement de projet': 'piloter le lancement d'un nouveau système d'information bancaire critique',
      'Gestion des exigences et des parties prenantes': 'coordonner la collecte des exigences pour un projet de refonte applicative',
      'Planification et suivi de projet': 'assurer le respect du planning et du budget d'un projet stratégique',
      'Gestion des risques et des problèmes': 'identifier et mitiger les risques d'un programme de transformation',
      'Clôture et capitalisation de projet': 'finaliser un projet majeur et organiser le retour d'expérience'
    },
    'Conduite du Changement': {
      'Diagnostic et stratégie de transformation': 'élaborer la stratégie de transformation numérique pour une transition énergétique',
      'Communication et gestion de la résistance au changement': 'piloter le plan de communication d'un projet de réorganisation sensible',
      'Formation et accompagnement': 'coordonner le déploiement d'un nouveau système auprès de 2000 utilisateurs',
      'Ancrage et pérennisation du changement': 'assurer l'adoption pérenne d'un nouvel outil collaboratif',
      'Mesure de l\'efficacité des actions de conduite du changement': 'évaluer l'impact des actions menées dans le cadre d'une transformation'
    },
    'Cybersécurité': {
      'Audit et évaluation des risques': 'réaliser un audit de sécurité pour une administration publique',
      'Gouvernance et conformité': 'mettre en place une gouvernance de sécurité conforme aux normes du secteur',
      'Protection des données et cryptographie': 'sécuriser les données sensibles d'un système gouvernemental',
      'Réponse aux incidents et gestion de crise': 'piloter une cellule de crise cyber suite à un incident détecté',
      'Sensibilisation et formation à la sécurité': 'déployer un programme de sensibilisation à la cybersécurité'
    },
    'Data & IA': {
      'Collecte et préparation des données': 'structurer la collecte de données pour un projet d'analyse prédictive médicale',
      'Analyse descriptive et visualisation': 'créer des tableaux de bord décisionnels pour la direction d'un groupe hospitalier',
      'Modélisation prédictive et machine learning': 'superviser le développement d'un algorithme de diagnostic assisté',
      'Éthique et gouvernance des données': 'établir un cadre éthique pour l'utilisation des données patients',
      'Intégration de l\'IA dans les processus métier': 'intégrer une solution d'IA dans le parcours de soin'
    },
    'UX et Design Thinking': {
      'Recherche utilisateur et personas': 'mener une étude utilisateur pour refondre l'expérience d'achat d'un site e-commerce',
      'Prototypage et tests utilisateurs': 'coordonner les tests utilisateurs d'une nouvelle application mobile',
      'Design d\'interface et d\'interaction': 'superviser la conception d'une interface client omnicanale',
      'Accessibilité et design inclusif': 'assurer l'accessibilité numérique d'une plateforme grand public',
      'Animation d\'ateliers de co-conception': 'animer des ateliers de co-conception avec les utilisateurs finaux'
    }
  };
  
  return roles[domaine]?.[sousTheme] || 'piloter un projet stratégique pour le client';
}

/**
 * Renvoie un objectif adapté au domaine et sous-thème
 */
function getObjectifPourDomaine(domaine: string, sousTheme: string): string {
  const objectifs: {[key: string]: {[key: string]: string}} = {
    'Pilotage de Projet et AMOA': {
      'Cadrage et lancement de projet': 'Établir une vision claire du projet, mobiliser les parties prenantes et poser les bases d'une gouvernance efficace',
      'Gestion des exigences et des parties prenantes': 'Analyser les besoins, formaliser les exigences et maintenir l'alignement des parties prenantes',
      'Planification et suivi de projet': 'Optimiser la planification, suivre l'avancement et ajuster le plan de projet en fonction des évolutions',
      'Gestion des risques et des problèmes': 'Identifier les risques en amont, mettre en place des plans d'atténuation et résoudre les problèmes efficacement',
      'Clôture et capitalisation de projet': 'Assurer une transition fluide vers les opérations, documenter les enseignements et valoriser les réussites'
    },
    'Conduite du Changement': {
      'Diagnostic et stratégie de transformation': 'Analyser l'existant, définir une vision cible et élaborer une feuille de route de transformation',
      'Communication et gestion de la résistance au changement': 'Déployer un plan de communication adapté et gérer les résistances au changement',
      'Formation et accompagnement': 'Concevoir et mettre en œuvre un dispositif d'accompagnement efficient pour les utilisateurs',
      'Ancrage et pérennisation du changement': 'Garantir l'adoption durable des nouvelles pratiques et outils dans l'organisation',
      'Mesure de l\'efficacité des actions de conduite du changement': 'Évaluer l'impact des actions, ajuster la stratégie et démontrer la valeur ajoutée'
    },
    'Cybersécurité': {
      'Audit et évaluation des risques': 'Identifier les vulnérabilités, évaluer les menaces et prioriser les actions correctrices',
      'Gouvernance et conformité': 'Mettre en place un cadre de gouvernance robuste et assurer la conformité réglementaire',
      'Protection des données et cryptographie': 'Sécuriser les données sensibles et implémenter des solutions de chiffrement adaptées',
      'Réponse aux incidents et gestion de crise': 'Coordonner la réponse à un incident, limiter les impacts et restaurer les systèmes',
      'Sensibilisation et formation à la sécurité': 'Développer une culture de cybersécurité et former les collaborateurs aux bonnes pratiques'
    },
    'Data & IA': {
      'Collecte et préparation des données': 'Définir et mettre en œuvre une stratégie de collecte de données pertinente et conforme',
      'Analyse descriptive et visualisation': 'Transformer les données en insights actionnables via des visualisations percutantes',
      'Modélisation prédictive et machine learning': 'Développer des modèles pertinents, fiables et interprétables pour répondre aux enjeux métiers',
      'Éthique et gouvernance des données': 'Établir un cadre éthique solide pour l'utilisation des données et des algorithmes',
      'Intégration de l\'IA dans les processus métier': 'Orchestrer l'intégration fluide de solutions d'IA dans les processus existants'
    },
    'UX et Design Thinking': {
      'Recherche utilisateur et personas': 'Comprendre les besoins réels des utilisateurs et créer des personas représentatifs',
      'Prototypage et tests utilisateurs': 'Tester rapidement des concepts et itérer en fonction des retours utilisateurs',
      'Design d\'interface et d\'interaction': 'Concevoir des interfaces intuitives et des parcours utilisateurs fluides',
      'Accessibilité et design inclusif': 'Garantir l'accessibilité des solutions numériques à tous les utilisateurs',
      'Animation d\'ateliers de co-conception': 'Faciliter des sessions de co-création productives impliquant toutes les parties prenantes'
    }
  };
  
  return objectifs[domaine]?.[sousTheme] || 'Mener à bien le projet en respectant les objectifs définis avec le client';
}

/**
 * Génère un titre pour le scénario en fonction du domaine, sous-thème et numéro
 */
function getTitreScenario(domaine: string, sousTheme: string, numero: number): string {
  const titres: {[key: string]: {[key: string]: string[]}} = {
    'Pilotage de Projet et AMOA': {
      'Cadrage et lancement de projet': [
        'Lancement du projet',
        'Mise en place de la gouvernance',
        'Workshop de cadrage',
        'Présentation au Comité de pilotage',
        'Validation du périmètre',
        'Arbitrage budgétaire'
      ],
      'Gestion des exigences et des parties prenantes': [
        'Atelier de recueil des besoins',
        'Cartographie des parties prenantes',
        'Priorisation des exigences',
        'Validation du cahier des charges',
        'Gestion d\'un conflit d\'intérêts',
        'Communication aux utilisateurs'
      ],
      'Planification et suivi de projet': [
        'Élaboration du planning',
        'Présentation de l\'avancement',
        'Analyse des écarts',
        'Réorganisation des ressources',
        'Ajustement des délais',
        'Reporting de fin d\'itération'
      ],
      'Gestion des risques et des problèmes': [
        'Identification des risques',
        'Élaboration du plan de mitigation',
        'Survenance d\'un problème technique',
        'Escalade vers le Comité de pilotage',
        'Mise en œuvre du plan de contingence',
        'Résolution de crise'
      ],
      'Clôture et capitalisation de projet': [
        'Préparation du bilan de projet',
        'Organisation de la réception finale',
        'Animation de l\'atelier de REX',
        'Transfert vers les équipes opérationnelles',
        'Présentation des résultats',
        'Capitalisation des enseignements'
      ]
    },
    'Conduite du Changement': {
      'Diagnostic et stratégie de transformation': [
        'Analyse de l\'existant',
        'Définition de la cible',
        'Cadrage de la stratégie',
        'Présentation de la vision',
        'Définition des indicateurs de succès',
        'Validation de la feuille de route'
      ],
      'Communication et gestion de la résistance au changement': [
        'Élaboration du plan de communication',
        'Gestion d\'une contestation',
        'Atelier d\'écoute',
        'Diffusion des messages clés',
        'Mobilisation du management',
        'Traitement des objections'
      ],
      'Formation et accompagnement': [
        'Analyse des besoins en formation',
        'Conception du dispositif',
        'Préparation des supports',
        'Animation d\'une session pilote',
        'Déploiement massif',
        'Évaluation des acquis'
      ],
      'Ancrage et pérennisation du changement': [
        'Identification des leviers d\'ancrage',
        'Mise en place du réseau de relais',
        'Suivi de l\'adoption',
        'Ajustement du dispositif',
        'Animation de la communauté',
        'Célébration des succès'
      ],
      'Mesure de l\'efficacité des actions de conduite du changement': [
        'Définition des indicateurs',
        'Mise en place du tableau de bord',
        'Collecte des premiers résultats',
        'Analyse des écarts',
        'Présentation au Comité',
        'Recommandations d\'ajustement'
      ]
    },
    'Cybersécurité': {
      'Audit et évaluation des risques': [
        'Lancement de la mission d\'audit',
        'Identification des vulnérabilités',
        'Analyse des menaces',
        'Évaluation des impacts',
        'Priorisation des risques',
        'Présentation des conclusions'
      ],
      'Gouvernance et conformité': [
        'Analyse du cadre réglementaire',
        'Définition de la politique de sécurité',
        'Mise en place des processus',
        'Préparation d\'un audit',
        'Gestion des non-conformités',
        'Reporting sécurité'
      ],
      'Protection des données et cryptographie': [
        'Cartographie des données sensibles',
        'Définition de la stratégie de chiffrement',
        'Mise en œuvre des contrôles d\'accès',
        'Gestion d\'une fuite potentielle',
        'Test d\'intrusion',
        'Revue de sécurité'
      ],
      'Réponse aux incidents et gestion de crise': [
        'Détection d\'une activité suspecte',
        'Qualification de l\'incident',
        'Activation de la cellule de crise',
        'Mise en œuvre des contre-mesures',
        'Communication de crise',
        'Retour à la normale'
      ],
      'Sensibilisation et formation à la sécurité': [
        'Élaboration du programme',
        'Conception des messages clés',
        'Déploiement des premières actions',
        'Mesure de l\'impact',
        'Gestion d\'un incident provoqué par un utilisateur',
        'Renforcement du dispositif'
      ]
    },
    'Data & IA': {
      'Collecte et préparation des données': [
        'Identification des sources',
        'Définition de la stratégie d\'acquisition',
        'Mise en place des connecteurs',
        'Nettoyage et structuration',
        'Gestion d\'un problème de qualité',
        'Validation du pipeline'
      ],
      'Analyse descriptive et visualisation': [
        'Définition des indicateurs clés',
        'Conception des tableaux de bord',
        'Présentation des premières visualisations',
        'Analyse des tendances',
        'Réponse aux demandes métier',
        'Optimisation des rapports'
      ],
      'Modélisation prédictive et machine learning': [
        'Cadrage du cas d\'usage',
        'Exploration des données',
        'Développement du modèle',
        'Evaluation des performances',
        'Gestion d\'un biais détecté',
        'Mise en production'
      ],
      'Éthique et gouvernance des données': [
        'Analyse des enjeux éthiques',
        'Élaboration de la charte',
        'Mise en place du comité',
        'Traitement d\'un cas sensible',
        'Audit des pratiques',
        'Communication des principes'
      ],
      'Intégration de l\'IA dans les processus métier': [
        'Identification des opportunités',
        'Conception de la solution',
        'Déploiement du prototype',
        'Mesure de la valeur',
        'Gestion de la résistance',
        'Généralisation de l\'usage'
      ]
    },
    'UX et Design Thinking': {
      'Recherche utilisateur et personas': [
        'Planification de la recherche',
        'Animation d\'entretiens',
        'Analyse des observations',
        'Création des personas',
        'Présentation des insights',
        'Ajustement des hypothèses'
      ],
      'Prototypage et tests utilisateurs': [
        'Définition des scénarios',
        'Création des premiers wireframes',
        'Développement du prototype',
        'Animation des tests',
        'Analyse des retours',
        'Itération sur le concept'
      ],
      'Design d\'interface et d\'interaction': [
        'Définition des principes de design',
        'Création de la charte graphique',
        'Conception des premiers écrans',
        'Revue de design',
        'Ajustement basé sur les retours',
        'Finalisation de l\'interface'
      ],
      'Accessibilité et design inclusif': [
        'Audit d\'accessibilité',
        'Définition des standards',
        'Implémentation des améliorations',
        'Tests avec des utilisateurs en situation de handicap',
        'Traitement des non-conformités',
        'Certification d\'accessibilité'
      ],
      'Animation d\'ateliers de co-conception': [
        'Préparation de l\'atelier',
        'Recrutement des participants',
        'Animation de la session',
        'Synthèse des contributions',
        'Transformation en spécifications',
        'Présentation des résultats'
      ]
    }
  };
  
  // Récupérer les titres pour le domaine et sous-thème
  const titresDisponibles = titres[domaine]?.[sousTheme] || [
    'Lancement du projet',
    'Premier point d\'avancement',
    'Résolution d\'un problème',
    'Réunion de coordination',
    'Ajustement stratégique',
    'Bilan et perspectives'
  ];
  
  // Garantir un index valide
  const index = Math.min(numero - 1, titresDisponibles.length - 1);
  return titresDisponibles[index];
}

/**
 * Renvoie une instruction pour le scénario
 */
function getInstructionScenario(domaine: string, sousTheme: string, numero: number): string {
  // Tableau d'instructions génériques par numéro de scénario (progression de difficulté)
  const instructionsBase = [
    "Analysez la situation et répondez à ce mail en proposant une approche structurée pour résoudre la problématique.",
    "Identifiez les enjeux clés de cette situation et proposez un plan d'action adapté.",
    "Formulez une réponse qui adresse les préoccupations exprimées et proposez des solutions concrètes.",
    "La situation se complexifie. Proposez une stratégie pour gérer cette nouvelle contrainte tout en maintenant le cap.",
    "Face à cette situation critique, élaborez une réponse qui démontre votre capacité à gérer la pression et à prendre des décisions.",
    "C'est l'étape finale. Synthétisez la situation, proposez une résolution et anticipez les prochaines étapes."
  ];
  
  // Index sécurisé
  const index = Math.min(numero - 1, instructionsBase.length - 1);
  return instructionsBase[index];
}

/**
 * Génère un email pour le scénario
 */
function generateEmail(session: LearningBotSession, numero: number, dernierMessage: string = ""): string {
  // On supprime cette section car elle contient des erreurs et on utilisera l'API GPT pour générer les emails
  return `De : Assistant Formation <formation@mc2i.fr>
À : ${session.prenom} <${session.prenom?.toLowerCase() || 'consultant'}@mc2i.fr>
Cc : equipe.projet@mc2i.fr
Objet : Scénario ${numero} - ${session.sousTheme}
Date : ${new Date().toLocaleDateString('fr-FR')}

Bonjour ${session.prenom},

Voici votre scénario immersif pour la session d'aujourd'hui.
Ce scénario concerne ${session.sousTheme} dans le domaine ${session.domaineExpertise}.

[Le contenu détaillé du scénario sera généré par l'API]

Merci de votre participation active à ce module de formation.

Cordialement,
L'équipe Formation mc2i`;
}
  // Obtenir la date et l'heure actuelles au format français
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
  // Première lettre en majuscule
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  // Noms fictifs selon les domaines
  const noms = {
    'Pilotage de Projet et AMOA': [
      { prenom: 'Sophie', nom: 'Durand', titre: 'Directrice de Projet' },
      { prenom: 'Thomas', nom: 'Moreau', titre: 'Responsable AMOA' },
      { prenom: 'Claire', nom: 'Lefort', titre: 'PMO' }
    ],
    'Conduite du Changement': [
      { prenom: 'Julie', nom: 'Bertrand', titre: 'Responsable Conduite du Changement' },
      { prenom: 'Nicolas', nom: 'Lambert', titre: 'Directeur de la Transformation' },
      { prenom: 'Emma', nom: 'Garcia', titre: 'Consultante Change' }
    ],
    'Cybersécurité': [
      { prenom: 'Alexandre', nom: 'Martin', titre: 'RSSI' },
      { prenom: 'Céline', nom: 'Dubois', titre: 'Responsable Conformité' },
      { prenom: 'Maxime', nom: 'Robert', titre: 'Expert Cybersécurité' }
    ],
    'Data & IA': [
      { prenom: 'Léa', nom: 'Petit', titre: 'Lead Data Scientist' },
      { prenom: 'Hugo', nom: 'Leroy', titre: 'Chief Data Officer' },
      { prenom: 'Sarah', nom: 'Bernard', titre: 'Data Analyst' }
    ],
    'UX et Design Thinking': [
      { prenom: 'Paul', nom: 'Roux', titre: 'UX Lead' },
      { prenom: 'Camille', nom: 'Fournier', titre: 'Responsable Design' },
      { prenom: 'Antoine', nom: 'Morel', titre: 'Product Designer' }
    ]
  };
  
  // Sélectionner un domaine et un expéditeur
  const domaine = session.domaineExpertise || 'Pilotage de Projet et AMOA';
  const personnes = noms[domaine] || noms['Pilotage de Projet et AMOA'];
  const expediteur = personnes[Math.min(numero % personnes.length, personnes.length - 1)];
  
  // Générer les contenus du mail en fonction du numéro de scénario
  let sujet = '';
  let corps = '';
  
  // Titres des scénarios selon progression
  const progressionTitres = [
    `Lancement de notre collaboration sur ${session.sousTheme}`,
    `Point d'avancement - ${session.sousTheme}`,
    `Question sur notre approche - ${session.sousTheme}`,
    `Difficulté rencontrée - ${session.sousTheme}`,
    `Urgent - Situation critique sur ${session.sousTheme}`,
    `Plan d'action final - ${session.sousTheme}`
  ];
  
  // Corps des emails selon progression
  const progressionCorps = [
    `Bonjour,\n\nEn tant que nouveau chef de projet mc2i sur notre mission, je souhaite vous présenter le contexte de notre collaboration.\n\nNous démarrons un projet important lié à ${session.sousTheme} pour notre client du secteur ${getClientSector(domaine)}.\n\nPourriez-vous me proposer une approche méthodologique adaptée pour bien démarrer cette mission ? Nous avons besoin d'une vision claire pour notre kickoff prévu la semaine prochaine.\n\nMerci d'avance pour votre contribution.`,
    
    `Bonjour,\n\nSuite à notre lancement de projet, nous avons progressé sur plusieurs aspects liés à ${session.sousTheme}.\n\nCependant, nous rencontrons quelques difficultés dans l'appropriation de la méthode par certaines équipes. Le client s'interroge sur notre capacité à tenir les délais ambitieux.\n\nPouvez-vous proposer des solutions pour améliorer l'adhésion des équipes et optimiser notre planning ?`,
    
    `Bonjour,\n\nJe reviens vers vous concernant notre projet ${session.sousTheme}.\n\nLe client vient de nous faire part d'une préoccupation importante : il souhaite intégrer de nouvelles exigences qui n'étaient pas dans le périmètre initial tout en conservant la date de livraison inchangée.\n\nComment recommandez-vous de gérer cette situation ? Quelle serait votre approche pour maintenir la qualité du livrable malgré cette contrainte supplémentaire ?`,
    
    `Bonjour,\n\nNous faisons face à une complication majeure sur notre projet ${session.sousTheme}.\n\nL'équipe technique vient d'identifier un risque significatif qui pourrait compromettre la solution en cours d'implémentation. Par ailleurs, deux parties prenantes clés ont des visions divergentes sur la direction à prendre.\n\nCette situation nécessite une intervention rapide de notre part. Quelle stratégie proposez-vous pour résoudre ces problèmes tout en préservant la confiance du client ?`,
    
    `URGENT - Bonjour,\n\nUne situation critique vient de survenir sur notre projet ${session.sousTheme}.\n\nNous avons détecté un problème majeur qui pourrait compromettre l'ensemble du projet et la direction générale du client vient d'exprimer son mécontentement. Notre sponsor interne est également remis en question.\n\nNous devons réagir immédiatement. Quelles actions recommandez-vous pour gérer cette crise, limiter les impacts et reprendre le contrôle de la situation ?`,
    
    `Bonjour,\n\nNous arrivons à un moment décisif de notre projet ${session.sousTheme}.\n\nMalgré les difficultés rencontrées, nous avons l'opportunité de conclure ce projet sur une note positive et d'ouvrir la voie à une nouvelle collaboration.\n\nPourriez-vous élaborer un plan d'action final incluant : les dernières étapes à réaliser, une stratégie de communication pour valoriser nos réussites et des recommandations pour la suite ?\n\nCe plan sera présenté au comité exécutif la semaine prochaine.`
  ];
  
  // Sélectionner le contenu en fonction du numéro de scénario
  const indexScenario = Math.min(numero - 1, progressionTitres.length - 1);
  sujet = progressionTitres[indexScenario];
  corps = progressionCorps[indexScenario];
  
  // Construire l'email complet
  return `De : ${expediteur.prenom} ${expediteur.nom} <${expediteur.prenom.toLowerCase()}.${expediteur.nom.toLowerCase()}@mc2i.fr>
À : ${session.prenom || 'Consultant'} <${session.prenom ? session.prenom.toLowerCase() : 'consultant'}@mc2i.fr>
Cc : equipe.projet@mc2i.fr
Objet : ${sujet}
Date : ${capitalizedDate}

${corps}

Cordialement,

${expediteur.prenom} ${expediteur.nom}
${expediteur.titre}
mc2i Groupe
51 rue François 1er, 75008 Paris
Tél : 01.44.43.01.00`;
}

const promptScenario = `
En tant que mc2i AI Learning, tu dois générer un scénario pour évaluer les compétences de l'apprenant.

Détails de l'apprenant:
- Trigramme: ${session.trigramme}
- Métier: ${session.metier}
- Mode d'apprentissage: ${session.mode} (${session.mode === 'classique' ? '4 scénarios indépendants' : '6 scénarios reliés avec impact'})
- Formation choisie: ${session.formationChoisie}
- Numéro du scénario actuel: ${session.scenarioActuel + 1}${session.mode === 'immersion' && session.scenarioActuel > 0 ? `
- Dernière réponse de l'apprenant pour le scénario précédent: "${lastResponse}"` : ''}
- Date et heure actuelles: ${capitalizedDate}

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
   Date : ${capitalizedDate}

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
    // Obtenir la date et l'heure actuelles au format français
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
    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
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
   Date : ${capitalizedDate}

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
    // Obtenir la date et l'heure actuelles au format français
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
    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Créer un contexte avec l'historique des messages pour l'API GPT-4o
    const contextMessages = session.messages.slice(-10); // Limiter à 10 derniers messages pour le contexte
    
    // Ajouter une instruction système spécifique
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt() + `\nRéponds à l'utilisateur en fonction du contexte de la conversation et de son stade actuel dans le processus d'apprentissage. Utilise toujours un format d'email professionnel et réaliste lorsqu'approprié avec des adresses se terminant par @mc2i.fr. La date et l'heure actuelles sont : ${capitalizedDate}`
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