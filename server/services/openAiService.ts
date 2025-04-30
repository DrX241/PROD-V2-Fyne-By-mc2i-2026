/**
 * Service pour interagir avec Azure OpenAI
 */
import axios from 'axios';

// Utilisation de l'API Azure OpenAI
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://eddy-02-2025-azureaiservices017852658000.openai.azure.com';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'Eddy-02-2025-gpt-4o-mini';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';

/**
 * Génère un texte à partir d'un prompt en utilisant Azure OpenAI
 */
export async function generateText(prompt: string, temperature: number = 0.7, maxTokens: number = 2000): Promise<string> {
  try {
    if (!AZURE_OPENAI_KEY) {
      throw new Error('Azure OpenAI API key is not set');
    }

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
    
    const response = await axios.post(
      url,
      {
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant de simulation pour une application de gestion de crise en cybersécurité appelée CyberChallenge.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('Azure OpenAI API response:', error.response.data);
    }
    
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

/**
 * Vérifie la connexion à Azure OpenAI
 */
export async function checkOpenAiConnection(): Promise<boolean> {
  try {
    await generateText('Test de connexion', 0.1, 10);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}