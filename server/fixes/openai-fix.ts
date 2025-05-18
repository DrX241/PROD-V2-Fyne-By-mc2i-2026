/**
 * Wrapper OpenAI amélioré avec meilleure gestion des erreurs HTML
 */
import { Request, Response } from 'express';
import { openAIService } from '../services/openai';
import { ChatCompletionRequestMessage } from '../services/openAiTypes';

/**
 * Appel sécurisé à l'API OpenAI qui capture et traite correctement les erreurs HTML
 */
export async function secureChatCompletion(
  systemPrompt: string,
  userMessage: string,
  options = { temperature: 0.7, maxTokens: 800, useSecondaryModel: true }
) {
  try {
    // Appel à l'API Azure OpenAI via notre service existant
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    
    console.log(`Appel sécurisé à OpenAI - Longueur du prompt: ${systemPrompt.length} caractères`);
    
    return await openAIService.getChatCompletion(
      messages,
      options.temperature,
      options.maxTokens,
      { useSecondaryKey: options.useSecondaryModel }
    );
  } catch (error) {
    console.error('Erreur dans secureChatCompletion:', error);
    
    // Si l'erreur est liée à une réponse HTML, reformater l'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
      throw new Error("L'API Azure OpenAI a renvoyé une page HTML au lieu d'une réponse JSON. Vérifiez votre configuration.");
    }
    
    // Propager l'erreur originale
    throw error;
  }
}

/**
 * Handler Express pour les appels à l'API avec gestion améliorée des erreurs
 */
export async function handleCrisisTeamResponse(req: Request, res: Response) {
  try {
    const { message, role, context } = req.body;
    
    if (!message || !role) {
      return res.status(400).json({ error: 'Message et rôle requis' });
    }
    
    // Construction du prompt en fonction du rôle et du contexte
    const prompt = `Tu joues le rôle d'un membre d'une cellule de crise cybersécurité: ${role}.
    Tu réponds au Responsable Sécurité (RSSI) qui t'a envoyé ce message: "${message}".
    
    ${context?.scenario ? `Le scénario de crise actuel est: ${context.scenario}.` : ''}
    ${context?.tension ? `Le niveau de tension est: ${context.tension}.` : ''}
    ${context?.impactedSystems ? `Les systèmes impactés sont: ${context.impactedSystems.join(', ')}.` : ''}
    ${context?.elapsedTime ? `Temps écoulé depuis le début de la crise: ${context.elapsedTime} minutes.` : ''}
    
    COMPORTEMENT ET ATTITUDE:
    - Adopte une personnalité réaliste pour ton rôle. Si tu es DSI, tu es préoccupé par la continuité d'activité, 
      si tu es juriste, par les implications légales, etc.
    - Montre des émotions humaines appropriées: stress, urgence, frustration ou soulagement selon le contexte.
    - Exprime des désaccords avec les autres membres de l'équipe quand cela est pertinent.
    - Sois direct et dans le feu de l'action, sans formules comme "En tant que..." ou "En ma qualité de...".
    
    CONTENU DE TA RÉPONSE:
    - Répond de manière professionnelle mais avec des préoccupations et priorités réalistes pour ton rôle.
    - Ton message doit intégrer des enjeux concrets (chiffres financiers, délais légaux, impacts techniques précis).
    - Utilise au moins un des éléments suivants:
      * Mention d'impact financier spécifique (ex: "Cela nous coûtera 50K€/heure")
      * Mention d'impact légal/réputationnel (ex: "Nous risquons une amende RGPD de 4% du CA mondial")
      * Mention de contrainte technique (ex: "La restauration des backups prendra 12h minimum")
    
    FORMAT:
    - Sois bref (2-3 phrases maximum) mais impactant.
    - N'oublie jamais que tu es en situation d'urgence avec des enjeux majeurs.`;
    
    console.log(`Simulation de crise - Génération de réponse pour: ${role}`);
    
    // Utiliser notre wrapper sécurisé
    const response = await secureChatCompletion(prompt, message);
    
    res.json({ response });
  } catch (error) {
    console.error('Erreur lors de la génération de réponse pour la simulation de crise:', error);
    
    // Envoyer une erreur structurée au client
    res.status(500).json({ 
      error: true,
      message: error instanceof Error 
        ? error.message.replace(/<!DOCTYPE[\s\S]*$/g, "Erreur HTML reçue") // Nettoyer HTML éventuel
        : 'Erreur inconnue',
      response: null
    });
  }
}