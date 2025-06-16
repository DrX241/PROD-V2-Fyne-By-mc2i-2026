import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Interface pour les données du profil utilisateur
interface UserProfile {
  firstName: string;
  company: string;
  activityDomain: string;
  currentRole: string;
  aiGenerativeLevel: string;
  learningObjectives: string[];
  specificNeeds: string;
  timeAvailable: string;
  learningStyle: string;
}

// Interface pour le module de formation
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  sectorSpecific: boolean;
}

interface Exercise {
  type: 'prompt' | 'practical' | 'case-study' | 'quiz';
  title: string;
  description: string;
  prompt?: string;
  expectedOutput?: string;
  context?: string;
}

// Interface pour le programme personnalisé
interface PersonalizedProgram {
  programId: string;
  userProfile: UserProfile;
  recommendedPath: string;
  estimatedDuration: string;
  modules: TrainingModule[];
  customModules: TrainingModule[];
  progressionPlan: {
    week: number;
    focus: string;
    activities: string[];
    practicalExercises: Exercise[];
  }[];
}

class IAPersonalizedTrainingController {
  constructor() {
  }

  // Génère un programme personnalisé basé sur le profil utilisateur
  async generatePersonalizedProgram(req: Request, res: Response) {
    try {
      const userProfile: UserProfile = req.body;

      console.log(`🎯 Génération d'un programme IA personnalisé pour ${userProfile.firstName} de ${userProfile.company}`);

      // Validation des données
      if (!this.validateUserProfile(userProfile)) {
        return res.status(400).json({
          success: false,
          message: "Données de profil invalides"
        });
      }

      // Génération du programme personnalisé avec Azure OpenAI
      const personalizedProgram = await this.createPersonalizedProgram(userProfile);

      console.log(`✅ Programme généré avec succès: ${personalizedProgram.modules.length} modules créés`);

      res.json({
        success: true,
        ...personalizedProgram
      });

    } catch (error) {
      console.error('❌ Erreur lors de la génération du programme personnalisé:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la génération du programme personnalisé",
        error: error.message
      });
    }
  }

  // Valide les données du profil utilisateur
  private validateUserProfile(profile: UserProfile): boolean {
    const required = ['firstName', 'company', 'activityDomain', 'currentRole', 'aiGenerativeLevel'];
    return required.every(field => profile[field] && profile[field].trim().length > 0) &&
           profile.learningObjectives && profile.learningObjectives.length > 0;
  }

  // Crée le programme personnalisé en utilisant l'IA
  private async createPersonalizedProgram(userProfile: UserProfile): Promise<PersonalizedProgram> {
    const programId = `ia-program-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prompt système pour générer le programme
    const systemPrompt = `Tu es un expert en formation IA générative et en pédagogie personnalisée. 
Ton rôle est de créer un programme de formation complet et pratique en IA générative, adapté au profil spécifique de l'utilisateur.

PROFIL UTILISATEUR:
- Prénom: ${userProfile.firstName}
- Entreprise: ${userProfile.company}
- Domaine: ${userProfile.activityDomain}
- Rôle: ${userProfile.currentRole}
- Niveau IA: ${userProfile.aiGenerativeLevel}
- Objectifs: ${userProfile.learningObjectives.join(', ')}
- Besoins spécifiques: ${userProfile.specificNeeds}
- Temps disponible: ${userProfile.timeAvailable}
- Style d'apprentissage: ${userProfile.learningStyle}

INSTRUCTIONS:
1. Crée un programme d'apprentissage pratique et concret
2. Adapte le contenu au niveau et aux objectifs de l'utilisateur
3. Inclus des exemples spécifiques au secteur d'activité
4. Propose des exercices pratiques avec des prompts réels
5. Structure le programme en modules progressifs
6. Personnalise avec le prénom et le contexte professionnel

IMPORTANT: 
- Focus sur l'IA GÉNÉRATIVE (ChatGPT, Claude, Midjourney, etc.)
- Exercices pratiques avec vrais prompts et cas d'usage
- Exemples concrets du secteur ${userProfile.activityDomain}
- Progression adaptée au niveau ${userProfile.aiGenerativeLevel}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "recommendedPath": "string - titre du parcours recommandé",
  "estimatedDuration": "string - durée estimée",
  "modules": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "content": "string - contenu détaillé du module",
      "duration": "string",
      "difficulty": "string",
      "sectorSpecific": boolean,
      "exercises": [
        {
          "type": "prompt|practical|case-study",
          "title": "string",
          "description": "string",
          "prompt": "string - prompt exact à utiliser",
          "expectedOutput": "string - résultat attendu",
          "context": "string - contexte professionnel"
        }
      ]
    }
  ]
}`;

    try {
      const response = await this.azureOpenAI.createChatCompletion([
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Crée maintenant un programme de formation IA générative personnalisé pour ${userProfile.firstName}, ${userProfile.currentRole} chez ${userProfile.company} dans le secteur ${userProfile.activityDomain}.` 
        }
      ], {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 4000
      });

      let programData;
      try {
        programData = JSON.parse(response.content);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        // Fallback: créer un programme de base
        programData = this.createFallbackProgram(userProfile);
      }

      // Construction du programme final
      const personalizedProgram: PersonalizedProgram = {
        programId,
        userProfile,
        recommendedPath: programData.recommendedPath || `Parcours IA Générative pour ${userProfile.currentRole}`,
        estimatedDuration: programData.estimatedDuration || this.calculateDuration(userProfile),
        modules: programData.modules || [],
        customModules: this.generateCustomModules(userProfile),
        progressionPlan: this.generateProgressionPlan(userProfile, programData.modules || [])
      };

      return personalizedProgram;

    } catch (error) {
      console.error('❌ Erreur génération IA:', error);
      // Fallback en cas d'erreur
      return this.createFallbackProgram(userProfile, programId);
    }
  }

  // Calcule la durée estimée selon le profil
  private calculateDuration(profile: UserProfile): string {
    const baseHours = profile.aiGenerativeLevel === 'debutant' ? 40 : 
                     profile.aiGenerativeLevel === 'utilisateur' ? 30 : 
                     profile.aiGenerativeLevel === 'regulier' ? 20 : 15;
    
    const objectiveMultiplier = profile.learningObjectives.length * 0.3;
    const totalHours = Math.round(baseHours + objectiveMultiplier);
    
    return `${totalHours}h sur 6-10 semaines`;
  }

  // Génère des modules personnalisés additionnels
  private generateCustomModules(profile: UserProfile): TrainingModule[] {
    const customModules: TrainingModule[] = [];

    // Module spécifique au secteur
    if (profile.activityDomain !== 'Autre') {
      customModules.push({
        id: `sector-${profile.activityDomain.toLowerCase().replace(/\s+/g, '-')}`,
        title: `IA Générative pour ${profile.activityDomain}`,
        description: `Applications spécifiques de l'IA générative dans le secteur ${profile.activityDomain}`,
        content: `Module personnalisé avec des cas d'usage, exemples et exercices spécifiques au secteur ${profile.activityDomain}.`,
        duration: '3-4h',
        difficulty: profile.aiGenerativeLevel,
        sectorSpecific: true,
        exercises: this.generateSectorExercises(profile)
      });
    }

    // Module adapté au rôle
    customModules.push({
      id: `role-${profile.currentRole.toLowerCase().replace(/\s+/g, '-')}`,
      title: `IA pour ${profile.currentRole}`,
      description: `Applications de l'IA générative spécifiques à votre rôle de ${profile.currentRole}`,
      content: `Module ciblé sur les applications pratiques de l'IA générative pour optimiser les tâches et responsabilités d'un ${profile.currentRole}.`,
      duration: '2-3h',
      difficulty: profile.aiGenerativeLevel,
      sectorSpecific: false,
      exercises: this.generateRoleExercises(profile)
    });

    return customModules;
  }

  // Génère des exercices spécifiques au secteur
  private generateSectorExercises(profile: UserProfile): Exercise[] {
    const sectorExercises: { [key: string]: Exercise[] } = {
      'Marketing & Communication': [
        {
          type: 'prompt',
          title: 'Création de contenu marketing',
          description: 'Générer du contenu marketing adapté à votre audience',
          prompt: `Tu es un expert en marketing pour ${profile.company}. Crée un post LinkedIn engageant pour promouvoir [produit/service]. Cible: [audience]. Ton: professionnel mais accessible. Inclus un appel à l'action.`,
          expectedOutput: 'Post LinkedIn structuré avec accroche, bénéfices, preuve sociale et CTA',
          context: `Marketing pour ${profile.company} dans le secteur ${profile.activityDomain}`
        }
      ],
      'Ressources Humaines': [
        {
          type: 'prompt',
          title: 'Optimisation du recrutement',
          description: 'Améliorer les processus RH avec l\'IA',
          prompt: `En tant que ${profile.currentRole} chez ${profile.company}, aide-moi à rédiger une offre d'emploi attractive pour un poste de [titre du poste]. Secteur: ${profile.activityDomain}. Focus sur: compétences clés, culture d'entreprise, avantages.`,
          expectedOutput: 'Offre d\'emploi structurée et attractive',
          context: `RH dans le secteur ${profile.activityDomain}`
        }
      ]
    };

    return sectorExercises[profile.activityDomain] || [
      {
        type: 'practical',
        title: 'Exercice sectoriel personnalisé',
        description: `Application de l'IA générative dans le contexte de ${profile.activityDomain}`,
        context: `Adapté au secteur ${profile.activityDomain} et au rôle ${profile.currentRole}`
      }
    ];
  }

  // Génère des exercices spécifiques au rôle
  private generateRoleExercises(profile: UserProfile): Exercise[] {
    return [
      {
        type: 'case-study',
        title: `Cas pratique: ${profile.currentRole}`,
        description: `Résolution d'un défi typique de votre rôle avec l'IA générative`,
        context: `Situation réelle d'un ${profile.currentRole} chez ${profile.company}`,
        prompt: `Analyse cette situation professionnelle et propose des solutions en utilisant l'IA générative de manière stratégique.`
      }
    ];
  }

  // Génère un plan de progression semaine par semaine
  private generateProgressionPlan(profile: UserProfile, modules: TrainingModule[]) {
    const weeks = Math.ceil(modules.length / 2);
    const plan = [];

    for (let week = 1; week <= weeks; week++) {
      const weekModules = modules.slice((week - 1) * 2, week * 2);
      plan.push({
        week,
        focus: weekModules.map(m => m.title).join(' & ') || `Semaine ${week}`,
        activities: [
          'Étude des concepts théoriques',
          'Exercices pratiques avec prompts',
          'Application au contexte professionnel',
          'Évaluation des acquis'
        ],
        practicalExercises: weekModules.flatMap(m => m.exercises || [])
      });
    }

    return plan;
  }

  // Programme de fallback en cas d'erreur
  private createFallbackProgram(profile: UserProfile, programId?: string): PersonalizedProgram {
    const id = programId || `ia-program-${Date.now()}-fallback`;

    return {
      programId: id,
      userProfile: profile,
      recommendedPath: `Formation IA Générative Personnalisée pour ${profile.firstName}`,
      estimatedDuration: this.calculateDuration(profile),
      modules: [
        {
          id: 'foundations',
          title: 'Fondements de l\'IA Générative',
          description: 'Bases essentielles adaptées à votre niveau',
          content: `Module d'introduction personnalisé pour ${profile.firstName}, ${profile.currentRole} chez ${profile.company}.`,
          duration: '4-6h',
          difficulty: profile.aiGenerativeLevel,
          sectorSpecific: false,
          exercises: [
            {
              type: 'prompt',
              title: 'Premier prompt professionnel',
              description: 'Créer votre premier prompt adapté à votre métier',
              prompt: `Tu es un assistant IA expert en ${profile.activityDomain}. Aide ${profile.firstName} à [tâche spécifique de son métier].`,
              context: `Contexte professionnel de ${profile.company}`
            }
          ]
        }
      ],
      customModules: this.generateCustomModules(profile),
      progressionPlan: []
    };
  }

  // Récupère un module de formation spécifique
  async getTrainingModule(req: Request, res: Response) {
    try {
      const { programId, moduleId } = req.params;
      
      console.log(`📚 Récupération du module ${moduleId} pour le programme ${programId}`);

      // Dans un cas réel, on récupérerait depuis la base de données
      // Ici on simule la récupération
      
      res.json({
        success: true,
        module: {
          id: moduleId,
          title: 'Module de formation',
          content: 'Contenu du module...',
          exercises: []
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération module:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du module"
      });
    }
  }

  // Démarre une session d'apprentissage interactive
  async startLearningSession(req: Request, res: Response) {
    try {
      const { programId, moduleId } = req.params;
      const { userProfile } = req.body;

      console.log(`🎓 Démarrage session d'apprentissage pour ${userProfile?.firstName || 'utilisateur'}`);

      // Générer une session d'apprentissage personnalisée
      const sessionPrompt = `Tu es un formateur IA expert qui accompagne ${userProfile?.firstName || 'l\'utilisateur'} 
dans son apprentissage de l'IA générative. 

Contexte:
- Apprenant: ${userProfile?.firstName}, ${userProfile?.currentRole} chez ${userProfile?.company}
- Secteur: ${userProfile?.activityDomain}
- Niveau: ${userProfile?.aiGenerativeLevel}

Crée une session d'apprentissage interactive et personnalisée. 
Pose des questions, donne des exercices concrets, et adapte-toi au niveau et au contexte professionnel.

Commence par saluer l'apprenant par son prénom et présente la session.`;

      const response = await this.azureOpenAI.createChatCompletion([
        { role: 'system', content: sessionPrompt },
        { role: 'user', content: 'Commence la session d\'apprentissage.' }
      ], {
        model: 'gpt-4o',
        temperature: 0.8,
        max_tokens: 1000
      });

      res.json({
        success: true,
        sessionId: `session-${Date.now()}`,
        welcomeMessage: response.content,
        sessionContext: {
          programId,
          moduleId,
          userProfile
        }
      });

    } catch (error) {
      console.error('❌ Erreur démarrage session:', error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du démarrage de la session"
      });
    }
  }
}

export default new IAPersonalizedTrainingController();