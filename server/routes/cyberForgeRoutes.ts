import express from 'express';
import { generateLearningContent, evaluateUserResponse } from '../cyberForgeController';

const router = express.Router();

// Route pour générer du contenu d'apprentissage
router.post('/generate-learning-content', generateLearningContent);

// Route pour évaluer la réponse d'un utilisateur
router.post('/evaluate-response', evaluateUserResponse);

export default router;