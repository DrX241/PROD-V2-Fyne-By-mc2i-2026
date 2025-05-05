import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Info, ChevronLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import DnDWrapper from './DnDProvider';
import DefenseBoard, { NetworkNode, PlacedComponent } from './DefenseBoard';
import DraggableComponent, { SecurityComponent } from './DraggableComponent';
import TutorialOverlay from './TutorialOverlay';
import { apiRequest } from '@lib/queryClient';

// Types pour les niveaux
interface Level {
  id: string;
  name: string;
  gridSize: number;
  budget: number;
  attackTypes: string[];
  requiredDefenseScore: number;
  serverPositions: Array<{x: number, y: number}>;
  clientPositions: Array<{x: number, y: number}>;
  internetPosition: {x: number, y: number};
  description?: string;
}

// Type pour l'analyse de défense
interface DefenseAnalysis {
  overallScore: number;
  success: boolean;
  feedback: string;
  vulnerabilities: string[];
  strengths: string[];
  improvements: string[];
  tips: string[];
  attackResults: {
    attackType: string;
    success: boolean;
    description: string;
  }[];
}

// Type pour les conseils tactiques
interface TacticalTip {
  title: string;
  tip: string;
  explanation: string;
  example: string;
  securityPrinciple: string;
}

// Liste des composants de sécurité disponibles
const availableSecurityComponents: SecurityComponent[] = [
  {
    id: 'firewall-basic',
    name: 'Pare-feu basique',
    category: 'firewall',
    power: 3,
    cost: 2,
    description: 'Filtre le trafic réseau entrant et sortant selon des règles simples'
  },
  {
    id: 'firewall-advanced',
    name: 'Pare-feu avancé',
    category: 'firewall',
    power: 6,
    cost: 5,
    description: 'Pare-feu de nouvelle génération avec inspection approfondie des paquets'
  },
  {
    id: 'auth-basic',
    name: 'Authentification simple',
    category: 'authentication',
    power: 2,
    cost: 1,
    description: 'Identifiants simples (nom d\'utilisateur/mot de passe)'
  },
  {
    id: 'auth-mfa',
    name: 'Authentification MFA',
    category: 'authentication',
    power: 5,
    cost: 3,
    description: 'Authentification à plusieurs facteurs avec token physique ou application'
  },
  {
    id: 'segment-vlan',
    name: 'Segmentation VLAN',
    category: 'segmentation',
    power: 4,
    cost: 3,
    description: 'Sépare le réseau en segments logiques isolés'
  },
  {
    id: 'segment-dmz',
    name: 'Zone démilitarisée',
    category: 'segmentation',
    power: 7,
    cost: 6,
    description: 'Sous-réseau sécurisé qui expose les services externes tout en protégeant le réseau interne'
  },
  {
    id: 'monitor-ids',
    name: 'Système de détection',
    category: 'monitoring',
    power: 4,
    cost: 4,
    description: 'Détecte les activités suspectes sur le réseau'
  },
  {
    id: 'monitor-siem',
    name: 'SIEM',
    category: 'monitoring',
    power: 8,
    cost: 7,
    description: 'Système de gestion des informations et des événements de sécurité'
  },
];

// Liste des niveaux disponibles
const availableLevels: Level[] = [
  {
    id: 'level-1',
    name: 'Niveau 1: Protection basique',
    gridSize: 8,
    budget: 10,
    attackTypes: ['bruteforce', 'malware'],
    requiredDefenseScore: 15,
    serverPositions: [
      { x: 360, y: 240 }
    ],
    clientPositions: [
      { x: 120, y: 120 }
    ],
    internetPosition: { x: 120, y: 360 },
    description: 'Protégez votre serveur contre des attaques simples avec un budget limité.'
  },
  {
    id: 'level-2',
    name: 'Niveau 2: Défense en profondeur',
    gridSize: 10,
    budget: 15,
    attackTypes: ['bruteforce', 'malware', 'dos'],
    requiredDefenseScore: 25,
    serverPositions: [
      { x: 420, y: 240 },
      { x: 480, y: 300 }
    ],
    clientPositions: [
      { x: 180, y: 120 },
      { x: 240, y: 180 }
    ],
    internetPosition: { x: 120, y: 420 },
    description: 'Mettez en place une stratégie de défense en profondeur pour protéger plusieurs serveurs.'
  },
  {
    id: 'level-3',
    name: 'Niveau 3: Menaces avancées',
    gridSize: 12,
    budget: 25,
    attackTypes: ['bruteforce', 'malware', 'dos', 'lateral-movement', 'exploit'],
    requiredDefenseScore: 40,
    serverPositions: [
      { x: 480, y: 240 },
      { x: 540, y: 300 },
      { x: 480, y: 360 }
    ],
    clientPositions: [
      { x: 180, y: 180 },
      { x: 240, y: 240 },
      { x: 180, y: 300 }
    ],
    internetPosition: { x: 120, y: 480 },
    description: 'Défendez-vous contre des menaces persistantes avancées avec des techniques d\'attaque sophistiquées.'
  }
];

const FirewallTactique: React.FC = () => {
  // États
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [analysis, setAnalysis] = useState<DefenseAnalysis | null>(null);
  const [tacticalTip, setTacticalTip] = useState<TacticalTip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Configuration des nœuds réseau lors du changement de niveau
  useEffect(() => {
    if (selectedLevel) {
      const nodes: NetworkNode[] = [
        // Point d'entrée Internet
        {
          type: 'internet',
          position: selectedLevel.internetPosition
        },
        // Serveurs
        ...selectedLevel.serverPositions.map(pos => ({
          type: 'server' as const,
          position: pos
        })),
        // Clients
        ...selectedLevel.clientPositions.map(pos => ({
          type: 'client' as const,
          position: pos
        }))
      ];
      
      setNetworkNodes(nodes);
      
      // Afficher le tutoriel automatiquement la première fois
      if (!localStorage.getItem('firewall-tactique-tutorial-shown')) {
        setShowTutorial(true);
        localStorage.setItem('firewall-tactique-tutorial-shown', 'true');
      }
    }
  }, [selectedLevel]);

  // Analyse de la stratégie de défense
  const handleAnalyzeDefense = async (placedComponents: PlacedComponent[]) => {
    if (!selectedLevel) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest({
        url: '/api/cyber/arcade/firewall-tactique/analyze',
        method: 'POST',
        data: {
          levelId: selectedLevel.id,
          placedComponents,
          availableComponents: availableSecurityComponents,
          attackTypes: selectedLevel.attackTypes,
          requiredDefenseScore: selectedLevel.requiredDefenseScore
        }
      });
      
      setAnalysis(response);
      
      // Afficher le modal de succès si la défense est réussie
      if (response.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la défense:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Demande de conseil tactique
  const handleRequestTip = async (placedComponents: PlacedComponent[]) => {
    if (!selectedLevel) return;
    
    try {
      const response = await apiRequest({
        url: '/api/cyber/arcade/firewall-tactique/tips',
        method: 'POST',
        data: {
          attackTypes: selectedLevel.attackTypes,
          placedComponents,
          availableComponents: availableSecurityComponents
        }
      });
      
      setTacticalTip(response);
    } catch (error) {
      console.error('Erreur lors de la demande de conseil:', error);
    }
  };

  // Retour à la sélection de niveau
  const handleBackToLevelSelection = () => {
    setSelectedLevel(null);
    setAnalysis(null);
    setTacticalTip(null);
    setShowSuccessModal(false);
  };

  // Rendu des composants d'inventaire disponibles 
  const renderInventory = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {availableSecurityComponents.map(component => (
          <DraggableComponent
            key={component.id}
            component={component}
            isInventory={true}
          />
        ))}
      </div>
    );
  };

  // Rendu de l'écran de sélection de niveau
  const renderLevelSelection = () => {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center">
          <Shield className="mr-2 text-blue-600" size={32} />
          Firewall Tactique
        </h1>
        
        <p className="text-lg text-center mb-8">
          Placez stratégiquement vos défenses pour protéger votre réseau contre les cyber-attaques.
          Combinez différents composants de sécurité pour créer une défense en profondeur efficace.
        </p>
        
        <button
          onClick={() => setShowTutorial(true)}
          className="flex items-center mx-auto mb-8 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Info size={20} className="mr-2" />
          Voir le tutoriel
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableLevels.map(level => (
            <motion.div
              key={level.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{level.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  {level.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">Budget:</span>
                    <span>{level.budget} points</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Taille:</span>
                    <span>{level.gridSize}x{level.gridSize}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Serveurs:</span>
                    <span>{level.serverPositions.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Difficulté:</span>
                    <span>{level.attackTypes.length} types d'attaques</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedLevel(level)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                >
                  Jouer ce niveau
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu du jeu actif
  const renderGame = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToLevelSelection}
            className="flex items-center mr-4 text-blue-600 hover:text-blue-800 transition"
          >
            <ChevronLeft size={20} className="mr-1" />
            Retour
          </button>
          
          <h2 className="text-2xl font-bold flex-grow">{selectedLevel.name}</h2>
          
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center text-purple-600 hover:text-purple-800 transition"
          >
            <Info size={20} className="mr-1" />
            Tutoriel
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Types d'attaques à contrer:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedLevel.attackTypes.map(type => (
              <span
                key={type}
                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <h3 className="text-lg font-semibold mb-4">Plateau de jeu</h3>
            <DefenseBoard
              gridSize={selectedLevel.gridSize}
              networkNodes={networkNodes}
              availableComponents={availableSecurityComponents}
              budget={selectedLevel.budget}
              onAnalyzeDefense={handleAnalyzeDefense}
              onRequestTip={handleRequestTip}
              isAnalyzing={isAnalyzing}
            />
          </div>
          
          <div className="lg:w-1/4">
            <h3 className="text-lg font-semibold mb-4">Inventaire</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              {renderInventory()}
            </div>
            
            {/* Affichage des conseils tactiques */}
            {tacticalTip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 shadow-md"
              >
                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">
                  {tacticalTip.title}
                </h4>
                <p className="text-purple-900 dark:text-purple-200 mb-2 font-medium">
                  {tacticalTip.tip}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {tacticalTip.explanation}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Exemple: </span>
                  {tacticalTip.example}
                </p>
                <p className="text-xs italic text-gray-500 dark:text-gray-500">
                  Principe: {tacticalTip.securityPrinciple}
                </p>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Affichage de l'analyse des défenses */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-6 rounded-lg shadow-lg ${
              analysis.success
                ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500'
                : 'bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500'
            }`}
          >
            <div className="flex items-start">
              {analysis.success ? (
                <CheckCircle2 className="text-green-600 mr-4 flex-shrink-0" size={32} />
              ) : (
                <AlertTriangle className="text-amber-600 mr-4 flex-shrink-0" size={32} />
              )}
              
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${
                  analysis.success ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'
                } mb-2`}>
                  {analysis.success ? 'Défense réussie!' : 'Défense insuffisante'}
                </h3>
                
                <p className="text-gray-800 dark:text-gray-200 mb-4">
                  {analysis.feedback}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-2">Points forts</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg mb-2">Vulnérabilités</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.vulnerabilities.map((vulnerability, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {vulnerability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-bold text-lg mb-2">Résultats par type d'attaque</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.attackResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          result.success
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-green-100 dark:bg-green-900/30'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {result.success ? (
                            <XCircle size={16} className="text-red-600 mr-2" />
                          ) : (
                            <CheckCircle2 size={16} className="text-green-600 mr-2" />
                          )}
                          <span className="font-medium">
                            {result.attackType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {result.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {!analysis.success && (
                  <div className="mt-6">
                    <h4 className="font-bold text-lg mb-2">Suggestions d'amélioration</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Modal de succès
  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
        >
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 size={64} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Niveau réussi!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Félicitations! Votre stratégie de défense a réussi à protéger votre réseau contre les attaques.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleBackToLevelSelection}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Choisir un autre niveau
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Continuer ce niveau
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <DnDWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-6">
        {selectedLevel ? renderGame() : renderLevelSelection()}
        
        {/* Overlay du tutoriel */}
        <TutorialOverlay 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />
        
        {/* Modal de succès */}
        {renderSuccessModal()}
      </div>
    </DnDWrapper>
  );
};

export default FirewallTactique;