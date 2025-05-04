
import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileCode, AlertTriangle, Play, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

interface Rule {
  id: string;
  type: 'signature' | 'static' | 'behavior' | 'sandbox' | 'polymorphic';
  condition: string;
  action: string;
}

interface GameState {
  level: number;
  score: number;
  currentRules: Rule[];
  detectionRate: number;
  falsePositives: number;
}

export default function CodeShield() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    currentRules: [],
    detectionRate: 0,
    falsePositives: 0
  });

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <HomeLayout>
      <PageTitle title="CodeShield" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-900 via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Link href="/cyber/arcade" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à Cyber Arcade
          </Link>

          {!gameStarted ? (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gray-800/70 backdrop-blur-sm p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">CodeShield</h1>
                    <p className="text-blue-200">Créez votre propre antivirus et protégez le système</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Mission</h2>
                    <p className="text-gray-300">
                      En tant qu'analyste cybersécurité, votre mission est de construire un antivirus capable de détecter 
                      et neutraliser des malwares de plus en plus sophistiqués. À travers 5 niveaux progressifs, vous 
                      apprendrez les différentes techniques de détection des menaces.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileCode className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-white font-medium">Analyse de code</h3>
                      </div>
                      <p className="text-sm text-gray-300">Détectez les signatures et patterns malveillants</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                        <h3 className="text-white font-medium">Comportements</h3>
                      </div>
                      <p className="text-sm text-gray-300">Identifiez les actions suspectes</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Book className="h-5 w-5 text-green-400 mr-2" />
                        <h3 className="text-white font-medium">Apprentissage</h3>
                      </div>
                      <p className="text-sm text-gray-300">Progressez avec l'aide de l'IA</p>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button
                      size="lg"
                      onClick={startGame}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Commencer la mission
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <GameInterface
              level={gameState.level}
              score={gameState.score}
              files={[
                {
                  id: '1',
                  name: 'test.exe',
                  content: 'MZ... [Contenu suspect détecté]',
                  isMalicious: true,
                  type: 'Exécutable'
                },
                {
                  id: '2',
                  name: 'document.pdf',
                  content: '%PDF-1.7\n... [Contenu normal]',
                  isMalicious: false,
                  type: 'Document'
                }
              ]}
              currentRules={gameState.currentRules}
              onAddRule={(rule) => {
                setGameState(prev => ({
                  ...prev,
                  currentRules: [...prev.currentRules, rule]
                }));
              }}
              onAnalyze={() => {
                // Logique d'analyse à implémenter
                setGameState(prev => ({
                  ...prev,
                  score: prev.score + 10
                }));
              }}
            />
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
