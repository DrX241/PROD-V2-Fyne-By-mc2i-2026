/**
 * Controller sécurisé pour les appels à l'API Azure OpenAI
 * Gère correctement les réponses HTML, les erreurs et les formats de données incorrects
 */
import { Request, Response } from 'express';
import { openAIService } from '../services/openai';
import axios from 'axios';

// Types pour les messages OpenAI
type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Route pour les appels directs à l'API OpenAI sans passer par le service existant
 * Cette approche utilise axios pour une gestion d'erreur améliorée
 */
export async function directOpenAICompletion(req: Request, res: Response) {
  try {
    const { messages, temperature = 0.7, maxTokens = 800, useSecondaryModel = true } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Les messages doivent être fournis dans un format valide' 
      });
    }
    
    // Récupérer les informations de configuration
    const config = useSecondaryModel ? 
      {
        apiKey: process.env.GPT4O_MINI_API_KEY,
        endpoint: process.env.GPT4O_MINI_ENDPOINT,
        deploymentName: process.env.GPT4O_MINI_DEPLOYMENT_NAME,
        apiVersion: process.env.GPT4O_MINI_API_VERSION,
      } :
      {
        apiKey: process.env.GPT4O_API_KEY,
        endpoint: process.env.GPT4O_ENDPOINT,
        deploymentName: process.env.GPT4O_DEPLOYMENT_NAME,
        apiVersion: process.env.GPT4O_API_VERSION,
      };
    
    // Vérifier la configuration minimale
    if (!config.apiKey || !config.endpoint || !config.deploymentName) {
      return res.status(500).json({
        error: true,
        message: 'Configuration Azure OpenAI incomplète ou manquante',
      });
    }
    
    // Formater l'URL correctement
    let baseEndpoint = config.endpoint;
    if (baseEndpoint.endsWith('/')) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }
    
    const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
    
    console.log(`Appel direct à Azure OpenAI: ${url}`);
    console.log(`Messages: ${messages.length}, Premier rôle: ${messages[0]?.role}`);
    
    // Configurer la requête
    const requestBody = {
      messages: messages.map((msg: OpenAIMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: temperature,
      max_tokens: maxTokens
    };
    
    try {
      // Utiliser axios pour une meilleure gestion des erreurs
      const apiResponse = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        },
        validateStatus: null, // Permet de gérer les erreurs nous-mêmes
        timeout: 15000 // 15 secondes de timeout max
      });
      
      // Vérifier si la réponse est un code d'erreur
      if (apiResponse.status !== 200) {
        console.error(`Erreur Azure OpenAI HTTP ${apiResponse.status}:`, 
          typeof apiResponse.data === 'object' 
            ? JSON.stringify(apiResponse.data).substring(0, 200) 
            : String(apiResponse.data).substring(0, 200)
        );
        
        // Si c'est une réponse HTML (au lieu de JSON), le signaler explicitement
        const contentType = apiResponse.headers['content-type'] || '';
        if (contentType.includes('text/html') || 
            (typeof apiResponse.data === 'string' && 
             (apiResponse.data.includes('<!DOCTYPE') || apiResponse.data.includes('<html')))) {
          return res.status(502).json({
            error: true,
            message: "L'API Azure OpenAI a retourné une page HTML au lieu de JSON. Problème d'authentification ou d'URL.",
            htmlResponse: true
          });
        }
        
        return res.status(apiResponse.status).json({
          error: true,
          message: `Erreur Azure OpenAI (${apiResponse.status}): ${
            apiResponse.data?.error?.message || 'Erreur inconnue'
          }`
        });
      }
      
      // Vérifier si la réponse a le format attendu
      if (!apiResponse.data?.choices?.[0]?.message?.content) {
        console.error('Format de réponse OpenAI invalide:', apiResponse.data);
        return res.status(502).json({
          error: true,
          message: 'Format de réponse OpenAI invalide'
        });
      }
      
      // Extraire et retourner le contenu de la réponse
      const response = apiResponse.data.choices[0].message.content;
      console.log(`Réponse générée (${response.length} caractères)`);
      
      return res.json({ response });
      
    } catch (axiosError: any) {
      console.error('Erreur axios lors de l\'appel à Azure OpenAI:', axiosError.message);
      
      // Erreurs de connexion
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
        return res.status(503).json({
          error: true,
          message: `Impossible de se connecter à Azure OpenAI: ${axiosError.message}`
        });
      }
      
      // Timeout
      if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ESOCKETTIMEDOUT') {
        return res.status(504).json({
          error: true,
          message: `Délai d'attente dépassé lors de l'appel à Azure OpenAI: ${axiosError.message}`
        });
      }
      
      // Autres erreurs
      return res.status(500).json({
        error: true,
        message: `Erreur lors de l'appel à Azure OpenAI: ${axiosError.message}`
      });
    }
    
  } catch (error: any) {
    console.error('Erreur globale dans directOpenAICompletion:', error);
    res.status(500).json({
      error: true,
      message: `Erreur interne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}

/**
 * Route pour générer une réponse contextuelle pour un membre de l'équipe de crise
 * Version simplifiée avec gestion améliorée des erreurs
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
    
    // Utiliser le format de messages officiel pour ChatGPT
    const formattedMessages = [
      { role: 'system', content: prompt },
      { role: 'user', content: message }
    ];
    
    // Appel direct à l'API via notre nouvelle fonction
    req.body = {
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 800,
      useSecondaryModel: true
    };
    
    // Réutiliser notre nouvelle implémentation
    return directOpenAICompletion(req, res);
    
  } catch (error) {
    console.error('Erreur lors de la génération de réponse pour la simulation de crise:', error);
    res.status(500).json({ 
      error: true,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      response: null
    });
  }
}