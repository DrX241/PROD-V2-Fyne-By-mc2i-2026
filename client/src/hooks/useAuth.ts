import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { User } from "@shared/schema";
import { createContext, ReactNode, useContext } from "react";

// Définir le type pour le contexte d'authentification
type AuthContextType = {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
};

// Créer le contexte d'authentification avec une valeur par défaut
const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

// Fournir un hook pour utiliser le contexte d'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Créer un composant pour fournir les valeurs d'authentification
export function AuthProvider({ children }: { children: ReactNode }) {
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}