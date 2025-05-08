import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signInWithEmail, createUserWithEmail, logout } from "@/lib/firebase";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsLoading(false);
      },
      (error) => {
        setError(error);
        setIsLoading(false);
      }
    );
    
    // Nettoyer l'observateur lors du démontage
    return () => unsubscribe();
  }, []);

  // Connexion avec Google
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion avec email et mot de passe
  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithEmail(email, password);
      return user;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription avec email et mot de passe
  const registerWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await createUserWithEmail(email, password);
      return user;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.email?.includes("admin") || false, // Logique simplifiée pour déterminer si l'utilisateur est admin
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout: handleLogout,
  };
}