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
  Brain, BrainCircuit, Sparkles, MessageCircle, Cpu, Award, Trash2, 
  Zap, Radar, Lock, Code, Search, Robot, Database, LineChart, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function IAEtCybersecurite() {
  // États pour suivre la progression du module
  const [progress, setProgress] = useState(0);
  
  // États pour l'assistant IA
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  
  // État pour les sections d'études de cas
  const [selectedUseCase, setSelectedUseCase] = useState("detection");
  
  // Simuler la progression lorsque la page est chargée
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(15);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="IA et cybersécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">IA et cybersécurité</h1>
          
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
                <h2 className="text-2xl font-bold text-white mb-4">Applications et enjeux de l'IA<br />dans la cybersécurité</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    L'intelligence artificielle révolutionne la cybersécurité en offrant des capacités avancées de détection et de réponse aux menaces. Mais elle introduit également de nouveaux défis et risques à considérer.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Applications de l'IA en cybersécurité</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Radar className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Détection d'anomalies</h4>
                      </div>
                      <p className="text-sm text-blue-200">Utilisation d'algorithmes de machine learning pour identifier des comportements inhabituels ou suspects sur les réseaux et systèmes, permettant de détecter des menaces inconnues ou zero-day.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Search className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Analyse comportementale</h4>
                      </div>
                      <p className="text-sm text-blue-200">Établissement de modèles de comportement normal des utilisateurs et des systèmes pour identifier rapidement les déviations potentiellement malveillantes.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Automatisation des réponses</h4>
                      </div>
                      <p className="text-sm text-blue-200">Mise en place de systèmes capables de réagir automatiquement aux incidents de sécurité, réduisant le temps de réponse et limitant l'impact des attaques.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Analyse prédictive</h4>
                      </div>
                      <p className="text-sm text-blue-200">Anticipation des menaces futures grâce à l'analyse de vastes ensembles de données et identification proactive des vulnérabilités potentielles.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Risques et défis liés à l'IA</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Shield className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">IA offensive</h4>
                        <p className="text-sm text-blue-200">Les attaquants utilisent également l'IA pour développer des malwares plus sophistiqués, contourner les défenses traditionnelles et automatiser leurs attaques à grande échelle.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <AlertCircle className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Attaques par empoisonnement</h4>
                        <p className="text-sm text-blue-200">Manipulation des données d'entraînement des modèles d'IA pour créer des vulnérabilités ou des comportements indésirables dans les systèmes de sécurité.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Lock className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Faux positifs et alertes</h4>
                        <p className="text-sm text-blue-200">Les systèmes d'IA peuvent générer un volume élevé de fausses alertes, créant une fatigue d'alerte qui risque de faire négliger les menaces réelles.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Code className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Explicabilité et transparence</h4>
                        <p className="text-sm text-blue-200">Difficulté à comprendre comment et pourquoi un modèle d'IA prend certaines décisions, compliquant l'analyse forensique et la justification des actions de sécurité.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Point important</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      L'IA n'est pas une panacée pour la cybersécurité. Elle doit être intégrée dans une stratégie de défense en profondeur et supervisée par des experts humains. La combinaison de l'expertise humaine et des capacités de l'IA constitue l'approche la plus robuste face aux menaces actuelles.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Cas d'usage concrets de l'IA en cybersécurité</h2>
                
                <Tabs defaultValue="detection" className="w-full" onValueChange={setSelectedUseCase}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="detection" className="data-[state=active]:bg-blue-700">Détection</TabsTrigger>
                    <TabsTrigger value="prevention" className="data-[state=active]:bg-blue-700">Prévention</TabsTrigger>
                    <TabsTrigger value="reponse" className="data-[state=active]:bg-blue-700">Réponse</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="detection">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Détection avancée des menaces par IA</h3>
                        <p className="text-blue-200 mb-4">Les systèmes basés sur l'IA peuvent analyser d'énormes volumes de données et identifier des patterns subtils invisibles aux méthodes traditionnelles.</p>
                        
                        <div className="bg-blue-900/50 p-3 rounded-md border border-blue-700/50 mb-4">
                          <h4 className="font-medium text-white text-sm flex items-center">
                            <Robot className="h-4 w-4 mr-2 text-blue-300" />
                            Exemple pratique : Darktrace
                          </h4>
                          <p className="text-xs text-blue-200 mt-1">
                            Darktrace utilise l'apprentissage automatique pour créer une "image" du comportement normal sur un réseau. Cela lui permet de détecter des anomalies subtiles comme une connexion à un serveur inhabituel, un transfert de données anormal, ou un accès à des ressources à des heures inhabituelles.
                          </p>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableHead className="text-blue-300">Capacité</TableHead>
                              <TableHead className="text-blue-300">Avantage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Analyse comportementale</TableCell>
                              <TableCell className="text-blue-200">Détection de menaces inconnues (zero-day)</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Identification d'anomalies</TableCell>
                              <TableCell className="text-blue-200">Réduction des faux positifs</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Analyse en temps réel</TableCell>
                              <TableCell className="text-blue-200">Réduction du temps de détection</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prevention">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Prévention proactive grâce à l'IA</h3>
                        <p className="text-blue-200 mb-4">L'IA permet d'anticiper les menaces avant qu'elles ne se concrétisent, en analysant les tendances et les vulnérabilités potentielles.</p>
                        
                        <div className="bg-blue-900/50 p-3 rounded-md border border-blue-700/50 mb-4">
                          <h4 className="font-medium text-white text-sm flex items-center">
                            <Robot className="h-4 w-4 mr-2 text-blue-300" />
                            Exemple pratique : Cylance
                          </h4>
                          <p className="text-xs text-blue-200 mt-1">
                            Cylance (aujourd'hui BlackBerry Cylance) utilise l'IA prédictive pour analyser des millions de caractéristiques dans les fichiers et prédire si un fichier est malveillant avant qu'il ne soit exécuté, sans avoir besoin de signatures.
                          </p>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableHead className="text-blue-300">Capacité</TableHead>
                              <TableHead className="text-blue-300">Avantage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Analyse prédictive</TableCell>
                              <TableCell className="text-blue-200">Blocage préventif des menaces</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Évaluation des vulnérabilités</TableCell>
                              <TableCell className="text-blue-200">Prioritisation des correctifs</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Simulation d'attaques</TableCell>
                              <TableCell className="text-blue-200">Renforcement proactif des défenses</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reponse">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Réponse automatisée aux incidents</h3>
                        <p className="text-blue-200 mb-4">Les systèmes d'IA peuvent réagir aux menaces détectées en temps réel, réduisant considérablement le temps de réponse.</p>
                        
                        <div className="bg-blue-900/50 p-3 rounded-md border border-blue-700/50 mb-4">
                          <h4 className="font-medium text-white text-sm flex items-center">
                            <Robot className="h-4 w-4 mr-2 text-blue-300" />
                            Exemple pratique : IBM Watson for Security
                          </h4>
                          <p className="text-xs text-blue-200 mt-1">
                            IBM Watson for Security analyse les incidents de sécurité, consulte des bases de connaissances et suggère des réponses appropriées, tout en apprenant des actions prises par les analystes pour améliorer ses recommandations futures.
                          </p>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableHead className="text-blue-300">Capacité</TableHead>
                              <TableHead className="text-blue-300">Avantage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Orchestration automatisée</TableCell>
                              <TableCell className="text-blue-200">Réduction du temps de réponse</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Triage intelligent</TableCell>
                              <TableCell className="text-blue-200">Priorisation efficace des incidents</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-blue-900/30 border-blue-800">
                              <TableCell className="text-white">Apprentissage continu</TableCell>
                              <TableCell className="text-blue-200">Amélioration des réponses futures</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            {/* Expert IA en cybersécurité */}
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-400" />
                  Expert IA en Cybersécurité
                </h3>
                
                <p className="text-sm text-blue-300 mb-4">
                  Posez vos questions sur l'IA en cybersécurité à notre expert spécialisé.
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
                      Posez vos questions sur l'application de l'IA en cybersécurité, ses avantages et ses risques.
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
                        placeholder="Ex: Comment l'IA améliore-t-elle la détection?" 
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
                                    content: 'Tu es un expert en IA appliquée à la cybersécurité. Tu connais en détail les techniques de machine learning et deep learning utilisées pour la détection des menaces, la prévention des attaques et la réponse aux incidents. Tu es également au courant des risques liés à l\'utilisation offensive de l\'IA par les attaquants. Tes réponses doivent être précises, techniques mais accessibles, et basées sur les technologies et pratiques actuelles. Reste strictement dans le domaine de l\'IA appliquée à la cybersécurité.'
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
                            if (!completedInteractions.includes('ai-cyber-assistant')) {
                              setUserPoints(prev => prev + 15);
                              setCompletedInteractions(prev => [...prev, 'ai-cyber-assistant']);
                              
                              toast({
                                title: "Expert IA consulté !",
                                description: "+15 points pour avoir dialogué avec l'expert en IA et cybersécurité",
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
                      <span className="text-blue-200">Guide des outils IA en cybersécurité</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Livre blanc : IA offensive vs défensive</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">SOC et automatisation</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <LineChart className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Analyse de données de sécurité</span>
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
                      <span className="text-blue-300">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
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