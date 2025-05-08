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
  } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/auth/user');
        if (!res.ok) {
          if (res.status === 401) {
            return null; // Utilisateur non authentifié
          }
          throw new Error('Erreur lors de la récupération de l\'utilisateur');
        }
        return await res.json();
      } catch (error) {
        return null; // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      }
    },
    retry: false, // Ne pas réessayer en cas d'erreur
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
      const res = await apiRequest('POST', '/api/auth/logout');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de la déconnexion');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Nettoyer les données après déconnexion
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries();
      
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
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