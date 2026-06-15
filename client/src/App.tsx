import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { QuotaToast } from "@/components/QuotaToast";
import { Button } from "@/components/ui/button";
import React, { Suspense, lazy, startTransition, useEffect } from "react";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LoginForm } from "./components/LoginForm";

// Déclaration du type de la variable globale pour TypeScript
declare global {
  interface Window {
    __PRELOADED_MODULES: Record<string, any>;
  }
}

// Importation des composants directement car le lazy loading provoque des problèmes
// avec wouter dans cette implémentation
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CyberHomePage from "@/pages/CyberHomePage";
import ModulesPage from "@/pages/modules";
import CyberAgentPage from "@/pages/cyber-agent";
// Utiliser les chemins relatifs pour les nouveaux composants
import CyberAgentRedirectPage from "./pages/cyber/cyber-agent-redirect";
import CyberAgentNewPage from "./pages/cyber/cyber-agent-new";
// Import des pages de modules
import TrainingPlayer from "./pages/playground/player";
import ModuleGeneratorNew from "./pages/playground/module-generator-new";
import ModuleDetail from "./pages/playground/module/index";
import StudioIA from "./pages/playground/studio-ia";
import StudioDocuments from "./pages/playground/studio-documents";
import LessonPlayer from "./pages/playground/lesson-player";

// Import des pages de la nouvelle interface cyber V3
import CyberV3 from "./pages/cyber-v3";
// Import des pages cyber
import CyberRoleplay from "./pages/cyber/roleplay/index";
import CyberLab from "./pages/cyber/cyber-lab/index";
import CyberLearningCenter from "./pages/cyber/learning-center/index";
import SasCyberAcademie from "./pages/cyber/sas-academie";
import ExpertLearningPage from "./pages/cyber/expert-learning";
import InterviewTestPage from "./pages/cyber/interview-test";
import TestTechniquePage from "./pages/cyber/test-technique";
import CrisisManagementPage from "./pages/cyber/crisis-management";
import CrisisBriefing from "./pages/cyber/crisis-management/briefing";
import ComexTrainingPage from "./pages/cyber/comex-training";
import PentestLab from "./pages/cyber/pentest-lab";
import ProfilPro from "./pages/cyber/profil-pro";
import DataChoicePage from "./pages/cyber/formation-data";
import FormationPython from "./pages/cyber/formation-python";
import FormationSQL from "./pages/cyber/formation";
import FormationExcel from "./pages/cyber/formation-excel";
import DataIaModeSelection from "./pages/data-ia-mode-selection";
import EvaluationPage from "./pages/evaluation";
import SuperAdminPage from "./pages/superadmin";
import MonSuivi from "./pages/mon-suivi";
import Classement from "./pages/classement";

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
const GestionIdentites = lazy(() => import("./pages/cyber/learning-center/modules/gestion-identites/index"));
const IntelligenceArtificielleSecurite = lazy(() => import("./pages/cyber/learning-center/modules/intelligence-artificielle-securite/index"));
// Import des pages AMOA
const AdminPage = lazy(() => import("./pages/admin"));
import SasAcademie from "./pages/amoa/sas-academie";
import AmoaRoleplay from "./pages/amoa/roleplay/index";
import AmoaAcademie from "./pages/amoa/academie/index";
import InterviewSimulation from "./pages/amoa/interview-simulation";
import ProspectPulse from "./pages/amoa/prospect-pulse";
import AmoaExpertLearning from "./pages/amoa/expert-learning";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => window.location.reload()} />;
  }

  return (
    <ChatProvider>
      <TutorialProvider>
            <div>
              <Switch>
                {/* Route admin — accessible si rôle admin OU superadmin */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <Route path="/admin">
                    {() => (
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
                        <AdminPage />
                      </Suspense>
                    )}
                  </Route>
                )}

                {/* Routes publiques */}
                <Route path="/" component={CyberHomePage} />
                <Route path="/home" component={CyberHomePage} />
                <Route path="/home-classic" component={Home} />
                <Route path="/modules" component={ModulesPage} />
                
                {/* Routes des modules */}
                <Route path="/cyber" component={CyberV3} />
                <Route path="/cyber/roleplay" component={CyberRoleplay} />
                <Route path="/cyber/cyber-lab" component={CyberLab} />
                <Route path="/cyber/sas-academie" component={SasCyberAcademie} />
                <Route path="/cyber/learning-center" component={CyberLearningCenter} />
                <Route path="/cyber/profil-pro" component={ProfilPro} />
                <Route path="/cyber/expert-learning" component={ExpertLearningPage} />
                <Route path="/cyber/interview-test" component={InterviewTestPage} />
                <Route path="/cyber/test-technique" component={TestTechniquePage} />
                <Route path="/cyber/crisis-management/briefing" component={CrisisBriefing} />
                <Route path="/cyber/crisis-management" component={CrisisManagementPage} />
                <Route path="/cyber/comex-training" component={ComexTrainingPage} />
                <Route path="/cyber/pentest-lab" component={PentestLab} />
                <Route path="/cyber/tools/assistant-cyber">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement de l'assistant...</div>}>
                      {React.createElement(lazy(() => import("./pages/cyber/tools/assistant-cyber")))}
                    </Suspense>
                  )}
                </Route>
                
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

                <Route path="/cyber/learning-center/modules/gestion-identites">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <GestionIdentites />
                    </Suspense>
                  )}
                </Route>

                <Route path="/cyber/learning-center/modules/intelligence-artificielle-securite">
                  {(params) => (
                    <Suspense fallback={<div className="p-12 text-center">Chargement du module...</div>}>
                      <IntelligenceArtificielleSecurite />
                    </Suspense>
                  )}
                </Route>

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
                {/* Routes formation data */}
                <Route path="/cyber/formation-data" component={DataChoicePage} />
                <Route path="/cyber/formation/python" component={FormationPython} />
                <Route path="/cyber/formation/excel" component={FormationExcel} />
                <Route path="/cyber/formation" component={FormationSQL} />
                {/* Routes data-ia */}
                <Route path="/data-ia" component={DataIaModeSelection} />
                <Route path="/data-ia/sas-academie">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/sas-academie")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/expert-learning">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/expert-learning")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/data-studio">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/data-studio")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/roleplay")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay/read-me-if-you-can">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/read-me-if-you-can")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay/ia-lab-trainer">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/ia-lab-trainer")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay/data-analyst">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/roleplay/data-analyst")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay/ai-engineer">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/roleplay/ai-engineer")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/roleplay/monsieur-tout-le-monde">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/roleplay/monsieur-tout-le-monde")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/data-ia-academy">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/data-ia-academy")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/read-me-if-you-can">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/read-me-if-you-can")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/ia-lab-trainer">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/ia-lab-trainer")))}</Suspense>)}
                </Route>
                <Route path="/data-ia/data-challenge">
                  {() => (<Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>{React.createElement(lazy(() => import("./pages/data-ia/data-challenge")))}</Suspense>)}
                </Route>
                {/* Route évaluation */}
                <Route path="/evaluation" component={EvaluationPage} />
                <Route path="/mon-suivi" component={MonSuivi} />
                <Route path="/classement" component={Classement} />
                {/* Route super admin */}
                {user?.role === 'superadmin' && (
                  <Route path="/superadmin" component={SuperAdminPage} />
                )}
<Route path="/playground/module-generator" component={ModuleGeneratorNew} />
                <Route path="/playground/module/:id" component={ModuleDetail} />
                <Route path="/playground/player/:id" component={TrainingPlayer} />
                <Route path="/playground/studio-ia" component={StudioIA} />
                <Route path="/playground/studio-documents" component={StudioDocuments} />
                <Route path="/playground/lesson/:id" component={LessonPlayer} />
                {/* Route par défaut (404) */}
                <Route component={NotFound} />
              </Switch>
              <Toaster />
              <QuotaToast />
            </div>
          </TutorialProvider>
        </ChatProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Switch>
          <Route>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </Route>
        </Switch>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;