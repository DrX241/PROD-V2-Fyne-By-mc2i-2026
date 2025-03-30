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
      status === 'connected' ? "bg-blue-800/40 text-white border border-blue-500/30" :
      status === 'reconnecting' ? "bg-yellow-800/40 text-white border border-yellow-500/30" :
      "bg-red-800/40 text-white border border-red-500/30"
    )}>
      {status === 'connected' ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          <span>FYNE connecté</span>
        </>
      ) : status === 'reconnecting' ? (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span>Reconnexion en cours...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          <span>FYNE déconnecté</span>
        </>
      )}
    </div>
  );
}