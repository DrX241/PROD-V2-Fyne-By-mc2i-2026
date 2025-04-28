import { CrisisScenario } from './types';

// Scénarios de crise pour le CyberCrisisChallenge
export const crisisScenarios: Record<string, CrisisScenario> = {
  // Scénario 1: Attaque par ransomware
  ransomware: {
    id: 'ransomware',
    title: 'Rançongiciel sur serveurs de production',
    description: 'Un rançongiciel a chiffré l\'ensemble des serveurs de production et de backup. Une demande de rançon de 250 000€ en Bitcoin a été reçue. Les opérations sont totalement paralysées.',
    difficulty: 'intermédiaire',
    initialBudget: 400000,
    initialMessage: 'ALERTE CRITIQUE: Tous les serveurs de production sont inaccessibles. Les écrans affichent un message de demande de rançon. Les équipes techniques confirment que les données sont chiffrées et inaccessibles. La demande est de 250 000€ en Bitcoin sous 72h, après quoi la clé de déchiffrement sera détruite.',
    mainPersonality: 'nosing',
    supportPersonalities: ['neil', 'eddy', 'edouard', 'hacker', 'employee'],
    initialEvent: 'ransomware_initial',
    events: {
      'ransomware_initial': {
        id: 'ransomware_initial',
        description: 'Premiers constats de l\'attaque ransomware',
        trigger: 'time',
        budgetImpact: -25000, // Impact initial pour la mobilisation d'urgence
        scoreImpact: 0,
        reputationImpact: -10,
        nextEvents: ['ransomware_hacker_contact', 'ransomware_employee_panic']
      },
      'ransomware_hacker_contact': {
        id: 'ransomware_hacker_contact',
        description: 'L\'attaquant vous contacte directement',
        trigger: 'time',
        triggerThreshold: 15, // Minutes après le début
        budgetImpact: 0,
        scoreImpact: 0,
        reputationImpact: -5,
        nextEvents: ['ransomware_deadline_approaching']
      },
      'ransomware_employee_panic': {
        id: 'ransomware_employee_panic',
        description: 'Panique des employés face à l\'impossibilité de travailler',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: 0,
        scoreImpact: -10,
        reputationImpact: -15,
        nextEvents: []
      },
      'ransomware_deadline_approaching': {
        id: 'ransomware_deadline_approaching',
        description: 'La deadline pour payer la rançon approche',
        trigger: 'time',
        triggerThreshold: 30,
        budgetImpact: 0,
        scoreImpact: -5,
        reputationImpact: 0,
        nextEvents: ['ransomware_media_leak']
      },
      'ransomware_media_leak': {
        id: 'ransomware_media_leak',
        description: 'Fuite dans les médias concernant l\'attaque',
        trigger: 'time',
        triggerThreshold: 40,
        budgetImpact: -15000,
        scoreImpact: -20,
        reputationImpact: -25,
        nextEvents: []
      },
      'ransomware_pay': {
        id: 'ransomware_pay',
        description: 'Décision de payer la rançon',
        trigger: 'decision',
        triggerDecision: 'pay_ransom',
        budgetImpact: -250000,
        scoreImpact: -40,
        reputationImpact: -15,
        nextEvents: ['ransomware_key_received', 'ransomware_no_key']
      },
      'ransomware_key_received': {
        id: 'ransomware_key_received',
        description: 'Clé de déchiffrement reçue après paiement',
        trigger: 'time',
        triggerThreshold: 5,
        budgetImpact: -50000, // Coûts de restauration
        scoreImpact: 20,
        reputationImpact: 10,
        nextEvents: []
      },
      'ransomware_no_key': {
        id: 'ransomware_no_key',
        description: 'Aucune clé reçue malgré le paiement',
        trigger: 'time',
        triggerThreshold: 5,
        budgetImpact: -75000, // Coûts supplémentaires de récupération
        scoreImpact: -50,
        reputationImpact: -30,
        nextEvents: []
      },
      'ransomware_rebuild': {
        id: 'ransomware_rebuild',
        description: 'Décision de reconstruire les systèmes',
        trigger: 'decision',
        triggerDecision: 'rebuild_systems',
        budgetImpact: -150000,
        scoreImpact: 25,
        reputationImpact: 15,
        nextEvents: ['ransomware_partial_recovery', 'ransomware_full_recovery']
      },
      'ransomware_partial_recovery': {
        id: 'ransomware_partial_recovery',
        description: 'Récupération partielle des systèmes',
        trigger: 'time',
        triggerThreshold: 20,
        budgetImpact: -50000,
        scoreImpact: 10,
        reputationImpact: 5,
        nextEvents: []
      },
      'ransomware_full_recovery': {
        id: 'ransomware_full_recovery',
        description: 'Récupération complète des systèmes',
        trigger: 'time',
        triggerThreshold: 35,
        budgetImpact: -25000,
        scoreImpact: 50,
        reputationImpact: 25,
        nextEvents: []
      }
    }
  },
  
  // Scénario 2: Piratage de messagerie interne
  email_breach: {
    id: 'email_breach',
    title: 'Piratage de messagerie interne',
    description: 'Un attaquant a compromis la messagerie d\'entreprise et a accès à toutes les communications internes depuis 3 mois. Des emails sensibles sont menacés d\'être divulgués publiquement.',
    difficulty: 'débutant',
    initialBudget: 400000,
    initialMessage: 'ALERTE SÉCURITÉ: La DSI vient de détecter une activité suspecte sur les serveurs de messagerie. Un acteur malveillant semble avoir accès aux emails depuis environ 3 mois. Nous venons de recevoir un message anonyme avec des copies d\'emails confidentiels et une menace de publication.',
    mainPersonality: 'neil',
    supportPersonalities: ['nosing', 'dpo', 'pr', 'hacker', 'employee'],
    initialEvent: 'email_breach_initial',
    events: {
      'email_breach_initial': {
        id: 'email_breach_initial',
        description: 'Découverte de la compromission des emails',
        trigger: 'time',
        budgetImpact: -15000, // Analyse initiale
        scoreImpact: 0,
        reputationImpact: -5,
        nextEvents: ['email_breach_extortion', 'email_breach_analysis']
      },
      'email_breach_extortion': {
        id: 'email_breach_extortion',
        description: 'Demande d\'extorsion par l\'attaquant',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: 0,
        scoreImpact: -5,
        reputationImpact: -10,
        nextEvents: []
      },
      'email_breach_analysis': {
        id: 'email_breach_analysis',
        description: 'Résultats de l\'analyse forensique',
        trigger: 'time',
        triggerThreshold: 15,
        budgetImpact: -25000,
        scoreImpact: 15,
        reputationImpact: 0,
        nextEvents: ['email_breach_sensitive_discovered']
      },
      'email_breach_sensitive_discovered': {
        id: 'email_breach_sensitive_discovered',
        description: 'Découverte de données sensibles compromises',
        trigger: 'time',
        triggerThreshold: 20,
        budgetImpact: -5000,
        scoreImpact: -10,
        reputationImpact: -15,
        nextEvents: ['email_breach_media_inquiry']
      },
      'email_breach_media_inquiry': {
        id: 'email_breach_media_inquiry',
        description: 'Demandes de renseignements des médias',
        trigger: 'time',
        triggerThreshold: 30,
        budgetImpact: 0,
        scoreImpact: 0,
        reputationImpact: -20,
        nextEvents: []
      },
      'email_breach_pay': {
        id: 'email_breach_pay',
        description: 'Décision de payer l\'extorsion',
        trigger: 'decision',
        triggerDecision: 'pay_extortion',
        budgetImpact: -100000,
        scoreImpact: -30,
        reputationImpact: -5,
        nextEvents: ['email_breach_continued_threats']
      },
      'email_breach_continued_threats': {
        id: 'email_breach_continued_threats',
        description: 'Nouvelles menaces malgré le paiement',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: 0,
        scoreImpact: -50,
        reputationImpact: -25,
        nextEvents: []
      },
      'email_breach_secure': {
        id: 'email_breach_secure',
        description: 'Sécurisation des systèmes de messagerie',
        trigger: 'decision',
        triggerDecision: 'secure_email',
        budgetImpact: -75000,
        scoreImpact: 30,
        reputationImpact: 15,
        nextEvents: ['email_breach_limited_leaks', 'email_breach_controlled']
      },
      'email_breach_limited_leaks': {
        id: 'email_breach_limited_leaks',
        description: 'Publication limitée d\'emails sensibles',
        trigger: 'time',
        triggerThreshold: 15,
        budgetImpact: -25000,
        scoreImpact: -15,
        reputationImpact: -30,
        nextEvents: []
      },
      'email_breach_controlled': {
        id: 'email_breach_controlled',
        description: 'Situation maîtrisée, fuites évitées',
        trigger: 'time',
        triggerThreshold: 20,
        budgetImpact: -10000,
        scoreImpact: 50,
        reputationImpact: 25,
        nextEvents: []
      },
      'email_breach_notify': {
        id: 'email_breach_notify',
        description: 'Notification préventive aux parties concernées',
        trigger: 'decision',
        triggerDecision: 'notify_stakeholders',
        budgetImpact: -35000,
        scoreImpact: 25,
        reputationImpact: 10,
        nextEvents: ['email_breach_positive_reception']
      },
      'email_breach_positive_reception': {
        id: 'email_breach_positive_reception',
        description: 'Réception positive de la transparence',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: 0,
        scoreImpact: 40,
        reputationImpact: 30,
        nextEvents: []
      }
    }
  },
  
  // Scénario 3: Fuite massive de données RH
  data_leak: {
    id: 'data_leak',
    title: 'Fuite massive de données RH',
    description: 'Une fuite de données majeure a exposé les informations personnelles et financières de tous les employés. Les premiers fichiers commencent à circuler sur le dark web.',
    difficulty: 'expert',
    initialBudget: 400000,
    initialMessage: 'ALERTE RGPD: Nous venons d\'être informés par un chercheur en sécurité qu\'une base de données contenant des informations personnelles de nos 2800 employés est en vente sur le dark web. Les données incluent noms, adresses, numéros de sécurité sociale, coordonnées bancaires et salaires.',
    mainPersonality: 'dpo',
    supportPersonalities: ['nosing', 'neil', 'pr', 'edouard', 'employee'],
    initialEvent: 'data_leak_initial',
    events: {
      'data_leak_initial': {
        id: 'data_leak_initial',
        description: 'Confirmation de la fuite de données',
        trigger: 'time',
        budgetImpact: -20000, // Investigation initiale
        scoreImpact: 0,
        reputationImpact: -15,
        nextEvents: ['data_leak_identification', 'data_leak_employee_notification']
      },
      'data_leak_identification': {
        id: 'data_leak_identification',
        description: 'Identification de la source de la fuite',
        trigger: 'time',
        triggerThreshold: 15,
        budgetImpact: -15000,
        scoreImpact: 25,
        reputationImpact: 5,
        nextEvents: ['data_leak_cnil_notification']
      },
      'data_leak_employee_notification': {
        id: 'data_leak_employee_notification',
        description: 'Employés informés de la fuite',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: -10000,
        scoreImpact: 10,
        reputationImpact: -10,
        nextEvents: ['data_leak_employee_panic']
      },
      'data_leak_employee_panic': {
        id: 'data_leak_employee_panic',
        description: 'Panique et colère des employés',
        trigger: 'time',
        triggerThreshold: 5,
        budgetImpact: 0,
        scoreImpact: -15,
        reputationImpact: -20,
        nextEvents: []
      },
      'data_leak_cnil_notification': {
        id: 'data_leak_cnil_notification',
        description: 'Notification officielle à la CNIL',
        trigger: 'decision',
        triggerDecision: 'notify_cnil',
        budgetImpact: -5000,
        scoreImpact: 30,
        reputationImpact: -5,
        nextEvents: ['data_leak_cnil_investigation']
      },
      'data_leak_cnil_investigation': {
        id: 'data_leak_cnil_investigation',
        description: 'Ouverture d\'une enquête de la CNIL',
        trigger: 'time',
        triggerThreshold: 20,
        budgetImpact: -25000,
        scoreImpact: 0,
        reputationImpact: -15,
        nextEvents: []
      },
      'data_leak_identity_protection': {
        id: 'data_leak_identity_protection',
        description: 'Mise en place de services de protection d\'identité',
        trigger: 'decision',
        triggerDecision: 'provide_protection',
        budgetImpact: -150000,
        scoreImpact: 40,
        reputationImpact: 25,
        nextEvents: ['data_leak_positive_feedback']
      },
      'data_leak_positive_feedback': {
        id: 'data_leak_positive_feedback',
        description: 'Retours positifs des employés sur les mesures prises',
        trigger: 'time',
        triggerThreshold: 10,
        budgetImpact: 0,
        scoreImpact: 30,
        reputationImpact: 20,
        nextEvents: []
      },
      'data_leak_legal_action': {
        id: 'data_leak_legal_action',
        description: 'Actions en justice de certains employés',
        trigger: 'time',
        triggerThreshold: 30,
        budgetImpact: -75000,
        scoreImpact: -25,
        reputationImpact: -30,
        nextEvents: []
      },
      'data_leak_media_coverage': {
        id: 'data_leak_media_coverage',
        description: 'Couverture médiatique nationale',
        trigger: 'time',
        triggerThreshold: 25,
        budgetImpact: -25000,
        scoreImpact: -20,
        reputationImpact: -40,
        nextEvents: []
      },
      'data_leak_remediation': {
        id: 'data_leak_remediation',
        description: 'Plan complet de remédiation et sécurisation',
        trigger: 'decision',
        triggerDecision: 'implement_remediation',
        budgetImpact: -100000,
        scoreImpact: 50,
        reputationImpact: 15,
        nextEvents: ['data_leak_audit_success']
      },
      'data_leak_audit_success': {
        id: 'data_leak_audit_success',
        description: 'Audit externe validant les mesures mises en place',
        trigger: 'time',
        triggerThreshold: 20,
        budgetImpact: -15000,
        scoreImpact: 40,
        reputationImpact: 30,
        nextEvents: []
      }
    }
  }
};

export default crisisScenarios;