import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, Clock, ChevronRight, 
  Terminal, Database, Network, Eye, Check,
  AlertTriangle, HelpCircle, Search, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour les preuves
interface Evidence {
  id: string;
  name: string;
  type: 'log' | 'network' | 'file' | 'memory';
  description: string;
  content: string;
  discovered: boolean;
  timestamp?: string;
  size?: string;
  icon: React.ReactNode;
}

// Types pour les indices
interface Clue {
  id: string;
  text: string;
  discovered: boolean;
  relatedEvidenceId: string;
  isKey: boolean;
}

// Types pour les étapes du scénario
interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  requiredClues: string[];
}

export default function ShadowBreach() {
  const [activeTab, setActiveTab] = useState('briefing');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([
    {
      id: 'auth-log',
      name: 'Journal d\'authentification',
      type: 'log',
      description: 'Logs d\'authentification du serveur principal avec timestamps et IPs',
      content: `
May 03 02:14:22 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:14:24 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 02:14:29 finserver sshd[31752]: Failed password for root from 198.51.100.43 port 43245 ssh2
May 03 04:37:01 finserver sshd[32655]: Accepted password for admin from 198.51.100.43 port 56789 ssh2
May 03 04:37:05 finserver sudo: admin : TTY=pts/2 ; PWD=/home/admin ; USER=root ; COMMAND=/usr/bin/find /var/log -type f -mtime +30 -delete
May 03 04:38:12 finserver sudo: admin : TTY=pts/2 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash
May 03 04:42:38 finserver sshd[33100]: Disconnected from user admin 198.51.100.43 port 56789
May 03 07:16:54 finserver sshd[34255]: Accepted publickey for newuser from 198.51.100.43 port: 60122
May 03 07:17:05 finserver sudo: newuser : command not allowed ; TTY=pts/0 ; PWD=/home/newuser ; USER=root ; COMMAND=/usr/bin/apt install netcat
May 03 07:17:22 finserver sudo: newuser : TTY=pts/0 ; PWD=/home/newuser ; USER=root ; COMMAND=/bin/cp /bin/bash /tmp/.hidden/bsh
May 03 07:17:35 finserver sudo: newuser : TTY=pts/0 ; PWD=/tmp/.hidden ; USER=root ; COMMAND=/bin/chmod +s bsh
May 03 07:18:01 finserver sshd[34255]: Disconnected from user newuser 198.51.100.43 port 60122
      `,
      discovered: false,
      timestamp: '06/05/2025 10:32',
      size: '425 Ko',
      icon: <FileText className="h-5 w-5 text-blue-400" />
    },
    {
      id: 'user-accounts',
      name: 'Liste des comptes utilisateurs',
      type: 'file',
      description: 'Liste des comptes utilisateurs ayant accès au système',
      content: `
# Liste des utilisateurs système extraite de /etc/passwd
root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000:Admin User:/home/admin:/bin/bash
developer:x:1001:1001:Developer Account:/home/developer:/bin/bash
support:x:1002:1002:Support Team:/home/support:/bin/bash
backup:x:1003:1003:Backup Service:/home/backup:/bin/bash
newuser:x:1004:1004:New Hire:/home/newuser:/bin/bash   # Créé le 03/05/2025
      `,
      discovered: false,
      timestamp: '06/05/2025 11:05',
      size: '256 Ko',
      icon: <Database className="h-5 w-5 text-purple-400" />
    },
    {
      id: 'network-capture',
      name: 'Capture réseau',
      type: 'network',
      description: 'Capture de trafic réseau au moment des événements suspects',
      content: `
# Extrait de l'analyse de trafic réseau (tcpdump)
10:15:22.342 IP 198.51.100.43.43245 > finserver.ssh: TCP 64 [SYN]
10:15:22.342 IP finserver.ssh > 198.51.100.43.43245: TCP 60 [SYN, ACK]
10:15:22.376 IP 198.51.100.43.43245 > finserver.ssh: TCP 52 [ACK]
...
12:42:05.127 IP 198.51.100.43.56789 > finserver.ssh: TCP 112 [PSH, ACK]
12:42:05.221 IP finserver.ssh > 198.51.100.43.56789: TCP 912 [PSH, ACK]
...
15:21:33.901 IP finserver.36245 > 203.0.113.5.6667: TCP 84 [PSH, ACK]   # Connexion IRC
15:22:01.332 IP 203.0.113.5.6667 > finserver.36245: TCP 142 [PSH, ACK]
...
15:23:17.221 IP finserver.44521 > 203.0.113.5.1337: TCP 8192 [PSH, ACK] # Exfiltration
15:23:17.335 IP 203.0.113.5.1337 > finserver.44521: TCP 52 [ACK]
      `,
      discovered: false,
      timestamp: '06/05/2025 12:44',
      size: '2.3 Mo',
      icon: <Network className="h-5 w-5 text-green-400" />
    }
  ]);
  
  const [cluesList, setCluesList] = useState<Clue[]>([
    {
      id: 'brute-force',
      text: 'Tentative de brute force sur le compte root depuis 198.51.100.43',
      discovered: false,
      relatedEvidenceId: 'auth-log',
      isKey: false
    },
    {
      id: 'admin-login',
      text: 'Connexion réussie au compte admin depuis la même IP que la tentative de brute force',
      discovered: false,
      relatedEvidenceId: 'auth-log',
      isKey: true
    },
    {
      id: 'new-user',
      text: 'Nouvel utilisateur "newuser" créé récemment et connecté depuis l\'IP suspecte',
      discovered: false,
      relatedEvidenceId: 'user-accounts',
      isKey: true
    },
    {
      id: 'privilege-escalation',
      text: 'Élévation de privilèges via un binaire setuid caché dans /tmp/.hidden/',
      discovered: false,
      relatedEvidenceId: 'auth-log',
      isKey: true
    },
    {
      id: 'data-exfiltration',
      text: 'Exfiltration de données via la connexion au port 1337',
      discovered: false,
      relatedEvidenceId: 'network-capture',
      isKey: true
    }
  ]);
  
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'identify-entry',
      title: 'Identifier le point d\'entrée',
      description: 'Analysez les logs pour déterminer comment l\'attaquant a obtenu un accès initial au système.',
      completed: false,
      requiredClues: ['brute-force', 'admin-login']
    },
    {
      id: 'identify-persistence',
      title: 'Identifier le mécanisme de persistance',
      description: 'Déterminez comment l\'attaquant a établi une présence persistante dans le système.',
      completed: false,
      requiredClues: ['new-user', 'privilege-escalation']
    },
    {
      id: 'identify-exfiltration',
      title: 'Identifier l\'exfiltration de données',
      description: 'Trouvez des preuves de l\'exfiltration de données et le canal utilisé.',
      completed: false,
      requiredClues: ['data-exfiltration']
    }
  ]);
  
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  // Timer pour le temps écoulé
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mettre à jour la progression
  useEffect(() => {
    const totalDiscoveredClues = cluesList.filter(clue => clue.discovered).length;
    const newProgress = Math.floor((totalDiscoveredClues / cluesList.length) * 100);
    setProgress(newProgress);
    
    // Vérifier si des étapes sont complétées
    const updatedSteps = steps.map(step => {
      const stepClues = step.requiredClues.map(clueId => 
        cluesList.find(clue => clue.id === clueId)
      );
      
      const allCluesDiscovered = stepClues.every(clue => clue?.discovered);
      
      return {
        ...step,
        completed: allCluesDiscovered
      };
    });
    
    setSteps(updatedSteps);
  }, [cluesList]);

  // Fonction pour découvrir une preuve
  const discoverEvidence = (id: string) => {
    const updatedEvidence = evidenceList.map(ev => 
      ev.id === id ? { ...ev, discovered: true } : ev
    );
    setEvidenceList(updatedEvidence);
    
    // Si c'est la première preuve découverte, passer à l'onglet preuves
    if (!evidenceList.some(ev => ev.discovered)) {
      setActiveTab('evidence');
    }
    
    setSelectedEvidence(updatedEvidence.find(ev => ev.id === id) || null);
  };

  // Fonction pour analyser une preuve et découvrir des indices
  const analyzeEvidence = (evidenceId: string) => {
    // Trouver les indices liés à cette preuve
    const relatedClues = cluesList.filter(clue => 
      clue.relatedEvidenceId === evidenceId && !clue.discovered
    );
    
    if (relatedClues.length > 0) {
      // Marquer les indices comme découverts
      const updatedClues = cluesList.map(clue => 
        relatedClues.some(rc => rc.id === clue.id) 
          ? { ...clue, discovered: true } 
          : clue
      );
      
      setCluesList(updatedClues);
      setActiveTab('clues');
    }
  };

  // Formater le temps écoulé
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <HomeLayout>
      <PageTitle title="Infiltration Fantôme - Analyse Forensique" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* En-tête */}
        <div className="relative z-10 w-full mx-auto px-4 py-4 sm:px-6 sm:pt-6 sm:pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div className="flex items-center">
              <Link href="/cyber/arcade/digital-forensics">
                <Button variant="ghost" className="text-white hover:bg-emerald-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                Infiltration Fantôme 
                <Badge className="ml-3 bg-emerald-700 text-white text-xs">FORENSIC</Badge>
              </h1>
            </div>
            
            {/* Statistiques */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-emerald-200">
                <Clock className="h-4 w-4 mr-1 text-emerald-400" />
                <span className="text-sm">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center text-emerald-200">
                <Search className="h-4 w-4 mr-1 text-emerald-400" />
                <span className="text-sm">{cluesList.filter(c => c.discovered).length}/{cluesList.length} indices</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-700">
                    <p>Progression: {progress}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Navigation par onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-800/50 border border-gray-700">
              <TabsTrigger value="briefing" className="data-[state=active]:bg-emerald-700">
                Briefing
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-emerald-700">
                Preuves <Badge className="ml-1 bg-emerald-800">{evidenceList.filter(e => e.discovered).length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="clues" className="data-[state=active]:bg-emerald-700">
                Indices <Badge className="ml-1 bg-emerald-800">{cluesList.filter(c => c.discovered).length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-700">
                Chronologie
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu de l'onglet Briefing */}
            <TabsContent value="briefing" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-900/60 border-gray-800 col-span-1 lg:col-span-2">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Rapport d'incident: FinTech Security Breach
                    </h2>
                    <p className="text-gray-300 mb-4">
                      <strong className="text-emerald-400">Date:</strong> 6 mai 2025<br />
                      <strong className="text-emerald-400">Entreprise:</strong> TradeSphere Financial Technologies<br />
                      <strong className="text-emerald-400">Incident:</strong> Transactions suspectes détectées sur la plateforme
                    </p>
                    <Separator className="my-4 bg-gray-700" />
                    <p className="text-gray-300 mb-4">
                      Le 5 mai 2025, l'équipe de sécurité de TradeSphere a détecté des transactions financières anormales 
                      sur leur plateforme d'échanges. Les transactions semblent avoir été initiées par des comptes légitimes, 
                      mais les montants et les destinataires ne correspondent pas aux modèles habituels.
                    </p>
                    <p className="text-gray-300 mb-4">
                      Une analyse préliminaire suggère qu'un acteur malveillant a pu accéder aux systèmes de l'entreprise et
                      mettre en place un mécanisme pour détourner des fonds. Vous êtes chargé(e) d'analyser les preuves
                      forensiques disponibles pour déterminer:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4 ml-2">
                      <li>Comment l'attaquant a obtenu l'accès initial</li>
                      <li>Comment il a maintenu sa présence dans le système</li>
                      <li>Quelles données ont été exfiltrées</li>
                    </ul>
                    <p className="text-gray-300">
                      Analysez les preuves disponibles, établissez une chronologie de l'attaque et identifiez les tactiques, 
                      techniques et procédures (TTP) utilisées par l'attaquant.
                    </p>
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                        onClick={() => setActiveTab('evidence')}
                      >
                        Commencer l'analyse <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-6 col-span-1">
                  {/* Progression des objectifs */}
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Check className="h-5 w-5 mr-2 text-emerald-400" />
                        Objectifs
                      </h3>
                      <div className="space-y-4">
                        {steps.map((step) => (
                          <div key={step.id} className="relative">
                            <div className="flex items-start">
                              <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center ${step.completed ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                                {step.completed && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="ml-3">
                                <h4 className={`font-medium ${step.completed ? 'text-emerald-400' : 'text-gray-300'}`}>
                                  {step.title}
                                </h4>
                                <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Aide / Conseils */}
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center">
                          <HelpCircle className="h-5 w-5 mr-2 text-amber-400" />
                          Besoin d'aide?
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-amber-400 border-amber-400/30 hover:bg-amber-900/20"
                          onClick={() => setShowHint(!showHint)}
                        >
                          {showHint ? 'Masquer' : 'Indice'}
                        </Button>
                      </div>
                      
                      {showHint ? (
                        <div className="bg-amber-950/20 border border-amber-800/30 rounded-md p-3 text-amber-200 text-sm">
                          <p>Commencez par examiner les journaux d'authentification pour identifier toute activité suspecte 
                          comme des tentatives de connexion échouées ou des connexions à des heures inhabituelles.</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          Si vous êtes bloqué(e), vous pouvez demander un indice. 
                          Cela n'affectera pas votre progression, mais essayez d'abord de résoudre par vous-même!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Preuves */}
            <TabsContent value="evidence" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Card className="bg-gray-900/60 border-gray-800 h-full">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Search className="h-5 w-5 mr-2 text-emerald-400" />
                        Preuves disponibles
                      </h2>
                      <div className="space-y-3">
                        {evidenceList.filter(e => e.discovered).length === 0 && (
                          <p className="text-gray-400 text-sm italic">
                            Aucune preuve découverte pour le moment. Commencez par explorer les serveurs.
                          </p>
                        )}
                        
                        {evidenceList.filter(e => e.discovered).map((evidence) => (
                          <div 
                            key={evidence.id}
                            className={`flex items-center p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border ${selectedEvidence?.id === evidence.id ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-800'}`}
                            onClick={() => setSelectedEvidence(evidence)}
                          >
                            <div className="mr-3">
                              {evidence.icon}
                            </div>
                            <div>
                              <h3 className="text-white font-medium text-sm">{evidence.name}</h3>
                              <p className="text-gray-400 text-xs">{evidence.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-5 bg-gray-700" />
                      
                      <h3 className="text-md font-medium text-white mb-3">Explorer les serveurs</h3>
                      <div className="space-y-3">
                        {evidenceList.filter(e => !e.discovered).map((evidence) => (
                          <div 
                            key={evidence.id}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border border-gray-800"
                            onClick={() => discoverEvidence(evidence.id)}
                          >
                            <div className="mr-3 text-gray-500">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-gray-300 font-medium text-sm">{evidence.name}</h3>
                              <p className="text-gray-500 text-xs">{evidence.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  {selectedEvidence ? (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-lg font-medium text-white flex items-center">
                              {selectedEvidence.icon}
                              <span className="ml-2">{selectedEvidence.name}</span>
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">{selectedEvidence.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Collecté le {selectedEvidence.timestamp}</div>
                            <div className="text-xs text-gray-400">Taille: {selectedEvidence.size}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-950 border border-gray-800 rounded-md p-4 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre mt-4">
                          {selectedEvidence.content}
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <Button 
                            variant="outline"
                            className="text-blue-400 border-blue-500/30 hover:bg-blue-900/20"
                          >
                            <Download className="h-4 w-4 mr-2" /> Exporter
                          </Button>
                          <Button 
                            className="bg-emerald-700 hover:bg-emerald-800 text-white"
                            onClick={() => analyzeEvidence(selectedEvidence.id)}
                          >
                            <Search className="h-4 w-4 mr-2" /> Analyser
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="p-6 rounded-full bg-gray-800/50">
                          <Eye className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-400 mt-4">Sélectionnez une preuve</h3>
                        <p className="text-gray-500 text-center max-w-md mt-2">
                          Choisissez une preuve dans la liste à gauche pour l'examiner ou explorez les serveurs pour en découvrir de nouvelles.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Indices */}
            <TabsContent value="clues" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Search className="h-5 w-5 mr-2 text-emerald-400" />
                        Indices découverts
                      </h2>
                      
                      {cluesList.filter(c => c.discovered).length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-gray-600" />
                          </div>
                          <h3 className="text-gray-400 text-lg mb-2">Aucun indice découvert</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Explorez les preuves et analysez-les pour découvrir des indices sur l'incident.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cluesList.filter(c => c.discovered).map((clue) => {
                            const relatedEvidence = evidenceList.find(ev => ev.id === clue.relatedEvidenceId);
                            return (
                              <div key={clue.id} className={`p-4 rounded-lg border ${clue.isKey ? 'bg-amber-900/20 border-amber-800/50' : 'bg-gray-800/50 border-gray-700'}`}>
                                <div className="flex items-start">
                                  {clue.isKey ? (
                                    <div className="bg-amber-900/50 p-1 rounded mr-3">
                                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                                    </div>
                                  ) : (
                                    <div className="bg-emerald-900/50 p-1 rounded mr-3">
                                      <Search className="h-5 w-5 text-emerald-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className={`${clue.isKey ? 'text-amber-200' : 'text-emerald-100'}`}>{clue.text}</p>
                                    <div className="flex items-center mt-2">
                                      <Badge variant="outline" className="text-gray-400 border-gray-700 text-xs">
                                        Source: {relatedEvidence?.name || 'Inconnu'}
                                      </Badge>
                                      {clue.isKey && (
                                        <Badge className="ml-2 bg-amber-900/50 text-amber-200 border-amber-800/50 text-xs">
                                          Indice clé
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1">
                  <Card className="bg-gray-900/60 border-gray-800 mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Check className="h-5 w-5 mr-2 text-emerald-400" />
                        Progression
                      </h3>
                      <div>
                        <div className="flex justify-between text-xs text-emerald-200 mb-1">
                          <span>Investigation</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-800" />
                      </div>
                      <div className="mt-4 text-xs text-gray-400">
                        <span className="text-amber-400 font-medium">{cluesList.filter(c => c.discovered && c.isKey).length}/{cluesList.filter(c => c.isKey).length}</span> indices clés découverts
                      </div>
                      
                      <Separator className="my-4 bg-gray-700" />
                      
                      <div className="space-y-3">
                        {steps.map((step) => (
                          <div key={step.id} className="flex items-start">
                            <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center ${step.completed ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                              {step.completed && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <p className={`ml-2 text-sm ${step.completed ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {step.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-3">Conseils d'analyse</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Recherchez des motifs d'activité anormale dans les logs d'authentification.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Comparez les adresses IP entre différentes sources de preuves pour établir des corrélations.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Vérifiez les commandes exécutées par les utilisateurs, particulièrement celles avec élévation de privilèges.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Chronologie */}
            <TabsContent value="timeline" className="pt-4">
              <Card className="bg-gray-900/60 border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-white mb-6 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-emerald-400" />
                    Chronologie de l'attaque
                  </h2>
                  
                  {steps.some(step => step.completed) ? (
                    <div className="relative border-l-2 border-gray-700 pl-6 ml-3 space-y-6">
                      {steps[0].completed && (
                        <div className="relative">
                          <div className="absolute -left-[34px] bg-emerald-700 w-6 h-6 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-emerald-400 font-medium">Phase 1: Accès Initial</h3>
                            <p className="text-gray-300 mt-1">
                              L'attaquant a commencé par une tentative de brute force sur le compte root depuis l'IP 198.51.100.43. 
                              Après plusieurs échecs, il a réussi à se connecter au compte admin depuis la même adresse IP, 
                              probablement en utilisant des identifiants volés ou devinés.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">3 mai 2025, ~02:14 - 04:37</p>
                          </div>
                        </div>
                      )}
                      
                      {steps[1].completed && (
                        <div className="relative">
                          <div className="absolute -left-[34px] bg-emerald-700 w-6 h-6 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-emerald-400 font-medium">Phase 2: Établissement de persistance</h3>
                            <p className="text-gray-300 mt-1">
                              Pour maintenir un accès permanent, l'attaquant a créé un nouvel utilisateur nommé "newuser" 
                              et a mis en place un mécanisme d'élévation de privilèges via un binaire setuid caché dans 
                              /tmp/.hidden/. Cette technique permet à l'attaquant de revenir facilement dans le système 
                              et d'obtenir des privilèges root à la demande.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">3 mai 2025, ~07:16 - 07:18</p>
                          </div>
                        </div>
                      )}
                      
                      {steps[2].completed && (
                        <div className="relative">
                          <div className="absolute -left-[34px] bg-emerald-700 w-6 h-6 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-emerald-400 font-medium">Phase 3: Exfiltration de données</h3>
                            <p className="text-gray-300 mt-1">
                              Une fois l'accès et la persistance établis, l'attaquant a exfiltré des données 
                              vers le serveur externe 203.0.113.5 sur le port 1337. L'analyse du trafic réseau 
                              indique qu'environ 8 Mo de données ont été transférés, probablement des informations 
                              financières ou des identifiants de clients.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">3 mai 2025, ~15:23</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Terminal className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="text-gray-400 text-lg mb-2">Chronologie en construction</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Collectez plus d'indices pour reconstituer la chronologie complète de l'attaque.
                        Analysez les preuves pour découvrir comment l'incident s'est déroulé.
                      </p>
                    </div>
                  )}
                  
                  {steps.every(step => step.completed) && (
                    <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
                      <h3 className="text-emerald-400 font-medium text-lg mb-2 flex items-center">
                        <Check className="h-5 w-5 mr-2" /> Investigation complétée
                      </h3>
                      <p className="text-gray-300">
                        Félicitations! Vous avez réussi à reconstituer la chronologie complète de l'attaque et à 
                        identifier les principales techniques utilisées par l'attaquant. Ces informations sont 
                        cruciales pour remédier à l'incident et améliorer la sécurité des systèmes de TradeSphere.
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Link href="/cyber/arcade/digital-forensics">
                          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                            Terminer l'investigation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}