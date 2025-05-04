import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { BinaryDecision, BinaryDecisionOption, TeamFeedback } from "@shared/types/cyber";
import { openAIService } from "./services/openai";
import { extractJsonFromOpenAiResponse, createFallbackJson } from "./openAiResponseHelper";

// Session de cache pour les décisions (en mémoire pour cette implémentation)
interface DecisionSequenceSession {
  userId: string;
  userRole: string;
  domain: string;
  currentStep: number;
  lastDecision?: BinaryDecisionOption;
  teamFeedback?: TeamFeedback[];
  decisions: BinaryDecision[];
}

// Cache temporaire pour les sessions en cours
const decisionSessions: { [userId: string]: DecisionSequenceSession } = {};

/**
 * Fonction d'initialisation d'une séquence de décisions binaires pour un utilisateur
 * @param req Requête HTTP
 * @param res Réponse HTTP
 */
export async function initDecisionSequence(req: Request, res: Response) {
  try {
    const { userRole, domain, userName, companyName = 'mc2i' } = req.body;

    if (!userRole || !domain || !userName) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants: userRole, domain et userName sont requis"
      });
    }

    const userId = uuidv4();

    // Création de la première décision binaire
    const firstDecision = await generateBinaryDecision(userRole, domain, userName, companyName, 1);

    // Initialisation de la session
    decisionSessions[userId] = {
      userId,
      userRole,
      domain,
      currentStep: 1,
      decisions: [firstDecision],
    };

    return res.status(200).json({
      success: true,
      userId,
      decision: firstDecision
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la séquence de décisions:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'initialisation de la séquence de décisions"
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
    const { userRole, domain, userName, decisionStep, optionId, contextData } = req.body;
    const companyName = contextData?.companyName || 'mc2i';

    if (!userRole || !domain || !decisionStep) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants"
      });
    }

    // Génération de la décision
    if (decisionStep > 0 && decisionStep <= 5) {
      // Déterminer l'option sélectionnée (A ou B)
      const optionType = optionId.includes("A") ? "A" : "B";
      
      // Générer le feedback de l'équipe
      const teamFeedback = await generateTeamFeedback(userRole, domain, optionType, decisionStep);
      
      // Si c'est la dernière étape, on ne génère pas de nouvelle décision
      let nextDecision = null;
      
      if (decisionStep < 5) {
        nextDecision = await generateBinaryDecision(
          userRole, 
          domain, 
          userName, 
          companyName, 
          decisionStep + 1,
          optionType
        );
      }

      // Construire la réponse avec l'option sélectionnée
      const selectedOption = {
        id: optionId,
        text: optionType === "A" 
          ? "Vous avez choisi l'option A"
          : "Vous avez choisi l'option B",
      };

      return res.status(200).json({
        success: true,
        selectedOption,
        teamFeedback,
        nextDecision,
        currentStep: decisionStep,
        isComplete: decisionStep >= 5
      });
    }

    return res.status(400).json({
      success: false,
      message: "Étape de décision invalide"
    });
  } catch (error) {
    console.error("Erreur lors du traitement de la décision:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors du traitement de la décision"
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
    // Construire le prompt pour l'IA en fonction du domaine et du rôle
    const prompt = `Génère une décision critique cybersécurité qui pourrait survenir dans le cadre du scénario suivant, dans le contexte d'une entreprise de conseil type ESN comme ${companyName}.

Domain: ${domain}
Rôle utilisateur: ${userRole}
Étape: ${step}/5 ${previousChoice ? `(suite à un choix de type ${previousChoice})` : ''}

Crée UNE SEULE décision binaire pour un professionnel en cybersécurité avec:
1. Un contexte court (maximum 3 phrases) décrivant une situation critique liée à la cybersécurité.
2. Deux options (A et B) radicalement opposées mais toutes deux défendables. Les options doivent être pertinentes, stratégiques et présenter un dilemme réel.

Pour chaque option, inclus:
- Un titre court et impactant (1 ligne)
- Une description détaillée de l'approche (2-3 phrases)
- Les conséquences potentielles de ce choix (1-2 phrases)

Respecte strictement ce format JSON :
{
  "id": "decision-${step}",
  "context": "contexte en 3 phrases maximum",
  "optionA": {
    "id": "option-${step}A",
    "text": "titre de l'option A",
    "description": "description détaillée de l'option A",
    "consequences": "conséquences possibles de l'option A"
  },
  "optionB": {
    "id": "option-${step}B",
    "text": "titre de l'option B",
    "description": "description détaillée de l'option B", 
    "consequences": "conséquences possibles de l'option B"
  },
  "step": ${step}
}

Important: Le format doit être strictement respecté pour être parsé correctement.`;

    // Appel à l'API OpenAI
    const response = await openAIService.getChatCompletion([
      { role: "system", content: "Tu es un expert en cybersécurité spécialisé dans les situations de crise et la prise de décision stratégique. Tu crées des scénarios réalistes de dilemmes en cybersécurité qui correspondent aux standards et meilleures pratiques actuelles (ANSSI, NIST, etc.)." },
      { role: "user", content: prompt }
    ], 0.7);

    // Extraire le JSON de la réponse
    const decisionData = extractJsonFromOpenAiResponse(response);
    
    if (!decisionData || !decisionData.context || !decisionData.optionA || !decisionData.optionB) {
      // Créer un fallback au cas où le format ne serait pas respecté
      return createFallbackDecision(step);
    }

    return decisionData as BinaryDecision;
  } catch (error) {
    console.error("Erreur lors de la génération de la décision binaire:", error);
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
    // Déterminer le membre de l'équipe qui va réagir en fonction de l'étape
    const teamMembers = [
      { name: "Thomas Mercier", role: "RSSI" },
      { name: "Yousra Saidani", role: "Directrice Communication et RSE" },
      { name: "Julien Grimault", role: "Sponsor du centre d'expertise Cybersécurité" },
      { name: "Sarah Dumont", role: "Directrice Juridique" },
      { name: "Eddy MISSONI IDEMBI", role: "Expert Data / IA" }
    ];
    
    // Sélectionner un membre d'équipe en fonction de l'étape
    const responder = teamMembers[(step - 1) % teamMembers.length];
    
    // Générer un sentiment approprié avec une tendance, mais pas complètement déterministe
    // Par exemple, Thomas Mercier peut être plus positif sur l'option A dans certains contextes
    let sentimentBias = Math.random();
    
    // Ajuster le biais en fonction du répondant et de l'option
    if (responder.name === "Thomas Mercier" && optionType === "A") {
      sentimentBias += 0.2; // Thomas préfère légèrement les approches de type A (plus techniques/rigoureuses)
    } else if (responder.name === "Yousra Saidani" && optionType === "B") {
      sentimentBias += 0.2; // Yousra préfère légèrement les approches de type B (plus orientées business/communication)
    }
    
    // Normaliser entre 0 et 1
    sentimentBias = Math.min(sentimentBias, 1);
    
    // Déterminer le sentiment final
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (sentimentBias > 0.65) {
      sentiment = "positive";
    } else if (sentimentBias < 0.35) {
      sentiment = "negative";
    }
    
    // Construire le prompt pour l'IA
    const prompt = `Génère une réaction crédible de la part d'un membre de l'équipe suite à une décision en cybersécurité.

Contexte:
- Domaine: ${domain}
- Type de décision prise par l'utilisateur: Option ${optionType} (${optionType === "A" ? "généralement plus technique/rigoureuse" : "généralement plus pragmatique/business"})
- Sentiment à exprimer: ${sentiment}
- Membre de l'équipe: ${responder.name}, ${responder.role}

Génère UNIQUEMENT une réaction concise (2-4 phrases) qui:
1. Est réaliste et professionnelle
2. Reflète le sentiment indiqué (${sentiment})
3. Est cohérente avec le rôle professionnel de la personne
4. Ne révèle pas explicitement si le choix était bon ou mauvais, mais donne un indice subtil
5. Inclut une brève remarque personnelle ou un conseil

Format strict JSON:
{
  "message": "Réaction du membre de l'équipe",
  "sender": "${responder.name}",
  "senderRole": "${responder.role}",
  "sentiment": "${sentiment}"
}`;

    // Appel à l'API OpenAI
    const response = await openAIService.getChatCompletion([
      { role: "system", content: "Tu es un expert en cybersécurité spécialisé dans les communications d'équipe et les dynamiques professionnelles. Tu génères des réactions réalistes de professionnels face à des décisions critiques." },
      { role: "user", content: prompt }
    ], 0.7);

    // Extraire le JSON de la réponse
    const feedbackData = extractJsonFromOpenAiResponse(response);
    
    if (!feedbackData || !feedbackData.message) {
      // Créer un fallback au cas où le format ne serait pas respecté
      return createFallbackFeedback(responder.name, responder.role, sentiment);
    }

    return feedbackData as TeamFeedback;
  } catch (error) {
    console.error("Erreur lors de la génération du feedback d'équipe:", error);
    // Créer un feedback de secours en cas d'erreur
    return createFallbackFeedback("Thomas Mercier", "RSSI", "neutral");
  }
}

/**
 * Fonction pour créer une décision de secours en cas d'erreur
 * @param step Étape actuelle
 */
function createFallbackDecision(step: number): BinaryDecision {
  return {
    id: `fallback-decision-${step}`,
    context: "Une tentative d'intrusion avancée vient d'être détectée sur le réseau de l'entreprise. Des comportements suspects indiquent qu'un acteur malveillant a potentiellement accédé à des données sensibles. Le CERT-FR vient d'émettre une alerte concernant ce type d'attaque.",
    optionA: {
      id: `option-${step}A`,
      text: "Isoler immédiatement les systèmes impactés",
      description: "Déconnecter immédiatement les systèmes potentiellement compromis du reste du réseau pour stopper la propagation. Effectuer ensuite une analyse forensique approfondie avant toute remise en service.",
      consequences: "Interruption temporaire des services critiques mais meilleure garantie de contenir la menace et d'effectuer une analyse complète."
    },
    optionB: {
      id: `option-${step}B`,
      text: "Maintenir les services avec surveillance renforcée",
      description: "Garder les systèmes en ligne tout en déployant des mesures de surveillance avancées pour observer l'attaquant et collecter des informations. Préparer un plan d'isolation en parallèle.",
      consequences: "Continuité des services critiques mais risque de propagation de l'attaque ou de destruction de preuves par l'attaquant."
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
  let message = "";
  
  switch (sentiment) {
    case "positive":
      message = "Je pense que cette approche est judicieuse compte tenu des circonstances. Elle reflète une bonne compréhension des enjeux sécuritaires et business. Continuons dans cette direction tout en restant vigilants.";
      break;
    case "negative":
      message = "Cette décision présente des risques significatifs que nous devons impérativement considérer. Je recommande fortement de réévaluer notre stratégie et d'envisager des mesures de protection supplémentaires.";
      break;
    default:
      message = "Cette décision a des avantages et des inconvénients. Nous devrions surveiller attentivement l'évolution de la situation et être prêts à ajuster notre approche si nécessaire.";
  }
  
  return {
    message,
    sender: name,
    senderRole: role,
    sentiment
  };
}