import React, { useState } from "react";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import MissionTerminal from "@/components/cyber/MissionTerminal";
import { DecisionProvider } from "@/contexts/DecisionContext";

// Contenu principal de la page
function ExpertLearningPageContent() {
  // État qui contrôle l'affichage du mode mission
  const [showMissionTerminal, setShowMissionTerminal] = useState(false);
  
  // Fonction pour lancer le mode mission
  const startMissionMode = () => {
    setShowMissionTerminal(true);
  };
  
  // Fonction pour quitter le mode mission
  const exitMissionMode = () => {
    setShowMissionTerminal(false);
  };

  return (
    <HomeLayout>
      <PageTitle title="Apprendre en échangeant" />
      
      {showMissionTerminal ? (
        // Interface du terminal de mission
        <div className="min-h-[calc(100vh-64px)] relative bg-[#0a1420]">
          <MissionTerminal onExit={exitMissionMode} />
        </div>
      ) : (
        // Interface d'accueil normale
        <div className="min-h-[calc(100vh-64px)] bg-[#0a1420] p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-[#091525] border-[#00b4d8]/30 text-white">
              <CardHeader>
                <CardTitle className="text-[#00b4d8]">Expert Cybersécurité - Interface de dialogue</CardTitle>
                <CardDescription className="text-[#c3d9ee]/70">
                  Choisissez votre mode d'apprentissage
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Carte Mode Mission */}
                <div 
                  className="bg-[#121e2e] p-5 rounded-md border-2 border-[#e63946]/50 hover:border-[#e63946]/80 hover:shadow-[0_0_15px_rgba(230,57,70,0.2)] transition-all cursor-pointer"
                  onClick={startMissionMode}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-[#091525] rounded-full flex items-center justify-center border border-[#e63946]/60 mr-3">
                      <Terminal className="h-5 w-5 text-[#e63946]" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-[#e63946] text-lg">MODE MISSION</h3>
                      <p className="text-xs text-[#e63946]/80">NOUVEAU - Immersion totale</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#c3d9ee]/90 mb-2">
                    Plongez dans une simulation immersive où vos décisions en tant que professionnel 
                    de la cybersécurité ont des conséquences réelles sur votre entreprise et votre carrière.
                  </p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="inline-block bg-[#e63946]/10 text-[#e63946] px-2 py-0.5 rounded text-xs">ROLEPLAY</span>
                    <span className="inline-block bg-[#e63946]/10 text-[#e63946] px-2 py-0.5 rounded text-xs">DÉCISIONS À IMPACT</span>
                    <span className="inline-block bg-[#e63946]/10 text-[#e63946] px-2 py-0.5 rounded text-xs">PERSONNAGES</span>
                  </div>
                </div>
                
                {/* Vous pouvez ajouter d'autres options ici si nécessaire */}
              </CardContent>
              
              <CardFooter>
                <p className="text-sm text-[#c3d9ee]/50 italic">
                  Conseil : Le mode mission vous permet d'expérimenter des scénarios réalistes avec des PNJ et des choix qui affectent l'histoire.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </HomeLayout>
  );
}

// Wrapper avec le contexte de décision
export default function ExpertLearningPage() {
  return (
    <DecisionProvider>
      <ExpertLearningPageContent />
    </DecisionProvider>
  );
}