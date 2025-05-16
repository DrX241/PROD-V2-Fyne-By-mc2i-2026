import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronRight, ChevronLeft, Database, FileCode, Lightbulb, Award, Code, BookOpen, FileText, CheckCircle2, Coffee, Brain, BrainCircuit, Zap, ListChecks, FolderKanban, Microscope, Copy, Star, Server, TableProperties, KeyRound, Layout, Layers } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SQLFundamentals() {
  const [activeSection, setActiveSection] = useState<string | null>('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Exécution de requête SQL
  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsExecuting(true);
    setQueryError('');
    setShowSuccess(false);
    
    try {
      const response = await axios.post('/api/execute-sql', { query: sqlQuery });
      setQueryResult(response.data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error executing SQL:', error);
      setQueryError(error.response?.data?.error || 'Une erreur est survenue lors de l\'exécution de la requête SQL');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

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
            title="SQL Fondamentaux"
            subtitle="Les bases essentielles du langage SQL pour l'analyse et la manipulation de données"
            icon={<Database className="h-8 w-8 text-blue-400" />}
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
              <h2 className="text-2xl font-bold mb-2">Fondamentaux de SQL pour la Data Science</h2>
              <p className="text-blue-200 mb-4 max-w-2xl">
                Ce cours vous guide à travers les concepts fondamentaux du langage SQL et vous apprend à interroger, manipuler et analyser des données relationnelles.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Débutant</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">4-6 heures</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Base de données</Badge>
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
                <span className="flex-grow">Introduction à SQL</span>
                {isSectionCompleted('introduction') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'sgbd' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('sgbd')}
              >
                <Server className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">SGBD et environnement</span>
                {isSectionCompleted('sgbd') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'select' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('select')}
              >
                <TableProperties className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Requêtes SELECT</span>
                {isSectionCompleted('select') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'filtres' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('filtres')}
              >
                <FolderKanban className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Filtrage de données</span>
                {isSectionCompleted('filtres') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'fonctions' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('fonctions')}
              >
                <Code className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Fonctions SQL</span>
                {isSectionCompleted('fonctions') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'jointures' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('jointures')}
              >
                <Layers className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Jointures</span>
                {isSectionCompleted('jointures') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'groupements' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('groupements')}
              >
                <Layout className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Groupements et agrégats</span>
                {isSectionCompleted('groupements') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'modification' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('modification')}
              >
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Modification de données</span>
                {isSectionCompleted('modification') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'schema' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('schema')}
              >
                <KeyRound className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Schéma et structure</span>
                {isSectionCompleted('schema') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'projet-final' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('projet-final')}
              >
                <Award className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Projet d'analyse</span>
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
                <h2 className="text-2xl font-bold mb-4">Introduction à SQL</h2>
                
                <div className="mb-6">
                  <p className="mb-4">SQL (Structured Query Language) est un langage de programmation conçu pour gérer et manipuler des bases de données relationnelles. C'est l'un des langages les plus utilisés dans le domaine de la data science et de l'analyse de données.</p>
                  
                  <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-5 w-5 text-amber-400 mr-2" />
                      Pourquoi SQL est essentiel en Data Science ?
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-blue-200">
                      <li><strong>Ubiquité</strong> : Utilisé par pratiquement toutes les entreprises pour stocker des données</li>
                      <li><strong>Puissance</strong> : Capable de gérer et d'interroger efficacement de grands volumes de données</li>
                      <li><strong>Standardisation</strong> : Langage standardisé avec une syntaxe cohérente entre les différents systèmes</li>
                      <li><strong>Intégration</strong> : S'intègre parfaitement avec d'autres langages et outils d'analyse</li>
                      <li><strong>Durabilité</strong> : Existe depuis les années 1970 et reste fondamental dans l'écosystème des données</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Historique et évolution</h3>
                  <p className="mb-4">L'histoire de SQL est fascinante et reflète l'évolution des besoins en gestion de données :</p>
                  
                  <div className="relative pl-8 mb-6">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-700"></div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">1970</div>
                      <div>Dr. E.F. Codd publie son article sur les bases de données relationnelles</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">1974</div>
                      <div>Premiers développements de SQL (alors appelé SEQUEL) chez IBM</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">1986</div>
                      <div>SQL devient un standard ANSI</div>
                    </div>
                    
                    <div className="relative pb-6">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">1992</div>
                      <div>SQL-92 - Version majeure qui constitue encore la base de SQL moderne</div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
                      <div className="font-semibold text-blue-300">Aujourd'hui</div>
                      <div>SQL reste fondamental avec des extensions pour le Big Data, NoSQL et l'analyse</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Bases de données relationnelles</h3>
                  <p className="mb-4">Le modèle relationnel est au cœur de SQL. Voici quelques concepts clés :</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Structure fondamentale</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Tables</div>
                          <p className="text-sm">Structures similaires à des feuilles de calcul, composées de lignes et de colonnes</p>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Colonnes (ou champs)</div>
                          <p className="text-sm">Définissent le type de données stockées (texte, nombre, date, etc.)</p>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Lignes (ou enregistrements)</div>
                          <p className="text-sm">Contiennent les données individuelles pour chaque entrée</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Concepts avancés</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Clés primaires</div>
                          <p className="text-sm">Identifiants uniques pour chaque enregistrement d'une table</p>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Clés étrangères</div>
                          <p className="text-sm">Créent des relations entre tables, maintenant l'intégrité référentielle</p>
                        </div>
                        
                        <div className="bg-blue-900/30 rounded-md p-3">
                          <div className="font-semibold text-blue-300">Schéma</div>
                          <p className="text-sm">Structure et organisation des tables, relations et contraintes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Les principales opérations SQL</h3>
                  <p className="mb-4">SQL se divise en plusieurs catégories d'opérations :</p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-900/50">
                          <th className="border border-blue-800 p-2 text-left">Catégorie</th>
                          <th className="border border-blue-800 p-2 text-left">Instructions</th>
                          <th className="border border-blue-800 p-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">DQL (Data Query Language)</td>
                          <td className="border border-blue-800 p-2"><code>SELECT</code></td>
                          <td className="border border-blue-800 p-2">Interroge la base pour récupérer des données</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">DML (Data Manipulation Language)</td>
                          <td className="border border-blue-800 p-2"><code>INSERT, UPDATE, DELETE</code></td>
                          <td className="border border-blue-800 p-2">Modifie les données dans les tables</td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">DDL (Data Definition Language)</td>
                          <td className="border border-blue-800 p-2"><code>CREATE, ALTER, DROP</code></td>
                          <td className="border border-blue-800 p-2">Gère la structure des objets de la base</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">DCL (Data Control Language)</td>
                          <td className="border border-blue-800 p-2"><code>GRANT, REVOKE</code></td>
                          <td className="border border-blue-800 p-2">Contrôle les accès et autorisations</td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">TCL (Transaction Control Language)</td>
                          <td className="border border-blue-800 p-2"><code>COMMIT, ROLLBACK</code></td>
                          <td className="border border-blue-800 p-2">Gère les transactions</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">SQL en entreprise</h3>
                  <p className="mb-4">SQL est omniprésent dans les entreprises et les organisations pour :</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Applications d'entreprise</h4>
                      <p className="text-sm text-blue-300">ERP, CRM, systèmes comptables</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Data Warehousing</h4>
                      <p className="text-sm text-blue-300">Stockage et analyse de données</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Business Intelligence</h4>
                      <p className="text-sm text-blue-300">Rapports et tableaux de bord</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Applications Web</h4>
                      <p className="text-sm text-blue-300">Sites web et services en ligne</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">IoT</h4>
                      <p className="text-sm text-blue-300">Stockage de données de capteurs</p>
                    </div>
                    <div className="bg-blue-950/70 rounded-lg p-4 text-center">
                      <h4 className="font-semibold">Data Science</h4>
                      <p className="text-sm text-blue-300">Préparation et analyse de données</p>
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
                      setActiveSection('sgbd');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'sgbd' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">SGBD et environnement</h2>
                
                <div className="mb-6">
                  <p className="mb-4">Un SGBD (Système de Gestion de Base de Données) est un logiciel qui permet de créer, maintenir et interroger une base de données. Chaque SGBD a ses particularités, mais tous implémentent le langage SQL standard avec quelques variations.</p>
                  
                  <h3 className="text-xl font-semibold mb-3">Les SGBD populaires</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle>PostgreSQL</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>SGBD open-source avancé, excellent pour les données complexes et l'analytique. Support complet des standards SQL.</p>
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
                        <CardTitle>MySQL</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>SGBD open-source populaire pour les applications web. Simple à utiliser et très répandu.</p>
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
                        <CardTitle>Oracle Database</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>Solution commerciale robuste pour les grandes entreprises. Performances et fiabilité exceptionnelles.</p>
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
                        <CardTitle>SQL Server</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>Solution Microsoft intégrée à leur écosystème. Excellent pour les entreprises utilisant des produits Microsoft.</p>
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
                        <CardTitle>SQLite</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>Base de données légère stockée dans un seul fichier. Idéale pour les applications mobiles et les prototypes.</p>
                        <div className="flex items-center mt-2 text-amber-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4" />
                          <Star className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Outils d'administration et d'interface</h3>
                  
                  <p className="mb-4">Pour travailler avec des bases de données SQL, vous aurez besoin d'outils :</p>
                  
                  <div className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold mb-2">Outils graphiques</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li><strong>pgAdmin</strong> : Interface d'administration pour PostgreSQL</li>
                      <li><strong>MySQL Workbench</strong> : Outil complet pour la conception et l'administration MySQL</li>
                      <li><strong>DBeaver</strong> : Outil universel compatible avec la plupart des SGBD</li>
                      <li><strong>DataGrip</strong> : IDE JetBrains pour bases de données (commercial)</li>
                      <li><strong>Azure Data Studio</strong> : Interface moderne pour SQL Server et autres SGBD</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold mb-2">Interfaces en ligne de commande</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li><strong>psql</strong> : Client en ligne de commande pour PostgreSQL</li>
                      <li><strong>mysql</strong> : Client CLI pour MySQL</li>
                      <li><strong>sqlplus</strong> : Interface en ligne de commande pour Oracle</li>
                      <li><strong>sqlcmd</strong> : Utilitaire de ligne de commande pour SQL Server</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold mb-2">Accès depuis les langages de programmation</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li><strong>Python</strong> : psycopg2 (PostgreSQL), sqlite3, SQLAlchemy (ORM)</li>
                      <li><strong>JavaScript/Node.js</strong> : pg, mysql2, sequelize (ORM)</li>
                      <li><strong>Java</strong> : JDBC, Hibernate (ORM)</li>
                      <li><strong>R</strong> : DBI, RPostgreSQL, RSQLite</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Types de données SQL</h3>
                  
                  <p className="mb-4">SQL prend en charge divers types de données, avec quelques variations selon le SGBD :</p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-900/50">
                          <th className="border border-blue-800 p-2 text-left">Catégorie</th>
                          <th className="border border-blue-800 p-2 text-left">Types</th>
                          <th className="border border-blue-800 p-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Numériques</td>
                          <td className="border border-blue-800 p-2"><code>INTEGER, BIGINT, SMALLINT, DECIMAL, NUMERIC, FLOAT, REAL</code></td>
                          <td className="border border-blue-800 p-2">Pour stocker des nombres entiers ou à virgule</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Chaînes</td>
                          <td className="border border-blue-800 p-2"><code>CHAR, VARCHAR, TEXT</code></td>
                          <td className="border border-blue-800 p-2">Pour stocker du texte de longueur fixe ou variable</td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Date/Heure</td>
                          <td className="border border-blue-800 p-2"><code>DATE, TIME, TIMESTAMP, INTERVAL</code></td>
                          <td className="border border-blue-800 p-2">Pour les dates, heures et durées</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Booléens</td>
                          <td className="border border-blue-800 p-2"><code>BOOLEAN</code></td>
                          <td className="border border-blue-800 p-2">Valeurs TRUE/FALSE</td>
                        </tr>
                        <tr className="bg-blue-900/20">
                          <td className="border border-blue-800 p-2">Binaires</td>
                          <td className="border border-blue-800 p-2"><code>BLOB, BYTEA, BINARY</code></td>
                          <td className="border border-blue-800 p-2">Pour stocker des données binaires</td>
                        </tr>
                        <tr className="bg-blue-900/30">
                          <td className="border border-blue-800 p-2">Spéciaux</td>
                          <td className="border border-blue-800 p-2"><code>JSON, XML, ARRAY, ENUM</code></td>
                          <td className="border border-blue-800 p-2">Types complexes (varient selon le SGBD)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Pratiquez maintenant</h3>
                  
                  <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <Microscope className="h-5 w-5 text-blue-400 mr-2" />
                      Exercice pratique
                    </h3>
                    <p className="text-blue-200 mb-3">Testez vos connaissances en exécutant une requête simple pour voir les bases de données disponibles :</p>
                    
                    <div className="mb-4">
                      <Textarea 
                        placeholder="Entrez votre requête SQL ici..." 
                        className="text-white bg-blue-950/50 border-blue-700 font-mono mb-2 h-20"
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={executeQuery}
                          disabled={isExecuting || !sqlQuery.trim()} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isExecuting ? 'Exécution...' : 'Exécuter la requête'}
                        </Button>
                      </div>
                      
                      {queryError && (
                        <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-800 text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erreur</AlertTitle>
                          <AlertDescription>{queryError}</AlertDescription>
                        </Alert>
                      )}

                      {showSuccess && (
                        <Alert className="mt-4 bg-green-950/50 border-green-800 text-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Succès</AlertTitle>
                          <AlertDescription>La requête a été exécutée avec succès !</AlertDescription>
                        </Alert>
                      )}
                      
                      {queryResult && !queryError && (
                        <div className="mt-4 bg-slate-900/70 rounded-lg p-4 border border-blue-800 overflow-x-auto">
                          <h4 className="font-semibold text-blue-300 mb-2">Résultat de la requête :</h4>
                          
                          {queryResult.columns && queryResult.rows && (
                            <table className="w-full border-collapse text-left text-sm">
                              <thead>
                                <tr className="bg-blue-900/50">
                                  {queryResult.columns.map((column: string, index: number) => (
                                    <th key={index} className="border border-blue-800 p-2">{column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResult.rows.map((row: any, rowIndex: number) => (
                                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-blue-900/20" : "bg-blue-900/30"}>
                                    {Object.values(row).map((value: any, colIndex: number) => (
                                      <td key={colIndex} className="border border-blue-800 p-2">
                                        {value !== null ? value.toString() : 'NULL'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          
                          {queryResult.message && (
                            <div className="text-green-400 font-mono">{queryResult.message}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-950/50 border border-blue-800 rounded-md p-3 mt-4">
                      <h4 className="text-blue-300 font-semibold mb-1">Exemples de requêtes à tester</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                        <li><code>SELECT version();</code> - Affiche la version de PostgreSQL</li>
                        <li><code>SELECT current_date, current_time;</code> - Affiche la date et l'heure actuelles</li>
                        <li><code>SELECT datname FROM pg_database;</code> - Liste toutes les bases de données</li>
                      </ul>
                    </div>
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
                      markSectionComplete('sgbd');
                      setActiveSection('select');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'select' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Requêtes SELECT</h2>
                
                <div className="mb-6">
                  <p className="mb-4">La commande <code>SELECT</code> est au cœur de SQL. Elle permet d'extraire des données d'une ou plusieurs tables. C'est la commande que vous utiliserez le plus souvent en tant qu'analyste de données.</p>
                  
                  <h3 className="text-xl font-semibold mb-3">Structure de base</h3>
                  
                  <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-4">
                    {`SELECT colonne1, colonne2, ... 
FROM table
[WHERE condition]
[ORDER BY colonne [ASC|DESC]]
[LIMIT nombre];`}
                  </SyntaxHighlighter>
                  
                  <div className="bg-blue-950/30 border border-blue-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold mb-2">Éléments clés de la requête SELECT</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li><strong>SELECT</strong> : détermine quelles colonnes sont retournées</li>
                      <li><strong>FROM</strong> : spécifie la table d'où proviennent les données</li>
                      <li><strong>WHERE</strong> : (optionnel) filtre les lignes selon des conditions</li>
                      <li><strong>ORDER BY</strong> : (optionnel) trie les résultats</li>
                      <li><strong>LIMIT</strong> : (optionnel) limite le nombre de résultats</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Exemples de requêtes SELECT simples</h3>
                  
                  <Accordion type="single" collapsible className="mb-6">
                    <AccordionItem value="select-all" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Sélectionner toutes les colonnes</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-2">
                          {`-- Récupère toutes les colonnes et lignes de la table 'employees'
SELECT * FROM employees;`}
                        </SyntaxHighlighter>
                        <p className="text-sm text-blue-200 mb-2">L'utilisation de l'astérisque <code>*</code> permet de sélectionner toutes les colonnes. Cependant, dans un contexte professionnel, il est généralement préférable de spécifier les colonnes exactes dont vous avez besoin pour des raisons de performance.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="select-columns" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Sélectionner des colonnes spécifiques</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-2">
                          {`-- Récupère uniquement les colonnes spécifiées
SELECT first_name, last_name, salary FROM employees;`}
                        </SyntaxHighlighter>
                        <p className="text-sm text-blue-200 mb-2">Cette requête ne sélectionne que les noms, prénoms et salaires des employés, ce qui est plus efficace que de demander toutes les colonnes.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="select-order" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Trier les résultats</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-2">
                          {`-- Trier les résultats par salaire décroissant
SELECT first_name, last_name, salary 
FROM employees 
ORDER BY salary DESC;

-- Tri sur plusieurs colonnes
SELECT first_name, last_name, department, salary 
FROM employees 
ORDER BY department ASC, salary DESC;`}
                        </SyntaxHighlighter>
                        <p className="text-sm text-blue-200 mb-2">L'ordre de tri par défaut est ascendant (ASC). Le second exemple trie d'abord par département puis par salaire décroissant au sein de chaque département.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="select-limit" className="border-blue-800">
                      <AccordionTrigger className="hover:bg-blue-800/20 px-4">Limiter le nombre de résultats</AccordionTrigger>
                      <AccordionContent className="bg-blue-950/30 px-4 py-2">
                        <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-2">
                          {`-- Récupérer les 5 employés les mieux payés
SELECT first_name, last_name, salary 
FROM employees 
ORDER BY salary DESC 
LIMIT 5;`}
                        </SyntaxHighlighter>
                        <p className="text-sm text-blue-200 mb-2">La clause LIMIT est particulièrement utile lorsque vous travaillez avec de grands ensembles de données ou que vous souhaitez simplement obtenir un échantillon des résultats.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <h3 className="text-xl font-semibold mb-3">Utilisation des alias</h3>
                  <p className="mb-4">Les alias vous permettent de renommer temporairement des colonnes ou des tables dans votre requête :</p>
                  
                  <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-4">
                    {`-- Alias de colonnes
SELECT 
  first_name AS prénom,
  last_name AS nom,
  salary AS salaire_annuel
FROM employees;

-- Alias de tables
SELECT e.first_name, e.last_name, d.department_name
FROM employees AS e
JOIN departments AS d ON e.department_id = d.id;`}
                  </SyntaxHighlighter>
                  
                  <div className="bg-blue-900/30 rounded-md p-4 mb-6">
                    <h4 className="font-semibold mb-2">Avantages des alias</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Rendent les résultats plus lisibles avec des noms de colonnes explicites</li>
                      <li>Simplifient les requêtes, surtout celles impliquant plusieurs tables</li>
                      <li>Évitent la répétition des noms de tables complets dans les requêtes complexes</li>
                      <li>Permettent d'utiliser des colonnes calculées de manière plus claire</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Colonnes calculées</h3>
                  <p className="mb-4">Vous pouvez effectuer des calculs directement dans vos requêtes :</p>
                  
                  <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-4">
                    {`-- Calculs arithmétiques
SELECT 
  first_name,
  last_name,
  salary,
  salary * 0.1 AS bonus,
  salary * 1.1 AS salary_with_bonus
FROM employees;

-- Concaténation de chaînes
SELECT 
  first_name || ' ' || last_name AS full_name,
  salary
FROM employees;

-- En MySQL, la concaténation utilise CONCAT()
SELECT 
  CONCAT(first_name, ' ', last_name) AS full_name,
  salary
FROM employees;`}
                  </SyntaxHighlighter>
                  
                  <h3 className="text-xl font-semibold mb-3">La clause DISTINCT</h3>
                  <p className="mb-4">DISTINCT permet d'éliminer les doublons des résultats :</p>
                  
                  <SyntaxHighlighter language="sql" style={vscDarkPlus} className="rounded-md mb-4">
                    {`-- Liste des départements (sans doublons)
SELECT DISTINCT department_id 
FROM employees;

-- Liste des combinaisons uniques de département et titre
SELECT DISTINCT department_id, job_title
FROM employees;`}
                  </SyntaxHighlighter>
                  
                  <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
                      Exercice pratique
                    </h3>
                    <p className="text-blue-200 mb-3">Pratiquez avec quelques requêtes SELECT sur notre base de données :</p>
                    
                    <div className="mb-4">
                      <Textarea 
                        placeholder="Entrez votre requête SQL ici..." 
                        className="text-white bg-blue-950/50 border-blue-700 font-mono mb-2 h-32"
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={executeQuery}
                          disabled={isExecuting || !sqlQuery.trim()} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isExecuting ? 'Exécution...' : 'Exécuter la requête'}
                        </Button>
                      </div>
                      
                      {queryError && (
                        <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-800 text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erreur</AlertTitle>
                          <AlertDescription>{queryError}</AlertDescription>
                        </Alert>
                      )}

                      {showSuccess && (
                        <Alert className="mt-4 bg-green-950/50 border-green-800 text-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Succès</AlertTitle>
                          <AlertDescription>La requête a été exécutée avec succès !</AlertDescription>
                        </Alert>
                      )}
                      
                      {queryResult && !queryError && (
                        <div className="mt-4 bg-slate-900/70 rounded-lg p-4 border border-blue-800 overflow-x-auto">
                          <h4 className="font-semibold text-blue-300 mb-2">Résultat de la requête :</h4>
                          
                          {queryResult.columns && queryResult.rows && (
                            <table className="w-full border-collapse text-left text-sm">
                              <thead>
                                <tr className="bg-blue-900/50">
                                  {queryResult.columns.map((column: string, index: number) => (
                                    <th key={index} className="border border-blue-800 p-2">{column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResult.rows.map((row: any, rowIndex: number) => (
                                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-blue-900/20" : "bg-blue-900/30"}>
                                    {Object.values(row).map((value: any, colIndex: number) => (
                                      <td key={colIndex} className="border border-blue-800 p-2">
                                        {value !== null ? value.toString() : 'NULL'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          
                          {queryResult.message && (
                            <div className="text-green-400 font-mono">{queryResult.message}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-950/50 border border-blue-800 rounded-md p-3 mt-4">
                      <h4 className="text-blue-300 font-semibold mb-1">Requêtes à essayer</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                        <li><code>SELECT * FROM pg_tables WHERE schemaname = 'public';</code> - Liste les tables de notre base</li>
                        <li><code>SELECT 'Hello' AS message, 42 AS number, NOW() AS current_time;</code> - Affiche des valeurs et calculs</li>
                        <li><code>SELECT DISTINCT tablename FROM pg_tables WHERE schemaname = 'public';</code> - Liste les noms de tables uniques</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('sgbd')}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  <Button 
                    onClick={() => {
                      markSectionComplete('select');
                      setActiveSection('filtres');
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
            {(activeSection !== 'introduction' && activeSection !== 'sgbd' && 
              activeSection !== 'select') && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Coffee className="h-16 w-16 text-blue-500 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Module en développement</h2>
                <p className="text-xl text-blue-300 mb-8 max-w-2xl">
                  La section sur {activeSection === 'filtres' ? 'le filtrage de données' : 
                                 activeSection === 'fonctions' ? 'les fonctions SQL' :
                                 activeSection === 'jointures' ? 'les jointures' :
                                 activeSection === 'groupements' ? 'les groupements et agrégats' :
                                 activeSection === 'modification' ? 'la modification de données' :
                                 activeSection === 'schema' ? 'le schéma et la structure' :
                                 activeSection === 'projet-final' ? 'le projet d\'analyse' : 'ce sujet'} 
                  est en cours de création et sera bientôt disponible.
                </p>
                <p className="text-md text-blue-200 mb-6">
                  Cette section couvrira des concepts importants comme 
                  {activeSection === 'filtres' ? ' les conditions WHERE, les opérateurs de comparaison, IN, BETWEEN, LIKE et les expressions régulières.' : 
                   activeSection === 'fonctions' ? ' les fonctions de chaîne, de date, numériques, et les fonctions d\'agrégation.' :
                   activeSection === 'jointures' ? ' les jointures INNER, LEFT, RIGHT, FULL et les auto-jointures.' :
                   activeSection === 'groupements' ? ' GROUP BY, HAVING, et les fonctions d\'agrégation avancées.' :
                   activeSection === 'modification' ? ' INSERT, UPDATE, DELETE et les transactions.' :
                   activeSection === 'schema' ? ' CREATE TABLE, ALTER TABLE, les contraintes et les index.' :
                   activeSection === 'projet-final' ? ' un projet d\'analyse de données complet avec SQL qui mettra en pratique tous les concepts du cours.' : 
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