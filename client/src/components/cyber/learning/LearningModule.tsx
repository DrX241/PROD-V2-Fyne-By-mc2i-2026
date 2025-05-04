import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { evaluateUserResponse } from '@/services/openaiService';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScenarioSimulation } from './ScenarioSimulation';
import { QuizSection } from './QuizSection';
import { ResourceLibrary } from './ResourceLibrary';

// Définition des types pour les paramètres
interface LearningModuleProps {
  moduleId: string;
  learningContent: any;
  onComplete: (results: {
    score: number,
    strengths: string[],
    areasToImprove: string[]
  }) => void;
  onBack: () => void;
}

// Composant principal de module d'apprentissage
export function LearningModule({
  moduleId,
  learningContent,
  onComplete,
  onBack
}: LearningModuleProps) {
  // États pour gérer l'interface
  const [activeSection, setActiveSection] = useState('introduction');
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calcul de la progression
  const totalSections = 5; // Introduction, Concepts, Scenario, Quiz, Resources
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const progress = (completedCount / totalSections) * 100;
  
  // Marquer une section comme complétée et passer à la suivante
  const handleSectionComplete = (section: string) => {
    setCompletedSections(prev => ({
      ...prev,
      [section]: true
    }));
    
    // Navigation entre les sections
    if (section === 'introduction') setActiveSection('concepts');
    else if (section === 'concepts') setActiveSection('scenario');
    else if (section === 'scenario') setActiveSection('quiz');
    else if (section === 'quiz') setActiveSection('resources');
  };
  
  // Traiter la soumission d'une réponse à une question
  const handleResponseSubmit = async (questionId: string, response: string) => {
    // Enregistrer la réponse
    setUserResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
    
    // Évaluer la réponse
    setIsSubmitting(true);
    
    try {
      const question = learningContent.questions.find((q: any) => q.id === questionId);
      let evaluation;
      
      try {
        // Tenter d'appeler l'API d'évaluation
        evaluation = await evaluateUserResponse(
          response, 
          question.question, 
          question.key_concepts || []
        );
      } catch (apiError) {
        console.error("Erreur lors de l'appel API, utilisation de l'évaluation de secours", apiError);
        
        // Évaluation de secours en cas d'échec de l'API
        const hasKeyConcepts = (question?.key_concepts || []).some((concept: string) => 
          response.toLowerCase().includes(concept.toLowerCase())
        );
        
        evaluation = {
          score: hasKeyConcepts ? 0.8 : 0.4,
          feedback: hasKeyConcepts ? 
            "Bonne compréhension des concepts clés!" : 
            "Votre réponse pourrait être améliorée en abordant certains aspects importants.",
          strengths: hasKeyConcepts ? 
            ["Bonne identification des enjeux principaux", "Réponse structurée"] : 
            ["Effort de réflexion"],
          areas_to_improve: hasKeyConcepts ? 
            ["Développer davantage les exemples concrets"] : 
            ["Mentionner les concepts clés attendus", "Approfondir l'analyse"],
          explanation: "L'évaluation est basée sur la présence des concepts clés dans votre réponse."
        };
      }
      
      // Enregistrer l'évaluation
      setEvaluations(prev => ({
        ...prev,
        [questionId]: evaluation
      }));
    } catch (err) {
      console.error("Erreur lors de l'évaluation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Finaliser le module et générer le résumé
  const handleModuleCompletion = () => {
    const allQuestions = learningContent.questions || [];
    const answeredQuestions = Object.keys(evaluations).length;
    
    // Cas où aucune question n'a été répondue
    if (answeredQuestions === 0 || allQuestions.length === 0) {
      onComplete({
        score: 0,
        strengths: [],
        areasToImprove: ["Aucune question n'a été complétée"]
      });
      return;
    }
    
    // Compiler les résultats
    const strengths: string[] = [];
    const areasToImprove: string[] = [];
    let totalScore = 0;
    
    // Éviter d'utiliser le mot-clé "eval" comme nom de variable
    Object.values(evaluations).forEach(evaluation => {
      totalScore += evaluation.score || 0;
      if (evaluation.strengths) strengths.push(...evaluation.strengths);
      if (evaluation.areas_to_improve) areasToImprove.push(...evaluation.areas_to_improve);
    });
    
    const averageScore = totalScore / answeredQuestions;
    
    // Limiter à 3 forces et 3 faiblesses uniques
    const uniqueStrengths = [...new Set(strengths)].slice(0, 3);
    const uniqueAreasToImprove = [...new Set(areasToImprove)].slice(0, 3);
    
    // Transmettre les résultats
    onComplete({
      score: averageScore,
      strengths: uniqueStrengths,
      areasToImprove: uniqueAreasToImprove
    });
  };
  
  // Rendu du composant
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        
        <div className="text-right">
          <h2 className="text-xl font-semibold text-indigo-900">
            {learningContent.title || moduleId}
          </h2>
          <p className="text-sm text-gray-500">
            Progression: {Math.round(progress)}%
          </p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="concepts">Concepts clés</TabsTrigger>
          <TabsTrigger value="scenario">Scenario</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="introduction">
          <Card className="p-6">
            <div className="prose max-w-none" 
                 dangerouslySetInnerHTML={{ __html: learningContent.introduction }} />
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => handleSectionComplete('introduction')}
            >
              Continuer <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </TabsContent>
        
        <TabsContent value="concepts">
          <Card className="p-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Concepts clés</h3>
              <ul className="space-y-2">
                {learningContent.concepts_clés && learningContent.concepts_clés.map((concept: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-indigo-600 font-medium mr-2">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => handleSectionComplete('concepts')}
            >
              Continuer <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </TabsContent>
        
        <TabsContent value="scenario">
          <ScenarioSimulation 
            scenario={learningContent.scenario_interactif || {}}
            onComplete={() => handleSectionComplete('scenario')}
          />
        </TabsContent>
        
        <TabsContent value="quiz">
          <QuizSection
            questions={learningContent.questions || []}
            userResponses={userResponses}
            evaluations={evaluations}
            isSubmitting={isSubmitting}
            onSubmitResponse={handleResponseSubmit}
            onComplete={() => handleSectionComplete('quiz')}
          />
        </TabsContent>
        
        <TabsContent value="resources">
          <ResourceLibrary 
            resources={learningContent.ressources_additionnelles || []}
            onComplete={handleModuleCompletion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}