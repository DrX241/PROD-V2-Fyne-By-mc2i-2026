import { Request, Response } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { openAIService } from '../services/openai';

// Fonction pour exécuter du code Python
export async function executePythonCode(req: Request, res: Response) {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Le code est requis' });
  }

  try {
    // Générer un ID unique pour le fichier temporaire
    const fileId = crypto.randomBytes(16).toString('hex');
    const tempFilePath = path.join(__dirname, `../temp/code_${fileId}.py`);
    const outputFilePath = path.join(__dirname, `../temp/output_${fileId}.txt`);
    
    // Créer le répertoire temp s'il n'existe pas
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Écrire le code dans un fichier temporaire
    fs.writeFileSync(tempFilePath, code);
    
    // Exécuter le code Python avec timeout (5 secondes max)
    const command = `python3 ${tempFilePath} > ${outputFilePath} 2>&1`;
    
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // Lire le résultat (même en cas d'erreur, pour afficher les erreurs)
      const output = fs.existsSync(outputFilePath) 
        ? fs.readFileSync(outputFilePath, 'utf8') 
        : (error ? error.message : 'Aucune sortie');
      
      // Nettoyer les fichiers temporaires
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      
      if (error && error.killed) {
        return res.status(400).json({ 
          result: 'Exécution interrompue : le délai maximum a été dépassé (5 secondes)',
          error: true
        });
      }
      
      // Analyser le code avec IA
      analyzeCodeWithAI(code, output).then(analysis => {
        return res.json({ 
          result: output,
          analysis,
          error: !!error
        });
      }).catch(err => {
        return res.json({ 
          result: output,
          analysis: "L'analyse IA n'est pas disponible pour le moment.",
          error: !!error
        });
      });
    });
  } catch (error: any) {
    console.error('Erreur d\'exécution Python:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'exécution du code', 
      details: error.message 
    });
  }
}

// Fonction pour exécuter du SQL (simulation)
export async function executeSQLCode(req: Request, res: Response) {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Le code est requis' });
  }

  try {
    // Pour simplifier, nous allons simuler l'exécution SQL pour l'instant
    // Mais nous pourrions intégrer une vraie base de données ici
    let result = '';
    let error = false;
    
    // Quelques règles simples pour simuler une réponse SQL
    if (code.toLowerCase().includes('select')) {
      result = "| id | nom      | valeur  | date       |\n";
      result += "|---:|----------|--------:|------------|\n";
      result += "| 1  | Exemple1 | 425.50  | 2025-01-15 |\n";
      result += "| 2  | Exemple2 | 128.75  | 2025-02-20 |\n";
      result += "| 3  | Exemple3 | 975.00  | 2025-03-05 |\n";
    } else if (code.toLowerCase().includes('insert')) {
      result = "Insertion réussie. 1 ligne affectée.";
    } else if (code.toLowerCase().includes('update')) {
      result = "Mise à jour réussie. 3 lignes affectées.";
    } else if (code.toLowerCase().includes('delete')) {
      result = "Suppression réussie. 2 lignes affectées.";
    } else if (code.toLowerCase().includes('create')) {
      result = "Table/Index créé avec succès.";
    } else {
      result = "Commande exécutée avec succès.";
    }
    
    // Analyse par IA
    const analysis = await analyzeCodeWithAI(code, result, 'sql');
    
    return res.json({ 
      result,
      analysis,
      error
    });
  } catch (error: any) {
    console.error('Erreur d\'exécution SQL:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'exécution du code', 
      details: error.message 
    });
  }
}

// Fonction pour analyser le code avec l'IA
async function analyzeCodeWithAI(code: string, output: string, language: 'python' | 'sql' = 'python'): Promise<string> {
  try {
    // La prompt pour l'analyse par l'IA
    const systemMessage = {
      role: 'system',
      content: 
        `Tu es un assistant expert en ${language === 'python' ? 'programmation Python' : 'SQL'}, spécialisé dans l'analyse et l'amélioration de code.
        Analyse le code fourni et donne des conseils utiles, clairs et concis.
        Mentionne les bonnes pratiques, les optimisations possibles et les erreurs potentielles.
        Utilise une approche éducative et constructive.
        Format de la réponse:
        - Commence par une évaluation globale du code très concise (1 ligne)
        - Liste 2-3 points forts ou domaines à améliorer avec le symbole ✓ ou 💡
        - Si des erreurs sont présentes, explique-les brièvement
        - Garde ta réponse courte et directe, max 6 lignes.`
    };

    const userMessage = {
      role: 'user',
      content: 
        `Voici le code ${language === 'python' ? 'Python' : 'SQL'} à analyser:\n\n${code}\n\nVoici le résultat de l'exécution:\n\n${output}`
    };

    // Appel à l'API Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      0.5, // temperature
      500   // max_tokens
    );

    return response.trim();
  } catch (error) {
    console.error('Erreur d\'analyse IA:', error);
    return "L'analyse IA n'est pas disponible pour le moment.";
  }
}