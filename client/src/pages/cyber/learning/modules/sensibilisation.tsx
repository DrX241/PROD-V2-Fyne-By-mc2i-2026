import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Brain, Target, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import { useTheme } from '@/contexts/ThemeContext';

// Structure du jeu de sensibilisation
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'simulation' | 'puzzle';
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

  const challenges: Challenge[] = [
    {
      id: 'phishing-basics',
      title: 'Chasseur de Phishing',
      description: 'Apprenez à détecter les emails malveillants',
      type: 'simulation',
      points: 100,
      difficulty: 'Facile',
      completed: false,
      unlocked: true
    },
    {
      id: 'password-master',
      title: 'Maître des Mots de Passe',
      description: 'Créez des mots de passe inviolables',
      type: 'puzzle',
      points: 150,
      difficulty: 'Moyen',
      completed: false,
      unlocked: true
    },
    // Add other challenges here based on the original code's content.  This is a placeholder.
    //  Consider mapping the original levels and scenarios to this new structure.
  ];

  // Système de progression
  const calculateLevel = (points: number) => {
    return Math.floor(points / 1000) + 1;
  };

  // Récompenses et badges
  const checkBadges = (completedChallenge: Challenge) => {
    // Logique d'attribution des badges -  This needs to be implemented based on game logic.
  };

  const handleChallengeComplete = (challenge: Challenge) => {
    setPlayerPoints(playerPoints + challenge.points);
    setPlayerLevel(calculateLevel(playerPoints + challenge.points));
    const updatedChallenges = challenges.map(c => c.id === challenge.id ? {...c, completed: true} : c);
    const newBadges = [...playerBadges];
    checkBadges(challenge); // Add badge logic here.
    setCurrentChallenge(null);
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

        {/* Carte du monde des défis */}
        <div className="container mx-auto pt-24 px-4">
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
                      onClick={() => setCurrentChallenge(challenge)}
                      disabled={!challenge.unlocked}
                    >
                      {challenge.completed ? 'Rejouer' : 'Commencer'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}