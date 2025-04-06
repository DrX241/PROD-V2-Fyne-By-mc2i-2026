import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatContext } from '../contexts/ChatContext';
import { Shield, Server, Laptop, Wifi, Database, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RotatingSquare } from 'react-loader-spinner';

type SecurityComponent = {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  icon: JSX.Element;
  description: string;
};

type Level = {
  id: number;
  name: string;
  description: string;
  networkType: string;
  availableComponents: string[];
  requiredComponents: string[];
  threats: string[];
  difficulty: 'Facile' | 'Intermédiaire' | 'Avancé' | 'Expert';
};

export default function CyberArchitect() {
  const { toast } = useToast();
  const { isEconomyMode } = useChatContext();
  const [currentLevel, setCurrentLevel] = useState<Level>(levels[0]);
  const [placedComponents, setPlacedComponents] = useState<SecurityComponent[]>([]);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  // Palette des composants de sécurité disponibles
  const availableComponents = securityComponents.filter(
    comp => currentLevel.availableComponents.includes(comp.id)
  );

  // Fonction pour commencer à déplacer un composant
  const handleDragStart = (componentId: string) => {
    setDraggingComponent(componentId);
  };

  // Fonction pour placer un composant dans le réseau
  const handleNetworkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingComponent || !networkRef.current) return;
    
    const rect = networkRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const component = securityComponents.find(c => c.id === draggingComponent);
    if (!component) return;
    
    const newComponent = {
      ...component,
      position: { x, y },
    };
    
    setPlacedComponents([...placedComponents, newComponent]);
    setDraggingComponent(null);
  };

  // Fonction pour supprimer un composant du réseau
  const handleRemoveComponent = (componentId: string) => {
    setPlacedComponents(placedComponents.filter(comp => comp.id !== componentId));
  };

  // Fonction pour analyser l'architecture
  const handleAnalyzeArchitecture = async () => {
    setIsAnalyzing(true);
    setFeedback(null);
    setScore(null);
    
    try {
      // Préparation des données pour l'analyse
      const architectureData = {
        levelId: currentLevel.id,
        components: placedComponents.map(comp => ({
          type: comp.type,
          id: comp.id,
          position: comp.position
        })),
        requiredComponents: currentLevel.requiredComponents,
        threats: currentLevel.threats,
        networkType: currentLevel.networkType,
        isEconomyMode: isEconomyMode
      };
      
      // Appel à l'API pour analyser l'architecture
      const result = await apiRequest('/api/cyber-architect/analyze', {
        method: 'POST',
        body: JSON.stringify(architectureData)
      });
      
      setFeedback(result.feedback);
      setScore(result.score);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'analyser votre architecture pour le moment. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fonction pour passer au niveau suivant
  const handleNextLevel = () => {
    const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      setCurrentLevel(levels[currentIndex + 1]);
      setPlacedComponents([]);
      setFeedback(null);
      setScore(null);
    }
  };

  // Fonction pour réinitialiser le niveau actuel
  const handleResetLevel = () => {
    setPlacedComponents([]);
    setFeedback(null);
    setScore(null);
  };

  // Fonction pour sélectionner un niveau spécifique
  const handleSelectLevel = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevel(level);
      setPlacedComponents([]);
      setFeedback(null);
      setScore(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-cyber-title text-center mb-8">Cyber Architect</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Gauche - Composants et Instructions */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-cyber-title">Niveau {currentLevel.id}: {currentLevel.name}</CardTitle>
              <CardDescription className="font-cyber-body">{currentLevel.description}</CardDescription>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {currentLevel.networkType}
                </Badge>
                <Badge variant={
                  currentLevel.difficulty === 'Facile' ? 'default' :
                  currentLevel.difficulty === 'Intermédiaire' ? 'secondary' :
                  currentLevel.difficulty === 'Avancé' ? 'destructive' : 'outline'
                }>
                  {currentLevel.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-cyber-accent text-lg mb-2">Menaces potentielles :</h3>
              <ul className="list-disc list-inside mb-4 font-cyber-body">
                {currentLevel.threats.map((threat, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-1 text-amber-500 flex-shrink-0" />
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-4" />
              
              <h3 className="font-cyber-accent text-lg mb-2">Composants disponibles :</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableComponents.map(component => (
                  <div
                    key={component.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-blue-50 transition-colors ${
                      draggingComponent === component.id ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    onClick={() => handleDragStart(component.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {component.icon}
                      <span className="font-cyber-accent text-sm">{component.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-cyber-body">{component.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleAnalyzeArchitecture} 
                  className="w-full"
                  disabled={placedComponents.length === 0 || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <RotatingSquare width="20" height="20" color="#ffffff" />
                      <span className="ml-2">Analyse en cours...</span>
                    </span>
                  ) : "Analyser l'architecture"}
                </Button>
                <Button onClick={handleResetLevel} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-cyber-title">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {levels.map((level) => (
                  <Button
                    key={level.id}
                    variant={level.id === currentLevel.id ? "default" : "outline"}
                    onClick={() => handleSelectLevel(level.id)}
                    className="justify-start"
                    disabled={level.id > 1 && !feedback} // Débloquer après feedback
                  >
                    <span className="mr-2">{level.id}.</span> {level.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Panel Central - Zone de Réseau */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-cyber-title">Architecture Réseau</CardTitle>
              <CardDescription className="font-cyber-body">
                Faites glisser les composants de sécurité vers le réseau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={networkRef}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg h-[600px] relative"
                onClick={handleNetworkClick}
              >
                {/* Composants placés dans le réseau */}
                {placedComponents.map((component, index) => (
                  <div
                    key={`${component.id}-${index}`}
                    className="absolute p-2 bg-white border rounded-md shadow-sm cursor-move"
                    style={{
                      left: `${component.position.x - 25}px`,
                      top: `${component.position.y - 25}px`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      {component.icon}
                      <span className="text-xs font-cyber-accent mt-1">{component.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveComponent(component.id);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Indicateur de guidance pour l'utilisateur */}
                {draggingComponent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-blue-500 text-lg font-cyber-body">
                      Cliquez pour placer le composant
                    </div>
                  </div>
                )}
                
                {/* Message lorsqu'aucun composant n'est placé */}
                {placedComponents.length === 0 && !draggingComponent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-gray-400 text-lg font-cyber-body text-center">
                      <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      Sélectionnez un composant et cliquez ici pour le placer sur le réseau
                    </div>
                  </div>
                )}
              </div>
              
              {/* Affichage des résultats d'analyse */}
              {feedback && (
                <div className="mt-6">
                  <Tabs defaultValue="feedback" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="feedback" className="font-cyber-accent">Analyse</TabsTrigger>
                      <TabsTrigger value="strengths" className="font-cyber-accent">Points forts</TabsTrigger>
                      <TabsTrigger value="vulnerabilities" className="font-cyber-accent">Vulnérabilités</TabsTrigger>
                    </TabsList>
                    <TabsContent value="feedback" className="p-4 border rounded-md mt-2 font-cyber-body">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-cyber-title">Analyse globale</h3>
                        <div className="flex items-center">
                          <span className="mr-2 font-cyber-accent">Score:</span>
                          <Badge 
                            variant={score && score > 70 ? "default" : score && score > 50 ? "secondary" : "destructive"}
                            className="text-lg px-3 py-1"
                          >
                            {score}/100
                          </Badge>
                        </div>
                      </div>
                      <p className="whitespace-pre-line">{feedback.overall}</p>
                      
                      {score && score >= 70 && (
                        <div className="mt-4">
                          <Button onClick={handleNextLevel}>
                            Passer au niveau suivant
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="strengths" className="p-4 border rounded-md mt-2 font-cyber-body">
                      <h3 className="text-xl font-cyber-title mb-4">Points forts</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {feedback.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <Shield className="h-4 w-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="vulnerabilities" className="p-4 border rounded-md mt-2 font-cyber-body">
                      <h3 className="text-xl font-cyber-title mb-4">Vulnérabilités</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {feedback.vulnerabilities.map((vulnerability: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 mt-1 text-red-500 flex-shrink-0" />
                            <span>{vulnerability}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Définition des composants de sécurité disponibles
const securityComponents: SecurityComponent[] = [
  {
    id: 'firewall',
    type: 'security',
    name: 'Pare-feu',
    position: { x: 0, y: 0 },
    icon: <Shield className="h-6 w-6 text-red-500" />,
    description: 'Protège le réseau contre les accès non autorisés',
  },
  {
    id: 'ids',
    type: 'security',
    name: 'Système de détection d\'intrusion',
    position: { x: 0, y: 0 },
    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    description: 'Détecte les activités malveillantes sur le réseau',
  },
  {
    id: 'vpn',
    type: 'security',
    name: 'VPN',
    position: { x: 0, y: 0 },
    icon: <Lock className="h-6 w-6 text-green-500" />,
    description: 'Crée un tunnel sécurisé pour les connexions distantes',
  },
  {
    id: 'waf',
    type: 'security',
    name: 'Pare-feu d\'application Web',
    position: { x: 0, y: 0 },
    icon: <Shield className="h-6 w-6 text-purple-500" />,
    description: 'Protège les applications web contre les attaques',
  },
  {
    id: 'antivirus',
    type: 'security',
    name: 'Antivirus',
    position: { x: 0, y: 0 },
    icon: <Shield className="h-6 w-6 text-blue-500" />,
    description: 'Protège contre les logiciels malveillants',
  },
  {
    id: 'router',
    type: 'network',
    name: 'Routeur',
    position: { x: 0, y: 0 },
    icon: <Wifi className="h-6 w-6 text-indigo-500" />,
    description: 'Connecte différents segments de réseau',
  },
  {
    id: 'switch',
    type: 'network',
    name: 'Commutateur',
    position: { x: 0, y: 0 },
    icon: <Wifi className="h-6 w-6 text-cyan-500" />,
    description: 'Connecte les appareils au sein d\'un même réseau',
  },
  {
    id: 'server',
    type: 'device',
    name: 'Serveur',
    position: { x: 0, y: 0 },
    icon: <Server className="h-6 w-6 text-gray-700" />,
    description: 'Héberge des applications et des services',
  },
  {
    id: 'database',
    type: 'device',
    name: 'Base de données',
    position: { x: 0, y: 0 },
    icon: <Database className="h-6 w-6 text-yellow-600" />,
    description: 'Stocke les données de l\'entreprise',
  },
  {
    id: 'workstation',
    type: 'device',
    name: 'Poste de travail',
    position: { x: 0, y: 0 },
    icon: <Laptop className="h-6 w-6 text-blue-600" />,
    description: 'Ordinateur utilisé par les employés',
  },
  {
    id: 'dlp',
    type: 'security',
    name: 'Protection contre la perte de données',
    position: { x: 0, y: 0 },
    icon: <Shield className="h-6 w-6 text-yellow-500" />,
    description: 'Empêche la fuite de données sensibles',
  },
  {
    id: 'encryption',
    type: 'security',
    name: 'Système de chiffrement',
    position: { x: 0, y: 0 },
    icon: <Lock className="h-6 w-6 text-indigo-700" />,
    description: 'Protège les données sensibles par chiffrement',
  },
];

// Définition des niveaux du jeu
const levels: Level[] = [
  {
    id: 1,
    name: 'Bureau simple',
    description: 'Configurez la sécurité d\'un petit bureau avec quelques postes de travail et un serveur local.',
    networkType: 'Réseau local',
    availableComponents: ['firewall', 'antivirus', 'router', 'server', 'workstation', 'switch'],
    requiredComponents: ['firewall', 'antivirus', 'server', 'workstation'],
    threats: ['Malwares', 'Accès non autorisés au réseau', 'Attaques par hameçonnage'],
    difficulty: 'Facile',
  },
  {
    id: 2,
    name: 'Entreprise moyenne',
    description: 'Sécurisez une entreprise moyenne avec des serveurs internes, une base de données et des accès distants.',
    networkType: 'Réseau d\'entreprise',
    availableComponents: ['firewall', 'antivirus', 'router', 'server', 'workstation', 'switch', 'vpn', 'database', 'ids'],
    requiredComponents: ['firewall', 'server', 'database', 'workstation', 'vpn'],
    threats: ['Exfiltration de données', 'Intrusions réseau', 'Attaques par déni de service', 'Hameçonnage ciblé'],
    difficulty: 'Intermédiaire',
  },
  {
    id: 3,
    name: 'Infrastructure Web',
    description: 'Protégez une architecture d\'applications web exposée à Internet contre diverses menaces.',
    networkType: 'Infrastructure Web',
    availableComponents: ['firewall', 'waf', 'router', 'server', 'database', 'switch', 'ids', 'dlp'],
    requiredComponents: ['firewall', 'waf', 'server', 'database'],
    threats: ['Injections SQL', 'Cross-site scripting', 'Attaques par déni de service distribué', 'Vol de données clients'],
    difficulty: 'Avancé',
  },
  {
    id: 4,
    name: 'Organisation multi-sites',
    description: 'Concevez une architecture sécurisée pour une organisation avec plusieurs sites connectés.',
    networkType: 'Réseau étendu (WAN)',
    availableComponents: ['firewall', 'antivirus', 'router', 'server', 'workstation', 'switch', 'vpn', 'database', 'ids', 'encryption', 'waf', 'dlp'],
    requiredComponents: ['firewall', 'router', 'server', 'vpn', 'encryption'],
    threats: ['Espionnage industriel', 'Attaques avancées persistantes', 'Menaces internes', 'Interception de communications'],
    difficulty: 'Expert',
  }
];