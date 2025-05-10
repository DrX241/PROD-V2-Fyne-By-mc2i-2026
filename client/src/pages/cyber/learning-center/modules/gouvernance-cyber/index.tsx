import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ClipboardList, Shield, FileText, Scale, LineChart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';

export default function GouvernanceCyberModule() {
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
          title="Gouvernance, Risque et Conformité"
          subtitle="Pilotage stratégique de la sécurité de l'information"
          icon={<ClipboardList className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-24 w-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Module en développement</h2>
        <p className="text-xl text-blue-300 mb-8 text-center max-w-2xl">
          Le module complet sur la gouvernance, le risque et la conformité (GRC) sera disponible prochainement. 
          Il couvrira les cadres de gouvernance, la gestion des risques, 
          la conformité réglementaire et la mise en place d'un SMSI efficace.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <BookOpen className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Cadres et normes</h3>
            <p className="text-blue-200 text-sm">
              ISO 27001, NIST CSF, CIS Controls et autres référentiels de gouvernance
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Scale className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Gestion des risques</h3>
            <p className="text-blue-200 text-sm">
              Méthodologies d'identification, d'évaluation et de traitement des risques cyber
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <LineChart className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Pilotage et mesure</h3>
            <p className="text-blue-200 text-sm">
              Indicateurs de performance, tableaux de bord et reporting en cybersécurité
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