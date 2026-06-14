import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  permissions?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  modulesEnabled?: string[];
  tokenQuota?: number;
  tokenUsedMonth?: number;
  subscriptionLabel?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (data.success && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchit uniquement tokenUsedMonth depuis le serveur (appelé après chaque réponse LLM)
  const refreshTokenUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (data.success && data.authenticated && data.user) {
        setUser(prev => prev ? {
          ...prev,
          tokenUsedMonth: data.user.tokenUsedMonth,
          tokenQuota: data.user.tokenQuota,
        } : prev);
      }
    } catch {
      // silencieux
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Erreur de connexion');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshTokenUsage }}>
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
