/**
 * Export de toutes les pages du module I_AM_CYBER
 */

// Page principale
export { default as CyberMainPage } from './index';
export { default as CyberModeSelection } from './mode-selection';

// Pages d'agent conversationnel
export * from './agent';
export { default as CyberAgentPage } from './agent/index';

// Pages d'interview
export * from './interview';
export { default as CyberInterviewSimulation } from './interview/index';

// Pages d'arcade
export * from './arcade';
export { default as CyberArcade } from './arcade/index';
export { default as CyberInvestigator } from './arcade/investigator/index';
export { default as DataLeakInvestigation } from './arcade/investigator/data-leak/index';
export { default as RansomwareAttack } from './arcade/investigator/ransomware-attack/index'; 
export { default as InsiderThreat } from './arcade/investigator/insider-threat/index';
export { default as DigitalForensics } from './arcade/digital-forensics/index';
export { default as ThreatIntelligence } from './arcade/threat-intelligence/index';

// Pages de défense/crise
export * from './defense';
export { default as CyberDefensePage } from './defense/index';
export { default as CyberDefenseSessionPage } from './defense/session';
export { default as CyberDefenseMissionPage } from './defense/mission';

// Pages d'ascension
export * from './ascension';
export { default as CyberAscension } from './ascension/index';
export { default as CyberAscensionTheme } from './ascension/theme';
export { default as CyberAscensionLevel } from './ascension/level';