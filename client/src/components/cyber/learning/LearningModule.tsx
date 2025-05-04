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

interface LearningModuleProps {
  moduleId: string;
  learningContent: any;
  onComplete: (results: any) => void;
  onBack: () => void;
}

export function LearningModule({
  moduleId,
  learningContent,
  onComplete,
  onBack
}: LearningModuleProps) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!learningContent) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-600">Contenu du module non disponible.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }
  
  const handleSectionComplete = (section: string) => {
    setProgress(prevProgress => {
      const increment = 100 / 5; // 5 sections: introduction, concepts, scenario, quiz, resources
      return Math.min(prevProgress + increment, 100);
    });
    
    // Passer automatiquement à la section suivante
    if (section === 'introduction') setActiveSection('concepts');
    else if (section === 'concepts') setActiveSection('scenario');
    else if (section === 'scenario') setActiveSection('quiz');
    else if (section === 'quiz') setActiveSection('resources');
  };
  
  const handleResponseSubmit = async (questionId: string, response: string) => {
    // Sauvegarder la réponse
    setUserResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
    
    // Évaluer la réponse avec l'API
    setIsSubmitting(true);
    
    try {
      const question = learningContent.questions.find((q: any) => q.id === questionId);
      let evaluation;
      
      try {
        // Appel à l'API réelle
        evaluation = await evaluateUserResponse(
          response, 
          question.question, 
          question.key_concepts || []
        );
      } catch (apiError) {
        console.error("Erreur lors de l'appel API, utilisation de l'évaluation de secours", apiError);
        
        // Évaluation de secours en cas d'échec de l'appel API
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
  
  const handleModuleCompletion = () => {
    // Calculer le score final et les commentaires
    const allQuestions = learningContent.questions || [];
    const answeredQuestions = Object.keys(evaluations).length;
    
    if (answeredQuestions === 0 || allQuestions.length === 0) {
      onComplete({
        score: 0,
        strengths: [],
        areasToImprove: ["Aucune question n'a été complétée"]
      });
      return;
    }
    
    // Extraire les forces et faiblesses des évaluations
    const strengths: string[] = [];
    const areasToImprove: string[] = [];
    let totalScore = 0;
    
    Object.values(evaluations).forEach(evaluation => {
      totalScore += evaluation.score || 0;
      if (evaluation.strengths) strengths.push(...evaluation.strengths);
      if (evaluation.areas_to_improve) areasToImprove.push(...evaluation.areas_to_improve);
    });
    
    const averageScore = totalScore / answeredQuestions;
    
    // Limiter à 3 forces et 3 faiblesses uniques
    const uniqueStrengths = [...new Set(strengths)].slice(0, 3);
    const uniqueAreasToImprove = [...new Set(areasToImprove)].slice(0, 3);
    
    onComplete({
      score: averageScore,
      strengths: uniqueStrengths,
      areasToImprove: uniqueAreasToImprove
    });
  };
  
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
                {learningContent.concepts_clés.map((concept: string, idx: number) => (
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
            scenario={learningContent.scenario_interactif}
            onComplete={() => handleSectionComplete('scenario')}
          />
        </TabsContent>
        
        <TabsContent value="quiz">
          <QuizSection
            questions={learningContent.questions}
            userResponses={userResponses}
            evaluations={evaluations}
            isSubmitting={isSubmitting}
            onSubmitResponse={handleResponseSubmit}
            onComplete={() => handleSectionComplete('quiz')}
          />
        </TabsContent>
        
        <TabsContent value="resources">
          <ResourceLibrary 
            resources={learningContent.ressources_additionnelles}
            onComplete={handleModuleCompletion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}