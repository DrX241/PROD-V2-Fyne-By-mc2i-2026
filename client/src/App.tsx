import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Importation des composants directement car le lazy loading provoque des problèmes
// avec wouter dans cette implémentation
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ModulesPage from "@/pages/modules";
import CyberModeSelection from "@/pages/cyber-mode-selection";
import CyberAgentPage from "@/pages/cyber-agent";
import EmergencyResponsePage from "@/pages/cyber/emergency-response"; // Nouveau système d'urgence cyber interactif
import CyberChallengePage from "@/pages/cyber/cyber-challenge"; // Nouveau module CyberChallenge

// Import des pages CENTRE DE CRISE (anciennes et nouvelles pour permettre une transition)
import CyberDefensePage from "@/pages/cyber-defense"; // Ancienne implémentation 
import CentreDeCriseEvolutifPage from "@/pages/cyber-defense-new"; // Nouvelle implémentation
import CyberDefenseSessionPage from "@/pages/cyber-defense-session"; // Nouvelle implémentation de session
import CyberDefenseMissionPage from "@/pages/cyber-defense-mission"; // Ancienne implémentation

// Arcade et mini-jeux
import CyberArcade from "@/pages/cyber/arcade";
// Anciens jeux
import PasswordPuzzle from "@/pages/cyber/arcade/password-puzzle";
import FirewallDefense from "@/pages/cyber/arcade/firewall-defense";
// Nouveaux jeux d'enquête
import CyberInvestigator from "@/pages/cyber/arcade/cyber-investigator";
import DataLeakInvestigation from "@/pages/cyber/arcade/cyber-investigator/data-leak";
import RansomwareAttack from "@/pages/cyber/arcade/cyber-investigator/ransomware-attack";
import InsiderThreat from "@/pages/cyber/arcade/cyber-investigator/insider-threat";
import DigitalForensics from "@/pages/cyber/arcade/digital-forensics";
import ThreatIntelligence from "@/pages/cyber/arcade/threat-intelligence";
// Pages AMOA
import AmoaPage from "@/pages/amoa";
import AmoaModeSelection from "@/pages/amoa-mode-selection";
import AmoaQuestPage from "@/pages/amoa/quest";
// Modules Simulation d'Entretien
import CyberInterviewSimulation from "@/pages/cyber/interview-simulation";
import AmoaInterviewSimulation from "@/pages/amoa/interview-simulation";
import ProjetImposteur from "@/pages/amoa/projet-imposteur";
// Autres pages
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
            <Route path="/cyber/interview-simulation" component={CyberInterviewSimulation} />
            <Route path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
            <Route path="/" component={Home} />
            <Route path="/modules" component={ModulesPage} />
            <Route path="/cyber" component={CyberModeSelection} />
            <Route path="/cyber/agent" component={CyberAgentPage} />
            <Route path="/cyber/emergency-response" component={EmergencyResponsePage} />
            <Route path="/cyber/cyber-challenge" component={CyberChallengePage} />
            <Route path="/cyber/arcade" component={CyberArcade} />
            {/* Anciennes routes de jeux (pour compatibilité) */}
            <Route path="/cyber/arcade/password-puzzle" component={PasswordPuzzle} />
            <Route path="/cyber/arcade/firewall-defense" component={FirewallDefense} />
            {/* Nouvelles routes pour les jeux d'enquête */}
            <Route path="/cyber/arcade/cyber-investigator" component={CyberInvestigator} />
            <Route path="/cyber/arcade/cyber-investigator/data-leak" component={DataLeakInvestigation} />
            <Route path="/cyber/arcade/cyber-investigator/ransomware-attack" component={RansomwareAttack} />
            <Route path="/cyber/arcade/cyber-investigator/insider-threat" component={InsiderThreat} />
            <Route path="/cyber/arcade/digital-forensics" component={DigitalForensics} />
            <Route path="/cyber/arcade/threat-intelligence" component={ThreatIntelligence} />
            <Route path="/cyber-defense-new" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber-defense" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense/mission/:id" component={CyberDefenseMissionPage} />
            <Route path="/immersive-simulation" component={ImmersiveSimulation} />
            <Route path="/immersive-simulation/:id" component={ImmersiveScenarioDetail} />
            <Route path="/immersive-simulation/session/:id" component={ImmersiveSession} />
            <Route path="/cyber-ascension" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
            <Route path="/data-ia" component={NotYetImplemented} />
            <Route path="/amoa" component={AmoaPage} />
            <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
            <Route path="/amoa/quest" component={AmoaQuestPage} />
            <Route path="/amoa/projet-imposteur" component={ProjetImposteur} />
            <Route path="/custom" component={NotYetImplemented} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
