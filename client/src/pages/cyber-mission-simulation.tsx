import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useChatContext } from '@/contexts/ChatContext';
import MultiPNJChat from '@/components/cyber/MultiPNJChat';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CyberMissionSimulation() {
  const [, setLocation] = useLocation();
  const { currentMission } = useChatContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBackToMissions = () => {
    setLocation('/cyber-missions');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Initialisation de la simulation...</p>
      </div>
    );
  }

  if (!currentMission) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Aucune mission n'est actuellement sélectionnée. Veuillez choisir une mission dans le centre de missions.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleBackToMissions}>
          Retour au centre de missions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <MultiPNJChat onBack={handleBackToMissions} />
    </div>
  );
}