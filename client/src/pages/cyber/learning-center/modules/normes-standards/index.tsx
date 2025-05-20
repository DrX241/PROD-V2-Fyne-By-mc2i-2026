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
import { ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Layers, FileText, Globe, BadgeCheck, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function NormesStandards() {
  // État pour suivre la progression du module
  const [progress, setProgress] = React.useState(0);
  
  // Simuler la progression lorsque la page est chargée
  React.useEffect(() => {
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
                <h2 className="text-2xl font-bold text-white mb-4">Panorama des normes en cybersécurité</h2>
                
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
                  <Link href="/cyber/learning-center/modules/analyse-risques">
                    <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-blue-200">Analyse et gestion des risques</span>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/cyber/learning-center/modules/gouvernance-cyber">
                    <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-blue-200">Gouvernance de la cybersécurité</span>
                      </div>
                    </div>
                  </Link>
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