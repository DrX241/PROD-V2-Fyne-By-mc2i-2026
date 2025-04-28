import { PersonalityProfile } from './types';

// Profiles de personnalités pour la simulation de crise
export const personalityProfiles: Record<string, PersonalityProfile> = {
  // Direction générale
  nosing: {
    id: 'nosing',
    name: 'Nosing Doeuk',
    role: 'Directeur Général',
    avatar: '/assets/avatars/nosing.jpg',
    tone: 'autoritaire',
    riskTolerance: 'low',
    concerns: [
      'Réputation de l\'entreprise',
      'Coûts financiers',
      'Continuité de l\'activité',
      'Confiance des actionnaires'
    ],
    typicalResponses: {
      positive: [
        'C\'est exactement ce que j\'attendais de vous. Continuez dans cette direction.',
        'Bonne initiative. Je vais personnellement suivre l\'évolution de cette situation.',
        'Je vais informer le conseil d\'administration de votre approche. Ils seront satisfaits.'
      ],
      negative: [
        'Ces décisions coûtent une fortune ! Vous êtes sûr de ce que vous faites ?',
        'Vous rendez-vous compte de l\'impact sur notre image ? On sera dans tous les médias !',
        'Je ne suis pas convaincu. Les actionnaires vont nous massacrer si ça s\'aggrave.'
      ],
      neutral: [
        'Tenez-moi informé de l\'évolution de la situation toutes les heures.',
        'Avez-vous un plan B si la situation s\'aggrave ?',
        'Quelles sont les implications juridiques de cette décision ?'
      ]
    }
  },
  
  // Direction financière
  edouard: {
    id: 'edouard',
    name: 'Edouard Dupont',
    role: 'Directeur Financier',
    avatar: '/assets/avatars/edouard.jpg',
    tone: 'pragmatique',
    riskTolerance: 'medium',
    concerns: [
      'Coûts des opérations',
      'Impact sur le cours de l\'action',
      'Assurances',
      'Optimisation des ressources'
    ],
    typicalResponses: {
      positive: [
        'Cette solution présente un bon rapport coût/efficacité. J\'approuve.',
        'J\'ai provisionné les fonds nécessaires pour cette opération.',
        'Les assurances devraient couvrir une partie des frais, c\'est une bonne nouvelle.'
      ],
      negative: [
        'Avez-vous une idée du coût de cette décision ? C\'est absolument exorbitant !',
        'Nous n\'avons pas budgétisé une telle dépense. Il va falloir sacrifier d\'autres projets.',
        'Je refuse de signer pour cette dépense sans validation du conseil d\'administration.'
      ],
      neutral: [
        'Quelle est l\'estimation financière de cette solution à court et moyen terme ?',
        'Notre police d\'assurance couvre-t-elle ce type d\'incident ?',
        'Nous devrons recalculer nos prévisions trimestrielles suite à cet événement.'
      ]
    }
  },
  
  // Expert IA et Technique
  eddy: {
    id: 'eddy',
    name: 'Eddy Missoni',
    role: 'Expert IA & CTO',
    avatar: '/assets/avatars/eddy.jpg',
    tone: 'technique',
    riskTolerance: 'medium',
    concerns: [
      'Solutions techniques',
      'Intégrité des données',
      'Continuité des services',
      'Innovation dans la résolution'
    ],
    typicalResponses: {
      positive: [
        'D\'un point de vue technique, votre approche est solide. J\'ajouterais seulement quelques précautions supplémentaires.',
        'Mes équipes peuvent mettre en place cette solution dans l\'heure qui suit.',
        'L\'analyse des logs confirme que votre diagnostic était correct. Bien joué.'
      ],
      negative: [
        'Cette approche présente des failles techniques majeures. Nous risquons d\'aggraver la situation.',
        'Impossible de déployer cette solution si rapidement. Nous avons besoin d\'au moins 48h de tests.',
        'Les données sont trop corrompues pour utiliser cette méthode. Il faut envisager une autre approche.'
      ],
      neutral: [
        'Je vais analyser les journaux système pour identifier précisément le vecteur d\'attaque.',
        'Nous pourrions utiliser notre infrastructure de backup pour maintenir les services critiques.',
        'J\'ai besoin de plus d\'informations techniques avant de pouvoir confirmer cette hypothèse.'
      ]
    }
  },
  
  // RSSI
  neil: {
    id: 'neil',
    name: 'Neil Levin',
    role: 'Responsable Sécurité Informatique',
    avatar: '/assets/avatars/neil.jpg',
    tone: 'prudent',
    riskTolerance: 'low',
    concerns: [
      'Conformité aux normes de sécurité',
      'Mitigation des risques',
      'Préservation des preuves',
      'Documentation des incidents'
    ],
    typicalResponses: {
      positive: [
        'Votre décision respecte les bonnes pratiques de sécurité. Je l\'approuve.',
        'Nous avons déjà des procédures documentées pour ce type d\'incident, je les active immédiatement.',
        'Les premières analyses de sécurité confirment que votre approche est solide.'
      ],
      negative: [
        'Cette décision compromet gravement notre posture de sécurité. Je ne peux pas la cautionner.',
        'Nous détruisons potentiellement des preuves cruciales pour l\'enquête future.',
        'Cette approche nous expose à des vulnérabilités supplémentaires. C\'est inacceptable.'
      ],
      neutral: [
        'Avons-nous informé les autorités compétentes comme l\'ANSSI ou la CNIL ?',
        'Je recommande de documenter minutieusement chaque action pour l\'enquête post-incident.',
        'Quelle est notre stratégie de communication interne pour éviter la propagation de l\'incident ?'
      ]
    }
  },
  
  // Le Hacker
  hacker: {
    id: 'hacker',
    name: 'Anon1337',
    role: 'Attaquant',
    avatar: '/assets/avatars/hacker.jpg',
    tone: 'moqueur',
    riskTolerance: 'high',
    concerns: [
      'Rançon',
      'Notoriété',
      'Exposition médiatique',
      'Déstabilisation de l\'entreprise'
    ],
    typicalResponses: {
      positive: [
        'Intéressant... Vous n\'êtes pas aussi incompétents que je le pensais.',
        'Vous gagnez du temps, mais j\'ai encore quelques cartes en main.',
        'Je respecte votre effort, mais n\'oubliez pas que j\'ai toujours une longueur d\'avance.'
      ],
      negative: [
        'Pathétique. Vous appelez ça de la cybersécurité ? J\'ai accès à TOUT.',
        'Tick tock... Chaque minute qui passe, je publie plus de vos données sensibles.',
        'Vous refusez de payer ? Très bien. Je viens d\'envoyer vos fichiers RH à vos concurrents.'
      ],
      neutral: [
        'Le temps joue contre vous. Ma demande double dans 12 heures.',
        'Je surveille chacune de vos tentatives de récupération. Amusant.',
        'Contactez-moi via Tor quand vous serez prêts à négocier sérieusement.'
      ]
    }
  },
  
  // Employé paniqué
  employee: {
    id: 'employee',
    name: 'Marie Laurent',
    role: 'Employée - Service Client',
    avatar: '/assets/avatars/employee.jpg',
    tone: 'paniqué',
    riskTolerance: 'low',
    concerns: [
      'Accès aux outils de travail',
      'Sécurité des données personnelles',
      'Instructions claires',
      'Communication transparente'
    ],
    typicalResponses: {
      positive: [
        'Merci pour ces explications claires ! Je vais suivre vos instructions à la lettre.',
        'Je suis rassurée de voir que la situation est prise en main sérieusement.',
        'J\'ai prévenu tous mes collègues de ces mesures, comme vous l\'avez demandé.'
      ],
      negative: [
        'Mais comment je fais pour travailler maintenant ? Tous nos systèmes sont bloqués !',
        'Mes clients m\'appellent et je n\'ai aucune réponse à leur donner !',
        'On dit que toutes nos données personnelles ont fuité ! C\'est vrai ?'
      ],
      neutral: [
        'Est-ce que je peux utiliser mon ordinateur personnel pour accéder à mes emails ?',
        'Quand est-ce que les systèmes seront rétablis approximativement ?',
        'Devrions-nous alerter nos clients de cette situation ?'
      ]
    }
  },
  
  // Responsable DPO
  dpo: {
    id: 'dpo',
    name: 'Isabelle Dubacq',
    role: 'Déléguée à la Protection des Données',
    avatar: '/assets/avatars/isabelle.jpg',
    tone: 'légaliste',
    riskTolerance: 'low',
    concerns: [
      'Conformité RGPD',
      'Notification aux autorités',
      'Droits des personnes concernées',
      'Documentation de l\'incident'
    ],
    typicalResponses: {
      positive: [
        'Votre décision est conforme à nos obligations légales. J\'approuve.',
        'J\'ai préparé le dossier de notification à la CNIL comme vous l\'avez demandé.',
        'Cette approche protège efficacement les droits des personnes concernées.'
      ],
      negative: [
        'Cette décision nous expose à des sanctions administratives pouvant atteindre 4% de notre CA mondial !',
        'Nous avons une obligation légale de notifier la CNIL sous 72h, nous ne pouvons pas attendre.',
        'Sans documentation précise de cet incident, nous risquons d\'être accusés de négligence.'
      ],
      neutral: [
        'Quelles données personnelles ont été potentiellement compromises ?',
        'Devons-nous informer individuellement les personnes concernées par cette fuite ?',
        'Avons-nous mis à jour notre registre des violations de données comme exigé par le RGPD ?'
      ]
    }
  },
  
  // Relations Presse
  pr: {
    id: 'pr',
    name: 'Yousra Saidani',
    role: 'Directrice Communication',
    avatar: '/assets/avatars/yousra.jpg',
    tone: 'diplomate',
    riskTolerance: 'medium',
    concerns: [
      'Image de l\'entreprise',
      'Communication externe',
      'Relations médias',
      'Discours officiel'
    ],
    typicalResponses: {
      positive: [
        'Votre approche est parfaite pour notre communication de crise. Je m\'en occupe.',
        'J\'ai préparé un communiqué de presse qui reflète cette stratégie.',
        'Les journalistes ont bien reçu notre message de transparence responsable.'
      ],
      negative: [
        'Cette décision va être désastreuse pour notre image ! Les médias vont nous massacrer.',
        'Sans communication proactive, les rumeurs se propagent déjà sur les réseaux sociaux.',
        'Nous devons absolument contrôler le narratif, ou d\'autres le feront à notre place.'
      ],
      neutral: [
        'Que pouvons-nous communiquer officiellement sans compromettre l\'enquête ?',
        'Devrions-nous organiser une conférence de presse ou privilégier un communiqué écrit ?',
        'Notre CEO devrait-il s\'exprimer personnellement sur cette situation ?'
      ]
    }
  }
};

// Export à utiliser dans le CyberCrisisContext
export default personalityProfiles;