
import { useChatContext } from "@/contexts/ChatContext";

export default function DomainSelection() {
  const { domains, selectDomain } = useChatContext();

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto p-4">
      {domains.map((domain) => (
        <div 
          key={domain.id}
          className="selection-card border border-gray-200 rounded-lg p-4 bg-white hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleDomainClick(domain.id)}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className={`w-12 h-12 ${domain.iconBgColor} rounded-full flex items-center justify-center ${domain.iconColor} flex-shrink-0`}
            >
              <i className={`${domain.icon} text-2xl`}></i>
            </div>
            <h3 className="heading font-medium text-neutral-800 flex-grow">{domain.name}</h3>
          </div>
          <p className="text-neutral-600 text-sm">{domain.description}</p>
        </div>
      ))}
    </div>
  );
}
