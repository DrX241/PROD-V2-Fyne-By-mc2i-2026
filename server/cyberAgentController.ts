import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { getRandomAnecdote, getRelevantContacts, getSecteurActivite, getCompanyName } from './anecdoteGenerator';

/**
 * Envoie un email de test avec Ethereal pour les environnements de développement
 */
async function sendWithEthereal(userEmail: string, userName: string, emailHtml: string) {
  try {
    // Créer un compte test
    const testAccount = await nodemailer.createTestAccount();

    // Créer un transporteur réutilisable avec Ethereal
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: '"I AM CYBER" <no-reply@example.com>',
      to: userEmail,
      subject: `Synthèse de ta session avec I AM CYBER`,
      html: emailHtml,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email de test'
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
 * Initialise une session d'Expert Cyber Conversationnel
 */
export async function startAgentSession(req: Request, res: Response) {
  try {
    const { userName, userEmail, cyberDomain, difficulty } = req.body;
    
    if (!userName || !userEmail || !cyberDomain) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    
    // Formater le prénom (première lettre en majuscule)
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
    
    // Obtenir une anecdote aléatoire liée au domaine
    const anecdote = getRandomAnecdote(cyberDomain);
    
    // Déterminer le secteur d'activité basé sur le domaine
    const secteurActivite = getSecteurActivite('');
    
    // Générer un nom d'entreprise cohérent
    const companyName = getCompanyName(secteurActivite);
    
    // Sélectionner des interlocuteurs pertinents
    const primaryContact = {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO"
    };
    
    const additionalContacts = getRelevantContacts(cyberDomain, primaryContact);
    
    // Message initial du système
    const initialSystemMessage = {
      role: 'system',
      content: `Bonjour ${formattedName}, je suis I AM CYBER, ton assistant virtuel dans le monde passionnant de la cybersécurité. Je suis là pour t'accompagner dans le domaine de la ${cyberDomain}.

Savais-tu que ${anecdote}

Pour notre échange, je te propose d'adopter une approche concrète par la mise en situation. Tu vas bientôt recevoir un email d'un professionnel qui te soumettra un cas pratique à résoudre dans le domaine de la ${cyberDomain}.

Comment puis-je t'aider aujourd'hui ?`
    };
    
    // Stocker les données de session
    const sessionData: AgentSessionData = {
      userEmail,
      userName: formattedName,
      messages: [initialSystemMessage]
    };
    
    // Répondre avec le message initial et l'ID de session
    return res.json({
      success: true,
      sessionId: Date.now().toString(),
      initialMessage: initialSystemMessage.content,
      sessionData
    });
  } catch (error) {
    console.error('Error starting agent session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'initialisation de la session' 
    });
  }
}

/**
 * Termine une session Expert Cyber Conversationnel et envoie un rapport par email
 */
export async function completeAgentSession(req: Request, res: Response) {
  try {
    const { sessionData, duration } = req.body;
    
    if (!sessionData || !sessionData.userEmail || !sessionData.userName) {
      return res.status(400).json({ success: false, message: 'Données de session manquantes' });
    }
    
    // Créer le HTML du rapport
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">I AM CYBER</h1>
          <p style="margin: 5px 0 0;">Rapport de Session - Agent Conversationnel</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Bonjour ${sessionData.userName},</h2>
          <p>Merci d'avoir participé à une session avec I AM CYBER. Voici un résumé de notre échange :</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Détails de la session</h3>
            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Durée :</strong> ${duration ? Math.floor(duration / 60) + ' minutes' : 'Non disponible'}</p>
            <p><strong>Nombre de messages :</strong> ${sessionData.messages.length}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">Résumé des échanges</h3>
            <div>
              ${sessionData.messages.slice(1, 5).map((msg: any, index: number) => 
                `<p><strong>${index % 2 === 0 ? 'Vous' : 'I AM CYBER'} :</strong> 
                ${msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content}</p>`
              ).join('')}
              ${sessionData.messages.length > 5 ? `<p>... et ${sessionData.messages.length - 5} autres messages</p>` : ''}
            </div>
          </div>
          
          <p style="margin-top: 20px;">Vous pouvez retrouver l'intégralité de cette conversation en vous connectant à votre compte I AM CYBER.</p>
          
          <p>Merci d'avoir utilisé nos services !</p>
          <p><strong>L'équipe I AM CYBER</strong></p>
        </div>
        
        <div style="background-color: #1a1a1a; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>© 2025 I AM CYBER - Tous droits réservés</p>
        </div>
      </div>
    `;
    
    // Envoyer l'email (pour le développement, utiliser Ethereal)
    const emailResult = await sendWithEthereal(sessionData.userEmail, sessionData.userName, emailHtml);
    
    return res.json({
      success: true,
      message: 'Session terminée avec succès',
      emailSent: emailResult.success,
      emailPreview: emailResult.previewUrl
    });
  } catch (error) {
    console.error('Error completing agent session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la finalisation de la session' 
    });
  }
}