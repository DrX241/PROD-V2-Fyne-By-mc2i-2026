import React, { useState, useEffect } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/utils/PageTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, 
  BarChart3, PieChart, LineChart, TrendingUp, Table2, 
  Brain, BrainCircuit, Sparkles, MessageCircle, Cpu, Award, Trash2 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function AnalyseRisques() {
  // États pour suivre la progression du module
  const [progress, setProgress] = useState(0);
  
  // États pour l'assistant IA
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  
  // Simuler la progression lorsque la page est chargée
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(10);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Analyse et gestion des risques | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Analyse et gestion des risques</h1>
          
          <div className="ml-auto flex items-center">
            <div className="w-48 mr-4">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-blue-300">{progress}% complété</span>
          </div>
        </div>
      </div>
      
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Section principale de contenu */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Méthodologies d'analyse des risques</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    L'analyse et la gestion des risques sont des processus essentiels pour identifier, évaluer et traiter les menaces pesant sur les systèmes d'information d'une organisation.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Principales méthodes d'analyse des risques</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">EBIOS Risk Manager</h4>
                      </div>
                      <p className="text-sm text-blue-200">Méthode française développée par l'ANSSI pour l'analyse et le traitement des risques de sécurité.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <PieChart className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">MEHARI</h4>
                      </div>
                      <p className="text-sm text-blue-200">Méthode d'analyse harmonisée des risques proposant des indicateurs et des métriques pour quantifier les risques.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <LineChart className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">ISO 27005</h4>
                      </div>
                      <p className="text-sm text-blue-200">Norme internationale pour la gestion des risques liés à la sécurité de l'information.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">NIST RMF</h4>
                      </div>
                      <p className="text-sm text-blue-200">Risk Management Framework du NIST américain, adapté aux enjeux gouvernementaux et privés.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Le processus d'analyse des risques</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Table2 className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">1. Identification des actifs</h4>
                        <p className="text-sm text-blue-200">Recensement des biens matériels et immatériels à protéger et évaluation de leur importance.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Shield className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">2. Identification des menaces</h4>
                        <p className="text-sm text-blue-200">Recensement des menaces potentielles et évaluation de leur probabilité de survenance.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <AlertTriangle className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">3. Identification des vulnérabilités</h4>
                        <p className="text-sm text-blue-200">Analyse des faiblesses des systèmes pouvant être exploitées par les menaces.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <BarChart3 className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">4. Évaluation des risques</h4>
                        <p className="text-sm text-blue-200">Combinaison des menaces, vulnérabilités et impacts pour déterminer le niveau de risque.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <CheckCircle className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">5. Traitement des risques</h4>
                        <p className="text-sm text-blue-200">Mise en place de mesures pour réduire, transférer, éviter ou accepter les risques identifiés.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Point important</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      L'analyse des risques n'est pas un exercice ponctuel mais un processus continu. Les risques doivent être régulièrement réévalués en fonction de l'évolution des menaces et des changements au sein de l'organisation.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Stratégies de traitement des risques</h2>
                
                <Tabs defaultValue="reduction" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="reduction" className="data-[state=active]:bg-blue-700">Réduction</TabsTrigger>
                    <TabsTrigger value="transfert" className="data-[state=active]:bg-blue-700">Transfert</TabsTrigger>
                    <TabsTrigger value="evitement" className="data-[state=active]:bg-blue-700">Évitement</TabsTrigger>
                    <TabsTrigger value="acceptation" className="data-[state=active]:bg-blue-700">Acceptation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reduction">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Réduction du risque</h3>
                        <p className="text-blue-200">Mise en place de mesures préventives ou correctives pour diminuer soit la probabilité d'occurrence, soit l'impact du risque.</p>
                        <ul className="list-disc pl-5 mt-3 text-blue-200 space-y-1">
                          <li>Mise en place de contrôles techniques (pare-feu, antivirus, etc.)</li>
                          <li>Renforcement des procédures</li>
                          <li>Formation et sensibilisation des utilisateurs</li>
                          <li>Mise en place de redondances</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transfert">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Transfert du risque</h3>
                        <p className="text-blue-200">Déplacement de la responsabilité ou des conséquences du risque vers une autre entité.</p>
                        <ul className="list-disc pl-5 mt-3 text-blue-200 space-y-1">
                          <li>Souscription à une assurance cyber</li>
                          <li>Externalisation de certaines activités</li>
                          <li>Partage des risques avec des partenaires</li>
                          <li>Clauses contractuelles de limitation de responsabilité</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evitement">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Évitement du risque</h3>
                        <p className="text-blue-200">Élimination de l'activité ou de la condition qui crée le risque.</p>
                        <ul className="list-disc pl-5 mt-3 text-blue-200 space-y-1">
                          <li>Abandon d'un projet ou d'une fonctionnalité trop risquée</li>
                          <li>Changement d'architecture technique</li>
                          <li>Suppression de certains services exposés</li>
                          <li>Restriction des usages</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="acceptation">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Acceptation du risque</h3>
                        <p className="text-blue-200">Reconnaissance et prise en charge consciente du risque sans mesure supplémentaire.</p>
                        <ul className="list-disc pl-5 mt-3 text-blue-200 space-y-1">
                          <li>Acceptation des risques résiduels après application de mesures de réduction</li>
                          <li>Acceptation de risques mineurs dont le coût de traitement serait disproportionné</li>
                          <li>Documentation formelle de l'acceptation dans un registre de risques</li>
                          <li>Réévaluation périodique des risques acceptés</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            {/* Expert IA en analyse des risques */}
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-400" />
                  Expert IA en Analyse des Risques
                </h3>
                
                <p className="text-sm text-blue-300 mb-4">
                  Posez vos questions sur l'analyse et la gestion des risques à notre expert spécialisé.
                </p>
                
                <div className="space-y-4">
                  {/* Interface unifiée de l'assistant IA */}
                  <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white flex items-center">
                        <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                        Discussion avec l'Expert IA
                      </h4>
                      <Badge className="bg-green-600/70">
                        <Cpu className="h-3 w-3 mr-1" />
                        IA CONNECTÉE
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-blue-200 mb-3">
                      Posez vos questions sur les méthodologies d'analyse des risques, les normes et les bonnes pratiques.
                    </p>
                    
                    {/* Historique de conversation */}
                    {chatHistory.length > 0 && (
                      <div className="max-h-60 overflow-y-auto mb-3 space-y-3 bg-blue-950/70 p-3 rounded border border-blue-800/50">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2 rounded ${
                              msg.role === 'user' 
                                ? 'bg-blue-600/50 text-white' 
                                : 'bg-blue-900/70 text-blue-200'
                            }`}>
                              <p className="text-xs whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Interface de saisie */}
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Ex: Comment prioriser les risques dans EBIOS RM?" 
                        className="bg-blue-900/30 border-blue-700 text-white"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <Button 
                        onClick={async () => {
                          if (!aiPrompt.trim()) return;
                          
                          // Ajouter le message de l'utilisateur à l'historique
                          const userMessage = { role: 'user', content: aiPrompt };
                          const newHistory = [...chatHistory, userMessage];
                          setChatHistory(newHistory);
                          
                          // Générer la réponse
                          setIsGeneratingAI(true);
                          
                          try {
                            const response = await fetch('/api/openai/chat', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                messages: [
                                  {
                                    role: 'system',
                                    content: 'Tu es un expert en analyse et gestion des risques de cybersécurité, spécialisé dans les méthodologies comme EBIOS RM, ISO 27005, NIST RMF et MEHARI. Tu fournis des réponses précises, techniques mais accessibles sur tous les sujets liés à l\'identification, l\'évaluation et le traitement des risques. Tes réponses doivent être structurées, basées sur les bonnes pratiques et les normes du secteur. Reste strictement dans le domaine de l\'analyse et la gestion des risques en cybersécurité.'
                                  },
                                  ...newHistory.map(msg => ({
                                    role: msg.role,
                                    content: msg.content
                                  }))
                                ],
                                temperature: 0.3,
                                max_tokens: 800
                              }),
                            });
                            
                            if (!response.ok) {
                              throw new Error('Erreur API');
                            }
                            
                            const data = await response.json();
                            const aiContent = data.choices?.[0]?.message?.content || 
                              "Je ne peux pas répondre à cette question actuellement. Veuillez réessayer.";
                            
                            // Ajouter la réponse à l'historique
                            setChatHistory([...newHistory, { role: 'assistant', content: aiContent }]);
                            
                            // Ajouter des points si première utilisation
                            if (!completedInteractions.includes('risk-ai-assistant')) {
                              setUserPoints(prev => prev + 15);
                              setCompletedInteractions(prev => [...prev, 'risk-ai-assistant']);
                              
                              toast({
                                title: "Expert IA consulté !",
                                description: "+15 points pour avoir dialogué avec l'expert en analyse des risques",
                              });
                            }
                          } catch (error) {
                            console.error('Erreur lors de l\'appel à l\'API:', error);
                            toast({
                              title: "Erreur de connexion",
                              description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
                              variant: "destructive"
                            });
                          } finally {
                            setAiPrompt("");
                            setIsGeneratingAI(false);
                          }
                        }}
                        disabled={isGeneratingAI || !aiPrompt.trim()}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Envoyer
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between mt-3">
                      <div className="text-xs text-gray-400 text-center">
                        Propulsé par notre IA avancée
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:text-red-200 hover:bg-red-900/20 p-1 h-auto"
                        onClick={() => {
                          setChatHistory([]);
                          toast({
                            title: "Conversation réinitialisée",
                            description: "L'historique a été effacé"
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ressources complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Guide EBIOS Risk Manager</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Modèle de registre des risques</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Normes et standards de sécurité</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Gouvernance de la cybersécurité</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Progression</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Module en cours</span>
                      <span className="text-blue-300">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Programme total</span>
                      <span className="text-blue-300">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  
                  <Button className="w-full mt-4 bg-blue-700 hover:bg-blue-600">
                    Continuer l'apprentissage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}