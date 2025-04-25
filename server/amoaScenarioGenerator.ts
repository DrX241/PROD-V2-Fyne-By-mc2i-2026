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
      Tu es un expert en scénarisation de cas d'échecs de projets informatiques réalistes pour le jeu "Qui est l'imposteur ?", spécialisé en contexte AMOA (Assistance à Maîtrise d'Ouvrage) en entreprise.
      
      RÔLE
      Créer un scénario professionnel d'échec de projet AMOA avec des personnages crédibles et des preuves contenant à la fois des indices visibles et des indices cachés que le joueur devra découvrir par une analyse minutieuse.
      
      CONTEXTE
      Le jeu "Qui est l'imposteur ?" est une simulation d'investigation professionnelle autour des problématiques métier d'AMOA réelles où le joueur doit analyser des preuves (emails, documents, conversations) pour déterminer qui est responsable de l'échec d'un projet.

      CONSIGNES STRICTES :
      - Thématique: UNIQUEMENT des problématiques AMOA réelles (cahier des charges, expression de besoins, recette utilisateur, etc.)
      - Cadre: exclusivement en France ou en Union Européenne, après 2023
      - Contexte: exclusivement professionnel et réaliste avec des technologies/outils actuels
      - Structure: exactement 5 membres d'équipe aux fonctions variées (dont un AMOA obligatoirement)
      - Créativité: utiliser des noms et prénoms français variés, jamais les mêmes, pas de Marc Durand, Sophie Martin, etc.
      - Fonctions AMOA: varier les titres (AMOA, consultant fonctionnel, analyste métier, chef de projet MOA, PO, etc.)
      - Scénarios: chaque scénario doit être complètement unique, avec une problématique différente
      - Culpabilité: un seul membre doit être clairement coupable (attribut isGuilty=true)
      - Preuves sophistiquées: 7-8 éléments contenant:
         * Des indices évidents
         * Des indices cachés (dates qui ne correspondent pas, contradictions, mentions subtiles)
         * Des détails qui se recoupent entre plusieurs documents
         * Des sous-entendus qu'il faut interpréter
      - Niveau de difficulté: ${difficultyLevel} (facile = indices plus visibles, difficile = indices plus subtils)
      - Format: répondre UNIQUEMENT en JSON valide sans texte supplémentaire
      - Cohérence: tous les échanges doivent former une histoire complète avec des références croisées
      
      SPÉCIFICITÉS PAR NIVEAU DE DIFFICULTÉ:
      - Facile: indices assez explicites, contradictions visibles, peu d'interprétation nécessaire
      - Moyen: mélange d'indices explicites et implicites, quelques contradictions subtiles
      - Difficile: indices très subtils, contradictions cachées, beaucoup d'interprétation nécessaire
      
      TYPES DE SCÉNARIOS AMOA (ne jamais répéter le même type de scénario):
      - Problèmes de cahier des charges incomplet ou mal défini
      - Expression de besoins détournée ou mal comprise
      - Échecs de recette utilisateur
      - Échec d'implémentation de processus métier
      - Problèmes de communication entre MOA et MOE
      - Décisions stratégiques d'AMOA erronées
      - Mauvaise gestion des incidents ou des risques
      - Non-respect des exigences réglementaires
      - Mauvaise anticipation des contraintes techniques
      - Sous-estimation des impacts métiers
      - Erreurs dans la priorisation des besoins
      - Mauvaise définition des critères d'acceptation
      - Manque d'implication des utilisateurs finaux
      - Problèmes de conduite du changement
      - Conflit d'intérêts dans la gouvernance du projet
      
      RÉPONSE FORMAT:
      - JSON standard et valide sans commentaires
      - Contenus formatés avec des espaces à la place des retours à la ligne
      - Aucun texte en dehors de l'objet JSON
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
    
    // Ajout d'une forte randomisation pour garantir des scénarios très différents
    const randomTemp = 0.7 + (Math.random() * 0.25); // Température entre 0.7 et 0.95 pour plus de créativité
    const timestamp = new Date().toISOString();
    
    // Tableau de contextes AMOA différents pour diversifier les scénarios
    const contextesProjets = [
      "transformation digitale d'une entreprise industrielle",
      "refonte d'un système d'information RH",
      "mise en place d'un ERP dans le secteur public",
      "implémentation d'un CRM pour une banque",
      "migration vers le cloud d'applications critiques",
      "déploiement d'un système de gestion documentaire",
      "développement d'une application métier sur-mesure",
      "intégration de systèmes suite à une fusion d'entreprises",
      "mise en conformité RGPD d'un système existant",
      "modernisation d'une architecture legacy"
    ];
    
    // Tableau de secteurs d'activité variés
    const secteurs = [
      "secteur bancaire",
      "secteur public",
      "secteur de l'énergie",
      "secteur des télécommunications",
      "secteur de l'assurance",
      "industrie manufacturière",
      "secteur de la santé",
      "grande distribution",
      "transport et logistique",
      "secteur agroalimentaire"
    ];
    
    // Création d'une combinaison aléatoire pour garantir l'unicité
    const randomContexte = contextesProjets[Math.floor(Math.random() * contextesProjets.length)];
    const randomSecteur = secteurs[Math.floor(Math.random() * secteurs.length)];
    const randomId = Math.floor(Math.random() * 1000);
    
    messages.push({ 
      role: "user", 
      content: `Génère un scénario totalement unique pour un projet de ${randomContexte} dans le ${randomSecteur}. 
      Utilise des noms, fonctions et situations qui n'ont jamais été utilisés avant. 
      Assure-toi que les preuves contiennent des indices à la fois évidents et subtils.
      Ne réutilise pas de motifs narratifs similaires à des scénarios précédents.
      Timestamp: ${timestamp}
      ID unique: projet-${randomId}` 
    });
    
    // Utiliser directement getChatCompletion sans cache pour garantir un nouveau scénario à chaque fois
    const generatedContent = await openAIService.getChatCompletion(
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
      
      // S'assurer que l'ID est correctement défini et unique
      if (!scenarioData.id || scenarioData.id === "Un identifiant unique au format projet-XXX") {
        scenarioData.id = `projet-${randomId}`;
      }
      
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