import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  MessageSquare,
  Terminal,
  Lock
} from 'lucide-react';
import { useGameContext } from '@/contexts/cyber-challenge/GameContext';
import type { Scenario } from '@/contexts/cyber-challenge/GameContext';

interface ScenarioPhaseProps {
  onComplete: () => void;
}

const ScenarioPhase: React.FC<ScenarioPhaseProps> = ({ onComplete }) => {
  const { 
    selectedRole, 
    selectedMode, 
    difficultyLevel,
    currentScenario,
    setCurrentScenario,
    timeRemaining,
    setTimeRemaining,
    startGame,
    completeObjective,
    endGame,
    score
  } = useGameContext();

  const [activeTab, setActiveTab] = useState<'briefing' | 'communication' | 'analysis' | 'action'>('briefing');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userDecisions, setUserDecisions] = useState<Record<string, string>>({});

  // Données de démonstration pour un scénario
  const demoScenario: Scenario = {
    id: 'ransomware-attack',
    title: 'Attaque par Ransomware',
    description: 'Une attaque de ransomware a été détectée dans l\'infrastructure de l\'entreprise.',
    briefing: 'En tant que ' + (selectedRole === 'rssi' ? 'RSSI' : 
                selectedRole === 'ethical-hacker' ? 'Hacker Éthique' : 
                selectedRole === 'developer' ? 'Développeur Sécurité' : 
                selectedRole === 'sysadmin' ? 'Administrateur Système' : 'Consultant Cybersécurité') + 
            ', vous êtes alerté d\'une possible attaque par ransomware en cours. Les utilisateurs signalent que leurs fichiers deviennent inaccessibles et des demandes de rançon apparaissent sur les écrans. Vous devez évaluer la situation et prendre les mesures appropriées pour contenir l\'attaque et restaurer les systèmes.',
    difficulty: difficultyLevel,
    objectives: [
      'Isoler les systèmes infectés',
      'Identifier le vecteur d\'infection',
      'Évaluer l\'étendue des dommages',
      'Préparer un plan de restauration',
      'Communiquer avec les parties prenantes'
    ],
    backgroundContext: 'L\'entreprise est une société financière de taille moyenne avec environ 500 employés. Elle stocke des données sensibles de clients et est soumise à des réglementations strictes en matière de protection des données.'
  };

  // Initialisation du scénario
  useEffect(() => {
    if (!currentScenario) {
      setCurrentScenario(demoScenario);
      startGame();
      setIsTimerActive(true);
    }
  }, [currentScenario]);

  // Gestion du timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
        setTimeElapsed(prev => prev + 1);
        setProgress(prev => timeElapsed / 600 * 100); // 600 secondes = 10 minutes
      }, 1000);
    } else if (timeRemaining === 0) {
      handleScenarioEnd();
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const handleCompleteObjective = (objective: string) => {
    if (!completedSteps.includes(objective)) {
      completeObjective(objective);
      setCompletedSteps([...completedSteps, objective]);
    }
  };

  const handleDecision = (questionId: string, answer: string) => {
    setUserDecisions({ ...userDecisions, [questionId]: answer });
    
    // Si c'est la dernière décision ou si toutes les décisions sont prises, passer à l'action suivante
    if (Object.keys(userDecisions).length >= 3) {
      handleCompleteObjective('Prendre les décisions critiques');
    }
  };

  const handleScenarioEnd = () => {
    endGame();
    setIsTimerActive(false);
    onComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Structure d'un questionnaire de décision
  const decisions = [
    {
      id: 'isolation',
      question: 'Quelle approche privilégiez-vous pour isoler les systèmes infectés ?',
      options: [
        { id: 'a', text: 'Déconnecter immédiatement tous les systèmes du réseau' },
        { id: 'b', text: 'Isoler uniquement les systèmes présentant des signes d\'infection' },
        { id: 'c', text: 'Mettre en place une segmentation réseau pour contenir l\'infection' }
      ]
    },
    {
      id: 'communication',
      question: 'Comment allez-vous communiquer sur cet incident ?',
      options: [
        { id: 'a', text: 'Informer uniquement la direction et l\'équipe technique' },
        { id: 'b', text: 'Communiquer avec tous les employés et leur fournir des instructions' },
        { id: 'c', text: 'Préparer des communications internes et externes structurées' }
      ]
    },
    {
      id: 'payment',
      question: 'Concernant la demande de rançon, quelle est votre recommandation ?',
      options: [
        { id: 'a', text: 'Payer la rançon pour récupérer rapidement l\'accès aux données' },
        { id: 'b', text: 'Ne jamais payer et restaurer à partir des sauvegardes' },
        { id: 'c', text: 'Évaluer l\'impact financier des deux options avant de décider' }
      ]
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header du scénario avec timer et progression */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{currentScenario?.title}</h2>
            <p className="text-cyan-400 text-sm">
              Mode: {selectedMode === 'classic' ? 'Classique' : 'Tunnel'} | 
              Niveau: {difficultyLevel === 'beginner' ? 'Débutant' : 
                      difficultyLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-white font-mono">{formatTime(timeRemaining)}</span>
            </div>
            
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-white">{score} pts</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <Progress value={progress} className="h-2 bg-gray-700" indicatorClassName="bg-cyan-500" />
        </div>
      </div>
      
      {/* Onglets de navigation */}
      <div className="flex border-b border-gray-700">
        <button 
          className={`px-4 py-3 flex items-center space-x-2 ${activeTab === 'briefing' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('briefing')}
        >
          <FileText className="h-4 w-4" />
          <span>Briefing</span>
        </button>
        
        <button 
          className={`px-4 py-3 flex items-center space-x-2 ${activeTab === 'communication' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('communication')}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Communication</span>
        </button>
        
        <button 
          className={`px-4 py-3 flex items-center space-x-2 ${activeTab === 'analysis' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('analysis')}
        >
          <Terminal className="h-4 w-4" />
          <span>Analyse</span>
        </button>
        
        <button 
          className={`px-4 py-3 flex items-center space-x-2 ${activeTab === 'action' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('action')}
        >
          <Lock className="h-4 w-4" />
          <span>Action</span>
        </button>
      </div>
      
      {/* Contenu principal selon l'onglet actif */}
      <div className="p-6">
        {activeTab === 'briefing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Description de la situation</h3>
              <p className="text-gray-300">{currentScenario?.briefing}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Contexte</h3>
              <p className="text-gray-300">{currentScenario?.backgroundContext}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Objectifs</h3>
              <ul className="space-y-2">
                {currentScenario?.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mt-0.5 mr-2">
                      {completedSteps.includes(objective) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-500" />
                      )}
                    </div>
                    <span className={completedSteps.includes(objective) ? 'text-green-500' : 'text-gray-300'}>
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab('communication')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Passer à la communication
              </Button>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'communication' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Rapports d'incident</h3>
              <div className="space-y-4">
                <div className="border border-gray-700 rounded p-3">
                  <p className="text-gray-300">
                    <span className="text-yellow-500 font-semibold">Département IT :</span> Plusieurs utilisateurs des départements Comptabilité et RH signalent que leurs fichiers sont inaccessibles et qu'un message de demande de rançon est apparu.
                  </p>
                </div>
                
                <div className="border border-gray-700 rounded p-3">
                  <p className="text-gray-300">
                    <span className="text-red-500 font-semibold">Alerte système :</span> Trafic réseau anormal détecté entre plusieurs postes de travail et des serveurs externes non identifiés. Activité de chiffrement massive en cours.
                  </p>
                </div>
                
                <div className="border border-gray-700 rounded p-3">
                  <p className="text-gray-300">
                    <span className="text-blue-500 font-semibold">Direction :</span> Urgence. Le serveur de base de données clients ne répond plus. Impossible d'accéder aux données de transactions. Quelles sont les actions immédiates à prendre?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Réponse de crise</h3>
              <p className="text-gray-300 mb-4">En tant que {selectedRole === 'rssi' ? 'RSSI' : selectedRole === 'ethical-hacker' ? 'Hacker Éthique' : selectedRole === 'developer' ? 'Développeur Sécurité' : selectedRole === 'sysadmin' ? 'Administrateur Système' : 'Consultant Cybersécurité'}, votre réponse initiale est cruciale.</p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gray-700 hover:bg-gray-600 justify-start text-left"
                  onClick={() => handleCompleteObjective('Communiquer avec les parties prenantes')}
                >
                  Informer immédiatement la direction de la situation et des actions en cours
                </Button>
                
                <Button 
                  className="w-full bg-gray-700 hover:bg-gray-600 justify-start text-left"
                  onClick={() => handleCompleteObjective('Isoler les systèmes infectés')}
                >
                  Demander aux équipes IT d'isoler les systèmes affectés du réseau
                </Button>
                
                <Button 
                  className="w-full bg-gray-700 hover:bg-gray-600 justify-start text-left"
                  onClick={() => handleCompleteObjective('Évaluer l\'étendue des dommages')}
                >
                  Lancer un scan de sécurité sur tous les systèmes pour évaluer l'étendue de l'attaque
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab('analysis')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Passer à l'analyse
              </Button>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Analyse des logs</h3>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-300 overflow-x-auto">
                <pre>
{`2023-05-01 08:23:45 WARNING User.login: Multiple failed login attempts from IP 192.168.1.45
2023-05-01 08:25:12 ERROR System.access: Unusual file access pattern detected in /var/data/financial
2023-05-01 08:31:29 CRITICAL Security.alert: Malware signature detected (HASH:a8f5e7d2c3b1) in email attachment
2023-05-01 08:42:18 ERROR Database.connection: Unusual query pattern detected, multiple DELETE operations
2023-05-01 08:45:39 CRITICAL System.encryption: Suspicious encryption activity on multiple user directories
2023-05-01 08:47:02 ALERT Network.traffic: Unusual outbound traffic to IP 185.234.85.12 on port 445`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Identification du vecteur d'infection</h3>
              <p className="text-gray-300 mb-4">D'après l'analyse des logs et des rapports, identifiez le vecteur d'infection le plus probable :</p>
              
              <div className="space-y-3">
                <Button 
                  className={`w-full justify-start text-left ${userDecisions['vector'] === 'email' ? 'bg-cyan-700 hover:bg-cyan-800 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => {
                    handleDecision('vector', 'email');
                    handleCompleteObjective('Identifier le vecteur d\'infection');
                  }}
                >
                  Email de phishing avec pièce jointe malveillante
                </Button>
                
                <Button 
                  className={`w-full justify-start text-left ${userDecisions['vector'] === 'rdp' ? 'bg-cyan-700 hover:bg-cyan-800 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => {
                    handleDecision('vector', 'rdp');
                    handleCompleteObjective('Identifier le vecteur d\'infection');
                  }}
                >
                  Connexion RDP compromise via attaque par force brute
                </Button>
                
                <Button 
                  className={`w-full justify-start text-left ${userDecisions['vector'] === 'usb' ? 'bg-cyan-700 hover:bg-cyan-800 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => {
                    handleDecision('vector', 'usb');
                    handleCompleteObjective('Identifier le vecteur d\'infection');
                  }}
                >
                  Clé USB infectée branchée sur un poste de travail
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab('action')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Passer à l'action
              </Button>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'action' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Plan de réponse à l'incident</h3>
              <p className="text-gray-300 mb-4">Définissez les actions prioritaires à mettre en œuvre :</p>
              
              <div className="space-y-4">
                {decisions.map(decision => (
                  <div key={decision.id} className="space-y-2">
                    <p className="text-white font-medium">{decision.question}</p>
                    <div className="space-y-2">
                      {decision.options.map(option => (
                        <button
                          key={option.id}
                          className={`w-full text-left p-3 rounded-lg ${
                            userDecisions[decision.id] === option.id
                              ? 'bg-cyan-700 hover:bg-cyan-800 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                          onClick={() => handleDecision(decision.id, option.id)}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleScenarioEnd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                disabled={completedSteps.length < 3}
              >
                Terminer le scénario
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScenarioPhase;