import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Award, BarChart2, Trophy } from 'lucide-react';

interface ProgressTrackerProps {
  className?: string;
  learningHistory: Array<{
    moduleId: string;
    completedAt: string;
    score: number;
    strengths: string[];
    areasToImprove: string[];
  }>;
  allPaths: Array<{
    id: string;
    title: string;
    modules: string[];
  }>;
}

export function ProgressTracker({ 
  className = '', 
  learningHistory, 
  allPaths 
}: ProgressTrackerProps) {
  // Calcul de la progression globale
  const totalModules = allPaths.reduce((sum, path) => sum + path.modules.length, 0);
  const completedModules = learningHistory.length;
  const progressPercentage = totalModules > 0 
    ? Math.round((completedModules / totalModules) * 100) 
    : 0;
    
  // Calcul des scores par parcours
  const pathsProgress = allPaths.map(path => {
    const pathModules = path.modules;
    const pathCompletedModules = learningHistory.filter(h => 
      pathModules.includes(h.moduleId)
    );
    
    const pathProgress = pathModules.length > 0 
      ? Math.round((pathCompletedModules.length / pathModules.length) * 100)
      : 0;
      
    const averageScore = pathCompletedModules.length > 0
      ? Math.round(pathCompletedModules.reduce((sum, m) => sum + m.score, 0) / pathCompletedModules.length * 100)
      : 0;
      
    return {
      id: path.id,
      title: path.title,
      progress: pathProgress,
      completedCount: pathCompletedModules.length,
      totalCount: pathModules.length,
      averageScore
    };
  });
  
  // Calcul du niveau actuel
  let level = "Novice";
  if (progressPercentage >= 80) level = "Maître";
  else if (progressPercentage >= 60) level = "Expert";
  else if (progressPercentage >= 40) level = "Praticien";
  else if (progressPercentage >= 20) level = "Apprenti";
  
  // Recherche des points forts (top 3)
  const allStrengths = learningHistory.flatMap(h => h.strengths);
  const strengthCounts: Record<string, number> = {};
  
  allStrengths.forEach(strength => {
    if (!strengthCounts[strength]) strengthCounts[strength] = 0;
    strengthCounts[strength]++;
  });
  
  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([strength]) => strength);
    
  // Recherche des axes d'amélioration (top 3)
  const allWeaknesses = learningHistory.flatMap(h => h.areasToImprove);
  const weaknessCounts: Record<string, number> = {};
  
  allWeaknesses.forEach(weakness => {
    if (!weaknessCounts[weakness]) weaknessCounts[weakness] = 0;
    weaknessCounts[weakness]++;
  });
  
  const topWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([weakness]) => weakness);
  
  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Progression globale et niveau */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-indigo-600" />
            Progression et niveau
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-indigo-700">Progression globale</span>
              <span className="text-sm font-medium text-indigo-900">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="bg-indigo-100 h-16 w-16 flex items-center justify-center text-2xl text-indigo-600">
              {level.charAt(0)}
            </Avatar>
            <div>
              <h4 className="text-lg font-medium text-indigo-900">Niveau: {level}</h4>
              <p className="text-sm text-gray-600">{completedModules} modules complétés sur {totalModules}</p>
            </div>
          </div>
        </div>
        
        {/* Points forts et axes d'amélioration */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
            Analyse des compétences
          </h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-700 mb-2">Points forts</h4>
            <ul className="space-y-1">
              {topStrengths.length > 0 ? (
                topStrengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">Complétez des modules pour obtenir une analyse</li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-orange-700 mb-2">Axes d'amélioration</h4>
            <ul className="space-y-1">
              {topWeaknesses.length > 0 ? (
                topWeaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    {weakness}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">Complétez des modules pour obtenir une analyse</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Progression par parcours */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-indigo-600" />
            Progression par parcours
          </h3>
          
          <div className="space-y-4">
            {pathsProgress.map(path => (
              <div key={path.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-indigo-800">{path.title}</span>
                  <span className="text-xs text-indigo-600">
                    {path.completedCount}/{path.totalCount} modules
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={path.progress} className="h-1.5 flex-grow" />
                  <span className="text-xs font-medium w-8 text-right">
                    {path.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}