import React, { createContext, ReactNode, useContext } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Types pour l'authentification avec Replit Auth
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  refetch: UseQueryResult<User | null, Error>['refetch'];
}

// Création du contexte d'authentification
export const AuthContext = createContext<AuthContextProps | null>(null);

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

// Provider pour le contexte d'authentification
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Récupération des données de l'utilisateur
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include', // Important pour envoyer les cookies
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return null; // Utilisateur non authentifié
          }
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        
        return await res.json();
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Fonction pour se connecter via Replit Auth
  const login = () => {
    window.location.href = '/api/login';
  };

  // Fonction pour se déconnecter via Replit Auth
  const logout = () => {
    window.location.href = '/api/logout';
    // Vider les données utilisateur du cache pour éviter les incohérences
    queryClient.setQueryData(['/api/auth/user'], null);
    toast({
      title: 'Déconnexion',
      description: 'Vous allez être déconnecté...',
    });
  };

  // Valeur de contexte
  const value: AuthContextProps = {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}