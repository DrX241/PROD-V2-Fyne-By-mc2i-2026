import { Request, Response } from 'express';
import { openAIService } from '../I_AM_CYBER/services/openai';
import { ChatCompletionRequestMessage } from '../shared/schema';

/**
 * Génère dynamiquement un nouveau scénario pour le jeu "Qui est l'imposteur ?"
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    const { difficultyLevel = 'moyen' } = req.body;
    
    const systemPrompt = `
      Tu es un générateur de scénarios pour un jeu d'enquête professionnel intitulé "Qui est l'imposteur ?".
      Ton rôle est de créer un scénario d'échec de projet informatique ou de transformation digitale réaliste.
      
      Le joueur doit analyser des preuves (emails, documents, conversations) pour déterminer quel membre
      de l'équipe projet est principalement responsable de l'échec.

      CONSIGNES IMPORTANTES :
      - Le scénario doit se dérouler uniquement en France ou en Europe
      - Le contexte doit être réaliste et professionnel
      - Chaque scénario doit avoir exactement 5 membres d'équipe
      - Un seul membre doit être clairement coupable (attribut isGuilty=true)
      - Chaque membre doit avoir une explication (alibi) claire sur pourquoi il est ou n'est pas responsable
      - Niveau de difficulté demandé : ${difficultyLevel}
      - Générer 6-8 preuves (emails, documents, conversations) qui permettent de résoudre l'enquête
      - Inclure 4-5 leçons à retenir de cet échec
      
      Réponds uniquement avec un objet JSON et aucun texte supplémentaire.
    `;

    const userPrompt = `
      Génère un scénario complet pour le jeu "Qui est l'imposteur ?" avec le format JSON suivant :
      
      {
        "id": "projet-X", // Identifiant unique du scénario
        "title": "Titre du Scénario", // Un titre accrocheur
        "description": "Description détaillée du contexte et de l'échec du projet", // 2-3 phrases max
        "difficulty": "${difficultyLevel}", // "facile", "moyen" ou "difficile"
        "failureSummary": "Résumé des raisons de l'échec en une phrase",
        "expectedOutcome": "Ce que le joueur doit découvrir", // Généralement identifier le responsable
        "team": [ // Exactement 5 membres d'équipe
          {
            "id": "tm1",
            "name": "Prénom Nom", // Noms français réalistes
            "role": "Rôle dans le projet",
            "avatar": "avatar1.svg",
            "isGuilty": true, // Un seul membre doit avoir cette valeur à true
            "clues": [ // 3-4 indices sur pourquoi ce membre est coupable (uniquement si isGuilty=true)
              "Indice 1",
              "Indice 2",
              "Indice 3"
            ],
            "alibi": "Explication sur la culpabilité ou l'innocence du membre"
          },
          // Répéter pour 4 autres membres (avec isGuilty=false)
        ],
        "evidence": [ // 6-8 preuves
          {
            "id": "ev1",
            "type": "email", // Type: "email", "chat" ou "document"
            "title": "Titre de l'email",
            "from": "Expéditeur", // Uniquement pour les emails
            "to": "Destinataire(s)", // Uniquement pour les emails
            "date": "JJ/MM/AAAA", // Format date française
            "content": "Contenu détaillé de la preuve",
            "relatedTo": ["tm1", "tm2"] // IDs des membres concernés par cette preuve
          },
          // Répéter pour 5-7 autres preuves
        ],
        "lessons": [ // 4-5 leçons à retenir
          "Leçon 1 à retenir de cet échec",
          "Leçon 2 à retenir de cet échec"
          // Etc.
        ]
      }
    `;

    // Appel à l'API OpenAI pour générer le scénario via le service openAIService
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    const generatedContent = await openAIService.getChatCompletionWithCache(
      messages,
      0.7,
      1500
    );
    
    try {
      // Tentative de parsing du JSON
      const scenarioData = JSON.parse(generatedContent || "{}");
      
      // Validation du format
      if (!scenarioData.title || !scenarioData.team || !scenarioData.evidence) {
        throw new Error("Format de scénario incorrect");
      }
      
      // Correction des avatars
      scenarioData.team.forEach((member: any, index: number) => {
        member.avatar = `avatar${index + 1}.svg`;
      });
      
      res.json(scenarioData);
    } catch (parseError: unknown) {
      console.error("Erreur de parsing JSON:", parseError);
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