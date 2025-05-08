import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { User } from "@shared/schema";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Récupération des informations de l'utilisateur connecté
  const { 
    data: user, 
    isLoading,
    error, 
    isError 
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fonction de connexion - redirection vers la page de connexion Replit
  const login = () => {
    window.location.href = "/api/login";
  };

  // Fonction de déconnexion - redirection vers la page de déconnexion Replit
  const logout = () => {
    window.location.href = "/api/logout";
  };

  // Vérifie si l'utilisateur est administrateur (à définir selon vos besoins)
  const isAdmin = !!user && process.env.ADMIN_USER_IDS?.split(',').includes(user.id);

  // Message d'erreur si la connexion échoue
  if (isError && error instanceof Error) {
    toast({
      title: "Erreur d'authentification",
      description: "Impossible de récupérer les informations de l'utilisateur.",
      variant: "destructive",
    });
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
  };
}