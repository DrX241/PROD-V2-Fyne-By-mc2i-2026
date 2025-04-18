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
      from: '"Expert AMOA Conversationnel" <rapport@iam-mc2i.com>',
      to: userEmail,
      subject: `Rapport de session Expert AMOA Conversationnel - ${userName}`,
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

interface AgentSessionData {
  userEmail: string;
  userName: string;
  messages: Array<any>;
  duration?: number;
}

/**
 * Initialise une session d'Expert AMOA Conversationnel
 */
export async function startAmoaAgentSession(req: Request, res: Response) {
  const { userEmail, userName } = req.body;
  
  if (!userEmail || !userName) {
    return res.status(400).json({
      success: false,
      error: "Les champs email et nom sont requis"
    });
  }
  
  try {
    // Système de messages pour initialiser la conversation avec l'Assistant OpenAI
    const initialMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Vous êtes l'Expert AMOA Conversationnel de mc2i, spécialisé dans l'assistance à maîtrise d'ouvrage. Votre mission est d'aider les consultants à comprendre les concepts clés de l'AMOA, les méthodologies de gestion de projet, l'analyse des besoins métier, et la transformation digitale.

Vous devez répondre à leurs questions avec expertise et professionnalisme, en vous concentrant sur les meilleures pratiques AMOA dans différents secteurs (banque, assurance, énergie, secteur public, etc.).

Informations importantes:
- Les consultants sont en formation ou en préparation d'entretiens client
- Votre objectif est pédagogique: expliquer clairement les concepts d'AMOA
- Illustrez vos réponses avec des exemples concrets et des cas d'usage métier
- Adaptez votre niveau de langage à l'expérience du consultant (junior/senior)
- Partagez des conseils pratiques et méthodologiques
- Vous êtes supporté par l'IA FYNE de mc2i

Lors de la conversation avec ${userName}, soyez courtois, pédagogue et structuré dans vos réponses.`
      },
      {
        role: "assistant",
        content: `Bonjour ${userName}, je suis votre Expert AMOA Conversationnel de mc2i. Je suis là pour vous aider à comprendre les concepts, méthodologies et bonnes pratiques en Assistance à Maîtrise d'Ouvrage.

Que vous soyez en préparation d'un entretien client, en formation, ou simplement curieux d'approfondir vos connaissances en AMOA, je suis à votre disposition pour répondre à vos questions sur :

• L'expression et l'analyse des besoins métier
• La gestion de projet et la conduite du changement
• Les méthodologies (Agile, cycle en V, etc.)
• Les outils et documents de cadrage (cahier des charges, spécifications)
• Les particularités sectorielles (banque, assurance, énergie, secteur public...)
• La transformation digitale et l'innovation
• Et bien d'autres sujets liés à l'AMOA !

N'hésitez pas à me poser des questions précises. Comment puis-je vous aider aujourd'hui ?`
      }
    ];
    
    // Structure des données de session
    const sessionData: AgentSessionData = {
      userEmail,
      userName,
      messages: initialMessages
    };
    
    // En production, ici on stockerait les données de session dans une BDD
    // Pour le POC, on peut renvoyer directement au client
    
    return res.status(200).json({
      success: true,
      message: "Session Expert AMOA Conversationnel initialisée avec succès",
      data: {
        initialMessages
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session AMOA:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'initialisation de la session AMOA"
    });
  }
}

/**
 * Termine une session Expert AMOA Conversationnel et envoie un rapport par email
 */
export async function completeAmoaAgentSession(req: Request, res: Response) {
  const { userEmail, userName, messages, duration } = req.body;
  
  if (!userEmail || !userName || !messages) {
    return res.status(400).json({
      success: false,
      error: "Information incomplète pour générer le rapport"
    });
  }
  
  try {
    // Calculer la durée formatée
    const durationMinutes = Math.floor((duration || 0) / (1000 * 60));
    const durationSeconds = Math.floor((duration || 0) / 1000) % 60;
    const durationFormatted = `${durationMinutes}m ${durationSeconds}s`;
    
    // Filtrer les messages pour ne garder que ceux de l'utilisateur et de l'assistant (pas les messages système)
    const conversationMessages = messages.filter((msg: any) => msg.role === 'user' || msg.role === 'assistant');
    
    // Construire le prompt pour générer le rapport récapitulatif
    const reportPrompt: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `Vous êtes un analyste expert en AMOA qui doit générer un rapport de synthèse suite à une conversation entre un Expert AMOA Conversationnel et ${userName}. 
Le rapport doit être structuré, professionnel et instructif.
        
Analysez la conversation et produisez:
1. Un résumé des principaux sujets abordés
2. Les points clés et concepts AMOA discutés
3. Des recommandations personnalisées pour approfondir
4. Des ressources supplémentaires pertinentes

Formatez le rapport avec des sections claires, des puces, et une mise en page professionnelle adaptée à un email HTML.
Utilisez un ton formel mais accessible, et maintenez une perspective pédagogique.`
      }
    ];
    
    // Ajouter les messages de la conversation au prompt
    conversationMessages.forEach((msg: any) => {
      reportPrompt.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Ajouter une instruction finale pour le format souhaité
    reportPrompt.push({
      role: 'user',
      content: 'Génère maintenant le rapport de synthèse complet au format HTML, avec un design professionnel adapté à un email.'
    });
    
    // Générer le rapport avec l'IA
    const reportResponse = await openAIService.getChatCompletion(reportPrompt);
    
    if (!reportResponse) {
      throw new Error("Impossible de générer le rapport de synthèse");
    }
    
    // Créer une structure pour la réponse en accord avec l'interface de l'API
    const responseContent = {
      content: reportResponse
    };
    
    // Préparer l'email HTML avec le rapport généré par l'IA
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #003366; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        h1 { color: #003366; }
        h2 { color: #0055a4; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .session-info { background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .logo { max-width: 150px; height: auto; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://www.mc2i.fr/assets/img/logo_mc2i.png" alt="mc2i Logo" class="logo">
        <h1>Rapport d'Expert AMOA Conversationnel</h1>
      </div>
      
      <div class="content">
        <div class="session-info">
          <p><strong>Consultant:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Durée de session:</strong> ${durationFormatted}</p>
        </div>
        
        <div class="report-content">
          ${responseContent.content}
        </div>
      </div>
      
      <div class="footer">
        <p>Ce rapport a été généré automatiquement par l'Expert AMOA Conversationnel de mc2i, propulsé par FYNE.</p>
        <p>© ${new Date().getFullYear()} mc2i. Tous droits réservés.</p>
      </div>
    </body>
    </html>`;
    
    // Envoyer l'email avec Ethereal pour les tests
    const emailResult = await sendWithEthereal(userEmail, userName, emailHtml);
    
    if (!emailResult.success) {
      console.warn("Avertissement: Échec de l'envoi de l'email Ethereal", emailResult.error);
    }
    
    return res.status(200).json({
      success: true,
      message: "Session terminée et rapport envoyé avec succès",
      emailPreview: emailResult.previewUrl || null
    });
    
  } catch (error) {
    console.error("Erreur lors de la finalisation de la session AMOA:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la finalisation de la session. Veuillez réessayer."
    });
  }
}