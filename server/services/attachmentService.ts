/**
 * Service pour la gestion des pièces jointes
 * Ce service gère la création, le stockage et la récupération des pièces jointes
 * contenant des mots de passe cachés selon le rôle de l'utilisateur
 */

import { generateAttachmentWithPassword, getHintForRole } from './passwordService';

// Interface pour une pièce jointe
interface Attachment {
  id: string;
  name: string;
  content: string;
  type: string;
  createdAt: Date;
  size: number;
}

// Cache pour stocker les pièces jointes par session
const attachmentsCache = new Map<string, Attachment[]>();

/**
 * Génère une pièce jointe contenant un mot de passe caché adapté au rôle
 */
export function createAttachmentWithHiddenPassword(
  sessionId: string,
  userRole: string,
  domain: string,
  scenarioTitle: string
): Attachment {
  // Générer le contenu de la pièce jointe avec le mot de passe caché
  const content = generateAttachmentWithPassword(userRole, domain, scenarioTitle);
  
  // Déterminer le type de pièce jointe selon le rôle (plus réaliste)
  const attachmentType = getAttachmentTypeForRole(userRole);
  
  // Créer l'objet pièce jointe
  const attachment: Attachment = {
    id: generateId(),
    name: generateAttachmentName(userRole, attachmentType),
    content: content,
    type: attachmentType,
    createdAt: new Date(),
    size: content.length // Taille en caractères
  };
  
  // Stocker la pièce jointe dans le cache
  if (!attachmentsCache.has(sessionId)) {
    attachmentsCache.set(sessionId, []);
  }
  
  const sessionAttachments = attachmentsCache.get(sessionId) || [];
  sessionAttachments.push(attachment);
  attachmentsCache.set(sessionId, sessionAttachments);
  
  return attachment;
}

/**
 * Récupère toutes les pièces jointes pour une session
 */
export function getAttachmentsForSession(sessionId: string): Attachment[] {
  return attachmentsCache.get(sessionId) || [];
}

/**
 * Récupère une pièce jointe spécifique par son ID
 */
export function getAttachmentById(sessionId: string, attachmentId: string): Attachment | undefined {
  const attachments = attachmentsCache.get(sessionId) || [];
  return attachments.find(attachment => attachment.id === attachmentId);
}

/**
 * Génère un identifiant unique pour une pièce jointe
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Détermine le type de pièce jointe approprié selon le rôle
 */
function getAttachmentTypeForRole(role: string): string {
  const roleLower = role?.toLowerCase() || '';
  
  if (!role) return 'document';
  
  if (roleLower.includes('rssi') || roleLower.includes('ciso') || roleLower.includes('consult')) {
    return 'policy';  // Document de politique
  }
  
  if (roleLower.includes('hack') || roleLower.includes('pentester') || roleLower.includes('test')) {
    return 'report';  // Rapport de test
  }
  
  if (roleLower.includes('dev') || roleLower.includes('code') || roleLower.includes('program')) {
    return 'code';  // Fragment de code
  }
  
  if (roleLower.includes('admin') || roleLower.includes('system') || roleLower.includes('infra')) {
    return 'config';  // Fichier de configuration
  }
  
  return 'document';  // Type par défaut
}

/**
 * Génère un nom réaliste pour la pièce jointe selon le rôle et le type
 */
function generateAttachmentName(role: string, type: string): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
  switch (type) {
    case 'policy':
      return `politique-securite-${dateStr}.txt`;
    case 'report':
      return `rapport-vulnerabilites-${dateStr}.txt`;
    case 'code':
      return `revue-code-securite-${dateStr}.txt`;
    case 'config':
      return `configuration-serveur-${dateStr}.txt`;
    default:
      return `document-confidentiel-${dateStr}.txt`;
  }
}

/**
 * Génère un document HTML contenant des instructions pour trouver le mot de passe
 */
export function generateInstructionsHtml(userRole: string, domain: string): string {
  const hint = getHintForRole(userRole, domain);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Instructions pour accéder au projet</h2>
      
      <p style="color: #555; line-height: 1.5;">
        Pour des raisons de sécurité, nous avons mis en place un système de vérification préliminaire.
        Avant d'accéder au contenu complet du projet, vous devez démontrer votre expertise initiale.
      </p>
      
      <div style="background-color: #f7f7f7; padding: 15px; border-left: 4px solid #2c3e50; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Votre mission :</h3>
        <p>${hint}</p>
        <p style="font-weight: bold;">Examinez attentivement la pièce jointe et trouvez le mot de passe.</p>
      </div>
      
      <p style="color: #555; line-height: 1.5;">
        Une fois le mot de passe trouvé, veuillez le communiquer dans votre réponse.
        Si le mot de passe est correct, vous recevrez les informations complètes sur votre rôle et vos responsabilités dans ce projet.
      </p>
    </div>
  `;
}