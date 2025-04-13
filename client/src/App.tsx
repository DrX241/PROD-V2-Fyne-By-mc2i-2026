import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, useState, useEffect } from "react";
import { ChatProvider } from "./contexts/ChatContext";

// Importation des composants directement car le lazy loading provoque des problèmes
// avec wouter dans cette implémentation
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ModulesPage from "@/pages/modules";
import FyneInitialization from "@/pages/fyne-initialization";
import CyberModeSelection from "@/pages/cyber-mode-selection";
import CyberAgentPage from "@/pages/cyber-agent";

// Import des pages CENTRE DE CRISE ÉVOLUTIF (anciennes et nouvelles pour permettre une transition)
import CyberDefensePage from "@/pages/cyber-defense"; // Ancienne implémentation 
import CentreDeCriseEvolutifPage from "@/pages/cyber-defense-new"; // Nouvelle implémentation
import CyberDefenseSessionPage from "@/pages/cyber-defense-session"; // Nouvelle implémentation de session
import CyberDefenseMissionPage from "@/pages/cyber-defense-mission"; // Ancienne implémentation

import CyberArcade from "@/pages/cyber-arcade";
import CyberArcadeGame from "@/pages/cyber-arcade-game";
// Nouvelles pages optimisées pour l'Arcade
import FirewallDefensePage from "@/pages/cyber/arcade/firewall-defense";
import PasswordGuardianPage from "@/pages/cyber/arcade/password-guardian";
import NetworkPuzzlePage from "@/pages/cyber/arcade/network-puzzle";
import CyberQuizChallengePage from "@/pages/cyber/arcade/cyber-quiz";
import CyberDetectivePage from "@/pages/cyber/arcade/cyber-detective";
import OsintInvestigatorPage from "@/pages/cyber/arcade/osint-investigator";
// Pages AMOA
import AmoaPage from "@/pages/amoa";
import AmoaModeSelection from "@/pages/amoa-mode-selection";
import AmoaQuestPage from "@/pages/amoa/quest";
// Modules Simulation d'Entretien
import CyberInterviewSimulation from "@/pages/cyber/interview-simulation";
import AmoaInterviewSimulation from "@/pages/amoa/interview-simulation";
// Autres pages
import ImmersiveSimulation from "@/pages/immersive-simulation";
import ImmersiveScenarioDetail from "@/pages/immersive-scenario-detail";
import ImmersiveSession from "@/pages/immersive-session";

// Composant InitializationWrapper pour vérifier si on a déjà vu l'initialisation
function InitializationWrapper() {
  const [, navigate] = useLocation();
  const [hasSeenInitialization, setHasSeenInitialization] = useState(() => {
    return localStorage.getItem('hasSeenInitialization') === 'true';
  });
  
  useEffect(() => {
    // Si c'est la première visite, on affiche l'initialisation
    if (!hasSeenInitialization) {
      // On marquera comme vu lors de la navigation vers /home depuis la page d'initialisation
      return;
    } else {
      // Si on a déjà vu l'initialisation, on redirige vers la page d'accueil
      navigate('/home');
    }
  }, [hasSeenInitialization, navigate]);
  
  // On affiche toujours l'initialisation, la redirection se fait via useEffect
  return <FyneInitialization />;
}

// Composant temporaire pour les modules non encore implémentés
function NotYetImplemented() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Module en développement</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        Ce module est actuellement en cours de développement et sera disponible prochainement.
      </p>
      <a 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}

// Composant de chargement global
const GlobalLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-white mt-4">Chargement...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Switch>
          {/* Route principale avec le wrapper d'initialisation */}
          <Route path="/" component={InitializationWrapper} />
          
          {/* Simulation d'entretien (pages spéciales qui doivent rester en haut) */}
          <Route path="/cyber/interview-simulation" component={CyberInterviewSimulation} />
          <Route path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
          
          {/* Routes standards */}
          <Route path="/home" component={Home} />
          <Route path="/modules" component={ModulesPage} />
          
          {/* Routes Cyber */}
          <Route path="/cyber" component={CyberModeSelection} />
          <Route path="/cyber/agent" component={CyberAgentPage} />
          
          {/* Routes Arcade */}
          <Route path="/cyber/arcade" component={CyberArcade} />
          <Route path="/cyber/arcade/network-puzzle" component={NetworkPuzzlePage} />
          <Route path="/cyber/arcade/password-guardian" component={PasswordGuardianPage} />
          <Route path="/cyber/arcade/cyber-quiz" component={CyberQuizChallengePage} />
          <Route path="/cyber/arcade/cyber-detective" component={CyberDetectivePage} />
          <Route path="/cyber/arcade/cyber-detective/game" component={CyberDetectivePage} />
          <Route path="/cyber/arcade/osint-investigator" component={OsintInvestigatorPage} />
          <Route path="/cyber/arcade/firewall-defense" component={NetworkPuzzlePage} />
          <Route path="/cyber/arcade/:gameId" component={CyberArcadeGame} />
          
          {/* Routes Centre de Crise Évolutif */}
          <Route path="/cyber-defense-new" component={CentreDeCriseEvolutifPage} />
          <Route path="/cyber-defense/session/:levelId" component={CyberDefenseSessionPage} />
          <Route path="/cyber-defense" component={CentreDeCriseEvolutifPage} />
          <Route path="/cyber-defense/mission/:id" component={CyberDefenseMissionPage} />
          
          {/* Routes Simulation Immersive */}
          <Route path="/immersive-simulation" component={ImmersiveSimulation} />
          <Route path="/immersive-simulation/:id" component={ImmersiveScenarioDetail} />
          <Route path="/immersive-simulation/session/:id" component={ImmersiveSession} />
          
          {/* Routes Cyber Ascension */}
          <Route path="/cyber-ascension" component={NotYetImplemented} />
          <Route path="/cyber-ascension/theme/:themeId" component={NotYetImplemented} />
          <Route path="/cyber-ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
          
          {/* Autres modules */}
          <Route path="/data-ia" component={NotYetImplemented} />
          <Route path="/amoa" component={AmoaPage} />
          <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
          <Route path="/amoa/quest" component={AmoaQuestPage} />
          <Route path="/custom" component={NotYetImplemented} />
          
          {/* Page 404 */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
