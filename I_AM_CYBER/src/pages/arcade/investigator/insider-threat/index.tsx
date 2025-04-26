import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Clock, AlertTriangle, Lock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function InsiderThreat() {
  return (
    <HomeLayout>
      <PageTitle title="Menace Interne" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade/cyber-investigator">
              <Button variant="ghost" className="text-white hover:bg-purple-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <AlertCircle className="mr-3 h-8 w-8" /> 
              Menace Interne
            </h1>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/70 border-gray-800">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center mb-6">
                  <UserX className="h-10 w-10 text-purple-200" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enquête en préparation</h2>
                <p className="text-purple-200 mb-6 max-w-2xl">
                  Ce scénario d'enquête sur une menace interne est actuellement en cours de développement. 
                  Vous pourrez bientôt mener une investigation avancée pour identifier une taupe au sein 
                  d'une organisation confidentielle.
                </p>
                
                <div className="w-full max-w-md bg-gray-950/50 rounded-lg p-6 border border-purple-800/30">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-white font-medium">Aperçu du scénario</h3>
                  </div>
                  <ul className="space-y-2 text-purple-100">
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Analyse des communications et métadonnées suspectes</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Étude des accès inhabituels aux ressources confidentielles</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Surveillance comportementale et détection d'anomalies</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Identification des motivations et techniques d'infiltration</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 flex items-center text-sm text-purple-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Disponible prochainement</span>
                </div>
                
                <Link href="/cyber/arcade/cyber-investigator">
                  <Button className="mt-6 bg-purple-700 hover:bg-purple-800 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}