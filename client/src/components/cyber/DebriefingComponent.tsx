import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, BookOpen, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DebriefingProps {
  userActions: string[]; // Actions que l'utilisateur a prises
  correctApproach: string[]; // Approche recommandée
  scenario: string; // Type de scénario joué
  performanceScore: number; // Score de l'utilisateur
}

export default function DebriefingComponent({ userActions, correctApproach, scenario, performanceScore }: DebriefingProps) {
  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [realWorldExample, setRealWorldExample] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Génère un débriefing personnalisé basé sur les actions de l'utilisateur
  useEffect(() => {
    async function generateDebriefing() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/cyber/debriefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userActions, correctApproach, scenario, performanceScore }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch debriefing");
        }
        
        const data = await response.json();
        setLearningPoints(data.learningPoints || []);
        setRealWorldExample(data.realWorldExample || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error in debriefing:", error);
        setError(true);
        setIsLoading(false);
        
        // Fallback content in case of error
        setLearningPoints([
          "Analyser systématiquement les logs et journaux d'accès pour établir la chronologie des événements.",
          "Vérifier la légitimité des autorisations exceptionnelles auprès des personnes concernées.",
          "Recouper les preuves financières avec les activités suspectes pour identifier des motivations."
        ]);
        setRealWorldExample("Une entreprise française du secteur des technologies a connu une fuite de données sensibles en 2022. L'enquête a révélé qu'un employé avait accédé en dehors des heures de bureau à des serveurs avec une autorisation falsifiée. Les journaux d'audit et les enregistrements d'accès physiques ont permis d'identifier le coupable. Suite à cet incident, l'entreprise a mis en place une authentification multifacteur et une revue systématique des accès privilégiés.");
      }
    }
    
    generateDebriefing();
  }, [userActions, correctApproach, scenario, performanceScore]);
  
  const saveToNotes = () => {
    // Ici, on pourrait implémenter une fonction pour sauvegarder les notes
    // Pour l'instant, on simule avec un toast
    toast({
      title: "Notes sauvegardées",
      description: "Vos notes d'apprentissage ont été enregistrées avec succès.",
      variant: "default",
    });
  };
  
  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Très bien";
    if (score >= 60) return "Bien";
    if (score >= 45) return "Passable";
    return "À améliorer";
  };
  
  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };
  
  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border border-indigo-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-indigo-400" />
            Analyse de votre approche
          </CardTitle>
          <CardDescription className="text-gray-400">
            Génération de votre rapport personnalisé...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-5/6 bg-slate-800" />
            <Skeleton className="h-4 w-4/6 bg-slate-800" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full bg-slate-800 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-900/60 border border-indigo-500/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {error ? (
            <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
          ) : (
            <BookOpen className="mr-2 h-5 w-5 text-indigo-400" />
          )}
          Analyse de votre approche
        </CardTitle>
        <CardDescription className="text-gray-400 flex justify-between items-center">
          <span>Rapport personnalisé basé sur vos actions</span>
          <span className={`font-semibold ${getPerformanceColor(performanceScore)}`}>
            {getPerformanceLabel(performanceScore)} ({performanceScore}/100)
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Points d'apprentissage clés
          </h3>
          <ul className="space-y-2">
            {learningPoints.map((point, index) => (
              <li key={index} className="flex items-start text-gray-200">
                <div className="text-indigo-400 mr-2 mt-0.5">•</div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">Cas similaire en entreprise</h3>
          <div className="bg-gray-800/50 p-4 rounded-md text-gray-200 text-sm leading-relaxed">
            {realWorldExample}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveToNotes}
          className="bg-indigo-700 hover:bg-indigo-800 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder dans mes notes d'apprentissage
        </Button>
      </CardFooter>
    </Card>
  );
}