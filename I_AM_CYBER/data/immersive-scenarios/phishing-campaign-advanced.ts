import { 
  ImmersiveScenario,
  //NPCCharacter,  // Removed as not used in edited code.
  //ScenarioPhase  // Removed as not used in edited code.
} from '../../../shared/types/immersive-cyber';
import { v4 as uuidv4 } from 'uuid';

import { ImmersiveScenario } from '../../../shared/types/immersive-cyber';

export const phishingCampaignAdvanced: ImmersiveScenario = {
  id: 'phishing-campaign-advanced',
  title: 'Alerte de Phishing Avancé',
  description: 'Gestion d\'une campagne de phishing sophistiquée',

  initialContext: {
    situation: "ALERTE CYBERSÉCURITÉ CRITIQUE",
    impact: "Potentielle compromission massive des systèmes",
    urgence: "Immédiate - Nécessite une action rapide"
  },

  initialPrompt: "Une attaque de phishing sophistiquée vient d'être détectée dans votre organisation. En tant que responsable sécurité, quelle serait votre première action ?",

  choices: [
    {
      id: 'analyze',
      text: 'Analyser les logs et identifier l\'étendue de l\'attaque',
      nextPrompt: "Les logs révèlent que 30% des employés ont reçu un email suspect. Comment procédez-vous ?",
      feedback: "Bonne approche analytique - l'évaluation de la situation est cruciale"
    },
    {
      id: 'isolate',
      text: 'Isoler immédiatement les systèmes potentiellement compromis',
      nextPrompt: "Certains services critiques sont maintenant hors-ligne. Quelle est votre prochaine étape ?",
      feedback: "Action rapide mais potentiellement trop drastique sans analyse préalable"
    },
    {
      id: 'notify',
      text: 'Alerter la direction et les équipes',
      nextPrompt: "La direction demande un plan d'action immédiat. Que proposez-vous ?",
      feedback: "La communication est importante mais ne doit pas retarder les actions techniques"
    }
  ],

  evaluationCriteria: {
    technicalAccuracy: 0.4,
    decisionSpeed: 0.3,
    communicationClarity: 0.3
  },

  debriefingPoints: [
    "Importance de l'analyse préliminaire",
    "Balance entre réactivité et précision",
    "Communication claire avec les parties prenantes"
  ]
};