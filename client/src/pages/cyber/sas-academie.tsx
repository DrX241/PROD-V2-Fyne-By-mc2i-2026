import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from '@/components/utils/PageTitle';

export default function SasCyberAcademie() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber-v3">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="CYBER ACADÉMIE" />
        </div>
        
        <div className="flex flex-col justify-center items-center mb-10 text-center">
          <div className="mb-8 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Bienvenue dans la Cyber Académie</h1>
            <p className="text-blue-200 text-lg mb-4">
              Vous êtes dans l'espace dédié pour découvrir ou revoir les bases de la cybersécurité.
              Notre académie vous propose un apprentissage adapté à vos besoins et votre rythme.
            </p>
            <div className="h-1 w-40 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto my-4"></div>
            <p className="text-blue-100 mt-4">
              Nous vous proposons deux approches complémentaires pour développer vos compétences. 
              Choisissez celle qui vous convient le mieux ou alternez entre les deux !
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Choisissez votre mode d'apprentissage</h2>
          </div>
        </div>

        {/* Options d'apprentissage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
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
                <p className="mb-4 text-blue-200">
                  Posez des questions et explorez les sujets cybersécurité qui vous intéressent avec un assistant IA spécialisé.
                </p>
                <ul className="text-left space-y-1 mb-4 mx-auto max-w-xs">
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
                    Apprentissage adaptatif
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5"
                  onClick={() => navigate('/cyber/expert-learning')}
                >
                  Discuter avec un expert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 2: Parcours structuré */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-cyan-950 border-cyan-700 hover:border-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-cyan-800/70">
                    <Shield className="h-10 w-10 text-cyan-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Parcours structuré</CardTitle>
                <CardDescription className="text-cyan-300 text-center text-lg">
                  Suivez un curriculum organisé avec des modules progressifs
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4 text-cyan-200">
                  Progressez à travers des modules organisés et des exercices pratiques sélectionnés par nos experts en cybersécurité.
                </p>
                <ul className="text-left space-y-1 mb-4 mx-auto max-w-xs">
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Contenu structuré et progressif
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Suivi de progression
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Ressources téléchargeables
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-5"
                  onClick={() => navigate('/cyber/learning-center')}
                >
                  Accéder aux modules
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