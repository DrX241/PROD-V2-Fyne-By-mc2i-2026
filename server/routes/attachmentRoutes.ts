/**
 * Routes pour la gestion des pièces jointes
 */
import { Router, Request, Response } from 'express';
import { 
  generateAttachment, 
  getAttachment, 
  deleteAttachment,
  AttachmentType,
  selectAppropriateAttachmentType
} from '../services/attachmentService';

const router = Router();

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
      userRole = ''
    } = req.body;
    
    // Validation des données requises
    if (!scenarioId || !scenarioTitle || !scenarioDomain) {
      return res.status(400).json({ error: 'Informations sur le scénario manquantes' });
    }
    
    // Si aucun type de pièce jointe n'est spécifié, sélectionner automatiquement
    const selectedAttachmentType = attachmentType || 
      selectAppropriateAttachmentType(scenarioDomain, currentStage);
    
    // Générer la pièce jointe
    const attachment = await generateAttachment(
      scenarioId,
      scenarioTitle,
      scenarioDomain,
      selectedAttachmentType,
      context || `Scénario ${scenarioTitle} dans le domaine ${scenarioDomain}`,
      currentStage,
      userRole
    );
    
    // Retourner les métadonnées de la pièce jointe
    res.json(attachment);
  } catch (error) {
    console.error('Erreur lors de la génération de la pièce jointe:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la pièce jointe' });
  }
});

/**
 * Récupérer les informations d'une pièce jointe par son ID
 */
router.get('/:attachmentId', (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    // Récupérer les métadonnées de la pièce jointe
    const attachment = getAttachment(attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }
    
    // Retourner les métadonnées
    res.json(attachment);
  } catch (error) {
    console.error('Erreur lors de la récupération de la pièce jointe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la pièce jointe' });
  }
});

/**
 * Supprimer une pièce jointe par son ID
 */
router.delete('/:attachmentId', (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    // Supprimer la pièce jointe
    const deleted = deleteAttachment(attachmentId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }
    
    // Confirmer la suppression
    res.json({ success: true, message: 'Pièce jointe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce jointe:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la pièce jointe' });
  }
});

/**
 * Liste des types de pièces jointes disponibles
 */
router.get('/types/list', (_req: Request, res: Response) => {
  // Convertir l'enum en tableau d'objets avec label et value
  const attachmentTypes = Object.entries(AttachmentType).map(([key, value]) => ({
    label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    value
  }));
  
  res.json(attachmentTypes);
});

export default router;