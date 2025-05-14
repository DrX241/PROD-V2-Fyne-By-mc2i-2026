import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, BookOpen, Terminal, CheckSquare, Database, Lightbulb, Shield, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Interface pour les sections du module
interface ModuleSection {
  title?: string;
  description?: string;
  content?: string;
  modules?: Array<{
    title: string;
    description?: string;
  }>;
  exercices?: Array<{
    title: string;
    description?: string;
  }>;
  tools?: Array<{
    name: string;
    description?: string;
  }>;
  objectives?: string[];
}

// Interface pour le module complet
interface CustomModule {
  id?: number;
  title?: string;
  iamName?: string;
  description?: string;
  domain?: string;
  difficulty?: string;
  seFormer?: ModuleSection;
  sEntrainer?: ModuleSection;
  sEvaluer?: ModuleSection;
  automatiser?: ModuleSection;
  contentStructure?: string;
  moduleData?: any;
}

// Rendu du contenu markdown
function renderMarkdown(content: string): string {
  if (!content) return '';
  const sanitizedContent = DOMPurify.sanitize(marked.parse(content));
  return sanitizedContent;
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<CustomModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("seFormer");

  useEffect(() => {
    async function fetchModuleData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/module-generator/modules/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération du module: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.module) {
          // Si moduleData est un objet, utiliser celui-ci pour les sections
          if (data.module.moduleData) {
            setModule({
              id: data.module.id,
              title: data.module.moduleData.title || data.module.iamName,
              iamName: data.module.iamName,
              description: data.module.moduleData.description || data.module.description,
              domain: data.module.domain,
              difficulty: data.module.difficulty,
              seFormer: data.module.moduleData.seFormer,
              sEntrainer: data.module.moduleData.sEntrainer,
              sEvaluer: data.module.moduleData.sEvaluer,
              automatiser: data.module.moduleData.automatiser,
              contentStructure: data.module.moduleData.contentStructure,
            });
          } else {
            setModule(data.module);
          }
        } else {
          throw new Error('Le format des données du module est invalide');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
        setError(errorMessage);
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchModuleData();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium">Chargement du module...</h3>
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (error || !module) {
    return (
      <HomeLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Impossible de charger le module demandé"}</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Déterminer les couleurs en fonction du domaine
  const getDomainColors = () => {
    const domain = module.domain?.toLowerCase() || '';
    
    if (domain.includes('cyber') || domain.includes('hack') || domain.includes('security')) {
      return {
        bgGradient: 'from-blue-950 to-slate-950',
        borderColor: 'border-blue-800',
        textColor: 'text-blue-400',
        tabBgActive: 'bg-blue-900/30',
        tabBgHover: 'hover:bg-blue-900/20',
      };
    } else if (domain.includes('data') || domain.includes('analytics') || domain.includes('ia')) {
      return {
        bgGradient: 'from-indigo-950 to-slate-950',
        borderColor: 'border-indigo-800',
        textColor: 'text-indigo-400',
        tabBgActive: 'bg-indigo-900/30',
        tabBgHover: 'hover:bg-indigo-900/20',
      };
    } else if (domain.includes('client') || domain.includes('amoa') || domain.includes('projet')) {
      return {
        bgGradient: 'from-green-950 to-slate-950',
        borderColor: 'border-green-800',
        textColor: 'text-green-400',
        tabBgActive: 'bg-green-900/30',
        tabBgHover: 'hover:bg-green-900/20',
      };
    } else {
      return {
        bgGradient: 'from-purple-950 to-slate-950',
        borderColor: 'border-purple-800',
        textColor: 'text-purple-400',
        tabBgActive: 'bg-purple-900/30',
        tabBgHover: 'hover:bg-purple-900/20',
      };
    }
  };

  const colors = getDomainColors();

  return (
    <HomeLayout>
      <div className={`min-h-[calc(100vh-64px)] bg-gradient-to-b ${colors.bgGradient} pb-12`}>
        <div className="container mx-auto px-4 py-8">
          {/* En-tête du module */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/playground">
                <Button 
                  variant="outline" 
                  className={`${isDark ? 'bg-gray-900/40' : 'bg-gray-900/20'} border-gray-700 text-white hover:bg-gray-800/40`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-[Exo] tracking-wide">
              {module.iamName || module.title}
            </h1>
            
            <div className="flex items-center mt-3 flex-wrap gap-2">
              <Badge className="bg-blue-900/50 text-blue-200 hover:bg-blue-800/50 border border-blue-700/50">
                {module.difficulty === 'beginner' ? 'Débutant' : 
                 module.difficulty === 'intermediate' ? 'Intermédiaire' : 
                 module.difficulty === 'advanced' ? 'Avancé' : 
                 'Tous niveaux'}
              </Badge>
              <Badge className="bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 border border-purple-700/50">
                {module.domain}
              </Badge>
            </div>
            
            <p className="text-gray-300 mt-4 max-w-3xl">
              {module.description}
            </p>
            
            {module.contentStructure && (
              <div className={`mt-6 p-4 rounded-md bg-slate-900/50 border ${colors.borderColor}`}>
                <h3 className="font-semibold text-white mb-2">Structure du module</h3>
                <p className="text-gray-300">{module.contentStructure}</p>
              </div>
            )}
          </div>
          
          {/* Système d'onglets */}
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="max-w-4xl mx-auto"
          >
            <TabsList className={`grid grid-cols-4 mb-8 bg-slate-900/30 border ${colors.borderColor}`}>
              <TabsTrigger 
                value="seFormer" 
                className={`data-[state=active]:${colors.tabBgActive} ${colors.tabBgHover} data-[state=active]:text-white text-gray-300`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Se Former</span>
                <span className="sm:hidden">Former</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sEntrainer" 
                className={`data-[state=active]:${colors.tabBgActive} ${colors.tabBgHover} data-[state=active]:text-white text-gray-300`}
              >
                <Terminal className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">S'Entraîner</span>
                <span className="sm:hidden">Entraîner</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sEvaluer" 
                className={`data-[state=active]:${colors.tabBgActive} ${colors.tabBgHover} data-[state=active]:text-white text-gray-300`}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">S'Évaluer</span>
                <span className="sm:hidden">Évaluer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="automatiser" 
                className={`data-[state=active]:${colors.tabBgActive} ${colors.tabBgHover} data-[state=active]:text-white text-gray-300`}
              >
                <Database className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Automatiser</span>
                <span className="sm:hidden">Auto</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu des onglets */}
            <div className="bg-slate-900/30 rounded-lg border border-gray-800 overflow-hidden">
              {/* Onglet Se Former */}
              <TabsContent value="seFormer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <BookOpen className={`${colors.textColor} h-6 w-6 mr-3`} />
                    <h2 className="text-2xl font-bold text-white">Se Former</h2>
                  </div>
                  
                  {module.seFormer?.description && (
                    <p className="text-gray-300 mb-6">{module.seFormer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    {module.seFormer?.content && (
                      <div 
                        className="prose prose-invert max-w-none prose-headings:text-blue-300 prose-a:text-blue-400 prose-strong:text-white prose-code:bg-slate-800 prose-code:text-blue-300"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(module.seFormer.content) }}
                      />
                    )}
                    
                    {module.seFormer?.modules && module.seFormer.modules.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Modules d'apprentissage</h3>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {module.seFormer.modules.map((item, index) => (
                            <Card key={index} className="bg-slate-800/50 border-gray-700 hover:border-blue-700/50 transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex items-start">
                                  <Lightbulb className="h-5 w-5 text-blue-400 mt-1 mr-2 flex-shrink-0" />
                                  <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                </div>
                              </CardHeader>
                              {item.description && (
                                <CardContent>
                                  <p className="text-gray-300 text-sm">{item.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet S'Entraîner */}
              <TabsContent value="sEntrainer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Terminal className="text-green-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white">S'Entraîner</h2>
                  </div>
                  
                  {module.sEntrainer?.description && (
                    <p className="text-gray-300 mb-6">{module.sEntrainer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    {module.sEntrainer?.content && (
                      <div 
                        className="prose prose-invert max-w-none prose-headings:text-green-300 prose-a:text-green-400 prose-strong:text-white prose-code:bg-slate-800 prose-code:text-green-300"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(module.sEntrainer.content) }}
                      />
                    )}
                    
                    {module.sEntrainer?.exercices && module.sEntrainer.exercices.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Exercices pratiques</h3>
                        <div className="space-y-4">
                          {module.sEntrainer.exercices.map((exercice, index) => (
                            <Card key={index} className="bg-slate-800/50 border-gray-700 hover:border-green-700/50 transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex items-start">
                                  <Terminal className="h-5 w-5 text-green-400 mt-1 mr-2 flex-shrink-0" />
                                  <CardTitle className="text-lg text-white">{exercice.title}</CardTitle>
                                </div>
                              </CardHeader>
                              {exercice.description && (
                                <CardContent>
                                  <p className="text-gray-300 text-sm">{exercice.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet S'Évaluer */}
              <TabsContent value="sEvaluer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <CheckSquare className="text-amber-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white">S'Évaluer</h2>
                  </div>
                  
                  {module.sEvaluer?.description && (
                    <p className="text-gray-300 mb-6">{module.sEvaluer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    {module.sEvaluer?.content && (
                      <div 
                        className="prose prose-invert max-w-none prose-headings:text-amber-300 prose-a:text-amber-400 prose-strong:text-white prose-code:bg-slate-800 prose-code:text-amber-300"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(module.sEvaluer.content) }}
                      />
                    )}
                    
                    {module.sEvaluer?.objectives && module.sEvaluer.objectives.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Objectifs d'évaluation</h3>
                        <div className="bg-slate-800/50 border border-gray-700 rounded-lg p-4">
                          <ul className="space-y-2">
                            {module.sEvaluer.objectives.map((objective, index) => (
                              <li key={index} className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-200">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet Automatiser */}
              <TabsContent value="automatiser" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Database className="text-purple-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Automatiser</h2>
                  </div>
                  
                  {module.automatiser?.description && (
                    <p className="text-gray-300 mb-6">{module.automatiser.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    {module.automatiser?.content && (
                      <div 
                        className="prose prose-invert max-w-none prose-headings:text-purple-300 prose-a:text-purple-400 prose-strong:text-white prose-code:bg-slate-800 prose-code:text-purple-300"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(module.automatiser.content) }}
                      />
                    )}
                    
                    {module.automatiser?.tools && module.automatiser.tools.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Outils d'automatisation</h3>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {module.automatiser.tools.map((tool, index) => (
                            <Card key={index} className="bg-slate-800/50 border-gray-700 hover:border-purple-700/50 transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex items-start">
                                  <BrainCircuit className="h-5 w-5 text-purple-400 mt-1 mr-2 flex-shrink-0" />
                                  <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                                </div>
                              </CardHeader>
                              {tool.description && (
                                <CardContent>
                                  <p className="text-gray-300 text-sm">{tool.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}