import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Info, Briefcase, Target } from "lucide-react";

export default function AmoaContextBanner() {
  const { 
    selectedDomain, 
    selectedScenario,
    userName
  } = useChatContext();

  // Si aucun domaine ou scénario n'est sélectionné, rien à afficher
  if (!selectedDomain || !selectedScenario) return null;

  return (
    <div className="px-4 py-3 border-t border-blue-700/30 bg-blue-900/30">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm max-w-5xl mx-auto">
        {/* Nom de l'utilisateur */}
        {userName && (
          <div className="flex items-center gap-2 text-blue-100">
            <Info className="h-4 w-4 text-blue-300" />
            <span>{userName}</span>
          </div>
        )}
        
        {/* Domaine métier */}
        <div className="flex items-center gap-2 text-blue-100">
          <Briefcase className="h-4 w-4 text-blue-300" />
          <span>{selectedDomain.name}</span>
        </div>
        
        {/* Scénario */}
        <div className="flex items-center gap-2 text-blue-100">
          <Target className="h-4 w-4 text-blue-300" />
          <span>{selectedScenario.name || selectedScenario.title}</span>
          <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${getDifficultyColor(selectedScenario.difficulty)}`}>
            {selectedScenario.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}

// Fonction pour obtenir les couleurs correspondant au niveau de difficulté
function getDifficultyColor(difficulty: string): string {
  switch(difficulty.toLowerCase()) {
    case 'débutant':
      return 'bg-green-500/20 text-green-300 border border-green-500/30';
    case 'intermédiaire':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    case 'avancé':
      return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    case 'expert':
      return 'bg-red-500/20 text-red-300 border border-red-500/30';
    default:
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  }
}