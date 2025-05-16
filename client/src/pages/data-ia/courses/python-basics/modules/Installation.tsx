import React from 'react';
import { ChevronRight, ChevronLeft, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star } from 'lucide-react';

interface InstallationProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const Installation: React.FC<InstallationProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Installation et configuration</h2>
      
      <div className="mb-6">
        <p className="mb-4">Pour commencer à utiliser Python, vous devez l'installer sur votre système. Python est disponible pour Windows, macOS et Linux. Nous allons également explorer l'environnement de développement et les outils essentiels.</p>
        
        <h3 className="text-xl font-semibold mb-3">Installation de Python</h3>
        
        <Tabs defaultValue="windows" className="mb-6">
          <TabsList className="bg-blue-900/30 border border-blue-800">
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="macos">macOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          
          <TabsContent value="windows" className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mt-2">
            <ol className="list-decimal list-inside space-y-3">
              <li>Visitez le site officiel de Python : <span className="text-blue-400">python.org/downloads</span></li>
              <li>Téléchargez la dernière version de Python 3.x</li>
              <li>Lancez l'installateur et <strong>assurez-vous de cocher "Add Python to PATH"</strong> (cette étape est cruciale)</li>
              <li>Suivez les instructions d'installation</li>
              <li>Vérifiez l'installation en ouvrant une invite de commande (cmd) et en tapant : <code>python --version</code></li>
            </ol>
            <div className="bg-blue-900/30 p-3 mt-3 rounded border border-blue-700 text-sm">
              <p className="font-semibold text-blue-300">💡 Conseil professionnel :</p>
              <p>Sur Windows, vous pouvez également installer Python via le Microsoft Store pour une installation plus simple, ou utiliser le gestionnaire de paquets Chocolatey avec la commande : <code>choco install python</code></p>
            </div>
          </TabsContent>
          
          <TabsContent value="macos" className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mt-2">
            <p className="mb-2">macOS est généralement livré avec Python, mais il est recommandé d'installer la dernière version :</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>Méthode recommandée : Installez Homebrew (gestionnaire de paquets) :
                <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                  <code>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"</code>
                </pre>
              </li>
              <li>Installez Python via Homebrew :
                <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                  <code>brew install python</code>
                </pre>
              </li>
              <li>Vérifiez l'installation :
                <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                  <code>python3 --version</code>
                </pre>
              </li>
            </ol>
            <p className="mt-3">Alternative : Téléchargez l'installateur depuis python.org et suivez les instructions</p>
            <div className="bg-blue-900/30 p-3 mt-3 rounded border border-blue-700 text-sm">
              <p className="font-semibold text-blue-300">💡 Note importante :</p>
              <p>Sur macOS, la commande <code>python</code> peut faire référence à Python 2.x. Utilisez toujours <code>python3</code> pour vous assurer d'utiliser Python 3.x.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="linux" className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mt-2">
            <p className="mb-2">La plupart des distributions Linux incluent Python. Pour installer la dernière version :</p>
            
            <div className="mb-4">
              <strong>Ubuntu/Debian :</strong>
              <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                <code>sudo apt update<br/>sudo apt install python3 python3-pip python3-venv</code>
              </pre>
            </div>
            
            <div className="mb-4">
              <strong>Fedora :</strong>
              <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                <code>sudo dnf install python3 python3-pip</code>
              </pre>
            </div>
            
            <div className="mb-4">
              <strong>Arch Linux :</strong>
              <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto text-sm">
                <code>sudo pacman -S python python-pip</code>
              </pre>
            </div>
            
            <p className="mt-2">Vérifiez l'installation : <code>python3 --version</code></p>
          </TabsContent>
        </Tabs>
        
        <h3 className="text-xl font-semibold mb-3">Installation de pip</h3>
        <p className="mb-3">pip est le gestionnaire de paquets standard pour Python. Il est généralement installé automatiquement avec Python, mais vous pouvez le vérifier et le mettre à jour :</p>
        
        <pre className="bg-slate-900 p-3 rounded-md mb-4 overflow-x-auto text-sm">
          <code># Vérifier si pip est installé
python -m pip --version

# Mettre à jour pip
python -m pip install --upgrade pip</code>
        </pre>
        
        <h3 className="text-xl font-semibold mb-3">Environnements de développement (IDE)</h3>
        <p className="mb-3">Un bon environnement de développement facilite grandement l'écriture de code. Voici les IDE les plus populaires pour Python en data science :</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>Jupyter Notebook / JupyterLab</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Environnement interactif idéal pour la data science, permettant de combiner code, visualisations et texte explicatif.</p>
              <div className="flex items-center mt-2 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <div className="mt-2 text-blue-300">
                <strong>Installation :</strong> <code>pip install notebook</code> ou <code>pip install jupyterlab</code>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>VS Code</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Éditeur léger mais puissant avec d'excellentes extensions Python, un débogueur intégré et une intégration Git.</p>
              <div className="flex items-center mt-2 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4" />
              </div>
              <div className="mt-2 text-blue-300">
                <strong>Installation :</strong> <a href="https://code.visualstudio.com/" className="text-blue-400 hover:underline">code.visualstudio.com</a> + extension Python
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>PyCharm</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>IDE complet avec de nombreuses fonctionnalités pour le développement Python professionnel.</p>
              <div className="flex items-center mt-2 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4" />
              </div>
              <div className="mt-2 text-blue-300">
                <strong>Installation :</strong> <a href="https://www.jetbrains.com/pycharm/" className="text-blue-400 hover:underline">jetbrains.com/pycharm</a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>Google Colab</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Environnement basé sur Jupyter dans le cloud, avec accès gratuit à des GPUs et intégration avec Google Drive.</p>
              <div className="flex items-center mt-2 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4" />
              </div>
              <div className="mt-2 text-blue-300">
                <strong>Accès :</strong> <a href="https://colab.research.google.com/" className="text-blue-400 hover:underline">colab.research.google.com</a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>Spyder</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>IDE scientifique Python avec intégration avancée pour l'analyse de données et la visualisation.</p>
              <div className="flex items-center mt-2 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4" />
                <Star className="h-4 w-4" />
              </div>
              <div className="mt-2 text-blue-300">
                <strong>Installation :</strong> <code>pip install spyder</code> ou via Anaconda
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Gestionnaire de paquets - pip</h3>
        <p className="mb-3">pip est le gestionnaire de paquets standard pour Python. Il vous permet d'installer facilement des bibliothèques tierces.</p>
        
        <div className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mb-6">
          <h4 className="font-semibold mb-2">Commandes pip essentielles</h4>
          <div className="space-y-2">
            <div>
              <span className="font-mono text-blue-300">pip install package_name</span>
              <p className="text-sm">Installe un paquet</p>
            </div>
            <div>
              <span className="font-mono text-blue-300">pip install --upgrade package_name</span>
              <p className="text-sm">Met à jour un paquet</p>
            </div>
            <div>
              <span className="font-mono text-blue-300">pip uninstall package_name</span>
              <p className="text-sm">Désinstalle un paquet</p>
            </div>
            <div>
              <span className="font-mono text-blue-300">pip list</span>
              <p className="text-sm">Liste tous les paquets installés</p>
            </div>
            <div>
              <span className="font-mono text-blue-300">pip freeze &gt; requirements.txt</span>
              <p className="text-sm">Sauvegarde la liste des paquets dans un fichier</p>
            </div>
            <div>
              <span className="font-mono text-blue-300">pip install -r requirements.txt</span>
              <p className="text-sm">Installe les paquets listés dans un fichier</p>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Environnements virtuels</h3>
        <p className="mb-3">Les environnements virtuels permettent d'isoler les dépendances de vos projets Python, ce qui est une bonne pratique pour éviter les conflits entre projets et gérer les différentes versions de bibliothèques.</p>
        
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="venv" className="border-blue-800">
            <AccordionTrigger className="hover:bg-blue-800/20 px-4">Utilisation de venv (module standard)</AccordionTrigger>
            <AccordionContent className="bg-blue-950/30 px-4 py-2">
              <div className="space-y-2">
                <p><strong>Création :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>python -m venv myenv</code>
                </pre>
                
                <p><strong>Activation (Windows) :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>myenv\Scripts\activate</code>
                </pre>
                
                <p><strong>Activation (macOS/Linux) :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>source myenv/bin/activate</code>
                </pre>
                
                <p><strong>Désactivation :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>deactivate</code>
                </pre>
                
                <p className="text-sm text-blue-300 mt-2">Une fois activé, vous verrez le nom de l'environnement au début de votre ligne de commande, indiquant que vous travaillez dans cet environnement isolé.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="conda" className="border-blue-800">
            <AccordionTrigger className="hover:bg-blue-800/20 px-4">Utilisation de Conda (populaire en data science)</AccordionTrigger>
            <AccordionContent className="bg-blue-950/30 px-4 py-2">
              <div className="space-y-2">
                <p><strong>Installation :</strong> Téléchargez et installez <a href="https://www.anaconda.com/products/distribution" className="text-blue-400 hover:underline">Anaconda</a> (distribution complète) ou <a href="https://docs.conda.io/en/latest/miniconda.html" className="text-blue-400 hover:underline">Miniconda</a> (version minimale)</p>
                
                <p><strong>Création :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>conda create --name myenv python=3.9</code>
                </pre>
                
                <p><strong>Activation :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>conda activate myenv</code>
                </pre>
                
                <p><strong>Désactivation :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>conda deactivate</code>
                </pre>
                
                <p><strong>Liste des environnements :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>conda env list</code>
                </pre>
                
                <p className="text-sm text-blue-300 mt-2">Conda a l'avantage de gérer non seulement les paquets Python, mais aussi les dépendances système, ce qui le rend particulièrement utile pour les projets de data science avec des bibliothèques complexes.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="poetry" className="border-blue-800">
            <AccordionTrigger className="hover:bg-blue-800/20 px-4">Poetry (outil moderne de gestion de dépendances)</AccordionTrigger>
            <AccordionContent className="bg-blue-950/30 px-4 py-2">
              <div className="space-y-2">
                <p><strong>Installation :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>curl -sSL https://install.python-poetry.org | python3 -</code>
                </pre>
                
                <p><strong>Création d'un nouveau projet :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>poetry new mon-projet</code>
                </pre>
                
                <p><strong>Initialisation dans un projet existant :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>cd mon-projet-existant
poetry init</code>
                </pre>
                
                <p><strong>Ajout de dépendances :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>poetry add pandas numpy matplotlib</code>
                </pre>
                
                <p><strong>Activation de l'environnement :</strong></p>
                <pre className="bg-slate-900 p-2 rounded-md overflow-x-auto text-sm">
                  <code>poetry shell</code>
                </pre>
                
                <p className="text-sm text-blue-300 mt-2">Poetry offre une gestion avancée des dépendances avec résolution de conflits et verrouillage de versions, idéal pour les projets de production.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <Microscope className="h-5 w-5 text-blue-400 mr-2" />
            Astuce professionnelle
          </h3>
          <p className="text-blue-200 mb-2">Utilisez un fichier <code>requirements.txt</code> pour documenter les dépendances de votre projet. Cela facilite la collaboration et le déploiement.</p>
          <p className="text-blue-200">Structure recommandée pour les projets data :</p>
          <pre className="bg-slate-900 p-2 rounded-md mt-2 text-sm">
            <code>mon_projet/
├── data/                # Données brutes et traitées
├── notebooks/           # Jupyter notebooks
├── src/                 # Code source Python
│   ├── __init__.py
│   ├── data/            # Code pour manipulation des données
│   ├── features/        # Code pour ingénierie des caractéristiques
│   └── models/          # Code pour les modèles
├── tests/               # Tests unitaires
├── README.md            # Documentation principale
├── requirements.txt     # Dépendances du projet
└── setup.py             # Pour installer le projet comme un paquet</code>
          </pre>
        </div>

        <h3 className="text-xl font-semibold mb-3">Premier script Python</h3>
        <p className="mb-3">Maintenant que Python est installé, créons notre premier script :</p>

        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Créez un fichier nommé <code>hello.py</code> avec un éditeur de texte</li>
          <li>Ajoutez le code suivant :</li>
        </ol>

        <pre className="bg-slate-900 p-3 rounded-md mb-4 overflow-x-auto text-sm">
          <code># Mon premier script Python
print("Hello, Data Science World!")

# Calcul simple
nombre1 = 10
nombre2 = 5
somme = nombre1 + nombre2
produit = nombre1 * nombre2

print(f"La somme de {nombre1} et {nombre2} est {somme}")
print(f"Le produit de {nombre1} et {nombre2} est {produit}")</code>
        </pre>

        <ol className="list-decimal list-inside space-y-2 mb-4" start={3}>
          <li>Exécutez le script en ligne de commande :</li>
        </ol>

        <pre className="bg-slate-900 p-3 rounded-md mb-4 overflow-x-auto text-sm">
          <code>python hello.py</code>
        </pre>

        <div className="bg-slate-800 border border-slate-700 rounded-md p-3 mb-4 text-green-400 font-mono text-sm">
          Hello, Data Science World!<br/>
          La somme de 10 et 5 est 15<br/>
          Le produit de 10 et 5 est 50
        </div>

        <p className="mb-3">Félicitations ! Vous venez d'exécuter votre premier script Python. Nous sommes maintenant prêts à explorer les bases du langage.</p>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={goToPrev}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button 
          onClick={goToNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Installation;