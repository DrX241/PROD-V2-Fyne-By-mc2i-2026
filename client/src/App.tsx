import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CyberNewOnboarding from "@/pages/cyber-new-onboarding";
import CyberNewDashboard from "@/pages/cyber-new-dashboard";
import CyberNewMission from "@/pages/cyber-new-mission";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cyber-new-onboarding" component={CyberNewOnboarding} />
      <Route path="/cyber-new-dashboard" component={CyberNewDashboard} />
      <Route path="/cyber-new-mission/:id" component={CyberNewMission} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
