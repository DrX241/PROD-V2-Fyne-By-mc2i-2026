import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Briefcase, Buildings, Building2, Lightbulb, Landmark, Factory, FileBadge2 } from "lucide-react";

export default function AmoaDomainSelection() {
  const { domains, onDomainSelect } = useChatContext();

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
        return <Buildings className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-8">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Briefcase className="inline-block mr-2 h-5 w-5 text-blue-600" />
          <span>Sélectionnez un domaine métier</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => onDomainSelect(domain)}
              className="flex items-center p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-left group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                {getIconByDomain(domain.id)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {domain.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}