import React from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Lock, Share2, Database, Server, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function IntroductionCybersecurite() {
  // État pour suivre la progression du module
  const [progress, setProgress] = React.useState(0);
  
  // Simuler la progression lorsque la page est chargée
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(15);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Introduction à la Cybersécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Introduction à la Cybersécurité</h1>
          
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
                <h2 className="text-2xl font-bold text-white mb-4">Principes fondamentaux de la cybersécurité</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    La cybersécurité est l'ensemble des mesures, technologies et pratiques visant à protéger les systèmes informatiques, les réseaux, et les données contre les accès non autorisés, les attaques et les dommages.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Les trois piliers de la cybersécurité</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Lock className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Confidentialité</h4>
                      </div>
                      <p className="text-sm text-blue-200">Garantir que les informations ne sont accessibles qu'aux personnes autorisées.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Shield className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Intégrité</h4>
                      </div>
                      <p className="text-sm text-blue-200">Assurer que les données ne sont pas altérées de manière non autorisée ou accidentelle.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Share2 className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Disponibilité</h4>
                      </div>
                      <p className="text-sm text-blue-200">Garantir que les systèmes et données sont disponibles quand les utilisateurs en ont besoin.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Principaux domaines de la cybersécurité</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Server className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Sécurité des réseaux</h4>
                        <p className="text-sm text-blue-200">Protection de l'infrastructure réseau et des communications contre les intrusions et le vol de données.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Database className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Sécurité des données</h4>
                        <p className="text-sm text-blue-200">Méthodes et outils pour protéger les données sensibles, incluant le chiffrement et la classification.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                        <Cpu className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Sécurité des applications</h4>
                        <p className="text-sm text-blue-200">Pratiques pour développer et maintenir des logiciels sécurisés, réduisant les vulnérabilités exploitables.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">À savoir</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      La cybersécurité est un domaine en constante évolution. Les menaces et les méthodes de protection évoluent continuellement, nécessitant une veille technologique permanente.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Les menaces cybernétiques communes</h2>
                
                <Tabs defaultValue="malware" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="malware" className="data-[state=active]:bg-blue-700">Malwares</TabsTrigger>
                    <TabsTrigger value="socialeng" className="data-[state=active]:bg-blue-700">Ingénierie sociale</TabsTrigger>
                    <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-700">Attaques avancées</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="malware">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Virus et vers informatiques</h3>
                        <p className="text-blue-200">Programmes malveillants qui se répliquent et se propagent pour infecter les systèmes.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Ransomware</h3>
                        <p className="text-blue-200">Logiciel qui chiffre les données de la victime et exige une rançon pour les déchiffrer.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Spyware</h3>
                        <p className="text-blue-200">Logiciel espion qui collecte des informations sur les activités de l'utilisateur à son insu.</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="socialeng">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Phishing</h3>
                        <p className="text-blue-200">Technique visant à tromper l'utilisateur pour qu'il divulgue des informations sensibles, souvent via des emails frauduleux.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Usurpation d'identité</h3>
                        <p className="text-blue-200">Se faire passer pour une personne légitime afin d'obtenir des accès ou des informations privilégiées.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Manipulation sociale</h3>
                        <p className="text-blue-200">Exploiter la psychologie humaine pour influencer les personnes à divulguer des informations ou réaliser des actions préjudiciables.</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Attaques DDoS</h3>
                        <p className="text-blue-200">Saturation d'un service en ligne par un grand nombre de requêtes simultanées, rendant le service indisponible.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">APT (Advanced Persistent Threats)</h3>
                        <p className="text-blue-200">Attaques sophistiquées sur le long terme, souvent menées par des organisations bien financées ou étatiques.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Zero-day exploits</h3>
                        <p className="text-blue-200">Exploitation de vulnérabilités inconnues des développeurs et pour lesquelles aucun correctif n'existe encore.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ressources complémentaires</h3>
                
                <div className="space-y-3">
                  <a href="#" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Guide des bonnes pratiques</span>
                    </div>
                  </a>
                  
                  <a href="#" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Checklist de sécurité</span>
                    </div>
                  </a>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Zero Trust</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Protection contre les ransomwares</span>
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
                      <span className="text-blue-300">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
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