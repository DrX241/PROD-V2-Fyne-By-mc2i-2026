import React, { useState } from 'react';
import { CrisisDecisionContent, CrisisDecisionOption } from '@shared/types/cyber';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, ChevronDown, ChevronUp, Fingerprint, Building, Briefcase, ShieldCheck, DollarSign } from 'lucide-react';

interface DecisionChoicesProps {
  decision: CrisisDecisionContent;
  onSelectOption: (optionId: string) => void;
}

export default function DecisionChoices({ decision, onSelectOption }: DecisionChoicesProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const toggleOption = (optionId: string) => {
    setExpandedOption(expandedOption === optionId ? null : optionId);
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);
  };

  const confirmSelection = () => {
    if (selectedOption) {
      onSelectOption(selectedOption);
      setIsConfirming(false);
    }
  };

  const cancelSelection = () => {
    setSelectedOption(null);
    setIsConfirming(false);
  };

  // Fonction pour générer un badge d'urgence - adapté pour mobile
  const renderUrgencyBadge = (level?: string) => {
    if (!level) return null;
    
    let color = "bg-blue-100 text-blue-800";
    
    switch (level) {
      case 'faible':
        color = "bg-blue-100 text-blue-800";
        break;
      case 'modérée':
        color = "bg-yellow-100 text-yellow-800";
        break;
      case 'élevée':
        color = "bg-orange-100 text-orange-800";
        break;
      case 'critique':
        color = "bg-red-100 text-red-800";
        break;
    }
    
    return (
      <Badge 
        className={`${color} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium text-xs sm:text-sm`}
      >
        <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span>Urgence {level}</span>
      </Badge>
    );
  };

  // Rendu des badges d'impact pour chaque option - adaptés pour mobile
  const renderImpactBadges = (option: CrisisDecisionOption) => {
    const badges = [];
    
    if (option.impact.budget !== undefined) {
      const isPositive = option.impact.budget >= 0;
      badges.push(
        <Badge key="budget" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs`}>
          <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Budget: {isPositive ? '+' : ''}{option.impact.budget}%</span>
        </Badge>
      );
    }
    
    if (option.impact.timeline !== undefined) {
      const isPositive = option.impact.timeline <= 0;
      badges.push(
        <Badge key="timeline" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs`}>
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Délai: {option.impact.timeline > 0 ? '+' : ''}{option.impact.timeline}j</span>
        </Badge>
      );
    }
    
    if (option.impact.reputation !== undefined) {
      const isPositive = option.impact.reputation >= 0;
      badges.push(
        <Badge key="reputation" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs`}>
          <Building className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Réput: {isPositive ? '+' : ''}{option.impact.reputation}</span>
        </Badge>
      );
    }
    
    if (option.impact.security !== undefined) {
      const isPositive = option.impact.security >= 0;
      badges.push(
        <Badge key="security" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs`}>
          <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Sécu: {isPositive ? '+' : ''}{option.impact.security}</span>
        </Badge>
      );
    }
    
    if (option.impact.employment === true) {
      badges.push(
        <Badge key="employment" className="bg-red-100 text-red-800 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs">
          <Briefcase className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Impact RH</span>
        </Badge>
      );
    }
    
    if (option.impact.missionCritical === true) {
      badges.push(
        <Badge key="critical" className="bg-red-100 text-red-800 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 text-xs">
          <Fingerprint className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Critique</span>
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-700/30 rounded-lg p-3 sm:p-6 shadow-lg backdrop-blur-sm">
      <div className="space-y-3 sm:space-y-4">
        {/* En-tête de la situation de crise - adapté pour mobile */}
        <div className="border-b border-blue-700/30 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">Situation de crise</h3>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {renderUrgencyBadge(decision.urgencyLevel)}
              {decision.deadline && (
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Échéance: {decision.deadline}</span>
                </Badge>
              )}
            </div>
          </div>
          <p className="text-base sm:text-lg font-semibold text-blue-100 mb-3">{decision.situation}</p>
          
          {/* Grille d'information adaptée pour mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2">
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-2 sm:p-3">
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">Contexte</h4>
              <p className="text-blue-100 text-xs sm:text-sm">{decision.context}</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-2 sm:p-3">
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">Faits historiques</h4>
              <p className="text-blue-100 text-xs sm:text-sm">{decision.historicalFacts}</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-2 sm:p-3">
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">Conséquences potentielles</h4>
              <p className="text-blue-100 text-xs sm:text-sm">{decision.consequences}</p>
            </div>
          </div>
        </div>
        
        {/* Options de décision - adaptées pour mobile */}
        <div>
          <h4 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Vous devez prendre une décision. Choisissez parmi les options suivantes :</h4>
          <div className="space-y-2 sm:space-y-3">
            {decision.options.map((option) => (
              <div 
                key={option.id}
                className={`border rounded-lg transition-all ${
                  selectedOption === option.id 
                    ? 'border-blue-400 bg-blue-900/50' 
                    : 'border-blue-800/40 bg-blue-950/40 hover:bg-blue-900/30'
                } shadow-sm`}
              >
                <div 
                  className="p-2.5 sm:p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex-1 pr-2">
                    <h5 className="font-medium text-white text-sm sm:text-base">{option.text}</h5>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                      {renderImpactBadges(option)}
                    </div>
                  </div>
                  {expandedOption === option.id ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 flex-shrink-0" />
                  )}
                </div>
                
                {expandedOption === option.id && (
                  <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-blue-800/30 mt-1">
                    <p className="text-blue-100 text-xs sm:text-sm mb-2 sm:mb-3">{option.description}</p>
                    {selectedOption !== option.id && (
                      <Button 
                        variant="default" 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                        onClick={() => handleOptionSelect(option.id)}
                      >
                        Choisir cette option
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Confirmation - adaptée pour mobile */}
        {isConfirming && (
          <div className="mt-4 sm:mt-6 border-t border-blue-700/30 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="text-blue-100 text-center sm:text-left mb-2 sm:mb-0">
              <p className="font-medium text-sm sm:text-base">Êtes-vous certain de votre choix ?</p>
              <p className="text-xs opacity-80">Cette décision aura des conséquences importantes sur la suite de votre mission.</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={cancelSelection}
                className="text-xs sm:text-sm py-1 sm:py-2 h-auto"
              >
                Annuler
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-1 sm:py-2 h-auto" 
                onClick={confirmSelection}
              >
                Confirmer mon choix
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}