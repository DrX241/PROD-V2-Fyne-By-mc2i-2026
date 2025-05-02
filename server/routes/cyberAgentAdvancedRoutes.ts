import express from 'express';
import { Request, Response } from 'express';
import { CyberRole } from '../../shared/types/roles';
import { generateMission, generateMissionStep, generateChoiceConsequence } from '../services/missionGenerator';

const router = express.Router();

/**
 * Récupérer tous les rôles disponibles
 */
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = [
      {
        id: 'rssi',
        name: 'RSSI',
        fullName: 'Responsable de la Sécurité des Systèmes d\'Information',
        description: 'Responsable de la stratégie globale de sécurité et de la conformité',
        icon: 'Shield'
      },
      {
        id: 'pentester',
        name: 'Pentester',
        fullName: 'Expert en Tests d\'Intrusion',
        description: 'Spécialiste des tests de pénétration et de la sécurité offensive',
        icon: 'Terminal'
      },
      {
        id: 'analyste_soc',
        name: 'Analyste SOC',
        fullName: 'Analyste au Centre Opérationnel de Sécurité',
        description: 'Expert en détection et réponse aux incidents de sécurité',
        icon: 'Search'
      },
      {
        id: 'dev_securite',
        name: 'Développeur Sécurité',
        fullName: 'Développeur spécialisé en Sécurité Applicative',
        description: 'Spécialiste de la sécurité dans le cycle de développement logiciel',
        icon: 'Code'
      },
      {
        id: 'consultant',
        name: 'Consultant',
        fullName: 'Consultant en Cybersécurité',
        description: 'Expert-conseil en stratégie et solutions de sécurité',
        icon: 'Briefcase'
      },
      {
        id: 'architecte',
        name: 'Architecte',
        fullName: 'Architecte Sécurité',
        description: 'Conçoit les infrastructures sécurisées et les politiques de défense',
        icon: 'Network'
      }
    ];
    
    res.json({ success: true, roles });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des rôles',
      error: (error as Error).message
    });
  }
});

/**
 * Récupérer les modules pour un rôle spécifique
 */
router.get('/roles/:roleId/modules', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    
    // Modules communs à tous les rôles
    const baseModules = [
      {
        id: 'gestion_incidents',
        name: 'Gestion d\'Incidents',
        description: 'Apprenez à gérer efficacement les incidents de sécurité',
        difficulty: 'intermédiaire',
        icon: 'AlertTriangle',
        unlocked: true
      },
      {
        id: 'conformite_reglementaire',
        name: 'Conformité Réglementaire',
        description: 'Maîtrisez les exigences légales en matière de cybersécurité',
        difficulty: 'avancé',
        icon: 'FileCheck',
        unlocked: true
      }
    ];
    
    // Modules spécifiques par rôle
    let roleSpecificModules: any[] = [];
    
    switch (roleId) {
      case 'rssi':
        roleSpecificModules = [
          {
            id: 'strategie_securite',
            name: 'Stratégie de Sécurité',
            description: 'Développez une stratégie de sécurité robuste pour votre organisation',
            difficulty: 'expert',
            icon: 'Strategy',
            unlocked: true
          },
          {
            id: 'gouvernance',
            name: 'Gouvernance de la Sécurité',
            description: 'Établissez un cadre de gouvernance efficace pour la cybersécurité',
            difficulty: 'expert',
            icon: 'FileCheck',
            unlocked: true
          },
          {
            id: 'gestion_risques',
            name: 'Gestion des Risques',
            description: 'Identifiez, évaluez et atténuez les risques de sécurité',
            difficulty: 'avancé',
            icon: 'BarChart',
            unlocked: true
          },
          {
            id: 'crise_cyber',
            name: 'Gestion de Crise Cyber',
            description: 'Préparez et dirigez la réponse à une crise majeure',
            difficulty: 'expert',
            icon: 'AlertOctagon',
            unlocked: true
          }
        ];
        break;
        
      case 'pentester':
        roleSpecificModules = [
          {
            id: 'reconnaissance',
            name: 'Reconnaissance',
            description: 'Collectez des informations sur les cibles potentielles',
            difficulty: 'intermédiaire',
            icon: 'Search',
            unlocked: true
          },
          {
            id: 'exploitation',
            name: 'Exploitation de Vulnérabilités',
            description: 'Exploitez les failles pour tester la sécurité des systèmes',
            difficulty: 'expert',
            icon: 'Bug',
            unlocked: true
          },
          {
            id: 'post_exploitation',
            name: 'Post-Exploitation',
            description: 'Évaluez l\'impact réel d\'une compromission de sécurité',
            difficulty: 'expert',
            icon: 'Key',
            unlocked: true
          },
          {
            id: 'redteam',
            name: 'Opérations Red Team',
            description: 'Conduisez des simulations avancées d\'attaques ciblées',
            difficulty: 'expert',
            icon: 'Target',
            unlocked: true
          }
        ];
        break;
        
      case 'analyste_soc':
        roleSpecificModules = [
          {
            id: 'detection',
            name: 'Détection des Menaces',
            description: 'Identifiez les activités suspectes et les comportements malveillants',
            difficulty: 'intermédiaire',
            icon: 'Eye',
            unlocked: true
          },
          {
            id: 'analyse_forensique',
            name: 'Analyse Forensique',
            description: 'Menez des investigations numériques approfondies',
            difficulty: 'avancé',
            icon: 'Microscope',
            unlocked: true
          },
          {
            id: 'chasse_menaces',
            name: 'Chasse aux Menaces',
            description: 'Recherchez proactivement les menaces non détectées',
            difficulty: 'expert',
            icon: 'Crosshair',
            unlocked: true
          },
          {
            id: 'analyse_malware',
            name: 'Analyse de Malware',
            description: 'Étudiez et comprenez les logiciels malveillants',
            difficulty: 'expert',
            icon: 'Virus',
            unlocked: true
          }
        ];
        break;
        
      case 'dev_securite':
        roleSpecificModules = [
          {
            id: 'securite_applicative',
            name: 'Sécurité Applicative',
            description: 'Développez des applications robustes contre les attaques',
            difficulty: 'intermédiaire',
            icon: 'Code',
            unlocked: true
          },
          {
            id: 'devsecops',
            name: 'DevSecOps',
            description: 'Intégrez la sécurité dans le cycle de développement',
            difficulty: 'avancé',
            icon: 'GitBranch',
            unlocked: true
          },
          {
            id: 'tests_securite',
            name: 'Tests de Sécurité',
            description: 'Validez la robustesse de vos applications',
            difficulty: 'intermédiaire',
            icon: 'CheckCircle',
            unlocked: true
          },
          {
            id: 'securite_api',
            name: 'Sécurité des API',
            description: 'Protégez vos interfaces de programmation',
            difficulty: 'avancé',
            icon: 'Link',
            unlocked: true
          }
        ];
        break;
        
      case 'consultant':
        roleSpecificModules = [
          {
            id: 'audit_securite',
            name: 'Audit de Sécurité',
            description: 'Évaluez le niveau de sécurité d\'une organisation',
            difficulty: 'avancé',
            icon: 'ClipboardCheck',
            unlocked: true
          },
          {
            id: 'conseil_strategique',
            name: 'Conseil Stratégique',
            description: 'Conseiller efficacement sur les orientations de sécurité',
            difficulty: 'expert',
            icon: 'TrendingUp',
            unlocked: true
          },
          {
            id: 'analyse_conformite',
            name: 'Analyse de Conformité',
            description: 'Évaluez la conformité aux normes et réglementations',
            difficulty: 'intermédiaire',
            icon: 'CheckSquare',
            unlocked: true
          },
          {
            id: 'gestion_projets_securite',
            name: 'Gestion de Projets de Sécurité',
            description: 'Pilotez des projets de transformation sécurité',
            difficulty: 'avancé',
            icon: 'Calendar',
            unlocked: true
          }
        ];
        break;
        
      case 'architecte':
        roleSpecificModules = [
          {
            id: 'conception_securite',
            name: 'Conception Sécurisée',
            description: 'Créez des architectures résistantes aux attaques',
            difficulty: 'expert',
            icon: 'Layers',
            unlocked: true
          },
          {
            id: 'securite_cloud',
            name: 'Sécurité Cloud',
            description: 'Sécurisez les environnements cloud et multi-cloud',
            difficulty: 'avancé',
            icon: 'Cloud',
            unlocked: true
          },
          {
            id: 'securite_zero_trust',
            name: 'Sécurité Zero Trust',
            description: 'Implémentez l\'approche "Ne faire confiance à rien, vérifier tout"',
            difficulty: 'expert',
            icon: 'Shield',
            unlocked: true
          },
          {
            id: 'defense_perimetre',
            name: 'Défense du Périmètre',
            description: 'Protégez efficacement les frontières de votre réseau',
            difficulty: 'intermédiaire',
            icon: 'Lock',
            unlocked: true
          }
        ];
        break;
    }
    
    const modules = [...roleSpecificModules, ...baseModules];
    res.json({ success: true, modules });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des modules',
      error: (error as Error).message
    });
  }
});

/**
 * Récupérer le test d'accès pour un rôle spécifique
 */
router.get('/roles/:roleId/test', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    
    // Structure de base pour tous les tests
    const baseTest = {
      id: `test_${roleId}`,
      name: 'Test d\'Accès',
      description: 'Répondez aux questions suivantes pour démontrer vos connaissances',
      duration: '10 minutes',
      passingScore: 70
    };
    
    // Questions spécifiques par rôle
    let questions: any[] = [];
    
    switch (roleId) {
      case 'rssi':
        questions = [
          {
            id: 'q1',
            question: 'Quelle norme internationale fournit un cadre pour la gestion de la sécurité de l\'information ?',
            options: ['ISO 27001', 'NIST 800-53', 'PCI DSS', 'COBIT'],
            correctAnswer: 'ISO 27001',
            explanation: 'L\'ISO 27001 est la norme internationale pour les systèmes de management de la sécurité de l\'information.'
          },
          {
            id: 'q2',
            question: 'Quel document définit la position officielle d\'une organisation sur la sécurité de l\'information ?',
            options: ['Plan de continuité d\'activité', 'Politique de sécurité', 'Plan de reprise d\'activité', 'Charte informatique'],
            correctAnswer: 'Politique de sécurité',
            explanation: 'La politique de sécurité est le document de haut niveau qui définit l\'approche de l\'organisation en matière de sécurité.'
          },
          {
            id: 'q3',
            question: 'En cas de violation de données, quelle est la première action qu\'un RSSI devrait entreprendre ?',
            options: ['Informer les médias', 'Contacter les autorités de régulation', 'Évaluer l\'étendue de la violation', 'Licencier les responsables'],
            correctAnswer: 'Évaluer l\'étendue de la violation',
            explanation: 'La première étape consiste à comprendre ce qui s\'est passé et quelle est l\'ampleur du problème avant de prendre d\'autres actions.'
          }
        ];
        break;
        
      // Ajoutez d'autres cas pour les différents rôles
      case 'pentester':
        questions = [
          {
            id: 'q1',
            question: 'Quelle méthodologie est largement utilisée pour structurer les tests d\'intrusion ?',
            options: ['OWASP Top 10', 'PTES (Penetration Testing Execution Standard)', 'CVSS', 'STRIDE'],
            correctAnswer: 'PTES (Penetration Testing Execution Standard)',
            explanation: 'Le PTES fournit un cadre complet pour effectuer des tests de pénétration.'
          },
          {
            id: 'q2',
            question: 'Quelle phase d\'un test d\'intrusion implique la collecte passive d\'informations sur la cible ?',
            options: ['Exploitation', 'Reconnaissance', 'Énumération', 'Post-exploitation'],
            correctAnswer: 'Reconnaissance',
            explanation: 'La reconnaissance est la première phase où l\'on collecte des informations sans interagir directement avec la cible.'
          },
          {
            id: 'q3',
            question: 'Qu\'est-ce qu\'un "test d\'intrusion en boîte noire" ?',
            options: ['Un test effectué sans aucune information préalable sur la cible', 'Un test effectué uniquement la nuit', 'Un test effectué avec une connaissance complète de la cible', 'Un test ciblant uniquement les systèmes critiques'],
            correctAnswer: 'Un test effectué sans aucune information préalable sur la cible',
            explanation: 'Un test en boîte noire simule une attaque réelle où l\'attaquant n\'a pas de connaissance interne du système.'
          }
        ];
        break;
        
      case 'analyste_soc':
        questions = [
          {
            id: 'q1',
            question: 'Quel outil est utilisé pour collecter, analyser et corréler les logs de sécurité ?',
            options: ['Antivirus', 'SIEM (Security Information and Event Management)', 'Firewall', 'VPN'],
            correctAnswer: 'SIEM (Security Information and Event Management)',
            explanation: 'Un SIEM est l\'outil principal utilisé dans un SOC pour centraliser et analyser les événements de sécurité.'
          },
          {
            id: 'q2',
            question: 'Qu\'est-ce qu\'un "faux positif" dans la détection des menaces ?',
            options: ['Une alerte qui signale correctement une menace', 'Une alerte qui ne détecte pas une menace réelle', 'Une alerte qui signale une menace inexistante', 'Une menace qui ne déclenche pas d\'alerte'],
            correctAnswer: 'Une alerte qui signale une menace inexistante',
            explanation: 'Un faux positif est une alerte qui indique incorrectement la présence d\'une menace alors qu\'il n\'y en a pas.'
          },
          {
            id: 'q3',
            question: 'Quelle métrique mesure le temps entre la détection d\'un incident et sa résolution ?',
            options: ['MTTD (Mean Time To Detect)', 'MTTR (Mean Time To Respond)', 'MTBF (Mean Time Between Failures)', 'RTO (Recovery Time Objective)'],
            correctAnswer: 'MTTR (Mean Time To Respond)',
            explanation: 'Le MTTR mesure l\'efficacité d\'une équipe SOC à résoudre les incidents après leur détection.'
          }
        ];
        break;
        
      // Ajoutez d'autres cas pour les différents rôles
      default:
        questions = [
          {
            id: 'q1',
            question: 'Quel principe fondamental de sécurité garantit que seules les personnes autorisées peuvent accéder aux informations ?',
            options: ['Intégrité', 'Confidentialité', 'Disponibilité', 'Non-répudiation'],
            correctAnswer: 'Confidentialité',
            explanation: 'La confidentialité est le principe qui garantit que l\'information n\'est accessible qu\'aux personnes autorisées.'
          },
          {
            id: 'q2',
            question: 'Quelle est la meilleure définition de la cybersécurité ?',
            options: ['Installation d\'antivirus', 'Protection des systèmes informatiques contre les attaques', 'Cryptage des données', 'Sauvegarde régulière des données'],
            correctAnswer: 'Protection des systèmes informatiques contre les attaques',
            explanation: 'La cybersécurité englobe l\'ensemble des pratiques visant à protéger les systèmes, réseaux et données contre les attaques.'
          },
          {
            id: 'q3',
            question: 'Quel type d\'attaque consiste à injecter du code malveillant dans une application web ?',
            options: ['Phishing', 'DoS (Denial of Service)', 'Injection SQL', 'Social Engineering'],
            correctAnswer: 'Injection SQL',
            explanation: 'L\'injection SQL est une technique d\'attaque qui consiste à insérer du code SQL malveillant dans les requêtes d\'une application.'
          }
        ];
    }
    
    const test = {
      ...baseTest,
      questions
    };
    
    res.json({ success: true, test });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du test',
      error: (error as Error).message
    });
  }
});

/**
 * Générer une mission pour un rôle et module spécifiques
 */
router.post('/generate-mission', async (req: Request, res: Response) => {
  try {
    const { roleId, moduleId, userName } = req.body;
    
    if (!roleId || !moduleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres roleId et moduleId sont requis' 
      });
    }
    
    const missionBrief = await generateMission({
      roleId: roleId as CyberRole,
      moduleId,
      userName: userName || 'Agent'
    });
    
    res.json({ success: true, mission: missionBrief });
    
  } catch (error) {
    console.error('Erreur lors de la génération de la mission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de la mission',
      error: (error as Error).message
    });
  }
});

/**
 * Générer une étape de mission avec des choix
 */
router.post('/generate-mission-step', async (req: Request, res: Response) => {
  try {
    const { missionBrief, currentSituation } = req.body;
    
    if (!missionBrief) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le paramètre missionBrief est requis' 
      });
    }
    
    const missionStep = await generateMissionStep(
      missionBrief,
      currentSituation
    );
    
    res.json({ success: true, step: missionStep });
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'étape de mission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de l\'étape de mission',
      error: (error as Error).message
    });
  }
});

/**
 * Générer la conséquence d'un choix de mission
 */
router.post('/generate-choice-consequence', async (req: Request, res: Response) => {
  try {
    const { missionBrief, choice } = req.body;
    
    if (!missionBrief || !choice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres missionBrief et choice sont requis' 
      });
    }
    
    const consequence = await generateChoiceConsequence(
      missionBrief,
      choice
    );
    
    res.json({ success: true, consequence });
    
  } catch (error) {
    console.error('Erreur lors de la génération de la conséquence:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de la conséquence',
      error: (error as Error).message
    });
  }
});

export default router;