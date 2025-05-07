import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Types pour le simulateur de phishing
type PhishingTargetType = 'general' | 'executive' | 'it' | 'finance' | 'hr';
type PhishingTechniqueType = 'urgency' | 'curiosity' | 'fear' | 'reward' | 'authority' | 'social';
type PhishingComplexityType = 'basic' | 'intermediate' | 'advanced';

interface PhishingSimulationRequest {
  scenario: string;
  targetType: PhishingTargetType;
  technique: PhishingTechniqueType;
  complexity: PhishingComplexityType;
  includeAttachments: boolean;
  includeBranding: boolean;
}



// Controller pour le convertisseur de politiques de sécurité
export async function policyConverterController(req: Request, res: Response) {
  try {
    const { originalPolicy, policyType, targetAudience } = req.body;

    if (!originalPolicy || !policyType || !targetAudience) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Utiliser Azure OpenAI pour convertir la politique
    const prompt = constructPolicyPrompt(originalPolicy, policyType, targetAudience);
    const systemMessage = {
      role: 'system' as const,
      content: `Tu es un expert en cybersécurité et en communication, spécialisé dans la simplification et l'adaptation de politiques de sécurité pour différents publics. Ta tâche est de transformer des politiques techniques complexes en versions claires et accessibles tout en préservant les informations essentielles.`
    };
    
    const userMessage = {
      role: 'user' as const,
      content: prompt
    };
    
    // Utiliser le service OpenAI qui est configuré pour Azure
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      0.7,
      1500
    );

    // Analyser la réponse JSON
    let responseData;
    try {
      // Nettoyer la réponse des délimiteurs Markdown
      let cleanResponse = response;
      
      // Supprimer les délimiteurs de bloc de code Markdown
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n/g, '');
        cleanResponse = cleanResponse.replace(/```/g, '');
      }
      
      // Supprimer toute autre balise Markdown potentielle
      cleanResponse = cleanResponse.trim();
      
      responseData = JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la réponse JSON:', error);
      console.error('Réponse brute:', response);
      return res.status(500).json({ error: 'Erreur lors de l\'analyse de la réponse' });
    }

    res.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la conversion de la politique:', error);
    res.status(500).json({ error: 'Erreur lors de la conversion de la politique' });
  }
}

// Construire le prompt pour la conversion de la politique
function constructPolicyPrompt(originalPolicy: string, policyType: string, targetAudience: string): string {
  let audienceDescription = '';

  switch (targetAudience) {
    case 'technical':
      audienceDescription = 'équipe technique de sécurité informatique, avec des connaissances avancées en cybersécurité';
      break;
    case 'management':
      audienceDescription = 'équipe de direction et managers, avec une compréhension commerciale mais peu de connaissances techniques';
      break;
    case 'beginner':
      audienceDescription = 'personnes débutantes en cybersécurité, avec très peu de connaissances techniques';
      break;
    case 'general':
    default:
      audienceDescription = 'tous les employés, avec différents niveaux de connaissances techniques';
      break;
  }

  return `
    Voici une politique de sécurité de type "${policyType}" :

    """
    ${originalPolicy}
    """

    Convertis cette politique pour la rendre accessible à un public composé de : ${audienceDescription}.

    Ton objectif est de simplifier le langage et d'adapter le niveau de détail technique tout en conservant les informations essentielles. La politique doit rester efficace et claire, mais plus accessible pour le public cible.

    Réponds avec un objet JSON au format suivant :
    {
      "convertedPolicy": "La version convertie de la politique, formatée pour une meilleure lisibilité",
      "simplificationNotes": ["Liste de 3-5 notes expliquant les simplifications majeures apportées"],
      "keyPoints": ["Liste de 3-5 points clés que le lecteur doit absolument retenir"],
      "readabilityScore": 0.85 // Un score entre 0 et 1 indiquant la lisibilité du texte converti
    }

    Le format doit être strictement JSON valide.
  `;
}

// Controller pour le simulateur de phishing
export async function phishingSimulatorController(req: Request, res: Response) {
  try {
    const { scenario, targetType, technique, complexity, includeAttachments, includeBranding } = req.body as PhishingSimulationRequest;

    if (!scenario || !targetType || !technique || !complexity) {
      return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
    }

    // Construire le prompt pour le simulateur de phishing
    const prompt = constructPhishingPrompt(scenario, targetType, technique, complexity, includeAttachments, includeBranding);
    const systemMessage = {
      role: 'system' as const,
      content: `Tu es un expert en cybersécurité spécialisé dans la sensibilisation au phishing et à l'ingénierie sociale. Ta mission est de créer des simulations d'emails de phishing réalistes à des fins éducatives, pour aider à former les employés à reconnaître et éviter les tentatives d'hameçonnage.`
    };
    
    const userMessage = {
      role: 'user' as const,
      content: prompt
    };
    
    // Utiliser le service OpenAI
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      0.7,
      1500
    );

    // Analyser la réponse JSON
    let responseData;
    try {
      // Nettoyer la réponse des délimiteurs Markdown
      let cleanResponse = response;
      
      // Supprimer les délimiteurs de bloc de code Markdown
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n/g, '');
        cleanResponse = cleanResponse.replace(/```/g, '');
      }
      
      // Supprimer toute autre balise Markdown potentielle
      cleanResponse = cleanResponse.trim();
      
      responseData = JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la réponse JSON:', error);
      console.error('Réponse brute:', response);
      return res.status(500).json({ error: 'Erreur lors de l\'analyse de la réponse' });
    }

    res.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la génération de la simulation de phishing:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la simulation de phishing' });
  }
}

// Construire le prompt pour le simulateur de phishing
function constructPhishingPrompt(
  scenario: string, 
  targetType: PhishingTargetType, 
  technique: PhishingTechniqueType, 
  complexity: PhishingComplexityType,
  includeAttachments: boolean,
  includeBranding: boolean
): string {
  // Descriptions pour le prompt
  const targetDescriptions = {
    general: "tous les employés de l'entreprise avec divers niveaux de compétences techniques",
    executive: "les cadres supérieurs et dirigeants de l'entreprise",
    it: "le personnel du service informatique avec des connaissances techniques avancées",
    finance: "le personnel du service financier gérant les opérations financières et les paiements",
    hr: "le personnel des ressources humaines gérant les informations des employés"
  };

  const techniqueDescriptions = {
    urgency: "créer un sentiment d'urgence pour pousser à l'action immédiate",
    curiosity: "susciter la curiosité pour inciter le destinataire à ouvrir une pièce jointe ou cliquer sur un lien",
    fear: "générer de la peur ou de l'anxiété pour pousser à une action rapide",
    reward: "offrir une récompense ou un avantage pour inciter à l'action",
    authority: "se faire passer pour une figure d'autorité pour obtenir la conformité",
    social: "utiliser la pression sociale ou la référence à des collègues pour encourager l'action"
  };

  const complexityDescriptions = {
    basic: "facile à détecter, avec des erreurs évidentes et des signaux d'alerte clairs",
    intermediate: "moyennement difficile à détecter, avec quelques subtilités mais des indices reconnaissables",
    advanced: "difficile à détecter, très sophistiqué avec peu d'indices évidents"
  };

  const attachmentNote = includeAttachments 
    ? "Inclus des références à des pièces jointes fictives (comme un PDF, un document Word ou un fichier ZIP) dans l'email."
    : "N'inclus pas de références à des pièces jointes dans l'email.";

  const brandingNote = includeBranding
    ? "Imite l'image de marque d'une entreprise ou d'un service légitime pour rendre l'email plus crédible."
    : "N'utilise pas d'imitation spécifique d'une marque existante.";

  return `
    Crée une simulation d'email de phishing éducatif basée sur le scénario suivant:
    
    """
    ${scenario}
    """
    
    Cible: ${targetDescriptions[targetType]}
    Technique principale: ${techniqueDescriptions[technique]}
    Niveau de complexité: ${complexityDescriptions[complexity]}
    
    Instructions spécifiques:
    - ${attachmentNote}
    - ${brandingNote}
    - Crée un email réaliste qui pourrait être utilisé dans une attaque de phishing.
    - L'objectif est éducatif: montrer comment ces emails fonctionnent pour sensibiliser et former.
    - Inclus des signaux d'alerte qui pourraient être identifiés par un utilisateur attentif.
    
    Réponds avec un objet JSON au format suivant:
    {
      "emailSubject": "Objet de l'email de phishing",
      "emailBody": "Corps complet de l'email, formaté de manière réaliste",
      "senderName": "Nom de l'expéditeur fictif",
      "senderEmail": "email.de.expediteur@exemple.com",
      "targetedVulnerabilities": ["Liste de 3-5 vulnérabilités psychologiques ciblées par cet email"],
      "warningFlags": ["Liste de 3-6 signaux d'alerte qui devraient faire suspecter un phishing"],
      "educationalPoints": ["Liste de 3-5 points éducatifs expliquant comment cet email fonctionne"],
      "difficultyLevel": 7 // Un nombre entre 1 et 10 indiquant la difficulté à détecter cette tentative
    }
    
    Le format doit être strictement JSON valide.
  `;
}