import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalPasswordScreenProps {
  onAuthenticate: () => void;
}

export default function GlobalPasswordScreen({ onAuthenticate }: GlobalPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Le mot de passe correct
  const correctPassword = "Hey!Bienvenuechezmc2i,enfin,sur,fyne:)2025@";
  
  // Animation de l'arrière-plan
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.5 }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      // Stockage de l'authentification dans localStorage
      localStorage.setItem('appAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
      onAuthenticate();
    } else {
      setError('Mot de passe incorrect. Veuillez réessayer.');
      setAttempts(prev => prev + 1);
      setPassword('');
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Éléments décoratifs en arrière-plan */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
      
      <motion.div 
        className="z-10 w-full max-w-md"
        variants={cardVariants}
      >
        <Card className="border border-gray-800 bg-black/40 backdrop-blur-md text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900/50 border border-blue-700">
              <Lock className="h-10 w-10 text-blue-300" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white mb-2">Accès Restreint</CardTitle>
            <p className="text-gray-300">
              Cette application est en accès limité. Veuillez entrer le mot de passe pour continuer.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                  <ShieldCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm flex items-center gap-1.5 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Accéder à l'application
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 text-center text-gray-400 text-xs">
            <p className="w-full">
              Fyne © {new Date().getFullYear()} - Tous droits réservés
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}