import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Clock, AlertTriangle, Lock, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function ThreatIntelligence() {
  return (
    <HomeLayout>
      <PageTitle title="Menaces Avancées" />
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
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-purple-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Cyber Arcade
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <Shield className="mr-3 h-8 w-8" /> 
              Menaces Avancées
            </h1>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900/70 border-gray-800">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center mb-6">
                  <Lock className="h-10 w-10 text-purple-200" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Module en développement</h2>
                <p className="text-purple-200 mb-6 max-w-2xl">
                  Ce module de renseignement sur les menaces avancées est actuellement en cours de développement. 
                  Vous pourrez bientôt traquer des acteurs malveillants, analyser leurs tactiques, techniques 
                  et procédures (TTP), et anticiper leurs actions futures.
                </p>
                
                <div className="w-full max-w-md bg-gray-950/50 rounded-lg p-6 border border-purple-800/30">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-white font-medium">Fonctionnalités à venir</h3>
                  </div>
                  <ul className="space-y-2 text-purple-100">
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Cartographie des menaces APT (Advanced Persistent Threats)</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Analyse de malwares et identification des signatures</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Attribution d'attaques à des groupes connus</span>
                    </li>
                    <li className="flex">
                      <div className="text-purple-500 mr-2">•</div>
                      <span>Détection de campagnes ciblées et modélisation des menaces</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 flex items-center text-sm text-purple-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Disponible prochainement</span>
                </div>
                
                <Link href="/cyber/arcade">
                  <Button className="mt-6 bg-purple-700 hover:bg-purple-800 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux autres jeux
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