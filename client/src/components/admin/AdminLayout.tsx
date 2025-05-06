import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  LayoutGrid, 
  Users, 
  LogOut, 
  Home, 
  BarChart3 
} from "lucide-react";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, isSuperAdmin } = useAdminAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-blue-600">Administration</h2>
            <p className="text-sm text-gray-500 mt-1">Panneau de gestion</p>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Link href="/admin">
                  <a className={`flex items-center px-4 py-2 rounded-md ${location === '/admin' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Home className="mr-3 h-5 w-5" />
                    <span>Tableau de bord</span>
                  </a>
                </Link>
              </li>
              
              <li>
                <Link href="/admin/modules-management">
                  <a className={`flex items-center px-4 py-2 rounded-md ${location === '/admin/modules-management' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <LayoutGrid className="mr-3 h-5 w-5" />
                    <span>Gestion des modules</span>
                  </a>
                </Link>
              </li>
              
              <li>
                <Link href="/admin/temporary-access">
                  <a className={`flex items-center px-4 py-2 rounded-md ${location === '/admin/temporary-access' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Users className="mr-3 h-5 w-5" />
                    <span>Accès temporaires</span>
                  </a>
                </Link>
              </li>
              
              {isSuperAdmin && (
                <li>
                  <Link href="/admin/analytics">
                    <a className={`flex items-center px-4 py-2 rounded-md ${location === '/admin/analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <BarChart3 className="mr-3 h-5 w-5" />
                      <span>Analytique</span>
                    </a>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="p-4 border-t mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Déconnexion</span>
            </button>
            
            <div className="mt-4 text-xs text-center text-gray-500">
              <p>Connecté en tant que {isSuperAdmin ? 'super administrateur' : 'administrateur'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};