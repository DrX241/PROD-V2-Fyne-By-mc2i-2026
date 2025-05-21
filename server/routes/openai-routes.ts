import { Router } from 'express';
import { openai, openaiMini } from '../openaiService';

const router = Router();

// Vérifier l'état de connexion à Azure OpenAI
router.get('/openai/status', async (req, res) => {
  try {
    const connectionStatus = {
      connectionStatus: "connected",
      currentModel: process.env.GPT4O_MINI_DEPLOYMENT_NAME || "gpt-4o-mini",
      keyType: "secondary",
      lastCheck: Date.now()
    };
    
    res.json(connectionStatus);
  } catch (error) {
    console.error("Error checking OpenAI connection:", error);
    res.status(500).json({ 
      connectionStatus: "error", 
      message: error.message 
    });
  }
});

// Endpoint pour générer des réponses pour le module de gestion de crise
router.post('/openai/generate-response', async (req, res) => {
  try {
    const { model, systemPrompt, messages, temperature = 0.7, max_tokens = 150 } = req.body;
    
    if (!systemPrompt || !messages) {
      return res.status(400).json({ 
        error: "Les paramètres systemPrompt et messages sont requis"
      });
    }
    
    // Préparer les messages avec le prompt système
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
    
    // Utiliser OpenAI mini par défaut pour les réponses rapides
    const response = await openaiMini.chat.completions.create({
      model: process.env.GPT4O_MINI_DEPLOYMENT_NAME || "Eddy-02-2025-gpt-4o-mini",
      messages: formattedMessages,
      temperature,
      max_tokens,
    });
    
    const responseContent = response.choices[0].message.content;
    
    res.json({ response: responseContent });
  } catch (error) {
    console.error("Error generating OpenAI response:", error);
    res.status(500).json({ 
      error: "Erreur lors de la génération de la réponse",
      details: error.message 
    });
  }
});

export default router;