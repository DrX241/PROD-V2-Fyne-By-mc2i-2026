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

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Choisissez un domaine de cybersécurité
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto max-h-[70vh]"> {/* Added overflow-y-auto and max-height */}
        {domains.map((domain: any) => (
          <button
            key={domain.id}
            onClick={() => handleDomainClick(domain.id)}
            className="domain-card p-4 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-all duration-200 flex flex-col items-center text-center min-h-[150px] justify-center"  {/* Adjusted padding and added min-height */}
          >
            <div className="domain-icon-container mb-3">
              {domainIcons[domain.id]}
            </div>
            <div className="w-full">
              <h3 className="font-bold text-lg md:text-xl text-gray-800 domain-title">{domain.name}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}