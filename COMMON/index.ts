/**
 * Point d'entrée du module COMMON
 * Ce fichier exporte tous les composants, contextes et utilitaires communs
 */

// Contextes d'application
export * from './src/contexts/ChatContext';
export * from './src/contexts/ThemeContext';

// Composants UI
export * from './src/components/ui';
export * from './src/components/layout';
export * from './src/components/utils';

// Hooks communs
export * from './src/hooks/use-toast';

// Pages communes
export * from './src/pages/common/home';
export * from './src/pages/common/modules';
export * from './src/pages/common/not-found';