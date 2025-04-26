import { ChatCompletionRequestMessage } from "openai";

/**
 * Service OpenAI pour générer des prompts et des réponses
 */
export const openAIService = {
  /**
   * Génère un prompt système adapté au contexte
   * @param options Options de configuration du prompt (difficulté, style)
   * @returns Prompt système configuré
   */
  async generateSystemPrompt(options: { difficultyLevel?: string, responseStyle?: string }): Promise<string> {
    const { difficultyLevel = "Intermédiaire", responseStyle = "Professionnel" } = options;

    let difficultyGuidance = "";
    if (difficultyLevel === "Débutant") {
      difficultyGuidance = "Utilisez un langage simple et expliquez les concepts de base. Évitez le jargon technique inutile.";
    } else if (difficultyLevel === "Intermédiaire") {
      difficultyGuidance = "Utilisez un vocabulaire technique approprié, avec des explications contextuelles au besoin.";
    } else if (difficultyLevel === "Expert") {
      difficultyGuidance = "N'hésitez pas à utiliser un vocabulaire technique avancé et à aborder des problématiques complexes.";
    }

    let styleGuidance = "";
    if (responseStyle === "Professionnel") {
      styleGuidance = "Adoptez un ton formel mais accessible, adapté au contexte d'entreprise.";
    } else if (responseStyle === "Pédagogique") {
      styleGuidance = "Adoptez un ton explicatif et éducatif, en mettant l'accent sur la compréhension des concepts.";
    } else if (responseStyle === "Technique") {
      styleGuidance = "Adoptez un ton précis et factuel, axé sur les aspects techniques et pratiques.";
    }

    return `Vous êtes I AM CYBER, un assistant IA spécialisé en cybersécurité.
    
    ${difficultyGuidance}
    ${styleGuidance}
    
    Votre mission est de fournir des informations précises et pertinentes dans le domaine de la cybersécurité.`;
  },

  /**
   * Génère une complétion de chat via Azure OpenAI avec cache
   * Remarque: Cette fonction assume que le service Azure OpenAI est déjà configuré
   * Dans l'implémentation réelle, vous connecteriez ceci au vrai service Azure OpenAI
   * 
   * @param messages Messages pour la complétion
   * @param temperature Température pour la génération
   * @param maxTokens Nombre maximum de tokens
   * @returns Contenu de la complétion
   */
  async getChatCompletionWithCache(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    // En temps normal, nous enverrions ceci à Azure OpenAI
    // Mais pour les besoins de cette démo, nous générons un exemple de réponse
    // Cette fonction est un placeholder - dans l'application réelle, elle enverrait la requête au service OpenAI
    
    // Structure de base d'un message
    const exampleResponse = `Objet: Bienvenue chez ELITE RETAIL SECURITY - Mission de sensibilisation aux attaques de phishing

Bonjour ${messages[1].content.includes('userName') ? 'Utilisateur' : 'Utilisateur'},

Je suis Marion Lopez, Senior Partner et Directrice Marketing, Communication et RSE chez ELITE RETAIL SECURITY, une entreprise spécialisée dans la protection des actifs numériques dans le secteur du RETAIL & LUXE.

Notre entreprise accompagne depuis plus de 10 ans les grandes marques et enseignes de distribution dans la sécurisation de leurs environnements digitaux, de leurs données clients sensibles et de leur image de marque en ligne.

Une étude récente a montré que 32% des violations de données commencent par une attaque de phishing réussie. C'est pourquoi nous avons décidé de lancer une initiative de sensibilisation aux techniques de phishing auprès de tous nos partenaires.

Nous sommes confrontés à un défi croissant : malgré les formations traditionnelles, nos clients continuent de subir des attaques de phishing de plus en plus sophistiquées. J'aimerais faire appel à ton expertise pour nous aider à concevoir une introduction accessible aux principes fondamentaux que nous pourrons déployer auprès des équipes non techniques.

Pour t'accompagner dans cette mission, je te présente les autres interlocuteurs qui participeront à nos échanges :
* Neil LEVIN, Expert cybersécurité & CFO, expert en Stratégies de défense et solutions techniques de cybersécurité
* Yousra SAIDANI, Experte Cybersécurité & CFO, expert en Analyse forensique et réponse aux incidents

Nous sommes impatients de collaborer avec toi sur ce projet crucial pour nos clients.

Cordialement,

Marion Lopez
Senior Partner et Directrice Marketing, Communication et RSE
ELITE RETAIL SECURITY`;

    return exampleResponse;
  }
};