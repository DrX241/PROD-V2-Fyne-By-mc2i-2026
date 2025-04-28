import React from 'react';
import { USER_ROLES } from '@shared/types/cyber';
import { Shield, Monitor, Code, Server, Users, User } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (roleId: string) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  // Fonction pour obtenir l'icône en fonction du rôle
  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'rssi':
        return <Shield className="w-8 h-8 mb-3 text-blue-500" />;
      case 'dsi':
        return <Monitor className="w-8 h-8 mb-3 text-indigo-500" />;
      case 'developpeur':
        return <Code className="w-8 h-8 mb-3 text-green-500" />;
      case 'admin':
        return <Server className="w-8 h-8 mb-3 text-purple-500" />;
      case 'consultant':
        return <Users className="w-8 h-8 mb-3 text-orange-500" />;
      default:
        return <User className="w-8 h-8 mb-3 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shadow-md p-6 animate-fadeIn">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Quel rôle souhaitez-vous incarner ?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choisissez un rôle pour personnaliser votre expérience d'apprentissage
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {USER_ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getRoleIcon(role.id)}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">{role.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}