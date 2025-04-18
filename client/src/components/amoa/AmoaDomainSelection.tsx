import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Briefcase, Building, Building2, Lightbulb, Landmark, Factory, FileBadge2 } from "lucide-react";

export default function AmoaDomainSelection() {
  const { domains, selectDomain } = useChatContext();

  // Si aucun domaine n'est disponible, ne rien afficher
  if (!domains || domains.length === 0) return null;

  // Icônes par domaine
  const getIconByDomain = (domainId: string) => {
    switch (domainId) {
      case 'banque':
        return <Landmark className="h-5 w-5" />;
      case 'assurance':
        return <FileBadge2 className="h-5 w-5" />;
      case 'energie':
        return <Lightbulb className="h-5 w-5" />;
      case 'secteur-public':
        return <Building2 className="h-5 w-5" />;
      case 'industrie':
        return <Factory className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  // Gestionnaire pour la sélection de domaine
  const handleDomainSelect = (domainId: string) => {
    selectDomain(domainId);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-8">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Briefcase className="inline-block mr-2 h-5 w-5 text-blue-600" />
          <span>Sélectionnez un domaine métier</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain) => {
            // Déterminer les couleurs à utiliser en fonction du domaine
            let bgColor = "bg-blue-50";
            let hoverColor = "hover:bg-blue-100";
            let textColor = "text-blue-700";
            let borderHoverColor = "hover:border-blue-300";
            
            switch(domain.id) {
              case 'banque':
                bgColor = "bg-blue-50";
                hoverColor = "hover:bg-blue-100";
                textColor = "text-blue-700";
                borderHoverColor = "hover:border-blue-300";
                break;
              case 'assurance':
                bgColor = "bg-indigo-50";
                hoverColor = "hover:bg-indigo-100";
                textColor = "text-indigo-700";
                borderHoverColor = "hover:border-indigo-300";
                break;
              case 'energie':
                bgColor = "bg-yellow-50";
                hoverColor = "hover:bg-yellow-100";
                textColor = "text-yellow-700";
                borderHoverColor = "hover:border-yellow-300";
                break;
              case 'secteur-public':
                bgColor = "bg-teal-50";
                hoverColor = "hover:bg-teal-100";
                textColor = "text-teal-700";
                borderHoverColor = "hover:border-teal-300";
                break;
              case 'industrie':
                bgColor = "bg-purple-50";
                hoverColor = "hover:bg-purple-100";
                textColor = "text-purple-700";
                borderHoverColor = "hover:border-purple-300";
                break;
              case 'methodologies':
                bgColor = "bg-gray-50";
                hoverColor = "hover:bg-gray-100";
                textColor = "text-gray-700";
                borderHoverColor = "hover:border-gray-300";
                break;
            }
            
            return (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id)}
                className={`flex items-center p-4 rounded-lg border border-gray-200 ${bgColor} ${hoverColor} ${borderHoverColor} transition-all duration-200 text-left group shadow-sm hover:shadow`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} ${textColor} flex items-center justify-center mr-4 group-${hoverColor} transition-colors`}>
                  {getIconByDomain(domain.id)}
                </div>
                <div>
                  <h4 className={`font-semibold text-gray-900 group-hover:${textColor} transition-colors`}>
                    {domain.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}