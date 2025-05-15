import { Request, Response } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openAIService } from '../services/openai';

// Obtenir l'équivalent de __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour exécuter du code Python avec stockage de variables de session
export async function executePythonCode(req: Request, res: Response) {
  const { code, sessionId = 'default' } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Le code est requis' });
  }

  // Initialiser la session si elle n'existe pas
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      python: {},
      sql: { tempTables: [] }
    };
  }

  try {
    // Générer un ID unique pour le fichier temporaire
    const fileId = crypto.randomBytes(16).toString('hex');
    const tempFilePath = path.join(__dirname, `../temp/code_${fileId}.py`);
    const outputFilePath = path.join(__dirname, `../temp/output_${fileId}.txt`);
    const sessionFilePath = path.join(__dirname, `../temp/session_${sessionId}.json`);
    
    // Créer le répertoire temp s'il n'existe pas
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Écrire le fichier de session pour que Python puisse y accéder
    fs.writeFileSync(sessionFilePath, JSON.stringify(sessions[sessionId].python));

    // Préparer le code Python avec le chargement et la sauvegarde de la session
    const sessionCode = `
import json
import os
import sys

# Charger les données de session précédentes
session_file = '${sessionFilePath.replace(/\\/g, '\\\\')}'
session_data = {}
if os.path.exists(session_file):
    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)
            # Ajouter les variables de session à l'espace global
            for key, value in session_data.items():
                globals()[key] = value
    except:
        print("Erreur lors du chargement des données de session.")

# Rediriger stdout pour capturer les sorties du code
class Capture:
    def __init__(self):
        self.stdout = sys.stdout
        self.data = []
    
    def write(self, text):
        self.data.append(text)
        self.stdout.write(text)
    
    def flush(self):
        self.stdout.flush()
    
    def get_output(self):
        return "".join(self.data)

# Utiliser notre captureur
capture = Capture()
sys.stdout = capture

# Exécuter le code utilisateur
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Erreur: {str(e)}")

# Rétablir stdout
sys.stdout = sys.__stdout__

# Sauvegarder les variables de session (sauf les fonctions, modules, etc.)
try:
    session_vars = {}
    for key, value in globals().items():
        if not key.startswith('__') and key not in ['json', 'os', 'sys', 'session_file', 'session_data', 'Capture', 'capture', 'session_vars', 'key', 'value']:
            try:
                # Tester si la variable est sérialisable
                json.dumps({key: value})
                session_vars[key] = value
            except:
                # Si non sérialisable (comme les objets complexes), on les ignore
                continue
    
    with open(session_file, 'w') as f:
        json.dump(session_vars, f)
except Exception as e:
    print(f"Erreur lors de la sauvegarde de session: {str(e)}")
`;

    // Écrire le code dans un fichier temporaire
    fs.writeFileSync(tempFilePath, sessionCode);
    
    // Exécuter le code Python avec timeout (10 secondes max)
    const command = `python3 ${tempFilePath} > ${outputFilePath} 2>&1`;
    
    exec(command, { timeout: 10000 }, async (error, stdout, stderr) => {
      // Lire le résultat (même en cas d'erreur, pour afficher les erreurs)
      const output = fs.existsSync(outputFilePath) 
        ? fs.readFileSync(outputFilePath, 'utf8') 
        : (error ? error.message : 'Aucune sortie');
      
      // Mise à jour des variables de session
      if (fs.existsSync(sessionFilePath)) {
        try {
          const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
          sessions[sessionId].python = sessionData;
        } catch (sessionError) {
          console.error('Erreur lors de la lecture des données de session:', sessionError);
        }
      }
      
      // Nettoyer les fichiers temporaires
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      // Ne pas supprimer le fichier de session pour le garder entre les exécutions
      
      if (error && error.killed) {
        return res.status(400).json({ 
          result: 'Exécution interrompue : le délai maximum a été dépassé (10 secondes)',
          error: true
        });
      }
      
      // Analyser le code avec IA
      try {
        const analysis = await analyzeCodeWithAI(code, output);
        
        return res.json({ 
          result: output,
          analysis,
          error: !!error,
          sessionVariables: Object.keys(sessions[sessionId].python).length > 0 
            ? `Variables sauvegardées: ${Object.keys(sessions[sessionId].python).join(', ')}` 
            : null
        });
      } catch (analysisError) {
        return res.json({ 
          result: output,
          analysis: "L'analyse IA n'est pas disponible pour le moment.",
          error: !!error,
          sessionVariables: Object.keys(sessions[sessionId].python).length > 0 
            ? `Variables sauvegardées: ${Object.keys(sessions[sessionId].python).join(', ')}` 
            : null
        });
      }
    });
  } catch (error: any) {
    console.error('Erreur d\'exécution Python:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'exécution du code', 
      details: error.message 
    });
  }
}

// Importer le pool PostgreSQL
import { pool } from '../db';

// Objets pour stocker temporairement les données des sessions
interface SessionData {
  python: {
    [variableName: string]: any;
  };
  sql: {
    tempTables: string[];
  };
}

// Stockage des données de session (en mémoire)
const sessions: { [sessionId: string]: SessionData } = {};

// Fonction pour supprimer toutes les variables d'une session spécifique
export async function resetSessionVariables(req: Request, res: Response) {
  const { sessionId, language } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID de session requis' 
    });
  }
  
  try {
    // Si la session n'existe pas, rien à faire
    if (!sessions[sessionId]) {
      return res.status(200).json({ 
        success: true, 
        message: 'Aucune session à réinitialiser' 
      });
    }
    
    if (language === 'python' || !language) {
      // Réinitialiser les variables Python
      sessions[sessionId].python = {};
      
      // Supprimer le fichier de session s'il existe
      const sessionFilePath = path.join(__dirname, `../temp/session_${sessionId}.json`);
      if (fs.existsSync(sessionFilePath)) {
        fs.unlinkSync(sessionFilePath);
      }
    }
    
    if (language === 'sql' || !language) {
      const client = await pool.connect();
      
      try {
        // Supprimer les tables temporaires créées par cette session
        const tempTables = sessions[sessionId].sql.tempTables;
        const schemaName = `session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Supprimer chaque table temporaire
        for (const tableName of tempTables) {
          try {
            await client.query(`DROP TABLE IF EXISTS ${schemaName}.${tableName} CASCADE`);
          } catch (error) {
            console.error(`Erreur lors de la suppression de la table ${tableName}:`, error);
          }
        }
        
        // Réinitialiser la liste des tables
        sessions[sessionId].sql.tempTables = [];
        
      } catch (error) {
        console.error('Erreur lors de la réinitialisation des tables SQL:', error);
      } finally {
        client.release();
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Variables de session ${language || 'toutes'} réinitialisées avec succès`
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la réinitialisation de la session:', error);
    return res.status(500).json({
      success: false,
      error: `Erreur lors de la réinitialisation: ${error.message}`
    });
  }
}

// Fonction pour exécuter du SQL (réel)
export async function executeSQLCode(req: Request, res: Response) {
  const { code, sessionId = 'default' } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Le code est requis' });
  }

  // Initialiser la session si elle n'existe pas
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      python: {},
      sql: { tempTables: [] }
    };
  }

  const client = await pool.connect();
  
  try {
    // Créer un schéma temporaire spécifique à la session si nécessaire
    const schemaName = `session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // Exécution de la requête SQL
    const sqlQuery = code.trim();
    let result = '';
    let rowCount = 0;
    
    // Détecter si c'est une requête SELECT pour formater correctement le résultat
    const isSelect = sqlQuery.toLowerCase().trim().startsWith('select');
    
    // Détecter si c'est une requête CREATE TABLE pour suivre les tables temporaires
    const isCreateTable = sqlQuery.toLowerCase().includes('create table');
    if (isCreateTable) {
      // Extraire le nom de la table créée (analyse simplifiée)
      const tableNameMatch = sqlQuery.toLowerCase().match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_]+)/i);
      if (tableNameMatch && tableNameMatch[1]) {
        const tableName = tableNameMatch[1];
        sessions[sessionId].sql.tempTables.push(tableName);
      }
    }
    
    // Exécuter la requête
    const queryResult = await client.query(sqlQuery);
    rowCount = queryResult.rowCount || 0;
    
    if (isSelect && queryResult.rows && queryResult.rows.length > 0) {
      // Formater le résultat en tableau pour les requêtes SELECT
      const columns = Object.keys(queryResult.rows[0]);
      
      // En-tête du tableau
      result += "| " + columns.join(" | ") + " |\n";
      result += "|" + columns.map(() => "---").join("|") + "|\n";
      
      // Données
      queryResult.rows.forEach(row => {
        result += "| " + columns.map(col => row[col] !== null ? String(row[col]) : "NULL").join(" | ") + " |\n";
      });
    } else {
      // Message pour les autres types de requêtes
      if (rowCount > 0) {
        result = `Opération réussie. ${rowCount} ligne(s) affectée(s).`;
      } else {
        result = "Commande exécutée avec succès.";
      }
    }
    
    // Analyse par IA
    const analysis = await analyzeCodeWithAI(code, result, 'sql');
    
    return res.json({ 
      result,
      analysis,
      error: false
    });
  } catch (error: any) {
    console.error('Erreur d\'exécution SQL:', error);
    
    // Analyse de l'erreur par IA
    const analysis = await analyzeCodeWithAI(code, `Erreur: ${error.message}`, 'sql');
    
    return res.status(200).json({ 
      result: `Erreur SQL: ${error.message}`,
      analysis,
      error: true
    });
  } finally {
    client.release();
  }
}

// Fonction pour analyser le code avec l'IA
async function analyzeCodeWithAI(code: string, output: string, language: 'python' | 'sql' = 'python'): Promise<string> {
  try {
    // La prompt pour l'analyse par l'IA
    // Définir le message système pour l'analyse du code
    const systemMessage = {
      role: 'system' as 'system', // Type explicite pour éviter les erreurs
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
      role: 'user' as 'user', // Type explicite pour éviter les erreurs
      content: 
        `Voici le code ${language === 'python' ? 'Python' : 'SQL'} à analyser:\n\n${code}\n\nVoici le résultat de l'exécution:\n\n${output}`
    };

    // Appel à l'API Azure OpenAI
    const messages = [systemMessage, userMessage];
    const response = await openAIService.getChatCompletion(
      messages,
      true, // useSecondaryKey
      0.5,  // temperature
      500   // max_tokens
    );

    return response.trim();
  } catch (error) {
    console.error('Erreur d\'analyse IA:', error);
    return "L'analyse IA n'est pas disponible pour le moment.";
  }
}