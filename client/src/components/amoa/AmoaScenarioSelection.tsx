import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Target, ExternalLink, ArrowRight } from "lucide-react";

export default function AmoaScenarioSelection() {
  const { selectedDomain, scenarios, selectScenario } = useChatContext();

  // Si aucun domaine n'est sélectionné ou aucun scénario n'est disponible, ne rien afficher
  if (!selectedDomain || !scenarios || scenarios.length === 0) return null;

  // Obtenir la couleur de badge en fonction du niveau de difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'débutant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avancé':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Gestionnaire pour la sélection de scénario
  const handleScenarioSelect = (scenarioId: string) => {
    selectScenario(scenarioId);
  };

  // Filtrer les scénarios par domaine
  const domainScenarios = scenarios.filter(scenario => (scenario.domainId || scenario.domain) === selectedDomain.id);

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-8">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="inline-block mr-2 h-5 w-5 text-blue-600" />
            <span>Choisissez un scénario AMOA</span>
          </h3>
          
          <div className="text-sm text-gray-600 flex items-center">
            <span>Domaine: <span className="font-medium">{selectedDomain.name}</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {domainScenarios.map((scenario) => {
            // Déterminer les couleurs à utiliser en fonction du domaine
            let bgColor = "bg-blue-50";
            let hoverBgColor = "hover:bg-blue-100";
            let textColor = "text-blue-700";
            let borderHoverColor = "hover:border-blue-300";
            let iconBgColor = "bg-blue-100";
            let iconHoverBgColor = "group-hover:bg-blue-200";
            
            switch(scenario.domainId) {
              case 'banque':
                bgColor = "bg-blue-50";
                hoverBgColor = "hover:bg-blue-100";
                textColor = "text-blue-700";
                borderHoverColor = "hover:border-blue-300";
                iconBgColor = "bg-blue-100";
                iconHoverBgColor = "group-hover:bg-blue-200";
                break;
              case 'assurance':
                bgColor = "bg-indigo-50";
                hoverBgColor = "hover:bg-indigo-100";
                textColor = "text-indigo-700";
                borderHoverColor = "hover:border-indigo-300";
                iconBgColor = "bg-indigo-100";
                iconHoverBgColor = "group-hover:bg-indigo-200";
                break;
              case 'energie':
                bgColor = "bg-yellow-50";
                hoverBgColor = "hover:bg-yellow-100";
                textColor = "text-yellow-700";
                borderHoverColor = "hover:border-yellow-300";
                iconBgColor = "bg-yellow-100";
                iconHoverBgColor = "group-hover:bg-yellow-200";
                break;
              case 'secteur-public':
                bgColor = "bg-teal-50";
                hoverBgColor = "hover:bg-teal-100";
                textColor = "text-teal-700";
                borderHoverColor = "hover:border-teal-300";
                iconBgColor = "bg-teal-100";
                iconHoverBgColor = "group-hover:bg-teal-200";
                break;
              case 'industrie':
                bgColor = "bg-purple-50";
                hoverBgColor = "hover:bg-purple-100";
                textColor = "text-purple-700";
                borderHoverColor = "hover:border-purple-300";
                iconBgColor = "bg-purple-100";
                iconHoverBgColor = "group-hover:bg-purple-200";
                break;
              case 'methodologies':
                bgColor = "bg-gray-50";
                hoverBgColor = "hover:bg-gray-100";
                textColor = "text-gray-700";
                borderHoverColor = "hover:border-gray-300";
                iconBgColor = "bg-gray-100";
                iconHoverBgColor = "group-hover:bg-gray-200";
                break;
            }
            
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario.id)}
                className={`flex flex-col sm:flex-row sm:items-center p-4 rounded-lg border border-gray-200 ${bgColor} ${hoverBgColor} ${borderHoverColor} transition-all duration-200 text-left group shadow-sm hover:shadow`}
              >
                <div className="mb-3 sm:mb-0 sm:mr-4 sm:w-64 flex-shrink-0">
                  <h4 className={`font-semibold text-gray-900 group-hover:${textColor} transition-colors`}>
                    {scenario.name || scenario.title}
                  </h4>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {scenario.duration || "15-20 min"}
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow pr-4">
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                  
                  {scenario.skills && scenario.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(scenario.skills as string[]).map((skill: string, index: number) => (
                        <span key={index} className={`inline-block px-2 py-0.5 ${bgColor} ${textColor} rounded text-xs border border-gray-200`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 self-center mt-3 sm:mt-0">
                  <div className={`h-8 w-8 rounded-full ${iconBgColor} ${textColor} flex items-center justify-center ${iconHoverBgColor} transition-colors ml-auto`}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}