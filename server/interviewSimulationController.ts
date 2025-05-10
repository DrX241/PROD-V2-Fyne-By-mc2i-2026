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
      sectorFocus
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
      systemPrompt = generateAmoaStepPrompt(step, profileType, experienceLevel, sectorFocus || '');
    }

    // Ajout d'une couche de sécurité supplémentaire pour forcer le rôle de client
    const roleEnforcementPrompt = `
ATTENTION: Tu es UNIQUEMENT un CLIENT - NE JOUE JAMAIS le rôle du consultant.

TU NE DOIS JAMAIS:
- Commencer tes phrases par "Merci pour votre réponse" ou "Je comprends"
- Dire "Je vais reformuler" ou "Si je comprends bien"
- Faire une analyse ou reformulation du besoin (c'est le rôle du consultant)
- Utiliser des termes techniques spécifiques au métier de consultant
- Donner des conseils ou proposer des solutions méthodologiques

À FAIRE IMPÉRATIVEMENT:
- Pose UNE SEULE question précise pour challenger le consultant
- Utilise un ton direct et légèrement exigeant (tu es un client qui évalue)
- Reste dans ton rôle de client avec un problème à résoudre
- Garde ta réponse courte (max 100-150 mots)
- Réagis à ce que le consultant vient de dire sans le féliciter

Ce message est TA DERNIÈRE CHANCE de rester dans ton rôle de CLIENT qui évalue un consultant.
`;

    // Version améliorée: Ajout d'un contexte de conversation plus structuré
    // Convertir les messages précédents au format attendu par l'API OpenAI
    const formattedPreviousMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Construction du prompt complet avec rappel fort du rôle
    const promptMessages: ChatCompletionRequestMessage[] = [
      // Premier message: instruction système principale
      { role: 'system', content: systemPrompt },
      
      // Deuxième message: rappel explicite du rôle (plus de poids car plus récent)
      { role: 'system', content: roleEnforcementPrompt },
      
      // Historique de la conversation
      ...formattedPreviousMessages
    ];

    // Ajouter le message utilisateur actuel s'il n'est pas déjà dans l'historique
    const lastFormattedMessage = formattedPreviousMessages[formattedPreviousMessages.length - 1];
    if (!lastFormattedMessage || lastFormattedMessage.role !== 'user' || lastFormattedMessage.content !== message) {
      promptMessages.push({ role: 'user', content: message });
    }

    try {
      // Obtenir la réponse de l'IA avec une température basse pour plus de cohérence
      const aiResponse = await openAIService.getChatCompletion(
        promptMessages, 
        0.3,  // température plus basse pour réduire la créativité et favoriser la cohérence
        300   // moins de tokens pour éviter les réponses trop longues
      );

      // Validation supplémentaire pour s'assurer que l'IA n'a pas commencé par des formulations interdites
      const forbiddenStartPatterns = [
        /^merci pour votre r[ée]ponse/i,
        /^je comprends/i,
        /^je vais reformuler/i,
        /^si je comprends bien/i,
        /^pour r[ée]sumer/i,
        /^votre approche semble/i
      ];

      let finalResponse = aiResponse;

      // Vérifier si la réponse commence par une formulation interdite
      const hasInvalidStart = forbiddenStartPatterns.some(pattern => 
        pattern.test(aiResponse.trim())
      );

      if (hasInvalidStart) {
        // Si oui, remplacer par une question directe
        if (domain === 'amoa') {
          finalResponse = `Comment comptez-vous concrètement gérer les résistances au changement dans notre contexte spécifique du secteur ${sectorFocus} ? Pouvez-vous me donner un exemple concret de méthode que vous avez déjà utilisée avec succès ?`;
        } else {
          finalResponse = `Sur quelles normes ou standards de sécurité vous appuieriez-vous pour évaluer notre niveau de maturité en cybersécurité ? Pourriez-vous détailler votre approche d'analyse de risques ?`;
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
      systemPrompt = `Vous êtes un expert en analyse d'audition client dans le domaine de la cybersécurité. Votre mission est d'analyser les notes prises pendant une audition réelle (hors plateforme) et de les combiner avec l'évaluation de la simulation en ligne pour générer une synthèse structurée complète.

CONTEXTE IMPORTANT:
- Le consultant ${candidateName || "candidat"} a été évalué lors d'une audition réelle (notes prises manuellement) puis dans une simulation en ligne
- PRIORITAIRE: Les notes manuelles représentent 75% de l'évaluation finale et doivent être la source principale de votre analyse
- Vous devez extraire méticuleusement toutes les informations pertinentes des notes manuelles
- Ensuite seulement, enrichir votre analyse avec les éléments complémentaires de l'évaluation automatique (25%)
- L'objectif est de produire une synthèse complète et fidèle aux notes originales

PROFIL DU CONSULTANT:
- Type de profil: ${profileType.replace(/_/g, ' ')}
- Niveau d'expérience déclaré: ${experienceLevel}

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
- Secteur d'activité: ${sectorFocus || "général"}

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
 * Crée un objet JSON de secours à partir du texte de la réponse
 */
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
      sectorFocus,
      messages,
      duration
    } = req.body;

    if (!domain || !profileType || !experienceLevel || !messages || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres incomplets. Veuillez fournir le domaine, le type de profil, le niveau d\'expérience et les messages de l\'entretien.'
      });
    }

    // AMOA nécessite un secteur
    if (domain === 'amoa' && !sectorFocus) {
      return res.status(400).json({
        success: false,
        error: 'Le secteur d\'activité est requis pour les simulations AMOA.'
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
      systemPrompt = generateAmoaEvaluationPrompt(candidateName || 'consultant', profileType, experienceLevel, sectorFocus || '');
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
              ${domain === 'amoa' ? `<p><strong>Secteur d'activité:</strong> ${sectorFocus}</p>` : ''}
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
                subject: domain === 'amoa' ? `Évaluation de préparation d'audition - ${candidateName}` : `Évaluation d'audition client - ${candidateName}`,
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

      return res.json({
        success: true,
        evaluation: evaluationResponse,
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
  
  // Génération de profils de recruteurs spécialisés en cybersécurité
  const recruiters = [
    { name: "Thomas Mercier", title: "Directeur Technique", style: "très exigeant techniquement et direct", expertise: "architecture de sécurité" },
    { name: "Sophie Lefort", title: "Responsable RH", style: "analytique et structurée", expertise: "évaluation de soft skills" },
    { name: "Laurent Dupuis", title: "RSSI Senior", style: "pragmatique et orienté situations concrètes", expertise: "gestion des risques" },
    { name: "Nathalie Renard", title: "Directrice Sécurité", style: "rigoureuse et précise", expertise: "conformité et normes" },
    { name: "Marc Durand", title: "Lead Pentester", style: "technique et challengeant", expertise: "tests d'intrusion et Red Team" }
  ];
  
  // Sélection d'un recruteur
  const recruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
  
  return `Tu es ${recruiter.name}, ${recruiter.title} chez ${companyInfo.name} à ${companyInfo.city}, entreprise de ${companyInfo.size} spécialisée en ${companyInfo.sector}.

PERSONNALITÉ: Tu as un style ${recruiter.style} avec une expertise particulière en ${recruiter.expertise}. Tu recrutes un profil en cybersécurité (${profileType}, niveau d'expérience: ${experienceLevel}) et tu dois évaluer rigoureusement les compétences techniques et la cohérence du candidat.

MISSION: Simuler un ENTRETIEN D'EMBAUCHE TECHNIQUE réaliste, rigoureux et challengeant en cybersécurité.

RÈGLES DE SIMULATION:
1. Commence par une présentation BRÈVE (2 phrases max) puis pose une première question technique adaptée au profil ${profileType}.
2. ÉVALUE les réponses sans complaisance:
   - Si la réponse est précise et pertinente: Pose une question plus technique/complexe
   - Si la réponse est vague ou montre des lacunes: Demande des précisions et signale que la réponse n'est pas suffisamment détaillée
   - Si la réponse contient des informations incorrectes: Signale clairement l'erreur ("Attention, ce que vous dites est inexact car...")
   - Si la réponse est incohérente ou hors-sujet: Indique fermement que la réponse n'est pas adaptée et que tu en prends note pour l'évaluation finale
3. ANALYSE: Cherche activement les incohérences dans le discours, les contradictions ou les tentatives d'évitement.
4. COMPORTEMENT: Tu n'es pas conciliant. Tu restes professionnel mais très exigeant, en adaptant la difficulté au niveau ${experienceLevel}.
5. ADAPTATION: Augmente progressivement la difficulté des questions si les réponses sont bonnes, ou reviens à des questions fondamentales si le candidat montre des lacunes.

INTERDICTIONS FORMELLES:
- Ne propose JAMAIS toi-même des solutions (c'est le rôle du consultant!)
- Ne commence JAMAIS par "Merci pour votre réponse" ou "Je vais reformuler"
- Ne joue JAMAIS le rôle du consultant, reste STRICTEMENT dans ton rôle de client
- Ne dépasse JAMAIS deux paragraphes dans tes réponses

Commence par exposer brièvement la situation problématique et demande au consultant comment il pourrait t'aider.`;
}

function generateAmoaSystemPrompt(profileType: string, experienceLevel: string, sectorFocus: string): string {
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
  
  // Sélection des entreprises correspondant au secteur choisi (ou par défaut)
  const sectorsToChooseFrom = sectorCompanies[sectorFocus as keyof typeof sectorCompanies] || 
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
  
  return `Tu es ${executive.name}, ${executive.title} chez ${companyInfo.name} à ${companyInfo.city}, une entreprise de ${companyInfo.size} du secteur ${sectorFocus}.

PERSONNALITÉ: Tu as un style de management ${executive.style}. Tu es responsable du projet de "${companyInfo.project}" qui rencontre actuellement des difficultés liées à "${companyInfo.challenge}". Tu as une véritable personnalité avec des préoccupations concrètes.

MISSION: Simuler une audition client RÉALISTE pour évaluer un consultant AMOA (profil: ${profileType}, niveau: ${experienceLevel}).

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
  // Niveau de complexité des questions basé sur l'expérience
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
  
  // Progression de difficulté technique en fonction de l'étape d'entretien
  // Les questions deviennent de plus en plus pointues et spécifiques
  const complexityByStep = {
    junior: ['fondamental', 'fondamental-plus', 'intermédiaire', 'intermédiaire-plus'],
    confirmé: ['intermédiaire', 'intermédiaire-plus', 'avancé', 'avancé-plus'],
    confirme: ['intermédiaire', 'intermédiaire-plus', 'avancé', 'avancé-plus'],
    senior: ['avancé', 'avancé-plus', 'expert', 'expert-plus'],
    expert: ['expert', 'expert-plus', 'spécialiste', 'spécialiste-défi']
  };
  
  // Déterminer la complexité finale en fonction de l'étape et du niveau
  let complexity = baseComplexity;
  const expLevel = experienceLevel.toLowerCase();
  
  // Limiter l'étape à 4 maximum pour l'indexation dans le tableau
  const cappedStep = Math.min(step, 4);
  
  // Appliquer la progression de difficulté adaptée au niveau d'expérience
  if (cappedStep > 0) {
    if (expLevel === 'junior') {
      complexity = complexityByStep.junior[cappedStep - 1];
    } else if (expLevel === 'confirmé' || expLevel === 'confirme') {
      complexity = complexityByStep.confirme[cappedStep - 1];
    } else if (expLevel === 'senior') {
      complexity = complexityByStep.senior[cappedStep - 1];
    } else if (expLevel === 'expert') {
      complexity = complexityByStep.expert[cappedStep - 1];
    }
  }
  
  // Phases d'entretien technique plus rigoureuses et adaptées à un recrutement
  let phase = '';
  let phaseObjective = '';
  
  // Définir les phases d'entretien technique en cybersécurité
  const phases = [
    {
      title: "Phase d'évaluation des connaissances fondamentales",
      objective: `Évaluer les connaissances fondamentales du candidat en cybersécurité:
      - Principaux concepts et terminologie de sécurité
      - Compréhension des vulnérabilités et menaces courantes
      - Connaissances des frameworks et normes de base (ISO 27001, NIST, etc.)
      - Bases cryptographiques et de sécurité réseau`
    },
    {
      title: "Phase d'analyse technique approfondie",
      objective: `Évaluer l'expertise technique et pratique du candidat:
      - Capacité à analyser des scénarios d'attaque concrets
      - Maîtrise des outils et techniques spécifiques à son domaine
      - Connaissance approfondie des mécanismes de sécurité
      - Expérience pratique dans la résolution d'incidents`
    },
    {
      title: "Phase de mise en situation complexe",
      objective: `Évaluer la capacité d'adaptation et de résolution de problèmes:
      - Réaction face à des scénarios complexes ou inhabituels
      - Capacité à prioriser les actions dans un contexte de crise
      - Application des connaissances théoriques à des cas réels
      - Raisonnement méthodique sous pression`
    },
    {
      title: "Phase d'évaluation de la vision stratégique",
      objective: `Évaluer la vision globale et la maturité professionnelle:
      - Compréhension des enjeux business liés à la sécurité
      - Vision à long terme et approche stratégique 
      - Capacité à communiquer des concepts techniques à différents niveaux
      - Réflexion sur l'évolution des menaces et des technologies`
    }
  ];
  
  // Déterminer la phase d'entretien en fonction de l'étape
  if (step <= 4) {
    // Pour les 4 premières étapes, suivre la progression définie
    phase = phases[Math.min(step - 1, phases.length - 1)].title;
    phaseObjective = phases[Math.min(step - 1, phases.length - 1)].objective;
  } else {
    // Pour les étapes supplémentaires, varier entre les phases avancées
    const phaseIndex = ((step - 1) % 3) + 1; // Alterne entre phases 2, 3 et 4
    phase = `Phase d'approfondissement technique (niveau ${complexity})`;
    phaseObjective = phases[phaseIndex].objective;
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

  // Sélection d'un scénario basé sur le secteur et l'étape
  let selectedScenarios = sectorScenarios[sectorFocus as keyof typeof sectorScenarios] || 
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
      - Résoudre des problèmes complexes typiques du secteur ${sectorFocus}
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
  
  return `Tu es un CLIENT EXPERT du secteur ${sectorFocus}. Tu évalues un consultant AMOA lors d'une audition - ÉTAPE ${step}.

CONSIGNE PRINCIPALE: Tu dois avoir une vraie intelligence dans tes réponses, réagir de façon spécifique à ce que dit le consultant, et rebondir naturellement dans la conversation en restant dans le contexte.

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
2. Question principale ou mise en situation concrète liée au contexte (${sectorFocus} et ${scenario})
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
  return `Tu es un expert en recrutement technique spécialisé en cybersécurité, chargé d'analyser des entretiens d'embauche techniques.

Tu dois évaluer un entretien technique qui vient de se terminer:
- Nom du candidat: ${candidateName}
- Poste visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}

IMPORTANT - TON ÉVALUATION DOIT ÊTRE STRUCTURÉE EXACTEMENT AVEC LES SECTIONS SUIVANTES:

## 1. Compétences techniques démontrées
[Analyse détaillée des connaissances techniques du candidat, niveau de maîtrise des concepts, précision du vocabulaire technique, et pertinence des réponses aux questions techniques. Cite des exemples précis de connaissances démontrées ou de lacunes identifiées.]

## 2. Rigueur et précision
[Évalue la rigueur scientifique des réponses, la capacité à donner des informations précises plutôt que vagues, et l'honnêteté intellectuelle (reconnaissance des limites de ses connaissances). Donne des exemples concrets.]

## 3. Résolution de problèmes
[Analyse la méthodologie de résolution de problèmes, la structuration de la réflexion, la capacité d'analyse et la pertinence des solutions proposées face aux situations techniques posées.]

## 4. Forces techniques identifiées
- [Force technique 1 - Spécifique et illustrée par un exemple]
- [Force technique 2 - Spécifique et illustrée par un exemple]
- [Force technique 3 - Spécifique et illustrée par un exemple]

## 5. Lacunes techniques identifiées
- [Lacune 1 - Domaine précis avec exemple concret]
- [Lacune 2 - Domaine précis avec exemple concret]
- [Lacune 3 - Domaine précis avec exemple concret]

## 6. Adéquation au poste et au niveau
[Évaluation objective de l'adéquation entre les compétences démontrées et les exigences du poste de ${profileType} niveau ${experienceLevel}. Compare avec les standards attendus dans l'industrie pour ce type de poste.]

## 7. Évaluation technique globale
[Note technique sur 5 et recommandation finale (Recommandé / À considérer avec réserves / Non recommandé). Fournis une justification synthétique et technique de ta décision.]

CONSIGNES ESSENTIELLES:
- Utilise exclusivement les titres de section avec ce format exact (incluant la numérotation et les ##)
- Ton analyse doit être rigoureuse, factuelle et basée uniquement sur les compétences techniques démontrées
- Sois particulièrement attentif aux incohérences techniques, aux confusions conceptuelles et aux imprécisions
- Reste neutre et objectif, en te concentrant exclusivement sur les compétences et non sur le style de communication
- Ne reprends pas de longs extraits des réponses, mais cite des exemples précis d'erreurs ou de bonnes réponses
- Sois précis et constructif, même en cas de performance limitée`;
}

/**
 * Génère le prompt pour l'évaluation finale d'une audition client AMOA
 */
function generateAmoaEvaluationPrompt(candidateName: string, profileType: string, experienceLevel: string, sectorFocus: string): string {
  return `Tu es un expert en évaluation des performances de consultants AMOA (Assistance à Maîtrise d'Ouvrage) chez mc2i lors d'auditions client.

Tu dois évaluer une audition client professionnelle qui vient de se terminer:
- Nom du consultant: ${candidateName}
- Type de profil visé: ${profileType}
- Niveau d'expérience déclaré: ${experienceLevel}
- Secteur d'activité: ${sectorFocus}

IMPORTANT - TON ÉVALUATION DOIT ÊTRE STRUCTURÉE EXACTEMENT AVEC LES SECTIONS SUIVANTES:

## 1. Présentation et attitude professionnelle
[Analyser comment le consultant s'est présenté, sa posture, son professionnalisme et sa capacité à établir une relation de confiance. Donner des exemples concrets tirés de ses réponses.]

## 2. Compréhension et reformulation du contexte
[Évaluer si le consultant a bien compris et reformulé le besoin client présenté de façon personnalisée, ou s'il s'est contenté de répéter textuellement les informations données. Donner des exemples concrets.]

## 3. Expertise méthodologique et connaissance sectorielle
[Évaluer la pertinence des approches méthodologiques proposées pour le besoin exprimé et la connaissance du secteur ${sectorFocus}. Analyser si les méthodes sont adaptées au contexte sectoriel.]

## 4. Forces identifiées
- [Point fort 1 - Spécifique et illustré par un exemple]
- [Point fort 2 - Spécifique et illustré par un exemple]
- [Point fort 3 - Spécifique et illustré par un exemple]

## 5. Axes d'amélioration
- [Axe d'amélioration 1 - Concret avec suggestion]
- [Axe d'amélioration 2 - Concret avec suggestion]
- [Axe d'amélioration 3 - Concret avec suggestion]

## 6. Adéquation au niveau déclaré
[Évaluer de façon détaillée si le niveau réel démontré correspond au niveau ${experienceLevel}. Justifier pourquoi il correspond ou non en comparant avec les standards attendus pour ce niveau d'expérience en AMOA dans le secteur ${sectorFocus}.]

## 7. Évaluation globale
[Donner une note sur 5 et une évaluation synthétique de la prestation avec une recommandation finale (À recruter / À considérer / À renforcer).]

CONSIGNES ESSENTIELLES:
- Utilise exclusivement les titres de section avec ce format exact (incluant la numérotation et les ##)
- Ta réponse sera affichée directement dans l'interface de l'application, pas envoyée par email
- Ton analyse doit être factuelle et basée uniquement sur le contenu des échanges
- Ne reprends pas de longs extraits des réponses du consultant
- Concentre-toi sur l'analyse des compétences démontrées et non sur le contenu des questions
- Évalue particulièrement l'adéquation entre les compétences démontrées et les exigences spécifiques du secteur ${sectorFocus}
- Sois précis et constructif, même en cas de performance limitée`;
}