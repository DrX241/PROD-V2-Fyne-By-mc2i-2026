import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  type: string;
  question: string;
  hint?: string;
  placeholder?: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface JobContext {
  id: string;
  title: string;
  description: string;
  organization: string;
  technicalContext: string;
  responsibilities: string[];
  requirements: string[];
}

interface AdaptiveQuestionRequest {
  presentationAnswer: string;
  currentQuestionIndex: number;
  previousAnswers: Array<{
    questionId: string;
    type: string;
    question: string;
    answer: string;
  }>;
  jobContext?: JobContext; // Contexte d'audition optionnel
}

interface InitialQuestionRequest {
  jobContext: JobContext;
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
 * Génère la première question adaptée au contexte d'audition
 */
export async function generateInitialQuestion(req: Request, res: Response) {
  try {
    const { jobContext } = req.body as InitialQuestionRequest;
    
    if (!jobContext) {
      return res.status(400).json({
        success: false,
        message: 'Le contexte d\'audition est requis'
      });
    }

    // Préparation du prompt pour la question initiale contextualisée
    const systemPrompt = `
Tu es un recruteur expert en cybersécurité qui fait passer un entretien adapté à un poste spécifique.

CONTEXTE D'AUDITION :
- Poste : ${jobContext.title}
- Organisation : ${jobContext.organization}
- Description : ${jobContext.description}
- Contexte technique : ${jobContext.technicalContext}
- Responsabilités : ${jobContext.responsibilities.join(', ')}
- Prérequis : ${jobContext.requirements.join(', ')}

Ta mission est de générer la première question qui sera posée au candidat, adaptée spécifiquement à ce contexte d'emploi.
La première question doit toujours être une question de présentation, mais ADAPTÉE au contexte du poste.

IMPORTANT : Ta réponse doit être au format JSON suivant, sans aucun texte en dehors du JSON :
{
  "id": "q1",
  "type": "presentation",
  "question": "Ta question de présentation adaptée au contexte",
  "hint": "Un indice pour guider le candidat (max 1 ligne)",
  "placeholder": "Un exemple de début de réponse"
}
`;

    const userPrompt = `
Génère une question de présentation pertinente et spécifique pour un candidat postulant au poste de ${jobContext.title} chez ${jobContext.organization}.

La question doit permettre au candidat de se présenter tout en mettant en avant les compétences et expériences pertinentes pour ce poste spécifique.
`;

    // Appel à Azure OpenAI
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];
    
    const completion = await openAIService.getChatCompletion(
      messages,
      0.7,  // température
      1500  // maxTokens
    );

    try {
      // Extraction et parsing de la réponse JSON
      const content = completion || '';
      
      // Cherche un objet JSON dans la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Aucun format JSON valide trouvé dans la réponse');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validation des champs requis
      if (!questionData.question || !questionData.type) {
        throw new Error('Réponse incomplète, certains champs requis sont manquants');
      }
      
      // Vérifier que c'est bien une question de présentation
      if (questionData.type !== "presentation") {
        questionData.type = "presentation";
      }
      
      // Génération d'un ID unique si non présent
      if (!questionData.id) {
        questionData.id = "q1";
      }
      
      // Envoi de la question générée
      return res.status(200).json({
        success: true,
        question: questionData
      });
      
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse:', error);
      
      // Question de secours en cas d'erreur
      const fallbackQuestion = {
        id: "q1",
        type: "presentation",
        question: `Présentez-vous et décrivez votre parcours et expérience dans le domaine de la cybersécurité, en particulier ce qui vous qualifie pour ce poste de ${jobContext.title}.`,
        hint: "Mettez en avant vos compétences et réalisations les plus pertinentes pour ce poste.",
        placeholder: "Je m'appelle... et je suis spécialisé(e) dans..."
      };
      
      return res.status(200).json({
        success: true,
        question: fallbackQuestion,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération de question initiale:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la génération de la question initiale'
    });
  }
}

/**
 * Génère des questions adaptatives basées sur la réponse de présentation et les réponses précédentes
 */
export async function generateAdaptiveQuestion(req: Request, res: Response) {
  try {
    const { presentationAnswer, currentQuestionIndex, previousAnswers, jobContext } = req.body as AdaptiveQuestionRequest;
    
    if (!presentationAnswer) {
      return res.status(400).json({
        success: false,
        message: 'La réponse de présentation est requise'
      });
    }

    // Différents prompts en fonction du stade du test
    let systemPrompt = '';
    let userPrompt = '';

    // Création du bloc de contexte d'audition s'il est disponible
    let contextBlock = '';
    if (jobContext) {
      contextBlock = `
CONTEXTE D'AUDITION SPÉCIFIQUE :
- Poste : ${jobContext.title}
- Organisation : ${jobContext.organization}
- Description : ${jobContext.description}
- Contexte technique : ${jobContext.technicalContext}
- Responsabilités : ${jobContext.responsibilities.join(', ')}
- Prérequis : ${jobContext.requirements.join(', ')}

Les questions doivent être pertinentes par rapport à ce contexte spécifique d'emploi.
`;
    }

    if (currentQuestionIndex === 0) {
      // Génération de la première question technique qui demande au candidat de reformuler le contexte et les enjeux
      systemPrompt = `
Tu es un recruteur cybersécurité expérimenté qui fait passer un entretien technique adaptatif.

Tu dois analyser la présentation d'un candidat et générer une première question technique pertinente.
${contextBlock}

IMPORTANT: Pour la deuxième question (après la présentation), tu DOIS demander au candidat de restituer sa compréhension du besoin et du contexte de l'entreprise. L'objectif est d'évaluer sa capacité d'écoute et d'analyse du contexte business.

IMPORTANT : Ta réponse doit être au format JSON suivant, sans aucun texte en dehors du JSON :
{
  "id": "q2",
  "type": "analysis",
  "question": "Une question qui demande au candidat de reformuler sa compréhension du besoin, du contexte de l'entreprise et des enjeux du poste",
  "hint": "Un indice pour guider le candidat à bien reformuler les enjeux business et techniques (max 1 ligne)",
  "placeholder": "Un exemple de début de réponse orienté compréhension du contexte"
}

Le type de la question DOIT être "analysis" car c'est une question de compréhension du contexte.
`;

      userPrompt = `
Voici la présentation du candidat en cybersécurité :

"${presentationAnswer}"

Analyse son profil (expérience, niveau, expertise) et génère une première question pertinente qui va permettre d'évaluer ses compétences de manière adaptée${jobContext ? ` par rapport au poste de ${jobContext.title}` : ''}.
`;
    } else {
      // Progression logique des questions en fonction de l'étape de l'entretien
      let questionStage;

      // Déterminer l'étape de l'entretien (après présentation et compréhension du contexte)
      if (currentQuestionIndex <= 2) {
        questionStage = "adéquation_profil"; // Questions sur pourquoi ce poste, adéquation du profil
      } else if (currentQuestionIndex <= 4) {
        questionStage = "technique"; // Questions techniques liées au poste
      } else if (currentQuestionIndex <= 6) {
        questionStage = "fonctionnel"; // Questions fonctionnelles et opérationnelles
      } else {
        questionStage = "stratégique"; // Questions stratégiques et projection
      }

      // Génération des questions suivantes basées sur toutes les réponses précédentes
      systemPrompt = `
Tu es un recruteur cybersécurité expérimenté qui fait passer un entretien technique adaptatif.

Tu dois analyser les réponses précédentes d'un candidat et générer la question suivante la plus pertinente pour évaluer ses compétences.
${contextBlock}

PROGRESSION LOGIQUE DE L'ENTRETIEN:
L'entretien suit une progression spécifique:
1. Présentation du candidat (déjà faite)
2. Compréhension du contexte d'audition (déjà faite)
3. Adéquation du profil avec le poste (pourquoi vous?, points forts/faibles pertinents pour ce poste)
4. Questions techniques spécifiques au poste
5. Questions fonctionnelles et opérationnelles
6. Questions stratégiques et de projection

Nous sommes actuellement à l'étape: "${questionStage}".

IMPORTANT : Ta réponse doit être au format JSON suivant, sans aucun texte en dehors du JSON :
{
  "id": "${currentQuestionIndex + 1}",
  "type": "Choisis un type approprié selon l'étape actuelle",
  "question": "Ta question adaptée au profil du candidat, au contexte d'audition et à l'étape actuelle de l'entretien",
  "hint": "Un indice pour guider le candidat (max 1 ligne)",
  "placeholder": "Un exemple de début de réponse"
}

Choisis le type de question en fonction de l'étape actuelle:
- Pour "adéquation_profil": "analysis" ou "client" (pertinence du profil, motivation)
- Pour "technique": "technical", "reflex", ou "incident" (compétences techniques spécifiques)
- Pour "fonctionnel": "client" ou "ethical" (aspects fonctionnels, opérationnels)
- Pour "stratégique": "projection" ou "analysis" (vision, stratégie)

Le niveau de ta question doit s'adapter au niveau perçu du candidat: plus basique s'il semble débutant, plus complexe s'il démontre une expertise.
Les questions doivent être très spécifiques au contexte d'audition fourni et au poste visé.
`;

      // Format des réponses précédentes
      const formattedPreviousAnswers = previousAnswers.map(qa => 
        `Question ${qa.questionId} (${qa.type}): ${qa.question}\n` +
        `Réponse: ${qa.answer}`
      ).join('\n\n');
      
      userPrompt = `
Présentation du candidat:
"${presentationAnswer}"

Questions et réponses précédentes:
${formattedPreviousAnswers}

Analyse ces réponses et génère la question suivante la plus pertinente pour approfondir l'évaluation de ce candidat${jobContext ? ` pour le poste de ${jobContext.title}` : ''}.
Évite de poser une question du même type que les précédentes, sauf si c'est nécessaire pour approfondir un aspect important.
`;
    }

    // Appel à Azure OpenAI
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];
    
    const completion = await openAIService.getChatCompletion(
      messages,
      0.7,  // température
      1500  // maxTokens
    );

    try {
      // Extraction et parsing de la réponse JSON
      const content = completion || '';
      
      // Cherche un objet JSON dans la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Aucun format JSON valide trouvé dans la réponse');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validation des champs requis
      if (!questionData.question || !questionData.type) {
        throw new Error('Réponse incomplète, certains champs requis sont manquants');
      }
      
      // Génération d'un ID unique si non présent
      if (!questionData.id) {
        questionData.id = `q${currentQuestionIndex + 1}`;
      }
      
      // Envoi de la question générée
      return res.status(200).json({
        success: true,
        question: questionData
      });
      
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse:', error);
      
      // Question de secours en cas d'erreur
      const fallbackQuestions = [
        {
          id: `q${currentQuestionIndex + 1}`,
          type: "incident",
          question: "Décrivez les premières actions que vous prendriez face à une attaque par ransomware détectée dans votre entreprise.",
          hint: "Considérez les aspects techniques, organisationnels et de communication.",
          placeholder: "Mes premières actions seraient..."
        },
        {
          id: `q${currentQuestionIndex + 1}`,
          type: "technical",
          question: "Quelles mesures de sécurité mettriez-vous en place pour protéger une API REST exposée sur internet ?",
          hint: "Pensez à l'authentification, l'autorisation et la protection des données.",
          placeholder: "Pour sécuriser une API REST, je..."
        },
        {
          id: `q${currentQuestionIndex + 1}`,
          type: "ethical",
          question: "Vous découvrez une vulnérabilité critique dans un système client, mais votre supérieur vous demande de ne pas la mentionner dans le rapport. Comment gérez-vous cette situation ?",
          hint: "Réfléchissez aux implications éthiques, professionnelles et légales.",
          placeholder: "Face à cette situation, je..."
        }
      ];
      
      // Sélectionner une question de secours en fonction de l'index
      const fallbackIndex = currentQuestionIndex % fallbackQuestions.length;
      
      return res.status(200).json({
        success: true,
        question: fallbackQuestions[fallbackIndex],
        fallback: true
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération de question:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la génération de la question'
    });
  }
}

/**
 * Évalue les réponses du test d'entretien cyber avec une approche objective basée sur des preuves
 */
export async function evaluateInterviewTest(req: Request, res: Response) {
  try {
    const { questions, answers, jobContext } = req.body;

    if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Format de données invalide. Les questions et réponses doivent être des tableaux.'
      });
    }

    // Préparation des données pour l'analyse par Azure OpenAI
    const formattedQuestions = questions.map((q: Question, index: number) => 
      `Question ${index + 1} (${q.type}): ${q.question}`
    ).join('\n\n');

    const formattedAnswers = answers.map((a: Answer, index: number) => {
      const question = questions.find((q: Question) => q.id === a.questionId);
      return `Réponse ${index + 1} (${question?.type || 'inconnue'}):\n"${a.answer || "[Pas de réponse]"}"`;
    }).join('\n\n');

    // Création du bloc de contexte d'audition s'il est disponible
    let contextBlock = '';
    if (jobContext) {
      contextBlock = `
CONTEXTE D'AUDITION :
- Poste : ${jobContext.title}
- Organisation : ${jobContext.organization}
- Description : ${jobContext.description}
- Contexte technique : ${jobContext.technicalContext}
- Responsabilités : ${jobContext.responsibilities.join(', ')}
- Prérequis : ${jobContext.requirements.join(', ')}

Toute l'évaluation doit être faite en tenant compte de ce contexte spécifique.
`;
    }

    // Prompt pour Azure OpenAI avec l'accent sur l'objectivité et les citations
    const systemPrompt = `
Tu es un recruteur expert en cybersécurité qui vient de faire passer un entretien à un candidat.
${contextBlock}

CONSIGNE D'ÉVALUATION:
Ta mission est d'évaluer objectivement les réponses du candidat et de produire une synthèse d'entretien rigoureuse.
Pour chaque point fort ou axe d'amélioration que tu identifies, tu DOIS citer des extraits précis des réponses du candidat.

Rédige un profil d'évaluation structuré avec:

1. Profil général (3-4 lignes): niveau technique perçu, posture professionnelle, adéquation au poste visé.

2. Points forts (3 points): compétences, connaissances ou qualités démontrées par le candidat.
   Pour chaque point fort, CITE UN EXTRAIT PRÉCIS de ses réponses entre guillemets qui le démontre.

3. Axes de progression (3 points): lacunes techniques, connaissance à approfondir ou comportements à améliorer.
   Pour chaque axe d'amélioration, CITE UN EXTRAIT PRÉCIS de ses réponses entre guillemets qui illustre ce besoin.

4. Badge: attribue un badge qui résume son profil avec une justification qui synthétise l'évaluation.

LE TON: Objectif, factuel, basé sur des preuves tangibles (citations).

IMPORTANT : Ta réponse doit être au format JSON suivant, sans aucun texte en dehors du JSON :
{
  "profile": "Texte de 3-4 lignes décrivant le profil général avec évaluation de l'adéquation au poste de [titre du poste]",
  "strengths": [
    "Point fort 1 avec citation: \"[extrait de réponse exact]\"",
    "Point fort 2 avec citation: \"[extrait de réponse exact]\"",
    "Point fort 3 avec citation: \"[extrait de réponse exact]\""
  ],
  "improvements": [
    "Axe d'amélioration 1 avec citation: \"[extrait de réponse exact]\"",
    "Axe d'amélioration 2 avec citation: \"[extrait de réponse exact]\"",
    "Axe d'amélioration 3 avec citation: \"[extrait de réponse exact]\""
  ],
  "badge": {
    "name": "Nom du badge représentatif",
    "justification": "Synthèse factuelle des forces et limites principales en lien avec le poste visé"
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
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];
    const completion = await openAIService.getChatCompletion(
      messages,
      0.7,  // temperature
      2000  // maxTokens
    );

    let evaluationResult: Evaluation;
    
    try {
      // Extraction et parsing de la réponse JSON
      const content = completion || '';
      
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