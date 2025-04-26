import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Importation des pages communes
import NotFound from "@/pages/common/not-found";
import Home from "@/pages/common/home";
import ModulesPage from "@/pages/common/modules";

// Pages I AM CYBER
import CyberModeSelection from "@/pages/iamcyber/mode-selection";
import CyberAgentPage from "@/pages/iamcyber/agent";
import CyberMainPage from "@/pages/iamcyber";

// Centre de crise
import CentreDeCriseEvolutifPage from "@/pages/iamcyber/defense"; // Nouvelle implémentation
import CyberDefenseSessionPage from "@/pages/iamcyber/defense/session"; // Session
import CyberDefenseMissionPage from "@/pages/iamcyber/defense/mission"; // Mission

// Arcade et mini-jeux
import CyberArcade from "@/pages/iamcyber/arcade";
// Anciens jeux (garder la compatibilité temporairement)
import PasswordPuzzle from "@/pages/cyber/arcade/password-puzzle";
import FirewallDefense from "@/pages/cyber/arcade/firewall-defense";
// Nouveaux jeux d'enquête
import CyberInvestigator from "@/pages/iamcyber/arcade/investigator";
import DataLeakInvestigation from "@/pages/iamcyber/arcade/investigator/data-leak";
import RansomwareAttack from "@/pages/iamcyber/arcade/investigator/ransomware-attack";
import InsiderThreat from "@/pages/iamcyber/arcade/investigator/insider-threat";
import DigitalForensics from "@/pages/iamcyber/arcade/digital-forensics";
import ThreatIntelligence from "@/pages/iamcyber/arcade/threat-intelligence";

// Pages I AM mc2i (AMOA)
import AmoaMainPage from "@/pages/iammc2i";
import AmoaModeSelection from "@/pages/iammc2i/mode-selection";
import AmoaQuestPage from "@/pages/iammc2i/quest";
import ProjetImposteur from "@/pages/iammc2i/impostor";

// Modules Simulation d'Entretien
import CyberInterviewSimulation from "@/pages/iamcyber/interview";
import AmoaInterviewSimulation from "@/pages/iammc2i/interview";

// Autres pages (à déplacer plus tard)
import ImmersiveSimulation from "@/pages/immersive-simulation";
import ImmersiveScenarioDetail from "@/pages/immersive-scenario-detail";
import ImmersiveSession from "@/pages/immersive-session";

// Router principal - toutes les routes sont définies dans App()

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
      <ThemeProvider>
        <ChatProvider>
          <Switch>
            {/* Routes Communes */}
            <Route path="/" component={Home} />
            <Route path="/modules" component={ModulesPage} />
            
            {/* Routes I AM CYBER */}
            <Route path="/cyber" component={CyberMainPage} />
            <Route path="/cyber/mode-selection" component={CyberModeSelection} />
            <Route path="/cyber/agent" component={CyberAgentPage} />
            <Route path="/cyber/interview" component={CyberInterviewSimulation} />
            
            {/* Ancienne URL pour compatibilité */}
            <Route path="/cyber/interview-simulation" component={CyberInterviewSimulation} />
            
            {/* Arcade et jeux */}
            <Route path="/cyber/arcade" component={CyberArcade} />
            {/* Anciennes routes de jeux (pour compatibilité temporaire) */}
            <Route path="/cyber/arcade/password-puzzle" component={PasswordPuzzle} />
            <Route path="/cyber/arcade/firewall-defense" component={FirewallDefense} />
            {/* Nouvelles routes pour les jeux d'enquête */}
            <Route path="/cyber/arcade/investigator" component={CyberInvestigator} />
            <Route path="/cyber/arcade/investigator/data-leak" component={DataLeakInvestigation} />
            <Route path="/cyber/arcade/investigator/ransomware-attack" component={RansomwareAttack} />
            <Route path="/cyber/arcade/investigator/insider-threat" component={InsiderThreat} />
            <Route path="/cyber/arcade/digital-forensics" component={DigitalForensics} />
            <Route path="/cyber/arcade/threat-intelligence" component={ThreatIntelligence} />
            
            {/* Centre de crise */}
            <Route path="/cyber/defense" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber/defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber/defense/mission/:id" component={CyberDefenseMissionPage} />
            
            {/* Anciennes URLs pour compatibilité */}
            <Route path="/cyber-defense-new" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber-defense/mission/:id" component={CyberDefenseMissionPage} />
            
            {/* Programme Ascension */}
            <Route path="/cyber/ascension" component={NotYetImplemented} />
            <Route path="/cyber/ascension/theme/:themeId" component={NotYetImplemented} />
            <Route path="/cyber/ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
            
            {/* Anciennes URLs pour compatibilité */}
            <Route path="/cyber-ascension" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
            
            {/* Routes I AM mc2i (AMOA) */}
            <Route path="/amoa" component={AmoaMainPage} />
            <Route path="/amoa/mode-selection" component={AmoaModeSelection} />
            <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
            <Route path="/amoa/quest" component={AmoaQuestPage} />
            <Route path="/amoa/projet-imposteur" component={ProjetImposteur} />
            <Route path="/amoa/interview" component={AmoaInterviewSimulation} />
            <Route path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
            
            {/* Autres routes */}
            <Route path="/immersive-simulation" component={ImmersiveSimulation} />
            <Route path="/immersive-simulation/:id" component={ImmersiveScenarioDetail} />
            <Route path="/immersive-simulation/session/:id" component={ImmersiveSession} />
            <Route path="/data-ia" component={NotYetImplemented} />
            <Route path="/custom" component={NotYetImplemented} />
            
            {/* Page 404 */}
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
