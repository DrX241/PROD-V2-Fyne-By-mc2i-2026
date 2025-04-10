import React from 'react';
import HomeLayout from "@/components/layout/HomeLayout";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import PageTitle from "@/components/utils/PageTitle";

export default function Home() {
  return (
    <HomeLayout>
      <PageTitle title="Accueil" />
      {/* Hero Section - Version extrêmement minimaliste */}
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          {/* Animation du slogan FYNE - centré et agrandi */}
          <motion.div 
            className="mb-6"
            animate={{ 
              scale: [1, 1.05, 1.1, 1.05, 1],
              filter: ['drop-shadow(0 0 10px rgba(56, 189, 248, 0.4))', 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.6))', 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.4))']
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-white text-7xl font-bold font-cyber-title tracking-wide text-shadow">
              FYNE
            </span>
          </motion.div>
          
          {/* Tagline sous le slogan */}
          <div className="text-white text-2xl font-cyber-title mb-10">
            <span>
              <span className="text-cyan-300">F</span>or 
              <span className="text-cyan-300"> Y</span>our 
              <span className="text-cyan-300"> N</span>ext 
              <span className="text-cyan-300"> E</span>xperience
            </span>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}