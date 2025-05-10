import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Database, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';

export default function SecuriteDonneesModule() {
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
          title="Sécurité des données"
          subtitle="Protection et gouvernance des données sensibles"
          icon={<Database className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-24 w-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Module en développement</h2>
        <p className="text-xl text-blue-300 mb-8 text-center max-w-2xl">
          Le module complet sur la sécurité des données sera disponible prochainement. 
          Il couvrira les principes fondamentaux de la protection des données, 
          la classification, le chiffrement, la gestion du cycle de vie et la conformité réglementaire.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Database className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Classification des données</h3>
            <p className="text-blue-200 text-sm">
              Méthodologies et bonnes pratiques pour identifier et classifier les données sensibles
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Shield className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Techniques de protection</h3>
            <p className="text-blue-200 text-sm">
              Chiffrement, tokenisation, contrôle d'accès et autres mécanismes de protection
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <FileText className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Conformité réglementaire</h3>
            <p className="text-blue-200 text-sm">
              RGPD, sectorielles et autres cadres réglementaires pour la protection des données
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