/**
 * Service de génération de missions pour le module CYBER DEFENSE
 * Ce service utilise l'IA pour générer dynamiquement des missions adaptées
 * au niveau de difficulté et au contexte de l'utilisateur.
 */

interface MissionGenerationParams {
  difficultyLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  industryContext?: string;
  userProfileSummary?: string;
  focusAreas?: string[];
}

export interface CyberDefenseMission {
  id: string;
  title: string;
  scenario: string;
  objectives: string[];
  difficulty: string;
  context: {
    industry: string;
    organization: string;
    background: string;
  };
  phases: {
    id: string;
    name: string;
    description: string;
    tasks: string[];
    decisions: string[];
  }[];
  resources: {
    name: string;
    type: string;
    content: string;
  }[];
}

class MissionGenerator {
  /**
   * Génère une nouvelle mission de cyber défense adaptée aux paramètres fournis
   */
  async generateMission(params: MissionGenerationParams): Promise<CyberDefenseMission> {
    // TODO: Implémenter la génération réelle des missions avec l'API OpenAI
    // Pour l'instant, retournons une mission statique d'exemple
    
    const missionId = `mission-${Date.now()}`;
    
    // Déterminer les caractéristiques en fonction du niveau de difficulté
    let complexity, challengeLevel, detailLevel;
    
    switch(params.difficultyLevel) {
      case 'Débutant':
        complexity = "simple avec des instructions claires";
        challengeLevel = "accessible pour les débutants";
        detailLevel = "suffisants mais pas trop techniques";
        break;
      case 'Expert':
        complexity = "complexe et nuancé";
        challengeLevel = "très exigeant pour les experts";
        detailLevel = "techniques et approfondis";
        break;
      default: // Intermédiaire
        complexity = "modérément complexe";
        challengeLevel = "équilibré pour un niveau intermédiaire";
        detailLevel = "équilibrés entre accessibilité et profondeur technique";
    }
    
    // Mission d'exemple
    const mission: CyberDefenseMission = {
      id: missionId,
      title: `Protection du système d'information contre une attaque avancée (${params.difficultyLevel})`,
      scenario: `Votre organisation fait face à une menace cybernétique ${complexity}. En tant que responsable de la sécurité, vous devez coordonner la réponse et la protection de l'infrastructure.`,
      objectives: [
        "Identifier et contenir la menace cybernétique",
        "Mettre en place des mesures de protection adaptées",
        "Communiquer efficacement avec les parties prenantes",
        params.difficultyLevel === 'Expert' ? "Développer une stratégie à long terme de résilience cyber" : "Documenter les actions prises pour améliorer la posture de sécurité"
      ],
      difficulty: params.difficultyLevel,
      context: {
        industry: params.industryContext || "Secteur financier",
        organization: "Entreprise de taille moyenne spécialisée dans les services financiers",
        background: `L'organisation a récemment fait l'objet d'une série d'attaques de reconnaissance, suggérant qu'un acteur malveillant se prépare à lancer une attaque plus significative. Le système de détection a identifié plusieurs tentatives d'accès non autorisés, et l'équipe de sécurité est en état d'alerte. La direction demande un plan d'action ${challengeLevel}.`
      },
      phases: [
        {
          id: "phase-1",
          name: "Évaluation de la menace",
          description: `Analyser les signes d'intrusion et évaluer l'ampleur potentielle de la menace. Cette phase requiert une analyse ${complexity} des logs et des alertes de sécurité.`,
          tasks: [
            "Examiner les logs de sécurité pour identifier les motifs d'attaque",
            "Évaluer les systèmes potentiellement compromis",
            "Établir un niveau de criticité pour la menace identifiée"
          ],
          decisions: [
            "Déterminer s'il faut isoler certains systèmes du réseau",
            "Décider du niveau d'escalade auprès de la direction"
          ]
        },
        {
          id: "phase-2",
          name: "Confinement et réponse initiale",
          description: `Mettre en œuvre les premières actions pour contenir la menace et empêcher sa propagation. Les actions de confinement doivent être ${challengeLevel}.`,
          tasks: [
            "Déployer des règles de filtrage supplémentaires sur les pare-feu",
            "Isoler les systèmes suspects",
            "Renforcer l'authentification sur les systèmes critiques"
          ],
          decisions: [
            "Choisir entre un confinement progressif ou une isolation complète",
            "Déterminer quand et comment informer les employés"
          ]
        },
        {
          id: "phase-3",
          name: "Remédiation et renforcement",
          description: `Éliminer la menace et renforcer les défenses pour éviter des incidents similaires à l'avenir. Cette phase nécessite des connaissances ${detailLevel}.`,
          tasks: [
            "Nettoyer les systèmes compromis",
            "Appliquer les correctifs de sécurité nécessaires",
            "Renforcer la supervision de sécurité"
          ],
          decisions: [
            "Décider des investissements prioritaires en sécurité",
            "Établir un plan de formation pour les employés"
          ]
        }
      ],
      resources: [
        {
          name: "Guide de réponse aux incidents",
          type: "document",
          content: "Ce document contient les procédures standardisées pour répondre aux incidents de sécurité dans l'organisation."
        },
        {
          name: "Tableau de bord de sécurité",
          type: "dashboard",
          content: "Visualisation en temps réel des alertes et événements de sécurité sur le réseau."
        }
      ]
    };
    
    return mission;
  }
  
  /**
   * Génère uniquement des titres de missions pour présenter des options à l'utilisateur
   */
  async generateMissionTitles(count: number, difficulty: string): Promise<string[]> {
    // TODO: Implémenter la génération réelle avec OpenAI
    
    const baseOptions = [
      "Protection contre une attaque par déni de service",
      "Gestion d'une fuite de données sensibles",
      "Réponse à une attaque de phishing ciblée",
      "Détection d'une menace persistante avancée",
      "Sécurisation d'une infrastructure cloud"
    ];
    
    // Ajouter le niveau de difficulté
    return baseOptions.map(title => `${title} (${difficulty})`).slice(0, count);
  }
}

export const missionGenerator = new MissionGenerator();