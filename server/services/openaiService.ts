// Ce fichier est maintenu pour assurer la compatibilité avec le code existant
// Toutes les fonctionnalités ont été déplacées vers des services spécialisés
import { generatePentestScenario, analyzeUserSolution, generateCustomHint } from './pentestService';
import { ScenarioGenerationRequest, CodeAnalysisRequest } from './pentestService';

export {
  ScenarioGenerationRequest,
  CodeAnalysisRequest,
  generatePentestScenario,
  analyzeUserSolution,
  generateCustomHint
};

export default {
  generatePentestScenario,
  analyzeUserSolution,
  generateCustomHint
};