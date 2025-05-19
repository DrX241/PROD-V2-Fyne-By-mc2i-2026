import React from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  FileText,
  Calendar,
  FileQuestion,
  ListChecks,
  GraduationCap,
  Users,
  Briefcase,
  Layers,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageTitle from '@/components/utils/PageTitle';

export default function AmoaAcademie() {
  // Modules de base (fondamentaux de l'AMOA)
  const basicModules = [
    {
      id: 'intro-amoa',
      title: 'Introduction à l\'AMOA',
      description: 'Le rôle et les responsabilités de l\'AMOA dans les projets',
      icon: <BookOpen className="h-5 w-5 text-indigo-300" />,
      duration: '2-3h',
      level: 'débutant',
      comingSoon: true
    },
    {
      id: 'expression-besoins',
      title: 'Expression des besoins',
      description: 'Techniques d\'élicitation et formalisation des besoins métier',
      icon: <FileText className="h-5 w-5 text-indigo-300" />,
      duration: '3-4h',
      level: 'débutant',
      comingSoon: true
    },
    {
      id: 'specifications-fonctionnelles',
      title: 'Spécifications fonctionnelles',
      description: 'Rédaction et structuration des spécifications',
      icon: <FileQuestion className="h-5 w-5 text-indigo-300" />,
      duration: '4-5h',
      level: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'gestion-tests',
      title: 'Gestion des tests',
      description: 'Stratégies et plans de test, recette utilisateurs',
      icon: <ListChecks className="h-5 w-5 text-indigo-300" />,
      duration: '3-4h',
      level: 'intermédiaire',
      comingSoon: true
    }
  ];

  // Modules spécialisés
  const specializedModules = [
    {
      id: 'animation-ateliers',
      title: 'Animation d\'ateliers',
      description: 'Techniques d\'animation et de facilitation de groupes',
      icon: <Users className="h-5 w-5 text-blue-300" />,
      duration: '3-4h',
      level: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'pilotage-projet',
      title: 'Pilotage et suivi de projet',
      description: 'Indicateurs, tableaux de bord et reporting',
      icon: <LineChart className="h-5 w-5 text-blue-300" />,
      duration: '4-6h',
      level: 'avancé',
      comingSoon: true
    },
    {
      id: 'conduite-changement',
      title: 'Conduite du changement',
      description: 'Accompagnement des utilisateurs et gestion de la transformation',
      icon: <Briefcase className="h-5 w-5 text-blue-300" />,
      duration: '5-7h',
      level: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'analyse-processus',
      title: 'Analyse des processus métier',
      description: 'Modélisation et optimisation des processus',
      icon: <Layers className="h-5 w-5 text-blue-300" />,
      duration: '4-6h',
      level: 'intermédiaire',
      comingSoon: true
    }
  ];

  // Parcours d'apprentissage
  const learningPaths = [
    {
      id: 'amoa-fondamental',
      title: 'Parcours AMOA Fondamental',
      description: 'Les compétences essentielles pour débuter en AMOA',
      icon: <Shield className="h-5 w-5 text-green-300" />,
      modules: ['intro-amoa', 'expression-besoins', 'specifications-fonctionnelles', 'gestion-tests'],
      duration: '12-16h',
      level: 'débutant',
      isNew: true,
    },
    {
      id: 'amoa-methodologie',
      title: 'Parcours Méthodologie Projet',
      description: 'Maîtriser les méthodologies de gestion de projet',
      icon: <Calendar className="h-5 w-5 text-green-300" />,
      modules: ['pilotage-projet', 'animation-ateliers', 'conduite-changement'],
      duration: '12-16h',
      level: 'intermédiaire',
      isNew: true,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/amoa/sas-academie">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="MODULES AMOA" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Parcours de formation AMOA</h1>
            <p className="text-indigo-200 mt-1">Développez vos compétences avec des modules structurés</p>
          </div>
        </div>
        
        {/* Présentation simplifiée des ressources */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-950/60 border border-indigo-700 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Shield className="mr-3 h-6 w-6 text-indigo-400" />
                Formation AMOA
              </h2>
              <Badge variant="outline" className="bg-indigo-800/30 border-indigo-600 text-indigo-200 px-3 py-1 text-sm">
                4 modules disponibles
              </Badge>
            </div>
            <p className="text-indigo-200 mb-6">
              Une formation complète et structurée pour maîtriser les fondamentaux de l'AMOA, 
              depuis l'analyse des besoins jusqu'à la recette des applications.
            </p>
            
            {/* Modules de formation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {basicModules.map((module) => (
                <Card key={module.id} className="bg-indigo-900/20 border border-indigo-700 flex flex-col hover:shadow-md hover:border-indigo-500 transition-all">
                  <div className="flex p-4">
                    <div className="p-2 rounded-full bg-indigo-800/50 mr-3 h-10 w-10 flex items-center justify-center">
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{module.title}</h3>
                        <Badge variant="outline" className="bg-indigo-800/30 border-indigo-600 text-indigo-200 ml-2">
                          {module.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-300 mt-1">{module.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto p-2 pl-4">
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto">
                        {module.comingSoon ? 'Bientôt disponible' : 'Accéder au module'} →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          

          

        </div>
      </div>
    </div>
  );
}