import React from 'react';
import { 
  Shield, Search, BarChart, Bell, ClipboardCheck, Brain,
  Binoculars, Globe, ArrowUpCircle, Network, Users, FileText,
  Target, AlertTriangle, FileCheck, Cloud, PresentationChart,
  Cpu, HardDrive, Bug, Wifi, Link, Clock, Divide, Eye, Lock,
  Radio, Filter, Command, Flame, Tool
} from 'lucide-react';
import { RoleModule } from '@shared/types/roles';

interface ModuleSelectionProps {
  modules: RoleModule[];
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
}

const ModuleSelection: React.FC<ModuleSelectionProps> = ({ 
  modules, 
  selectedModuleId, 
  onSelectModule 
}) => {
  // Fonction pour obtenir l'icône appropriée pour chaque module
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'Search': return <Search className="h-5 w-5 text-yellow-500" />;
      case 'BarChart': return <BarChart className="h-5 w-5 text-indigo-500" />;
      case 'Bell': return <Bell className="h-5 w-5 text-red-500" />;
      case 'ClipboardCheck': return <ClipboardCheck className="h-5 w-5 text-green-500" />;
      case 'Brain': return <Brain className="h-5 w-5 text-purple-500" />;
      case 'Binoculars': return <Binoculars className="h-5 w-5 text-cyan-500" />;
      case 'Globe': return <Globe className="h-5 w-5 text-blue-400" />;
      case 'ArrowUpCircle': return <ArrowUpCircle className="h-5 w-5 text-orange-500" />;
      case 'Network': return <Network className="h-5 w-5 text-teal-500" />;
      case 'Users': return <Users className="h-5 w-5 text-pink-500" />;
      case 'FileText': return <FileText className="h-5 w-5 text-gray-500" />;
      case 'Target': return <Target className="h-5 w-5 text-red-600" />;
      case 'AlertTriangle': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'FileCheck': return <FileCheck className="h-5 w-5 text-green-600" />;
      case 'Cloud': return <Cloud className="h-5 w-5 text-sky-500" />;
      case 'PresentationChart': return <PresentationChart className="h-5 w-5 text-violet-500" />;
      case 'Cpu': return <Cpu className="h-5 w-5 text-rose-500" />;
      case 'HardDrive': return <HardDrive className="h-5 w-5 text-slate-600" />;
      case 'Bug': return <Bug className="h-5 w-5 text-red-500" />;
      case 'Wifi': return <Wifi className="h-5 w-5 text-cyan-400" />;
      case 'Link': return <Link className="h-5 w-5 text-blue-500" />;
      case 'Clock': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'Divide': return <Divide className="h-5 w-5 text-blue-600" />;
      case 'Eye': return <Eye className="h-5 w-5 text-indigo-600" />;
      case 'Lock': return <Lock className="h-5 w-5 text-gray-600" />;
      case 'Radio': return <Radio className="h-5 w-5 text-fuchsia-500" />;
      case 'Filter': return <Filter className="h-5 w-5 text-emerald-500" />;
      case 'Command': return <Command className="h-5 w-5 text-gray-800" />;
      case 'Flame': return <Flame className="h-5 w-5 text-orange-600" />;
      case 'Tool': return <Tool className="h-5 w-5 text-zinc-600" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de badge de difficulté
  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'avancé':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sélectionnez un module</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedModuleId === module.id
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700 dark:hover:bg-blue-900/10'
            }`}
            onClick={() => onSelectModule(module.id)}
          >
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                {getModuleIcon(module.icon)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{module.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5 flex-wrap">
                    {module.skills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {module.duration}
                  </span>
                </div>
              </div>
            </div>
            
            {selectedModuleId === module.id && (
              <div className="mt-3 pt-2 border-t border-blue-100 dark:border-blue-800/30 text-sm text-blue-600 dark:text-blue-400 flex justify-end">
                <span>✓ Sélectionné</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelection;