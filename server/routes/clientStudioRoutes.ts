import { Router, Request, Response } from 'express';
import { requireClientAuth } from './clientAuthRoutes';
import { storage } from '../storage';

const router = Router();

function requireMakerOrAdmin(req: Request, res: Response, next: any) {
  const cu = (req.session as any).clientUser;
  if (!cu || (cu.role !== 'admin' && cu.role !== 'maker')) {
    return res.status(403).json({ success: false, message: 'Réservé aux profils admin ou maker' });
  }
  next();
}

// GET /api/client/studio/trainings — liste les formations de l'entreprise
router.get('/trainings', requireClientAuth, async (req: Request, res: Response) => {
  const cu = (req.session as any).clientUser;
  try {
    const trainings = await storage.listGeneratedTrainings(100, cu.companyId);
    res.json(trainings);
  } catch (err) {
    console.error('[ClientStudio] list trainings:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/client/studio/training/:id — récupère une formation de l'entreprise
router.get('/training/:id', requireClientAuth, async (req: Request, res: Response) => {
  const cu = (req.session as any).clientUser;
  try {
    const training = await storage.getGeneratedTraining(req.params.id, cu.companyId);
    if (!training) return res.status(404).json({ error: 'Formation introuvable' });
    res.json(training);
  } catch (err) {
    console.error('[ClientStudio] get training:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/client/studio/training/:id — supprime (admin/maker uniquement)
router.delete('/training/:id', requireClientAuth, requireMakerOrAdmin, async (req: Request, res: Response) => {
  const cu = (req.session as any).clientUser;
  try {
    await storage.deleteGeneratedTraining(req.params.id, cu.companyId);
    res.json({ success: true });
  } catch (err) {
    console.error('[ClientStudio] delete training:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;
