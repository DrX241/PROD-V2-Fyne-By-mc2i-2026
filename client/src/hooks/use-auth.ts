import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Types pour l'authentification
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
        return data;
      } catch (error) {
        console.error('Erreur dans récupération utilisateur:', error);
        return null; // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      }
    },
    retry: 0, // Ne pas réessayer en cas d'erreur
  });

  // Redirection vers la page de connexion Replit
  const login = () => {
    window.location.href = '/api/login';
  };

  // Redirection vers la page de déconnexion Replit
  const logout = () => {
    window.location.href = '/api/logout';
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refetch
  };
}