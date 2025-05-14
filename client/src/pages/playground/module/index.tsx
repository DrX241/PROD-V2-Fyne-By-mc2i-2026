import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, BookOpen, Terminal, CheckSquare, Database, ChevronRight, Shield } from 'lucide-react';
import DOMPurify from 'dompurify';

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

// Fonction pour sanitizer et rendre du texte simple
function sanitizeText(text: string): string {
  if (!text) return '';
  const sanitized = DOMPurify.sanitize(text);
  return typeof sanitized === 'string' ? sanitized : '';
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<CustomModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
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
            <h3 className="text-xl font-medium font-rajdhani">Chargement du module...</h3>
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
            <h3 className="text-xl font-medium mb-2 font-rajdhani">Erreur de chargement</h3>
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

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
        <div className="absolute top-4 left-4 z-20">
          <Link href="/playground">
            <Button 
              variant="outline" 
              className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
        
        <div className="container py-12 px-4 mx-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg overflow-hidden shadow-xl border border-blue-800">
            {/* En-tête du module */}
            <div className="p-6 border-b border-blue-800">
              <h2 className="text-2xl md:text-3xl font-semibold text-white font-[Exo]">{module.iamName || module.title}</h2>
              <p className="text-blue-200 mt-2 font-[Rajdhani]">
                {module.description}
              </p>
              
              {module.contentStructure && (
                <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg mt-4">
                  <h3 className="font-medium text-blue-100 font-[Rajdhani]">Structure du module</h3>
                  <p className="text-sm text-blue-300 mt-2">
                    {module.contentStructure}
                  </p>
                </div>
              )}
            </div>
            
            {/* Système d'onglets */}
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 bg-blue-950/60 border-b border-blue-800 p-0 rounded-none">
                <TabsTrigger 
                  value="seFormer" 
                  className="data-[state=active]:bg-blue-900/30 hover:bg-blue-900/20 data-[state=active]:text-white text-blue-300 rounded-none border-r border-blue-800 py-3"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Se Former</span>
                  <span className="sm:hidden">Former</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sEntrainer" 
                  className="data-[state=active]:bg-blue-900/30 hover:bg-blue-900/20 data-[state=active]:text-white text-blue-300 rounded-none border-r border-blue-800 py-3"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">S'Entraîner</span>
                  <span className="sm:hidden">Entraîner</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sEvaluer" 
                  className="data-[state=active]:bg-blue-900/30 hover:bg-blue-900/20 data-[state=active]:text-white text-blue-300 rounded-none border-r border-blue-800 py-3"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">S'Évaluer</span>
                  <span className="sm:hidden">Évaluer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="automatiser" 
                  className="data-[state=active]:bg-blue-900/30 hover:bg-blue-900/20 data-[state=active]:text-white text-blue-300 rounded-none py-3"
                >
                  <Database className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Automatiser</span>
                  <span className="sm:hidden">Auto</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Onglet Se Former */}
              <TabsContent value="seFormer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <BookOpen className="text-blue-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white font-[Rajdhani]">Se Former</h2>
                  </div>
                  
                  {module.seFormer?.description && (
                    <p className="text-blue-200 mb-6 font-[Rajdhani]">{module.seFormer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-4">
                      {module.seFormer?.content && (
                        <div className="text-blue-100 whitespace-pre-line">
                          {sanitizeText(module.seFormer.content)}
                        </div>
                      )}
                      
                      {module.seFormer?.modules && module.seFormer.modules.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold text-white mb-4 font-[Rajdhani]">Modules d'apprentissage</h3>
                          <div className="space-y-3">
                            {module.seFormer.modules.map((item, index) => (
                              <div key={index} className="bg-blue-900/40 border border-blue-700 rounded-lg p-4 hover:bg-blue-900/50 transition-colors">
                                <div className="flex items-start">
                                  <div className="bg-blue-800/50 p-2 rounded mr-3 flex-shrink-0">
                                    <BookOpen className="h-5 w-5 text-blue-300" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium font-[Rajdhani]">{item.title}</h4>
                                    {item.description && (
                                      <p className="text-blue-200 text-sm mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="ml-auto text-blue-400 h-5 w-5 flex-shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet S'Entraîner */}
              <TabsContent value="sEntrainer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Terminal className="text-green-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white font-[Rajdhani]">S'Entraîner</h2>
                  </div>
                  
                  {module.sEntrainer?.description && (
                    <p className="text-blue-200 mb-6 font-[Rajdhani]">{module.sEntrainer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-4">
                      {module.sEntrainer?.content && (
                        <div className="text-blue-100 whitespace-pre-line">
                          {sanitizeText(module.sEntrainer.content)}
                        </div>
                      )}
                      
                      {module.sEntrainer?.exercices && module.sEntrainer.exercices.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold text-white mb-4 font-[Rajdhani]">Exercices pratiques</h3>
                          <div className="space-y-3">
                            {module.sEntrainer.exercices.map((exercice, index) => (
                              <div key={index} className="bg-blue-900/40 border border-blue-700 rounded-lg p-4 hover:bg-blue-900/50 transition-colors">
                                <div className="flex items-start">
                                  <div className="bg-green-800/50 p-2 rounded mr-3 flex-shrink-0">
                                    <Terminal className="h-5 w-5 text-green-300" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium font-[Rajdhani]">{exercice.title}</h4>
                                    {exercice.description && (
                                      <p className="text-blue-200 text-sm mt-1">{exercice.description}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="ml-auto text-green-400 h-5 w-5 flex-shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet S'Évaluer */}
              <TabsContent value="sEvaluer" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <CheckSquare className="text-amber-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white font-[Rajdhani]">S'Évaluer</h2>
                  </div>
                  
                  {module.sEvaluer?.description && (
                    <p className="text-blue-200 mb-6 font-[Rajdhani]">{module.sEvaluer.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-4">
                      {module.sEvaluer?.content && (
                        <div className="text-blue-100 whitespace-pre-line">
                          {sanitizeText(module.sEvaluer.content)}
                        </div>
                      )}
                      
                      {module.sEvaluer?.objectives && module.sEvaluer.objectives.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold text-white mb-4 font-[Rajdhani]">Objectifs d'évaluation</h3>
                          <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-5">
                            <ul className="space-y-3">
                              {module.sEvaluer.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckSquare className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-blue-100">{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Onglet Automatiser */}
              <TabsContent value="automatiser" className="p-0 m-0">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Database className="text-purple-400 h-6 w-6 mr-3" />
                    <h2 className="text-2xl font-bold text-white font-[Rajdhani]">Automatiser</h2>
                  </div>
                  
                  {module.automatiser?.description && (
                    <p className="text-blue-200 mb-6 font-[Rajdhani]">{module.automatiser.description}</p>
                  )}
                  
                  <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                    <div className="space-y-4">
                      {module.automatiser?.content && (
                        <div className="text-blue-100 whitespace-pre-line">
                          {sanitizeText(module.automatiser.content)}
                        </div>
                      )}
                      
                      {module.automatiser?.tools && module.automatiser.tools.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold text-white mb-4 font-[Rajdhani]">Outils d'automatisation</h3>
                          <div className="space-y-3">
                            {module.automatiser.tools.map((tool, index) => (
                              <div key={index} className="bg-blue-900/40 border border-blue-700 rounded-lg p-4 hover:bg-blue-900/50 transition-colors">
                                <div className="flex items-start">
                                  <div className="bg-purple-800/50 p-2 rounded mr-3 flex-shrink-0">
                                    <Database className="h-5 w-5 text-purple-300" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium font-[Rajdhani]">{tool.name}</h4>
                                    {tool.description && (
                                      <p className="text-blue-200 text-sm mt-1">{tool.description}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="ml-auto text-purple-400 h-5 w-5 flex-shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Pied de page */}
            <div className="p-6 border-t border-blue-800 flex justify-between">
              <Button 
                variant="outline" 
                className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Continuer la formation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}