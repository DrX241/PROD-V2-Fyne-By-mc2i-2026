import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Chargement...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" />
        Déconnexion
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={login}>
      <LogIn className="h-4 w-4 mr-2" />
      Connexion
    </Button>
  );
}