import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ModulesPage from "@/pages/modules";
import FirewallDefensePage from "@/pages/games/FirewallDefensePage";

// Imports du module CYBER DEFENSE (à implémenter)
// import CyberDefenseHome from "@/pages/cyber-defense/home";
// import CyberDefenseMissions from "@/pages/cyber-defense/missions";
// import CyberDefenseImmersive from "@/pages/cyber-defense/immersive";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/modules" component={ModulesPage} />
      <Route path="/games/firewall-defense" component={FirewallDefensePage} />
      <Route path="/data-ia" component={NotYetImplemented} />
      <Route path="/amoa" component={NotYetImplemented} />
      <Route path="/custom" component={NotYetImplemented} />
      
      {/* Module CYBER DEFENSE */}
      <Route path="/cyber" component={CyberDefenseUnderConstruction} />
      {/* Routes à implémenter 
      <Route path="/cyber/missions" component={CyberDefenseMissions} />
      <Route path="/cyber/immersive" component={CyberDefenseImmersive} /> 
      */}
      
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

// Composant pour le module CYBER DEFENSE en construction
function CyberDefenseUnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Module CYBER DEFENSE</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        Le module CYBER DEFENSE est en cours de refonte complète pour offrir une expérience immersive et personnalisée.
      </p>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white max-w-xs">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Missions personnalisées</h3>
          <p className="text-gray-600">
            Bientôt disponible : des missions adaptées à votre niveau et à votre contexte professionnel.
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white max-w-xs">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Simulation immersive</h3>
          <p className="text-gray-600">
            Plongez dans des scénarios réalistes et prenez des décisions critiques en temps réel.
          </p>
        </div>
      </div>
      <a 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}

// Import the ChatProvider
import { ChatProvider } from "./contexts/ChatContext";

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
