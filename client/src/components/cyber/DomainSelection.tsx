
import { useChatContext } from "@/contexts/ChatContext";
import { 
  AlertTriangle, FileText, Users, 
  AlertCircle, Link, ShieldCheck
} from "lucide-react";

export default function DomainSelection() {
  const { domains, selectDomain } = useChatContext();

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  // Map des icônes pour chaque domaine spécifique
  const domainIcons: Record<string, React.ReactNode> = {
    "gestion-crise": <AlertTriangle className="w-8 h-8 text-red-500" />,
    "donnees-personnelles": <FileText className="w-8 h-8 text-lime-500" />,
    "ingenierie-sociale": <Users className="w-8 h-8 text-amber-500" />,
    "gestion-incidents": <AlertCircle className="w-8 h-8 text-emerald-500" />,
    "supply-chain": <Link className="w-8 h-8 text-orange-500" />,
    "strategie-cyber": <ShieldCheck className="w-8 h-8 text-pink-500" />,
  };

  // Diviser les domaines en deux rangées
  const firstRow = domains.slice(0, 3);
  const secondRow = domains.slice(3, 6);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Choisissez un domaine de cybersécurité
      </h2>
      
      {/* Première rangée */}
      <div className="domains-row mb-6">
        {firstRow.map((domain: any) => (
          <button
            key={domain.id}
            onClick={() => handleDomainClick(domain.id)}
            className="domain-card focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex flex-col items-center justify-center text-center py-4 h-full">
              <div className="domain-icon-container mb-3">
                {domainIcons[domain.id]}
              </div>
              <div className="w-full">
                <h3 className="font-bold text-lg md:text-xl text-gray-800 domain-title">{domain.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Seconde rangée */}
      <div className="domains-row">
        {secondRow.map((domain: any) => (
          <button
            key={domain.id}
            onClick={() => handleDomainClick(domain.id)}
            className="domain-card focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex flex-col items-center justify-center text-center py-4 h-full">
              <div className="domain-icon-container mb-3">
                {domainIcons[domain.id]}
              </div>
              <div className="w-full">
                <h3 className="font-bold text-lg md:text-xl text-gray-800 domain-title">{domain.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
