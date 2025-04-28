import React from 'react';
import { useCyberCrisisContext } from '../CyberCrisisContext';
import userRoles from '../UserRoles';
import { CheckCircle, Shield, Server, FileText, MessageSquare, AlertTriangle, Briefcase, Key } from 'lucide-react';

// Mapping des icônes
const roleIcons = {
  'shield-lock': <Shield className="h-8 w-8 mb-2" />,
  'server': <Server className="h-8 w-8 mb-2" />,
  'file-text': <FileText className="h-8 w-8 mb-2" />,
  'message-square': <MessageSquare className="h-8 w-8 mb-2" />,
  'alert-triangle': <AlertTriangle className="h-8 w-8 mb-2" />,
  'briefcase': <Briefcase className="h-8 w-8 mb-2" />,
  'key': <Key className="h-8 w-8 mb-2" />
};

const difficultyColors = {
  'débutant': 'bg-green-100 text-green-800',
  'intermédiaire': 'bg-yellow-100 text-yellow-800',
  'expert': 'bg-red-100 text-red-800'
};

const RoleSelector: React.FC = () => {
  const { state, selectRole } = useCyberCrisisContext();
  
  const handleRoleSelect = (roleId: string) => {
    selectRole(roleId);
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Choisissez votre rôle
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(userRoles).map(role => (
          <div
            key={role.id}
            className={`
              p-4 rounded-lg cursor-pointer transition-all 
              border-2 hover:shadow-md
              ${state.userRole?.id === role.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                : 'border-gray-200 bg-white dark:bg-gray-800 hover:border-blue-300'}
            `}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {role.icon && roleIcons[role.icon as keyof typeof roleIcons]}
              </div>
              <div className={`text-xs px-2 py-1 rounded ${difficultyColors[role.difficulty]}`}>
                {role.difficulty}
              </div>
              {state.userRole?.id === role.id && (
                <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
              )}
            </div>
            
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{role.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{role.description}</p>
            
            <div className="mt-3">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Responsabilités :</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4 space-y-1">
                {role.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;