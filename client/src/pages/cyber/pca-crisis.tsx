import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { AlertTriangle, Clock, DollarSign, Send, User, Bot, FileText } from 'lucide-react';

// Types pour les messages de chat
interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'hacker' | 'director' | 'employee';
  content: string;
  timestamp: Date;
  stakeholder?: string;
  cost?: number;
}

// Types pour les scénarios
interface Scenario {
  id: string;
  name: string;
  description: string;
  initialAlert: string;
  initialBudget: number;
}

// Types pour les actions possibles
interface Action {
  id: string;
  name: string;
  description: string;
  cost: number;
}

// Type pour l'état de la simulation
type SimulationState = 'scenario-selection' | 'ongoing' | 'completed';

export default function PCACrisisPage() {
  // État de la simulation
  const [simulationState, setSimulationState] = useState<SimulationState>('scenario-selection');
  
  // État du scénario
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'ransomware',
      name: 'Rançongiciel sur serveurs de production',
      description: 'Serveurs critiques chiffrés, activité paralysée.',
      initialAlert: 'ALERTE CRITIQUE : Nos serveurs de production ont été chiffrés par un rançongiciel. Toutes les opérations sont arrêtées. Une demande de rançon de 200 000 € a été reçue. Comment souhaitez-vous réagir ?',
      initialBudget: 400000
    },
    {
      id: 'email-hack',
      name: 'Piratage de messageries',
      description: 'Prises de contrôle des emails de la direction.',
      initialAlert: 'ALERTE SÉCURITÉ : Les comptes de messagerie de plusieurs directeurs ont été compromis. Des emails frauduleux sont envoyés depuis ces comptes. Quelle est votre première action ?',
      initialBudget: 400000
    },
    {
      id: 'data-leak',
      name: 'Fuite de Données Confidentielles',
      description: 'Documents internes publiés sur Internet.',
      initialAlert: 'INCIDENT MAJEUR : Des documents confidentiels de l\'entreprise ont été publiés sur un forum public. La presse commence à s\'intéresser à l\'affaire. Comment gérez-vous cette situation ?',
      initialBudget: 400000
    }
  ]);
  
  // Actions possibles 
  const [possibleActions, setPossibleActions] = useState<Action[]>([
    { id: 'external-expert', name: 'Expertise externe', description: 'Faire appel à un expert en cybersécurité', cost: 80000 },
    { id: 'server-restore', name: 'Restauration de serveurs', description: 'Réinstaller et restaurer les serveurs', cost: 120000 },
    { id: 'external-comm', name: 'Communication externe', description: 'Communiquer officiellement sur l\'incident', cost: 50000 },
    { id: 'negotiation', name: 'Négociation avec hackers', description: 'Entamer des négociations avec les attaquants', cost: 50000 }
  ]);
  
  // Scénario sélectionné
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  // Messages de chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Budget restant
  const [remainingBudget, setRemainingBudget] = useState<number>(400000);
  
  // Score
  const [score, setScore] = useState<{
    budgetRespect: number;
    conflictManagement: number;
    decisionSpeed: number;
    hackerResilience: number;
    total: number;
  }>({
    budgetRespect: 0,
    conflictManagement: 0,
    decisionSpeed: 0,
    hackerResilience: 0,
    total: 0
  });
  
  // Temps fictif
  const [fictitiousTime, setFictitiousTime] = useState<number>(0); // en minutes
  const [timerActive, setTimerActive] = useState<boolean>(false);
  
  // Référence pour le scroll du chat
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Toast pour les notifications
  const { toast } = useToast();
  
  // Input pour le message utilisateur
  const [userInput, setUserInput] = useState<string>('');
  
  // Action sélectionnée (si applicable)
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Sélection d'un scénario
  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setRemainingBudget(scenario.initialBudget);
      setMessages([
        {
          id: '1',
          role: 'system',
          content: scenario.initialAlert,
          timestamp: new Date()
        }
      ]);
      setFictitiousTime(0);
      setTimerActive(true);
      setSimulationState('ongoing');
    }
  };
  
  // Envoi d'un message utilisateur
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Si une action a été sélectionnée, déduire son coût
    if (selectedAction) {
      const action = possibleActions.find(a => a.id === selectedAction);
      if (action) {
        const newBudget = remainingBudget - action.cost;
        setRemainingBudget(newBudget);
        
        if (newBudget < 0) {
          toast({
            title: "Budget dépassé !",
            description: "Vous avez dépassé le budget alloué pour cette crise.",
            variant: "destructive",
          });
        }
      }
      setSelectedAction(null);
    }
    
    // Générer une réponse (simulée ici, à remplacer par API)
    setTimeout(() => {
      // Déterminer le type de réponse (directeur, hacker, employé)
      const stakeholderTypes = ['director', 'hacker', 'employee'];
      const randomType = stakeholderTypes[Math.floor(Math.random() * stakeholderTypes.length)] as 'director' | 'hacker' | 'employee';
      
      let responseContent = '';
      let stakeholderName = '';
      
      switch (randomType) {
        case 'director':
          stakeholderName = ['PDG', 'Directeur Financier', 'DSI'][Math.floor(Math.random() * 3)];
          responseContent = generateDirectorResponse(stakeholderName, userInput);
          break;
        case 'hacker':
          stakeholderName = 'Attaquant';
          responseContent = generateHackerResponse(userInput);
          break;
        case 'employee':
          stakeholderName = ['Employé inquiet', 'Service Informatique', 'Responsable Communication'][Math.floor(Math.random() * 3)];
          responseContent = generateEmployeeResponse(stakeholderName, userInput);
          break;
      }
      
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        role: randomType,
        content: responseContent,
        timestamp: new Date(),
        stakeholder: stakeholderName
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Avancer le temps fictif
      setFictitiousTime(prev => prev + Math.floor(Math.random() * 10) + 5);
      
      // Vérifier si la simulation doit se terminer
      if (messages.length >= 10) {
        // Calculer le score final
        calculateFinalScore();
        setTimerActive(false);
        setSimulationState('completed');
      }
    }, 1000);
  };
  
  // Fonction pour générer une réponse d'un directeur
  const generateDirectorResponse = (director: string, userMessage: string): string => {
    const responses = [
      `En tant que ${director}, je trouve votre approche trop risquée. Nous ne pouvons pas nous permettre plus de temps d'arrêt. Je propose plutôt de payer la rançon immédiatement.`,
      `${director}: J'ai besoin d'une estimation précise du temps de reprise. Les clients appellent et je n'ai pas de réponse à leur donner.`,
      `Message du ${director}: Votre stratégie semble coûteuse. Pouvez-vous justifier ces dépenses alors que nous pourrions simplement restaurer à partir des sauvegardes?`,
      `${director}: Le conseil d'administration exige un rapport détaillé dans 2 heures. Comment comptez-vous expliquer cette faille de sécurité?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Fonction pour générer une réponse d'un hacker
  const generateHackerResponse = (userMessage: string): string => {
    const responses = [
      "Nous avons toutes vos données. Le délai expire dans 24 heures, ensuite la rançon doublera.",
      "Mauvaise décision. Nous venons de publier 10% de vos données confidentielles. Le reste suivra si vous ne payez pas rapidement.",
      "Notre offre est non négociable. Payez maintenant ou assumez les conséquences de la publication de vos données.",
      "Votre tentative de gain de temps est inutile. Nous avons des accès à d'autres systèmes que vous n'avez pas encore découverts."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Fonction pour générer une réponse d'un employé
  const generateEmployeeResponse = (employee: string, userMessage: string): string => {
    const responses = [
      `${employee}: Les équipes sont débordées et stressées. Nous avons besoin de directives claires sur la marche à suivre.`,
      `${employee}: Un article vient d'apparaître dans la presse locale mentionnant notre incident. Comment devons-nous répondre aux questions?`,
      `${employee}: Nous avons identifié le vecteur initial de l'attaque. Il semble que ce soit un email de phishing ouvert par un utilisateur du service comptabilité.`,
      `${employee}: Les clients commencent à s'impatienter. Plusieurs grands comptes menacent de nous quitter si le service n'est pas rétabli aujourd'hui.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Calculer le score final
  const calculateFinalScore = () => {
    // Calcul basé sur différents critères
    const budgetScore = Math.max(0, Math.min(30, (remainingBudget / 400000) * 30));
    
    // Pour les autres critères, simulons des scores basés sur les réponses
    // Dans une implémentation réelle, cela dépendrait de l'analyse des réponses
    const conflictScore = Math.floor(Math.random() * 30);
    const speedScore = Math.floor(Math.random() * 20);
    const resilienceScore = Math.floor(Math.random() * 20);
    
    const totalScore = budgetScore + conflictScore + speedScore + resilienceScore;
    
    setScore({
      budgetRespect: budgetScore,
      conflictManagement: conflictScore,
      decisionSpeed: speedScore,
      hackerResilience: resilienceScore,
      total: totalScore
    });
  };
  
  // Réinitialiser la simulation
  const resetSimulation = () => {
    setSimulationState('scenario-selection');
    setSelectedScenario(null);
    setMessages([]);
    setRemainingBudget(400000);
    setFictitiousTime(0);
    setTimerActive(false);
    setScore({
      budgetRespect: 0,
      conflictManagement: 0,
      decisionSpeed: 0,
      hackerResilience: 0,
      total: 0
    });
  };
  
  // Effet pour faire défiler le chat automatiquement
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Gestion du timer fictif pour la pression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setFictitiousTime(prev => prev + 1);
      }, 10000); // Incrémenter toutes les 10 secondes (temps réel)
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);
  
  // Rendu différent selon l'état de la simulation
  const renderContent = () => {
    switch (simulationState) {
      case 'scenario-selection':
        return (
          <div className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Sélection du scénario de crise</CardTitle>
              <CardDescription>
                Choisissez un scénario de crise cybersécurité à gérer. Chaque scénario présente des défis uniques.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => handleScenarioSelect(scenario.id)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleScenarioSelect(scenario.id)}>
                        Sélectionner
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </div>
        );
        
      case 'ongoing':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Panneau de crise (sidebar) */}
              <div className="w-full md:w-64 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tableau de bord</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="text-sm font-medium">Temps écoulé:</span>
                        </div>
                        <span className="text-sm font-bold">{Math.floor(fictitiousTime / 60)}h{fictitiousTime % 60}m</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm font-medium">Budget restant:</span>
                        </div>
                        <span className={`text-sm font-bold ${remainingBudget < 100000 ? 'text-red-500' : ''}`}>
                          {remainingBudget.toLocaleString()} €
                        </span>
                      </div>
                    </div>
                    
                    {/* Sélection d'une action prédéfinie */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action à entreprendre:</label>
                      <Select 
                        value={selectedAction || ""} 
                        onValueChange={setSelectedAction}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une action..." />
                        </SelectTrigger>
                        <SelectContent>
                          {possibleActions.map((action) => (
                            <SelectItem key={action.id} value={action.id}>
                              <div className="flex justify-between w-full">
                                <span>{action.name}</span>
                                <span className="text-gray-500 ml-2">{action.cost.toLocaleString()} €</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedAction && (
                        <div className="text-xs text-gray-500">
                          {possibleActions.find(a => a.id === selectedAction)?.description}
                          <div className="font-medium mt-1">
                            Coût: {possibleActions.find(a => a.id === selectedAction)?.cost.toLocaleString()} €
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Conseils */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conseils</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p>• Évaluez la situation avant d'agir</p>
                      <p>• Communiquez clairement avec toutes les parties</p>
                      <p>• Documentez vos décisions pour le bilan final</p>
                      <p>• Surveillez votre budget de crise</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Conversation principale */}
              <div className="flex-1">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">
                        {selectedScenario?.name}
                      </CardTitle>
                      
                      <Badge variant={remainingBudget < 100000 ? "destructive" : "outline"}>
                        Budget: {remainingBudget.toLocaleString()} €
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {/* Messages de la crise */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    ref={chatContainerRef}
                    style={{ maxHeight: 'calc(100vh - 370px)' }}
                  >
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : message.role === 'system'
                                ? 'bg-gray-100 border border-gray-300 text-black'
                                : message.role === 'hacker'
                                  ? 'bg-red-100 border border-red-300 text-black'
                                  : message.role === 'director'
                                    ? 'bg-amber-100 border border-amber-300 text-black'
                                    : 'bg-green-100 border border-green-300 text-black'
                          }`}
                        >
                          {message.role !== 'user' && message.role !== 'system' && (
                            <div className="font-bold text-sm mb-1">
                              {message.stakeholder}
                            </div>
                          )}
                          <div>{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {message.cost && ` • -${message.cost.toLocaleString()} €`}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-center">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                          <p>Aucun message dans cette conversation</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Saisie du message */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Décrivez votre action ou réponse..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Bilan de la gestion de crise</CardTitle>
              <CardDescription>
                Voici les résultats de votre gestion de la crise: {selectedScenario?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">{score.total}/100</div>
                <div className="text-lg text-gray-600">
                  {score.total >= 80 
                    ? 'Excellent travail!' 
                    : score.total >= 60 
                      ? 'Bonne gestion de crise' 
                      : 'Des améliorations sont nécessaires'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scores par critère */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance par critère</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Respect du budget (30%)</span>
                        <span className="text-sm font-medium">{score.budgetRespect.toFixed(1)}/30</span>
                      </div>
                      <Progress value={(score.budgetRespect / 30) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Gestion des désaccords (30%)</span>
                        <span className="text-sm font-medium">{score.conflictManagement.toFixed(1)}/30</span>
                      </div>
                      <Progress value={(score.conflictManagement / 30) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Rapidité de décision (20%)</span>
                        <span className="text-sm font-medium">{score.decisionSpeed.toFixed(1)}/20</span>
                      </div>
                      <Progress value={(score.decisionSpeed / 20) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Résilience contre hackers (20%)</span>
                        <span className="text-sm font-medium">{score.hackerResilience.toFixed(1)}/20</span>
                      </div>
                      <Progress value={(score.hackerResilience / 20) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Résumé et recommandations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recommandations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Points forts:</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {score.budgetRespect > 20 && (
                          <li>Excellente maîtrise du budget de crise</li>
                        )}
                        {score.conflictManagement > 20 && (
                          <li>Bonne gestion des parties prenantes et des désaccords</li>
                        )}
                        {score.decisionSpeed > 15 && (
                          <li>Prise de décision rapide et efficace</li>
                        )}
                        {score.hackerResilience > 15 && (
                          <li>Bonne résistance face aux attaques et menaces</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Axes d'amélioration:</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {score.budgetRespect < 20 && (
                          <li>Améliorer la gestion financière pendant la crise</li>
                        )}
                        {score.conflictManagement < 20 && (
                          <li>Travailler sur la communication interne et la gestion des désaccords</li>
                        )}
                        {score.decisionSpeed < 15 && (
                          <li>Accélérer le processus de prise de décision</li>
                        )}
                        {score.hackerResilience < 15 && (
                          <li>Renforcer les stratégies de défense contre les attaquants</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Statistiques finales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-lg font-medium">Budget restant</div>
                  <div className="text-2xl font-bold">{remainingBudget.toLocaleString()} €</div>
                  <div className="text-sm text-gray-500">
                    {Math.round((remainingBudget / 400000) * 100)}% du budget initial
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-lg font-medium">Temps fictif écoulé</div>
                  <div className="text-2xl font-bold">{Math.floor(fictitiousTime / 60)}h{fictitiousTime % 60}m</div>
                  <div className="text-sm text-gray-500">
                    Temps de résolution de la crise
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-lg font-medium">Messages échangés</div>
                  <div className="text-2xl font-bold">{messages.length}</div>
                  <div className="text-sm text-gray-500">
                    {messages.filter(m => m.role === 'user').length} de vous
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={resetSimulation}>
                Nouveau scénario
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Télécharger le rapport (PDF)
              </Button>
            </CardFooter>
          </div>
        );
    }
  };
  
  return (
    <HomeLayout>
      <PageTitle title="PCA - Gestion de Crise Cybersécurité" />
      <div className="min-h-[calc(100vh-64px)] py-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4">
          <Card className="border shadow-sm">
            {renderContent()}
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}