import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function LoginButton() {
  const [_, navigate] = useLocation();

  return (
    <Button
      onClick={() => {
        // Redirection vers la page d'authentification
        navigate("/auth");
      }}
      variant="default"
      size="sm"
      className="text-sm font-medium"
    >
      Se connecter
    </Button>
  );
}