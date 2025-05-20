import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Database,
  Code
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';
import { Helmet } from 'react-helmet-async';

export default function DataIaSasAcademie() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041b36] to-[#0c142e] text-white pb-20">
      <Helmet>
        <title>DATA & IA ACADÉMIE | Choix du mode d'apprentissage</title>
      </Helmet>
      
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/data-ia">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="DATA & IA ACADÉMIE" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Choisissez votre mode d'apprentissage</h1>
            <p className="text-blue-200 mt-1">Deux approches complémentaires pour développer vos compétences en Data & IA</p>
          </div>
        </div>

        {/* Options d'apprentissage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
          {/* Option 1: Apprendre en discutant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-900/40 to-blue-950 border-blue-700 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-blue-800/70">
                    <MessageSquare className="h-10 w-10 text-blue-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Apprentissage conversationnel</CardTitle>
                <CardDescription className="text-blue-300 text-center text-lg">
                  Discutez avec un expert virtuel pour explorer les sujets à votre rythme
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-blue-200">
                  Posez des questions, explorez des concepts et approfondissez à votre guise les sujets qui vous intéressent dans une conversation fluide avec un assistant IA spécialisé en Data Science et IA.
                </p>
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Format libre et personnalisé
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Questions illimitées
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Exemples concrets et mises en situation
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5"
                  onClick={() => navigate('/data-ia/expert-learning')}
                >
                  Discuter avec un expert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 2: Espace d'entraînement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-cyan-950 border-cyan-700 hover:border-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-cyan-800/70">
                    <Code className="h-10 w-10 text-cyan-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Espace d'entraînement</CardTitle>
                <CardDescription className="text-cyan-300 text-center text-lg">
                  Pratiquez avec des exercices interactifs et des défis de code
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-cyan-200">
                  Développez vos compétences techniques avec des modules pratiques, des défis de code et des projets guidés pour mettre en application vos connaissances.
                </p>
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Défis de code adaptés à votre niveau
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Projets pratiques guidés
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Tests et quiz d'auto-évaluation
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-5"
                  onClick={() => navigate('/data-ia/data-studio')}
                >
                  Accéder à l'espace d'entraînement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}