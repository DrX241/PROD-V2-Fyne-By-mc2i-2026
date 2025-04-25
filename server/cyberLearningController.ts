import { Request, Response } from "express";
import { openAIService } from "./services/openai";

// Base de connaissances cybersécurité (peut être étendue)
const KNOWLEDGE_BASE: Record<string, any> = {
  data_breach: {
    techniques: ["Phishing ciblé", "Vol d'identifiants", "Exploitation de vulnérabilités", "Accès non autorisé à des données sensibles"],
    prevention: ["Formation des utilisateurs", "Authentification multifacteur", "Moindre privilège", "Chiffrement des données", "Surveillance des accès"],
    real_cases: [
      "En 2021, une entreprise française a subi une fuite de données suite à un phishing ciblé. Les employés ont été formés par la suite à identifier les signes d'une tentative de phishing.",
      "Une PME du secteur de la santé a détecté une tentative d'exfiltration de données patient suite à une intrusion via un compte d'administrateur comprenant un mot de passe par défaut.",
      "Un salarié mécontent a utilisé ses privilèges pour exfiltrer une base client avant de quitter l'entreprise. L'utilisation d'outils de DLP aurait permis de détecter cette exfiltration."
    ]
  },
  ransomware: {
    techniques: ["Pièces jointes malveillantes", "Exploitation de vulnérabilités RDP", "Drive-by download", "Mouvements latéraux"],
    prevention: ["Sauvegardes régulières", "Correctifs de sécurité", "Segmentation réseau", "Formation à la détection des emails malveillants"],
    real_cases: [
      "Un hôpital français a été victime d'un ransomware après qu'un employé ait ouvert une pièce jointe malveillante. La mise en place d'une politique de sauvegarde a permis de restaurer les systèmes sans payer la rançon.",
      "Une entreprise industrielle a été victime d'un ransomware via un accès RDP mal protégé. La mise en place d'une authentification forte et d'un VPN a par la suite été recommandée."
    ]
  },
  insider_threat: {
    techniques: ["Abus de privilèges", "Vol de données sensibles", "Installation de backdoors", "Sabotage"],
    prevention: ["Principe du moindre privilège", "Surveillance comportementale", "Séparation des pouvoirs", "Contrôles d'accès stricts"],
    real_cases: [
      "Un administrateur système d'une entreprise de technologies a installé des portes dérobées avant son départ. L'utilisation d'un système de gestion des accès privilégiés aurait permis de détecter ces actions.",
      "Un analyste financier a exfiltré des données confidentielles vers sa messagerie personnelle. La mise en place d'une solution DLP aurait bloqué ce transfert."
    ]
  }
};

/**
 * Génère un débriefing personnalisé basé sur les actions de l'utilisateur
 */
export async function generateDebriefing(req: Request, res: Response) {
  try {
    const { userActions, correctApproach, scenario, performanceScore } = req.body;
    
    // Utiliser OpenAI pour générer un feedback personnalisé
    const prompt = `Tu es un expert en cybersécurité chargé de former des professionnels. 
    L'utilisateur vient de terminer un scénario de simulation de "${scenario}".
    Voici les actions qu'il a prises: ${userActions.join(", ")}.
    L'approche recommandée était: ${correctApproach.join(", ")}.
    Son score de performance est de ${performanceScore}/100.
    
    Génère:
    1. 3-5 points d'apprentissage clés basés sur son approche (maximum 30 mots chacun)
    2. Un exemple réel anonymisé d'un incident similaire et comment il a été géré en entreprise (maximum 150 mots)
    
    Format de réponse:
    {
      "learningPoints": ["point 1", "point 2", "point 3"],
      "realWorldExample": "exemple concret..."
    }`;
    
    // Utiliser le modèle mini pour des réponses rapides
    openAIService.switchToSecondaryKey();
    const completion = await openAIService.getChatCompletion(
      [{ role: "user", content: prompt }],
      0.7,
      1000
    );
    
    // Convertir la réponse en objet JSON
    const result = JSON.parse(completion);
    res.json(result);
  } catch (error) {
    console.error("Error generating debriefing:", error);
    res.status(500).json({ 
      error: "Failed to generate debriefing",
      learningPoints: [
        "Analyser systématiquement les logs et journaux d'accès pour établir la chronologie des événements.",
        "Vérifier la légitimité des autorisations exceptionnelles auprès des personnes concernées.",
        "Recouper les preuves financières avec les activités suspectes pour identifier des motivations."
      ],
      realWorldExample: "Une entreprise française du secteur des technologies a connu une fuite de données sensibles en 2022. L'enquête a révélé qu'un employé avait accédé en dehors des heures de bureau à des serveurs avec une autorisation falsifiée. Les journaux d'audit et les enregistrements d'accès physiques ont permis d'identifier le coupable. Suite à cet incident, l'entreprise a mis en place une authentification multifacteur et une revue systématique des accès privilégiés."
    });
  }
}

/**
 * Fournit de la documentation contextuelle basée sur le scénario
 */
export async function getContextualDocumentation(req: Request, res: Response) {
  try {
    const { context, term } = req.query;
    
    // Si le terme est spécifié, générer une documentation précise
    if (term) {
      const prompt = `Tu es un expert en cybersécurité chargé de documenter des concepts techniques.
      Explique le concept de "${term}" dans le contexte de "${context}" de manière claire et concise.
      Fournis une définition, des exemples d'application, et des mesures associées.
      Limite ta réponse à 150 mots maximum.`;
      
      const response = await openAIService.generateChatCompletion(
        [{ role: "user", content: prompt }],
        {
          temperature: 0.5,
          useSecondaryModel: true
        }
      );
      
      res.json({
        documents: [{
          title: `${term} - Définition technique`,
          content: response.choices[0].message.content
        }]
      });
    } else {
      // Sinon, utiliser la base de connaissances ou générer des documents généraux
      const documents = getDocumentsFromKnowledgeBase(context as string);
      res.json({ documents });
    }
  } catch (error) {
    console.error("Error fetching documentation:", error);
    
    // Fallback response avec documentation statique
    const fallbackDocs = getFallbackDocumentation(req.query.context as string);
    res.json({ documents: fallbackDocs });
  }
}

/**
 * Récupère la documentation depuis la base de connaissances
 */
function getDocumentsFromKnowledgeBase(context: string): { title: string, content: string }[] {
  if (!KNOWLEDGE_BASE[context]) {
    return [
      { title: "Documentation non disponible", content: "Aucune documentation n'est disponible pour ce contexte actuellement." }
    ];
  }
  
  const docs = [];
  const kb = KNOWLEDGE_BASE[context];
  
  if (kb.techniques) {
    docs.push({
      title: "Techniques d'attaque courantes",
      content: kb.techniques.join(", ")
    });
  }
  
  if (kb.prevention) {
    docs.push({
      title: "Mesures de prévention recommandées",
      content: kb.prevention.join(", ")
    });
  }
  
  if (kb.real_cases && kb.real_cases.length > 0) {
    docs.push({
      title: "Cas réel similaire",
      content: kb.real_cases[Math.floor(Math.random() * kb.real_cases.length)]
    });
  }
  
  return docs;
}

/**
 * Retourne une documentation de secours en cas d'échec
 */
function getFallbackDocumentation(context: string): { title: string, content: string }[] {
  // Documentation par défaut
  const defaultDocs = [
    {
      title: "Bonnes pratiques en cybersécurité",
      content: "Mettre à jour régulièrement les systèmes, former les utilisateurs, sauvegarder les données, mettre en place l'authentification à plusieurs facteurs, et surveiller les activités anormales."
    },
    {
      title: "Ressources pour approfondir",
      content: "ANSSI (guides de bonnes pratiques), MITRE ATT&CK (base de connaissances sur les tactiques et techniques d'attaque), OWASP (sécurité des applications web)."
    }
  ];
  
  // Documentation spécifique selon le contexte
  if (context === "data_breach") {
    return [
      {
        title: "Prévention des fuites de données",
        content: "Chiffrer les données sensibles, mettre en place des contrôles d'accès stricts, surveiller les comportements anormaux, sensibiliser les utilisateurs aux risques."
      },
      {
        title: "Détection d'une fuite de données",
        content: "Analyse des logs d'accès, surveillance des transferts de données inhabituels, alertes sur les accès à des heures atypiques ou depuis des emplacements inconnus."
      },
      ...defaultDocs
    ];
  }
  
  if (context === "ransomware") {
    return [
      {
        title: "Protection contre les ransomwares",
        content: "Sauvegardes régulières et isolées, sensibilisation aux phishing, correctifs de sécurité, segmentation réseau pour limiter la propagation."
      },
      {
        title: "Réaction à une attaque par ransomware",
        content: "Isoler les systèmes infectés, restaurer depuis les sauvegardes, ne pas payer la rançon, signaler l'incident aux autorités, analyser le vecteur d'infection."
      },
      ...defaultDocs
    ];
  }
  
  if (context === "insider_threat") {
    return [
      {
        title: "Gestion des menaces internes",
        content: "Principe du moindre privilège, séparation des tâches, surveillance des comportements anormaux, contrôles d'accès physiques et logiques."
      },
      {
        title: "Indicateurs d'une menace interne",
        content: "Accès à des données non liées aux fonctions, connexions à des heures inhabituelles, téléchargements massifs de données, comportement inhabituel."
      },
      ...defaultDocs
    ];
  }
  
  return defaultDocs;
}