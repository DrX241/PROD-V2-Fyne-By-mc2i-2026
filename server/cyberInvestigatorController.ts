import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { db } from './db';
import { investigationProgress, InsertInvestigationProgress } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Génère des notes d'investigation avancées avec GPT-4o
 * Cette fonction permet de générer du contenu pour aider l'utilisateur
 * dans la rédaction de ses notes d'enquête
 */
export async function generateInvestigationNotes(req: Request, res: Response) {
  try {
    const { prompt, evidences, suspects, currentLevel } = req.body;
    
    // Vérifier qu'on a au moins un prompt
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt requis pour générer du contenu" });
    }
    
    // Construire un prompt riche avec le contexte
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en investigation de cybersécurité spécialisé dans l'analyse des fuites de données. 
        Tu aides l'utilisateur à générer des notes d'enquête structurées et pertinentes pour le niveau ${currentLevel || "Débutant"}.
        Ton analyse doit être méthodique, précise et basée sur les éléments de preuve.
        IMPORTANT: Ne jamais commencer par "Voici une analyse" ou similaire, rédige directement le contenu comme si c'était les notes de l'utilisateur.`
      },
      {
        role: "user",
        content: `${prompt}
        
        ${evidences ? `Voici les preuves que j'ai analysées jusqu'à présent:
        ${JSON.stringify(evidences, null, 2)}` : ""}
        
        ${suspects ? `Voici les suspects identifiés:
        ${JSON.stringify(suspects, null, 2)}` : ""}`
      }
    ];
    
    // Appel à l'API OpenAI avec le modèle principal (GPT-4o) pour une meilleure qualité
    const notesContent = await openAIService.getChatCompletionWithModel(
      messages,
      0.7,
      1500,
      true // Utiliser GPT-4o au lieu de GPT-4o-mini
    );
    
    return res.json({
      success: true,
      content: notesContent
    });
  } catch (error) {
    console.error("Erreur lors de la génération des notes:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la génération des notes d'enquête"
    });
  }
}

// Types pour les preuves et suspects
interface Evidence {
  id: string;
  title: string;
  type: string;
  content: string;
  timestamp?: string;
  tags?: string[];
  relevance?: string;
  analyzed: boolean;
}

interface Suspect {
  id: string;
  name: string;
  role: string;
  motif?: string;
  notes?: string;
  indicators?: string[];
  is_culprit?: boolean;
  suspicionLevel: number;
}

/**
 * Génère une analyse IA des preuves dans le cadre de l'enquête
 */
export async function analyzeEvidence(req: Request, res: Response) {
  try {
    const { evidenceId, evidenceContent, caseContext, userNotes } = req.body;

    if (!evidenceId || !evidenceContent) {
      return res.status(400).json({
        error: 'Paramètres manquants'
      });
    }

    // Construction du prompt pour l'analyse IA des preuves
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en investigation numérique et cybersécurité, spécialisé dans l'analyse des fuites de données. 
        Tu aides un apprenti enquêteur à analyser des preuves numériques dans un scénario éducatif.
        
        Tu dois analyser la preuve fournie et donner une analyse professionnelle qui:
        1. Explique en détail ce que révèle la preuve
        2. Identifie des éléments suspects ou pertinents que l'enquêteur pourrait avoir manqués
        3. Fait des connexions avec d'autres éléments potentiels de l'enquête
        4. Explique l'importance de ce type de preuve dans des enquêtes réelles
        5. Fournit des conseils pédagogiques sur les meilleures pratiques d'analyse

        Réponds dans un format structuré et professionnel, comme un véritable expert en cybersécurité.
        Ta réponse doit être pédagogique et instructive tout en restant accessible.`
      },
      {
        role: "user",
        content: `Voici une preuve dans le cadre d'une enquête sur une fuite de données confidentielles:
        
        ID de la preuve: ${evidenceId}
        
        Contenu:
        ${evidenceContent}
        
        Contexte de l'enquête: ${caseContext || "Enquête sur une fuite de données confidentielles dans une entreprise tech."}
        
        ${userNotes ? `Mes notes actuelles: ${userNotes}` : ""}
        
        Merci de fournir une analyse complète de cette preuve.`
      }
    ];

    // Appel à l'API OpenAI
    const analysisContent = await openAIService.getChatCompletion(
      messages,
      0.7,
      1500
    );

    return res.status(200).json({
      success: true,
      analysis: analysisContent
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'analyse IA des preuves:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'analyse des preuves',
      details: errorMessage
    });
  }
}

/**
 * Génère des indices et conseils IA basés sur la progression de l'enquête
 */
export async function getInvestigationHints(req: Request, res: Response) {
  try {
    const { analyzedEvidences, suspectProfiles, userNotes, caseContext } = req.body;

    if (!analyzedEvidences || !suspectProfiles) {
      return res.status(400).json({
        error: 'Paramètres manquants'
      });
    }

    // Construction du prompt pour les indices IA
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un mentor expert en cybersécurité et investigation numérique, guidant un apprenti enquêteur.
        
        En te basant sur la progression de l'enquête, tu dois:
        1. Identifier les connexions que l'enquêteur pourrait ne pas avoir remarqué
        2. Suggérer des preuves à analyser en priorité
        3. Indiquer des éléments suspects dans les profils des personnes concernées
        4. Fournir des conseils méthodologiques pour améliorer l'enquête
        5. Poser des questions réflexives pour guider leur raisonnement sans donner la réponse

        Ton objectif est pédagogique: aider l'enquêteur à développer ses compétences d'analyse et de déduction.
        Ne révèle jamais directement le coupable, mais guide progressivement l'enquêteur vers la solution.`
      },
      {
        role: "user",
        content: `Voici l'état actuel de mon enquête sur une fuite de données:
        
        Contexte: ${caseContext || "Enquête sur une fuite de données confidentielles dans une entreprise tech."}
        
        Preuves analysées: 
        ${JSON.stringify(analyzedEvidences, null, 2)}
        
        Profils des suspects:
        ${JSON.stringify(suspectProfiles, null, 2)}
        
        ${userNotes ? `Mes notes: ${userNotes}` : ""}
        
        Merci de me fournir des conseils pour avancer dans mon enquête.`
      }
    ];

    // Appel à l'API OpenAI
    const hintsContent = await openAIService.getChatCompletion(
      messages,
      0.7,
      1500
    );

    return res.status(200).json({
      success: true,
      hints: hintsContent
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la génération des indices IA:', error);
    return res.status(500).json({
      error: 'Erreur lors de la génération des indices',
      details: errorMessage
    });
  }
}

/**
 * Évalue les conclusions et l'accusation de l'utilisateur
 */
export async function evaluateInvestigationResult(req: Request, res: Response) {
  try {
    const { accusedSuspectId, suspectProfiles, analyzedEvidences, userNotes, caseContext } = req.body;

    if (!accusedSuspectId || !suspectProfiles || !analyzedEvidences) {
      return res.status(400).json({
        error: 'Paramètres manquants'
      });
    }

    // Construction du prompt pour l'évaluation IA
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en investigation numérique et cybersécurité, chargé d'évaluer les conclusions 
        d'un apprenti enquêteur dans un scénario éducatif.
        
        Tu dois évaluer la pertinence de l'accusation de l'enquêteur et fournir:
        1. Une analyse détaillée de la décision (forces, faiblesses)
        2. Des explications sur les preuves corroborant ou contredisant cette conclusion
        3. Des recommandations sur les preuves qui auraient dû être mieux analysées
        4. Une évaluation globale du travail d'enquête (1 à 5 étoiles)
        5. Des conseils d'amélioration précis pour de futures enquêtes
        
        L'objectif est pédagogique. Sois constructif même si l'accusation est erronée.
        Fournis un retour qui valorise les bonnes déductions tout en identifiant les erreurs.
        
        Réponds au format JSON avec les champs suivants:
        {
          "evaluation": {
            "score": (note sur 5),
            "title": (titre résumant l'évaluation),
            "summary": (résumé succinct),
            "reasoning": (analyse détaillée),
            "strengths": [(points forts)],
            "weaknesses": [(points faibles)],
            "evidence_analysis": (analyse des preuves),
            "improvement_tips": [(conseils d'amélioration)]
          },
          "learning_takeaways": [(points d'apprentissage clés)]
        }`
      },
      {
        role: "user",
        content: `Voici les conclusions de mon enquête sur une fuite de données:
        
        Contexte: ${caseContext || "Enquête sur une fuite de données confidentielles dans une entreprise tech."}
        
        J'accuse le suspect: ${accusedSuspectId}
        
        Profils des suspects:
        ${JSON.stringify(suspectProfiles, null, 2)}
        
        Preuves analysées: 
        ${JSON.stringify(analyzedEvidences, null, 2)}
        
        ${userNotes ? `Mes notes d'enquête: ${userNotes}` : ""}
        
        Merci d'évaluer ma conclusion et me fournir un retour détaillé.`
      }
    ];

    // Appel à l'API OpenAI
    const evaluationContent = await openAIService.getChatCompletion(
      messages,
      0.7,
      2000
    );

    // Extraire le JSON de la réponse
    let parsedEvaluation;
    try {
      // Rechercher d'abord les délimiteurs de code JSON
      const jsonMatch = evaluationContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
        parsedEvaluation = JSON.parse(jsonContent);
      } else {
        // Si pas de délimiteurs, essayer de parser directement
        parsedEvaluation = JSON.parse(evaluationContent);
      }
    } catch (jsonError) {
      console.error("Erreur lors du parsing du JSON d'évaluation:", jsonError);
      // Créer une évaluation par défaut
      parsedEvaluation = {
        evaluation: {
          score: 3,
          title: "Évaluation de votre conclusion d'enquête",
          summary: "Analyse de votre travail d'investigation",
          reasoning: evaluationContent,
          strengths: ["Points identifiés dans l'enquête"],
          weaknesses: ["Éléments qui auraient pu être mieux analysés"],
          evidence_analysis: "Voir le détail de l'analyse",
          improvement_tips: ["Conseil méthodologique pour progresser"]
        },
        learning_takeaways: [
          "L'importance de l'analyse systématique des preuves",
          "La corrélation des indices est essentielle"
        ]
      };
    }

    return res.status(200).json({
      success: true,
      evaluation: parsedEvaluation
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'évaluation de l\'enquête:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'évaluation de l\'enquête',
      details: errorMessage
    });
  }
}

/**
 * Évalue les notes d'enquête de l'utilisateur avec l'IA
 * Cette fonction analyse les notes prises par l'utilisateur pendant l'enquête,
 * évalue leur pertinence et détermine si l'utilisateur peut progresser au niveau suivant.
 */
export async function evaluateUserNotes(req: Request, res: Response) {
  try {
    const { 
      userId, 
      userName, 
      gameId, 
      currentLevel, 
      notes, 
      evidencesAnalyzed, 
      totalEvidences, 
      accusedSuspect, 
      correctSuspect, 
      suspects,
      sessionId 
    } = req.body;

    if (!userId || !gameId || !notes || !currentLevel) {
      return res.status(400).json({
        error: 'Paramètres manquants pour l\'évaluation des notes'
      });
    }

    // Calculer le pourcentage de preuves analysées
    const evidenceCompletionRate = totalEvidences ? (evidencesAnalyzed / totalEvidences) * 100 : 0;
    
    // Déterminer si l'accusation est correcte
    const accusationCorrect = accusedSuspect === correctSuspect;
    
    // Construction du prompt pour l'évaluation des notes par l'IA
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en cybersécurité et investigation numérique, évaluant les compétences d'un apprenti enquêteur.
        
        Ton rôle est d'analyser en détail les notes qu'il a prises pendant son enquête sur une fuite de données.
        
        Évalue la qualité de son travail investigatif selon ces critères:
        1. Identification des indices clés liés à l'incident (accès aux serveurs, téléchargements suspects, etc.)
        2. Connexions établies entre différents éléments de preuve
        3. Rigueur méthodologique et démarche structurée
        4. Pertinence des observations concernant les suspects
        5. Justification de ses conclusions
        
        Évalue également s'il est prêt à progresser d'un niveau dans sa formation:
        - Niveau actuel: "${currentLevel}" (peut être "Débutant", "Intermédiaire" ou "Expert")
        - Progression possible: Débutant → Intermédiaire → Expert
        
        Réponds au format JSON avec cette structure précise:
        {
          "analysis": "Analyse détaillée des notes de l'enquêteur",
          "strengths": ["Point fort 1", "Point fort 2", ...],
          "weaknesses": ["Faiblesse 1", "Faiblesse 2", ...],
          "progression": {
            "canProgress": true/false,
            "recommendedLevel": "Niveau recommandé (Débutant/Intermédiaire/Expert)",
            "justification": "Explication de la recommandation"
          },
          "score": Valeur numérique entre 0 et 100
        }`
      },
      {
        role: "user",
        content: `Je suis ${userName || "un utilisateur"}, de niveau ${currentLevel} dans le jeu d'investigation "${gameId}".
        
        Voici mes notes d'enquête:
        """
        ${notes}
        """
        
        Informations sur mon enquête:
        - J'ai analysé ${evidencesAnalyzed || 0} preuves sur ${totalEvidences || 0} (${Math.round(evidenceCompletionRate)}%)
        - J'ai accusé le suspect: ${accusedSuspect || "Aucun"}
        - Le véritable coupable était: ${correctSuspect}
        
        ${suspects ? `Informations sur les suspects:
        ${JSON.stringify(suspects, null, 2)}` : ""}
        
        Merci d'évaluer la qualité de mon travail d'investigation et de déterminer si je suis prêt à progresser vers le niveau supérieur.`
      }
    ];

    // Appel à l'API OpenAI
    const evaluationContent = await openAIService.getChatCompletion(
      messages,
      0.7,
      2000
    );

    // Extraire le JSON de la réponse
    let parsedEvaluation;
    try {
      // Rechercher d'abord les délimiteurs de code JSON
      const jsonMatch = evaluationContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
        parsedEvaluation = JSON.parse(jsonContent);
      } else {
        // Si pas de délimiteurs, essayer de parser directement
        parsedEvaluation = JSON.parse(evaluationContent);
      }
    } catch (jsonError) {
      console.error("Erreur lors du parsing du JSON d'évaluation des notes:", jsonError);
      // Créer une évaluation par défaut si le parsing échoue
      parsedEvaluation = {
        analysis: "Analyse des notes d'investigation effectuée.",
        strengths: ["Prise de notes pendant l'enquête"],
        weaknesses: ["Les notes pourraient être plus structurées"],
        progression: {
          canProgress: false,
          recommendedLevel: currentLevel,
          justification: "Continue à développer tes compétences d'analyse"
        },
        score: 50
      };
    }

    // Sauvegarder la progression dans la base de données
    try {
      // Détecter si c'est la première tentative ou une mise à jour
      const bestScore = parsedEvaluation.score || 50;
      
      const progressData: InsertInvestigationProgress = {
        userId,
        userName: userName || 'Anonymous User',
        gameId,
        currentLevel,
        score: bestScore,
        bestScore,
        attempts: 1,
        lastPlayed: new Date(),
        notes: notes,
        evaluationData: parsedEvaluation,
        sessionId: sessionId || `session_${Date.now()}`
      };
      
      // Vérifier si une progression existe déjà pour cet utilisateur et ce jeu
      const existingProgress = await db.select()
        .from(investigationProgress)
        .where(
          and(
            eq(investigationProgress.userId, progressData.userId),
            eq(investigationProgress.gameId, progressData.gameId)
          )
        );
      
      if (existingProgress.length > 0) {
        // Mettre à jour la progression existante
        const existingBestScore = existingProgress[0].bestScore || 0;
        const currentScore = progressData.score || 0;
        const bestScore = Math.max(existingBestScore, currentScore);
        const existingAttempts = existingProgress[0].attempts || 0;
        const attempts = existingAttempts + 1;
        
        await db.update(investigationProgress)
          .set({
            currentLevel: progressData.currentLevel,
            score: progressData.score,
            bestScore: bestScore,
            attempts: attempts,
            lastPlayed: progressData.lastPlayed,
            notes: progressData.notes,
            evaluationData: progressData.evaluationData,
            sessionId: progressData.sessionId
          })
          .where(
            and(
              eq(investigationProgress.userId, progressData.userId),
              eq(investigationProgress.gameId, progressData.gameId)
            )
          );
      } else {
        // Insérer une nouvelle progression
        await db.insert(investigationProgress).values(progressData);
      }
      
      return res.status(200).json({
        success: true,
        evaluation: parsedEvaluation
      });
    } catch (dbError) {
      console.error("Erreur lors de la sauvegarde de la progression:", dbError);
      
      // Même si la sauvegarde échoue, on retourne l'évaluation à l'utilisateur
      return res.status(200).json({
        success: true,
        evaluation: parsedEvaluation,
        warning: "La progression n'a pas pu être sauvegardée dans la base de données"
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'évaluation des notes d\'enquête:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'évaluation des notes',
      details: errorMessage
    });
  }
}

/**
 * Sauvegarde ou met à jour la progression d'un utilisateur dans un jeu d'investigation
 */
export async function saveInvestigationProgress(req: Request, res: Response) {
  try {
    const { 
      userId, 
      userName, 
      gameId, 
      currentLevel, 
      score, 
      bestScore, 
      attempts,
      sessionId 
    } = req.body;

    if (!userId || !gameId) {
      return res.status(400).json({
        error: 'Identifiants utilisateur et jeu requis'
      });
    }

    // Préparer les données de progression à sauvegarder
    const progressData: InsertInvestigationProgress = {
      userId,
      userName: userName || 'Anonymous User',
      gameId,
      currentLevel: currentLevel || 'Débutant',
      score: score || 0,
      bestScore: bestScore || score || 0,
      attempts: attempts || 1,
      lastPlayed: new Date(),
      notes: req.body.notes || '',
      evaluationData: req.body.evaluationData || null,
      sessionId: sessionId || `session_${Date.now()}`
    };
    
    // Vérifier si une progression existe déjà pour cet utilisateur et ce jeu
    const existingProgress = await db.select()
      .from(investigationProgress)
      .where(
        and(
          eq(investigationProgress.userId, progressData.userId),
          eq(investigationProgress.gameId, progressData.gameId)
        )
      );
    
    if (existingProgress.length > 0) {
      // Mettre à jour la progression existante
      const existingBestScore = existingProgress[0].bestScore || 0;
      const existingAttempts = existingProgress[0].attempts || 0;
      const currentScore = progressData.score || 0;
      
      const bestScore = Math.max(existingBestScore, currentScore);
      const attempts = existingAttempts + 1;
      
      await db.update(investigationProgress)
        .set({
          currentLevel: progressData.currentLevel,
          score: progressData.score,
          bestScore: bestScore,
          attempts: attempts,
          lastPlayed: progressData.lastPlayed,
          notes: progressData.notes,
          evaluationData: progressData.evaluationData,
          sessionId: progressData.sessionId
        })
        .where(
          and(
            eq(investigationProgress.userId, progressData.userId),
            eq(investigationProgress.gameId, progressData.gameId)
          )
        );
    } else {
      // Insérer une nouvelle progression
      await db.insert(investigationProgress).values(progressData);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Progression sauvegardée avec succès'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la sauvegarde de la progression:', error);
    return res.status(500).json({
      error: 'Erreur lors de la sauvegarde de la progression',
      details: errorMessage
    });
  }
}

/**
 * Récupère la progression d'un utilisateur dans un jeu d'investigation spécifique
 */
export async function getInvestigationProgress(req: Request, res: Response) {
  try {
    const { userId, gameId } = req.query;

    if (!userId || !gameId) {
      return res.status(400).json({
        error: 'Identifiants utilisateur et jeu requis'
      });
    }

    // Requête à la base de données pour récupérer la progression
    const progress = await db.select()
      .from(investigationProgress)
      .where(
        and(
          eq(investigationProgress.userId, userId.toString()),
          eq(investigationProgress.gameId, gameId.toString())
        )
      );

    // Si aucune progression n'existe, renvoyer une réponse vide mais valide
    if (progress.length === 0) {
      return res.status(200).json({
        success: true,
        progress: null,
        message: 'Aucune progression trouvée pour cet utilisateur dans ce jeu'
      });
    }

    return res.status(200).json({
      success: true,
      progress: progress[0]
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la récupération de la progression:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération de la progression',
      details: errorMessage
    });
  }
}

export async function generateInvestigationScenario(req: Request, res: Response) {
  try {
    const { difficulty = 'medium', theme = 'data_breach' } = req.body;

    // Construction du prompt pour la génération de scénario
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un concepteur de scénarios d'investigation en cybersécurité pour une plateforme éducative.
        
        Tu dois générer un scénario d'enquête complet incluant:
        1. Un contexte détaillé de l'incident
        2. Des preuves numériques variées (emails, logs, fichiers, etc.)
        3. Des profils de suspects avec des motifs plausibles
        4. Une solution logique avec un coupable clairement identifiable
        
        Le scénario doit être réaliste, cohérent et adapté au niveau de difficulté demandé.
        Il doit comporter suffisamment d'indices pour permettre une résolution, mais nécessiter 
        une véritable réflexion et analyse.
        
        Réponds au format JSON strict avec la structure suivante:
        {
          "scenario": {
            "title": "Titre du scénario",
            "context": "Description détaillée du contexte",
            "difficulty": "easy|medium|hard",
            "theme": "data_breach|malware_attack|insider_threat|social_engineering",
            "victim_organization": {
              "name": "Nom de l'organisation",
              "sector": "Secteur d'activité",
              "size": "Taille (nombre d'employés)",
              "description": "Description de l'organisation"
            }
          },
          "evidences": [
            {
              "id": "ID unique",
              "title": "Titre de la preuve",
              "type": "email|log|file|server|chat",
              "content": "Contenu détaillé de la preuve",
              "timestamp": "Date et heure (si applicable)",
              "tags": ["tag1", "tag2"],
              "relevance": "Pertinence pour l'enquête (non visible par le joueur)"
            }
          ],
          "suspects": [
            {
              "id": "ID unique",
              "name": "Nom complet",
              "role": "Poste dans l'organisation",
              "motif": "Motif potentiel",
              "notes": "Informations contextuelles",
              "indicators": ["Indicateur 1", "Indicateur 2"],
              "is_culprit": true/false
            }
          ],
          "solution": {
            "culprit_id": "ID du coupable",
            "evidence_trail": ["ID preuve 1", "ID preuve 2"],
            "explanation": "Explication détaillée de la solution"
          }
        }`
      },
      {
        role: "user",
        content: `Génère un scénario d'enquête en cybersécurité complet avec les paramètres suivants:
        
        Difficulté: ${difficulty}
        Thème: ${theme}
        
        Assure-toi que:
        - Le scénario est réaliste et éducatif
        - Les preuves sont cohérentes et contiennent des indices subtils
        - Les suspects ont des profils et motifs crédibles
        - La solution est logique et découvrable par analyse des preuves
        
        Fournir au minimum 5-7 preuves et 3-5 suspects.
        
        Merci de générer ce scénario au format JSON requis.`
      }
    ];

    // Appel à l'API OpenAI
    const scenarioContent = await openAIService.getChatCompletion(
      messages,
      0.8,
      4000
    );

    // Extraire le JSON de la réponse
    let parsedScenario;
    try {
      // Rechercher d'abord les délimiteurs de code JSON
      const jsonMatch = scenarioContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
        parsedScenario = JSON.parse(jsonContent);
      } else {
        // Si pas de délimiteurs, essayer de parser directement
        parsedScenario = JSON.parse(scenarioContent);
      }

      // Ajouter le champ analyzed: false à chaque preuve
      if (parsedScenario.evidences) {
        parsedScenario.evidences = parsedScenario.evidences.map((evidence: Evidence) => ({
          ...evidence,
          analyzed: false
        }));
      }

      // Initialiser le niveau de suspicion des suspects
      if (parsedScenario.suspects) {
        parsedScenario.suspects = parsedScenario.suspects.map((suspect: Suspect) => ({
          ...suspect,
          suspicionLevel: 0
        }));
      }

    } catch (jsonError) {
      console.error("Erreur lors du parsing du JSON du scénario:", jsonError);
      return res.status(500).json({
        error: 'Erreur de génération du scénario',
        details: "Impossible de générer un scénario valide"
      });
    }

    return res.status(200).json({
      success: true,
      scenario: parsedScenario
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la génération du scénario d\'enquête:', error);
    return res.status(500).json({
      error: 'Erreur lors de la génération du scénario',
      details: errorMessage
    });
  }
}