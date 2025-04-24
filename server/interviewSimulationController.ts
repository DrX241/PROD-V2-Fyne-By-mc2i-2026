import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "../I_AM_CYBER/services/openai";

/**
 * Envoie un email de test avec Ethereal
 */
async function sendWithEthereal(trainerEmail: string, candidateName: string, emailHtml: string) {
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
      from: '"FYNE - Audition" <evaluation@fyne.fr>',
      to: trainerEmail,
      subject: `Évaluation d'audition client - ${candidateName}`,
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

// Structure des données de simulation d'audition client
interface InterviewSimulationData {
  domain: 'cyber' | 'amoa';
  trainerEmail: string;
  candidateName: string;
  profileType: string;
  experienceLevel: string;
  sectorFocus?: string; // Utilisé uniquement pour AMOA
  messages: Array<any>;
  duration?: number;
}

/**
 * Démarre une simulation d'audition client basée sur les paramètres configurés
 */
export async function startInterviewSimulation(req: Request, res: Response) {
  try {
    const {
      domain,
      trainerEmail,
      candidateName,
      profileType,
      experienceLevel,
      sectorFocus
    } = req.body;

    if (!domain || !profileType || !experienceLevel) {
      return res.status(400).json({ 
        success: false, 
        error: 'Paramètres incomplets. Veuillez fournir le domaine, le type de profil et le niveau d\'expérience.'
      });
    }
    
    // Les informations de contact (email et nom) sont optionnelles au démarrage
    // Elles seront réclamées à la fin si elles sont manquantes

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
      initialMessage: initialScenario
    });

  } catch (error) {
    console.error('Erreur lors du démarrage de l\'audition client:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de l\x27audition.'
    });
  }
}

/**
 * Gère un message envoyé par le consultant pendant l'audition
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
      console.error('Erreur API lors du traitement du message d\x27audition:', apiError);
      
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
    console.error('Erreur globale lors du traitement du message d\x27audition:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du message.'
    });
  }
}

/**
 * Finalise une simulation d'audition client et envoie les résultats par email
 */
// Fonction utilitaire pour tester l'envoi d'email avec le service Ethereal
async function testSendMail(trainerEmail: string, candidateName: string, emailHtml: string) {
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
      from: '"FYNE - Audition" <evaluation@fyne.fr>',
      to: trainerEmail,
      subject: `Évaluation d'audition client - ${candidateName}`,
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
    // Récupérer les données du corps de la requête
    const {
      domain,
      trainerEmail,
      recruiterEmail,  // Correspond au nom dans le frontend
      candidateName,
      profileType,
      experienceLevel,
      sectorFocus,
      messages = [],
      duration = 0
    } = req.body;

    // Pour assurer la compatibilité entre les deux noms de paramètres
    const emailToUse = recruiterEmail || trainerEmail;
    
    // Loguer les données reçues pour le débogage
    console.log('Données reçues pour complétion:', {
      domain,
      recruiterEmail, 
      candidateName,
      profileType, 
      experienceLevel,
      sectorFocus: sectorFocus || 'non défini'
    });

    // Vérifier que les paramètres requis sont présents
    if (!emailToUse || !candidateName || !profileType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets. Veuillez fournir l\'email, le nom du consultant, le type de profil et le niveau d\'expérience.'
      });
    }
    
    // Vérification supplémentaire pour le domaine AMOA qui nécessite le secteur d'activité
    // Si domain est 'amoa' explicitement ou si l'URL contient '/amoa/' (et non pas l'absence de '/cyber/')
    const isDomainAmoa = domain === 'amoa' || req.path.includes('/amoa/');
    console.log(`Path: ${req.path}, Détection AMOA: ${isDomainAmoa}, Secteur fourni: ${!!sectorFocus}`);
    
    if (isDomainAmoa && !sectorFocus) {
      return res.status(400).json({
        success: false,
        error: 'Le secteur d\'activité est obligatoire pour une audition AMOA.'
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
        evaluation = `La personne consultante ${candidateName} a fait preuve de bonnes connaissances en cybersécurité pour un profil ${profileType} de niveau ${experienceLevel}. 
        
Points forts : compréhension des concepts, capacité d'analyse technique.
Axes d'amélioration : approfondir les méthodologies de sécurité, développer la vision stratégique.

Note globale : 3.5/5`;
      } else {
        evaluation = `La personne consultante ${candidateName} a démontré une bonne compréhension du rôle d'AMOA pour un profil ${profileType} de niveau ${experienceLevel} dans le secteur ${sectorFocus}.
        
Points forts : méthodologie projet, communication avec les parties prenantes.
Axes d'amélioration : approfondissement des connaissances sectorielles, gestion des situations complexes.

Évaluation globale : Satisfaisant`;
      }
    }

    // Affichage dans la console pour le débogage
    console.log(`
---------- ENVOI D'EMAIL ----------
À: ${trainerEmail}
Sujet: ${domain === 'amoa' ? `Évaluation de préparation d'audition - ${candidateName}` : `Évaluation d'audition client - ${candidateName}`}
    `);

    try {
      // Construction du corps de l'email en HTML
      let emailContent = '';
      if (domain === 'amoa') {
        emailContent = `
        <h2>Évaluation de préparation d'audition</h2>
        <p><strong>Consultant:</strong> ${candidateName}</p>
        <p><strong>Domaine:</strong> AMOA</p>
        <p><strong>Profil:</strong> ${profileType.replace(/_/g, ' ')} - ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</p>
        <p><strong>Secteur:</strong> ${sectorFocus}</p>
        <p><strong>Durée:</strong> ${Math.floor(duration / 60)} min ${duration % 60} sec</p>`;
      } else {
        emailContent = `
        <h2>Évaluation d'audition client</h2>
        <p><strong>Consultant(e):</strong> ${candidateName}</p>
        <p><strong>Domaine:</strong> Cybersécurité</p>
        <p><strong>Profil:</strong> ${profileType.replace(/_/g, ' ')} - ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</p>
        <p><strong>Durée:</strong> ${Math.floor(duration / 60)} min ${duration % 60} sec</p>`;
      }
      
      const emailHtml = `${emailContent}
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
            to: trainerEmail,
            from: {
              name: 'FYNE - Audition',
              email: 'eddy.missoni@mc2i.fr' // Adresse vérifiée dans SendGrid
            },
            subject: domain === 'amoa' ? `Évaluation de préparation d'audition - ${candidateName}` : `Évaluation d'audition client - ${candidateName}`,
            html: emailHtml,
          };
          
          console.log('Envoi d\'email via SendGrid avec configuration:');
          console.log('- Destinataire:', trainerEmail);
          console.log('- Expéditeur:', 'eddy.missoni@mc2i.fr');
          console.log('- Clé API SendGrid disponible:', !!sendgridApiKey);
          
          await sgMail.send(msg);
          console.log('Email envoyé avec SendGrid à', trainerEmail);
        } catch (sendgridError: any) {
          console.error('Erreur lors de l\'envoi avec SendGrid:', sendgridError.code);
          
          // Afficher plus d'informations sur l'erreur
          if (sendgridError.response && sendgridError.response.body && sendgridError.response.body.errors) {
            console.error('Détail des erreurs SendGrid:', JSON.stringify(sendgridError.response.body.errors));
          }
          
          // Fallback vers Ethereal pour les tests si SendGrid échoue
          console.log('Fallback vers Ethereal...');
          await sendWithEthereal(trainerEmail, candidateName, emailHtml);
        }
      } else {
        // Fallback vers Ethereal pour les tests
        console.log("Aucune clé SendGrid trouvée, utilisation d'Ethereal...");
        await sendWithEthereal(trainerEmail, candidateName, emailHtml);
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
      error: 'Erreur serveur lors de la finalisation de l\x27audition.'
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
  return `Tu es un client qui réalise une audition de 10 minutes avec un consultant cybersécurité de mc2i.

Paramètres du consultant:
- Profil: ${profileType}
- Expérience: ${experienceLevel}

INSTRUCTIONS:
1. Crée un scénario concis adapté au niveau ${experienceLevel} en cybersécurité.
2. Présente-toi brièvement (nom, fonction) et décris un problème réel de cybersécurité.
3. Explique le contexte, une vulnérabilité ou incident principal, et les attentes.
4. Termine par une question demandant explicitement au consultant de:
   - Se présenter brièvement
   - Reformuler sa compréhension de ton problème de sécurité
   - Proposer une première approche ou poser des questions de clarification

IMPORTANT:
- Ton message initial NE DOIT PAS dépasser 150 mots.
- Utilise un langage direct, concis, et professionnel.
- Ne mentionne pas qu'il s'agit d'une simulation.
- L'objectif est d'évaluer la capacité du consultant à comprendre rapidement une problématique de sécurité, structurer sa pensée, et proposer une démarche adaptée en 10 minutes.`;
}

/**
 * Génère le prompt système pour l'initialisation d'une simulation AMOA
 */
function generateAmoaSystemPrompt(profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un client qui réalise une audition de 10 minutes avec un consultant AMOA de mc2i.

Paramètres du consultant:
- Profil: ${profileType}
- Expérience: ${experienceLevel}
- Secteur: ${sectorFocus}

INSTRUCTIONS:
1. Crée un scénario concis (secteur: ${sectorFocus}) adapté au niveau ${experienceLevel}.
2. Présente-toi brièvement (nom, fonction) et décris un projet réel nécessitant un consultant AMOA.
3. Explique le contexte, une difficulté principale, et les attentes générales.
4. Termine par une question demandant explicitement au consultant de:
   - Se présenter brièvement
   - Reformuler sa compréhension de ton besoin
   - Proposer une première approche ou poser des questions de clarification

IMPORTANT:
- Ton message initial NE DOIT PAS dépasser 150 mots.
- Utilise un langage direct, concis, et professionnel.
- Ne mentionne pas qu'il s'agit d'une simulation.
- L'objectif est d'évaluer la capacité du consultant à comprendre rapidement un besoin, structurer sa pensée, et proposer une démarche adaptée en 10 minutes.`;
}

/**
 * Génère le prompt pour une étape spécifique de l'audition cybersécurité
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
  
  // Phase temporelle basée sur l'étape
  let phase = '';
  let phaseObjective = '';
  
  switch (step) {
    case 1:
      phase = "Phase de compréhension du contexte (minutes 1-3)";
      phaseObjective = `Cette phase vise à évaluer la capacité du consultant à :
      - Reformuler clairement la problématique de sécurité
      - Identifier les risques et vulnérabilités principales
      - Poser des questions pertinentes pour clarifier le contexte
      - Démontrer sa compréhension des enjeux de sécurité spécifiques`;
      break;
    case 2:
      phase = "Phase d'analyse technique (minutes 4-7)";
      phaseObjective = `Cette phase vise à évaluer la capacité du consultant à :
      - Proposer une approche méthodologique de sécurité adaptée
      - Exploiter ses connaissances techniques dans un contexte client
      - Identifier les priorités et les mesures immédiates à prendre
      - Démontrer sa maîtrise des frameworks et standards de sécurité`;
      break;
    case 3:
      phase = "Phase de recommandation stratégique (minutes 8-10)";
      phaseObjective = `Cette phase finale vise à évaluer la capacité du consultant à :
      - Synthétiser la situation de sécurité et les enjeux
      - Formuler un plan d'action clair avec priorisation des mesures
      - Proposer des métriques de suivi pertinentes
      - Présenter une vision stratégique à court et long terme`;
      break;
    default:
      phase = "Phase intermédiaire";
      phaseObjective = `Cette phase vise à évaluer les compétences générales du consultant en cybersécurité.`;
  }
  
  return `Tu es un client potentiel dans une audition pour un consultant en cybersécurité chez mc2i.

CONTEXTE DE L'AUDITION (10 minutes total):
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Étape actuelle: ${step}/3 (difficulté: ${complexity})

${phase}
${phaseObjective}

INSTRUCTIONS POUR CETTE ÉTAPE:
1. Analyse attentivement la réponse précédente du consultant, identifie ses forces et faiblesses.
2. Prends en compte que vous disposez d'un temps limité (10 min au total), adapte la longueur de tes messages.
3. Réagis comme un véritable interlocuteur client, avec des attentes élevées mais réalistes.
4. Pour cette étape spécifique, cherche à évaluer la capacité du consultant à:
   - Faire preuve d'expertise technique en sécurité
   - Communiquer clairement des concepts complexes
   - Établir un lien de confiance basé sur son expertise
   - Rester focalisé sur les risques prioritaires et les solutions pragmatiques

5. Pose une question précise qui nécessite une réponse construite et qui permet d'évaluer les compétences mentionnées ci-dessus.
6. Garde tes réponses concises (150-200 mots maximum) pour rester dans le timing global de 10 minutes.

Note: Plus l'audition avance, plus tes questions doivent être spécifiques et stratégiques, en relation avec le type de profil ${profileType}.`;
}

/**
 * Génère le prompt pour une étape spécifique de l'audition AMOA
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
  
  // Phase temporelle basée sur l'étape
  let phase = '';
  let phaseObjective = '';
  
  switch (step) {
    case 1:
      phase = "Phase de compréhension du besoin (minutes 1-3)";
      phaseObjective = `Cette phase vise à évaluer la capacité du consultant à :
      - Reformuler clairement le besoin avec ses propres mots
      - Identifier les enjeux majeurs du projet
      - Poser des questions pertinentes pour clarifier les points flous
      - Faire le lien avec ses expériences passées dans des contextes similaires`;
      break;
    case 2:
      phase = "Phase de mise en situation (minutes 4-7)";
      phaseObjective = `Cette phase vise à évaluer la capacité du consultant à :
      - Proposer une approche méthodologique adaptée
      - Gérer efficacement des parties prenantes aux intérêts divergents
      - Résoudre des problèmes complexes typiques du secteur ${sectorFocus}
      - Démontrer son expertise technique dans le domaine`;
      break;
    case 3:
      phase = "Phase de recommandation (minutes 8-10)";
      phaseObjective = `Cette phase finale vise à évaluer la capacité du consultant à :
      - Synthétiser la situation et les enjeux
      - Formuler des recommandations claires et actionnables
      - Anticiper les risques et proposer des mesures de mitigation
      - Démontrer sa valeur ajoutée pour cette mission spécifique`;
      break;
    default:
      phase = "Phase intermédiaire";
      phaseObjective = `Cette phase vise à évaluer les compétences générales du consultant AMOA.`;
  }
  
  return `Tu es un client potentiel dans une audition pour un consultant AMOA (Assistance à Maîtrise d'Ouvrage) chez mc2i.

CONTEXTE DE L'AUDITION (10 minutes total):
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}
- Étape actuelle: ${step}/3 (difficulté: ${complexity})

${phase}
${phaseObjective}

INSTRUCTIONS POUR CETTE ÉTAPE:
1. Analyse attentivement la réponse précédente du consultant, identifie ses forces et faiblesses.
2. Prends en compte que vous disposez d'un temps limité (10 min au total), adapte la longueur de tes messages.
3. Réagis comme un véritable interlocuteur client, avec des attentes élevées mais réalistes.
4. Pour cette étape spécifique, cherche à évaluer la capacité du consultant à:
   - Faire preuve de clarté et de structure dans son discours
   - Aller droit à l'essentiel sans se perdre dans les détails
   - Établir un lien de confiance professionnel
   - Rester focalisé sur les objectifs du projet et les enjeux client

5. Pose une question précise qui nécessite une réponse construite et qui permet d'évaluer les compétences mentionnées ci-dessus.
6. Garde tes réponses concises (150-200 mots maximum) pour rester dans le timing global de 10 minutes.

Note: Plus l'audition avance, plus tes questions doivent être spécifiques et stratégiques, en lien avec le secteur ${sectorFocus}.`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une audition client cybersécurité
 */
function generateCyberEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string): string {
  return `Tu es un expert en évaluation des performances de consultants en cybersécurité lors de missions client.

Tu dois évaluer les réponses d'un consultant lors d'une audition client professionnelle:
- Nom du consultant: ${candidateName}
- Type de profil: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}

INSTRUCTIONS:
1. Analyse soigneusement toutes les réponses du consultant pendant la audition.
2. Évalue les compétences techniques et comportementales manifestées pendant la mission.
3. Sois bienveillant, même si la simulation a été courte ou interrompue.
4. Fournis une évaluation pertinente adaptée au profil et niveau d'expérience.
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

Recommandation pour la mission
[Recommandation claire: Excellent / Satisfaisant / À renforcer]

IMPORTANT: 
- Ton évaluation doit être constructive, pertinente et adaptée au niveau d'expérience demandé.
- N'inclus PAS le contenu de tes propres messages ou du scénario, focalise-toi uniquement sur les RÉPONSES du consultant.
- N'utilise PAS de markdown (pas de ## ou de *) dans ta réponse finale.`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une audition client AMOA
 */
function generateAmoaEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un expert en évaluation des performances de consultants AMOA (Assistance à Maîtrise d'Ouvrage) chez mc2i lors d'auditions client.

Tu dois évaluer cette audition limitée à 10 minutes pour le consultant:
- Nom du consultant: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

CONTEXTE ET CRITÈRES D'ÉVALUATION CHEZ MC2I:
Une audition réussie chez mc2i doit démontrer les compétences suivantes:
1. Compréhension du besoin: Le consultant doit clairement reformuler et s'approprier le besoin exprimé.
2. Posture professionnelle: Clarté d'expression, écoute active, structure du discours et professionnalisme.
3. Capacité de projection: Questions pertinentes, référence à des expériences passées, proposition d'approches concrètes.
4. Maîtrise du temps: Gestion efficace des 10 minutes d'échange, concentration sur les points essentiels.
5. Expertise sectorielle: Connaissance des spécificités du secteur ${sectorFocus} et adaptation des méthodes.

INSTRUCTIONS:
1. Analyse en détail toutes les réponses du consultant sur l'ensemble de l'audition de 10 minutes.
2. Évalue la qualité de sa présentation initiale et sa reformulation du besoin.
3. Identifie les questions pertinentes qu'il a posées pour clarifier le contexte et les enjeux.
4. Vérifie si le consultant a fait référence à des expériences passées pertinentes.
5. Évalue la qualité des approches et solutions proposées en fonction du contexte client.
6. Examine la clarté, la structure et le professionnalisme de son expression.
7. Évalue la maîtrise du temps et la capacité à être synthétique sur l'ensemble de l'audition.

FORMAT DE RÉPONSE:
Structure ton rapport d'évaluation comme suit (sans utiliser de markdown):

Synthèse générale
[2-3 phrases résumant l'impression globale et l'adéquation au profil recherché]

Compréhension du besoin client
[Évaluation de la capacité du consultant à reformuler et s'approprier le besoin]

Posture et communication
[Évaluation de la clarté, de la structure et du professionnalisme]

Questions et approche méthodologique
[Évaluation de la pertinence des questions et des méthodes proposées]

Points forts
- [Point fort 1]
- [Point fort 2]
- [Point fort 3]

Axes d'amélioration
- [Axe d'amélioration 1]
- [Axe d'amélioration 2]
- [Axe d'amélioration 3]

Adéquation avec le niveau et le secteur
[Analyse si les compétences démontrées correspondent au niveau ${experienceLevel} et aux exigences du secteur ${sectorFocus}]

Recommandation finale
[Recommandation claire: Excellent / Satisfaisant / À renforcer]

IMPORTANT: 
- Ton évaluation doit être constructive et précise, avec des exemples tirés des réponses du consultant.
- Focalise-toi uniquement sur les RÉPONSES du consultant, pas sur tes questions.
- Évalue si le consultant a su gérer efficacement le temps limité de 10 minutes.
- N'utilise PAS de markdown dans ta réponse finale.`;
}