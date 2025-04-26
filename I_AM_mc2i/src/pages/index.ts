/**
 * Export de toutes les pages du module I_AM_mc2i
 */

// Page principale
export { default as AmoaMainPage } from './index';
export { default as AmoaModeSelection } from './mode-selection';

// Pages d'interview
export * from './interview';
export { default as AmoaInterviewSimulation } from './interview/index';

// Pages de quêtes
export * from './quest';
export { default as AmoaQuestPage } from './quest/index';

// Pages d'investigation
export * from './impostor';
export { default as ProjetImposteur } from './impostor/index';