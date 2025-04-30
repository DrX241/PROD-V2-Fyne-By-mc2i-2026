import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Clock, History, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HistoricalEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface IntroductionPhaseProps {
  onComplete: () => void;
}

export default function IntroductionPhase({ onComplete }: IntroductionPhaseProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [showIntro, setShowIntro] = useState(true);
  const [shipPosition, setShipPosition] = useState(0);

  // Événements historiques de la cybersécurité
  const historicalEvents: HistoricalEvent[] = [
    {
      id: 1,
      year: 1988,
      title: "Ver Morris",
      description: "Premier ver informatique à se propager massivement sur Internet, affectant environ 10% des ordinateurs connectés à l'époque.",
      icon: <Clock className="h-8 w-8 text-red-400" />
    },
    {
      id: 2,
      year: 2000,
      title: "ILOVEYOU",
      description: "Ce ver informatique a infecté plus de 45 millions d'ordinateurs en se propageant via des pièces jointes par e-mail.",
      icon: <Shield className="h-8 w-8 text-pink-400" />
    },
    {
      id: 3,
      year: 2013,
      title: "Révélations Snowden",
      description: "Edward Snowden révèle l'existence du programme de surveillance PRISM, bouleversant notre compréhension de la vie privée en ligne.",
      icon: <History className="h-8 w-8 text-blue-400" />
    },
    {
      id: 4,
      year: 2021,
      title: "Ransomware Colonial Pipeline",
      description: "Une attaque de ransomware paralyse Colonial Pipeline, provoquant une crise énergétique majeure et démontrant l'impact des cyberattaques sur les infrastructures critiques.",
      icon: <Shield className="h-8 w-8 text-yellow-400" />
    }
  ];

  // Passer à l'événement suivant
  const goToNextEvent = () => {
    if (currentEventIndex < historicalEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
      setShipPosition((currentEventIndex + 2) * 25); // Position en pourcentage (0%, 25%, 50%, 75%, 100%)
    } else {
      // Tous les événements ont été explorés
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  // Commencer l'exploration
  const startExploration = () => {
    setShowIntro(false);
    setCurrentEventIndex(0);
    setShipPosition(25); // Première position (25%)
  };

  return (
    <div className="flex flex-col items-center">
      {showIntro ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Bienvenue dans CyberChallenge
          </h1>
          <p className="text-xl mb-10 text-blue-100">
            Une expérience immersive de cybersécurité qui vous plongera dans des scénarios réalistes
            et vous mettra au défi de protéger des systèmes contre diverses menaces.
          </p>
          <div className="p-8 bg-gradient-to-br from-blue-800/40 to-purple-900/40 rounded-xl border border-blue-500/30 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Avant de commencer...</h2>
            <p className="mb-6 text-blue-100">
              Embarquez pour un voyage à travers l'histoire de la cybersécurité pour comprendre
              comment nous en sommes arrivés aux défis actuels.
            </p>
            <Button
              onClick={startExploration}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              size="lg"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Commencer l'exploration
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Ligne du temps avec vaisseau */}
          <div className="relative h-24 mb-10">
            <div className="absolute left-0 right-0 top-1/2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            
            {/* Points de la timeline */}
            {historicalEvents.map((event, index) => (
              <div
                key={event.id}
                className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full ${
                  index <= currentEventIndex 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50' 
                    : 'bg-gray-700'
                }`}
                style={{ left: `${(index + 1) * 25 - 3}%` }}
              >
                <div className="absolute -top-10 text-sm font-medium text-cyan-300">
                  {event.year}
                </div>
              </div>
            ))}
            
            {/* Vaisseau */}
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center"
              initial={{ left: "0%" }}
              animate={{ left: `${shipPosition}%` }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <Rocket className="h-10 w-10 text-cyan-400 rotate-90" />
            </motion.div>
          </div>
          
          {/* Carte d'événement actuel */}
          {currentEventIndex >= 0 && currentEventIndex < historicalEvents.length && (
            <motion.div
              key={historicalEvents[currentEventIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 to-blue-900 border border-blue-500/30 p-6 mb-8">
                <div className="flex items-start gap-6">
                  <div className="rounded-full bg-blue-900/50 p-4 flex-shrink-0">
                    {historicalEvents[currentEventIndex].icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-300 mb-2">
                      {historicalEvents[currentEventIndex].year} : {historicalEvents[currentEventIndex].title}
                    </h3>
                    <p className="text-lg text-blue-100 mb-4">
                      {historicalEvents[currentEventIndex].description}
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  onClick={goToNextEvent}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {currentEventIndex < historicalEvents.length - 1 ? (
                    <>
                      Événement suivant
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Terminer l'introduction
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}