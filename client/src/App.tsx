import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, startTransition } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AuthPage from "./pages/auth-page";

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
          <TutorialProvider>
            <FirebaseAuthProvider>
              <AuthProvider>
                <div>
                  <Switch>
                    {/* Page d'authentification */}
                    <Route path="/auth" component={AuthPage} />
                    
                    {/* Routes protégées nécessitant une authentification */}
                    <ProtectedRoute path="/cyber/interview-simulation" component={CyberInterviewSimulation} />
                    <ProtectedRoute path="/amoa/interview-simulation" component={AmoaInterviewSimulation} />
                    
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
                    <Route path="/cyber-mode-selection-old" component={CyberModeSelection} />
                    <Route path="/cyber/agent" component={CyberAgentPage} />
                    <Route path="/cyber/cyber-agent" component={CyberAgentRedirectPage} />
                    <Route path="/cyber/cyber-agent-old" component={CyberAgentRedirectPage} />
                    <Route path="/cyber/cyber-agent-new" component={CyberAgentNewPage} />
                    <Route path="/cyber/expert-learning" component={ExpertLearningPage} />
                    
                    {/* Plus de routes */}
                    {/* AMOA Routes */}
                    <Route path="/amoa" component={AmoaPage} />
                    <Route path="/amoa-mode-selection" component={AmoaModeSelection} />
                    <Route path="/amoa/projet-imposteur" component={ProjetImposteur} />
                    
                    {/* Autres routes */}
                    <Route path="/immersive-simulation" component={ImmersiveSimulation} />
                    <Route path="/immersive-simulation/:id" component={ImmersiveScenarioDetail} />
                    <Route path="/immersive-session/:id" component={ImmersiveSession} />
                    
                    {/* Route par défaut - 404 */}
                    <Route component={NotFound} />
                  </Switch>
                  <Toaster />
                </div>
              </AuthProvider>
            </FirebaseAuthProvider>
          </TutorialProvider>
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;