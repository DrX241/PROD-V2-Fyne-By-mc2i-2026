import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Clock, CheckCircle } from "lucide-react";
import DOMPurify from 'dompurify';

interface DecisionOption {
  id: string;
  text: string;
  description: string;
  impacts: {
    security?: 'positive' | 'negative' | 'neutral';
    business?: 'positive' | 'negative' | 'neutral';
    team?: 'positive' | 'negative' | 'neutral';
    legal?: 'positive' | 'negative' | 'neutral';
    career?: 'positive' | 'negative' | 'neutral';
  };
}

interface DecisionScenario {
  id: string;
  situation: string;
  context: string;
  historicalFacts: string;
  consequences: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  options: DecisionOption[];
}

interface CyberDecisionFlowProps {
  scenario: DecisionScenario;
  onDecisionMade: (optionId: string) => void;
  isLoading?: boolean;
  currentNumber: number;
  totalScenarios: number;
  summary: string | null;
}

export default function CyberDecisionFlow({ 
  scenario, 
  onDecisionMade,
  isLoading = false,
  currentNumber,
  totalScenarios,
  summary
}: CyberDecisionFlowProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const toggleOption = (optionId: string) => {
    if (expandedOption === optionId) {
      setExpandedOption(null);
    } else {
      setExpandedOption(optionId);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);
  };

  const cancelSelection = () => {
    setSelectedOption(null);
    setIsConfirming(false);
  };

  const confirmSelection = () => {
    if (selectedOption) {
      onDecisionMade(selectedOption);
      setSelectedOption(null);
      setIsConfirming(false);
      setExpandedOption(null);
    }
  };

  const renderUrgencyBadge = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const badgeProps = {
      low: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Faible urgence' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Urgence modérée' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Haute urgence' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'CRITIQUE' },
    }[level];

    return (
      <Badge className={`${badgeProps.bg} ${badgeProps.text}`}>
        {badgeProps.label}
      </Badge>
    );
  };

  const renderImpactBadges = (option: DecisionOption) => {
    const badges: JSX.Element[] = [];

    const impactConfig = {
      security: {
        positive: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sécurité +' },
        negative: { bg: 'bg-red-100', text: 'text-red-800', label: 'Sécurité -' },
        neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sécurité =' },
      },
      business: {
        positive: { bg: 'bg-green-100', text: 'text-green-800', label: 'Business +' },
        negative: { bg: 'bg-red-100', text: 'text-red-800', label: 'Business -' },
        neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Business =' },
      },
      team: {
        positive: { bg: 'bg-green-100', text: 'text-green-800', label: 'Équipe +' },
        negative: { bg: 'bg-red-100', text: 'text-red-800', label: 'Équipe -' },
        neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Équipe =' },
      },
      legal: {
        positive: { bg: 'bg-green-100', text: 'text-green-800', label: 'Légal +' },
        negative: { bg: 'bg-red-100', text: 'text-red-800', label: 'Légal -' },
        neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Légal =' },
      },
      career: {
        positive: { bg: 'bg-green-100', text: 'text-green-800', label: 'Carrière +' },
        negative: { bg: 'bg-red-100', text: 'text-red-800', label: 'Carrière -' },
        neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Carrière =' },
      },
    };

    // Générer les badges pour chaque impact
    Object.entries(option.impacts).forEach(([key, value]) => {
      const impactType = key as keyof typeof option.impacts;
      const impactValue = value as 'positive' | 'negative' | 'neutral';
      
      if (impactValue && impactConfig[impactType]?.[impactValue]) {
        const config = impactConfig[impactType][impactValue];
        badges.push(
          <Badge key={`${option.id}-${impactType}`} className={`${config.bg} ${config.text}`}>
            {config.label}
          </Badge>
        );
      }
    });
    
    return badges;
  };

  // Fonction pour formater le texte avec une structure visuelle
  const formatTextWithStructure = (text: string): string => {
    if (!text) return '';
    
    // Convertir les sauts de ligne en balises <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Détecter et mettre en évidence les styles d'apprentissage
    formattedText = formattedText.replace(/\((ACADÉMIQUE|ACADEMIC|SIMULATION|DÉFI|CHALLENGE|VISUEL|VISUAL)\)/gi, 
      '<span class="inline-block bg-[#00b4d8]/20 text-[#00b4d8] text-xs px-2 py-0.5 rounded mr-1 uppercase font-mono">$1</span>');
    
    // Remplacer les listes numérotées (1., 2., etc.)
    formattedText = formattedText.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0 font-bold">$1</div><div>$2</div></div>');
    
    // Remplacer les listes à puces (-, *, •)
    formattedText = formattedText.replace(/^([-*•]\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0">$1</div><div>$2</div></div>');
    
    // Mettre en surbrillance les sections importantes (entre ** ou entourées de MAJUSCULES)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-300">$1</span>');
    
    // Ajouter une classe pour les sections en majuscules
    formattedText = formattedText.replace(/([A-Z]{3,}[\s-][A-Z\s-]+)(\s*-\s*)/g, '<div class="font-bold text-blue-300 mt-3 mb-1">$1</div>');
    
    // Gérer les titres de sections
    formattedText = formattedText.replace(/(?<!span class="[^"]*">)(.*?):/g, '<span class="font-semibold">$1:</span>');

    return formattedText;
  };
  
  // Si nous avons un résumé, afficher la page de résumé au lieu du scénario
  if (summary) {
    return (
      <Card className="bg-gradient-to-br from-[#0c1e2e] to-[#091525] border border-[#00b4d8]/30 rounded-lg shadow-lg backdrop-blur-sm mb-6">
        <CardHeader className="pb-2 border-b border-[#00b4d8]/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <CardTitle className="text-xl text-white">Résumé de vos décisions</CardTitle>
          </div>
          <Badge className="bg-[#00b4d8]/20 text-[#00b4d8] font-mono mt-2">
            PARCOURS COMPLÉTÉ
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <div 
            className="prose prose-invert max-w-none text-[#c3d9ee]" 
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(formatTextWithStructure(summary)) 
            }}
          />
          <div className="mt-6 text-center">
            <Button 
              className="bg-[#00b4d8] hover:bg-[#00a0c2] text-[#0c1e2e] font-mono"
              onClick={() => window.location.reload()}
            >
              Commencer une nouvelle session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0c1e2e] to-[#091525] border border-[#00b4d8]/30 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-sm mb-6">
      <div className="space-y-4">
        {/* En-tête avec progression du scénario */}
        <div className="flex justify-between items-center mb-3">
          <Badge className="bg-[#00b4d8]/20 text-[#00b4d8] font-mono">
            DÉCISION {currentNumber}/{totalScenarios}
          </Badge>
          {renderUrgencyBadge(scenario.urgencyLevel)}
        </div>
        
        {/* En-tête de la situation de crise */}
        <div className="border-b border-[#00b4d8]/30 pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-white">Situation de crise</h3>
            <div className="flex items-center gap-2">
              {scenario.deadline && (
                <Badge className="bg-[#00b4d8]/20 text-[#00b4d8] flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Échéance: {scenario.deadline}</span>
                </Badge>
              )}
            </div>
          </div>
          <p className="text-lg font-semibold text-[#c3d9ee] mb-3">{scenario.situation}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
            <div className="bg-[#0c1e2e] border border-[#00b4d8]/20 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Contexte</h4>
              <p className="text-[#8abee0] text-sm">{scenario.context}</p>
            </div>
            <div className="bg-[#0c1e2e] border border-[#00b4d8]/20 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Faits historiques</h4>
              <p className="text-[#8abee0] text-sm">{scenario.historicalFacts}</p>
            </div>
            <div className="bg-[#0c1e2e] border border-[#00b4d8]/20 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2">Conséquences potentielles</h4>
              <p className="text-[#8abee0] text-sm">{scenario.consequences}</p>
            </div>
          </div>
        </div>
        
        {/* Options de décision */}
        <div>
          <h4 className="text-white font-semibold mb-4 font-mono">Vous devez prendre une décision. Choisissez parmi les options suivantes :</h4>
          <div className="space-y-3">
            {scenario.options.map((option) => (
              <div 
                key={option.id}
                className={`border rounded-lg transition-all ${
                  selectedOption === option.id 
                    ? 'border-[#00b4d8] bg-[#0c1e2e]' 
                    : 'border-[#00b4d8]/20 bg-[#091525] hover:bg-[#0c1e2e]/70'
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
                    <ChevronUp className="h-5 w-5 text-[#00b4d8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#00b4d8]" />
                  )}
                </div>
                
                {expandedOption === option.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#00b4d8]/20 mt-1">
                    <p className="text-[#8abee0] text-sm mb-3">{option.description}</p>
                    {selectedOption !== option.id && (
                      <Button 
                        variant="default" 
                        className="bg-[#00b4d8] hover:bg-[#00a0c2] text-[#0c1e2e] font-mono"
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
          <div className="mt-6 border-t border-[#00b4d8]/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[#8abee0]">
              <p className="font-medium">Êtes-vous certain de votre choix ?</p>
              <p className="text-sm opacity-80">Cette décision aura des conséquences importantes sur la suite de votre mission.</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10"
                onClick={cancelSelection}
              >
                Annuler
              </Button>
              <Button 
                className="bg-[#00b4d8] hover:bg-[#00a0c2] text-[#0c1e2e] font-mono" 
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