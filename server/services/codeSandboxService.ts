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
        // Pour le code utilisant des modules ES6 ou React, créer une prévisualisation interactive
        let output = '';
        
        if (usesReact) {
          // Extraire le composant React principal
          // Créer un HTML de démonstration qui inclut les dépendances React et rend le composant
          const reactComponent = code;
          const demoHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Aperçu React</title>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              #root { padding: 10px; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            
            <script type="text/babel">
              ${reactComponent}
              
              // Tenter de rendre le composant
              try {
                // Essayer de déterminer le nom du composant principal
                const componentNames = Object.keys(window).filter(key => 
                  typeof window[key] === 'function' && 
                  /^[A-Z]/.test(key) && 
                  key !== 'React' && 
                  key !== 'ReactDOM'
                );
                
                let MainComponent;
                
                if (componentNames.length > 0) {
                  // Utiliser le premier composant trouvé avec majuscule
                  MainComponent = window[componentNames[0]];
                } else {
                  // Chercher les exports par défaut ou nommés
                  const exportDefaultMatch = /${reactComponent}/.match(/export\s+default\s+(\w+)/);
                  if (exportDefaultMatch && exportDefaultMatch[1]) {
                    MainComponent = window[exportDefaultMatch[1]];
                  }
                }
                
                // Si on a trouvé un composant, le rendre
                if (MainComponent) {
                  ReactDOM.render(<MainComponent />, document.getElementById('root'));
                } else {
                  // Sinon afficher un message d'erreur
                  document.getElementById('root').innerHTML = 
                    '<div style="color: #d00">Impossible de trouver le composant principal à rendre.</div>';
                }
              } catch (e) {
                // Afficher l'erreur
                document.getElementById('root').innerHTML = 
                  '<div style="color: #d00">Erreur de rendu: ' + e.message + '</div>';
              }
            </script>
          </body>
          </html>
          `;
          
          output = `
            <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
              <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
                Prévisualisation React (rendu direct):
              </div>
              <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white; height: 300px; overflow: auto;">
                <iframe 
                  sandbox="allow-scripts" 
                  style="width: 100%; height: 100%; border: none;"
                  srcdoc="${demoHTML.replace(/"/g, '&quot;')}"
                ></iframe>
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Note: Certains composants React avancés peuvent ne pas s'afficher correctement dans cet environnement limité.
              </div>
            </div>
          `;
        } else {
          // Pour les modules ES6 non-React, afficher une prévisualisation basique
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
      // Créer un aperçu interactif HTML avec un iframe sandbox sécurisé
      const previewOutput = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
            Prévisualisation HTML (rendu direct):
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white; height: 300px; overflow: auto;">
            <iframe 
              sandbox="allow-scripts" 
              style="width: 100%; height: 100%; border: none;"
              srcdoc="${code.replace(/"/g, '&quot;')}"
            ></iframe>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Note: Ce rendu est exécuté dans un environnement sécurisé (sandbox). Certaines fonctionnalités peuvent être limitées.
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
      // Créer un aperçu interactif CSS avec un exemple d'application
      // Générer un HTML de démonstration qui utilise le CSS fourni
      const demoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${code}
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Titre de la page</h1>
            <nav>
              <ul>
                <li><a href="#">Accueil</a></li>
                <li><a href="#">À propos</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </nav>
          </header>
          
          <main>
            <section class="hero">
              <h2>Section principale</h2>
              <p>Ceci est un texte d'exemple pour visualiser le rendu CSS</p>
              <button class="btn">Bouton d'action</button>
            </section>
            
            <section class="features">
              <div class="card">Carte 1</div>
              <div class="card">Carte 2</div>
              <div class="card">Carte 3</div>
            </section>
          </main>
          
          <footer>
            <p>Pied de page © 2025</p>
          </footer>
        </div>
      </body>
      </html>
      `;
      
      const previewOutput = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #555;">
            Prévisualisation CSS (rendu direct):
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 10px; background-color: white; height: 300px; overflow: auto;">
            <iframe 
              sandbox="allow-scripts" 
              style="width: 100%; height: 100%; border: none;"
              srcdoc="${demoHTML.replace(/"/g, '&quot;')}"
            ></iframe>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Note: Ce rendu utilise une structure HTML de démonstration pour visualiser le CSS appliqué.
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