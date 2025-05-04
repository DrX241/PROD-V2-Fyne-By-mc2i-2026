import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  GitMergeIcon,
  ListIcon,
  ClipboardListIcon,
  UserCogIcon,
  ShieldIcon,
  ActivityIcon,
  Cog,
  ArrowRightIcon,
  BarChart2Icon,
  DatabaseIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import { useTheme } from '@/components/theme-provider';

export default function AdminDashboardPage() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  // Requête pour obtenir des statistiques rapides
  const { data: stats, isLoading } = useQuery({
    queryKey: ['assistantStats'],
    queryFn: async () => {
      try {
        // Récupérer les doublons pour avoir un aperçu
        const duplicatesResponse = await axios.get('/api/assistants/duplicates/detect');
        
        // Récupérer la liste des modèles
        const templatesResponse = await axios.get('/api/assistants/templates');
        
        return {
          duplicates: duplicatesResponse.data.totalDuplicates || 0,
          duplicateGroups: duplicatesResponse.data.duplicateGroups?.length || 0,
          templates: templatesResponse.data.templates?.length || 0
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return {
          duplicates: 0,
          duplicateGroups: 0,
          templates: 0
        };
      }
    }
  });

  const adminModules = [
    {
      title: "Gestion des doublons",
      description: "Détectez et fusionnez les modèles d'assistants similaires pour éviter les redondances",
      icon: <GitMergeIcon className="h-8 w-8 text-violet-500" />,
      path: "/outils-ia/admin/duplicates",
      stats: stats ? `${stats.duplicates} doublons dans ${stats.duplicateGroups} groupes` : "Chargement...",
      status: stats?.duplicates > 0 ? "attention" : "ok"
    },
    {
      title: "Modèles d'assistants",
      description: "Gérez les modèles prédéfinis d'assistants disponibles pour les utilisateurs",
      icon: <ListIcon className="h-8 w-8 text-blue-500" />,
      path: "/outils-ia/admin/templates",
      stats: stats ? `${stats.templates} modèles` : "Chargement...",
      status: "ok"
    },
    {
      title: "Statistiques API",
      description: "Analysez l'utilisation de l'API, gérez le cache et les limitations de débit",
      icon: <BarChart2Icon className="h-8 w-8 text-emerald-500" />,
      path: "/outils-ia/admin/cache-stats",
      stats: "Nouveau",
      status: "ok"
    },
    {
      title: "Journaux d'activité",
      description: "Consultez les logs d'activité des assistants et des utilisateurs",
      icon: <ActivityIcon className="h-8 w-8 text-green-500" />,
      path: "/outils-ia/admin/logs",
      stats: "Disponible",
      status: "ok"
    },
    {
      title: "Gestion des utilisateurs",
      description: "Gérez les comptes utilisateurs et leurs autorisations",
      icon: <UserCogIcon className="h-8 w-8 text-orange-500" />,
      path: "/outils-ia/admin/users",
      stats: "En développement",
      status: "pending"
    },
    {
      title: "Modération de contenu",
      description: "Filtrez et modérez le contenu des prompts et des conversations",
      icon: <ShieldIcon className="h-8 w-8 text-red-500" />,
      path: "/outils-ia/admin/moderation",
      stats: "En développement",
      status: "pending"
    },
    {
      title: "Configuration générale",
      description: "Paramètres généraux de la plateforme",
      icon: <Cog className="h-8 w-8 text-gray-500" />,
      path: "/outils-ia/admin/settings",
      stats: "En développement",
      status: "pending"
    }
  ];

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Administration des assistants IA" 
          description="Gérez les modèles d'assistants, les doublons et les paramètres de la plateforme"
          icon={<ClipboardListIcon className="h-6 w-6 text-violet-500" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module, index) => (
            <Card key={index} className={`transition-all duration-200 hover:shadow-md ${
              isFuturistic ? 'bg-gray-800 border-gray-700' : ''
            } ${module.status === 'pending' ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  {module.icon}
                  <Badge 
                    variant={
                      module.status === 'ok' ? 'default' : 
                      module.status === 'attention' ? 'outline' : 
                      'secondary'
                    }
                    className={
                      module.status === 'pending' ? 'bg-gray-200 text-gray-700' :
                      module.status === 'attention' ? 'bg-yellow-100 text-yellow-800' : 
                      ''
                    }
                  >
                    {module.stats}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  asChild 
                  className="w-full gap-2" 
                  variant={module.status === 'pending' ? 'outline' : 'default'}
                  disabled={module.status === 'pending'}
                >
                  <Link href={module.path}>
                    Accéder
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          <h3 className="text-lg font-medium mb-2">Gestion recommandée</h3>
          <p className="text-sm">
            Commencez par vérifier et fusionner les modèles d'assistants dupliqués pour optimiser la base de données et améliorer l'expérience utilisateur.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline" className="border-blue-300 hover:bg-blue-100">
              <Link href="/outils-ia/admin/duplicates">
                Vérifier les doublons
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}