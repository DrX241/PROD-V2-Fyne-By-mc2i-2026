import React, { useState } from "react";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, MessageSquare, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
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
        // Interface d'accueil animée et interactive
        <div className="min-h-[calc(100vh-64px)] bg-[#0a1420] p-6 relative overflow-hidden">
          {/* Éléments d'animation de fond */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-500/5 animate-pulse" style={{ animationDuration: '15s' }}></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-red-500/5 animate-pulse" style={{ animationDuration: '20s' }}></div>
            <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-cyan-300/70 rounded-full shadow-[0_0_8px_rgba(0,180,216,0.7)] animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-300/70 rounded-full shadow-[0_0_8px_rgba(230,57,70,0.7)] animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Centre de Commandement Cyber</h1>
              <p className="text-[#c3d9ee]/70 max-w-2xl mx-auto">
                Bienvenue dans votre poste de contrôle. Choisissez votre mode d'opération pour commencer votre immersion dans le monde de la cybersécurité.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Carte Mode Mission - Animée et interactive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(230,57,70,0.3)' }}
                className="bg-[#121e2e] p-6 rounded-lg border-2 border-[#e63946]/60 cursor-pointer relative overflow-hidden"
                onClick={startMissionMode}
              >
                {/* Badge clignotant */}
                <div className="absolute -right-3 -top-3 animate-pulse">
                  <div className="bg-[#e63946] text-white text-xs py-1 px-3 rounded-full font-bold shadow-lg transform rotate-12">
                    NOUVEAU
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-[#091525] rounded-full flex items-center justify-center border-2 border-[#e63946] mb-4 relative shadow-[0_0_15px_rgba(230,57,70,0.3)]">
                    <Terminal className="h-8 w-8 text-[#e63946]" />
                    <div className="absolute inset-0 border-2 border-[#e63946]/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                  </div>
                  <h2 className="font-mono font-bold text-[#e63946] text-2xl tracking-wide">MODE MISSION</h2>
                  <p className="text-[#e63946]/80 text-sm">SIMULATION IMMERSIVE</p>
                </div>
                
                <div className="bg-[#0a1420]/70 p-4 rounded-md mb-4 border border-[#e63946]/30">
                  <p className="text-[#c3d9ee] mb-3">
                    Incarnez un professionnel de la cybersécurité dans une mission critique. Vos décisions influencent:
                  </p>
                  <ul className="space-y-2 text-sm text-[#c3d9ee]/90">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#e63946] mr-2 flex-shrink-0" />
                      <span>La sécurité de votre entreprise</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#e63946] mr-2 flex-shrink-0" />
                      <span>Le budget alloué aux mesures de sécurité</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#e63946] mr-2 flex-shrink-0" />
                      <span>La réputation de votre organisation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#e63946] mr-2 flex-shrink-0" />
                      <span>Votre progression de carrière</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="inline-block bg-[#e63946]/20 text-[#e63946] px-3 py-1 rounded-full text-xs font-medium">DÉCISIONS À IMPACT</span>
                  <span className="inline-block bg-[#e63946]/20 text-[#e63946] px-3 py-1 rounded-full text-xs font-medium">PERSONNAGES IA</span>
                  <span className="inline-block bg-[#e63946]/20 text-[#e63946] px-3 py-1 rounded-full text-xs font-medium">SCÉNARIOS RÉALISTES</span>
                </div>
                
                <Button 
                  className="w-full bg-[#e63946] hover:bg-[#e63946]/80 text-white border-0 py-2"
                  onClick={startMissionMode}
                >
                  <Terminal className="mr-2 h-4 w-4" /> 
                  LANCER LA MISSION
                </Button>

                <div className="text-center mt-3 text-xs text-[#c3d9ee]/60">
                  Cliquez pour accéder au terminal sécurisé
                </div>
              </motion.div>
              
              {/* Carte Mode Conversation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,180,216,0.3)' }}
                className="bg-[#121e2e] p-6 rounded-lg border-2 border-[#00b4d8]/60 cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-[#091525] rounded-full flex items-center justify-center border-2 border-[#00b4d8] mb-4 shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                    <MessageSquare className="h-8 w-8 text-[#00b4d8]" />
                  </div>
                  <h2 className="font-mono font-bold text-[#00b4d8] text-2xl tracking-wide">MODE DIALOGUE</h2>
                  <p className="text-[#00b4d8]/80 text-sm">CONVERSATION LIBRE</p>
                </div>
                
                <div className="bg-[#0a1420]/70 p-4 rounded-md mb-4 border border-[#00b4d8]/30">
                  <p className="text-[#c3d9ee] mb-3">
                    Discutez librement avec l'expert IA en cybersécurité pour:
                  </p>
                  <ul className="space-y-2 text-sm text-[#c3d9ee]/90">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#00b4d8] mr-2 flex-shrink-0" />
                      <span>Obtenir des informations sur les menaces actuelles</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#00b4d8] mr-2 flex-shrink-0" />
                      <span>Poser vos questions techniques</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#00b4d8] mr-2 flex-shrink-0" />
                      <span>Apprendre les bonnes pratiques</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#00b4d8] mr-2 flex-shrink-0" />
                      <span>Explorer des thématiques personnalisées</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="inline-block bg-[#00b4d8]/20 text-[#00b4d8] px-3 py-1 rounded-full text-xs font-medium">CONVERSATION IA</span>
                  <span className="inline-block bg-[#00b4d8]/20 text-[#00b4d8] px-3 py-1 rounded-full text-xs font-medium">RESSOURCES</span>
                  <span className="inline-block bg-[#00b4d8]/20 text-[#00b4d8] px-3 py-1 rounded-full text-xs font-medium">APPRENTISSAGE</span>
                </div>
                
                <Button 
                  className="w-full bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-white border-0 py-2"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> 
                  COMMENCER LA DISCUSSION
                </Button>

                <div className="text-center mt-3 text-xs text-[#c3d9ee]/60">
                  En développement - Bientôt disponible
                </div>
              </motion.div>
            </div>
            
            <Card className="bg-[#091525]/70 border-[#00b4d8]/30 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#00b4d8]">Guide d'utilisation</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex">
                    <div className="bg-[#e63946]/10 text-[#e63946] p-2 rounded-full h-fit">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-[#e63946]">Mode Mission</h3>
                      <p className="text-[#c3d9ee]/80">Idéal pour une expérience immersive et guidée avec des scénarios, des personnages et des challenges à résoudre.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-[#00b4d8]/10 text-[#00b4d8] p-2 rounded-full h-fit">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-[#00b4d8]">Mode Dialogue</h3>
                      <p className="text-[#c3d9ee]/80">Parfait pour les questions spécifiques, l'exploration libre des concepts ou l'assistance sur des problématiques précises.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
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