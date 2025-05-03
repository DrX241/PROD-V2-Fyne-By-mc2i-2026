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

  // Fonction pour générer un badge d'urgence
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
        className={`${color} flex items-center gap-1.5 px-2 py-1 font-medium`}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Urgence {level}</span>
      </Badge>
    );
  };

  // Rendu des badges d'impact pour chaque option
  const renderImpactBadges = (option: CrisisDecisionOption) => {
    const badges = [];
    
    if (option.impact.budget !== undefined) {
      const isPositive = option.impact.budget >= 0;
      badges.push(
        <Badge key="budget" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1.5`}>
          <DollarSign className="h-3 w-3" />
          <span>Budget: {isPositive ? '+' : ''}{option.impact.budget}%</span>
        </Badge>
      );
    }
    
    if (option.impact.timeline !== undefined) {
      const isPositive = option.impact.timeline <= 0;
      badges.push(
        <Badge key="timeline" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} flex items-center gap-1.5`}>
          <Clock className="h-3 w-3" />
          <span>Délai: {option.impact.timeline > 0 ? '+' : ''}{option.impact.timeline} jours</span>
        </Badge>
      );
    }
    
    if (option.impact.reputation !== undefined) {
      const isPositive = option.impact.reputation >= 0;
      badges.push(
        <Badge key="reputation" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1.5`}>
          <Building className="h-3 w-3" />
          <span>Réputation: {isPositive ? '+' : ''}{option.impact.reputation}</span>
        </Badge>
      );
    }
    
    if (option.impact.security !== undefined) {
      const isPositive = option.impact.security >= 0;
      badges.push(
        <Badge key="security" className={`${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center gap-1.5`}>
          <ShieldCheck className="h-3 w-3" />
          <span>Sécurité: {isPositive ? '+' : ''}{option.impact.security}</span>
        </Badge>
      );
    }
    
    if (option.impact.employment === true) {
      badges.push(
        <Badge key="employment" className="bg-red-100 text-red-800 flex items-center gap-1.5">
          <Briefcase className="h-3 w-3" />
          <span>Impact RH</span>
        </Badge>
      );
    }
    
    if (option.impact.missionCritical === true) {
      badges.push(
        <Badge key="critical" className="bg-red-100 text-red-800 flex items-center gap-1.5">
          <Fingerprint className="h-3 w-3" />
          <span>Risque critique</span>
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-700/30 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-sm">
      <div className="space-y-4">
        {/* En-tête de la situation de crise */}
        <div className="border-b border-blue-700/30 pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-white">Situation de crise</h3>
            <div className="flex items-center gap-2">
              {renderUrgencyBadge(decision.urgencyLevel)}
              {decision.deadline && (
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Échéance: {decision.deadline}</span>
                </Badge>
              )}
            </div>
          </div>
          <p className="text-lg font-semibold text-blue-100 mb-3">{decision.situation}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Contexte</h4>
              <p className="text-blue-100 text-sm">{decision.context}</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Faits historiques</h4>
              <p className="text-blue-100 text-sm">{decision.historicalFacts}</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Conséquences potentielles</h4>
              <p className="text-blue-100 text-sm">{decision.consequences}</p>
            </div>
          </div>
        </div>
        
        {/* Options de décision */}
        <div>
          <h4 className="text-white font-semibold mb-4">Vous devez prendre une décision. Choisissez parmi les options suivantes :</h4>
          <div className="space-y-3">
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
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{option.text}</h5>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {renderImpactBadges(option)}
                    </div>
                  </div>
                  {expandedOption === option.id ? (
                    <ChevronUp className="h-5 w-5 text-blue-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-300" />
                  )}
                </div>
                
                {expandedOption === option.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-blue-800/30 mt-1">
                    <p className="text-blue-100 text-sm mb-3">{option.description}</p>
                    {selectedOption !== option.id && (
                      <Button 
                        variant="default" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
        
        {/* Confirmation */}
        {isConfirming && (
          <div className="mt-6 border-t border-blue-700/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-blue-100">
              <p className="font-medium">Êtes-vous certain de votre choix ?</p>
              <p className="text-sm opacity-80">Cette décision aura des conséquences importantes sur la suite de votre mission.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={cancelSelection}>
                Annuler
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white" 
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