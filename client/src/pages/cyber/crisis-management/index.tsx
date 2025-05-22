import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, ArrowRight } from "lucide-react";

export default function CrisisManagementPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Vérifier si l'utilisateur a consulté le briefing
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà consulté le briefing
    const briefingConsulted = sessionStorage.getItem('crisis_briefing_consulted');
    
    if (!briefingConsulted) {
      // Rediriger vers la page de briefing
      toast({
        title: "Briefing requis",
        description: "Veuillez d'abord consulter le briefing de mission avant d'accéder à la salle de crise.",
        variant: "default",
      });
      setLocation('/cyber/crisis-management/briefing');
    }
  }, [setLocation, toast]);

  return (
    <HomeLayout>
      {/* Bannière de développement */}
      <div className="fixed top-0 left-0 w-full bg-red-700 text-white py-2 text-center z-50">
        Module en développement - La navigation et les interactions sont limitées
      </div>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden relative py-16">
        <div className="max-w-5xl mx-auto px-4 mt-10 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Gestion de Crise Cyber</h1>
            <p className="text-xl text-gray-300">Simulateur de crise en cours de développement</p>
          </div>
          
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertOctagon className="mr-2 h-6 w-6" />
                Module en construction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Le module de gestion de crise est actuellement en cours de développement. 
                Les fonctionnalités interactives ne sont pas encore disponibles.
              </p>
              
              <p className="text-gray-300">
                Dans la version finale, vous pourrez:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Interagir avec les parties prenantes (dirigeants mc2i) en temps réel</li>
                <li>Prendre des décisions critiques qui influencent l'évolution de la crise</li>
                <li>Surveiller les indicateurs d'impact sur la réputation, les opérations et les finances</li>
                <li>Gérer les systèmes impactés et mettre en place des mesures de remédiation</li>
                <li>Recevoir un debriefing détaillé de votre performance après la simulation</li>
              </ul>
              
              <div className="mt-6 bg-black/30 p-4 rounded-md border border-gray-800">
                <h3 className="text-amber-400 text-lg font-medium mb-2">Comment utiliser ce module?</h3>
                <p className="text-gray-300">
                  Pour le moment, vous pouvez uniquement consulter le briefing de mission qui présente
                  le contexte de la crise et les parties prenantes impliquées.
                </p>
                
                <Button 
                  className="mt-4 bg-red-800 hover:bg-red-700"
                  onClick={() => setLocation('/cyber/crisis-management/briefing')}
                >
                  Consulter le briefing de mission <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}