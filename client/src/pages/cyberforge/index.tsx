import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// Composants modernisés modulaires
import ModernDashboard from './ModernDashboard';
import AvatarSelection from './AvatarSelection';
import AvatarProfile from './AvatarProfile';
import AccessAuthentication from './AccessAuthentication';

// Types d'interfaces
interface ModuleProgress {
  completed: boolean;
  progress: number;
  lastAccessed?: Date;
}

interface UserData {
  name: string;
  totalProgress: number;
  moduleProgress: Record<string, ModuleProgress>;
  isAdmin: boolean;
  rank?: string;
  level?: number;
  points?: number;
  avatar?: Avatar;
}

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

interface AIRecommendation {
  title: string;
  message: string;
  moduleId: string;
  type: 'continue' | 'revisit' | 'new';
}

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  duration: string;
  objectives: string[];
  completionReward: number;
  icon: React.ReactNode;
}

// Fonction utilitaire pour calculer la progression totale
function calculateTotalProgress(moduleProgress: Record<string, ModuleProgress>): number {
  if (!moduleProgress || Object.keys(moduleProgress).length === 0) return 0;
  
  const totalModules = Object.keys(moduleProgress).length;
  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const inProgressModulesValue = Object.values(moduleProgress)
    .filter(m => !m.completed && m.progress > 0)
    .reduce((acc, curr) => acc + curr.progress, 0) / 100;
  
  return Math.round(((completedModules + inProgressModulesValue) / totalModules) * 100);
}

// Avatars disponibles
const availableAvatars: Avatar[] = [
  {
    id: 'shadow',
    name: 'Shadow',
    imagePath: '/assets/avatars/shadow.png',
    type: 'hacker',
    abilities: ['Intrusion', 'Cryptanalyse', 'Rétro-ingénierie'],
    description: 'Spécialiste de l\'intrusion et de la sécurité offensive.',
    strengthsAndWeaknesses: ['Expertise en pentesting', 'Connaissance limitée en défense'],
    primarySkills: ['Exploitation', 'Social Engineering', 'OSINT']
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    imagePath: '/assets/avatars/sentinel.png',
    type: 'analyst',
    abilities: ['Analyse forensique', 'Détection d\'anomalies', 'Traque de menaces'],
    description: 'Expert en analyse de sécurité et investigation numérique.',
    strengthsAndWeaknesses: ['Excellence analytique', 'Temps de réaction parfois lent'],
    primarySkills: ['Forensique', 'Détection', 'Analyse malware']
  },
  {
    id: 'guardian',
    name: 'Guardian',
    imagePath: '/assets/avatars/guardian.png',
    type: 'security_manager',
    abilities: ['Gestion de crise', 'Coordination d\'équipe', 'Stratégie de sécurité'],
    description: 'Leader en gestion de la sécurité et réponse aux incidents.',
    strengthsAndWeaknesses: ['Vision stratégique', 'Moins de compétences techniques'],
    primarySkills: ['Gestion incidents', 'Planification', 'Communication']
  },
  {
    id: 'nexus',
    name: 'Nexus',
    imagePath: '/assets/avatars/nexus.png',
    type: 'network_specialist',
    abilities: ['Architecture réseau', 'Détection d\'intrusion', 'Sécurité périmétrique'],
    description: 'Spécialiste des infrastructures réseau sécurisées.',
    strengthsAndWeaknesses: ['Expertise réseau', 'Moins d\'expérience en applications'],
    primarySkills: ['Firewall', 'IDS/IPS', 'Segmentation']
  }
];

function CyberForge() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  
  // États de l'utilisateur et de l'interface
  const [userData, setUserData] = useState<UserData>({
    name: 'Utilisateur',
    totalProgress: 0,
    moduleProgress: {},
    isAdmin: false,
    rank: 'Novice',
    level: 1,
    points: 0
  });
  
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [showEntryPortal, setShowEntryPortal] = useState(true);
  const [entryStep, setEntryStep] = useState<'welcome' | 'avatar' | 'purpose'>('welcome');
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  
  // Sélection d'un avatar
  const selectAvatarProfile = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setUserData(prev => ({ ...prev, avatar }));
    setEntryStep('purpose');
  };

  // Validation de mot de passe
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mot de passe pour l'accès à CyberForge
    const correctPassword = 'cyber2023';
    if (passwordAttempt.toLowerCase() === correctPassword) {
      setIsPasswordCorrect(true);
      setShowPasswordForm(false);
      setTimeout(() => {
        setEntryStep('avatar');
      }, 2000);
    } else {
      alert('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  // Continuer après la sélection de l'avatar
  const handleContinue = () => {
    setShowEntryPortal(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0e17] text-white' : 'bg-[#f0f4f8] text-gray-900'}`}>
      {showEntryPortal ? (
        // SAS d'entrée immersif modernisé avec effet futuriste
        <div className="min-h-screen relative overflow-hidden bg-[#050a14]">
          {/* Arrière-plan dynamique et moderne */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d3c]/80 via-[#0b1328]/90 to-[#071428]/80 z-0"></div>
          
          {/* Grille hexagonale cyber - effet plus technologique et immersif */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImhleGFncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxwYXRoIGQ9Ik0gMCAtMTAgTCAtOC42NiA1IEwgMCAyMCBMIDguNjYgNSBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMzAsIDg1LCAyMDAsIDAuMTUpIiBzdHJva2Utd2lkdGg9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAsIDMwKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXhhZ3JpZCkiIC8+PC9zdmc+')]  bg-center z-0 opacity-25"></div>
          
          {/* Particules flottantes - effet dynamique et technologique */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute w-1 h-1 rounded-full bg-blue-400 animate-pulse opacity-80`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 8 + 4}s`,
                  animationDelay: `${Math.random() * 5}s`,
                  boxShadow: '0 0 12px 2px rgba(59, 130, 246, 0.5)',
                  transform: `scale(${Math.random() * 1.5 + 0.5})`,
                }}
              />
            ))}
          </div>

          {/* Terminal central - conteneur principal */}
          <div className="container mx-auto h-screen flex flex-col justify-center items-center relative z-10 px-4">
            <div className="text-center mb-2">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 font-mono tracking-tight bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 text-transparent bg-clip-text">
                CyberForge<span className="text-blue-300 animate-pulse">_</span>Academy
              </h1>
              <p className="text-blue-300 max-w-2xl mx-auto">Plateforme d'entraînement immersive à la cybersécurité</p>
            </div>
            
            <AnimatePresence mode="wait">
              {entryStep === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-md"
                >
                  <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-100">Accès sécurisé</CardTitle>
                      <CardDescription className="text-blue-300">
                        Veuillez vous authentifier pour accéder à la plateforme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {showPasswordForm ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-blue-300 mb-1">
                              Code d'accès
                            </label>
                            <input
                              type="password"
                              id="password"
                              value={passwordAttempt}
                              onChange={(e) => setPasswordAttempt(e.target.value)}
                              className="w-full px-3 py-2 bg-black/70 border border-blue-800/60 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="Entrez le code d'accès"
                              required
                            />
                          </div>
                          <Button
                            type="submit" 
                            className="w-full bg-blue-700 hover:bg-blue-600 text-white transition-all"
                          >
                            Accéder
                          </Button>
                        </form>
                      ) : (
                        <div className="p-4 text-center">
                          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100/10 mb-4">
                            <Shield className="h-8 w-8 text-green-500" />
                          </div>
                          <h3 className="text-lg font-medium text-green-400 mb-2">Authentification réussie</h3>
                          <p className="text-sm text-blue-300">Bienvenue dans CyberForge Academy.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {entryStep === 'avatar' && (
                <motion.div
                  key="avatar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-4xl"
                >
                  <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-100">Choisissez votre spécialisation</CardTitle>
                      <CardDescription className="text-blue-300">
                        Sélectionnez un profil pour personnaliser votre parcours d'apprentissage.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {availableAvatars.map((avatar) => (
                          <div 
                            key={avatar.id}
                            onClick={() => selectAvatarProfile(avatar)}
                            className={`relative p-4 rounded-lg border transition-all cursor-pointer
                              ${selectedAvatar?.id === avatar.id 
                                ? 'bg-blue-900/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]' 
                                : 'bg-black/40 border-blue-800/30 hover:bg-blue-900/20 hover:border-blue-700/40'
                              }
                            `}
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 rounded-full bg-blue-950 flex items-center justify-center text-3xl mb-3">
                                {avatar.id === 'shadow' ? '👤' : 
                                 avatar.id === 'sentinel' ? '🔍' :
                                 avatar.id === 'guardian' ? '🛡️' : 
                                 '📡'}
                              </div>
                              <h3 className="font-medium text-blue-100">{avatar.name}</h3>
                              <p className="text-xs text-blue-300 text-center mt-1">
                                {avatar.type === 'hacker' ? 'Hacker Éthique' : 
                                 avatar.type === 'analyst' ? 'Analyste Sécurité' :
                                 avatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                                 'Spécialiste Réseau'}
                              </p>
                              
                              {selectedAvatar?.id === avatar.id && (
                                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg overflow-hidden">
                                  <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-pulse-slow w-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {entryStep === 'purpose' && selectedAvatar && (
                <motion.div
                  key="purpose"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-xl"
                >
                  <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-100">
                        Spécialisation: {selectedAvatar.name}
                      </CardTitle>
                      <CardDescription className="text-blue-300">
                        {selectedAvatar.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-blue-200 mb-2">Compétences principales</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAvatar.primarySkills.map((skill, i) => (
                            <Badge key={i} className="bg-blue-900/60 text-blue-200 border border-blue-700/60">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-blue-200 mb-2">Capacités spéciales</h3>
                        <ul className="text-sm text-blue-300 space-y-1">
                          {selectedAvatar.abilities.map((ability, i) => (
                            <li key={i} className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                              {ability}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all"
                      >
                        Commencer l'entraînement
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Interface principale 
        <div className="container mx-auto px-4 py-8">
          {/* Titre et navigation */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">CyberForge Academy</h1>
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
                    <CardTitle>Profil d'agent</CardTitle>
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
                    <Shield className="h-5 w-5" />
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
                    <BookOpen className="h-5 w-5" />
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
      )}
    </div>
  );
}

export default CyberForge;