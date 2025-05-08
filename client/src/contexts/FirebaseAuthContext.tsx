import React, { createContext, ReactNode, useContext } from "react";
import { User } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

interface FirebaseAuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

// Création du contexte d'authentification Firebase
export const FirebaseAuthContext = createContext<FirebaseAuthContextProps | null>(null);

// Hook pour utiliser le contexte d'authentification Firebase
export function useFirebaseAuthContext() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuthContext doit être utilisé à l'intérieur d'un FirebaseAuthProvider");
  }
  return context;
}

// Provider pour le contexte d'authentification Firebase
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();

  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}