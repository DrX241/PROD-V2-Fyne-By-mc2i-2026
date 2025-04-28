import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { openAIService } from "./services/openai";
// Import de document-generator supprimé car nous n'utilisons plus de pièces jointes
import { ChatCompletionRequestMessage } from "@shared/schema";
import { evaluateDecision } from "./cyberDefenseEvaluator";
import { handleCyberDefenseChat, generateCyberDefenseMission } from "./cyberDefenseController";
import { extractJsonFromOpenAiResponse, createFallbackJson } from "./openAiResponseHelper";
import { startInterviewSimulation, processInterviewMessage, completeInterviewSimulation, analyzeInterviewNotes } from "./interviewSimulationController";
import { getRandomScenarios, getScenarioById, getScenariosByDifficulty } from "./impostorService";
import { startAgentSession, completeAgentSession } from "./cyberAgentController";
import { generateDebriefing, getContextualDocumentation } from "./cyberLearningController";
// Import des fonctions d'urgence cyber supprimé

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Nous n'avons plus besoin des répertoires de documents et HTML
  // car nous n'utilisons plus de pièces jointes

  // API route for starting a scenario
  app.post('/api/cyber/start-scenario', async (req, res) => {
    try {
      const { scenarioId, userName, config } = req.body;
      
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
      const systemPrompt = await openAIService.generateSystemPrompt({
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

      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Générez un email COURT et ACCUEILLANT (maximum 150 mots) pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec les détails suivants:
          - L'email doit provenir de ${contactPrincipal.name} (${contactPrincipal.role})
          - L'email doit être adressé à ${userName} en utilisant le tutoiement ("tu") 
          - Le secteur d'activité pour ce scénario est: ${secteurActivite}
          - Le nom d'entreprise pour ce scénario est: ${companyName}
          - L'email doit être un message d'accueil chaleureux où le PNJ se présente brièvement et présente l'entreprise ${companyName} succinctement
          - IMPORTANT: Expose directement un problème ou une question de cybersécurité spécifique au domaine "${scenario.domain}" et demande explicitement l'avis de ${userName} sur cette question
          - Le problème doit être concret, spécifique et adapté au secteur d'activité
          - Demande à ${userName} d'expliquer son point de vue ou de proposer une approche pour résoudre ce problème
          - IMPORTANT: NE PAS mentionner ou faire référence à des pièces jointes, documents ou fichiers
          - Le ton doit être chaleureux, accueillant et professionnel, en utilisant le tutoiement
          - Le style d'écriture doit correspondre au rôle de ${contactPrincipal.role}: professionnel et adapté
          - Rédigez uniquement l'email, pas de commentaires ou d'explications`
        }
      ];
      
      const emailContent = await openAIService.getChatCompletionWithCache(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
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
      
      // Les informations sont maintenant intégrées directement dans le message
      
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
      
      // Create email response - le premier message vient toujours du contact principal du scénario
      const email = {
        id: uuidv4(),
        from: scenarioContacts[0], // Utiliser le premier contact de la liste (le contact principal du scénario)
        to: `${userName}@mc2i.fr`,
        subject,
        date: new Date().toISOString(),
        body,
        // Ajouter les contacts qui interviendront dans ce scénario (maximum 3 au total)
        scenarioContacts: scenarioContacts
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
      const { message, userName, scenarioId, config, chatHistory, scenarioContacts } = req.body;
      
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
      const systemPrompt = await openAIService.generateSystemPrompt({
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
      
      // Add the instruction about response evaluation and interlocutors
      const systemContent = systemPrompt + 
        `\n\nRÈGLE IMPORTANTE: Tu réponds en tant que ${respondingContact.name}, ${respondingContact.role}. Tu ne dois JAMAIS mentionner Azure OpenAI ou GPT.` +
        
        `\n\nEXPERTISE SPÉCIFIQUE: ${respondingContact.expertise || 'Non spécifiée'}. Tu possèdes une expertise unique qui doit transparaître dans tes réponses.` +
        
        `\n\nPRÉOCCUPATION PRINCIPALE: ${respondingContact.concern || 'Non spécifiée'}. Chaque interlocuteur a des préoccupations différentes face à la même problématique cyber.` +
        
        `\n\nCONTEXTE SECTORIEL: Ce scénario se déroule dans le secteur ${secteurActivite}. Adapte ton vocabulaire, tes références et tes exemples à ce secteur d'activité spécifique.` +
        
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
        
        "\n\nRÈGLE DU JEU DE RÔLE AVANCÉ: Tu dois absolument adapter ton style de communication, ton vocabulaire et tes préoccupations à ton profil et au secteur. Un expert cybersécurité dans le secteur bancaire ne parle pas comme un directeur financier dans le secteur industriel. Modifie complètement ton approche en fonction de ton rôle, du contexte sectoriel et de tes préoccupations principales." +
        
        "\n\nÉVALUATION DES RÉPONSES: Guide l'utilisateur avec bienveillance. Valorise ses réponses et complète-les si nécessaire. Même si la réponse est imparfaite, trouve-y des éléments positifs pour encourager l'apprentissage. Si besoin, suggère des améliorations de façon constructive et pédagogique." +
        
        `\n\nINTERDICTION ABSOLUE: Ne jamais dire "En tant que [nom], je..." ou "Dans mon rôle de [fonction], je...". Incarne directement le personnage, parle naturellement comme le ferait cette personne dans son contexte professionnel.`;
      
      // Create the base messages array
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: systemContent
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
        console.log("DEBUG - Chat history types:", chatHistory.map(item => item.type).join(", "));
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
      
      // Vérifier si c'est le moment d'intervenir avec le système I AM CYBER
      // Après 3 échanges complets, l'historique contient: email + 3*(user+bot) + user = 8 messages
      // Et le message actuel est le 9ème (pour un total de 9 messages dans l'historique après cette requête)
      const isIamCyberIntervention = exchangeCount === 3;
      
      console.log(`DEBUG - Final exchange count: ${exchangeCount}`);
      console.log(`DEBUG - Is I AM CYBER intervention: ${isIamCyberIntervention}`);
      
      // Ajouter des métadonnées structurées pour aider l'IA à suivre le flux de conversation
      const contextMetadata = {
        userName: userName,
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
                           isIamCyberIntervention ? "INTERVENTION_SYSTEM" : "CONVERSATION_STANDARD",
        messageHistoryLength: chatHistory ? chatHistory.length : 0
      };
      
      // Créer un message unique qui contient toutes les informations nécessaires
      messages.push({
        role: "user",
        content: `Je suis ${userName} et voici mon message : "${message}"

MÉTADONNÉES DE CONTEXTE:
${JSON.stringify(contextMetadata, null, 2)}

Utilise les métadonnées ci-dessus et le master prompt pour déterminer comment répondre selon le flux de conversation défini.

IMPORTANT:
- SI c'est une réponse initiale (REPONSE_INITIALE), réponds directement à ce que l'utilisateur dit concernant le problème que tu as exposé. NE DEMANDE PAS à l'utilisateur de se présenter.
- SI c'est une intervention système (INTERVENTION_SYSTEM), ta réponse DOIT commencer par: "Je me permets de faire une pause dans cette simulation pour résumer des concepts importants que vous abordez." Puis, en tant que système "I AM CYBER", présente un résumé éducatif de 2 notions importantes abordées dans la conversation. Pour chaque notion, explique: 1) son historique, 2) son impact business et 3) les bonnes pratiques associées. Après ce résumé, termine par "Je laisse maintenant [nom du contact] reprendre la conversation." puis continue avec la réponse normale de ce contact.
- SI c'est une conversation standard (CONVERSATION_STANDARD), reste dans le contexte et réponds à la question en tant que le contact désigné.

Adapte toujours ton style de communication à ton rôle (${respondingContact.role}) et au secteur d'activité (${secteurActivite}).`
      });
      
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
      );
      
      // Check if response indicates scenario termination
      const isScenarioTerminated = responseContent.toLowerCase().includes("fin du scénario") || 
                                   responseContent.toLowerCase().includes("recommencer à zéro") ||
                                   responseContent.toLowerCase().includes("recommencer le scénario");
      
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

          // Obtenir l'évaluation via l'API OpenAI
          const evaluationMessages: ChatCompletionRequestMessage[] = [
            {
              role: "system",
              content: "Tu es un expert en cybersécurité chargé d'évaluer la performance des apprenants dans des scénarios de simulation. Tu dois fournir des évaluations objectives, précises et constructives."
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
  
  // API route pour basculer entre les clés API
  app.post('/api/cyber/switch-api-key', (req: Request, res: Response) => {
    try {
      const { keyType } = req.body;
      
      if (keyType !== 'primary' && keyType !== 'secondary') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid key type. Must be "primary" or "secondary"'
        });
      }
      
      openAIService.switchApiKey(keyType);
      
      res.json({
        status: 'success',
        currentApiKey: keyType,
        modelName: openAIService.getCurrentModelName()
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
      const { message, config, chatHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message requis pour le chat' });
      }
      
      // Construire un prompt système basé sur la configuration
      let systemPrompt = `Tu es un expert en cybersécurité qui évalue les connaissances et compétences des professionnels. 
Tu dois OBLIGATOIREMENT fournir des réponses structurées avec:
1. Un contexte professionnel clair (entreprise fictive en France)
2. Un problème de cybersécurité spécifique à résoudre
3. Des questions de relance pour approfondir la réflexion de l'utilisateur
4. Une évaluation subtile des réponses précédentes de l'utilisateur (si disponibles)

Ton objectif est d'évaluer les compétences du professionnel à travers un dialogue sur des situations réelles.`;
      
      // Ajuster le prompt selon le niveau de difficulté
      if (config?.difficultyLevel === 'Débutant') {
        systemPrompt += `
Niveau: DÉBUTANT
- Présente des situations simples comme une attaque par phishing, un mot de passe faible, un logiciel non mis à jour
- Évite le jargon technique trop spécialisé
- Pose des questions sur les concepts fondamentaux
- Évalue la compréhension des principes de base de la cybersécurité`;
      } else if (config?.difficultyLevel === 'Expert') {
        systemPrompt += `
Niveau: EXPERT
- Présente des situations complexes comme une attaque APT, une vulnérabilité zero-day, une faille dans l'architecture de sécurité
- Utilise un vocabulaire technique précis et spécialisé
- Pose des questions qui exigent une analyse approfondie et des solutions sophistiquées
- Évalue la capacité à proposer des stratégies avancées et à anticiper les problèmes`;
      } else {
        systemPrompt += `
Niveau: INTERMÉDIAIRE
- Présente des situations de difficulté moyenne comme une intrusion détectée, une violation de données, un ransomware
- Utilise un vocabulaire technique modéré avec des explications si nécessaire
- Pose des questions qui nécessitent une analyse et des connaissances techniques solides
- Évalue la capacité à appliquer des bonnes pratiques et à résoudre des problèmes concrets`;
      }
      
      // Définir le contexte de la discussion
      let domaine = "cybersécurité générale";
      if (config?.domaine) {
        domaine = config.domaine;
      } else if (message.toLowerCase().includes("rgpd") || message.toLowerCase().includes("données personnelles")) {
        domaine = "protection des données et RGPD";
      } else if (message.toLowerCase().includes("ransomware") || message.toLowerCase().includes("rançon")) {
        domaine = "gestion des incidents de ransomware";
      } else if (message.toLowerCase().includes("phishing") || message.toLowerCase().includes("hameçonnage")) {
        domaine = "protection contre le phishing";
      } else if (message.toLowerCase().includes("iam") || message.toLowerCase().includes("identité")) {
        domaine = "gestion des identités et des accès";
      }
      
      systemPrompt += `
Domaine de spécialité: ${domaine}
Tu dois créer des situations réalistes qui permettent d'évaluer les connaissances et les compétences de l'utilisateur dans ce domaine.

IMPORTANT:
- Chaque réponse doit comporter au moins une question de relance ou un problème à résoudre
- Ne félicite pas directement l'utilisateur, mais valorise subtilement les bonnes réponses
- Les problèmes présentés doivent être réalistes et basés sur des situations professionnelles en France ou en Europe
- Limite tes réponses à 2-3 paragraphes maximum, en restant concis et précis
- Réponds toujours en français
- Adapte progressivement la difficulté en fonction des réponses précédentes`;
      
      // Préparer les messages incluant l'historique de conversation
      const chatMessages = [];
      
      // Message système pour guider le modèle
      chatMessages.push({ role: "system", content: systemPrompt });
      
      // Historique des conversations pour le contexte
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Limiter l'historique aux 5 derniers messages pour éviter les dépassements de contexte
        const recentHistory = chatHistory.slice(-5);
        
        // Ajouter chaque message à la conversation
        recentHistory.forEach(msg => {
          const role = msg.sender === 'user' ? 'user' : 'assistant';
          chatMessages.push({ role, content: msg.content });
        });
      }
      
      // Ajouter le message actuel de l'utilisateur
      chatMessages.push({ role: "user", content: message });
      
      // Appel à l'API Azure OpenAI avec l'historique complet
      const completion = await openai.chat.completions.create({
        messages: chatMessages,
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

  // Routes pour le système d'urgence cyber interactif
  // Les routes d'urgence cyber ont été supprimées

  return createServer(app);
}