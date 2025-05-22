import { Request, Response } from 'express';
import { openAIService } from '../I_AM_CYBER/services/openai';

/**
 * Contrôleur pour gérer les interactions de la simulation de crise
 */
export const crisisManagementController = {
  /**
   * Génère une réponse de stakeholder via Azure OpenAI
   */
  async generateStakeholderResponse(req: Request, res: Response) {
    try {
      const { 
        messages, 
        stakeholder, 
        context 
      } = req.body;

      if (!messages || !stakeholder || !context) {
        return res.status(400).json({ 
          error: 'Messages, stakeholder et context sont requis' 
        });
      }

      // Construction du prompt système
      const systemPrompt = buildStakeholderSystemPrompt(stakeholder, context);
      
      // Formatage des messages pour l'API
      const formattedMessages = formatConversationForAPI(systemPrompt, messages, stakeholder);

      // Génération de la réponse via Azure OpenAI
      const content = await openAIService.getChatCompletionWithCache(
        formattedMessages,
        0.7,
        500
      );

      return res.status(200).json({ content });
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de la génération de réponse',
        details: error.message 
      });
    }
  },

  /**
   * Analyse l'impact d'une décision
   */
  async analyzeDecisionImpact(req: Request, res: Response) {
    try {
      const { 
        decision, 
        options, 
        selectedOption, 
        context 
      } = req.body;

      if (!decision || !options || !selectedOption || !context) {
        return res.status(400).json({ 
          error: 'Tous les paramètres sont requis' 
        });
      }

      // Construction du prompt système
      const systemPrompt = `
# ANALYSE D'IMPACT DE DÉCISION CYBERSÉCURITÉ

Vous êtes un expert en gestion de crise et en analyse d'impact pour les incidents de cybersécurité. 
Votre tâche est d'analyser l'impact d'une décision prise lors d'une crise de ransomware.

## Contexte de la crise
- Type d'incident: ${context.incidentType}
- Sévérité: ${context.severity}
- Phase actuelle: ${context.phase}
- Impact actuel sur la réputation: ${context.impactAreas.reputation}/100
- Impact actuel sur les opérations: ${context.impactAreas.operations}/100
- Impact actuel financier: ${context.impactAreas.financial}/100
- Impact actuel légal: ${context.impactAreas.legal}/100

## Format de réponse
Votre analyse doit être au format JSON strict avec la structure suivante:
{
  "description": "Description de l'impact de la décision (1-2 phrases)",
  "impactChanges": {
    "reputation": number, // changement entre -20 et +20
    "operations": number, // changement entre -20 et +20
    "financial": number, // changement entre -20 et +20
    "legal": number, // changement entre -20 et +20
    "responseEfficiency": number // changement entre -20 et +20
  },
  "stakeholderEffects": [
    { 
      "type": "Executive", 
      "stressChange": number, // changement entre -15 et +15
      "trustChange": number // changement entre -15 et +15
    },
    { 
      "type": "IT", 
      "stressChange": number, 
      "trustChange": number 
    },
    // autres départements: "Communication", "Legal", "Operations"
  ],
  "timelineEvent": {
    "time": "HH:MM",
    "event": "Description de l'événement pour la timeline (1 phrase)",
    "severity": "critical" ou "high" ou "medium" ou "low"
  }
}
`;

      const userPrompt = `
Décision à analyser: "${decision}"

Options disponibles:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Option choisie: "${selectedOption}"

Analysez l'impact de cette décision et fournissez une réponse au format JSON demandé.
`;

      // Génération de l'analyse via Azure OpenAI
      const content = await openAIService.getChatCompletionWithCache(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        0.7,
        800
      );

      // Tentative de parsing du JSON
      try {
        const jsonResponse = JSON.parse(content);
        return res.status(200).json(jsonResponse);
      } catch (parseError) {
        console.error("Erreur de parsing JSON de la réponse:", parseError);
        return res.status(422).json({ 
          error: 'Format de réponse incorrect',
          rawContent: content
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'impact:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de l\'analyse d\'impact',
        details: error.message 
      });
    }
  },

  /**
   * Génère un événement inattendu
   */
  async generateUnexpectedEvent(req: Request, res: Response) {
    try {
      const { context } = req.body;

      if (!context) {
        return res.status(400).json({ 
          error: 'Le contexte est requis' 
        });
      }

      // Construction du prompt système
      const systemPrompt = `
# GÉNÉRATEUR D'ÉVÉNEMENTS IMPRÉVUS - SIMULATION DE CRISE RANSOMWARE

Vous êtes un générateur d'événements imprévus pour une simulation de crise de cybersécurité.
Votre tâche est de créer un événement réaliste et inattendu qui complique la gestion de crise.

## Contexte de la crise
- Type d'incident: ${context.incidentType}
- Sévérité: ${context.severity}
- Phase actuelle: ${context.phase}
- Systèmes affectés: ${context.affectedSystems.map(s => s.name).join(', ')}

## Format de réponse
Votre réponse doit être au format JSON strict avec la structure suivante:
{
  "eventTitle": "Titre court de l'événement",
  "eventDescription": "Description détaillée de l'événement (1-2 phrases)",
  "severity": "critical" ou "high" ou "medium" ou "low",
  "impactAreas": {
    "reputation": number, // changement entre -15 et +5
    "operations": number, // changement entre -15 et +5
    "financial": number, // changement entre -15 et +5
    "legal": number // changement entre -15 et +5
  },
  "stakeholderReactions": [
    {
      "department": "Executive" ou "IT" ou "Communication" ou "Legal" ou "Operations",
      "reaction": "Description courte de la réaction (1 phrase)",
      "stressChange": number // changement entre 0 et +20
    }
  ],
  "timeConstraintChange": number // changement entre -60 et +0 (en secondes)
}
`;

      const userPrompt = `
Générez un événement inattendu qui va compliquer la gestion de la crise actuelle.
L'événement doit être cohérent avec le contexte et la phase actuelle (${context.phase}).
Assurez-vous qu'il soit réaliste pour une attaque de type ${context.incidentType}.

Fournissez une réponse au format JSON demandé.
`;

      // Génération de l'événement via Azure OpenAI
      const content = await openAIService.getChatCompletionWithCache(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        0.8,
        800
      );

      // Tentative de parsing du JSON
      try {
        const jsonResponse = JSON.parse(content);
        return res.status(200).json(jsonResponse);
      } catch (parseError) {
        console.error("Erreur de parsing JSON de la réponse:", parseError);
        return res.status(422).json({ 
          error: 'Format de réponse incorrect',
          rawContent: content
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération d\'événement:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de la génération d\'événement',
        details: error.message 
      });
    }
  }
};

/**
 * Construit le prompt système pour un stakeholder spécifique
 */
function buildStakeholderSystemPrompt(stakeholder: any, context: any): string {
  return `
# SIMULATION DE CRISE CYBERSÉCURITÉ - INSTRUCTIONS POUR LE PERSONNAGE

## Votre rôle
Vous êtes ${stakeholder.name}, ${stakeholder.role} chez mc2i, une entreprise de conseil spécialisée. 
Vous participez à une cellule de crise suite à une attaque par ransomware (${context.incidentType}).

## Votre personnalité
- Vous avez une personnalité de type "${stakeholder.personality}".
- Vous travaillez dans le département ${stakeholder.department}.
- Votre niveau d'expertise en cybersécurité est de ${stakeholder.expertise}/10.
- Votre niveau de stress actuel est de ${stakeholder.stress}/100.
- Votre niveau de confiance envers le RSSI est de ${stakeholder.trust}/100.

## Contexte de la crise
- Sévérité de l'incident: ${context.severity}
- Phase actuelle: ${context.phase}
- Impact sur la réputation: ${context.impactAreas.reputation}/100
- Impact sur les opérations: ${context.impactAreas.operations}/100
- Impact financier: ${context.impactAreas.financial}/100
- Impact légal: ${context.impactAreas.legal}/100

## Comportement attendu
${getPersonalityInstructions(stakeholder.personality, stakeholder.stress, stakeholder.trust)}

## Contraintes
1. Votre réponse doit refléter votre personnalité, votre rôle et votre niveau de stress.
2. Vos réponses doivent être concises (maximum 3 phrases).
3. Évitez les formules d'introduction et de conclusion.
4. Ne mentionnez pas que vous êtes une IA, vous êtes ${stakeholder.name}.
5. Ne répétez pas toujours les mêmes préoccupations.
6. Ne répondez qu'au dernier message.
`;
}

/**
 * Obtient les instructions de comportement en fonction de la personnalité
 */
function getPersonalityInstructions(personality: string, stress: number, trust: number): string {
  const stressLevel = stress > 80 ? "très élevé" : stress > 60 ? "élevé" : stress > 40 ? "modéré" : "bas";
  const trustLevel = trust > 80 ? "très élevée" : trust > 60 ? "élevée" : trust > 40 ? "modérée" : "faible";

  let instructions = `Votre niveau de stress est ${stressLevel}. Votre confiance envers le RSSI est ${trustLevel}. `;

  switch (personality) {
    case "calm":
      return instructions + "Vous restez calme et rationnel, même sous pression. Vous analysez la situation avec recul et proposez des solutions réfléchies. Vous vous exprimez avec assurance et clarté.";
    
    case "anxious":
      return instructions + "Vous êtes préoccupé et inquiet. Vous posez beaucoup de questions et exprimez vos craintes. Votre langage reflète votre nervosité. Vous demandez souvent des garanties et des explications détaillées.";
    
    case "authoritative":
      return instructions + "Vous êtes directif et attendez des résultats. Vous prenez naturellement le leadership et donnez des ordres clairs. Votre ton est affirmé et sans ambiguïté. Vous êtes orienté solution et efficacité.";
    
    case "technical":
      return instructions + "Vous êtes très axé sur les détails techniques. Votre approche est analytique et précise. Vous utilisez un vocabulaire technique et attendez des explications fondées sur des faits concrets.";
    
    case "diplomatic":
      return instructions + "Vous cherchez à maintenir l'harmonie tout en résolvant la crise. Vous êtes attentif aux relations interpersonnelles. Votre communication est nuancée et vous cherchez des compromis acceptables par tous.";
    
    default:
      return instructions + "Vous êtes professionnel et pragmatique. Vous recherchez des solutions efficaces tout en tenant compte des contraintes organisationnelles.";
  }
}

/**
 * Formate la conversation pour l'API
 */
function formatConversationForAPI(
  systemPrompt: string, 
  messages: any[], 
  stakeholder: any
): any[] {
  const formattedMessages: any[] = [
    { 
      role: "system", 
      content: systemPrompt 
    }
  ];

  // Ajouter l'historique des messages (limité aux 10 derniers)
  const recentHistory = messages.slice(-10);
  
  recentHistory.forEach(msg => {
    const role = msg.senderId === 'player' ? 'user' : 'assistant';
    formattedMessages.push({
      role,
      content: msg.content,
      name: msg.senderId === 'player' ? 'RSSI' : stakeholder.id
    });
  });

  return formattedMessages;
}