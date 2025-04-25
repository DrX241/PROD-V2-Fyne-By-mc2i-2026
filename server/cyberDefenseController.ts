import { Request, Response } from 'express';
import { openAIService } from "../I_AM_CYBER/services/openai";
import { missionGenerator } from "../I_AM_CYBER/services/mission-generator";
import { ChatCompletionRequestMessage } from "../shared/schema";
import { v4 as uuidv4 } from 'uuid';

/**
 * Contrôleur pour gérer toutes les interactions IA du module CENTRE DE CRISE.
 * Ce contrôleur utilise l'intelligence artificielle Azure OpenAI pour créer des simulations
 * d'incidents de cybersécurité avec des objectifs progressifs.
 */
export async function handleCyberDefenseChat(req: Request, res: Response) {
  try {
    const { 
      userMessage, 
      missionId, 
      missionContext, 
      currentObjective, 
      previousMessages, 
      targetContact,
      temperature = 0.7,  // Valeur par défaut légèrement plus élevée pour des réponses plus variées
      maxTokens = 1200    // Taille par défaut pour des réponses substantielles
    } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ message: 'Message utilisateur requis' });
    }
    
    // Récupérer l'objectif actuel et ses critères d'évaluation
    const objective = missionContext.objectives?.[currentObjective];
    const objectiveDescription = objective?.description || "Non défini";
    const evaluationCriteria = objective?.evaluationCriteria?.join(", ") || "Non définis";
    
    // Récupérer les contacts disponibles
    const availableContacts = missionContext.contacts 
      ? missionContext.contacts.map((c: any) => `${c.name} (${c.role}${c.expertise ? `: ${c.expertise}` : ""})`).join("\n- ")
      : "Aucun contact disponible";
    
    // Déterminer si le message est court ou ambigu pour adapter la réponse via IA
    const isShortUserMessage = userMessage.trim().length < 15;
    const isQuestionOrUncertain = /^(je ne sais pas|pas sûr|incertain|aucune idée|je ne comprends pas|quoi faire|comment|que faire|\?)/i.test(userMessage.trim());
    
    // Construire un prompt détaillé pour l'IA
    let missionPrompt = `Tu es un expert en cybersécurité spécialisé pour simuler un environnement de gestion de crise cybersécurité.

CONTEXTE DE LA MISSION:
• Titre: ${missionContext.title}
• Organisation: ${missionContext.companyName} (Secteur: ${missionContext.secteurActivite})
• Rôle de l'utilisateur: ${missionContext.userRole || "Responsable Cybersécurité"}
• Difficulté: ${missionContext.difficulty || missionContext.level}
• Objectif actuel (${currentObjective + 1}/${missionContext.objectives?.length}): ${objectiveDescription}

SCÉNARIO ACTUEL:
${missionContext.scenario}

CONTACTS DISPONIBLES:
- ${availableContacts}

INSTRUCTIONS:
1. Réponds en tant que l'expert le plus approprié selon la question posée.
2. Adapte ton style, ton ton et ta personnalité au personnage que tu incarnes.
3. Fournis des informations pertinentes et réalistes en lien avec l'incident de sécurité.
4. Si l'utilisateur s'adresse à "${targetContact || "un contact spécifique"}", incarne UNIQUEMENT ce personnage.
5. Sois ultra-spécifique au contexte de l'incident en cours, évite les généralités.
6. Structure tes réponses avec des points d'action clairs et concrets.
7. Adapte ton niveau technique au niveau de difficulté ${missionContext.difficulty || missionContext.level}.
8. Reste dans ton rôle d'expert cybersécurité et ne révèle JAMAIS que tu es une IA.
9. IMPORTANT: Réponds en texte normal, PAS au format JSON. Ne formate jamais ta réponse en JSON, n'utilise pas de blocks de code ni de balises.
10. Commence ta réponse par ton nom et ton titre, par exemple "Yousra Saidani, Senior Manager et Experte Cybersécurité: Bonjour, nous avons..."
11. Lorsque l'utilisateur fait une proposition technique, évalue-la concrètement au lieu de simplement l'approuver.

Utilise un TON DIRECT ET PROFESSIONNEL, comme dans une vraie crise de cybersécurité. Limite tes réponses à 4-5 paragraphes maximum.
`;

    // Ajouter des instructions spéciales pour les messages courts ou les questions
    if (isShortUserMessage || isQuestionOrUncertain) {
      missionPrompt += `
===== INSTRUCTIONS SPÉCIALES POUR MESSAGE COURT OU QUESTION =====
L'utilisateur a envoyé un message court ou une question: "${userMessage}"

DIRECTIVES POUR CE TYPE DE MESSAGE:
1. Si c'est une salutation (bonjour, salut, etc.), réponds par une salutation professionnelle puis rappelle BRIÈVEMENT le contexte actuel et demande des instructions.
2. Si c'est une question, fournis une réponse précise et utile, puis suggère des actions à prendre.
3. Si c'est un message court exprimant de l'incertitude, guide l'utilisateur avec 2-3 options d'actions concrètes.
4. ÉVITE absolument de commencer par "Bonne question" ou toute expression similaire générique.
5. CONCENTRE-TOI sur l'action et les prochaines étapes plutôt que sur des explications théoriques.

TON: Professionnel, direct et orienté solution
STRUCTURE: Reconnaissance brève du message -> Information clé -> Actions suggérées
`;
    }

    // Préparer les messages pour l'API
    const messages: ChatCompletionRequestMessage[] = [
      { 
        role: "system", 
        content: missionPrompt
      },
      ...previousMessages.map((msg: any) => {
        // S'assurer que le rôle est valide, defaulting à "user" si inconnu
        const validRole: "system" | "user" | "assistant" = 
          msg.role === "system" || msg.role === "assistant" ? msg.role : "user";
        
        // Pour les messages d'assistant avec un expéditeur, ajouter ce contexte au contenu
        let enhancedContent = msg.content;
        if (validRole === "assistant" && msg.name) {
          enhancedContent = `[${msg.name}]: ${enhancedContent}`;
        }
        
        return {
          role: validRole,
          content: enhancedContent
        };
      }),
      { role: "user", content: userMessage }
    ];
    
    // Appeler l'API OpenAI pour obtenir une réponse
    const response = await openAIService.getChatCompletionWithCache(
      messages,
      temperature,
      maxTokens
    );
    
    // Analyser le contenu de la réponse pour déterminer le contact
    let sender = "Expert";
    let senderRole = "Cybersécurité";
    
    // Pattern pour extraire le nom et le rôle au début de la réponse
    const senderPattern = /^([^,:]+)(?:,\s*([^:]+))?:\s*/;
    const senderMatch = response.match(senderPattern);
    
    if (senderMatch) {
      sender = senderMatch[1].trim();
      senderRole = senderMatch[2]?.trim() || "Expert";
    } else if (targetContact && missionContext?.contacts) {
      // Si un contact spécifique a été ciblé, utiliser ce contact
      const contact = missionContext.contacts.find((c: any) => c && c.name === targetContact);
      if (contact) {
        sender = contact.name;
        senderRole = contact.role || "Expert";
      }
    }
    
    // Déterminer s'il faut déclencher une décision 
    let decision = null;
    const shouldTriggerDecision = response.toLowerCase().includes('décision') || 
                                 response.toLowerCase().includes('choix') ||
                                 response.toLowerCase().includes('options') ||
                                 response.toLowerCase().includes('alternatives');
    
    if (shouldTriggerDecision && objective?.decisions?.length > 0) {
      // Prendre la première décision disponible pour l'objectif actuel
      decision = objective.decisions[0];
    }
    
    // Déterminer si une réponse additionnelle d'un autre contact est appropriée (25% de chance)
    let additionalResponse = null;
    const shouldAddColleagueResponse = Math.random() > 0.75 && !decision;
    
    if (shouldAddColleagueResponse && missionContext?.contacts) {
      // Sélectionner un contact différent du premier répondant
      const availableContacts = missionContext.contacts.filter((c: any) => c && c.name !== sender);
      
      if (availableContacts && availableContacts.length > 0) {
        // Choisir un contact au hasard
        const selectedContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
        
        // Créer un prompt spécifique pour la réponse du collègue
        const colleaguePrompt = `
Tu es ${selectedContact.name}, ${selectedContact.role || 'spécialiste'} dans l'entreprise ${missionContext.companyName}.
Tu es reconnu pour ton expertise en ${selectedContact.expertise || 'cybersécurité'}.

CONTEXTE:
Un collègue nommé ${sender} vient de dire : "${response}"

INSTRUCTIONS:
1. Formule une réaction professionnelle et brève (2-3 phrases maximum) à ce commentaire.
2. Ton intervention doit apporter un point de vue complémentaire ou un éclairage supplémentaire.
3. Adapte ton niveau technique au contexte de la mission (niveau ${missionContext.difficulty || missionContext.level}).
4. Ta réponse doit être directe et pertinente, sans formule d'introduction.
5. Reste parfaitement dans ton rôle et ne fais aucune référence au fait que tu es une IA.
6. Assure-toi que ta réponse soit cohérente avec la mission en cours concernant ${missionContext.title}.

Réponds directement comme si tu intervenais naturellement dans la conversation.`;

        const colleagueMessages: ChatCompletionRequestMessage[] = [
          { role: "system", content: colleaguePrompt },
          { role: "user", content: "Formule une réaction professionnelle et pertinente à ce message" }
        ];
        
        const colleagueResponse = await openAIService.getChatCompletionWithCache(
          colleagueMessages,
          0.6,
          250
        );
        
        additionalResponse = {
          response: colleagueResponse,
          sender: selectedContact.name,
          senderRole: selectedContact.role
        };
      }
    }
    
    // Retourner la réponse complète
    res.json({
      response,
      sender,
      senderRole,
      additionalResponse,
      decision
    });
    
  } catch (error: any) {
    console.error('Error generating centre de crise response:', error);
    res.status(500).json({ 
      error: error.message || 'Error generating centre de crise response'
    });
  }
}

/**
 * Génère dynamiquement une mission de cybersécurité en utilisant l'IA
 */
export async function generateCyberDefenseMission(req: Request, res: Response) {
  try {
    const { difficultyLevel } = req.body;
    
    if (!difficultyLevel || !['Débutant', 'Intermédiaire', 'Expert'].includes(difficultyLevel)) {
      return res.status(400).json({ 
        message: 'Niveau de difficulté invalide. Utilisez: Débutant, Intermédiaire ou Expert' 
      });
    }
    
    // Récupérer les services du générateur de mission
    // Pour la première version, nous pouvons déléguer à l'implémentation existante
    // et utiliser la même API pour garder la compatibilité
    const mission = await generateMissionWithAI(difficultyLevel);
    
    return res.json({ mission });
  } catch (error: any) {
    console.error('Erreur lors de la génération de mission:', error);
    return res.status(500).json({ 
      message: 'Une erreur est survenue lors de la génération de la mission',
      error: error.message 
    });
  }
}

/**
 * Fonction interne pour générer une mission avec l'IA
 */
async function generateMissionWithAI(difficultyLevel: string) {
  try {
    console.log(`Générer une mission de niveau ${difficultyLevel} avec l'IA...`);
    
    // Créer une mission simplifiée avec des éléments statiques et dynamiques
    // Cette approche nous permet d'avoir une mission fonctionnelle même si l'API a des soucis
    
    // Éléments statiques par niveau de difficulté
    const staticElements = {
      "Débutant": {
        title: "Alerte de phishing au sein de l'entreprise",
        scenario: "Plusieurs employés ont signalé avoir reçu des emails suspects qui semblent provenir du service informatique, demandant de changer leurs mots de passe via un lien externe. Une analyse préliminaire suggère qu'il s'agit d'une tentative de phishing ciblée contre votre organisation.",
        companyName: "ELITE RETAIL SECURITY",
        secteurActivite: "RETAIL & LUXE",
        contacts: [
          {
            id: uuidv4(),
            name: "Yousra Saidani", 
            role: "Senior Manager et Experte Cybersécurité",
            expertise: "Réponse aux incidents et gestion de crise"
          },
          {
            id: uuidv4(),
            name: "Alexandre Chen", 
            role: "Responsable de la Sécurité SI",
            expertise: "Sécurité des systèmes d'information et gouvernance"
          }
        ]
      },
      "Intermédiaire": {
        title: "Vulnérabilité critique dans l'infrastructure",
        scenario: "Une vulnérabilité zero-day vient d'être découverte dans un composant critique de votre infrastructure. Des preuves d'exploitation active ont été détectées sur Internet et votre CERT vous a alerté que votre organisation pourrait être une cible potentielle.",
        companyName: "BANQUE FINANCE ASSURANCE",
        secteurActivite: "BANCAIRE/FINANCE (BFA)",
        contacts: [
          {
            id: uuidv4(),
            name: "Mathilde Comte", 
            role: "RSSI",
            expertise: "Gouvernance et gestion des risques"
          },
          {
            id: uuidv4(),
            name: "Kevin Dubois", 
            role: "Responsable SOC",
            expertise: "Détection et réponse aux incidents"
          },
          {
            id: uuidv4(),
            name: "Sophie Martin", 
            role: "Administratrice Systèmes",
            expertise: "Gestion des infrastructures IT et des sauvegardes"
          }
        ]
      },
      "Expert": {
        title: "APT détectée dans les systèmes critiques",
        scenario: "Votre équipe de sécurité a détecté des activités suspectes indiquant une possible compromission avancée persistante (APT) ciblant vos systèmes critiques. Des comportements anormaux sur le réseau et des connexions vers des serveurs de commande et contrôle connus ont été observés depuis au moins 3 mois.",
        companyName: "HEALTH & INDUSTRY SHIELD",
        secteurActivite: "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
        contacts: [
          {
            id: uuidv4(),
            name: "Mathilde Comte", 
            role: "RSSI",
            expertise: "Gouvernance et gestion des risques"
          },
          {
            id: uuidv4(),
            name: "Kevin Dubois", 
            role: "Responsable SOC",
            expertise: "Détection et réponse aux incidents"
          },
          {
            id: uuidv4(),
            name: "Pierre Dubois", 
            role: "Responsable Conformité",
            expertise: "Réglementation et conformité en cybersécurité"
          },
          {
            id: uuidv4(),
            name: "Sarah Benali", 
            role: "Experte Threat Intelligence",
            expertise: "Analyse des menaces et attribution"
          }
        ]
      }
    };
    
    // Sélection des éléments pour le niveau demandé
    const elements = staticElements[difficultyLevel as keyof typeof staticElements] || staticElements["Intermédiaire"];
    
    // Tentative d'enrichissement via l'IA (avec timeout court pour éviter les blocages)
    let dynamicScenario = elements.scenario;
    try {
      const scenarioPrompt = `Améliore ce scénario de cybersécurité pour un exercice de niveau ${difficultyLevel}:\n"${elements.scenario}"\nAjoute des détails spécifiques et pertinents pour le rendre plus réaliste et immersif. Limite ta réponse à 3-5 phrases maximum.`;
      
      // Utiliser une promesse avec timeout
      const enrichedScenario = await Promise.race([
        openAIService.getChatCompletion([{ role: "user", content: scenarioPrompt }], 0.7, 400),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]);
      
      if (enrichedScenario) {
        dynamicScenario = enrichedScenario.trim();
      }
    } catch (error) {
      console.log("Utilisation du scénario par défaut suite à une erreur d'enrichissement:", error);
    }
    
    // Création d'une mission avec le contenu obtenu
    const mission = {
      id: uuidv4(),
      title: elements.title,
      description: `Une situation critique de cybersécurité requiert vos compétences. Prenez les bonnes décisions pour protéger ${elements.companyName}.`,
      difficulty: difficultyLevel,
      duration: difficultyLevel === "Débutant" ? "15-25 min" : difficultyLevel === "Intermédiaire" ? "30-45 min" : "45-60 min",
      tags: ["Incident Response", "Cybersécurité", difficultyLevel],
      scenario: dynamicScenario,
      companyName: elements.companyName,
      secteurActivite: elements.secteurActivite,
      userRole: "Responsable Sécurité",
      contacts: elements.contacts,
      objectives: [
        {
          id: uuidv4(),
          description: "Évaluer la situation et identifier la nature de la menace",
          evaluationCriteria: ["Précision de l'analyse", "Rapidité d'évaluation", "Identification des systèmes touchés"],
          completed: false
        },
        {
          id: uuidv4(),
          description: "Mettre en place les premières mesures de confinement",
          evaluationCriteria: ["Efficacité des mesures", "Minimisation de l'impact sur les opérations", "Documentation des actions"],
          completed: false
        },
        {
          id: uuidv4(),
          description: "Élaborer un plan de communication et de remédiation",
          evaluationCriteria: ["Clarté de la communication", "Pertinence des actions de remédiation", "Mesures préventives pour le futur"],
          completed: false
        }
      ],
      evaluationSystem: {
        maxPoints: 60,
        penaltyThreshold: 20,
        rewards: ["Reconnaissance professionnelle", "Budget supplémentaire pour la sécurité", "Formation spécialisée en cybersécurité"],
        penalties: ["Perte de confiance de la direction", "Réduction des responsabilités", "Impact sur la réputation professionnelle"]
      }
    };
    
    console.log(`Mission générée avec succès: ${mission.title}`);
    return mission;
  } catch (error: any) {
    console.error(`Erreur lors de la génération de mission: ${error.message}`);
    throw new Error(`Erreur lors de la génération de mission: ${error.message}`);
  }
}