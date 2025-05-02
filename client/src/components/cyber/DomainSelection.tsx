import React, { useState, useMemo } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { 
  AlertTriangle, FileText, Users, 
  AlertCircle, Link, ShieldCheck,
  Shield, FileKey, UserCheck, 
  Binary, Lock, Fingerprint
} from "lucide-react";

export default function DomainSelection() {
  const { domains, scenario, selectDomain, userRole } = useChatContext();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  
  // Vérifier si une session (avec un scénario actif) est déjà en cours
  const sessionInProgress = scenario.activeScenario !== null;

  // Filtrer les domaines en fonction du rôle sélectionné
  const filteredDomains = useMemo(() => {
    if (!userRole) return domains; // Si aucun rôle n'est sélectionné, montrer tous les domaines
    
    return domains.filter(domain => 
      domain.applicableRoles?.includes(userRole)
    );
  }, [domains, userRole]);

  const handleDomainClick = (domainId: string) => {
    // Si une session est en cours, ne pas permettre de changer de domaine
    if (sessionInProgress) {
      return;
    }
    
    // Trouver le domaine complet pour le passer à la fonction selectDomain
    const domain = domains.find(d => d.id === domainId);
    if (domain) {
      console.log("Sélection du domaine:", domain);
      selectDomain(domain);
    } else {
      console.error("Domaine non trouvé:", domainId);
    }
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
      icon: <AlertTriangle className="w-10 h-10 text-[#8bbdd0]" />,
      bgGradient: "from-[#006a9e]/50 via-[#006a9e]/30 to-[#006a9e]/50",
      borderColor: "border-[#006a9e]/30",
      glowColor: "text-[#8bbdd0]",
      shadowColor: "shadow-[#006a9e]/10"
    },
    "donnees-personnelles": {
      icon: <FileKey className="w-10 h-10 text-[#8bbdd0]" />,
      bgGradient: "from-[#006a9e]/50 via-[#006a9e]/30 to-[#006a9e]/50",
      borderColor: "border-[#006a9e]/30",
      glowColor: "text-[#8bbdd0]",
      shadowColor: "shadow-[#006a9e]/10"
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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-blue-50 mb-1 sm:mb-2">
          Modules d'Excellence Cyber
        </h2>
        <p className="text-blue-300 max-w-3xl mx-auto text-xs sm:text-sm">
          Sélectionnez un domaine pour améliorer vos compétences avec des scénarios adaptés.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-2 sm:mt-3 overflow-visible">
        {filteredDomains.map((domain: any) => {
          const config = domainConfig[domain.id] || {
            icon: <Lock className="w-5 h-5 sm:w-7 sm:h-7 text-blue-300" />,
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
                rounded-lg overflow-hidden shadow-md ${config.shadowColor} 
                transition-all duration-500 flex flex-col items-center text-center p-2 min-h-[100px] sm:min-h-[120px] justify-between
                ${scenario.activeScenario !== null ? 
                  'opacity-40 cursor-not-allowed' : 
                  'hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]'
                }`}
            >
              {/* Background glow effect */}
              {scenario.activeScenario === null && (
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              )}
              
              {/* Icon */}
              <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900/50 border ${config.borderColor} 
                flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-500
                shadow-glow-sm`}>
                {React.cloneElement(config.icon as React.ReactElement, { 
                  className: `w-4 h-4 sm:w-5 sm:h-5 ${(config.icon as React.ReactElement).props.className.split(' ').filter((c: string) => c.includes('text-')).join(' ')}` 
                })}
                
                {/* Pulsing ring effect on hover */}
                {isHovered && scenario.activeScenario === null && (
                  <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping"></div>
                )}
              </div>
              
              {/* Domain name */}
              <div className="relative z-10 w-full">
                <h3 className={`font-bold text-xs sm:text-sm ${config.glowColor} h-auto flex items-center justify-center leading-snug px-1`}>
                  {domain.name}
                </h3>
                
                {/* Description on hover - visible by default on mobile */}
                <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-blue-200/80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 sm:h-0 sm:group-hover:h-auto overflow-hidden">
                  {scenario.activeScenario !== null ? 
                    'Indisponible - Cliquez sur "Nouvelle session" pour changer de module' : 
                    'Explorez les scénarios dans ce domaine'
                  }
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}