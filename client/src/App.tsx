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
import ModulesPage from "@/pages/modules";
import CyberModeSelection from "@/pages/cyber-mode-selection";
import CyberAgentPage from "@/pages/cyber-agent";
// Utiliser les chemins relatifs pour les nouveaux composants
import CyberAgentRedirectPage from "./pages/cyber/cyber-agent-redirect";
import CyberAgentNewPage from "./pages/cyber/cyber-agent-new";
// Le module Escape the Breach a été supprimé
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
// Import du nouveau module CYBERCHAOS
import CyberChaos from "@/pages/cyber/CyberChaos"; // Nouveau module de simulation de crise

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
// Import la nouvelle version optimisée du mode de sélection AMOA (comme pour Cyber)
import AmoaModeSelectionFixed from "@/pages/amoa-mode-selection-fixed";
// Modules Simulation d'Entretien
import CyberInterviewSimulation from "@/pages/cyber/interview-simulation";
import CyberInterviewPreparation from "@/pages/cyber/interview-preparation";
import AmoaInterviewSimulation from "@/pages/amoa/interview-simulation";
import ProjetImposteur from "@/pages/amoa/projet-imposteur";
import Mc2iInterviewPreparation from "@/pages/amoa/mc2i-interview-preparation-fixed";
// Module Apprendre en échangeant
import ExpertLearningPage from "@/pages/cyber/expert-learning";
// Ancien jeu Cyber Snake (supprimé)
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('appAuthenticated') === 'true';
      const timestamp = Number(localStorage.getItem('authTimestamp') || '0');
      const currentTime = Date.now();
      
      // Session expire après 24 heures
      const isExpired = currentTime - timestamp > 24 * 60 * 60 * 1000;
      
      if (authenticated && !isExpired) {
        setIsAuthenticated(true);
      } else {
        // Nettoyer si expiré
        localStorage.removeItem('appAuthenticated');
        localStorage.removeItem('authTimestamp');
        setIsAuthenticated(false);
      }
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
                {/* Toutes les routes sont maintenant publiques */}
                <Route path="/cyber/interview-preparation" component={CyberInterviewPreparation} />
                <Route path="/cyber/interview-simulation" component={NotYetImplemented} />
                <Route path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
                
                {/* Routes publiques */}
                <Route path="/" component={Home} />
                <Route path="/modules" component={ModulesPage} />
                <Route path="/cyber" component={() => {
                  const CyberModeSelectionFixed = lazy(() => import('./pages/cyber-mode-selection-fixed'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberModeSelectionFixed />
                    </Suspense>
                  );
                }} />
                <Route path="/cyber-mode-selection" component={() => {
                  const CyberModeSelectionFixed = lazy(() => import('./pages/cyber-mode-selection-fixed'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberModeSelectionFixed />
                    </Suspense>
                  );
                }} />
                <Route path="/cyber-mode-selection-old" component={CyberModeSelection} /> {/* Ancienne interface accessible via -old */}
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
                
                {/* Module Bug Hunter */}
                <Route path="/cyber/arcade/bug-hunter" component={() => {
                  const BugHunterComponent = lazy(() => import('./pages/cyber/arcade/bug-hunter'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <BugHunterComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/arcade/bug-hunter/challenge/:id" component={() => {
                  const BugHunterChallengeComponent = lazy(() => import('./pages/cyber/arcade/bug-hunter/challenge/[id]'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <BugHunterChallengeComponent />
                    </Suspense>
                  );
                }} />
                
                {/* Module Cyber Snake - Supprimé */}
                <Route path="/cyber/cyber-snake" component={NotYetImplemented} />
                <Route path="/cyber/test-technique" component={() => {
                  const CyberTestTechnique = lazy(() => import('./pages/cyber/test-technique'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberTestTechnique />
                    </Suspense>
                  );
                }} />
                
                {/* Page de démonstration du style CYBER ACADÉMIE */}
                <Route path="/cyber/test-cyber-academie" component={() => {
                  const TestCyberAcademie = lazy(() => import('./pages/cyber/test-cyber-academie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <TestCyberAcademie />
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
                
                <Route path="/cyber/tools/assistant-cyber" component={() => {
                  const AssistantCyberComponent = lazy(() => import('./pages/cyber/tools/assistant-cyber'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <AssistantCyberComponent />
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
                
                <Route path="/cyber/profil-pro" component={() => {
                  const ProfilProComponent = lazy(() => import('./pages/cyber/profil-pro'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ProfilProComponent />
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
                
                {/* Nouveau module CYBER ACADÉMIE */}
                <Route path="/cyber/learning-center" component={() => {
                  const CyberLearningCenter = lazy(() => import('./pages/cyber/learning-center'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberLearningCenter />
                    </Suspense>
                  );
                }} />
                
                {/* Module CYBERASCENSION - Parcours de certifications */}
                <Route path="/cyber/ascension" component={() => {
                  const CyberAscension = lazy(() => import('./pages/cyber/ascension'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberAscension />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/ascension/level/:id" component={() => {
                  const CyberAscensionLevel = lazy(() => import('./pages/cyber/ascension/level/[id]'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberAscensionLevel />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/intro-cybersecurite" component={() => {
                  const IntroCybersecurite = lazy(() => import('./pages/cyber/learning-center/modules/intro-cybersecurite'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <IntroCybersecurite />
                    </Suspense>
                  );
                }} />
                
                {/* Centre de crise évolutif (routes héritées et nouvelles) */}
                <Route path="/cyber-defense" component={CyberDefensePage} />
                <Route path="/cyberchaos" component={() => {
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberChaos />
                    </Suspense>
                  );
                }} />
                <Route path="/cyber-defense-new" component={CentreDeCriseEvolutifPage} />
                <Route path="/centre-crise-evolutif" component={CentreDeCriseEvolutifPage} />
                <Route path="/cyber-defense-session" component={CyberDefenseSessionPage} />
                <Route path="/cyber-defense-mission" component={CyberDefenseMissionPage} />
                <Route path="/cyber-crisis-center" component={() => {
                  const CyberCrisisCenter = lazy(() => import('./pages/cyber-crisis-center'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberCrisisCenter />
                    </Suspense>
                  );
                }} />
                
                {/* AMOA et modules mc2i */}
                <Route path="/amoa" component={AmoaPage} />
                <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
                <Route path="/amoa-mode-selection-fixed" component={AmoaModeSelectionFixed} />
                <Route path="/data-ia" component={NotYetImplemented} />
                
                <Route path="/amoa/academie" component={() => {
                  const AmoaAcademie = lazy(() => import('./pages/amoa/academie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <AmoaAcademie />
                    </Suspense>
                  );
                }} />
                
                <Route path="/amoa/reflexes" component={NotYetImplemented} />
                
                <Route path="/amoa/projet-imposteur" component={ProjetImposteur} />
                <Route path="/amoa/mc2i-interview-preparation-fixed" component={Mc2iInterviewPreparation} />
                
                {/* Playground et modules personnalisés */}
                <Route path="/playground" component={PlaygroundPage} />
                <Route path="/playground/module-generator" component={ModuleGeneratorPage} />
                <Route path="/modules/:id" component={ModuleDetailPage} />
                <Route path="/custom-module/:id" component={ModuleDetailPage} />
                
                {/* Immersive Simulation */}
                <Route path="/immersive-simulation" component={ImmersiveSimulation} />
                <Route path="/immersive-scenario/:id" component={ImmersiveScenarioDetail} />
                <Route path="/immersive-session/:id" component={ImmersiveSession} />
                
                {/* Ancien module mc2i Learning et OUTILS IA supprimé */}
                
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