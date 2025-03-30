import { useChatContext } from "@/contexts/ChatContext";

export default function DomainSelection() {
  const { domains } = useChatContext();

  const selectDomain = (domainId: string) => {
    //Implementation to handle domain selection.  This needs to be defined based on the application's logic
    console.log("Selected domain:", domainId);
  };

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-2">
        {domains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => handleDomainClick(domain.id)}
            className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${domain.iconBgColor} rounded-full flex items-center justify-center ${domain.iconColor}`}>
                <i className={`${domain.icon} text-lg`}></i>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 group-hover:text-primary-600">{domain.name}</h3>
                <p className="text-sm text-neutral-600">{domain.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}