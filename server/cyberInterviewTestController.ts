import { Request, Response } from 'express';
import { openai } from './openAiResponseHelper';

interface Question {
  id: string;
  type: string;
  question: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface Evaluation {
  profile: string;
  strengths: string[];
  improvements: string[];
  badge: {
    name: string;
    justification: string;
  };
}

/**
 * Évalue les réponses du test d'entretien cyber
 */
export async function evaluateInterviewTest(req: Request, res: Response) {
  try {
    const { questions, answers } = req.body;

    if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Format de données invalide. Les questions et réponses doivent être des tableaux.'
      });
    }

    // Préparation des données pour l'analyse par Azure OpenAI
    const formattedQuestions = questions.map((q: Question) => 
      `Question (${q.type}): ${q.question}`
    ).join('\n\n');

    const formattedAnswers = answers.map((a: Answer) => {
      const question = questions.find((q: Question) => q.id === a.questionId);
      return `Réponse à "${question?.question || a.questionId}":\n${a.answer || "[Pas de réponse]"}`;
    }).join('\n\n');

    // Prompt pour Azure OpenAI
    const systemPrompt = `
Tu es un recruteur cybersécurité expérimenté. Tu viens de faire passer un test de 15 minutes à un candidat.
Lis l'ensemble de ses réponses, puis rédige un profil d'évaluation structuré avec :

1. Profil général (3 lignes) : posture, niveau perçu, comportement pro.
2. Forces (3 points) : réflexes, raisonnement, qualités professionnelles.
3. Axes de progression (3 points) : limites techniques ou comportementales.
4. Badge final : nom du badge (ex : Cyber Guardian Junior) + 1 ligne de justification.

Le ton doit être bienveillant, professionnel et orienté progression. Ne donne aucun score.

IMPORTANT : Ta réponse doit être au format JSON suivant, sans aucun texte en dehors du JSON :
{
  "profile": "Texte de 3 lignes maximum décrivant le profil général",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "improvements": ["Axe d'amélioration 1", "Axe d'amélioration 2", "Axe d'amélioration 3"],
  "badge": {
    "name": "Nom du badge",
    "justification": "Une ligne expliquant pourquoi ce badge"
  }
}
`;

    const userPrompt = `
Questions et réponses du test d'entretien cybersécurité :

${formattedQuestions}

---

${formattedAnswers}

---

Analyse le profil du candidat et génère une évaluation selon le format JSON demandé.
`;

    // Appel à Azure OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.GPT4_DEPLOYMENT_NAME || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    let evaluationResult: Evaluation;
    
    try {
      // Extraction et parsing de la réponse JSON
      const content = chatCompletion.choices[0].message.content || '';
      
      // Cherche un objet JSON dans la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Aucun format JSON valide trouvé dans la réponse');
      }
      
      evaluationResult = JSON.parse(jsonMatch[0]);
      
      // Validation des champs requis
      if (!evaluationResult.profile || !evaluationResult.strengths || !evaluationResult.improvements || !evaluationResult.badge) {
        throw new Error('Réponse incomplète, certains champs requis sont manquants');
      }
      
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse:', error);
      
      // Réponse de secours en cas d'erreur de parsing
      evaluationResult = {
        profile: "Le candidat montre une compréhension des fondamentaux de la cybersécurité, avec une approche méthodique. Son niveau technique semble intermédiaire, avec une bonne capacité d'analyse et de résolution de problèmes.",
        strengths: [
          "Bonne approche analytique face aux incidents",
          "Conscience des enjeux éthiques de la cybersécurité",
          "Capacité à communiquer clairement sur des sujets techniques"
        ],
        improvements: [
          "Approfondir les connaissances techniques spécifiques",
          "Développer une vision plus stratégique des enjeux de sécurité",
          "Renforcer les compétences en analyse de logs et forensique"
        ],
        badge: {
          name: "Cyber Defender",
          justification: "Profil solide avec de bonnes bases, prêt à évoluer vers des responsabilités plus importantes en cybersécurité."
        }
      };
    }

    // Envoi des résultats
    return res.status(200).json({
      success: true,
      evaluation: evaluationResult
    });

  } catch (error) {
    console.error('Erreur lors de l\'évaluation:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'évaluation'
    });
  }
}