import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";

// Contextes importés depuis le module COMMON
import { ChatProvider } from "COMMON/src/contexts/ChatContext";
import { ThemeProvider } from "COMMON/src/contexts/ThemeContext";

// Pages communes importées depuis COMMON
import { Home, ModulesPage, NotFound } from "COMMON/src/pages";

// Pages I AM CYBER importées depuis le module I_AM_CYBER
import {
  CyberMainPage,
  CyberModeSelection,
  CyberAgentPage,
  CyberInterviewSimulation,
  CyberArcade,
  CyberInvestigator,
  DataLeakInvestigation, 
  RansomwareAttack,
  InsiderThreat,
  DigitalForensics,
  ThreatIntelligence,
  CyberDefensePage,
  CyberDefenseSessionPage,
  CyberDefenseMissionPage,
  CyberAscension
} from "I_AM_CYBER/src/pages";

// Pages AMOA importées depuis le module I_AM_mc2i
import {
  AmoaMainPage,
  AmoaModeSelection,
  AmoaInterviewSimulation,
  AmoaQuestPage,
  ProjetImposteur
} from "I_AM_mc2i/src/pages";

// Ces pages n'ont pas encore été déplacées dans la nouvelle structure, 
// elles seront importées depuis leur emplacement original pour le moment
import PasswordPuzzle from "@/pages/cyber/arcade/password-puzzle";
import FirewallDefense from "@/pages/cyber/arcade/firewall-defense";
import ImmersiveSimulation from "@/pages/immersive-simulation";
import ImmersiveScenarioDetail from "@/pages/immersive-scenario-detail";
import ImmersiveSession from "@/pages/immersive-session";

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
            <Route path="/cyber/defense" component={CyberDefensePage} />
            <Route path="/cyber/defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber/defense/mission/:id" component={CyberDefenseMissionPage} />
            
            {/* Anciennes URLs pour compatibilité */}
            <Route path="/cyber-defense-new" component={CyberDefensePage} />
            <Route path="/cyber-defense" component={CyberDefensePage} />
            <Route path="/cyber-defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber-defense/mission/:id" component={CyberDefenseMissionPage} />
            
            {/* Programme Ascension */}
            <Route path="/cyber/ascension" component={CyberAscension} />
            <Route path="/cyber/ascension/theme/:themeId" component={NotYetImplemented} />
            <Route path="/cyber/ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
            
            {/* Anciennes URLs pour compatibilité */}
            <Route path="/cyber-ascension" component={CyberAscension} />
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