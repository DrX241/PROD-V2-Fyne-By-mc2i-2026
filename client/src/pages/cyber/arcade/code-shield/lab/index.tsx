import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, Code, Play, FilePlus, FileText, 
  Trash2, PlusCircle, RefreshCw, HelpCircle, ZapIcon,
  MonitorIcon, DatabaseIcon, NetworkIcon, FolderIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Switch } from "@/components/ui/switch";

// Types
interface Rule {
  id: string;
  type: 'signature' | 'static' | 'behavior' | 'sandbox' | 'heuristic';
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface File {
  id: string;
  name: string;
  type: string;
  size: string;
  content: string;
  behavior?: string[];
  malwareType?: string;
  isMalicious: boolean;
  isDetected?: boolean;
  detectionMethod?: string;
}

interface LabSettings {
  detectionThreshold: number;
  enableHeuristics: boolean;
  enableBehavioralAnalysis: boolean;
  enableSandbox: boolean;
  aggressiveness: 'low' | 'medium' | 'high';
  falsePositiveProtection: boolean;
}

interface SandboxEnvironment {
  runningProcesses: string[];
  networkConnections: string[];
  fileSystemChanges: string[];
  registryChanges: string[];
}

export default function CodeShieldLab() {
  // States
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<Rule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<{
    type: 'signature' | 'static' | 'behavior' | 'sandbox' | 'heuristic';
    name: string;
    condition: string;
    action?: string;
    enabled?: boolean;
  }>({
    type: 'signature',
    name: '',
    condition: '',
    action: 'Bloquer et mettre en quarantaine',
    enabled: true
  });
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxData, setSandboxData] = useState<SandboxEnvironment>({
    runningProcesses: [],
    networkConnections: [],
    fileSystemChanges: [],
    registryChanges: []
  });
  const [scanResults, setScanResults] = useState({
    filesScanned: 0,
    threatsDetected: 0,
    falsePositives: 0,
    missedThreats: 0,
    scanTime: 0
  });
  const [settings, setSettings] = useState<LabSettings>({
    detectionThreshold: 70,
    enableHeuristics: true,
    enableBehavioralAnalysis: true,
    enableSandbox: true,
    aggressiveness: 'medium',
    falsePositiveProtection: true
  });
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFileTab, setSelectedFileTab] = useState('content');

  // Effect to initialize demo data
  useEffect(() => {
    initializeDemo();
  }, []);

  // Initialize demo data
  const initializeDemo = () => {
    // Demo rules
    const demoRules: Rule[] = [
      {
        id: 'rule-1',
        type: 'signature',
        name: 'Détection de ransomware connu',
        condition: 'La signature contient "RANSOM" ou "CRYPT"',
        action: 'Bloquer et mettre en quarantaine',
        enabled: true
      },
      {
        id: 'rule-2',
        type: 'static',
        name: 'Détection de script malveillant',
        condition: 'Le fichier contient "document.write" et "eval("',
        action: 'Analyser dans le sandbox',
        enabled: true
      },
      {
        id: 'rule-3',
        type: 'behavior',
        name: 'Détection de comportement suspicieux',
        condition: 'Le processus tente de chiffrer plusieurs fichiers',
        action: 'Bloquer l\'accès au système de fichiers',
        enabled: true
      }
    ];

    setRules(demoRules);
  };

  // Generate files to scan
  const generateFiles = () => {
    setIsGeneratingFiles(true);
    
    setTimeout(() => {
      const generatedFiles: File[] = [
        {
          id: 'file-1',
          name: 'rapport-annuel.pdf',
          type: 'PDF Document',
          size: '1.2 MB',
          content: 'PDF-1.5\n%¥±ë\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nendobj\nRapport financier annuel - Entreprise XYZ',
          isMalicious: false
        },
        {
          id: 'file-2',
          name: 'setup-installer.exe',
          type: 'Exécutable',
          size: '3.4 MB',
          content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00\n.text\nPE signature was detected\nSignature: TROJAN.WIN32.FAKEUPDATER.XZ\nImport: kernel32.dll, user32.dll, advapi32.dll, wininet.dll\nStrings found: hideProcess, modifyRegistry, contactC2',
          behavior: [
            'Démarre un processus caché',
            'Se connecte à un serveur distant non authentifié',
            'Modifie les clés de registre de démarrage',
            'Tente de désactiver Windows Defender'
          ],
          malwareType: 'Trojan',
          isMalicious: true
        },
        {
          id: 'file-3',
          name: 'presentation.pptx',
          type: 'Présentation',
          size: '5.7 MB',
          content: 'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x00\x00\xFF\xFF\n[Content truncated]\nppt/presentation.xml\n<p:presentation>\n<p:sldMasterIdLst>\n<p:sldMasterId id="2147483648"/>\n</p:sldMasterIdLst>\n<p:sldIdLst>\n<p:sldId id="256"/>\n</p:sldIdLst>\n</p:presentation>',
          isMalicious: false
        },
        {
          id: 'file-4',
          name: 'important-update.js',
          type: 'Script JavaScript',
          size: '15 KB',
          content: 'function initialize() {\n  // JS-CRYPTOMINER-2023\n  var script = document.createElement("script");\n  script.src = "https://malicious-domain.com/miner.js";\n  document.write("<div style=\'position:absolute;left:-9999px\'>");\n  eval("function mine() { useResources(90); }");\n  // Hide traces\n  setInterval(function() {\n    mine();\n  }, 1000);\n}\n',
          behavior: [
            'Exécute du code en utilisant eval()',
            'Insère du contenu masqué dans la page',
            'Utilise les ressources du CPU à 100%',
            'Se connecte à un domaine connu pour héberger des cryptominers'
          ],
          malwareType: 'Cryptominer',
          isMalicious: true
        },
        {
          id: 'file-5',
          name: 'systeme-update.bat',
          type: 'Script Batch',
          size: '3 KB',
          content: '@echo off\nREM RANSOM-FILE-ENCRYPTOR\necho Mise à jour du système en cours...\nif exist %USERPROFILE%\\Documents (\n  echo Préparation des fichiers...\n  for /r %USERPROFILE%\\Documents %%x in (*.doc *.pdf *.jpg) do (\n    echo Traitement de %%x\n    REM Simule le chiffrement\n    echo ENCRYPTED > %%x.encrypted\n  )\n  echo Terminé.\n)',
          behavior: [
            'Parcourt récursivement tous les dossiers utilisateur',
            'Modifie les fichiers pdf, doc et jpg',
            'Crée des fichiers avec extension .encrypted',
            'Masque son activité avec de faux messages de mise à jour'
          ],
          malwareType: 'Ransomware',
          isMalicious: true
        },
        {
          id: 'file-6',
          name: 'calculator.exe',
          type: 'Exécutable',
          size: '245 KB',
          content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00\n.text\nPE header found\nImport: kernel32.dll, user32.dll, gdi32.dll\nStrings found: CreateWindowEx, SetWindowText, RegisterClass, MessageBox\nSignature verified: Microsoft Windows Application',
          behavior: [
            'Crée une fenêtre standard',
            'Utilise les API Windows standards',
            'Aucune connexion réseau détectée',
            'Aucune modification du système détectée'
          ],
          isMalicious: false
        }
      ];
      
      setFiles(generatedFiles);
      setIsGeneratingFiles(false);
    }, 1500);
  };

  // Run sandbox analysis on a file
  const runSandboxAnalysis = (file: File) => {
    setShowSandbox(true);
    setIsAnalyzing(true);
    
    // Simulate sandbox analysis
    setTimeout(() => {
      if (file.isMalicious) {
        // Generate sandbox data for malicious file
        const sandboxResult: SandboxEnvironment = {
          runningProcesses: [
            `${file.name} (PID: 4256)`,
            'svchost.exe (PID: 1892)',
            'cmd.exe (PID: 5344, spawned by file)',
            'powershell.exe (PID: 6128, spawned by file)',
          ],
          networkConnections: [
            file.malwareType === 'Cryptominer' 
              ? 'TCP 192.168.1.5:49322 -> mining-pool.com:8080 (ESTABLISHED)' 
              : 'TCP 192.168.1.5:49322 -> malicious-server.net:443 (ESTABLISHED)',
            'DNS query for command-server.net',
            'HTTP POST to data-exfiltration.com/upload.php'
          ],
          fileSystemChanges: [
            'Créé: C:\\Windows\\Temp\\tmp8A32.tmp',
            'Modifié: C:\\Windows\\System32\\drivers\\etc\\hosts',
            'Accédé: C:\\Users\\Admin\\Documents\\*.*',
            file.malwareType === 'Ransomware' ? 'Créé: RANSOMWARE_NOTE.txt dans plusieurs dossiers' : ''
          ].filter(Boolean),
          registryChanges: [
            'Ajouté: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\UpdateAgent',
            'Modifié: HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
            'Accédé: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'
          ]
        };
        
        setSandboxData(sandboxResult);
      } else {
        // Generate sandbox data for safe file
        const sandboxResult: SandboxEnvironment = {
          runningProcesses: [
            `${file.name} (PID: 4256)`,
            'svchost.exe (PID: 1892)'
          ],
          networkConnections: file.type === 'Exécutable' ? [
            'TCP 192.168.1.5:49322 -> update-server.microsoft.com:443 (ESTABLISHED)',
            'DNS query for cdn.windows.com'
          ] : [],
          fileSystemChanges: [
            file.type === 'Exécutable' ? 'Créé: C:\\Program Files\\Calculator\\cache.dat' : '',
            file.type === 'Script Batch' ? 'Accédé: C:\\Windows\\System32\\cmd.exe' : ''
          ].filter(Boolean),
          registryChanges: file.type === 'Exécutable' ? [
            'Accédé: HKEY_CURRENT_USER\\Software\\Microsoft\\Calc',
            'Accédé: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'
          ] : []
        };
        
        setSandboxData(sandboxResult);
      }
      
      setIsAnalyzing(false);
    }, 2500);
  };

  // Run antivirus scan on all files
  const runFullScan = () => {
    setIsAnalyzing(true);
    setScanProgress(0);
    
    // Simulate progressive scan
    const totalFiles = files.length;
    let currentFile = 0;
    let detectedThreats = 0;
    let falsePositives = 0;
    let missed = 0;
    
    const scanInterval = setInterval(() => {
      if (currentFile >= totalFiles) {
        clearInterval(scanInterval);
        setIsAnalyzing(false);
        
        // Calculate final results
        setScanResults({
          filesScanned: totalFiles,
          threatsDetected: detectedThreats,
          falsePositives: falsePositives, 
          missedThreats: missed,
          scanTime: Math.floor(Math.random() * 20) + 10 // Random scan time between 10-30 seconds
        });
        
        return;
      }
      
      currentFile++;
      setScanProgress(Math.floor((currentFile / totalFiles) * 100));
      
      // Process current file
      const file = files[currentFile - 1];
      const isDetected = analyzeFile(file);
      
      // Update detection stats
      if (file.isMalicious && isDetected) {
        detectedThreats++;
      } else if (!file.isMalicious && isDetected) {
        falsePositives++;
      } else if (file.isMalicious && !isDetected) {
        missed++;
      }
      
      // Update file with detection result
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[currentFile - 1] = {
          ...file,
          isDetected: isDetected,
          detectionMethod: isDetected ? getDetectionMethod(file) : undefined
        };
        return updatedFiles;
      });
      
    }, 800);
  };

  // Check if a file would be detected based on current rules
  const analyzeFile = (file: File): boolean => {
    // Check if there are any enabled rules
    const enabledRules = rules.filter(rule => rule.enabled);
    if (enabledRules.length === 0) return false;
    
    // Check file against signature rules
    const signatureRules = enabledRules.filter(rule => rule.type === 'signature');
    for (const rule of signatureRules) {
      if (rule.condition.includes('RANSOM') && 
          file.content.toUpperCase().includes('RANSOM')) {
        return true;
      }
      if (rule.condition.includes('TROJAN') && 
          file.content.toUpperCase().includes('TROJAN')) {
        return true;
      }
      if (rule.condition.includes('CRYPT') && 
          file.content.toUpperCase().includes('CRYPT')) {
        return true;
      }
    }
    
    // Check file against static analysis rules
    const staticRules = enabledRules.filter(rule => rule.type === 'static');
    for (const rule of staticRules) {
      if (rule.condition.includes('document.write') && 
          file.content.includes('document.write')) {
        return true;
      }
      if (rule.condition.includes('eval(') && 
          file.content.includes('eval(')) {
        return true;
      }
    }
    
    // Check file against behavioral rules if behavioral analysis is enabled
    if (settings.enableBehavioralAnalysis && file.behavior) {
      const behaviorRules = enabledRules.filter(rule => rule.type === 'behavior');
      for (const rule of behaviorRules) {
        if (rule.condition.includes('chiffrer') && 
            file.behavior.some(b => b.includes('chiffrement') || b.includes('encrypted'))) {
          return true;
        }
      }
    }
    
    // Check for heuristic detections if enabled
    if (settings.enableHeuristics) {
      // Suspicious double extension
      if (file.name.endsWith('.jpg.exe')) {
        return true;
      }
      
      // Suspicious processes or behaviors
      if (file.behavior && file.behavior.some(b => 
        b.includes('caché') || 
        b.includes('injecte') || 
        b.includes('100%')
      )) {
        return true;
      }
    }
    
    // Apply detection threshold (lower = more aggressive detection)
    // This would be a more complex algorithm in a real antivirus
    const isMaliciousThreshold = settings.aggressiveness === 'high' ? 50 :
                              settings.aggressiveness === 'medium' ? 70 : 90;
    
    // For false-positive protection
    if (settings.falsePositiveProtection && !file.isMalicious) {
      return Math.random() * 100 < 15; // 15% chance of false positive
    }
    
    return false;
  };
  
  // Get detection method for a file
  const getDetectionMethod = (file: File): string => {
    if (file.content.toUpperCase().includes('TROJAN') || 
        file.content.toUpperCase().includes('RANSOM')) {
      return 'Signature';
    }
    
    if (file.content.includes('eval(') || file.content.includes('document.write')) {
      return 'Analyse statique';
    }
    
    if (file.behavior && settings.enableBehavioralAnalysis) {
      return 'Analyse comportementale';
    }
    
    if (file.name.endsWith('.jpg.exe') && settings.enableHeuristics) {
      return 'Heuristique';
    }
    
    return 'Combinaison de méthodes';
  };

  // Handle adding a new rule
  const handleAddRule = () => {
    if (!newRule.name || !newRule.condition) return;
    
    const rule: Rule = {
      id: `rule-${rules.length + 1}`,
      type: (newRule.type as 'signature' | 'static' | 'behavior' | 'sandbox' | 'heuristic'),
      name: newRule.name,
      condition: newRule.condition,
      action: newRule.action || 'Bloquer et mettre en quarantaine',
      enabled: true
    };
    
    setRules([...rules, rule]);
    
    // Reset form
    setNewRule({
      type: 'signature',
      name: '',
      condition: '',
      action: 'Bloquer et mettre en quarantaine',
      enabled: true
    });
    
    setIsAddingRule(false);
  };

  // Toggle rule enabled state
  const toggleRuleEnabled = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? {...rule, enabled: !rule.enabled} : rule
    ));
  };

  // Delete a rule
  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Set sandbox example text based on rule type
  const getSandboxExampleText = () => {
    switch (newRule.type) {
      case 'signature':
        return 'ex: La signature contient "TROJAN" ou "RANSOM"';
      case 'static':
        return 'ex: Le fichier contient "eval(" et "document.write"';
      case 'behavior':
        return 'ex: Le processus tente de chiffrer plusieurs fichiers';
      case 'sandbox':
        return 'ex: Le programme établit une connexion vers un serveur C&C connu';
      case 'heuristic':
        return 'ex: Le programme présente 3+ indicateurs de comportement suspect';
      default:
        return 'Définissez la condition de détection';
    }
  };

  // Get color for rule type
  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'signature':
        return 'bg-blue-900/40 text-blue-400';
      case 'static':
        return 'bg-purple-900/40 text-purple-400';
      case 'behavior':
        return 'bg-amber-900/40 text-amber-400';
      case 'sandbox':
        return 'bg-green-900/40 text-green-400';
      case 'heuristic':
        return 'bg-indigo-900/40 text-indigo-400';
      default:
        return 'bg-gray-900/40 text-gray-400';
    }
  };

  // Get icon for rule type
  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'signature':
        return <Shield className="h-4 w-4 mr-2" />;
      case 'static':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'behavior':
        return <ZapIcon className="h-4 w-4 mr-2" />;
      case 'sandbox':
        return <MonitorIcon className="h-4 w-4 mr-2" />;
      case 'heuristic':
        return <DatabaseIcon className="h-4 w-4 mr-2" />;
      default:
        return <Shield className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <HomeLayout>
      <PageTitle title="CodeShield - Laboratoire d'expérimentation" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto p-4 relative z-10">
          {/* En-tête */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start">
            <div>
              <Link href="/cyber/arcade/code-shield">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 p-0 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à CodeShield
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                <Code className="mr-2 h-8 w-8 text-blue-400" />
                Laboratoire d'expérimentation
              </h1>
              <p className="text-blue-200 max-w-3xl">
                Créez et testez votre propre moteur antivirus avec des configurations avancées.
                Expérimentez avec différentes méthodes de détection pour contrer diverses menaces.
              </p>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-900/70 border border-blue-500/30 rounded-lg w-full p-1 mb-4">
                  <TabsTrigger 
                    value="rules" 
                    className="data-[state=active]:bg-blue-900/40 data-[state=active]:text-white rounded-md"
                  >
                    Règles de détection
                  </TabsTrigger>
                  <TabsTrigger 
                    value="files" 
                    className="data-[state=active]:bg-blue-900/40 data-[state=active]:text-white rounded-md"
                  >
                    Fichiers à analyser
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-blue-900/40 data-[state=active]:text-white rounded-md"
                  >
                    Paramètres
                  </TabsTrigger>
                  <TabsTrigger 
                    value="results" 
                    className="data-[state=active]:bg-blue-900/40 data-[state=active]:text-white rounded-md"
                  >
                    Résultats
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  {/* Onglet Règles */}
                  <TabsContent value="rules" className="m-0">
                    <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Règles de détection</CardTitle>
                        <CardDescription>
                          Créez et gérez les règles que votre antivirus utilisera pour identifier les menaces
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isAddingRule ? (
                          <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg mb-6">
                            <h3 className="text-white text-lg mb-4">Ajouter une nouvelle règle</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm text-gray-400 block mb-1">Type de règle</label>
                                <Select 
                                  value={newRule.type} 
                                  onValueChange={(value: 'signature' | 'static' | 'behavior' | 'sandbox' | 'heuristic') => setNewRule({...newRule, type: value})}
                                >
                                  <SelectTrigger className="w-full bg-slate-800 border-gray-700">
                                    <SelectValue placeholder="Type de règle" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-gray-700">
                                    <SelectItem value="signature">
                                      <div className="flex items-center">
                                        <Shield className="h-4 w-4 mr-2 text-blue-400" />
                                        <span>Signature</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="static">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-purple-400" />
                                        <span>Analyse statique</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="behavior">
                                      <div className="flex items-center">
                                        <ZapIcon className="h-4 w-4 mr-2 text-amber-400" />
                                        <span>Comportement</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="sandbox">
                                      <div className="flex items-center">
                                        <MonitorIcon className="h-4 w-4 mr-2 text-green-400" />
                                        <span>Sandbox</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="heuristic">
                                      <div className="flex items-center">
                                        <DatabaseIcon className="h-4 w-4 mr-2 text-indigo-400" />
                                        <span>Heuristique</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="text-sm text-gray-400 block mb-1">Nom de la règle</label>
                                <Input
                                  value={newRule.name}
                                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                                  placeholder="ex: Détection de ransomware"
                                  className="bg-slate-800 border-gray-700"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="text-sm text-gray-400 block mb-1">Condition de détection</label>
                              <Textarea
                                value={newRule.condition}
                                onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                                placeholder={getSandboxExampleText()}
                                className="bg-slate-800 border-gray-700 h-20"
                              />
                            </div>
                            
                            <div className="mb-6">
                              <label className="text-sm text-gray-400 block mb-1">Action à prendre</label>
                              <Select 
                                value={newRule.action} 
                                onValueChange={(value) => setNewRule({...newRule, action: value})}
                              >
                                <SelectTrigger className="w-full bg-slate-800 border-gray-700">
                                  <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-gray-700">
                                  <SelectItem value="Bloquer et mettre en quarantaine">Bloquer et mettre en quarantaine</SelectItem>
                                  <SelectItem value="Analyser dans le sandbox">Analyser dans le sandbox</SelectItem>
                                  <SelectItem value="Bloquer l'accès au système de fichiers">Bloquer l'accès au système de fichiers</SelectItem>
                                  <SelectItem value="Avertir l'utilisateur et surveiller">Avertir l'utilisateur et surveiller</SelectItem>
                                  <SelectItem value="Supprimer immédiatement">Supprimer immédiatement</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={handleAddRule}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={!newRule.name || !newRule.condition}
                              >
                                Ajouter
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-gray-700"
                                onClick={() => setIsAddingRule(false)}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setIsAddingRule(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white mb-6"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter une règle
                          </Button>
                        )}
                        
                        {rules.length === 0 ? (
                          <div className="bg-blue-900/10 text-center py-12 rounded-lg border border-blue-500/20">
                            <HelpCircle className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-white text-lg mb-2">Aucune règle définie</h3>
                            <p className="text-blue-200 max-w-md mx-auto">
                              Ajoutez des règles pour que votre antivirus puisse détecter les menaces.
                              Chaque règle définit un critère de détection et une action à prendre.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {rules.map((rule) => (
                              <div 
                                key={rule.id} 
                                className={`border ${rule.enabled ? 'border-blue-500/30' : 'border-gray-700 opacity-60'} rounded-lg bg-slate-800/50 overflow-hidden`}
                              >
                                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                                  <div className="flex items-center">
                                    <span className={`${getRuleTypeColor(rule.type)} px-2 py-1 rounded-md text-xs font-medium flex items-center mr-3`}>
                                      {getRuleTypeIcon(rule.type)}
                                      {rule.type === 'signature' ? 'Signature' : 
                                        rule.type === 'static' ? 'Statique' : 
                                        rule.type === 'behavior' ? 'Comportement' : 
                                        rule.type === 'sandbox' ? 'Sandbox' : 'Heuristique'}
                                    </span>
                                    <h3 className="text-white font-medium">{rule.name}</h3>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      checked={rule.enabled} 
                                      onCheckedChange={() => toggleRuleEnabled(rule.id)}
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => deleteRule(rule.id)}
                                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="text-sm text-gray-300 mb-2">
                                    <strong>Condition:</strong> {rule.condition}
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    <strong>Action:</strong> {rule.action}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Onglet Fichiers */}
                  <TabsContent value="files" className="m-0">
                    <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Fichiers à analyser</CardTitle>
                        <CardDescription>
                          Examinez et analysez différents fichiers pour tester votre antivirus
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {files.length === 0 ? (
                          <div className="bg-blue-900/10 text-center py-12 rounded-lg border border-blue-500/20">
                            <FolderIcon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-white text-lg mb-2">Aucun fichier à analyser</h3>
                            <p className="text-blue-200 max-w-md mx-auto mb-4">
                              Générez un ensemble de fichiers test pour évaluer les performances de votre antivirus.
                              Ces fichiers incluront à la fois des fichiers sains et des malwares simulés.
                            </p>
                            <Button 
                              onClick={generateFiles}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isGeneratingFiles}
                            >
                              {isGeneratingFiles ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Génération en cours...
                                </>
                              ) : (
                                <>
                                  <FilePlus className="mr-2 h-4 w-4" />
                                  Générer des fichiers test
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedFile ? (
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <Button
                                    variant="ghost"
                                    className="text-blue-300 hover:text-blue-100 p-0"
                                    onClick={() => setSelectedFile(null)}
                                  >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                                  </Button>
                                  {selectedFile.isMalicious && (
                                    <div className="px-3 py-1 bg-red-900/20 border border-red-500/30 text-red-400 rounded-full text-sm">
                                      Fichier malveillant: {selectedFile.malwareType}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg overflow-hidden mb-4">
                                  <div className="flex items-center justify-between p-3 border-b border-gray-700">
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                      <h3 className="text-white font-medium">{selectedFile.name}</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                        {selectedFile.type}
                                      </span>
                                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                        {selectedFile.size}
                                      </span>
                                      {selectedFile.isDetected !== undefined && (
                                        <span className={`text-xs ${selectedFile.isMalicious === selectedFile.isDetected ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'} px-2 py-1 rounded`}>
                                          {selectedFile.isMalicious === selectedFile.isDetected ? 
                                            (selectedFile.isMalicious ? 'Correctement détecté' : 'Correctement ignoré') : 
                                            (selectedFile.isMalicious ? 'Manqué' : 'Faux positif')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Tabs defaultValue="content" value={selectedFileTab} onValueChange={setSelectedFileTab}>
                                    <div className="border-b border-gray-700">
                                      <TabsList className="bg-transparent border-b border-gray-700 rounded-none w-full justify-start h-auto p-0">
                                        <TabsTrigger
                                          value="content"
                                          className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-2 px-4 rounded-none text-gray-400"
                                        >
                                          Contenu
                                        </TabsTrigger>
                                        {selectedFile.behavior && (
                                          <TabsTrigger
                                            value="behavior"
                                            className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-2 px-4 rounded-none text-gray-400"
                                          >
                                            Comportement
                                          </TabsTrigger>
                                        )}
                                        <TabsTrigger
                                          value="sandbox"
                                          className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-2 px-4 rounded-none text-gray-400"
                                        >
                                          Sandbox
                                        </TabsTrigger>
                                      </TabsList>
                                    </div>
                                    
                                    <TabsContent value="content" className="p-3 my-0">
                                      <pre className="bg-black/30 p-3 rounded text-sm text-gray-300 overflow-x-auto max-h-60">
                                        {selectedFile.content}
                                      </pre>
                                    </TabsContent>
                                    
                                    <TabsContent value="behavior" className="p-3 my-0">
                                      {selectedFile.behavior ? (
                                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                                          <h4 className="text-white text-sm font-medium mb-2">Comportements observés:</h4>
                                          <ul className="space-y-2">
                                            {selectedFile.behavior.map((behavior, index) => (
                                              <li key={index} className="flex items-start text-sm text-gray-300">
                                                <div className="bg-blue-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-blue-200 mt-0.5">{index + 1}</div>
                                                {behavior}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : (
                                        <div className="text-center py-6 text-gray-400">
                                          Aucun comportement spécifique détecté pour ce fichier
                                        </div>
                                      )}
                                    </TabsContent>
                                    
                                    <TabsContent value="sandbox" className="p-3 my-0">
                                      {showSandbox ? (
                                        <div className="space-y-4">
                                          {isAnalyzing ? (
                                            <div className="text-center py-8">
                                              <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-spin" />
                                              <p className="text-blue-200">Exécution du fichier dans l'environnement sandbox...</p>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                                  <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                                    <MonitorIcon className="h-4 w-4 mr-2 text-blue-400" />
                                                    Processus en cours d'exécution
                                                  </h4>
                                                  <ul className="space-y-1 text-sm text-gray-300">
                                                    {sandboxData.runningProcesses.map((process, index) => (
                                                      <li key={index} className="border-b border-gray-700/50 pb-1 last:border-0 last:pb-0">
                                                        {process}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                                
                                                <div className="bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                                  <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                                    <NetworkIcon className="h-4 w-4 mr-2 text-blue-400" />
                                                    Connexions réseau
                                                  </h4>
                                                  <ul className="space-y-1 text-sm text-gray-300">
                                                    {sandboxData.networkConnections.length > 0 ? (
                                                      sandboxData.networkConnections.map((connection, index) => (
                                                        <li key={index} className="border-b border-gray-700/50 pb-1 last:border-0 last:pb-0">
                                                          {connection}
                                                        </li>
                                                      ))
                                                    ) : (
                                                      <li className="text-gray-500">Aucune connexion réseau détectée</li>
                                                    )}
                                                  </ul>
                                                </div>
                                              </div>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                                  <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                                    <FolderIcon className="h-4 w-4 mr-2 text-blue-400" />
                                                    Modifications du système de fichiers
                                                  </h4>
                                                  <ul className="space-y-1 text-sm text-gray-300">
                                                    {sandboxData.fileSystemChanges.length > 0 ? (
                                                      sandboxData.fileSystemChanges.map((change, index) => (
                                                        <li key={index} className="border-b border-gray-700/50 pb-1 last:border-0 last:pb-0">
                                                          {change}
                                                        </li>
                                                      ))
                                                    ) : (
                                                      <li className="text-gray-500">Aucune modification du système de fichiers détectée</li>
                                                    )}
                                                  </ul>
                                                </div>
                                                
                                                <div className="bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                                  <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                                    <DatabaseIcon className="h-4 w-4 mr-2 text-blue-400" />
                                                    Modifications du registre
                                                  </h4>
                                                  <ul className="space-y-1 text-sm text-gray-300">
                                                    {sandboxData.registryChanges.length > 0 ? (
                                                      sandboxData.registryChanges.map((change, index) => (
                                                        <li key={index} className="border-b border-gray-700/50 pb-1 last:border-0 last:pb-0">
                                                          {change}
                                                        </li>
                                                      ))
                                                    ) : (
                                                      <li className="text-gray-500">Aucune modification du registre détectée</li>
                                                    )}
                                                  </ul>
                                                </div>
                                              </div>
                                              
                                              {selectedFile.isMalicious && (
                                                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mt-2">
                                                  <h4 className="text-red-400 font-medium mb-1">Verdict de l'analyse sandbox</h4>
                                                  <p className="text-gray-300 text-sm">
                                                    Ce fichier présente des comportements malveillants caractéristiques d'un {selectedFile.malwareType}.
                                                    L'exécution de ce fichier dans un environnement réel pourrait compromettre la sécurité du système.
                                                  </p>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-6">
                                          <Button 
                                            onClick={() => runSandboxAnalysis(selectedFile)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                          >
                                            <Play className="mr-2 h-4 w-4" />
                                            Exécuter dans le sandbox
                                          </Button>
                                          <p className="text-gray-400 text-sm mt-3">
                                            Le sandbox exécute le fichier dans un environnement isolé et sécurisé
                                            pour observer son comportement sans risque pour votre système.
                                          </p>
                                        </div>
                                      )}
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-white text-lg">Fichiers disponibles pour l'analyse</h3>
                                  
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={generateFiles}
                                      variant="outline"
                                      className="border-gray-700 text-gray-300"
                                      disabled={isGeneratingFiles}
                                    >
                                      {isGeneratingFiles ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4" />
                                      )}
                                    </Button>
                                    
                                    <Button 
                                      onClick={runFullScan}
                                      className={`${isAnalyzing ? 'bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                                      disabled={isAnalyzing || files.length === 0}
                                    >
                                      {isAnalyzing ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                          Analyse en cours...
                                        </>
                                      ) : (
                                        <>
                                          <Play className="mr-2 h-4 w-4" />
                                          Analyser tous les fichiers
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                
                                {isAnalyzing && (
                                  <div className="mb-6">
                                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                                      <span>Analyse en cours...</span>
                                      <span>{scanProgress}%</span>
                                    </div>
                                    <Progress value={scanProgress} className="h-2" />
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-1 gap-3">
                                  {files.map((file) => (
                                    <div 
                                      key={file.id} 
                                      className={`bg-slate-800/50 border cursor-pointer transition-all hover:bg-blue-900/20 ${
                                        file.isDetected !== undefined ? 
                                          (file.isMalicious === file.isDetected ? 'border-green-500/50' : 'border-red-500/50') :
                                          'border-gray-700'
                                      } rounded-lg overflow-hidden`}
                                      onClick={() => setSelectedFile(file)}
                                    >
                                      <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center">
                                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                          <div>
                                            <h3 className="text-white font-medium">{file.name}</h3>
                                            <p className="text-gray-400 text-xs">{file.type} - {file.size}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {file.isDetected !== undefined && (
                                            <>
                                              {file.isDetected ? (
                                                <span className={`text-xs ${file.isMalicious ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'} px-2 py-1 rounded flex items-center`}>
                                                  {file.isMalicious ? 
                                                    <>Détecté ({file.detectionMethod})</> : 
                                                    <>Faux positif</>
                                                  }
                                                </span>
                                              ) : (
                                                <span className={`text-xs ${!file.isMalicious ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'} px-2 py-1 rounded flex items-center`}>
                                                  {!file.isMalicious ? 
                                                    <>Fichier sain</> : 
                                                    <>Menace manquée</>
                                                  }
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Onglet Paramètres */}
                  <TabsContent value="settings" className="m-0">
                    <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Paramètres de l'antivirus</CardTitle>
                        <CardDescription>
                          Configurez les paramètres avancés de votre moteur de détection
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-white font-medium">Seuil de détection</label>
                            <span className="text-gray-400 text-sm">{settings.detectionThreshold}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">Strict</span>
                            <Slider 
                              value={[settings.detectionThreshold]} 
                              onValueChange={(value) => setSettings({...settings, detectionThreshold: value[0]})}
                              max={100}
                              step={5}
                              className="flex-grow mx-2"
                            />
                            <span className="text-gray-400 text-sm">Permissif</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Un seuil plus bas détectera plus de menaces mais risque de générer plus de faux positifs.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-white text-sm font-medium">Analyse heuristique</label>
                                <p className="text-gray-500 text-xs">
                                  Détecte les menaces inconnues basées sur des comportements suspects
                                </p>
                              </div>
                              <Switch 
                                checked={settings.enableHeuristics} 
                                onCheckedChange={(value) => setSettings({...settings, enableHeuristics: value})}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-white text-sm font-medium">Analyse comportementale</label>
                                <p className="text-gray-500 text-xs">
                                  Surveille le comportement des processus en temps réel
                                </p>
                              </div>
                              <Switch 
                                checked={settings.enableBehavioralAnalysis} 
                                onCheckedChange={(value) => setSettings({...settings, enableBehavioralAnalysis: value})}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-white text-sm font-medium">Utiliser le sandbox</label>
                                <p className="text-gray-500 text-xs">
                                  Exécute les fichiers suspects dans un environnement isolé avant de les autoriser
                                </p>
                              </div>
                              <Switch 
                                checked={settings.enableSandbox} 
                                onCheckedChange={(value) => setSettings({...settings, enableSandbox: value})}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-white text-sm font-medium">Protection contre les faux positifs</label>
                                <p className="text-gray-500 text-xs">
                                  Utilise des vérifications supplémentaires pour éviter les erreurs de détection
                                </p>
                              </div>
                              <Switch 
                                checked={settings.falsePositiveProtection} 
                                onCheckedChange={(value) => setSettings({...settings, falsePositiveProtection: value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-white text-sm font-medium mb-3">Niveau d'agressivité</h3>
                            <RadioGroup 
                              value={settings.aggressiveness}
                              onValueChange={(value) => setSettings({...settings, aggressiveness: value as 'low' | 'medium' | 'high'})}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2 bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                <RadioGroupItem value="low" id="r1" />
                                <Label htmlFor="r1" className="text-white font-medium">Faible</Label>
                                <p className="text-gray-400 text-sm ml-2">
                                  Minimise les faux positifs, idéal pour une utilisation quotidienne
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                <RadioGroupItem value="medium" id="r2" />
                                <Label htmlFor="r2" className="text-white font-medium">Moyen</Label>
                                <p className="text-gray-400 text-sm ml-2">
                                  Équilibre entre détection et faux positifs
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 bg-slate-800/70 border border-gray-700 rounded-lg p-3">
                                <RadioGroupItem value="high" id="r3" />
                                <Label htmlFor="r3" className="text-white font-medium">Élevé</Label>
                                <p className="text-gray-400 text-sm ml-2">
                                  Détection maximale, recommandé pour les environnements à haut risque
                                </p>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Onglet Résultats */}
                  <TabsContent value="results" className="m-0">
                    <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Résultats d'analyse</CardTitle>
                        <CardDescription>
                          Performances et statistiques de votre antivirus
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {scanResults.filesScanned === 0 ? (
                          <div className="bg-blue-900/10 text-center py-12 rounded-lg border border-blue-500/20">
                            <DatabaseIcon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-white text-lg mb-2">Aucun résultat disponible</h3>
                            <p className="text-blue-200 max-w-md mx-auto mb-4">
                              Lancez une analyse sur les fichiers disponibles pour voir les résultats
                              et les performances de votre antivirus.
                            </p>
                            <Button 
                              onClick={() => setActiveTab("files")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Aller à l'onglet Fichiers
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                                <div className="text-3xl font-bold text-white mb-1">{scanResults.filesScanned}</div>
                                <div className="text-blue-300 text-sm">Fichiers analysés</div>
                              </div>
                              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
                                <div className="text-3xl font-bold text-white mb-1">{scanResults.threatsDetected}</div>
                                <div className="text-green-400 text-sm">Menaces détectées</div>
                              </div>
                              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                                <div className="text-3xl font-bold text-white mb-1">{scanResults.falsePositives}</div>
                                <div className="text-red-400 text-sm">Faux positifs</div>
                              </div>
                              <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
                                <div className="text-3xl font-bold text-white mb-1">{scanResults.missedThreats}</div>
                                <div className="text-orange-400 text-sm">Menaces manquées</div>
                              </div>
                            </div>
                            
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
                              <h3 className="text-white font-medium mb-3">Performance de détection</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">Taux de détection</span>
                                    <span className="text-blue-300">
                                      {scanResults.threatsDetected > 0 ? 
                                        Math.round((scanResults.threatsDetected / (scanResults.threatsDetected + scanResults.missedThreats)) * 100) : 0}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={scanResults.threatsDetected > 0 ? 
                                      (scanResults.threatsDetected / (scanResults.threatsDetected + scanResults.missedThreats)) * 100 : 0} 
                                    className="h-2"
                                  />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">Précision (évitement des faux positifs)</span>
                                    <span className="text-blue-300">
                                      {Math.round(((scanResults.filesScanned - scanResults.threatsDetected - scanResults.falsePositives) / 
                                        (scanResults.filesScanned - (scanResults.threatsDetected + scanResults.missedThreats))) * 100)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={((scanResults.filesScanned - scanResults.threatsDetected - scanResults.falsePositives) / 
                                      (scanResults.filesScanned - (scanResults.threatsDetected + scanResults.missedThreats))) * 100} 
                                    className="h-2"
                                  />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">Score global</span>
                                    <span className="text-blue-300">
                                      {Math.round((
                                        // Taux de détection (70% du score)
                                        ((scanResults.threatsDetected / (scanResults.threatsDetected + scanResults.missedThreats)) * 0.7) +
                                        // Précision (30% du score)
                                        (((scanResults.filesScanned - scanResults.threatsDetected - scanResults.falsePositives) / 
                                        (scanResults.filesScanned - (scanResults.threatsDetected + scanResults.missedThreats))) * 0.3)
                                      ) * 100)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(
                                      ((scanResults.threatsDetected / (scanResults.threatsDetected + scanResults.missedThreats)) * 0.7) +
                                      (((scanResults.filesScanned - scanResults.threatsDetected - scanResults.falsePositives) / 
                                      (scanResults.filesScanned - (scanResults.threatsDetected + scanResults.missedThreats))) * 0.3)
                                    ) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
                                <h3 className="text-white font-medium mb-3">Détails de l'analyse</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Temps d'analyse</span>
                                    <span className="text-white">{scanResults.scanTime} secondes</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Vitesse moyenne</span>
                                    <span className="text-white">{Math.round(scanResults.filesScanned / scanResults.scanTime * 10) / 10} fichiers/s</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Méthodes de détection utilisées</span>
                                    <span className="text-white">{settings.enableHeuristics && settings.enableBehavioralAnalysis && settings.enableSandbox ? '3' : 
                                                          ((settings.enableHeuristics ? 1 : 0) + 
                                                           (settings.enableBehavioralAnalysis ? 1 : 0) + 
                                                           (settings.enableSandbox ? 1 : 0))}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Règles actives</span>
                                    <span className="text-white">{rules.filter(r => r.enabled).length}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
                                <h3 className="text-white font-medium mb-3">Recommandations</h3>
                                <div className="space-y-2 text-sm">
                                  {scanResults.missedThreats > 0 && (
                                    <div className="flex items-start">
                                      <div className="bg-orange-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-orange-200 mt-0.5">!</div>
                                      <p className="text-orange-200">
                                        Ajoutez des règles pour détecter les {scanResults.missedThreats} menaces manquées
                                      </p>
                                    </div>
                                  )}
                                  {scanResults.falsePositives > 0 && (
                                    <div className="flex items-start">
                                      <div className="bg-red-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-red-200 mt-0.5">!</div>
                                      <p className="text-red-200">
                                        Affinez vos règles pour réduire les {scanResults.falsePositives} faux positifs
                                      </p>
                                    </div>
                                  )}
                                  {!settings.enableBehavioralAnalysis && (
                                    <div className="flex items-start">
                                      <div className="bg-blue-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-blue-200 mt-0.5">i</div>
                                      <p className="text-blue-200">
                                        Activez l'analyse comportementale pour améliorer la détection des menaces avancées
                                      </p>
                                    </div>
                                  )}
                                  {rules.filter(r => r.enabled).length < 3 && (
                                    <div className="flex items-start">
                                      <div className="bg-blue-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-blue-200 mt-0.5">i</div>
                                      <p className="text-blue-200">
                                        Créez plus de règles pour améliorer la couverture de détection
                                      </p>
                                    </div>
                                  )}
                                  {scanResults.missedThreats === 0 && scanResults.falsePositives === 0 && (
                                    <div className="flex items-start">
                                      <div className="bg-green-900/40 rounded-full p-1 mr-2 h-6 w-6 flex-shrink-0 flex items-center justify-center text-green-200 mt-0.5">✓</div>
                                      <p className="text-green-200">
                                        Excellente configuration ! Votre antivirus a parfaitement détecté toutes les menaces sans faux positifs.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
            <div>
              {/* Panneau d'informations */}
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Guide du laboratoire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                    <h3 className="font-medium text-white mb-1 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-400" />
                      Règles de détection
                    </h3>
                    <p className="text-sm text-blue-200">
                      Créez vos propres règles pour détecter différents types de malwares.
                      Combinez plusieurs approches pour une protection optimale.
                    </p>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                    <h3 className="font-medium text-white mb-1 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-400" />
                      Fichiers test
                    </h3>
                    <p className="text-sm text-blue-200">
                      Testez votre antivirus sur divers types de fichiers, incluant des 
                      malwares simulés pour évaluer ses performances.
                    </p>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                    <h3 className="font-medium text-white mb-1 flex items-center">
                      <DatabaseIcon className="h-4 w-4 mr-2 text-blue-400" />
                      Paramètres avancés
                    </h3>
                    <p className="text-sm text-blue-200">
                      Ajustez la sensibilité de votre antivirus et activez des technologies
                      avancées comme l'analyse comportementale et heuristique.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-400">
                      Rappel: Dans ce laboratoire, vous êtes libre d'expérimenter sans 
                      risque. Les menaces sont simulées et aucun système réel n'est en danger.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}