import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Types d'attaque
enum AttackType {
  BRUTEFORCE = 'bruteforce',
  MALWARE = 'malware',
  DOS = 'dos',
  LATERAL_MOVEMENT = 'lateral-movement',
  EXPLOIT = 'exploit',
  APT = 'apt',
}

// Interface pour les composants de sécurité
interface SecurityComponent {
  id: string;
  name: string;
  category: 'firewall' | 'authentication' | 'segmentation' | 'monitoring' | 'other';
  power: number;
  cost: number;
}

// Interface pour les éléments placés sur la grille
interface PlacedComponent {
  id: string;
  componentId: string;
  position: {
    x: number;
    y: number;
  };
}

// Interface pour les données du niveau
interface LevelData {
  id: string;
  name: string;
  gridSize: number;
  budget: number;
  attackTypes: AttackType[];
  requiredDefenseScore: number;
  serverPositions: Array<{x: number, y: number}>;
  clientPositions: Array<{x: number, y: number}>;
  internetPosition: {x: number, y: number};
}

// Interface pour l'analyse de la défense
interface DefenseAnalysis {
  overallScore: number;
  success: boolean;
  feedback: string;
  vulnerabilities: string[];
  strengths: string[];
  improvements: string[];
  tips: string[];
  attackResults: {
    attackType: AttackType;
    success: boolean;
    description: string;
  }[];
}

// openAIService est importé depuis services/openai.ts

/**
 * Analyse la stratégie de défense réseau de l'utilisateur en utilisant l'IA
 */
export async function analyzeDefenseStrategy(req: Request, res: Response) {
  try {
    const { 
      levelData,
      placedComponents, 
      availableComponents,
      defenseScore,
      requiredScore
    } = req.body;
    
    // Construire le prompt pour l'analyse
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans l'architecture défensive des réseaux. 
Tu vas analyser une stratégie de défense dans un jeu éducatif nommé "Firewall Tactique" qui simule des cyber-attaques.

Voici comment fonctionne le jeu:
1. Le joueur place stratégiquement des composants de sécurité sur une grille pour protéger des serveurs.
2. Chaque composant a une catégorie (pare-feu, authentification, segmentation, surveillance) et une puissance.
3. Les composants compatibles placés à proximité donnent un bonus de score.
4. La défense est testée contre différents types d'attaques.

Ta mission est d'analyser la stratégie du joueur et de fournir un feedback constructif sous format JSON.`;

    const userPrompt = `
# Niveau
- ID: ${levelData.id}
- Nom: ${levelData.name}
- Types d'attaques: ${levelData.attackTypes.join(', ')}
- Score requis: ${requiredScore}
- Score du joueur: ${defenseScore}

# Composants placés
${placedComponents.map((placed: PlacedComponent) => {
  const component = availableComponents.find((c: SecurityComponent) => c.id === placed.componentId);
  return `- ${component?.name} (${component?.category}) à la position [${placed.position.x}, ${placed.position.y}]`;
}).join('\n')}

# Positions clés
- Internet: [${levelData.internetPosition.x}, ${levelData.internetPosition.y}]
- Serveurs: ${levelData.serverPositions.map((pos: {x: number, y: number}) => `[${pos.x}, ${pos.y}]`).join(', ')}
- Clients: ${levelData.clientPositions.map((pos: {x: number, y: number}) => `[${pos.x}, ${pos.y}]`).join(', ')}

Analyse la stratégie de défense et fournit une évaluation détaillée au format JSON suivant exactement cette structure:
{
  "overallScore": number, // note sur 100
  "success": boolean, // true si la défense est suffisante
  "feedback": string, // feedback général de 2-3 phrases
  "vulnerabilities": string[], // 2-3 faiblesses identifiées
  "strengths": string[], // 2-3 points forts
  "improvements": string[], // 2-3 suggestions d'améliorations concrètes
  "tips": string[], // 1-2 conseils stratégiques
  "attackResults": [
    {
      "attackType": string, // type d'attaque
      "success": boolean, // si l'attaque a réussi ou non
      "description": string // description de ce qui s'est passé
    }
  ]
}`;

    // Appeler l'API OpenAI pour l'analyse
    const response = await openAIService.getChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      0.7,
      2000
    );

    // Analyser la réponse
    let analysis: DefenseAnalysis;
    
    try {
      analysis = JSON.parse(response);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return res.status(500).json({ 
        error: "Erreur lors de l'analyse de la défense. Réponse mal formatée."
      });
    }

    // Retourner l'analyse
    return res.status(200).json(analysis);
    
  } catch (error) {
    console.error("Error in analyzeDefenseStrategy:", error);
    return res.status(500).json({ 
      error: "Erreur lors de l'analyse de la stratégie de défense."
    });
  }
}

/**
 * Génère un scénario d'attaque personnalisé basé sur le niveau et l'historique du joueur
 */
export async function generateAttackScenario(req: Request, res: Response) {
  try {
    const { levelId, playerHistory } = req.body;
    
    // Construire le prompt pour la génération de scénario
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans les simulations d'attaques.
Ta mission est de créer un scénario d'attaque réaliste pour un jeu éducatif nommé "Firewall Tactique".
Le scénario doit être adapté au niveau de difficulté et à l'historique du joueur.`;

    const userPrompt = `
Crée un scénario d'attaque pour le niveau ${levelId} qui soit:
1. Réaliste et basé sur des techniques d'attaque réelles
2. Adapté au niveau de difficulté
3. Éducatif avec des explications sur les vecteurs d'attaque utilisés

Génère une réponse au format JSON structurée exactement comme suit:
{
  "title": string, // Titre court et accrocheur
  "description": string, // Contexte de l'attaque en 2-3 phrases
  "attackers": string, // Type d'attaquants (hacktivistes, cybercriminels, APT, etc.)
  "objective": string, // Objectif principal de l'attaque
  "mainTechniques": string[], // 2-3 techniques principales utilisées
  "timeline": [ // Chronologie de l'attaque en 3-5 étapes
    {
      "phase": string, // Nom de la phase
      "description": string, // Description courte
      "defenseRequired": string // Composant ou stratégie qui peut bloquer cette phase
    }
  ],
  "difficulty": number, // Sur une échelle de 1 à 10
  "educationalNotes": string // Courte explication des concepts de sécurité illustrés
}`;

    // Appeler l'API OpenAI pour la génération de scénario
    const response = await openAIService.getChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      0.8,
      1500
    );

    // Retourner le scénario généré
    try {
      const scenario = JSON.parse(response);
      return res.status(200).json(scenario);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération du scénario. Réponse mal formatée."
      });
    }
    
  } catch (error) {
    console.error("Error in generateAttackScenario:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la génération du scénario d'attaque."
    });
  }
}

/**
 * Génère un conseil tactique personnalisé en fonction de la situation actuelle du jeu
 */
export async function generateTacticalTip(req: Request, res: Response) {
  try {
    const { attackTypes, placedComponents, availableComponents } = req.body;
    
    // Construire le prompt pour le conseil
    const systemPrompt = `Tu es un conseiller en cybersécurité spécialisé dans l'architecture défensive.
Tu dois fournir un conseil tactique précis et utile pour aider le joueur à améliorer sa stratégie de défense
dans le jeu éducatif "Firewall Tactique".`;

    const userPrompt = `
Le joueur fait face aux types d'attaques suivants: ${attackTypes.join(', ')}.

Voici les composants qu'il a déjà placés:
${placedComponents.map((placed: PlacedComponent) => {
  const component = availableComponents.find((c: SecurityComponent) => c.id === placed.componentId);
  return `- ${component?.name} (${component?.category})`;
}).join('\n')}

En fonction de la situation actuelle, donne un conseil tactique concret qui aidera le joueur à:
1. Mieux comprendre les principes de cybersécurité
2. Améliorer sa stratégie défensive actuelle
3. Contrer spécifiquement les types d'attaques mentionnés

Fournis une réponse au format JSON structurée exactement comme suit:
{
  "title": string, // Titre court pour le conseil tactique
  "tip": string, // Le conseil principal en 1-2 phrases
  "explanation": string, // Explication détaillée (2-3 phrases)
  "example": string, // Exemple concret d'application
  "securityPrinciple": string // Principe de sécurité illustré par ce conseil
}`;

    // Appeler l'API OpenAI pour la génération du conseil
    const response = await openAIService.getChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      0.7,
      1000
    );

    // Retourner le conseil tactique
    try {
      const tip = JSON.parse(response);
      return res.status(200).json(tip);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la génération du conseil tactique. Réponse mal formatée."
      });
    }
    
  } catch (error) {
    console.error("Error in generateTacticalTip:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la génération du conseil tactique."
    });
  }
}