import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Trophy, 
  Shield, 
  Lock, 
  CheckCircle, 
  Clock, 
  Info,
  BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AscensionThemeDetails, AscensionLevel } from '../types/cyber-ascension';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Composant pour chaque niveau
const LevelCard = ({ level, themeId, themeColor }: { level: AscensionLevel, themeId: string, themeColor: string }) => {
  const [, setLocation] = useLocation();
  
  const getDifficultyStars = (difficulty: number) => {
    return Array(5).fill(null).map((_, index) => (
      <span key={index} className={`text-xs ${index < difficulty ? 'text-yellow-400' : 'text-gray-400'}`}>★</span>
    ));
  };
  
  const handleCardClick = () => {
    if (level.unlocked) {
      setLocation(`/cyber-ascension/theme/${themeId}/level/${level.id}`);
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-shadow ${level.unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-75'}`}
      onClick={handleCardClick}
    >
      <div
        className="h-2" 
        style={{ backgroundColor: level.unlocked ? (level.completed ? '#10B981' : themeColor) : '#6B7280' }}
      />
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
              {level.id}
            </Badge>
            <CardTitle className="text-base">{level.name}</CardTitle>
          </div>
          {level.completed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : !level.unlocked ? (
            <Lock className="h-5 w-5 text-gray-400" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <CardDescription className="text-sm">
          {level.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" /> {level.timeEstimate}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Trophy className="h-3 w-3" /> {level.xpReward} XP
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            {getDifficultyStars(level.difficulty)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-sm border-t">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" /> 
            <span className="text-muted-foreground">{level.objectives.length} objectifs</span>
          </div>
          {level.unlocked ? (
            <span className="text-blue-600 font-medium">
              {level.completed ? 'Revoir' : 'Commencer'}
            </span>
          ) : (
            <span className="text-muted-foreground">Verrouillé</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default function CyberAscensionTheme() {
  const [match, params] = useRoute<{ themeId: string }>('/cyber-ascension/theme/:themeId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Récupération des détails du thème
  const { data: themeData, isLoading, error } = useQuery<{ success: boolean, theme: AscensionThemeDetails }>({
    queryKey: ['/api/cyber-ascension/themes', params?.themeId],
    enabled: !!params?.themeId,
  });
  
  if (error) {
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les informations du thème. Veuillez réessayer.',
      variant: 'destructive',
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
          <p className="mb-6">Impossible de charger les détails du thème.</p>
          <Button onClick={() => setLocation('/cyber-ascension')}>
            Retour à CYBER ASCENSION
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading || !themeData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-40 bg-gray-700 mb-8" />
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-lg bg-gray-700" />
              <Skeleton className="h-10 w-64 bg-gray-700" />
            </div>
            <Skeleton className="h-6 w-full max-w-2xl bg-gray-700 mb-3" />
            <Skeleton className="h-6 w-full max-w-xl bg-gray-700 mb-6" />
            
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-8 w-32 bg-gray-700 rounded-full" />
              <Skeleton className="h-8 w-32 bg-gray-700 rounded-full" />
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-5 w-32 bg-gray-700" />
              <Skeleton className="h-5 w-16 bg-gray-700" />
            </div>
            <Skeleton className="h-3 w-full bg-gray-700 mb-8" />
          </div>
          
          <Skeleton className="h-8 w-48 bg-gray-700 mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-2 bg-gray-700" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-6 w-6 rounded-full bg-gray-700" />
                      <Skeleton className="h-5 w-32 bg-gray-700" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full bg-gray-700" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                  <Skeleton className="h-4 w-full bg-gray-700 mb-1" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24 rounded-full bg-gray-700" />
                    <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const theme = themeData.theme;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          className="text-white hover:text-blue-300 mb-8 pl-0" 
          onClick={() => setLocation('/cyber-ascension')}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour aux thèmes
        </Button>
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: `${theme.themeColor}30` }}
            >
              <Shield className="h-8 w-8" style={{ color: theme.themeColor }} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{theme.name}</h1>
          </div>
          
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">
            {theme.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Badge className="px-3 py-1 text-sm bg-blue-900/50 hover:bg-blue-900/50">
              {theme.totalLevels} niveaux
            </Badge>
            <Badge className="px-3 py-1 text-sm bg-blue-900/50 hover:bg-blue-900/50">
              Difficulté progressive
            </Badge>
            <Badge className="px-3 py-1 text-sm bg-blue-900/50 hover:bg-blue-900/50">
              Contenu généré par IA
            </Badge>
          </div>
          
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-gray-300">Progression globale</span>
            <span className="text-gray-300">{theme.progress}%</span>
          </div>
          <Progress value={theme.progress} className="h-2 bg-gray-700" style={{ color: theme.themeColor }} />
          
          <div className="flex flex-wrap gap-8 mt-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-300">Niveaux débloqués</div>
                <div className="font-bold">{theme.unlockedLevels} / {theme.totalLevels}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-300">Niveaux complétés</div>
                <div className="font-bold">{theme.levels.filter(l => l.completed).length} / {theme.totalLevels}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-300">Total XP disponible</div>
                <div className="font-bold">{theme.levels.reduce((sum, level) => sum + level.xpReward, 0)} XP</div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Niveaux du parcours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {theme.levels.map((level) => (
            <LevelCard 
              key={level.id} 
              level={level} 
              themeId={theme.id} 
              themeColor={theme.themeColor} 
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg"
            disabled={theme.unlockedLevels <= 0}
            onClick={() => {
              // Trouver le premier niveau débloqué non complété
              const nextLevel = theme.levels.find(l => l.unlocked && !l.completed);
              if (nextLevel) {
                setLocation(`/cyber-ascension/theme/${theme.id}/level/${nextLevel.id}`);
              } else if (theme.unlockedLevels > 0) {
                // Si tous les niveaux débloqués sont complétés, aller au premier
                setLocation(`/cyber-ascension/theme/${theme.id}/level/${theme.levels.find(l => l.unlocked)?.id || 1}`);
              }
            }}
          >
            {theme.unlockedLevels > 0 ? "Continuer l'apprentissage" : "Démarrer le parcours"}
          </Button>
        </div>
      </div>
    </div>
  );
}