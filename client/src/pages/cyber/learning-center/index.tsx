import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Zap, BookOpen, Brain, Monitor, Shield, Lock, Database, Clock, Newspaper, Code } from "lucide-react";
import HomeLayout from '@/components/layout/HomeLayout';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function CyberLearningCenter() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("modules");
  const [searchQuery, setSearchQuery] = useState("");

  const handleReturn = () => {
    setLocation('/cyber');
  };

  const handleModuleClick = (path: string) => {
    setLocation(path);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <HomeLayout>
      <div className="flex flex-col min-h-screen bg-[#0a1429]">
        {/* Header avec bouton retour */}
        <div className="w-full px-4 py-4 flex items-center bg-blue-950/50">
          <Button
            variant="ghost"
            onClick={handleReturn}
            className="text-white hover:bg-blue-900/30 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="ml-4 flex-1">
            <h1 className="text-xl font-bold text-white">CYBER ACADÉMIE</h1>
          </div>
        </div>
        
        {/* En-tête principale */}
        <div className="container mx-auto px-4 py-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">Cyber Académie</h1>
              <p className="text-blue-300 mt-1">Centre de formation complet en cybersécurité</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-900/50">
                <Monitor className="h-4 w-4 mr-2" />
                Visite guidée
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Brain className="h-4 w-4 mr-2" />
                Assistant pédagogique IA
              </Button>
            </div>
          </motion.div>
          
          {/* Barre de recherche et filtres */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                <Input 
                  placeholder="Rechercher par titre, description ou mot-clé..." 
                  className="pl-10 bg-blue-950/70 border-blue-500/30 text-white focus:border-blue-500 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                <select className="bg-blue-950/70 border border-blue-500/30 text-white px-3 py-2 rounded-md focus:border-blue-500 h-10 text-sm">
                  <option value="">Niveau</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
                <select className="bg-blue-950/70 border border-blue-500/30 text-white px-3 py-2 rounded-md focus:border-blue-500 h-10 text-sm">
                  <option value="">Catégorie</option>
                  <option value="reseau">Sécurité réseau</option>
                  <option value="application">Sécurité applicative</option>
                  <option value="cloud">Sécurité cloud</option>
                </select>
                <select className="bg-blue-950/70 border border-blue-500/30 text-white px-3 py-2 rounded-md focus:border-blue-500 h-10 text-sm">
                  <option value="">Durée</option>
                  <option value="court">&lt; 15 min</option>
                  <option value="moyen">15-30 min</option>
                  <option value="long">+30 min</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Tabs de navigation */}
          <Tabs defaultValue="modules" className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <div className="border-b border-blue-800">
              <TabsList className="bg-transparent">
                <TabsTrigger 
                  value="modules" 
                  className="text-sm data-[state=active]:text-blue-300 data-[state=active]:border-blue-400 pb-2 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  Modules
                </TabsTrigger>
                <TabsTrigger 
                  value="parcours" 
                  className="text-sm data-[state=active]:text-blue-300 data-[state=active]:border-blue-400 pb-2 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  Parcours thématiques
                </TabsTrigger>
                <TabsTrigger 
                  value="apprentissage" 
                  className="text-sm data-[state=active]:text-blue-300 data-[state=active]:border-blue-400 pb-2 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  Mon apprentissage
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Contenu des tabs */}
            <TabsContent value="modules" className="mt-6">
              <ScrollArea className="h-full">
                {/* Parcours rapide */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-10"
                >
                  <div className="flex items-center mb-6 bg-gradient-to-r from-orange-800 to-transparent p-3 rounded-md">
                    <div className="bg-orange-600 p-2 rounded mr-3">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Parcours rapide</h2>
                      <p className="text-sm text-blue-200">Apprentissage accéléré et outils d'auto-formation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Fiches Cyber Express */}
                    <Card 
                      className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 overflow-hidden group"
                      onClick={() => handleModuleClick('/cyber/learning-center/modules/fiches-cyber-express')}
                    >
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                            <h3 className="font-medium text-white mt-1">Fiches Cyber Express</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                          <span className="ml-2 text-blue-400">5-10min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Synthèses rapides sur les concepts clés de cybersécurité</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">fiches</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">synthèse</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">express</Badge>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button 
                          className="mb-4 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModuleClick('/cyber/learning-center/modules/fiches-cyber-express');
                          }}
                        >
                          Accéder aux fiches
                        </Button>
                      </div>
                    </Card>
                    
                    {/* Quiz adaptatif IA */}
                    <Card 
                      className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 overflow-hidden group"
                      onClick={() => handleModuleClick('/cyber/learning-center/modules/quiz-adaptatif-ia')}
                    >
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                            <h3 className="font-medium text-white mt-1">Quiz adaptatif IA</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                          <span className="ml-2 text-blue-400">10-15min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Évaluez vos connaissances avec des quiz personnalisés par l'IA</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">quiz</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">évaluation</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">adaptatif</Badge>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button 
                          className="mb-4 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModuleClick('/cyber/learning-center/modules/quiz-adaptatif-ia');
                          }}
                        >
                          Commencer un quiz
                        </Button>
                      </div>
                    </Card>
                    
                    {/* Glossaire visuel */}
                    <Card 
                      className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 overflow-hidden group"
                      onClick={() => handleModuleClick('/cyber/learning-center/modules/glossaire-visuel')}
                    >
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                            <h3 className="font-medium text-white mt-1">Glossaire visuel</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">débutant</span>
                          <span className="ml-2 text-blue-400">5-10min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Lexique illustré des termes techniques de cybersécurité</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">glossaire</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">terminologie</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">visuel</Badge>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button 
                          className="mb-4 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModuleClick('/cyber/learning-center/modules/glossaire-visuel');
                          }}
                        >
                          Explorer le glossaire
                        </Button>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Mémo IA personnalisé */}
                  <div className="mt-6">
                    <Card 
                      className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 overflow-hidden group"
                      onClick={() => handleModuleClick('/cyber/learning-center/modules/memo-ia-personnalise')}
                    >
                      <div className="p-5 relative">
                        <div className="flex items-start">
                          <div className="h-8 w-8 mr-3 flex items-center justify-center bg-blue-800 text-white rounded">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                                <h3 className="font-medium text-white mt-1">Mémo IA personnalisé</h3>
                              </div>
                              <div className="text-xs text-blue-300 flex items-center">
                                <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                                <span className="ml-2 text-blue-400">5-10min</span>
                              </div>
                            </div>
                            <p className="text-sm text-blue-100 my-2">Créez des aide-mémoires sur mesure grâce à l'intelligence artificielle</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">mémo</Badge>
                              <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">personnalisé</Badge>
                              <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">IA</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button 
                            className="mb-4 bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModuleClick('/cyber/learning-center/modules/memo-ia-personnalise');
                            }}
                          >
                            Créer un mémo
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>

                {/* Modules fondamentaux */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-10"
                >
                  <div className="flex items-center mb-6 bg-gradient-to-r from-blue-800 to-transparent p-3 rounded-md">
                    <div className="bg-blue-600 p-2 rounded mr-3">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Fondamentaux de la cybersécurité</h2>
                      <p className="text-sm text-blue-200">Concepts essentiels pour tous les niveaux</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Introduction à la cybersécurité */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-green-600 hover:bg-green-700 text-[10px] font-normal py-0 h-4">Fondamental</Badge>
                            <h3 className="font-medium text-white mt-1">Introduction à la cybersécurité</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">débutant</span>
                          <span className="ml-2 text-blue-400">20min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Les concepts de base et principes essentiels de la cybersécurité</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">principes</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">fondamentaux</Badge>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Phishing et ingénierie sociale */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-orange-700 text-white rounded">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-orange-600 hover:bg-orange-700 text-[10px] font-normal py-0 h-4">Populaire</Badge>
                            <h3 className="font-medium text-white mt-1">Phishing et ingénierie sociale</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                          <span className="ml-2 text-blue-400">15min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Comment reconnaître et se protéger contre les attaques par manipulation sociale</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">phishing</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">social engineering</Badge>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Mots de passe et authentification */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-green-600 hover:bg-green-700 text-[10px] font-normal py-0 h-4">Essentiel</Badge>
                            <h3 className="font-medium text-white mt-1">Sécurité des mots de passe</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">débutant</span>
                          <span className="ml-2 text-blue-400">10min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Bonnes pratiques et techniques avancées pour la gestion des mots de passe</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">mots de passe</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">MFA</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>

                {/* Modules avancés */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-10"
                >
                  <div className="flex items-center mb-6 bg-gradient-to-r from-violet-800 to-transparent p-3 rounded-md">
                    <div className="bg-violet-700 p-2 rounded mr-3">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Modules techniques avancés</h2>
                      <p className="text-sm text-blue-200">Pour approfondir vos connaissances techniques</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Zero Trust */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-purple-800 text-white rounded">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] font-normal py-0 h-4">Avancé</Badge>
                            <h3 className="font-medium text-white mt-1">Architecture Zero Trust</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">intermédiaire</span>
                          <span className="ml-2 text-blue-400">25min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Principes et mise en œuvre du modèle de sécurité "ne jamais faire confiance, toujours vérifier"</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">zero trust</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">architecture</Badge>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Sécurité des API */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-purple-800 text-white rounded">
                            <Code className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] font-normal py-0 h-4">Technique</Badge>
                            <h3 className="font-medium text-white mt-1">Sécurité des API</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">avancé</span>
                          <span className="ml-2 text-blue-400">30min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Protection des interfaces de programmation et gestion des risques associés</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">API</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">OAuth</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">JWT</Badge>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Sécurité dans le Cloud */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-purple-800 text-white rounded">
                            <Database className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] font-normal py-0 h-4">Technique</Badge>
                            <h3 className="font-medium text-white mt-1">Sécurité dans le Cloud</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">avancé</span>
                          <span className="ml-2 text-blue-400">35min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Modèles de responsabilité et stratégies de sécurisation des environnements cloud</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">cloud</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">IAM</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">CASB</Badge>
                        </div>
                      </div>
                    </Card>

                    {/* Threat Hunting */}
                    <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start mb-4">
                          <div className="h-8 w-8 mr-2 flex items-center justify-center bg-purple-800 text-white rounded">
                            <Search className="h-4 w-4" />
                          </div>
                          <div>
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] font-normal py-0 h-4">Expert</Badge>
                            <h3 className="font-medium text-white mt-1">Threat Hunting</h3>
                          </div>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center mb-2">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">expert</span>
                          <span className="ml-2 text-blue-400">40min</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">Méthodologies et techniques de chasse aux menaces proactive</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">SOC</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">menaces</Badge>
                          <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">détection</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="parcours" className="mt-6">
              <div className="bg-blue-900/30 p-6 rounded-lg text-center">
                <p className="text-blue-200">Les parcours thématiques seront disponibles prochainement</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Recevoir une notification
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="apprentissage" className="mt-6">
              <div className="bg-blue-900/30 p-6 rounded-lg text-center">
                <p className="text-blue-200">Votre espace d'apprentissage personnalisé sera disponible prochainement</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Newspaper className="h-4 w-4 mr-2" />
                  S'inscrire à la newsletter
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}