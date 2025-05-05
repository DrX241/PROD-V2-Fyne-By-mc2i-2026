import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { openAIService } from "./services/openai";
import attachmentRoutes from './routes/attachmentRoutes';
import cyberForgeRoutes from './routes/cyberForgeRoutes';
import { createAttachmentWithHiddenPassword } from './services/attachmentService';
import { CyberScenario, CrisisDecisionContent, CrisisDecisionOption } from '../shared/types/cyber';

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
import { generateDebriefing, getContextualDocumentation } from "./cyberLearningController";
import { initMcaiLearningSession, processMcaiLearningMessage } from "./mcaiLearningController";
import { initCyberExpertSession, processCyberExpertMessage, terminateCyberExpertSession } from "./cyberExpertController";
import { startDecisionFlow, submitDecision, checkDecisionStatus } from "./cyberExpertDecisions";
import { simulateTargetResponse, analyzePerformance } from "./brainHackerController";
import { analyzeEvidence, getInvestigationHints, evaluateInvestigationResult, generateInvestigationScenario, generateInvestigationNotes } from "./cyberInvestigatorController";
import { getInvestigationProgress, saveInvestigationProgress, evaluateUserNotes } from "./investigationProgressController";
import { 
  getAssistantTemplates, 
  getAssistantTemplate, 
  getUserAssistants, 
  createAssistant, 
  updateAssistant, 
  deleteAssistant, 
  initConversation, 
  sendMessage, 
  getConversationHistory, 
  getPopularAssistants,
  detectDuplicates,
  mergeTemplates,
  searchSimilarAssistants,
  deleteTemplate
} from "./customAssistantsController";
import { getOrCreateUser, getUserById } from "./userController";
import {
  generateCode,
  getCodeGenerationHistory,
  saveGeneratedCode,
  generatePromptExamples
} from "./codeGeneratorController";
import {
  generateQuestions,
  evaluateResponses,
  generateCertificate,
  getTestOptions
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
  // Routes pour le générateur de code
  app.post("/api/code-generator/generate", (req: Request, res: Response) => {
    generateCode(req, res);
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
  // Servir les pièces jointes depuis le dossier public/attachments
  app.use('/attachments', express.static(path.join(__dirname, 'public/attachments')));
  
  // Enregistrer les routes pour les pièces jointes
  app.use('/api/attachments', attachmentRoutes);
  
  // Enregistrer les routes pour CyberForge Academy
  app.use('/api/ai', cyberForgeRoutes);
  
  // Routes pour le module de test technique cybersécurité
  app.get('/api/cyber/test-technique/options', getTestOptions);
  app.post('/api/cyber/test-technique/generate', generateQuestions);
  app.post('/api/cyber/test-technique/evaluate', evaluateResponses);
  app.post('/api/cyber/test-technique/certificate', generateCertificate);
  
  // Routes pour le jeu BrainHacker (ingénierie sociale)
  app.post('/api/cyber/arcade/brain-hacker/simulate', simulateTargetResponse);
  app.post('/api/cyber/arcade/brain-hacker/analyze', analyzePerformance);
  
  // Routes pour mc2i AI Learning
  app.post('/api/mcai-learning/init', initMcaiLearningSession);
  app.post('/api/mcai-learning/message', processMcaiLearningMessage);
  
  // Routes pour les assistants personnalisés
  // Routes utilisateur
  app.post('/api/user/get-or-create', getOrCreateUser);
  app.get('/api/user/:userId', getUserById);
  
  // Routes assistants
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
  
  // Routes pour la gestion des modèles et la détection des doublons
  app.get('/api/assistants/duplicates/detect', detectDuplicates);
  app.post('/api/assistants/duplicates/merge', mergeTemplates);
  app.get('/api/assistants/search', searchSimilarAssistants);
  app.delete('/api/assistants/templates/:templateId', deleteTemplate);
  
  // Routes pour le chatbot expert en cybersécurité (carte "Apprendre en échangeant")
  app.post('/api/cyber-expert/init', initCyberExpertSession);
  app.post('/api/cyber-expert/message', processCyberExpertMessage);
  app.post('/api/cyber-expert/terminate', terminateCyberExpertSession);
  
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
      
      // Generate email content with Azure OpenAI
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
      
      // Generate response with Azure OpenAI
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

  // API routes pour vérifier le statut de la connexion à Azure OpenAI
  app.get('/api/openai/status', async (req: Request, res: Response) => {
    try {
      const isConnected = await openAIService.checkConnection();
      res.json({
        connectionStatus: isConnected ? 'connected' : 'disconnected',
        currentModel: openAIService.getCurrentModelName(),
        apiKeyType: openAIService.getCurrentConfig(),
        lastCheck: Date.now()
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      res.status(500).json({
        connectionStatus: 'error',
        message: 'Failed to check API connection',
        time: new Date().toISOString()
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
        apiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'default',
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
  
  // API route pour basculer entre les clés API (toujours utilise GPT-4o)
  app.post('/api/cyber/switch-api-key', (req: Request, res: Response) => {
    try {
      const { keyType } = req.body;
      
      if (keyType !== 'primary' && keyType !== 'secondary') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid key type. Must be "primary" or "secondary"'
        });
      }
      
      // Toujours utiliser la clé primaire (GPT-4o) pour de meilleures performances
      openAIService.switchApiKey('primary');
      
      // Mais renvoyer à l'interface la clé demandée pour l'affichage
      const modelName = keyType === 'primary' ? 'gpt-4o' : 'gpt-4o-mini';
      console.log(`Interface indique ${keyType} (${modelName}) mais utilise toujours GPT-4o`);
      
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

  // Initialisation du client OpenAI pour le chat immersif avec Azure OpenAI
  
  const azureApiKey = "1Ue0sQ11eK6J7iLNvSM9HgXOiIqg2a697PTB33PmM9IIDDsA3d4kJQQJ99BBACfhMk5XJ3w3AAAAACOGuvaK";
  const azureEndpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com/";
  const azureDeploymentId = "Eddy-deploy-20-02-2025-gpt-4o"; // Utilisation du modèle principal
  const azureApiVersion = "2024-12-01-preview";
  
  const openai = new OpenAI({
    apiKey: azureApiKey,
    baseURL: `${azureEndpoint}openai/deployments/${azureDeploymentId}`,
    defaultQuery: { "api-version": azureApiVersion },
    defaultHeaders: { "api-key": azureApiKey },
  });
  
  // API route pour le chat immersif
  app.post('/api/cyber/simple-chat', async (req: Request, res: Response) => {
    try {
      const { message, config } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message requis pour le chat' });
      }
      
      // Construire un prompt système basé sur la configuration
      let systemPrompt = "Tu es un assistant spécialisé en cybersécurité qui aide les utilisateurs à comprendre et à se protéger contre les menaces informatiques.";
      
      // Ajuster le prompt selon le niveau de difficulté
      if (config?.difficultyLevel === 'Débutant') {
        systemPrompt += " Tu utilises un langage simple et accessible, en évitant le jargon technique. Tu expliques les concepts de cybersécurité de manière basique pour les débutants.";
      } else if (config?.difficultyLevel === 'Expert') {
        systemPrompt += " Tu utilises un vocabulaire technique précis et tu apportes des informations détaillées et approfondies sur les sujets de cybersécurité pour un public expert.";
      } else {
        systemPrompt += " Tu adaptes ton langage pour un public ayant des connaissances intermédiaires en informatique, en expliquant les termes techniques lorsque nécessaire.";
      }
      
      // Ajuster le prompt selon le style de réponse
      if (config?.responseStyle === 'Détaillé et pédagogique') {
        systemPrompt += " Tes réponses sont détaillées et pédagogiques, avec des explications complètes et des exemples concrets pour illustrer les concepts.";
      } else if (config?.responseStyle === 'Concis et direct') {
        systemPrompt += " Tes réponses sont concises et directes, allant droit au but sans détours inutiles, en te concentrant sur l'essentiel.";
      } else {
        systemPrompt += " Ton style de communication est professionnel et équilibré, ni trop verbeux ni trop concis.";
      }
      
      systemPrompt += " Tu réponds toujours en français.";
      
      // Appel à l'API Azure OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 800,
        model: "gpt-3.5-turbo",
      });
      
      // Envoi de la réponse au client
      res.json({ 
        response: completion.choices[0].message.content,
        usage: completion.usage
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la communication avec Azure OpenAI:', error);
      
      // Gestion des erreurs spécifiques d'OpenAI
      if (error.status === 401) {
        res.status(401).json({ error: 'Erreur d\'authentification API Azure. Vérifiez votre clé API.' });
      } else if (error.status === 429) {
        res.status(429).json({ error: 'Limite de requêtes atteinte. Veuillez réessayer plus tard.' });
      } else {
        res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
      }
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

  // Routes pour les fonctionnalités d'apprentissage
  app.post('/api/cyber/debriefing', generateDebriefing);
  
  // Routes pour la progression des utilisateurs dans les modules d'apprentissage
  app.get('/api/learning/progress/:userId/:moduleId', getUserProgress);
  app.post('/api/learning/progress', saveUserProgress);
  app.get('/api/cyber/documentation', getContextualDocumentation);

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

  // Fin des routes API

  return createServer(app);
}