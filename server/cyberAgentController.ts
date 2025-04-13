import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "../I_AM_CYBER/services/openai";

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
      from: '"I AM CYBER - Agent IA" <rapport@i-am-cyber.com>',
      to: userEmail,
      subject: `Rapport de session I AM CYBER - Agent IA - ${userName}`,
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
      message: 'Session Agent IA initialisée avec succès',
      sessionData
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session Agent IA:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'initialisation de la session'
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
    const evaluationPrompt = `Analyse la conversation suivante entre l'utilisateur ${userName} et l'Agent IA (I AM CYBER).
     
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
<h1>Rapport de Session I AM CYBER - Agent IA</h1>

<h2>Résumé de la session</h2>
<p>L'utilisateur ${userName} a interagi avec l'Agent IA pendant environ ${Math.round(duration / 60)} minutes.</p>
<p>Durant cette session, plusieurs sujets de cybersécurité ont été abordés.</p>

<h2>Points clés discutés</h2>
<ul>
  <li>Principes fondamentaux de la cybersécurité</li>
  <li>Bonnes pratiques de protection des données</li>
  <li>Sensibilisation aux risques cyber</li>
</ul>

<h2>Suggestions pour approfondir</h2>
<p>Nous vous recommandons de continuer à explorer les ressources disponibles sur notre plateforme I AM CYBER.</p>
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
    <h1>I AM CYBER - Agent IA</h1>
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
      <p>Merci d'avoir utilisé I AM CYBER - Agent IA.</p>
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
Sujet: Rapport de session I AM CYBER - Agent IA - ${userName}
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
          subject: `Rapport de session I AM CYBER - Agent IA - ${userName}`,
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
    console.error('Erreur lors de la finalisation de la session Agent IA:', error);
    
    // S'assurer que l'en-tête Content-Type est correctement défini même en cas d'erreur
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la session.'
    });
  }
}