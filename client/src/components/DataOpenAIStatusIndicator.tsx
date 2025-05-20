import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { useOpenAI } from '@/hooks/useOpenAI';

interface StatusIndicatorProps {
  className?: string;
}

const DataOpenAIStatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  className
}) => {
  const { connectionStatus, currentModel } = useOpenAI();
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
      connectionStatus === 'connected' 
        ? 'bg-green-500/20 text-green-400' 
        : connectionStatus === 'reconnecting'
          ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-red-500/20 text-red-400'
    } text-xs font-medium ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' 
          ? 'bg-green-500 animate-pulse' 
          : connectionStatus === 'reconnecting'
            ? 'bg-yellow-500 animate-pulse'
            : 'bg-red-500'
      }`}></div>
      <span>
        {connectionStatus === 'connected' 
          ? 'FYNE Connecté' 
          : connectionStatus === 'reconnecting'
            ? 'Reconnexion...'
            : 'Déconnecté'}
      </span>
      {connectionStatus === 'connected' && (
        <span className="ml-1">
          {currentModel === 'gpt-4o' ? (
            <Zap className="h-3 w-3 text-yellow-400 inline-block" />
          ) : (
            <ZapOff className="h-3 w-3 text-blue-400 inline-block" />
          )}
        </span>
      )}
    </div>
  );
};

export default DataOpenAIStatusIndicator;