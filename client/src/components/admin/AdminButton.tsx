import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLoginDialog from './AdminLoginDialog';

export default function AdminButton() {
  const { isAdminMode, setAdminMode } = useAdmin();
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`opacity-30 hover:opacity-100 transition-opacity ${isAdminMode ? 'bg-yellow-500/20 border-yellow-500' : 'bg-slate-700/50 border-slate-600'}`}
        onClick={() => isAdminMode ? setAdminMode(false) : setShowLoginDialog(true)}
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