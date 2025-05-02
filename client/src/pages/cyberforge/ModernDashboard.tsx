import React from 'react';
import { useLocation } from 'wouter';
import { 
  Shield, 
  User, 
  BookOpen, 
  LockIcon, 
  AlertTriangle, 
  Terminal,
  ArrowLeft,
  Circle,
  Star,
  ShieldAlert,
  PlayCircle
} from 'lucide-react';
import { 
  Button,
  Badge, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent
} from '@/components/ui';

interface Avatar {
  id: string;
  name: string;
  imagePath: string;
  type: 'hacker' | 'analyst' | 'security_manager' | 'network_specialist';
  abilities: string[];
  description: string;
  strengthsAndWeaknesses: string[];
  primarySkills: string[];
}

interface UserData {
  name: string;
  totalProgress: number;
  moduleProgress: Record<string, { completed: boolean; progress: number }>;
  isAdmin: boolean;
  rank?: string;
  level?: number;
  points?: number;
  avatar?: Avatar;
}

interface ModernDashboardProps {
  userData: UserData;
  selectedAvatar: Avatar | null;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ userData, selectedAvatar }) => {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Titre et navigation */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-cyber-title bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
          CyberForge Academy
        </h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Profil et modules disponibles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Colonne gauche: Profil et statistiques */}
        <div className="lg:col-span-1">
          {selectedAvatar && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Profil d'agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl">
                    {selectedAvatar.id === 'shadow' ? '👤' : 
                     selectedAvatar.id === 'sentinel' ? '🔍' :
                     selectedAvatar.id === 'guardian' ? '🛡️' : 
                     '📡'}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedAvatar.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAvatar.type === 'hacker' ? 'Hacker Éthique' : 
                       selectedAvatar.type === 'analyst' ? 'Analyste Sécurité' :
                       selectedAvatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                       'Spécialiste Réseau'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Niveau</span>
                      <span className="font-medium">{userData.level || 1}</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${userData.points ? (userData.points % 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                      <div className="text-xs text-muted-foreground">Rang</div>
                      <div className="font-medium">{userData.rank || 'Novice'}</div>
                    </div>
                    <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                      <div className="text-xs text-muted-foreground">Points</div>
                      <div className="font-medium">{userData.points || 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Intelligence de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression globale</span>
                    <span className="font-medium">{userData.totalProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${userData.totalProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setLocation('/cyberforge/modules')}
                  className="w-full"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Accéder aux modules
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne droite: Modules et simulations */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Modules de formation
              </CardTitle>
              <CardDescription>
                Parcours personnalisé basé sur votre profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md border relative group">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" /> Fondamentaux
                  </h3>
                  <p className="text-sm text-muted-foreground">Principes de base et concepts essentiels.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Débloqué
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => setLocation('/cyberforge/modules')}
                      className="text-xs h-7"
                    >
                      Démarrer
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 rounded-md border relative group opacity-75">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-500" /> Sécurité réseau
                  </h3>
                  <p className="text-sm text-muted-foreground">Protection des infrastructures.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      Niveau 2
                    </Badge>
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="p-4 rounded-md border relative group opacity-75">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Analyse d'attaques
                  </h3>
                  <p className="text-sm text-muted-foreground">Investigation et analyse des incidents.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      Niveau 3
                    </Badge>
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setLocation('/cyberforge/modules')}
                  className="flex items-center"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Voir tous les modules
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Simulation de crise
              </CardTitle>
              <CardDescription>
                Mettez vos compétences à l'épreuve dans des scénarios réalistes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md border bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">Simulation d'attaque disponible</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Une nouvelle simulation d'attaque avancée est prête pour tester vos compétences
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-100 dark:hover:bg-orange-800"
                    >
                      <PlayCircle className="mr-1 h-3 w-3" />
                      Démarrer la simulation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;