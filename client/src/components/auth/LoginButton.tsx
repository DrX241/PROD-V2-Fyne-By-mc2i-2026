import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function LoginButton() {
  const { login } = useAuth();

  return (
    <Button
      onClick={login}
      variant="default"
      size="sm"
      className="text-sm font-medium"
    >
      Se connecter
    </Button>
  );
}