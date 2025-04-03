import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, 
  AlertCircle, Clock, Zap, Send, CheckCircle, ArrowLeft,
  ListTodo, FileCheck, Menu, X, BarChart, Brain, 
  LineChart, Target, Award, Microscope, MessageCircle, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useChatContext } from '@/contexts/ChatContext';

// Import des types depuis le module partagé
import { 
  Mission, 
  Message, 
  Contact, 
  Objective, 
  Decision,
  Skill,
  LearningEvent
} from '../../../shared/types/cyber';
import { cyberDefenseMissions, getMissionById, exampleMission } from '../data/cyber-defense-missions';

// Mapping des couleurs de fond en fonction du niveau de difficulté
const difficultyColor = {
  "Débutant": "bg-green-100 text-green-800",
  "Intermédiaire": "bg-amber-100 text-amber-800",
  "Expert": "bg-red-100 text-red-800"
};

// Composant pour un message dans le chat
const ChatMessage = ({ message, additionalResponse = null }: { 
  message: Message, 
  additionalResponse?: Message | null 
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.sender === 'Système';
  
  // Format du contenu avec Markdown simplifié
  const formatContent = (content: string) => {
    // Convertir les titres
    let formattedContent = content
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-1">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-md font-medium mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Gras
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italique
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-200 p-2 rounded my-2 overflow-auto text-sm">$1</pre>') // Code block
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>'); // Inline code
      
    // Listes à puces
    formattedContent = formattedContent.replace(/^\s*[-•]\s+(.*$)/gm, '<li class="ml-4">$1</li>');
    formattedContent = formattedContent.replace(/(<li.*?<\/li>)(?:\s*\n\s*)?(<li)/g, '$1$2');
    formattedContent = formattedContent.replace(/(<li.*?<\/li>)(\s*\n\s*)?([^<])/g, '$1</ul>$3');
    formattedContent = formattedContent.replace(/(?:^|\n)(<li)/g, '\n<ul>$1');
    
    // Listes numérotées
    formattedContent = formattedContent.replace(/^\s*(\d+)\.\s+(.*$)/gm, '<li value="$1" class="ml-4">$2</li>');
    formattedContent = formattedContent.replace(/(<li value=.*?<\/li>)(?:\s*\n\s*)?(<li value)/g, '$1$2');
    formattedContent = formattedContent.replace(/(<li value=.*?<\/li>)(\s*\n\s*)?([^<])/g, '$1</ol>$3');
    formattedContent = formattedContent.replace(/(?:^|\n)(<li value)/g, '\n<ol>$1');
    
    // Convertir les sauts de ligne simples en <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };
  
  // Déterminer la classe d'arrière-plan
  let bgColorClass = isUser 
    ? 'bg-green-600 text-white' 
    : isSystem 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-100 text-gray-800';
  
  // Déterminer les classes pour les coins arrondis
  let roundedClass = isUser
    ? 'rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl'
    : 'rounded-tr-xl rounded-tl-none rounded-bl-xl rounded-br-xl';

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} key={message.id}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-3xl`}>
          {!isUser && message.sender && (
            <Avatar className="mt-1 mr-3">
              <AvatarFallback className={`${isSystem ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
                {message.sender === 'Système' ? 'SYS' : message.sender.split(' ').map(word => word[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`${bgColorClass} ${roundedClass} p-4 shadow-sm`}>
            {!isUser && message.sender && (
              <div className="flex items-center mb-2">
                <span className="font-semibold">{message.sender}</span>
                {message.senderRole && (
                  <span className={`text-xs ${isSystem ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'} px-2 py-0.5 rounded-full ml-2`}>
                    {message.senderRole}
                  </span>
                )}
              </div>
            )}
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
            <div className={`text-xs mt-2 ${isUser ? 'text-green-200' : isSystem ? 'text-blue-200' : 'text-gray-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Affichage d'une réaction additionnelle si présente */}
      {additionalResponse && (
        <div className="flex justify-start mb-4 ml-8">
          <div className="flex flex-row items-start max-w-3xl">
            <Avatar className="mt-1 mr-3">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {additionalResponse.sender && additionalResponse.sender.split(' ').map(word => word[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="bg-gray-50 text-gray-800 rounded-xl p-3 shadow-sm border border-gray-200">
              <div className="flex items-center mb-1">
                <span className="font-semibold">{additionalResponse.sender || 'Collègue'}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                  {additionalResponse.senderRole || 'Expert'}
                </span>
              </div>
              <div className="text-sm italic">
                {additionalResponse.content || ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Composant principal de la page de mission
export default function CyberDefenseMission() {
  const [, params] = useRoute('/cyber-defense/mission/:id');
  const missionId = params?.id;
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentObjective, setCurrentObjective] = useState(0);
  const { userName } = useChatContext();
  
  // Charger la mission à partir de l'ID ou utiliser la mission d'exemple
  const [mission, setMission] = useState<Mission>(exampleMission);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [showDecisionOptions, setShowDecisionOptions] = useState(false);
  const [currentObjectiveIndex, setCurrentObjectiveIndex] = useState(0);
  
  // Charger la mission en fonction de l'ID
  useEffect(() => {
    if (missionId) {
      const loadedMission = getMissionById(missionId);
      if (loadedMission) {
        setMission(loadedMission);
      }
    }
  }, [missionId]);
  
  // Initialisation de la mission
  useEffect(() => {
    if (messages.length === 0) {
      // Message d'introduction présentant le contexte, le rôle du joueur et la mission
      const introMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `# Alerte de Cybersécurité

Bonjour ${userName || "RSSI"},

Nous sommes le ${new Date().toLocaleDateString()} et notre équipe vient de détecter une situation critique qui requiert votre attention immédiate.

En tant que ${mission.userRole}, vous êtes responsable de la gestion de cette situation. Les membres de l'équipe suivent vos directives et attendent vos instructions.

Contexte:
${mission.scenario}

Vos objectifs:
${mission.objectives.map((obj, i) => `${i+1}. ${obj.description}`).join('\n')}

Votre équipe est mobilisée et attend vos instructions. Comment souhaitez-vous procéder ?`,
        sender: "Système",
        senderRole: "Briefing de mission",
        timestamp: Date.now()
      };
      
      // Message de présentation des contacts disponibles avec une clara hiérarchie
      const contactMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `# Structure de l'équipe de crise

Votre équipe est composée des experts suivants:

${mission.contacts.map(contact => 
  `• ${contact.name} (${contact.role}) - ${contact.expertise}`
).join('\n')}

Structure hiérarchique:
• Vous (RSSI) dirigez l'équipe et prenez les décisions finales
• Sophie Dupont et Marc Lefort sont sous votre supervision directe
• Jeanne Martin collabore avec l'équipe mais doit valider ses actions avec vous

Pour démarrer cette mission, vous pouvez:
• Demander un rapport de situation à Sophie Dupont 
• Discuter des mesures immédiates avec Marc Lefort
• Préparer la communication de crise avec Jeanne Martin

Vous pouvez vous adresser directement à un membre de l'équipe en mentionnant son nom.`,
        sender: "Système",
        senderRole: "Briefing de mission",
        timestamp: Date.now()
      };
      
      setMessages([introMessage, contactMessage]);
    }
  }, [mission, userName, messages.length]);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Gérer l'envoi de messages via l'API
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: userInput,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    
    try {
      // Préparer les 5 derniers messages pour le contexte tout en limitant la taille
      const recentMessages = messages.slice(-5);
      
      // Détection si le message est adressé à un PNJ spécifique
      let targetContact = null;
      const lowerCaseInput = userInput.toLowerCase();
      for (const contact of mission.contacts) {
        const firstName = contact.name.split(' ')[0].toLowerCase();
        const lastName = contact.name.split(' ').length > 1 ? contact.name.split(' ')[1].toLowerCase() : '';
        
        if (lowerCaseInput.includes(firstName) || (lastName && lowerCaseInput.includes(lastName))) {
          targetContact = contact.name;
          break;
        }
      }
      
      // Appel à l'API pour obtenir une réponse des personnages
      const response = await axios.post('/api/cyber-defense/chat', {
        userMessage: userInput,
        missionId: mission.id,
        missionContext: mission,
        currentObjective: currentObjective,
        previousMessages: recentMessages,
        targetContact: targetContact, // Ajouter le PNJ ciblé si détecté
        temperature: 0.8,
        maxTokens: 1000
      });
      
      const { 
        response: responseContent, 
        sender, 
        senderRole,
        additionalResponse, // Récupération de la réponse additionnelle
        decision // Nouvelle propriété pour les décisions
      } = response.data;
      
      // Mettre à jour la progression en fonction des mots-clés dans la réponse et l'objectif actuel
      // Fonction utilitaire pour mettre à jour les compétences et ajouter des événements d'apprentissage
      const updateSkillsAndAddLearningEvent = (skillId: string, gainedPoints: number, description: string) => {
        // Créer un nouvel événement d'apprentissage
        const newEvent: LearningEvent = {
          id: uuidv4(),
          timestamp: Date.now(),
          description,
          skillsImpacted: [{ skillId, gainedPoints }],
          relatedObjectiveId: mission.objectives[currentObjective]?.id
        };
        
        // Mettre à jour la mission avec le nouvel événement
        setMission(prevMission => {
          const updatedMission = { ...prevMission };
          
          // Ajouter l'événement d'apprentissage
          updatedMission.learningEvents = [...(prevMission.learningEvents || []), newEvent];
          
          // Mettre à jour le niveau de compétence
          if (updatedMission.skillsProgress) {
            updatedMission.skillsProgress = updatedMission.skillsProgress.map(skill => {
              if (skill.id === skillId) {
                return {
                  ...skill,
                  level: Math.min(100, skill.level + gainedPoints)
                };
              }
              return skill;
            });
          }
          
          return updatedMission;
        });
      };
      
      // Objectif 1: Évaluer l'ampleur de la compromission
      if (currentObjective === 0 && 
          (responseContent.toLowerCase().includes('logs') || 
           responseContent.toLowerCase().includes('détect') || 
           responseContent.toLowerCase().includes('compromis') || 
           responseContent.toLowerCase().includes('analyse'))) {
        setCurrentObjective(1);
        setProgress(20);
        
        // Mise à jour des compétences relatives à cet objectif
        updateSkillsAndAddLearningEvent(
          'analyse_risque', 
          15, 
          "Vous avez montré votre capacité à évaluer rapidement l'étendue de la compromission"
        );
        updateSkillsAndAddLearningEvent(
          'forensique', 
          10, 
          "Vous avez initié une analyse forensique efficace des systèmes compromis"
        );
      } 
      // Objectif 2: Contenir la menace et bloquer l'attaque
      else if (currentObjective === 1 && 
               (responseContent.toLowerCase().includes('bloqu') || 
                responseContent.toLowerCase().includes('contenir') || 
                responseContent.toLowerCase().includes('limiter') || 
                responseContent.toLowerCase().includes('pare-feu'))) {
        setCurrentObjective(2);
        setProgress(40);
        
        // Mise à jour des compétences relatives à cet objectif
        updateSkillsAndAddLearningEvent(
          'gestion_crise', 
          20, 
          "Vous avez pris des mesures efficaces pour contenir la menace rapidement"
        );
        updateSkillsAndAddLearningEvent(
          'decision_rapide', 
          15, 
          "Vous avez fait preuve de discernement dans vos décisions sous pression"
        );
      } 
      // Objectif 3: Mettre en place une communication efficace
      else if (currentObjective === 2 && 
               (responseContent.toLowerCase().includes('communication') || 
                responseContent.toLowerCase().includes('informer') || 
                responseContent.toLowerCase().includes('alert') || 
                responseContent.toLowerCase().includes('message'))) {
        setCurrentObjective(3);
        setProgress(60);
        
        // Mise à jour des compétences relatives à cet objectif
        updateSkillsAndAddLearningEvent(
          'communication', 
          25, 
          "Vous avez établi un plan de communication clair et efficace avec toutes les parties prenantes"
        );
      }
      // Objectif 4: Récupérer les systèmes affectés
      else if (currentObjective === 3 && 
               (responseContent.toLowerCase().includes('récupér') || 
                responseContent.toLowerCase().includes('restaur') || 
                responseContent.toLowerCase().includes('sauvegardes') || 
                responseContent.toLowerCase().includes('réparation'))) {
        setCurrentObjective(4);
        setProgress(80);
        
        // Mise à jour des compétences relatives à cet objectif
        updateSkillsAndAddLearningEvent(
          'forensique', 
          15, 
          "Vous avez supervisé efficacement la restauration des systèmes affectés"
        );
        updateSkillsAndAddLearningEvent(
          'gestion_crise', 
          10, 
          "Vous avez maintenu un contrôle stable de la situation pendant la phase de récupération"
        );
      }
      // Objectif 5: Proposer des mesures préventives
      else if (currentObjective === 4 && 
               (responseContent.toLowerCase().includes('préventi') || 
                responseContent.toLowerCase().includes('futur') || 
                responseContent.toLowerCase().includes('recommend') || 
                responseContent.toLowerCase().includes('améliorer'))) {
        setProgress(100);
        
        // Mise à jour des compétences relatives à cet objectif
        updateSkillsAndAddLearningEvent(
          'analyse_risque', 
          20, 
          "Vous avez proposé des mesures préventives pertinentes basées sur une analyse approfondie"
        );
        updateSkillsAndAddLearningEvent(
          'communication', 
          10, 
          "Vous avez su communiquer efficacement les recommandations post-incident"
        );
        updateSkillsAndAddLearningEvent(
          'decision_rapide', 
          15, 
          "Vous avez démontré votre capacité à prioriser les mesures de sécurité futures"
        );
        
        // Après un court délai, ajouter un message de conclusion si tous les objectifs sont atteints
        setTimeout(() => {
          if (progress === 100) {
            const conclusionMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: `# Mission terminée !

Félicitations ${userName || "Responsable"} ! Vous avez géré avec succès l'incident de phishing qui ciblait CyberTech Solutions.

**Vos réalisations :**
✅ Évaluation rapide de l'ampleur de la compromission
✅ Mise en place de mesures de containment efficaces
✅ Établissement d'une communication claire avec les parties prenantes
✅ Récupération des systèmes affectés
✅ Proposition de mesures préventives pertinentes

Cette expérience démontre l'importance d'une réponse coordonnée face aux menaces de phishing, qui restent l'un des vecteurs d'attaque les plus courants. Votre leadership a permis de limiter l'impact de cet incident et de renforcer la posture de sécurité de l'organisation.

Souhaitez-vous :
1. Revoir cette mission
2. Essayer une autre mission
3. Revenir à l'accueil`,
              timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, conclusionMessage]);
          }
        }, 2000);
      }
      
      // Créer le message de réponse principal
      const botMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: responseContent,
        sender,
        senderRole,
        timestamp: Date.now()
      };
      
      // Si une réponse additionnelle est présente, créer un message supplémentaire
      setMessages(prev => {
        const newMessages = [...prev, botMessage];
        
        if (additionalResponse) {
          const additionalMessage: Message = {
            id: uuidv4(),
            role: "assistant",
            content: additionalResponse.response || "",
            sender: additionalResponse.sender || "Collègue",
            senderRole: additionalResponse.senderRole || "Expert",
            timestamp: Date.now() + 500, // légèrement décalé pour l'ordre d'affichage
            additionalResponse: true // Marquer comme réponse additionnelle
          };
          
          newMessages.push(additionalMessage);
        }
        
        return newMessages;
      });
      setLoading(false);
      
      // Si une décision est demandée, afficher le panneau de décision
      if (decision) {
        setCurrentDecision(decision);
        setTimeout(() => {
          setShowDecisionOptions(true);
        }, 1000); // Délai d'animation pour permettre au message de s'afficher
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Message d'erreur en cas d'échec de l'API
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Désolé, une erreur s'est produite lors de la communication avec l'équipe. Veuillez réessayer.",
        sender: "Système",
        senderRole: "Assistance",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header avec informations de la mission */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/cyber-defense">
                  <Button variant="ghost" size="icon" className="mr-3">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 hidden md:block">{mission.title}</h1>
                  <h1 className="text-lg font-bold text-gray-900 md:hidden">Mission en cours</h1>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge className={difficultyColor[mission.difficulty]}>
                      {mission.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {mission.duration}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:hidden">
                <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="hidden md:block">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-600 mb-1">Progression</div>
                    <Progress value={progress} className="w-40 h-2" />
                  </div>
                  <div>
                    <Badge variant="outline" className="ml-2">
                      {progress === 100 ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complété
                        </span>
                      ) : (
                        <span>Objectif {currentObjective + 1}/{mission.objectives.length}</span>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Chat */}
          <div className="flex-1 flex flex-col max-w-full">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6"
              style={{ maxHeight: 'calc(100vh - 64px - 80px)' }}
            >
              {messages.map((message, index) => {
                // Vérifier si le message suivant est une réaction additionnelle
                const hasAdditionalResponse = index < messages.length - 1 && 
                  messages[index + 1].additionalResponse === true;
                
                // Si ce message a une réponse additionnelle, l'afficher
                if (message.additionalResponse === true) {
                  return null; // Ne pas afficher les réactions additionnelles comme des messages indépendants
                }
                
                return (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    additionalResponse={hasAdditionalResponse ? messages[index + 1] : null} 
                  />
                );
              })}
              
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 rounded-xl p-4 max-w-md animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Panneau de décision */}
            {showDecisionOptions && currentDecision && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-2">{currentDecision.description}</h3>
                  <p className="text-gray-600 text-sm mb-4">Votre décision aura un impact sur le déroulement de la mission</p>
                  
                  <div className="space-y-3">
                    {currentDecision.options.map(option => (
                      <button
                        key={option.id}
                        className="w-full text-left bg-white border border-gray-300 hover:bg-gray-50 p-3 rounded-md transition-colors"
                        onClick={async () => {
                          // Traiter le choix
                          setShowDecisionOptions(false);
                          setLoading(true);
                          
                          // Ajouter le message de décision
                          const decisionMessage: Message = {
                            id: uuidv4(),
                            role: "user",
                            content: `J'ai décidé de : ${option.text}`,
                            timestamp: Date.now()
                          };
                          
                          setMessages(prev => [...prev, decisionMessage]);
                          
                          try {
                            // Appel à l'API pour évaluer la décision
                            const response = await axios.post('/api/cyber-defense/evaluate-decision', {
                              missionId: mission.id,
                              missionContext: mission,
                              decisionId: currentDecision.id,
                              choiceId: option.id,
                              currentObjective: currentObjectiveIndex,
                              userRole: mission.userRole
                            });
                            
                            const { evaluation, updatedMission } = response.data;
                            
                            // Mettre à jour la mission avec les nouvelles informations
                            setMission(updatedMission);
                            
                            // Créer le message d'évaluation
                            const evaluationMessage: Message = {
                              id: uuidv4(),
                              role: "assistant",
                              content: evaluation.content,
                              sender: evaluation.supervisor,
                              senderRole: evaluation.supervisorRole,
                              timestamp: Date.now(),
                              evaluation: true
                            };
                            
                            setMessages(prev => [...prev, evaluationMessage]);
                            
                            // Si l'objectif est complété, passer au suivant
                            if (evaluation.objectiveCompleted) {
                              setCurrentObjectiveIndex(prev => prev + 1);
                              setProgress(prev => Math.min(100, prev + Math.floor(100 / mission.objectives.length)));
                              
                              // Message de félicitations pour l'objectif complété
                              const completionMessage: Message = {
                                id: uuidv4(),
                                role: "assistant",
                                content: `Objectif complété : ${mission.objectives[currentObjectiveIndex].description}`,
                                sender: "Système",
                                senderRole: "Progression",
                                timestamp: Date.now()
                              };
                              
                              setMessages(prev => [...prev, completionMessage]);
                            }
                            
                            setLoading(false);
                            
                          } catch (error) {
                            console.error('Error evaluating decision:', error);
                            setLoading(false);
                            
                            // Message d'erreur
                            const errorMessage: Message = {
                              id: uuidv4(),
                              role: "assistant",
                              content: "Une erreur s'est produite lors de l'évaluation de votre décision.",
                              sender: "Système",
                              senderRole: "Erreur",
                              timestamp: Date.now()
                            };
                            
                            setMessages(prev => [...prev, errorMessage]);
                          }
                        }}
                      >
                        <div className="font-medium">{option.text}</div>
                        {option.score > 0 ? (
                          <div className="text-xs mt-1 text-green-600">Impact: +{option.score} points</div>
                        ) : option.score < 0 ? (
                          <div className="text-xs mt-1 text-red-600">Impact: {option.score} points</div>
                        ) : (
                          <div className="text-xs mt-1 text-gray-500">Impact neutre</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDecisionOptions(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading || showDecisionOptions}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !userInput.trim() || showDecisionOptions}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
          
          {/* Sidebar with mission details - Hidden on mobile */}
          <div className="hidden md:block w-80 bg-white border-l border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="p-6">
              <Tabs defaultValue="objectives">
                <TabsList className="w-full">
                  <TabsTrigger value="objectives" className="flex-1">
                    <ListTodo className="h-4 w-4 mr-2" /> Objectifs
                  </TabsTrigger>
                  <TabsTrigger value="brief" className="flex-1">
                    <FileCheck className="h-4 w-4 mr-2" /> Briefing
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex-1">
                    <BarChart className="h-4 w-4 mr-2" /> Compétences
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="objectives" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Objectifs de la mission</h3>
                  <div className="space-y-3">
                    {mission.objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          currentObjective > idx 
                            ? 'bg-green-500 text-white' 
                            : currentObjective === idx 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                        }`}>
                          {currentObjective > idx && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`${
                            currentObjective > idx 
                              ? 'text-gray-500 line-through' 
                              : currentObjective === idx 
                                ? 'text-gray-900 font-medium'
                                : 'text-gray-600'
                          }`}>
                            {objective.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Progression</h4>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-gray-500">{progress}% complété</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="brief" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Briefing</h3>
                  <div className="prose prose-sm">
                    <p className="text-gray-700 mb-4">{mission.scenario}</p>
                    
                    <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                    <div className="space-y-3">
                      {mission.contacts.map((contact, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-1">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {contact.name.split(' ').map(word => word[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{contact.name}</p>
                          </div>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{contact.expertise}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dashboard" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Tableau de bord des compétences</h3>
                  
                  {/* Résumé des compétences */}
                  <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <div className="flex items-center mb-2">
                      <Brain className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium">Progression globale</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Développez vos compétences en cybersécurité en complétant les objectifs de la mission.</p>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-gray-500 text-right">{progress}% complété</p>
                  </div>
                  
                  {/* Liste des compétences avec leur progression */}
                  <div className="space-y-3">
                    {mission.skillsProgress?.map((skill, idx) => {
                      // Simule la progression des compétences en fonction de l'avancement de la mission
                      const skillLevel = Math.min(100, Math.round(progress * (0.5 + Math.random() * 0.5)));
                      
                      // Détermine la couleur de la barre de progression en fonction du niveau
                      let progressColor = "bg-blue-600";
                      if (skillLevel < 30) progressColor = "bg-red-500";
                      else if (skillLevel < 70) progressColor = "bg-amber-500";
                      else if (skillLevel >= 90) progressColor = "bg-green-500";
                      
                      // Détermine l'icône en fonction de la catégorie de compétence
                      let SkillIcon = Shield;
                      if (skill.category === "technique") SkillIcon = Database;
                      else if (skill.category === "communication") SkillIcon = MessageCircle;
                      else if (skill.category === "analyse") SkillIcon = AlertTriangle;
                      else if (skill.category === "leadership") SkillIcon = Users;
                      
                      return (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-2">
                            <div className="bg-white p-1.5 rounded-full mr-2 shadow-sm">
                              <SkillIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{skill.name}</p>
                              <p className="text-xs text-gray-500">{skill.category}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{skill.description}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${skillLevel}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Niveau</span>
                            <span>{skillLevel}/100</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Section des conseils et recommandations */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      Recommandations d'amélioration
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Concentrez-vous sur l'analyse détaillée des systèmes compromis avant toute action</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Améliorez votre communication avec les différentes parties prenantes</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Envisagez des mesures préventives plus complètes pour renforcer la sécurité</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-xl font-bold">Détails de la mission</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <Tabs defaultValue="objectives" className="flex-1">
              <TabsList className="w-full">
                <TabsTrigger value="objectives" className="flex-1">
                  <ListTodo className="h-4 w-4 mr-2" /> Objectifs
                </TabsTrigger>
                <TabsTrigger value="brief" className="flex-1">
                  <FileCheck className="h-4 w-4 mr-2" /> Briefing
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex-1">
                  <BarChart className="h-4 w-4 mr-2" /> Compétences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="objectives" className="pt-4 flex-1">
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{progress}% complété</p>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Objectifs de la mission</h3>
                <div className="space-y-3">
                  {mission.objectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        currentObjective > idx 
                          ? 'bg-green-500 text-white' 
                          : currentObjective === idx 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                      }`}>
                        {currentObjective > idx && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className={`${
                          currentObjective > idx 
                            ? 'text-gray-500 line-through' 
                            : currentObjective === idx 
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-600'
                        }`}>
                          {objective.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="brief" className="pt-4">
                <h3 className="text-lg font-semibold mb-3">Briefing</h3>
                <div className="prose prose-sm">
                  <p className="text-gray-700 mb-4">{mission.scenario}</p>
                  
                  <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                  <div className="space-y-3">
                    {mission.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {contact.name.split(' ').map(word => word[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{contact.name}</p>
                        </div>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact.expertise}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dashboard" className="pt-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3">Tableau de bord des compétences</h3>
                
                {/* Résumé des compétences */}
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium">Progression globale</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Développez vos compétences en cybersécurité en complétant les objectifs de la mission.</p>
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500 text-right">{progress}% complété</p>
                </div>
                
                {/* Liste des compétences avec leur progression */}
                <div className="space-y-3">
                  {mission.skillsProgress?.map((skill, idx) => {
                    // Simule la progression des compétences en fonction de l'avancement de la mission
                    const skillLevel = Math.min(100, Math.round(progress * (0.5 + Math.random() * 0.5)));
                    
                    // Détermine la couleur de la barre de progression en fonction du niveau
                    let progressColor = "bg-blue-600";
                    if (skillLevel < 30) progressColor = "bg-red-500";
                    else if (skillLevel < 70) progressColor = "bg-amber-500";
                    else if (skillLevel >= 90) progressColor = "bg-green-500";
                    
                    // Détermine l'icône en fonction de la catégorie de compétence
                    let SkillIcon = Shield;
                    if (skill.category === "technique") SkillIcon = Database;
                    else if (skill.category === "communication") SkillIcon = MessageCircle;
                    else if (skill.category === "analyse") SkillIcon = AlertTriangle;
                    else if (skill.category === "leadership") SkillIcon = Users;
                    
                    return (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-2">
                          <div className="bg-white p-1.5 rounded-full mr-2 shadow-sm">
                            <SkillIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{skill.name}</p>
                            <p className="text-xs text-gray-500">{skill.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{skill.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${skillLevel}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Niveau</span>
                          <span>{skillLevel}/100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Section des conseils et recommandations */}
                <div className="mt-4 border-t pt-4 pb-8">
                  <h4 className="text-md font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-600" />
                    Recommandations d'amélioration
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Concentrez-vous sur l'analyse détaillée des systèmes compromis avant toute action</span>
                    </li>
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Améliorez votre communication avec les différentes parties prenantes</span>
                    </li>
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Envisagez des mesures préventives plus complètes pour renforcer la sécurité</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="py-4">
              <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                Retour au chat
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HomeLayout>
  );
}