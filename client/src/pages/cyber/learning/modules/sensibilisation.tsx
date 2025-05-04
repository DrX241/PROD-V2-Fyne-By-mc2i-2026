
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Brain, Target, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import { useTheme } from '@/contexts/ThemeContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'simulation' | 'puzzle';
  content: {
    question?: string;
    options?: string[];
    correctAnswer?: string;
    scenario?: string;
    solution?: string;
  };
  points: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  completed: boolean;
  unlocked: boolean;
}

export default function SensibilisationGame() {
  const { isDark } = useTheme();
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [playerBadges, setPlayerBadges] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const challenges: Challenge[] = [
    {
      id: 'phishing-detection',
      title: 'Détection de Phishing',
      description: 'Apprenez à identifier les emails malveillants',
      type: 'quiz',
      content: {
        question: 'Parmi ces signes, lequel n\'est PAS un indicateur de phishing ?',
        options: [
          'Un email demandant vos identifiants bancaires',
          'Un message provenant de votre supérieur direct avec son adresse email habituelle',
          'Une urgence pour effectuer un paiement immédiat',
          'Des fautes d\'orthographe dans l\'email'
        ],
        correctAnswer: 'Un message provenant de votre supérieur direct avec son adresse email habituelle'
      },
      points: 100,
      difficulty: 'Facile',
      completed: false,
      unlocked: true
    },
    {
      id: 'password-security',
      title: 'Sécurité des Mots de Passe',
      description: 'Créez et gérez des mots de passe forts',
      type: 'quiz',
      content: {
        question: 'Quelle est la meilleure pratique pour les mots de passe ?',
        options: [
          'Utiliser le même mot de passe partout pour s\'en souvenir',
          'Utiliser un gestionnaire de mots de passe avec MFA',
          'Noter ses mots de passe dans un fichier texte',
          'Changer ses mots de passe tous les jours'
        ],
        correctAnswer: 'Utiliser un gestionnaire de mots de passe avec MFA'
      },
      points: 150,
      difficulty: 'Moyen',
      completed: false,
      unlocked: true
    },
    {
      id: 'social-engineering',
      title: 'Ingénierie Sociale',
      description: 'Reconnaître et contrer les tentatives de manipulation',
      type: 'simulation',
      content: {
        scenario: 'Un collègue inconnu vous appelle en urgence demandant vos identifiants système pour résoudre un problème critique.',
        solution: 'Refuser poliment et rediriger vers le support IT officiel'
      },
      points: 200,
      difficulty: 'Difficile',
      completed: false,
      unlocked: false
    }
  ];

  const handleChallengeStart = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setShowFeedback(false);
  };

  const handleAnswer = (answer: string) => {
    if (!currentChallenge) return;
    
    const correct = answer === currentChallenge.content.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setPlayerPoints(prev => prev + currentChallenge.points);
      const updatedBadges = [...playerBadges];
      if (!updatedBadges.includes(currentChallenge.title)) {
        updatedBadges.push(currentChallenge.title);
      }
      setPlayerBadges(updatedBadges);
    }
  };

  return (
    <HomeLayout>
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* HUD du joueur */}
        <div className="fixed top-0 w-full bg-gradient-to-b from-black/80 to-transparent p-4 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500 rounded-full p-2">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white">Niveau {playerLevel}</p>
                <Progress value={(playerPoints % 1000) / 10} className="w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              {playerBadges.map((badge, index) => (
                <Badge key={index} variant="outline" className="bg-blue-500 text-white">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="container mx-auto pt-24 px-4">
          {currentChallenge ? (
            <div className="max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                onClick={() => setCurrentChallenge(null)}
                className="mb-4"
              >
                Retour aux défis
              </Button>
              
              <Card className={`p-6 ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-4">{currentChallenge.title}</h2>
                <p className="mb-6">{currentChallenge.type === 'quiz' ? currentChallenge.content.question : currentChallenge.content.scenario}</p>
                
                {currentChallenge.type === 'quiz' && (
                  <div className="space-y-3">
                    {currentChallenge.content.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start"
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                {showFeedback && (
                  <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <p className="font-bold">
                      {isCorrect ? '🎉 Correct! Bien joué!' : '❌ Pas tout à fait. Réessayez!'}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative ${!challenge.unlocked && 'opacity-50'}`}
                >
                  <Card className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {challenge.title}
                      </h3>
                      <Badge variant={challenge.completed ? "success" : "outline"}>
                        {challenge.points} pts
                      </Badge>
                    </div>
                    <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {challenge.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={
                        challenge.difficulty === 'Facile' ? 'bg-green-500/20' :
                        challenge.difficulty === 'Moyen' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }>
                        {challenge.difficulty}
                      </Badge>
                      <Button
                        onClick={() => handleChallengeStart(challenge)}
                        disabled={!challenge.unlocked}
                      >
                        {challenge.completed ? 'Rejouer' : 'Commencer'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
