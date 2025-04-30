/**
 * Routes pour la gestion des pièces jointes
 */
import express, { Request, Response } from 'express';
import { generateAttachment, getAttachment, deleteAttachment, AttachmentType, selectAppropriateAttachmentType } from '../services/attachmentService';

const router = express.Router();

/**
 * Route de test pour la génération rapide d'une pièce jointe
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const attachmentType = req.query.type as string || 'log_file';
    const testContext = "Test de génération d'une pièce jointe pour vérifier le bon fonctionnement du système.";
    
    const attachment = await generateAttachment(
      'test-scenario-id',
      'Scénario de test',
      'Gestion de crise cyber',
      attachmentType as AttachmentType,
      testContext,
      1, // currentStage
      'rssi' // userRole
    );
    
    res.status(201).json({
      message: 'Pièce jointe générée avec succès',
      attachment
    });
  } catch (error) {
    console.error('Erreur lors du test de pièce jointe:', error);
    res.status(500).json({ 
      message: 'Erreur lors du test de pièce jointe', 
      error: (error as Error).message 
    });
  }
});

/**
 * Générer une pièce jointe en fonction du contexte du scénario
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      scenarioId, 
      scenarioTitle, 
      scenarioDomain, 
      attachmentType, 
      context, 
      currentStage = 0,
      userRole = 'expert'
    } = req.body;
    
    if (!scenarioId || !scenarioTitle || !scenarioDomain) {
      return res.status(400).json({ 
        message: 'Paramètres manquants: scenarioId, scenarioTitle, et scenarioDomain sont requis' 
      });
    }
    
    const selectedType = attachmentType || 
      selectAppropriateAttachmentType(scenarioDomain, currentStage);
    
    const attachment = await generateAttachment(
      scenarioId,
      scenarioTitle,
      scenarioDomain,
      selectedType as AttachmentType,
      context || `Scénario de cybersécurité "${scenarioTitle}" dans le domaine "${scenarioDomain}"`,
      currentStage,
      userRole
    );
    
    res.status(201).json(attachment);
  } catch (error) {
    console.error('Erreur lors de la génération de la pièce jointe:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération de la pièce jointe', 
      error: (error as Error).message 
    });
  }
});

/**
 * Récupérer les informations d'une pièce jointe par son ID
 */
router.get('/:attachmentId', (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    const attachment = getAttachment(attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Pièce jointe non trouvée' });
    }
    
    res.json(attachment);
  } catch (error) {
    console.error('Erreur lors de la récupération de la pièce jointe:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la pièce jointe',
      error: (error as Error).message 
    });
  }
});

/**
 * Supprimer une pièce jointe par son ID
 */
router.delete('/:attachmentId', (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    const success = deleteAttachment(attachmentId);
    
    if (!success) {
      return res.status(404).json({ message: 'Pièce jointe non trouvée' });
    }
    
    res.json({ message: 'Pièce jointe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce jointe:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la pièce jointe',
      error: (error as Error).message 
    });
  }
});

/**
 * Liste des types de pièces jointes disponibles
 */
router.get('/types/list', (_req: Request, res: Response) => {
  try {
    const types = Object.values(AttachmentType);
    res.json({ types });
  } catch (error) {
    console.error('Erreur lors de la récupération des types de pièces jointes:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des types de pièces jointes',
      error: (error as Error).message 
    });
  }
});

export default router;