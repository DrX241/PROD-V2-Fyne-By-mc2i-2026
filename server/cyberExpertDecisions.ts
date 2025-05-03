import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from './services/openai';
import { expertSessions } from './cyberExpertController';

// Types pour les scénarios de décision
export interface DecisionOption {
  id: string;
  text: string;
  description: string;
  impacts: {
    security?: 'positive' | 'negative' | 'neutral';
    business?: 'positive' | 'negative' | 'neutral';
    team?: 'positive' | 'negative' | 'neutral';
    legal?: 'positive' | 'negative' | 'neutral';
    career?: 'positive' | 'negative' | 'neutral';
  };
}

export interface DecisionScenario {
  id: string;
  situation: string;
  context: string;
  historicalFacts: string;
  consequences: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  options: DecisionOption[];
}

interface ExpertDecisionState {
  userId: string;
  currentScenarioIndex: number;
  scenarios: DecisionScenario[];
  decisions: { scenarioId: string, optionId: string }[];
  isInDecisionMode: boolean;
  remainingScenarios: number;
}

// Map pour stocker l'état des décisions par utilisateur
const decisionStates = new Map<string, ExpertDecisionState>();

/**
 * Initialise une session de décisions après un débriefing
 */
export async function startDecisionFlow(req: Request, res: Response) {
  try {
    const { userId, topic } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    
    // Vérifier si la session existe
    if (!expertSessions.has(userId)) {
      return res.status(404).json({ error: "Session expert non trouvée" });
    }
    
    // Générer les scénarios de décision
    const scenarios = await generateDecisionScenarios(userId, topic);
    
    // Initialiser l'état de décision
    const decisionState: ExpertDecisionState = {
      userId,
      currentScenarioIndex: 0,
      scenarios,
      decisions: [],
      isInDecisionMode: true,
      remainingScenarios: scenarios.length
    };
    
    decisionStates.set(userId, decisionState);
    
    // Retourner le premier scénario
    return res.status(200).json({
      success: true,
      scenario: scenarios[0],
      remainingScenarios: scenarios.length,
      currentScenario: 1
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation du flux de décision:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation du flux de décision" });
  }
}

/**
 * Enregistre une décision et retourne le scénario suivant ou finalise le parcours
 */
export async function submitDecision(req: Request, res: Response) {
  try {
    const { userId, optionId } = req.body;
    
    if (!userId || !optionId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }
    
    // Vérifier si l'état de décision existe
    if (!decisionStates.has(userId)) {
      return res.status(404).json({ error: "Session de décision non trouvée" });
    }
    
    const state = decisionStates.get(userId)!;
    const currentScenario = state.scenarios[state.currentScenarioIndex];
    
    // Enregistrer la décision
    state.decisions.push({
      scenarioId: currentScenario.id,
      optionId
    });
    
    // Vérifier s'il reste des scénarios
    if (state.currentScenarioIndex < state.scenarios.length - 1) {
      // Passer au scénario suivant
      state.currentScenarioIndex++;
      state.remainingScenarios--;
      
      return res.status(200).json({
        success: true,
        scenario: state.scenarios[state.currentScenarioIndex],
        remainingScenarios: state.remainingScenarios,
        currentScenario: state.currentScenarioIndex + 1
      });
    } else {
      // Finaliser le parcours de décision
      const summary = await generateDecisionSummary(userId, state);
      
      // Réinitialiser le mode décision
      decisionStates.delete(userId);
      
      return res.status(200).json({
        success: true,
        isComplete: true,
        summary
      });
    }
  } catch (error) {
    console.error("Erreur lors de la soumission de la décision:", error);
    return res.status(500).json({ error: "Erreur lors de la soumission de la décision" });
  }
}

/**
 * Vérifie si l'utilisateur est en mode décision
 */
export async function checkDecisionStatus(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    
    const isInDecisionMode = decisionStates.has(userId);
    
    if (isInDecisionMode) {
      const state = decisionStates.get(userId)!;
      return res.status(200).json({
        isInDecisionMode: true,
        scenario: state.scenarios[state.currentScenarioIndex],
        remainingScenarios: state.remainingScenarios,
        currentScenario: state.currentScenarioIndex + 1
      });
    } else {
      return res.status(200).json({
        isInDecisionMode: false
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du statut de décision:", error);
    return res.status(500).json({ error: "Erreur lors de la vérification du statut de décision" });
  }
}

/**
 * Génère des scénarios de décision basés sur le sujet de la conversation
 */
async function generateDecisionScenarios(userId: string, topic: string): Promise<DecisionScenario[]> {
  try {
    // Récupérer la session expert
    const session = expertSessions.get(userId);
    if (!session) {
      throw new Error("Session expert non trouvée");
    }
    
    const prompt = `
      Sujet: "${topic || 'cybersécurité'}"
      
      Génère exactement 3 scénarios de décision en cybersécurité qui se déroulent après un mail de Thomas Mercier pour le lancement du projet. Ces scénarios doivent créer un maximum de conflits entre l'utilisateur et:
      1. La vision de l'entreprise (priorité au business vs sécurité)
      2. Son équipe (membres qui peuvent désobéir ou avoir des avis contraires)
      3. Son responsable (pressions hiérarchiques pour des compromis dangereux)

      Format attendu (JSON):
      [
        {
          "id": "scenario-1",
          "situation": "Titre court et percutant",
          "context": "Contexte détaillé incluant: (1) une interaction avec un PNJ spécifique, (2) une pression budgétaire et (3) un dilemme moral/éthique",
          "historicalFacts": "",
          "consequences": "",
          "urgencyLevel": "high", 
          "deadline": "Délai court et pressant",
          "options": [
            {
              "id": "option1",
              "text": "Option 1: Action qui plaît à la hiérarchie mais compromet la sécurité",
              "description": "Description détaillée montrant clairement que cette option est favorable au business mais néfaste pour la sécurité",
              "impacts": {
                "security": "negative",
                "business": "positive",
                "team": "negative",
                "legal": "negative",
                "career": "positive"
              }
            },
            {
              "id": "option2",
              "text": "Option 2: Action qui suit les bonnes pratiques de sécurité mais crée des tensions",
              "description": "Description détaillée montrant que cette option est techniquement la meilleure mais créera des conflits",
              "impacts": {
                "security": "positive",
                "business": "negative",
                "team": "neutral",
                "legal": "positive",
                "career": "negative"
              }
            },
            {
              "id": "option3",
              "text": "Option 3: Compromis créatif mais risqué",
              "description": "Description d'une solution innovante mais non conventionnelle avec ses propres risques",
              "impacts": {
                "security": "neutral",
                "business": "neutral",
                "team": "positive",
                "legal": "neutral",
                "career": "neutral"
              }
            }
          ]
        }
      ]
      
      Caractéristiques essentielles:
      - Chaque scénario doit mentionner un budget limité qui diminue au fil des décisions
      - Inclure un PNJ nommé par scénario (collègue, manager, client) avec une personnalité forte
      - Les options doivent créer un conflit évident entre sécurité et priorités business
      - Aucune solution parfaite - chaque choix doit avoir des compromis difficiles
      - Une option doit toujours défier l'autorité ou les pratiques de l'entreprise
      - Situations qui s'améliorent ou se dégradent en fonction des choix (conséquences visibles)
      - Chaque scénario doit mettre en évidence des tensions d'équipe ou hiérarchiques
      - Les options doivent créer une tension éthique ou professionnelle
    `;
    
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "Tu es un expert en cybersécurité qui crée des scénarios réalistes de prise de décision. Réponds uniquement au format JSON demandé." },
      { role: "user", content: prompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages, 0.7);
    
    // Extraire le JSON de la réponse
    const jsonStart = response.indexOf('[');
    const jsonEnd = response.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Format de réponse invalide");
    }
    
    const jsonString = response.substring(jsonStart, jsonEnd);
    const scenarios = JSON.parse(jsonString) as DecisionScenario[];
    
    // Vérifier si nous avons au moins un scénario
    if (!scenarios || scenarios.length === 0) {
      throw new Error("Aucun scénario généré");
    }
    
    return scenarios;
  } catch (error) {
    console.error("Erreur lors de la génération des scénarios:", error);
    
    // Retourner des scénarios de secours si la génération échoue
    return [
      {
        id: "fallback-scenario-1",
        situation: "Brèche de données potentielle",
        context: "Vous avez détecté une activité suspecte suggérant qu'un accès non autorisé a pu se produire, mais vous n'en êtes pas certain à 100%.",
        historicalFacts: "Votre entreprise a déjà subi une brèche qui a affecté sa réputation l'année dernière.",
        consequences: "Une notification trop hâtive pourrait causer une panique inutile, mais attendre pourrait aggraver les dommages.",
        urgencyLevel: "high",
        deadline: "24 heures",
        options: [
          {
            id: "option1",
            text: "Notifier immédiatement toutes les parties prenantes",
            description: "Lancer le protocole complet de réponse aux incidents sans attendre de confirmation.",
            impacts: {
              security: "positive",
              business: "negative",
              team: "neutral",
              legal: "positive",
              career: "negative"
            }
          },
          {
            id: "option2",
            text: "Investiguer davantage avant de notifier",
            description: "Prendre 12 heures pour confirmer la brèche avant de la signaler officiellement.",
            impacts: {
              security: "neutral",
              business: "positive",
              team: "positive",
              legal: "neutral",
              career: "neutral"
            }
          },
          {
            id: "option3",
            text: "Contenir silencieusement et minimiser l'incident",
            description: "Résoudre le problème en interne sans notification formelle à moins que des preuves concrètes n'émergent.",
            impacts: {
              security: "negative",
              business: "positive",
              team: "negative",
              legal: "negative",
              career: "positive"
            }
          }
        ]
      },
      {
        id: "fallback-scenario-2",
        situation: "Vulnérabilité critique dans un système de production",
        context: "Une vulnérabilité Zero-Day a été découverte dans un système critique utilisé par votre entreprise.",
        historicalFacts: "Le fournisseur a promis un correctif sous 48h, mais vous craignez qu'il soit déjà trop tard.",
        consequences: "Arrêter le système causerait d'importantes pertes financières, mais le laisser en ligne vous expose à des risques.",
        urgencyLevel: "critical",
        deadline: "Immédiat",
        options: [
          {
            id: "option1",
            text: "Mettre le système hors ligne immédiatement",
            description: "Arrêter le système jusqu'à ce que le correctif soit appliqué, malgré l'impact opérationnel.",
            impacts: {
              security: "positive",
              business: "negative",
              team: "negative",
              legal: "positive",
              career: "neutral"
            }
          },
          {
            id: "option2",
            text: "Appliquer des mesures d'atténuation temporaires",
            description: "Garder le système en ligne mais limiter son accès et renforcer la surveillance.",
            impacts: {
              security: "neutral",
              business: "neutral",
              team: "positive",
              legal: "neutral",
              career: "positive"
            }
          },
          {
            id: "option3",
            text: "Maintenir le système en l'état et accepter le risque",
            description: "Continuer les opérations normales en attendant le correctif officiel, en assumant le risque.",
            impacts: {
              security: "negative",
              business: "positive",
              team: "positive",
              legal: "negative",
              career: "negative"
            }
          }
        ]
      },
      {
        id: "fallback-scenario-3",
        situation: "Demande de contournement de sécurité par la direction",
        context: "Le PDG vous demande de contourner les contrôles de sécurité pour un projet prioritaire.",
        historicalFacts: "Ce projet pourrait sauver l'entreprise de difficultés financières importantes.",
        consequences: "Refuser pourrait mettre votre poste en danger, accepter pourrait compromettre la sécurité.",
        urgencyLevel: "medium",
        deadline: "48 heures",
        options: [
          {
            id: "option1",
            text: "Refuser catégoriquement",
            description: "Expliquer pourquoi ce n'est pas possible et proposer des alternatives sécurisées, même si cela retarde le projet.",
            impacts: {
              security: "positive",
              business: "negative",
              team: "negative",
              legal: "positive",
              career: "negative"
            }
          },
          {
            id: "option2",
            text: "Accepter avec des conditions",
            description: "Mettre en place une exception temporaire avec des contrôles compensatoires et une date d'expiration stricte.",
            impacts: {
              security: "neutral",
              business: "positive",
              team: "positive",
              legal: "neutral",
              career: "positive"
            }
          },
          {
            id: "option3",
            text: "Accepter la demande et documenter votre opposition",
            description: "Exécuter la demande mais documenter formellement que cela a été fait sous pression et contre votre recommandation.",
            impacts: {
              security: "negative",
              business: "positive",
              team: "neutral",
              legal: "negative",
              career: "neutral"
            }
          }
        ]
      }
    ];
  }
}

/**
 * Génère un résumé de toutes les décisions prises
 */
async function generateDecisionSummary(userId: string, state: ExpertDecisionState): Promise<string> {
  try {
    // Récupérer la session expert
    const session = expertSessions.get(userId);
    if (!session) {
      throw new Error("Session expert non trouvée");
    }
    
    // Créer un résumé des décisions prises
    const decisionsData = state.decisions.map(decision => {
      const scenario = state.scenarios.find(s => s.id === decision.scenarioId);
      const option = scenario?.options.find(o => o.id === decision.optionId);
      
      return {
        situation: scenario?.situation,
        choix: option?.text,
        impacts: option?.impacts
      };
    });
    
    const prompt = `
      Sujet: "${session.topic || 'cybersécurité'}"
      
      L'utilisateur a terminé une série de 3 scénarios de décision en cybersécurité et a fait les choix suivants:
      
      ${JSON.stringify(decisionsData, null, 2)}
      
      Génère un résumé personnalisé et analytique des décisions prises par l'utilisateur, en incluant:
      
      1. Un profil de prise de décision basé sur les choix (ex: conservateur, équilibré, preneur de risques)
      2. Une analyse des forces et faiblesses démontrées
      3. Des recommandations concrètes pour améliorer la prise de décision en cybersécurité
      4. Une invitation à poursuivre la conversation avec l'expert cyber
      
      Format: Texte conversationnel, structuré en paragraphes courts pour une meilleure lisibilité.
      Ton: Analytique mais encourageant, comme un mentor qui guide avec bienveillance.
    `;
    
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "Tu es un expert en cybersécurité qui analyse la prise de décision et fournit des conseils personnalisés." },
      { role: "user", content: prompt }
    ];
    
    return await openAIService.getChatCompletion(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération du résumé de décision:", error);
    return "Analyse de vos décisions: Vous avez fait face à des choix complexes qui reflètent les défis réels de la cybersécurité moderne. Vos décisions montrent une certaine approche de l'équilibre entre risques et bénéfices. Pour continuer votre développement, pensez à approfondir votre compréhension des impacts à long terme et à développer un cadre personnel de prise de décision. Souhaitez-vous continuer à explorer ce sujet avec notre expert?";
  }
}