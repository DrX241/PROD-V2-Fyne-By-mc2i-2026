import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, BookOpen, Shield, AlertTriangle, Code, Brain, Network, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import PageTitle from '@/components/PageTitle';

const MicroLearning = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contenu');
  const [module, setModule] = useState<any>(null);
  const [content, setContent] = useState<any>(null);

  // Récupérer les paramètres de l'URL
  const params = new URLSearchParams(window.location.search);
  const moduleTitle = params.get('title');
  const moduleType = params.get('type');
  const moduleDuree = params.get('duree');
  const moduleDescription = params.get('description');
  const modulePointsCles = params.get('points') ? JSON.parse(decodeURIComponent(params.get('points') || '[]')) : [];

  useEffect(() => {
    // Simuler le chargement du contenu
    setLoading(true);
    
    // Construire l'objet module à partir des paramètres URL
    const moduleData = {
      title: moduleTitle || 'Module de formation',
      type: moduleType || 'module',
      duree: moduleDuree || '30 min',
      description: moduleDescription || 'Description du module',
      points_cles: modulePointsCles
    };
    
    setModule(moduleData);
    
    // Générer le contenu du module en temps réel
    generateContent(moduleData).then(content => {
      setContent(content);
      setLoading(false);
    }).catch(error => {
      console.error('Erreur lors du chargement du contenu:', error);
      toast({
        title: "Erreur de chargement",
        description: "Nous n'avons pas pu charger le contenu du module. Veuillez réessayer.",
        variant: "destructive"
      });
      setLoading(false);
    });
  }, [moduleTitle, moduleType, moduleDescription, toast]);

  // Fonction pour générer le contenu du module
  const generateContent = async (moduleData: any) => {
    try {
      // Dans une implémentation complète, on appellerait une API pour générer le contenu
      // Ici, on simule un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Contenu simulé pour le prototype
      return {
        introduction: `Bienvenue dans ce module personnalisé sur ${moduleData.title}. Ce contenu a été créé spécifiquement pour répondre à vos besoins d'apprentissage.`,
        sections: [
          {
            title: 'Introduction aux concepts',
            content: `Dans cette section, nous allons explorer les concepts fondamentaux liés à ${moduleData.title}. Il est essentiel de bien comprendre ces principes pour progresser efficacement dans votre parcours d'apprentissage.`,
            keyPoints: [moduleData.points_cles[0] || 'Point clé 1']
          },
          {
            title: 'Méthodologies et approches',
            content: `Découvrez les méthodologies et approches pratiques qui vous permettront d'appliquer les connaissances acquises dans votre contexte professionnel.`,
            keyPoints: [moduleData.points_cles[1] || 'Point clé 2']
          },
          {
            title: 'Application pratique',
            content: `Passons maintenant à l'application pratique de ces connaissances. Cette section vous présente des cas concrets et des exemples qui illustrent comment mettre en œuvre les concepts présentés.`,
            keyPoints: [moduleData.points_cles[2] || 'Point clé 3']
          }
        ],
        conclusion: `Félicitations ! Vous avez terminé ce module sur ${moduleData.title}. N'hésitez pas à revoir les points clés et à poursuivre votre apprentissage avec les autres modules de votre parcours personnalisé.`,
        quiz: [
          {
            question: `Quelle est l'importance de ${moduleData.title} dans une stratégie de cybersécurité ?`,
            options: [
              'Ce n\'est pas important',
              'C\'est une composante fondamentale',
              'C\'est utile seulement pour les grandes entreprises',
              'C\'est obsolète face aux nouvelles menaces'
            ],
            correctAnswer: 1
          },
          {
            question: 'Quel est le meilleur moment pour mettre en place ces pratiques ?',
            options: [
              'Uniquement après un incident',
              'Seulement si obligatoire par la réglementation',
              'Dès la conception des systèmes',
              'Uniquement pour les systèmes critiques'
            ],
            correctAnswer: 2
          }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la génération du contenu:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <PageTitle title={`${moduleTitle || 'Module'} | Cyber Académie`} />
      
      {/* En-tête avec navigation */}
      <div className="border-b border-blue-900/30 bg-slate-900/60 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/cyber/chemin-parcours">
            <Button variant="ghost" className="text-blue-300 hover:text-blue-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au parcours
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold text-white">{moduleTitle}</h1>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-blue-200">Chargement du contenu personnalisé...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Card className="border-blue-800/50 shadow-lg bg-slate-900/70">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{module?.title}</h1>
                        <p className="text-blue-200 max-w-2xl">{module?.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-800/40 text-blue-200">
                          {module?.type}
                        </Badge>
                        <Badge variant="outline" className="text-blue-300 border-blue-800">
                          {module?.duree}
                        </Badge>
                      </div>
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-blue-900/50">
                        <TabsTrigger value="contenu" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">
                          Contenu
                        </TabsTrigger>
                        <TabsTrigger value="quiz" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">
                          Quiz
                        </TabsTrigger>
                        <TabsTrigger value="ressources" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">
                          Ressources
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="contenu" className="mt-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-blue-800/50 shadow-lg bg-slate-800/50 mb-6">
                            <CardContent className="p-6">
                              <h2 className="text-xl font-semibold text-white mb-3">Introduction</h2>
                              <p className="text-blue-200 mb-6">{content?.introduction}</p>
                              
                              {content?.sections.map((section: any, index: number) => (
                                <div key={index} className="mb-8 border-t border-blue-900/30 pt-6">
                                  <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
                                  <p className="text-blue-200 mb-4">{section.content}</p>
                                  
                                  <div className="bg-slate-900/70 p-4 rounded-md border border-blue-800/30">
                                    <div className="flex items-center mb-2">
                                      <BookOpen className="h-4 w-4 text-blue-400 mr-2" />
                                      <h4 className="font-medium text-blue-100">Point clé</h4>
                                    </div>
                                    <p className="text-blue-200 pl-6">{section.keyPoints[0]}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="mt-8 border-t border-blue-900/30 pt-6">
                                <h2 className="text-xl font-semibold text-white mb-3">Conclusion</h2>
                                <p className="text-blue-200">{content?.conclusion}</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-between">
                            <Button variant="outline" className="border-blue-700 text-blue-300 hover:bg-blue-900/30">
                              Imprimer le contenu
                            </Button>
                            <Button 
                              onClick={() => setActiveTab('quiz')}
                              className="bg-blue-700 hover:bg-blue-600 text-white"
                            >
                              Passer au quiz
                            </Button>
                          </div>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="quiz" className="mt-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-blue-800/50 shadow-lg bg-slate-800/50 mb-6">
                            <CardContent className="p-6">
                              <h2 className="text-xl font-semibold text-white mb-4">Vérifiez vos connaissances</h2>
                              <p className="text-blue-200 mb-6">Répondez aux questions suivantes pour tester votre compréhension des concepts abordés dans ce module.</p>
                              
                              {content?.quiz.map((question: any, index: number) => (
                                <div key={index} className="mb-8 border-t border-blue-900/30 pt-6">
                                  <h3 className="text-lg font-semibold text-white mb-3">Question {index + 1}</h3>
                                  <p className="text-blue-200 mb-4">{question.question}</p>
                                  
                                  <div className="space-y-3">
                                    {question.options.map((option: string, optionIndex: number) => (
                                      <div 
                                        key={optionIndex}
                                        className="bg-slate-900/70 p-3 rounded-md border border-blue-800/30 hover:bg-slate-800 cursor-pointer transition-colors"
                                      >
                                        <div className="flex items-center">
                                          <div className="h-5 w-5 rounded-full border border-blue-400 mr-3 flex items-center justify-center">
                                            <span className="text-xs">{String.fromCharCode(65 + optionIndex)}</span>
                                          </div>
                                          <p className="text-blue-200">{option}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="mt-6 text-center">
                                <Button className="bg-blue-700 hover:bg-blue-600 text-white px-8">
                                  Vérifier les réponses
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="ressources" className="mt-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-blue-800/50 shadow-lg bg-slate-800/50 mb-6">
                            <CardContent className="p-6">
                              <h2 className="text-xl font-semibold text-white mb-4">Ressources complémentaires</h2>
                              <p className="text-blue-200 mb-6">Explorez ces ressources pour approfondir vos connaissances sur ce sujet.</p>
                              
                              <div className="space-y-4">
                                <div className="bg-slate-900/70 p-4 rounded-md border border-blue-800/30">
                                  <h3 className="font-medium text-white mb-2">Documentation officielle</h3>
                                  <p className="text-blue-200 mb-2">Consultez la documentation de référence sur ce sujet.</p>
                                  <Button variant="outline" className="text-blue-300 border-blue-700">
                                    Consulter
                                  </Button>
                                </div>
                                
                                <div className="bg-slate-900/70 p-4 rounded-md border border-blue-800/30">
                                  <h3 className="font-medium text-white mb-2">Cas pratiques</h3>
                                  <p className="text-blue-200 mb-2">Exemples concrets d'application dans différents contextes.</p>
                                  <Button variant="outline" className="text-blue-300 border-blue-700">
                                    Explorer
                                  </Button>
                                </div>
                                
                                <div className="bg-slate-900/70 p-4 rounded-md border border-blue-800/30">
                                  <h3 className="font-medium text-white mb-2">Outils recommandés</h3>
                                  <p className="text-blue-200 mb-2">Sélection d'outils et ressources pour mettre en pratique les concepts.</p>
                                  <Button variant="outline" className="text-blue-300 border-blue-700">
                                    Découvrir
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroLearning;