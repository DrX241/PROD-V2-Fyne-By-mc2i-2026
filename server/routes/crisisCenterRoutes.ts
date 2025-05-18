import express from 'express';
import { 
  getScenarios, 
  getScenarioById, 
  evaluateDecision, 
  simulateTeamMemberResponse, 
  generateCrisisEvent 
} from '../controllers/crisisCenterController';

const router = express.Router();

// Routes pour le Centre de Crise
router.get('/scenarios', getScenarios);
router.get('/scenarios/:id', getScenarioById);
router.post('/evaluate-decision', evaluateDecision);
router.post('/simulate-response', simulateTeamMemberResponse);
router.post('/generate-event', generateCrisisEvent);

export default router;