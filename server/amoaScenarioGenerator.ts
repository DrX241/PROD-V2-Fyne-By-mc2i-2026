import { Request, Response } from 'express';
import { openAIService } from '../I_AM_CYBER/services/openai';
import { ChatCompletionRequestMessage } from '../shared/schema';
import { extractJsonFromOpenAiResponse } from './openAiResponseHelper';

/**
 * Génère dynamiquement un nouveau scénario pour le jeu "Qui est l'imposteur ?"
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    // Validation du niveau de difficulté
    let { difficultyLevel = 'moyen' } = req.body;
    
    // S'assurer que la difficulté est une valeur valide
    if (!['facile', 'moyen', 'difficile'].includes(difficultyLevel)) {
      difficultyLevel = 'moyen';
      console.log(`Difficulté non valide, utilisation de la valeur par défaut: ${difficultyLevel}`);
    }
    
    const systemPrompt = `
      Tu es un générateur de scénarios courts pour un jeu d'investigation AMOA.
      
      CONSIGNES SIMPLIFIÉES :
      - Contexte: projets AMOA informatiques en France
      - Structure: 5 membres d'équipe avec fonctions différentes, dont un coupable
      - Contenu: 5-6 preuves (emails, documents) avec indices
      - Difficulté: ${difficultyLevel} (facile = indices explicites, difficile = indices subtils)
      - Format: UNIQUEMENT JSON sans texte supplémentaire, structure exacte fournie
      - Spécificité: noms français variés, preuves avec indices simples mais cohérents
      
      RAPPEL IMPORTANT:
      - Créer un scénario COURT et CONCIS
      - Respecter exactement le format fourni
      - Générer un contenu RAPIDE à lire
    `;

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
          // Réduire les tokens pour accélérer la génération
          const generatedContent = await openAIService.getChatCompletion(
            messages,
            randomTemp,
            1200 - (retryCount * 200) // Réduire encore le nombre de tokens en cas de retry
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
    
    try {
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
      
      res.json(scenarioData);
    } catch (error: unknown) {
      console.error("Erreur de génération du scénario:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      // Message d'erreur plus convivial pour l'utilisateur
      res.status(500).json({
        error: "Échec de la génération du scénario",
        details: errorMessage
      });
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la génération du scénario:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      error: "Erreur lors de la génération du scénario",
      details: errorMessage
    });
  }
}