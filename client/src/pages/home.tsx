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
import Typewriter from "../components/Typewriter";
import mcLogoPath from "@assets/mc2i.png";
import fyneAvatarPath from "@assets/image_1745520990954.png";
import cybercityBgPath from "@assets/image_1745526637057.png";
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
      title: "IAM mc2i",
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
      {/* Hero Section - Fond amélioré */}
      <div className="relative overflow-hidden">
        {/* Arrière-plan futuriste avec l'image de ville cyber */}
        <div className="absolute inset-0">
          {/* Image de fond */}
          <img 
            src={cybercityBgPath} 
            alt="Ville futuriste" 
            className="object-cover w-full h-full opacity-90" 
          />
          
          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black bg-opacity-40 mix-blend-overlay"></div>
          
          {/* Ajout d'un gradient pour renforcer l'effet futuriste */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-gray-900/10"></div>
        </div>
        
        {/* Éléments décoratifs animés pour un effet high-tech - conservés pour l'animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500/5"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 8 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32 relative z-10">
          {/* Réorganisation du layout pour inverser l'ordre - Robot à gauche, texte à droite */}
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Image FYNE - Placée en premier pour être à gauche sur Desktop */}
            <motion.div 
              className="lg:w-2/5 flex justify-center lg:justify-start order-2 lg:order-1 mt-12 lg:mt-0"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-72 h-72 md:w-96 md:h-96 relative overflow-visible">
                {/* Positionnement du robot pour qu'il regarde vers la ville futuriste */}
                <img 
                  src={fyneAvatarPath} 
                  alt="FYNE by mc2i" 
                  className="object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] transform scale-x-[-1]" 
                />
                {/* Cercle décoratif derrière l'image avec effet lumineux plus prononcé */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 rounded-full bg-blue-700/20 blur-xl -z-10"></div>
                
                {/* Effet de lignes connectées depuis le robot vers la ville futuriste */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-1 bg-gradient-to-r from-blue-400/70 to-transparent rounded-full"
                      style={{
                        width: `${120 + i * 30}px`,
                        top: `${30 + i * 20}%`,
                        left: '70%',
                        transformOrigin: 'left center',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: [0, 0.7, 0.5] }}
                      transition={{
                        duration: 1.5,
                        delay: 1 + i * 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Contenu texte - Placé en second pour être à droite sur Desktop */}
            <div className="text-center lg:text-left lg:w-3/5 mx-auto lg:mx-0 mb-12 lg:mb-0 order-1 lg:order-2">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-600/40 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
                <Sparkles className="mr-2 h-4 w-4" />
                Propulsé par l'Intelligence Artificielle
              </div>
              
              {/* Animation du slogan FYNE placée avant le titre principal */}
              <motion.div
                className="mb-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Simple affichage du slogan */}
                <div className="h-14 text-white text-3xl font-cyber-title flex items-center lg:justify-start justify-center">
                  <span>
                    <span className="text-cyan-300">F</span>or 
                    <span className="text-cyan-300"> Y</span>our 
                    <span className="text-cyan-300"> N</span>ext 
                    <span className="text-cyan-300"> E</span>xperience
                  </span>
                </div>
                
                {/* Ligne décorative en dessous */}
                <motion.div 
                  className="absolute -bottom-1 lg:left-32 left-1/2 transform lg:-translate-x-0 -translate-x-1/2 w-64 h-[2px]"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                </motion.div>
              </motion.div>

              <motion.h1 
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-cyber-title tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Améliorez<br className="xs:hidden" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"> votre expertise  </span><br className="xs:hidden" />
                avec FYNE
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-blue-100 mb-10 mx-auto lg:mx-0 lg:max-w-xl font-cyber-body tracking-wide leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Découvrez une nouvelle dimension d'apprentissage interactif grâce à nos modules IA innovants qui s'adaptent parfaitement à votre progression.
              </motion.p>
            </div>
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
                Une expérience d'apprentissage nouvelle génération, adaptée à vos besoins
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
              Prêt à transformer votre parcours ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto font-cyber-body">
              Rejoignez plus de 1000 professionnels qui ont déjà révolutionné leur façon d'apprendre
            </p>
            
            {/* Bouton "Explorer les modules" supprimé */}
          </motion.div>
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
              {/* Bloc social media supprimé à la demande de l'utilisateur */}
            </div>
            
            {/* Liens rapides */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300 font-cyber-accent">Modules</h3>
              <ul className="space-y-2">
                {['I AM CYBER', 'CENTRE DE CRISE ÉVOLUTIF', 'I AM DATA & IA', 'IAM mc2i', 'Personnalisé'].map(link => (
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