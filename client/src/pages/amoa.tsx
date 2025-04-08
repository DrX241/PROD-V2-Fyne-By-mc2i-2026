import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  BrainCircuit, 
  CheckCircle2, 
  Route, 
  ListChecks, 
  ZapIcon,
  Users,
  FileText,
  MessageSquare,
  BarChart2,
  ChevronRight,
  Clock,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HomeLayout from "@/components/layout/HomeLayout";

export default function AmoaPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("modules");

  // Liste des modules disponibles
  const modules = [
    {
      id: "amoa-quest",
      title: "AMOA Quest",
      description: "Parcourez une aventure narrative interactive où vous incarnez un Assistant à Maîtrise d'Ouvrage confronté à des défis réels de gestion de projet.",
      icon: <Route className="h-10 w-10 text-blue-500" />,
      level: "Tous niveaux",
      duration: "45-60 min",
      path: "/amoa/quest",
      isNew: true,
      status: "available",
      color: "from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-500",
      skills: ["Analyse des besoins", "Communication", "Gestion des parties prenantes", "Documentation"]
    },
    {
      id: "sim-project",
      title: "Simulateur de Gestion de Projet IA-assisté",
      description: "Expérimentez la gestion de projets virtuels en temps réel avec une IA qui simule les réactions des équipes et les évènements aléatoires.",
      icon: <Clock className="h-10 w-10 text-indigo-500" />,
      level: "Intermédiaire",
      duration: "60-90 min",
      path: "/amoa/simulator",
      isNew: true,
      status: "soon",
      color: "from-indigo-50 to-indigo-100 border-indigo-200",
      iconBg: "bg-indigo-500",
      skills: ["Planification", "Allocation de ressources", "Gestion des risques", "Suivi de projet"]
    },
    {
      id: "toolkit-amoa",
      title: "Toolkit AMOA",
      description: "Laboratoire de création de documents assisté par IA. Pratiquez la rédaction de spécifications, cahiers des charges et user stories.",
      icon: <FileText className="h-10 w-10 text-emerald-500" />,
      level: "Intermédiaire",
      duration: "Variable",
      path: "/amoa/toolkit",
      isNew: false,
      status: "soon",
      color: "from-emerald-50 to-emerald-100 border-emerald-200",
      iconBg: "bg-emerald-500",
      skills: ["Rédaction technique", "Spécifications", "User Stories", "Analyse fonctionnelle"]
    },
    {
      id: "crisis-manager",
      title: "Crisis Manager",
      description: "Simulation de crise projet où vous devez gérer des situations imprévues et résoudre des problèmes complexes en temps limité.",
      icon: <ZapIcon className="h-10 w-10 text-amber-500" />,
      level: "Avancé",
      duration: "30-40 min",
      path: "/amoa/crisis",
      isNew: false,
      status: "soon",
      color: "from-amber-50 to-amber-100 border-amber-200",
      iconBg: "bg-amber-500",
      skills: ["Gestion de crise", "Résolution de problèmes", "Prise de décision", "Communication de crise"]
    },
    {
      id: "methodologie-showdown",
      title: "Méthodologie Showdown",
      description: "Jeu stratégique où vous confrontez différentes méthodologies de gestion de projet selon les contextes et exigences.",
      icon: <BarChart2 className="h-10 w-10 text-purple-500" />,
      level: "Expert",
      duration: "45-60 min",
      path: "/amoa/methodology",
      isNew: false,
      status: "soon",
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconBg: "bg-purple-500",
      skills: ["Agilité", "Cycle en V", "SCRUM", "SAFe", "Hybride"]
    },
    {
      id: "business-value",
      title: "Business Value Optimizer",
      description: "Jeu d'optimisation de valeur métier où vous devez équilibrer les contraintes techniques, financières et stratégiques pour maximiser le ROI.",
      icon: <TrendingUp className="h-10 w-10 text-teal-500" />,
      level: "Avancé",
      duration: "40-60 min",
      path: "/amoa/business-value",
      isNew: false,
      status: "soon",
      color: "from-teal-50 to-teal-100 border-teal-200",
      iconBg: "bg-teal-500",
      skills: ["Analyse coût-bénéfice", "Priorisation", "Stratégie d'entreprise", "ROI"]
    },
    {
      id: "communication-arena",
      title: "Communication Arena",
      description: "Entraînez-vous aux compétences relationnelles essentielles pour un AMOA : facilitation de réunions, négociation, et gestion des conflits.",
      icon: <MessageSquare className="h-10 w-10 text-rose-500" />,
      level: "Tous niveaux",
      duration: "30-45 min",
      path: "/amoa/communication",
      isNew: false,
      status: "soon",
      color: "from-rose-50 to-rose-100 border-rose-200",
      iconBg: "bg-rose-500",
      skills: ["Facilitation", "Négociation", "Gestion des conflits", "Présentation"]
    }
  ];

  const features = [
    {
      title: "IA Conversationnelle",
      description: "Interagissez avec des personnages IA avancés qui s'adaptent à vos choix et réponses",
      icon: <MessageSquare className="h-8 w-8 text-[#006a9e]" />
    },
    {
      title: "Scénarios Adaptatifs",
      description: "Des histoires qui évoluent en fonction de vos décisions et de votre style de management",
      icon: <BrainCircuit className="h-8 w-8 text-[#006a9e]" />
    },
    {
      title: "Feedback Personnalisé",
      description: "Analyses détaillées de vos compétences et suggestions d'amélioration basées sur l'IA",
      icon: <CheckCircle2 className="h-8 w-8 text-[#006a9e]" />
    },
    {
      title: "Équipes Virtuelles",
      description: "Collaborez avec des équipes simulées pour développer vos compétences de leadership",
      icon: <Users className="h-8 w-8 text-[#006a9e]" />
    }
  ];

  // Fonction pour navigation
  const navigateToModule = (path: string) => {
    setLocation(path);
  };

  return (
    <HomeLayout>
      <div className="bg-gradient-to-b from-gray-900 via-[#006a9e] to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 p-2 bg-white/10 backdrop-blur-sm rounded-full">
              <ListChecks className="h-8 w-8 text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              I AM AMOA
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Perfectionnez vos compétences en assistance à maîtrise d'ouvrage à travers des expériences immersives guidées par l'IA
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-12">
        <Card className="border-t-4 border-t-[#006a9e]">
          <CardContent className="p-6">
            <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8 bg-slate-100">
                <TabsTrigger value="modules" className="text-sm md:text-base">
                  Modules d'apprentissage
                </TabsTrigger>
                <TabsTrigger value="features" className="text-sm md:text-base">
                  Fonctionnalités
                </TabsTrigger>
                <TabsTrigger value="about" className="text-sm md:text-base">
                  À propos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="modules" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((module) => (
                    <Card 
                      key={module.id}
                      className={`transition-all border hover:border-[#006a9e]/40 hover:shadow-lg overflow-hidden bg-gradient-to-br ${module.color}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className={`${module.iconBg} p-2 rounded-lg text-white mb-3`}>
                            {module.icon}
                          </div>
                          
                          {module.isNew && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                          
                          {module.status === "soon" && (
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Bientôt disponible
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {module.skills.map((skill, index) => (
                            <span key={index} className="bg-white/50 text-gray-700 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{module.level}</span>
                          </div>
                          <div className="flex items-center">
                            <BrainCircuit className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{module.duration}</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-2">
                        <Button 
                          className={module.status === "available" ? "bg-[#006a9e] hover:bg-[#00587e] text-white w-full" : "bg-gray-300 cursor-not-allowed text-gray-600 w-full"}
                          onClick={() => module.status === "available" && navigateToModule(module.path)}
                          disabled={module.status !== "available"}
                        >
                          {module.status === "available" ? "Lancer le module" : "Bientôt disponible"}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Caractéristiques uniques d'I AM AMOA</CardTitle>
                    <CardDescription>
                      Découvrez comment notre technologie IA transforme l'apprentissage des compétences AMOA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {features.map((feature, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4 bg-blue-50 p-2 rounded-lg h-fit">
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>À propos d'I AM AMOA</CardTitle>
                    <CardDescription>
                      Notre vision pour la formation des assistants à maîtrise d'ouvrage du futur
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      <strong>I AM AMOA</strong> est né d'un constat simple : les compétences en assistance à maîtrise d'ouvrage 
                      sont essentielles mais difficiles à développer sans une pratique concrète. Notre plateforme utilise l'intelligence 
                      artificielle générative pour créer des environnements d'apprentissage qui simulent la complexité et les défis du monde réel.
                    </p>
                    
                    <p>
                      Chaque module est conçu par des experts en AMOA et des pédagogues, puis enrichi par notre technologie d'IA 
                      pour offrir des interactions humaines réalistes et des scénarios adaptés à chaque apprenant. Notre objectif 
                      est de vous permettre d'apprendre par l'expérience, en développant les compétences techniques et relationnelles 
                      indispensables au métier.
                    </p>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-3">Nos objectifs pédagogiques</h3>
                    
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Développer l'expertise en analyse et expression des besoins</li>
                      <li>Renforcer les compétences en communication et gestion des parties prenantes</li>
                      <li>Maîtriser les méthodologies de gestion de projet adaptées aux différents contextes</li>
                      <li>Améliorer la capacité à anticiper et gérer les risques</li>
                      <li>Perfectionner les techniques de rédaction de documentation technique et fonctionnelle</li>
                    </ul>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <h4 className="text-base font-medium text-[#006a9e] mb-2">À venir prochainement</h4>
                      <p className="text-sm">
                        De nouveaux modules seront régulièrement ajoutés, avec une certification officielle I AM AMOA 
                        qui valorisera vos compétences acquises sur la plateforme. Restez connectés !
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </HomeLayout>
  );
}