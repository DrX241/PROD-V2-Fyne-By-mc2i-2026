/**
 * Routes pour la gestion des pièces jointes et la validation des mots de passe
 */

import { Router, Request, Response } from 'express';
import { createAttachmentWithHiddenPassword, getAttachmentById, getAttachmentsForSession, generateInstructionsHtml } from '../services/attachmentService';
import { validatePassword, generatePostValidationInfo } from '../services/passwordService';

const router = Router();

/**
 * Route pour générer une pièce jointe avec un mot de passe caché
 */
router.post('/generate', (req: Request, res: Response) => {
  try {
    const { sessionId, userRole, domain, scenarioTitle } = req.body;
    
    if (!sessionId || !userRole || !domain || !scenarioTitle) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const attachment = createAttachmentWithHiddenPassword(sessionId, userRole, domain, scenarioTitle);
    
    res.json({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      createdAt: attachment.createdAt
    });
  } catch (error) {
    console.error('Erreur lors de la génération de la pièce jointe:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la pièce jointe' });
  }
});

/**
 * Route pour récupérer les pièces jointes d'une session
 */
router.get('/list/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'ID de session requis' });
    }
    
    const attachments = getAttachmentsForSession(sessionId);
    
    res.json(attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      createdAt: attachment.createdAt
    })));
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces jointes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des pièces jointes' });
  }
});

/**
 * Route pour télécharger une pièce jointe spécifique
 */
router.get('/download/:sessionId/:attachmentId', (req: Request, res: Response) => {
  try {
    const { sessionId, attachmentId } = req.params;
    
    if (!sessionId || !attachmentId) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const attachment = getAttachmentById(sessionId, attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Pièce jointe non trouvée' });
    }
    
    // Renvoyer le contenu comme un fichier texte
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.name}"`);
    res.send(attachment.content);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la pièce jointe:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de la pièce jointe' });
  }
});

/**
 * Route pour valider un mot de passe
 */
router.post('/validate-password', (req: Request, res: Response) => {
  try {
    const { password, userRole, domain, userName, companyName } = req.body;
    
    if (!password || !userRole || !domain) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const isValid = validatePassword(password, userRole, domain);
    
    if (isValid) {
      // Générer les informations post-validation
      const postValidationInfo = generatePostValidationInfo(userName, userRole, domain, companyName);
      
      res.json({
        valid: true,
        message: 'Félicitations ! Vous avez trouvé le bon mot de passe.',
        postValidationInfo
      });
    } else {
      res.json({
        valid: false,
        message: 'Le mot de passe est incorrect. Veuillez réessayer.'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la validation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors de la validation du mot de passe' });
  }
});

/**
 * Route pour générer des instructions HTML
 */
router.get('/instructions/:userRole/:domain', (req: Request, res: Response) => {
  try {
    const { userRole, domain } = req.params;
    
    if (!userRole || !domain) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }
    
    const instructionsHtml = generateInstructionsHtml(userRole, domain);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(instructionsHtml);
  } catch (error) {
    console.error('Erreur lors de la génération des instructions:', error);
    res.status(500).json({ message: 'Erreur lors de la génération des instructions' });
  }
});

export default router;