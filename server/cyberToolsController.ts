import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Controller pour le convertisseur de politiques de sécurité
export async function policyConverterController(req: Request, res: Response) {
  try {
    const { originalPolicy, policyType, targetAudience } = req.body;

    if (!originalPolicy || !policyType || !targetAudience) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Utiliser Azure OpenAI pour convertir la politique
    const prompt = constructPolicyPrompt(originalPolicy, policyType, targetAudience);
    const systemMessage = {
      role: 'system',
      content: `Tu es un expert en cybersécurité et en communication, spécialisé dans la simplification et l'adaptation de politiques de sécurité pour différents publics. Ta tâche est de transformer des politiques techniques complexes en versions claires et accessibles tout en préservant les informations essentielles.`
    };
    
    const userMessage = {
      role: 'user',
      content: prompt
    };
    
    // Utiliser le service OpenAI qui est configuré pour Azure
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      0.7,
      1500
    );

    // Analyser la réponse JSON
    let responseData;
    try {
      responseData = JSON.parse(response);
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la réponse JSON:', error);
      console.error('Réponse brute:', response);
      return res.status(500).json({ error: 'Erreur lors de l\'analyse de la réponse' });
    }

    res.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la conversion de la politique:', error);
    res.status(500).json({ error: 'Erreur lors de la conversion de la politique' });
  }
}

// Construire le prompt pour la conversion de la politique
function constructPolicyPrompt(originalPolicy: string, policyType: string, targetAudience: string): string {
  let audienceDescription = '';

  switch (targetAudience) {
    case 'technical':
      audienceDescription = 'équipe technique de sécurité informatique, avec des connaissances avancées en cybersécurité';
      break;
    case 'management':
      audienceDescription = 'équipe de direction et managers, avec une compréhension commerciale mais peu de connaissances techniques';
      break;
    case 'beginner':
      audienceDescription = 'personnes débutantes en cybersécurité, avec très peu de connaissances techniques';
      break;
    case 'general':
    default:
      audienceDescription = 'tous les employés, avec différents niveaux de connaissances techniques';
      break;
  }

  return `
    Voici une politique de sécurité de type "${policyType}" :

    """
    ${originalPolicy}
    """

    Convertis cette politique pour la rendre accessible à un public composé de : ${audienceDescription}.

    Ton objectif est de simplifier le langage et d'adapter le niveau de détail technique tout en conservant les informations essentielles. La politique doit rester efficace et claire, mais plus accessible pour le public cible.

    Réponds avec un objet JSON au format suivant :
    {
      "convertedPolicy": "La version convertie de la politique, formatée pour une meilleure lisibilité",
      "simplificationNotes": ["Liste de 3-5 notes expliquant les simplifications majeures apportées"],
      "keyPoints": ["Liste de 3-5 points clés que le lecteur doit absolument retenir"],
      "readabilityScore": 0.85 // Un score entre 0 et 1 indiquant la lisibilité du texte converti
    }

    Le format doit être strictement JSON valide.
  `;
}