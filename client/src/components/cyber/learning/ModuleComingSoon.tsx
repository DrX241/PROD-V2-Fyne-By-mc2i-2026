import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Microscope, LayoutGrid, AlertOctagon, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageTitle from '@/components/utils/PageTitle';

interface ModuleComingSoonProps {
  title: string;
  subtitle?: string;
}

export default function ModuleComingSoon({ title, subtitle = "Module en développement" }: ModuleComingSoonProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/cyber/learning-center">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Centre d'Apprentissage
          </Button>
        </Link>
        <PageTitle
          title={title}
          subtitle={subtitle}
          icon={<BrainCircuit className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-24 w-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Module en développement</h2>
        <p className="text-xl text-blue-300 mb-8 text-center max-w-2xl">
          Le module complet sur {title.toLowerCase()} sera disponible prochainement. 
          Il couvrira les concepts fondamentaux, les bonnes pratiques, les techniques 
          et les méthodes adaptées à ce domaine.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Microscope className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Concepts fondamentaux</h3>
            <p className="text-blue-200 text-sm">
              Terminologie, principes de base et concepts essentiels
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <LayoutGrid className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Méthodologies</h3>
            <p className="text-blue-200 text-sm">
              Méthodes, processus et bonnes pratiques adaptés aux contextes professionnels
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <AlertOctagon className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Normes et conformité</h3>
            <p className="text-blue-200 text-sm">
              Standards, réglementations et exigences de conformité applicables
            </p>
          </Card>
        </div>
        <Link href="/cyber/learning-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Retour au Centre d'Apprentissage
          </Button>
        </Link>
      </div>
    </div>
  );
}