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
    
    // Déterminer si l'objectif est complété en fonction de la qualité de la décision et du rôle de l'utilisateur
    // Adpater les seuils en fonction du rôle et de l'expertise de l'utilisateur
    
    // Déterminer le niveau d'expertise en fonction du rôle de l'utilisateur
    const userExpertiseLevel = (() => {
      const normalizedRole = (userRole || "").toLowerCase();
      if (!userRole || normalizedRole.includes("débutant")) {
        return "débutant";
      } else if (normalizedRole.includes("expert") || normalizedRole.includes("senior") || normalizedRole.includes("rssi")) {
        return "expert";
      } else {
        return "intermédiaire";
      }
    })();
    
    // Ajuster le seuil de score en fonction du niveau d'expertise
    // Pour un expert, les attentes sont plus élevées
    const scoreThresholds = {
      débutant: 3, // Exigence réduite pour un débutant
      intermédiaire: 5, // Exigence standard
      expert: 7 // Exigence élevée pour un expert
    };
    
    // Récupérer le seuil approprié
    const scoreThreshold = scoreThresholds[userExpertiseLevel];
    
    // Évaluer la qualité de la décision en fonction du score et du seuil
    const isGoodDecision = choice.score >= scoreThreshold;
    const isAcceptableDecision = choice.score > 0 && choice.score < scoreThreshold;
    const isBadDecision = choice.score <= 0;
    
    // Vérifier si l'objectif comporte des contraintes spécifiques pour sa complétion
    const objectiveHasSpecificConstraints = objective?.completionConstraints != null;
    
    // Si l'objectif a des contraintes spécifiques, les vérifier
    let objectiveCompleted = false;
    
    if (objectiveHasSpecificConstraints) {
      // Ici, dans un scénario réel, on vérifierait les contraintes spécifiques de l'objectif
      // Par exemple, un nombre minimum de bonnes décisions, des prérequis, etc.
      
      // Pour l'instant, utilisons un modèle simplifié basé sur les contraintes fictives
      const minScoreRequired = objective?.completionConstraints?.minScore || 0;
      const requiresGoodDecision = objective?.completionConstraints?.requiresGoodDecision !== false; // Par défaut, true
      
      objectiveCompleted = choice.score >= minScoreRequired && (!requiresGoodDecision || isGoodDecision);
    } else {
      // Sans contraintes spécifiques, un objectif est complété avec une bonne décision
      // L'accomplissement de l'objectif n'est pas automatique, il dépend de la qualité des décisions
      objectiveCompleted = isGoodDecision;
    }
    
    // Pour les experts, ajouter une couche supplémentaire d'exigence
    if (userExpertiseLevel === "expert" && objective?.criticality === "high") {
      // Pour les objectifs critiques, un expert doit faire mieux qu'une simple bonne décision
      objectiveCompleted = objectiveCompleted && choice.score >= (scoreThreshold + 2);
    }
    
    // Si l'objectif est complété, le marquer comme tel
    if (objectiveCompleted) {
      updatedMission.objectives[objectiveIndex].completed = true;
    }
    
    // Sélectionner un superviseur approprié pour l'évaluation en fonction du domaine de décision
    let relevantSupervisors = [];
    
    // Liste des superviseurs exécutifs principaux
    const executiveSupervisors = [
      { name: "Arnaud Gauthier", role: "Président", evaluationDomain: "stratégie" },
      { name: "Olivier Hervo", role: "Directeur Général", evaluationDomain: "stratégie" },
      { name: "Lorenzo Bertola", role: "Directeur Général Adjoint et Directeur du pôle BFA", evaluationDomain: "finance" },
      { name: "Anthony Frescal", role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES", evaluationDomain: "opérations" },
      { name: "Vincent Pascal", role: "Directeur Général Adjoint et Directeur du Développement", evaluationDomain: "conformité" },
      { name: "Guillaume Lechevallier", role: "Directeur Général Adjoint et Directeur du pôle IMPULSE", evaluationDomain: "industriel" },
      { name: "Marion Lopez", role: "Directeur communication et marketing", evaluationDomain: "communication" },
      { name: "Julien Grimault", role: "Directeur Technique", evaluationDomain: "cybersécurité" },
      { name: "Nosing Doeuk", role: "Directeur de la Cybersécurité", evaluationDomain: "cybersécurité" }
    ];
    
    // Enrichir la liste des superviseurs dans le contexte avec nos superviseurs exécutifs si nécessaire
    const allSupervisors = missionContext.supervisors?.length > 0
      ? missionContext.supervisors
      : executiveSupervisors;
    
    // Analyser le contenu de la décision pour déterminer les domaines pertinents
    const decisionText = decision.description.toLowerCase();
    
    // Créer une carte des mots-clés par domaine pour une meilleure catégorisation
    const domainKeywords = {
      communication: ['communic', 'média', 'interne', 'externe', 'message', 'annonce', 'reputation'],
      finance: ['finance', 'budget', 'coût', 'investissement', 'économique', 'argent', 'dépense'],
      stratégie: ['stratégie', 'leadership', 'entreprise', 'direction', 'vision', 'long terme', 'global'],
      cybersécurité: ['technique', 'infrastructure', 'système', 'sécurité', 'protection', 'vulnérabilité', 'défense'],
      conformité: ['légal', 'conforme', 'régulation', 'loi', 'règlement', 'norme', 'standard', 'juridique'],
      opérations: ['opération', 'continuité', 'service', 'production', 'reprise', 'urgence', 'incident'],
      industriel: ['industrie', 'production', 'usine', 'fabrication', 'opérationnel']
    };
    
    // Déterminer les domaines pertinents pour cette décision
    const relevantDomains = Object.entries(domainKeywords)
      .filter(([domain, keywords]) => 
        keywords.some(keyword => decisionText.includes(keyword))
      )
      .map(([domain]) => domain);
    
    // Si des domaines pertinents ont été identifiés, sélectionner les superviseurs correspondants
    if (relevantDomains.length > 0) {
      // Filtrer les superviseurs par domaines pertinents
      relevantSupervisors = allSupervisors.filter((s: any) => 
        relevantDomains.includes(s.evaluationDomain)
      );
    }
    
    // Si aucun domaine spécifique n'a été identifié, utiliser des critères plus généraux
    if (relevantSupervisors.length === 0) {
      // Décision liée à la communication
      if (decisionText.includes('communic') || decisionText.includes('média') || 
          decisionText.includes('message') || decisionText.includes('interne') || 
          decisionText.includes('externe')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'communication' || s.role.includes('Communication')
        );
      } 
      // Décision financière
      else if (decisionText.includes('finance') || decisionText.includes('budget') || 
               decisionText.includes('coût') || decisionText.includes('investissement')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'finance' || s.role.includes('BFA') || s.role.includes('Financier')
        );
      } 
      // Décision stratégique
      else if (decisionText.includes('stratégie') || decisionText.includes('leadership') ||
               decisionText.includes('entreprise') || decisionText.includes('direction')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'stratégie' || 
          s.role.includes('Président') || 
          s.role.includes('Directeur Général')
        );
      } 
      // Décision technique ou cybersécurité
      else if (decisionText.includes('technique') || decisionText.includes('infrastructure') ||
               decisionText.includes('système') || decisionText.includes('sécurité')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'cybersécurité' || 
          s.evaluationDomain === 'technologie' ||
          s.role.includes('Cybersécurité') ||
          s.role.includes('Technique')
        );
      } 
      // Décision liée aux opérations ou à la continuité d'activité
      else if (decisionText.includes('opération') || decisionText.includes('continuité') ||
               decisionText.includes('service') || decisionText.includes('production')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'opérations' || s.role.includes('Opérations')
        );
      }
      // Décision liée à la conformité ou aux aspects légaux
      else if (decisionText.includes('légal') || decisionText.includes('conforme') ||
               decisionText.includes('loi') || decisionText.includes('régulation')) {
        relevantSupervisors = allSupervisors.filter((s: any) => 
          s.evaluationDomain === 'conformité' || s.role.includes('Juridique')
        );
      }
      // Par défaut, utiliser la liste complète des superviseurs
      else {
        relevantSupervisors = allSupervisors;
      }
    }
    
    // Si aucun superviseur spécifique n'a été trouvé, utiliser un superviseur par défaut
    // Privilégier les superviseurs exécutifs pour des évaluations plus pertinentes
    const supervisor = relevantSupervisors.length > 0 
      ? relevantSupervisors[Math.floor(Math.random() * relevantSupervisors.length)]
      : allSupervisors[Math.floor(Math.random() * allSupervisors.length)] || {
          name: "Arnaud Gauthier",
          role: "Président",
          evaluationDomain: "stratégie"
        };
    
    // Adapter le ton de l'évaluation en fonction de la qualité de la décision
    const toneInstruction = isGoodDecision 
      ? 'Félicite chaleureusement pour cette excellente décision en soulignant ses impacts positifs sur l\'organisation.'
      : isAcceptableDecision
        ? 'Reconnaît que c\'est une décision acceptable, mais suggère quelques améliorations possibles.'
        : 'Exprime poliment mais fermement tes préoccupations concernant cette décision et explique pourquoi elle n\'est pas optimale.';
        
    // Adapter les conséquences en fonction du rôle du superviseur et de son domaine d'expertise
    let domainSpecificFeedback = '';
    
    switch (supervisor.evaluationDomain) {
      case 'communication':
        domainSpecificFeedback = `Mentionne particulièrement l'impact sur l'image et la réputation de l'entreprise.`;
        break;
      case 'finance':
        domainSpecificFeedback = `Commente spécifiquement les implications financières et les risques économiques.`;
        break;
      case 'stratégie':
        domainSpecificFeedback = `Aborde l'alignement de cette décision avec la vision stratégique de l'entreprise et ses objectifs à long terme.`;
        break;
      case 'cybersécurité':
        domainSpecificFeedback = `Analyse les implications techniques et l'impact sur la posture de sécurité de l'organisation.`;
        break;
      case 'conformité':
        domainSpecificFeedback = `Évalue les aspects liés à la conformité réglementaire et aux obligations légales.`;
        break;
      case 'opérations':
        domainSpecificFeedback = `Commente l'impact sur la continuité des opérations et la disponibilité des services.`;
        break;
      case 'industriel':
        domainSpecificFeedback = `Aborde les considérations spécifiques au secteur industriel et à ses contraintes opérationnelles.`;
        break;
      default:
        domainSpecificFeedback = `Donne ton avis professionnel basé sur ton expertise dans ton domaine.`;
    }
    
    // Ajout d'instructions supplémentaires basées sur le nom du superviseur pour personnaliser davantage
    if (supervisor.name === "Arnaud Gauthier") {
      domainSpecificFeedback += ` En tant que Président, exprime-toi avec autorité et vision globale.`;
    } else if (supervisor.name === "Olivier Hervo") {
      domainSpecificFeedback += ` En tant que Directeur Général, équilibre tes commentaires entre risques et opportunités.`;
    } else if (supervisor.name === "Lorenzo Bertola") {
      domainSpecificFeedback += ` Mentionne spécifiquement les implications pour le secteur bancaire et financier.`;
    } else if (supervisor.name === "Marion Lopez") {
      domainSpecificFeedback += ` Utilise ta position de directeur communication pour évaluer l'impact médiatique et réputationnel.`;
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
    
    // Enrichir la réponse avec des métadonnées supplémentaires pour une présentation plus riche
    
    // Déterminer le niveau de satisfaction visuel
    let satisfactionLevel = 'neutral';
    if (choice.score >= 8) satisfactionLevel = 'very-satisfied';
    else if (choice.score >= 5) satisfactionLevel = 'satisfied';
    else if (choice.score >= 1) satisfactionLevel = 'slightly-satisfied';
    else if (choice.score === 0) satisfactionLevel = 'neutral';
    else if (choice.score >= -4) satisfactionLevel = 'slightly-disappointed';
    else if (choice.score >= -8) satisfactionLevel = 'disappointed';
    else satisfactionLevel = 'very-disappointed';
    
    // Préparer les informations d'avancement de l'objectif
    const objectiveProgressInfo = objectiveCompleted 
      ? { 
          status: 'completed', 
          message: 'Objectif accompli. Vous pouvez passer à l\'étape suivante.' 
        }
      : {
          status: 'in-progress',
          message: isGoodDecision 
            ? 'Bonne décision, mais d\'autres actions sont nécessaires pour compléter cet objectif.'
            : isAcceptableDecision
              ? 'Décision acceptable, mais elle n\'est pas suffisante pour valider l\'objectif.'
              : 'Cette décision n\'a pas permis d\'avancer vers l\'objectif. Essayez une autre approche.'
        };
    
    // Ajouter des conseils supplémentaires adaptés à la situation actuelle
    let additionalFeedback = '';
    
    if (!isGoodDecision) {
      // Donner des conseils sur comment améliorer la prise de décision
      const negativeConsequences = choice.consequences.negative;
      
      if (negativeConsequences.length > 0) {
        additionalFeedback = "Considérez ces aspects à améliorer : " + 
          negativeConsequences.map((item: string) => `« ${item} »`).join(", ") + ".";
      }
    }
    
    // Retourner l'évaluation et la mission mise à jour
    res.json({
      evaluation: {
        content: evaluationContent,
        supervisor: supervisor.name,
        supervisorRole: supervisor.role,
        evaluationDomain: supervisor.evaluationDomain,
        objectiveCompleted,
        isGoodDecision,
        score: choice.score,
        satisfactionLevel,
        objectiveProgress: objectiveProgressInfo,
        additionalFeedback
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