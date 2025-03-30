import { useChatContext } from "@/contexts/ChatContext";
import { 
  AlertTriangle, FileText, Users, 
  AlertCircle, Link, ShieldCheck,
  Shield, FileKey, UserCheck, 
  Binary, Lock, Fingerprint
} from "lucide-react";
import { useState } from "react";

export default function DomainSelection() {
  const { domains, selectDomain } = useChatContext();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const handleDomainClick = (domainId: string) => {
    selectDomain(domainId);
  };

  // Map des icônes et styles pour chaque domaine spécifique
  const domainConfig: Record<string, {
    icon: React.ReactNode,
    bgGradient: string,
    borderColor: string,
    glowColor: string,
    shadowColor: string
  }> = {
    "gestion-crise": {
      icon: <AlertTriangle className="w-10 h-10 text-red-300" />,
      bgGradient: "from-red-900/50 via-red-800/30 to-red-900/50",
      borderColor: "border-red-700/30",
      glowColor: "text-red-200",
      shadowColor: "shadow-red-500/10"
    },
    "donnees-personnelles": {
      icon: <FileKey className="w-10 h-10 text-emerald-300" />,
      bgGradient: "from-emerald-900/50 via-emerald-800/30 to-emerald-900/50",
      borderColor: "border-emerald-700/30",
      glowColor: "text-emerald-200",
      shadowColor: "shadow-emerald-500/10"
    },
    "ingenierie-sociale": {
      icon: <UserCheck className="w-10 h-10 text-amber-300" />,
      bgGradient: "from-amber-900/50 via-amber-800/30 to-amber-900/50",
      borderColor: "border-amber-700/30",
      glowColor: "text-amber-200",
      shadowColor: "shadow-amber-500/10"
    },
    "gestion-incidents": {
      icon: <AlertCircle className="w-10 h-10 text-sky-300" />,
      bgGradient: "from-sky-900/50 via-sky-800/30 to-sky-900/50",
      borderColor: "border-sky-700/30",
      glowColor: "text-sky-200",
      shadowColor: "shadow-sky-500/10"
    },
    "supply-chain": {
      icon: <Link className="w-10 h-10 text-orange-300" />,
      bgGradient: "from-orange-900/50 via-orange-800/30 to-orange-900/50",
      borderColor: "border-orange-700/30",
      glowColor: "text-orange-200",
      shadowColor: "shadow-orange-500/10"
    },
    "strategie-cyber": {
      icon: <Shield className="w-10 h-10 text-violet-300" />,
      bgGradient: "from-violet-900/50 via-violet-800/30 to-violet-900/50",
      borderColor: "border-violet-700/30",
      glowColor: "text-violet-200",
      shadowColor: "shadow-violet-500/10"
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-150px)]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-blue-50 mb-3">
          Choisissez un domaine de cybersécurité
        </h2>
        <p className="text-blue-300 max-w-3xl mx-auto">
          Sélectionnez le domaine dans lequel vous souhaitez améliorer vos compétences. 
          Chaque domaine propose des scénarios adaptés à différents niveaux d'expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 overflow-y-auto scrollbar-cyber max-h-[calc(100vh-300px)]">
        {domains.map((domain: any) => {
          const config = domainConfig[domain.id] || {
            icon: <Lock className="w-10 h-10 text-blue-300" />,
            bgGradient: "from-blue-900/50 via-blue-800/30 to-blue-900/50",
            borderColor: "border-blue-700/30",
            glowColor: "text-blue-200",
            shadowColor: "shadow-blue-500/10"
          };
          
          const isHovered = hoveredDomain === domain.id;
          
          return (
            <button
              key={domain.id}
              onClick={() => handleDomainClick(domain.id)}
              onMouseEnter={() => setHoveredDomain(domain.id)}
              onMouseLeave={() => setHoveredDomain(null)}
              className={`group relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border ${config.borderColor} 
                rounded-xl overflow-hidden shadow-lg ${config.shadowColor} hover:shadow-xl 
                transition-all duration-500 flex flex-col items-center text-center p-6 min-h-[220px] justify-between
                hover:-translate-y-1 hover:scale-[1.02]`}
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`relative z-10 w-20 h-20 rounded-full bg-gray-900/50 border ${config.borderColor} 
                flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500
                shadow-glow-md`}>
                {config.icon}
                
                {/* Pulsing ring effect on hover */}
                {isHovered && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping"></div>
                )}
              </div>
              
              {/* Domain name */}
              <div className="relative z-10 w-full">
                <h3 className={`font-bold text-xl ${config.glowColor} h-auto flex items-center justify-center leading-snug px-2`}>
                  {domain.name}
                </h3>
                
                {/* Description on hover */}
                <p className="mt-2 text-sm text-blue-200/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-0 group-hover:h-auto overflow-hidden">
                  Explorez les scénarios dans le domaine de {domain.name.toLowerCase()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}