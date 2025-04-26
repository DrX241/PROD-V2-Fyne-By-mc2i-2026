import { Request, Response } from 'express';
import { openAIService } from './services/openai';

/**
 * Génère un débriefing personnalisé basé sur les actions de l'utilisateur
 */
export async function generateDebriefing(req: Request, res: Response) {
  try {
    const { userActions, correctApproach, scenario, performanceScore } = req.body;

    if (!userActions || !correctApproach || !scenario) {
      return res.status(400).json({
        error: "Données manquantes pour générer le débriefing"
      });
    }

    // Définir le type de scénario
    let scenarioContext: string;
    switch (scenario) {
      case 'data_breach':
        scenarioContext = 'fuite de données';
        break;
      case 'ransomware':
        scenarioContext = 'attaque par ransomware';
        break;
      case 'phishing':
        scenarioContext = 'tentative de phishing';
        break;
      case 'insider_threat':
        scenarioContext = 'menace interne';
        break;
      default:
        scenarioContext = 'incident de cybersécurité';
    }

    // Générer le système prompt pour l'IA
    const systemPrompt = `
      Tu es un expert en cybersécurité chargé d'évaluer une simulation d'enquête sur une ${scenarioContext}.
      Ta mission est de fournir un débriefing éducatif qui aidera l'apprenant à développer ses compétences.
      
      Fournir:
      1. Un résumé de la performance de l'apprenant (basé sur ses actions et son score final)
      2. Les points forts et les axes d'amélioration
      3. De 2 à 3 leçons clés à retenir de ce scénario
      4. Un exemple anonymisé de cas réel similaire avec son impact (un Retour d'EXpérience - REX)
      5. Des ressources à consulter pour approfondir ce type de menace
      
      Format: organise le contenu en sections clairement délimitées, avec des titres en gras.
      Ton: informatif et constructif, jamais condescendant même si le score est bas.
      Longueur: 300-400 mots au total.
    `;

    // Construire le message utilisateur
    const userMessage = `
      Actions de l'utilisateur pendant la simulation:
      ${userActions.map((action: string) => `- ${action}`).join('\n')}
      
      Approche recommandée pour ce scénario:
      ${correctApproach.map((step: string) => `- ${step}`).join('\n')}
      
      Type de scénario: ${scenarioContext}
      Score de performance: ${performanceScore}/100
      
      Génère un débriefing éducatif complet pour cet apprenant.
    `;

    // Générer le débriefing avec l'IA
    const completion = await openAIService.getChatCompletionSecondary({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    });

    if (!completion) {
      throw new Error("Échec de la génération du débriefing");
    }

    const debriefingContent = completion.choices[0].message.content;

    return res.json({
      success: true,
      debriefing: debriefingContent
    });

  } catch (error) {
    console.error("Erreur lors de la génération du débriefing:", error);
    return res.status(500).json({
      error: "Erreur lors de la génération du débriefing",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Fournit de la documentation contextuelle basée sur le scénario
 */
export async function getContextualDocumentation(req: Request, res: Response) {
  try {
    const { context, term } = req.query;

    if (!context) {
      return res.status(400).json({
        error: "Contexte requis pour la documentation"
      });
    }

    // Récupérer la documentation depuis la base de connaissances
    let documents = getDocumentsFromKnowledgeBase(context as string);
    
    // Si un terme spécifique est fourni, filtrer les documents pertinents
    if (term) {
      const termLower = (term as string).toLowerCase();
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(termLower) || 
        doc.content.toLowerCase().includes(termLower)
      );
    }

    // Si aucun document n'est trouvé, utiliser la génération IA pour créer la documentation
    if (documents.length === 0) {
      try {
        // Générer la documentation avec l'IA
        const systemPrompt = `
          Tu es un expert en cybersécurité spécialisé dans la création de documentation technique.
          Produis une documentation précise, factuelle et éducative sur le sujet demandé.
          Format: organise le contenu en sections avec des titres et sous-titres clairs.
          Ton: informatif et technique, accessible aux professionnels.
          Inclure: définitions, enjeux, bonnes pratiques, et mesures de protection.
          
          Réponds avec un tableau de 2 à 4 documents au format JSON. Chaque document doit avoir:
          1. Un titre concis
          2. Un contenu détaillé de 150-200 mots
          3. Une URL optionnelle vers une ressource externe pertinente (ANSSI, CNIL, etc.)
        `;

        const contextMap: Record<string, string> = {
          'data_breach': 'fuites de données',
          'ransomware': 'rançongiciels',
          'phishing': 'hameçonnage',
          'insider_threat': 'menaces internes',
          'social_engineering': 'ingénierie sociale'
        };

        const contextLabel = contextMap[context as string] || context;
        const termLabel = term ? ` sur le terme spécifique "${term}"` : '';

        const userMessage = `
          Je dois produire une documentation sur les ${contextLabel}${termLabel}.
          Génère 2 à 4 documents informatifs sur ce sujet.
        `;

        const completion = await openAIService.getChatCompletionSecondary({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.5
        });

        if (!completion) {
          throw new Error("Échec de la génération de documentation");
        }

        const aiResponseContent = completion.choices[0].message.content;
        
        // Extraire le JSON de la réponse
        const jsonMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                          aiResponseContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (jsonMatch) {
          const jsonContent = jsonMatch[1] || jsonMatch[0];
          try {
            const parsedDocs = JSON.parse(jsonContent);
            if (Array.isArray(parsedDocs)) {
              documents = parsedDocs;
            } else {
              documents = [parsedDocs];
            }
          } catch (parseError) {
            documents = getFallbackDocumentation(context as string);
          }
        } else {
          // Format texte simple si le JSON n'est pas détecté
          documents = [
            {
              title: `Documentation sur ${contextLabel}`,
              content: aiResponseContent
            }
          ];
        }
      } catch (aiError) {
        console.error("Erreur IA, utilisation de la documentation de secours:", aiError);
        documents = getFallbackDocumentation(context as string);
      }
    }

    return res.json({
      success: true,
      documentation: documents
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la documentation:", error);
    return res.status(500).json({
      error: "Erreur lors de la récupération de la documentation",
      details: error instanceof Error ? error.message : "Erreur inconnue",
      documentation: getFallbackDocumentation(req.query.context as string)
    });
  }
}

/**
 * Récupère la documentation depuis la base de connaissances
 */
function getDocumentsFromKnowledgeBase(context: string): { title: string, content: string, url?: string }[] {
  // Base de connaissances structurée par contexte
  const knowledgeBase: Record<string, { title: string, content: string, url?: string }[]> = {
    'data_breach': [
      {
        title: "Comprendre les fuites de données",
        content: "Une fuite de données survient lorsque des informations sensibles ou confidentielles sont exposées à des parties non autorisées. Ces incidents peuvent être causés par des attaques malveillantes, des erreurs humaines, ou des vulnérabilités dans les systèmes. Les impacts incluent des pertes financières, des dommages réputationnels et des sanctions légales. Les organisations doivent mettre en place des contrôles préventifs, comme le chiffrement des données, la gestion des accès, et la formation des employés, ainsi que des mesures de détection rapide."
      },
      {
        title: "Cadre juridique et obligations",
        content: "En France et en Europe, le RGPD impose aux organisations de signaler les violations de données personnelles à l'autorité de contrôle (CNIL) dans les 72 heures suivant leur détection, si ces violations présentent un risque pour les droits et libertés des personnes. Les organisations doivent également notifier les personnes concernées lorsque la violation présente un risque élevé. Le non-respect de ces obligations peut entraîner des amendes allant jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial.",
        url: "https://www.cnil.fr/fr/notification-de-violations-de-donnees-personnelles"
      },
      {
        title: "Stratégies de détection et d'investigation",
        content: "La détection précoce des fuites de données repose sur plusieurs mécanismes: surveillance des activités inhabituelles, analyse des journaux système, outils de détection d'intrusion (IDS), et systèmes de prévention des pertes de données (DLP). L'investigation nécessite une approche méthodique incluant la préservation des preuves, l'analyse des journaux d'accès, l'examen des communications suspectes, et l'identification de la chronologie exacte des événements. Il est crucial d'établir qui a accédé aux données, quand, comment, et quelles données ont été compromises."
      },
      {
        title: "Plan de réponse aux incidents",
        content: "Un plan de réponse efficace aux fuites de données comporte plusieurs phases: confinement immédiat pour limiter l'exposition, évaluation de l'ampleur et de la gravité de l'incident, notification aux parties prenantes (autorités, clients, employés), et mesures correctives. Après l'incident, une analyse post-mortem est essentielle pour identifier les leçons apprises et renforcer les défenses. Les organisations doivent régulièrement tester leur plan de réponse via des exercices de simulation pour s'assurer de son efficacité en situation réelle.",
        url: "https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique"
      }
    ],
    'ransomware': [
      {
        title: "Mécanismes des rançongiciels",
        content: "Un ransomware (ou rançongiciel) est un type de logiciel malveillant qui chiffre les données de la victime et exige une rançon pour la clé de déchiffrement. Les vecteurs d'infection courants incluent les pièces jointes d'emails malveillantes, les téléchargements depuis des sites compromis, et l'exploitation de vulnérabilités dans les systèmes. Les ransomwares modernes utilisent des techniques d'évasion sophistiquées et peuvent cibler spécifiquement les sauvegardes pour maximiser l'impact. Le modèle RaaS (Ransomware-as-a-Service) permet même aux cybercriminels sans compétences techniques avancées de lancer des attaques."
      },
      {
        title: "Mesures préventives essentielles",
        content: "La protection contre les ransomwares repose sur une approche multicouche: sauvegardes régulières suivant la règle 3-2-1 (3 copies sur 2 supports différents dont 1 hors site), application rigoureuse des correctifs de sécurité, segmentation réseau, principe du moindre privilège, sensibilisation des utilisateurs, filtrage des emails et solutions EDR (Endpoint Detection and Response). Une stratégie de sauvegarde robuste reste la mesure la plus efficace, assurant la capacité de restauration sans paiement de rançon.",
        url: "https://www.cert.ssi.gouv.fr/actualite/CERTFR-2021-ACT-001/"
      },
      {
        title: "Gestion d'une crise ransomware",
        content: "Face à une attaque par ransomware, la réponse doit être méthodique: isolation immédiate des systèmes infectés, évaluation de l'étendue de l'infection, identification du variant, communication transparente avec les parties prenantes, et restauration depuis les sauvegardes. Les autorités (ANSSI, police) doivent être contactées rapidement. Le paiement de la rançon n'est généralement pas recommandé car il n'offre aucune garantie de récupération des données et encourage l'économie criminelle. La préparation préalable via des plans d'intervention testés est cruciale."
      }
    ],
    'phishing': [
      {
        title: "Anatomie d'une attaque de phishing",
        content: "Le phishing (hameçonnage) est une technique d'ingénierie sociale où les attaquants se font passer pour des entités légitimes afin de voler des informations sensibles. Ces attaques peuvent prendre diverses formes: emails massivement envoyés (phishing), messages ciblant des individus spécifiques (spear phishing), ou usurpation d'identité de cadres supérieurs (whaling). Les attaques modernes sont souvent sophistiquées, avec des sites de phishing indiscernables des originaux et exploitant l'actualité ou les urgences pour créer un sentiment d'urgence qui pousse à l'action imprudente."
      },
      {
        title: "Indicateurs de détection",
        content: "Plusieurs signes peuvent révéler une tentative de phishing: fautes d'orthographe ou de grammaire, domaines suspects ou légèrement modifiés par rapport aux originaux, demandes inhabituelles ou urgentes, formules de politesse génériques, liens incohérents avec le texte affiché, ou pièces jointes non sollicitées. La vérification de l'URL réelle (et non du texte affiché), l'attention aux certificats SSL, et la méfiance envers les demandes d'informations sensibles par email sont des réflexes essentiels pour identifier ces tentatives."
      },
      {
        title: "Formation et sensibilisation",
        content: "La meilleure défense contre le phishing reste la sensibilisation des utilisateurs. Des programmes efficaces incluent des simulations régulières de phishing, des formations interactives, et des communications fréquentes sur les nouvelles menaces. Les utilisateurs doivent être formés à signaler les emails suspects plutôt qu'à simplement les supprimer, permettant ainsi aux équipes de sécurité de détecter les campagnes ciblant l'organisation. Une culture de vigilance, où les employés se sentent à l'aise pour vérifier la légitimité des communications sans crainte, est fondamentale.",
        url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/hameconnage-phishing"
      }
    ],
    'insider_threat': [
      {
        title: "Typologie des menaces internes",
        content: "Les menaces internes proviennent d'individus ayant un accès légitime aux systèmes d'information. On distingue: l'employé malveillant agissant intentionnellement (vol de données, sabotage), le négligent qui compromet la sécurité par erreur ou non-respect des règles, et l'utilisateur compromis dont les identifiants ont été volés. Ces menaces sont particulièrement dangereuses car elles exploitent des accès légitimes, contournant ainsi de nombreuses défenses périmétriques."
      },
      {
        title: "Signes précurseurs et détection",
        content: "Plusieurs indicateurs peuvent signaler une menace interne potentielle: accès à des informations non nécessaires au travail, activité en dehors des heures habituelles, téléchargements massifs de données sensibles, utilisation d'outils non autorisés, expression de mécontentement ou ressentiment, ou changements de comportement notables. Les systèmes UBA (User Behavior Analytics) et UEBA (User and Entity Behavior Analytics) permettent de détecter les anomalies comportementales et de les distinguer des activités légitimes."
      },
      {
        title: "Mesures de prévention organisationnelles",
        content: "La gestion des menaces internes nécessite une approche équilibrée entre contrôles techniques et mesures organisationnelles: séparation des tâches critiques, rotation des responsabilités, principes du moindre privilège et de la connaissance minimale, procédures de départ des employés, vérifications d'antécédents, et audits réguliers des accès. Un environnement de travail positif avec des canaux pour exprimer les préoccupations peut réduire les motivations de malveillance. La surveillance doit être proportionnée et respectueuse de la vie privée pour maintenir la confiance."
      }
    ],
    'social_engineering': [
      {
        title: "Principes fondamentaux de l'ingénierie sociale",
        content: "L'ingénierie sociale exploite les biais cognitifs et les émotions humaines plutôt que les vulnérabilités techniques. Les attaquants utilisent des principes psychologiques comme l'autorité (se faire passer pour un supérieur), l'urgence (créer un sentiment de pression temporelle), la réciprocité (offrir quelque chose pour obtenir en retour), la rareté (opportunité limitée), ou la sympathie (établir une relation de confiance). Ces techniques sont souvent combinées et adaptées au contexte spécifique de la cible."
      },
      {
        title: "Vecteurs d'attaque courants",
        content: "L'ingénierie sociale se manifeste à travers divers canaux: phishing par email, vishing (par téléphone), smishing (par SMS), impersonation (usurpation d'identité physique), tailgating (suivre quelqu'un dans une zone sécurisée), et baiting (laisser des supports infectés comme des clés USB). Les réseaux sociaux sont également exploités pour recueillir des informations sur les cibles (reconnaissance) et établir des relations de confiance. Les attaques modernes sont souvent multicanales, passant d'un médium à l'autre pour renforcer leur crédibilité."
      },
      {
        title: "Défenses comportementales",
        content: "Se protéger contre l'ingénierie sociale nécessite des habitudes spécifiques: vérifier indépendamment les requêtes sensibles via un canal différent, ne jamais agir sous pression, maintenir une saine méfiance face aux coïncidences ou offres trop avantageuses, limiter l'exposition d'informations personnelles en ligne, et suivre strictement les procédures de sécurité même lorsqu'elles semblent inconvenantes. La conscience situationnelle et la capacité à reconnaître les manipulations émotionnelles sont essentielles.",
        url: "https://www.ssi.gouv.fr/entreprise/guide/guide-dhygiene-informatique"
      }
    ]
  };

  // Retourner la documentation pour le contexte demandé, ou un ensemble vide si non trouvé
  return knowledgeBase[context] || [];
}

/**
 * Retourne une documentation de secours en cas d'échec
 */
function getFallbackDocumentation(context: string): { title: string, content: string }[] {
  const contextMap: Record<string, string> = {
    'data_breach': 'fuites de données',
    'ransomware': 'rançongiciels',
    'phishing': 'hameçonnage',
    'insider_threat': 'menaces internes',
    'social_engineering': 'ingénierie sociale'
  };

  const topic = contextMap[context] || 'cybersécurité';

  return [
    {
      title: `Concepts de base sur les ${topic}`,
      content: `Cette documentation couvre les principes fondamentaux concernant ${topic} dans le contexte de la cybersécurité. Pour plus d'informations, consultez les ressources de l'ANSSI et de la CNIL.`
    },
    {
      title: `Bonnes pratiques pour la protection contre les ${topic}`,
      content: `Des méthodes éprouvées pour se protéger efficacement contre les menaces liées aux ${topic}, incluant des mesures préventives et des stratégies de réponse aux incidents.`
    }
  ];
}