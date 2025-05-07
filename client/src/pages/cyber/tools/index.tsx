import React from 'react';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileOutput, Mail, Shield, Workflow } from 'lucide-react';

// Interface pour les cartes d'outils
interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  comingSoon?: boolean;
}

export default function ToolsPage() {
  const [, setLocation] = useLocation();

  // Définition des outils disponibles
  const tools: ToolCard[] = [
    {
      id: 'policy-converter',
      title: 'Convertisseur de Politiques de Sécurité',
      description: 'Transformez des politiques de sécurité complexes en versions adaptées à différents publics.',
      icon: <FileOutput className="h-12 w-12 text-blue-400" />,
      path: '/cyber/tools/policy-converter'
    },
    {
      id: 'phishing-simulator',
      title: 'Simulateur de Phishing',
      description: 'Créez des exemples d\'emails de phishing pour former et sensibiliser votre équipe.',
      icon: <Mail className="h-12 w-12 text-blue-400" />,
      path: '/cyber/tools/phishing-simulator'
    },
    {
      id: 'password-analyzer',
      title: 'Analyseur de Mots de Passe',
      description: 'Évaluez la force des mots de passe et obtenez des recommandations pour les améliorer.',
      icon: <Shield className="h-12 w-12 text-blue-400" />,
      path: '/cyber/tools/password-analyzer',
      comingSoon: true
    },
    {
      id: 'incident-response',
      title: 'Générateur de Plans de Réponse',
      description: 'Créez des plans de réponse aux incidents personnalisés selon votre organisation.',
      icon: <Workflow className="h-12 w-12 text-blue-400" />,
      path: '/cyber/tools/incident-response',
      comingSoon: true
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="OUTILS CYBERSÉCURITÉ" />
      
      <div className="container mx-auto py-6">
        <Card className="bg-gray-900 border-gray-800 text-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Outils Cybersécurité</CardTitle>
            <CardDescription className="text-gray-400">
              Explorez notre collection d'outils spécialisés pour renforcer vos connaissances et pratiques en cybersécurité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-start mb-6">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-950 border-blue-800"
                onClick={() => setLocation('/cyber')}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className={`bg-gray-800 border-gray-700 hover:border-blue-700 transition-all ${
                    tool.comingSoon ? 'opacity-70' : 'hover:shadow-md hover:shadow-blue-900/20'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">{tool.title}</CardTitle>
                      {tool.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{tool.description}</p>
                    <Button
                      className={tool.comingSoon 
                        ? "w-full bg-gray-700 text-gray-400 hover:bg-gray-700 cursor-not-allowed"
                        : "w-full bg-blue-600 hover:bg-blue-700 text-white"
                      }
                      onClick={() => !tool.comingSoon && setLocation(tool.path)}
                      disabled={tool.comingSoon}
                    >
                      {tool.comingSoon ? 'Bientôt disponible' : 'Accéder à l\'outil'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-800 pt-4">
            <div className="text-sm text-gray-400">
              <p>Ces outils sont conçus pour la formation et la sensibilisation à la cybersécurité. Ils utilisent l'intelligence artificielle pour fournir des résultats personnalisés et adaptés à vos besoins.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
}