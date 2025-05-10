import React from 'react';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function TestCyberAcademie() {
  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30 hover:text-white"
            onClick={() => window.location.href = '/cyber'}
          >
            <Home className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="container py-12 px-4 mx-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg overflow-hidden shadow-xl border border-blue-800">
            <div className="p-6 border-b border-blue-800">
              <h2 className="text-2xl md:text-3xl font-semibold text-white font-exo">Test Technique de Cybersécurité</h2>
              <p className="text-blue-200 mt-2 font-rajdhani">
                Style CYBER ACADÉMIE appliqué correctement
              </p>
            </div>
            
            <div className="p-6 space-y-6 text-white">
              <p className="text-blue-100">Ce composant illustre l'application correcte du style CYBER ACADÉMIE avec:</p>
              <ul className="list-disc pl-5 space-y-2 text-blue-200">
                <li>Dégradé bleu-noir en arrière-plan</li>
                <li>Polices Exo 2 et Rajdhani</li>
                <li>Texte en blanc/bleu clair pour une bonne lisibilité</li>
                <li>Bordures et accents en bleu foncé</li>
              </ul>
              
              <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg mt-4">
                <h3 className="font-medium text-blue-100 font-rajdhani">Note importante</h3>
                <p className="text-sm text-blue-300 mt-2">
                  Ce style doit être appliqué à l'ensemble du module de test technique pour une cohérence visuelle avec les autres modules CYBER ACADÉMIE.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-blue-800 flex justify-between">
              <Button variant="outline" className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30">
                Action secondaire
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Action principale
              </Button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}