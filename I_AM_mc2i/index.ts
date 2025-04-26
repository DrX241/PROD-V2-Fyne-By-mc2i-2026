/**
 * Point d'entrée du module I_AM_mc2i
 */

// Exportation des composants
export * from './src/components';

// Exportation des pages
export * from './src/pages';

// Exportation des contextes
export * from './src/contexts';

// Exportation des services
export * from './src/services';

// Configuration du module
export const moduleConfig = {
  name: 'I_AM_mc2i',
  title: 'I AM mc2i',
  description: 'Plateforme de formation AMOA',
  basePath: '/amoa',
};