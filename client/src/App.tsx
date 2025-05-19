import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Suspense, lazy, startTransition, useState, useEffect } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import AuthScreen from "@/components/auth/AuthScreen";

// Importation des composants directement car le lazy loading provoque des problèmes
// avec wouter dans cette implémentation
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CyberHomePage from "@/pages/CyberHomePage";
import ModulesPage from "@/pages/modules";
import CyberModeSelection from "@/pages/cyber-mode-selection";
import CyberAgentPage from "@/pages/cyber-agent";
// Utiliser les chemins relatifs pour les nouveaux composants
import CyberAgentRedirectPage from "./pages/cyber/cyber-agent-redirect";
import CyberAgentNewPage from "./pages/cyber/cyber-agent-new";
// Import des pages de modules
import DataIaModeSelection from "./pages/data-ia-mode-selection";
import AmoaModeSelectionNew from "./pages/amoa-mode-selection-new";
import ModuleGenerator from "./pages/playground/module-generator";
// Import des pages de la nouvelle interface cyber V3
import CyberV3 from "./pages/cyber-v3";
// Import de la page à propos de FYNE
import FyneAbout from "./pages/fyne-about";
// Import des pages AMOA
import SasAcademie from "./pages/amoa/sas-academie";
import AmoaRoleplay from "./pages/amoa/roleplay";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      // Simuler une vérification d'authentification
      setTimeout(() => {
        // On considère que l'utilisateur est toujours authentifié pour faciliter les tests
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 500);
    };
    
    checkAuth();
  }, []);
  
  // Si l'utilisateur n'est pas authentifié, afficher l'écran d'authentification
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthScreen setIsAuthenticated={setIsAuthenticated} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
  
  // Si authentifié, afficher l'application complète
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ChatProvider>
          <TutorialProvider>
            <div>
              <Switch>
                {/* Routes publiques */}
                <Route path="/" component={CyberHomePage} />
                <Route path="/home-classic" component={Home} />
                <Route path="/modules" component={ModulesPage} />
                <Route path="/fyne-about" component={FyneAbout} />
                
                {/* Routes des modules */}
                <Route path="/cyber" component={CyberV3} />
                <Route path="/cyber-v3" component={CyberV3} />
                <Route path="/cyber-old" component={CyberModeSelection} />
                <Route path="/data-ia" component={DataIaModeSelection} />
                <Route path="/amoa/new" component={AmoaModeSelectionNew} />
                <Route path="/amoa/sas-academie" component={SasAcademie} />
                <Route path="/amoa/roleplay" component={AmoaRoleplay} />
                <Route path="/playground/module-generator" component={ModuleGenerator} />
                
                {/* Route par défaut (404) */}
                <Route component={NotFound} />
              </Switch>
              <Toaster />
            </div>
          </TutorialProvider>
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;