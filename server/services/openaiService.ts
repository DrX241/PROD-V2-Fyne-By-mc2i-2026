import OpenAI from "openai";

// Initialiser l'API OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type pour les requêtes de génération de scénarios
export interface ScenarioGenerationRequest {
  skillLevel: 'débutant' | 'intermédiaire' | 'avancé';
  category: 'XSS' | 'SQL' | 'CSRF' | 'RCE' | 'API' | 'JWT';
  context?: string;
}

// Type pour les requêtes d'analyse de code
export interface CodeAnalysisRequest {
  code: string;
  expectedSolution: string;
  vulnerabilityType: string;
  skillLevel: string;
}

/**
 * Génère un nouveau scénario de pentesting basé sur les paramètres fournis
 */
export const generatePentestScenario = async (request: ScenarioGenerationRequest) => {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes un expert en cybersécurité spécialisé dans les tests d'intrusion web. 
          Générez un scénario de challenge de pentest réaliste pour un niveau ${request.skillLevel} 
          axé sur les vulnérabilités de type ${request.category}.
          
          Votre réponse doit être au format JSON avec les champs suivants:
          - title: Titre court et accrocheur du challenge
          - description: Description détaillée du contexte (une application web vulnérable fictive)
          - vulnerability: Description technique de la vulnérabilité à exploiter
          - code: Un exemple de code vulnérable (HTML/JS/PHP selon le contexte)
          - instructions: Instructions précises pour l'apprenant
          - hint: Un indice subtil pour guider sans donner la solution
          - expectedSolution: Un exemple de code qui exploiterait cette vulnérabilité
          - difficulty: "${request.skillLevel}"
          - category: "${request.category}"
          - points: Un nombre entre 10-100 selon la difficulté
          - learningObjectives: Tableau de 2-3 compétences que ce challenge permet de développer
          `
        },
        {
          role: "user",
          content: `Générez un scénario de challenge de pentest de niveau ${request.skillLevel} 
          pour la vulnérabilité ${request.category}. ${request.context || ''}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    console.error("Erreur lors de la génération du scénario:", error);
    throw new Error("Impossible de générer un scénario de pentest: " + (error.message || "Erreur inconnue"));
  }
};

/**
 * Analyse la solution proposée par l'utilisateur et fournit un feedback
 */
export const analyzeUserSolution = async (request: CodeAnalysisRequest) => {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes un mentor expert en cybersécurité qui évalue les solutions de pentesting des étudiants.
          Analysez la solution proposée par l'étudiant pour une vulnérabilité de type ${request.vulnerabilityType}.
          
          Comparez la solution de l'étudiant avec la solution attendue, mais soyez flexible: 
          il peut y avoir plusieurs façons correctes d'exploiter une vulnérabilité.
          
          Votre réponse doit être au format JSON avec les champs suivants:
          - success: boolean (true si la solution est correcte ou proche de l'être)
          - score: nombre entre 0 et 100
          - feedback: analyse détaillée mais concise de la solution
          - improvements: suggestions d'amélioration si nécessaire
          - securityConcepts: concepts de sécurité démontrés ou manqués
          - nextSteps: recommandation pour progresser
          `
        },
        {
          role: "user",
          content: `Voici la solution proposée par l'étudiant pour une vulnérabilité ${request.vulnerabilityType} de niveau ${request.skillLevel}:
          
          \`\`\`
          ${request.code}
          \`\`\`
          
          Et voici un exemple de solution attendue:
          
          \`\`\`
          ${request.expectedSolution}
          \`\`\`
          
          Analysez cette solution et fournissez un feedback constructif.`
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Erreur lors de l'analyse de la solution:", error);
    throw new Error("Impossible d'analyser la solution: " + error.message);
  }
};

/**
 * Génère un indice personnalisé basé sur la progression de l'utilisateur
 */
export const generateCustomHint = async (
  vulnerabilityType: string, 
  currentCode: string, 
  difficultyLevel: string
) => {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes un mentor expert en cybersécurité qui fournit des indices subtils pour aider
          les étudiants à résoudre des défis de pentest. Pour une vulnérabilité de type ${vulnerabilityType}
          de niveau ${difficultyLevel}, examinez le code actuel de l'étudiant et fournissez un indice
          qui l'oriente dans la bonne direction sans donner la solution complète.
          
          L'indice doit être subtil pour les niveaux avancés, plus direct pour les niveaux intermédiaires
          et très guidé pour les débutants.`
        },
        {
          role: "user",
          content: `Voici mon code actuel pour exploiter une vulnérabilité ${vulnerabilityType}:
          
          \`\`\`
          ${currentCode || "// Aucun code saisi pour l'instant"}
          \`\`\`
          
          Pouvez-vous me donner un indice pour progresser?`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erreur lors de la génération d'indice:", error);
    return "Je ne peux pas générer d'indice pour le moment. Essayez de réfléchir aux vecteurs d'attaque communs pour ce type de vulnérabilité.";
  }
};

export default {
  generatePentestScenario,
  analyzeUserSolution,
  generateCustomHint
};