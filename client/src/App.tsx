import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Suspense, lazy, startTransition, useState, useEffect } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { GptModelProvider } from "./contexts/GptModelContext";
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
// Le module Escape the Breach a été supprimé
// EmergencyResponsePage a été supprimé

// Import de la nouvelle page Playground
import PlaygroundPage from "./pages/playground";
import ModuleDetailPage from "./pages/playground/module";
import ModuleGeneratorPage from "./pages/playground/module-generator";
import ModuleGeneratorNewPage from "./pages/playground/module-generator-new";

// Import des pages AMOA
import AmoaInterviewSimulation from "./pages/amoa/interview-simulation";
import AmoaExpertLearningPage from "./pages/amoa/expert-learning";
import AmoaAcademie from "./pages/amoa/academie";
import AmoaAcademieIndex from "./pages/amoa/academie/index";
import AmoaModeSelection from "./pages/amoa-mode-selection";
import AmoaModeSelectionNew from "./pages/amoa-mode-selection-new";
import AmoaSasAcademie from "./pages/amoa/sas-academie";

// Import des composants partagés
import GlobalLoader from "./components/GlobalLoader";
import NotYetImplemented from "./components/NotYetImplemented";

// Import des pages CyberV2
import CyberInterviewPreparation from "./pages/cyber/interview-preparation";
import { FirewallDefenseGame } from "./pages/cyber/FirewallDefenseGame";
import CyberDomainDetail from "./pages/cyber/domain-detail";
import CyberScenarioDetail from "./pages/cyber/scenario-detail";
import CyberPulseGame from "./pages/cyber/CyberPulseGame";
import CyberChaosGame from "./pages/cyber/CyberChaos";
import ExpertLearningPage from "./pages/cyber/expert-learning";

// Import pour les nouveaux composants Data IA
import DataIaPage from "./pages/data-ia/index";
import ReadMeYouCanPage from "./pages/data-ia/read-me";

// Import des pages Immersive Simulation
import ImmersiveSimulation from "./pages/immersive-simulation/index";
import ImmersiveScenarioDetail from "./pages/immersive-simulation/scenario-detail";
import ImmersiveSession from "./pages/immersive-simulation/session";

// Import pour le module de formation à l'audit
import AuditPrepPage from "./pages/audit/prep";

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
        <GptModelProvider>
          <ChatProvider>
            <TutorialProvider>
              <div>
                <Switch>
                  {/* Toutes les routes sont maintenant publiques */}
                  <Route path="/cyber/interview-preparation" component={CyberInterviewPreparation} />
                  <Route path="/cyber/interview-simulation" component={NotYetImplemented} />
                  <Route path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
                  <Route path="/amoa/expert-learning" component={AmoaExpertLearningPage} />
                  <Route path="/amoa/roleplay" component={() => {
                    const AmoaRoleplay = lazy(() => import('./pages/amoa/roleplay'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <AmoaRoleplay />
                      </Suspense>
                    );
                  }} />
                  <Route path="/amoa/synthese-entretien" component={() => {
                    const SyntheseEntretien = lazy(() => import('./pages/amoa/synthese-entretien'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <SyntheseEntretien />
                      </Suspense>
                    );
                  }} />
                  
                  <Route path="/amoa/imposteur-simulation" component={() => {
                    const ImposteurSimulation = lazy(() => import('./pages/amoa/imposteur-simulation'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <ImposteurSimulation />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Routes pour les modules mc2i qui ne fonctionnaient pas */}
                  <Route path="/amoa/test-reflexes" component={() => {
                    const TestReflexesComponent = lazy(() => import('./pages/amoa/test-reflexes-fixed'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <TestReflexesComponent />
                      </Suspense>
                    );
                  }} />
                  
                  <Route path="/outils-ia/mc2i-learning" component={() => {
                    const Mc2iLearningComponent = lazy(() => import('./pages/outils-ia/mc2i-learning'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <Mc2iLearningComponent />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Routes publiques */}
                  <Route path="/" component={CyberHomePage} />
                  <Route path="/home-classic" component={Home} />
                  <Route path="/modules" component={ModulesPage} />
                  <Route path="/cyber" component={() => {
                    const CyberV3 = lazy(() => import('./pages/cyber-v3'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <CyberV3 />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Routes pour les nouvelles interfaces I AM CYBER */}
                  <Route path="/cyber-v3" component={() => {
                    const CyberV3 = lazy(() => import('./pages/cyber-v3'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <CyberV3 />
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
                  {/* Route supprimée : Cyber Agent New */}
                  <Route path="/cyber/expert-learning" component={ExpertLearningPage} /> {/* Module Apprendre en échangeant */}
                  <Route path="/cyber/cyber-pulse" component={CyberPulseGame} /> {/* Nouveau jeu CyberPULSE */}
                  {/* Routes supprimées : Cyber Mastery et ses sous-modules */}
                  
                  {/* Routes pour les nouveaux jeux cybersécurité */}
                  <Route path="/cyber/firewall-defense" component={FirewallDefenseGame} />
                  <Route path="/cyber/cyber-chaos" component={CyberChaosGame} />
                  
                  {/* Domaines et scénarios Cybersécurité */}
                  <Route path="/cyber/domains/:domainId" component={CyberDomainDetail} />
                  <Route path="/cyber/scenarios/:scenarioId" component={CyberScenarioDetail} />
                  <Route path="/cyber/roleplay" component={() => {
                    const CyberRoleplayPage = lazy(() => import('./pages/cyber/roleplay'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <CyberRoleplayPage />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Routes Playground */}
                  <Route path="/playground" component={PlaygroundPage} />
                  <Route path="/playground/module/:moduleId" component={ModuleDetailPage} />
                  <Route path="/playground/module-generator" component={ModuleGeneratorPage} />
                  <Route path="/playground/module-generator-new" component={ModuleGeneratorNewPage} />
                  
                  {/* Routes AMOA */}
                  <Route path="/amoa" component={AmoaModeSelection} />
                  <Route path="/amoa/new" component={AmoaModeSelectionNew} />
                  <Route path="/amoa/academie" component={AmoaAcademie} />
                  <Route path="/amoa/academie/index" component={AmoaAcademieIndex} />
                  <Route path="/amoa/sas-academie" component={AmoaSasAcademie} />

                  {/* Routes pour l'audit */}
                  <Route path="/audit/preparation" component={AuditPrepPage} />
                  
                  {/* Routes Data & IA */}
                  <Route path="/data-ia" component={DataIaPage} />
                  <Route path="/data-ia/read-me-if-you-can" component={ReadMeYouCanPage} />
                  
                  {/* Immersive Simulation */}
                  <Route path="/immersive-simulation" component={ImmersiveSimulation} />
                  <Route path="/immersive-scenario/:id" component={ImmersiveScenarioDetail} />
                  <Route path="/immersive-session/:id" component={ImmersiveSession} />
                  
                  {/* Générateur de Livrables AMOA */}
                  <Route path="/automatiser/generateur-livrables" component={() => {
                    const GenerateurLivrables = lazy(() => import('./pages/automatiser/generateur-livrables'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <GenerateurLivrables />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Ancien module mc2i Learning et OUTILS IA supprimé */}
                  
                  {/* Nouvelles routes FYNE */}
                  <Route path="/fyne-landing" component={() => {
                    const FyneLanding = lazy(() => import('./pages/fyne-landing'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <FyneLanding />
                      </Suspense>
                    );
                  }} />
                  
                  <Route path="/fyne-about" component={() => {
                    const FyneAbout = lazy(() => import('./pages/fyne-about'));
                    return (
                      <Suspense fallback={<GlobalLoader />}>
                        <FyneAbout />
                      </Suspense>
                    );
                  }} />
                  
                  {/* Route par défaut (404) */}
                  <Route component={NotFound} />
                </Switch>
                <Toaster />
              </div>
            </TutorialProvider>
          </ChatProvider>
        </GptModelProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;