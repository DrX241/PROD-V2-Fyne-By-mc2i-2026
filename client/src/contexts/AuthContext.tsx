import { createContext, ReactNode, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@/hooks/use-auth";

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Création du contexte d'authentification
export const AuthContext = createContext<AuthContextProps | null>(null);

// Hook pour utiliser le contexte d'authentification
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

// Provider pour le contexte d'authentification
export function AuthProvider({ children }: { children: ReactNode }) {
  // Utiliser notre hook d'authentification qui est maintenant un adaptateur pour Firebase
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}