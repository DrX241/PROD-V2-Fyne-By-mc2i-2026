// Configuration pour l'accès aux services externes dans l'application
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration pour Azure OpenAI
export const azureOpenAIConfig = {
  // Modèle principal GPT-4o
  apiKey: process.env.OPENAI_API_KEY || '',
  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://eddy-02-2025-azureaiservices017852658000.openai.azure.com/',
  azureDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'Eddy-deploy-20-02-2025-gpt-4o',
  azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
  
  // Modèle secondaire GPT-4o-mini (moins cher, pour certains usages)
  secondaryApiKey: process.env.OPENAI_API_KEY || '',
  secondaryAzureEndpoint: process.env.AZURE_OPENAI_SECONDARY_ENDPOINT || 'https://eddy-02-2025-azureaiservices017852658000.openai.azure.com/',
  secondaryAzureDeploymentName: process.env.AZURE_OPENAI_SECONDARY_DEPLOYMENT_NAME || 'Eddy-02-2025-gpt-4o-mini',
  secondaryAzureApiVersion: process.env.AZURE_OPENAI_SECONDARY_API_VERSION || '2024-12-01-preview',
  
  // Variables pour suivre l'état du service
  modelName: 'gpt-4o',
  secondaryModelName: 'gpt-4o-mini',
  isConnected: false,
  lastCheckTime: 0,
  
  // Méthode pour vérifier si le service est fonctionnel
  isFunctional: function() {
    // Considérer le service comme fonctionnel si vérifié au cours des 5 dernières minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.isConnected && this.lastCheckTime > fiveMinutesAgo;
  }
};

// Configuration de l'application
export const appConfig = {
  // Ports et URLs
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5000',
  
  // Sécurité
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
  
  // Timeouts
  defaultRequestTimeout: 30000, // 30 secondes
  
  // Limites
  maxUploadSize: 10 * 1024 * 1024, // 10 MB
  
  // Options de développement
  isDevelopment: process.env.NODE_ENV !== 'production',
};

// Exporter la configuration
export default {
  azure: azureOpenAIConfig,
  app: appConfig
};