import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "./services/openai";

/**
 * Envoie un email de test avec Ethereal pour les environnements de développement
 */
async function sendWithEthereal(userEmail: string, userName: string, emailHtml: string) {
  try {
    // Configuration de nodemailer avec service de test d'email Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    // Configuration de l'email
    const mailOptions = {
      from: '"Agent IA Immersif" <rapport@i-am-cyber.com>',
      to: userEmail,
      subject: `Rapport de session Agent IA Immersif - ${userName}`,
      html: emailHtml
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email de test envoyé: %s', info.messageId);
    // URL de prévisualisation de l'email généré par Ethereal
    console.log('Aperçu de l\'email: %s', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (etherealError) {
    console.error('Erreur lors de l\'envoi avec Ethereal:', etherealError);
    return {
      success: false,
      error: etherealError
    };
  }
}

// Structure des données de session Agent IA Immersif
interface AiAgentSessionData {
  userEmail: string;
  userName: string;
  messages: Array<any>;
  duration?: number;
  // Nouvelles propriétés spécifiques à Agent IA
  skillAssessment?: {
    technical: number,
    analytical: number,
    strategic: number,
    communication: number
  };
  virtualEnvironment?: string; // 'command-center', 'analysis-lab', 'crisis-room'
  currentNPC?: string;
}

/**
 * Initialise une session d'Agent IA Immersif
 */
export async function startAiAgentSession(req: Request, res: Response) {
  try {
    const { userEmail, userName, virtualEnvironment = 'command-center' } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({
        success: false,
        error: 'Email et nom d\'utilisateur requis'
      });
    }
    
    // Initialiser les compétences avec des valeurs de base
    const initialSkills = {
      technical: 20,
      analytical: 20, 
      strategic: 20,
      communication: 20
    };
    
    // Créer la session avec les paramètres initiaux
    const sessionData: AiAgentSessionData = {
      userEmail,
      userName,
      messages: [],
      duration: 0,
      skillAssessment: initialSkills,
      virtualEnvironment,
      currentNPC: 'SOC Analyst' // NPC initial par défaut
    };
    
    // S'assurer que l'en-tête Content-Type est correctement défini
    res.setHeader('Content-Type', 'application/json');
    
    // Renvoyer explicitement les données JSON
    return res.json({
      success: true,
      message: 'Session Agent IA Immersif initialisée avec succès',
      sessionData
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session Agent IA Immersif:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'initialisation de la session'
    });
  }
}

/**
 * Termine une session Agent IA Immersif et envoie un rapport par email
 */
export async function completeAiAgentSession(req: Request, res: Response) {
  try {
    const { userEmail, userName, messages, duration, skillAssessment } = req.body;
    
    if (!userEmail || !userName || !messages) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants pour générer le rapport'
      });
    }
    
    // Formater les messages pour l'IA
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Générer le prompt pour l'évaluation par l'IA 
    const evaluationPrompt = `Analyse la conversation suivante entre l'utilisateur ${userName} et l'Agent IA Immersif.
     
La conversation a duré environ ${Math.round(duration / 60)} minutes.

Les compétences de l'utilisateur ont été évaluées comme suit:
- Compétences techniques: ${skillAssessment?.technical || 'Non évaluées'}%
- Compétences analytiques: ${skillAssessment?.analytical || 'Non évaluées'}% 
- Compétences stratégiques: ${skillAssessment?.strategic || 'Non évaluées'}%
- Compétences de communication: ${skillAssessment?.communication || 'Non évaluées'}%

Ton objectif est de produire un rapport d'analyse structuré qui sera envoyé par email à l'utilisateur.

Inclus dans ton rapport:
1. Un résumé des principaux sujets abordés
2. Une analyse détaillée des compétences de l'utilisateur avec ses forces et ses axes d'amélioration
3. Des suggestions d'apprentissage personnalisées basées sur ses points faibles
4. Des ressources recommandées pour approfondir ses connaissances

Format ton rapport sous forme HTML bien structuré avec des sections clairement délimitées et des visualisations graphiques de ses compétences.`;

    // Messages pour l'API
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: evaluationPrompt },
      ...formattedMessages
    ];

    let evaluationHtml = '';
    let fallbackMode = false;
    
    try {
      // Obtenir l'évaluation générée par l'IA
      evaluationHtml = await openAIService.getChatCompletion(
        promptMessages, 
        0.7,   // temperature
        1500   // max_tokens augmentés pour un rapport plus détaillé
      );
    } catch (apiError) {
      console.error('Erreur API lors de la génération du rapport:', apiError);
      
      // Générer un rapport de secours en cas d'erreur
      fallbackMode = true;
      
      // Version plus élaborée du rapport de secours
      evaluationHtml = `
<h1>Rapport de Session Agent IA Immersif</h1>

<h2>Résumé de la session</h2>
<p>L'utilisateur ${userName} a interagi avec l'Agent IA Immersif pendant environ ${Math.round(duration / 60)} minutes.</p>
<p>Durant cette session, plusieurs sujets de cybersécurité ont été abordés dans un environnement d'apprentissage interactif.</p>

<h2>Évaluation des compétences</h2>
<div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <h3>Tableau de bord des compétences</h3>
  <ul>
    <li><strong>Compétences techniques:</strong> ${skillAssessment?.technical || 'Non évaluées'}%</li>
    <li><strong>Compétences analytiques:</strong> ${skillAssessment?.analytical || 'Non évaluées'}%</li>
    <li><strong>Compétences stratégiques:</strong> ${skillAssessment?.strategic || 'Non évaluées'}%</li>
    <li><strong>Compétences de communication:</strong> ${skillAssessment?.communication || 'Non évaluées'}%</li>
  </ul>
</div>

<h2>Points forts identifiés</h2>
<ul>
  <li>Compréhension des principes fondamentaux de la cybersécurité</li>
  <li>Capacité à analyser les situations de crise</li>
</ul>

<h2>Axes d'amélioration</h2>
<ul>
  <li>Approfondir les connaissances techniques spécifiques</li>
  <li>Développer des stratégies de réponse aux incidents plus élaborées</li>
</ul>

<h2>Ressources recommandées</h2>
<p>Nous vous recommandons de continuer à explorer les modules suivants sur notre plateforme :</p>
<ul>
  <li>Centre de Crise - Simulations avancées</li>
  <li>Cyber Investigator - Analyses forensiques</li>
</ul>
<p>Note: Ce rapport a été généré en mode de secours suite à une erreur technique.</p>`;
    }

    // Formater l'email complet
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #0a192f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }
    h1, h2, h3 { color: #0a192f; }
    .highlight { color: #46cada; }
    .session-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #46cada; margin: 20px 0; }
    .skill-bar { height: 20px; background-color: #e0e0e0; border-radius: 10px; margin: 5px 0; overflow: hidden; }
    .skill-fill { height: 100%; background-color: #46cada; }
    .skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .skill-card { background-color: #f0f8ff; padding: 15px; border-radius: 8px; }
    .recommendations { background-color: #f0fff0; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>I AM CYBER - Agent IA Immersif</h1>
    <p>Rapport d'évaluation personnalisé</p>
  </div>
  
  <div class="content">
    <div class="session-details">
      <p><strong>Utilisateur:</strong> ${userName}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      <p><strong>Durée:</strong> ${Math.round(duration / 60)} minutes</p>
    </div>
    
    ${evaluationHtml}
    
    <div style="margin-top: 30px;">
      <p>Merci d'avoir utilisé I AM CYBER - Agent IA Immersif.</p>
      <p>Ce rapport a été généré automatiquement à la fin de votre session et analysé par notre système d'IA pédagogique.</p>
    </div>
  </div>
  
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} I AM CYBER - Tous droits réservés</p>
  </div>
</body>
</html>`;

    // Affichage dans la console pour le débogage
    console.log(`
---------- ENVOI D'EMAIL ----------
À: ${userEmail}
Sujet: Rapport de session Agent IA Immersif - ${userName}
Mode de secours: ${fallbackMode}
----------------------------------`);

    // Tenter d'envoyer l'email
    let emailResult;
    try {
      // Utiliser le service Ethereal pour les tests
      emailResult = await sendWithEthereal(userEmail, userName, emailHtml);
      
      // Implémenter ici l'envoi avec SendGrid pour la production
      // Vérifier si SendGrid est configuré
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
          to: userEmail,
          from: 'rapport@i-am-cyber.com',
          subject: `Rapport de session Agent IA Immersif - ${userName}`,
          html: emailHtml
        });
        console.log('Email envoyé avec SendGrid');
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Continuer l'exécution même si l'envoi d'email échoue
    }

    // S'assurer que l'en-tête Content-Type est correctement défini
    res.setHeader('Content-Type', 'application/json');
    
    return res.json({
      success: true,
      message: 'Rapport généré et envoyé avec succès.',
      emailPreview: emailResult?.previewUrl || null,
      evaluation: evaluationHtml
    });

  } catch (error) {
    console.error('Erreur lors de la finalisation de la session Agent IA Immersif:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la session.'
    });
  }
}

/**
 * Met à jour l'évaluation des compétences pendant la session
 */
export async function updateSkillAssessment(req: Request, res: Response) {
  try {
    const { userInput, currentSkills, context } = req.body;
    
    if (!userInput || !currentSkills) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes pour l\'évaluation des compétences'
      });
    }
    
    // Analyser l'entrée de l'utilisateur pour évaluer les compétences
    const systemPrompt = `
Tu es un système d'évaluation de compétences en cybersécurité.
Analyse la réponse de l'utilisateur et évalue ses compétences sur les axes suivants:
1. Compétences techniques: connaissance des outils, protocoles et systèmes de sécurité
2. Compétences analytiques: capacité à analyser des données, identifier des patterns et résoudre des problèmes
3. Compétences stratégiques: vision globale, planification et gestion des risques
4. Compétences de communication: clarté, structure et pertinence de la communication

Contexte de l'échange: ${context || 'Discussion générale sur la cybersécurité'}

Les niveaux actuels des compétences sont:
- Technique: ${currentSkills.technical}%
- Analytique: ${currentSkills.analytical}%
- Stratégique: ${currentSkills.strategic}%
- Communication: ${currentSkills.communication}%

Réponds UNIQUEMENT au format JSON avec les valeurs ajustées (augmentation ou diminution de 1 à 5 points maximum par compétence) et une brève analyse:
{
  "technical": nombre (pourcentage),
  "analytical": nombre (pourcentage),
  "strategic": nombre (pourcentage),
  "communication": nombre (pourcentage),
  "analysis": {
    "strengths": ["force 1", "force 2"],
    "improvements": ["amélioration 1", "amélioration 2"]
  }
}
`;
    
    // Messages pour l'API
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];
    
    let skillEvaluation;
    try {
      // Obtenir l'évaluation générée par l'IA
      const evaluationResponse = await openAIService.getChatCompletion(
        promptMessages, 
        0.3,   // temperature plus faible pour obtenir des résultats plus cohérents
        800    // max_tokens
      );
      
      // Extraire le JSON de la réponse
      skillEvaluation = JSON.parse(evaluationResponse);
    } catch (apiError) {
      console.error('Erreur API lors de l\'évaluation des compétences:', apiError);
      
      // Génération aléatoire en cas d'erreur (légères variations)
      const randomAdjustment = () => Math.floor(Math.random() * 3) - 1; // -1, 0, ou +1
      
      skillEvaluation = {
        technical: Math.min(100, Math.max(0, currentSkills.technical + randomAdjustment())),
        analytical: Math.min(100, Math.max(0, currentSkills.analytical + randomAdjustment())),
        strategic: Math.min(100, Math.max(0, currentSkills.strategic + randomAdjustment())),
        communication: Math.min(100, Math.max(0, currentSkills.communication + randomAdjustment())),
        analysis: {
          strengths: ["Engagement dans l'apprentissage"],
          improvements: ["Continuez à pratiquer"]
        }
      };
    }
    
    // Assurer que les valeurs sont dans la plage correcte (0-100)
    const normalizedSkills = {
      technical: Math.min(100, Math.max(0, skillEvaluation.technical)),
      analytical: Math.min(100, Math.max(0, skillEvaluation.analytical)),
      strategic: Math.min(100, Math.max(0, skillEvaluation.strategic)),
      communication: Math.min(100, Math.max(0, skillEvaluation.communication))
    };
    
    return res.json({
      success: true,
      skillAssessment: normalizedSkills,
      analysis: skillEvaluation.analysis
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'évaluation des compétences:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'évaluation des compétences'
    });
  }
}

/**
 * Génère des suggestions contextuelles de réponse
 */
export async function generateResponseSuggestions(req: Request, res: Response) {
  try {
    const { currentMessage, conversationHistory, userSkills } = req.body;
    
    if (!currentMessage || !conversationHistory) {
      return res.status(400).json({
        success: false,
        error: 'Message ou historique de conversation manquant'
      });
    }
    
    // Convertir l'historique de conversation au format attendu par l'API
    const formattedHistory = conversationHistory.map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Créer le prompt système pour générer des suggestions
    const systemPrompt = `
Tu es un assistant pédagogique en cybersécurité qui aide des professionnels en formation.
Ton objectif est de générer 3 suggestions de réponses différentes que l'utilisateur pourrait donner au message précédent.

Adapte les suggestions au niveau de compétence de l'utilisateur:
${userSkills ? `
- Compétences techniques: ${userSkills.technical}%
- Compétences analytiques: ${userSkills.analytical}%
- Compétences stratégiques: ${userSkills.strategic}%
- Compétences de communication: ${userSkills.communication}%
` : 'Niveau de compétence inconnu'}

Chaque suggestion doit:
1. Être une réponse directe au dernier message du PNJ
2. Avoir une approche différente (technique, analytique, ou stratégique)
3. Être naturelle et concise (50-75 mots maximum)
4. Inclure une indication de l'impact sur les compétences

Réponds UNIQUEMENT au format JSON:
[
  {
    "text": "Texte de la première suggestion",
    "approach": "technique | analytique | stratégique",
    "skillImpact": {
      "primary": "technical | analytical | strategic | communication",
      "secondary": "technical | analytical | strategic | communication"
    }
  },
  {...},
  {...}
]`;

    // Ajouter le dernier message reçu comme contexte
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory.slice(-5), // Limiter à 5 derniers messages pour le contexte
      { role: 'user', content: `Le dernier message que j'ai reçu est: "${currentMessage}". Génère 3 suggestions de réponses différentes.` }
    ];

    let suggestions;
    try {
      // Obtenir les suggestions générées par l'IA
      const suggestionsResponse = await openAIService.getChatCompletion(
        messages,
        0.7, // Temperature plus élevée pour la créativité 
        1000 // max_tokens
      );
      
      // Extraire le JSON de la réponse
      suggestions = JSON.parse(suggestionsResponse);
    } catch (apiError) {
      console.error('Erreur API lors de la génération des suggestions:', apiError);
      
      // Suggestions de secours
      suggestions = [
        {
          text: "Je vais d'abord analyser la structure du réseau pour identifier les vecteurs d'attaque potentiels et ensuite déterminer les mesures de protection adaptées.",
          approach: "analytique",
          skillImpact: { primary: "analytical", secondary: "technical" }
        },
        {
          text: "Nous devrions immédiatement isoler les systèmes critiques et lancer une analyse des logs pour identifier l'origine de la compromission.",
          approach: "technique",
          skillImpact: { primary: "technical", secondary: "strategic" }
        },
        {
          text: "Je propose de réunir l'équipe de gestion de crise et d'établir un plan de communication transparent tout en mobilisant nos ressources techniques.",
          approach: "stratégique",
          skillImpact: { primary: "strategic", secondary: "communication" }
        }
      ];
    }
    
    return res.json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération des suggestions:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des suggestions'
    });
  }
}