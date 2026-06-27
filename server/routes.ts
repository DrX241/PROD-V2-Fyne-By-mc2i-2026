import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const _require = createRequire(path.join(process.cwd(), 'package.json'));
import { v4 as uuidv4 } from 'uuid';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { AuthController } from "./authController";
import { llmTrackingMiddleware } from "./middleware/llmTrackingMiddleware";
import { SsoAdminController, SsoAuthController } from "./ssoController";
import { openAIService, geminiService } from "./services/gemini";
import attachmentRoutes from './routes/attachmentRoutes';
import cyberForgeRoutes from './routes/cyberForgeRoutes';
import cyberToolsRoutes from './routes/cyberToolsRoutes';
import immersiveCrisisRoutes from './routes/immersiveCrisisRoutes';
import prospectPulseRoutes from './routes/prospectPulseRoutes';
import crisisCenterRoutes from './routes/crisisCenterRoutes';
import audioRoutes from './routes/audioRoutes';
import codeExecutionRoutes from './routes/codeExecutionRoutes';
import formationRoutes from './routes/formationRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import companyRoutes from './routes/companyRoutes';
import modulePublishRoutes from './routes/modulePublishRoutes';
import { createAttachmentWithHiddenPassword } from './services/attachmentService';
import { evaluateInterviewTest, generateAdaptiveQuestion, generateInitialQuestion } from './cyberInterviewTestController';
import { CyberScenario, CrisisDecisionContent, CrisisDecisionOption } from '../shared/types/cyber';
import { crisisManagementController } from './crisisManagementController';
import { generateCourseContent, answerQuestion, generateQuiz as generateDataIaQuiz } from './controllers/dataIaAcademyController';

// Récupérer le chemin du répertoire actuel en module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Import de document-generator supprimé car nous n'utilisons plus de pièces jointes
import { ChatCompletionRequestMessage } from "@shared/schema";
import { evaluateDecision } from "./cyberDefenseEvaluator";
import { getUserProgress, saveUserProgress } from "./userLearningController";
import { handleCyberDefenseChat, generateCyberDefenseMission } from "./cyberDefenseController";
import { extractJsonFromOpenAiResponse, createFallbackJson } from "./openAiResponseHelper";
import { startInterviewSimulation, processInterviewMessage, completeInterviewSimulation, analyzeInterviewNotes } from "./interviewSimulationController";
import { getRandomScenarios, getScenarioById, getScenariosByDifficulty } from "./impostorService";
import { startAgentSession, completeAgentSession } from "./cyberAgentController";
import { generateSyntheseEntretien } from "./syntheseEntretienController";
import { generateCyberFiche, getUserFavorites } from './cyberFicheController';
import { searchGlossaryTerm, explainConcept, compareTerms, generateQuiz, askGlossaryAssistant } from './cyberGlossaryController';
import { generateDebriefing, getContextualDocumentation } from "./cyberLearningController";
import { generateQuizQuestion, generateQuizHint, generateFullQuiz } from "./adaptiveQuizController";
import { initMcaiLearningSession, processMcaiLearningMessage } from "./mcaiLearningController";
import { initCyberExpertSession, processCyberExpertMessage, terminateCyberExpertSession } from "./cyberExpertController";
import { startDecisionFlow, submitDecision, checkDecisionStatus } from "./cyberExpertDecisions";
import * as amoaExpertController from "./amoaExpertController";
import { initCyberPulseSession, processCyberPulseMessage, generateCyberChallenge, checkInactivity, updateCyberPulsePreferences, updatePlayerScore } from "./cyberPulseGameController";
import { terminateCyberPulseSession } from "./cyberPulseSessionManager";
import { startImposteurSimulation, processImposteurMessage, completeImposteurSimulation } from "./imposteurSimulationController";
import { simulateTargetResponse, analyzePerformance } from "./brainHackerController";
import { analyzeDefenseStrategy, generateAttackScenario, generateTacticalTip } from "./firewallTactiqueController";
import { generateDynamicChallenge } from './dynamicChallengeController';
import { generateLivrable } from "./livrablesGeneratorController";
import { generateClientMessage as generateProspectMessage, evaluateSession as evaluateProspectSession } from "./prospectPulseController";
import {
  // Les anciennes fonctions de crise sont temporairement commentées pour éviter les erreurs
  /*
  getAvailableScenarios,
  startCrisisSession,
  getCrisisSessionDetails,
  sendCrisisMessage,
  pauseCrisisSession,
  resumeCrisisSession,
  updateResourceAllocation,
  recordDecision,
  markStakeholderMessagesAsRead,
  respondToStakeholder
  */
} from "./crisisManagementController";
import { 
  generateCode, 
  getCodeGenerationHistory, 
  saveGeneratedCode, 
  generatePromptExamples,
  executeGeneratedCode,
  improveGeneratedCode,
  suggestLanguageAndFramework
} from "./codeGeneratorController";
import { generateCyberPractices } from "./cyberSnakeController";
import { chatWithCustomAssistant } from "./customAssistantsController";
import { getActiveIncidents, getIncidentDetails, getExpertsForIncident, handleExpertMessage, executeAction, getCrisisSession } from "./cyberCrisisController";
import {
  analyzeUserResponse,
  getLevelInfo,
  generateScenario,
  evaluatePerformance,
  generateLearningRecommendations
} from "./cyberAscensionController";
import { generateModule as generateModuleOld, saveCustomModule as saveCustomModuleOld, getCustomModules, getCustomModuleById, deleteCustomModule } from "./moduleGeneratorController";
import { generateModule, saveCustomModule } from "./moduleGeneratorControllerNew";
import { analyzeEvidence, getInvestigationHints, evaluateInvestigationResult, generateInvestigationScenario, generateInvestigationNotes } from "./cyberInvestigatorController";
import { getInvestigationProgress, saveInvestigationProgress, evaluateUserNotes } from "./investigationProgressController";
// importation du controller CyberEscape supprimée
import { generateTeamMemberResponse, simulateTeamInteraction, generateCrisisUpdate } from "./immersiveCrisisController";
import { getChallenges, getChallengeById, getUserStats, getUserReports, submitBugReport, getReportById } from "./bugHunterController";
import { generateCustomTool } from "./toolGeneratorController";
import { getOrCreateUser, getUserById } from "./userController";
import { AdminController } from "./adminController";
import { SuperAdminController } from "./superAdminController";
import { evaluateUserPerformance, generateFeedbackMessage } from "./amoaReflexTestController";
import { generateAmoaQuestions } from "./amoaQuestionGenerator";
import { 
  initializeAmoaExpertSession, 
  processAmoaExpertMessage, 
  endAmoaExpertSession,
  generateAmoaDecisionScenario,
  processAmoaDecision,
  checkDecisionModeStatus
} from "./amoaExpertController";
import dataAcademieController from "./controllers/dataAcademieController";
import { executePythonCode, executeSQLCode, resetSessionVariables } from "./controllers/codeExecutionController";


import {
  generateQuestions,
  evaluateResponses,
  generateCertificate,
  getTestOptions,
  analyzeTestResults
} from "./cyberTestTechniqueController";
// Import des fonctions d'urgence cyber supprimé

/**
 * Fonction utilitaire pour obtenir la description détaillée d'un rôle utilisateur
 * Cette fonction est utilisée pour adapter les messages au rôle choisi par l'utilisateur
 */
function getUserRoleDescription(roleId: string): string {
  switch (roleId) {
    case 'rssi':
      return "Responsable de la Sécurité des Systèmes d'Information (RSSI)";
    
    case 'hacker':
      return "Hacker éthique, expert en tests d'intrusion et sécurité";
    
    case 'developpeur':
      return "Développeur sensibilisé aux vulnérabilités logicielles";
    
    case 'admin':
      return "Administrateur Système, gestionnaire de l'infrastructure sécurisée";
    
    case 'consultant':
      return "Consultant en cybersécurité, spécialiste des audits de sécurité";
    
    default:
      return "expert en cybersécurité";
  }
}

/**
 * Définir une personnalité pour l'interlocuteur principal en fonction de son rôle
 * et du stade de la conversation pour simuler l'évolution des tensions
 */
function getPersonalityTrait(role: string, name: string, stage: number = 0) {
  // Base de personnalité qui varie selon le rôle professionnel
  let basePersonality = "";
  
  // Personnalités de base par rôle
  if (role.toLowerCase().includes("président") || role.toLowerCase().includes("directeur général") || role.toLowerCase().includes("dg")) {
    basePersonality = stage <= 1 
      ? "pragmatique, orienté résultats, s'intéresse à l'impact business et à l'image de l'entreprise" 
      : "autoritaire, impatient, focalisé sur les conséquences pour la réputation et les finances, interrompt souvent avec des questions directes sur les délais et les impacts business. Peut contredire les experts techniques s'ils sont trop lents à agir.";
  } 
  else if (role.toLowerCase().includes("marketing") || role.toLowerCase().includes("communication")) {
    basePersonality = stage <= 1
      ? "dynamique, soucieux de l'image de l'entreprise, s'intéresse à la communication de crise"
      : "anxieux concernant l'image de l'entreprise, insiste constamment pour communiquer rapidement vers l'extérieur même sans toutes les informations, en conflit avec les recommandations techniques qui demandent plus de temps.";
  } 
  else if (role.toLowerCase().includes("rh") || role.toLowerCase().includes("ressources humaines")) {
    basePersonality = stage <= 1
      ? "attentif au facteur humain, préoccupé par l'impact sur les collaborateurs"
      : "inquiet des conséquences internes, s'oppose aux mesures techniques trop strictes qui impactent les employés, rappelle constamment les aspects légaux et sociaux en conflit avec l'urgence technique.";
  } 
  else if (role.toLowerCase().includes("financier") || role.toLowerCase().includes("cfo") || role.toLowerCase().includes("daf")) {
    basePersonality = stage <= 1
      ? "analytique, préoccupé par les coûts et les risques financiers"
      : "extrêmement réticent à approuver des dépenses d'urgence, exige systématiquement des justifications chiffrées avant toute action coûteuse, s'oppose aux solutions onéreuses même si elles sont techniquement optimales. En situation de crise, il peut bloquer des décisions urgentes pour des raisons budgétaires.";
  } 
  else if (role.toLowerCase().includes("technique") || role.toLowerCase().includes("cto") || role.toLowerCase().includes("informatique") || role.toLowerCase().includes("dsi")) {
    basePersonality = stage <= 1
      ? "technique, précis, s'intéresse aux détails d'implémentation"
      : "très technique dans son langage, frustré par l'incompréhension des autres dirigeants, insiste pour des solutions parfaites techniquement même si elles prennent plus de temps ou coûtent plus cher. Peut s'opposer directement au DG et au CFO s'ils privilégient des solutions rapides mais imparfaites.";
  } 
  else if (role.toLowerCase().includes("juridique") || role.toLowerCase().includes("légal") || role.toLowerCase().includes("conformité")) {
    basePersonality = stage <= 1
      ? "prudent, méthodique, attentif aux aspects réglementaires et contractuels"
      : "extrêmement prudent, refuse catégoriquement certaines actions même urgentes pour des raisons légales, exige des validations écrites et des procédures complètes même en situation critique, en conflit direct avec les besoins d'action rapide.";
  }
  else if (role.toLowerCase().includes("sécurité") || role.toLowerCase().includes("rssi")) {
    basePersonality = stage <= 1
      ? "vigilant, méthodique, focalise sur les procédures de sécurité et l'analyse des menaces"
      : "très technique et alarmiste, insiste sur des mesures de sécurité maximales qui peuvent paralyser l'entreprise, en désaccord avec les compromis business, utilise un jargon technique parfois incompréhensible pour les autres.";
  }
  else if (role.toLowerCase().includes("opérations") || role.toLowerCase().includes("production")) {
    basePersonality = stage <= 1
      ? "pragmatique, orienté continuité de service, préoccupé par l'impact opérationnel"
      : "obsédé par le maintien de l'activité à tout prix, peut s'opposer aux mesures de sécurité qui ralentissent la production, impatient face aux analyses techniques détaillées, pousse pour des solutions de contournement rapides.";
  }  
  else if (name === "Eddy MISSONI IDEMBI") {
    basePersonality = "créatif, innovant, passionné par les solutions technologiques, mais peut devenir impatient face à des approches trop conventionnelles";
  } 
  else {
    basePersonality = stage <= 1
      ? "professionnel, direct, cherchant une expertise pointue"
      : "stressé par la situation, communique de façon plus directe et parfois abrupte, peut remettre en question les décisions précédentes si la situation se dégrade.";
  }
  
  // Ajout de traits de personnalité spécifiques au stade de crise
  let stageModifier = "";
  if (stage >= 3) {
    stageModifier = "\n\nEn situation de crise extrême, cette personne devient tendue, interrompt fréquemment les autres, peut couper la parole, utilise des phrases courtes et directes, et exprime ouvertement son désaccord avec les autres membres de l'équipe. Les messages doivent inclure ces interactions conflictuelles et ces interruptions.";
  } else if (stage >= 2) {
    stageModifier = "\n\nSous pression, cette personne devient plus directive, moins patiente, et exprime plus clairement ses désaccords et ses priorités contradictoires avec celles des autres personnes impliquées.";
  }
  
  return basePersonality + stageModifier;
}

/**
 * Définir le niveau d'urgence du problème en fonction du domaine, de la difficulté et de l'étape actuelle
 */
function getUrgencyLevel(domain: string, difficulty: string, stage: number = 0) {
  // Plus l'étape avance, plus l'urgence augmente
  const stageMultiplier = Math.min(stage, 3) * 0.25; // 0, 0.25, 0.5, 0.75
  
  let baseUrgency = 0;
  if (domain.toLowerCase().includes("crise") || domain.toLowerCase().includes("incident")) {
    baseUrgency = 0.75; // Déjà élevé
  } else if (difficulty === "Expert") {
    baseUrgency = 0.5;  // Modéré à élevé
  } else if (difficulty === "Intermédiaire") {
    baseUrgency = 0.25; // Normal à modéré
  } else {
    baseUrgency = 0;    // Normal
  }
  
  // Calculer l'urgence totale et la limiter entre 0 et 1
  const urgencyScore = Math.min(Math.max(baseUrgency + stageMultiplier, 0), 1);
  
  // Transformer en texte
  if (urgencyScore >= 0.75) {
    return "élevé, nécessitant une réponse rapide";
  } else if (urgencyScore >= 0.5) {
    return "modéré, avec un certain sentiment d'urgence";
  } else if (urgencyScore >= 0.25) {
    return "modéré, avec un délai raisonnable pour répondre";
  } else {
    return "normal, permettant une réflexion approfondie";
  }
}

/**
 * Définir la situation du scénario en fonction de l'étape actuelle
 */
function getScenarioSituation(stage: number = 0) {
  if (stage === 0) {
    return "initiale, où un problème vient d'être détecté et nécessite une première analyse";
  } else if (stage === 1) {
    return "en développement, où le problème commence à révéler sa complexité et ses implications";
  } else if (stage === 2) {
    return "critique, où des décisions importantes doivent être prises rapidement avec des enjeux significatifs";
  } else {
    return "d'escalade, où la situation devient de plus en plus complexe avec des pressions internes et externes";
  }
}

/**
 * Génère un document HTML formaté pour la synthèse d'audition
 */
function generateSynthesisHtml(
  domain: 'cyber' | 'amoa', 
  synthesis: any, 
  candidateName: string, 
  profileType: string, 
  experienceLevel: string,
  sectorFocus?: string
): string {
  // Récupérer les données de synthèse
  const {
    presentation = "Information non disponible",
    parcours = "Information non disponible",
    impressions = "Information non disponible",
    motivations = "Information non disponible",
    projet = "Information non disponible",
    potentiel = "Information non disponible",
    criteres = "Information non disponible",
    forces = "Information non disponible",
    faiblesses = "Information non disponible",
    anglais = "",
    stage = "",
    processus = "",
    synthese = "Information non disponible",
    raison = "Information non disponible"
  } = synthesis;

  // Formater le type de profil et niveau d'expérience
  const formattedProfileType = profileType.replace(/_/g, ' ');
  const formattedExperienceLevel = experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1);

  // Créer le document HTML
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synthèse d'audition - ${candidateName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #006a9e;
    }
    .logo {
      width: 120px;
      margin-bottom: 15px;
    }
    .section {
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f5f8fa;
      border-radius: 5px;
    }
    .section-title {
      color: #006a9e;
      margin-top: 0;
      font-size: 18px;
      font-weight: bold;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .meta-info {
      background-color: #e8f4f8;
      padding: 10px 15px;
      border-radius: 5px;
      margin-bottom: 25px;
    }
    .meta-info p {
      margin: 5px 0;
    }
    .two-columns {
      display: flex;
      gap: 20px;
    }
    .column {
      flex: 1;
    }
    .strengths {
      background-color: #e8f5e9;
    }
    .weaknesses {
      background-color: #fff8e1;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    @media print {
      body {
        padding: 0;
      }
      .section, .meta-info {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Synthèse d'audition client</h1>
    <h2>${candidateName}</h2>
  </div>

  <div class="meta-info">
    <p><strong>Consultant:</strong> ${candidateName}</p>
    <p><strong>Domaine:</strong> ${domain === 'cyber' ? 'Cybersécurité' : 'AMOA'}</p>
    <p><strong>Profil:</strong> ${formattedProfileType} - ${formattedExperienceLevel}</p>
    ${domain === 'amoa' && sectorFocus ? `<p><strong>Secteur:</strong> ${sectorFocus.replace(/_/g, ' ')}</p>` : ''}
    <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>

  <div class="section">
    <h3 class="section-title">1. Présentation générale du profil</h3>
    <p>${presentation}</p>
  </div>

  <div class="section">
    <h3 class="section-title">2. Description du parcours</h3>
    <p>${parcours}</p>
  </div>

  <div class="section">
    <h3 class="section-title">3. Premières impressions, posture</h3>
    <p>${impressions}</p>
  </div>

  <div class="section">
    <h3 class="section-title">4. Motivations conseil, SI, mc2i</h3>
    <p>${motivations}</p>
  </div>

  <div class="section">
    <h3 class="section-title">5. Projet professionnel et perspectives</h3>
    <p>${projet}</p>
  </div>

  <div class="section">
    <h3 class="section-title">6. Potentiel du candidat vs Ambition</h3>
    <p>${potentiel}</p>
  </div>

  ${processus ? `
  <div class="section">
    <h3 class="section-title">7. Autres processus en cours</h3>
    <p>${processus}</p>
  </div>
  ` : ''}

  <div class="section">
    <h3 class="section-title">7. Critères d'évaluation</h3>
    <p>${criteres}</p>
  </div>

  <div class="two-columns">
    <div class="section column strengths">
      <h3 class="section-title">8. Forces</h3>
      <p>${forces}</p>
    </div>
    
    <div class="section column weaknesses">
      <h3 class="section-title">9. Faiblesses</h3>
      <p>${faiblesses}</p>
    </div>
  </div>

  ${anglais ? `
  <div class="section">
    <h3 class="section-title">Niveau d'Anglais</h3>
    <p>${anglais}</p>
  </div>
  ` : ''}

  ${stage ? `
  <div class="section">
    <h3 class="section-title">Informations stagiaire/alternant</h3>
    <p>${stage}</p>
  </div>
  ` : ''}

  <div class="section">
    <h3 class="section-title">10. Synthèse écrite</h3>
    <p>${synthese}</p>
  </div>

  <div class="section">
    <h3 class="section-title">11. Raison principale de la décision</h3>
    <p>${raison}</p>
  </div>

  <div class="footer">
    <p>Document généré automatiquement par la plateforme FYNE - mc2i</p>
    <p>© ${new Date().getFullYear()} mc2i. Tous droits réservés.</p>
  </div>
</body>
</html>`;
}

// Les fonctions pour les pièces jointes sont déjà importées en haut du fichier

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration des sessions
  const pgSession = connectPg(session);
  app.use(session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
    name: 'fyne.sid',
    secret: process.env.SESSION_SECRET || 'votre-secret-session-ultra-securise-changez-moi',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));


  // Tracking LLM — injecte userId/feature dans AsyncLocalStorage pour chaque requête API
  app.use('/api', llmTrackingMiddleware);

  // Routes d'authentification
  app.post('/api/auth/login', AuthController.login);
  app.post('/api/auth/logout', AuthController.logout);
  app.get('/api/auth/check', AuthController.checkAuth);
  app.get('/api/auth/sso-status', async (_req, res) => {
    try {
      const { db: _db } = await import('./db');
      const { ssoConfig: ssoTable } = await import('@shared/schema');
      const [cfg] = await _db.select({ isEnabled: ssoTable.isEnabled }).from(ssoTable).limit(1);
      res.json({ enabled: cfg?.isEnabled ?? false });
    } catch { res.json({ enabled: false }); }
  });

  // Routes admin (protégées par rôle admin)
  app.get('/api/admin/users', AuthController.requireAuth, AuthController.requireAdmin, AdminController.listUsers);
  app.post('/api/admin/users', AuthController.requireAuth, AuthController.requireAdmin, AdminController.createUser);
  app.patch('/api/admin/users/:id/toggle', AuthController.requireAuth, AuthController.requireAdmin, AdminController.toggleUser);
  app.post('/api/admin/users/:id/reset-password', AuthController.requireAuth, AuthController.requireAdmin, AdminController.resetPassword);
  app.delete('/api/admin/users/:id', AuthController.requireAuth, AuthController.requireAdmin, AdminController.deleteUser);
  app.get('/api/admin/stats', AuthController.requireAuth, AuthController.requireAdmin, AdminController.getStats);
  app.get('/api/admin/users/:id/report', AuthController.requireAuth, AuthController.requireAdmin, AdminController.exportUserPDF);
  app.get('/api/admin/llm-usage', AuthController.requireAuth, AuthController.requireAdmin, AdminController.getLlmUsage);
  app.patch('/api/admin/users/:id/modules', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const adminUser = (req.session as any).user;
    const { modulesEnabled } = req.body; // string[] ou null
    try {
      // l'admin ne peut accorder que ses propres modules
      const adminModules: string[] = adminUser?.modulesEnabled ?? [];
      const filtered = Array.isArray(modulesEnabled)
        ? (modulesEnabled as string[]).filter((m: string) => adminModules.includes(m))
        : null;
      const result = await pool.query(
        `UPDATE users SET modules_enabled = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [filtered, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      res.json({ success: true });
    } catch (err) {
      console.error('[admin] patch modules error:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  });

  // Routes SSO (publiques : login + callback)
  app.get('/auth/sso/login', SsoAuthController.initiateLogin);
  app.get('/auth/sso/callback', SsoAuthController.handleCallback);

  // Routes SSO (admin : config)
  app.get('/api/admin/sso', AuthController.requireAuth, AuthController.requireAdmin, SsoAdminController.getConfig);
  app.post('/api/admin/sso', AuthController.requireAuth, AuthController.requireAdmin, SsoAdminController.saveConfig);
  app.post('/api/admin/sso/test', AuthController.requireAuth, AuthController.requireAdmin, SsoAdminController.testConfig);

  // ── Admin client-companies / client-users routes ─────────────────────────────
  app.get('/api/admin/client-companies', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    try {
      let result;
      if (user.role === 'superadmin') {
        result = await pool.query(`SELECT c.*, COUNT(u.id)::text AS total_users, COUNT(u.id) FILTER (WHERE u.is_active) ::text AS active_users FROM companies c LEFT JOIN users u ON u.company_id = c.id GROUP BY c.id ORDER BY c.created_at DESC`);
      } else {
        result = await pool.query(`SELECT c.*, COUNT(u.id)::text AS total_users, COUNT(u.id) FILTER (WHERE u.is_active)::text AS active_users FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.id = $1 GROUP BY c.id`, [user.companyId]);
      }
      res.json({ success: true, companies: result.rows });
    } catch (err) { console.error('[AdminClient] list companies:', err); res.status(500).json({ success: false }); }
  });

  app.post('/api/admin/client-companies', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    if (user.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Réservé au superadmin' });
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Nom requis' });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      const r = await pool.query(`INSERT INTO companies (name, slug) VALUES ($1, $2) RETURNING *`, [name.trim(), slug]);
      res.json({ success: true, company: r.rows[0] });
    } catch (err: any) {
      if (err.code === '23505') return res.status(409).json({ success: false, message: 'Ce slug existe déjà' });
      console.error('[AdminClient] create company:', err); res.status(500).json({ success: false });
    }
  });

  app.patch('/api/admin/client-companies/:id/toggle', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const r = await pool.query(`UPDATE companies SET is_active = NOT is_active WHERE id = $1 RETURNING *`, [id]);
      res.json({ success: true, company: r.rows[0] });
    } catch (err) { console.error('[AdminClient] toggle company:', err); res.status(500).json({ success: false }); }
  });

  app.patch('/api/admin/client-companies/:id/config', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { modules_enabled, token_quota } = req.body;
    try {
      const r = await pool.query(
        `UPDATE companies SET modules_enabled = COALESCE($1, modules_enabled) WHERE id = $2 RETURNING *`,
        [modules_enabled ? JSON.stringify(modules_enabled) : null, id]
      );
      res.json({ success: true, company: r.rows[0] });
    } catch (err) { console.error('[AdminClient] config company:', err); res.status(500).json({ success: false }); }
  });

  app.delete('/api/admin/client-companies/:id', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    if (user.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Réservé au superadmin' });
    const id = parseInt(req.params.id);
    try {
      await pool.query(`UPDATE users SET company_id = NULL WHERE company_id = $1`, [id]);
      await pool.query(`DELETE FROM companies WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) { console.error('[AdminClient] delete company:', err); res.status(500).json({ success: false }); }
  });

  app.get('/api/admin/client-users', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    const companyId = parseInt(req.query.companyId as string);
    if (user.role !== 'superadmin' && user.companyId !== companyId) return res.status(403).json({ success: false });
    try {
      const r = await pool.query(`SELECT id, company_id, username, email, first_name, last_name, role, is_active, score, exercices_realises, taux_reussite, niveau, badges, last_login, created_at FROM users WHERE company_id = $1 ORDER BY created_at DESC`, [companyId]);
      res.json({ success: true, users: r.rows });
    } catch (err) { console.error('[AdminClient] list users:', err); res.status(500).json({ success: false }); }
  });

  app.post('/api/admin/client-users', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    const { companyId, email, password, firstName, lastName, role } = req.body;
    if (user.role !== 'superadmin' && user.companyId !== companyId) return res.status(403).json({ success: false });
    if (!email || !password) return res.status(400).json({ success: false, message: 'email et password requis' });
    try {
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash(password, 10);
      const username = email.split('@')[0] + '_' + Date.now();
      const r = await pool.query(`INSERT INTO users (username, email, password, first_name, last_name, role, company_id, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING id, username, email, first_name, last_name, role, is_active, created_at`, [username, email, hashed, firstName || null, lastName || null, role || 'user', companyId]);
      res.json({ success: true, user: r.rows[0] });
    } catch (err: any) {
      if (err.code === '23505') return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
      console.error('[AdminClient] create user:', err); res.status(500).json({ success: false });
    }
  });

  app.patch('/api/admin/client-users/:id/toggle', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const r = await pool.query(`UPDATE users SET is_active = NOT is_active, updated_at = now() WHERE id = $1 RETURNING id, is_active`, [id]);
      res.json({ success: true, user: r.rows[0] });
    } catch (err) { console.error('[AdminClient] toggle user:', err); res.status(500).json({ success: false }); }
  });

  app.post('/api/admin/client-users/:id/reset-password', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Mot de passe trop court' });
    try {
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query(`UPDATE users SET password = $1, updated_at = now() WHERE id = $2`, [hashed, id]);
      res.json({ success: true });
    } catch (err) { console.error('[AdminClient] reset pwd:', err); res.status(500).json({ success: false }); }
  });

  app.patch('/api/admin/client-users/:id/move', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const user = (req.session as any).user;
    if (user.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Réservé au superadmin' });
    const id = parseInt(req.params.id);
    const { newCompanyId } = req.body;
    if (!newCompanyId) return res.status(400).json({ success: false, message: 'newCompanyId requis' });
    try {
      const r = await pool.query(`UPDATE users SET company_id = $1, updated_at = now() WHERE id = $2 RETURNING id, username, email, company_id`, [newCompanyId, id]);
      res.json({ success: true, user: r.rows[0] });
    } catch (err) { console.error('[AdminClient] move user:', err); res.status(500).json({ success: false }); }
  });

  app.delete('/api/admin/client-users/:id', AuthController.requireAuth, AuthController.requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) { console.error('[AdminClient] delete user:', err); res.status(500).json({ success: false }); }
  });

  // ── Super Admin routes ────────────────────────────────────────────────────────
  app.get('/api/superadmin/users', AuthController.requireAuth, SuperAdminController.listUsers);
  app.post('/api/superadmin/users', AuthController.requireAuth, SuperAdminController.createUser);
  app.patch('/api/superadmin/users/:id/role', AuthController.requireAuth, SuperAdminController.updateRole);
  app.patch('/api/superadmin/users/:id/subscription', AuthController.requireAuth, SuperAdminController.updateSubscription);
  app.post('/api/superadmin/users/:id/reset-tokens', AuthController.requireAuth, SuperAdminController.resetTokens);
  app.patch('/api/superadmin/users/:id/toggle', AuthController.requireAuth, SuperAdminController.toggleUser);
  app.delete('/api/superadmin/users/:id', AuthController.requireAuth, SuperAdminController.deleteUser);
  app.get('/api/superadmin/token-stats', AuthController.requireAuth, SuperAdminController.tokenStats);

  // ── Superadmin: System Health (local exec — server runs on EC2) ──────────
  app.get('/api/superadmin/system-health', async (req: Request, res: Response) => {
    if (req.session?.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { exec } = await import('child_process');
    const execAsync = (cmd: string): Promise<string> =>
      new Promise((resolve) => {
        exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
          resolve((stdout || stderr || '').trim());
        });
      });

    try {
      const [diskOut, memOut, cpuOut, dockerOut, dockerImgList, uptimeOut, appOut, npmOut] = await Promise.all([
        execAsync("df -h / | tail -1"),
        execAsync("free -m | grep Mem"),
        execAsync("top -bn1 | grep 'Cpu(s)' | head -1"),
        execAsync("docker system df 2>/dev/null || echo 'docker-unavailable'"),
        execAsync("docker images --format '{{.Repository}}:{{.Tag}}\\t{{.Size}}\\t{{.CreatedAt}}\\t{{.ID}}' 2>/dev/null || echo ''"),
        execAsync("uptime"),
        execAsync("docker ps --format '{{.Names}}\t{{.Status}}\t{{.Image}}' 2>/dev/null || pm2 list 2>/dev/null || echo 'no-containers'"),
        execAsync("du -sh /root/.npm 2>/dev/null || echo '0\t-'"),
      ]);

      // Disk: /dev/nvme0n1p1  32G  5.2G  27G  16% /
      const diskParts = diskOut.trim().split(/\s+/);
      const disk = {
        total:   diskParts[1] ?? '',
        used:    diskParts[2] ?? '',
        avail:   diskParts[3] ?? '',
        usedPct: parseInt((diskParts[4] ?? '0').replace('%', ''), 10),
      };

      // Memory: Mem:  total  used  free  shared  buff/cache  available
      const memParts = memOut.trim().split(/\s+/);
      const memTotal = parseInt(memParts[1] ?? '0', 10);
      const memUsed  = parseInt(memParts[2] ?? '0', 10);
      const memory = {
        total:   memTotal,
        used:    memUsed,
        free:    parseInt(memParts[3] ?? '0', 10),
        usedPct: Math.round(memUsed / (memTotal || 1) * 100),
      };

      // CPU: %Cpu(s):  2.1 us,  0.5 sy,  0.0 ni, 97.4 id
      const cpuUser   = parseFloat(cpuOut.match(/(\d+[\.,]\d+)\s+us/)?.[1]?.replace(',', '.') ?? '0');
      const cpuSystem = parseFloat(cpuOut.match(/(\d+[\.,]\d+)\s+sy/)?.[1]?.replace(',', '.') ?? '0');
      const cpuIdle   = parseFloat(cpuOut.match(/(\d+[\.,]\d+)\s+id/)?.[1]?.replace(',', '.') ?? '0');
      const cpu = { user: cpuUser, system: cpuSystem, idle: cpuIdle };

      // Docker df output — skip header line
      const dockerLines = dockerOut.split('\n').filter(l => l && !l.startsWith('TYPE') && !l.includes('docker-unavailable'));
      const dockerMap: Record<string, string> = {};
      for (const dl of dockerLines) {
        const parts = dl.trim().split(/\s{2,}/);
        if (parts[0]) dockerMap[parts[0].toLowerCase()] = parts[2] ?? '0B';
      }
      const dockerImageList = dockerImgList
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const [name, size, createdAt, id] = line.split('\t');
          return { name: name ?? '', size: size ?? '', createdAt: createdAt ?? '', id: (id ?? '').slice(0, 12) };
        });
      const docker = {
        images:     dockerMap['images']      ?? '0B',
        imageCount: dockerImageList.length,
        containers: dockerMap['containers']  ?? '0B',
        buildCache: dockerMap['build cache'] ?? '0B',
        imageList:  dockerImageList,
      };

      // App processes (docker ps or pm2)
      const appLines = appOut.split('\n').filter(Boolean).filter(l => !l.includes('no-containers'));
      const app = appLines.map(l => {
        const [name, status, image] = l.split('\t');
        return { name: name ?? l, status: status ?? 'running', image: image ?? '' };
      });

      // npm cache size
      const npmCache = npmOut.split('\t')[0].trim();

      return res.json({
        success: true,
        disk,
        memory,
        cpu,
        docker,
        uptime: uptimeOut,
        app,
        npmCache,
        checkedAt: new Date().toISOString(),
      });

    } catch (err: any) {
      console.error('[system-health] error:', err?.message ?? err);
      return res.status(500).json({ success: false, error: err?.message ?? 'exec error' });
    }
  });

  // ── Superadmin: System Action (local exec — server runs on EC2) ──────────
  app.post('/api/superadmin/system-action', async (req: Request, res: Response) => {
    if (req.session?.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { action } = req.body as { action?: string };
    const ALLOWED_ACTIONS: Record<string, string> = {
      'docker-prune':    'docker system prune -f 2>&1 && echo "OK"',
      'restart-app':     'pm2 restart all 2>&1 && echo "OK"',
      'clear-npm-cache': 'rm -rf /root/.npm/_cacache 2>&1 && echo "OK"',
    };

    if (!action || !ALLOWED_ACTIONS[action]) {
      return res.status(400).json({
        success: false,
        error: `Unknown action. Allowed: ${Object.keys(ALLOWED_ACTIONS).join(', ')}`,
      });
    }

    const { exec } = await import('child_process');

    try {
      const output = await new Promise<string>((resolve, reject) => {
        exec(ALLOWED_ACTIONS[action], { timeout: 30000 }, (err, stdout, stderr) => {
          if (err && !stdout) return reject(err);
          resolve((stdout || stderr || '').trim());
        });
      });

      return res.json({ success: true, output });

    } catch (err: any) {
      console.error('[system-action] error:', err?.message ?? err);
      return res.status(500).json({ success: false, error: err?.message ?? 'exec error' });
    }
  });

  // ── Superadmin: CPU live stream (SSE — push toutes les 3s) ──────────────
  app.get('/api/superadmin/cpu-stream', (req: Request, res: Response) => {
    if (req.session?.user?.role !== 'superadmin') {
      return res.status(403).end();
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { exec } = require('child_process');
    const send = () => {
      exec(
        "top -bn1 | grep 'Cpu(s)' | head -1 && free -m | grep Mem | awk '{print $2,$3}' && cat /proc/loadavg",
        { timeout: 5000 },
        (err: any, stdout: string) => {
          if (err) return;
          const lines = stdout.trim().split('\n');
          const cpuLine = lines[0] ?? '';
          const memLine = lines[1] ?? '';
          const loadLine = lines[2] ?? '';
          const user   = parseFloat(cpuLine.match(/(\d+[\.,]\d+)\s+us/)?.[1]?.replace(',', '.') ?? '0');
          const sys    = parseFloat(cpuLine.match(/(\d+[\.,]\d+)\s+sy/)?.[1]?.replace(',', '.') ?? '0');
          const idle   = parseFloat(cpuLine.match(/(\d+[\.,]\d+)\s+id/)?.[1]?.replace(',', '.') ?? '100');
          const [memTotal, memUsed] = memLine.trim().split(' ').map(Number);
          const [load1, load5] = loadLine.trim().split(' ');
          const payload = JSON.stringify({
            ts: Date.now(),
            cpu: { user, sys, idle, used: Math.round((user + sys) * 10) / 10 },
            mem: { total: memTotal ?? 0, used: memUsed ?? 0, pct: Math.round((memUsed ?? 0) / ((memTotal ?? 1) || 1) * 100) },
            load: { m1: parseFloat(load1 ?? '0'), m5: parseFloat(load5 ?? '0') },
          });
          res.write(`data: ${payload}\n\n`);
        }
      );
    };

    send();
    const interval = setInterval(send, 3000);
    req.on('close', () => clearInterval(interval));
  });

  // Permissions utilisateur connecté (modules activés)
  app.get('/api/auth/permissions', AuthController.requireAuth, (req: Request, res: Response) => {
    const session = req.session as any;
    const user = session?.user;
    res.json({
      success: true,
      modulesEnabled: user?.modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'],
      permissions: user?.permissions ?? [],
      tokenQuota: user?.tokenQuota ?? 100000,
      tokenUsedMonth: user?.tokenUsedMonth ?? 0,
      subscriptionLabel: user?.subscriptionLabel ?? 'Gratuit',
      role: user?.role ?? 'user',
    });
  });

  // Middleware pour protéger toutes les autres routes
  app.use('/api', (req: Request, res: Response, next: any) => {
    // Exclure les routes d'authentification et le portail client
    if (req.path.startsWith('/auth/')) {
      return next();
    }
    return AuthController.requireAuth(req, res, next);
  });

  // ── Contrôle d'accès par module ─────────────────────────────────────────────
  // Chaque préfixe d'API est lié à un module ; si l'utilisateur n'a pas le module
  // dans modulesEnabled, la requête est rejetée avec 403.
  const cyberGuard      = AuthController.requireModule('cyber');
  const dataGuard       = AuthController.requireModule('data');
  const amoaGuard       = AuthController.requireModule('amoa');
  const formationGuard  = AuthController.requireModule('formation-data');
  const evaluationGuard = AuthController.requireModule('evaluation');
  const playgroundGuard = AuthController.requireModule('playground');

  app.use('/api/cyber',              cyberGuard);
  app.use('/api/cyber-expert',       cyberGuard);
  app.use('/api/cyber-pulse',        cyberGuard);
  app.use('/api/cyber-investigator', cyberGuard);
  app.use('/api/cyberchaos',         cyberGuard);
  app.use('/api/cyber-defense',      cyberGuard);

  app.use('/api/data-ia',            dataGuard);
  app.use('/api/data-academie',      dataGuard);

  app.use('/api/amoa',               amoaGuard);

  app.use('/api/formation',          formationGuard);

  app.use('/api/evaluation',         evaluationGuard);

  app.use('/api/playground',         playgroundGuard);
  app.use('/api/module-generator',   playgroundGuard);
  // ── Fin contrôle d'accès par module ─────────────────────────────────────────

  // ── Contrôle du quota de tokens ──────────────────────────────────────────────
  // Bloque les appels LLM si l'utilisateur a épuisé son quota mensuel.
  // Exclut les admins/superadmins et les routes non-LLM (admin, auth, status).
  const { checkTokenQuota } = await import('./services/llmTracker');
  const LLM_PREFIXES = [
    '/api/cyber', '/api/cyber-expert', '/api/cyber-pulse', '/api/cyber-investigator',
    '/api/cyberchaos', '/api/cyber-defense', '/api/data-ia', '/api/data-academie',
    '/api/amoa', '/api/formation', '/api/evaluation', '/api/playground', '/api/module-generator',
    '/api/pentest',
  ];
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const session = (req as any).session?.user;
    if (!session) return next();
    if (session.role === 'admin' || session.role === 'superadmin') return next();
    const isLlmRoute = LLM_PREFIXES.some(p => req.path.startsWith(p));
    if (!isLlmRoute) return next();
    try {
      const quota = await checkTokenQuota(session.id);
      if (!quota.allowed) {
        return res.status(429).json({
          success: false,
          quotaExceeded: true,
          message: `Vous avez atteint votre quota de ${quota.tokenQuota.toLocaleString()} tokens pour ce mois. Contactez votre administrateur pour augmenter votre quota.`,
          tokenUsedMonth: quota.tokenUsedMonth,
          tokenQuota: quota.tokenQuota,
        });
      }
    } catch (e) {
      // Non bloquant — on laisse passer en cas d'erreur DB
    }
    next();
  });
  // ── Fin contrôle quota tokens ────────────────────────────────────────────────

  // Routes pour l'IA de pentest et les défis dynamiques
  const { generateChallenge, analyzeSolution, getCustomHint } = await import("./controllers/pentestAIController").then(module => module.default);
  
  app.post('/api/pentest/generate-challenge', (req, res) => generateChallenge(req, res));
  app.post('/api/pentest/analyze-solution', (req, res) => analyzeSolution(req, res));
  app.post('/api/pentest/get-custom-hint', (req, res) => getCustomHint(req, res));
  
  // Routes pour le générateur d'outils de cybersécurité
  app.post("/api/tool-generator/generate", (req: Request, res: Response) => {
    generateCustomTool(req, res);
  });
  
  // Routes pour le générateur de modules
  app.post("/api/module-generator/generate", (req: Request, res: Response) => {
    generateModule(req, res);
  });
  
  app.post("/api/module-generator/save", (req: Request, res: Response) => {
    saveCustomModule(req, res);
  });
  
  // Routes pour DATA ACADÉMIE
  app.get("/api/data-academie/modules", (req: Request, res: Response) => {
    dataAcademieController.getModules(req, res);
  });
  
  app.post("/api/data-academie/modules/generate", (req: Request, res: Response) => {
    dataAcademieController.generateNewModule(req, res);
  });
  
  app.get("/api/data-academie/modules/:id", (req: Request, res: Response) => {
    dataAcademieController.getOrGenerateModule(req, res);
  });
  
  app.post("/api/data-academie/quiz/feedback", (req: Request, res: Response) => {
    dataAcademieController.generateQuizFeedback(req, res);
  });
  
  app.post("/api/data-academie/code/evaluate", (req: Request, res: Response) => {
    dataAcademieController.evaluateCodeSubmission(req, res);
  });
  
  app.get("/api/module-generator/modules", (req: Request, res: Response) => {
    getCustomModules(req, res);
  });
  
  app.get("/api/module-generator/modules/:id", (req: Request, res: Response) => {
    getCustomModuleById(req, res);
  });

  // Route pour supprimer un module personnalisé
  app.delete("/api/module-generator/modules/:id", (req: Request, res: Response) => {
    deleteCustomModule(req, res);
  });
  
  // Routes pour le générateur de code
  app.post("/api/code-generator/generate", (req: Request, res: Response) => {
    generateCode(req, res);
  });
  
  // Route pour l'exécution de requêtes SQL dans les cours
  app.post("/api/execute-sql", (req: Request, res: Response) => {
    import('./controllers/sqlExecutionController').then(module => {
      module.executeSQL(req, res);
    }).catch(err => {
      console.error("Erreur lors du chargement du contrôleur SQL:", err);
      res.status(500).json({ error: "Erreur serveur lors de l'exécution SQL" });
    });
  });
  
  // Routes pour le module Bug Hunter
  app.get("/api/bug-hunter/challenges", (req: Request, res: Response) => {
    getChallenges(req, res);
  });
  
  app.get("/api/bug-hunter/challenge/:id", (req: Request, res: Response) => {
    getChallengeById(req, res);
  });
  
  // Cette route est utilisée par la page de défi individuel
  app.get("/api/bug-hunter/challenge", (req: Request, res: Response) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: "ID de défi requis" });
    }
    const req2 = { ...req, params: { id: id as string } };
    getChallengeById(req2, res);
  });
  
  app.get("/api/bug-hunter/user-stats", (req: Request, res: Response) => {
    getUserStats(req, res);
  });
  
  app.get("/api/bug-hunter/reports", (req: Request, res: Response) => {
    getUserReports(req, res);
  });
  
  app.get("/api/bug-hunter/report/:id", (req: Request, res: Response) => {
    getReportById(req, res);
  });
  
  app.post("/api/bug-hunter/reports", (req: Request, res: Response) => {
    submitBugReport(req, res);
  });
  
  app.get("/api/code-generator/history", (req: Request, res: Response) => {
    getCodeGenerationHistory(req, res);
  });
  
  app.post("/api/code-generator/save", (req: Request, res: Response) => {
    saveGeneratedCode(req, res);
  });
  
  app.post("/api/code-generator/prompt-examples", (req: Request, res: Response) => {
    generatePromptExamples(req, res);
  });
  
  app.post("/api/code-generator/execute", (req: Request, res: Response) => {
    executeGeneratedCode(req, res);
  });
  
  app.post("/api/code-generator/improve", (req: Request, res: Response) => {
    improveGeneratedCode(req, res);
  });
  
  app.post("/api/code-generator/suggest-language-framework", (req: Request, res: Response) => {
    suggestLanguageAndFramework(req, res);
  });
  // Servir les pièces jointes depuis le dossier public/attachments
  app.use('/attachments', express.static(path.join(__dirname, 'public/attachments')));
  
  // Enregistrer les routes pour les pièces jointes
  app.use('/api/attachments', attachmentRoutes);
  
  // Enregistrer les routes pour CyberForge Academy
  app.use('/api/ai', cyberForgeRoutes);
  
  // Enregistrer les routes pour les outils cyber
  app.use('/api/cyber/tools', cyberToolsRoutes);
  
  // Enregistrer les routes pour ProspectPulse
  app.use('/api/prospect-pulse', prospectPulseRoutes);
  
  // Enregistrer les routes pour l'audio
  app.use('/api/audio', audioRoutes);
  
  // Enregistrer les routes pour le Centre de Crise
  app.use('/api/crisis-center', crisisCenterRoutes);
  app.use('/api/code', codeExecutionRoutes);
  app.use('/api/formation', formationRoutes);
  app.use('/api/evaluation', evaluationRoutes);
  app.use('/api/companies', companyRoutes);
  // Module publish routes (mounted at /api/modules)
  app.use('/api/modules', modulePublishRoutes);

  // Routes pour l'exécution de code
  app.post('/api/code/execute/python', executePythonCode);
  app.post('/api/code/execute/sql', executeSQLCode);
  app.post('/api/code/session/reset', resetSessionVariables);
  
  // Routes pour DATA & IA ACADEMY
  app.post('/api/data-ia/generate-course', generateCourseContent);
  app.post('/api/data-ia/answer-question', answerQuestion);
  app.post('/api/data-ia/generate-quiz', generateDataIaQuiz);
  
  // Routes directes pour le simulateur de phishing (fallback en cas de problème d'importation)
  app.post('/api/cyber/tools/phishing-simulator', async (req: Request, res: Response) => {
    try {
      const { scenario, targetType, technique, complexity, includeAttachments, includeBranding } = req.body;

      if (!scenario || !targetType || !technique || !complexity) {
        return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
      }

      // Construire le prompt pour le simulateur de phishing
      const targetDescriptions: Record<string, string> = {
        general: "tous les employés de l'entreprise avec divers niveaux de compétences techniques",
        executive: "les cadres supérieurs et dirigeants de l'entreprise",
        it: "le personnel du service informatique avec des connaissances techniques avancées",
        finance: "le personnel du service financier gérant les opérations financières et les paiements",
        hr: "le personnel des ressources humaines gérant les informations des employés"
      };

      const techniqueDescriptions: Record<string, string> = {
        urgency: "créer un sentiment d'urgence pour pousser à l'action immédiate",
        curiosity: "susciter la curiosité pour inciter le destinataire à ouvrir une pièce jointe ou cliquer sur un lien",
        fear: "générer de la peur ou de l'anxiété pour pousser à une action rapide",
        reward: "offrir une récompense ou un avantage pour inciter à l'action",
        authority: "se faire passer pour une figure d'autorité pour obtenir la conformité",
        social: "utiliser la pression sociale ou la référence à des collègues pour encourager l'action"
      };

      const complexityDescriptions: Record<string, string> = {
        basic: "facile à détecter, avec des erreurs évidentes et des signaux d'alerte clairs",
        intermediate: "moyennement difficile à détecter, avec quelques subtilités mais des indices reconnaissables",
        advanced: "difficile à détecter, très sophistiqué avec peu d'indices évidents"
      };

      const attachmentNote = includeAttachments 
        ? "Inclus des références à des pièces jointes fictives (comme un PDF, un document Word ou un fichier ZIP) dans l'email."
        : "N'inclus pas de références à des pièces jointes dans l'email.";

      const brandingNote = includeBranding
        ? "Imite l'image de marque d'une entreprise ou d'un service légitime pour rendre l'email plus crédible."
        : "N'utilise pas d'imitation spécifique d'une marque existante.";

      const prompt = `
        Crée une simulation d'email de phishing éducatif basée sur le scénario suivant:
        
        """
        ${scenario}
        """
        
        Cible: ${targetDescriptions[targetType]}
        Technique principale: ${techniqueDescriptions[technique]}
        Niveau de complexité: ${complexityDescriptions[complexity]}
        
        Instructions spécifiques:
        - ${attachmentNote}
        - ${brandingNote}
        - Crée un email réaliste qui pourrait être utilisé dans une attaque de phishing.
        - L'objectif est éducatif: montrer comment ces emails fonctionnent pour sensibiliser et former.
        - Inclus des signaux d'alerte qui pourraient être identifiés par un utilisateur attentif.
        
        Réponds avec un objet JSON au format suivant:
        {
          "emailSubject": "Objet de l'email de phishing",
          "emailBody": "Corps complet de l'email, formaté de manière réaliste",
          "senderName": "Nom de l'expéditeur fictif",
          "senderEmail": "email.de.expediteur@exemple.com",
          "targetedVulnerabilities": ["Liste de 3-5 vulnérabilités psychologiques ciblées par cet email"],
          "warningFlags": ["Liste de 3-6 signaux d'alerte qui devraient faire suspecter un phishing"],
          "educationalPoints": ["Liste de 3-5 points éducatifs expliquant comment cet email fonctionne"],
          "difficultyLevel": 7 // Un nombre entre 1 et 10 indiquant la difficulté à détecter cette tentative
        }
        
        Le format doit être strictement JSON valide.
      `;
      
      const systemMessage = {
        role: 'system' as const,
        content: `Tu es un expert en cybersécurité spécialisé dans la sensibilisation au phishing et à l'ingénierie sociale. Ta mission est de créer des simulations d'emails de phishing réalistes à des fins éducatives, pour aider à former les employés à reconnaître et éviter les tentatives d'hameçonnage.`
      };
      
      const userMessage = {
        role: 'user' as const,
        content: prompt
      };
      
      // Utiliser le service OpenAI
      const response = await openAIService.getChatCompletion(
        [systemMessage, userMessage],
        0.7,
        1500
      );

      // Analyser la réponse JSON
      let responseData;
      try {
        // Nettoyer la réponse des délimiteurs Markdown
        let cleanResponse = response;
        
        // Supprimer les délimiteurs de bloc de code Markdown
        if (cleanResponse.includes('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n/g, '');
          cleanResponse = cleanResponse.replace(/```/g, '');
        }
        
        // Supprimer toute autre balise Markdown potentielle
        cleanResponse = cleanResponse.trim();
        
        responseData = JSON.parse(cleanResponse);
      } catch (error) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', error);
        console.error('Réponse brute:', response);
        return res.status(500).json({ error: 'Erreur lors de l\'analyse de la réponse' });
      }

      res.json(responseData);
    } catch (error) {
      console.error('Erreur lors de la génération de la simulation de phishing:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la simulation de phishing' });
    }
  });
  
  // Routes pour le module de test technique cybersécurité
  app.get('/api/cyber/test-technique/options', getTestOptions);
  app.post('/api/cyber/test-technique/generate', generateQuestions);
  app.post('/api/cyber/test-technique/evaluate', evaluateResponses);
  app.post('/api/cyber/test-technique/certificate', generateCertificate);
  app.post('/api/cyber/test-technique/analyze-results', analyzeTestResults);
  
  // Routes pour le test d'entretien cybersécurité
  app.post('/api/cyber/interview-test/evaluate', evaluateInterviewTest);
  app.post('/api/cyber/interview-test/generate-question', generateAdaptiveQuestion);
  app.post('/api/cyber/interview-test/generate-initial-question', generateInitialQuestion);
  
  // Routes pour le jeu BrainHacker (ingénierie sociale)
  app.post('/api/cyber/arcade/brain-hacker/simulate', simulateTargetResponse);
  app.post('/api/cyber/arcade/brain-hacker/analyze', analyzePerformance);
  
  // Routes pour le jeu Firewall Tactique
  app.post('/api/cyber/arcade/firewall-tactique/analyze', analyzeDefenseStrategy);
  app.post('/api/cyber/arcade/firewall-tactique/scenario', generateAttackScenario);
  app.post('/api/cyber/arcade/firewall-tactique/tips', generateTacticalTip);
  
  // Routes pour le jeu Cyber Escape: Le Pare-feu est tombé
  // Routes pour le jeu "Cyber Escape: Le Pare-feu est tombé" supprimées
  
  // Routes pour le jeu Cyber Snake
  app.get('/api/cyber/snake/practices', async (req: Request, res: Response) => {
    await generateCyberPractices(req, res);
  });
  
  // Routes pour CYBERASCENSION
  app.post('/api/cyber/ascension/analyze-response', async (req: Request, res: Response) => {
    await analyzeUserResponse(req, res);
  });
  
  app.get('/api/cyber/ascension/level/:id', async (req: Request, res: Response) => {
    await getLevelInfo(req, res);
  });
  
  app.post('/api/cyber/ascension/generate-scenario', async (req: Request, res: Response) => {
    await generateScenario(req, res);
  });
  
  app.post('/api/cyber/ascension/evaluate-performance', async (req: Request, res: Response) => {
    await evaluatePerformance(req, res);
  });
  
  app.post('/api/cyber/ascension/learning-recommendations', async (req: Request, res: Response) => {
    await generateLearningRecommendations(req, res);
  });
  
  // Routes pour Cyber Expert
  app.post('/api/cyber-expert/init', initCyberExpertSession);
  app.post('/api/cyber-expert/message', processCyberExpertMessage);
  app.post('/api/cyber-expert/end', terminateCyberExpertSession);
  app.post('/api/cyber-expert/decisions/start', startDecisionFlow);
  app.post('/api/cyber-expert/decisions/submit', submitDecision);
  app.post('/api/cyber-expert/decisions/status', checkDecisionStatus);
  
  // Routes pour AMOA Expert - Anciennes routes commentées au profit des nouvelles routes plus bas
  // app.post('/api/amoa-expert/init', initializeAmoaExpertSession);
  // app.post('/api/amoa-expert/message', processAmoaExpertMessage);
  // app.post('/api/amoa-expert/end', endAmoaExpertSession);
  // app.post('/api/amoa-expert/decisions/generate', generateAmoaDecisionScenario);
  // app.post('/api/amoa-expert/decisions/submit', processAmoaDecision);
  // app.post('/api/amoa-expert/decisions/status', checkDecisionModeStatus);
  
  // Routes pour les assistants personnalisés
  // Routes utilisateur
  app.post('/api/user/get-or-create', getOrCreateUser);
  app.get('/api/user/:userId', getUserById);
  
  // Route d'assistant cyber - seule route active pour le moment
  app.post('/api/custom-assistants/chat', chatWithCustomAssistant);
  
  /* 
  // Routes pour les assistants personnalisés - À IMPLÉMENTER PLUS TARD
  app.get('/api/assistants/templates', getAssistantTemplates);
  app.get('/api/assistants/templates/:templateId', getAssistantTemplate);
  app.get('/api/assistants/popular', getPopularAssistants);
  app.get('/api/assistants/user/:userId', getUserAssistants);
  app.post('/api/assistants', createAssistant);
  app.put('/api/assistants/:assistantId', updateAssistant);
  app.delete('/api/assistants/:assistantId', deleteAssistant);
  app.post('/api/assistants/conversation/init', initConversation);
  app.post('/api/assistants/conversation/message', sendMessage);
  app.get('/api/assistants/conversation/history/:conversationId', getConversationHistory);
  app.get('/api/assistants/conversation/history/session/:sessionId', getConversationHistory);
  
  // Routes pour la gestion des modèles et la détection des doublons - À IMPLÉMENTER PLUS TARD
  app.get('/api/assistants/duplicates/detect', detectDuplicates);
  app.post('/api/assistants/duplicates/merge', mergeTemplates);
  app.get('/api/assistants/search', searchSimilarAssistants);
  app.delete('/api/assistants/templates/:templateId', deleteTemplate);
  */
  
  // Routes pour le chatbot expert en cybersécurité (carte "Apprendre en échangeant")
  app.post('/api/cyber-expert/init', initCyberExpertSession);
  app.post('/api/cyber-expert/message', processCyberExpertMessage);
  app.post('/api/cyber-expert/terminate', terminateCyberExpertSession);
  
  // Routes pour CyberPULSE - chatbot ludique et interactif
  app.post('/api/cyber-pulse/init', initCyberPulseSession);
  app.post('/api/cyber-pulse/message', processCyberPulseMessage);
  app.post('/api/cyber-pulse/challenge', generateCyberChallenge);
  app.post('/api/cyber-pulse/check-inactivity', checkInactivity);
  app.post('/api/cyber-pulse/preferences', updateCyberPulsePreferences);
  app.post('/api/cyber-pulse/score', updatePlayerScore);
  app.post('/api/cyber-pulse/terminate', terminateCyberPulseSession);
  
  // Routes pour le flux de décision de l'expert cyber
  app.post('/api/cyber-expert/decisions/start', startDecisionFlow);
  app.post('/api/cyber-expert/decisions/submit', submitDecision);
  app.post('/api/cyber-expert/decisions/status', checkDecisionStatus);
  
  // Routes pour l'enquêteur cyber avec IA
  app.post('/api/cyber-investigator/analyze-evidence', analyzeEvidence);
  app.post('/api/cyber-investigator/get-hints', getInvestigationHints);
  app.post('/api/cyber-investigator/evaluate-result', evaluateInvestigationResult);
  app.post('/api/cyber-investigator/generate-scenario', generateInvestigationScenario);
  app.post('/api/cyber-investigator/generate-notes', generateInvestigationNotes);
  
  // Routes pour la progression de l'investigation
  app.get('/api/cyber-investigator/progress/:userId/:gameId/:sessionId?', getInvestigationProgress);
  app.post('/api/cyber-investigator/progress', saveInvestigationProgress);
  app.post('/api/cyber-investigator/evaluate-notes', evaluateUserNotes);
  
  // Route directe pour servir le document texte avec le mot de passe
  app.get('/download-attachment/:role', (req, res) => {
    try {
      const { role } = req.params;
      
      // Importer directement les fonctions nécessaires
      const { generateAttachmentWithPassword } = require('./services/passwordService');
      
      // Générer le contenu
      const content = generateAttachmentWithPassword(role, 'Cybersécurité', 'Cyber Sécurité');
      
      // Déterminer le nom du fichier
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const filename = `document-securite-${dateStr}.txt`;
      
      // Configuration explicite des en-têtes
      res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache' 
      });
      
      // Envoyer la réponse
      res.send(content);
    } catch (error) {
      console.error('Erreur lors de la génération de la pièce jointe:', error);
      res.status(500).send('Erreur lors de la génération de la pièce jointe');
    }
  });

  // Route de test pour les pièces jointes
  app.get('/api/attachments/test', async (req, res) => {
    try {
      const userRole = req.query.role as string || 'rssi';
      const sessionId = 'test-session-' + uuidv4();
      const domain = 'Cybersécurité';
      const scenarioTitle = 'Gestion de crise cyber';
      
      const attachment = createAttachmentWithHiddenPassword(
        sessionId,
        userRole,
        domain,
        scenarioTitle
      );
      
      res.status(201).json({
        message: 'Pièce jointe générée avec succès',
        attachment: {
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          createdAt: attachment.createdAt,
          size: attachment.size,
          url: `/api/attachments/download/${sessionId}/${attachment.id}`
        }
      });
    } catch (error) {
      console.error('Erreur lors du test de pièce jointe:', error);
      res.status(500).json({ 
        message: 'Erreur lors du test de pièce jointe', 
        error: (error as Error).message 
      });
    }
  });

  // API route for starting a scenario
  app.post('/api/cyber/start-scenario', async (req, res) => {
    try {
      const { scenarioId, userName, userRole, config, currentStage } = req.body;
      
      if (!scenarioId || !userName) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Get scenario data - in a real app, this would come from the database
      // For now, we're using hardcoded data matching the client
      const scenarios = [
        // Ingénierie sociale et phishing
        {
          id: "phishing-awareness",
          title: "Sensibilisation aux attaques de phishing",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "social-engineering-incident",
          title: "Gestion d'un incident d'ingénierie sociale",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "advanced-social-attacks",
          title: "Prévention des attaques sophistiquées",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "security-awareness",
          title: "Sensibilisation aux enjeux de la stratégie cyber",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Julien Grimault",
            role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité avancée",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Gestion de crise
        {
          id: "crisis-basics",
          title: "Introduction à la gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Nosing Doeuk",
            role: "Senior Partner - Directeur du pôle DIXIT"
          },
          difficulty: "Débutant"
        },
        {
          id: "crisis-plan",
          title: "Plan de gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Guillaume Lechevallier",
            role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque avancée par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        
        // Supply Chain
        {
          id: "supply-chain-basics",
          title: "Introduction aux risques de la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Marie Bernard",
            role: "Responsable Achats"
          },
          difficulty: "Débutant"
        },
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles / RGPD
        {
          id: "data-classification",
          title: "Classification des données sensibles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Yousra Benahmed",
            role: "Consultante Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données personnelles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "rgpd-compliance-program",
          title: "Programme de conformité RGPD avancé",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Pascal",
            role: "Directeur Général Adjoint et Directeur du Développement"
          },
          difficulty: "Expert"
        },
        
        // Gestion des incidents
        {
          id: "incident-basics",
          title: "Introduction à la gestion des incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Neil Desai",
            role: "Consultant Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "incident-response",
          title: "Mise en place d'un processus de réponse aux incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "security-monitoring",
          title: "Optimisation de la surveillance de sécurité",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Expert"
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Les informations de contexte et d'introduction sont maintenant intégrées directement dans les messages
      // et ne nécessitent plus la génération de documents séparés
      
      // Generate email content with AI
      const emailSystemPrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      // Déterminer le secteur d'activité en fonction du domaine et du titre du scénario
      let secteurActivite = '';
      
      if (scenario.domain.toLowerCase().includes('finance') || 
          scenario.domain.toLowerCase().includes('banque') ||
          scenario.title.toLowerCase().includes('finance') ||
          scenario.title.toLowerCase().includes('banque') ||
          scenario.title.toLowerCase().includes('fraude')) {
        secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
      } 
      else if (scenario.domain.toLowerCase().includes('santé') || 
               scenario.domain.toLowerCase().includes('industriel') || 
               scenario.domain.toLowerCase().includes('public') ||
               scenario.title.toLowerCase().includes('santé') ||
               scenario.title.toLowerCase().includes('industriel') ||
               scenario.title.toLowerCase().includes('patient') ||
               scenario.title.toLowerCase().includes('médical')) {
        secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
      }
      else if (scenario.domain.toLowerCase().includes('retail') || 
               scenario.domain.toLowerCase().includes('luxe') ||
               scenario.domain.toLowerCase().includes('commerce') ||
               scenario.title.toLowerCase().includes('marque') ||
               scenario.title.toLowerCase().includes('retail')) {
        secteurActivite = 'RETAIL & LUXE';
      }
      else if (scenario.domain.toLowerCase().includes('énergie') || 
               scenario.domain.toLowerCase().includes('energie') ||
               scenario.domain.toLowerCase().includes('utilities') ||
               scenario.title.toLowerCase().includes('énergie') ||
               scenario.title.toLowerCase().includes('production')) {
        secteurActivite = 'ÉNERGIE & UTILITIES';
      }
      else {
        // Par défaut, attribuer un secteur en fonction du contact principal
        if (scenario.contact.name === "Lorenzo Bertola" || scenario.contact.name === "Vincent Terrier") {
          secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
        }
        else if (scenario.contact.name === "Guillaume Lechevallier" || scenario.contact.name === "Fares SAYADI") {
          secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
        }
        else if (scenario.contact.name === "Nicolas Paolantonacci" || scenario.contact.name === "Marion Lopez") {
          secteurActivite = 'RETAIL & LUXE';
        }
        else if (scenario.contact.name === "Anthony Frescal") {
          secteurActivite = 'ÉNERGIE & UTILITIES';
        }
        else {
          // Si toujours pas de correspondance, choisir aléatoirement
          const secteurs = ['BANCAIRE/FINANCIER (BFA)', 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)', 'RETAIL & LUXE', 'ÉNERGIE & UTILITIES'];
          secteurActivite = secteurs[Math.floor(Math.random() * secteurs.length)];
        }
      }

      // Définir une personnalité pour l'interlocuteur principal en fonction de son rôle
      const getPersonalityTrait = (role: string, name: string, stage: number = 0) => {
        // Base de personnalité qui varie selon le rôle professionnel
        let basePersonality = "";
        
        // Personnalités de base par rôle
        if (role.toLowerCase().includes("président") || role.toLowerCase().includes("directeur général") || role.toLowerCase().includes("dg")) {
          basePersonality = stage <= 1 
            ? "pragmatique, orienté résultats, s'intéresse à l'impact business et à l'image de l'entreprise" 
            : "autoritaire, impatient, focalisé sur les conséquences pour la réputation et les finances, interrompt souvent avec des questions directes sur les délais et les impacts business. Peut contredire les experts techniques s'ils sont trop lents à agir.";
        } 
        else if (role.toLowerCase().includes("marketing") || role.toLowerCase().includes("communication")) {
          basePersonality = stage <= 1
            ? "dynamique, soucieux de l'image de l'entreprise, s'intéresse à la communication de crise"
            : "anxieux concernant l'image de l'entreprise, insiste constamment pour communiquer rapidement vers l'extérieur même sans toutes les informations, en conflit avec les recommandations techniques qui demandent plus de temps.";
        } 
        else if (role.toLowerCase().includes("rh") || role.toLowerCase().includes("ressources humaines")) {
          basePersonality = stage <= 1
            ? "attentif au facteur humain, préoccupé par l'impact sur les collaborateurs"
            : "inquiet des conséquences internes, s'oppose aux mesures techniques trop strictes qui impactent les employés, rappelle constamment les aspects légaux et sociaux en conflit avec l'urgence technique.";
        } 
        else if (role.toLowerCase().includes("financier") || role.toLowerCase().includes("cfo") || role.toLowerCase().includes("daf")) {
          basePersonality = stage <= 1
            ? "analytique, préoccupé par les coûts et les risques financiers"
            : "extrêmement réticent à approuver des dépenses d'urgence, exige systématiquement des justifications chiffrées avant toute action coûteuse, s'oppose aux solutions onéreuses même si elles sont techniquement optimales. En situation de crise, il peut bloquer des décisions urgentes pour des raisons budgétaires.";
        } 
        else if (role.toLowerCase().includes("technique") || role.toLowerCase().includes("cto") || role.toLowerCase().includes("informatique") || role.toLowerCase().includes("dsi")) {
          basePersonality = stage <= 1
            ? "technique, précis, s'intéresse aux détails d'implémentation"
            : "très technique dans son langage, frustré par l'incompréhension des autres dirigeants, insiste pour des solutions parfaites techniquement même si elles prennent plus de temps ou coûtent plus cher. Peut s'opposer directement au DG et au CFO s'ils privilégient des solutions rapides mais imparfaites.";
        } 
        else if (role.toLowerCase().includes("juridique") || role.toLowerCase().includes("légal") || role.toLowerCase().includes("conformité")) {
          basePersonality = stage <= 1
            ? "prudent, méthodique, attentif aux aspects réglementaires et contractuels"
            : "extrêmement prudent, refuse catégoriquement certaines actions même urgentes pour des raisons légales, exige des validations écrites et des procédures complètes même en situation critique, en conflit direct avec les besoins d'action rapide.";
        }
        else if (role.toLowerCase().includes("sécurité") || role.toLowerCase().includes("rssi")) {
          basePersonality = stage <= 1
            ? "vigilant, méthodique, focalise sur les procédures de sécurité et l'analyse des menaces"
            : "très technique et alarmiste, insiste sur des mesures de sécurité maximales qui peuvent paralyser l'entreprise, en désaccord avec les compromis business, utilise un jargon technique parfois incompréhensible pour les autres.";
        }
        else if (role.toLowerCase().includes("opérations") || role.toLowerCase().includes("production")) {
          basePersonality = stage <= 1
            ? "pragmatique, orienté continuité de service, préoccupé par l'impact opérationnel"
            : "obsédé par le maintien de l'activité à tout prix, peut s'opposer aux mesures de sécurité qui ralentissent la production, impatient face aux analyses techniques détaillées, pousse pour des solutions de contournement rapides.";
        }  
        else if (name === "Eddy MISSONI IDEMBI") {
          basePersonality = "créatif, innovant, passionné par les solutions technologiques, mais peut devenir impatient face à des approches trop conventionnelles";
        } 
        else {
          basePersonality = stage <= 1
            ? "professionnel, direct, cherchant une expertise pointue"
            : "stressé par la situation, communique de façon plus directe et parfois abrupte, peut remettre en question les décisions précédentes si la situation se dégrade.";
        }
        
        // Ajout de traits de personnalité spécifiques au stade de crise
        let stageModifier = "";
        if (stage >= 3) {
          stageModifier = "\n\nEn situation de crise extrême, cette personne devient tendue, interrompt fréquemment les autres, peut couper la parole, utilise des phrases courtes et directes, et exprime ouvertement son désaccord avec les autres membres de l'équipe. Les messages doivent inclure ces interactions conflictuelles et ces interruptions.";
        } else if (stage >= 2) {
          stageModifier = "\n\nSous pression, cette personne devient plus directive, moins patiente, et exprime plus clairement ses désaccords et ses priorités contradictoires avec celles des autres personnes impliquées.";
        }
        
        return basePersonality + stageModifier;
      };
      
      // Définir le niveau d'urgence du problème en fonction du domaine, de la difficulté et de l'étape actuelle
      const getUrgencyLevel = (domain: string, difficulty: string, stage: number = 0) => {
        // Plus l'étape avance, plus l'urgence augmente
        const stageMultiplier = Math.min(stage, 3) * 0.25; // 0, 0.25, 0.5, 0.75
        
        let baseUrgency = 0;
        if (domain.toLowerCase().includes("crise") || domain.toLowerCase().includes("incident")) {
          baseUrgency = 0.75; // Déjà élevé
        } else if (difficulty === "Expert") {
          baseUrgency = 0.5;  // Modéré à élevé
        } else if (difficulty === "Intermédiaire") {
          baseUrgency = 0.25; // Normal à modéré
        } else {
          baseUrgency = 0;    // Normal
        }
        
        // Calculer l'urgence finale (entre 0 et 1)
        const urgencyScore = Math.min(baseUrgency + stageMultiplier, 1);
        
        // Transformer en texte avec plus de variété selon le niveau d'urgence exact
        if (urgencyScore >= 0.9) {
          return "critique, exigeant une intervention immédiate en cellule de crise, avec des impacts déjà visibles et significatifs pour l'organisation";
        } else if (urgencyScore >= 0.75) {
          return "très élevé, nécessitant une réponse coordonnée dans les heures qui suivent, avec mobilisation des équipes clés et priorisation maximale";
        } else if (urgencyScore >= 0.6) {
          return "élevé, nécessitant une réponse rapide sous 24h, avec des impacts potentiels importants à court terme si rien n'est fait";
        } else if (urgencyScore >= 0.5) {
          return "modéré à élevé, avec un certain sentiment d'urgence qui requiert une action dans les prochains jours";
        } else if (urgencyScore >= 0.35) {
          return "modéré, avec un délai raisonnable mais limité pour analyser et répondre à la situation";
        } else if (urgencyScore >= 0.25) {
          return "standard, permettant une approche méthodique sans pression excessive, tout en restant vigilant";
        } else {
          return "normal, permettant une réflexion approfondie et une évaluation complète avant toute action";
        }
      };
      
      // Définir la situation du scénario en fonction de l'étape actuelle
      const getScenarioSituation = (stage: number = 0) => {
        if (stage === 0) {
          return "initiale de détection, où un problème potentiel vient d'être identifié et nécessite une première analyse pour comprendre sa nature, son étendue et sa gravité. Cette phase est caractérisée par la collecte d'informations, l'analyse des signaux d'alerte et l'évaluation préliminaire des risques";
        } else if (stage === 1) {
          return "de réponse immédiate, où le problème est confirmé et commence à révéler sa complexité. Dans cette étape, des impacts initiaux sont visibles, les premières mesures de confinement sont mises en place, et une analyse plus approfondie est nécessaire pour déterminer les prochaines actions";
        } else if (stage === 2) {
          return "critique de gestion active de crise, où des décisions importantes doivent être prises rapidement avec des enjeux significatifs. La situation impacte déjà plusieurs départements ou systèmes, des équipes dédiées sont mobilisées, et des tensions commencent à apparaître entre les différentes priorités (sécurité vs continuité business)";
        } else {
          return "d'escalade et de gestion stratégique, où la situation atteint son point culminant avec un impact maximum et des pressions multiples. Une cellule de crise complète est activée, les dirigeants sont directement impliqués, des arbitrages complexes doivent être faits entre les intérêts contradictoires, et la communication interne/externe devient critique";
        }
      };
      
      // Récupérer l'étape actuelle (currentStage)
      const stage = currentStage || 0;
      
      // Générer un nom d'entreprise cohérent avec le secteur d'activité
      let companyName = '';
      if (secteurActivite === 'BANCAIRE/FINANCIER (BFA)') {
        companyName = "SECURE FINANCE SOLUTIONS";
      } else if (secteurActivite === 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)') {
        companyName = "HEALTH & INDUSTRY SHIELD";
      } else if (secteurActivite === 'RETAIL & LUXE') {
        companyName = "ELITE RETAIL SECURITY";
      } else if (secteurActivite === 'ÉNERGIE & UTILITIES') {
        companyName = "ENERGY SHIELD SYSTEMS";
      } else {
        companyName = "CYBER SECURE SOLUTIONS";
      };

      // Utiliser le contact principal du scénario comme premier interlocuteur
      const contactPrincipal = {
        name: scenario.contact.name,
        role: scenario.contact.role,
        expertise: "Expertise spécifique au domaine du scénario",
        concern: "Préoccupations liées aux enjeux cyber dans son domaine d'expertise"
      };

      // Convertir le rôle de l'utilisateur pour le passage à getRoleExpectation
      const getNormalizedRole = (userRole: string) => {
        const role = userRole?.toLowerCase() || '';
        if (role.includes('rssi')) return 'rssi';
        if (role.includes('hacker') || role.includes('éthique')) return 'hacker';
        if (role.includes('développeur') || role.includes('dev')) return 'developpeur';
        if (role.includes('admin') || role.includes('système')) return 'admin';
        if (role.includes('consult')) return 'consultant';
        return '';
      };
      
      // Définir une attente spécifique en fonction du rôle normalisé de l'utilisateur
      const getRoleExpectation = (normalizedRole: string) => {
        switch (normalizedRole) {
          case 'rssi':
            return "une vision globale intégrant les aspects techniques, organisationnels et stratégiques";
          case 'hacker':
            return "une analyse technique approfondie des vulnérabilités potentielles";
          case 'developpeur':
            return "une perspective sur la sécurité du code et les bonnes pratiques de développement";
          case 'admin':
            return "des insights sur la configuration sécurisée des systèmes et l'architecture technique";
          case 'consultant':
            return "une approche méthodologique et des recommandations basées sur les standards du marché";
          default:
            return "une expertise en cybersécurité";
        }
      };

      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: emailSystemPrompt + 
          `\n\nRÈGLES DE FORMATAGE À RESPECTER:
          1. L'email doit faire entre 400-500 caractères pour être professionnel et engageant.
          2. Structure obligatoire:
             - Introduction formelle et mise en contexte (2-3 phrases)
             - Exposition claire de la situation critique
             - Définition précise de l'action attendue
             - Mention de la pièce jointe et du mot de passe requis
             - Signature professionnelle
          3. Adapter le ton selon:
             - Le rôle de l'utilisateur (${userRole})
             - Le niveau de criticité du scénario
             - Le domaine d'expertise concerné
          4. Éléments clés:
             - Créer un sentiment d'urgence réaliste
             - Maintenir un ton professionnel
             - Insister sur l'importance de la pièce jointe
             - Mentionner clairement la nécessité du mot de passe`
        },
        {
          role: "user",
          content: `Générez un email COURT (maximum 200 caractères) pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec:
          
          CONTEXTE MINIMAL:
          - Email de ${contactPrincipal.name} (${contactPrincipal.role})
          - Adressé à ${userName} (${userRole ? getUserRoleDescription(userRole) : "expert cyber"})
          - Urgence: ${getUrgencyLevel(scenario.domain, scenario.difficulty, currentStage || 0)}
          
          STRUCTURE OBLIGATOIRE:
          - OBJET: Très court et urgent (max 30 caractères)
          - CORPS: Une ou deux phrases explicatives + une question directe
          - MENTION OBLIGATOIRE: "IMPORTANT: Analysez attentivement la PJ - vous devez impérativement identifier et me communiquer le mot de passe caché pour accéder au projet. Sans ce mot de passe, nous ne pourrons pas continuer."
          
          RAPPEL IMPORTANT: L'email entier ne doit PAS dépasser 200 caractères au total, espaces compris.`
        }
      ];
      
      const emailContent = await openAIService.getChatCompletionWithCache(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 3000 // Augmenté pour permettre des emails plus détaillés
      );
      
      // Parse email content to extract subject and body
      const subjectMatch = emailContent.match(/Objet\s*:(.+?)(?:\n|$)/i);
      // Supprimer les ** du sujet s'ils existent
      let subject = subjectMatch ? subjectMatch[1].trim() : `Bienvenue chez ${companyName}`;
      subject = subject.replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
      
      // Remove any email headers from the content
      let body = emailContent
        .replace(/De\s*:.*?(?:\n|$)/gi, '')
        .replace(/À\s*:.*?(?:\n|$)/gi, '')
        .replace(/Objet\s*:.*?(?:\n|$)/gi, '')
        .replace(/Date\s*:.*?(?:\n|$)/gi, '')
        .trim();
        
      // Supprimer les ** au début et à la fin du corps de l'email
      const lines = body.split('\n');
      if (lines.length > 0) {
        // Traitement de la première ligne
        if (lines[0].trim().startsWith('**') && lines[0].trim().endsWith('**')) {
          lines[0] = lines[0].trim().replace(/^\*\*|\*\*$/g, '');
        }
        
        // Traitement de la dernière ligne
        if (lines.length > 1 && lines[lines.length - 1].trim().startsWith('**') && lines[lines.length - 1].trim().endsWith('**')) {
          lines[lines.length - 1] = lines[lines.length - 1].trim().replace(/^\*\*|\*\*$/g, '');
        }
        
        body = lines.join('\n');
      }
      
      // Créer une pièce jointe contenant un mot de passe caché adapté au rôle de l'utilisateur
      const attachment = createAttachmentWithHiddenPassword(
        scenarioId,  // Utiliser l'ID du scénario comme ID de session
        userRole || 'expert',
        scenario.domain,
        scenario.title
      );
      
      // Définir les interlocuteurs supplémentaires pour le scénario avec des expertises métier, technologiques et sectorielles diverses
      const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
        // Évitons d'avoir le même contact plusieurs fois
        const additionalContacts = [];
        
        // Experts par secteur d'activité
        const sectorExperts = {
          // Secteur bancaire et financier
          BFA: [
            {
              name: "Lorenzo Bertola",
              role: "Directeur Général Adjoint et Directeur du pôle BFA",
              expertise: "Cybersécurité dans le secteur bancaire et financier",
              concern: "S'inquiète des implications réglementaires spécifiques au secteur financier (ACPR, réglementation bancaire) et de la protection des transactions"
            },
            {
              name: "Vincent Terrier",
              role: "Senior Partner, Directeur Financier",
              expertise: "Gestion des risques financiers liés aux cyber-attaques",
              concern: "Évalue l'impact financier des risques cyber et les investissements nécessaires pour s'en prémunir"
            }
          ],
          
          // Secteur IMPULSE (industrie, médias, mobilité, secteur public, santé)
          IMPULSE: [
            {
              name: "Guillaume Lechevallier",
              role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
              expertise: "Transformation numérique sécurisée dans les secteurs industriels",
              concern: "Préoccupé par la continuité d'activité des systèmes industriels et la protection des infrastructures critiques"
            },
            {
              name: "Fares SAYADI",
              role: "Spécialiste Data / IA",
              expertise: "Sécurisation des données dans le secteur public et la santé",
              concern: "Axé sur la protection des données sensibles et personnelles dans des contextes critiques (santé, défense)"
            }
          ],
          
          // Secteur Retail & Luxe
          RETAIL: [
            {
              name: "Nicolas Paolantonacci",
              role: "Senior Partner et Directeur du pôle RETAIL & LUXE",
              expertise: "Protection des actifs digitaux dans le secteur du luxe",
              concern: "Focalisé sur la protection de la propriété intellectuelle et de l'image de marque"
            },
            {
              name: "Marion Lopez",
              role: "Senior Partner et Directrice Marketing, Communication et RSE",
              expertise: "Communication de crise et gestion de la réputation",
              concern: "Préoccupée par l'impact des incidents de sécurité sur l'image et la réputation de l'entreprise"
            }
          ],
          
          // Secteur Energie & Utilities
          ENERGY: [
            {
              name: "Anthony Frescal",
              role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
              expertise: "Sécurité des infrastructures critiques énergétiques",
              concern: "Centré sur la protection des installations industrielles sensibles et la continuité de service des réseaux énergétiques"
            }
          ]
        };
        
        // Experts par expertise technique
        const technicalExperts = {
          // Expertise en cybersécurité
          CYBER: [
            {
              name: "Neil LEVIN",
              role: "Expert cybersécurité & CFO",
              expertise: "Stratégies de défense et solutions techniques de cybersécurité",
              concern: "Analyse les vulnérabilités techniques et propose des solutions concrètes pour renforcer la sécurité"
            },
            {
              name: "Yousra SAIDANI",
              role: "Experte Cybersécurité & CFO",
              expertise: "Analyse forensique et réponse aux incidents",
              concern: "Spécialisée dans l'investigation numérique et la résolution technique des incidents"
            }
          ],
          
          // Expertise en Data/IA
          DATA: [
            {
              name: "Eddy MISSONI IDEMBI",
              role: "Expert Data / IA & CTO",
              expertise: "Sécurisation des modèles d'IA et protection des données",
              concern: "Préoccupé par les risques spécifiques aux systèmes d'IA (empoisonnement des données, détournement des modèles)"
            }
          ],
          
          // Expertise en conformité et juridique
          COMPLIANCE: [
            {
              name: "Vincent Pascal",
              role: "Directeur Général Adjoint et Directeur du Développement",
              expertise: "Conformité réglementaire en matière de cybersécurité",
              concern: "Veille au respect des lois, normes et standards (RGPD, NIS2, ISO27001)"
            }
          ]
        };
        
        // Experts par fonction dans l'entreprise
        const roleExperts = {
          // Direction générale
          EXECUTIVE: [
            {
              name: "Arnaud Gauthier",
              role: "Président",
              expertise: "Vision stratégique et gouvernance de la cybersécurité",
              concern: "Centré sur les enjeux stratégiques à long terme et la responsabilité du conseil d'administration"
            },
            {
              name: "Olivier Hervo",
              role: "Directeur Général",
              expertise: "Arbitrage risques/opportunités en matière de sécurité",
              concern: "Recherche l'équilibre entre sécurité et développement business, protection et innovation"
            }
          ],
          
          // Ressources humaines
          HR: [
            {
              name: "Isabelle Dubacq",
              role: "Senior Partner, Directrice des Ressources Humaines",
              expertise: "Formation et sensibilisation des collaborateurs",
              concern: "Préoccupée par le facteur humain dans la cybersécurité et le développement d'une culture de sécurité"
            }
          ]
        };
        
        // Sélection des interlocuteurs en fonction du domaine du scénario
        let relevantExperts: any[] = [];
        
        // 1. Analyse du domaine pour déterminer les expertises pertinentes
        if (domain.toLowerCase().includes('finance') || domain.toLowerCase().includes('banque') || domain.toLowerCase().includes('paiement')) {
          relevantExperts = relevantExperts.concat(sectorExperts.BFA);
        }
        
        if (domain.toLowerCase().includes('industriel') || domain.toLowerCase().includes('santé') || domain.toLowerCase().includes('public')) {
          relevantExperts = relevantExperts.concat(sectorExperts.IMPULSE);
        }
        
        if (domain.toLowerCase().includes('retail') || domain.toLowerCase().includes('luxe') || domain.toLowerCase().includes('marque')) {
          relevantExperts = relevantExperts.concat(sectorExperts.RETAIL);
        }
        
        if (domain.toLowerCase().includes('énergie') || domain.toLowerCase().includes('infrastructure critique')) {
          relevantExperts = relevantExperts.concat(sectorExperts.ENERGY);
        }
        
        // Aspects techniques
        if (domain.toLowerCase().includes('technique') || domain.toLowerCase().includes('sécurité') || domain.toLowerCase().includes('cyber')) {
          relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
        }
        
        if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('ia') || domain.toLowerCase().includes('intelligence')) {
          relevantExperts = relevantExperts.concat(technicalExperts.DATA);
        }
        
        if (domain.toLowerCase().includes('conformité') || domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('juridique')) {
          relevantExperts = relevantExperts.concat(technicalExperts.COMPLIANCE);
        }
        
        // Aspects fonctionnels
        if (domain.toLowerCase().includes('stratégie') || domain.toLowerCase().includes('gouvernance')) {
          relevantExperts = relevantExperts.concat(roleExperts.EXECUTIVE);
        }
        
        if (domain.toLowerCase().includes('formation') || domain.toLowerCase().includes('sensibilisation') || domain.toLowerCase().includes('humain')) {
          relevantExperts = relevantExperts.concat(roleExperts.HR);
        }
        
        // Si aucun expert spécifique n'a été identifié, inclure des experts généraux
        if (relevantExperts.length === 0) {
          // Toujours inclure au moins un expert technique en cybersécurité
          relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
          
          // Ajouter un responsable financier et un responsable communication
          relevantExperts.push(sectorExperts.BFA[1]); // Directeur Financier
          relevantExperts.push(sectorExperts.RETAIL[1]); // Directrice Communication
        }
        
        // S'assurer que nous avons une diversité de préoccupations
        additionalContacts.push(...relevantExperts);
        
        // Rendre aléatoire la sélection des PNJ pour tous les scénarios
        // Mélanger toutes les options disponibles
        const allContacts: Array<{
          name: string;
          role: string;
          expertise: string;
          concern: string;
        }> = [];
        
        // Ajouter tous les experts sectoriels disponibles
        Object.values(sectorExperts).forEach(sectorGroup => {
          allContacts.push(...sectorGroup);
        });
        
        // Ajouter tous les experts techniques disponibles
        Object.values(technicalExperts).forEach(techGroup => {
          allContacts.push(...techGroup);
        });
        
        // Ajouter les experts de rôles
        Object.values(roleExperts).forEach(roleGroup => {
          allContacts.push(...roleGroup);
        });
        
        // Filtrer pour éviter les doublons avec le contact principal
        // Et éviter les rôles similaires (pas deux experts cyber, pas deux DG, etc.)
        const usedRoles = new Set([primaryContact.role.split(',')[0].trim()]);
        
        const filtered = allContacts
          .filter(c => c.name !== primaryContact.name)
          .filter(c => {
            const baseRole = c.role.split(',')[0].trim();
            if (usedRoles.has(baseRole)) return false;
            usedRoles.add(baseRole);
            return true;
          })
          .sort(() => 0.5 - Math.random()); // Mélanger pour sélection aléatoire
        
        // Sélectionner 2 interlocuteurs maximum en plus d'Isabelle
        const result = [];
        let hasTechnical = false;
        let hasBusiness = false;
        
        // Parcourir la liste filtrée et sélectionner les experts appropriés
        for (const expert of filtered) {
          if (result.length >= 2) break; // Limiter à 2 interlocuteurs supplémentaires
          
          const isTechnical = expert.expertise.toLowerCase().includes('technique') || 
                             expert.expertise.toLowerCase().includes('cyber') ||
                             expert.expertise.toLowerCase().includes('sécurité');
                             
          const isBusiness = expert.expertise.toLowerCase().includes('stratégie') || 
                            expert.expertise.toLowerCase().includes('financier') ||
                            expert.expertise.toLowerCase().includes('marketing');
          
          if (isTechnical && !hasTechnical) {
            result.push(expert);
            hasTechnical = true;
            continue;
          }
          
          if (isBusiness && !hasBusiness) {
            result.push(expert);
            hasBusiness = true;
            continue;
          }
          
          // Si nous avons déjà des experts techniques et business, ajouter d'autres experts
          if (hasTechnical && hasBusiness) {
            result.push(expert);
          }
          
          // Si nous n'avons pas encore rempli nos quotas techniques/business, ajouter quand même
          if (!hasTechnical || !hasBusiness) {
            result.push(expert);
          }
        }
        
        return result.slice(0, 2); // Limiter à 2 interlocuteurs au maximum
      };
      
      // Obtenir 2 contacts supplémentaires pertinents pour ce scénario
      const additionalContacts = getAdditionalContacts(scenario.domain, scenario.contact);
      
      // Créer la structure d'interlocuteurs pour ce scénario
      // Limiter à un total de 3 interlocuteurs maximum
      // Le contact principal du scénario est toujours inclus
      const scenarioContacts = [scenario.contact];
      
      // Ajouter jusqu'à deux contacts supplémentaires (pour un total de 3 maximum)
      if (additionalContacts.length > 0) {
        // Ajouter le premier contact supplémentaire généré
        scenarioContacts.push(additionalContacts[0]);
        
        // Si disponible, ajouter un deuxième contact supplémentaire
        if (additionalContacts.length > 1) {
          scenarioContacts.push(additionalContacts[1]);
        }
      }
      
      // Générer une pièce jointe avec un mot de passe caché pour chaque scénario
      let attachments = [];
      try {
        // Toujours créer une pièce jointe contenant un mot de passe caché adapté au rôle de l'utilisateur
        const attachment = createAttachmentWithHiddenPassword(
          scenarioId,  // Utiliser l'ID du scénario comme ID de session
          userRole || 'expert',
          scenario.domain,
          scenario.title
        );
        
        // Ajouter la pièce jointe au tableau d'attachements
        attachments.push({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          date: attachment.createdAt
        });
        
        // Ajouter à l'email un message indiquant qu'une pièce jointe importante est à consulter
        body += "\n\nNOTE: Une pièce jointe importante contenant des informations spécifiques à votre rôle a été incluse. Veuillez la consulter attentivement.";
      } catch (error) {
        console.error("Erreur lors de la génération de la pièce jointe:", error);
        // Continuer même si la génération de pièce jointe échoue
      }

      // Create email response - le premier message vient toujours du contact principal du scénario
      const email = {
        id: uuidv4(),
        from: scenarioContacts[0], // Utiliser le premier contact de la liste (le contact principal du scénario)
        to: `${userName}@mc2i.fr`,
        subject,
        date: new Date().toISOString(),
        body,
        // Ajouter les contacts qui interviendront dans ce scénario (maximum 3 au total)
        scenarioContacts: scenarioContacts,
        // Ajouter les pièces jointes générées
        attachments: attachments.length > 0 ? attachments : undefined
      };
      
      res.json({ email });
    } catch (error) {
      console.error('Error starting scenario:', error);
      res.status(500).json({ message: 'Failed to start scenario' });
    }
  });

  // API route for chat messages
  app.post('/api/cyber/chat', async (req, res) => {
    try {
      const { message, userName, userRole, scenarioId, config, chatHistory, scenarioContacts, currentStage } = req.body;
      
      if (!message || !userName) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Récupérer les scénarios pour avoir le domaine actuel
      // Get scenario data - in a real app, this would come from the database
      const scenarios = [
        // Ingénierie sociale et phishing
        {
          id: "phishing-awareness",
          title: "Sensibilisation aux attaques de phishing",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "social-engineering-incident",
          title: "Gestion d'un incident d'ingénierie sociale",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "advanced-social-attacks",
          title: "Prévention des attaques sophistiquées",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "security-awareness",
          title: "Sensibilisation aux enjeux de la stratégie cyber",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Julien Grimault",
            role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité avancée",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Gestion de crise
        {
          id: "crisis-basics",
          title: "Introduction à la gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Nosing Doeuk",
            role: "Senior Partner - Directeur du pôle DIXIT"
          },
          difficulty: "Débutant"
        },
        {
          id: "crisis-plan",
          title: "Plan de gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Guillaume Lechevallier",
            role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque avancée par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        
        // Supply Chain
        {
          id: "supply-chain-basics",
          title: "Introduction aux risques de la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Marie Bernard",
            role: "Responsable Achats"
          },
          difficulty: "Débutant"
        },
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles / RGPD
        {
          id: "data-classification",
          title: "Classification des données sensibles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données personnelles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "rgpd-compliance-program",
          title: "Programme de conformité RGPD avancé",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Pascal",
            role: "Directeur Général Adjoint et Directeur du Développement"
          },
          difficulty: "Expert"
        },
        
        // Gestion des incidents
        {
          id: "incident-basics",
          title: "Introduction à la gestion des incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Yousra Benahmed",
            role: "Consultante Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "incident-response",
          title: "Mise en place d'un processus de réponse aux incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "security-monitoring",
          title: "Optimisation de la surveillance de sécurité",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Expert"
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Vérifier si nous avons des contacts disponibles pour le jeu de rôle
      let availableContacts = scenarioContacts;
      
      // Si aucun contact n'est fourni, générer les contacts à partir du domaine
      if (!availableContacts || !Array.isArray(availableContacts) || availableContacts.length === 0) {
        // Réutiliser la même fonction définie plus haut pour la génération des contacts
        // mais nous la redéfinissons ici pour éviter des problèmes de portée
        const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
          const additionalContacts = [];
          
          // Experts par secteur d'activité
          const sectorExperts = {
            // Secteur bancaire et financier
            BFA: [
              {
                name: "Lorenzo Bertola",
                role: "Directeur Général Adjoint et Directeur du pôle BFA",
                expertise: "Cybersécurité dans le secteur bancaire et financier",
                concern: "S'inquiète des implications réglementaires spécifiques au secteur financier (ACPR, réglementation bancaire) et de la protection des transactions"
              },
              {
                name: "Vincent Terrier",
                role: "Senior Partner, Directeur Financier",
                expertise: "Gestion des risques financiers liés aux cyber-attaques",
                concern: "Évalue l'impact financier des risques cyber et les investissements nécessaires pour s'en prémunir"
              }
            ],
            
            // Secteur IMPULSE (industrie, médias, mobilité, secteur public, santé)
            IMPULSE: [
              {
                name: "Guillaume Lechevallier",
                role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
                expertise: "Transformation numérique sécurisée dans les secteurs industriels",
                concern: "Préoccupé par la continuité d'activité des systèmes industriels et la protection des infrastructures critiques"
              },
              {
                name: "Fares SAYADI",
                role: "Spécialiste Data / IA",
                expertise: "Sécurisation des données dans le secteur public et la santé",
                concern: "Axé sur la protection des données sensibles et personnelles dans des contextes critiques (santé, défense)"
              }
            ],
            
            // Secteur Retail & Luxe
            RETAIL: [
              {
                name: "Nicolas Paolantonacci",
                role: "Senior Partner et Directeur du pôle RETAIL & LUXE",
                expertise: "Protection des actifs digitaux dans le secteur du luxe",
                concern: "Focalisé sur la protection de la propriété intellectuelle et de l'image de marque"
              },
              {
                name: "Julien Grimault",
                role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité",
                expertise: "Gouvernance et stratégie de cybersécurité",
                concern: "Préoccupé par la conformité aux normes et l'intégration de la cybersécurité dans la stratégie globale de l'entreprise"
              }
            ],
            
            // Secteur Energie & Utilities
            ENERGY: [
              {
                name: "Anthony Frescal",
                role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
                expertise: "Sécurité des infrastructures critiques énergétiques",
                concern: "Centré sur la protection des installations industrielles sensibles et la continuité de service des réseaux énergétiques"
              }
            ]
          };
          
          // Experts par expertise technique
          const technicalExperts = {
            // Expertise en cybersécurité
            CYBER: [
              {
                name: "Neil LEVIN",
                role: "Expert cybersécurité & CFO",
                expertise: "Stratégies de défense et solutions techniques de cybersécurité",
                concern: "Analyse les vulnérabilités techniques et propose des solutions concrètes pour renforcer la sécurité"
              },
              {
                name: "Yousra SAIDANI",
                role: "Experte Cybersécurité & CFO",
                expertise: "Analyse forensique et réponse aux incidents",
                concern: "Spécialisée dans l'investigation numérique et la résolution technique des incidents"
              }
            ],
            
            // Expertise en Data/IA
            DATA: [
              {
                name: "Eddy MISSONI IDEMBI",
                role: "Expert Data / IA & CTO",
                expertise: "Sécurisation des modèles d'IA et protection des données",
                concern: "Préoccupé par les risques spécifiques aux systèmes d'IA (empoisonnement des données, détournement des modèles)"
              }
            ],
            
            // Expertise en conformité et juridique
            COMPLIANCE: [
              {
                name: "Vincent Pascal",
                role: "Directeur Général Adjoint et Directeur du Développement",
                expertise: "Conformité réglementaire en matière de cybersécurité",
                concern: "Veille au respect des lois, normes et standards (RGPD, NIS2, ISO27001)"
              }
            ]
          };
          
          // Experts par fonction dans l'entreprise
          const roleExperts = {
            // Direction générale
            EXECUTIVE: [
              {
                name: "Arnaud Gauthier",
                role: "Président",
                expertise: "Vision stratégique et gouvernance de la cybersécurité",
                concern: "Centré sur les enjeux stratégiques à long terme et la responsabilité du conseil d'administration"
              },
              {
                name: "Olivier Hervo",
                role: "Directeur Général",
                expertise: "Arbitrage risques/opportunités en matière de sécurité",
                concern: "Recherche l'équilibre entre sécurité et développement business, protection et innovation"
              }
            ],
            
            // Ressources humaines
            HR: [
              {
                name: "Isabelle Dubacq",
                role: "Senior Partner, Directrice des Ressources Humaines",
                expertise: "Formation et sensibilisation des collaborateurs",
                concern: "Préoccupée par le facteur humain dans la cybersécurité et le développement d'une culture de sécurité"
              }
            ]
          };
          
          // Sélection des interlocuteurs en fonction du domaine du scénario
          let relevantExperts: any[] = [];
          
          // 1. Analyse du domaine pour déterminer les expertises pertinentes
          if (domain.toLowerCase().includes('finance') || domain.toLowerCase().includes('banque') || domain.toLowerCase().includes('paiement')) {
            relevantExperts = relevantExperts.concat(sectorExperts.BFA);
          }
          
          if (domain.toLowerCase().includes('industriel') || domain.toLowerCase().includes('santé') || domain.toLowerCase().includes('public')) {
            relevantExperts = relevantExperts.concat(sectorExperts.IMPULSE);
          }
          
          if (domain.toLowerCase().includes('retail') || domain.toLowerCase().includes('luxe') || domain.toLowerCase().includes('marque')) {
            relevantExperts = relevantExperts.concat(sectorExperts.RETAIL);
          }
          
          if (domain.toLowerCase().includes('énergie') || domain.toLowerCase().includes('infrastructure critique')) {
            relevantExperts = relevantExperts.concat(sectorExperts.ENERGY);
          }
          
          // Aspects techniques
          if (domain.toLowerCase().includes('technique') || domain.toLowerCase().includes('sécurité') || domain.toLowerCase().includes('cyber')) {
            relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
          }
          
          if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('ia') || domain.toLowerCase().includes('intelligence')) {
            relevantExperts = relevantExperts.concat(technicalExperts.DATA);
          }
          
          if (domain.toLowerCase().includes('conformité') || domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('juridique')) {
            relevantExperts = relevantExperts.concat(technicalExperts.COMPLIANCE);
          }
          
          // Aspects fonctionnels
          if (domain.toLowerCase().includes('stratégie') || domain.toLowerCase().includes('gouvernance')) {
            relevantExperts = relevantExperts.concat(roleExperts.EXECUTIVE);
          }
          
          if (domain.toLowerCase().includes('formation') || domain.toLowerCase().includes('sensibilisation') || domain.toLowerCase().includes('humain')) {
            relevantExperts = relevantExperts.concat(roleExperts.HR);
          }
          
          // Si aucun expert spécifique n'a été identifié, inclure des experts généraux
          if (relevantExperts.length === 0) {
            // Toujours inclure au moins un expert technique en cybersécurité
            relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
            
            // Ajouter un responsable financier et un responsable communication
            relevantExperts.push(sectorExperts.BFA[1]); // Directeur Financier
            relevantExperts.push(sectorExperts.RETAIL[1]); // Directrice Communication
          }
          
          // S'assurer que nous avons une diversité de préoccupations
          additionalContacts.push(...relevantExperts);
          
          // Filtrer pour éviter les doublons avec le contact principal
          // Et assurer une diversité d'expertises (technique, business, réglementaire)
          const filtered = additionalContacts
            .filter(c => c.name !== primaryContact.name)
            .sort(() => 0.5 - Math.random()); // Mélanger pour varier les scénarios
          
          // Sélectionner 3-4 interlocuteurs pertinents avec des perspectives diverses
          // On s'assure d'avoir au moins un expert technique et un expert métier
          const result = [];
          let hasTechnical = false;
          let hasBusiness = false;
          
          // Parcourir la liste filtrée et sélectionner les experts appropriés
          // Nous voulons entre 1 et 3 interlocuteurs supplémentaires (2-4 au total avec le contact principal)
          for (const expert of filtered) {
            if (result.length >= Math.min(3, filtered.length)) break; // Limiter à 3 interlocuteurs supplémentaires max
            
            const isTechnical = expert.expertise?.toLowerCase().includes('technique') || 
                               expert.expertise?.toLowerCase().includes('cyber') ||
                               expert.expertise?.toLowerCase().includes('sécurité') ||
                               (expert.concern?.toLowerCase().includes('tech') || false);
                               
            const isBusiness = expert.expertise?.toLowerCase().includes('stratégie') || 
                              expert.expertise?.toLowerCase().includes('financier') ||
                              expert.expertise?.toLowerCase().includes('marketing') ||
                              (expert.concern?.toLowerCase().includes('financ') || false);
            
            if (isTechnical && !hasTechnical) {
              result.push(expert);
              hasTechnical = true;
              continue;
            }
            
            if (isBusiness && !hasBusiness) {
              result.push(expert);
              hasBusiness = true;
              continue;
            }
            
            // Si nous avons déjà des experts techniques et business, ajouter d'autres experts
            if (hasTechnical && hasBusiness) {
              result.push(expert);
            }
            
            // Si nous n'avons pas encore rempli nos quotas techniques/business, ajouter quand même
            if (!hasTechnical || !hasBusiness) {
              result.push(expert);
            }
          }
          
          // S'assurer qu'il y a au moins 1 interlocuteur supplémentaire (pour un total min de 2 avec le contact principal)
          // et au maximum 3 interlocuteurs supplémentaires (pour un total max de 4 avec le contact principal)
          const minAdditionalContacts = 1;
          if (result.length < minAdditionalContacts && filtered.length > 0) {
            // Ajouter au moins un contact supplémentaire si disponible
            while (result.length < minAdditionalContacts && result.length < filtered.length) {
              const randomIndex = Math.floor(Math.random() * filtered.length);
              const randomContact = filtered[randomIndex];
              if (!result.includes(randomContact)) {
                result.push(randomContact);
              }
            }
          }
          return result.slice(0, 2); // Limiter à 2 interlocuteurs supplémentaires maximum
        };
        
        const additionalContacts = getAdditionalContacts(scenario.domain, scenario.contact);
        
        // Limiter à 3 interlocuteurs au total
        if (additionalContacts.length > 0) {
          // Si nous avons un contact supplémentaire, l'ajouter
          if (additionalContacts.length > 1) {
            // Si nous avons au moins deux contacts supplémentaires, en ajouter deux
            availableContacts = [scenario.contact, additionalContacts[0], additionalContacts[1]];
          } else {
            // Sinon ajouter seulement le premier contact supplémentaire
            availableContacts = [scenario.contact, additionalContacts[0]];
          }
        } else {
          // Sinon, utiliser uniquement le contact principal
          availableContacts = [scenario.contact];
        }
      }
      
      // Déterminer quel contact va répondre à cette interaction 
      // Utilisons l'historique des messages pour déterminer le contact suivant
      let respondingContact;
      
      // Version simplifiée : on ne réinitialise plus le scénario en cas de messages hors sujet
      // On laisse l'IA répondre de manière appropriée
      let offTopicCount = 0;
      let shouldResetScenario = false;
      
      // Note: Logique de détection des messages hors sujet désactivée pour simplifier l'expérience utilisateur
      // L'IA pourra toujours guider l'utilisateur si nécessaire mais sans réinitialiser le scénario
      
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Vérifier si c'est la première réponse de l'utilisateur après l'email initial
        // Pattern: [email - user] → nous voulons que le même PNJ (PNJ 1) réponde d'abord
        if (chatHistory.length === 2 && chatHistory[0].type === 'email' && chatHistory[1].type === 'user') {
          // Pour la première réponse de l'utilisateur, on garde le même contact initial (PNJ 1)
          // qui a envoyé le premier mail pour continuité de l'échange
          const firstContact = availableContacts[0];
          
          // Vérifier si la présentation de l'utilisateur est suffisante
          const userPresentation = chatHistory[1].content;
          const containsPresentation = typeof userPresentation === 'string' && 
            (userPresentation.length > 50 || // Texte suffisamment long
             userPresentation.toLowerCase().includes('je suis') ||
             userPresentation.toLowerCase().includes('je m\'appelle') ||
             userPresentation.toLowerCase().includes('je viens de') ||
             userPresentation.toLowerCase().includes('expérience') ||
             userPresentation.toLowerCase().includes('formation') ||
             userPresentation.toLowerCase().includes('travaillé') ||
             userPresentation.toLowerCase().includes('étudi') ||
             userPresentation.toLowerCase().includes('compétences') ||
             userPresentation.toLowerCase().includes('connaissance'));
          
          // Si l'utilisateur ne s'est pas présenté, on utilisera le même contact
          // pour le relancer (logique gérée dans le prompt)
          respondingContact = firstContact;
        } else {
          // Pour les interactions suivantes, comportement standard
          // Compter combien de fois chaque contact a déjà répondu
          const contactResponseCount: {[key: string]: number} = {};
          
          // Parcourir l'historique pour compter les réponses de chaque contact
          chatHistory.forEach(item => {
            if (item.type === 'bot' && typeof item.content === 'string' && item.contactName) {
              contactResponseCount[item.contactName] = (contactResponseCount[item.contactName] || 0) + 1;
            }
          });
          
          // Trouver le contact qui a le moins répondu
          let minResponses = Infinity;
          for (const contact of availableContacts as Array<{name: string, role: string, expertise?: string, concern?: string}>) {
            const count = contactResponseCount[contact.name] || 0;
            if (count < minResponses) {
              minResponses = count;
              respondingContact = contact;
            }
          }
          
          // Si tous les contacts ont parlé le même nombre de fois, choisir le suivant de manière circulaire
          if (!respondingContact) {
            // Trouver le dernier contact qui a parlé
            let lastContactIndex = 0;
            for (let i = chatHistory.length - 1; i >= 0; i--) {
              const item = chatHistory[i];
              if (item.type === 'bot' && item.contactName) {
                // Trouver l'index de ce contact
                const index = availableContacts.findIndex((c: { name: string }) => c.name === item.contactName);
                if (index !== -1) {
                  lastContactIndex = index;
                  break;
                }
              }
            }
            
            // Choisir le contact suivant de manière circulaire
            respondingContact = availableContacts[(lastContactIndex + 1) % availableContacts.length];
          }
        }
      } else {
        // Pour la première réponse, utiliser le contact principal du scénario
        respondingContact = availableContacts[0];
      }
      
      // Generate response with AI
      const basePrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      // Déterminer le secteur d'activité actuel en fonction de l'historique
      let secteurActivite = '';
      
      // Trouver le secteur à partir de l'historique de chat s'il existe
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          if (msg.type === 'email' && typeof msg.content === 'object') {
            const body = msg.content.body || '';
            
            if (body.includes('banque') || body.includes('financier') || body.includes('assurance') || 
                body.includes('ACPR') || body.includes('KYC') || body.includes('AML') || body.includes('PCI-DSS')) {
              secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              break;
            }
            else if (body.includes('industrie') || body.includes('santé') || body.includes('public') || 
                     body.includes('patient') || body.includes('OT/IT') || body.includes('système industriel')) {
              secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
              break;
            }
            else if (body.includes('retail') || body.includes('luxe') || body.includes('marque') || 
                     body.includes('e-commerce') || body.includes('boutique') || body.includes('client')) {
              secteurActivite = 'RETAIL & LUXE';
              break;
            }
            else if (body.includes('énergie') || body.includes('utilities') || body.includes('infrastructure critique') || 
                     body.includes('SCADA') || body.includes('production')) {
              secteurActivite = 'ÉNERGIE & UTILITIES';
              break;
            }
          }
        }
      }
      
      // Si aucun secteur n'a été trouvé, baser sur le domaine et le rôle du répondant
      if (!secteurActivite) {
        if (scenario?.domain?.toLowerCase().includes('finance') || 
            respondingContact.name === "Lorenzo Bertola" || 
            respondingContact.name === "Vincent Terrier") {
          secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
        }
        else if (scenario?.domain?.toLowerCase().includes('industriel') || 
                scenario?.domain?.toLowerCase().includes('santé') || 
                respondingContact.name === "Guillaume Lechevallier" || 
                respondingContact.name === "Fares SAYADI") {
          secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
        }
        else if (scenario?.domain?.toLowerCase().includes('retail') || 
                scenario?.domain?.toLowerCase().includes('luxe') || 
                respondingContact.name === "Nicolas Paolantonacci" || 
                respondingContact.name === "Marion Lopez") {
          secteurActivite = 'RETAIL & LUXE';
        }
        else if (scenario?.domain?.toLowerCase().includes('énergie') || 
                respondingContact.name === "Anthony Frescal") {
          secteurActivite = 'ÉNERGIE & UTILITIES';
        }
        else {
          // Choisir en fonction du premier message s'il s'agit d'un email
          if (chatHistory && chatHistory.length > 0 && chatHistory[0].type === 'email') {
            const firstEmailContent = chatHistory[0].content;
            if (typeof firstEmailContent === 'object' && firstEmailContent.body) {
              const body = firstEmailContent.body.toLowerCase();
              
              if (body.includes('banque') || body.includes('financ')) {
                secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              }
              else if (body.includes('industri') || body.includes('santé') || body.includes('public')) {
                secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
              }
              else if (body.includes('retail') || body.includes('luxe') || body.includes('marque')) {
                secteurActivite = 'RETAIL & LUXE';
              }
              else if (body.includes('énerg') || body.includes('utiliti')) {
                secteurActivite = 'ÉNERGIE & UTILITIES';
              }
              else {
                // Choix par défaut
                secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              }
            }
          } else {
            // Choix par défaut si pas d'historique
            secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
          }
        }
      }
      
      // Récupérer l'étape actuelle de la conversation depuis la requête
      const stage = currentStage || 0;
      console.log(`DEBUG - Stage actuel: ${stage}`);
      
      // Définir une personnalité pour l'interlocuteur principal en fonction de son rôle
      const contactPersonality = getPersonalityTrait(respondingContact.role, respondingContact.name, stage);
      
      // Définir la situation du scénario en fonction de l'étape actuelle
      const scenarioSituation = getScenarioSituation(stage);
      
      // Définir le niveau d'urgence en fonction du domaine, de la difficulté et de l'étape
      const urgencyLevel = getUrgencyLevel(scenario?.domain || "", scenario?.difficulty || "moyen", stage);
      
      // Obtenir le prompt système de l'API (contient les instructions générales)
      const baseSystemPrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      // Créer un prompt système personnalisé pour ce scénario précis
      const customSystemPrompt = baseSystemPrompt + 
        `\n\nPERSONNALITÉ ET EXPERTISE: Tu es ${contactPersonality} et tu possèdes l'expertise suivante : ${respondingContact.expertise || 'Non spécifiée'}. Cette personnalité et expertise doivent transparaître dans tes réponses.` +
        
        `\n\nPRÉOCCUPATION PRINCIPALE: ${respondingContact.concern || 'Non spécifiée'}. Chaque interlocuteur a des préoccupations différentes face à la même problématique cyber.` +
        
        `\n\nCONTEXTE SECTORIEL: Ce scénario se déroule dans le secteur ${secteurActivite}. Adapte ton vocabulaire, tes références et tes exemples à ce secteur d'activité spécifique.` +
        
        `\n\nPHASE DE LA SITUATION: La situation se trouve actuellement dans une phase ${scenarioSituation}. Le niveau d'urgence est ${urgencyLevel}.` +

        `\n\nPROGRESSION SCÉNARIO (STADE ${stage}): ` +
        (stage === 0 ? 
          "PHASE DE DÉTECTION INITIALE. Tu viens de repérer un problème potentiel et cherches à l'analyser. ADAPTE TON COMPORTEMENT : Ton ton doit être calme, analytique et orienté vers la collecte d'informations. Les questions doivent être précises et ciblées. Tu cherches surtout à comprendre et qualifier la situation, pas encore à résoudre. ATTENTES : L'utilisateur doit pouvoir comprendre l'origine du problème et sa nature." : 
        
        stage === 1 ? 
          "PHASE DE RÉPONSE IMMÉDIATE. Le problème est confirmé et commence à prendre de l'ampleur. Des impacts sont visibles. ADAPTE TON COMPORTEMENT : Ton ton doit montrer une préoccupation croissante, mais rester constructif. Tu dois créer un sentiment d'urgence modérée, évoquant des conséquences si rien n'est fait rapidement. ATTENTES : L'utilisateur doit prendre des premières décisions pour contenir le problème. Tu dois évaluer leur pertinence." :
        
        stage === 2 ? 
          "PHASE DE CRISE ACTIVE. La situation est sérieuse avec des impacts importants sur l'entreprise. Des pressions hiérarchiques et externes commencent à s'exercer. ADAPTE TON COMPORTEMENT : Ton ton doit refléter l'urgence, avec des phrases plus courtes et directes. Tu dois introduire des CONTRAINTES CONTRADICTOIRES (urgence vs précision, coût vs efficacité). Des interruptions et désaccords avec d'autres interlocuteurs peuvent survenir. ATTENTES : L'utilisateur doit gérer une situation complexe et prendre des décisions sous pression, avec des compromis difficiles." :
        
        "PHASE CRITIQUE ET STRATÉGIQUE. La situation a atteint un point culminant avec des conséquences graves potentielles ou actuelles. Une cellule de crise est pleinement active. ADAPTE TON COMPORTEMENT : Ton langage doit être direct, précis et orienté action. INTRODUIS PLUSIEURS VOIX/OPINIONS CONTRADICTOIRES dans tes messages, comme dans une vraie cellule de crise. Tu peux faire parler différents profils (DG préoccupé par l'image, DSI technique, juridique prudent, etc.) qui ne sont pas d'accord entre eux. ATTENTES : L'utilisateur doit démontrer sa capacité à arbitrer, prioriser et communiquer efficacement sous haute pression, tout en gérant des personnalités et priorités divergentes.") +
        
        "\n\nRÈGLES D'ADAPTATION SECTORIELLE:" +
        "\n1. Utilise des termes spécifiques au secteur dans tes réponses" +
        "\n2. Fais référence aux réglementations et standards propres à ce secteur" +
        "\n3. Adapte tes exemples et cas d'usage au contexte spécifique de ce secteur" +
        "\n4. Évoque des préoccupations business et opérationnelles pertinentes pour ce secteur" +
        "\n5. Utilise un vocabulaire adapté à ton rôle et à ton niveau hiérarchique" +
        
        "\n\nOBJECTIFS PÉDAGOGIQUES DU SCÉNARIO:" +
        "\n1. Identifie 2-3 compétences clés que l'apprenant doit développer dans ce scénario" +
        "\n2. Mentionne clairement les enjeux de cybersécurité spécifiques à ce secteur d'activité" +
        "\n3. Évalue la capacité de l'apprenant à adapter ses solutions au contexte sectoriel" +
        "\n4. Prépare-toi à fournir un bilan des apprentissages à la fin du scénario" +
        
        "\n\nCONTEXTUALISATION CYBER: La problématique centrale du scénario est TOUJOURS un enjeu de cybersécurité contextualisé dans un environnement métier ou sectoriel spécifique. Garde cette problématique cyber au centre de tes réponses, tout en l'abordant selon ton angle d'expertise et le contexte sectoriel." +
        
        `\n\nADAPTATION AU RÔLE DE L'UTILISATEUR: Tu communiques avec ${userName} qui a le rôle de ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}. Ajuste IMPÉRATIVEMENT ton discours pour parler à ce profil spécifique :
- Si l'utilisateur est RSSI: Parle-lui des aspects gouvernance, conformité et stratégie globale. Évoque les politiques de sécurité et la gestion des risques.
- Si l'utilisateur est Hacker Éthique: Utilise des termes techniques précis liés aux vulnérabilités, tests d'intrusion, et méthodologies d'attaque/défense.
- Si l'utilisateur est Développeur: Concentre-toi sur les aspects code, sécurité applicative, DevSecOps et pratiques de développement sécurisé.
- Si l'utilisateur est Administrateur Système: Discute infrastructure, durcissement des systèmes, gestion des identités et contrôles d'accès.
- Si l'utilisateur est Consultant: Aborde les méthodologies d'évaluation, les standards du secteur et les benchmarks entre organisations.

Formule tes explications et tes demandes en fonction de ce que ce type de professionnel peut concrètement faire dans son rôle quotidien.` +
        
        "\n\nRÈGLE DU JEU DE RÔLE AVANCÉ: Tu dois absolument adapter ton style de communication, ton vocabulaire et tes préoccupations à ton profil et au secteur. Un expert cybersécurité dans le secteur bancaire ne parle pas comme un directeur financier dans le secteur industriel. Modifie complètement ton approche en fonction de ton rôle, du contexte sectoriel et de tes préoccupations principales." +
        
        "\n\nÉVALUATION DES RÉPONSES: Guide l'utilisateur avec bienveillance. Valorise ses réponses et complète-les si nécessaire. Même si la réponse est imparfaite, trouve-y des éléments positifs pour encourager l'apprentissage. Si besoin, suggère des améliorations de façon constructive et pédagogique." +
        
        `\n\nINTERDICTION ABSOLUE: Ne jamais dire "En tant que [nom], je..." ou "Dans mon rôle de [fonction], je...". Incarne directement le personnage, parle naturellement comme le ferait cette personne dans son contexte professionnel.` +
        
        `\n\nRECADRAGE DES RÉPONSES HORS-SUJET: Si l'utilisateur répond de manière hors-sujet ou ne répond pas directement à la question posée dans l'email initial, tu dois immédiatement le recadrer avec un message du type: "Nous sommes en période très délicate et n'avons pas le temps de parler d'éléments hors sujet. Peux-tu répondre directement à ma question concernant [rappel du sujet]?". Ceci est OBLIGATOIRE et doit être appliqué dès la première réponse hors-sujet.`;
      
      // Create the base messages array
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: customSystemPrompt
        }
      ];
      
      // Add chat history if provided to maintain context
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistory.forEach(item => {
          if (item.type === 'user' && typeof item.content === 'string') {
            messages.push({
              role: "user",
              content: item.content
            });
          } else if (item.type === 'bot' && typeof item.content === 'string') {
            messages.push({
              role: "assistant",
              content: item.content
            });
          }
        });
      }
      
      // Ajout du message utilisateur avec les métadonnées du contexte actuel
      // Le fichier master_prompt.txt contient toute la logique de comportement de l'IA et du flux de conversation
      
      // Contexte de la conversation (pattern du flux)
      const isFirstResponse = chatHistory && chatHistory.length === 2 && chatHistory[0].type === 'email' && chatHistory[1].type === 'user';
      
      // Calcul du nombre d'échanges complets (un échange = un message utilisateur + une réponse du bot)
      // On compte le nombre de paires utilisateur-bot dans l'historique (en excluant l'email initial)
      let exchangeCount = 0;
      
      // Debug log pour afficher l'historique complet des messages
      console.log("DEBUG - Chat history length:", chatHistory ? chatHistory.length : 0);
      if (chatHistory && chatHistory.length > 0) {
        console.log("DEBUG - Chat history types:", chatHistory.map((item: any) => item.type).join(", "));
      }
      
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // On commence à 1 pour ignorer l'email initial
        for (let i = 1; i < chatHistory.length; i += 2) {
          if (i+1 < chatHistory.length && chatHistory[i].type === 'user' && chatHistory[i+1].type === 'bot') {
            exchangeCount++;
            console.log(`DEBUG - Exchange found: ${i}:${chatHistory[i].type} and ${i+1}:${chatHistory[i+1].type}`);
          }
        }
      }
      
      // Nous supprimons l'intervention du système I AM CYBER
      // L'application ne fera plus de pause pour expliquer des concepts
      const isIamCyberIntervention = false;
      
      console.log(`DEBUG - Final exchange count: ${exchangeCount}`);
      
      // Ajouter des métadonnées structurées pour aider l'IA à suivre le flux de conversation
      const contextMetadata = {
        userName: userName,
        userRole: userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité",
        message: message,
        scenarioId: scenarioId,
        scenarioTitle: scenario.title,
        domain: scenario.domain,
        secteur: secteurActivite,
        contactName: respondingContact.name,
        contactRole: respondingContact.role,
        expertContactName: scenario.contact.name,
        expertContactRole: scenario.contact.role,
        exchangeCount: exchangeCount,
        isIamCyberIntervention: isIamCyberIntervention,
        conversationState: isFirstResponse ? "REPONSE_INITIALE" : 
                           isIamCyberIntervention ? "INTERVENTION_SYSTEM" : 
                           currentStage >= 3 && !isIamCyberIntervention && scenario.domain.includes("crise") ? "DECISION_CRISE" : 
                           "CONVERSATION_STANDARD",
        messageHistoryLength: chatHistory ? chatHistory.length : 0
      };
      
      // Créer un message unique qui contient toutes les informations nécessaires
      messages.push({
        role: "user",
        content: `Je suis ${userName}, ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}, et voici mon message : "${message}"

MÉTADONNÉES DE CONTEXTE:
${JSON.stringify(contextMetadata, null, 2)}

Utilise les métadonnées ci-dessus et le master prompt pour déterminer comment répondre selon le flux de conversation défini.

IMPORTANT:
- SI c'est une réponse initiale (REPONSE_INITIALE), réponds directement à ce que l'utilisateur dit concernant le problème que tu as exposé. EXPOSE CLAIREMENT le contexte, les enjeux et les attentes face au joueur. NE DEMANDE PAS à l'utilisateur de se présenter.
- SI nous sommes dans un scénario de gestion de crise (contexte DECISION_CRISE), je vais générer un point de décision. RÉPONDS EXCLUSIVEMENT AVEC UN FORMAT JSON comme celui-ci:
{
  "type": "decision",
  "situation": "Description concise de la situation actuelle qui nécessite une décision",
  "context": "Contexte détaillé expliquant pourquoi cette décision est nécessaire maintenant",
  "historicalFacts": "Faits pertinents à considérer pour prendre une décision éclairée",
  "consequences": "Conséquences potentielles de cette décision sur l'ensemble de la crise",
  "options": [
    {
      "id": "option1",
      "text": "Titre concis de l'option 1",
      "description": "Description détaillée de cette option",
      "impact": {
        "budget": -50000,
        "timeline": 2,
        "reputation": -3,
        "security": 8,
        "employment": false,
        "missionCritical": false
      }
    },
    {
      "id": "option2",
      "text": "Titre concis de l'option 2",
      "description": "Description détaillée de cette option",
      "impact": {
        "budget": -10000,
        "timeline": -1,
        "reputation": 2,
        "security": 4,
        "employment": false,
        "missionCritical": false
      }
    },
    {
      "id": "option3",
      "text": "Titre concis de l'option 3",
      "description": "Description détaillée de cette option",
      "impact": {
        "budget": -5000,
        "timeline": 5,
        "reputation": 5,
        "security": 3,
        "employment": false,
        "missionCritical": false
      }
    },
    {
      "id": "option4",
      "text": "Titre concis de l'option 4",
      "description": "Description détaillée de cette option",
      "impact": {
        "budget": -200000,
        "timeline": -3,
        "reputation": 7,
        "security": 9,
        "employment": true,
        "missionCritical": true
      }
    }
  ],
  "deadline": "Délai pour prendre cette décision",
  "urgencyLevel": "critique"
}
- Pour toutes les autres réponses, reste dans le contexte et réponds à la question en tant que le contact désigné. ADAPTE SYSTÉMATIQUEMENT ta réponse aux choix précédents du joueur et aux conséquences logiques de ces choix.
- IMPORTANT: Prends en compte que l'utilisateur est un ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"} et adapte rigoureusement ta réponse à son rôle spécifique, à ses responsabilités habituelles et à ses connaissances techniques.

Adapte toujours ton style de communication à ton rôle (${respondingContact.role}) et au secteur d'activité (${secteurActivite}), tout en tenant compte du rôle de l'utilisateur (${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}).`
      });
      
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
      );
      
      // Vérifier si la réponse est une décision de crise (au format JSON)
      let isCrisisDecision = false;
      let decisionContent;
      
      // Si c'est un scénario de crise à l'étape appropriée, vérifions si la réponse est au format JSON
      if (contextMetadata.conversationState === "DECISION_CRISE") {
        try {
          // Essayons de parser la réponse comme du JSON
          let jsonResponse = JSON.parse(responseContent);
          
          // Vérifions si c'est bien une décision
          if (jsonResponse && jsonResponse.type === "decision" && jsonResponse.options && Array.isArray(jsonResponse.options)) {
            isCrisisDecision = true;
            decisionContent = {
              id: uuidv4(),
              situation: jsonResponse.situation,
              context: jsonResponse.context,
              historicalFacts: jsonResponse.historicalFacts,
              consequences: jsonResponse.consequences,
              options: jsonResponse.options,
              deadline: jsonResponse.deadline,
              urgencyLevel: jsonResponse.urgencyLevel
            };
            console.log("DEBUG - Crisis decision detected", decisionContent.id);
          }
        } catch (e) {
          console.log("DEBUG - Response is not valid JSON, treating as regular response");
        }
      }
      
      // Check if response indicates scenario termination
      const isScenarioTerminated = !isCrisisDecision && (
        responseContent.toLowerCase().includes("fin du scénario") || 
        responseContent.toLowerCase().includes("recommencer à zéro") ||
        responseContent.toLowerCase().includes("recommencer le scénario")
      );
      
      // Si le scénario est terminé, générer une fiche d'évaluation
      if (isScenarioTerminated) {
        try {
          // Générer une fiche d'évaluation qui résume les performances de l'utilisateur
          const evaluationPrompt = `
Tu vas créer une fiche d'évaluation complète pour l'utilisateur ${userName} qui vient de terminer le scénario "${scenario.title}" dans le domaine "${scenario.domain}", dans le secteur d'activité ${secteurActivite}.

Voici l'historique complet de la conversation:
${chatHistory ? chatHistory.map((msg: any) => {
  if (msg.type === 'user') {
    return `${userName}: ${msg.content}`;
  } else if (msg.type === 'bot' && msg.contactName) {
    return `${msg.contactName} (${msg.contactRole}): ${msg.content}`;
  }
  return '';
}).join('\n\n') : ''}

${userName}: ${message}

${respondingContact.name} (${respondingContact.role}): ${responseContent}

Sur la base de cet échange, crée une fiche d'évaluation structurée avec les sections suivantes:

1. ÉVALUATION GLOBALE
   Synthèse de la performance de l'utilisateur avec une note sur 5 étoiles et un commentaire général adapté au contexte sectoriel (${secteurActivite}).

2. POINTS FORTS
   Liste 3-4 points spécifiques où l'utilisateur a bien répondu ou fait preuve de bonnes connaissances, en lien avec les enjeux du secteur.

3. AXES D'AMÉLIORATION
   Liste 3-4 points spécifiques où l'utilisateur pourrait améliorer ses réponses ou ses connaissances.

4. BONNES PRATIQUES
   Énumère 5-6 bonnes pratiques en cybersécurité qui s'appliquent à ce scénario spécifique et à ce secteur d'activité.

5. CONCEPTS CLÉS
   Résume 4-5 concepts importants de cybersécurité que ce scénario a mis en lumière, adaptés au contexte sectoriel.

6. COMPÉTENCES ACQUISES
   Liste 3-4 compétences concrètes que l'utilisateur a pu développer à travers ce scénario.

7. APPLICATIONS PRATIQUES
   Propose 3-4 façons d'appliquer ces connaissances dans un contexte professionnel réel.

8. RESSOURCES POUR APPROFONDIR
   Suggère quelques ressources (types de formations, certifications, articles) pour approfondir la thématique.

Format: Utilise des titres clairs et une présentation structurée qui facilite la lecture. Le texte doit être concis, instructif et directement applicable, avec des références spécifiques au secteur ${secteurActivite}.
`;

          // Obtenir l'évaluation via l'API OpenAI, adaptée au rôle du joueur
          const evaluationMessages: ChatCompletionRequestMessage[] = [
            {
              role: "system",
              content: `Tu es un expert en cybersécurité chargé d'évaluer la performance des apprenants dans des scénarios de simulation. 
Tu dois fournir des évaluations objectives, précises et constructives.

IMPORTANT - ADAPTATION AU RÔLE: L'apprenant a joué avec le rôle de ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}. 
Tu dois IMPÉRATIVEMENT adapter ton évaluation pour tenir compte de ce rôle spécifique:

- Si l'apprenant était RSSI: Évalue sa capacité à comprendre les enjeux stratégiques, à prendre des décisions de gouvernance et à communiquer avec les parties prenantes. Les compétences attendues concernent la gestion des risques, la conformité et la vision globale.

- Si l'apprenant était Hacker Éthique: Évalue sa capacité à identifier les vulnérabilités techniques, à comprendre les vecteurs d'attaque et à proposer des contre-mesures spécifiques. Les compétences attendues sont liées à l'analyse technique des failles.

- Si l'apprenant était Développeur: Évalue sa capacité à comprendre les enjeux de sécurité du code, à identifier les risques dans le développement d'applications et à proposer des pratiques de codage sécurisées. Les compétences attendues concernent le DevSecOps et la sécurité logicielle.

- Si l'apprenant était Administrateur Système: Évalue sa capacité à identifier les risques d'infrastructure, à proposer des mesures de durcissement et à gérer les contrôles d'accès. Les compétences attendues concernent la sécurité opérationnelle des systèmes.

- Si l'apprenant était Consultant: Évalue sa capacité à diagnostiquer les problèmes, à communiquer clairement et à proposer des solutions adaptées au contexte. Les compétences attendues concernent l'analyse, la pédagogie et la capacité à formuler des recommandations.`
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ];

          // Générer l'évaluation
          const evaluationContent = await openAIService.getChatCompletionWithCache(
            evaluationMessages,
            0.7,
            3000
          );

          // Nous n'avons plus besoin de générer un PDF avec l'évaluation
          // L'évaluation est directement incluse dans le message final

          // Inclure l'évaluation directement dans le message
          // Envoyer la réponse avec le drapeau de réinitialisation
          res.json({
            type: 'bot',
            content: responseContent + 
                    "\n\n**ÉVALUATION FINALE**\n\nVoici mon évaluation détaillée de votre performance dans ce scénario :",
            resetScenario: true,
            contactName: respondingContact.name,
            contactRole: respondingContact.role,
            scenarioContacts: availableContacts,
            evaluation: evaluationContent
          });
          
          return;
        } catch (error) {
          console.error('Error generating evaluation:', error);
          // En cas d'erreur, continuer sans évaluation
        }
      }
      
      // Si le scénario doit être réinitialisé à cause de messages hors sujet
      if (shouldResetScenario) {
        // Dans ce cas, on envoie une réponse spéciale indiquant la réinitialisation
        res.json({
          type: 'bot',
          content: `Je vois que nous nous éloignons un peu du sujet principal. 

Reprenons depuis le début pour mieux explorer ce scénario dans le domaine "${scenario.domain}".`,
          resetScenario: true,
          contactName: "Marion Lopez",
          contactRole: "Senior Partner et Directrice Marketing, Communication et RSE",
          scenarioContacts: availableContacts
        });
      } else {
        // Déterminer s'il s'agit d'une intervention système
        let iamCyberContent = null;
        let contactContent = null;
        
        // Debug logs pour comprendre l'état de la conversation
        console.log(`DEBUG - Response processing - Exchange count: ${exchangeCount}, isIamCyberIntervention: ${isIamCyberIntervention}`);
        
        if (isIamCyberIntervention) {
          console.log("DEBUG - This should be an I AM CYBER intervention");
          
          // Si c'est une intervention système, vérifier si la réponse commence par la formule attendue
          const interventionMarker = "Je me permets de faire une pause dans cette simulation pour résumer des concepts importants que vous abordez.";
          
          // Vérifier si la réponse contient le marqueur d'intervention
          if (responseContent.includes(interventionMarker)) {
            console.log("DEBUG - Intervention marker found in response");
            
            // Trouver où le système termine et où le contact reprend
            const contactResumePattern = /Je laisse maintenant .+ reprendre la conversation\./;
            const resumeMatch = responseContent.match(contactResumePattern);
            
            console.log("DEBUG - Resume match found:", !!resumeMatch);
            
            if (resumeMatch && resumeMatch.index !== undefined) {
              console.log(`DEBUG - Splitting content at index: ${resumeMatch.index}, match: "${resumeMatch[0]}"`);
              
              // Séparer le contenu en deux parties
              iamCyberContent = responseContent.substring(0, resumeMatch.index + resumeMatch[0].length).trim();
              contactContent = responseContent.substring(resumeMatch.index + resumeMatch[0].length).trim();
              
              console.log("DEBUG - I AM CYBER content length:", iamCyberContent.length);
              console.log("DEBUG - Contact content length:", contactContent.length);
              
              // Envoyer une réponse spéciale avec les deux contenus distincts
              res.json({ 
                type: 'bot',
                content: responseContent,
                isIAMCYBERIntervention: true,
                iamCyberContent: iamCyberContent,
                contactContent: contactContent,
                resetScenario: isScenarioTerminated,
                contactName: respondingContact.name,
                contactRole: respondingContact.role,
                scenarioContacts: availableContacts
              });
              console.log("DEBUG - Sent response with I AM CYBER intervention");
              return;
            } else {
              console.log("DEBUG - Could not find the end of I AM CYBER intervention");
            }
          } else {
            console.log("DEBUG - Intervention marker not found even though exchangeCount is 3");
            console.log("DEBUG - First 100 chars of response:", responseContent.substring(0, 100));
          }
        }
        
        // Si c'est une décision de crise, renvoyer le format spécial
        if (isCrisisDecision && decisionContent) {
          console.log("DEBUG - Sending crisis decision response");
          res.json({
            type: 'decision-choices',
            content: decisionContent,
            contactName: respondingContact.name,
            contactRole: respondingContact.role,
            scenarioContacts: availableContacts
          });
        } else {
          // Réponse standard
          res.json({ 
            type: 'bot',
            content: responseContent,
            resetScenario: isScenarioTerminated,
            contactName: respondingContact.name,
            contactRole: respondingContact.role,
            // Inclure la liste complète des contacts pour le prochain appel
            scenarioContacts: availableContacts
          });
        }
      }
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Failed to process message' });
    }
  });

  // Route de téléchargement de documents supprimée car nous n'utilisons plus de pièces jointes

  // Route de listage des documents supprimée car nous n'utilisons plus de pièces jointes

  app.get('/api/openai/status', async (req: Request, res: Response) => {
    try {
      const isConnected = await openAIService.checkConnection();
      res.json({
        connectionStatus: openAIService.getConnectionStatus(),
        currentModel: openAIService.getCurrentModelName(),
        currentModelKey: (openAIService as any).getCurrentModelKey?.() ?? 'standard',
        apiKeyType: openAIService.getCurrentApiKeyType(),
        lastCheck: openAIService.getLastConnectionCheck() || Date.now(),
        availableModels: (openAIService as any).getAvailableModels?.() ?? [],
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      res.status(500).json({ connectionStatus: 'disconnected' });
    }
  });

  app.get('/api/gemini/status', async (req: Request, res: Response) => {
    try {
      const isConnected = await geminiService.checkConnection();
      res.json({
        connectionStatus: geminiService.getConnectionStatus(),
        model: geminiService.getModelName(),
        lastCheck: geminiService.getLastConnectionCheck() || Date.now()
      });
    } catch (error) {
      console.error('Error checking Gemini status:', error);
      res.status(500).json({ connectionStatus: 'disconnected', error: 'Erreur lors de la vérification' });
    }
  });
  
  // Endpoint pour l'interaction avec les PNJ dans CYBERCHAOS
  app.post('/api/cyberchaos/npc-interaction', async (req: Request, res: Response) => {
    try {
      const { 
        contactType, 
        message, 
        gameState 
      } = req.body;
      
      if (!contactType || !message || !gameState) {
        return res.status(400).json({ 
          error: "Paramètres manquants dans la requête. Nécessite contactType, message et gameState." 
        });
      }
      
      console.log(`Interaction PNJ CYBERCHAOS avec ${contactType}`);
      
      // Vérifier si OpenAIService est disponible
      if (!openAIService) {
        return res.status(500).json({ 
          error: "Le service OpenAI n'est pas disponible actuellement." 
        });
      }
      
      // Créer un prompt contextualisé selon le type de contact et l'état du jeu
      let systemPrompt = `Tu es un PNJ de type "${contactType}" dans une simulation de crise cyber appelée CYBERCHAOS. 
      Le joueur joue le rôle du RSSI (Responsable Sécurité des Systèmes d'Information) de l'entreprise.
      
      Voici l'état actuel du jeu:
      - Phase: ${gameState.activePhase || 'détection'}
      - Temps écoulé: ${Math.floor(gameState.currentTime / 60)}h ${gameState.currentTime % 60}min
      - Score opérationnel: ${gameState.operationalScore}% (${gameState.operationalScore < 30 ? 'CRITIQUE' : gameState.operationalScore < 50 ? 'MAUVAIS' : gameState.operationalScore < 70 ? 'MOYEN' : 'BON'})
      - Score de réputation: ${gameState.reputationScore}% (${gameState.reputationScore < 30 ? 'CRITIQUE' : gameState.reputationScore < 50 ? 'MAUVAIS' : gameState.reputationScore < 70 ? 'MOYEN' : 'BON'})
      - Risque légal: ${gameState.legalRisk}% (${gameState.legalRisk > 70 ? 'CRITIQUE' : gameState.legalRisk > 50 ? 'ÉLEVÉ' : gameState.legalRisk > 30 ? 'MOYEN' : 'FAIBLE'})
      - Niveau de stress: ${gameState.stressLevel}% (${gameState.stressLevel > 70 ? 'CRITIQUE' : gameState.stressLevel > 50 ? 'ÉLEVÉ' : gameState.stressLevel > 30 ? 'MOYEN' : 'FAIBLE'})
      
      Les derniers événements:
      ${gameState.eventLog?.slice(-3).map((e: any) => `- ${e.time} min: ${e.event}`).join('\n') || 'Aucun événement récent'}
      
      Réponds comme si tu étais ${
        contactType === 'Presse' ? 'un journaliste cherchant des informations sur l\'incident. Tu es insistant, demandes des détails et cherches à obtenir des informations exclusives ou des failles dans la communication. Si la réputation est basse, tu es plus agressif dans tes questions.' : 
        contactType === 'Autorités' ? 'un représentant de l\'ANSSI ou d\'une autorité de régulation. Tu es formel, rigoureux et préoccupé par les aspects légaux et réglementaires. Tu exiges des actions concrètes et des reporting réguliers. Si le risque légal est élevé, tu es plus strict et directif.' :
        contactType === 'Communication' ? 'le responsable communication de l\'entreprise demandant des informations pour préparer des communiqués. Tu es préoccupé par l\'image de l\'entreprise et cherches à obtenir des informations précises pour mieux communiquer. Si la réputation est basse, tu es plus stressé et urgent dans tes demandes.' :
        contactType === 'Équipe technique' ? 'un membre de l\'équipe technique en charge de la remédiation. Tu utilises un vocabulaire technique précis, demandes des directives claires et reportes sur les défis techniques rencontrés. Si le score opérationnel est bas, tu es plus désespéré et communiques les problèmes critiques.' :
        'un dirigeant de l\'entreprise préoccupé par l\'impact business de la crise. Tu t\'inquiètes des conséquences financières, de l\'image de marque et des impacts futurs. Si le niveau de stress est élevé, tu es plus impatient et exigeant dans tes demandes.'
      }
      
      ANALYSE DU TON DU MESSAGE:
      - Si le message du joueur est court et vague, tu demandes plus de précisions.
      - Si le message contient des termes techniques précis, tu ajustes ton niveau de langage en conséquence.
      - Si le message est rassurant, tu montres un certain soulagement mais restes vigilant.
      - Si le message est alarmiste, tu réagis avec plus d'inquiétude ou d'urgence.
      - Si le message manque de professionnalisme, tu le fais remarquer subtilement.
      - Si le message est très directif, tu réagis en fonction de ton rôle (la presse pourrait être offensée, l'équipe technique pourrait être soulagée).
      
      Tu t'adaptes à la phase actuelle:
      - Phase de détection: tu demandes des informations sur l'incident, son étendue et sa gravité
      - Phase de confinement: tu es préoccupé par la limitation des dégâts et les actions immédiates
      - Phase d'éradication: tu t'intéresses à l'élimination de la menace et aux garanties de sécurité
      - Phase de reprise: tu cherches des informations sur le retour à la normale et les délais
      - Phase de bilan: tu veux des précisions sur les leçons apprises et les mesures préventives
      
      Réponds en 1 à 3 phrases maximum. Vas droit au but, évite les formules d'introduction comme "En tant que..." ou "Je comprends que...".`;
      
      console.log("Création du prompt personnalisé pour NPC interaction...");
      
      // Utiliser directement le service OpenAI standard
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
      
      console.log("Envoi du prompt pour NPC interaction...");
      
      openAIService.switchApiKey('secondary');
      const response = await openAIService.getChatCompletion(messages, 0.7, 150);
      
      // Renvoyer la réponse
      return res.json({
        response: response,
        contactType: contactType
      });
      
    } catch (error: any) {
      console.error("Erreur lors de l'interaction avec le PNJ CYBERCHAOS:", error);
      return res.status(500).json({ 
        error: error.message || "Une erreur est survenue lors de l'interaction avec le PNJ." 
      });
    }
  });
  
  app.post('/api/openai/chat', async (req: Request, res: Response) => {
    try {
      const { messages, model, temperature = 0.7, max_tokens = 500 } = req.body;
      
      console.log("Making API request for Escape the Breach...");
      
      if (!openAIService) {
        return res.status(500).json({ 
          error: "Le service IA n'est pas disponible actuellement." 
        });
      }
      
      const response = await openAIService.getChatCompletion(
        messages as any, 
        temperature, 
        max_tokens
      );
      
      // Extraire la réponse
      const completion = response;
      
      // Renvoyer la réponse
      return res.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: completion
            }
          }
        ]
      });
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API IA:", error);
      return res.status(500).json({ error: error.message || "Une erreur est survenue lors de la communication avec l'API" });
    }
  });

  app.post('/api/openai/reconnect', async (req: Request, res: Response) => {
    try {
      console.log('Reconnexion forcée demandée');
      const reconnectResult = await openAIService.forceReconnect();
      
      res.json({
        success: reconnectResult,
        message: reconnectResult ? 'Reconnexion réussie' : 'Reconnexion en cours, réessayez dans quelques instants',
        connectionStatus: openAIService.getConnectionStatus(),
        currentModel: openAIService.getCurrentModelName(),
        apiKeyType: openAIService.getCurrentApiKeyType(),
        lastCheck: openAIService.getLastConnectionCheck() || Date.now()
      });
    } catch (error) {
      console.error('Error during forced reconnection:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la tentative de reconnexion',
        connectionStatus: openAIService.getConnectionStatus(),
        error: error.message
      });
    }
  });
  
  // Route de compatibilité pour l'ancien endpoint
  app.get('/api/cyber/status', async (req: Request, res: Response) => {
    try {
      const isConnected = await openAIService.checkConnection();
      res.json({
        status: isConnected ? 'connected' : 'disconnected',
        lastCheck: openAIService.getLastConnectionCheck(),
        apiEndpoint: 'configured',
        currentApiKey: openAIService.getCurrentConfig(),
        modelName: openAIService.getCurrentModelName(),
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check API connection',
        time: new Date().toISOString()
      });
    }
  });
  
  // API pour les conversations du module Cyber Defense
  app.post('/api/cyber-defense/chat', async (req: Request, res: Response) => {
    try {
      const { 
        userMessage, 
        missionId, 
        missionContext, 
        currentObjective, 
        previousMessages, 
        targetContact,
        temperature,
        maxTokens
      } = req.body;
      
      if (!userMessage) {
        return res.status(400).json({ message: 'Message utilisateur requis' });
      }
      
      // Construire le prompt système pour la mission
      const missionPrompt = `Tu es "I AM CYBER", un assistant spécialisé en cybersécurité qui simule une mission de défense cyber.
      
Tu dois jouer le rôle d'un expert en cybersécurité qui interagit avec l'utilisateur dans le cadre de la mission suivante:
- Titre: ${missionContext.title}
- Scénario: ${missionContext.scenario}
- Difficulté: ${missionContext.difficulty}
- L'utilisateur joue le rôle de: ${missionContext.userRole}
- Objectif actuel: ${missionContext.objectives[currentObjective]?.description || "Non défini"}

Directives pour la réponse:
1. Réponds en utilisant un ton professionnel mais accessible
2. Adapte ton niveau technique à la difficulté de la mission (${missionContext.difficulty})
3. Utilise les connaissances à jour en matière de bonnes pratiques de cybersécurité
4. Si l'utilisateur mentionne spécifiquement un contact (${targetContact || "aucun"}), réponds en tant que cette personne
5. Si l'utilisateur semble prêt à prendre une décision importante, fournir une structure de décision claire
6. Évite de mentionner que tu es une IA ou un assistant, reste dans ton rôle
`;

      // Préparer les messages pour l'API
      const messages: ChatCompletionRequestMessage[] = [
        { role: "system", content: missionPrompt },
        ...previousMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: userMessage }
      ];
      
      // Appeler l'API OpenAI
      const response = await openAIService.getChatCompletionWithCache(
        messages,
        temperature || 0.7,
        maxTokens || 1000
      );
      
      // Analyser le contenu de la réponse pour déterminer le contact et le style
      let sender = "Expert";
      let senderRole = "Cybersécurité";
      
      // Si un contact spécifique a été ciblé, utiliser ce contact comme expéditeur
      if (targetContact) {
        const contact = missionContext.contacts.find((c: any) => c.name === targetContact);
        if (contact) {
          sender = contact.name;
          senderRole = contact.role;
        }
      } else {
        // Sinon, déterminer un contact approprié en fonction du contexte
        const keyword = userMessage.toLowerCase();
        
        // Associer des mots-clés aux contacts pour une réponse contextuelle
        for (const contact of missionContext.contacts) {
          const expertise = contact.expertise.toLowerCase();
          if (keyword.includes(expertise.split(' ')[0]) || 
              keyword.includes(contact.name.split(' ')[0].toLowerCase())) {
            sender = contact.name;
            senderRole = contact.role;
            break;
          }
        }
      }
      
      // Déterminer s'il faut déclencher une décision
      let decision = null;
      const shouldTriggerDecision = response.toLowerCase().includes('décision') || 
                                   response.toLowerCase().includes('choix') ||
                                   response.toLowerCase().includes('options') ||
                                   response.toLowerCase().includes('alternatives');
      
      if (shouldTriggerDecision && missionContext.objectives[currentObjective]?.decisions?.length > 0) {
        // Prendre la première décision disponible pour l'objectif actuel
        decision = missionContext.objectives[currentObjective].decisions[0];
      }
      
      // Déterminer si une réponse additionnelle d'un autre contact est appropriée
      let additionalResponse = null;
      const shouldAddColleagueResponse = Math.random() > 0.7; // 30% de chance d'avoir une réponse additionnelle
      
      if (shouldAddColleagueResponse && !decision) {
        // Sélectionner un contact différent du premier répondant
        const availableContacts = missionContext.contacts.filter((c: any) => c.name !== sender);
        
        if (availableContacts.length > 0) {
          const selectedContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
          
          // Créer un prompt pour la réponse additionnelle
          const colleaguePrompt = `
Tu es ${selectedContact.name}, ${selectedContact.role} dans l'entreprise. 
Tu dois réagir brièvement (2-3 phrases maximum) au message de ${sender} qui vient de dire: "${response}".
Ta réaction doit être cohérente avec ton rôle et ton expertise en ${selectedContact.expertise}.
Réponds directement sans introduction ni formule de politesse, comme si tu intervenais dans une conversation.`;

          const colleagueMessages: ChatCompletionRequestMessage[] = [
            { role: "system", content: colleaguePrompt },
            { role: "user", content: "Génère une réaction courte et professionnelle" }
          ];
          
          const colleagueResponse = await openAIService.getChatCompletionWithCache(
            colleagueMessages,
            0.8, // Légèrement plus créatif
            200  // Réponse courte
          );
          
          additionalResponse = {
            response: colleagueResponse,
            sender: selectedContact.name,
            senderRole: selectedContact.role
          };
        }
      }
      
      // Retourner la réponse complète
      res.json({
        response,
        sender,
        senderRole,
        additionalResponse,
        decision
      });
      
    } catch (error: any) {
      console.error('Error evaluating decision:', error);
      console.error('Error generating cyber defense response:', error);
      res.status(500).json({ 
        error: error.message || 'Error generating cyber defense response'
      });
    }
  });
  
  // API pour évaluer les décisions prises dans le module Cyber Defense
  app.post("/api/cyber-defense/evaluate-decision", evaluateDecision);
  
  // Switch modèle global : { model: 'standard' | 'eco' }
  app.post('/api/openai/switch-model', (req: Request, res: Response) => {
    try {
      const { model } = req.body;
      const ok = (openAIService as any).setModel?.(model);
      if (!ok) {
        return res.status(400).json({ status: 'error', message: `Modèle inconnu: ${model}` });
      }
      const catalog = (openAIService as any).getAvailableModels?.() ?? [];
      const selected = catalog.find((m: any) => m.key === model);
      console.log(`[Model switch] → ${model} (${selected?.modelId})`);
      res.json({ status: 'success', model, label: selected?.label, description: selected?.description });
    } catch (error) {
      console.error('Error switching model:', error);
      res.status(500).json({ status: 'error', message: 'Failed to switch model' });
    }
  });

  // Compatibilité ancienne route (primary/secondary → standard/eco)
  app.post('/api/cyber/switch-api-key', (req: Request, res: Response) => {
    try {
      const { keyType } = req.body;
      const model = keyType === 'secondary' ? 'eco' : 'standard';
      (openAIService as any).setModel?.(model);
      res.json({ status: 'success', currentApiKey: keyType, modelName: openAIService.getCurrentModelName() });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to switch API key' });
    }
  });

  app.post('/api/cyber/simple-chat', async (req: Request, res: Response) => {
    try {
      const { message, config } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message requis pour le chat' });
      }
      
      let systemPrompt = "Tu es un assistant spécialisé en cybersécurité qui aide les utilisateurs à comprendre et à se protéger contre les menaces informatiques.";
      
      if (config?.difficultyLevel === 'Débutant') {
        systemPrompt += " Tu utilises un langage simple et accessible, en évitant le jargon technique. Tu expliques les concepts de cybersécurité de manière basique pour les débutants.";
      } else if (config?.difficultyLevel === 'Expert') {
        systemPrompt += " Tu utilises un vocabulaire technique précis et tu apportes des informations détaillées et approfondies sur les sujets de cybersécurité pour un public expert.";
      } else {
        systemPrompt += " Tu adaptes ton langage pour un public ayant des connaissances intermédiaires en informatique, en expliquant les termes techniques lorsque nécessaire.";
      }
      
      if (config?.responseStyle === 'Détaillé et pédagogique') {
        systemPrompt += " Tes réponses sont détaillées et pédagogiques, avec des explications complètes et des exemples concrets pour illustrer les concepts.";
      } else if (config?.responseStyle === 'Concis et direct') {
        systemPrompt += " Tes réponses sont concises et directes, allant droit au but sans détours inutiles, en te concentrant sur l'essentiel.";
      } else {
        systemPrompt += " Ton style de communication est professionnel et équilibré, ni trop verbeux ni trop concis.";
      }
      
      systemPrompt += " Tu réponds toujours en français.";
      
      const response = await openAIService.getChatCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        config?.temperature || 0.7,
        config?.maxTokens || 800
      );
      
      res.json({ 
        response: response,
        usage: null
      });
      
    } catch (error: any) {
      console.error('Erreur lors du chat simple:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
    }
  });

  // API pour les communications liées aux missions de défense cyber
  app.post('/api/cyber-defense/chat', async (req: Request, res: Response) => {
    try {
      const { 
        userMessage, 
        missionId, 
        missionContext, 
        currentObjective, 
        previousMessages, 
        targetContact,
        temperature,
        maxTokens
      } = req.body;
      
      if (!userMessage) {
        return res.status(400).json({ message: 'Message utilisateur requis' });
      }
      
      // Construire le prompt système pour la mission
      const missionPrompt = `Tu es "I AM CYBER", un assistant spécialisé en cybersécurité qui simule une mission de défense cyber.
      
Tu dois jouer le rôle d'un expert en cybersécurité qui interagit avec l'utilisateur dans le cadre de la mission suivante:
- Titre: ${missionContext.title}
- Scénario: ${missionContext.scenario}
- Difficulté: ${missionContext.difficulty}
- L'utilisateur joue le rôle de: ${missionContext.userRole}
- Objectif actuel: ${missionContext.objectives[currentObjective]?.description || "Non défini"}

Directives pour la réponse:
1. Réponds en utilisant un ton professionnel mais accessible
2. Adapte ton niveau technique à la difficulté de la mission (${missionContext.difficulty})
3. Utilise les connaissances à jour en matière de bonnes pratiques de cybersécurité
4. Si l'utilisateur mentionne spécifiquement un contact (${targetContact || "aucun"}), réponds en tant que cette personne
5. Si l'utilisateur semble prêt à prendre une décision importante, fournir une structure de décision claire
6. Évite de mentionner que tu es une IA ou un assistant, reste dans ton rôle
`;

      // Préparer les messages pour l'API
      const messages: ChatCompletionRequestMessage[] = [
        { role: "system", content: missionPrompt },
        ...previousMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: userMessage }
      ];
      
      // Appeler l'API OpenAI
      const response = await openAIService.getChatCompletionWithCache(
        messages,
        temperature || 0.7,
        maxTokens || 1000
      );
      
      // Analyser le contenu de la réponse pour déterminer le contact et le style
      let sender = "Expert";
      let senderRole = "Cybersécurité";
      
      // Si un contact spécifique a été ciblé, utiliser ce contact comme expéditeur
      if (targetContact) {
        const contact = missionContext.contacts.find((c: any) => c.name === targetContact);
        if (contact) {
          sender = contact.name;
          senderRole = contact.role;
        }
      } else {
        // Sinon, déterminer un contact approprié en fonction du contexte
        const keyword = userMessage.toLowerCase();
        
        // Associer des mots-clés aux contacts pour une réponse contextuelle
        for (const contact of missionContext.contacts) {
          const expertise = contact.expertise.toLowerCase();
          if (keyword.includes(expertise.split(' ')[0]) || 
              keyword.includes(contact.name.split(' ')[0].toLowerCase())) {
            sender = contact.name;
            senderRole = contact.role;
            break;
          }
        }
      }
      
      // Déterminer s'il faut déclencher une décision
      let decision = null;
      const shouldTriggerDecision = response.toLowerCase().includes('décision') || 
                                   response.toLowerCase().includes('choix') ||
                                   response.toLowerCase().includes('options') ||
                                   response.toLowerCase().includes('alternatives');
      
      if (shouldTriggerDecision && missionContext.objectives[currentObjective]?.decisions?.length > 0) {
        // Prendre la première décision disponible pour l'objectif actuel
        decision = missionContext.objectives[currentObjective].decisions[0];
      }
      
      // Déterminer si une réponse additionnelle d'un autre contact est appropriée
      let additionalResponse = null;
      const shouldAddColleagueResponse = Math.random() > 0.7; // 30% de chance d'avoir une réponse additionnelle
      
      if (shouldAddColleagueResponse && !decision) {
        // Sélectionner un contact différent du premier répondant
        const availableContacts = missionContext.contacts.filter((c: any) => c.name !== sender);
        
        if (availableContacts.length > 0) {
          const selectedContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
          
          // Créer un prompt pour la réponse additionnelle
          const colleaguePrompt = `
Tu es ${selectedContact.name}, ${selectedContact.role} dans l'entreprise. 
Tu dois réagir brièvement (2-3 phrases maximum) au message de ${sender} qui vient de dire: "${response}".
Ta réaction doit être cohérente avec ton rôle et ton expertise en ${selectedContact.expertise}.
Réponds directement sans introduction ni formule de politesse, comme si tu intervenais dans une conversation.`;

          const colleagueMessages: ChatCompletionRequestMessage[] = [
            { role: "system", content: colleaguePrompt },
            { role: "user", content: "Génère une réaction courte et professionnelle" }
          ];
          
          const colleagueResponse = await openAIService.getChatCompletionWithCache(
            colleagueMessages,
            0.8, // Légèrement plus créatif
            200  // Réponse courte
          );
          
          additionalResponse = {
            response: colleagueResponse,
            sender: selectedContact.name,
            senderRole: selectedContact.role
          };
        }
      }
      
      // Retourner la réponse complète
      res.json({
        success: true,
        message: "Response generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating cyber defense response:', error);
      res.status(500).json({ 
        error: error.message || 'Error generating cyber defense response'
      });
    }
  });
  
  // Route for evaluating user decisions in cyber defense missions
  app.post('/api/cyber-defense/evaluate-decision', async (req: Request, res: Response) => {
    try {
      // Process the evaluation using the dedicated controller
      await handleCyberDefenseChat(req, res);
      
      // The response is handled by the controller directly
      return;
    } catch (error: any) {
      console.error('Error generating cyber defense response:', error);
      res.status(500).json({ 
        error: error.message || 'Error generating cyber defense response'
      });
    }
  });
  
  // Route for evaluating cyber defense decisions
  app.post('/api/cyber-defense/decision', async (req: Request, res: Response) => {
    try {
      const { 
        missionId, 
        missionContext, 
        decisionId, 
        choiceId, 
        currentObjective,
        userRole
      } = req.body;
      
      if (!missionId || !decisionId || !choiceId) {
        return res.status(400).json({ message: 'Informations de décision requises' });
      }
      
      // Trouver la décision et l'option choisie
      const objective = missionContext.objectives.find((obj: any) => obj.id === currentObjective);
      const decision = objective?.decisions.find((d: any) => d.id === decisionId);
      const choice = decision?.options.find((opt: any) => opt.id === choiceId);
      
      if (!decision || !choice) {
        return res.status(404).json({ message: 'Décision ou choix non trouvé' });
      }
      
      // Mettre à jour la mission avec le choix effectué
      const updatedMission = { ...missionContext };
      const objectiveIndex = updatedMission.objectives.findIndex((obj: any) => obj.id === currentObjective);
      const decisionIndex = updatedMission.objectives[objectiveIndex].decisions.findIndex((d: any) => d.id === decisionId);
      
      // Marquer la décision comme prise
      updatedMission.objectives[objectiveIndex].decisions[decisionIndex].madeChoice = choiceId;
      
      // Ajuster le score de la mission
      updatedMission.currentScore = (updatedMission.currentScore || 0) + choice.score;
      
      // Déterminer si l'objectif est complété (ici nous considérons qu'une bonne décision complète l'objectif)
      const objectiveCompleted = choice.score > 0;
      
      // Si l'objectif est complété, le marquer comme tel
      if (objectiveCompleted) {
        updatedMission.objectives[objectiveIndex].completed = true;
      }
      
      // Sélectionner un superviseur pour l'évaluation
      const supervisor = missionContext.supervisors?.[Math.floor(Math.random() * missionContext.supervisors.length)] || {
        name: "Direction",
        role: "Comité de direction"
      };
      
      // Générer l'évaluation de la décision avec OpenAI
      const evaluationPrompt = `
Tu es ${supervisor.name}, ${supervisor.role} dans une organisation. Tu dois évaluer une décision prise par ${userRole} dans le cadre d'une mission de cybersécurité.

Contexte de la décision:
- Mission: ${missionContext.title}
- Objectif: ${objective?.description}
- Décision à prendre: ${decision.description}
- Option choisie: ${choice.text}

Conséquences connues de ce choix:
- Points positifs: ${choice.consequences.positive.join(', ')}
- Points négatifs: ${choice.consequences.negative.join(', ')}
- Impact sur le score: ${choice.score > 0 ? 'Positif' : choice.score < 0 ? 'Négatif' : 'Neutre'}

Ta tâche:
Rédige une évaluation concise (3-4 phrases) de cette décision du point de vue de ${supervisor.name}. 
${choice.score > 0 ? 'Félicite pour ce bon choix tout en soulignant les aspects positifs.' : 
  choice.score < 0 ? 'Soulève poliment les problèmes de ce choix et suggère ce qui aurait pu être mieux fait.' : 
  'Donne un feedback nuancé, reconnaissant les aspects positifs mais suggérant des améliorations.'}

Réponds directement à la première personne comme si tu étais ${supervisor.name} qui s'adresse au ${userRole}.`;

      const evaluationMessages: ChatCompletionRequestMessage[] = [
        { role: "system", content: evaluationPrompt },
        { role: "user", content: "Génère une évaluation professionnelle de cette décision" }
      ];
      
      const evaluationContent = await openAIService.getChatCompletionWithCache(
        evaluationMessages,
        0.7,
        400
      );
      
      // Retourner l'évaluation et la mission mise à jour
      res.json({
        evaluation: {
          content: evaluationContent,
          supervisor: supervisor.name,
          supervisorRole: supervisor.role,
          objectiveCompleted
        },
        updatedMission
      });
      
    } catch (error: any) {
      console.error('Error evaluating decision:', error);
      res.status(500).json({
        error: error.message || 'Error during decision evaluation'
      });
    }
  });

  // Routes pour la simulation d'audition CYBER
  app.post('/api/cyber/interview-simulation/start', startInterviewSimulation);
  app.post('/api/cyber/interview-simulation/message', processInterviewMessage);
  app.post('/api/cyber/interview-simulation/complete', completeInterviewSimulation);
  app.post('/api/cyber/interview-simulation/analyze-notes', async (req, res) => {
    try {
      // Inclure le domaine 'cyber' dans le corps de la requête
      req.body.domain = 'cyber';
      // Transmettre à la fonction dédiée d'analyse des notes
      await analyzeInterviewNotes(req, res);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des notes:', error);
      res.status(500).json({ error: 'Erreur lors de l\'analyse des notes' });
    }
  });
  

  
  // Routes pour la simulation d'audition AMOA
  app.post('/api/amoa/interview-simulation/start', startInterviewSimulation);
  app.post('/api/amoa/interview-simulation/message', processInterviewMessage);
  app.post('/api/amoa/interview-simulation/complete', completeInterviewSimulation);
  app.post('/api/amoa/interview-simulation/analyze-notes', async (req, res) => {
    try {
      // Inclure le domaine 'amoa' dans le corps de la requête
      req.body.domain = 'amoa';
      // Transmettre à la fonction dédiée d'analyse des notes
      await analyzeInterviewNotes(req, res);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des notes:', error);
      res.status(500).json({ error: 'Erreur lors de l\'analyse des notes' });
    }
  });
  
  // Routes pour télécharger la synthèse d'audition en HTML
  app.post('/api/cyber/interview-simulation/download-synthesis', async (req, res) => {
    try {
      const { synthesis, candidateName, profileType, experienceLevel } = req.body;
      
      if (!synthesis) {
        return res.status(400).json({ error: 'Synthèse manquante' });
      }
      
      // Générer un document HTML formaté
      const htmlContent = generateSynthesisHtml('cyber', synthesis, candidateName, profileType, experienceLevel);
      
      // Configurer les en-têtes pour téléchargement
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="synthese_audition_${candidateName || 'consultant'}.html"`);
      
      // Envoyer le contenu HTML
      res.send(htmlContent);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier de synthèse:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du fichier de synthèse' });
    }
  });
  
  // Routes pour l'Expert Cyber Conversationnel
  app.post('/api/cyber/agent/start', (req, res) => {
    // S'assurer que les en-têtes sont correctement configurés pour JSON
    res.setHeader('Content-Type', 'application/json');
    return startAgentSession(req, res);
  });
  
  app.post('/api/cyber/agent/complete', (req, res) => {
    // S'assurer que les en-têtes sont correctement configurés pour JSON
    res.setHeader('Content-Type', 'application/json');
    return completeAgentSession(req, res);
  });
  
  app.post('/api/amoa/interview-simulation/download-synthesis', async (req, res) => {
    try {
      const { synthesis, candidateName, profileType, experienceLevel, sectorFocus } = req.body;
      
      if (!synthesis) {
        return res.status(400).json({ error: 'Synthèse manquante' });
      }
      
      // Générer un document HTML formaté
      const htmlContent = generateSynthesisHtml('amoa', synthesis, candidateName, profileType, experienceLevel, sectorFocus);
      
      // Configurer les en-têtes pour téléchargement
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="synthese_audition_${candidateName || 'consultant'}.html"`);
      
      // Envoyer le contenu HTML
      res.send(htmlContent);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier de synthèse:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du fichier de synthèse' });
    }
  });

  // Routes pour les scénarios préconçus de "Qui est l'imposteur"
  app.get('/api/amoa/scenarios', (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 6;
      const scenarios = getRandomScenarios(count);
      
      res.json({
        scenarios,
        fromCache: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des scénarios:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des scénarios",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  app.get('/api/amoa/scenarios/:difficulty', (req, res) => {
    try {
      const { difficulty } = req.params;
      const count = parseInt(req.query.count as string) || 6;
      
      if (!['facile', 'moyen', 'difficile'].includes(difficulty)) {
        return res.status(400).json({ error: "Niveau de difficulté invalide" });
      }
      
      const scenarios = getScenariosByDifficulty(difficulty, count);
      
      res.json({
        scenarios,
        difficulty,
        count: scenarios.length
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des scénarios par difficulté:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des scénarios",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  
  app.get('/api/amoa/scenario/:id', (req, res) => {
    try {
      const { id } = req.params;
      const scenario = getScenarioById(id);
      
      if (!scenario) {
        return res.status(404).json({ error: "Scénario non trouvé" });
      }
      
      res.json({ scenario });
    } catch (error) {
      console.error("Erreur lors de la récupération du scénario:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération du scénario",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Routes pour le Test de Réflexes AMOA gamifié avec IA
  app.post('/api/amoa/reflex-test/evaluate', evaluateUserPerformance);
  app.get('/api/amoa/reflex-test/generate-questions', generateAmoaQuestions);
  app.post('/api/amoa/reflex-test/feedback', generateFeedbackMessage);

  // Routes pour les fonctionnalités d'apprentissage
  app.post('/api/cyber/debriefing', generateDebriefing);
  
  // Routes pour la progression des utilisateurs dans les modules d'apprentissage
  app.get('/api/learning/progress/:userId/:moduleId', getUserProgress);
  app.post('/api/learning/progress', saveUserProgress);
  app.get('/api/cyber/documentation', getContextualDocumentation);
  
  // ======= CENTRE DE CRISE CYBER =======
  
  // Récupérer tous les incidents actifs
  app.get('/api/cyber/crisis/incidents', getActiveIncidents);
  
  // Récupérer les détails d'un incident spécifique
  app.get('/api/cyber/crisis/incidents/:incidentId', getIncidentDetails);
  
  // Récupérer les experts disponibles pour un incident
  app.get('/api/cyber/crisis/experts/:incidentId', getExpertsForIncident);
  
  // Envoyer un message à un expert et obtenir sa réponse
  app.post('/api/cyber/crisis/message', handleExpertMessage);
  
  // Exécuter une action dans la gestion d'incident
  app.post('/api/cyber/crisis/action', executeAction);
  
  // Récupérer la session de crise d'un utilisateur
  app.get('/api/cyber/crisis/session/:userId/:incidentId', getCrisisSession);

  // Routes pour le nouveau module Cyber Agent (version 2)
  app.get('/api/cyber/cyber-agent/roles', (req, res) => {
    // Définition des rôles disponibles pour le module Cyber Agent v2
    const roles = [
      {
        id: 'rssi',
        title: 'Responsable Sécurité des Systèmes d\'Information (RSSI)',
        description: 'Vous êtes responsable de la stratégie de sécurité et de la conformité de l\'entreprise.',
      },
      {
        id: 'ethical-hacker',
        title: 'Ethical Hacker',
        description: 'Vous êtes spécialisé(e) dans l\'identification des vulnérabilités via des tests d\'intrusion.',
      },
      {
        id: 'developer',
        title: 'Développeur Sécurité',
        description: 'Vous intégrez les principes de sécurité dès la conception des applications (Security by Design).',
      },
      {
        id: 'sysadmin',
        title: 'Administrateur Systèmes',
        description: 'Vous gérez l\'infrastructure IT et assurez sa sécurisation au quotidien.',
      },
      {
        id: 'consultant',
        title: 'Consultant Cybersécurité',
        description: 'Vous conseillez différentes organisations sur leurs problématiques de sécurité.',
      }
    ];

    res.json({ roles });
  });

  app.post('/api/cyber/cyber-agent/start-session', (req, res) => {
    try {
      const { role, level, userName } = req.body;
      
      if (!role || !level || !userName) {
        return res.status(400).json({ error: 'Paramètres manquants (rôle, niveau ou nom d\'utilisateur)' });
      }
      
      // Génération d'un ID de session unique
      const sessionId = uuidv4();
      
      // Configuration de la session en fonction du rôle et du niveau
      const session = {
        id: sessionId,
        role,
        level,
        userName,
        startTime: new Date().toISOString(),
        messages: [],
        status: 'active'
      };
      
      // Dans une version production, on sauvegarderait cette session en base de données
      // Pour cette implémentation, nous renvoyons simplement les informations de session
      
      res.status(201).json({
        success: true,
        session
      });
    } catch (error) {
      console.error('Erreur lors de la création de la session Cyber Agent:', error);
      res.status(500).json({
        error: 'Erreur lors de la création de la session',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  // Route pour envoyer le brief de mission après confirmation de l'utilisateur
  app.post('/api/cyber/send-mission-brief', async (req, res) => {
    try {
      const { userRole, domain, userName, companyName } = req.body;
      
      if (!userRole || !domain || !userName) {
        return res.status(400).json({ error: 'Paramètres manquants (rôle, domaine ou nom d\'utilisateur)' });
      }

      // Générer un ID unique pour ce brief
      const briefId = uuidv4();
      
      // Obtenir la date actuelle
      const today = new Date();
      const formattedDate = today.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Déterminer les problèmes et tâches en fonction du domaine
      let problems = [];
      let resources = [];
      let budget = 0;
      let deadlineInDays = 7;
      
      // Personnaliser le contenu selon le domaine et le rôle
      if (domain.toLowerCase().includes('ransomware') || domain.toLowerCase().includes('rançon')) {
        problems = [
          "Un ransomware a chiffré plusieurs serveurs critiques",
          "Les sauvegardes les plus récentes pourraient être compromises",
          "La communication avec la Direction est tendue suite à une récente perte de données"
        ];
        resources = [
          "Équipe technique de 3 administrateurs systèmes",
          "Service juridique disponible pour consultation",
          "Possibilité de faire appel à une entreprise spécialisée (coût supplémentaire)"
        ];
        budget = userRole.toLowerCase().includes('directeur') || userRole.toLowerCase().includes('rssi') ? 25000 : 15000;
        deadlineInDays = 3;
      } else if (domain.toLowerCase().includes('audit') || domain.toLowerCase().includes('conformité')) {
        problems = [
          "L'audit de conformité RGPD doit être complété en urgence",
          "Plusieurs non-conformités ont été identifiées lors d'un pré-audit",
          "Documentation des procédures de sécurité incomplète"
        ];
        resources = [
          "Un juriste spécialisé en droit numérique",
          "Un analyste en conformité réglementaire",
          "Accès aux précédents rapports d'audit"
        ];
        budget = userRole.toLowerCase().includes('directeur') || userRole.toLowerCase().includes('dpo') ? 18000 : 12000;
        deadlineInDays = 14;
      } else {
        // Cas par défaut - incident de sécurité général
        problems = [
          "Une intrusion a été détectée sur le réseau de l'entreprise",
          "Plusieurs comptes utilisateurs semblent compromis",
          "Un serveur critique présente un comportement anormal"
        ];
        resources = [
          "Équipe de 2 analystes en sécurité",
          "Outils d'analyse forensique disponibles",
          "Assistance du fournisseur d'infrastructure cloud possible"
        ];
        budget = userRole.toLowerCase().includes('directeur') || userRole.toLowerCase().includes('rssi') ? 20000 : 10000;
        deadlineInDays = 5;
      }
      
      // Calculer la date limite
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + deadlineInDays);
      const formattedDeadline = deadline.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Créer l'email de brief de mission
      const email = {
        id: briefId,
        from: {
          name: "Thomas Bernard",
          role: `Directeur des Opérations, ${companyName}`,
          company: companyName || "mc2i"
        },
        to: userName,
        subject: `URGENT: Brief de mission - ${domain}`,
        date: today.toISOString(),
        body: `Bonjour ${userName},

Suite à notre discussion initiale et à votre confirmation, je vous envoie comme convenu le brief détaillé de votre mission.

**CONTEXTE ET PROBLÉMATIQUES IDENTIFIÉES**

Nous faisons face aux problèmes suivants qui requièrent votre expertise immédiate:

1. ${problems[0]}
2. ${problems[1]}
3. ${problems[2]}

**RESSOURCES À VOTRE DISPOSITION**

Pour mener à bien cette mission, vous aurez accès aux ressources suivantes:
* ${resources[0]}
* ${resources[1]}
* ${resources[2]}

**BUDGET ET CONTRAINTES**

Budget alloué: ${budget.toLocaleString('fr-FR')} € 
Ce budget devra être géré avec rigueur. Chaque décision prise impactera les ressources disponibles.

Date limite de résolution: ${formattedDeadline}
Le non-respect de cette échéance ou une mauvaise gestion du budget pourra entraîner une révision de votre mission.

**RÈGLES D'ENGAGEMENT**

1. Vous devez strictement répondre aux problématiques identifiées ci-dessus.
2. Chaque action entreprise sera évaluée sur sa pertinence et son impact sur le budget.
3. Vous pouvez déléguer certaines tâches à votre équipe, mais vous restez responsable des résultats.
4. Des décisions inappropriées entraineront une réduction de votre budget disponible.
5. Une série d'erreurs graves pourra conduire à l'arrêt immédiat de la mission.

Merci de confirmer la bonne réception de ce brief et de me tenir informé de vos premières analyses.

Cordialement,

Thomas Bernard
Directeur des Opérations
${companyName || "mc2i"}`,
        scenarioContacts: [
          {
            name: "Thomas Bernard",
            role: "Directeur des Opérations",
            expertise: "Gestion de projets et allocation des ressources",
            concern: "Respect du budget et des délais"
          },
          {
            name: "Sophie Moreau",
            role: "Directrice Juridique",
            expertise: "Aspects réglementaires et conformité",
            concern: "Risques légaux et impact réputationnel"
          },
          {
            name: "Marc Dubois",
            role: "Responsable Technique",
            expertise: "Infrastructure IT et résolution d'incidents",
            concern: "Impact technique et continuité de service"
          }
        ],
        attachments: [
          {
            filename: `Brief_Mission_${briefId.substring(0, 8)}.pdf`,
            type: "confidential_memo",
            size: 2458621
          }
        ]
      };
      
      res.json({ email, success: true });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du brief de mission:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du brief de mission',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  /**
   * Génère des options de décision initiales pour un scénario de crise
   * Ces options auront des impacts réels sur la suite du scénario
   */
  const generateInitialCrisisOptions = async (
    domain: string,
    userName: string,
    userRole: string,
    currentStage: number
  ): Promise<CrisisDecisionContent> => {
    // Identifier le type de crise en fonction du domaine
    let crisisType = "incident de sécurité";
    let situationPrefix = "Un incident de sécurité";
    
    if (domain.includes("ransomware") || domain.includes("malware")) {
      crisisType = "attaque par ransomware";
      situationPrefix = "Une attaque par ransomware";
    } else if (domain.includes("phishing") || domain.includes("ingénierie sociale")) {
      crisisType = "campagne de phishing ciblée";
      situationPrefix = "Une campagne de phishing sophistiquée";
    } else if (domain.includes("fuite") || domain.includes("données")) {
      crisisType = "fuite de données sensibles";
      situationPrefix = "Une fuite de données client";
    } else if (domain.includes("ddos") || domain.includes("déni")) {
      crisisType = "attaque par déni de service";
      situationPrefix = "Une attaque DDoS massive";
    } else if (domain.includes("chaîne") || domain.includes("supply")) {
      crisisType = "compromission de la chaîne d'approvisionnement";
      situationPrefix = "Une compromission chez un fournisseur critique";
    }
    
    // Génération de la situation centrale spécifique au type de crise
    const situation = `${situationPrefix} vient d'être détectée dans notre infrastructure critique. Nous avons des preuves d'activité suspecte depuis les dernières 24 heures et plusieurs systèmes semblent affectés.`;
    
    // Contexte enrichi de la décision
    const context = `Cette ${crisisType} présente des caractéristiques inhabituelles indiquant qu'il pourrait s'agir d'une attaque ciblée et non opportuniste. Nos équipes opérationnelles ont mis en place les premières mesures de confinement, mais nous devons rapidement définir une stratégie de réponse plus complète.`;
    
    // Faits historiques pertinents
    const historicalFacts = `Les ${crisisType}s ont augmenté de 47% dans notre secteur d'activité ces douze derniers mois. Trois entreprises concurrentes ont récemment fait face à des incidents similaires, avec des impacts financiers allant de 2 à 8 millions d'euros et des interruptions de service de plusieurs jours.`;
    
    // Conséquences potentielles 
    const consequences = `Si nous ne réagissons pas de manière appropriée, cet incident pourrait entraîner des perturbations opérationnelles majeures, des pertes financières importantes, des fuites de données clients et une atteinte à notre réputation. Les premières estimations suggèrent un impact potentiel sur plus de 30% de nos systèmes critiques.`;
    
    // Génération des 4 options avec des impacts différents et réalistes
    const options: CrisisDecisionOption[] = [
      {
        id: "option1",
        text: "Confinement prioritaire et investigation approfondie",
        description: "Isoler immédiatement tous les systèmes potentiellement compromis, même ceux critiques pour l'activité, et lancer une investigation approfondie avec nos ressources internes avant de planifier la remédiation.",
        impact: {
          budget: -5, // Impact légèrement négatif sur le budget
          timeline: 3, // Délai supplémentaire 
          security: 8, // Très bon impact sur la sécurité
          reputation: 2, // Impact modéré sur la réputation (réaction sérieuse)
          employment: false // Pas d'impact sur l'emploi
        }
      },
      {
        id: "option2",
        text: "Faire appel à un prestataire externe spécialisé",
        description: "Contacter immédiatement un cabinet de réponse à incident externe, leur donner accès complet à nos systèmes et suivre leurs recommandations pour la gestion de cette crise.",
        impact: {
          budget: -20, // Impact négatif significatif sur le budget
          timeline: -2, // Gain de temps grâce à l'expertise externe
          security: 9, // Excellent impact sur la sécurité
          reputation: 5, // Bon impact sur la réputation (solution professionnelle)
          employment: false // Pas d'impact direct sur l'emploi
        }
      },
      {
        id: "option3",
        text: "Remédiation rapide et retour à la normale",
        description: "Prioriser le nettoyage et la restauration rapide des systèmes affectés pour minimiser l'impact sur l'activité, en utilisant les sauvegardes disponibles et en déployant des correctifs accélérés.",
        impact: {
          budget: -8, // Impact négatif modéré sur le budget
          timeline: -1, // Léger gain de temps (retour rapide)
          security: -3, // Impact négatif sur la sécurité (risque de ne pas traiter la cause profonde)
          reputation: -2, // Impact légèrement négatif sur la réputation (solution potentiellement incomplète)
          employment: false, // Pas d'impact direct sur l'emploi
          missionCritical: true // Pourrait conduire à l'échec de la mission si l'attaque persiste
        }
      },
      {
        id: "option4",
        text: "Restructuration radicale de l'équipe et des process",
        description: "Considérer cet incident comme une défaillance majeure de notre approche sécurité. Réorganiser l'équipe cybersécurité avec de nouveaux talents, revoir complètement nos processus et investir massivement dans de nouvelles technologies de défense.",
        impact: {
          budget: -35, // Impact très négatif sur le budget (investissement massif)
          timeline: 7, // Délai important
          security: 10, // Impact maximal sur la sécurité à long terme
          reputation: 4, // Bon impact sur la réputation (démarche sérieuse)
          employment: true, // Impact sur l'emploi (changements d'équipe)
          missionCritical: false 
        }
      }
    ];
    
    // Création de l'objet de décision complet
    const decision: CrisisDecisionContent = {
      id: uuidv4(),
      situation,
      context,
      historicalFacts,
      consequences,
      options,
      deadline: "12 heures",
      urgencyLevel: "élevée"
    };
    
    return decision;
  }

  // API route pour traiter les choix de décision de crise
  app.post('/api/cyber/decision', async (req: Request, res: Response) => {
    try {
      const { 
        userName, 
        userRole, 
        domain,
        scenarioId, 
        decisionId, 
        optionId, 
        chatHistory, 
        currentStage,
        action,
        companyName
      } = req.body;
      
      // Cas spécial : démarrage de la situation de crise après briefing
      if (action === 'START_CRISIS') {
        if (!userName || !domain) {
          return res.status(400).json({ message: 'Paramètres manquants pour démarrer la simulation de crise' });
        }
        
        // Informations pour le scénario
        const budget = Math.floor(Math.random() * 50000) + 150000; // Budget entre 150k et 200k euros
        const deadlineInDays = Math.floor(Math.random() * 30) + 30; // Entre 30 et 60 jours
        const teamSize = Math.floor(Math.random() * 5) + 3; // Entre 3 et 7 personnes
        
        // Déterminer qui va être le contact principal basé sur le domaine
        let contactName = "Thomas Mercier";
        let contactRole = "RSSI";
        
        if (domain.includes("finance") || domain.includes("banque")) {
          contactName = "Lorenzo Bertola";
          contactRole = "Directeur du pôle BFA";
        } else if (domain.includes("energie") || domain.includes("utilities")) {
          contactName = "Anthony Frescal";
          contactRole = "Directeur du pôle ENERGIES & UTILITIES";
        } else if (domain.includes("technique") || domain.includes("digital")) {
          contactName = "Nosing Doeuk";
          contactRole = "Directeur du pôle DIXIT";
        }
        
        // Adapter le message de bienvenue en fonction du rôle
        let roleSpecificInfo = '';
        
        // Déterminer les informations spécifiques au rôle
        if (userRole === 'rssi') {
          roleSpecificInfo = `
- Une équipe de ${teamSize} experts en sécurité a été mise sous votre direction
- Vous disposez d'une autorité décisionnelle sur le plan de sécurité`;
        } else if (userRole === 'consultant') {
          roleSpecificInfo = `
- Une équipe de ${teamSize - 1} consultants juniors collaborera avec vous
- Vous interviendrez en tant que lead consultant sur cette mission`;
        } else if (userRole === 'admin') {
          roleSpecificInfo = `
- Une équipe de ${teamSize - 2} administrateurs systèmes travaillera avec vous
- Vous avez les accès privilégiés sur tous les systèmes concernés`;
        } else if (userRole === 'developpeur') {
          roleSpecificInfo = `
- Vous intégrez l'équipe de développement sécurité de ${teamSize} personnes
- Vous reporterez au Lead Developer, Mathieu Pesin`;
        } else if (userRole === 'hacker') {
          roleSpecificInfo = `
- Vous dirigerez une équipe Red Team de ${teamSize - 1} personnes
- Vous avez carte blanche pour les tests d'intrusion éthiques`;
        } else {
          roleSpecificInfo = `
- Une équipe de ${teamSize} personnes a été mise sous votre direction
- Vous disposez d'une autorité technique complète pour cette mission`;
        }
        
        // Déterminer la structure hiérarchique en fonction du rôle
        let hierarchyInfo = '';
        if (userRole === 'developpeur') {
          hierarchyInfo = `Je serai votre point de contact principal, et vous reporterez directement à Mathieu Pesin, notre Lead Developer.`;
        } else if (userRole === 'admin') {
          hierarchyInfo = `Je serai votre point de contact principal, et vous reporterez à Nosing Doeuk, Directeur du pôle DIXIT.`;
        } else {
          hierarchyInfo = `Je serai votre point de contact principal, et vous rendrez compte directement à Olivier Hervo, notre Directeur Général.`;
        }
        
        // Message de bienvenue à la situation de crise
        const welcomeMessage = `Bonjour ${userName}, je suis ${contactName}, ${contactRole} chez ${companyName || 'mc2i'}.
        
Suite à la validation du brief, nous lançons officiellement ce projet critique. Votre rôle de ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"} sera déterminant pour sa réussite.

Je vous confirme les éléments suivants :
- Un budget de ${budget.toLocaleString('fr-FR')} € a été alloué à cette mission${roleSpecificInfo}
- Nous devons résoudre cette situation dans un délai de ${deadlineInDays} jours

${hierarchyInfo}

La situation nécessite maintenant des décisions stratégiques de votre part. Voici les premiers éléments à traiter.`;
        
        // Génération des options de décision dynamiques basées sur le domaine
        const decision = await generateInitialCrisisOptions(domain, userName, userRole, currentStage);
        
        return res.json({
          success: true,
          welcomeMessage,
          contactName,
          contactRole,
          decision,
          metadata: {
            budget,
            deadlineInDays,
            teamSize,
            domain
          }
        });
      }
      
      // Cas standard : traitement d'une décision
      if (!userName || !decisionId || !optionId || (!scenarioId && !domain)) {
        return res.status(400).json({ message: 'Paramètres manquants pour traiter la décision' });
      }
      
      // Rechercher les détails du scénario
      const scenarios = [
        // Ingénierie sociale et phishing
        {
          id: "phishing-awareness",
          title: "Sensibilisation aux attaques de phishing",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "social-engineering-incident",
          title: "Gestion d'un incident d'ingénierie sociale",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "advanced-social-attacks",
          title: "Prévention des attaques sophistiquées",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "security-awareness",
          title: "Sensibilisation aux enjeux de la stratégie cyber",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Julien Grimault",
            role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité avancée",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Gestion de crise
        {
          id: "crisis-basics",
          title: "Introduction à la gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Nosing Doeuk",
            role: "Senior Partner - Directeur du pôle DIXIT"
          },
          difficulty: "Débutant"
        },
        {
          id: "crisis-plan",
          title: "Plan de gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Guillaume Lechevallier",
            role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque avancée par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        
        // Supply Chain
        {
          id: "supply-chain-basics",
          title: "Introduction aux risques de la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Marie Bernard",
            role: "Responsable Achats"
          },
          difficulty: "Débutant"
        },
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles / RGPD
        {
          id: "data-compliance-intro",
          title: "Initiation aux fondamentaux du RGPD",
          domain: "Protection des données personnelles et conformité",
          contact: {
            name: "Marjorie Durand",
            role: "Délégué à la Protection des Données"
          },
          difficulty: "Débutant"
        },
        {
          id: "dpia-workshop",
          title: "Conduire une analyse d'impact (DPIA)",
          domain: "Protection des données personnelles et conformité",
          contact: {
            name: "Jean-Marc Guyot",
            role: "Senior Partner et Directeur du pôle FSI"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données",
          domain: "Protection des données personnelles et conformité",
          contact: {
            name: "Laëtitia Bénard",
            role: "Senior Partner - Directrice d'unité"
          },
          difficulty: "Expert"
        },
        
        // Cybersécurité opérationnelle
        {
          id: "soc-basics",
          title: "Fondamentaux des opérations de sécurité",
          domain: "Cybersécurité opérationnelle",
          contact: {
            name: "Thomas Legrand",
            role: "Responsable SOC"
          },
          difficulty: "Débutant"
        },
        {
          id: "incident-handling",
          title: "Gestion des incidents de sécurité",
          domain: "Cybersécurité opérationnelle",
          contact: {
            name: "Cyril Delannoy",
            role: "Senior Partner et Directeur Technique"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "threat-hunting",
          title: "Détection avancée de menaces",
          domain: "Cybersécurité opérationnelle",
          contact: {
            name: "Olivier Colas",
            role: "Expert en analyse des menaces"
          },
          difficulty: "Expert"
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: 'Scénario non trouvé' });
      }
      
      // Récupérer la décision spécifique à partir de l'historique du chat
      let decisionDetails: CrisisDecisionContent | undefined;
      if (chatHistory && Array.isArray(chatHistory)) {
        // Rechercher le message contenant la décision avec l'ID spécifié
        const decisionMessage = chatHistory.find(msg => 
          msg.type === 'decision-choices' && 
          typeof msg.content === 'object' && 
          msg.content && 
          (msg.content as any).id === decisionId
        );
        
        if (decisionMessage && typeof decisionMessage.content === 'object') {
          decisionDetails = decisionMessage.content as CrisisDecisionContent;
        }
      }
      
      if (!decisionDetails) {
        return res.status(404).json({ message: 'Détails de la décision non trouvés dans l\'historique' });
      }
      
      // Trouver l'option choisie
      const selectedOption = decisionDetails.options.find((opt: { id: string }) => opt.id === optionId);
      if (!selectedOption) {
        return res.status(404).json({ message: 'Option sélectionnée non trouvée' });
      }
      
      // Générer le prompt système pour expliquer les conséquences de la décision
      const systemPrompt = `Tu es un expert en cybersécurité dans le cadre d'un scénario de ${scenario.domain}. 
L'utilisateur vient de prendre une décision importante pour la suite du scénario.

CONTEXTE DE LA DÉCISION:
- Scénario: ${scenario.title} (${scenario.domain})
- Difficulté: ${scenario.difficulty}
- Utilisateur: ${userName}, jouant le rôle de ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}
- Étape actuelle: ${currentStage}

DÉCISION PRISE:
- Situation: ${decisionDetails.situation}
- Option choisie: ${selectedOption.text}
- Description de l'option: ${selectedOption.description}

IMPACTS DE LA DÉCISION:
- Impact budgétaire: ${selectedOption.impact.budget ? selectedOption.impact.budget + '€' : 'Aucun'}
- Impact sur le calendrier: ${selectedOption.impact.timeline ? (selectedOption.impact.timeline > 0 ? '+' + selectedOption.impact.timeline + ' jours' : selectedOption.impact.timeline + ' jours') : 'Aucun'}
- Impact sur la réputation: ${selectedOption.impact.reputation ? (selectedOption.impact.reputation > 0 ? 'Positif (' + selectedOption.impact.reputation + '/10)' : 'Négatif (' + selectedOption.impact.reputation + '/10)') : 'Aucun'}
- Impact sur la sécurité: ${selectedOption.impact.security ? (selectedOption.impact.security > 0 ? 'Amélioration (' + selectedOption.impact.security + '/10)' : 'Dégradation (' + selectedOption.impact.security + '/10)') : 'Aucun'}
- Impact sur les employés: ${selectedOption.impact.employment ? 'Possible licenciement ou réorganisation' : 'Aucun'}
- Impact critique sur la mission: ${selectedOption.impact.missionCritical ? 'Décision pouvant mettre fin à la mission ou la compromettre gravement' : 'Impact modéré sur la mission'}

INSTRUCTIONS:
En tant que responsable à ${scenario.contact.role}, explique de manière réaliste:
1. Les CONSÉQUENCES IMMÉDIATES de cette décision 
2. Comment cette décision va INFLUENCER LA SUITE du scénario
3. Les NOUVELLES PRÉOCCUPATIONS générées par cette décision
4. Une brève réaction personnelle alignée avec ton rôle de ${scenario.contact.role}

Ton ton doit être professionnel, informatif et adapté au niveau de responsabilité de ton poste dans l'organisation.
Ta réponse doit refléter la complexité des choix en cybersécurité sans être trop technique.`;

      // Générer la réponse via OpenAI
      const messages: ChatCompletionRequestMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Je suis ${userName}, ${userRole ? getUserRoleDescription(userRole) : "expert en cybersécurité"}, et j'ai choisi l'option: "${selectedOption.text}" pour résoudre la situation de crise "${decisionDetails.situation}". Quelles sont les conséquences de ma décision et comment cela va-t-il influencer la suite du scénario?` }
      ];
      
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        1500
      );
      
      // Déterminer si cette décision met fin au scénario
      const isScenarioTerminated = selectedOption.impact.missionCritical || 
                                  responseContent.toLowerCase().includes("fin du scénario") || 
                                  responseContent.toLowerCase().includes("mission terminée") ||
                                  responseContent.toLowerCase().includes("échec de la mission");
      
      // Envoyer la réponse
      res.json({
        type: 'bot',
        content: responseContent,
        resetScenario: isScenarioTerminated,
        contactName: scenario.contact.name,
        contactRole: scenario.contact.role,
        decisionImpact: {
          budget: selectedOption.impact.budget,
          timeline: selectedOption.impact.timeline,
          reputation: selectedOption.impact.reputation,
          security: selectedOption.impact.security,
          employment: selectedOption.impact.employment,
          missionCritical: selectedOption.impact.missionCritical
        }
      });
      
    } catch (error) {
      console.error('Error processing decision choice:', error);
      res.status(500).json({ message: 'Failed to process decision choice' });
    }
  });

  // Les routes pour le chatbot mc2i AI Learning sont déjà définies plus haut

  // Routes d'administration pour le cache et le rate limiter
  app.get("/api/admin/stats", (req: Request, res: Response) => {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    const userRole = req.headers['x-user-role'] || 'utilisateur';
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Permissions administrateur requises.'
      });
    }

    // Importer dynamiquement le service OpenAI amélioré
    import('./services/enhancedOpenAIService')
      .then(({ enhancedOpenAIService }) => {
        // Récupérer les statistiques
        const stats = enhancedOpenAIService.getStats();
        
        // Calculer quelques métriques supplémentaires
        const cacheHitRate = stats.cache.totalHits > 0 
          ? (stats.cache.totalHits / (stats.cache.totalHits + stats.rateLimiter.topUsers.reduce((sum, user) => sum + user.count, 0))) * 100 
          : 0;
        
        // Renvoyer les statistiques
        res.json({
          success: true,
          stats: {
            ...stats,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100, // Arrondir à 2 décimales
            timestamp: new Date().toISOString()
          }
        });
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération des statistiques'
        });
      });
  });

  // Route pour vider le cache
  app.post("/api/admin/cache/clear", (req: Request, res: Response) => {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    const userRole = req.headers['x-user-role'] || 'utilisateur';
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Permissions administrateur requises.'
      });
    }

    // Importer dynamiquement le service de cache
    import('./services/cacheService')
      .then(({ cacheService }) => {
        // Vider le cache
        cacheService.clear();
        
        // Renvoyer une confirmation
        res.json({
          success: true,
          message: 'Cache vidé avec succès',
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Erreur lors du vidage du cache:', error);
        res.status(500).json({
          success: false,
          error: 'Erreur lors du vidage du cache'
        });
      });
  });

  // Route pour invalider une partie du cache par domaine
  app.post("/api/admin/cache/invalidate/:domain", (req: Request, res: Response) => {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    const userRole = req.headers['x-user-role'] || 'utilisateur';
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Permissions administrateur requises.'
      });
    }

    const { domain } = req.params;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domaine requis'
      });
    }

    // Importer dynamiquement le service OpenAI amélioré
    import('./services/enhancedOpenAIService')
      .then(({ enhancedOpenAIService }) => {
        // Invalider le cache pour le domaine spécifié
        const entriesRemoved = enhancedOpenAIService.invalidateCache(domain);
        
        // Renvoyer une confirmation
        res.json({
          success: true,
          message: `${entriesRemoved} entrées de cache supprimées pour le domaine "${domain}"`,
          entriesRemoved,
          domain,
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Erreur lors de l\'invalidation du cache:', error);
        res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'invalidation du cache'
        });
      });
  });

  // Route pour réinitialiser les limites de débit pour un utilisateur
  app.post("/api/admin/ratelimiter/reset/:userId", (req: Request, res: Response) => {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    const userRole = req.headers['x-user-role'] || 'utilisateur';
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Permissions administrateur requises.'
      });
    }

    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }

    // Importer dynamiquement le service OpenAI amélioré
    import('./services/enhancedOpenAIService')
      .then(({ enhancedOpenAIService }) => {
        // Réinitialiser les limites pour l'utilisateur spécifié
        enhancedOpenAIService.resetRateLimits(`user:${userId}`);
        
        // Renvoyer une confirmation
        res.json({
          success: true,
          message: `Limites de débit réinitialisées pour l'utilisateur "${userId}"`,
          userId,
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Erreur lors de la réinitialisation des limites:', error);
        res.status(500).json({
          success: false,
          error: 'Erreur lors de la réinitialisation des limites'
        });
      });
  });

  // Routes pour les outils cyber
  app.use('/api/cyber/tools', cyberToolsRoutes);
  
  // Routes pour les fiches cyber express
  app.post('/api/cyber/fiches/generate', generateCyberFiche);
  app.get('/api/cyber/fiches/favorites', getUserFavorites);

  // Routes pour le glossaire visuel de cybersécurité
  app.post('/api/cyber/glossary/search', searchGlossaryTerm);
  app.post('/api/cyber/glossary/explain', explainConcept);
  app.post('/api/cyber/glossary/compare', compareTerms);
  app.post('/api/cyber/glossary/quiz', generateQuiz);
  app.post('/api/cyber/glossary/ask', askGlossaryAssistant);

  // Routes pour le quiz adaptatif IA
  app.post('/api/cyber/adaptive-quiz/question', generateQuizQuestion);
  app.post('/api/cyber/adaptive-quiz/hint', generateQuizHint);
  app.post('/api/cyber/adaptive-quiz/full', generateFullQuiz);
  
  // Routes pour AMOA Expert
  app.post('/api/amoa-expert/init', amoaExpertController.initializeAmoaExpertSession);
  app.post('/api/amoa-expert/message', amoaExpertController.processAmoaExpertMessage);
  app.post('/api/amoa-expert/generate-scenario', amoaExpertController.generateAmoaDecisionScenario);
  app.post('/api/amoa-expert/decision', amoaExpertController.processAmoaDecision);
  app.post('/api/amoa-expert/check-status', amoaExpertController.checkDecisionModeStatus);
  app.post('/api/amoa-expert/end', amoaExpertController.endAmoaExpertSession);

  // Routes pour le module "Qui est l'imposteur?"
  app.post('/api/amoa/imposteur-simulation/start', startImposteurSimulation);
  app.post('/api/amoa/imposteur-simulation/message', processImposteurMessage);
  app.post('/api/amoa/imposteur-simulation/complete', completeImposteurSimulation);
  
  // Route pour la synthèse d'entretien AMOA
  app.post('/api/amoa/synthese-entretien', async (req: Request, res: Response) => {
    try {
      await generateSyntheseEntretien(req, res);
    } catch (error) {
      console.error('Erreur lors de la génération de la synthèse d\'entretien:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Une erreur est survenue lors de la génération de la synthèse d\'entretien' 
      });
    }
  });
  
  // Routes pour le module de gestion de crise
  // Route de test
  app.get('/api/crisis-management/test', (req, res) => {
    console.log('Test route was called!');
    return res.status(200).json({ success: true, message: 'Test route is working' });
  });
  
  // Anciennes routes commentées pour éviter les erreurs - À réactiver plus tard
  app.get('/api/crisis-management/scenarios', (req, res) => {
    console.log('Get scenarios route was called!');
    // return getAvailableScenarios(req, res);
    return res.json({ message: "Cette route est temporairement désactivée", scenarios: [] });
  });
  
  app.post('/api/crisis-management/start', (req, res) => {
    // startCrisisSession(req, res);
    return res.json({ message: "Cette route est temporairement désactivée", sessionId: null });
  });
  // Anciennes routes commentées pour éviter les erreurs - À réactiver plus tard
  /*
  app.get('/api/crisis-management/sessions/:sessionId', getCrisisSessionDetails);
  app.post('/api/crisis-management/message', sendCrisisMessage);
  app.post('/api/crisis-management/pause', pauseCrisisSession);
  app.post('/api/crisis-management/resume', resumeCrisisSession);
  app.post('/api/crisis-management/resources', updateResourceAllocation);
  app.post('/api/crisis-management/decision', recordDecision);
  app.post('/api/crisis-management/stakeholder/mark-read', markStakeholderMessagesAsRead);
  app.post('/api/crisis-management/stakeholder/respond', respondToStakeholder);
  */
  
  // Nouvelles routes pour le module de gestion de crise avec IA
  app.post('/api/crisis-management/ai/stakeholder-response', crisisManagementController.generateStakeholderResponse);
  app.post('/api/crisis-management/ai/analyze-decision', crisisManagementController.analyzeDecisionImpact);
  app.post('/api/crisis-management/ai/generate-event', crisisManagementController.generateUnexpectedEvent);
  
  // Route pour le générateur de livrables
  app.post('/api/mc2i/generateur-livrables', generateLivrable);
  
  // Routes pour les défis du IA Lab Trainer
  app.get('/api/ia-lab/challenge/categories/:language', (req, res) => import('./controllers/iaLabChallengeController.ts').then(m => m.getChallengeCategories(req, res)));
  // Route pour les secteurs supprimée selon les instructions
  app.post('/api/ia-lab/challenge/generate', (req, res) => import('./controllers/iaLabChallengeController.ts').then(m => m.generateChallenge(req, res)));
  app.post('/api/ia-lab/challenge/evaluate', (req, res) => import('./controllers/iaLabChallengeController.ts').then(m => m.evaluateChallengeSolution(req, res)));
  app.post('/api/ia-lab/challenge/hint', (req, res) => import('./controllers/iaLabChallengeController.ts').then(m => m.getAdditionalHint(req, res)));

  // Fin des routes API

  // Routes pour CyberQuest
  
  // Routes du joueur
  // Routes CyberQuest supprimées
  
  // Endpoint pour générer des questions pour le jeu Read Me If You Can
  // Service de génération dynamique est importé en haut du fichier
  
  app.post('/api/data-ia/generate-dynamic-challenge', async (req, res) => {
    try {
      const { language, difficulty } = req.body;
      
      if (!language || !difficulty) {
        return res.status(400).json({ 
          success: false, 
          error: "Les paramètres language et difficulty sont requis" 
        });
      }
      
      // Générer un défi dynamique
      const result = await generateDynamicChallenge(language, difficulty);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erreur lors de la génération du défi dynamique:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la génération du défi dynamique" 
      });
    }
  });
  
  // Endpoint existant pour la génération de défis
  app.post('/api/data-ia/generate-code-challenge', async (req, res) => {
    try {
      const { language, difficulty, mode } = req.body;
      
      if (!language || !difficulty || !mode) {
        return res.status(400).json({ error: "Les paramètres language, difficulty et mode sont requis" });
      }

      // Vérifier si OpenAI est configuré
      if (!openAIService) {
        return res.status(500).json({ 
          error: "Le service IA n'est pas disponible actuellement." 
        });
      }
      
      // Utiliser le service de génération dynamique de défis
      try {
        // Tenter de récupérer un défi du cache ou d'en générer un nouveau
        const challenge = await dynamicChallengeService.getChallenge(
          language,
          difficulty
        );
        
        if (challenge) {
          return res.status(200).json({
            success: true,
            challenge
          });
        }
        
        // Si la génération dynamique échoue, continuer avec la génération standard
        console.log("Génération dynamique échouée, utilisation de la méthode standard");
      } catch (dynamicError) {
        console.error("Erreur avec la génération dynamique:", dynamicError);
        // Continuer avec la méthode standard en cas d'erreur
      }
      
      // Créer un prompt adapté au langage, à la difficulté et au mode de jeu
      let systemPrompt = `Tu es un expert en programmation chargé de créer des défis de code pour un jeu éducatif appelé "Read Me If You Can".
      
      TÂCHE: Générer un défi de code complet en ${language === 'python' ? 'Python' : 'SQL'} avec une difficulté "${difficulty}" et pour le mode de jeu "${mode}".

      NIVEAU DE DIFFICULTÉ:
      - débutant: Concepts de base, syntaxe simple, opérations élémentaires
      - intermédiaire: Combinaison de concepts, algorithmes simples, utilisation de bibliothèques standard
      - avancé: Algorithmes complexes, concepts avancés, optimisation

      FORMAT DE SORTIE (JSON):
      {
        "success": true,
        "challenge": {
          "code": "string (code source qui doit être analysé)",
          "language": "${language}",
          "question": "string (question sur le code)",
          "difficulty": "${difficulty}",
          "responses": [
            {
              "id": "a",
              "text": "string (première option)",
              "isCorrect": boolean
            },
            {
              "id": "b",
              "text": "string (deuxième option)",
              "isCorrect": boolean
            },
            {
              "id": "c",
              "text": "string (troisième option)",
              "isCorrect": boolean
            },
            {
              "id": "d",
              "text": "string (quatrième option)",
              "isCorrect": boolean
            }
          ],
          "explanation": "string (explication détaillée de la bonne réponse)",
          "hint": "string (indice facultatif)"
        }
      }

      CONTRAINTES:
      1. Le code doit être correct syntaxiquement et logiquement
      2. Une seule réponse doit être correcte (isCorrect: true)
      3. Les mauvaises réponses doivent être plausibles
      4. L'explication doit être claire et pédagogique
      5. Le niveau de difficulté doit correspondre à celui demandé
      6. Le code doit tenir sur un écran (maximum 25 lignes)`;

      // Adapter le prompt selon le mode de jeu
      if (mode === 'analyse') {
        systemPrompt += `
        
        MODE: ANALYSE
        Pour ce mode, crée un code qui nécessite une analyse attentive. L'apprenant doit comprendre ce que fait le code, pas seulement sa syntaxe. Privilégie les questions du type "Que fait ce code?" ou "Quel est le résultat de l'exécution de ce code?".`;
      } else if (mode === 'défense') {
        systemPrompt += `
        
        MODE: DÉFENSE
        Pour ce mode, crée un code contenant une vulnérabilité ou un bug subtil. L'apprenant doit identifier le problème. Privilégie les questions du type "Quel est le problème dans ce code?" ou "Quelle vulnérabilité est présente?".`;
      } else if (mode === 'vitesse') {
        systemPrompt += `
        
        MODE: VITESSE
        Pour ce mode, crée un défi relativement simple mais qui demande une lecture rapide et efficace. L'apprenant doit pouvoir y répondre en moins de 30 secondes. Privilégie un code court et une question directe.`;
      }

      // Générer le défi via l'API d'IA
      const userPrompt = `Génère un nouveau défi de code en ${language} de niveau ${difficulty} pour le mode ${mode}.`;
      
      const completion = await openAIService.getCompletion(systemPrompt, userPrompt, {
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      if (!completion || !completion.content) {
        throw new Error("Réponse OpenAI invalide");
      }
      
      // Convertir la réponse en JSON
      try {
        const result = JSON.parse(completion.content);
        
        // Vérifier que la réponse contient les champs nécessaires
        if (!result.success || !result.challenge) {
          throw new Error("Format de réponse OpenAI invalide");
        }
        
        // Vérifier que le challenge contient les champs nécessaires
        const requiredFields = ['code', 'language', 'question', 'difficulty', 'responses', 'explanation'];
        for (const field of requiredFields) {
          if (!result.challenge[field]) {
            throw new Error(`Le champ ${field} est manquant dans le challenge`);
          }
        }
        
        // Vérifier que les réponses sont au bon format
        if (!Array.isArray(result.challenge.responses) || result.challenge.responses.length !== 4) {
          throw new Error("Le format des réponses est invalide");
        }
        
        // Vérifier qu'il y a exactement une réponse correcte
        const correctResponses = result.challenge.responses.filter(r => r.isCorrect);
        if (correctResponses.length !== 1) {
          throw new Error("Il doit y avoir exactement une réponse correcte");
        }
        
        // Envoyer le résultat
        return res.status(200).json(result);
      } catch (error) {
        console.error("Erreur lors du traitement de la réponse OpenAI:", error);
        throw new Error("Erreur lors du traitement de la réponse OpenAI: " + error.message);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du challenge:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la génération du challenge: " + error.message 
      });
    }
  });
  
  // Endpoint pour traduire du langage naturel en code
  app.post('/api/code/translate', async (req, res) => {
    try {
      const { text, language, sessionId } = req.body;
      
      if (!text || !language) {
        return res.status(400).json({
          error: "Le texte et le langage cible sont requis"
        });
      }

      // Vérifier si OpenAI est configuré
      if (!openAIService) {
        return res.status(503).json({
          error: "Le service IA n'est pas disponible actuellement"
        });
      }

      // Définir le prompt système selon le langage
      const systemPrompt = language === 'python' 
        ? `Tu es un expert en programmation Python. Ta mission est de traduire des descriptions en langage naturel en code Python efficace et bien structuré. 
          - Génère un code Python clair et commenté
          - Utilise les bibliothèques standard (numpy, pandas, matplotlib, etc. si nécessaire)
          - Respecte les bonnes pratiques PEP8
          - Ajoute des commentaires explicatifs pertinents`
        : `Tu es un expert en SQL. Ta mission est de traduire des descriptions en langage naturel en requêtes SQL efficaces.
          - Génère des requêtes SQL standard et optimisées
          - Utilise la syntaxe la plus compatible (MySQL/PostgreSQL)
          - Ajoute des commentaires explicatifs pertinents`;

      // Créer le prompt utilisateur
      const userPrompt = `Traduis cette description en code ${language} : ${text}`;

      // Structurer la demande pour obtenir une réponse JSON
      const completion = await openAIService.getChatCompletion(
        [
          { role: "system", content: systemPrompt + "\n\nIMPORTANT: Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ou après. Le format exact est:\n{\"code\": \"le code généré ici\", \"explanation\": \"explication du code ici\"}\n\nNe commence pas ta réponse par 'Voici' ou tout autre texte. Réponds directement avec le JSON." },
          { role: "user", content: userPrompt }
        ], 
        0.3,  // temperature
        2000, // maxTokens
        { responseFormat: 'json_object', useSecondaryKey: true }
      );

      if (!completion) {
        throw new Error("Réponse IA invalide");
      }

      // Extraire le code et l'explication
      try {
        // Essayer d'extraire le JSON de la réponse (Claude peut ajouter du texte avant/après)
        let jsonStr = completion;
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        // Fonction pour nettoyer et parser le JSON avec gestion des caractères spéciaux
        const parseJsonSafely = (str: string) => {
          // Remplacer les retours à la ligne dans les valeurs de chaînes par \n échappés
          // On traite le JSON caractère par caractère pour ne modifier que l'intérieur des chaînes
          let inString = false;
          let escaped = false;
          let result = '';
          
          for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            if (escaped) {
              result += char;
              escaped = false;
              continue;
            }
            
            if (char === '\\') {
              escaped = true;
              result += char;
              continue;
            }
            
            if (char === '"') {
              inString = !inString;
              result += char;
              continue;
            }
            
            if (inString && char === '\n') {
              result += '\\n';
              continue;
            }
            
            if (inString && char === '\r') {
              continue; // Ignorer les retours chariot
            }
            
            result += char;
          }
          
          return JSON.parse(result);
        };
        
        const result = parseJsonSafely(jsonStr);
        
        if (!result.code) {
          throw new Error("Le format de la réponse est invalide");
        }

        return res.status(200).json({
          code: result.code,
          explanation: result.explanation || "Voici le code généré à partir de votre description."
        });
      } catch (error) {
        console.error("Erreur lors du traitement de la réponse IA:", error);
        console.error("Réponse brute:", completion);
        throw new Error("Erreur lors du traitement de la réponse IA");
      }
    } catch (error) {
      console.error("Erreur lors de la traduction:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue lors de la traduction"
      });
    }
  });

  // Endpoint pour analyser la justification d'une réponse dans Read Me If You Can
  app.post('/api/data-ia/analyze-justification', async (req, res) => {
    try {
      const { justification, challenge, selectedAnswer } = req.body;
      
      if (!justification || !challenge || !selectedAnswer) {
        return res.status(400).json({ 
          error: "Les paramètres justification, challenge et selectedAnswer sont requis",
          isValid: false,
          feedback: "Paramètres incomplets"
        });
      }
      
      // Vérifier si OpenAI est configuré
      if (!openAIService) {
        // En cas d'indisponibilité, utiliser une validation simplifiée
        console.warn("Service OpenAI non disponible pour l'analyse de justification");
        const isLongEnough = justification.length >= 50;
        return res.status(200).json({
          isValid: isLongEnough,
          feedback: isLongEnough 
            ? "Votre justification semble pertinente." 
            : "Votre justification manque de détails pour démontrer votre compréhension."
        });
      }
      
      // Trouver la réponse correcte pour la comparer avec la justification
      const correctResponse = challenge.responses.find(r => r.isCorrect);
      if (!correctResponse) {
        return res.status(400).json({
          error: "Impossible de trouver la réponse correcte dans le challenge",
          isValid: false,
          feedback: "Erreur lors de l'analyse de votre justification."
        });
      }
      
      // Obtenir l'explication du challenge
      const explanation = challenge.explanation;
      
      // Créer un prompt pour analyser la justification
      const systemPrompt = `Tu es un expert en évaluation de compréhension de code. Ta tâche est d'analyser si la justification fournie par un apprenant démontre une compréhension correcte du code présenté.

CONTEXTE:
- Code présenté: ${challenge.code}
- Question posée: ${challenge.question}
- Réponse correcte: ${correctResponse.text}
- Explication officielle: ${explanation}

TÂCHE:
Analyse la justification fournie par l'apprenant et détermine si elle démontre une compréhension correcte du code, même si elle n'est pas exactement identique à l'explication officielle.

CRITÈRES D'ÉVALUATION:
1. La justification doit mentionner les concepts clés qui expliquent la bonne réponse
2. Elle ne doit pas contenir d'erreurs conceptuelles majeures
3. Elle doit démontrer que l'apprenant a réellement compris le code, pas juste deviné la réponse

Réponds uniquement au format JSON avec les champs suivants:
- "isValid": boolean (true si la justification est acceptable, false sinon)
- "feedback": string (feedback constructif pour l'apprenant)
- "score": number (entre 0 et 10, évaluant la qualité de la justification)
`;
      
      const userPrompt = `Justification de l'apprenant: "${justification}"

Analyse cette justification selon les critères spécifiés et retourne ton évaluation au format JSON.`;
      
      try {
        // Appel à l'API OpenAI pour analyser la justification
        const completion = await openAIService.getCompletion(systemPrompt, userPrompt, { temperature: 0.3, max_tokens: 500, response_format: { type: "json_object" } });
        
        if (!completion || !completion.content) {
          throw new Error("Réponse OpenAI invalide");
        }
        
        // Analyser la réponse JSON
        let result;
        try {
          result = JSON.parse(completion.content);
        } catch (e) {
          console.error("Erreur de parsing JSON:", e);
          throw new Error("Format de réponse invalide");
        }
        
        // Vérifier que la réponse contient les champs nécessaires
        if (typeof result.isValid !== 'boolean' || typeof result.feedback !== 'string') {
          throw new Error("Format de réponse incomplet");
        }
        
        // Retourner le résultat de l'analyse
        return res.status(200).json({
          isValid: result.isValid,
          feedback: result.feedback,
          score: result.score || (result.isValid ? 8 : 4)
        });
      } catch (error) {
        console.error("Erreur lors de l'analyse de la justification:", error);
        
        // En cas d'erreur, utiliser une validation simplifiée
        const isLongEnough = justification.length >= 50;
        return res.status(200).json({
          isValid: isLongEnough,
          feedback: "Nous n'avons pas pu analyser votre justification en détail. " + 
                   (isLongEnough ? "Elle semble toutefois suffisamment développée." : "Veuillez fournir plus de détails dans votre explication.")
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse de la justification:", error);
      res.status(500).json({
        error: "Erreur serveur lors de l'analyse de la justification",
        isValid: false,
        feedback: "Une erreur est survenue lors de l'analyse de votre justification."
      });
    }
  });

  // ── Monsieur Tout le Monde – Banque de 60 scénarios ──────────────────────
  type MTMScenario = {
    category: string; title: string; context: string;
    visual: { type: string; from?: string; fromEmail?: string; subject?: string; body: string; hasClickableLink?: boolean; linkLabel?: string; linkUrl?: string };
    choices: { label: string; isCorrect: boolean; feedback: string; points: number }[];
    reflexe: string; clickConsequence?: string; redFlags?: string[];
  };
  const MTM_BANK: Record<string, MTMScenario[]> = {
    debutant: [
      { category:'phishing-banque', title:'Alerte BNP — connexion depuis Kiev à 3h du matin', context:'Il est 8h20. Vous prenez votre café avant de partir au bureau. Votre téléphone vibre.', visual:{type:'email',from:'BNP Paribas — Service Sécurité',fromEmail:'securite@notif-bnpparibas.fr',subject:'[Urgent] Tentative de connexion suspecte — Kiev (Ukraine)',body:'Monsieur Dupont,\n\nNous avons bloqué une connexion depuis Kiev (Ukraine) à 03h47 cette nuit.\n\nPar mesure préventive, votre carte a été désactivée.\n\nPour réactiver votre compte avant 12h, confirmez votre identité.\n\nService Sécurité — BNP Paribas',hasClickableLink:true,linkLabel:'Réactiver mon compte',linkUrl:'https://notif-bnpparibas.fr/securite/reactivation'}, choices:[{label:'Le cadenas HTTPS est présent — je vérifie le certificat du site avant de saisir quoi que ce soit',isCorrect:false,feedback:'HTTPS prouve uniquement que la connexion est chiffrée. Les fraudeurs obtiennent un certificat SSL valide en 5 minutes gratuitement. Ce n\'est pas une garantie d\'authenticité.',points:-5},{label:'Je tape moi-même "bnpparibas.fr" dans un nouvel onglet de navigateur',isCorrect:true,feedback:'C\'est la seule approche sûre. "notif-bnpparibas.fr" n\'est pas "bnpparibas.fr" — n\'importe qui peut enregistrer ce sous-domaine trompeur.',points:10},{label:'Je clique car l\'email cite mon nom — seule ma banque connaît mon nom',isCorrect:false,feedback:'Votre nom figure dans des milliers de bases de données commerciales ou fuites de données. Les fraudeurs achètent ces informations pour personnaliser les attaques.',points:-5}], reflexe:'HTTPS ≠ site légitime. Tapez toujours l\'URL de votre banque vous-même dans un nouvel onglet.', clickConsequence:'La fausse page capture en temps réel vos identifiants ET votre code 2FA (attaque AiTM).', redFlags:['notif-bnpparibas.fr ≠ bnpparibas.fr','Un certificat SSL s\'obtient gratuitement pour tout domaine','Votre banque ne désactive jamais une carte par email sans courrier préalable'] },
      { category:'sms-colis', title:'SMS La Poste — colis bloqué, 1,99€ de frais', context:'Mercredi matin. Vous attendez un colis Amazon commandé il y a 3 jours. Ce SMS arrive.', visual:{type:'sms',from:'La Poste',body:'Votre colis FR48721 est retenu en bureau. Frais de réexpédition : 1,99€. Sans paiement avant 48h, il sera retourné.\nRégler : laposte-suivi.fr/payer?id=FR48721',hasClickableLink:true,linkLabel:'laposte-suivi.fr/payer',linkUrl:'https://laposte-suivi.fr/payer?id=FR48721'}, choices:[{label:'Je paie en navigation privée — comme ça mon historique n\'est pas tracé et je suis protégé',isCorrect:false,feedback:'La navigation privée masque uniquement votre historique local de navigation. Elle ne protège pas vos données bancaires sur un site frauduleux — elles sont envoyées directement aux escrocs.',points:-5},{label:'Je cherche "laposte-suivi.fr" sur Google pour voir s\'il est référencé comme site officiel',isCorrect:false,feedback:'Des sites de phishing apparaissent régulièrement dans les résultats Google, parfois même en publicité payante. La présence dans Google ne garantit pas la légitimité d\'un site.',points:-5},{label:'Je vais sur laposte.fr, saisis manuellement la référence FR48721 et vérifie',isCorrect:true,feedback:'La seule approche fiable. La Poste ne réclame jamais de frais par SMS. Sur laposte.fr, votre colis sera visible avec son vrai statut — ou confirmé comme inexistant.',points:10}], reflexe:'La Poste ne demande jamais de paiement par SMS. La navigation privée ne protège pas du phishing.', clickConsequence:'Fausse page de paiement. Votre CB est enregistrée et débitée dans les heures qui suivent.', redFlags:['laposte-suivi.fr ≠ laposte.fr','La Poste ne réclame pas de frais de réexpédition par SMS','La navigation privée n\'offre aucune protection contre le phishing'] },
      { category:'vishing-microsoft', title:'Support Microsoft — virus actif sur votre PC', context:'Vous travaillez depuis chez vous. Votre téléphone sonne — numéro parisien, affiché +33 1 57 32 45 90.', visual:{type:'phone-call',from:'+33 1 57 32 45 90',body:'Bonjour, Antoine Lebrun du service sécurité Microsoft. Nos serveurs de monitoring ont détecté que votre ordinateur envoie des données vers un serveur en Chine depuis 14 minutes. Votre système est compromis en ce moment. J\'ai besoin d\'accéder à distance pour stopper la fuite — chaque minute aggrave les dégâts. Vous avez TeamViewer ou AnyDesk installé ?',hasClickableLink:false}, choices:[{label:'Je lui demande son numéro d\'employé officiel et son code de service avant de donner accès',isCorrect:false,feedback:'Les escrocs ont des "numéros d\'employé" et "codes de service" prêts. Vous vérifieriez quoi exactement ? Microsoft n\'a aucun numéro de vérification public. La règle absolue : Microsoft ne contacte JAMAIS ses utilisateurs de façon proactive.',points:-5},{label:'Je raccroche immédiatement sans rien donner, même un seul chiffre',isCorrect:true,feedback:'C\'est la seule réponse correcte. Microsoft ne fait aucun monitoring proactif de votre PC et ne contacte jamais les utilisateurs spontanément. Ce scénario est systématiquement une arnaque.',points:10},{label:'Je donne accès mais surveille l\'écran en temps réel pour voir ce qu\'il fait',isCorrect:false,feedback:'Les keyloggers, backdoors et ransomwares s\'installent en quelques secondes en arrière-plan, invisibles à l\'écran. Pendant que vous regardez une fausse "analyse", le malware s\'installe.',points:-5}], reflexe:'Microsoft ne vous contacte JAMAIS de façon proactive. Raccrochez sans poser de questions — même "son badge".', redFlags:['Microsoft ne monitore pas votre PC à distance','Les numéros d\'employé peuvent être inventés','Surveiller l\'écran n\'empêche pas l\'installation de malwares en arrière-plan'] },
      { category:'popup-virus', title:'Windows Defender — votre PC envoie des données', context:'18h45. Vous lisez les infos en ligne. Votre écran est soudainement envahi par cette alerte sonore.', visual:{type:'browser-popup',subject:'⚠️ WINDOWS DEFENDER — Alerte critique de sécurité',body:'VOTRE PC EST INFECTÉ — NE FERMEZ PAS CETTE FENÊTRE\n\nVirus détecté : Trojan.Ransom.ShadowKill\nFichiers compromis : 3 847 sur 4 102\nDonnées transmises vers serveur externe : 2,3 Go\nStatut webcam : Accès actif détecté\n\nVotre antivirus a été désactivé par le virus.\nPour stopper immédiatement, appelez le 0800 913 000 (numéro officiel Microsoft France — gratuit)\n\nOU installez la mise à jour de sécurité d\'urgence ci-dessous.',hasClickableLink:true,linkLabel:'Télécharger la mise à jour d\'urgence',linkUrl:'https://windows-defender-update-fr.com/patch.exe'}, choices:[{label:'Je ferme la fenêtre avec la croix — c\'est un simple popup de navigateur',isCorrect:false,feedback:'Des scripts malveillants bloquent parfois la croix ou en ouvrent de nouvelles. Il faut fermer le processus navigateur ENTIÈREMENT via le Gestionnaire des tâches (Ctrl+Maj+Échap).',points:-5},{label:'Je ferme le navigateur entièrement via le Gestionnaire des tâches, puis je lance mon antivirus installé',isCorrect:true,feedback:'Parfait. Windows Defender communique UNIQUEMENT via la barre des tâches Windows, jamais via un navigateur. Après fermeture complète, un scan antivirus confirmera si votre PC est sain.',points:10},{label:'J\'appelle le numéro — il est marqué "officiel Microsoft" et "gratuit"',isCorrect:false,feedback:'Ce numéro appartient aux escrocs. Ils demanderont un accès à distance, puis des paiements de 200-500€ pour "nettoyer" un PC qui n\'était pas infecté. Microsoft n\'a pas de numéro d\'alerte navigateur.',points:-5}], reflexe:'Windows Defender n\'utilise JAMAIS votre navigateur. Fermez tout via le Gestionnaire des tâches.', clickConsequence:'Le fichier installe un ransomware. Vos documents sont chiffrés, une rançon de 300€ en Bitcoin est demandée.', redFlags:['Windows Defender utilise la barre des tâches, pas le navigateur','La croix peut être bloquée par script — Gestionnaire des tâches uniquement','"Gratuit" et "officiel" dans le même texte = signal d\'alarme'] },
      { category:'phishing-paypal', title:'PayPal — paiement de 127€ depuis le Maroc', context:'Vendredi 18h30. Votre app PayPal n\'affiche aucune notif. Pourtant cet email est là.', visual:{type:'email',from:'PayPal — Service Sécurité',fromEmail:'noreply@paypal-account-secure.fr',subject:'Activité suspecte — Paiement de 127€ — Casablanca',body:'Bonjour,\n\nNous avons détecté un paiement de 127€ depuis Casablanca (Maroc) à 18h14.\n\nSi vous n\'êtes pas à l\'origine de ce paiement, sécurisez votre compte immédiatement.\n\nCette fenêtre d\'action expire dans 2 heures.\n\nPayPal Service Client\nwww.paypal.com',hasClickableLink:true,linkLabel:'Sécuriser mon compte et me rembourser',linkUrl:'https://paypal-account-secure.fr/refund'}, choices:[{label:'Je clique — l\'email mentionne "www.paypal.com" dans le texte, c\'est forcément PayPal',isCorrect:false,feedback:'N\'importe qui peut écrire "www.paypal.com" dans le corps d\'un email. Ce qui compte : l\'adresse expéditeur et le domaine du lien. Ici, "paypal-account-secure.fr" n\'est pas "paypal.com".',points:-5},{label:'Je vais directement sur paypal.com dans un nouvel onglet sans cliquer sur quoi que ce soit',isCorrect:true,feedback:'Parfait. Le texte d\'un email ne prouve rien — le domaine de l\'expéditeur et du lien, si. Sur paypal.com, aucun paiement suspect ne sera enregistré.',points:10},{label:'Je transmets l\'email à PayPal pour vérification avant d\'agir',isCorrect:false,feedback:'Bonne intention, mais pendant que vous attendez, l\'urgence artificielle des "2 heures" vous met sous pression. Allez d\'abord vérifier vous-même sur paypal.com.',points:-5}], reflexe:'Le corps d\'un email peut citer n\'importe quel site. Seuls le domaine expéditeur et l\'URL du lien comptent.', clickConsequence:'Fausse page PayPal clonée capture vos identifiants et votre code 2FA en temps réel.', redFlags:['paypal-account-secure.fr ≠ paypal.com','Écrire "www.paypal.com" dans le texte ne rend pas l\'email légitime','2 heures = délai inventé pour bloquer la réflexion'] },
      { category:'sms-loterie', title:'FDJ — vous figurez parmi les 50 gagnants', context:'Un dimanche matin, ce SMS arrive. Vous avez joué parfois au Loto en ligne.', visual:{type:'sms',from:'FDJ France',body:'Bonjour ! Suite au tirage du 14/03, vous figurez parmi les 50 gagnants de notre loterie digitale. Gain : 420€. Pour recevoir votre virement, renseignez votre IBAN avant le 16/03 :\nfdj-recompenses.fr/reclamer?code=WIN4821',hasClickableLink:true,linkLabel:'fdj-recompenses.fr/reclamer',linkUrl:'https://fdj-recompenses.fr/reclamer?code=WIN4821'}, choices:[{label:'Je clique juste pour voir — je ne donnerai que mon email, pas mon IBAN',isCorrect:false,feedback:'Votre email seul suffit aux fraudeurs pour d\'autres attaques ciblées ou pour le revendre. Et une fois sur le site, l\'interface de gain peut vous pousser à aller plus loin sans vous en rendre compte.',points:-5},{label:'Je vérifie sur Whois.com qui possède ce domaine "fdj-recompenses.fr"',isCorrect:false,feedback:'Bonne curiosité technique, mais les domaines frauduleux peuvent être enregistrés au nom d\'entités fictives ou relais. La règle plus simple : la FDJ notifie les gains uniquement dans son application officielle.',points:-5},{label:'Je supprime le SMS — la FDJ utilise son app officielle pour notifier les vrais gains',isCorrect:true,feedback:'Exact. Les vrais gains FDJ sont notifiés dans l\'application FDJ avec votre numéro de jeu. Jamais par SMS avec un lien externe. Et on ne gagne pas à une loterie à laquelle on n\'a pas participé cette semaine.',points:10}], reflexe:'La FDJ notifie les gains dans son app officielle, jamais par SMS avec un lien. Votre email seul a de la valeur pour les fraudeurs.', clickConsequence:'Votre IBAN est collecté pour initier des prélèvements. Votre email est vendu ou exploité.', redFlags:['fdj-recompenses.fr ≠ fdj.fr','La FDJ utilise son application pour les gains','Même donner seulement son email peut servir les fraudeurs'] },
      { category:'phishing-amazon', title:'Commande Amazon — iPhone 15 Pro — 649€ — vous n\'y êtes pour rien', context:'Pause déjeuner. Cet email vous attend sur votre téléphone.', visual:{type:'email',from:'Amazon.fr',fromEmail:'confirmation@amazon.fr-orders.net',subject:'Votre commande #405-9182734 — iPhone 15 Pro 256Go — 649€',body:'Bonjour,\n\nVotre commande a été confirmée.\n\nArticle : iPhone 15 Pro 256Go Titane\nMontant : 649,00€\nAdresse de livraison : 47 rue Marceau, 69003 Lyon\n\nSi vous n\'êtes pas à l\'origine de cette commande, annulez maintenant.',hasClickableLink:true,linkLabel:'Annuler cette commande immédiatement',linkUrl:'https://amazon.fr-orders.net/cancel'}, choices:[{label:'J\'annule immédiatement — 649€ c\'est urgent et l\'adresse n\'est pas la mienne',isCorrect:false,feedback:'La panique est ce que les fraudeurs espèrent. "amazon.fr-orders.net" n\'est pas "amazon.fr". Vos identifiants seraient volés sur la fausse page d\'annulation.',points:-5},{label:'Je contacte le support Amazon via le chat dans cet email pour signaler la fraude',isCorrect:false,feedback:'Le "support" accessible depuis cet email vous connecte aux fraudeurs, pas à Amazon. Ils simuleront une "annulation" tout en récupérant vos informations.',points:-5},{label:'Je vais sur amazon.fr directement et vérifie mes vraies commandes dans mon compte',isCorrect:true,feedback:'Parfait. 30 secondes sur amazon.fr montrera qu\'aucune commande de 649€ n\'existe. Si une vraie commande frauduleuse existait, l\'annulation depuis amazon.fr serait sécurisée.',points:10}], reflexe:'Face à une "commande urgente" : ouvrez amazon.fr vous-même, vérifiez, agissez depuis là — jamais via un lien email.', clickConsequence:'Fausse page Amazon capture vos identifiants. Votre compte sert ensuite à de vraies commandes frauduleuses.', redFlags:['amazon.fr-orders.net ≠ amazon.fr','L\'urgence des 649€ est calculée pour empêcher la réflexion','Le support "dans l\'email" est celui des fraudeurs'] },
      { category:'sms-impots', title:'DGFiP — remboursement 283€ — votre RIB requis', context:'Début avril, période de déclaration. Ce SMS arrive pendant votre trajet.', visual:{type:'sms',from:'Impots.Gouv',body:'Direction Générale des Finances Publiques : un remboursement de 283,00€ vous est dû. Pour recevoir le virement, renseignez votre RIB avant le 30/04 :\nimpots-remboursement.fr/rib?ref=2023-FR4821',hasClickableLink:true,linkLabel:'impots-remboursement.fr/rib',linkUrl:'https://impots-remboursement.fr/rib?ref=2023-FR4821'}, choices:[{label:'Je donne uniquement mon IBAN — c\'est juste un numéro pour recevoir de l\'argent, pas pour en donner',isCorrect:false,feedback:'Un IBAN complet permet d\'initier des prélèvements SEPA depuis votre compte. Ce n\'est pas "uniquement pour recevoir" — c\'est une autorisation de débit potentielle. Les fraudeurs l\'utilisent pour vous prélever.',points:-5},{label:'Je tape impots.gouv.fr dans mon navigateur et vérifie mon espace personnel',isCorrect:true,feedback:'Parfait. La DGFiP a déjà votre IBAN depuis votre déclaration. Elle ne le re-demande JAMAIS par SMS. Les remboursements s\'effectuent automatiquement sur le compte déclaré.',points:10},{label:'Je cherche si "impots-remboursement.fr" est listé comme site frauduleux sur un site gouvernemental',isCorrect:false,feedback:'Le gouvernement ne tient pas de liste publique exhaustive des faux domaines. Des milliers de nouveaux domaines phishing apparaissent chaque jour. La règle : impots.gouv.fr est le SEUL domaine légitime.',points:-5}], reflexe:'La DGFiP ne demande jamais de RIB par SMS. Un IBAN permet des prélèvements — ce n\'est pas anodin.', clickConsequence:'Votre IBAN collecté pour initier des prélèvements SEPA frauduleux dans les semaines suivantes.', redFlags:['impots-remboursement.fr ≠ impots.gouv.fr','Un IBAN autorise des prélèvements, pas seulement des virements','La DGFiP a déjà votre RIB depuis votre déclaration'] },
      { category:'phishing-apple', title:'Votre Apple ID utilisé depuis Istanbul à 19h42', context:'21h15. Vous regardez une série. Une notification email.', visual:{type:'email',from:'Apple',fromEmail:'no-reply@account-apple-id.com',subject:'Votre Apple ID utilisé — Achat — Istanbul — 8,99€/mois',body:'Votre identifiant Apple ID a été utilisé pour souscrire à "ChatGPT Plus" (8,99€/mois) depuis Istanbul (Turquie) aujourd\'hui à 19h42.\n\nSi vous n\'êtes pas à l\'origine de cet achat, bloquez votre compte maintenant.\n\nSi vous ne réagissez pas dans 1 heure, l\'abonnement sera confirmé.',hasClickableLink:true,linkLabel:'Bloquer l\'achat — Gérer mon Apple ID',linkUrl:'https://account-apple-id.com/signin'}, choices:[{label:'Je clique et bloque l\'achat — mais je change mon mot de passe juste après',isCorrect:false,feedback:'"Je change mon mot de passe ensuite" est trop tard : vos identifiants Apple ID ont déjà été transmis à la fausse page. L\'accès à votre iCloud, Photos et iMessage est immédiatement compromis.',points:-5},{label:'Je vais sur appleid.apple.com en tapant l\'adresse moi-même dans mon navigateur',isCorrect:true,feedback:'Parfait. Sur appleid.apple.com vous verrez vos vrais achats récents. Si aucun achat turc n\'apparaît, c\'était du phishing. Apple n\'envoie ses alertes que via l\'app Réglages ou par email depuis apple.com.',points:10},{label:'J\'appelle Apple support — je trouve le numéro dans cet email',isCorrect:false,feedback:'Il n\'y a pas de numéro dans cet email frauduleux. Et même si vous en trouviez un, cherchez TOUJOURS le vrai numéro Apple sur apple.com/fr/contact — jamais dans un email suspect.',points:-5}], reflexe:'"Changer le mot de passe ensuite" ne protège pas — vos identifiants sont déjà volés. Tapez appleid.apple.com vous-même.', clickConsequence:'Vos identifiants Apple ID donnent accès à votre iCloud, toutes vos photos, contacts, notes et sauvegarde iPhone.', redFlags:['account-apple-id.com ≠ apple.com','Apple alerte via l\'app Réglages, pas par email','Changer le MDP après avoir cliqué ne protège pas'] },
      { category:'wifi-public', title:'WiFi aéroport — rapport urgent à finir', context:'CDG, Terminal 2E, 14h15. Vol dans 45 min. Vous devez finir un rapport confidentiel pour votre client.', visual:{type:'browser-popup',subject:'Réseaux WiFi disponibles — Terminal 2E',body:'CDG_AirportFreeWiFi — Signal : ██████ — Ouvert — Gratuit\nCDG_Passengers_Free — Signal : █████░ — Ouvert — Gratuit\nCDG_Terminal2E — Signal : ████░░ — Ouvert — Gratuit\n\n→ Vous choisissez CDG_AirportFreeWiFi (signal optimal)\n→ Connecté ✓\n→ Vous ouvrez votre messagerie pro et le fichier client confidentiel',hasClickableLink:false}, choices:[{label:'Je travaille en HTTPS uniquement — c\'est chiffré et donc sécurisé sur ce réseau',isCorrect:false,feedback:'Sur un réseau WiFi "evil twin" contrôlé par un attaquant, le trafic HTTPS peut être intercepté via des attaques Man-in-the-Middle (HSTS bypass, SSL stripping). HTTPS seul est insuffisant sur un réseau non maîtrisé.',points:-5},{label:'J\'active mon VPN d\'entreprise avant d\'ouvrir quoi que ce soit',isCorrect:true,feedback:'Seul le VPN chiffre votre trafic AVANT qu\'il quitte votre appareil, le rendant illisible même sur un réseau compromis. C\'est la protection indispensable sur tout WiFi public.',points:10},{label:'Je me connecte au réseau avec le signal le plus fort — c\'est forcément l\'officiel de l\'aéroport',isCorrect:false,feedback:'Technique de l\'evil twin : un attaquant place un point d\'accès frauduleux PLUS PROCHE de vous pour avoir un meilleur signal. Signal fort ≠ réseau légitime.',points:-5}], reflexe:'VPN avant toute connexion WiFi publique. Signal fort ne signifie pas réseau légitime — c\'est souvent le contraire.', redFlags:['Plusieurs réseaux aux noms similaires = technique evil twin','Signal le plus fort = potentiellement l\'attaquant le plus proche','HTTPS ne protège pas contre un réseau WiFi compromis'] },
      { category:'piece-jointe-exe', title:'Facture EDF en pièce jointe — 134,87€', context:'Vous êtes client EDF. Ce mail arrive un lundi matin.', visual:{type:'email',from:'EDF Facturation',fromEmail:'facture@espace-client-edf.fr',subject:'Votre facture EDF — Janvier 2024 — 134,87€',body:'Bonjour,\n\nVeuillez trouver ci-joint votre facture d\'électricité de janvier.\n\nMontant prélevé : 134,87€ le 15/01/2024\n\nCordialement,\nEDF Service Client',hasClickableLink:true,linkLabel:'📎 Facture_EDF_Janvier2024.pdf.exe',linkUrl:''}, choices:[{label:'J\'ouvre la pièce jointe en mode protégé de Word — ça limite les risques',isCorrect:false,feedback:'Le mode protégé de Word s\'applique aux fichiers .doc/.docx, pas aux .exe. Un fichier .exe s\'exécute directement au double-clic, sans passer par Word. Le "mode protégé" ne l\'empêche pas.',points:-5},{label:'Je vais sur edf.fr dans mon espace client pour télécharger ma vraie facture',isCorrect:true,feedback:'Parfait. L\'extension .pdf.exe révèle le malware : Windows masque souvent les extensions, mais ".pdf.exe" n\'est pas un PDF. Vos vraies factures EDF sont dans votre espace client edf.fr.',points:10},{label:'Je scanne la pièce jointe avec mon antivirus avant de l\'ouvrir',isCorrect:false,feedback:'Les antivirus ont des taux de détection de 60-80% pour les malwares récents. Les attaquants testent leurs fichiers sur VirusTotal AVANT de les envoyer pour s\'assurer qu\'ils passent. Le scan ne garantit pas la sécurité.',points:-5}], reflexe:'Extension .pdf.exe = malware. Le mode protégé Word et l\'antivirus ne suffisent pas. Vérifiez sur edf.fr.', clickConsequence:'Ransomware installé. Vos fichiers sont chiffrés. Rançon de 500€ en Bitcoin exigée.', redFlags:['.pdf.exe n\'est pas un vrai PDF','Le mode protégé Word ne s\'applique pas aux .exe','Les antivirus ne détectent pas tous les malwares récents'] },
      { category:'arnaque-cadeau', title:'Samsung Galaxy S24 Ultra GRATUIT — juste 2,99€ de livraison', context:'Email reçu ce matin. Vous avez un Samsung et vous êtes client fidèle.', visual:{type:'email',from:'Samsung Rewards France',fromEmail:'rewards@samsung-france-client.com',subject:'🎁 Sélectionné : Samsung Galaxy S24 Ultra GRATUIT',body:'Félicitations !\n\nEn tant que client fidèle, vous avez été sélectionné parmi 500 gagnants pour recevoir un Samsung Galaxy S24 Ultra GRATUIT.\n\nIl ne reste que 3 téléphones disponibles.\n\nPayez uniquement les frais de livraison : 2,99€\n\nOffre valable 48h uniquement.',hasClickableLink:true,linkLabel:'Réclamer mon Galaxy S24 Ultra',linkUrl:'https://samsung-france-client.com/galaxy-s24/claim'}, choices:[{label:'Je paie avec ma vieille carte expirée pour tester sans risque',isCorrect:false,feedback:'Même avec une carte expirée, le site enregistre votre numéro de carte. Et si votre banque l\'accepte pour une petite transaction, vous serez ensuite prélevé de 30-50€/mois via un abonnement caché.',points:-5},{label:'J\'ignore — aucune marque ne donne des téléphones à 900€ contre 2,99€ de frais',isCorrect:true,feedback:'Parfait. Le modèle économique est clair : les 2,99€ enregistrent votre carte pour des abonnements à 30-50€/mois. Samsung ne fait pas de cadeaux par email non sollicité.',points:10},{label:'Je clique juste pour lire les conditions — sans donner ma CB',isCorrect:false,feedback:'La page peut installer des trackers ou un malware drive-by-download dès l\'ouverture, sans que vous n\'ayez rien saisi. Et l\'interface de gain est conçue pour vous pousser à "finaliser".',points:-5}], reflexe:'Les 2,99€ servent à enregistrer votre carte pour des abonnements cachés. Une carte expirée peut quand même être exploitée.', clickConsequence:'Votre CB est enregistrée. Des prélèvements de 30-50€/mois démarrent sur des services que vous n\'avez pas demandés.', redFlags:['samsung-france-client.com ≠ samsung.com','2,99€ = moyen d\'enregistrer une CB pour abonnements cachés','Une CB expirée peut être acceptée pour de petites transactions'] },
      { category:'ami-argent', title:'WhatsApp — ton ami est coincé à Amsterdam', context:'Dimanche après-midi. WhatsApp d\'un numéro inconnu.', visual:{type:'sms',from:'+44 7923 481 203 (inconnu)',body:'Salut c\'est Sophie ! Mon tel est tombé dans l\'eau à Amsterdam, j\'écris depuis le tel d\'une amie. J\'ai eu un accident avec un scooter, j\'ai besoin de 250€ pour l\'hôpital et le billet retour. Tu peux virer maintenant ? Je te rends ça lundi promis',hasClickableLink:false}, choices:[{label:'Je lui pose des questions personnelles sur ce numéro pour vérifier que c\'est bien Sophie',isCorrect:false,feedback:'Les escrocs font des recherches sur votre réseau social AVANT de vous contacter. Ils connaissent souvent le prénom du chien, les anniversaires, l\'école. Des questions personnelles peuvent avoir des réponses préparées.',points:-5},{label:'J\'appelle Sophie sur son ancien numéro pour confirmer',isCorrect:true,feedback:'C\'est la seule vérification fiable. Même si le téléphone est "cassé", Sophie peut emprunter un autre appareil pour recevoir votre appel. Les fraudeurs ne peuvent pas répondre à sa place.',points:10},{label:'Je lui envoie 50€ pour commencer, je vérifie son identité ensuite',isCorrect:false,feedback:'Il n\'y a pas d\"ensuite" avec les escrocs : après 50€, il y a une nouvelle urgence, puis une autre. Et les virements ne se remboursent pas. Vérifiez AVANT d\'envoyer la moindre somme.',points:-5}], reflexe:'Jamais d\'argent avant vérification. Appelez le VRAI numéro de Sophie — pas le numéro inconnu.', redFlags:['Numéro inconnu = signal 1','Accident + besoin urgent d\'argent = signal 2','Les questions personnelles peuvent avoir des réponses préparées par les escrocs'] },
      { category:'phishing-caf', title:'CAF — versement de 248€ en attente', context:'Vous êtes allocataire CAF. Cet email arrive un mercredi.', visual:{type:'email',from:'CAF — Caisse d\'Allocations Familiales',fromEmail:'prestations@caf-versements.fr',subject:'Versement de 248,00€ — Confirmez vos coordonnées sous 5 jours',body:'Madame, Monsieur,\n\nSuite au recalcul de vos droits, un versement de 248,00€ vous est dû.\n\nPour recevoir ce virement, confirmez vos coordonnées bancaires dans les 5 jours ouvrés.\n\nService Prestations CAF',hasClickableLink:true,linkLabel:'Confirmer mes coordonnées bancaires',linkUrl:'https://caf-versements.fr/coordonnees'}, choices:[{label:'Je fournis uniquement mon IBAN — pas mes identifiants CAF. C\'est moins risqué',isCorrect:false,feedback:'Votre IBAN permet des prélèvements SEPA depuis votre compte. Les fraudeurs l\'utilisent pour vous débiter, pas pour vous créditer. Et votre IBAN peut être combiné avec d\'autres données pour l\'usurpation d\'identité.',points:-5},{label:'Je me connecte sur caf.fr depuis mon navigateur pour vérifier',isCorrect:true,feedback:'Parfait. La CAF a déjà votre IBAN depuis votre inscription. Elle ne le re-demande jamais par email. Les versements s\'effectuent automatiquement. Vérifiez sur caf.fr ou appelez le 3230.',points:10},{label:'Je réponds à l\'email pour demander une confirmation écrite officielle avant d\'agir',isCorrect:false,feedback:'Vous répondez aux fraudeurs, pas à la CAF. Ils enverront une "confirmation officielle" parfaitement imitée. Et vous confirmez que votre email est actif pour de futures attaques.',points:-5}], reflexe:'La CAF ne re-demande jamais votre IBAN par email. Un IBAN permet des prélèvements — ce n\'est pas anodin.', clickConsequence:'Votre IBAN est utilisé pour des prélèvements frauduleux dans les semaines suivantes.', redFlags:['caf-versements.fr ≠ caf.fr','La CAF ne demande pas les coordonnées bancaires par email','Un IBAN seul suffit pour initier des prélèvements'] },
      { category:'qr-code', title:'QR code du restaurant — compte fidélité requis', context:'Vous êtes au restaurant avec des amis. Vous scannez le QR code pour voir le menu.', visual:{type:'browser-popup',subject:'Restaurant Le Mistral — Menu & Fidélité',body:'Bienvenue au Restaurant Le Mistral !\n\nPour accéder au menu digital, créez votre compte fidélité gratuit :\n\n• Prénom & Nom\n• Email\n• Téléphone\n• Mot de passe\n\nBonus : 10% sur votre prochain repas !\n\nOu accédez directement au menu →',hasClickableLink:true,linkLabel:'Créer mon compte fidélité',linkUrl:'https://lemistral-fidelite.com/register'}, choices:[{label:'Je crée un compte avec une adresse email jetable — comme ça mes vraies données restent protégées',isCorrect:false,feedback:'Votre numéro de téléphone et votre nom restent exposés même avec un email jetable. Et si vous réutilisez un mot de passe, il sera testé sur vos vrais comptes (credential stuffing). Refusez complètement.',points:-5},{label:'Je demande le menu papier — un menu ne devrait pas requérir une inscription',isCorrect:true,feedback:'Parfait. Un QR code de restaurant ne demande JAMAIS de créer un compte. Soit c\'est une collecte de données pour la revente, soit le QR code a été remplacé par quelqu\'un de malveillant.',points:10},{label:'Je crée le compte mais sans donner mon vrai numéro de téléphone',isCorrect:false,feedback:'Votre email et votre nom réels restent exposés. Si votre mot de passe est similaire à d\'autres comptes, il sera testé ailleurs. Et rien ne garantit que le site est légitime.',points:-5}], reflexe:'Un QR code de restaurant n\'exige jamais d\'inscription. Email jetable ≠ protection complète.', redFlags:['Un menu ne nécessite pas de compte','Email jetable ne protège pas vos autres données','Le QR code peut avoir été remplacé'] },
      { category:'facebook-arnaque', title:'Concours Samsung — 50 iPhone à gagner', context:'Ce post apparaît dans votre fil Facebook. La page a l\'air officielle.', visual:{type:'social-post',from:'Samsung France — ✓ Page vérifiée',body:'🎁 CONCOURS OFFICIEL SAMSUNG 🎁\n\nPour nos 10M de fans, nous offrons 50 iPhone 15 Pro !\n\nComment participer :\n✅ Liker cette page\n✅ Partager ce post\n✅ Commenter "JE PARTICIPE"\n✅ Confirmer ici pour validation\n\nTirage au sort dans 24h',hasClickableLink:true,linkLabel:'Confirmer ma participation officielle',linkUrl:'https://samsung-concours-fb.com/participate'}, choices:[{label:'Je participe sans cliquer sur le lien externe — je commente juste "JE PARTICIPE"',isCorrect:false,feedback:'En partageant et commentant, vous aidez l\'arnaque à atteindre vos amis. La fausse page collectera leurs données. Et le "lien de confirmation" sera partagé dans les commentaires.',points:-5},{label:'Je vérifie la vraie page Samsung France en cherchant directement dans la barre de recherche Facebook',isCorrect:true,feedback:'La vraie page Samsung France a des millions de followers et des années d\'historique. La fausse page a quelques semaines et peu de followers "réels". Comparez les deux avant toute action.',points:10},{label:'Je clique sur "Confirmer" — la page est vérifiée (coche bleue)',isCorrect:false,feedback:'La coche bleue peut être imitée avec un emoji ✓ ou obtenue frauduleusement. La vraie vérification Facebook est dans les paramètres de page, pas dans le nom affiché.',points:-5}], reflexe:'Vérifiez directement la page officielle Samsung dans Facebook avant toute participation. La coche peut être imitée.', clickConsequence:'Le lien vole vos identifiants Facebook et publie l\'arnaque depuis votre compte à vos amis.', redFlags:['Samsung n\'offre pas d\'iPhone (marque concurrente)','La coche bleue peut être imitée','Même commenter sans cliquer propage l\'arnaque'] },
      { category:'oversharing', title:'Instagram — 3 semaines à Bali, appart vide', context:'Vous êtes à l\'aéroport, excité. Vous publiez avant d\'embarquer.', visual:{type:'social-post',from:'Vous (@marie.dupont — profil public)',body:'☀️ J\'ai trop hâte ! 3 semaines à Bali ! Notre appart sera vide jusqu\'au 20 août 🏠 (18 rue Championnet, Paris 18e). Qui veut garder les plantes ? 🌱\n\n#Bali #Vacances2024 #ParisLibre'},choices:[{label:'Je restreins le post à mes amis seulement — ils me connaissent tous',isCorrect:false,feedback:'Parmi vos "amis" Facebook/Instagram, combien connaissez-vous vraiment ? Des connaissances lointaines, d\'anciens collègues, ou des amis d\'amis peuvent voir ce post. Et des amis peuvent le partager ou en parler.',points:-5},{label:'Je supprime l\'adresse, les dates précises et passe le profil en privé',isCorrect:true,feedback:'Parfait. L\'adresse + les dates d\'absence = invitation pour les cambrioleurs. En privé, seuls vos vrais contacts approuvés voient vos posts. Partagez vos vacances à votre retour.',points:10},{label:'Je supprime uniquement l\'adresse — les amis peuvent savoir que je suis en vacances',isCorrect:false,feedback:'Les dates d\'absence complètes (3 semaines jusqu\'au 20 août) sont aussi dangereuses que l\'adresse. Un cambrioleur patient planifie son intervention. Supprimez aussi les dates.',points:-5}], reflexe:'Adresse + dates d\'absence = risque de cambriolage. Même en mode amis, vous ne connaissez pas tous vos contacts.', redFlags:['Profil public = accessible à tous','Dates précises d\'absence = planning pour cambrioleurs','Les amis Facebook ne sont pas tous des proches de confiance'] },
      { category:'usb-piege', title:'Clé USB trouvée dans le parking — "CONFIDENTIEL"', context:'Lundi matin, parking de votre entreprise. Vous trouvez une clé USB étiquetée.', visual:{type:'browser-popup',subject:'Clé USB trouvée',body:'Vous trouvez une clé USB étiquetée :\n"CONFIDENTIEL — Résultats financiers 2024 — Direction Générale"\n\nVous êtes curieux. Votre PC professionnel est devant vous.\nLe service IT répond en général sous 2-3 jours.'},choices:[{label:'Je scanne la clé avec mon antivirus avant de l\'ouvrir — si elle est propre, je regarde',isCorrect:false,feedback:'Les antivirus détectent 60-80% des malwares connus. Les attaquants testent leurs malwares sur VirusTotal AVANT de les déposer. La clé peut être propre pour les antivirus et infecter quand même votre PC.',points:-5},{label:'Je la dépose au service IT sans la brancher, même si ça prend 2-3 jours',isCorrect:true,feedback:'C\'est la seule réponse correcte. La technique du "baiting" (appâtage) est précisément conçue pour exploiter la curiosité. Le service IT a des outils sécurisés pour analyser les clés USB suspectes.',points:10},{label:'Je la branche sur un vieux PC personnel isolé du réseau — comme ça mon PC pro est protégé',isCorrect:false,feedback:'Même sur un PC isolé, le malware peut s\'installer et attendre. Si ce PC se reconnecte un jour au réseau, il propage l\'infection. Et "isolé du réseau" n\'est pas simple à garantir.',points:-5}], reflexe:'Antivirus = protection partielle. Seul le service IT avec des outils spécialisés peut analyser une clé suspecte en sécurité.', redFlags:['L\'étiquette "Confidentiel" est conçue pour piquer la curiosité','Les antivirus ne détectent pas tous les malwares','Un PC "isolé" peut se reconnecter au réseau'] },
      { category:'phishing-ameli', title:'Ameli — remboursement de 78,40€ disponible', context:'Vous venez d\'avoir une consultation médicale remboursée. Cet email arrive.', visual:{type:'email',from:'Assurance Maladie — Ameli',fromEmail:'remboursement@ameli-sante.fr',subject:'Remboursement disponible — 78,40€ — Mise à jour requise',body:'Madame, Monsieur,\n\nSuite à vos soins du 18/03, un remboursement de 78,40€ est disponible.\n\nPour recevoir votre virement, veuillez mettre à jour vos coordonnées bancaires.\n\nAmeli — Service Remboursements',hasClickableLink:true,linkLabel:'Mettre à jour mon RIB',linkUrl:'https://ameli-sante.fr/rib/update'}, choices:[{label:'Je mets à jour mon RIB — 78,40€ c\'est cohérent avec mes soins récents, ça doit être vrai',isCorrect:false,feedback:'Les fraudeurs connaissent parfois votre médecin ou vos rendez-vous grâce à des fuites de données. La cohérence apparente ne rend pas l\'email légitime. L\'Ameli a déjà votre RIB.',points:-5},{label:'Je vais sur ameli.fr directement et vérifie dans mon compte mes remboursements',isCorrect:true,feedback:'Parfait. L\'Ameli rembourse automatiquement sur le RIB enregistré. Elle ne demande jamais de mise à jour par email. Sur ameli.fr, vos vrais remboursements sont visibles.',points:10},{label:'J\'attends que le virement arrive — s\'il n\'est pas là dans 5 jours je réclame',isCorrect:false,feedback:'Si l\'email est frauduleux, aucun remboursement n\'arrivera. Et l\'attente passive ne vous protège pas. Vérifiez sur ameli.fr maintenant.',points:-5}], reflexe:'L\'Ameli rembourse automatiquement — elle ne demande jamais de RIB par email. La cohérence du montant peut être calculée.', clickConsequence:'Votre RIB est utilisé pour des prélèvements SEPA frauduleux et revendu dans des bases de données.', redFlags:['ameli-sante.fr ≠ ameli.fr','L\'Ameli a déjà votre RIB — elle ne le re-demande jamais','La cohérence du montant peut résulter d\'une fuite de données médicales'] },
      { category:'phishing-chronopost', title:'SMS Chronopost — reprogrammation 2,49€', context:'Vous avez commandé en ligne. Ce SMS arrive ce matin.', visual:{type:'sms',from:'Chronopost',body:'Votre colis CHRFR48291 n\'a pas pu être livré (adresse incorrecte). Reprogrammez votre livraison et payez les frais de 2,49€ avant 18h :\nchronopost-livraison.fr/colis?id=FR48291',hasClickableLink:true,linkLabel:'chronopost-livraison.fr',linkUrl:'https://chronopost-livraison.fr/colis?id=FR48291'}, choices:[{label:'Je paie les 2,49€ via PayPal — j\'aurai un recours si c\'est frauduleux',isCorrect:false,feedback:'PayPal peut parfois rembourser les arnaques, mais le processus est long et incertain. Et si votre compte PayPal est lié à une CB, les données sont quand même exposées. La règle : vérifiez avant de payer.',points:-5},{label:'J\'appelle Chronopost avec le numéro dans le SMS pour vérifier',isCorrect:false,feedback:'Le numéro dans un SMS frauduleux appartient aux escrocs. Ils confirmeront l\'existence du colis et vous demanderont de payer. Cherchez le vrai numéro Chronopost sur chronopost.fr.',points:-5},{label:'Je vais sur chronopost.fr et entre mon numéro de commande pour vérifier le statut réel',isCorrect:true,feedback:'C\'est la seule approche fiable. Chronopost ne réclame jamais de frais par SMS. Sur chronopost.fr, votre colis affichera son vrai statut — ou n\'existera pas.',points:10}], reflexe:'Chronopost ne réclame pas de frais par SMS. Le numéro dans le SMS appartient aux escrocs — cherchez le vrai sur chronopost.fr.', clickConsequence:'Votre CB est enregistrée et débitée. Le vrai colis est livré normalement sans frais.', redFlags:['chronopost-livraison.fr ≠ chronopost.fr','Le numéro dans le SMS appartient aux escrocs','PayPal n\'est pas une protection garantie contre le phishing'] },
      { category:'phishing-sncf', title:'SNCF — votre billet Paris-Lyon annulé', context:'Vous avez réservé un TGV Paris-Lyon pour dans 2 semaines. Ce SMS arrive.', visual:{type:'sms',from:'SNCF Connect',body:'Votre réservation TGV Paris-Lyon (15/04 — 14h28) a été annulée suite à une erreur de paiement. Réservez à nouveau avant 23h59 pour garder votre tarif :\nsncf-connect-rebooking.fr/reservation',hasClickableLink:true,linkLabel:'sncf-connect-rebooking.fr',linkUrl:'https://sncf-connect-rebooking.fr/reservation'}, choices:[{label:'Je clique pour re-réserver avant minuit — j\'ai besoin de ce billet',isCorrect:false,feedback:'La panique face à l\'annulation de votre trajet est calculée. "sncf-connect-rebooking.fr" n\'est pas "sncf.com". Vos identifiants SNCF et données bancaires seraient volés.',points:-5},{label:'Je rappelle la SNCF avec le 3635 — c\'est le numéro officiel',isCorrect:true,feedback:'Parfait. Le 3635 est le vrai numéro SNCF. Votre billet y sera confirmé comme toujours valide. La SNCF ne notifie pas les annulations par SMS avec un lien externe.',points:10},{label:'Je vérifie l\'app SNCF Connect — si le billet y est toujours, le SMS est faux',isCorrect:false,feedback:'Bonne approche mais incomplète : téléchargez toujours l\'app depuis les stores officiels. Si votre app est la vraie app SNCF Connect, elle montrera effectivement que votre billet est valide.',points:-5}], reflexe:'La SNCF n\'annule pas les billets par SMS avec des liens. Vérifiez sur l\'app officielle ou le 3635.', clickConsequence:'Vos identifiants SNCF et données bancaires sont volés. Votre billet original reste valide.', redFlags:['sncf-connect-rebooking.fr ≠ sncf.com','Urgence avant minuit = pression artificielle','La SNCF n\'annule pas par SMS avec lien'] },
      { category:'vishing-banque', title:'Votre conseiller SocGen — virement frauduleux bloqué', context:'14h30, un jour de semaine. Votre téléphone affiche "Société Générale 0800 902 902".', visual:{type:'phone-call',from:'Société Générale — 0800 902 902',body:'Bonjour, Mathieu Bernard, conseiller Société Générale. Nous avons bloqué une tentative de virement de 1 200€ vers un compte en Bulgarie. Pour l\'annuler définitivement, j\'ai besoin de confirmer votre identité avec le code SMS que vous venez de recevoir. Ne le tapez nulle part — dites-le moi juste.',hasClickableLink:false}, choices:[{label:'Je donne les 3 premiers chiffres du code SMS seulement — pas les 6, donc pas de risque',isCorrect:false,feedback:'Les codes OTP à 6 chiffres avec 3 chiffres connus laissent 1 000 combinaisons. Les systèmes bancaires en ligne permettent souvent 3-5 tentatives. Les 3 premiers chiffres ont donc de la valeur pour un attaquant.',points:-5},{label:'Je raccroche et rappelle le numéro au dos de ma carte',isCorrect:true,feedback:'C\'est la seule réponse correcte. Les numéros affichés peuvent être usurpés (spoofing). Un vrai conseiller ne demande JAMAIS votre code OTP — ce code sert à valider une transaction, pas à vérifier une identité.',points:10},{label:'Je lui demande son identifiant employé et vérifie sur le site de la banque',isCorrect:false,feedback:'Les identifiants employés peuvent être inventés. Et pendant que vous vérifiez, l\'escroc maintient la pression. Raccrochez et rappelez directement — c\'est la seule vérification fiable.',points:-5}], reflexe:'Un conseiller bancaire ne demande JAMAIS votre code SMS. Même 3 chiffres ont de la valeur. Raccrochez et rappelez.', redFlags:['Le numéro affiché peut être usurpé (caller ID spoofing)','Un code OTP ne sert jamais à "vérifier l\'identité"','Les 3 premiers chiffres d\'un OTP à 6 chiffres ont de la valeur'] },
      { category:'arnaque-romantique', title:'Rencontre en ligne — ingénieur pétrolier bloqué', context:'Vous chattez depuis 3 semaines avec quelqu\'un de charmant sur un site de rencontre.', visual:{type:'social-post',from:'James Mitchell — Ingénieur offshore',body:'Ma chérie,\n\nJe dois te dire quelque chose de difficile. Je suis bloqué sur la plateforme en mer du Nord, mon contrat finit dans 10 jours et je pourrai enfin te rejoindre.\n\nMais j\'ai un problème urgent : mon compte est gelé à cause d\'un problème administratif. J\'ai besoin de 800€ pour les frais consulaires. Je te rembourse dès mon retour, je te promets.\n\nJe t\'aime ❤️',hasClickableLink:false}, choices:[{label:'J\'envoie via Western Union — comme ça le transfert est traçable et je peux porter plainte',isCorrect:false,feedback:'Western Union ne rembourse pas les arnaques — c\'est précisément pourquoi les escrocs le demandent. Le "traçable" ne signifie pas "récupérable". Votre argent est perdu dès l\'encaissement.',points:-5},{label:'Je propose de contacter directement le consulat ou l\'employeur à sa place',isCorrect:true,feedback:'Parfait. Si le problème était réel, il pourrait vous mettre en contact avec son employeur ou son consulat. Le refus de ce type d\'aide révèle l\'arnaque. L\'argent ne reviendra JAMAIS.',points:10},{label:'Je demande une vidéo en direct pour vérifier que c\'est bien lui',isCorrect:false,feedback:'Les deepfakes permettent aujourd\'hui les fausses vidéos en temps réel. Des apps comme DeepFaceLive peuvent usurper un visage pendant un appel. La vidéo n\'est plus une preuve suffisante.',points:-5}], reflexe:'Western Union ne rembourse pas. Les deepfakes permettent les fausses vidéos live. Proposez de contacter le consulat directement.', redFlags:['3 semaines de "love bombing" avant la demande d\'argent','Western Union = méthode préférée des escrocs car non remboursable','Les deepfakes permettent maintenant des vidéos en temps réel convaincantes'] },
      { category:'phishing-france-travail', title:'France Travail — prime exceptionnelle de 250€', context:'Vous êtes inscrit à France Travail. Cet email arrive début mars.', visual:{type:'email',from:'France Travail — Service Prestations',fromEmail:'prestations@francetravail-fr.eu',subject:'Prime exceptionnelle de 250€ — À valider avant le 31 mars',body:'Madame, Monsieur,\n\nDans le cadre du plan de soutien à l\'emploi, France Travail vous verse une prime exceptionnelle de 250€.\n\nPour recevoir cette prime, veuillez confirmer vos coordonnées bancaires avant le 31 mars.\n\nService Prestations — France Travail',hasClickableLink:true,linkLabel:'Confirmer mes coordonnées pour la prime',linkUrl:'https://francetravail-fr.eu/prime/valider'}, choices:[{label:'Je vérifie que le lien est en HTTPS et que le site a l\'air officiel avant de saisir',isCorrect:false,feedback:'HTTPS et une interface officielle ne prouvent pas la légitimité. Les fraudeurs clonable parfaitement les sites gouvernementaux. "francetravail-fr.eu" n\'est pas "francetravail.fr".',points:-5},{label:'Je me connecte sur mon espace personnel sur francetravail.fr pour vérifier',isCorrect:true,feedback:'Parfait. France Travail communique via votre espace personnel sur francetravail.fr. Toute prime réelle y serait visible. L\'extension ".eu" sur un site gouvernemental français est un signal d\'alarme.',points:10},{label:'Je transfère l\'email à France Travail pour qu\'ils confirment avant d\'agir',isCorrect:false,feedback:'Bonne intention, mais pendant que vous attendez leur réponse (parfois plusieurs jours), la "date limite du 31 mars" vous met sous pression. Vérifiez directement sur francetravail.fr d\'abord.',points:-5}], reflexe:'Les services gouvernementaux français utilisent uniquement le domaine ".fr" ou ".gouv.fr". HTTPS seul ne suffit pas.', clickConsequence:'Vos coordonnées bancaires sont collectées. Aucune prime n\'arrive.', redFlags:['francetravail-fr.eu ≠ francetravail.fr','Un site gouvernemental français n\'utilise pas ".eu"','HTTPS ne garantit pas la légitimité d\'un site'] },
      { category:'arnaque-edf', title:'EDF — coupure prévue demain matin 8h', context:'19h00. Ce SMS arrive. Vous avez une téléconférence à 9h demain.', visual:{type:'sms',from:'EDF Réseau',body:'[EDF] Coupure d\'électricité programmée demain de 8h à 12h pour travaux dans votre secteur (Paris 18e). Pour la reporter, connectez-vous avant 21h :\nedf-report-coupure.fr/intervention?code=ITV29481',hasClickableLink:true,linkLabel:'edf-report-coupure.fr',linkUrl:'https://edf-report-coupure.fr/intervention?code=ITV29481'}, choices:[{label:'Je me connecte pour reporter — j\'ai une réunion à 9h demain, c\'est urgent',isCorrect:false,feedback:'L\'urgence (réunion à 9h, deadline à 21h) vous empêche de réfléchir. "edf-report-coupure.fr" n\'est pas "edf.fr". Vos identifiants seraient volés. Et EDF ne propose pas de report par SMS.',points:-5},{label:'J\'appelle EDF avec le numéro dans ce SMS pour vérifier la coupure',isCorrect:false,feedback:'Le numéro dans un SMS frauduleux appartient aux escrocs. Ils confirmeront la coupure pour paraître crédibles. Cherchez le vrai numéro EDF sur edf.fr ou votre facture.',points:-5},{label:'Je cherche le vrai numéro EDF sur edf.fr ou ma facture et j\'appelle directement',isCorrect:true,feedback:'C\'est la seule approche sûre. Les coupures EDF planifiées sont notifiées par courrier ou via l\'espace client edf.fr — jamais par SMS avec un lien de report.',points:10}], reflexe:'EDF ne propose pas de report de coupure par SMS. Le numéro dans le SMS appartient aux escrocs — cherchez le vrai sur edf.fr.', clickConsequence:'Vos identifiants EDF sont volés, puis utilisés pour modifier vos coordonnées bancaires de prélèvement.', redFlags:['edf-report-coupure.fr ≠ edf.fr','EDF notifie les coupures par courrier, pas par SMS','Le numéro dans le SMS frauduleux appartient aux escrocs'] },
      { category:'arnaque-blablacar', title:'BlaBlaCar — votre passager demande un acompte', context:'Vous proposez un trajet Paris-Bordeaux sur BlaBlaCar. Un passager vous écrit.', visual:{type:'sms',from:'Mathieu (BlaBlaCar)',body:'Bonjour ! Je prends votre trajet Paris-Bordeaux ce vendredi. Pour confirmer ma réservation hors de l\'appli (frais plus faibles), pouvez-vous m\'envoyer votre IBAN ? Je vire l\'acompte de 35€ maintenant. Ou je vous envoie un lien PayPal pour que vous receviez directement.',hasClickableLink:false}, choices:[{label:'J\'envoie mon IBAN — c\'est un numéro de compte pour recevoir, pas pour donner',isCorrect:false,feedback:'Fausse idée répandue : un IBAN permet des prélèvements SEPA automatiques depuis votre compte, pas seulement des virements. L\'escroc peut initier des prélèvements depuis votre compte avec votre IBAN.',points:-5},{label:'Je maintiens la transaction uniquement dans l\'application BlaBlaCar officielle',isCorrect:true,feedback:'C\'est la règle absolue. BlaBlaCar gère les paiements de façon sécurisée dans son app. Toute demande "hors appli" est soit une fraude, soit une violation des conditions d\'utilisation.',points:10},{label:'Je clique sur son lien PayPal pour recevoir l\'acompte directement',isCorrect:false,feedback:'Le lien peut être un lien de demande d\'argent PayPal (pas un virement). Vous pourriez envoyer de l\'argent au lieu d\'en recevoir. Ou le lien peut voler vos identifiants PayPal.',points:-5}], reflexe:'Un IBAN permet des prélèvements, pas seulement des virements. Restez toujours dans l\'app BlaBlaCar.', redFlags:['Demande hors de l\'application = signal d\'alarme','Un IBAN permet des prélèvements SEPA depuis votre compte','Les liens PayPal peuvent être des demandes d\'argent inversées'] },
      { category:'phishing-doctolib', title:'Doctolib — confirmez votre RDV sous 2h', context:'Vous avez bien un RDV chez votre médecin demain. Ce SMS arrive.', visual:{type:'sms',from:'Doctolib',body:'Rappel : votre RDV du 20/03 à 10h30 nécessite une confirmation dans les 2h. Sans confirmation, il sera annulé et le créneau donné à quelqu\'un d\'autre.\nConfirmer : doctolib-rdv.fr/confirmer?id=RDV2847',hasClickableLink:true,linkLabel:'doctolib-rdv.fr/confirmer',linkUrl:'https://doctolib-rdv.fr/confirmer?id=RDV2847'}, choices:[{label:'Je confirme — l\'email de l\'expéditeur indique "Doctolib" et j\'ai bien ce RDV',isCorrect:false,feedback:'Le nom d\'affichage "Doctolib" dans un SMS ne prouve rien — n\'importe quel expéditeur peut usurper ce nom. "doctolib-rdv.fr" n\'est pas "doctolib.fr". Vos identifiants ou données de santé seraient volés.',points:-5},{label:'Je vais sur doctolib.fr ou l\'app Doctolib — mon RDV y est visible et déjà confirmé',isCorrect:true,feedback:'Parfait. Doctolib ne demande jamais de confirmation par SMS avec un lien externe. Votre RDV est automatiquement confirmé dans votre espace Doctolib.',points:10},{label:'Je clique juste pour voir — sans donner mes identifiants Doctolib',isCorrect:false,feedback:'Le clic seul peut déclencher un téléchargement ou enregistrer votre visite. Et une fois sur la page, l\'interface peut vous pousser à "vous identifier pour confirmer".',points:-5}], reflexe:'Doctolib ne demande pas de confirmation par SMS. Le nom affiché d\'un expéditeur SMS peut être usurpé.', clickConsequence:'Vos identifiants Doctolib donnent accès à votre historique médical complet et à vos ordonnances.', redFlags:['doctolib-rdv.fr ≠ doctolib.fr','Le nom SMS "Doctolib" peut être usurpé','Doctolib confirme les RDV automatiquement dans son app'] },
      { category:'phishing-netflix', title:'Netflix — votre abonnement expiré', context:'Vous êtes abonné Netflix. Cet email arrive un vendredi soir.', visual:{type:'email',from:'Netflix France',fromEmail:'billing@netflix-renouvellement.fr',subject:'Votre abonnement Netflix a expiré — Réactivez maintenant',body:'Bonjour,\n\nNous n\'avons pas pu renouveler votre abonnement Netflix.\n\nVotre accès est suspendu.\n\nPour continuer à regarder sans interruption, mettez à jour votre moyen de paiement maintenant.\n\nL\'équipe Netflix',hasClickableLink:true,linkLabel:'Mettre à jour mon paiement',linkUrl:'https://netflix-renouvellement.fr/billing'}, choices:[{label:'Je mets à jour avec ma CB — j\'utilise ma vieille CB expirée, pas de risque',isCorrect:false,feedback:'Un numéro de CB expiré peut être accepté pour de petits montants ou par certains systèmes. Et si votre CB est encore valide mais sera bientôt expirée, elle sera enregistrée et testée.',points:-5},{label:'Je vais sur netflix.com directement et vérifie mon abonnement dans "Compte"',isCorrect:true,feedback:'Parfait. Sur netflix.com > Compte, vous verrez immédiatement que votre abonnement est actif. Netflix n\'envoie jamais d\'emails d\'urgence avec des liens de paiement externes.',points:10},{label:'Je clique car le design de l\'email est identique à Netflix — c\'est forcément eux',isCorrect:false,feedback:'Les fraudeurs clonent parfaitement les designs de Netflix, PayPal, Amazon. Un design identique ne prouve rien. Seul le domaine de l\'expéditeur et l\'URL du lien permettent d\'identifier la fraude.',points:-5}], reflexe:'Design identique ≠ email légitime. Les fraudeurs clonable les interfaces parfaitement. Allez sur netflix.com directement.', clickConsequence:'Vos identifiants Netflix et données CB sont volés. Votre compte est revendu sur le dark web.', redFlags:['netflix-renouvellement.fr ≠ netflix.com','Un design parfaitement cloné ne prouve pas l\'authenticité','Une vieille CB peut être testée et exploitée'] },
      { category:'arnaque-securite-sociale', title:'CPAM — votre carte Vitale doit être renouvelée', context:'Vous recevez cet email de l\'Assurance Maladie. Votre carte Vitale a plusieurs années.', visual:{type:'email',from:'Assurance Maladie — CPAM',fromEmail:'cpam@ameli-renouvellement.fr',subject:'Votre carte Vitale arrive à expiration — Action requise',body:'Madame, Monsieur,\n\nVotre carte Vitale arrive à expiration. Pour recevoir votre nouvelle carte, confirmez vos informations personnelles et votre adresse de livraison.\n\nSans mise à jour avant le 15 avril, votre couverture sera temporairement suspendue.\n\nService Carte Vitale — CPAM',hasClickableLink:true,linkLabel:'Renouveler ma carte Vitale',linkUrl:'https://ameli-renouvellement.fr/vitale/renew'}, choices:[{label:'Je mets à jour — ma Vitale a bien plusieurs années et une expiration est possible',isCorrect:false,feedback:'La carte Vitale n\'a pas de date d\'expiration au sens strict. Elle se renouvelle automatiquement lors de changements de situation ou est envoyée par votre CPAM sans que vous en fassiez la demande par email.',points:-5},{label:'Je vais sur ameli.fr ou j\'appelle le 3646 pour vérifier le statut de ma carte',isCorrect:true,feedback:'Parfait. La CPAM ne demande jamais de mise à jour par email. Le renouvellement se fait automatiquement. Sur ameli.fr, vous verrez votre vraie situation.',points:10},{label:'Je réponds à l\'email pour demander des précisions avant d\'agir',isCorrect:false,feedback:'Vous répondez aux fraudeurs, pas à la CPAM. Ils enverront une "confirmation officielle" convaincante. Et vous confirmez que votre email est actif — utile pour de futures attaques.',points:-5}], reflexe:'La carte Vitale se renouvelle automatiquement. La CPAM ne le demande jamais par email.', clickConsequence:'Vos données personnelles sont collectées pour usurper votre identité et frauder à votre nom.', redFlags:['ameli-renouvellement.fr ≠ ameli.fr','La carte Vitale n\'a pas d\'expiration imposant une démarche email','Répondre à l\'email confirme votre adresse aux fraudeurs'] },
      { category:'arnaque-ami', title:'WhatsApp — ton ami Sophie est bloquée', context:'Dimanche 15h. WhatsApp. Numéro inconnu.', visual:{type:'sms',from:'+44 7923 481 203 (inconnu)',body:'Salut c\'est Sophie ! Mon tel est tombé dans l\'eau à Amsterdam, j\'écris depuis le tel d\'une copine. J\'ai eu un problème avec mon hôtel, j\'ai besoin de 200€ pour ma chambre ce soir. Tu peux virer maintenant sur son IBAN ? Je te rends ça lundi, c\'est vraiment urgent'},choices:[{label:'Je lui envoie 50€ maintenant pour l\'aider, et je vérifierai son identité ensuite',isCorrect:false,feedback:'Il n\'y a pas d\"ensuite" avec les escrocs. Une fois 50€ envoyés, une nouvelle urgence arrive. Et les virements bancaires ne se remboursent pas. Vérifiez AVANT tout envoi, même d\'une petite somme.',points:-5},{label:'J\'appelle le vrai numéro de Sophie pour confirmer',isCorrect:true,feedback:'C\'est la seule vérification fiable. Si son téléphone est vraiment cassé, elle pourra quand même recevoir votre appel sur un autre appareil. Les fraudeurs ne peuvent pas répondre à sa place.',points:10},{label:'Je lui pose des questions personnelles que seule Sophie connaît — sur ce nouveau numéro',isCorrect:false,feedback:'Les escrocs font des recherches sur les réseaux sociaux AVANT de vous contacter. Prénom du chien, école, lieu de vacances... Ces informations peuvent être facilement trouvées. Ce n\'est pas une vérification fiable.',points:-5}], reflexe:'Jamais d\'argent avant vérification vocale sur le vrai numéro. Les recherches sociales permettent aux escrocs de préparer des réponses.', redFlags:['Numéro inconnu','Les questions personnelles peuvent être préparées','50€ maintenant = 50€ de plus ensuite'] },
    ],
    intermediaire: [
      { category:'phishing-sophistique', title:'Email BNP — vérification DSP2 obligatoire', context:'Lundi matin, 9h. Vous ouvrez votre messagerie pro. Cet email attend depuis vendredi soir.', visual:{type:'email',from:'BNP Paribas',fromEmail:'securite@bnpparibas-dsp2.com',subject:'[DSP2] Vérification de sécurité obligatoire — Avant le 22/03',body:'Bonjour,\n\nDans le cadre de la directive européenne DSP2, nous devons vérifier votre identité pour maintenir l\'accès à votre espace client.\n\nCette vérification est obligatoire (réglementation BCE) et prend moins de 2 minutes.\n\n© BNP Paribas 2024 — 16 boulevard des Italiens, 75009 Paris',hasClickableLink:true,linkLabel:'Procéder à la vérification DSP2 obligatoire',linkUrl:'https://bnpparibas-dsp2.com/verify'}, choices:[{label:'Je procède — DSP2 est une vraie réglementation européenne, l\'email cite même la BCE',isCorrect:false,feedback:'Les fraudeurs connaissent parfaitement les terminologies légales. DSP2 est réel, mais une banque légitime ne vérifie jamais l\'identité via un lien email — elle le fait via l\'application ou en agence. "bnpparibas-dsp2.com" n\'est pas "bnpparibas.fr".',points:-5},{label:'Je vérifie le domaine expéditeur : "bnpparibas-dsp2.com" ≠ "bnpparibas.fr" — je vais sur le site directement',isCorrect:true,feedback:'Parfait. La mention de DSP2, de la BCE et de l\'adresse du siège social ne rendent pas l\'email légitime. Seul le domaine expéditeur compte. BNP Paribas utilise uniquement @bnpparibas.fr ou @mabanque.bnpparibas.com.',points:10},{label:'Je clique car l\'adresse du siège (16 bd des Italiens) est la vraie adresse BNP — ça prouve l\'authenticité',isCorrect:false,feedback:'Les adresses physiques des grandes entreprises sont publiques. Les fraudeurs les incluent pour donner de la crédibilité. Une adresse réelle dans un email ne prouve absolument rien.',points:-5}], reflexe:'DSP2 est réel, les adresses postales sont publiques — ni l\'un ni l\'autre ne prouve l\'authenticité. Vérifiez le domaine expéditeur.', clickConsequence:'Fausse page BNP parfaitement clonée, AiTM : vos identifiants ET votre code 2FA sont capturés.', redFlags:['bnpparibas-dsp2.com ≠ bnpparibas.fr','La réglementation DSP2 est réelle mais utilisée comme argument d\'autorité','L\'adresse du siège social est publique — non probante'] },
      { category:'credential-stuffing', title:'Connexion Google suspecte — Lagos 3h47', context:'7h30. Notification sur votre téléphone : nouvelle connexion Google.', visual:{type:'browser-popup',subject:'Nouvelle connexion à votre compte Google',body:'Connexion détectée :\n\nAppareil : Windows 10 — Chrome 119\nLocalisation : Lagos, Nigeria\nHeure : 03h47 (heure locale)\nIP : 197.210.84.X\n\nSi vous êtes à l\'origine de cette connexion → ignorer\nSinon → sécurisez votre compte',hasClickableLink:false}, choices:[{label:'Je clique sur le lien dans la notification email pour sécuriser',isCorrect:false,feedback:'La notification peut être un phishing elle-même. Toujours accéder directement à myaccount.google.com — jamais via un lien dans une notification par email ou SMS.',points:-5},{label:'Je vais directement sur myaccount.google.com, change mon mot de passe et active la 2FA',isCorrect:true,feedback:'Parfait. Accès direct au site + changement de mot de passe + activation 2FA. Vérifiez aussi l\'activité récente et révoquez les sessions ouvertes. Si vous utilisez ce mot de passe ailleurs, changez-les tous.',points:10},{label:'J\'ignore — ma géolocalisation parfois affiche le mauvais pays sur les VPN',isCorrect:false,feedback:'Vous avez un VPN actif ? Si oui, vérifiez quand même par précaution. Sinon, une connexion de Lagos à 3h47 est clairement suspecte. Ne jamais ignorer ce type d\'alerte sans vérification.',points:-5}], reflexe:'Connexion suspecte : accès direct au site officiel, jamais via un lien de notification. Vérifiez toutes vos sessions.', redFlags:['Lagos à 3h47 = connexion clairement anormale','La notification peut elle-même être un phishing','Si même mot de passe ailleurs : changez tout immédiatement'] },
      { category:'deepfake-patron', title:'Votre DG appelle — virement urgent confidentiel', context:'Vendredi 16h45. Votre DG vous appelle personnellement. Affichage : son numéro de mobile.', visual:{type:'phone-call',from:'Pierre Moreau — DG',body:'Bonjour, c\'est Pierre. Je suis en déplacement à Singapour pour une acquisition stratégique ultra-confidentielle. J\'ai besoin d\'un virement de 45 000€ aujourd\'hui avant 18h sur le compte de notre partenaire juridique. Ne passez pas par la procédure habituelle — c\'est une exigence de confidentialité des avocats. Je compte sur vous.',hasClickableLink:false}, choices:[{label:'J\'effectue le virement — c\'est le numéro de Pierre, sa voix, et la demande est crédible',isCorrect:false,feedback:'La fraude au président coûte des millions d\'euros aux entreprises chaque année. Les numéros peuvent être usurpés. La voix peut être clonée par IA (deepfake audio). La procédure habituelle EXISTS pour prévenir exactement ça.',points:-5},{label:'Je raccroche et rappelle Pierre sur son numéro de mobile en composant moi-même',isCorrect:true,feedback:'Parfait. Même si la voix était convaincante et le numéro affiché correct, recomposez le numéro vous-même. Si Pierre confirme, documentez et suivez la procédure normale. S\'il ne confirme pas : c\'était un deepfake.',points:10},{label:'Je demande à Pierre d\'envoyer un email de confirmation avant de procéder',isCorrect:false,feedback:'Si le compte email de Pierre est compromis, l\'email de "confirmation" sera aussi frauduleux. Et certains attaquants accèdent réellement aux emails du DG. La vérification vocale sur un canal séparé est la seule fiable.',points:-5}], reflexe:'Le numéro peut être usurpé, la voix peut être clonée. La seule vérification : rappeler sur un numéro que vous composez vous-même.', redFlags:['La fraude au président utilise toujours l\'urgence + la confidentialité','Les deepfakes audio permettent de cloner une voix en quelques secondes','L\'email de confirmation peut venir d\'une boîte compromise'] },
      { category:'collegue-compromis', title:'Votre collègue vous envoie un lien Google Drive', context:'Un message Teams de votre collègue Alexandre : "regarde ce doc urgent"', visual:{type:'email',from:'Alexandre Martin (Teams)',fromEmail:'alexandre.martin@votre-entreprise.com',subject:'',body:'Salut, peux-tu regarder ce document client urgent ? Je dois avoir ton retour avant la réu de 15h.\n\nhttps://docs.google.com/document/d/1BxC9kAm4eZ8hJ2pWqY7nFvR3sT6uL0i/edit?usp=sharing\n\nMerci',hasClickableLink:true,linkLabel:'Ouvrir le document partagé',linkUrl:'https://docs.google.com/document/d/1BxC9kAm4eZ8hJ2pWqY7nFvR3sT6uL0i/edit'}, choices:[{label:'J\'ouvre le lien — le domaine est docs.google.com, c\'est parfaitement sûr',isCorrect:false,feedback:'Les liens Google Docs peuvent être des phishing pages qui imitent une connexion Google pour voler vos identifiants. Ou le document peut contenir un lien malveillant. La règle : vérifiez avec Alexandre que c\'est bien lui.',points:-5},{label:'Je contacte Alexandre par un autre canal (appel, SMS) pour confirmer qu\'il a bien envoyé ce message',isCorrect:true,feedback:'Parfait. Si la session Teams d\'Alexandre est compromise, tous ses messages peuvent être de l\'attaquant. Un appel rapide suffit. "Tu m\'as bien envoyé un doc ?" — si non, signalez immédiatement à l\'IT.',points:10},{label:'J\'ouvre le lien mais sans me connecter — juste pour voir le document',isCorrect:false,feedback:'Des documents Google Docs frauduleux peuvent demander de "se connecter pour voir la version complète", vous redirigeant vers une fausse page Google. Et certains déclenchent des téléchargements automatiques.',points:-5}], reflexe:'Un message Teams ou email d\'un collègue peut venir d\'un compte compromis. Vérifiez par un canal séparé.', redFlags:['Même les vrais domaines (google.com) peuvent héberger du phishing','La session Teams d\'un collègue peut être compromise','Vérifiez par appel direct avant d\'ouvrir des liens inattendus'] },
      { category:'faux-ecommerce', title:'Nike Air Max à 39€ — site qui a l\'air pro', context:'Vous cherchez des Nike Air Max. Vous tombez sur ce site via une pub Instagram.', visual:{type:'browser-popup',subject:'NikeStoreOfficiel.fr — Air Max 270 à -78%',body:'Nike Air Max 270 — Édition Limitée\n\nPrix officiel : 180€\nVotre prix : 39,90€ (−78%)\n\n✓ Livraison express 24-48h\n✓ Retours gratuits 30 jours\n✓ Paiement sécurisé SSL\n✓ 4,8/5 sur 12 847 avis\n\n[Ajouter au panier]',hasClickableLink:true,linkLabel:'Commander maintenant',linkUrl:'https://nikestoreofficiel.fr/air-max-270'}, choices:[{label:'Je commande — le site a un SSL, les avis 4,8/5, et les retours gratuits',isCorrect:false,feedback:'SSL, faux avis et politiques de retour sont faciles à créer. Un article à -78% du prix officiel est le premier signal d\'alarme. Les sites frauduleux prennent votre argent et livrent des contrefaçons ou rien.',points:-5},{label:'Je vérifie sur nike.com si ce produit existe et si "nikestoreofficiel.fr" est un revendeur agréé',isCorrect:true,feedback:'Parfait. Nike liste ses revendeurs agréés sur nike.com. Un domaine comme "nikestoreofficiel.fr" n\'est pas "nike.com". À -78%, la contrefaçon ou l\'arnaque est presque certaine.',points:10},{label:'Je paie par PayPal — j\'aurai un recours si c\'est une arnaque',isCorrect:false,feedback:'PayPal peut parfois rembourser, mais pas systématiquement et le processus prend des semaines. Et votre adresse, nom et email sont quand même collectés. Évitez plutôt d\'acheter sur ce site.',points:-5}], reflexe:'-78% sur une marque premium = contrefaçon ou arnaque. Vérifiez les revendeurs agréés sur le site officiel de la marque.', redFlags:['nikestoreofficiel.fr ≠ nike.com','Les faux avis 4,8/5 s\'achètent','−78% = contrefaçon ou site frauduleux'] },
      { category:'extension-malveillante', title:'Extension Chrome — "PDF Editor Pro" — 10M d\'utilisateurs', context:'Vous cherchez à éditer un PDF rapidement. Vous trouvez cette extension sur le Chrome Web Store.', visual:{type:'browser-popup',subject:'PDF Editor Pro — Extension Chrome',body:'PDF Editor Pro\n10 234 812 utilisateurs ⭐ 4,7/5\n\nFonctionnalités :\n• Édition de PDF avancée\n• Conversion vers Word/Excel\n• Signature électronique\n\nAutorisations requises :\n• Lire et modifier toutes vos données sur tous les sites web\n• Accéder à votre historique de navigation\n• Gérer vos téléchargements',hasClickableLink:false}, choices:[{label:'J\'installe — 10M d\'utilisateurs et 4,7/5, c\'est une garantie de fiabilité',isCorrect:false,feedback:'Les extensions malveillantes peuvent avoir des milliers de faux avis et de faux utilisateurs. Des extensions légitimes peuvent aussi être rachetées et devenir malveillantes après une mise à jour. Les autorisations demandées sont excessives.',points:-5},{label:'Je refuse les autorisations excessives — une extension PDF n\'a pas besoin d\'accéder à tous mes sites',isCorrect:true,feedback:'Exact. Une extension PDF légitime n\'a besoin que d\'accéder aux fichiers PDF locaux. "Lire et modifier toutes les données sur tous les sites" + "historique de navigation" sont des autorisations excessives qui permettent d\'espionner votre banque, email et réseaux sociaux.',points:10},{label:'J\'installe mais en mode navigation privée pour limiter l\'accès à mes données',isCorrect:false,feedback:'Les extensions Chrome s\'appliquent partout sauf si explicitement désactivées en privé. Et "toutes les données sur tous les sites" inclut vos sites en navigation privée si l\'option est activée.',points:-5}], reflexe:'Une extension PDF n\'a pas besoin d\'accéder à tous vos sites. Des autorisations excessives = signal d\'alarme majeur.', redFlags:['Autorisations excessives pour une simple extension PDF','Les avis et téléchargements peuvent être falsifiés','Les extensions légitimes peuvent être rachetées et corrompues'] },
      { category:'vishing-avocat', title:'Maître Dupuis vous appelle — règlement urgent', context:'Vous recevez un appel d\'un cabinet d\'avocats concernant une affaire dont vous ignorez tout.', visual:{type:'phone-call',from:'+33 1 44 87 23 90',body:'Bonjour, Maître Dupuis du cabinet Dupuis & Associés. Je vous contacte au sujet d\'une procédure ouverte à votre encontre pour impayés auprès de SFR. Le montant est de 1 847€. Pour éviter une saisie sur salaire qui sera notifiée à votre employeur, vous pouvez régler amiablement maintenant par virement ou carte. Vous avez votre numéro de carte ?',hasClickableLink:false}, choices:[{label:'Je règle par carte — je ne veux pas que mon employeur soit informé',isCorrect:false,feedback:'Cette arnaque exploite la peur de la honte professionnelle. Aucun cabinet d\'avocats légitime ne prend des coordonnées de carte bancaire par téléphone. Les procédures judiciaires se font par huissier, jamais par appel téléphonique surprise.',points:-5},{label:'Je raccroche et cherche le cabinet "Dupuis & Associés" sur Justifit.fr ou le Barreau de Paris',isCorrect:true,feedback:'Parfait. Vérifiez l\'existence du cabinet sur l\'annuaire officiel du Barreau. Une vraie procédure judiciaire passe par un huissier de justice avec acte officiel — jamais par appel téléphonique avec paiement par carte.',points:10},{label:'Je demande un délai de 24h pour consulter un avocat et rappelle sur le numéro affiché',isCorrect:false,feedback:'Le numéro affiché appartient aux fraudeurs. En rappelant, vous confirmez votre intérêt et la pression reprendra. Un vrai cabinet n\'impose pas de délai de 24h pour éviter une "saisie sur salaire".',points:-5}], reflexe:'Les procédures judiciaires passent par des huissiers avec actes officiels — jamais par appel téléphonique avec paiement carte.', redFlags:['Aucun avocat légitime ne prend un numéro de carte par téléphone','La menace de notifier l\'employeur est une technique de pression émotionnelle','Les vraies procédures judiciaires passent par des actes d\'huissier'] },
      { category:'macro-office', title:'Document Word — "Activer le contenu" pour voir la facture', context:'Un email de votre fournisseur habituel avec une facture en pièce jointe.', visual:{type:'email',from:'Comptabilité — Fornex SARL',fromEmail:'compta@fornex-sarl.fr',subject:'Facture FA-2024-0847 — Votre commande du 12/03',body:'Bonjour,\n\nVeuillez trouver ci-joint notre facture pour votre commande du 12/03/2024.\n\nMontant : 4 280,00€ HT\nÉchéance : 12/04/2024\n\nCordialement,\nService Comptabilité',hasClickableLink:true,linkLabel:'📎 Facture_FA-2024-0847.docx',linkUrl:''}, choices:[{label:'J\'ouvre le document et clique sur "Activer le contenu" — c\'est toujours nécessaire pour les macros Office',isCorrect:false,feedback:'"Activer le contenu" exécute des macros VBA qui peuvent télécharger et installer un malware. Ce bouton ne devrait JAMAIS être cliqué dans un document reçu par email, même d\'un fournisseur connu — leur email peut être compromis.',points:-5},{label:'J\'appelle directement ma contact chez Fornex pour confirmer l\'envoi de cette facture',isCorrect:true,feedback:'Parfait. Les fournisseurs sont souvent ciblés pour que leurs emails soient utilisés dans des attaques (Business Email Compromise). Une confirmation téléphonique rapide suffit. Vous transférez ensuite la vraie facture au service compta.',points:10},{label:'J\'ouvre en mode protégé — comme ça les macros ne s\'exécutent pas automatiquement',isCorrect:false,feedback:'Le mode protégé est activé par défaut pour les fichiers email, mais une bannière propose toujours d\"Activer le contenu". Si vous cliquez, le malware s\'exécute. La vraie protection : ne pas ouvrir sans confirmation de l\'expéditeur.',points:-5}], reflexe:'"Activer le contenu" dans un document email = exécuter potentiellement un malware. Confirmez par téléphone d\'abord, toujours.', clickConsequence:'La macro télécharge un RAT (Remote Access Trojan). L\'attaquant accède à vos fichiers et peut modifier les RIB dans vos documents.', redFlags:['"Activer le contenu" ne doit JAMAIS être cliqué dans un email','Les comptes email de fournisseurs peuvent être compromis (BEC)','Le mode protégé ne protège pas si vous cliquez sur "Activer le contenu"'] },
      { category:'ingenierie-linkedin', title:'Recruteur LinkedIn — opportunité confidentielle', context:'Un recruteur LinkedIn vous contacte pour un poste senior bien rémunéré.', visual:{type:'social-post',from:'Sophie Renard — Executive Recruiter @ TalentBridge',body:'Bonjour,\n\nJe recrute pour un poste de Directeur Commercial (120k€/an) au sein d\'un groupe CAC40 confidentiel. Votre profil correspond parfaitement.\n\nPour que je transmette votre candidature, j\'ai besoin de votre CV complet, de vos 3 dernières fiches de paie et d\'une copie de votre pièce d\'identité pour vérification du casier judiciaire.',hasClickableLink:false}, choices:[{label:'J\'envoie mes documents — 120k€ c\'est une vraie opportunité, et cette info est souvent demandée',isCorrect:false,feedback:'Vos fiches de paie + pièce d\'identité = usurpation d\'identité complète. Des prêts, des comptes en banque, des sociétés peuvent être créés à votre nom. Et "vérification de casier judiciaire" ne nécessite jamais votre pièce d\'identité au stade du CV.',points:-5},{label:'Je vérifie le profil LinkedIn de Sophie Renard et le cabinet TalentBridge avant de répondre',isCorrect:true,feedback:'Parfait. Vérifiez : ancienneté du profil, connexions en commun, existence du cabinet sur Google/LinkedIn. Une vraie vérification de casier judiciaire se fait après une offre formelle, via un organisme officiel — jamais via un recruteur.',points:10},{label:'Je réponds en donnant mon CV sans les fiches de paie ni la pièce d\'identité',isCorrect:false,feedback:'Bonne instinct de ne pas tout donner. Mais votre CV complet (adresse, téléphone, employeur actuel) suffit pour du harcèlement, de l\'ingénierie sociale ciblée ou de la vente de données.',points:-5}], reflexe:'Fiches de paie + pièce d\'identité = usurpation d\'identité. Une vérification de casier légitime se fait après offre formelle, pas au stade du CV.', redFlags:['La pièce d\'identité ne se donne jamais à un recruteur','Les fiches de paie permettent l\'usurpation d\'identité complète','Vérifiez l\'ancienneté du profil LinkedIn et les connexions communes'] },
      { category:'arnaque-romantique', title:'Investisseur crypto — "pig butchering"', context:'Vous avez rencontré quelqu\'un de charmant sur une app de dating il y a 3 semaines.', visual:{type:'social-post',from:'Emma Chen — Consultante financière',body:'Ma chérie, tu m\'as demandé comment je fais pour vivre aussi bien. Je vais te confier mon secret : j\'investis sur une plateforme de trading crypto réservée aux initiés — TradeXPro. J\'ai fait +38% le mois dernier. Je peux t\'aider à créer un compte et commencer avec 500€. Le site semble compliqué mais je te guide. Tu me fais confiance ?',hasClickableLink:false}, choices:[{label:'J\'investis 500€ — je lui fais confiance depuis 3 semaines et le trading crypto peut être rentable',isCorrect:false,feedback:'C\'est le "pig butchering" (arnaque à l\'engraissement) : 3 semaines de relation pour créer la confiance, puis demande d\'investissement. Vos 500€ seront bloqués sur la plateforme frauduleuse, puis elle demandera plus pour "débloquer" les gains.',points:-5},{label:'Je cherche "TradeXPro" sur les sites de signalement (AMF Epargne-info-service, Cybermalveillance)',isCorrect:true,feedback:'Parfait. L\'AMF et Cybermalveillance.gouv.fr listent les plateformes frauduleuses. Et une vraie plateforme n\'est jamais "réservée aux initiés" accessible via une rencontre amoureuse.',points:10},{label:'J\'investis 100€ d\'abord pour tester — si ça marche, je mets plus',isCorrect:false,feedback:'Premier dépôt = premier succès : la plateforme affichera des "gains" fantômes pour vous inciter à investir davantage. Après plusieurs milliers d\'euros déposés, la plateforme deviendra inaccessible.',points:-5}], reflexe:'Pig butchering : relation de confiance → investissement → faux gains → demande de plus → disparition. Vérifiez sur AMF.fr.', redFlags:['Plateforme "réservée aux initiés" accessible via une relation = arnaque','Les premiers "gains" sont fantômes pour vous inciter à investir plus','Vérifiez toute plateforme sur AMF Epargne-info-service'] },
      { category:'faux-support-it', title:'Support IT interne — votre accès VPN expire demain', context:'Email du service IT de votre entreprise. Vous utilisez bien le VPN pour le télétravail.', visual:{type:'email',from:'Support IT — DSI',fromEmail:'support-it@votre-entreprise-helpdesk.com',subject:'Votre accès VPN expire demain — Renouvellement requis',body:'Bonjour,\n\nVotre licence VPN expire demain à 23h59. Pour éviter une interruption d\'accès en télétravail, veuillez renouveler votre authentification en cliquant ci-dessous.\n\nCe renouvellement prend moins de 30 secondes.\n\nCordialement,\nDSI — Support IT',hasClickableLink:true,linkLabel:'Renouveler mon accès VPN',linkUrl:'https://votre-entreprise-helpdesk.com/vpn/renew'}, choices:[{label:'Je renouvelle — j\'ai besoin de mon VPN pour travailler demain et l\'email vient du "Support IT"',isCorrect:false,feedback:'"votre-entreprise-helpdesk.com" n\'est pas le domaine de votre entreprise. Les services IT internes utilisent uniquement les domaines officiels de l\'entreprise. Vérifiez avec votre vrai service IT par les canaux habituels.',points:-5},{label:'Je contacte mon service IT par Teams ou par téléphone pour confirmer cette demande',isCorrect:true,feedback:'Parfait. Les demandes de renouvellement légitimes viennent d\'adresses @votre-entreprise.fr, pas de "helpdesk.com". Et votre vrai IT peut confirmer en 30 secondes. Cette vérification est essentielle.',points:10},{label:'Je renouvelle car la date d\'expiration semble correspondre — mon VPN a bien été installé il y a 1 an',isCorrect:false,feedback:'Les fraudeurs connaissent parfois les cycles de renouvellement de licences (souvent 1 an). La cohérence apparente ne rend pas l\'email légitime. Vérifiez le domaine expéditeur et contactez votre IT directement.',points:-5}], reflexe:'Les services IT internes n\'utilisent que les domaines officiels de l\'entreprise. Confirmez par Teams ou téléphone.', redFlags:['Le domaine expéditeur n\'est pas celui de l\'entreprise','La cohérence de la date d\'expiration peut être calculée','Votre vrai IT peut confirmer en 30 secondes via Teams'] },
      { category:'faux-site-gouv', title:'Amende de stationnement — 35€ à payer en ligne', context:'Vous recevez un SMS vous informant d\'une amende de stationnement impayée.', visual:{type:'sms',from:'ANTAI',body:'[ANTAI] Vous avez une amende de stationnement impayée (35€). Sans paiement avant le 28/03, des majorations s\'appliquent. Payez maintenant : antai-amendes.fr/payer?ref=PV29481',hasClickableLink:true,linkLabel:'antai-amendes.fr/payer',linkUrl:'https://antai-amendes.fr/payer'}, choices:[{label:'Je paie — 35€ c\'est peu et je veux éviter les majorations ANTAI',isCorrect:false,feedback:'"antai-amendes.fr" n\'est pas "antai.fr". L\'ANTAI (vrai organisme) envoie ses avis par courrier recommandé ou via l\'application Mes Amendes. Jamais par SMS avec un lien externe.',points:-5},{label:'Je vérifie sur l\'application "Mes Amendes" (officielle) ou antai.fr avec ma plaque',isCorrect:true,feedback:'Parfait. L\'ANTAI gère les amendes sur antai.fr et l\'app Mes Amendes. Vous pouvez vérifier avec votre plaque d\'immatriculation. Si l\'amende est réelle, elle apparaîtra.',points:10},{label:'Je paie via PayPal pour avoir une trace et un recours possible',isCorrect:false,feedback:'PayPal ne protège pas systématiquement contre le phishing. Et même en payant via PayPal, vos données (adresse, email) sont collectées par le site frauduleux pour d\'autres attaques.',points:-5}], reflexe:'L\'ANTAI envoie les avis d\'amende par courrier ou via l\'app officielle. Jamais par SMS avec lien.', redFlags:['antai-amendes.fr ≠ antai.fr','Les vraies amendes arrivent par courrier ou sur antai.fr/mesamendes.fr','PayPal ne garantit pas la protection contre le phishing'] },
      { category:'fournisseur-rib', title:'Votre fournisseur — changement de RIB urgent', context:'Email de votre fournisseur habituel. Vous travaillez régulièrement avec Fournisseur Tech SA.', visual:{type:'email',from:'Julien Moreau — Directeur Financier',fromEmail:'j.moreau@fournisseur-tech-sa.com',subject:'Changement de coordonnées bancaires — Virements futurs',body:'Bonjour,\n\nNous avons changé notre partenaire bancaire. Pour vos prochains règlements, merci d\'utiliser le nouveau RIB ci-dessous.\n\nIBAN : FR76 3000 6000 0112 3456 7890 189\nBIC : CMCIFRPP\n\nMerci de confirmer la réception de ce message.\n\nJulien Moreau\nDirecteur Financier',hasClickableLink:false}, choices:[{label:'Je mets à jour le RIB dans notre système — Julien est le vrai directeur financier',isCorrect:false,feedback:'La fraude au faux RIB (ou "arnaque au changement de RIB") est la fraude B2B la plus coûteuse. Le compte email de Julien peut être compromis. Les nouvelles coordonnées bancaires doivent TOUJOURS être confirmées par téléphone.',points:-5},{label:'J\'appelle Julien Moreau directement sur son numéro habituel pour confirmer ce changement',isCorrect:true,feedback:'C\'est la procédure obligatoire pour tout changement de RIB fournisseur. Un appel sur le numéro CONNU (pas dans l\'email) de Julien suffit. La fraude au faux RIB coûte des millions d\'euros aux entreprises annuellement.',points:10},{label:'Je réponds à l\'email pour demander une confirmation écrite sur papier à en-tête',isCorrect:false,feedback:'Si le compte email de Julien est compromis, le fraudeur peut envoyer un faux document sur papier à en-tête parfaitement imité. La vérification par appel téléphonique sur un numéro CONNU est la seule fiable.',points:-5}], reflexe:'Tout changement de RIB fournisseur doit être confirmé par appel sur le numéro habituel — pas via l\'email qui peut être compromis.', redFlags:['Le compte email d\'un fournisseur peut être compromis (BEC)','Un papier à en-tête peut être imité par les fraudeurs','Seul un appel sur un numéro CONNU est fiable'] },
      { category:'sim-swapping', title:'Votre opérateur — votre SIM sera désactivée à 20h', context:'17h30. SMS de votre opérateur Free.', visual:{type:'sms',from:'Free Mobile',body:'[Free] Votre SIM sera désactivée ce soir à 20h suite à une réclamation de fraude déposée à votre encontre. Pour bloquer cette désactivation, confirmez votre identité avant 19h30 :\nfree-mobile-assistance.fr/identite',hasClickableLink:true,linkLabel:'free-mobile-assistance.fr',linkUrl:'https://free-mobile-assistance.fr/identite'}, choices:[{label:'Je confirme mon identité avant 19h30 — perdre mon numéro de téléphone serait catastrophique',isCorrect:false,feedback:'L\'urgence (19h30) vous empêche de réfléchir. "free-mobile-assistance.fr" n\'est pas "free.fr". Vos identifiants Free collectés permettent une vraie demande de portabilité (SIM swapping) qui vous priverait de votre numéro.',points:-5},{label:'J\'appelle le 3244 (Free Mobile) pour vérifier si une réclamation existe',isCorrect:true,feedback:'Parfait. Le 3244 est le vrai service client Free. Ils confirmeront qu\'aucune désactivation n\'est prévue. Free n\'envoie jamais ce type de SMS avec un lien externe.',points:10},{label:'Je me connecte à mon espace Free sur l\'app Free Mobile pour vérifier',isCorrect:false,feedback:'Bonne idée si vous utilisez l\'app officielle téléchargée depuis les stores. Mais l\'urgence du SMS peut vous pousser à aller vite et à cliquer sur le lien dans le SMS par erreur. L\'appel au 3244 est plus sûr.',points:-5}], reflexe:'Free n\'envoie jamais de SMS avec lien pour "bloquer une désactivation". Appelez le 3244.', redFlags:['free-mobile-assistance.fr ≠ free.fr','Le SIM swapping avec vos identifiants peut vous priver de votre numéro','L\'urgence de 19h30 est calculée pour bloquer la réflexion'] },
      { category:'oauth-phishing', title:'Connexion Google — autorisez cette application', context:'Vous cliquez sur "Se connecter avec Google" sur un nouveau site.', visual:{type:'browser-popup',subject:'Google — Demande d\'autorisation',body:'L\'application "DocSign Pro" demande l\'accès à votre compte Google :\n\n✓ Voir votre adresse email Google\n✓ Voir, modifier et supprimer tous vos emails Gmail\n✓ Accéder à vos fichiers Google Drive\n✓ Voir votre historique de navigation Chrome\n\nEn acceptant, vous autorisez DocSign Pro à effectuer ces actions.',hasClickableLink:false}, choices:[{label:'J\'accepte — c\'est une demande OAuth Google officielle, Google valide ces connexions',isCorrect:false,feedback:'Google authentifie la connexion OAuth mais ne valide PAS les permissions demandées. Accorder l\'accès à tous vos emails + Drive + historique à une app inconnue est extrêmement dangereux.',points:-5},{label:'Je refuse les permissions excessives — une app de signature n\'a pas besoin de mes emails et Drive',isCorrect:true,feedback:'Parfait. Une app de signature électronique légitime demande uniquement votre email de base pour l\'identification. "Modifier et supprimer tous vos emails" + "accès Drive complet" sont des permissions excessives et dangereuses.',points:10},{label:'J\'accepte mais révoque l\'accès juste après avoir utilisé l\'app',isCorrect:false,feedback:'En quelques secondes d\'accès, l\'app peut télécharger tous vos emails, copier vos fichiers Drive, et envoyer des emails depuis votre adresse. La révocation après coup ne récupère pas ces données.',points:-5}], reflexe:'OAuth Google ne valide pas les permissions — vous devez les évaluer vous-même. Permissions excessives = refus.', redFlags:['OAuth officiel ne garantit pas que l\'app est légitime','Modifier et supprimer les emails = autorisation extrêmement dangereuse','Révoquer l\'accès après coup ne récupère pas les données déjà copiées'] },
      { category:'phishing-teams', title:'Message Teams — fichier SharePoint partagé', context:'Teams, 14h30. Un inconnu de l\'extérieur vous partage un document via Teams.', visual:{type:'email',from:'Lucas Bernard — Consultant Externe',fromEmail:'l.bernard@consulting-extern.com',subject:'',body:'Bonjour, suite à notre réunion de la semaine dernière, voici le rapport que vous m\'avez demandé. Bonne lecture !\n\n[Fichier joint : Rapport_Analyse_Concurrentielle_2024.xlsx]',hasClickableLink:true,linkLabel:'Ouvrir Rapport_Analyse_2024.xlsx',linkUrl:'https://sharepoint-consulting-extern.com/rapport'}, choices:[{label:'J\'ouvre le fichier — j\'ai peut-être eu cette réunion et oublié',isCorrect:false,feedback:'Un message d\'un inconnu externe référençant une réunion vague est un signal d\'alarme. Le lien "SharePoint" redirige vers "sharepoint-consulting-extern.com", pas "sharepoint.com". C\'est du phishing Teams.',points:-5},{label:'Je vérifie si j\'ai eu une réunion avec Lucas Bernard et contacte mon IT avant d\'ouvrir',isCorrect:true,feedback:'Parfait. Les attaques via Teams depuis des comptes externes sont en forte hausse. Vérifiez dans votre agenda si une réunion avec cet inconnu existe. Signalez à votre IT pour analyse du lien.',points:10},{label:'J\'ouvre car le fichier est sur SharePoint — c\'est hébergé par Microsoft, donc sûr',isCorrect:false,feedback:'Le vrai SharePoint de Microsoft est "sharepoint.com". "sharepoint-consulting-extern.com" est un domaine externe frauduleux qui imite le nom. L\'hébergement par Microsoft n\'est pas garanti.',points:-5}], reflexe:'Microsoft héberge SharePoint sur "sharepoint.com". Un sous-domaine différent = site externe potentiellement frauduleux.', redFlags:['sharepoint-consulting-extern.com ≠ sharepoint.com','Les attaques via Teams depuis comptes externes sont en hausse','Un message référençant une réunion vague est suspect'] },
      { category:'mitm-wifi', title:'Hôtel — portail WiFi demande votre email pro', context:'Vous êtes à l\'hôtel pour une conférence. Vous vous connectez au WiFi.', visual:{type:'browser-popup',subject:'Hôtel Mercure — Connexion WiFi',body:'Bienvenue au Mercure Paris Opéra\n\nPour accéder au WiFi gratuit, veuillez créer votre session :\n\n• Nom\n• Prénom\n• Email professionnel\n• Entreprise\n• Numéro de chambre\n\nCes informations sont requises pour la conformité RGPD et la facturation.',hasClickableLink:false}, choices:[{label:'Je remplis avec mon email pro — les hôtels collectent toujours ces données pour le WiFi',isCorrect:false,feedback:'Les hôtels collectent parfois des données, mais votre email professionnel + entreprise + chambre donnent aux fraudeurs les éléments pour une attaque de spear phishing ciblée contre vous et votre entreprise.',points:-5},{label:'Je remplis avec une adresse email jetable et active mon VPN d\'entreprise immédiatement après',isCorrect:true,feedback:'Parfait. Email jetable pour le portail captif (évite la collecte de vos vraies données), puis VPN pour protéger tout votre trafic une fois connecté. Cette combinaison est optimale.',points:10},{label:'Je donne mon email pro — la conformité RGPD mentionnée garantit que mes données sont protégées',isCorrect:false,feedback:'Mentionner le RGPD ne garantit pas sa conformité. N\'importe qui peut ajouter cette mention. Et même un portail légitime peut être piraté ou revendre vos données. Email jetable + VPN reste la meilleure approche.',points:-5}], reflexe:'Email jetable pour les portails captifs d\'hôtel + VPN immédiatement après connexion. Le RGPD mentionné ne garantit rien.', redFlags:['Email pro + entreprise = données utiles pour spear phishing','La mention RGPD ne garantit pas la protection réelle','VPN obligatoire sur WiFi d\'hôtel même après s\'être connecté'] },
      { category:'google-form-phishing', title:'Google Form — enquête RH confidentielle', context:'Email de votre DRH avec un formulaire Google à compléter avant vendredi.', visual:{type:'email',from:'Direction des Ressources Humaines',fromEmail:'drh@votre-entreprise-rh-form.com',subject:'Enquête confidentielle — Satisfaction collaborateurs 2024',body:'Bonjour,\n\nDans le cadre de notre démarche RSE, nous menons une enquête anonyme sur la satisfaction des collaborateurs.\n\nVotre participation est importante. Le formulaire prend 5 minutes.\n\nCordialement,\nDirection RH',hasClickableLink:true,linkLabel:'Accéder au formulaire confidentiel',linkUrl:'https://docs.google.com/forms/d/1AbC-xyz/viewform'}, choices:[{label:'Je remplis — les enquêtes RH passent souvent par Google Forms, c\'est courant',isCorrect:false,feedback:'L\'email vient de "votre-entreprise-rh-form.com", pas du domaine officiel de votre entreprise. Des formulaires Google frauduleux collectent des données personnelles ou des identifiants. Vérifiez avec votre vraie DRH.',points:-5},{label:'Je vérifie avec ma vraie DRH (via Teams ou sur l\'intranet) que ce formulaire est officiel',isCorrect:true,feedback:'Parfait. Les communications RH officielles viennent du domaine de l\'entreprise. Un formulaire Google légitime serait mentionné sur l\'intranet ou envoyé depuis une adresse @votre-entreprise.fr.',points:10},{label:'Je remplis le formulaire sans donner d\'informations trop personnelles',isCorrect:false,feedback:'Même des données "peu personnelles" (poste, département, ancienneté) permettent du spear phishing ciblé. Et certains formulaires Google demandent ensuite vos identifiants "pour vous identifier".',points:-5}], reflexe:'Les communications RH officielles viennent du domaine de l\'entreprise. Vérifiez sur l\'intranet ou par Teams.', redFlags:['votre-entreprise-rh-form.com n\'est pas le domaine officiel','Les Google Forms peuvent collecter identifiants ou données sensibles','Même des données limitées permettent du spear phishing'] },
      { category:'phishing-microsoft365', title:'Microsoft 365 — votre stockage OneDrive est plein', context:'Notification dans votre navigateur. Votre OneDrive pro est presque plein.', visual:{type:'email',from:'Microsoft 365',fromEmail:'noreply@microsoft365-storage.com',subject:'Votre espace OneDrive est plein — Fichiers en risque de suppression',body:'Votre espace OneDrive (100 Go) est utilisé à 98%.\n\nDes fichiers importants seront supprimés automatiquement dans 48h si vous ne prenez pas de mesures.\n\nAugmentez votre espace ou nettoyez vos fichiers maintenant.',hasClickableLink:true,linkLabel:'Gérer mon espace OneDrive',linkUrl:'https://microsoft365-storage.com/onedrive/manage'}, choices:[{label:'Je gère mon espace — 98% et une suppression dans 48h, c\'est urgent',isCorrect:false,feedback:'"microsoft365-storage.com" n\'est pas un domaine Microsoft. Microsoft utilise office.com, microsoft.com ou portal.office.com. L\'urgence des 48h est conçue pour vous empêcher de vérifier le domaine.',points:-5},{label:'Je vais directement sur portal.office.com et vérifie mon usage OneDrive',isCorrect:true,feedback:'Parfait. Sur portal.office.com > OneDrive, votre usage réel apparaît. Microsoft n\'envoie jamais d\'alertes de stockage via des domaines externes. Ses domaines légitimes sont office.com et microsoft.com.',points:10},{label:'Je clique car l\'email utilise le logo Microsoft officiel — Microsoft valide ses propres emails',isCorrect:false,feedback:'Microsoft ne "valide" pas les emails envoyés depuis des domaines tiers. Le logo Microsoft peut être copié par n\'importe qui. Seul le domaine expéditeur prouve l\'authenticité.',points:-5}], reflexe:'Microsoft utilise office.com et microsoft.com uniquement. Un logo Microsoft dans un email ne prouve rien.', redFlags:['microsoft365-storage.com ≠ microsoft.com ou office.com','48h de délai = pression artificielle','Le logo Microsoft peut être copié — seul le domaine compte'] },
      { category:'arnaque-leboncoin', title:'Leboncoin — acheteur veut payer par virement sécurisé', context:'Vous vendez votre vélo 350€ sur Leboncoin. Un acheteur vous contacte.', visual:{type:'sms',from:'Thomas D. (Leboncoin)',body:'Bonjour, votre vélo m\'intéresse. Je peux payer par "virement sécurisé Leboncoin" — c\'est plus sûr pour vous que le cash. Je vous envoie le lien de paiement pour que vous receviez d\'abord les 350€ avant que je vienne chercher le vélo.',hasClickableLink:false}, choices:[{label:'J\'accepte le virement sécurisé — c\'est Leboncoin qui sécurise, donc c\'est fiable',isCorrect:false,feedback:'"Virement sécurisé Leboncoin" n\'existe pas. Le vrai système Leboncoin s\'appelle "Leboncoin Paiement" et fonctionne uniquement via l\'application officielle. Tout autre "virement sécurisé" est une arnaque.',points:-5},{label:'Je refuse — Leboncoin n\'a pas de "virement sécurisé" via un lien SMS, j\'insiste sur le cash ou l\'app',isCorrect:true,feedback:'Parfait. Les vrais paiements sécurisés sur Leboncoin passent uniquement par l\'application officielle. Tout lien de paiement envoyé par SMS est frauduleux. Insistez sur le cash à la remise ou l\'app officielle.',points:10},{label:'J\'accepte mais j\'attends la confirmation bancaire avant de remettre le vélo',isCorrect:false,feedback:'Les virements frauduleux peuvent afficher une "confirmation" falsifiée instantanément. Seule la présence de l\'argent sur votre compte bancaire le lendemain matin prouve le virement réel.',points:-5}], reflexe:'"Virement sécurisé Leboncoin" via SMS = arnaque. Leboncoin Paiement fonctionne uniquement via l\'app officielle.', redFlags:['Leboncoin n\'envoie pas de liens de paiement par SMS','Une confirmation de virement peut être falsifiée instantanément','Le vrai Leboncoin Paiement est dans l\'application officielle'] },
      { category:'vishing-police', title:'La Brigade financière vous appelle', context:'Mercredi 10h. Appel depuis un numéro de préfecture.', visual:{type:'phone-call',from:'Brigade Financière — Paris',body:'Bonjour, commissaire Fontaine, Brigade Financière de Paris. Nous avons ouvert une enquête sur un réseau de fraude bancaire. Votre compte a été identifié comme impliqué dans des transactions suspectes. Pour votre protection, vous devez transférer vos économies sur un "compte séquestre sécurisé" que nous allons vous communiquer. N\'en parlez à personne — c\'est une procédure confidentielle.',hasClickableLink:false}, choices:[{label:'Je coopère — la Police Judiciaire peut effectivement ouvrir des enquêtes de ce type',isCorrect:false,feedback:'La police ne vous demande JAMAIS de transférer de l\'argent sur un "compte séquestre". C\'est la caractéristique absolue de cette arnaque. Les vraies enquêtes judiciaires passent par des convocations officielles, pas par des appels téléphoniques.',points:-5},{label:'Je raccroche et appelle le 17 ou le commissariat local pour vérifier l\'existence de cette enquête',isCorrect:true,feedback:'Parfait. La vraie Police/Gendarmerie ne demande jamais de transfert d\'argent par téléphone. Le 17 vous confirmera qu\'aucune enquête de ce type n\'existe vous concernant.',points:10},{label:'Je demande un document officiel de la brigade avant de coopérer',isCorrect:false,feedback:'L\'escroc peut envoyer un faux document PDF parfaitement imité (cachet, signature). Les vraies convocations judiciaires arrivent par courrier recommandé avec accusé de réception — jamais par email après un appel.',points:-5}], reflexe:'La police ne demande JAMAIS de transférer de l\'argent. Raccrochez et appelez le 17.', redFlags:['Aucun service de police ne demande de virement téléphonique','Le compte séquestre = compte des escrocs','Les vrais documents judiciaires arrivent par courrier recommandé'] },
      { category:'phishing-payfit', title:'PayFit — mise à jour de vos coordonnées de paie', context:'Email de PayFit, la plateforme RH de votre entreprise.', visual:{type:'email',from:'PayFit — Administration',fromEmail:'noreply@payfit-rhservice.com',subject:'Mise à jour requise — Coordonnées bancaires de paie',body:'Bonjour,\n\nSuite à notre migration vers PayFit 3.0, nous avons besoin de confirmer vos coordonnées bancaires pour assurer le virement de votre salaire du mois prochain.\n\nSans mise à jour avant le 25/03, votre virement pourrait être retardé.',hasClickableLink:true,linkLabel:'Confirmer mes coordonnées bancaires',linkUrl:'https://payfit-rhservice.com/rib/update'}, choices:[{label:'Je mets à jour — un salaire retardé est inacceptable, et PayFit envoie bien ce type d\'email',isCorrect:false,feedback:'"payfit-rhservice.com" n\'est pas "payfit.com". PayFit ne demande jamais les coordonnées bancaires par email — elles sont modifiées uniquement dans l\'application par le salarié ou les RH de votre entreprise.',points:-5},{label:'Je contacte mon service RH directement pour confirmer si PayFit a bien envoyé cet email',isCorrect:true,feedback:'Parfait. Votre service RH peut vérifier immédiatement si une mise à jour est nécessaire. PayFit communique via payfit.com uniquement. Aucune migration ne nécessite de donner ses coordonnées par email.',points:10},{label:'Je mets à jour car la menace de salaire retardé me semble réelle — j\'ai entendu parler d\'une migration',isCorrect:false,feedback:'Les escrocs font des recherches sur les outils de votre entreprise (visible sur LinkedIn par exemple). Connaître que votre entreprise utilise PayFit ne rend pas l\'email légitime.',points:-5}], reflexe:'PayFit ne collecte jamais les coordonnées bancaires par email. Votre RH peut confirmer en 2 minutes.', redFlags:['payfit-rhservice.com ≠ payfit.com','Les coordonnées bancaires de paie se gèrent dans l\'app, pas par email','Connaître votre outil RH ne rend pas l\'email légitime'] },
      { category:'arnaque-investissement', title:'Conseiller crypto — +40% garanti en 30 jours', context:'Un ami vous recommande un conseiller en investissement crypto.', visual:{type:'sms',from:'Kevin — Gestionnaire de patrimoine',body:'Bonjour, votre ami Marc me recommande. J\'ai une stratégie d\'investissement qui a rapporté +40% en 30 jours à mes clients. Placement minimum : 1 500€. Je vous explique la stratégie en appel vidéo. Vous êtes libre demain à 18h ?',hasClickableLink:false}, choices:[{label:'J\'accepte l\'appel vidéo — si Marc le recommande, c\'est crédible, et je n\'engage rien',isCorrect:false,feedback:'L\'appel vidéo est conçu pour vous convaincre et créer une relation de confiance avant la demande d\'investissement. Marc peut lui-même être une victime qui a "gagné" sur des faux gains et recommande de bonne foi.',points:-5},{label:'Je vérifie sur l\'ORIAS et l\'AMF si Kevin est enregistré comme conseiller financier agréé',isCorrect:true,feedback:'Parfait. Tout conseiller financier professionnel doit être enregistré sur l\'ORIAS (orias.fr). Et l\'AMF liste les conseillers autorisés. +40% garanti est illégal — aucun rendement ne peut être garanti.',points:10},{label:'J\'investis 500€ pour tester — si Marc a vraiment gagné, c\'est peut-être réel',isCorrect:false,feedback:'Marc a peut-être "gagné" virtuellement — ses gains affichés sont peut-être fictifs pour l\'inciter à recommander. Et votre 500€ de "test" affichera aussi de faux gains pour vous pousser à investir plus.',points:-5}], reflexe:'+40% garanti = illégal et arnaque. Vérifiez sur ORIAS.fr. Les gains de "Marc" peuvent être fictifs.', redFlags:['+40% garanti est illégal — aucun rendement ne peut être promis','Les vrais conseillers financiers sont sur ORIAS.fr','Les gains affichés à Marc peuvent être fictifs pour qu\'il recommande'] },
      { category:'phishing-dropbox', title:'Dropbox — document partagé par votre directeur', context:'Email de votre directeur — lien Dropbox vers un document confidentiel.', visual:{type:'email',from:'Directeur Commercial',fromEmail:'p.lambert@votre-entreprise.fr',subject:'Document confidentiel — À lire avant la réunion de demain',body:'Bonjour,\n\nVeuillez lire ce document avant notre réunion de demain matin. C\'est confidentiel.\n\nCordialement,\nPhilippe Lambert',hasClickableLink:true,linkLabel:'Ouvrir sur Dropbox',linkUrl:'https://dropbox.com.file-share.net/s/ABcDeFgH'}, choices:[{label:'J\'ouvre — l\'email vient de l\'adresse officielle de mon directeur @votre-entreprise.fr',isCorrect:false,feedback:'L\'adresse @votre-entreprise.fr peut être usurpée (spoofed) ou le compte peut être compromis. Et le lien "dropbox.com.file-share.net" n\'est pas Dropbox — c\'est un domaine externe qui imite le nom.',points:-5},{label:'Je vérifie l\'URL du lien : "dropbox.com.file-share.net" ≠ "dropbox.com" — je contacte mon directeur',isCorrect:true,feedback:'Parfait. Le vrai Dropbox utilise uniquement "dropbox.com". "dropbox.com.file-share.net" est un domaine externe qui capitalise sur le fait que vous voyez "dropbox.com" dans l\'URL sans lire la suite.',points:10},{label:'J\'ouvre sur mon téléphone personnel — comme ça mon PC pro est protégé',isCorrect:false,feedback:'Ouvrir sur votre téléphone personnel n\'offre aucune protection supplémentaire. Si le lien installe un malware ou vole des identifiants, les dégâts surviennent sur l\'appareil utilisé.',points:-5}], reflexe:'dropbox.com.file-share.net ≠ dropbox.com. Lisez l\'URL en entier — le vrai domaine est à la fin.', redFlags:['dropbox.com.file-share.net ≠ dropbox.com','L\'adresse @votre-entreprise.fr peut être usurpée','Un téléphone personnel n\'offre pas de protection supplémentaire'] },
      { category:'smishing-banque', title:'Alerte Société Générale — transaction bloquée', context:'Dimanche 11h. SMS affiché dans le fil de vrais SMS SocGen.', visual:{type:'sms',from:'Societe Generale',body:'[SG] Transaction de 847€ bloquée (sécurité). Si vous n\'êtes pas à l\'origine, confirmez votre identité sous 30 min pour la bloquer définitivement :\nsg-securite-client.fr/bloquer?tx=TXN28471',hasClickableLink:true,linkLabel:'sg-securite-client.fr',linkUrl:'https://sg-securite-client.fr/bloquer?tx=TXN28471'}, choices:[{label:'Je confirme sous 30 min — 847€ bloqués c\'est urgent et le SMS est dans mon vrai fil SocGen',isCorrect:false,feedback:'Les fraudeurs peuvent injecter des SMS dans le fil de vos vrais SMS de marque (technique SMS spoofing). La présence dans votre fil habituel ne prouve pas l\'authenticité. "sg-securite-client.fr" ≠ "societegenerale.fr".',points:-5},{label:'Je vais directement dans l\'application Société Générale pour vérifier mes transactions',isCorrect:true,feedback:'Parfait. Dans l\'app SocGen, toutes vos transactions récentes et leur statut sont visibles. Si aucune transaction de 847€ n\'apparaît, le SMS était frauduleux. La SocGen ne bloque pas via des SMS avec liens.',points:10},{label:'Je rappelle le numéro dans le SMS pour confirmer',isCorrect:false,feedback:'Les SMS frauduleux peuvent inclure de vrais numéros SocGen pour paraître crédibles, ou des numéros surtaxés. Appelez le numéro au dos de votre carte — jamais celui dans un SMS suspect.',points:-5}], reflexe:'Les SMS peuvent être injectés dans vos vrais fils de messages de marque. Vérifiez dans l\'app officielle.', redFlags:['sg-securite-client.fr ≠ societegenerale.fr','Les SMS spoofing permettent d\'injecter des messages dans vos vrais fils','30 minutes = pression pour empêcher la vérification'] },
      { category:'faux-site-emploi', title:'Offre CDI — télétravail 100%, 2 800€/mois', context:'Vous cherchez un emploi. Cette offre sur Indeed semble parfaite.', visual:{type:'browser-popup',subject:'OpportunityConnect — CDI Assistant administratif — 2 800€',body:'URGENT — CDI — Assistant(e) Administratif(ve)\n\n• Télétravail 100%\n• Salaire : 2 800€/mois net\n• Horaires : 9h-17h\n• Démarrage immédiat\n\nPour postuler, envoyez CV, lettre de motivation, pièce d\'identité et dernier bulletin de salaire.\n',hasClickableLink:false}, choices:[{label:'Je postule avec tous les documents demandés — ce poste correspond exactement à ce que je cherche',isCorrect:false,feedback:'Pièce d\'identité + bulletin de salaire à un inconnu = usurpation d\'identité complète possible. Ces données permettent d\'ouvrir des comptes, contracter des prêts ou créer des entreprises à votre nom.',points:-5},{label:'Je cherche l\'entreprise "OpportunityConnect" sur Société.com, LinkedIn et Google avant de postuler',isCorrect:true,feedback:'Parfait. Une vraie entreprise a une présence vérifiable : SIRET sur Société.com, page LinkedIn, site web. Les documents demandés (pièce d\'identité + bulletins de paie) ne se demandent qu\'après un entretien et une offre formelle.',points:10},{label:'Je postule avec CV et lettre de motivation seulement — je garderai la pièce d\'identité pour plus tard',isCorrect:false,feedback:'Bonne instinct de ne pas tout donner. Mais votre CV (adresse, téléphone, employeur actuel) et votre email suffisent pour du spam, du harcèlement ou des attaques de phishing ciblées.',points:-5}], reflexe:'Pièce d\'identité + bulletin de paie ne se donnent qu\'après un entretien et une offre formelle signée. Vérifiez l\'entreprise d\'abord.', redFlags:['Documents identitaires demandés au stade du CV = arnaque','Vérifiez sur Société.com et LinkedIn avant tout envoi','2800€ net en télétravail 100% sans entretien = signal d\'alarme'] },
      { category:'phishing-linkedin', title:'LinkedIn — votre compte va être suspendu', context:'Notification LinkedIn : votre compte pro est en danger.', visual:{type:'email',from:'LinkedIn',fromEmail:'security@linkedin-account-review.com',subject:'Votre compte LinkedIn sera suspendu dans 24h — Action requise',body:'Bonjour,\n\nNous avons détecté une violation de nos conditions d\'utilisation sur votre compte. Pour éviter la suspension de votre profil professionnel, vérifiez votre identité maintenant.\n\nLinkedIn Security Team',hasClickableLink:true,linkLabel:'Vérifier mon compte LinkedIn',linkUrl:'https://linkedin-account-review.com/verify'}, choices:[{label:'Je vérifie — perdre mon LinkedIn pro serait catastrophique pour ma carrière',isCorrect:false,feedback:'L\'urgence (24h de suspension) est calculée pour vous faire agir sans réfléchir. "linkedin-account-review.com" n\'est pas "linkedin.com". LinkedIn envoie uniquement depuis @linkedin.com.',points:-5},{label:'Je vais directement sur linkedin.com et vérifie mes notifications de sécurité',isCorrect:true,feedback:'Parfait. Toutes les alertes de sécurité LinkedIn apparaissent dans Paramètres > Sécurité > Activité récente. Si rien n\'y apparaît, l\'email est frauduleux.',points:10},{label:'Je clique et modifie juste mon mot de passe LinkedIn via le lien — pas de risque à changer son MDP',isCorrect:false,feedback:'Vous modifiez votre MDP sur la fausse page, transmettant votre ancien ET nouveau MDP aux fraudeurs. Ils changent ensuite votre MDP sur le vrai LinkedIn, vous excluant de votre compte.',points:-5}], reflexe:'Les alertes LinkedIn sont dans Paramètres > Sécurité. Changer son MDP sur une fausse page donne l\'accès aux fraudeurs.', redFlags:['linkedin-account-review.com ≠ linkedin.com','Changer le MDP sur la fausse page = perdre l\'accès définitivement','LinkedIn envoie uniquement depuis @linkedin.com'] },
      { category:'malware-popup', title:'Votre Mac — "Sécurité macOS" alerte critique', context:'Vous travaillez sur votre Mac. Une fenêtre système apparaît.', visual:{type:'browser-popup',subject:'Sécurité macOS — Alerte critique',body:'Votre Mac est infecté par un logiciel espion.\n\nActivités suspectes détectées :\n• Accès caméra non autorisé\n• Keylogger actif\n• 4 822 fichiers compromis\n\nSolution recommandée : téléchargez MacKeeper pour nettoyer maintenant.',hasClickableLink:true,linkLabel:'Télécharger MacKeeper — Solution officielle Apple',linkUrl:'https://mackeeper-official-download.com/install'}, choices:[{label:'Je télécharge MacKeeper — Apple recommande souvent des partenaires de sécurité tiers',isCorrect:false,feedback:'Apple ne recommande jamais MacKeeper. Cette fenêtre vient de votre navigateur, pas de macOS. Les vraies alertes macOS apparaissent dans les Notifications système ou Réglages > Sécurité. MacKeeper est un logiciel controversé.',points:-5},{label:'Je ferme le navigateur via Cmd+Q et vérifie avec les outils de sécurité natifs macOS',isCorrect:true,feedback:'Parfait. Les vraies alertes de sécurité macOS n\'utilisent JAMAIS le navigateur. Fermez le navigateur complètement (Cmd+Q), relancez-le, et vérifiez Réglages > Confidentialité si vous avez un doute.',points:10},{label:'Je télécharge depuis le Mac App Store — comme ça Apple valide l\'application',isCorrect:false,feedback:'MacKeeper n\'est généralement pas disponible sur le Mac App Store. Et les applications téléchargées depuis des sites externes contournent les protections d\'Apple. Ne téléchargez rien depuis ce popup.',points:-5}], reflexe:'macOS n\'alerte JAMAIS via le navigateur. Fermez le navigateur complètement.', redFlags:['Les alertes macOS passent par les Notifications système, pas le navigateur','Apple ne recommande pas MacKeeper','Cmd+Q ferme le navigateur complètement — plus efficace que la croix'] },
      { category:'credential', title:'Notification — votre compte Netflix piraté', context:'Vous recevez un email de Netflix. Vous l\'utilisez depuis 5 ans.', visual:{type:'email',from:'Netflix',fromEmail:'info@netflix.com',subject:'Nous avons détecté une connexion suspecte à votre compte',body:'Bonjour,\n\nNous avons détecté une connexion à votre compte Netflix depuis un nouvel appareil :\n\nAppareil : Samsung TV — Brasov (Roumanie)\nHeure : 02h34\n\nSi ce n\'était pas vous, sécurisez votre compte maintenant.',hasClickableLink:true,linkLabel:'Sécuriser mon compte Netflix',linkUrl:'https://www.netflix.com/account/security?token=ABcD1234'}, choices:[{label:'Je clique sur le lien dans l\'email — l\'URL pointe vers netflix.com, c\'est sûr',isCorrect:false,feedback:'Des paramètres dans l\'URL (?token=ABcD1234) peuvent rediriger vers une page frauduleuse même si netflix.com apparaît dans l\'URL. Et l\'adresse expéditeur peut être spoofée. Allez directement sur netflix.com.',points:-5},{label:'Je vais directement sur netflix.com et vérifie "Activité récente" dans mon compte',isCorrect:true,feedback:'Parfait. Netflix > Compte > Activité récente liste tous les appareils connectés. Si une TV roumaine y apparaît, changez votre MDP. Si rien n\'apparaît, l\'email était frauduleux.',points:10},{label:'Je change mon mot de passe Netflix en cliquant sur le lien — c\'est la bonne pratique en cas de piratage',isCorrect:false,feedback:'Même si le lien semble valide, des redirections ou des tokens peuvent vous envoyer vers une fausse page. La bonne pratique : changez votre MDP toujours en tapant directement l\'URL dans votre navigateur.',points:-5}], reflexe:'Les tokens dans les URLs email peuvent rediriger vers des fausses pages. Tapez toujours l\'URL directement.', redFlags:['Des paramètres URL (?token=) peuvent masquer une redirection','Tapez toujours l\'URL directement — même si elle semble valide','Vérifiez l\'activité Netflix dans Compte > Activité récente'] },
      { category:'phishing-impots', title:'Email DGFiP — votre déclaration incomplète', context:'Mai, période de déclaration. Email "officiel" des impôts.', visual:{type:'email',from:'Direction Générale des Finances Publiques',fromEmail:'dgfip@impots-declaration-fr.eu',subject:'Votre déclaration 2024 est incomplète — Délai : 72h',body:'Madame, Monsieur,\n\nNous avons constaté que votre déclaration de revenus 2024 est incomplète.\n\nSi vous ne la complétez pas dans les 72h, une pénalité de 135€ sera automatiquement appliquée.\n\nDirection Générale des Finances Publiques',hasClickableLink:true,linkLabel:'Compléter ma déclaration',linkUrl:'https://impots-declaration-fr.eu/declaration/complete'}, choices:[{label:'Je complète ma déclaration — 72h et une pénalité de 135€, c\'est urgent',isCorrect:false,feedback:'L\'urgence et la pénalité sont calculées pour bloquer la réflexion. "impots-declaration-fr.eu" n\'est pas "impots.gouv.fr". Les services fiscaux français n\'utilisent pas le domaine ".eu".',points:-5},{label:'Je tape impots.gouv.fr dans mon navigateur et vérifie ma déclaration dans mon espace personnel',isCorrect:true,feedback:'Parfait. Votre déclaration réelle est accessible sur impots.gouv.fr. Si elle était vraiment incomplète, une notification apparaîtrait dans votre espace personnel — pas dans un email avec un domaine ".eu".',points:10},{label:'Je vérifie l\'authenticité de l\'email en regardant l\'en-tête complet (header analysis)',isCorrect:false,feedback:'L\'analyse des headers email est une bonne compétence, mais elle prend du temps et peut être trompeuse pour les non-experts. La règle plus simple et fiable : les services fiscaux français utilisent uniquement .gouv.fr.',points:-5}], reflexe:'Les services fiscaux français utilisent uniquement impots.gouv.fr — pas ".eu", pas ".fr" seul, pas ".com".', redFlags:['impots-declaration-fr.eu ≠ impots.gouv.fr','Les services fiscaux français n\'utilisent pas ".eu"','L\'analyse des headers peut être trompeuse pour les non-experts'] },
    ],
    expert: [
      { category:'aitm-phishing', title:'M365 — accès conditionnel expiré, reconnexion requise', context:'9h05. Votre session Microsoft 365 se ferme. Un écran de reconnexion s\'affiche dans votre navigateur.', visual:{type:'browser-popup',subject:'Microsoft — Votre session a expiré',body:'Votre session Microsoft 365 a expiré.\n\nPour continuer, reconnectez-vous.\n\nURL barre adresse : https://login.microsoftonline.com.auth-session-fr.com/common/oauth2/v2.0/authorize?client_id=...\n\nEntrez vos identifiants Microsoft :'}, choices:[{label:'Je me reconnecte — l\'URL contient bien "microsoftonline.com", c\'est le domaine officiel',isCorrect:false,feedback:'L\'URL complète est "microsoftonline.com.auth-session-fr.com" — le domaine réel est "auth-session-fr.com". C\'est une attaque AiTM qui capture même votre token 2FA en temps réel.',points:-5},{label:'Je ferme le navigateur et rouvre Microsoft 365 en tapant office.com dans un nouvel onglet',isCorrect:true,feedback:'Parfait. Lisez l\'URL de droite à gauche depuis le domaine racine. Les attaques AiTM capturent vos identifiants ET votre token 2FA simultanément.',points:10},{label:'Je me connecte car le site requiert ma clé de sécurité physique YubiKey — un phishing ne peut pas intercepter ça',isCorrect:false,feedback:'Les attaques AiTM modernes relayent en temps réel vos interactions hardware. Votre YubiKey répond à la vraie session Microsoft, mais l\'attaquant intercepte le token de session résultant.',points:-5}], reflexe:'Lisez l\'URL de droite à gauche depuis le domaine racine. AiTM peut intercepter même les tokens MFA hardware.', clickConsequence:'Vos identifiants ET votre token de session sont capturés. Accès M365 sans connaître votre MDP.', redFlags:['microsoftonline.com.auth-session-fr.com : le vrai domaine est "auth-session-fr.com"','AiTM bypass le 2FA en interceptant le token de session','Même une YubiKey peut être bypassée par relai en temps réel'] },
      { category:'bec-fournisseur', title:'Email fournisseur — changement de RIB (BEC)', context:'Votre fournisseur habituel vous envoie un email de son adresse officielle demandant un changement de coordonnées bancaires.', visual:{type:'email',from:'Marie Dupont — Comptabilité Fournisseur',fromEmail:'m.dupont@fournisseur-officiel.fr',subject:'Mise à jour coordonnées bancaires — Virement prochain 47 280€',body:'Bonjour,\n\nSuite à notre changement de banque, merci de mettre à jour notre RIB pour votre prochain règlement du 15/04.\n\nNouveau IBAN : FR76 4255 9000 0172 3456 7890 145\n\nMerci de confirmer réception,\nMarie'}, choices:[{label:'Je mets à jour le RIB — l\'email vient de la vraie adresse de Marie, j\'ai travaillé avec elle depuis 2 ans',isCorrect:false,feedback:'La boîte email de Marie est compromise (Business Email Compromise). Les attaquants ont accès à sa messagerie depuis des semaines, observant les échanges avant d\'agir. L\'adresse "officielle" est réelle mais contrôlée par l\'attaquant.',points:-5},{label:'J\'appelle Marie sur son numéro direct habituel pour confirmer ce changement de RIB',isCorrect:true,feedback:'Seule vérification fiable. Le numéro connu de Marie, composé directement. Si BEC confirmé, signalez à votre DSI. Les 47 280€ justifient 2 minutes d\'appel.',points:10},{label:'Je demande à Marie de renvoyer la confirmation depuis son email personnel en validation croisée',isCorrect:false,feedback:'Si son compte pro est compromis, son compte personnel peut l\'être aussi (réutilisation de mots de passe). Un attaquant ayant accès à son pro a probablement accès à ses contacts perso.',points:-5}], reflexe:'Un changement de RIB se valide TOUJOURS par appel sur un numéro connu — indépendamment de l\'adresse email.', redFlags:['BEC : l\'adresse officielle peut être compromise depuis des semaines','L\'email personnel peut aussi être compromis','47 280€ = montant sous les seuils habituels de contrôle renforcé'] },
      { category:'supply-chain-npm', title:'Package npm populaire — mise à jour 3.4.1 urgente CVE 9.8', context:'Vous développez une app Node.js. Une alerte apparaît dans votre console npm.', visual:{type:'browser-popup',subject:'npm — Mise à jour de sécurité critique',body:'Package : event-stream\nVersion actuelle : 3.3.6\nNouvelle version : 3.4.1 (SÉCURITÉ CRITIQUE)\n\nCVE-2024-48291 : Injection critique dans event-stream <= 3.3.6\nScore CVSS : 9.8/10 — Exécution de code à distance\n\n→ npm install event-stream@3.4.1'}, choices:[{label:'J\'installe immédiatement — CVSS 9.8 est critique et event-stream est un package très populaire',isCorrect:false,feedback:'C\'est exactement le vecteur d\'attaque supply chain. L\'incident "event-stream" de 2018 est réel : un package populaire compromettu après transfert de mainteneur. Vérifiez le CVE sur NVD/CVE.org avant toute installation urgente.',points:-5},{label:'Je vérifie sur npmjs.com et NVD si ce CVE est réel et si la 3.4.1 est bien la version officielle',isCorrect:true,feedback:'Parfait. CVE urgent + package populaire = vecteur d\'attaque supply chain classique. Vérifiez le changelog GitHub, les issues ouvertes, la date de publication sur npmjs.com et l\'existence du CVE sur nvd.nist.gov.',points:10},{label:'J\'installe dans un environnement de test isolé et analyse la diff du code source',isCorrect:false,feedback:'Si le malware est dans des dépendances de dépendances (sous-packages), la diff du package principal ne le montrera pas. Vérifiez d\'abord l\'authenticité du CVE sur les bases officielles.',points:-5}], reflexe:'CVE critique urgent = vecteur d\'attaque supply chain. Vérifiez l\'authenticité sur NVD/CVE.org avant d\'installer.', redFlags:['Les CVE peuvent être inventés pour forcer des installations rapides','La diff ne détecte pas les malwares dans les sous-dépendances','L\'incident event-stream 2018 est un précédent réel de supply chain npm'] },
      { category:'spear-phishing-osint', title:'Email de votre DSI — rapport pentest confidentiel via WeTransfer', context:'Vous êtes RSSI. Email de votre DSI avec un lien de téléchargement pour un rapport confidentiel.', visual:{type:'email',from:'Thomas Renard — DSI',fromEmail:'t.renard@votre-entreprise.fr',subject:'Rapport pentest confidentiel — À lire avant 15h',body:'Thomas,\n\nLe cabinet mandaté pour notre pentest annuel a identifié une vulnérabilité critique dans notre AD. Je t\'envoie le rapport via WeTransfer (hors messagerie d\'entreprise pour confidentialité).\n\nhttps://we-transfer-file.com/rapport-pentest-2024.pdf\n\nLis-le avant la réunion de 15h.'}, choices:[{label:'Je télécharge — mon DSI est l\'expéditeur, le contexte pentest est réel, WeTransfer est courant',isCorrect:false,feedback:'Spear phishing OSINT : l\'attaquant connaît le pentest planifié via des calendriers partagés ou réseaux internes. "we-transfer-file.com" ≠ "wetransfer.com". Un rapport pentest ne se partage JAMAIS via lien email.',points:-5},{label:'Je contacte Thomas par téléphone ou Teams pour confirmer qu\'il a envoyé ce lien',isCorrect:true,feedback:'Parfait. Même pour votre DSI, un appel de 30 secondes est obligatoire pour tout lien externe sensible. Un rapport pentest réel passe par un canal chiffré interne — jamais WeTransfer.',points:10},{label:'J\'ouvre le PDF dans un sandbox d\'analyse — même si malveillant, mon SI est protégé',isCorrect:false,feedback:'Les malwares modernes détectent les environnements sandbox (VM-aware) et s\'exécutent différemment ou pas du tout. L\'analyse sandbox ne garantit pas la détection. Vérifiez avec Thomas d\'abord.',points:-5}], reflexe:'Un rapport pentest ne se partage jamais via lien email. Même un email de collègue connu peut être compromis.', redFlags:['we-transfer-file.com ≠ wetransfer.com','Un rapport pentest passe par des canaux chiffrés internes','Les malwares modernes détectent les sandboxes (VM-aware)'] },
      { category:'deepfake-audio', title:'Appel vocal de votre PDG — virement urgent depuis Shanghai', context:'Vendredi 16h50. Votre assistante de direction reçoit un appel du PDG depuis Shanghai.', visual:{type:'phone-call',from:'Jean-Marc Leroy — PDG',body:'Allô, c\'est Jean-Marc. Je suis à Shanghai pour la réunion avec nos partenaires. J\'ai besoin d\'un virement de 87 500€ avant 17h30 pour débloquer la signature du contrat. Le CFO est prévalidé. Ne passez pas par la procédure habituelle — c\'est une exigence de confidentialité des avocats.'}, choices:[{label:'J\'effectue le virement — c\'est la voix de Jean-Marc, son numéro, le CFO est prévalidé, tout est cohérent',isCorrect:false,feedback:'Le clonage vocal IA nécessite seulement 3 secondes d\'audio d\'une personne. Les numéros sont spoofés. Le "CFO prévalidé" ne peut être vérifié que par appel séparé. 87 500€ ne se vire pas sur appel vocal seul.',points:-5},{label:'Je rappelle le CFO sur son numéro habituel ET tente de joindre Jean-Marc sur son numéro de déplacement officiel',isCorrect:true,feedback:'Double vérification sur canaux séparés. Si le CFO confirme, appelez-le sur son numéro connu (pas dans cet appel). La procédure de virement >10k€ exige toujours une validation multi-personnes indépendante.',points:10},{label:'Je demande à Jean-Marc de me rappeler en vidéo pour confirmation visuelle avant le virement',isCorrect:false,feedback:'Les deepfakes vidéo en temps réel sont désormais possibles (Heygen, DeepFaceLive). Un appel vidéo n\'est plus une preuve d\'identité suffisante. Procédure multi-canal écrite obligatoire.',points:-5}], reflexe:'Le clonage vocal IA nécessite 3 secondes d\'audio. La vidéo en temps réel aussi. Procédure multi-canal écrite obligatoire.', redFlags:['3 secondes d\'audio suffisent pour cloner une voix de façon convaincante','Les deepfakes vidéo en temps réel sont maintenant accessibles','Aucun virement urgent ne bypass la procédure — jamais'] },
      { category:'watering-hole', title:'Site officiel d\'une conférence cybersécurité — mise à jour Adobe Reader', context:'Vous téléchargez le programme d\'une conférence cybersécurité depuis son site officiel.', visual:{type:'browser-popup',subject:'FIC 2024 — Programme officiel',body:'Forum International de la Cybersécurité 2024\n\nProgramme complet disponible en PDF.\n\n[Popup] Une mise à jour Adobe Reader est recommandée pour afficher ce document.\n\n→ Mettre à jour Adobe Reader'}, choices:[{label:'J\'installe la mise à jour — le site fic-conference.fr est le vrai site de la conférence',isCorrect:false,feedback:'Les sites officiels peuvent être compromis (watering hole). Les attaquants ciblent des sites visités par des profils de sécurité. Les mises à jour logicielles ne s\'effectuent JAMAIS depuis des sites tiers — uniquement depuis adobe.com.',points:-5},{label:'Je ferme le popup et vais sur adobe.com directement si une mise à jour est vraiment nécessaire',isCorrect:true,feedback:'Parfait. Les mises à jour logicielles s\'effectuent TOUJOURS depuis le site officiel du logiciel. Le watering hole compromet des sites légitimes visités par des cibles de valeur spécifiques.',points:10},{label:'Je télécharge et vérifie le hash SHA256 de l\'exécutable pour confirmer son authenticité',isCorrect:false,feedback:'Si le site distribue un malware, le hash de référence peut lui-même être frauduleux (le site contrôle aussi la page affichant le hash). Uniquement depuis adobe.com.',points:-5}], reflexe:'Les mises à jour depuis des sites tiers = vecteur d\'attaque. Les sites officiels peuvent être compromis. Uniquement adobe.com pour Adobe.', redFlags:['Les sites officiels peuvent être compromis (watering hole)','Le hash de référence sur un site compromis peut être falsifié','.exe depuis un lien dans un site de conférence = alerte maximale'] },
      { category:'dns-poisoning', title:'GitHub — certificat invalide NET::ERR_CERT_AUTHORITY_INVALID', context:'Vous travaillez. Votre navigateur affiche une alerte de sécurité sur github.com.', visual:{type:'browser-popup',subject:'Votre connexion n\'est pas privée',body:'NET::ERR_CERT_AUTHORITY_INVALID\n\nL\'attaquant tente peut-être de voler vos informations de github.com.\n\n→ Avancé → Accéder à github.com (dangereux)'}, choices:[{label:'Je passe outre l\'alerte — j\'ai besoin de GitHub pour mon sprint et les erreurs de cert arrivent parfois',isCorrect:false,feedback:'NET::ERR_CERT_AUTHORITY_INVALID sur github.com (qui a HSTS preloaded) est un signal critique. Vous êtes peut-être victime d\'un DNS poisoning ou d\'une attaque réseau. Contacter votre IT immédiatement.',points:-5},{label:'Je ne passe pas outre l\'alerte et contacte mon IT — une erreur de cert sur GitHub est anormale',isCorrect:true,feedback:'Parfait. GitHub a HSTS avec preloading — votre navigateur ne devrait jamais accepter un certificat invalide pour GitHub. Cette alerte = incident réseau sérieux. Changez de réseau (4G) pour vérifier si l\'alerte persiste.',points:10},{label:'Je vérifie l\'empreinte SHA256 du certificat GitHub sur un autre appareil pour comparer',isCorrect:false,feedback:'Si votre réseau entier est compromis (routeur, DNS), l\'autre appareil sur le même réseau verra la même fausse réponse. Utilisez un réseau 4G séparé pour la vérification.',points:-5}], reflexe:'HSTS preloaded (GitHub, Google, Facebook) ne devrait jamais générer d\'alerte de cert. Incident réseau à signaler immédiatement.', redFlags:['GitHub a HSTS preloaded — une erreur cert est un incident grave','Le réseau entier peut être compromis — vérifiez sur 4G','Ne jamais passer outre une alerte HSTS'] },
      { category:'insider-threat', title:'Collègue qui demande vos identifiants AD pour une urgence client', context:'Votre collègue Antoine vous contacte sur Teams — urgence client Michelin.', visual:{type:'email',from:'Antoine Girard (Teams)',fromEmail:'',subject:'',body:'Salut ! J\'ai une urgence avec le client Michelin — mon accès à leur espace est bloqué. Tu peux me donner tes identifiants AD juste pour ce soir ? La DSI répond en 2 jours et le client attend demain matin.'}, choices:[{label:'Je lui donne temporairement mes identifiants — Antoine est fiable et c\'est une urgence client réelle',isCorrect:false,feedback:'Partager ses identifiants AD est interdit dans toutes les politiques SSI. Même si Antoine est fiable, votre compte peut être utilisé pour des actions dont vous devrez répondre. Et si sa session est compromise, l\'attaquant obtient vos accès.',points:-5},{label:'Je contacte la DSI en urgence pour un accès temporaire pour Antoine — c\'est le seul canal légitime',isCorrect:true,feedback:'Parfait. Les urgences réelles ont des procédures d\'escalade. La DSI peut créer un accès temporaire tracé. Vos identifiants ne doivent jamais être partagés — même en urgence.',points:10},{label:'Je lui donne mais uniquement depuis un poste isolé pas connecté au SI principal',isCorrect:false,feedback:'Vos identifiants AD sont valides sur tout le réseau indépendamment du poste utilisé. Et "pas connecté au SI principal" est difficile à garantir techniquement.',points:-5}], reflexe:'Les identifiants ne se partagent jamais — même pour une urgence. Escaladez toujours via la procédure officielle DSI.', redFlags:['Partager ses identifiants = violation de politique SSI + risque de responsabilité','La session de votre collègue peut être compromise','Les urgences réelles ont des procédures d\'escalade qui fonctionnent'] },
      { category:'zero-day-pdf', title:'PDF d\'un avocat partenaire — convention à signer', context:'Vous êtes juriste. Un avocat partenaire vous envoie une convention depuis son adresse habituelle.', visual:{type:'email',from:'Maître Claire Fontaine — Cabinet Fontaine & Associés',fromEmail:'c.fontaine@fontaine-associes.fr',subject:'Convention de prestation 2024 — À signer avant le 20/04',body:'Bonjour,\n\nVeuillez trouver ci-joint notre convention de prestation pour validation.\n\nMerci de me retourner votre exemplaire signé.\n\nCordialement,\nMaître Fontaine'}, choices:[{label:'J\'ouvre le PDF — c\'est une relation de confiance établie depuis 2 ans avec ce cabinet',isCorrect:false,feedback:'Les comptes email d\'avocats sont des cibles privilégiées (données confidentielles sensibles). Les PDF peuvent exploiter des zero-days Adobe Reader non encore patchés. Vérifiez par appel avant tout PDF inattendu.',points:-5},{label:'J\'appelle Maître Fontaine sur son numéro direct habituel pour confirmer l\'envoi avant d\'ouvrir',isCorrect:true,feedback:'Parfait. Un appel de 30 secondes confirme l\'authenticité. Les PDF malveillants peuvent exploiter des vulnérabilités zero-day même dans des lecteurs à jour. Les avocats comprennent cette précaution.',points:10},{label:'J\'ouvre avec LibreOffice plutôt qu\'Adobe Reader — les exploits Adobe ne fonctionnent pas dessus',isCorrect:false,feedback:'Les exploits PDF existent aussi pour LibreOffice, Foxit et les visionneuses intégrées aux navigateurs. Il n\'y a pas de lecteur PDF immunisé. La vérification par appel est la protection la plus efficace.',points:-5}], reflexe:'Les PDF peuvent contenir des zero-days pour tous les lecteurs. Un appel de confirmation vaut toujours mieux que de changer de logiciel.', redFlags:['Les comptes d\'avocats sont des cibles privilégiées','Les zero-days PDF existent pour tous les lecteurs','Un document inattendu d\'un partenaire de confiance = vérification téléphonique'] },
      { category:'typosquatting-dev', title:'pip install reqests (faute de frappe) — malware pypi', context:'En développant, vous tapez accidentellement "reqests" au lieu de "requests".', visual:{type:'browser-popup',subject:'Terminal — pip install reqests',body:'$ pip install reqests\nCollecting reqests\n  Downloading reqests-2.31.0.tar.gz\nInstalling collected packages: reqests\nSuccessfully installed reqests-2.31.0\n\nNote: reqests est différent de requests.'}, choices:[{label:'Je désinstalle reqests et installe requests — c\'est une faute de frappe, aucun code n\'a encore été exécuté',isCorrect:false,feedback:'L\'installation d\'un package Python exécute setup.py à l\'installation — du code s\'est donc déjà exécuté. Typosquatting PyPI est une attaque réelle documentée. Traitez comme une compromission potentielle.',points:-5},{label:'Je désinstalle reqests, isole la machine et analyse les processus actifs et connexions réseau',isCorrect:true,feedback:'Parfait. pip install exécute setup.py (code arbitraire à l\'install). Isolation + analyse forensique. Signalez à votre RSSI et vérifiez si le package a établi des connexions sortantes.',points:10},{label:'Je vérifie le code source de reqests sur PyPI pour voir s\'il est malveillant avant de décider',isCorrect:false,feedback:'Le code visible sur PyPI peut différer du code réellement exécuté (obfuscation, téléchargement en phase 2). L\'exécution a déjà eu lieu. L\'analyse du code après coup ne change pas qu\'un code a été exécuté.',points:-5}], reflexe:'pip install exécute setup.py = code exécuté dès l\'installation. Isolation + analyse forensique immédiate.', redFlags:['L\'installation d\'un package pip exécute du code (setup.py)','Le code PyPI visible peut différer du code réel','Typosquatting = attaque réelle documentée sur npm et PyPI'] },
      { category:'mfa-fatigue', title:'Notification Microsoft Authenticator — connexion depuis Berlin à 22h28', context:'22h30. Notification push Microsoft Authenticator inattendue sur votre téléphone.', visual:{type:'browser-popup',subject:'Microsoft Authenticator — Demande d\'approbation',body:'Approbation requise\n\nQuelqu\'un tente de se connecter à Microsoft 365.\n\nLocalisation : Berlin, Allemagne\nHeure : 22h28\n\n[APPROUVER] [REFUSER]'}, choices:[{label:'J\'approuve — j\'ai peut-être laissé une session ouverte sur un appareil en Allemagne',isCorrect:false,feedback:'MFA fatigue (push bombing) : envoyer des dizaines de demandes push jusqu\'à approbation par erreur. Si vous n\'êtes pas à Berlin à 22h28, refusez et signalez. Une demande inattendue = MDP probablement compromis.',points:-5},{label:'Je refuse, change immédiatement mon mot de passe Microsoft et signale à mon IT',isCorrect:true,feedback:'Parfait. Une demande push inattendue = votre MDP est probablement compromis. Refus + changement de MDP + signalement IT. Si vous recevez plusieurs demandes en rafale, c\'est du MFA bombing.',points:10},{label:'J\'ignore sans approuver — l\'attaquant ne peut pas entrer sans mon approbation',isCorrect:false,feedback:'Ignorer protège temporairement mais ne résout pas le problème de MDP compromis. L\'attaquant va réessayer, vous spammer (MFA fatigue), ou tenter d\'autres méthodes de bypass.',points:-5}], reflexe:'Notification push inattendue = MDP probablement compromis. Refus + changement MDP immédiat + signalement IT.', redFlags:['MFA fatigue : des dizaines de push jusqu\'à l\'approbation par erreur','Notification inattendue = MDP compromis, pas "session oubliée"','Ignorer ≠ sécurité : l\'attaquant va persister et escalader'] },
      { category:'osint-spear', title:'Email personnalisé avec vos données LinkedIn exactes — opportunité confidentielle', context:'Lundi matin. Email d\'un recruteur qui cite précisément votre parcours, vos certifications, et votre entreprise actuelle.', visual:{type:'email',from:'Marc Schneider — Executive Search',fromEmail:'m.schneider@talentexec-paris.fr',subject:'Direction Cybersécurité — CAC40 — 130k€ — Confidentiel',body:'Bonjour Thomas,\n\nJe recrute pour une DSI d\'un groupe CAC40 partenaire de mc2i.\n\nVotre parcours chez mc2i depuis 2019, vos certifications CISSP et votre expertise Azure AD correspondent exactement.\n\nJe vous envoie la fiche de poste et un NDA à signer avant entretien.'}, choices:[{label:'Je télécharge — il connaît mc2i, ma date d\'entrée, mes certifications. C\'est un vrai travail de sourcing.',isCorrect:false,feedback:'Votre profil LinkedIn, vos publications, et les pages "équipe" des sites d\'entreprise contiennent toutes ces informations. Le spear phishing OSINT est basé sur des données réelles. Le PDF peut contenir un exploit.',points:-5},{label:'Je vérifie l\'existence de "Marc Schneider" et "talentexec-paris.fr" sur LinkedIn et Société.com avant tout téléchargement',isCorrect:true,feedback:'Parfait. La personnalisation OSINT n\'est pas une preuve d\'authenticité. Vérifiez le profil LinkedIn (ancienneté, connexions), l\'entreprise sur Société.com (SIRET, date de création). Un NDA avant entretien = signal d\'alarme.',points:10},{label:'Je télécharge le NDA uniquement, pas la fiche de poste — c\'est moins risqué',isCorrect:false,feedback:'Les deux fichiers peuvent être malveillants. Et le "NDA avant entretien" est lui-même anormal — aucun recruteur légitime ne demande un NDA avant même un appel téléphonique.',points:-5}], reflexe:'Les données OSINT publiques permettent des spear phishing très convaincants. NDA avant entretien téléphonique = signal d\'alarme.', redFlags:['Vos données LinkedIn sont publiques et utilisables pour le spear phishing','Un NDA avant entretien téléphonique est anormal','Les deux documents peuvent contenir des exploits zero-day'] },
      { category:'vishing-deepfake-video', title:'Appel vidéo Teams — votre RSSI en déplacement urgent', context:'10h30. Appel vidéo Teams de votre RSSI. Visage reconnaissable, voix normale.', visual:{type:'phone-call',from:'Pierre Dubois — RSSI',body:'[Appel vidéo Teams — Visage du RSSI, voix normale, arrière-plan hôtel]\n\n"Thomas, j\'ai besoin que tu crées un compte service temporaire avec droits admin sur notre AD. C\'est pour un audit en cours. Donne-moi les identifiants par message privé Teams maintenant — je suis en réunion dans 5 min."'}, choices:[{label:'J\'exécute — je vois mon RSSI en vidéo, sa voix, son arrière-plan. C\'est lui sans aucun doute.',isCorrect:false,feedback:'Les deepfakes vidéo en temps réel (Heygen, DeepFaceLive) permettent d\'usurper un visage pendant Teams ou Zoom. Et même si c\'était votre vrai RSSI, une demande de compte admin par message privé viole toutes les procédures SSI.',points:-5},{label:'Je confirme par téléphone sur son numéro habituel ET par email à son manager avant d\'agir',isCorrect:true,feedback:'Parfait. Double canal séparé. Et si votre vrai RSSI confirme, expliquez-lui que la procédure SSI doit être formalisée par écrit. Aucune demande de compte admin ne se fait par appel vidéo.',points:10},{label:'Je lui demande de prouver son identité en répondant à une question personnelle en direct',isCorrect:false,feedback:'Les informations personnelles sont disponibles via OSINT. Et un deepfake peut être guidé par une vraie personne qui connaît les réponses en temps réel.',points:-5}], reflexe:'Deepfake vidéo = techniquement réalisable. Toute demande admin doit suivre la procédure formelle écrite — quel que soit le canal.', redFlags:['Les deepfakes vidéo en temps réel sont techniquement réalisables','Demande admin par message privé = violation procédure SSI','Les questions personnelles peuvent être connues via OSINT'] },
      { category:'pretexting-audit', title:'Auditeur BDO avec lettre de mission de votre DG — accès ERP', context:'Vous gérez les accès SI. Un auditeur se présente à l\'accueil avec une lettre de mission.', visual:{type:'browser-popup',subject:'Demande d\'accès — Cabinet BDO',body:'Auditeur : Pierre Martin — BDO\nLettre de mission : signée par votre DG\n\nDemande : accès temporaire lecture seule à l\'ERP pour inventaire des actifs financiers.\n\n[Lettre à en-tête BDO, signature DG visible]'}, choices:[{label:'Je lui donne accès — lettre signée par notre DG, BDO est un cabinet reconnu, lecture seule seulement',isCorrect:false,feedback:'La lettre peut être falsifiée (les signatures des DG sont visibles sur des rapports publics). Un accès "lecture seule" ERP donne accès à des données financières, clients, fournisseurs — extrêmement sensibles.',points:-5},{label:'Je suspends et contacte la DG directement par téléphone pour confirmer la mission d\'audit BDO',isCorrect:true,feedback:'Parfait. Même avec une lettre apparemment authentique, la validation par contact direct avec la DG est obligatoire. Les accès ERP se créent après confirmation écrite, pas sur présentation physique d\'un document.',points:10},{label:'Je lui donne accès lecture seule uniquement — les risques d\'exfiltration de données sont limités',isCorrect:false,feedback:'La lecture seule ERP = données financières complètes, clients, fournisseurs, employés. Ces données sont très précieuses pour l\'espionnage industriel, la fraude ou la préparation d\'attaques.',points:-5}], reflexe:'Toute demande d\'accès SI avec documentation nécessite une confirmation indépendante de la DG. La lecture seule ERP = données très sensibles.', redFlags:['Les lettres de mission peuvent être falsifiées','La lecture seule ERP donne accès à des données financières très sensibles','Validation directe avec la DG obligatoire — pas via l\'intermédiaire'] },
      { category:'macro-advanced', title:'"Activer les macros" pour déchiffrer — demande de votre RSSI', context:'Document chiffré reçu par email de votre RSSI avec instructions d\'ouverture spécifiques.', visual:{type:'email',from:'RSSI — Pierre Dubois',fromEmail:'p.dubois@votre-entreprise.fr',subject:'Rapport confidentiel chiffré — Instructions d\'ouverture',body:'Thomas,\n\nRapport d\'audit confidentiel en version chiffrée. Pour le déchiffrer, active les macros quand Word te le propose — c\'est le mécanisme de déchiffrement interne.\n\nMot de passe : Audit2024!'}, choices:[{label:'J\'active les macros — mon RSSI lui-même me demande de le faire pour le déchiffrement',isCorrect:false,feedback:'Votre RSSI ne devrait JAMAIS demander d\'activer des macros pour "déchiffrer" un document. C\'est de l\'ingénierie sociale sophistiquée utilisant l\'autorité du RSSI. Son compte email peut être compromis.',points:-5},{label:'J\'appelle mon RSSI directement pour confirmer qu\'il a envoyé ce document et cette instruction',isCorrect:true,feedback:'Parfait. Même un email de votre RSSI peut être compromis. Et si votre vrai RSSI confirme cette méthode, expliquez-lui qu\'activer des macros pour "déchiffrer" n\'est pas une méthode sécurisée.',points:10},{label:'J\'active les macros dans un sandbox — le mécanisme de déchiffrement peut être légitime',isCorrect:false,feedback:'Les malwares modernes détectent les environnements sandbox et ne s\'exécutent pas (VM-aware). L\'analyse sandbox ne garantit pas la détection. Et activer des macros pour "déchiffrer" n\'est pas une méthode légitime.',points:-5}], reflexe:'Activer des macros pour "déchiffrer" = ingénierie sociale avancée. Même l\'email du RSSI peut être compromis.', redFlags:['Un RSSI ne demande JAMAIS d\'activer des macros pour le chiffrement','Le compte du RSSI peut être compromis','Les malwares modernes détectent et évitent les sandboxes'] },
      { category:'privilege-escalation', title:'Popup Windows — mot de passe administrateur de domaine requis', context:'Vous êtes développeur. Une notification Windows inattendue apparaît sur votre écran.', visual:{type:'browser-popup',subject:'Windows — Droits administrateur requis',body:'Vos droits d\'administrateur local temporaires ont expiré.\n\nPour continuer votre tâche, entrez le mot de passe administrateur de domaine :\n\n[Champ mot de passe]'}, choices:[{label:'J\'entre le mot de passe admin de domaine — j\'ai besoin de finir ma tâche de développement',isCorrect:false,feedback:'Windows ne demande jamais un "mot de passe administrateur de domaine" via une popup dans votre session utilisateur. Cette popup est un malware déjà présent qui collecte des identifiants d\'élévation.',points:-5},{label:'Je ferme la popup sans rien entrer et signale immédiatement à mon IT Security',isCorrect:true,feedback:'Parfait. Windows utilise UAC (User Account Control) pour les élévations — jamais une popup demandant le "mot de passe admin de domaine". Cette popup = malware actif sur votre machine. Isolation et signalement urgents.',points:10},{label:'J\'entre mon propre mot de passe utilisateur — pas le mot de passe admin, donc moins risqué',isCorrect:false,feedback:'Votre mot de passe utilisateur a de la valeur pour le mouvement latéral. Et cette popup peut accepter n\'importe quelle saisie et valider pour paraître légitime.',points:-5}], reflexe:'Windows UAC ne demande jamais de "mot de passe admin de domaine". Une telle popup = malware actif à signaler immédiatement.', redFlags:['Windows UAC n\'utilise pas ce format de demande','Un malware peut être présent depuis des semaines avant de se manifester','Votre MDP utilisateur a de la valeur pour le mouvement latéral'] },
      { category:'ransomware-response', title:'Fichiers .locked sur le partage réseau — 8h55 lundi matin', context:'Lundi 8h55. Des collègues rapportent des fichiers avec extensions ".locked". Vous êtes RSSI.', visual:{type:'browser-popup',subject:'Incident — Fichiers chiffrés sur partage réseau',body:'Rapports entrants :\n• Commercial : "Mes fichiers Word ont une extension .locked"\n• Comptabilité : "Le dossier partagé est inaccessible"\n• DSI : "Le serveur de fichiers affiche des erreurs"\n\nNote "README_DECRYPT.txt" visible sur plusieurs postes'}, choices:[{label:'Je demande aux utilisateurs de déconnecter leurs postes et d\'attendre mes instructions',isCorrect:false,feedback:'Les postes déconnectés cessent de chiffrer localement, mais les connexions réseau maintenues propagent l\'infection. L\'isolation doit être au niveau réseau (VLAN, firewall) — pas seulement les postes.',points:-5},{label:'J\'active le plan de réponse aux incidents : isolement réseau total, cellule de crise, communications hors-bande (téléphone)',isCorrect:true,feedback:'Correct. Isolation réseau immédiate. Cellule de crise activée. Communications via canaux hors-bande (téléphone, SMS) car l\'email peut être compromis. Préservation des preuves forensiques avant extinction des serveurs.',points:10},{label:'Je déconnecte immédiatement tous les serveurs pour stopper le chiffrement',isCorrect:false,feedback:'Déconnecter les serveurs peut détruire des preuves forensiques en mémoire (clés de chiffrement, processus actifs). Et l\'arrêt brutal peut corrompre des données encore récupérables.',points:-5}], reflexe:'Ransomware : isolation réseau > isolation postes. Email compromis = hors-bande. Preuves forensiques avant extinction des serveurs.', redFlags:['L\'isolation réseau stoppe la propagation — pas l\'isolation des postes seuls','L\'email d\'entreprise peut être compromis — utilisez des canaux hors-bande','Les serveurs contiennent des preuves forensiques précieuses en mémoire'] },
      { category:'social-physical', title:'Stagiaire avec badge périmé — urgence prod down', context:'Un jeune homme se présente à la réception avec un badge d\'accès périmé et une lettre de mission.', visual:{type:'browser-popup',subject:'Accueil — Demande d\'accès Datacenter',body:'Un jeune homme présente :\n• Badge périmé depuis 3 mois\n• Email d\'autorisation imprimé (signature DSI)\n• Urgence : "La prod est down, j\'ai besoin d\'accéder au rack immédiatement"\n• Air stressé et crédible'}, choices:[{label:'Je lui donne accès accompagné — je reste avec lui dans le datacenter pour surveiller',isCorrect:false,feedback:'Un badge périmé n\'autorise pas l\'accès même accompagné. L\'urgence ("prod down") est un vecteur classique de social engineering physique. L\'email peut être falsifié. Procédure d\'accès physique obligatoire.',points:-5},{label:'Je refuse l\'accès, appelle directement la DSI pour vérifier, et propose un accès temporaire officiel',isCorrect:true,feedback:'Parfait. Badge périmé = accès refusé sans exception. La DSI peut émettre un accès temporaire en 15 minutes. Si la prod est vraiment down, c\'est une urgence à escalader — pas à contourner.',points:10},{label:'Je vérifie l\'email d\'autorisation en appelant le numéro indiqué dans le document',isCorrect:false,feedback:'Le numéro dans le document peut être frauduleux. Appelez toujours la DSI sur le numéro habituel que vous connaissez — jamais un numéro trouvé dans un document présenté par l\'inconnu.',points:-5}], reflexe:'Badge périmé = refus sans exception. Appelez la DSI sur son numéro habituel, pas celui du document.', redFlags:['Badge périmé = règle stricte, aucune exception','L\'urgence "prod down" est un levier classique de social engineering physique','Appelez la DSI sur son numéro habituel — pas celui du document'] },
      { category:'oauth-malicious', title:'Extension Chrome GCalSync — autorisations Gmail et envoi d\'emails', context:'Vous installez une extension de synchro calendrier depuis le Chrome Web Store.', visual:{type:'browser-popup',subject:'Google — GCalSync demande des autorisations',body:'GCalSync demande l\'accès à :\n\n✓ Voir vos événements Google Calendar\n✓ Modifier vos événements et calendriers\n✓ Voir vos contacts\n✓ Lire vos emails Gmail\n✓ Envoyer des emails en votre nom\n\nCes autorisations sont requises pour la synchronisation complète.'}, choices:[{label:'J\'accepte — une app de calendrier peut avoir besoin de ces accès pour fonctionner correctement',isCorrect:false,feedback:'Une app de synchro calendrier n\'a besoin QUE du calendrier. "Lire vos emails" + "Envoyer des emails en votre nom" sont excessifs et permettent d\'espionner votre messagerie et d\'envoyer des emails phishing en votre nom.',points:-5},{label:'Je refuse les permissions emails (lire + envoyer) et cherche une app qui n\'en a pas besoin',isCorrect:true,feedback:'Parfait. Évaluez chaque permission individuellement. Une vraie app de calendrier n\'a besoin que du calendrier. Les permissions email permettent l\'espionnage et l\'envoi frauduleux depuis votre adresse.',points:10},{label:'J\'accepte mais révoque l\'accès après avoir configuré la synchro',isCorrect:false,feedback:'En quelques secondes d\'accès, l\'app peut copier tous vos emails et envoyer des emails depuis votre adresse. La révocation ne récupère pas les données déjà copiées.',points:-5}], reflexe:'Évaluez chaque permission OAuth individuellement. Les accès email permettent espionnage + envoi d\'emails en votre nom.', redFlags:['Une app calendrier n\'a pas besoin d\'accéder à vos emails','Envoyer des emails en votre nom = permission extrêmement dangereuse','La révocation après ne récupère pas les données déjà copiées'] },
      { category:'credential-stuffing-pro', title:'HaveIBeenPwned — votre email pro dans une fuite LinkedIn Business', context:'Alerte HaveIBeenPwned : votre email professionnel est dans une fuite de données récente.', visual:{type:'browser-popup',subject:'HaveIBeenPwned — Nouvelle fuite détectée',body:'Alerte pour : t.bernard@votre-entreprise.fr\n\nFuite : LinkedIn Business (03/2024)\n\nDonnées exposées :\n• Adresse email\n• Mot de passe (hashé bcrypt)\n• Numéro de téléphone\n• Entreprise et poste\n\nAction : changez votre mot de passe immédiatement.'}, choices:[{label:'Je change mon mot de passe LinkedIn uniquement — c\'est lui qui a fuité',isCorrect:false,feedback:'Si vous réutilisez ce mot de passe LinkedIn sur d\'autres services (email pro, VPN, SI d\'entreprise), tous ces comptes sont à risque. Le credential stuffing teste ce mot de passe sur des centaines de services automatiquement.',points:-5},{label:'Je change tous les comptes utilisant ce même mot de passe et active la 2FA sur chacun',isCorrect:true,feedback:'Parfait. Credential stuffing : un mot de passe exposé est testé automatiquement sur des centaines de services. Si vous utilisez le même MDP professionnel ailleurs, tous sont compromis. 2FA partout.',points:10},{label:'Je vérifie d\'abord si l\'alerte HaveIBeenPwned est légitime avant d\'agir',isCorrect:false,feedback:'HaveIBeenPwned est un service légitime créé par Troy Hunt. Mais si vous doutez, allez sur haveibeenpwned.com directement. N\'attendez pas — changez vos MDP pendant la vérification.',points:-5}], reflexe:'Un MDP exposé = credential stuffing sur tous vos comptes. Changez tous les comptes utilisant ce MDP + activez la 2FA.', redFlags:['Credential stuffing : un MDP testé automatiquement sur des centaines de sites','Si réutilisation du MDP : tous les comptes sont à risque','HaveIBeenPwned est légitime — Troy Hunt, référence reconnue'] },
      { category:'sim-swap-advanced', title:'Votre téléphone — SOS uniquement sans panne opérateur connue', context:'Matin. Votre téléphone affiche "SOS uniquement". Aucune panne opérateur signalée dans votre secteur.', visual:{type:'browser-popup',subject:'Téléphone — Pas de réseau',body:'Votre téléphone affiche "SOS uniquement"\n\nVotre opérateur (Free Mobile) n\'a signalé aucune panne dans votre secteur.\n\nVous ne recevez plus d\'appels ni de SMS.'}, choices:[{label:'Je redémarre mon téléphone — c\'est probablement un bug d\'opérateur passager',isCorrect:false,feedback:'Perte de réseau sans panne connue = signal d\'alerte SIM swap. Un attaquant a peut-être usurpé votre SIM. Pendant ce temps, tous vos SMS de validation 2FA vont vers l\'attaquant.',points:-5},{label:'J\'appelle immédiatement mon opérateur depuis un autre téléphone pour vérifier si une portabilité a été demandée',isCorrect:true,feedback:'Parfait. Perte de réseau inexpliquée = possible SIM swap actif. Appelez depuis un autre appareil (fixe, téléphone d\'un proche). Si une portabilité a été demandée, demandez la suspension immédiate et changez vos MDP bancaires.',points:10},{label:'Je vais en boutique opérateur — le service téléphonique n\'est pas efficace pour ce problème',isCorrect:false,feedback:'La boutique est pertinente, mais si un SIM swap est en cours, chaque minute permet à l\'attaquant de récupérer des codes 2FA bancaires. L\'appel depuis un autre appareil est plus rapide.',points:-5}], reflexe:'Perte de réseau inexpliquée = possible SIM swap actif. Appelez votre opérateur depuis un autre appareil immédiatement.', redFlags:['SOS uniquement sans panne opérateur = signal SIM swap','L\'attaquant reçoit vos SMS 2FA en temps réel','Chaque minute = codes 2FA bancaires récupérés par l\'attaquant'] },
      { category:'ai-phishing-llm', title:'Email ultra-personnalisé sur votre soumission SSTIC — sans une faute', context:'Vous avez 10 ans d\'expérience en cybersécurité et participez aux conférences du domaine.', visual:{type:'email',from:'Comité de programme SSTIC 2024',fromEmail:'programme@sstic-2024-submissions.fr',subject:'Votre soumission "Détection attaques LLM" acceptée',body:'Bonjour Thomas,\n\nVotre soumission "Détection des attaques LLM-based sur les systèmes industriels" a été acceptée pour présentation au SSTIC 2024.\n\nVeuillez confirmer votre participation et télécharger votre kit présentateur.'}, choices:[{label:'Je télécharge — j\'ai soumis un article sur ce sujet et la personnalisation est parfaite. Trop précis pour être aléatoire.',isCorrect:false,feedback:'Les LLMs peuvent générer des emails ultra-personnalisés à partir de vos publications, profil LinkedIn et activités publiques. "sstic-2024-submissions.fr" ≠ "sstic.org". La personnalisation IA n\'est plus une preuve d\'authenticité.',points:-5},{label:'Je vérifie sur sstic.org si mon article a bien été accepté avant de cliquer sur quoi que ce soit',isCorrect:true,feedback:'Parfait. Le vrai SSTIC communique via sstic.org. La personnalisation parfaite via LLM n\'est plus discriminante. Un expert cybersécurité est une cible de valeur — les attaquants investissent dans la personnalisation.',points:10},{label:'Je scanne le lien avec VirusTotal avant de télécharger — si propre, c\'est sûr',isCorrect:false,feedback:'Les zero-days et les malwares récents ne sont pas dans les bases VirusTotal. Les attaquants testent leurs charges AVANT de les déployer. VirusTotal = 60-80% de détection pour les malwares connus.',points:-5}], reflexe:'La personnalisation IA parfaite n\'est plus une preuve d\'authenticité. Vérifiez toujours sur le vrai site de l\'organisme.', redFlags:['Les LLMs permettent des emails ultra-personnalisés depuis vos données publiques','sstic-2024-submissions.fr ≠ sstic.org','VirusTotal ne détecte pas les zero-days — les attaquants le testent avant envoi'] },
      { category:'cloud-bucket', title:'Bucket S3 public avec sauvegardes SQL et clés API — pentest', context:'Vous faites un pentest autorisé. Vous découvrez un bucket S3 accessible publiquement.', visual:{type:'browser-popup',subject:'AWS — Bucket S3 public découvert',body:'Bucket : client-backups-2024 (public, accès en lecture)\n\nContenu visible :\n• Sauvegardes SQL (données clients)\n• Fichiers .env avec clés API AWS\n• Logs d\'accès applicatifs'}, choices:[{label:'Je télécharge les fichiers .env pour prouver l\'impact réel de la vulnérabilité au client',isCorrect:false,feedback:'Même dans un pentest autorisé, télécharger des données clients réelles dépasse généralement le scope légal. Documentez l\'existence et l\'accessibilité par screenshot — sans télécharger les données.',points:-5},{label:'Je documente par screenshot sans télécharger les données et alerte immédiatement le client pour fermeture urgente',isCorrect:true,feedback:'Parfait. Documentation (preuves sans extraction) + alerte urgente au client pour fermeture. Bucket S3 public avec sauvegardes SQL et .env = incident majeur. RGPD : notification obligatoire dans les 72h.',points:10},{label:'Je teste les clés API pour évaluer leur niveau d\'accès AWS réel',isCorrect:false,feedback:'Utiliser des clés API découvertes dépasse le scope standard d\'un pentest et peut constituer un accès non autorisé. Documentez leur existence sans les utiliser.',points:-5}], reflexe:'Pentest : documentation sans extraction de données réelles. Alerte urgente au client. RGPD : 72h pour notifier.', redFlags:['Télécharger des données clients dépasse le scope pentest standard','Utiliser des clés API découvertes = accès non autorisé potentiel','Bucket public + .env + SQL = notification RGPD 72h obligatoire'] },
      { category:'evilginx-aitm', title:'Page de reconnexion Teams — URL suspecte', context:'Votre accès Teams vous redirige vers une page de connexion. L\'URL dans la barre d\'adresse est inhabituelle.', visual:{type:'browser-popup',subject:'Teams — Reconnexion requise',body:'URL barre adresse : https://login.microsoftonline.com.teams-auth.net/...\n\n[Interface Microsoft Login parfaitement clonée]\nEmail : [pré-rempli avec votre adresse]\nMot de passe : [____]\n\nPuis demande du code Microsoft Authenticator...'}, choices:[{label:'Je me connecte — l\'interface est parfaite et mon email est pré-rempli, c\'est ma vraie session',isCorrect:false,feedback:'Evilginx est un framework AiTM qui proxifie la vraie connexion Microsoft en temps réel — d\'où l\'interface parfaite et votre email pré-rempli. Il capture votre token de session, contournant le 2FA. Le domaine réel est "teams-auth.net".',points:-5},{label:'Je lis l\'URL de droite à gauche : "teams-auth.net" est le vrai domaine — je ferme et signale',isCorrect:true,feedback:'Parfait. Lisez toujours l\'URL de droite à gauche depuis le TLD. "microsoftonline.com.teams-auth.net" : le domaine réel est "teams-auth.net". Interface parfaite + email pré-rempli ne valident pas l\'URL.',points:10},{label:'Je vérifie le certificat SSL — s\'il est émis pour microsoftonline.com, c\'est le vrai site',isCorrect:false,feedback:'Evilginx utilise des certificats Let\'s Encrypt valides pour le faux domaine. Le certificat sera émis pour "teams-auth.net", pas pour "microsoftonline.com". Vérification URL toujours prioritaire.',points:-5}], reflexe:'URL : lisez de droite à gauche depuis le TLD. Evilginx = interface parfaite + vraie 2FA = token capturé quand même.', redFlags:['microsoftonline.com.teams-auth.net : le vrai domaine est "teams-auth.net"','Evilginx capture le token post-2FA — interface parfaitement clonée','Le certificat SSL est émis pour le faux domaine, pas pour Microsoft'] },
      { category:'lateral-movement', title:'Alerte SIEM — connexion RDP depuis un poste comptable à 3h23', context:'Vous êtes analyste SOC. Alerte SIEM à 3h23 du matin.', visual:{type:'browser-popup',subject:'SIEM — Alerte Haute — Connexion RDP anormale',body:'Connexion RDP détectée :\nCompte : DOMAINE\\svc-sauvegarde (compte de service)\nSource IP : 10.12.45.87 (poste comptabilité)\nCible : SERVEUR-BACKUP-01\nHeure : 03h23:47\nTentatives préalables : 847'}, choices:[{label:'Je bloque l\'IP source et continue à surveiller — c\'est peut-être un admin qui fait une maintenance',isCorrect:false,feedback:'847 tentatives préalables = bruteforce automatisé réussi. Compte de service ouvrant une connexion RDP à 3h23 depuis un poste comptable = hautement anormal. C\'est probablement un mouvement latéral en cours.',points:-5},{label:'J\'isole immédiatement le serveur de sauvegarde et le poste source, puis escalade à l\'incident response',isCorrect:true,feedback:'Parfait. Indicateurs multiples : bruteforce (847 essais), compte de service anormal, heure de nuit, poste comptable. Isolation des deux machines + escalade IR. Le serveur de sauvegarde est une cible de choix pour les ransomwares.',points:10},{label:'J\'analyse les logs du serveur cible pour comprendre ce qui a été fait avant d\'agir',isCorrect:false,feedback:'Si un attaquant a accès au serveur, il peut modifier les logs en temps réel. Et l\'analyse pendant que l\'attaquant est actif lui donne le temps d\'établir de la persistance. Isolation d\'abord, analyse forensique ensuite.',points:-5}], reflexe:'Mouvement latéral : isolation d\'abord (les deux machines), analyse forensique ensuite sur des copies. Les logs peuvent être modifiés en temps réel.', redFlags:['847 tentatives = bruteforce automatisé réussi','Compte de service + RDP + 3h23 = mouvement latéral typique','Serveur de sauvegarde = cible prioritaire pour les ransomwares'] },
      { category:'linkedin-intel', title:'Demande LinkedIn d\'une RSSI BNP — grille tarifaire et liste clients', context:'LinkedIn. La RSSI de BNP Paribas vous contacte pour une opportunité commerciale.', visual:{type:'social-post',from:'Sophie Bernard — CISO @ BNP Paribas',body:'Bonjour Thomas,\n\nJe travaille sur notre cartographie des fournisseurs EDR. Votre expertise m\'intéresse.\n\nPouvez-vous me faire parvenir votre grille tarifaire et une liste de vos clients actuels dans le secteur bancaire ?'}, choices:[{label:'J\'envoie nos tarifs et une liste anonymisée de nos clients — c\'est une opportunité commerciale sérieuse',isCorrect:false,feedback:'Intelligence compétitive / espionnage industriel : votre liste de clients et tarifs permettent de cibler ces clients, vous sous-coter, ou préparer des attaques ciblées. Vérifiez l\'authenticité du profil d\'abord.',points:-5},{label:'Je vérifie l\'authenticité du profil (ancienneté, connexions BNP réels) et propose un appel officiel via les coordonnées BNP officielles',isCorrect:true,feedback:'Parfait. Ancienneté du profil, connexions avec de vrais employés BNP vérifiés, et cadre formel (appel via coordonnées officielles BNP). Les informations commerciales sensibles ne se partagent pas sur demande LinkedIn directe.',points:10},{label:'J\'envoie les tarifs publics seulement — ils sont déjà disponibles en ligne',isCorrect:false,feedback:'Vos tarifs publics sont déjà publics, mais cette approche peut servir à établir un contact pour demander ensuite plus. Vérifiez d\'abord l\'authenticité avant tout échange commercial, même limité.',points:-5}], reflexe:'Vérifiez l\'ancienneté du profil et les connexions avec de vrais employés. Les infos commerciales sensibles nécessitent un cadre formel.', redFlags:['Vérifiez l\'ancienneté du profil et les connexions avec de vrais employés BNP','Liste de clients = intelligence compétitive de grande valeur','Proposez un cadre formel avant tout échange sensible'] },
      { category:'script-malicious', title:'Collègue — script PowerShell à lancer avec votre compte admin', context:'Votre collègue dev vous demande de lancer un script PowerShell sur votre compte admin pour "éviter une demande DSI".', visual:{type:'email',from:'Pierre Legrand (Teams)',fromEmail:'',subject:'',body:'Salut, j\'ai écrit un script d\'automatisation pour les déploiements. Peux-tu le lancer avec ton compte admin ? Ça m\'évite de demander les droits à la DSI. 30 secondes !\n\nhttps://gist.github.com/pierre-legrand/deploy-auto.ps1'}, choices:[{label:'Je lance le script — Pierre est dans mon équipe, je lui fais confiance, et ça lui évite une demande DSI',isCorrect:false,feedback:'Lancer un script inconnu avec vos droits admin = code arbitraire exécuté sur votre SI avec vos privilèges. Même de bonne foi, Pierre peut avoir un compte compromis. Et contourner la DSI est une violation de politique.',points:-5},{label:'Je refuse et lui explique qu\'il doit passer par la procédure DSI pour les accès admin',isCorrect:true,feedback:'Parfait. Aucun script inconnu avec des droits admin — même d\'un collègue de confiance. La procédure DSI protège l\'entreprise ET Pierre. Si son compte est compromis, le script peut être malveillant à son insu.',points:10},{label:'Je lis le script PowerShell avant de le lancer — si le code est clair et propre, je l\'exécute',isCorrect:false,feedback:'Un script PowerShell peut télécharger et exécuter du code externe en phase 2, après une première lecture "propre". La lecture ne garantit pas qu\'un non-expert détecte toutes les charges malveillantes.',points:-5}], reflexe:'Script inconnu + droits admin = risque majeur. Même de bonne foi. Procédure DSI obligatoire pour les accès admin.', redFlags:['Un script PowerShell peut télécharger du code externe en phase 2','Le compte de Pierre peut être compromis à son insu','Contourner la DSI = violation de politique SI'] },
      { category:'api-key-github', title:'Clé API AWS dans un repo GitHub public depuis 47 minutes', context:'Vous faites de la veille sécurité. Vous trouvez un fichier .env committé dans un repo GitHub public d\'un collaborateur.', visual:{type:'browser-popup',subject:'GitHub — Repository public — .env committé',body:'github.com/jean-martin/project-config\n\nFichier : .env.prod (committé il y a 47 min)\n\nContenu visible :\nAWS_ACCESS_KEY_ID=AKIA...\nAWS_SECRET_ACCESS_KEY=...\nGOOGLE_API_KEY=...\nDATABASE_PASSWORD=...'}, choices:[{label:'Je préviens Jean-Martin par email pour qu\'il supprime le fichier avant que quelqu\'un le voie',isCorrect:false,feedback:'47 minutes = les clés ont probablement déjà été collectées par des scanners automatiques (Trufflehog, GitGuardian). La suppression du fichier ne suffit pas — Git conserve l\'historique des commits.',points:-5},{label:'J\'alerte Jean-Martin ET la sécurité pour rotation immédiate des clés — la suppression seule ne suffit pas',isCorrect:true,feedback:'Parfait. Git conserve l\'historique même après suppression. Les clés exposées doivent être RÉVOQUÉES et REMPLACÉES immédiatement. Supposez que les clés sont déjà compromises (47 min = scanners automatiques).',points:10},{label:'Je supprime moi-même le fichier via un PR pour aller plus vite que Jean-Martin',isCorrect:false,feedback:'Git conserve l\'historique dans tous les cas — "git filter-branch" est nécessaire mais ne résout pas la compromission. La rotation des clés est prioritaire sur la suppression du fichier.',points:-5}], reflexe:'Clés API exposées sur GitHub = rotation immédiate, pas suppression. Les scanners automatiques ont 47 minutes d\'avance.', redFlags:['Git conserve l\'historique — supprimer le fichier ne suffit pas','Des scanners automatiques indexent GitHub en continu (Trufflehog, GitGuardian)','47 minutes = clés probablement déjà collectées'] },
      { category:'prestataire-access', title:'Prestataire TechSoft — accès distant pour mise à jour vulnérabilité critique', context:'Un prestataire habituel appelle pour une mise à jour de sécurité d\'urgence sur votre serveur applicatif.', visual:{type:'phone-call',from:'Support TechSoft — 0800 123 456',body:'Bonjour, c\'est Kevin de TechSoft. Nous avons une mise à jour critique de sécurité pour votre instance — la vulnérabilité est activement exploitée. J\'ai besoin d\'un accès distant à votre serveur applicatif maintenant. Pouvez-vous m\'ouvrir un accès TeamViewer ?'}, choices:[{label:'J\'ouvre l\'accès — TechSoft est notre prestataire habituel et une vulnérabilité activement exploitée est urgente',isCorrect:false,feedback:'Vérifiez par un canal séparé que TechSoft a bien émis cette demande. Appelez votre contact habituel chez TechSoft sur le numéro que vous connaissez — pas le numéro de cet appel. Les accès distants non planifiés doivent toujours être vérifiés.',points:-5},{label:'Je rappelle mon contact habituel chez TechSoft sur son numéro connu pour vérifier avant tout accès',isCorrect:true,feedback:'Parfait. Même pour un prestataire habituel, les accès distants non planifiés se vérifient par canal indépendant. Si la vulnérabilité est réelle, TechSoft peut documenter et rappeler sur votre canal habituel.',points:10},{label:'Je donne l\'accès mais surveille l\'écran en temps réel via le partage TeamViewer',isCorrect:false,feedback:'La surveillance d\'écran ne protège pas des actions en arrière-plan (processus masqués, scripts hors de la vue). Et même un prestataire légitime dont le compte est compromis peut agir malicieusement.',points:-5}], reflexe:'Les accès distants non planifiés se vérifient toujours par canal séparé — même pour des prestataires habituels.', redFlags:['L\'urgence "vulnérabilité activement exploitée" est un levier de pression classique','Les accès distants non planifiés = vérification obligatoire','La surveillance d\'écran ne protège pas des actions en arrière-plan'] },
      { category:'phishing-spf-dkim', title:'Email qui passe tous les filtres SPF, DKIM, DMARC via Amazon SES', context:'Email reçu dans votre boîte pro qui a passé tous les contrôles de sécurité email. Aucun filtre ne l\'a marqué comme spam.', visual:{type:'email',from:'Support AWS',fromEmail:'no-reply@ses-smtp.amazonaws.com',subject:'Votre instance EC2 a été suspendue \u2014 Action requise',body:'Bonjour,\n\nUne activité anormale a été détectée sur votre instance EC2 (i-0abc123def). Votre compte AWS a été temporairement suspendu.\n\nPour rétablir l\'accès, vérifiez votre identité maintenant.\n\nAWS Security Team'}, choices:[{label:'Je clique \u2014 l\'email passe SPF, DKIM et DMARC, il vient vraiment d\'Amazon SES',isCorrect:false,feedback:'Un attaquant peut envoyer des emails légitimement via Amazon SES avec des adresses @ses-smtp.amazonaws.com valides et SPF/DKIM/DMARC corrects. Les filtres valident l\'infrastructure, pas l\'intention.',points:-5},{label:'Je vais directement sur aws.amazon.com et vérifie le statut de mon compte dans la console',isCorrect:true,feedback:'Parfait. SPF/DKIM/DMARC valides ne prouvent pas que l\'email est légitime. Les filtres valident l\'infrastructure d\'envoi \u2014 pas le contenu ou l\'intention de l\'expéditeur.',points:10},{label:'Je vérifie les headers email complets \u2014 si SPF, DKIM et DMARC passent tous, c\'est forcément Amazon',isCorrect:false,feedback:'Un attaquant a créé un compte Amazon SES légitime. SPF, DKIM et DMARC passent réellement car l\'email passe par Amazon SES \u2014 mais le lien redirige vers aws-account-restore.com, pas aws.amazon.com.',points:-5}], reflexe:'SPF/DKIM/DMARC valident l\'infrastructure d\'envoi \u2014 pas l\'intention. Amazon SES peut légitimement envoyer des emails phishing.', redFlags:['Amazon SES peut être utilisé pour du phishing avec tous les contrôles valides','SPF/DKIM/DMARC valident l\'infrastructure, pas l\'intention ou la destination du lien','Vérifiez toujours directement sur aws.amazon.com \u2014 jamais via un lien email'] },

    ],

  };

  app.post('/api/cyber/mtm-scenario', async (req, res) => {
    const { scenarioIndex = 0, level = 'debutant', usedIndices = [] } = req.body as { scenarioIndex: number; level?: string; usedIndices?: number[] };

    // 'maitrise' maps to expert bank
    const lvl = ['debutant', 'intermediaire', 'expert', 'maitrise'].includes(level) ? (level === 'maitrise' ? 'expert' : level) : 'debutant';
    const bank = MTM_BANK[lvl] || MTM_BANK['debutant'];

    // Sélection aléatoire en évitant les scénarios déjà vus
    const availableIndices = bank.map((_, i) => i).filter(i => !usedIndices.includes(i));
    const pickFrom = availableIndices.length > 0 ? availableIndices : bank.map((_, i) => i);
    const randomIdx = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const bankScenario = { ...bank[randomIdx], _bankIndex: randomIdx };

    // Prompt IA avec niveau adaptatif
    const levelDesc = lvl === 'debutant' ? 'débutant (arnaques courantes, signaux d\'alerte évidents)'
      : lvl === 'intermediaire' ? 'intermédiaire (phishing sophistiqué, ingénierie sociale, vishing professionnel)'
      : 'expert (CEO fraud, deepfake, supply chain, spear phishing ciblé)';

    const prompt = `Tu es un expert en cybersécurité. Génère un scénario de formation en français pour le niveau "${levelDesc}".
Scénario numéro ${scenarioIndex + 1}. Choisis un thème DIFFÉRENT de: phishing-banque, sms-colis.

RÈGLES ABSOLUES pour le JSON:
- Ne jamais mettre de retours à la ligne réels dans les valeurs — utilise \\n
- Toutes les guillemets dans les valeurs doivent être échappées avec \\
- Retourne UNIQUEMENT le JSON, sans texte avant ou après, sans balises markdown

Format requis:
{"category":"theme-court","title":"Titre max 5 mots","context":"Situation en 1 phrase","visual":{"type":"email","from":"Nom expéditeur","fromEmail":"adresse@domaine-suspect.com","subject":"Objet","body":"Corps du message avec \\n\\n entre paragraphes","hasClickableLink":true,"linkLabel":"Texte du lien","linkUrl":"https://domaine-suspect.com/path"},"choices":[{"label":"Choix piège","isCorrect":false,"feedback":"Conséquence réaliste","points":-5},{"label":"Bon choix","isCorrect":true,"feedback":"Explication positive","points":10},{"label":"Choix médiocre","isCorrect":false,"feedback":"Pourquoi c'est insuffisant","points":-5}],"reflexe":"Règle de sécurité à retenir en 1 phrase.","clickConsequence":"Ce qui se passe si on clique","redFlags":["Signal 1","Signal 2","Signal 3"]}

Niveau ${levelDesc}. Contexte français réaliste. Pour visual.type utilise: email, sms, phone-call, browser-popup, ou social-post.`;

    try {
      const response = await openAIService.getChatCompletion(
        [{ role: 'user', content: prompt }],
        { maxTokens: 1200, responseFormat: 'json_object' }
      );

      const parseJsonSafely = (str: string) => {
        try { return JSON.parse(str); } catch {}
        const mdMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (mdMatch) { try { return JSON.parse(mdMatch[1].trim()); } catch {} }
        const objMatch = str.match(/\{[\s\S]*\}/);
        if (objMatch) {
          let raw = objMatch[0];
          try { return JSON.parse(raw); } catch {}
          let cleaned = ''; let inString = false; let escape = false;
          for (let i = 0; i < raw.length; i++) {
            const c = raw[i];
            if (escape) { cleaned += c; escape = false; continue; }
            if (c === '\\') { escape = true; cleaned += c; continue; }
            if (c === '"') { inString = !inString; cleaned += c; continue; }
            if (inString && (c === '\n' || c === '\r')) { cleaned += '\\n'; continue; }
            if (inString && c === '\t') { cleaned += '\\t'; continue; }
            cleaned += c;
          }
          try { return JSON.parse(cleaned); } catch {}
        }
        return null;
      };

      const scenario = parseJsonSafely(response);
      if (!scenario) {
        console.error('[MTM] JSON parse failed. Using bank fallback for level:', lvl);
        return res.json({ success: true, scenario: bankScenario, source: 'bank' });
      }
      res.json({ success: true, scenario });
    } catch (error) {
      console.error('MTM scenario error:', error);
      res.json({ success: true, scenario: bankScenario, source: 'bank' });
    }
  });

  // =========================================================
  // STUDIO DE FORMATION — Routes IA & Documents
  // =========================================================

  /**
   * parseTrainingJson — Parseur JSON robuste pour les réponses Gemini/IA.
   * Gère : markdown code blocks, retours à la ligne non-échappés, texte parasite.
   * Retourne le training extrait ou null.
   */
  const parseTrainingJson = (text: string): Record<string, any> | null => {
    const attempts: string[] = [];

    // 1. Nettoyer les blocs markdown ```json...``` ou ```...```
    let cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    attempts.push(cleaned);
    attempts.push(text.trim());

    // 2. Extraire le premier objet JSON complet avec regex greedy
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) attempts.push(jsonMatch[0]);

    // 3. Si dans un code block, extraire le contenu entre ``` ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) attempts.push(codeBlockMatch[1].trim());

    for (const candidate of attempts) {
      // Tentative directe
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}

      // Nettoyer les retours à la ligne non-échappés dans les valeurs de string
      try {
        const fixed = candidate
          .replace(/:\s*"((?:[^"\\]|\\.)*)"/gs, (_m: string, val: string) => {
            const escaped = val.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            return `: "${escaped}"`;
          });
        const parsed = JSON.parse(fixed);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}

      // Remplacer tous les retours à la ligne bruts dans les chaînes
      try {
        const fixed2 = candidate.replace(/[\n\r]+(?=[^"]*(?:"[^"]*"[^"]*)*"[^"]*$)/g, ' ');
        const parsed = JSON.parse(fixed2);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }

    return null;
  };

  /**
   * buildTrainingFallback — Construit une formation de secours si le parsing échoue.
   * Assure que le frontend reçoit TOUJOURS une structure valide.
   */
  const buildTrainingFallback = (topic: string): Record<string, any> => ({
    title: `Formation : ${topic.slice(0, 50)}`,
    tagline: 'Formation générée par l\'IA FYNE',
    objectives: [
      'Comprendre les concepts fondamentaux du sujet',
      'Appliquer les bonnes pratiques dans son contexte professionnel',
      'Identifier et éviter les erreurs courantes',
    ],
    modules: [
      { title: 'Introduction et contexte', duration: '10 min', type: 'Mise en situation' },
      { title: 'Concepts clés', duration: '15 min', type: 'Contenu interactif' },
      { title: 'Mise en pratique', duration: '12 min', type: 'Scénario pratique' },
      { title: 'Évaluation', duration: '8 min', type: 'QCM final' },
    ],
    scenario: {
      situation: `Vous êtes confronté(e) à une situation professionnelle liée à : ${topic}. Que faites-vous ?`,
      choices: [
        { text: 'Ignorer la situation et continuer', correct: false, feedback: 'Cette approche peut mener à des problèmes importants.' },
        { text: 'Analyser la situation et appliquer les bonnes pratiques', correct: true, feedback: 'Excellent réflexe ! C\'est la bonne approche.' },
        { text: 'Déléguer sans analyser', correct: false, feedback: 'Il est important de comprendre la situation avant de déléguer.' },
      ],
    },
    qcm: [
      {
        question: `Quelle est la meilleure pratique concernant : ${topic} ?`,
        options: [
          { text: 'Ignorer le sujet', correct: false },
          { text: 'Appliquer les bonnes pratiques reconnues', correct: true },
          { text: 'Improviser selon les situations', correct: false },
          { text: 'Attendre des instructions', correct: false },
        ],
        explanation: 'Les bonnes pratiques sont essentielles pour éviter les erreurs et maximiser l\'efficacité.',
      },
    ],
    gamification: { points: 500, badge: '🏆', levels: ['Novice', 'Intermédiaire', 'Expert'] },
  });

  // GET /api/studio/training/:id — Récupère une formation sauvegardée (interne ou client via player)
  app.get("/api/studio/training/:id", async (req: Request, res: Response) => {
    try {
      const training = await storage.getGeneratedTraining(req.params.id);
      if (!training) return res.status(404).json({ error: 'Formation introuvable' });
      res.json(training);
    } catch (error) {
      console.error('[Studio] Erreur récupération formation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // GET /api/studio/trainings — Liste des formations (scope: internal par défaut, ou ?scope=cyber)
  app.get("/api/studio/trainings", async (req: Request, res: Response) => {
    try {
      const scope = typeof req.query.scope === 'string' ? req.query.scope : 'internal';
      const user = (req.session as any).user;
      const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
      const trainings = await storage.listGeneratedTrainings(100, scope, !isAdmin);
      res.json(trainings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // PATCH /api/studio/training/:id/publish — Toggle publication
  app.patch("/api/studio/training/:id/publish", async (req: Request, res: Response) => {
    try {
      const user = (req.session as any).user;
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      const { published } = req.body;
      if (typeof published !== 'boolean') return res.status(400).json({ error: 'published doit être boolean' });
      const updated = await storage.publishGeneratedTraining(req.params.id, published);
      if (!updated) return res.status(404).json({ error: 'Formation introuvable' });
      res.json(updated);
    } catch (error) {
      console.error('[Studio] Erreur publication formation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // DELETE /api/studio/training/:id — Supprime une formation (tous scopes)
  app.delete("/api/studio/training/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteGeneratedTraining(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('[Studio] Erreur suppression formation:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  });

  // PUT /api/studio/training/:id — Sauvegarde les modifications de l'éditeur
  app.put("/api/studio/training/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, tagline, content } = req.body;
      if (!content && !title && !tagline) return res.status(400).json({ error: 'Aucune modification fournie' });
      const updated = await storage.updateGeneratedTraining(id, {
        ...(title !== undefined && { title }),
        ...(tagline !== undefined && { tagline }),
        ...(content !== undefined && { content }),
      });
      if (!updated) return res.status(404).json({ error: 'Formation introuvable' });
      return res.json({ success: true, training: updated });
    } catch (error) {
      console.error('[Studio] Erreur mise à jour formation:', error);
      return res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
    }
  });

  // GET /api/studio/training/:id/export/json
  app.get("/api/studio/training/:id/export/json", async (req: Request, res: Response) => {
    try {
      const training = await storage.getGeneratedTraining(req.params.id);
      if (!training) return res.status(404).json({ error: 'Formation introuvable' });
      const filename = `${(training.title || 'formation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.json({ id: training.id, title: training.title, tagline: training.tagline, exportedAt: new Date().toISOString(), content: training.content });
    } catch (err) {
      res.status(500).json({ error: 'Erreur export JSON' });
    }
  });

  // GET /api/studio/training/:id/export/pdf
  app.get("/api/studio/training/:id/export/pdf", async (req: Request, res: Response) => {
    try {
      const training = await storage.getGeneratedTraining(req.params.id);
      if (!training) return res.status(404).json({ error: 'Formation introuvable' });
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const filename = `${(training.title || 'formation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);
      const content: any = training.content || {};
      const BLUE = '#006a9e';
      const DARK = '#061019';
      // Titre
      doc.fontSize(24).fillColor(BLUE).font('Helvetica-Bold').text(training.title || 'Formation', { align: 'center' });
      doc.moveDown(0.4);
      if (training.tagline) doc.fontSize(13).fillColor('#555').font('Helvetica').text(training.tagline, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
      doc.moveDown(0.8);
      // Objectifs
      if (content.objectives?.length) {
        doc.fontSize(13).fillColor(BLUE).font('Helvetica-Bold').text('Objectifs pédagogiques');
        doc.moveDown(0.3);
        content.objectives.forEach((obj: string) => {
          doc.fontSize(11).fillColor(DARK).font('Helvetica').text(`• ${obj}`, { indent: 12 });
        });
        doc.moveDown(0.8);
      }
      // Modules
      if (content.modules?.length) {
        doc.fontSize(13).fillColor(BLUE).font('Helvetica-Bold').text('Modules');
        doc.moveDown(0.3);
        content.modules.forEach((m: any, i: number) => {
          doc.fontSize(11).fillColor(DARK).font('Helvetica-Bold').text(`${String(i+1).padStart(2,'0')}. ${m.title}`, { continued: true });
          doc.font('Helvetica').fillColor('#888').text(`  ${m.duration || ''}`, { align: 'right' });
        });
        doc.moveDown(0.8);
      }
      // Situations
      if (content.situations?.length) {
        doc.addPage();
        doc.fontSize(16).fillColor(BLUE).font('Helvetica-Bold').text('Mises en situation');
        doc.moveDown(0.6);
        content.situations.forEach((s: any, i: number) => {
          if (doc.y > 700) doc.addPage();
          doc.fontSize(12).fillColor(BLUE).font('Helvetica-Bold').text(`Situation ${i+1} — ${s.title || ''}`);
          doc.moveDown(0.2);
          if (s.category) doc.fontSize(9).fillColor('#888').font('Helvetica').text(s.category.toUpperCase());
          doc.moveDown(0.2);
          if (s.contexte) { doc.fontSize(10).fillColor('#444').font('Helvetica-Oblique').text(s.contexte); doc.moveDown(0.2); }
          if (s.situation) { doc.fontSize(11).fillColor(DARK).font('Helvetica').text(s.situation); doc.moveDown(0.2); }
          if (s.attendu) {
            doc.fontSize(10).fillColor('#059669').font('Helvetica-Bold').text('Réponse attendue :');
            doc.fontSize(10).fillColor('#444').font('Helvetica').text(s.attendu);
          }
          doc.moveDown(0.8);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
          doc.moveDown(0.6);
        });
      }
      // QCM
      if (content.qcm?.length) {
        doc.addPage();
        doc.fontSize(16).fillColor(BLUE).font('Helvetica-Bold').text('QCM — Questions');
        doc.moveDown(0.6);
        content.qcm.forEach((q: any, i: number) => {
          if (doc.y > 680) doc.addPage();
          doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold').text(`Q${i+1}. ${q.question || ''}`);
          doc.moveDown(0.2);
          (q.options || q.choix || []).forEach((opt: any, oi: number) => {
            const text = typeof opt === 'string' ? opt : opt.text || opt;
            const isCorrect = typeof opt === 'object' ? opt.correct : oi === q.bonneReponse;
            doc.fontSize(10).fillColor(isCorrect ? '#059669' : '#555').font(isCorrect ? 'Helvetica-Bold' : 'Helvetica')
              .text(`${'ABCD'[oi]}. ${text}`, { indent: 16 });
          });
          if (q.explanation || q.explication) {
            doc.moveDown(0.2);
            doc.fontSize(9).fillColor('#888').font('Helvetica-Oblique').text(`→ ${q.explanation || q.explication}`, { indent: 16 });
          }
          doc.moveDown(0.6);
        });
      }
      doc.end();
    } catch (err) {
      console.error('[Export PDF]', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erreur export PDF' });
    }
  });

  // GET /api/studio/training/:id/export/scorm
  app.get("/api/studio/training/:id/export/scorm", async (req: Request, res: Response) => {
    try {
      const training = await storage.getGeneratedTraining(req.params.id);
      if (!training) return res.status(404).json({ error: 'Formation introuvable' });
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const content: any = training.content || {};
      const title = training.title || 'Formation';
      const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      // imsmanifest.xml
      const situations: any[] = content.situations || [];
      const qcm: any[] = content.qcm || [];
      const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="fyne_${safeName}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${title}</title>
      <item identifier="item1" identifierref="res1" isvisible="true">
        <title>${title}</title>
        <adlcp:masteryscore>70</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>`;

      // scorm_api.js — wrapper SCORM 1.2 conforme
      const scormJs = `(function(){
  var API=null;
  var startTime=new Date();
  function findAPI(w){
    var attempts=0;
    while(w){
      try{if(w.API)return w.API;}catch(e){}
      try{if(w.opener&&w.opener!==w&&attempts<5){var a=findAPI(w.opener);if(a)return a;}}catch(e){}
      try{if(w.parent&&w.parent!==w){w=w.parent;attempts++;}else break;}catch(e){break;}
    }
    return null;
  }
  function formatTime(ms){
    var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec+'.00';
  }
  API=findAPI(window);
  window.SCORM={
    init:function(){
      try{
        if(API){
          API.LMSInitialize('');
          API.LMSSetValue('cmi.core.lesson_status','incomplete');
          API.LMSCommit('');
        }
      }catch(e){}
    },
    finish:function(score){
      try{
        if(API){
          var elapsed=formatTime(new Date()-startTime);
          API.LMSSetValue('cmi.core.score.raw',String(Math.round(score||0)));
          API.LMSSetValue('cmi.core.score.min','0');
          API.LMSSetValue('cmi.core.score.max','100');
          API.LMSSetValue('cmi.core.lesson_status',score>=70?'passed':'failed');
          API.LMSSetValue('cmi.core.session_time',elapsed);
          API.LMSCommit('');
          API.LMSFinish('');
        }
      }catch(e){}
    },
    suspend:function(){
      try{
        if(API){
          var elapsed=formatTime(new Date()-startTime);
          API.LMSSetValue('cmi.core.session_time',elapsed);
          API.LMSSetValue('cmi.core.lesson_status','incomplete');
          API.LMSCommit('');
          API.LMSFinish('');
        }
      }catch(e){}
    }
  };
  window.addEventListener('load',function(){SCORM.init();});
  window.addEventListener('beforeunload',function(){
    if(window._scormFinished)return;
    SCORM.suspend();
  });
})();`;

      // index.html — contenu complet de la formation
      const objectivesHtml = (content.objectives || []).map((o: string) => `<li class="li">${o}</li>`).join('');
      const modulesHtml = (content.modules || []).map((m: any, i: number) => `<div class="module"><span class="num">${String(i+1).padStart(2,'0')}</span><span class="title">${m.title}</span><span class="dur">${m.duration||''}</span></div>`).join('');
      const situationsHtml = situations.map((s: any, i: number) => `
        <div class="situation">
          <div class="sit-header"><span class="sit-cat">${s.category||'Situation'}</span><h3>${s.title||''}</h3></div>
          ${s.contexte?`<p class="contexte">${s.contexte}</p>`:''}
          <p class="scenario">${s.situation||''}</p>
          <details><summary>Voir la réponse attendue</summary><p class="attendu">${s.attendu||''}</p></details>
        </div>`).join('');
      let qcmIdx = 0;
      const qcmHtml = qcm.map((q: any, i: number) => {
        const opts = (q.options || q.choix || []).map((opt: any, oi: number) => {
          const text = typeof opt === 'string' ? opt : opt.text || opt;
          const isCorrect = typeof opt === 'object' ? opt.correct : oi === q.bonneReponse;
          return `<button class="opt" data-correct="${isCorrect}" onclick="answer(this,${i})">${'ABCD'[oi]}. ${text}</button>`;
        }).join('');
        return `<div class="qcm-q" id="q${i}"><p class="question">${i+1}. ${q.question||''}</p><div class="opts">${opts}</div><p class="expl" id="expl${i}" style="display:none">${q.explanation||q.explication||''}</p></div>`;
      }).join('');

      const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<script src="scorm_api.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8fafc;color:#0d1117;min-height:100vh}
.header{background:#006a9e;color:white;padding:32px 48px}
.header h1{font-size:28px;font-weight:800;margin-bottom:6px}
.header p{font-size:14px;opacity:.8}
.section{padding:32px 48px;border-bottom:1px solid #e5e7eb}
h2{font-size:16px;font-weight:700;color:#006a9e;letter-spacing:.05em;text-transform:uppercase;margin-bottom:16px}
ul{padding-left:20px}.li{margin-bottom:6px;font-size:14px;line-height:1.6}
.module{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9}
.num{font-family:monospace;font-size:11px;color:#006a9e;font-weight:700;width:24px}
.title{flex:1;font-size:14px;font-weight:500}.dur{font-size:12px;color:#9ca3af;font-family:monospace}
.situation{padding:20px;background:white;border-left:3px solid #006a9e;margin-bottom:16px}
.sit-header{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.sit-cat{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#006a9e;background:rgba(0,106,158,.1);padding:2px 8px}
h3{font-size:15px;font-weight:700}
.contexte{font-size:12px;color:#6b7280;font-style:italic;margin-bottom:10px}
.scenario{font-size:14px;line-height:1.7;margin-bottom:10px}
.attendu{font-size:13px;color:#059669;line-height:1.6;padding:10px 14px;background:rgba(5,150,105,.06);margin-top:8px}
details summary{cursor:pointer;font-size:12px;font-weight:700;color:#006a9e;padding:6px 0}
.qcm-q{padding:20px;background:white;margin-bottom:12px;border-left:3px solid #dd0061}
.question{font-size:15px;font-weight:700;margin-bottom:12px}
.opts{display:flex;flex-direction:column;gap:7px}
.opt{padding:11px 16px;border:1.5px solid #e5e7eb;background:white;text-align:left;cursor:pointer;font-size:13px;transition:all .15s}
.opt:hover{border-color:#006a9e;background:rgba(0,106,158,.04)}
.opt.correct{border-color:#059669;background:rgba(5,150,105,.08);color:#059669;font-weight:600}
.opt.wrong{border-color:#dc2626;background:rgba(220,38,38,.06);color:#dc2626}
.expl{font-size:12px;color:#6b7280;font-style:italic;padding:8px 12px;background:#f9fafb;margin-top:8px;border-left:2px solid #e5e7eb}
.score-bar{padding:32px 48px;text-align:center;display:none}
.score-circle{display:inline-flex;align-items:center;justify-content:center;width:100px;height:100px;border-radius:50%;border:4px solid #006a9e;font-size:28px;font-weight:900;color:#006a9e;margin-bottom:16px}
.btn{padding:12px 28px;background:#006a9e;color:white;border:none;cursor:pointer;font-size:14px;font-weight:700;margin-top:12px}
</style>
</head>
<body>
<div class="header"><h1>${title}</h1>${training.tagline?`<p>${training.tagline}</p>`:''}</div>
${objectivesHtml?`<div class="section"><h2>Objectifs</h2><ul>${objectivesHtml}</ul></div>`:''}
${modulesHtml?`<div class="section"><h2>Modules</h2>${modulesHtml}</div>`:''}
${situationsHtml?`<div class="section"><h2>Mises en situation</h2>${situationsHtml}</div>`:''}
${qcmHtml?`<div class="section" id="qcm-section"><h2>QCM</h2>${qcmHtml}<button class="btn" onclick="submitQcm()" style="margin-top:16px">Valider mes réponses</button></div>`:''}
<div class="score-bar" id="score-bar"><div class="score-circle" id="score-val">—</div><p id="score-msg"></p><button class="btn" onclick="window.close()">Terminer</button></div>
<script>
var answers={},total=${qcm.length};
function answer(btn,qi){
  if(answers[qi]!==undefined)return;
  answers[qi]=btn.getAttribute('data-correct')==='true';
  var btns=btn.parentNode.querySelectorAll('.opt');
  btns.forEach(function(b){b.disabled=true;b.classList.add(b.getAttribute('data-correct')==='true'?'correct':'wrong');});
  var expl=document.getElementById('expl'+qi);if(expl)expl.style.display='block';
}
function submitQcm(){
  var correct=Object.values(answers).filter(Boolean).length;
  var pct=total?Math.round(correct/total*100):100;
  document.getElementById('qcm-section').style.display='none';
  var sb=document.getElementById('score-bar');sb.style.display='block';
  document.getElementById('score-val').textContent=pct+'%';
  document.getElementById('score-msg').textContent=correct+' bonne'+(correct>1?'s':'')+' réponse'+(correct>1?'s':'')+' sur '+total;
  window._scormFinished=true;
  SCORM.finish(pct);
}
</script>
</body>
</html>`;

      zip.file('imsmanifest.xml', manifest);
      zip.file('scorm_api.js', scormJs);
      zip.file('index.html', indexHtml);
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_scorm.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.send(zipBuffer);
    } catch (err) {
      console.error('[Export SCORM]', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erreur export SCORM' });
    }
  });

  // POST /api/studio/improve-slide — Enrichit un slide ciblé avec l'IA (~300 tokens)
  app.post("/api/studio/improve-slide", async (req: Request, res: Response) => {
    try {
      const { slide, lessonTitle, instruction } = req.body;
      if (!slide || !slide.type) return res.status(400).json({ error: 'Slide manquant' });

      const typeInstructions: Record<string, string> = {
        theorie: 'Enrichis le contenu (2-3 phrases supplémentaires), améliore les points clés, rends l\'exemple plus concret.',
        pratique: 'Rends le contexte plus réaliste et immersif, enrichis la réponse avec plus de bonnes pratiques.',
        'fill-blank': 'Améliore la phrase à trous pour qu\'elle soit plus pédagogique et mémorable.',
        'vrai-faux': 'Améliore les explications des affirmations pour qu\'elles soient plus claires et instructives.',
        intro: 'Rends l\'accroche plus percutante et les objectifs plus précis.',
        conclusion: 'Rends les points à retenir plus impactants et le message final plus motivant.',
      };

      const prompt = `Formation: "${lessonTitle || 'Formation'}". Type de slide: ${slide.type}.
${instruction ? `Instruction spécifique: ${instruction}` : typeInstructions[slide.type] || 'Améliore ce slide.'}

Slide actuel:
${JSON.stringify(slide, null, 2)}

Réponds UNIQUEMENT avec le slide amélioré en JSON valide, même structure, sans markdown.`;

      const raw = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.7, 1200);

      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start === -1 || end === -1) return res.status(500).json({ error: 'Réponse IA invalide' });
      const improved = JSON.parse(clean.slice(start, end + 1));
      return res.json({ slide: { ...improved, id: slide.id, type: slide.type } });
    } catch (error) {
      console.error('[Studio] Erreur amélioration slide:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'amélioration' });
    }
  });

  // DELETE /api/studio/trainings/all — Vide toute la bibliothèque (admin)
  app.delete("/api/studio/trainings/all", async (req: Request, res: Response) => {
    try {
      const { db } = await import('./db');
      const { generatedTrainings } = await import('../shared/schema');
      await db.delete(generatedTrainings);
      res.json({ success: true, message: 'Bibliothèque vidée' });
    } catch (error) {
      console.error('[Studio] Erreur vidage bibliothèque:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // POST /api/studio/evaluate-response — Évalue une réponse libre via l'IA
  app.post("/api/studio/evaluate-response", async (req: Request, res: Response) => {
    try {
      const { situation, contexte, attendu, reponse } = req.body;
      if (!situation || !attendu || !reponse) {
        return res.status(400).json({ error: 'Paramètres manquants' });
      }
      const prompt = `Tu es un formateur expert. Évalue la réponse d'un participant à une mise en situation professionnelle.

CONTEXTE : ${contexte || ''}
MISE EN SITUATION : ${situation}
RÉPONSE ATTENDUE (référentiel) : ${attendu}
RÉPONSE DU PARTICIPANT : ${reponse}

Évalue la réponse et réponds UNIQUEMENT avec ce JSON valide (sans markdown) :
{
  "score": <entier entre 0 et 100>,
  "appreciation": "<Excellent|Bien|Insuffisant>",
  "feedback": "<Retour personnalisé et bienveillant sur la réponse — 2-3 phrases>",
  "pointsForts": ["<point fort 1>", "<point fort 2>"],
  "pointsAmelioration": ["<point à améliorer 1>", "<point à améliorer 2>"],
  "reponseExperte": "<Reformulation de la réponse idéale en 2-3 phrases claires et actionnables>"
}`;

      const response = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.4, 1000);

      const parseJsonSafely = (str: string) => {
        try {
          const clean = str.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const start = clean.indexOf('{');
          const end = clean.lastIndexOf('}');
          if (start === -1 || end === -1) return null;
          const fixed = clean.slice(start, end + 1).replace(/[\r\n]+/g, ' ');
          return JSON.parse(fixed);
        } catch { return null; }
      };

      const parsed = parseJsonSafely(response);
      if (!parsed) {
        return res.json({
          score: 50,
          appreciation: 'Bien',
          feedback: 'Votre réponse montre une bonne compréhension du sujet.',
          pointsForts: ['Réponse structurée'],
          pointsAmelioration: ['Préciser davantage les actions concrètes'],
          reponseExperte: attendu,
        });
      }
      res.json(parsed);
    } catch (error) {
      console.error('[Studio] Erreur évaluation:', error);
      res.status(500).json({ error: 'Erreur lors de l\'évaluation' });
    }
  });

  // ─── Prompt partagé pour la structure de formation complète ────────────────
  const TRAINING_JSON_SCHEMA = `{
  "title": "Titre accrocheur et précis de la formation",
  "tagline": "Sous-titre engageant en moins de 12 mots",
  "objectives": [
    "Identifier et comprendre [concept clé 1] dans son contexte professionnel",
    "Appliquer [bonne pratique] face à des situations concrètes",
    "Éviter les 3 erreurs les plus courantes liées à [sujet]",
    "Reconnaître [signal d'alerte ou opportunité] et réagir correctement",
    "Développer des réflexes durables et actionnables"
  ],
  "modules": [
    { "title": "Titre du module 1 — Introduction au sujet", "duration": "8 min", "type": "Mise en contexte" },
    { "title": "Titre du module 2 — Mises en situation", "duration": "20 min", "type": "Mises en situation professionnelles" },
    { "title": "Titre du module 3 — Cas pratiques avancés", "duration": "15 min", "type": "Situations complexes" },
    { "title": "Titre du module 4 — Évaluation des connaissances", "duration": "15 min", "type": "QCM immersif" },
    { "title": "Bilan et réflexes à emporter", "duration": "5 min", "type": "Synthèse finale" }
  ],
  "situations": [
    {
      "id": 1,
      "category": "Catégorie thématique — aspect fondamental",
      "title": "Titre court et accrocheur de la situation 1",
      "contexte": "Fait clé, règle ou statistique réelle liée au sujet (1-2 phrases)",
      "situation": "Prénom + fonction du personnage. Situation professionnelle concrète et immersive en 4-5 phrases : lieu, moment, contexte précis, problème à résoudre ou décision à prendre. Les enjeux professionnels et humains sont clairement posés.",
      "attendu": "Réponse idéale structurée : 3-5 points clés que le participant doit mentionner. Ex : '1. Identifier le risque X. 2. Alerter le responsable Y. 3. Appliquer la procédure Z. 4. Documenter l'incident. 5. Ne pas agir seul.'"
    },
    {
      "id": 2,
      "category": "Catégorie thématique — aspect différent de la situation 1",
      "title": "Titre court de la situation 2",
      "contexte": "Contexte factuel différent — règle, chiffre ou contrainte spécifique (1-2 phrases)",
      "situation": "Nouveau personnage (prénom + fonction différente). Nouvelle situation professionnelle réaliste couvrant un autre angle du sujet — contexte, enjeux, décision clairement présentés en 4-5 phrases.",
      "attendu": "Points clés attendus pour la situation 2 : liste des éléments essentiels de la bonne réponse professionnelle"
    },
    {
      "id": 3,
      "category": "Catégorie thématique — situation ambiguë ou contre-intuitive",
      "title": "Titre court de la situation 3",
      "contexte": "Contexte de la situation 3 — fait précis ou règle moins connue (1-2 phrases)",
      "situation": "Troisième personnage dans une situation plus complexe ou nuancée. Couvre un aspect subtil du sujet où la bonne réponse est contre-intuitive. 4-5 phrases détaillées.",
      "attendu": "Points clés attendus pour la situation 3 : éléments contre-intuitifs à identifier, approche correcte à adopter"
    },
    {
      "id": 4,
      "category": "Catégorie thématique — situation sous pression ou urgence",
      "title": "Titre court de la situation 4",
      "contexte": "Contexte d'urgence ou de pression hiérarchique — contrainte temporelle ou décisionnelle (1-2 phrases)",
      "situation": "Situation 4 avec contrainte temporelle ou pression hiérarchique. Le personnage doit agir vite sans compromettre les bonnes pratiques. 4-5 phrases réalistes.",
      "attendu": "Points clés attendus pour la situation 4 : gestion de la pression, priorités correctes, comportement professionnel"
    },
    {
      "id": 5,
      "category": "Catégorie thématique — erreur classique à éviter",
      "title": "Titre court de la situation 5",
      "contexte": "Contexte de la situation 5 — erreur très répandue dans ce domaine (1-2 phrases)",
      "situation": "Situation 5 : le personnage est sur le point de commettre (ou vient de commettre) l'erreur la plus fréquente liée au sujet. Comment réagit-il correctement ? 4-5 phrases.",
      "attendu": "Points clés attendus pour la situation 5 : identifier l'erreur, corriger, prévenir la récidive"
    },
    {
      "id": 6,
      "category": "Catégorie thématique — collaboration ou communication",
      "title": "Titre court de la situation 6",
      "contexte": "Contexte de la situation 6 — interaction avec collègues, clients ou hiérarchie (1-2 phrases)",
      "situation": "Situation 6 impliquant plusieurs parties prenantes. Le personnage doit gérer une interaction professionnelle complexe liée au sujet. 4-5 phrases détaillées.",
      "attendu": "Points clés attendus pour la situation 6 : communication appropriée, posture professionnelle, actions concrètes"
    },
    {
      "id": 7,
      "category": "Catégorie thématique — cas complexe ou multi-facteurs",
      "title": "Titre court de la situation 7",
      "contexte": "Contexte de la situation 7 — situation synthétisant plusieurs aspects du sujet (1-2 phrases)",
      "situation": "Situation 7 plus élaborée : plusieurs aspects du sujet se combinent simultanément. Décision stratégique avec implications multiples. Synthèse de tous les apprentissages précédents. 4-5 phrases riches.",
      "attendu": "Points clés attendus pour la situation 7 (niveau Expert) : approche systémique, anticipation, actions prioritaires, réflexe à retenir"
    }
  ],
  "qcm": [
    {
      "question": "Question 1 — définition ou concept fondamental : [formulation précise comme une vraie question de formation] ?",
      "options": [
        { "text": "Réponse A incorrecte mais plausible", "correct": false },
        { "text": "Réponse B — la bonne réponse", "correct": true },
        { "text": "Réponse C incorrecte, confusion courante", "correct": false },
        { "text": "Réponse D incorrecte, trop extrême", "correct": false }
      ],
      "explanation": "Explication pédagogique complète et développée de la bonne réponse — contexte, pourquoi c'est vrai, exemple concret si possible"
    },
    {
      "question": "Question 2 — bonne pratique : quelle est la bonne façon de [action liée au sujet] ?",
      "options": [
        { "text": "Option A — incorrecte", "correct": false },
        { "text": "Option B — incorrecte, erreur classique", "correct": false },
        { "text": "Option C — correcte", "correct": true },
        { "text": "Option D — incorrecte, trop vague", "correct": false }
      ],
      "explanation": "Explication 2 détaillée avec les raisons pratiques qui justifient cette bonne pratique"
    },
    {
      "question": "Question 3 — identification d'erreur : dans la situation suivante [description courte], qu'est-ce qui est problématique ?",
      "options": [
        { "text": "Option A — correcte, identifie le vrai problème", "correct": true },
        { "text": "Option B — incorrecte, symptôme et non la cause", "correct": false },
        { "text": "Option C — incorrecte, hors sujet", "correct": false },
        { "text": "Option D — incorrecte, partiellement vrai mais incomplet", "correct": false }
      ],
      "explanation": "Explication 3 — comment identifier cette erreur et ses conséquences réelles"
    },
    {
      "question": "Question 4 — chiffre ou donnée clé : lequel de ces chiffres correspond à [statistique ou seuil réel lié au sujet] ?",
      "options": [
        { "text": "Option A — chiffre incorrect", "correct": false },
        { "text": "Option B — chiffre correct", "correct": true },
        { "text": "Option C — chiffre incorrect", "correct": false },
        { "text": "Option D — chiffre incorrect", "correct": false }
      ],
      "explanation": "Explication 4 — contexte du chiffre, ce qu'il signifie et pourquoi il est important à connaître"
    },
    {
      "question": "Question 5 — responsabilité ou rôle : qui est responsable de [action ou décision] dans ce contexte professionnel ?",
      "options": [
        { "text": "Option A — incorrecte", "correct": false },
        { "text": "Option B — incorrecte", "correct": false },
        { "text": "Option C — correcte", "correct": true },
        { "text": "Option D — incorrecte", "correct": false }
      ],
      "explanation": "Explication 5 — clarification des rôles et responsabilités dans ce contexte"
    },
    {
      "question": "Question 6 — cas pratique : que fait-on en premier lieu quand [situation concrète typique du sujet] ?",
      "options": [
        { "text": "Option A — correcte, première action à faire", "correct": true },
        { "text": "Option B — incorrecte, deuxième étape pas première", "correct": false },
        { "text": "Option C — incorrecte, réaction intuitive mais erronée", "correct": false },
        { "text": "Option D — incorrecte, inaction ou mauvaise priorité", "correct": false }
      ],
      "explanation": "Explication 6 — ordre des priorités et logique de la bonne séquence d'actions"
    },
    {
      "question": "Question 7 — vrai ou faux enrichi : laquelle de ces affirmations sur [aspect du sujet] est VRAIE ?",
      "options": [
        { "text": "Affirmation A — fausse, idée reçue répandue", "correct": false },
        { "text": "Affirmation B — fausse, vrai en théorie mais pas en pratique", "correct": false },
        { "text": "Affirmation C — vraie", "correct": true },
        { "text": "Affirmation D — fausse, exagération", "correct": false }
      ],
      "explanation": "Explication 7 — déconstruction des idées reçues et affirmation de la vérité avec sources ou exemples concrets"
    },
    {
      "question": "Question 8 — conséquence : que risque-t-on si on ne respecte pas [règle ou bonne pratique du sujet] ?",
      "options": [
        { "text": "Option A — risque réel et principal", "correct": true },
        { "text": "Option B — conséquence mineure, pas la principale", "correct": false },
        { "text": "Option C — risque exagéré ou inexact", "correct": false },
        { "text": "Option D — hors sujet", "correct": false }
      ],
      "explanation": "Explication 8 — détail des conséquences réelles, exemples de cas concrets si possible"
    },
    {
      "question": "Question 9 — outil ou méthode : quel outil ou quelle approche est la plus adaptée pour [tâche ou problème lié au sujet] ?",
      "options": [
        { "text": "Option A — incorrecte, outil non adapté", "correct": false },
        { "text": "Option B — correcte, meilleur outil ou méthode", "correct": true },
        { "text": "Option C — incorrecte, trop complexe pour ce besoin", "correct": false },
        { "text": "Option D — incorrecte, ancienne pratique dépassée", "correct": false }
      ],
      "explanation": "Explication 9 — pourquoi cet outil ou cette méthode est la mieux adaptée et dans quelles conditions l'utiliser"
    },
    {
      "question": "Question 10 — synthèse finale : parmi ces quatre comportements face à [situation synthétique du sujet], lequel reflète le niveau Expert ?",
      "options": [
        { "text": "Comportement A — niveau débutant, réactif", "correct": false },
        { "text": "Comportement B — niveau intermédiaire, partiel", "correct": false },
        { "text": "Comportement C — niveau intermédiaire +, presque mais incomplet", "correct": false },
        { "text": "Comportement D — niveau Expert, approche systémique et préventive", "correct": true }
      ],
      "explanation": "Explication 10 — description du comportement expert sur ce sujet et ce qui le distingue des autres niveaux"
    }
  ],
  "gamification": {
    "points": 1500,
    "badge": "🏆",
    "levels": [
      { "name": "Novice", "threshold": 0 },
      { "name": "Praticien", "threshold": 750 },
      { "name": "Expert", "threshold": 1250 }
    ]
  }
}`;

  // Résout le scope d'une formation selon la company de l'utilisateur connecté
  function resolveScope(req: Request): string {
    const explicit = req.body?.scope;
    if (explicit && typeof explicit === 'string') return explicit;
    const user = (req.session as any).user;
    if (user?.companyId) return String(user.companyId);
    return 'internal';
  }

  // POST /api/studio/generate-from-prompt
  app.post("/api/studio/generate-from-prompt", async (req: Request, res: Response) => {
    try {
      const { pitch, domain, audience, duration, gamification } = req.body;
      if (!pitch) return res.status(400).json({ error: 'Le pitch est requis' });

      const audienceLabels: Record<string, string> = {
        grand_public: 'grand public sans expertise particulière',
        managers: 'managers et responsables d\'équipe',
        experts: 'experts techniques',
        rh: 'équipes RH et formation',
        dirigeants: 'dirigeants et membres du COMEX',
        commercial: 'équipes commerciales',
      };
      const gamifLabels: Record<string, string> = {
        low: 'sérieux et orienté contenu, peu de gamification',
        medium: 'équilibré entre contenu et engagement ludique',
        high: 'très ludique et gamifié, maximise l\'engagement',
      };

      const prompt = `Tu es un expert en ingénierie pédagogique. Crée une formation professionnelle COMPLÈTE et JOUABLE, avec de vrais scénarios immersifs issus de situations réelles.

BESOIN : ${pitch}
DOMAINE : ${domain || 'À déterminer selon le besoin'}
PUBLIC CIBLE : ${audienceLabels[audience] || audience}
DURÉE : ${duration} minutes
GAMIFICATION : ${gamifLabels[gamification] || gamification}

RÈGLES IMPORTANTES — CONTENU RICHE OBLIGATOIRE :
- Génère EXACTEMENT 7 mises en situation professionnelles (champ "situations") et EXACTEMENT 10 questions QCM
- Chaque situation nomme un personnage (prénom + fonction) et décrit la situation en 4-5 phrases riches et réalistes
- Les 7 situations couvrent 7 angles DIFFÉRENTS du sujet (pas de répétition thématique)
- Le champ "attendu" liste 3-5 points clés que le participant doit mentionner dans sa réponse idéale
- Les 10 QCM testent des connaissances variées : définitions, cas pratiques, chiffres clés, erreurs courantes, bonnes pratiques, synthèse
- Les explications des QCM doivent être développées avec du contexte concret (2-3 phrases)

Réponds UNIQUEMENT avec ce JSON valide (sans texte avant ni après, sans markdown) :
${TRAINING_JSON_SCHEMA}`;

      const response = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.65, 12000);

      let training = parseTrainingJson(response);
      if (!training) {
        console.warn('[Studio IA] Parsing échoué. Fallback. Brut:', response.slice(0, 400));
        training = buildTrainingFallback(pitch.slice(0, 80));
      }

      // Normaliser : rétrocompat — convertit scenarios vers situations si nécessaire
      if (!training.situations && training.scenarios && Array.isArray(training.scenarios)) {
        training.situations = training.scenarios.map((s: any) => ({
          id: s.id,
          category: s.category || 'Mise en situation',
          title: s.title || 'Situation',
          contexte: s.context || '',
          situation: s.situation || '',
          attendu: s.reflexe || 'Appliquez les bonnes pratiques professionnelles.',
        }));
      } else if (!training.situations && training.scenario) {
        training.situations = [{ id: 1, category: 'Mise en situation', title: 'Situation', contexte: '', situation: training.scenario?.situation || '', attendu: 'Appliquez les bonnes pratiques professionnelles.' }];
      }

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id, title: training.title || 'Formation générée',
        tagline: training.tagline || '',
        source: 'prompt',
        sourceInfo: { pitch: pitch.slice(0, 200), domain, audience },
        audience: audience || 'grand_public',
        gamificationLevel: gamification || 'medium',
        content: training,
        scope: resolveScope(req),
      });

      res.json({ training, id });
    } catch (error) {
      console.error('[Studio IA] Erreur génération:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la formation. Réessayez.' });
    }
  });

  // POST /api/studio/generate-from-documents
  const multer = (await import('multer')).default;
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 5 } });
  const uploadMiddleware = (req: Request, res: Response, next: any) => {
    upload.array('files', 5)(req, res, (err: any) => {
      if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Fichier trop volumineux. La taille maximale est de 50 Mo par fichier.' });
      if (err) return res.status(500).json({ error: "Erreur lors de l'upload." });
      next();
    });
  };

  app.post("/api/studio/generate-from-documents", uploadMiddleware, async (req: Request, res: Response) => {
    try {
      const { title, audience, gamification } = req.body;
      const files = req.files as Express.Multer.File[] || [];

      // ── Extraction robuste du texte selon le type de fichier ─────────────────
      const extractTextFromFile = async (f: Express.Multer.File): Promise<string> => {
        const ext = f.originalname.split('.').pop()?.toLowerCase() || '';
        try {
          if (ext === 'txt') {
            return f.buffer.toString('utf-8').slice(0, 8000);
          }
          if (ext === 'pdf') {
            const pdfParse = _require('pdf-parse') as (buf: Buffer, opts?: any) => Promise<{ text: string }>;
            const result = await pdfParse(f.buffer);
            return (result.text || '').slice(0, 8000);
          }
          if (ext === 'docx' || ext === 'doc') {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer: f.buffer });
            return result.value.slice(0, 8000);
          }
          if (ext === 'pptx' || ext === 'ppt') {
            // Extract text from PPTX (ZIP with XML)
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(f.buffer);
            const slideTexts: string[] = [];
            const slideFiles = Object.keys(zip.files).filter(n => n.match(/ppt\/slides\/slide\d+\.xml$/));
            slideFiles.sort();
            for (const slideName of slideFiles.slice(0, 30)) {
              const content = await zip.files[slideName].async('text');
              const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (text.length > 20) slideTexts.push(text.slice(0, 500));
            }
            return slideTexts.join('\n\n').slice(0, 8000);
          }
        } catch (e) {
          console.warn(`[Studio] Extraction échouée pour ${f.originalname}:`, e);
        }
        return `[Fichier: ${f.originalname} — type non extractible directement, utilise le nom comme contexte]`;
      };

      // Extraire le texte de tous les fichiers en parallèle
      const extractedTexts = await Promise.all(files.map(async f => {
        const text = await extractTextFromFile(f);
        return `=== ${f.originalname} (${(f.size / 1024).toFixed(0)} Ko) ===\n${text}`;
      }));

      const filesSummary = extractedTexts.length > 0
        ? extractedTexts.join('\n\n').slice(0, 20000)
        : 'Aucun fichier fourni';

      const audienceLabel = ({ grand_public: 'grand public', managers: 'managers', experts: 'experts', rh: 'équipes RH', dirigeants: 'dirigeants' } as any)[audience] || audience;
      const gamifLabel = ({ low: 'sérieux', medium: 'équilibré', high: 'très ludique' } as any)[gamification] || gamification;

      const prompt = `Tu es un expert en ingénierie pédagogique. Voici le contenu extrait de documents fournis par un utilisateur.

${title ? `TITRE SOUHAITÉ : "${title}"` : 'Génère un titre basé sur le contenu'}
PUBLIC CIBLE : ${audienceLabel}
GAMIFICATION : ${gamifLabel}

CONTENU DES DOCUMENTS :
${filesSummary}

INSTRUCTIONS — CONTENU RICHE OBLIGATOIRE :
- Génère EXACTEMENT 7 mises en situation professionnelles (champ "situations") et EXACTEMENT 10 questions QCM basés sur le contenu des documents
- Chaque situation nomme un personnage (prénom + fonction), décrit la situation en 4-5 phrases détaillées
- Les 7 situations couvrent 7 angles différents du contenu documentaire
- Le champ "attendu" liste 3-5 points clés que le participant doit mentionner dans sa réponse idéale
- Les 10 QCM testent des connaissances variées issues directement du contenu : définitions, chiffres, cas pratiques, erreurs, bonnes pratiques
- Les explications QCM doivent référencer le contenu des documents (2-3 phrases)

Réponds UNIQUEMENT avec ce JSON valide (sans texte avant ni après, sans markdown) :
${TRAINING_JSON_SCHEMA}`;

      const response = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.65, 12000);

      let training = parseTrainingJson(response);
      if (!training) {
        console.warn('[Studio Documents] Parsing échoué. Fallback:', response.slice(0, 400));
        training = buildTrainingFallback(title || files[0]?.originalname || 'Document importé');
      }

      // Normaliser : rétrocompat — convertit scenarios vers situations si nécessaire
      if (!training.situations && training.scenarios && Array.isArray(training.scenarios)) {
        training.situations = training.scenarios.map((s: any) => ({
          id: s.id,
          category: s.category || 'Mise en situation',
          title: s.title || 'Situation',
          contexte: s.context || '',
          situation: s.situation || '',
          attendu: s.reflexe || 'Appliquez les bonnes pratiques professionnelles.',
        }));
      } else if (!training.situations && training.scenario) {
        training.situations = [{ id: 1, category: 'Mise en situation', title: 'Situation', contexte: '', situation: training.scenario?.situation || '', attendu: 'Appliquez les bonnes pratiques professionnelles.' }];
      }

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id, title: training.title || 'Formation depuis documents',
        tagline: training.tagline || '',
        source: 'documents',
        sourceInfo: { files: files.map(f => f.originalname) },
        audience: audience || 'grand_public',
        gamificationLevel: gamification || 'medium',
        content: training,
        scope: resolveScope(req),
      });

      res.json({ training, id });
    } catch (error) {
      console.error('[Studio Documents] Erreur génération:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la formation. Réessayez.' });
    }
  });

  // POST /api/studio/generate-from-url — Scraping robuste multi-stratégies + génération formation
  app.post("/api/studio/generate-from-url", async (req: Request, res: Response) => {
    try {
      const { url, depth = 10, title, audience, gamification } = req.body;
      if (!url) return res.status(400).json({ error: 'L\'URL est requise' });

      let parsedUrl: URL;
      try { parsedUrl = new URL(url); } catch {
        return res.status(400).json({ error: 'URL invalide' });
      }

      const axios = (await import('axios')).default;
      const cheerio = await import('cheerio');
      const xml2js = await import('xml2js');
      const baseOrigin = parsedUrl.origin;

      // ─── Multi user-agents pour éviter le blocage ──────────────────────────────
      const USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      ];
      let uaIndex = 0;

      // ─── Fetch avec retry et rotation de user-agent ────────────────────────────
      const fetchUrl = async (targetUrl: string, attempt = 0): Promise<string | null> => {
        try {
          const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
          uaIndex++;
          const resp = await axios.get(targetUrl, {
            timeout: 12000,
            maxRedirects: 5,
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.8,*/*;q=0.7',
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            responseType: 'text',
            maxContentLength: 5 * 1024 * 1024,
          });
          return typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
        } catch (err: any) {
          if (attempt < 2 && (err?.response?.status === 429 || err?.response?.status === 503)) {
            await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
            return fetchUrl(targetUrl, attempt + 1);
          }
          return null;
        }
      };

      // ─── Extraction intelligente du contenu d'une page ────────────────────────
      const extractText = (html: string, pageUrl: string): string => {
        const $ = cheerio.load(html);
        $('script, style, noscript, nav, footer, header, .nav, .footer, .header, .menu, .sidebar, .cookie, .modal, .popup, .banner, [class*="nav-"], [class*="-nav"], [class*="menu"], [id*="nav"], [id*="menu"], [id*="cookie"], [id*="popup"], [aria-hidden="true"], .breadcrumb, .pagination, [class*="social"], [class*="share"]').remove();

        // JSON-LD structured data
        const jsonLdTexts: string[] = [];
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const data = JSON.parse($(el).html() || '');
            if (data.description) jsonLdTexts.push(data.description);
            if (data.articleBody) jsonLdTexts.push(data.articleBody);
            if (data.text) jsonLdTexts.push(data.text);
            if (data.name && data['@type']) jsonLdTexts.push(`${data['@type']}: ${data.name}`);
          } catch {}
        });

        // Détection intelligente de la zone de contenu principal
        const mainSelectors = ['article', 'main', '[role="main"]', '.content', '#content', '.post-content', '.entry-content', '.article-body', '.page-content', '.main-content', '.post-body', '#main', '.container main', '.wrapper main'];
        let mainText = '';
        for (const sel of mainSelectors) {
          const el = $(sel).first();
          if (el.length && el.text().trim().length > 200) {
            mainText = el.text().replace(/\s+/g, ' ').trim();
            break;
          }
        }

        const pageTitle = $('title').first().text().trim();
        const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 2).join(' | ');
        const headings = $('h2, h3, h4').map((_, el) => '## ' + $(el).text().trim()).get().filter(t => t.length > 5).slice(0, 30).join('\n');
        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

        if (!mainText) {
          const paras = $('p, li, td, th, dt, dd, blockquote').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 30).join('\n');
          mainText = paras;
        }

        const parts = [
          pageTitle && `TITRE: ${pageTitle}`,
          h1s && `H1: ${h1s}`,
          metaDesc && `DESCRIPTION: ${metaDesc}`,
          jsonLdTexts.length > 0 && `DONNÉES STRUCTURÉES: ${jsonLdTexts.join(' ')}`,
          headings && `SECTIONS:\n${headings}`,
          mainText && `CONTENU:\n${mainText.slice(0, 6000)}`,
        ].filter(Boolean);

        return parts.join('\n\n').slice(0, 8000);
      };

      // ─── Extraction des liens internes ────────────────────────────────────────
      const extractLinks = (html: string, baseUrl: string): string[] => {
        const $ = cheerio.load(html);
        const links: string[] = [];
        $('a[href]').each((_, el) => {
          try {
            const href = $(el).attr('href') || '';
            if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
            const resolved = new URL(href, baseUrl).href.split('#')[0].split('?')[0];
            const u = new URL(resolved);
            if (u.origin === baseOrigin && !resolved.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|mp4|mp3|css|js|woff|ttf|eot|ico)(\?|$)/i)) {
              links.push(resolved);
            }
          } catch {}
        });
        return [...new Set(links)];
      };

      // ─── Parsing sitemap.xml (avec support sitemap_index) ─────────────────────
      const parseSitemapXml = async (sitemapUrl: string, depth2 = 0): Promise<string[]> => {
        if (depth2 > 2) return [];
        try {
          const xml = await fetchUrl(sitemapUrl);
          if (!xml || xml.trim()[0] !== '<') return [];
          const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
          const urls: string[] = [];

          if (result?.sitemapindex?.sitemap) {
            const sitemaps = Array.isArray(result.sitemapindex.sitemap) ? result.sitemapindex.sitemap : [result.sitemapindex.sitemap];
            for (const s of sitemaps.slice(0, 6)) {
              const loc = typeof s === 'string' ? s : s.loc;
              if (loc) { const sub = await parseSitemapXml(loc, depth2 + 1); urls.push(...sub); }
            }
          }
          if (result?.urlset?.url) {
            const entries = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
            for (const entry of entries) {
              const loc = typeof entry === 'string' ? entry : entry.loc;
              if (loc && typeof loc === 'string') {
                try { const u = new URL(loc); if (u.origin === baseOrigin) urls.push(loc); } catch {}
              }
            }
          }
          return [...new Set(urls)];
        } catch { return []; }
      };

      // ─── Parsing RSS/Atom feed ─────────────────────────────────────────────────
      const parseRssFeed = async (feedUrl: string): Promise<string> => {
        try {
          const xml = await fetchUrl(feedUrl);
          if (!xml || xml.trim()[0] !== '<') return '';
          const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
          const items = result?.rss?.channel?.item || result?.feed?.entry || [];
          const arr = Array.isArray(items) ? items : [items];
          return arr.slice(0, 25).map((item: any) => {
            const t = item.title?._ || item.title || '';
            const desc = item.description?._ || item.description || item.summary?._ || item.summary || '';
            const contentEncoded = item['content:encoded']?._ || item['content:encoded'] || '';
            const $ = cheerio.load(contentEncoded || desc);
            const text = $.text().replace(/\s+/g, ' ').trim().slice(0, 600);
            return `### ${t}\n${text}`;
          }).filter((t: string) => t.length > 15).join('\n\n');
        } catch { return ''; }
      };

      // ─── Découverte du sitemap depuis robots.txt + chemins communs ────────────
      const discoverSitemapUrls = async (): Promise<string[]> => {
        const sitemapUrls: string[] = [];
        const robotsTxt = await fetchUrl(`${baseOrigin}/robots.txt`);
        if (robotsTxt) {
          const matches = [...robotsTxt.matchAll(/Sitemap:\s*(.+)/gi)];
          for (const m of matches) sitemapUrls.push(m[1].trim());
        }
        const commonPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml', '/sitemap/sitemap.xml', '/wp-sitemap.xml', '/post-sitemap.xml', '/page-sitemap.xml', '/sitemap1.xml'];
        for (const path of commonPaths) {
          if (!sitemapUrls.some(u => u.includes(path))) sitemapUrls.push(`${baseOrigin}${path}`);
        }
        const allUrls: string[] = [];
        for (const sitemapUrl of sitemapUrls.slice(0, 6)) {
          const urls = await parseSitemapXml(sitemapUrl);
          allUrls.push(...urls);
          if (allUrls.length > 300) break;
        }
        return [...new Set(allUrls)];
      };

      // ─── Détection des flux RSS/Atom ──────────────────────────────────────────
      const detectFeedUrls = (html: string): string[] => {
        const $ = cheerio.load(html);
        const feedUrls: string[] = [];
        $('link[type="application/rss+xml"], link[type="application/atom+xml"]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) { try { feedUrls.push(new URL(href, url).href); } catch {} }
        });
        ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/blog/feed', '/news/feed'].forEach(path => {
          feedUrls.push(`${baseOrigin}${path}`);
        });
        return [...new Set(feedUrls)].slice(0, 4);
      };

      // ═══ ORCHESTRATION DU SCRAPING ════════════════════════════════════════════
      const maxPages = Math.min(parseInt(String(depth)) || 10, 40);
      const visited = new Set<string>();
      const corpus: string[] = [];
      let siteName = parsedUrl.hostname;
      let feedContent = '';

      // Étape 1 : Fetch de la page principale
      console.log(`[Studio URL] Démarrage scraping: ${url}`);
      const mainHtml = await fetchUrl(url);
      if (!mainHtml) {
        return res.status(400).json({ error: 'Impossible d\'accéder à ce site. Vérifiez que l\'URL est correcte et que le site est accessible.' });
      }

      visited.add(url.split('#')[0].split('?')[0]);
      const mainText = extractText(mainHtml, url);
      if (mainText.length > 50) corpus.push(`--- Page principale: ${url} ---\n${mainText}`);

      const $main = cheerio.load(mainHtml);
      siteName = $main('title').first().text().trim() || $main('meta[property="og:site_name"]').attr('content') || parsedUrl.hostname;

      // Étape 2 : Feeds RSS/Atom (excellente source de contenu structuré)
      const feedUrls = detectFeedUrls(mainHtml);
      for (const feedUrl of feedUrls) {
        const fc = await parseRssFeed(feedUrl);
        if (fc.length > 200) {
          feedContent = fc;
          console.log(`[Studio URL] Feed trouvé: ${feedUrl} (${fc.length} chars)`);
          break;
        }
      }

      // Étape 3 : Découverte via sitemap (prioritaire sur BFS)
      let pageQueue: string[] = [];
      const sitemapUrls = await discoverSitemapUrls();
      if (sitemapUrls.length > 0) {
        console.log(`[Studio URL] Sitemap: ${sitemapUrls.length} URLs découvertes`);
        // Score : préférer les pages de contenu (shallow, pas de dates, pas de tags)
        const scored = sitemapUrls
          .filter(u => !visited.has(u))
          .map(u => {
            let score = 100;
            try {
              const path = new URL(u).pathname;
              score -= path.split('/').filter(Boolean).length * 5;
              if (path.match(/\d{4}\/\d{2}\/\d{2}/)) score -= 30;
              if (path.match(/\/(tag|category|author|page|wp-json|feed|amp)\//i)) score -= 25;
              if (path.match(/\/(about|service|produit|product|solution|offre|expertise|formation|guide|docs?|blog|news)\//i)) score += 20;
            } catch {}
            return { url: u, score };
          })
          .sort((a, b) => b.score - a.score)
          .map(x => x.url);
        pageQueue = scored;
      } else {
        // Fallback : BFS depuis la page principale
        pageQueue = extractLinks(mainHtml, url);
      }

      // Étape 4 : Crawl des pages
      for (const pageUrl of pageQueue) {
        if (visited.size >= maxPages) break;
        if (visited.has(pageUrl)) continue;
        visited.add(pageUrl);

        const html = await fetchUrl(pageUrl);
        if (!html) continue;

        const text = extractText(html, pageUrl);
        if (text.length > 100) corpus.push(`--- Page: ${pageUrl} ---\n${text}`);

        // Si pas de sitemap, compléter la queue via BFS
        if (sitemapUrls.length === 0) {
          const links = extractLinks(html, pageUrl);
          for (const l of links) {
            if (!visited.has(l) && !pageQueue.includes(l)) pageQueue.push(l);
          }
        }
        if (visited.size % 5 === 0) await new Promise(r => setTimeout(r, 150));
      }

      console.log(`[Studio URL] Crawl terminé: ${visited.size} pages, ${corpus.length} avec contenu`);

      if (corpus.length === 0 && !feedContent) {
        return res.status(400).json({
          error: 'Impossible d\'extraire du contenu de ce site. Le site est peut-être rendu en JavaScript (SPA), protégé, ou nécessite une authentification. Essayez avec une URL de page de contenu spécifique (ex: /blog, /docs, /about).'
        });
      }

      // ─── Construction du corpus final + RAG sur grands volumes ──────────────
      let fullContent = corpus.join('\n\n');
      if (feedContent) fullContent = `CONTENU FLUX RSS/FEED:\n${feedContent}\n\n---\n\n${fullContent}`;

      const MAX_DIRECT = 30000;
      let processedContent = '';

      if (fullContent.length > MAX_DIRECT) {
        console.log(`[Studio URL] Grand corpus (${fullContent.length} chars) → résumé par chunks (RAG)`);
        const chunkSize = 12000;
        const chunks: string[] = [];
        for (let i = 0; i < fullContent.length; i += chunkSize) chunks.push(fullContent.slice(i, i + chunkSize));

        const summaries = await Promise.all(chunks.slice(0, 5).map(async (chunk, idx) => {
          const r = await openAIService.getChatCompletion([{
            role: 'user',
            content: `Tu es un expert en extraction d'informations pédagogiques. Résume les informations clés de ce contenu web en bullet points factuels et précis (max 35 points). Ignore la navigation, les menus, les publicités. Retiens uniquement : faits, définitions, chiffres clés, processus, bonnes pratiques, cas d'usage, bénéfices, risques, réglementations, exemples concrets.\n\nCONTENU (partie ${idx + 1}/${chunks.slice(0, 5).length}):\n${chunk}`
          }], 0.3, 2000);
          return `SYNTHÈSE PARTIE ${idx + 1}:\n${r}`;
        }));

        processedContent = summaries.join('\n\n---\n\n').slice(0, MAX_DIRECT);
        console.log(`[Studio URL] RAG: ${summaries.length} chunks résumés → ${processedContent.length} chars`);
      } else {
        processedContent = fullContent.slice(0, MAX_DIRECT);
      }

      const totalChars = fullContent.length;
      const audienceLabel = ({ grand_public: 'grand public', managers: 'managers', experts: 'experts', rh: 'équipes RH', dirigeants: 'dirigeants' } as any)[audience] || audience;
      const gamifLabel = ({ low: 'sérieux', medium: 'équilibré', high: 'très ludique' } as any)[gamification] || gamification;

      const prompt = `Tu es un expert en ingénierie pédagogique. Voici le contenu extrait d'un site web par scraping multi-stratégies (BFS + sitemap + RSS + JSON-LD).

SOURCE : ${url}
PAGES ANALYSÉES : ${visited.size} | SITE : ${siteName}
PUBLIC CIBLE : ${audienceLabel} | GAMIFICATION : ${gamifLabel}
${title ? `TITRE SOUHAITÉ : "${title}"` : ''}

CONTENU EXTRAIT ET SYNTHÉTISÉ :
${processedContent}

INSTRUCTIONS — CONTENU RICHE OBLIGATOIRE :
- Génère EXACTEMENT 7 mises en situation professionnelles (champ "situations") et EXACTEMENT 10 questions QCM basés STRICTEMENT sur le contenu du site
- Chaque situation nomme un personnage réaliste (prénom + fonction), 4-5 phrases riches et détaillées
- Les 7 situations couvrent 7 angles différents du contenu extrait
- Le champ "attendu" liste 3-5 points clés que le participant doit mentionner dans sa réponse idéale
- Les 10 QCM testent des connaissances variées : définitions, chiffres clés, cas pratiques, erreurs courantes, bonnes pratiques, synthèse
- Les explications QCM doivent être développées avec du contexte tiré du contenu (2-3 phrases)

Réponds UNIQUEMENT avec ce JSON valide (sans texte avant ni après, sans markdown) :
${TRAINING_JSON_SCHEMA}`;

      const aiResponse = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.65, 12000);

      let training = parseTrainingJson(aiResponse);
      if (!training) {
        console.warn('[Studio URL] Parsing JSON échoué. Fallback:', aiResponse.slice(0, 400));
        training = buildTrainingFallback(title || siteName);
      }

      // Normaliser : rétrocompat
      if (!training.situations && training.scenarios && Array.isArray(training.scenarios)) {
        training.situations = training.scenarios.map((s: any) => ({
          id: s.id, category: s.category || 'Mise en situation', title: s.title || 'Situation',
          contexte: s.context || '', situation: s.situation || '', attendu: s.reflexe || 'Appliquez les bonnes pratiques professionnelles.',
        }));
      } else if (!training.situations && training.scenario) {
        training.situations = [{ id: 1, category: 'Mise en situation', title: 'Situation', contexte: '', situation: training.scenario?.situation || '', attendu: 'Appliquez les bonnes pratiques professionnelles.' }];
      }

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id, title: training.title || 'Formation depuis site web', tagline: training.tagline || '',
        source: 'url', sourceInfo: { url, pagesVisited: visited.size, siteName },
        audience: audience || 'grand_public', gamificationLevel: gamification || 'medium', content: training,
        scope: resolveScope(req),
      });

      res.json({ training, id, scrapeInfo: { pagesVisited: visited.size, totalChars, siteName: siteName.slice(0, 60) } });

    } catch (error: any) {
      console.error('[Studio URL] Erreur:', error?.message || error);
      const msg = error?.message?.includes('ECONNREFUSED') || error?.message?.includes('ENOTFOUND')
        ? 'Site inaccessible — vérifiez que l\'URL est correcte et que le site est en ligne.'
        : error?.message?.includes('timeout')
        ? 'Le site met trop de temps à répondre. Essayez avec une URL de page spécifique.'
        : 'Erreur lors du crawl ou de la génération. Réessayez.';
      res.status(500).json({ error: msg });
    }
  });

  // POST /api/studio/preview-plan — Génère un plan rapide (~3s) avant la génération complète
  app.post("/api/studio/preview-plan", async (req: Request, res: Response) => {
    try {
      const { pitch, domain, audience, difficulty, duration } = req.body;
      if (!pitch) return res.status(400).json({ error: 'Le pitch est requis' });

      const audienceLabels: Record<string, string> = {
        grand_public: 'grand public', managers: 'managers', experts: 'experts techniques',
        rh: 'RH & Formation', dirigeants: 'dirigeants', commercial: 'équipes commerciales',
      };

      const prompt = `Tu es un expert en ingénierie pédagogique. À partir du besoin suivant, génère UNIQUEMENT un plan de leçon léger (pas le contenu complet).

BESOIN : ${pitch}
${domain ? `DOMAINE : ${domain}` : ''}
PUBLIC : ${audienceLabels[audience] || audience}
NIVEAU : ${difficulty || 'intermédiaire'}
${duration ? `DURÉE : ${duration} minutes` : ''}

Génère un plan avec 12-15 slides. Types possibles : intro, theorie, pratique, fill-blank, vrai-faux, conclusion.

Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{
  "title": "Titre accrocheur de la leçon",
  "subtitle": "Sous-titre — angle en moins de 12 mots",
  "plan": [
    {"index": 1, "type": "intro", "titre": "Titre de la slide"},
    {"index": 2, "type": "theorie", "titre": "Titre du concept"},
    {"index": 3, "type": "pratique", "titre": "Défi Débutant : ..."}
  ]
}`;

      const messages = [{ role: 'user' as const, content: prompt }];
      const raw = await openAIService.getChatCompletion(messages, 0.7, 2000);

      const parsePreviewPlan = (str: string) => {
        try {
          // 1. Retirer les blocs markdown
          let s = str.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          // 2. Isoler le JSON entre { et }
          const start = s.indexOf('{');
          const end = s.lastIndexOf('}');
          if (start === -1 || end === -1) return null;
          s = s.slice(start, end + 1);
          // 3. Remplacer tous les caractères de contrôle par un espace
          s = s.replace(/[\x00-\x1F\x7F]/g, ' ');
          // 4. Supprimer les virgules finales avant ] ou } (trailing commas)
          s = s.replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(s);
        } catch { return null; }
      };

      const plan = parsePreviewPlan(raw);
      if (!plan) {
        console.error('[preview-plan] JSON invalide, début de la réponse brute:', raw.slice(0, 300));
        throw new Error('JSON invalide retourné par le modèle');
      }

      return res.json(plan);
    } catch (err: any) {
      console.error('preview-plan error:', err);
      return res.status(500).json({ error: 'Erreur lors de la génération du plan' });
    }
  });

  // POST /api/studio/generate-lesson-from-prompt — Pipeline robuste slide-par-slide + Zod + retry
  app.post("/api/studio/generate-lesson-from-prompt", async (req: Request, res: Response) => {
    try {
      const { pitch, domain, audience, difficulty } = req.body;
      if (!pitch) return res.status(400).json({ error: 'Le pitch est requis' });

      // Cache DB — évite de régénérer si même pitch/contexte récent
      const lessonCacheKey = `${pitch.trim()}|${audience || 'grand_public'}|${difficulty || 'intermediaire'}|${domain || ''}`;
      const { getCached: getLessonCache, setCached: setLessonCache } = await import('./services/dbCacheService');
      const cachedLesson = await getLessonCache(lessonCacheKey, 'lesson');
      if (cachedLesson) {
        try {
          const lesson = JSON.parse(cachedLesson);
          if (lesson?.slides?.length >= 3) {
            console.log('[Lesson] Cache DB hit');
            return res.json({ lesson, id: `cached-${Date.now()}`, fromCache: true });
          }
        } catch {}
      }

      // Pipeline robuste
      const { generateLesson } = await import('./services/lessonGenerator');
      const lesson = await generateLesson({ pitch, domain, audience, difficulty });

      // Mise en cache
      await setLessonCache(lessonCacheKey, 'lesson', JSON.stringify(lesson), 30).catch(() => {});

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id,
        title: lesson.title || 'Leçon interactive',
        tagline: lesson.subtitle || '',
        source: 'lesson',
        sourceInfo: { pitch: pitch.slice(0, 200), domain, slideCount: lesson.slides.length, score: lesson._meta?.score },
        audience: audience || 'grand_public',
        gamificationLevel: 'medium',
        content: lesson,
        scope: resolveScope(req),
      });

      res.json({ lesson, id });
    } catch (error: any) {
      console.error('[Studio Lesson IA] Erreur:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de la génération de la leçon. Réessayez.' });
    }
  });

  // POST /api/studio/extract-preview — Extrait le texte brut des fichiers et retourne un aperçu + qualité
  const multerPreview = (await import('multer')).default;
  const uploadPreview = multerPreview({ storage: multerPreview.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 5 } });
  const uploadPreviewMiddleware = (req: Request, res: Response, next: any) => {
    uploadPreview.array('files', 5)(req, res, (err: any) => {
      if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Fichier trop volumineux.' });
      if (err) return res.status(500).json({ error: "Erreur lors de l'upload." });
      next();
    });
  };

  const extractTextPreview = async (f: Express.Multer.File): Promise<string> => {
    const ext = f.originalname.split('.').pop()?.toLowerCase() || '';
    try {
      if (ext === 'txt') return f.buffer.toString('utf-8').slice(0, 6000);
      if (ext === 'pdf') {
        const pdfParse = _require('pdf-parse') as (buf: Buffer, opts?: any) => Promise<{ text: string }>;
        const result = await pdfParse(f.buffer);
        return (result.text || '').slice(0, 6000);
      }
      if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: f.buffer });
        return result.value.slice(0, 6000);
      }
      if (ext === 'pptx' || ext === 'ppt') {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(f.buffer);
        const slideFiles = Object.keys(zip.files).filter(n => n.match(/ppt\/slides\/slide\d+\.xml$/)).sort();
        const texts: string[] = [];
        for (const slideName of slideFiles.slice(0, 20)) {
          const content = await zip.files[slideName].async('text');
          const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.length > 20) texts.push(text.slice(0, 400));
        }
        return texts.join('\n').slice(0, 6000);
      }
    } catch (e) {
      console.warn(`[Preview] Extraction échouée pour ${f.originalname}:`, e);
    }
    return '';
  };

  app.post("/api/studio/extract-preview", uploadPreviewMiddleware, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[] || [];
      if (files.length === 0) return res.status(400).json({ error: 'Aucun fichier fourni' });

      const fileResults = await Promise.all(files.map(async f => {
        const text = await extractTextPreview(f);
        const chars = text.replace(/\s+/g, ' ').trim().length;
        const quality: 'good' | 'ok' | 'low' | 'unreadable' =
          chars > 1500 ? 'good' : chars > 400 ? 'ok' : chars > 80 ? 'low' : 'unreadable';
        return { name: f.originalname, size: f.size, chars, quality, preview: text.slice(0, 800).replace(/\s+/g, ' ').trim() };
      }));

      const totalChars = fileResults.reduce((s, f) => s + f.chars, 0);
      const combinedPreview = fileResults.map(f => f.preview).join('\n\n---\n\n').slice(0, 900);
      const overallQuality: 'good' | 'ok' | 'low' | 'unreadable' =
        totalChars > 2000 ? 'good' : totalChars > 600 ? 'ok' : totalChars > 120 ? 'low' : 'unreadable';

      res.json({ files: fileResults, totalChars, combinedPreview, overallQuality });
    } catch (error: any) {
      console.error('[Extract Preview] Erreur:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de la lecture des fichiers.' });
    }
  });

  // POST /api/studio/generate-lesson — Génère une leçon interactive en slides depuis des documents
  const multerLesson = (await import('multer')).default;
  const uploadLesson = multerLesson({ storage: multerLesson.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 3 } });
  const uploadLessonMiddleware = (req: Request, res: Response, next: any) => {
    uploadLesson.array('files', 3)(req, res, (err: any) => {
      if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Fichier trop volumineux. La taille maximale est de 50 Mo par fichier.' });
      if (err) return res.status(500).json({ error: "Erreur lors de l'upload." });
      next();
    });
  };

  app.post("/api/studio/generate-lesson", uploadLessonMiddleware, async (req: Request, res: Response) => {
    try {
      const { title, audience, difficulty } = req.body;
      const files = req.files as Express.Multer.File[] || [];
      if (files.length === 0) return res.status(400).json({ error: 'Au moins un fichier est requis' });

      // Extraction texte (inchangée — fiable)
      const extractTextFromFile = async (f: Express.Multer.File): Promise<string> => {
        const ext = f.originalname.split('.').pop()?.toLowerCase() || '';
        try {
          if (ext === 'txt') return f.buffer.toString('utf-8').slice(0, 12000);
          if (ext === 'pdf') {
            const pdfParse = _require('pdf-parse') as (buf: Buffer, opts?: any) => Promise<{ text: string }>;
            const result = await pdfParse(f.buffer);
            return (result.text || '').slice(0, 12000);
          }
          if (ext === 'docx' || ext === 'doc') {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer: f.buffer });
            return result.value.slice(0, 12000);
          }
          if (ext === 'pptx' || ext === 'ppt') {
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(f.buffer);
            const slideTexts: string[] = [];
            const slideFiles = Object.keys(zip.files).filter(n => n.match(/ppt\/slides\/slide\d+\.xml$/));
            slideFiles.sort();
            for (const slideName of slideFiles.slice(0, 30)) {
              const content = await zip.files[slideName].async('text');
              const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (text.length > 20) slideTexts.push(text.slice(0, 600));
            }
            return slideTexts.join('\n\n').slice(0, 12000);
          }
        } catch (e) {
          console.warn(`[Lesson] Extraction échouée pour ${f.originalname}:`, e);
        }
        return '';
      };

      const extractedTexts = await Promise.all(files.map(async f => {
        const text = await extractTextFromFile(f);
        return `=== ${f.originalname} ===\n${text}`;
      }));
      const sourceContext = extractedTexts.join('\n\n').slice(0, 25000);

      if (sourceContext.trim().length < 80) {
        return res.status(400).json({ error: 'Impossible d\'extraire du texte de vos fichiers. Vérifiez que les fichiers contiennent du texte lisible.' });
      }

      // Pitch déduit du titre ou du contenu extrait
      const pitch = title || `Formation basée sur : ${files.map(f => f.originalname).join(', ')}`;

      // Pipeline robuste — même moteur que le mode prompt, enrichi du contexte source
      const { generateLesson } = await import('./services/lessonGenerator');
      const lesson = await generateLesson({ pitch, audience, difficulty, sourceContext });

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id,
        title: lesson.title || 'Leçon interactive',
        tagline: lesson.subtitle || '',
        source: 'lesson',
        sourceInfo: { files: files.map(f => f.originalname), slideCount: lesson.slides.length, score: lesson._meta?.score },
        audience: audience || 'grand_public',
        gamificationLevel: 'medium',
        content: lesson,
        scope: resolveScope(req),
      });

      res.json({ lesson, id });
    } catch (error: any) {
      console.error('[Studio Lesson] Erreur:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de la génération de la leçon. Réessayez.' });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STUDIO V2 — Moteur de génération unifié (brief complet + documents)
  // ─────────────────────────────────────────────────────────────────────────

  // Extraction documentaire puissante (PDF + Word uniquement)
  const extractDocumentText = async (f: Express.Multer.File): Promise<{ text: string; structure: string[]; charCount: number }> => {
    const ext = f.originalname.split('.').pop()?.toLowerCase() || '';
    let raw = '';
    const sections: string[] = [];

    try {
      if (ext === 'pdf') {
        const pdfParse = _require('pdf-parse') as (buf: Buffer, opts?: any) => Promise<{ text: string }>;
        const result = await pdfParse(f.buffer, {
          pagerender: (pageData: any) => {
            return pageData.getTextContent().then((tc: any) => {
              let last = '';
              let text = '';
              for (const item of tc.items) {
                const str = (item as any).str;
                if (str.trim()) {
                  if (last && (item as any).transform?.[5] !== undefined) {
                    text += str + ' ';
                  } else {
                    text += '\n' + str + ' ';
                  }
                  last = str;
                }
              }
              return text;
            });
          }
        });
        raw = result.text || '';
        // Détection des sections par heuristique (lignes courtes en majuscules ou numérotées)
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (line.length < 80 && (line === line.toUpperCase() || /^[0-9]+[\.\)]\s/.test(line) || /^#{1,3}\s/.test(line))) {
            sections.push(line);
          }
        }
      } else if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth');
        // Extraction avec HTML pour conserver titres/listes
        const htmlResult = await mammoth.convertToHtml({ buffer: f.buffer });
        const html = htmlResult.value;
        // Extraire les titres comme sections
        const headingMatches = html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
        for (const m of headingMatches) {
          sections.push(m[1].replace(/<[^>]+>/g, '').trim());
        }
        // Texte brut propre depuis HTML
        raw = html
          .replace(/<h[1-3][^>]*>/gi, '\n\n### ')
          .replace(/<\/h[1-3]>/gi, '\n')
          .replace(/<li[^>]*>/gi, '\n- ')
          .replace(/<\/li>/gi, '')
          .replace(/<p[^>]*>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }
    } catch (e) {
      console.warn(`[Studio V2] Extraction échouée pour ${f.originalname}:`, e);
      raw = `[Contenu non extractible: ${f.originalname}]`;
    }

    // Chunking intelligent : si > 60k chars, résumer par sections
    const MAX_CHARS = 60000;
    let finalText = raw;
    if (raw.length > MAX_CHARS) {
      // Garder les 20k premiers + 20k du milieu + 20k de la fin
      const third = Math.floor(raw.length / 3);
      finalText = raw.slice(0, 20000) + '\n\n[...]\n\n' + raw.slice(third, third + 20000) + '\n\n[...]\n\n' + raw.slice(-20000);
    }

    return { text: finalText, structure: sections.slice(0, 20), charCount: raw.length };
  };

  // Multer pour studio v2 (PDF + Word uniquement)
  const multerV2 = (await import('multer')).default;
  const uploadStudioV2 = multerV2({
    storage: multerV2.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024, files: 3 },
    fileFilter: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
      if (['pdf', 'doc', 'docx'].includes(ext)) cb(null, true);
      else cb(new Error('Seuls les fichiers PDF et Word sont acceptés'));
    },
  }).array('files', 3);

  // POST /api/studio/v2/generate — Génération unifiée (brief + fichiers optionnels)
  app.post("/api/studio/v2/generate", (req, res, next) => {
    uploadStudioV2(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const {
        title, description, audience, level, sector, internalContext, deliveryMode,
        format, style, gamification, language
      } = req.body;

      if (!title && !description) {
        return res.status(400).json({ error: 'Un titre ou une description est requis' });
      }

      const files = req.files as Express.Multer.File[] || [];

      // ── Extraction documentaire ──
      let docsContext = '';
      let docsStructure: string[] = [];
      if (files.length > 0) {
        const extracted = await Promise.all(files.map(f => extractDocumentText(f)));
        docsContext = extracted.map((e, i) =>
          `=== DOCUMENT ${i + 1} : ${files[i].originalname} (${(e.charCount / 1000).toFixed(0)}k caractères) ===\n` +
          (e.structure.length > 0 ? `Sections détectées: ${e.structure.join(' | ')}\n\n` : '') +
          e.text
        ).join('\n\n---\n\n');
        docsStructure = extracted.flatMap(e => e.structure);
      }

      // ── Paramètres pédagogiques ──
      const audienceLabels: Record<string, string> = {
        all: 'tous niveaux (accessibilité maximale)',
        junior: 'profils juniors et débutants',
        senior: 'professionnels expérimentés',
        manager: 'managers et responsables d\'équipe',
        executive: 'dirigeants et membres du COMEX',
      };
      const levelLabels: Record<string, string> = {
        beginner: 'débutant — vocabulaire simple, concepts fondamentaux, pas de prérequis',
        intermediate: 'intermédiaire — cas pratiques métier, approfondissement',
        expert: 'expert — enjeux avancés, nuances, défis exigeants',
      };
      const styleLabels: Record<string, string> = {
        case_study: 'orienté cas pratiques et mises en situation réelles',
        structured: 'structuré et théorique, progression logique',
        mixed: 'mixte — alternance théorie courte et pratique intensive',
        scenario: 'orienté scénarios immersifs et récits professionnels',
      };
      const gamifLabels: Record<string, string> = {
        none: 'aucune gamification — format sérieux et sobre',
        light: 'gamification légère — points de progression',
        moderate: 'gamification modérée — badges, niveaux, score',
        high: 'gamification intense — défis, streaks, classements',
      };
      const deliveryLabels: Record<string, string> = {
        self: 'AUTOFORMATION : le participant apprend seul, à son rythme. Inclure des exercices interactifs avec feedback immédiat, des évaluations auto-corrigées et des explications détaillées pour chaque réponse.',
        trainer: 'PRÉSENTIEL : support animé par un formateur. Inclure des activités de groupe, des questions de discussion, des exercices à faire en binôme ou équipe, et des points de débrief formateur.',
      };

      const isFromDocs = docsContext.length > 100;
      const langInstruction = language === 'en' ? 'Generate ALL content in English.' : 'Génère tout le contenu en français.';

      // ── Prompt système ──
      const systemPrompt = `Tu es un expert senior en ingénierie pédagogique avec 20 ans d'expérience en conception de formations professionnelles. Tu crées des formations de haute qualité, précises, engageantes et immédiatement utilisables. Tu respectes scrupuleusement les instructions données et génères UNIQUEMENT du JSON valide sans aucun texte avant ou après.`;

      // ── Prompt utilisateur ──
      const userPrompt = `Crée une formation professionnelle complète selon ce brief client.

═══ BRIEF CLIENT ═══
Titre / Sujet : ${title || 'À définir selon le contenu'}
${description ? `Description / Objectif : ${description}` : ''}
Public cible : ${audienceLabels[audience] || audience || 'professionnels'}
Niveau : ${levelLabels[level] || level || 'intermédiaire'}
Secteur / Domaine : ${sector || 'non précisé'}
${internalContext ? `Contexte et problématiques internes : ${internalContext}` : ''}
Mode de délivrance : ${deliveryLabels[deliveryMode] || deliveryMode || deliveryLabels['self']}
Durée cible : ${format === '15' ? '15 minutes (micro learning rapide)' : format === '45' ? '45 minutes (module complet)' : format === '90' ? '90 minutes (parcours approfondi)' : '30 minutes (micro learning standard)'}
Style pédagogique : ${styleLabels[style] || style || styleLabels['mixed']}
Gamification : ${gamifLabels[gamification] || gamification || gamifLabels['light']}
Langue : ${langInstruction}
${isFromDocs ? `\nSources documentaires détectées : ${docsStructure.length > 0 ? docsStructure.slice(0, 10).join(', ') : 'structure libre'}` : ''}

${isFromDocs ? `═══ CONTENU DES DOCUMENTS SOURCE ═══\n${docsContext.slice(0, 55000)}\n\n` : ''}
═══ INSTRUCTIONS DE GÉNÉRATION ═══
${isFromDocs ? '- Tout le contenu doit être FIDÈLE aux documents fournis — ne pas inventer de faits.\n- Les situations et QCM doivent être directement inspirés du contenu documentaire.' : '- Génère un contenu précis, concret et immédiatement applicable dans un contexte professionnel réel.'}
- Génère EXACTEMENT 7 situations professionnelles distinctes couvrant 7 angles différents du sujet.
- Génère EXACTEMENT 10 questions QCM variées (définitions, cas pratiques, erreurs courantes, bonnes pratiques, synthèse).
- Chaque situation nomme un personnage (prénom + fonction précise) et décrit un contexte en 4-5 phrases riches.
- Le champ "attendu" liste 4-5 points clés structurés que le participant doit maîtriser.
- Les explications QCM sont développées avec du contexte concret (2-3 phrases minimum).
- Respecte STRICTEMENT le mode de délivrance (${deliveryMode === 'trainer' ? 'présentiel' : 'autoformation'}).${deliveryMode === 'trainer' ? `
- MODE PRÉSENTIEL : chaque situation représente une SLIDE de formation. Le champ "trainerNote" doit contenir :
  1. Un titre de slide court (ex: "Slide : La règle des 3 clics")
  2. Une animation suggérée pour le formateur (ex: "Demandez au groupe de voter à main levée")
  3. Une question de débrief ouverte (ex: "Quelle a été votre pire expérience avec ce type de situation ?")
  4. Une activité groupe optionnelle (ex: "Atelier : 10 min en binômes pour tester le scénario")
  Le champ "situation" devient la description de la slide (ce qui est projeté).
  Le champ "attendu" liste les points à faire ressortir lors du débrief animé.` : ''}
- Adapte la complexité au niveau "${level || 'intermediate'}".

Réponds UNIQUEMENT avec ce JSON valide (zéro texte avant ou après, zéro markdown) :
{
  "title": "Titre précis et accrocheur",
  "tagline": "Sous-titre — angle unique en moins de 12 mots",
  "deliveryMode": "${deliveryMode || 'self'}",
  "objectives": [
    "Objectif 1 — verbe d'action + résultat mesurable",
    "Objectif 2",
    "Objectif 3",
    "Objectif 4",
    "Objectif 5"
  ],
  "modules": [
    { "title": "Titre du module", "duration": "10 min", "type": "Théorie | Pratique | Évaluation" }
  ],
  "situations": [
    {
      "id": 1,
      "category": "Catégorie thématique — aspect spécifique du sujet",
      "title": "Titre court et accrocheur",
      "contexte": "Fait clé, règle, chiffre ou principe fondamental (1-2 phrases)",
      "situation": "Prénom + fonction + contexte professionnel détaillé + défi concret (4-5 phrases riches)",
      "attendu": "1. Point clé attendu\\n2. Point clé attendu\\n3. Point clé attendu\\n4. Point clé attendu",
      "trainerNote": "${deliveryMode === 'trainer' ? 'Slide : [titre] | Animation : [suggérée] | Débrief : [question ouverte] | Activité : [optionnel]' : ''}"
    }
  ],
  "qcm": [
    {
      "question": "Question précise et bien formulée ?",
      "options": [
        { "text": "Option A", "correct": false },
        { "text": "Option B", "correct": true },
        { "text": "Option C", "correct": false },
        { "text": "Option D", "correct": false }
      ],
      "explanation": "Explication développée avec contexte concret — 2-3 phrases"
    }
  ],
  "gamification": {
    "points": 500,
    "badge": "Expert",
    "levels": ["Novice", "Praticien", "Expert"]
  }
}`;

      const aiResponse = await openAIService.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.6, 14000);

      // Parsing JSON robuste avec retry
      const parseRobust = (str: string): any => {
        const attempts = [
          () => JSON.parse(str),
          () => { const c = str.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(); return JSON.parse(c); },
          () => { const s = str.indexOf('{'); const e = str.lastIndexOf('}'); if (s === -1 || e === -1) return null; return JSON.parse(str.slice(s, e + 1)); },
          () => { const s = str.indexOf('{'); const e = str.lastIndexOf('}'); if (s === -1 || e === -1) return null; return JSON.parse(str.slice(s, e + 1).replace(/[\x00-\x1F\x7F]/g, ' ')); },
        ];
        for (const attempt of attempts) {
          try { const r = attempt(); if (r && typeof r === 'object') return r; } catch {}
        }
        return null;
      };

      let training = parseRobust(aiResponse);

      // Retry si parsing échoue
      if (!training || !training.situations || !Array.isArray(training.situations)) {
        console.warn('[Studio V2] Premier parsing échoué, retry...');
        const retryResponse = await openAIService.getChatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: aiResponse },
          { role: 'user', content: 'Ta réponse contient du texte hors JSON. Réponds UNIQUEMENT avec le JSON valide demandé, sans aucun autre texte.' },
        ], 0.3, 14000);
        training = parseRobust(retryResponse);
      }

      if (!training) {
        return res.status(500).json({ error: 'Impossible de générer la formation. Réessayez.' });
      }

      // Normaliser les QCM (format legacy → nouveau format)
      if (training.qcm && Array.isArray(training.qcm)) {
        training.qcm = training.qcm.map((q: any) => {
          if (q.options && Array.isArray(q.options) && typeof q.options[0] === 'string') {
            return {
              ...q,
              options: q.options.map((opt: string, i: number) => ({
                text: opt,
                correct: i === (q.bonneReponse ?? q.correct ?? 0),
              })),
            };
          }
          return q;
        });
      }

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id,
        title: training.title || title || 'Formation générée',
        tagline: training.tagline || '',
        source: isFromDocs ? 'documents' : 'prompt',
        sourceInfo: {
          title, description, audience, level, sector, deliveryMode, format, style, gamification,
          files: files.map(f => ({ name: f.originalname, size: f.size })),
        },
        audience: audience || 'all',
        gamificationLevel: gamification || 'light',
        content: training,
        scope: resolveScope(req),
      });

      res.json({ training, id });
    } catch (error: any) {
      console.error('[Studio V2] Erreur génération:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de la génération. Réessayez.' });
    }
  });

  // POST /api/studio/v2/chat — Chatbot IA libre pour collecter le brief
  app.post("/api/studio/v2/chat", async (req: Request, res: Response) => {
    try {
      const { messages, brief, systemOverride } = req.body;
      if (!messages) return res.status(400).json({ error: 'messages requis' });

      // systemOverride permet au client d'injecter un prompt système différent (ex: générateur v2)
      if (systemOverride) {
        const aiResponse = await openAIService.getChatCompletion(
          [{ role: 'system', content: systemOverride }, ...messages],
          0.7, 800
        );
        return res.json({ message: aiResponse, briefReady: false });
      }

      const system = `Tu es un expert en ingénierie pédagogique et en conception de formations professionnelles. Tu aides à co-créer une formation sur mesure.

TON RÔLE : Mener une vraie conversation intelligente pour comprendre précisément le besoin. Tu n'es PAS un formulaire avec des cases à cocher. Tu es un expert qui pose les bonnes questions, rebondit sur les réponses, creuse là où c'est nécessaire.

CE QUE TU DOIS DÉCOUVRIR (naturellement, dans l'ordre logique) :
1. Le sujet exact et son périmètre
2. Le public cible (métier, niveau, secteur d'activité — transport, énergie, banque, santé, conseil, etc.)
3. Le niveau de maîtrise actuel du public sur ce sujet
4. Les objectifs concrets (ce qu'ils doivent savoir faire à la fin)
5. Les cas d'usage réels, les erreurs fréquentes, les situations typiques
6. Le mode (autoformation ou présentiel) et la durée souhaitée
7. Le contexte spécifique (problème récent, enjeu business, contrainte)

COMMENT CONVERSER :
- Pose UNE question à la fois, bien formulée
- Reformule et confirme ce que tu as compris avant d'avancer
- Pose des questions de précision si la réponse est vague
- Enrichis avec ce que tu sais du domaine ("Dans le secteur de l'énergie, j'imagine que...")
- Quand tu as assez d'info, propose un récapitulatif structuré et demande validation

QUAND TU AS TOUT : Réponds avec un JSON spécial dans ta réponse en marquant clairement la fin du brief :
<<BRIEF_READY>>{"title":"...","audience":"...","level":"beginner|intermediate|advanced|expert","deliveryMode":"self|trainer","format":"15|30|45|90","sector":"...","internalContext":"..."}<<END_BRIEF>>

Jusqu'à ce moment, réponds en texte naturel uniquement, PAS de JSON.

Brief collecté jusqu'ici : ${JSON.stringify(brief || {})}`;

      const aiResponse = await openAIService.getChatCompletion(
        [{ role: 'system', content: system }, ...messages],
        0.8, 1000
      );

      // Détecter si le brief est prêt
      const briefMatch = aiResponse.match(/<<BRIEF_READY>>([\s\S]*?)<<END_BRIEF>>/);
      if (briefMatch) {
        try {
          const briefData = JSON.parse(briefMatch[1]);
          const cleanText = aiResponse.replace(/<<BRIEF_READY>>[\s\S]*?<<END_BRIEF>>/, '').trim();
          return res.json({ message: cleanText, briefReady: true, brief: briefData });
        } catch {}
      }

      return res.json({ message: aiResponse, briefReady: false });
    } catch (error: any) {
      console.error('[Studio Chat] Erreur:', error?.message);
      res.status(500).json({ error: 'Erreur chatbot' });
    }
  });

  // POST /api/studio/v2/cobuild — Génère UNE situation à la fois pour la co-construction
  app.post("/api/studio/v2/cobuild", (req, res, next) => {
    uploadStudioV2(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const {
        title, audience, level, deliveryMode, format, sector,
        internalContext, language, situationIndex, previousSituations
      } = req.body;

      if (!title) return res.status(400).json({ error: 'Titre requis' });

      // ── Mode leçon globale ────────────────────────────────────────────────
      const { mode } = req.body;
      if (mode === 'global-lesson') {
        const sysMsg = { role: 'system' as const, content: 'Tu es un expert pédagogue et vulgarisateur. Tu écris des leçons complètes, rédigées en prose, accessibles et engageantes. Réponds uniquement en JSON valide, sans markdown.' };

        const audienceStr = ({ all: 'tous les collaborateurs', managers: 'les managers', technical: 'les techniciens et développeurs', sales: 'les commerciaux', newcomers: 'les nouveaux arrivants', executives: 'les dirigeants' } as any)[audience] || audience || 'des professionnels';
        const levelStr = ({ beginner: 'débutant (aucune connaissance préalable)', intermediate: 'intermédiaire', advanced: 'avancé', expert: 'expert' } as any)[level] || 'intermédiaire';
        const sectorStr = sector ? `dans le secteur ${sector}` : '';

        const lessonPrompt = `Génère une leçon théorique complète sur "${title}" pour ${audienceStr} de niveau ${levelStr}${sectorStr ? ', ' + sectorStr : ''}.

La leçon doit être une VRAIE LEÇON RÉDIGÉE — pas des bullet points, mais de vrais paragraphes explicatifs, clairs et engageants, comme un professeur expert qui explique à des adultes.

Structure exacte : 6 slides dans cet ordre :

SLIDE 1 — type "hook" : L'accroche — pourquoi ce sujet change tout pour ce public.
- "body": UN paragraphe de 3-4 phrases percutantes. Commence par un fait marquant ou une situation concrète que ce public vit. Explique l'enjeu réel.

SLIDE 2 — type "concept" : Les fondamentaux — le concept central expliqué de zéro.
- "body": UN paragraphe de 4-5 phrases. Définit clairement le concept, sans jargon ou en expliquant chaque terme technique. Donne le "comment ça marche" en termes simples.

SLIDE 3 — type "deep-dive" : Pour aller plus loin — les mécanismes importants à connaître.
- "body": UN paragraphe de 4-5 phrases. Approfondissement : les nuances, les cas particuliers, ce qu'il faut vraiment comprendre pour ne pas se tromper.

SLIDE 4 — type "real-world" : Dans la vraie vie${sectorStr ? ' ' + sectorStr : ''} — comment ça se passe concrètement.
- "body": UN paragraphe de 4-5 phrases. Exemple réel et spécifique au secteur${sector ? ` "${sector}"` : ''}. Nomme une entreprise, une situation, un résultat.

SLIDE 5 — type "pitfalls" : Les erreurs à éviter — ce que les débutants font systématiquement mal.
- "body": UN paragraphe de 3-4 phrases. Les 2-3 erreurs les plus fréquentes, pourquoi elles arrivent, comment les éviter.

SLIDE 6 — type "quiz" : Vérification de compréhension.
- "question": Une question ouverte sur un point fondamental de la leçon.
- "options": 3 options (une seule correcte), chacune avec un "feedback" explicatif de 1-2 phrases.

Réponds UNIQUEMENT en JSON :
{"title":"<titre accrocheur>","subtitle":"<sous-titre qui donne envie>","slides":[
{"type":"hook","title":"<titre slide 1>","body":"<paragraphe rédigé>"},
{"type":"concept","title":"<titre slide 2>","body":"<paragraphe rédigé>"},
{"type":"deep-dive","title":"<titre slide 3>","body":"<paragraphe rédigé>"},
{"type":"real-world","title":"<titre slide 4>","body":"<paragraphe rédigé>"},
{"type":"pitfalls","title":"<titre slide 5>","body":"<paragraphe rédigé>"},
{"type":"quiz","title":"Vérification","question":"<question>","options":[{"text":"<option>","correct":false,"feedback":"<explication>"},{"text":"<option correcte>","correct":true,"feedback":"<explication>"},{"text":"<option>","correct":false,"feedback":"<explication>"}]}
]}`;

        const raw = await openAIService.getChatCompletion([sysMsg, { role: 'user', content: lessonPrompt }], 0.75, 6000);
        const parseJ = (s: string) => {
          try { return JSON.parse(s); } catch {}
          try { const c = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(); const i = c.indexOf('{'); const j = c.lastIndexOf('}'); return i !== -1 ? JSON.parse(c.slice(i, j + 1)) : null; } catch {}
          return null;
        };
        const lesson = parseJ(raw);
        console.log('[Cobuild global-lesson] ok:', !!lesson, '| slides:', lesson?.slides?.length, '| first type:', lesson?.slides?.[0]?.type);
        return res.json({ lesson });
      }

      const idx = parseInt(situationIndex || '0');
      const prevSits: any[] = previousSituations ? JSON.parse(previousSituations) : [];
      const files = req.files as Express.Multer.File[] || [];

      let docsContext = '';
      if (files.length > 0) {
        const extracted = await Promise.all(files.map(f => extractDocumentText(f)));
        docsContext = extracted.map((e, i) => `=== Document ${i + 1} ===\n${e.text}`).join('\n\n').slice(0, 30000);
      }

      const audienceLabels: Record<string, string> = { all: 'tous les collaborateurs', managers: 'managers', technical: 'techniciens/développeurs', sales: 'commerciaux', newcomers: 'nouveaux arrivants', executives: 'dirigeants' };
      const levelLabels: Record<string, string> = { beginner: 'débutant', intermediate: 'intermédiaire', advanced: 'avancé', expert: 'expert' };

      const usedTypes = prevSits.map(s => s.interactionType);
      const availableTypes = ['free-text', 'qcm', 'fill-blank', 'checkbox', 'sql-console', 'python-console', 'cyber-terminal'];

      // Suggérer un type d'interaction intelligent selon le domaine et l'index
      const text = (title + ' ' + (sector || '') + ' ' + (internalContext || '')).toLowerCase();
      let suggestedType = 'free-text';
      if (/sql|base de données|requête|mysql|postgresql|data/i.test(text) && !usedTypes.includes('sql-console')) suggestedType = 'sql-console';
      else if (/python|pandas|numpy|script|code|algorithme/i.test(text) && !usedTypes.includes('python-console')) suggestedType = 'python-console';
      else if (/cyber|phishing|sécurité|terminal|linux|bash|ssh|nmap/i.test(text) && !usedTypes.includes('cyber-terminal')) suggestedType = 'cyber-terminal';
      else if (idx === 0) suggestedType = 'free-text';
      else if (idx === 1) suggestedType = 'fill-blank';
      else if (idx === 2) suggestedType = 'checkbox';
      else if (idx % 3 === 0) suggestedType = 'qcm';
      else suggestedType = availableTypes[idx % availableTypes.length];

      const isTrainer = deliveryMode === 'trainer';

      const prompt = `Tu es un expert en ingénierie pédagogique. Génère UNE SEULE situation professionnelle pour une formation.

BRIEF :
- Sujet : ${title}
- Public : ${audienceLabels[audience] || audience || 'professionnels'}
- Niveau : ${levelLabels[level] || level || 'intermédiaire'}
- Mode : ${isTrainer ? 'présentiel avec formateur' : 'autoformation'}
- Durée : ${format || '30'} minutes
${sector ? `- Secteur : ${sector}` : ''}
${internalContext ? `- Contexte interne : ${internalContext}` : ''}
${docsContext ? `\nSOURCE DOCUMENTAIRE :\n${docsContext.slice(0, 15000)}` : ''}

SITUATIONS DÉJÀ CONSTRUITES (${prevSits.length}) :
${prevSits.length > 0 ? prevSits.map((s, i) => `${i + 1}. "${s.title}" [${s.interactionType}] — ${s.category}`).join('\n') : 'Aucune — c\'est la première'}

INSTRUCTIONS :
- Cette situation est la n°${idx + 1}
- Type d'interaction SUGGÉRÉ : ${suggestedType}
- Choisir une CATÉGORIE différente des situations précédentes
- Contexte professionnel réaliste avec un prénom et une fonction
- Le type d'interaction doit être cohérent avec le contenu

${suggestedType === 'sql-console' ? `Pour le type sql-console :
- situation : décrit le problème à résoudre avec SQL (contexte métier réel)
- attendu : la ou les requêtes SQL attendues
- interactionConfig.starterCode : une requête SQL de départ partielle à compléter
- interactionConfig.schema : les tables disponibles (ex: "users(id, name, email), orders(id, user_id, amount, date)")
- interactionConfig.hint : un indice optionnel` : ''}
${suggestedType === 'python-console' ? `Pour le type python-console :
- situation : le problème à résoudre en Python
- attendu : la logique Python attendue
- interactionConfig.starterCode : code Python de départ à compléter
- interactionConfig.hint : indice optionnel` : ''}
${suggestedType === 'cyber-terminal' ? `Pour le type cyber-terminal :
- situation : scénario cyber avec commandes terminal
- attendu : les commandes et actions attendues
- interactionConfig.starterCode : premières commandes déjà exécutées (contexte)
- interactionConfig.hint : indice optionnel` : ''}
${suggestedType === 'fill-blank' ? `Pour le type fill-blank :
- situation : une phrase ou un texte avec des BLANCS marqués [___]
- attendu : les mots/valeurs attendus dans l'ordre des blancs
- interactionConfig.blanks : ["réponse1", "réponse2"]` : ''}
${suggestedType === 'checkbox' ? `Pour le type checkbox :
- situation : une question avec plusieurs propositions
- attendu : liste les bonnes réponses
- interactionConfig.options : [{"text": "...", "correct": true/false}, ...]` : ''}
${suggestedType === 'qcm' ? `Pour le type qcm :
- situation : la question QCM
- attendu : explication de la bonne réponse
- interactionConfig.options : [{"text": "...", "correct": true/false}, ...]
- interactionConfig.explanation : explication développée` : ''}

Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{
  "id": ${idx + 1},
  "category": "Catégorie thématique précise",
  "title": "Titre court et accrocheur",
  "contexte": "Fait clé ou règle fondamentale en 1-2 phrases",
  "situation": "Situation détaillée avec personnage et contexte professionnel réel (4-5 phrases)",
  "attendu": "Ce que le participant doit produire ou maîtriser",
  "interactionType": "${suggestedType}",
  "interactionConfig": {},
  ${isTrainer ? `"trainerNote": "Animation suggérée | Question de débrief | Activité groupe optionnelle",` : ''}
  "status": "pending"
}`;

      const aiResponse = await openAIService.getChatCompletion([
        { role: 'system', content: 'Tu es un expert en ingénierie pédagogique. Réponds uniquement en JSON valide, sans markdown, sans texte avant ou après.' },
        { role: 'user', content: prompt },
      ], 0.7, 3000);

      const parse = (s: string) => {
        try { return JSON.parse(s); } catch {}
        try { const c = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(); const i = c.indexOf('{'); const j = c.lastIndexOf('}'); return i !== -1 ? JSON.parse(c.slice(i, j + 1)) : null; } catch {}
        return null;
      };

      const situation = parse(aiResponse);
      if (!situation) return res.status(500).json({ error: 'Parsing JSON échoué' });

      res.json({ situation });
    } catch (error: any) {
      console.error('[Studio Cobuild] Erreur:', error?.message);
      res.status(500).json({ error: 'Erreur lors de la génération de la situation' });
    }
  });

  // POST /api/studio/v2/finalize — Finalise la formation cobuild (ajoute QCM + sauvegarde)
  app.post("/api/studio/v2/finalize", (req, res, next) => {
    uploadStudioV2(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const { title, audience, level, deliveryMode, format, sector, internalContext, language, situations: situationsJson } = req.body;
      if (!title || !situationsJson) return res.status(400).json({ error: 'Titre et situations requis' });

      const situations = JSON.parse(situationsJson);
      const nbQcm = Math.max(3, Math.min(10, Math.floor(situations.length * 1.5)));

      const parseJson = (s: string) => {
        try { return JSON.parse(s); } catch {}
        try {
          const c = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const i = c.indexOf('{'); const j = c.lastIndexOf('}');
          return i !== -1 ? JSON.parse(c.slice(i, j + 1).replace(/[\x00-\x1F\x7F]/g, ' ')) : null;
        } catch {}
        return null;
      };

      const context = `Formation : "${title}" | Public : ${audience || 'professionnel'} | Niveau : ${level || 'intermédiaire'} | Secteur : ${sector || 'général'}`;

      // ── Appel 1 : métadonnées + QCM ──────────────────────────────────────────
      const promptMeta = `Tu es expert en ingénierie pédagogique. Génère les métadonnées et QCM pour cette formation.

${context}

SITUATIONS : ${situations.map((s: any, i: number) => `${i + 1}. ${s.title}`).join(' | ')}

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{"tagline":"<sous-titre accrocheur max 12 mots spécifique à ${title}>","objectives":["<objectif Bloom 1 spécifique>","<objectif 2>","<objectif 3>","<objectif 4>"],"qcm":[${Array.from({length: nbQcm}).map(() => `{"question":"<question spécifique à ${title}>","options":[{"text":"<option>","correct":false},{"text":"<option correcte>","correct":true},{"text":"<option>","correct":false},{"text":"<option>","correct":false}],"explanation":"<explication 2-3 phrases>"}`).join(',')}]}`;

      // ── Appel 2 : leçon globale ───────────────────────────────────────────────
      const promptGlobal = `Tu es expert en pédagogie et vulgarisation. Génère une leçon introductive sur "${title}" pour ${audience || 'des professionnels'} de niveau ${level || 'intermédiaire'}.

La leçon doit comprendre exactement 5 slides dans cet ordre :
1. type "why-it-matters" — Pourquoi ${title} est crucial pour ${audience || 'ce public'} ? (3 blocs : accroche, chiffre/fait réel, impact concret)
2. type "concept" — Le concept central de ${title} expliqué sans jargon (3 blocs : définition simple, ce que ça signifie en pratique, ce que ce n'est PAS)
3. type "analogy" — Une analogie du quotidien pour rendre ${title} évident (3 blocs : l'analogie, le lien avec ${title}, la leçon)
4. type "example" — Un exemple réel concret du secteur ${sector || 'professionnel'} (3 blocs : la situation, ce qui s'est passé, la leçon)
5. type "quick-check" — Question de compréhension (3 options, une correcte, feedbacks)

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{"title":"<titre accrocheur pour intro ${title}>","subtitle":"<sous-titre>","slides":[{"type":"why-it-matters","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"concept","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"analogy","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"example","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"quick-check","title":"<titre>","question":"<question>","options":[{"text":"<option>","correct":false,"feedback":"<feedback>"},{"text":"<option correcte>","correct":true,"feedback":"<feedback>"},{"text":"<option>","correct":false,"feedback":"<feedback>"}]}]}`;

      // ── Appel 3 : mini-leçons par situation ───────────────────────────────────
      const promptMini = `Tu es expert en pédagogie. Génère une mini-leçon (3 slides) pour chacune des ${situations.length} situations de la formation "${title}".

${situations.map((s: any, i: number) => `SITUATION ${i + 1}: "${s.title}" — ${s.category}\n${s.situation?.slice(0, 150)}`).join('\n\n')}

Pour chaque situation, génère 3 slides :
- Slide 1 type "concept" : Le savoir-faire clé pour réussir CETTE situation (3 blocs : règle principale, pourquoi c'est important, erreur à éviter)
- Slide 2 type "example" : Exemple directement lié à cette situation (3 blocs : contexte similaire, indices, bonne démarche)
- Slide 3 type "quick-check" : Question liée à cette situation (3 options, une correcte, feedbacks)

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{"miniLessons":[${situations.map((s: any) => `{"title":"<titre mini-leçon pour ${s.title.slice(0,30)}>","slides":[{"type":"concept","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"example","title":"<titre>","blocks":["<bloc 1>","<bloc 2>","<bloc 3>"]},{"type":"quick-check","title":"<titre>","question":"<question>","options":[{"text":"<option>","correct":false,"feedback":"<feedback>"},{"text":"<option correcte>","correct":true,"feedback":"<feedback>"},{"text":"<option>","correct":false,"feedback":"<feedback>"}]}]}`).join(',')}]}`;

      const sysMsg = { role: 'system' as const, content: 'Tu es expert en ingénierie pédagogique. Réponds uniquement en JSON valide, sans markdown, sans commentaire. Remplace TOUS les placeholders entre <> par du vrai contenu spécifique.' };

      const [metaRaw, globalRaw, miniRaw] = await Promise.all([
        openAIService.getChatCompletion([sysMsg, { role: 'user', content: promptMeta }], 0.7, 6000),
        openAIService.getChatCompletion([sysMsg, { role: 'user', content: promptGlobal }], 0.7, 4000),
        openAIService.getChatCompletion([sysMsg, { role: 'user', content: promptMini }], 0.7, 6000),
      ]);

      const metaData = parseJson(metaRaw);
      const globalLesson = parseJson(globalRaw);
      const miniData = parseJson(miniRaw);

      console.log('[Finalize] meta ok:', !!metaData, '| global ok:', !!globalLesson, '| mini ok:', !!miniData);
      if (globalLesson) console.log('[Finalize] globalLesson.slides:', globalLesson.slides?.length, '| first slide type:', globalLesson.slides?.[0]?.type);

      const situationsWithLessons = situations.map((s: any, i: number) => ({
        id: s.id,
        category: s.category,
        title: s.title,
        contexte: s.contexte,
        situation: s.situation,
        attendu: s.attendu,
        interactionType: s.interactionType || 'free-text',
        interactionConfig: s.interactionConfig || null,
        trainerNote: s.trainerNote || '',
        miniLesson: miniData?.miniLessons?.[i] || null,
      }));

      const training = {
        title,
        tagline: metaData?.tagline || title,
        deliveryMode: deliveryMode || 'self',
        objectives: metaData?.objectives || [],
        modules: [{ title: 'Module 1', duration: `${format || 30} min`, type: 'Pratique' }],
        globalLesson: globalLesson || null,
        situations: situationsWithLessons,
        qcm: metaData?.qcm || [],
        gamification: { points: 500, badge: 'Expert', levels: ['Novice', 'Praticien', 'Expert'] },
      };

      if (!training) return res.status(500).json({ error: 'Génération échouée' });

      const id = uuidv4();
      await storage.saveGeneratedTraining({
        id, title: training.title || title, tagline: training.tagline || '',
        source: 'cobuild',
        sourceInfo: { title, audience, level, deliveryMode, format, sector },
        audience: audience || 'all', gamificationLevel: 'light',
        content: training,
        scope: resolveScope(req),
      });

      res.json({ id, training });
    } catch (error: any) {
      console.error('[Studio Finalize] Erreur:', error?.message);
      res.status(500).json({ error: 'Erreur lors de la finalisation' });
    }
  });

  // POST /api/studio/v2/adjust — Ajustement IA d'une formation existante
  app.post("/api/studio/v2/adjust", async (req: Request, res: Response) => {
    try {
      const { trainingId, instruction, targetSection } = req.body;
      if (!trainingId || !instruction) {
        return res.status(400).json({ error: 'trainingId et instruction requis' });
      }

      const record = await storage.getGeneratedTraining(trainingId);
      if (!record) return res.status(404).json({ error: 'Formation introuvable' });

      const training = record.content as any;

      const sectionContext = targetSection === 'situations'
        ? `SITUATIONS ACTUELLES :\n${JSON.stringify(training.situations?.slice(0, 3), null, 2)}\n...(${training.situations?.length} situations au total)`
        : targetSection === 'qcm'
        ? `QCM ACTUELS :\n${JSON.stringify(training.qcm?.slice(0, 3), null, 2)}\n...(${training.qcm?.length} questions au total)`
        : `FORMATION COMPLÈTE : "${training.title}" — ${training.situations?.length} situations, ${training.qcm?.length} questions QCM`;

      const prompt = `Tu es un expert en ingénierie pédagogique. Tu dois ajuster une formation existante selon une demande précise.

DEMANDE D'AJUSTEMENT : ${instruction}
SECTION CIBLÉE : ${targetSection || 'formation complète'}
${sectionContext}

TITRE FORMATION : ${training.title}
OBJECTIFS : ${training.objectives?.join(', ')}
MODE : ${training.deliveryMode || 'autoformation'}

Applique l'ajustement demandé et retourne UNIQUEMENT le JSON modifié de la section "${targetSection || 'training'}" (pas la formation complète, juste la section modifiée).

Si targetSection est "situations" → retourne { "situations": [...] }
Si targetSection est "qcm" → retourne { "qcm": [...] }
Si targetSection est "objectives" → retourne { "objectives": [...], "title": "...", "tagline": "..." }
Sinon → retourne la formation complète modifiée avec le même schéma JSON.`;

      const aiResponse = await openAIService.getChatCompletion([
        { role: 'user', content: prompt }
      ], 0.65, 10000);

      const parseRobust = (str: string): any => {
        try { return JSON.parse(str); } catch {}
        try {
          const c = str.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const s = c.indexOf('{'); const e = c.lastIndexOf('}');
          if (s !== -1 && e !== -1) return JSON.parse(c.slice(s, e + 1).replace(/[\x00-\x1F\x7F]/g, ' '));
        } catch {}
        return null;
      };

      const patch = parseRobust(aiResponse);
      if (!patch) return res.status(500).json({ error: 'Impossible d\'ajuster. Réessayez.' });

      // Merger le patch dans la formation existante
      const updated = { ...training, ...patch };

      await storage.saveGeneratedTraining({
        id: trainingId,
        title: updated.title || record.title,
        tagline: updated.tagline || record.tagline,
        source: record.source,
        sourceInfo: record.sourceInfo as any,
        audience: record.audience,
        gamificationLevel: record.gamificationLevel,
        content: updated,
        scope: record.scope,
      });

      res.json({ success: true, training: updated, patch });
    } catch (error: any) {
      console.error('[Studio V2] Erreur ajustement:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de l\'ajustement. Réessayez.' });
    }
  });

  // POST /api/studio/v2/save — Sauvegarde manuelle d'une formation modifiée
  app.post("/api/studio/v2/save", async (req: Request, res: Response) => {
    try {
      const { trainingId, training } = req.body;
      if (!trainingId || !training) return res.status(400).json({ error: 'trainingId et training requis' });

      const existing = await storage.getGeneratedTraining(trainingId);
      if (!existing) return res.status(404).json({ error: 'Formation introuvable' });

      await storage.saveGeneratedTraining({
        id: trainingId,
        title: training.title || existing.title,
        tagline: training.tagline || existing.tagline,
        source: existing.source,
        sourceInfo: existing.sourceInfo as any,
        audience: existing.audience,
        gamificationLevel: existing.gamificationLevel,
        content: training,
        scope: existing.scope,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('[Studio V2] Erreur sauvegarde:', error?.message || error);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde.' });
    }
  });

  // ─── LMS COURSES ────────────────────────────────────────────────────────────
  function requireMakerOrAdmin(req: Request, res: Response, next: any) {
    const user = (req.session as any)?.user;
    if (!user) return res.status(401).json({ error: 'Non authentifié' });
    if (!['maker', 'admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Accès réservé aux rôles Maker et Admin' });
    }
    next();
  }

  app.get('/api/lms/courses', async (req: Request, res: Response) => {
    try {
      const user = (req.session as any)?.user;
      const publishedOnly = !user || !['maker', 'admin', 'superadmin'].includes(user.role);
      const courses = await storage.listLmsCourses(publishedOnly);
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  app.post('/api/lms/courses', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const user = (req.session as any)?.user;
      const { templateId, title, content } = req.body;
      const id = crypto.randomUUID();
      const emptyContent = { chapters: [], scoringEnabled: false, completionMode: 'free' as const };
      const course = await storage.saveLmsCourse({
        id,
        userId: user.id,
        title: title || 'Nouveau cours',
        templateId: templateId || null,
        content: content || emptyContent,
        status: 'draft',
        published: false,
      });
      res.status(201).json(course);
    } catch (err) {
      console.error('[LMS] POST courses', err);
      res.status(500).json({ error: 'Erreur création cours' });
    }
  });

  app.get('/api/lms/courses/:id', async (req: Request, res: Response) => {
    try {
      const course = await storage.getLmsCourse(req.params.id);
      if (!course) return res.status(404).json({ error: 'Cours introuvable' });
      res.json(course);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  app.put('/api/lms/courses/:id', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const { title, description, content, status, estimatedDurationMin, audience, difficulty, coverImageUrl } = req.body;
      const course = await storage.updateLmsCourse(req.params.id, {
        title, description, content, status, estimatedDurationMin, audience, difficulty, coverImageUrl
      });
      if (!course) return res.status(404).json({ error: 'Cours introuvable' });
      res.json(course);
    } catch (err) {
      res.status(500).json({ error: 'Erreur mise à jour' });
    }
  });

  app.patch('/api/lms/courses/:id/publish', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const { published } = req.body;
      const course = await storage.publishLmsCourse(req.params.id, !!published);
      if (!course) return res.status(404).json({ error: 'Cours introuvable' });
      res.json(course);
    } catch (err) {
      res.status(500).json({ error: 'Erreur publication' });
    }
  });

  app.delete('/api/lms/courses/:id', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteLmsCourse(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erreur suppression' });
    }
  });

  // POST /api/lms/media/presigned-url — génère une presigned PUT URL S3
  app.post('/api/lms/media/presigned-url', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const { fileName, fileType, courseId } = req.body;
      if (!fileName || !fileType || !courseId) return res.status(400).json({ error: 'fileName, fileType, courseId requis' });

      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

      const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-3' });
      const bucket = process.env.S3_BUCKET || 'fyne-deploy-845145401592';
      const key = `lms/${courseId}/${crypto.randomUUID()}-${fileName.replace(/[^a-z0-9.\-_]/gi, '_')}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
      });

      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      const publicUrl = `https://${bucket}.s3.eu-west-3.amazonaws.com/${key}`;

      res.json({ presignedUrl, publicUrl, key });
    } catch (err) {
      console.error('[LMS Media] presigned-url', err);
      res.status(500).json({ error: 'Erreur génération URL upload' });
    }
  });

  // POST /api/lms/courses/:id/export/scorm — Export SCORM 1.2 compatible Percipio/Workday
  app.post('/api/lms/courses/:id/export/scorm', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const course = await storage.getLmsCourse(req.params.id);
      if (!course) return res.status(404).json({ error: 'Cours introuvable' });

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const content: any = course.content || { chapters: [] };
      const chapters: any[] = content.chapters || [];
      const title = course.title || 'Formation';
      const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      // Collect all lessons with their page filenames
      const allLessons: { chIdx: number; lIdx: number; chapter: any; lesson: any; file: string }[] = [];
      chapters.forEach((ch: any, ci: number) => {
        (ch.lessons || []).forEach((l: any, li: number) => {
          allLessons.push({ chIdx: ci, lIdx: li, chapter: ch, lesson: l, file: `ch${ci+1}_l${li+1}.html` });
        });
      });

      // shared/styles.css
      const css = `/* FYNE LMS — Percipio/Workday compatible */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#0d0d0d;line-height:1.7}
.lms-wrap{max-width:760px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:28px;font-weight:800;margin-bottom:8px}
h2{font-size:22px;font-weight:700;margin:32px 0 12px}
p{margin-bottom:16px;font-size:15px}
img{max-width:100%;height:auto;display:block;margin:16px auto}
.caption{text-align:center;font-size:12px;color:#6b7280;margin-top:4px;margin-bottom:16px}
video,audio{width:100%;margin:16px 0}
iframe.video-embed{width:100%;aspect-ratio:16/9;border:none;margin:16px 0}
pre{background:#0d1117;color:#e6edf3;padding:20px;overflow:auto;font-size:13px;line-height:1.6;margin:16px 0;font-family:'Courier New',monospace}
blockquote{border-left:4px solid #0057ff;padding:12px 16px;margin:16px 0;font-style:italic;color:#374151;background:#f8faff}
blockquote cite{display:block;margin-top:8px;font-size:13px;font-style:normal;color:#6b7280;font-weight:600}
details{border:1px solid #e5e7eb;margin-bottom:8px}
details summary{padding:12px 16px;cursor:pointer;font-weight:600;font-size:14px;background:#f8f9fa;user-select:none}
details[open] summary{border-bottom:1px solid #e5e7eb}
.details-content{padding:12px 16px;font-size:14px}
.callout{padding:14px 18px;margin:16px 0;border-left:4px solid}
.callout-info{background:#eff6ff;border-color:#0057ff;color:#1e3a8a}
.callout-warning{background:#fffbeb;border-color:#d97706;color:#92400e}
.callout-tip{background:#f0fdf4;border-color:#059669;color:#065f46}
.callout-danger{background:#fef2f2;border-color:#dc2626;color:#991b1b}
.callout-title{font-weight:700;margin-bottom:4px;font-size:14px}
.callout-content{font-size:14px}
.qcm-box{background:#f8f9fa;padding:20px;margin:16px 0}
.qcm-q{font-weight:700;margin-bottom:14px;font-size:15px}
.qcm-opt{display:block;width:100%;text-align:left;padding:10px 14px;margin-bottom:8px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;font-size:14px;transition:border-color .15s}
.qcm-opt:hover{border-color:#0057ff}
.qcm-opt.correct{border-color:#059669;background:#f0fdf4;color:#065f46;font-weight:600}
.qcm-opt.wrong{border-color:#dc2626;background:#fef2f2;color:#991b1b}
.qcm-expl{font-size:13px;color:#6b7280;padding:10px;background:#f9fafb;margin-top:8px;border-left:2px solid #e5e7eb;display:none}
.download-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#0057ff;color:#fff;font-weight:700;font-size:14px;text-decoration:none;margin:16px 0}
.sep-line{border:none;border-top:1px solid #e5e7eb;margin:24px 0}
.sep-dots{text-align:center;color:#9ca3af;font-size:20px;margin:24px 0;letter-spacing:8px}
.nav-bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;z-index:100}
.nav-btn{padding:10px 24px;font-weight:700;font-size:14px;cursor:pointer;border:none}
.nav-btn-prev{background:#f3f4f6;color:#374151}
.nav-btn-next{background:#0057ff;color:#fff}
.lesson-header{border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:32px}
.lesson-title{font-size:24px;font-weight:800}
.lesson-desc{color:#6b7280;font-size:14px;margin-top:6px}
.progress-bar{height:3px;background:#e5e7eb;margin-bottom:32px}
.progress-fill{height:3px;background:#0057ff;transition:width .3s}`;

      // scorm_api.js
      const scormJs = `(function(){
  var API=null,startTime=new Date();
  function findAPI(w){var a=0;while(w){try{if(w.API)return w.API;}catch(e){}try{if(w.opener&&w.opener!==w&&a<5){var r=findAPI(w.opener);if(r)return r;}}catch(e){}try{if(w.parent&&w.parent!==w){w=w.parent;a++;}else break;}catch(e){break;}}return null;}
  function formatTime(ms){var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;return(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(sc<10?'0':'')+sc+'.00';}
  API=findAPI(window);
  window.SCORM={
    init:function(){try{if(API){API.LMSInitialize('');API.LMSSetValue('cmi.core.lesson_status','incomplete');API.LMSCommit('');}}catch(e){}},
    finish:function(score){try{if(API){var e=formatTime(new Date()-startTime);API.LMSSetValue('cmi.core.score.raw',String(Math.round(score||0)));API.LMSSetValue('cmi.core.score.min','0');API.LMSSetValue('cmi.core.score.max','100');API.LMSSetValue('cmi.core.lesson_status',score>=70?'passed':'failed');API.LMSSetValue('cmi.core.session_time',e);API.LMSCommit('');API.LMSFinish('');}}catch(e){}},
    complete:function(){try{if(API){var e=formatTime(new Date()-startTime);API.LMSSetValue('cmi.core.lesson_status','completed');API.LMSSetValue('cmi.core.session_time',e);API.LMSCommit('');API.LMSFinish('');}}catch(e){}},
    suspend:function(){try{if(API){API.LMSSetValue('cmi.core.lesson_status','incomplete');API.LMSSetValue('cmi.core.session_time',formatTime(new Date()-startTime));API.LMSCommit('');API.LMSFinish('');}}catch(e){}},
  };
  window.addEventListener('load',function(){SCORM.init();});
  window.addEventListener('beforeunload',function(){if(!window._scormDone)SCORM.suspend();});
})();`;

      // Helper to render a block to HTML
      function blockToHtml(block: any): string {
        switch (block.type) {
          case 'text': return `<div class="text-block">${block.html || ''}</div>`;
          case 'image': return block.url ? `<figure><img src="${block.url}" alt="${block.alt||''}" />${block.caption?`<figcaption class="caption">${block.caption}</figcaption>`:''}</figure>` : '';
          case 'video': {
            if (!block.url) return '';
            if (block.source === 'youtube') {
              const vid = block.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
              return vid ? `<iframe class="video-embed" src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>` : '';
            }
            if (block.source === 'vimeo') {
              const vid = block.url.match(/vimeo\.com\/(\d+)/)?.[1];
              return vid ? `<iframe class="video-embed" src="https://player.vimeo.com/video/${vid}" allowfullscreen></iframe>` : '';
            }
            return `<video controls><source src="${block.url}" type="video/mp4"></video>`;
          }
          case 'audio': return block.url ? `<audio controls><source src="${block.url}"></audio>${block.title?`<div style="font-size:13px;color:#6b7280;margin-top:4px">${block.title}</div>`:''}` : '';
          case 'code': return `<pre><code>${(block.code||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`;
          case 'accordion': return `<div class="accordion">${(block.items||[]).map((it:any)=>`<details><summary>${it.title||''}</summary><div class="details-content">${it.content||''}</div></details>`).join('')}</div>`;
          case 'quote': return `<blockquote>${block.text||''}${block.author?`<cite>${block.author}${block.role?` · ${block.role}`:''}</cite>`:''}</blockquote>`;
          case 'separator': return block.style==='dots'?`<div class="sep-dots">···</div>`:`<hr class="sep-line">`;
          case 'callout': return `<div class="callout callout-${block.variant||'info'}">${block.title?`<div class="callout-title">${block.title}</div>`:''}<div class="callout-content">${block.content||''}</div></div>`;
          case 'qcm': {
            const qId = `qcm_${block.id}`;
            const opts = (block.options||[]).map((o:any,oi:number)=>`<button class="qcm-opt" data-correct="${o.correct}" onclick="answerQcm('${qId}',this)">${'ABCD'[oi]}. ${o.text}</button>`).join('');
            return `<div class="qcm-box" id="${qId}"><div class="qcm-q">${block.question||''}</div>${opts}${block.explanation?`<div class="qcm-expl" id="${qId}_expl">${block.explanation}</div>`:''}</div>`;
          }
          case 'download': return block.url ? `<a href="${block.url}" class="download-btn" download="${block.fileName||'fichier'}">↓ ${block.fileName||'Télécharger'}</a>` : '';
          default: return '';
        }
      }

      const qcmScript = `<script>function answerQcm(qId,btn){var box=document.getElementById(qId);if(box.dataset.answered)return;box.dataset.answered='1';var btns=box.querySelectorAll('.qcm-opt');btns.forEach(function(b){b.disabled=true;b.classList.add(b.dataset.correct==='true'?'correct':'wrong');});var expl=document.getElementById(qId+'_expl');if(expl)expl.style.display='block';}</script>`;

      // Generate a lesson HTML page
      function lessonToHtml(item: typeof allLessons[0], idx: number): string {
        const { lesson, chapter } = item;
        const blocks: any[] = lesson.blocks || [];
        const progress = Math.round(((idx + 1) / allLessons.length) * 100);
        const prevFile = idx > 0 ? allLessons[idx-1].file : null;
        const nextFile = idx < allLessons.length - 1 ? allLessons[idx+1].file : null;
        const isLast = idx === allLessons.length - 1;

        const blocksHtml = blocks.map(blockToHtml).filter(Boolean).join('\n');

        return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lesson.title||'Leçon'} — ${title}</title>
<link rel="stylesheet" href="shared/styles.css">
<script src="shared/scorm_api.js"></script>
</head>
<body>
<div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
<div class="lms-wrap">
  <div class="lesson-header">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;margin-bottom:4px">${chapter.title||''}</div>
    <div class="lesson-title">${lesson.title||''}</div>
    ${lesson.description ? `<div class="lesson-desc">${lesson.description}</div>` : ''}
  </div>
  ${blocksHtml}
  <div style="height:64px"></div>
</div>
<nav class="nav-bar">
  <span style="font-size:12px;color:#6b7280;font-family:'Courier New',monospace">${idx+1} / ${allLessons.length}</span>
  <div style="display:flex;gap:8px">
    ${prevFile ? `<button class="nav-btn nav-btn-prev" onclick="location.href='${prevFile}'">← Précédent</button>` : '<span></span>'}
    ${isLast
      ? `<button class="nav-btn nav-btn-next" onclick="window._scormDone=true;SCORM.complete();alert('Formation terminée !')">Terminer ✓</button>`
      : `<button class="nav-btn nav-btn-next" onclick="location.href='${nextFile}'">Suivant →</button>`
    }
  </div>
</nav>
${qcmScript}
</body>
</html>`;
      }

      // index.html — course overview
      const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="shared/styles.css">
<script src="shared/scorm_api.js"></script>
</head>
<body>
<div class="lms-wrap">
  <h1>${title}</h1>
  ${course.description ? `<p style="color:#6b7280;margin-bottom:32px">${course.description}</p>` : ''}
  ${chapters.map((ch: any, ci: number) => `
    <h2>${ch.title||`Chapitre ${ci+1}`}</h2>
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:24px">
    ${(ch.lessons||[]).map((l: any, li: number) => {
      const fileIdx = allLessons.findIndex((x: any) => x.chIdx===ci && x.lIdx===li);
      const file = allLessons[fileIdx]?.file || '';
      return `<a href="${file}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid #e5e7eb;text-decoration:none;color:#0d0d0d;font-size:14px;font-weight:500">
        <span style="width:28px;height:28px;background:#0057ff;color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${fileIdx+1}</span>
        ${l.title||`Leçon ${li+1}`}
      </a>`;
    }).join('')}
    </div>
  `).join('')}
  ${allLessons.length > 0 ? `<a href="${allLessons[0].file}" class="download-btn" style="margin-top:16px">Commencer →</a>` : ''}
  <div style="height:32px"></div>
</div>
</body>
</html>`;

      // imsmanifest.xml
      const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="fyne_lms_${safeName}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${title}</title>
      <item identifier="item_overview" identifierref="res_overview" isvisible="true">
        <title>${title}</title>
      </item>
      ${allLessons.map((item: any, i: number) => `<item identifier="item_${i+1}" identifierref="res_${i+1}" isvisible="true">
        <title>${item.lesson.title||`Leçon ${i+1}`}</title>
        <adlcp:masteryscore>70</adlcp:masteryscore>
      </item>`).join('\n      ')}
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_overview" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="shared/styles.css"/>
      <file href="shared/scorm_api.js"/>
    </resource>
    ${allLessons.map((item: any, i: number) => `<resource identifier="res_${i+1}" type="webcontent" adlcp:scormtype="sco" href="${item.file}">
      <file href="${item.file}"/>
    </resource>`).join('\n    ')}
  </resources>
</manifest>`;

      // Build ZIP
      zip.file('imsmanifest.xml', manifest);
      zip.file('shared/styles.css', css);
      zip.file('shared/scorm_api.js', scormJs);
      zip.file('index.html', indexHtml);
      allLessons.forEach((item: any) => {
        const idx = allLessons.indexOf(item);
        zip.file(item.file, lessonToHtml(item, idx));
      });

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_scorm.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.send(zipBuffer);
    } catch (err) {
      console.error('[LMS Export SCORM]', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erreur export SCORM' });
    }
  });

  // POST /api/lms/ai/inspire-block — Génère du contenu IA pour un bloc LMS
  app.post('/api/lms/ai/inspire-block', requireMakerOrAdmin, async (req: Request, res: Response) => {
    try {
      const user = (req.session as any)?.user;
      const { blockType, currentContent, lessonContext, courseTitle, userInstruction, courseId } = req.body;

      const typeSchemas: Record<string, { instruction: string; schema: string }> = {
        text: {
          instruction: 'Rédige un paragraphe HTML de formation clair (150-250 mots), avec <p>, <strong>, <ul>/<li> si pertinent.',
          schema: '{"html": "<p>...</p>"}',
        },
        callout: {
          instruction: 'Génère un encadré pédagogique percutant.',
          schema: '{"variant": "info|warning|tip|danger", "title": "...", "content": "..."}',
        },
        qcm: {
          instruction: 'Génère un QCM pédagogique complet avec 4 options dont UNE SEULE correcte (correct: true). Les mauvaises réponses doivent être plausibles. Ajoute une explication pédagogique.',
          schema: '{"question": "...", "options": [{"id": "1", "text": "...", "correct": false}, {"id": "2", "text": "...", "correct": true}, {"id": "3", "text": "...", "correct": false}, {"id": "4", "text": "...", "correct": false}], "explanation": "..."}',
        },
        qcm_scored: {
          instruction: 'Génère un QCM noté avec 4 options dont UNE SEULE correcte. Ajoute une explication.',
          schema: '{"question": "...", "options": [{"id": "1", "text": "...", "correct": false}, {"id": "2", "text": "...", "correct": true}, {"id": "3", "text": "...", "correct": false}, {"id": "4", "text": "...", "correct": false}], "explanation": "...", "points": 1}',
        },
        accordion: {
          instruction: 'Propose 3 à 4 sections d\'accordéon structurées pour explorer ce sujet.',
          schema: '{"items": [{"title": "...", "content": "..."}, {"title": "...", "content": "..."}, {"title": "...", "content": "..."}]}',
        },
        quote: {
          instruction: 'Propose une citation percutante d\'expert ou un verbatim illustrant ce sujet.',
          schema: '{"text": "...", "author": "...", "role": "..."}',
        },
        code: {
          instruction: 'Génère un exemple de code concret et commenté illustrant ce concept.',
          schema: '{"language": "javascript|python|sql|html|bash", "code": "..."}',
        },
      };

      const typeInfo = typeSchemas[blockType];
      const prompt = `Tu es un expert en ingénierie pédagogique. Tu génères du contenu de formation structuré en JSON.

Cours : "${courseTitle}"
Leçon : "${lessonContext}"
${currentContent ? `Contenu actuel : "${currentContent}"` : ''}
${userInstruction ? `Demande : "${userInstruction}"` : ''}

${typeInfo?.instruction || 'Génère du contenu pertinent pour ce bloc de formation.'}

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide correspondant à ce schéma, sans markdown, sans explication, sans balise :
${typeInfo?.schema || '{"content": "..."}'}`;

      const { bedrockService } = await import('./services/bedrock');
      const rawResult = await bedrockService.getChatCompletion(
        [{ role: 'user', content: prompt }],
        0.7,
        600
      );

      // Extraire le JSON de la réponse (parfois l'IA ajoute des backticks)
      let structured: any = null;
      try {
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
      } catch {}

      // Tracker les tokens
      const estimatedTokens = Math.ceil(prompt.length / 4) + 400;
      if (user?.id) {
        await storage.incrementTokenUsage(user.id, estimatedTokens);
        if (courseId) {
          const costCents = Math.ceil(estimatedTokens * 0.002);
          await storage.addLmsCourseTokens(courseId, estimatedTokens, costCents);
        }
      }

      res.json({ suggestion: rawResult, structured });
    } catch (err) {
      console.error('[LMS AI] inspire-block', err);
      res.status(500).json({ error: 'Erreur génération IA' });
    }
  });

  return createServer(app);
}