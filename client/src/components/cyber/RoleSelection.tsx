import React, { useState } from 'react';
import { USER_ROLES, UserRole } from '@shared/types/cyber';
import { Shield, Code, Server, Users, Terminal, Lock } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (roleId: string) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([...USER_ROLES, {
    id: "architecte",
    name: "Architecte Sécurité",
    description: "Expert en conception de solutions de sécurité robustes et évolutives",
    available: true
  }]);
  
  // Fonction pour marquer un rôle comme indisponible après sélection
  const handleRoleSelection = (roleId: string) => {
    // Vérifier que le rôle est disponible
    const role = availableRoles.find(r => r.id === roleId);
    if (!role || role.available === false) return;
    
    // Marquer le rôle comme indisponible
    setAvailableRoles(prev => 
      prev.map(r => 
        r.id === roleId ? { ...r, available: false } : r
      )
    );
    
    // Appeler la fonction de sélection de rôle
    onSelectRole(roleId);
  };

  // Map des icônes et styles pour chaque rôle spécifique
  const roleConfig: Record<string, {
    icon: React.ReactNode,
    bgGradient: string,
    borderColor: string,
    glowColor: string,
    shadowColor: string
  }> = {
    "rssi": {
      icon: <Shield className="w-10 h-10 text-[#8bbdd0]" />,
      bgGradient: "from-[#006a9e]/50 via-[#006a9e]/30 to-[#006a9e]/50",
      borderColor: "border-[#006a9e]/30",
      glowColor: "text-[#8bbdd0]",
      shadowColor: "shadow-[#006a9e]/10"
    },
    "hacker": {
      icon: <Terminal className="w-10 h-10 text-amber-300" />,
      bgGradient: "from-amber-900/50 via-amber-800/30 to-amber-900/50",
      borderColor: "border-amber-700/30",
      glowColor: "text-amber-200",
      shadowColor: "shadow-amber-500/10"
    },
    "developpeur": {
      icon: <Code className="w-10 h-10 text-sky-300" />,
      bgGradient: "from-sky-900/50 via-sky-800/30 to-sky-900/50",
      borderColor: "border-sky-700/30",
      glowColor: "text-sky-200",
      shadowColor: "shadow-sky-500/10"
    },
    "admin": {
      icon: <Server className="w-10 h-10 text-orange-300" />,
      bgGradient: "from-orange-900/50 via-orange-800/30 to-orange-900/50",
      borderColor: "border-orange-700/30",
      glowColor: "text-orange-200",
      shadowColor: "shadow-orange-500/10"
    },
    "consultant": {
      icon: <Users className="w-10 h-10 text-violet-300" />,
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
          Sélection de Rôle Cyber
        </h2>
        <p className="text-blue-300 max-w-3xl mx-auto text-xs sm:text-sm">
          Choisissez votre rôle professionnel pour personnaliser votre expérience d'apprentissage
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-2 sm:mt-3 overflow-visible">
        {availableRoles.map((role) => {
          const config = roleConfig[role.id] || {
            icon: <Lock className="w-6 h-6 sm:w-10 sm:h-10 text-blue-300" />,
            bgGradient: "from-blue-900/50 via-blue-800/30 to-blue-900/50",
            borderColor: "border-blue-700/30",
            glowColor: "text-blue-200",
            shadowColor: "shadow-blue-500/10"
          };
          
          const isHovered = hoveredRole === role.id;
          const isAvailable = role.available !== false;
          
          return (
            <button
              key={role.id}
              onClick={() => isAvailable && handleRoleSelection(role.id)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`group relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border ${config.borderColor} 
                rounded-xl overflow-hidden shadow-lg ${config.shadowColor} 
                transition-all duration-500 flex flex-col items-center text-center p-2 sm:p-3 min-h-[100px] sm:min-h-[140px] justify-between
                ${!isAvailable ? 
                  'opacity-40 cursor-not-allowed' : 
                  'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {/* Background glow effect */}
              {isAvailable && (
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              )}
              
              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gray-900/50 border ${config.borderColor} 
                flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-500
                shadow-glow-md`}>
                {React.cloneElement(config.icon as React.ReactElement, { 
                  className: `w-5 h-5 sm:w-8 sm:h-8 ${(config.icon as React.ReactElement).props.className.split(' ').filter((c: string) => c.includes('text-')).join(' ')}` 
                })}
                
                {/* Pulsing ring effect on hover */}
                {isHovered && isAvailable && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping"></div>
                )}
              </div>
              
              {/* Role name */}
              <div className="relative z-10 w-full">
                <h3 className={`font-bold text-sm sm:text-lg ${config.glowColor} h-auto flex items-center justify-center leading-snug px-1`}>
                  {role.name}
                </h3>
                
                {/* Description on hover - visible by default on mobile */}
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-200/80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 sm:h-0 sm:group-hover:h-auto overflow-hidden">
                  {!isAvailable ? 
                    'Ce rôle a déjà été sélectionné et n\'est plus disponible' : 
                    role.description
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