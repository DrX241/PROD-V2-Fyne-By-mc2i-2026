import { Request, Response } from 'express';
import { ChatCompletionRequestMessage } from '../shared/schema';
import { openAIService } from '../I_AM_CYBER/services/openai';

// Fonction d'évaluation des décisions pour le module Cyber Defense
export async function evaluateDecision(req: Request, res: Response) {
  try {
    const { 
      missionId, 
      missionContext, 
      decisionId, 
      choiceId, 
      currentObjective,
      userRole
    } = req.body;
    
    if (!missionId || !decisionId || !choiceId) {
      return res.status(400).json({ message: 'Informations de décision requises' });
    }
    
    // Trouver la décision et l'option choisie
    const objective = missionContext.objectives.find((obj: any) => obj.id === currentObjective);
    const decision = objective?.decisions.find((d: any) => d.id === decisionId);
    const choice = decision?.options.find((opt: any) => opt.id === choiceId);
    
    if (!decision || !choice) {
      return res.status(404).json({ message: 'Décision ou choix non trouvé' });
    }
    
    // Mettre à jour la mission avec le choix effectué
    const updatedMission = { ...missionContext };
    const objectiveIndex = updatedMission.objectives.findIndex((obj: any) => obj.id === currentObjective);
    const decisionIndex = updatedMission.objectives[objectiveIndex].decisions.findIndex((d: any) => d.id === decisionId);
    
    // Marquer la décision comme prise
    updatedMission.objectives[objectiveIndex].decisions[decisionIndex].madeChoice = choiceId;
    
    // Ajuster le score de la mission
    updatedMission.currentScore = (updatedMission.currentScore || 0) + choice.score;
    
    // Déterminer si l'objectif est complété (une bonne décision contribue à compléter l'objectif)
    // Un score positif indique une bonne décision, mais dépend aussi du seuil fixé
    // Plus le score est élevé, plus la décision est bonne
    const scoreThreshold = 5; // Seuil de score minimum pour considérer la décision comme excellente
    const isGoodDecision = choice.score >= scoreThreshold;
    const isAcceptableDecision = choice.score > 0 && choice.score < scoreThreshold;
    const isBadDecision = choice.score <= 0;
    
    // Pour qu'un objectif soit complété, il faut au moins une bonne décision
    // L'accomplissement de l'objectif n'est pas automatique, il dépend de la qualité des décisions
    const objectiveCompleted = isGoodDecision;
    
    // Si l'objectif est complété, le marquer comme tel
    if (objectiveCompleted) {
      updatedMission.objectives[objectiveIndex].completed = true;
    }
    
    // Sélectionner un superviseur approprié pour l'évaluation en fonction du domaine de décision
    let relevantSupervisors = [];
    
    // Déterminer le domaine de la décision pour choisir l'évaluateur le plus pertinent
    if (decision.description.toLowerCase().includes('communic') || 
        decision.description.toLowerCase().includes('média') ||
        decision.description.toLowerCase().includes('interne') ||
        decision.description.toLowerCase().includes('externe')) {
      // Décision liée à la communication - Marion Lopez serait plus appropriée
      relevantSupervisors = missionContext.supervisors.filter((s: any) => 
        s.evaluationDomain === 'communication' || s.role.includes('Communication')
      );
    } else if (decision.description.toLowerCase().includes('finance') || 
              decision.description.toLowerCase().includes('budget') || 
              decision.description.toLowerCase().includes('coût')) {
      // Décision financière - Lorenzo Bertola serait plus approprié
      relevantSupervisors = missionContext.supervisors.filter((s: any) => 
        s.evaluationDomain === 'finance' || s.role.includes('BFA')
      );
    } else if (decision.description.toLowerCase().includes('stratégie') || 
              decision.description.toLowerCase().includes('leadership') ||
              decision.description.toLowerCase().includes('entreprise')) {
      // Décision stratégique - Président ou DG
      relevantSupervisors = missionContext.supervisors.filter((s: any) => 
        s.role.includes('Président') || s.role.includes('Directeur Général')
      );
    } else if (decision.description.toLowerCase().includes('technique') || 
              decision.description.toLowerCase().includes('infrastructure') ||
              decision.description.toLowerCase().includes('système')) {
      // Décision technique - Julien Grimault ou Nosing Doeuk
      relevantSupervisors = missionContext.supervisors.filter((s: any) => 
        s.evaluationDomain === 'cybersécurité' || s.evaluationDomain === 'technologie'
      );
    } else {
      // Par défaut, utiliser la liste complète des superviseurs
      relevantSupervisors = missionContext.supervisors;
    }
    
    // Si aucun superviseur spécifique n'a été trouvé, utiliser un superviseur par défaut
    const supervisor = relevantSupervisors.length > 0 
      ? relevantSupervisors[Math.floor(Math.random() * relevantSupervisors.length)]
      : missionContext.supervisors[Math.floor(Math.random() * missionContext.supervisors.length)] || {
          name: "Direction",
          role: "Comité de direction"
        };
    
    // Adapter le ton de l'évaluation en fonction de la qualité de la décision
    const toneInstruction = isGoodDecision 
      ? 'Félicite chaleureusement pour cette excellente décision en soulignant ses impacts positifs sur l\'organisation.'
      : isAcceptableDecision
        ? 'Reconnaît que c\'est une décision acceptable, mais suggère quelques améliorations possibles.'
        : 'Exprime poliment mais fermement tes préoccupations concernant cette décision et explique pourquoi elle n\'est pas optimale.';
        
    // Adapter les conséquences en fonction du rôle du superviseur
    let domainSpecificFeedback = '';
    if (supervisor.evaluationDomain === 'communication') {
      domainSpecificFeedback = `Mentionne particulièrement l'impact sur l'image et la réputation de l'entreprise.`;
    } else if (supervisor.evaluationDomain === 'finance') {
      domainSpecificFeedback = `Commente spécifiquement les implications financières et les risques économiques.`;
    } else if (supervisor.evaluationDomain === 'stratégie') {
      domainSpecificFeedback = `Aborde l'alignement de cette décision avec la vision stratégique de l'entreprise.`;
    } else if (supervisor.evaluationDomain === 'cybersécurité') {
      domainSpecificFeedback = `Analyse les implications techniques et l'impact sur la posture de sécurité.`;
    }
    
    // Générer l'évaluation de la décision avec OpenAI
    const evaluationPrompt = `
Tu es ${supervisor.name}, ${supervisor.role} chez CYBER SECURE SOLUTIONS. Tu dois évaluer une décision prise par ${userRole || "le responsable"} dans le cadre d'une mission de cybersécurité.

Contexte de la décision:
- Mission: ${missionContext.title}
- Objectif actuel: ${objective?.description}
- Décision à prendre: ${decision.description}
- Option choisie par ${userRole || "le responsable"}: ${choice.text}

Conséquences connues de ce choix:
- Points positifs: ${choice.consequences.positive.join(', ')}
- Points négatifs: ${choice.consequences.negative.join(', ')}
- Impact sur l'évaluation: ${choice.score > 0 ? 'Positif' : choice.score < 0 ? 'Négatif' : 'Neutre'}

Ta tâche:
Rédige une évaluation concise mais précise (3-5 phrases) de cette décision du point de vue de ${supervisor.name}.
${toneInstruction}
${domainSpecificFeedback}

Important: Réponds directement à la première personne comme si tu étais ${supervisor.name} qui s'adresse au ${userRole || "responsable"}.
Ton message doit être professionnel, constructif et adapté à ton rôle de ${supervisor.role}.`;

    const evaluationMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: evaluationPrompt },
      { role: "user", content: "Génère une évaluation professionnelle de cette décision" }
    ];
    
    const evaluationContent = await openAIService.getChatCompletionWithCache(
      evaluationMessages,
      0.7,
      500
    );
    
    // Retourner l'évaluation et la mission mise à jour
    res.json({
      evaluation: {
        content: evaluationContent,
        supervisor: supervisor.name,
        supervisorRole: supervisor.role,
        objectiveCompleted,
        isGoodDecision,
        score: choice.score
      },
      updatedMission
    });
    
  } catch (error: any) {
    console.error('Error evaluating decision:', error);
    res.status(500).json({ 
      error: error.message || 'Error evaluating decision'
    });
  }
}