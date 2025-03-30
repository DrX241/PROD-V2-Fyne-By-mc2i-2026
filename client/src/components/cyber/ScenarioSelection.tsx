import { useChatContext } from "@/contexts/ChatContext";
import { ArrowRight, Users, BarChart3 } from "lucide-react";

export default function ScenarioSelection() {
  const { scenarios, scenario, selectScenario } = useChatContext();
  
  // Filter scenarios by the active domain
  const filteredScenarios = scenarios.filter(
    (s: any) => s.domainId === scenario.activeDomain?.id
  );

  const handleScenarioClick = (scenarioId: string) => {
    selectScenario(scenarioId);
  };

  // Fonction pour obtenir les couleurs basées sur la difficulté
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return 'bg-green-100 text-green-700';
      case 'Intermédiaire':
        return 'bg-amber-100 text-amber-700';
      case 'Expert':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Sélectionnez un scénario</h2>
      <p className="text-gray-600 text-center mb-6">
        {scenario.activeDomain?.name} — {filteredScenarios.length} scénarios disponibles
      </p>
      
      <div className="space-y-4">
        {filteredScenarios.map((s: any) => (
          <button 
            key={s.id}
            className="scenario-card w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleScenarioClick(s.id)}
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{s.title}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <span 
                  className={`difficulty-badge ${getDifficultyStyles(s.difficulty)}`}
                >
                  {s.difficulty}
                </span>
                <div className="text-blue-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
