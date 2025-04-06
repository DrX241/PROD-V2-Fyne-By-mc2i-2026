import { useChatContext } from "@/contexts/ChatContext";
import { Info, Users, Shield, ShieldAlert, AlertTriangle, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

// Interface locale pour les contacts
interface ScenarioContact {
  name: string;
  role: string;
}

export default function ContextBanner() {
  const { scenario } = useChatContext();
  const [trustLevel, setTrustLevel] = useState(75); // Niveau de confiance simulé
  const [impactLevel, setImpactLevel] = useState(60); // Impact des décisions simulé
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Effet de pulsation périodique pour les indicateurs
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      const timeout = setTimeout(() => {
        setPulseEffect(false);
      }, 700);
      return () => clearTimeout(timeout);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!scenario.activeDomain || !scenario.activeScenario) {
    return null; // Ne pas afficher le bandeau si aucun domaine ou scénario n'est sélectionné
  }
  
  // Formater le niveau de difficulté avec la bonne couleur
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant":
        return "bg-[#006a9e]/40 text-[#8bbdd0] border border-[#006a9e]/30";
      case "Intermédiaire":
        return "bg-[#006a9e]/30 text-[#8bbdd0] border border-[#006a9e]/30";
      case "Expert":
        return "bg-[#006a9e]/40 text-[#8bbdd0] border border-[#006a9e]/30";
      default:
        return "bg-gray-900/40 text-gray-300 border border-gray-700/30";
    }
  };
  
  // Icône de difficulté
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant":
        return <Shield className="h-3 w-3 mr-1" />;
      case "Intermédiaire":
        return <ShieldAlert className="h-3 w-3 mr-1" />;
      case "Expert":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  // Classe pour la difficulté du scénario
  const difficultyClass = getDifficultyClass(scenario.activeScenario.difficulty);
  const difficultyIcon = getDifficultyIcon(scenario.activeScenario.difficulty);
  
  // Chrono de mission (20 minutes par défaut)
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // En secondes (20 minutes)
  const [missionProgress, setMissionProgress] = useState(0); // Progression de 0 à 100
  
  // Effet pour diminuer le temps restant
  useEffect(() => {
    // Ne démarrer le chrono que si un scénario est actif
    if (!scenario.activeScenario) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      
      // Mise à jour de la progression
      setMissionProgress(prev => {
        const newProgress = Math.min(100, prev + 0.05);
        return newProgress;
      });
      
    }, 1000);
    
    return () => clearInterval(timer);
  }, [scenario.activeScenario]);
  
  // Formatage du temps restant (format MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Obtenir la couleur de la jauge de confiance
  const getTrustColor = () => {
    if (trustLevel > 70) return 'bg-[#006a9e]';
    if (trustLevel > 40) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Obtenir la couleur de la progression
  const getProgressColor = () => {
    if (missionProgress < 33) return 'bg-green-500';
    if (missionProgress < 66) return 'bg-amber-500';
    return 'bg-[#006a9e]';
  };

  return (
    <div className="w-full px-3 py-2 backdrop-blur-lg">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
        {/* Info scénario */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-blue-50 font-bold text-sm sm:text-base tracking-wide">
              {scenario.activeDomain?.name} - {scenario.activeScenario.title}
            </h2>
            <span className={`flex items-center px-2 py-0.5 rounded text-xs font-medium ${difficultyClass}`}>
              {difficultyIcon}
              {scenario.activeScenario.difficulty}
            </span>
          </div>
          
          {/* Contact actuel */}
          {scenario.contact && (
            <div className="text-blue-300 text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Contact: {scenario.contact.name}, {scenario.contact.role}</span>
            </div>
          )}
        </div>
        
        {/* Indicateurs */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
          {/* Chrono */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-medium">Temps restant</span>
            <span className={`font-mono text-sm font-bold ${timeRemaining < 300 ? 'text-amber-400' : 'text-blue-100'} ${pulseEffect && timeRemaining < 300 ? 'animate-pulse' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          {/* Jauge de confiance */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-medium">Niveau de confiance</span>
            <div className="h-1.5 w-20 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getTrustColor()} transition-all duration-700 ${pulseEffect ? 'opacity-80' : 'opacity-100'}`}
                style={{ width: `${trustLevel}%` }}
              ></div>
            </div>
          </div>
          
          {/* Progression de mission */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-300 font-medium">Progression</span>
            <div className="h-1.5 w-20 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor()} transition-all duration-700`}
                style={{ width: `${missionProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}