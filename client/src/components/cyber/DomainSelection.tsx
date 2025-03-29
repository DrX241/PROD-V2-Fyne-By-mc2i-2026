import { useChatContext } from "@/contexts/ChatContext";

export default function DomainSelection() {
  const { domains, selectDomain } = useChatContext();

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 my-4">
      {domains.map((domain) => (
        <div 
          key={domain.id}
          className="selection-card border border-gray-200 rounded-lg p-4 flex-1 bg-white hover:border-primary-300"
          onClick={() => handleDomainClick(domain.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="heading font-medium text-neutral-800">{domain.name}</h3>
            <div 
              className={`w-10 h-10 ${domain.iconBgColor} rounded-full flex items-center justify-center ${domain.iconColor}`}
            >
              <i className={`${domain.icon} text-xl`}></i>
            </div>
          </div>
          <p className="text-neutral-600 text-sm">{domain.description}</p>
        </div>
      ))}
    </div>
  );
}
