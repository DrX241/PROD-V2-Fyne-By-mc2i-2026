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
   * Exécute du code SQL dans un environnement simulé avec approche pédagogique
   * Note: Cette fonction ne peut pas exécuter de requêtes SQL réelles
   */
  async executeSQL(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Formater le code SQL
      const formattedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Analyser la requête SQL pour déterminer son type
      const queryType = this.identifySQLQueryType(code);
      
      // Générer une explication pédagogique
      let output = `
      <div style="font-family: sans-serif; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #333;">Requête SQL - Type: ${queryType}</h3>
          <div style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
            <pre style="margin: 0; font-family: monospace; white-space: pre-wrap;">${formattedCode}</pre>
          </div>
        </div>
      `;
      
      // Générer un exemple de résultat adapté au type de requête
      if (queryType === 'SELECT') {
        // Exemple de résultat pour une requête SELECT
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">id</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">nom</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">valeur</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">date_creation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">1</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Exemple 1</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">42.50</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">2025-05-01 14:30:00</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">2</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Exemple 2</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">78.20</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">2025-05-02 09:15:00</td>
              </tr>
              <tr>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">3</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Exemple 3</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">105.75</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">2025-05-03 16:45:00</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 10px; color: #666; font-style: italic;">3 lignes retournées</div>
        </div>
        `;
      } else if (queryType === 'INSERT') {
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <div style="padding: 12px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 10px;">
            1 ligne insérée avec succès.
          </div>
          <div style="margin-top: 15px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
            <strong>ID généré:</strong> 4<br>
            <strong>Opération:</strong> INSERT
          </div>
        </div>
        `;
      } else if (queryType === 'UPDATE') {
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <div style="padding: 12px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 10px;">
            2 lignes mises à jour avec succès.
          </div>
          <div style="margin-top: 15px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
            <strong>Lignes affectées:</strong> 2<br>
            <strong>Opération:</strong> UPDATE
          </div>
        </div>
        `;
      } else if (queryType === 'DELETE') {
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <div style="padding: 12px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 10px;">
            1 ligne supprimée avec succès.
          </div>
          <div style="margin-top: 15px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
            <strong>Lignes affectées:</strong> 1<br>
            <strong>Opération:</strong> DELETE
          </div>
        </div>
        `;
      } else if (queryType === 'CREATE') {
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <div style="padding: 12px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 10px;">
            Objet créé avec succès.
          </div>
          <div style="margin-top: 15px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
            <strong>Opération:</strong> CREATE<br>
            <strong>Objet créé:</strong> Table ou autre objet SQL
          </div>
        </div>
        `;
      } else {
        output += `
        <div style="margin-top: 20px;">
          <h4 style="margin-top: 0; color: #333;">Résultat (simulé):</h4>
          <div style="padding: 12px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-top: 10px;">
            Requête exécutée avec succès.
          </div>
        </div>
        `;
      }
      
      // Ajouter une explication éducative
      output += `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #ddd;">
          <h4 style="margin-top: 0; color: #333;">Explication:</h4>
          <p>Cette exécution est simulée pour des raisons pédagogiques. Dans un environnement de production, cette requête interagirait avec une base de données réelle.</p>
          <p>Les requêtes SQL de type ${queryType} sont généralement utilisées pour ${this.getSQLTypeExplanation(queryType)}</p>
        </div>
      </div>
      `;
      
      return {
        success: true,
        output,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
  
  /**
   * Identifie le type de requête SQL
   */
  private identifySQLQueryType(query: string): string {
    const normalizedQuery = query.trim().toUpperCase();
    
    if (normalizedQuery.startsWith('SELECT')) return 'SELECT';
    if (normalizedQuery.startsWith('INSERT')) return 'INSERT';
    if (normalizedQuery.startsWith('UPDATE')) return 'UPDATE';
    if (normalizedQuery.startsWith('DELETE')) return 'DELETE';
    if (normalizedQuery.startsWith('CREATE')) return 'CREATE';
    if (normalizedQuery.startsWith('ALTER')) return 'ALTER';
    if (normalizedQuery.startsWith('DROP')) return 'DROP';
    if (normalizedQuery.startsWith('TRUNCATE')) return 'TRUNCATE';
    
    return 'OTHER';
  }

  /**
   * Fournit une explication pédagogique pour chaque type de requête SQL
   */
  private getSQLTypeExplanation(sqlType: string): string {
    switch (sqlType) {
      case 'SELECT':
        return "extraire et récupérer des données d'une ou plusieurs tables. Les requêtes SELECT peuvent inclure des filtres (WHERE), des tris (ORDER BY), des regroupements (GROUP BY) et des jointures entre tables.";
      case 'INSERT':
        return "ajouter de nouvelles lignes de données dans une table. Vous pouvez spécifier les valeurs directement ou les insérer à partir d'une autre requête SELECT.";
      case 'UPDATE':
        return "modifier des données existantes dans une table. Il est courant d'utiliser une clause WHERE pour spécifier quelles lignes doivent être mises à jour.";
      case 'DELETE':
        return "supprimer des lignes de données d'une table. Comme pour UPDATE, une clause WHERE est généralement utilisée pour cibler des lignes spécifiques.";
      case 'CREATE':
        return "créer de nouveaux objets dans la base de données, comme des tables, des vues, des procédures stockées ou des index.";
      case 'ALTER':
        return "modifier la structure d'objets existants, comme ajouter ou supprimer des colonnes d'une table.";
      case 'DROP':
        return "supprimer des objets de la base de données, comme des tables ou des vues.";
      case 'TRUNCATE':
        return "vider rapidement toutes les données d'une table tout en conservant sa structure.";
      default:
        return "effectuer diverses opérations spécifiques dans la base de données.";
    }
  }
  
  /**
   * Exécute du code HTML
   */
  async executeHTML(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Version simplifiée: retourner le code HTML formaté
      const htmlEscaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const previewOutput = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #333;">
            Prévisualisation HTML:
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 15px; background-color: white; margin-bottom: 15px;">
            <pre style="margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow: auto; font-family: monospace; font-size: 12px;">${htmlEscaped}</pre>
          </div>
          <div style="margin-top: 15px; background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #333;">Pour visualiser le rendu HTML:</div>
            <div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              <ol style="margin-left: 20px; padding-left: 0;">
                <li style="margin-bottom: 5px;">Copiez le code HTML ci-dessus</li>
                <li style="margin-bottom: 5px;">Créez un fichier avec l'extension .html</li>
                <li style="margin-bottom: 5px;">Collez le code et ouvrez le fichier dans votre navigateur</li>
              </ol>
              <div style="color: #0066cc; font-weight: bold; margin-top: 10px;">
                Astuce: Utilisez notre fonctionnalité d'amélioration de code pour obtenir une version plus complète.
              </div>
            </div>
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
      // Version simplifiée: retourner le code CSS formaté
      const cssEscaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Exemple de HTML basique pour l'application de ce CSS
      const demoHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${cssEscaped}
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
          <div style="margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #333;">
            Prévisualisation CSS:
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 15px; background-color: white; margin-bottom: 15px;">
            <pre style="margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow: auto; font-family: monospace; font-size: 12px;">${cssEscaped}</pre>
          </div>
          <div style="margin-top: 15px; background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #333;">Exemple d'application avec ce CSS:</div>
            <div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              <p style="margin-bottom: 10px;">Voici un exemple de HTML sur lequel ce CSS peut être appliqué:</p>
              <pre style="margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow: auto; font-family: monospace; font-size: 12px; max-height: 150px;">${demoHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              <div style="color: #0066cc; font-weight: bold; margin-top: 10px;">
                Astuce: Copiez ces deux codes dans un fichier HTML pour voir le rendu complet dans votre navigateur.
              </div>
            </div>
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
   * Fonction pour vérifier si le code contient des éléments potentiellement dangereux
   */
  private isCodePotentiallyDangerous(code: string, language: string): boolean {
    // Définir des patterns potentiellement dangereux par langage
    const dangerousPatterns: {[key: string]: RegExp[]} = {
      javascript: [
        /eval\s*\(/, // eval()
        /Function\s*\(/, // new Function()
        /require\s*\(\s*['"](?!\.\/|\.\.\/|@)/, // require() non relatif
        /process\.env/, // accès aux variables d'environnement
        /(?<!console\.)log\s*\(/, // log() qui n'est pas console.log()
        /(?:document|window|global)\./, // accès aux objets globaux
        /fetch\s*\(/, // requêtes réseau
        /XMLHttpRequest/, // requêtes XHR
        /localStorage/, // accès au stockage local
        /sessionStorage/, // accès au stockage de session
        /indexedDB/, // accès à indexedDB
        /WebSocket/, // WebSockets
        /Worker/, // Web Workers
        /navigator/, // accès à l'objet navigator
        /__dirname/, // accès au répertoire courant
        /__filename/, // accès au fichier courant
        /fs\s*\./, // module fs
        /http\s*\./, // module http
        /net\s*\./, // module net
        /child_process/, // exécution de processus
        /crypto/, // cryptographie
        /path\.resolve/, // résolution de chemins
        /module\.exports/, // exports de module
        /import\s+(?!React|{|"|')/ // imports non standards
      ],
      python: [
        /(?:import|from)\s+(?:os|sys|subprocess|shutil|glob|pathlib|tempfile|pty|tty|fcntl|termios|resource|pwd|grp)/, // modules système
        /(?:import|from)\s+(?:socket|ssl|email|smtplib|poplib|imaplib|nntplib|telnetlib|xmlrpc|http|urllib|ftplib)/, // modules réseau
        /(?:import|from)\s+(?:sqlite3|pymysql|psycopg2|sqlalchemy)/, // modules BDD
        /(?:import|from)\s+(?:cryptography|hashlib|hmac|secrets)/, // modules crypto
        /os\s*\.\s*(?:system|popen|exec|spawn|fork|walk|path|environ|getenv|putenv|mkdir|makedirs|remove|rmdir|rename|replace)/, // opérations système
        /subprocess\s*\.\s*(?:run|call|check_output|Popen)/, // exécution de processus
        /open\s*\(/, // ouverture de fichier
        /with\s+open/, // ouverture de fichier avec with
        /eval\s*\(/, // eval()
        /exec\s*\(/, // exec()
        /(?:__import__|globals|locals|compile)/, // fonctions dangereuses
        /importlib/, // importation dynamique
        /os\.environ/, // variables d'environnement
        /sys\.(?:argv|path|exit|stdin|stdout|stderr)/, // accès à sys
        /(?:getattr|setattr|delattr|hasattr|vars)/, // manipulation d'attributs
        /requests\s*\./ // requêtes HTTP
      ],
      sql: [
        /(?:DROP|TRUNCATE|ALTER)\s+(?:TABLE|DATABASE|SCHEMA)/, // DROP/TRUNCATE/ALTER TABLE
        /DELETE\s+FROM/, // DELETE FROM sans WHERE
        /INSERT\s+INTO/, // INSERT INTO
        /UPDATE\s+\w+\s+SET/, // UPDATE
        /CREATE\s+(?:TABLE|DATABASE|VIEW|PROCEDURE|FUNCTION|TRIGGER)/, // CREATE
        /GRANT\s+/, // GRANT
        /REVOKE\s+/, // REVOKE
        /EXECUTE\s+/, // EXECUTE
        /xp_cmdshell/, // xp_cmdshell
        /sp_execute_sql/, // sp_execute_sql
        /OPENROWSET/, // OPENROWSET
        /BULK\s+INSERT/, // BULK INSERT
        /DBCC/, // DBCC
        /BACKUP/, // BACKUP
        /RESTORE/ // RESTORE
      ]
    };

    // Pour HTML et CSS, considérer comme sûr par défaut
    if (language.toLowerCase() === 'html' || language.toLowerCase() === 'css') {
      return false;
    }

    // Vérifier les patterns dangereux pour le langage spécifié
    const patternsToCheck = dangerousPatterns[language.toLowerCase()] || [];
    return patternsToCheck.some(pattern => pattern.test(code));
  }

  /**
   * Exécute des formules Excel
   */
  async executeExcel(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Formater le code Excel
      const formattedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const explanation = `
        <div style="border: 1px solid #ddd; border-radius: 5px; padding: 15px; font-family: sans-serif;">
          <div style="margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #333;">
            Formules Excel
          </div>
          <div style="border: 1px solid #eee; border-radius: 4px; padding: 15px; background-color: white; margin-bottom: 15px;">
            <pre style="margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow: auto; font-family: monospace; font-size: 12px;">${formattedCode}</pre>
          </div>
          <div style="margin-top: 15px; background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #333;">Explication des formules:</div>
            <p style="margin-bottom: 10px;">Les formules Excel ne peuvent pas être exécutées directement dans ce navigateur. Vous devez les copier dans Excel pour les tester.</p>
            <div style="color: #0066cc; font-weight: bold; margin-top: 10px;">
              Astuce: Copiez ces formules dans Excel pour voir le résultat.
            </div>
          </div>
        </div>
      `;
      
      return {
        success: true,
        output: explanation,
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
    // Vérifier si le code contient des éléments potentiellement dangereux
    if (this.isCodePotentiallyDangerous(code, language)) {
      return {
        success: false,
        output: '',
        error: `Code potentiellement dangereux détecté. Pour des raisons de sécurité, nous ne pouvons pas exécuter ce code.`,
        executionTimeMs: 0
      };
    }

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
      case 'excel':
        return this.executeExcel(code);
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