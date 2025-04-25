import { Request, Response } from 'express';
import { openAIService } from '../I_AM_CYBER/services/openai';
import { ChatCompletionRequestMessage } from '../shared/schema';
import { extractJsonFromOpenAiResponse } from './openAiResponseHelper';

// Cache pour stocker les scénarios générés
interface ScenarioCache {
  scenarios: any[];
  lastUpdated: number;
  isGenerating: boolean;
}

// Initialisation du cache
const scenarioCache: ScenarioCache = {
  scenarios: [],
  lastUpdated: 0,
  isGenerating: false
};

// Durée de validité du cache en millisecondes (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Génère dynamiquement un nouveau scénario pour le jeu "Qui est l'imposteur ?"
 */
/**
 * Génère un scénario individuel avec les paramètres spécifiés
 * Cette fonction est utilisée à la fois par generateScenario et generateMultipleScenarios
 */
async function generateSingleScenario(difficultyLevel = 'moyen'): Promise<any> {
  // Validation du niveau de difficulté
  if (!['facile', 'moyen', 'difficile'].includes(difficultyLevel)) {
    difficultyLevel = 'moyen';
    console.log(`Difficulté non valide, utilisation de la valeur par défaut: ${difficultyLevel}`);
  }
  
  // Prompt adaptatif selon le niveau de difficulté
  let difficultySpecificInstructions = '';
  
  // Pour le niveau difficile, on ajoute des instructions spécifiques pour une difficulté extrême
  if (difficultyLevel === 'difficile') {
    difficultySpecificInstructions = `
    NIVEAU DIFFICILE - ÉLÉMENTS SPÉCIFIQUES:
    - Inclure des indices CACHÉS dans les documents (initiales, dates significatives, références obscures)
    - Créer des contradictions subtiles entre différents témoignages
    - Ajouter des fausses pistes délibérées
    - Dans certains emails, cacher des détails importants dans des tournures de phrases
    - Utiliser des initiales ou des surnoms qui référencent indirectement des personnes
    - Insérer des détails techniques qui demandent une analyse approfondie
    - Camoufler les erreurs critiques du coupable derrière des apparences de bonne pratique
    `;
  } else if (difficultyLevel === 'facile') {
    difficultySpecificInstructions = `
    NIVEAU FACILE - ÉLÉMENTS SPÉCIFIQUES:
    - Indices très explicites sur le coupable
    - Erreurs flagrantes et facilement identifiables
    - Pas d'ambiguïté dans les documents
    - Relations claires entre les preuves et les personnes
    `;
  } else {
    // Niveau moyen par défaut
    difficultySpecificInstructions = `
    NIVEAU MOYEN - ÉLÉMENTS SPÉCIFIQUES:
    - Indices modérément subtils
    - Quelques détails à analyser, mais repérables
    - Une légère ambiguïté dans certaines preuves
    `;
  }

  const systemPrompt = `
    Tu es un générateur de scénarios courts pour un jeu d'investigation AMOA.
    
    CONSIGNES SIMPLIFIÉES :
    - Contexte: projets AMOA informatiques en France
    - Structure: 5 membres d'équipe avec fonctions différentes, dont un coupable
    - Contenu: 5-6 preuves (emails, documents) avec indices
    - Difficulté: ${difficultyLevel}
    - Format: UNIQUEMENT JSON sans texte supplémentaire, structure exacte fournie
    - Spécificité: noms français variés, preuves avec indices cohérents
    
    ${difficultySpecificInstructions}
    
    RAPPEL IMPORTANT:
    - Créer un scénario COURT et CONCIS
    - Respecter exactement le format fourni
    - Générer un contenu RAPIDE à lire
  `;

  // Adapter les instructions selon le niveau de difficulté
  let specificContentInstructions = '';
  
  if (difficultyLevel === 'difficile') {
    specificContentInstructions = `
    Pour le niveau DIFFICILE:
    - Dans les preuves, cache des indices dans les initiales, dates ou tournures de phrases
    - Crée des contradictions subtiles entre les documents
    - Les documents doivent contenir des éléments techniques qui demandent analyse
    - L'identité du coupable doit être difficile à déterminer sans analyse approfondie
    - Certains emails doivent contenir des détails cachés (dates significatives, références codées)
    - Insère des fausses pistes convaincantes pointant vers des innocents
    `;
  }

  const userPrompt = `
    Génère un scénario court et direct pour le jeu AMOA selon cette structure JSON :
    
    {
      "id": "projet-XXX",
      "title": "Titre court et accrocheur",
      "description": "2 phrases maximum sur l'échec",
      "difficulty": "${difficultyLevel}",
      "failureSummary": "Une phrase concise sur la cause",
      "expectedOutcome": "Objectif simple",
      "team": [
        {
          "id": "tm1", "name": "Prénom Nom", "role": "Fonction",
          "isGuilty": true, "clues": ["Indice 1", "Indice 2"],
          "alibi": "Explication concise"
        },
        {
          "id": "tm2", "name": "Prénom Nom", "role": "Fonction",
          "isGuilty": false, "clues": [], "alibi": "Explication"
        }
      ],
      "evidence": [
        {
          "id": "ev1", "type": "email", "title": "Titre",
          "from": "Expéditeur", "to": "Destinataire", "date": "JJ/MM/AAAA",
          "content": "Contenu bref", "relatedTo": ["tm1", "tm2"]
        }
      ],
      "lessons": ["Leçon 1", "Leçon 2", "Leçon 3"]
    }
    
    IMPORTANT: 5 membres (un coupable), 5-6 preuves courtes, contenu professionnel, JSON valide.
    
    ${specificContentInstructions}
  `;

  // Appel à l'API OpenAI pour générer le scénario via le service openAIService
  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  // Ajout d'une forte randomisation pour garantir des scénarios très différents
  const randomTemp = 0.7 + (Math.random() * 0.25); // Température entre 0.7 et 0.95 pour plus de créativité
  const timestamp = new Date().toISOString();
  
  // Version simplifiée - sélection aléatoire d'un type de scénario et d'un secteur pour guider l'IA
  const types = [
    "cahier des charges incomplet",
    "expression de besoins erronée",
    "échec de recette",
    "mauvaise implémentation",
    "communication défaillante",
    "stratégie erronée",
    "gestion de risques insuffisante",
    "échec d'intégration"
  ];
  
  const secteurs = [
    "banque", 
    "public", 
    "énergie",
    "santé", 
    "assurance", 
    "industrie", 
    "transport"
  ];
  
  // Sélection aléatoire pour plus de variété mais plus simple pour plus de rapidité
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomSecteur = secteurs[Math.floor(Math.random() * secteurs.length)];
  const randomId = Math.floor(Math.random() * 1000);
  
  messages.push({ 
    role: "user", 
    content: `Génère un scénario AMOA unique dans le secteur ${randomSecteur} avec un problème de ${randomType}.
    Temps: ${timestamp}
    ID: projet-${randomId}` 
  });
  
  // Fonction pour réessayer en cas d'échec
  const generateWithRetry = async (maxRetries = 2): Promise<any> => {
    let lastError: Error | null = null;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        // Ajuster les tokens selon la difficulté et le nombre de tentatives
        let maxTokens = 1200;
        
        // Plus de tokens pour le niveau difficile pour permettre des indices cachés et détails complexes
        if (difficultyLevel === 'difficile') {
          maxTokens = 1500;
        } else if (difficultyLevel === 'facile') {
          maxTokens = 1000; // Moins de tokens pour les scénarios faciles
        }
        
        // Réduire le nombre de tokens en cas de retry
        maxTokens = maxTokens - (retryCount * 200);
        
        const generatedContent = await openAIService.getChatCompletion(
          messages,
          randomTemp,
          maxTokens
        );
        
        // Utilisation de l'utilitaire robuste d'extraction JSON
        const scenarioData = extractJsonFromOpenAiResponse(generatedContent || "{}");
        
        // Vérifier si l'extraction a réussi
        if (!scenarioData) {
          throw new Error("Impossible d'extraire un JSON valide de la réponse");
        }
        
        // Validation du format minimal
        if (!scenarioData.title || !scenarioData.team) {
          throw new Error("Format de scénario incorrect - champs requis manquants");
        }
        
        return scenarioData;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Tentative ${retryCount + 1}/${maxRetries + 1} échouée: ${lastError.message}`);
        retryCount++;
        
        // Simplifier le prompt en cas d'échec
        if (retryCount <= maxRetries) {
          messages[0].content = `Tu es un générateur de scénarios simples. Format JSON strict.`;
          messages[1].content = `Génère un scénario AMOA avec 5 membres (un coupable) et 5 preuves. JSON valide.`;
        }
      }
    }
    
    // Si on a épuisé les tentatives, on relance l'erreur
    throw lastError;
  };
  
  // Génération avec retries
  const scenarioData = await generateWithRetry();
  
  // Correction des avatars
  scenarioData.team.forEach((member: any, index: number) => {
    member.avatar = `avatar${index + 1}.svg`;
  });
  
  // S'assurer que l'ID est correctement défini et unique
  if (!scenarioData.id || scenarioData.id === "Un identifiant unique au format projet-XXX" || scenarioData.id === "projet-XXX") {
    scenarioData.id = `projet-${randomId}`;
  }
  
  // S'assurer que le niveau de difficulté est correctement défini
  if (!scenarioData.difficulty || !["facile", "moyen", "difficile"].includes(scenarioData.difficulty)) {
    scenarioData.difficulty = difficultyLevel;
  }
  
  // Compléter les champs manquants avec des valeurs par défaut si nécessaire
  if (!scenarioData.expectedOutcome) {
    scenarioData.expectedOutcome = "Identifier le responsable principal de l'échec du projet";
  }
  
  if (!scenarioData.lessons || !Array.isArray(scenarioData.lessons) || scenarioData.lessons.length === 0) {
    scenarioData.lessons = [
      "Améliorer la communication entre les équipes",
      "Documenter clairement les exigences dès le début",
      "Mettre en place un processus de validation rigoureux"
    ];
  }
  
  return scenarioData;
}

/**
 * Fonction pour générer ou récupérer plusieurs scénarios en utilisant un cache
 * Ces scénarios seront utilisés sur la page d'accueil et rafraîchis automatiquement
 */
export async function getMultipleScenarios(req: Request, res: Response) {
  try {
    const count = parseInt(req.query.count as string) || 10;
    const force = req.query.force === 'true';
    
    // Vérifier si nous avons des scénarios en cache qui sont encore valides
    const now = Date.now();
    const isCacheValid = !force && 
                        scenarioCache.scenarios.length >= count && 
                        (now - scenarioCache.lastUpdated) < CACHE_TTL;
    
    // Si le cache est valide, renvoyer les scénarios du cache
    if (isCacheValid) {
      return res.json({
        scenarios: scenarioCache.scenarios.slice(0, count),
        fromCache: true,
        lastUpdated: new Date(scenarioCache.lastUpdated).toISOString(),
        nextUpdate: new Date(scenarioCache.lastUpdated + CACHE_TTL).toISOString()
      });
    }
    
    // Si une génération est déjà en cours, attendre un peu et renvoyer ce qui est disponible
    if (scenarioCache.isGenerating) {
      // Attendre un peu pour voir si la génération se termine
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Renvoyer ce qui est disponible, même si c'est incomplet ou ancien
      return res.json({
        scenarios: scenarioCache.scenarios.slice(0, count),
        fromCache: true,
        isGenerating: true,
        lastUpdated: new Date(scenarioCache.lastUpdated).toISOString(),
        message: "Génération de nouveaux scénarios en cours, veuillez réessayer dans quelques secondes"
      });
    }
    
    // Marquer comme en cours de génération
    scenarioCache.isGenerating = true;
    
    try {
      // Générer de nouveaux scénarios en parallèle avec diverses difficultés
      const difficulties = ['facile', 'moyen', 'difficile'];
      const generatePromises = [];
      
      // Équilibrer les difficultés parmi les scénarios
      for (let i = 0; i < count; i++) {
        const difficulty = difficulties[i % difficulties.length];
        generatePromises.push(generateSingleScenario(difficulty));
      }
      
      // Attendre que tous les scénarios soient générés
      const newScenarios = await Promise.all(
        generatePromises.map(p => p.catch(err => {
          console.error("Erreur lors de la génération d'un scénario:", err);
          // Retourner null en cas d'erreur pour que le filtre suivant le supprime
          return null;
        }))
      );
      
      // Filtrer les scénarios null (erreurs) et mettre à jour le cache
      const validScenarios = newScenarios.filter(s => s !== null);
      
      if (validScenarios.length > 0) {
        scenarioCache.scenarios = validScenarios;
        scenarioCache.lastUpdated = Date.now();
      }
      
      // Répondre avec les scénarios générés
      res.json({
        scenarios: scenarioCache.scenarios.slice(0, count),
        fromCache: false,
        lastUpdated: new Date(scenarioCache.lastUpdated).toISOString(),
        nextUpdate: new Date(scenarioCache.lastUpdated + CACHE_TTL).toISOString()
      });
    } finally {
      // Marquer comme terminé
      scenarioCache.isGenerating = false;
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération de multiples scénarios:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    // En cas d'erreur, renvoyer ce qui est disponible dans le cache
    if (scenarioCache.scenarios.length > 0) {
      return res.status(207).json({
        scenarios: scenarioCache.scenarios,
        error: "Erreur partielle: " + errorMessage,
        fromCache: true,
        lastUpdated: new Date(scenarioCache.lastUpdated).toISOString()
      });
    }
    
    res.status(500).json({
      error: "Erreur lors de la génération des scénarios",
      details: errorMessage
    });
  }
}

/**
 * Génère dynamiquement un nouveau scénario pour le jeu "Qui est l'imposteur ?"
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    // Récupération du niveau de difficulté depuis la requête
    let { difficultyLevel = 'moyen' } = req.body;
    
    // S'assurer que la difficulté est une valeur valide
    if (!['facile', 'moyen', 'difficile'].includes(difficultyLevel)) {
      difficultyLevel = 'moyen';
      console.log(`Difficulté non valide, utilisation de la valeur par défaut: ${difficultyLevel}`);
    }
    
    // Utilisation de la fonction partagée pour générer un scénario
    const scenarioData = await generateSingleScenario(difficultyLevel);
    
    // Renvoyer le scénario généré
    res.json(scenarioData);
  } catch (error: unknown) {
    console.error("Erreur lors de la génération du scénario:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      error: "Erreur lors de la génération du scénario",
      details: errorMessage
    });
  }
}