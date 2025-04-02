import { Express } from 'express';
import { registerIAmCyberRoutes } from './services/api-routes';

/**
 * Point d'entrée principal du module I AM CYBER NEW
 * @param app Application Express
 */
export function initializeIAmCyberNew(app: Express): void {
  // Enregistrer les routes API
  registerIAmCyberRoutes(app);
  
  console.log('I AM CYBER NEW module initialized');
}