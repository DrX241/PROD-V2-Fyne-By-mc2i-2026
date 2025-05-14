import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Terminal, CheckCircle, Database, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  const sanitized = DOMPurify.sanitize(text);
  return typeof sanitized === 'string' ? sanitized : '';
}

// Pour convertir la difficulté en texte français
function difficultyText(difficulty: string): string {
  const map: Record<string, string> = {
    'beginner': 'Débutant',
    'intermediate': 'Intermédiaire',
    'advanced': 'Avancé'
  };
  return map[difficulty?.toLowerCase()] || 'Tous niveaux';
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<CustomModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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

  // Afficher le détail d'une section spécifique
  const renderSectionDetail = () => {
    if (!selectedSection || !module) return null;

    const sectionData: ModuleSection = module[selectedSection as keyof CustomModule] as ModuleSection;
    if (!sectionData) return null;

    const getSectionColor = (section: string) => {
      switch(section) {
        case 'seFormer': return 'bg-blue-700';
        case 'sEntrainer': return 'bg-indigo-700';
        case 'sEvaluer': return 'bg-purple-700';
        case 'automatiser': return 'bg-teal-700';
        default: return 'bg-gray-700';
      }
    };

    const getSectionIcon = (section: string) => {
      switch(section) {
        case 'seFormer': return <BookOpen className="h-6 w-6 text-white" />;
        case 'sEntrainer': return <Terminal className="h-6 w-6 text-white" />;
        case 'sEvaluer': return <CheckCircle className="h-6 w-6 text-white" />;
        case 'automatiser': return <Database className="h-6 w-6 text-white" />;
        default: return null;
      }
    };

    const getSectionTitle = (section: string) => {
      switch(section) {
        case 'seFormer': return 'SE FORMER';
        case 'sEntrainer': return 'S\'ENTRAÎNER';
        case 'sEvaluer': return 'S\'ÉVALUER';
        case 'automatiser': return 'AUTOMATISER';
        default: return section;
      }
    };

    return (
      <div className="mt-8">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline"
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
            onClick={() => setSelectedSection(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className={`p-6 rounded-lg ${getSectionColor(selectedSection)} mb-6`}>
          <div className="flex items-center">
            <div className="bg-white/10 p-3 rounded-md mr-4">
              {getSectionIcon(selectedSection)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{getSectionTitle(selectedSection)}</h2>
              {sectionData.description && (
                <p className="text-white/80 mt-1">{sectionData.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="text-white">
            {sectionData.content && (
              <div className="mb-6 whitespace-pre-line">
                {sanitizeText(sectionData.content)}
              </div>
            )}

            {selectedSection === 'seFormer' && sectionData.modules && sectionData.modules.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Modules d'apprentissage</h3>
                <div className="space-y-3">
                  {sectionData.modules.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg bg-blue-900/30 border border-blue-700/50 hover:bg-blue-800/40 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-800/70 p-2 rounded-lg mr-3">
                          <BookOpen className="h-5 w-5 text-blue-200" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{item.title}</h4>
                          {item.description && (
                            <p className="text-blue-200 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === 'sEntrainer' && sectionData.exercices && sectionData.exercices.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Exercices pratiques</h3>
                <div className="space-y-3">
                  {sectionData.exercices.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg bg-indigo-900/30 border border-indigo-700/50 hover:bg-indigo-800/40 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-indigo-800/70 p-2 rounded-lg mr-3">
                          <Terminal className="h-5 w-5 text-indigo-200" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{item.title}</h4>
                          {item.description && (
                            <p className="text-indigo-200 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === 'sEvaluer' && sectionData.objectives && sectionData.objectives.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Objectifs d'évaluation</h3>
                <div className="space-y-3">
                  {sectionData.objectives.map((objective, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg bg-purple-900/30 border border-purple-700/50"
                    >
                      <div className="flex items-start">
                        <div className="bg-purple-800/70 p-2 rounded-lg mr-3 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-purple-200" />
                        </div>
                        <p className="text-white">{objective}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === 'automatiser' && sectionData.tools && sectionData.tools.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Outils d'automatisation</h3>
                <div className="space-y-3">
                  {sectionData.tools.map((tool, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg bg-teal-900/30 border border-teal-700/50 hover:bg-teal-800/40 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-teal-800/70 p-2 rounded-lg mr-3">
                          <Database className="h-5 w-5 text-teal-200" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{tool.name}</h4>
                          {tool.description && (
                            <p className="text-teal-200 text-sm mt-1">{tool.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
            onClick={() => setSelectedSection(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            onClick={() => window.location.href = '/playground'}
          >
            <span>Continuer</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
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

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black pb-16">
        <div className="container mx-auto px-4 pt-10">
          {/* Navigation et actions */}
          <div className="mb-10 flex justify-between items-center">
            <Link href="/playground">
              <Button 
                variant="outline" 
                className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            
            {/* Bouton de suppression pour les modules personnalisés */}
            {module && module.id && Number(module.id) > 6 && (
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce module personnalisé ?")) {
                    try {
                      const response = await fetch(`/api/module-generator/modules/${module.id}`, {
                        method: 'DELETE',
                      });
                      
                      if (response.ok) {
                        toast({
                          title: "Module supprimé",
                          description: "Le module personnalisé a été supprimé avec succès.",
                        });
                        window.location.href = '/playground';
                      } else {
                        throw new Error("Erreur lors de la suppression du module");
                      }
                    } catch (err) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de supprimer le module.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ce module personnalisé
              </Button>
            )}
          </div>

          {/* Titre central du style I AM CYBER */}
          {!selectedSection && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl font-bold mb-4 text-white">
                {module.iamName || module.title}
              </h1>
              <p className="max-w-3xl mx-auto text-xl text-blue-200">
                {module.description}
              </p>
            </motion.div>
          )}

          {/* Afficher soit la grille des 4 sections, soit le détail d'une section */}
          {!selectedSection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Section SE FORMER */}
              <Card 
                className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-blue-700 to-blue-900 border-0"
                onClick={() => module.seFormer && setSelectedSection('seFormer')}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-white/10">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      SE FORMER
                    </h2>
                  </div>
                  
                  <p className="mb-6 text-blue-100">
                    {module.seFormer?.description || 
                    'Acquérir des connaissances théoriques et comprendre les concepts fondamentaux'}
                  </p>
                  
                  {module.seFormer?.modules && module.seFormer.modules.length > 0 && (
                    <div className="mt-auto">
                      <h3 className="text-white font-medium mb-3">Modules recommandés:</h3>
                      <ul className="space-y-3">
                        {module.seFormer.modules.slice(0, 3).map((item, index) => (
                          <li key={index}>
                            <div className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{item.title}</span>
                                <ArrowRight className="h-5 w-5" />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Section S'ENTRAÎNER */}
              <Card 
                className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-indigo-700 to-indigo-900 border-0"
                onClick={() => module.sEntrainer && setSelectedSection('sEntrainer')}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-white/10">
                      <Terminal className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      S'ENTRAÎNER
                    </h2>
                  </div>
                  
                  <p className="mb-6 text-indigo-100">
                    {module.sEntrainer?.description || 
                    'Mettre en pratique vos connaissances avec des exercices interactifs et des simulations'}
                  </p>
                  
                  {module.sEntrainer?.exercices && module.sEntrainer.exercices.length > 0 && (
                    <div className="mt-auto">
                      <h3 className="text-white font-medium mb-3">Exercices recommandés:</h3>
                      <ul className="space-y-3">
                        {module.sEntrainer.exercices.slice(0, 3).map((item, index) => (
                          <li key={index}>
                            <div className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{item.title}</span>
                                <ArrowRight className="h-5 w-5" />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Section S'ÉVALUER */}
              <Card 
                className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-purple-700 to-purple-900 border-0"
                onClick={() => module.sEvaluer && setSelectedSection('sEvaluer')}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-white/10">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      S'ÉVALUER
                    </h2>
                  </div>
                  
                  <p className="mb-6 text-purple-100">
                    {module.sEvaluer?.description || 
                    'Tester vos compétences dans des conditions réelles d\'examen ou d\'entretien'}
                  </p>
                  
                  {module.sEvaluer?.objectives && module.sEvaluer.objectives.length > 0 && (
                    <div className="mt-auto">
                      <h3 className="text-white font-medium mb-3">Objectifs d'évaluation:</h3>
                      <ul className="space-y-2">
                        {module.sEvaluer.objectives.slice(0, 3).map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="shrink-0 h-5 w-5 text-purple-300 mr-2 mt-0.5" />
                            <span className="text-purple-100 text-sm">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Section AUTOMATISER */}
              <Card 
                className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-teal-700 to-teal-900 border-0"
                onClick={() => module.automatiser && setSelectedSection('automatiser')}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-white/10">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      AUTOMATISER
                    </h2>
                  </div>
                  
                  <p className="mb-6 text-teal-100">
                    {module.automatiser?.description || 
                    'Utiliser des outils pour générer du contenu et automatiser des tâches'}
                  </p>
                  
                  {module.automatiser?.tools && module.automatiser.tools.length > 0 && (
                    <div className="mt-auto">
                      <h3 className="text-white font-medium mb-3">Outils recommandés:</h3>
                      <ul className="space-y-3">
                        {module.automatiser.tools.slice(0, 3).map((tool, index) => (
                          <li key={index}>
                            <div className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{tool.name}</span>
                                <ArrowRight className="h-5 w-5" />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            renderSectionDetail()
          )}
        </div>
      </div>
    </HomeLayout>
  );
}