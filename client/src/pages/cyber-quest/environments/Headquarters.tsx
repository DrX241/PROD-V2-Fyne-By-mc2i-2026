import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { 
  Shield, 
  Monitor, 
  Users, 
  Database, 
  Globe, 
  Server, 
  Terminal, 
  Lock, 
  AlertTriangle, 
  Eye,
  Mail
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Headquarters: React.FC = () => {
  const { player, currentEnvironment } = useCyberQuest();
  const [activeZone, setActiveZone] = useState<string>('command-center');
  
  if (!currentEnvironment) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Chargement du quartier général...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg"></div>
        <Card className="relative z-10 border-blue-500/50 bg-opacity-90">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Quartier Général de CyberDef</CardTitle>
                <CardDescription>
                  Centre d'opérations centralisé pour la coordination des missions de cybersécurité.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Niveau d'accréditation: {player?.level || 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Un centre d'opérations où toute activité de cybersécurité est surveillée. Les analystes 
              travaillent pour surveiller les incidents et coordonner les équipes d'intervention.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${activeZone === 'command-center' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => setActiveZone('command-center')}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Centre de commande</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>
                    Aperçu des missions et activités en cours
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${activeZone === 'soc' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                onClick={() => setActiveZone('soc')}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">SOC</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>
                    Centre de surveillance des opérations de sécurité
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${activeZone === 'briefing' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                onClick={() => setActiveZone('briefing')}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">Salle de briefing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>
                    Rencontrez votre équipe et discutez des missions
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${activeZone === 'lab' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                onClick={() => setActiveZone('lab')}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-base">Laboratoire technique</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>
                    Analyse des malwares et recherche de vulnérabilités
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-1">
        {activeZone === 'command-center' && (
          <CommandCenter />
        )}
        
        {activeZone === 'soc' && (
          <SOC />
        )}
        
        {activeZone === 'briefing' && (
          <BriefingRoom />
        )}
        
        {activeZone === 'lab' && (
          <TechnicalLab />
        )}
      </div>
    </div>
  );
};

const CommandCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="h-5 w-5 text-blue-500 mr-2" />
            Tableau de bord des incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Incidents bas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">2</p>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Incidents moyens</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">3</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Incidents critiques</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">1</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                <h3 className="font-medium">Derniers incidents</h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Dernières 24h
                </Badge>
              </div>
              <div className="divide-y">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span>Attaque DDoS détectée sur serveur principal</span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                    Critique
                  </Badge>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Tentative d'injection SQL sur l'application web</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    Moyen
                  </Badge>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Activité suspecte sur compte admin</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    Moyen
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 text-blue-500 mr-2" />
            Statut des déploiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-medium">Infrastructure</h3>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Serveurs principaux</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Bases de données</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Systèmes de sécurité</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      Partiel
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-medium">Applications</h3>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Portail client</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Terminal className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">API services</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Système d'authentification</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      En ligne
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SOC: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 text-amber-500 mr-2" />
          Centre des Opérations de Sécurité (SOC)
        </CardTitle>
        <CardDescription>
          Surveillance en temps réel des menaces et alertes de sécurité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-center text-gray-500">
              Cette section est en cours de développement et sera disponible prochainement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Alertes actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex justify-between">
                    <span className="text-sm">Intrusion périmètre réseau</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      Critique
                    </Badge>
                  </div>
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex justify-between">
                    <span className="text-sm">Tentative d'accès non autorisé</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      Moyen
                    </Badge>
                  </div>
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex justify-between">
                    <span className="text-sm">Comportement suspect utilisateur</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      Moyen
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Analyses en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex justify-between">
                    <span className="text-sm">Scan vulnérabilités serveur web</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      65%
                    </Badge>
                  </div>
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex justify-between">
                    <span className="text-sm">Analyse malware détecté</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      42%
                    </Badge>
                  </div>
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex justify-between">
                    <span className="text-sm">Revue logs authentification</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      89%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BriefingRoom: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 text-green-500 mr-2" />
          Salle de Briefing
        </CardTitle>
        <CardDescription>
          Centre de coordination et de planification des missions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Tabs defaultValue="team" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="team">Votre équipe</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="missions">Briefings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="team" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Alex</CardTitle>
                        <CardDescription>Chef d'équipe</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Spécialiste en gestion de crise et coordination d'équipe.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="h-4 w-4 mr-2" /> Contacter
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Terminal className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Mia</CardTitle>
                        <CardDescription>Analyste technique</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Experte en analyse de code malveillant et rétro-ingénierie.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="h-4 w-4 mr-2" /> Contacter
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Léo</CardTitle>
                        <CardDescription>Agent de terrain</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Spécialiste en reconnaissance et collecte d'informations.
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="h-4 w-4 mr-2" /> Contacter
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-medium">Compétences d'équipe</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Analyse forensique</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Renseignement sur les menaces</span>
                        <span className="text-sm text-gray-500">90%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Réponse aux incidents</span>
                        <span className="text-sm text-gray-500">60%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">Avez-vous terminé l'analyse du malware trouvé sur le serveur principal ?</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Vous - 10:24</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">J'ai presque terminé l'analyse. C'est un ransomware sophistiqué avec des capacités d'auto-propagation. Je vous envoie le rapport complet dans une heure.</p>
                        <p className="text-xs text-gray-500 mt-1">Mia - 10:30</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">Réunion d'urgence à 14h pour discuter de la nouvelle menace détectée. Votre présence est requise.</p>
                        <p className="text-xs text-gray-500 mt-1">Alex - 11:15</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">Je serai présent. J'apporte les résultats de notre dernière analyse.</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Vous - 11:22</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex w-full">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button className="rounded-l-none">Envoyer</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="missions" className="space-y-4 mt-4">
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-center text-gray-500">
                  Cette section est en cours de développement et sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

const TechnicalLab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 text-purple-500 mr-2" />
          Laboratoire Technique
        </CardTitle>
        <CardDescription>
          Centre de recherche et d'analyse de sécurité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-center text-gray-500">
              Cette section est en cours de développement et sera disponible prochainement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Outils disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-500 mr-2" />
                      <span>Analyseur de vulnérabilités</span>
                    </div>
                    <Badge>Niveau 1</Badge>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Terminal className="h-4 w-4 text-green-500 mr-2" />
                      <span>Scanner de réseau</span>
                    </div>
                    <Badge>Niveau 1</Badge>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-amber-500 mr-2" />
                      <span>Suite forensique</span>
                    </div>
                    <Badge variant="outline">Verrouillé</Badge>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-red-500 mr-2" />
                      <span>Déchiffreur avancé</span>
                    </div>
                    <Badge variant="outline">Verrouillé</Badge>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recherches en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Analyse de la nouvelle souche de ransomware</span>
                      <span className="text-sm text-gray-500">45%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Développement de correctifs de sécurité</span>
                      <span className="text-sm text-gray-500">76%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Test d'intrusion réseau</span>
                      <span className="text-sm text-gray-500">31%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '31%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Headquarters;