import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, AlertTriangle, ShieldCheck, Eye, FileSearch, Lock, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface EducationalContentProps {
  className?: string;
}

export default function EducationalContent({ className }: EducationalContentProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <Card className={`border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-sm shadow-lg ${className}`}>
      <CardHeader className="bg-indigo-900/60 border-b border-indigo-500/30">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-indigo-300" />
          <CardTitle className="text-xl text-white">Ressources de formation</CardTitle>
        </div>
        <CardDescription className="text-indigo-200">
          Apprenez les fondamentaux de l'investigation en cybersécurité
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="concepts" className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-indigo-900/20 border-b border-indigo-500/30">
            <TabsTrigger
              value="concepts"
              className="data-[state=active]:bg-indigo-700/30 rounded-none data-[state=active]:shadow-none data-[state=active]:text-white text-indigo-300"
            >
              Concepts Clés
            </TabsTrigger>
            <TabsTrigger
              value="methodologies"
              className="data-[state=active]:bg-indigo-700/30 rounded-none data-[state=active]:shadow-none data-[state=active]:text-white text-indigo-300"
            >
              Méthodologies
            </TabsTrigger>
            <TabsTrigger
              value="techniques"
              className="data-[state=active]:bg-indigo-700/30 rounded-none data-[state=active]:shadow-none data-[state=active]:text-white text-indigo-300"
            >
              Techniques
            </TabsTrigger>
          </TabsList>
          
          {/* Concepts clés */}
          <TabsContent value="concepts" className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-indigo-500/30">
                <AccordionTrigger className="text-indigo-100 hover:text-white hover:no-underline">
                  <div className="flex items-center">
                    <FileSearch className="mr-2 h-5 w-5 text-indigo-400" />
                    <span>Analyse Forensique Numérique</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-indigo-200">
                  <p className="mb-3">
                    L'analyse forensique numérique est la science d'identification, de collecte, d'examen et d'analyse des données tout en préservant l'intégrité des informations.
                  </p>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" /> Principes fondamentaux
                  </h4>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    <li>Préservation des preuves (chain of custody)</li>
                    <li>Analyse non-destructive</li>
                    <li>Documentation méticuleuse</li>
                    <li>Reproductibilité des résultats</li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" /> Points d'attention
                  </h4>
                  <p className="text-sm">
                    Toujours travailler sur des copies des données originales et jamais directement sur les preuves. Les métadonnées (horodatages, attributs de fichiers) sont souvent aussi importantes que le contenu.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-indigo-500/30">
                <AccordionTrigger className="text-indigo-100 hover:text-white hover:no-underline">
                  <div className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-indigo-400" />
                    <span>Traque des Menaces (Threat Hunting)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-indigo-200">
                  <p className="mb-3">
                    La traque des menaces est une approche proactive pour détecter les activités malveillantes qui ont échappé aux contrôles de sécurité automatisés.
                  </p>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" /> Techniques principales
                  </h4>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    <li>Analyse comportementale (détection d'anomalies)</li>
                    <li>Chasse basée sur les IOCs (Indicators of Compromise)</li>
                    <li>Analyse de logs et d'événements</li>
                    <li>Profilage des acteurs malveillants (TTPs)</li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" /> Bonnes pratiques
                  </h4>
                  <p className="text-sm">
                    Formaliser vos hypothèses avant de commencer la traque. Établir une baseline du comportement normal du réseau pour mieux détecter les anomalies. Documenter et partager vos découvertes.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-indigo-500/30">
                <AccordionTrigger className="text-indigo-100 hover:text-white hover:no-underline">
                  <div className="flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-indigo-400" />
                    <span>Réponse aux Incidents</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-indigo-200">
                  <p className="mb-3">
                    La réponse aux incidents est un ensemble organisé d'actions pour gérer les conséquences d'une violation de sécurité ou d'une cyberattaque.
                  </p>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" /> Phases clés
                  </h4>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    <li>Préparation et planification</li>
                    <li>Détection et analyse</li>
                    <li>Confinement et éradication</li>
                    <li>Récupération</li>
                    <li>Activités post-incident et leçons apprises</li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" /> Considérations critiques
                  </h4>
                  <p className="text-sm">
                    Prioriser les incidents selon leur impact. Communiquer efficacement avec toutes les parties prenantes. Documenter chaque action. Éviter les décisions hâtives qui pourraient compromettre les preuves.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-indigo-500/30">
                <AccordionTrigger className="text-indigo-100 hover:text-white hover:no-underline">
                  <div className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-indigo-400" />
                    <span>Cryptanalyse et Rétro-ingénierie</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-indigo-200">
                  <p className="mb-3">
                    La cryptanalyse étudie les systèmes cryptographiques pour en découvrir les faiblesses. La rétro-ingénierie consiste à décomposer un logiciel pour comprendre son fonctionnement.
                  </p>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" /> Applications en cybersécurité
                  </h4>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    <li>Analyse de malware</li>
                    <li>Récupération de données chiffrées</li>
                    <li>Identification de vulnérabilités dans les systèmes</li>
                    <li>Compréhension des techniques d'attaque</li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" /> Aspects légaux
                  </h4>
                  <p className="text-sm">
                    S'assurer d'avoir les autorisations appropriées avant de procéder à la rétro-ingénierie. Respecter les lois sur la propriété intellectuelle et les conditions d'utilisation des logiciels.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-indigo-500/30">
                <AccordionTrigger className="text-indigo-100 hover:text-white hover:no-underline">
                  <div className="flex items-center">
                    <Network className="mr-2 h-5 w-5 text-indigo-400" />
                    <span>Analyse de Trafic Réseau</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-indigo-200">
                  <p className="mb-3">
                    L'analyse de trafic réseau consiste à capturer et examiner les communications réseau pour détecter les anomalies et les comportements suspects.
                  </p>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" /> Outils et techniques
                  </h4>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    <li>Capture de paquets (Wireshark, tcpdump)</li>
                    <li>Analyse de flux réseau</li>
                    <li>Corrélation d'événements</li>
                    <li>Détection basée sur les signatures</li>
                    <li>Analyse statistique et comportementale</li>
                  </ul>
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-400" /> Défis modernes
                  </h4>
                  <p className="text-sm">
                    Le chiffrement rend de plus en plus difficile l'inspection du contenu des paquets. Se concentrer sur les métadonnées et les modèles de communication peut fournir des indices précieux même avec du trafic chiffré.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Méthodologies */}
          <TabsContent value="methodologies" className="p-4">
            <div className="space-y-6">
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-indigo-300" />
                  Méthodologie NIST de réponse aux incidents
                </h3>
                <p className="text-indigo-200 mb-3">
                  Framework développé par le National Institute of Standards and Technology pour standardiser la gestion des incidents de cybersécurité.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                  {["Préparation", "Détection & Analyse", "Confinement & Éradication", "Récupération", "Activités Post-Incident"].map((phase, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-center text-indigo-100 text-sm"
                    >
                      {phase}
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-indigo-300">
                  <p>
                    Cette méthodologie cyclique met l'accent sur la préparation continue et l'amélioration des processus après chaque incident.
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileSearch className="mr-2 h-5 w-5 text-indigo-300" />
                  Méthodologie OSCAR pour l'analyse forensique
                </h3>
                <p className="text-indigo-200 mb-3">
                  Un cadre structuré pour les investigations numériques qui garantit la rigueur et l'admissibilité légale des preuves.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-indigo-100">
                    <span className="font-medium">O</span>btain information - Recueillir toutes les informations pertinentes
                  </div>
                  <div className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-indigo-100">
                    <span className="font-medium">S</span>trategy - Développer une stratégie d'analyse adaptée
                  </div>
                  <div className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-indigo-100">
                    <span className="font-medium">C</span>ollect evidence - Collecter et préserver les preuves
                  </div>
                  <div className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-indigo-100">
                    <span className="font-medium">A</span>nalyze - Analyser les preuves collectées
                  </div>
                  <div className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-indigo-100">
                    <span className="font-medium">R</span>eport - Documenter et présenter les résultats
                  </div>
                </div>
                <div className="text-sm text-indigo-300">
                  <p>
                    Cette approche systématique garantit que les preuves numériques sont traitées avec rigueur et peuvent être présentées dans un cadre légal.
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-indigo-300" />
                  Cyber Kill Chain
                </h3>
                <p className="text-indigo-200 mb-3">
                  Modèle développé par Lockheed Martin pour décrire les phases d'une cyberattaque, utile pour comprendre et interrompre les attaques.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-3">
                  {[
                    { name: "Reconnaissance", desc: "Collecte d'informations sur la cible" },
                    { name: "Arme", desc: "Création d'une charge utile malveillante" },
                    { name: "Livraison", desc: "Transmission de l'arme à la cible" },
                    { name: "Exploitation", desc: "Déclenchement du code malveillant" },
                    { name: "Installation", desc: "Établissement d'une persistance" },
                    { name: "C&C", desc: "Canal de communication avec l'attaquant" },
                    { name: "Actions", desc: "Exécution des objectifs malveillants" }
                  ].map((phase, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-indigo-800/30 border border-indigo-600/30 p-2 rounded text-center text-indigo-100"
                    >
                      <div className="font-medium">{phase.name}</div>
                      <div className="text-xs text-indigo-300 mt-1">{phase.desc}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-indigo-300">
                  <p>
                    Comprendre chaque étape permet d'identifier à quel moment de l'attaque vous vous trouvez et quelles contre-mesures sont les plus efficaces.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Techniques */}
          <TabsContent value="techniques" className="p-4">
            <div className="space-y-6">
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-2">Techniques d'acquisition de données</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-indigo-100 font-medium">Acquisition de mémoire volatile</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Capture de la RAM pour analyser les processus en cours d'exécution, les connexions réseau actives et les artefacts qui disparaîtraient après un redémarrage.
                    </p>
                    <div className="mt-2 bg-indigo-800/20 p-2 rounded text-xs text-indigo-300 font-mono">
                      # Exemple avec Volatility
                      <br />
                      volatility -f memory.raw imageinfo
                      <br />
                      volatility -f memory.raw --profile=Win10x64 pslist
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-500/20" />
                  
                  <div>
                    <h4 className="text-indigo-100 font-medium">Imagerie de disque</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Création d'une copie bit à bit d'un support de stockage, préservant toutes les données, y compris les fichiers supprimés et l'espace non alloué.
                    </p>
                    <div className="mt-2 bg-indigo-800/20 p-2 rounded text-xs text-indigo-300 font-mono">
                      # Exemple avec DD
                      <br />
                      dd if=/dev/sda of=evidence.dd bs=4M
                      <br />
                      # Avec vérification de hash
                      <br />
                      sha256sum /dev/sda &gt; original_hash.txt
                      <br />
                      sha256sum evidence.dd &gt; image_hash.txt
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-2">Techniques d'analyse de logs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-indigo-100 font-medium">Corrélation temporelle</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Établissement d'une chronologie des événements en synchronisant les horodatages de différentes sources de logs pour reconstruire une séquence d'actions.
                    </p>
                    <div className="mt-2 p-2 bg-indigo-800/20 rounded text-xs text-indigo-300">
                      <p className="mb-1">Points d'attention:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Synchronisation des fuseaux horaires</li>
                        <li>Formats d'horodatage différents</li>
                        <li>Dérives d'horloge entre systèmes</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-500/20" />
                  
                  <div>
                    <h4 className="text-indigo-100 font-medium">Extraction d'artefacts</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Identification et isolation d'indicateurs de compromission (IOCs) à partir des logs: adresses IP, domaines, hashes de fichiers, noms d'utilisateurs suspects.
                    </p>
                    <div className="mt-2 bg-indigo-800/20 p-2 rounded text-xs text-indigo-300">
                      <p>Exemples de commandes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Extraction d&apos;adresses IP des logs</li>
                        <li>Recherche de tentatives d&apos;accès non autorisées</li>
                        <li>Analyse de fréquence des requêtes par source</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-2">Techniques d'analyse de malware</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-indigo-100 font-medium">Analyse statique</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Examen d'un échantillon de malware sans l'exécuter, en analysant son code, sa structure, ses chaînes de caractères et ses signatures.
                    </p>
                    <div className="mt-2 p-2 bg-indigo-800/20 rounded text-xs text-indigo-300">
                      <p className="mb-1">Outils courants:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Strings - extraction de chaînes de caractères lisibles</li>
                        <li>PEiD - détection de packer/crypteur</li>
                        <li>IDA Pro - désassemblage et décompilation</li>
                        <li>YARA - recherche de motifs</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-500/20" />
                  
                  <div>
                    <h4 className="text-indigo-100 font-medium">Analyse dynamique</h4>
                    <p className="text-sm text-indigo-200 mt-1">
                      Exécution du malware dans un environnement contrôlé (sandbox) pour observer son comportement réel: connexions réseau, modifications de fichiers, changements de registre.
                    </p>
                    <div className="mt-2 p-2 bg-indigo-800/20 rounded text-xs text-indigo-300">
                      <p className="mb-1">Bonnes pratiques:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Utiliser un système isolé sans connexion à des réseaux de production</li>
                        <li>Prendre des instantanés avant/après pour comparer les changements</li>
                        <li>Surveiller les communications réseau (même bloquées)</li>
                        <li>Être attentif aux techniques anti-analyse (détection de VM/sandbox)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}