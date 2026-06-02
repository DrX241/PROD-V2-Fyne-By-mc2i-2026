export const bedrockConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
  primaryModelId: process.env.BEDROCK_PRIMARY_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  secondaryModelId: process.env.BEDROCK_SECONDARY_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
  modelName: 'Claude 3.5 Sonnet',
  secondaryModelName: 'Claude 3 Haiku',
  isConnected: false,
  lastCheckTime: 0,
  isFunctional: function() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.isConnected && this.lastCheckTime > fiveMinutesAgo;
  }
};

export const geminiConfig = {
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.GEMINI_API_KEY || '',
  baseUrl: process.env.AI_GATEWAY_URL || 'https://aigateway.mc2i-lab.fr/v1',
  modelName: process.env.AI_PRIMARY_MODEL || 'gemini-2.5-flash',
  isConnected: false,
  lastCheckTime: 0,
  isFunctional: function() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return this.isConnected && this.lastCheckTime > fiveMinutesAgo;
  }
};

export const appConfig = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5000',
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
  defaultRequestTimeout: 30000,
  maxUploadSize: 10 * 1024 * 1024,
  isDevelopment: process.env.NODE_ENV !== 'production',
};

export default {
  bedrock: bedrockConfig,
  gemini: geminiConfig,
  app: appConfig
};
