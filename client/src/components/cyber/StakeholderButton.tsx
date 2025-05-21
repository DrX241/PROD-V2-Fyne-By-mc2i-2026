import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: "calm" | "anxious" | "authoritative" | "technical" | "diplomatic";
  department: "IT" | "Executive" | "Communication" | "Legal" | "Operations" | "External";
  expertise: number;
  stress: number;
  trust: number;
  isAvailable: boolean;
}

interface StakeholderButtonProps {
  stakeholder: Stakeholder;
  active?: boolean;
  onClick: (stakeholderId: string) => void;
}

/**
 * Composant bouton pour afficher et interagir avec un stakeholder
 * Empêche la propagation des événements pour éviter la fermeture des dialogues
 */
export const StakeholderButton: React.FC<StakeholderButtonProps> = ({
  stakeholder,
  active = false,
  onClick
}) => {
  // Fonction qui empêche la propagation du clic
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(stakeholder.id);
  };

  return (
    <Card 
      className={`relative border cursor-pointer transition-all duration-200 hover:shadow-md
        ${active 
          ? 'border-blue-500 bg-blue-950/30 shadow-blue-500/20 shadow-md' 
          : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}
      onClick={handleClick}
    >
      {/* Indicateur de département */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        stakeholder.department === 'IT' ? 'bg-blue-600' :
        stakeholder.department === 'Executive' ? 'bg-purple-700' :
        stakeholder.department === 'Communication' ? 'bg-green-600' :
        stakeholder.department === 'Legal' ? 'bg-amber-700' :
        stakeholder.department === 'Operations' ? 'bg-orange-600' :
        'bg-slate-700'
      }`}></div>
      
      <CardContent className="flex items-start gap-3 p-4">
        <Avatar className="h-10 w-10 border-2 border-gray-700">
          <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
          <AvatarFallback className="bg-gray-800 text-gray-200">
            {stakeholder.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight">{stakeholder.name}</h3>
          <p className="text-xs text-gray-400 leading-tight">{stakeholder.role}</p>
          
          <div className="flex flex-wrap gap-1 pt-1">
            <Badge variant="outline" className={`text-[10px] py-0 ${
              stakeholder.department === 'IT' ? 'bg-blue-900/30 border-blue-700/50' :
              stakeholder.department === 'Executive' ? 'bg-purple-900/30 border-purple-700/50' :
              stakeholder.department === 'Communication' ? 'bg-green-900/30 border-green-700/50' :
              stakeholder.department === 'Legal' ? 'bg-amber-900/30 border-amber-700/50' :
              stakeholder.department === 'Operations' ? 'bg-orange-900/30 border-orange-700/50' :
              'bg-slate-900/30 border-slate-700/50'
            }`}>
              {stakeholder.department}
            </Badge>
            
            <Badge variant="outline" className="bg-gray-800/30 border-gray-700/50 text-[10px] py-0">
              {stakeholder.personality === 'technical' ? 'Technique' :
              stakeholder.personality === 'anxious' ? 'Anxieux' :
              stakeholder.personality === 'authoritative' ? 'Autoritaire' :
              stakeholder.personality === 'diplomatic' ? 'Diplomatique' :
              'Calme'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakeholderButton;