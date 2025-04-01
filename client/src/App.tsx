import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ModulesPage from "@/pages/modules";
import CyberPage from "@/pages/cyber";
import CyberSimulation from "@/pages/cyber-simulation-new";
import CyberOnboarding from "@/pages/cyber-onboarding";
// La route cyber-onboarding-chat a été supprimée car remplacée par cyber-onboarding-new
import CyberOnboardingNew from "@/pages/cyber-onboarding-new";
import { ChatProvider } from "./contexts/ChatContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/modules" component={ModulesPage} />
      <Route path="/cyber" component={CyberPage} />
      <Route path="/cyber-onboarding" component={CyberOnboarding} />
      {/* Route supprimée car remplacée par /cyber-onboarding-new */}
      <Route path="/cyber-onboarding-new" component={CyberOnboardingNew} />
      <Route path="/cyber-simulation" component={CyberSimulation} />
      <Route path="/data-ia" component={NotYetImplemented} />
      <Route path="/amoa" component={NotYetImplemented} />
      <Route path="/custom" component={NotYetImplemented} />
      <Route component={NotFound} />
    </Switch>
  );
}

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Router />
        <Toaster />
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
