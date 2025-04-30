import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, ShieldAlert, Clipboard, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/cyber-challenge/GameContext';
import axios from 'axios';

interface ScenarioPhaseProps {
  onComplete: () => void;
}

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ScenarioPhase({ onComplete }: ScenarioPhaseProps) {
  const { 
    selectedRole, 
    selectedMode, 
    currentStage, 
    maxStages, 
    incrementScore, 
    advanceStage,
    completeGame
  } = useGame();

  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioContext, setScenarioContext] = useState('');
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour générer un ID unique
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Système de décompte pour le mode Tunnel Effect
  useEffect(() => {
    if (selectedMode === 'tunnel-effect' && !feedbackMode) {
      setCountdown(30); // 30 secondes par question
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStage, selectedMode, feedbackMode]);
  
  // Scroll automatique vers le bas du chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // Initialiser le scénario au démarrage ou au changement d'étape
  useEffect(() => {
    if (currentStage > 0) {
      initializeScenario();
    }
  }, [currentStage, selectedRole, selectedMode]);
  
  // Initialisation du scénario
  const initializeScenario = async () => {
    setFeedbackMode(false);
    setFeedbackMessage('');
    
    // Simuler une requête au backend (à implémenter plus tard)
    // Pour le moment, générons un scénario statique
    
    let title = '';
    let context = '';
    
    // Titre basé sur le mode et le rôle
    switch (selectedMode) {
      case 'classic-challenge':
        title = `Défi #${currentStage}: ${getClassicChallengeTitle()}`;
        break;
      case 'tunnel-effect':
        title = `Alerte #${currentStage}: ${getTunnelEventTitle()}`;
        break;
      case 'pca-scenario':
        title = `Jour ${currentStage}: ${getPCAScenarioTitle()}`;
        break;
      case 'hackathon':
        title = `Indice #${currentStage}/10: ${getHackathonTitle()}`;
        break;
    }
    
    // Contexte basé sur le mode et le rôle
    context = generateScenarioContext();
    
    setScenarioTitle(title);
    setScenarioContext(context);
    
    // Ajouter le message initial du système
    setChatMessages([
      {
        id: generateId(),
        role: 'system',
        content: context,
        timestamp: new Date()
      }
    ]);
  };
  
  // Fonctions pour générer des titres aléatoires selon le mode
  const getClassicChallengeTitle = () => {
    const titles = [
      "Alerte de sécurité inattendue",
      "Vulnérabilité critique détectée",
      "Analyse de risque requise",
      "Audit de conformité",
      "Incident en cours"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };
  
  const getTunnelEventTitle = () => {
    const titles = [
      "Décision immédiate requise",
      "Brèche en progression",
      "Escalade de l'incident",
      "Réaction d'urgence",
      "Crise qui s'intensifie"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };
  
  const getPCAScenarioTitle = () => {
    const titles = [
      "Réunion de crise",
      "Communication aux parties prenantes",
      "Allocation des ressources",
      "Évaluation des dommages",
      "Stratégie de remédiation"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };
  
  const getHackathonTitle = () => {
    const titles = [
      "Extraction de données",
      "Analyse des logs système",
      "Messages cryptés",
      "Fragments de code malveillant",
      "Trace numérique"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };
  
  // Génère un contexte de scénario basé sur le mode et le rôle
  const generateScenarioContext = () => {
    let baseContext = '';
    
    switch (selectedMode) {
      case 'classic-challenge':
        baseContext = `En tant que ${getRoleName()}, vous faites face à un défi de cybersécurité qui requiert votre expertise. ${currentStage === 1 ? 'Commençons par un cas simple.' : currentStage > maxStages / 2 ? 'Ce défi est particulièrement complexe.' : 'Voici la situation actuelle.'}\n\n`;
        break;
      case 'tunnel-effect':
        baseContext = `ALERTE CRITIQUE - Temps limité! En tant que ${getRoleName()}, vous avez 30 secondes pour prendre une décision. Chaque choix aura un impact direct sur l'évolution de la crise.\n\n`;
        break;
      case 'pca-scenario':
        baseContext = `Jour ${currentStage} de la crise - En tant que ${getRoleName()}, vous participez à la gestion d'un incident majeur. Différentes parties prenantes attendent vos recommandations.\n\n`;
        break;
      case 'hackathon':
        baseContext = `Enquête en cours - En tant que ${getRoleName()}, vous recherchez des indices cachés dans divers contenus numériques. Ceci est l'indice ${currentStage} sur 10.\n\n`;
        break;
    }
    
    // Ajouter un contexte spécifique en fonction du rôle et du mode
    baseContext += getSpecificContext();
    
    return baseContext;
  };
  
  // Obtenir le nom du rôle sélectionné
  const getRoleName = () => {
    switch (selectedRole) {
      case 'rssi': return 'RSSI';
      case 'ethical-hacker': return 'Hacker Éthique';
      case 'soc-analyst': return 'Analyste SOC';
      case 'secure-developer': return 'Développeur Sécurisé';
      case 'cybersecurity-consultant': return 'Consultant Cybersécurité';
      case 'system-administrator': return 'Administrateur Système';
      case 'cyber-legal': return 'Juriste Cybersécurité';
      case 'financial-director': return 'Directeur Financier';
      default: return 'professionnel de cybersécurité';
    }
  };
  
  // Générer un contexte spécifique selon le rôle et le mode
  const getSpecificContext = () => {
    // Ceci est une démonstration - normalement, nous ferions appel à l'API GPT-4o
    // pour générer un contexte dynamique et pertinent
    
    const contexts = [
      "Une alerte de sécurité a été détectée sur le réseau de l'entreprise. Des activités suspectes provenant de l'adresse IP 192.168.1.45 montrent des tentatives répétées d'accès à des ports sensibles. Les logs indiquent une augmentation de 500% du trafic vers les serveurs de base de données. Comment procéderiez-vous pour analyser et répondre à cette menace potentielle?",
      
      "Suite à la détection d'une vulnérabilité zero-day dans votre framework principal, vous devez évaluer l'impact et proposer une stratégie de mitigation immédiate. L'exploitation pourrait compromettre les données clients. Quel serait votre plan d'action?",
      
      "Un employé a signalé avoir reçu un email suspect demandant ses identifiants avec un lien qui semble provenir du service IT. Après vérification, plusieurs autres employés ont reçu des messages similaires. Comment géreriez-vous cette situation?",
      
      "Une analyse de routine a révélé que plusieurs postes de travail communiquent avec un serveur C2 (Command & Control) externe. L'infection semble avoir persisté pendant plusieurs semaines. Quelle serait votre stratégie pour contenir et remédier à cette menace?"
    ];
    
    // Sélectionner un contexte aléatoire
    return contexts[Math.floor(Math.random() * contexts.length)];
  };
  
  // Gérer l'envoi du message par l'utilisateur
  const handleSubmit = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Simuler une réponse de l'API (à remplacer par un vrai appel API)
    setTimeout(() => {
      // Gérer la réponse de l'IA
      const aiResponse: Message = {
        id: generateId(),
        role: 'assistant',
        content: generateAIResponse(userInput),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
      
      // Activer le mode feedback
      setFeedbackMode(true);
      
      // Si c'est le dernier stade, préparer pour terminer
      if (currentStage >= maxStages) {
        setFeedbackMessage("C'était la dernière étape du défi! Évaluez votre performance avant de voir les résultats finaux.");
      }
    }, 1500);
  };
  
  // Générer une réponse de l'IA (à remplacer par l'appel à GPT-4o)
  const generateAIResponse = (input: string) => {
    // Simuler une réponse - dans le produit final, cette fonction appellerait l'API GPT-4o
    const aiResponses = [
      "Votre analyse est pertinente. Effectivement, cette situation requiert une analyse plus approfondie des logs système et une isolation immédiate de l'adresse IP suspecte. Pour renforcer votre approche, je vous suggérerais également de vérifier si d'autres systèmes ont été touchés et d'établir une chronologie précise des événements.",
      
      "Bonne réponse, mais il manque quelques éléments critiques. Si nous suivons les bonnes pratiques de gestion d'incident, il serait également important d'impliquer l'équipe juridique dès le début du processus et de préparer une communication de crise au cas où des données sensibles auraient été compromises.",
      
      "Votre approche technique est solide, mais n'oubliez pas l'aspect humain du problème. La formation des utilisateurs et la communication interne sont essentielles pour éviter que ce type d'incident ne se reproduise."
    ];
    
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };
  
  // Gérer l'expiration du temps (pour le mode Tunnel Effect)
  const handleTimeExpired = () => {
    // Ajouter un message système indiquant l'expiration du temps
    const timeExpiredMessage: Message = {
      id: generateId(),
      role: 'system',
      content: "⏱️ TEMPS ÉCOULÉ! Votre hésitation a des conséquences. La menace a progressé.",
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, timeExpiredMessage]);
    
    // Pénalité de score
    incrementScore(-5);
    
    // Activer le feedback négatif
    setFeedbackMode(true);
    setFeedbackMessage("Le temps est écoulé! Dans une situation de crise, chaque seconde compte.");
  };
  
  // Gérer le feedback de l'utilisateur (positif ou négatif)
  const handleFeedback = (isPositive: boolean) => {
    // Ajuster le score en fonction du feedback
    if (isPositive) {
      incrementScore(10);
    } else {
      incrementScore(-5);
    }
    
    // Si c'est le dernier stade, terminer le jeu
    if (currentStage >= maxStages) {
      completeGame();
      onComplete();
    } else {
      // Passer à l'étape suivante
      advanceStage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* En-tête du scénario */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-cyan-300">{scenarioTitle}</h2>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-cyan-400">
              Niveau {currentStage}/{maxStages}
            </span>
          </div>
        </div>
        <Progress value={(currentStage / maxStages) * 100} className="h-2 bg-blue-900" />
      </motion.div>
      
      {/* Zone de chat */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-blue-900/30 rounded-lg border border-blue-500/20 p-4 mb-4 max-h-96">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' 
                ? 'ml-auto max-w-3/4' 
                : message.role === 'system' 
                  ? 'mx-auto max-w-full text-center' 
                  : 'mr-auto max-w-3/4'
            }`}
          >
            {message.role === 'system' ? (
              <div className="bg-blue-950/70 text-blue-100 p-4 rounded-lg border border-blue-500/30">
                {message.content}
              </div>
            ) : message.role === 'user' ? (
              <div className="bg-blue-600/20 text-white p-3 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-700 rounded-full p-1 flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-300 mb-1">Vous ({getRoleName()})</p>
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-900/30 text-white p-3 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-2">
                  <div className="bg-indigo-700 rounded-full p-1 flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-300 mb-1">CyberChallenge IA</p>
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de saisie ou de feedback */}
      {feedbackMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30"
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Évaluez votre réponse</h3>
          {feedbackMessage && (
            <p className="text-blue-100 mb-4">{feedbackMessage}</p>
          )}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleFeedback(true)}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <ThumbsUp className="h-5 w-5" />
              Réponse satisfaisante
            </Button>
            <Button
              onClick={() => handleFeedback(false)}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <ThumbsDown className="h-5 w-5" />
              Besoin d'amélioration
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex gap-2 items-end">
          {selectedMode === 'tunnel-effect' && countdown !== null && (
            <div className={`flex items-center mr-2 ${
              countdown <= 10 ? 'text-red-400' : 'text-blue-300'
            }`}>
              <Clock className="h-5 w-5 mr-1" />
              <span className="text-sm font-mono">{countdown}s</span>
            </div>
          )}
          
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Tapez votre réponse ou décision..."
            className="flex-1 bg-blue-950/50 border border-blue-500/30 focus:border-blue-400/60 resize-none"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !userInput.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi...
              </span>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Composants supplémentaires pour l'interface
const User = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20H5Z" fill="currentColor" />
  </svg>
);

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="7" width="14" height="12" rx="2" fill="currentColor" />
    <rect x="9" y="3" width="6" height="4" rx="1" fill="currentColor" />
    <circle cx="9" cy="11" r="1" fill="white" />
    <circle cx="15" cy="11" r="1" fill="white" />
    <path d="M8 15H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);