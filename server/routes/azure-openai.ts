import { Router } from 'express';
import { AzureKeyCredential, OpenAIClient } from '@azure/openai';

const router = Router();

// Configuration Azure OpenAI
const endpoint = process.env.GPT4O_ENDPOINT || '';
const apiKey = process.env.GPT4O_API_KEY || '';
const deploymentName = process.env.GPT4O_DEPLOYMENT_NAME || '';

// Initialiser le client OpenAI
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

// Générer un parcours personnalisé basé sur l'intention de l'utilisateur
router.post('/generer-parcours', async (req, res) => {
  try {
    const { intention } = req.body;

    if (!intention) {
      return res.status(400).json({ error: 'Veuillez fournir une intention d\'apprentissage' });
    }

    // Construire le prompt pour l'IA
    const prompt = `
Tu es un expert en cybersécurité qui doit créer un parcours d'apprentissage personnalisé. 
L'utilisateur exprime le besoin suivant: "${intention}".

Génère un parcours de formation composé de 3 à 5 modules de micro-learning.
Pour chaque module, fournit:
1. Un titre concis et précis
2. Une courte description de ce que couvre le module
3. Une durée estimée (en minutes)
4. Un type parmi ces options: ["module", "simulation", "cours", "quiz", "atelier"]
5. Trois points clés spécifiques que couvre ce module

Structure ta réponse au format JSON suivant:
{
  "parcours": [
    {
      "id": 1,
      "title": "Titre du module",
      "description": "Description courte",
      "duree": "XX min",
      "type": "module/simulation/cours/quiz/atelier",
      "points_cles": ["Point 1", "Point 2", "Point 3"]
    },
    // autres modules...
  ]
}

Le parcours doit être progressif, commençant par les connaissances fondamentales et avançant vers des sujets plus spécifiques ou avancés.
Assure-toi que le contenu est adapté au niveau et aux besoins spécifiques exprimés par l'utilisateur.`;

    // Appeler l'API Azure OpenAI
    const response = await client.getChatCompletions(
      deploymentName,
      [
        { role: "system", content: "Tu es un expert en cybersécurité et en pédagogie qui crée des parcours d'apprentissage personnalisés." },
        { role: "user", content: prompt }
      ],
      { 
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: { type: "json_object" }
      }
    );

    if (response.choices && response.choices.length > 0) {
      const parcoursData = JSON.parse(response.choices[0].message.content || "{}");
      return res.json(parcoursData);
    } else {
      throw new Error('Réponse OpenAI vide ou invalide');
    }
  } catch (error) {
    console.error('Erreur lors de la génération du parcours:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du parcours personnalisé' });
  }
});

export default router;