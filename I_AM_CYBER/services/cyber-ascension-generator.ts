import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './openai';
import { 
  AscensionLevel, 
  LevelChallenge, 
  Material, 
  LevelContent,
  Resource
} from '../../client/src/types/cyber-ascension';
import { ChatCompletionRequestMessage } from '../../shared/schema';

export class CyberAscensionGenerator {
  private difficultyMap = {
    1: "Débutant",
    2: "Intermédiaire débutant",
    3: "Intermédiaire",
    4: "Intermédiaire avancé",
    5: "Expert"
  };

  constructor() {
    console.log("CyberAscensionGenerator initialized");
  }

  /**
   * Génère un niveau complet pour CYBER ASCENSION
   */
  async generateLevel(
    themeId: string,
    levelId: number,
    difficulty: number,
    userProfile: {
      strengths?: string[],
      weaknesses?: string[],
      completedLevels?: number,
      previousErrors?: string[]
    }
  ): Promise<LevelChallenge> {
    console.log(`Generating level ${levelId} for theme ${themeId} with difficulty ${difficulty}`);

    const systemPrompt = this.generateLevelSystemPrompt(themeId, levelId, difficulty, userProfile);
    const userPrompt = this.generateLevelUserPrompt(themeId, levelId, difficulty);

    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    try {
      const response = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        4000
      );

      const parsedLevel = this.parseLevelResponse(response, levelId, themeId);
      return parsedLevel;
    } catch (error) {
      console.error("Error generating level:", error);
      throw new Error("Failed to generate level content");
    }
  }

  /**
   * Génère un prompt système pour la génération de niveau
   */
  private generateLevelSystemPrompt(
    themeId: string,
    levelId: number,
    difficulty: number,
    userProfile: {
      strengths?: string[],
      weaknesses?: string[],
      completedLevels?: number,
      previousErrors?: string[]
    }
  ): string {
    const difficultyLabel = this.difficultyMap[difficulty as keyof typeof this.difficultyMap] || "Intermédiaire";
    
    let prompt = `# GÉNÉRATEUR DE NIVEAU POUR CYBER ASCENSION

Tu es un générateur de contenu éducatif pour CYBER ASCENSION, un module de formation en cybersécurité.
Tu dois générer un niveau complet de formation en suivant strictement la structure demandée.

## THÈME ET CONTEXTE
- Thème actuel: ${this.getThemeLabel(themeId)}
- Niveau demandé: ${levelId} sur 15
- Difficulté: ${difficultyLabel}

## PROFIL UTILISATEUR
${userProfile.strengths ? `- Points forts: ${userProfile.strengths.join(', ')}` : '- Points forts: Inconnus'}
${userProfile.weaknesses ? `- Points faibles: ${userProfile.weaknesses.join(', ')}` : '- Points faibles: Inconnus'}
- Niveaux complétés: ${userProfile.completedLevels || 0}
${userProfile.previousErrors && userProfile.previousErrors.length > 0 ? 
  `- Erreurs précédentes: ${userProfile.previousErrors.join(', ')}` : 
  '- Erreurs précédentes: Aucune'}

## RÈGLES IMPORTANTES
1. Le contenu doit être réaliste, professionnel et adapté au niveau de difficulté demandé
2. Ne JAMAIS réutiliser un scénario déjà utilisé auparavant
3. Inclure des personnages fictifs mais réalistes (collègues, managers, clients)
4. Le matériel fourni DOIT être crédible (logs, emails, captures d'écran fictives, etc.)
5. L'objectif doit être clair et précis
6. Inclure une contrainte qui ajoute de la pression (temporelle, ressources limitées, etc.)
7. La réponse minimale attendue de l'utilisateur doit être de 150 caractères
8. Le niveau doit correspondre au thème: ${this.getThemeLabel(themeId)}

## STRUCTURE DE SORTIE REQUISE
Ta réponse DOIT respecter strictement cette structure JSON:

\`\`\`json
{
  "id": "unique-id",
  "title": "Titre du niveau",
  "description": "Description courte du niveau",
  "type": "scenario",
  "content": {
    "introduction": "Introduction détaillée",
    "context": "Contexte de la situation",
    "materials": [
      {
        "type": "email|log|code|screenshot|document|conversation|message",
        "title": "Titre du matériel",
        "content": "Contenu du matériel",
        "metadata": {
          "from": "Expéditeur (si applicable)",
          "to": "Destinataire (si applicable)",
          "date": "Date (si applicable)",
          "source": "Source (si applicable)"
        }
      }
    ],
    "objective": "Objectif précis à accomplir",
    "constraint": "Contrainte ajoutant de la pression",
    "minResponseLength": 150,
    "resources": [
      {
        "title": "Titre de la ressource",
        "type": "article",
        "content": "Contenu de la ressource (conseils, méthodologie)"
      }
    ]
  }
}
\`\`\`

Assure-toi que la difficulté est adaptée au niveau ${levelId} sur 15 (progression naturelle).`;

    return prompt;
  }

  /**
   * Génère un prompt utilisateur pour la génération de niveau
   */
  private generateLevelUserPrompt(themeId: string, levelId: number, difficulty: number): string {
    return `Génère un niveau complet pour CYBER ASCENSION sur le thème "${this.getThemeLabel(themeId)}" de niveau ${levelId}/15 avec une difficulté de ${difficulty}/5.

Le contenu doit suivre la structure demandée et inclure:
- Un titre accrocheur
- Un contexte réaliste en entreprise
- Des matériaux fictifs mais crédibles (emails, logs, etc.)
- Un objectif clair
- Une contrainte temporelle ou de ressources
- Des ressources d'aide pertinentes

Respecte bien le format JSON demandé et assure-toi que le contenu est cohérent et réaliste.`;
  }

  /**
   * Analyse la réponse de l'IA pour extraire le niveau
   */
  private parseLevelResponse(response: string, levelId: number, themeId: string): LevelChallenge {
    try {
      // Extraire le JSON de la réponse (peut être entouré de texte)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/```\n([\s\S]*?)\n```/) ||
                        response.match(/{[\s\S]*}/);
      
      let jsonContent: string;
      
      if (jsonMatch) {
        jsonContent = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      } else {
        jsonContent = response;
      }
      
      // Tenter de parser le JSON
      const parsedContent = JSON.parse(jsonContent);
      
      // S'assurer que l'ID est unique
      if (!parsedContent.id) {
        parsedContent.id = uuidv4();
      }
      
      // Validation minimale
      if (!parsedContent.content) {
        throw new Error("La réponse ne contient pas de contenu valide");
      }
      
      // S'assurer que tous les champs requis sont présents
      if (!parsedContent.content.context) {
        parsedContent.content.context = "Contexte non spécifié";
      }
      
      if (!parsedContent.content.objective) {
        parsedContent.content.objective = "Objectif non spécifié";
      }
      
      if (!parsedContent.content.constraint) {
        parsedContent.content.constraint = "Aucune contrainte spécifiée";
      }
      
      if (!Array.isArray(parsedContent.content.materials) || parsedContent.content.materials.length === 0) {
        parsedContent.content.materials = [{
          type: "document",
          title: "Aucun matériel fourni",
          content: "Aucun matériel n'a été généré pour ce niveau"
        }];
      }
      
      // Définir la longueur minimale de réponse si non spécifiée
      if (!parsedContent.content.minResponseLength) {
        parsedContent.content.minResponseLength = 150;
      }
      
      return parsedContent as LevelChallenge;
    } catch (error) {
      console.error("Error parsing level response:", error);
      console.error("Raw response:", response);
      
      // Retourner un niveau par défaut en cas d'erreur
      return {
        id: uuidv4(),
        title: `Niveau ${levelId} sur le thème ${this.getThemeLabel(themeId)}`,
        description: "Contenu non disponible actuellement",
        type: "scenario",
        content: {
          introduction: "Une erreur s'est produite lors de la génération du contenu.",
          context: "Contexte indisponible",
          materials: [{
            type: "document",
            title: "Erreur de génération",
            content: "Le contenu n'a pas pu être généré correctement."
          }],
          objective: "Veuillez réessayer ultérieurement",
          constraint: "Aucune contrainte",
          minResponseLength: 150,
          resources: [{
            title: "Aide",
            type: "article",
            content: "Essayez de rafraîchir la page ou contactez le support."
          }]
        }
      };
    }
  }

  /**
   * Génère un feedback pour une réponse d'utilisateur
   */
  async generateFeedback(
    themeId: string,
    levelId: number,
    challenge: LevelChallenge,
    userResponse: string
  ): Promise<{
    feedback: string;
    strengths: string[];
    improvements: string[];
    score: number;
    progression: 'next' | 'retry' | 'previous';
  }> {
    if (!userResponse || userResponse.length < (challenge.content.minResponseLength || 150)) {
      return {
        feedback: "Votre réponse est trop courte. Veuillez fournir une réponse plus détaillée.",
        strengths: [],
        improvements: ["Fournir une réponse plus complète (minimum 150 caractères)"],
        score: 0,
        progression: 'retry'
      };
    }

    const systemPrompt = this.generateFeedbackSystemPrompt(challenge);
    const userPrompt = this.generateFeedbackUserPrompt(userResponse, challenge);

    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    try {
      const response = await openAIService.getChatCompletionWithCache(
        messages,
        0.3,
        2000
      );

      return this.parseFeedbackResponse(response);
    } catch (error) {
      console.error("Error generating feedback:", error);
      
      // Feedback par défaut en cas d'erreur
      return {
        feedback: "Une erreur s'est produite lors de l'analyse de votre réponse. Votre progression a néanmoins été enregistrée.",
        strengths: ["Réponse fournie"],
        improvements: ["Impossible d'analyser complètement votre réponse"],
        score: 70,
        progression: 'next'
      };
    }
  }

  /**
   * Génère un prompt système pour l'évaluation de la réponse
   */
  private generateFeedbackSystemPrompt(challenge: LevelChallenge): string {
    return `# ÉVALUATEUR DE RÉPONSE POUR CYBER ASCENSION

Tu es un évaluateur de réponse pour CYBER ASCENSION, un module de formation en cybersécurité.
Tu dois analyser la réponse de l'utilisateur et fournir un feedback constructif.

## CONTEXTE DU NIVEAU
- Titre: ${challenge.title}
- Description: ${challenge.description}
- Objectif: ${challenge.content.objective}

## RÈGLES D'ÉVALUATION
1. Évalue la pertinence de la réponse par rapport à l'objectif
2. Identifie les points forts (au moins 2-3)
3. Identifie les points à améliorer (au moins 1-2)
4. Attribue un score de 0 à 100
5. Détermine la progression: 'next' (niveau suivant), 'retry' (réessayer ce niveau) ou 'previous' (niveau précédent)
6. Sois constructif et pédagogique dans ton feedback

## STRUCTURE DE SORTIE REQUISE
Ta réponse doit IMPÉRATIVEMENT suivre cette structure JSON:

\`\`\`json
{
  "feedback": "Feedback détaillé et constructif sur la réponse",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "improvements": ["Point à améliorer 1", "Point à améliorer 2"],
  "score": 75,
  "progression": "next"
}
\`\`\`

- Le score doit être entre 0 et 100
- La progression doit être 'next', 'retry' ou 'previous'
- 'next' si score >= 70
- 'retry' si 40 <= score < 70
- 'previous' si score < 40`;
  }

  /**
   * Génère un prompt utilisateur pour l'évaluation de la réponse
   */
  private generateFeedbackUserPrompt(userResponse: string, challenge: LevelChallenge): string {
    return `Évalue la réponse suivante de l'utilisateur pour le niveau "${challenge.title}" dont l'objectif était: "${challenge.content.objective}"

RÉPONSE DE L'UTILISATEUR:
"""
${userResponse}
"""

Analyse cette réponse, identifie les points forts et les points à améliorer, puis attribue un score et détermine la progression.
Assure-toi de suivre strictement le format JSON demandé.`;
  }

  /**
   * Parse la réponse de feedback de l'IA
   */
  private parseFeedbackResponse(response: string): {
    feedback: string;
    strengths: string[];
    improvements: string[];
    score: number;
    progression: 'next' | 'retry' | 'previous';
  } {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/```\n([\s\S]*?)\n```/) ||
                        response.match(/{[\s\S]*}/);
      
      let jsonContent: string;
      
      if (jsonMatch) {
        jsonContent = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      } else {
        jsonContent = response;
      }
      
      // Parser le JSON
      const parsedContent = JSON.parse(jsonContent);
      
      // Validation et valeurs par défaut
      if (!parsedContent.feedback) {
        parsedContent.feedback = "Aucun feedback fourni";
      }
      
      if (!Array.isArray(parsedContent.strengths) || parsedContent.strengths.length === 0) {
        parsedContent.strengths = ["Réponse fournie"];
      }
      
      if (!Array.isArray(parsedContent.improvements) || parsedContent.improvements.length === 0) {
        parsedContent.improvements = ["Continuer à pratiquer"];
      }
      
      if (typeof parsedContent.score !== 'number' || parsedContent.score < 0 || parsedContent.score > 100) {
        parsedContent.score = 70;
      }
      
      if (!['next', 'retry', 'previous'].includes(parsedContent.progression)) {
        // Déterminer la progression en fonction du score
        if (parsedContent.score >= 70) {
          parsedContent.progression = 'next';
        } else if (parsedContent.score >= 40) {
          parsedContent.progression = 'retry';
        } else {
          parsedContent.progression = 'previous';
        }
      }
      
      return {
        feedback: parsedContent.feedback,
        strengths: parsedContent.strengths,
        improvements: parsedContent.improvements,
        score: parsedContent.score,
        progression: parsedContent.progression as 'next' | 'retry' | 'previous'
      };
      
    } catch (error) {
      console.error("Error parsing feedback response:", error);
      
      // Valeurs par défaut en cas d'erreur
      return {
        feedback: "Une erreur s'est produite lors de l'analyse de votre réponse. Votre progrès a néanmoins été enregistré.",
        strengths: ["Réponse fournie"],
        improvements: ["Impossible d'analyser complètement votre réponse"],
        score: 70,
        progression: 'next'
      };
    }
  }

  /**
   * Retourne le libellé d'un thème à partir de son ID
   */
  private getThemeLabel(themeId: string): string {
    const themes: {[key: string]: string} = {
      'SecuriteReseau': 'Sécurité Réseau',
      'CyberDefense': 'Cyber Défense',
      'SecuriteCloud': 'Sécurité Cloud',
      'OSINT': 'Open Source Intelligence (OSINT)',
      'GouvernanceCyber': 'Gouvernance Cyber',
      'SecuriteApplicative': 'Sécurité Applicative',
      'GestionDesIdentites': 'Gestion des Identités et des Accès',
      'ReponsesAuxIncidents': 'Réponses aux Incidents',
      'ForensicCyber': 'Forensic Cyber',
      'SecuriteIoT': 'Sécurité IoT',
      'ArchitectureSecurisee': 'Architecture Sécurisée',
      'CryptographieAppliquee': 'Cryptographie Appliquée',
      'AuditSecurite': 'Audit de Sécurité',
      'ZeroTrust': 'Zéro Trust',
      'SecDevOps': 'SecDevOps'
    };
    
    return themes[themeId] || themeId;
  }
}

export const cyberAscensionGenerator = new CyberAscensionGenerator();