import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function SensibilisationSimplePage() {
  const { isDark } = useTheme();
  
  return (
    <HomeLayout>
      <PageTitle title="Sensibilisation à la Cybersécurité" />
      
      <div className={`min-h-screen p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="container mx-auto">
          <div className="mb-4">
            <Link href="/cyber/learning/cyber-mastery">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux parcours
              </Button>
            </Link>
          </div>
          
          <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8`}>
            <CardHeader>
              <CardTitle className="text-2xl">Module de Sensibilisation Cybersécurité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bienvenue dans le module de sensibilisation à la cybersécurité.
                Ce module est conçu pour vous aider à reconnaître et à vous protéger contre les menaces cyber les plus courantes.
              </p>
              <p>
                Dans la version complète, vous trouverez :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Des scénarios interactifs basés sur des situations réelles</li>
                <li>Des quiz pour tester vos connaissances</li>
                <li>Des conseils pratiques de sécurité</li>
                <li>Des références vers des ressources officielles</li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="mb-4">Le module complet est en cours de développement.</p>
            <Link href="/cyber/learning/cyber-mastery">
              <Button>Retourner à la page Cyber Mastery</Button>
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}