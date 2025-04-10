import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import HomeLayout from "@/components/layout/HomeLayout";
import { 
  ShieldCheck, Shield, Database, ListChecks, Plus, ArrowRight, 
  BrainCircuit, Bot, Sparkles, Star, BookOpen, Zap, 
  Users, Award, Brain, Laptop, Package, Target, Gamepad
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { motion } from "framer-motion";
import mcLogoPath from "@assets/mc2i.png";
import PageTitle from "@/components/utils/PageTitle";

// Carte de module avec animation
const ModuleCard = ({ 
  title, 
  description, 
  icon, 
  color, 
  bgColor, 
  accentColor, 
  linkTo 
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  accentColor: string;
  linkTo: string;
}) => {
  const [isHover, setIsHover] = useState(false);
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl shadow-lg ${bgColor} border border-gray-200 transition-all duration-300 h-full flex flex-col`}
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
    >
      {/* Background Pattern */}
      <div className={`absolute top-0 right-0 w-40 h-40 ${accentColor} rounded-full -mr-16 -mt-16 opacity-10`}></div>
      
      <div className="p-8 flex flex-col h-full z-10 relative">
        {/* Icon */}
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6`}>
          {icon}
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        
        {/* Footer - Button */}
        <div className="mt-auto">
          <Link href={linkTo}>
            <Button 
              className={`${color} hover:${color}/90 group transition-all duration-300`}
            >
              Explorer le module
              <ArrowRight className={`ml-2 transition-all duration-300 ${isHover ? 'translate-x-1' : ''}`} />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Fonctionnalité Card
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 h-full"
      whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)' }}
    >
      <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};

export default function Home() {
  const { userName } = useChatContext();
  
  // Modules avec animations interactives
  const modules = [
    {
      title: "I AM CYBER",
      description: "Immergez-vous dans des simulations de cybersécurité interactives et choisissez entre le mode agent IA conversationnel ou les scénarios tactiques de défense.",
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      color: "bg-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      accentColor: "bg-blue-500",
      linkTo: "/cyber"
    },
    {
      title: "I AM DATA & IA",
      description: "Maîtrisez les concepts avancés de data science et d'intelligence artificielle à travers des simulations pratiques et des défis concrets.",
      icon: <Database className="w-8 h-8 text-white" />,
      color: "bg-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      accentColor: "bg-purple-500",
      linkTo: "/data-ia"
    },
    {
      title: "I AM AMOA",
      description: "Perfectionnez vos compétences en assistance à maîtrise d'ouvrage avec des experts virtuels qui vous guideront à travers des cas complexes.",
      icon: <ListChecks className="w-8 h-8 text-white" />,
      color: "bg-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      accentColor: "bg-emerald-500",
      linkTo: "/amoa"
    },
    {
      title: "Soyez qui vous voulez",
      description: "Créez votre propre parcours d'apprentissage personnalisé avec notre IA générative qui s'adapte à vos besoins spécifiques et objectifs professionnels.",
      icon: <Plus className="w-8 h-8 text-white" />,
      color: "bg-rose-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
      accentColor: "bg-rose-500",
      linkTo: "/custom"
    }
  ];
  
  // Fonctionnalités
  const features = [
    {
      icon: <Bot size={24} />,
      title: "Personnages IA avancés",
      description: "Interagissez avec des PNJ ultra-réalistes qui s'adaptent à votre style d'apprentissage"
    },
    {
      icon: <BrainCircuit size={24} />,
      title: "Apprentissage adaptatif",
      description: "Algorithmes d'IA qui ajustent la difficulté et le contenu selon votre progression"
    },
    {
      icon: <Sparkles size={24} />,
      title: "Scénarios contextuels",
      description: "Simulation de situations professionnelles réelles pour un apprentissage applicable"
    },
    {
      icon: <Zap size={24} />,
      title: "Feedback instantané",
      description: "Évaluation continue et suggestions d'amélioration par l'intelligence artificielle"
    },
    {
      icon: <Package size={24} />,
      title: "Modules sectoriels",
      description: "Contenus spécialisés adaptés aux enjeux spécifiques de votre industrie"
    },
    {
      icon: <Laptop size={24} />,
      title: "Accessibilité totale",
      description: "Disponible sur tous vos appareils avec synchronisation automatique"
    }
  ];
  
  return (
    <HomeLayout>
      <PageTitle title="Accueil" />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte héro */}
            <div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
                <Sparkles className="mr-2 h-4 w-4" />
                Propulsé par l'intelligence artificielle avancée
              </div>
              
              {/* Animation du slogan FYNE placée avant le titre principal */}
              <motion.div
                className="mb-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Animation de "FYNE by mc2i" qui s'écrit puis s'efface, suivi du slogan qui s'écrit */}
                <div className="relative h-14 overflow-hidden">
                  {/* Animation d'écriture de "FYNE by mc2i" */}
                  <div className="absolute inset-0 w-full text-center flex justify-center">
                    <div className="relative font-cyber-title font-bold tracking-wide text-white">
                      {/* FYNE by mc2i avec effet de frappe et curseur clignotant */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.span 
                          className="text-4xl text-white inline-block"
                          initial={{ width: "0%" }}
                          animate={{
                            width: ["0%", "100%", "100%", "0%"]
                          }}
                          transition={{
                            duration: 10,
                            times: [0, 0.3, 0.6, 0.9],
                            repeat: Infinity,
                            repeatDelay: 4,
                          }}
                        >
                          <motion.span 
                            className="inline-block whitespace-nowrap overflow-hidden"
                            animate={{
                              width: ["0ch", "9ch", "9ch", "0ch"]
                            }}
                            transition={{
                              duration: 10,
                              times: [0, 0.3, 0.6, 0.9],
                              repeat: Infinity,
                              repeatDelay: 4,
                            }}
                          >
                            FYNE <span className="text-xl font-normal opacity-90">by mc2i</span>
                          </motion.span>
                        </motion.span>
                        {/* Cursor animation */}
                        <motion.span
                          className="inline-block w-[3px] h-8 bg-white"
                          initial={{ opacity: 1 }}
                          animate={{ 
                            opacity: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
                          }}
                          transition={{
                            duration: 10,
                            times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9],
                            repeat: Infinity,
                            repeatDelay: 4,
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Animation d'écriture de "For Your Next Experience" */}
                  <div className="absolute inset-0 w-full text-center flex justify-center">
                    <div className="relative font-cyber-title font-bold tracking-wide text-white">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
                        transition={{ 
                          duration: 10, 
                          times: [0, 0.55, 0.6, 0.65, 0.9, 0.95],
                          repeat: Infinity,
                          repeatDelay: 4
                        }}
                      >
                        <motion.span 
                          className="text-2xl text-white inline-block"
                          initial={{ width: "0%" }}
                          animate={{
                            width: ["0%", "100%"]
                          }}
                          transition={{
                            duration: 3.5,
                            times: [0, 1],
                            repeat: Infinity,
                            repeatDelay: 10.5,
                          }}
                        >
                          <motion.span 
                            className="inline-block whitespace-nowrap overflow-hidden"
                            animate={{
                              width: ["0ch", "22ch"]
                            }}
                            transition={{
                              duration: 3.5,
                              times: [0, 1],
                              repeat: Infinity,
                              repeatDelay: 10.5,
                            }}
                          >
                            <span className="text-cyan-300">F</span>or 
                            <span className="text-cyan-300"> Y</span>our 
                            <span className="text-cyan-300"> N</span>ext 
                            <span className="text-cyan-300"> E</span>xperience
                          </motion.span>
                        </motion.span>
                        {/* Cursor animation */}
                        <motion.span
                          className="inline-block w-[3px] h-8 bg-white"
                          animate={{ 
                            opacity: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
                          }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            repeatDelay: 10.5,
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Ligne décorative en dessous */}
                <motion.div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-64 h-[2px]"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                </motion.div>
              </motion.div>

              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 font-cyber-title tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Améliorez votre 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"> expertise professionnelle</span> avec FYNE
              </motion.h1>
              
              <motion.p 
                className="text-xl text-blue-100 mb-8 max-w-xl font-cyber-body tracking-wide leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Découvrez une nouvelle dimension d'apprentissage interactif grâce à nos modules IA innovants qui s'adaptent parfaitement à votre progression.
              </motion.p>
              
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {/* Section de bouton supprimée */}
              </motion.div>
            </div>
            
            {/* Illustration héro - Concept d'IA et d'apprentissage avancé */}
            <motion.div 
              className="relative aspect-square max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/30 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 flex items-center justify-center">
                {/* Fond avec effet de code et connexions neuronales */}
                <div className="absolute inset-0 opacity-20">
                  {/* Simulation de code binaire pour évoquer l'IA */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        className="absolute text-[8px] text-blue-300 font-mono whitespace-nowrap"
                        style={{ 
                          top: `${Math.random() * 100}%`, 
                          left: `${Math.random() * 100}%`,
                        }}
                        animate={{ 
                          opacity: [0.3, 0.7, 0.3],
                          x: [0, Math.random() * 20 - 10]
                        }}
                        transition={{ 
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "linear" 
                        }}
                      >
                        {Array.from({ length: 30 }).map(() => Math.round(Math.random())).join('')}
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Illustration principale: Cerveau + Réseau neuronal + Apprentissage - Version plus fluide et immersive */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {/* Effet de particules flottantes pour une immersion améliorée */}
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute rounded-full"
                        style={{
                          width: `${Math.random() * 3 + 1}px`,
                          height: `${Math.random() * 3 + 1}px`,
                          backgroundColor: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.3})`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          x: [0, Math.random() * 30 - 15],
                          y: [0, Math.random() * 30 - 15],
                          opacity: [0, 0.7, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 5 + Math.random() * 5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative">
                    {/* Aura lumineuse globale */}
                    <motion.div 
                      className="absolute w-full h-full rounded-full"
                      style={{ 
                        top: '50%', 
                        left: '50%', 
                        width: '300px',
                        height: '300px',
                        transform: 'translate(-50%, -50%)' 
                      }}
                      animate={{ 
                        boxShadow: [
                          '0 0 50px rgba(56, 189, 248, 0.1)',
                          '0 0 70px rgba(56, 189, 248, 0.3)',
                          '0 0 50px rgba(56, 189, 248, 0.1)'
                        ]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    />
                    
                    {/* Cerveau représentant l'IA - stylisé avec des transitions plus fluides */}
                    <motion.div 
                      className="relative w-64 h-64"
                      animate={{ 
                        scale: [1, 1.02, 1.03, 1.02, 1],
                        filter: [
                          'drop-shadow(0 0 10px rgba(6, 182, 212, 0.2))',
                          'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))',
                          'drop-shadow(0 0 25px rgba(6, 182, 212, 0.4))',
                          'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))',
                          'drop-shadow(0 0 10px rgba(6, 182, 212, 0.2))'
                        ]
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Forme de cerveau stylisée - avec des dégradés plus doux */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-40 bg-gradient-to-br from-cyan-500/30 via-blue-600/40 to-indigo-500/50 rounded-[100px_100px_70px_70px] backdrop-blur-md shadow-lg">
                        <motion.div
                          className="absolute inset-0 rounded-[100px_100px_70px_70px]"
                          animate={{ 
                            boxShadow: [
                              'inset 0 0 30px rgba(6, 182, 212, 0.1), 0 0 20px rgba(6, 182, 212, 0.2)', 
                              'inset 0 0 40px rgba(6, 182, 212, 0.2), 0 0 40px rgba(6, 182, 212, 0.3)',
                              'inset 0 0 30px rgba(6, 182, 212, 0.1), 0 0 20px rgba(6, 182, 212, 0.2)'
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      
                      {/* Lobes du cerveau avec pulsations plus douces */}
                      <motion.div 
                        className="absolute top-[30%] left-[28%] w-20 h-16 bg-gradient-to-r from-indigo-500/40 via-blue-600/50 to-indigo-600/50 rounded-full backdrop-blur-sm"
                        animate={{ 
                          scale: [1, 1.03, 1.05, 1.03, 1],
                          opacity: [0.7, 0.8, 0.9, 0.8, 0.7]
                        }}
                        transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="absolute top-[30%] right-[28%] w-20 h-16 bg-gradient-to-l from-indigo-500/40 via-blue-600/50 to-indigo-600/50 rounded-full backdrop-blur-sm"
                        animate={{ 
                          scale: [1, 1.03, 1.05, 1.03, 1],
                          opacity: [0.7, 0.8, 0.9, 0.8, 0.7]
                        }}
                        transition={{ duration: 3.5, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      
                      {/* Connexions neuronales plus fluides et variées */}
                      {Array.from({ length: 25 }).map((_, i) => {
                        const startX = 50 + (Math.random() * 100 - 50);
                        const startY = 50 + (Math.random() * 100 - 50);
                        const endX = 50 + (Math.random() * 100 - 50);
                        const endY = 50 + (Math.random() * 100 - 50);
                        const hue = 180 + Math.random() * 40; // Variations de cyan
                        
                        return (
                          <motion.div
                            key={i}
                            className="absolute h-[1px] origin-left"
                            style={{ 
                              top: `${startY}%`, 
                              left: `${startX}%`,
                              width: `${Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))}px`,
                              transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
                              background: `hsla(${hue}, 70%, 60%, 0.6)`
                            }}
                            animate={{ 
                              opacity: [0.2, 0.8, 0.2],
                              height: [1, 1.5, 1],
                              boxShadow: [
                                `0 0 2px hsla(${hue}, 70%, 60%, 0.2)`, 
                                `0 0 5px hsla(${hue}, 70%, 60%, 0.5)`, 
                                `0 0 2px hsla(${hue}, 70%, 60%, 0.2)`
                              ]
                            }}
                            transition={{ 
                              duration: 2 + Math.random() * 3, 
                              repeat: Infinity,
                              repeatType: 'loop',
                              ease: "easeInOut"
                            }}
                          >
                            <motion.div 
                              className="absolute right-0 rounded-full"
                              style={{
                                width: 1.5 + Math.random(),
                                height: 1.5 + Math.random(),
                                background: `hsla(${hue}, 70%, 70%, 0.9)`
                              }}
                              animate={{ 
                                scale: [1, 1.8, 1],
                                boxShadow: [
                                  `0 0 2px hsla(${hue}, 70%, 70%, 0.4)`, 
                                  `0 0 5px hsla(${hue}, 70%, 70%, 0.8)`, 
                                  `0 0 2px hsla(${hue}, 70%, 70%, 0.4)`
                                ]
                              }}
                              transition={{ 
                                duration: 1.5 + Math.random(), 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                        );
                      })}
                      
                      {/* Cercles concentriques avec rotation douce */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          className="relative"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute w-44 h-44 rounded-full border border-blue-400/20 border-dashed" />
                        </motion.div>
                        
                        <motion.div
                          className="relative"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute w-52 h-52 rounded-full border border-cyan-400/15 border-dashed" />
                        </motion.div>
                        
                        <motion.div
                          className="relative"
                          animate={{ rotate: 180 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute w-60 h-60 rounded-full border border-emerald-400/10 border-dashed" />
                        </motion.div>
                        
                        {/* Centre actif - Nom de la plateforme */}
                        <motion.div 
                          className="relative flex items-center justify-center w-24 h-24"
                          animate={{ 
                            scale: [1, 1.05, 1.1, 1.05, 1],
                            boxShadow: [
                              '0 0 20px rgba(6, 182, 212, 0.3)', 
                              '0 0 30px rgba(6, 182, 212, 0.5)', 
                              '0 0 40px rgba(6, 182, 212, 0.7)', 
                              '0 0 30px rgba(6, 182, 212, 0.5)', 
                              '0 0 20px rgba(6, 182, 212, 0.3)'
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-cyan-500/90 via-blue-600/90 to-blue-700/90" />
                          
                          {/* Texte FYNE au centre */}
                          <motion.div
                            className="text-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <span className="text-white text-xl font-bold font-cyber-title tracking-wide relative z-10">
                              FYNE
                            </span>
                          </motion.div>
                        </motion.div>
                      </div>
                      
                      {/* Modules avec noms descriptifs qui gravitent */}
                      {[
                        { text: "CYBER", color: "bg-gradient-to-br from-blue-500/90 to-blue-600/90", delay: 0 },
                        { text: "DATA", color: "bg-gradient-to-br from-purple-500/90 to-purple-600/90", delay: 1 },
                        { text: "AMOA", color: "bg-gradient-to-br from-emerald-500/90 to-emerald-600/90", delay: 2 },
                        { text: "ARCADE", color: "bg-gradient-to-br from-amber-500/90 to-amber-600/90", delay: 3 }
                      ].map((item, index) => {
                        // Positions en orbite dynamique
                        return (
                          <motion.div
                            key={index}
                            className={`absolute flex items-center justify-center w-20 h-20 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden`}
                            style={{ 
                              background: item.color
                            }}
                            animate={{ 
                              x: [
                                Math.cos((index * Math.PI/2) + 0) * 100,
                                Math.cos((index * Math.PI/2) + 0.2) * 100,
                                Math.cos((index * Math.PI/2) + 0.4) * 100,
                                Math.cos((index * Math.PI/2) + 0.6) * 100,
                                Math.cos((index * Math.PI/2) + 0.8) * 100,
                                Math.cos((index * Math.PI/2) + 1.0) * 100,
                              ],
                              y: [
                                Math.sin((index * Math.PI/2) + 0) * 100,
                                Math.sin((index * Math.PI/2) + 0.2) * 100,
                                Math.sin((index * Math.PI/2) + 0.4) * 100,
                                Math.sin((index * Math.PI/2) + 0.6) * 100,
                                Math.sin((index * Math.PI/2) + 0.8) * 100,
                                Math.sin((index * Math.PI/2) + 1.0) * 100,
                              ],
                              boxShadow: [
                                '0 5px 15px rgba(0,0,0,0.2)', 
                                '0 10px 20px rgba(0,0,0,0.3)', 
                                '0 15px 25px rgba(0,0,0,0.4)',
                                '0 10px 20px rgba(0,0,0,0.3)',
                                '0 5px 15px rgba(0,0,0,0.2)'
                              ]
                            }}
                            transition={{ 
                              duration: 15,
                              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                              delay: item.delay,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {/* Effet d'aura autour du texte */}
                            <motion.div 
                              className="absolute inset-0 z-0"
                              animate={{ 
                                opacity: [0.5, 0.8, 0.5],
                                scale: [0.8, 1, 0.8]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <span className="text-white font-cyber-title font-bold text-sm tracking-widest">
                              {item.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Section Modules d'Excellence - Mise en avant */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-4">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 font-cyber-accent tracking-wide">
                  Découvrez nos solutions
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight font-cyber-title">
                Nos modules <span className="text-blue-600 relative">
                  d'excellence
                  <svg className="absolute bottom-0 left-0 w-full" height="5" viewBox="0 0 200 5" preserveAspectRatio="none">
                    <path d="M0 5 Q 40 0, 80 2 T 160 3 T 200 0 V 5 H 0 Z" fill="rgba(59, 130, 246, 0.3)" />
                  </svg>
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-cyber-body leading-relaxed">
                Une expérience d'apprentissage nouvelle génération, adaptée à vos besoins professionnels
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <ModuleCard {...module} />
              </motion.div>
            ))}
          </div>
          
          {/* Bouton "Explorer tous nos modules" supprimé */}
        </div>
      </div>
      
      {/* Section Caracteristiques */}
      <div className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-cyber-title tracking-wide">
                Une expérience d'apprentissage <span className="text-blue-600">inégalée</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-cyber-body">
                Notre technologie d'IA générative crée un environnement personnalisé qui s'adapte à vos besoins
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call-to-Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-cyber-title tracking-wide">
              Prêt à transformer votre parcours professionnel ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto font-cyber-body">
              Rejoignez plus de 1000 professionnels qui ont déjà révolutionné leur façon d'apprendre
            </p>
            
            {/* Bouton "Explorer les modules" supprimé */}
          </motion.div>
        </div>
      </div>
      
      {/* Section Statistiques avec effet de parallaxe */}
      <div className="bg-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-blue-600"></div>
          <div className="absolute right-0 top-1/3 w-60 h-60 rounded-full bg-indigo-600"></div>
          <div className="absolute left-1/3 bottom-0 w-40 h-40 rounded-full bg-purple-600"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "95%", label: "Satisfaction", icon: <Star size={24} className="text-amber-500" /> },
              { value: "78%", label: "Amélioration des compétences", icon: <Target size={24} className="text-emerald-500" /> },
              { value: "4.8/5", label: "Note moyenne", icon: <Award size={24} className="text-rose-500" /> },
              { value: "+1000", label: "Utilisateurs actifs", icon: <Users size={24} className="text-indigo-500" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
              >
                <div className="mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1 font-cyber-title">{stat.value}</div>
                <div className="text-gray-600 text-sm font-cyber-body">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section Footer - Ajout d'un footer professionnel */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-2">
                <BrainCircuit className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold font-cyber-title tracking-wide">FYNE</span>
              </div>
              <div className="mb-3 text-blue-400/80 italic text-sm font-cyber-accent tracking-wide">
                For Your Next Experience
              </div>
              <p className="text-gray-400 mb-4 font-cyber-body">
                Une plateforme d'apprentissage nouvelle génération alimentée par l'intelligence artificielle avancée
              </p>
              <div className="flex space-x-4">
                {/* Icônes médias sociaux */}
                {[
                  { name: 'LinkedIn', icon: 'L' },
                  { name: 'Twitter', icon: 'T' },
                  { name: 'Instagram', icon: 'I' },
                  { name: 'YouTube', icon: 'Y' }
                ].map(social => (
                  <a key={social.name} href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Liens rapides */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300 font-cyber-accent">Modules</h3>
              <ul className="space-y-2">
                {['I AM CYBER', 'CYBER DEFENSE', 'I AM DATA & IA', 'I AM AMOA', 'Personnalisé'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300 font-cyber-accent">Support</h3>
              <ul className="space-y-2">
                {['Documentation', 'FAQ', 'Communauté', 'Tutoriels', 'Contact'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300 font-cyber-accent">Restez informé</h3>
              <p className="text-gray-400 mb-4 font-cyber-body">
                Recevez les dernières mises à jour sur nos modules et fonctionnalités
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Barre de séparation */}
          <div className="border-t border-gray-800 pt-8 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0 font-cyber-body">
                © {new Date().getFullYear()} FYNE. Tous droits réservés.
              </p>
              <div className="flex space-x-6">
                {['Conditions d\'utilisation', 'Politique de confidentialité', 'Cookies'].map(item => (
                  <a key={item} href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors font-cyber-body">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Suppression de la bannière flottante */}
    </HomeLayout>
  );
}