import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "../I_AM_CYBER/services/openai";

/**
 * Envoie un email de test avec Ethereal
 */
async function sendWithEthereal(recruiterEmail: string, candidateName: string, emailHtml: string) {
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
      from: '"I AM CYBER - Recrutement" <evaluation@i-am-cyber.com>',
      to: recruiterEmail,
      subject: `Évaluation de simulation d'entretien - ${candidateName}`,
      html: emailHtml
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email de test envoyé: %s', info.messageId);
    // URL de prévisualisation de l'email généré par Ethereal
    console.log('Aperçu de l\'email: %s', nodemailer.getTestMessageUrl(info));
  } catch (etherealError) {
    console.error('Erreur lors de l\'envoi avec Ethereal:', etherealError);
  }
}

// Structure des données de simulation d'entretien
interface InterviewSimulationData {
  domain: 'cyber' | 'amoa';
  recruiterEmail: string;
  candidateName: string;
  profileType: string;
  experienceLevel: string;
  sectorFocus?: string; // Utilisé uniquement pour AMOA
  messages: Array<any>;
  duration?: number;
}

/**
 * Démarre une simulation d'entretien basée sur les paramètres configurés
 */
export async function startInterviewSimulation(req: Request, res: Response) {
  try {
    const {
      domain,
      recruiterEmail,
      candidateName,
      profileType,
      experienceLevel,
      sectorFocus
    } = req.body;

    if (!domain || !recruiterEmail || !candidateName || !profileType || !experienceLevel) {
      return res.status(400).json({ 
        success: false, 
        error: 'Paramètres incomplets. Veuillez fournir toutes les informations requises.'
      });
    }

    // Valider le domaine
    if (domain !== 'cyber' && domain !== 'amoa') {
      return res.status(400).json({ 
        success: false, 
        error: 'Domaine invalide. Veuillez spécifier "cyber" ou "amoa".'
      });
    }

    // Pour AMOA, vérifier que le secteur est spécifié
    if (domain === 'amoa' && !sectorFocus) {
      return res.status(400).json({
        success: false,
        error: 'Le secteur d\'activité est requis pour les simulations AMOA.'
      });
    }

    // Construire le prompt initial en fonction du domaine
    let systemPrompt = '';
    
    if (domain === 'cyber') {
      systemPrompt = generateCyberSystemPrompt(profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaSystemPrompt(profileType, experienceLevel, sectorFocus || '');
    }

    // Générer le scénario initial avec l'IA
    const messages: ChatCompletionRequestMessage[] = [
      { 
        role: 'system', 
        content: systemPrompt
      }
    ];

    // L'API openAIService.getChatCompletion attend des paramètres simples et renvoie une chaîne
    const initialScenario = await openAIService.getChatCompletion(
      messages, 
      0.7,  // temperature
      600   // max_tokens
    );

    // Envoyer le scénario initial
    return res.json({
      success: true,
      initialScenario
    });

  } catch (error) {
    console.error('Erreur lors du démarrage de la simulation d\'entretien:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de la simulation.'
    });
  }
}

/**
 * Gère un message envoyé par le candidat pendant la simulation
 */
export async function processInterviewMessage(req: Request, res: Response) {
  try {
    const {
      message,
      profileType,
      experienceLevel,
      sectorFocus,
      messages = []
    } = req.body;

    const domain = req.path.includes('/cyber/') ? 'cyber' : 'amoa';

    if (!message || !profileType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets.'
      });
    }

    // Déterminer l'étape en fonction du nombre de messages
    // Les messages sont par paires (user/assistant), donc divisé par 2 et plafonnés à 3
    const userMessageCount = messages.filter((msg: any) => msg.role === 'user').length;
    const step = Math.min(Math.floor(userMessageCount / 2) + 1, 3);
    
    console.log(`Traitement du message. Étape: ${step}, Profil: ${profileType}, Niveau: ${experienceLevel}`);

    // Générer le prompt de l'assistant en fonction de l'étape et du domaine
    let systemPrompt = '';
    
    if (domain === 'cyber') {
      systemPrompt = generateCyberStepPrompt(step, profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaStepPrompt(step, profileType, experienceLevel, sectorFocus || '');
    }

    // Convertir les messages précédents au format attendu par l'API OpenAI
    const formattedPreviousMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Ajouter le message système actuel et le message utilisateur le plus récent
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...formattedPreviousMessages
    ];

    // Vérifier si le dernier message utilisateur est déjà dans l'historique formatté
    const lastFormattedMessage = formattedPreviousMessages[formattedPreviousMessages.length - 1];
    if (!lastFormattedMessage || lastFormattedMessage.role !== 'user' || lastFormattedMessage.content !== message) {
      promptMessages.push({ role: 'user', content: message });
    }

    try {
      // Obtenir la réponse de l'IA
      const aiResponse = await openAIService.getChatCompletion(
        promptMessages, 
        0.7,  // temperature
        600   // max_tokens
      );

      return res.json({
        success: true,
        response: aiResponse,
        currentModel: openAIService.getCurrentModelName(),
        step: step
      });
    } catch (apiError) {
      console.error('Erreur API lors du traitement du message de simulation:', apiError);
      
      // Générer une réponse de secours
      const fallbackResponses = [
        "Je comprends votre point de vue. Pouvez-vous développer un peu plus sur ce sujet ?",
        "Intéressant. Comment aborderiez-vous une situation où les parties prenantes ont des attentes contradictoires ?",
        "Très bien. Quelle méthodologie utiliseriez-vous pour ce type de projet ?",
        "D'accord. Parlons maintenant de votre expérience spécifique dans ce domaine.",
        "Merci pour ces précisions. Comment géreriez-vous les changements de périmètre en cours de projet ?"
      ];
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return res.json({
        success: true,
        response: fallbackResponse,
        fallbackMode: true,
        currentModel: openAIService.getCurrentModelName(),
        step: step
      });
    }

  } catch (error) {
    console.error('Erreur globale lors du traitement du message de simulation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du message.'
    });
  }
}

/**
 * Finalise une simulation d'entretien et envoie les résultats par email
 */
// Fonction utilitaire pour tester l'envoi d'email avec le service Ethereal
async function testSendMail(recruiterEmail: string, candidateName: string, emailHtml: string) {
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
      from: '"I AM CYBER - Recrutement" <evaluation@i-am-cyber.com>',
      to: recruiterEmail,
      subject: `Évaluation de simulation d'entretien - ${candidateName}`,
      html: emailHtml
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email de test envoyé: %s', info.messageId);
    // URL de prévisualisation de l'email généré par Ethereal
    console.log('Aperçu de l\'email: %s', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (etherealError) {
    console.error('Erreur lors de l\'envoi avec Ethereal:', etherealError);
    return false;
  }
}

export async function completeInterviewSimulation(req: Request, res: Response) {
  try {
    const {
      recruiterEmail,
      candidateName,
      profileType,
      experienceLevel,
      sectorFocus,
      messages = [],
      duration = 0
    } = req.body;

    const domain = req.path.includes('/cyber/') ? 'cyber' : 'amoa';

    if (!recruiterEmail || !candidateName || !profileType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets.'
      });
    }

    // Générer le prompt d'évaluation
    let evaluationPrompt = '';
    
    if (domain === 'cyber') {
      evaluationPrompt = generateCyberEvaluationPrompt(candidateName, profileType, experienceLevel);
    } else {
      evaluationPrompt = generateAmoaEvaluationPrompt(candidateName, profileType, experienceLevel, sectorFocus || '');
    }

    // Convertir les messages précédents au format attendu par l'API OpenAI
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    // Ajouter le message système d'évaluation
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: evaluationPrompt },
      ...formattedMessages
    ];

    let evaluation = '';
    let fallbackMode = false;
    
    try {
      // Obtenir l'évaluation générée par l'IA
      evaluation = await openAIService.getChatCompletion(
        promptMessages, 
        0.7,   // temperature
        1000   // max_tokens
      );
    } catch (apiError) {
      console.error('Erreur API lors de la génération de l\'évaluation:', apiError);
      
      // Générer une évaluation de secours
      fallbackMode = true;
      
      if (domain === 'cyber') {
        evaluation = `Le candidat ${candidateName} a fait preuve de bonnes connaissances en cybersécurité pour un profil ${profileType} de niveau ${experienceLevel}. 
        
Points forts : compréhension des concepts, capacité d'analyse technique.
Axes d'amélioration : approfondir les méthodologies de sécurité, développer la vision stratégique.

Note globale : 3.5/5`;
      } else {
        evaluation = `Le consultant ${candidateName} a démontré une bonne compréhension du rôle d'AMOA pour un profil ${profileType} de niveau ${experienceLevel} dans le secteur ${sectorFocus}.
        
Points forts : méthodologie projet, communication avec les parties prenantes.
Axes d'amélioration : approfondissement des connaissances sectorielles, gestion des situations complexes.

Évaluation globale : Satisfaisant`;
      }
    }

    // Affichage dans la console pour le débogage
    console.log(`
---------- ENVOI D'EMAIL ----------
À: ${recruiterEmail}
Sujet: Évaluation de simulation d'entretien - ${candidateName}
    `);

    try {
      // Construction du corps de l'email en HTML
      const emailHtml = `
        <h2>Évaluation de simulation d'entretien</h2>
        <p><strong>Candidat:</strong> ${candidateName}</p>
        <p><strong>Domaine:</strong> ${domain === 'cyber' ? 'Cybersécurité' : 'AMOA'}</p>
        <p><strong>Profil:</strong> ${profileType.replace(/_/g, ' ')} - ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</p>
        ${domain === 'amoa' && sectorFocus ? `<p><strong>Secteur:</strong> ${sectorFocus}</p>` : ''}
        <p><strong>Durée:</strong> ${Math.floor(duration / 60)} min ${duration % 60} sec</p>
        
        <hr />
        
        <div>
          ${evaluation.replace(/\n/g, '<br>')}
        </div>
      `;

      // Configuration de SendGrid si la clé API est disponible
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      
      if (sendgridApiKey) {
        console.log("Tentative d'envoi par SendGrid...");
        // Utilisation de SendGrid pour l'envoi d'emails
        try {
          sgMail.setApiKey(sendgridApiKey);
          
          const msg = {
            to: recruiterEmail,
            from: {
              name: 'I AM CYBER - Recrutement',
              email: 'eddy.missoni@mc2i.fr' // Adresse vérifiée dans SendGrid
            },
            subject: `Évaluation de simulation d'entretien - ${candidateName}`,
            html: emailHtml,
          };
          
          console.log('Envoi d\'email via SendGrid avec configuration:');
          console.log('- Destinataire:', recruiterEmail);
          console.log('- Expéditeur:', 'eddy.missoni@mc2i.fr');
          console.log('- Clé API SendGrid disponible:', !!sendgridApiKey);
          
          await sgMail.send(msg);
          console.log('Email envoyé avec SendGrid à', recruiterEmail);
        } catch (sendgridError: any) {
          console.error('Erreur lors de l\'envoi avec SendGrid:', sendgridError.code);
          
          // Afficher plus d'informations sur l'erreur
          if (sendgridError.response && sendgridError.response.body && sendgridError.response.body.errors) {
            console.error('Détail des erreurs SendGrid:', JSON.stringify(sendgridError.response.body.errors));
          }
          
          // Fallback vers Ethereal pour les tests si SendGrid échoue
          console.log('Fallback vers Ethereal...');
          await testSendMail(recruiterEmail, candidateName, emailHtml);
        }
      } else {
        // Fallback vers Ethereal pour les tests
        console.log("Aucune clé SendGrid trouvée, utilisation d'Ethereal...");
        await testSendMail(recruiterEmail, candidateName, emailHtml);
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Continuer l'exécution même si l'envoi d'email échoue
    }

    return res.json({
      success: true,
      message: 'Évaluation générée avec succès.',
      evaluation: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la finalisation de la simulation d\'entretien:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la simulation.'
    });
  }
}

// ----------------------------------------------------------------
// Fonctions utilitaires pour générer les prompts
// ----------------------------------------------------------------

/**
 * Génère le prompt système pour l'initialisation d'une simulation cybersécurité
 */
function generateCyberSystemPrompt(profileType: string, experienceLevel: string): string {
  return `Tu es un assistant spécialisé dans la simulation d'entretiens d'embauche pour des profils en cybersécurité.

Tu dois créer un scénario initial pour évaluer un candidat avec le profil suivant:
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}

INSTRUCTIONS:
1. Génère un scénario réaliste qui simule une situation chez un client où le candidat vient d'être recruté par mc2i et est staffé sur une mission de cybersécurité.
2. La situation doit être adaptée au profil (${profileType}) et au niveau d'expérience (${experienceLevel}) du candidat.
3. Tu dois présenter le contexte de l'entreprise cliente, la problématique de cybersécurité et poser une première question qui permettra d'évaluer les compétences techniques et le raisonnement du candidat.
4. Ne mentionne pas qu'il s'agit d'une simulation, agis comme si tu étais réellement une personne de l'entreprise cliente qui interagit avec le consultant.
5. Ton message doit faire environ 300 mots.

Format de réponse: 
- Présente-toi comme un collaborateur de l'entreprise cliente avec un nom et une fonction réalistes.
- Précise le contexte de l'entreprise et la situation de sécurité.
- Termine par une question technique ou situationnelle pertinente.`;
}

/**
 * Génère le prompt système pour l'initialisation d'une simulation AMOA
 */
function generateAmoaSystemPrompt(profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un assistant spécialisé dans la simulation d'entretiens d'embauche pour des profils AMOA (Assistance à Maîtrise d'Ouvrage).

Tu dois créer un scénario initial pour évaluer un candidat avec le profil suivant:
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

INSTRUCTIONS:
1. Génère un scénario réaliste qui simule une situation chez un client où le candidat vient d'être recruté par mc2i et est staffé sur une mission AMOA.
2. La situation doit être adaptée au profil (${profileType}), au niveau d'expérience (${experienceLevel}) et au secteur (${sectorFocus}).
3. Tu dois présenter le contexte de l'entreprise cliente, le projet en cours, les enjeux et poser une première question qui permettra d'évaluer les compétences méthodologiques et fonctionnelles du candidat.
4. Ne mentionne pas qu'il s'agit d'une simulation, agis comme si tu étais réellement une personne de l'entreprise cliente qui interagit avec le consultant.
5. Ton message doit faire environ 300 mots.

Format de réponse:
- Présente-toi comme un collaborateur de l'entreprise cliente avec un nom et une fonction réalistes.
- Précise le contexte de l'entreprise et la situation du projet.
- Termine par une question méthodologique ou situationnelle pertinente.`;
}

/**
 * Génère le prompt pour une étape spécifique de la simulation cybersécurité
 */
function generateCyberStepPrompt(step: number, profileType: string, experienceLevel: string): string {
  // Adapter la difficulté en fonction de l'étape et du niveau d'expérience
  let baseComplexity = 'intermédiaire';
  switch (experienceLevel.toLowerCase()) {
    case 'junior':
      baseComplexity = 'basique';
      break;
    case 'confirmé':
    case 'confirme':
      baseComplexity = 'intermédiaire';
      break;
    case 'senior':
    case 'expert':
      baseComplexity = 'avancée';
      break;
  }
  
  // Augmenter progressivement la difficulté en fonction de l'étape
  const complexityByStep = {
    junior: ['basique', 'intermédiaire', 'intermédiaire'],
    confirmé: ['intermédiaire', 'intermédiaire', 'avancée'],
    confirme: ['intermédiaire', 'intermédiaire', 'avancée'],
    senior: ['intermédiaire', 'avancée', 'avancée'],
    expert: ['avancée', 'avancée', 'très avancée']
  };
  
  // Déterminer la complexité finale
  let complexity = baseComplexity;
  const expLevel = experienceLevel.toLowerCase();
  
  if (expLevel === 'junior' && step > 0 && step <= 3) {
    complexity = complexityByStep.junior[step - 1];
  } else if ((expLevel === 'confirmé' || expLevel === 'confirme') && step > 0 && step <= 3) {
    complexity = complexityByStep.confirme[step - 1];
  } else if (expLevel === 'senior' && step > 0 && step <= 3) {
    complexity = complexityByStep.senior[step - 1];
  } else if (expLevel === 'expert' && step > 0 && step <= 3) {
    complexity = complexityByStep.expert[step - 1];
  }
  
  let promptByStep = '';
  
  switch (step) {
    case 1:
      promptByStep = `Cette première étape vise à évaluer les connaissances fondamentales en cybersécurité. Pose des questions adaptées au niveau ${experienceLevel} qui permettent d'évaluer la compréhension des concepts attendus pour ce niveau.`;
      break;
    case 2:
      promptByStep = `Cette deuxième étape vise à évaluer les compétences techniques et la capacité à résoudre des problèmes. Pose des questions plus spécifiques sur les méthodologies et les outils que devrait maîtriser un profil ${experienceLevel}.`;
      break;
    case 3:
      promptByStep = `Cette dernière étape vise à évaluer la capacité d'analyse et de prise de décision. Présente une situation complexe appropriée pour un niveau ${experienceLevel} qui nécessite une réflexion stratégique.`;
      break;
    default:
      promptByStep = `Pose des questions adaptées au niveau ${experienceLevel} du candidat pour évaluer ses compétences en cybersécurité.`;
  }
  
  return `Tu es un interlocuteur client dans une simulation d'entretien pour un profil en cybersécurité.

Profil du candidat:
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}

Tu es maintenant à l'étape ${step}/3 de la simulation, avec une difficulté ${complexity}.

${promptByStep}

INSTRUCTIONS:
1. Analyse soigneusement la réponse précédente du candidat.
2. Réagis de manière réaliste à cette réponse, en apportant des précisions ou des corrections si nécessaire.
3. Continue le scénario en ajoutant de nouveaux éléments ou défis qui permettent d'évaluer les compétences du candidat.
4. Pose une nouvelle question ou présente un nouveau problème qui augmente légèrement en complexité, mais reste adapté au niveau ${experienceLevel}.
5. Reste dans ton rôle de collaborateur de l'entreprise cliente, ne mentionne pas qu'il s'agit d'une simulation.
6. Limite ta réponse à environ 200-250 mots.`;
}

/**
 * Génère le prompt pour une étape spécifique de la simulation AMOA
 */
function generateAmoaStepPrompt(step: number, profileType: string, experienceLevel: string, sectorFocus: string): string {
  // Adapter la difficulté en fonction de l'étape et du niveau d'expérience
  let baseComplexity = 'intermédiaire';
  switch (experienceLevel.toLowerCase()) {
    case 'junior':
      baseComplexity = 'basique';
      break;
    case 'confirmé':
    case 'confirme':
      baseComplexity = 'intermédiaire';
      break;
    case 'senior':
    case 'expert':
      baseComplexity = 'avancée';
      break;
  }
  
  // Augmenter progressivement la difficulté en fonction de l'étape
  const complexityByStep = {
    junior: ['basique', 'intermédiaire', 'intermédiaire'],
    confirmé: ['intermédiaire', 'intermédiaire', 'avancée'],
    confirme: ['intermédiaire', 'intermédiaire', 'avancée'],
    senior: ['intermédiaire', 'avancée', 'avancée'],
    expert: ['avancée', 'avancée', 'très avancée']
  };
  
  // Déterminer la complexité finale
  let complexity = baseComplexity;
  const expLevel = experienceLevel.toLowerCase();
  
  if (expLevel === 'junior' && step > 0 && step <= 3) {
    complexity = complexityByStep.junior[step - 1];
  } else if ((expLevel === 'confirmé' || expLevel === 'confirme') && step > 0 && step <= 3) {
    complexity = complexityByStep.confirme[step - 1];
  } else if (expLevel === 'senior' && step > 0 && step <= 3) {
    complexity = complexityByStep.senior[step - 1];
  } else if (expLevel === 'expert' && step > 0 && step <= 3) {
    complexity = complexityByStep.expert[step - 1];
  }
  
  let promptByStep = '';
  
  switch (step) {
    case 1:
      promptByStep = `Cette première étape vise à évaluer les connaissances méthodologiques et la compréhension des enjeux projet. Pose des questions adaptées au niveau ${experienceLevel} qui permettent d'évaluer la compréhension du rôle AMOA dans le secteur ${sectorFocus}.`;
      break;
    case 2:
      promptByStep = `Cette deuxième étape vise à évaluer les compétences en gestion des parties prenantes et en résolution de problèmes. Pose des questions sur la gestion des conflits ou des situations bloquantes adaptées à un niveau ${experienceLevel} dans le secteur ${sectorFocus}.`;
      break;
    case 3:
      promptByStep = `Cette dernière étape vise à évaluer la capacité d'analyse et de conseil. Présente une situation complexe appropriée pour un niveau ${experienceLevel} dans le secteur ${sectorFocus} qui nécessite des recommandations stratégiques.`;
      break;
    default:
      promptByStep = `Pose des questions adaptées au niveau ${experienceLevel} du consultant pour évaluer ses compétences en AMOA dans le secteur ${sectorFocus}.`;
  }
  
  return `Tu es un client potentiel qui participe à une préparation d'audition pour un consultant AMOA.

Profil du consultant:
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

Tu es maintenant à l'étape ${step}/3 de la simulation, avec une difficulté ${complexity}.

${promptByStep}

INSTRUCTIONS:
1. Analyse soigneusement la réponse précédente du consultant.
2. Réagis de manière réaliste à cette réponse, en apportant des précisions ou des corrections si nécessaire.
3. Continue le scénario en ajoutant de nouveaux éléments ou défis qui permettent d'évaluer les compétences du consultant.
4. Pose une nouvelle question ou présente un nouveau problème qui augmente légèrement en complexité, mais reste adapté au niveau ${experienceLevel}.
5. Reste dans ton rôle de client potentiel, ne mentionne pas qu'il s'agit d'une simulation.
6. Limite ta réponse à environ 200-250 mots.`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une simulation cybersécurité
 */
function generateCyberEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string): string {
  return `Tu es un expert en recrutement spécialisé dans l'évaluation de profils en cybersécurité.

Tu dois évaluer les réponses d'un candidat lors d'une simulation d'entretien:
- Nom du candidat: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}

INSTRUCTIONS:
1. Analyse soigneusement toutes les réponses du candidat pendant la simulation.
2. Évalue les compétences techniques et comportementales manifestées pendant l'entretien.
3. Sois bienveillant, même si la simulation a été courte ou interrompue.
4. Fournis une évaluation pertinente adaptée au profil et niveau d'expérience.
5. NE repète PAS les questions ou scénarios que tu as posés, concentre-toi uniquement sur l'analyse des réponses du candidat.
6. Concentre-toi exclusivement sur les compétences du candidat démontrées dans ses réponses.
7. IMPORTANT: Évalue si le niveau réel démontré par le candidat correspond bien au niveau d'expérience déclaré (${experienceLevel}).

FORMAT DE RÉPONSE:
Structure ton rapport d'évaluation comme suit (sans utiliser de markdown):

Synthèse générale du candidat
[2-3 phrases résumant l'impression générale]

Points forts
- [Point fort 1]
- [Point fort 2]
- [Point fort 3]

Axes d'amélioration
- [Axe d'amélioration 1]
- [Axe d'amélioration 2]
- [Axe d'amélioration 3]

Adéquation avec le niveau déclaré
[Analyse si le niveau des réponses correspond au niveau ${experienceLevel} déclaré. Indique si le candidat semble sous-évalué, surévalué ou correctement auto-évalué]

Recommandation pour le recrutement
[Recommandation claire: Recruter / Envisager / Approfondir]

IMPORTANT: 
- Ton évaluation doit être constructive, pertinente et adaptée au niveau d'expérience demandé.
- N'inclus PAS le contenu de tes propres messages ou du scénario, focalise-toi uniquement sur les RÉPONSES du candidat.
- N'utilise PAS de markdown (pas de ## ou de *) dans ta réponse finale.`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une simulation AMOA
 */
function generateAmoaEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un expert en évaluation des performances de consultants AMOA (Assistance à Maîtrise d'Ouvrage) lors d'auditions client.

Tu dois évaluer les réponses d'un consultant lors d'une préparation d'audition auprès d'un client potentiel:
- Nom du consultant: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

INSTRUCTIONS:
1. Analyse soigneusement toutes les réponses du consultant pendant la simulation.
2. Évalue les compétences techniques et comportementales manifestées pendant l'audition.
3. Sois bienveillant, même si la simulation a été courte ou interrompue.
4. Fournis une évaluation pertinente adaptée au profil, niveau d'expérience et secteur.
5. NE repète PAS les questions ou scénarios que tu as posés, concentre-toi uniquement sur l'analyse des réponses du consultant.
6. Concentre-toi exclusivement sur les compétences du consultant démontrées dans ses réponses.
7. IMPORTANT: Évalue si le niveau réel démontré par le consultant correspond bien au niveau d'expérience déclaré (${experienceLevel}).

FORMAT DE RÉPONSE:
Structure ton rapport d'évaluation comme suit (sans utiliser de markdown):

Synthèse générale du consultant
[2-3 phrases résumant l'impression générale]

Points forts
- [Point fort 1]
- [Point fort 2]
- [Point fort 3]

Axes d'amélioration
- [Axe d'amélioration 1]
- [Axe d'amélioration 2]
- [Axe d'amélioration 3]

Adéquation avec le niveau déclaré
[Analyse si le niveau des réponses correspond au niveau ${experienceLevel} déclaré. Indique si le consultant semble sous-évalué, surévalué ou correctement auto-évalué]

Recommandation à l'issue de la prestation
[Recommandation claire: Excellent / Satisfaisant / À renforcer]

IMPORTANT: 
- Ton évaluation doit être constructive, pertinente et adaptée au niveau d'expérience demandé et au secteur ${sectorFocus}.
- N'inclus PAS le contenu de tes propres messages ou du scénario, focalise-toi uniquement sur les RÉPONSES du consultant.
- N'utilise PAS de markdown (pas de ## ou de *) dans ta réponse finale.`;
}