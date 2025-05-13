import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Terminal, Shield, AlertTriangle, CheckCircle, XCircle, LucideIcon, User, UserRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MissionChoice {
  id: string;
  text: string;
  consequences?: string;
  suggestionAide?: string;
}

interface MissionStep {
  id: string;
  type: 'introduction' | 'briefing' | 'decision' | 'feedback' | 'finale';
  titre: string;
  description: string;
  pnjActif?: string;
  choixPossibles?: MissionChoice[];
}

interface PNJ {
  id: string;
  nom: string;
  role: string;
  personnalite: string;
  attitude: 'favorable' | 'neutre' | 'hostile';
  avatar?: string;
}

interface CompanyMetrics {
  budget: number;
  securite: number;
  reputation: number;
  moral: number;
}

interface MissionData {
  userId: string;
  missionId: string;
  missionNom: string;
  entrepriseNom: string;
  entrepriseVille: string;
  entrepriseSecteur: string;
  roleJoueur: string;
  roleDescription: string;
  etapeActuelle: number;
  pnjs: PNJ[];
}

interface MissionTerminalProps {
  onExit: () => void;
}

const MissionTerminal: React.FC<MissionTerminalProps> = ({ onExit }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [terminalMode, setTerminalMode] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ type: 'system' | 'user' | 'pnj', content: string, pnjId?: string }>>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [choices, setChoices] = useState<MissionChoice[]>([]);
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [currentStep, setCurrentStep] = useState<MissionStep | null>(null);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [missionEnded, setMissionEnded] = useState<boolean>(false);
  const [missionResult, setMissionResult] = useState<'succes' | 'echec' | 'licenciement' | 'abandon' | null>(null);
  const [rapport, setRapport] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialiser la mission au chargement
  useEffect(() => {
    initMission();
  }, []);
  
  // Scroll automatique vers le bas quand de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Initialisation de la mission
  const initMission = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour initialiser la mission en mode terminal
      const response = await axios.post('/api/cyber-mission/init');
      
      if (response.data.success) {
        setUserId(response.data.userId);
        addSystemMessage(response.data.message);
        
        if (response.data.choices && response.data.choices.length > 0) {
          setChoices(response.data.choices);
        }
        
        // Indiquer que le mode terminal est actif
        setTerminalMode(response.data.terminalMode || true);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'initialiser la mission",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la mission:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur de mission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };
  
  // Ajouter un message système
  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, { type: 'system', content }]);
  };
  
  // Ajouter un message utilisateur
  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { type: 'user', content }]);
  };
  
  // Ajouter un message de PNJ
  const addPNJMessage = (content: string, pnjId: string) => {
    setMessages(prev => [...prev, { type: 'pnj', content, pnjId }]);
  };
  
  // Gérer le choix de l'utilisateur (accepter/refuser la mission)
  const handleInitialChoice = async (choiceId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Simuler la saisie de l'utilisateur
      const choiceText = choices.find(c => c.id === choiceId)?.text || choiceId;
      addUserMessage(choiceText);
      
      // Si l'utilisateur refuse la mission
      if (choiceId === 'refuser') {
        const response = await axios.post('/api/cyber-mission/accept', {
          userId,
          choice: 'refuser'
        });
        
        if (response.data.success) {
          addSystemMessage(response.data.message);
          
          // Si la session doit être terminée
          if (response.data.terminateSession) {
            setTimeout(() => {
              onExit();
            }, 3000);
          }
        }
      } 
      // Si l'utilisateur accepte la mission
      else if (choiceId === 'accepter') {
        const response = await axios.post('/api/cyber-mission/accept', {
          userId,
          choice: 'accepter'
        });
        
        if (response.data.success) {
          addSystemMessage(response.data.message);
          setChoices(response.data.choices || []);
        }
      }
      // Si l'utilisateur choisit un rôle
      else if (choices.some(c => c.id === choiceId)) {
        const response = await axios.post('/api/cyber-mission/select-role', {
          userId,
          roleId: choiceId
        });
        
        if (response.data.success) {
          addSystemMessage(response.data.message);
          
          // Transition vers le mode mission complet
          setTimeout(() => {
            setTerminalMode(false);
            setMissionData(response.data.missionData);
            setCurrentStep(response.data.nextStep);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement du choix:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre choix",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer une décision de mission
  const handleMissionDecision = async (choiceId: string) => {
    if (!userId || !currentStep) return;
    
    try {
      setLoading(true);
      
      // Trouver le texte du choix
      const choiceText = currentStep.choixPossibles?.find(c => c.id === choiceId)?.text || choiceId;
      addUserMessage(choiceText);
      
      const response = await axios.post('/api/cyber-mission/decision', {
        userId,
        etapeId: currentStep.id,
        choixId: choiceId
      });
      
      if (response.data.success) {
        // Ajouter la réponse du PNJ si disponible
        if (response.data.pnjActif) {
          addPNJMessage(response.data.message, response.data.pnjActif);
        } else {
          addSystemMessage(response.data.message);
        }
        
        // Mettre à jour les métriques
        if (response.data.metriques) {
          setMetrics(response.data.metriques);
        }
        
        // Vérifier si la mission est terminée
        if (response.data.missionTerminee) {
          setMissionEnded(true);
          setMissionResult(response.data.resultatFinal);
          if (response.data.rapport) {
            setRapport(response.data.rapport);
          }
        }
        // Sinon, passer à l'étape suivante
        else if (response.data.nextStep) {
          setCurrentStep(response.data.nextStep);
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la décision:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre décision",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Terminer la mission volontairement
  const handleEndMission = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post('/api/cyber-mission/end', {
        userId
      });
      
      if (response.data.success) {
        addSystemMessage(response.data.message);
        
        setMissionEnded(true);
        setMissionResult('abandon');
        
        if (response.data.rapport) {
          setRapport(response.data.rapport);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la fin de mission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la mission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu d'un message selon son type
  const renderMessage = (message: { type: 'system' | 'user' | 'pnj', content: string, pnjId?: string }, index: number) => {
    if (message.type === 'system') {
      return (
        <div key={index} className="whitespace-pre-wrap bg-gray-800 text-white p-3 rounded-md mb-4 font-mono">
          {message.content}
        </div>
      );
    }
    
    if (message.type === 'user') {
      return (
        <div key={index} className="flex justify-end mb-4">
          <div className="bg-blue-600 text-white p-3 rounded-md max-w-[80%]">
            <div className="flex items-center mb-1">
              <UserRound className="w-4 h-4 mr-2" />
              <span className="font-bold">Vous</span>
            </div>
            {message.content}
          </div>
        </div>
      );
    }
    
    if (message.type === 'pnj' && message.pnjId && missionData) {
      const pnj = missionData.pnjs.find(p => p.id === message.pnjId);
      
      return (
        <div key={index} className="flex justify-start mb-4">
          <div className={`p-3 rounded-md max-w-[80%] ${
            pnj?.attitude === 'favorable' ? 'bg-green-700 text-white' :
            pnj?.attitude === 'hostile' ? 'bg-red-700 text-white' :
            'bg-gray-700 text-white'
          }`}>
            <div className="flex items-center mb-1">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback>{pnj?.nom.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="font-bold">{pnj?.nom} ({pnj?.role})</span>
            </div>
            {message.content}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Rendu des choix disponibles
  const renderChoices = () => {
    if (terminalMode) {
      return (
        <div className="mt-4 flex flex-col gap-2">
          {choices.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              className="text-left justify-between border-gray-600 hover:bg-gray-700"
              onClick={() => handleInitialChoice(choice.id)}
              disabled={loading}
            >
              <span>{choice.text}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ))}
        </div>
      );
    }
    
    if (currentStep?.choixPossibles) {
      return (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {currentStep.choixPossibles.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              className="text-left h-auto py-3 justify-start flex flex-col items-start"
              onClick={() => handleMissionDecision(choice.id)}
              disabled={loading}
            >
              <span className="mb-1 font-bold">{choice.texte}</span>
              {choice.suggestionAide && (
                <span className="text-sm text-gray-400 italic">{choice.suggestionAide}</span>
              )}
            </Button>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  // Rendu du tableau de bord des métriques de l'entreprise
  const renderMetricsDashboard = () => {
    if (!metrics || terminalMode) return null;
    
    return (
      <div className="grid grid-cols-4 gap-3 mb-4 mt-2">
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Progress value={metrics.budget} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.budget < 30 ? 'text-red-500' : metrics.budget > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              {metrics.budget}/100
            </span>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Progress value={metrics.securite} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.securite < 30 ? 'text-red-500' : metrics.securite > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              {metrics.securite}/100
            </span>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Réputation</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Progress value={metrics.reputation} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.reputation < 30 ? 'text-red-500' : metrics.reputation > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              {metrics.reputation}/100
            </span>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Moral</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Progress value={metrics.moral} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.moral < 30 ? 'text-red-500' : metrics.moral > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              {metrics.moral}/100
            </span>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Rendu d'une info-bulle pour la mission
  const renderMissionInfo = () => {
    if (!missionData || terminalMode) return null;
    
    return (
      <div className="mb-4 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-base">{missionData.missionNom}</h3>
            <p className="text-gray-300">
              {missionData.entrepriseNom} - {missionData.entrepriseVille} ({missionData.entrepriseSecteur})
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-900 text-white border-blue-700">
            {missionData.roleJoueur === "rssi" ? "RSSI" : 
             missionData.roleJoueur === "analyste_securite" ? "Analyste Sécurité" :
             missionData.roleJoueur === "pentester" ? "Pentesteur" :
             missionData.roleJoueur === "dpo" ? "DPO" :
             missionData.roleJoueur === "directeur_securite" ? "CISO" : 
             missionData.roleJoueur}
          </Badge>
        </div>
      </div>
    );
  };
  
  // Rendu du rapport final de mission
  const renderMissionReport = () => {
    if (!missionEnded) return null;
    
    return (
      <div className="mt-6 bg-gray-800 border border-gray-700 rounded-md p-4">
        <h3 className="text-xl font-bold mb-2 flex items-center">
          {missionResult === 'succes' && <CheckCircle className="mr-2 h-5 w-5 text-green-500" />}
          {missionResult === 'echec' && <XCircle className="mr-2 h-5 w-5 text-red-500" />}
          {missionResult === 'licenciement' && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
          {missionResult === 'abandon' && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
          Rapport de mission
        </h3>
        
        <div className="mb-4">
          <Badge variant="outline" className={`
            ${missionResult === 'succes' ? 'bg-green-900 border-green-700' : 
              missionResult === 'echec' ? 'bg-red-900 border-red-700' :
              missionResult === 'licenciement' ? 'bg-yellow-900 border-yellow-700' :
              'bg-gray-900 border-gray-700'}
          `}>
            {missionResult === 'succes' ? 'Mission réussie' : 
             missionResult === 'echec' ? 'Mission échouée' :
             missionResult === 'licenciement' ? 'Vous avez été licencié' :
             'Mission abandonnée'}
          </Badge>
        </div>
        
        {rapport && (
          <div className="whitespace-pre-wrap text-gray-300">
            {rapport}
          </div>
        )}
        
        <div className="mt-6">
          <Button onClick={onExit} className="w-full">
            Retourner au menu principal
          </Button>
        </div>
      </div>
    );
  };
  
  // Rendu principal
  return (
    <div className="bg-gray-900 text-white p-4 h-full flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-400" />
          <h2 className="text-xl font-bold">
            {terminalMode ? "TERMINAL SÉCURISÉ" : missionData?.missionNom || "Mission Cyber"}
          </h2>
        </div>
        
        {!terminalMode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndMission}
            disabled={loading || missionEnded}
          >
            Quitter la mission
          </Button>
        )}
      </div>
      
      {/* Info mission et métriques */}
      {renderMissionInfo()}
      {renderMetricsDashboard()}
      
      {/* Zone de messages */}
      <div className={`flex-grow overflow-y-auto mb-4 ${terminalMode ? 'font-mono bg-black p-3 rounded-md' : ''}`}>
        {initializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span>Initialisation du terminal...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Rapport de fin de mission */}
      {renderMissionReport()}
      
      {/* Zone de choix */}
      {!missionEnded && (
        <div className="mt-auto">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span>Traitement en cours...</span>
            </div>
          ) : (
            renderChoices()
          )}
        </div>
      )}
    </div>
  );
};

export default MissionTerminal;