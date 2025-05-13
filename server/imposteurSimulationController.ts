import { Request, Response } from 'express';
import { createChatCompletion, createSystemPrompt } from './services/openai';

/**
 * Interface pour stocker les sessions de simulation "Qui est l'imposteur"
 */
interface UserSession {
  candidateProfile: {
    experienceYears: string;
    sector: string;
    specialty: string;
  };
  messages: Array<{ role: string; content: string }>;
}

// Map pour stocker les sessions utilisateur
const userSessions: Map<string, UserSession> = new Map();

/**
 * Génère un prompt système pour initialiser la simulation
 */
function generateSystemPrompt(candidateProfile: any): string {
  const { experienceYears, sector, specialty } = candidateProfile;
  
  let experienceLevel = '';
  if (experienceYears === '0-2') experienceLevel = 'junior (0-2 ans)';
  else if (experienceYears === '3-5') experienceLevel = 'confirmé (3-5 ans)';
  else if (experienceYears === '6-10') experienceLevel = 'senior (6-10 ans)';
  else experienceLevel = 'expert (plus de 10 ans)';

  return `Tu es un recruteur expérimenté qui mène un entretien d'embauche pour évaluer un candidat se présentant comme ${experienceLevel} d'expérience dans le secteur ${sector} avec une spécialité en ${specialty}.

Tu simules un véritable entretien professionnel en suivant ces règles:
1. Pose des questions adaptées à ce profil et ce niveau d'expérience pour évaluer les compétences et la cohérence du discours.
2. Alterne entre questions ouvertes sur l'expérience, questions techniques spécifiques au domaine, et mises en situation concrètes.
3. Sois attentif aux incohérences ou aux réponses vagues pour déceler un éventuel "imposteur".
4. Adapte progressivement tes questions en fonction des réponses précédentes.
5. IMPORTANT: L'entretien dure 10 minutes maximum, pose des questions qui permettront d'évaluer efficacement le candidat dans ce temps limité.

Commence l'entretien de manière professionnelle en te présentant brièvement puis demande au candidat de se présenter.`;
}

/**
 * Démarre une nouvelle session de simulation
 */
export async function startImposteurSimulation(req: Request, res: Response) {
  try {
    const { candidateProfile } = req.body;
    const sessionId = req.sessionID;

    if (!candidateProfile.experienceYears || !candidateProfile.sector || !candidateProfile.specialty) {
      return res.status(400).json({ success: false, message: 'Tous les champs du profil candidat sont requis' });
    }

    // Génère le prompt système
    const systemPrompt = generateSystemPrompt(candidateProfile);
    
    // Initialise la conversation avec l'API
    const initialMessage = await createChatCompletion([
      { role: 'system', content: systemPrompt },
    ]);

    // Stocke la session
    userSessions.set(sessionId, {
      candidateProfile,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: initialMessage }
      ]
    });

    res.status(200).json({
      success: true,
      initialMessage,
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la simulation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du démarrage de la simulation' });
  }
}

/**
 * Traite un message utilisateur dans la simulation
 */
export async function processImposteurMessage(req: Request, res: Response) {
  try {
    const { message, remainingTime } = req.body;
    const sessionId = req.sessionID;
    
    const session = userSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée, veuillez redémarrer la simulation' });
    }

    // Ajoute le message utilisateur à l'historique
    session.messages.push({ role: 'user', content: message });

    // Ajoute une indication sur le temps restant si nécessaire
    if (remainingTime < 120) { // moins de 2 minutes restantes
      session.messages.push({ 
        role: 'system', 
        content: `Il reste moins de ${Math.ceil(remainingTime / 60)} minutes à l'entretien. Prépare-toi à conclure avec une dernière question significative.` 
      });
    }

    // Obtient la réponse de l'API
    const responseMessage = await createChatCompletion(session.messages);

    // Ajoute la réponse à l'historique
    session.messages.push({ role: 'assistant', content: responseMessage });

    // Met à jour la session
    userSessions.set(sessionId, session);

    res.status(200).json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du traitement du message' });
  }
}

/**
 * Termine la simulation et génère un rapport d'évaluation
 */
export async function completeImposteurSimulation(req: Request, res: Response) {
  try {
    const sessionId = req.sessionID;
    
    const session = userSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée, veuillez redémarrer la simulation' });
    }

    // Construit le prompt pour générer l'évaluation finale
    const evaluationPrompt = `Analyse l'entretien qui vient de se dérouler et génère une évaluation détaillée du candidat. 
    
Voici ce que tu dois inclure dans ton analyse (en format JSON) :
- strengths: un tableau de 3 à 5 forces identifiées chez le candidat
- weaknesses: un tableau de 3 à 5 points à améliorer
- coherenceScore: un score de 0 à 100 évaluant la cohérence du discours
- relevanceScore: un score de 0 à 100 évaluant la pertinence professionnelle
- technicalScore: un score de 0 à 100 évaluant l'expertise technique
- overallComment: un commentaire général de 3 à 5 phrases synthétisant l'évaluation

Ton objectif est d'identifier si le candidat maîtrise réellement le domaine qu'il prétend connaître. Sois objectif et constructif.
Réponds uniquement en format JSON structuré comme décrit ci-dessus.`;

    // Ajoute le prompt d'évaluation à l'historique
    session.messages.push({ role: 'system', content: evaluationPrompt });

    // Obtient l'évaluation de l'API
    const evaluationResponse = await createChatCompletion(session.messages, true);

    // Tente de parser la réponse JSON
    let evaluationData;
    try {
      // Supprime tout texte qui n'est pas JSON (comme "```json" et "```")
      const jsonString = evaluationResponse.replace(/^```json\s*|\s*```$/g, '');
      evaluationData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Erreur lors du parsing de l\'évaluation JSON:', parseError);
      console.log('Réponse reçue:', evaluationResponse);
      
      // Fallback: créer une structure minimale
      evaluationData = {
        strengths: ["Communication claire", "Réponses structurées"],
        weaknesses: ["Réponses parfois imprécises", "Manque de détails techniques"],
        coherenceScore: 70,
        relevanceScore: 65,
        technicalScore: 60,
        overallComment: "L'évaluation n'a pas pu être générée correctement. Veuillez réessayer."
      };
    }

    // Nettoie la session
    userSessions.delete(sessionId);

    res.status(200).json({
      success: true,
      ...evaluationData
    });
  } catch (error) {
    console.error('Erreur lors de la complétion de la simulation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la complétion de la simulation' });
  }
}