import { UserRole } from './types';

// Définition des rôles que l'utilisateur peut choisir
export const userRoles: Record<string, UserRole> = {
  rssi: {
    id: 'rssi',
    title: 'Responsable Sécurité des Systèmes d\'Information',
    description: 'Expert technique chargé de définir et mettre en œuvre la politique de sécurité. Votre expertise technique est respectée, mais vous devez convaincre la direction pour obtenir des budgets.',
    icon: 'shield-lock',
    responsibilities: [
      'Coordonner la réponse technique aux incidents',
      'Identifier les vulnérabilités et recommander des solutions',
      'Mettre en place des mesures de sécurité',
      'Préserver les preuves numériques'
    ],
    difficulty: 'intermédiaire'
  },
  
  dsi: {
    id: 'dsi',
    title: 'Directeur des Systèmes d\'Information',
    description: 'Responsable de l\'ensemble des systèmes informatiques. Vous avez une autorité directe sur les équipes IT et un budget conséquent, mais êtes sous pression de la direction générale.',
    icon: 'server',
    responsibilities: [
      'Garantir la continuité des systèmes critiques',
      'Gérer les équipes techniques pendant la crise',
      'Arbitrer entre sécurité et disponibilité des services',
      'Communiquer avec la direction générale'
    ],
    difficulty: 'expert'
  },
  
  dpo: {
    id: 'dpo',
    title: 'Délégué à la Protection des Données',
    description: 'Garant du respect des réglementations sur les données personnelles. Votre rôle est crucial en cas de fuite de données clients ou employés.',
    icon: 'file-text',
    responsibilities: [
      'Évaluer l\'impact sur les données personnelles',
      'Préparer les notifications aux autorités (CNIL)',
      'Conseiller sur les obligations légales',
      'Documenter l\'incident pour la conformité'
    ],
    difficulty: 'intermédiaire'
  },
  
  dircom: {
    id: 'dircom',
    title: 'Directeur de la Communication',
    description: 'Responsable de l\'image de l\'entreprise et de sa communication externe. Votre priorité est de préserver la réputation de l\'organisation.',
    icon: 'message-square',
    responsibilities: [
      'Élaborer la stratégie de communication de crise',
      'Préparer les communiqués de presse',
      'Gérer les relations avec les médias',
      'Coordonner la communication interne et externe'
    ],
    difficulty: 'intermédiaire'
  },
  
  crisisMgr: {
    id: 'crisisMgr',
    title: 'Responsable Gestion de Crise',
    description: 'Coordinateur des opérations pendant la crise. Vous devez orchestrer les différentes équipes et prendre des décisions rapides.',
    icon: 'alert-triangle',
    responsibilities: [
      'Coordonner la cellule de crise',
      'Prioriser les actions en fonction des risques',
      'Faciliter la communication entre services',
      'Recommander des décisions stratégiques à la direction'
    ],
    difficulty: 'expert'
  },
  
  ceo: {
    id: 'ceo',
    title: 'Directeur Général',
    description: 'Dirigeant de l\'entreprise. Vos décisions ont un impact majeur sur la gestion de la crise, avec des considérations financières et d\'image.',
    icon: 'briefcase',
    responsibilities: [
      'Prendre les décisions stratégiques finales',
      'Gérer les relations avec le conseil d\'administration',
      'Arbitrer les conflits entre départements',
      'Assumer la responsabilité publique de la crise'
    ],
    difficulty: 'expert'
  },
  
  ciso: {
    id: 'ciso',
    title: 'Responsable de la Sécurité de l\'Information',
    description: 'Stratège de la sécurité informatique avec une vision globale. Votre rôle est de traduire les enjeux techniques en risques business.',
    icon: 'key',
    responsibilities: [
      'Évaluer l\'impact business des incidents',
      'Conseiller la direction sur les risques cyber',
      'Superviser la stratégie de réponse aux incidents',
      'Assurer la conformité aux standards de sécurité'
    ],
    difficulty: 'intermédiaire'
  },
  
  consultant: {
    id: 'consultant',
    title: 'Consultant Cybersécurité',
    description: 'Expert externe appelé en renfort. Vous apportez expertise et méthodologie, mais devez gagner la confiance des équipes internes.',
    icon: 'briefcase',
    responsibilities: [
      'Analyser la situation avec un regard externe',
      'Apporter des méthodologies éprouvées',
      'Conseiller sur les meilleures pratiques du secteur',
      'Collaborer avec les équipes internes'
    ],
    difficulty: 'débutant'
  }
};

export default userRoles;