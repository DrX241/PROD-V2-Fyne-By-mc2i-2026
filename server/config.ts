// Configuration pour l'accès aux services externes dans l'application

// Configuration pour Amazon Bedrock
export const bedrockConfig = {
  // AWS Credentials
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
  
  // Modèle principal (Claude 3.5 Sonnet - équivalent GPT-4o)
  primaryModelId: process.env.BEDROCK_PRIMARY_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  
  // Modèle secondaire (Claude 3 Haiku - équivalent GPT-4o-mini, moins cher)
  secondaryModelId: process.env.BEDROCK_SECONDARY_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
  
  // Variables pour suivre l'état du service
  modelName: 'Claude 3.5 Sonnet',
  secondaryModelName: 'Claude 3 Haiku',
  isConnected: false,
  lastCheckTime: 0,
  
  // Méthode pour vérifier si le service est fonctionnel
  isFunctional: function() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.isConnected && this.lastCheckTime > fiveMinutesAgo;
  }
};

// Configuration Azure OpenAI (conservée pour référence/fallback)
export const azureOpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  azureDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
  azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
  secondaryApiKey: process.env.OPENAI_API_KEY || '',
  secondaryAzureEndpoint: process.env.AZURE_OPENAI_SECONDARY_ENDPOINT || '',
  secondaryAzureDeploymentName: process.env.AZURE_OPENAI_SECONDARY_DEPLOYMENT_NAME || '',
  secondaryAzureApiVersion: process.env.AZURE_OPENAI_SECONDARY_API_VERSION || '2024-12-01-preview',
  modelName: 'gpt-4o',
  secondaryModelName: 'gpt-4o-mini',
  isConnected: false,
  lastCheckTime: 0,
  isFunctional: function() {
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
  bedrock: bedrockConfig,
  azure: azureOpenAIConfig,
  app: appConfig
};