import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  ChevronRight, 
  BrainCircuit, 
  ListChecks, 
  Shield, 
  LineChart, 
  AlertCircle,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ComexTraining: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('module');

  // Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900/40 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton de retour */}
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6 bg-black/50 border-emerald-700 text-emerald-400 hover:bg-black/70 hover:text-emerald-300 hover:border-emerald-600"
          onClick={() => setLocation('/cyber/roleplay')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux Scénarios
        </Button>

        {/* En-tête de la page */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-emerald-800 bg-opacity-50">
              <BrainCircuit className="h-10 w-10 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-300">Formation Cybersécurité pour Dirigeants</h1>
              <p className="text-emerald-200 mt-1">Maîtriser les enjeux stratégiques de la sécurité numérique</p>
            </div>
          </div>
          <div className="bg-black/30 border border-emerald-800/30 rounded-lg p-5 mt-4">
            <h2 className="text-xl font-semibold mb-3 text-emerald-300">Présentation du Programme</h2>
            <p className="text-gray-300 mb-4">
              Cette formation a été spécialement conçue pour les membres du comité exécutif et les dirigeants d'entreprise. 
              Elle vous permettra de vous approprier les enjeux et les clés stratégiques de la sécurité numérique pour prendre 
              des décisions éclairées.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start">
                <div className="p-2 bg-emerald-800/30 rounded-full mr-3 mt-1">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-200">Gouvernance et Stratégie</h3>
                  <p className="text-sm text-gray-300">Intégration de la cybersécurité dans la stratégie globale de l'entreprise</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-emerald-800/30 rounded-full mr-3 mt-1">
                  <LineChart className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-200">Risques et Impact</h3>
                  <p className="text-sm text-gray-300">Évaluation et priorisation des risques numériques pour l'entreprise</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-emerald-800/30 rounded-full mr-3 mt-1">
                  <Scale className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-200">Conformité et Réglementation</h3>
                  <p className="text-sm text-gray-300">Comprendre les exigences légales et les enjeux de responsabilité</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-emerald-800/30 rounded-full mr-3 mt-1">
                  <AlertCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-200">Gestion de Crise</h3>
                  <p className="text-sm text-gray-300">Préparation et coordination de la réponse aux incidents majeurs</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Badge className="bg-emerald-800/50 text-emerald-200 px-3 py-1">
                Formation interactive adaptée aux décideurs
              </Badge>
              <Badge className="bg-emerald-800/50 text-emerald-200 px-3 py-1 ml-2">
                Durée: 4 modules de 1h30
              </Badge>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="module" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-900/70 border border-emerald-800/20">
            <TabsTrigger value="module" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-200">
              Modules
            </TabsTrigger>
            <TabsTrigger value="objectives" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-200">
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-200">
              Méthodologie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="module">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {/* Module 1 */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/70 border-emerald-800/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-black/20 rounded-full">
                          <Shield className="h-6 w-6 text-emerald-200" />
                        </div>
                        <h3 className="text-xl font-semibold ml-3 text-white">Module 1: Mesurer le risque numérique</h3>
                      </div>
                      <Badge className="bg-emerald-700/50 text-emerald-100">1h30</Badge>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Comprendre la nature et l'ampleur des risques cyber pour votre organisation. Évaluer 
                        les impacts potentiels sur votre activité, votre réputation et vos obligations légales.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Cartographie des risques numériques</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Évaluation de la maturité cyber</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Étude de cas: incidents majeurs et leurs impacts</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-emerald-900/20 bg-black/20 flex justify-between">
                    <div className="text-sm text-emerald-300">Évaluation interactive en fin de module</div>
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white" disabled>
                      Bientôt disponible
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Module 2 */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/70 border-emerald-800/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-black/20 rounded-full">
                          <ListChecks className="h-6 w-6 text-emerald-200" />
                        </div>
                        <h3 className="text-xl font-semibold ml-3 text-white">Module 2: Identifier les risques majeurs</h3>
                      </div>
                      <Badge className="bg-emerald-700/50 text-emerald-100">1h30</Badge>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Reconnaître les principales menaces actuelles et les vulnérabilités spécifiques à votre secteur d'activité. 
                        Prioriser les risques en fonction de leur probabilité et de leur impact potentiel.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Panorama des cybermenaces actuelles</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Identification des actifs critiques</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Méthode de priorisation des risques</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-emerald-900/20 bg-black/20 flex justify-between">
                    <div className="text-sm text-emerald-300">Atelier de mise en pratique</div>
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white" disabled>
                      Bientôt disponible
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Module 3 */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/70 border-emerald-800/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-black/20 rounded-full">
                          <LineChart className="h-6 w-6 text-emerald-200" />
                        </div>
                        <h3 className="text-xl font-semibold ml-3 text-white">Module 3: Identifier les actions prioritaires</h3>
                      </div>
                      <Badge className="bg-emerald-700/50 text-emerald-100">1h30</Badge>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Définir une stratégie cybersécurité alignée avec les objectifs de l'entreprise. 
                        Déterminer les investissements prioritaires et les mesures à mettre en place.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Élaboration d'une stratégie cyber</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Allocation optimale des ressources</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Indicateurs clés de performance (KPI)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-emerald-900/20 bg-black/20 flex justify-between">
                    <div className="text-sm text-emerald-300">Simulation de comité stratégique</div>
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white" disabled>
                      Bientôt disponible
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Module 4 */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/70 border-emerald-800/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-black/20 rounded-full">
                          <AlertCircle className="h-6 w-6 text-emerald-200" />
                        </div>
                        <h3 className="text-xl font-semibold ml-3 text-white">Module 4: Réagir en cas de crise cyber</h3>
                      </div>
                      <Badge className="bg-emerald-700/50 text-emerald-100">1h30</Badge>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Préparer votre organisation à faire face à un incident majeur. Comprendre votre rôle en 
                        tant que dirigeant dans la gestion de crise cyber et la communication de crise.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Organisation de la cellule de crise</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Communication interne et externe</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-emerald-400 mr-2" />
                          <span className="text-emerald-200">Exercice de simulation de crise</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-emerald-900/20 bg-black/20 flex justify-between">
                    <div className="text-sm text-emerald-300">Mise en situation de gestion de crise</div>
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white" disabled>
                      Bientôt disponible
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="objectives">
            <Card className="bg-gray-900/70 border-emerald-800/30">
              <CardHeader>
                <CardTitle className="text-emerald-300">Objectifs pédagogiques</CardTitle>
                <CardDescription className="text-gray-300">
                  Cette formation vise à permettre aux dirigeants d'entreprise de s'approprier les enjeux et les clés stratégiques de la sécurité numérique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-emerald-200 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-emerald-400" />
                      Comprendre pour décider
                    </h3>
                    <p className="text-gray-300 pl-7">
                      Acquérir une compréhension stratégique des enjeux cyber pour prendre des décisions éclairées 
                      sans nécessiter d'expertise technique approfondie.
                    </p>
                  </div>
                  
                  <Separator className="bg-emerald-900/20" />
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-emerald-200 flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-emerald-400" />
                      Développer une gouvernance efficace
                    </h3>
                    <p className="text-gray-300 pl-7">
                      Mettre en place une gouvernance cyber adaptée à la taille et aux enjeux de votre entreprise, 
                      avec les bons indicateurs de pilotage.
                    </p>
                  </div>
                  
                  <Separator className="bg-emerald-900/20" />
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-emerald-200 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-emerald-400" />
                      Préparer la gestion de crise
                    </h3>
                    <p className="text-gray-300 pl-7">
                      Être prêt à diriger efficacement lors d'un incident cyber majeur, en comprenant les enjeux 
                      techniques, juridiques, financiers et réputationnels.
                    </p>
                  </div>
                  
                  <Separator className="bg-emerald-900/20" />
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-emerald-200 flex items-center">
                      <Scale className="h-5 w-5 mr-2 text-emerald-400" />
                      Respecter les obligations légales
                    </h3>
                    <p className="text-gray-300 pl-7">
                      Connaître les exigences réglementaires applicables à votre secteur d'activité et les 
                      responsabilités légales des dirigeants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology">
            <Card className="bg-gray-900/70 border-emerald-800/30">
              <CardHeader>
                <CardTitle className="text-emerald-300">Méthodologie pédagogique</CardTitle>
                <CardDescription className="text-gray-300">
                  Une approche pragmatique et interactive spécialement conçue pour les dirigeants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/20 p-5 rounded-lg border border-emerald-900/30">
                    <h3 className="font-semibold text-emerald-200 mb-3">Format adapté aux décideurs</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Sessions concises de 1h30 par module</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Langage accessible, sans jargon technique</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Focus sur les aspects stratégiques plutôt que techniques</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 p-5 rounded-lg border border-emerald-900/30">
                    <h3 className="font-semibold text-emerald-200 mb-3">Apprentissage actif</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Études de cas réels adaptés à votre secteur</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Exercices de simulation de comité de crise</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Discussions guidées sur les enjeux stratégiques</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 p-5 rounded-lg border border-emerald-900/30">
                    <h3 className="font-semibold text-emerald-200 mb-3">Ressources et outils</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Kit du dirigeant avec fiches synthétiques</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Modèles de tableaux de bord cyber pour COMEX</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Guide d'élaboration d'une politique cyber</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 p-5 rounded-lg border border-emerald-900/30">
                    <h3 className="font-semibold text-emerald-200 mb-3">Suivi personnalisé</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Auto-évaluation de la maturité de votre organisation</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Plan d'action personnalisé à l'issue de la formation</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mr-2 mt-1" />
                        <span>Session de questions-réponses dédiée</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Appel à l'action */}
        <div className="bg-gradient-to-r from-emerald-900/80 to-emerald-800/50 border border-emerald-700/50 p-6 rounded-lg shadow-lg text-center mt-10">
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à renforcer votre maîtrise des enjeux cyber ?</h2>
          <p className="text-emerald-200 mb-6 max-w-2xl mx-auto">
            Cette formation est en cours de développement et sera bientôt disponible. Restez informé de son lancement.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              className="bg-emerald-700 hover:bg-emerald-600 text-white py-6 px-8"
              disabled
            >
              Demander une présentation personnalisée
            </Button>
            <Button 
              variant="outline" 
              className="border-emerald-600 text-emerald-300 hover:bg-emerald-900/50 py-6 px-8"
              onClick={() => setLocation('/cyber/roleplay')}
            >
              Explorer d'autres formations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComexTraining;