import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowLeft, ArrowRight, Send, Star } from 'lucide-react';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import ConversationChoices from './ConversationChoices';
import { getBestPracticeById } from '../data/best-practices';

const ConversationPanel: React.FC = () => {
  const { 
    currentCharacter, 
    currentConversation, 
    selectConversation,
    addSecurityPoints,
    deductPoints,
    completeChallenge,
    isChallengeCompleted,
    selectCharacter,
    isGameOver
  } = useGame();
  
  const [userInput, setUserInput] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [showExplanation, setShowExplanation] = useState(false);
  
  if (!currentCharacter) return null;
  
  // Récupérer la conversation active
  const conversation = currentConversation 
    ? currentCharacter.conversations[currentConversation] 
    : null;
  
  // Récupérer les défis de la conversation active
  const challenges = conversation?.challenges || [];
  
  // Récupérer les conversations disponibles
  const availableConversations = Object.keys(currentCharacter.conversations).filter(
    convoId => convoId !== 'introduction'
  );
  
  // Gérer la soumission d'une réponse
  const handleSubmitAnswer = (challengeId: string, correctAnswer: string | number) => {
    if (selectedAnswer === -1) return;
    
    // Trouver le défi actuel
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    // Vérifier si la réponse est correcte
    // Si correctAnswer est -1, toutes les réponses sont acceptées
    const isCorrect = correctAnswer === -1 || selectedAnswer === correctAnswer;
    
    if (isCorrect) {
      completeChallenge(challengeId, true);
      addSecurityPoints(challenge.points, `Défi réussi : ${challenge.question}`);
      toast({
        title: "Challenge réussi !",
        description: `+${challenge.points} points de sécurité`,
        variant: "default",
      });
    } else {
      completeChallenge(challengeId, false);
      // Déduire des points en cas de mauvaise réponse (la moitié des points du challenge)
      const penaltyPoints = Math.ceil(challenge.points / 2);
      deductPoints(penaltyPoints, `Mauvaise réponse au défi : ${challenge.question}`);
      toast({
        title: "Réponse incorrecte",
        description: `-${penaltyPoints} points de sécurité`,
        variant: "destructive",
      });
    }
    
    setShowExplanation(true);
  };
  
  // Choisir une autre conversation
  const changeConversation = (convoId: string) => {
    setSelectedAnswer(-1);
    setShowExplanation(false);
    selectConversation(convoId);
  };
  
  // Formater l'horodatage
  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="h-full bg-blue-900/20 border-blue-800 shadow-lg">
      <CardHeader className="bg-blue-900/40 border-b border-blue-800 flex flex-row items-center space-x-3 py-3 px-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-blue-800/50 h-8 w-8 flex-shrink-0"
          onClick={() => selectCharacter(null)}
          disabled={isGameOver}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 flex-shrink-0 border border-blue-700">
          <AvatarImage src={currentCharacter.avatar} alt={currentCharacter.name} />
          <AvatarFallback>
            {currentCharacter.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate">{currentCharacter.name}</CardTitle>
          <CardDescription className="text-sm text-blue-300 truncate">
            {currentCharacter.role}
          </CardDescription>
        </div>
        <Badge 
          className={`flex-shrink-0 ${
            isGameOver ? 'bg-red-600' :
            currentCharacter.status === 'online' 
              ? 'bg-green-600' 
              : currentCharacter.status === 'away' 
                ? 'bg-yellow-600' 
                : 'bg-gray-600'
          }`}
        >
          {isGameOver ? 'Terminé' :
           currentCharacter.status === 'online' 
            ? 'En ligne' 
            : currentCharacter.status === 'away' 
              ? 'Absent' 
              : 'Hors ligne'
          }
        </Badge>
      </CardHeader>
      
      <Tabs defaultValue="messages" className="h-[calc(100%-64px)]">
        <TabsList className="grid grid-cols-2 bg-blue-900/40 border-b border-blue-800 rounded-none">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="topics">Sujets ({availableConversations.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="messages" 
          className="flex flex-col h-[calc(100%-42px)] margin-0 data-[state=inactive]:hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation?.messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start ${
                  message.sender === 'character' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.sender === 'character' && (
                  <Avatar className="h-8 w-8 mr-2 mt-0.5">
                    <AvatarImage src={currentCharacter.avatar} alt={currentCharacter.name} />
                    <AvatarFallback>
                      {currentCharacter.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.sender === 'character' 
                      ? 'bg-blue-800/50 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {message.timestamp || formatTimestamp()}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Afficher les choix de la conversation s'ils existent */}
            {conversation?.choices && conversation.choices.length > 0 && (
              <ConversationChoices 
                choices={conversation.choices} 
                conversationId={currentConversation}
                onChoiceMade={() => setShowExplanation(true)}
              />
            )}
            
            {/* Afficher les défis de la conversation s'ils existent */}
            {!showExplanation && challenges.length > 0 && !isChallengeCompleted(challenges[0].id) && (
              <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-700">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Défi de cybersécurité
                </h3>
                
                <p className="text-sm mb-4">{challenges[0].question}</p>
                
                {challenges[0].options ? (
                  <RadioGroup 
                    value={selectedAnswer.toString()} 
                    onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                    className="space-y-2"
                  >
                    {challenges[0].options.map((option, idx) => (
                      <div className="flex items-center space-x-2" key={idx}>
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="text-sm cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input 
                    placeholder="Votre réponse..." 
                    className="mb-3" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                )}
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleSubmitAnswer(
                      challenges[0].id, 
                      challenges[0].correctAnswer ?? -1
                    )}
                    disabled={selectedAnswer === -1}
                  >
                    Répondre
                  </Button>
                </div>
              </div>
            )}
            
            {showExplanation && challenges.length > 0 && (
              <Alert className="bg-blue-700/30 border-blue-600">
                <AlertTitle>Explication</AlertTitle>
                <AlertDescription>
                  {challenges[0].explanation}
                </AlertDescription>
              </Alert>
            )}

            {/* Afficher les bonnes pratiques découvertes si elles existent */}
            {showExplanation && conversation?.bestPracticeIds && conversation.bestPracticeIds.length > 0 && (
              <Alert className="bg-green-700/30 border-green-600">
                <AlertTitle className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Bonnes pratiques découvertes
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  {conversation.bestPracticeIds.map(id => {
                    const practice = getBestPracticeById(id);
                    return practice ? (
                      <div key={id} className="p-2 rounded bg-green-800/30">
                        <h4 className="font-medium text-sm">{practice.title}</h4>
                        <p className="text-xs opacity-90">{practice.description}</p>
                      </div>
                    ) : null;
                  })}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <CardFooter className="border-t border-blue-800 p-3">
            <Input 
              placeholder="Taper un message..." 
              className="mr-2" 
              disabled={true}
            />
            <Button size="icon" disabled={true}>
              <Send className="h-4 w-4" />
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent 
          value="topics" 
          className="h-[calc(100%-42px)] overflow-y-auto p-4 data-[state=inactive]:hidden"
        >
          <div className="grid gap-3">
            {availableConversations.map(convoId => (
              <Card 
                key={convoId} 
                className="cursor-pointer bg-blue-800/30 hover:bg-blue-800/50 border-blue-700"
                onClick={() => changeConversation(convoId)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">
                    {convoId.replace(/-/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm line-clamp-2 text-blue-200">
                    {currentCharacter.conversations[convoId].messages[0].content}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs py-0 px-2 h-6"
                  >
                    Discuter <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ConversationPanel;