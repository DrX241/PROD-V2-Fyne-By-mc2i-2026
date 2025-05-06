import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

// Liste de questions pour l'entretien
const INTERVIEW_QUESTIONS = [
  {
    id: 'q1',
    text: "Présentez-vous brièvement en tant que professionnel de la cybersécurité.",
    type: 'open'
  },
  {
    id: 'q2',
    text: "Un collaborateur reçoit un mail suspect. Que faites-vous ?",
    type: 'open'
  },
  {
    id: 'q3',
    text: "Une machine est infectée. Tu es seul sur site. Que fais-tu dans les 10 premières minutes ?",
    type: 'open'
  },
  {
    id: 'q4',
    text: "Analyse ces logs et décris ce que tu observes.",
    type: 'open',
    context: `
192.168.1.105 - - [03/05/2025:10:15:36 +0200] "GET /admin/login.php HTTP/1.1" 200 4523 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:15:42 +0200] "POST /admin/login.php HTTP/1.1" 302 0 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:15:43 +0200] "GET /admin/dashboard.php HTTP/1.1" 200 8763 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:16:12 +0200] "GET /admin/user_management.php HTTP/1.1" 200 6821 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:16:35 +0200] "POST /admin/user_management.php HTTP/1.1" 302 0 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:16:36 +0200] "GET /admin/add_user.php HTTP/1.1" 200 3562 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:17:02 +0200] "POST /admin/add_user.php HTTP/1.1" 302 0 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:17:03 +0200] "GET /admin/user_management.php HTTP/1.1" 200 7245 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:17:30 +0200] "GET /config/database_backup.php HTTP/1.1" 200 1254 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:18:22 +0200] "POST /config/database_backup.php HTTP/1.1" 200 854 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:18:23 +0200] "GET /config/backup/db_backup_03052025101823.sql HTTP/1.1" 200 15427 "-" "Mozilla/5.0"
192.168.1.105 - - [03/05/2025:10:20:15 +0200] "POST /admin/logout.php HTTP/1.1" 302 0 "-" "Mozilla/5.0"
`
  },
  {
    id: 'q5',
    text: "Un client souhaite désactiver le MFA pour gagner du temps. Quelle est ta réaction ?",
    type: 'open'
  },
  {
    id: 'q6',
    text: "Tu identifies une faille négligée par ton équipe. Que fais-tu ?",
    type: 'open'
  },
  {
    id: 'q7',
    text: "Selon toi, quelle est la plus grande menace à venir en cybersécurité, et pourquoi ?",
    type: 'open'
  }
];

// Interface pour les sessions d'entretien
interface InterviewSession {
  id: string;
  startTime: Date;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    timestamp: Date;
  }>;
  profile?: {
    general: string;
    strengths: string[];
    weaknesses: string[];
    badge: {
      name: string;
      justification: string;
    };
  };
}

// Stockage des sessions d'entretien en mémoire
const interviewSessions = new Map<string, InterviewSession>();

/**
 * Démarre une nouvelle session d'entretien en cybersécurité
 */
export async function startInterview(req: Request, res: Response) {
  try {
    const sessionId = `interview_${Date.now()}`;
    
    // Initialiser la session d'entretien
    const session: InterviewSession = {
      id: sessionId,
      startTime: new Date(),
      answers: []
    };
    
    interviewSessions.set(sessionId, session);
    
    // Renvoyer les informations de session et la première question
    return res.json({
      success: true,
      sessionId,
      questions: INTERVIEW_QUESTIONS,
      totalTime: 15 * 60 // 15 minutes en secondes
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'entretien:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de l\'entretien.'
    });
  }
}

/**
 * Enregistre la réponse à une question et renvoie la question suivante
 */
export async function submitAnswer(req: Request, res: Response) {
  try {
    const { sessionId, questionId, answer } = req.body;
    
    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants. Veuillez fournir sessionId, questionId et answer.'
      });
    }
    
    // Récupérer la session
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session d\'entretien non trouvée.'
      });
    }
    
    // Trouver la question correspondante
    const question = INTERVIEW_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question non trouvée.'
      });
    }
    
    // Ajouter la réponse à la session
    session.answers.push({
      questionId,
      questionText: question.text,
      answer,
      timestamp: new Date()
    });
    
    // Mettre à jour la session
    interviewSessions.set(sessionId, session);
    
    return res.json({
      success: true,
      remainingQuestions: INTERVIEW_QUESTIONS.length - session.answers.length
    });
  } catch (error) {
    console.error('Erreur lors de la soumission de la réponse:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la soumission de la réponse.'
    });
  }
}

/**
 * Termine l'entretien et génère le profil d'évaluation
 */
export async function completeInterview(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre sessionId manquant.'
      });
    }
    
    // Récupérer la session
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session d\'entretien non trouvée.'
      });
    }
    
    // Vérifier qu'il y a des réponses dans la session
    if (session.answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune réponse enregistrée dans cette session.'
      });
    }
    
    // Construire le prompt pour l'évaluation
    const systemPrompt = `Tu es un recruteur cybersécurité expérimenté. Tu viens de faire passer un test de 15 minutes à un candidat.
Lis l'ensemble de ses réponses et produis un profil d'évaluation structuré ainsi :

1. Profil général (3 lignes) : posture, niveau perçu, comportement.
2. Forces (3 bullets) : réflexes, qualité de raisonnement, clarté.
3. Axes de progression (3 bullets) : limites, imprécisions, axes à creuser.
4. Badge symbolique : nom du badge (ex. : Cyber Sentinel Junior) + 1 ligne de justification.

Le ton doit être professionnel, bienveillant et utile pour faire progresser le candidat.

IMPORTANT: Ta réponse doit être formatée en JSON selon cette structure exacte:
{
  "general": "Texte du profil général sur 3 lignes",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "weaknesses": ["Axe de progression 1", "Axe de progression 2", "Axe de progression 3"],
  "badge": {
    "name": "Nom du badge",
    "justification": "Justification en une ligne"
  }
}`;

    // Préparation des données à envoyer à l'IA
    let userPrompt = "Voici les réponses du candidat:\n\n";
    session.answers.forEach(answer => {
      userPrompt += `Question: ${answer.questionText}\nRéponse: ${answer.answer}\n\n`;
    });
    
    // Construire les messages pour l'API
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    try {
      // Appel à l'API d'IA
      const result = await openAIService.getChatCompletion(messages, 0.3);
      
      // Parser le JSON résultant
      const profile = JSON.parse(result);
      
      // Mettre à jour la session avec le profil
      session.profile = profile;
      interviewSessions.set(sessionId, session);
      
      return res.json({
        success: true,
        profile
      });
    } catch (apiError) {
      console.error('Erreur API lors de l\'évaluation:', apiError);
      
      // Profil de secours en cas d'erreur API
      const fallbackProfile = {
        general: "Consultant cybersécurité junior à potentiel. Bonne capacité à structurer ses idées, posture respectueuse mais encore hésitante dans certaines décisions critiques.",
        strengths: [
          "Réactivité pertinente sur les scénarios d'incident.",
          "Bonne compréhension des enjeux MFA et phishing.",
          "Communication claire et structurée."
        ],
        weaknesses: [
          "Plus de précision technique sur l'analyse de logs.",
          "Approche trop prudente sur les failles internes.",
          "À renforcer : gestion des dilemmes client."
        ],
        badge: {
          name: "Cyber Guardian Junior",
          justification: "Montre de solides bases opérationnelles et une éthique fiable. Doit désormais renforcer sa rigueur technique."
        }
      };
      
      // Mettre à jour la session avec le profil de secours
      session.profile = fallbackProfile;
      interviewSessions.set(sessionId, session);
      
      return res.json({
        success: true,
        profile: fallbackProfile,
        fallbackMode: true
      });
    }
  } catch (error) {
    console.error('Erreur lors de la complétion de l\'entretien:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la complétion de l\'entretien.'
    });
  }
}