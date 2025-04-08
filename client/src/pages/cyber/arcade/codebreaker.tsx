import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BrainCircuit, Shield, Lock, Key, ChevronRight, MessageSquare,
  Info, HelpCircle, Lightbulb, RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from '@/lib/queryClient';

interface Cipher {
  id: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  encryptedMessage: string;
  hint: string;
  solution: string;
}

interface AiAdvice {
  hint: string;
  explanation: string;
  nextSteps: string[];
}

export default function CodebreakerPage() {
  const { toast } = useToast();
  const [level, setLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [userSolution, setUserSolution] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAiAdviceDialog, setShowAiAdviceDialog] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AiAdvice | null>(null);
  const [activeTab, setActiveTab] = useState('cipher');
  
  // Exemples de chiffres pour démarrer
  const initialCiphers: Cipher[] = [
    {
      id: 1,
      name: "Code César",
      description: "Déchiffrez ce message codé avec un décalage simple des lettres de l'alphabet.",
      difficulty: 1,
      encryptedMessage: "FHWWH SKUDVH HVW FRGHH HQ FHVDU DYHF XQ GHFDODJH GH WURLV",
      hint: "Le Code César utilise un décalage de lettres. Essayez différents décalages.",
      solution: "CETTE PHRASE EST CODEE EN CESAR AVEC UN DECALAGE DE TROIS"
    },
    {
      id: 2,
      name: "Substitution Simple",
      description: "Dans ce chiffrement, chaque lettre est remplacée par une autre lettre.",
      difficulty: 2,
      encryptedMessage: "VM XSRUUGMQMVK HZG YFDYKRKFKRLV MYK XSZVTM",
      hint: "Cherchez les motifs et les fréquences des lettres. Les lettres les plus communes en français sont E, A, S, I, N, T.",
      solution: "UN CHIFFREMENT PAR SUBSTITUTION EST CHANGE"
    },
    {
      id: 3,
      name: "Code Binaire",
      description: "Convertissez ce message binaire en texte standard.",
      difficulty: 2,
      encryptedMessage: "01000011 01101111 01100100 01100101 00100000 01100010 01101001 01101110 01100001 01101001 01110010 01100101",
      hint: "Chaque groupe de 8 bits représente un caractère ASCII.",
      solution: "CODE BINAIRE"
    },
    {
      id: 4,
      name: "Morse",
      description: "Décodez ce message en code Morse.",
      difficulty: 3,
      encryptedMessage: ".-.. . / -.-. --- -.. . / -- --- .-. ... . / . ... - / ..- -. / ... -.-- ... - . -- . / -.. . / -.-. --- -- -- ..- -. .. -.-. .- - .. --- -. / .-. .- .--. .. -.. .",
      hint: "Utilisez un tableau de correspondance Morse pour traduire chaque symbole.",
      solution: "LE CODE MORSE EST UN SYSTEME DE COMMUNICATION RAPIDE"
    },
    {
      id: 5,
      name: "Vigenère",
      difficulty: 4,
      description: "Ce message a été chiffré avec une clé secrète en utilisant le chiffrement de Vigenère.",
      encryptedMessage: "QPF OJXTYVV DCRF GJ EMPHHCXRT UH WPTIOIGZ",
      hint: "Vous aurez besoin de trouver la clé. Essayez d'analyser les répétitions dans le texte.",
      solution: "CLE SECRETE POUR LE CHIFFREMENT DE VIGENERE"
    }
  ];
  
  const [ciphers, setCiphers] = useState(initialCiphers);
  const [currentCipher, setCurrentCipher] = useState(ciphers[0]);
  
  // Charger le tutoriel uniquement la première fois
  useEffect(() => {
    const tutorialShown = localStorage.getItem('codebreakerTutorialShown');
    if (tutorialShown) {
      setShowTutorial(false);
    }
  }, []);
  
  // Fermer le tutoriel et sauvegarder la préférence
  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('codebreakerTutorialShown', 'true');
  };
  
  // Changement de niveau
  const selectLevel = (newLevel: number) => {
    if (newLevel > 0 && newLevel <= ciphers.length) {
      setLevel(newLevel);
      setCurrentCipher(ciphers[newLevel - 1]);
      setUserSolution('');
      setIsCorrect(null);
      setAiAdvice(null);
    }
  };
  
  // Vérifier la solution proposée
  const checkSolution = () => {
    const normalizedUserSolution = userSolution.trim().toUpperCase();
    const normalizedCorrectSolution = currentCipher.solution.trim().toUpperCase();
    
    const isCorrect = normalizedUserSolution === normalizedCorrectSolution;
    setIsCorrect(isCorrect);
    
    if (isCorrect) {
      toast({
        title: "Bravo!",
        description: "Vous avez correctement déchiffré le message.",
        variant: "default"
      });
      
      // Si c'est le dernier niveau, on revient au premier
      if (level === ciphers.length) {
        toast({
          title: "Félicitations!",
          description: "Vous avez terminé tous les niveaux de Code Breaker!",
          variant: "default"
        });
      } else {
        // Sinon, proposition pour passer au niveau suivant
        setTimeout(() => {
          if (confirm("Voulez-vous passer au niveau suivant?")) {
            selectLevel(level + 1);
          }
        }, 1500);
      }
    } else {
      toast({
        title: "Essayez encore",
        description: "Ce n'est pas la bonne solution. Vous pouvez demander de l'aide à l'IA.",
        variant: "destructive"
      });
    }
  };
  
  // Demander conseil à l'IA
  const askForAiAdvice = async () => {
    setIsLoadingAdvice(true);
    setShowAiAdviceDialog(true);
    
    try {
      const response = await apiRequest('/api/cyber/codebreaker/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          cipherType: currentCipher.name,
          cipherText: currentCipher.encryptedMessage,
          userSolution: userSolution,
          level: currentCipher.difficulty
        })
      });
      
      // Si nous n'avons pas encore d'API implémentée, voici un exemple de réponse
      if (!response) {
        // Exemple de réponse en attendant l'implémentation API
        setAiAdvice({
          hint: `Pour le "${currentCipher.name}", cherchez à identifier les motifs répétitifs et utilisez la fréquence des lettres.`,
          explanation: "Les chiffrements classiques suivent souvent des règles précises. L'analyse des fréquences est une technique efficace pour les déchiffrer.",
          nextSteps: [
            "Identifiez les caractères qui apparaissent le plus souvent",
            "Essayez de remplacer les caractères les plus fréquents par les lettres les plus communes (E, A, S, I, N, T)",
            "Recherchez des mots courts qui pourraient être des articles ou conjonctions"
          ]
        });
      } else {
        setAiAdvice(response);
      }
    } catch (error) {
      console.error("Erreur lors de la demande de conseil:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir des conseils pour le moment. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };
  
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-b from-purple-900 via-slate-900 to-black">
      {/* Tutoriel / Introduction */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="bg-slate-900 text-white border-blue-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-400 flex items-center">
              <BrainCircuit className="mr-2 h-6 w-6" /> Bienvenue à Code Breaker
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Testez vos compétences en cryptographie et déchiffrez des messages codés avec l'aide d'un assistant IA.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 text-slate-300">
            <div className="bg-purple-950/30 p-4 rounded-lg">
              <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                <Key className="mr-2 h-5 w-5" /> Déchiffrez les codes
              </h3>
              <p>Résolvez différents types de chiffrements, du simple code César aux méthodes plus avancées comme Vigenère.</p>
            </div>
            
            <div className="bg-purple-950/30 p-4 rounded-lg">
              <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5" /> Assistant IA
              </h3>
              <p>Obtenez des indices personnalisés et des explications détaillées de notre assistant IA quand vous êtes bloqué.</p>
            </div>
            
            <div className="bg-purple-950/30 p-4 rounded-lg">
              <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Apprentissage progressif
              </h3>
              <p>Commencez par des chiffrements simples et progressez vers des méthodes plus complexes pour améliorer vos compétences.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="default" onClick={closeTutorial} className="bg-purple-600 hover:bg-purple-700">
              Commencer le déchiffrement
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Barre de navigation */}
      <header className="py-4 px-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-sm">
        <Link href="/cyber/arcade" className="text-purple-400 hover:text-purple-300 transition flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à Cyber Arcade
        </Link>
        
        <h1 className="text-xl font-bold text-white">Code Breaker</h1>
        
        <div className="flex items-center gap-2">
          <div className="bg-purple-800 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
            <Lock className="mr-1 h-3 w-3" />
            Niveau {level}/{ciphers.length}
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700 w-full mb-6">
            <TabsTrigger value="cipher" className="data-[state=active]:bg-purple-800">
              <Key className="mr-2 h-4 w-4" />
              Déchiffrement
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-purple-800">
              <Info className="mr-2 h-4 w-4" />
              Guide
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cipher">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Panneau de niveaux - 1 colonne */}
              <Card className="md:col-span-1 bg-slate-800 border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-purple-400" />
                    Niveaux
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ciphers.map((cipher, idx) => (
                    <Button
                      key={cipher.id}
                      variant={level === idx + 1 ? "default" : "outline"}
                      className={`w-full justify-start mb-2 ${level === idx + 1 ? 'bg-purple-700 hover:bg-purple-600' : 'text-slate-400 hover:text-white hover:border-purple-500'}`}
                      onClick={() => selectLevel(idx + 1)}
                    >
                      <span className="mr-2">{idx + 1}.</span>
                      {cipher.name}
                      {Array(cipher.difficulty).fill(0).map((_, i) => (
                        <Lock key={i} className="ml-1 h-3 w-3 text-slate-500" />
                      ))}
                    </Button>
                  ))}
                </CardContent>
              </Card>
              
              {/* Zone de déchiffrement - 4 colonnes */}
              <div className="md:col-span-4 space-y-6">
                <Card className="bg-slate-800 border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BrainCircuit className="mr-2 h-5 w-5 text-purple-400" />
                      {currentCipher.name} (Niveau {level})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                      <p className="text-slate-300">{currentCipher.description}</p>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Message chiffré</h3>
                      <div className="bg-slate-800 p-3 rounded border border-slate-700 font-mono text-purple-300 overflow-x-auto">
                        {currentCipher.encryptedMessage}
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Indice</h3>
                      <p className="text-slate-300">{currentCipher.hint}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={askForAiAdvice}
                        disabled={isLoadingAdvice}
                        className="mt-3 border-purple-600 text-purple-400 hover:bg-purple-950 hover:text-purple-300"
                      >
                        {isLoadingAdvice ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        Demander conseil à l'IA
                      </Button>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-2">Votre solution</h3>
                      <textarea
                        className="w-full h-24 bg-slate-800 border border-slate-700 rounded-md p-3 text-white font-mono focus:border-purple-500 focus:ring focus:ring-purple-500/20"
                        placeholder="Entrez votre solution déchiffrée ici..."
                        value={userSolution}
                        onChange={(e) => setUserSolution(e.target.value)}
                      />
                      
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={checkSolution}
                          disabled={!userSolution.trim()}
                          className="bg-purple-700 hover:bg-purple-600"
                        >
                          Vérifier ma solution
                        </Button>
                      </div>
                      
                      {isCorrect !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}
                        >
                          <h4 className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'Bravo! 🎉' : 'Essayez encore'}
                          </h4>
                          <p className="text-sm text-slate-300">
                            {isCorrect 
                              ? "Vous avez correctement déchiffré le message." 
                              : "Ce n'est pas la bonne solution. Vous pouvez utiliser les indices ou demander l'aide de l'IA."}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help">
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-purple-400" />
                  Guide de cryptographie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Le chiffrement César</h3>
                  <p className="text-slate-300">
                    Le chiffrement César, nommé d'après Jules César, est une technique de chiffrement par substitution où chaque lettre est remplacée par une autre lettre située à un nombre fixe de positions plus loin dans l'alphabet. Par exemple, avec un décalage de 3, A devient D, B devient E, etc.
                  </p>
                  <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-purple-300">
                    Exemple: "HELLO" → "KHOOR" (décalage de 3)
                  </div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Le chiffrement par substitution</h3>
                  <p className="text-slate-300">
                    Dans un chiffrement par substitution, chaque lettre est remplacée par une autre lettre selon une clé prédéfinie. Contrairement au chiffrement César, il n'y a pas nécessairement de relation systématique entre les lettres d'origine et leurs substitutions.
                  </p>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Le code binaire</h3>
                  <p className="text-slate-300">
                    Le code binaire est un système de numération utilisant la base 2. Il n'utilise que les chiffres 0 et 1. Chaque caractère est représenté par une séquence de 8 bits selon la table ASCII.
                  </p>
                  <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-purple-300">
                    Exemple: "A" → "01000001"
                  </div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Le code Morse</h3>
                  <p className="text-slate-300">
                    Le code Morse est un système de codage de caractères qui utilise des séquences de signaux courts et longs (points et tirets) pour représenter des lettres, chiffres et signes de ponctuation.
                  </p>
                  <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-purple-300">
                    Exemple: "SOS" → "... --- ..."
                  </div>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Le chiffrement de Vigenère</h3>
                  <p className="text-slate-300">
                    Le chiffrement de Vigenère est un système de chiffrement par substitution polyalphabétique. Il utilise une série de chiffrements César différents basés sur les lettres d'un mot clé.
                  </p>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Conseils généraux</h3>
                  <ul className="space-y-2 text-slate-300 list-disc pl-6">
                    <li>Analysez la fréquence des lettres pour identifier les modèles.</li>
                    <li>Cherchez des mots courts qui pourraient être des articles ou conjonctions.</li>
                    <li>Pour les codes numériques, essayez différentes bases (binaire, hexadécimal, etc.).</li>
                    <li>Utilisez l'assistant IA pour obtenir des indices personnalisés.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Dialog pour les conseils IA */}
        <Dialog open={showAiAdviceDialog} onOpenChange={setShowAiAdviceDialog}>
          <DialogContent className="bg-slate-900 text-white border-purple-500 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-purple-400 flex items-center">
                <BrainCircuit className="mr-2 h-6 w-6" /> Conseils de l'IA
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Voici quelques indices et explications personnalisés pour vous aider à résoudre ce chiffrement.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              {isLoadingAdvice ? (
                <div className="py-8 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 text-purple-400 animate-spin mb-4" />
                  <p className="text-slate-300">L'IA analyse le chiffrement...</p>
                </div>
              ) : aiAdvice ? (
                <div className="space-y-4 my-4">
                  <div className="bg-purple-950/30 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5" /> Indice clé
                    </h3>
                    <p className="text-slate-300">{aiAdvice.hint}</p>
                  </div>
                  
                  <div className="bg-purple-950/30 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                      <Info className="mr-2 h-5 w-5" /> Explication
                    </h3>
                    <p className="text-slate-300">{aiAdvice.explanation}</p>
                  </div>
                  
                  <div className="bg-purple-950/30 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                      <ChevronRight className="mr-2 h-5 w-5" /> Prochaines étapes
                    </h3>
                    <ul className="space-y-1 text-slate-300">
                      {aiAdvice.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-400 mr-2">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p>Aucun conseil disponible. Veuillez réessayer.</p>
                </div>
              )}
            </ScrollArea>
            
            <DialogFooter>
              <Button 
                variant="default" 
                onClick={() => setShowAiAdviceDialog(false)}
                className="bg-purple-700 hover:bg-purple-600"
              >
                Retour au déchiffrement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}