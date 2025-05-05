import React from 'react';
import { Link } from 'wouter';
import { GraduationCap, MessagesSquare, BrainCircuit, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/utils/PageTitle';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isComingSoon?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, href, isComingSoon }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${
        isFuturistic 
          ? 'bg-gradient-to-b from-violet-950/90 to-indigo-950/90 border border-violet-500/30 text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      } h-full shadow-md`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fond galaxie pour le mode futuriste */}
      {isFuturistic && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-0 right-0 w-full h-full mix-blend-screen">
            <div className="absolute top-10 right-10 w-40 h-40 bg-violet-500/10 rounded-full filter blur-xl opacity-40"></div>
            <div className="absolute bottom-5 left-5 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-xl opacity-30"></div>
          </div>
          
          {/* Petites étoiles scintillantes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.max(1, Math.random() * 2)}px`,
                height: `${Math.max(1, Math.random() * 2)}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${1 + Math.random() * 3}s infinite ease-in-out ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      

      
      {/* Badge "Bientôt disponible" si applicable */}
      {isComingSoon && (
        <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full ${
          isFuturistic 
            ? 'bg-gray-700/70 text-gray-100 border border-gray-500/50' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        } font-medium z-10`}>
          Bientôt disponible
        </div>
      )}
      
      <div className="p-6 flex flex-col h-full z-10 relative">
        {/* Icône */}
        <div className={`p-3 ${
          isFuturistic 
            ? 'bg-gradient-to-br from-violet-900/80 to-indigo-900/80 text-violet-300 border border-violet-500/40 shadow-md' 
            : 'bg-violet-100 text-violet-600 border border-violet-200'
          } rounded-xl w-fit mb-4`}>
          {icon}
        </div>
        
        {/* Titre */}
        <h3 className={`text-xl font-semibold mb-3 ${
          isFuturistic 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300 font-cyber-title' 
            : 'text-violet-800'
        }`}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={`text-sm mb-6 ${
          isFuturistic ? 'text-indigo-100/80' : 'text-gray-600'
        } flex-grow`}>
          {description}
        </p>
        
        {/* Bouton */}
        <div className="mt-auto">
          <Link href={href}>
            <Button 
              className={`w-full ${
                isComingSoon 
                  ? isFuturistic 
                    ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 cursor-not-allowed' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-not-allowed'
                  : isFuturistic 
                    ? 'bg-gradient-to-r from-violet-800/90 to-indigo-800/90 hover:from-violet-700/90 hover:to-indigo-700/90 text-white shadow-md border border-violet-500/30' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
              } relative overflow-hidden group transition-all duration-300`}
              disabled={isComingSoon}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isComingSoon ? 'Bientôt disponible' : 'Accéder à l\'outil'}
                {!isComingSoon && (
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </span>
              
              {/* Effet de survol futuriste */}
              {isFuturistic && !isComingSoon && (
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-indigo-600/40 via-violet-600/40 to-transparent group-hover:w-full transition-all duration-700 ease-out"></span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function OutilsIAPage() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  const tools = [
    {
      title: 'mc2i AI Learning',
      description: 'Chatbot spécialisé en gestion de projet et AMOA qui fournit des exemples concrets, recommande des outils et propose des mini-jeux interactifs pour un apprentissage ludique.',
      icon: <MessagesSquare className="h-6 w-6" />,
      href: '/outils-ia/mc2i-learning'
    },
    {
      title: 'Assistant IA Personnalisé',
      description: 'Créez votre propre assistant IA adapté à vos besoins spécifiques grâce à nos modèles d\'IA avancés. Personnalisez-le pour répondre à vos questions professionnelles.',
      icon: <BrainCircuit className="h-6 w-6" />,
      href: '/outils-ia/assistant'
    },
    {
      title: 'Générateur de Code',
      description: 'Transformez vos idées en code fonctionnel grâce à notre générateur basé sur l\'IA. Spécifiez vos besoins et obtenez du code dans plusieurs langages de programmation.',
      icon: <Code className="h-6 w-6" />,
      href: '/outils-ia/code-generator'
    },
  ];
  
  return (
    <Layout>
      <PageTitle title="Outils IA" />
      
      {/* Hero section */}
      <div className={`w-full ${isFuturistic ? 'bg-gradient-to-b from-violet-950 to-indigo-950' : 'bg-violet-50'} py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        {/* Effets visuels futuristes */}
        {isFuturistic && (
          <>
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute top-0 right-0 w-full h-full mix-blend-screen">
                <div className="absolute top-40 right-40 w-80 h-80 bg-violet-500/20 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
              </div>
              
              {/* Grille numérique */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
          </>
        )}
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${
                isFuturistic 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300 font-cyber-title tracking-wide' 
                  : 'text-violet-900'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Outils d'Intelligence Artificielle
            </motion.h1>
            
            <motion.p 
              className={`text-xl max-w-2xl mx-auto mb-8 ${
                isFuturistic ? 'text-indigo-100' : 'text-violet-700'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Découvrez notre collection d'outils IA conçus pour améliorer votre productivité et faciliter votre apprentissage dans différents domaines
            </motion.p>
          </div>
        </div>
      </div>
      
      {/* Liste des outils */}
      <div className={`w-full ${isFuturistic ? 'bg-gray-900' : 'bg-white'} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {tools.map((tool, index) => (
              <ToolCard
                key={index}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                isComingSoon={false}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}