import { useChatContext } from "@/contexts/ChatContext";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ConfigPanel() {
  const { 
    config, 
    updateConfig, 
    scenario,
  } = useChatContext();
  
  const [temperatureValue, setTemperatureValue] = useState(config.temperature.toString());
  const [maxTokensValue, setMaxTokensValue] = useState(config.maxTokens.toString());
  const [documents, setDocuments] = useState<{id: string, fileName: string, date: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [scenario.activeScenario]);

  const fetchDocuments = async () => {
    if (!scenario.activeScenario) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/cyber/documents', undefined);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDocumentDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await apiRequest('GET', `/api/cyber/documents/${documentId}`, undefined);
      const blob = await response.blob();
      
      // Create a downloadable link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="heading font-semibold text-neutral-800">Configuration</h2>
      </div>
      
      {/* Scenario Details */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="heading font-medium text-neutral-700 mb-3">Scénario en cours</h3>
        <div className="mb-2">
          <span className="block text-sm text-neutral-500">Domaine</span>
          <span className="font-medium text-neutral-800">{scenario.activeDomain?.name || 'Non sélectionné'}</span>
        </div>
        <div className="mb-2">
          <span className="block text-sm text-neutral-500">Scénario</span>
          <span className="font-medium text-neutral-800">{scenario.activeScenario?.title || 'Non sélectionné'}</span>
        </div>
        <div>
          <span className="block text-sm text-neutral-500">Contact</span>
          <span className="font-medium text-neutral-800">{scenario.contact?.name || 'Non sélectionné'}</span>
        </div>
      </div>
      
      {/* AI Configuration */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="heading font-medium text-neutral-700 mb-3">Paramètres IA</h3>
        
        {/* Difficulty level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Niveau de difficulté</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={config.difficultyLevel}
            onChange={handleDifficultyChange}
          >
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Expert</option>
          </select>
        </div>
        
        {/* Response style */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Style de réponse</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={config.responseStyle}
            onChange={handleStyleChange}
          >
            <option>Détaillé et pédagogique</option>
            <option>Professionnel</option>
            <option>Concis et direct</option>
          </select>
        </div>
        
        {/* Temperature slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-700">Créativité (Température)</label>
            <span className="text-sm text-neutral-500">{temperatureValue}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={temperatureValue}
            onChange={handleTemperatureChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Max tokens */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-700">Longueur maximale (tokens)</label>
            <span className="text-sm text-neutral-500">{maxTokensValue}</span>
          </div>
          <input 
            type="range" 
            min="500" 
            max="4000" 
            step="100" 
            value={maxTokensValue}
            onChange={handleMaxTokensChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Document Access */}
      <div className="p-4">
        <h3 className="heading font-medium text-neutral-700 mb-3">Documents générés</h3>
        {isLoading ? (
          <div className="text-center text-neutral-500 text-sm py-4">Chargement...</div>
        ) : documents.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center p-3 hover:bg-gray-50">
                <i className="ri-file-text-line text-primary-500 mr-3 text-xl"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800 truncate">{doc.fileName}</p>
                  <p className="text-xs text-neutral-500">Généré le {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <button 
                  className="text-neutral-400 hover:text-neutral-600"
                  onClick={() => handleDocumentDownload(doc.id, doc.fileName)}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-500 text-sm py-4">
            Aucun document généré
          </div>
        )}
      </div>
    </div>
  );
}
