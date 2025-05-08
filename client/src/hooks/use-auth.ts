import { useFirebaseAuthContext } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { User as FirebaseUser } from "firebase/auth";

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
}

// Adapter pour transformer FirebaseUser en User
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  return {
    id: firebaseUser.uid,
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
    email: firebaseUser.email || undefined,
    firstName: firebaseUser.displayName?.split(' ')[0] || undefined,
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || undefined,
    profileImageUrl: firebaseUser.photoURL || undefined,
    role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
  };
};

export function useAuth() {
  const { toast } = useToast();
  const {
    user: firebaseUser,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  } = useFirebaseAuthContext();
  
  // Convertir l'utilisateur Firebase en utilisateur compatible avec notre application
  const user = mapFirebaseUserToUser(firebaseUser);
  
  // Fonction de connexion - par défaut utilise Google
  const login = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté',
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: 'Erreur de connexion',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };
  
  // Connexion avec email et mot de passe
  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      await loginWithEmail(email, password);
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté',
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: 'Erreur de connexion',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };
  
  // Inscription avec email et mot de passe
  const register = async (email: string, password: string) => {
    try {
      await registerWithEmail(email, password);
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès',
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      toast({
        title: 'Erreur d\'inscription',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };
  
  // Déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès',
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    loginWithEmail: loginWithEmailPassword,
    register,
    logout: handleLogout,
  };
}