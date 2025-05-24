import { Request, Response } from "express";
import { db } from "../db";
import { cyberModules, cyberModuleProgress, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { OpenAI } from "openai";

// Configuration pour Azure OpenAI
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT || undefined,
  defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT 
    ? { 'api-key': process.env.AZURE_OPENAI_API_KEY } 
    : undefined,
  defaultQuery: process.env.AZURE_OPENAI_ENDPOINT 
    ? { 'api-version': '2023-05-15' } 
    : undefined
});

// Modèle à utiliser (Azure OpenAI ou OpenAI standard)
const MODEL_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";

// Récupérer tous les modules de cybersécurité
export const getAllCyberModules = async (req: Request, res: Response) => {
  try {
    const modules = await db.select().from(cyberModules);
    return res.status(200).json(modules);
  } catch (error) {
    console.error("Error fetching cyber modules:", error);
    return res.status(500).json({ error: "Failed to fetch cyber modules" });
  }
};

// Récupérer un module de cybersécurité par ID
export const getCyberModuleById = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const [module] = await db
      .select()
      .from(cyberModules)
      .where(eq(cyberModules.moduleId, moduleId));

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    return res.status(200).json(module);
  } catch (error) {
    console.error(`Error fetching cyber module with ID ${req.params.moduleId}:`, error);
    return res.status(500).json({ error: "Failed to fetch cyber module" });
  }
};

// Récupérer la progression d'un utilisateur pour un module de cybersécurité
export const getUserCyberModuleProgress = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    
    // Vérifier que l'utilisateur existe
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Récupérer la progression de l'utilisateur pour ce module
    const [progress] = await db
      .select()
      .from(cyberModuleProgress)
      .where(
        and(
          eq(cyberModuleProgress.userId, parseInt(userId)),
          eq(cyberModuleProgress.moduleId, moduleId)
        )
      );

    // Si aucune progression n'existe, créer une nouvelle entrée
    if (!progress) {
      const newProgress = {
        userId: parseInt(userId),
        moduleId,
        progress: 0,
        points: 0,
        currentLevel: 1,
        completedSections: [],
        quizResults: {},
        scenarioDecisions: {},
        aiInteractions: []
      };

      const [createdProgress] = await db
        .insert(cyberModuleProgress)
        .values(newProgress)
        .returning();

      return res.status(200).json(createdProgress);
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error(`Error fetching user progress for module ${req.params.moduleId}:`, error);
    return res.status(500).json({ error: "Failed to fetch user progress" });
  }
};

// Mettre à jour la progression d'un utilisateur pour un module de cybersécurité
export const updateUserCyberModuleProgress = async (req: Request, res: Response) => {
  try {
    const { userId, moduleId } = req.params;
    const { 
      progress, 
      points, 
      currentLevel, 
      completedSections, 
      quizResults, 
      scenarioDecisions,
      aiInteractions
    } = req.body;

    // Vérifier que l'utilisateur existe
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Vérifier que le module existe
    const [module] = await db.select().from(cyberModules).where(eq(cyberModules.moduleId, moduleId));
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Vérifier si une progression existe déjà pour cet utilisateur et ce module
    const [existingProgress] = await db
      .select()
      .from(cyberModuleProgress)
      .where(
        and(
          eq(cyberModuleProgress.userId, parseInt(userId)),
          eq(cyberModuleProgress.moduleId, moduleId)
        )
      );

    let updatedProgress;

    if (existingProgress) {
      // Mettre à jour la progression existante
      [updatedProgress] = await db
        .update(cyberModuleProgress)
        .set({
          progress: progress !== undefined ? progress : existingProgress.progress,
          points: points !== undefined ? points : existingProgress.points,
          currentLevel: currentLevel !== undefined ? currentLevel : existingProgress.currentLevel,
          completedSections: completedSections !== undefined ? completedSections : existingProgress.completedSections,
          quizResults: quizResults !== undefined ? quizResults : existingProgress.quizResults,
          scenarioDecisions: scenarioDecisions !== undefined ? scenarioDecisions : existingProgress.scenarioDecisions,
          aiInteractions: aiInteractions !== undefined ? aiInteractions : existingProgress.aiInteractions,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(cyberModuleProgress.userId, parseInt(userId)),
            eq(cyberModuleProgress.moduleId, moduleId)
          )
        )
        .returning();
    } else {
      // Créer une nouvelle progression
      [updatedProgress] = await db
        .insert(cyberModuleProgress)
        .values({
          userId: parseInt(userId),
          moduleId,
          progress: progress || 0,
          points: points || 0,
          currentLevel: currentLevel || 1,
          completedSections: completedSections || [],
          quizResults: quizResults || {},
          scenarioDecisions: scenarioDecisions || {},
          aiInteractions: aiInteractions || [],
        })
        .returning();
    }

    return res.status(200).json(updatedProgress);
  } catch (error) {
    console.error(`Error updating user progress for module ${req.params.moduleId}:`, error);
    return res.status(500).json({ error: "Failed to update user progress" });
  }
};

// Obtenir des conseils personnalisés via Azure OpenAI en fonction de la progression de l'utilisateur
export const getAIPersonalizedFeedback = async (req: Request, res: Response) => {
  try {
    if (!openAIClient) {
      return res.status(503).json({ 
        error: "AI service is not available", 
        message: "L'assistant IA n'est pas disponible pour le moment. Veuillez réessayer plus tard."
      });
    }

    const { userId, moduleId } = req.params;
    const { userInput, context } = req.body;

    // Récupérer les données du module
    const [module] = await db
      .select()
      .from(cyberModules)
      .where(eq(cyberModules.moduleId, moduleId));

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Récupérer la progression de l'utilisateur
    const [progress] = await db
      .select()
      .from(cyberModuleProgress)
      .where(
        and(
          eq(cyberModuleProgress.userId, parseInt(userId)),
          eq(cyberModuleProgress.moduleId, moduleId)
        )
      );

    // Préparer le contexte pour l'IA
    const systemPrompt = `
      Tu es un expert en cybersécurité servant d'assistant pédagogique pour le module "${module.title}".
      Ton objectif est d'aider l'apprenant à comprendre les concepts de cybersécurité de manière claire et précise.
      
      Contexte du module :
      ${module.description}
      
      Niveau de l'apprenant : ${progress?.currentLevel || 1}
      Progression actuelle : ${progress?.progress || 0}%
      
      Réponds de manière concise, pédagogique et précise. Utilise des exemples concrets pour illustrer tes explications.
      Si tu ne connais pas la réponse, dis-le clairement plutôt que d'inventer des informations incorrectes.
    `;

    // Appeler Azure OpenAI
    const result = await openAIClient.getChatCompletions(
      azureOpenAIDeploymentName!,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput || "Peux-tu me donner des conseils sur ce module?" }
      ],
      {
        maxTokens: 500,
        temperature: 0.7
      }
    );

    // Extraire la réponse
    const aiResponse = result.choices[0]?.message?.content || 
      "Je ne peux pas vous aider pour le moment. Veuillez réessayer plus tard.";

    // Si l'utilisateur a une progression, enregistrer cette interaction
    if (progress) {
      await db
        .update(cyberModuleProgress)
        .set({
          aiInteractions: [
            ...(progress.aiInteractions || []),
            {
              timestamp: new Date().toISOString(),
              userInput: userInput || "Question générale",
              aiResponse,
              context: context || "general"
            }
          ],
          updatedAt: new Date()
        })
        .where(
          and(
            eq(cyberModuleProgress.userId, parseInt(userId)),
            eq(cyberModuleProgress.moduleId, moduleId)
          )
        );
    }

    return res.status(200).json({ 
      response: aiResponse, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error getting AI personalized feedback:", error);
    return res.status(500).json({ error: "Failed to get AI feedback" });
  }
};

// Générer un scénario d'entraînement personnalisé avec Azure OpenAI
export const generateTrainingScenario = async (req: Request, res: Response) => {
  try {
    if (!openAIClient) {
      return res.status(503).json({ 
        error: "AI service is not available", 
        message: "Le générateur de scénarios n'est pas disponible pour le moment. Veuillez réessayer plus tard." 
      });
    }

    const { moduleId } = req.params;
    const { difficultyLevel, focus } = req.body;

    // Récupérer les données du module
    const [module] = await db
      .select()
      .from(cyberModules)
      .where(eq(cyberModules.moduleId, moduleId));

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Préparer le prompt pour générer un scénario
    const systemPrompt = `
      Tu es un expert en cybersécurité chargé de créer des scénarios d'entraînement réalistes pour le module "${module.title}".
      
      Crée un scénario d'entraînement de niveau ${difficultyLevel || "intermédiaire"} qui se concentre sur ${focus || "les principes généraux de cybersécurité"}.
      
      Le scénario doit inclure:
      1. Une mise en situation réaliste en entreprise
      2. Un problème de cybersécurité à résoudre
      3. Plusieurs options de décision (entre 2 et 4)
      4. Pour chaque option, une explication des conséquences
      5. L'option recommandée avec justification
      
      Réponds au format JSON avec la structure suivante:
      {
        "title": "Titre du scénario",
        "description": "Description détaillée de la situation",
        "context": "Contexte de l'entreprise",
        "problem": "Problème à résoudre",
        "options": [
          {
            "id": "A",
            "text": "Description de l'option A",
            "consequences": "Conséquences de ce choix",
            "points": 5 (entre 0 et 10)
          },
          ...
        ],
        "recommendedOption": "ID de l'option recommandée",
        "explanation": "Explication de la recommandation"
      }
    `;

    // Appeler Azure OpenAI
    const result = await openAIClient.getChatCompletions(
      azureOpenAIDeploymentName!,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Génère un scénario pour le module ${module.title} avec niveau ${difficultyLevel || "intermédiaire"} sur ${focus || "les principes généraux"}.` }
      ],
      {
        maxTokens: 1000,
        temperature: 0.7,
        responseFormat: { type: "json_object" }
      }
    );

    // Extraire et parser la réponse JSON
    const responseContent = result.choices[0]?.message?.content || "{}";
    let scenario;
    
    try {
      scenario = JSON.parse(responseContent);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      return res.status(500).json({ error: "Failed to generate valid scenario" });
    }

    return res.status(200).json(scenario);
  } catch (error) {
    console.error("Error generating training scenario:", error);
    return res.status(500).json({ error: "Failed to generate training scenario" });
  }
};

// Répondre à une question spécifique sur le contenu du module
export const answerModuleQuestion = async (req: Request, res: Response) => {
  try {
    if (!openAIClient) {
      return res.status(503).json({ 
        error: "AI service is not available", 
        message: "L'assistant IA n'est pas disponible pour le moment. Veuillez réessayer plus tard."
      });
    }

    const { moduleId } = req.params;
    const { question, section } = req.body;

    // Récupérer les données du module
    const [module] = await db
      .select()
      .from(cyberModules)
      .where(eq(cyberModules.moduleId, moduleId));

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Identifier le contenu de la section spécifique si fourni
    let sectionContent = "";
    if (section && module.sections) {
      const sectionData = module.sections.find((s: any) => s.id === section);
      if (sectionData) {
        sectionContent = `Section spécifique: ${sectionData.title}
        Contenu: ${sectionData.content}`;
      }
    }

    // Préparer le prompt pour répondre à la question
    const systemPrompt = `
      Tu es un expert en cybersécurité servant d'assistant pédagogique pour le module "${module.title}".
      
      Description du module:
      ${module.description}
      
      ${sectionContent}
      
      Réponds à la question de l'apprenant de manière précise, pédagogique et concise.
      Utilise des exemples concrets si cela peut aider à la compréhension.
      Si tu ne connais pas la réponse, dis-le clairement plutôt que d'inventer des informations.
    `;

    // Appeler Azure OpenAI
    const result = await openAIClient.getChatCompletions(
      azureOpenAIDeploymentName!,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: question || "Peux-tu m'expliquer ce module?" }
      ],
      {
        maxTokens: 500,
        temperature: 0.7
      }
    );

    // Extraire la réponse
    const answer = result.choices[0]?.message?.content || 
      "Je ne peux pas répondre à cette question pour le moment. Veuillez réessayer plus tard.";

    return res.status(200).json({ 
      question, 
      answer,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error answering module question:", error);
    return res.status(500).json({ error: "Failed to answer question" });
  }
};