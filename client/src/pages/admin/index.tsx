import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { 
  UsersRound, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  KeyRound, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

// Définition des cartes de module
const moduleCards = [
  {
    title: 'Gestion des accès temporaires',
    description: 'Créez et gérez des accès temporaires aux modules de la plateforme.',
    icon: <KeyRound className="h-8 w-8 text-[#006a9e]" />,
    path: '/admin/temporary-access',
    requireSuperAdmin: false
  },
  {
    title: 'Configuration des modules',
    description: 'Configurez les modules disponibles dans la plateforme.',
    icon: <LayoutDashboard className="h-8 w-8 text-[#006a9e]" />,
    path: '/admin/modules-management',
    requireSuperAdmin: false
  },
  {
    title: 'Gestion des utilisateurs',
    description: 'Gérez les comptes utilisateurs et leurs droits d\'accès.',
    icon: <UsersRound className="h-8 w-8 text-[#006a9e]" />,
    path: '/admin/users',
    requireSuperAdmin: true
  },
  {
    title: 'Paramètres système',
    description: 'Configurez les paramètres avancés du système.',
    icon: <Settings className="h-8 w-8 text-[#006a9e]" />,
    path: '/admin/system-settings',
    requireSuperAdmin: true
  },
  {
    title: 'Journaux d\'activité',
    description: 'Consultez les journaux d\'activité de la plateforme.',
    icon: <FileText className="h-8 w-8 text-[#006a9e]" />,
    path: '/admin/activity-logs',
    requireSuperAdmin: true
  }
];

const AdminDashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isSuperAdmin, logout } = useAdminAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fonction de déconnexion
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const success = await logout();
      if (success) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filtrer les modules en fonction des droits de l'utilisateur
  const filteredModules = moduleCards.filter(module => 
    !module.requireSuperAdmin || (module.requireSuperAdmin && isSuperAdmin)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-[#006a9e] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LayoutDashboard className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Administration mc2i</h1>
              <p className="text-sm opacity-80">Bienvenue, {user?.username}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-[#006a9e]"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'} <LogOut className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Tableau de bord administrateur</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'Vous avez accès à toutes les fonctionnalités d\'administration en tant que super administrateur.' 
              : 'Gérez les accès et les modules de la plateforme.'}
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    {module.icon}
                  </div>
                  {module.requireSuperAdmin && (
                    <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full">
                      Super Admin
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-[#006a9e] hover:bg-[#00557e] mt-2"
                  onClick={() => navigate(module.path)}
                >
                  Accéder <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto p-6 text-center text-sm text-muted-foreground mt-auto">
        <p>© {new Date().getFullYear()} mc2i. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;