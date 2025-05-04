import { Request, Response } from "express";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { BinaryDecision, BinaryDecisionOption, TeamFeedback } from "../shared/types/cyber";
import { getContactByName, getEvaluatorsByDomain } from "../shared/types/cyber";

interface DecisionSequenceSession {
  userId: string;
  userRole: string;
  domain: string;
  currentStep: number;
  lastDecision?: BinaryDecisionOption;
  teamFeedback?: TeamFeedback[];
  decisions: BinaryDecision[];
}

// Stockage des sessions de décision en mémoire
const decisionSessions: { [userId: string]: DecisionSequenceSession } = {};

/**
 * Fonction d'initialisation d'une séquence de décisions binaires pour un utilisateur
 * @param req Requête HTTP
 * @param res Réponse HTTP
 */
export async function initDecisionSequence(req: Request, res: Response) {
  try {
    const { userRole, domain, userName, companyName = "mc2i" } = req.body;
    
    if (!userRole || !domain || !userName) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants: userRole, domain et userName sont requis"
      });
    }
    
    // Générer un ID utilisateur si non fourni
    const userId = req.body.userId || `${userName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;
    
    // Créer une nouvelle session
    const session: DecisionSequenceSession = {
      userId,
      userRole,
      domain,
      currentStep: 1,
      decisions: []
    };
    
    // Générer la première décision
    const firstDecision = await generateBinaryDecision(
      userRole,
      domain,
      userName,
      companyName,
      1,
      undefined
    );
    
    // Stocker la session
    decisionSessions[userId] = session;
    
    // Renvoyer la première décision
    return res.json({
      success: true,
      userId,
      nextDecision: firstDecision
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la séquence:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de l'initialisation de la séquence",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Fonction de traitement d'une décision de l'utilisateur dans la séquence
 * @param req Requête HTTP
 * @param res Réponse HTTP
 */
export async function handleSequenceDecision(req: Request, res: Response) {
  try {
    const { userId, optionId, contextData = {} } = req.body;
    
    if (!userId || !optionId) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants: userId et optionId sont requis"
      });
    }
    
    // Récupérer la session
    const session = decisionSessions[userId];
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session de décision non trouvée. Veuillez initialiser une nouvelle séquence."
      });
    }
    
    // Récupérer la décision actuelle
    const currentDecision = session.decisions[session.currentStep - 1];
    if (!currentDecision) {
      return res.status(400).json({
        success: false,
        message: "Aucune décision en cours. La séquence est peut-être terminée."
      });
    }
    
    // Identifier l'option choisie
    let selectedOption: BinaryDecisionOption | undefined;
    if (optionId === currentDecision.optionA.id) {
      selectedOption = currentDecision.optionA;
    } else if (optionId === currentDecision.optionB.id) {
      selectedOption = currentDecision.optionB;
    }
    
    if (!selectedOption) {
      return res.status(400).json({
        success: false,
        message: "Option non valide. Veuillez choisir une option disponible."
      });
    }
    
    // Mettre à jour la session
    session.lastDecision = selectedOption;
    session.currentStep++;
    
    // Générer le feedback de l'équipe
    const teamFeedback = await generateTeamFeedback(
      session.userRole,
      session.domain,
      selectedOption.id === currentDecision.optionA.id ? "A" : "B",
      session.currentStep - 1
    );
    
    // Ajouter le feedback à la session
    if (!session.teamFeedback) {
      session.teamFeedback = [];
    }
    session.teamFeedback.push(teamFeedback);
    
    // Vérifier si la séquence est terminée
    let nextDecision: BinaryDecision | null = null;
    if (session.currentStep <= 5) {
      // Générer la prochaine décision
      nextDecision = await generateBinaryDecision(
        session.userRole,
        session.domain,
        req.body.userName || "utilisateur",
        contextData.companyName || "mc2i",
        session.currentStep,
        selectedOption.id === currentDecision.optionA.id ? "A" : "B"
      );
      
      // Ajouter la décision à la session
      session.decisions.push(nextDecision);
    }
    
    // Renvoyer la réponse
    return res.json({
      success: true,
      currentStep: session.currentStep - 1,
      selectedOption,
      teamFeedback,
      nextDecision,
      isComplete: session.currentStep > 5
    });
  } catch (error) {
    console.error("Erreur lors du traitement de la décision:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors du traitement de la décision",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Fonction pour générer une décision binaire adaptée au contexte
 * @param userRole Rôle de l'utilisateur
 * @param domain Domaine cybersécurité
 * @param userName Nom de l'utilisateur
 * @param companyName Nom de l'entreprise
 * @param step Numéro de l'étape dans la séquence
 * @param previousChoice Type de la décision précédente (A ou B), pour assurer une continuité
 */
async function generateBinaryDecision(
  userRole: string,
  domain: string,
  userName: string,
  companyName: string,
  step: number,
  previousChoice?: string
): Promise<BinaryDecision> {
  try {
    // Déterminer le contexte en fonction du domaine
    let domainName = "cybersécurité";
    switch (domain) {
      case "gestion-crise":
        domainName = "gestion de crise cyber";
        break;
      case "ingenierie-sociale":
        domainName = "ingénierie sociale et phishing";
        break;
      case "donnees-personnelles":
        domainName = "protection des données personnelles";
        break;
      case "gestion-incidents":
        domainName = "gestion des incidents de sécurité";
        break;
      case "supply-chain":
        domainName = "sécurité de la chaîne d'approvisionnement";
        break;
      case "strategie-cyber":
        domainName = "stratégie et gouvernance cybersécurité";
        break;
    }
    
    // Définir un court contexte pour la décision basé sur l'étape
    let contextBase = "";
    switch (step) {
      case 1:
        contextBase = `Vous venez d'être alerté d'un problème en ${domainName} chez ${companyName}.`;
        break;
      case 2:
        contextBase = `La situation évolue rapidement après votre première action en ${domainName}.`;
        break;
      case 3:
        contextBase = `Les conséquences des premières décisions se manifestent maintenant en ${domainName}.`;
        break;
      case 4:
        contextBase = `Un nouveau développement critique requiert votre expertise en ${domainName}.`;
        break;
      case 5:
        contextBase = `La situation atteint un point culminant qui pourrait résoudre la crise en ${domainName}.`;
        break;
    }
    
    // Construire un prompt pour Azure OpenAI
    const openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY as string,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION_SECONDARY },
    });
    
    // Prompt pour générer une décision binaire avec deux options contrastées
    const prompt = `
    En tant qu'expert en cybersécurité dans le domaine de la ${domainName}, générez une situation de décision binaire stratégique pour un ${userRole} chez ${companyName}.

    Contexte initial: ${contextBase}
    
    Étape actuelle: ${step}/5
    ${previousChoice ? `Choix précédent: Option ${previousChoice}` : "Première décision"}
    
    Veuillez générer une situation de décision avec:
    1. Un contexte court en 2-3 phrases maximum décrivant la situation actuelle
    2. Deux options (A et B) qui sont clairement contrastées et représentent des approches différentes
    3. Pour chaque option, fournir:
       - Un titre court (1 ligne)
       - Une description détaillée de l'approche (2-3 lignes)
       - Potentielles conséquences (1-2 lignes)
    
    Important:
    - Les deux options doivent être légitimes et réalistes dans un contexte professionnel
    - Aucune option ne doit être manifestement meilleure que l'autre
    - Les options doivent avoir des philosophies d'approche contrastées (ex: proactif vs réactif, technique vs organisationnel)
    - Citez des technologies, normes ou réglementations réelles (ISO 27001, ANSSI, NIST, etc.)
    
    Répondez au format JSON structuré comme ceci:
    {
      "context": "Description précise du contexte en 2-3 phrases maximum",
      "optionA": {
        "text": "Titre court de l'option A",
        "description": "Description détaillée de l'approche A",
        "consequences": "Potentielles conséquences de l'option A"
      },
      "optionB": {
        "text": "Titre court de l'option B",
        "description": "Description détaillée de l'approche B",
        "consequences": "Potentielles conséquences de l'option B"
      }
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY || "",
      messages: [
        { 
          role: "system", 
          content: "Vous êtes un expert en cybersécurité qui génère des scénarios de décision réalistes et équilibrés pour former des professionnels. Vos réponses sont en format JSON structuré uniquement."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extraire la réponse
    let decisionData: any;
    try {
      decisionData = JSON.parse(response.choices[0].message.content || "{}");
    } catch (e) {
      console.error("Erreur lors du parsing de la réponse JSON:", e);
      return createFallbackDecision(step);
    }
    
    // Créer l'objet de décision
    const decision: BinaryDecision = {
      id: uuidv4(),
      context: decisionData.context || `Situation critique en ${domainName} requérant votre attention immédiate.`,
      optionA: {
        id: `option-a-${step}`,
        text: decisionData.optionA?.text || `Option A stratégique`,
        description: decisionData.optionA?.description || `Approche stratégique recommandée par les standards de l'industrie.`,
        consequences: decisionData.optionA?.consequences || `Impact potentiel sur les opérations.`
      },
      optionB: {
        id: `option-b-${step}`,
        text: decisionData.optionB?.text || `Option B tactique`,
        description: decisionData.optionB?.description || `Approche tactique alternative avec différentes considérations.`,
        consequences: decisionData.optionB?.consequences || `Impact potentiel sur les ressources.`
      },
      step
    };
    
    return decision;
  } catch (error) {
    console.error("Erreur lors de la génération de la décision binaire:", error);
    // En cas d'erreur, retourner une décision de secours
    return createFallbackDecision(step);
  }
}

/**
 * Fonction pour générer un retour d'équipe suite à une décision
 * @param userRole Rôle de l'utilisateur
 * @param domain Domaine cybersécurité
 * @param optionType Type d'option choisie (A ou B)
 * @param step Étape actuelle
 */
async function generateTeamFeedback(
  userRole: string,
  domain: string,
  optionType: string,
  step: number
): Promise<TeamFeedback> {
  try {
    // Sélectionner un membre de l'équipe approprié pour donner le feedback
    const teamMembers = getEvaluatorsByDomain(domain);
    const memberIndex = Math.min(step - 1, teamMembers.length - 1);
    const teamMember = teamMembers[memberIndex] || getContactByName("Thomas Mercier");
    
    if (!teamMember) {
      return createFallbackFeedback(
        "Équipe Cybersécurité",
        "Expert technique",
        optionType === "A" ? "positive" : "neutral"
      );
    }
    
    // Construire un prompt pour Azure OpenAI
    const openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY as string,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION_SECONDARY },
    });
    
    // Déterminer le sentiment en fonction de l'option et de l'étape
    // Nous alternons entre positif, neutre et négatif pour créer une expérience variée
    let sentiment: "positive" | "negative" | "neutral";
    if (step === 1) {
      // Première étape: feedback toujours positif pour encourager
      sentiment = "positive";
    } else if (step === 5) {
      // Dernière étape: feedback plus critique
      sentiment = optionType === "A" ? "neutral" : "negative";
    } else {
      // Étapes intermédiaires: varier selon l'option et l'étape
      if ((step === 2 && optionType === "A") || (step === 3 && optionType === "B") || (step === 4 && optionType === "A")) {
        sentiment = "positive";
      } else if ((step === 2 && optionType === "B") || (step === 4 && optionType === "B")) {
        sentiment = "negative";
      } else {
        sentiment = "neutral";
      }
    }
    
    // Prompt pour générer un feedback réaliste
    const prompt = `
    Générez un feedback professionnel et réaliste de la part d'un membre d'équipe cybersécurité suite à une décision prise par un ${userRole}.
    
    Membre de l'équipe:
    Nom: ${teamMember.name}
    Rôle: ${teamMember.role}
    Expertise: ${teamMember.expertise || "Expertise générale en cybersécurité"}
    
    Contexte:
    - Étape: ${step}/5 dans la séquence de décisions
    - Option choisie: Option ${optionType}
    - Sentiment général à exprimer: ${sentiment === "positive" ? "positif" : sentiment === "negative" ? "négatif" : "nuancé/neutre"}
    - Domaine concerné: ${domain}
    
    Le feedback doit:
    1. Être réaliste et professionnel (comme dans une situation d'entreprise réelle)
    2. Faire référence à l'expertise spécifique du membre de l'équipe
    3. Exprimer le sentiment demandé sans être trop extrême
    4. Rester concis (2-4 phrases maximum)
    5. Ne pas répéter les mêmes formulations que les feedbacks précédents
    6. Inclure au moins une référence à une norme ou bonne pratique du secteur (ex: ANSSI, NIST, ISO 27001)
    7. Ne pas contenir d'instructions techniques spécifiques ou de recommandations détaillées (juste un feedback)
    
    Répondez au format JSON structuré:
    {
      "message": "Le message de feedback complet",
      "sentiment": "${sentiment}"
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY || "",
      messages: [
        { 
          role: "system", 
          content: "Vous êtes un expert en cybersécurité qui génère des retours d'équipe réalistes et professionnels. Vos réponses sont en format JSON structuré uniquement."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extraire la réponse
    let feedbackData: any;
    try {
      feedbackData = JSON.parse(response.choices[0].message.content || "{}");
    } catch (e) {
      console.error("Erreur lors du parsing de la réponse JSON:", e);
      return createFallbackFeedback(
        teamMember.name,
        teamMember.role,
        sentiment
      );
    }
    
    // Créer l'objet de feedback
    return {
      message: feedbackData.message || `Réaction à votre décision concernant la situation actuelle.`,
      sender: teamMember.name,
      senderRole: teamMember.role,
      sentiment: feedbackData.sentiment || sentiment
    };
  } catch (error) {
    console.error("Erreur lors de la génération du feedback d'équipe:", error);
    // En cas d'erreur, retourner un feedback de secours
    return createFallbackFeedback(
      "Équipe Cybersécurité",
      "Expert technique",
      optionType === "A" ? "positive" : "neutral"
    );
  }
}

/**
 * Fonction pour créer une décision de secours en cas d'erreur
 * @param step Étape actuelle
 */
function createFallbackDecision(step: number): BinaryDecision {
  const fallbackDecisions: Array<Partial<BinaryDecision>> = [
    {
      context: "Une tentative d'hameçonnage ciblée a été détectée visant les cadres dirigeants de l'entreprise. Plusieurs emails contenant des liens suspects ont été identifiés dans les boîtes de réception.",
      optionA: {
        text: "Déployer un filtrage avancé des emails",
        description: "Mettre en place immédiatement un filtrage supplémentaire des emails avec analyse comportementale pour bloquer les tentatives similaires.",
        consequences: "Délai de traitement des emails légitimes potentiellement augmenté pendant le réglage du système."
      },
      optionB: {
        text: "Lancer une campagne de sensibilisation d'urgence",
        description: "Informer immédiatement tous les employés par notification d'urgence et organiser des sessions rapides de sensibilisation ciblées.",
        consequences: "Impact sur la productivité à court terme mais renforcement de la vigilance collective."
      }
    },
    {
      context: "Un scan de vulnérabilités a révélé des failles critiques dans plusieurs serveurs de production. Ces vulnérabilités pourraient permettre un accès non autorisé aux données sensibles.",
      optionA: {
        text: "Appliquer immédiatement les correctifs disponibles",
        description: "Déployer les correctifs de sécurité en urgence sur tous les systèmes concernés, même pendant les heures de travail.",
        consequences: "Risque d'interruption temporaire des services pendant la mise à jour."
      },
      optionB: {
        text: "Mettre en place des mesures d'atténuation temporaires",
        description: "Renforcer la surveillance, limiter l'accès et planifier les correctifs pour le prochain créneau de maintenance.",
        consequences: "Vulnérabilités toujours présentes mais risques réduits par les contrôles supplémentaires."
      }
    },
    {
      context: "Un prestataire externe signale une possible compromission de ses systèmes. Cette société a accès à certaines de vos plateformes dans le cadre d'un contrat de maintenance.",
      optionA: {
        text: "Révoquer tous les accès du prestataire",
        description: "Suspendre immédiatement tous les accès du prestataire à vos systèmes jusqu'à clarification de la situation.",
        consequences: "Interruption possible de certains services maintenus par le prestataire."
      },
      optionB: {
        text: "Restreindre et surveiller les accès",
        description: "Limiter les accès du prestataire au strict minimum et mettre en place une surveillance renforcée de toutes ses activités.",
        consequences: "Maintien des services mais risque résiduel si la compromission est confirmée."
      }
    },
    {
      context: "Un comportement anormal a été détecté sur le réseau interne, suggérant un possible mouvement latéral après une intrusion. Plusieurs connexions inhabituelles entre systèmes ont été observées.",
      optionA: {
        text: "Isoler les systèmes suspects",
        description: "Déconnecter immédiatement du réseau tous les systèmes présentant un comportement anormal pour stopper la propagation.",
        consequences: "Impact opérationnel significatif mais limitation immédiate de la compromission."
      },
      optionB: {
        text: "Mener une investigation discrète",
        description: "Déployer des outils de surveillance supplémentaires pour analyser la situation sans alerter le potentiel attaquant.",
        consequences: "Risque de propagation continue pendant l'investigation mais meilleure compréhension de la menace."
      }
    },
    {
      context: "Une fuite de données client potentielle a été identifiée. Des informations sensibles pourraient avoir été exposées via une application web mal configurée.",
      optionA: {
        text: "Notification immédiate aux parties concernées",
        description: "Informer immédiatement les clients potentiellement affectés et les autorités réglementaires conformément au RGPD.",
        consequences: "Impact réputationnel immédiat mais démonstration de transparence et respect des obligations légales."
      },
      optionB: {
        text: "Analyse complète avant communication",
        description: "Conduire une investigation approfondie pour déterminer l'étendue exacte de la fuite avant toute communication externe.",
        consequences: "Communication plus précise mais risque de non-conformité avec les délais réglementaires de notification."
      }
    }
  ];
  
  const index = Math.min(step - 1, fallbackDecisions.length - 1);
  const fallback = fallbackDecisions[index];
  
  return {
    id: uuidv4(),
    context: fallback.context || `Situation critique requérant votre attention immédiate à l'étape ${step}.`,
    optionA: {
      id: `option-a-${step}`,
      text: fallback.optionA?.text || "Approche proactive",
      description: fallback.optionA?.description || "Prendre des mesures immédiates pour résoudre la situation.",
      consequences: fallback.optionA?.consequences || "Impact opérationnel à court terme mais résolution rapide."
    },
    optionB: {
      id: `option-b-${step}`,
      text: fallback.optionB?.text || "Approche méthodique",
      description: fallback.optionB?.description || "Analyser la situation en détail avant d'agir.",
      consequences: fallback.optionB?.consequences || "Délai de résolution mais minimisation des impacts collatéraux."
    },
    step
  };
}

/**
 * Fonction pour créer un feedback de secours en cas d'erreur
 * @param name Nom du membre d'équipe
 * @param role Rôle du membre d'équipe
 * @param sentiment Sentiment à exprimer
 */
function createFallbackFeedback(
  name: string,
  role: string,
  sentiment: "positive" | "negative" | "neutral"
): TeamFeedback {
  const messages = {
    positive: [
      "Excellente décision qui s'aligne parfaitement avec les recommandations de l'ANSSI pour ce type de situation. Votre approche démontre une bonne compréhension des priorités.",
      "Choix pertinent qui respecte les bonnes pratiques de l'ISO 27001. Cette décision permet de maintenir un équilibre optimal entre sécurité et continuité des activités.",
      "Je suis favorable à cette approche qui correspond aux standards du NIST. Vous avez bien identifié le levier d'action le plus efficace dans ce contexte."
    ],
    neutral: [
      "Cette décision présente des avantages, mais n'oublions pas de suivre les recommandations complémentaires du référentiel de l'ANSSI pour couvrir tous les aspects du risque.",
      "Approche acceptable selon les critères de l'ISO 27001, mais qui nécessitera une vigilance particulière lors de la mise en œuvre pour éviter les effets secondaires.",
      "Ce choix peut fonctionner si nous l'accompagnons des contrôles appropriés tels que recommandés par le NIST. Restons attentifs à l'évolution de la situation."
    ],
    negative: [
      "Cette décision s'écarte des recommandations de l'ANSSI pour ce type de scénario. Nous devrions reconsidérer notre approche pour limiter notre exposition.",
      "Je m'inquiète de ce choix qui ne respecte pas pleinement les exigences de l'ISO 27001 en matière de gestion des risques. Nous devrions envisager des mesures compensatoires.",
      "Cette approche contrevient aux bonnes pratiques du NIST et pourrait nous exposer à des risques significatifs. Une révision de notre stratégie serait prudente."
    ]
  };
  
  const index = Math.floor(Math.random() * 3);
  
  return {
    message: messages[sentiment][index],
    sender: name,
    senderRole: role,
    sentiment
  };
}