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
  
  return (
    <div className="backdrop-blur-sm border-b border-blue-700/30 shadow-lg">
      <div className="max-w-6xl mx-auto w-full px-4 py-3 flex items-center justify-between">
        {/* Domaine et scénario - à gauche */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-900/60 p-2 rounded-lg border border-blue-700/50 shadow-glow-sm">
            <Info className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-0.5">
              {scenario.activeDomain.name}
            </p>
            <h3 className="text-sm font-bold text-blue-50 flex items-center">
              {scenario.activeScenario.title}
            </h3>
          </div>
        </div>
        
        {/* Informations sur la droite */}
        <div className="flex items-center gap-5">
          {/* Badge de difficulté */}
          <div className={`text-xs px-3 py-1 rounded-md font-medium inline-flex items-center justify-center ${difficultyClass} shadow-glow-sm`}>
            {difficultyIcon}
            {scenario.activeScenario.difficulty}
          </div>
          
          {/* Interlocuteurs du scénario */}
          {scenario.scenarioContacts && scenario.scenarioContacts.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="bg-blue-900/60 p-1.5 rounded-lg border border-blue-700/50 shadow-glow-sm">
                <Users className="h-4 w-4 text-blue-300" />
              </div>
              <div className="flex -space-x-3 overflow-hidden">
                {scenario.scenarioContacts.map((contact: ScenarioContact, index: number) => (
                  <div 
                    key={index}
                    className="w-7 h-7 rounded-full bg-blue-800/70 flex items-center justify-center text-xs border border-blue-500/40 shadow-glow-sm"
                    title={`${contact.name} - ${contact.role}`}
                  >
                    <span className="text-blue-200 font-medium">{contact.name.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          {/* Indicateurs clés */}
          <div className="flex items-center gap-5 bg-blue-900/40 p-2 rounded-lg border border-blue-700/40">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-300 w-16">Confiance</span>
                  <div className="w-24 h-1.5 bg-blue-950 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full ${pulseEffect ? 'animate-pulse' : ''}`}
                      style={{ 
                        width: `${trustLevel}%`, 
                        background: "linear-gradient(90deg, rgba(74,222,128,0.3) 0%, rgba(74,222,128,0.8) 100%)",
                        boxShadow: "0 0 8px rgba(74,222,128,0.5)"
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-300 w-16">Impact</span>
                  <div className="w-24 h-1.5 bg-blue-950 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full ${pulseEffect ? 'animate-pulse' : ''}`}
                      style={{ 
                        width: `${impactLevel}%`, 
                        background: "linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.8) 100%)",
                        boxShadow: "0 0 8px rgba(59,130,246,0.5)"
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}