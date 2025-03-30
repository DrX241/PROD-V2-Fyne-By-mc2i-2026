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
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{s.title}</h3>
                  <span 
                    className={`difficulty-badge ${getDifficultyStyles(s.difficulty)}`}
                  >
                    {s.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{s.description}</p>
                
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {s.contacts && s.contacts.length > 0 && (
                      <span>{s.contacts.find((c: any) => c.id === s.primaryContact)?.name || s.contacts[0].name}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    {s.contacts && s.contacts.length > 0 && (
                      <span>{s.contacts.find((c: any) => c.id === s.primaryContact)?.role || s.contacts[0].role}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="self-center text-blue-600">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
