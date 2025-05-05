import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';

export default function DataIANotImplemented() {
  const [, setLocation] = useLocation();

  return (
    <HomeLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-blue-300" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-white">Module en cours de développement</h1>
            
            <p className="text-blue-200 mb-8">
              Ce module Data & IA est en cours de développement et sera bientôt disponible. 
              Revenez prochainement pour explorer cette fonctionnalité.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => setLocation('/data-ia')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à Data & IA
              </Button>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLocation('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}