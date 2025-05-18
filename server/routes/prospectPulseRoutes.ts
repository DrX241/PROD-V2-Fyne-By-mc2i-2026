import express from 'express';
import { generateClientMessage, evaluateSession } from '../prospectPulseController';

const router = express.Router();

// Routes pour le module ProspectPulse
router.post('/generate-message', generateClientMessage);
router.post('/evaluate-session', evaluateSession);

export default router;