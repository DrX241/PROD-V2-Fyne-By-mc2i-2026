import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, User, Award, HelpCircle } from "lucide-react";

// Interface de l'expert
interface TunnelExpert {
  name: string;
  role: string;
  expertise: string;
  background?: string;
}

interface ExpertListProps {
  sessionId: string;
  onExpertSelect: (expert: TunnelExpert) => void;
}

export default function ExpertList({ sessionId, onExpertSelect }: ExpertListProps) {
  const [experts, setExperts] = useState<TunnelExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les experts disponibles
  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tunnel/experts/${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setExperts(data.experts || []);
        } else {
          setError(data.message || "Erreur lors du chargement des experts");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des experts:", error);
        setError("Impossible de charger les experts disponibles");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchExperts();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-pulse flex flex-col items-center">
          <Users className="h-10 w-10 text-amber-500/50 mb-2" />
          <p className="text-sm text-gray-400">Chargement des experts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100/10 border border-red-200/20 rounded-md">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="p-4 bg-amber-100/10 border border-amber-200/20 rounded-md">
        <p className="text-sm text-amber-500">Aucun expert disponible pour cette situation</p>
      </div>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-amber-50/5">
      <CardHeader>
        <CardTitle className="text-amber-600 flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Experts disponibles
        </CardTitle>
        <CardDescription>
          Sélectionnez un expert pour discuter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {experts.map((expert) => (
            <TooltipProvider key={expert.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 hover:bg-amber-500/10 hover:border-amber-500/30 border-amber-500/20"
                    onClick={() => onExpertSelect(expert)}
                  >
                    <div className="flex items-center w-full">
                      <div className="bg-amber-500/20 rounded-full p-2 mr-3">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-amber-700">{expert.name}</p>
                        <p className="text-sm text-muted-foreground">{expert.role}</p>
                      </div>
                      <Award className="h-5 w-5 text-amber-500/60 ml-2" />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expert en {expert.expertise}</p>
                  {expert.background && <p className="text-xs mt-1">{expert.background}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}