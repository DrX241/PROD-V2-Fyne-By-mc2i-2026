import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, startTransition } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Importation des composants directement car le lazy loading provoque des problèmes
// avec wouter dans cette implémentation
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ModulesPage from "@/pages/modules";
import CyberModeSelection from "@/pages/cyber-mode-selection";
import CyberAgentPage from "@/pages/cyber-agent";
// Utiliser les chemins relatifs pour les nouveaux composants
import CyberAgentRedirectPage from "./pages/cyber/cyber-agent-redirect";
import CyberAgentNewPage from "./pages/cyber/cyber-agent-new";
// EmergencyResponsePage a été supprimé

// Import de la nouvelle page Playground
import PlaygroundPage from "./pages/playground";
import ModuleDetailPage from "./pages/playground/module";
// Suppression de l'import CyberForge

// Import de la page mc2i AI Learning
import McaiLearning from "@/pages/mcai-learning";
import OutilsIAPage from "@/pages/outils-ia";
import Mc2iLearningOutils from "@/pages/outils-ia/mc2i-learning";

// Import des pages Assistants IA Personnalisés
import CustomAssistantPage from "@/pages/outils-ia/assistant";
import CreateAssistantPage from "@/pages/outils-ia/assistant/create";
import AssistantChatPage from "@/pages/outils-ia/assistant/[id]";

// Import des pages CENTRE DE CRISE (anciennes et nouvelles pour permettre une transition)
import CyberDefensePage from "@/pages/cyber-defense"; // Ancienne implémentation 
import CentreDeCriseEvolutifPage from "@/pages/cyber-defense-new"; // Nouvelle implémentation
import CyberDefenseSessionPage from "@/pages/cyber-defense-session"; // Nouvelle implémentation de session
import CyberDefenseMissionPage from "@/pages/cyber-defense-mission"; // Ancienne implémentation

// Arcade et mini-jeux
import CyberArcade from "@/pages/cyber/arcade";
// Les anciens jeux ont été supprimés
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
// Module Apprendre en échangeant
import ExpertLearningPage from "@/pages/cyber/expert-learning";
// Suppression des imports existants de CyberForge
// Autres pages
import ImmersiveSimulation from "@/pages/immersive-simulation";
import ImmersiveScenarioDetail from "@/pages/immersive-scenario-detail";
import ImmersiveSession from "@/pages/immersive-session";

// Router principal - toutes les routes sont définies dans App()

// Composant pour les modules non encore implémentés ou supprimés
function NotYetImplemented() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Module non disponible</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        Ce module n'est plus disponible ou est en cours de restructuration.
      </p>
      <a 
        href="/cyber" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4"
      >
        Retour aux modules Cyber
      </a>
      <a 
        href="/" 
        className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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
            <Route path="/cyber/cyber-agent" component={CyberAgentRedirectPage} /> {/* Redirection vers la nouvelle version */}
            <Route path="/cyber/cyber-agent-old" component={CyberAgentRedirectPage} /> {/* Ancienne version (redirection) */}
            <Route path="/cyber/cyber-agent-new" component={CyberAgentNewPage} /> {/* Nouvelle version du module Cyber Agent */}
            <Route path="/cyber/expert-learning" component={ExpertLearningPage} /> {/* Module Apprendre en échangeant */}
            <Route path="/cyber/learning/cyber-mastery" component={() => {
              // Import dynamique de la nouvelle page Cyber Mastery
              const CyberMasteryPage = lazy(() => import('./pages/cyber/learning/cyber-mastery'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberMasteryPage />
                </Suspense>
              );
            }} />
            <Route path="/cyber/learning/cyber-mastery/sensibilisation" component={() => {
              // Import dynamique du module de sensibilisation cybersécurité (version gamifiée)
              const SensibilisationCyberGame = lazy(() => import('./pages/cyber/learning/modules/sensibilisation-cyber-game'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <SensibilisationCyberGame />
                </Suspense>
              );
            }} />
            <Route path="/cyber/learning/cyber-mastery/:themeId" component={NotYetImplemented} />
            {/* Module d'arcade cyber et jeux d'enquête */}
            <Route path="/cyber/arcade" component={CyberArcade} />
            <Route path="/cyber/arcade/cyber-investigator" component={CyberInvestigator} />
            <Route path="/cyber/arcade/cyber-investigator/data-leak" component={DataLeakInvestigation} />
            <Route path="/cyber/arcade/cyber-investigator/ransomware-attack" component={RansomwareAttack} />
            <Route path="/cyber/arcade/cyber-investigator/insider-threat" component={InsiderThreat} />
            <Route path="/cyber/arcade/digital-forensics" component={DigitalForensics} />
            <Route path="/cyber/arcade/threat-intelligence" component={ThreatIntelligence} />
<Route path="/cyber/arcade/code-shield" component={() => {
              const CodeShieldComponent = lazy(() => import('./pages/cyber/arcade/code-shield'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CodeShieldComponent />
                </Suspense>
              );
            }} />
            
            <Route path="/cyber/arcade/code-shield/levels/signatures" component={() => {
              const SignaturesComponent = lazy(() => import('./pages/cyber/arcade/code-shield/levels/signatures'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <SignaturesComponent />
                </Suspense>
              );
            }} />
            
            <Route path="/cyber/arcade/code-shield/levels/static-analysis" component={() => {
              const StaticAnalysisComponent = lazy(() => import('./pages/cyber/arcade/code-shield/levels/static-analysis'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <StaticAnalysisComponent />
                </Suspense>
              );
            }} />
            
            <Route path="/cyber/arcade/code-shield/lab" component={() => {
              const LabComponent = lazy(() => import('./pages/cyber/arcade/code-shield/lab'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <LabComponent />
                </Suspense>
              );
            }} />
            
            {/* Module Playground pour l'apprentissage de la cybersécurité */}
            <Route path="/playground" component={PlaygroundPage} />
            <Route path="/playground/module" component={ModuleDetailPage} />
            <Route path="/playground/module/:moduleId" component={ModuleDetailPage} />
            <Route path="/playground/path/:pathId" component={PlaygroundPage} />
            
            {/* Module CyberForge Academy */}
            {/* Suppression de la route CyberForge Academy */}
            
            {/* Ancienne route mc2i AI Learning (redirigée vers nouvelle section pour compatibilité) */}
            <Route path="/mcai-learning" component={() => {
              window.location.href = '/outils-ia/mc2i-learning';
              return null;
            }} />
            
            {/* Nouvelle section Outils IA */}
            <Route path="/outils-ia" component={OutilsIAPage} />
            <Route path="/outils-ia/mc2i-learning" component={Mc2iLearningOutils} />
            <Route path="/outils-ia/assistant" component={CustomAssistantPage} />
            <Route path="/outils-ia/assistant/create" component={CreateAssistantPage} />
            <Route path="/outils-ia/assistant/:id" component={AssistantChatPage} />
            <Route path="/outils-ia/code-generator" component={() => {
              // Import dynamique du générateur de code
              const CodeGeneratorPage = lazy(() => import('./pages/outils-ia/code-generator'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CodeGeneratorPage />
                </Suspense>
              );
            }} />
            
            {/* Routes d'administration pour les assistants */}
            <Route path="/outils-ia/admin" component={() => {
              // Import dynamique de la page d'administration
              const AdminDashboardPage = lazy(() => import('./pages/outils-ia/admin'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <AdminDashboardPage />
                </Suspense>
              );
            }} />
            <Route path="/outils-ia/admin/duplicates" component={() => {
              // Import dynamique de la page de gestion des doublons
              const DuplicatesPage = lazy(() => import('./pages/outils-ia/admin/duplicates'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DuplicatesPage />
                </Suspense>
              );
            }} />
            
            {/* Toutes les routes CyberForge redirigent vers la page "non disponible" */}
            <Route path="/cyberforge" component={NotYetImplemented} />
            <Route path="/cyberforge/academy" component={NotYetImplemented} />
            <Route path="/cyberforge/modules" component={NotYetImplemented} />
            <Route path="/cyberforge/modules/:moduleId" component={NotYetImplemented} />
            <Route path="/cyberforge/modules/lesson/:moduleId/:chapterId/:lessonId" component={NotYetImplemented} />
            
            {/* Module Centre de Crise */}
            <Route path="/cyber-defense-new" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense/session/:levelId" component={CyberDefenseSessionPage} />
            <Route path="/cyber-defense" component={CentreDeCriseEvolutifPage} />
            <Route path="/cyber-defense/mission/:id" component={CyberDefenseMissionPage} />
            
            {/* Module Simulation Immersive */}
            <Route path="/immersive-simulation" component={ImmersiveSimulation} />
            <Route path="/immersive-simulation/:id" component={ImmersiveScenarioDetail} />
            <Route path="/immersive-simulation/session/:id" component={ImmersiveSession} />
            
            {/* Modules obsolètes redirigés vers page d'erreur */}
            <Route path="/cyber/emergency-response" component={NotYetImplemented} />
            <Route path="/cyber-ascension" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId" component={NotYetImplemented} />
            <Route path="/cyber-ascension/theme/:themeId/level/:levelId" component={NotYetImplemented} />
            
            {/* Routes héritées pour compatibilité */}
            <Route path="/cyber/arcade/password-puzzle" component={NotYetImplemented} />
            <Route path="/cyber/arcade/firewall-defense" component={NotYetImplemented} />
            <Route path="/data-ia" component={() => {
              const DataIaModeSelection = lazy(() => import('./pages/data-ia-mode-selection'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIaModeSelection />
                </Suspense>
              );
            }} />
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
