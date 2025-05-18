import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, BarChart3, FileSearch, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function Mc2iLab() {
  const [, navigate] = useLocation();

  const modules = [
    {
      id: 'benchmark-studio',
      title: 'Benchmark Studio',
      description: 'Outil de comparaison visuelle et d\'analyse des solutions logicielles par secteur',
      icon: <Target className="h-10 w-10 text-indigo-300" />,
      status: 'coming-soon',
      gradient: 'from-indigo-600 to-indigo-900',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
      textColor: 'text-indigo-300',
      features: [
        'Création de grilles d\'évaluation personnalisées',
        'Analyse des forces et faiblesses des solutions du marché',
        'Génération de rapports de positionnement'
      ]
    },
    {
      id: 'atelier-appels-offres',
      title: 'Atelier d\'analyse d\'appels d\'offres',
      description: 'Exercices pratiques d\'analyse de cahiers des charges et d\'élaboration de réponses techniques',
      icon: <FileSearch className="h-10 w-10 text-blue-300" />,
      status: 'coming-soon',
      gradient: 'from-blue-600 to-blue-900',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-300',
      features: [
        'Simulation d\'élaboration de réponses techniques',
        'Évaluation automatique de la conformité aux exigences',
        'Construction de planning et chiffrage interactifs'
      ]
    },
    {
      id: 'metriques-projet',
      title: 'Laboratoire de métriques projet',
      description: 'Outil de construction et d\'analyse de tableaux de bord et d\'indicateurs de performance',
      icon: <BarChart3 className="h-10 w-10 text-purple-300" />,
      status: 'coming-soon',
      gradient: 'from-purple-600 to-purple-900',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-300',
      features: [
        'Construction visuelle de dashboards de suivi',
        'Élaboration d\'indicateurs de performance',
        'Analyse de la valeur et du ROI des solutions'
      ]
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="mc2i LAB" />
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              className="text-white mr-2" 
              onClick={() => navigate('/amoa/new')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">mc2i LAB</h1>
          </div>

          <div className="mb-8">
            <p className="text-xl text-indigo-300 max-w-3xl">
              Environnement d'apprentissage pour maîtriser l'analyse et la transformation métier
            </p>
            <div className="w-32 h-1 bg-indigo-600 mt-4 mb-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${module.gradient} border-0 shadow-lg h-full flex flex-col overflow-hidden`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 rounded-lg mb-3">
                        {module.icon}
                      </div>
                      <Badge variant="outline" className="bg-white/10 border-white/20">
                        {module.status === 'coming-soon' ? 'Bientôt disponible' : 'Actif'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{module.title}</CardTitle>
                    <CardDescription className={`${module.textColor}`}>
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-grow">
                    <div className="space-y-2 mt-2">
                      {module.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <ChevronRight className="h-5 w-5 mr-2 mt-0.5 text-white/60" />
                          <p className="text-sm text-white/80">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full ${module.buttonColor} text-white`}
                      disabled={module.status === 'coming-soon'}
                      onClick={() => module.status !== 'coming-soon' && navigate(`/amoa/mc2i-lab/${module.id}`)}
                    >
                      {module.status === 'coming-soon' ? 'Bientôt disponible' : 'Accéder'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}