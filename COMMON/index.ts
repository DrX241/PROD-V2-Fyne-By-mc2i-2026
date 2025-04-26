/**
 * Point d'entrée du module COMMON
 */

// Exportation des composants
export * from './src/components';

// Exportation des pages
export * from './src/pages';

// Exportation des contextes
export * from './src/contexts';

// Exportation des services
export * from './src/services/openAiResponseHelper';

// Configuration du module
export const moduleConfig = {
  name: 'COMMON',
  title: 'Composants Communs',
  description: 'Bibliothèque de composants et services communs',
  basePath: '/',
};