/**
 * Service pour générer les réponses des personnages dans le module de gestion de crise
 * Utilise l'API Azure OpenAI pour simuler les réponses des dirigeants
 */

import axios from 'axios';

interface StakeholderPrompt {
  id: string;
  name: string;
  role: string;
  personality: string;
  department: string;
  expertise: number;
  stress: number;
  trust: number;
}

interface CrisisContext {
  incidentType: string;
  severity: string;
  phase: string;
  affectedSystems: {
    name: string;
    status: string;
    criticalityLevel: number;
  }[];
  impactAreas: {
    reputation: number;
    operations: number;
    financial: number;
    legal: number;
  };
}

export interface CrisisMessage {
  senderId: string;
  content: string;
  timestamp: Date;
}

export class CrisisAIService {
  private apiStatus: string = 'disconnected';
  private currentModel: string = '';
  private isLoading: boolean = false;

  constructor() {
    this.checkConnection();
  }

  /**
   * Vérifie la connexion à l'API Azure OpenAI
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get('/api/openai/status');
      
      if (response.data && response.data.connectionStatus === 'connected') {
        this.apiStatus = 'connected';
        this.currentModel = response.data.currentModel || 'gpt-4o-mini';
        return true;
      } else {
        this.apiStatus = 'disconnected';
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion à Azure OpenAI:', error);
      this.apiStatus = 'disconnected';
      return false;
    }
  }

  /**
   * Génère une réponse de l'IA en fonction du stakeholder, du contexte et de l'historique
   */
  async generateStakeholderResponse(
    stakeholder: StakeholderPrompt,
    context: CrisisContext,
    conversationHistory: CrisisMessage[],
    userMessage: string
  ): Promise<string> {
    if (this.apiStatus === 'disconnected') {
      await this.checkConnection();
      if (this.apiStatus === 'disconnected') {
        return "Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez vérifier la connexion à l'API Azure OpenAI.";
      }
    }

    if (this.isLoading) {
      return "En attente de la réponse précédente...";
    }

    try {
      this.isLoading = true;

      // Construction du prompt système
      const systemPrompt = this.buildStakeholderSystemPrompt(stakeholder, context);
      
      // Construction de l'historique des messages
      const messages = this.formatConversationForAPI(systemPrompt, conversationHistory, userMessage, stakeholder);

      // Appel à l'API
      const response = await axios.post('/api/openai/chat', {
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      if (response.data && response.data.content) {
        return response.data.content;
      } else {
        throw new Error("Format de réponse incorrect de l'API");
      }
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return "Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer.";
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Construit le prompt système pour un stakeholder spécifique
   */
  private buildStakeholderSystemPrompt(stakeholder: StakeholderPrompt, context: CrisisContext): string {
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
${this.getPersonalityInstructions(stakeholder.personality, stakeholder.stress, stakeholder.trust)}

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
  private getPersonalityInstructions(personality: string, stress: number, trust: number): string {
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
  private formatConversationForAPI(
    systemPrompt: string, 
    history: CrisisMessage[], 
    userMessage: string,
    stakeholder: StakeholderPrompt
  ): any[] {
    const messages: any[] = [
      { 
        role: "system", 
        content: systemPrompt 
      }
    ];

    // Ajouter l'historique des messages (limité aux 10 derniers)
    const recentHistory = history.slice(-10);
    
    recentHistory.forEach(msg => {
      const role = msg.senderId === 'player' ? 'user' : 'assistant';
      messages.push({
        role,
        content: msg.content,
        name: msg.senderId === 'player' ? 'RSSI' : stakeholder.id
      });
    });

    // Ajouter le message utilisateur actuel
    messages.push({
      role: 'user',
      content: userMessage,
      name: 'RSSI'
    });

    return messages;
  }

  /**
   * Génère une analyse de l'impact d'une décision
   */
  async analyzeDecisionImpact(
    decision: string,
    options: string[],
    selectedOption: string,
    context: CrisisContext
  ): Promise<any> {
    if (this.apiStatus !== 'connected') {
      await this.checkConnection();
      if (this.apiStatus !== 'connected') {
        throw new Error("Impossible de se connecter à l'API Azure OpenAI");
      }
    }

    try {
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

      const response = await axios.post('/api/openai/chat', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      if (response.data && response.data.content) {
        try {
          return JSON.parse(response.data.content);
        } catch (parseError) {
          console.error("Erreur de parsing JSON de la réponse:", parseError);
          throw new Error("Format de réponse incorrect");
        }
      } else {
        throw new Error("Format de réponse incorrect de l'API");
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'impact:', error);
      throw error;
    }
  }

  /**
   * Génère un événement inattendu basé sur le contexte actuel
   */
  async generateUnexpectedEvent(context: CrisisContext): Promise<any> {
    if (this.apiStatus !== 'connected') {
      await this.checkConnection();
      if (this.apiStatus !== 'connected') {
        throw new Error("Impossible de se connecter à l'API Azure OpenAI");
      }
    }

    try {
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

      const response = await axios.post('/api/openai/chat', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      if (response.data && response.data.content) {
        try {
          return JSON.parse(response.data.content);
        } catch (parseError) {
          console.error("Erreur de parsing JSON de la réponse:", parseError);
          throw new Error("Format de réponse incorrect");
        }
      } else {
        throw new Error("Format de réponse incorrect de l'API");
      }
    } catch (error) {
      console.error('Erreur lors de la génération d\'événement:', error);
      throw error;
    }
  }
}

// Instance singleton du service
export const crisisAIService = new CrisisAIService();