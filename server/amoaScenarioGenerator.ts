import { Request, Response } from 'express';
import { openAIService } from '../I_AM_CYBER/services/openai';
import { ChatCompletionRequestMessage } from '../shared/schema';
import { extractJsonFromOpenAiResponse } from './openAiResponseHelper';

/**
 * Génère dynamiquement un nouveau scénario pour le jeu "Qui est l'imposteur ?"
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    const { difficultyLevel = 'moyen' } = req.body;
    
    const systemPrompt = `
      Tu es un expert en scénarisation de cas d'échecs de projets informatiques réalistes pour le jeu "Qui est l'imposteur ?".
      
      RÔLE
      Créer un scénario professionnel d'échec de projet informatique ou de transformation digitale avec des personnages crédibles et des preuves cohérentes qui permettent d'identifier clairement le responsable.
      
      CONTEXTE
      Le jeu "Qui est l'imposteur ?" est une simulation d'investigation professionnelle où le joueur doit analyser des preuves (emails, documents, conversations) pour déterminer quel membre de l'équipe est principalement responsable de l'échec d'un projet.

      CONSIGNES STRICTES :
      - Cadre: uniquement en France ou en Union Européenne, après 2023
      - Contexte: exclusivement professionnel et réaliste
      - Structure: exactement 5 membres d'équipe avec rôles distincts
      - Culpabilité: un seul membre doit être clairement coupable (attribut isGuilty=true)
      - Preuves: 6-8 éléments qui permettent de résoudre l'énigme
      - Équilibre: le cas doit être résolvable mais pas trop évident (difficulté: ${difficultyLevel})
      - Format: répondre UNIQUEMENT en JSON valide et correctement formaté, sans texte d'introduction ni conclusion
      - Cohérence: tous les échanges doivent avoir des dates cohérentes et des références croisées logiques
      
      RÉPONSE FORMAT:
      - Utilise uniquement la syntaxe JSON standard
      - Ne pas inclure de commentaires dans le JSON (pas de "//" ni de "/* */")
      - Ne pas utiliser de retour à la ligne '\n' dans les chaînes de caractères (utiliser des espaces)
      - Pas de texte supplémentaire en dehors de l'objet JSON
    `;

    const userPrompt = `
      Génère un scénario complet pour le jeu "Qui est l'imposteur ?" selon le format JSON spécifié ci-dessous.
      
      Voici la structure exacte à respecter pour la réponse JSON :
      
      {
        "id": "Un identifiant unique au format projet-XXX",
        "title": "Un titre accrocheur évoquant l'échec du projet",
        "description": "Une description détaillée en 2-3 phrases maximum du contexte et de l'échec",
        "difficulty": "${difficultyLevel}",
        "failureSummary": "Un résumé concis des causes principales de l'échec en une phrase",
        "expectedOutcome": "L'objectif du joueur (généralement identifier le responsable)",
        "team": [
          {
            "id": "tm1",
            "name": "Prénom et nom d'une personne (français réaliste)",
            "role": "Poste ou fonction précise dans le projet",
            "avatar": "avatar1.svg",
            "isGuilty": true,
            "clues": [
              "Indice précis pointant vers la culpabilité",
              "Indice précis pointant vers la culpabilité",
              "Indice précis pointant vers la culpabilité"
            ],
            "alibi": "Explication détaillée justifiant la culpabilité"
          },
          {
            "id": "tm2",
            "name": "Prénom et nom d'une personne",
            "role": "Poste ou fonction précise",
            "avatar": "avatar2.svg",
            "isGuilty": false,
            "clues": [],
            "alibi": "Explication démontrant l'innocence"
          }
        ],
        "evidence": [
          {
            "id": "ev1",
            "type": "email",
            "title": "Titre explicite de l'email",
            "from": "Expéditeur (membre de l'équipe)",
            "to": "Destinataire(s)",
            "date": "JJ/MM/AAAA",
            "content": "Contenu détaillé sans retours à la ligne",
            "relatedTo": ["tm1", "tm2"]
          },
          {
            "id": "ev2",
            "type": "document",
            "title": "Titre du document",
            "content": "Contenu détaillé sans retours à la ligne",
            "relatedTo": ["tm1", "tm3"]
          }
        ],
        "lessons": [
          "Leçon concrète à retenir de cet échec",
          "Leçon concrète à retenir de cet échec",
          "Leçon concrète à retenir de cet échec",
          "Leçon concrète à retenir de cet échec"
        ]
      }
      
      IMPORTANT:
      - Génère exactement 5 membres dans l'équipe (un coupable, quatre innocents)
      - Génère entre 6 et 8 preuves (emails, documents, conversations)
      - Assure-toi que les indices et preuves pointent clairement vers le coupable
      - Le contenu doit être strictement professionnel et réaliste
      - Le JSON doit être parfaitement valide, sans commentaires
    `;

    // Appel à l'API OpenAI pour générer le scénario via le service openAIService
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    // Ajoutez de la randomisation via la température et ajouter un timestamp pour éviter le cache
    const randomTemp = 0.7 + (Math.random() * 0.2); // Température entre 0.7 et 0.9
    const timestamp = new Date().toISOString();
    
    messages.push({ 
      role: "user", 
      content: `Génère un scénario totalement unique et différent des précédents. Timestamp: ${timestamp}` 
    });
    
    const generatedContent = await openAIService.getChatCompletionWithCache(
      messages,
      randomTemp,
      1800 // Plus de tokens pour des scenarios plus détaillés
    );
    
    try {
      // Utilisation de l'utilitaire robuste d'extraction JSON
      const scenarioData = extractJsonFromOpenAiResponse(generatedContent || "{}");
      
      // Vérifier si l'extraction a réussi
      if (!scenarioData) {
        throw new Error("Impossible d'extraire un JSON valide de la réponse");
      }
      
      // Validation du format
      if (!scenarioData.title || !scenarioData.team || !scenarioData.evidence) {
        throw new Error("Format de scénario incorrect - champs requis manquants");
      }
      
      // Correction des avatars
      scenarioData.team.forEach((member: any, index: number) => {
        member.avatar = `avatar${index + 1}.svg`;
      });
      
      res.json(scenarioData);
    } catch (parseError: unknown) {
      console.error("Erreur de parsing JSON:", parseError);
      // Log pour debug
      console.log("Contenu problématique:", generatedContent?.substring(0, 200) + "...");
      const errorMessage = parseError instanceof Error ? parseError.message : "Erreur inconnue";
      res.status(500).json({
        error: "Erreur lors de la génération du scénario",
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