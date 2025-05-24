import { Request, Response } from 'express';
// Utilisation d'une autre méthode pour interagir avec Azure OpenAI
import OpenAI from 'openai';

// Configuration Azure OpenAI
const openai = new OpenAI({
  apiKey: process.env.GPT4O_API_KEY,
  baseURL: `${process.env.GPT4O_ENDPOINT}/openai/deployments/${process.env.GPT4O_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2023-05-15' },
  defaultHeaders: { 'api-key': process.env.GPT4O_API_KEY }
});

// Types pour les modules générés
interface ModulePoint {
  titre: string;
  description: string;
}

interface ModuleApprentissage {
  id: number;
  title: string;
  description: string;
  duree: string;
  type: string;
  points_cles: string[];
}

interface ParcoursResponse {
  parcours: ModuleApprentissage[];
}

/**
 * Génère un parcours d'apprentissage personnalisé basé sur l'intention de l'utilisateur
 */
export const genererParcours = async (req: Request, res: Response) => {
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

    console.log("Génération d'un parcours personnalisé pour l'intention:", intention);

    // Appeler l'API Azure OpenAI
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un expert en cybersécurité et en pédagogie qui crée des parcours d'apprentissage personnalisés." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

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
};