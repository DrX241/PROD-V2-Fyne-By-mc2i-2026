/**
 * Ce fichier mappe les variables d'environnement fournies aux noms utilisés dans l'application
 */

// Fonction pour mapper les variables d'environnement
export function mapEnvironmentVariables() {
  // Utilisation directe des noms de variables Azure OpenAI fournis
  
  // Pour GPT-4o, n'ajuster que si les variables ne sont pas déjà définies
  if (!process.env.GPT4O_API_KEY) {
    process.env.GPT4O_API_KEY = process.env.AZURE_OPENAI_KEY || '';
  }
  
  if (!process.env.GPT4O_ENDPOINT) {
    // S'assurer que l'endpoint est bien formaté avec https://
    let endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    if (endpoint && !endpoint.startsWith('http')) {
      endpoint = 'https://' + endpoint;
    }
    process.env.GPT4O_ENDPOINT = endpoint;
  }
  
  if (!process.env.GPT4O_DEPLOYMENT_NAME) {
    process.env.GPT4O_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
  }
  
  if (!process.env.GPT4O_API_VERSION) {
    process.env.GPT4O_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
  }
  
  // Pour GPT-4o-mini, n'ajuster que si les variables ne sont pas déjà définies
  if (!process.env.GPT4O_MINI_API_KEY) {
    process.env.GPT4O_MINI_API_KEY = process.env.AZURE_OPENAI_KEY || ''; // Même clé API
  }
  
  if (!process.env.GPT4O_MINI_ENDPOINT) {
    // S'assurer que l'endpoint est bien formaté avec https://
    let endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    if (endpoint && !endpoint.startsWith('http')) {
      endpoint = 'https://' + endpoint;
    }
    process.env.GPT4O_MINI_ENDPOINT = endpoint;
  }
  
  if (!process.env.GPT4O_MINI_DEPLOYMENT_NAME) {
    // Utiliser le nom exact du déploiement fourni par l'utilisateur
    process.env.GPT4O_MINI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_MINI_DEPLOYMENT_NAME || 'Eddy-02-2025-gpt-4o-mini';
  }
  
  if (!process.env.GPT4O_MINI_API_VERSION) {
    process.env.GPT4O_MINI_API_VERSION = process.env.AZURE_OPENAI_MINI_API_VERSION || '2024-12-01-preview';
  }

  // Vérifier que les URLs sont valides
  if (process.env.GPT4O_ENDPOINT && !process.env.GPT4O_ENDPOINT.startsWith('http')) {
    process.env.GPT4O_ENDPOINT = 'https://' + process.env.GPT4O_ENDPOINT;
  }
  
  if (process.env.GPT4O_MINI_ENDPOINT && !process.env.GPT4O_MINI_ENDPOINT.startsWith('http')) {
    process.env.GPT4O_MINI_ENDPOINT = 'https://' + process.env.GPT4O_MINI_ENDPOINT;
  }

  // Vérifier les mappings
  console.log("=== Variables d'environnement mappées ===");
  console.log(`GPT4O_API_KEY: ${process.env.GPT4O_API_KEY ? '***configuré' : 'non configuré'}`);
  console.log(`GPT4O_ENDPOINT: ${process.env.GPT4O_ENDPOINT ? process.env.GPT4O_ENDPOINT : 'non configuré'}`);
  console.log(`GPT4O_DEPLOYMENT_NAME: ${process.env.GPT4O_DEPLOYMENT_NAME || 'non configuré'}`);
  console.log(`GPT4O_API_VERSION: ${process.env.GPT4O_API_VERSION || 'non configuré'}`);
  
  console.log(`GPT4O_MINI_API_KEY: ${process.env.GPT4O_MINI_API_KEY ? '***configuré' : 'non configuré'}`);
  console.log(`GPT4O_MINI_ENDPOINT: ${process.env.GPT4O_MINI_ENDPOINT ? process.env.GPT4O_MINI_ENDPOINT : 'non configuré'}`);
  console.log(`GPT4O_MINI_DEPLOYMENT_NAME: ${process.env.GPT4O_MINI_DEPLOYMENT_NAME || 'non configuré'}`);
  console.log(`GPT4O_MINI_API_VERSION: ${process.env.GPT4O_MINI_API_VERSION || 'non configuré'}`);
}

// Exporter la fonction pour l'utiliser dans server/index.ts
export default mapEnvironmentVariables;