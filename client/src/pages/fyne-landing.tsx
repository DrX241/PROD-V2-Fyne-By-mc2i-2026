import React from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Import l'image du personnage FYNE
import fyneCharacter from '@assets/image_1747677449072.png';
import CyberButton from '@/components/CyberButton';

export default function FyneLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-20 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Contenu textuel */}
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-4 py-1.5 bg-blue-600/30 rounded-full text-blue-200 mb-6">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                Formation Assistée par IA
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Améliorez </span>
              <span className="text-blue-400">votre expertise</span>
              <br/>
              <span className="text-white">avec </span>
              <span className="text-blue-400">FYNE</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8">
              La formation immersive nouvelle génération avec des modules intelligents
              qui s'adaptent en temps réel à vos besoins.
            </p>
            
            <Link href="/fyne-about">
              <CyberButton 
                variant="primary" 
                className="px-6 py-5 text-lg"
              >
                Découvrez FYNE
                <ArrowRight className="ml-2 h-5 w-5" />
              </CyberButton>
            </Link>
          </motion.div>
          
          {/* Image du personnage FYNE */}
          <motion.div 
            className="md:w-1/2 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative">
              {/* Logo FYNE */}
              <div className="absolute top-0 right-10 bg-blue-600 text-white font-bold px-4 py-2 rounded-md">
                FYNE
                <span className="block text-xs font-normal">by mc2i</span>
              </div>
              
              {/* Image avec effet de bordure */}
              <div className="rounded-lg overflow-hidden border-2 border-blue-600/50 shadow-lg shadow-blue-600/20">
                <img 
                  src={fyneCharacter} 
                  alt="FYNE Avatar" 
                  className="w-full max-w-md h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Flèche de défilement */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1, 
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}