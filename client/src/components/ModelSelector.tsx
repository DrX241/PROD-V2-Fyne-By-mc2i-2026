import React, { useState, useEffect } from 'react';
import { Zap, Brain } from 'lucide-react';

interface ModelInfo {
  key: string;
  label: string;
  description: string;
  eco: boolean;
}

export const ModelSelector: React.FC = () => {
  const [currentModel, setCurrentModel] = useState<string>('standard');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch('/api/openai/status')
      .then(r => r.json())
      .then(data => {
        if (data.availableModels?.length) setModels(data.availableModels);
        if (data.currentModelKey) setCurrentModel(data.currentModelKey);
      })
      .catch(() => {});
  }, []);

  const switchModel = async (key: string) => {
    if (key === currentModel || switching) return;
    setSwitching(true);
    try {
      const res = await fetch('/api/openai/switch-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: key }),
      });
      if (res.ok) setCurrentModel(key);
    } finally {
      setSwitching(false);
    }
  };

  if (models.length < 2) return null;

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {models.map(m => (
        <button
          key={m.key}
          onClick={() => switchModel(m.key)}
          disabled={switching}
          title={m.description}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
            currentModel === m.key
              ? m.eco
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-[#006a9e] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
          }`}
        >
          {m.eco ? <Zap className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
          {m.eco ? 'Éco' : 'Standard'}
        </button>
      ))}
    </div>
  );
};
