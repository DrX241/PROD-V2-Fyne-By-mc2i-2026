import React, { useState } from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import AdminStorage from '@/utils/adminStorage';

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminLoginDialog({ open, onOpenChange }: AdminLoginDialogProps) {
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  
  // Utiliser le validateur de mot de passe de l'utilitaire AdminStorage
  const validateAdminPassword = (pwd: string): boolean => {
    return AdminStorage.validatePassword(pwd);
  };
  
  const handleValidation = () => {
    const isValid = validateAdminPassword(password);
    
    if (!isValid) {
      setPasswordError("Mot de passe incorrect");
    } else {
      setPassword("");
      setPasswordError("");
      onOpenChange(false);
    }
  };
  
  const handleClose = () => {
    setPassword("");
    setPasswordError("");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
            <span>Authentification Admin</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Entrez votre mot de passe..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidation()}
                className="bg-gray-800 border-gray-700 text-white"
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            onClick={handleClose}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleValidation}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Déverrouiller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}