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
import fyneCityBackgroundPath from "../assets/fyne_city_background.png";
import fyneSpaceViewPath from "../assets/fyne_space_view.png";
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
  
  // Extraction de l'ID de couleur pour les animations
  const colorClass = color.split(' ')[0]; // Prend la première classe (ex: bg-blue-600 -> bg-blue)
  const baseColor = colorClass.includes('blue') ? 'blue' : 
                    colorClass.includes('purple') ? 'purple' : 
                    colorClass.includes('indigo') ? 'indigo' : 'blue';
  
  return (
    <div
      className="relative overflow-hidden h-full flex flex-col"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Fond avec effets futuristes */}
      <div className={`absolute inset-x-0 -top-2 h-2 bg-gradient-to-r from-${baseColor}-500 to-${baseColor}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-md opacity-60`}></div>
      
      <div className="p-6 flex flex-col h-full z-10 relative">
        {/* Icône avec animation futuriste */}
        <div className={`w-16 h-16 relative mb-6`}>
          {/* Cercle animé derrière l'icône */}
          <div className={`absolute inset-0 rounded-full ${color} opacity-20 transform group-hover:scale-110 transition-transform duration-500`}></div>
          
          {/* Icône au centre avec effet de lueur */}
          <div className={`relative w-14 h-14 ${color} rounded-lg flex items-center justify-center 
            shadow-lg group-hover:shadow-${baseColor}-300/30 transition-all duration-300
            backdrop-blur-sm border border-${baseColor}-100 dark:border-${baseColor}-900/30`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-${baseColor}-500/10 to-${baseColor}-600/10 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`}></div>
            {icon}
          </div>
          
          {/* Points décoratifs d'arrière-plan */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-70 transition-opacity duration-500 delay-100"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 opacity-0 group-hover:opacity-70 transition-opacity duration-500 delay-150"></div>
        </div>
        
        {/* Titre avec animation */}
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white font-cyber-title tracking-wide group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description avec légère animation */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow font-cyber-body text-sm">
          {description}
        </p>
        
        {/* Bouton avec animation améliorée */}
        <div className="mt-auto">
          <Link href={linkTo}>
            <Button 
              className={`${color} hover:${color}/90 group transition-all duration-300 
                shadow-md hover:shadow-${baseColor}-500/20 
                border border-${baseColor}-400/20 dark:border-${baseColor}-400/10`}
            >
              <span className="relative z-10">Explorer le module</span>
              <ArrowRight className={`ml-2 transition-all duration-300 
                ${isHover ? 'translate-x-1' : ''}`} />
              
              {/* Effet de pulse sur hover */}
              <span className={`absolute inset-0 bg-gradient-to-r from-${baseColor}-600 to-${baseColor}-500 
                opacity-0 group-hover:opacity-100 rounded transition-opacity duration-300`}></span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
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
      {/* Hero Section avec image de fond futuriste */}
      <div className="relative overflow-hidden h-screen w-screen">
        {/* Image de fond de l'espace avec vue de vaisseau */}
        <div className="absolute inset-0 z-0">
          <img 
            src={fyneSpaceViewPath} 
            alt="Vue spatiale FYNE" 
            className="w-full h-full object-cover brightness-95"
            style={{ objectPosition: "center" }}
          />
          {/* Overlay pour améliorer la lisibilité du texte - Opacité réduite */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-blue-950/10 to-transparent"></div>
        </div>
        
        {/* Effet de particules numériques */}
        <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1px] h-[1px] bg-blue-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                boxShadow: '0 0 4px 1px rgba(59, 130, 246, 0.7)'
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
        
        {/* Lignes numériques animées */}
        <div className="absolute inset-0 z-[1] opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Contenu principal */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-28 relative z-10 h-full flex items-center">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Contenu texte - Déplacé plus à gauche pour ne pas masquer le personnage */}
            <div className="text-center lg:text-left lg:w-2/5 mx-auto lg:ml-12 lg:mr-0 mb-12 lg:mb-0">
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
              
              {/* Bouton d'action avec effet futuriste */}
              <motion.div
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Link href="/cyber">
                  <Button size="lg" className="relative px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg group font-cyber-accent text-lg border border-blue-400/20 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent w-0 group-hover:w-full transition-all duration-700 ease-out" />
                    <span className="relative z-10">Démarrer une expérience</span>
                    <ArrowRight className="relative z-10 ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            {/* Le panneau d'information a été retiré */}
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
          
          {/* Grille de modules avec style professionnel futuriste */}
          <div className="relative z-10 my-12">
            {/* Fond décoratif avec motif futuriste */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/5 to-blue-900/5 rounded-3xl overflow-hidden -z-10">
              <div className="absolute inset-0 opacity-10" 
                   style={{ 
                     backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 25%)',
                     backgroundSize: '120px 120px',
                     backgroundRepeat: 'repeat'
                   }}>
              </div>
              {/* Bordure lumineuse */}
              <div className="absolute inset-0 border border-blue-500/20 rounded-3xl"></div>
            </div>
            
            {/* Grille principale */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="transform hover:scale-105 hover:z-20 transition-all duration-300 group"
                >
                  {/* Wrapper avec effets futuristes */}
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden group-hover:shadow-blue-500/20 border border-blue-100 dark:border-blue-900/30">
                    {/* Effet de lueur sur hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 transition-opacity duration-300"></div>
                    {/* Le module */}
                    <ModuleCard {...module} />
                    {/* Accent line */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>
                </motion.div>
              ))}
            </div>
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