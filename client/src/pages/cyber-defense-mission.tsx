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
  LearningEvent,
  SkillBadge,
  getSkillLevelLabel,
  calculateGlobalSkillProgress,
  getSkillsRecommendations,
  generateBadgeForSkillLevel
} from '../../../shared/types/cyber';
import { cyberDefenseMissions, getMissionById, exampleMission } from '../data/cyber-defense-missions';

// Mapping des couleurs de fond en fonction du niveau de difficulté
const difficultyColor = {
  "Débutant": "bg-[#006a9e]/10 text-[#006a9e]",
  "Intermédiaire": "bg-[#006a9e]/20 text-[#006a9e]/90",
  "Expert": "bg-[#006a9e]/30 text-[#006a9e]"
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
      
    // Préparation des listes à puces
    const lines = formattedContent.split('\n');
    const newLines: string[] = [];
    let inBulletList = false;
    let inNumberedList = false;
    
    // Traitement ligne par ligne pour une meilleure gestion des listes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Lignes de liste à puces (tirets ou points)
      if (trimmedLine.match(/^[-•]\s+.*/)) {
        const bulletContent = trimmedLine.replace(/^[-•]\s+/, '');
        if (!inBulletList) {
          newLines.push('<ul class="list-disc pl-5 my-2">');
          inBulletList = true;
        }
        newLines.push(`<li>${bulletContent}</li>`);
      } 
      // Lignes de liste numérotée
      else if (trimmedLine.match(/^\d+\.\s+.*/)) {
        const numContent = trimmedLine.replace(/^\d+\.\s+/, '');
        const num = trimmedLine.match(/^(\d+)\./)?.[1] || '1';
        if (!inNumberedList) {
          newLines.push('<ol class="list-decimal pl-5 my-2">');
          inNumberedList = true;
        }
        newLines.push(`<li value="${num}">${numContent}</li>`);
      }
      // Autres lignes
      else {
        // Fermer les listes ouvertes si nécessaire
        if (inBulletList) {
          newLines.push('</ul>');
          inBulletList = false;
        }
        if (inNumberedList) {
          newLines.push('</ol>');
          inNumberedList = false;
        }
        newLines.push(line);
      }
    }
    
    // Fermer les listes si elles sont toujours ouvertes à la fin
    if (inBulletList) {
      newLines.push('</ul>');
    }
    if (inNumberedList) {
      newLines.push('</ol>');
    }
    
    formattedContent = newLines.join('\n');
    formattedContent = formattedContent.replace(/(<li value=.*?<\/li>)(?:\s*\n\s*)?(<li value)/g, '$1$2');
    formattedContent = formattedContent.replace(/(<li value=.*?<\/li>)(\s*\n\s*)?([^<])/g, '$1</ol>$3');
    formattedContent = formattedContent.replace(/(?:^|\n)(<li value)/g, '\n<ol>$1');
    
    // Convertir les sauts de ligne simples en <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };
  
  // Déterminer la classe d'arrière-plan avec la palette officielle et des couleurs différentes pour chacun
  let bgColorClass = isUser 
    ? 'bg-[#006a9e] text-white' // Pantone 7469C pour l'utilisateur 
    : isSystem 
      ? 'bg-[#004a70] text-white' // Pantone 7469C plus foncé pour le système
      : 'bg-white text-[#061019]'; // Fond blanc et texte Pantone Black 6C pour les autres
  
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
              <AvatarFallback className="bg-white text-[#006a9e]">
                {message.sender === 'Système' ? 'SYS' : message.sender.split(' ').map(word => word[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`${bgColorClass} ${roundedClass} p-4 shadow-sm`}>
            {!isUser && message.sender && (
              <div className="flex items-center mb-2">
                <span className="font-semibold">{message.sender}</span>
                {message.senderRole && (
                  <span className="text-xs bg-white text-[#006a9e] px-2 py-0.5 rounded-full ml-2 border border-[#006a9e]">
                    {message.senderRole}
                  </span>
                )}
              </div>
            )}
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
            <div className={`text-xs mt-2 ${isUser ? 'text-white opacity-80' : isSystem ? 'text-white opacity-80' : 'text-[#061019] opacity-60'}`}>
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
              <AvatarFallback className="bg-white text-[#006a9e] border border-[#006a9e]">
                {additionalResponse.sender && additionalResponse.sender.split(' ').map(word => word[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="bg-white text-[#061019] rounded-xl p-3 shadow-sm border border-[#006a9e]">
              <div className="flex items-center mb-1">
                <span className="font-semibold">{additionalResponse.sender || 'Collègue'}</span>
                <span className="text-xs bg-white text-[#006a9e] px-2 py-0.5 rounded-full ml-2 border border-[#006a9e]">
                  {additionalResponse.senderRole || 'Expert'}
                </span>
              </div>
              <div className="text-sm">
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
  const [confidenceLevel, setConfidenceLevel] = useState(100);
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
      // Message d'introduction présentant le contexte, le rôle du joueur et la mission - format concis
      const introMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `**ALERTE DE CYBERSÉCURITÉ**

${userName || "RSSI"}, une situation critique requiert votre intervention immédiate.

**Date:** ${new Date().toLocaleDateString()}
**Rôle:** ${mission.userRole}

**CONTEXTE:**
${mission.scenario}

**OBJECTIFS:**
- ${mission.objectives.map(obj => obj.description).join('\n- ')}

Votre équipe attend vos instructions.`,
        sender: "Système",
        senderRole: "Briefing de mission",
        timestamp: Date.now()
      };
      
      // Message de présentation des contacts - format d'organigramme simplifié
      const contactMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `**STRUCTURE DE L'ÉQUIPE DE CRISE**

**Vous (${mission.userRole})** - Responsable principal de la gestion de crise
${mission.contacts.map(contact => {
  if (!contact || !contact.name) return '';
  const role = contact.role ? contact.role : '';
  const expertise = contact.expertise ? `(${contact.expertise})` : '';
  return `- **${contact.name}** - ${role} ${expertise}`;
}).filter(line => line !== '').join('\n')}

**Règles d'engagement:**
- Les membres sous votre supervision exécuteront vos ordres directs
- Mentionnez le nom d'un membre pour lui donner des instructions spécifiques
- Vos décisions affecteront votre niveau de confiance et votre réputation

**Conséquences possibles:**
- Mauvaises décisions: baisse de confiance, convocation par le conseil d'administration
- Bonnes décisions: renforcement de votre position, reconnaissance professionnelle`,
        sender: "Système",
        senderRole: "Briefing de mission",
        timestamp: Date.now() + 100
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
        if (!contact || !contact.name) continue;
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
          type: "objective_completed",
          importance: "medium",
          skillsImpacted: [{ 
            skillId, 
            gainedPoints,
            newLevel: Math.min(100, (mission.skillsProgress?.find(s => s.id === skillId)?.level || 0) + gainedPoints)
          }],
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
              content: `**MISSION TERMINÉE**

Félicitations ${userName || "Responsable"} ! Incident de cybersécurité résolu avec succès.

**RÉSULTATS:**
✅ Analyse complète des systèmes compromis
✅ Containment efficace de la menace
✅ Communication précise avec les parties prenantes
✅ Restauration des services impactés
✅ Implémentation de mesures préventives

Votre gestion coordonnée a permis de minimiser l'impact et de renforcer la posture de sécurité globale de l'organisation.

**OPTIONS:**
• Revoir cette mission
• Explorer d'autres scénarios
• Retourner à l'écran principal`,
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
                  <Button variant="ghost" size="icon" className="mr-3 text-[#006a9e] hover:text-[#006a9e]/90 hover:bg-[#006a9e]/10">
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
                    <Badge variant="outline" className="border-[#006a9e]/30 text-[#006a9e]">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {mission.duration}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:hidden">
                <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(true)} className="border-[#006a9e]/30 text-[#006a9e] hover:bg-[#006a9e]/10 hover:text-[#006a9e]">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="hidden md:block">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-600 mb-1">Progression</div>
                    <Progress value={progress} className="w-40 h-2" />
                  </div>
                  <div className="mr-4">
                    <div className="text-sm text-gray-600 mb-1">Niveau de confiance</div>
                    <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          confidenceLevel > 70 ? 'bg-[#006a9e]' : 
                          confidenceLevel > 40 ? 'bg-[#006a9e]/70' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${confidenceLevel}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className="ml-2 border-[#006a9e]/30 text-[#006a9e]">
                      {progress === 100 ? (
                        <span className="flex items-center text-[#006a9e]">
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
                            
                            // Ajuster le niveau de confiance en fonction de la qualité de la décision
                            if (option.score < 0) {
                              // Diminuer la confiance pour les mauvaises décisions
                              setConfidenceLevel(prevLevel => Math.max(0, prevLevel + option.score * 5));
                              
                              // Si le niveau de confiance devient trop bas, déclencher une convocation avec le conseil
                              if (confidenceLevel < 30) {
                                setTimeout(() => {
                                  const boardMessage: Message = {
                                    id: uuidv4(),
                                    role: "assistant",
                                    content: `**CONVOCATION DU CONSEIL D'ADMINISTRATION**
                                    
Le conseil d'administration de l'entreprise vous convoque d'urgence suite aux décisions prises pendant cette crise.

Votre gestion de la situation est remise en question et vos choix ont considérablement affecté la confiance que la direction place en vous.

Si votre niveau de confiance continue de baisser, votre poste pourrait être reconsidéré.`,
                                    sender: "Président du Conseil",
                                    senderRole: "Direction",
                                    timestamp: Date.now() + 1000
                                  };
                                  
                                  setMessages(prev => [...prev, boardMessage]);
                                }, 4000);
                              }
                            } else if (option.score > 0) {
                              // Augmenter légèrement la confiance pour les bonnes décisions
                              setConfidenceLevel(prevLevel => Math.min(100, prevLevel + option.score * 2));
                            }
                            
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
                          <div className="text-xs mt-1 text-[#006a9e]">Impact: +{option.score} points</div>
                        ) : option.score < 0 ? (
                          <div className="text-xs mt-1 text-[#006a9e]/80">Impact: {option.score} points</div>
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
                    className="border-[#006a9e]/30 text-[#006a9e] hover:bg-[#006a9e]/10 hover:text-[#006a9e]"
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
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006a9e] focus:border-transparent"
                  disabled={loading || showDecisionOptions}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !userInput.trim() || showDecisionOptions}
                  className="bg-[#006a9e] hover:bg-[#006a9e]/90"
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
                <TabsList className="w-full flex flex-wrap">
                  <TabsTrigger value="objectives" className="flex-1 min-w-[33%] flex items-center justify-center">
                    <ListTodo className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Objectifs</span>
                  </TabsTrigger>
                  <TabsTrigger value="brief" className="flex-1 min-w-[33%] flex items-center justify-center">
                    <FileCheck className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Briefing</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex-1 min-w-[33%] flex items-center justify-center">
                    <BarChart className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Compétences</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="objectives" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Objectifs de la mission</h3>
                  <div className="space-y-3">
                    {mission.objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          currentObjective > idx 
                            ? 'bg-[#006a9e] text-white' 
                            : currentObjective === idx 
                              ? 'bg-[#006a9e]/80 text-white'
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
                  <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Briefing</h3>
                  <div className="prose prose-sm">
                    <p className="text-gray-700 mb-4">{mission.scenario}</p>
                    
                    <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                    <div className="space-y-3">
                      {mission.contacts.map((contact, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-1">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-[#006a9e]/10 text-[#006a9e]">
                                {contact && contact.name ? contact.name.split(' ').map(word => word[0]).join('') : 'NC'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{contact && contact.name ? contact.name : 'Contact Non Défini'}</p>
                          </div>
                          <p className="text-sm text-gray-600">{contact && contact.role ? contact.role : 'Rôle non défini'}</p>
                          <p className="text-xs text-gray-500 mt-1">{contact && contact.expertise ? contact.expertise : 'Expertise non définie'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dashboard" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Tableau de bord des compétences</h3>
                  
                  {/* Résumé des compétences */}
                  <div className="bg-[#006a9e]/5 p-3 rounded-md mb-4">
                    <div className="flex items-center mb-2">
                      <Brain className="h-5 w-5 text-[#006a9e] mr-2" />
                      <h4 className="font-medium">Progression globale</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Développez vos compétences en cybersécurité en complétant les objectifs de la mission.</p>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-gray-500 text-right">{progress}% complété</p>
                  </div>
                  
                  {/* Jauge de confiance */}
                  <div className={`p-3 rounded-md mb-4 ${
                    confidenceLevel > 70 ? 'bg-[#006a9e]/5' : 
                    confidenceLevel > 30 ? 'bg-[#006a9e]/5' : 
                    'bg-red-50'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Shield className={`h-5 w-5 mr-2 ${
                        confidenceLevel > 70 ? 'text-[#006a9e]' : 
                        confidenceLevel > 30 ? 'text-[#006a9e]/70' : 
                        'text-red-500'
                      }`} />
                      <h4 className="font-medium">Niveau de confiance</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {confidenceLevel > 70 ? 'Excellente confiance de la direction et des équipes.' : 
                       confidenceLevel > 50 ? 'Bonne confiance générale, continuez sur cette voie.' :
                       confidenceLevel > 30 ? 'Niveau de confiance mitigé, améliorez vos décisions.' :
                       'Confiance très faible, votre position est menacée.'}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          confidenceLevel > 70 ? 'bg-[#006a9e]' : 
                          confidenceLevel > 40 ? 'bg-[#006a9e]/70' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${confidenceLevel}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{confidenceLevel}% confiance</p>
                  </div>
                  
                  {/* Liste des compétences avec leur progression */}
                  <div className="space-y-3">
                    {mission.skillsProgress?.map((skill, idx) => {
                      // Simule la progression des compétences en fonction de l'avancement de la mission
                      const skillLevel = Math.min(100, Math.round(progress * (0.5 + Math.random() * 0.5)));
                      
                      // Détermine la couleur de la barre de progression en fonction du niveau
                      let progressColor = "bg-[#006a9e]";  // Utilise notre couleur primaire Pantone 7469C
                      if (skillLevel < 30) progressColor = "bg-[#006a9e]/50";  
                      else if (skillLevel < 70) progressColor = "bg-[#006a9e]/80";
                      else if (skillLevel >= 90) progressColor = "bg-[#006a9e]/90";
                      
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
                              <SkillIcon className="h-4 w-4 text-[#006a9e]" />
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
                      <Award className="h-4 w-4 mr-2 text-[#006a9e]" />
                      Recommandations d'amélioration
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-[#006a9e] mt-0.5 flex-shrink-0" />
                        <span>Concentrez-vous sur l'analyse détaillée des systèmes compromis avant toute action</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-[#006a9e] mt-0.5 flex-shrink-0" />
                        <span>Améliorez votre communication avec les différentes parties prenantes</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-4 w-4 mr-2 text-[#006a9e] mt-0.5 flex-shrink-0" />
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
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-[#006a9e] hover:text-[#006a9e]/90 hover:bg-[#006a9e]/10">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <Tabs defaultValue="objectives" className="flex-1">
              <TabsList className="w-full flex flex-wrap">
                <TabsTrigger value="objectives" className="flex-1 min-w-[33%]">
                  <ListTodo className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden xs:inline">Objectifs</span>
                </TabsTrigger>
                <TabsTrigger value="brief" className="flex-1 min-w-[33%]">
                  <FileCheck className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden xs:inline">Briefing</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex-1 min-w-[33%]">
                  <BarChart className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden xs:inline">Compétences</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="objectives" className="pt-4 flex-1">
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{progress}% complété</p>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Objectifs de la mission</h3>
                <div className="space-y-3">
                  {mission.objectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        currentObjective > idx 
                          ? 'bg-[#006a9e] text-white' 
                          : currentObjective === idx 
                            ? 'bg-[#006a9e]/80 text-white'
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
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Briefing</h3>
                <div className="prose prose-sm">
                  <p className="text-gray-700 mb-4">{mission.scenario}</p>
                  
                  <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                  <div className="space-y-3">
                    {mission.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs bg-[#006a9e]/10 text-[#006a9e]">
                              {contact && contact.name ? contact.name.split(' ').map(word => word[0]).join('') : 'NC'}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{contact && contact.name ? contact.name : 'Contact Non Défini'}</p>
                        </div>
                        <p className="text-sm text-gray-600">{contact && contact.role ? contact.role : 'Rôle non défini'}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact && contact.expertise ? contact.expertise : 'Expertise non définie'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dashboard" className="pt-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Tableau de bord des compétences</h3>
                
                {/* Résumé des compétences */}
                <div className="bg-gradient-to-r from-[#006a9e]/5 to-[#006a9e]/10 p-4 rounded-md mb-4 border border-[#006a9e]/10">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#006a9e] p-2 rounded-full mr-3">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Progression globale</h4>
                      <p className="text-xs text-gray-600">Niveau de maîtrise cybersécurité</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 mt-1">
                    Développez vos compétences en cybersécurité en complétant les objectifs de mission et en prenant des décisions éclairées.
                  </p>
                  
                  {/* Progress bar with improved visuals */}
                  <div className="relative mb-1">
                    <Progress 
                      value={mission.skillsProgress ? calculateGlobalSkillProgress(mission.skillsProgress) : progress} 
                      className="h-3 rounded-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-md">
                        {mission.skillsProgress ? calculateGlobalSkillProgress(mission.skillsProgress) : progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Débutant</span>
                    <span>Intermédiaire</span>
                    <span>Expert</span>
                  </div>
                  
                  {/* Latest events */}
                  {mission.learningEvents && mission.learningEvents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#006a9e]/10">
                      <p className="text-xs font-medium text-gray-700 mb-2">Derniers apprentissages:</p>
                      <div className="space-y-1">
                        {mission.learningEvents.slice(-2).map((event, idx) => (
                          <div key={idx} className="flex items-start text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#006a9e] mt-1.5 mr-2 flex-shrink-0"></div>
                            <div className="text-gray-600">{event.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Liste des compétences avec leur progression - version améliorée */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {mission.skillsProgress?.map((skill, idx) => {
                    // Utilise le niveau réel des compétences au lieu de simuler
                    const skillLevel = skill.level || 0;
                    // Obtient le label texte du niveau
                    const skillLevelText = getSkillLevelLabel(skillLevel);
                    
                    // Détermine la couleur de la barre de progression en fonction du niveau
                    let progressColor = "bg-[#006a9e]";
                    if (skillLevel < 25) progressColor = "bg-[#006a9e]/40";
                    else if (skillLevel < 50) progressColor = "bg-[#006a9e]/70";
                    else if (skillLevel < 75) progressColor = "bg-[#006a9e]";
                    else progressColor = "bg-[#006a9e]";
                    
                    // Détermine l'icône en fonction de la catégorie de compétence
                    let SkillIcon = Shield;
                    if (skill.category === "technique") SkillIcon = Database;
                    else if (skill.category === "communication") SkillIcon = MessageCircle;
                    else if (skill.category === "analyse") SkillIcon = AlertTriangle;
                    else if (skill.category === "leadership") SkillIcon = Users;
                    else if (skill.category === "juridique") SkillIcon = FileCheck;
                    else if (skill.category === "gestion_crise") SkillIcon = Timer;
                    
                    // Vérifie si un badge est disponible pour cette compétence
                    const hasBadges = skill.badges && skill.badges.length > 0;
                    // Simule la possibilité d'un nouveau badge à obtenir
                    const canEarnBadge = skillLevel >= 25 && (!hasBadges || skillLevel >= 50);
                    
                    return (
                      <motion.div 
                        key={idx} 
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${progressColor} bg-opacity-10 mr-3`}>
                              <SkillIcon className={`h-5 w-5 ${progressColor.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{skill.name}</h4>
                              <p className="text-xs text-gray-500 capitalize">{skill.category.replace('_', ' ')}</p>
                            </div>
                          </div>
                          
                          {/* Badge ou niveau */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            skillLevel < 25 ? 'bg-[#006a9e]/5 text-[#006a9e]/80' : 
                            skillLevel < 50 ? 'bg-[#006a9e]/10 text-[#006a9e]' : 
                            skillLevel < 75 ? 'bg-[#006a9e]/15 text-[#006a9e]' : 
                            'bg-[#006a9e]/20 text-[#006a9e]'
                          }`}>
                            {skillLevelText}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3">{skill.description}</p>
                        
                        <div className="relative mb-1">
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div 
                              className={`${progressColor} h-2.5 rounded-full transition-all duration-500`}
                              style={{ width: `${skillLevel}%` }}
                            ></div>
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                            <span className="text-[10px] font-medium text-gray-700">{skillLevel}%</span>
                          </div>
                        </div>
                        
                        {/* Badges obtenus et à venir */}
                        {hasBadges && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                              <Award className="h-3 w-3 mr-1 text-[#006a9e]" />
                              Badges obtenus:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {skill.badges?.map((badge, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] bg-[#006a9e]/10 border-[#006a9e]/30 text-[#006a9e]">
                                  {badge.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Prochain badge à obtenir */}
                        {canEarnBadge && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <Target className="h-3 w-3 mr-1 text-[#006a9e]" />
                            <span>
                              {skillLevel < 25 ? "Prochain badge à 25%" : 
                               skillLevel < 50 ? "Prochain badge à 50%" : 
                               skillLevel < 75 ? "Prochain badge à 75%" : 
                               "Badge ultime à 100%"}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Section des recommandations personnalisées */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 mt-4 mb-8">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-[#006a9e]" />
                    Recommandations d'amélioration personnalisées
                  </h4>
                  
                  <div className="space-y-3">
                    {mission.skillsProgress?.slice(0, 3).map((skill, idx) => {
                      // Obtient les recommandations pour cette compétence
                      const recommendations = getSkillsRecommendations(skill).slice(0, 2);
                      return (
                        <div key={idx} className="bg-white rounded-md p-3 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              skill.level < 30 ? 'bg-[#006a9e]/50' : 
                              skill.level < 60 ? 'bg-[#006a9e]' : 
                              'bg-[#006a9e]'
                            }`}></div>
                            <p className="font-medium text-sm text-gray-900">{skill.name}</p>
                          </div>
                          <ul className="space-y-1.5">
                            {recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <Target className="h-3 w-3 mr-1.5 text-[#006a9e] mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Événements d'apprentissage */}
                  {mission.learningEvents && mission.learningEvents.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-medium mb-2 flex items-center">
                        <LineChart className="h-4 w-4 mr-1.5 text-[#006a9e]" />
                        Historique de progression
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {mission.learningEvents.slice().reverse().map((event, idx) => (
                          <div key={idx} className="bg-white/60 p-2 rounded border border-gray-100 text-xs">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900">{event.description}</p>
                              <span className="text-gray-500 whitespace-nowrap ml-2">
                                {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              {event.skillsImpacted.map((impact, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] bg-[#006a9e]/10 border-[#006a9e]/30 text-[#006a9e]">
                                  +{impact.gainedPoints} points
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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