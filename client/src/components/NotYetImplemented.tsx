import React from 'react';
import { ArrowLeft, Clock, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface NotYetImplementedProps {
  title: string;
  message?: string;
  backPath?: string;
  backLabel?: string;
}

export default function NotYetImplemented({ 
  title, 
  message = "Cette fonctionnalité est en cours de développement et sera bientôt disponible.", 
  backPath = "/", 
  backLabel = "Retour à l'accueil" 
}: NotYetImplementedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <div className="bg-blue-600/20 p-4 rounded-full mb-6">
            <Clock className="h-12 w-12 text-blue-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          
          <p className="text-xl text-blue-200 mb-8">
            {message}
          </p>
          
          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-300">Ce que vous apprendrez dans ce module</h3>
                <p className="text-blue-200 mt-1">Le contenu est en préparation pour vous offrir une expérience d'apprentissage optimale combinant théorie, exemples concrets et exercices pratiques.</p>
              </div>
            </div>
            
            <ul className="space-y-2 text-blue-200 ml-6 list-disc">
              <li>Fondamentaux et concepts essentiels</li>
              <li>Exercices pratiques et interactifs</li>
              <li>Cas d'usage réels en entreprise</li>
              <li>Bonnes pratiques professionnelles</li>
              <li>Quiz et évaluations pour mesurer votre progression</li>
            </ul>
          </div>
          
          <Link href={backPath}>
            <Button variant="outline" className="border-blue-700 text-blue-300 hover:bg-blue-900/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}