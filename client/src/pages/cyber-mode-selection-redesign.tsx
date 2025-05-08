import React from 'react';
import { Home, Wrench, Shield, BookOpen, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function CyberModeSelectionRedesign() {
  return (
    <HomeLayout>
      <div className="container mx-auto py-8">
        <PageTitle title="I AM CYBER - Nouvelle interface" />
        
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Prototype de la nouvelle organisation</h2>
          <p className="mb-4">Cette page présente le prototype de la nouvelle organisation des modules I AM CYBER, avec une approche hybride qui combine :</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Organisation par objectifs d'apprentissage (Se former, S'entraîner, S'évaluer, Créer/Automatiser)</li>
            <li>Organisation par parcours métiers en cybersécurité (GRC, SecOps, Architecture, etc.)</li>
            <li>Fonctionnalités d'accessibilité : mode contraste élevé et taille de texte ajustable</li>
          </ul>
          <p>Le prototype complet est en cours de développement. Cette version simplifiée vous permet de visualiser le concept.</p>
          
          <Link href="/cyber-mode-selection">
            <Button className="mt-4">
              <Home className="mr-2 h-4 w-4" /> Retour à l'interface actuelle
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Objectifs d'apprentissage */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
            <CardHeader>
              <CardTitle>Organisation par objectifs d'apprentissage</CardTitle>
              <CardDescription className="text-blue-100">
                Modules regroupés par finalité pédagogique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-200" />
                    <h3 className="font-bold">SE FORMER</h3>
                  </div>
                  <p className="text-sm text-blue-100">Contenus éducatifs et formations pour acquérir de nouvelles connaissances</p>
                </div>
                
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 mr-2 text-blue-200" />
                    <h3 className="font-bold">S'ENTRAÎNER</h3>
                  </div>
                  <p className="text-sm text-blue-100">Activités pratiques et simulations pour développer vos compétences</p>
                </div>
                
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 mr-2 text-blue-200" />
                    <h3 className="font-bold">S'ÉVALUER</h3>
                  </div>
                  <p className="text-sm text-blue-100">Tests et évaluations pour mesurer votre niveau</p>
                </div>
                
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Wrench className="h-5 w-5 mr-2 text-blue-200" />
                    <h3 className="font-bold">CRÉER/AUTOMATISER</h3>
                  </div>
                  <p className="text-sm text-blue-100">Outils pour automatiser et simplifier les tâches de cybersécurité</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Parcours métiers */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 mt-6 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
            <CardHeader>
              <CardTitle>Organisation par parcours métiers</CardTitle>
              <CardDescription className="text-purple-100">
                Modules regroupés par profils professionnels en cybersécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 mr-2 text-purple-200" />
                    <h3 className="font-bold">GRC</h3>
                  </div>
                  <p className="text-sm text-purple-100">Gouvernance, Risque et Conformité pour RSSI et auditeurs</p>
                </div>
                
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 mr-2 text-purple-200" />
                    <h3 className="font-bold">SECOPS</h3>
                  </div>
                  <p className="text-sm text-purple-100">Sécurité Opérationnelle pour analystes SOC et incident responders</p>
                </div>
                
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Wrench className="h-5 w-5 mr-2 text-purple-200" />
                    <h3 className="font-bold">PENTEST</h3>
                  </div>
                  <p className="text-sm text-purple-100">Test d'intrusion et Red Team pour ethical hackers</p>
                </div>
                
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 mr-2 text-purple-200" />
                    <h3 className="font-bold">FORMATION</h3>
                  </div>
                  <p className="text-sm text-purple-100">Sensibilisation et formation pour responsables pédagogiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}