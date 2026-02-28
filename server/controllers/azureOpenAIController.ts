import { Request, Response } from 'express';
import { openAIService } from '../services/openai';

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function directOpenAICompletion(req: Request, res: Response) {
  try {
    const { messages, temperature = 0.7, maxTokens = 800, useSecondaryModel = true } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Les messages doivent être fournis dans un format valide' 
      });
    }
    
    if (useSecondaryModel) {
      openAIService.switchApiKey('secondary');
    } else {
      openAIService.switchApiKey('primary');
    }
    
    const response = await openAIService.getChatCompletion(
      messages.map((msg: OpenAIMessage) => ({ role: msg.role, content: msg.content })),
      temperature,
      maxTokens
    );
    
    console.log(`Réponse générée (${response.length} caractères)`);
    return res.json({ response });
    
  } catch (error: any) {
    console.error('Erreur dans directOpenAICompletion:', error);
    res.status(500).json({
      error: true,
      message: `Erreur interne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }
}

export async function handleCrisisTeamResponse(req: Request, res: Response) {
  try {
    const { message, role, context } = req.body;
    
    if (!message || !role) {
      return res.status(400).json({ error: 'Message et rôle requis' });
    }
    
    const prompt = `Tu joues le rôle d'un membre d'une cellule de crise cybersécurité: ${role}.
    Tu réponds au Responsable Sécurité (RSSI) qui t'a envoyé ce message: "${message}".
    
    ${context?.scenario ? `Le scénario de crise actuel est: ${context.scenario}.` : ''}
    ${context?.tension ? `Le niveau de tension est: ${context.tension}.` : ''}
    ${context?.impactedSystems ? `Les systèmes impactés sont: ${context.impactedSystems.join(', ')}.` : ''}
    ${context?.elapsedTime ? `Temps écoulé depuis le début de la crise: ${context.elapsedTime} minutes.` : ''}
    
    COMPORTEMENT ET ATTITUDE:
    - Adopte une personnalité réaliste pour ton rôle.
    - Montre des émotions humaines appropriées: stress, urgence, frustration ou soulagement selon le contexte.
    - Sois direct et dans le feu de l'action.
    
    CONTENU DE TA RÉPONSE:
    - Répond de manière professionnelle mais avec des préoccupations réalistes pour ton rôle.
    - Ton message doit intégrer des enjeux concrets.
    
    FORMAT:
    - Sois bref (2-3 phrases maximum) mais impactant.`;
    
    console.log(`Simulation de crise - Génération de réponse pour: ${role}`);
    
    req.body = {
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      maxTokens: 800,
      useSecondaryModel: true
    };
    
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
