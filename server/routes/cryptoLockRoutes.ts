import express from 'express';
import {
  startCryptoLockGame,
  initCryptoLockGame,
  sendMessage,
  makeChoice,
  getGameState,
  startNextTurn
} from '../cryptoLockController';

const router = express.Router();

// Route pour initialiser une nouvelle partie
router.post('/init', initCryptoLockGame);

// Route pour démarrer une partie existante
router.post('/:id/start', startCryptoLockGame);

// Route pour envoyer un message
router.post('/:id/message', sendMessage);

// Route pour faire un choix
router.post('/:id/choice', makeChoice);

// Route pour lancer le tour suivant
router.post('/:id/next-turn', startNextTurn);

// Route pour récupérer l'état du jeu
router.get('/:id', getGameState);

export default router;