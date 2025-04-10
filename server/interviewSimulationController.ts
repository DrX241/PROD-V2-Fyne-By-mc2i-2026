import { Request, Response } from 'express';
// import nodemailer from 'nodemailer'; // Décommenté quand nécessaire pour l'envoi réel d'emails
import { ChatCompletionRequestMessage } from '@shared/schema';
import { openAIService } from "../I_AM_CYBER/services/openai";

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
      step,
      profileType,
      experienceLevel,
      sectorFocus,
      previousMessages = []
    } = req.body;

    const domain = req.path.includes('/cyber/') ? 'cyber' : 'amoa';

    if (!message || step === undefined || !profileType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets.'
      });
    }

    // Générer le prompt de l'assistant en fonction de l'étape et du domaine
    let systemPrompt = '';
    
    if (domain === 'cyber') {
      systemPrompt = generateCyberStepPrompt(step, profileType, experienceLevel);
    } else {
      systemPrompt = generateAmoaStepPrompt(step, profileType, experienceLevel, sectorFocus || '');
    }

    // Convertir les messages précédents au format attendu par l'API OpenAI
    const formattedPreviousMessages = previousMessages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    // Ajouter le message système actuel et le message utilisateur
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...formattedPreviousMessages,
      { role: 'user', content: message }
    ];

    // Obtenir la réponse de l'IA
    const aiResponse = await openAIService.getChatCompletion(
      messages, 
      0.7,  // temperature
      600   // max_tokens
    );

    // Déterminer si on passe à l'étape suivante
    // Dans une implémentation plus sophistiquée, on pourrait analyser la réponse
    // pour déterminer si elle est satisfaisante
    const nextStep = Math.random() > 0.5 && step < 3;

    return res.json({
      success: true,
      response: aiResponse,
      nextStep
    });

  } catch (error) {
    console.error('Erreur lors du traitement du message de simulation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du message.'
    });
  }
}

/**
 * Finalise une simulation d'entretien et envoie les résultats par email
 */
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

    // Obtenir l'évaluation générée par l'IA
    const evaluation = await openAIService.getChatCompletion(
      promptMessages, 
      0.7,   // temperature
      1000   // max_tokens
    );

    // Envoyer l'email d'évaluation (simulation)
    // Note: Dans un environnement de production, configurer un service SMTP réel
    console.log(`
---------- SIMULATION D'ENVOI D'EMAIL ----------
À: ${recruiterEmail}
Sujet: Évaluation de simulation d'entretien - ${candidateName}
Corps:
Bonjour,

Veuillez trouver ci-dessous l'évaluation de la simulation d'entretien pour ${candidateName} dans le domaine ${domain === 'cyber' ? 'de la cybersécurité' : 'AMOA'}.

${evaluation}

Durée de la simulation: ${Math.floor(duration / 60)} min ${duration % 60} sec
Profil évalué: ${profileType} - ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
${domain === 'amoa' && sectorFocus ? `Secteur: ${sectorFocus}` : ''}

Cordialement,
L'équipe I AM CYBER / I AM AMOA
----------------------------------------------
    `);

    // En environnement de production, utiliser nodemailer pour envoyer l'email
    /*
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'username',
        pass: 'password'
      }
    });

    await transporter.sendMail({
      from: '"I AM CYBER/AMOA" <noreply@example.com>',
      to: recruiterEmail,
      subject: `Évaluation de simulation d'entretien - ${candidateName}`,
      html: `
        <h2>Évaluation de simulation d'entretien</h2>
        <p><strong>Candidat:</strong> ${candidateName}</p>
        <p><strong>Domaine:</strong> ${domain === 'cyber' ? 'Cybersécurité' : 'AMOA'}</p>
        <p><strong>Profil:</strong> ${profileType} - ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</p>
        ${domain === 'amoa' && sectorFocus ? `<p><strong>Secteur:</strong> ${sectorFocus}</p>` : ''}
        <p><strong>Durée:</strong> ${Math.floor(duration / 60)} min ${duration % 60} sec</p>
        
        <hr />
        
        <div>
          ${evaluation.replace(/\n/g, '<br>')}
        </div>
      `
    });
    */

    return res.json({
      success: true,
      message: 'Évaluation générée et email envoyé avec succès.'
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
  // Adapter la difficulté en fonction de l'étape
  const complexity = step === 1 ? 'basique' : step === 2 ? 'intermédiaire' : 'avancée';
  
  let promptByStep = '';
  
  switch (step) {
    case 1:
      promptByStep = 'Cette première étape vise à évaluer les connaissances fondamentales en cybersécurité. Pose des questions qui permettent d\'évaluer la compréhension des concepts de base.';
      break;
    case 2:
      promptByStep = 'Cette deuxième étape vise à évaluer les compétences techniques et la capacité à résoudre des problèmes. Pose des questions plus spécifiques sur les méthodologies et les outils.';
      break;
    case 3:
      promptByStep = 'Cette dernière étape vise à évaluer la capacité d\'analyse et de prise de décision. Présente une situation complexe qui nécessite une réflexion stratégique.';
      break;
    default:
      promptByStep = 'Pose des questions adaptées au niveau du candidat pour évaluer ses compétences en cybersécurité.';
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
4. Pose une nouvelle question ou présente un nouveau problème qui augmente légèrement en complexité.
5. Reste dans ton rôle de collaborateur de l'entreprise cliente, ne mentionne pas qu'il s'agit d'une simulation.
6. Limite ta réponse à environ 200-250 mots.`;
}

/**
 * Génère le prompt pour une étape spécifique de la simulation AMOA
 */
function generateAmoaStepPrompt(step: number, profileType: string, experienceLevel: string, sectorFocus: string): string {
  // Adapter la difficulté en fonction de l'étape
  const complexity = step === 1 ? 'basique' : step === 2 ? 'intermédiaire' : 'avancée';
  
  let promptByStep = '';
  
  switch (step) {
    case 1:
      promptByStep = 'Cette première étape vise à évaluer les connaissances méthodologiques et la compréhension des enjeux projet. Pose des questions qui permettent d\'évaluer la compréhension du rôle AMOA.';
      break;
    case 2:
      promptByStep = 'Cette deuxième étape vise à évaluer les compétences en gestion des parties prenantes et en résolution de problèmes. Pose des questions sur la gestion des conflits ou des situations bloquantes.';
      break;
    case 3:
      promptByStep = 'Cette dernière étape vise à évaluer la capacité d\'analyse et de conseil. Présente une situation complexe qui nécessite des recommandations stratégiques.';
      break;
    default:
      promptByStep = 'Pose des questions adaptées au niveau du candidat pour évaluer ses compétences en AMOA.';
  }
  
  return `Tu es un interlocuteur client dans une simulation d'entretien pour un profil AMOA.

Profil du candidat:
- Type de profil: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

Tu es maintenant à l'étape ${step}/3 de la simulation, avec une difficulté ${complexity}.

${promptByStep}

INSTRUCTIONS:
1. Analyse soigneusement la réponse précédente du candidat.
2. Réagis de manière réaliste à cette réponse, en apportant des précisions ou des corrections si nécessaire.
3. Continue le scénario en ajoutant de nouveaux éléments ou défis qui permettent d'évaluer les compétences du candidat.
4. Pose une nouvelle question ou présente un nouveau problème qui augmente légèrement en complexité.
5. Reste dans ton rôle de collaborateur de l'entreprise cliente, ne mentionne pas qu'il s'agit d'une simulation.
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
- Niveau d'expérience: ${experienceLevel}

INSTRUCTIONS:
1. Analyse soigneusement toutes les réponses du candidat pendant la simulation.
2. Évalue les compétences techniques en cybersécurité (connaissances, méthodologies, outils).
3. Évalue les compétences comportementales (analyse, résolution de problèmes, communication).
4. Identifie les points forts et les axes d'amélioration.
5. Fournis une évaluation globale avec une note sur 5.

FORMAT DE RÉPONSE:
Structuré ta réponse avec les sections suivantes:
1. Synthèse globale (2-3 phrases résumant le niveau général du candidat)
2. Compétences techniques (forces et faiblesses)
3. Compétences comportementales (forces et faiblesses)
4. Points forts (liste avec puces)
5. Axes d'amélioration (liste avec puces)
6. Évaluation globale (note /5 avec justification)
7. Recommandation (adapté ou non au poste, potentiel)

Ton évaluation doit être professionnelle, objective et constructive.`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une simulation AMOA
 */
function generateAmoaEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un expert en recrutement spécialisé dans l'évaluation de profils AMOA (Assistance à Maîtrise d'Ouvrage).

Tu dois évaluer les réponses d'un candidat lors d'une simulation d'entretien:
- Nom du candidat: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

INSTRUCTIONS:
1. Analyse soigneusement toutes les réponses du candidat pendant la simulation.
2. Évalue les compétences méthodologiques (gestion de projet, expression de besoins, tests, etc.).
3. Évalue les compétences comportementales (communication, négociation, gestion des parties prenantes).
4. Évalue l'adéquation avec le secteur d'activité (${sectorFocus}).
5. Identifie les points forts et les axes d'amélioration.
6. Fournis une évaluation globale avec une note sur 5.

FORMAT DE RÉPONSE:
Structuré ta réponse avec les sections suivantes:
1. Synthèse globale (2-3 phrases résumant le niveau général du candidat)
2. Compétences méthodologiques (forces et faiblesses)
3. Compétences comportementales (forces et faiblesses)
4. Connaissance du secteur (${sectorFocus})
5. Points forts (liste avec puces)
6. Axes d'amélioration (liste avec puces)
7. Évaluation globale (note /5 avec justification)
8. Recommandation (adapté ou non au poste, potentiel)

Ton évaluation doit être professionnelle, objective et constructive.`;
}