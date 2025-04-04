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
        return "bg-green-900/40 text-green-300 border border-green-700/30";
      case "Intermédiaire":
        return "bg-orange-900/40 text-orange-300 border border-orange-700/30";
      case "Expert":
        return "bg-red-900/40 text-red-300 border border-red-700/30";
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
  
  // Retournez null pour ne rien afficher
  return null;
}