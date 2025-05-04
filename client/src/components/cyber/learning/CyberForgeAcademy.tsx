import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Imports locaux - correction des problèmes d'importation
import { LearningPath } from './LearningPath';
import { ProgressTracker } from './ProgressTracker';
import { LearningModule } from './LearningModule';
import { ScenarioSimulation } from './ScenarioSimulation';
import { QuizSection } from './QuizSection';
import { ResourceLibrary } from './ResourceLibrary';
import { Badge } from '@/components/ui/badge';
import { generateLearningContent } from '@/services/openaiService';
import { Loader2, Award, ShieldAlert, BarChart2, Hammer, Crown } from 'lucide-react';

// Définition des parcours d'apprentissage avec les icônes convertis en chaînes de caractères
const learningPaths = [
  {
    id: "sensibilisation",
    title: "Sensibilisation Cybersécurité",
    icon: "shield-alert", // Nom de l'icône pour compatibilité avec le composant LearningPath
    difficulty: "Débutant",
    description: "Fondamentaux de la sécurité pour tous les collaborateurs",
    modules: ["phishing", "passwords", "socialEngineering", "dataProtection", "mobileSecrity"]
  },
  {
    id: "rgpd",
    title: "Formation RGPD & Cyber",
    icon: "bar-chart-2",
    difficulty: "Intermédiaire",
    description: "Conformité réglementaire et protection des données",
    modules: ["rgpdBasics", "dataBreaches", "subjectRights", "impactAnalysis", "complianceFrameworks"]
  },
  {
    id: "risques",
    title: "Analyse des risques",
    icon: "shield-alert",
    difficulty: "Avancé",
    description: "Méthodologies d'identification et évaluation des menaces",
    modules: ["threatModeling", "riskAssessment", "vulnerabilityAnalysis", "impactEstimation", "riskMitigation"]
  },
  {
    id: "audit",
    title: "Audit Cyber",
    icon: "hammer",
    difficulty: "Expert",
    description: "Techniques et procédures d'audit de sécurité",
    modules: ["auditMethodology", "evidenceCollection", "complianceChecking", "reportWriting", "remediation"]
  },
  {
    id: "strategie",
    title: "Stratégie & Gouvernance",
    icon: "crown",
    difficulty: "Maître",
    description: "Pilotage et organisation de la cybersécurité",
    modules: ["securityStrategy", "budgetOptimization", "teamManagement", "boardCommunication", "crisisManagement"]
  }
];

export function CyberForgeAcademy() {
  const [selectedPath, setSelectedPath] = useState("sensibilisation");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState("débutant");
  const [learningHistory, setLearningHistory] = useState<any[]>([]);
  
  // Récupération des données d'apprentissage sauvegardées au chargement
  useEffect(() => {
    const savedHistory = localStorage.getItem('cyberForgeHistory');
    if (savedHistory) {
      try {
        setLearningHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erreur lors du chargement de l'historique d'apprentissage", e);
      }
    }
    
    const savedLevel = localStorage.getItem('cyberForgeUserLevel');
    if (savedLevel) {
      setUserLevel(savedLevel);
    }
  }, []);
  
  // Sauvegarde des données lorsque l'historique est mis à jour
  useEffect(() => {
    localStorage.setItem('cyberForgeHistory', JSON.stringify(learningHistory));
  }, [learningHistory]);
  
  // Sauvegarde du niveau utilisateur lorsqu'il change
  useEffect(() => {
    localStorage.setItem('cyberForgeUserLevel', userLevel);
  }, [userLevel]);
  
  // Requête pour obtenir le contenu du module sélectionné
  const { data, isLoading, error } = useQuery({
    queryKey: ['learningContent', selectedModule, userLevel],
    queryFn: () => selectedModule ? 
      generateLearningContent(
        // Déterminer le thème basé sur le module et le chemin sélectionnés
        getThemeFromModule(selectedModule, selectedPath), 
        userLevel, 
        learningHistory
      ),
    enabled: !!selectedModule
  });
  
  // Fonction pour déterminer le thème à partir de l'ID du module et du chemin
  function getThemeFromModule(moduleId: string, pathId: string): string {
    // Trouver le chemin correspondant
    const path = learningPaths.find(p => p.id === pathId);
    if (!path) return moduleId;
    
    // Construire un thème plus spécifique
    return `${path.title} - ${moduleId.charAt(0).toUpperCase() + moduleId.slice(1).replace(/([A-Z])/g, ' $1')}`;
  }

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handlePathChange = (pathId: string) => {
    setSelectedPath(pathId);
    setSelectedModule(null);
  };

  const handleCompleteModule = (moduleId: string, results: any) => {
    // Mise à jour de l'historique d'apprentissage
    setLearningHistory(prev => {
      // Vérifier si le module existe déjà dans l'historique
      const existingIndex = prev.findIndex(item => item.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        // Mettre à jour l'entrée existante
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          completedAt: new Date().toISOString(),
          score: results.score,
          strengths: results.strengths,
          areasToImprove: results.areasToImprove
        };
        return updated;
      } else {
        // Ajouter une nouvelle entrée
        return [...prev, {
          moduleId,
          completedAt: new Date().toISOString(),
          score: results.score,
          strengths: results.strengths,
          areasToImprove: results.areasToImprove
        }];
      }
    });
    
    // Réinitialiser le module sélectionné pour revenir à la liste
    setSelectedModule(null);
    
    // Mettre à jour le niveau utilisateur si nécessaire
    const completedModules = learningHistory.length + 1;
    if (completedModules >= 15) {
      setUserLevel("expert");
    } else if (completedModules >= 8) {
      setUserLevel("intermédiaire");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">CyberForge Academy</h1>
        <p className="text-gray-600">Forgez vos compétences cyber dans notre académie interactive</p>
        
        <div className="mt-4 flex justify-center space-x-2">
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
            Niveau: {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Modules complétés: {learningHistory.length}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Award className="h-3 w-3 mr-1" />
            {learningHistory.length >= 15 ? "Maître Cyber" : 
             learningHistory.length >= 10 ? "Expert Cyber" : 
             learningHistory.length >= 5 ? "Praticien Cyber" : 
             learningHistory.length >= 2 ? "Apprenti Cyber" : "Novice"}
          </Badge>
        </div>
      </header>

      {!selectedModule ? (
        <Tabs defaultValue={selectedPath} onValueChange={handlePathChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {learningPaths.map(path => (
              <TabsTrigger key={path.id} value={path.id} className="flex items-center gap-2">
                {path.icon === "shield-alert" ? <ShieldAlert className="h-5 w-5" /> :
                 path.icon === "bar-chart-2" ? <BarChart2 className="h-5 w-5" /> :
                 path.icon === "hammer" ? <Hammer className="h-5 w-5" /> :
                 path.icon === "crown" ? <Crown className="h-5 w-5" /> :
                 <Award className="h-5 w-5" />}
                <span className="hidden md:inline">{path.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {learningPaths.map(path => (
            <TabsContent key={path.id} value={path.id}>
              <LearningPath 
                path={path} 
                onSelectModule={handleModuleSelect}
                completedModules={learningHistory.map(h => h.moduleId)}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              <p className="mt-4 text-gray-600">Préparation de votre module d'apprentissage...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-600">Une erreur est survenue lors du chargement du contenu.</p>
              <button 
                onClick={() => setSelectedModule(null)} 
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Retour aux parcours
              </button>
            </div>
          ) : (
            <LearningModule 
              moduleId={selectedModule}
              learningContent={data}
              onComplete={(results) => handleCompleteModule(selectedModule, results)}
              onBack={() => setSelectedModule(null)}
            />
          )}
        </div>
      )}
      
      <ProgressTracker 
        className="mt-8" 
        learningHistory={learningHistory}
        allPaths={learningPaths}
      />
    </div>
  );
}