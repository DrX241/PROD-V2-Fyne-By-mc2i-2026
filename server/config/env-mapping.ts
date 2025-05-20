/**
 * Ce fichier mappe les variables d'environnement fournies aux noms utilisés dans l'application
 */

// Fonction pour mapper les variables d'environnement
export function mapEnvironmentVariables() {
  // Mapping pour GPT-4o
  process.env.GPT4O_API_KEY = process.env.AZURE_OPENAI_KEY || '';
  process.env.GPT4O_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
  process.env.GPT4O_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
  process.env.GPT4O_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
  
  // Mapping pour GPT-4o-mini
  process.env.GPT4O_MINI_API_KEY = process.env.AZURE_OPENAI_KEY || ''; // Utilise la même clé API
  process.env.GPT4O_MINI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''; // Utilise le même endpoint
  process.env.GPT4O_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_MINI_DEPLOYMENT_NAME || 'gpt-4o-mini';
  process.env.GPT4O_MINI_API_VERSION = process.env.AZURE_OPENAI_MINI_API_VERSION || '2024-12-01-preview';

  // Vérifier les mappings
  console.log("=== Variables d'environnement mappées ===");
  console.log(`GPT4O_ENDPOINT: ${process.env.GPT4O_ENDPOINT ? 'configuré' : 'non configuré'}`);
  console.log(`GPT4O_MINI_ENDPOINT: ${process.env.GPT4O_MINI_ENDPOINT ? 'configuré' : 'non configuré'}`);
}

// Exporter la fonction pour l'utiliser dans server/index.ts
export default mapEnvironmentVariables;