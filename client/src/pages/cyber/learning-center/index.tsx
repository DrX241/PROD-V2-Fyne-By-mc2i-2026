import React from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import HomeLayout from '@/components/layout/HomeLayout';

export default function CyberLearningCenter() {
  const [, setLocation] = useLocation();

  const handleReturn = () => {
    setLocation('/cyber/roleplay');
  };

  return (
    <HomeLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={handleReturn}
            className="mb-8 bg-blue-900 border-blue-400/30 text-blue-300 hover:bg-blue-800 hover:border-blue-400/50 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux modules Cyber
          </Button>
          
          <div className="max-w-4xl mx-auto bg-blue-900/50 p-8 rounded-lg border border-blue-400/30 shadow-lg">
            <h1 className="text-3xl font-bold text-blue-100 mb-6 text-center">CYBER LEARNING CENTER</h1>
            
            <div className="space-y-6 text-blue-200">
              <p className="text-center mb-8">
                Notre centre d'apprentissage dédié à la cybersécurité propose des parcours 
                pédagogiques personnalisés et interactifs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-950 p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">Parcours Débutant</h2>
                  <p className="text-sm mb-4">Introduction aux concepts fondamentaux de la cybersécurité et aux bonnes pratiques essentielles.</p>
                  <p className="text-xs text-blue-400">Disponible prochainement</p>
                </div>
                
                <div className="bg-blue-950 p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">Parcours Intermédiaire</h2>
                  <p className="text-sm mb-4">Approfondissement des connaissances techniques et analyse de scénarios de menaces.</p>
                  <p className="text-xs text-blue-400">Disponible prochainement</p>
                </div>
                
                <div className="bg-blue-950 p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">Parcours Avancé</h2>
                  <p className="text-sm mb-4">Techniques de protection avancées et gestion des incidents de sécurité complexes.</p>
                  <p className="text-xs text-blue-400">Disponible prochainement</p>
                </div>
                
                <div className="bg-blue-950 p-6 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">Certification</h2>
                  <p className="text-sm mb-4">Préparation aux certifications professionnelles reconnues dans le domaine de la cybersécurité.</p>
                  <p className="text-xs text-blue-400">Disponible prochainement</p>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-sm text-blue-300 mb-4">
                  Cette section est en cours de développement. 
                  De nouveaux modules seront ajoutés prochainement.
                </p>
                <Button
                  className="bg-blue-700 hover:bg-blue-600 text-white"
                  onClick={handleReturn}
                >
                  Retourner aux modules Cyber
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}