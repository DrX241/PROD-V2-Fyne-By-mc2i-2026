import { CyberRoleInfo } from '@shared/types/roles';

// Extension de l'interface CyberRoleInfo pour inclure les modules
interface CyberRoleWithModules {
  id: string;
  name: string;
  description: string;
  icon: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    icon: string;
    duration: string;
    skills: string[];
  }>;
}

export const cyberRoles: CyberRoleWithModules[] = [
  {
    id: 'analyste_securite',
    name: 'Analyste de Sécurité',
    description: 'Spécialiste de l\'analyse des menaces et vulnérabilités pour prévenir les incidents.',
    icon: 'Search',
    modules: [
      {
        id: 'analyse_vulnerabilites',
        title: 'Analyse de Vulnérabilités',
        description: 'Techniques et méthodologies pour identifier et évaluer les vulnérabilités des systèmes d\'information.',
        difficulty: 'débutant',
        icon: 'Shield',
        duration: '45 min',
        skills: ['Analyse de risques', 'Veille sécurité', 'Utilisation de scanners']
      },
      {
        id: 'threat_hunting',
        title: 'Threat Hunting',
        description: 'Recherche proactive des menaces avancées qui échappent aux systèmes de détection traditionnels.',
        difficulty: 'intermédiaire',
        icon: 'Binoculars',
        duration: '60 min',
        skills: ['Analyse comportementale', 'Détection d\'anomalies', 'Intelligence artificielle']
      },
      {
        id: 'gestion_risques',
        title: 'Gestion des Risques',
        description: 'Méthodologies et outils pour identifier, évaluer et mitiger les risques cybernétiques.',
        difficulty: 'intermédiaire',
        icon: 'BarChart',
        duration: '50 min',
        skills: ['Analyse d\'impact', 'Métriques de sécurité', 'Planification']
      },
      {
        id: 'intelligence_menaces',
        title: 'Intelligence des Menaces',
        description: 'Collecte et analyse d\'informations sur les nouvelles menaces et acteurs malveillants.',
        difficulty: 'avancé',
        icon: 'Brain',
        duration: '65 min',
        skills: ['OSINT', 'Analyse de malwares', 'Profilage d\'attaquants']
      },
      {
        id: 'systemes_detection',
        title: 'Systèmes de Détection',
        description: 'Configuration et gestion des IDS/IPS et autres solutions de détection.',
        difficulty: 'intermédiaire',
        icon: 'Bell',
        duration: '55 min',
        skills: ['SIEM', 'Règles de détection', 'Analyse de trafic']
      },
      {
        id: 'conformite_securite',
        title: 'Conformité et Standards',
        description: 'Frameworks et normes de sécurité (ISO 27001, NIST, etc.) et leur application.',
        difficulty: 'débutant',
        icon: 'ClipboardCheck',
        duration: '40 min',
        skills: ['Audit', 'Documentation', 'Gouvernance']
      }
    ]
  },
  {
    id: 'pentester',
    name: 'Pentester',
    description: 'Expert en tests d\'intrusion qui simule des attaques pour découvrir les vulnérabilités avant les hackers malveillants.',
    icon: 'Crosshair',
    modules: [
      {
        id: 'reconnaissance',
        title: 'Reconnaissance & Footprinting',
        description: 'Techniques de collecte d\'information et de cartographie des cibles.',
        difficulty: 'débutant',
        icon: 'Scan',
        duration: '40 min',
        skills: ['OSINT', 'Dorks', 'Enumération']
      },
      {
        id: 'exploitation_web',
        title: 'Exploitation Web',
        description: 'Identifier et exploiter les vulnérabilités des applications web (OWASP Top 10).',
        difficulty: 'intermédiaire',
        icon: 'Globe',
        duration: '70 min',
        skills: ['XSS', 'SQLi', 'CSRF', 'Burp Suite']
      },
      {
        id: 'post_exploitation',
        title: 'Post-Exploitation',
        description: 'Techniques d\'élévation de privilèges et de mouvement latéral après l\'accès initial.',
        difficulty: 'avancé',
        icon: 'ArrowUpCircle',
        duration: '65 min',
        skills: ['Persistance', 'Élévation de privilèges', 'Harvesting']
      },
      {
        id: 'exploitation_reseau',
        title: 'Exploitation Réseau',
        description: 'Attaques réseau, exploitation de services et pivoting.',
        difficulty: 'intermédiaire',
        icon: 'Network',
        duration: '60 min',
        skills: ['MITM', 'Exploitation de services', 'Pivoting']
      },
      {
        id: 'ingenierie_sociale',
        title: 'Ingénierie Sociale',
        description: 'Techniques de manipulation psychologique pour tromper les utilisateurs légitimes.',
        difficulty: 'débutant',
        icon: 'Users',
        duration: '45 min',
        skills: ['Phishing', 'Prétexting', 'Baiting']
      },
      {
        id: 'redaction_rapports',
        title: 'Rédaction de Rapports',
        description: 'Documentation professionnelle des tests d\'intrusion et communication des résultats.',
        difficulty: 'intermédiaire',
        icon: 'FileText',
        duration: '35 min',
        skills: ['Documentation', 'Priorisation', 'Communication technique']
      }
    ]
  },
  {
    id: 'responsable_securite',
    name: 'Responsable Sécurité',
    description: 'Supervise la stratégie globale de cybersécurité et gère les équipes de défense.',
    icon: 'Shield',
    modules: [
      {
        id: 'strategie_cyber',
        title: 'Stratégie Cybersécurité',
        description: 'Élaboration et mise en œuvre d\'une stratégie de sécurité alignée aux objectifs business.',
        difficulty: 'avancé',
        icon: 'Target',
        duration: '55 min',
        skills: ['Planification', 'Gestion de budget', 'Alignement business']
      },
      {
        id: 'gestion_incidents',
        title: 'Gestion d\'Incidents',
        description: 'Coordination et gestion des incidents de sécurité majeurs.',
        difficulty: 'avancé',
        icon: 'AlertTriangle',
        duration: '65 min',
        skills: ['Triage', 'Communication de crise', 'Coordination d\'équipe']
      },
      {
        id: 'gouvernance',
        title: 'Gouvernance & Conformité',
        description: 'Mise en place des politiques, standards et cadres réglementaires.',
        difficulty: 'intermédiaire',
        icon: 'FileCheck',
        duration: '50 min',
        skills: ['RGPD', 'ISO 27001', 'Audit']
      },
      {
        id: 'gestion_equipes',
        title: 'Management d\'Équipes',
        description: 'Recrutement, formation et direction des équipes de sécurité.',
        difficulty: 'intermédiaire',
        icon: 'Users',
        duration: '45 min',
        skills: ['Leadership', 'Développement de carrière', 'Gestion de performance']
      },
      {
        id: 'communication_exec',
        title: 'Communication Exécutive',
        description: 'Présentation des enjeux de sécurité aux dirigeants et conseil d\'administration.',
        difficulty: 'avancé',
        icon: 'PresentationChart',
        duration: '40 min',
        skills: ['Storytelling', 'Vulgarisation', 'Persuasion']
      },
      {
        id: 'securite_cloud',
        title: 'Sécurité Cloud',
        description: 'Stratégies et solutions pour sécuriser les environnements cloud modernes.',
        difficulty: 'intermédiaire',
        icon: 'Cloud',
        duration: '60 min',
        skills: ['IAM', 'Sécurité des conteneurs', 'DevSecOps']
      }
    ]
  },
  {
    id: 'expert_forensique',
    name: 'Expert Forensique',
    description: 'Spécialiste de l\'investigation numérique et de l\'analyse des incidents de sécurité.',
    icon: 'Microscope',
    modules: [
      {
        id: 'analyse_memoire',
        title: 'Analyse Mémoire',
        description: 'Techniques d\'extraction et d\'analyse des données en mémoire vive.',
        difficulty: 'avancé',
        icon: 'Cpu',
        duration: '70 min',
        skills: ['Volatility', 'Reconstruction de processus', 'Détection de rootkits']
      },
      {
        id: 'forensique_disque',
        title: 'Forensique Disque',
        description: 'Techniques d\'analyse des supports de stockage et récupération de données.',
        difficulty: 'intermédiaire',
        icon: 'HardDrive',
        duration: '65 min',
        skills: ['Analyse de MFT', 'Carving', 'Timelines']
      },
      {
        id: 'analyse_malware',
        title: 'Analyse de Malware',
        description: 'Techniques d\'analyse statique et dynamique des logiciels malveillants.',
        difficulty: 'avancé',
        icon: 'Bug',
        duration: '75 min',
        skills: ['Reverse engineering', 'Sandboxing', 'IOC extraction']
      },
      {
        id: 'forensique_reseau',
        title: 'Forensique Réseau',
        description: 'Capture et analyse du trafic réseau pour détecter les compromissions.',
        difficulty: 'intermédiaire',
        icon: 'Wifi',
        duration: '60 min',
        skills: ['Wireshark', 'PCAP analysis', 'Network IOCs']
      },
      {
        id: 'chaine_custodie',
        title: 'Chaîne de Custody',
        description: 'Procédures légales de collecte et préservation des preuves numériques.',
        difficulty: 'débutant',
        icon: 'Link',
        duration: '45 min',
        skills: ['Documentation', 'Légalité', 'Préservation']
      },
      {
        id: 'timeline_analyse',
        title: 'Analyse de Timeline',
        description: 'Reconstruction chronologique des événements lors d\'un incident.',
        difficulty: 'intermédiaire',
        icon: 'Clock',
        duration: '55 min',
        skills: ['Correlation', 'Visualisation', 'Analyse temporelle']
      }
    ]
  },
  {
    id: 'ingenieur_reseau',
    name: 'Ingénieur Réseau Sécurité',
    description: 'Expert en conception et sécurisation des infrastructures réseau.',
    icon: 'Network',
    modules: [
      {
        id: 'segmentation_reseau',
        title: 'Segmentation Réseau',
        description: 'Stratégies et implémentation de segmentation pour limiter la propagation des attaques.',
        difficulty: 'intermédiaire',
        icon: 'Divide',
        duration: '55 min',
        skills: ['VLAN', 'Micro-segmentation', 'Zero Trust']
      },
      {
        id: 'detection_intrusion',
        title: 'Détection d\'Intrusion',
        description: 'Déploiement et maintenance des IDS/IPS et solutions de monitoring réseau.',
        difficulty: 'intermédiaire',
        icon: 'Eye',
        duration: '60 min',
        skills: ['Snort', 'Suricata', 'Analyse de logs']
      },
      {
        id: 'securite_perimetre',
        title: 'Sécurité Périmétrique',
        description: 'Configuration des pare-feu, proxies et autres solutions de protection périmétrique.',
        difficulty: 'intermédiaire',
        icon: 'Shield',
        duration: '65 min',
        skills: ['Pare-feu', 'WAF', 'DMZ']
      },
      {
        id: 'vpn_acces_securise',
        title: 'VPN & Accès Sécurisés',
        description: 'Implémentation et gestion des solutions d\'accès distants sécurisés.',
        difficulty: 'débutant',
        icon: 'Lock',
        duration: '50 min',
        skills: ['VPN', 'MFA', 'Zero Trust Network Access']
      },
      {
        id: 'securite_sd_wan',
        title: 'Sécurité SD-WAN',
        description: 'Protection des réseaux étendus définis par logiciel et des interconnexions.',
        difficulty: 'avancé',
        icon: 'Globe',
        duration: '70 min',
        skills: ['Orchestration', 'Encryption', 'Routage sécurisé']
      },
      {
        id: 'securite_iot',
        title: 'Sécurité IoT/OT',
        description: 'Protection des réseaux industriels et des objets connectés.',
        difficulty: 'avancé',
        icon: 'Radio',
        duration: '55 min',
        skills: ['Air gap', 'Protocols industriels', 'Segmentation OT']
      }
    ]
  },
  {
    id: 'analyste_soc',
    name: 'Analyste SOC',
    description: 'Opérateur en centre de sécurité opérationnelle, chargé de la détection et réponse aux incidents.',
    icon: 'Activity',
    modules: [
      {
        id: 'triage_incidents',
        title: 'Triage d\'Incidents',
        description: 'Méthodologie pour évaluer, prioriser et escalader les alertes de sécurité.',
        difficulty: 'débutant',
        icon: 'Filter',
        duration: '45 min',
        skills: ['Qualification d\'alertes', 'Priorisation', 'Escalade']
      },
      {
        id: 'analyse_logs',
        title: 'Analyse de Logs',
        description: 'Techniques d\'analyse des journaux système, réseau et applicatifs.',
        difficulty: 'intermédiaire',
        icon: 'FileText',
        duration: '60 min',
        skills: ['Formats de logs', 'Corrélation', 'Détection d\'anomalies']
      },
      {
        id: 'siem_soar',
        title: 'SIEM & SOAR',
        description: 'Utilisation des plateformes de gestion des événements et d\'orchestration des réponses.',
        difficulty: 'intermédiaire',
        icon: 'Command',
        duration: '65 min',
        skills: ['Règles de corrélation', 'Playbooks', 'Dashboarding']
      },
      {
        id: 'chasse_menaces',
        title: 'Chasse aux Menaces',
        description: 'Méthodologies proactives pour détecter les menaces avancées non identifiées.',
        difficulty: 'avancé',
        icon: 'Search',
        duration: '70 min',
        skills: ['Hypothèses', 'TTP hunting', 'Indicateurs comportementaux']
      },
      {
        id: 'reponse_incidents',
        title: 'Réponse aux Incidents',
        description: 'Procédures de containment, éradication et rétablissement suite à un incident.',
        difficulty: 'intermédiaire',
        icon: 'Flame',
        duration: '55 min',
        skills: ['Isolation', 'Remédiation', 'Post-mortem']
      },
      {
        id: 'outils_detection',
        title: 'Outils de Détection',
        description: 'Maîtrise des outils spécialisés pour la détection des menaces avancées.',
        difficulty: 'intermédiaire',
        icon: 'Tool',
        duration: '50 min',
        skills: ['EDR', 'NDR', 'Honeypots']
      }
    ]
  }
];