import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Fingerprint, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function DigitalForensics() {
  const scenarios = [
    {
      id: 'shadow-breach',
      title: 'Infiltration Fantôme',
      description: "Une entreprise de fintech a détecté des transactions suspectes. Analysez les logs système et les captures réseau pour identifier le point d'entrée.",
      difficulty: 'intermédiaire',
      duration: '45-60 min',
      skills: ['Analyse de logs', 'Chronologie', 'Reconstruction'],
      isNew: true,
      comingSoon: false
    },
    {
      id: 'erased-evidence',
      title: 'Preuves Effacées',
      description: "Un attaquant a tenté de dissimuler ses traces en supprimant des fichiers. Utilisez des techniques de récupération de données.",
      difficulty: 'avancé',
      duration: '60-75 min',
      skills: ['Récupération', 'Analyse', 'Carving'],
      comingSoon: true
    },
    {
      id: 'memory-hunt',
      title: 'Chasse en Mémoire',
      description: "Analysez un dump mémoire pour identifier un malware furtif et extraire les indicateurs de compromission.",
      difficulty: 'avancé',
      duration: '60 min',
      skills: ['Analyse de mémoire', 'Détection', 'Extraction'],
      comingSoon: true
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="Analyse Forensique" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          {/* En-tête */}
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-emerald-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <Fingerprint className="mr-3 h-8 w-8 text-emerald-400" /> 
              Analyse Forensique
            </h1>
          </div>
          
          {/* Introduction */}
          <div className="mb-12 max-w-4xl">
            <p className="text-emerald-100 text-lg mb-4">
              L'analyse forensique numérique est l'art de collecter, préserver et analyser des preuves 
              électroniques pour reconstituer le déroulement d'un incident de sécurité.
            </p>
            <p className="text-emerald-200">
              Choisissez un scénario d'investigation pour mettre en pratique les techniques d'analyse forensique 
              dans un environnement réaliste et immersif.
            </p>
          </div>
          
          {/* Liste des scénarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/60 border-gray-800 h-full">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white text-xl font-medium">{scenario.title}</h3>
                      {scenario.isNew && !scenario.comingSoon && (
                        <Badge className="bg-blue-600">NOUVEAU</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className={scenario.difficulty === 'intermédiaire' 
                        ? "bg-amber-900/20 text-amber-400" 
                        : "bg-red-900/20 text-red-400"}>
                        {scenario.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-800/40 text-white">
                        {scenario.duration}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>
                    <div>
                      <h4 className="text-xs uppercase text-emerald-400 mb-1.5">Compétences</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {scenario.skills.map((skill, i) => (
                          <span key={i} className="text-xs bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!scenario.comingSoon ? (
                      <Link href={`/cyber/arcade/digital-forensics/${scenario.id}`}>
                        <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                          <Play className="h-4 w-4 mr-2" /> 
                          Commencer l'investigation
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full bg-gray-800 text-gray-400 cursor-not-allowed">
                        <Clock className="h-4 w-4 mr-2" /> Bientôt disponible
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}