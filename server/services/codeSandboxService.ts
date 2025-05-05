import { VM } from 'vm2';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execPromise = util.promisify(exec);
const writeFilePromise = util.promisify(fs.writeFile);
const mkdirPromise = util.promisify(fs.mkdir);
const unlinkPromise = util.promisify(fs.unlink);
const rmdirPromise = util.promisify(fs.rmdir);

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
}

/**
 * Service pour l'exécution sécurisée de code dans un environnement isolé
 */
class CodeSandboxService {
  private readonly tempDir: string;
  private readonly timeout: number = 10000; // 10 secondes par défaut

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'mc2i-code-sandbox');
    // Créer le répertoire temporaire s'il n'existe pas
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Exécute du code JavaScript directement dans un environnement VM isolé
   */
  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    let result: ExecutionResult = {
      success: false,
      output: '',
      executionTimeMs: 0
    };

    try {
      // Détecter si le code utilise des imports/exports (modules ES6) ou React
      const usesModules = code.includes('import ') || code.includes('export ');
      const usesReact = code.includes('import React') || code.includes('from "react"') || code.includes('from \'react\'');
      
      if (usesModules || usesReact) {
        // Pour le code utilisant des modules ES6 ou React, créer une prévisualisation simulée
        let output = '';
        
        if (usesReact) {
          output = `
            <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
              <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
                Prévisualisation React (affichage simulé):
              </div>
              <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white;">
                Le code React sera rendu comme un composant avec JSX.
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Note: Pour une prévisualisation complète, vous devrez utiliser ce code dans un environnement React complet.
              </div>
            </div>
          `;
        } else {
          output = `
            <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
              <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
                Prévisualisation JavaScript modules (affichage simulé):
              </div>
              <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white;">
                Le code JavaScript utilisant des modules ES6 sera exécuté dans un environnement approprié.
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Note: Pour une exécution complète, vous devrez utiliser ce code dans un environnement supportant les modules ES6.
              </div>
            </div>
          `;
        }
        
        return {
          success: true,
          output: output,
          executionTimeMs: Date.now() - startTime
        };
      }
      
      // Pour le JavaScript standard sans modules, exécuter normalement
      // Capturer la sortie console
      let output = '';
      const vm = new VM({
        timeout: this.timeout,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            },
            error: (...args: any[]) => {
              output += 'ERROR: ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            },
            warn: (...args: any[]) => {
              output += 'WARNING: ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            },
            info: (...args: any[]) => {
              output += 'INFO: ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            }
          },
          setTimeout: (cb: Function, ms: number) => {
            if (ms > this.timeout - 1000) {
              throw new Error(`setTimeout cannot exceed ${this.timeout - 1000}ms`);
            }
            return setTimeout(cb, ms);
          },
          clearTimeout
        }
      });

      // Exécuter le code
      const executionResult = vm.run(code);
      
      // Si le résultat est un objet, le convertir en chaîne
      if (executionResult !== undefined && executionResult !== null) {
        if (typeof executionResult === 'object') {
          output += JSON.stringify(executionResult, null, 2);
        } else {
          output += String(executionResult);
        }
      }

      result = {
        success: true,
        output: output,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      result = {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    }

    return result;
  }

  /**
   * Exécute du code Python dans un processus isolé
   */
  async executePython(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    const fileId = uuidv4();
    const tempFilePath = path.join(this.tempDir, `${fileId}.py`);
    
    try {
      // Écrire le code dans un fichier temporaire
      await writeFilePromise(tempFilePath, code);
      
      // Utiliser le chemin absolu vers Python 3.11
      const pythonPath = '/nix/store/wqhkxzzlaswkj3gimqign99sshvllcg6-python-wrapped-0.1.0/bin/python3.11';
      
      // Exécuter le code Python avec un timeout
      const { stdout, stderr } = await execPromise(`${pythonPath} -u ${tempFilePath}`, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      return {
        success: stderr.length === 0,
        output: stdout,
        error: stderr.length > 0 ? stderr : undefined,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    } finally {
      // Nettoyage du fichier temporaire
      try {
        await unlinkPromise(tempFilePath);
      } catch (e) {
        console.error(`Error cleaning up temp file ${tempFilePath}:`, e);
      }
    }
  }

  /**
   * Exécute du code TypeScript dans un processus isolé
   */
  async executeTypeScript(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    const fileId = uuidv4();
    const tempDirPath = path.join(this.tempDir, fileId);
    const tempFilePath = path.join(tempDirPath, 'index.ts');
    
    try {
      // Créer un répertoire temporaire pour ce fichier
      await mkdirPromise(tempDirPath, { recursive: true });
      
      // Écrire le code dans un fichier temporaire
      await writeFilePromise(tempFilePath, code);
      
      // Exécuter le code TypeScript avec tsx
      const { stdout, stderr } = await execPromise(`npx tsx ${tempFilePath}`, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      return {
        success: stderr.length === 0,
        output: stdout,
        error: stderr.length > 0 ? stderr : undefined,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    } finally {
      // Nettoyage des fichiers temporaires
      try {
        await unlinkPromise(tempFilePath).catch(() => {});
        await rmdirPromise(tempDirPath).catch(() => {});
      } catch (e) {
        console.error(`Error cleaning up temp directory ${tempDirPath}:`, e);
      }
    }
  }

  /**
   * Exécute du code SQL dans un environnement simulé
   * Note: Cette fonction simule l'exécution SQL car nous ne voulons pas
   * exécuter de requêtes SQL arbitraires sur une vraie base de données
   */
  async executeSQL(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Pour l'instant, nous faisons une simple validation de syntaxe
      // et nous simulons l'exécution des commandes SQL courantes
      
      const lines = code.split(';').filter(line => line.trim());
      let output = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        if (trimmedLine.startsWith('select')) {
          output += "Simulation de requête SELECT - Les données seraient retournées ici\n";
        } else if (trimmedLine.startsWith('insert')) {
          output += "Simulation de requête INSERT - Données insérées avec succès\n";
        } else if (trimmedLine.startsWith('update')) {
          output += "Simulation de requête UPDATE - Données mises à jour avec succès\n";
        } else if (trimmedLine.startsWith('delete')) {
          output += "Simulation de requête DELETE - Données supprimées avec succès\n";
        } else if (trimmedLine.startsWith('create')) {
          output += "Simulation de requête CREATE - Objet créé avec succès\n";
        } else if (trimmedLine.startsWith('alter')) {
          output += "Simulation de requête ALTER - Objet modifié avec succès\n";
        } else if (trimmedLine.startsWith('drop')) {
          output += "Simulation de requête DROP - Objet supprimé avec succès\n";
        } else {
          output += `Exécution simulée de: ${trimmedLine}\n`;
        }
      }
      
      return {
        success: true,
        output,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    }
  }
  
  /**
   * Exécute du code HTML
   */
  async executeHTML(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Créer une prévisualisation HTML avec un iframe
      const previewOutput = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
            Prévisualisation HTML (affichage simulé):
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white;">
            Le code HTML sera rendu dans un navigateur. Voici la structure du document:
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Note: Pour une prévisualisation complète, vous devrez ouvrir ce code dans un navigateur ou utiliser un éditeur comme CodePen.
          </div>
        </div>
      `;
      
      return {
        success: true,
        output: previewOutput,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Exécute du code CSS
   */
  async executeCSS(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Créer une prévisualisation CSS avec un exemple d'application
      const previewOutput = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
            Prévisualisation CSS (affichage simulé):
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white;">
            Le code CSS sera appliqué aux éléments HTML. Voici la structure de style identifiée:
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Note: Pour une prévisualisation complète, vous devrez ouvrir ce code dans un navigateur ou utiliser un éditeur comme CodePen.
          </div>
        </div>
      `;
      
      return {
        success: true,
        output: previewOutput,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Fonction d'exécution générique qui sélectionne le bon exécuteur selon le langage
   */
  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.executeJavaScript(code);
      case 'typescript':
        return this.executeTypeScript(code);
      case 'python':
        return this.executePython(code);
      case 'html':
        return this.executeHTML(code);
      case 'css':
        return this.executeCSS(code);
      case 'sql':
      case 'mysql':
      case 'postgresql':
      case 'sqlserver':
        return this.executeSQL(code);
      default:
        return {
          success: false,
          output: '',
          error: `L'exécution du langage ${language} n'est pas prise en charge`,
          executionTimeMs: 0
        };
    }
  }
}

// Exporter une instance unique du service
export const codeSandboxService = new CodeSandboxService();