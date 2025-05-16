import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Network, 
  ArrowLeft, 
  HelpCircle, 
  Activity, 
  Shield, 
  Database, 
  FileSearch, 
  Layers, 
  ServerCrash, 
  Wifi,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Download
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import CyberGlitchText from '@/components/CyberGlitchText';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Données d'exemple de captures réseau
const sampleCaptures = [
  {
    id: 'capture-1',
    name: 'Attaque DDoS SYN Flood',
    description: 'Capture d\'une attaque par déni de service SYN Flood contre un serveur web',
    difficulty: 'Intermédiaire',
    category: 'Attaque DDoS',
    duration: '3:45',
    packets: 1452,
    fileSize: '4.8 MB',
    date: '15/02/2025',
    scenario: 'Dans cette capture, vous observerez une attaque SYN Flood typique contre un serveur web. L\'attaquant envoie un grand nombre de paquets SYN sans compléter le processus de handshake TCP, épuisant ainsi les ressources du serveur.',
    learningGoals: [
      'Identifier les caractéristiques d\'une attaque SYN Flood',
      'Comprendre comment le protocole TCP peut être exploité',
      'Apprendre à filtrer et analyser un grand volume de trafic',
      'Reconnaître les adresses IP sources falsifiées'
    ]
  },
  {
    id: 'capture-2',
    name: 'Analyse DNS Tunneling',
    description: 'Exfiltration de données via tunneling DNS',
    difficulty: 'Avancé',
    category: 'Exfiltration de données',
    duration: '5:12',
    packets: 876,
    fileSize: '3.2 MB',
    date: '22/03/2025',
    scenario: 'Cette capture montre comment un acteur malveillant peut utiliser le protocole DNS pour exfiltrer des données d\'un réseau protégé. Le DNS tunneling exploite le fait que le trafic DNS est souvent autorisé à traverser les pare-feu sans inspection approfondie.',
    learningGoals: [
      'Détecter des anomalies dans le trafic DNS',
      'Identifier les modèles d\'exfiltration de données',
      'Comprendre comment le protocole DNS peut être détourné',
      'Apprendre à mettre en place des contrôles pour prévenir cette technique'
    ]
  },
  {
    id: 'capture-3',
    name: 'Scan de ports et empreinte réseau',
    description: 'Capture d\'une phase de reconnaissance avec scan de ports',
    difficulty: 'Débutant',
    category: 'Reconnaissance',
    duration: '2:18',
    packets: 523,
    fileSize: '1.9 MB',
    date: '05/01/2025',
    scenario: 'Dans cette capture, vous observerez les premières étapes d\'une attaque : la phase de reconnaissance. Un attaquant effectue différents types de scans de ports (SYN, FIN, XMAS) pour cartographier les services disponibles sur un réseau cible.',
    learningGoals: [
      'Reconnaître différents types de scans de ports',
      'Comprendre comment fonctionne la détection de services',
      'Apprendre à identifier une activité de reconnaissance',
      'Mettre en place des mesures de détection précoce'
    ]
  }
];

// Données d'exemple de paquets pour la capture sélectionnée
const samplePackets = [
  { id: 1, time: '0.000000', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'TCP', length: 74, info: 'SYN Sequence=0 Win=8192' },
  { id: 2, time: '0.000420', source: '93.184.216.34', destination: '192.168.1.100', protocol: 'TCP', length: 74, info: 'SYN, ACK Sequence=0 Ack=1 Win=8192' },
  { id: 3, time: '0.000840', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'TCP', length: 66, info: 'ACK Sequence=1 Ack=1 Win=8192' },
  { id: 4, time: '0.001200', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'HTTP', length: 430, info: 'GET / HTTP/1.1' },
  { id: 5, time: '0.025000', source: '93.184.216.34', destination: '192.168.1.100', protocol: 'TCP', length: 66, info: 'ACK Sequence=365 Ack=1 Win=8192' },
  { id: 6, time: '0.150000', source: '93.184.216.34', destination: '192.168.1.100', protocol: 'HTTP', length: 1450, info: 'HTTP/1.1 200 OK (text/html)' },
  { id: 7, time: '0.150500', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'TCP', length: 66, info: 'ACK Sequence=365 Ack=1385 Win=16384' },
  { id: 8, time: '0.250000', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'TCP', length: 66, info: 'FIN, ACK Sequence=365 Ack=1385 Win=16384' },
  { id: 9, time: '0.250350', source: '93.184.216.34', destination: '192.168.1.100', protocol: 'TCP', length: 66, info: 'FIN, ACK Sequence=1385 Ack=366 Win=8192' },
  { id: 10, time: '0.250700', source: '192.168.1.100', destination: '93.184.216.34', protocol: 'TCP', length: 66, info: 'ACK Sequence=366 Ack=1386 Win=16384' },
  { id: 11, time: '1.500000', source: '10.0.0.12', destination: '93.184.216.34', protocol: 'TCP', length: 74, info: 'SYN Sequence=0 Win=8192' },
  { id: 12, time: '1.500420', source: '93.184.216.34', destination: '10.0.0.12', protocol: 'TCP', length: 74, info: 'SYN, ACK Sequence=0 Ack=1 Win=8192' },
  { id: 13, time: '1.500840', source: '10.0.0.12', destination: '93.184.216.34', protocol: 'TCP', length: 66, info: 'ACK Sequence=1 Ack=1 Win=8192' },
  { id: 14, time: '1.501200', source: '10.0.0.12', destination: '93.184.216.34', protocol: 'HTTP', length: 430, info: 'GET /index.html HTTP/1.1' },
  { id: 15, time: '1.525000', source: '93.184.216.34', destination: '10.0.0.12', protocol: 'TCP', length: 66, info: 'ACK Sequence=365 Ack=1 Win=8192' },
];

// Données d'exemple pour l'analyse du paquet
const samplePacketAnalysis = {
  headers: [
    { layer: 'Frame', info: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)' },
    { layer: 'Ethernet II', info: 'Destination: Cisco_23:4e:11 (00:00:0c:23:4e:11), Source: Dell_9b:32:f1 (00:14:22:9b:32:f1)' },
    { layer: 'Internet Protocol Version 4', info: 'Source: 192.168.1.100, Destination: 93.184.216.34' },
    { layer: 'Transmission Control Protocol', info: 'Source Port: 43150, Destination Port: 80, Seq: 0, Flags: SYN' }
  ],
  hexdump: `0000   00 00 0c 23 4e 11 00 14 22 9b 32 f1 08 00 45 00
0010   00 3c 8d 3d 40 00 40 06 25 5a c0 a8 01 64 5d b8
0020   d8 22 a8 8e 00 50 20 7b 8d 4e 00 00 00 00 a0 02
0030   20 00 71 d5 00 00 02 04 05 b4 04 02 08 0a 09 b7
0040   29 4c 00 00 00 00 01 03 03 07`
};

const NetworkLab: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('captures');
  const [selectedCapture, setSelectedCapture] = useState(sampleCaptures[0]);
  const [captureLoaded, setCaptureLoaded] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
  const [captureAnalysis, setCaptureAnalysis] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [aiAnalysisRequested, setAiAnalysisRequested] = useState(false);
  const { toast } = useToast();

  // Simuler un délai de chargement lors du changement de capture
  useEffect(() => {
    setCaptureLoaded(false);
    setSelectedPacket(null);
    setCaptureAnalysis(null);
    setAiAnalysisRequested(false);
    
    const timer = setTimeout(() => {
      setCaptureLoaded(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [selectedCapture]);

  // Fonction pour demander une analyse IA
  const requestAIAnalysis = () => {
    setAiAnalysisRequested(true);
    
    toast({
      title: 'Analyse IA en cours',
      description: 'Traitement de la capture réseau...',
      variant: 'default'
    });
    
    // Simuler un délai pour l'analyse IA
    setTimeout(() => {
      const analysis = generateAIAnalysis(selectedCapture);
      setCaptureAnalysis(analysis);
      
      toast({
        title: 'Analyse IA terminée',
        description: 'L\'analyse du trafic est disponible dans l\'onglet "Analyse"',
        variant: 'default'
      });
    }, 2500);
  };

  // Fonction simulant une analyse IA
  const generateAIAnalysis = (capture: typeof sampleCaptures[0]) => {
    // Dans une version réelle, cela appellerait l'API Azure OpenAI
    if (capture.id === 'capture-1') {
      return `# Analyse de l'attaque SYN Flood

Cette capture présente toutes les caractéristiques d'une attaque par déni de service (DDoS) de type SYN Flood. Voici les observations clés:

## Observations principales:
1. **Volume anormal de paquets SYN**: On observe un nombre très élevé de paquets SYN (1452) sur une courte période (3:45).
2. **Adresses IP sources multiples**: Les paquets proviennent de nombreuses adresses IP différentes, probablement falsifiées.
3. **Aucune session TCP complétée**: La plupart des tentatives de connexion ne complètent jamais le handshake TCP à trois étapes.

## Mécanisme de l'attaque:
L'attaquant exploite le protocole TCP en envoyant un grand nombre de paquets SYN au serveur cible. Le serveur répond à chaque demande avec un paquet SYN-ACK et maintient une connexion semi-ouverte en attente d'une réponse ACK qui ne viendra jamais. Ces connexions semi-ouvertes consomment des ressources serveur jusqu'à épuisement.

## Recommandations de protection:
1. Implémenter des protections SYN cookies ou SYN proxy
2. Configurer des seuils de taux de connexion sur les pare-feu
3. Utiliser des services de protection DDoS qui peuvent filtrer ce type d'attaque
4. Augmenter la taille des files d'attente de connexion TCP et réduire les délais d'expiration

## Indicateurs techniques:
- Adresses IP sources à surveiller: 10.0.12.23, 192.168.45.12, 172.16.23.45 (parmi les plus actives)
- Port ciblé: principalement le port 80 (HTTP)
- Signature du trafic: rafales de paquets SYN de 60-80 octets`;
    } else if (capture.id === 'capture-2') {
      return `# Analyse du DNS Tunneling

Cette capture montre une technique d'exfiltration de données sophistiquée utilisant le protocole DNS comme canal de communication caché.

## Observations principales:
1. **Requêtes DNS anormalement longues**: Noms de domaine exceptionnellement longs et complexes.
2. **Haute fréquence de requêtes**: Volume inhabituellement élevé de requêtes DNS.
3. **Encodage de données**: Les sous-domaines contiennent des données encodées en base64.
4. **Communications avec un domaine suspect**: Toutes les requêtes pointent vers \`data-exfil.malicious-domain.com\`.

## Mécanisme de l'attaque:
L'attaquant encode les données sensibles dans les requêtes DNS en les fragmentant et en les encodant dans les noms de domaine. Par exemple:
\`Z2V0X3NlY3JldF9maWxlLmRvYw==.data-exfil.malicious-domain.com\`

Cela permet de contourner les pare-feu qui autorisent généralement le trafic DNS sortant sans inspection approfondie.

## Recommandations de protection:
1. Limiter la taille des requêtes DNS
2. Implémenter une analyse comportementale du trafic DNS
3. Exiger que toutes les requêtes DNS passent par des serveurs DNS internes
4. Mettre en place des règles de détection d'anomalies pour repérer les requêtes fréquentes et volumineuses

## Données potentiellement exfiltrées:
L'analyse préliminaire suggère que les fichiers suivants ont pu être exfiltrés:
- credentials.xlsx (identifiants)
- customer_database.sql (base de données clients)
- financial_report_q2.pdf (rapport financier)`;
    } else {
      return `# Analyse du scan de reconnaissance

Cette capture montre clairement une phase de reconnaissance réseau, première étape d'une attaque potentielle.

## Observations principales:
1. **Scan de ports systématique**: Tentatives de connexion séquentielles sur plusieurs ports.
2. **Variété de techniques**: Présence de scans SYN, FIN, XMAS et ACK.
3. **Sondage de services**: Tentatives d'identification des services sur les ports ouverts.
4. **Cartographie du réseau**: Balayage méthodique d'une plage d'adresses IP.

## Mécanisme de reconnaissance:
L'attaquant utilise des outils comme Nmap pour découvrir:
- Quels hôtes sont actifs sur le réseau
- Quels ports sont ouverts sur ces hôtes
- Quels services et versions de services fonctionnent
- Quels systèmes d'exploitation sont utilisés

## Recommandations de protection:
1. Configurer un IDS/IPS pour détecter les scans de ports
2. Limiter les informations divulguées par les bannières de services
3. Segmenter le réseau pour limiter l'étendue de la reconnaissance
4. Mettre en place des règles de pare-feu pour bloquer les scans évidents

## Cibles principales:
Les systèmes suivants ont été particulièrement ciblés:
- Serveur web (ports 80/443)
- Serveur de base de données (port 3306)
- Services d'administration à distance (ports 22/3389)

Cette activité suggère une préparation pour une attaque ciblée ultérieure.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      {/* Barre de navigation supérieure */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-cyan-400 border-cyan-400/30 hover:bg-cyan-950/30"
          onClick={() => setLocation('/cyber')}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au CYBER LAB
        </Button>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            Captures: {sampleCaptures.length}
          </Badge>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-cyan-800">
                <p>Guide d'utilisation du Laboratoire d'analyse de trafic réseau</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Titre et description */}
      <div className="mb-6 text-center">
        <CyberGlitchText 
          text="LABORATOIRE D'ANALYSE DE TRAFIC RÉSEAU" 
          className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text"
        />
        <p className="text-gray-300 mt-2 max-w-3xl mx-auto">
          Analysez des captures réseau pour détecter et comprendre les cyberattaques en temps réel
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des captures */}
        <Card className="lg:col-span-1 bg-gray-900/40 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <FileSearch className="h-5 w-5" />
              Captures disponibles
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sélectionnez une capture pour l'analyser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleCaptures.map(capture => (
              <div
                key={capture.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-150 flex flex-col",
                  selectedCapture.id === capture.id
                    ? "bg-violet-900/20 border border-violet-500/50"
                    : "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800"
                )}
                onClick={() => setSelectedCapture(capture)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">{capture.name}</h3>
                  <Badge 
                    variant={
                      capture.difficulty === 'Débutant' ? 'outline' : 
                      capture.difficulty === 'Intermédiaire' ? 'secondary' : 
                      'destructive'
                    }
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
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span className="flex items-center"><Activity className="h-3 w-3 mr-1" /> {capture.packets} paquets</span>
                  <span>•</span>
                  <span>{capture.duration}</span>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <h3 className="text-blue-400 font-medium text-sm flex items-center gap-1.5">
                <Wifi className="h-4 w-4" />
                Capture en direct
              </h3>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                Capturez le trafic réseau en temps réel
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="live-capture" className="text-xs text-gray-300">Activer</Label>
                  <Switch 
                    id="live-capture" 
                    checked={isCapturing}
                    onCheckedChange={setIsCapturing}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!isCapturing}
                  className="h-7 text-xs border-blue-500/50 text-blue-400"
                >
                  Configurer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Espace de travail principal */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-gray-900/40 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-white">{selectedCapture.name}</CardTitle>
                  <CardDescription className="text-gray-400">{selectedCapture.description}</CardDescription>
                </div>
                <Badge 
                  className="bg-violet-900/30 text-violet-300 py-1.5 border-violet-500/50"
                >
                  {selectedCapture.category}
                </Badge>
              </div>
              <Separator className="bg-gray-800 mt-4" />
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-800/50 p-0 flex justify-start rounded-none border-b border-gray-800">
                  <TabsTrigger 
                    value="captures" 
                    className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white rounded-none border-r border-gray-800"
                  >
                    Scénario
                  </TabsTrigger>
                  <TabsTrigger 
                    value="packets" 
                    className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white rounded-none border-r border-gray-800"
                  >
                    Paquets
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analysis" 
                    className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 rounded-none"
                  >
                    Analyse IA
                  </TabsTrigger>
                </TabsList>
                
                {/* Onglet Scénario */}
                <TabsContent value="captures" className="p-4 pt-6 border-t-0 mt-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Scénario de la capture
                      </h3>
                      <Alert className="bg-blue-950/20 border-blue-900/50">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <AlertTitle className="text-blue-300">Contexte</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          {selectedCapture.scenario}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Objectifs d'apprentissage
                      </h3>
                      <div className="space-y-2">
                        {selectedCapture.learningGoals.map((goal, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-cyan-400 mt-0.5" />
                            <p className="text-gray-300">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Durée</p>
                          <p className="text-cyan-300 font-medium flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-cyan-500" />
                            {selectedCapture.duration}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Paquets</p>
                          <p className="text-cyan-300 font-medium flex items-center">
                            <Layers className="h-4 w-4 mr-1 text-cyan-500" />
                            {selectedCapture.packets}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Taille</p>
                          <p className="text-cyan-300 font-medium flex items-center">
                            <Database className="h-4 w-4 mr-1 text-cyan-500" />
                            {selectedCapture.fileSize}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Date</p>
                          <p className="text-cyan-300 font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-cyan-500" />
                            {selectedCapture.date}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-violet-700 hover:bg-violet-600"
                        onClick={() => {
                          setActiveTab('packets');
                          toast({
                            title: 'Capture chargée',
                            description: 'Vous pouvez maintenant analyser les paquets réseau',
                            variant: 'default'
                          });
                        }}
                      >
                        Charger la capture
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet Paquets */}
                <TabsContent value="packets" className="border-t-0 mt-0 p-0">
                  {!captureLoaded ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="text-center">
                        <ServerCrash className="h-10 w-10 text-gray-500 mb-4 mx-auto animate-pulse" />
                        <h3 className="text-lg font-medium text-gray-400">Chargement de la capture...</h3>
                        <p className="text-sm text-gray-500 mt-2">Veuillez patienter pendant le traitement des paquets</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-800/80 flex items-center gap-2 border-b border-gray-700">
                        <div className="flex-1 flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="h-8 px-2 gap-1 bg-blue-700 hover:bg-blue-600"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 gap-1 border-gray-600"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 gap-1 border-gray-600"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-gray-400" />
                          <Input
                            className="h-8 w-64 bg-gray-900 border-gray-700 text-sm"
                            placeholder="ip.addr == 192.168.1.100 && tcp"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        {/* Liste des paquets */}
                        <div className="border-r border-gray-800">
                          <div className="bg-gray-900 text-xs text-gray-400 grid grid-cols-6 p-2 border-b border-gray-800">
                            <div className="col-span-1">No.</div>
                            <div className="col-span-1">Temps</div>
                            <div className="col-span-1">Source</div>
                            <div className="col-span-1">Destination</div>
                            <div className="col-span-1">Protocole</div>
                            <div className="col-span-1">Info</div>
                          </div>
                          <ScrollArea className="h-[350px]">
                            {samplePackets.map((packet) => (
                              <div
                                key={packet.id}
                                className={cn(
                                  "text-xs grid grid-cols-6 p-2 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800/50",
                                  selectedPacket === packet.id ? "bg-blue-900/20" : 
                                  packet.protocol === 'HTTP' ? "bg-green-900/10" :
                                  packet.protocol === 'TCP' && packet.info.includes('SYN') ? "bg-amber-900/10" :
                                  ""
                                )}
                                onClick={() => setSelectedPacket(packet.id)}
                              >
                                <div className="col-span-1 font-mono">{packet.id}</div>
                                <div className="col-span-1 font-mono">{packet.time}</div>
                                <div className="col-span-1 font-mono text-cyan-300">{packet.source}</div>
                                <div className="col-span-1 font-mono text-purple-300">{packet.destination}</div>
                                <div className="col-span-1">
                                  <Badge
                                    variant="outline"
                                    className={
                                      packet.protocol === 'HTTP' ? "bg-green-900/20 text-green-400 border-green-500/30" :
                                      packet.protocol === 'TCP' ? "bg-blue-900/20 text-blue-400 border-blue-500/30" :
                                      packet.protocol === 'UDP' ? "bg-purple-900/20 text-purple-400 border-purple-500/30" :
                                      packet.protocol === 'ICMP' ? "bg-red-900/20 text-red-400 border-red-500/30" :
                                      "bg-gray-900/20 text-gray-400 border-gray-500/30"
                                    }
                                  >
                                    {packet.protocol}
                                  </Badge>
                                </div>
                                <div className="col-span-1 truncate">{packet.info}</div>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                        
                        {/* Détails du paquet */}
                        <div>
                          {selectedPacket ? (
                            <div>
                              <div className="p-2 bg-gray-800 text-xs text-gray-400 border-b border-gray-700">
                                Détails du paquet #{selectedPacket}
                              </div>
                              <ScrollArea className="h-[350px]">
                                <div className="p-3">
                                  {/* En-têtes du paquet */}
                                  <div className="mb-4">
                                    {samplePacketAnalysis.headers.map((header, index) => (
                                      <div key={index} className="mb-2">
                                        <div className="text-xs font-medium text-blue-400 mb-1">{header.layer}</div>
                                        <div className="text-xs text-gray-300 pl-2 border-l-2 border-blue-800/50">
                                          {header.info}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Affichage hexadécimal */}
                                  <div>
                                    <div className="text-xs font-medium text-purple-400 mb-1">Données brutes (hexadécimal)</div>
                                    <pre className="text-xs font-mono text-gray-300 p-2 bg-gray-800/50 rounded overflow-auto whitespace-pre-wrap">
                                      {samplePacketAnalysis.hexdump}
                                    </pre>
                                  </div>
                                </div>
                              </ScrollArea>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-center p-8">
                              <div>
                                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-gray-400 mb-1">Aucun paquet sélectionné</h3>
                                <p className="text-xs text-gray-500">Cliquez sur un paquet dans la liste pour voir ses détails</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 border-t border-gray-800 bg-gray-900/50">
                        <Button 
                          onClick={requestAIAnalysis}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={!captureLoaded || aiAnalysisRequested}
                        >
                          {aiAnalysisRequested ? (
                            <>Analyse en cours...</>
                          ) : (
                            <>Demander une analyse IA de cette capture</>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                {/* Onglet Analyse IA */}
                <TabsContent value="analysis" className="border-t-0 mt-0 p-0">
                  {captureAnalysis ? (
                    <div className="p-4">
                      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                        <div className="markdown-body prose prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: captureAnalysis.replace(/^# (.+)$/m, '<h1>$1</h1>')
                                                  .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-cyan-300 mt-4 mb-2">$1</h2>')
                                                  .replace(/^(.+)$/gm, function(match) {
                                                    if (match.startsWith('#') || match.startsWith('<h')) return match;
                                                    if (match.trim() === '') return '<br>';
                                                    return '<p class="text-gray-300 mb-2">' + match + '</p>';
                                                  })
                                                  .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                  .replace(/`(.+?)`/g, '<code class="bg-gray-800 text-cyan-300 p-0.5 rounded">$1</code>')
                                                  .replace(/- (.+)/g, '<li class="ml-4 flex items-start gap-2 mb-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span><span>$1</span></li>')
                          }} />
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-800">
                          <h3 className="text-sm font-semibold mb-2 text-gray-300">Cette analyse vous a-t-elle été utile ?</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-950/30">
                              Oui, très pertinente
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                              Partiellement
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                              Non, pas utile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-20">
                      <div className="text-center max-w-md p-6">
                        <ServerCrash className="h-12 w-12 text-gray-500 mb-4 mx-auto" />
                        <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune analyse IA disponible</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Pour obtenir une analyse complète de cette capture réseau, veuillez d'abord charger la capture dans l'onglet "Paquets", puis cliquer sur "Demander une analyse IA".
                        </p>
                        <Button 
                          onClick={() => setActiveTab('packets')}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          Aller à l'onglet Paquets
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Effet visuel cyberpunk */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" style={{ 
        animation: 'moveHorizontal 3s linear infinite', 
        backgroundSize: '200% 100%' 
      }}></div>

      <style>{`
        @keyframes moveHorizontal {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
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