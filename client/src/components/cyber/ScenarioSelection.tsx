import React, { useState } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { 
  ArrowRight, Users, Shield, ShieldAlert, 
  AlertTriangle, Clock, Brain, ChevronRight 
} from "lucide-react";

export default function ScenarioSelection() {
  const { scenarios, scenario, selectScenario } = useChatContext();
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);
  
  // Filter scenarios by the active domain
  const filteredScenarios = scenarios.filter(
    (s: any) => s.domainId === scenario.activeDomain?.id
  );

  const handleScenarioClick = (scenarioId: string) => {
    selectScenario(scenarioId);
  };

  // Fonction pour obtenir les couleurs basées sur la difficulté
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return {
          icon: <Shield className="w-4 h-4 mr-1" />,
          bgColor: "bg-[#006a9e]/40",
          textColor: "text-[#8bbdd0]",
          borderColor: "border-[#006a9e]/30",
          label: "Débutant"
        };
      case 'Intermédiaire':
        return {
          icon: <ShieldAlert className="w-4 h-4 mr-1" />,
          bgColor: "bg-amber-900/40",
          textColor: "text-amber-300",
          borderColor: "border-amber-700/30",
          label: "Intermédiaire"
        };
      case 'Expert':
        return {
          icon: <AlertTriangle className="w-4 h-4 mr-1" />,
          bgColor: "bg-[#006a9e]/40",
          textColor: "text-[#8bbdd0]",
          borderColor: "border-[#006a9e]/30",
          label: "Expert"
        };
      default:
        return {
          icon: <Shield className="w-4 h-4 mr-1" />,
          bgColor: "bg-gray-900/40",
          textColor: "text-gray-300",
          borderColor: "border-gray-700/30",
          label: difficulty
        };
    }
  };

  // Choisir l'icône en fonction du domaine actif pour afficher des éléments visuels thématiques
  const getDomainConfig = () => {
    const domainId = scenario.activeDomain?.id;
    const domainName = scenario.activeDomain?.name;
    
    switch (domainId) {
      case 'gestion-crise':
        return {
          color: "from-[#006a9e]/30 to-[#003a5d]/10",
          accentColor: "text-[#8bbdd0]",
          borderColor: "border-[#006a9e]/20",
          icon: <AlertTriangle className="w-6 h-6 text-[#8bbdd0] mb-2" />
        };
      case 'donnees-personnelles':
        return {
          color: "from-[#006a9e]/30 to-[#006a9e]/10",
          accentColor: "text-[#8bbdd0]",
          borderColor: "border-[#006a9e]/20",
          icon: <Shield className="w-6 h-6 text-[#8bbdd0] mb-2" />
        };
      default:
        return {
          color: "from-[#006a9e]/30 to-[#003a5d]/10",
          accentColor: "text-[#8bbdd0]",
          borderColor: "border-[#006a9e]/20",
          icon: <Shield className="w-6 h-6 text-[#8bbdd0] mb-2" />
        };
    }
  };

  const domainConfig = getDomainConfig();

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className={`text-center mb-6 sm:mb-10 p-4 sm:p-6 rounded-xl bg-gradient-to-br ${domainConfig.color} backdrop-blur-sm border ${domainConfig.borderColor}`}>
        <div className="flex flex-col items-center">
          {React.cloneElement(domainConfig.icon as React.ReactElement, { 
            className: `w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 ${(domainConfig.icon as React.ReactElement).props.className.split(' ').filter((c: string) => c.includes('text-')).join(' ')}` 
          })}
          <h2 className="text-lg sm:text-2xl font-bold text-blue-50 mb-2 sm:mb-3">
            Sélectionnez un scénario de {scenario.activeDomain?.name}
          </h2>
        </div>
        <p className={`${domainConfig.accentColor} mb-2 sm:mb-3 text-sm sm:text-base`}>
          {filteredScenarios.length} scénarios disponibles
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-400" />
            <span className="text-blue-200 text-xs sm:text-sm">15-20 min/scénario</span>
          </div>
          <div className="flex items-center">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-400" />
            <span className="text-blue-200 text-xs sm:text-sm">Apprentissage pratique</span>
          </div>
          <div className="flex items-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-400" />
            <span className="text-blue-200 text-xs sm:text-sm">PNJ réalistes</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {filteredScenarios.map((s: any) => {
          const diffConfig = getDifficultyConfig(s.difficulty);
          const isHovered = hoveredScenario === s.id;
          
          return (
            <button 
              key={s.id}
              className="w-full text-left focus:outline-none focus:ring-1 focus:ring-blue-500/50 group"
              onClick={() => handleScenarioClick(s.id)}
              onMouseEnter={() => setHoveredScenario(s.id)}
              onMouseLeave={() => setHoveredScenario(null)}
            >
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-5 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-blue-800/30 hover:border-blue-600/40 transition-all duration-300 shadow-md hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-base sm:text-xl text-blue-100 group-hover:text-blue-50 transition-colors">{s.title}</h3>
                  <p className="mt-1 sm:mt-2 text-blue-300/90 text-xs sm:text-sm">
                    Cliquez pour commencer ce scénario
                  </p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 relative z-10 mt-3 sm:mt-0 self-end sm:self-auto">
                  <span className={`flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-md ${diffConfig.bgColor} ${diffConfig.textColor} border ${diffConfig.borderColor} text-[10px] sm:text-xs font-medium shadow-glow-sm`}>
                    {React.cloneElement(diffConfig.icon as React.ReactElement, { 
                      className: `w-3 h-3 sm:w-4 sm:h-4 mr-1 ${(diffConfig.icon as React.ReactElement).props.className.split(' ').filter((c: string) => c.includes('w-') || c.includes('h-') || c.includes('mr-')).length ? '' : 'mr-1'}` 
                    })}
                    {diffConfig.label}
                  </span>
                  <div className="text-blue-400 group-hover:text-blue-300 transition-all duration-300 transform group-hover:translate-x-1">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
