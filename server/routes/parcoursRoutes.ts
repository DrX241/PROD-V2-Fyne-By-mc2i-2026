import { Router } from 'express';
import { genererParcours } from '../controllers/parcoursController';

const router = Router();

// Route pour générer un parcours personnalisé
router.post('/generer-parcours', genererParcours);

export default router;