import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { AuthController } from "./authController";
import { openAIService, geminiService } from "./services/gemini";
import attachmentRoutes from './routes/attachmentRoutes';
import cyberForgeRoutes from './routes/cyberForgeRoutes';
import cyberToolsRoutes from './routes/cyberToolsRoutes';
import immersiveCrisisRoutes from './routes/immersiveCrisisRoutes';
import prospectPulseRoutes from './routes/prospectPulseRoutes';
import crisisCenterRoutes from './routes/crisisCenterRoutes';
import audioRoutes from './routes/audioRoutes';
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
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'votre-secret-session-ultra-securise-changez-moi',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Mettre à true en production avec HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }
  }));

  // Routes d'authentification
  app.post('/api/auth/login', AuthController.login);
  app.post('/api/auth/logout', AuthController.logout);
  app.get('/api/auth/check', AuthController.checkAuth);

  // Middleware pour protéger toutes les autres routes
  app.use('/api', (req: Request, res: Response, next: any) => {
    // Exclure les routes d'authentification
    if (req.path.startsWith('/auth/')) {
      return next();
    }
    return AuthController.requireAuth(req, res, next);
  });
  
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
        apiKeyType: openAIService.getCurrentApiKeyType(),
        lastCheck: openAIService.getLastConnectionCheck() || Date.now()
      });
    } catch (error) {
      console.error('Error checking API status:', error);
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
  
  // API route pour basculer entre les clés API (Claude 3.5 Sonnet et Claude 3 Haiku)
  app.post('/api/cyber/switch-api-key', (req: Request, res: Response) => {
    try {
      const { keyType } = req.body;
      
      if (keyType !== 'primary' && keyType !== 'secondary') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid key type. Must be "primary" or "secondary"'
        });
      }
      
      // Basculer réellement vers le type de clé demandé
      openAIService.switchApiKey(keyType);
      
      // Récupérer le nom du modèle en fonction du type de clé
      const modelName = 'Gemini FYNE';
      console.log(`Switched API key to ${keyType} (${modelName})`);
      
      res.json({
        status: 'success',
        currentApiKey: keyType,
        modelName: modelName
      });
    } catch (error) {
      console.error('Error switching API key:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to switch API key'
      });
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
      { category:'phishing-banque', title:'Alerte urgente Crédit Agricole', context:'Vous venez de recevoir cet email de votre banque.', visual:{type:'email',from:'Crédit Agricole Sécurité',fromEmail:'securite@credit-agricole-alerte.net',subject:'Action requise : compte suspendu',body:'Cher(e) client(e),\n\nNous avons détecté une activité suspecte sur votre compte. Votre accès a été temporairement suspendu.\n\nConfirmez votre identité dans les 24h pour éviter la clôture définitive.\n\nCordialement,\nService Sécurité Crédit Agricole',hasClickableLink:true,linkLabel:'Confirmer mon identité',linkUrl:'https://credit-agricole-secure-verify.account-confirm.net/login'}, choices:[{label:'Je clique pour débloquer mon compte',isCorrect:false,feedback:'Vous venez de transmettre vos identifiants bancaires à des criminels.',points:-5},{label:'Je vais directement sur credit-agricole.fr',isCorrect:true,feedback:'Parfait ! Toujours saisir l\'URL officielle de votre banque manuellement.',points:10},{label:'Je rappelle le numéro dans l\'email',isCorrect:false,feedback:'Dangereux ! Ce numéro appartient aussi aux fraudeurs.',points:-5}], reflexe:'Ne jamais cliquer sur un lien bancaire — tapez toujours l\'URL manuellement.', clickConsequence:'Une fausse page bancaire identique à l\'originale capture vos identifiants.', redFlags:['Adresse email n\'est pas credit-agricole.fr','Urgence artificielle (24h)','Domaine suspect : account-confirm.net'] },
      { category:'sms-colis', title:'Colis non livré La Poste', context:'Vous attendez un colis. Ce SMS vient d\'arriver.', visual:{type:'sms',from:'La Poste 📦',body:'Votre colis REF-FR2847291 est en attente. Des frais de douane de 1,99€ sont requis. Réglez maintenant :\nhttps://laposte-relivraison.compte-client-fr.com/pay',hasClickableLink:true,linkLabel:'https://laposte-relivraison.compte-client-fr.com/pay',linkUrl:'https://laposte-relivraison.compte-client-fr.com/pay'}, choices:[{label:'Je paie les 1,99€, c\'est peu',isCorrect:false,feedback:'Vos coordonnées bancaires sont maintenant chez des fraudeurs.',points:-5},{label:'Je contacte La Poste via laposte.fr',isCorrect:true,feedback:'Excellent ! La Poste ne demande jamais de paiement par SMS.',points:10},{label:'J\'ignore le SMS sans le signaler',isCorrect:false,feedback:'Mieux que cliquer, mais signalez au 33700 pour protéger les autres.',points:-5}], reflexe:'La Poste ne réclame jamais de frais par SMS. Signaler au 33700.', clickConsequence:'Vos coordonnées bancaires sont volées via une fausse page de paiement.', redFlags:['Domaine n\'est pas laposte.fr','La Poste n\'envoie pas de demandes de paiement par SMS','Montant faible pour ne pas éveiller les soupçons'] },
      { category:'vishing-microsoft', title:'Le technicien Microsoft vous appelle', context:'Vous recevez un appel inattendu.', visual:{type:'phone-call',from:'+33 1 76 49 12 38',body:'Bonjour, je suis Kevin Bernard du support technique Microsoft. Nos systèmes ont détecté un virus critique sur votre ordinateur — il envoie des données à des serveurs en Russie en ce moment. Je dois intervenir à distance immédiatement. Pouvez-vous télécharger TeamViewer et me donner votre code d\'accès ? C\'est urgent.',hasClickableLink:false}, choices:[{label:'Je télécharge TeamViewer et donne le code',isCorrect:false,feedback:'L\'escroc contrôle maintenant votre PC et vole vos mots de passe et données bancaires.',points:-5},{label:'Je raccroche et appelle le support officiel',isCorrect:true,feedback:'Parfait ! Microsoft ne contacte jamais les utilisateurs spontanément.',points:10},{label:'Je donne accès mais surveille l\'écran',isCorrect:false,feedback:'Ils peuvent installer des malwares invisibles en quelques secondes.',points:-5}], reflexe:'Microsoft ne vous appelle jamais. Raccrochez immédiatement.', redFlags:['Microsoft ne contacte jamais les utilisateurs sans demande préalable','Urgence inventée pour provoquer la panique','Demande d\'accès à distance = alarme maximale'] },
      { category:'popup-virus', title:'Alerte virus dans votre navigateur', context:'Une popup s\'affiche pendant votre navigation.', visual:{type:'browser-popup',subject:'⚠️ ALERTE SÉCURITÉ WINDOWS — Action requise',body:'Votre PC est infecté par 3 virus critiques !\n\nVos fichiers sont en cours de chiffrement.\nVotre webcam est peut-être activée.\n\nAppellez immédiatement le 0800 912 000 (gratuit) ou installez la mise à jour de sécurité ci-dessous.',hasClickableLink:true,linkLabel:'Télécharger la mise à jour d\'urgence',linkUrl:'https://windows-security-critical-update.com/setup.exe'}, choices:[{label:'Je télécharge la mise à jour',isCorrect:false,feedback:'Vous venez d\'installer un ransomware. Vos fichiers vont être chiffrés.',points:-5},{label:'Je ferme la popup et lance mon antivirus',isCorrect:true,feedback:'Parfait ! Windows n\'alerte jamais via le navigateur.',points:10},{label:'J\'appelle le numéro affiché',isCorrect:false,feedback:'Numéro surtaxé à plusieurs euros la minute.',points:-5}], reflexe:'Les vraies alertes Windows ne passent JAMAIS par le navigateur.', clickConsequence:'Le fichier installe un ransomware qui chiffre vos documents et réclame une rançon.', redFlags:['Windows n\'alerte pas via le navigateur','Panique volontaire : urgence absolue','URL n\'est pas microsoft.com'] },
      { category:'phishing-paypal', title:'Votre compte PayPal suspendu', context:'Vous recevez cet email PayPal.', visual:{type:'email',from:'Service PayPal',fromEmail:'service@paypal-securite-compte.com',subject:'Votre compte a été limité — action requise',body:'Cher utilisateur PayPal,\n\nNous avons identifié une activité inhabituelle sur votre compte. Pour protéger votre argent, nous avons limité certaines fonctionnalités.\n\nPour lever la restriction, confirmez vos informations de paiement.\n\nPayPal Service Client',hasClickableLink:true,linkLabel:'Confirmer mes informations',linkUrl:'https://paypal-securite-compte.fr/confirm'}, choices:[{label:'Je confirme mes infos de paiement',isCorrect:false,feedback:'Vos données de carte bancaire sont désormais entre les mains de fraudeurs.',points:-5},{label:'Je me connecte sur paypal.com directement',isCorrect:true,feedback:'Parfait ! PayPal ne demande jamais de confirmation via email.',points:10},{label:'Je transfère l\'email à PayPal pour vérification',isCorrect:false,feedback:'Bien d\'y penser, mais agissez d\'abord en allant sur le site officiel.',points:-5}], reflexe:'Connectez-vous toujours directement sur paypal.com, jamais via un lien email.', clickConsequence:'Une fausse page PayPal vole votre numéro de carte et votre solde.', redFlags:['Domaine paypal-securite-compte.com pas paypal.com','PayPal ne demande jamais les infos CB par email','Logo imité mais domaine frauduleux'] },
      { category:'sms-loterie', title:'Vous avez gagné 500€ !', context:'Vous recevez ce SMS surprise.', visual:{type:'sms',from:'FDJ Officiel 🎰',body:'Félicitations ! Vous avez été sélectionné pour recevoir 500€. Pour réclamer votre gain avant expiration (24h), cliquez ici : https://fdj-gains-fr.win/reclamer?id=FR8742',hasClickableLink:true,linkLabel:'https://fdj-gains-fr.win/reclamer?id=FR8742',linkUrl:'https://fdj-gains-fr.win/reclamer?id=FR8742'}, choices:[{label:'Je clique pour réclamer mes 500€',isCorrect:false,feedback:'Ce site demande vos coordonnées bancaires pour "virer" le gain. Vous perdez de l\'argent.',points:-5},{label:'J\'ignore et supprime le SMS',isCorrect:true,feedback:'Parfait ! Vous ne pouvez pas gagner à une loterie à laquelle vous n\'avez pas joué.',points:10},{label:'Je transfère à des amis pour partager la bonne nouvelle',isCorrect:false,feedback:'Vous propagez l\'arnaque à vos contacts.',points:-5}], reflexe:'On ne gagne jamais une loterie à laquelle on n\'a pas participé.', clickConsequence:'Le site demande vos données bancaires pour "virer le gain". Vous êtes prélevé.', redFlags:['Vous n\'avez pas joué à la FDJ','Urgence artificielle (24h)','Domaine .win pas fdj.fr'] },
      { category:'phishing-amazon', title:'Votre compte Amazon bloqué', context:'Vous êtes client Amazon. Cet email vient d\'arriver.', visual:{type:'email',from:'Amazon.fr',fromEmail:'no-reply@amazon-securite-fr.com',subject:'Votre commande a été suspendue — Vérification requise',body:'Bonjour,\n\nUne anomalie a été détectée lors de votre dernière commande. Votre compte Amazon a été temporairement suspendu.\n\nPour rétablir l\'accès et éviter l\'annulation de vos commandes en cours, vérifiez vos informations de paiement.\n\nAmazon Service Client',hasClickableLink:true,linkLabel:'Vérifier mon compte Amazon',linkUrl:'https://amazon-securite-fr.com/account/verify'}, choices:[{label:'Je vérifie mes infos de paiement via le lien',isCorrect:false,feedback:'Vos identifiants Amazon et données bancaires sont volés.',points:-5},{label:'Je vais sur amazon.fr pour vérifier',isCorrect:true,feedback:'Parfait ! Connectez-vous toujours directement sur amazon.fr.',points:10},{label:'Je réponds à l\'email pour demander des précisions',isCorrect:false,feedback:'Vous confirmez que votre adresse est active. Les fraudeurs redoublent d\'efforts.',points:-5}], reflexe:'Connectez-vous directement sur amazon.fr — jamais via un lien email.', clickConsequence:'Fausse page Amazon qui capture vos identifiants et coordonnées de carte.', redFlags:['Domaine amazon-securite-fr.com pas amazon.fr','Amazon ne suspend pas les comptes par email','Urgence sur les commandes en cours'] },
      { category:'sms-impots', title:'Remboursement impôts par SMS', context:'Vous recevez ce SMS des impôts.', visual:{type:'sms',from:'Impôts.gouv',body:'DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES : Vous avez un remboursement de 187,00€ en attente. Réclamez-le avant le 31/03 : https://impots-gouv-remboursement.fr/reclamer',hasClickableLink:true,linkLabel:'https://impots-gouv-remboursement.fr/reclamer',linkUrl:'https://impots-gouv-remboursement.fr/reclamer'}, choices:[{label:'Je réclame mon remboursement',isCorrect:false,feedback:'Vos coordonnées bancaires servent à vider votre compte, pas à vous rembourser.',points:-5},{label:'Je vérifie sur impots.gouv.fr',isCorrect:true,feedback:'Parfait ! Les impôts remboursent directement sur votre compte, jamais via SMS.',points:10},{label:'Je transfère à un ami qui a eu le même SMS',isCorrect:false,feedback:'Vous propagez l\'arnaque.',points:-5}], reflexe:'Les impôts remboursent automatiquement — ils n\'envoient jamais de SMS.', clickConsequence:'Le site vole vos données bancaires sous prétexte de "virer le remboursement".', redFlags:['Les impôts ne préviennent pas par SMS','Domaine pas impots.gouv.fr','Un vrai remboursement se fait automatiquement'] },
      { category:'phishing-apple', title:'Votre iPhone volé à distance', context:'Vous recevez cet email Apple urgent.', visual:{type:'email',from:'Apple Support',fromEmail:'support@apple-securite-icloud.com',subject:'Votre iPhone a été signalé volé — Action immédiate',body:'Cher client Apple,\n\nVotre iPhone a déclenché une alerte de sécurité depuis un pays étranger. Pour protéger vos données et bloquer l\'appareil, connectez-vous à votre compte iCloud.\n\nSi vous ne réagissez pas dans l\'heure, votre compte sera verrouillé définitivement.\n\nApple Security',hasClickableLink:true,linkLabel:'Protéger mon compte iCloud',linkUrl:'https://apple-securite-icloud.com/signin'}, choices:[{label:'Je me connecte via le lien pour bloquer mon iPhone',isCorrect:false,feedback:'Vous venez de donner vos identifiants Apple ID à des fraudeurs.',points:-5},{label:'Je vais sur appleid.apple.com directement',isCorrect:true,feedback:'Parfait ! La gestion des appareils Apple se fait toujours sur le site officiel.',points:10},{label:'J\'appelle Apple immédiatement',isCorrect:false,feedback:'Cherchez le vrai numéro Apple sur apple.com, pas dans cet email.',points:-5}], reflexe:'Connectez-vous toujours sur appleid.apple.com, jamais via un lien email.', clickConsequence:'Fausse page iCloud identique à l\'originale qui vole votre Apple ID et accède à vos données.', redFlags:['Domaine apple-securite-icloud.com pas apple.com','Apple n\'envoie pas d\'alertes urgentes par email','Urgence de 1 heure inventée'] },
      { category:'wifi-public', title:'WiFi gratuit à l\'aéroport', context:'Vous êtes à l\'aéroport, en attente de votre vol.', visual:{type:'browser-popup',subject:'Réseaux WiFi disponibles',body:'CDG_AirportFree — Signal fort — Gratuit\nCDG_Free_Passengers — Signal fort — Gratuit\nCDG_Lounge_Premium — Signal moyen — Gratuit\n\nVous vous connectez à CDG_AirportFree et consultez vos emails professionnels et votre application bancaire.',hasClickableLink:false}, choices:[{label:'Je travaille normalement, c\'est le WiFi officiel',isCorrect:false,feedback:'N\'importe qui peut créer un réseau nommé "CDG_AirportFree". Vos données transitent en clair.',points:-5},{label:'J\'active mon VPN avant de consulter quoi que ce soit',isCorrect:true,feedback:'Parfait ! Le VPN chiffre tout votre trafic même sur un réseau compromis.',points:10},{label:'Je consulte seulement les sites en https://',isCorrect:false,feedback:'Bien, mais insuffisant sur un faux réseau WiFi. Le VPN est essentiel.',points:-5}], reflexe:'VPN obligatoire sur tout WiFi public — vos données transitent autrement en clair.', redFlags:['Plusieurs réseaux avec des noms similaires','Pas d\'authentification requise','WiFi public = réseau non sécurisé par défaut'] },
      { category:'piece-jointe-exe', title:'Facture EDF en pièce jointe', context:'Vous recevez cet email d\'EDF.', visual:{type:'email',from:'EDF Facturation',fromEmail:'facture@edf-espace-client-fr.com',subject:'Votre facture d\'électricité — Janvier',body:'Bonjour,\n\nVeuillez trouver en pièce jointe votre facture d\'électricité de janvier.\n\nMontant prélevé : 134,87€\n\nCordialement,\nEDF Service Client',hasClickableLink:true,linkLabel:'📎 Facture_EDF_01-2024.pdf.exe',linkUrl:''}, choices:[{label:'J\'ouvre la pièce jointe',isCorrect:false,feedback:'Le .exe installe un ransomware. Vos fichiers sont maintenant chiffrés.',points:-5},{label:'Je vérifie sur mon espace client edf.fr',isCorrect:true,feedback:'Parfait ! Consultez vos factures uniquement depuis l\'espace client officiel.',points:10},{label:'J\'envoie la facture à un collègue pour vérifier',isCorrect:false,feedback:'Vous propagez le malware à votre collègue.',points:-5}], reflexe:'Extension .exe dans une facture = malware. Allez sur edf.fr directement.', clickConsequence:'Ransomware installé — vos fichiers sont chiffrés, une rançon de 500€ est demandée.', redFlags:['Extension .pdf.exe (pas un vrai PDF)','Adresse email pas edf.fr','EDF n\'envoie pas de fichiers .exe'] },
      { category:'arnaque-cadeau', title:'Félicitations, vous avez été sélectionné !', context:'Vous recevez cet email surprise.', visual:{type:'email',from:'Samsung Rewards France',fromEmail:'rewards@samsung-promotion-fr.net',subject:'🎁 Vous avez été sélectionné pour recevoir un Galaxy S24 !',body:'Félicitations !\n\nEn tant que client fidèle, vous avez été sélectionné pour recevoir un Samsung Galaxy S24 Ultra GRATUIT.\n\nIl ne reste que 3 téléphones disponibles. Réclamez le vôtre en moins de 10 minutes en payant uniquement les frais de livraison (2,99€).',hasClickableLink:true,linkLabel:'Réclamer mon téléphone gratuit',linkUrl:'https://samsung-promotion-fr.net/galaxy-s24/claim'}, choices:[{label:'Je réclame, 2,99€ c\'est rien pour un tel',isCorrect:false,feedback:'Vous venez de donner votre carte bancaire. Vous serez prélevé de bien plus que 2,99€.',points:-5},{label:'J\'ignore, c\'est trop beau pour être vrai',isCorrect:true,feedback:'Parfait ! Aucune marque ne donne des téléphones gratuits par email.',points:10},{label:'Je transmets à mes amis pour qu\'ils en profitent aussi',isCorrect:false,feedback:'Vous propagez l\'arnaque à vos proches.',points:-5}], reflexe:'Si c\'est trop beau pour être vrai, c\'est une arnaque.', clickConsequence:'Votre carte est enregistrée et vous êtes abonné à des services à 50€/mois.', redFlags:['Samsung ne fait pas de cadeaux par email','Les "frais de livraison" cachent un abonnement','Domaine samsung-promotion-fr.net pas samsung.com'] },
      { category:'ami-argent', title:'Ton ami est bloqué à l\'étranger', context:'Vous recevez ce message WhatsApp d\'un numéro inconnu.', visual:{type:'sms',from:'Numéro inconnu (+44...)',body:'Salut c\'est moi Alexandre ! Mon téléphone est cassé je t\'écris depuis un autre numéro. Je suis coincé à Amsterdam, j\'ai perdu mon portefeuille. J\'ai besoin de 350€ en virement urgent pour rentrer. Je te rembourse dès que je suis rentré promis.',hasClickableLink:false}, choices:[{label:'J\'envoie les 350€, mon ami a besoin de moi',isCorrect:false,feedback:'C\'était un escroc. Le vrai Alexandre était chez lui. Vous perdez 350€.',points:-5},{label:'J\'appelle Alexandre sur son ancien numéro',isCorrect:true,feedback:'Parfait ! Vérifiez toujours par un autre canal avant tout virement.',points:10},{label:'Je demande des détails supplémentaires',isCorrect:false,feedback:'L\'escroc a des réponses préparées. Appelez directement.',points:-5}], reflexe:'Appelez toujours la personne sur son vrai numéro avant d\'envoyer de l\'argent.', redFlags:['Numéro inconnu','Urgence + demande d\'argent = signal d\'alarme','Un ami en difficulté préférera toujours un appel'] },
      { category:'phishing-caf', title:'Votre aide CAF en attente', context:'Vous recevez cet email de la CAF.', visual:{type:'email',from:'CAF — Caisse d\'Allocations Familiales',fromEmail:'contact@caf-france-prestations.com',subject:'Versement de 248€ en attente — Confirmez vos coordonnées',body:'Madame, Monsieur,\n\nSuite au recalcul de vos droits, un versement de 248,00€ vous est dû.\n\nPour recevoir ce virement, veuillez confirmer vos coordonnées bancaires en cliquant ci-dessous dans les 5 jours ouvrés.\n\nService Prestations CAF',hasClickableLink:true,linkLabel:'Confirmer mes coordonnées bancaires',linkUrl:'https://caf-france-prestations.com/coordonnees/update'}, choices:[{label:'Je confirme mes coordonnées pour recevoir les 248€',isCorrect:false,feedback:'Vos coordonnées bancaires sont volées. Vous ne recevrez rien.',points:-5},{label:'Je me connecte sur caf.fr pour vérifier',isCorrect:true,feedback:'Parfait ! La CAF communique via caf.fr et la messagerie de votre espace personnel.',points:10},{label:'J\'appelle le numéro indiqué dans l\'email',isCorrect:false,feedback:'Ce numéro appartient aux fraudeurs.',points:-5}], reflexe:'La CAF ne demande jamais de coordonnées bancaires par email.', clickConsequence:'Vos coordonnées sont revendues ou utilisées pour des prélèvements frauduleux.', redFlags:['Domaine caf-france-prestations.com pas caf.fr','La CAF ne demande pas les coordonnées bancaires par email','Versement surprise non attendu'] },
      { category:'qr-code-restaurant', title:'QR code du menu qui dirige ailleurs', context:'Vous êtes au restaurant et scannez le QR code du menu.', visual:{type:'browser-popup',subject:'Menu du Restaurant Le Mistral',body:'Le QR code redirige vers un formulaire.\n\n"Bienvenue au Restaurant Le Mistral !\n\nPour accéder au menu, veuillez créer votre compte fidélité gratuit :\n— Prénom, Nom\n— Email\n— Numéro de téléphone\n— Mot de passe\n\nVous recevrez 10% de réduction sur votre prochain repas !"',hasClickableLink:true,linkLabel:'Créer mon compte fidélité',linkUrl:'https://restaurant-lemistral-fidelite.com/register'}, choices:[{label:'Je crée mon compte, c\'est gratuit et utile',isCorrect:false,feedback:'Vos données personnelles et votre email sont collectés à des fins commerciales ou revendus.',points:-5},{label:'Je refuse et demande le menu papier',isCorrect:true,feedback:'Parfait ! Un QR code de restaurant ne demande jamais d\'inscription.',points:10},{label:'Je crée un compte avec un faux email',isCorrect:false,feedback:'Bonne intuition, mais mieux vaut refuser complètement.',points:-5}], reflexe:'Un QR code de restaurant ne demande jamais de créer un compte.', redFlags:['Un menu n\'exige pas d\'inscription','Collecte excessive de données personnelles','QR code remplacé potentiellement par quelqu\'un de malveillant'] },
      { category:'facebook-arnaque', title:'Concours Facebook : gagnez un iPhone', context:'Ce post apparaît dans votre fil d\'actualité Facebook.', visual:{type:'social-post',from:'Samsung France — Page vérifiée ✓',body:'🎁 GRAND CONCOURS OFFICIEL SAMSUNG 🎁\n\nPour fêter nos 10 millions de fans, nous offrons 50 iPhone 15 Pro !\n\nPour participer :\n✅ Liker cette page\n✅ Partager ce post\n✅ Commenter "JE PARTICIPE"\n✅ Cliquer ici pour confirmer votre participation\n\nTirage au sort dans 24H !',hasClickableLink:true,linkLabel:'Confirmer ma participation',linkUrl:'https://samsung-concours-officiel.fb-promo.com/participate'}, choices:[{label:'Je participe, les grandes marques organisent souvent des concours',isCorrect:false,feedback:'La page est fausse. Le lien vole vos identifiants Facebook.',points:-5},{label:'Je vérifie que la page est officielle avant de cliquer',isCorrect:true,feedback:'Parfait ! Vérifiez le nombre de followers et la date de création de la page.',points:10},{label:'Je partage sans cliquer sur le lien',isCorrect:false,feedback:'En partageant, vous aidez l\'arnaque à se propager.',points:-5}], reflexe:'Les vrais concours de marques ne demandent pas de cliquer sur des liens externes.', clickConsequence:'Le lien vole vos identifiants Facebook et publie l\'arnaque depuis votre compte.', redFlags:['La vraie page Samsung a des millions de vrais followers','Les marques n\'offrent pas d\'iPhone d\'une marque concurrente','URL externe pas facebook.com/Samsung'] },
      { category:'oversharing-vacances', title:'Vos vacances en direct sur Instagram', context:'Vous êtes en vacances et publiez sur Instagram.', visual:{type:'social-post',from:'Vous (@marie_dupont_paris — profil public)',body:'☀️ J\'ai trop hâte ! 3 semaines à Bali qui commencent ! Notre appart à Paris sera vide jusqu\'au 20 août 😂 (18 rue Championnet, Paris 18e). Qui veut garder les plantes ? 🌱\n#Bali #Vacances2024 #ParisVide',hasClickableLink:false}, choices:[{label:'Je laisse le post, j\'ai confiance en mes followers',isCorrect:false,feedback:'Votre adresse + dates d\'absence sur un profil public = invitation pour les cambrioleurs.',points:-5},{label:'Je supprime l\'adresse, les dates et passe en privé',isCorrect:true,feedback:'Parfait ! Partagez vos vacances après être rentré.',points:10},{label:'Je supprime juste l\'adresse',isCorrect:false,feedback:'Les dates d\'absence sont aussi dangereuses que l\'adresse.',points:-5}], reflexe:'Ne jamais publier son adresse ou ses dates d\'absence publiquement.', redFlags:['Profil public = accessible à tous','Adresse précise exposée','Dates d\'absence complètes affichées'] },
      { category:'usb-piege', title:'Clé USB trouvée dans un parking', context:'Vous trouvez une clé USB dans le parking de votre bureau.', visual:{type:'browser-popup',subject:'Clé USB trouvée — Que faites-vous ?',body:'Vous trouvez une clé USB dans le parking de votre entreprise. Elle est étiquetée "CONFIDENTIEL — Résultats financiers 2024".\n\nVous êtes curieux. Votre ordinateur est devant vous.',hasClickableLink:false}, choices:[{label:'Je branche la clé pour voir ce qu\'elle contient',isCorrect:false,feedback:'Technique du "Baiting" : la clé contient un malware qui s\'installe automatiquement.',points:-5},{label:'Je la remets au service informatique sans la brancher',isCorrect:true,feedback:'Parfait ! Ne jamais brancher une clé USB trouvée — c\'est une technique d\'attaque classique.',points:10},{label:'Je la branche sur un vieux PC pour limiter les risques',isCorrect:false,feedback:'Même un vieux PC peut propager un malware sur le réseau d\'entreprise.',points:-5}], reflexe:'Ne jamais brancher une clé USB trouvée — remettez-la au service informatique.', redFlags:['Étiquette alléchante pour piquer la curiosité','Technique du "Baiting" très répandue','Même une clé neuve peut contenir un malware'] },
      { category:'phishing-secu-sociale', title:'Votre remboursement Ameli', context:'Vous recevez cet email de l\'Assurance Maladie.', visual:{type:'email',from:'Assurance Maladie',fromEmail:'remboursement@ameli-sante-fr.com',subject:'Remboursement disponible : 78,40€',body:'Madame, Monsieur,\n\nSuite à vos dernières consultations médicales, un remboursement de 78,40€ est disponible.\n\nPour recevoir votre virement, veuillez mettre à jour vos coordonnées bancaires.\n\nAssurance Maladie — Service Remboursements',hasClickableLink:true,linkLabel:'Mettre à jour mon RIB',linkUrl:'https://ameli-sante-fr.com/rib/update'}, choices:[{label:'Je mets à jour mon RIB pour recevoir le remboursement',isCorrect:false,feedback:'L\'Assurance Maladie possède déjà votre RIB. Vous venez de le donner à des fraudeurs.',points:-5},{label:'Je vais sur ameli.fr depuis mon navigateur',isCorrect:true,feedback:'Parfait ! L\'Assurance Maladie rembourse automatiquement sur le RIB enregistré.',points:10},{label:'J\'attends que le remboursement arrive',isCorrect:false,feedback:'Si l\'email est frauduleux, aucun remboursement ne viendra.',points:-5}], reflexe:'L\'Ameli rembourse automatiquement — elle ne demande jamais le RIB par email.', clickConsequence:'Vos coordonnées bancaires sont utilisées pour des prélèvements frauduleux.', redFlags:['Domaine ameli-sante-fr.com pas ameli.fr','L\'Assurance Maladie a déjà votre RIB','Les remboursements se font automatiquement'] },
      { category:'phishing-chronopost', title:'Livraison Chronopost impossible', context:'Vous avez commandé en ligne. Ce SMS arrive.', visual:{type:'sms',from:'Chronopost',body:'Votre colis CHRONO-FR48291 n\'a pas pu être livré. Reprogrammez votre livraison et payez les frais de 2,49€ :\nhttps://chronopost-replanification.fr/colis/deliver?id=FR48291',hasClickableLink:true,linkLabel:'https://chronopost-replanification.fr',linkUrl:'https://chronopost-replanification.fr/colis/deliver?id=FR48291'}, choices:[{label:'Je reprogramme et paie les 2,49€',isCorrect:false,feedback:'Vos coordonnées bancaires sont volées. Le vrai colis n\'existe peut-être même pas.',points:-5},{label:'Je vérifie sur chronopost.fr avec mon numéro de suivi',isCorrect:true,feedback:'Parfait ! Vérifiez toujours sur le site officiel du transporteur.',points:10},{label:'J\'appelle le numéro indiqué dans le SMS',isCorrect:false,feedback:'Ce numéro appartient aux fraudeurs.',points:-5}], reflexe:'Vérifiez les colis uniquement sur le site officiel du transporteur.', clickConsequence:'Vos coordonnées bancaires sont revendues ou utilisées pour des achats frauduleux.', redFlags:['Domaine chronopost-replanification.fr pas chronopost.fr','Les transporteurs ne réclament pas de frais par SMS','Montant faible pour ne pas éveiller les soupçons'] },
    ],
    intermediaire: [
      { category:'phishing-sophistique', title:'Email BNP Paribas irréprochable', context:'Vous recevez cet email très bien construit.', visual:{type:'email',from:'BNP Paribas',fromEmail:'securite@bnpparibas-fr-online.com',subject:'Vérification de sécurité requise sur votre compte',body:'Bonjour,\n\nDans le cadre de nos procédures de sécurité renforcées (directive DSP2), nous avons besoin de vérifier votre identité.\n\nCette vérification est obligatoire pour maintenir l\'accès à votre espace client. Elle prend moins de 2 minutes.\n\nCordialement,\nBNP Paribas — Service Sécurité\n\n© BNP Paribas 2024 — 16 boulevard des Italiens, 75009 Paris',hasClickableLink:true,linkLabel:'Procéder à la vérification DSP2',linkUrl:'https://bnpparibas-fr-online.com/dsp2/verify'}, choices:[{label:'Je procède à la vérification, DSP2 c\'est légal',isCorrect:false,feedback:'L\'email est très convaincant mais le domaine trahit la fraude. Vos identifiants sont volés.',points:-5},{label:'Je vérifie le domaine de l\'expéditeur — bnpparibas-fr-online.com n\'est pas bnpparibas.fr',isCorrect:true,feedback:'Excellent ! Le domaine est la clé : bnpparibas.fr est le seul domaine légitime.',points:10},{label:'Je procède car l\'email cite une vraie réglementation (DSP2)',isCorrect:false,feedback:'Les fraudeurs connaissent les termes techniques. Ça ne rend pas l\'email légitime.',points:-5}], reflexe:'Vérifiez TOUJOURS le domaine de l\'expéditeur — une lettre différente suffit.', clickConsequence:'Fausse page BNP parfaitement clonée. Vos identifiants sont capturés en temps réel.', redFlags:['bnpparibas-fr-online.com pas bnpparibas.fr','Les banques vérifient l\'identité via l\'app, pas par email','DSP2 utilisé comme argument d\'autorité'] },
      { category:'credential-stuffing', title:'Notification de connexion suspecte', context:'Vous recevez cette notification sur votre téléphone.', visual:{type:'browser-popup',subject:'Nouvelle connexion à votre compte Google',body:'Une nouvelle connexion a été détectée :\n\nAppareil : Windows 10 — Chrome\nLocalisation : Lagos, Nigeria\nHeure : 03h47\n\nSi vous êtes à l\'origine de cette connexion, ignorez ce message.\n\nSi ce n\'était pas vous, sécurisez immédiatement votre compte.',hasClickableLink:false}, choices:[{label:'Ce n\'est pas moi, je clique sur le lien dans l\'email pour sécuriser',isCorrect:false,feedback:'Vérifiez toujours dans les paramètres Google, pas via un lien email qui pourrait être frauduleux.',points:-5},{label:'Je vais directement sur myaccount.google.com pour changer mon mot de passe',isCorrect:true,feedback:'Parfait ! Activez aussi la double authentification si ce n\'est pas déjà fait.',points:10},{label:'J\'ignore, c\'est peut-être une erreur de géolocalisation',isCorrect:false,feedback:'Ne jamais ignorer une connexion suspecte depuis un pays étranger à 3h du matin.',points:-5}], reflexe:'Connexion suspecte : allez directement sur le site pour sécuriser, jamais via un lien.', redFlags:['Connexion depuis Nigeria à 3h47 = suspect','Si vous utilisez le même mot de passe ailleurs, changez tout','Activez la 2FA immédiatement'] },
      { category:'deepfake-patron', title:'Le patron appelle pour un virement urgent', context:'Vous recevez un appel de votre directeur.', visual:{type:'phone-call',from:'Directeur Général — Pierre Moreau',body:'Bonjour, c\'est Pierre. J\'ai besoin de vous en dehors des canaux habituels, c\'est ultra-confidentiel. Je suis en déplacement à Singapour pour une acquisition stratégique. J\'ai besoin d\'un virement urgent de 45 000€ aujourd\'hui avant 17h sur le compte de notre partenaire juridique. Ne passez pas par la procédure habituelle, c\'est une urgence absolue. Je compte sur votre discrétion.',hasClickableLink:false}, choices:[{label:'J\'effectue le virement, c\'est le directeur',isCorrect:false,feedback:'La voix était un deepfake IA. Vous avez transféré 45 000€ à des fraudeurs. La fraude au président coûte des millions d\'euros aux entreprises.',points:-5},{label:'Je rappelle le directeur sur son numéro officiel pour confirmer',isCorrect:true,feedback:'Parfait ! Tout virement inhabituel doit être vérifié via un canal séparé.',points:10},{label:'Je demande à un collègue si le patron est vraiment en déplacement',isCorrect:false,feedback:'Bien d\'y penser, mais appelez directement le directeur pour confirmer le virement.',points:-5}], reflexe:'Tout virement urgent et inhabituel doit être confirmé via un canal officiel séparé.', redFlags:['Demande hors canaux habituels = signal d\'alarme','Urgence + confidentialité = technique de manipulation','La fraude au président est la 1ère cause de pertes financières en entreprise'] },
      { category:'collegue-compromis', title:'Email du collègue avec pièce jointe', context:'Votre collègue Marc vous envoie un lien.', visual:{type:'email',from:'Marc Leroy',fromEmail:'m.leroy@votreentreprise.fr',subject:'Revue du rapport Q3 — urgent',body:'Salut,\n\nJ\'ai mis à jour le rapport Q3 sur notre Drive partagé. Peux-tu le relire avant la réunion de 14h ? Lien direct ici (j\'ai eu des problèmes avec l\'accès normal) :\n\nhttps://docs.google.com-votreentreprise-fr.review/shared/rapport-q3',hasClickableLink:true,linkLabel:'Accéder au rapport Q3',linkUrl:'https://docs.google.com-votreentreprise-fr.review/shared/rapport-q3'}, choices:[{label:'Je clique pour lire le rapport avant la réunion',isCorrect:false,feedback:'Le compte de Marc a été compromis. Ce lien vole vos identifiants Google.',points:-5},{label:'Je contacte Marc par téléphone ou en personne pour confirmer',isCorrect:true,feedback:'Parfait ! Quand une URL semble bizarre, vérifiez toujours directement avec l\'expéditeur.',points:10},{label:'Je signale l\'email à l\'IT sans cliquer',isCorrect:false,feedback:'Bien de signaler, mais il faut aussi prévenir Marc que son compte est compromis.',points:-5}], reflexe:'URL bizarre même d\'un collègue : vérifiez toujours de vive voix avant de cliquer.', clickConsequence:'Fausse page Google Drive qui vole vos identifiants et compromet votre compte.', redFlags:['docs.google.com-votreentreprise-fr.review n\'est pas docs.google.com','Marc n\'aurait pas de "problème d\'accès" sur un Drive partagé','Urgence avant réunion pour forcer le clic'] },
      { category:'faux-ecommerce', title:'iPhone 16 Pro à 249€ — Soldes flash', context:'Vous tombez sur cette offre en naviguant.', visual:{type:'browser-popup',subject:'SOLDES FLASH — iPhone 16 Pro Max 256Go à 249€',body:'🔥 VENTE FLASH 24H SEULEMENT 🔥\n\niPhone 16 Pro Max 256Go\nPrix normal : 1 329€\n👉 VOTRE PRIX : 249€ (-81%)\n\n✅ Livraison gratuite en 48h\n✅ Garantie 2 ans\n✅ 847 acheteurs ce matin\n\nStock : 7 unités restantes !',hasClickableLink:true,linkLabel:'Acheter maintenant à 249€',linkUrl:'https://iphone-soldes-flash-promo.com/checkout'}, choices:[{label:'J\'achète immédiatement, c\'est une occasion unique',isCorrect:false,feedback:'Vous venez de payer 249€ pour ne rien recevoir. Votre carte est aussi compromise.',points:-5},{label:'Je cherche des avis sur ce site avant d\'acheter',isCorrect:true,feedback:'Parfait ! Googlez le nom du site + "arnaque" ou consultez Trustpilot avant tout achat.',points:10},{label:'J\'achète car il y a la garantie 2 ans',isCorrect:false,feedback:'Une garantie sur un faux site ne vaut rien. Vérifiez d\'abord la légitimité du site.',points:-5}], reflexe:'Offre irréaliste = arnaque garantie. Vérifiez sur Trustpilot avant tout achat.', clickConsequence:'Vous payez et ne recevez rien. Votre numéro de carte est revendu sur le dark web.', redFlags:['iPhone à 249€ est impossible (-81%)', 'Site inconnu créé récemment','Fausse rareté : 7 unités restantes, 847 acheteurs'] },
      { category:'extension-malveillante', title:'Extension Chrome pour avoir des réductions', context:'Vous cherchez des bons de réduction en ligne.', visual:{type:'browser-popup',subject:'DealHunter Pro — Économisez sur chaque achat !',body:'DealHunter Pro — 4,8/5 ⭐ (12 847 avis)\n\nApplication automatique des meilleurs codes promo sur Amazon, FNAC, Cdiscount...\n\n✅ Gratuit\n✅ Économisez en moyenne 34€ par commande\n✅ Utilisé par 2,3 millions de Français\n\nPermissions requises :\n• Lire et modifier toutes vos données sur tous les sites web\n• Gérer vos téléchargements',hasClickableLink:true,linkLabel:'Ajouter à Chrome — Gratuit',linkUrl:'https://chrome.google.com/webstore/detail/dealhunter'}, choices:[{label:'J\'installe, les avis sont excellents',isCorrect:false,feedback:'L\'extension lit maintenant tous vos mots de passe, emails et données bancaires.',points:-5},{label:'Je lis les permissions — "modifier toutes vos données" est très suspect',isCorrect:true,feedback:'Parfait ! Une extension de réductions n\'a aucun besoin d\'accéder à tous vos sites.',points:10},{label:'J\'installe car c\'est sur le Chrome Web Store officiel',isCorrect:false,feedback:'Le Chrome Web Store peut contenir des extensions malveillantes malgré les vérifications.',points:-5}], reflexe:'Lisez les permissions — une extension légitime ne demande jamais l\'accès à tous vos sites.', clickConsequence:'L\'extension surveille toutes vos saisies : mots de passe, carte bancaire, emails.', redFlags:['"Modifier toutes vos données" = permission excessive','Les extensions malveillantes ont souvent de faux avis positifs','Gratuit + accès illimité = votre vie privée est le produit'] },
      { category:'vishing-avocat', title:'L\'avocat qui demande un virement urgent', context:'Vous recevez un appel d\'un avocat concernant votre entreprise.', visual:{type:'phone-call',from:'+33 1 44 72 81 92',body:'Bonjour, je suis Maître Delacourt du cabinet LexPartners. Je gère le dossier de rachat de votre concurrent. Votre directeur m\'a demandé de vous contacter directement. Nous avons besoin d\'un virement de garantie de 78 000€ avant 16h aujourd\'hui pour sécuriser l\'opération. La confidentialité est absolue. Je vous envoie le RIB par email dans 5 minutes.',hasClickableLink:false}, choices:[{label:'J\'effectue le virement, c\'est une opération légale',isCorrect:false,feedback:'Il n\'y a pas de rachat. C\'était une fraude au faux avocat très sophistiquée.',points:-5},{label:'Je rappelle le cabinet via le numéro sur leur site web pour confirmer',isCorrect:true,feedback:'Parfait ! Tout virement important doit être confirmé via les canaux officiels.',points:10},{label:'J\'attends l\'email avec le RIB avant de décider',isCorrect:false,feedback:'Un email avec un RIB peut aussi être frauduleux. Appelez le cabinet directement.',points:-5}], reflexe:'Tout virement urgent et inhabituel doit être confirmé via les canaux officiels séparés.', redFlags:['Virement urgent + confidentialité = combinaison classique de fraude','Appelez le cabinet en cherchant vous-même le numéro','Un vrai avocat suit les procédures de votre entreprise'] },
      { category:'macro-office', title:'Document Word avec macros', context:'Vous recevez ce document de votre DRH.', visual:{type:'email',from:'Direction RH',fromEmail:'drh@votreentreprise-rh.com',subject:'IMPORTANT — Nouveau règlement intérieur 2024 à signer',body:'Bonjour,\n\nVeuillez trouver en pièce jointe le nouveau règlement intérieur 2024. Votre signature électronique est requise avant vendredi.\n\nOuvrez le document et cliquez sur "Activer le contenu" pour signer.\n\nCordialement,\nDirection des Ressources Humaines',hasClickableLink:true,linkLabel:'📎 Reglement_interieur_2024.docm',linkUrl:''}, choices:[{label:'J\'ouvre le document et active les macros pour signer',isCorrect:false,feedback:'Les macros ont exécuté un script malveillant. Votre PC est compromis.',points:-5},{label:'Je contacte directement la DRH pour vérifier',isCorrect:true,feedback:'Parfait ! Les vrais documents RH passent par vos canaux habituels, pas des emails externes.',points:10},{label:'Je transmets à l\'IT sans ouvrir',isCorrect:false,feedback:'Bien de signaler à l\'IT, mais prévenez aussi la DRH que quelqu\'un usurpe son identité.',points:-5}], reflexe:'Ne jamais "Activer le contenu" dans un document Word reçu par email.', clickConsequence:'Le script macro installe un cheval de Troie qui donne accès à votre réseau.', redFlags:['DRH ne demande pas de signer via des macros Word','Extension .docm = macro activée','Adresse email légèrement différente de la vraie DRH'] },
      { category:'ingenierie-linkedin', title:'Le chasseur de tête trop curieux', context:'Un recruteur vous contacte sur LinkedIn.', visual:{type:'social-post',from:'Sophie Martin — Talent Acquisition — TechCorp',body:'Bonjour,\n\nJ\'ai découvert votre profil et votre expertise en cybersécurité nous intéresse beaucoup. Nous avons un poste de RSSI à +40% de votre salaire actuel.\n\nPour aller plus loin, j\'aurais besoin de :\n— Votre CV détaillé avec accès aux systèmes gérés\n— L\'organigramme de votre équipe IT\n— Vos coordonnées personnelles (email + téléphone)\n— Votre disponibilité pour un entretien cette semaine',hasClickableLink:false}, choices:[{label:'J\'envoie les informations, c\'est une belle opportunité',isCorrect:false,feedback:'Ces informations (accès systèmes, organigramme) peuvent être utilisées pour attaquer votre entreprise.',points:-5},{label:'Je vérifie que TechCorp existe et que Sophie travaille vraiment là',isCorrect:true,feedback:'Parfait ! Vérifiez toujours l\'identité du recruteur et ne partagez jamais les infos système.',points:10},{label:'J\'envoie mon CV mais sans les infos système',isCorrect:false,feedback:'Bien de protéger les infos système, mais vérifiez d\'abord l\'identité du recruteur.',points:-5}], reflexe:'Ne jamais partager d\'informations système dans un contexte de recrutement non vérifié.', redFlags:['Demande d\'infos systèmes = signal d\'alarme','Vérifiez que le recruteur existe vraiment sur LinkedIn','Salaire très attractif pour créer l\'urgence'] },
      { category:'arnaque-romantique', title:'La rencontre en ligne parfaite', context:'Vous chattez depuis 3 mois avec quelqu\'un sur un site de rencontres.', visual:{type:'sms',from:'Emma 💕 (site de rencontres)',body:'Mon chéri, tu m\'es tellement précieux. Je suis à Dubai pour mon travail de médecin humanitaire et j\'ai un problème terrible. Mon équipement médical a été saisi à la douane. J\'ai besoin de 1 800€ pour le libérer et sauver mes patients. Je te rembourse dès mon retour vendredi. S\'il te plaît, aide-moi.',hasClickableLink:false}, choices:[{label:'J\'envoie les 1 800€, je l\'aime vraiment',isCorrect:false,feedback:'Emma n\'existe pas. C\'est un escroc professionnel qui vous manipule depuis des mois. Vous perdez 1 800€.',points:-5},{label:'Je propose un appel vidéo pour la voir avant d\'envoyer quoi que ce soit',isCorrect:true,feedback:'Parfait ! Les arnaqueurs romantiques refusent toujours les appels vidéo spontanés.',points:10},{label:'J\'envoie 500€ pour aider mais pas tout',isCorrect:false,feedback:'Même 500€ partent dans la poche d\'un escroc. Il reviendra chercher le reste.',points:-5}], reflexe:'Proposez toujours un appel vidéo impromptu — les arnaqueurs refusent systématiquement.', redFlags:['Jamais pu se rencontrer en 3 mois','Demande d\'argent urgente','Situation de crise dramatique à l\'étranger'] },
      { category:'faux-support-it', title:'Email du service IT interne', context:'Vous recevez cet email du service informatique de votre entreprise.', visual:{type:'email',from:'Service Informatique — HelpDesk',fromEmail:'it-support@votreentreprise-helpdesk.net',subject:'Maintenance obligatoire — Validation de vos accès requise',body:'Bonjour,\n\nDans le cadre de notre migration vers le nouveau système d\'authentification SSO, nous avons besoin de valider vos accès.\n\nConnectez-vous via le lien ci-dessous avec vos identifiants actuels pour éviter tout blocage lundi matin.\n\nOpération à effectuer avant vendredi 18h.\n\nService Informatique',hasClickableLink:true,linkLabel:'Valider mes accès — SSO Migration',linkUrl:'https://votreentreprise-helpdesk.net/sso/validate'}, choices:[{label:'Je valide mes accès pour ne pas être bloqué lundi',isCorrect:false,feedback:'L\'IT légitime ne demande jamais votre mot de passe par email.',points:-5},{label:'J\'appelle directement l\'IT pour confirmer',isCorrect:true,feedback:'Parfait ! Un vrai IT ne demande jamais un mot de passe par email.',points:10},{label:'Je transmets à l\'IT en répondant à l\'email',isCorrect:false,feedback:'En répondant à cet email frauduleux, vous contactez les attaquants.',points:-5}], reflexe:'L\'IT légitime ne demande JAMAIS votre mot de passe, par aucun canal.', clickConsequence:'Vos identifiants d\'entreprise sont capturés et vendus ou utilisés pour une intrusion.', redFlags:['Domaine votreentreprise-helpdesk.net pas votre vrai domaine','L\'IT ne demande pas les mots de passe','Urgence vendredi = pression du temps'] },
      { category:'faux-site-gouv', title:'Renouvellement carte grise en ligne', context:'Vous cherchez à renouveler votre carte grise.', visual:{type:'browser-popup',subject:'ANTS — Agence Nationale des Titres Sécurisés',body:'Renouvellement de Carte Grise en Ligne\nTarif officiel avec traitement prioritaire : 59€\n\n✅ Service officiel gouvernemental\n✅ Traitement en 24h\n✅ Reçu votre carte en 5 jours\n\nNote : Ce service officiel inclut une assistance administrative de 39€ incluse dans le tarif.',hasClickableLink:true,linkLabel:'Commencer ma démarche — 59€',linkUrl:'https://ants-carte-grise-officiel.com/demande'}, choices:[{label:'Je paie les 59€, c\'est plus rapide et officiel',isCorrect:false,feedback:'Ce site facture un "service" pour des démarches gratuites sur ants.gouv.fr.',points:-5},{label:'Je vais directement sur ants.gouv.fr',isCorrect:true,feedback:'Parfait ! Les démarches ANTS sont gratuites sur ants.gouv.fr.',points:10},{label:'Je paie car 59€ pour gagner du temps ça vaut le coup',isCorrect:false,feedback:'Ce n\'est pas plus rapide — c\'est juste intermédiaire pour des démarches gratuites.',points:-5}], reflexe:'Les démarches officielles sont gratuites sur les sites en .gouv.fr uniquement.', redFlags:['ants-carte-grise-officiel.com pas ants.gouv.fr','Les démarches ANTS sont gratuites','Frais "d\'assistance" cachés dans le prix'] },
      { category:'fournisseur-rib', title:'Votre fournisseur change son RIB', context:'Vous gérez les finances. Cet email arrive.', visual:{type:'email',from:'Comptabilité — Société Imprim\'Plus',fromEmail:'compta@imprimplus-fr.com',subject:'Mise à jour coordonnées bancaires — Urgent',body:'Bonjour,\n\nSuite à un changement de notre établissement bancaire, nous vous informons de la mise à jour de notre RIB à compter du 01/04/2024.\n\nNouveaux coordonnées :\nIBAN : FR76 1234 5678 9012 3456 7890 1234\nBIC : BNPAFRPP\n\nMerci de mettre à jour vos systèmes avant votre prochain règlement.\n\nComptabilité Imprim\'Plus',hasClickableLink:false}, choices:[{label:'Je mets à jour le RIB dans notre système comptable',isCorrect:false,feedback:'Tous les prochains virements à Imprim\'Plus iront chez des fraudeurs.',points:-5},{label:'J\'appelle le comptable d\'Imprim\'Plus via l\'ancien numéro pour confirmer',isCorrect:true,feedback:'Parfait ! Tout changement de RIB doit être vérifié par téléphone via l\'ancien numéro.',points:10},{label:'Je réponds à l\'email pour confirmer la réception',isCorrect:false,feedback:'Vous confirmeriez auprès des fraudeurs que le changement a été pris en compte.',points:-5}], reflexe:'Tout changement de RIB doit être confirmé par téléphone via l\'ANCIEN numéro du fournisseur.', redFlags:['Vérifiez si le domaine email correspond exactement au domaine habituel du fournisseur','Appelez via l\'ancien numéro jamais celui dans l\'email','Cette arnaque coûte des millions aux entreprises chaque année'] },
      { category:'sim-swapping', title:'Perte de réseau inexpliquée', context:'Votre téléphone n\'a plus de réseau depuis 2 heures.', visual:{type:'browser-popup',subject:'Votre téléphone a perdu le réseau',body:'Depuis 2 heures, votre téléphone affiche "Pas de service".\n\nVous redémarrez l\'appareil plusieurs fois sans résultat.\n\nVous recevez des notifications de connexions sur vos comptes avec codes SMS (mais aucun SMS n\'arrive sur votre téléphone).\n\nQue faites-vous ?',hasClickableLink:false}, choices:[{label:'J\'attends, c\'est peut-être juste une panne réseau',isCorrect:false,feedback:'Un attaquant a transféré votre numéro sur sa carte SIM. Vos SMS de validation lui parviennent.',points:-5},{label:'J\'appelle mon opérateur depuis un autre téléphone immédiatement',isCorrect:true,feedback:'Parfait ! Contactez votre opérateur et bloquez les accès à vos comptes depuis un autre appareil.',points:10},{label:'Je me rends en boutique opérateur',isCorrect:false,feedback:'Bien, mais appelez d\'abord pour bloquer immédiatement — chaque minute compte.',points:-5}], reflexe:'Perte de réseau soudaine = SIM Swapping possible. Appelez votre opérateur immédiatement.', redFlags:['Perte de réseau soudaine inexpliquée','Notifications de connexion avec codes SMS sans les recevoir','Vos comptes bancaires sont la cible principale'] },
      { category:'oauth-phishing', title:'Application demande accès à votre Google', context:'Vous essayez une nouvelle application web.', visual:{type:'browser-popup',subject:'Autorisation demandée — ProductivityApp',body:'ProductivityApp souhaite accéder à votre compte Google.\n\nCette autorisation permettra à ProductivityApp de :\n✅ Voir votre adresse email\n✅ Voir vos informations personnelles\n✅ Accéder à vos emails et les envoyer\n✅ Voir et gérer vos fichiers Google Drive\n✅ Accéder à vos contacts\n✅ Accéder à votre agenda',hasClickableLink:true,linkLabel:'Autoriser ProductivityApp',linkUrl:''}, choices:[{label:'J\'autorise, j\'ai besoin de l\'application',isCorrect:false,feedback:'ProductivityApp peut maintenant lire tous vos emails, fichiers et contacts — potentiellement à des fins malveillantes.',points:-5},{label:'Je refuse les permissions excessives — une app de productivité n\'a pas besoin de mes emails',isCorrect:true,feedback:'Parfait ! Accordez uniquement les permissions nécessaires à la fonction de l\'application.',points:10},{label:'J\'autorise mais je révoque l\'accès après utilisation',isCorrect:false,feedback:'Bien d\'y penser, mais les données déjà collectées pendant la session peuvent être extraites.',points:-5}], reflexe:'N\'accordez que les permissions strictement nécessaires à la fonction de l\'application.', redFlags:['Accès aux emails pour une app de productivité = excessif','Principe du moindre privilège : moins c\'est mieux','Vérifiez la réputation de l\'application avant d\'autoriser'] },
      { category:'phishing-teams', title:'Message Teams d\'un prestataire externe', context:'Vous recevez ce message sur Microsoft Teams.', visual:{type:'sms',from:'Jean-Pierre Rousseau (Externe) — Consultant',body:'[EXTERNE] Bonjour, je travaille avec votre équipe projet. J\'ai besoin de votre aide pour accéder au rapport de sécurité Q3. J\'ai eu un problème avec mon accès Teams. Pouvez-vous partager vos identifiants temporairement ? Je vous rends ça dans 5 minutes. C\'est urgent pour la réunion de 14h.',hasClickableLink:false}, choices:[{label:'Je lui donne mes identifiants temporairement',isCorrect:false,feedback:'Aucune raison légitime ne justifie de partager ses identifiants, même temporairement.',points:-5},{label:'Je contacte le chef de projet pour vérifier l\'identité du consultant',isCorrect:true,feedback:'Parfait ! Vérifiez toujours l\'identité via un canal séparé avant tout partage d\'accès.',points:10},{label:'Je lui envoie le rapport directement pour aider',isCorrect:false,feedback:'Vous avez peut-être partagé un document confidentiel avec un attaquant.',points:-5}], reflexe:'Ne jamais partager ses identifiants, même temporairement, même à un collègue.', redFlags:['[EXTERNE] dans Teams = personne hors de votre organisation','Aucune raison légitime de partager ses credentials','Urgence créée pour empêcher la réflexion'] },
      { category:'mitm-wifi', title:'WiFi de l\'hôtel — Interception de données', context:'Vous êtes en déplacement professionnel à l\'hôtel.', visual:{type:'browser-popup',subject:'Connexion WiFi Hotel Mercure Paris',body:'Connecté à : Hotel_Mercure_Free_WiFi\n\nVous travaillez depuis votre chambre :\n— Connexion à votre VPN d\'entreprise (en cours de connexion...)\n— Accès à votre messagerie professionnelle\n— Téléchargement d\'un fichier confidentiel de 45 Mo\n\nLe VPN affiche "Connexion établie" mais certaines requêtes DNS semblent bypasser le tunnel.',hasClickableLink:false}, choices:[{label:'Je continue à travailler, le VPN est connecté',isCorrect:false,feedback:'Des fuites DNS peuvent exposer vos requêtes même avec un VPN connecté. Vérifiez les fuites DNS.',points:-5},{label:'Je vérifie les fuites DNS et teste dnsleaktest.com',isCorrect:true,feedback:'Parfait ! Vérifiez toujours l\'absence de fuites DNS avant de travailler sur des données sensibles.',points:10},{label:'Je déconnecte le VPN car il crée des problèmes',isCorrect:false,feedback:'Sans VPN sur un WiFi d\'hôtel, tout votre trafic est potentiellement interceptable.',points:-5}], reflexe:'Vérifiez toujours les fuites DNS avec dnsleaktest.com sur un réseau public.', redFlags:['WiFi d\'hôtel = réseau non maîtrisé','Les fuites DNS exposent vos requêtes même avec VPN','Testez toujours le VPN avant de travailler sur des données sensibles'] },
      { category:'google-form-phishing', title:'Formulaire Google de satisfaction RH', context:'Vous recevez ce message de votre RH.', visual:{type:'email',from:'RH — Enquête annuelle',fromEmail:'rh-enquete@votreentreprise-satisfaction.com',subject:'Enquête de satisfaction obligatoire — À compléter avant vendredi',body:'Bonjour,\n\nDans le cadre de notre démarche qualité, merci de compléter le formulaire de satisfaction annuel.\n\nLe formulaire demande :\n— Votre satisfaction globale\n— Votre manager direct (nom + email)\n— Vos accès systèmes actuels\n— Votre avis sur la politique de sécurité',hasClickableLink:true,linkLabel:'Compléter le formulaire',linkUrl:'https://docs.google.com/forms/d/1abc...'}, choices:[{label:'Je complète le formulaire, c\'est demandé par la RH',isCorrect:false,feedback:'Vous avez fourni une cartographie de vos accès et de votre hiérarchie à un attaquant.',points:-5},{label:'Je vérifie avec la RH si cette enquête est officielle',isCorrect:true,feedback:'Parfait ! Un formulaire demandant vos accès systèmes est suspect même s\'il vient de la RH.',points:10},{label:'Je complète sauf la partie accès systèmes',isCorrect:false,feedback:'Même la partie managériale peut servir à une attaque d\'ingénierie sociale.',points:-5}], reflexe:'Un formulaire demandant vos accès systèmes est suspect, quelle qu\'en soit la source.', redFlags:['Domaine votreentreprise-satisfaction.com pas votre vrai domaine','Les accès systèmes n\'ont rien à voir avec une enquête RH','Cette info sert à cartographier les cibles pour une attaque'] },
    ],
    expert: [
      { category:'ceo-fraud', title:'Acquisition confidentielle — Virement urgent', context:'Vous êtes DAF. Vous recevez ce message du PDG.', visual:{type:'sms',from:'PDG — François Leblanc',body:'François Leblanc : Bonjour, je suis en réunion avec nos avocats pour l\'acquisition de Startup XYZ. C\'est absolument confidentiel. J\'ai besoin d\'un virement de garantie de 230 000€ aujourd\'hui avant 17h. Le RIB vous sera envoyé par Maître Durand (avocat@cabinet-durand-associes.fr). Ne passez pas par la procédure habituelle, c\'est une condition de la confidentialité. Comptez sur vous.',hasClickableLink:false}, choices:[{label:'J\'effectue le virement, c\'est le PDG',isCorrect:false,feedback:'Le compte était compromis. C\'est la fraude au Président — 1ère cause de pertes financières en entreprise française. 230 000€ irrécupérables.',points:-5},{label:'Je rappelle le PDG sur son numéro de portable officiel pour confirmation vocale',isCorrect:true,feedback:'Parfait ! Tout virement > seuil doit suivre la procédure : double validation + confirmation vocale du donneur d\'ordre.',points:10},{label:'Je demande confirmation par email au PDG',isCorrect:false,feedback:'Si la boîte email du PDG est compromise, sa réponse email sera aussi frauduleuse.',points:-5}], reflexe:'Tout virement exceptionnel nécessite une confirmation vocale directe — la procédure protège tout le monde.', redFlags:['Contournement délibéré des procédures habituelles','Confidentialité comme prétexte pour éviter la double validation','Urgence absolue pour empêcher la réflexion'] },
      { category:'deepfake-video', title:'Appel visio avec le DAF — Virement 80K€', context:'Vous recevez un appel visio inattendu de votre DAF.', visual:{type:'phone-call',from:'Appel visio — Thierry Martin (DAF)',body:'[Appel vidéo] Vous voyez clairement le visage de Thierry Martin, votre DAF que vous connaissez personnellement.\n\n"Bonjour, je t\'appelle en urgence. On a une opportunité d\'acquisition qui se ferme dans 2 heures. J\'ai besoin que tu vires 80 000€ sur ce compte avant 15h. Je t\'envoie le RIB par SMS. C\'est ultra-urgent, ne dis rien à personne pour l\'instant."\n\nLa vidéo semble réelle, la voix aussi.',hasClickableLink:false}, choices:[{label:'Je vire les 80 000€, je le vois clairement',isCorrect:false,feedback:'C\'était un deepfake IA en temps réel. La technologie existe depuis 2024. 80 000€ sont perdus.',points:-5},{label:'Je pose une question personnelle que seul le vrai Thierry connaît',isCorrect:true,feedback:'Excellent ! Face à une demande de virement en visio : posez une question personnelle, rappellez sur un numéro connu, et suivez la procédure normale.',points:10},{label:'Je demande confirmation par email',isCorrect:false,feedback:'Si l\'attaquant contrôle la boîte email du DAF, il peut aussi confirmer par email.',points:-5}], reflexe:'Deepfake vidéo en temps réel existe. Posez une question personnelle et rappellez sur numéro officiel.', redFlags:['Demande hors procédure + urgence = signal maximal','La technologie deepfake vidéo en temps réel existe','Toujours suivre la procédure même si vous "voyez" la personne'] },
      { category:'spear-phishing', title:'Email ciblé : votre présentation au COMEX', context:'Vous êtes RSSI. Vous recevez cet email très ciblé.', visual:{type:'email',from:'Laurent Dupuis — Gartner Research',fromEmail:'l.dupuis@gartner-research-fr.com',subject:'Re: Votre présentation Cybersécurité au COMEX du 15 mars',body:'Bonjour,\n\nSuite à votre intervention au COMEX sur la stratégie cyber 2024, je me permets de vous contacter. Notre étude comparative secteur financier est terminée. J\'ai inclus vos benchmarks comme référence.\n\nPouvez-vous valider le document avant publication ?\n\nLaurent Dupuis\nGartner Research — Cybersécurité',hasClickableLink:true,linkLabel:'Valider le rapport Gartner (accès restreint)',linkUrl:'https://gartner-research-fr.com/reports/validate?token=RSSI2024'}, choices:[{label:'Je valide, Gartner connaît ma présentation',isCorrect:false,feedback:'L\'attaquant a fait des recherches sur LinkedIn. C\'est du spear phishing ciblé — vos credentials d\'entreprise sont compromis.',points:-5},{label:'Je contacte Gartner directement via leur site officiel gartner.com',isCorrect:true,feedback:'Parfait ! Le spear phishing utilise des informations publiques pour vous cibler personnellement.',points:10},{label:'Je réponds pour demander ses coordonnées officielles',isCorrect:false,feedback:'L\'attaquant peut fournir de fausses coordonnées convaincantes.',points:-5}], reflexe:'Plus un email est personnalisé et précis, plus il peut être du spear phishing.', clickConsequence:'Fausse page Gartner qui vole vos credentials d\'entreprise pour une intrusion ciblée.', redFlags:['gartner-research-fr.com pas gartner.com','Les informations précises viennent de LinkedIn/sources publiques','Le spear phishing cible les cadres avec des infos récoltées en OSINT'] },
      { category:'supply-chain-logiciel', title:'Mise à jour de votre antivirus', context:'Votre antivirus demande une mise à jour critique.', visual:{type:'browser-popup',subject:'Mise à jour critique — Votre antivirus',body:'Votre antivirus vous informe :\n\n"Une mise à jour de sécurité critique (v12.4.1) est disponible. Cette mise à jour corrige une vulnérabilité zero-day active (CVE-2024-7823).\n\nInstallation automatique dans : 30 minutes\nOu installez maintenant pour une protection immédiate."\n\n[Note : L\'antivirus a été compromis lors d\'une attaque supply chain sur son serveur de mises à jour]',hasClickableLink:false}, choices:[{label:'J\'installe immédiatement, c\'est une vulnérabilité zero-day',isCorrect:false,feedback:'La mise à jour est piégée (type SolarWinds). Un malware est installé avec les droits administrateur.',points:-5},{label:'Je vérifie la mise à jour sur le site officiel de l\'éditeur avant d\'installer',isCorrect:true,feedback:'Parfait ! Vérifiez toujours les mises à jour importantes sur le site de l\'éditeur.',points:10},{label:'Je laisse l\'installation automatique dans 30 min',isCorrect:false,feedback:'La mise à jour piégée s\'installera quand même automatiquement.',points:-5}], reflexe:'Vérifiez les mises à jour critiques directement sur le site de l\'éditeur avant d\'installer.', redFlags:['Attaque type SolarWinds sur la supply chain logicielle','La mise à jour vient du serveur compromis de l\'éditeur','Urgence zero-day pour forcer l\'installation immédiate'] },
      { category:'bec-fournisseur', title:'Changement de RIB fournisseur stratégique', context:'Vous gérez un fournisseur critique. Cet email arrive.', visual:{type:'email',from:'Direction Financière — Accenture France',fromEmail:'finance@accenture-fr-comptabilite.com',subject:'Information importante — Changement coordonnées bancaires',body:'Madame, Monsieur,\n\nNous vous informons du changement de notre établissement bancaire principal à compter du 1er avril.\n\nNouveau compte :\nIBAN : FR76 3000 4028 3787 6543 2100 1234\n\nMerci de mettre à jour votre système avant votre prochain règlement de 340 000€ prévu le 5 avril.\n\nDirection Financière — Accenture France\n+ 33 1 49 28 35 00',hasClickableLink:false}, choices:[{label:'Je mets à jour le RIB, c\'est un fournisseur de confiance',isCorrect:false,feedback:'Le prochain virement de 340 000€ ira chez des fraudeurs. Perte sèche quasi-irrécupérable.',points:-5},{label:'J\'appelle la direction financière d\'Accenture via un numéro que je trouve moi-même',isCorrect:true,feedback:'Parfait ! Cherchez le numéro sur accenture.com/fr, jamais celui dans l\'email.',points:10},{label:'Je demande une lettre signée par courrier',isCorrect:false,feedback:'Bien d\'y penser, mais appelez d\'abord pour bloquer immédiatement le changement.',points:-5}], reflexe:'Tout changement de RIB > 10 000€ : appelez via le numéro officiel du fournisseur sur son site.', redFlags:['accenture-fr-comptabilite.com pas accenture.com','Le montant du prochain virement est connu = info interne compromise','Procédure de double validation obligatoire pour les virements importants'] },
      { category:'watering-hole', title:'Site professionnel de votre secteur compromis', context:'Vous visitez régulièrement ce site de veille sectorielle.', visual:{type:'browser-popup',subject:'SecurInfo — Veille Cybersécurité',body:'Vous visitez SecurInfo.fr, votre site habituel de veille cybersécurité.\n\nLe site semble normal. Vous lisez les derniers articles.\n\n[En arrière-plan, une iframe invisible exploite une vulnérabilité de votre navigateur non patché. Un dropper est téléchargé silencieusement.]\n\nAucun message d\'erreur. Aucun signe visible d\'infection.',hasClickableLink:false}, choices:[{label:'Je continue à lire, le site est de confiance',isCorrect:false,feedback:'Le malware s\'est installé silencieusement. Votre navigateur non patché était vulnérable.',points:-5},{label:'Je maintiens mon navigateur et ses plugins constamment à jour',isCorrect:true,feedback:'Parfait ! Les attaques watering hole exploitent les navigateurs et plugins non patchés.',points:10},{label:'J\'installe un bloqueur de publicités pour me protéger',isCorrect:false,feedback:'Utile mais insuffisant — les patches de sécurité réguliers sont la vraie protection.',points:-5}], reflexe:'Maintenez navigateur, plugins et OS à jour — les watering holes exploitent les failles non patchées.', redFlags:['Un site de confiance peut être compromis','Les attaques silencieuses ne montrent rien à l\'écran','Principaux vecteurs : Java, Flash (obsolète), PDF viewers, navigateurs non patchés'] },
      { category:'double-extorsion', title:'Ransomware avec menace de publication', context:'Vous êtes RSSI. Vous recevez ce message sur votre serveur.', visual:{type:'browser-popup',subject:'ATTENTION — Message des attaquants',body:'Vos systèmes ont été compromis et 2,3 To de données exfiltrés.\n\nVous avez 72 heures pour payer 150 000€ en Bitcoin.\n\nSi vous ne payez pas :\n— Vos données clients seront publiées\n— RGPD : notification obligatoire à la CNIL\n— Vos partenaires seront informés\n— Les données seront revendues sur le dark web\n\nNote : Votre incident response team est surveillée. Ne contactez pas les autorités.',hasClickableLink:false}, choices:[{label:'Je paie la rançon pour éviter la publication',isCorrect:false,feedback:'Payer n\'empêche pas la publication — 80% des victimes qui paient sont ré-attaquées. Et vous financez des criminels.',points:-5},{label:'Je contacte l\'ANSSI et active mon plan de réponse aux incidents',isCorrect:true,feedback:'Parfait ! L\'ANSSI accompagne gratuitement les victimes. Ne payez jamais la rançon.',points:10},{label:'Je négocie pour réduire le montant',isCorrect:false,feedback:'La négociation prolonge l\'attaque et ne garantit aucune protection.',points:-5}], reflexe:'Ne jamais payer la rançon — contactez l\'ANSSI (anssi.fr) et activez votre PRI immédiatement.', redFlags:['Payer ne garantit pas la non-publication','L\'ANSSI accompagne gratuitement les victimes d\'attaques','Un plan de réponse aux incidents doit être préparé AVANT l\'attaque'] },
      { category:'insider-threat', title:'Employé mécontent — Exfiltration de données', context:'Vous êtes DRH. Un manager vous signale un comportement inhabituel.', visual:{type:'browser-popup',subject:'Signalement comportement inhabituel',body:'Le manager de Marc Lefebvre (IT Admin) vous signale :\n\n— Marc a été informé de son non-renouvellement de contrat vendredi\n— Depuis lundi, il copie massivement des fichiers sur une clé USB\n— Il a accédé à des répertoires hors de son périmètre habituel\n— Il a modifié ses horaires pour travailler seul le soir\n— Son accès VPN a été utilisé à 02h du matin ce week-end\n\nQue faites-vous ?',hasClickableLink:false}, choices:[{label:'J\'attends la fin de son contrat pour limiter la confrontation',isCorrect:false,feedback:'Marc a encore plusieurs semaines pour exfiltrer des données critiques. Les dommages peuvent être considérables.',points:-5},{label:'Je contacte immédiatement l\'IT pour révoquer ses accès privilegiés',isCorrect:true,feedback:'Parfait ! Révocation immédiate des accès, analyse forensique des logs, et suivi légal si nécessaire.',points:10},{label:'Je le confronte directement',isCorrect:false,feedback:'La confrontation peut aggraver l\'exfiltration ou déclencher une action destructive immédiate.',points:-5}], reflexe:'Signalement d\'exfiltration interne : révocation immédiate des accès puis investigation.', redFlags:['Accumulation de signaux comportementaux','Accès inhabituels combinés à une situation conflictuelle','La menace interne représente 34% des incidents de sécurité'] },
      { category:'zero-day-pdf', title:'PDF reçu d\'un inconnu — Analyse OSINT', context:'Vous êtes analyste sécurité. Vous recevez ce PDF.', visual:{type:'email',from:'Chercheur indépendant',fromEmail:'research@sec-analyst-fr.net',subject:'Rapport confidentiel : Vulnérabilités zero-day secteur financier',body:'Bonjour,\n\nJe suis chercheur indépendant en cybersécurité. J\'ai découvert des vulnérabilités critiques dans les systèmes de votre secteur et souhaite vous les signaler de manière responsable.\n\nVeuillez trouver en PJ mon rapport préliminaire (format PDF).\n\nJe reste disponible pour en discuter.\n\nCordialement,\nMaxime Renard — Chercheur Sécurité',hasClickableLink:true,linkLabel:'📎 Vulnerabilities_Report_2024.pdf',linkUrl:''}, choices:[{label:'J\'ouvre le PDF, c\'est un rapport de sécurité légitime',isCorrect:false,feedback:'Un PDF peut contenir un exploit zero-day pour votre visionneuse PDF non patchée.',points:-5},{label:'J\'analyse le PDF dans un sandbox isolé avant tout',isCorrect:true,feedback:'Parfait ! Tout fichier de source inconnue doit être analysé en sandbox (Any.run, VirusTotal, etc.).',points:10},{label:'Je scanne le PDF avec mon antivirus avant de l\'ouvrir',isCorrect:false,feedback:'L\'antivirus ne détecte pas les zero-days par définition.',points:-5}], reflexe:'Tout PDF de source inconnue doit être analysé dans un sandbox isolé (any.run, VirusTotal).', clickConsequence:'L\'exploit PDF zero-day compromet votre poste et pivote vers le réseau d\'entreprise.', redFlags:['Source inconnue + fichier joint = risque maximal','Les chercheurs légitimes passent par des plateformes officielles (HackerOne, etc.)','Les zero-days PDF existent pour les visionneuses non patchées'] },
      { category:'typosquatting', title:'Domaine très proche du vôtre', context:'Vous êtes RSSI. Un employé vous signale un email suspect.', visual:{type:'email',from:'Service IT — ACMÉ Corp',fromEmail:'it-support@acmé-corp.com',subject:'Mise à jour obligatoire — Authentification Microsoft 365',body:'Bonjour,\n\nMicrosoft déploie une mise à jour de sécurité obligatoire pour Microsoft 365. Votre authentification doit être reconfigurée avant le 30 mars.\n\nConnectez-vous via le portail de mise à jour sécurisé ci-dessous.\n\nService IT — ACMÉ Corp',hasClickableLink:true,linkLabel:'Portail de mise à jour M365',linkUrl:'https://m365-security-update.acmé-corp.com/auth'}, choices:[{label:'Je procède à la mise à jour, ça vient de l\'IT de notre entreprise',isCorrect:false,feedback:'Le domaine acmé-corp.com contient un caractère Unicode (é) différent du vrai domaine acme-corp.com. C\'est du typosquatting.',points:-5},{label:'Je compare le domaine caractère par caractère avec notre domaine officiel',isCorrect:true,feedback:'Parfait ! Les attaques homographiques utilisent des caractères Unicode visuellement identiques.',points:10},{label:'Je transferts à l\'IT pour vérification',isCorrect:false,feedback:'Bien de signaler, mais analysez d\'abord vous-même le domaine.',points:-5}], reflexe:'Comparez les domaines caractère par caractère — les attaques homographiques sont invisibles à l\'oeil nu.', clickConsequence:'Vos credentials M365 sont capturés et utilisés pour une intrusion sur votre tenant Office 365.', redFlags:['Caractère "é" Unicode dans le domaine pas "e" ASCII','Les attaques homographiques sont quasi-invisibles','Vérifiez le domaine dans la barre d\'adresse, pas dans l\'email'] },
    ],
  };

  app.post('/api/cyber/mtm-scenario', async (req, res) => {
    const { scenarioIndex = 0, level = 'debutant' } = req.body as { scenarioIndex: number; level?: string };

    // Sélection dans la banque par niveau
    const lvl = ['debutant', 'intermediaire', 'expert'].includes(level) ? level : 'debutant';
    const bank = MTM_BANK[lvl] || MTM_BANK['debutant'];
    const bankScenario = bank[scenarioIndex % bank.length];

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
        { maxTokens: 1200 }
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

  // Additional route handlers can be added here

  return createServer(app);
}