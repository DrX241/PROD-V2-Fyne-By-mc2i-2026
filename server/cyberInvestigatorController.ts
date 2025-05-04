import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';
import { db } from './db';

interface ChatHistoryItem {
  role: string;
  content: string;
}

/**
 * Traite une requête de chat pour le module Cyber Investigateur
 */
export async function processChatMessage(req: Request, res: Response) {
  try {
    const { message, caseId, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Le message est requis' });
    }

    // Récupération du contexte spécifique au cas enquêté si nécessaire
    let caseContext = '';
    if (caseId && caseId !== 'general') {
      caseContext = await getCaseContext(caseId);
    }

    // Construction du prompt système avec le contexte approprié
    const systemPrompt = getCyberInvestigatorSystemPrompt(caseContext);
    
    // Formatage de l'historique du chat pour OpenAI
    const formattedHistory: ChatHistoryItem[] = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Ajout du message de l'utilisateur
    formattedHistory.push({
      role: 'user',
      content: message
    });

    // Préparation des messages pour l'API OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Ajout des messages de l'historique
    formattedHistory.forEach(msg => {
      messages.push({ 
        role: msg.role as 'user' | 'assistant' | 'system', 
        content: msg.content 
      });
    });
    
    // Envoi à OpenAI et récupération de la réponse
    const response = await openAIService.getChatCompletion(
      messages,
      0.7, // temperature
      800  // max_tokens
    );

    return res.status(200).json({ 
      message: response,
      caseId 
    });
  } catch (error: any) {
    console.error('Erreur lors du traitement du message du Cyber Investigateur:', error);
    return res.status(500).json({ 
      error: 'Une erreur est survenue lors du traitement de votre message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Récupère les informations de base sur un cas d'investigation
 */
export async function getCaseInfo(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    
    if (!caseId) {
      return res.status(400).json({ error: 'L\'identifiant du cas est requis' });
    }

    // Récupération des informations sur le cas
    const caseInfo = await getCaseDetails(caseId);
    
    if (!caseInfo) {
      return res.status(404).json({ error: 'Cas d\'investigation non trouvé' });
    }

    return res.status(200).json({ 
      case: caseInfo
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des informations du cas:', error);
    return res.status(500).json({ 
      error: 'Une erreur est survenue lors de la récupération des informations du cas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Génère des conseils pédagogiques sur une technique d'investigation spécifique
 */
export async function generateEducationalContent(req: Request, res: Response) {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Le sujet est requis' });
    }

    // Construction du prompt pour la génération de contenu pédagogique
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans l'investigation numérique. 
    Fournis du contenu éducatif détaillé sur "${topic}". 
    Inclus les concepts clés, les techniques, les bonnes pratiques et des exemples concrets. 
    Structure ta réponse avec des sections claires, et si pertinent, ajoute des instructions techniques simplifiées.
    Ta réponse doit être informative et pédagogique, adaptée à des professionnels de niveau intermédiaire.`;

    // Préparation des messages pour l'API OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explique-moi "${topic}" dans le contexte de l'investigation en cybersécurité.` }
    ];
    
    // Envoi à OpenAI et récupération de la réponse
    const response = await openAIService.getChatCompletion(
      messages,
      0.7, // temperature
      1200 // max_tokens
    );

    return res.status(200).json({ 
      content: response,
      topic 
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du contenu pédagogique:', error);
    return res.status(500).json({ 
      error: 'Une erreur est survenue lors de la génération du contenu pédagogique',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Récupère le contexte d'un cas d'investigation spécifique
 */
async function getCaseContext(caseId: string): Promise<string> {
  // Pour l'instant, nous utilisons des données statiques
  // Dans une version future, ces données pourraient venir de la base de données
  
  const casesContext: Record<string, string> = {
    'data-leak': 'Ce cas concerne une fuite de données sensibles dans une entreprise technologique. Des documents confidentiels ont été divulgués à l\'extérieur de l\'organisation. L\'enquête porte sur l\'identification de la source de la fuite, des méthodes utilisées et des motivations potentielles.',
    'ransomware-attack': 'Ce cas implique une attaque par ransomware qui a chiffré des serveurs critiques d\'une entreprise. L\'enquête se concentre sur le vecteur d\'infection initial, la propagation du malware dans le réseau, et les indices permettant d\'identifier les attaquants.',
    'insider-threat': 'Ce cas traite d\'une menace interne où des informations confidentielles ont été compromises. L\'enquête vise à identifier l\'employé malveillant, comprendre ses méthodes d\'accès aux données sensibles et établir une chronologie précise des événements.'
  };

  return casesContext[caseId] || '';
}

/**
 * Récupère les détails d'un cas d'investigation
 */
async function getCaseDetails(caseId: string): Promise<any> {
  // Pour l'instant, nous utilisons des données statiques
  // Dans une version future, ces données viendraient de la base de données
  
  const cases: Record<string, any> = {
    'data-leak': {
      id: 'data-leak',
      title: 'Fuite de Données Confidentielles',
      description: 'Une société technologique a subi une fuite de données sensibles. Enquêtez pour déterminer qui en est responsable.',
      difficulty: 'débutant',
      scenario: 'TechVision, une entreprise de développement logiciel, a découvert que des documents confidentiels concernant son nouveau produit ont été divulgués à un concurrent. La direction soupçonne une fuite interne. Vous êtes chargé de l\'enquête numérique pour identifier la source de cette fuite.',
      backgroundInfo: 'L\'incident a été découvert il y a 3 jours lorsque des spécifications techniques confidentielles sont apparues dans une présentation du concurrent. Les documents divulgués étaient accessibles à environ 15 employés au sein de l\'entreprise. La fuite concerne des plans de développement, des spécifications techniques et des analyses de marché pour un produit non encore annoncé.',
      techniques: ['Analyse de logs d\'accès', 'Examen des communications', 'Analyse forensique des postes de travail', 'Entretiens avec les suspects']
    },
    'ransomware-attack': {
      id: 'ransomware-attack',
      title: 'Attaque par Ransomware',
      description: 'Une entreprise a été victime d\'une attaque par ransomware. Analysez l\'incident pour comprendre comment l\'attaque s\'est produite.',
      difficulty: 'intermédiaire',
      scenario: 'MediCorp, un groupe hospitalier régional, a subi une attaque par ransomware qui a chiffré des systèmes critiques. Une rançon de 50 BTC a été demandée. La direction refuse de payer et vous a engagé pour investiguer l\'incident et aider à la récupération.',
      backgroundInfo: 'L\'attaque a été détectée ce matin lorsque les employés ont découvert des écrans de verrouillage sur leurs ordinateurs. Les systèmes de dossiers médicaux électroniques sont inaccessibles, ainsi que plusieurs serveurs administratifs. Les premiers systèmes touchés semblent être dans le département comptabilité, où un employé a rapporté avoir reçu un email suspect hier.',
      techniques: ['Analyse de l\'infection initiale', 'Identification du ransomware', 'Analyse de la propagation latérale', 'Extraction d\'IOCs']
    },
    'insider-threat': {
      id: 'insider-threat',
      title: 'Menace Interne',
      description: 'Des informations confidentielles ont été compromises. Identifiez la menace interne responsable de cette violation.',
      difficulty: 'expert',
      scenario: 'FinSecure, une institution financière, a découvert qu\'une base de données contenant des informations sur des transactions de haute valeur a été régulièrement consultée en dehors des heures normales de bureau. La direction soupçonne qu\'un employé pourrait extraire ces données à des fins malveillantes.',
      backgroundInfo: 'Les accès suspects se produisent depuis environ deux mois, généralement entre minuit et 4h du matin. Le système de surveillance a détecté des requêtes inhabituelles qui extraient de grandes quantités de données. Tous les accès semblent provenir des identifiants légitimes d\'employés, mais à des heures inhabituelles. Plusieurs comptes clients de grande valeur semblent avoir été spécifiquement ciblés.',
      techniques: ['Analyse comportementale', 'Corrélation de logs', 'Profilage d\'utilisateur', 'Monitoring de mouvements de données']
    }
  };

  return cases[caseId] || null;
}

/**
 * Prompt système pour le chatbot du Cyber Investigateur
 */
function getCyberInvestigatorSystemPrompt(caseContext: string = ''): string {
  return `Tu es un assistant spécialisé en investigation numérique et cybersécurité, conçu pour aider les utilisateurs à développer leurs compétences et à résoudre des enquêtes.

${caseContext ? `Contexte du cas actuel : ${caseContext}` : ''}

Tes capacités incluent :
1. Expliquer les concepts et techniques d'investigation numérique
2. Donner des conseils sur l'analyse de preuves numériques
3. Guider l'utilisateur à travers les méthodologies d'enquête
4. Suggérer des approches pour analyser différents types de données (logs, mémoire, disques, etc.)
5. Partager des bonnes pratiques et des conseils professionnels

Quand tu réponds :
- Sois précis et pédagogique
- Fournis des explications claires et étayées
- Adapte tes explications en fonction du niveau de l'utilisateur
- Utilise des exemples concrets pour illustrer tes points
- N'invente pas de faits ou de techniques qui ne sont pas reconnus dans le domaine
- Si tu ne connais pas la réponse à une question spécifique, indique-le clairement

L'objectif principal est d'aider l'utilisateur à développer ses compétences en investigation numérique et à appliquer les bonnes méthodologies dans ses enquêtes.`;
}