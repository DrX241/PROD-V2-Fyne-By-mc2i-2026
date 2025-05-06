import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Settings,
  Package2,
  Users,
  BarChart4,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const { isAuthenticated, isSuperAdmin, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return null;
  }

  // Liens de navigation
  const navigationLinks = [
    {
      name: 'Tableau de bord',
      href: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: location === '/admin'
    },
    {
      name: 'Gestion des modules',
      href: '/admin/modules-management',
      icon: <Package2 className="w-5 h-5" />,
      active: location === '/admin/modules-management',
      superAdminOnly: true
    },
    {
      name: 'Accès temporaires',
      href: '/admin/temporary-access',
      icon: <Users className="w-5 h-5" />,
      active: location === '/admin/temporary-access'
    },
    {
      name: 'Statistiques',
      href: '/admin/analytics',
      icon: <BarChart4 className="w-5 h-5" />,
      active: location === '/admin/analytics',
      superAdminOnly: true
    },
    {
      name: 'Paramètres',
      href: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      active: location === '/admin/settings',
      superAdminOnly: true
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}
          </p>
        </div>
        
        <nav className="mt-2">
          <ul>
            {navigationLinks.map((link, index) => {
              // Si le lien est réservé aux super admins et l'utilisateur n'est pas super admin, ne pas afficher
              if (link.superAdminOnly && !isSuperAdmin) {
                return null;
              }
              
              return (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={`flex items-center px-6 py-3 text-sm ${
                      link.active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.name}</span>
                    {link.active && <ChevronRight className="ml-auto w-4 h-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};