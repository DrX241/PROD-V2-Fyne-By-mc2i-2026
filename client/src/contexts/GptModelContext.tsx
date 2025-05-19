import React, { createContext, useContext, useState, useEffect } from "react";

interface GptModelContextType {
  isGpt4oMini: boolean;
  setIsGpt4oMini: (value: boolean) => void;
}

const GptModelContext = createContext<GptModelContextType | undefined>(undefined);

export const GptModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGpt4oMini, setIsGpt4oMini] = useState<boolean>(false);

  // Persister le choix dans le localStorage
  useEffect(() => {
    const savedValue = localStorage.getItem("isGpt4oMini");
    if (savedValue !== null) {
      setIsGpt4oMini(savedValue === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isGpt4oMini", isGpt4oMini.toString());
  }, [isGpt4oMini]);

  return (
    <GptModelContext.Provider value={{ isGpt4oMini, setIsGpt4oMini }}>
      {children}
    </GptModelContext.Provider>
  );
};

export const useGptModel = (): GptModelContextType => {
  const context = useContext(GptModelContext);
  if (context === undefined) {
    throw new Error("useGptModel must be used within a GptModelProvider");
  }
  return context;
};

export default GptModelProvider;