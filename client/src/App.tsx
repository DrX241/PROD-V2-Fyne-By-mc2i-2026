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
import ModuleGeneratorPage from "./pages/playground/module-generator";
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
            <Route path="/cyber-mode-selection" component={CyberModeSelection} />
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
            {/* CyberQuest a été supprimé */}
            
            {/* Module d'arcade cyber et jeux d'enquête */}
            <Route path="/cyber/arcade" component={CyberArcade} />
            <Route path="/cyber/arcade/cyber-investigator" component={CyberInvestigator} />
            <Route path="/cyber/arcade/cyber-investigator/data-leak" component={DataLeakInvestigation} />
            <Route path="/cyber/arcade/cyber-investigator/ransomware-attack" component={RansomwareAttack} />
            <Route path="/cyber/arcade/cyber-investigator/insider-threat" component={InsiderThreat} />
            <Route path="/cyber/arcade/digital-forensics" component={DigitalForensics} />
            <Route path="/cyber/arcade/threat-intelligence" component={ThreatIntelligence} />
            <Route path="/cyber/arcade/firewall-tactique" component={() => {
              const FirewallTactiqueComponent = lazy(() => import('./pages/cyber/arcade/firewall-tactique'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <FirewallTactiqueComponent />
                </Suspense>
              );
            }} />

            <Route path="/cyber/arcade/cyber-escape-v2" component={() => {
              const CyberEscapeV2Component = lazy(() => import('./pages/cyber/arcade/cyber-escape-v2'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberEscapeV2Component />
                </Suspense>
              );
            }} />
            <Route path="/cyber/arcade/brain-hacker" component={() => {
              const BrainHackerComponent = lazy(() => import('./pages/cyber/arcade/brain-hacker'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <BrainHackerComponent />
                </Suspense>
              );
            }} />
            <Route path="/cyber/test-technique" component={() => {
              const CyberTestTechnique = lazy(() => import('./pages/cyber/test-technique'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberTestTechnique />
                </Suspense>
              );
            }} />
            
            {/* Section Outils Cyber */}
            <Route path="/cyber/tools" component={() => {
              const ToolsPageComponent = lazy(() => import('./pages/cyber/tools'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <ToolsPageComponent />
                </Suspense>
              );
            }} />
            <Route path="/cyber/tools/policy-converter" component={() => {
              const PolicyConverterComponent = lazy(() => import('./pages/cyber/tools/policy-converter'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <PolicyConverterComponent />
                </Suspense>
              );
            }} />
            <Route path="/cyber/tools/phishing-simulator" component={() => {
              const PhishingSimulatorComponent = lazy(() => import('./pages/cyber/tools/phishing-simulator'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <PhishingSimulatorComponent />
                </Suspense>
              );
            }} />
            
            <Route path="/cyber/interview-test" component={() => {
              const CyberInterviewTest = lazy(() => import('./pages/cyber/interview-test'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberInterviewTest />
                </Suspense>
              );
            }} />
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
            
            {/* Générateur de Modules et affichage des modules personnalisés */}
            <Route path="/playground/module-generator" component={ModuleGeneratorPage} />
            <Route path="/custom-module/:id" component={() => {
              const CustomModulePage = lazy(() => import('./pages/custom-module'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CustomModulePage />
                </Suspense>
              );
            }} />
            
            {/* Toutes les autres routes Playground redirigent vers le générateur de modules */}
            <Route path="/playground" component={() => {
              window.location.href = '/playground/module-generator';
              return null;
            }} />
            <Route path="/playground/module" component={() => {
              window.location.href = '/playground/module-generator';
              return null;
            }} />
            <Route path="/playground/module/:moduleId" component={() => {
              window.location.href = '/playground/module-generator';
              return null;
            }} />
            <Route path="/playground/path/:pathId" component={() => {
              window.location.href = '/playground/module-generator';
              return null;
            }} />
            
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
            
            {/* Les routes d'administration pour les assistants ont été supprimées */}
            
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
            <Route path="/cyber/ascension" component={() => {
              const CyberAscensionComponent = lazy(() => import('./pages/cyber/ascension'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberAscensionComponent />
                </Suspense>
              );
            }} />
            <Route path="/cyber/ascension/level/:id" component={() => {
              const CyberAscensionLevelComponent = lazy(() => import('./pages/cyber/ascension/level/[id]'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <CyberAscensionLevelComponent />
                </Suspense>
              );
            }} />
            <Route path="/cyber-ascension" component={() => {
              window.location.href = '/cyber/ascension';
              return null;
            }} />
            <Route path="/cyber-ascension/theme/:themeId" component={() => {
              window.location.href = '/cyber/ascension';
              return null;
            }} />
            <Route path="/cyber-ascension/theme/:themeId/level/:levelId" component={() => {
              const id = window.location.pathname.split('/').pop();
              window.location.href = `/cyber/ascension/level/${id}`;
              return null;
            }} />
            
            {/* Routes héritées pour compatibilité */}
            <Route path="/cyber/arcade/cyber-escape" component={NotYetImplemented} />
            <Route path="/cyber/arcade/cyber-escape-parefeu" component={NotYetImplemented} />
            <Route path="/cyber/arcade/password-puzzle" component={NotYetImplemented} />
            <Route path="/cyber/arcade/firewall-defense" component={NotYetImplemented} />
            {/* Section Data & IA */}
            <Route path="/data-ia" component={() => {
              const DataIaModeSelection = lazy(() => import('./pages/data-ia-mode-selection'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIaModeSelection />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/agent-ia" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/modules-express" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/simulation-mission" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/pitch-restitution" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/test-technique" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/data-ia/diagnostic-express" component={() => {
              const DataIANotImplemented = lazy(() => import('./pages/data-ia/not-implemented'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <DataIANotImplemented />
                </Suspense>
              );
            }} />
            <Route path="/amoa" component={AmoaPage} />
            <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
            {/* Route AMOA Quest supprimée */}
            <Route path="/amoa/projet-imposteur" component={ProjetImposteur} />
            <Route path="/amoa/test-reflexes" component={() => {
              const TestReflexesComponent = lazy(() => import('./pages/amoa/test-reflexes'));
              return (
                <Suspense fallback={<GlobalLoader />}>
                  <TestReflexesComponent />
                </Suspense>
              );
            }} />
            <Route path="/custom" component={() => {
              window.location.href = '/playground/module-generator';
              return null;
            }} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
