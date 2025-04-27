import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "./services/openai";
import axios from 'axios';

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
      from: '"Expert Cyber Conversationnel" <rapport@i-am-cyber.com>',
      to: userEmail,
      subject: `Rapport de session Expert Cyber Conversationnel - ${userName}`,
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

// Structure des données de session Expert Cyber Conversationnel
interface AgentSessionData {
  userEmail: string;
  userName: string;
  messages: Array<any>;
  duration?: number;
}

/**
 * Initialise une session d'Expert Cyber Conversationnel
 */
export async function startAgentSession(req: Request, res: Response) {
  try {
    const { userEmail, userName } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({
        success: false,
        error: 'Email et nom d\'utilisateur requis'
      });
    }
    
    // Créer la session avec les paramètres initiaux
    const sessionData: AgentSessionData = {
      userEmail,
      userName,
      messages: [],
      duration: 0
    };
    
    // S'assurer que l'en-tête Content-Type est correctement défini
    res.setHeader('Content-Type', 'application/json');
    
    // Renvoyer explicitement les données JSON
    return res.json({
      success: true,
      message: 'Session Expert Cyber Conversationnel initialisée avec succès',
      sessionData
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session Expert Cyber Conversationnel:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'initialisation de la session'
    });
  }
}

/**
 * Génère une explication de domaine cybersécurité dynamique et à jour
 * Cette fonction recherche des actualités et des statistiques récentes 
 * pour créer un contenu toujours différent et pertinent
 */
export async function generateDomainExplanation(req: Request, res: Response) {
  try {
    const { domainId, userName } = req.body;
    
    if (!domainId) {
      return res.status(400).json({
        success: false,
        error: 'Domaine de cybersécurité requis'
      });
    }
    
    // Récupérer le nom du domaine en français
    const domainNames: {[key: string]: string} = {
      "gestion-crise": "Gestion de crise cyber",
      "donnees-personnelles": "Protection des données personnelles / RGPD",
      "ingenierie-sociale": "Ingénierie sociale et phishing",
      "gestion-incidents": "Gestion des incidents de sécurité",
      "supply-chain": "Sécurité de la chaîne d'approvisionnement",
      "strategie-cyber": "Stratégie et gouvernance cybersécurité"
    };
    
    const domainName = domainNames[domainId] || "Cybersécurité";
    const firstName = userName ? userName.split(' ')[0] : "utilisateur";
    
    // Construire la demande avec la date actuelle pour garantir des informations à jour
    const currentDate = new Date().toISOString().split('T')[0];
    
    const promptMessages: ChatCompletionRequestMessage[] = [
      { 
        role: 'system', 
        content: `Tu es un expert en cybersécurité qui génère des explications pédagogiques dynamiques et toujours différentes.
        
Pour chaque domaine de la cybersécurité, tu dois:
1. Créer une explication courte mais informative (maximum 5 phrases)
2. Intégrer une anecdote ou un cas réel RÉCENT (2024-2025) lié au domaine
3. Mentionner des statistiques ou tendances actuelles
4. Utiliser un ton pédagogique mais professionnel
5. Format: Markdown avec des mots clés en **gras** et des chiffres mis en évidence

La date actuelle est le ${currentDate}.`
      },
      { 
        role: 'user', 
        content: `Génère une explication dynamique pour le domaine: "${domainName}" qui commencerait par "**Excellent choix, ${firstName} !** Vous avez sélectionné la **${domainName}**.\n\n"`
      }
    ];
    
    // Obtenir l'explication générée par l'IA avec une température plus élevée pour la variété
    let explanation = '';
    
    try {
      explanation = await openAIService.getChatCompletion(
        promptMessages, 
        0.8,   // temperature élevée pour garantir la variété
        800    // max_tokens suffisant pour une explication détaillée
      );
      
      // S'assurer que l'explication commence correctement
      if (!explanation.startsWith("**Excellent choix")) {
        explanation = `**Excellent choix, ${firstName} !** Vous avez sélectionné la **${domainName}**.\n\n${explanation}`;
      }
      
      // Ajouter l'annonce de l'email
      explanation += `\n\nJe vais maintenant vous envoyer un premier email avec un problème concret à résoudre dans ce domaine. Cet exercice vous permettra de mettre en pratique vos connaissances.`;
      
    } catch (apiError) {
      console.error('Erreur API lors de la génération de l\'explication:', apiError);
      
      // Générer une explication de secours en cas d'erreur
      explanation = `**Excellent choix, ${firstName} !** Vous avez sélectionné la **${domainName}**.\n\n
Ce domaine essentiel de la cybersécurité représente un enjeu majeur pour les organisations modernes. L'importance de ce domaine ne cesse de croître alors que les menaces évoluent constamment.\n\n
Je vais maintenant vous envoyer un premier email avec un problème concret à résoudre dans ce domaine. Cet exercice vous permettra de mettre en pratique vos connaissances.`;
    }
    
    // S'assurer que l'en-tête Content-Type est correctement défini
    res.setHeader('Content-Type', 'application/json');
    
    return res.json({
      success: true,
      explanation: explanation
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'explication du domaine:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la génération de l\'explication du domaine'
    });
  }
}

/**
 * Termine une session Expert Cyber Conversationnel et envoie un rapport par email
 */
export async function completeAgentSession(req: Request, res: Response) {
  try {
    const { userEmail, userName, messages, duration } = req.body;
    
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
    const evaluationPrompt = `Analyse la conversation suivante entre l'utilisateur ${userName} et l'Expert Cyber Conversationnel.
     
La conversation a duré environ ${Math.round(duration / 60)} minutes.

Ton objectif est de produire un rapport d'analyse structuré qui sera envoyé par email à l'utilisateur.

Inclus dans ton rapport:
1. Un résumé des principaux sujets abordés
2. 3-4 points clés de cybersécurité qui ont été discutés
3. Des suggestions pour approfondir les connaissances
4. Une évaluation globale de la pertinence des échanges

Format ton rapport sous forme HTML bien structuré avec des sections clairement délimitées.`;

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
        1000   // max_tokens
      );
    } catch (apiError) {
      console.error('Erreur API lors de la génération du rapport:', apiError);
      
      // Générer un rapport de secours en cas d'erreur
      fallbackMode = true;
      
      evaluationHtml = `
<h1>Rapport de Session Expert Cyber Conversationnel</h1>

<h2>Résumé de la session</h2>
<p>L'utilisateur ${userName} a interagi avec l'Expert Cyber Conversationnel pendant environ ${Math.round(duration / 60)} minutes.</p>
<p>Durant cette session, plusieurs sujets de cybersécurité ont été abordés.</p>

<h2>Points clés discutés</h2>
<ul>
  <li>Principes fondamentaux de la cybersécurité</li>
  <li>Bonnes pratiques de protection des données</li>
  <li>Sensibilisation aux risques cyber</li>
</ul>

<h2>Suggestions pour approfondir</h2>
<p>Nous vous recommandons de continuer à explorer les ressources disponibles sur notre plateforme.</p>
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
  </style>
</head>
<body>
  <div class="header">
    <h1>I AM CYBER - Expert Cyber Conversationnel</h1>
    <p>Rapport de session interactive</p>
  </div>
  
  <div class="content">
    <div class="session-details">
      <p><strong>Utilisateur:</strong> ${userName}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      <p><strong>Durée:</strong> ${Math.round(duration / 60)} minutes</p>
    </div>
    
    ${evaluationHtml}
    
    <div style="margin-top: 30px;">
      <p>Merci d'avoir utilisé I AM CYBER - Expert Cyber Conversationnel.</p>
      <p>Ce rapport a été généré automatiquement à la fin de votre session.</p>
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
Sujet: Rapport de session I AM CYBER - Expert Cyber Conversationnel - ${userName}
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
          subject: `Rapport de session I AM CYBER - Expert Cyber Conversationnel - ${userName}`,
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
    console.error('Erreur lors de la finalisation de la session Expert Cyber Conversationnel:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la session.'
    });
  }
}