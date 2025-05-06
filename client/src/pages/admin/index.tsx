import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLocation } from 'wouter';
import { Loader2, LayoutGrid, Users, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isSuperAdmin, logout } = useAdminAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const success = await logout();
      if (success) {
        navigate('/admin/login');
      } else {
        toast({
          title: "Erreur de déconnexion",
          description: "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const adminModules = [
    {
      id: 1,
      title: "Gestion des modules",
      description: "Gérer les modules disponibles dans l'application",
      icon: <LayoutGrid className="h-8 w-8 text-[#006a9e]" />,
      path: "/admin/modules-management",
      requireSuperAdmin: false
    },
    {
      id: 2,
      title: "Accès temporaires",
      description: "Créer et gérer des accès temporaires pour les utilisateurs externes",
      icon: <Users className="h-8 w-8 text-[#006a9e]" />,
      path: "/admin/temporary-access",
      requireSuperAdmin: false
    },
    {
      id: 3,
      title: "Paramètres système",
      description: "Configurer les paramètres globaux de l'application",
      icon: <Settings className="h-8 w-8 text-[#006a9e]" />,
      path: "/admin/system-settings",
      requireSuperAdmin: true
    }
  ];

  // Filtrer les modules selon les droits de l'utilisateur
  const filteredModules = adminModules.filter(module => 
    !module.requireSuperAdmin || isSuperAdmin
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-[#006a9e] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Portail d'administration</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Connecté en tant que: <span className="font-semibold">{user?.username}</span>
              {isSuperAdmin && <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 rounded-full">Super Admin</span>}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white text-white hover:bg-white hover:text-[#006a9e]"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Tableau de bord</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-[#006a9e]">{module.title}</CardTitle>
                  {module.icon}
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-[#006a9e] hover:bg-[#00557e]"
                  onClick={() => navigate(module.path)}
                >
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-4 px-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} mc2i - Portail d'administration</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;