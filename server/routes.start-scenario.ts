import { Request, Response } from 'express';
import { getRandomAnecdote, getRelevantContacts, getDifficultyText, getSecteurActivite, getCompanyName } from './anecdoteGenerator';
import { openAIService } from './services/openAIService';

// Liste des scénarios prédéfinis
const predefinedScenarios = [
  // Ingénierie sociale et phishing
  {
    id: "phishing-awareness",
    title: "Sensibilisation aux attaques de phishing",
    domain: "Ingénierie sociale et phishing",
    contact: {
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Débutant"
  },
  {
    id: "social-engineering-incident",
    title: "Gestion d'un incident d'ingénierie sociale",
    domain: "Ingénierie sociale et phishing",
    contact: {
      name: "Isabelle Dubacq",
      role: "Senior Partner, Directrice des Ressources Humaines"
    },
    difficulty: "Intermédiaire"
  },
  {
    id: "advanced-social-attacks",
    title: "Prévention des attaques sophistiquées",
    domain: "Ingénierie sociale et phishing",
    contact: {
      name: "Arnaud Gauthier",
      role: "Président"
    },
    difficulty: "Expert"
  },
  // Et tous les autres scénarios existants...
];

/**
 * Gestionnaire de route pour démarrer un scénario
 */
export async function handleStartScenario(req: Request, res: Response) {
  try {
    const { scenarioId, userName } = req.body;
    
    if (!scenarioId || !userName) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Récupérer le scénario sélectionné basé sur l'ID fourni
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ message: "Scénario non trouvé" });
    }
    
    // Configuration du prompt système pour la génération de l'email
    const systemPrompt = `Vous êtes un Assistant d'Intelligence Artificielle spécialisé dans la cybersécurité, nommé I AM CYBER. 
    Votre objectif est de simuler des communications professionnelles réalistes dans le contexte d'entreprises confrontées à des enjeux de cybersécurité.
    En tant qu'expert, vous devez rédiger des messages qui capturent avec précision le ton, le style et le niveau technique appropriés pour la communication professionnelle dans le domaine de la cybersécurité.
    
    Voici quelques principes à respecter:
    1. Utilisez un ton professionnel mais accessible, adapté au niveau d'expertise du destinataire
    2. Incluez des détails techniques pertinents mais sans surcharger le message
    3. Formulez clairement les enjeux de cybersécurité spécifiques au contexte de l'entreprise
    4. Respectez les conventions des emails professionnels (salutations, signature, structure claire)
    
    Niveau de difficulté du scénario: ${scenario.difficulty}
    - Si débutant: utilisez des termes simples, expliquez les concepts de base
    - Si intermédiaire: utilisez un vocabulaire technique modéré
    - Si expert: n'hésitez pas à utiliser un vocabulaire technique avancé et à aborder des problématiques complexes`;
    
    // Obtenir le secteur d'activité et le nom de l'entreprise
    const secteurActivite = getSecteurActivite(scenario.contact.name);
    const companyName = getCompanyName(secteurActivite);
    
    // Obtenir une anecdote aléatoire pour ce domaine
    const randomAnecdote = getRandomAnecdote(scenario.domain);
    
    // Obtenir le texte de difficulté
    const difficultyText = getDifficultyText(scenario.difficulty);
    
    // Obtenir des interlocuteurs supplémentaires
    const additionalContacts = getRelevantContacts(scenario.domain, scenario.contact);
    
    // Préparer la liste des interlocuteurs pour le prompt
    const interlocutorsList = additionalContacts
      .map(contact => `  * ${contact.name}, ${contact.role}, expert en ${contact.expertise}`)
      .join('\n');
    
    // Construire le message pour générer l'email
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Générez un email PROFESSIONNEL et DÉTAILLÉ (environ 250 mots) pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec les détails suivants:
        
        STRUCTURE DE L'EMAIL:
        1. Présentation personnelle: Le PNJ ${scenario.contact.name} se présente avec son rôle (${scenario.contact.role})
        2. Présentation de l'entreprise: Il présente brièvement l'entreprise ${companyName} dans le secteur ${secteurActivite}
        3. Contexte: Il expose le contexte professionnel et business de la situation
        4. Présentation du problème: Il présente un problème de cybersécurité adapté au niveau d'expertise "${scenario.difficulty}"
        5. Présentation des interlocuteurs: Il présente les autres interlocuteurs qui participeront à la conversation
        
        ÉLÉMENTS SPÉCIFIQUES À INCLURE:
        - L'email doit être adressé à ${userName} en utilisant le tutoiement ("tu")
        - IMPORTANT: Inclure cette anecdote sur le domaine quelque part dans l'email: "${randomAnecdote}"
        - Préciser que le problème à résoudre représente ${difficultyText}
        - Présenter chacun des interlocuteurs suivants qui participeront à la discussion:
        ${interlocutorsList}
        
        STYLE ET TON:
        - Le style d'écriture doit être professionnel mais chaleureux
        - Utiliser un ton courtois et enthousiaste
        - Adapter le vocabulaire technique au niveau d'expertise "${scenario.difficulty}"
        - Rédigez uniquement l'email en français, pas de commentaires explicatifs`
      }
    ];
    
    // Générer le contenu de l'email
    const emailContent = await openAIService.getChatCompletionWithCache(
      messages, 
      0.7,  // température
      2000  // tokens maximum
    );
    
    // Extraire le sujet de l'email
    const subjectMatch = emailContent.match(/Objet\s*:(.+?)(?:\n|$)/i);
    let subject = subjectMatch ? subjectMatch[1].trim() : `Bienvenue chez ${companyName}`;
    subject = subject.replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
    
    // Nettoyer le corps de l'email
    let body = emailContent
      .replace(/De\s*:.*?(?:\n|$)/gi, '')
      .replace(/À\s*:.*?(?:\n|$)/gi, '')
      .replace(/Objet\s*:.*?(?:\n|$)/gi, '')
      .replace(/Date\s*:.*?(?:\n|$)/gi, '')
      .trim();
      
    // Formater le corps de l'email
    const lines = body.split('\n');
    if (lines.length > 0) {
      // Traitement des lignes
      for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
      }
      body = lines.join('\n');
    }
    
    // Envoyer le résultat
    return res.json({
      success: true,
      email: {
        from: scenario.contact.name,
        to: userName,
        subject: subject,
        body: body
      },
      scenario: scenario
    });
  } catch (error) {
    console.error("Error starting scenario:", error);
    return res.status(500).json({ message: "Failed to start scenario" });
  }
}