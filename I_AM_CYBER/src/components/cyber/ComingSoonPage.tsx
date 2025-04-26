import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Construction, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

interface ComingSoonPageProps {
  title: string;
  description: string;
  backUrl: string;
  backLabel: string;
}

export default function ComingSoonPage({ 
  title, 
  description, 
  backUrl, 
  backLabel 
}: ComingSoonPageProps) {
  return (
    <HomeLayout>
      <PageTitle title={title} />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-900 via-gray-900 to-blue-950">
        {/* Arrière-plan */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <Link href={backUrl} className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-blue-700/30 rounded-full flex items-center justify-center mb-6">
              <Construction className="h-10 w-10 text-blue-200" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {title}
            </h1>
            
            <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-700/30">
              <p className="text-lg text-blue-200 mb-4">
                {description}
              </p>
              
              <div className="flex items-center justify-center text-blue-300 bg-blue-800/30 p-3 rounded-lg">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Disponible bientôt</span>
              </div>
            </div>
            
            <div className="animate-pulse mb-12">
              <div className="h-2 w-16 bg-blue-500 rounded-full"></div>
            </div>
            
            <Button asChild className="bg-blue-700 hover:bg-blue-600 text-white">
              <Link href={backUrl}>
                Retour à {backLabel.replace("Retour à ", "")}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}