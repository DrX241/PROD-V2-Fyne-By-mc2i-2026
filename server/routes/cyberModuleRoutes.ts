import express from "express";
import {
  getAllCyberModules,
  getCyberModuleById,
  getUserCyberModuleProgress,
  updateUserCyberModuleProgress,
  getAIPersonalizedFeedback,
  generateTrainingScenario,
  answerModuleQuestion
} from "../controllers/cyberModuleController";

const router = express.Router();

// Routes pour les modules de cybersécurité
router.get("/modules", getAllCyberModules);
router.get("/modules/:moduleId", getCyberModuleById);
router.get("/modules/:moduleId/users/:userId/progress", getUserCyberModuleProgress);
router.post("/modules/:moduleId/users/:userId/progress", updateUserCyberModuleProgress);
router.post("/modules/:moduleId/users/:userId/ai-feedback", getAIPersonalizedFeedback);
router.post("/modules/:moduleId/generate-scenario", generateTrainingScenario);
router.post("/modules/:moduleId/answer-question", answerModuleQuestion);

export default router;