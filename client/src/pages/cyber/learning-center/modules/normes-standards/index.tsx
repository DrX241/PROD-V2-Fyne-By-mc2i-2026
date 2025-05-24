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
  ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Layers, FileText, 
  Globe, BadgeCheck, Scale, Brain, BrainCircuit, Sparkles, MessageCircle, 
  Cpu, Award, Trash2 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function NormesStandards() {
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
      setProgress(12);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Normes et standards de sécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Normes et standards de sécurité</h1>
          
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
                <h2 className="text-2xl font-bold text-white mb-4">Panorama des normes et standards internationaux<br />en cybersécurité (ISO 27001, NIST, etc.)</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    Les normes et standards de sécurité constituent un cadre de référence essentiel pour établir des politiques de sécurité robustes et conformes aux meilleures pratiques internationales.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Principales normes ISO</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <BadgeCheck className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">ISO 27001</h4>
                      </div>
                      <p className="text-sm text-blue-200">Norme internationale pour les systèmes de management de la sécurité de l'information (SMSI). Elle spécifie les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un SMSI.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">ISO 27002</h4>
                      </div>
                      <p className="text-sm text-blue-200">Guide des bonnes pratiques pour la gestion de la sécurité de l'information. Elle fournit des recommandations détaillées pour les contrôles de sécurité.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Layers className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">ISO 27005</h4>
                      </div>
                      <p className="text-sm text-blue-200">Méthodologie pour la gestion des risques liés à la sécurité de l'information. Fournit des directives pour l'analyse et l'évaluation des risques.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Globe className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">ISO 27701</h4>
                      </div>
                      <p className="text-sm text-blue-200">Extension d'ISO 27001 et 27002 pour la gestion des informations de confidentialité, particulièrement adaptée au RGPD.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Autres référentiels majeurs</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Shield className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">NIST Cybersecurity Framework</h4>
                        <p className="text-sm text-blue-200">Cadre de référence américain qui propose une approche basée sur les risques pour gérer la cybersécurité. Il est organisé autour de cinq fonctions : Identifier, Protéger, Détecter, Répondre et Récupérer.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Scale className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">PCI DSS</h4>
                        <p className="text-sm text-blue-200">Payment Card Industry Data Security Standard : norme de sécurité pour la protection des données de cartes de paiement. Obligatoire pour toutes les organisations qui stockent, traitent ou transmettent des données de cartes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <CheckCircle className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">COBIT</h4>
                        <p className="text-sm text-blue-200">Control Objectives for Information and Related Technologies : référentiel pour la gouvernance et la gestion des systèmes d'information. Il établit un lien entre les exigences métier et les processus informatiques.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <FileText className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">RGPD</h4>
                        <p className="text-sm text-blue-200">Règlement Général sur la Protection des Données : réglementation européenne sur la protection des données personnelles qui impose des obligations strictes aux organisations.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Note importante</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      La conformité aux normes n'est pas une fin en soi mais un moyen d'améliorer la sécurité. Une approche basée uniquement sur la conformité peut créer une fausse impression de sécurité si elle n'est pas accompagnée d'une véritable culture de cybersécurité.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Mettre en œuvre une certification</h2>
                
                <Tabs defaultValue="iso27001" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="iso27001" className="data-[state=active]:bg-blue-700">ISO 27001</TabsTrigger>
                    <TabsTrigger value="nist" className="data-[state=active]:bg-blue-700">NIST CSF</TabsTrigger>
                    <TabsTrigger value="pcidss" className="data-[state=active]:bg-blue-700">PCI DSS</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="iso27001">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Démarche de certification ISO 27001</h3>
                        <ol className="list-decimal pl-5 mt-3 text-blue-200 space-y-2">
                          <li>Définir le périmètre du SMSI (Système de Management de la Sécurité de l'Information)</li>
                          <li>Réaliser une analyse de risques et définir une méthodologie d'évaluation</li>
                          <li>Élaborer une politique de sécurité</li>
                          <li>Mettre en place les mesures et contrôles adaptés</li>
                          <li>Former et sensibiliser les collaborateurs</li>
                          <li>Mettre en œuvre un processus d'amélioration continue</li>
                          <li>Réaliser des audits internes</li>
                          <li>Passer l'audit de certification par un organisme accrédité</li>
                        </ol>
                        <p className="mt-3 text-blue-200">La certification ISO 27001 est valable 3 ans, avec des audits de surveillance annuels.</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="nist">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Implémentation du NIST CSF</h3>
                        <p className="text-blue-200">Contrairement à ISO 27001, le NIST CSF n'est pas une norme de certification mais un cadre de référence flexible.</p>
                        <ol className="list-decimal pl-5 mt-3 text-blue-200 space-y-2">
                          <li>Établir les priorités, le périmètre et les objectifs de cybersécurité</li>
                          <li>Créer un profil actuel reflétant l'état de maturité des contrôles en place</li>
                          <li>Réaliser une évaluation des risques</li>
                          <li>Créer un profil cible définissant l'état souhaité</li>
                          <li>Déterminer les écarts entre les profils actuels et cibles</li>
                          <li>Élaborer un plan d'action pour combler ces écarts</li>
                          <li>Mettre en œuvre le plan et suivre les progrès</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pcidss">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Conformité PCI DSS</h3>
                        <p className="text-blue-200">La norme PCI DSS comprend 12 exigences réparties en 6 objectifs de contrôle.</p>
                        <ol className="list-decimal pl-5 mt-3 text-blue-200 space-y-2">
                          <li>Déterminer le niveau de conformité requis en fonction du volume de transactions</li>
                          <li>Identifier le périmètre des données de cartes de paiement (CDE)</li>
                          <li>Réduire le périmètre au maximum (tokenisation, isolation réseau, etc.)</li>
                          <li>Mettre en œuvre les contrôles exigés par la norme</li>
                          <li>Remplir le questionnaire d'auto-évaluation (SAQ) adapté</li>
                          <li>Pour les niveaux 1 et 2 : faire réaliser un audit par un Qualified Security Assessor (QSA)</li>
                          <li>Obtenir l'Attestation de Conformité (AOC)</li>
                          <li>Maintenir la conformité en continu</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            {/* Expert IA en normes et standards */}
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-400" />
                  Expert IA en Normes et Standards
                </h3>
                
                <p className="text-sm text-blue-300 mb-4">
                  Posez vos questions sur les normes, certifications et standards de sécurité à notre expert.
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
                      Posez vos questions sur ISO 27001, NIST, PCI DSS et les autres normes et standards.
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
                        placeholder="Ex: Comment obtenir la certification ISO 27001?" 
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
                                    content: 'Tu es un expert en normes et standards de cybersécurité, spécialisé dans ISO 27001, NIST CSF, PCI DSS et autres référentiels reconnus. Tu fournis des réponses précises, techniques mais accessibles sur tous les sujets liés à la conformité, la certification et l\'application des normes de sécurité. Tes réponses doivent être structurées, factuelles et basées sur les versions actuelles des normes. Reste strictement dans le domaine des normes et standards de cybersécurité.'
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
                            if (!completedInteractions.includes('norms-ai-assistant')) {
                              setUserPoints(prev => prev + 15);
                              setCompletedInteractions(prev => [...prev, 'norms-ai-assistant']);
                              
                              toast({
                                title: "Expert IA consulté !",
                                description: "+15 points pour avoir dialogué avec l'expert en normes",
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
                      <span className="text-blue-200">Guide ISO 27001:2022</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Modèle de déclaration d'applicabilité (SOA)</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Analyse et gestion des risques</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 text-blue-300 mr-2" />
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