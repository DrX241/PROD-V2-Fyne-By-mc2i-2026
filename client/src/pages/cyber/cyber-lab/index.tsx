import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Shield, Network, ArrowRight, ArrowLeft, Cpu, Server, Database, Code } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import { Helmet } from 'react-helmet';

export default function CyberLabPage() {
  const [, setLocation] = useLocation();
  const [activeModule, setActiveModule] = useState<'none' | 'pentest' | 'network'>('none');

  const handleModuleSelection = (module: 'pentest' | 'network') => {
    setActiveModule(module);
  };

  const goToModule = () => {
    if (activeModule === 'pentest') {
      setLocation('/cyber/pentest-lab');
    } else if (activeModule === 'network') {
      setLocation('/cyber/network-lab');
    }
  };

  return (
    <HomeLayout>
      <Helmet>
        <title>CYBER LAB | FYNE</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-gray-900 border-gray-800 text-gray-100 mb-8">
          <CardHeader>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-950 border-purple-800 mr-4"
                onClick={() => setLocation('/cyber')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <div>
                <CardTitle className="text-2xl font-data-title bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent">
                  Laboratoire de cybersécurité
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Choisissez un module pour commencer votre expérience pratique
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Module d'Atelier de Pentest Web */}
              <Card 
                className={`bg-gray-800 border-2 transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden ${
                  activeModule === 'pentest' 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                    : 'border-gray-700 hover:border-purple-700/50'
                }`}
                onClick={() => handleModuleSelection('pentest')}
              >
                <div className={`h-1.5 w-full ${
                  activeModule === 'pentest' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-700'
                }`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-900/50 mr-4">
                      <Code className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Atelier de Pentest Web</CardTitle>
                      <CardDescription className="text-gray-400">Explorez et exploitez les vulnérabilités web</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">Injection SQL et vectorisation</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">XSS et prise de contrôle navigateur</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">Analyse dynamique de code avec IA</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-800/60 border-t border-gray-700 pt-3 pb-4">
                  <div className="flex items-center text-xs text-gray-400">
                    <Cpu className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                    <span>Défis interactifs avec environnement d'exécution en temps réel</span>
                  </div>
                </CardFooter>
              </Card>

              {/* Module de Laboratoire d'analyse de trafic réseau */}
              <Card 
                className={`bg-gray-800 border-2 transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden ${
                  activeModule === 'network' 
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/30' 
                    : 'border-gray-700 hover:border-cyan-700/50'
                }`}
                onClick={() => handleModuleSelection('network')}
              >
                <div className={`h-1.5 w-full ${
                  activeModule === 'network' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-700'
                }`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-cyan-900/50 mr-4">
                      <Network className="h-7 w-7 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Laboratoire d'analyse de trafic réseau</CardTitle>
                      <CardDescription className="text-gray-400">Analysez et interprétez des captures réseaux</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">Analyse de paquets TCP/IP</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">Détection d'intrusions et anomalies</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></div>
                      <p className="text-gray-300 text-sm">Investigation forensique avancée</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-800/60 border-t border-gray-700 pt-3 pb-4">
                  <div className="flex items-center text-xs text-gray-400">
                    <Server className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                    <span>Captures PCAP réelles avec visualisation interactive</span>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {activeModule !== 'none' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <Button 
                  className={`px-8 py-6 text-white ${
                    activeModule === 'pentest' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                  }`}
                  onClick={goToModule}
                >
                  {activeModule === 'pentest' 
                    ? "Accéder à l'atelier de Pentest Web" 
                    : "Accéder au laboratoire d'analyse réseau"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Section d'information sur le laboratoire */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card className="bg-blue-900/10 border border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Apprentissage par la pratique
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              Les modules du CYBER LAB vous permettent de mettre en pratique vos connaissances dans un environnement sécurisé. Manipulez du code, analysez des données réelles et développez vos compétences techniques.
            </CardContent>
          </Card>
          
          <Card className="bg-purple-900/10 border border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Intelligence artificielle
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              Les modules du CYBER LAB intègrent l'intelligence artificielle pour analyser votre code, générer des défis personnalisés et vous fournir un retour précis sur vos manipulations techniques.
            </CardContent>
          </Card>
          
          <Card className="bg-cyan-900/10 border border-cyan-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Défis inspirés de cas réels
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              Affrontez des défis inspirés de situations réelles rencontrées par les professionnels de la cybersécurité. Développez vos compétences en résolution de problèmes et votre pensée critique.
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}