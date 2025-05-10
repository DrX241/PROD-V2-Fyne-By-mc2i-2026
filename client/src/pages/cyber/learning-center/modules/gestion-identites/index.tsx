import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Key, Shield, UserCheck, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';

export default function GestionIdentitesModule() {
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
          title="Gestion des identités et des accès"
          subtitle="Sécuriser les accès aux systèmes d'information"
          icon={<Key className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-24 w-24 text-blue-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Module en développement</h2>
        <p className="text-xl text-blue-300 mb-8 text-center max-w-2xl">
          Le module complet sur la gestion des identités et des accès sera disponible prochainement. 
          Il couvrira les principes du contrôle d'accès, l'authentification forte, 
          la gestion du cycle de vie des identités et les bonnes pratiques IAM.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-8">
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <UserCheck className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Authentification et autorisation</h3>
            <p className="text-blue-200 text-sm">
              Standards d'authentification, MFA, SSO et modèles d'autorisation
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Lock className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Contrôle d'accès avancé</h3>
            <p className="text-blue-200 text-sm">
              PAM, RBAC, ABAC et autres modèles pour une gestion fine des accès
            </p>
          </Card>
          <Card className="p-6 bg-blue-900/20 border-blue-800 flex flex-col items-center text-center">
            <Users className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-bold mb-2">Gouvernance des identités</h3>
            <p className="text-blue-200 text-sm">
              Gestion du cycle de vie, recensement, revue périodique et certification
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