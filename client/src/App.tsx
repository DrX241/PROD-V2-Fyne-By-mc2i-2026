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
import AmoaModeSelectionNew from "@/pages/amoa-mode-selection-new";
// Import de la nouvelle version v3 de I AM CYBER
import CyberModeSelectionV3 from "@/pages/cyber-new/cyber-mode-selection-v3";
// Import de la page Data & IA
import DataIaModeSelection from "@/pages/data-ia-mode-selection";
import ReadMeIfYouCan from "@/pages/data-ia/read-me-if-you-can";
import DataOpsSimulation from "@/pages/data-ia/data-ops-simulation";
import AIPlayground from "@/pages/data-ia/ai-playground";
import IALabTrainer from "@/pages/data-ia/ia-lab-trainer";
import DataIaAcademy from "@/pages/data-ia/data-ia-academy";
// Modules Simulation d'Entretien
import CyberInterviewSimulation from "@/pages/cyber/interview-simulation";
import CyberInterviewPreparation from "@/pages/cyber/interview-preparation";
import AmoaInterviewSimulation from "@/pages/amoa/interview-simulation";
import ProjetImposteur from "@/pages/amoa/projet-imposteur";
import Mc2iInterviewPreparation from "@/pages/amoa/mc2i-interview-preparation-fixed";
// Module Apprendre en échangeant
import ExpertLearningPage from "@/pages/cyber/expert-learning";
import AmoaExpertLearningPage from "@/pages/amoa/expert-learning";
// Nouveau jeu CyberPULSE
import CyberPulseGame from "@/pages/cyber/cyber-pulse-game";
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
                {/* <Route path="/cyber/learning/cyber-mastery" component supprimé */}
                {/* <Route path="/cyber/learning/cyber-mastery/sensibilisation" component supprimé */}
                {/* <Route path="/cyber/learning/cyber-mastery/:themeId" component supprimé */}
                
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
                
                {/* Nouvel Atelier de Pentest Web */}
                <Route path="/cyber/pentest-lab" component={() => {
                  const PentestLab = lazy(() => import('./pages/cyber/pentest-lab/index'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PentestLab />
                    </Suspense>
                  );
                }} />
                
                {/* Nouveau Laboratoire d'analyse de trafic réseau */}
                <Route path="/cyber/network-lab" component={() => {
                  const NetworkLab = lazy(() => import('./pages/cyber/network-lab/index'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <NetworkLab />
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
                
                {/* Page de démonstration du style CYBER ACADÉMIE */}
                <Route path="/cyber/test-cyber-academie" component={() => {
                  const TestCyberAcademie = lazy(() => import('./pages/cyber/test-cyber-academie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <TestCyberAcademie />
                    </Suspense>
                  );
                }} />
                
                {/* Section Laboratoire Cyber */}
                <Route path="/cyber/cyber-lab" component={() => {
                  const CyberLabComponent = lazy(() => import('./pages/cyber/cyber-lab/index'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CyberLabComponent />
                    </Suspense>
                  );
                }} />
                
                {/* Route pour le module Cyber Role Play */}
                <Route path="/cyber/roleplay" component={() => {
                  const RoleplayComponent = lazy(() => import('./pages/cyber/roleplay/index'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <RoleplayComponent />
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
                
                {/* Centre de Crise Immersif */}
                <Route path="/cyber/crisis-center" component={() => {
                  const CrisisCenterComponent = lazy(() => import('./pages/cyber/crisis-center/index'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CrisisCenterComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/crisis-center/crisis-simulation" component={() => {
                  const CrisisSimulationComponent = lazy(() => import('./pages/cyber/crisis-center/crisis-simulation'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CrisisSimulationComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/crisis-center/immersive" component={() => {
                  const ImmersiveCrisisComponent = lazy(() => import('./pages/cyber/crisis-center/immersive-crisis'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ImmersiveCrisisComponent />
                    </Suspense>
                  );
                }} />
                
                {/* Le module CISO Challenge a été supprimé */}
                <Route path="/cyber/crisis-center/ciso-challenge" component={NotYetImplemented} />
                
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
                
                <Route path="/cyber/plan-continuite" component={() => {
                  const PlanContinuiteComponent = lazy(() => import('./pages/cyber/plan-continuite'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PlanContinuiteComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/crisis-management" component={() => {
                  const CrisisManagementComponent = lazy(() => import('./pages/cyber/crisis-management'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CrisisManagementComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/crisis-management/session/:sessionId" component={() => {
                  const ActiveCrisisSessionComponent = lazy(() => import('./pages/cyber/crisis-management/active-session'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ActiveCrisisSessionComponent />
                    </Suspense>
                  );
                }} />

                <Route path="/cyber/crisis-management/cryptolock-game" component={() => {
                  const CryptoLockGameComponent = lazy(() => import('./pages/cyber/crisis-management/cryptolock-game'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CryptoLockGameComponent />
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
                
                {/* Routes pour les modules de Cyber Académie */}
                <Route path="/cyber/learning-center/modules/fiches-cyber-express" component={() => {
                  const FichesCyberExpress = lazy(() => import('./pages/cyber/learning-center/modules/fiches-cyber-express'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <FichesCyberExpress />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/glossaire-visuel" component={() => {
                  const GlossaireVisuel = lazy(() => import('./pages/cyber/learning-center/modules/glossaire-visuel'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <GlossaireVisuel />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/quiz-adaptatif-ia" component={() => {
                  const QuizAdaptatifIA = lazy(() => import('./pages/cyber/learning-center/modules/quiz-adaptatif-ia'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <QuizAdaptatifIA />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/memo-ia-personnalise" component={() => {
                  const MemoIAPersonnalise = lazy(() => import('./pages/cyber/learning-center/modules/memo-ia-personnalise'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <MemoIAPersonnalise />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/phishing-detection" component={() => {
                  const PhishingDetection = lazy(() => import('./pages/cyber/learning-center/modules/phishing-detection'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PhishingDetection />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/ransomware" component={() => {
                  const Ransomware = lazy(() => import('./pages/cyber/learning-center/modules/ransomware'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <Ransomware />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/mot-de-passe" component={() => {
                  const MotDePasse = lazy(() => import('./pages/cyber/learning-center/modules/mot-de-passe'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <MotDePasse />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/byod-securite" component={() => {
                  const BYODSecurite = lazy(() => import('./pages/cyber/learning-center/modules/byod-securite'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <BYODSecurite />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/zero-trust" component={() => {
                  const ZeroTrust = lazy(() => import('./pages/cyber/learning-center/modules/zero-trust'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ZeroTrust />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/securite-cloud" component={() => {
                  const SecuriteCloud = lazy(() => import('./pages/cyber/learning-center/modules/securite-cloud'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SecuriteCloud />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/securite-donnees" component={() => {
                  const SecuriteDonnees = lazy(() => import('./pages/cyber/learning-center/modules/securite-donnees'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SecuriteDonnees />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/securite-reseaux" component={() => {
                  const SecuriteReseaux = lazy(() => import('./pages/cyber/learning-center/modules/securite-reseaux'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SecuriteReseaux />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/securite-ot" component={() => {
                  const SecuriteOT = lazy(() => import('./pages/cyber/learning-center/modules/securite-ot'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SecuriteOT />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/ia-securite" component={() => {
                  const IASecurite = lazy(() => import('./pages/cyber/learning-center/modules/ia-securite'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <IASecurite />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/devsecops" component={() => {
                  const DevSecOps = lazy(() => import('./pages/cyber/learning-center/modules/devsecops'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <DevSecOps />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/gouvernance-cyber" component={() => {
                  const GouvernanceCyber = lazy(() => import('./pages/cyber/learning-center/modules/gouvernance-cyber'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <GouvernanceCyber />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/gestion-identites" component={() => {
                  const GestionIdentites = lazy(() => import('./pages/cyber/learning-center/modules/gestion-identites'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <GestionIdentites />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/micro-learning" component={() => {
                  const MicroLearning = lazy(() => import('./pages/cyber/learning-center/modules/micro-learning'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <MicroLearning />
                    </Suspense>
                  );
                }} />
                
                {/* Routes spécifiques pour le micro-learning */}
                <Route path="/cyber/learning-center/modules/micro-learning/fondamentaux/principes-base" component={() => {
                  const PrincipesBase = lazy(() => import('./pages/cyber/learning-center/modules/micro-learning/fondamentaux/principes-base'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PrincipesBase />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/micro-learning/menaces/phishing" component={() => {
                  const PhishingModule = lazy(() => import('./pages/cyber/learning-center/modules/micro-learning/menaces/phishing'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PhishingModule />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/micro-learning/techniques/cryptographie" component={() => {
                  const Cryptographie = lazy(() => import('./pages/cyber/learning-center/modules/micro-learning/techniques/cryptographie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <Cryptographie />
                    </Suspense>
                  );
                }} />
                
                {/* Route pour le module d'introduction à la cybersécurité */}
                <Route path="/cyber/learning-center/modules/intro-cybersecurite" component={() => {
                  const IntroCybersecurite = lazy(() => import('./pages/cyber/learning-center/modules/intro-cybersecurite'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <IntroCybersecurite />
                    </Suspense>
                  );
                }} />
                
                {/* Routes pour les modules fondamentaux de cybersécurité */}
                <Route path="/cyber/learning-center/modules/modele-menaces" component={() => {
                  const ModulePage = lazy(() => import('./components/cyber/learning/ModuleComingSoon'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ModulePage
                        title="Modélisation des menaces"
                        subtitle="Comprendre et modéliser les menaces pour mieux protéger vos systèmes d'information"
                      />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/analyse-risques" component={() => {
                  const ModulePage = lazy(() => import('./components/cyber/learning/ModuleComingSoon'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ModulePage
                        title="Analyse et gestion des risques"
                        subtitle="Méthodologies d'analyse et de gestion des risques en cybersécurité"
                      />
                    </Suspense>
                  );
                }} />
                
                <Route path="/cyber/learning-center/modules/normes-standards" component={() => {
                  const ModulePage = lazy(() => import('./components/cyber/learning/ModuleComingSoon'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ModulePage
                        title="Normes et standards de sécurité"
                        subtitle="Panorama des normes et standards internationaux en cybersécurité"
                      />
                    </Suspense>
                  );
                }} />
                
                {/* Route générique pour les autres modules non implémentés explicitement */}
                <Route path="/cyber/learning-center/modules/:moduleId" component={NotFound} />
                
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
                <Route path="/amoa/new" component={AmoaModeSelectionNew} />
                <Route path="/amoa/coach-entretien" component={() => {
                  const CoachEntretien = lazy(() => import('./pages/amoa/coach-entretien'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <CoachEntretien />
                    </Suspense>
                  );
                }} />
                
                <Route path="/amoa/prospect-pulse" component={() => {
                  const ProspectPulse = lazy(() => import('./pages/amoa/prospect-pulse'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <ProspectPulse />
                    </Suspense>
                  );
                }} />
                <Route path="/amoa/academie" component={() => {
                  const MciiAcademie = lazy(() => import('./pages/amoa/academie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <MciiAcademie />
                    </Suspense>
                  );
                }} />
                
                {/* Route redirectionnée vers /amoa/academie */}
                <Route path="/amoa/projet-academy" component={() => {
                  const RedirectComponent = lazy(() => import('./components/RedirectComponent'));
                  return (
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-indigo-950">
                      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>}>
                      <RedirectComponent to="/amoa/academie" />
                    </Suspense>
                  );
                }} />
                <Route path="/amoa/mc2i-lab" component={() => {
                  const Mc2iLab = lazy(() => import('./pages/amoa/mc2i-lab'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <Mc2iLab />
                    </Suspense>
                  );
                }} />
                <Route path="/data-ia" component={DataIaModeSelection} />
                <Route path="/data-ia/read-me-if-you-can" component={ReadMeIfYouCan} />
                <Route path="/data-ia/data-ops-simulation" component={DataOpsSimulation} />
                <Route path="/data-ia/ai-playground" component={AIPlayground} />
                <Route path="/data-ia/ia-lab-trainer" component={IALabTrainer} />
                <Route path="/data-ia/data-ia-academy" component={DataIaAcademy} />
                
                {/* Routes pour les cours de DATA & IA ACADEMY */}
                <Route path="/data-ia/courses/python-basics" component={() => {
                  const PythonBasicsComponent = lazy(() => import('./pages/data-ia/courses/python-basics'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <PythonBasicsComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/data-ia/courses/data-manipulation" component={() => {
                  const NotYetImplementedComponent = lazy(() => import('./components/NotYetImplemented'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <NotYetImplementedComponent 
                        title="Manipulation de données avec Pandas" 
                        message="Ce cours est en cours de développement. Il sera bientôt disponible."
                        backPath="/data-ia/data-ia-academy"
                        backLabel="Retour à Data & IA Academy"
                      />
                    </Suspense>
                  );
                }} />
                
                <Route path="/data-ia/courses/sql-fundamentals" component={() => {
                  const SQLFundamentalsComponent = lazy(() => import('./pages/data-ia/courses/sql-fundamentals'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SQLFundamentalsComponent />
                    </Suspense>
                  );
                }} />
                
                <Route path="/data-ia/courses/visualisation" component={() => {
                  const NotYetImplementedComponent = lazy(() => import('./components/NotYetImplemented'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <NotYetImplementedComponent 
                        title="Visualisation avec Matplotlib & Seaborn" 
                        message="Ce cours est en cours de développement. Il sera bientôt disponible."
                        backPath="/data-ia/data-ia-academy"
                        backLabel="Retour à Data & IA Academy"
                      />
                    </Suspense>
                  );
                }} />
                
                <Route path="/data-ia/courses/ml-fundamentals" component={() => {
                  const NotYetImplementedComponent = lazy(() => import('./components/NotYetImplemented'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <NotYetImplementedComponent 
                        title="Fondamentaux du Machine Learning" 
                        message="Ce cours est en cours de développement. Il sera bientôt disponible."
                        backPath="/data-ia/data-ia-academy"
                        backLabel="Retour à Data & IA Academy"
                      />
                    </Suspense>
                  );
                }} />
                
                <Route path="/data-ia/courses/:courseId" component={() => {
                  const NotYetImplementedComponent = lazy(() => import('./components/NotYetImplemented'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <NotYetImplementedComponent 
                        title="Cours en développement" 
                        message="Ce cours est en cours de développement. Il sera bientôt disponible."
                        backPath="/data-ia/data-ia-academy"
                        backLabel="Retour à Data & IA Academy"
                      />
                    </Suspense>
                  );
                }} />

                
                <Route path="/amoa/sas-academie" component={() => {
                  const SasAcademie = lazy(() => import('./pages/amoa/sas-academie'));
                  return (
                    <Suspense fallback={<GlobalLoader />}>
                      <SasAcademie />
                    </Suspense>
                  );
                }} />
                
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
                <Route path="/playground/module/:id" component={ModuleDetailPage} />
                <Route path="/playground/module-generator" component={ModuleGeneratorNewPage} />
                <Route path="/playground/module-generator-new" component={ModuleGeneratorNewPage} />
                <Route path="/modules/:id" component={ModuleDetailPage} />
                <Route path="/custom-module/:id" component={ModuleDetailPage} />
                
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
          </ChatProvider>
        </TutorialProvider>
      </GptModelProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;