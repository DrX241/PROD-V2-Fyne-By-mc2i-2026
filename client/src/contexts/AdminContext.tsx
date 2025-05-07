import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  setAdminMode: (value: boolean) => void;
  showAdminLogin: () => void;
  hideAdminLogin: () => void;
  validateAdminPassword: (password: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const showAdminLogin = () => {
    setShowPasswordModal(true);
  };

  const hideAdminLogin = () => {
    setShowPasswordModal(false);
  };

  const validateAdminPassword = (password: string): boolean => {
    // Le mot de passe est valide s'il se termine par "eddyfyne"
    const isValid = password.endsWith("eddyfyne");
    
    if (isValid) {
      setIsAdminMode(true);
      setShowPasswordModal(false);
    }
    
    return isValid;
  };

  const setAdminMode = (value: boolean) => {
    setIsAdminMode(value);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminMode,
        setAdminMode,
        showAdminLogin,
        hideAdminLogin,
        validateAdminPassword,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}