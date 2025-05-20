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
import { ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Lock, Smartphone, Wifi, Mail, User, Key, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function CyberPourDebutants() {
  // État pour suivre la progression du module
  const [progress, setProgress] = React.useState(0);
  
  // Simuler la progression lorsque la page est chargée
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(10);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Cybersécurité pour débutants | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Cybersécurité pour débutants</h1>
          
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
                <h2 className="text-2xl font-bold text-white mb-4">Bienvenue dans le monde de la cybersécurité</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    Ce module a été conçu spécialement pour les personnes qui découvrent la cybersécurité. 
                    Sans jargon technique complexe, nous vous présenterons les risques essentiels à connaître 
                    et les bonnes pratiques à adopter au quotidien.
                  </p>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-6">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Pourquoi s'intéresser à la cybersécurité ?</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      Dans notre monde connecté, chacun de nous est une cible potentielle. Comprendre les bases 
                      de la cybersécurité n'est plus une option mais une nécessité pour protéger vos données 
                      personnelles, votre identité numérique et vos appareils.
                    </AlertDescription>
                  </Alert>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Qu'allez-vous apprendre ?</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200">Identifier les risques courants auxquels vous êtes exposés</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200">Comprendre les tactiques utilisées par les cybercriminels</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200">Adopter des comportements sécurisés sur Internet</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200">Protéger vos appareils et vos comptes en ligne</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200">Réagir en cas d'incident de sécurité</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Les risques essentiels à connaître</h2>
                
                <Tabs defaultValue="phishing" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="phishing" className="data-[state=active]:bg-blue-700">Phishing</TabsTrigger>
                    <TabsTrigger value="malware" className="data-[state=active]:bg-blue-700">Malwares</TabsTrigger>
                    <TabsTrigger value="passwords" className="data-[state=active]:bg-blue-700">Mots de passe</TabsTrigger>
                    <TabsTrigger value="public" className="data-[state=active]:bg-blue-700">Wi-Fi public</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="phishing">
                    <div className="bg-blue-900/30 p-5 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Mail className="h-8 w-8 text-red-400 mr-3" />
                        <h3 className="text-xl font-medium text-white">Le phishing ou hameçonnage</h3>
                      </div>
                      
                      <p className="text-blue-200 mb-4">
                        Le phishing est une technique où un pirate se fait passer pour une entité de confiance 
                        (banque, service public, entreprise connue) pour vous inciter à révéler des informations 
                        sensibles comme vos identifiants, mots de passe ou données bancaires.
                      </p>
                      
                      <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-red-300 mb-2">Comment le reconnaître :</h4>
                        <ul className="list-disc pl-5 space-y-1 text-red-200">
                          <li>Emails ou messages avec un sentiment d'urgence</li>
                          <li>Fautes d'orthographe ou de grammaire</li>
                          <li>Adresse d'expéditeur suspecte</li>
                          <li>Demande d'informations personnelles</li>
                          <li>Liens suspicieux ou raccourcis</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2">Comment vous protéger :</h4>
                        <ul className="list-disc pl-5 space-y-1 text-green-200">
                          <li>Ne cliquez jamais sur des liens suspects</li>
                          <li>Vérifiez l'adresse email complète de l'expéditeur</li>
                          <li>Ne communiquez jamais d'informations sensibles par email</li>
                          <li>En cas de doute, contactez directement l'organisation concernée</li>
                          <li>Utilisez un logiciel de sécurité avec protection anti-phishing</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="malware">
                    <div className="bg-blue-900/30 p-5 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Shield className="h-8 w-8 text-red-400 mr-3" />
                        <h3 className="text-xl font-medium text-white">Les malwares (logiciels malveillants)</h3>
                      </div>
                      
                      <p className="text-blue-200 mb-4">
                        Les malwares sont des logiciels conçus pour s'introduire dans votre appareil sans votre consentement
                        afin de voler des données, espionner vos activités ou endommager votre système.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-900/40 p-4 rounded-lg">
                          <h4 className="font-medium text-white mb-2">Types courants :</h4>
                          <ul className="list-disc pl-5 space-y-1 text-blue-200">
                            <li><span className="text-red-300">Virus</span> : se propagent en infectant des fichiers</li>
                            <li><span className="text-red-300">Ransomware</span> : chiffrent vos données et demandent une rançon</li>
                            <li><span className="text-red-300">Spyware</span> : espionnent vos activités</li>
                            <li><span className="text-red-300">Adware</span> : affichent des publicités indésirables</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-4">
                          <h4 className="font-medium text-green-300 mb-2">Comment vous protéger :</h4>
                          <ul className="list-disc pl-5 space-y-1 text-green-200">
                            <li>Installez un antivirus réputé et gardez-le à jour</li>
                            <li>Méfiez-vous des pièces jointes et téléchargements</li>
                            <li>Mettez régulièrement à jour vos logiciels</li>
                            <li>Ne visitez que des sites web sécurisés (https://)</li>
                            <li>Faites des sauvegardes régulières de vos données</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="passwords">
                    <div className="bg-blue-900/30 p-5 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Key className="h-8 w-8 text-yellow-400 mr-3" />
                        <h3 className="text-xl font-medium text-white">La sécurité des mots de passe</h3>
                      </div>
                      
                      <p className="text-blue-200 mb-4">
                        Les mots de passe faibles ou réutilisés représentent l'une des plus grandes vulnérabilités 
                        de la sécurité personnelle. Un mot de passe compromis peut donner accès à plusieurs de vos comptes.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-4">
                          <h4 className="font-medium text-red-300 mb-2">Erreurs courantes :</h4>
                          <ul className="list-disc pl-5 space-y-1 text-red-200">
                            <li>Utiliser le même mot de passe partout</li>
                            <li>Choisir des mots de passe courts ou simples</li>
                            <li>Utiliser des informations personnelles (date de naissance)</li>
                            <li>Noter ses mots de passe sur papier ou en texte brut</li>
                            <li>Ne jamais changer ses mots de passe</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-4">
                          <h4 className="font-medium text-green-300 mb-2">Bonnes pratiques :</h4>
                          <ul className="list-disc pl-5 space-y-1 text-green-200">
                            <li>Utilisez des mots de passe uniques pour chaque compte</li>
                            <li>Créez des mots de passe longs (12+ caractères)</li>
                            <li>Combinez lettres, chiffres et caractères spéciaux</li>
                            <li>Utilisez un gestionnaire de mots de passe sécurisé</li>
                            <li>Activez l'authentification à deux facteurs (2FA)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="public">
                    <div className="bg-blue-900/30 p-5 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Wifi className="h-8 w-8 text-blue-400 mr-3" />
                        <h3 className="text-xl font-medium text-white">Les dangers du Wi-Fi public</h3>
                      </div>
                      
                      <p className="text-blue-200 mb-4">
                        Les réseaux Wi-Fi publics (cafés, aéroports, hôtels) sont souvent non sécurisés, 
                        permettant aux cybercriminels d'intercepter vos données ou de créer des réseaux factices 
                        pour vous piéger.
                      </p>
                      
                      <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-red-300 mb-2">Risques principaux :</h4>
                        <ul className="list-disc pl-5 space-y-1 text-red-200">
                          <li>"Man-in-the-middle" : interception de vos communications</li>
                          <li>Réseaux Wi-Fi "Evil Twin" imitant des réseaux légitimes</li>
                          <li>Partage involontaire de fichiers sur le réseau</li>
                          <li>Exposition de vos identifiants de connexion</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2">Comment vous protéger :</h4>
                        <ul className="list-disc pl-5 space-y-1 text-green-200">
                          <li>Utilisez un VPN (Réseau Privé Virtuel) sur les réseaux publics</li>
                          <li>Vérifiez que vous vous connectez au bon réseau Wi-Fi</li>
                          <li>Évitez les transactions financières sur Wi-Fi public</li>
                          <li>Désactivez le partage de fichiers et la connexion automatique</li>
                          <li>Préférez utiliser les données mobiles pour les activités sensibles</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Les bases de la protection au quotidien</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/60">
                    <div className="flex items-center mb-3">
                      <Smartphone className="h-6 w-6 text-blue-300 mr-2" />
                      <h3 className="font-medium text-white">Protection des appareils</h3>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-blue-200 text-sm">
                      <li>Mettez à jour régulièrement vos systèmes d'exploitation</li>
                      <li>Installez un antivirus et un pare-feu</li>
                      <li>Activez le verrouillage automatique de vos appareils</li>
                      <li>Chiffrez vos données sensibles</li>
                      <li>Sauvegardez régulièrement vos données importantes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/60">
                    <div className="flex items-center mb-3">
                      <User className="h-6 w-6 text-blue-300 mr-2" />
                      <h3 className="font-medium text-white">Protection de votre identité</h3>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-blue-200 text-sm">
                      <li>Limitez les informations personnelles partagées en ligne</li>
                      <li>Vérifiez régulièrement vos paramètres de confidentialité</li>
                      <li>Méfiez-vous des applications qui demandent trop d'accès</li>
                      <li>Contrôlez votre présence sur les réseaux sociaux</li>
                      <li>Surveillez vos comptes pour détecter des activités suspectes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-5 mt-6">
                  <h3 className="text-xl font-medium text-white mb-3 flex items-center">
                    <CheckCircle className="text-green-400 mr-2 h-5 w-5" />
                    <span>Les 5 règles d'or de la cybersécurité au quotidien</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-green-800/40 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-medium text-green-300">Méfiez-vous des messages suspects</h4>
                        <p className="text-sm text-green-200">Ne cliquez jamais sur des liens ou n'ouvrez pas de pièces jointes provenant d'expéditeurs inconnus.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-800/40 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-medium text-green-300">Utilisez des mots de passe forts et uniques</h4>
                        <p className="text-sm text-green-200">Changez-les régulièrement et utilisez un gestionnaire de mots de passe.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-800/40 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-medium text-green-300">Maintenez vos logiciels à jour</h4>
                        <p className="text-sm text-green-200">Les mises à jour corrigent souvent des failles de sécurité.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-800/40 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">4</div>
                      <div>
                        <h4 className="font-medium text-green-300">Sauvegardez régulièrement vos données</h4>
                        <p className="text-sm text-green-200">Utilisez la règle 3-2-1 : 3 copies, sur 2 supports différents, dont 1 hors site.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-800/40 rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">5</div>
                      <div>
                        <h4 className="font-medium text-green-300">Activez l'authentification à deux facteurs</h4>
                        <p className="text-sm text-green-200">Cette seconde couche de protection est essentielle pour vos comptes importants.</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <span className="text-blue-200">Checklist de sécurité personnelle</span>
                    </div>
                  </a>
                  
                  <a href="#" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Tester la sécurité de votre mot de passe</span>
                    </div>
                  </a>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Introduction à la cybersécurité</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Protection des données personnelles</span>
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
                      <span className="text-blue-300">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                  
                  <Button className="w-full mt-4 bg-blue-700 hover:bg-blue-600">
                    Continuer l'apprentissage
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-950/40 border-amber-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-200 mb-3">Mettre en pratique</h3>
                <p className="text-amber-300 text-sm mb-4">
                  Testez vos connaissances et affrontez des situations réelles avec notre playground interactif 
                  spécialement conçu pour les débutants.
                </p>
                <Link href="/cyber/learning-center/modules/cyber-pour-debutants/playground">
                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-white mb-3">
                    Accéder au playground interactif
                  </Button>
                </Link>
                <p className="text-amber-300 text-sm mb-4 mt-4">
                  Si vous avez des questions sur les concepts présentés, n'hésitez pas à utiliser notre assistant IA.
                </p>
                <Button className="w-full bg-amber-700/80 hover:bg-amber-600 text-white">
                  Consulter l'assistant IA
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}