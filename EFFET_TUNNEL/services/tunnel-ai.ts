import { openAIService } from '../../I_AM_CYBER/services/openai';
import { 
  TunnelScenario, 
  TunnelSituation, 
  ExpertiseLevel, 
  ProfessionalRole, 
  BusinessSector, 
  DecisionOption, 
  TunnelSessionState,
  TunnelExpert
} from '../types';
import { ChatCompletionRequestMessage } from '../../shared/schema';
import fs from 'fs';
import path from 'path';

// Classe pour gérer les interactions AI pour le module Effet Tunnel
export class TunnelAIService {
  private promptCache: string | null = null;

  constructor() {
    console.log('TunnelAIService initialized');
  }

  // Récupère le prompt maître pour le module Effet Tunnel
  private async getMasterPrompt(): Promise<string> {
    if (this.promptCache) {
      return this.promptCache;
    }

    try {
      const promptPath = path.join(process.cwd(), 'EFFET_TUNNEL', 'prompts', 'master_prompt.txt');
      const prompt = fs.readFileSync(promptPath, 'utf8');
      this.promptCache = prompt;
      return prompt;
    } catch (error) {
      console.error('Error reading master prompt:', error);
      throw new Error('Failed to read master prompt');
    }
  }

  // Génère une nouvelle situation basée sur le choix utilisateur et son parcours
  async generateNextSituation(
    session: TunnelSessionState,
    currentSituation: TunnelSituation,
    chosenOptionId: string
  ): Promise<TunnelSituation> {
    try {
      const masterPrompt = await this.getMasterPrompt();
      
      // Trouver l'option choisie
      const chosenOption = currentSituation.options.find(opt => opt.id === chosenOptionId);
      if (!chosenOption) {
        throw new Error(`Option with ID ${chosenOptionId} not found in current situation`);
      }

      // Construire le contexte pour l'IA
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `${masterPrompt}

CONTEXTE ACTUEL:
- Role de l'utilisateur: ${session.selectedRole}
- Niveau d'expertise: ${session.selectedLevel}
- Secteur d'activité: ${session.selectedSector}
- Scénario: ${session.currentScenario?.title}
- Parcours jusqu'ici: ${session.decisionPath.join(' → ')}
`
        },
        {
          role: "user",
          content: `Génère la prochaine situation du scénario basée sur les informations suivantes:

SITUATION ACTUELLE:
${currentSituation.title}
${currentSituation.description}

CHOIX DE L'UTILISATEUR:
L'utilisateur (${session.selectedRole}) a choisi l'option: "${chosenOption.text}: ${chosenOption.description}"

INSTRUCTIONS:
1. Crée une nouvelle situation qui découle logiquement de ce choix
2. Inclus un titre concis
3. Rédige une description détaillée (200-300 mots) expliquant comment la situation a évolué
4. Propose 2-4 nouvelles options de décision adaptées au niveau ${session.selectedLevel} et au rôle ${session.selectedRole}
5. Pour chaque option, fournis un titre court et une description explicative
6. Indique si cette situation est une conclusion (finale) ou si elle continue le scénario
7. Pour le contenu pédagogique (tutorialContent), explique les concepts de cybersécurité pertinents liés à cette situation en max 150 mots.

FORMAT DE RÉPONSE:
Retourne uniquement un objet JSON structuré comme suit, sans texte supplémentaire:
{
  "id": "[id unique généré]",
  "title": "[titre court de la situation]",
  "description": "[description détaillée]",
  "expertName": "[prénom et nom de l'expert]",
  "expertRole": "[rôle de l'expert]",
  "options": [
    {
      "id": "[id unique]",
      "text": "[titre court de l'option]",
      "description": "[description détaillée]",
      "complexity": [niveau de complexité 1-3]
    },
    // autres options...
  ],
  "tutorialContent": "[contenu éducatif expliquant les concepts]",
  "isFinal": [true/false selon si c'est une situation finale]
}`
        }
      ];

      // Obtenir la réponse de l'IA
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        2000
      );

      // Extraire et parser l'objet JSON de la réponse
      try {
        // Trouve le début et la fin du JSON dans la réponse
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const jsonStr = jsonMatch[0];
        const situationData = JSON.parse(jsonStr) as TunnelSituation;
        
        return situationData;
      } catch (error) {
        console.error('Error parsing situation JSON:', error, responseContent);
        throw new Error('Failed to parse situation data from AI response');
      }
    } catch (error) {
      console.error('Error generating next situation:', error);
      throw error;
    }
  }

  // Génère un contenu pédagogique (intervention du tuteur)
  async generateTutorialContent(
    situation: TunnelSituation,
    session: TunnelSessionState
  ): Promise<string> {
    try {
      const masterPrompt = await this.getMasterPrompt();
      
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `${masterPrompt}

Tu es Alex, le tuteur pédagogique du module EFFET TUNNEL. Ton rôle est d'expliquer les concepts de cybersécurité, de contextualiser les décisions, et de fournir des informations éducatives entre les situations.`
        },
        {
          role: "user",
          content: `Génère un contenu pédagogique pour la situation suivante:

SITUATION:
${situation.title}
${situation.description}

CONTEXTE:
- Role de l'utilisateur: ${session.selectedRole}
- Niveau d'expertise: ${session.selectedLevel}
- Secteur d'activité: ${session.selectedSector}

INSTRUCTIONS:
1. Explique les concepts de cybersécurité impliqués dans cette situation
2. Fournis des définitions clés et des bonnes pratiques pertinentes
3. Adapte ton explication au niveau d'expertise de l'utilisateur
4. Sois concis mais informatif (150 mots maximum)
5. Utilise un ton bienveillant et engageant

Réponds uniquement avec le contenu pédagogique, sans introduction ni conclusion supplémentaire.`
        }
      ];

      // Obtenir la réponse de l'IA
      const tutorialContent = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        800
      );
      
      return tutorialContent;
    } catch (error) {
      console.error('Error generating tutorial content:', error);
      throw error;
    }
  }

  // Génère un scénario initial basé sur les préférences de l'utilisateur
  async generateInitialScenario(
    role: ProfessionalRole,
    level: ExpertiseLevel,
    sector: BusinessSector,
    scenarioType: string
  ): Promise<TunnelScenario> {
    try {
      const masterPrompt = await this.getMasterPrompt();
      
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `${masterPrompt}

Tu es chargé de créer un scénario initial pour le module EFFET TUNNEL.`
        },
        {
          role: "user",
          content: `Génère un scénario initial pour le module EFFET TUNNEL avec les paramètres suivants:

PARAMÈTRES:
- Rôle de l'utilisateur: ${role}
- Niveau d'expertise: ${level}
- Secteur d'activité: ${sector}
- Type de scénario: ${scenarioType}

INSTRUCTIONS:
1. Crée un scénario réaliste et engageant qui correspond au secteur spécifié
2. Adapte la complexité au niveau d'expertise indiqué
3. Propose une situation initiale qui met l'utilisateur dans son rôle professionnel
4. Inclus 3-4 options de décision initiales adaptées

FORMAT DE RÉPONSE:
Retourne uniquement un objet JSON structuré comme suit, sans texte supplémentaire:
{
  "id": "[id unique généré]",
  "title": "[titre du scénario]",
  "description": "[description générale du scénario]",
  "difficulty": "${level}",
  "relevantSectors": ["${sector}"],
  "initialSituationId": "situation-1",
  "situations": [
    {
      "id": "situation-1",
      "title": "[titre court de la situation initiale]",
      "description": "[description détaillée]",
      "expertName": "[prénom et nom de l'expert]",
      "expertRole": "[rôle de l'expert]",
      "options": [
        {
          "id": "option-1",
          "text": "[titre court de l'option]",
          "description": "[description détaillée]",
          "complexity": [niveau de complexité 1-3]
        },
        // autres options...
      ],
      "tutorialContent": "[contenu éducatif expliquant les concepts]",
      "isFinal": false
    }
  ]
}`
        }
      ];

      // Obtenir la réponse de l'IA
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        3000
      );

      // Extraire et parser l'objet JSON de la réponse
      try {
        // Trouve le début et la fin du JSON dans la réponse
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const jsonStr = jsonMatch[0];
        const scenarioData = JSON.parse(jsonStr) as TunnelScenario;
        
        return scenarioData;
      } catch (error) {
        console.error('Error parsing scenario JSON:', error, responseContent);
        throw new Error('Failed to parse scenario data from AI response');
      }
    } catch (error) {
      console.error('Error generating initial scenario:', error);
      throw error;
    }
  }

  // Génère un debriefing complet à la fin d'un scénario
  async generateDebriefing(session: TunnelSessionState): Promise<string> {
    try {
      const masterPrompt = await this.getMasterPrompt();
      
      // Créer un résumé du parcours de décision
      const decisionSummary = session.decisionPath.map(situationId => {
        const optionId = session.decisionsMade[situationId];
        return `Situation: ${situationId} → Choix: ${optionId}`;
      }).join('\n');
      
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `${masterPrompt}

Tu es chargé de produire un debriefing complet à la fin d'un scénario du module EFFET TUNNEL.`
        },
        {
          role: "user",
          content: `Génère un debriefing complet pour le parcours suivant:

CONTEXTE:
- Scénario: ${session.currentScenario?.title}
- Role de l'utilisateur: ${session.selectedRole}
- Niveau d'expertise: ${session.selectedLevel}
- Secteur d'activité: ${session.selectedSector}

PARCOURS DE DÉCISION:
${decisionSummary}

INSTRUCTIONS:
1. Produis un debriefing structuré qui analyse le parcours de l'utilisateur
2. Évalue les forces et faiblesses des décisions prises
3. Explique les concepts de cybersécurité importants liés à ce scénario
4. Fournis des recommandations d'amélioration personnalisées
5. Suggère des ressources pour approfondir

FORMAT DU DEBRIEFING:
1. Résumé du parcours (bref rappel des principales étapes)
2. Analyse des décisions clés (forces et faiblesses)
3. Évaluation globale (note qualitative)
4. Concepts maîtrisés et à améliorer
5. Bonnes pratiques à retenir
6. Ressources recommandées`
        }
      ];

      // Obtenir la réponse de l'IA
      const debriefingContent = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        2500
      );
      
      return debriefingContent;
    } catch (error) {
      console.error('Error generating debriefing:', error);
      throw error;
    }
  }

  // Génère une réponse d'un expert à un message de l'utilisateur
  async generateExpertResponse(
    message: string,
    expert: TunnelExpert,
    session: TunnelSessionState
  ): Promise<string> {
    try {
      const masterPrompt = await this.getMasterPrompt();
      
      const situationDescription = session.currentSituation 
        ? `${session.currentSituation.title}\n${session.currentSituation.description}`
        : "Situation en cours non disponible";
      
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `${masterPrompt}

Tu incarnes ${expert.name}, ${expert.role}, un expert en ${expert.expertise}. 
Tu interagis avec un utilisateur qui joue le rôle de ${session.selectedRole} dans le secteur ${session.selectedSector}, avec un niveau d'expertise ${session.selectedLevel}.

CONTEXTE ACTUEL:
- Scénario: ${session.currentScenario?.title || "Non spécifié"}
- Situation actuelle: ${situationDescription}
- Parcours: L'utilisateur a traversé ${session.decisionPath.length} situations

CONSIGNES:
1. Réponds de manière concise et claire
2. Adapte ton niveau de détail technique à l'expertise de l'utilisateur
3. Fournis des explications précises et factuelles
4. Reste dans ton rôle d'expert avec ton domaine de spécialité
5. Évite de faire des choix à la place de l'utilisateur
6. Ne mentionne pas que tu es une IA ou un assistant virtuel
7. Utilise un français formel et professionnel
8. N'utilise pas de formules de salutation ou de conclusion excessives`
        },
        {
          role: "user",
          content: message
        }
      ];

      // Obtenir la réponse de l'IA
      const expertResponse = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        1500
      );
      
      return expertResponse;
    } catch (error) {
      console.error('Error generating expert response:', error);
      throw error;
    }
  }
}

// Instance unique du service
export const tunnelAIService = new TunnelAIService();