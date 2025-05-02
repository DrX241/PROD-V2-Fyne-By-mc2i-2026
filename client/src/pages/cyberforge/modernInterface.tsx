// Interface principale modernisée - Immersive, gamifiée et professionnelle
<div className="min-h-screen bg-[#040b18] relative overflow-hidden">
  {/* Effet de fond cybernétique dynamique */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a3c]/90 via-[#071328]/80 to-[#051020]/90 z-0"></div>
  
  {/* Grille cyber futuriste */}
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImhleGFncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxwYXRoIGQ9Ik0gMCAtMTAgTCAtOC42NiA1IEwgMCAyMCBMIDguNjYgNSBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMzAsIDgwLCAyMDAsIDAuMDgpIiBzdHJva2Utd2lkdGg9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAsIDMwKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoZXhhZ3JpZCkiIC8+PC9zdmc+')]  bg-center z-0 opacity-30"></div>
  
  {/* Particules dynamiques et HUD elements */}
  <div className="absolute inset-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <div 
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse opacity-60"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 8 + 2}s`,
          animationDelay: `${Math.random() * 5}s`,
          boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.3)',
          transform: `scale(${Math.random() * 1.2 + 0.3})`,
        }}
      />
    ))}
  </div>
  
  {/* Interface principale gamifiée */}
  <div className="relative z-10 container mx-auto px-4 py-8 text-white">
    {/* Barre de navigation supérieure avec HUD cybernétique */}
    <div className="relative mb-8">
      <div className="absolute -top-0.5 -left-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] bg-gradient-to-r from-blue-500/40 via-indigo-500/20 to-blue-500/40 blur-sm rounded-md"></div>
      <div className="relative flex justify-between items-center p-4 rounded-md bg-[#0a1a2e]/90 backdrop-blur-sm border-t border-l border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <h1 className="text-3xl font-bold font-mono tracking-tight bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 text-transparent bg-clip-text">
              CyberForge<span className="text-blue-300 animate-pulse">_</span>Academy
            </h1>
            {/* Effet de scan radar */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-scan"></div>
          </div>
          
          <Badge className="bg-blue-900/60 text-blue-200 border border-blue-700/60 hover:bg-blue-800/60 transition-colors">
            <Circle className="h-2 w-2 mr-1 text-green-400 animate-pulse fill-green-400" /> Connecté
          </Badge>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-3 pr-4 border-r border-blue-700/40">
            <div className="flex flex-col items-end">
              <div className="text-xs text-blue-300">Score global</div>
              <div className="font-mono text-lg font-bold text-blue-100">50</div>
            </div>
            <div className="relative w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-800/50">
              <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
              <div className="absolute inset-0 border border-blue-400/20 rounded-full animate-ping-slow"></div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="border-blue-800/50 bg-blue-900/30 text-blue-100 hover:bg-blue-800/40 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Retour</span>
          </Button>
        </div>
      </div>
    </div>
    
    {/* Dashboard principal avec aperçu des modules et progression */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Colonne gauche: Profil et stats */}
      <div className="lg:col-span-1">
        <div className="p-5 rounded-xl mb-6 bg-[#0a1a2e]/80 backdrop-blur-sm border border-blue-900/30 shadow-[0_0_15px_rgba(30,64,175,0.15)]">
          <h2 className="text-lg font-bold mb-3 text-blue-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-300" /> Intelligence de sécurité
          </h2>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-md bg-[#0c1f36]/80 border border-blue-800/40">
              <div className="text-xs text-blue-300 mb-1">Missions complétées</div>
              <div className="text-xl font-mono font-bold text-white">0/12</div>
            </div>
            
            <div className="p-3 rounded-md bg-[#0c1f36]/80 border border-blue-800/40">
              <div className="text-xs text-blue-300 mb-1">Rang actuel</div>
              <div className="text-xl font-mono font-bold text-white">Novice</div>
            </div>
          </div>
        </div>
        
        {selectedAvatar && (
          <div className="p-5 rounded-xl mb-6 bg-[#0a1a2e]/80 backdrop-blur-sm border border-blue-900/30 shadow-[0_0_15px_rgba(30,64,175,0.15)]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/40 via-cyan-400/20 to-blue-500/40 animate-rotate-slow blur-md"></div>
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-500/30 z-10">
                  <span className="text-2xl">{
                    selectedAvatar.id === 'shadow' ? '👤' : 
                    selectedAvatar.id === 'sentinel' ? '🔍' :
                    selectedAvatar.id === 'guardian' ? '🛡️' : 
                    '📡'
                  }</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                  {selectedAvatar.name}
                  <Badge className="bg-gradient-to-r from-green-700 to-green-600 text-white border-0 shadow-inner shadow-green-900/50 text-xs">
                    Niveau 1
                  </Badge>
                </h3>
                <p className="text-blue-300 text-sm">
                  {selectedAvatar.type === 'hacker' ? 'Hacker Éthique' : 
                   selectedAvatar.type === 'analyst' ? 'Analyste Sécurité' :
                   selectedAvatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                   'Spécialiste Réseau'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    size="sm"
                    className="bg-blue-800/60 hover:bg-blue-700/60 text-blue-100 text-xs py-1 border border-blue-700/30"
                    onClick={() => setLocation('/cyberforge/modules')}
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Modules
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-blue-800/50 bg-transparent text-blue-300 hover:bg-blue-900/40 text-xs py-1"
                    onClick={() => setEntryStep('welcome')}
                  >
                    <User className="mr-1 h-3 w-3" />
                    Profil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Colonne centrale et droite: Modules et missions */}
      <div className="lg:col-span-2">
        <div className="p-5 rounded-xl mb-6 bg-[#0a1a2e]/80 backdrop-blur-sm border border-blue-900/30 shadow-[0_0_15px_rgba(30,64,175,0.15)]">
          <h2 className="text-lg font-bold mb-4 text-blue-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-300" /> Modules de formation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border border-blue-800/30 bg-[#0c1f36]/80 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-medium mb-2 flex items-center gap-2 text-blue-100">
                <Shield className="h-4 w-4 text-blue-400" /> Fondamentaux
              </h3>
              <p className="text-sm text-blue-300">Principes de base et concepts essentiels en cybersécurité.</p>
              <div className="mt-3 flex justify-between items-center">
                <Badge className="bg-green-900/40 text-green-300 border-green-800/40">Débloqué</Badge>
                <Button 
                  size="sm" 
                  onClick={() => setLocation('/cyberforge/modules')}
                  className="text-xs py-0.5 h-7 bg-blue-800/50 hover:bg-blue-700/60 text-blue-100"
                >
                  Démarrer
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-md border border-blue-800/30 bg-[#0c1f36]/80 relative overflow-hidden group opacity-60">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-medium mb-2 flex items-center gap-2 text-blue-100">
                <Terminal className="h-4 w-4 text-green-400" /> Sécurité réseau
              </h3>
              <p className="text-sm text-blue-300">Protection des infrastructures et détection des intrusions.</p>
              <div className="mt-3 flex justify-between items-center">
                <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/40">Niveau 2</Badge>
                <LockIcon className="h-4 w-4 text-blue-500/70" />
              </div>
            </div>
            
            <div className="p-4 rounded-md border border-blue-800/30 bg-[#0c1f36]/80 relative overflow-hidden group opacity-60">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="font-medium mb-2 flex items-center gap-2 text-blue-100">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Analyse d'attaques
              </h3>
              <p className="text-sm text-blue-300">Techniques d'investigation et analyse des incidents de sécurité.</p>
              <div className="mt-3 flex justify-between items-center">
                <Badge className="bg-red-900/40 text-red-300 border-red-800/40">Niveau 3</Badge>
                <LockIcon className="h-4 w-4 text-blue-500/70" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setLocation('/cyberforge/modules')}
              className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 border border-blue-600/30 text-white shadow-lg shadow-blue-900/20"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Voir tous les modules
            </Button>
          </div>
        </div>
        
        <div className="p-5 rounded-xl bg-[#0a1a2e]/80 backdrop-blur-sm border border-blue-900/30 shadow-[0_0_15px_rgba(30,64,175,0.15)]">
          <h2 className="text-lg font-bold mb-4 text-blue-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" /> Menaces en temps réel
          </h2>
          
          <div className="p-4 rounded-md border border-red-900/40 bg-[#1c121e]/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-red-500/70 to-red-900/40"></div>
            <div className="flex items-center">
              <div className="mr-4 relative">
                <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center border border-red-700/30">
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping-slow"></div>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-red-300">Simulation d'attaque disponible</h3>
                <p className="text-xs text-red-200/80 mt-1">Une nouvelle simulation d'attaque avancée est prête pour tester vos compétences en détection et réponse.</p>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-900/30 border-red-800/40 text-red-200 hover:bg-red-800/40 transition-all text-xs py-0 h-7"
                  >
                    <PlayCircle className="mr-1 h-3 w-3" />
                    Démarrer la simulation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>