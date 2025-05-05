import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Détection de l'appareil mobile pour choisir le bon backend
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

interface DnDWrapperProps {
  children: React.ReactNode;
}

const DnDWrapper: React.FC<DnDWrapperProps> = ({ children }) => {
  // Sélectionner le backend en fonction du type d'appareil
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  
  return (
    <DndProvider backend={backend}>
      {children}
    </DndProvider>
  );
};

export default DnDWrapper;