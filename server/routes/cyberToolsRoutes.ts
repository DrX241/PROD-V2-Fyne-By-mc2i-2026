import { Router } from 'express';
// Importation relative explicite des contrôleurs des outils cyber (avec chemin complet)
import { policyConverterController, phishingSimulatorController } from '../../server/cyberToolsController';

const router = Router();

// Route pour le convertisseur de politiques de sécurité
router.post('/policy-converter', policyConverterController);

// Route pour le simulateur de phishing
router.post('/phishing-simulator', phishingSimulatorController);

export default router;