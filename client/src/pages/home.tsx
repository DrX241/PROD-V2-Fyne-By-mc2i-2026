import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import HomeLayout from "@/components/layout/HomeLayout";
import { 
  ShieldCheck, Database, ListChecks, Plus, ArrowRight, 
  BrainCircuit, Bot, Sparkles, Star, BookOpen, Zap, 
  Users, Award, Brain, Laptop, Package, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { motion } from "framer-motion";
import mcLogoPath from "@assets/mc2i.png";

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
      description: "Immergez-vous dans des scénarios de cybersécurité interactifs guidés par l'IA pour développer vos compétences face aux menaces numériques réelles.",
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      color: "bg-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      accentColor: "bg-blue-500",
      linkTo: "/cyber-onboarding-chat"
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
              
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Transformez votre 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"> expertise professionnelle</span> avec FYNE
              </motion.h1>
              
              <motion.p 
                className="text-xl text-blue-100 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Découvrez une nouvelle dimension d'apprentissage interactif grâce à nos modules IA innovants qui s'adaptent parfaitement à votre progression.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Link href="/modules">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg border-0"
                  >
                    Explorer les modules
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  En savoir plus
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap items-center gap-y-3 gap-x-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <span className="text-blue-200">Utilisé par :</span>
                <img src={mcLogoPath} alt="mc2i" className="h-8" />
                <div className="flex items-center -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium border-2 border-indigo-900">
                      {i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-medium border-2 border-indigo-900 ml-1">
                    +50
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Illustration héro */}
            <motion.div 
              className="relative aspect-square max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/30 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-300/40 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-16 h-16 lg:w-20 lg:h-20 text-blue-100" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Section Modules */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Nos modules <span className="text-blue-600">d'excellence</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              >
                <ModuleCard {...module} />
              </motion.div>
            ))}
          </div>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Une expérience d'apprentissage <span className="text-blue-600">inégalée</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Prêt à transformer votre parcours professionnel ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Rejoignez plus de 1000 professionnels qui ont déjà révolutionné leur façon d'apprendre
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/modules">
                <Button 
                  size="lg" 
                  className="bg-white hover:bg-gray-100 text-blue-700"
                >
                  Explorer les modules
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/40 text-white hover:bg-white/20"
              >
                Demander une démo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Section Statistiques */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "95%", label: "Satisfaction", icon: <Star size={24} className="text-amber-500" /> },
              { value: "78%", label: "Amélioration des compétences", icon: <Target size={24} className="text-emerald-500" /> },
              { value: "4.8/5", label: "Note moyenne", icon: <Award size={24} className="text-rose-500" /> },
              { value: "+1000", label: "Utilisateurs actifs", icon: <Users size={24} className="text-indigo-500" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}
              >
                <div className="mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}