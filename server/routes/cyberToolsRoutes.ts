import { Router } from 'express';
import { policyConverterController } from '../cyberToolsController';

const router = Router();

// Route pour le convertisseur de politiques de sécurité
router.post('/policy-converter', policyConverterController);

export default router;