import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Star, TrendingUp, Calendar, ShieldAlert, BarChart2, Hammer, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface LearningHistoryItem {
  moduleId: string;
  completedAt: string;
  score: number;
  strengths: string[];
  areasToImprove: string[];
}

interface LearningPath {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  modules: string[];
}

interface ProgressTrackerProps {
  className?: string;
  learningHistory: LearningHistoryItem[];
  allPaths: LearningPath[];
}

export function ProgressTracker({ className = '', learningHistory, allPaths }: ProgressTrackerProps) {
  // Si aucun module n'a été complété, afficher un message d'encouragement
  if (learningHistory.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">Commencez votre parcours</h3>
        <p className="text-gray-600 mb-4">
          Sélectionnez un module ci-dessus pour débuter votre apprentissage en cybersécurité.
        </p>
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
            Niveau: Novice
          </Badge>
        </div>
      </Card>
    );
  }
  
  // Calcul global des statistiques
  const totalModules = allPaths.reduce((sum, path) => sum + path.modules.length, 0);
  const completedModules = learningHistory.length;
  const completionPercentage = Math.round((completedModules / totalModules) * 100);
  
  // Calculer le score moyen
  const averageScore = learningHistory.reduce((sum, item) => sum + item.score, 0) / completedModules;
  
  // Déterminer le niveau actuel
  const getUserLevel = (completedCount: number) => {
    if (completedCount >= 15) return { label: "Maître", icon: <Crown className="h-4 w-4 mr-1" /> };
    if (completedCount >= 10) return { label: "Expert", icon: <Star className="h-4 w-4 mr-1" /> };
    if (completedCount >= 5) return { label: "Praticien", icon: <TrendingUp className="h-4 w-4 mr-1" /> };
    if (completedCount >= 2) return { label: "Apprenti", icon: <Award className="h-4 w-4 mr-1" /> };
    return { label: "Novice", icon: <ShieldAlert className="h-4 w-4 mr-1" /> };
  };
  
  const userLevel = getUserLevel(completedModules);
  
  // Formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Obtenir l'icône correspondant au parcours
  const getPathIcon = (pathId: string) => {
    switch (pathId) {
      case 'sensibilisation':
        return <ShieldAlert className="h-5 w-5" />;
      case 'rgpd':
        return <BarChart2 className="h-5 w-5" />;
      case 'risques':
        return <ShieldAlert className="h-5 w-5" />;
      case 'audit':
        return <Hammer className="h-5 w-5" />;
      case 'strategie':
        return <Crown className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };
  
  // Regrouper les modules complétés par parcours
  const completedByPath = allPaths.map(path => {
    const pathModules = learningHistory.filter(item => path.modules.includes(item.moduleId));
    const pathPercentage = Math.round((pathModules.length / path.modules.length) * 100);
    
    return {
      id: path.id,
      title: path.title,
      icon: getPathIcon(path.id),
      total: path.modules.length,
      completed: pathModules.length,
      percentage: pathPercentage,
      modules: pathModules
    };
  });
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-900 mb-2">Suivi de votre progression</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 flex items-center">
            {userLevel.icon}
            Niveau: {userLevel.label}
          </Badge>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {completedModules} modules sur {totalModules} ({completionPercentage}%)
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Score moyen: {Math.round(averageScore * 100)}%
          </Badge>
        </div>
        
        <Progress value={completionPercentage} className="h-2 mb-2" />
      </div>
      
      <Tabs defaultValue="apercu" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="apercu">Aperçu par parcours</TabsTrigger>
          <TabsTrigger value="details">Détails des modules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apercu">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedByPath.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-4 border-l-4 border-l-indigo-500">
                  <div className="flex items-center mb-2 gap-2">
                    {path.icon}
                    <h4 className="font-medium text-indigo-900">{path.title}</h4>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{path.completed} modules sur {path.total}</span>
                    <span>{path.percentage}% complété</span>
                  </div>
                  
                  <Progress value={path.percentage} className="h-2" />
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="space-y-4">
            {learningHistory.length > 0 ? (
              learningHistory.map((item, index) => {
                // Déterminer à quel parcours appartient ce module
                let parentPath;
                let moduleTitle = item.moduleId;
                
                for (const path of allPaths) {
                  if (path.modules.includes(item.moduleId)) {
                    parentPath = path;
                    moduleTitle = item.moduleId.charAt(0).toUpperCase() + 
                      item.moduleId.slice(1).replace(/([A-Z])/g, ' $1');
                    break;
                  }
                }
                
                return (
                  <motion.div
                    key={item.moduleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="p-4 border-l-4 border-l-green-500">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{moduleTitle}</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                          {Math.round(item.score * 100)}%
                        </Badge>
                      </div>
                      
                      {parentPath && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          {getPathIcon(parentPath.id)}
                          <span className="ml-1">{parentPath.title}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        Complété le {formatDate(item.completedAt)}
                      </div>
                      
                      {item.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-700 mb-1">Points forts:</p>
                          <ul className="text-xs text-green-800 list-disc pl-4">
                            {item.strengths.slice(0, 2).map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.areasToImprove.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-orange-700 mb-1">À améliorer:</p>
                          <ul className="text-xs text-orange-800 list-disc pl-4">
                            {item.areasToImprove.slice(0, 2).map((area, idx) => (
                              <li key={idx}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">Aucun module complété pour le moment.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}