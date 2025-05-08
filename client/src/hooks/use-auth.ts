import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export function useAuth() {
  const { toast } = useToast();
  
  // Récupérer l'utilisateur courant
  const { 
    data: user, 
    error, 
    isLoading,
    refetch 
  } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return null; // Utilisateur non authentifié
          }
          throw new Error('Erreur lors de la récupération de l\'utilisateur');
        }
        
        const data = await res.json();
        // Le serveur peut retourner soit directement l'utilisateur, soit un objet avec une propriété user
        return data.user || data;
      } catch (error) {
        console.error('Erreur dans récupération utilisateur:', error);
        return null; // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      }
    },
    retry: 0, // Ne pas réessayer en cas d'erreur
  });

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de la connexion');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Rafraîchir les données de l'utilisateur après connexion
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de l\'inscription');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Rafraîchir les données de l'utilisateur après inscription
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Échec de la déconnexion');
        }
        
        return await res.json();
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Nettoyer les données après déconnexion
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
      
      // On peut aussi forcer un rafraîchissement pour être sûr
      window.location.href = '/auth';
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de déconnexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}