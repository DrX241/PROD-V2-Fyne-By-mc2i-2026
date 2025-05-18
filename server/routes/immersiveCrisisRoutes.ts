import express from 'express';
import { openAIService } from '../services/openai';
import { handleCrisisTeamResponse } from '../fixes/openai-fix';

const router = express.Router();

/**
 * Route pour générer une réponse contextuelle pour un membre de l'équipe de crise
 */
router.post('/generate-response', handleCrisisTeamResponse);

/**
 * Route pour simuler une conversation entre membres de l'équipe
 */
router.post('/team-interaction', async (req, res) => {
  try {
    const { 
      decision, 
      supportingRole, 
      opposingRole,
      scenario 
    } = req.body;
    
    if (!decision || !supportingRole || !opposingRole) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    const prompt = `Simule une conversation tendue entre deux membres d'une équipe de crise cybersécurité.
    
    Le premier membre (${supportingRole}) soutient la décision suivante: "${decision}".
    Le second membre (${opposingRole}) s'oppose à cette décision.
    
    ${scenario ? `Le contexte de la crise est: ${scenario}.` : ''}
    
    Génère une courte conversation réaliste (1-2 échanges) qui montre la tension et le désaccord professionnel entre ces deux rôles.
    Format attendu: Un dialogue court et réaliste avec des répliques alternées.
    
    Ne mentionne jamais explicitement que c'est une simulation ou un jeu.`;
    
    // Utiliser le service OpenAI pour générer la conversation
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: prompt }
      ],
      0.8, // temperature légèrement plus élevée pour la créativité
      1000, // maxTokens
      { useSecondaryKey: true } // Utiliser le modèle secondaire plus rapide
    );
    
    res.json({ conversation: response });
  } catch (error) {
    console.error('Erreur lors de la génération de conversation d\'équipe:', error);
    
    // Conversation de fallback en cas d'erreur
    res.json({ 
      conversation: "Les membres de l'équipe sont en désaccord sur la marche à suivre. Les tensions sont palpables."
    });
  }
});

/**
 * Route pour générer une nouvelle alerte ou notification
 */
router.post('/crisis-update', async (req, res) => {
  try {
    const { 
      currentStage,
      pastDecisions,
      scenario,
      elapsedTime
    } = req.body;
    
    if (!currentStage || !scenario) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    const prompt = `Génère une nouvelle alerte pour une simulation de crise cybersécurité.
    
    Scénario: ${scenario}
    Stade de la crise: ${currentStage}/3
    Temps écoulé: ${elapsedTime || 'non spécifié'} minutes
    
    Réponds en JSON avec: title (court), source (émetteur), content (détaillé), level (critique/haute/moyenne/basse).
    
    L'alerte doit faire avancer la crise de manière crédible et introduire un nouvel élément de tension.`;
    
    // Utiliser le service OpenAI pour générer l'alerte
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: prompt }
      ],
      0.7,
      800, 
      { 
        useSecondaryKey: true,
        responseFormat: 'json_object' // Demander un objet JSON pour simplifier le parsing
      }
    );
    
    // Tenter de parser la réponse comme JSON
    try {
      // Rechercher un fragment JSON dans la réponse
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const alertData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (alertData && alertData.title && alertData.content) {
        res.json(alertData);
      } else {
        // Fallback si le format n'est pas correct
        res.json({
          title: "Nouvelle alerte détectée",
          source: "Système de monitoring",
          content: response,
          level: "moyenne"
        });
      }
    } catch (error) {
      // En cas d'erreur de parsing, renvoyer la réponse brute
      res.json({
        title: "Mise à jour situation",
        source: "Centre de crise",
        content: response,
        level: "moyenne"
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération de mise à jour de crise:', error);
    
    res.json({
      title: "Mise à jour de la situation",
      source: "Centre de crise",
      content: "De nouveaux éléments suggèrent une évolution de la situation. L'équipe technique demande des ressources supplémentaires pour l'analyse.",
      level: "moyenne"
    });
  }
});

export default router;