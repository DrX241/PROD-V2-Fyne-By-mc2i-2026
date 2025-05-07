import { Router } from 'express';
// Importation explicite des contrôleurs des outils cyber
import { policyConverterController, phishingSimulatorController } from '../cyberToolsController';

const router = Router();

// Route pour le convertisseur de politiques de sécurité
router.post('/policy-converter', policyConverterController);

// Route pour le simulateur de phishing
router.post('/phishing-simulator', phishingSimulatorController);

export default router;