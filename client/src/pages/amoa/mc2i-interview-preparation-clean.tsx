import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  UserCircle, 
  User,
  Users,
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileCheck,
  Copy,
  Sparkles,
  BriefcaseBusiness,
  Lightbulb
} from 'lucide-react';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import HomeLayout from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Formulaire
const formSchema = z.object({
  profileType: z.string().min(1, "Sélectionnez un type de profil"),
  experienceLevel: z.string().min(1, "Sélectionnez un niveau d'expérience"),
  sectorFocus: z.string().min(1, "Sélectionnez un secteur d'activité"),
});

// Types pour le suivi de progression
type ProgressSection = 'preparation' | 'during' | 'after';

interface BestPracticesContentProps {
  setActiveTab: (tab: string) => void;
}

const BestPracticesContent: React.FC<BestPracticesContentProps> = ({ setActiveTab }) => {
  const [progressTracker, setProgressTracker] = useState({
    preparation: { completed: 0, total: 2 },
    during: { completed: 0, total: 5 },
    after: { completed: 0, total: 3 }
  });
  
  const incrementProgress = (section: ProgressSection, amount: number = 1) => {
    setProgressTracker(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        completed: Math.min(prev[section].completed + amount, prev[section].total)
      }
    }));
  };
  
  return (
    <div className="px-8 py-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
      {/* Section title with progress bar */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Parcours du consultant mc2i</h2>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.round(((progressTracker.preparation.completed + progressTracker.during.completed + progressTracker.after.completed) / 
              (progressTracker.preparation.total + progressTracker.during.total + progressTracker.after.total)) * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-blue-100 text-sm mb-4">
          Accomplissez les étapes pour maîtriser le processus d'audition
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={() => setActiveTab('simulation')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-md font-medium mb-2"
          >
            Passer directement à la simulation d'audition
          </Button>
        </div>
      </div>
    
      {/* Main content - Abbreviated for clarity, add your full content here */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: AVANT L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3 text-white">1</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Avant l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-purple-900/40 text-purple-200 border-purple-500">
              {progressTracker.preparation.completed}/{progressTracker.preparation.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/30 border-purple-500/50 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2 text-purple-300" />
                Préparation personnelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Contenu à compléter...</p>
            </CardContent>
          </Card>
        </div>
        
        {/* SECTION 2: PENDANT L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white">2</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Pendant l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-500">
              {progressTracker.during.completed}/{progressTracker.during.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-500/50 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-300" />
                Conduite de l'entretien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Contenu à compléter...</p>
            </CardContent>
          </Card>
        </div>
        
        {/* SECTION 3: APRÈS L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3 text-white">3</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                Après l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-green-900/40 text-green-200 border-green-500">
              {progressTracker.after.completed}/{progressTracker.after.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/30 border-green-500/50 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <FileCheck className="w-5 h-5 mr-2 text-green-300" />
                Suivi post-entretien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Contenu à compléter...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InterviewPreparationPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("best-practices");
  
  // Form pour la simulation d'audition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: "",
      experienceLevel: "",
      sectorFocus: ""
    }
  });
  
  return (
    <HomeLayout>
      <div className="flex items-center justify-start px-6 py-4">
        <Button
          variant="ghost"
          className="flex items-center text-gray-400 hover:text-white"
          onClick={() => setLocation("/amoa")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à I AM mc2i
        </Button>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">Préparation d'audition</h1>
          <p className="text-gray-300 mt-3 max-w-3xl mx-auto">
            Préparez vos auditions client : consultez les bonnes pratiques sur la tenue, l'attitude professionnelle et le comportement avant, pendant et après l'entretien, puis démarrez une simulation interactive pour vous entraîner en conditions réelles.
          </p>
        </div>
        
        <Tabs 
          defaultValue="best-practices" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto"
        >
          <TabsList className="grid grid-cols-2 mb-8 bg-gray-800/60">
            <TabsTrigger 
              value="best-practices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700/80 data-[state=active]:to-blue-700/80"
            >
              Bonnes pratiques
            </TabsTrigger>
            <TabsTrigger 
              value="simulation"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700/80 data-[state=active]:to-indigo-700/80"
            >
              Simulation d'audition
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-xl text-center">Guide complet de préparation d'audition pour les consultants mc2i</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Conseils pour optimiser votre présentation et votre comportement lors des auditions client
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <BestPracticesContent setActiveTab={setActiveTab} />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700/50 pt-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Imprimer ce guide
                </Button>
                <Button
                  onClick={() => setActiveTab('simulation')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Démarrer une simulation d'audition
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="simulation">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-xl text-center">Simulation d'audition interactive</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Préparez-vous aux auditions client avec cette simulation en conditions réelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4">
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 bg-blue-900/30 w-full mb-6">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="form">Formulaire</TabsTrigger>
                      <TabsTrigger value="simulation">Simulation complète</TabsTrigger>
                    </TabsList>

                    {/* Onglet Description */}
                    <TabsContent value="description">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Entraînez-vous à l'audition client en conditions réelles</h3>
                        <p className="text-gray-300 mb-4">Cette simulation vous permet de vous confronter à un scénario d'audition adapté à votre profil et au secteur de votre choix.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
                          <div className="bg-blue-900/30 p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">Étape 1: Configuration</h4>
                            <p className="text-sm text-gray-300">Configurez votre simulation en spécifiant votre profil, niveau d'expérience et secteur d'activité cible.</p>
                          </div>
                          <div className="bg-blue-900/30 p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">Étape 2: Entretien</h4>
                            <p className="text-sm text-gray-300">Dialoguez avec un client virtuel qui vous posera des questions adaptées au contexte de mission.</p>
                          </div>
                          <div className="bg-blue-900/30 p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">Étape 3: Évaluation</h4>
                            <p className="text-sm text-gray-300">Recevez une analyse détaillée de votre performance avec des recommandations d'amélioration.</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Formulaire */}
                    <TabsContent value="form">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 text-center">Configuration de votre simulation</h3>
                        <p className="text-gray-300 mb-6 text-center">Complétez ce formulaire pour personnaliser votre simulation d'audition</p>
                        
                        <div className="bg-blue-900/30 p-6 rounded-lg">
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(() => window.location.href = "/amoa/interview-simulation")} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="profileType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white">Type de profil</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-blue-800 border-blue-700 text-white">
                                            <SelectValue placeholder="Sélectionnez un profil" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-blue-900 text-white border-blue-700">
                                          <SelectItem value="amoa_si">AMOA SI</SelectItem>
                                          <SelectItem value="amoa_digital">AMOA Digital</SelectItem>
                                          <SelectItem value="amoa_metier">AMOA Métier</SelectItem>
                                          <SelectItem value="amoa_technique">AMOA Technique</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage className="text-red-400" />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="experienceLevel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white">Niveau d'expérience</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-blue-800 border-blue-700 text-white">
                                            <SelectValue placeholder="Sélectionnez un niveau" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-blue-900 text-white border-blue-700">
                                          <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                                          <SelectItem value="confirme">Confirmé (3-5 ans)</SelectItem>
                                          <SelectItem value="senior">Senior (6-10 ans)</SelectItem>
                                          <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage className="text-red-400" />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="sectorFocus"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Secteur d'activité</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-blue-800 border-blue-700 text-white">
                                          <SelectValue placeholder="Sélectionnez un secteur" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-blue-900 text-white border-blue-700">
                                        <SelectItem value="banque">Banque & Assurance</SelectItem>
                                        <SelectItem value="energie">Énergie & Utilities</SelectItem>
                                        <SelectItem value="public">Secteur Public</SelectItem>
                                        <SelectItem value="sante">Santé</SelectItem>
                                        <SelectItem value="transport">Transport & Logistique</SelectItem>
                                        <SelectItem value="telecom">Télécommunications</SelectItem>
                                        <SelectItem value="industrie">Industrie</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />

                              <div className="text-center mt-6">
                                <Button 
                                  type="submit"
                                  disabled={!form.formState.isValid}
                                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 w-full md:w-auto px-8"
                                >
                                  Lancer la simulation
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Simulation complète */}
                    <TabsContent value="simulation">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Simulation complète en environnement dédié</h3>
                        <p className="text-gray-300 mb-6">Accédez à une version plus immersive de la simulation dans un environnement dédié</p>
                        
                        <div className="flex justify-center">
                          <Button
                            onClick={() => window.location.href = "/amoa/interview-simulation"}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 py-6 px-8 text-lg"
                          >
                            Lancer la simulation complète
                          </Button>
                        </div>
                        
                        <p className="mt-6 text-gray-400 italic">Cette option vous redirige vers un module spécialisé offrant une expérience plus immersive avec une interface dédiée.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
};

export default InterviewPreparationPage;