// Nouvelle implémentation de la route `/api/cyber/start-scenario`
app.post('/api/cyber/start-scenario', async (req, res) => {
  try {
    const { scenarioId, userName } = req.body;
    
    if (!scenarioId || !userName) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Récupérer le scénario sélectionné basé sur l'ID fourni
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ message: "Scénario non trouvé" });
    }
    
    // Configuration du prompt système pour la génération de l'email
    const systemPrompt = `Vous êtes un Assistant d'Intelligence Artificielle spécialisé dans la cybersécurité, nommé I AM CYBER. 
      Votre objectif est de simuler des communications professionnelles réalistes dans le contexte d'entreprises confrontées à des enjeux de cybersécurité.
      En tant qu'expert, vous devez rédiger des messages qui capturent avec précision le ton, le style et le niveau technique appropriés pour la communication professionnelle dans le domaine de la cybersécurité.
      
      Voici quelques principes à respecter:
      1. Utilisez un ton professionnel mais accessible, adapté au niveau d'expertise du destinataire
      2. Incluez des détails techniques pertinents mais sans surcharger le message
      3. Formulez clairement les enjeux de cybersécurité spécifiques au contexte de l'entreprise
      4. Respectez les conventions des emails professionnels (salutations, signature, structure claire)
      
      Niveau de difficulté du scénario: ${scenario.difficulty}
      - Si débutant: utilisez des termes simples, expliquez les concepts de base
      - Si intermédiaire: utilisez un vocabulaire technique modéré
      - Si expert: n'hésitez pas à utiliser un vocabulaire technique avancé et à aborder des problématiques complexes`;
    
    // Déterminer le secteur d'activité en fonction du contact principal du scénario
    let secteurActivite = '';
    
    // Analyse du nom ou du rôle pour déterminer le secteur d'activité
    if (scenario.contact.name === "Lorenzo Bertola" || scenario.contact.name === "Vincent Terrier") {
      secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
    }
    else if (scenario.contact.name === "Guillaume Lechevallier" || scenario.contact.name === "Fares SAYADI") {
      secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
    }
    else if (scenario.contact.name === "Nicolas Paolantonacci" || scenario.contact.name === "Marion Lopez") {
      secteurActivite = 'RETAIL & LUXE';
    }
    else if (scenario.contact.name === "Anthony Frescal") {
      secteurActivite = 'ÉNERGIE & UTILITIES';
    }
    else {
      // Si toujours pas de correspondance, choisir aléatoirement
      const secteurs = ['BANCAIRE/FINANCIER (BFA)', 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)', 'RETAIL & LUXE', 'ÉNERGIE & UTILITIES'];
      secteurActivite = secteurs[Math.floor(Math.random() * secteurs.length)];
    }

    // Générer un nom d'entreprise cohérent avec le secteur d'activité
    let companyName = '';
    if (secteurActivite === 'BANCAIRE/FINANCIER (BFA)') {
      companyName = "SECURE FINANCE SOLUTIONS";
    } else if (secteurActivite === 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)') {
      companyName = "HEALTH & INDUSTRY SHIELD";
    } else if (secteurActivite === 'RETAIL & LUXE') {
      companyName = "ELITE RETAIL SECURITY";
    } else if (secteurActivite === 'ÉNERGIE & UTILITIES') {
      companyName = "ENERGY SHIELD SYSTEMS";
    } else {
      companyName = "CYBER SECURE SOLUTIONS";
    }

    // Liste d'experts techniques en cybersécurité
    const technicalExperts = [
      {
        name: "Neil LEVIN",
        role: "Expert cybersécurité & CFO",
        expertise: "Stratégies de défense et solutions techniques de cybersécurité"
      },
      {
        name: "Yousra SAIDANI",
        role: "Experte Cybersécurité & CFO",
        expertise: "Analyse forensique et réponse aux incidents"
      },
      {
        name: "Eddy MISSONI IDEMBI",
        role: "Expert Data / IA & CTO",
        expertise: "Sécurisation des modèles d'IA et protection des données"
      },
      {
        name: "Vincent Pascal",
        role: "Directeur Général Adjoint et Directeur du Développement",
        expertise: "Conformité réglementaire en matière de cybersécurité"
      }
    ];

    // Sélectionner aléatoirement un ou deux experts techniques qui ne sont pas le contact principal
    const additionalExperts = technicalExperts
      .filter(expert => expert.name !== scenario.contact.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    // Construire la liste complète des interlocuteurs pour ce scénario
    const interlocutorsList = additionalExperts
      .map(expert => `  * ${expert.name}, ${expert.role}, expert en ${expert.expertise}`)
      .join('\n');

    // Banque d'anecdotes liées au domaine pour une sélection aléatoire
    const anecdotesByCyberDomain = {
      "Gestion de crise cyber": [
        "En 2017, la cyberattaque NotPetya a coûté plus de 10 milliards d'euros de dommages au niveau mondial en seulement quelques heures.",
        "Lors d'une récente simulation de crise, une entreprise du CAC 40 a découvert qu'elle aurait mis 72 heures à identifier une intrusion sophistiquée sur son réseau.",
        "Les entreprises disposant d'un plan de réponse aux incidents bien testé réduisent en moyenne de 28% le coût d'une violation de données."
      ],
      "Protection des données personnelles / RGPD": [
        "La première amende RGPD en France a concerné une entreprise qui n'avait pas suffisamment sécurisé les données de ses clients sur son site web.",
        "Savais-tu que 60% des entreprises européennes ne sont toujours pas entièrement conformes au RGPD depuis son entrée en vigueur en 2018?",
        "En 2022, les autorités européennes ont infligé plus de 1,6 milliard d'euros d'amendes pour des violations du RGPD."
      ],
      "Ingénierie sociale et phishing": [
        "Une étude récente a montré que 32% des violations de données commencent par une attaque de phishing réussie.",
        "Lors d'un test d'hameçonnage dans une multinationale française, 43% des employés ont cliqué sur un lien suspect malgré les formations de sensibilisation.",
        "Les attaques de phishing ont augmenté de 350% pendant la pandémie de COVID-19 lorsque les entreprises sont passées au télétravail."
      ],
      "Gestion des incidents de sécurité": [
        "Le temps moyen de détection d'une intrusion dans les systèmes d'information est de 207 jours selon le rapport de Ponemon Institute.",
        "Une étude de l'ANSSI montre que 60% des entreprises victimes d'incidents majeurs n'avaient pas de procédure de gestion de crise cyber formalisée.",
        "Les entreprises qui disposent d'une équipe dédiée à la réponse aux incidents réduisent le coût moyen d'une violation de 80%."
      ],
      "Sécurité de la chaîne d'approvisionnement": [
        "L'attaque SolarWinds de 2020 a compromis plus de 18 000 organisations via une simple mise à jour logicielle.",
        "Près de 60% des violations de données sont liées à des vulnérabilités introduites par des tiers ou des fournisseurs.",
        "Une étude du CESIN révèle que seulement 23% des entreprises françaises auditent régulièrement la sécurité de leurs fournisseurs critiques."
      ],
      "Stratégie et gouvernance": [
        "Les entreprises avec un RSSI qui rapporte directement au CEO réduisent de 35% le coût moyen des incidents de sécurité.",
        "Selon le World Economic Forum, les cyber-risques figurent parmi les 5 principales préoccupations des dirigeants depuis 2018.",
        "Une étude Gartner montre que 40% des budgets de cybersécurité sont alloués à des projets sans alignement stratégique clair."
      ]
    };

    // Sélectionner une anecdote aléatoire liée au domaine
    let randomAnecdote = "";
    
    // Parcourir tous les domaines pour trouver une correspondance
    for (const domainKey of Object.keys(anecdotesByCyberDomain)) {
      if (scenario.domain.toLowerCase().includes(domainKey.toLowerCase())) {
        const domainAnecdotes = anecdotesByCyberDomain[domainKey];
        randomAnecdote = domainAnecdotes[Math.floor(Math.random() * domainAnecdotes.length)];
        break;
      }
    }
    
    // Si aucune correspondance n'est trouvée, utiliser une anecdote par défaut
    if (!randomAnecdote) {
      const defaultDomain = "Stratégie et gouvernance";
      const defaultAnecdotes = anecdotesByCyberDomain[defaultDomain];
      randomAnecdote = defaultAnecdotes[Math.floor(Math.random() * defaultAnecdotes.length)];
    }
    
    // Variable pour stocker le niveau de difficulté technique
    const difficultyText = {
      "Débutant": "une introduction accessible aux principes fondamentaux",
      "Intermédiaire": "un problème concret nécessitant une certaine maîtrise technique",
      "Expert": "un défi complexe requérant une expertise approfondie"
    }[scenario.difficulty] || "un cas pratique adapté à ton niveau";
    
    // Construire le message pour générer l'email
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Générez un email PROFESSIONNEL et DÉTAILLÉ (environ 250 mots) pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec les détails suivants:
        
        STRUCTURE DE L'EMAIL:
        1. Présentation personnelle: Le PNJ ${scenario.contact.name} se présente avec son rôle (${scenario.contact.role})
        2. Présentation de l'entreprise: Il présente brièvement l'entreprise ${companyName} dans le secteur ${secteurActivite}
        3. Contexte: Il expose le contexte professionnel et business de la situation
        4. Présentation du problème: Il présente un problème de cybersécurité adapté au niveau d'expertise "${scenario.difficulty}"
        5. Présentation des interlocuteurs: Il présente les autres interlocuteurs qui participeront à la conversation
        
        ÉLÉMENTS SPÉCIFIQUES À INCLURE:
        - L'email doit être adressé à ${userName} en utilisant le tutoiement ("tu")
        - IMPORTANT: Inclure cette anecdote sur le domaine quelque part dans l'email: "${randomAnecdote}"
        - Préciser que le problème à résoudre représente ${difficultyText}
        - Présenter chacun des interlocuteurs suivants qui participeront à la discussion:
        ${interlocutorsList}
        
        STYLE ET TON:
        - Le style d'écriture doit être professionnel mais chaleureux
        - Utiliser un ton courtois et enthousiaste
        - Adapter le vocabulaire technique au niveau d'expertise "${scenario.difficulty}"
        - Rédigez uniquement l'email en français, pas de commentaires explicatifs`
      }
    ];
    
    // Générer le contenu de l'email
    const emailContent = await openAIService.getChatCompletionWithCache(
      messages, 
      0.7,  // température
      2000  // tokens maximum
    );
    
    // Extraire le sujet de l'email
    const subjectMatch = emailContent.match(/Objet\s*:(.+?)(?:\n|$)/i);
    let subject = subjectMatch ? subjectMatch[1].trim() : `Bienvenue chez ${companyName}`;
    subject = subject.replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
    
    // Nettoyer le corps de l'email
    let body = emailContent
      .replace(/De\s*:.*?(?:\n|$)/gi, '')
      .replace(/À\s*:.*?(?:\n|$)/gi, '')
      .replace(/Objet\s*:.*?(?:\n|$)/gi, '')
      .replace(/Date\s*:.*?(?:\n|$)/gi, '')
      .trim();
      
    // Formater le corps de l'email
    const lines = body.split('\n');
    if (lines.length > 0) {
      // Traitement des lignes
      for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
      }
      body = lines.join('\n');
    }
    
    // Envoyer le résultat
    return res.json({
      success: true,
      email: {
        from: scenario.contact.name,
        to: userName,
        subject: subject,
        body: body
      },
      scenario: scenario
    });
  } catch (error) {
    console.error("Error starting scenario:", error);
    return res.status(500).json({ message: "Failed to start scenario" });
  }
});