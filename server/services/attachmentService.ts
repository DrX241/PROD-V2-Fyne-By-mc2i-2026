/**
 * Service pour générer, stocker et gérer des pièces jointes pour les emails
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ChatCompletionRequestMessage } from 'openai';
import { openAIService } from '../routes';

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
  
  // Obtenir le contenu généré par l'IA
  return await openAIService.getChatCompletionWithCache(messages, 0.8, 2500);
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
 * Prompts spécifiques pour chaque type de pièce jointe
 */

function createLogFilePrompt(domain: string, context: string, stage: number): string {
  return `Créez un fichier de logs de serveur réaliste pour un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Utilisez le format standard des logs avec horodatage, niveau de log, service et message
2. Incluez des signes d'intrusion/attaque appropriés au domaine "${domain}"
3. Montrez une progression chronologique de l'incident
4. Incluez des adresses IP, des noms d'utilisateurs, des chemins de fichiers
5. Ajoutez des erreurs, des alertes et des avertissements pertinents
6. Le fichier doit contenir au moins 20 lignes de logs
7. Utilisez des termes techniques précis et réalistes
8. Adaptez la gravité des logs à l'étape ${stage} du scénario

FORMAT:
[DATE TIME] [LEVEL] [SERVICE] Message détaillé avec informations techniques`;
}

function createIncidentReportPrompt(domain: string, context: string, stage: number): string {
  return `Générez un rapport d'incident de cybersécurité complet et détaillé dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Utilisez un format professionnel de rapport d'incident avec des sections clairement définies
2. Incluez l'historique chronologique de l'incident, les systèmes affectés, l'évaluation d'impact
3. Décrivez les actions entreprises et les recommandations
4. Utilisez des données techniques réalistes (adresses IP, noms de systèmes, horodatages)
5. Adaptez le niveau de détail et le ton à l'étape ${stage} du scénario
6. Ajoutez une classification de la gravité
7. Mentionnez les équipes impliquées dans la réponse

FORMAT:
RAPPORT D'INCIDENT DE CYBERSÉCURITÉ
[ID d'incident] - [Date]

RÉSUMÉ EXÉCUTIF:
...

DÉTAILS DE L'INCIDENT:
...

IMPACT ET ÉVALUATION:
...

ACTIONS ENTREPRISES:
...

RECOMMANDATIONS:
...`;
}

function createSecurityAnalysisPrompt(domain: string, context: string, stage: number): string {
  return `Créez une analyse de sécurité détaillée et technique pour un problème dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Présentez une analyse approfondie et technique du problème de sécurité
2. Incluez des sections sur la méthodologie, les vulnérabilités découvertes, l'analyse des causes
3. Fournissez une évaluation des risques avec scoring (ex: CVSS)
4. Proposez des mesures d'atténuation concrètes et techniques
5. Utilisez un langage d'expert en sécurité informatique
6. Incluez des références à des frameworks de sécurité (NIST, ISO 27001, OWASP, etc.)
7. Adaptez le niveau d'urgence et la gravité à l'étape ${stage} du scénario

FORMAT:
ANALYSE DE SÉCURITÉ 
Date: [Date]
Version: 1.0
Classification: CONFIDENTIEL

RÉSUMÉ EXÉCUTIF:
...

MÉTHODOLOGIE:
...

VULNÉRABILITÉS DÉCOUVERTES:
...

ANALYSE DES CAUSES:
...

RECOMMANDATIONS:
...`;
}

function createConfidentialMemoPrompt(domain: string, context: string, stage: number): string {
  return `Rédigez un mémo confidentiel interne concernant un incident de cybersécurité dans le domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Créez un mémo interne destiné à la direction générale/comité exécutif
2. Le ton doit être professionnel mais refléter l'urgence appropriée à l'étape ${stage}
3. Incluez un résumé clair de la situation, des impacts actuels et potentiels
4. Mentionnez les implications business, réglementaires et sur la réputation
5. Présentez les options et les prochaines étapes recommandées
6. Ajoutez un niveau de classification (ex: Confidentiel - Usage interne uniquement)
7. Incluez des détails de contact pour plus d'informations

FORMAT:
MÉMORANDUM CONFIDENTIEL
DATE: [Date]
À: Comité Exécutif
DE: [Nom], [Titre]
OBJET: Incident de cybersécurité - [Description courte]

CLASSIFICATION: CONFIDENTIEL - DIFFUSION RESTREINTE

[Corps du mémo avec paragraphes structurés]

CONTACT POUR SUIVI:
[Nom]
[Titre]
[Coordonnées]`;
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
  return `Créez un rapport d'analyse forensique détaillant les preuves techniques collectées dans un incident de cybersécurité du domaine "${domain}".
  
CONTEXTE:
${context}

EXIGENCES:
1. Rédigez un rapport d'analyse forensique technique et détaillé
2. Incluez la méthodologie d'investigation, les outils utilisés
3. Présentez les preuves collectées (logs, artifacts, timestamps, IOCs)
4. Établissez une chronologie détaillée de l'incident
5. Incluez l'analyse de l'origine de l'attaque, les vecteurs et techniques utilisés
6. Identifiez des indicateurs de compromission spécifiques
7. Adaptez le niveau de détail technique à l'étape ${stage} du scénario

FORMAT:
RAPPORT D'ANALYSE FORENSIQUE
Référence: FOR-[ID]
Date: [Date]
Classification: CONFIDENTIEL - INVESTIGATION EN COURS

RÉSUMÉ EXÉCUTIF:
...

MÉTHODOLOGIE & OUTILS:
...

ÉLÉMENTS DE PREUVE:
...

CHRONOLOGIE DE L'INCIDENT:
...

INDICATEURS DE COMPROMISSION:
...

CONCLUSIONS & RECOMMANDATIONS:
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

/**
 * Sélectionner le type de pièce jointe approprié en fonction du contexte du scénario
 */
export function selectAppropriateAttachmentType(domain: string, stage: number): AttachmentType {
  // Sélection basée sur le domaine et le stade du scénario
  if (domain.toLowerCase().includes('incident') || domain.toLowerCase().includes('crise')) {
    if (stage === 0) return AttachmentType.SECURITY_ANALYSIS;
    if (stage === 1) return AttachmentType.INCIDENT_REPORT;
    if (stage === 2) return AttachmentType.LOG_FILE;
    return AttachmentType.FORENSIC_EVIDENCE;
  }
  
  if (domain.toLowerCase().includes('vuln') || domain.toLowerCase().includes('pen') || domain.toLowerCase().includes('test')) {
    if (stage <= 1) return AttachmentType.VULNERABILITY_SCAN;
    return AttachmentType.TECHNICAL_SPECS;
  }
  
  if (domain.toLowerCase().includes('conformité') || domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('légal')) {
    if (stage <= 1) return AttachmentType.CONFIDENTIAL_MEMO;
    return AttachmentType.REGULATORY_FILING;
  }
  
  if (domain.toLowerCase().includes('développement') || domain.toLowerCase().includes('code') || domain.toLowerCase().includes('application')) {
    return AttachmentType.SOFTWARE_PATCH;
  }
  
  // Par défaut, choix basé sur le stade
  switch (stage) {
    case 0:
      return AttachmentType.SECURITY_ANALYSIS;
    case 1:
      return AttachmentType.LOG_FILE;
    case 2:
      return AttachmentType.INCIDENT_REPORT;
    default:
      return AttachmentType.DATA_BREACH_NOTIFICATION;
  }
}