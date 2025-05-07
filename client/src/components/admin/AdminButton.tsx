import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminStorage from '@/utils/adminStorage';
import AdminLoginDialog from './AdminLoginDialog';

export default function AdminButton() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(AdminStorage.getAdminMode());
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  
  // S'abonner aux changements dans le gestionnaire d'état admin
  useEffect(() => {
    // Récupérer l'état initial
    setIsAdminMode(AdminStorage.getAdminMode());
    
    // S'abonner aux changements
    const unsubscribe = AdminStorage.subscribe((newValue) => {
      setIsAdminMode(newValue);
    });
    
    // Se désabonner lors du démontage du composant
    return () => unsubscribe();
  }, []);
  
  // Fonction pour changer l'état admin
  const toggleAdminMode = (value: boolean) => {
    AdminStorage.setAdminMode(value);
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`opacity-30 hover:opacity-100 transition-opacity ${isAdminMode ? 'bg-yellow-500/20 border-yellow-500' : 'bg-slate-700/50 border-slate-600'}`}
        onClick={() => isAdminMode ? toggleAdminMode(false) : setShowLoginDialog(true)}
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