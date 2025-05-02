import React from 'react';
import { Shield, Activity, Crosshair, Microscope, Network, Search } from 'lucide-react';
import { CyberRoleInfo } from '@shared/types/roles';

interface RoleSelectionProps {
  roles: CyberRoleInfo[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ roles, selectedRoleId, onSelectRole }) => {
  // Fonction pour obtenir l'icône appropriée pour chaque rôle
  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="h-6 w-6 text-blue-500" />;
      case 'Activity':
        return <Activity className="h-6 w-6 text-green-500" />;
      case 'Crosshair':
        return <Crosshair className="h-6 w-6 text-red-500" />;
      case 'Microscope':
        return <Microscope className="h-6 w-6 text-purple-500" />;
      case 'Network':
        return <Network className="h-6 w-6 text-cyan-500" />;
      case 'Search':
        return <Search className="h-6 w-6 text-yellow-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Choisissez votre rôle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRoleId === role.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
            onClick={() => onSelectRole(role.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                {getRoleIcon(role.icon)}
              </div>
              <div>
                <h3 className="font-medium">{role.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {role.description}
                </p>
              </div>
            </div>
            
            {selectedRoleId === role.id && (
              <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center justify-end">
                <span>✓ Sélectionné</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;