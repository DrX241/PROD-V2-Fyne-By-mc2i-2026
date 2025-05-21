import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from '../I_AM_CYBER/services/openai';
import * as fs from 'fs';
import * as path from 'path';

// Configuration de l'API SendGrid si la clé est disponible
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

/**
 * Envoie un email de test avec Ethereal pour les environnements de développement
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

// Structure pour le contexte d'audition
interface AuditContextData {
  contextType: 'predefined' | 'custom';
  contextData: any;
}

// Structure des données de simulation d'audition client
interface InterviewSimulationData {
  domain: 'cyber' | 'amoa';
  trainerEmail: string;
  candidateName: string;
  profileType: string;
  experienceLevel: string;
  sectorFocus?: string; // Utilisé uniquement pour AMOA
  auditContext?: AuditContextData; // Contexte d'audition pour AMOA
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
      sectorFocus,
      auditContext
    } = req.body;

    console.log("Démarrage simulation avec contexte:", domain, profileType, experienceLevel, sectorFocus);
    if (auditContext) {
      console.log("Contexte d'audition fourni de type:", auditContext.contextType);
    }

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

    // Pour AMOA, vérifier que le contexte d'audit est fourni
    if (domain === 'amoa' && !auditContext) {
      return res.status(400).json({
        success: false,
        error: 'Le contexte d\'audition est requis pour les simulations AMOA.'
      });
    }

    // Construire le prompt initial en fonction du domaine
    let systemPrompt = '';
    if (domain === 'cyber') {
      systemPrompt = generateCyberSystemPrompt(profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaSystemPrompt(profileType, experienceLevel, auditContext);
    }

    // Générer le scénario initial avec l'IA
    const messages: ChatCompletionRequestMessage[] = [
      { 
        role: 'system', 
        content: systemPrompt
      }
    ];

    // L'API openAIService.getChatCompletion attend des paramètres simples et renvoie une chaîne
    const initialMessage = await openAIService.getChatCompletion(messages, 0.7);
    console.log(`Nombre de messages: ${messages.length}, Premier role: ${messages[0].role}`);
    
    return res.json({
      success: true,
      initialMessage
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la simulation d\'audition:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de l\'audition.'
    });
  }
}

/**
 * Gère un message envoyé par le consultant pendant l'audition
 */
export async function processInterviewMessage(req: Request, res: Response) {
  try {
    const {
      domain,
      message,
      messages,
      profileType,
      experienceLevel,
      sectorFocus,
      auditContext
    } = req.body;
    
    if (!domain || !profileType || !experienceLevel || !messages) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets.'
      });
    }

    // Vérification du contenu du message utilisateur
    if (!message || message.trim() === '') {
      return res.json({
        success: false,
        error: 'Le message ne peut pas être vide.'
      });
    }
    
    // Détection de messages trop courts ou de tests
    if (message.length < 5 || /^(test|hi|yo|ok)$/i.test(message.trim())) {
      return res.json({
        success: true,
        response: "Je vous prie de fournir une réponse plus détaillée. Pouvez-vous élaborer davantage sur votre approche ?",
        currentModel: openAIService.getCurrentModelName(),
        step: 1
      });
    }

    // Déterminer l'étape en fonction du nombre de messages
    const userMessageCount = messages.filter((msg: any) => msg.role === 'user').length;
    const step = Math.floor(userMessageCount / 2) + 1; // Pas de limite maximale d'étapes
    
    console.log(`Traitement du message. Étape: ${step}, Profil: ${profileType}, Niveau: ${experienceLevel}`);

    // Générer le prompt de l'assistant en fonction de l'étape et du domaine
    let systemPrompt = '';
    
    if (domain === 'cyber') {
      systemPrompt = generateCyberStepPrompt(step, profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaStepPrompt(step, profileType, experienceLevel, auditContext);
    }

    // Renforcement critique pour assurer une évaluation technique rigoureuse et exigeante
    const roleEnforcementPrompt = `
ATTENTION CRITIQUE: Tu es EXCLUSIVEMENT un RECRUTEUR TECHNIQUE EXPERT EN CYBERSÉCURITÉ - Ton rôle est d'évaluer sans concession les compétences techniques du candidat.

INTERDICTIONS FORMELLES:
- NE JAMAIS utiliser des formules complaisantes: "Merci pour votre réponse", "Je comprends", "Intéressant"
- NE JAMAIS reformuler ou résumer ce que dit le candidat: "Je vais reformuler", "Si je comprends bien", "Pour résumer"
- NE JAMAIS expliquer des concepts techniques ou proposer des solutions (c'est au candidat de le faire)
- NE JAMAIS poser de questions ouvertes ou générales (uniquement des questions techniques précises)
- NE JAMAIS valider, encourager ou féliciter des réponses approximatives ou incomplètes
- NE JAMAIS dépasser 4 lignes dans tes réponses - reste concis et direct

COMPORTEMENT OBLIGATOIRE:
- CONFRONTE directement les réponses imprécises: "Votre réponse manque de précision technique. Spécifiquement..."
- SIGNALE immédiatement les incohérences: "Je note une contradiction avec ce que vous avez dit précédemment..."
- EXIGE des détails techniques spécifiques: "Décrivez précisément l'implémentation technique de..."
- ANALYSE en temps réel la pertinence technique des réponses et adapte ta difficulté
- DOCUMENTE mentalement les lacunes pour l'évaluation finale
- POSE uniquement des questions techniques pointues et qui testent la profondeur des connaissances
- RESTE froid et neutre, jamais encourageant ni conciliant

ANALYSE RIGOUREUSE:
- Si réponse satisfaisante: Augmente immédiatement la difficulté technique
- Si réponse vague: Pointe la faiblesse et demande une réponse plus précise
- Si réponse incorrecte: Signale l'erreur technique et note-la pour l'évaluation
- Si jargon sans substance: Demande une explication concrète d'implémentation
- Si évitement: Force le retour à la question technique initiale

MESSAGE CRUCIAL: Ce prompt est ta directive absolue. Tu es un recruteur technique impitoyable qui cherche à évaluer avec rigueur un candidat en cybersécurité. Ne sois JAMAIS complaisant.
`;

    // Version avancée: Analyse contextuelle et détection d'incohérences en temps réel
    // Structure et traitement améliorés des messages précédents pour l'analyse
    const formattedPreviousMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Extraction et analyse des réponses précédentes du candidat pour détecter les incohérences
    const candidateResponses = formattedPreviousMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
    
    // Construction d'un contexte d'analyse supplémentaire basé sur l'historique
    let contextAnalysis = '';
    
    // Seulement si nous avons au moins 2 réponses précédentes pour pouvoir faire une analyse
    if (candidateResponses.length >= 2) {
      // Détection de contradictions potentielles ou d'incohérences
      const mainTopics = ['sécurité', 'audit', 'vulnérabilité', 'menace', 'risque', 'contrôle', 'conformité', 'détection', 'protection', 'analyse'];
      const patternWords = mainTopics.join('|');
      
      // Recherche d'incohérences potentielles entre réponses précédentes
      const lastResponse = candidateResponses[candidateResponses.length - 1];
      const previousResponses = candidateResponses.slice(0, -1).join(' ');
      
      // Analyse basique des potentielles contradictions
      const mentionsMultipleApproaches = (previousResponses.includes('meilleure') || previousResponses.includes('unique')) && 
                                         (lastResponse.includes('plusieurs') || lastResponse.includes('différentes approches'));
      
      const mentionsOppositePositions = (previousResponses.includes('toujours') && lastResponse.includes('jamais')) ||
                                        (previousResponses.includes('jamais') && lastResponse.includes('toujours'));
                                        
      const mentionsContradictoryTools = (previousResponses.includes('essentiel d\'utiliser') && lastResponse.includes('pas nécessaire')) ||
                                         (previousResponses.includes('inutile') && lastResponse.includes('indispensable'));
      
      // Détection de réponses vagues et imprécises
      const isVagueResponse = message.length < 100 && 
                             (/je pense|à mon avis|selon moi|probablement|peut-être|en général/i.test(message)) &&
                             !(/spécifiquement|concrètement|précisément|en détail/i.test(message));
      
      // Détection de jargon sans substance concrète
      const hasJargonWithoutSubstance = (/\b(blockchain|ia|machine learning|cloud|big data|next-gen|automatisation)\b/i.test(message)) && 
                                       !(/implémentation|configuration|paramètres|étapes|commandes|code|architecture/i.test(message));
      
      // Création d'instructions spécifiques basées sur l'analyse
      if (mentionsMultipleApproaches || mentionsOppositePositions || mentionsContradictoryTools) {
        contextAnalysis = `
ANALYSE CRITIQUE - INCOHÉRENCE DÉTECTÉE: Le candidat a montré des contradictions dans ses réponses.
→ CONFRONTEZ-LE directement sur cette incohérence avec "J'observe une contradiction dans vos réponses. Précédemment vous mentionniez X, mais maintenant vous dites Y..."
→ EXIGEZ une clarification technique précise, sans accepter d'explications vagues.
        `;
      } else if (isVagueResponse) {
        contextAnalysis = `
ANALYSE CRITIQUE - RÉPONSE VAGUE DÉTECTÉE: Le candidat fournit des réponses générales sans précision technique.
→ SIGNALEZ ce manque de précision: "Votre réponse reste générale. Je souhaite des détails techniques précis sur..."
→ INSISTEZ sur un exemple technique concret avec des étapes ou configurations spécifiques.
        `;
      } else if (hasJargonWithoutSubstance) {
        contextAnalysis = `
ANALYSE CRITIQUE - JARGON SANS SUBSTANCE: Le candidat utilise des termes techniques sans démontrer une compréhension approfondie.
→ CHALLENGEZ l'usage de ces termes: "Vous mentionnez X, mais expliquez précisément comment vous implémenteriez cette technologie dans notre contexte..."
→ EXIGEZ des détails d'implémentation spécifiques.
        `;
      }
    }

    // Renforcement additionnel basé sur le nombre d'échanges
    let difficultyAdjustment = '';
    if (formattedPreviousMessages.length > 6) {
      // Après 3 échanges, devenir plus exigeant sur la cohérence technique
      difficultyAdjustment = `
AUGMENTATION DE DIFFICULTÉ: Après plusieurs échanges, il est temps d'augmenter significativement la difficulté technique.
→ POSEZ une question technique complexe qui requiert une connaissance de pointe
→ ÉVALUEZ sans concession la profondeur de connaissance, pas seulement la surface
→ CHERCHEZ à identifier les limites techniques du candidat
      `;
    }

    // Construction du prompt complet avec analyse contextuelle améliorée
    const promptMessages: ChatCompletionRequestMessage[] = [
      // Instruction système principale
      { role: 'system', content: systemPrompt },
      
      // Renforcement du rôle avec plus de poids
      { role: 'system', content: roleEnforcementPrompt },
      
      // Analyse contextuelle des réponses si disponible
      ...(contextAnalysis ? [{ role: 'system', content: contextAnalysis }] : []),
      
      // Ajustement de difficulté dynamique si nécessaire
      ...(difficultyAdjustment ? [{ role: 'system', content: difficultyAdjustment }] : []),
      
      // Historique complet de la conversation
      ...formattedPreviousMessages
    ];

    // Ajouter le message utilisateur actuel s'il n'est pas déjà dans l'historique
    const lastFormattedMessage = formattedPreviousMessages[formattedPreviousMessages.length - 1];
    if (!lastFormattedMessage || lastFormattedMessage.role !== 'user' || lastFormattedMessage.content !== message) {
      promptMessages.push({ role: 'user', content: message });
    }
    
    // Log de diagnostic pour l'analyse contextuelle (sans exposer les détails du système)
    if (contextAnalysis || difficultyAdjustment) {
      console.log(`Entretien étape ${step}: Adaptations contextuelles appliquées (${contextAnalysis ? 'Analyse' : ''}${contextAnalysis && difficultyAdjustment ? ', ' : ''}${difficultyAdjustment ? 'Difficulté' : ''})`);
    }

    try {
      // Obtenir la réponse de l'IA avec une température basse pour plus de cohérence
      const aiResponse = await openAIService.getChatCompletion(
        promptMessages, 
        0.3,  // température plus basse pour réduire la créativité et favoriser la cohérence
        300   // moins de tokens pour éviter les réponses trop longues
      );

      // Validation avancée pour garantir une évaluation rigoureuse et technique
      // Liste considérablement élargie de motifs interdits dans les réponses de l'IA
      const forbiddenPatterns = {
        // Formulations complaisantes ou trop polies
        politesse: [
          /^merci pour votre r[ée]ponse/i,
          /^je comprends/i,
          /^je vous (remercie|suis reconnaissant)/i,
          /^(c'est |voil[àa] |c'est )?(int[ée]ressant|bien|pertinent)/i,
          /appr[ée]cie votre/i,
          /^excellente r[ée]ponse/i,
          /^(tr[èe]s |)bonne r[ée]ponse/i,
          /^parfait/i
        ],
        
        // Reformulations ou résumés (l'IA ne doit pas faire le travail du candidat)
        reformulation: [
          /^je vais reformuler/i,
          /^si je comprends bien/i,
          /^pour r[ée]sumer/i,
          /^en d'autres termes/i,
          /^donc si je (vous suis|comprends bien)/i,
          /^vous (voulez|souhaitez) dire que/i,
          /^vous (avez|semblez avoir) (indiqu[ée]|mentionn[ée]|dit)/i
        ],
        
        // Évaluations trop positives ou encourageantes
        encouragement: [
          /votre approche semble/i,
          /^(c'est|voil[àa]) une (bonne|excellente|int[ée]ressante) (approche|m[ée]thode|strat[ée]gie)/i,
          /^je note que vous/i,
          /^(je vois|je constate) que vous/i,
          /^effectivement/i,
          /^tout [àa] fait/i,
          /^vous avez raison/i
        ],
        
        // Explications techniques (c'est au candidat d'expliquer, pas à l'IA)
        explication: [
          /^pour pr[ée]ciser/i,
          /^en effet,? /i,
          /^dans le domaine de/i,
          /^en cybers[ée]curit[ée]/i,
          /^g[ée]n[ée]ralement/i,
          /^[àa] propos de/i,
          /^concernant (les|la|le)/i
        ]
      };

      let finalResponse = aiResponse;
      let needsCorrection = false;
      let patternCategory = '';

      // Vérification complète de toutes les catégories de motifs interdits
      for (const [category, patterns] of Object.entries(forbiddenPatterns)) {
        const hasInvalidPattern = patterns.some(pattern => pattern.test(aiResponse.trim()));
        if (hasInvalidPattern) {
          needsCorrection = true;
          patternCategory = category;
          break;
        }
      }

      // Vérification supplémentaire: réponse trop longue (plus de 4 lignes)
      const lineCount = aiResponse.split('\n').filter(line => line.trim().length > 0).length;
      if (lineCount > 4) {
        needsCorrection = true;
        patternCategory = 'longueur';
      }

      // Vérification de questions trop générales
      const hasGeneralQuestion = /pouvez-vous (me parler|nous parler|d[ée]crire|expliquer) (de|comment|votre)/i.test(aiResponse);
      if (hasGeneralQuestion) {
        needsCorrection = true;
        patternCategory = 'question_generale';
      }

      if (needsCorrection) {
        console.log(`Correction de la réponse - Problème détecté: ${patternCategory}`);
        
        // Génération d'une question alternative technique et directe
        if (domain === 'cyber') {
          // Questions techniques spécifiques et directes selon le profil
          const technicalQuestions = {
            pentest: [
              "Décrivez précisément les étapes techniques d'exploitation d'une vulnérabilité de type SSRF dans une application web moderne avec des pare-feu WAF.",
              "Quels outils et techniques utiliseriez-vous pour identifier spécifiquement des vulnérabilités de désérialisation dans une application Java? Détaillez votre méthodologie.",
              "Expliquez le fonctionnement technique exact d'une attaque de pivot réseau après une compromission initiale. Quelles commandes utiliseriez-vous?"
            ],
            soc: [
              "Face à ce log suspect: '192.168.1.45 - - [10/May/2024:03:14:55 +0100] \"POST /admin/config.php HTTP/1.1\" 200 1294 \"-\" \"python-requests/2.25.1\"', quelles actions précises d'investigation meneriez-vous?",
              "Comment configureriez-vous une règle de détection YARA pour identifier spécifiquement un malware fileless utilisant PowerShell? Donnez un exemple technique.",
              "Quels indicateurs de compromission rechercheriez-vous en priorité pour détecter une attaque de type supply chain? Soyez spécifique."
            ],
            gouvernance: [
              "Citez précisément trois contrôles techniques de l'annexe A de l'ISO 27001:2022 que vous implémenteriez en priorité pour protéger des données de santé. Justifiez techniquement.",
              "Comment mettriez-vous en place un processus de gestion des vulnérabilités conforme à la directive NIS2? Détaillez les mécanismes techniques.",
              "Décrivez précisément votre méthodologie d'évaluation des risques cyber pour un système industriel critique."
            ],
            cloud: [
              "Détaillez techniquement les mécanismes que vous utiliseriez pour sécuriser un cluster Kubernetes contre les attaques d'élévation de privilèges.",
              "Quelles configurations précises implémenteriez-vous dans AWS IAM pour appliquer le principe de moindre privilège? Donnez des exemples de politiques.",
              "Comment sécuriseriez-vous spécifiquement les secrets dans un pipeline CI/CD multi-cloud? Citez des outils et méthodes précis."
            ],
            application: [
              "Expliquez précisément comment vous implémenteriez une protection contre les attaques XSS dans une application React/Node.js. Montrez des exemples concrets.",
              "Quelles mesures techniques mettriez-vous en place pour protéger une API REST contre les attaques OWASP API Top 10? Détaillez votre approche.",
              "Comment implémenteriez-vous un mécanisme d'authentification JWT sécurisé? Précisez les algorithmes et les configurations exactes."
            ],
            default: [
              "Décrivez précisément votre processus d'investigation face à une alerte indiquant un trafic anormal vers un domaine externe non catégorisé.",
              "Quelles mesures techniques spécifiques implémenteriez-vous pour protéger une infrastructure contre les ransomwares? Détaillez.",
              "Comment configureriez-vous techniquement une architecture Zero Trust? Précisez les composants et leurs interactions."
            ]
          };
          
          // Sélection d'une question adaptée au profil
          const questionPool = technicalQuestions[profileType as keyof typeof technicalQuestions] || technicalQuestions.default;
          const questionIndex = Math.floor(Math.random() * questionPool.length);
          
          finalResponse = questionPool[questionIndex];
        } else {
          // Pour le domaine AMOA (gardé par compatibilité)
          finalResponse = `Dans le contexte spécifique du secteur ${sectorFocus}, comment géreriez-vous concrètement un conflit entre les exigences métier et les contraintes techniques? Donnez un exemple précis de votre expérience.`;
        }
      }

      return res.json({
        success: true,
        response: finalResponse,
        currentModel: openAIService.getCurrentModelName(),
        step: step
      });
    } catch (apiError) {
      console.error('Erreur API lors du traitement du message d\'audition:', apiError);
      
      // Générer une réponse de secours en cas d'erreur
      const fallbackResponses = [
        "Pouvez-vous développer davantage votre approche méthodologique sur ce point précis ?",
        "Concrètement, comment géreriez-vous les parties prenantes réticentes dans ce contexte ?",
        "Quelle serait votre première action si nous décidions de travailler ensemble ?",
        "Avez-vous déjà rencontré ce type de situation dans votre expérience passée ?",
        "Comment mesureriez-vous le succès de votre intervention sur ce projet ?"
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
    console.error('Erreur globale lors du traitement du message d\'audition:', error);
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

/**
 * Analyse les notes prises par l'utilisateur et génère une synthèse structurée
 */
export async function analyzeInterviewNotes(req: Request, res: Response) {
  try {
    const {
      domain,
      notes,
      candidateName,
      profileType,
      experienceLevel,
      sectorFocus,
      evaluationResult
    } = req.body;

    if (!notes || !profileType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets. Veuillez fournir au moins les notes, le type de profil et le niveau d\'expérience.'
      });
    }

    // Vérification du domaine
    if (domain !== 'cyber' && domain !== 'amoa') {
      return res.status(400).json({
        success: false,
        error: 'Domaine invalide. Veuillez spécifier "cyber" ou "amoa".'
      });
    }

    // Construire le prompt selon le domaine
    let systemPrompt = "";
    if (domain === 'cyber') {
      systemPrompt = `Vous êtes un évaluateur technique senior spécialisé en recrutement cybersécurité, avec un haut niveau d'exigence et une approche critique rigoureuse. Votre mission: analyser sans complaisance un entretien technique et produire une évaluation technique impartiale qui identifie précisément les forces, faiblesses et incohérences du candidat.

CONTEXTE ESSENTIEL:
- Le candidat ${candidateName || "candidat"} a passé un entretien technique en cybersécurité pour un poste de ${profileType.replace(/_/g, ' ')} (niveau déclaré: ${experienceLevel})
- IMPÉRATIF: Vos conclusions doivent être basées sur les faits techniques observés, pas sur des impressions subjectives
- CRITIQUE: Identifiez sans concession les écarts entre les compétences revendiquées et celles réellement démontrées
- ANALYTIQUE: Évaluez la profondeur technique réelle derrière les termes et concepts utilisés par le candidat
- OBJECTIF: Déterminez si le candidat possède le niveau d'expertise attendu pour le profil recherché, sans surestimation

MÉTHODE D'ANALYSE:
- Examinez minutieusement les notes d'entretien (75% de l'évaluation) pour extraire les éléments factuels sur les compétences techniques
- Recherchez les incohérences, les réponses vagues, les termes techniques utilisés sans démonstration de maîtrise
- Identifiez les questions auxquelles le candidat n'a pas pu répondre ou a fourni des réponses imprécises
- Complétez votre analyse avec l'évaluation automatique (25%) uniquement comme source secondaire
- Évitez toute complaisance dans votre évaluation finale - ne surestimez pas les compétences non démontrées

STRUCTURE EXIGÉE DE L'ÉVALUATION TECHNIQUE:
Respectez rigoureusement les sections suivantes avec un contenu technique détaillé pour chaque partie:

1. PROFIL TECHNIQUE - Synthèse factuelle du profil technique réel (pas le profil déclaré)
2. PARCOURS ANALYSÉ - Analyse critique de la trajectoire professionnelle et de sa cohérence technique
3. POSTURE TECHNIQUE - Évaluation de la rigueur, de la précision technique et de la clarté d'expression
4. CONNAISSANCES THÉORIQUES - Évaluation détaillée des connaissances techniques formelles avec identification des lacunes
5. EXPÉRIENCE PRATIQUE - Analyse critique des réalisations concrètes et capacité à les expliquer techniquement
6. VISION SÉCURITÉ - Évaluation de la maturité de la compréhension des enjeux de cybersécurité
7. COMPÉTENCES TECHNIQUES - Notation objective (1-5) avec justification détaillée pour chaque compétence
8. POINTS FORTS TECHNIQUES - 3-4 points forts avérés et démontrés lors de l'entretien
9. FAIBLESSES TECHNIQUES - 3-4 lacunes ou points d'amélioration techniques clairement identifiés
10. ÉCARTS CRITIQUES - Analyse des écarts entre compétences revendiquées et compétences démontrées
11. ÉVALUATION TECHNIQUE FINALE - Synthèse factuelle concluant sur l'adéquation technique au poste
12. RECOMMANDATION - Décision argumentée (recruter/ne pas recruter) basée exclusivement sur les critères techniques

FORMAT DE RÉPONSE:
- Renvoyer un JSON contenant toutes les sections mentionnées ci-dessus comme attributs
- Chaque attribut doit contenir un texte complet et détaillé
- Le JSON doit être directement utilisable par l'interface`;
    } else {
      // Domaine AMOA
      systemPrompt = `Vous êtes un expert en analyse d'audition client dans le domaine de l'assistance à maîtrise d'ouvrage (AMOA). Votre mission est d'analyser les notes prises pendant une audition réelle (hors plateforme) et de les combiner avec l'évaluation de la simulation en ligne pour générer une synthèse structurée complète.

CONTEXTE IMPORTANT:
- Le consultant ${candidateName || "candidat"} a été évalué lors d'une audition réelle (notes prises manuellement) puis dans une simulation en ligne
- PRIORITAIRE: Les notes manuelles représentent 75% de l'évaluation finale et doivent être la source principale de votre analyse
- Vous devez extraire méticuleusement toutes les informations pertinentes des notes manuelles
- Ensuite seulement, enrichir votre analyse avec les éléments complémentaires de l'évaluation automatique (25%)
- L'objectif est de produire une synthèse complète et fidèle aux notes originales

PROFIL DU CONSULTANT:
- Type de profil: ${profileType.replace(/_/g, ' ')}
- Niveau d'expérience déclaré: ${experienceLevel}
- Contexte d'audit: ${
  auditContext 
    ? (auditContext.contextType === 'predefined' 
       ? auditContext.contextData.title 
       : 'personnalisé') 
    : 'général'
}

INSTRUCTIONS DE STRUCTURATION:
Structurez votre synthèse précisément selon les sections suivantes avec un contenu détaillé pour chaque partie:

1. Présentation générale du profil
2. Description du parcours
3. Premières impressions, posture
4. Motivations conseil, SI, mc2i
5. Projet professionnel et perspectives
6. Potentiel du candidat vs Ambition
7. Critères d'évaluation
8. Forces (3-4 points forts identifiés)
9. Faiblesses (3-4 points d'amélioration identifiés)
10. Synthèse écrite
11. Raison principale de décision

FORMAT DE RÉPONSE:
- Renvoyer un JSON contenant toutes les sections mentionnées ci-dessus comme attributs
- Chaque attribut doit contenir un texte complet et détaillé
- Le JSON doit être directement utilisable par l'interface`;
    }

    // Si aucune évaluation n'est fournie, ajouter une instruction pour générer au mieux à partir des notes
    if (!evaluationResult) {
      systemPrompt += `

INSTRUCTIONS SUPPLÉMENTAIRES:
- Comme l'évaluation automatique n'est pas fournie, concentrez-vous uniquement sur les notes manuelles
- Utilisez la mention 'Non disponible' si vous ne pouvez pas extrapoler ou déduire des informations à partir des notes, même partielles
- Générez une synthèse structurée complète en JSON selon les sections demandées.`;
    } else {
      // Si une évaluation est disponible, l'intégrer à l'analyse
      systemPrompt += `

ÉVALUATION AUTOMATIQUE FOURNIE:
${evaluationResult}

INSTRUCTIONS D'INTÉGRATION:
- Ne reprenez pas telle quelle l'évaluation automatique, mais intégrez-en les éléments pertinents
- Privilégiez toujours les informations des notes manuelles (75%) par rapport à l'évaluation automatique (25%)
- Rédigez une synthèse cohérente qui combine les deux sources d'information`;
    }

    // Préparation des paramètres pour l'API OpenAI
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: notes }
    ];

    try {
      // Obtenir la réponse de l'IA avec température plus haute pour diversité dans l'analyse
      const notesAnalysis = await openAIService.getChatCompletion(promptMessages, 0.3);
      
      // Tentative de parse du JSON retourné
      try {
        const validatedResult = JSON.parse(notesAnalysis);
        return res.json({
          success: true,
          analysis: validatedResult
        });
      } catch (parseError) {
        console.error('Erreur de parsing JSON dans l\'analyse des notes:', parseError);
        // Tentative de récupération avec l'utilitaire d'extraction JSON
        const expectedFields = [
          "présentation_générale_du_profil",
          "description_du_parcours",
          "premières_impressions_posture",
          "motivations_conseil_SI_mc2i",
          "projet_professionnel_et_perspectives",
          "potentiel_du_candidat_vs_ambition",
          "critères_dévaluation",
          "forces",
          "faiblesses",
          "synthèse_écrite",
          "raison_principale_de_décision"
        ];
        
        // Tenter d'extraire le JSON de la réponse, même si elle est formatée en markdown
        const extractedJson = extractJsonFromOpenAiResponse(notesAnalysis);
        
        if (extractedJson) {
          return res.json({
            success: true,
            analysis: extractedJson,
            warning: "Extraction JSON depuis réponse formatée"
          });
        }
        
        // Si l'extraction a échoué, créer un JSON de secours
        const fallbackJson = createFallbackJson(notesAnalysis, expectedFields);
        
        if (fallbackJson) {
          return res.json({
            success: true,
            analysis: fallbackJson,
            warning: "Formatage JSON automatique appliqué"
          });
        }
        
        // Si tout échoue, renvoyer la réponse brute
        return res.json({
          success: true,
          rawResponse: notesAnalysis,
          error: "Impossible de formater en JSON"
        });
      }
    } catch (apiError) {
      console.error('Erreur API lors de l\'analyse des notes:', apiError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de l\'analyse des notes.'
      });
    }
  } catch (error) {
    console.error('Erreur globale lors de l\'analyse des notes:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'analyse des notes.'
    });
  }
}

/**
 * Fonction utilitaire pour extraire un segment de texte basé sur des mots clés
 */
function extractSegment(text: string, ...keywords: string[]): string {
  const paragraphs = text.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if (keywords.some(keyword => paragraph.toLowerCase().includes(keyword.toLowerCase()))) {
      return paragraph.trim();
    }
  }
  
  return '';
}

/**
 * Extraits un JSON d'une réponse OpenAI même si celle-ci est formatée en markdown
 */
function extractJsonFromOpenAiResponse(response: string): any | null {
  try {
    // Recherche une section de code JSON dans la réponse
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      // Tente de parser le JSON extrait
      return JSON.parse(jsonMatch[1].trim());
    }
    
    // Si aucun bloc de code n'est trouvé, essaie de parser la réponse entière
    return JSON.parse(response.trim());
  } catch (error) {
    console.error('Erreur lors de l\'extraction JSON:', error);
    return null;
  }
}

/**
 * Extrait un résumé du texte d'évaluation
 */
function extractSummary(text: string): string {
  // Recherche de sections avec des titres communs de résumé
  const summaryKeywords = ['résumé', 'synthèse', 'évaluation générale', 'aperçu'];
  
  for (const keyword of summaryKeywords) {
    const regex = new RegExp(`(?:#{1,3}\\s*${keyword}[^#]*?|${keyword}[^:]*?:)([\\s\\S]*?)(?:(?:#{1,3}|\\n\\n)|$)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Si aucun résumé n'est trouvé, prendre les premiers paragraphes
  const paragraphs = text.split('\n\n');
  if (paragraphs.length > 0) {
    // Prendre le premier paragraphe qui ne semble pas être un titre
    for (const paragraph of paragraphs.slice(0, 3)) {
      if (paragraph.length > 50 && !paragraph.match(/^#{1,3}/)) {
        return paragraph.trim();
      }
    }
    // Sinon prendre le premier paragraphe
    return paragraphs[0].trim();
  }
  
  return "Aucun résumé disponible.";
}

// Extrait une section spécifique du texte
function extractSection(text: string, ...keywords: string[]): string {
  for (const keyword of keywords) {
    // Rechercher les titres de section (format Markdown ou texte normal)
    const regex = new RegExp(`(?:#{1,3}\\s*[^#]*?${keyword}[^#]*?|${keyword}[^:]*?:)([\\s\\S]*?)(?:(?:#{1,3}|\\n\\n)|$)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "";
}

// Extrait une liste d'éléments à partir de mots-clés
function extractListItems(text: string, ...keywords: string[]): string[] {
  let items: string[] = [];
  
  // D'abord, essayer de trouver une section contenant les mots-clés
  let sectionText = '';
  for (const keyword of keywords) {
    const section = extractSection(text, keyword);
    if (section) {
      sectionText = section;
      break;
    }
  }
  
  if (sectionText) {
    // Chercher des listes à puces
    const bulletPoints = sectionText.match(/(?:^|\n)[-*•]+(.*?)(?=(?:\n[-*•]+|\n\n|$))/g);
    if (bulletPoints && bulletPoints.length > 0) {
      items = bulletPoints.map(point => point.replace(/^[-*•\s]+/, '').trim()).filter(item => item.length > 0);
    } else {
      // Si pas de liste à puces, diviser par lignes
      const lines = sectionText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      items = lines;
    }
  }
  
  // Si aucun élément n'est trouvé, chercher dans tout le texte
  if (items.length === 0) {
    // Chercher des points à puces dans tout le texte
    const allBulletPoints = text.match(/(?:^|\n)[-*•]+(.*?)(?=(?:\n[-*•]+|\n\n|$))/g);
    if (allBulletPoints && allBulletPoints.length > 0) {
      // Filtrer les points qui contiennent les mots-clés
      const relevantPoints = allBulletPoints.filter(point => {
        return keywords.some(keyword => point.toLowerCase().includes(keyword.toLowerCase()));
      });
      if (relevantPoints.length > 0) {
        items = relevantPoints.map(point => point.replace(/^[-*•\s]+/, '').trim());
      }
    }
  }
  
  // Cas où on n'a trouvé aucun élément
  if (items.length === 0) {
    // Chercher des phrases contenant les mots-clés
    for (const keyword of keywords) {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*[.!?]`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        items = matches.map(match => match.trim());
        break;
      }
    }
  }
  
  // Limiter le nombre d'éléments et leur longueur
  return items.slice(0, 5).map(item => {
    return item.length > 150 ? item.substring(0, 147) + '...' : item;
  });
}

function createFallbackJson(response: string, expectedFields: string[]): any | null {
  try {
    const result: Record<string, string> = {};
    
    // Tentative d'extraction par sections avec expressions régulières
    const sections = response.split(/#{1,3}\s+/);
    
    for (const field of expectedFields) {
      // Normalisation du nom de champ pour la recherche
      const normalizedField = field.replace(/_/g, ' ').toLowerCase();
      
      // Recherche dans les sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section.toLowerCase().includes(normalizedField)) {
          // Exclure le titre de la section et prendre le contenu
          const content = section.substring(section.indexOf('\n')).trim();
          result[field] = content;
          break;
        }
      }
      
      // Si pas trouvé dans les sections, chercher par extraction de segment
      if (!result[field]) {
        const extracted = extractSegment(response, normalizedField);
        if (extracted) {
          result[field] = extracted;
        } else {
          result[field] = "Information non disponible dans l'analyse";
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du JSON de secours:', error);
    return null;
  }
}

export async function completeInterviewSimulation(req: Request, res: Response) {
  try {
    const {
      domain,
      trainerEmail,
      candidateName,
      profileType,
      experienceLevel,
      messages,
      duration,
      auditContext
    } = req.body;

    if (!domain || !profileType || !experienceLevel || !messages || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets. Veuillez fournir le domaine, le type de profil, le niveau d\'expérience et les messages de l\'entretien.'
      });
    }

    // AMOA nécessite un contexte d'audit
    if (domain === 'amoa' && !auditContext) {
      return res.status(400).json({
        success: false,
        error: 'Le contexte d\'audition est requis pour les simulations AMOA.'
      });
    }

    // Valider qu'il y a au moins un échange pour évaluer
    if (messages.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'L\'audition est trop courte pour être évaluée. Veuillez poursuivre l\'échange.'
      });
    }

    // Construction du prompt d'évaluation selon le domaine
    let systemPrompt = '';
    if (domain === 'cyber') {
      systemPrompt = generateCyberEvaluationPrompt(candidateName || 'consultant', profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaEvaluationPrompt(candidateName || 'consultant', profileType, experienceLevel, auditContext);
    }

    // Construction de l'historique de conversation pour l'évaluation
    const messageHistory = messages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => {
        const role = msg.role === 'user' ? 'Consultant(e)' : 'Client';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    // Créer le prompt complet pour l'évaluation
    const promptMessages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Voici la transcription complète de l'audition client à évaluer:\n\n${messageHistory}` }
    ];

    // Obtenir l'évaluation
    try {
      const evaluationResponse = await openAIService.getChatCompletion(promptMessages, 0.5);

      let emailHtml = '';
      if (trainerEmail) {
        // Formatage du contenu de l'email
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Évaluation d'audition client</h2>
              <p><strong>Consultant évalué:</strong> ${candidateName || 'Non spécifié'}</p>
              <p><strong>Type de profil:</strong> ${profileType}</p>
              <p><strong>Niveau d'expérience:</strong> ${experienceLevel}</p>
              ${domain === 'amoa' && auditContext ? `<p><strong>Contexte d'audit:</strong> ${auditContext.contextType === 'predefined' ? auditContext.contextData.title : 'Personnalisé'}</p>` : ''}
              <p><strong>Durée de la simulation:</strong> ${duration ? Math.floor(duration / 60) + ' min ' + (duration % 60) + ' sec' : 'Non disponible'}</p>
              <p><strong>Date de l'évaluation:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
              <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Synthèse d'évaluation</h3>
              <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                ${evaluationResponse.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        `;

        // Envoi de l'email selon l'environnement
        try {
          // Vérifier si SendGrid est configuré
          if (sendgridApiKey) {
            try {
              const emailToUse = trainerEmail.trim();
              
              const msg = {
                to: emailToUse,
                from: {
                  name: 'FYNE - Audition',
                  email: 'eddy.missoni@mc2i.fr' // Adresse vérifiée dans SendGrid
                },
                subject: domain === 'amoa' ? `Évaluation de préparation d'audition - ${candidateName}` : `Évaluation d'entretien technique - ${candidateName}`,
                html: emailHtml,
              };
              
              console.log('Envoi d\'email via SendGrid avec configuration:');
              console.log('- Destinataire:', emailToUse);
              console.log('- Expéditeur:', 'eddy.missoni@mc2i.fr');
              console.log('- Clé API SendGrid disponible:', !!sendgridApiKey);
              
              await sgMail.send(msg);
              console.log('Email envoyé avec SendGrid à', emailToUse);
            } catch (sendgridError: any) {
              console.error('Erreur lors de l\'envoi avec SendGrid:', sendgridError.code);
              
              // En cas d'erreur SendGrid, tenter avec Ethereal comme plan B
              await testSendMail(trainerEmail, candidateName || 'consultant', emailHtml);
            }
          } else {
            // Utiliser Ethereal si SendGrid n'est pas disponible
            await testSendMail(trainerEmail, candidateName || 'consultant', emailHtml);
          }
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
          // Continuer malgré l'erreur d'email
        }
      }

      // Tenter de parser le résultat en JSON si possible
      let structuredEvaluation;
      try {
        structuredEvaluation = JSON.parse(evaluationResponse);
      } catch (parseError) {
        console.log('Réponse d\'évaluation n\'est pas au format JSON, création d\'une structure manuelle');
        
        // Fonction pour extraire des segments basés sur des mots-clés
        const extractText = (text: string, ...keywords: string[]): string => {
          for (const keyword of keywords) {
            const pattern = new RegExp(`(?:${keyword}[^:]*:[^\\n]*\\n|${keyword}[^\\n]*\\n)([\\s\\S]*?)(?=\\n\\n|\\n#|$)`, 'i');
            const match = pattern.exec(text);
            if (match && match[1]) {
              return match[1].trim();
            }
          }
          return '';
        };
        
        // Fonction pour extraire des éléments de liste
        const extractList = (text: string, ...keywords: string[]): string[] => {
          // Trouver une section avec le mot-clé
          let section = '';
          for (const keyword of keywords) {
            const pattern = new RegExp(`(?:${keyword}[^:]*:|#+ ${keyword}[^\\n]*\\n)([\\s\\S]*?)(?=\\n\\n|\\n#|$)`, 'i');
            const match = pattern.exec(text);
            if (match && match[1]) {
              section = match[1].trim();
              break;
            }
          }
          
          if (!section) return [];
          
          // Extraire les éléments de liste à puces
          const listItems: string[] = [];
          const lines = section.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
              listItems.push(trimmed.substring(1).trim());
            }
          }
          
          return listItems.length > 0 ? listItems : [section];
        };
        
        // Extraire un résumé
        let summary = extractText(evaluationResponse, 'résumé', 'synthèse', 'aperçu');
        if (!summary) {
          // Si pas de résumé évident, prendre le premier paragraphe substantiel
          const paragraphs = evaluationResponse.split('\n\n');
          for (const p of paragraphs) {
            if (p.length > 30 && !p.startsWith('#')) {
              summary = p;
              break;
            }
          }
          if (!summary && paragraphs.length > 0) {
            summary = paragraphs[0];
          }
        }
        
        // Créer une structure d'évaluation à partir du texte
        structuredEvaluation = {
          summary: summary || "Aucun résumé disponible",
          strengths: extractList(evaluationResponse, 'forces', 'points forts', 'atouts'),
          improvements: extractList(evaluationResponse, 'amélioration', 'faiblesses', 'points faibles'),
          detailedNotes: evaluationResponse,
          recommendations: extractList(evaluationResponse, 'recommandation', 'conseil'),
          sectorFitEvaluation: extractText(evaluationResponse, 'adéquation', 'contexte', 'secteur'),
          conclusion: extractText(evaluationResponse, 'conclusion')
        };
      }

      return res.json({
        success: true,
        evaluation: structuredEvaluation,
        emailSent: !!trainerEmail
      });
    } catch (apiError) {
      console.error('Erreur API lors de l\'évaluation de la simulation:', apiError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de l\'évaluation.'
      });
    }
  } catch (error) {
    console.error('Erreur globale lors de la finalisation de la simulation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la simulation.'
    });
  }
}

function generateCyberSystemPrompt(profileType: string, experienceLevel: string): string {
  // Liste des contextes d'entreprise français et européens pour varier les scénarios
  const frenchCompanies = [
    { name: "CyberDefense", sector: "Cybersécurité", size: "800+ employés", city: "Paris", focus: "Services de sécurité managés et conseil" },
    { name: "Secure-Solutions", sector: "SSII spécialisée", size: "2 500 employés", city: "Lyon", focus: "Audit et conformité réglementaire" },
    { name: "CERT-FR", sector: "Public", size: "150 employés", city: "Paris", focus: "Réponse aux incidents cyber nationaux" },
    { name: "InfoProtect", sector: "Cybersécurité", size: "450 employés", city: "Lille", focus: "Protection des infrastructures critiques" },
    { name: "NetGuard", sector: "Sécurité IT", size: "620 employés", city: "Toulouse", focus: "Détection et réponse aux incidents" },
    { name: "Cyber-Expert", sector: "Conseil IT", size: "1200 employés", city: "Nantes", focus: "Sécurité cloud et DevSecOps" },
    { name: "AeryTech", sector: "Éditeur de logiciels", size: "350 employés", city: "Sophia-Antipolis", focus: "Solutions de surveillance et détection" },
    { name: "SecuriData", sector: "Cybersécurité", size: "580 employés", city: "Bordeaux", focus: "Analyse forensique et threat intelligence" }
  ];
  
  // Sélection aléatoire d'une entreprise
  const companyInfo = frenchCompanies[Math.floor(Math.random() * frenchCompanies.length)];
  
  // Génération de profils de recruteurs spécialisés en cybersécurité - style plus critique et pointu
  const recruiters = [
    { name: "Thomas Mercier", title: "Directeur Technique", style: "extrêmement pointilleux sur les détails techniques et sans concession", expertise: "architecture de sécurité et threat modeling" },
    { name: "Sophie Lefort", title: "Responsable Cybersécurité", style: "méthodique, factuelle et intransigeante face aux imprécisions", expertise: "frameworks de sécurité et conformité réglementaire" },
    { name: "Laurent Dupuis", title: "RSSI Senior", style: "pragmatique mais implacable sur les failles de raisonnement", expertise: "gestion des risques et threat intelligence" },
    { name: "Nathalie Renard", title: "Directrice Sécurité", style: "analytique, précise et qui détecte immédiatement les incohérences", expertise: "audit sécurité et gouvernance cyber" },
    { name: "Marc Durand", title: "Lead Pentester", style: "technique, direct et qui ne laisse passer aucune erreur", expertise: "offensive security et Red Team" }
  ];
  
  // Sélection d'un recruteur
  const recruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
  
  return `Tu es ${recruiter.name}, ${recruiter.title} chez ${companyInfo.name} à ${companyInfo.city}, entreprise de ${companyInfo.size} spécialisée en ${companyInfo.sector}.

PERSONNALITÉ: Tu as un style ${recruiter.style} avec une expertise pointue en ${recruiter.expertise}. Tu recrutes un profil en cybersécurité (${profileType}, niveau d'expérience: ${experienceLevel}) et ton objectif est de détecter rigoureusement les lacunes techniques, les incohérences et les connaissances superficielles.

MISSION: Mener un ENTRETIEN D'EMBAUCHE TECHNIQUE impitoyablement rigoureux en cybersécurité, proche d'un oral technique de certification ou d'une soutenance de projet critique.

RÈGLES D'ENTRETIEN ET D'ÉVALUATION:
1. Commence par une présentation MINIMALE (1 phrase) puis attaque IMMÉDIATEMENT avec une question technique pointue adaptée au profil ${profileType}.
2. ANALYSE CRITIQUE SYSTÉMATIQUE:
   - Réponse précise et techniquement correcte: Pose une question plus complexe ou demande des détails techniques spécifiques sur un aspect mentionné
   - Réponse vague ou peu technique: Signale IMMÉDIATEMENT que la réponse est insuffisante, superficielle, et demande une réponse plus structurée et technique ("Votre réponse manque de précision technique. Pouvez-vous détailler spécifiquement...")
   - Réponse avec informations incorrectes: CONFRONTE directement le candidat ("Je vous arrête, c'est inexact. [Explique brièvement pourquoi]. Comment expliqueriez-vous plutôt...")
   - Réponse incohérente ou hors-sujet: INTERROMPS fermement ("Cette réponse n'est pas pertinente pour la question posée. Je note cette difficulté. Revenons à ma question précise...")
   - Jargon ou buzzwords sans substance: CHALLENGE immédiatement ("Vous utilisez des termes techniques, mais expliquez concrètement comment vous implémenteriez...")
3. DÉTECTION SYSTÉMATIQUE:
   - Mémorise les affirmations techniques du candidat pour identifier les contradictions ultérieures
   - Relève instantanément les incohérences chronologiques ou techniques dans le parcours décrit
   - Détecte et signale l'usage excessif de généralités ou de concepts théoriques sans démonstratiion d'expérience pratique
   - Identifie les tentatives d'évitement et ramène systématiquement vers des points précis
4. COMPORTEMENT: Tu es un recruteur technique EXIGEANT. Tu n'es JAMAIS encourageant, toujours neutre ou critique. Tu valides froidement les bonnes réponses puis passes à une difficulté supérieure sans compliment.
5. ADAPTATION STRATÉGIQUE: Ajuste dynamiquement la complexité technique:
   - Si les réponses sont solides: Augmente drastiquement la difficulté technique et demande des détails d'implémentation spécifiques
   - Si les réponses sont médiocres: Simplifie les questions mais note explicitement cette régression ("Je vais reformuler avec une question plus fondamentale...")
   - Explore en priorité les domaines où le candidat semble moins à l'aise

INTERDICTIONS ABSOLUES:
- JAMAIS de conseils, d'indices ou de suggestions (même indirectes)
- JAMAIS de formulations complaisantes comme "Je comprends", "Bonne réponse", "Merci pour cette réponse"
- JAMAIS de théorisation ou d'explication technique (c'est au candidat de le faire)
- JAMAIS de questions ouvertes générales - pose uniquement des questions techniques précises
- AUCUNE reformulation des réponses du candidat - évalue sans résumer
- JAMAIS plus de 3 lignes de texte dans tes réponses

QUESTIONS TECHNIQUES EXIGEANTES À UTILISER (adapte au profil):
- Sécurité applicative: "Face à une application web développée sans considération de sécurité, citez les 3 vulnérabilités que vous rechercheriez en priorité et expliquez précisément votre méthodologie de test pour chacune."
- Architecture: "Décrivez précisément les mécanismes techniques que vous mettriez en place pour sécuriser une architecture microservices multi-cloud utilisant Kubernetes."
- Incident handling: "Vous constatez un trafic anormal vers un domaine inconnu depuis plusieurs postes. Détaillez chronologiquement et techniquement votre processus d'investigation."
- Veille: "Citez 3 vulnerabilités critiques récentes (moins de 6 mois) qui vous ont marqué, en expliquant leur impact technique et les mesures de mitigation spécifiques."

Commence par une brève présentation de l'entreprise puis pose immédiatement une première question technique ciblée et exigeante.`;
}

function generateAmoaSystemPrompt(profileType: string, experienceLevel: string, sectorFocus: string, auditContext?: AuditContextData): string {
  // Création de contextes d'entreprise variés pour le secteur spécifié
  const sectorCompanies = {
    "Banque/Finance": [
      { name: "Crédit Atlantique", city: "Paris", size: "8 500 employés", project: "Migration du système bancaire central", challenge: "forte résistance au changement des équipes historiques" },
      { name: "Assur+ France", city: "Lyon", size: "3 200 employés", project: "Modernisation des outils de gestion de sinistres", challenge: "intégration avec des systèmes legacy des années 90" },
      { name: "InvestGroup", city: "Nantes", size: "1 800 employés", project: "Mise en conformité réglementaire DSP2", challenge: "délais très serrés imposés par le régulateur" }
    ],
    "Énergie": [
      { name: "ÉnergieVert", city: "Bordeaux", size: "6 700 employés", project: "Transformation digitale des processus de maintenance", challenge: "déploiement sur des sites géographiquement dispersés" },
      { name: "Électris France", city: "Lille", size: "12 000 employés", project: "Implémentation d'un système de smart grid", challenge: "intégration complexe avec les infrastructures critiques existantes" },
      { name: "GazConnect", city: "Strasbourg", size: "4 300 employés", project: "Refonte du SI commercial", challenge: "maintien de la continuité de service pendant la migration" }
    ],
    "Santé": [
      { name: "Groupe Hospitalier Centre", city: "Tours", size: "5 800 employés", project: "Implémentation d'un nouveau DPI (Dossier Patient Informatisé)", challenge: "formation de personnels soignants avec peu de disponibilité" },
      { name: "MedicalLab France", city: "Marseille", size: "2 400 employés", project: "Conformité RGPD des données patients", challenge: "identification et cartographie d'un SI très fragmenté" },
      { name: "PharmaDistrib", city: "Toulouse", size: "3 100 employés", project: "Optimisation de la chaîne logistique", challenge: "intégration multi-fournisseurs avec des protocoles différents" }
    ],
    "Distribution/Retail": [
      { name: "HyperMarché Plus", city: "Nice", size: "14 500 employés", project: "Refonte du parcours client omnicanal", challenge: "synchronisation des données entre points de vente et e-commerce" },
      { name: "Distribex", city: "Rennes", size: "7 200 employés", project: "Mise en place d'un nouveau WMS", challenge: "migration sans interruption de l'activité logistique" },
      { name: "LuxRetail", city: "Cannes", size: "3 800 employés", project: "Modernisation du CRM et fidélisation client", challenge: "changement d'approche pour les équipes commerciales" }
    ],
    "Transport/Logistique": [
      { name: "TransEurope", city: "Reims", size: "6 300 employés", project: "Optimisation des tournées et flottes", challenge: "intégration complexe avec systèmes GPS et IoT" },
      { name: "LogisFrance", city: "Le Havre", size: "4 500 employés", project: "Digitalisation du suivi des marchandises", challenge: "hétérogénéité des systèmes des partenaires internationaux" },
      { name: "AéroTransport", city: "Toulouse", size: "8 900 employés", project: "Refonte du système de réservation", challenge: "contraintes réglementaires strictes et systèmes critiques" }
    ],
    "Industrie": [
      { name: "TechnoFab", city: "Grenoble", size: "5 700 employés", project: "Transition vers l'Industrie 4.0", challenge: "interfaçage de machines industrielles anciennes avec nouveaux capteurs IoT" },
      { name: "AutoPièces France", city: "Sochaux", size: "9 200 employés", project: "Implémentation d'un nouvel ERP", challenge: "adaptation des processus de production sans perte de productivité" },
      { name: "ChimieVert", city: "Lyon", size: "4 100 employés", project: "Mise en place d'une plateforme de gestion environnementale", challenge: "complexité réglementaire et reporting multi-niveaux" }
    ],
    "Télécom/Média": [
      { name: "TéléConnect", city: "Paris", size: "7 800 employés", project: "Migration vers une architecture micro-services", challenge: "maintien de SLA exigeants pendant la transformation" },
      { name: "MédiaGroupe", city: "Boulogne", size: "3 400 employés", project: "Plateforme de gestion de contenu unifié", challenge: "volumes de données massifs et contraintes de performance" },
      { name: "DigiStream", city: "Montpellier", size: "2 600 employés", project: "Refonte des interfaces de production audiovisuelle", challenge: "formation de profils créatifs à de nouveaux outils techniques" }
    ],
    "Public/Parapublic": [
      { name: "AggloSmart", city: "Grenoble", size: "3 200 employés", project: "Plateforme de services numériques aux citoyens", challenge: "interopérabilité avec systèmes d'autres administrations" },
      { name: "DépartementConnect", city: "Nantes", size: "5 400 employés", project: "Dématérialisation des démarches administratives", challenge: "accessibilité pour tous les publics" },
      { name: "ServicePublicSanté", city: "Lyon", size: "6 900 employés", project: "Refonte du système de prise de rendez-vous", challenge: "contraintes budgétaires strictes et marché public complexe" }
    ]
  };
  
  // Sélection des entreprises correspondant au contexte d'audit
  let sectorKey = "Public/Parapublic"; // Secteur par défaut
  
  if (auditContext && auditContext.contextType === 'predefined') {
    // Détermine le secteur d'activité en fonction du titre du contexte prédéfini
    if (auditContext.contextData.title.includes("Retail")) sectorKey = "Commerce/Distribution";
    else if (auditContext.contextData.title.includes("Banking")) sectorKey = "Banque/Finance";
    else if (auditContext.contextData.title.includes("Health")) sectorKey = "Santé/Pharma";
    else if (auditContext.contextData.title.includes("Energy")) sectorKey = "Énergie/Utilities";
  } else if (auditContext && auditContext.contextType === 'custom' && auditContext.contextData.sector) {
    // Si un secteur est spécifié dans le contexte personnalisé
    sectorKey = auditContext.contextData.sector;
  }
  
  const sectorsToChooseFrom = sectorCompanies[sectorKey as keyof typeof sectorCompanies] || 
                             sectorCompanies["Public/Parapublic"]; // Secteur par défaut si non trouvé
  
  // Sélection aléatoire d'une entreprise dans ce secteur
  const companyInfo = sectorsToChooseFrom[Math.floor(Math.random() * sectorsToChooseFrom.length)];
  
  // Dirigeants possibles - styles de management variés
  const executives = [
    { name: "Émilie Durand", title: "Directrice de Projet Digital", style: "analytique et axée sur les données" },
    { name: "Philippe Martin", title: "DSI", style: "pragmatique et orienté résultats" },
    { name: "Céline Lefèvre", title: "Directrice de la Transformation", style: "visionnaire mais soucieuse du détail" },
    { name: "Julien Bernard", title: "Responsable de Programme", style: "exigeant mais ouvert aux propositions" },
    { name: "Caroline Petit", title: "Chief Digital Officer", style: "innovante et orientée expérience utilisateur" }
  ];
  
  // Sélection d'un dirigeant
  const executive = executives[Math.floor(Math.random() * executives.length)];
  
  // Variables pour le contexte personnalisé
  let executiveName = executive.name;
  let executiveTitle = executive.title;
  let executiveStyle = executive.style;
  let organizationName = companyInfo.name;
  let cityName = companyInfo.city;
  let orgSize = companyInfo.size;
  let projectDescription = companyInfo.project;
  let projectChallenge = companyInfo.challenge;
  let contextTitle = "";
  let customDescription = "";
  
  // Incorporer les informations du contexte d'audit si disponible
  if (auditContext) {
    console.log("Utilisation d'un contexte d'audition dans System Prompt:", auditContext.contextType);
    
    if (auditContext.contextType === 'predefined' && auditContext.contextData) {
      const context = auditContext.contextData;
      contextTitle = context.title || "";
      
      // Remplacer les informations de l'entreprise par celles du contexte prédéfini
      if (context.organization) {
        // Extraction du nom et de la taille si présents dans le format "Nom (taille)"
        const orgParts = context.organization.split('(');
        if (orgParts.length > 1) {
          organizationName = orgParts[0].trim();
          orgSize = orgParts[1].replace(')', '').trim();
        } else {
          organizationName = context.organization;
        }
      }
      
      if (context.projectContext) {
        projectDescription = context.projectContext;
      }
      
      if (context.challenge) {
        projectChallenge = context.challenge;
      }
      
      if (context.executive) {
        const executiveParts = context.executive.split(',');
        if (executiveParts.length > 1) {
          executiveName = executiveParts[0].trim();
          executiveTitle = executiveParts[1].trim();
        } else {
          executiveName = context.executive;
        }
      }
      
    } else if (auditContext.contextType === 'custom' && auditContext.contextData) {
      // Pour un contexte entièrement personnalisé
      customDescription = auditContext.contextData.description || "";
      
      if (auditContext.contextData.organization) {
        organizationName = auditContext.contextData.organization;
      }
      
      if (auditContext.contextData.executive) {
        executiveName = auditContext.contextData.executive;
      }
    }
  }
  
  // Intégrer la description personnalisée si elle existe
  const customContextText = customDescription 
    ? `\nCONTEXTE PERSONNALISÉ: ${customDescription}\n` 
    : '';
  
  // Extraire le secteur d'activité de l'organisation si disponible
  const sector = auditContext && auditContext.contextType === 'predefined' && auditContext.contextData.sector 
    ? auditContext.contextData.sector 
    : 'technologique';

  return `Tu es ${executiveName}, ${executiveTitle} chez ${organizationName} à ${cityName}, une entreprise de ${orgSize} du secteur ${sector}.

PERSONNALITÉ: Tu as un style de management ${executiveStyle}. Tu es responsable du projet de "${projectDescription}" qui rencontre actuellement des difficultés liées à "${projectChallenge}". Tu as une véritable personnalité avec des préoccupations concrètes.
${customContextText}
MISSION: Simuler une audition client RÉALISTE pour évaluer ${contextTitle ? `un ${contextTitle}` : `un consultant AMOA (profil: ${profileType}, niveau: ${experienceLevel})`}.

RÈGLES DE SIMULATION:
1. Commence par une présentation BRÈVE (2 phrases max) puis expose ton besoin projet (contexte et problèmes).
2. RÉAGIS intelligemment aux propos du consultant:
   - Si sa réponse montre une bonne compréhension: Continue l'entretien en approfondissant
   - Si sa réponse est générique/superficielle: Demande plus de concret ("Pourriez-vous me donner un exemple...")
   - Si sa réponse manque de méthode: Recentre ("Quelle méthodologie utiliseriez-vous pour...")
3. COMPORTEMENT: Sois un vrai directeur de projet qui cherche une vraie valeur ajoutée.
4. ÉVALUATION: Adapte tes attentes et la complexité de la mission au niveau ${experienceLevel}.

INTERDICTIONS FORMELLES:
- Ne JAMAIS proposer toi-même des solutions (c'est au consultant de le faire)
- Ne JAMAIS commencer par "Merci pour votre réponse" ou "Je comprends"
- Ne JAMAIS jouer le rôle du consultant, reste STRICTEMENT dans ton rôle de client
- Ne JAMAIS dépasser deux paragraphes dans tes messages

Commence par exposer brièvement la situation problématique et demande au consultant comment il pourrait t'aider.`;
}

/**
 * Génère le prompt pour une étape spécifique de l'audition cybersécurité
 */
function generateCyberStepPrompt(step: number, profileType: string, experienceLevel: string): string {
  // Niveau de complexité des questions basé sur l'expérience - échelle plus granulaire
  let baseComplexity = 'intermédiaire';
  switch (experienceLevel.toLowerCase()) {
    case 'junior':
      baseComplexity = 'fondamental';
      break;
    case 'confirmé':
    case 'confirme':
      baseComplexity = 'intermédiaire';
      break;
    case 'senior':
      baseComplexity = 'avancé';
      break;
    case 'expert':
      baseComplexity = 'expert';
      break;
  }
  
  // Progression de difficulté technique - échelle plus fine avec plus de niveaux
  const complexityLevels = {
    junior: [
      'fondamental-basique', 
      'fondamental-intermédiaire', 
      'fondamental-avancé', 
      'intermédiaire-basique', 
      'intermédiaire-défi'
    ],
    confirmé: [
      'intermédiaire-basique', 
      'intermédiaire-standard', 
      'intermédiaire-avancé', 
      'avancé-basique', 
      'avancé-technique'
    ],
    confirme: [
      'intermédiaire-basique', 
      'intermédiaire-standard', 
      'intermédiaire-avancé', 
      'avancé-basique', 
      'avancé-technique'
    ],
    senior: [
      'avancé-basique', 
      'avancé-technique', 
      'avancé-spécialisé', 
      'expert-basique', 
      'expert-technique'
    ],
    expert: [
      'expert-fondamental', 
      'expert-technique', 
      'expert-spécialisé', 
      'expert-challenge', 
      'expert-concours'
    ]
  };
  
  // Déterminer la complexité finale avec plus de granularité
  let complexity = baseComplexity;
  const expLevel = experienceLevel.toLowerCase();
  
  // Limiter l'étape à 5 maximum pour l'indexation dans le tableau
  const cappedStep = Math.min(step, 5);
  
  // Appliquer la progression de difficulté avec plus de précision selon l'expérience
  if (cappedStep > 0) {
    if (expLevel === 'junior') {
      complexity = complexityLevels.junior[cappedStep - 1];
    } else if (expLevel === 'confirmé' || expLevel === 'confirme') {
      complexity = complexityLevels.confirme[cappedStep - 1];
    } else if (expLevel === 'senior') {
      complexity = complexityLevels.senior[cappedStep - 1];
    } else if (expLevel === 'expert') {
      complexity = complexityLevels.expert[cappedStep - 1];
    }
  }
  
  // Phases d'entretien technique redessinées pour être plus rigoureuses et analytiques
  let phase = '';
  let phaseObjective = '';
  
  // Définir des phases d'entretien technique plus pointues et exigeantes
  const phases = [
    {
      title: "Phase d'évaluation technique fondamentale",
      objective: `Évaluer précisément les connaissances techniques du candidat avec une approche sans concession:
      - Exiger des définitions précises de termes techniques (pas d'approximations)
      - Vérifier la connaissance profonde des mécanismes de sécurité (et pas juste superficielle)
      - Mettre à l'épreuve la maîtrise des normes et standards pertinents pour le profil
      - Tester la capacité à identifier les vulnérabilités courantes avec précision`
    },
    {
      title: "Phase d'analyse critique et de raisonnement technique",
      objective: `Évaluer la rigueur technique et la capacité d'analyse méthodique:
      - Challenger la méthodologie technique pour identifier des failles ou incohérences
      - Exiger des justifications précises pour chaque choix technique mentionné
      - Confronter à des erreurs techniques courantes pour vérifier la capacité de détection
      - Tester la compréhension des mécanismes sous-jacents (et pas seulement leur existence)`
    },
    {
      title: "Phase de résolution technique sous contrainte",
      objective: `Évaluer l'adaptabilité et la capacité de résolution technique sous pression:
      - Imposer des contraintes techniques supplémentaires pour complexifier les scénarios
      - Solliciter une priorisation technique rigoureuse et obtenir sa justification détaillée
      - Mettre en contradiction certaines exigences pour tester la capacité d'arbitrage
      - Demander une chronologie d'actions techniques précises face à un scénario critique`
    },
    {
      title: "Phase d'analyse stratégique et d'innovation technique",
      objective: `Évaluer la capacité stratégique et la vision technique avancée:
      - Exiger la comparaison critique de différentes approches techniques (avantages/inconvénients)
      - Tester la connaissance des tendances émergentes et leur application concrète
      - Évaluer la capacité à expliquer des concepts complexes à différents niveaux techniques
      - Solliciter des propositions innovantes et évaluer leur faisabilité technique`
    },
    {
      title: "Phase d'évaluation technique spécialisée",
      objective: `Évaluer l'expertise technique de pointe dans les domaines spécifiques:
      - Exiger une expertise pointue dans les technologies les plus récentes
      - Tester les connaissances sur des cas d'usage très spécifiques
      - Challenger sur des problématiques techniques de niche liées au secteur
      - Évaluer la capacité à résoudre des problèmes techniques rares ou exceptionnels`
    }
  ];
  
  // Déterminer la phase d'entretien avec davantage de granularité
  if (step <= phases.length) {
    // Pour les premières étapes, suivre la progression définie
    phase = phases[Math.min(step - 1, phases.length - 1)].title;
    phaseObjective = phases[Math.min(step - 1, phases.length - 1)].objective;
  } else {
    // Pour les étapes supplémentaires, alterner entre les phases avancées avec plus de variabilité
    const phaseVariations = [
      "Phase d'évaluation technique approfondie",
      "Phase d'analyse critique spécialisée",
      "Phase de mise en situation complexe",
      "Phase d'évaluation technique avancée",
      "Phase d'analyse stratégique technique"
    ];
    
    // Sélection pseudo-aléatoire basée sur l'étape pour assurer une variété mais de façon déterministe
    const variationIndex = (step % phaseVariations.length);
    phase = `${phaseVariations[variationIndex]} (niveau ${complexity})`;
    
    // Alternance plus sophistiquée entre les objectifs des phases avancées
    const objectiveIndex = ((step * 2) % phases.length);
    phaseObjective = phases[objectiveIndex].objective;
  }
  
  // Thèmes techniques spécifiques adaptés au profil
  
  // Thèmes communs à tous les profils de cybersécurité
  const commonThemes = [
    "Concepts de base en cybersécurité",
    "Gestion des vulnérabilités",
    "Sécurisation des réseaux",
    "Gestion des incidents",
    "Normes et frameworks de sécurité"
  ];
  
  // Thèmes spécifiques par profil
  const specificThemes: Record<string, string[]> = {
    "pentest": [
      "Méthodologies de tests d'intrusion",
      "Exploitation de vulnérabilités web",
      "Techniques d'élévation de privilèges",
      "Outils de pentest (Metasploit, Burp Suite, etc.)",
      "Post-exploitation et pivoting",
      "Fuzzing et découverte de bugs"
    ],
    "soc": [
      "Détection et réponse aux incidents",
      "Analyse de logs et SIEM",
      "Threat hunting",
      "Forensics et investigation",
      "Indicateurs de compromission (IOC)",
      "Blue Team et défense active"
    ],
    "gouvernance": [
      "Gestion des risques cyber",
      "Conformité réglementaire (RGPD, NIS2, etc.)",
      "Politiques de sécurité",
      "Audits et certifications",
      "Business continuity et disaster recovery",
      "Sensibilisation et formation"
    ],
    "cloud": [
      "Sécurité dans les environnements cloud (AWS, Azure, GCP)",
      "Containerisation et sécurité Docker/Kubernetes",
      "Identity and Access Management (IAM)",
      "DevSecOps et CI/CD sécurisé",
      "Sécurité Zero Trust",
      "Data protection en environnement cloud"
    ],
    "application": [
      "Secure coding et SSDLC",
      "OWASP Top 10 et vulnérabilités applicatives",
      "Sécurité API",
      "Analyse statique et dynamique de code",
      "Authentification et autorisation",
      "Cryptographie appliquée"
    ],
    "systèmes": [
      "Durcissement des systèmes",
      "Gestion des correctifs",
      "Sécurité des OS (Windows, Linux)",
      "Sécurité des endpoints",
      "Détection d'intrusion (HIDS/NIDS)",
      "Virtualisation et sécurité des hyperviseurs"
    ]
  };
  
  // Extraire le type de profil de base (en minuscules et sans accents)
  const normalizedProfile = profileType.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Identifier le profil le plus pertinent parmi ceux disponibles
  let matchedProfile = "généraliste"; // Par défaut
  
  Object.keys(specificThemes).forEach(key => {
    if (normalizedProfile.includes(key)) {
      matchedProfile = key;
    }
  });
  
  // Sélectionner les thèmes appropriés
  let selectedThemes: string[] = [];
  
  if (matchedProfile !== "généraliste" && specificThemes[matchedProfile]) {
    // Pour un profil spécifique identifié
    selectedThemes = specificThemes[matchedProfile].slice(0, 3);
  } else {
    // Pour un profil généraliste ou non identifié
    // Sélectionner quelques thèmes aléatoires parmi les différentes catégories
    const allSpecificThemes = Object.values(specificThemes).flat();
    
    // Mélanger et prendre 3 thèmes spécifiques aléatoires
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * allSpecificThemes.length);
      const theme = allSpecificThemes.splice(randomIndex, 1)[0];
      selectedThemes.push(theme);
    }
  }
  
  // Ajouter 1-2 thèmes communs en fonction de la complexité
  if (complexity.includes('fondamental')) {
    selectedThemes.unshift(commonThemes[0], commonThemes[1]);
  } else if (complexity.includes('intermédiaire')) {
    selectedThemes.unshift(commonThemes[2], commonThemes[4]);
  } else {
    selectedThemes.push(commonThemes[3]);
  }
  
  const technicalThemes = selectedThemes.join(", ");
  
  return `CONTEXTE: Tu es un RECRUTEUR TECHNIQUE spécialisé en cybersécurité qui conduit un ENTRETIEN D'EMBAUCHE - ÉTAPE ${step}.

RÔLE: Expert technique qui évalue rigoureusement un candidat pour un poste de ${profileType} (niveau: ${experienceLevel}).
Tu n'es PAS là pour aider ou former le candidat, mais pour évaluer objectivement ses compétences techniques et sa cohérence.

PHASE ACTUELLE: ${phase}
NIVEAU DE COMPLEXITÉ TECHNIQUE: ${complexity}
THÈMES TECHNIQUES À ABORDER: ${technicalThemes}

MISSION: Évaluer avec rigueur les compétences techniques du candidat, détecter les incohérences ou imprécisions, et adapter la difficulté de tes questions en fonction de ses réponses.

PARAMÈTRES:
- Profil du consultant: ${profileType}
- Niveau d'expérience attendu: ${experienceLevel}
- Complexité technique: ${complexity}
- Phase actuelle: ${phase}

OBJECTIFS D'ÉVALUATION:
${phaseObjective}

RÈGLES STRICTES (INTERDICTIONS FORMELLES):
- ⚠️ INTERDIT: Ne dis JAMAIS "Merci pour votre réponse" (tu n'es pas là pour être poli)
- ⚠️ INTERDIT: Ne commence JAMAIS par "Je vais reformuler" (c'est le rôle du consultant)
- ⚠️ INTERDIT: N'utilise JAMAIS "Si je comprends bien" (tu évalues, tu ne reformules pas)
- ⚠️ INTERDIT: Ne propose JAMAIS de solution technique (c'est le rôle du consultant)
- ⚠️ INTERDIT: Ne donne JAMAIS des conseils techniques au consultant (tu es le client)
- ⚠️ INTERDIT: Ne sois JAMAIS didactique ou pédagogique (tu n'es pas un formateur)

COMPORTEMENT À ADOPTER:
- ✅ Réagis avec les attentes d'un client RÉEL, légèrement inquiet face à un problème de sécurité
- ✅ Pose une question PRÉCISE, TECHNIQUE et PERTINENTE pour le profil ${profileType}
- ✅ Donne un feedback DIRECT sur la réponse précédente (clair, insuffisant, rassurant, etc.)
- ✅ Challenge la pertinence des solutions proposées avec des cas concrets de ton entreprise
- ✅ Reste dans le contexte de ton problème de sécurité initial 
- ✅ Deviens plus exigeant et technique à mesure que l'audition avance

FORMAT DE TON MESSAGE:
1. Réaction courte à la réponse du consultant (max 1-2 phrases)
2. Question principale pour cette étape (vulnérabilité, risque, conformité selon le profil)
3. Si nécessaire, contexte supplémentaire très court sur des aspects techniques ou organisationnels

Garde un ton direct et préoccupé (150 mots max). Ne joue pas le rôle du consultant - tu es UNIQUEMENT le CLIENT.`;
}

/**
 * Génère le prompt pour une étape spécifique de l'audition AMOA
 */
function generateAmoaStepPrompt(step: number, profileType: string, experienceLevel: string, auditContext?: AuditContextData): string {
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
  // Version avec support illimité d'étapes
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
  
  // Pour les étapes > 3, on maintient le niveau de difficulté maximal
  if (step > 3) {
    if (expLevel === 'junior') {
      complexity = 'intermédiaire';
    } else if (expLevel === 'confirmé' || expLevel === 'confirme') {
      complexity = 'avancée';
    } else if (expLevel === 'senior') {
      complexity = 'avancée';
    } else if (expLevel === 'expert') {
      complexity = 'très avancée';
    }
  } 
  // Pour les 3 premières étapes, on utilise la progression définie
  else if (step > 0) {
    if (expLevel === 'junior') {
      complexity = complexityByStep.junior[step - 1];
    } else if (expLevel === 'confirmé' || expLevel === 'confirme') {
      complexity = complexityByStep.confirme[step - 1];
    } else if (expLevel === 'senior') {
      complexity = complexityByStep.senior[step - 1];
    } else if (expLevel === 'expert') {
      complexity = complexityByStep.expert[step - 1];
    }
  }
  
  // Intégration du contexte d'audition si disponible
  let customChallenge = "";
  if (auditContext) {
    if (auditContext.contextType === 'predefined' && auditContext.contextData) {
      if (auditContext.contextData.challenge) {
        customChallenge = auditContext.contextData.challenge;
      }
    } else if (auditContext.contextType === 'custom' && auditContext.contextData) {
      if (auditContext.contextData.description) {
        customChallenge = auditContext.contextData.description;
      }
    }
  }
  
  // Scénarios de difficulté spécifiques au secteur AMOA
  const sectorScenarios = {
    // Des problèmes communs dans chaque secteur, adaptés à l'étape
    "Banque/Finance": [
      "résistance des utilisateurs métier à changer leurs habitudes",
      "pressions réglementaires nécessitant des adaptations rapides",
      "difficultés d'intégration avec les systèmes de back-office existants",
      "complexité de gestion d'identités et d'habilitations sensibles"
    ],
    "Énergie": [
      "sites distants avec connectivité limitée",
      "contraintes de sécurité industrielle (OT/IT) spécifiques",
      "besoin de continuité absolue pendant la transformation",
      "concurrence des projets de transition écologique et numérique"
    ],
    "Santé": [
      "confidentialité stricte des données patients (RGPD médical)",
      "personnel soignant peu disponible pour les phases projet",
      "interopérabilité complexe entre systèmes médicaux",
      "besoin de validation des workflows cliniques"
    ],
    "Distribution/Retail": [
      "expérience client omnicanal cohérente",
      "pression sur les coûts et délais de mise en œuvre",
      "pics d'activité saisonniers bloquant les déploiements",
      "synchronisation massive de catalogues produits"
    ],
    "Transport/Logistique": [
      "contraintes opérationnelles 24/7 limitant les fenêtres d'intervention",
      "multiplicité des partenaires à intégrer dans la chaîne",
      "volumétrie élevée de transactions à traiter en temps réel",
      "optimisation complexe d'itinéraires et ressources"
    ],
    "Industrie": [
      "systèmes industriels anciens difficiles à moderniser",
      "protocoles propriétaires sans documentation",
      "contraintes de sécurité des personnes et des installations",
      "besoin de traçabilité complète pour certifications"
    ],
    "Télécom/Média": [
      "architecture technique extrêmement complexe et distribuée",
      "contraintes de performance avec millions d'utilisateurs simultanés",
      "obsolescence rapide des technologies",
      "gestion de volumétries massives de contenus"
    ],
    "Public/Parapublic": [
      "contraintes strictes des marchés publics",
      "multiplicité des parties prenantes à tous les niveaux",
      "besoin d'accessibilité pour tous types d'usagers",
      "contraintes budgétaires rigides et planification pluriannuelle"
    ]
  };

  // Sélection d'un scénario basé sur le contexte d'audit et l'étape
  let sectorKey = "Public/Parapublic"; // Secteur par défaut
  
  if (auditContext && auditContext.contextType === 'predefined') {
    // Détermine le secteur d'activité en fonction du titre du contexte prédéfini
    if (auditContext.contextData.title.includes("Retail")) sectorKey = "Commerce/Distribution";
    else if (auditContext.contextData.title.includes("Banking")) sectorKey = "Banque/Finance";
    else if (auditContext.contextData.title.includes("Health")) sectorKey = "Santé/Pharma";
    else if (auditContext.contextData.title.includes("Energy")) sectorKey = "Énergie/Utilities";
  } else if (auditContext && auditContext.contextType === 'custom' && auditContext.contextData.sector) {
    // Si un secteur est spécifié dans le contexte personnalisé
    sectorKey = auditContext.contextData.sector;
  }
  
  let selectedScenarios = sectorScenarios[sectorKey as keyof typeof sectorScenarios] || 
                        sectorScenarios["Public/Parapublic"];
  let scenario = selectedScenarios[step % selectedScenarios.length];
  
  // Phase temporelle basée sur l'étape (nouvelle version sans limite d'étapes)
  let phase = '';
  let phaseObjective = '';
  
  // Définir les phases de base
  const phases = [
    {
      title: "Phase de compréhension du besoin (début)",
      objective: `Cette phase vise à évaluer la capacité du consultant à :
      - Reformuler clairement le besoin avec ses propres mots
      - Identifier les enjeux majeurs du projet
      - Poser des questions pertinentes pour clarifier les points flous
      - Faire le lien avec ses expériences passées dans des contextes similaires`
    },
    {
      title: "Phase de mise en situation (milieu)",
      objective: `Cette phase vise à évaluer la capacité du consultant à :
      - Proposer une approche méthodologique adaptée
      - Gérer efficacement des parties prenantes aux intérêts divergents
      - Résoudre des problèmes complexes typiques du contexte d'audit
      - Démontrer son expertise technique dans le domaine`
    },
    {
      title: "Phase de recommandation (fin de simulation)",
      objective: `Cette phase vise à évaluer la capacité du consultant à :
      - Synthétiser la situation et les enjeux
      - Formuler des recommandations claires et actionnables
      - Anticiper les risques et proposer des mesures de mitigation
      - Démontrer sa valeur ajoutée pour cette mission spécifique`
    }
  ];
  
  if (step <= 3) {
    // Pour les 3 premières étapes, utiliser les phases prédéfinies
    phase = phases[step - 1].title;
    phaseObjective = phases[step - 1].objective;
  } else {
    // Pour les étapes > 3, alterner entre les phases 2 et 3
    // On ne revient pas à la phase 1 car la compréhension du besoin est supposée acquise
    const phaseIndex = (step % 2) === 0 ? 1 : 2; // Alterne entre phase 2 et 3
    phase = `Phase d'approfondissement ${step - 3}`;
    phaseObjective = phases[phaseIndex].objective;
  }
  
  // Questions/problématiques avancées par niveau et étape
  const challengeMatrix = {
    junior: [
      "comment structureriez-vous votre première phase d'analyse dans ce contexte ?",
      "quelle méthode de cadrage utiliseriez-vous face à ces contraintes ?",
      "comment géreriez-vous la communication avec les différentes parties prenantes ?"
    ],
    confirme: [
      "quelle approche proposeriez-vous pour résoudre cette problématique spécifique ?",
      "comment arbitreriez-vous entre les différentes priorités contradictoires ?",
      "quels indicateurs de succès mettriez-vous en place pour ce type de projet ?"
    ],
    senior: [
      "quelle stratégie adopteriez-vous face à cette situation de blocage organisationnel ?",
      "comment intégreriez-vous les contraintes métier et techniques dans votre solution ?",
      "quelle gouvernance recommanderiez-vous pour un projet de cette envergure ?"
    ],
    expert: [
      "face à cette transformation complexe, quelle vision proposeriez-vous ?",
      "comment aligneriez-vous ce projet avec la stratégie globale de l'entreprise ?",
      "quelle approche innovante apporteriez-vous pour résoudre cette problématique ?"
    ]
  };
  
  // Sélection d'un challenge adapté
  let challenges;
  if (expLevel === 'junior') {
    challenges = challengeMatrix.junior;
  } else if (expLevel === 'confirmé' || expLevel === 'confirme') {
    challenges = challengeMatrix.confirme;
  } else if (expLevel === 'senior') {
    challenges = challengeMatrix.senior;
  } else {
    challenges = challengeMatrix.expert;
  }
  
  // Base de challenge pour avoir une question pertinente
  const challenge = challenges[step % challenges.length];
  
  // Personnalisation basée sur le contexte d'audition
  let profileTitle = `consultant AMOA`;
  let customContext = "";
  let organizationName = "";
  let projectDescription = "";
  
  if (auditContext) {
    if (auditContext.contextType === 'predefined' && auditContext.contextData) {
      if (auditContext.contextData.title) {
        profileTitle = auditContext.contextData.title;
      }
      
      if (auditContext.contextData.organization) {
        organizationName = auditContext.contextData.organization;
      }
      
      if (auditContext.contextData.projectContext) {
        projectDescription = auditContext.contextData.projectContext;
        // Remplacer le scénario par le contexte du projet si disponible
        scenario = projectDescription;
      }
    } else if (auditContext.contextType === 'custom' && auditContext.contextData) {
      if (auditContext.contextData.description) {
        customContext = auditContext.contextData.description;
      }
    }
  }
  
  // Section contexte personnalisé, à afficher seulement si présent
  const customContextSection = customContext 
    ? `\nCONTEXTE PERSONNALISÉ: ${customContext}\n` 
    : '';
  
  // Section organisation spécifique, à afficher seulement si présente
  const organizationSection = organizationName 
    ? `\nORGANISATION: ${organizationName}\n` 
    : '';
  
  return `Tu es un CLIENT EXPERT dans ton domaine. Tu évalues un ${profileTitle} lors d'une audition - ÉTAPE ${step}.

CONSIGNE PRINCIPALE: Tu dois avoir une vraie intelligence dans tes réponses, réagir de façon spécifique à ce que dit le consultant, et rebondir naturellement dans la conversation en restant dans le contexte.
${organizationSection}
${customContextSection}
CONTEXTE ACTUEL:
- Niveau d'expérience attendu du consultant: ${experienceLevel}
- Complexité: ${complexity}
- Problématique spécifique en cours: ${scenario}
- Phase de l'entretien: ${phase}

OBJECTIFS D'ÉVALUATION:
${phaseObjective}

RÉACTION INTELLIGENTE - Analyse critique de la réponse précédente:
- Si la réponse est TROP GÉNÉRIQUE: Demande des exemples concrets ("Pouvez-vous me donner un exemple précis de...")
- Si la réponse est INCOMPLÈTE: Demande un approfondissement sur l'aspect manquant
- Si la réponse est PERTINENTE: Creuse davantage ou pose un nouveau défi
- Si la réponse est HORS-SUJET: Recentre poliment ("Je comprends, mais ce qui m'intéresse plus spécifiquement...")

FORMAT DE TA RÉPONSE:
1. Réaction brève et spécifique à la réponse du consultant (1-2 phrases)
2. Question principale ou mise en situation concrète liée au contexte de l'audit et à la problématique: ${scenario}
3. Maximum 2 paragraphes au total, ton direct

RÈGLES STRICTES - NE JAMAIS:
- Commencer par "Merci pour votre réponse" ou "Je comprends"
- Proposer des solutions (c'est le rôle du consultant)
- Utiliser un ton académique ou théorique (reste un client réel)
- Dépasser 2 paragraphes ou 150 mots
- Jouer le rôle du consultant ou oublier que TU ES LE CLIENT

Pour cette étape, pose une question sur: ${challenge}`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une audition client cybersécurité
 */
function generateCyberEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string): string {
  return `Tu es un évaluateur technique senior extrêmement rigoureux spécialisé en cybersécurité, avec 15+ années d'expérience dans l'évaluation critique de candidats techniques. Ta mission est d'analyser sans complaisance l'entretien technique qui vient de se terminer.

PROFIL ÉVALUÉ:
- Nom du candidat: ${candidateName}
- Poste visé: ${profileType}
- Niveau d'expérience DÉCLARÉ: ${experienceLevel} (à confirmer ou infirmer en fonction des compétences réellement démontrées)

DIRECTIVE CRITIQUE: Ton évaluation doit être implacablement rigoureuse, factuelle et critique, sans aucune complaisance. Tu dois identifier précisément les écarts entre les compétences revendiquées et celles réellement démontrées.

STRUCTURE D'ANALYSE REQUISE:

## 1. Évaluation technique objective
[Analyse factuelle et critique des compétences techniques réellement démontrées versus celles attendues pour le poste et niveau visés. Évalue précisément si le candidat maîtrise les concepts fondamentaux de son domaine ou s'il utilise principalement du jargon sans substance technique réelle. Cite des exemples spécifiques de questions techniques où le candidat a démontré ou non sa maîtrise.]

## 2. Rigueur méthodologique et exactitude technique
[Analyse critique de la précision technique des réponses, identification des approximations, confusions conceptuelles ou erreurs techniques. Évalue la capacité à distinguer faits techniques de suppositions, à reconnaître ses limites, et à structurer une réponse technique cohérente. Fournis des exemples précis d'imprécisions ou contradictions.]

## 3. Capacité d'analyse et résolution de problèmes techniques complexes
[Évaluation rigoureuse de la méthodologie d'analyse, de la capacité à décomposer des problèmes complexes, à identifier les problématiques critiques, et à proposer des solutions techniques pertinentes et implémentables. Relève les réponses superficielles ou insuffisamment détaillées.]

## 4. Forces techniques avérées (basées sur des faits observables)
- [Force technique 1 - Capacité spécifique démontrée avec exemple précis et quantifiable]
- [Force technique 2 - Capacité spécifique démontrée avec exemple précis et quantifiable]
- [Force technique 3 - Capacité spécifique démontrée avec exemple précis et quantifiable]

## 5. Faiblesses techniques identifiées (lacunes avérées)
- [Faiblesse 1 - Lacune technique spécifique avec exemple précis de réponse insuffisante]
- [Faiblesse 2 - Lacune technique spécifique avec exemple précis de réponse insuffisante]
- [Faiblesse 3 - Lacune technique spécifique avec exemple précis de réponse insuffisante]
- [Faiblesse 4 - Lacune technique spécifique avec exemple précis de réponse insuffisante]

## 6. Écart entre niveau déclaré et niveau démontré
[Analyse critique et factuelle de l'écart entre le niveau ${experienceLevel} revendiqué et les compétences réellement démontrées. Évalue si le candidat a surestimé ou sous-estimé son niveau technique réel. Cite les questions auxquelles un candidat de niveau ${experienceLevel} aurait dû pouvoir répondre mais où celui-ci a présenté des lacunes.]

## 7. Cohérence technique du discours
[Analyse des contradictions, incohérences ou évolutions dans le discours technique du candidat au cours de l'entretien. Identifie les moments où le candidat a tenté d'éviter une question technique ou a utilisé des termes techniques sans démontrer leur compréhension réelle.]

## 8. Adéquation technique au poste
[Évaluation objective et factuelle de l'adéquation entre les compétences démontrées et les exigences techniques du poste de ${profileType}. Analyse si les compétences du candidat correspondent réellement aux standards de l'industrie pour ce profil. Identifie les domaines techniques essentiels où le candidat présente des lacunes significatives.]

## 9. Évaluation technique finale
[Conclusion technique critique avec:
- Note technique sur 5 justifiée par des faits concrets
- Niveau technique réel évalué (Junior/Intermédiaire/Confirmé/Senior/Expert) avec justification factuelle
- Recommandation finale (Fortement recommandé / Recommandé / Recommandé avec réserves / Non recommandé) avec justification technique précise]

EXIGENCES MÉTHODOLOGIQUES:
- Maintiens une approche factuelle et rigoureusement technique, sans aucune complaisance
- Identifie systématiquement les écarts entre théorie et compétences pratiques
- N'accorde de crédit qu'aux connaissances techniques clairement démontrées par des réponses précises
- Ne surestime jamais le niveau technique – en cas de doute, sois critique et exigeant
- Relève systématiquement l'usage de jargon sans démonstration de compréhension réelle
- Reste impitoyablement objectif : ton seul critère d'évaluation doit être la compétence technique avérée`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une audition client AMOA
 */
function generateAmoaEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string, auditContext?: AuditContextData): string {
  // Variables pour le contexte personnalisé
  let contextTitle = "";
  let contextDescription = "";
  let organization = "";
  let projectContext = "";
  
  // Incorporer les informations du contexte d'audit si disponible
  if (auditContext) {
    if (auditContext.contextType === 'predefined' && auditContext.contextData) {
      const context = auditContext.contextData;
      contextTitle = context.title || "";
      organization = context.organization || "";
      projectContext = context.projectContext || "";
    } else if (auditContext.contextType === 'custom' && auditContext.contextData) {
      contextDescription = auditContext.contextData.description || "";
    }
  }
  
  return `Tu es un expert en évaluation des performances de consultants AMOA (Assistance à Maîtrise d'Ouvrage) chez mc2i lors d'auditions client.

Tu dois évaluer une audition client professionnelle qui vient de se terminer:
- Nom du consultant: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}
- Contexte d'audit: ${contextTitle || (auditContext && auditContext.contextType === 'predefined' ? auditContext.contextData.title : 'personnalisé')}
${organization ? `- Organisation cliente: ${organization}` : ''}
${projectContext ? `- Projet: ${projectContext}` : ''}
${contextDescription ? `- Description du contexte: ${contextDescription}` : ''}

IMPORTANT - TON ÉVALUATION DOIT ÊTRE STRUCTURÉE EXACTEMENT AVEC LES SECTIONS SUIVANTES:

## 1. Présentation et attitude professionnelle
[Analyser comment le consultant s'est présenté, sa posture, son professionnalisme et sa capacité à établir une relation de confiance. Donner des exemples concrets tirés de ses réponses.]

## 2. Compréhension et reformulation du contexte
[Évaluer si le consultant a bien compris et reformulé le besoin client présenté de façon personnalisée, ou s'il s'est contenté de répéter textuellement les informations données. Donner des exemples concrets.]

## 3. Expertise méthodologique et connaissance sectorielle
[Évaluer la pertinence des approches méthodologiques proposées pour le besoin exprimé et la connaissance du contexte d'audit. Analyser si les méthodes sont adaptées au contexte client spécifique.]

## 4. Forces identifiées
- [Point fort 1 - Spécifique et illustré par un exemple]
- [Point fort 2 - Spécifique et illustré par un exemple]
- [Point fort 3 - Spécifique et illustré par un exemple]

## 5. Axes d'amélioration
- [Axe d'amélioration 1 - Concret avec suggestion]
- [Axe d'amélioration 2 - Concret avec suggestion]
- [Axe d'amélioration 3 - Concret avec suggestion]

## 6. Adéquation au niveau déclaré
[Évaluer de façon détaillée si le niveau réel démontré correspond au niveau ${experienceLevel}. Justifier pourquoi il correspond ou non en comparant avec les standards attendus pour ce niveau d'expérience en AMOA dans le contexte d'audit présenté.]

## 7. Évaluation globale
[Donner une note sur 5 et une évaluation synthétique de la prestation avec une recommandation finale (À recruter / À considérer / À renforcer).]

CONSIGNES ESSENTIELLES:
- Utilise exclusivement les titres de section avec ce format exact (incluant la numérotation et les ##)
- Ta réponse sera affichée directement dans l'interface de l'application, pas envoyée par email
- Ton analyse doit être factuelle et basée uniquement sur le contenu des échanges
- Ne reprends pas de longs extraits des réponses du consultant
- Concentre-toi sur l'analyse des compétences démontrées et non sur le contenu des questions
- Évalue particulièrement l'adéquation entre les compétences démontrées et les exigences spécifiques du contexte d'audit
- Sois précis et constructif, même en cas de performance limitée`;
}