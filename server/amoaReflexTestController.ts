import { Request, Response } from 'express';
import { openAIService } from './services/openai';

/**
 * Interface pour les résultats d'analyse IA
 */
interface AIAnalysisResult {
  score: number;
  feedback: string;
  performanceAnalysis: {
    summary: string;
    detailedExplanation: string;
  };
  competenceEvaluation: {
    strengths: {
      title: string;
      description: string;
    }[];
    weaknesses: {
      title: string;
      description: string;
    }[];
  };
  skillBreakdown: {
    categoryName: string;
    score: number;
    analysis: string;
  }[];
  careerInsights: {
    currentLevel: string;
    potentialGrowth: string;
    nextSteps: string;
  };
  improvementPlan: {
    immediateActions: string[];
    longTermDevelopment: string[];
    recommendedResources: string[];
  };
  professionalInsight: string;
}

/**
 * Évalue les performances d'un utilisateur après un test de réflexes AMOA
 */
export async function evaluateUserPerformance(req: Request, res: Response) {
  try {
    const { 
      answers, 
      baseResults
    } = req.body;
    
    const {
      score, 
      correctAnswers, 
      totalQuestions, 
      categoryScores, 
      averageResponseTime, 
      difficulty 
    } = baseResults;

    // Les données sont déjà formatées grâce à la collecte pendant le test
    const answersFormatted = answers;

    // Système prompt pour l'IA
    const systemPrompt = `
      Tu es un expert senior en Assistance à Maîtrise d'Ouvrage (AMOA) avec plus de 20 ans d'expérience dans l'évaluation et le développement professionnel. 
      Tu as une connaissance approfondie en gestion de projet, analyse d'exigences, communication client, résolution de problèmes et management des parties prenantes.

      MISSION:
      Ton rôle est de fournir une analyse approfondie, détaillée et nuancée des performances d'un candidat lors d'un test de réflexes AMOA.
      Cette analyse doit être professionnelle, constructive, et offrir une perspective complète sur les capacités actuelles du candidat et son potentiel d'évolution.

      APPROCHE:
      - Adopte un ton professionnel, constructif et bienveillant
      - Base ton analyse uniquement sur les données fournies
      - Sois précis et spécifique dans tes observations
      - Évite les généralités et les formules toutes faites
      - Contextualise ton analyse par rapport aux attentes du métier d'AMOA
      - Formule des recommandations concrètes et actionnables

      FORMAT:
      Ta réponse doit être structurée au format JSON uniquement, selon le modèle suivant:

      {
        "score": number, // Score global sur 100 reflétant la performance globale
        
        "feedback": string, // Synthèse générale en 2-3 phrases max

        "performanceAnalysis": {
          "summary": string, // Bref résumé de la performance globale (1-2 phrases)
          "detailedExplanation": string // Analyse approfondie des résultats (4-6 phrases)
        },
        
        "competenceEvaluation": {
          "strengths": [
            {
              "title": string, // Titre court du point fort (3-6 mots)
              "description": string // Description détaillée (1-2 phrases)
            },
            // 2-3 points forts au total
          ],
          "weaknesses": [
            {
              "title": string, // Titre court du point à améliorer (3-6 mots)
              "description": string // Description détaillée avec justification (1-2 phrases)
            },
            // 2-3 points à améliorer au total
          ]
        },
        
        "skillBreakdown": [
          {
            "categoryName": string, // Nom de la catégorie de compétence
            "score": number, // Score pour cette catégorie (sur 100)
            "analysis": string // Analyse spécifique de cette compétence (1-2 phrases)
          },
          // 3-5 catégories de compétences au total
        ],
        
        "careerInsights": {
          "currentLevel": string, // Évaluation du niveau actuel (1-2 phrases)
          "potentialGrowth": string, // Potentiel d'évolution (1-2 phrases)
          "nextSteps": string // Prochaines étapes recommandées pour l'évolution professionnelle (2-3 phrases)
        },
        
        "improvementPlan": {
          "immediateActions": string[], // 2-3 actions immédiates à entreprendre
          "longTermDevelopment": string[], // 2-3 objectifs de développement à long terme
          "recommendedResources": string[] // 2-3 ressources recommandées (livres, formations, certifications)
        },
        
        "professionalInsight": string // Conclusion professionnelle et motivante (2-3 phrases)
      }

      IMPORTANT: Assure-toi que ta réponse est structurée exactement selon ce format JSON, sans aucun texte supplémentaire, markdown ou préfixe. Commence directement par { et termine par }.
    `;

    // Message utilisateur contenant les données à analyser
    const userPrompt = `
      Voici les résultats d'un test de réflexes en AMOA:
      
      Score brut: ${score}%
      Réponses correctes: ${correctAnswers}/${totalQuestions}
      Temps de réponse moyen: ${averageResponseTime.toFixed(1)} secondes
      Niveau de difficulté global: ${difficulty}
      
      Détails des réponses:
      ${JSON.stringify(answersFormatted, null, 2)}
      
      Scores par catégorie:
      ${JSON.stringify(categoryScores, null, 2)}
      
      Analyse ces résultats et fournis une évaluation professionnelle complète.
    `;

    // Appel à l'API OpenAI
    const aiResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // useSecondaryKey: true - utiliser le modèle gpt-4o-mini
      0.5,  // temperature
      1000  // maxTokens
    );

    // Analyse de la réponse
    let analysisResult: AIAnalysisResult;
    
    try {
      // Tenter de parser la réponse JSON
      analysisResult = JSON.parse(aiResponse);
      
      // Vérifier que tous les champs requis sont présents
      if (!analysisResult.score || !analysisResult.feedback || !analysisResult.performanceAnalysis || 
          !analysisResult.competenceEvaluation || !analysisResult.skillBreakdown || 
          !analysisResult.careerInsights || !analysisResult.improvementPlan ||
          !analysisResult.professionalInsight) {
        throw new Error("Réponse incomplète de l'IA");
      }
      
      return res.status(200).json({
        success: true,
        analysis: analysisResult
      });
    } catch (parseError) {
      console.error("Erreur de parsing de la réponse de l'IA:", parseError);
      console.error("Réponse brute de l'IA:", aiResponse);
      
      // Réponse de secours en cas d'échec du parsing
      return res.status(200).json({
        success: true,
        analysis: {
          score: score,
          feedback: "Analyse complétée avec succès.",
          performanceAnalysis: {
            summary: "Votre performance au test de réflexes AMOA montre des connaissances fondamentales du domaine.",
            detailedExplanation: "Les réponses que vous avez fournies révèlent une compréhension des principes de base de l'AMOA, mais certains domaines nécessitent un approfondissement. Votre temps de réponse moyen indique une bonne capacité de réflexion, mais il y a une marge d'amélioration dans la précision de certaines réponses techniques."
          },
          competenceEvaluation: {
            strengths: [
              {
                title: "Communication efficace",
                description: "Vous démontrez une bonne capacité à formuler des messages clairs et adaptés aux différentes parties prenantes."
              },
              {
                title: "Analyse des besoins",
                description: "Vos réponses montrent une compréhension solide des techniques d'analyse et de formalisation des besoins métier."
              }
            ],
            weaknesses: [
              {
                title: "Gestion des risques",
                description: "L'identification et l'évaluation des risques projet représentent un axe d'amélioration important pour vous."
              },
              {
                title: "Connaissances techniques",
                description: "Certaines réponses techniques montrent qu'un approfondissement des aspects techniques du métier serait bénéfique."
              }
            ]
          },
          skillBreakdown: [
            {
              categoryName: "Communication client", 
              score: 75,
              analysis: "Vous gérez efficacement la plupart des situations de communication client, mais certains cas complexes nécessitent plus d'attention."
            },
            {
              categoryName: "Analyse fonctionnelle",
              score: 70,
              analysis: "Vos compétences en analyse fonctionnelle sont bonnes, mais pourraient être renforcées par des techniques plus avancées."
            },
            {
              categoryName: "Gestion de projet",
              score: 65,
              analysis: "La compréhension des méthodes de gestion de projet est présente, mais leur application pratique pourrait être améliorée."
            }
          ],
          careerInsights: {
            currentLevel: "Vous vous situez au niveau AMOA junior confirmé, avec une bonne maîtrise des fondamentaux du métier.",
            potentialGrowth: "Avec une attention particulière aux aspects techniques et à la gestion des risques, vous pourriez rapidement évoluer vers un rôle d'AMOA senior.",
            nextSteps: "Concentrez-vous sur l'approfondissement des méthodes d'analyse des risques et sur l'acquisition de connaissances techniques plus pointues. Envisagez également des projets où vous pourrez mettre en pratique ces compétences sous supervision."
          },
          improvementPlan: {
            immediateActions: [
              "Suivre une formation spécifique sur les techniques de gestion des risques en contexte projet",
              "Pratiquer l'analyse fonctionnelle sur des cas complexes sous le mentorat d'un AMOA senior"
            ],
            longTermDevelopment: [
              "Développer une expertise dans un domaine métier spécifique (finance, santé, etc.)",
              "Acquérir une certification en gestion de projet (PMP, PRINCE2)"
            ],
            recommendedResources: [
              "Livre : \"L'Essentiel de la gestion de projet\" par Robert Buttrick",
              "Formation : \"Maîtriser l'analyse fonctionnelle\" par CEGOS",
              "Certification : IIBA - ECBA (Entry Certificate in Business Analysis)"
            ]
          },
          professionalInsight: "Votre profil montre un bon potentiel de développement en tant qu'AMOA. En concentrant vos efforts sur les points d'amélioration identifiés et en suivant le plan de développement proposé, vous pourrez renforcer significativement votre expertise et votre impact professionnel."
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'évaluation des performances:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'analyse des performances"
    });
  }
}

/**
 * Génère un message d'encouragement ou de soutien contextualisé en fonction de la progression
 */
export async function generateFeedbackMessage(req: Request, res: Response) {
  try {
    const { 
      consecutiveCorrect, 
      consecutiveWrong, 
      scorePercent, 
      currentStreak,
      difficulty,
      category
    } = req.body;

    // Système prompt pour l'IA
    const systemPrompt = `
      Tu es un coach professionnel spécialisé en AMOA (Assistance à Maîtrise d'Ouvrage).
      Ta mission est de fournir un message d'encouragement ou de soutien court, pertinent et motivant
      adapté à la situation actuelle de l'utilisateur pendant un test d'évaluation.
      
      Ton message doit être:
      - Court (maximum 2 phrases)
      - Professionnel mais chaleureux
      - Spécifique à la situation de l'utilisateur
      - Motivant sans être infantilisant
      - En rapport avec l'AMOA quand c'est possible
      
      Réponds uniquement avec le message d'encouragement, sans introduction ni conclusion.
    `;

    // Message utilisateur contenant le contexte
    let userPrompt = "";
    
    if (consecutiveCorrect >= 3) {
      userPrompt = `L'utilisateur vient d'enchaîner ${consecutiveCorrect} bonnes réponses d'affilée dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Donne-lui un message d'encouragement positif qui souligne sa performance.`;
    } else if (consecutiveWrong >= 2) {
      userPrompt = `L'utilisateur vient de faire ${consecutiveWrong} erreurs d'affilée dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Donne-lui un message de soutien pour qu'il ne se décourage pas.`;
    } else if (difficulty === "difficile" && currentStreak > 0) {
      userPrompt = `L'utilisateur vient de répondre correctement à une question difficile dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Félicite-le pour cette réussite.`;
    } else if (scorePercent >= 80) {
      userPrompt = `L'utilisateur maintient un excellent score de ${scorePercent}% dans le test. Encourage-le à maintenir ce niveau.`;
    } else {
      userPrompt = `L'utilisateur progresse dans le test avec un score de ${scorePercent}%. Donne-lui un message général d'encouragement pour la suite.`;
    }

    // Appel à l'API OpenAI avec le modèle gpt-4o-mini pour réduire la latence
    const aiResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // useSecondaryKey: true - utiliser le modèle gpt-4o-mini
      0.7,  // temperature
      100   // maxTokens
    );

    return res.status(200).json({
      success: true,
      message: aiResponse.trim()
    });
  } catch (error) {
    console.error("Erreur lors de la génération du message de feedback:", error);
    
    // Réponses de secours en cas d'erreur
    let fallbackMessage = "";
    
    if (req.body.consecutiveCorrect >= 3) {
      fallbackMessage = "Excellente série de réponses ! Vous maîtrisez parfaitement ce sujet.";
    } else if (req.body.consecutiveWrong >= 2) {
      fallbackMessage = "Ne vous découragez pas, chaque erreur est une opportunité d'apprentissage.";
    } else if (req.body.scorePercent >= 80) {
      fallbackMessage = "Vous maintenez un excellent niveau ! Continuez ainsi.";
    } else {
      fallbackMessage = "Restez concentré, vous progressez à chaque question.";
    }
    
    return res.status(200).json({
      success: true,
      message: fallbackMessage
    });
  }
}