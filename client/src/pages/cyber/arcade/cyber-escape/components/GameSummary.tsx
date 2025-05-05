import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  Award,
  CheckCircle, 
  RefreshCw, 
  ShieldAlert,
  Zap,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const GameSummary: React.FC = () => {
  const { 
    gameSummary, 
    discoveredBestPractices, 
    resetGame,
    setShowSummary
  } = useGame();
  
  if (!gameSummary) return null;
  
  // Classification des bonnes pratiques par catégorie
  const bestPracticesByCategory = discoveredBestPractices.reduce<Record<string, typeof discoveredBestPractices>>(
    (acc, practice) => {
      if (!acc[practice.category]) {
        acc[practice.category] = [];
      }
      acc[practice.category].push(practice);
      return acc;
    },
    {}
  );
  
  // Obtenir un nom lisible pour la catégorie
  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      'passwords': 'Mots de passe',
      'phishing': 'Phishing',
      'data': 'Données',
      'devices': 'Appareils',
      'network': 'Réseau',
      'general': 'Général'
    };
    return names[category] || category;
  };
  
  // Obtenir une icône pour la catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'passwords':
        return <ShieldAlert className="h-4 w-4 mr-2" />;
      case 'phishing':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case 'data':
        return <Zap className="h-4 w-4 mr-2" />;
      case 'devices':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'network':
        return <RefreshCw className="h-4 w-4 mr-2" />;
      default:
        return <CheckCircle className="h-4 w-4 mr-2" />;
    }
  };
  
  // Obtenir une couleur pour la catégorie
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'passwords': 'bg-red-800/20 border-red-700',
      'phishing': 'bg-amber-800/20 border-amber-700',
      'data': 'bg-blue-800/20 border-blue-700',
      'devices': 'bg-purple-800/20 border-purple-700',
      'network': 'bg-green-800/20 border-green-700',
      'general': 'bg-blue-900/20 border-blue-800'
    };
    return colors[category] || '';
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8 bg-blue-900/20 border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-8 w-8 mr-3 text-yellow-400" />
              <div>
                <CardTitle className="text-2xl">Bilan de cybersécurité</CardTitle>
                <CardDescription>
                  Votre session de sensibilisation à la cybersécurité est terminée
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={gameSummary.securityLevel >= 3 ? "default" : "destructive"}
              className="text-base py-1.5 px-3"
            >
              Niveau {gameSummary.securityLevel}/5
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-center">Points de sécurité</CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <p className="text-center text-2xl font-bold text-blue-100">
                  {gameSummary.totalPoints}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-center">Taux de réussite</CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <p className="text-center text-2xl font-bold text-blue-100">
                  {Math.round(gameSummary.successRate * 100)}%
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-center">Défis complétés</CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <p className="text-center text-2xl font-bold text-blue-100">
                  {gameSummary.challengesCompleted}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-center">Bonnes pratiques</CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <p className="text-center text-2xl font-bold text-blue-100">
                  {discoveredBestPractices.length}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Progression de votre niveau de sécurité</h3>
            <Progress 
              value={gameSummary.securityLevel * 20} 
              className="h-3 mb-2" 
            />
            <div className="flex justify-between text-xs">
              <span>Débutant</span>
              <span>Intermédiaire</span>
              <span>Expert</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="practices">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="practices">Bonnes pratiques découvertes</TabsTrigger>
          <TabsTrigger value="decisions">Décisions clés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="practices" className="space-y-6">
          {Object.keys(bestPracticesByCategory).length === 0 ? (
            <Card className="bg-blue-900/20 border-blue-800">
              <CardContent className="py-8">
                <p className="text-center text-lg text-blue-400">
                  Vous n'avez pas encore découvert de bonnes pratiques de sécurité
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(bestPracticesByCategory).map(([category, practices]) => (
              <div key={category}>
                <div className="flex items-center mb-3">
                  {getCategoryIcon(category)}
                  <h3 className="text-lg font-semibold">{getCategoryName(category)}</h3>
                </div>
                
                <div className="space-y-3">
                  {practices.map(practice => (
                    <Card key={practice.id} className={`${getCategoryColor(category)}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{practice.title}</CardTitle>
                          <Badge variant={
                            practice.importance === 'critical' ? 'destructive' :
                            practice.importance === 'high' ? 'default' :
                            'secondary'
                          }>
                            {practice.importance === 'critical' ? 'Critique' :
                             practice.importance === 'high' ? 'Important' :
                             practice.importance === 'medium' ? 'Moyen' : 'Faible'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{practice.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="decisions" className="space-y-4">
          {gameSummary.keyDecisions.length === 0 ? (
            <Card className="bg-blue-900/20 border-blue-800">
              <CardContent className="py-8">
                <p className="text-center text-lg text-blue-400">
                  Aucune décision clé enregistrée
                </p>
              </CardContent>
            </Card>
          ) : (
            gameSummary.keyDecisions.map((decision, index) => (
              <Card key={index} className={`bg-blue-900/20 border-blue-800 ${
                decision.points > 0 ? 'border-l-4 border-l-green-600' : 
                decision.points < 0 ? 'border-l-4 border-l-red-600' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{decision.type === 'choice' ? 'Décision' : 'Défi'}</CardTitle>
                    <Badge variant={decision.points > 0 ? 'default' : 'destructive'}>
                      {decision.points > 0 ? `+${decision.points}` : decision.points} points
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{decision.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-8 space-x-4">
        <Button 
          variant="default"
          size="lg"
          onClick={() => resetGame()}
          className="w-40"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Rejouer
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowSummary(false)}
          className="w-40"
        >
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default GameSummary;