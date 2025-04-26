import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Clock, AlertTriangle, Lock, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function RansomwareAttack() {
  return (
    <HomeLayout>
      <PageTitle title="Attaque par Ransomware" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-red-900 to-gray-900">
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
              <Button variant="ghost" className="text-white hover:bg-red-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <Shield className="mr-3 h-8 w-8" /> 
              Attaque par Ransomware
            </h1>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/70 border-gray-800">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-red-900 rounded-full flex items-center justify-center mb-6">
                  <FileQuestion className="h-10 w-10 text-red-200" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enquête en préparation</h2>
                <p className="text-red-200 mb-6 max-w-2xl">
                  Ce scénario d'enquête sur une attaque par ransomware est actuellement en cours de développement. 
                  Vous pourrez bientôt mener une investigation approfondie sur comment une entreprise a été 
                  victime d'une cyberattaque avec demande de rançon.
                </p>
                
                <div className="w-full max-w-md bg-gray-950/50 rounded-lg p-6 border border-red-800/30">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-white font-medium">Aperçu du scénario</h3>
                  </div>
                  <ul className="space-y-2 text-red-100">
                    <li className="flex">
                      <div className="text-red-500 mr-2">•</div>
                      <span>Analyse des vecteurs d'infection initiaux</span>
                    </li>
                    <li className="flex">
                      <div className="text-red-500 mr-2">•</div>
                      <span>Étude de la propagation sur le réseau de l'entreprise</span>
                    </li>
                    <li className="flex">
                      <div className="text-red-500 mr-2">•</div>
                      <span>Identification des failles de sécurité exploitées</span>
                    </li>
                    <li className="flex">
                      <div className="text-red-500 mr-2">•</div>
                      <span>Découverte du groupe de cybercriminels responsable</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 flex items-center text-sm text-red-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Disponible prochainement</span>
                </div>
                
                <Link href="/cyber/arcade/cyber-investigator">
                  <Button className="mt-6 bg-red-700 hover:bg-red-800 text-white">
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