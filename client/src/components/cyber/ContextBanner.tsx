import { useChatContext } from "@/contexts/ChatContext";
import { Info, Users, BarChart2 } from "lucide-react";
import { useState } from "react";

// Interface locale pour les contacts
interface ScenarioContact {
  name: string;
  role: string;
}

export default function ContextBanner() {
  const { scenario } = useChatContext();
  const [trustLevel, setTrustLevel] = useState(75); // Niveau de confiance simulé
  const [impactLevel, setImpactLevel] = useState(60); // Impact des décisions simulé
  
  if (!scenario.activeDomain || !scenario.activeScenario) {
    return null; // Ne pas afficher le bandeau si aucun domaine ou scénario n'est sélectionné
  }
  
  // Formater le niveau de difficulté avec la bonne couleur
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant":
        return "bg-green-100 text-green-700";
      case "Intermédiaire":
        return "bg-orange-100 text-orange-700";
      case "Expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  
  // Classe pour la difficulté du scénario
  const difficultyClass = getDifficultyClass(scenario.activeScenario.difficulty);
  
  return (
    <div className="context-banner">
      <div className="centered-container flex items-center justify-end">
        {/* Toutes les informations sur la droite */}
        <div className="flex items-center gap-3">
          {/* Informations sur le domaine et le scénario */}
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-neutral-500" />
            <div className="flex items-center">
              <span className="text-sm text-neutral-600">
                {scenario.activeDomain.name}
              </span>
              <span className="mx-2 text-neutral-300">|</span>
              <span className="text-sm font-medium text-neutral-800">
                {scenario.activeScenario.title}
              </span>
            </div>
          </div>
          
          <div className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center justify-center ${difficultyClass}`}>
            {scenario.activeScenario.difficulty}
          </div>
          
          {/* Interlocuteurs du scénario */}
          {scenario.scenarioContacts && scenario.scenarioContacts.length > 0 ? (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <div className="flex -space-x-2 overflow-hidden">
                {scenario.scenarioContacts.map((contact: ScenarioContact, index: number) => (
                  <div 
                    key={index}
                    className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs ring-2 ring-white"
                    title={`${contact.name} - ${contact.role}`}
                  >
                    {contact.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-500">Aucun interlocuteur</span>
            </div>
          )}
          
          {/* Indicateurs clés */}
          <div className="flex items-center gap-3 ml-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Confiance:</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${trustLevel}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Impact:</span>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${impactLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}