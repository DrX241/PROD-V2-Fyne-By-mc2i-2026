import { useChatContext } from "@/contexts/ChatContext";
import { useState } from "react";

export default function ConfigPanel() {
  const { config, updateConfig, scenario } = useChatContext();
  const [temperatureValue, setTemperatureValue] = useState(config.temperature.toString());
  const [maxTokensValue, setMaxTokensValue] = useState(config.maxTokens.toString());

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTemperatureValue(value.toString());
    updateConfig({ temperature: value });
  };

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxTokensValue(value.toString());
    updateConfig({ maxTokens: value });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ 
      difficultyLevel: e.target.value as 'Débutant' | 'Intermédiaire' | 'Expert' 
    });
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ 
      responseStyle: e.target.value as 'Détaillé et pédagogique' | 'Professionnel' | 'Concis et direct' 
    });
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="heading font-semibold text-neutral-800">Configuration</h2>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          <span className="block text-sm font-medium text-neutral-700">Domaine: {scenario.activeDomain?.name || '-'}</span>
          <span className="block text-sm font-medium text-neutral-700">Scénario: {scenario.activeScenario?.title || '-'}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Niveau</label>
          <select 
            className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
            value={config.difficultyLevel}
            onChange={handleDifficultyChange}
          >
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Style</label>
          <select 
            className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
            value={config.responseStyle}
            onChange={handleStyleChange}
          >
            <option>Détaillé et pédagogique</option>
            <option>Professionnel</option>
            <option>Concis et direct</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-neutral-700">Créativité</label>
            <span className="text-xs text-neutral-500">{temperatureValue}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={temperatureValue}
            onChange={handleTemperatureChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-neutral-700">Longueur max</label>
            <span className="text-xs text-neutral-500">{maxTokensValue}</span>
          </div>
          <input 
            type="range" 
            min="500" 
            max="4000" 
            step="100" 
            value={maxTokensValue}
            onChange={handleMaxTokensChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}