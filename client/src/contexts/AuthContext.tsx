import React, { createContext, useContext, ReactNode } from 'react';

// Interface simplifiée - tout le monde est considéré comme authentifié
interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Suppression du système d'authentification
  // Tout le monde est automatiquement authentifié
  const isAuthenticated = true;
  
  // Fonction conservée pour maintenir la compatibilité avec le reste du code
  const logout = () => {
    console.log('Fonction de déconnexion appelée mais ignorée - authentification supprimée');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}