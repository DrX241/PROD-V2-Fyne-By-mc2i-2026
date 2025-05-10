import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Cpu, Shield, Factory, Network, Wrench, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';

export default function SecuriteOTModule() {
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
          title="Sécurité des systèmes industriels (OT)"
          subtitle="Protection des environnements opérationnels et industriels"
          icon={<Factory className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-24 w-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Module en développement</h2>
        <p className="text-xl text-blue-300 mb-8 text-center max-w-2xl">
          Le module complet sur la sécurité des systèmes industriels (OT) sera disponible prochainement. 
          Il couvrira les spécificités des environnements industriels, les contraintes de sécurité, 
          la convergence IT/OT et les bonnes pratiques de protection.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Cpu className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Composants des systèmes OT</h3>
            <p className="text-blue-200 text-sm">
              SCADA, ICS, PLC, RTU et autres éléments des infrastructures industrielles
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Network className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Architecture sécurisée</h3>
            <p className="text-blue-200 text-sm">
              Segmentation, zones et conduits, DMZ industrielle et défense en profondeur
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <AlertTriangle className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Gestion des incidents</h3>
            <p className="text-blue-200 text-sm">
              Détection, réponse et résilience dans les environnements industriels critiques
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