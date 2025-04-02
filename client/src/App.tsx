import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CyberNewOnboarding from "@/pages/cyber-new-onboarding";
import CyberNewDashboard from "@/pages/cyber-new-dashboard";
import CyberNewMission from "@/pages/cyber-new-mission";
import CyberNewChat from "@/pages/cyber-new-chat";
import CyberChatConfig from "@/pages/cyber-chat-config";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cyber-new-onboarding" component={CyberNewOnboarding} />
      <Route path="/cyber-new-dashboard" component={CyberNewDashboard} />
      <Route path="/cyber-new-mission/:id" component={CyberNewMission} />
      <Route path="/cyber-new-chat" component={CyberNewChat} />
      <Route path="/cyber-chat-config" component={CyberChatConfig} />
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
