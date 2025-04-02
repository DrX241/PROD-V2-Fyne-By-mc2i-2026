import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ShieldCheck, User, Award, ArrowLeft, Settings, 
  LogOut, ChevronRight, Sparkles, Clock, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getAvatarPath } from '@/lib/utils';

// Type pour les missions
interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  domain: string;
  objectives?: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
}

// Type pour le profil utilisateur
interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  roleId: string;
  level: number;
  experience: number;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    category: string;
    description: string;
  }>;
  completedMissions: string[];
  badges: string[];
}

export default function CyberNewDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charge les données au chargement de la page
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Si nous avons déjà un profil stocké localement, nous l'utilisons
        const storedProfileId = localStorage.getItem('cyberNewProfileId');
        
        if (storedProfileId) {
          // Récupérer le profil
          const profileResponse = await fetch(`/api/cyber/new/profile/${storedProfileId}`);
          if (!profileResponse.ok) throw new Error('Erreur lors de la récupération du profil');
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
          
          // Récupérer les missions disponibles
          const missionsResponse = await fetch('/api/cyber/new/missions/available');
          if (!missionsResponse.ok) throw new Error('Erreur lors de la récupération des missions');
          const missionsData = await missionsResponse.json();
          setMissions(missionsData);
        } else {
          // Rediriger vers la page d'onboarding si aucun profil n'est trouvé
          setLocation('/cyber-new-onboarding');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setLocation]);

  const handleStartMission = async (missionId: string) => {
    if (!userProfile) return;
    
    try {
      // Afficher un indicateur visuel pendant le chargement
      setIsLoading(true);
      
      const response = await fetch('/api/cyber/new/missions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: userProfile.id,
          missionId
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors du démarrage de la mission');
      
      // Récupérer toutes les données en une seule fois (mission, conversation, messages, etc.)
      const missionData = await response.json();
      
      // Mettre à jour la liste des missions
      setMissions(missions.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'in-progress' } 
          : mission
      ));
      
      // Stocker les données dans le localStorage pour un chargement ultra-rapide dans la page mission
      // Cela évite les appels API supplémentaires lors du chargement de la page mission
      localStorage.setItem('cyber_mission_data', JSON.stringify({
        mission: missionData.mission,
        conversationId: missionData.conversationId,
        messages: missionData.messages,
        currentNPC: missionData.currentNPC,
        availableNPCs: missionData.availableNPCs,
        timestamp: Date.now() // Pour permettre d'invalider le cache si nécessaire
      }));
      
      // Rediriger vers la page de la mission
      setLocation(`/cyber-new-mission/${missionId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ? Vos données resteront sauvegardées.')) {
      localStorage.removeItem('cyberNewProfileId');
      setLocation('/');
    }
  };

  // Calculer le progrès global (somme des niveaux de compétences / total possible)
  const calculateOverallProgress = () => {
    if (!userProfile) return 0;
    
    const totalSkillPoints = userProfile.skills.reduce((sum, skill) => sum + skill.level, 0);
    const maxPossiblePoints = userProfile.skills.length * 100; // Supposons que 100 est le max pour chaque compétence
    
    return Math.round((totalSkillPoints / maxPossiblePoints) * 100);
  };

  // Obtenir une couleur basée sur la difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-amber-100 text-amber-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Si nous sommes en train de charger ou si nous avons une erreur
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Chargement des données...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
          <p className="text-gray-600 mb-4">Veuillez créer un profil pour accéder à I AM CYBER NEW.</p>
          <Button onClick={() => setLocation('/cyber-new-onboarding')}>Créer un profil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <h1 className="text-xl font-bold">I AM CYBER NEW</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage 
                    src={getAvatarPath(userProfile.avatarId)} 
                    alt={userProfile.name} 
                  />
                  <AvatarFallback>
                    {userProfile.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userProfile.name}</p>
                  <p className="text-xs opacity-80">Niveau {userProfile.level}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white/20" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="missions">Missions</TabsTrigger>
              <TabsTrigger value="profile">Mon Profil</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>
            
            {/* Missions Tab */}
            <TabsContent value="missions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map((mission) => (
                  <Card key={mission.id} className={`overflow-hidden transition-all duration-300 ${mission.status === 'locked' ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={getDifficultyColor(mission.difficulty)}>
                          {mission.difficulty}
                        </Badge>
                        {mission.status === 'in-progress' && (
                          <Badge className="bg-blue-500">En cours</Badge>
                        )}
                        {mission.status === 'completed' && (
                          <Badge className="bg-green-500">Terminé</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-2">{mission.title}</CardTitle>
                      <CardDescription className="text-sm">{mission.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mission.objectives && (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm font-medium">Objectifs:</p>
                          <ul className="space-y-1">
                            {mission.objectives.slice(0, 2).map((objective) => (
                              <li key={objective.id} className="text-sm flex items-start">
                                <span className="mr-2 mt-0.5 text-gray-500">
                                  {objective.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Clock className="h-4 w-4" />
                                  )}
                                </span>
                                <span className={objective.completed ? 'text-gray-500 line-through' : ''}>
                                  {objective.description}
                                </span>
                              </li>
                            ))}
                            {mission.objectives.length > 2 && (
                              <li className="text-sm text-gray-500">
                                + {mission.objectives.length - 2} autres objectifs
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {mission.status === 'locked' ? (
                        <Button disabled className="w-full opacity-70">
                          Mission verrouillée
                        </Button>
                      ) : mission.status === 'available' ? (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={() => handleStartMission(mission.id)}
                        >
                          Commencer la mission
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : mission.status === 'in-progress' ? (
                        <Button 
                          className="w-full" 
                          onClick={() => setLocation(`/cyber-new-mission/${mission.id}`)}
                        >
                          Continuer
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setLocation(`/cyber-new-mission/${mission.id}`)}
                        >
                          Revoir la mission
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations personnelles */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="h-24 w-24 border-4 border-blue-100">
                        <AvatarImage 
                          src={getAvatarPath(userProfile.avatarId)} 
                          alt={userProfile.name} 
                        />
                        <AvatarFallback className="text-2xl">
                          {userProfile.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{userProfile.name}</h3>
                        <p className="text-gray-500">Niveau {userProfile.level}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Progression globale</p>
                      <Progress value={calculateOverallProgress()} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1 text-right">{calculateOverallProgress()}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Expérience</p>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{userProfile.experience} XP</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Missions complétées</p>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{userProfile.completedMissions.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Compétences */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Compétences</CardTitle>
                    <CardDescription>Votre progression dans différents domaines de cybersécurité</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {userProfile.skills.map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-gray-500">{skill.description}</p>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            Niveau {skill.level}
                          </Badge>
                        </div>
                        <Progress value={skill.level} max={100} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes badges</CardTitle>
                  <CardDescription>Les badges que vous avez obtenus en complétant des missions</CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfile.badges.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun badge pour le moment</h3>
                      <p className="text-gray-500">Complétez des missions pour gagner des badges</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userProfile.badges.map((badgeId) => (
                        <div key={badgeId} className="flex flex-col items-center text-center p-4 border rounded-lg">
                          <Award className="h-10 w-10 text-blue-600 mb-2" />
                          <h4 className="font-medium text-sm">{badgeId}</h4>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">I AM CYBER NEW</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Tous droits réservés
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}