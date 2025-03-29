import { useChatContext } from "@/contexts/ChatContext";

export default function ScenarioSelection() {
  const { scenarios, scenario, selectScenario } = useChatContext();
  
  // Filter scenarios by the active domain
  const filteredScenarios = scenarios.filter(
    (s) => s.domainId === scenario.activeDomain?.id
  );

  const handleScenarioClick = (scenarioId: string) => {
    selectScenario(scenarioId);
  };

  return (
    <div className="flex flex-col gap-3 my-4">
      {filteredScenarios.map((scenario) => (
        <div 
          key={scenario.id}
          className="selection-card border border-gray-200 rounded-lg p-4 flex-1 bg-white hover:border-primary-300"
          onClick={() => handleScenarioClick(scenario.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="heading font-medium text-neutral-800">{scenario.title}</h3>
              <p className="text-neutral-500 text-xs mt-1">
                Contact : <span className="font-medium">{scenario.contact.name} - {scenario.contact.role}</span>
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <span 
                className={`px-2 py-1 text-xs font-medium ${scenario.difficultyColor} rounded-full`}
              >
                Niveau {scenario.difficulty.toLowerCase()}
              </span>
            </div>
          </div>
          <p className="text-neutral-600 text-sm">{scenario.description}</p>
        </div>
      ))}
    </div>
  );
}
