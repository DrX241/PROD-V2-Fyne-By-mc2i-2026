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
  if (domaine === 'Pilotage de Projet et AMOA') {
    if (sousTheme === 'Cadrage et lancement de projet') {
      return 'piloter le lancement d\'un nouveau système d\'information bancaire critique';
    } else if (sousTheme === 'Gestion des exigences et des parties prenantes') {
      return 'coordonner la collecte des exigences pour un projet de refonte applicative';
    } else {
      return 'assurer le suivi d\'un projet d\'envergure';
    }
  } else if (domaine === 'Conduite du Changement') {
    return 'accompagner la transformation numérique d\'une organisation';
  } else if (domaine === 'Cybersécurité') {
    return 'mettre en place une gouvernance de sécurité robuste';
  } else if (domaine === 'Data & IA') {
    return 'valoriser les données pour améliorer la prise de décision';
  } else if (domaine === 'UX et Design Thinking') {
    return 'concevoir des parcours utilisateurs intuitifs et performants';
  }
  
  return 'piloter un projet stratégique pour le client';
}

/**
 * Renvoie un objectif adapté au domaine et sous-thème
 */
function getObjectifPourDomaine(domaine: string, sousTheme: string): string {
  if (domaine === 'Pilotage de Projet et AMOA') {
    if (sousTheme === 'Cadrage et lancement de projet') {
      return 'Établir une vision claire du projet, mobiliser les parties prenantes et poser les bases d\'une gouvernance efficace';
    } else if (sousTheme === 'Gestion des exigences et des parties prenantes') {
      return 'Analyser les besoins, formaliser les exigences et maintenir l\'alignement des parties prenantes';
    } else {
      return 'Assurer la réussite du projet dans les délais et le budget impartis';
    }
  }
  
  return 'Mener à bien le projet en respectant les objectifs définis avec le client';
}

/**
 * Génère un titre pour le scénario en fonction du domaine, sous-thème et numéro
 */
function getTitreScenario(domaine: string, sousTheme: string, numero: number): string {
  const titresGeneriques = [
    'Lancement du projet',
    'Premier point d\'avancement',
    'Gestion des parties prenantes',
    'Résolution de problème',
    'Gestion de crise',
    'Bilan et perspectives'
  ];
  
  // Garantir un index valide
  const index = Math.min(numero - 1, titresGeneriques.length - 1);
  return titresGeneriques[index];
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
 * Démarre le premier scénario immersif basé sur le domaine et le sous-thème choisis
 */
async function demarrerScenarioImmersif(session: LearningBotSession): Promise<string> {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('fr-FR');
    
    const prompt = `
Tu es mc2i AI Learning, un assistant spécialisé dans l'évaluation en temps réel des compétences professionnelles.

Génère le premier scénario d'une série de 6 pour une expérience immersive d'apprentissage avec les informations suivantes:
- Prénom de l'apprenant: ${session.prenom}
- Domaine d'expertise: ${session.domaineExpertise}
- Sous-thème spécifique: ${session.sousTheme}
- Secteur client: ${getClientSector(session.domaineExpertise || '')}

FORMAT ATTENDU:
Ton message doit commencer par une introduction au format email, puis inclure une description claire de la situation et de la tâche à accomplir.

L'email doit suivre strictement ce format:
---
De: [Nom du responsable] <email@mc2i.fr>
À: ${session.prenom} <${session.prenom?.toLowerCase()}@mc2i.fr>
Cc: [Si pertinent]
Objet: [Objet pertinent lié au scénario]
Date: ${formattedDate}

[Corps du message]

Cordialement,
[Signature]
---

Après l'email, ajoute un encadré "📝 Votre tâche:" avec des instructions claires sur ce que l'apprenant doit faire.
La réponse attendue doit nécessiter au moins 30 caractères.

IMPORTANT:
- L'email doit être 100% réaliste et professionnel
- Le scénario doit être immersif et engageant
- Reste dans le contexte du domaine et du sous-thème choisis
- Le scénario doit concerner la première étape d'un projet ou d'une mission (par exemple: lancement, cadrage initial, etc.)
`;

    // Utiliser l'API pour générer le scénario
    const messages = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: prompt }
    ];

    const generatedResponse = await openAIService.getChatCompletionWithCache(
      messages as ChatCompletionRequestMessage[], 
      0.7
    );

    return generatedResponse;
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
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('fr-FR');
    
    const prompt = `
Tu es mc2i AI Learning, un assistant spécialisé dans l'évaluation en temps réel des compétences professionnelles.

Génère le scénario ${session.scenarioActuel + 1} sur 6 pour une expérience immersive d'apprentissage avec les informations suivantes:
- Prénom de l'apprenant: ${session.prenom}
- Domaine d'expertise: ${session.domaineExpertise}
- Sous-thème spécifique: ${session.sousTheme}
- Secteur client: ${getClientSector(session.domaineExpertise || '')}
- Numéro du scénario actuel: ${session.scenarioActuel + 1}/6
- Dernière réponse de l'apprenant: "${dernierMessage.substring(0, 200)}${dernierMessage.length > 200 ? '...' : ''}"

FORMAT ATTENDU:
Ton message doit être au format email professionnel, avec une description claire de la situation et de la tâche à accomplir.

L'email doit suivre strictement ce format:
---
De: [Nom du responsable] <email@mc2i.fr>
À: ${session.prenom} <${session.prenom?.toLowerCase()}@mc2i.fr>
Cc: [Si pertinent]
Objet: [Objet pertinent lié au scénario]
Date: ${formattedDate}

[Corps du message]

Cordialement,
[Signature]
---

Après l'email, ajoute un encadré "📝 Votre tâche:" avec des instructions claires sur ce que l'apprenant doit faire.
La réponse attendue doit nécessiter au moins 30 caractères.

IMPORTANT:
- L'email doit être 100% réaliste et professionnel
- Le scénario doit être immersif et engageant
- Reste dans le contexte du domaine et du sous-thème choisis
- Tiens compte de la réponse précédente de l'apprenant pour créer une continuité logique
- La difficulté doit augmenter progressivement (scénario ${session.scenarioActuel + 1}/6)
- Assure-toi que chaque nouveau scénario découle naturellement des actions précédentes
`;

    // Utiliser l'API pour générer le scénario
    const messages = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: prompt }
    ];

    const generatedResponse = await openAIService.getChatCompletionWithCache(
      messages as ChatCompletionRequestMessage[], 
      0.7
    );

    return generatedResponse;
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
 * Génère une réponse générique pour les messages qui ne correspondent à aucun stade spécifique
 */
async function generateGenericResponse(session: LearningBotSession, message: string): Promise<string> {
  try {
    // Créer un contexte avec l'historique des messages pour l'API GPT-4o
    const contextMessages = session.messages.slice(-10); // Limiter à 10 derniers messages pour le contexte
    
    // Ajouter une instruction système spécifique
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt() + `\nRéponds à l'utilisateur en fonction du contexte de la conversation et de son stade actuel dans le processus d'apprentissage.`
    };
    
    // Utiliser l'API GPT-4o pour générer une réponse contextuelle
    const messages = [
      systemMessage,
      ...contextMessages
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache(messages, 0.7);
    return generatedResponse;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    return "Désolé, je n'ai pas pu traiter votre message. Pourriez-vous reformuler ou choisir l'une des options proposées ?";
  }
}

/**
 * Génère un prompt système pour le chatbot mc2i AI Learning
 */
function getMcaiLearningSystemPrompt(): string {
  return `
Tu es mc2i AI Learning, un agent conversationnel expert conçu pour simuler des situations professionnelles et évaluer les compétences des consultants mc2i de manière immersive, interactive et personnalisée. Ton objectif est d'accompagner l'apprenant en recréant des scénarios réalistes selon son métier, son niveau d'expérience et sa formation suivie. Tu guides l'utilisateur étape par étape, en respectant strictement les règles de validation, de confidentialité.

🎯 Objectifs principaux
Créer et adapter des scénarios professionnels selon le niveau de poste mc2i.

Fournir un feedback détaillé, constructif et strictement bienveillant.

Immerger l'apprenant dans une simulation réaliste par emails, messages, documents et interactions dynamiques.

🛠️ Déroulé et règles d'interaction
1. Accueil et identification
Dès le 1er message, tu :

Te présentes brièvement.

Demandes deux infos obligatoires :

Trigramme (3 lettres, alphabet uniquement).

Métier chez mc2i : Consultant, Consultant Confirmé, Consultant Senior, Chef de Projet, Manager, Senior Manager, Directeur.

Si une donnée est invalide, tu envoies un message clair d'erreur, et tu attends une réponse correcte avant de poursuivre.

2. Choix du parcours d'apprentissage
Propose deux options :

Apprentissage Classique (4 scénarios indépendants)

Immersion Totale (6 scénarios liés avec conséquences sur les choix)

Attends impérativement la réponse.

3. Sélection de la formation
Propose à l'utilisateur :

D'envoyer un fichier PDF ou Word (formation personnelle).

Ou de choisir un domaine dans une liste (AMOA, Agilité, Data & IA, etc.).

Ensuite, s'il choisit un domaine, affiche les sous-thèmes disponibles. Ex. pour "Data & IA" : Machine Learning, Power BI, etc.

4. Construction des scénarios
Tu génères les scénarios selon :

Le poste (ex. Directeur = stratégie, Consultant = application terrain).

Le thème choisi.

Chaque scénario prend la forme d'un message professionnel : email, message instantané, réunion, rapport, etc.

La consigne est claire et attend une réponse de minimum 30 caractères. Sinon, tu demandes une reformulation.

5. Feedback et progression
Après chaque réponse, tu formules un feedback structuré :

✅ Points forts

❗ Points à améliorer

🛠️ Conseils personnalisés

À la fin de la session, tu rédiges un email de synthèse professionnelle avec bilan global et recommandations.

📐 Règles de style et de présentation
Toujours une majuscule en début de phrase, un point à la fin.

Une seule majuscule par phrase sauf acronymes.

Langage professionnel, clair, sans abréviation ni familiarité.

Mise en page structurée avec des titres, des gras, des emojis discrets si besoin.

Respect absolu de la confidentialité des documents fournis.

🤖 Comportement du chatbot
Tu attends toujours la réponse de l'utilisateur avant de passer à l'étape suivante.

Tu ne poursuis jamais en cas d'erreur ou d'incomplétude.

Tu es strict dans la validation, bienveillant dans le ton, exigeant dans les retours.

Tu guides, encourages, et valorises la progression continue.
`;
}