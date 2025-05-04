import { openAIService } from './services/openai';

/**
 * Interface pour le contenu d'apprentissage
 */
interface LearningContent {
  title: string;
  introduction: string;
  concepts_clés: string[];
  scenario_interactif: {
    titre: string;
    contexte: string;
    etapes: Array<{
      id: string;
      description: string;
      options: Array<{
        id: string;
        text: string;
      }>;
      correct_option: string;
      explication: string;
    }>;
  };
  questions: Array<{
    id: string;
    question: string;
    key_concepts: string[];
  }>;
  ressources_additionnelles: Array<{
    titre: string;
    description: string;
    lien: string;
    type?: string;
  }>;
}

/**
 * Interface pour l'évaluation des réponses
 */
interface ResponseEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  areas_to_improve: string[];
  explanation: string;
}

/**
 * Instance partagée d'OpenAI
 */
// Le service openAIService est déjà importé en haut du fichier

/**
 * Génère du contenu d'apprentissage en cybersécurité
 */
export async function generateLearningContent(
  theme: string,
  userLevel: string = 'débutant',
  learningHistory: any[] = []
): Promise<LearningContent> {
  const systemMessage = `Vous êtes un expert en éducation en cybersécurité, spécialisé dans la création de matériel pédagogique interactif. 
Votre mission est de générer un module d'apprentissage complet sur un sujet de cybersécurité.

Suivez ces consignes importantes:
1. Créez un contenu adapté au niveau '${userLevel}' (débutant, intermédiaire ou expert).
2. Incluez uniquement des faits et recommandations précis et à jour.
3. Privilégiez les sources officielles françaises comme l'ANSSI et la CNIL.
4. Intégrez des exemples concrets et pertinents pour le contexte professionnel.
5. Structurez clairement l'information pour une progression logique.
6. Utilisez un ton professionnel et accessible.

Générez un module d'apprentissage sur "${theme}" qui inclut les sections suivantes:
- Un titre clair et descriptif
- Une introduction engageante qui présente l'importance du sujet
- 5 concepts clés essentiels à comprendre
- Un scénario interactif avec au moins 2 étapes de prise de décision, chacune avec plusieurs options et des explications détaillées
- 2-3 questions ouvertes pour évaluer la compréhension, avec des concepts clés à rechercher dans les réponses
- 2-4 ressources additionnelles pertinentes et fiables pour approfondir (documentation ANSSI, CNIL, ENISA, etc.)`;

  const userMessage = `Créez un module d'apprentissage interactif sur "${theme}" adapté au niveau ${userLevel}.

${learningHistory.length > 0
  ? `L'utilisateur a déjà complété ${learningHistory.length} modules, dont: ${learningHistory
      .slice(0, 3)
      .map((h: any) => h.moduleId)
      .join(', ')}${learningHistory.length > 3 ? '...' : ''}`
  : "C'est le premier module que l'utilisateur va suivre."
}`;

  try {
    const completion = await openaiService.getChatCompletion([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]);

    // Vérifier que la réponse est au format JSON
    try {
      // Si c'est déjà un objet JSON structuré
      if (typeof completion === 'object') {
        const content = completion as unknown as LearningContent;
        return ensureContentStructure(content, theme);
      }

      // Sinon, essayer de parser la réponse comme du JSON
      const content = JSON.parse(completion);
      return ensureContentStructure(content, theme);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      
      // En cas d'erreur, essayer d'extraire le JSON de la réponse
      const jsonMatch = completion.match(/```json([\s\S]*?)```/) || 
                        completion.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0];
          const content = JSON.parse(extractedJson);
          return ensureContentStructure(content, theme);
        } catch (extractError) {
          console.error('Erreur lors de l\'extraction JSON:', extractError);
          throw new Error('Le format de la réponse est invalide');
        }
      } else {
        throw new Error('Impossible de générer un contenu correctement structuré');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la génération de contenu:', error);
    throw error;
  }
}

/**
 * Assure que le contenu d'apprentissage a la structure attendue
 */
function ensureContentStructure(content: any, theme: string): LearningContent {
  // S'assurer que toutes les propriétés requises sont présentes
  return {
    title: content.title || `Module sur ${theme}`,
    introduction: content.introduction || `<p>Bienvenue dans ce module sur ${theme}.</p>`,
    concepts_clés: Array.isArray(content.concepts_clés) ? content.concepts_clés : [],
    scenario_interactif: {
      titre: content.scenario_interactif?.titre || 'Mise en situation professionnelle',
      contexte: content.scenario_interactif?.contexte || 'Vous êtes confronté à un défi de cybersécurité.',
      etapes: Array.isArray(content.scenario_interactif?.etapes) 
        ? content.scenario_interactif.etapes 
        : []
    },
    questions: Array.isArray(content.questions) ? content.questions : [],
    ressources_additionnelles: Array.isArray(content.ressources_additionnelles) 
      ? content.ressources_additionnelles 
      : []
  };
}

/**
 * Évalue la réponse d'un utilisateur à une question
 */
export async function evaluateUserResponse(
  userResponse: string,
  context: string,
  expectedConcepts: string[] = []
): Promise<ResponseEvaluation> {
  const systemMessage = `Vous êtes un évaluateur expert en cybersécurité, chargé d'évaluer les réponses des apprenants à des questions de formation.

Suivez ces consignes:
1. Évaluez objectivement si la réponse démontre une compréhension des concepts clés attendus
2. Attribuez un score de 0 à 1 (0 = compréhension minimale, 1 = excellente compréhension)
3. Fournissez un feedback constructif et précis
4. Identifiez les forces de la réponse (maximum 3)
5. Suggérez des points d'amélioration (maximum 3)
6. Expliquez brièvement votre évaluation

Répondez UNIQUEMENT au format JSON avec les champs suivants:
{
  "score": (nombre entre 0 et 1),
  "feedback": (commentaire général),
  "strengths": [(liste des points forts)],
  "areas_to_improve": [(liste des points à améliorer)],
  "explanation": (explication de l'évaluation)
}`;

  const userMessage = `Question: ${context}

Réponse de l'apprenant: "${userResponse}"

Concepts clés attendus: ${expectedConcepts.join(', ')}

Évaluez cette réponse selon les critères demandés. Répondez uniquement au format JSON spécifié.`;

  try {
    const completion = await openaiService.getChatCompletion([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]);

    // Vérifier que la réponse est au format JSON
    try {
      // Si c'est déjà un objet JSON structuré
      if (typeof completion === 'object') {
        return completion as unknown as ResponseEvaluation;
      }

      // Sinon, essayer de parser la réponse comme du JSON
      return JSON.parse(completion);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      
      // En cas d'erreur, essayer d'extraire le JSON de la réponse
      const jsonMatch = completion.match(/```json([\s\S]*?)```/) || 
                        completion.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0];
          return JSON.parse(extractedJson);
        } catch (extractError) {
          console.error('Erreur lors de l\'extraction JSON:', extractError);
        }
      }
      
      // Valeur par défaut en cas d'erreur
      return {
        score: 0.5,
        feedback: "Impossible d'évaluer précisément votre réponse.",
        strengths: ["Effort de réponse"],
        areas_to_improve: ["Structurer davantage la réponse", "Aborder les concepts clés attendus"],
        explanation: "Évaluation par défaut due à une erreur technique."
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation:', error);
    throw error;
  }
}