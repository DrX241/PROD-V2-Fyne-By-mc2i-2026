import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ModuleComingSoonProps {
  title: string;
}

export default function ModuleComingSoon({ title }: ModuleComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Bouton de retour */}
        <Link href="/cyber/learning-center">
          <Button variant="ghost" className="mb-6 text-blue-300 hover:text-blue-100 hover:bg-blue-900/30">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au centre d'apprentissage
          </Button>
        </Link>
        
        <Card className="bg-blue-900/20 border-blue-800 w-full max-w-4xl mx-auto">
          <CardHeader className="pb-4 text-center">
            <div className="mb-4 p-3 bg-amber-600/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Module en développement</h1>
            <p className="text-blue-200 text-lg">{title}</p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-blue-100 mb-6">
              Ce module est actuellement en cours de développement et sera bientôt disponible.
              Nous travaillons activement pour vous proposer un contenu de qualité.
            </p>
            
            <div className="flex flex-col gap-4 items-center justify-center mt-8">
              <Button variant="default" className="bg-blue-700 hover:bg-blue-600" asChild>
                <Link href="/cyber/learning-center">
                  Retourner à la liste des modules
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}