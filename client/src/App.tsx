import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import React, { Suspense, lazy, startTransition, useState, useEffect } from "react";
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
// Import des pages cyber
import CyberRoleplay from "./pages/cyber/roleplay/index";
import CyberLab from "./pages/cyber/cyber-lab/index";
import CyberLearningCenter from "./pages/cyber/learning-center/index";
import SasCyberAcademie from "./pages/cyber/sas-academie";
import ExpertLearningPage from "./pages/cyber/expert-learning";
import InterviewTestPage from "./pages/cyber/interview-test";
import TestTechniquePage from "./pages/cyber/test-technique";
import CrisisManagementPage from "./pages/cyber/crisis-management";
import PentestLab from "./pages/cyber/pentest-lab";
import ProfilPro from "./pages/cyber/profil-pro";

// Import des modules de la Cyber Académie - importés dynamiquement avec lazy pour améliorer les performances
const IntroductionCybersecurite = lazy(() => import("./pages/cyber/learning-center/modules/intro-cybersecurite/index"));
const ZeroTrust = lazy(() => import("./pages/cyber/learning-center/modules/zero-trust/index"));
const FichesCyberExpress = lazy(() => import("./pages/cyber/learning-center/modules/fiches-cyber-express/index"));
const QuizAdaptatifIA = lazy(() => import("./pages/cyber/learning-center/modules/quiz-adaptatif-ia/index"));
const GlossaireVisuel = lazy(() => import("./pages/cyber/learning-center/modules/glossaire-visuel/index"));
const MemoIAPersonnalise = lazy(() => import("./pages/cyber/learning-center/modules/memo-ia-personnalise/index"));
const BYODSecurite = lazy(() => import("./pages/cyber/learning-center/modules/byod-securite/index"));
const DebutantCyber = lazy(() => import("./pages/cyber/learning-center/modules/debutant-cyber/index"));
const SecuriteReseaux = lazy(() => import("./pages/cyber/learning-center/modules/securite-reseaux/index"));
const SecuriteCloud = lazy(() => import("./pages/cyber/learning-center/modules/securite-cloud/index"));
const SecuriteDonnees = lazy(() => import("./pages/cyber/learning-center/modules/securite-donnees/index"));
const SecuriteOT = lazy(() => import("./pages/cyber/learning-center/modules/securite-ot/index"));
const IASecurite = lazy(() => import("./pages/cyber/learning-center/modules/ia-securite/index"));
const MicroLearning = lazy(() => import("./pages/cyber/learning-center/modules/micro-learning/index"));
const Ransomware = lazy(() => import("./pages/cyber/learning-center/modules/ransomware/index"));
const PhishingDetection = lazy(() => import("./pages/cyber/learning-center/modules/phishing-detection/index"));
const AnalyseRisques = lazy(() => import("./pages/cyber/learning-center/modules/analyse-risques/index"));
const NormesStandards = lazy(() => import("./pages/cyber/learning-center/modules/normes-standards/index"));
const MotDePasse = lazy(() => import("./pages/cyber/learning-center/modules/mot-de-passe/index"));
const DevSecOps = lazy(() => import("./pages/cyber/learning-center/modules/devsecops/index"));
const GouvernanceCyber = lazy(() => import("./pages/cyber/learning-center/modules/gouvernance-cyber/index"));
// Import des pages AMOA
import SasAcademie from "./pages/amoa/sas-academie";
import AmoaRoleplay from "./pages/amoa/roleplay/index";
import AmoaAcademie from "./pages/amoa/academie/index";
import InterviewSimulation from "./pages/amoa/interview-simulation";
import ProspectPulse from "./pages/amoa/prospect-pulse";
import AmoaExpertLearning from "./pages/amoa/expert-learning";

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
                <Route path="/cyber/roleplay" component={CyberRoleplay} />
                <Route path="/cyber/cyber-lab" component={CyberLab} />
                <Route path="/cyber/sas-academie" component={SasCyberAcademie} />
                <Route path="/cyber/learning-center" component={CyberLearningCenter} />
                <Route path="/cyber/profil-pro" component={ProfilPro} />
                <Route path="/cyber/expert-learning" component={ExpertLearningPage} />
                <Route path="/cyber/interview-test" component={InterviewTestPage} />
                <Route path="/cyber/test-technique" component={TestTechniquePage} />
                <Route path="/cyber/crisis-management" component={CrisisManagementPage} />
                <Route path="/cyber/pentest-lab" component={PentestLab} />
                
                {/* Routes pour les modules de la Cyber Académie - avec Suspense pour chargement différé */}
                <Route path="/cyber/learning-center/modules/intro-cybersecurite">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <IntroductionCybersecurite />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/zero-trust">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <ZeroTrust />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/fiches-cyber-express">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <FichesCyberExpress />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/quiz-adaptatif-ia">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <QuizAdaptatifIA />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/glossaire-visuel">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <GlossaireVisuel />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/memo-ia-personnalise">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <MemoIAPersonnalise />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/debutant-cyber">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <DebutantCyber />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/gouvernance-cyber">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <GouvernanceCyber />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/securite-reseaux">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <SecuriteReseaux />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/securite-cloud">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <SecuriteCloud />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/securite-donnees">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <SecuriteDonnees />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/securite-ot">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <SecuriteOT />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/ia-securite">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <IASecurite />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/micro-learning">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <MicroLearning />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/ransomware">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <Ransomware />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/phishing-detection">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <PhishingDetection />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/mot-de-passe">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <MotDePasse />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/analyse-risques">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <AnalyseRisques />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/normes-standards">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <NormesStandards />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/byod-securite">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <BYODSecurite />
                    </Suspense>
                  )}
                </Route>
                <Route path="/cyber/learning-center/modules/devsecops">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <DevSecOps />
                    </Suspense>
                  )}
                </Route>
                
                <Route path="/data-ia" component={DataIaModeSelection} />
                <Route path="/data-ia/sas-academie">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/sas-academie")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/expert-learning">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/expert-learning")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/data-studio">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/data-studio")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/roleplay">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/roleplay")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/roleplay/read-me-if-you-can">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/read-me-if-you-can")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/roleplay/ia-lab-trainer">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/ia-lab-trainer")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/data-ia-academy">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/data-ia-academy")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/read-me-if-you-can">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/read-me-if-you-can")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/data-ia/ia-lab-trainer">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/data-ia/ia-lab-trainer")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/amoa/new" component={AmoaModeSelectionNew} />
                <Route path="/amoa/sas-academie" component={SasAcademie} />
                <Route path="/amoa/roleplay" component={AmoaRoleplay} />
                <Route path="/amoa/academie" component={AmoaAcademie} />
                {/* Routes pour les modules AMOA Académie */}
                <Route path="/amoa/academie/modules/intro-amoa">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/amoa/academie/modules/intro-amoa/index")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/amoa/academie/modules/expression-besoins">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/amoa/academie/modules/expression-besoins/index")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/amoa/academie/modules/specifications-fonctionnelles">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/amoa/academie/modules/specifications-fonctionnelles/index")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/amoa/academie/modules/gestion-tests">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      {React.createElement(lazy(() => import("./pages/amoa/academie/modules/gestion-tests/index")))}
                    </Suspense>
                  )}
                </Route>
                <Route path="/amoa/interview-simulation" component={InterviewSimulation} />
                <Route path="/amoa/prospect-pulse" component={ProspectPulse} />
                <Route path="/amoa/expert-learning" component={AmoaExpertLearning} />
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