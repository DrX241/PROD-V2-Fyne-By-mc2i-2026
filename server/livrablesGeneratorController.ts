import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

// Types de générateurs disponibles
export type LivrableGeneratorType = 
  | 'functional-requirements' 
  | 'test-plan' 
  | 'meeting-minutes' 
  | 'agile-backlog' 
  | 'security-policy';

// Interface pour les requêtes de génération de livrables
interface GenerateLivrableRequest {
  generatorType: LivrableGeneratorType;
  inputs: Record<string, string>;
}

// Interface pour les sections du document généré
interface DocumentSection {
  title: string;
  content: string;
}

// Interface pour les réponses de génération de livrables
interface GeneratedLivrableResponse {
  content: string;
  sections?: DocumentSection[];
}

/**
 * Génère une expression de besoin fonctionnel
 */
async function generateFunctionalRequirements(inputs: Record<string, string>): Promise<GeneratedLivrableResponse> {
  const systemPrompt = `Tu es un expert en assistance à maîtrise d'ouvrage (AMOA) spécialisé dans la rédaction d'expressions de besoins fonctionnels.
Tu dois produire un document structuré, professionnel et complet à partir des informations fournies par l'utilisateur.
Le document doit être structuré avec les sections suivantes:
1. CONTEXTE ET OBJECTIFS
2. PÉRIMÈTRE DU PROJET
3. PROCESSUS ACTUEL (si applicable)
4. BESOINS FONCTIONNELS
5. CAS D'USAGE PRINCIPAUX
6. CONTRAINTES ET EXIGENCES
7. CRITÈRES DE SUCCÈS

Chaque section doit être clairement identifiée et détaillée.
Ton style doit être professionnel, précis et adapté à un document officiel.
Évite le jargon trop technique sauf si le contexte l'exige.
Utilise les informations fournies par l'utilisateur mais n'hésite pas à enrichir le document avec des considérations pertinentes que l'utilisateur aurait pu omettre.
Réponds uniquement avec le document formaté, sans commentaires supplémentaires.`;

  const userPrompt = `Voici les informations pour générer l'expression de besoin fonctionnel :
- Contexte du projet : ${inputs['context'] || 'Non spécifié'}
- Besoin métier principal : ${inputs['business-need'] || 'Non spécifié'}
- Processus actuel : ${inputs['current-process'] || 'Non spécifié'}
- Types d'utilisateurs concernés : ${inputs['user-types'] || 'Non spécifié'}
- Contraintes particulières : ${inputs['constraints'] || 'Non spécifié'}

Génère un document complet et structuré d'expression de besoin fonctionnel à partir de ces informations.`;

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const content = await openAIService.createChatCompletion(messages, 0.7, 2500);

  // Extraction des sections pour l'interface accordéon
  const sections: DocumentSection[] = [];
  const lines = content.split('\n');
  let currentSection: DocumentSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\.\s+[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']+$/.test(line)) {
      // Si on a déjà une section en cours, on l'ajoute au tableau
      if (currentSection) {
        sections.push(currentSection);
      }
      // Nouvelle section
      currentSection = {
        title: line,
        content: ''
      };
    } else if (currentSection) {
      // Ajouter la ligne à la section en cours
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  // Ajouter la dernière section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections
  };
}

/**
 * Génère un plan de test fonctionnel
 */
async function generateTestPlan(inputs: Record<string, string>): Promise<GeneratedLivrableResponse> {
  const systemPrompt = `Tu es un expert en assurance qualité spécialisé dans la rédaction de plans de tests fonctionnels.
Tu dois produire un document de test clair, structuré et complet à partir des informations fournies.
Le document doit être structuré avec les sections suivantes:
1. INTRODUCTION (objectif de la fonctionnalité testée)
2. PRÉREQUIS ET ENVIRONNEMENT
3. SCÉNARIOS DE TEST
   - Chaque scénario doit inclure:
     * ID unique
     * Description du test
     * Prérequis spécifiques
     * Étapes détaillées (numérotées)
     * Résultat attendu
     * Critère de validation
4. CAS LIMITES ET SCÉNARIOS D'ERREUR
5. CRITÈRES D'ACCEPTATION

Utilise un format tabulaire ou structuré pour les scénarios de test.
Inclus au moins 5-7 scénarios de test pertinents, dont certains couvrant les cas limites.
Ton style doit être précis, factuel, avec des étapes claires et des résultats attendus non ambigus.
N'inclus pas d'aspects techniques d'implémentation, reste au niveau fonctionnel.
Réponds uniquement avec le document formaté, sans commentaires supplémentaires.`;

  const userPrompt = `Voici les informations pour générer le plan de test fonctionnel :
- Description de la fonctionnalité : ${inputs['feature-description'] || 'Non spécifié'}
- User Story : ${inputs['user-story'] || 'Non spécifié'}
- Critères d'acceptation : ${inputs['acceptance-criteria'] || 'Non spécifié'}
- Cas limites à considérer : ${inputs['edge-cases'] || 'Non spécifié'}
- Environnement de test : ${inputs['test-environment'] || 'Non spécifié'}

Génère un plan de test fonctionnel complet et structuré à partir de ces informations.`;

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const content = await openAIService.createChatCompletion(messages, 0.7, 2500);

  // Extraction des sections pour l'interface accordéon
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\.\s+[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']+$/.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections
  };
}

/**
 * Génère un compte-rendu de réunion
 */
async function generateMeetingMinutes(inputs: Record<string, string>): Promise<GeneratedLivrableResponse> {
  // Déterminer le format demandé
  const formatType = inputs['format-type'] || 'standard';
  
  let formatInstruction = "";
  switch (formatType) {
    case 'detailed':
      formatInstruction = "Adopte un format détaillé et chronologique qui capture l'intégralité des échanges, avec un résumé pour chaque point abordé.";
      break;
    case 'executive':
      formatInstruction = "Adopte un format de synthèse exécutive, concis et orienté vers les décisions, adapté pour les dirigeants pressés.";
      break;
    default: // standard
      formatInstruction = "Adopte un format standard structuré autour des points clés discutés, des décisions prises et des actions à suivre.";
  }

  const systemPrompt = `Tu es un assistant administratif professionnel spécialisé dans la rédaction de comptes-rendus de réunion.
Tu dois transformer des notes brutes en un compte-rendu clair, structuré et professionnel.
${formatInstruction}

Le document doit généralement inclure:
1. INFORMATIONS DE LA RÉUNION (titre, date, participants)
2. RÉSUMÉ EXÉCUTIF (synthèse des points principaux en 2-3 phrases)
3. POINTS ABORDÉS (structurés par thèmes/sujets)
4. DÉCISIONS PRISES (clairement identifiées)
5. ACTIONS À SUIVRE (avec responsable et échéance si mentionnés)
6. PROCHAINE RÉUNION (date et objectifs si mentionnés)

Ton style doit être professionnel, concis et factuel.
Reformule les notes brutes en phrases complètes et cohérentes.
Organise l'information logiquement, même si les notes originales sont désordonnées.
Utilise la voix passive pour les décisions ("Il a été décidé que...").
Réponds uniquement avec le document formaté, sans commentaires supplémentaires.`;

  const userPrompt = `Voici les informations pour générer le compte-rendu de réunion :
- Sujet de la réunion : ${inputs['meeting-subject'] || 'Non spécifié'}
- Date : ${inputs['date'] || 'Non spécifié'}
- Participants : ${inputs['participants'] || 'Non spécifié'}
- Notes brutes : 
${inputs['raw-notes'] || 'Non spécifié'}

Génère un compte-rendu de réunion professionnel et structuré à partir de ces notes brutes.`;

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const content = await openAIService.createChatCompletion(messages, 0.7, 2000);

  // Extraction des sections pour l'interface accordéon
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Matcher différents formats de titres (numérotés ou tout en majuscules)
    if (/^\d+\.\s+[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']+$/.test(line) || /^[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']{5,}$/.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections
  };
}

/**
 * Génère un backlog initial Agile
 */
async function generateAgileBacklog(inputs: Record<string, string>): Promise<GeneratedLivrableResponse> {
  // Déterminer le format demandé
  const storyFormat = inputs['story-format'] || 'standard';
  
  let formatInstruction = "";
  switch (storyFormat) {
    case 'detailed':
      formatInstruction = "Inclus pour chaque User Story des critères d'acceptation détaillés et des notes techniques si pertinent.";
      break;
    case 'themed':
      formatInstruction = "Regroupe les User Stories par thèmes fonctionnels et indique une priorité relative pour chaque thème.";
      break;
    default: // standard
      formatInstruction = "Utilise le format standard 'En tant que [persona], je veux [action] afin de [bénéfice]' pour chaque User Story.";
  }

  const systemPrompt = `Tu es un Product Owner expérimenté spécialisé dans la création de backlogs Agile.
Tu dois produire un backlog initial de User Stories à partir des informations fournies.
Le backlog doit contenir une quinzaine de User Stories pertinentes, organisées logiquement.
${formatInstruction}

Le document doit être structuré avec:
1. VISION PRODUIT (synthèse du projet et des objectifs)
2. UTILISATEURS ET PERSONAS (brève description des différents utilisateurs)
3. BACKLOG DE USER STORIES
   - ${storyFormat === 'themed' ? 'Organisé par thèmes fonctionnels' : 'Liste priorisée de User Stories'}
   - Pour chaque User Story: ID, priorité (Must-have, Should-have, Could-have), estimation (S, M, L, XL) et ${storyFormat === 'detailed' ? 'critères d\'acceptation' : 'brève description'}
4. CONSIDÉRATIONS IMPORTANTES (dépendances, risques, etc.)

Ton style doit être clair, précis et orienté valeur métier.
Les User Stories doivent être indépendantes, négociables, valorisables, estimables, petites et testables (INVEST).
Réponds uniquement avec le document formaté, sans commentaires supplémentaires.`;

  const userPrompt = `Voici les informations pour générer le backlog Agile :
- Périmètre du projet : ${inputs['project-scope'] || 'Non spécifié'}
- Types d'utilisateurs : ${inputs['user-types'] || 'Non spécifié'}
- Fonctionnalités clés : ${inputs['key-features'] || 'Non spécifié'}
- Contraintes et priorités : ${inputs['constraints'] || 'Non spécifié'}

Génère un backlog initial Agile à partir de ces informations.`;

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const content = await openAIService.createChatCompletion(messages, 0.7, 2500);

  // Extraction des sections pour l'interface accordéon
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\.\s+[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']+$/.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections
  };
}

/**
 * Génère une politique de sécurité simplifiée
 */
async function generateSecurityPolicy(inputs: Record<string, string>): Promise<GeneratedLivrableResponse> {
  // Obtenir le domaine de sécurité
  let securityDomain = inputs['security-domain'] || 'custom';
  if (securityDomain === 'custom') {
    securityDomain = inputs['custom-domain'] || 'général';
  }
  
  // Obtenir le public cible
  const audience = inputs['audience'] || 'general';
  
  let audienceInstruction = "";
  switch (audience) {
    case 'technical':
      audienceInstruction = "Adapte le document pour une équipe technique avec des détails techniques spécifiques et des références aux standards et meilleures pratiques.";
      break;
    case 'management':
      audienceInstruction = "Adapte le document pour la direction avec un focus sur les aspects stratégiques, risques business et conformité réglementaire.";
      break;
    case 'multi':
      audienceInstruction = "Produis deux sections distinctes : une version vulgarisée pour tous les employés et une version plus technique pour les équipes informatiques.";
      break;
    default: // general
      audienceInstruction = "Adapte le document pour un public général sans expertise technique particulière, en privilégiant la clarté et la facilité de compréhension.";
  }

  const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la rédaction de politiques de sécurité.
Tu dois produire une politique de sécurité simplifiée mais complète sur le domaine "${securityDomain}".
${audienceInstruction}

Le document doit généralement inclure:
1. INTRODUCTION ET OBJECTIFS
2. CHAMP D'APPLICATION
3. RÔLES ET RESPONSABILITÉS
4. EXIGENCES DÉTAILLÉES
5. PROCÉDURES DE CONFORMITÉ
6. GESTION DES INCIDENTS ET EXCEPTIONS
7. GLOSSAIRE (si nécessaire)

Ton style doit être clair, direct et adapté au public cible.
Utilise des puces et des sections numérotées pour améliorer la lisibilité.
Évite le jargon inutile mais inclus les termes techniques pertinents avec leur définition si nécessaire.
La politique doit être applicable et réaliste par rapport au contexte de l'organisation.
Réponds uniquement avec le document formaté, sans commentaires supplémentaires.`;

  const userPrompt = `Voici les informations pour générer la politique de sécurité "${securityDomain}" :
- Contexte de l'organisation : ${inputs['organization-context'] || 'Non spécifié'}
- Exigences spécifiques : ${inputs['specific-requirements'] || 'Non spécifié'}
- Public cible : ${audience}

Génère une politique de sécurité adaptée à partir de ces informations.`;

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const content = await openAIService.createChatCompletion(messages, 0.7, 2500);

  // Extraction des sections pour l'interface accordéon
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\.\s+[A-ZÉÈÊËÀÂÔÙÛÇÑ\s']+$/.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections
  };
}

/**
 * Endpoint principal pour générer un livrable en fonction du type demandé
 */
export async function generateLivrable(req: Request, res: Response) {
  try {
    const { generatorType, inputs } = req.body as GenerateLivrableRequest;

    if (!generatorType || !inputs) {
      return res.status(400).json({
        success: false,
        message: 'Type de générateur et données d\'entrée requis'
      });
    }

    let result: GeneratedLivrableResponse;

    switch (generatorType) {
      case 'functional-requirements':
        result = await generateFunctionalRequirements(inputs);
        break;
      case 'test-plan':
        result = await generateTestPlan(inputs);
        break;
      case 'meeting-minutes':
        result = await generateMeetingMinutes(inputs);
        break;
      case 'agile-backlog':
        result = await generateAgileBacklog(inputs);
        break;
      case 'security-policy':
        result = await generateSecurityPolicy(inputs);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Type de générateur non reconnu'
        });
    }

    return res.status(200).json({
      success: true,
      content: result.content,
      sections: result.sections
    });

  } catch (error) {
    console.error('Erreur lors de la génération du livrable:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}