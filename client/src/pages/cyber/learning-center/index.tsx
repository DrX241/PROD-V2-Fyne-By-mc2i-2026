import React from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, BookOpen, Brain } from "lucide-react";
import HomeLayout from '@/components/layout/HomeLayout';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CyberLearningCenter() {
  const [, setLocation] = useLocation();

  const handleReturn = () => {
    setLocation('/cyber');
  };

  return (
    <HomeLayout>
      <div className="flex flex-col min-h-screen bg-[#0a1429]">
        {/* Header avec bouton retour */}
        <div className="w-full px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={handleReturn}
            className="text-white hover:bg-blue-900/30 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        
        {/* En-tête principale */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Cyber Académie</h1>
              <p className="text-blue-300 mt-1">Centre de formation complet en cybersécurité</p>
            </div>
          </div>
          
          {/* Parcours rapide */}
          <div className="mb-10">
            <div className="flex items-center mb-6 bg-gradient-to-r from-orange-800 to-transparent p-3 rounded-md">
              <div className="bg-orange-600 p-2 rounded mr-3">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Parcours rapide</h2>
                <p className="text-sm text-blue-200">Apprentissage accéléré et outils d'auto-formation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fiches Cyber Express */}
              <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                      <h3 className="font-medium text-white mt-1">Fiches Cyber Express</h3>
                    </div>
                  </div>
                  <div className="text-xs text-blue-300 flex items-center mb-2">
                    <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                    <span className="ml-2 text-blue-400">5-10min</span>
                  </div>
                  <p className="text-sm text-blue-100 mb-4">Synthèses rapides sur les concepts clés de cybersécurité</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">fiches</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">synthèse</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">express</Badge>
                  </div>
                </div>
              </Card>
              
              {/* Quiz adaptatif IA */}
              <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                      <h3 className="font-medium text-white mt-1">Quiz adaptatif IA</h3>
                    </div>
                  </div>
                  <div className="text-xs text-blue-300 flex items-center mb-2">
                    <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                    <span className="ml-2 text-blue-400">10-15min</span>
                  </div>
                  <p className="text-sm text-blue-100 mb-4">Évaluez vos connaissances avec des quiz personnalisés par l'IA</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">quiz</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">évaluation</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">adaptatif</Badge>
                  </div>
                </div>
              </Card>
              
              {/* Glossaire visuel */}
              <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                      <h3 className="font-medium text-white mt-1">Glossaire visuel</h3>
                    </div>
                  </div>
                  <div className="text-xs text-blue-300 flex items-center mb-2">
                    <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">débutant</span>
                    <span className="ml-2 text-blue-400">5-10min</span>
                  </div>
                  <p className="text-sm text-blue-100 mb-4">Lexique illustré des termes techniques de cybersécurité</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">glossaire</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">terminologie</Badge>
                    <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">visuel</Badge>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Mémo IA personnalisé */}
            <div className="mt-6">
              <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start">
                    <div className="h-8 w-8 mr-3 flex items-center justify-center bg-blue-800 text-white rounded">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                          <h3 className="font-medium text-white mt-1">Mémo IA personnalisé</h3>
                        </div>
                        <div className="text-xs text-blue-300 flex items-center">
                          <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">tous niveaux</span>
                          <span className="ml-2 text-blue-400">5-10min</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-100 my-2">Créez des aide-mémoires sur mesure grâce à l'intelligence artificielle</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">mémo</Badge>
                        <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">personnalisé</Badge>
                        <Badge className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">IA</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}