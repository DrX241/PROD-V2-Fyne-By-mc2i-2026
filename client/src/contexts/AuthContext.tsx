import { createContext, ReactNode } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
};

// Contexte simplifié pour maintenir la compatibilité avec le code existant
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false
});

interface AuthProviderProps {
  children: ReactNode;
}

// Provider simplifié qui ne fait plus d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}