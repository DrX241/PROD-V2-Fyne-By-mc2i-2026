/**
 * Configuration de l'application
 */
export const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Serveur
  port: process.env.PORT || 5000,
  
  // API Keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  
  // Limites et throttling
  limits: {
    requestsPerMinute: 30,
    contentGenerationCooldown: 10 * 1000, // 10 secondes
  },
};