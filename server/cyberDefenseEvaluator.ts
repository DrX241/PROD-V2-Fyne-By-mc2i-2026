import { Request, Response } from "express";

interface DecisionEvaluationRequest {
  decision: string;
  context: {
    scenario: string;
    phase: string;
    difficulty: string;
  };
}

interface DecisionEvaluation {
  score: number;
  feedback: string;
  impact: {
    security: number;
    business: number;
    compliance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Évalue une décision prise dans le contexte d'un scénario de défense cyber
 * et renvoie un feedback détaillé sur cette décision.
 */
export async function evaluateDecision(req: Request, res: Response) {
  try {
    const { decision, context } = req.body as DecisionEvaluationRequest;
    
    if (!decision || !context) {
      return res.status(400).json({
        success: false,
        message: 'La décision et le contexte sont requis'
      });
    }

    // TODO: Implémenter l'évaluation réelle de la décision
    // Ceci est une implémentation simulée pour le moment

    const evaluation: DecisionEvaluation = {
      score: 75, // Score sur 100
      feedback: "Votre décision montre une bonne compréhension des principes de cybersécurité, mais pourrait être améliorée pour tenir compte de l'impact business.",
      impact: {
        security: 85,
        business: 65,
        compliance: 75
      },
      strengths: [
        "Bonne prise en compte des aspects de sécurité technique",
        "Approche conforme aux bonnes pratiques du secteur"
      ],
      weaknesses: [
        "Impact potentiel sur les opérations business pas suffisamment considéré",
        "Communication avec les parties prenantes pourrait être améliorée"
      ],
      recommendations: [
        "Impliquer les responsables métiers dès le début du processus décisionnel",
        "Envisager une approche par étapes pour minimiser l'impact opérationnel",
        "Documenter le processus décisionnel pour référence future"
      ]
    };

    return res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Error evaluating decision:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'évaluation de la décision',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}