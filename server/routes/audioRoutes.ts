import express from 'express';
import { azureSpeechService } from '../services/azureSpeech';

const router = express.Router();

// Route pour convertir le texte en audio MP3
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voiceName, language, style } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Le texte est requis' });
    }
    
    if (!azureSpeechService) {
      return res.status(503).json({ error: 'Service audio non configuré' });
    }
    // Appel au service Azure Speech
    const { audioStream, contentLength } = await azureSpeechService.textToSpeechStream({
      text,
      voiceName,
      language,
      style
    });
    
    // Configurer les en-têtes pour le streaming audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    
    // Streaming de l'audio au client
    audioStream.pipe(res);
    
  } catch (error) {
    console.error('Erreur lors de la synthèse vocale:', error);
    res.status(500).json({ error: 'Erreur lors de la synthèse vocale' });
  }
});

// Route pour obtenir les voix disponibles
router.get('/voices', async (_req, res) => {
  try {
    const voices = await azureSpeechService.getAvailableVoices();
    
    // Filtrer et formater les résultats
    const formattedVoices = voices.map(voice => ({
      name: voice.name,
      language: voice.locale,
      gender: voice.gender,
      local: voice.localName,
      styles: voice.styleList || []
    }));
    
    res.json({ voices: formattedVoices });
  } catch (error) {
    console.error('Erreur lors de la récupération des voix:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des voix' });
  }
});

export default router;