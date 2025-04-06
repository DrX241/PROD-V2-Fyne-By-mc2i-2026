import { Mission, Contact, Objective, Decision } from '../../shared/types/cyber';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './openai';

// Secteurs d'activité disponibles
const SECTEURS_ACTIVITE = [
  "RETAIL & LUXE",
  "BANCAIRE/FINANCE (BFA)",
  "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
  "ÉNERGIE & UTILITIES"
];

// Noms d'entreprises par secteur
const ENTREPRISES_PAR_SECTEUR: Record<string, string[]> = {
  "RETAIL & LUXE": ["ELITE RETAIL SECURITY", "LUXURY BRANDS PROTECTION", "COMMERCE DIGITAL SECURE"],
  "BANCAIRE/FINANCE (BFA)": ["BANQUE FINANCE ASSURANCE", "SECURE FINANCE SOLUTIONS", "CRÉDIT & INVEST PROTECTION"],
  "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)": ["HEALTH & INDUSTRY SHIELD", "PUBLIC SECTOR SECURITY", "INDUSTRIAL SYSTEMS GUARD"],
  "ÉNERGIE & UTILITIES": ["ENERGY & UTILITIES NEXUS", "POWER GRID PROTECTORS", "CRITICAL UTILITIES SHIELD"]
};

// Types de mission par niveau de difficulté
const TYPES_MISSIONS = {
  "Débutant": [
    { titre: "Contrer une campagne de phishing massive", tags: ["Phishing", "Sensibilisation", "Communication"] },
    { titre: "Répondre à un incident de malware", tags: ["Malware", "Remédiation", "Analyse"] },
    { titre: "Sécuriser le travail à distance", tags: ["Télétravail", "VPN", "Accès distant"] }
  ],
  "Intermédiaire": [
    { titre: "Gestion d'une vulnérabilité zero-day critique", tags: ["Vulnérabilité", "Patch Management", "Mesures d'urgence"] },
    { titre: "Incident sur une chaîne d'approvisionnement", tags: ["Supply Chain", "Tiers", "Audit"] },
    { titre: "Réponse à une tentative d'extraction de données", tags: ["Exfiltration", "DLP", "Détection"] }
  ],
  "Expert": [
    { titre: "Défense d'infrastructures critiques énergétiques", tags: ["Infrastructure critique", "SCADA", "APT"] },
    { titre: "Gestion de crise lors d'une attaque APT", tags: ["APT", "Threat Hunting", "Attribution"] },
    { titre: "Coordination internationale lors d'une cyberattaque", tags: ["Collaboration", "Juridiction", "Coordination"] }
  ]
};

// Rôles par niveau de difficulté
const ROLES_PAR_NIVEAU = {
  "Débutant": ["Responsable Sensibilisation Cybersécurité", "Analyste SOC", "Responsable Support IT"],
  "Intermédiaire": ["Responsable Vulnérabilités & Patch Management", "Analyste Threat Intelligence", "Responsable Sécurité Cloud"],
  "Expert": ["RSSI (Responsable de la Sécurité des Systèmes d'Information)", "Directeur Cybersécurité", "Chief Information Security Officer (CISO)"]
};

// Template de base pour une mission dynamique
const missionTemplate: Partial<Mission> = {
  requiredSkills: ["gestion_crise", "analyse_risque", "communication", "decision_rapide", "forensique"],
  skillsProgress: [
    {
      id: "gestion_crise",
      name: "Gestion de crise",
      description: "Capacité à gérer une situation d'urgence et à coordonner les actions",
      category: "leadership",
      level: 0,
      icon: "Shield"
    },
    {
      id: "analyse_risque",
      name: "Analyse de risque",
      description: "Capacité à identifier et évaluer les menaces potentielles",
      category: "analyse",
      level: 0,
      icon: "AlertTriangle"
    },
    {
      id: "communication",
      name: "Communication de crise",
      description: "Capacité à communiquer efficacement avec les parties prenantes",
      category: "communication",
      level: 0,
      icon: "MessageCircle"
    },
    {
      id: "decision_rapide",
      name: "Prise de décision sous pression",
      description: "Capacité à prendre des décisions éclairées en situation d'urgence",
      category: "leadership",
      level: 0,
      icon: "Timer"
    },
    {
      id: "forensique",
      name: "Analyse forensique",
      description: "Capacité à analyser les preuves numériques d'une attaque",
      category: "technique",
      level: 0,
      icon: "Microscope"
    }
  ],
  learningEvents: [],
  currentScore: 0
};

/**
 * Sélectionne aléatoirement un élément d'un tableau
 */
function selectRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Classe responsable de la génération dynamique de missions via l'IA
 */
export class MissionGenerator {
  /**
   * Génère une nouvelle mission en fonction du niveau de difficulté
   */
  async generateMission(difficultyLevel: "Débutant" | "Intermédiaire" | "Expert"): Promise<Mission> {
    // 1. Sélection des éléments de base
    const secteurActivite = selectRandom(SECTEURS_ACTIVITE);
    const companyName = selectRandom(ENTREPRISES_PAR_SECTEUR[secteurActivite]);
    const missionType = selectRandom(TYPES_MISSIONS[difficultyLevel]);
    const userRole = selectRandom(ROLES_PAR_NIVEAU[difficultyLevel]);
    const duration = difficultyLevel === "Débutant" ? "15-25 min" : difficultyLevel === "Intermédiaire" ? "30-45 min" : "45-60 min";

    // 2. Génération du scénario via l'API OpenAI
    const scenarioPrompt = `Génère un scénario détaillé de cybersécurité de niveau ${difficultyLevel} pour une entreprise nommée ${companyName} dans le secteur ${secteurActivite}. 
Le scénario concerne: "${missionType.titre}" et doit être adapté pour un ${userRole}.
Le scénario doit être réaliste, immersif et donner suffisamment de contexte pour que le joueur puisse prendre des décisions.
Écris entre 3 et 5 phrases qui présentent: le contexte, la menace, l'enjeu et l'urgence de la situation.
Réponds uniquement avec le texte du scénario.`;

    // 3. Appel à l'API OpenAI pour générer le scénario
    const scenarioResponse = await openAIService.getChatCompletion(
      [{ role: "user", content: scenarioPrompt }],
      0.7,
      500
    );
    const scenario = scenarioResponse ? scenarioResponse.trim() : "";

    // 4. Génération des objectifs via l'API OpenAI
    const objectivesPrompt = `Pour une mission de cybersécurité intitulée "${missionType.titre}" de niveau ${difficultyLevel}, 
génère 3 objectifs principaux que le joueur (${userRole}) devra atteindre.
Chaque objectif doit être accompagné de 3 critères d'évaluation.
Pour chaque objectif, crée également 2 décisions importantes avec 3 options possibles pour chacune.
Chaque option doit avoir des conséquences positives et négatives.
Réponds au format JSON selon cette structure:
{
  "objectives": [
    {
      "description": "Description de l'objectif 1",
      "evaluationCriteria": ["Critère 1", "Critère 2", "Critère 3"],
      "decisions": [
        {
          "description": "Description de la décision 1",
          "options": [
            {
              "text": "Option 1",
              "consequences": {
                "positive": ["Conséquence positive 1", "Conséquence positive 2"],
                "negative": ["Conséquence négative 1", "Conséquence négative 2"]
              },
              "score": 8
            },
            {
              "text": "Option 2",
              "consequences": {
                "positive": ["Conséquence positive 1", "Conséquence positive 2"],
                "negative": ["Conséquence négative 1", "Conséquence négative 2"]
              },
              "score": 4
            },
            {
              "text": "Option 3",
              "consequences": {
                "positive": ["Conséquence positive 1", "Conséquence positive 2"],
                "negative": ["Conséquence négative 1", "Conséquence négative 2"]
              },
              "score": -2
            }
          ]
        }
      ]
    }
  ]
}`;

    // 5. Appel à l'API OpenAI pour générer les objectifs
    const objectivesResponse = await openAIService.getChatCompletion(
      [{ role: "user", content: objectivesPrompt }],
      0.7,
      2000
    );

    let objectives: Objective[] = [];
    try {
      // Transformer la réponse JSON en objectifs structurés
      const parsedResponse = objectivesResponse ? JSON.parse(objectivesResponse) : { objectives: [] };
      objectives = (parsedResponse.objectives || []).map((obj: any) => ({
        id: uuidv4(),
        description: obj.description || "Objectif à compléter",
        completed: false,
        evaluationCriteria: obj.evaluationCriteria || ["Critère 1", "Critère 2", "Critère 3"],
        decisions: (obj.decisions || []).map((dec: any) => ({
          id: uuidv4(),
          description: dec.description || "Décision à prendre",
          options: (dec.options || []).map((opt: any) => ({
            id: uuidv4(),
            text: opt?.text || "Option",
            consequences: opt?.consequences || { positive: ["Avantage"], negative: ["Inconvénient"] },
            score: opt?.score || Math.floor(Math.random() * 10) - ((opt?.text || "").includes("risqu") ? 5 : 0)
          }))
        }))
      }));
    } catch (error) {
      console.error("Erreur lors du parsing des objectifs:", error);
      // Objectifs par défaut en cas d'erreur
      objectives = [
        {
          id: uuidv4(),
          description: `Analyser la situation et évaluer l'ampleur de l'incident`,
          completed: false,
          evaluationCriteria: [
            "Rapidité de l'évaluation initiale",
            "Précision de l'analyse des risques",
            "Identification des systèmes affectés"
          ],
          decisions: [
            {
              id: uuidv4(),
              description: "Quelle approche privilégier pour l'analyse initiale?",
              options: [
                {
                  id: uuidv4(),
                  text: "Mobiliser une équipe multidisciplinaire pour une analyse complète",
                  consequences: {
                    positive: ["Vision globale de l'incident", "Meilleure identification des impacts"],
                    negative: ["Délai de réponse plus long", "Mobilisation importante de ressources"]
                  },
                  score: 7
                },
                {
                  id: uuidv4(),
                  text: "Effectuer une analyse technique rapide par l'équipe IT",
                  consequences: {
                    positive: ["Réponse plus rapide", "Moins de perturbation organisationnelle"],
                    negative: ["Vision partielle des impacts", "Risque de sous-estimation"]
                  },
                  score: 4
                },
                {
                  id: uuidv4(),
                  text: "Déléguer l'analyse à un prestataire externe",
                  consequences: {
                    positive: ["Expertise spécialisée", "Libération des ressources internes"],
                    negative: ["Délai supplémentaire", "Coût élevé", "Dépendance externe"]
                  },
                  score: 2
                }
              ]
            }
          ]
        }
      ];
    }

    // 6. Sélection des contacts pertinents
    // Définition des contacts dirigeants
    const executives: Contact[] = [
      {
        name: "Arnaud Gauthier",
        role: "Président",
        expertise: "Stratégie d'entreprise et vision globale de la cybersécurité"
      },
      {
        name: "Olivier Hervo",
        role: "Directeur Général",
        expertise: "Gestion opérationnelle et coordination inter-départements"
      }
    ];
    
    // Définition des évaluateurs
    const evaluators: Contact[] = [
      {
        name: "Julien Grimault",
        role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité",
        expertise: "Évaluation des risques et gouvernance cybersécurité"
      },
      {
        name: "Yousra Saidani",
        role: "Senior Partner et Directrice Marketing, Communication et RSE",
        expertise: "Communication de crise et sensibilisation aux risques"
      },
      {
        name: "Nosing Doeuk",
        role: "Senior Partner - Directeur du pôle DIXIT",
        expertise: "Infrastructure IT et sécurité des données"
      }
    ];
    
    // Définition des contacts directs
    const directContacts: Contact[] = [
      {
        name: "Neil Desai",
        role: "Consultant Senior Cybersécurité",
        expertise: "Gestion des incidents et réponse aux attaques"
      },
      {
        name: "Eddy MISSONI IDEMBI",
        role: "Expert Data / IA & CTO",
        expertise: "Sécurité des données et intelligence artificielle"
      },
      {
        name: "Vincent Terrier",
        role: "Senior Partner, Directeur Financier",
        expertise: "Gestion des impacts financiers des cyberattaques"
      }
    ].slice(0, 3);

    // Création des superviseurs et contacts pour cette mission spécifique
    const supervisors = evaluators.length > 0 ? evaluators : executives;

    // 7. Génération des contacts spécifiques via l'API OpenAI
    const contactsPrompt = `Pour une mission de cybersécurité "${missionType.titre}" dans une entreprise ${companyName} (secteur ${secteurActivite}), 
génère 3 contacts spécifiques qui pourraient être utiles. 
Pour chaque contact, fournis un nom (prénom et nom de famille), un rôle dans l'organisation, et son expertise.
Réponds au format JSON:
[
  {"name": "Prénom Nom", "role": "Rôle dans l'entreprise", "expertise": "Description brève de son expertise"}
]`;

    const contactsResponse = await openAIService.getChatCompletion(
      [{ role: "user", content: contactsPrompt }],
      0.7,
      600
    );

    let specificContacts: Contact[] = [];
    try {
      specificContacts = contactsResponse ? JSON.parse(contactsResponse) : [];
    } catch (error) {
      console.error("Erreur lors du parsing des contacts:", error);
      specificContacts = [
        {
          name: "Sophie Martin",
          role: "Administratrice Systèmes",
          expertise: "Gestion des infrastructures IT et des sauvegardes"
        },
        {
          name: "Pierre Dubois",
          role: "Responsable Conformité",
          expertise: "Réglementation et conformité en cybersécurité"
        }
      ];
    }

    // 8. Générer les récompenses et pénalités en fonction du niveau
    const rewardsAndPenaltiesPrompt = `Pour une mission de cybersécurité "${missionType.titre}" de niveau ${difficultyLevel},
propose 3 récompenses professionnelles en cas de succès et 3 conséquences négatives en cas d'échec.
Ces éléments doivent être adaptés au rôle de ${userRole} dans une entreprise du secteur ${secteurActivite}.
Réponds au format JSON:
{
  "rewards": ["Récompense 1", "Récompense 2", "Récompense 3"],
  "penalties": ["Pénalité 1", "Pénalité 2", "Pénalité 3"]
}`;

    const rewardsResponse = await openAIService.getChatCompletion(
      [{ role: "user", content: rewardsAndPenaltiesPrompt }],
      0.7,
      400
    );

    let rewards = ["Reconnaissance professionnelle", "Budget supplémentaire", "Formation spécialisée"];
    let penalties = ["Perte de confiance", "Réduction des responsabilités", "Évaluation négative"];

    try {
      const parsedRewards = rewardsResponse ? JSON.parse(rewardsResponse) : null;
      if (parsedRewards) {
        rewards = parsedRewards.rewards || rewards;
        penalties = parsedRewards.penalties || penalties;
      }
    } catch (error) {
      console.error("Erreur lors du parsing des récompenses:", error);
    }

    // 9. Assembler tous les éléments pour créer la mission complète
    const mission: Mission = {
      ...missionTemplate as Mission,
      id: uuidv4(),
      title: missionType.titre,
      description: `Une situation critique de cybersécurité requiert vos compétences de ${userRole}. Prenez les bonnes décisions pour protéger ${companyName}.`,
      difficulty: difficultyLevel,
      duration: duration,
      tags: missionType.tags,
      scenario: scenario,
      companyName: companyName,
      secteurActivite: secteurActivite,
      userRole: userRole,
      objectives: objectives,
      contacts: [...directContacts, ...specificContacts],
      supervisors: supervisors,
      evaluationSystem: {
        maxPoints: 60,
        penaltyThreshold: 20,
        rewards: rewards,
        penalties: penalties
      }
    };

    return mission;
  }
}

export const missionGenerator = new MissionGenerator();