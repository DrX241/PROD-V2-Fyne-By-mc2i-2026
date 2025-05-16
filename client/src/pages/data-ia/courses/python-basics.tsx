import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronRight, ChevronLeft, Terminal, FileCode, Lightbulb, Award, Code, BookOpen, FileText, CheckCircle2, Coffee, Brain, BrainCircuit, Zap, ListChecks, FolderKanban, Microscope, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PageTitle from '@/components/utils/PageTitle';

export default function PythonBasics() {
  const [activeSection, setActiveSection] = useState<string | null>('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const isSectionCompleted = (sectionId: string) => {
    return completedSections.includes(sectionId);
  };

  const totalSections = 10;
  const progressPercentage = (completedSections.length / totalSections) * 100;

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 to-slate-950 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="mb-6">
          <Link href="/data-ia/data-ia-academy">
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à Data & IA Academy
            </Button>
          </Link>
          <PageTitle
            title="Fondamentaux Python"
            subtitle="Les bases essentielles du langage de programmation Python pour la Data Science"
            icon={<Terminal className="h-8 w-8 text-blue-400" />}
          />
        </div>

        {/* Informations sur le cours */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-blue-900/20 backdrop-blur-sm border border-blue-800 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fondamentaux de Python pour la Data Science</h2>
              <p className="text-blue-200 mb-4 max-w-2xl">
                Ce cours vous guide à travers les concepts fondamentaux du langage Python et pose les bases essentielles pour votre parcours en science des données.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Débutant</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">4-6 heures</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Programmation</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Data Science</Badge>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/50 border-4 border-blue-700">
                <div className="text-center">
                  <div className="text-xl font-bold">{progressPercentage.toFixed(0)}%</div>
                  <div className="text-xs text-blue-300">Complété</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Barre latérale */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className={`md:w-72 flex-shrink-0 bg-blue-900/20 border border-blue-800 rounded-xl p-4 ${sidebarOpen ? 'block' : 'hidden md:block'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Modules du cours</h3>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progression</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <nav className="space-y-1">
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'introduction' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('introduction')}
              >
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Introduction à Python</span>
                {isSectionCompleted('introduction') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'installation' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('installation')}
              >
                <Terminal className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Installation et configuration</span>
                {isSectionCompleted('installation') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'bases' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('bases')}
              >
                <FileCode className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Bases du langage</span>
                {isSectionCompleted('bases') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'structures' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('structures')}
              >
                <FolderKanban className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Structures de données</span>
                {isSectionCompleted('structures') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'controle' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('controle')}
              >
                <ListChecks className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Structures de contrôle</span>
                {isSectionCompleted('controle') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'fonctions' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('fonctions')}
              >
                <Code className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Fonctions et modules</span>
                {isSectionCompleted('fonctions') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'fichiers' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('fichiers')}
              >
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Manipulation de fichiers</span>
                {isSectionCompleted('fichiers') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'modules-data' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('modules-data')}
              >
                <BrainCircuit className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Modules pour Data Science</span>
                {isSectionCompleted('modules-data') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'bonnes-pratiques' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('bonnes-pratiques')}
              >
                <Lightbulb className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Bonnes pratiques</span>
                {isSectionCompleted('bonnes-pratiques') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'projet-final' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('projet-final')}
              >
                <Award className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Projet final</span>
                {isSectionCompleted('projet-final') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </nav>
          </motion.div>

          {/* Contenu du module */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex-grow bg-blue-900/20 border border-blue-800 rounded-xl p-6"
          >
            {activeSection === 'introduction' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Introduction à Python</h2>
                
                <div className="mb-6">
                  <p className="mb-4">Python est l'un des langages de programmation les plus populaires au monde, particulièrement dans le domaine de la data science et de l'intelligence artificielle. Sa syntaxe intuitive et sa grande flexibilité en font un excellent choix pour les débutants comme pour les experts.</p>
                  
                  <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-5 w-5 text-amber-400 mr-2" />
                      Pourquoi Python pour la Data Science ?
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-blue-200">
                      <li><strong>Simplicité</strong> : Syntaxe claire et lisible, idéale pour la modélisation de concepts</li>
                      <li><strong>Écosystème riche</strong> : Bibliothèques spécialisées (NumPy, Pandas, Matplotlib, Scikit-learn, etc.)</li>
                      <li><strong>Communauté active</strong> : Ressources abondantes et support communautaire</li>
                      <li><strong>Polyvalence</strong> : Adapté à l'analyse de données, au machine learning, à la visualisation</li>
                      <li><strong>Intégration facile</strong> : Interopérable avec d'autres langages et technologies</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Histoire et évolution de Python</h3>
                  <p className="mb-4">Créé par Guido van Rossum à la fin des années 1980, Python a connu une évolution remarquable :</p>
                  
                  <div className="relative pl-8 mb-6">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-700"></div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">1991</div>
                      <div>Python 0.9.0 - Première version publique</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">2000</div>
                      <div>Python 2.0 - Nouvelles fonctionnalités comme le ramasse-miettes (garbage collector)</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">2008</div>
                      <div>Python 3.0 - Amélioration majeure, non rétrocompatible avec Python 2</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">2010s</div>
                      <div>Essor de Python en data science avec l'émergence de bibliothèques spécialisées</div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">Aujourd'hui</div>
                      <div>Python est l'un des langages les plus utilisés, particulièrement en IA et Data Science</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Python 2 vs Python 3</h3>
                  <p className="mb-4">Aujourd'hui, Python 3 est la version standard. Les principales différences avec Python 2 (désormais obsolète) :</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Python 2</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                        <li>Print est une instruction: <code>print "Hello"</code></li>
                        <li>Division entière par défaut: <code>5 / 2 == 2</code></li>
                        <li>Unicode moins bien supporté</li>
                        <li>Support terminé en 2020</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-700/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Python 3</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                        <li>Print est une fonction: <code>print("Hello")</code></li>
                        <li>Division flottante par défaut: <code>5 / 2 == 2.5</code></li>
                        <li>Meilleur support Unicode</li>
                        <li>Version actuelle et supportée</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Python en entreprise</h3>
                  <p className="mb-4">Python est largement utilisé dans l'industrie, notamment dans des entreprises comme :</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Google</h4>
                      <p className="text-sm text-blue-300">Infrastructure web et machine learning</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Netflix</h4>
                      <p className="text-sm text-blue-300">Analyse de données et recommandations</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Spotify</h4>
                      <p className="text-sm text-blue-300">Analyses musicales et recommandations</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Instagram</h4>
                      <p className="text-sm text-blue-300">Backend et traitement d'images</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">NASA</h4>
                      <p className="text-sm text-blue-300">Traitement de données scientifiques</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">mc2i</h4>
                      <p className="text-sm text-blue-300">Projets data et intelligence artificielle</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" disabled>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  <Button 
                    onClick={() => {
                      markSectionComplete('introduction');
                      setActiveSection('installation');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'installation' && (
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
                        <li>Lancez l'installateur et assurez-vous de cocher "Add Python to PATH"</li>
                        <li>Suivez les instructions d'installation</li>
                        <li>Vérifiez l'installation en ouvrant une invite de commande et en tapant : <code>python --version</code></li>
                      </ol>
                    </TabsContent>
                    
                    <TabsContent value="macos" className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mt-2">
                      <p className="mb-2">macOS est livré avec Python, mais il est recommandé d'installer la dernière version :</p>
                      <ol className="list-decimal list-inside space-y-3">
                        <li>Installez Homebrew (gestionnaire de paquets) : <code>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"</code></li>
                        <li>Installez Python via Homebrew : <code>brew install python</code></li>
                        <li>Vérifiez l'installation : <code>python3 --version</code></li>
                      </ol>
                      <p className="mt-2">Alternative : téléchargez l'installateur depuis python.org</p>
                    </TabsContent>
                    
                    <TabsContent value="linux" className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mt-2">
                      <p className="mb-2">La plupart des distributions Linux incluent Python. Pour installer la dernière version :</p>
                      
                      <div className="mb-2">
                        <strong>Ubuntu/Debian :</strong>
                        <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto">
                          <code>sudo apt update<br/>sudo apt install python3 python3-pip</code>
                        </pre>
                      </div>
                      
                      <div className="mb-2">
                        <strong>Fedora :</strong>
                        <pre className="bg-slate-900 p-2 rounded-md mt-1 overflow-x-auto">
                          <code>sudo dnf install python3 python3-pip</code>
                        </pre>
                      </div>
                      
                      <p className="mt-2">Vérifiez l'installation : <code>python3 --version</code></p>
                    </TabsContent>
                  </Tabs>
                  
                  <h3 className="text-xl font-semibold mb-3">Environnements de développement (IDE)</h3>
                  <p className="mb-3">Un bon environnement de développement facilite grandement l'écriture de code. Voici les IDE les plus populaires pour Python en data science :</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle>Jupyter Notebook</CardTitle>
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
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle>VS Code</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>Éditeur léger mais puissant avec des extensions Python excellentes et une intégration Git.</p>
                        <div className="flex items-center mt-2 text-amber-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4" />
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
                        <span className="font-mono text-blue-300">pip freeze > requirements.txt</span>
                        <p className="text-sm">Sauvegarde la liste des paquets dans un fichier</p>
                      </div>
                      <div>
                        <span className="font-mono text-blue-300">pip install -r requirements.txt</span>
                        <p className="text-sm">Installe les paquets listés dans un fichier</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Environnements virtuels</h3>
                  <p className="mb-3">Les environnements virtuels permettent d'isoler les dépendances de vos projets Python, ce qui est une bonne pratique pour éviter les conflits entre projets.</p>
                  
                  <Accordion type="single" collapsible className="mb-6">
                    <AccordionItem value="venv" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Utilisation de venv (module standard)</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <div className="space-y-2">
                          <p><strong>Création :</strong> <code>python -m venv myenv</code></p>
                          <p><strong>Activation (Windows) :</strong> <code>myenv\\Scripts\\activate</code></p>
                          <p><strong>Activation (macOS/Linux) :</strong> <code>source myenv/bin/activate</code></p>
                          <p><strong>Désactivation :</strong> <code>deactivate</code></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="conda" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Utilisation de Conda (populaire en data science)</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <div className="space-y-2">
                          <p><strong>Installation :</strong> Téléchargez et installez Anaconda ou Miniconda</p>
                          <p><strong>Création :</strong> <code>conda create --name myenv python=3.9</code></p>
                          <p><strong>Activation :</strong> <code>conda activate myenv</code></p>
                          <p><strong>Désactivation :</strong> <code>conda deactivate</code></p>
                          <p><strong>Liste des environnements :</strong> <code>conda env list</code></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <Microscope className="h-5 w-5 text-blue-400 mr-2" />
                      Astuce professionnelle
                    </h3>
                    <p className="text-blue-200">Utilisez un fichier <code>requirements.txt</code> pour documenter les dépendances de votre projet. Cela facilite la collaboration et le déploiement. Pour les projets complexes, envisagez d'utiliser des outils comme <strong>Poetry</strong> ou <strong>Pipenv</strong> qui offrent une gestion plus avancée des dépendances.</p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('introduction')}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  <Button 
                    onClick={() => {
                      markSectionComplete('installation');
                      setActiveSection('bases');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'bases' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Bases du langage Python</h2>
                
                <div className="mb-6">
                  <p className="mb-4">Python est reconnu pour sa syntaxe claire et lisible. Dans cette section, nous allons explorer les fondamentaux du langage qui vous permettront de commencer à écrire vos premiers programmes.</p>
                  
                  <h3 className="text-xl font-semibold mb-3">Votre premier programme Python</h3>
                  <p className="mb-3">Commençons par le traditionnel "Hello World" :</p>
                  
                  <div className="mb-6">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Ceci est un commentaire
print("Hello, World!")  # Affiche le message sur la console`}
                    </SyntaxHighlighter>
                    <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
                      Hello, World!
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Variables et types de données</h3>
                  <p className="mb-3">Les variables sont des espaces de stockage nommés pour les données. Python est un langage à typage dynamique, ce qui signifie que vous n'avez pas besoin de déclarer le type d'une variable.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Types de données de base</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Entiers (int)</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`age = 30
population = 7_800_000_000  # Les _ améliorent la lisibilité
print(type(age))  # <class 'int'>`}
                          </SyntaxHighlighter>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Nombres à virgule flottante (float)</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`pi = 3.14159
temperature = -2.5
print(type(pi))  # <class 'float'>`}
                          </SyntaxHighlighter>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Chaînes de caractères (str)</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`nom = "Alice"
message = 'Bonjour'
phrase = """Ceci est une chaîne
sur plusieurs lignes"""
print(type(nom))  # <class 'str'>`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Autres types importants</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Booléens (bool)</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`est_actif = True
est_complete = False
print(type(est_actif))  # <class 'bool'>`}
                          </SyntaxHighlighter>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">None (NoneType)</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`resultat = None  # Représente l'absence de valeur
print(type(resultat))  # <class 'NoneType'>`}
                          </SyntaxHighlighter>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Conversions de types</div>
                          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                            {`x = int("42")      # Chaîne vers entier
y = float("3.14")   # Chaîne vers flottant
z = str(42)         # Entier vers chaîne
b = bool(1)         # Convertit en booléen (True)`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Opérateurs</h3>
                  <p className="mb-3">Python dispose d'un ensemble complet d'opérateurs pour effectuer des calculs et des comparaisons.</p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-900/50">
                          <th className="border border-blue-800 p-2 text-left">Type</th>
                          <th className="border border-blue-800 p-2 text-left">Opérateurs</th>
                          <th className="border border-blue-800 p-2 text-left">Exemple</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Arithmétiques</td>
                          <td className="border border-blue-800 p-2"><code>+, -, *, /, //, %, **</code></td>
                          <td className="border border-blue-800 p-2"><code>5 + 2 = 7, 5 * 2 = 10, 5 / 2 = 2.5</code></td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Comparaison</td>
                          <td className="border border-blue-800 p-2"><code>==, !=, >, <, >=, <=</code></td>
                          <td className="border border-blue-800 p-2"><code>5 > 2 → True, 5 == 5 → True</code></td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Logiques</td>
                          <td className="border border-blue-800 p-2"><code>and, or, not</code></td>
                          <td className="border border-blue-800 p-2"><code>True and False → False</code></td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Assignation</td>
                          <td className="border border-blue-800 p-2"><code>=, +=, -=, *=, /=</code></td>
                          <td className="border border-blue-800 p-2"><code>x = 5, x += 2 → x devient 7</code></td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Identité</td>
                          <td className="border border-blue-800 p-2"><code>is, is not</code></td>
                          <td className="border border-blue-800 p-2"><code>x is y → vérifie si mêmes objets</code></td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Appartenance</td>
                          <td className="border border-blue-800 p-2"><code>in, not in</code></td>
                          <td className="border border-blue-800 p-2"><code>"a" in "abc" → True</code></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Formatage de chaînes</h3>
                  <p className="mb-3">Python offre plusieurs façons de formater des chaînes de caractères :</p>
                  
                  <Accordion type="single" collapsible className="mb-6">
                    <AccordionItem value="f-strings" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">f-strings (Python 3.6+, recommandé)</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                          {`nom = "Alice"
age = 30
message = f"Bonjour, je m'appelle {nom} et j'ai {age} ans."
print(message)  # Bonjour, je m'appelle Alice et j'ai 30 ans.

# Expressions dans les f-strings
prix = 49.95
quantite = 3
print(f"Total: {prix * quantite:.2f}€")  # Total: 149.85€`}
                        </SyntaxHighlighter>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="format" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Méthode .format()</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                          {`nom = "Bob"
age = 25
message = "Bonjour, je m'appelle {} et j'ai {} ans.".format(nom, age)
print(message)  # Bonjour, je m'appelle Bob et j'ai 25 ans.

# Utilisation de paramètres nommés
message = "Bonjour, je m'appelle {nom} et j'ai {age} ans.".format(nom=nom, age=age)`}
                        </SyntaxHighlighter>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="old-style" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Formatage % (style ancien, moins recommandé)</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                          {`nom = "Charlie"
age = 35
message = "Bonjour, je m'appelle %s et j'ai %d ans." % (nom, age)
print(message)  # Bonjour, je m'appelle Charlie et j'ai 35 ans.`}
                        </SyntaxHighlighter>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
                      Exemple pratique en Data Science
                    </h3>
                    <p className="text-blue-200 mb-3">Voici un exemple de code qui combine plusieurs concepts de base pour effectuer une analyse simple :</p>
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Analyse de température mensuelle
temperatures = [14.2, 16.3, 18.0, 19.5, 22.1, 25.3, 28.2, 29.7, 26.4, 21.8, 18.5, 15.2]
mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

# Calculs de base
temp_moyenne = sum(temperatures) / len(temperatures)
temp_max = max(temperatures)
temp_min = min(temperatures)
amplitude = temp_max - temp_min

# Analyse et formatage
mois_plus_chaud = mois[temperatures.index(temp_max)]
mois_plus_froid = mois[temperatures.index(temp_min)]

# Affichage des résultats
print(f"Température moyenne annuelle: {temp_moyenne:.1f}°C")
print(f"Température maximale: {temp_max}°C en {mois_plus_chaud}")
print(f"Température minimale: {temp_min}°C en {mois_plus_froid}")
print(f"Amplitude thermique: {amplitude}°C")`}
                    </SyntaxHighlighter>
                    <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
                      Température moyenne annuelle: 21.3°C<br/>
                      Température maximale: 29.7°C en Aoû<br/>
                      Température minimale: 14.2°C en Jan<br/>
                      Amplitude thermique: 15.5°C
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('installation')}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  <Button 
                    onClick={() => {
                      markSectionComplete('bases');
                      setActiveSection('structures');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'structures' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Structures de données</h2>
                
                <div className="mb-6">
                  <p className="mb-4">Les structures de données sont essentielles en Python, particulièrement pour la data science. Elles vous permettent d'organiser, de stocker et de manipuler efficacement les données.</p>
                  
                  <h3 className="text-xl font-semibold mb-3">Listes</h3>
                  <p className="mb-3">Les listes sont des collections ordonnées et modifiables d'éléments. Elles sont l'une des structures de données les plus utilisées en Python.</p>
                  
                  <div className="bg-blue-900/30 rounded-md p-4 mb-6">
                    <h4 className="font-semibold mb-2">Création et manipulation de listes</h4>
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
                      {`# Création de liste
nombres = [1, 2, 3, 4, 5]
langages = ["Python", "R", "SQL", "Java"]
mixte = [1, "Python", True, 3.14]
liste_vide = []

# Accès aux éléments (indexation commence à 0)
print(langages[0])       # Python
print(langages[-1])      # Java (indexation négative)

# Tranches (slicing)
print(nombres[1:3])      # [2, 3]
print(nombres[:3])       # [1, 2, 3]
print(nombres[2:])       # [3, 4, 5]
print(nombres[::2])      # [1, 3, 5] (pas de 2)

# Modification
langages[1] = "Julia"    # Remplace "R" par "Julia"
print(langages)          # ["Python", "Julia", "SQL", "Java"]

# Méthodes utiles
langages.append("C++")   # Ajoute à la fin
langages.insert(2, "R")  # Insère à l'index 2
langages.remove("SQL")   # Supprime par valeur
popped = langages.pop()  # Supprime et retourne le dernier élément
langages.sort()          # Trie la liste (modifie la liste)
langages.reverse()       # Inverse la liste (modifie la liste)
len(langages)            # Nombre d'éléments`}
                    </SyntaxHighlighter>
                    
                    <h4 className="font-semibold mb-2">Compréhensions de liste</h4>
                    <p className="mb-2">Une façon concise et puissante de créer des listes :</p>
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Sans compréhension
carres = []
for i in range(1, 6):
    carres.append(i**2)
print(carres)  # [1, 4, 9, 16, 25]

# Avec compréhension
carres = [i**2 for i in range(1, 6)]
print(carres)  # [1, 4, 9, 16, 25]

# Avec condition
nombres_pairs = [i for i in range(1, 11) if i % 2 == 0]
print(nombres_pairs)  # [2, 4, 6, 8, 10]

# Pour la data science (exemple simple)
temperatures_c = [20, 25, 30, 35, 40]
temperatures_f = [temp * 9/5 + 32 for temp in temperatures_c]
print(temperatures_f)  # [68.0, 77.0, 86.0, 95.0, 104.0]`}
                    </SyntaxHighlighter>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Tuples</h3>
                  <p className="mb-3">Les tuples sont similaires aux listes, mais ils sont <strong>immuables</strong> (ne peuvent pas être modifiés après création).</p>
                  
                  <div className="bg-blue-900/30 rounded-md p-4 mb-6">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Création de tuples
coordonnees = (10, 20)
personne = ("Alice", 30, "Data Scientist")
singleton = (42,)  # Virgule nécessaire pour un seul élément
tuple_vide = ()

# Accès aux éléments (comme pour les listes)
print(personne[0])     # Alice
print(personne[-1])    # Data Scientist

# Déballage de tuple
nom, age, poste = personne
print(nom, age, poste)  # Alice 30 Data Scientist

# Tuples comme retour de fonction
def get_dimensions():
    return (1920, 1080)  # Retourne un tuple

largeur, hauteur = get_dimensions()  # Déballage direct
print(f"Résolution: {largeur}x{hauteur}")  # Résolution: 1920x1080

# Méthodes (limitées car immuable)
personne.count("Alice")  # Compte les occurrences
personne.index(30)       # Index de la première occurrence`}
                    </SyntaxHighlighter>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Dictionnaires</h3>
                  <p className="mb-3">Les dictionnaires sont des collections non ordonnées de paires clé-valeur, extrêmement utiles en data science pour stocker des données structurées.</p>
                  
                  <div className="bg-blue-900/30 rounded-md p-4 mb-6">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
                      {`# Création de dictionnaire
etudiant = {
    "nom": "Alice",
    "age": 22,
    "cours": ["Python", "Machine Learning", "SQL"],
    "actif": True
}

# Accès aux valeurs
print(etudiant["nom"])            # Alice
print(etudiant.get("adresse"))    # None (pas d'erreur si clé n'existe pas)
print(etudiant.get("adresse", "Non spécifiée"))  # Valeur par défaut

# Modification
etudiant["age"] = 23              # Modifie une valeur existante
etudiant["adresse"] = "Paris"     # Ajoute une nouvelle paire clé-valeur
etudiant["cours"].append("Deep Learning")  # Modifie une liste contenue

# Suppression
del etudiant["actif"]             # Supprime une paire clé-valeur
adresse = etudiant.pop("adresse") # Supprime et retourne la valeur

# Méthodes utiles
etudiant.keys()                   # Objet dict_keys contenant les clés
etudiant.values()                 # Objet dict_values contenant les valeurs
etudiant.items()                  # Objet dict_items contenant des tuples (clé, valeur)

# Parcourir un dictionnaire
for cle in etudiant:
    print(cle, etudiant[cle])

for cle, valeur in etudiant.items():
    print(cle, valeur)`}
                    </SyntaxHighlighter>
                    
                    <h4 className="font-semibold mb-2">Compréhensions de dictionnaire</h4>
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Créer un dictionnaire avec des carrés
carres = {i: i**2 for i in range(1, 6)}
print(carres)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Filtrer un dictionnaire
notes = {"Alice": 85, "Bob": 70, "Charlie": 90, "David": 65}
reussite = {nom: note for nom, note in notes.items() if note >= 70}
print(reussite)  # {"Alice": 85, "Bob": 70, "Charlie": 90}

# Exemple pour la data science
donnees = {"temp": [20, 25, 30], "pression": [1010, 1008, 1012]}
moyennes = {cle: sum(valeurs)/len(valeurs) for cle, valeurs in donnees.items()}
print(moyennes)  # {"temp": 25.0, "pression": 1010.0}`}
                    </SyntaxHighlighter>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Ensembles (sets)</h3>
                  <p className="mb-3">Les ensembles sont des collections non ordonnées d'éléments uniques. Ils sont utiles pour la suppression de doublons et les opérations mathématiques d'ensemble.</p>
                  
                  <div className="bg-blue-900/30 rounded-md p-4 mb-6">
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Création d'ensemble
langages = {"Python", "Java", "R", "Python"}  # Notez le doublon
print(langages)  # {"Python", "Java", "R"} - Le doublon est supprimé

# Conversion d'une liste en ensemble pour supprimer les doublons
liste_avec_doublons = [1, 2, 2, 3, 3, 3, 4]
liste_sans_doublons = list(set(liste_avec_doublons))
print(liste_sans_doublons)  # [1, 2, 3, 4]

# Opérations d'ensemble
science = {"Python", "R", "MATLAB"}
web = {"JavaScript", "HTML", "CSS", "Python"}

union = science | web  # ou science.union(web)
intersection = science & web  # ou science.intersection(web)
difference = science - web  # ou science.difference(web)
diff_sym = science ^ web  # ou science.symmetric_difference(web)

print(intersection)  # {"Python"}
print("Python" in science)  # True`}
                    </SyntaxHighlighter>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Comparaison des structures de données</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-900/50">
                          <th className="border border-blue-800 p-2 text-left">Structure</th>
                          <th className="border border-blue-800 p-2 text-left">Mutabilité</th>
                          <th className="border border-blue-800 p-2 text-left">Ordonné</th>
                          <th className="border border-blue-800 p-2 text-left">Indexable</th>
                          <th className="border border-blue-800 p-2 text-left">Cas d'utilisation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Liste</td>
                          <td className="border border-blue-800 p-2">Mutable</td>
                          <td className="border border-blue-800 p-2">Oui</td>
                          <td className="border border-blue-800 p-2">Oui</td>
                          <td className="border border-blue-800 p-2">Séquences de données, tableau 1D</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Tuple</td>
                          <td className="border border-blue-800 p-2">Immuable</td>
                          <td className="border border-blue-800 p-2">Oui</td>
                          <td className="border border-blue-800 p-2">Oui</td>
                          <td className="border border-blue-800 p-2">Groupes de valeurs fixes, retour multiple</td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Dictionnaire</td>
                          <td className="border border-blue-800 p-2">Mutable</td>
                          <td className="border border-blue-800 p-2">Oui*</td>
                          <td className="border border-blue-800 p-2">Par clé</td>
                          <td className="border border-blue-800 p-2">Données structurées, lookup rapide</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Ensemble</td>
                          <td className="border border-blue-800 p-2">Mutable</td>
                          <td className="border border-blue-800 p-2">Non</td>
                          <td className="border border-blue-800 p-2">Non</td>
                          <td className="border border-blue-800 p-2">Suppression de doublons, appartenance</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs mt-1 text-blue-300">* Les dictionnaires préservent l'ordre d'insertion depuis Python 3.7</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
                      Application en Data Science
                    </h3>
                    <p className="text-blue-200 mb-3">Création d'un tableau de données simple (comme un DataFrame pandas basique) :</p>
                    <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                      {`# Données d'un petit dataset
donnees = {
    "nom": ["Alice", "Bob", "Charlie", "David", "Eve"],
    "age": [24, 32, 18, 45, 37],
    "ville": ["Paris", "Lyon", "Marseille", "Toulouse", "Lille"],
    "salaire": [45000, 55000, 32000, 67000, 58000]
}

# Statistiques de base (similaire à pandas)
# Calcul de l'âge moyen
age_moyen = sum(donnees["age"]) / len(donnees["age"])
print(f"Âge moyen: {age_moyen:.1f} ans")  # Âge moyen: 31.2 ans

# Salaire maximal et la personne correspondante
max_salaire = max(donnees["salaire"])
index_max_salaire = donnees["salaire"].index(max_salaire)
nom_max_salaire = donnees["nom"][index_max_salaire]
print(f"Salaire maximal: {max_salaire}€ (employé: {nom_max_salaire})")  # Salaire maximal: 67000€ (employé: David)

# Filtrage des données (comme avec pandas .query())
jeunes_employes = []
for i in range(len(donnees["nom"])):
    if donnees["age"][i] < 30 and donnees["salaire"][i] > 40000:
        jeunes_employes.append(donnees["nom"][i])
        
print(f"Jeunes employés bien payés: {jeunes_employes}")  # Jeunes employés bien payés: ['Alice']

# Ajout d'une nouvelle colonne (comme dans pandas)
# Calculer le bonus comme 10% du salaire
donnees["bonus"] = [salaire * 0.1 for salaire in donnees["salaire"]]

# Afficher la table mise à jour (de façon simplifiée)
for i in range(len(donnees["nom"])):
    print(f"{donnees['nom'][i]}: {donnees['age'][i]} ans, {donnees['ville'][i]}, {donnees['salaire'][i]}€, bonus: {donnees['bonus'][i]}€")`}
                    </SyntaxHighlighter>
                    <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
                      Âge moyen: 31.2 ans<br/>
                      Salaire maximal: 67000€ (employé: David)<br/>
                      Jeunes employés bien payés: ['Alice']<br/>
                      Alice: 24 ans, Paris, 45000€, bonus: 4500.0€<br/>
                      Bob: 32 ans, Lyon, 55000€, bonus: 5500.0€<br/>
                      Charlie: 18 ans, Marseille, 32000€, bonus: 3200.0€<br/>
                      David: 45 ans, Toulouse, 67000€, bonus: 6700.0€<br/>
                      Eve: 37 ans, Lille, 58000€, bonus: 5800.0€
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('bases')}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  <Button 
                    onClick={() => {
                      markSectionComplete('structures');
                      setActiveSection('controle');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Pour les autres sections, nous utilisons un modèle d'affichage temporaire */}
            {(activeSection !== 'introduction' && activeSection !== 'installation' && 
              activeSection !== 'bases' && activeSection !== 'structures') && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Coffee className="h-16 w-16 text-blue-500 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Module en développement</h2>
                <p className="text-xl text-blue-300 mb-8 max-w-2xl">
                  La section sur {activeSection === 'controle' ? 'les structures de contrôle' : 
                                 activeSection === 'fonctions' ? 'les fonctions et modules' :
                                 activeSection === 'fichiers' ? 'la manipulation de fichiers' :
                                 activeSection === 'modules-data' ? 'les modules pour Data Science' :
                                 activeSection === 'bonnes-pratiques' ? 'les bonnes pratiques' :
                                 activeSection === 'projet-final' ? 'le projet final' : 'ce sujet'} 
                  est en cours de création et sera bientôt disponible.
                </p>
                <p className="text-md text-blue-200 mb-6">
                  Cette section couvrira des concepts importants comme 
                  {activeSection === 'controle' ? ' les conditions if/else, les boucles for/while, et les expressions conditionnelles.' : 
                   activeSection === 'fonctions' ? ' la définition de fonctions, les arguments, les fonctions lambda, et l\'import de modules.' :
                   activeSection === 'fichiers' ? ' la lecture/écriture de fichiers texte et binaires, CSV, JSON, et l\'utilisation des chemins.' :
                   activeSection === 'modules-data' ? ' NumPy, Pandas, Matplotlib et d\'autres bibliothèques essentielles pour la data science.' :
                   activeSection === 'bonnes-pratiques' ? ' le style de code PEP8, la documentation, les tests, et les principes de Clean Code.' :
                   activeSection === 'projet-final' ? ' un projet d\'analyse de données complet qui mettra en pratique tous les concepts du cours.' : 
                   ' nombreux concepts avancés.'}
                </p>
                <Button 
                  onClick={() => setActiveSection('introduction')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Revenir à l'introduction
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}