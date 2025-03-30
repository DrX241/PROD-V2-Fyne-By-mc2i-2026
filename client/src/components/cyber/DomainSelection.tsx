
import { useChatContext } from "@/contexts/ChatContext";
import { ShieldAlert, Binary, Network, FileCode, ServerCog, Lock, Globe, BrainCog, Database, Search, Shield, Fingerprint } from "lucide-react";

export default function DomainSelection() {
  const { domains, selectDomain } = useChatContext();

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  // Map pour associer les icons Lucide aux domaines
  const domainIcons: Record<string, React.ReactNode> = {
    "shield": <ShieldAlert className="w-5 h-5" />,
    "binary": <Binary className="w-5 h-5" />,
    "network": <Network className="w-5 h-5" />,
    "code": <FileCode className="w-5 h-5" />,
    "server": <ServerCog className="w-5 h-5" />,
    "lock": <Lock className="w-5 h-5" />,
    "globe": <Globe className="w-5 h-5" />,
    "brain": <BrainCog className="w-5 h-5" />,
    "database": <Database className="w-5 h-5" />,
    "search": <Search className="w-5 h-5" />,
    "shield-check": <Shield className="w-5 h-5" />,
    "fingerprint": <Fingerprint className="w-5 h-5" />,
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Choisissez un domaine de cybersécurité</h2>
      
      <div className="domain-grid">
        {domains.map((domain: any) => {
          // Extraire le nom de l'icône à partir de la classe CSS (supposant que domain.icon contient "fa-shield" ou similaire)
          const iconKey = domain.icon.replace(/fa-/g, "");
          const icon = domainIcons[iconKey] || <ShieldAlert className="w-5 h-5" />;
          
          return (
            <button
              key={domain.id}
              onClick={() => handleDomainClick(domain.id)}
              className="domain-card focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{domain.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{domain.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
