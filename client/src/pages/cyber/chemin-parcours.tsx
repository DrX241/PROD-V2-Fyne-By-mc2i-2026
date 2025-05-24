import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, LightbulbIcon, BookOpen, Shield, Code, AlertTriangle, Brain, Network, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTitle from '@/components/PageTitle';
import { useToast } from "@/hooks/use-toast";

const ParcoursPersonnalise = () => {
  const [intention, setIntention] = useState('');
  const [parcours, setParcours] = useState<Array<{
    id: number;
    title: string;
    description: string;
    duree: string;
    type: string;
    icon: React.ReactNode;
    color: string;
    points_cles?: string[];
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('saisie');
  
  const { toast } = useToast();

  // Générer un parcours personnalisé en temps réel
  const genererParcours = async () => {
    if (!intention.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/parcours/generer-parcours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ intention })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du parcours');
      }
      
      const data = await response.json();
      
      if (!data.parcours || !Array.isArray(data.parcours)) {
        throw new Error('Format de réponse invalide');
      }
      
      // Transformer les données reçues en parcours exploitable
      const nouveauParcours = data.parcours.map((module: any, index: number) => {
        // Déterminer l'icône et la couleur en fonction du type
        let icon;
        let color;
        
        switch(module.type.toLowerCase()) {
          case 'module':
            icon = <Shield className="h-5 w-5 text-blue-500" />;
            color = "bg-blue-800/40 text-blue-200";
            break;
          case 'simulation':
            icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
            color = "bg-amber-800/40 text-amber-200";
            break;
          case 'cours':
            icon = <BookOpen className="h-5 w-5 text-indigo-500" />;
            color = "bg-indigo-800/40 text-indigo-200";
            break;
          case 'quiz':
            icon = <Brain className="h-5 w-5 text-purple-500" />;
            color = "bg-purple-800/40 text-purple-200";
            break;
          case 'atelier':
            icon = <Code className="h-5 w-5 text-emerald-500" />;
            color = "bg-emerald-800/40 text-emerald-200";
            break;
          default:
            icon = <Shield className="h-5 w-5 text-blue-500" />;
            color = "bg-blue-800/40 text-blue-200";
        }
        
        return {
          id: index + 1,
          title: module.title,
          description: module.description,
          duree: module.duree,
          type: module.type,
          icon: icon,
          color: color,
          points_cles: module.points_cles || []
        };
      });
      
      setParcours(nouveauParcours);
      setActiveTab('resultat');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur de génération",
        description: "Nous n'avons pas pu générer votre parcours personnalisé. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <PageTitle title="Parcours Personnalisé | Cyber Académie" />
      
      {/* En-tête avec navigation */}
      <div className="border-b border-blue-900/30 bg-slate-900/60 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/cyber/sas-academie">
            <Button variant="ghost" className="text-blue-300 hover:text-blue-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold text-white">Votre Parcours Éclairé</h1>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">Créez votre parcours de formation personnalisé</h1>
            <p className="text-blue-300 max-w-2xl mx-auto">
              Décrivez simplement ce que vous cherchez à apprendre en cybersécurité, et notre IA générera un parcours d'apprentissage sur mesure.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-blue-900/50">
              <TabsTrigger value="saisie" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Votre objectif</TabsTrigger>
              <TabsTrigger value="resultat" disabled={parcours.length === 0} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200">Votre parcours</TabsTrigger>
            </TabsList>
            
            <TabsContent value="saisie" className="mt-6">
              <Card className="border-blue-800/50 shadow-lg bg-slate-900/70">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <label className="block text-blue-100 font-medium mb-2">
                      Décrivez votre objectif d'apprentissage en cybersécurité
                    </label>
                    <Textarea
                      placeholder="Ex: Je veux apprendre à sécuriser mon organisation contre les ransomwares, Je souhaite comprendre les bases de la cybersécurité sans jargon technique..."
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      className="min-h-[120px] text-white bg-slate-800 border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={genererParcours}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-6"
                      disabled={isGenerating || !intention.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Création de votre parcours...
                        </>
                      ) : (
                        <>
                          <LightbulbIcon className="h-5 w-5 mr-2" />
                          Générer mon parcours
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-8 border-t border-blue-900/30 pt-6">
                    <h3 className="font-medium text-blue-100 mb-3 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                      Exemples d'objectifs
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-200">
                      <li className="cursor-pointer hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-900/30" onClick={() => setIntention("Je veux comprendre les risques cyber pour bien communiquer avec nos équipes IT")}>
                        "Je veux comprendre les risques cyber pour bien communiquer avec nos équipes IT"
                      </li>
                      <li className="cursor-pointer hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-900/30" onClick={() => setIntention("Je dois mettre en place un plan de réponse aux incidents de sécurité")}>
                        "Je dois mettre en place un plan de réponse aux incidents de sécurité"
                      </li>
                      <li className="cursor-pointer hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-900/30" onClick={() => setIntention("Je souhaite apprendre à sensibiliser mes équipes aux risques de phishing")}>
                        "Je souhaite apprendre à sensibiliser mes équipes aux risques de phishing"
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resultat" className="mt-6">
              {parcours.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-blue-800/50 shadow-lg bg-slate-900/70 mb-8">
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Votre parcours personnalisé</h2>
                        <p className="text-blue-200">
                          Voici le parcours créé en temps réel pour vous, en fonction de votre objectif. 
                          Ces ressources sont générées spécifiquement pour répondre à vos besoins.
                        </p>
                      </div>
                      
                      <div className="relative pl-8 border-l-2 border-blue-600/70">
                        {parcours.map((module, index) => (
                          <motion.div 
                            key={module.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.4 }}
                            className="mb-8 relative"
                          >
                            <div className="absolute -left-[42px] bg-slate-800 p-1 rounded-full border-2 border-blue-600/70">
                              {module.icon}
                            </div>
                            <Card className="cursor-pointer hover:shadow-md transition-all border-blue-900/30 bg-slate-800/50 hover:bg-slate-800/80">
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-semibold text-white text-lg">{module.title}</h3>
                                    <p className="text-blue-200 text-sm mt-1">{module.description}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${module.color} ml-2`}>
                                      {module.type}
                                    </Badge>
                                    <Badge variant="outline" className="text-blue-300 border-blue-800">
                                      {module.duree}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="p-3 bg-slate-900/70 rounded-md border border-blue-900/20 mt-2">
                                  <div className="text-blue-100 text-sm">
                                    <div className="space-y-2">
                                      <p>Ce module de micro-learning personnalisé couvre les points clés suivants :</p>
                                      <ul className="list-disc pl-5 space-y-1 text-blue-200">
                                        {module.points_cles && module.points_cles.map((point, i) => (
                                          <li key={i}>{point}</li>
                                        ))}
                                      </ul>
                                      <div className="pt-2">
                                        <Link href={`/cyber/micro-learning?title=${encodeURIComponent(module.title)}&type=${encodeURIComponent(module.type)}&duree=${encodeURIComponent(module.duree)}&description=${encodeURIComponent(module.description)}&points=${encodeURIComponent(JSON.stringify(module.points_cles || []))}`}>
                                          <Button className="w-full bg-blue-700 hover:bg-blue-600 text-white">
                                            Accéder au contenu personnalisé
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Button 
                          onClick={() => {
                            setActiveTab('saisie');
                            setIntention('');
                            setParcours([]);
                          }}
                          variant="outline"
                          className="mr-3 border-blue-700 text-blue-300 hover:bg-blue-900/30"
                        >
                          Recommencer
                        </Button>
                        <Button className="bg-blue-700 hover:bg-blue-600 text-white">
                          Sauvegarder ce parcours
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ParcoursPersonnalise;