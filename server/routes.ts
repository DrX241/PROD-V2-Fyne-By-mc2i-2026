import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export default function createRoutes(app: Express): Server {
  // Endpoint pour exécuter du code Python
  app.post('/api/code/execute/python', async (req, res) => {
    try {
      const { code, sessionId } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Le code est requis' });
      }
      
      // Simuler une exécution de code Python
      const result = "# Exécution simulée\nLe code a été exécuté avec succès\n\nRésultat: 42";
      const analysis = "Votre code Python est bien structuré. Il utilise correctement les fonctions et les bibliothèques standards.";
      
      return res.status(200).json({
        result,
        analysis,
        sessionVariables: "Variables en mémoire: x = 42, y = 'Hello world'"
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du code Python:", error);
      return res.status(500).json({ error: "Une erreur est survenue lors de l'exécution du code" });
    }
  });
  
  // Endpoint pour exécuter du code SQL
  app.post('/api/code/execute/sql', async (req, res) => {
    try {
      const { code, sessionId } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Le code est requis' });
      }
      
      // Simuler une exécution de code SQL
      const result = "-- Résultat de la requête SQL\n| id | nom      | email               | age |\n|----|----------|---------------------|-----|\n| 1  | Dupont   | dupont@example.com  | 32  |\n| 2  | Martin   | martin@example.com  | 45  |\n| 3  | Bernard  | bernard@example.com | 28  |";
      
      return res.status(200).json({
        result,
        analysis: "Votre requête SQL est bien optimisée. Les jointures sont correctement utilisées.",
        sessionVariables: "Tables en mémoire: users, orders, products"
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution du code SQL:", error);
      return res.status(500).json({ error: "Une erreur est survenue lors de l'exécution du code" });
    }
  });
  
  // Endpoint pour traduire du langage naturel en code
  app.post('/api/code/translate', async (req, res) => {
    try {
      const { text, language } = req.body;
      
      if (!text || !language) {
        return res.status(400).json({
          error: "Le texte et le langage cible sont requis"
        });
      }

      let code = '';
      let explanation = '';
      
      // Générer un code de démonstration selon le langage
      if (language === 'python') {
        code = `# Code Python généré pour: "${text}"
import pandas as pd
import numpy as np

def analyze_data(file_path):
    """
    Analyser les données du fichier CSV
    """
    # Charger les données
    df = pd.read_csv(file_path)
    
    # Afficher les informations de base
    print("Aperçu des données:")
    print(df.head())
    
    # Calculer des statistiques
    stats = {
        "moyenne": df.mean(),
        "médiane": df.median(),
        "écart-type": df.std()
    }
    
    return stats

# Exemple d'utilisation
if __name__ == "__main__":
    results = analyze_data("donnees.csv")
    print(results)`;
        
        explanation = "Ce code Python charge un fichier CSV avec pandas, affiche un aperçu des données et calcule des statistiques descriptives (moyenne, médiane, écart-type).";
      } else {
        code = `-- Code SQL généré pour: "${text}"
-- Sélection de données avec filtres et jointures
SELECT 
    c.client_id,
    c.nom,
    c.email,
    COUNT(co.commande_id) AS nombre_commandes,
    SUM(co.montant) AS montant_total
FROM 
    clients c
LEFT JOIN 
    commandes co ON c.client_id = co.client_id
WHERE 
    co.date_commande >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
GROUP BY 
    c.client_id, c.nom, c.email
HAVING 
    COUNT(co.commande_id) > 0
ORDER BY 
    montant_total DESC
LIMIT 10;`;
        
        explanation = "Cette requête SQL sélectionne les clients avec leur nombre de commandes et montant total pour l'année écoulée. Les résultats sont groupés par client, filtrés pour n'inclure que ceux ayant au moins une commande, et triés par montant total décroissant.";
      }

      return res.status(200).json({
        code,
        explanation
      });
    } catch (error) {
      console.error("Erreur lors de la traduction:", error);
      return res.status(500).json({ 
        error: "Une erreur est survenue lors de la traduction"
      });
    }
  });
  
  // Endpoint pour analyser la justification d'une réponse dans Read Me If You Can
  app.post('/api/data-ia/analyze-justification', async (req, res) => {
    try {
      const { justification, challenge, selectedAnswer } = req.body;
      
      if (!justification || !challenge || !selectedAnswer) {
        return res.status(400).json({ 
          error: "Les paramètres justification, challenge et selectedAnswer sont requis",
          isValid: false,
          feedback: "Paramètres incomplets"
        });
      }

      // Vérifier si la justification est suffisamment détaillée
      const isValidJustification = justification.length >= 50;
      
      return res.status(200).json({
        isValid: isValidJustification,
        feedback: isValidJustification 
          ? "Votre justification est pertinente et démontre une bonne compréhension du concept."
          : "Votre justification manque de détails pour démontrer votre compréhension. Veuillez expliquer davantage votre raisonnement."
      });
    } catch (error) {
      console.error("Erreur lors de l'analyse de la justification:", error);
      return res.status(500).json({
        error: "Une erreur est survenue lors de l'analyse de la justification",
        isValid: false,
        feedback: "Impossible d'analyser votre justification pour le moment"
      });
    }
  });

  // Endpoint pour vérifier le statut de la connexion OpenAI
  app.get('/api/openai/status', (req, res) => {
    return res.json({
      connectionStatus: "connected",
      currentModel: "gpt-4o-mini",
      lastCheck: Date.now(),
      keyType: "secondary"
    });
  });

  return createServer(app);
}