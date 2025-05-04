import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, File, Shield, User, Clock, Calendar, MessageSquare, Database, Server, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import CyberInvestigatorChat from '@/components/cyber/investigator/CyberInvestigatorChat';
import EducationalContent from '@/components/cyber/investigator/EducationalContent';
import { apiRequest } from '@/lib/queryClient';

export default function DataLeakInvestigation() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Récupération des informations du cas
  const { data: caseInfo, isLoading } = useQuery({
    queryKey: ['cyber-investigator', 'case-info', 'data-leak'],
    queryFn: async () => {
      return apiRequest<any>('/api/cyber-investigator/case/data-leak', {
        method: 'GET'
      });
    }
  });

  // Définition des onglets de l'enquête
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <File className="h-4 w-4" /> },
    { id: 'evidence', label: 'Preuves', icon: <Database className="h-4 w-4" /> },
    { id: 'chat', label: 'Assistant Virtuel', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'learn', label: 'Ressources', icon: <Shield className="h-4 w-4" /> }
  ];

  // Exemple de preuves pour l'enquête
  const evidences = [
    {
      id: 'email-logs',
      title: 'Logs de messagerie',
      type: 'log',
      description: 'Journaux des serveurs de messagerie du dernier mois',
      icon: <Mail className="h-5 w-5" />,
      category: 'réseau'
    },
    {
      id: 'access-logs',
      title: 'Journaux d\'accès',
      type: 'log',
      description: 'Enregistrements d\'accès aux documents confidentiels',
      icon: <Database className="h-5 w-5" />,
      category: 'système'
    },
    {
      id: 'employee-list',
      title: 'Liste des employés',
      type: 'document',
      description: 'Employés ayant accès aux documents concernés',
      icon: <User className="h-5 w-5" />,
      category: 'personnel'
    },
    {
      id: 'server-backup',
      title: 'Sauvegarde des serveurs',
      type: 'data',
      description: 'Sauvegarde des serveurs de fichiers de l\'entreprise',
      icon: <Server className="h-5 w-5" />,
      category: 'système'
    },
    {
      id: 'calendar-events',
      title: 'Calendriers partagés',
      type: 'data',
      description: 'Emplois du temps et réunions récentes',
      icon: <Calendar className="h-5 w-5" />,
      category: 'personnel'
    }
  ];

  // Carte pour les dates clés de l'incident
  const timeline = [
    { date: '15/03/2025', event: 'Documents confidentiels retrouvés chez un concurrent' },
    { date: '17/03/2025', event: 'Début de l\'enquête interne' },
    { date: '18/03/2025', event: 'Analyse des logs d\'accès aux documents' },
    { date: '20/03/2025', event: 'Entretiens préliminaires avec les employés' }
  ];

  return (
    <HomeLayout>
      <PageTitle title="Fuite de Données Confidentielles" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade/cyber-investigator">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <File className="mr-3 h-8 w-8" /> 
              Fuite de Données Confidentielles
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panneau principal */}
            <div className="lg:col-span-2">
              <Card className="bg-white/95 dark:bg-gray-900/95 border-none shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-none">
                      Niveau: Débutant
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Durée estimée: 45 minutes</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">
                    {isLoading ? "Chargement..." : caseInfo?.case?.title || "Fuite de Données Confidentielles"}
                  </CardTitle>
                  <CardDescription>
                    {isLoading ? "Chargement..." : caseInfo?.case?.description || "Une société technologique a subi une fuite de données sensibles. Enquêtez pour déterminer qui en est responsable."}
                  </CardDescription>
                </CardHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4 w-full">
                    {tabs.map(tab => (
                      <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                        {tab.icon}
                        <span className="ml-2 hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Vue d'ensemble */}
                  <TabsContent value="overview" className="m-0">
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Scénario</h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {isLoading 
                              ? "Chargement..." 
                              : caseInfo?.case?.scenario || 
                                "TechVision, une entreprise de développement logiciel, a découvert que des documents confidentiels concernant son nouveau produit ont été divulgués à un concurrent. La direction soupçonne une fuite interne. Vous êtes chargé de l'enquête numérique pour identifier la source de cette fuite."}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Informations contextuelles</h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {isLoading 
                              ? "Chargement..." 
                              : caseInfo?.case?.backgroundInfo || 
                                "L'incident a été découvert il y a 3 jours lorsque des spécifications techniques confidentielles sont apparues dans une présentation du concurrent. Les documents divulgués étaient accessibles à environ 15 employés au sein de l'entreprise. La fuite concerne des plans de développement, des spécifications techniques et des analyses de marché pour un produit non encore annoncé."}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Chronologie des événements</h3>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="space-y-3">
                              {timeline.map((event, index) => (
                                <div key={index} className="flex">
                                  <div className="mr-4 flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{event.date}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{event.event}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Objectifs de l'investigation</h3>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                            <li>Identifier comment les documents confidentiels ont quitté l'entreprise</li>
                            <li>Déterminer qui est responsable de la fuite</li>
                            <li>Établir une chronologie précise de l'incident</li>
                            <li>Comprendre la motivation derrière cette fuite</li>
                            <li>Recueillir des preuves numériques solides pour étayer vos conclusions</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                  
                  {/* Preuves */}
                  <TabsContent value="evidence" className="m-0">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evidences.map((evidence) => (
                          <motion.div 
                            key={evidence.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-start">
                                  <div className="mr-3 mt-1 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                    {evidence.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{evidence.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{evidence.description}</p>
                                    <div className="mt-2 flex items-center">
                                      <Badge variant="outline" className="mr-2">
                                        {evidence.type}
                                      </Badge>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{evidence.category}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">Conseils pour l'analyse</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                              Pour explorer les preuves en détail, utilisez l'Assistant Virtuel dans l'onglet correspondant.
                              Posez des questions précises sur chaque élément pour obtenir des insights pertinents.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                  
                  {/* Assistant Virtuel */}
                  <TabsContent value="chat" className="m-0">
                    <CardContent className="flex justify-center p-4">
                      <CyberInvestigatorChat 
                        caseId="data-leak"
                        className="w-full" 
                        minimizable={false}
                      />
                    </CardContent>
                  </TabsContent>
                  
                  {/* Ressources */}
                  <TabsContent value="learn" className="m-0">
                    <CardContent className="p-4">
                      <EducationalContent className="w-full" />
                    </CardContent>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
            
            {/* Panneau latéral */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Carte des techniques d'investigation */}
                <Card className="bg-white/95 dark:bg-gray-900/95 border-none shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Techniques d'investigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <ul className="space-y-2">
                        {(isLoading ? [] : caseInfo?.case?.techniques || [
                          'Analyse de logs d\'accès', 
                          'Examen des communications', 
                          'Analyse forensique des postes de travail', 
                          'Entretiens avec les suspects'
                        ]).map((technique, index) => (
                          <li key={index} className="flex items-start">
                            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-0.5">
                              <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{technique}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* Carte des conseils */}
                <Card className="bg-white/95 dark:bg-gray-900/95 border-none shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Conseils pour réussir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="text-blue-600 mr-2">•</div>
                        <span className="text-gray-700 dark:text-gray-300">Commencez par examiner les logs d'accès aux documents concernés</span>
                      </li>
                      <li className="flex items-start">
                        <div className="text-blue-600 mr-2">•</div>
                        <span className="text-gray-700 dark:text-gray-300">Recherchez des comportements anormaux dans les heures de connexion</span>
                      </li>
                      <li className="flex items-start">
                        <div className="text-blue-600 mr-2">•</div>
                        <span className="text-gray-700 dark:text-gray-300">Analysez les communications externes des employés suspects</span>
                      </li>
                      <li className="flex items-start">
                        <div className="text-blue-600 mr-2">•</div>
                        <span className="text-gray-700 dark:text-gray-300">Établissez une chronologie précise des événements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="text-blue-600 mr-2">•</div>
                        <span className="text-gray-700 dark:text-gray-300">N'oubliez pas de chercher les motivations potentielles</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Carte d'aide */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <MessageSquare className="h-6 w-6 mr-2" />
                      <h3 className="font-semibold text-lg">Besoin d'aide ?</h3>
                    </div>
                    <p className="mb-4 text-blue-100">
                      Si vous êtes bloqué dans votre enquête, n'hésitez pas à poser des questions à l'Assistant Virtuel dans l'onglet correspondant.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-blue-700 hover:bg-blue-50"
                      onClick={() => setActiveTab('chat')}
                    >
                      Consulter l'assistant
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}