import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Button } from '@/components/ui/button';

export default function PhishingDetectivePage() {
  return (
    <HomeLayout>
      <PageTitle title="Detective de Phishing" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-900 via-gray-900 to-black relative overflow-hidden">
        {/* Arrière-plan */}
        <div className="absolute inset-0 w-full h-full opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16 flex flex-col items-center justify-center h-full">
          <Link href="/cyber/arcade" className="inline-flex items-center text-blue-200 hover:text-white mb-8 self-start transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à Cyber Arcade
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-blue-700/30 max-w-3xl mx-auto text-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 1.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-24 h-24 bg-blue-600/20 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Mail className="h-12 w-12 text-blue-400" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Detective de Phishing</h1>
            
            <p className="text-lg text-blue-200 mb-8">
              Version simplifiée en cours de développement. Cette nouvelle version sera disponible prochainement avec une interface 
              plus intuitive et des scénarios d'apprentissage plus efficaces.
            </p>
            
            <div className="space-y-4 text-left bg-gray-800/50 p-4 rounded-lg mb-8">
              <h2 className="font-semibold text-white">Fonctionnalités à venir :</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Scénarios d'emails de phishing générés par IA</li>
                <li>Système de progression par niveaux de difficulté</li>
                <li>Feedback éducatif détaillé pour chaque tentative</li>
                <li>Interface utilisateur simplifiée et optimisée</li>
                <li>Conseils pratiques applicables au quotidien</li>
              </ul>
            </div>
            
            <Button 
              asChild
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              <Link href="/cyber/arcade">
                Retour aux jeux disponibles
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}