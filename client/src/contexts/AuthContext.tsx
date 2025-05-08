import React, { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Import de notre client API
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types pour l'authentification
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginMutation: ReturnType<typeof useMutation<User, Error, LoginCredentials>>;
  registerMutation: ReturnType<typeof useMutation<User, Error, RegisterData>>;
  logoutMutation: ReturnType<typeof useMutation<void, Error, void>>;
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

  // Mutation pour la connexion
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de connexion');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/user'], data);
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${data.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec d\'inscription');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/user'], data);
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de déconnexion');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur de déconnexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Valeur de contexte
  const value: AuthContextProps = {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loginMutation,
    registerMutation,
    logoutMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}