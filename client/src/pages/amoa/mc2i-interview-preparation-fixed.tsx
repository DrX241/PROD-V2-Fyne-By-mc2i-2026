import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CalendarClock } from 'lucide-react';

const Mc2iInterviewPreparation: React.FC = () => {
  const { toast } = useToast();

  const handleNotifyMe = () => {
    toast({
      title: "Notification activée",
      description: "Vous serez notifié lorsque le module de préparation d'audition sera disponible.",
      variant: "default",
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-800 to-gray-950 text-white">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white hover:bg-gray-700/80"
          onClick={() => window.location.href = "/amoa-mode-selection-fixed"}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour vers I AM mc2i
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500">
          Préparation d'audition client - mc2i exclusif
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Cette fonctionnalité vous aidera à préparer les consultants mc2i pour des auditions clients, avec conseils sur la tenue, l'attitude professionnelle et les bonnes pratiques à adopter.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-3xl bg-gray-800/30 border-gray-700/50 shadow-lg">
          <CardHeader className="text-center border-b border-gray-700/50">
            <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
              Fonctionnalité bientôt disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center">
                <CalendarClock className="w-12 h-12 text-amber-400" />
              </div>
              
              <h2 className="text-xl font-semibold mt-4">
                Le module de préparation d'audition client est en cours de développement
              </h2>
              
              <p className="text-gray-300 max-w-xl">
                Notre équipe travaille activement sur une expérience complète de simulation d'audition client avec des fonctionnalités d'évaluation avancées, des scénarios dynamiques générés par IA, et des retours personnalisés.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  onClick={handleNotifyMe}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Me notifier quand c'est prêt
                </Button>
                
                <Button
                  onClick={() => window.location.href = "/amoa-mode-selection-fixed"}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Explorer d'autres modules
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mc2iInterviewPreparation;