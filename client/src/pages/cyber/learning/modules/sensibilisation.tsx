import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { immersiveScenarioService } from '../../../../../I_AM_CYBER/services/immersive-scenario-service';

interface SimulationState {
  currentScenario: any;
  npcResponses: string[];
  playerScore: number;
  currentStage: 'briefing' | 'simulation' | 'evaluation';
}

export default function SensibilisationGame() {
  const { isDark } = useTheme();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentScenario: null,
    npcResponses: [],
    playerScore: 0,
    currentStage: 'briefing'
  });

  const startSimulation = async () => {
    // Démarrer une session de simulation immersive
    const scenario = await immersiveScenarioService.startSession(
      'cyber-awareness-101',
      'user123',
      'EMPLOYEE'
    );

    setSimulationState(prev => ({
      ...prev,
      currentScenario: scenario,
      currentStage: 'simulation'
    }));
  };

  const handleDecision = async (decision: string) => {
    if (!simulationState.currentScenario) return;

    const response = await immersiveScenarioService.sendMessageToNPC(
      simulationState.currentScenario.id,
      decision
    );

    setSimulationState(prev => ({
      ...prev,
      npcResponses: [...prev.npcResponses, response.response],
      playerScore: prev.playerScore + (response.emotion === 'pleased' ? 10 : 0)
    }));
  };

  return (
    <HomeLayout>
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="container mx-auto pt-24 px-4">
          {simulationState.currentStage === 'briefing' && (
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Sensibilisation à la Cybersécurité
              </h1>
              <p className={`mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Découvrez les bonnes pratiques de cybersécurité à travers des simulations interactives
              </p>
              <Button
                size="lg"
                onClick={startSimulation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Démarrer la Simulation
              </Button>
            </div>
          )}

          {simulationState.currentStage === 'simulation' && (
            <div className="grid gap-6">
              <Card className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="space-y-4">
                  {simulationState.npcResponses.map((response, index) => (
                    <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <p className={isDark ? 'text-white' : 'text-slate-800'}>{response}</p>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => handleDecision("Je vais appliquer les mesures de sécurité recommandées")}
                    >
                      Appliquer les mesures de sécurité
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDecision("Je voudrais en savoir plus sur les risques")}
                    >
                      Demander plus d'informations
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="fixed bottom-4 right-4">
                <Badge variant="outline" className="text-lg">
                  Score: {simulationState.playerScore}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}