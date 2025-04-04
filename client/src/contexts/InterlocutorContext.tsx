import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Interlocutor {
  id: string;
  name: string;
  role: string;
  company: string;
  description: string;
  avatarUrl?: string;
  specialty?: string;
}

export interface InterlocutorsContextType {
  interlocutors: Interlocutor[];
  currentInterlocutor: Interlocutor | null;
  loading: boolean;
  setCurrentInterlocutor: (id: string) => void;
}

const InterlocutorsContext = createContext<InterlocutorsContextType | undefined>(undefined);

export const InterlocutorsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [interlocutors, setInterlocutors] = useState<Interlocutor[]>([
    {
      id: 'interlocutor1',
      name: 'Arnaud Gauthier',
      role: 'Directeur Cybersécurité',
      company: 'Cyber Secure Solutions',
      description: 'Expert en gestion des risques de sécurité avec une vision stratégique des enjeux cyber.',
      specialty: 'Gouvernance'
    },
    {
      id: 'interlocutor2',
      name: 'Olivier Hervo',
      role: 'Responsable SOC',
      company: 'Cyber Secure Solutions',
      description: 'Spécialiste des opérations de sécurité et de la détection des menaces avancées.',
      specialty: 'Détection'
    },
    {
      id: 'interlocutor3',
      name: 'Lorenzo Bertola',
      role: 'CISO',
      company: 'Cyber Secure Solutions',
      description: 'Responsable de la stratégie de sécurité globale de l\'entreprise.',
      specialty: 'Stratégie'
    },
    {
      id: 'interlocutor4',
      name: 'Anthony Frescal',
      role: 'Expert Forensique',
      company: 'Cyber Secure Solutions',
      description: 'Spécialiste de l\'analyse et de la réponse aux incidents de sécurité.',
      specialty: 'Investigation'
    }
  ]);
  
  const [currentInterlocutor, setCurrentInterlocutorState] = useState<Interlocutor | null>(null);
  
  useEffect(() => {
    // Initialiser avec le premier interlocuteur
    if (interlocutors.length > 0) {
      setCurrentInterlocutorState(interlocutors[0]);
    }
    
    // Simuler le chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [interlocutors]);
  
  const setCurrentInterlocutor = (id: string) => {
    const interlocutor = interlocutors.find(i => i.id === id);
    if (interlocutor) {
      setCurrentInterlocutorState(interlocutor);
    }
  };
  
  const value = {
    interlocutors,
    currentInterlocutor,
    loading,
    setCurrentInterlocutor
  };
  
  return (
    <InterlocutorsContext.Provider value={value}>
      {children}
    </InterlocutorsContext.Provider>
  );
};

export const useInterlocutors = (): InterlocutorsContextType => {
  const context = useContext(InterlocutorsContext);
  
  if (context === undefined) {
    throw new Error('useInterlocutors must be used within an InterlocutorsProvider');
  }
  
  return context;
};