import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Network, 
  Server, 
  Shield, 
  Cpu, 
  Database, 
  File, 
  AlertTriangle,
  ArrowLeft,
  Eye,
  Play
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CyberLabNav } from '../cyber-lab/CyberLabNav';
import { useToast } from '@/hooks/use-toast';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import '@/styles/cyber-lab.css';

// Captures réseau simulées
const captures = [
  {
    id: 'scan-port-tcp',
    title: 'Scan de ports TCP',
    description: 'Analysez un scan de ports TCP et identifiez les ports ouverts et les services potentiels.',
    difficulty: 'Débutant',
    category: 'Reconnaissance',
    previewImage: '/assets/cyber/tcp-scan-preview.png',
    pcapFile: 'tcp-scan.pcap',
    objectives: [
      'Identifier les ports ouverts',
      'Déterminer les services potentiels',
      'Évaluer les méthodologies de scan utilisées'
    ],
    questions: [
      {
        id: 'q1',
        text: 'Quels sont les 3 principaux ports ouverts détectés dans ce scan?',
        options: ['80, 443, 22', '21, 22, 23', '3389, 445, 139', '8080, 8443, 3306'],
        answer: 0
      },
      {
        id: 'q2',
        text: 'Quelle méthode de scan TCP a été principalement utilisée?',
        options: ['SYN scan', 'Connect scan', 'FIN scan', 'XMAS scan'],
        answer: 0
      }
    ],
    codeTemplate: `# Analyse du scan de ports avec Python et Scapy
from scapy.all import *

def analyze_pcap(file):
    # Charger le fichier PCAP
    packets = rdpcap(file)
    
    # Analyser les paquets pour détecter les ports ouverts
    open_ports = []
    
    # Votre code d'analyse ici
    
    return open_ports

# Test de la fonction
open_ports = analyze_pcap("tcp-scan.pcap")
print("Ports ouverts détectés:", open_ports)
`
  },
  {
    id: 'ddos-attack',
    title: 'Attaque DDoS',
    description: 'Analysez une capture réseau montrant une attaque DDoS et déterminez le type d\'attaque et son impact.',
    difficulty: 'Intermédiaire',
    category: 'Sécurité',
    previewImage: '/assets/cyber/ddos-preview.png',
    pcapFile: 'ddos.pcap',
    objectives: [
      'Identifier le type d\'attaque DDoS',
      'Analyser le trafic anormal',
      'Déterminer les adresses IP impliquées',
      'Évaluer l\'impact sur le serveur cible'
    ],
    questions: [
      {
        id: 'q1',
        text: 'Quel type d\'attaque DDoS est présent dans cette capture?',
        options: ['SYN Flood', 'UDP Flood', 'HTTP Flood', 'DNS Amplification'],
        answer: 0
      },
      {
        id: 'q2',
        text: 'Combien d\'adresses IP sources uniques participent à l\'attaque?',
        options: ['Moins de 10', 'Entre 10 et 50', 'Entre 50 et 200', 'Plus de 200'],
        answer: 3
      }
    ],
    codeTemplate: `# Analyse d'attaque DDoS avec Python
import pandas as pd
import matplotlib.pyplot as plt
from scapy.all import *

def analyze_ddos(file):
    # Charger le fichier PCAP
    packets = rdpcap(file)
    
    # Extraire les données pertinentes
    data = []
    
    # Votre code d'analyse ici
    
    # Visualisation des résultats
    df = pd.DataFrame(data)
    
    return {
        "attack_type": "SYN Flood",
        "unique_sources": 0,
        "packets_per_second": 0,
        "most_targeted_port": 0
    }

# Test de la fonction
results = analyze_ddos("ddos.pcap")
print("Résultats de l'analyse:", results)
`
  },
  {
    id: 'data-exfiltration',
    title: 'Exfiltration de données',
    description: 'Détectez et analysez une tentative d\'exfiltration de données dans une capture réseau.',
    difficulty: 'Avancé',
    category: 'Forensique',
    previewImage: '/assets/cyber/exfil-preview.png',
    pcapFile: 'exfiltration.pcap',
    objectives: [
      'Identifier les techniques d\'exfiltration utilisées',
      'Reconstituer les données exfiltrées',
      'Déterminer l\'origine et la destination',
      'Évaluer la gravité de la compromission'
    ],
    questions: [
      {
        id: 'q1',
        text: 'Quel protocole a été détourné pour l\'exfiltration de données?',
        options: ['DNS', 'ICMP', 'HTTP', 'NTP'],
        answer: 0
      },
      {
        id: 'q2',
        text: 'Quel type de données a été exfiltré?',
        options: ['Fichiers système', 'Base de données client', 'Clés SSH', 'Informations de carte de crédit'],
        answer: 1
      }
    ],
    codeTemplate: `# Analyse d'exfiltration de données DNS avec Python
from scapy.all import *
import base64

def detect_dns_exfiltration(file):
    # Charger le fichier PCAP
    packets = rdpcap(file)
    
    # Variables pour stocker les données
    exfiltrated_data = []
    suspicious_domains = []
    
    # Votre code d'analyse ici
    
    # Tenter de reconstruire les données exfiltrées
    reconstructed_data = ""
    
    return {
        "suspicious_domains": suspicious_domains,
        "exfiltrated_data": reconstructed_data,
        "records_count": len(exfiltrated_data)
    }

# Test de la fonction
results = detect_dns_exfiltration("exfiltration.pcap")
print("Données potentiellement exfiltrées:", results["exfiltrated_data"][:100], "...")
`
  }
];

const NetworkLab: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedCapture, setSelectedCapture] = useState(captures[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeRunning, setCodeRunning] = useState(false);
  const { toast } = useToast();
  
  const runAnalysis = () => {
    setCodeRunning(true);
    
    // Simulation d'exécution de code avec délai pour l'effet
    setTimeout(() => {
      setCodeRunning(false);
      
      // Génération d'une sortie simulée basée sur la capture sélectionnée
      if (selectedCapture.id === 'scan-port-tcp') {
        setCodeOutput(`Analyse de tcp-scan.pcap...
Traitement de 1458 paquets...

Ports ouverts détectés: [22, 80, 443]
Services potentiels:
 - Port 22: SSH
 - Port 80: HTTP
 - Port 443: HTTPS

Détails du scan:
 - Type de scan: SYN scan (furtif)
 - Durée totale: 5.2 secondes
 - Paquets SYN envoyés: 1000
 - Réponses SYN-ACK reçues: 3
 - Réponses RST reçues: 997

Analyse terminée avec succès.`);
      } else if (selectedCapture.id === 'ddos-attack') {
        setCodeOutput(`Analyse de ddos.pcap...
Traitement de 25694 paquets...

Résultats de l'analyse: {
  "attack_type": "SYN Flood",
  "unique_sources": 247,
  "packets_per_second": 1835,
  "most_targeted_port": 80,
  "attack_duration": "00:03:45",
  "syn_to_synack_ratio": 98.7
}

Graphique généré: ddos_traffic_analysis.png
Les adresses IP sources principales impliquées:
 - 192.168.1.x: 78 adresses
 - 10.0.x.x: 112 adresses
 - 172.16.x.x: 57 adresses

Analyse terminée avec succès.`);
      } else {
        setCodeOutput(`Analyse de exfiltration.pcap...
Traitement de 3752 paquets...

Données potentiellement exfiltrées:
Détecté 37 requêtes DNS suspectes vers le domaine exfil.malicious.com
Format des requêtes: base64.[données encodées].exfil.malicious.com

Après décodage:
{
  "table": "clients",
  "records": [
    {"id": 1001, "name": "John Smith", "email": "jsmith@example.com"},
    {"id": 1002, "name": "Sarah Johnson", "email": "sjohnson@example.com"},
    {"id": 1003, "name": "Michael Brown", "email": "mbrown@example.com"},
    ...truncated (34 more records)
  ]
}

Extraction totale: ~15KB de données client (format JSON)
Temps de l'exfiltration: 2023-05-17 02:14:32 - 02:17:49

Analyse terminée avec succès.`);
      }
      
      toast({
        title: "Analyse terminée",
        description: "Le code d'analyse a été exécuté avec succès.",
      });
    }, 2500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Barre de navigation commune aux modules du CYBER LAB */}
      <CyberLabNav activeModule="network" />
      
      <div className="p-6">
        {/* En-tête de la page */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-cyan-300 mb-1">Laboratoire d'analyse de trafic réseau</h1>
          <p className="text-gray-400 text-sm">Analysez des captures réseau pour identifier les menaces et vulnérabilités</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Liste des captures réseau */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <File className="h-5 w-5 text-cyan-400" />
                  Captures disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {captures.map((capture) => (
                    <div 
                      key={capture.id}
                      className={cn(
                        "p-3 border-l-2 cursor-pointer transition-all duration-150",
                        selectedCapture.id === capture.id
                          ? "bg-cyan-900/20 border-l-cyan-500"
                          : "bg-gray-800/50 border-l-transparent hover:bg-gray-800"
                      )}
                      onClick={() => setSelectedCapture(capture)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-white text-sm">{capture.title}</h3>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            capture.difficulty === 'Débutant' ? 'bg-green-900/20 text-green-400 border-green-500/30' : 
                            capture.difficulty === 'Intermédiaire' ? 'bg-amber-900/20 text-amber-400 border-amber-500/30' : 
                            'bg-red-900/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {capture.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{capture.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">{selectedCapture.title}</CardTitle>
                    <CardDescription>{selectedCapture.description}</CardDescription>
                  </div>
                  <Badge
                    className="bg-cyan-900/30 text-cyan-300 border-cyan-700"
                  >
                    {selectedCapture.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-gray-800 grid grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Aperçu</TabsTrigger>
                    <TabsTrigger value="analyzer">Analyseur</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-cyan-300 mb-3">Objectifs d'apprentissage</h3>
                        <ul className="space-y-2">
                          {selectedCapture.objectives.map((objective, index) => (
                            <li key={index} className="flex gap-2 text-sm text-gray-300">
                              <div className="w-5 h-5 rounded-full bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center text-xs text-cyan-300 shrink-0">
                                {index + 1}
                              </div>
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800 rounded-md flex items-center justify-center p-4">
                        <div className="text-center">
                          <Network className="w-20 h-20 text-cyan-500/50 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">Visualisation de la capture réseau</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-3 text-cyan-400 border-cyan-500/30 hover:bg-cyan-900/20"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Prévisualiser
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md text-white flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          Contexte de la capture
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        Cette capture réseau provient d'un environnement contrôlé reproduisant un réseau d'entreprise. 
                        Elle a été collectée pendant une simulation d'activité malveillante pour des fins éducatives. 
                        Votre tâche est d'analyser les motifs de trafic anormaux et d'identifier les indicateurs de compromission.
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="analyzer" className="space-y-4">
                    <div className="h-[300px] bg-gray-950 rounded-md overflow-hidden border border-gray-800">
                      <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={selectedCapture.codeTemplate}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        className="text-gray-400 hover:text-gray-300 border-gray-700"
                      >
                        Réinitialiser
                      </Button>
                      
                      <Button 
                        className="bg-cyan-700 hover:bg-cyan-600 text-white"
                        onClick={runAnalysis}
                        disabled={codeRunning}
                      >
                        {codeRunning ? (
                          <>
                            <span className="animate-spin mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </svg>
                            </span>
                            Exécution en cours...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Exécuter l'analyse
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {codeOutput && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Sortie:</h3>
                        <div className="bg-black rounded-md border border-gray-800 p-3 font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
                          {codeOutput}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="questions" className="space-y-4">
                    <p className="text-gray-400 text-sm mb-4">
                      Répondez aux questions suivantes pour tester votre compréhension de la capture réseau analysée.
                    </p>
                    
                    {selectedCapture.questions.map((question, index) => (
                      <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-md text-white">
                            Question {index + 1}: {question.text}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer"
                              >
                                <div className={`w-5 h-5 rounded-full border ${
                                  optIndex === question.answer 
                                    ? "bg-cyan-500/20 border-cyan-500" 
                                    : "border-gray-600"
                                } flex items-center justify-center`}>
                                  {optIndex === question.answer && (
                                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                  )}
                                </div>
                                <span className="text-sm text-gray-300">{option}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600">
                      Vérifier les réponses
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Calendar manquant
const Calendar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default NetworkLab;