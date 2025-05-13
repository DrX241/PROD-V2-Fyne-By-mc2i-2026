import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les personnages non-joueurs (PNJ)
interface PNJ {
  id: string;
  nom: string;
  role: string;
  personnalite: string;
  attitude: 'favorable' | 'neutre' | 'hostile';
  avatar?: string;
}

// Interface pour les choix possibles dans une décision
interface MissionChoice {
  id: string;
  texte: string;
  consequences?: string;
  suggestionAide?: string;
}

// Interface pour une étape de mission
interface MissionStage {
  id: string;
  type: 'introduction' | 'briefing' | 'decision' | 'feedback' | 'finale';
  titre: string;
  description: string;
  pnjActif?: string; // ID du PNJ qui parle
  choixPossibles?: MissionChoice[];
  tempsMaxReflexion?: number; // en secondes
  impactBudget?: number;
  impactSecurite?: number;
  impactReputation?: number;
}

// Interface pour les métriques de l'entreprise
interface CompanyMetrics {
  budget: number;
  securite: number;
  reputation: number;
  moral: number;
}

// Interface pour la session de mission
interface CyberMissionSession {
  userId: string;
  missionId: string;
  missionNom: string;
  entrepriseNom: string;
  entrepriseVille: string;
  entrepriseSecteur: string;
  roleJoueur: string;
  roleDescription: string;
  messages: ChatCompletionRequestMessage[];
  pnjs: PNJ[];
  etapeActuelle: number;
  etapes: MissionStage[];
  metriques: CompanyMetrics;
  decisions: {
    etapeId: string;
    choixId: string;
    timestamp: number;
  }[];
  historiqueActions: string[];
  estTerminee: boolean;
  resultatFinal?: 'succes' | 'echec' | 'licenciement' | 'abandon';
}

// Stocker les sessions de mission
const missionSessions = new Map<string, CyberMissionSession>();

// Les rôles disponibles pour les joueurs
const rolesDisponibles = [
  {
    id: "rssi",
    nom: "Responsable Sécurité des Systèmes d'Information (RSSI)",
    description: "Expert chargé de définir et mettre en œuvre la politique de sécurité du système d'information de l'entreprise.",
    competences: ["Stratégie de sécurité", "Gestion des risques", "Conformité réglementaire", "Management d'équipe"]
  },
  {
    id: "analyste_securite",
    nom: "Analyste en Cybersécurité",
    description: "Spécialiste qui surveille, détecte et répond aux incidents de sécurité informatique.",
    competences: ["Analyse de malwares", "Détection d'intrusion", "Forensics", "Veille technologique"]
  },
  {
    id: "pentester",
    nom: "Pentesteur (Ethical Hacker)",
    description: "Expert qui teste la sécurité des systèmes en simulant des attaques pour découvrir les vulnérabilités.",
    competences: ["Tests d'intrusion", "Recherche de vulnérabilités", "Social engineering", "Rédaction de rapports"]
  },
  {
    id: "dpo",
    nom: "Délégué à la Protection des Données (DPO)",
    description: "Responsable de la conformité au RGPD et de la protection des données personnelles.",
    competences: ["Conformité RGPD", "Analyse d'impact", "Sensibilisation", "Gestion des risques"]
  },
  {
    id: "directeur_securite",
    nom: "Directeur de la Sécurité (CISO)",
    description: "Cadre dirigeant responsable de la vision globale et de la stratégie de sécurité de l'organisation.",
    competences: ["Gouvernance", "Budgétisation", "Stratégie", "Communication avec la direction"]
  }
];

/**
 * Initialise une nouvelle session de mission en mode terminal
 */
export async function initMissionTerminal(req: Request, res: Response) {
  try {
    const userId = uuidv4();
    
    // Message d'accueil en mode terminal avec des instructions détaillées
    const welcomeMessage = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                     TERMINAL SÉCURISÉ                        ║
    ║                AGENCE CYBER-DÉFENSE NATIONALE                ║
    ╚══════════════════════════════════════════════════════════════╝

    > Initialisation de la connexion...
    > Authentification en cours...
    > Vérification des autorisations de sécurité niveau 4...
    > Accès autorisé
    > Chiffrement de la connexion activé

    ⚠️ INFORMATION CONFIDENTIELLE - NIVEAU ALPHA ⚠️

    Date: ${new Date().toLocaleDateString('fr-FR')}
    Heure: ${new Date().toLocaleTimeString('fr-FR')}
    
    ----------------------------------------------------------------------
    
    Bonjour agent, nous avons une mission critique qui requiert une expertise
    immédiate en cybersécurité. Votre profil a été sélectionné pour ses 
    compétences spécifiques dans ce domaine.
    
    ├── MISSION : INFILTRATION ET SÉCURISATION
    │   ├── Priorité : ÉLEVÉE
    │   ├── Risque : NIVEAU 4
    │   ├── Statut : EN ATTENTE D'ACCEPTATION
    │   └── Localisation : CONFIDENTIEL (révélée après acceptation)
    
    GUIDE DE L'INTERFACE:
    1. Utilisez les boutons ci-dessous pour faire vos choix
    2. Chaque décision aura un impact sur la mission et votre carrière
    3. Vous interagirez avec différents personnages
    4. Surveillez vos métriques (budget, sécurité, réputation)
    
    ----------------------------------------------------------------------
    
    Acceptez-vous cette mission ? [OUI/NON]
    
    > _`;
    
    return res.status(200).json({
      success: true,
      userId,
      message: welcomeMessage,
      terminalMode: true,
      choices: [
        { id: 'accepter', text: 'OUI - Accepter la mission' },
        { id: 'refuser', text: 'NON - Refuser la mission' }
      ]
    });
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation du terminal de mission:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation du terminal" });
  }
}

/**
 * Traite l'acceptation ou le refus de la mission
 */
export async function processAcceptMission(req: Request, res: Response) {
  try {
    const { userId, choice } = req.body;
    
    if (!userId || !choice) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }
    
    if (choice === 'refuser') {
      return res.status(200).json({
        success: true,
        message: `
        > Compréhensible, agent. Peut-être une autre fois.
        > Déconnexion du terminal de mission...
        > Terminal hors ligne.
        
        [SESSION TERMINÉE]`,
        terminateSession: true
      });
    }
    
    // L'utilisateur a accepté la mission, présenter les rôles disponibles
    const rolesMessage = `
    ✅ Mission acceptée, agent. Nous sommes ravis de vous avoir dans l'équipe.
    
    Pour cette opération, vous devrez choisir un rôle spécifique.
    Chaque rôle implique des responsabilités et des défis différents.
    
    Veuillez sélectionner votre spécialisation :
    
    ${rolesDisponibles.map((role, index) => `
    ┌── OPTION ${index + 1} ───────────────────────────────
    │ ${role.nom}
    │ ${role.description}
    │ Compétences: ${role.competences.join(', ')}
    └───────────────────────────────────────────────────
    `).join('\n')}
    
    > Sélectionnez un rôle [1-5]: _`;
    
    // Préparer les choix pour la sélection de rôle
    const roleChoices = rolesDisponibles.map((role, index) => ({
      id: role.id,
      text: `${index + 1} - ${role.nom}`
    }));
    
    return res.status(200).json({
      success: true,
      message: rolesMessage,
      choices: roleChoices
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement de l'acceptation de mission:", error);
    return res.status(500).json({ error: "Erreur lors du traitement de la réponse" });
  }
}

/**
 * Traite la sélection du rôle et initialise la mission complète
 */
export async function processRoleSelection(req: Request, res: Response) {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }
    
    // Trouver le rôle sélectionné
    const selectedRole = rolesDisponibles.find(role => role.id === roleId);
    if (!selectedRole) {
      return res.status(400).json({ error: "Rôle invalide" });
    }
    
    // Générer une mission aléatoire basée sur le rôle
    const mission = await generateMission(selectedRole);
    
    // Enregistrer la session de mission
    missionSessions.set(userId, mission);
    
    // Message de transition
    const transitionMessage = `
    > Rôle sélectionné: ${selectedRole.nom}
    > Configuration de la mission...
    > Chargement des paramètres...
    > Connexion au système central...
    
    ████████████████████████████████████ 100%
    
    > ACCÈS AUTORISÉ
    > INITIALISATION DE LA MISSION...
    `;
    
    // Attendre quelques secondes pour l'effet dramatique
    // Retourner la première étape de la mission
    const premièreÉtape = mission.etapes[0];
    
    return res.status(200).json({
      success: true,
      message: transitionMessage,
      missionData: {
        userId: mission.userId,
        missionId: mission.missionId,
        missionNom: mission.missionNom,
        entrepriseNom: mission.entrepriseNom,
        entrepriseVille: mission.entrepriseVille,
        entrepriseSecteur: mission.entrepriseSecteur,
        roleJoueur: mission.roleJoueur,
        roleDescription: mission.roleDescription,
        etapeActuelle: 0,
        pnjs: mission.pnjs
      },
      nextStep: {
        id: premièreÉtape.id,
        type: premièreÉtape.type,
        titre: premièreÉtape.titre,
        description: premièreÉtape.description,
        pnjActif: premièreÉtape.pnjActif,
        choixPossibles: premièreÉtape.choixPossibles
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de la sélection du rôle:", error);
    return res.status(500).json({ error: "Erreur lors de la sélection du rôle" });
  }
}

/**
 * Traite une décision prise par le joueur
 */
export async function processMissionDecision(req: Request, res: Response) {
  try {
    const { userId, etapeId, choixId } = req.body;
    
    if (!userId || !etapeId || !choixId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }
    
    // Récupérer la session de mission
    const session = missionSessions.get(userId);
    if (!session) {
      return res.status(404).json({ error: "Session de mission non trouvée" });
    }
    
    // Vérifier que l'étape correspond bien à l'étape actuelle
    const etapeActuelle = session.etapes[session.etapeActuelle];
    if (etapeActuelle.id !== etapeId) {
      return res.status(400).json({ error: "Étape invalide" });
    }
    
    // Vérifier que le choix est valide
    const choixSelectionne = etapeActuelle.choixPossibles?.find(choix => choix.id === choixId);
    if (!choixSelectionne) {
      return res.status(400).json({ error: "Choix invalide" });
    }
    
    // Enregistrer la décision
    session.decisions.push({
      etapeId,
      choixId,
      timestamp: Date.now()
    });
    
    // Générer les conséquences et la réaction du PNJ
    const consequences = await generateConsequences(session, etapeActuelle, choixSelectionne);
    
    // Mettre à jour les métriques
    if (consequences.impactBudget) session.metriques.budget += consequences.impactBudget;
    if (consequences.impactSecurite) session.metriques.securite += consequences.impactSecurite;
    if (consequences.impactReputation) session.metriques.reputation += consequences.impactReputation;
    if (consequences.impactMoral) session.metriques.moral += consequences.impactMoral;
    
    // Vérifier si la mission doit se terminer (licenciement, etc.)
    if (consequences.finMission) {
      session.estTerminee = true;
      session.resultatFinal = consequences.typeFinMission;
      
      // Sauvegarder la session mise à jour
      missionSessions.set(userId, session);
      
      return res.status(200).json({
        success: true,
        message: consequences.message,
        pnjActif: consequences.pnjActif,
        missionTerminee: true,
        resultatFinal: consequences.typeFinMission,
        metriques: session.metriques
      });
    }
    
    // Passer à l'étape suivante
    session.etapeActuelle++;
    const nouvelleEtape = session.etapes[session.etapeActuelle];
    
    // Sauvegarder la session mise à jour
    missionSessions.set(userId, session);
    
    return res.status(200).json({
      success: true,
      message: consequences.message,
      pnjActif: consequences.pnjActif,
      metriques: session.metriques,
      nextStep: {
        id: nouvelleEtape.id,
        type: nouvelleEtape.type,
        titre: nouvelleEtape.titre,
        description: nouvelleEtape.description,
        pnjActif: nouvelleEtape.pnjActif,
        choixPossibles: nouvelleEtape.choixPossibles
      }
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement de la décision de mission:", error);
    return res.status(500).json({ error: "Erreur lors du traitement de la décision" });
  }
}

/**
 * Génère une mission complète basée sur le rôle sélectionné
 */
async function generateMission(role: any): Promise<CyberMissionSession> {
  // Liste des types d'entreprises possibles
  const typesEntreprises = [
    { secteur: "Santé", exemples: ["CliniData", "MediSecure", "HealthTech Solutions", "PharmaSoft"] },
    { secteur: "Finance", exemples: ["BanqueDigitale", "CréditSécur", "FinInvest", "AssureTech"] },
    { secteur: "Industrie", exemples: ["TechnoFab", "IndusMécanique", "ProduTech", "ÉnergIndus"] },
    { secteur: "Retail", exemples: ["CommerceConnect", "DistribPlus", "VenteSecure", "RetailTech"] },
    { secteur: "Transport", exemples: ["MobilitéPlus", "TransportTech", "LogiSecure", "AéroSystems"] }
  ];

  // Liste des villes françaises
  const villesFrancaises = ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Lille", "Nantes", "Strasbourg", "Rennes", "Montpellier"];

  // Sélectionner un type d'entreprise aléatoire
  const typeEntreprise = typesEntreprises[Math.floor(Math.random() * typesEntreprises.length)];
  const nomEntreprise = typeEntreprise.exemples[Math.floor(Math.random() * typeEntreprise.exemples.length)];
  const villeEntreprise = villesFrancaises[Math.floor(Math.random() * villesFrancaises.length)];

  // Générer une mission appropriée en utilisant l'IA
  const systemMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: `Tu es un générateur de missions de cybersécurité pour un jeu de rôle. 
    Ta tâche est de créer une mission réaliste, avec des défis progressifs, pour un joueur qui va incarner un ${role.nom} (${role.description}).
    
    L'entreprise concernée s'appelle ${nomEntreprise}, elle est basée à ${villeEntreprise} et opère dans le secteur ${typeEntreprise.secteur}.
    
    Génère une mission complète avec:
    1. Un nom accrocheur pour la mission
    2. 3 à 5 PNJ (personnages non-joueurs) avec des personnalités distinctes, dont au moins un qui sera systématiquement hostile aux décisions du joueur
    3. 5 à 7 étapes de mission, chacune avec une décision à prendre (avec 3 choix possibles à chaque fois)
    4. Des conséquences variables selon les choix (sur le budget, la sécurité, la réputation)
    
    Réponds uniquement au format JSON, sans explications supplémentaires.
    `
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user",
    content: `Crée une mission cyber pour un ${role.nom}.`
  };

  try {
    const messages = [systemMessage, userMessage];
    const missionData = await openAIService.getChatCompletionJSON(messages);
    
    // Générer un ID pour la mission
    const missionId = uuidv4();
    
    // Créer la structure de session complète
    const session: CyberMissionSession = {
      userId: uuidv4(),
      missionId: missionId,
      missionNom: missionData.nomMission || "Opération Cyber Shield",
      entrepriseNom: nomEntreprise,
      entrepriseVille: villeEntreprise,
      entrepriseSecteur: typeEntreprise.secteur,
      roleJoueur: role.id,
      roleDescription: role.description,
      messages: [],
      pnjs: missionData.pnjs || [],
      etapeActuelle: 0,
      etapes: missionData.etapes || [],
      metriques: {
        budget: 100,
        securite: 70,
        reputation: 80,
        moral: 75
      },
      decisions: [],
      historiqueActions: [],
      estTerminee: false
    };
    
    return session;
  } catch (error) {
    console.error("Erreur lors de la génération de mission:", error);
    
    // Retourner une mission par défaut en cas d'erreur
    return {
      userId: uuidv4(),
      missionId: uuidv4(),
      missionNom: "Opération Cyber Shield",
      entrepriseNom: nomEntreprise,
      entrepriseVille: villeEntreprise,
      entrepriseSecteur: typeEntreprise.secteur,
      roleJoueur: role.id,
      roleDescription: role.description,
      messages: [],
      pnjs: [
        {
          id: "pnj1",
          nom: "Alexandre Moreau",
          role: "Directeur Général",
          personnalite: "Pragmatique, orienté business, peu technique",
          attitude: "neutre"
        },
        {
          id: "pnj2",
          nom: "Sophie Laurent",
          role: "Directrice Informatique (DSI)",
          personnalite: "Rationnelle, méthodique, attentive aux détails",
          attitude: "favorable"
        },
        {
          id: "pnj3",
          nom: "Marc Dubois",
          role: "Directeur Financier (CFO)",
          personnalite: "Sceptique, priorité aux économies, réticent aux investissements",
          attitude: "hostile"
        }
      ],
      etapeActuelle: 0,
      etapes: [
        {
          id: "introduction",
          type: "introduction",
          titre: "Bienvenue chez " + nomEntreprise,
          description: `Vous venez d'être recruté comme ${role.nom} chez ${nomEntreprise}, une entreprise de ${typeEntreprise.secteur} basée à ${villeEntreprise}. Le directeur général vous accueille et vous présente la situation actuelle.`,
          pnjActif: "pnj1"
        },
        {
          id: "decision1",
          type: "decision",
          titre: "Première évaluation",
          description: "Après avoir fait le tour des locaux, vous devez déterminer votre première action prioritaire.",
          pnjActif: "pnj1",
          choixPossibles: [
            {
              id: "audit",
              texte: "Réaliser un audit complet de sécurité",
              consequences: "Bonne vision globale mais coûteux et long"
            },
            {
              id: "sensibilisation",
              texte: "Lancer une campagne de sensibilisation des employés",
              consequences: "Impact rapide sur le facteur humain mais ne règle pas les problèmes techniques"
            },
            {
              id: "urgences",
              texte: "Corriger les vulnérabilités les plus critiques",
              consequences: "Action rapide mais vision partielle des risques"
            }
          ]
        },
        {
          id: "decision2",
          type: "decision",
          titre: "Restriction budgétaire",
          description: "Le directeur financier vous informe que le budget sécurité doit être réduit. Comment réagissez-vous?",
          pnjActif: "pnj3",
          choixPossibles: [
            {
              id: "accepter",
              texte: "Accepter la réduction et optimiser les ressources",
              consequences: "Maintient de bonnes relations mais sécurité affaiblie"
            },
            {
              id: "negocier",
              texte: "Négocier en présentant les risques concrets",
              consequences: "Possibilité de maintenir une partie du budget"
            },
            {
              id: "refuser",
              texte: "Refuser catégoriquement en alertant sur les dangers",
              consequences: "Tension avec la direction financière mais sécurité maintenue"
            }
          ]
        },
        {
          id: "decision3",
          type: "decision",
          titre: "Incident de sécurité",
          description: "Une tentative d'intrusion est détectée sur les serveurs. Quelle est votre première réaction?",
          pnjActif: "pnj2",
          choixPossibles: [
            {
              id: "isoler",
              texte: "Isoler immédiatement les systèmes concernés",
              consequences: "Limitation des dégâts mais interruption de service"
            },
            {
              id: "analyser",
              texte: "Analyser l'attaque tout en maintenant les systèmes",
              consequences: "Services maintenus mais risque de propagation"
            },
            {
              id: "externe",
              texte: "Faire appel à un prestataire spécialisé",
              consequences: "Expertise externe mais coût élevé et délai d'intervention"
            }
          ]
        },
        {
          id: "finale",
          type: "finale",
          titre: "Bilan de vos actions",
          description: "Après plusieurs semaines, la direction évalue votre impact sur la sécurité de l'entreprise.",
          pnjActif: "pnj1"
        }
      ],
      metriques: {
        budget: 100,
        securite: 70,
        reputation: 80,
        moral: 75
      },
      decisions: [],
      historiqueActions: [],
      estTerminee: false
    };
  }
}

/**
 * Génère les conséquences d'une décision en utilisant l'IA
 */
async function generateConsequences(session: CyberMissionSession, etape: MissionStage, choix: MissionChoice) {
  // Sélectionner le PNJ qui va réagir (utiliser celui de l'étape ou en choisir un au hasard)
  const pnjActif = etape.pnjActif ? 
    session.pnjs.find(pnj => pnj.id === etape.pnjActif) : 
    session.pnjs[Math.floor(Math.random() * session.pnjs.length)];
  
  // Construire le prompt pour l'IA
  const systemMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: `Tu es un générateur de réactions et conséquences pour un jeu de rôle de cybersécurité.
    
    Contexte: Le joueur est ${session.roleJoueur} chez ${session.entrepriseNom} (${session.entrepriseSecteur}) à ${session.entrepriseVille}.
    
    État actuel de l'entreprise:
    - Budget: ${session.metriques.budget}/100
    - Sécurité: ${session.metriques.securite}/100
    - Réputation: ${session.metriques.reputation}/100
    - Moral de l'équipe: ${session.metriques.moral}/100
    
    Le PNJ qui va réagir est: ${pnjActif?.nom} (${pnjActif?.role}) dont l'attitude est généralement "${pnjActif?.attitude}" et la personnalité: "${pnjActif?.personnalite}".
    
    Situation actuelle: ${etape.description}
    
    Le joueur a choisi: "${choix.texte}"
    
    Génère une réaction réaliste du PNJ et les conséquences de cette décision, avec:
    1. Un message de réaction du PNJ (en gardant son style et sa personnalité)
    2. Des impacts chiffrés sur les métriques (budget, sécurité, réputation, moral)
    3. Détermine si ce choix peut mener à un licenciement ou une fin de mission
    
    Réponds au format JSON avec les champs: "message", "impactBudget", "impactSecurite", "impactReputation", "impactMoral", "finMission" (boolean), "typeFinMission" (si applicable: "licenciement", "succes", "echec").
    `
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user",
    content: `Générer la réaction à la décision: "${choix.texte}"`
  };

  try {
    const messages = [systemMessage, userMessage];
    const consequences = await openAIService.getChatCompletionJSON(messages);
    
    // Ajouter l'ID du PNJ qui réagit
    consequences.pnjActif = pnjActif?.id;
    
    return consequences;
  } catch (error) {
    console.error("Erreur lors de la génération des conséquences:", error);
    
    // Retourner des conséquences par défaut en cas d'erreur
    return {
      message: `${pnjActif?.nom}: Je prends note de votre décision de ${choix.texte}. Nous verrons si cela s'avère être la bonne approche.`,
      pnjActif: pnjActif?.id,
      impactBudget: 0,
      impactSecurite: 0,
      impactReputation: 0,
      impactMoral: 0,
      finMission: false
    };
  }
}

/**
 * Termine une mission volontairement et génère un rapport final
 */
export async function endMission(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    
    // Récupérer la session de mission
    const session = missionSessions.get(userId);
    if (!session) {
      return res.status(404).json({ error: "Session de mission non trouvée" });
    }
    
    // Marquer la mission comme terminée
    session.estTerminee = true;
    session.resultatFinal = 'abandon';
    
    // Générer un rapport final
    const rapport = await generateMissionReport(session);
    
    // Sauvegarder la session mise à jour
    missionSessions.set(userId, session);
    
    return res.status(200).json({
      success: true,
      message: rapport.message,
      rapport: rapport.details,
      missionTerminee: true,
      resultatFinal: 'abandon',
      metriques: session.metriques
    });
    
  } catch (error) {
    console.error("Erreur lors de la fin de mission:", error);
    return res.status(500).json({ error: "Erreur lors de la fin de mission" });
  }
}

/**
 * Génère un rapport final de mission
 */
async function generateMissionReport(session: CyberMissionSession) {
  // Construire le prompt pour l'IA
  const systemMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: `Tu es un générateur de rapports pour un jeu de rôle de cybersécurité.
    
    La mission "${session.missionNom}" vient de se terminer avec le statut: ${session.resultatFinal || 'abandon'}.
    
    Contexte: Le joueur était ${session.roleJoueur} chez ${session.entrepriseNom} (${session.entrepriseSecteur}) à ${session.entrepriseVille}.
    
    État final de l'entreprise:
    - Budget: ${session.metriques.budget}/100
    - Sécurité: ${session.metriques.securite}/100
    - Réputation: ${session.metriques.reputation}/100
    - Moral de l'équipe: ${session.metriques.moral}/100
    
    Décisions prises:
    ${session.decisions.map(d => {
      const etape = session.etapes.find(e => e.id === d.etapeId);
      const choix = etape?.choixPossibles?.find(c => c.id === d.choixId);
      return `- ${etape?.titre}: "${choix?.texte}"`;
    }).join('\n')}
    
    Génère un rapport de fin de mission avec:
    1. Un message de débriefing général
    2. Une analyse des points forts et des erreurs
    3. Des conseils pour améliorer les décisions à l'avenir
    
    Réponds au format JSON avec les champs: "message" (texte du débriefing), "details" (analyse détaillée).
    `
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user",
    content: `Générer le rapport final de la mission "${session.missionNom}"`
  };

  try {
    const messages = [systemMessage, userMessage];
    return await openAIService.getChatCompletionJSON(messages);
  } catch (error) {
    console.error("Erreur lors de la génération du rapport de mission:", error);
    
    // Retourner un rapport par défaut en cas d'erreur
    return {
      message: `Mission "${session.missionNom}" terminée.\n\nVotre performance en tant que ${session.roleJoueur} chez ${session.entrepriseNom} a eu des résultats mitigés. Certaines décisions ont été pertinentes, d'autres auraient pu être améliorées.`,
      details: "Pas de détails disponibles en raison d'une erreur technique."
    };
  }
}