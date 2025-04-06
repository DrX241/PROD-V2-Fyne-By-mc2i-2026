import { Request, Response } from 'express';
import { openAIService } from '../../I_AM_CYBER/services/openai';

/**
 * Analyser une architecture de sécurité réseau
 */
export async function analyzeCyberArchitecture(req: Request, res: Response) {
  try {
    const {
      levelId,
      components,
      requiredComponents,
      threats,
      networkType,
      isEconomyMode
    } = req.body;

    // Vérification des données requises
    if (!components || !Array.isArray(components)) {
      return res.status(400).json({
        error: 'Les données d\'architecture sont invalides ou manquantes'
      });
    }

    // Vérifier que tous les composants requis pour le niveau sont présents
    const placedComponentTypes = components.map(c => c.id);
    const missingRequiredComponents = requiredComponents.filter(
      id => !placedComponentTypes.includes(id)
    );

    // Préparation du prompt pour l'analyse par IA
    const systemPrompt = generateSystemPrompt(networkType, threats, requiredComponents, missingRequiredComponents);
    const userPrompt = generateUserPrompt(components, networkType, threats, levelId);

    // Si le mode économie est activé, utiliser le modèle secondaire
    if (isEconomyMode) {
      openAIService.switchApiKey('secondary');
    } else {
      openAIService.switchApiKey('primary');
    }
    
    // Appel à l'API OpenAI pour l'analyse
    const analysisResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.7, // température
      2000 // maxTokens
    );

    // Parse de la réponse JSON
    let feedback;
    try {
      // Essayer d'extraire le JSON de la réponse
      const jsonMatch = analysisResponse.match(/```json([\s\S]*?)```/);
      
      if (jsonMatch && jsonMatch[1]) {
        feedback = JSON.parse(jsonMatch[1].trim());
      } else {
        // Fallback: essayer de parser toute la réponse
        feedback = JSON.parse(analysisResponse);
      }
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error);
      console.log('Réponse brute:', analysisResponse);
      
      // Fallback pour un format de réponse cohérent en cas d'erreur
      feedback = {
        overall: "Analyse de l'architecture de sécurité : L'IA n'a pas pu fournir une analyse structurée. Veuillez réessayer.",
        strengths: ["Analyse non disponible"],
        vulnerabilities: ["Analyse non disponible"],
        recommendations: ["Veuillez réorganiser votre architecture et réessayer l'analyse"],
        score: missingRequiredComponents.length > 0 ? 30 : 50
      };
    }

    // Appliquer une pénalité au score si des composants requis sont manquants
    let finalScore = feedback.score;
    if (missingRequiredComponents.length > 0) {
      const penaltyPerMissing = 15;
      finalScore = Math.max(0, finalScore - (missingRequiredComponents.length * penaltyPerMissing));
      
      // Ajouter un avertissement dans le feedback
      feedback.overall = `ATTENTION: Des composants essentiels sont manquants: ${missingRequiredComponents.join(', ')}.\n\n${feedback.overall}`;
      feedback.vulnerabilities.unshift(`Composants essentiels manquants: ${missingRequiredComponents.join(', ')}`);
    }

    // Réponse au client
    res.json({
      feedback: feedback,
      score: finalScore,
      missingComponents: missingRequiredComponents
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'architecture:', error);
    res.status(500).json({
      error: 'Une erreur est survenue lors de l\'analyse de l\'architecture'
    });
  }
}

/**
 * Générer le prompt système pour l'analyse d'architecture
 */
function generateSystemPrompt(networkType: string, threats: string[], requiredComponents: string[], missingComponents: string[]) {
  return `Tu es un expert en cybersécurité spécialisé dans l'évaluation et l'analyse d'architectures réseau sécurisées.
  
Ta mission est d'analyser une architecture réseau proposée et de fournir une évaluation détaillée de sa sécurité.

Tu dois analyser les composants placés, leur positionnement, et évaluer l'efficacité de l'ensemble pour contrer les menaces spécifiées.

Types de réseaux possibles:
- Réseau local
- Réseau d'entreprise
- Infrastructure Web
- Réseau étendu (WAN)

Types de menaces potentielles:
- Malwares et virus
- Attaques par hameçonnage
- Intrusions réseau
- Exfiltration de données
- Attaques par déni de service
- Injections SQL et autres attaques web
- Menaces internes
- Espionnage industriel
- Attaques avancées persistantes

Processus d'analyse:
1. Examine tous les composants placés dans l'architecture
2. Vérifie si les composants essentiels sont présents
3. Évalue l'efficacité de l'architecture contre les menaces spécifiées
4. Identifie les points forts et les vulnérabilités
5. Propose des recommandations d'amélioration
6. Attribue un score global sur 100

Composants essentiels pour ce réseau: ${requiredComponents.join(', ')}
${missingComponents.length > 0 ? `ATTENTION: Les composants suivants sont manquants: ${missingComponents.join(', ')}` : ''}

Type de réseau à analyser: ${networkType}
Menaces spécifiques à contrer: ${threats.join(', ')}

Format de réponse:
Ta réponse doit être un objet JSON structuré comme suit:
\`\`\`json
{
  "overall": "Analyse globale de l'architecture en texte formaté avec paragraphes",
  "strengths": ["Point fort 1", "Point fort 2", ...],
  "vulnerabilities": ["Vulnérabilité 1", "Vulnérabilité 2", ...],
  "recommendations": ["Recommandation 1", "Recommandation 2", ...],
  "score": 75
}
\`\`\`

Le score doit être un nombre entre 0 et 100, reflétant la qualité de l'architecture:
- 0-30: Insuffisant, vulnérabilités critiques
- 31-50: Faible, protection de base insuffisante
- 51-70: Acceptable, protection de base en place
- 71-85: Bon, architecture bien pensée
- 86-100: Excellent, architecture robuste et complète

IMPORTANT: Ta réponse DOIT être au format JSON spécifié, car elle sera analysée par un système automatisé.`;
}

/**
 * Générer le prompt utilisateur pour l'analyse d'architecture
 */
function generateUserPrompt(components: any[], networkType: string, threats: string[], levelId: number) {
  // Créer une description textuelle des composants placés
  const componentsDescription = components.map(comp => {
    return `- ${comp.type} (${comp.id}): positionnement relatif (${Math.round(comp.position.x)}, ${Math.round(comp.position.y)})`;
  }).join('\n');

  return `Voici l'architecture réseau que je souhaite analyser:

Type de réseau: ${networkType}
Niveau de complexité: ${levelId}/4
Menaces à contrer: ${threats.join(', ')}

Composants placés dans l'architecture:
${componentsDescription}

Veuillez analyser cette architecture et fournir une évaluation détaillée de sa sécurité, en suivant strictement le format JSON demandé.`;
}