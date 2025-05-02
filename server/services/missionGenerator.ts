import { MissionBrief, MissionStep, MissionChoice, ChoiceConsequence, CyberRole } from '@shared/types/roles';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from '../../I_AM_CYBER/services/openai';
import { ChatCompletionRequestMessage } from '../../shared/schema';

interface MissionGenerationConfig {
  roleId: CyberRole;
  moduleId: string;
  userName: string;
}

// Fonction pour générer un prompt adapté au rôle
function getRoleSpecificPrompt(roleId: CyberRole): string {
  const rolePrompts = {
    responsable_securite: "En tant que RSSI (Responsable de la Sécurité des Systèmes d'Information), vous êtes chargé de définir, mettre en œuvre et superviser la politique de sécurité de l'information de l'organisation. Vos missions impliquent la gestion des risques, la conformité réglementaire, la sensibilisation à la sécurité, et la supervision de la réponse aux incidents.",
    pentester: "En tant que Pentester (Testeur d'intrusion), vous êtes chargé d'évaluer la sécurité des systèmes d'information en simulant des attaques réelles pour identifier les vulnérabilités. Vos missions impliquent la reconnaissance, l'exploitation de failles, l'escalade de privilèges et la documentation des résultats pour améliorer la sécurité.",
    analyste_soc: "En tant qu'Analyste SOC (Centre Opérationnel de Sécurité), vous êtes en première ligne de la détection et de la réponse aux incidents de sécurité. Vos missions impliquent la surveillance des alertes, l'analyse des événements suspects, l'investigation des incidents et la coordination de la réponse initiale.",
    analyste_securite: "En tant qu'Analyste de Sécurité, vous êtes chargé d'analyser et d'évaluer les menaces et vulnérabilités pour prévenir les incidents de sécurité. Vos missions impliquent la surveillance des systèmes, l'évaluation des risques, la détection des anomalies et la mise en place de mesures préventives.",
    expert_forensique: "En tant qu'Expert Forensique (Investigation numérique), vous êtes chargé d'analyser les incidents de sécurité après qu'ils se soient produits. Vos missions impliquent la collecte de preuves numériques, l'analyse de malwares, la reconstruction chronologique des événements et l'établissement des faits pour déterminer l'origine et l'ampleur des compromissions.",
    ingenieur_reseau: "En tant qu'Ingénieur Réseau Sécurité, vous êtes chargé de concevoir, déployer et maintenir des infrastructures réseau sécurisées. Vos missions impliquent la segmentation réseau, la mise en place de systèmes de détection d'intrusion, la sécurisation du périmètre, et la protection des communications."
  };
  
  return rolePrompts[roleId] || "Vous êtes un professionnel de la cybersécurité chargé de missions importantes pour protéger les systèmes d'information.";
}

// Fonction pour générer un prompt adapté au module
function getModuleSpecificPrompt(moduleId: string): string {
  const moduleMap: Record<string, string> = {
    // RSSI
    strategie_securite: "élaboration et mise en œuvre d'une stratégie de sécurité globale pour l'organisation",
    gouvernance: "établissement d'un cadre de gouvernance efficace pour la cybersécurité",
    gestion_risques: "identification, évaluation et gestion des risques de sécurité",
    crise_cyber: "préparation et gestion d'une crise cybersécurité majeure",
    
    // Pentester
    reconnaissance: "collecte d'informations et analyse de la surface d'attaque d'une organisation",
    exploitation: "exploitation méthodique de vulnérabilités pour tester la sécurité",
    post_exploitation: "analyse de l'impact réel d'une compromission de sécurité",
    redteam: "simulation d'attaques avancées ciblées dans le cadre d'un exercice Red Team",
    
    // Analyste SOC
    detection: "mise en place et optimisation de mécanismes de détection des menaces",
    analyse_forensique: "investigation numérique approfondie suite à un incident",
    chasse_menaces: "recherche proactive de menaces avancées dans l'environnement",
    analyse_malware: "analyse et compréhension des logiciels malveillants",
    
    // Développeur Sécurité
    securite_applicative: "intégration de la sécurité dans le développement d'applications",
    devsecops: "mise en œuvre de pratiques DevSecOps dans le cycle de développement",
    tests_securite: "réalisation de tests de sécurité sur les applications",
    securite_api: "sécurisation des interfaces de programmation d'applications",
    
    // Consultant
    audit_securite: "réalisation d'un audit complet de la sécurité d'une organisation",
    conseil_strategique: "conseil stratégique en matière de transformation de la sécurité",
    analyse_conformite: "évaluation de la conformité aux normes et réglementations",
    gestion_projets_securite: "gestion d'un projet complexe de transformation sécurité",
    
    // Architecte
    conception_securite: "conception d'architectures résistantes aux attaques modernes",
    securite_cloud: "sécurisation d'environnements cloud et multi-cloud",
    securite_zero_trust: "mise en œuvre d'une architecture Zero Trust",
    defense_perimetre: "protection efficace du périmètre réseau de l'organisation",
    
    // Modules communs
    gestion_incidents: "mise en place d'un processus efficace de gestion des incidents",
    conformite_reglementaire: "mise en conformité avec les réglementations en vigueur"
  };
  
  return moduleMap[moduleId] || "protection des systèmes d'information contre les cybermenaces";
}

/**
 * Génère une mission à partir des données de rôle et module
 * @param config Configuration pour la génération de mission
 * @returns Mission générée
 */
export async function generateMission(config: MissionGenerationConfig): Promise<MissionBrief> {
  try {
    const { roleId, moduleId, userName } = config;
    
    // Construire le prompt pour l'IA
    const rolePrompt = getRoleSpecificPrompt(roleId);
    const modulePrompt = getModuleSpecificPrompt(moduleId);
    
    const systemPrompt = `
      Tu es un générateur de scénarios de cybersécurité réalistes et immersifs pour une formation professionnelle.
      
      ${rolePrompt}
      
      Tu dois générer un briefing de mission réaliste concernant la ${modulePrompt}.
      La mission doit être crédible, détaillée et adaptée au monde professionnel actuel.
      
      Structure ta réponse sous forme de JSON avec les champs suivants:
      - title: un titre accrocheur pour la mission
      - organization: une organisation fictive mais réaliste (avec secteur, taille, etc.)
      - scenario: une description du contexte et de la situation
      - objectives: un tableau d'objectifs clairs (3-5 items)
      - constraints: un tableau de contraintes ou limitations (2-4 items)
      - context: des informations contextuelles supplémentaires
      - initialSituation: la situation initiale que l'utilisateur rencontrera
      
      Assure-toi que le contenu est professionnel, réaliste, et sans fautes.
    `;
    
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Génère une mission de cybersécurité pour ${userName} en tant que ${roleId} concernant ${modulePrompt}.` }
    ];
    
    const content = await openAIService.getChatCompletionWithCache(messages, 0.7, 2000);
    
    // Extraire et parser la réponse JSON
    const missionData = JSON.parse(content || "{}");
    
    // Construire l'objet MissionBrief
    const missionBrief: MissionBrief = {
      id: uuidv4(),
      title: missionData.title || `Mission de ${modulePrompt}`,
      roleId,
      moduleId,
      organization: missionData.organization || "Organisation fictive",
      scenario: missionData.scenario || "Scénario par défaut",
      objectives: missionData.objectives || ["Compléter la mission avec succès"],
      constraints: missionData.constraints || ["Respecter les bonnes pratiques de sécurité"],
      context: missionData.context || "Contexte par défaut",
      initialSituation: missionData.initialSituation || "Vous commencez cette mission..."
    };
    
    return missionBrief;
  } catch (error) {
    console.error("Erreur lors de la génération de la mission:", error);
    // Retourner une mission par défaut en cas d'erreur
    return {
      id: uuidv4(),
      title: `Mission pour ${config.roleId}`,
      roleId: config.roleId,
      moduleId: config.moduleId,
      organization: "Organisation (erreur de génération)",
      scenario: "Scénario par défaut (erreur de génération)",
      objectives: ["Compléter la mission avec succès"],
      constraints: ["Respecter les bonnes pratiques"],
      context: "Contexte par défaut",
      initialSituation: "Situation initiale par défaut"
    };
  }
}

/**
 * Génère les choix pour une étape de mission
 * @param missionBrief Brief de mission
 * @param currentSituation Description de la situation actuelle
 * @returns Étape de mission avec choix générés
 */
export async function generateMissionStep(
  missionBrief: MissionBrief,
  currentSituation?: string
): Promise<MissionStep> {
  try {
    const situationToUse = currentSituation || missionBrief.initialSituation;
    
    // Construire le prompt pour l'IA
    const systemPrompt = `
      Tu es un générateur de scénarios de cybersécurité interactifs.
      
      Tu dois générer une étape interactive pour la mission suivante :
      Titre: ${missionBrief.title}
      Organisation: ${missionBrief.organization}
      Scénario: ${missionBrief.scenario}
      
      En fonction de la situation actuelle, génère une description de la situation et plusieurs choix possibles.
      
      Structure ta réponse sous forme de JSON avec les champs suivants:
      - situation: une description détaillée de la situation actuelle
      - choices: un tableau de 3-4 choix possibles, chacun ayant:
        - id: un identifiant unique
        - text: la description du choix
        - type: le type de choix (technical, managerial, diplomatic, escalation, investigation)
      
      Assure-toi que les choix soient variés, réalistes et pertinents, avec des approches différentes.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Génère une étape interactive pour la mission sur la base de cette situation: ${situationToUse}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extraire et parser la réponse JSON
    const content = response.choices[0].message.content;
    const stepData = JSON.parse(content || "{}");
    
    // S'assurer que chaque choix a un ID
    const processedChoices = (stepData.choices || []).map((choice: any) => ({
      id: choice.id || uuidv4(),
      text: choice.text || "Option par défaut",
      type: choice.type || "technical"
    }));
    
    // Construire l'objet MissionStep
    const missionStep: MissionStep = {
      situation: stepData.situation || situationToUse,
      choices: processedChoices
    };
    
    return missionStep;
  } catch (error) {
    console.error("Erreur lors de la génération de l'étape de mission:", error);
    // Retourner une étape par défaut en cas d'erreur
    return {
      situation: currentSituation || missionBrief.initialSituation,
      choices: [
        {
          id: uuidv4(),
          text: "Analyser la situation de manière technique",
          type: "technical"
        },
        {
          id: uuidv4(),
          text: "Consulter l'équipe pour une décision collective",
          type: "managerial"
        },
        {
          id: uuidv4(),
          text: "Escalader le problème à la hiérarchie",
          type: "escalation"
        }
      ]
    };
  }
}

/**
 * Génère la conséquence d'un choix de mission
 * @param missionBrief Brief de mission
 * @param choice Choix sélectionné
 * @returns Description de la conséquence et nouvelle situation
 */
export async function generateChoiceConsequence(
  missionBrief: MissionBrief,
  choice: MissionChoice
): Promise<ChoiceConsequence> {
  try {
    // Déterminer la probabilité de succès/échec en fonction du type de choix
    let successProbability = 0.7; // Valeur par défaut modérée
    let terminationProbability = 0.05; // Probabilité de fin de mission
    
    // Certains types de choix ont des probabilités différentes
    if (choice.type === 'technical') successProbability = 0.75;
    if (choice.type === 'managerial') successProbability = 0.65;
    if (choice.type === 'diplomatic') successProbability = 0.8;
    if (choice.type === 'escalation') {
      successProbability = 0.6;
      terminationProbability = 0.1; // Plus de chances que l'escalade termine la mission
    }
    if (choice.type === 'investigation') successProbability = 0.85;
    
    // Construire le prompt pour l'IA
    const systemPrompt = `
      Tu es un générateur de conséquences narratives pour des scénarios de cybersécurité.
      
      Tu dois générer les conséquences du choix suivant dans le contexte de cette mission:
      Titre: ${missionBrief.title}
      Organisation: ${missionBrief.organization}
      Choix: ${choice.text}
      Type de choix: ${choice.type}
      
      Structure ta réponse sous forme de JSON avec les champs suivants:
      - text: une description détaillée des conséquences
      - outcome: le résultat (success, partial, failure, termination)
      - outcomeDescription: une courte description du résultat
      - newSituation: la nouvelle situation après ce choix
      - learningPoints: un tableau de points d'apprentissage (2-3 items)
      
      Les résultats possibles sont:
      - success: le choix a été très efficace
      - partial: le choix a partiellement résolu le problème
      - failure: le choix a échoué mais la mission continue
      - termination: le choix a conduit à l'échec de la mission
      
      La probabilité de succès pour ce choix est d'environ ${Math.round(successProbability * 100)}%, 
      avec une petite probabilité (${Math.round(terminationProbability * 100)}%) que le choix mène à une termination.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Génère les conséquences pour le choix: "${choice.text}" dans le contexte de la mission "${missionBrief.title}".` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Extraire et parser la réponse JSON
    const content = response.choices[0].message.content;
    const consequenceData = JSON.parse(content || "{}");
    
    // Construire l'objet ChoiceConsequence
    const consequence: ChoiceConsequence = {
      text: consequenceData.text || "Conséquence par défaut",
      outcome: consequenceData.outcome || "partial",
      outcomeDescription: consequenceData.outcomeDescription || "Résultat par défaut",
      newSituation: consequenceData.newSituation || "Nouvelle situation par défaut",
      learningPoints: consequenceData.learningPoints || ["Point d'apprentissage par défaut"]
    };
    
    return consequence;
  } catch (error) {
    console.error("Erreur lors de la génération de la conséquence:", error);
    // Retourner une conséquence par défaut en cas d'erreur
    return {
      text: "Votre action a eu des conséquences mitigées. Certains aspects ont fonctionné, d'autres non.",
      outcome: "partial",
      outcomeDescription: "Résultat mitigé",
      newSituation: "La situation a légèrement évolué mais d'autres défis restent à relever.",
      learningPoints: ["Toujours évaluer les risques avant d'agir", "La communication est essentielle en cybersécurité"]
    };
  }
}