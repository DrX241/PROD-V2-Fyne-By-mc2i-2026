/**
 * Données d'exemple pour les scénarios de simulation immersive
 */

import { ImmersiveScenario } from '../../shared/types/immersive-cyber';

export const immersiveScenarios: ImmersiveScenario[] = [
  {
    id: 'scenario-1',
    title: 'Gestion d\'une crise de ransomware',
    description: 'Votre organisation fait face à une attaque de ransomware qui a chiffré des données critiques. Vous devez coordonner la réponse à cet incident majeur.',
    difficulty: 'Intermédiaire',
    context: {
      industry: 'Santé',
      organization: 'Hôpital régional',
      background: 'L\'hôpital régional est une structure de 500 lits desservant une population de 200 000 habitants. Un ransomware a été détecté dans les systèmes informatiques, menaçant des données critiques.'
    },
    availableRoles: ['RSSI', 'DSI', 'DG'],
    narrativeArcs: [
      {
        id: 'arc-1',
        title: 'Détection et confinement initial',
        description: 'La première phase de la réponse à l\'incident consiste à détecter l\'étendue de l\'infection et à mettre en place des mesures de confinement.',
        phases: [
          {
            id: 'phase-1',
            title: 'Évaluation initiale',
            description: 'Évaluer l\'ampleur de l\'infection et identifier les systèmes touchés.',
            decisionPoints: [
              {
                id: 'decision-1',
                title: 'Confinement des systèmes',
                description: 'Comment souhaitez-vous procéder pour contenir l\'infection ?',
                options: [
                  {
                    id: 'option-1-1',
                    text: 'Déconnecter immédiatement tous les systèmes du réseau',
                    consequences: {
                      description: 'Vous avez arrêté la propagation, mais les opérations de l\'hôpital sont gravement perturbées.',
                      metrics: [
                        { metricId: 'security', change: 30 },
                        { metricId: 'operational-impact', change: -25 },
                        { metricId: 'reputation', change: -10 }
                      ],
                      relationships: [
                        { characterId: 'char-1', change: -5 },
                        { characterId: 'char-2', change: 10 }
                      ]
                    }
                  },
                  {
                    id: 'option-1-2',
                    text: 'Isoler uniquement les systèmes identifiés comme infectés',
                    consequences: {
                      description: 'Vous avez maintenu les opérations essentielles, mais l\'infection pourrait se propager à d\'autres systèmes.',
                      metrics: [
                        { metricId: 'security', change: 10 },
                        { metricId: 'operational-impact', change: -5 },
                        { metricId: 'reputation', change: 5 }
                      ],
                      relationships: [
                        { characterId: 'char-1', change: 10 },
                        { characterId: 'char-2', change: -5 }
                      ]
                    }
                  }
                ]
              }
            ],
            availableActions: [
              {
                id: 'action-1',
                title: 'Analyser les logs de sécurité',
                description: 'Examiner les journaux d\'événements pour identifier le vecteur d\'attaque initial.',
                outcomes: {
                  description: 'Vous avez identifié que l\'infection a commencé par un email de phishing ciblé.'
                }
              },
              {
                id: 'action-2',
                title: 'Contacter l\'équipe de réponse aux incidents externe',
                description: 'Faire appel à des experts en sécurité pour vous aider à gérer l\'incident.',
                requiredRole: ['RSSI', 'DSI'],
                cost: {
                  budget: 5000
                },
                outcomes: {
                  description: 'L\'équipe externe sera sur place dans 4 heures.',
                  metrics: [
                    { metricId: 'security', change: 15 }
                  ]
                }
              }
            ]
          }
        ]
      }
    ],
    characters: [
      {
        id: 'char-1',
        name: 'Dr. Martin',
        role: 'Chef du département de cardiologie',
        description: 'Un médecin respecté qui s\'inquiète de l\'impact sur les soins aux patients.',
        personality: 'Pragmatique, orienté patient, peu tolérant aux perturbations techniques.',
        knowledge: ['Processus médicaux', 'Gestion d\'équipe'],
        interests: ['Soin des patients', 'Innovation médicale'],
        availableInPhases: ['phase-1'],
        initialEmotion: 'concerned'
      },
      {
        id: 'char-2',
        name: 'Julie Lambert',
        role: 'Responsable de la sécurité informatique',
        description: 'Experte technique qui a anticipé les risques de cyber-attaques.',
        personality: 'Analytique, orientée sécurité, directe.',
        knowledge: ['Cybersécurité', 'Gestion des risques'],
        interests: ['Sécurité des systèmes', 'Nouvelles menaces'],
        availableInPhases: ['phase-1'],
        initialEmotion: 'determined'
      }
    ],
    metrics: {
      categories: [
        {
          id: 'cat-1',
          name: 'Performance organisationnelle',
          description: 'Mesure comment l\'organisation fonctionne pendant la crise',
          metrics: [
            {
              id: 'operational-impact',
              name: 'Impact opérationnel',
              description: 'Niveau de perturbation des opérations normales',
              min: 0,
              max: 100,
              initialValue: 80,
              visibleToRoles: ['RSSI', 'DSI', 'DG'],
              thresholds: [
                { value: 30, label: 'Critique', color: 'red' },
                { value: 60, label: 'Préoccupant', color: 'orange' },
                { value: 100, label: 'Normal', color: 'green' }
              ]
            },
            {
              id: 'reputation',
              name: 'Réputation',
              description: 'Perception externe de la gestion de crise',
              min: 0,
              max: 100,
              initialValue: 70,
              visibleToRoles: ['DG', 'DRH'],
              thresholds: [
                { value: 40, label: 'Endommagée', color: 'red' },
                { value: 70, label: 'Stable', color: 'orange' },
                { value: 100, label: 'Excellente', color: 'green' }
              ]
            }
          ]
        },
        {
          id: 'cat-2',
          name: 'Sécurité',
          description: 'Mesure l\'efficacité des actions de cybersécurité',
          metrics: [
            {
              id: 'security',
              name: 'Niveau de sécurité',
              description: 'Efficacité des mesures de sécurité en place',
              min: 0,
              max: 100,
              initialValue: 30,
              visibleToRoles: ['RSSI', 'DSI'],
              thresholds: [
                { value: 30, label: 'Critique', color: 'red' },
                { value: 60, label: 'Améliorable', color: 'orange' },
                { value: 90, label: 'Sécurisé', color: 'green' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'scenario-2',
    title: 'Fuite de données sensibles',
    description: 'Une fuite de données confidentielles a été détectée. Vous devez identifier l\'origine de la fuite, limiter les dégâts et gérer la communication de crise.',
    difficulty: 'Expert',
    context: {
      industry: 'Finance',
      organization: 'Banque régionale',
      background: 'Une banque régionale possédant des données financières sensibles sur des milliers de clients fait face à une fuite de données.'
    },
    availableRoles: ['RSSI', 'DSI', 'DG', 'DRH', 'DAF'],
    narrativeArcs: [
      {
        id: 'arc-1',
        title: 'Investigation et confinement',
        description: 'Identifier la source de la fuite et limiter son impact.',
        phases: [
          {
            id: 'phase-1',
            title: 'Analyse initiale',
            description: 'Déterminer la nature et l\'étendue de la fuite de données.',
            decisionPoints: [
              {
                id: 'decision-1',
                title: 'Communication initiale',
                description: 'Comment souhaitez-vous communiquer au sujet de cet incident ?',
                options: [
                  {
                    id: 'option-1-1',
                    text: 'Informer immédiatement tous les clients potentiellement affectés',
                    consequences: {
                      description: 'Vous avez été transparent, mais cela a provoqué une panique et une couverture médiatique négative.',
                      metrics: [
                        { metricId: 'trust', change: 10 },
                        { metricId: 'reputation', change: -15 },
                        { metricId: 'regulatory-compliance', change: 20 }
                      ],
                      relationships: []
                    }
                  },
                  {
                    id: 'option-1-2',
                    text: 'Attendre d\'avoir plus d\'informations avant de communiquer',
                    consequences: {
                      description: 'Vous avez évité la panique immédiate, mais risquez des problèmes réglementaires et une perception de dissimulation.',
                      metrics: [
                        { metricId: 'trust', change: -10 },
                        { metricId: 'reputation', change: 5 },
                        { metricId: 'regulatory-compliance', change: -15 }
                      ],
                      relationships: []
                    }
                  }
                ]
              }
            ],
            availableActions: []
          }
        ]
      }
    ],
    characters: [],
    metrics: {
      categories: [
        {
          id: 'cat-1',
          name: 'Impact business',
          description: 'Mesure des impacts sur l\'activité de la banque',
          metrics: [
            {
              id: 'trust',
              name: 'Confiance des clients',
              description: 'Niveau de confiance des clients envers la banque',
              min: 0,
              max: 100,
              initialValue: 70,
              visibleToRoles: ['DG', 'DAF'],
              thresholds: [
                { value: 40, label: 'Critique', color: 'red' },
                { value: 70, label: 'Fragilisée', color: 'orange' },
                { value: 90, label: 'Solide', color: 'green' }
              ]
            },
            {
              id: 'reputation',
              name: 'Réputation',
              description: 'Image publique de l\'institution',
              min: 0,
              max: 100,
              initialValue: 80,
              visibleToRoles: ['DG', 'DRH'],
              thresholds: [
                { value: 40, label: 'Endommagée', color: 'red' },
                { value: 70, label: 'Stable', color: 'orange' },
                { value: 90, label: 'Excellente', color: 'green' }
              ]
            },
            {
              id: 'regulatory-compliance',
              name: 'Conformité réglementaire',
              description: 'Respect des exigences légales (RGPD, etc.)',
              min: 0,
              max: 100,
              initialValue: 85,
              visibleToRoles: ['RSSI', 'DSI', 'DG'],
              thresholds: [
                { value: 60, label: 'Non-conforme', color: 'red' },
                { value: 80, label: 'Partiellement conforme', color: 'orange' },
                { value: 95, label: 'Pleinement conforme', color: 'green' }
              ]
            }
          ]
        }
      ]
    }
  }
];