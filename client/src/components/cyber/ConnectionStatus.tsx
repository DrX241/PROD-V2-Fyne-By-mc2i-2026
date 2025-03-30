import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  
  const checkStatus = async () => {
    try {
      setStatus('checking');
      const response = await apiRequest('GET', '/api/cyber/status');
      const data = await response.json();
      setStatus(data.status);
      setLastCheck(data.time);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus('disconnected');
    }
  };
  
  useEffect(() => {
    // Vérifier au chargement
    checkStatus();
    
    // Puis vérifier toutes les 2 minutes
    const interval = setInterval(checkStatus, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn(
      "flex items-center px-3 py-1 rounded-full text-xs font-medium",
      status === 'connected' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
      status === 'reconnecting' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    )}>
      {status === 'connected' ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          <span>Connecté à Azure AI</span>
        </>
      ) : status === 'reconnecting' ? (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span>Reconnexion en cours...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          <span>Déconnecté</span>
        </>
      )}
    </div>
  );
}