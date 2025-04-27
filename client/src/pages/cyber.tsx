import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BrainCircuit, 
  BookOpenCheck, 
  GamepadIcon, 
  UserCheck, 
  Medal,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import CyberLayout from "@/components/layout/CyberLayout";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// Composant carte de module Cyber
const ModuleCard = ({ 
  title, 
  description, 
  icon, 
  comingSoon = false,
  path, 
  color = "from-blue-900/40 to-indigo-900/40 border-blue-700/30",
  badgeText,
  onClick 
}) => {
  const [, setLocation] = useLocation();
  const { themeMode } = useTheme();
  
  const handleClick = () => {
    if (comingSoon) return;
    if (onClick) {
      onClick();
    } else if (path) {
      setLocation(path);
    }
  };
  
  // Appliquer des styles différents en fonction du thème
  const cardClasses = themeMode === 'futuristic'
    ? `overflow-hidden relative bg-gradient-to-br ${color} border hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm`
    : `overflow-hidden relative bg-white shadow-md hover:shadow-lg transition-all duration-300`;
    
  const textClasses = themeMode === 'futuristic' 
    ? 'text-white' 
    : 'text-gray-900';
    
  const descriptionClasses = themeMode === 'futuristic'
    ? 'text-blue-100'
    : 'text-gray-600';
    
  const iconContainerClasses = themeMode === 'futuristic'
    ? 'bg-blue-900/50 text-cyan-300'
    : 'bg-blue-100 text-blue-600';
  
  return (
    <Card 
      className={`${cardClasses} ${comingSoon ? 'opacity-70 grayscale cursor-not-allowed' : 'cursor-pointer'} h-full`}
      onClick={handleClick}
    >
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-md ${iconContainerClasses}`}>
            {icon}
          </div>
          
          {badgeText && (
            <Badge className="bg-blue-600 text-white border-0">
              {badgeText}
            </Badge>
          )}
        </div>
        
        <h3 className={`text-xl font-bold mb-2 ${textClasses}`}>{title}</h3>
        <p className={`text-sm mb-4 flex-grow ${descriptionClasses}`}>{description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          {comingSoon ? (
            <span className="text-xs text-gray-400">Bientôt disponible</span>
          ) : (
            <Button 
              variant={themeMode === 'futuristic' ? "ghost" : "outline"} 
              className={themeMode === 'futuristic' ? "text-cyan-300 hover:text-white hover:bg-blue-900/50" : ""}
              size="sm"
            >
              Accéder
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CyberPage() {
  const [, setLocation] = useLocation();
  const { setUserName } = useChatContext();
  const { themeMode } = useTheme();
  
  // Définir l'arrière-plan en fonction du thème
  const bgClasses = themeMode === 'futuristic' 
    ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900' 
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
    
  const textClasses = themeMode === 'futuristic' ? 'text-white' : 'text-gray-900';
  
  // Gestion du clic sur les cartes
  const handleModuleClick = (path, userName = "") => {
    if (userName) {
      setUserName(userName);
    }
    setLocation(path);
  };

  return (
    <CyberLayout>
      <div className={`min-h-screen ${bgClasses} ${textClasses} pb-16`}>
        <div className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className={`${themeMode === 'futuristic' ? 'text-blue-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setLocation('/modules')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
          
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-blue-600 text-white border-0 mb-4">
              Module de formation
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">I AM CYBER</h1>
            <p className={`text-xl ${themeMode === 'futuristic' ? 'text-blue-200' : 'text-gray-600'} max-w-3xl`}>
              Développez vos compétences en cybersécurité à travers des parcours interactifs guidés par l'IA. Choisissez parmi nos différentes catégories de formation.
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Scénarios de formation */}
            <motion.div variants={itemVariants}>
              <ModuleCard
                title="Scénarios de formation"
                description="Participez à des simulations d'incidents cybersécurité avec des objectifs progressifs et des PNJs experts. Idéal pour se former aux situations de crise."
                icon={<BookOpenCheck className="h-6 w-6" />}
                path="/cyber-defense-new"
                badgeText="CENTRE DE CRISE"
                onClick={() => handleModuleClick('/cyber-defense-new')}
              />
            </motion.div>
            
            {/* Gamification avancée */}
            <motion.div variants={itemVariants}>
              <ModuleCard
                title="Gamification avancée"
                description="Mettez en pratique vos compétences à travers des défis ludiques et des missions d'investigation. Résolvez des énigmes techniques en situation réelle."
                icon={<GamepadIcon className="h-6 w-6" />}
                path="/cyber/arcade"
                badgeText="CYBER ARCADE"
                color="from-indigo-900/40 to-blue-900/40 border-indigo-700/30"
                onClick={() => handleModuleClick('/cyber/arcade')}
              />
            </motion.div>
            
            {/* Agent conversationnel */}
            <motion.div variants={itemVariants}>
              <ModuleCard
                title="Mise en situation d'audition"
                description="Entraînez-vous à réaliser des auditions client dans le cadre de missions RSSI. Améliorez vos compétences en communication technique et en analyse des besoins."
                icon={<UserCheck className="h-6 w-6" />}
                path="/cyber"
                badgeText="AGENT CONVERSATIONNEL"
                color="from-emerald-900/40 to-blue-900/40 border-emerald-700/30"
                onClick={() => handleModuleClick('/cyber/agent')}
              />
            </motion.div>
            
            {/* Programme de certification */}
            <motion.div variants={itemVariants}>
              <ModuleCard
                title="Parcours certifiant"
                description="Suivez un parcours de certification complet avec des niveaux progressifs, des examens et des badges de compétence pour valoriser votre expertise."
                icon={<Medal className="h-6 w-6" />}
                path="/cyber-ascension"
                badgeText="PARCOURS CERTIFIANT"
                color="from-amber-900/40 to-red-900/40 border-amber-700/30"
                comingSoon={false}
                onClick={() => handleModuleClick('/cyber-ascension')}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </CyberLayout>
  );
}