export const bedrockConfig = {
  region: process.env.AWS_REGION || 'eu-west-3',
  primaryModel:   process.env.BEDROCK_PRIMARY_MODEL   || 'eu.anthropic.claude-sonnet-4-5-20251001-v1:0',
  secondaryModel: process.env.BEDROCK_SECONDARY_MODEL || 'eu.anthropic.claude-haiku-4-5-20251001-v1:0',
  tertiaryModel:  process.env.BEDROCK_TERTIARY_MODEL  || 'eu.anthropic.claude-3-5-sonnet-20241022-v2:0',
  isConnected: false,
  lastCheckTime: 0,
  isFunctional: function() {
    return this.isConnected && this.lastCheckTime > Date.now() - 5 * 60 * 1000;
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
  app: appConfig
};
