import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, HelpCircle, Trophy, Terminal, Lock, Puzzle } from 'lucide-react';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import ChatInterface from '@/components/cyber/ChatInterface';

interface CryptoChallenge {
  id: string;
  title: string;
  description: string;
  hint: string;
  input: string;
  solution: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  type: 'cipher' | 'riddle' | 'code';
}

interface ArcadeMissionProps {
  title: string;
  description: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  badgeId?: string;
  badgeName?: string;
  domain: string;
  onComplete?: () => void;
}

export default function ArcadeMission({
  title,
  description,
  contactName,
  contactRole,
  contactAvatar,
  badgeId,
  badgeName,
  domain,
  onComplete
}: ArcadeMissionProps) {
  const [currentTab, setCurrentTab] = useState<'challenge' | 'hint' | 'assistant'>('challenge');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const [challenges] = useState<CryptoChallenge[]>([
    {
      id: 'challenge-1',
      title: 'Le message codé',
      description: 'Ce message a été codé avec un décalage simple (chiffre de César). Pouvez-vous le déchiffrer ?',
      hint: 'Dans un chiffre de César, chaque lettre est remplacée par une lettre située X positions plus loin dans l\'alphabet. Ici, X=3.',
      input: 'shxw oh phvvdjh d od guk',
      solution: 'peut le message a la drh',
      difficulty: 'Débutant',
      type: 'cipher'
    },
    {
      id: 'challenge-2',
      title: 'Le mot de passe caché',
      description: 'Résolvez cette énigme pour trouver le mot de passe du système :',
      hint: 'Combinez les premières lettres de chaque mot dans la phrase pour former le mot de passe.',
      input: 'Sécurité Et Confidentialité Utilisent Rapidement Internet Tandis que Expertise',
      solution: 'securite',
      difficulty: 'Intermédiaire',
      type: 'riddle'
    },
    {
      id: 'challenge-3',
      title: 'Le système binaire',
      description: 'Convertissez ce message binaire en texte :',
      hint: 'Chaque groupe de 8 bits représente un caractère ASCII.',
      input: '01100001 01100011 01100011 01100101 01110011',
      solution: 'acces',
      difficulty: 'Intermédiaire',
      type: 'code'
    }
  ]);

  const currentChallenge = challenges[currentChallengeIndex];

  useEffect(() => {
    setProgress(Math.round((currentChallengeIndex / challenges.length) * 100));
  }, [currentChallengeIndex, challenges.length]);

  const checkAnswer = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedSolution = currentChallenge.solution.trim().toLowerCase();
    
    if (normalizedInput === normalizedSolution) {
      setFeedback('success');
      
      // Si c'est le dernier défi, compléter la mission
      if (currentChallengeIndex === challenges.length - 1) {
        setChallengeComplete(true);
        setBadgeEarned(true);
      }
    } else {
      setFeedback('error');
    }
  };

  const nextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
      setShowHint(false);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch(type) {
      case 'cipher': return <Puzzle className="h-5 w-5" />;
      case 'riddle': return <HelpCircle className="h-5 w-5" />;
      case 'code': return <Terminal className="h-5 w-5" />;
      default: return <Puzzle className="h-5 w-5" />;
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">
          Mission Arcade
        </Badge>
      </div>
      
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Défi {currentChallengeIndex + 1} sur {challenges.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
      </div>

      {!challengeComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="challenge" value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="challenge">Défi</TabsTrigger>
                <TabsTrigger value="hint" disabled={currentChallengeIndex > 0 && !showHint}>Indice</TabsTrigger>
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="challenge" className="p-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{currentChallenge.title}</CardTitle>
                      <Badge variant={
                        currentChallenge.difficulty === 'Débutant' ? 'default' : 
                        currentChallenge.difficulty === 'Intermédiaire' ? 'secondary' : 'destructive'
                      } className="ml-2">
                        {getChallengeIcon(currentChallenge.type)}
                        <span className="ml-1">{currentChallenge.difficulty}</span>
                      </Badge>
                    </div>
                    <CardDescription>{currentChallenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg mb-4 font-mono break-all">
                      {currentChallenge.input}
                    </div>
                    
                    <div className="space-y-4">
                      <Input
                        placeholder="Entrez votre réponse..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={feedback === 'success'}
                      />
                      
                      {feedback === 'success' && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Bravo ! Vous avez résolu ce défi.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {feedback === 'error' && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            Réponse incorrecte. Essayez à nouveau ou consultez l'indice.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {!showHint && feedback !== 'success' && (
                      <Button variant="outline" onClick={() => {
                        setShowHint(true);
                        setCurrentTab('hint');
                      }}>
                        Voir l'indice
                      </Button>
                    )}
                    {showHint && feedback !== 'success' && (
                      <Button variant="ghost" disabled>
                        Indice utilisé
                      </Button>
                    )}
                    {feedback === 'success' ? (
                      <Button onClick={nextChallenge}>
                        {currentChallengeIndex < challenges.length - 1 ? 'Défi suivant' : 'Terminer'}
                      </Button>
                    ) : (
                      <Button onClick={checkAnswer} disabled={!userInput.trim()}>
                        Vérifier
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="hint" className="p-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Indice</CardTitle>
                    <CardDescription>Utilisez cet indice pour vous aider à résoudre le défi.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="flex gap-2">
                        <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <p>{currentChallenge.hint}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setCurrentTab('challenge')}>
                      Retour au défi
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="assistant" className="p-0 h-[600px]">
                <ChatInterface 
                  contactName={contactName}
                  contactRole={contactRole}
                  contactAvatar={contactAvatar}
                  userAvatar="avatar1"
                  userName="Agent"
                  userRole="Apprenant"
                  initialMessage={`Je suis là pour vous aider avec le défi "${currentChallenge.title}". Comment puis-je vous guider sans vous donner directement la réponse ?`}
                  height="h-[600px]"
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <div 
                      key={challenge.id}
                      className={`flex items-center p-3 rounded-lg ${
                        index === currentChallengeIndex
                          ? 'bg-muted border border-primary'
                          : index < currentChallengeIndex
                          ? 'bg-green-50'
                          : 'bg-muted/30'
                      }`}
                    >
                      {index < currentChallengeIndex ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      ) : index === currentChallengeIndex ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary mr-3" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground mr-3" />
                      )}
                      <div>
                        <p className={`font-medium ${index > currentChallengeIndex ? 'text-muted-foreground' : ''}`}>
                          {challenge.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {challenge.difficulty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {badgeId && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <h3 className="font-semibold">Badge à gagner</h3>
                    </div>
                    <p className="text-sm">
                      Complétez tous les défis pour gagner le badge <strong>{badgeName || badgeId}</strong>.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Mission accomplie !</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
              <p className="mb-4">
                Vous avez résolu tous les défis de la mission "{title}".
                {badgeEarned && badgeId && (
                  <span> Vous avez gagné le badge <strong>{badgeName || badgeId}</strong> !</span>
                )}
              </p>
              
              {badgeEarned && badgeId && (
                <Badge className="mx-auto" variant="outline">
                  <Trophy className="h-3 w-3 mr-1" /> {badgeName || badgeId}
                </Badge>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AvatarDisplay avatarId={contactAvatar} size="lg" />
                <div>
                  <p className="font-medium">{contactName}</p>
                  <p className="text-sm text-muted-foreground">{contactRole}</p>
                  <p className="mt-2">
                    "Excellent travail ! Vous avez fait preuve d'esprit d'analyse et de persévérance pour résoudre ces défis cryptographiques. Ces compétences sont essentielles dans le domaine de la cybersécurité."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={onComplete}>Terminer la mission</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}