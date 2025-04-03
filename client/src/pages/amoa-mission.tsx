import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ArrowLeft,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  FileText,
  Info,
  MessageSquare,
  PieChart,
  Send,
  Tag,
  ThumbsDown,
  ThumbsUp,
  User,
  UserRound,
  Users
} from 'lucide-react';
import { useAmoaContext } from '../contexts/AmoaContext';
import { AmoaMessage, DecisionOption, AmoaDecision, Stakeholder, AmoaDocument, AmoaSkill } from '../../shared/types/amoa';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface DecisionCardProps {
  decision: AmoaDecision;
  onMakeChoice: (decisionId: string, choiceId: string) => void;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onMakeChoice }) => {
  return (
    <Card className="my-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-orange-800">
          <CircleAlert className="h-5 w-5 inline-block mr-2" />
          Décision à prendre
        </CardTitle>
        <CardDescription className="text-orange-700">
          {decision.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{decision.context}</p>
        <div className="space-y-3">
          {decision.options.map((option) => (
            <div 
              key={option.id}
              className="border rounded-md p-3 hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => onMakeChoice(decision.id, option.id)}
            >
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-white border border-orange-300 flex items-center justify-center mr-3 mt-0.5">
                  <ChevronRight className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{option.text}</p>
                  {option.consequences && (
                    <p className="text-sm text-gray-500 mt-1">{option.consequences}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MessageItem = ({ message, isUser }: { message: AmoaMessage; isUser: boolean }) => {
  const messageClass = isUser 
    ? "bg-blue-600 text-white rounded-xl rounded-tr-none self-end ml-12"
    : "bg-gray-100 text-gray-800 rounded-xl rounded-tl-none self-start mr-12";
  
  const senderInfo = !isUser && message.sender && message.senderRole && (
    <div className="flex items-center mb-1">
      <span className="font-medium text-sm">{message.sender}</span>
      <span className="mx-1 text-xs text-gray-500">•</span>
      <span className="text-xs text-gray-500">{message.senderRole}</span>
    </div>
  );
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`p-4 max-w-[85%] ${messageClass}`}>
        {senderInfo}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <div className="text-xs mt-2 opacity-70 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
};

const StakeholderInfo = ({ stakeholder }: { stakeholder: Stakeholder }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md">{stakeholder.name}</CardTitle>
            <CardDescription className="text-xs">{stakeholder.role}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              stakeholder.availabilityLevel === 'haute'
                ? 'bg-green-50 text-green-700 border-green-200'
                : stakeholder.availabilityLevel === 'moyenne'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            Disponibilité {stakeholder.availabilityLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Département:</span> {stakeholder.department}
        </div>
        <div className="text-xs text-gray-500 mb-3">
          <span className="font-medium">Personnalité:</span> {stakeholder.personality}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Priorités:</p>
            <div className="flex flex-wrap gap-1">
              {stakeholder.priorities.map((priority, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Expertise:</p>
            <div className="flex flex-wrap gap-1">
              {stakeholder.expertise.map((exp, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DocumentItem = ({ document }: { document: AmoaDocument }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-4">
      <Accordion type="single" collapsible>
        <AccordionItem value={document.id} className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center text-left">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="font-medium text-sm">{document.title}</p>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <span>{document.author}</span>
                  <span className="mx-1">•</span>
                  <span>v{document.version}</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-[10px] py-0 ${
                      document.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      document.status === 'review' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      document.status === 'draft' ? 'bg-gray-50 text-gray-700 border-gray-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {document.status}
                  </Badge>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="markdown prose-sm max-w-none border-t pt-3 mt-2">
              <div className="whitespace-pre-wrap">{document.content}</div>
            </div>
            
            {document.comments && document.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-700 mb-2">Commentaires ({document.comments.length}):</p>
                <div className="space-y-2">
                  {document.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-2 rounded-md text-xs border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const SkillItem = ({ skill }: { skill: AmoaSkill }) => {
  const getProgressColor = (level: number) => {
    if (level < 25) return 'bg-red-500';
    if (level < 50) return 'bg-yellow-500';
    if (level < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{skill.name}</span>
        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
          {skill.level}/100
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getProgressColor(skill.level)} transition-all duration-300`} 
          style={{width: `${skill.level}%`}}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
    </div>
  );
};

export default function AmoaMission() {
  const { 
    userName, 
    userRole, 
    currentScenario, 
    messages, 
    addMessage, 
    progress,
    updateScenarioProgress,
    recordDecision,
    addLearningEvent
  } = useAmoaContext();
  
  const [_, setLocation] = useLocation();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDecision, setActiveDecision] = useState<AmoaDecision | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeDecision]);
  
  useEffect(() => {
    if (currentScenario && currentScenario.decisions) {
      // Check if a decision is available based on progress or other criteria
      const pendingDecision = currentScenario.decisions.find(d => !d.selectedOption);
      if (pendingDecision && messages.length > 3 && !activeDecision) {
        setActiveDecision(pendingDecision);
      }
    }
  }, [currentScenario, messages]);
  
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentScenario) return;
    
    const userMessage: AmoaMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/amoa/chat', {
        userMessage: inputMessage,
        scenarioId: currentScenario.id,
        scenarioContext: currentScenario,
        currentPhase: currentScenario.currentPhase,
        previousMessages: messages.slice(-10), // Send last 10 messages for context
      });
      
      const data = response.data;
      
      // Add assistant response
      const assistantMessage: AmoaMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sender: data.sender,
        senderRole: data.senderRole
      };
      
      addMessage(assistantMessage);
      
      // Check if there's an additional response from another stakeholder
      if (data.additionalResponse) {
        setTimeout(() => {
          const additionalMessage: AmoaMessage = {
            role: 'assistant',
            content: data.additionalResponse.response,
            timestamp: new Date().toISOString(),
            sender: data.additionalResponse.sender,
            senderRole: data.additionalResponse.senderRole
          };
          
          addMessage(additionalMessage);
        }, 1500); // Wait a short while before showing the additional response
      }
      
      // Check if a decision is needed
      if (data.decision && !activeDecision) {
        setTimeout(() => {
          setActiveDecision(data.decision);
        }, 2000);
      }
      
      // Award a small skill gain for interaction
      const randomSkill = currentScenario.skillsProgress?.[Math.floor(Math.random() * currentScenario.skillsProgress.length)];
      if (randomSkill) {
        addLearningEvent(
          `Communication avec ${data.sender} sur le sujet "${inputMessage.substring(0, 30)}..."`,
          randomSkill.id,
          1
        );
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Add an error message
      const errorMessage: AmoaMessage = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de la communication avec le serveur. Veuillez réessayer.",
        timestamp: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecisionChoice = async (decisionId: string, choiceId: string) => {
    if (!currentScenario) return;
    
    setActiveDecision(null);
    setIsLoading(true);
    
    // Add user decision message
    const selectedOption = activeDecision?.options.find(o => o.id === choiceId);
    if (selectedOption) {
      const decisionMessage: AmoaMessage = {
        role: 'user',
        content: `[Décision] J'ai choisi: ${selectedOption.text}`,
        timestamp: new Date().toISOString()
      };
      
      addMessage(decisionMessage);
    }
    
    try {
      const response = await axios.post('/api/amoa/evaluate-decision', {
        scenarioId: currentScenario.id,
        scenarioContext: currentScenario,
        decisionId,
        choiceId,
        currentPhase: currentScenario.currentPhase,
        userRole
      });
      
      const data = response.data;
      
      // Add evaluation response
      const evaluationMessage: AmoaMessage = {
        role: 'assistant',
        content: data.evaluation,
        timestamp: new Date().toISOString(),
        sender: data.evaluator,
        senderRole: data.evaluatorRole
      };
      
      addMessage(evaluationMessage);
      
      // Record decision outcome
      recordDecision(decisionId, choiceId, data.evaluation);
      
      // Update progress if the scenario was updated
      if (data.updatedScenario) {
        updateScenarioProgress(
          data.updatedScenario.currentPhase,
          data.updatedScenario.progress || 0
        );
      }
      
      // Add impact feedback message
      setTimeout(() => {
        let impactMessage = "**Impact de votre décision:**\n\n";
        
        if (data.impact.positive.length > 0) {
          impactMessage += "✅ Points positifs:\n";
          data.impact.positive.forEach((item: string) => {
            impactMessage += `- ${item}\n`;
          });
          impactMessage += "\n";
        }
        
        if (data.impact.negative.length > 0) {
          impactMessage += "⚠️ Points d'attention:\n";
          data.impact.negative.forEach((item: string) => {
            impactMessage += `- ${item}\n`;
          });
        }
        
        const impactAssistantMessage: AmoaMessage = {
          role: 'assistant',
          content: impactMessage,
          timestamp: new Date().toISOString(),
          sender: 'Système',
          senderRole: 'Analyse d\'impact'
        };
        
        addMessage(impactAssistantMessage);
      }, 1500);
      
    } catch (error) {
      console.error("Error evaluating decision:", error);
      const errorMessage: AmoaMessage = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de l'évaluation de votre décision. Veuillez réessayer.",
        timestamp: new Date().toISOString()
      };
      
      addMessage(errorMessage);
      setActiveDecision(activeDecision); // Restore the decision to allow retrying
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aucun scénario sélectionné</h1>
          <Button onClick={() => setLocation('/amoa')}>Retour à la sélection</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="p-2 mr-2"
              onClick={() => setLocation('/amoa')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentScenario.title}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <Badge className="mr-2 bg-emerald-100 text-emerald-800">
                  {currentScenario.currentPhase.replace('_', ' ')}
                </Badge>
                <span>Progression: {progress}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              {currentScenario.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              {currentScenario.businessDomain}
            </Badge>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow flex lg:flex-row flex-col overflow-hidden">
        {/* Left Sidebar - Information Panel */}
        <div className="lg:w-80 w-full shrink-0 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="profile">
                  <UserRound className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="stakeholders">
                  <Users className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="skills">
                  <Brain className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Votre profil</CardTitle>
                    <CardDescription>Informations sur votre rôle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                        <p className="font-medium">{userName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Rôle</h3>
                        <p className="font-medium">{userRole}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Objectifs actuels</h3>
                        <ul className="mt-2 space-y-2">
                          {currentScenario.objectives
                            .filter(obj => !obj.completed)
                            .map((obj, i) => (
                              <li key={obj.id} className="flex items-start">
                                <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 rounded-full w-5 h-5 text-xs font-medium mr-2 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="text-sm">{obj.description}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle>Progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <span className="text-2xl font-bold text-emerald-600">
                          {currentScenario.objectives.filter(obj => obj.completed).length}
                        </span>
                        <p className="text-xs text-gray-500">Objectifs complétés</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <span className="text-2xl font-bold text-purple-600">
                          {currentScenario.objectives.length}
                        </span>
                        <p className="text-xs text-gray-500">Objectifs totaux</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stakeholders" className="mt-0 space-y-4">
                <h3 className="font-semibold text-gray-700">Parties prenantes</h3>
                <div className="space-y-4">
                  {currentScenario.stakeholders.map((stakeholder) => (
                    <StakeholderInfo key={stakeholder.id} stakeholder={stakeholder} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-0">
                <h3 className="font-semibold text-gray-700 mb-4">Compétences</h3>
                {currentScenario.skillsProgress ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Vos compétences</h4>
                      {currentScenario.skillsProgress.map((skill) => (
                        <SkillItem key={skill.id} skill={skill} />
                      ))}
                    </div>
                    {currentScenario.learningEvents && currentScenario.learningEvents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Événements d'apprentissage récents</h4>
                        <div className="space-y-2">
                          {currentScenario.learningEvents.slice(-5).reverse().map((event) => (
                            <div key={event.id} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                              <p className="text-sm text-gray-800">{event.description}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <PieChart className="h-3 w-3 mr-1" />
                                <span>+{event.skillsImpacted.map(s => s.gainedPoints).reduce((a, b) => a + b, 0)} points</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune compétence disponible pour ce scénario.</p>
                )}
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <h3 className="font-semibold text-gray-700 mb-4">Documents du projet</h3>
                <div className="space-y-1">
                  {currentScenario.documents.map((document) => (
                    <DocumentItem key={document.id} document={document} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col lg:max-h-screen overflow-hidden">
          {/* Messages Container */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {messages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  message={message} 
                  isUser={message.role === 'user'} 
                />
              ))}
              
              {activeDecision && (
                <DecisionCard
                  decision={activeDecision}
                  onMakeChoice={handleDecisionChoice}
                />
              )}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-800 rounded-xl p-4 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="max-w-3xl mx-auto flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Tapez votre message..."
                className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading || !!activeDecision}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !!activeDecision}
                className="rounded-l-none bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile info button */}
            <div className="lg:hidden flex justify-center mt-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    Afficher les informations du projet
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Informations du projet</SheetTitle>
                    <SheetDescription>
                      Consultez les détails du scénario en cours
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 overflow-y-auto h-full pb-20">
                    <Tabs defaultValue="profile">
                      <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="profile">
                          <UserRound className="h-5 w-5" />
                        </TabsTrigger>
                        <TabsTrigger value="stakeholders">
                          <Users className="h-5 w-5" />
                        </TabsTrigger>
                        <TabsTrigger value="skills">
                          <Brain className="h-5 w-5" />
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                          <FileText className="h-5 w-5" />
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="profile" className="mt-0">
                        <Card>
                          <CardHeader>
                            <CardTitle>Votre profil</CardTitle>
                            <CardDescription>Informations sur votre rôle</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                                <p className="font-medium">{userName}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Rôle</h3>
                                <p className="font-medium">{userRole}</p>
                              </div>
                              <Separator />
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Objectifs actuels</h3>
                                <ul className="mt-2 space-y-2">
                                  {currentScenario.objectives
                                    .filter(obj => !obj.completed)
                                    .map((obj, i) => (
                                      <li key={obj.id} className="flex items-start">
                                        <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 rounded-full w-5 h-5 text-xs font-medium mr-2 mt-0.5">
                                          {i + 1}
                                        </span>
                                        <span className="text-sm">{obj.description}</span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="stakeholders" className="mt-0 space-y-4">
                        <h3 className="font-semibold text-gray-700">Parties prenantes</h3>
                        <div className="space-y-4">
                          {currentScenario.stakeholders.map((stakeholder) => (
                            <StakeholderInfo key={stakeholder.id} stakeholder={stakeholder} />
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="skills" className="mt-0">
                        <h3 className="font-semibold text-gray-700 mb-4">Compétences</h3>
                        {currentScenario.skillsProgress ? (
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-3">Vos compétences</h4>
                              {currentScenario.skillsProgress.map((skill) => (
                                <SkillItem key={skill.id} skill={skill} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">Aucune compétence disponible pour ce scénario.</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="documents" className="mt-0">
                        <h3 className="font-semibold text-gray-700 mb-4">Documents du projet</h3>
                        <div className="space-y-1">
                          {currentScenario.documents.map((document) => (
                            <DocumentItem key={document.id} document={document} />
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}