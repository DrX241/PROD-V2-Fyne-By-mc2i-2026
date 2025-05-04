import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, AlertCircle, Code, File, 
  Play, ChevronRight, Check, X, Info, PlusCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import GameInterface from '../GameInterface';

// Types
interface Rule {
  id: string;
  type: 'signature';
  condition: string;
  action: string;
}

interface File {
  id: string;
  name: string;
  content: string;
  type: string;
  signature?: string;
  isMalicious: boolean;
  detected?: boolean;
}

interface AnalysisResult {
  score: number;
  maxScore: number;
  detectedMalware: number;
  totalMalware: number;
  falsePositives: number;
  missedThreats: File[];
  wronglyFlagged: File[];
  feedback: string;
}

export default function SignaturesLevel() {
  // État du jeu
  const [files, setFiles] = useState<File[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [conditionType, setConditionType] = useState('contains');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
  const [ruleCounter, setRuleCounter] = useState(1);

  // Charger les fichiers au démarrage
  useEffect(() => {
    loadLevel();
  }, []);

  // Fonction pour charger le niveau
  const loadLevel = () => {
    // Réinitialiser l'état
    setFiles([]);
    setRules([]);
    setResult(null);
    setIsAnalyzing(false);
    setRuleCounter(1);
    
    // Exemples de fichiers pour le niveau 1 (signatures)
    const levelFiles: File[] = [
      {
        id: 'file1',
        name: 'document.pdf',
        type: 'PDF',
        content: 'PDF-1.5\n%¥±ë\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nendobj\n',
        signature: 'clean-pdf-123',
        isMalicious: false
      },
      {
        id: 'file2',
        name: 'setup.exe',
        type: 'Exécutable',
        content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00\n.text\nPE signature was detected\nSignature: #@MAL-RANSOM-2023@#\nImport: kernel32.dll, user32.dll, crypto.dll\nStrings found: encryptFiles, getFileSystem, dropNoteToUser\n',
        signature: '#@MAL-RANSOM-2023@#',
        isMalicious: true
      },
      {
        id: 'file3',
        name: 'photo.jpg',
        type: 'Image',
        content: 'JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00\n[Image data truncated]\nEXIF data: Camera model NIKON D750\nDate taken: 2023:10:15 14:23:45\n',
        signature: 'clean-jpg-456',
        isMalicious: false
      },
      {
        id: 'file4',
        name: 'invoice.docx',
        type: 'Document',
        content: 'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x00\x00\xFF\xFF\n[Content truncated]\nword/document.xml\n<w:document>\n<w:body>\n<w:p>\nINVOICE #2023-456\n</w:p>\n</w:body>\n</w:document>\n',
        signature: 'clean-docx-789',
        isMalicious: false
      },
      {
        id: 'file5',
        name: 'update_flash.exe',
        type: 'Exécutable',
        content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00\n.text\nPE header found\nSignature: TROJAN-WIN32-FAKEUPDATER\nImport: kernel32.dll, advapi32.dll, wininet.dll\nStrings found: connectC2Server, downloadPayload, hideProcess\n',
        signature: 'TROJAN-WIN32-FAKEUPDATER',
        isMalicious: true
      },
      {
        id: 'file6',
        name: 'report.xlsx',
        type: 'Document',
        content: 'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\x00\x00\xFF\xFF\n[Content truncated]\nxl/workbook.xml\n<workbook>\n<sheets>\n<sheet name="Sales Data" />\n</sheets>\n</workbook>\n',
        signature: 'clean-xlsx-012',
        isMalicious: false
      },
      {
        id: 'file7',
        name: 'attachment.js',
        type: 'Script',
        content: 'function initialize() {\n  // JS-INFECT-BITCOIN-MINER\n  var script = document.createElement("script");\n  script.src = "https://malicious-domain.com/miner.js";\n  document.body.appendChild(script);\n  // Hide traces\n  setInterval(function() {\n    useResources();\n  }, 1000);\n}\n',
        signature: 'JS-INFECT-BITCOIN-MINER',
        isMalicious: true
      }
    ];
    
    setFiles(levelFiles);
  };

  // Fonction pour ajouter une règle
  const addRule = () => {
    if (!newCondition.trim()) return;
    
    let condition = '';
    
    switch (conditionType) {
      case 'contains':
        condition = `Le fichier contient "${newCondition}"`;
        break;
      case 'extension':
        condition = `Le fichier a l'extension "${newCondition}"`;
        break;
      case 'signature':
        condition = `La signature du fichier est "${newCondition}"`;
        break;
      default:
        condition = `Le fichier contient "${newCondition}"`;
    }
    
    const newRule: Rule = {
      id: `rule-${ruleCounter}`,
      type: 'signature',
      condition: condition,
      action: 'Bloquer et mettre en quarantaine'
    };
    
    setRules([...rules, newRule]);
    setRuleCounter(ruleCounter + 1);
    setNewCondition('');
    setIsAddingRule(false);
  };

  // Fonction pour lancer l'analyse
  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simuler un temps de traitement
    setTimeout(() => {
      const analyzedFiles = [...files].map(file => {
        // Vérifier si le fichier correspond à une règle
        const isDetected = rules.some(rule => {
          const condition = rule.condition.toLowerCase();
          
          // Vérifier selon le type de condition
          if (condition.includes('contient')) {
            const searchTerm = condition.split('"')[1].toLowerCase();
            return file.content.toLowerCase().includes(searchTerm);
          } else if (condition.includes('extension')) {
            const ext = condition.split('"')[1].toLowerCase();
            return file.name.toLowerCase().endsWith(`.${ext}`);
          } else if (condition.includes('signature')) {
            const signature = condition.split('"')[1];
            return file.signature === signature;
          }
          
          return false;
        });
        
        return {
          ...file,
          detected: isDetected
        };
      });
      
      // Calculer les résultats
      const totalMalware = analyzedFiles.filter(f => f.isMalicious).length;
      const detectedMalware = analyzedFiles.filter(f => f.isMalicious && f.detected).length;
      const falsePositives = analyzedFiles.filter(f => !f.isMalicious && f.detected).length;
      const missedThreats = analyzedFiles.filter(f => f.isMalicious && !f.detected);
      const wronglyFlagged = analyzedFiles.filter(f => !f.isMalicious && f.detected);
      
      // Score: pourcentage des malwares détectés moins les faux positifs (minimum 0)
      const detectionScore = Math.round((detectedMalware / totalMalware) * 100);
      const accuracyPenalty = Math.round((falsePositives / (analyzedFiles.length - totalMalware)) * 50);
      const scoreValue = Math.max(0, detectionScore - accuracyPenalty);
      
      // Générer un feedback personnalisé
      let feedback = '';
      if (detectedMalware === totalMalware && falsePositives === 0) {
        feedback = "Parfait ! Vous avez détecté toutes les menaces sans aucun faux positif. Vous maîtrisez la détection par signature !";
        setNextLevelUnlocked(true);
      } else if (detectedMalware === totalMalware && falsePositives > 0) {
        feedback = "Vous avez détecté toutes les menaces, mais attention aux faux positifs. Essayez d'affiner vos règles pour être plus précis.";
        if (falsePositives <= 1) {
          setNextLevelUnlocked(true);
        }
      } else if (detectedMalware > 0 && detectedMalware < totalMalware) {
        feedback = `Vous avez manqué ${totalMalware - detectedMalware} menace(s). Essayez de créer des règles qui identifient les signatures spécifiques aux malwares.`;
      } else {
        feedback = "Aucune menace détectée. Cherchez des termes spécifiques aux malwares ou des signatures connues dans les fichiers.";
      }
      
      // Définir le résultat final
      setResult({
        score: scoreValue,
        maxScore: 100,
        detectedMalware,
        totalMalware,
        falsePositives,
        missedThreats,
        wronglyFlagged,
        feedback
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  // Fonction pour réinitialiser le niveau
  const resetLevel = () => {
    loadLevel();
  };

  return (
    <HomeLayout>
      <PageTitle title="CodeShield - Niveau 1: Signatures" />
      
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
                <Shield className="mr-2 h-8 w-8 text-blue-400" />
                Niveau 1: Signatures
              </h1>
              <p className="text-blue-200 max-w-3xl">
                Apprenez à reconnaître les menaces les plus simples à l'aide de leur nom ou d'une signature numérique.
                Détectez les fichiers malveillants connus en créant des règles basées sur leurs signatures.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                className="text-blue-300 border-blue-500/50 hover:bg-blue-900/20"
                onClick={() => setShowHelp(true)}
              >
                <Info className="mr-2 h-4 w-4" />
                Aide et conseils
              </Button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Interfaces de jeu */}
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <File className="mr-2 h-5 w-5 text-blue-400" />
                    Fichiers à analyser
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Examinez les fichiers ci-dessous pour identifier les potentiels malwares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div 
                        key={file.id} 
                        className={`bg-slate-800/50 border ${
                          result && file.detected ? 
                            (file.isMalicious ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10') :
                            'border-gray-700'
                        } rounded-lg overflow-hidden`}
                      >
                        <div className="flex items-center justify-between p-3 border-b border-gray-700">
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-white font-medium">{file.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {file.type}
                            </span>
                            {result && file.detected && (
                              <span className={`text-xs ${file.isMalicious ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'} px-2 py-1 rounded flex items-center`}>
                                {file.isMalicious ? 
                                  <><Check className="h-3 w-3 mr-1" /> Menace détectée</> : 
                                  <><X className="h-3 w-3 mr-1" /> Faux positif</>
                                }
                              </span>
                            )}
                            {result && file.isMalicious && !file.detected && (
                              <span className="text-xs bg-orange-800 text-orange-200 px-2 py-1 rounded flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Menace manquée
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3">
                          <pre className="bg-black/30 p-3 rounded text-sm text-gray-300 overflow-x-auto max-h-40">
                            {file.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg mb-6 sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    Antivirus
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configurer les règles de détection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score si disponible */}
                  {result && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Score: {result.score}/100</span>
                        <span>{result.detectedMalware}/{result.totalMalware} menaces</span>
                      </div>
                      <Progress value={result.score} className="h-2" />
                    </div>
                  )}

                  {/* Liste des règles */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Règles actives</h3>
                    {rules.length === 0 ? (
                      <div className="bg-blue-900/20 border border-blue-500/20 text-blue-300 p-3 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Aucune règle configurée. Ajoutez une règle pour détecter les malwares.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rules.map((rule) => (
                          <div key={rule.id} className="bg-blue-900/10 border border-blue-500/20 p-2 rounded-lg">
                            <div className="flex items-center text-xs text-blue-300">
                              <Shield className="h-3 w-3 mr-2 flex-shrink-0" />
                              <div>
                                <p><strong>Si:</strong> {rule.condition}</p>
                                <p><strong>Alors:</strong> {rule.action}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="space-y-2 pt-2">
                    {isAddingRule ? (
                      <div className="space-y-3 bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                        <h4 className="text-sm font-medium text-white">Nouvelle règle</h4>
                        
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Type de condition</label>
                          <Select value={conditionType} onValueChange={setConditionType}>
                            <SelectTrigger className="w-full bg-slate-800 border-gray-700">
                              <SelectValue placeholder="Type de condition" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-gray-700">
                              <SelectItem value="signature">Signature</SelectItem>
                              <SelectItem value="contains">Contenu</SelectItem>
                              <SelectItem value="extension">Extension</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">
                            {conditionType === 'signature' ? 'Signature à détecter' : 
                             conditionType === 'contains' ? 'Texte à détecter' : 'Extension à surveiller'}
                          </label>
                          <Input
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            placeholder={
                              conditionType === 'signature' ? 'ex: TROJAN-WIN32-FAKEUPDATER' : 
                              conditionType === 'contains' ? 'ex: malicious' : 'ex: exe'
                            }
                            className="bg-slate-800 border-gray-700"
                          />
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            onClick={addRule}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!newCondition.trim()}
                          >
                            Ajouter
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="border border-gray-700"
                            onClick={() => {
                              setIsAddingRule(false);
                              setNewCondition('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setIsAddingRule(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une règle
                      </Button>
                    )}
                    
                    <Button
                      onClick={runAnalysis}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={rules.length === 0 || isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Lancer l'analyse
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetLevel}
                      variant="outline"
                      className="w-full border-gray-700 text-gray-400 hover:text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Résultats d'analyse */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-slate-900/70 border-blue-500/30 shadow-lg mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">Résultats de l'analyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                      <div className="text-4xl font-bold text-white mb-2">{result.score}</div>
                      <div className="text-blue-300">Score final</div>
                    </div>
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
                      <div className="text-4xl font-bold text-white mb-2">{result.detectedMalware}/{result.totalMalware}</div>
                      <div className="text-green-400">Menaces détectées</div>
                    </div>
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                      <div className="text-4xl font-bold text-white mb-2">{result.falsePositives}</div>
                      <div className="text-red-400">Faux positifs</div>
                    </div>
                  </div>

                  <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">Feedback de l'IA</h3>
                    <p className="text-blue-200">{result.feedback}</p>
                  </div>
                  
                  {/* Avertissements et conseils */}
                  {result.missedThreats.length > 0 && (
                    <div className="bg-orange-900/10 border border-orange-500/20 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-orange-300 mb-2 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Menaces manquées
                      </h3>
                      <ul className="space-y-2">
                        {result.missedThreats.map(file => (
                          <li key={file.id} className="flex items-center text-sm text-orange-200">
                            <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                            <strong>{file.name}</strong>
                            <span className="ml-2 text-orange-300/70">- Signature: {file.signature}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-orange-200">
                        Conseil: Cherchez les signatures spécifiques de ces fichiers pour créer des règles plus précises.
                      </p>
                    </div>
                  )}
                  
                  {result.wronglyFlagged.length > 0 && (
                    <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-red-300 mb-2 flex items-center">
                        <X className="h-5 w-5 mr-2" />
                        Fichiers légitimes identifiés à tort
                      </h3>
                      <ul className="space-y-2">
                        {result.wronglyFlagged.map(file => (
                          <li key={file.id} className="flex items-center text-sm text-red-200">
                            <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                            <strong>{file.name}</strong>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-red-200">
                        Conseil: Affinez vos règles pour qu'elles soient plus spécifiques aux malwares.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    onClick={resetLevel}
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                  </Button>
                  
                  {nextLevelUnlocked && (
                    <Link href="/cyber/arcade/code-shield/levels/static-analysis">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Continuer
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Dialogue d'aide */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-slate-900 border-blue-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Aide niveau 1: Signatures</DialogTitle>
            <DialogDescription className="text-gray-400">
              Guide pour comprendre et réussir ce niveau
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-white font-medium mb-2">Qu'est-ce qu'une signature ?</h3>
              <p>
                Une signature est une empreinte unique ou un motif caractéristique qui permet d'identifier un malware connu.
                Elle peut être un nom spécifique, une séquence de bytes, ou un ensemble de caractéristiques.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Comment créer des règles efficaces</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Recherchez des mots-clés uniques qui n'apparaissent que dans les malwares (exemple: "TROJAN", "RANSOM", etc.)</li>
                <li>Utilisez les signatures explicites mentionnées dans le contenu des fichiers</li>
                <li>Évitez les règles trop générales qui pourraient détecter des fichiers légitimes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Objectifs du niveau</h3>
              <p>
                Pour réussir ce niveau, vous devez détecter tous les fichiers malveillants tout en minimisant les
                faux positifs (fichiers légitimes incorrectement identifiés comme malveillants).
              </p>
            </div>
            
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h3 className="text-blue-300 font-medium mb-2">Astuce</h3>
              <p>
                Examinez attentivement le contenu de chaque fichier. Les malwares contiennent souvent des termes
                comme "trojan", "virus", ou des signatures spécifiques qui les identifient clairement.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowHelp(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              J'ai compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}