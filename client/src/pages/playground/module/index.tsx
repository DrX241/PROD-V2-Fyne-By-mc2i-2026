import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, BookOpen, Terminal, CheckSquare, Database, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import HomeLayout from '@/components/layout/HomeLayout';
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

// Badge de difficulté
function renderDifficultyBadge(difficulty: string) {
  const difficultyMap: Record<string, { bg: string, text: string, label: string }> = {
    'beginner': { 
      bg: 'bg-green-600', 
      text: 'text-white',
      label: 'Débutant'
    },
    'débutant': { 
      bg: 'bg-green-600', 
      text: 'text-white',
      label: 'Débutant'
    },
    'intermediate': { 
      bg: 'bg-blue-600', 
      text: 'text-white',
      label: 'Intermédiaire'
    },
    'intermédiaire': { 
      bg: 'bg-blue-600', 
      text: 'text-white',
      label: 'Intermédiaire'
    },
    'advanced': { 
      bg: 'bg-purple-600', 
      text: 'text-white',
      label: 'Avancé'
    },
    'avancé': { 
      bg: 'bg-purple-600', 
      text: 'text-white',
      label: 'Avancé'
    }
  };

  const diffInfo = difficultyMap[difficulty?.toLowerCase()] || { 
    bg: 'bg-gray-600', 
    text: 'text-white',
    label: 'Tous niveaux'
  };

  return (
    <Badge variant="secondary" className={`${diffInfo.bg} ${diffInfo.text} px-2 py-1`}>
      {diffInfo.label}
    </Badge>
  );
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<CustomModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("seFormer");
  const [highContrastMode] = useState(false); // Option pour un mode haut contraste

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

  // Récupérer l'icône en fonction du domaine
  const getDomainIcon = () => {
    const domain = module.domain?.toLowerCase() || '';
    
    if (domain.includes('cyber') || domain.includes('hack') || domain.includes('security')) {
      return <Shield className="h-6 w-6 text-white" />;
    } else if (domain.includes('data') || domain.includes('analytics') || domain.includes('ia')) {
      return <Database className="h-6 w-6 text-white" />;
    } else {
      return <Shield className="h-6 w-6 text-white" />;
    }
  };

  // Récupérer le gradient en fonction du domaine
  const getDomainGradient = () => {
    const domain = module.domain?.toLowerCase() || '';
    
    if (domain.includes('cyber') || domain.includes('hack') || domain.includes('security')) {
      return 'from-blue-700 to-blue-900';
    } else if (domain.includes('data') || domain.includes('analytics') || domain.includes('ia')) {
      return 'from-indigo-700 to-indigo-900';
    } else if (domain.includes('client') || domain.includes('amoa') || domain.includes('projet')) {
      return 'from-green-700 to-green-900';
    } else {
      return 'from-purple-700 to-purple-900';
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-16">
        <div className="relative container mx-auto px-4 pt-10">
          {/* Bouton retour */}
          <div className="mb-10">
            <Link href="/playground">
              <Button 
                variant="outline" 
                className="bg-gray-800/60 border-gray-700 text-white hover:bg-gray-700/60 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>

          {/* En-tête du module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`w-full rounded-xl p-8 shadow-xl mb-10 bg-gradient-to-br ${getDomainGradient()}`}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className={`p-4 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/10'} self-start hidden md:block`}>
                {getDomainIcon()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 md:hidden">
                  <div className={`p-3 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/10'}`}>
                    {getDomainIcon()}
                  </div>
                  <h1 className="text-2xl font-extrabold text-white font-exo tracking-wide">{module.iamName || module.title}</h1>
                </div>
                <h1 className="text-3xl font-extrabold text-white font-exo tracking-wide hidden md:block mb-3">{module.iamName || module.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {renderDifficultyBadge(module.difficulty)}
                  <Badge variant="secondary" className="bg-white/20 text-white px-2 py-1">
                    {module.domain}
                  </Badge>
                </div>
                <p className="text-lg text-white/90 mb-5 max-w-4xl">{module.description}</p>
                
                {module.contentStructure && (
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h3 className="font-medium text-white mb-2">Structure du module</h3>
                    <p className="text-white/80">{module.contentStructure}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Système d'onglets */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-8 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden p-0">
              <TabsTrigger 
                value="seFormer" 
                className="data-[state=active]:bg-blue-900/60 rounded-none border-r border-gray-700 py-3 px-3"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Se Former</span>
                <span className="sm:hidden">Former</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sEntrainer" 
                className="data-[state=active]:bg-green-900/60 rounded-none border-r border-gray-700 py-3 px-3"
              >
                <Terminal className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">S'Entraîner</span>
                <span className="sm:hidden">Entraîner</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sEvaluer" 
                className="data-[state=active]:bg-amber-900/60 rounded-none border-r border-gray-700 py-3 px-3"
              >
                <CheckSquare className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">S'Évaluer</span>
                <span className="sm:hidden">Évaluer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="automatiser" 
                className="data-[state=active]:bg-purple-900/60 rounded-none py-3 px-3"
              >
                <Database className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Automatiser</span>
                <span className="sm:hidden">Auto</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu des sections */}
            <TabsContent value="seFormer" className="mt-0">
              <div className="space-y-6">
                {/* En-tête de section */}
                <div className={`p-6 rounded-xl border shadow-lg bg-gradient-to-br from-blue-700 to-blue-900 border-blue-600`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-exo">Se Former</h2>
                      {module.seFormer?.description && (
                        <p className="text-blue-100 mt-1">{module.seFormer.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Colonne gauche pour le texte */}
                  <div className="md:col-span-2">
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Contenu du module</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          {module.seFormer?.content ? (
                            <div className="text-gray-200 whitespace-pre-line">
                              {sanitizeText(module.seFormer.content)}
                            </div>
                          ) : (
                            <p className="text-gray-400">Aucun contenu disponible pour cette section.</p>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne droite pour les modules d'apprentissage */}
                  <div>
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white">Modules d'apprentissage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-4">
                            {module.seFormer?.modules && module.seFormer.modules.length > 0 ? (
                              module.seFormer.modules.map((item, index) => (
                                <div 
                                  key={index} 
                                  className="p-4 rounded-lg bg-blue-900/30 border border-blue-700/50 hover:bg-blue-900/40 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start">
                                    <div className="bg-blue-800/70 p-2 rounded-lg mr-3 flex-shrink-0">
                                      <BookOpen className="h-4 w-4 text-blue-200" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">{item.title}</h4>
                                      {item.description && (
                                        <p className="text-blue-200 text-sm mt-1">{item.description}</p>
                                      )}
                                    </div>
                                    <ChevronRight className="ml-auto text-blue-300 h-5 w-5 flex-shrink-0" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400">Aucun module d'apprentissage disponible.</p>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET S'ENTRAÎNER */}
            <TabsContent value="sEntrainer" className="mt-0">
              <div className="space-y-6">
                {/* En-tête de section */}
                <div className={`p-6 rounded-xl border shadow-lg bg-gradient-to-br from-green-700 to-green-900 border-green-600`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <Terminal className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-exo">S'Entraîner</h2>
                      {module.sEntrainer?.description && (
                        <p className="text-green-100 mt-1">{module.sEntrainer.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Colonne gauche pour le texte */}
                  <div className="md:col-span-2">
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Exercices et pratiques</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          {module.sEntrainer?.content ? (
                            <div className="text-gray-200 whitespace-pre-line">
                              {sanitizeText(module.sEntrainer.content)}
                            </div>
                          ) : (
                            <p className="text-gray-400">Aucun contenu disponible pour cette section.</p>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne droite pour les exercices */}
                  <div>
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white">Exercices pratiques</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-4">
                            {module.sEntrainer?.exercices && module.sEntrainer.exercices.length > 0 ? (
                              module.sEntrainer.exercices.map((item, index) => (
                                <div 
                                  key={index} 
                                  className="p-4 rounded-lg bg-green-900/30 border border-green-700/50 hover:bg-green-900/40 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start">
                                    <div className="bg-green-800/70 p-2 rounded-lg mr-3 flex-shrink-0">
                                      <Terminal className="h-4 w-4 text-green-200" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">{item.title}</h4>
                                      {item.description && (
                                        <p className="text-green-200 text-sm mt-1">{item.description}</p>
                                      )}
                                    </div>
                                    <ChevronRight className="ml-auto text-green-300 h-5 w-5 flex-shrink-0" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400">Aucun exercice pratique disponible.</p>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET S'ÉVALUER */}
            <TabsContent value="sEvaluer" className="mt-0">
              <div className="space-y-6">
                {/* En-tête de section */}
                <div className={`p-6 rounded-xl border shadow-lg bg-gradient-to-br from-amber-700 to-amber-900 border-amber-600`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <CheckSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-exo">S'Évaluer</h2>
                      {module.sEvaluer?.description && (
                        <p className="text-amber-100 mt-1">{module.sEvaluer.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Colonne gauche pour le texte */}
                  <div className="md:col-span-2">
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Évaluations et quiz</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          {module.sEvaluer?.content ? (
                            <div className="text-gray-200 whitespace-pre-line">
                              {sanitizeText(module.sEvaluer.content)}
                            </div>
                          ) : (
                            <p className="text-gray-400">Aucun contenu disponible pour cette section.</p>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne droite pour les objectifs d'évaluation */}
                  <div>
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white">Objectifs d'évaluation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          {module.sEvaluer?.objectives && module.sEvaluer.objectives.length > 0 ? (
                            <div className="space-y-3">
                              {module.sEvaluer.objectives.map((objective, index) => (
                                <div 
                                  key={index} 
                                  className="p-4 rounded-lg bg-amber-900/30 border border-amber-700/50"
                                >
                                  <div className="flex items-start">
                                    <div className="bg-amber-800/70 p-2 rounded-lg mr-3 flex-shrink-0">
                                      <CheckSquare className="h-4 w-4 text-amber-200" />
                                    </div>
                                    <div>
                                      <p className="text-white">{objective}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400">Aucun objectif d'évaluation disponible.</p>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET AUTOMATISER */}
            <TabsContent value="automatiser" className="mt-0">
              <div className="space-y-6">
                {/* En-tête de section */}
                <div className={`p-6 rounded-xl border shadow-lg bg-gradient-to-br from-purple-700 to-purple-900 border-purple-600`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-exo">Automatiser</h2>
                      {module.automatiser?.description && (
                        <p className="text-purple-100 mt-1">{module.automatiser.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Colonne gauche pour le texte */}
                  <div className="md:col-span-2">
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Outils et automatisation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          {module.automatiser?.content ? (
                            <div className="text-gray-200 whitespace-pre-line">
                              {sanitizeText(module.automatiser.content)}
                            </div>
                          ) : (
                            <p className="text-gray-400">Aucun contenu disponible pour cette section.</p>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne droite pour les outils */}
                  <div>
                    <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
                      <CardHeader>
                        <CardTitle className="text-white">Outils d'automatisation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-4">
                            {module.automatiser?.tools && module.automatiser.tools.length > 0 ? (
                              module.automatiser.tools.map((tool, index) => (
                                <div 
                                  key={index} 
                                  className="p-4 rounded-lg bg-purple-900/30 border border-purple-700/50 hover:bg-purple-900/40 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start">
                                    <div className="bg-purple-800/70 p-2 rounded-lg mr-3 flex-shrink-0">
                                      <Database className="h-4 w-4 text-purple-200" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">{tool.name}</h4>
                                      {tool.description && (
                                        <p className="text-purple-200 text-sm mt-1">{tool.description}</p>
                                      )}
                                    </div>
                                    <ChevronRight className="ml-auto text-purple-300 h-5 w-5 flex-shrink-0" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400">Aucun outil d'automatisation disponible.</p>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Navigation entre sections */}
          <div className="flex justify-between mt-12">
            <Button 
              variant="outline" 
              className="bg-gray-800/60 border-gray-700 text-white hover:bg-gray-700/60"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={() => window.location.href = '/playground'}
            >
              Continuer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}