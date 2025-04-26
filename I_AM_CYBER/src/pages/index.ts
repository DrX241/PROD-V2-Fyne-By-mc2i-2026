/**
 * Export des pages du module I_AM_CYBER
 */

// Page principale
export { default as CyberMainPage } from './index';
export { default as CyberModeSelection } from './mode-selection';

// Agent conversationnel
export { default as CyberAgentPage } from './agent';

// Centre de crise / Défense
export { default as CyberDefensePage } from './defense';
export { default as CyberDefenseSessionPage } from './defense/session';
export { default as CyberDefenseMissionPage } from './defense/mission';

// Arcade et jeux
export { default as CyberArcade } from './arcade';
export { default as CyberInvestigator } from './arcade/investigator';
export { default as DataLeakInvestigation } from './arcade/investigator/data-leak';
export { default as RansomwareAttack } from './arcade/investigator/ransomware-attack';
export { default as InsiderThreat } from './arcade/investigator/insider-threat';
export { default as DigitalForensics } from './arcade/digital-forensics';
export { default as ThreatIntelligence } from './arcade/threat-intelligence';

// Simulation d'entretien
export { default as CyberInterviewSimulation } from './interview';

// Programme Ascension
export { default as CyberAscension } from './ascension';
export { default as CyberAscensionTheme } from './ascension/theme';
export { default as CyberAscensionLevel } from './ascension/level';