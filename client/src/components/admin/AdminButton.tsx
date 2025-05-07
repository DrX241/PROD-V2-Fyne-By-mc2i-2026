import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLoginDialog from './AdminLoginDialog';

export default function AdminButton() {
  // Utilisation d'un état local comme solution de secours (fallback)
  const [localAdminMode, setLocalAdminMode] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  
  // On essaie d'utiliser le contexte admin, mais on a un fallback si l'appel échoue
  let isAdminMode = localAdminMode;
  let setAdminFn = setLocalAdminMode; // Fonction pour définir le mode admin
  
  try {
    const adminContext = useAdmin();
    isAdminMode = adminContext.isAdminMode;
    
    // Wrapper pour que les types soient compatibles
    setAdminFn = (value: boolean | ((prev: boolean) => boolean)) => {
      // Si c'est une fonction, on l'applique à la valeur actuelle
      const newValue = typeof value === 'function' 
        ? value(adminContext.isAdminMode) 
        : value;
      
      adminContext.setAdminMode(newValue);
    };
  } catch (error) {
    // On utilise l'état local si le contexte n'est pas disponible
    console.log("AdminButton: Fallback to local admin state");
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`opacity-30 hover:opacity-100 transition-opacity ${isAdminMode ? 'bg-yellow-500/20 border-yellow-500' : 'bg-slate-700/50 border-slate-600'}`}
        onClick={() => isAdminMode ? setAdminFn(false) : setShowLoginDialog(true)}
      >
        {isAdminMode ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
        <span className="text-xs">{isAdminMode ? 'Mode Admin' : 'Mode Normal'}</span>
      </Button>
      
      <AdminLoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </>
  );
}