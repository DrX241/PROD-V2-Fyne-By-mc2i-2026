/**
 * Service pour générer, stocker et gérer des pièces jointes pour les emails
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { openAIService } from './openai';
import { fileURLToPath } from 'url';

type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Récupérer le chemin du répertoire actuel en module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier où les pièces jointes seront stockées
const ATTACHMENTS_DIR = path.join(__dirname, '../public/attachments');

// S'assurer que le répertoire existe
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

interface AttachmentMetadata {
  id: string;
  filename: string;
  type: string;
  createdAt: string;
  scenarioId: string;
  size: number;
  url: string;
}

/**
 * Types de pièces jointes qui peuvent être générées
 */
export enum AttachmentType {
  LOG_FILE = 'log_file',
  INCIDENT_REPORT = 'incident_report',
  SECURITY_ANALYSIS = 'security_analysis',
  CONFIDENTIAL_MEMO = 'confidential_memo',
  TECHNICAL_SPECS = 'technical_specs',
  VULNERABILITY_SCAN = 'vulnerability_scan',
  DATA_BREACH_NOTIFICATION = 'data_breach_notification',
  CUSTOMER_COMMUNICATION = 'customer_communication',
  FORENSIC_EVIDENCE = 'forensic_evidence',
  REGULATORY_FILING = 'regulatory_filing',
  SOFTWARE_PATCH = 'software_patch'
}

/**
 * Générer une pièce jointe basée sur le contexte du scénario
 */
export async function generateAttachment(
  scenarioId: string,
  scenarioTitle: string,
  scenarioDomain: string,
  attachmentType: AttachmentType,
  context: string,
  currentStage: number,
  userRole: string
): Promise<AttachmentMetadata> {
  // Générer un identifiant unique pour la pièce jointe
  const attachmentId = crypto.randomUUID();
  
  // Créer un nom de fichier basé sur le type de pièce jointe
  let filename: string;
  let extension: string;
  
  switch (attachmentType) {
    case AttachmentType.LOG_FILE:
      filename = `server_logs_${Date.now()}`;
      extension = 'log';
      break;
    case AttachmentType.INCIDENT_REPORT:
      filename = `incident_report_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.SECURITY_ANALYSIS:
      filename = `security_analysis_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.CONFIDENTIAL_MEMO:
      filename = `confidential_memo_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.TECHNICAL_SPECS:
      filename = `technical_specifications_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.VULNERABILITY_SCAN:
      filename = `vulnerability_scan_results_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.DATA_BREACH_NOTIFICATION:
      filename = `data_breach_notification_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.CUSTOMER_COMMUNICATION:
      filename = `customer_communication_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.FORENSIC_EVIDENCE:
      filename = `forensic_evidence_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.REGULATORY_FILING:
      filename = `regulatory_filing_${Date.now()}`;
      extension = 'txt';
      break;
    case AttachmentType.SOFTWARE_PATCH:
      filename = `security_patch_${Date.now()}`;
      extension = 'txt';
      break;
    default:
      filename = `attachment_${Date.now()}`;
      extension = 'txt';
  }
  
  // Chemin complet du fichier
  const filePath = path.join(ATTACHMENTS_DIR, `${attachmentId}.${extension}`);
  
  // Générer le contenu de la pièce jointe en utilisant l'IA
  const content = await generateAttachmentContent(
    scenarioTitle,
    scenarioDomain,
    attachmentType,
    context,
    currentStage,
    userRole
  );
  
  // Écrire le contenu dans le fichier
  fs.writeFileSync(filePath, content);
  
  // Récupérer la taille du fichier
  const stats = fs.statSync(filePath);
  
  // Créer et retourner les métadonnées de la pièce jointe
  const metadata: AttachmentMetadata = {
    id: attachmentId,
    filename: `${filename}.${extension}`,
    type: attachmentType,
    createdAt: new Date().toISOString(),
    scenarioId,
    size: stats.size,
    url: `/attachments/${attachmentId}.${extension}`
  };
  
  return metadata;
}

/**
 * Générer le contenu de la pièce jointe en utilisant l'IA
 */
async function generateAttachmentContent(
  scenarioTitle: string,
  scenarioDomain: string,
  attachmentType: AttachmentType,
  context: string,
  currentStage: number,
  userRole: string
): Promise<string> {
  // Créer un prompt adapté au type de pièce jointe
  let prompt = '';
  
  // Sélectionner le prompt en fonction du type de pièce jointe
  switch (attachmentType) {
    case AttachmentType.LOG_FILE:
      prompt = createLogFilePrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.INCIDENT_REPORT:
      prompt = createIncidentReportPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.SECURITY_ANALYSIS:
      prompt = createSecurityAnalysisPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.CONFIDENTIAL_MEMO:
      prompt = createConfidentialMemoPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.TECHNICAL_SPECS:
      prompt = createTechnicalSpecsPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.VULNERABILITY_SCAN:
      prompt = createVulnerabilityScanPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.DATA_BREACH_NOTIFICATION:
      prompt = createDataBreachNotificationPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.CUSTOMER_COMMUNICATION:
      prompt = createCustomerCommunicationPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.FORENSIC_EVIDENCE:
      prompt = createForensicEvidencePrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.REGULATORY_FILING:
      prompt = createRegulatoryFilingPrompt(scenarioDomain, context, currentStage);
      break;
    case AttachmentType.SOFTWARE_PATCH:
      prompt = createSoftwarePatchPrompt(scenarioDomain, context, currentStage);
      break;
    default:
      prompt = `Générer un document pertinent pour le scénario "${scenarioTitle}" dans le domaine "${scenarioDomain}".`;
  }
  
  // Créer la requête pour l'API
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "Vous êtes un générateur de documents et pièces jointes techniques pour des scénarios de cybersécurité. Créez des documents réalistes, techniques et pertinents pour le contexte donné. Utilisez des dates, des heures, des adresses IP, des noms de fichiers et d'autres détails spécifiques pour rendre le document crédible. N'incluez pas d'instructions ou de commentaires méta dans le document."
    },
    {
      role: "user",
      content: prompt
    }
  ];
  
  try {
    // Utiliser le service Azure OpenAI
    const response = await openAIService.getChatCompletion(
      messages,
      0.7, // temperature réduite pour générer plus rapidement
      1800  // maxTokens réduits pour accélérer la génération
    );
    return response || "Document non disponible.";
  } catch (error) {
    console.error("Erreur lors de la génération du contenu:", error);
    return "Document temporairement indisponible suite à une erreur technique.";
  }
}

/**
 * Récupérer une pièce jointe par son identifiant
 */
export function getAttachment(attachmentId: string): AttachmentMetadata | null {
  const files = fs.readdirSync(ATTACHMENTS_DIR);
  
  // Chercher le fichier correspondant à l'ID
  const matchingFile = files.find(file => file.startsWith(attachmentId));
  
  if (!matchingFile) {
    return null;
  }
  
  // Extraire l'extension
  const extension = path.extname(matchingFile).slice(1);
  
  // Récupérer les statistiques du fichier
  const filePath = path.join(ATTACHMENTS_DIR, matchingFile);
  const stats = fs.statSync(filePath);
  
  // Créer et retourner les métadonnées
  return {
    id: attachmentId,
    filename: matchingFile,
    type: getTypeFromFilename(matchingFile),
    createdAt: stats.birthtime.toISOString(),
    scenarioId: '', // Information non disponible
    size: stats.size,
    url: `/attachments/${matchingFile}`
  };
}

/**
 * Supprimer une pièce jointe par son identifiant
 */
export function deleteAttachment(attachmentId: string): boolean {
  const files = fs.readdirSync(ATTACHMENTS_DIR);
  
  // Chercher le fichier correspondant à l'ID
  const matchingFile = files.find(file => file.startsWith(attachmentId));
  
  if (!matchingFile) {
    return false;
  }
  
  // Supprimer le fichier
  fs.unlinkSync(path.join(ATTACHMENTS_DIR, matchingFile));
  
  return true;
}

/**
 * Déterminer le type de pièce jointe à partir du nom de fichier
 */
function getTypeFromFilename(filename: string): string {
  if (filename.includes('log')) return AttachmentType.LOG_FILE;
  if (filename.includes('incident_report')) return AttachmentType.INCIDENT_REPORT;
  if (filename.includes('security_analysis')) return AttachmentType.SECURITY_ANALYSIS;
  if (filename.includes('confidential_memo')) return AttachmentType.CONFIDENTIAL_MEMO;
  if (filename.includes('technical_specifications')) return AttachmentType.TECHNICAL_SPECS;
  if (filename.includes('vulnerability_scan')) return AttachmentType.VULNERABILITY_SCAN;
  if (filename.includes('data_breach')) return AttachmentType.DATA_BREACH_NOTIFICATION;
  if (filename.includes('customer_communication')) return AttachmentType.CUSTOMER_COMMUNICATION;
  if (filename.includes('forensic_evidence')) return AttachmentType.FORENSIC_EVIDENCE;
  if (filename.includes('regulatory_filing')) return AttachmentType.REGULATORY_FILING;
  if (filename.includes('security_patch')) return AttachmentType.SOFTWARE_PATCH;
  
  return 'unknown';
}

/**
 * Sélectionner le type de pièce jointe approprié en fonction du contexte du scénario et du rôle de l'utilisateur
 */
export function selectAppropriateAttachmentType(domain: string, stage: number, userRole: string = ''): AttachmentType {
  const role = userRole.toLowerCase();
  
  // Au début d'un scénario, on commence par des documents adaptés au rôle et au domaine
  if (stage <= 1) {
    // Adapté pour le RSSI
    if (role.includes('rssi')) {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.INCIDENT_REPORT;
      } else if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.CONFIDENTIAL_MEMO;
      } else if (domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('données personnelles')) {
        return AttachmentType.REGULATORY_FILING;
      } else {
        return AttachmentType.SECURITY_ANALYSIS;
      }
    }
    // Adapté pour l'Ethical Hacker
    else if (role.includes('hacker') || role.includes('pentester')) {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.SECURITY_ANALYSIS;
      } else {
        return AttachmentType.VULNERABILITY_SCAN;
      }
    }
    // Adapté pour le Développeur
    else if (role.includes('dev') || role.includes('développeur')) {
      return AttachmentType.TECHNICAL_SPECS;
    }
    // Adapté pour l'Admin Système
    else if (role.includes('admin') || role.includes('système')) {
      return AttachmentType.LOG_FILE;
    }
    // Adapté pour le Consultant Cybersécurité
    else if (role.includes('consult')) {
      return AttachmentType.SECURITY_ANALYSIS;
    }
    // Par défaut, basé sur le domaine
    else {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.SECURITY_ANALYSIS;
      } else if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.CONFIDENTIAL_MEMO;
      } else if (domain.toLowerCase().includes('incident')) {
        return AttachmentType.INCIDENT_REPORT;
      } else if (domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('données personnelles')) {
        return AttachmentType.REGULATORY_FILING;
      } else if (domain.toLowerCase().includes('chaîne') || domain.toLowerCase().includes('supply chain')) {
        return AttachmentType.TECHNICAL_SPECS;
      } else {
        return AttachmentType.SECURITY_ANALYSIS;
      }
    }
  }
  
  // Au fur et à mesure que le scénario progresse, les pièces jointes deviennent plus techniques et spécifiques
  else if (stage === 2) {
    // Adapté pour le RSSI
    if (role.includes('rssi')) {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else if (domain.toLowerCase().includes('crise') || domain.toLowerCase().includes('incident')) {
        return AttachmentType.INCIDENT_REPORT;
      } else if (domain.toLowerCase().includes('rgpd')) {
        return AttachmentType.DATA_BREACH_NOTIFICATION;
      } else {
        return AttachmentType.VULNERABILITY_SCAN;
      }
    }
    // Adapté pour l'Ethical Hacker
    else if (role.includes('hacker') || role.includes('pentester')) {
      if (domain.toLowerCase().includes('phishing')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else {
        return AttachmentType.VULNERABILITY_SCAN;
      }
    }
    // Adapté pour le Développeur
    else if (role.includes('dev') || role.includes('développeur')) {
      if (domain.toLowerCase().includes('chaîne') || domain.toLowerCase().includes('supply chain')) {
        return AttachmentType.SOFTWARE_PATCH;
      } else {
        return AttachmentType.LOG_FILE;
      }
    }
    // Adapté pour l'Admin Système
    else if (role.includes('admin') || role.includes('système')) {
      return AttachmentType.LOG_FILE;
    }
    // Adapté pour le Consultant Cybersécurité
    else if (role.includes('consult')) {
      if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else {
        return AttachmentType.SECURITY_ANALYSIS;
      }
    }
    // Par défaut, basé sur le domaine
    else {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.LOG_FILE;
      } else if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else if (domain.toLowerCase().includes('incident')) {
        return AttachmentType.LOG_FILE;
      } else if (domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('données personnelles')) {
        return AttachmentType.DATA_BREACH_NOTIFICATION;
      } else if (domain.toLowerCase().includes('chaîne') || domain.toLowerCase().includes('supply chain')) {
        return AttachmentType.VULNERABILITY_SCAN;
      } else {
        return AttachmentType.VULNERABILITY_SCAN;
      }
    }
  }
  
  // Dans les phases avancées, les pièces jointes reflètent l'urgence et les actions en cours, adaptées au rôle
  else {
    // Adapté pour le RSSI
    if (role.includes('rssi')) {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('crise')) {
        return AttachmentType.CONFIDENTIAL_MEMO;
      } else if (domain.toLowerCase().includes('rgpd')) {
        return AttachmentType.REGULATORY_FILING;
      } else {
        return AttachmentType.INCIDENT_REPORT;
      }
    }
    // Adapté pour l'Ethical Hacker
    else if (role.includes('hacker') || role.includes('pentester')) {
      return AttachmentType.FORENSIC_EVIDENCE;
    }
    // Adapté pour le Développeur
    else if (role.includes('dev') || role.includes('développeur')) {
      return AttachmentType.SOFTWARE_PATCH;
    }
    // Adapté pour l'Admin Système
    else if (role.includes('admin') || role.includes('système')) {
      if (domain.toLowerCase().includes('phishing')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else {
        return AttachmentType.LOG_FILE;
      }
    }
    // Adapté pour le Consultant Cybersécurité
    else if (role.includes('consult')) {
      if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.DATA_BREACH_NOTIFICATION;
      } else if (domain.toLowerCase().includes('rgpd')) {
        return AttachmentType.REGULATORY_FILING;
      } else {
        return AttachmentType.SECURITY_ANALYSIS;
      }
    }
    // Par défaut, basé sur le domaine
    else {
      if (domain.toLowerCase().includes('phishing') || domain.toLowerCase().includes('ingénierie sociale')) {
        return AttachmentType.FORENSIC_EVIDENCE;
      } else if (domain.toLowerCase().includes('crise')) {
        return AttachmentType.DATA_BREACH_NOTIFICATION;
      } else if (domain.toLowerCase().includes('incident')) {
        return AttachmentType.CUSTOMER_COMMUNICATION;
      } else if (domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('données personnelles')) {
        return AttachmentType.CUSTOMER_COMMUNICATION;
      } else if (domain.toLowerCase().includes('chaîne') || domain.toLowerCase().includes('supply chain')) {
        return AttachmentType.SOFTWARE_PATCH;
      } else {
        return AttachmentType.CONFIDENTIAL_MEMO;
      }
    }
  }
}

/**
 * Prompts spécifiques pour chaque type de pièce jointe
 */

function createLogFilePrompt(domain: string, context: string, stage: number): string {
  return `Créez un fichier de logs de serveur réaliste pour un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE: ${context}

EXIGENCES:
1. Format standard: timestamps, IP, codes d'erreur
2. Signes d'intrusion adaptés au domaine "${domain}"
3. Tentatives de connexion suspectes, exécutions de scripts malveillants
4. Environ 15 lignes montrant l'évolution chronologique de l'incident
5. Ajoutez 1-2 CVE ou IoCs pertinents au domaine

FORMAT:
[DATE TIME] [NIVEAU] [SERVICE] Message (IP, chemin, utilisateur, paramètre)`;
}

function createIncidentReportPrompt(domain: string, context: string, stage: number): string {
  return `Générez un rapport d'incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE: ${context}

EXIGENCES:
1. Format professionnel mais concis
2. Chronologie simplifiée
3. Systèmes affectés avec versions principales
4. 2-3 indicateurs techniques (IP, hash, URL)
5. 1-2 références MITRE ATT&CK
6. Mesures de remédiation essentielles

FORMAT:
RAPPORT D'INCIDENT DE CYBERSÉCURITÉ
[ID] - [Date]
Classification: [Gravité]
Préparé par: [Analyste]

RÉSUMÉ:
...

INDICATEURS TECHNIQUES:
...

IMPACT ET ACTIONS:
...`;
}

function createSecurityAnalysisPrompt(domain: string, context: string, stage: number): string {
  return `Créez une analyse de sécurité pour un problème dans le domaine "${domain}".
  
CONTEXTE: ${context}

EXIGENCES:
1. Bref résumé du problème de sécurité
2. 2-3 outils mentionnés (Kali, Wireshark, etc.)
3. 1-2 vulnérabilités avec CVE et score
4. Référence MITRE ATT&CK simple
5. Mesures d'atténuation essentielles

FORMAT:
ANALYSE DE SÉCURITÉ 
Date: [Date]
Référence: SA-[ID]
Classification: CONFIDENTIEL

1. RÉSUMÉ:
...

2. VULNÉRABILITÉS:
...

3. IMPACT ET REMÉDIATION:
...`;
}

function createConfidentialMemoPrompt(domain: string, context: string, stage: number): string {
  return `Rédigez un mémo confidentiel interne concernant un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE: ${context}

EXIGENCES:
1. Mémo court pour la direction (max 200 mots)
2. Résumé clair de la situation
3. Points clés et prochaines étapes
4. Classification de confidentialité
5. Contact

FORMAT:
MÉMORANDUM CONFIDENTIEL
DATE: [Date]
À: Comité Exécutif
DE: [Nom]
OBJET: [Incident]

CLASSIFICATION: CONFIDENTIEL

[Corps du mémo]

CONTACT: [Nom]`;
}

function createTechnicalSpecsPrompt(domain: string, context: string, stage: number): string {
  return `Générez un document de spécifications techniques détaillées lié à un système/composant concerné par un incident dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Créez un document technique décrivant l'architecture, les composants et les interfaces d'un système
2. Incluez des spécifications précises: versions, configurations, dépendances
3. Mentionnez les paramètres de sécurité et les mesures de protection existantes
4. Ajoutez un schéma textuel d'architecture (ASCII art) si pertinent
5. Utilisez une terminologie technique précise et adaptée au domaine
6. Incluez des sections sur les exigences de performances et de disponibilité
7. Mettez en évidence les points pertinents pour l'étape ${stage} du scénario

FORMAT:
SPÉCIFICATIONS TECHNIQUES
Document ID: SPEC-[ID]
Version: 1.0
Date: [Date]

1. INTRODUCTION
...

2. ARCHITECTURE DU SYSTÈME
...

3. COMPOSANTS ET INTERFACES
...

4. PARAMÈTRES DE SÉCURITÉ
...

5. EXIGENCES DE PERFORMANCE
...

6. PROCÉDURES DE MAINTENANCE
...`;
}

function createVulnerabilityScanPrompt(domain: string, context: string, stage: number): string {
  return `Générez un rapport d'analyse de vulnérabilités détaillé pour des systèmes dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Créez un rapport de scan de vulnérabilités technique et détaillé
2. Incluez un résumé des résultats avec statistiques (vulnérabilités critiques, élevées, moyennes, faibles)
3. Présentez les vulnérabilités détectées avec leur scoring CVSS, description et impact
4. Fournissez des références CVE pour chaque vulnérabilité si applicable
5. Ajoutez des recommandations de remediation spécifiques
6. Utilisez un format similaire aux rapports générés par des outils comme Nessus, Qualys ou OpenVAS
7. Adaptez la gravité et l'urgence globales à l'étape ${stage} du scénario

FORMAT:
RAPPORT D'ANALYSE DE VULNÉRABILITÉS
Date du scan: [Date]
Périmètre: [Description des systèmes analysés]

RÉSUMÉ EXÉCUTIF:
...

STATISTIQUES GLOBALES:
- Vulnérabilités critiques: X
- Vulnérabilités élevées: X
- Vulnérabilités moyennes: X
- Vulnérabilités faibles: X

VULNÉRABILITÉS DÉTECTÉES:
[Liste détaillée des vulnérabilités avec scoring, description et recommandations]

PLAN DE REMEDIATION:
...`;
}

function createDataBreachNotificationPrompt(domain: string, context: string, stage: number): string {
  return `Rédigez une notification de violation de données conforme aux exigences réglementaires pour un incident dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Créez une notification officielle de violation de données conforme au RGPD et autres réglementations
2. Incluez la description de l'incident, sa date et sa détection
3. Précisez la nature des données potentiellement compromises
4. Décrivez les mesures prises pour limiter l'impact et éviter que cela ne se reproduise
5. Fournissez les coordonnées du DPO ou service responsable pour plus d'informations
6. Adaptez le ton et le niveau de détail à l'étape ${stage} du scénario
7. Respectez les éléments requis par les réglementations (RGPD art. 33-34)

FORMAT:
NOTIFICATION DE VIOLATION DE DONNÉES
Date: [Date]
Référence: [ID de référence]

Madame, Monsieur,

Conformément à l'article 34 du Règlement Général sur la Protection des Données (RGPD), nous vous informons qu'un incident de sécurité impliquant des données à caractère personnel a été détecté au sein de notre organisation.

[Corps de la notification avec tous les éléments requis]

Nous restons à votre disposition pour toute information complémentaire.

Cordialement,
[Nom]
Délégué à la Protection des Données
[Coordonnées]`;
}

function createCustomerCommunicationPrompt(domain: string, context: string, stage: number): string {
  return `Créez un modèle de communication client pour informer les utilisateurs d'un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Rédigez une communication client claire, transparente mais rassurante
2. Incluez une description de l'incident sans détails techniques excessifs
3. Expliquez l'impact potentiel pour les clients et ce qu'ils doivent faire
4. Décrivez les mesures prises par l'entreprise pour résoudre le problème
5. Fournissez des ressources pour plus d'informations et de l'assistance
6. Adaptez le ton et le contenu à l'étape ${stage} du scénario
7. Évitez le jargon technique tout en restant précis

FORMAT:
COMMUNICATION IMPORTANTE
Date: [Date]

Chers clients,

[Corps de la communication]

Pour toute question, notre équipe reste à votre disposition:
- Par téléphone: [Numéro]
- Par email: [Email]
- Site web dédié: [URL]

Nous vous remercions pour votre confiance et votre compréhension.

L'équipe [Nom de l'entreprise]`;
}

function createForensicEvidencePrompt(domain: string, context: string, stage: number): string {
  return `Créez un rapport d'analyse forensique pour un incident de cybersécurité du domaine "${domain}".
  
CONTEXTE: ${context}

EXIGENCES:
1. Court rapport technique avec 2-3 outils d'investigation
2. 2-3 preuves numériques techniques (logs, capture réseau)
3. 1-2 IoCs significatifs (hash, IP)
4. 1 référence à une technique d'attaque
5. Format professionnel mais concis

FORMAT:
RAPPORT D'ANALYSE FORENSIQUE
Référence: FOR-[ID]
Date: [Date]
Classification: CONFIDENTIEL

1. RÉSUMÉ:
...

2. PREUVES TECHNIQUES:
...

3. CONCLUSIONS:
...`;
}

function createRegulatoryFilingPrompt(domain: string, context: string, stage: number): string {
  return `Rédigez un document de déclaration réglementaire lié à un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Créez un document formel destiné à une autorité de régulation (CNIL, ANSSI, etc.)
2. Incluez les informations requises par le cadre réglementaire applicable
3. Soyez précis sur la nature de l'incident, sa détection, son impact
4. Décrivez les mesures prises pour contenir l'incident et protéger les données
5. Présentez un plan de remédiation et les mesures pour éviter une répétition
6. Adaptez le niveau de formalisme et de détail à l'étape ${stage} du scénario
7. Respectez la structure attendue par les autorités

FORMAT:
DÉCLARATION D'INCIDENT DE CYBERSÉCURITÉ
Référence: [ID]
Date de soumission: [Date]
Organisation déclarante: [Nom]

1. INFORMATIONS GÉNÉRALES
...

2. DESCRIPTION DE L'INCIDENT
...

3. DONNÉES ET SYSTÈMES AFFECTÉS
...

4. MESURES DE PROTECTION ET DE REMÉDIATION
...

5. PLAN D'ACTION
...

6. INFORMATIONS SUPPLÉMENTAIRES
...

CONTACT:
Nom: [Nom]
Fonction: [Fonction]
Email: [Email]
Téléphone: [Téléphone]`;
}

function createSoftwarePatchPrompt(domain: string, context: string, stage: number): string {
  return `Créez des notes de release et une documentation technique pour un correctif de sécurité lié à un incident dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Rédigez des notes de correctif de sécurité techniques et précises
2. Incluez la référence de version, la date de publication
3. Décrivez les vulnérabilités corrigées (sans révéler d'informations sensibles)
4. Fournissez des instructions d'installation/déploiement détaillées
5. Mentionnez les systèmes/versions concernés et les dépendances
6. Ajoutez les précautions à prendre pour le déploiement
7. Adaptez l'urgence et le niveau de détail à l'étape ${stage} du scénario

FORMAT:
CORRECTIF DE SÉCURITÉ
Version: [Version]
Date de publication: [Date]
Priorité: [Critique/Haute/Moyenne/Basse]

RÉSUMÉ:
...

VULNÉRABILITÉS CORRIGÉES:
...

SYSTÈMES CONCERNÉS:
...

INSTRUCTIONS DE DÉPLOIEMENT:
...

VÉRIFICATION DE L'INSTALLATION:
...

PRÉCAUTIONS ET RISQUES:
...

SUPPORT:
...`;
}