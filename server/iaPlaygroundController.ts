import { Request, Response } from 'express';
import { openAIService } from './services/openai';

interface UserProfile {
  firstName: string;
  company: string;
  activityDomain: string;
  currentRole: string;
  aiGenerativeLevel: string;
  learningObjectives: string[];
  specificNeeds: string;
}

interface PlaygroundSession {
  sessionId: string;
  userProfile: UserProfile;
  context: string;
  messages: Array<{role: string, content: string}>;
  createdAt: Date;
}

// Stockage temporaire des sessions (en production, utiliser une base de données)
const sessions = new Map<string, PlaygroundSession>();

export const startPlayground = async (req: Request, res: Response) => {
  try {
    const userProfile: UserProfile = req.body;
    
    if (!userProfile.firstName || !userProfile.company || !userProfile.aiGenerativeLevel) {
      return res.status(400).json({
        success: false,
        message: 'Informations de profil incomplètes'
      });
    }

    const sessionId = `playground-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer le contexte personnalisé pour l'IA
    const context = createPersonalizedContext(userProfile);
    
    // Générer un message de bienvenue personnalisé
    const welcomeMessage = await generateWelcomeMessage(userProfile, context);
    
    // Créer la session
    const session: PlaygroundSession = {
      sessionId,
      userProfile,
      context,
      messages: [],
      createdAt: new Date()
    };
    
    sessions.set(sessionId, session);
    
    console.log(`🎮 Playground démarré pour ${userProfile.firstName} de ${userProfile.company}`);
    
    res.json({
      success: true,
      sessionId,
      welcomeMessage,
      context
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage du playground:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du démarrage du playground'
    });
  }
};

export const sendPlaygroundMessage = async (req: Request, res: Response) => {
  try {
    const { message, mode = 'chat', userProfile } = req.body;
    
    if (!message || !userProfile) {
      return res.status(400).json({
        success: false,
        message: 'Message ou profil utilisateur manquant'
      });
    }

    console.log(`💬 Message playground reçu: ${message} (mode: ${mode})`);
    
    // Créer le contexte pour cette interaction
    const context = createPersonalizedContext(userProfile);
    const modeContext = getModeContext(mode);
    
    // Générer la réponse de l'IA
    const aiResponse = await generateAIResponse(message, context, modeContext, userProfile);
    
    res.json({
      success: true,
      response: aiResponse,
      mode
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du message'
    });
  }
};

function createPersonalizedContext(profile: UserProfile): string {
  const levelContext = {
    'debutant': 'Tu t\'adresses à un débutant complet en IA générative. Explique les concepts de base, utilise des analogies simples, et propose des exemples concrets.',
    'novice': 'Tu t\'adresses à quelqu\'un qui a déjà testé ChatGPT. Tu peux utiliser quelques termes techniques mais reste accessible.',
    'intermediaire': 'Tu t\'adresses à un utilisateur régulier d\'IA. Tu peux approfondir les techniques et proposer des stratégies avancées.',
    'avance': 'Tu t\'adresses à un expert qui intègre l\'IA dans son workflow. Propose des optimisations et des techniques sophistiquées.'
  };

  const sectorContext = getSectorSpecificContext(profile.activityDomain, profile.currentRole);
  
  return `
CONTEXTE UTILISATEUR:
- Prénom: ${profile.firstName}
- Entreprise: ${profile.company}
- Secteur: ${profile.activityDomain}
- Poste: ${profile.currentRole}
- Niveau IA: ${profile.aiGenerativeLevel}
- Objectifs: ${profile.learningObjectives.join(', ')}
- Besoins spécifiques: ${profile.specificNeeds}

NIVEAU D'ADAPTATION: ${levelContext[profile.aiGenerativeLevel as keyof typeof levelContext]}

CONTEXTE SECTORIEL: ${sectorContext}

INSTRUCTIONS:
- Personnalise tous tes exemples selon son secteur d'activité et son poste
- Adapte le niveau de complexité à son niveau IA
- Propose des cas d'usage concrets pour son entreprise
- Sois pratique et actionnable
- Utilise son prénom pour créer une relation personnelle
`;
}

function getSectorSpecificContext(sector: string, role: string): string {
  const contexts: { [key: string]: string } = {
    'Technologie': 'Focus sur l\'automatisation du code, la documentation technique, l\'aide au debugging, et l\'optimisation des processus de développement.',
    'Finance': 'Concentre-toi sur l\'analyse de données financières, la génération de rapports, l\'automatisation des calculs, et la conformité réglementaire.',
    'Santé': 'Mets l\'accent sur l\'aide à la documentation médicale, l\'analyse de littérature scientifique, et la formation continue.',
    'Éducation': 'Focus sur la création de contenu pédagogique, l\'adaptation aux différents niveaux d\'apprentissage, et l\'évaluation.',
    'Commerce': 'Concentre-toi sur la création de contenu marketing, l\'analyse client, la personnalisation des offres, et l\'optimisation des ventes.',
    'Services': 'Mets l\'accent sur l\'amélioration de l\'expérience client, l\'automatisation des réponses, et l\'optimisation des processus.',
    'Industrie': 'Focus sur l\'optimisation des processus, la maintenance prédictive, et la documentation technique.',
    'Médias': 'Concentre-toi sur la création de contenu, l\'édition, l\'analyse d\'audience, et la distribution multi-canal.'
  };
  
  return contexts[sector] || 'Adapte les exemples au secteur d\'activité de l\'utilisateur en proposant des cas d\'usage pertinents pour son domaine.';
}

function getModeContext(mode: string): string {
  const modeContexts: { [key: string]: string } = {
    'chat': 'Mode conversation libre. Réponds aux questions, donne des conseils, explique les concepts. Sois conversationnel et pédagogique.',
    'exercises': 'Mode exercices pratiques. Propose des défis concrets, des exercices à réaliser, des projets pratiques adaptés au niveau et au secteur de l\'utilisateur.',
    'examples': 'Mode exemples métier. Fournis des exemples concrets et détaillés d\'utilisation de l\'IA dans le secteur de l\'utilisateur, avec des études de cas réels.'
  };
  
  return modeContexts[mode] || modeContexts['chat'];
}

async function generateWelcomeMessage(profile: UserProfile, context: string): Promise<string> {
  try {
    const prompt = `${context}

Génère un message de bienvenue personnalisé et enthousiaste pour ${profile.firstName}. 
Le message doit:
- Être chaleureux et motivant
- Mentionner son secteur d'activité et son niveau
- Expliquer brièvement comment ce playground va l'aider
- Proposer 2-3 suggestions de première question
- Faire maximum 150 mots

Réponds directement le message de bienvenue sans préambule.`;

    const response = await openAIService.getChatCompletion([
      { role: 'system', content: 'Tu es un assistant IA spécialisé dans la formation à l\'IA générative. Tu es enthousiaste, pédagogue et personnalises tes réponses.' },
      { role: 'user', content: prompt }
    ]);

    return response || 'Bienvenue dans votre playground IA personnalisé !';
    
  } catch (error) {
    console.error('Erreur génération message de bienvenue:', error);
    return `Bonjour ${profile.firstName} ! Bienvenue dans votre playground d'apprentissage IA personnalisé. Je suis là pour vous accompagner dans votre découverte de l'IA générative, adaptée à vos besoins en ${profile.activityDomain}. Posez-moi vos questions !`;
  }
}

async function generateAIResponse(message: string, context: string, modeContext: string, profile: UserProfile): Promise<string> {
  try {
    const systemPrompt = `${context}

${modeContext}

Tu es l'assistant IA personnel de ${profile.firstName}. Réponds de manière personnalisée, pratique et actionnable.`;

    const response = await openAIService.getChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]);

    return response || 'Je n\'ai pas pu traiter votre demande. Pouvez-vous reformuler ?';
    
  } catch (error) {
    console.error('Erreur génération réponse IA:', error);
    return 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer votre question ?';
  }
}